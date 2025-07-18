from typing import Optional, List
from bson import ObjectId
from app.models.user import UserInDB
from app.schemas.user import User, UserCreate
from app.database.connection import db
from app.security.password import get_password_hash

users_collection = db["users"]


def get_user_by_email(email: str) -> Optional[UserInDB]:
    user_data = users_collection.find_one({"email": email})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None


def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    user_data = users_collection.find_one({"_id": ObjectId(user_id)})
    if user_data:
        user_data["id"] = str(user_data["_id"])
        return UserInDB(**user_data)
    return None


def create_user(user: UserCreate) -> str:
    hashed_password = get_password_hash(user.password)
    user_doc = user.dict()
    user_doc["hashed_password"] = hashed_password
    user_doc.pop("password")
    result = users_collection.insert_one(user_doc)
    return str(result.inserted_id)


def get_all_users() -> List[User]:
    users = []
    for user_data in users_collection.find():
        user_data["id"] = str(user_data["_id"])
        users.append(User(**user_data))
    return users


def deactivate_user(user_id: str) -> bool:
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False}}
    )
    return result.modified_count > 0
