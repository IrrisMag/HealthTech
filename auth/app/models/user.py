from enum import Enum
from datetime import datetime
from typing import Optional


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    STAFF = "staff"
    PATIENT = "patient"


class UserInDB:

    def __init__(self, id: int, email: str, full_name: str, role: UserRole,
                 employee_id: Optional[str], department: Optional[str],
                 is_active: bool, created_at: datetime, hashed_password: str):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.employee_id = employee_id
        self.department = department
        self.is_active = is_active
        self.created_at = created_at
        self.hashed_password = hashed_password

