from fastapi import APIRouter, Depends, Query
from typing import Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.permissions import get_current_user, require_cashier
from app.db.models.user import User
from app.db.models.sale import Sale, SaleItem
from app.db.models.inventory import BranchInventory
from app.db.models.audit import AuditLog
from app.modules.sales.schemas import SaleCreate, SaleResponse, SaleItemResponse
from app.core.exceptions import APIException

router = APIRouter()

@router.post("/{organization_id}/sales", response_model=SaleResponse)
async def create_sale(
    organization_id: uuid.UUID,
    data: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=True))
):
    # Verify unique sale number
    chk_stmt = select(Sale).where(
        Sale.organization_id == organization_id,
        Sale.sale_number == data.sale_number
    )
    res = await db.execute(chk_stmt)
    if res.scalar_one_or_none():
        raise APIException(code="SALE_NUMBER_EXISTS", message=f"Sale number '{data.sale_number}' already exists.", status_code=400)

    try:
        # Calculate totals
        total_rev = 0.0
        total_cost = 0.0
        sale_items_to_add = []
        
        for item_data in data.items:
            rev = item_data.quantity * item_data.selling_price
            cost = item_data.quantity * item_data.unit_cost
            profit = rev - cost
            
            total_rev += rev
            total_cost += cost
            
            sale_item = SaleItem(
                item_id=item_data.item_id,
                batch_id=item_data.batch_id,
                quantity=item_data.quantity,
                unit_cost=item_data.unit_cost,
                selling_price=item_data.selling_price,
                revenue=rev,
                cost=cost,
                profit=profit
            )
            sale_items_to_add.append(sale_item)
            
            # Deduct inventory quantity from BranchInventory
            inv_stmt = select(BranchInventory).where(
                BranchInventory.branch_id == data.branch_id,
                BranchInventory.item_id == item_data.item_id,
                BranchInventory.batch_id == item_data.batch_id
            )
            inv_res = await db.execute(inv_stmt)
            inv = inv_res.scalar_one_or_none()
            if inv:
                # Deduct primary qty
                inv.primary_quantity = max(0.0, float(inv.primary_quantity) - item_data.quantity)
                # Deduct secondary quantity if conversion factor exists
                if inv.secondary_quantity and inv.secondary_quantity > 0:
                    # Let's read item conversion factor or use default
                    inv.secondary_quantity = max(0.0, float(inv.secondary_quantity) - (item_data.quantity * 10)) # default conversion 10
                inv.inventory_value = float(inv.primary_quantity) * float(inv.unit_price)

        gross_profit = total_rev - total_cost
        
        sale = Sale(
            organization_id=organization_id,
            branch_id=data.branch_id,
            sale_number=data.sale_number,
            sold_by=current_user.id,
            sale_date=data.sale_date or datetime.now(timezone.utc),
            total_revenue=total_rev,
            total_cost=total_cost,
            gross_profit=gross_profit
        )
        db.add(sale)
        await db.flush()
        
        # Link sale items
        for si in sale_items_to_add:
            si.sale_id = sale.id
            db.add(si)
            
        # Audit log
        audit = AuditLog(
            actor_user_id=current_user.id,
            organization_id=organization_id,
            branch_id=data.branch_id,
            action="SALE_CREATED",
            entity_type="sale",
            entity_id=sale.id,
            payload={"total_revenue": total_rev, "gross_profit": gross_profit}
        )
        db.add(audit)
        
        await db.commit()
        
        # Reload sale with items
        stmt = select(Sale).where(Sale.id == sale.id)
        sale_res = await db.execute(stmt)
        result_sale = sale_res.scalar_one()
        
        # Load items
        si_stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
        si_res = await db.execute(si_stmt)
        result_sale.items = list(si_res.scalars().all())
        
        return result_sale
        
    except Exception as e:
        await db.rollback()
        raise APIException(code="SALE_RECORD_FAILED", message=f"Failed to record sale: {str(e)}", status_code=500)

@router.get("/{organization_id}/sales", response_model=list[SaleResponse])
async def list_sales(
    organization_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=False))
):
    stmt = select(Sale).where(Sale.organization_id == organization_id).order_by(Sale.sale_date.desc())
    if branch_id:
        stmt = stmt.where(Sale.branch_id == branch_id)
        
    res = await db.execute(stmt)
    sales = list(res.scalars().all())
    
    # Load items for each sale
    for sale in sales:
        si_stmt = select(SaleItem).where(SaleItem.sale_id == sale.id)
        si_res = await db.execute(si_stmt)
        sale.items = list(si_res.scalars().all())
        
    return sales
