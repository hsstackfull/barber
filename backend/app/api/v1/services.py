from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
from app.core.security import get_current_user, require_admin
from app.core.database import get_database

router = APIRouter()

class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    duration_minutes: int = Field(..., gt=0, le=180)
    price: float = Field(..., gt=0)
    is_active: bool = True

class ServiceResponse(BaseModel):
    service_id: str
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool
    created_at: datetime

# ========================= ROTAS =========================

@router.post("/services", response_model=ServiceResponse, tags=["Services"])
async def create_service(
    service: ServiceCreate,
    current_user: dict = Depends(require_admin)  # Só admin pode criar
):
    db = get_database()
    
    service_id = f"serv_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    service_doc = {
        "service_id": service_id,
        "name": service.name.strip(),
        "description": service.description,
        "duration_minutes": service.duration_minutes,
        "price": service.price,
        "is_active": service.is_active,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.services.insert_one(service_doc)
    return {**service_doc}


@router.get("/services", tags=["Services"])
async def list_services(
    active_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    db = get_database()
    query = {"is_active": True} if active_only else {}
    
    cursor = db.services.find(query).skip(skip).limit(limit)
    services = await cursor.to_list(length=limit)
    return services


@router.get("/services/{service_id}", tags=["Services"])
async def get_service(service_id: str):
    db = get_database()
    service = await db.services.find_one({"service_id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return service


@router.put("/services/{service_id}", tags=["Services"])
async def update_service(
    service_id: str,
    service: ServiceCreate,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    result = await db.services.update_one(
        {"service_id": service_id},
        {"$set": {
            "name": service.name.strip(),
            "description": service.description,
            "duration_minutes": service.duration_minutes,
            "price": service.price,
            "is_active": service.is_active,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"message": "Serviço atualizado com sucesso"}


@router.delete("/services/{service_id}", tags=["Services"])
async def delete_service(
    service_id: str,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    result = await db.services.delete_one({"service_id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"message": "Serviço deletado com sucesso"}
