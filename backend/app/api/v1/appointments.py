from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from datetime import datetime, timezone, time
from typing import List, Optional
from app.core.security import get_current_user
from app.core.database import get_database

router = APIRouter()

class AppointmentCreate(BaseModel):
    service_id: str
    appointment_date: datetime
    notes: Optional[str] = None

# ====================== VALIDAÇÃO DE HORÁRIO ======================
async def is_business_hour(appointment_date: datetime) -> bool:
    db = get_database()
    config = await db.business_hours.find_one({"_id": "default"})
    if not config:
        return True  # Se não configurado, aceita todos horários
    
    weekday = appointment_date.weekday()  # 0=Segunda ... 6=Domingo
    hours = config.get("hours", [])
    
    for h in hours:
        if h["day_of_week"] == weekday and h["is_open"]:
            open_t = datetime.strptime(h["open_time"], "%H:%M").time()
            close_t = datetime.strptime(h["close_time"], "%H:%M").time()
            if open_t <= appointment_date.time() <= close_t:
                return True
    return False

# ====================== ROTAS ======================
@router.post("/appointments", response_model=dict, tags=["Appointments"])
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Validação de horário comercial
    if not await is_business_hour(appointment.appointment_date):
        raise HTTPException(
            status_code=400, 
            detail="Horário fora do expediente comercial. Verifique os horários disponíveis."
        )
    
    # Verifica conflito
    conflict = await db.appointments.find_one({
        "appointment_date": appointment.appointment_date,
        "status": {"$in": ["pending", "confirmed"]}
    })
    if conflict:
        raise HTTPException(status_code=400, detail="Já existe agendamento nesse horário")
    
    appointment_id = f"apt_{datetime.now().strftime('%Y%m%d%H%M%S')}_{current_user['user_id'][-6:]}"
    
    doc = {
        "appointment_id": appointment_id,
        "user_id": current_user["user_id"],
        "service_id": appointment.service_id,
        "appointment_date": appointment.appointment_date,
        "status": "pending",
        "notes": appointment.notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.appointments.insert_one(doc)
    return {"message": "Agendamento criado com sucesso", "appointment_id": appointment_id, **doc}