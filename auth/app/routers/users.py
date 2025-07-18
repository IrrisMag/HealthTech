from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import User
from app.models.user import UserRole
from app.services.user_service import get_all_users, deactivate_user
from app.middleware.auth_middleware import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.get("/", response_model=List[User])
async def get_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    return get_all_users()


@router.put("/{user_id}/deactivate")
async def deactivate_user_account(
    user_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    if not deactivate_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deactivated successfully"}
