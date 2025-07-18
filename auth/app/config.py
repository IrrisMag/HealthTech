from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    MONGODB_URI: str = "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<cluster>"
    DB_NAME: str = "reminderdb"

    # Application
    APP_NAME: str = "Hospital Authentication System"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"

settings = Settings()
