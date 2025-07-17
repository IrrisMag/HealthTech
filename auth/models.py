from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime


class Role(BaseModel):
    name: str
    permissions: Optional[List[str]] = []


class User(BaseModel):
    username: str
    hashed_password: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: str  # single role
    is_active: bool = True
    is_verified: bool = False
    permissions: Optional[List[str]] = None
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[dict] = None  # {name, phone, relationship}
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    last_password_change: Optional[datetime] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None
