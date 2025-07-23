from fastapi import APIRouter, HTTPException, status, Request, Depends
from app.schemas.auth import UserLogin, Token, TokenRefresh, LoginResponse, LogoutRequest
from app.schemas.user import UserCreate, UserProfile
from app.services.auth_service import authenticate_user, create_user_tokens
from app.services.user_service import get_user_by_email, create_user
from app.services.audit_service import audit_service
from app.models.user import UserRole, ApprovalStatus
from app.models.audit import AuditAction, AuditSeverity
from app.security.jwt_handler import verify_token
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=dict)
async def register_user(user: UserCreate, request: Request):
    """Register a new user with enhanced validation"""

    # Check if user already exists
    existing_user = get_user_by_email(user.email)
    if existing_user:
        await audit_service.log_event(
            action=AuditAction.USER_CREATED,
            severity=AuditSeverity.MEDIUM,
            request=request,
            success=False,
            error_message="Email already registered",
            additional_data={"email": user.email}
        )
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

    try:
        user_id = await create_user(user)

        await audit_service.log_event(
            action=AuditAction.USER_CREATED,
            resource="user",
            resource_id=user_id,
            severity=AuditSeverity.MEDIUM,
            request=request,
            success=True,
            additional_data={"email": user.email, "role": user.role.value}
        )

        return {
            "message": "User registered successfully. Account pending approval.",
            "user_id": user_id,
            "status": "pending_approval"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin, request: Request):
    """Enhanced login with security features"""

    user = await authenticate_user(
        user_credentials.email,
        user_credentials.password,
        request
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or account not approved",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    tokens = await create_user_tokens(user)

    # Create user profile for response
    user_profile = UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        department=user.department,
        employee_id=user.employee_id,
        last_login=user.last_login
    )

    return LoginResponse(
        **tokens,
        user=user_profile.dict()
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(token_request: TokenRefresh, request: Request):
    """Refresh access token using refresh token"""

    payload = verify_token(token_request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user = get_user_by_email(payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new tokens
    tokens = await create_user_tokens(user)

    await audit_service.log_event(
        action=AuditAction.TOKEN_REFRESH,
        user_id=user.id,
        user_email=user.email,
        severity=AuditSeverity.LOW,
        request=request,
        success=True
    )

    return Token(**tokens)


@router.post("/logout")
async def logout(
    logout_request: LogoutRequest,
    request: Request,
    current_user: UserProfile = Depends(get_current_user)
):
    """Logout user and invalidate tokens"""

    # In a production system, you would add the tokens to a blacklist
    # For now, we just log the logout event

    await audit_service.log_event(
        action=AuditAction.LOGOUT,
        user_id=current_user.id,
        user_email=current_user.email,
        severity=AuditSeverity.LOW,
        request=request,
        success=True
    )

    return {"message": "Successfully logged out"}
