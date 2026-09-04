from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.auth.schemas import UserSignup, UserLogin, TokenRefresh, TokenResponse
from app.modules.auth.repository import AuthRepository
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import APIException
from app.db.models.user import User
from app.db.models.organization import Organization
from app.db.models.membership import OrganizationMember
from app.db.models.audit import AuditLog
from app.core.logging import logger

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AuthRepository(db)

    async def signup(self, data: UserSignup) -> TokenResponse:
        # Check email uniqueness
        existing_user = await self.repo.get_user_by_email(data.email)
        if existing_user:
            raise APIException(
                code="EMAIL_ALREADY_EXISTS",
                message="A user with this email already exists.",
                status_code=400
            )

        # Single transaction block
        try:
            # 1. Create User
            user = User(
                email=data.email,
                password_hash=get_password_hash(data.password),
                full_name=data.full_name,
                is_platform_admin=False,
                is_active=True
            )
            self.db.add(user)
            await self.db.flush()  # Populates user.id

            # 2. Create Organization
            org = Organization(
                name=data.organization_name,
                business_email=data.email
            )
            self.db.add(org)
            await self.db.flush()  # Populates org.id

            # 3. Create Membership as OWNER
            member = OrganizationMember(
                organization_id=org.id,
                user_id=user.id,
                role="OWNER",
                status="ACTIVE"
            )
            self.db.add(member)
            
            # 4. Create Audit Log
            audit = AuditLog(
                actor_user_id=user.id,
                organization_id=org.id,
                action="ORGANIZATION_CREATED",
                entity_type="organization",
                entity_id=org.id,
                payload={"user_email": data.email, "organization_name": data.organization_name}
            )
            self.db.add(audit)
            
            await self.db.commit()
            logger.info(f"User {data.email} successfully signed up and created organization {data.organization_name}")
            
            # Generate tokens
            access_token = create_access_token(user.id, is_platform_admin=False)
            refresh_token = create_refresh_token(user.id)
            return TokenResponse(access_token=access_token, refresh_token=refresh_token)
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Signup failed for {data.email}: {e}")
            raise APIException(
                code="SIGNUP_FAILED",
                message="Failed to complete signup process.",
                status_code=500
            )

    async def login(self, data: UserLogin) -> TokenResponse:
        user = await self.repo.get_user_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            logger.warning(f"Failed login attempt for email={data.email}")
            raise APIException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password.",
                status_code=401
            )
            
        if not user.is_active:
            raise APIException(
                code="INACTIVE_USER",
                message="This user account has been deactivated.",
                status_code=403
            )
            
        logger.info(f"User login successful: {data.email}")
        access_token = create_access_token(user.id, is_platform_admin=user.is_platform_admin)
        refresh_token = create_refresh_token(user.id)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def refresh(self, data: TokenRefresh) -> TokenResponse:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise APIException(
                code="INVALID_TOKEN",
                message="Invalid refresh token.",
                status_code=401
            )
            
        user_id = payload.get("sub")
        if not user_id:
            raise APIException(
                code="INVALID_TOKEN",
                message="Invalid refresh token.",
                status_code=401
            )
            
        user = await self.repo.get_user_by_email(user_id) # Let's support loading user directly by ID as well
        if not user:
            # Check by user_id
            from sqlalchemy import select
            res = await self.db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            
        if not user or not user.is_active:
            raise APIException(
                code="USER_NOT_FOUND",
                message="User not found or deactivated.",
                status_code=401
            )
            
        access_token = create_access_token(user.id, is_platform_admin=user.is_platform_admin)
        refresh_token = create_refresh_token(user.id)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
