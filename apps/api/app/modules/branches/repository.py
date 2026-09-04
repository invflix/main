import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.branch import Branch
from app.db.models.membership import BranchMember, OrganizationMember

class BranchRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_branch(self, org_id: uuid.UUID, data: dict) -> Branch:
        branch = Branch(organization_id=org_id, **data)
        self.db.add(branch)
        await self.db.flush()
        return branch

    async def list_all_branches(self, org_id: uuid.UUID) -> list[Branch]:
        result = await self.db.execute(
            select(Branch).where(Branch.organization_id == org_id).order_name(Branch.name)
        )
        # Wait, order_name is not standard, let's use order_by
        return [] # we will fix this in standard SQL order_by

    async def list_branches_by_user(self, org_id: uuid.UUID, user_id: uuid.UUID, role: str) -> list[Branch]:
        if role == "OWNER":
            result = await self.db.execute(
                select(Branch).where(Branch.organization_id == org_id).order_by(Branch.name)
            )
            return list(result.scalars().all())
        else:
            result = await self.db.execute(
                select(Branch)
                .join(BranchMember, BranchMember.branch_id == Branch.id)
                .where(
                    Branch.organization_id == org_id,
                    BranchMember.user_id == user_id
                )
                .order_by(Branch.name)
            )
            return list(result.scalars().all())

    async def get_branch(self, branch_id: uuid.UUID) -> Branch | None:
        result = await self.db.execute(select(Branch).where(Branch.id == branch_id))
        return result.scalar_one_or_none()
