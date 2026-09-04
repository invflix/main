from fastapi import APIRouter, Depends
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_db
from app.core.permissions import get_current_user, require_owner, require_manager
from app.db.models.user import User
from app.db.models.membership import OrganizationMember, BranchMember
from app.db.models.audit import AuditLog
from app.modules.team.schemas import TeamMemberResponse, TeamRoleUpdate
from app.core.exceptions import APIException

router = APIRouter()

@router.get("/{organization_id}/team", response_model=list[TeamMemberResponse])

async def list_team_members(
    organization_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=False))
):
    # Fetch all members of the organization
    stmt = (
        select(User, OrganizationMember)
        .join(OrganizationMember, OrganizationMember.user_id == User.id)
        .where(OrganizationMember.organization_id == organization_id)
    )
    res = await db.execute(stmt)
    rows = res.all()
    
    output = []
    for user, member in rows:
        # Fetch branch memberships for this user
        branch_stmt = select(BranchMember.branch_id).where(
            BranchMember.organization_id == organization_id,
            BranchMember.user_id == user.id
        )
        branch_res = await db.execute(branch_stmt)
        branch_ids = [r[0] for r in branch_res.all()]
        
        output.append(
            TeamMemberResponse(
                user_id=user.id,
                full_name=user.full_name,
                email=user.email,
                role=member.role,
                status=member.status,
                branch_ids=branch_ids,
                is_active=user.is_active
            )
        )
    return output

@router.put("/{organization_id}/team/{user_id}/role", response_model=dict)
async def update_member_role(
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    data: TeamRoleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_owner())
):
    stmt = select(OrganizationMember).where(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == user_id
    )
    res = await db.execute(stmt)
    member = res.scalar_one_or_none()
    if not member:
        raise APIException(code="MEMBER_NOT_FOUND", message="Team member not found.", status_code=404)
        
    old_role = member.role
    member.role = data.role
    
    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        organization_id=organization_id,
        action="ROLE_CHANGED",
        entity_type="user",
        entity_id=user_id,
        payload={"user_id": str(user_id), "old_role": old_role, "new_role": data.role}
    )
    db.add(audit)
    await db.commit()
    
    return {"status": "success", "message": "Role updated successfully."}

@router.delete("/{organization_id}/team/{user_id}", response_model=dict)
async def remove_team_member(
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_owner())
):
    if user_id == current_user.id:
        raise APIException(code="BAD_REQUEST", message="You cannot remove yourself.", status_code=400)
        
    # Delete org member
    del_org = delete(OrganizationMember).where(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_id == user_id
    )
    await db.execute(del_org)
    
    # Delete branch memberships
    del_branch = delete(BranchMember).where(
        BranchMember.organization_id == organization_id,
        BranchMember.user_id == user_id
    )
    await db.execute(del_branch)
    
    audit = AuditLog(
        actor_user_id=current_user.id,
        organization_id=organization_id,
        action="MEMBER_REMOVED",
        entity_type="user",
        entity_id=user_id,
        payload={"user_id": str(user_id)}
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "message": "Member removed successfully."}
