from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import settings
import secrets


def create_access_token(data: Dict[str, Any],
                        expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16),  # JWT ID for token tracking
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any],
                        expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16),
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        # Verify token type
        if payload.get("type") != token_type:
            return None

        return payload
    except JWTError:
        return None


def decode_token_without_verification(token: str) -> Optional[Dict[str, Any]]:
    """Decode token without verification (for debugging/logging)"""
    try:
        return jwt.get_unverified_claims(token)
    except JWTError:
        return None


def get_token_expiry(token: str) -> Optional[datetime]:
    """Get token expiration time"""
    payload = decode_token_without_verification(token)
    if payload and "exp" in payload:
        return datetime.fromtimestamp(payload["exp"])
    return None
