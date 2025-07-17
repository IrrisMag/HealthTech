from app.database.connection import get_db
from app.security.password import get_password_hash
from app.models.user import UserRole

def init_database():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL,
                employee_id TEXT,
                department TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def create_default_admin():
    from app.services.user_service import get_user_by_email

    admin_user = get_user_by_email("admin@hospital.com")
    if not admin_user:
        with get_db() as conn:
            hashed_password = get_password_hash("admin123")
            conn.execute("""
                INSERT INTO users (email, hashed_password, full_name, role, employee_id, department)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ("admin@hospital.com", hashed_password, "System Administrator",
                  UserRole.ADMIN, "ADM001", "IT"))
            conn.commit()

def setup_database():
    init_database()
    create_default_admin()
