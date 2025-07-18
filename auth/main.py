from fastapi import FastAPI
from app.config import settings
from app.database.init_db import setup_database
from app.routers import auth, users, protected


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A secure authentication system for hospital management"
)


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(protected.router)


@app.on_event("startup")
async def startup_event():
    setup_database()


@app.get("/")
async def root():
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
