from fastapi import APIRouter, Depends, Query
from typing import Optional
import uuid
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.db.session import get_db
from app.core.permissions import get_current_user, require_manager
from app.db.models.sale import Sale
from app.db.models.inventory import BranchInventory, ItemBatch
from app.db.models.claim import InsuranceClaim
from app.db.models.branch import Branch
from app.modules.analytics.schemas import DashboardAnalyticsResponse

router = APIRouter()

@router.get("/{organization_id}/analytics/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard_analytics(
    organization_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=False))
):
    # Setup base filters
    sale_filters = [Sale.organization_id == organization_id]
    inv_filters = [BranchInventory.organization_id == organization_id]
    claim_filters = [InsuranceClaim.organization_id == organization_id]
    
    if branch_id:
        sale_filters.append(Sale.branch_id == branch_id)
        inv_filters.append(BranchInventory.branch_id == branch_id)
        claim_filters.append(InsuranceClaim.branch_id == branch_id)
        
    if date_from:
        sale_filters.append(Sale.sale_date >= datetime.combine(date_from, datetime.min.time(), tzinfo=timezone.utc))
        claim_filters.append(InsuranceClaim.created_at >= datetime.combine(date_from, datetime.min.time(), tzinfo=timezone.utc))
        
    if date_to:
        sale_filters.append(Sale.sale_date <= datetime.combine(date_to, datetime.max.time(), tzinfo=timezone.utc))
        claim_filters.append(InsuranceClaim.created_at <= datetime.combine(date_to, datetime.max.time(), tzinfo=timezone.utc))

    # 1. Revenue Analytics
    rev_stmt = select(
        func.coalesce(func.sum(Sale.total_revenue), 0.0),
        func.coalesce(func.sum(Sale.gross_profit), 0.0),
        func.count(Sale.id)
    ).where(and_(*sale_filters))
    rev_res = await db.execute(rev_stmt)
    total_rev, total_profit, sale_count = rev_res.fetchone() or (0.0, 0.0, 0)
    
    revenue_data = {
        "total_revenue": float(total_rev),
        "total_profit": float(total_profit),
        "sales_count": sale_count
    }

    # 2. Inventory Analytics
    inv_stmt = select(
        func.coalesce(func.sum(BranchInventory.inventory_value), 0.0),
        func.count(BranchInventory.id)
    ).where(and_(*inv_filters))
    inv_res = await db.execute(inv_stmt)
    total_value, item_count = inv_res.fetchone() or (0.0, 0)
    
    inventory_data = {
        "total_value": float(total_value),
        "items_count": item_count
    }

    # 3. Claims Analytics
    claim_stmt = select(
        InsuranceClaim.status,
        func.count(InsuranceClaim.id),
        func.coalesce(func.sum(InsuranceClaim.claim_amount), 0.0)
    ).where(and_(*claim_filters)).group_by(InsuranceClaim.status)
    claim_res = await db.execute(claim_stmt)
    
    claims_status_map = {}
    total_claim_amount = 0.0
    for status, count, amt in claim_res.fetchall():
        claims_status_map[status] = {"count": count, "amount": float(amt)}
        total_claim_amount += float(amt)
        
    claims_data = {
        "status_distribution": claims_status_map,
        "total_amount": total_claim_amount
    }

    # 4. Expiry Risk Analytics
    # Expired vs Expiring <30
    today = date.today()
    expiry_stmt = (
        select(
            ItemBatch.expiry_date,
            BranchInventory.inventory_value
        )
        .join(ItemBatch, ItemBatch.id == BranchInventory.batch_id)
        .where(and_(*inv_filters))
    )
    expiry_res = await db.execute(expiry_stmt)
    expired_val = 0.0
    expiring_30_val = 0.0
    expired_cnt = 0
    expiring_30_cnt = 0
    
    for expiry_date, val in expiry_res.fetchall():
        if expiry_date:
            delta = expiry_date - today
            if delta.days < 0:
                expired_val += float(val)
                expired_cnt += 1
            elif delta.days <= 30:
                expiring_30_val += float(val)
                expiring_30_cnt += 1
                
    expiry_data = {
        "expired_count": expired_cnt,
        "expired_value": expired_val,
        "expiring_30_count": expiring_30_cnt,
        "expiring_30_value": expiring_30_val
    }

    # 5. Branch Performance
    perf_stmt = (
        select(
            Branch.id,
            Branch.name,
            func.coalesce(func.sum(Sale.total_revenue), 0.0),
            func.coalesce(func.sum(Sale.gross_profit), 0.0)
        )
        .join(Branch, Branch.id == Sale.branch_id)
        .where(Sale.organization_id == organization_id)
        .group_by(Branch.id, Branch.name)
    )
    perf_res = await db.execute(perf_stmt)
    branch_performance = []
    for b_id, b_name, b_rev, b_prof in perf_res.fetchall():
        branch_performance.append({
            "branch_id": str(b_id),
            "branch_name": b_name,
            "revenue": float(b_rev),
            "profit": float(b_prof)
        })
        
    return DashboardAnalyticsResponse(
        revenue=revenue_data,
        inventory=inventory_data,
        claims=claims_data,
        expiry=expiry_data,
        branch_performance=branch_performance
    )
