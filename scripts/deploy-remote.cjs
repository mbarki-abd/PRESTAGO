// =============================================================================
// PRESTAGO - Remote Deployment Script
// =============================================================================
// Deploys PRESTAGO to the Hetzner server via SSH
// =============================================================================

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_IP = '46.224.76.166';
const SERVER_USER = 'root';
const APP_DIR = '/opt/prestago';

// SSH command helper
function ssh(command, options = {}) {
  const sshCmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 ${SERVER_USER}@${SERVER_IP} "${command.replace(/"/g, '\\"')}"`;
  console.log(`> ${command}`);
  try {
    const result = execSync(sshCmd, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: options.timeout || 300000
    });
    return result;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return error.stdout || '';
  }
}

async function main() {
  console.log('============================================');
  console.log('  PRESTAGO - Remote Deployment');
  console.log('============================================');
  console.log(`Server: ${SERVER_IP}`);
  console.log('');

  // Step 1: Check cloud-init status
  console.log('Step 1: Checking cloud-init status...');
  try {
    const status = ssh('cloud-init status', { silent: true, ignoreError: true });
    if (status && status.includes('running')) {
      console.log('Cloud-init is still running. Waiting...');
      ssh('cloud-init status --wait', { timeout: 600000 });
    }
    console.log('✓ Cloud-init completed\n');
  } catch (e) {
    console.log('Cloud-init check skipped\n');
  }

  // Step 2: Install dependencies
  console.log('Step 2: Installing dependencies...');
  ssh('apt-get update -qq');
  ssh('apt-get install -y -qq docker.io docker-compose git curl');
  ssh('systemctl enable docker && systemctl start docker');

  // Install Node.js 20
  ssh('curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs', { ignoreError: true });
  ssh('npm install -g pnpm pm2', { ignoreError: true });
  console.log('✓ Dependencies installed\n');

  // Step 3: Setup directories
  console.log('Step 3: Setting up directories...');
  ssh(`mkdir -p ${APP_DIR}`);
  ssh(`mkdir -p ${APP_DIR}/nocobase`);
  ssh(`mkdir -p ${APP_DIR}/data`);
  ssh(`mkdir -p ${APP_DIR}/logs`);
  console.log('✓ Directories created\n');

  // Step 4: Clone repository
  console.log('Step 4: Cloning PRESTAGO repository...');
  ssh(`cd ${APP_DIR} && (git pull origin main 2>/dev/null || git clone https://github.com/mbarki-abd/PRESTAGO.git .)`);
  console.log('✓ Repository cloned\n');

  // Step 5: Create environment file
  console.log('Step 5: Creating environment file...');
  const envContent = `# PRESTAGO Environment Configuration
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
`;

  ssh(`cat > ${APP_DIR}/.env << 'ENVEOF'
${envContent}
ENVEOF`);
  console.log('✓ Environment file created\n');

  // Step 6: Start Docker services
  console.log('Step 6: Starting Docker services...');
  ssh(`cd ${APP_DIR} && docker-compose -f docker/docker-compose.yml up -d`);
  console.log('✓ Docker services started\n');

  // Step 7: Wait for services
  console.log('Step 7: Waiting for services to be ready...');
  ssh('sleep 15');
  ssh('docker ps');
  console.log('✓ Services ready\n');

  // Step 8: Setup NocoBase
  console.log('Step 8: Setting up NocoBase...');
  ssh(`cd ${APP_DIR}/nocobase && [ -d "node_modules" ] || (git clone --depth 1 https://github.com/nocobase/nocobase.git . && pnpm install)`, { ignoreError: true, timeout: 600000 });
  console.log('✓ NocoBase setup complete\n');

  // Step 9: Configure Nginx
  console.log('Step 9: Configuring Nginx...');
  const nginxConfig = `server {
    listen 80;
    server_name prestago.ilinqsoft.com ${SERVER_IP};

    location / {
        proxy_pass http://localhost:13000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_cache_bypass \\$http_upgrade;
        proxy_read_timeout 86400;
    }
}`;

  ssh(`apt-get install -y -qq nginx`);
  ssh(`cat > /etc/nginx/sites-available/prestago << 'NGINXEOF'
${nginxConfig}
NGINXEOF`);
  ssh('ln -sf /etc/nginx/sites-available/prestago /etc/nginx/sites-enabled/');
  ssh('rm -f /etc/nginx/sites-enabled/default');
  ssh('nginx -t && systemctl reload nginx');
  console.log('✓ Nginx configured\n');

  // Step 10: Start NocoBase
  console.log('Step 10: Starting NocoBase...');
  ssh(`cd ${APP_DIR}/nocobase && pm2 delete prestago 2>/dev/null; pm2 start "pnpm start" --name prestago`, { ignoreError: true });
  ssh('pm2 save', { ignoreError: true });
  console.log('✓ NocoBase started\n');

  console.log('============================================');
  console.log('  Deployment Complete!');
  console.log('============================================');
  console.log('');
  console.log(`Application URL: http://${SERVER_IP}`);
  console.log(`Direct NocoBase: http://${SERVER_IP}:13000`);
  console.log('');
  console.log('To check logs:');
  console.log(`  ssh ${SERVER_USER}@${SERVER_IP} "pm2 logs prestago"`);
  console.log('');
}

main().catch(err => {
  console.error('Deployment failed:', err.message);
  process.exit(1);
});
