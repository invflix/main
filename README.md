# MediStock Pharmacy Operations SaaS

MediStock is a multi-tenant, multi-branch pharmacy operations SaaS platform designed for pharmacy owners, managers, pharmacists, staff, and cashiers.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Recharts, Lucide icons.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.x Async, PostgreSQL, asyncpg, psycopg, Pydantic v2, JWT, Celery + Valkey.

## Directory Structure
- `apps/web`: React Vite client application.
- `apps/api`: FastAPI and Celery background jobs API service.
- `docs/`: System documentation.

## Local Quick Start

1. Copy env parameters:
   ```bash
   cp .env.example .env
   ```
2. Start database and cache services:
   ```bash
   docker compose up -d postgres valkey
   ```
3. Run database migrations:
   ```bash
   ./applyevolution.sh
   ```
4. Populate database with Medicare Pharmacy Group demo datasets:
   ```bash
   docker compose exec -T api python scripts/seed.py
   ```
5. Launch API worker and Vite client containers:
   ```bash
   docker compose up --build
   ```
6. Open browser at `http://localhost:3000`
   - Log in using Owner account: `owner@medistock.com` / `password123`
   - Log in using Platform Super Admin: `admin@medistock.com` / `password123`

## Database Migrations
MediStock does not use Alembic. Migrations are managed via sequential SQL files in `apps/api/db/migrations/` and applied using a custom execution runner in `apps/api/scripts/migrate.py`.

To apply pending migrations:
```bash
./applyevolution.sh
```

## Production Deployment
To deploy inside production environment:
```bash
./deploy.sh
```
The script will build and restart services using `docker-compose.prod.yml` and ask for DB migration confirmations.
