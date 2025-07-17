from fastapi import APIRouter, HTTPException
from .. import schemas, database
from typing import List


router = APIRouter()


@router.post("/", response_model=schemas.RoleOut)
def create_role(role: schemas.RoleCreate):
    if database.roles_collection.find_one({"name": role.name}):
        raise HTTPException(status_code=400, detail="Role already exists")
    role_doc = {"name": role.name, "permissions": role.permissions or []}
    database.roles_collection.insert_one(role_doc)
    return schemas.RoleOut(**role_doc)


@router.get("/", response_model=List[schemas.RoleOut])
def list_roles():
    roles = list(database.roles_collection.find({}, {"_id": 0}))
    return roles


@router.post("/assign", response_model=schemas.UserOut)
def assign_role(username: str, role: str, current_user=Depends(deps.require_roles("admin"))):
    user = database.users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in [r["name"] for r in database.roles_collection.find({}, {"_id": 0})]:
        raise HTTPException(status_code=404, detail="Role not found")
    if user.get("role") == role:
        raise HTTPException(status_code=400, detail="User already has this role")
    database.users_collection.update_one({"username": username}, {"$set": {"role": role}})
    user = database.users_collection.find_one({"username": username}, {"_id": 0, "hashed_password": 0})
    return user
