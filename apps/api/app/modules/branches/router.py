from fastapi import APIRouter, Depends, Security
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.permissions import get_current_user, require_owner, require_cashier
from app.db.models.user import User
from app.modules.branches.schemas import BranchCreate, BranchUpdate, BranchResponse
from app.modules.branches.service import BranchService

router = APIRouter()

@router.post("/{organization_id}/branches", response_model=BranchResponse)
async def create_branch(
    organization_id: uuid.UUID,
    data: BranchCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_owner())
):
    service = BranchService(db)
    # verify_owner will execute and check organization_id boundary
    return await service.create_branch(organization_id, data, current_user.id)

@router.get("/{organization_id}/branches", response_model=list[BranchResponse])
async def list_branches(
    organization_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    membership = Depends(require_cashier(check_branch=False))
):
    service = BranchService(db)
    return await service.list_branches(organization_id, current_user.id, membership.role)

@router.get("/{organization_id}/branches/{branch_id}", response_model=BranchResponse)
async def get_branch(
    organization_id: uuid.UUID,
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_cashier(check_branch=True))
):
    service = BranchService(db)
    return await service.get_branch(organization_id, branch_id)

@router.put("/{organization_id}/branches/{branch_id}", response_model=BranchResponse)
async def update_branch(
    organization_id: uuid.UUID,
    branch_id: uuid.UUID,
    data: BranchUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_owner())
):
    service = BranchService(db)
    return await service.update_branch(organization_id, branch_id, data, current_user.id)
