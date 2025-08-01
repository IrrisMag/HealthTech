import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://auth:8000/auth/login", auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """TESTING MODE: Authentication disabled - return mock user"""
    # Return a mock user for testing purposes
    return {
        "user_id": "test_user_123",
        "email": "test@hospital.com",
        "full_name": "Test User",
        "role": "doctor",
        "employee_id": "DOC0001",
        "department": "emergency",
        "is_active": True,
        "permissions": ["read_patient_data", "write_patient_data"],
        "roles": ["doctor", "staff"]  # For role checking
    }


def require_roles(*roles):
    def checker(user=Depends(get_current_user)):
        user_roles = user.get("roles", [])
        if not any(role in user_roles for role in roles):
            raise HTTPException(
                status_code=403, detail="Insufficient permissions"
            )
        return user
    return checker
