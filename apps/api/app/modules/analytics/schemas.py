from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardAnalyticsResponse(BaseModel):
    revenue: Dict[str, Any]
    inventory: Dict[str, Any]
    claims: Dict[str, Any]
    expiry: Dict[str, Any]
    branch_performance: List[Dict[str, Any]]
