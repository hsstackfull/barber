from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    ENV: str = "production"
    DEBUG: bool = False
    MONGO_URL: str
    DB_NAME: str = "barbershop_db"
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""
    MERCADOPAGO_WEBHOOK_SECRET: str = ""
    RESEND_API_KEY: str = ""
    SENDER_EMAIL: str = "barbearia@santosbarbearia.com"
    OWNER_EMAIL: str = "pedrohenriquedossantos200410@gmail.com"
    WEBHOOK_BASE_URL: str = "https://barber-v20b.onrender.com"
    FRONTEND_URL: str = "https://barber-two-gules.vercel.app"
    ALLOWED_ORIGINS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.DEBUG = settings.ENV.lower() == "development"
    return settings