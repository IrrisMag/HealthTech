"""
FastAPI application for blood demand forecasting using ARIMA models.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import logging
import os
import sys
import httpx
from datetime import datetime, date

from models import (
    ForecastRequest,
    ForecastResponse,
    ModelInfo,
    BloodTypeMetrics,
    BatchForecastRequest,
    BatchForecastResponse
)
from clinical_models import (
    ClinicalDataBatch,
    ClinicalPredictionRequest,
    ClinicalPredictionResponse,
    ClinicalAnalysisReport,
    ClinicalDataSummary,
    DonorClinicalData
)
from model_loader import ModelManager
from forecasting import BloodDemandForecaster
from clinical_predictor import ClinicalPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Blood Demand Forecasting API",
    description="API for forecasting blood demand using ARIMA models based on clinical and operational data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
model_manager = None
forecaster = None
clinical_predictor = None

@app.on_event("startup")
async def startup_event():
    """Initialize models and forecaster on startup."""
    global model_manager, forecaster, clinical_predictor
    try:
        logger.info("Loading ARIMA models...")
        model_manager = ModelManager("models/model_index.json")
        model_manager.load_models()
        
        forecaster = BloodDemandForecaster(model_manager)
        clinical_predictor = ClinicalPredictor(forecaster)
        
        logger.info(f"Successfully loaded {len(model_manager.models)} models")
        logger.info("Clinical predictor initialized")
        
    except Exception as e:
        logger.error(f"Failed to initialize models: {str(e)}")
        raise


@app.get("/", tags=["General"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Blood Demand Forecasting API",
        "version": "1.0.0",
        "description": "Predict future blood demand based on clinical and operational data",
        "endpoints": {
            "forecast": "/forecast - Single blood type forecast",
            "batch_forecast": "/batch-forecast - Multiple blood types forecast",
            "models": "/models - Available models information",
            "health": "/health - API health check"
        }
    }


@app.get("/health", tags=["General"])
async def health_check():
    """Health check endpoint."""
    global model_manager
    
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(model_manager.models),
        "available_blood_types": list(model_manager.models.keys())
    }


@app.get("/models", response_model=List[ModelInfo], tags=["Models"])
async def get_models():
    """Get information about all available models."""
    global model_manager
    
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return [
        ModelInfo(
            blood_type=info["blood_type"],
            model_type=info["model_type"],
            filename=info["filename"],
            aic=info["aic"],
            bic=info["bic"],
            best_order=info["best_order"],
            best_seasonal_order=info["best_seasonal_order"],
            training_end_date=info["training_end_date"],
            trained_on=info["trained_on"],
            series_length=info["series_length"]
        )
        for info in model_manager.model_info.values()
    ]


@app.get("/models/{blood_type}", response_model=ModelInfo, tags=["Models"])
async def get_model_info(blood_type: str):
    """Get information about a specific blood type model."""
    global model_manager
    
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    if blood_type not in model_manager.models:
        raise HTTPException(
            status_code=404, 
            detail=f"Model for blood type '{blood_type}' not found. Available: {list(model_manager.models.keys())}"
        )
    
    info = model_manager.model_info[blood_type]
    return ModelInfo(
        blood_type=info["blood_type"],
        model_type=info["model_type"],
        filename=info["filename"],
        aic=info["aic"],
        bic=info["bic"],
        best_order=info["best_order"],
        best_seasonal_order=info["best_seasonal_order"],
        training_end_date=info["training_end_date"],
        trained_on=info["trained_on"],
        series_length=info["series_length"]
    )


@app.post("/forecast", response_model=ForecastResponse, tags=["Forecasting"])
async def forecast_blood_demand(request: ForecastRequest):
    """
    Forecast blood demand for a specific blood type.
    
    - **blood_type**: Blood type to forecast (e.g., 'O+', 'A-', 'AB+', etc.)
    - **periods**: Number of future periods to forecast
    - **confidence_level**: Confidence level for prediction intervals (0.0-1.0)
    - **include_history**: Whether to include recent historical data in response
    """
    global forecaster
    
    if forecaster is None:
        raise HTTPException(status_code=503, detail="Forecaster not initialized")
    
    try:
        result = forecaster.forecast_single(
            blood_type=request.blood_type,
            periods=request.periods,
            confidence_level=request.confidence_level,
            include_history=request.include_history
        )
        
        return ForecastResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Forecasting error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal forecasting error")


@app.post("/batch-forecast", response_model=BatchForecastResponse, tags=["Forecasting"])
async def batch_forecast_blood_demand(request: BatchForecastRequest):
    """
    Forecast blood demand for multiple blood types at once.
    
    - **blood_types**: List of blood types to forecast
    - **periods**: Number of future periods to forecast for each type
    - **confidence_level**: Confidence level for prediction intervals
    - **include_history**: Whether to include recent historical data
    """
    global forecaster
    
    if forecaster is None:
        raise HTTPException(status_code=503, detail="Forecaster not initialized")
    
    try:
        results = forecaster.forecast_batch(
            blood_types=request.blood_types,
            periods=request.periods,
            confidence_level=request.confidence_level,
            include_history=request.include_history
        )
        
        return BatchForecastResponse(
            forecasts=results,
            total_blood_types=len(results),
            forecast_periods=request.periods,
            confidence_level=request.confidence_level,
            generated_at=datetime.now()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Batch forecasting error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal forecasting error")


@app.get("/forecast/{blood_type}", response_model=ForecastResponse, tags=["Forecasting"])
async def quick_forecast(
    blood_type: str,
    periods: int = Query(default=7, ge=1, le=365, description="Number of periods to forecast"),
    confidence_level: float = Query(default=0.95, ge=0.5, le=0.99, description="Confidence level"),
    include_history: bool = Query(default=False, description="Include recent historical data")
):
    """
    Quick forecast endpoint via GET request.
    
    Convenient endpoint for simple forecasting without POST body.
    """
    request = ForecastRequest(
        blood_type=blood_type,
        periods=periods,
        confidence_level=confidence_level,
        include_history=include_history
    )
    
    return await forecast_blood_demand(request)


@app.get("/metrics/{blood_type}", response_model=BloodTypeMetrics, tags=["Analytics"])
async def get_blood_type_metrics(blood_type: str):
    """Get analytical metrics for a specific blood type model."""
    global forecaster
    
    if forecaster is None:
        raise HTTPException(status_code=503, detail="Forecaster not initialized")
    
    try:
        metrics = forecaster.get_model_metrics(blood_type)
        return BloodTypeMetrics(**metrics)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Metrics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal metrics error")


@app.get("/available-blood-types", tags=["General"])
async def get_available_blood_types():
    """Get list of available blood types for forecasting."""
    global model_manager
    
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    return {
        "blood_types": sorted(list(model_manager.models.keys())),
        "total_models": len(model_manager.models),
        "last_updated": model_manager.last_updated
    }


# =============================================================================
# CLINICAL DATA ENDPOINTS
# =============================================================================

@app.post("/clinical/analyze", response_model=ClinicalDataSummary, tags=["Clinical Analysis"])
async def analyze_clinical_data(clinical_data: ClinicalDataBatch):
    """
    Analyze clinical donor data and provide summary statistics.
    
    - **donors**: List of donor clinical data
    - **collection_timestamp**: When this batch was collected
    
    Returns summary including:
    - Blood type distribution
    - Eligibility status distribution  
    - Data quality metrics
    """
    global clinical_predictor
    
    if clinical_predictor is None:
        raise HTTPException(status_code=503, detail="Clinical predictor not initialized")
    
    try:
        summary = clinical_predictor.analyze_clinical_data(clinical_data)
        return summary
        
    except Exception as e:
        logger.error(f"Clinical data analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/clinical/predict-supply", response_model=ClinicalPredictionResponse, tags=["Clinical Predictions"])
async def predict_blood_supply(request: ClinicalPredictionRequest):
    """
    Predict blood supply based on clinical donor data.
    
    - **clinical_data**: Batch of clinical donor data
    - **prediction_horizon_days**: Number of days to predict (1-90)
    - **include_time_series_forecast**: Whether to integrate with ARIMA forecasts
    - **confidence_level**: Confidence level for predictions
    
    Returns detailed supply predictions including:
    - Supply metrics by blood type
    - Risk assessment
    - Integration with demand forecasts (if enabled)
    - Actionable recommendations
    """
    global clinical_predictor
    
    if clinical_predictor is None:
        raise HTTPException(status_code=503, detail="Clinical predictor not initialized")
    
    try:
        # Generate supply prediction
        supply_prediction = clinical_predictor.predict_blood_supply(
            clinical_data=request.clinical_data,
            prediction_horizon_days=request.prediction_horizon_days,
            confidence_level=request.confidence_level
        )
        
        # Integrate with time-series forecasts if requested
        if request.include_time_series_forecast and clinical_predictor.demand_forecaster:
            integration = clinical_predictor.integrate_with_demand_forecast(
                supply_prediction,
                request.prediction_horizon_days
            )
            supply_prediction.time_series_integration = integration
        
        return supply_prediction
        
    except Exception as e:
        logger.error(f"Clinical supply prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/clinical/comprehensive-report", response_model=ClinicalAnalysisReport, tags=["Clinical Analysis"])
async def generate_comprehensive_report(
    clinical_data: ClinicalDataBatch,
    prediction_horizon: int = Query(default=14, ge=1, le=90, description="Prediction horizon in days")
):
    """
    Generate a comprehensive clinical analysis report.
    
    - **clinical_data**: Batch of clinical donor data
    - **prediction_horizon**: Number of days for predictions (default: 14)
    
    Returns a comprehensive report including:
    - Clinical data summary and analysis
    - Supply predictions with risk assessment
    - Integration with demand forecasts
    - Key insights and recommendations
    - Overall risk scoring
    - Strategic recommendations
    """
    global clinical_predictor
    
    if clinical_predictor is None:
        raise HTTPException(status_code=503, detail="Clinical predictor not initialized")
    
    try:
        report = clinical_predictor.generate_clinical_report(
            clinical_data=clinical_data,
            prediction_horizon=prediction_horizon
        )
        
        return report
        
    except Exception as e:
        logger.error(f"Clinical report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@app.post("/clinical/supply-demand-analysis", tags=["Clinical Analysis"])
async def supply_demand_analysis(
    clinical_data: ClinicalDataBatch,
    prediction_days: int = Query(default=7, ge=1, le=30, description="Analysis period in days")
):
    """
    Analyze supply-demand balance using clinical data and ARIMA forecasts.
    
    - **clinical_data**: Clinical donor data
    - **prediction_days**: Number of days for the analysis
    
    Returns integrated analysis showing:
    - Predicted supply from clinical data
    - Predicted demand from ARIMA models
    - Supply-demand balance assessment
    - Risk levels and recommendations
    """
    global clinical_predictor
    
    if clinical_predictor is None:
        raise HTTPException(status_code=503, detail="Clinical predictor not initialized")
    
    if clinical_predictor.demand_forecaster is None:
        raise HTTPException(status_code=503, detail="Demand forecaster not available")
    
    try:
        # Get supply prediction
        supply_prediction = clinical_predictor.predict_blood_supply(
            clinical_data=clinical_data,
            prediction_horizon_days=prediction_days
        )
        
        # Integrate with demand forecasts
        integration = clinical_predictor.integrate_with_demand_forecast(
            supply_prediction,
            prediction_days
        )
        
        # Create comprehensive analysis
        analysis = {
            "analysis_period_days": prediction_days,
            "total_donors_analyzed": len(clinical_data.donors),
            "supply_predictions": supply_prediction,
            "demand_integration": integration,
            "generated_at": datetime.now()
        }
        
        # Add summary insights
        shortage_types = []
        balanced_types = []
        oversupply_types = []
        
        for blood_type, data in integration.items():
            if isinstance(data, dict) and 'balance_status' in data:
                status = data['balance_status']
                if status == 'SHORTAGE_RISK':
                    shortage_types.append(blood_type)
                elif status == 'OVERSUPPLY':
                    oversupply_types.append(blood_type)
                else:
                    balanced_types.append(blood_type)
        
        analysis["summary_insights"] = {
            "shortage_risk_types": shortage_types,
            "balanced_types": balanced_types,
            "oversupply_types": oversupply_types,
            "critical_actions_needed": len(shortage_types) > 0
        }
        
        return analysis
        
    except Exception as e:
        logger.error(f"Supply-demand analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# =============================================================================
# DYNAMIC CLINICAL DATA FORECAST ENDPOINT  
# =============================================================================

@app.post("/forecast/clinical-data", response_model=ClinicalPredictionResponse, tags=["Clinical Forecasting"])
async def forecast_with_clinical_data(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=50, ge=1, le=1000, description="Maximum number of records to fetch"),
    blood_type: Optional[str] = Query(default=None, description="Filter by blood type (e.g., 'A+', 'O-')"),
    eligibility_status: Optional[bool] = Query(default=None, description="Filter by eligibility status"),
    prediction_horizon_days: int = Query(default=7, ge=1, le=90, description="Number of days to predict ahead"),
    include_time_series_forecast: bool = Query(default=True, description="Whether to combine with ARIMA forecasts"),
    confidence_level: float = Query(default=0.95, ge=0.5, le=0.99, description="Confidence level for predictions"),
    data_service_url: str = Query(default="http://localhost:8000/data", description="Data service URL")
):
    """
    Dynamically fetch clinical data from the data service and generate blood supply forecasts.
    
    This endpoint:
    1. Fetches clinical data from the data service using customizable query parameters
    2. Transforms the data for prediction analysis
    3. Generates blood supply forecasts using clinical predictors
    4. Integrates with time-series ARIMA models if requested
    5. Returns comprehensive predictions with risk assessments
    
    **Query Parameters:**
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum records to fetch (1-1000)
    - **blood_type**: Filter by specific blood type
    - **eligibility_status**: Filter by donor eligibility
    - **prediction_horizon_days**: Days ahead to predict (1-90)
    - **include_time_series_forecast**: Combine with ARIMA models
    - **confidence_level**: Prediction confidence level (0.5-0.99)
    - **data_service_url**: Data service URL (default: http://localhost:8000/data)
    
    **Returns:** Comprehensive prediction response with supply metrics, risk assessment, and recommendations.
    """
    global clinical_predictor
    
    if clinical_predictor is None:
        raise HTTPException(status_code=503, detail="Clinical predictor not initialized")
    
    try:
        # Build query parameters for the data service
        params = {"skip": skip, "limit": limit}
        if blood_type:
            params["blood_type"] = blood_type
        if eligibility_status is not None:
            params["eligibility_status"] = eligibility_status
            
        logger.info(f"Fetching clinical data from {data_service_url}/clinical-data with params: {params}")
        
        # Fetch clinical data from the data service
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    f"{data_service_url}/clinical-data",
                    params=params
                )
                response.raise_for_status()
                clinical_data_raw = response.json()
                
            except httpx.RequestError as e:
                logger.error(f"Request error when fetching clinical data: {str(e)}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Unable to connect to data service: {str(e)}"
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error when fetching clinical data: {e.response.status_code} - {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Data service error: {e.response.text}"
                )
        
        # Validate and transform the fetched data
        if not clinical_data_raw:
            raise HTTPException(
                status_code=404,
                detail="No clinical data found matching the specified criteria"
            )
        
        logger.info(f"Fetched {len(clinical_data_raw)} clinical records")
        
        # Transform raw clinical data to DonorClinicalData format
        donor_records = []
        for record in clinical_data_raw:
            try:
                # Map the data service response to our clinical data model
                donor_data = DonorClinicalData(
                    donor_id=record.get("donor_id", f"UNKNOWN_{datetime.now().timestamp()}"),
                    eligibility_status=record.get("eligibility_status", True),  # Convert bool to enum
                    blood_type=record.get("blood_type", "O+"),
                    medical_history=record.get("medical_history"),
                    screening_results={
                        "hemoglobin_level": record.get("hemoglobin_level"),
                        "blood_pressure_systolic": record.get("blood_pressure_systolic"),
                        "blood_pressure_diastolic": record.get("blood_pressure_diastolic"),
                        "pulse_rate": record.get("pulse_rate"),
                        "temperature": record.get("temperature"),
                        "weight": record.get("weight"),
                        "hiv_screening": record.get("hiv_screening"),
                        "hepatitis_b_screening": record.get("hepatitis_b_screening"),
                        "hepatitis_c_screening": record.get("hepatitis_c_screening")
                    },
                    last_updated=datetime.fromisoformat(record.get("created_at", datetime.now().isoformat()))
                )
                
                # Convert boolean eligibility to enum
                if isinstance(donor_data.eligibility_status, bool):
                    donor_data.eligibility_status = "eligible" if donor_data.eligibility_status else "ineligible"
                
                donor_records.append(donor_data)
            
            except Exception as e:
                logger.warning(f"Failed to parse clinical record {record.get('donor_id', 'unknown')}: {str(e)}")
                continue
        
        if not donor_records:
            raise HTTPException(
                status_code=422,
                detail="No valid clinical records could be processed"
            )
        
        # Create clinical data batch
        clinical_batch = ClinicalDataBatch(
            donors=donor_records,
            collection_timestamp=datetime.now()
        )
        
        # Create prediction request
        prediction_request = ClinicalPredictionRequest(
            clinical_data=clinical_batch,
            prediction_horizon_days=prediction_horizon_days,
            include_time_series_forecast=include_time_series_forecast,
            confidence_level=confidence_level
        )
        
        # Generate supply prediction using the existing clinical predictor
        supply_prediction = clinical_predictor.predict_blood_supply(
            clinical_data=prediction_request.clinical_data,
            prediction_horizon_days=prediction_request.prediction_horizon_days,
            confidence_level=prediction_request.confidence_level
        )
        
        # Integrate with time-series forecasts if requested
        if prediction_request.include_time_series_forecast and clinical_predictor.demand_forecaster:
            try:
                integration = clinical_predictor.integrate_with_demand_forecast(
                    supply_prediction,
                    prediction_request.prediction_horizon_days
                )
                supply_prediction.time_series_integration = integration
            except Exception as e:
                logger.warning(f"Time-series integration failed: {str(e)}")
                # Continue without integration
        
        logger.info(f"Generated clinical prediction for {len(donor_records)} donors")
        return supply_prediction
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Clinical data forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")


@app.get("/forecast/clinical-data/examples", tags=["Clinical Forecasting"])
async def get_clinical_forecast_examples():
    """
    Get example usage patterns for the clinical data forecast endpoint.
    
    Returns various example API calls and their expected use cases.
    """
    return {
        "endpoint": "/forecast/clinical-data",
        "method": "POST",
        "description": "Dynamically fetch clinical data and generate blood supply forecasts",
        "examples": [
            {
                "name": "Basic forecast for all eligible donors",
                "url": "/forecast/clinical-data?eligibility_status=true&limit=100",
                "description": "Fetch up to 100 eligible donors and predict supply for next 7 days"
            },
            {
                "name": "Blood type specific forecast",
                "url": "/forecast/clinical-data?blood_type=A%2B&limit=50&prediction_horizon_days=14",
                "description": "Forecast A+ blood supply for next 14 days using 50 recent donors"
            },
            {
                "name": "Paginated forecast with custom confidence",
                "url": "/forecast/clinical-data?skip=100&limit=200&confidence_level=0.90&include_time_series_forecast=true",
                "description": "Fetch donors 101-300, predict with 90% confidence, include ARIMA integration"
            },
            {
                "name": "Emergency scenario - high confidence",
                "url": "/forecast/clinical-data?eligibility_status=true&blood_type=O-&prediction_horizon_days=3&confidence_level=0.99",
                "description": "High-confidence 3-day O- blood supply forecast for emergency planning"
            },
            {
                "name": "Custom data service URL",
                "url": "/forecast/clinical-data?data_service_url=http://localhost:8000/data&limit=25",
                "description": "Use custom data service URL for development/testing"
            }
        ],
        "query_parameters": {
            "skip": {
                "type": "integer",
                "default": 0,
                "description": "Number of records to skip (pagination)",
                "min": 0
            },
            "limit": {
                "type": "integer", 
                "default": 50,
                "description": "Maximum number of records to fetch",
                "min": 1,
                "max": 1000
            },
            "blood_type": {
                "type": "string",
                "default": "null",
                "description": "Filter by blood type",
                "examples": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
            },
            "eligibility_status": {
                "type": "boolean",
                "default": "null", 
                "description": "Filter by donor eligibility status",
                "examples": [True, False]
            },
            "prediction_horizon_days": {
                "type": "integer",
                "default": 7,
                "description": "Number of days to predict ahead",
                "min": 1,
                "max": 90
            },
            "include_time_series_forecast": {
                "type": "boolean",
                "default": True,
                "description": "Whether to combine with ARIMA time-series forecasts"
            },
            "confidence_level": {
                "type": "float",
                "default": 0.95,
                "description": "Confidence level for predictions",
                "min": 0.5,
                "max": 0.99
            },
            "data_service_url": {
                "type": "string",
                "default": "http://localhost:8000/data",
                "description": "Data service URL for fetching clinical data"
            }
        },
        "response_format": {
            "prediction_date": "ISO datetime",
            "prediction_horizon_days": "integer",
            "total_donors_analyzed": "integer",
            "blood_type_metrics": "object (keyed by blood type)",
            "overall_supply_forecast": "object with forecast metrics",
            "time_series_integration": "object (if enabled)",
            "supply_risk_assessment": "object (risk levels by blood type)",
            "recommendations": "array of strings"
        }
    }


@app.get("/clinical/status", tags=["Clinical Analysis"])
async def get_clinical_predictor_status():
    """Get status of the clinical prediction system."""
    global clinical_predictor
    
    if clinical_predictor is None:
        return {
            "status": "unavailable",
            "message": "Clinical predictor not initialized"
        }
    
    return {
        "status": "active",
        "demand_forecaster_available": clinical_predictor.demand_forecaster is not None,
        "supported_blood_types": sorted(list(model_manager.models.keys())) if model_manager else [],
        "features": [
            "Clinical data analysis",
            "Blood supply prediction",
            "Risk assessment",
            "Supply-demand integration",
            "Comprehensive reporting"
        ]
    }


def start_server():
    """Start the API server with full setup and validation."""
    try:
        logger.info("Starting Blood Demand Forecasting API...")
        
        # Change to the script's directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        logger.info(f"Changed working directory to: {script_dir}")
        
        # Check if models directory exists
        models_dir = "models"
        if not os.path.exists(models_dir):
            logger.error(f"Models directory not found: {models_dir}")
            logger.error(f"Current directory: {os.getcwd()}")
            logger.error(f"Directory contents: {os.listdir('.')}")
            return False
        
        # Check if model index exists
        model_index = os.path.join(models_dir, "model_index.json")
        if not os.path.exists(model_index):
            logger.error(f"Model index file not found: {model_index}")
            return False
        
        logger.info("All required files found. Starting server...")
        
        # Start the server
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        return True
        
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        return True
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        return False


if __name__ == "__main__":
    # Configure logging for direct execution
    import sys
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('api.log')
        ]
    )
    
    # Start the server
    success = start_server()
    if not success:
        sys.exit(1)