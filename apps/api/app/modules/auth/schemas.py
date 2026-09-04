from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_platform_admin: bool
    is_active: bool

    class Config:
        from_attributes = True

class SimpleOrgResponse(BaseModel):
    id: uuid.UUID
    name: str

    class Config:
        from_attributes = True

class MeResponse(BaseModel):
    user: UserResponse
    organization: Optional[SimpleOrgResponse] = None
    role: Optional[str] = None
    branch_ids: list[uuid.UUID] = []
