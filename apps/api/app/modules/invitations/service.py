import secrets
import hashlib
from datetime import datetime, timedelta, timezone
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.invitations.schemas import InviteCreate, InviteAccept
from app.modules.invitations.repository import InvitationRepository
from app.db.models.invitation import Invitation
from app.db.models.user import User
from app.db.models.membership import OrganizationMember, BranchMember
from app.db.models.organization import Organization
from app.db.models.audit import AuditLog
from app.core.security import get_password_hash
from app.core.exceptions import APIException
from app.celery.tasks.email import send_invitation_email
from app.core.logging import logger

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

class InvitationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InvitationRepository(db)

    async def invite_member(self, org_id: uuid.UUID, data: InviteCreate, actor_id: uuid.UUID) -> Invitation:
        # Check if active member already exists
        member_check = select(User).join(OrganizationMember).where(
            User.email == data.email,
            OrganizationMember.organization_id == org_id
        )
        res = await self.db.execute(member_check)
        if res.scalar_one_or_none():
            raise APIException(code="MEMBER_ALREADY_EXISTS", message="User is already a member of this organization.", status_code=400)

        # Generate invite token
        raw_token = secrets.token_urlsafe(32)
        token_hashed = hash_token(raw_token)
        
        invite_data = {
            "organization_id": org_id,
            "email": data.email,
            "role": data.role,
            "token_hash": token_hashed,
            "status": "PENDING",
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "invited_by": actor_id
        }
        
        invite = await self.repo.create_invitation(invite_data, data.branch_ids)
        
        # Get organization name for email
        org_res = await self.db.execute(select(Organization).where(Organization.id == org_id))
        org = org_res.scalar_one_or_none()
        org_name = org.name if org else "MediStock Organization"
        
        # Trigger celery email
        invite_link = f"http://localhost:3000/invite/accept?token={raw_token}"
        send_invitation_email.delay(data.email, invite_link, org_name)
        
        # Audit Log
        audit = AuditLog(
            actor_user_id=actor_id,
            organization_id=org_id,
            action="USER_INVITED",
            entity_type="invitation",
            entity_id=invite.id,
            payload={"email": data.email, "role": data.role}
        )
        self.db.add(audit)
        await self.db.commit()
        return invite

    async def get_invite_details(self, token: str) -> dict:
        token_hashed = hash_token(token)
        invite = await self.repo.get_invitation_by_hash(token_hashed)
        if not invite:
            raise APIException(code="INVITATION_NOT_FOUND", message="Invitation not found.", status_code=404)
        
        if invite.status != "PENDING":
            raise APIException(code="INVITATION_NOT_PENDING", message=f"Invitation is already {invite.status}.", status_code=400)
            
        if invite.expires_at < datetime.now(timezone.utc):
            invite.status = "EXPIRED"
            await self.db.commit()
            raise APIException(code="INVITATION_EXPIRED", message="Invitation has expired.", status_code=400)
            
        org_res = await self.db.execute(select(Organization).where(Organization.id == invite.organization_id))
        org = org_res.scalar_one()
        
        return {
            "email": invite.email,
            "organization_name": org.name,
            "role": invite.role
        }

    async def accept_invite(self, token: str, data: InviteAccept) -> User:
        token_hashed = hash_token(token)
        invite = await self.repo.get_invitation_by_hash(token_hashed)
        if not invite or invite.status != "PENDING" or invite.expires_at < datetime.now(timezone.utc):
            raise APIException(code="INVALID_INVITATION", message="Invitation is invalid, expired, or already used.", status_code=400)

        # Check if user already exists
        user_res = await self.db.execute(select(User).where(User.email == invite.email))
        user = user_res.scalar_one_or_none()
        
        try:
            if not user:
                # Create user
                user = User(
                    email=invite.email,
                    password_hash=get_password_hash(data.password),
                    full_name=data.full_name,
                    is_active=True,
                    is_platform_admin=False
                )
                self.db.add(user)
                await self.db.flush()

            # Create Org member
            member = OrganizationMember(
                organization_id=invite.organization_id,
                user_id=user.id,
                role=invite.role,
                status="ACTIVE"
            )
            self.db.add(member)

            # Assign to branches
            branch_ids = await self.repo.get_invitation_branches(invite.id)
            for b_id in branch_ids:
                b_member = BranchMember(
                    organization_id=invite.organization_id,
                    branch_id=b_id,
                    user_id=user.id
                )
                self.db.add(b_member)

            # Update Invitation
            invite.status = "ACCEPTED"
            invite.accepted_at = datetime.now(timezone.utc)
            
            # Audit log
            audit = AuditLog(
                actor_user_id=user.id,
                organization_id=invite.organization_id,
                action="ROLE_CHANGED",
                entity_type="user",
                entity_id=user.id,
                payload={"email": invite.email, "role": invite.role, "action_detail": "Accepted invitation"}
            )
            self.db.add(audit)
            
            await self.db.commit()
            logger.info(f"User {invite.email} accepted invitation and joined organization {invite.organization_id}")
            return user
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to accept invitation: {e}")
            raise APIException(code="ACCEPT_INVITE_FAILED", message="Failed to join organization.", status_code=500)

