#!/bin/bash
# =============================================================================
# PRESTAGO - NocoBase Source Code Setup Script
# =============================================================================
# This script sets up NocoBase from source code (not Docker)
# Infrastructure services (PostgreSQL, Redis, MinIO, Meilisearch) run in Docker
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NOCOBASE_VERSION="1.4.0"  # Update as needed

echo "=============================================="
echo "  PRESTAGO - NocoBase Setup from Source"
echo "=============================================="
echo ""

# Check prerequisites
check_prerequisites() {
    echo "[1/7] Checking prerequisites..."

    # Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js 18+ required. Current version: $(node -v)"
        exit 1
    fi
    echo "✓ Node.js $(node -v)"

    # pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "Installing pnpm..."
        npm install -g pnpm
    fi
    echo "✓ pnpm $(pnpm -v)"

    # Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    echo "✓ Docker $(docker --version | cut -d ' ' -f 3)"

    # Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    echo "✓ Docker Compose installed"

    echo ""
}

# Clone or update NocoBase
setup_nocobase() {
    echo "[2/7] Setting up NocoBase source code..."

    NOCOBASE_DIR="$PROJECT_ROOT/nocobase"

    if [ -d "$NOCOBASE_DIR" ]; then
        echo "NocoBase directory exists. Updating..."
        cd "$NOCOBASE_DIR"
        git fetch origin
        git checkout "v${NOCOBASE_VERSION}" 2>/dev/null || git checkout main
    else
        echo "Cloning NocoBase..."
        git clone https://github.com/nocobase/nocobase.git "$NOCOBASE_DIR"
        cd "$NOCOBASE_DIR"
        git checkout "v${NOCOBASE_VERSION}" 2>/dev/null || echo "Using main branch"
    fi

    echo "✓ NocoBase source ready"
    echo ""
}

# Install NocoBase dependencies
install_dependencies() {
    echo "[3/7] Installing NocoBase dependencies..."

    cd "$PROJECT_ROOT/nocobase"
    pnpm install

    echo "✓ Dependencies installed"
    echo ""
}

# Link PRESTAGO plugins
link_plugins() {
    echo "[4/7] Linking PRESTAGO plugins..."

    PLUGINS_DIR="$PROJECT_ROOT/nocobase/packages/plugins/@prestago"

    # Remove existing symlink if present
    if [ -L "$PLUGINS_DIR" ]; then
        rm "$PLUGINS_DIR"
    fi

    # Create symlink to PRESTAGO plugins
    mkdir -p "$(dirname "$PLUGINS_DIR")"
    ln -s "$PROJECT_ROOT/packages/plugins/@prestago" "$PLUGINS_DIR"

    echo "✓ PRESTAGO plugins linked"
    echo ""
}

# Setup environment file
setup_environment() {
    echo "[5/7] Setting up environment..."

    ENV_FILE="$PROJECT_ROOT/nocobase/.env"

    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << EOF
# =============================================================================
# PRESTAGO - NocoBase Environment Configuration
# =============================================================================

# Application
APP_ENV=development
APP_PORT=13000
APP_KEY=prestago-secret-key-change-in-production
API_BASE_PATH=/api/

# Database (Docker PostgreSQL)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=prestago
DB_USER=prestago
DB_PASSWORD=prestago_secret
DB_LOGGING=true

# Redis (Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=

# MinIO (Docker)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=prestago_access
MINIO_SECRET_KEY=prestago_secret
MINIO_BUCKET=prestago

# Meilisearch (Docker)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=prestago_meili_key

# Timezone
TZ=Europe/Paris

# PRESTAGO Plugins
PRESTAGO_AI_PROVIDER=claude
# ANTHROPIC_API_KEY=your-claude-api-key
# OPENAI_API_KEY=your-openai-api-key

# DocuSign Integration
# DOCUSIGN_INTEGRATION_KEY=
# DOCUSIGN_SECRET_KEY=
# DOCUSIGN_ACCOUNT_ID=
EOF
        echo "✓ Environment file created at $ENV_FILE"
        echo "  ⚠️  Please edit this file with your actual configuration!"
    else
        echo "✓ Environment file exists"
    fi
    echo ""
}

# Start Docker services
start_services() {
    echo "[6/7] Starting Docker infrastructure services..."

    cd "$PROJECT_ROOT/docker"
    docker-compose up -d

    echo "Waiting for services to be ready..."
    sleep 10

    # Check PostgreSQL
    until docker exec prestago-postgres pg_isready -U prestago; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
    echo "✓ PostgreSQL ready"

    # Check Redis
    until docker exec prestago-redis redis-cli ping | grep -q PONG; do
        echo "Waiting for Redis..."
        sleep 2
    done
    echo "✓ Redis ready"

    echo "✓ Infrastructure services started"
    echo ""
}

# Build and start NocoBase
build_nocobase() {
    echo "[7/7] Building NocoBase..."

    cd "$PROJECT_ROOT/nocobase"

    # Build the application
    pnpm build

    echo "✓ NocoBase built successfully"
    echo ""
}

# Print instructions
print_instructions() {
    echo "=============================================="
    echo "  Setup Complete!"
    echo "=============================================="
    echo ""
    echo "To start PRESTAGO:"
    echo ""
    echo "  1. Start infrastructure services (if not running):"
    echo "     cd docker && docker-compose up -d"
    echo ""
    echo "  2. Start NocoBase development server:"
    echo "     cd nocobase && pnpm dev"
    echo ""
    echo "  3. Access the application at:"
    echo "     http://localhost:13000"
    echo ""
    echo "  4. First time setup:"
    echo "     - Create admin account"
    echo "     - Enable PRESTAGO plugins from Plugin Manager"
    echo ""
    echo "Infrastructure services:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - MinIO Console: http://localhost:9001"
    echo "  - Meilisearch: http://localhost:7700"
    echo ""
    echo "For production deployment, use:"
    echo "  pnpm start"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_nocobase
    install_dependencies
    link_plugins
    setup_environment
    start_services
    build_nocobase
    print_instructions
}

main "$@"
