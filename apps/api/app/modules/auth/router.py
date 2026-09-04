from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.permissions import get_current_user
from app.db.models.user import User
from app.modules.auth.schemas import UserSignup, UserLogin, TokenRefresh, TokenResponse, MeResponse, UserResponse, SimpleOrgResponse
from app.modules.auth.service import AuthService
from app.modules.auth.repository import AuthRepository
from pydantic import BaseModel

router = APIRouter()

@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserSignup, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.signup(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh(data)



@router.get("/me", response_model=MeResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = AuthRepository(db)
    membership = await repo.get_org_membership(current_user.id)
    
    org_data = None
    role_data = None
    branch_ids = []
    
    if membership:
        org = await repo.get_organization(membership.organization_id)
        if org:
            org_data = SimpleOrgResponse(id=str(org.id), name=org.name)
        role_data = membership.role
        branch_ids = await repo.get_user_branch_ids(current_user.id)
        
    return MeResponse(
        user=UserResponse.model_validate(current_user),
        organization=org_data,
        role=role_data,
        branch_ids=branch_ids
    )
