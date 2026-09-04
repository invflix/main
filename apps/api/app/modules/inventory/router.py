from fastapi import APIRouter, Depends, Query
from typing import Optional
import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from app.db.session import get_db
from app.core.permissions import get_current_user, require_cashier
from app.db.models.user import User
from app.db.models.inventory import Item, ItemBatch, BranchInventory
from app.db.models.branch import Branch
from app.modules.inventory.schemas import InventoryDetailResponse, ExpirySummaryResponse, ItemCreate, ItemResponse
from app.core.exceptions import APIException

router = APIRouter()

def get_expiry_status(expiry_date: date | None) -> str:
    if not expiry_date:
        return "HEALTHY"
    today = date.today()
    delta = expiry_date - today
    if delta.days < 0:
        return "EXPIRED"
    elif delta.days <= 30:
        return "EXPIRING_30_DAYS"
    elif delta.days <= 60:
        return "EXPIRING_60_DAYS"
    elif delta.days <= 90:
        return "EXPIRING_90_DAYS"
    return "HEALTHY"

@router.get("/{organization_id}/inventory", response_model=list[InventoryDetailResponse])
async def list_inventory(
    organization_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    search: Optional[str] = Query(None),
    expiry_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=False))
):
    stmt = (
        select(BranchInventory, Item, ItemBatch, Branch.name)
        .join(Item, Item.id == BranchInventory.item_id)
        .join(ItemBatch, ItemBatch.id == BranchInventory.batch_id)
        .join(Branch, Branch.id == BranchInventory.branch_id)
        .where(BranchInventory.organization_id == organization_id)
    )

    if branch_id:
        stmt = stmt.where(BranchInventory.branch_id == branch_id)

    if search:
        search_lower = f"%{search.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Item.item_name).like(search_lower),
                func.lower(Item.item_code).like(search_lower),
                func.lower(ItemBatch.lot_number).like(search_lower)
            )
        )

    res = await db.execute(stmt)
    rows = res.all()

    output = []
    for bi, item, batch, branch_name in rows:
        status = get_expiry_status(batch.expiry_date)
        if expiry_status and status != expiry_status:
            continue
            
        output.append(
            InventoryDetailResponse(
                inventory_id=bi.id,
                organization_id=bi.organization_id,
                branch_id=bi.branch_id,
                branch_name=branch_name,
                item_id=item.id,
                item_name=item.item_name,
                item_code=item.item_code,
                item_class=item.item_class,
                description=item.description,
                primary_uom=item.primary_uom,
                secondary_uom=item.secondary_uom,
                secondary_uom_conversion=item.secondary_uom_conversion,
                part_number=item.part_number,
                batch_id=batch.id,
                lot_number=batch.lot_number,
                expiry_date=batch.expiry_date,
                locator=bi.locator,
                primary_quantity=float(bi.primary_quantity),
                secondary_quantity=float(bi.secondary_quantity) if bi.secondary_quantity else None,
                unit_price=float(bi.unit_price),
                inventory_value=float(bi.inventory_value),
                expiry_status=status
            )
        )
    return output

@router.get("/{organization_id}/inventory/expiry-summary", response_model=ExpirySummaryResponse)
async def get_expiry_summary(
    organization_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=False))
):
    stmt = (
        select(BranchInventory, ItemBatch)
        .join(ItemBatch, ItemBatch.id == BranchInventory.batch_id)
        .where(BranchInventory.organization_id == organization_id)
    )
    if branch_id:
        stmt = stmt.where(BranchInventory.branch_id == branch_id)
        
    res = await db.execute(stmt)
    rows = res.all()
    
    expired = 0
    expiring_30 = 0
    expiring_60 = 0
    expiring_90 = 0
    healthy = 0
    value_at_risk = 0.0
    
    for bi, batch in rows:
        status = get_expiry_status(batch.expiry_date)
        val = float(bi.inventory_value)
        
        if status == "EXPIRED":
            expired += 1
            value_at_risk += val
        elif status == "EXPIRING_30_DAYS":
            expiring_30 += 1
            value_at_risk += val
        elif status == "EXPIRING_60_DAYS":
            expiring_60 += 1
        elif status == "EXPIRING_90_DAYS":
            expiring_90 += 1
        else:
            healthy += 1
            
    return ExpirySummaryResponse(
        expired_count=expired,
        expiring_30_count=expiring_30,
        expiring_60_count=expiring_60,
        expiring_90_count=expiring_90,
        healthy_count=healthy,
        value_at_risk=value_at_risk
    )

@router.post("/{organization_id}/inventory/items", response_model=ItemResponse)
async def create_item(
    organization_id: uuid.UUID,
    data: ItemCreate,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=False))
):
    # Verify uniqueness of item code
    code_stmt = select(Item).where(
        Item.organization_id == organization_id,
        Item.item_code == data.item_code
    )
    res = await db.execute(code_stmt)
    if res.scalar_one_or_none():
        raise APIException(code="ITEM_CODE_EXISTS", message=f"Item with code '{data.item_code}' already exists.", status_code=400)
        
    item = Item(organization_id=organization_id, **data.model_dump())
    db.add(item)
    await db.commit()
    return item
