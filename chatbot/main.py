"""
Track 2 - AI Medical Assistant Entry Point
Simple entry point that directly imports and uses the patient_support app
"""

import os
import sys
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Import the patient support app directly
    from patient_support.app import app
    logger.info("✅ Track 2 Chatbot - Patient support app loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to import patient support app: {e}")
    # Create a minimal fallback app
    from fastapi import FastAPI
    app = FastAPI(title="Track 2 Fallback")

    @app.get("/health")
    def health_fallback():
        return {"status": "error", "message": "Failed to load main application", "error": str(e)}

    @app.get("/")
    def root_fallback():
        return {"message": "Track 2 AI Medical Assistant (Fallback Mode)", "error": str(e)}

# The app variable is now imported from patient_support.app
# All endpoints are already defined there including:
# - /health
# - /chat
# - /clear-memory
# - /documents
# - /search
# - etc.

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"🚀 Starting Track 2 AI Medical Assistant on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
