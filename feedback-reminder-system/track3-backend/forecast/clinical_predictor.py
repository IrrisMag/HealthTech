"""
Clinical data analysis and prediction engine for blood supply forecasting.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from collections import defaultdict
import uuid

from clinical_models import (
    ClinicalDataBatch, ClinicalPredictionResponse, BloodSupplyMetrics,
    DonorEligibilityPrediction, ClinicalInsight, ClinicalAnalysisReport,
    ClinicalDataSummary, EligibilityStatus
)
from forecasting import BloodDemandForecaster

logger = logging.getLogger(__name__)


class ClinicalPredictor:
    """Clinical data analysis and prediction engine."""
    
    def __init__(self, demand_forecaster: Optional[BloodDemandForecaster] = None):
        """
        Initialize clinical predictor.
        
        Args:
            demand_forecaster: Optional demand forecaster for integration
        """
        self.demand_forecaster = demand_forecaster
        
        # Clinical prediction parameters
        self.donation_frequency_days = 56  # Standard donation interval
        self.seasonal_factors = {
            'winter': 0.85,  # Reduced donations in winter
            'spring': 1.1,   # Increased donations in spring
            'summer': 0.9,   # Reduced donations in summer (vacations)
            'fall': 1.05     # Increased donations in fall
        }
        
    def analyze_clinical_data(self, clinical_data: ClinicalDataBatch) -> ClinicalDataSummary:
        """
        Analyze clinical data and provide summary statistics.
        
        Args:
            clinical_data: Batch of clinical data
            
        Returns:
            Summary of clinical data analysis
        """
        donors = clinical_data.donors
        
        # Basic counts
        total_donors = len(donors)
        
        # Blood type distribution
        blood_type_counts = defaultdict(int)
        for donor in donors:
            blood_type_counts[donor.blood_type] += 1
        
        # Eligibility distribution
        eligibility_counts = defaultdict(int)
        for donor in donors:
            eligibility_counts[donor.eligibility_status.value] += 1
        
        # Data collection period
        if donors:
            dates = [donor.last_updated for donor in donors]
            period = {
                'start': min(dates).isoformat(),
                'end': max(dates).isoformat()
            }
        else:
            period = {'start': '', 'end': ''}
        
        # Data quality metrics
        complete_records = sum(1 for d in donors if d.medical_history and d.screening_results)
        data_quality = {
            'completeness_rate': complete_records / total_donors if total_donors > 0 else 0,
            'missing_medical_history': sum(1 for d in donors if not d.medical_history),
            'missing_screening_results': sum(1 for d in donors if not d.screening_results)
        }
        
        return ClinicalDataSummary(
            total_donors=total_donors,
            data_collection_period=period,
            blood_type_distribution=dict(blood_type_counts),
            eligibility_distribution=dict(eligibility_counts),
            data_quality_metrics=data_quality
        )
    
    def predict_blood_supply(
        self,
        clinical_data: ClinicalDataBatch,
        prediction_horizon_days: int = 7,
        confidence_level: float = 0.95
    ) -> ClinicalPredictionResponse:
        """
        Predict blood supply based on clinical data.
        
        Args:
            clinical_data: Clinical data batch
            prediction_horizon_days: Number of days to predict
            confidence_level: Confidence level for predictions
            
        Returns:
            Clinical prediction response
        """
        donors = clinical_data.donors
        
        # Analyze by blood type
        blood_type_metrics = {}
        overall_supply = {
            'total_predicted_daily': 0,
            'total_predicted_weekly': 0,
            'average_eligibility_rate': 0
        }
        
        # Group donors by blood type
        donors_by_type = defaultdict(list)
        for donor in donors:
            donors_by_type[donor.blood_type].append(donor)
        
        eligibility_rates = []
        
        for blood_type, type_donors in donors_by_type.items():
            metrics = self._analyze_blood_type_supply(
                blood_type, type_donors, prediction_horizon_days
            )
            blood_type_metrics[blood_type] = metrics
            
            # Add to overall supply
            overall_supply['total_predicted_daily'] += metrics.predicted_daily_supply
            overall_supply['total_predicted_weekly'] += metrics.predicted_weekly_supply
            eligibility_rates.append(metrics.eligibility_rate)
        
        # Calculate average eligibility rate
        if eligibility_rates:
            overall_supply['average_eligibility_rate'] = np.mean(eligibility_rates)
        
        # Risk assessment
        risk_assessment = self._assess_supply_risk(blood_type_metrics)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(blood_type_metrics, risk_assessment)
        
        return ClinicalPredictionResponse(
            prediction_horizon_days=prediction_horizon_days,
            total_donors_analyzed=len(donors),
            blood_type_metrics=blood_type_metrics,
            overall_supply_forecast=overall_supply,
            supply_risk_assessment=risk_assessment,
            recommendations=recommendations
        )
    
    def _analyze_blood_type_supply(
        self,
        blood_type: str,
        donors: List,
        prediction_horizon: int
    ) -> BloodSupplyMetrics:
        """Analyze supply metrics for a specific blood type."""
        
        total_donors = len(donors)
        
        # Count by eligibility status
        eligibility_breakdown = defaultdict(int)
        eligible_count = 0
        
        for donor in donors:
            status = donor.eligibility_status.value
            eligibility_breakdown[status] += 1
            if donor.eligibility_status == EligibilityStatus.ELIGIBLE:
                eligible_count += 1
        
        # Calculate eligibility rate
        eligibility_rate = (eligible_count / total_donors) if total_donors > 0 else 0
        
        # Predict daily supply based on donation frequency and eligibility
        # Assume eligible donors donate every 56 days on average
        daily_donation_probability = eligibility_rate / self.donation_frequency_days
        predicted_daily_supply = total_donors * daily_donation_probability
        
        # Apply seasonal factors (simplified - would need actual date analysis)
        current_season = self._get_current_season()
        seasonal_factor = self.seasonal_factors.get(current_season, 1.0)
        predicted_daily_supply *= seasonal_factor
        
        predicted_weekly_supply = predicted_daily_supply * 7
        
        # Identify risk factors
        risk_factors = []
        if eligibility_rate < 0.7:
            risk_factors.append("Low eligibility rate")
        if total_donors < 50:
            risk_factors.append("Small donor pool")
        if eligibility_breakdown.get('temporarily_deferred', 0) > total_donors * 0.2:
            risk_factors.append("High temporary deferral rate")
        
        return BloodSupplyMetrics(
            blood_type=blood_type,
            total_donors=total_donors,
            eligible_donors=eligible_count,
            eligibility_rate=eligibility_rate,
            eligibility_breakdown=dict(eligibility_breakdown),
            predicted_daily_supply=predicted_daily_supply,
            predicted_weekly_supply=predicted_weekly_supply,
            risk_factors=risk_factors
        )
    
    def _assess_supply_risk(self, metrics: Dict[str, BloodSupplyMetrics]) -> Dict[str, str]:
        """Assess supply risk for each blood type."""
        
        risk_assessment = {}
        
        for blood_type, metric in metrics.items():
            # Risk scoring based on multiple factors
            risk_score = 0
            
            # Factor 1: Eligibility rate
            if metric.eligibility_rate < 0.6:
                risk_score += 3
            elif metric.eligibility_rate < 0.8:
                risk_score += 1
            
            # Factor 2: Donor pool size
            if metric.total_donors < 30:
                risk_score += 3
            elif metric.total_donors < 100:
                risk_score += 1
            
            # Factor 3: Predicted supply vs typical demand (simplified)
            typical_daily_demand = self._get_typical_demand(blood_type)
            supply_demand_ratio = metric.predicted_daily_supply / typical_daily_demand if typical_daily_demand > 0 else 0
            
            if supply_demand_ratio < 0.8:
                risk_score += 3
            elif supply_demand_ratio < 1.2:
                risk_score += 1
            
            # Determine risk level
            if risk_score >= 6:
                risk_level = "HIGH"
            elif risk_score >= 3:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
            
            risk_assessment[blood_type] = risk_level
        
        return risk_assessment
    
    def _generate_recommendations(
        self,
        metrics: Dict[str, BloodSupplyMetrics],
        risk_assessment: Dict[str, str]
    ) -> List[str]:
        """Generate actionable recommendations."""
        
        recommendations = []
        
        # Analyze high-risk blood types
        high_risk_types = [bt for bt, risk in risk_assessment.items() if risk == "HIGH"]
        medium_risk_types = [bt for bt, risk in risk_assessment.items() if risk == "MEDIUM"]
        
        if high_risk_types:
            recommendations.extend([
                f"URGENT: Increase recruitment for {', '.join(high_risk_types)} donors",
                f"Implement targeted campaigns for high-risk blood types",
                "Consider emergency blood sharing agreements"
            ])
        
        if medium_risk_types:
            recommendations.extend([
                f"Monitor supply levels for {', '.join(medium_risk_types)}",
                "Enhance donor retention programs"
            ])
        
        # Low eligibility rate recommendations
        low_eligibility_types = [
            bt for bt, metric in metrics.items()
            if metric.eligibility_rate < 0.7
        ]
        
        if low_eligibility_types:
            recommendations.append(
                f"Review screening criteria for {', '.join(low_eligibility_types)} - high deferral rate detected"
            )
        
        # Small donor pool recommendations
        small_pool_types = [
            bt for bt, metric in metrics.items()
            if metric.total_donors < 50
        ]
        
        if small_pool_types:
            recommendations.append(
                f"Expand donor recruitment for {', '.join(small_pool_types)} - limited donor pool"
            )
        
        return recommendations
    
    def integrate_with_demand_forecast(
        self,
        clinical_prediction: ClinicalPredictionResponse,
        prediction_horizon: int = 7
    ) -> Dict[str, Any]:
        """
        Integrate clinical supply predictions with ARIMA demand forecasts.
        
        Args:
            clinical_prediction: Clinical prediction results
            prediction_horizon: Forecast horizon in days
            
        Returns:
            Integrated supply-demand analysis
        """
        if not self.demand_forecaster:
            return {"error": "Demand forecaster not available"}
        
        integration_results = {}
        
        for blood_type, supply_metrics in clinical_prediction.blood_type_metrics.items():
            try:
                # Get demand forecast
                demand_forecast = self.demand_forecaster.forecast_single(
                    blood_type=blood_type,
                    periods=prediction_horizon,
                    confidence_level=0.95,
                    include_history=False
                )
                
                # Calculate supply-demand balance
                predicted_supply = supply_metrics.predicted_daily_supply * prediction_horizon
                predicted_demand = demand_forecast['summary_statistics']['total_predicted_demand']
                
                balance_ratio = predicted_supply / predicted_demand if predicted_demand > 0 else 0
                
                # Determine balance status
                if balance_ratio < 0.8:
                    balance_status = "SHORTAGE_RISK"
                elif balance_ratio > 1.5:
                    balance_status = "OVERSUPPLY"
                else:
                    balance_status = "BALANCED"
                
                integration_results[blood_type] = {
                    'predicted_supply': predicted_supply,
                    'predicted_demand': predicted_demand,
                    'balance_ratio': balance_ratio,
                    'balance_status': balance_status,
                    'demand_forecast_summary': demand_forecast['summary_statistics']
                }
                
            except Exception as e:
                logger.warning(f"Could not integrate demand forecast for {blood_type}: {str(e)}")
                integration_results[blood_type] = {
                    'error': f"Demand forecast unavailable: {str(e)}"
                }
        
        return integration_results
    
    def _get_typical_demand(self, blood_type: str) -> float:
        """Get typical daily demand for a blood type (simplified)."""
        # This would typically come from historical data
        # Using simplified estimates based on blood type prevalence
        demand_estimates = {
            'O+': 150, 'O-': 80, 'A+': 120, 'A-': 60,
            'B+': 90, 'B-': 40, 'AB+': 50, 'AB-': 25
        }
        return demand_estimates.get(blood_type, 75)
    
    def _get_current_season(self) -> str:
        """Get current season (simplified)."""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'fall'
    
    def generate_clinical_report(
        self,
        clinical_data: ClinicalDataBatch,
        prediction_horizon: int = 14
    ) -> ClinicalAnalysisReport:
        """
        Generate comprehensive clinical analysis report.
        
        Args:
            clinical_data: Clinical data batch
            prediction_horizon: Prediction horizon in days
            
        Returns:
            Comprehensive clinical analysis report
        """
        # Analyze clinical data
        data_summary = self.analyze_clinical_data(clinical_data)
        
        # Generate supply predictions
        supply_predictions = self.predict_blood_supply(
            clinical_data, prediction_horizon
        )
        
        # Integrate with demand forecasts if available
        if self.demand_forecaster:
            integration = self.integrate_with_demand_forecast(
                supply_predictions, prediction_horizon
            )
            supply_predictions.time_series_integration = integration
        
        # Generate insights
        insights = self._generate_clinical_insights(data_summary, supply_predictions)
        
        # Calculate overall risk score
        risk_scores = []
        for blood_type, risk_level in supply_predictions.supply_risk_assessment.items():
            if risk_level == "HIGH":
                risk_scores.append(0.8)
            elif risk_level == "MEDIUM":
                risk_scores.append(0.5)
            else:
                risk_scores.append(0.2)
        
        overall_risk = np.mean(risk_scores) if risk_scores else 0.0
        
        # Strategic recommendations
        strategic_recommendations = self._generate_strategic_recommendations(
            supply_predictions, integration if self.demand_forecaster else None
        )
        
        return ClinicalAnalysisReport(
            report_id=str(uuid.uuid4()),
            data_summary=data_summary,
            supply_predictions=supply_predictions,
            key_insights=insights,
            overall_risk_score=overall_risk,
            strategic_recommendations=strategic_recommendations
        )
    
    def _generate_clinical_insights(
        self,
        data_summary: ClinicalDataSummary,
        supply_predictions: ClinicalPredictionResponse
    ) -> List[ClinicalInsight]:
        """Generate clinical insights from analysis."""
        
        insights = []
        
        # Overall eligibility insight
        avg_eligibility = supply_predictions.overall_supply_forecast['average_eligibility_rate']
        if avg_eligibility < 0.7:
            insights.append(ClinicalInsight(
                insight_type="eligibility_concern",
                severity="HIGH",
                description=f"Overall donor eligibility rate is {avg_eligibility:.1%}, below recommended 70%",
                recommendation="Review screening criteria and implement donor health improvement programs",
                impact_estimate=0.3
            ))
        
        # Blood type specific insights
        for blood_type, metrics in supply_predictions.blood_type_metrics.items():
            if len(metrics.risk_factors) > 0:
                insights.append(ClinicalInsight(
                    insight_type="blood_type_risk",
                    blood_type=blood_type,
                    severity="MEDIUM" if len(metrics.risk_factors) <= 2 else "HIGH",
                    description=f"{blood_type}: {', '.join(metrics.risk_factors)}",
                    recommendation=f"Focus recruitment efforts on {blood_type} donors",
                    impact_estimate=metrics.predicted_daily_supply / 100
                ))
        
        return insights
    
    def _generate_strategic_recommendations(
        self,
        supply_predictions: ClinicalPredictionResponse,
        demand_integration: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """Generate strategic recommendations."""
        
        recommendations = []
        
        # Add general recommendations from supply predictions
        recommendations.extend(supply_predictions.recommendations)
        
        # Add demand-supply integration recommendations
        if demand_integration:
            shortage_types = [
                bt for bt, data in demand_integration.items()
                if isinstance(data, dict) and data.get('balance_status') == 'SHORTAGE_RISK'
            ]
            
            if shortage_types:
                recommendations.append(
                    f"CRITICAL: Address predicted shortages in {', '.join(shortage_types)}"
                )
        
        # Add strategic recommendations
        recommendations.extend([
            "Implement predictive analytics dashboard for real-time monitoring",
            "Establish donor pipeline management system",
            "Create emergency response protocols for supply shortages"
        ])
        
        return recommendations