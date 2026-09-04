from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.core.permissions import get_current_super_admin
from app.db.models.user import User
from app.db.models.organization import Organization
from app.db.models.branch import Branch
from app.db.models.inventory import InventoryImport
from app.db.models.audit import AuditLog
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class PlatformStatsResponse(BaseModel):
    total_organizations: int
    total_branches: int
    total_users: int
    recent_organizations: List[Dict[str, Any]]
    import_failures: List[Dict[str, Any]]

@router.get("/stats", response_model=PlatformStatsResponse)
async def get_platform_stats(
    db: AsyncSession = Depends(get_db),
    _ = Depends(get_current_super_admin)
):
    # Total Orgs
    orgs_cnt = await db.execute(select(func.count(Organization.id)))
    total_orgs = orgs_cnt.scalar() or 0
    
    # Total Branches
    branches_cnt = await db.execute(select(func.count(Branch.id)))
    total_branches = branches_cnt.scalar() or 0
    
    # Total Users
    users_cnt = await db.execute(select(func.count(User.id)))
    total_users = users_cnt.scalar() or 0
    
    # Recent Organizations
    recent_orgs_stmt = select(Organization).order_by(Organization.created_at.desc()).limit(5)
    recent_orgs_res = await db.execute(recent_orgs_stmt)
    recent_orgs = []
    for org in recent_orgs_res.scalars().all():
        recent_orgs.append({
            "id": str(org.id),
            "name": org.name,
            "created_at": org.created_at.isoformat()
        })
        
    # Import Failures
    failures_stmt = (
        select(InventoryImport, Organization.name)
        .join(Organization, Organization.id == InventoryImport.organization_id)
        .where(InventoryImport.status == "FAILED")
        .order_by(InventoryImport.created_at.desc())
        .limit(5)
    )
    failures_res = await db.execute(failures_stmt)
    failures = []
    for imp, org_name in failures_res.all():
        failures.append({
            "id": str(imp.id),
            "organization_name": org_name,
            "file_name": imp.file_name,
            "created_at": imp.created_at.isoformat()
        })
        
    return PlatformStatsResponse(
        total_organizations=total_orgs,
        total_branches=total_branches,
        total_users=total_users,
        recent_organizations=recent_orgs,
        import_failures=failures
    )

@router.get("/organizations")
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    _ = Depends(get_current_super_admin)
):
    # Retrieve all organizations with branch and user counts
    stmt = select(Organization)
    res = await db.execute(stmt)
    orgs = res.scalars().all()
    
    output = []
    for org in orgs:
        # Branch count
        b_cnt_stmt = select(func.count(Branch.id)).where(Branch.organization_id == org.id)
        b_cnt_res = await db.execute(b_cnt_stmt)
        b_count = b_cnt_res.scalar() or 0
        
        # User count
        # Wait, we need to join organization_members or count memberships
        from app.db.models.membership import OrganizationMember
        u_cnt_stmt = select(func.count(OrganizationMember.id)).where(OrganizationMember.organization_id == org.id)
        u_cnt_res = await db.execute(u_cnt_stmt)
        u_count = u_cnt_res.scalar() or 0
        
        output.append({
            "id": str(org.id),
            "name": org.name,
            "business_email": org.business_email,
            "phone": org.phone,
            "branch_count": b_count,
            "user_count": u_count,
            "created_at": org.created_at.isoformat()
        })
    return output

@router.get("/audit-logs")
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    _ = Depends(get_current_super_admin)
):
    # Fetch platform-wide audit logs
    stmt = select(AuditLog, User.email).outerjoin(User, User.id == AuditLog.actor_user_id).order_by(AuditLog.created_at.desc()).limit(100)
    res = await db.execute(stmt)
    rows = res.all()
    
    output = []
    for log, email in rows:
        output.append({
            "id": str(log.id),
            "actor_email": email or "System / Anonymous",
            "organization_id": str(log.organization_id) if log.organization_id else None,
            "branch_id": str(log.branch_id) if log.branch_id else None,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id) if log.entity_id else None,
            "metadata": log.payload,
            "created_at": log.created_at.isoformat()
        })
    return output
