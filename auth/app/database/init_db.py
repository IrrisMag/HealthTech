
import logging
from datetime import datetime
from app.database.connection import db
from app.security.password import get_password_hash
from app.models.user import UserRole, Department, ApprovalStatus, Permission
from app.services.security_service import security_service

logger = logging.getLogger(__name__)


def create_default_admin():
    """Create default admin user if not exists"""
    users_collection = db["users"]
    admin_user = users_collection.find_one({"email": "admin@hospital.com"})

    if not admin_user:
        # Generate secure password
        admin_password = security_service.generate_secure_password()
        hashed_password = get_password_hash(admin_password)

        # Get admin permissions
        admin_permissions = security_service.get_role_permissions(UserRole.ADMIN)

        admin_doc = {
            "email": "admin@hospital.com",
            "hashed_password": hashed_password,
            "full_name": "System Administrator",
            "role": UserRole.ADMIN.value,
            "employee_id": "ADM001",
            "department": Department.IT.value,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "permissions": [p.value for p in admin_permissions],
            "failed_login_attempts": 0,
            "locked_until": None,
            "last_login": None,
            "mfa_enabled": False,
            "approval_status": ApprovalStatus.APPROVED.value
        }

        users_collection.insert_one(admin_doc)

        logger.info("Default admin user created")
        logger.warning(f"IMPORTANT: Default admin password: {admin_password}")
        logger.warning("Please change the admin password immediately after first login!")


def create_indexes():
    """Create database indexes for performance and security"""

    try:
        # Users collection indexes
        users_collection = db["users"]
        users_collection.create_index("email", unique=True)
        users_collection.create_index("employee_id")
        users_collection.create_index("role")
        users_collection.create_index("department")
        users_collection.create_index("is_active")
        users_collection.create_index("approval_status")
        users_collection.create_index("locked_until")

        # Audit logs indexes
        audit_collection = db["audit_logs"]
        audit_collection.create_index("timestamp")
        audit_collection.create_index("user_id")
        audit_collection.create_index("user_email")
        audit_collection.create_index("action")
        audit_collection.create_index("severity")
        audit_collection.create_index("success")

        # Security events indexes
        security_events_collection = db["security_events"]
        security_events_collection.create_index("timestamp")
        security_events_collection.create_index("event_type")
        security_events_collection.create_index("severity")
        security_events_collection.create_index("resolved")

        # Login attempts indexes
        login_attempts_collection = db["login_attempts"]
        login_attempts_collection.create_index("email")
        login_attempts_collection.create_index("timestamp")
        login_attempts_collection.create_index("success")
        login_attempts_collection.create_index("ip_address")

        # TTL index for old audit logs (7 years retention)
        from app.config import settings
        audit_collection.create_index(
            "timestamp",
            expireAfterSeconds=settings.RETAIN_AUDIT_DAYS * 24 * 60 * 60
        )

        logger.info("Database indexes created successfully")

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


def setup_database():
    """Setup database with default data and indexes"""
    logger.info("Setting up database...")

    try:
        create_default_admin()
        create_indexes()
        logger.info("Database setup completed successfully")

    except Exception as e:
        logger.error(f"Database setup failed: {e}")
        raise
