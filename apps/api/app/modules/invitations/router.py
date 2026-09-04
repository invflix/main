from fastapi import APIRouter, Depends
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.permissions import get_current_user, require_owner
from app.db.models.user import User
from app.modules.invitations.schemas import InviteCreate, InviteResponse, InviteAccept
from app.modules.invitations.service import InvitationService

router = APIRouter()

@router.post("/organizations/{organization_id}/team/invite", response_model=InviteResponse)
async def invite_member(
    organization_id: uuid.UUID,
    data: InviteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_owner())
):
    service = InvitationService(db)
    return await service.invite_member(organization_id, data, current_user.id)

@router.get("/invitations/{token}")
async def get_invite_details(token: str, db: AsyncSession = Depends(get_db)):
    service = InvitationService(db)
    return await service.get_invite_details(token)

@router.post("/invitations/{token}/accept")
async def accept_invitation(token: str, data: InviteAccept, db: AsyncSession = Depends(get_db)):
    service = InvitationService(db)
    user = await service.accept_invite(token, data)
    return {"status": "success", "message": "Invitation accepted.", "user_email": user.email}
