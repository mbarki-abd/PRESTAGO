#!/bin/bash
# =============================================================================
# PRESTAGO - Setup Script
# =============================================================================

set -e

echo "=============================================="
echo "  PRESTAGO - Setup Script"
echo "=============================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

echo "[1/5] Creating environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "  Created .env from .env.example"
    echo "  Please update .env with your configuration"
else
    echo "  .env already exists, skipping"
fi

echo ""
echo "[2/5] Creating necessary directories..."
mkdir -p docker/storage
mkdir -p docker/init-scripts
mkdir -p storage/uploads
echo "  Directories created"

echo ""
echo "[3/5] Building Docker images..."
cd docker
docker-compose build
cd ..
echo "  Docker images built"

echo ""
echo "[4/5] Starting services..."
cd docker
docker-compose up -d
cd ..
echo "  Services started"

echo ""
echo "[5/5] Waiting for services to be ready..."
sleep 10

# Check if app is running
if curl -s http://localhost:13000/api/health > /dev/null 2>&1; then
    echo "  Application is running!"
else
    echo "  Application is starting up..."
    echo "  Please wait a few seconds and try accessing http://localhost:13000"
fi

echo ""
echo "=============================================="
echo "  PRESTAGO Setup Complete!"
echo "=============================================="
echo ""
echo "Access the application at: http://localhost:13000"
echo ""
echo "Development tools:"
echo "  - Adminer (DB):     http://localhost:8080"
echo "  - RedisInsight:     http://localhost:8001"
echo "  - MinIO Console:    http://localhost:9001"
echo "  - Meilisearch:      http://localhost:7700"
echo "  - Mailhog:          http://localhost:8025"
echo ""
echo "To view logs:    docker-compose -f docker/docker-compose.yml logs -f"
echo "To stop:         docker-compose -f docker/docker-compose.yml down"
echo ""
