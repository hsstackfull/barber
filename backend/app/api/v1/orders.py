import os
import mercadopago

@router.post("/orders", response_model=OrderResponse, tags=["Orders"])
async def create_order(order: OrderCreate):
    db = get_database()
    order_id = f"ord_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    # Calcula o total e prepara itens
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
    
    # ====================== MERCADO PAGO ======================
    sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))
    
    preference_data = {
        "items": [
            {
                "title": f"Pedido {order_id}",
                "quantity": 1,
                "unit_price": float(total),
                "currency_id": "BRL"
            }
        ],
        "payer": {
            "name": order.customer_name,
            "email": order.customer_email
        },
        "back_urls": {
            "success": "https://barber0.onrender.com/payment/success",
            "failure": "https://barber0.onrender.com/payment/failure",
            "pending": "https://barber0.onrender.com/payment/pending"
        },
        "auto_return": "approved",
        "external_reference": order_id
    }
    
    preference_response = sdk.preference().create(preference_data)
    payment_url = preference_response["response"]["init_point"]
    
    return {
        **order_doc,
        "payment_url": payment_url
    }
