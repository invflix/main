#!/usr/bin/env bash
set -euo pipefail

echo "========================================="
echo "      MediStock Production Deploy        "
echo "========================================="

COMPOSE="docker compose --env-file .env.production -f docker-compose.prod.yml"

# 1. Validate .env.production
if [ ! -f ".env.production" ]; then
    echo "ERROR: .env.production file is missing!"
    echo "Please create a .env.production file containing production secrets."
    exit 1
fi

# 2. Git pull
echo "Pulling latest changes..."
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git pull --ff-only || echo "Warning: git pull failed, proceeding with local files..."
else
    echo "Not a git repository, skipping pull."
fi

# 3. Build containers
echo "Building docker containers..."
$COMPOSE build

# 4. Start postgres + valkey
echo "Starting database and cache services..."
$COMPOSE up -d postgres valkey

# 5. Wait for database
echo "Waiting for database to be ready..."
# Load DB settings from .env.production
DB_NAME=$(grep -E "^POSTGRES_DB=" .env.production | cut -d'=' -f2- || echo "medistock")
DB_USER=$(grep -E "^POSTGRES_USER=" .env.production | cut -d'=' -f2- || echo "postgres")
until $COMPOSE exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo ""
echo "Database is ready!"

# 6. Ask for migrations
read -rp "Do you want to apply database evolutions? (y/N): " apply_migrations
if [[ "$apply_migrations" =~ ^[Yy]$ ]]; then
    echo "Starting temporary API container to run migration runner..."
    $COMPOSE up -d api
    echo "Applying migrations..."
    $COMPOSE exec -T api python scripts/migrate.py
else
    echo "Skipping migrations."
fi

# 7. Start everything else
echo "Starting remaining production services (API, worker, web)..."
$COMPOSE up -d

# 8. Show status
echo "Services status:"
$COMPOSE ps

# 9. Clean up
echo "Pruning unused Docker images..."
docker image prune -f

echo "Deployment complete!"
