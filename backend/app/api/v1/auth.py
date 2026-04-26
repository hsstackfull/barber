from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone, timedelta
from app.core.security import (
    hash_password, verify_password, create_access_token, 
    create_refresh_token, validate_password_strength, get_current_user, oauth2_scheme
)
from app.core.database import get_database
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("barbearia")

# ====================== MODELOS ======================
class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str | None = None
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    phone: str | None = None
    is_admin: bool = False
    role: str = "client"
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

# ====================== ROTAS ======================
@router.post("/auth/register", status_code=201, tags=["Auth"])
async def register(user_data: UserCreate, request: Request):
    db = get_database()
    
    # Verifica se email já existe
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Valida força da senha
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=400, 
            detail="Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo especial"
        )
    
    # Gera user_id único
    user_id = f"user_{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_data.email.split('@')[0][:6]}"
    
    # Cria documento do usuário
    user_doc = {
        "user_id": user_id,
        "name": user_data.name.strip(),
        "email": user_data.email.lower(),
        "phone": user_data.phone,
        "hashed_password": hash_password(user_data.password),
        "is_admin": False,
        "role": "client",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    await db.users.insert_one(user_doc)
    logger.info(f"✅ Novo usuário registrado: {user_id}")
    
    return {"message": "Usuário criado com sucesso", "user_id": user_id}

@router.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
@limiter.limit("10/minute")
async def login(user_data: UserLogin, request: Request):
    db = get_database()
    
    # Busca usuário
    user = await db.users.find_one({"email": user_data.email.lower()})
    
    if not user:
        logger.warning(f"⚠️ Tentativa de login com email não cadastrado: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email ou senha incorretos"
        )
    
    # Verifica senha (suporta hashed_password e password para compatibilidade)
    stored_password = user.get("hashed_password") or user.get("password")
    
    if not stored_password or not verify_password(user_data.password, stored_password):
        logger.warning(f"⚠️ Senha incorreta para: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email ou senha incorretos"
        )
    
    # Gera tokens
    token_data = {
        "user_id": user["user_id"],
        "email": user["email"],
        "is_admin": user.get("is_admin", False),
        "role": user.get("role", "client")
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Salva refresh token no banco
    await db.refresh_tokens.insert_one({
        "token": refresh_token,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7)
    })
    
    # Monta resposta
    user_response = UserResponse(
        user_id=user["user_id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        is_admin=user.get("is_admin", False),
        role=user.get("role", "client"),
        created_at=user["created_at"]
    )
    
    logger.info(f"✅ Login realizado: {user['user_id']}")
    
    return TokenResponse(
        access_token=access_token, 
        refresh_token=refresh_token, 
        user=user_response
    )

@router.get("/auth/me", response_model=UserResponse, tags=["Auth"])
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user = await db.users.find_one({"user_id": current_user["user_id"]})
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return UserResponse(
        user_id=user["user_id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        is_admin=user.get("is_admin", False),
        role=user.get("role", "client"),
        created_at=user["created_at"]
    )

@router.post("/auth/logout", tags=["Auth"])
async def logout(current_user: dict = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    db = get_database()
    
    await db.token_blacklist.insert_one({
        "token": token,
        "user_id": current_user["user_id"],
        "revoked_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=15)
    })
    
    logger.info(f"✅ Logout realizado: {current_user['user_id']}")
    
    return {"message": "Logout realizado com sucesso"}
