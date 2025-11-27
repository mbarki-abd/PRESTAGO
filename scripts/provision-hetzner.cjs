// =============================================================================
// PRESTAGO - Hetzner Server Provisioning Script
// =============================================================================
// This script creates a dedicated Hetzner Cloud server for PRESTAGO
// =============================================================================

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Server configuration
  server: {
    name: 'prestago-prod',
    server_type: 'cx32',  // 4 vCPU, 8GB RAM, 80GB SSD - good for production
    image: 'ubuntu-22.04',
    location: 'fsn1',  // Falkenstein, Germany
    labels: {
      project: 'prestago',
      environment: 'production',
      managed_by: 'script'
    }
  },
  // Firewall configuration
  firewall: {
    name: 'prestago-firewall',
    rules: [
      // SSH
      { direction: 'in', protocol: 'tcp', port: '22', source_ips: ['0.0.0.0/0', '::/0'], description: 'SSH' },
      // HTTP
      { direction: 'in', protocol: 'tcp', port: '80', source_ips: ['0.0.0.0/0', '::/0'], description: 'HTTP' },
      // HTTPS
      { direction: 'in', protocol: 'tcp', port: '443', source_ips: ['0.0.0.0/0', '::/0'], description: 'HTTPS' },
      // NocoBase (dev only, should be behind reverse proxy in prod)
      { direction: 'in', protocol: 'tcp', port: '13000', source_ips: ['0.0.0.0/0', '::/0'], description: 'NocoBase' },
      // PostgreSQL (internal only in prod)
      { direction: 'in', protocol: 'tcp', port: '5432', source_ips: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], description: 'PostgreSQL' },
      // Redis (internal only)
      { direction: 'in', protocol: 'tcp', port: '6379', source_ips: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], description: 'Redis' },
      // MinIO (internal only)
      { direction: 'in', protocol: 'tcp', port: '9000-9001', source_ips: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], description: 'MinIO' },
      // Meilisearch (internal only)
      { direction: 'in', protocol: 'tcp', port: '7700', source_ips: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'], description: 'Meilisearch' },
      // ICMP (ping)
      { direction: 'in', protocol: 'icmp', source_ips: ['0.0.0.0/0', '::/0'], description: 'ICMP' },
    ]
  },
  // Volume for persistent data
  volume: {
    name: 'prestago-data',
    size: 50,  // 50 GB
    format: 'ext4'
  }
};

// Cloud-init script for server setup
const CLOUD_INIT = `#cloud-config
package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose
  - nginx
  - certbot
  - python3-certbot-nginx
  - git
  - curl
  - wget
  - htop
  - vim
  - ufw

runcmd:
  # Enable Docker
  - systemctl enable docker
  - systemctl start docker

  # Add ubuntu user to docker group
  - usermod -aG docker ubuntu

  # Install Node.js 20.x
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs

  # Install pnpm
  - npm install -g pnpm

  # Install PM2 for process management
  - npm install -g pm2

  # Create PRESTAGO directories
  - mkdir -p /opt/prestago
  - mkdir -p /opt/prestago/nocobase
  - mkdir -p /opt/prestago/data
  - mkdir -p /opt/prestago/logs
  - mkdir -p /opt/prestago/backups

  # Set permissions
  - chown -R ubuntu:ubuntu /opt/prestago

  # Configure UFW firewall
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow ssh
  - ufw allow http
  - ufw allow https
  - ufw allow 13000/tcp
  - ufw --force enable

  # Create swap file (4GB)
  - fallocate -l 4G /swapfile
  - chmod 600 /swapfile
  - mkswap /swapfile
  - swapon /swapfile
  - echo '/swapfile none swap sw 0 0' >> /etc/fstab

  # Optimize Docker
  - echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' > /etc/docker/daemon.json
  - systemctl restart docker

write_files:
  - path: /opt/prestago/.env.example
    content: |
      # PRESTAGO Environment Configuration

      # Application
      APP_ENV=production
      APP_PORT=13000
      APP_KEY=change-this-in-production
      API_BASE_PATH=/api/

      # Database
      DB_DIALECT=postgres
      DB_HOST=localhost
      DB_PORT=5432
      DB_DATABASE=prestago
      DB_USER=prestago
      DB_PASSWORD=change-this-password

      # Redis
      REDIS_HOST=localhost
      REDIS_PORT=6379

      # MinIO
      MINIO_ENDPOINT=localhost
      MINIO_PORT=9000
      MINIO_ACCESS_KEY=prestago_access
      MINIO_SECRET_KEY=change-this-secret

      # Meilisearch
      MEILISEARCH_HOST=http://localhost:7700
      MEILISEARCH_API_KEY=change-this-key

      # Domain (update after DNS configuration)
      DOMAIN=prestago.example.com

  - path: /opt/prestago/docker-compose.yml
    content: |
      version: '3.8'

      services:
        postgres:
          image: postgres:15-alpine
          container_name: prestago-postgres
          restart: unless-stopped
          environment:
            - POSTGRES_DB=\${DB_DATABASE:-prestago}
            - POSTGRES_USER=\${DB_USER:-prestago}
            - POSTGRES_PASSWORD=\${DB_PASSWORD}
          volumes:
            - postgres-data:/var/lib/postgresql/data
          networks:
            - prestago

        redis:
          image: redis:7-alpine
          container_name: prestago-redis
          restart: unless-stopped
          command: redis-server --appendonly yes
          volumes:
            - redis-data:/data
          networks:
            - prestago

        minio:
          image: minio/minio:latest
          container_name: prestago-minio
          restart: unless-stopped
          command: server /data --console-address ":9001"
          environment:
            - MINIO_ROOT_USER=\${MINIO_ACCESS_KEY}
            - MINIO_ROOT_PASSWORD=\${MINIO_SECRET_KEY}
          volumes:
            - minio-data:/data
          networks:
            - prestago

        meilisearch:
          image: getmeili/meilisearch:v1.5
          container_name: prestago-meilisearch
          restart: unless-stopped
          environment:
            - MEILI_MASTER_KEY=\${MEILISEARCH_API_KEY}
            - MEILI_ENV=production
          volumes:
            - meilisearch-data:/meili_data
          networks:
            - prestago

      networks:
        prestago:
          driver: bridge

      volumes:
        postgres-data:
        redis-data:
        minio-data:
        meilisearch-data:

final_message: "PRESTAGO server is ready! Connect via SSH and run the setup script."
`;

