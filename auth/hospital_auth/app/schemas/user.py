from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.user import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    employee_id: Optional[str] = None
    department: Optional[str] = None

class User(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    employee_id: Optional[str]
    department: Optional[str]
    is_active: bool
    created_at: datetime

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
