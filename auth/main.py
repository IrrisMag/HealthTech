import os
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "healthtech_auth")
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_collection = db["users"]
roles_collection = db["roles"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# --- Schemas ---
class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: str
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None

class UserOut(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    permissions: Optional[List[str]] = None
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    last_password_change: Optional[datetime] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    language_preference: Optional[str] = None
    role: Optional[str] = None
    specialisation: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    patient_id: Optional[str] = None
    insurance_number: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    blood_type: Optional[str] = None
    avatar_url: Optional[str] = None
    notification_preferences: Optional[List[str]] = None
    preferred_contact_time: Optional[str] = None
    preferred_input_method: Optional[str] = None
    accessibility_needs: Optional[List[str]] = None
    cultural_group: Optional[str] = None
    preferred_hospital: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RoleCreate(BaseModel):
    name: str
    permissions: Optional[List[str]] = []

class RoleOut(BaseModel):
    name: str
    permissions: List[str]

# --- Utils ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = users_collection.find_one({"username": username})
    if not user:
        raise credentials_exception
    return user

def require_roles(*roles):
    def role_checker(user=Depends(get_current_user)):
        user_role = user.get("role", None)
        if user_role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

def utcnow():
    return datetime.utcnow()

# --- FastAPI App ---
app = FastAPI(title="HealthTech Auth Service")

@app.get("/")
def root():
    return {"message": "HealthTech Auth Service is running"}

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    users_collection.update_one({"username": user["username"]}, {"$set": {"last_login": utcnow()}})
    access_token = create_access_token(
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

@app.post("/users/register", response_model=UserOut)
def register(user: UserCreate, current_user=Depends(require_roles("admin"))):
    allowed_roles = ["patient", "nurse", "doctor", "admin", "pharmacist", "lab_technician", "blood_bank_manager", "analyst"]
    if user.role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(allowed_roles)}")
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    if user.email and users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    user_doc = user.dict()
    user_doc["hashed_password"] = hashed_password
    user_doc["is_active"] = True
    user_doc["is_verified"] = False
    user_doc["permissions"] = None
    user_doc["created_at"] = utcnow()
    user_doc["updated_at"] = utcnow()
    user_doc["last_login"] = None
    user_doc["last_password_change"] = utcnow()
    user_doc.pop("password")
    users_collection.insert_one(user_doc)
    user_doc.pop("hashed_password")
    return UserOut(**user_doc)

@app.get("/users/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    user = current_user.copy()
    user.pop("hashed_password", None)
    user.pop("_id", None)
    return user

@app.put("/users/me", response_model=UserOut)
def update_me(update: UserUpdate, current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update user profiles.")
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    update_data["updated_at"] = utcnow()
    users_collection.update_one({"username": current_user["username"]}, {"$set": update_data})
    user = users_collection.find_one({"username": current_user["username"]})
    user.pop("hashed_password", None)
    user.pop("_id", None)
    return user

@app.get("/users/", response_model=List[UserOut])
def list_users(current_user=Depends(require_roles("admin"))):
    users = list(users_collection.find({}, {"_id": 0, "hashed_password": 0}))
    return users

@app.post("/roles/", response_model=RoleOut)
def create_role(role: RoleCreate, current_user=Depends(require_roles("admin"))):
    if roles_collection.find_one({"name": role.name}):
        raise HTTPException(status_code=400, detail="Role already exists")
    role_doc = {"name": role.name, "permissions": role.permissions or []}
    roles_collection.insert_one(role_doc)
    return RoleOut(**role_doc)

@app.get("/roles/", response_model=List[RoleOut])
def list_roles(current_user=Depends(require_roles("admin"))):
    roles = list(roles_collection.find({}, {"_id": 0}))
    return roles

@app.post("/roles/assign", response_model=UserOut)
def assign_role(username: str, role: str, current_user=Depends(require_roles("admin"))):
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in [r["name"] for r in roles_collection.find({}, {"_id": 0})]:
        raise HTTPException(status_code=404, detail="Role not found")
    if user.get("role") == role:
        raise HTTPException(status_code=400, detail="User already has this role")
    users_collection.update_one({"username": username}, {"$set": {"role": role}})
    user = users_collection.find_one({"username": username}, {"_id": 0, "hashed_password": 0})
    return user
