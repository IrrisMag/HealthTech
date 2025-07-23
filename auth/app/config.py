import secrets
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Security - Production Ready
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8h (hospital shift)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Security Features
    MFA_ENABLED: bool = False  # Can be enabled per environment
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30
    PASSWORD_MIN_LENGTH: int = 8
    REQUIRE_SPECIAL_CHARS: bool = True

    # Session Management
    SESSION_TIMEOUT_MINUTES: int = 60
    CONCURRENT_SESSIONS_LIMIT: int = 3

    # Audit & Compliance
    AUDIT_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"
    RETAIN_AUDIT_DAYS: int = 2555  # 7 years for healthcare compliance

    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "reminderdb_auth"

    # Application
    APP_NAME: str = "Hospital Authentication System"
    APP_VERSION: str = "2.0.0"
    ENVIRONMENT: str = "development"

    # CORS & Security Headers
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "https://*.hospital.com"]
    SECURE_COOKIES: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
