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
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-resume-matcher-app.vercel.app",
    ]

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    def validate_production_security(self) -> None:
        """Validate security settings when running in production."""
        if self.ENVIRONMENT.lower() == "production":
            insecure_defaults = [
                "supersecretjwtkey_change_in_production_min32chars_long!",
                "change_this_secret_key_to_a_secure_random_string_at_least_32_chars",
                "production_jwt_secret_key_change_me_in_env_file_12345",
            ]
            if self.JWT_SECRET_KEY in insecure_defaults or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError(
                    "FATAL: Insecure or default JWT_SECRET_KEY detected in production! "
                    "You must set a unique JWT_SECRET_KEY with at least 32 characters in production."
                )
            if "*" in self.ALLOWED_ORIGINS:
                raise ValueError(
                    "FATAL: Wildcard '*' cannot be used in ALLOWED_ORIGINS in production "
                    "when credential-based authentication is enabled."
                )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
