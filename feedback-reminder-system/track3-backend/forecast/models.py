"""
Pydantic models for the Blood Demand Forecasting API.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import re


class ForecastRequest(BaseModel):
    """Request model for single blood type forecasting."""
    
    blood_type: str = Field(
        ..., 
        description="Blood type to forecast (e.g., 'O+', 'A-', 'AB+', etc.)",
        example="O+"
    )
    periods: int = Field(
        default=7,
        ge=1,
        le=365,
        description="Number of future periods to forecast"
    )
    confidence_level: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Confidence level for prediction intervals"
    )
    include_history: bool = Field(
        default=False,
        description="Whether to include recent historical data in response"
    )
    
    @validator('blood_type')
    def validate_blood_type(cls, v):
        """Validate blood type format."""
        # Common blood type patterns: O+, O-, A+, A-, B+, B-, AB+, AB-
        pattern = r'^(A|B|AB|O)[+-]$'
        if not re.match(pattern, v):
            raise ValueError(f"Invalid blood type format: {v}. Expected format like 'O+', 'A-', etc.")
        return v.upper()


class BatchForecastRequest(BaseModel):
    """Request model for batch forecasting multiple blood types."""
    
    blood_types: List[str] = Field(
        ...,
        description="List of blood types to forecast",
        example=["O+", "A+", "B+", "AB+"]
    )
    periods: int = Field(
        default=7,
        ge=1,
        le=365,
        description="Number of future periods to forecast for each type"
    )
    confidence_level: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Confidence level for prediction intervals"
    )
    include_history: bool = Field(
        default=False,
        description="Whether to include recent historical data in response"
    )
    
    @validator('blood_types')
    def validate_blood_types(cls, v):
        """Validate list of blood types."""
        if not v:
            raise ValueError("At least one blood type must be specified")
        
        if len(v) > 8:  # Limit to 8 blood types
            raise ValueError("Maximum 8 blood types allowed in batch request")
        
        pattern = r'^(A|B|AB|O)[+-]$'
        validated_types = []
        
        for blood_type in v:
            if not re.match(pattern, blood_type):
                raise ValueError(f"Invalid blood type format: {blood_type}")
            validated_types.append(blood_type.upper())
        
        # Remove duplicates while preserving order
        seen = set()
        unique_types = []
        for bt in validated_types:
            if bt not in seen:
                seen.add(bt)
                unique_types.append(bt)
        
        return unique_types


class ForecastPoint(BaseModel):
    """Individual forecast point."""
    
    date: str = Field(..., description="Forecast date in YYYY-MM-DD format")
    predicted_demand: float = Field(..., description="Predicted blood demand")
    lower_bound: Optional[float] = Field(None, description="Lower confidence interval")
    upper_bound: Optional[float] = Field(None, description="Upper confidence interval")


class HistoricalPoint(BaseModel):
    """Historical data point."""
    
    date: str = Field(..., description="Historical date in YYYY-MM-DD format")
    actual_demand: float = Field(..., description="Actual blood demand")


class ForecastResponse(BaseModel):
    """Response model for blood demand forecasting."""
    
    blood_type: str = Field(..., description="Blood type that was forecasted")
    forecast_periods: int = Field(..., description="Number of periods forecasted")
    confidence_level: float = Field(..., description="Confidence level used")
    
    forecasts: List[ForecastPoint] = Field(
        ..., 
        description="List of forecast points with predictions and confidence intervals"
    )
    
    historical_data: Optional[List[HistoricalPoint]] = Field(
        None,
        description="Recent historical data (if requested)"
    )
    
    model_info: Dict[str, Any] = Field(
        ...,
        description="Information about the model used for forecasting"
    )
    
    summary_statistics: Dict[str, float] = Field(
        ...,
        description="Summary statistics of the forecast"
    )
    
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
    
    total_blood_types: int = Field(
        ...,
        description="Total number of blood types forecasted"
    )
    
    forecast_periods: int = Field(
        ...,
        description="Number of periods forecasted for each type"
    )
    
    confidence_level: float = Field(
        ...,
        description="Confidence level used for all forecasts"
    )
    
    generated_at: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp when batch forecast was generated"
    )


class ModelInfo(BaseModel):
    """Information about a specific ARIMA model."""
    
    blood_type: str = Field(..., description="Blood type this model predicts")
    model_type: str = Field(..., description="Type of model (e.g., SARIMAX)")
    filename: str = Field(..., description="Model file name")
    
    aic: float = Field(..., description="Akaike Information Criterion")
    bic: float = Field(..., description="Bayesian Information Criterion")
    
    best_order: List[int] = Field(..., description="Best ARIMA order (p,d,q)")
    best_seasonal_order: List[int] = Field(..., description="Best seasonal order (P,D,Q,s)")
    
    training_end_date: str = Field(..., description="Last date in training data")
    trained_on: str = Field(..., description="When the model was trained")
    series_length: int = Field(..., description="Length of training time series")
    
    class Config:
        schema_extra = {
            "example": {
                "blood_type": "O+",
                "model_type": "SARIMAX",
                "filename": "arima_model_O+_20250730_141310.pkl",
                "aic": 5392.92,
                "bic": 5427.3,
                "best_order": [0, 1, 4],
                "best_seasonal_order": [2, 1, 2, 7],
                "training_end_date": "2025-06-29",
                "trained_on": "2025-07-30 14:13:10",
                "series_length": 364
            }
        }


class BloodTypeMetrics(BaseModel):
    """Analytical metrics for a blood type model."""
    
    blood_type: str = Field(..., description="Blood type")
    
    # Model performance metrics
    model_accuracy: Dict[str, float] = Field(
        ...,
        description="Model accuracy metrics (AIC, BIC, etc.)"
    )
    
    # Training data statistics
    training_stats: Dict[str, float] = Field(
        ...,
        description="Statistics from training data"
    )
    
    # Recent performance
    recent_performance: Optional[Dict[str, float]] = Field(
        None,
        description="Recent model performance metrics"
    )
    
    last_updated: datetime = Field(
        default_factory=datetime.now,
        description="When metrics were last calculated"
    )


class ErrorResponse(BaseModel):
    """Standard error response model."""
    
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="When the error occurred"
    )