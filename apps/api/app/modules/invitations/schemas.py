from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime

class InviteCreate(BaseModel):
    email: EmailStr
    role: str # OWNER, MANAGER, PHARMACIST, STAFF, CASHIER
    branch_ids: List[uuid.UUID] = []

class InviteResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    email: EmailStr
    role: str
    status: str
    expires_at: datetime
    created_at: datetime
    invited_by: Optional[uuid.UUID]

    class Config:
        from_attributes = True

class InviteAccept(BaseModel):
    password: str
    full_name: str
