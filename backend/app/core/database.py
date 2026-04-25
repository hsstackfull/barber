from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import OperationFailure
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

db_client = None
db = None

async def connect_to_mongo():
    global db_client, db
    logger.info(f"🔌 Conectando ao MongoDB: {settings.DB_NAME}")
    db_client = AsyncIOMotorClient(
        settings.MONGO_URL,
        maxPoolSize=100,
        minPoolSize=10,
        maxIdleTimeMS=30000,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000,
        retryWrites=True,
        tz_aware=True
    )
    db = db_client[settings.DB_NAME]
    try:
        await db_client.server_info()
        logger.info("✅ MongoDB conectado com sucesso")
    except Exception as e:
        logger.critical(f"❌ Falha na conexão: {e}")
        raise

async def close_mongo_connection():
    global db_client
    if db_client:
        db_client.close()
        logger.info("🔌 Conexão MongoDB fechada")

def get_database():
    if db is None:
        raise RuntimeError("Banco de dados não conectado")
    return db

async def create_indexes():
    if db is None:
        return
    indexes = {
        "users": [("email", {"unique": True}), ("user_id", {"unique": True, "sparse": True})],
        "appointments": [
            ([("appointment_date", 1), ("status", 1)], {}),
            ("appointment_id", {"unique": True}),
            ([("user_id", 1), ("appointment_date", 1)], {})
        ],
        "services": [("service_id", {"unique": True})],
        "products": [("product_id", {"unique": True})],
        "orders": [([("created_at", -1), ("status", 1)], {}), ("order_id", {"unique": True})],
        "token_blacklist": [("token", {"unique": True}), ("expires_at", {"expireAfterSeconds": 0})],
    }
    for coll_name, idx_list in indexes.items():
        collection = db[coll_name]
        for idx in idx_list:
            try:
                keys, options = idx if isinstance(idx, tuple) else (idx, {})
                await collection.create_index(keys, **options)
            except OperationFailure as e:
                if e.code != 85:
                    logger.warning(f"Erro ao criar índice em {coll_name}: {e}")
    logger.info("✅ Todos os índices foram criados/verificados")