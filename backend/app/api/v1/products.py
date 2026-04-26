from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
from app.core.security import get_current_user, require_admin
from app.core.database import get_database
from bson import ObjectId

router = APIRouter()

# ====================== FUNÇÕES AUXILIARES ======================
def serialize_mongo_doc(doc):
    """Converte documento MongoDB para JSON serializável"""
    if doc is None:
        return None
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ====================== MODELOS ======================
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    active: bool = True  # ← Mudado para "active" (compatível com o banco)

class ProductResponse(BaseModel):
    product_id: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    active: bool
    created_at: datetime

# ====================== ROTAS ======================
@router.post("/products", response_model=ProductResponse, tags=["Products"])
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    product_id = f"prod_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    product_doc = {
        "product_id": product_id,
        "name": product.name.strip(),
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "active": product.active,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.products.insert_one(product_doc)
    return serialize_mongo_doc(product_doc)


@router.get("/products", tags=["Products"])
async def list_products(
    active_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    db = get_database()
    query = {"active": True} if active_only else {}
    
    cursor = db.products.find(query).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Converte todos os documentos (resolve o erro do ObjectId)
    products = [serialize_mongo_doc(p) for p in products]
    
    return products


@router.get("/products/{product_id}", tags=["Products"])
async def get_product(product_id: str):
    db = get_database()
    product = await db.products.find_one({"product_id": product_id})
    
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    return serialize_mongo_doc(product)


@router.put("/products/{product_id}", response_model=ProductResponse, tags=["Products"])
async def update_product(
    product_id: str,
    product_update: ProductCreate,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    
    update_data = {
        "name": product_update.name.strip(),
        "description": product_update.description,
        "price": product_update.price,
        "stock": product_update.stock,
        "active": product_update.active,
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    updated_product = await db.products.find_one({"product_id": product_id})
    return serialize_mongo_doc(updated_product)


@router.delete("/products/{product_id}", tags=["Products"])
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    
    result = await db.products.delete_one({"product_id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    return {"message": "Produto deletado com sucesso"}
    
@router.get("/products/categories", tags=["Products"])
async def get_categories():
    db = get_database()
    categories = await db.products.distinct("category")
    return {"categories": categories}
