// =============================================================================
// PRESTAGO - Delete Hetzner Firewall Script
// =============================================================================

async function main() {
  const apiToken = process.argv[2];
  const firewallId = process.argv[3];

  if (!apiToken || !firewallId) {
    console.error('Usage: node delete-firewall.cjs YOUR_API_TOKEN FIREWALL_ID');
    process.exit(1);
  }

  const baseUrl = 'https://api.hetzner.cloud/v1';
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  console.log(`Deleting firewall with ID: ${firewallId}...`);

  try {
    const response = await fetch(`${baseUrl}/firewalls/${firewallId}`, {
      method: 'DELETE',
      headers
    });

    if (response.ok || response.status === 204) {
      console.log('✓ Firewall deleted successfully');
    } else {
      const data = await response.json();
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
