from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class AuditAction(str, Enum):
    # Authentication
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    TOKEN_REFRESH = "token_refresh"
    
    # User Management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_ACTIVATED = "user_activated"
    USER_DEACTIVATED = "user_deactivated"
    
    # Role & Permission Changes
    ROLE_CHANGED = "role_changed"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_REVOKED = "permission_revoked"
    
    # Security Events
    ACCOUNT_LOCKED = "account_locked"
    ACCOUNT_UNLOCKED = "account_unlocked"
    PASSWORD_CHANGED = "password_changed"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"
    
    # Data Access
    PATIENT_DATA_ACCESSED = "patient_data_accessed"
    SENSITIVE_DATA_EXPORTED = "sensitive_data_exported"
    
    # System Events
    SYSTEM_CONFIG_CHANGED = "system_config_changed"
    BACKUP_CREATED = "backup_created"


class AuditSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AuditLog(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    user_id: Optional[str]
    user_email: Optional[str]
    user_role: Optional[str]
    action: AuditAction
    resource: Optional[str]
    resource_id: Optional[str]
    severity: AuditSeverity
    ip_address: Optional[str]
    user_agent: Optional[str]
    session_id: Optional[str]
    success: bool
    error_message: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None
    
    class Config:
        use_enum_values = True


class SecurityEvent(BaseModel):
    id: Optional[str] = None
    timestamp: datetime
    event_type: str
    severity: AuditSeverity
    user_id: Optional[str]
    ip_address: Optional[str]
    description: str
    resolved: bool = False
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    
    class Config:
        use_enum_values = True


class LoginAttempt(BaseModel):
    id: Optional[str] = None
    email: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    failure_reason: Optional[str] = None
    user_id: Optional[str] = None
