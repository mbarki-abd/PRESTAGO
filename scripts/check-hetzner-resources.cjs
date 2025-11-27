// =============================================================================
// PRESTAGO - Check Hetzner Resources Script
// =============================================================================

async function main() {
  const apiToken = process.argv[2];
  if (!apiToken) {
    console.error('Usage: node check-hetzner-resources.cjs YOUR_API_TOKEN');
    process.exit(1);
  }

  const baseUrl = 'https://api.hetzner.cloud/v1';
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  console.log('============================================');
  console.log('  Hetzner Cloud Resources');
  console.log('============================================\n');

  // List servers
  console.log('SERVERS:');
  const serversRes = await fetch(`${baseUrl}/servers`, { headers });
  const servers = await serversRes.json();
  if (servers.servers && servers.servers.length > 0) {
    servers.servers.forEach(s => {
      console.log(`  - ${s.name} (ID: ${s.id})`);
      console.log(`    IPv4: ${s.public_net?.ipv4?.ip || 'N/A'}`);
      console.log(`    Status: ${s.status}`);
      console.log(`    Type: ${s.server_type?.name}`);
      console.log('');
    });
  } else {
    console.log('  No servers found\n');
  }

  // List primary IPs
  console.log('PRIMARY IPs:');
  const ipsRes = await fetch(`${baseUrl}/primary_ips`, { headers });
  const ips = await ipsRes.json();
  if (ips.primary_ips && ips.primary_ips.length > 0) {
    ips.primary_ips.forEach(ip => {
      console.log(`  - ${ip.ip} (ID: ${ip.id})`);
      console.log(`    Type: ${ip.type}`);
      console.log(`    Assignee: ${ip.assignee_id || 'Not assigned'}`);
      console.log('');
    });
  } else {
    console.log('  No primary IPs found\n');
  }

  // List firewalls
  console.log('FIREWALLS:');
  const firewallsRes = await fetch(`${baseUrl}/firewalls`, { headers });
  const firewalls = await firewallsRes.json();
  if (firewalls.firewalls && firewalls.firewalls.length > 0) {
    firewalls.firewalls.forEach(f => {
      console.log(`  - ${f.name} (ID: ${f.id})`);
      console.log(`    Applied to: ${f.applied_to?.length || 0} resource(s)`);
      console.log('');
    });
  } else {
    console.log('  No firewalls found\n');
  }

  // List volumes
  console.log('VOLUMES:');
  const volumesRes = await fetch(`${baseUrl}/volumes`, { headers });
  const volumes = await volumesRes.json();
  if (volumes.volumes && volumes.volumes.length > 0) {
    volumes.volumes.forEach(v => {
      console.log(`  - ${v.name} (ID: ${v.id})`);
      console.log(`    Size: ${v.size} GB`);
      console.log(`    Server: ${v.server || 'Not attached'}`);
      console.log('');
    });
  } else {
    console.log('  No volumes found\n');
  }

  // List floating IPs
  console.log('FLOATING IPs:');
  const floatingRes = await fetch(`${baseUrl}/floating_ips`, { headers });
  const floating = await floatingRes.json();
  if (floating.floating_ips && floating.floating_ips.length > 0) {
    floating.floating_ips.forEach(ip => {
      console.log(`  - ${ip.ip} (ID: ${ip.id})`);
      console.log(`    Server: ${ip.server || 'Not assigned'}`);
      console.log('');
    });
  } else {
    console.log('  No floating IPs found\n');
  }
}

main().catch(console.error);
