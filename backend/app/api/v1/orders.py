from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import os
import uuid
import mercadopago
import logging
from app.core.security import require_admin, get_current_user
from app.core.database import get_database

router = APIRouter()
logger = logging.getLogger("barbearia")

# ====================== FUNÇÕES AUXILIARES ======================
def serialize_mongo_doc(doc):
    """Converte documento MongoDB para JSON serializável"""
    if doc is None:
        return None
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ====================== MODELOS ======================
class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[OrderItem]
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|paid|processing|shipped|delivered|cancelled)$")

class OrderResponse(BaseModel):
    order_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[dict]
    total: float
    status: str
    payment_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# ====================== ROTAS PÚBLICAS ======================
@router.post("/orders", response_model=OrderResponse, tags=["Orders"])
async def create_order(order: OrderCreate):
    """Cria um novo pedido com integração ao Mercado Pago"""
    db = get_database()
    order_id = f"ord_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    # Calcula total e valida produtos
    total = 0
    items_with_price = []
    
    for item in order.items:
        product = await db.products.find_one({"product_id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")
        if product.get("stock", 0) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {product['name']}")
        
        item_total = product["price"] * item.quantity
        total += item_total
        
        items_with_price.append({
            "product_id": item.product_id,
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
            "subtotal": item_total
        })
    
    order_doc = {
        "order_id": order_id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "items": items_with_price,
        "total": total,
        "status": "pending",
        "notes": order.notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.orders.insert_one(order_doc)
    logger.info(f"✅ Novo pedido criado: {order_id}")
    
    # ====================== MERCADO PAGO ======================
    try:
        sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))
        
        preference_data = {
            "items": [{
                "title": f"Pedido #{order_id}",
                "quantity": 1,
                "unit_price": float(total),
                "currency_id": "BRL"
            }],
            "payer": {
                "name": order.customer_name,
                "email": order.customer_email,
                "phone": {"number": order.customer_phone}
            },
            "back_urls": {
                "success": f"https://barber0.onrender.com/payment/success?ref={order_id}",
                "failure": f"https://barber0.onrender.com/payment/failure?ref={order_id}",
                "pending": f"https://barber0.onrender.com/payment/pending?ref={order_id}"
            },
            "auto_return": "approved",
            "external_reference": order_id,
            "notification_url": "https://barber0.onrender.com/api/v1/orders/webhook"
        }
        
        preference_response = sdk.preference().create(preference_data)
        payment_url = preference_response["response"]["init_point"]
        
        # Atualiza o pedido com a URL de pagamento
        await db.orders.update_one(
            {"order_id": order_id},
            {"$set": {"payment_url": payment_url}}
        )
        
        order_doc["payment_url"] = payment_url
        
    except Exception as e:
        logger.error(f"Erro ao criar preferência Mercado Pago: {e}")
        # Continua mesmo sem pagamento (modo desenvolvimento)
        order_doc["payment_url"] = f"https://barber0.onrender.com/payment/success?ref={order_id}"
    
    return serialize_mongo_doc(order_doc)

@router.get("/orders/{order_id}", response_model=OrderResponse, tags=["Orders"])
async def get_order(order_id: str):
    """Busca um pedido específico"""
    db = get_database()
    order = await db.orders.find_one({"order_id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    return serialize_mongo_doc(order)

# ====================== ROTAS ADMIN ======================
@router.get("/admin/orders", tags=["Admin"])
async def list_all_orders(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """Lista todos os pedidos (admin)"""
    db = get_database()
    query = {"status": status} if status else {}
    
    cursor = db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)
    
    return [serialize_mongo_doc(o) for o in orders]

@router.patch("/admin/orders/{order_id}/status", tags=["Admin"])
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: dict = Depends(require_admin)
):
    """Atualiza o status de um pedido (admin)"""
    db = get_database()
    
    result = await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": status_update.status,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    logger.info(f"✅ Status do pedido {order_id} atualizado para: {status_update.status}")
    
    updated_order = await db.orders.find_one({"order_id": order_id})
    return serialize_mongo_doc(updated_order)

@router.post("/orders/webhook", tags=["Orders"])
async def mercadopago_webhook(data: dict):
    """Webhook do Mercado Pago para atualizar status do pagamento"""
    try:
        if data.get("type") == "payment":
            payment_id = data.get("data", {}).get("id")
            
            # Aqui você pode adicionar lógica para atualizar o status do pedido
            # quando o pagamento for aprovado
            
            logger.info(f"Webhook Mercado Pago recebido: {payment_id}")
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Erro no webhook: {e}")
        return {"status": "error"}
