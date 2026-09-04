from fastapi import APIRouter, Depends, Query
from typing import Optional
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.permissions import get_current_user, require_staff, require_pharmacist
from app.db.models.user import User
from app.db.models.claim import InsuranceClaim, ClaimStatusHistory
from app.db.models.audit import AuditLog
from app.modules.claims.schemas import ClaimCreate, ClaimUpdate, ClaimResponse, ClaimHistoryResponse
from app.core.exceptions import APIException

router = APIRouter()

@router.post("/{organization_id}/claims", response_model=ClaimResponse)
async def create_claim(
    organization_id: uuid.UUID,
    branch_id: uuid.UUID,
    data: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_pharmacist(check_branch=True))
):
    # Check claim number unique per org
    chk_stmt = select(InsuranceClaim).where(
        InsuranceClaim.organization_id == organization_id,
        InsuranceClaim.claim_number == data.claim_number
    )
    res = await db.execute(chk_stmt)
    if res.scalar_one_or_none():
        raise APIException(code="CLAIM_NUMBER_EXISTS", message=f"Claim number '{data.claim_number}' already exists.", status_code=400)
        
    claim = InsuranceClaim(
        organization_id=organization_id,
        branch_id=branch_id,
        assigned_to=current_user.id,
        submitted_at=datetime.now(timezone.utc) if data.status != "DRAFT" else None,
        **data.model_dump()
    )
    db.add(claim)
    await db.flush()
    
    # Save default history
    hist = ClaimStatusHistory(
        claim_id=claim.id,
        old_status="NONE",
        new_status=data.status,
        changed_by=current_user.id
    )
    db.add(hist)
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        organization_id=organization_id,
        branch_id=branch_id,
        action="CLAIM_STATUS_CHANGED",
        entity_type="insurance_claim",
        entity_id=claim.id,
        payload={"old_status": "NONE", "new_status": data.status}
    )
    db.add(audit)
    await db.commit()
    
    return claim

@router.get("/{organization_id}/claims", response_model=list[ClaimResponse])
async def list_claims(
    organization_id: uuid.UUID,
    branch_id: Optional[uuid.UUID] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_staff(check_branch=False))
):
    stmt = select(InsuranceClaim).where(InsuranceClaim.organization_id == organization_id)
    if branch_id:
        stmt = stmt.where(InsuranceClaim.branch_id == branch_id)
    if status:
        stmt = stmt.where(InsuranceClaim.status == status)
        
    res = await db.execute(stmt)
    return list(res.scalars().all())

@router.get("/{organization_id}/claims/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    organization_id: uuid.UUID,
    claim_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_staff(check_branch=True))
):
    stmt = select(InsuranceClaim).where(InsuranceClaim.id == claim_id, InsuranceClaim.organization_id == organization_id)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise APIException(code="CLAIM_NOT_FOUND", message="Insurance claim not found.", status_code=404)
    return claim

@router.put("/{organization_id}/claims/{claim_id}", response_model=ClaimResponse)
async def update_claim(
    organization_id: uuid.UUID,
    claim_id: uuid.UUID,
    data: ClaimUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_pharmacist(check_branch=True))
):
    stmt = select(InsuranceClaim).where(InsuranceClaim.id == claim_id, InsuranceClaim.organization_id == organization_id)
    res = await db.execute(stmt)
    claim = res.scalar_one_or_none()
    if not claim:
        raise APIException(code="CLAIM_NOT_FOUND", message="Insurance claim not found.", status_code=404)
        
    old_status = claim.status
    
    if data.status and data.status != old_status:
        claim.status = data.status
        if old_status == "DRAFT" and data.status != "DRAFT":
            claim.submitted_at = datetime.now(timezone.utc)
            
        # Append history
        hist = ClaimStatusHistory(
            claim_id=claim.id,
            old_status=old_status,
            new_status=data.status,
            changed_by=current_user.id
        )
        db.add(hist)
        
        # Audit log
        audit = AuditLog(
            actor_user_id=current_user.id,
            organization_id=organization_id,
            branch_id=claim.branch_id,
            action="CLAIM_STATUS_CHANGED",
            entity_type="insurance_claim",
            entity_id=claim.id,
            payload={"old_status": old_status, "new_status": data.status}
        )
        db.add(audit)
        
    if data.assigned_to:
        claim.assigned_to = data.assigned_to
        
    await db.commit()
    return claim

@router.get("/{organization_id}/claims/{claim_id}/history", response_model=list[ClaimHistoryResponse])
async def get_claim_history(
    organization_id: uuid.UUID,
    claim_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_staff(check_branch=True))
):
    stmt = select(ClaimStatusHistory).where(ClaimStatusHistory.claim_id == claim_id).order_by(ClaimStatusHistory.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())
