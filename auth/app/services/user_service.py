from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.user import UserInDB, ApprovalStatus, Permission
from app.models.audit import AuditAction, AuditSeverity
from app.schemas.user import User, UserCreate
from app.database.connection import db
from app.security.password import get_password_hash
from app.services.security_service import security_service
from app.services.audit_service import audit_service

users_collection = db["users"]


def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get user by email"""
    user_data = users_collection.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        # Handle permissions conversion
        if "permissions" in user_data and user_data["permissions"]:
            user_data["permissions"] = [Permission(p) for p in user_data["permissions"]]
        return UserInDB(**user_data)
    return None


def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """Get user by ID"""
    try:
        user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user_data["id"] = str(user_data["_id"])
            # Handle permissions conversion
            if "permissions" in user_data and user_data["permissions"]:
                user_data["permissions"] = [Permission(p) for p in user_data["permissions"]]
            return UserInDB(**user_data)
    except Exception:
        pass
    return None


async def create_user(user: UserCreate, created_by: Optional[str] = None) -> str:
    """Create new user with audit logging"""

    # Validate password strength
    if not security_service.validate_password_strength(user.password):
        raise ValueError("Password does not meet security requirements")

    # Validate employee ID format
    if user.employee_id and not security_service.validate_employee_id(user.employee_id, user.role):
        raise ValueError("Invalid employee ID format for role")

    hashed_password = get_password_hash(user.password)

    # Get default permissions for role
    default_permissions = security_service.get_role_permissions(user.role)

    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "role": user.role.value,
        "employee_id": user.employee_id,
        "department": user.department.value if user.department else None,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "permissions": [p.value for p in default_permissions],
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login": None,
        "mfa_enabled": False,
        "approval_status": ApprovalStatus.PENDING.value
    }

    result = users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Log user creation
    await audit_service.log_event(
        action=AuditAction.USER_CREATED,
        user_id=created_by,
        resource="user",
        resource_id=user_id,
        severity=AuditSeverity.MEDIUM,
        additional_data={"new_user_email": user.email, "role": user.role.value}
    )

    return user_id


def get_all_users() -> List[User]:
    """Get all users"""
    users = []
    for user_data in users_collection.find():
        user_data["id"] = str(user_data["_id"])
        users.append(User(**user_data))
    return users


async def deactivate_user(user_id: str, deactivated_by: Optional[str] = None) -> bool:
    """Deactivate user with audit logging"""
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False}}
    )

    if result.modified_count > 0:
        await audit_service.log_event(
            action=AuditAction.USER_DEACTIVATED,
            user_id=deactivated_by,
            resource="user",
            resource_id=user_id,
            severity=AuditSeverity.MEDIUM
        )

    return result.modified_count > 0


async def update_last_login(user_id: str) -> bool:
    """Update user's last login timestamp"""
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    return result.modified_count > 0


async def update_user_lockout(user_id: str, locked_until: Optional[datetime]) -> bool:
    """Update user lockout status"""
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"locked_until": locked_until}}
    )
    return result.modified_count > 0


async def approve_user(user_id: str, approved_by: str) -> bool:
    """Approve user account"""
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"approval_status": ApprovalStatus.APPROVED.value}}
    )

    if result.modified_count > 0:
        await audit_service.log_event(
            action=AuditAction.USER_UPDATED,
            user_id=approved_by,
            resource="user",
            resource_id=user_id,
            severity=AuditSeverity.MEDIUM,
            additional_data={"action": "approved"}
        )

    return result.modified_count > 0


async def grant_permission(user_id: str, permission: Permission, granted_by: str) -> bool:
    """Grant permission to user"""
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"permissions": permission.value}}
    )

    if result.modified_count > 0:
        await audit_service.log_event(
            action=AuditAction.PERMISSION_GRANTED,
            user_id=granted_by,
            resource="user",
            resource_id=user_id,
            severity=AuditSeverity.HIGH,
            additional_data={"permission": permission.value}
        )

    return result.modified_count > 0
