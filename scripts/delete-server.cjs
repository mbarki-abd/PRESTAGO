// =============================================================================
// PRESTAGO - Delete Hetzner Server Script
// =============================================================================

async function main() {
  const apiToken = process.argv[2];
  const serverId = process.argv[3];

  if (!apiToken || !serverId) {
    console.error('Usage: node delete-server.cjs YOUR_API_TOKEN SERVER_ID');
    process.exit(1);
  }

  const baseUrl = 'https://api.hetzner.cloud/v1';
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  console.log(`Deleting server with ID: ${serverId}...`);

  try {
    const response = await fetch(`${baseUrl}/servers/${serverId}`, {
      method: 'DELETE',
      headers
    });

    if (response.ok) {
      console.log('✓ Server deleted successfully');
    } else {
      const data = await response.json();
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
