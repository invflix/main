import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.user import User
from app.db.models.membership import OrganizationMember, BranchMember
from app.db.models.organization import Organization

class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_org_membership(self, user_id: uuid.UUID) -> OrganizationMember | None:
        result = await self.db.execute(
            select(OrganizationMember).where(
                OrganizationMember.user_id == user_id,
                OrganizationMember.status == "ACTIVE"
            )
        )
        return result.scalar_one_or_none()

    async def get_organization(self, org_id: uuid.UUID) -> Organization | None:
        result = await self.db.execute(select(Organization).where(Organization.id == org_id))
        return result.scalar_one_or_none()

    async def get_user_branch_ids(self, user_id: uuid.UUID) -> list[uuid.UUID]:
        result = await self.db.execute(select(BranchMember.branch_id).where(BranchMember.user_id == user_id))
        return [row[0] for row in result.all()]
