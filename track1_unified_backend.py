"""
Track 1 Unified Backend - Patient Communication System
Combines all Track 1 microservices into a single deployable application
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create main app
app = FastAPI(
    title="HealthTech Track 1 - Patient Communication System",
    description="Unified backend for multilingual patient feedback and reminder system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and mount sub-applications
try:
    # Import auth routers directly instead of mounting the whole app
    from auth.app.routers.auth import router as auth_router
    from auth.app.database.init_db import setup_database as setup_auth_db

    # Setup auth database
    setup_auth_db()

    app.include_router(auth_router, prefix="/api")
    logger.info("✅ Auth service mounted at /api/auth")
except ImportError as e:
    logger.warning(f"⚠️ Auth service not available: {e}")
except Exception as e:
    logger.warning(f"⚠️ Auth service setup failed: {e}")

try:
    from feedback.main import app as feedback_app
    app.mount("/api/feedback", feedback_app)
    logger.info("✅ Feedback service mounted")
except ImportError as e:
    logger.warning(f"⚠️ Feedback service not available: {e}")

try:
    from reminder.main import app as reminder_app
    app.mount("/api/reminder", reminder_app)
    logger.info("✅ Reminder service mounted")
except ImportError as e:
    logger.warning(f"⚠️ Reminder service not available: {e}")

try:
    from notification.main import app as notification_app
    app.mount("/api/notification", notification_app)
    logger.info("✅ Notification service mounted")
except ImportError as e:
    logger.warning(f"⚠️ Notification service not available: {e}")

try:
    from translation.main import app as translation_app
    app.mount("/api/translation", translation_app)
    logger.info("✅ Translation service mounted")
except ImportError as e:
    logger.warning(f"⚠️ Translation service not available: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check for all services"""
    services_status = {}
    
    # Check each service
    try:
        from auth.main import app as auth_app
        services_status["auth"] = "running"
    except:
        services_status["auth"] = "unavailable"
    
    try:
        from feedback.main import app as feedback_app
        services_status["feedback"] = "running"
    except:
        services_status["feedback"] = "unavailable"
    
    try:
        from reminder.main import app as reminder_app
        services_status["reminder"] = "running"
    except:
        services_status["reminder"] = "unavailable"
    
    try:
        from notification.main import app as notification_app
        services_status["notification"] = "running"
    except:
        services_status["notification"] = "unavailable"
    
    try:
        from translation.main import app as translation_app
        services_status["translation"] = "running"
    except:
        services_status["translation"] = "unavailable"
    
    return {
        "status": "healthy",
        "track": "Track 1 - Patient Communication System",
        "services": services_status,
        "features": [
            "Multilingual Patient Feedback Collection",
            "SMS/Voice Reminders via Twilio",
            "Real-time Translation",
            "Sentiment Analysis",
            "Patient Authentication"
        ],
        "version": "1.0.0"
    }

# API information endpoint
@app.get("/api")
async def api_info():
    """API information and available endpoints"""
    return {
        "title": "Track 1 Patient Communication API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "login": "POST /api/auth/login",
                "register": "POST /api/auth/register",
                "profile": "GET /api/auth/profile"
            },
            "feedback": {
                "submit": "POST /api/feedback/submit",
                "list": "GET /api/feedback",
                "analytics": "GET /api/feedback/analytics"
            },
            "reminders": {
                "create": "POST /api/reminder/reminders",
                "list": "GET /api/reminder/reminders",
                "update": "PUT /api/reminder/reminders/{id}"
            },
            "notifications": {
                "send": "POST /api/notification/send",
                "history": "GET /api/notification/history"
            },
            "translation": {
                "translate": "POST /api/translation/translate",
                "languages": "GET /api/translation/languages"
            }
        },
        "supported_languages": ["fr", "en", "douala", "bassa", "ewondo"],
        "notification_channels": ["sms", "voice", "email"]
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "HealthTech Track 1 - Patient Communication System",
        "description": "Multilingual patient feedback and reminder system for Douala General Hospital",
        "version": "1.0.0",
        "api_docs": "/docs",
        "health_check": "/health",
        "api_info": "/api",
        "features": [
            "Multilingual Support (French, English, Douala, Bassa, Ewondo)",
            "SMS and Voice Reminders via Twilio",
            "Real-time Sentiment Analysis",
            "Patient Feedback Collection",
            "Automated Translation Services"
        ]
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "Please check the API documentation at /docs",
            "available_services": ["/api/auth", "/api/feedback", "/api/reminder", "/api/notification", "/api/translation"]
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "Please check the service logs for more details"
        }
    )

# Mount static files if available
try:
    if os.path.exists("static"):
        app.mount("/static", StaticFiles(directory="static"), name="static")
        logger.info("✅ Static files mounted")
        
        # Serve frontend for non-API routes
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            if full_path.startswith("api/"):
                return {"error": "API endpoint not found"}
            
            # Serve index.html for all non-API routes
            if os.path.exists("static/index.html"):
                return FileResponse("static/index.html")
            else:
                return {"message": "Frontend not available"}
except Exception as e:
    logger.warning(f"⚠️ Static files not available: {e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
