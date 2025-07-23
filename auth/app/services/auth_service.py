from typing import Optional, Dict, Any
from datetime import timedelta, datetime
from fastapi import HTTPException, status, Request
from app.models.user import UserInDB, ApprovalStatus
from app.models.audit import AuditAction, AuditSeverity
from app.security.password import verify_password
from app.security.jwt_handler import create_access_token, create_refresh_token
from app.services.user_service import get_user_by_email, update_last_login
from app.services.security_service import security_service
from app.services.audit_service import audit_service
from app.config import settings


async def authenticate_user(
    email: str,
    password: str,
    request: Optional[Request] = None
) -> Optional[UserInDB]:
    """Authenticate user with enhanced security checks"""

    user = get_user_by_email(email)

    # Log login attempt
    await audit_service.log_login_attempt(
        email=email,
        success=False,  # Will be updated if successful
        request=request,
        user_id=user.id if user else None
    )

    # Check if user exists
    if not user:
        await audit_service.log_login_attempt(
            email=email,
            success=False,
            request=request,
            failure_reason="User not found"
        )
        return None

    # Check account status
    if not user.is_active:
        await audit_service.log_login_attempt(
            email=email,
            success=False,
            request=request,
            failure_reason="Account inactive",
            user_id=user.id
        )
        return None

    # Check approval status
    if user.approval_status != ApprovalStatus.APPROVED:
        await audit_service.log_login_attempt(
            email=email,
            success=False,
            request=request,
            failure_reason=f"Account not approved: {user.approval_status}",
            user_id=user.id
        )
        return None

    # Check account lockout
    if await security_service.check_account_lockout(user):
        await audit_service.log_login_attempt(
            email=email,
            success=False,
            request=request,
            failure_reason="Account locked",
            user_id=user.id
        )
        return None

    # Verify password
    if not verify_password(password, user.hashed_password):
        await audit_service.log_login_attempt(
            email=email,
            success=False,
            request=request,
            failure_reason="Invalid password",
            user_id=user.id
        )

        # Check if we should lock the account
        failed_attempts = await audit_service.get_failed_login_attempts(email, hours=1)
        if failed_attempts >= settings.MAX_LOGIN_ATTEMPTS - 1:
            await security_service.lock_account(user, "Too many failed login attempts")

        return None

    # Successful authentication
    await audit_service.log_login_attempt(
        email=email,
        success=True,
        request=request,
        user_id=user.id
    )

    # Update last login
    await update_last_login(user.id)

    return user


async def create_user_tokens(user: UserInDB) -> Dict[str, Any]:
    """Create access and refresh tokens"""

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    refresh_token_expires = timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    # Include permissions in token
    permissions = [perm.value for perm in user.permissions] if user.permissions else []
    role_permissions = [perm.value for perm in security_service.get_role_permissions(user.role)]
    all_permissions = list(set(permissions + role_permissions))

    token_data = {
        "sub": user.email,
        "user_id": user.id,
        "role": user.role.value,
        "permissions": all_permissions,
        "department": user.department.value if user.department else None,
        "employee_id": user.employee_id
    }

    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )

    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
