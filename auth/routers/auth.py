from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, database, utils
from datetime import timedelta


router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = database.users_collection.find_one({"username": form_data.username})
    if not user or not utils.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    # Update last_login
    database.users_collection.update_one({"username": user["username"]}, {"$set": {"last_login": utils.utcnow()}})
    access_token = utils.create_access_token(
        data={
            "sub": user["username"],
            "role": user.get("role", "user"),
            "user_id": str(user.get("_id")),
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "is_active": user.get("is_active", True),
            "is_verified": user.get("is_verified", False)
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}
