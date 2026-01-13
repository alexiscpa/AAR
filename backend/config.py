from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # 忽略 .env 中未定義的欄位
    )

    # Database - 預設使用 SQLite 進行本地測試
    database_url: str = "sqlite+aiosqlite:///./aar.db"

    # JWT
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Server
    debug: bool = True
    port: int = 8000


@lru_cache()
def get_settings() -> Settings:
    return Settings()
