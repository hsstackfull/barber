from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel, Field
from datetime import datetime, timezone, time
from typing import List, Optional
from app.core.security import require_admin
from app.core.database import get_database

router = APIRouter()

# ====================== BUSINESS HOURS ======================
class BusinessHours(BaseModel):
    day_of_week: int  # 0=Segunda, 6=Domingo
    open_time: str   # "09:00"
    close_time: str  # "19:00"
    is_open: bool = True

class BusinessHoursConfig(BaseModel):
    hours: List[BusinessHours] = Field(default_factory=list)

# ====================== DASHBOARD ======================
@router.get("/admin/dashboard", tags=["Admin"])
async def admin_dashboard(current_user: dict = Depends(require_admin)):
    db = get_database()
    
    stats = {
        "total_users": await db.users.count_documents({}),
        "total_appointments": await db.appointments.count_documents({}),
        "pending_appointments": await db.appointments.count_documents({"status": "pending"}),
        "confirmed_appointments": await db.appointments.count_documents({"status": "confirmed"}),
        "cancelled_appointments": await db.appointments.count_documents({"status": "cancelled"}),
        "total_services": await db.services.count_documents({}),
        "total_products": await db.products.count_documents({}),
        "low_stock_products": await db.products.count_documents({"stock": {"$lt": 5}}),
    }
    
    return {
        **stats,
        "message": "Dashboard Admin carregado com sucesso",
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

# ====================== BUSINESS HOURS MANAGEMENT ======================
@router.get("/admin/business-hours", tags=["Admin"])
async def get_business_hours(current_user: dict = Depends(require_admin)):
    db = get_database()
    config = await db.business_hours.find_one({"_id": "default"})
    return config["hours"] if config else []

@router.post("/admin/business-hours", tags=["Admin"])
async def set_business_hours(
    hours: List[BusinessHours],
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    await db.business_hours.update_one(
        {"_id": "default"},
        {"$set": {"hours": [h.model_dump() for h in hours], "updated_at": datetime.now(timezone.utc)}},
        upsert=True
    )
    return {"message": "Horários comerciais atualizados com sucesso"}

# ====================== OUTRAS ROTAS ADMIN ======================
@router.get("/admin/appointments/all", tags=["Admin"])
async def list_all_appointments(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    query = {} if not status else {"status": status}
    cursor = db.appointments.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

# ... (outras rotas de admin podem ser adicionadas depois)

@router.patch("/admin/appointments/{appointment_id}/status", tags=["Admin"])
async def update_appointment_status(
    appointment_id: str,
    new_status: str,
    current_user: dict = Depends(require_admin)
):
    db = get_database()
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return {"message": f"Status alterado para {new_status}"}