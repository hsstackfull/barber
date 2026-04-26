from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
from app.core.security import get_current_user, require_admin
from app.core.database import get_database

router = APIRouter()

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    is_active: bool = True

class ProductResponse(BaseModel):
    product_id: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    is_active: bool
    created_at: datetime

# ========================= ROTAS =========================

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
        "is_active": product.is_active,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.products.insert_one(product_doc)
    return {**product_doc}


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
    return products


@router.get("/products/{product_id}", tags=["Products"])
async def get_product(product_id: str):
    db = get_database()
    product = await db.products.find_one({"product_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product
