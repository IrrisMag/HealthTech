from typing import Optional, List
from datetime import datetime
from app.models.user import UserInDB, UserRole
from app.schemas.user import User, UserCreate
from app.database.connection import get_db
from app.security.password import get_password_hash

def get_user_by_email(email: str) -> Optional[UserInDB]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user_data = cursor.fetchone()

        if user_data:
            return UserInDB(
                id=user_data["id"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=UserRole(user_data["role"]),
                employee_id=user_data["employee_id"],
                department=user_data["department"],
                is_active=bool(user_data["is_active"]),
                created_at=datetime.fromisoformat(user_data["created_at"]),
                hashed_password=user_data["hashed_password"]
            )
    return None

def get_user_by_id(user_id: int) -> Optional[UserInDB]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_data = cursor.fetchone()

        if user_data:
            return UserInDB(
                id=user_data["id"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=UserRole(user_data["role"]),
                employee_id=user_data["employee_id"],
                department=user_data["department"],
                is_active=bool(user_data["is_active"]),
                created_at=datetime.fromisoformat(user_data["created_at"]),
                hashed_password=user_data["hashed_password"]
            )
    return None

def create_user(user: UserCreate) -> int:
    hashed_password = get_password_hash(user.password)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role, employee_id, department)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user.email, hashed_password, user.full_name, user.role.value,
              user.employee_id, user.department))
        conn.commit()
        return cursor.lastrowid

def get_all_users() -> List[User]:
    users = []
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        for row in cursor.fetchall():
            users.append(User(
                id=row["id"],
                email=row["email"],
                full_name=row["full_name"],
                role=UserRole(row["role"]),
                employee_id=row["employee_id"],
                department=row["department"],
                is_active=bool(row["is_active"]),
                created_at=datetime.fromisoformat(row["created_at"])
            ))
    return users

def deactivate_user(user_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = 0 WHERE id = ?", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
