import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models.invitation import Invitation, InvitationBranch
from app.db.models.user import User
from app.db.models.membership import OrganizationMember, BranchMember
from datetime import datetime, timezone

class InvitationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invitation(self, data: dict, branch_ids: list[uuid.UUID]) -> Invitation:
        invite = Invitation(**data)
        self.db.add(invite)
        await self.db.flush()

        for b_id in branch_ids:
            inv_branch = InvitationBranch(invitation_id=invite.id, branch_id=b_id)
            self.db.add(inv_branch)
        
        await self.db.flush()
        return invite

    async def get_invitation_by_hash(self, token_hash: str) -> Invitation | None:
        result = await self.db.execute(select(Invitation).where(Invitation.token_hash == token_hash))
        return result.scalar_one_or_none()

    async def get_invitation_branches(self, invite_id: uuid.UUID) -> list[uuid.UUID]:
        result = await self.db.execute(
            select(InvitationBranch.branch_id).where(InvitationBranch.invitation_id == invite_id)
        )
        return [row[0] for row in result.all()]
