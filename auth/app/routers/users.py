from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from app.schemas.user import User, UserProfile, PasswordChange, UserUpdate
from app.schemas.auth import AuditLogEntry
from app.models.user import UserRole, Permission
from app.models.audit import AuditAction, AuditSeverity
from app.services.user_service import get_all_users, deactivate_user, get_user_by_id
from app.services.audit_service import audit_service
from app.services.security_service import security_service
from app.middleware.auth_middleware import (
    get_current_user, require_roles, require_permissions
)
from app.security.password import get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.get("/me/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get user profile (public information only)"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        department=current_user.department,
        employee_id=current_user.employee_id,
        last_login=current_user.last_login
    )


@router.put("/me/password")
async def change_password(
    password_change: PasswordChange,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""

    # Get full user data
    user_db = get_user_by_id(current_user.id)
    if not user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify current password
    if not verify_password(password_change.current_password, user_db.hashed_password):
        await audit_service.log_event(
            action=AuditAction.PASSWORD_CHANGED,
            user_id=current_user.id,
            user_email=current_user.email,
            severity=AuditSeverity.HIGH,
            request=request,
            success=False,
            error_message="Invalid current password"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )

    # Validate new password strength
    if not security_service.validate_password_strength(password_change.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password does not meet security requirements"
        )

    # Update password
    from app.database.connection import db
    from bson import ObjectId

    new_hashed_password = get_password_hash(password_change.new_password)
    result = db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"hashed_password": new_hashed_password}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

    await audit_service.log_event(
        action=AuditAction.PASSWORD_CHANGED,
        user_id=current_user.id,
        user_email=current_user.email,
        severity=AuditSeverity.HIGH,
        request=request,
        success=True
    )

    return {"message": "Password changed successfully"}


@router.get("/me/audit", response_model=List[AuditLogEntry])
async def get_my_audit_logs(
    current_user: User = Depends(get_current_user)
):
    """Get current user's audit logs"""

    logs = await audit_service.get_user_audit_logs(current_user.id, limit=50)

    return [
        AuditLogEntry(
            id=log.id,
            timestamp=log.timestamp,
            user_email=log.user_email,
            action=log.action,
            resource=log.resource,
            success=log.success,
            ip_address=log.ip_address,
            details=log.additional_data
        )
        for log in logs
    ]


@router.get("/", response_model=List[User])
async def get_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Get all users (admin only)"""
    return get_all_users()


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_permissions([Permission.MANAGE_USERS]))
):
    """Get specific user by ID"""

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
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


@router.put("/{user_id}/deactivate")
async def deactivate_user_account(
    user_id: str,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Deactivate user account"""

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )

    success = await deactivate_user(user_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "User deactivated successfully"}


@router.put("/{user_id}/deactivate")
async def deactivate_user_account(
    user_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    if not deactivate_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deactivated successfully"}
