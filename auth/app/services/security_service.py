import re
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, status
from app.models.user import UserInDB, Permission, UserRole
from app.models.audit import AuditSeverity
from app.services.audit_service import audit_service
from app.config import settings


class SecurityService:
    
    @staticmethod
    def validate_password_strength(password: str) -> bool:
        """Validate password meets security requirements"""
        
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            return False
        
        if settings.REQUIRE_SPECIAL_CHARS:
            # Must contain: uppercase, lowercase, digit, special char
            if not re.search(r'[A-Z]', password):
                return False
            if not re.search(r'[a-z]', password):
                return False
            if not re.search(r'\d', password):
                return False
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return False
        
        return True
    
    @staticmethod
    def generate_secure_password() -> str:
        """Generate a secure temporary password"""
        import string
        
        # Ensure at least one of each required character type
        password = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$%^&*")
        ]
        
        # Fill the rest randomly
        for _ in range(settings.PASSWORD_MIN_LENGTH - 4):
            password.append(secrets.choice(
                string.ascii_letters + string.digits + "!@#$%^&*"
            ))
        
        # Shuffle the password
        secrets.SystemRandom().shuffle(password)
        return ''.join(password)
    
    @staticmethod
    async def check_account_lockout(user: UserInDB) -> bool:
        """Check if account is locked due to failed attempts"""
        
        if user.locked_until and user.locked_until > datetime.utcnow():
            return True
        
        # Check recent failed attempts
        failed_attempts = await audit_service.get_failed_login_attempts(
            user.email, hours=1
        )
        
        if failed_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            return True
        
        return False
    
    @staticmethod
    async def lock_account(user: UserInDB, reason: str = "Too many failed attempts"):
        """Lock user account"""
        from app.services.user_service import update_user_lockout
        
        lockout_until = datetime.utcnow() + timedelta(
            minutes=settings.LOCKOUT_DURATION_MINUTES
        )
        
        await update_user_lockout(user.id, lockout_until)
        
        await audit_service.log_security_event(
            event_type="ACCOUNT_LOCKED",
            description=f"Account {user.email} locked: {reason}",
            severity=AuditSeverity.HIGH,
            user_id=user.id
        )
    
    @staticmethod
    def get_role_permissions(role: UserRole) -> List[Permission]:
        """Get default permissions for a role"""
        
        role_permissions = {
            UserRole.ADMIN: [
                Permission.MANAGE_USERS,
                Permission.MANAGE_DEPARTMENT,
                Permission.VIEW_REPORTS,
                Permission.SYSTEM_ADMIN,
                Permission.VIEW_AUDIT_LOGS,
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.DELETE_PATIENT_DATA,
            ],
            UserRole.DOCTOR: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.PRESCRIBE_MEDICATION,
                Permission.ORDER_TESTS,
                Permission.ACCESS_EMERGENCY,
            ],
            UserRole.NURSE: [
                Permission.READ_PATIENT_DATA,
                Permission.WRITE_PATIENT_DATA,
                Permission.ACCESS_EMERGENCY,
            ],
            UserRole.STAFF: [
                Permission.READ_PATIENT_DATA,
            ],
            UserRole.PATIENT: [
                # Patients have limited permissions, handled separately
            ]
        }
        
        return role_permissions.get(role, [])
    
    @staticmethod
    def check_permission(user: UserInDB, required_permission: Permission) -> bool:
        """Check if user has required permission"""
        
        # Admin has all permissions
        if user.role == UserRole.ADMIN:
            return True
        
        # Check explicit permissions
        if required_permission in user.permissions:
            return True
        
        # Check role-based permissions
        role_permissions = SecurityService.get_role_permissions(user.role)
        return required_permission in role_permissions
    
    @staticmethod
    def validate_department_access(user: UserInDB, target_department: str) -> bool:
        """Validate if user can access specific department data"""
        
        # Admin can access all departments
        if user.role == UserRole.ADMIN:
            return True
        
        # Users can access their own department
        if user.department and user.department.value == target_department:
            return True
        
        # Emergency staff can access emergency department
        if (user.role in [UserRole.DOCTOR, UserRole.NURSE] and 
            target_department == "emergency" and
            Permission.ACCESS_EMERGENCY in user.permissions):
            return True
        
        return False
    
    @staticmethod
    def generate_session_token() -> str:
        """Generate secure session token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_employee_id(employee_id: str, role: UserRole) -> bool:
        """Validate employee ID format based on role"""
        
        # Define patterns for different roles
        patterns = {
            UserRole.ADMIN: r'^ADM\d{3}$',      # ADM001
            UserRole.DOCTOR: r'^DOC\d{4}$',    # DOC0001
            UserRole.NURSE: r'^NUR\d{4}$',     # NUR0001
            UserRole.STAFF: r'^STF\d{4}$',     # STF0001
        }
        
        pattern = patterns.get(role)
        if not pattern:
            return True  # No specific pattern required
        
        return bool(re.match(pattern, employee_id))
    
    @staticmethod
    async def log_sensitive_access(
        user: UserInDB,
        resource: str,
        resource_id: str,
        action: str = "access"
    ):
        """Log access to sensitive resources"""
        
        await audit_service.log_event(
            action=f"sensitive_data_{action}",
            user_id=user.id,
            user_email=user.email,
            user_role=user.role.value,
            resource=resource,
            resource_id=resource_id,
            severity=AuditSeverity.MEDIUM
        )


# Global security service instance
security_service = SecurityService()
