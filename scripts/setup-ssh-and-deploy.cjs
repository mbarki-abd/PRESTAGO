// =============================================================================
// PRESTAGO - Setup SSH Key and Redeploy
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_TOKEN = process.argv[2] || '6AVLd3k4BW5B6ys0mWnqFJK9ecEm5pqZnPhOCDFJbeuhkgpWa89mazwB5Y7aCyQr';
const SSH_PUBLIC_KEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEz+12VIiIDDozKIxjRU4mbqFX7ndPiNlszEYFn37TVQ cda-deploy-key';
const SSH_PRIVATE_KEY_PATH = process.env.HOME + '/.ssh/cda_deploy';

async function apiRequest(method, endpoint, data = null) {
  const url = `https://api.hetzner.cloud/v1${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok && response.status !== 404) {
    console.error(`API Error: ${response.status}`, responseData);
  }

  return { status: response.status, data: responseData };
}

async function main() {
  console.log('============================================');
  console.log('  PRESTAGO - SSH Setup & Deployment');
  console.log('============================================\n');

  // Step 1: Check if SSH key exists in Hetzner
  console.log('Step 1: Checking SSH keys in Hetzner...');
  const keysResponse = await apiRequest('GET', '/ssh_keys');
  const existingKey = keysResponse.data.ssh_keys?.find(k =>
    k.public_key.includes('AAAAC3NzaC1lZDI1NTE5AAAAIEz+12VIiIDDozKIxjRU4mbqFX7ndPiNlszEYFn37TVQ')
  );

  let sshKeyId;
  if (existingKey) {
    console.log(`✓ SSH key already exists: ${existingKey.name} (ID: ${existingKey.id})\n`);
    sshKeyId = existingKey.id;
  } else {
    // Add SSH key
    console.log('Adding SSH key to Hetzner...');
    const addKeyResponse = await apiRequest('POST', '/ssh_keys', {
      name: 'prestago-deploy-key',
      public_key: SSH_PUBLIC_KEY
    });

    if (addKeyResponse.status === 201) {
      sshKeyId = addKeyResponse.data.ssh_key.id;
      console.log(`✓ SSH key added: ID ${sshKeyId}\n`);
    } else {
      console.error('Failed to add SSH key:', addKeyResponse.data);
      process.exit(1);
    }
  }

  // Step 2: Delete existing server
  console.log('Step 2: Deleting existing prestago-prod server...');
  const serversResponse = await apiRequest('GET', '/servers');
  const existingServer = serversResponse.data.servers?.find(s => s.name === 'prestago-prod');

  if (existingServer) {
    await apiRequest('DELETE', `/servers/${existingServer.id}`);
    console.log(`✓ Server ${existingServer.id} deleted\n`);
    // Wait for deletion
    await new Promise(resolve => setTimeout(resolve, 10000));
  } else {
    console.log('No existing server found\n');
  }

  // Step 3: Get all SSH key IDs
  console.log('Step 3: Getting all SSH keys...');
  const allKeysResponse = await apiRequest('GET', '/ssh_keys');
  const allKeyIds = allKeysResponse.data.ssh_keys.map(k => k.id);
  console.log(`✓ Found ${allKeyIds.length} SSH keys\n`);

  // Step 4: Get firewall ID
  console.log('Step 4: Getting firewall...');
  const firewallsResponse = await apiRequest('GET', '/firewalls');
  let firewallId = firewallsResponse.data.firewalls?.find(f => f.name === 'prestago-firewall')?.id;

  if (!firewallId) {
    // Create firewall
    const fwResponse = await apiRequest('POST', '/firewalls', {
      name: 'prestago-firewall',
      rules: [
        { direction: 'in', protocol: 'tcp', port: '22', source_ips: ['0.0.0.0/0', '::/0'] },
        { direction: 'in', protocol: 'tcp', port: '80', source_ips: ['0.0.0.0/0', '::/0'] },
        { direction: 'in', protocol: 'tcp', port: '443', source_ips: ['0.0.0.0/0', '::/0'] },
        { direction: 'in', protocol: 'tcp', port: '13000', source_ips: ['0.0.0.0/0', '::/0'] },
        { direction: 'in', protocol: 'icmp', source_ips: ['0.0.0.0/0', '::/0'] },
      ]
    });
    firewallId = fwResponse.data.firewall?.id;
  }
  console.log(`✓ Firewall ID: ${firewallId}\n`);

  // Step 5: Create new server
  console.log('Step 5: Creating new server...');
  const cloudInit = `#cloud-config
package_update: true
package_upgrade: true

packages:
  - docker.io
  - docker-compose
  - nginx
  - git
  - curl

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  - apt-get install -y nodejs
  - npm install -g pnpm pm2
  - mkdir -p /opt/prestago
  - chown -R root:root /opt/prestago
  - cd /opt/prestago && git clone https://github.com/mbarki-abd/PRESTAGO.git .
  - cd /opt/prestago && docker-compose -f docker/docker-compose.yml up -d

final_message: "PRESTAGO server ready!"
`;

  const serverResponse = await apiRequest('POST', '/servers', {
    name: 'prestago-prod',
    server_type: 'cx32',
    image: 'ubuntu-22.04',
    location: 'fsn1',
    ssh_keys: allKeyIds,
    firewalls: [{ firewall: firewallId }],
    user_data: cloudInit,
    start_after_create: true,
    labels: { project: 'prestago', environment: 'production' }
  });

  if (serverResponse.status !== 201) {
    console.error('Failed to create server:', serverResponse.data);
    process.exit(1);
  }

  const server = serverResponse.data.server;
  console.log(`✓ Server created: ${server.name}`);
  console.log(`  - ID: ${server.id}`);
  console.log(`  - IPv4: ${server.public_net.ipv4.ip}`);
  console.log(`  - Status: ${server.status}\n`);

  // Step 6: Wait for server
  console.log('Step 6: Waiting for server to be ready...');
  let attempts = 0;
  while (attempts < 60) {
    const statusResponse = await apiRequest('GET', `/servers/${server.id}`);
    if (statusResponse.data.server.status === 'running') {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write('.');
    attempts++;
  }
  console.log(' Ready!\n');

  // Save server info
  const serverInfo = {
    id: server.id,
    name: server.name,
    ipv4: server.public_net.ipv4.ip,
    created_at: new Date().toISOString(),
    ssh_key_path: SSH_PRIVATE_KEY_PATH
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'server-info.json'),
    JSON.stringify(serverInfo, null, 2)
  );

  console.log('============================================');
  console.log('  Server Created Successfully!');
  console.log('============================================\n');
  console.log(`IP Address: ${server.public_net.ipv4.ip}`);
  console.log(`SSH Command: ssh -i ~/.ssh/cda_deploy root@${server.public_net.ipv4.ip}`);
  console.log('\nCloud-init is installing dependencies...');
  console.log('Wait 2-3 minutes, then run:');
  console.log(`  ssh -i ~/.ssh/cda_deploy root@${server.public_net.ipv4.ip} "tail -f /var/log/cloud-init-output.log"`);
}

main().catch(console.error);
