from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from app.models.user import UserRole, Permission, ApprovalStatus
from app.schemas.user import User
from app.services.user_service import get_user_by_email
from app.services.security_service import security_service
from app.services.audit_service import audit_service
from app.security.jwt_handler import verify_token
from app.models.audit import AuditAction, AuditSeverity

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user with enhanced security checks"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(credentials.credentials, token_type="access")
    if not payload:
        raise credentials_exception

    email: str = payload.get("sub")
    user_id: str = payload.get("user_id")
    if email is None or user_id is None:
        raise credentials_exception

    user = get_user_by_email(email)
    if user is None:
        raise credentials_exception

    # Enhanced security checks
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    if user.approval_status != ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not approved"
        )

    # Check for account lockout
    if await security_service.check_account_lockout(user):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account is temporarily locked"
        )

    return User(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        employee_id=user.employee_id,
        department=user.department,
        is_active=user.is_active,
        created_at=user.created_at,
        permissions=user.permissions,
        last_login=user.last_login,
        approval_status=user.approval_status,
        mfa_enabled=user.mfa_enabled
    )


def require_roles(allowed_roles: List[UserRole]):
    """Require specific roles"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role permissions"
            )
        return current_user
    return role_checker


def require_permissions(required_permissions: List[Permission]):
    """Require specific permissions"""
    def permission_checker(current_user: User = Depends(get_current_user)):
        user_db = get_user_by_email(current_user.email)
        if not user_db:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        for permission in required_permissions:
            if not security_service.check_permission(user_db, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing required permission: {permission.value}"
                )

        return current_user
    return permission_checker


def require_department_access(target_department: str):
    """Require access to specific department"""
    def department_checker(current_user: User = Depends(get_current_user)):
        user_db = get_user_by_email(current_user.email)
        if not user_db:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        if not security_service.validate_department_access(user_db, target_department):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied to department: {target_department}"
            )

        return current_user
    return department_checker


async def log_sensitive_access(
    resource: str,
    resource_id: str,
    action: str = "access",
    current_user: User = Depends(get_current_user)
):
    """Log access to sensitive resources"""
    user_db = get_user_by_email(current_user.email)
    if user_db:
        await security_service.log_sensitive_access(
            user_db, resource, resource_id, action
        )
