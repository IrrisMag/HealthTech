from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import secrets
import string
from app.models.user import UserInDB, ApprovalStatus, Permission
from app.models.audit import AuditAction, AuditSeverity
from app.schemas.user import User, UserCreate
from app.database.connection import db
from app.security.password import get_password_hash
from app.services.security_service import security_service
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service

users_collection = db["users"]


def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get user by email"""
    user_data = users_collection.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        del user_data["_id"]  # Remove the MongoDB _id field
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
            del user_data["_id"]  # Remove the MongoDB _id field
            # Handle permissions conversion
            if "permissions" in user_data and user_data["permissions"]:
                user_data["permissions"] = [Permission(p) for p in user_data["permissions"]]
            return UserInDB(**user_data)
    except Exception:
        pass
    return None


def generate_temporary_password(length: int = 12) -> str:
    """Generate a secure temporary password"""
    # Use a mix of letters, digits, and safe special characters
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))


async def create_user(user: UserCreate, created_by: Optional[str] = None) -> str:
    """Create new user with SMS credential delivery"""

    # Validate password strength
    if not security_service.validate_password_strength(user.password):
        raise ValueError("Password does not meet security requirements")

    # Validate employee ID format
    if user.employee_id and not security_service.validate_employee_id(user.employee_id, user.role):
        raise ValueError("Invalid employee ID format for role")

    # Generate temporary password for SMS delivery
    temporary_password = generate_temporary_password()
    hashed_password = get_password_hash(temporary_password)

    # Format phone number
    formatted_phone = notification_service.format_phone_number(user.phone_number)

    # Get default permissions for role
    default_permissions = security_service.get_role_permissions(user.role)

    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "role": user.role.value,
        "phone_number": formatted_phone,
        "employee_id": user.employee_id,
        "department": user.department.value if user.department else None,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "permissions": [p.value for p in default_permissions],
        "failed_login_attempts": 0,
        "locked_until": None,
        "last_login": None,
        "mfa_enabled": False,
        "approval_status": ApprovalStatus.PENDING.value,
        "language": user.language or "en"
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

    # Send credentials via SMS
    try:
        sms_sent = await notification_service.send_user_credentials(
            phone_number=formatted_phone,
            full_name=user.full_name,
            email=user.email,
            temporary_password=temporary_password,
            role=user.role,
            language=user.language or "en"
        )

        if sms_sent:
            await audit_service.log_event(
                action=AuditAction.USER_CREATED,
                user_id=created_by,
                resource="notification",
                resource_id=user_id,
                severity=AuditSeverity.LOW,
                additional_data={
                    "notification_type": "credentials_sms",
                    "phone_number": formatted_phone,
                    "success": True
                }
            )
        else:
            await audit_service.log_event(
                action=AuditAction.USER_CREATED,
                user_id=created_by,
                resource="notification",
                resource_id=user_id,
                severity=AuditSeverity.HIGH,
                additional_data={
                    "notification_type": "credentials_sms",
                    "phone_number": formatted_phone,
                    "success": False,
                    "error": "SMS delivery failed"
                }
            )
    except Exception as e:
        # Log SMS failure but don't fail user creation
        await audit_service.log_event(
            action=AuditAction.USER_CREATED,
            user_id=created_by,
            resource="notification",
            resource_id=user_id,
            severity=AuditSeverity.HIGH,
            additional_data={
                "notification_type": "credentials_sms",
                "phone_number": formatted_phone,
                "success": False,
                "error": str(e)
            }
        )

    return user_id


def get_all_users() -> List[User]:
    """Get all users"""
    users = []
    for user_data in users_collection.find():
        user_data["id"] = str(user_data["_id"])
        del user_data["_id"]  # Remove the MongoDB _id field
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
