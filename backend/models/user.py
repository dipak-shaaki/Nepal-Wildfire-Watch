from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    email: EmailStr
    username: str
    nid: str
    password: str
    role: str = "user"
    is_approved: bool = False
    is_verified: bool = True  # Auto-verified on registration
    # Fields used for password reset
    reset_otp: Optional[str] = None
    reset_otp_created_at: Optional[datetime] = None
