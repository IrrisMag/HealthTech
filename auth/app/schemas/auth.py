from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int


class TokenRefresh(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None
    permissions: Optional[List[str]] = []
    department: Optional[str] = None
    employee_id: Optional[str] = None


class LoginResponse(BaseModel):
    """Enhanced login response with user info"""
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict  # User profile data


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class MFASetup(BaseModel):
    """Multi-factor authentication setup"""
    secret: str
    qr_code: str
    backup_codes: List[str]


class MFAVerify(BaseModel):
    """MFA verification"""
    token: str
    code: str


class SecurityEvent(BaseModel):
    """Security event notification"""
    event_type: str
    timestamp: datetime
    description: str
    severity: str
    ip_address: Optional[str] = None


class AuditLogEntry(BaseModel):
    """Audit log entry"""
    id: str
    timestamp: datetime
    user_email: Optional[str]
    action: str
    resource: Optional[str]
    success: bool
    ip_address: Optional[str]
    details: Optional[dict] = None
