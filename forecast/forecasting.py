"""
Blood demand forecasting logic using ARIMA models.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from model_loader import ModelManager

logger = logging.getLogger(__name__)


class BloodDemandForecaster:
    """Main forecasting class for blood demand predictions."""
    
    def __init__(self, model_manager: ModelManager):
        """
        Initialize forecaster with model manager.
        
        Args:
            model_manager: ModelManager instance with loaded models
        """
        self.model_manager = model_manager
        
    def forecast_single(
        self, 
        blood_type: str, 
        periods: int, 
        confidence_level: float = 0.95,
        include_history: bool = False
    ) -> Dict[str, Any]:
        """
        Forecast blood demand for a single blood type.
        
        Args:
            blood_type: Blood type to forecast
            periods: Number of periods to forecast
            confidence_level: Confidence level for prediction intervals
            include_history: Whether to include historical data
            
        Returns:
            Dictionary with forecast results
        """
        try:
            # Get model
            model = self.model_manager.get_model(blood_type)
            model_info = self.model_manager.get_model_info(blood_type)
            
            # Generate forecast using get_forecast for SARIMAX models
            if hasattr(model, 'get_forecast'):
                # Use get_forecast for SARIMAX models (more robust)
                forecast_result = model.get_forecast(steps=periods, alpha=1-confidence_level)
                forecasts = forecast_result.predicted_mean
                conf_int = forecast_result.conf_int()
            elif hasattr(model, 'forecast'):
                # Use direct forecast method
                forecast_result = model.forecast(steps=periods, alpha=1-confidence_level)
                
                # Extract forecast components
                if hasattr(forecast_result, 'predicted_mean'):
                    forecasts = forecast_result.predicted_mean
                    conf_int = forecast_result.conf_int()
                else:
                    forecasts = forecast_result
                    conf_int = None
            else:
                raise ValueError(f"Model for {blood_type} does not have forecast capabilities")
            
            # Generate forecast dates
            last_training_date = pd.to_datetime(model_info["training_end_date"])
            forecast_dates = pd.date_range(
                start=last_training_date + timedelta(days=1),
                periods=periods,
                freq='D'
            )
            
            # Prepare forecast points
            forecast_points = []
            for i, date in enumerate(forecast_dates):
                point = {
                    "date": date.strftime("%Y-%m-%d"),
                    "predicted_demand": float(forecasts.iloc[i] if hasattr(forecasts, 'iloc') else forecasts[i])
                }
                
                # Add confidence intervals if available
                if conf_int is not None:
                    point["lower_bound"] = float(conf_int.iloc[i, 0])
                    point["upper_bound"] = float(conf_int.iloc[i, 1])
                
                forecast_points.append(point)
            
            # Calculate summary statistics
            forecast_values = [p["predicted_demand"] for p in forecast_points]
            summary_stats = {
                "mean_forecast": float(np.mean(forecast_values)),
                "min_forecast": float(np.min(forecast_values)),
                "max_forecast": float(np.max(forecast_values)),
                "std_forecast": float(np.std(forecast_values)),
                "total_predicted_demand": float(np.sum(forecast_values))
            }
            
            # Prepare model info for response
            response_model_info = {
                "blood_type": model_info["blood_type"],
                "model_type": model_info["model_type"],
                "aic": model_info["aic"],
                "bic": model_info["bic"],
                "training_end_date": model_info["training_end_date"],
                "series_length": model_info["series_length"]
            }
            
            result = {
                "blood_type": blood_type,
                "forecast_periods": periods,
                "confidence_level": confidence_level,
                "forecasts": forecast_points,
                "model_info": response_model_info,
                "summary_statistics": summary_stats,
                "generated_at": datetime.now()
            }
            
            # Add historical data if requested
            if include_history:
                historical_data = self._get_historical_data(blood_type, periods=min(30, periods*2))
                result["historical_data"] = historical_data
            
            return result
            
        except Exception as e:
            logger.error(f"Forecasting error for {blood_type}: {str(e)}")
            raise ValueError(f"Failed to forecast for {blood_type}: {str(e)}")
    
    def forecast_batch(
        self,
        blood_types: List[str],
        periods: int,
        confidence_level: float = 0.95,
        include_history: bool = False
    ) -> Dict[str, Dict[str, Any]]:
        """
        Forecast blood demand for multiple blood types.
        
        Args:
            blood_types: List of blood types to forecast
            periods: Number of periods to forecast
            confidence_level: Confidence level for prediction intervals
            include_history: Whether to include historical data
            
        Returns:
            Dictionary of forecast results keyed by blood type
        """
        results = {}
        errors = []
        
        for blood_type in blood_types:
            try:
                result = self.forecast_single(
                    blood_type=blood_type,
                    periods=periods,
                    confidence_level=confidence_level,
                    include_history=include_history
                )
                results[blood_type] = result
                
            except Exception as e:
                error_msg = f"Failed to forecast {blood_type}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        if not results and errors:
            raise ValueError(f"All forecasts failed. Errors: {'; '.join(errors)}")
        
        if errors:
            logger.warning(f"Some forecasts failed: {'; '.join(errors)}")
        
        return results
    
    def get_model_metrics(self, blood_type: str) -> Dict[str, Any]:
        """
        Get analytical metrics for a specific blood type model.
        
        Args:
            blood_type: Blood type to get metrics for
            
        Returns:
            Dictionary with model metrics
        """
        try:
            model = self.model_manager.get_model(blood_type)
            model_info = self.model_manager.get_model_info(blood_type)
            
            # Model accuracy metrics
            model_accuracy = {
                "aic": model_info["aic"],
                "bic": model_info["bic"],
                "log_likelihood": getattr(model, 'llf', None)
            }
            
            # Training data statistics
            training_stats = {
                "series_length": model_info["series_length"],
                "training_end_date": model_info["training_end_date"],
                "model_order": model_info["best_order"],
                "seasonal_order": model_info["best_seasonal_order"]
            }
            
            # Try to get additional model statistics if available
            if hasattr(model, 'resid'):
                residuals = model.resid
                training_stats.update({
                    "residual_mean": float(np.mean(residuals)),
                    "residual_std": float(np.std(residuals)),
                    "residual_skewness": float(pd.Series(residuals).skew()),
                    "residual_kurtosis": float(pd.Series(residuals).kurtosis())
                })
            
            return {
                "blood_type": blood_type,
                "model_accuracy": model_accuracy,
                "training_stats": training_stats,
                "last_updated": datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error getting metrics for {blood_type}: {str(e)}")
            raise ValueError(f"Failed to get metrics for {blood_type}: {str(e)}")
    
    def _get_historical_data(self, blood_type: str, periods: int = 30) -> List[Dict[str, Any]]:
        """
        Get historical data for a blood type (placeholder implementation).
        
        In a real implementation, this would fetch actual historical data
        from your database or data source.
        
        Args:
            blood_type: Blood type to get historical data for
            periods: Number of historical periods to retrieve
            
        Returns:
            List of historical data points
        """
        try:
            model_info = self.model_manager.get_model_info(blood_type)
            training_end_date = pd.to_datetime(model_info["training_end_date"])
            
            # Generate placeholder historical dates
            historical_dates = pd.date_range(
                end=training_end_date,
                periods=periods,
                freq='D'
            )
            
            # Placeholder: In real implementation, fetch actual historical data
            # For now, generate synthetic historical data based on model characteristics
            np.random.seed(42)  # For reproducible results
            base_demand = 50 + np.random.normal(0, 10, periods)
            
            historical_points = []
            for i, date in enumerate(historical_dates):
                historical_points.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "actual_demand": max(0, float(base_demand[i]))  # Ensure non-negative
                })
            
            return historical_points
            
        except Exception as e:
            logger.warning(f"Could not retrieve historical data for {blood_type}: {str(e)}")
            return []
    
    def validate_forecast_request(
        self, 
        blood_type: str, 
        periods: int, 
        confidence_level: float
    ) -> None:
        """
        Validate forecast request parameters.
        
        Args:
            blood_type: Blood type to validate
            periods: Number of periods to validate
            confidence_level: Confidence level to validate
            
        Raises:
            ValueError: If validation fails
        """
        # Check if model exists
        if not self.model_manager.is_model_available(blood_type):
            available = self.model_manager.get_available_blood_types()
            raise ValueError(f"Model for blood type '{blood_type}' not available. Available: {available}")
        
        # Validate periods
        if periods < 1 or periods > 365:
            raise ValueError("Forecast periods must be between 1 and 365")
        
        # Validate confidence level
        if confidence_level < 0.5 or confidence_level > 0.99:
            raise ValueError("Confidence level must be between 0.5 and 0.99")
    
    def get_forecaster_status(self) -> Dict[str, Any]:
        """Get status information about the forecaster."""
        return {
            "models_loaded": len(self.model_manager.models),
            "available_blood_types": self.model_manager.get_available_blood_types(),
            "model_manager_status": "active",
            "last_model_update": self.model_manager.last_updated
        }