from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr
from datetime import date, datetime


class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: str  # required, single role
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None


class UserOut(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    permissions: Optional[List[str]] = None
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
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


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: Optional[str] = None
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class RoleCreate(BaseModel):
    name: str
    permissions: Optional[List[str]] = []


class RoleOut(BaseModel):
    name: str
    permissions: List[str]
