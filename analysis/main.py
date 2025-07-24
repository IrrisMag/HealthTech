"""Analysis microservice for HealthTech Platform."""

import os
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Environment variables
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "reminderdb_analysis")
JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(
    title="Analysis Microservice",
    description="Health data analysis service for Douala General Hospital",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "service": "analysis",
        "status": "running",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "analysis",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
    }
