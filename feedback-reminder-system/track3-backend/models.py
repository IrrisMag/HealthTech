"""
Data models for Blood Bank Management System - Track 3
Handles donor demographics, clinical data, and operational metrics
"""

from datetime import datetime, date
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator
from bson import ObjectId
import re


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# Enums for standardized values
class BloodType(str, Enum):
    """ABO blood group system with Rh factor"""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"


class Gender(str, Enum):
    """Gender classification"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class DonationType(str, Enum):
    """Type of blood donation"""
    WHOLE_BLOOD = "whole_blood"
    PLASMA = "plasma"
    PLATELETS = "platelets"
    RED_CELLS = "red_cells"
    DOUBLE_RED_CELLS = "double_red_cells"


class BloodComponentStatus(str, Enum):
    """Status of blood components in inventory"""
    AVAILABLE = "available"
    RESERVED = "reserved"
    EXPIRED = "expired"
    NEAR_EXPIRY = "near_expiry"
    QUARANTINED = "quarantined"
    ISSUED = "issued"
    DISCARDED = "discarded"


class ScreeningResult(str, Enum):
    """Blood screening test results"""
    NEGATIVE = "negative"
    POSITIVE = "positive"
    PENDING = "pending"
    INCONCLUSIVE = "inconclusive"


class Priority(str, Enum):
    """Priority levels for blood requests"""
    EMERGENCY = "emergency"
    URGENT = "urgent"
    ROUTINE = "routine"


# Core Data Models
class DonorDemographics(BaseModel):
    """Donor demographic information"""
    donor_id: str = Field(..., description="Unique donor identifier")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: datetime = Field(..., description="Donor's date of birth")
    gender: Gender
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
    email: Optional[EmailStr] = None
    address: str = Field(..., min_length=5, max_length=500)
    occupation: Optional[str] = Field(None, max_length=100)
    emergency_contact_name: Optional[str] = Field(None, max_length=100)
    emergency_contact_phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('date_of_birth')
    def validate_age(cls, v):
        """Ensure donor is at least 16 years old"""
        today = date.today()
        birth_date = v.date() if isinstance(v, datetime) else v
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < 16:
            raise ValueError("Donor must be at least 16 years old")
        if age > 100:
            raise ValueError("Invalid date of birth")
        return v


class ClinicalData(BaseModel):
    """Clinical information for blood donation"""
    donor_id: str = Field(..., description="Reference to donor")
    blood_type: BloodType
    hemoglobin_level: float = Field(..., ge=7.0, le=20.0, description="Hemoglobin in g/dL")
    blood_pressure_systolic: int = Field(..., ge=80, le=200, description="Systolic BP in mmHg")
    blood_pressure_diastolic: int = Field(..., ge=50, le=120, description="Diastolic BP in mmHg")
    pulse_rate: int = Field(..., ge=50, le=120, description="Pulse rate per minute")
    temperature: float = Field(..., ge=35.0, le=42.0, description="Body temperature in Celsius")
    weight: float = Field(..., ge=45.0, le=200.0, description="Weight in kg")
    height: Optional[float] = Field(None, ge=120.0, le=250.0, description="Height in cm")
    
    # Screening results
    hiv_screening: ScreeningResult = Field(default=ScreeningResult.PENDING)
    hepatitis_b_screening: ScreeningResult = Field(default=ScreeningResult.PENDING)
    hepatitis_c_screening: ScreeningResult = Field(default=ScreeningResult.PENDING)
    syphilis_screening: ScreeningResult = Field(default=ScreeningResult.PENDING)
    malaria_screening: ScreeningResult = Field(default=ScreeningResult.PENDING)
    
    # Medical history flags
    has_chronic_illness: bool = Field(default=False)
    is_on_medication: bool = Field(default=False)
    recent_travel: bool = Field(default=False)
    recent_vaccination: bool = Field(default=False)
    
    # Additional notes
    medical_notes: Optional[str] = Field(None, max_length=1000)
    eligibility_status: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BloodDonation(BaseModel):
    """Blood donation record"""
    donation_id: str = Field(..., description="Unique donation identifier")
    donor_id: str = Field(..., description="Reference to donor")
    donation_date: datetime = Field(default_factory=datetime.utcnow)
    donation_type: DonationType
    volume_collected: float = Field(..., ge=200.0, le=500.0, description="Volume in mL")
    collection_site: str = Field(..., min_length=1, max_length=100)
    staff_id: str = Field(..., description="Staff member who collected")
    
    # Quality metrics
    collection_time: int = Field(..., ge=5, le=30, description="Collection time in minutes")
    adverse_reactions: bool = Field(default=False)
    reaction_notes: Optional[str] = Field(None, max_length=500)
    
    # Processing information
    processing_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    storage_location: Optional[str] = Field(None, max_length=100)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BloodInventory(BaseModel):
    """Blood inventory management"""
    inventory_id: str = Field(..., description="Unique inventory identifier")
    donation_id: str = Field(..., description="Reference to donation")
    blood_type: BloodType
    component_type: DonationType
    volume: float = Field(..., ge=50.0, le=500.0, description="Volume in mL")
    
    # Status and dates
    status: BloodComponentStatus = Field(default=BloodComponentStatus.AVAILABLE)
    collection_date: datetime
    expiry_date: datetime
    
    # Storage information
    storage_location: str = Field(..., min_length=1, max_length=100)
    storage_temperature: float = Field(..., ge=-80.0, le=25.0, description="Storage temp in Celsius")
    bag_number: str = Field(..., min_length=1, max_length=50)
    
    # Tracking
    reserved_for: Optional[str] = Field(None, description="Patient ID if reserved")
    issued_to: Optional[str] = Field(None, description="Department/Patient issued to")
    issued_date: Optional[datetime] = None
    issued_by: Optional[str] = Field(None, description="Staff ID who issued")
    
    # Quality control
    quality_check_passed: bool = Field(default=True)
    quality_notes: Optional[str] = Field(None, max_length=500)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        """Ensure expiry date is after collection date"""
        if 'collection_date' in values and v <= values['collection_date']:
            raise ValueError("Expiry date must be after collection date")
        return v


class BloodRequest(BaseModel):
    """Blood request from departments"""
    request_id: str = Field(..., description="Unique request identifier")
    patient_id: str = Field(..., description="Patient identifier")
    requesting_department: str = Field(..., min_length=1, max_length=100)
    requesting_physician: str = Field(..., min_length=1, max_length=100)
    
    # Request details
    blood_type: BloodType
    component_type: DonationType
    units_requested: int = Field(..., ge=1, le=20)
    priority: Priority = Field(default=Priority.ROUTINE)
    
    # Clinical information
    diagnosis: str = Field(..., min_length=1, max_length=500)
    indication: str = Field(..., min_length=1, max_length=500)
    patient_weight: Optional[float] = Field(None, ge=1.0, le=300.0)
    
    # Timing
    requested_date: datetime = Field(default_factory=datetime.utcnow)
    required_by: datetime
    
    # Status tracking
    status: str = Field(default="pending")  # pending, approved, fulfilled, cancelled
    approved_by: Optional[str] = None
    fulfilled_by: Optional[str] = None
    fulfilled_date: Optional[datetime] = None
    
    # Notes
    special_requirements: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('required_by')
    def validate_required_by(cls, v, values):
        """Ensure required_by is in the future"""
        if 'requested_date' in values and v <= values['requested_date']:
            raise ValueError("Required by date must be after request date")
        return v


# DHIS2 Integration Models
class DHIS2DataElement(BaseModel):
    """DHIS2 data element mapping"""
    element_id: str = Field(..., description="DHIS2 data element ID")
    element_name: str = Field(..., description="Human readable name")
    category: str = Field(..., description="Data category")
    value_type: str = Field(..., description="Data type")
    mapping_field: str = Field(..., description="Field in our system")


class DHIS2SyncRecord(BaseModel):
    """Record of DHIS2 synchronization"""
    sync_id: str = Field(..., description="Unique sync identifier")
    sync_type: str = Field(..., description="Type of data synced")
    records_sent: int = Field(default=0)
    records_received: int = Field(default=0)
    sync_status: str = Field(default="pending")  # pending, success, failed, partial
    error_message: Optional[str] = None
    sync_started: datetime = Field(default_factory=datetime.utcnow)
    sync_completed: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Response Models
class DataIngestionResponse(BaseModel):
    """Response for data ingestion operations"""
    success: bool
    message: str
    record_id: Optional[str] = None
    errors: Optional[List[str]] = None
    warnings: Optional[List[str]] = None


class InventoryStatusResponse(BaseModel):
    """Response for inventory status queries"""
    blood_type: BloodType
    component_type: DonationType
    total_units: int
    available_units: int
    reserved_units: int
    near_expiry_units: int
    expired_units: int
    last_updated: datetime


class DashboardMetrics(BaseModel):
    """Metrics for dashboard display"""
    total_donors: int
    total_donations_today: int
    total_donations_this_month: int
    total_inventory_units: int
    units_expiring_soon: int
    pending_requests: int
    emergency_requests: int
    blood_type_distribution: Dict[str, int]
    component_distribution: Dict[str, int]
    last_updated: datetime = Field(default_factory=datetime.utcnow)


# =============================================================================
# FORECASTING MODELS
# =============================================================================

class ForecastRequest(BaseModel):
    """Request model for single blood type forecasting."""

    # Fix Pydantic protected namespace warning
    model_config = {"protected_namespaces": ()}

    blood_type: str = Field(
        ...,
        description="Blood type to forecast (e.g., 'O+', 'A-', 'AB+', etc.)",
        example="O+"
    )
    periods: int = Field(
        default=7,
        ge=1,
        le=365,
        description="Number of periods to forecast (1-365 days)"
    )
    confidence_level: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Confidence level for prediction intervals"
    )
    model_type: Optional[str] = Field(
        default="auto",
        description="Forecasting model to use: 'arima', 'linear', 'seasonal', or 'auto'"
    )

    @validator('blood_type')
    def validate_blood_type(cls, v):
        """Validate blood type format"""
        pattern = r'^(A|B|AB|O)[+-]$'
        if not re.match(pattern, v):
            raise ValueError(f"Invalid blood type format: {v}. Expected format like 'O+', 'A-', etc.")
        return v.upper()


class BatchForecastRequest(BaseModel):
    """Request model for batch forecasting multiple blood types."""

    # Fix Pydantic protected namespace warning
    model_config = {"protected_namespaces": ()}

    blood_types: List[str] = Field(
        ...,
        description="List of blood types to forecast",
        example=["O+", "A+", "B+", "AB+"]
    )
    periods: int = Field(
        default=7,
        ge=1,
        le=365,
        description="Number of periods to forecast for each blood type"
    )
    confidence_level: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Confidence level for prediction intervals"
    )
    model_type: Optional[str] = Field(
        default="auto",
        description="Forecasting model to use for all blood types"
    )

    @validator('blood_types')
    def validate_blood_types(cls, v):
        """Validate all blood types in the list"""
        pattern = r'^(A|B|AB|O)[+-]$'
        validated_types = []
        for blood_type in v:
            if not re.match(pattern, blood_type):
                raise ValueError(f"Invalid blood type format: {blood_type}")
            validated_types.append(blood_type.upper())
        return validated_types


class ForecastDataPoint(BaseModel):
    """Individual forecast data point."""

    date: str = Field(..., description="Forecast date in YYYY-MM-DD format")
    predicted_demand: float = Field(..., description="Predicted blood demand")
    lower_bound: float = Field(..., description="Lower confidence interval")
    upper_bound: float = Field(..., description="Upper confidence interval")
    confidence_level: float = Field(..., description="Confidence level for this prediction")


class ModelAccuracy(BaseModel):
    """Model accuracy metrics."""

    mae: float = Field(..., description="Mean Absolute Error")
    rmse: float = Field(..., description="Root Mean Square Error")
    mape: float = Field(..., description="Mean Absolute Percentage Error")
    r_squared: Optional[float] = Field(None, description="R-squared coefficient")
    training_samples: int = Field(..., description="Number of samples used for training")


class HistoricalDataPoint(BaseModel):
    """Historical data point for model training."""

    date: str = Field(..., description="Historical date in YYYY-MM-DD format")
    actual_demand: float = Field(..., description="Actual blood demand")


class ForecastResponse(BaseModel):
    """Response model for blood demand forecasting."""

    # Fix Pydantic protected namespace warning
    model_config = {"protected_namespaces": ()}

    blood_type: str = Field(..., description="Blood type that was forecasted")
    forecast_periods: int = Field(..., description="Number of periods forecasted")
    confidence_level: float = Field(..., description="Confidence level used")
    model_type: str = Field(..., description="Forecasting model used")
    forecast_data: List[ForecastDataPoint] = Field(..., description="Forecast data points")
    model_accuracy: ModelAccuracy = Field(..., description="Model performance metrics")
    historical_data_points: int = Field(..., description="Number of historical data points used")
    seasonal_pattern: Optional[Dict[str, Any]] = Field(None, description="Detected seasonal patterns")
    trend_analysis: Optional[Dict[str, Any]] = Field(None, description="Trend analysis results")
    generated_at: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp when forecast was generated"
    )


class BatchForecastResponse(BaseModel):
    """Response model for batch forecasting."""

    forecasts: Dict[str, ForecastResponse] = Field(
        ...,
        description="Dictionary of forecasts keyed by blood type"
    )
    summary: Dict[str, Any] = Field(
        ...,
        description="Summary statistics across all forecasts"
    )
    generated_at: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp when batch forecast was generated"
    )


class ModelInfo(BaseModel):
    """Information about a specific forecasting model."""

    # Fix Pydantic protected namespace warning
    model_config = {"protected_namespaces": ()}

    blood_type: str = Field(..., description="Blood type this model predicts")
    model_type: str = Field(..., description="Type of model (e.g., ARIMA, SARIMAX)")
    filename: str = Field(..., description="Model file name")
    version: str = Field(..., description="Model version")
    accuracy_metrics: ModelAccuracy = Field(..., description="Model performance metrics")
    training_data_start: str = Field(..., description="Start date of training data")
    training_data_end: str = Field(..., description="End date of training data")
    last_updated: datetime = Field(
        default_factory=datetime.now,
        description="When model was last updated"
    )
    parameters: Optional[Dict[str, Any]] = Field(None, description="Model parameters")
    seasonal_periods: Optional[int] = Field(None, description="Seasonal periods detected")
    trend_type: Optional[str] = Field(None, description="Type of trend detected")


class ErrorResponse(BaseModel):
    """Standard error response model."""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="When the error occurred"
    )
