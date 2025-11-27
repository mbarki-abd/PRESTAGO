#!/bin/bash
# =============================================================================
# PRESTAGO - Deployment Script for Hetzner
# =============================================================================

set -e

# Configuration
REMOTE_USER=${REMOTE_USER:-root}
REMOTE_HOST=${REMOTE_HOST:-"your-server.hetzner.com"}
REMOTE_PATH=${REMOTE_PATH:-"/opt/prestago"}
BRANCH=${BRANCH:-main}

echo "=============================================="
echo "  PRESTAGO - Deployment Script"
echo "=============================================="
echo ""
echo "Deploying to: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
echo "Branch: ${BRANCH}"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "[1/6] Building production images locally..."
cd docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
cd ..

echo ""
echo "[2/6] Connecting to remote server..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"

echo ""
echo "[3/6] Syncing files to remote server..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'docker/data' \
    ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

echo ""
echo "[4/6] Copying environment file..."
scp .env.production ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/.env 2>/dev/null || \
    echo "  No .env.production found, using existing .env on server"

echo ""
echo "[5/6] Starting services on remote server..."
ssh ${REMOTE_USER}@${REMOTE_HOST} << EOF
    cd ${REMOTE_PATH}
    cd docker
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
EOF

echo ""
echo "[6/6] Verifying deployment..."
sleep 10
ssh ${REMOTE_USER}@${REMOTE_HOST} "curl -s http://localhost:13000/api/health" || \
    echo "  Health check pending..."

echo ""
echo "=============================================="
echo "  Deployment Complete!"
echo "=============================================="
echo ""
echo "Application should be available at your configured domain"
echo ""
echo "To check logs on server:"
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH}/docker && docker-compose logs -f'"
echo ""
