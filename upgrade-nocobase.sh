#!/bin/bash
# =============================================================================
# PRESTAGO - Upgrade NocoBase to latest-full
# =============================================================================

set -e

echo "=== Upgrading NocoBase to latest-full ==="

# Stop current container
echo "Stopping current NocoBase container..."
docker stop nocobase || true
docker rm nocobase || true

# Backup data
echo "Backing up data..."
mkdir -p /root/nocobase-backup
cp -r /root/nocobase-data /root/nocobase-backup/nocobase-data-$(date +%Y%m%d%H%M%S) || true

# Pull latest-full image
echo "Pulling nocobase/nocobase:latest-full..."
docker pull nocobase/nocobase:latest-full

# Start with latest-full
echo "Starting NocoBase with latest-full..."
docker run -d \
  --name nocobase \
  --restart always \
  -p 13000:80 \
  -v /root/nocobase-data/storage:/app/nocobase/storage \
  -e DB_DIALECT=postgres \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_DATABASE=nocobase \
  -e DB_USER=nocobase \
  -e DB_PASSWORD=nocobase123 \
  -e APP_KEY=prestago-secret-key-2024 \
  -e TZ=Europe/Paris \
  --add-host=host.docker.internal:host-gateway \
  nocobase/nocobase:latest-full

echo "Waiting for NocoBase to start..."
sleep 30

# Check status
echo "Checking NocoBase status..."
docker logs nocobase --tail 50

echo ""
echo "=== Upgrade Complete ==="
echo "NocoBase should be available at https://prestago.ilinqsoft.com"
