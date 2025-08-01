"""
Pydantic models for clinical data and predictions.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from enum import Enum


class EligibilityStatus(str, Enum):
    """Donor eligibility status enum."""
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    TEMPORARILY_DEFERRED = "temporarily_deferred"
    PERMANENTLY_DEFERRED = "permanently_deferred"
    PENDING_REVIEW = "pending_review"


class DonorClinicalData(BaseModel):
    """Individual donor clinical data."""
    
    donor_id: str = Field(..., description="Unique identifier for the donor")
    eligibility_status: EligibilityStatus = Field(..., description="Donor eligibility status")
    blood_type: str = Field(..., description="Blood type (e.g., 'O+', 'A-', etc.)")
    medical_history: Optional[str] = Field(None, description="Relevant medical history")
    screening_results: Optional[Dict[str, Any]] = Field(None, description="Health screening results")
    last_updated: datetime = Field(..., description="Last update timestamp")
    
    @validator('blood_type')
    def validate_blood_type(cls, v):
        """Validate blood type format."""
        import re
        pattern = r'^(A|B|AB|O)[+-]$'
        if not re.match(pattern, v):
            raise ValueError(f"Invalid blood type format: {v}")
        return v.upper()


class ClinicalDataBatch(BaseModel):
    """Batch of clinical data for multiple donors."""
    
    donors: List[DonorClinicalData] = Field(..., description="List of donor clinical data")
    collection_timestamp: datetime = Field(
        default_factory=datetime.now,
        description="When this batch was collected"
    )
    
    @validator('donors')
    def validate_donors(cls, v):
        """Validate donor list."""
        if not v:
            raise ValueError("At least one donor record must be provided")
        if len(v) > 1000:
            raise ValueError("Maximum 1000 donor records per batch")
        return v


class ClinicalPredictionRequest(BaseModel):
    """Request for clinical data-based predictions."""
    
    clinical_data: ClinicalDataBatch = Field(..., description="Clinical data batch")
    prediction_horizon_days: int = Field(
        default=7,
        ge=1,
        le=90,
        description="Number of days to predict ahead"
    )
    include_time_series_forecast: bool = Field(
        default=True,
        description="Whether to combine with ARIMA time-series forecasts"
    )
    confidence_level: float = Field(
        default=0.95,
        ge=0.5,
        le=0.99,
        description="Confidence level for predictions"
    )


class BloodSupplyMetrics(BaseModel):
    """Blood supply metrics from clinical data."""
    
    blood_type: str = Field(..., description="Blood type")
    total_donors: int = Field(..., description="Total number of donors")
    eligible_donors: int = Field(..., description="Number of eligible donors")
    eligibility_rate: float = Field(..., description="Percentage of eligible donors")
    
    # Eligibility breakdown
    eligibility_breakdown: Dict[str, int] = Field(
        ...,
        description="Count by eligibility status"
    )
    
    # Predicted supply
    predicted_daily_supply: float = Field(..., description="Predicted daily supply")
    predicted_weekly_supply: float = Field(..., description="Predicted weekly supply")
    
    # Risk factors
    risk_factors: List[str] = Field(
        default_factory=list,
        description="Identified risk factors affecting supply"
    )


class ClinicalPredictionResponse(BaseModel):
    """Response for clinical data-based predictions."""
    
    prediction_date: datetime = Field(
        default_factory=datetime.now,
        description="When prediction was made"
    )
    
    prediction_horizon_days: int = Field(..., description="Prediction horizon")
    total_donors_analyzed: int = Field(..., description="Total donors in analysis")
    
    # Supply metrics by blood type
    blood_type_metrics: Dict[str, BloodSupplyMetrics] = Field(
        ...,
        description="Metrics for each blood type"
    )
    
    # Overall supply prediction
    overall_supply_forecast: Dict[str, float] = Field(
        ...,
        description="Overall supply forecast metrics"
    )
    
    # Combined with time-series (if enabled)
    time_series_integration: Optional[Dict[str, Any]] = Field(
        None,
        description="Integration with ARIMA forecasts"
    )
    
    # Risk assessment
    supply_risk_assessment: Dict[str, str] = Field(
        ...,
        description="Risk level for each blood type (LOW/MEDIUM/HIGH)"
    )
    
    # Recommendations
    recommendations: List[str] = Field(
        default_factory=list,
        description="Action recommendations based on analysis"
    )


class DonorEligibilityPrediction(BaseModel):
    """Prediction for individual donor eligibility."""
    
    donor_id: str = Field(..., description="Donor ID")
    current_status: EligibilityStatus = Field(..., description="Current eligibility status")
    predicted_status: EligibilityStatus = Field(..., description="Predicted future status")
    confidence_score: float = Field(..., description="Confidence in prediction (0-1)")
    
    risk_factors: List[str] = Field(
        default_factory=list,
        description="Risk factors affecting eligibility"
    )
    
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for the donor"
    )


class DonorEligibilityBatchPrediction(BaseModel):
    """Batch eligibility predictions."""
    
    predictions: List[DonorEligibilityPrediction] = Field(
        ...,
        description="Individual donor predictions"
    )
    
    summary_statistics: Dict[str, Any] = Field(
        ...,
        description="Summary statistics for the batch"
    )
    
    generated_at: datetime = Field(
        default_factory=datetime.now,
        description="When predictions were generated"
    )


class ClinicalDataSummary(BaseModel):
    """Summary of clinical data analysis."""
    
    total_donors: int = Field(..., description="Total number of donors")
    data_collection_period: Dict[str, str] = Field(
        ...,
        description="Start and end dates of data collection"
    )
    
    # Blood type distribution
    blood_type_distribution: Dict[str, int] = Field(
        ...,
        description="Count of donors by blood type"
    )
    
    # Eligibility distribution
    eligibility_distribution: Dict[str, int] = Field(
        ...,
        description="Count of donors by eligibility status"
    )
    
    # Data quality metrics
    data_quality_metrics: Dict[str, float] = Field(
        ...,
        description="Data completeness and quality indicators"
    )
    
    # Trends
    eligibility_trends: Optional[Dict[str, Any]] = Field(
        None,
        description="Trends in eligibility over time"
    )


class ClinicalInsight(BaseModel):
    """Clinical insights and recommendations."""
    
    insight_type: str = Field(..., description="Type of insight")
    blood_type: Optional[str] = Field(None, description="Related blood type if applicable")
    severity: str = Field(..., description="Severity level (LOW/MEDIUM/HIGH)")
    description: str = Field(..., description="Detailed description")
    recommendation: str = Field(..., description="Recommended action")
    impact_estimate: Optional[float] = Field(None, description="Estimated impact on supply")


class ClinicalAnalysisReport(BaseModel):
    """Comprehensive clinical analysis report."""
    
    report_id: str = Field(..., description="Unique report identifier")
    generated_at: datetime = Field(default_factory=datetime.now)
    
    # Data summary
    data_summary: ClinicalDataSummary = Field(..., description="Summary of analyzed data")
    
    # Supply predictions
    supply_predictions: ClinicalPredictionResponse = Field(
        ...,
        description="Supply predictions based on clinical data"
    )
    
    # Key insights
    key_insights: List[ClinicalInsight] = Field(
        ...,
        description="Key insights from the analysis"
    )
    
    # Risk assessment
    overall_risk_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Overall risk score for blood supply"
    )
    
    # Strategic recommendations
    strategic_recommendations: List[str] = Field(
        ...,
        description="Strategic recommendations for blood collection"
    )