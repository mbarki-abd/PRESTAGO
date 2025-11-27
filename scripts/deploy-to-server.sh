#!/bin/bash
# =============================================================================
# PRESTAGO - Deployment Script for Existing Server
# =============================================================================
# This script deploys PRESTAGO to an existing Hetzner server
# Server: nocobase (49.13.226.13)
# =============================================================================

set -e

# Configuration
SERVER_IP="49.13.226.13"
SERVER_USER="root"
APP_DIR="/opt/prestago"
GITHUB_REPO="https://github.com/mbarki-abd/PRESTAGO.git"

echo "============================================"
echo "  PRESTAGO - Deployment to Server"
echo "============================================"
echo ""
echo "Server: $SERVER_IP"
echo "Directory: $APP_DIR"
echo ""

# Check SSH connection
echo "Testing SSH connection..."
ssh -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" "echo 'SSH connection successful'" || {
    echo "❌ Cannot connect to server. Please ensure:"
    echo "   1. Your SSH key is configured on the server"
    echo "   2. The server is running"
    echo "   3. Network connectivity is available"
    exit 1
}

echo "✓ SSH connection established"
echo ""

# Deploy
echo "Deploying PRESTAGO..."

ssh "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
set -e

echo "=== Installing dependencies ==="

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get update
    apt-get install -y docker.io docker-compose
    systemctl enable docker
    systemctl start docker
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

echo ""
echo "=== Setting up PRESTAGO directory ==="

# Create directory structure
mkdir -p /opt/prestago
cd /opt/prestago

# Check if repo exists
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest..."
    git pull origin main || true
else
    echo "Cloning repository..."
    git clone https://github.com/mbarki-abd/PRESTAGO.git . || {
        echo "Warning: Could not clone repository"
        echo "Please push your code to GitHub first"
    }
fi

echo ""
echo "=== Creating environment files ==="

# Create .env if not exists
if [ ! -f ".env" ]; then
    cat > .env << 'ENVFILE'
# PRESTAGO Environment Configuration

# Application
APP_ENV=production
APP_PORT=13000
APP_KEY=$(openssl rand -hex 32)
API_BASE_PATH=/api/

# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=prestago
DB_USER=prestago
DB_PASSWORD=$(openssl rand -hex 16)

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=prestago_access
MINIO_SECRET_KEY=$(openssl rand -hex 16)

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=$(openssl rand -hex 16)

# Domain
DOMAIN=prestago.ilinqsoft.com
ENVFILE
    echo "Created .env file"
fi

echo ""
echo "=== Starting Docker services ==="

# Start infrastructure services
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
    echo "Docker services started"
else
    echo "Warning: docker-compose.yml not found"
fi

echo ""
echo "=== PRESTAGO Deployment Complete ==="
echo ""
echo "Next steps:"
echo "  1. Configure DNS for prestago.ilinqsoft.com -> 49.13.226.13"
echo "  2. Install SSL with: certbot --nginx -d prestago.ilinqsoft.com"
echo "  3. Install NocoBase and plugins manually"
echo ""

ENDSSH

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "Server: $SERVER_IP"
echo "SSH: ssh root@$SERVER_IP"
echo "App Directory: $APP_DIR"
echo ""
