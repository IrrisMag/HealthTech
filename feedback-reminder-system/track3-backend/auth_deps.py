"""
Authentication dependencies for Track 3 Backend
Integrates with the main auth service for JWT validation
"""

import os
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import logging

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "https://track1-production.up.railway.app/api/auth")

class User:
    def __init__(self, user_id: str, email: str, full_name: str, role: str, 
                 employee_id: Optional[str] = None, department: Optional[str] = None,
                 permissions: Optional[List[str]] = None):
        self.user_id = user_id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.employee_id = employee_id
        self.department = department
        self.permissions = permissions or []

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Validate JWT token and return user information
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        user_id: str = payload.get("user_id")
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None or email is None:
            raise credentials_exception
            
        # Extract additional user info from payload
        full_name = payload.get("full_name", "Unknown User")
        employee_id = payload.get("employee_id")
        department = payload.get("department")
        permissions = payload.get("permissions", [])
        
        return User(
            user_id=user_id,
            email=email,
            full_name=full_name,
            role=role,
            employee_id=employee_id,
            department=department,
            permissions=permissions
        )
        
    except JWTError as e:
        logger.error(f"JWT validation failed: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise credentials_exception

def require_roles(allowed_roles: List[str]):
    """
    Dependency to require specific roles for blood bank access
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}. Your role: {current_user.role}"
            )
        return current_user
    return role_checker

def require_blood_bank_access():
    """
    Dependency to require blood bank access permissions
    Blood bank access is allowed for: admin, doctor, nurse, staff
    """
    return require_roles(["admin", "doctor", "nurse", "staff"])

def require_inventory_management():
    """
    Dependency to require inventory management permissions
    Inventory management is allowed for: admin, staff, and nurses in laboratory department
    """
    def inventory_checker(current_user: User = Depends(get_current_user)):
        if current_user.role == "admin":
            return current_user
        elif current_user.role == "staff":
            return current_user
        elif current_user.role == "nurse" and current_user.department == "laboratory":
            return current_user
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Inventory management requires admin, staff, or laboratory nurse role."
            )
    return inventory_checker

def require_forecasting_access():
    """
    Dependency to require forecasting access permissions
    Forecasting access is allowed for: admin, doctor
    """
    return require_roles(["admin", "doctor"])

def require_optimization_access():
    """
    Dependency to require optimization access permissions
    Optimization access is allowed for: admin, and staff in administration department
    """
    def optimization_checker(current_user: User = Depends(get_current_user)):
        if current_user.role == "admin":
            return current_user
        elif current_user.role == "staff" and current_user.department == "administration":
            return current_user
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Optimization requires admin or administration staff role."
            )
    return optimization_checker

def require_reports_access():
    """
    Dependency to require reports access permissions
    Reports access is allowed for: admin, doctor, nurse, staff
    """
    return require_roles(["admin", "doctor", "nurse", "staff"])

# Optional authentication for public endpoints
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    """
    Optional authentication - returns None if no token provided
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
