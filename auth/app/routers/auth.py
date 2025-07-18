from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import UserLogin, Token
from app.schemas.user import UserCreate
from app.services.auth_service import authenticate_user, create_user_token
from app.services.user_service import get_user_by_email, create_user
from app.models.user import UserRole

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=dict)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate employee ID for non-patient users
    if user.role != UserRole.PATIENT and not user.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID is required for staff members"
        )

    user_id = create_user(user)
    return {"message": "User registered successfully", "user_id": user_id}


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_user_token(user)
    return {"access_token": access_token, "token_type": "bearer"}
