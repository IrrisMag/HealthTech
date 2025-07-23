from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    STAFF = "staff"
    PATIENT = "patient"


class Permission(str, Enum):
    # Patient Data
    READ_PATIENT_DATA = "read:patient_data"
    WRITE_PATIENT_DATA = "write:patient_data"
    DELETE_PATIENT_DATA = "delete:patient_data"

    # Medical Actions
    PRESCRIBE_MEDICATION = "prescribe:medication"
    ORDER_TESTS = "order:tests"
    ACCESS_EMERGENCY = "access:emergency"

    # Administrative
    MANAGE_USERS = "manage:users"
    MANAGE_DEPARTMENT = "manage:department"
    VIEW_REPORTS = "view:reports"
    SYSTEM_ADMIN = "system:admin"

    # Audit
    VIEW_AUDIT_LOGS = "view:audit_logs"


class Department(str, Enum):
    EMERGENCY = "emergency"
    CARDIOLOGY = "cardiology"
    SURGERY = "surgery"
    ICU = "icu"
    PEDIATRICS = "pediatrics"
    ONCOLOGY = "oncology"
    RADIOLOGY = "radiology"
    LABORATORY = "laboratory"
    PHARMACY = "pharmacy"
    ADMINISTRATION = "administration"
    IT = "it"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class UserInDB:
    def __init__(self, id: str, email: str, full_name: str, role: UserRole,
                 employee_id: Optional[str], department: Optional[Department],
                 is_active: bool, created_at: datetime, hashed_password: str,
                 permissions: Optional[List[Permission]] = None,
                 failed_login_attempts: int = 0,
                 locked_until: Optional[datetime] = None,
                 last_login: Optional[datetime] = None,
                 mfa_enabled: bool = False,
                 approval_status: ApprovalStatus = ApprovalStatus.PENDING):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.employee_id = employee_id
        self.department = department
        self.is_active = is_active
        self.created_at = created_at
        self.hashed_password = hashed_password
        self.permissions = permissions or []
        self.failed_login_attempts = failed_login_attempts
        self.locked_until = locked_until
        self.last_login = last_login
        self.mfa_enabled = mfa_enabled
        self.approval_status = approval_status
