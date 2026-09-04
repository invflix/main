import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.branches.schemas import BranchCreate, BranchUpdate
from app.modules.branches.repository import BranchRepository
from app.db.models.branch import Branch
from app.db.models.audit import AuditLog
from app.core.exceptions import APIException
from sqlalchemy import select

class BranchService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BranchRepository(db)

    async def create_branch(self, org_id: uuid.UUID, data: BranchCreate, actor_id: uuid.UUID) -> Branch:
        # Check uniqueness of branch code within org
        code_stmt = select(Branch).where(
            Branch.organization_id == org_id,
            Branch.branch_code == data.branch_code
        )
        res = await self.db.execute(code_stmt)
        if res.scalar_one_or_none():
            raise APIException(
                code="BRANCH_CODE_EXISTS",
                message=f"Branch with code '{data.branch_code}' already exists in this organization.",
                status_code=400
            )

        branch = await self.repo.create_branch(org_id, data.model_dump())
        
        # Audit Log
        audit = AuditLog(
            actor_user_id=actor_id,
            organization_id=org_id,
            branch_id=branch.id,
            action="BRANCH_CREATED",
            entity_type="branch",
            entity_id=branch.id,
            payload={"branch_name": branch.name, "branch_code": branch.branch_code}
        )
        self.db.add(audit)
        await self.db.commit()
        return branch

    async def list_branches(self, org_id: uuid.UUID, user_id: uuid.UUID, role: str) -> list[Branch]:
        return await self.repo.list_branches_by_user(org_id, user_id, role)

    async def get_branch(self, org_id: uuid.UUID, branch_id: uuid.UUID) -> Branch:
        branch = await self.repo.get_branch(branch_id)
        if not branch or branch.organization_id != org_id:
            raise APIException(code="BRANCH_NOT_FOUND", message="Branch not found.", status_code=404)
        return branch

    async def update_branch(self, org_id: uuid.UUID, branch_id: uuid.UUID, data: BranchUpdate, actor_id: uuid.UUID) -> Branch:
        branch = await self.get_branch(org_id, branch_id)
        
        for key, val in data.model_dump(exclude_unset=True).items():
            setattr(branch, key, val)
            
        audit = AuditLog(
            actor_user_id=actor_id,
            organization_id=org_id,
            branch_id=branch.id,
            action="BRANCH_UPDATED",
            entity_type="branch",
            entity_id=branch.id,
            payload=data.model_dump(exclude_unset=True)
        )
        self.db.add(audit)
        await self.db.commit()
        return branch
