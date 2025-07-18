from typing import Optional
from datetime import timedelta
from app.models.user import UserInDB
from app.security.password import verify_password
from app.security.jwt_handler import create_access_token
from app.services.user_service import get_user_by_email
from app.config import settings


def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    user = get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_user_token(user: UserInDB) -> str:
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    return access_token
