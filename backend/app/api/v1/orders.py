from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
from app.core.security import require_admin
from app.core.database import get_database

router = APIRouter()

class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[OrderItem]

class OrderResponse(BaseModel):
    order_id: str
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[dict]
    total: float
    status: str = "pending"
    created_at: datetime

@router.post("/orders", response_model=OrderResponse, tags=["Orders"])
async def create_order(order: OrderCreate):
    db = get_database()
    import uuid
    order_id = f"ord_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    # Calcula o total
    total = 0
    items_with_price = []
    
    for item in order.items:
        product = await db.products.find_one({"product_id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")
        
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
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.orders.insert_one(order_doc)
    return order_doc

@router.get("/orders", tags=["Orders"])
async def list_orders(status: Optional[str] = None):
    db = get_database()
    query = {"status": status} if status else {}
    
    cursor = db.orders.find(query).sort("created_at", -1)
    orders = await cursor.to_list(length=50)
    
    return [serialize_mongo_doc(o) for o in orders]

def serialize_mongo_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc
