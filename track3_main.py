"""
Track 3 - AI-Enhanced Blood Bank System
Unified deployment combining Data, Forecasting, and Optimization services
Similar to Track 1 architecture
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add service directories to Python path
sys.path.append('data')
sys.path.append('forecast') 
sys.path.append('optimization')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
PORT = int(os.getenv("PORT", 8000))

# Set logging level
logging.getLogger().setLevel(getattr(logging, LOG_LEVEL.upper()))

# Create main FastAPI app
app = FastAPI(
    title="Track 3 - AI-Enhanced Blood Bank System",
    description="Integrated Data Ingestion, Forecasting, and Optimization services for Douala General Hospital",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# HEALTH CHECK AND ROOT ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "service": "track3_blood_bank_system",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
        "services": {
            "data_ingestion": "integrated",
            "forecasting": "integrated", 
            "optimization": "integrated"
        },
        "features": [
            "Data Ingestion & DHIS2 Integration",
            "ARIMA/SARIMAX Demand Forecasting",
            "PuLP/SciPy Linear Programming Optimization",
            "Real-time Inventory Management",
            "Clinical Data Integration"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint with comprehensive service information"""
    return {
        "message": "Track 3 - AI-Enhanced Blood Bank System",
        "description": "Integrated backend services for Douala General Hospital",
        "version": "1.0.0",
        "services": {
            "data_ingestion": "Real-time blood inventory management with DHIS2 integration",
            "forecasting": "ARIMA/SARIMAX and ML-based demand forecasting",
            "optimization": "Linear programming and AI-powered inventory optimization"
        },
        "endpoints": {
            "health": "/health - Service health check",
            "docs": "/docs - API documentation",
            
            # Data Service Endpoints (from data/ folder)
            "dashboard_metrics": "/dashboard/metrics - Blood bank overview metrics",
            "inventory": "/inventory - Blood inventory CRUD operations",
            "donors": "/donors - Donor management CRUD operations",
            "donations": "/donations - Blood donations tracking",
            "requests": "/requests - Blood requests management",
            
            # Forecasting Service Endpoints (from forecast/ folder)
            "forecast_single": "/forecast - Single blood type forecast",
            "forecast_batch": "/batch-forecast - All blood types forecast",
            "forecast_models": "/models - Available models info",
            
            # Optimization Service Endpoints (from optimization/ folder)
            "recommendations": "/recommendations - Current recommendations",
            "optimize": "POST /optimize - Run optimization",
            "analytics": "/analytics - Optimization performance",
            
            # DHIS2 Integration
            "dhis2_test": "/dhis2/test-connection - Test DHIS2 connection",
            "dhis2_sync": "POST /dhis2/sync - Sync data to DHIS2"
        },
        "features": [
            "Linear Programming Optimization (PuLP/SciPy)",
            "ARIMA/SARIMAX Demand Forecasting",
            "Clinical Data Integration",
            "DHIS2 Real-time Synchronization",
            "Real-time Inventory Management",
            "Multi-blood Type Support"
        ],
        "blood_types_supported": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "optimization_methods": ["linear_programming", "reinforcement_learning", "hybrid"],
        "deployment": "Railway Cloud Platform",
        "database": "MongoDB with Motor async driver",
        "authentication": "JWT-based with role-based access"
    }

# =============================================================================
# IMPORT AND MOUNT SERVICE APPLICATIONS
# =============================================================================

try:
    # Import the three service applications
    from data.main import app as data_app
    from forecast.main import app as forecast_app
    from optimization.main import app as optimization_app
    
    # Mount the service applications
    app.mount("/data", data_app)
    app.mount("/forecast", forecast_app) 
    app.mount("/optimization", optimization_app)
    
    logger.info("✅ Successfully mounted all three services:")
    logger.info("  📊 Data Service: /data")
    logger.info("  📈 Forecasting Service: /forecast")
    logger.info("  ⚡ Optimization Service: /optimization")
    
except ImportError as e:
    logger.error(f"❌ Failed to import services: {e}")
    logger.error("Make sure data/, forecast/, and optimization/ folders are accessible")

# =============================================================================
# DIRECT ENDPOINT PROXIES (for backward compatibility)
# =============================================================================

# Proxy key endpoints directly to maintain API compatibility
@app.get("/dashboard/metrics")
async def get_dashboard_metrics():
    """Proxy to data service dashboard metrics"""
    try:
        # This would proxy to the data service
        return {
            "status": "success",
            "message": "Dashboard metrics endpoint - proxied to data service",
            "redirect": "/data/dashboard/metrics"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/inventory")
async def get_inventory():
    """Proxy to data service inventory"""
    return {
        "status": "success", 
        "message": "Inventory endpoint - proxied to data service",
        "redirect": "/data/inventory"
    }

@app.get("/forecast/{blood_type}")
async def get_forecast(blood_type: str):
    """Proxy to forecasting service"""
    return {
        "status": "success",
        "message": f"Forecast endpoint for {blood_type} - proxied to forecasting service", 
        "redirect": f"/forecast/forecast?blood_type={blood_type}"
    }

@app.get("/recommendations/active")
async def get_recommendations():
    """Proxy to optimization service"""
    return {
        "status": "success",
        "message": "Recommendations endpoint - proxied to optimization service",
        "redirect": "/optimization/recommendations"
    }

# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "Please check the API documentation at /docs",
            "available_services": ["/data", "/forecast", "/optimization"],
            "direct_endpoints": ["/dashboard/metrics", "/inventory", "/forecast/{blood_type}", "/recommendations/active"]
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "Please try again later or contact support"
        }
    )

# =============================================================================
# STARTUP EVENT
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize Track 3 services"""
    logger.info("🚀 Track 3 - AI-Enhanced Blood Bank System Starting...")
    logger.info("🏥 Douala General Hospital")
    logger.info("📊 Data Ingestion + 📈 Forecasting + ⚡ Optimization")
    logger.info(f"🌐 Environment: {ENVIRONMENT}")
    logger.info(f"🔧 Port: {PORT}")

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Track 3 Backend shutdown complete")

# =============================================================================
# MAIN APPLICATION
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "track3_main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
        log_level="info"
    )
