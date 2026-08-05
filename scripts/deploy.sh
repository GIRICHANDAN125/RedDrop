#!/usr/bin/env bash
# RedDrop AI V2 Production Deployment Script
set -e

echo "🚀 Starting RedDrop AI V2 Production Deployment..."

echo "1. Pulling latest git repository updates..."
git pull origin main

echo "2. Building Docker containers with Docker Compose..."
docker compose build --no-cache

echo "3. Launching stack in detached mode..."
docker compose up -d

echo "4. Verifying container health..."
docker compose ps

echo "5. Checking backend health endpoint..."
curl -f http://localhost:5000/health || exit 1

echo "🎉 Production Deployment Completed Successfully!"
