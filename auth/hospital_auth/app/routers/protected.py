from fastapi import APIRouter, Depends
from app.schemas.user import User
from app.models.user import UserRole
from app.middleware.auth_middleware import require_roles

router = APIRouter(prefix="/protected", tags=["protected"])

@router.get("/admin/dashboard")
async def admin_dashboard(current_user: User = Depends(require_roles([UserRole.ADMIN]))):
    return {"message": "Welcome to admin dashboard", "user": current_user.full_name}

@router.get("/doctor/patients")
async def doctor_patients(current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.ADMIN]))):
    return {"message": "Patient records access", "doctor": current_user.full_name}

@router.get("/nurse/tasks")
async def nurse_tasks(current_user: User = Depends(require_roles([UserRole.NURSE, UserRole.DOCTOR, UserRole.ADMIN]))):
    return {"message": "Nursing tasks", "nurse": current_user.full_name}
