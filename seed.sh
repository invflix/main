#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-local}"

if [[ "$MODE" == "--prod" || "$MODE" == "prod" || "$MODE" == "production" ]]; then
    if [[ ! -f ".env.production" ]]; then
        echo "ERROR: .env.production file is missing."
        exit 1
    fi

    COMPOSE=(docker compose --env-file .env.production -f docker-compose.prod.yml)
else
    COMPOSE=(docker compose -f docker-compose.yml)
fi

echo "Starting database, cache, and API..."
"${COMPOSE[@]}" up -d postgres valkey api

echo "Applying migrations..."
"${COMPOSE[@]}" exec -T api python scripts/migrate.py

echo "Applying demo seed data..."
"${COMPOSE[@]}" exec -T api python scripts/seed.py

echo "Demo data is ready."
