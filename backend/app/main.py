"""
Santos Barbearia API v2.1
FastAPI + MongoDB - Estrutura Profissional
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.core.config import get_settings
from app.core.database import connect_to_mongo, close_mongo_connection, create_indexes

settings = get_settings()

# Configuração de Logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("barbearia")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Iniciando Santos Barbearia API v2.1...")
    start = time.time()
    await connect_to_mongo()
    await create_indexes()
    logger.info(f"✅ MongoDB conectado em {time.time() - start:.2f}s")
    yield
    await close_mongo_connection()
    logger.info("👋 API encerrada com sucesso")

# ====================== FASTAPI APP ======================
app = FastAPI(
    title="Santos Barbearia API",
    description="API completa para gerenciamento de barbearia",
    version="2.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json"
)

# ====================== MIDDLEWARES ======================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware para medir tempo de resposta
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2)) + "ms"
    return response

# ====================== ROTAS ======================
from app.api.v1 import (
    auth,
    appointments,
    services,
    products,
    admin
)

app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(appointments.router, prefix="/api/v1", tags=["Appointments"])
app.include_router(services.router, prefix="/api/v1", tags=["Services"])
app.include_router(products.router, prefix="/api/v1", tags=["Products"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])

# ====================== HEALTH & ROOT ======================
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": "Santos Barbearia API",
        "version": "2.1.0",
        "environment": settings.ENV,
        "debug": settings.DEBUG
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "version": "2.1.0",
        "environment": settings.ENV,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ====================== EXCEPTION HANDLER ======================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor" if not settings.DEBUG else str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        log_level="info"
    )