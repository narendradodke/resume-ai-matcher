from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Matcher"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/resume_matcher"

    # Cache & Queue
    REDIS_URL: str = "redis://localhost:6379/0"

    # Authentication & Security
    JWT_SECRET_KEY: str = "supersecretjwtkey_change_in_production_min32chars_long!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Engine
    AI_PROVIDER: str = "anthropic"  # "anthropic" or "openai"
    AI_PROVIDER_API_KEY: Optional[str] = None
    AI_MODEL: str = "claude-3-5-sonnet-20241022"

    # Rate Limiting & Uploads
    RATE_LIMIT_ANALYSIS_PER_MINUTE: int = 10
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
