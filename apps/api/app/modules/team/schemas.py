from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid

class TeamMemberResponse(BaseModel):
    user_id: uuid.UUID
    full_name: str
    email: EmailStr
    role: str
    status: str
    branch_ids: List[uuid.UUID] = []
    is_active: bool

    class Config:
        from_attributes = True

class TeamRoleUpdate(BaseModel):
    role: str
