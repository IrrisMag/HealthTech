from app.database.connection import db
from app.security.password import get_password_hash
from app.models.user import UserRole


def create_default_admin():
    users_collection = db["users"]
    admin_user = users_collection.find_one({"email": "admin@hospital.com"})
    if not admin_user:
        hashed_password = get_password_hash("admin123")
        users_collection.insert_one({
            "email": "admin@hospital.com",
            "hashed_password": hashed_password,
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "employee_id": "ADM001",
            "department": "IT",
            "is_active": True,
            "created_at": None
        })


def setup_database():
    create_default_admin()
