from typing import List, Optional
import uuid
from fastapi import Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import decode_token
from app.core.exceptions import APIException
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.membership import OrganizationMember, BranchMember

security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise APIException(code="UNAUTHORIZED", message="Invalid token payload.", status_code=401)
    
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise APIException(code="USER_NOT_FOUND", message="User not found.", status_code=404)
    if not user.is_active:
        raise APIException(code="INACTIVE_USER", message="User is inactive.", status_code=403)
    return user

async def get_current_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_platform_admin:
        raise APIException(code="FORBIDDEN", message="Platform admin role required.", status_code=403)
    return current_user

class PermissionChecker:
    def __init__(self, allowed_roles: List[str], check_branch: bool = False):
        self.allowed_roles = allowed_roles
        self.check_branch = check_branch

    async def __call__(
        self,
        organization_id: uuid.UUID,
        branch_id: Optional[uuid.UUID] = None,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> OrganizationMember:
        # Platform Admin bypass
        if current_user.is_platform_admin:
            # Create a mock/virtual owner membership for Super Admin context mapping
            return OrganizationMember(
                organization_id=organization_id,
                user_id=current_user.id,
                role="OWNER",
                status="ACTIVE"
            )

        # 1. Verify Organization Membership
        stmt = select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.status == "ACTIVE"
        )
        res = await db.execute(stmt)
        membership = res.scalar_one_or_none()
        
        if not membership:
            raise APIException(
                code="ORGANIZATION_ACCESS_DENIED", 
                message="You do not belong to this organization.", 
                status_code=403
            )

        # 2. Verify Role Permissions
        if membership.role not in self.allowed_roles:
            raise APIException(
                code="ROLE_ACCESS_DENIED", 
                message="Your role does not have permission to perform this action.", 
                status_code=403
            )

        # OWNER has full access to all branches implicitly
        if membership.role == "OWNER":
            return membership

        # 3. Verify Branch Access if needed
        if self.check_branch and branch_id:
            branch_stmt = select(BranchMember).where(
                BranchMember.branch_id == branch_id,
                BranchMember.user_id == current_user.id
            )
            branch_res = await db.execute(branch_stmt)
            branch_membership = branch_res.scalar_one_or_none()
            
            if not branch_membership:
                raise APIException(
                    code="BRANCH_ACCESS_DENIED", 
                    message="You do not have access to this branch.", 
                    status_code=403
                )
                
        return membership

# Convenience dependencies mapping to roles:
# Owners have access to everything
def require_owner(branch_id: Optional[uuid.UUID] = None):
    return PermissionChecker(allowed_roles=["OWNER"])

# Managers and Owners
def require_manager(check_branch: bool = True, branch_id: Optional[uuid.UUID] = None):
    return PermissionChecker(allowed_roles=["OWNER", "MANAGER"], check_branch=check_branch)

# Pharmacists, Managers, Owners
def require_pharmacist(check_branch: bool = True, branch_id: Optional[uuid.UUID] = None):
    return PermissionChecker(allowed_roles=["OWNER", "MANAGER", "PHARMACIST"], check_branch=check_branch)

# Staff, Pharmacists, Managers, Owners
def require_staff(check_branch: bool = True, branch_id: Optional[uuid.UUID] = None):
    return PermissionChecker(allowed_roles=["OWNER", "MANAGER", "PHARMACIST", "STAFF"], check_branch=check_branch)

# Cashiers and everyone else
def require_cashier(check_branch: bool = True, branch_id: Optional[uuid.UUID] = None):
    return PermissionChecker(allowed_roles=["OWNER", "MANAGER", "PHARMACIST", "STAFF", "CASHIER"], check_branch=check_branch)
