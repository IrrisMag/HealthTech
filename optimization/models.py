from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class BloodType(str, Enum):
    """Blood type enumeration"""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"

class DonationType(str, Enum):
    """Donation type enumeration"""
    WHOLE_BLOOD = "whole_blood"
    PLASMA = "plasma"
    PLATELETS = "platelets"
    RED_CELLS = "red_cells"
    DOUBLE_RED_CELLS = "double_red_cells"

class Priority(str, Enum):
    """Priority level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"
    CRITICAL = "critical"

class BloodUnit(BaseModel):
    """Blood unit model"""
    unit_id: str
    blood_type: BloodType
    donation_type: DonationType
    collection_date: datetime
    expiry_date: datetime
    status: str = Field(default="available")
    donor_id: Optional[str] = None
    location: Optional[str] = None
    volume_ml: int = Field(default=450)
    
class Donor(BaseModel):
    """Donor model"""
    donor_id: str
    first_name: str
    last_name: str
    blood_type: BloodType
    date_of_birth: datetime
    phone: Optional[str] = None
    email: Optional[str] = None
    last_donation_date: Optional[datetime] = None
    is_eligible: bool = Field(default=True)
    
class BloodRequest(BaseModel):
    """Blood request model"""
    request_id: str
    patient_id: str
    blood_type: BloodType
    units_requested: int
    priority: Priority
    requested_date: datetime
    required_by_date: datetime
    status: str = Field(default="pending")
    fulfilled_units: int = Field(default=0)