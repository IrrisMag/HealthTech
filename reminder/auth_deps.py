import os
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://auth:8000/auth/login")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth:8000")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Call the auth service to validate the token and get user info
        resp = requests.get(
            f"{AUTH_SERVICE_URL}/users/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()
        else:
            raise credentials_exception
    except Exception:
        raise credentials_exception


def require_roles(*roles):
    def checker(user=Depends(get_current_user)):
        user_role = user.get("role", None)
        if user_role not in roles:
            raise HTTPException(
                status_code=403, detail="Insufficient permissions"
            )
        return user
    return checker
