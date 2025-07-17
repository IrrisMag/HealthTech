from typing import List

from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi import Depends
from pymongo.errors import DuplicateKeyError

from .. import deps
from .. import schemas, database, utils

router = APIRouter()


@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, current_user=Depends(deps.require_roles("admin"))):
    allowed_roles = ["patient", "nurse", "doctor", "admin", "pharmacist", "lab_technician", "blood_bank_manager", "analyst"]
    if user.role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(allowed_roles)}")
    if database.users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    if user.email and database.users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = utils.hash_password(user.password)
    user_doc = {
        "username": user.username,
        "hashed_password": hashed_password,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "address": user.address,
        "language_preference": user.language_preference,
        "role": user.role,
        "is_active": True,
        "is_verified": False,
        "permissions": None,
        "specialisation": user.specialisation,
        "department": user.department,
        "employee_id": user.employee_id,
        "patient_id": user.patient_id,
        "insurance_number": user.insurance_number,
        "emergency_contact": user.emergency_contact,
        "allergies": user.allergies,
        "chronic_conditions": user.chronic_conditions,
        "blood_type": user.blood_type,
        "avatar_url": user.avatar_url,
        "created_at": utils.utcnow(),
        "updated_at": utils.utcnow(),
        "last_login": None,
        "last_password_change": utils.utcnow(),
        "notification_preferences": user.notification_preferences,
        "preferred_contact_time": user.preferred_contact_time,
        "preferred_input_method": user.preferred_input_method,
        "accessibility_needs": user.accessibility_needs,
        "cultural_group": user.cultural_group,
        "preferred_hospital": user.preferred_hospital
    }
    try:
        database.users_collection.insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="User already exists")
    # Remove hashed_password for output
    user_doc.pop("hashed_password")
    return schemas.UserOut(**user_doc)


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(deps.get_current_user)):
    user = current_user.copy()
    user.pop("hashed_password", None)
    user.pop("_id", None)
    return user


@router.put("/me", response_model=schemas.UserOut)
def update_me(update: schemas.UserUpdate, current_user=Depends(deps.get_current_user)):
    # Only admin can update any profile
    if "admin" not in current_user.get("roles", []):
        raise HTTPException(status_code=403, detail="Only admins can update user profiles.")
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    update_data["updated_at"] = utils.utcnow()
    database.users_collection.update_one({"username": current_user["username"]}, {"$set": update_data})
    user = database.users_collection.find_one({"username": current_user["username"]})
    user.pop("hashed_password", None)
    user.pop("_id", None)
    return user


@router.get("/", response_model=List[schemas.UserOut])
def list_users(current_user=Depends(deps.require_roles("admin"))):
    users = list(database.users_collection.find({}, {"_id": 0, "hashed_password": 0}))
    return users
