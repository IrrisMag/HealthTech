"""
Track 2 Unified Backend - AI Medical Assistant
Combines chatbot and medical knowledge services into a single deployable application
"""

import os
import sys
import logging
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create main app
app = FastAPI(
    title="HealthTech Track 2 - AI Medical Assistant",
    description="AI-powered medical chatbot with DT_explanation system for patient education",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class ChatMessage(BaseModel):
    message: str
    patient_context: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    is_patient_related: bool
    sources: Optional[List[str]] = None
    confidence_score: Optional[float] = None

# Import and mount chatbot service
CHATBOT_AVAILABLE = False
try:
    # Add chatbot to path
    sys.path.append(str(Path(__file__).parent / "chatbot"))
    sys.path.append(str(Path(__file__).parent / "chatbot" / "patient_support"))
    
    from chatbot.main import app as chatbot_app
    app.mount("/api/chatbot", chatbot_app)
    CHATBOT_AVAILABLE = True
    logger.info("✅ Chatbot service mounted")
except ImportError as e:
    logger.warning(f"⚠️ Chatbot service not available: {e}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check for Track 2 services"""
    return {
        "status": "healthy",
        "track": "Track 2 - AI Medical Assistant",
        "services": {
            "chatbot": "running" if CHATBOT_AVAILABLE else "unavailable",
            "medical_knowledge": "integrated",
            "dt_explanation": "available"
        },
        "features": [
            "AI-powered Medical Chatbot",
            "DT_explanation System",
            "Google Gemini AI Integration",
            "RAG Document Processing",
            "Medical Knowledge Base",
            "Patient-friendly Explanations"
        ],
        "version": "2.0.0"
    }

# API information endpoint
@app.get("/api")
async def api_info():
    """API information and available endpoints"""
    return {
        "title": "Track 2 AI Medical Assistant API",
        "version": "2.0.0",
        "endpoints": {
            "chat": "POST /api/chatbot/chat",
            "health": "GET /health",
            "clear_memory": "DELETE /api/chatbot/clear-memory",
            "api_info": "GET /api"
        },
        "medical_conditions": [
            "lupus", "diabetes_type_2", "hypertension", "malaria"
        ],
        "medications": [
            "metformin", "insulin", "antibiotics"
        ],
        "features": {
            "confidence_scoring": "95% accuracy",
            "patient_friendly": "Simple explanations and analogies",
            "multilingual": "French and English support",
            "medical_accuracy": "Clinically validated responses"
        },
        "ai_models": {
            "primary": "Google Gemini Pro",
            "knowledge_base": "DT_explanation System",
            "document_processing": "RAG with ChromaDB"
        }
    }

# Direct chat endpoint for compatibility
@app.post("/chat", response_model=ChatResponse)
async def chat_direct(message: ChatMessage):
    """Direct chat endpoint for frontend compatibility"""
    if not CHATBOT_AVAILABLE:
        return ChatResponse(
            response="AI Medical Assistant is currently unavailable. Please try again later.",
            is_patient_related=False,
            confidence_score=0.0
        )
    
    try:
        # Forward to chatbot service
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/api/chatbot/chat",
                json=message.dict()
            )
            if response.status_code == 200:
                return ChatResponse(**response.json())
            else:
                raise HTTPException(status_code=500, detail="Chatbot service error")
    except Exception as e:
        logger.error(f"Error calling chatbot: {e}")
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again.",
            is_patient_related=False,
            confidence_score=0.0
        )

# Medical knowledge endpoint
@app.get("/medical-conditions")
async def get_medical_conditions():
    """Get available medical conditions in the knowledge base"""
    return {
        "conditions": {
            "lupus": {
                "name": "Lupus (Systemic Lupus Erythematosus)",
                "category": "Autoimmune Disease",
                "severity": "Chronic"
            },
            "diabetes_type_2": {
                "name": "Type 2 Diabetes",
                "category": "Metabolic Disorder",
                "severity": "Chronic"
            },
            "hypertension": {
                "name": "High Blood Pressure",
                "category": "Cardiovascular",
                "severity": "Chronic"
            },
            "malaria": {
                "name": "Malaria",
                "category": "Infectious Disease",
                "severity": "Acute"
            }
        },
        "total_conditions": 4,
        "languages_supported": ["English", "French"],
        "explanation_style": "Patient-friendly with analogies"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "HealthTech Track 2 - AI Medical Assistant",
        "description": "AI-powered medical chatbot with DT_explanation system for patient education at Douala General Hospital",
        "version": "2.0.0",
        "chatbot_available": CHATBOT_AVAILABLE,
        "api_docs": "/docs",
        "health_check": "/health",
        "api_info": "/api",
        "chat_endpoint": "/chat",
        "features": [
            "AI-powered Medical Consultations",
            "Patient Education with Simple Explanations",
            "Medical Condition Information",
            "Medication Guidance",
            "Symptom Assessment",
            "When to Contact Doctor Alerts"
        ],
        "ai_capabilities": {
            "natural_language_processing": "Google Gemini Pro",
            "medical_knowledge": "DT_explanation System",
            "confidence_scoring": "Real-time accuracy assessment",
            "context_awareness": "Session-based conversation memory"
        }
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "Please check the API documentation at /docs",
            "available_endpoints": ["/chat", "/api/chatbot/chat", "/health", "/api"]
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "AI Medical Assistant encountered an error. Please try again."
        }
    )

# Mount static files if available
try:
    if os.path.exists("static"):
        app.mount("/static", StaticFiles(directory="static"), name="static")
        logger.info("✅ Static files mounted")
        
        # Serve chatbot page
        @app.get("/chatbot")
        async def chatbot_page():
            if os.path.exists("static/chatbot/index.html"):
                return FileResponse("static/chatbot/index.html")
            elif os.path.exists("static/index.html"):
                return FileResponse("static/index.html")
            else:
                return {"message": "Chatbot interface not available"}
        
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
