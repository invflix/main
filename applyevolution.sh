#!/bin/bash
set -e

echo "Checking Postgres container status..."
POSTGRES_STATUS=$(docker compose ps -q postgres 2>/dev/null || true)

if [ -z "$POSTGRES_STATUS" ] || [ "$(docker inspect -f '{{.State.Running}}' "$POSTGRES_STATUS" 2>/dev/null)" != "true" ]; then
    echo "Postgres container is not running. Starting it..."
    docker compose up -d postgres
fi

echo "Waiting for Postgres to be ready..."
# Use docker compose exec with pg_isready
until docker compose exec -T postgres pg_isready -U postgres -d medistock >/dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""
echo "Postgres is ready!"

# Ensure the API container is running to execute migration
API_STATUS=$(docker compose ps -q api 2>/dev/null || true)
if [ -z "$API_STATUS" ] || [ "$(docker inspect -f '{{.State.Running}}' "$API_STATUS" 2>/dev/null)" != "true" ]; then
    echo "API container is not running. Starting API container in background..."
    docker compose up -d api
fi

echo "Running migrations inside the API container..."
docker compose exec -T api python scripts/migrate.py

echo "Migrations completed successfully!"
