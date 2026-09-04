from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import setup_exception_handlers

# Initialize structured logging
setup_logging()

app = FastAPI(
    title="MediStock API",
    description="Multi-tenant Pharmacy Operations Platform API",
    version="1.0.0"
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup centralized exception handling
setup_exception_handlers(app)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "env": settings.APP_ENV,
        "version": "1.0.0"
    }

# Include routers
from app.modules.auth.router import router as auth_router
from app.modules.branches.router import router as branches_router
from app.modules.invitations.router import router as invites_router
from app.modules.team.router import router as team_router
from app.modules.inventory.router import router as inventory_router
from app.modules.imports.router import router as imports_router
from app.modules.claims.router import router as claims_router
from app.modules.sales.router import router as sales_router
from app.modules.analytics.router import router as analytics_router
from app.modules.superadmin.router import router as superadmin_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(branches_router, prefix="/api/v1/organizations", tags=["branches"])
app.include_router(invites_router, prefix="/api/v1", tags=["invitations"])
app.include_router(team_router, prefix="/api/v1/organizations", tags=["team"])
app.include_router(inventory_router, prefix="/api/v1/organizations", tags=["inventory"])
app.include_router(imports_router, prefix="/api/v1/organizations", tags=["imports"])
app.include_router(claims_router, prefix="/api/v1/organizations", tags=["claims"])
app.include_router(sales_router, prefix="/api/v1/organizations", tags=["sales"])
app.include_router(analytics_router, prefix="/api/v1/organizations", tags=["analytics"])
app.include_router(superadmin_router, prefix="/api/v1/super-admin", tags=["super-admin"])









