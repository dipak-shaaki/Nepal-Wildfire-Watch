from fastapi import APIRouter, HTTPException
from models.user_model import UserRegister, UserLogin
from services.user_service import create_user, verify_user
from auth.jwt_config import create_access_token

router = APIRouter(prefix="/user", tags=["User"])

@router.post("/signup")
async def register_user(payload: UserRegister):
    result = await create_user(payload)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/login")
async def login_user(payload: UserLogin):
    user = await verify_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"user_id": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "username": user["username"]}