class HetznerProvisioner {
  constructor(apiToken) {
    this.client = axios.create({
      baseURL: 'https://api.hetzner.cloud/v1',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async listSSHKeys() {
    const response = await this.client.get('/ssh_keys');
    return response.data.ssh_keys;
  }

  async createFirewall(config) {
    console.log('Creating firewall...');
    const response = await this.client.post('/firewalls', {
      name: config.name,
      rules: config.rules,
      labels: CONFIG.server.labels
    });
    console.log(`✓ Firewall created: ${response.data.firewall.name} (ID: ${response.data.firewall.id})`);
    return response.data.firewall;
  }

  async createVolume(config, location) {
    console.log('Creating volume...');
    const response = await this.client.post('/volumes', {
      name: config.name,
      size: config.size,
      location: location,
      format: config.format,
      labels: CONFIG.server.labels
    });
    console.log(`✓ Volume created: ${response.data.volume.name} (${config.size}GB)`);
    return response.data.volume;
  }

  async createServer(config, sshKeyIds, firewallId) {
    console.log('Creating server...');

    const serverData = {
      name: config.name,
      server_type: config.server_type,
      image: config.image,
      location: config.location,
      labels: config.labels,
      ssh_keys: sshKeyIds,
      firewalls: [{ firewall: firewallId }],
      user_data: CLOUD_INIT,
      start_after_create: true,
    };

    const response = await this.client.post('/servers', serverData);
    console.log(`✓ Server created: ${response.data.server.name}`);
    console.log(`  - ID: ${response.data.server.id}`);
    console.log(`  - IPv4: ${response.data.server.public_net.ipv4.ip}`);
    console.log(`  - IPv6: ${response.data.server.public_net.ipv6.ip}`);
    console.log(`  - Status: ${response.data.server.status}`);

    if (response.data.root_password) {
      console.log(`  - Root Password: ${response.data.root_password}`);
    }

    return response.data;
  }

  async attachVolume(volumeId, serverId) {
    console.log('Attaching volume to server...');
    const response = await this.client.post(`/volumes/${volumeId}/actions/attach`, {
      server: serverId,
      automount: true
    });
    console.log(`✓ Volume attached to server`);
    return response.data;
  }

  async listServers() {
    const response = await this.client.get('/servers');
    return response.data.servers;
  }

  async getServerByName(name) {
    const servers = await this.listServers();
    return servers.find(s => s.name === name);
  }
}

async function main() {
  console.log('============================================');
  console.log('  PRESTAGO - Hetzner Server Provisioning');
  console.log('============================================');
  console.log('');

  // Check for API token
  const apiToken = process.env.HETZNER_API_TOKEN;
  if (!apiToken) {
    console.error('❌ HETZNER_API_TOKEN environment variable is not set');
    console.log('');
    console.log('To set the token:');
    console.log('  Windows: set HETZNER_API_TOKEN=your-token');
    console.log('  Linux/Mac: export HETZNER_API_TOKEN=your-token');
    console.log('');
    console.log('Get your API token from: https://console.hetzner.cloud/projects');
    process.exit(1);
  }

  const provisioner = new HetznerProvisioner(apiToken);

  try {
    // Check if server already exists
    console.log('Checking for existing server...');
    const existingServer = await provisioner.getServerByName(CONFIG.server.name);
    if (existingServer) {
      console.log(`⚠️  Server "${CONFIG.server.name}" already exists!`);
      console.log(`   ID: ${existingServer.id}`);
      console.log(`   IPv4: ${existingServer.public_net.ipv4.ip}`);
      console.log(`   Status: ${existingServer.status}`);
      console.log('');
      console.log('To recreate, delete the existing server first.');
      process.exit(0);
    }

    // Get SSH keys
    console.log('Fetching SSH keys...');
    const sshKeys = await provisioner.listSSHKeys();
    if (sshKeys.length === 0) {
      console.error('❌ No SSH keys found in your Hetzner account');
      console.log('Please add an SSH key first: https://console.hetzner.cloud/projects/*/security/sshkeys');
      process.exit(1);
    }
    console.log(`✓ Found ${sshKeys.length} SSH key(s)`);
    const sshKeyIds = sshKeys.map(k => k.id);

    // Create firewall
    const firewall = await provisioner.createFirewall(CONFIG.firewall);

    // Create server
    const serverResult = await provisioner.createServer(CONFIG.server, sshKeyIds, firewall.id);
    const server = serverResult.server;

    // Create and attach volume
    const volume = await provisioner.createVolume(CONFIG.volume, CONFIG.server.location);

    // Wait for server to be running
    console.log('Waiting for server to be ready...');
    let attempts = 0;
    while (attempts < 30) {
      const currentServer = await provisioner.getServerByName(CONFIG.server.name);
      if (currentServer.status === 'running') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
      process.stdout.write('.');
    }
    console.log(' Ready!');

    // Attach volume
    await provisioner.attachVolume(volume.id, server.id);

    // Print summary
    console.log('');
    console.log('============================================');
    console.log('  Provisioning Complete!');
    console.log('============================================');
    console.log('');
    console.log('Server Details:');
    console.log(`  Name: ${server.name}`);
    console.log(`  IPv4: ${server.public_net.ipv4.ip}`);
    console.log(`  Type: ${CONFIG.server.server_type}`);
    console.log(`  Location: ${CONFIG.server.location}`);
    console.log('');
    console.log('Next Steps:');
    console.log(`  1. SSH into the server:`);
    console.log(`     ssh root@${server.public_net.ipv4.ip}`);
    console.log('');
    console.log('  2. Wait for cloud-init to complete (check with):');
    console.log('     tail -f /var/log/cloud-init-output.log');
    console.log('');
    console.log('  3. Clone and deploy PRESTAGO:');
    console.log('     cd /opt/prestago');
    console.log('     git clone https://github.com/mbarki-abd/PRESTAGO.git .');
    console.log('     cp .env.example .env');
    console.log('     # Edit .env with your configuration');
    console.log('     docker-compose up -d');
    console.log('     ./scripts/setup-nocobase.sh');
    console.log('');
    console.log('  4. Configure DNS to point to:');
    console.log(`     ${server.public_net.ipv4.ip}`);
    console.log('');

    // Save server info to file
    const serverInfo = {
      id: server.id,
      name: server.name,
      ipv4: server.public_net.ipv4.ip,
      ipv6: server.public_net.ipv6.ip,
      created_at: new Date().toISOString(),
      firewall_id: firewall.id,
      volume_id: volume.id,
      root_password: serverResult.root_password || null,
    };

    const infoPath = path.join(__dirname, '..', 'server-info.json');
    fs.writeFileSync(infoPath, JSON.stringify(serverInfo, null, 2));
    console.log(`Server info saved to: ${infoPath}`);

  } catch (error) {
    console.error('');
    console.error('❌ Error during provisioning:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

main();
