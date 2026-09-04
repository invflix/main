from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

class SaleItemCreate(BaseModel):
    item_id: uuid.UUID
    batch_id: uuid.UUID
    quantity: float
    unit_cost: float
    selling_price: float

class SaleCreate(BaseModel):
    branch_id: uuid.UUID
    sale_number: str
    sale_date: Optional[datetime] = None
    items: List[SaleItemCreate]

class SaleItemResponse(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    batch_id: uuid.UUID
    quantity: float
    unit_cost: float
    selling_price: float
    revenue: float
    cost: float
    profit: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    branch_id: uuid.UUID
    sale_number: str
    sold_by: Optional[uuid.UUID]
    sale_date: datetime
    total_revenue: float
    total_cost: float
    gross_profit: float
    created_at: datetime
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True
