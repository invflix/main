from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class ClaimCreate(BaseModel):
    claim_number: str
    patient_name: str
    insurance_provider: str
    claim_amount: float
    status: str = "DRAFT" # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID

class ClaimUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None

class ClaimResponse(ClaimCreate):
    id: uuid.UUID
    organization_id: uuid.UUID
    branch_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ClaimHistoryResponse(BaseModel):
    id: uuid.UUID
    claim_id: uuid.UUID
    old_status: str
    new_status: str
    changed_by: Optional[uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True
