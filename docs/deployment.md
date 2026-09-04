# MediStock Deployment Guide

This document describes starting the application locally and deploying to production.

## Local Development Start

1. Set up `.env` from template:
   ```bash
   cp .env.example .env
   ```
2. Start Postgres and Valkey docker services:
   ```bash
   docker compose up -d postgres valkey
   ```
3. Run database migrations:
   ```bash
   ./applyevolution.sh
   ```
4. Seed demo databases (Delhi, Noida, Gurgaon branch stocks, claims, sales):
   ```bash
   docker compose exec -T api python scripts/seed.py
   ```
5. Spin up the rest of the application containers (Vite app, FastAPI API, Celery worker):
   ```bash
   docker compose up --build
   ```
6. Access local instances:
   - Frontend: `http://localhost:3000`
   - API Docs: `http://localhost:8000/docs`

## Production Deployment

Execute `./deploy.sh` script. The script will pull the latest changes, build prod configurations, wait for DB, prompt for migration confirmations, start all services, and clean up leftover images.
