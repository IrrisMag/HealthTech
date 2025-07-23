from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from app.models.user import UserRole, Permission, Department, ApprovalStatus


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    employee_id: Optional[str] = None
    department: Optional[Department] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

    @validator('employee_id')
    def validate_employee_id(cls, v, values):
        if 'role' in values and values['role'] != UserRole.PATIENT and not v:
            raise ValueError('Employee ID is required for staff members')
        return v


class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    employee_id: Optional[str]
    department: Optional[Department]
    is_active: bool
    created_at: datetime
    permissions: Optional[List[Permission]] = []
    last_login: Optional[datetime] = None
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    mfa_enabled: bool = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[Department] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserApproval(BaseModel):
    user_id: str
    approved: bool
    reason: Optional[str] = None


class PermissionGrant(BaseModel):
    user_id: str
    permission: Permission
    reason: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserProfile(BaseModel):
    """Public user profile (no sensitive data)"""
    id: str
    email: str
    full_name: str
    role: UserRole
    department: Optional[Department]
    employee_id: Optional[str]
    last_login: Optional[datetime]


class UserStats(BaseModel):
    """User statistics for admin dashboard"""
    total_users: int
    active_users: int
    pending_approvals: int
    locked_accounts: int
    by_role: dict
    by_department: dict
