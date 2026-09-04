from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import date, datetime

class ItemCreate(BaseModel):
    item_code: str
    item_name: str
    item_class: Optional[str] = None
    description: Optional[str] = None
    primary_uom: str
    secondary_uom: Optional[str] = None
    secondary_uom_conversion: Optional[float] = None
    part_number: Optional[str] = None
    alternative_available: bool = False

class ItemResponse(ItemCreate):
    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BatchCreate(BaseModel):
    lot_number: str
    expiry_date: Optional[date] = None

class BatchResponse(BatchCreate):
    id: uuid.UUID
    organization_id: uuid.UUID
    item_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryDetailResponse(BaseModel):
    inventory_id: uuid.UUID
    organization_id: uuid.UUID
    branch_id: uuid.UUID
    branch_name: str
    item_id: uuid.UUID
    item_name: str
    item_code: str
    item_class: Optional[str] = None
    description: Optional[str] = None
    primary_uom: str
    secondary_uom: Optional[str] = None
    secondary_uom_conversion: Optional[float] = None
    part_number: Optional[str] = None
    batch_id: uuid.UUID
    lot_number: str
    expiry_date: Optional[date] = None
    locator: Optional[str] = None
    primary_quantity: float
    secondary_quantity: Optional[float] = None
    unit_price: float
    inventory_value: float
    expiry_status: str # HEALTHY, EXPIRED, EXPIRING_30_DAYS, etc.

    class Config:
        from_attributes = True

class ExpirySummaryResponse(BaseModel):
    expired_count: int
    expiring_30_count: int
    expiring_60_count: int
    expiring_90_count: int
    healthy_count: int
    value_at_risk: float
