from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
from app.config import settings
from app.database.init_db import setup_database
from app.routers import auth, users, protected, admin
from app.services.audit_service import audit_service
from app.models.audit import AuditAction, AuditSeverity

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A secure authentication system for hospital management with enhanced security features",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None
)

# Security Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.hospital.com", "localhost"]
    )


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Log HTTP exceptions for security monitoring"""

    if exc.status_code >= 400:
        await audit_service.log_event(
            action=AuditAction.SYSTEM_CONFIG_CHANGED,
            severity=AuditSeverity.MEDIUM if exc.status_code < 500 else AuditSeverity.HIGH,
            request=request,
            success=False,
            error_message=f"HTTP {exc.status_code}: {exc.detail}",
            additional_data={"status_code": exc.status_code}
        )

    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(protected.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    """Initialize application"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Audit enabled: {settings.AUDIT_ENABLED}")

    try:
        setup_database()
        logger.info("Database setup completed")

        # Log application startup
        await audit_service.log_event(
            action=AuditAction.SYSTEM_CONFIG_CHANGED,
            severity=AuditSeverity.LOW,
            success=True,
            additional_data={
                "event": "application_startup",
                "version": settings.APP_VERSION,
                "environment": settings.ENVIRONMENT
            }
        )

    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down application")

    await audit_service.log_event(
        action=AuditAction.SYSTEM_CONFIG_CHANGED,
        severity=AuditSeverity.LOW,
        success=True,
        additional_data={"event": "application_shutdown"}
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "features": {
            "audit_enabled": settings.AUDIT_ENABLED,
            "mfa_available": settings.MFA_ENABLED,
            "security_enhanced": True
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        from app.database.connection import db
        db.command('ping')

        return {
            "status": "healthy",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": settings.APP_VERSION,
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "database": "disconnected"
            }
        )


@app.get("/security/info")
async def security_info():
    """Security configuration info (non-sensitive)"""
    return {
        "password_requirements": {
            "min_length": settings.PASSWORD_MIN_LENGTH,
            "require_special_chars": settings.REQUIRE_SPECIAL_CHARS
        },
        "session_config": {
            "access_token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "session_timeout_minutes": settings.SESSION_TIMEOUT_MINUTES,
            "max_concurrent_sessions": settings.CONCURRENT_SESSIONS_LIMIT
        },
        "security_features": {
            "account_lockout": True,
            "audit_logging": settings.AUDIT_ENABLED,
            "mfa_available": settings.MFA_ENABLED
        }
    }
