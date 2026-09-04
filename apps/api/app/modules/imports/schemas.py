from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

class UploadResponse(BaseModel):
    import_id: uuid.UUID
    file_name: str
    headers: List[str]
    preview_rows: List[Dict[str, Any]]
    total_rows: int

class MapColumnsRequest(BaseModel):
    # Mapping of target fields (keys) to Excel headers (values)
    mapping: Dict[str, str]

class MapColumnsResponse(BaseModel):
    import_id: uuid.UUID
    status: str
    total_rows: int
    valid_rows: int
    warning_rows: int
    error_rows: int
    errors: List[Dict[str, Any]] = []

class ImportStatusResponse(BaseModel):
    id: uuid.UUID
    status: str
    total_rows: int
    valid_rows: int
    warning_rows: int
    error_rows: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
