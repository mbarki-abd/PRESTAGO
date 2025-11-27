// Fix PRESTAGO menus in NocoBase - clean duplicates and add paths via options
const https = require('https');

const BASE_URL = 'https://prestago.ilinqsoft.com';
const ADMIN_EMAIL = 'admin@nocobase.com';
const ADMIN_PASSWORD = 'admin123';

const PRESTAGO_MENUS = [
  { name: 'users', title: 'Users', icon: 'UserOutlined' },
  { name: 'skills', title: 'Skills', icon: 'StarOutlined' },
  { name: 'rfp', title: 'RFPs', icon: 'FileSearchOutlined' },
  { name: 'applications', title: 'Applications', icon: 'FormOutlined' },
  { name: 'missions', title: 'Missions', icon: 'RocketOutlined' },
  { name: 'timesheets', title: 'Timesheets', icon: 'CalendarOutlined' },
  { name: 'invoicing', title: 'Invoices', icon: 'DollarOutlined' },
  { name: 'contracts', title: 'Contracts', icon: 'FileTextOutlined' },
  { name: 'notifications', title: 'Notifications', icon: 'BellOutlined' },
  { name: 'reporting', title: 'Reports', icon: 'BarChartOutlined' }
];

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function login() {
  console.log('Logging in...');
  const response = await fetchJson(`${BASE_URL}/api/auth:signIn`, {
    method: 'POST',
    body: {
      account: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }
  });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
  }

  const token = response.data?.data?.token;
  if (!token) {
    throw new Error('No token in response');
  }

  console.log('Login successful!');
  return token;
}

async function getExistingRoutes(token) {
  const response = await fetchJson(`${BASE_URL}/api/desktopRoutes:list?pageSize=200`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status !== 200) {
    console.log('Failed to get routes:', response.data);
    return [];
  }

  return response.data?.data || [];
}

async function deleteRoute(token, id) {
  const response = await fetchJson(`${BASE_URL}/api/desktopRoutes:destroy?filterByTk=${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return response;
}

async function updateRoute(token, id, data) {
  const response = await fetchJson(`${BASE_URL}/api/desktopRoutes:update?filterByTk=${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data
  });
  return response;
}

async function createRoute(token, route) {
  const response = await fetchJson(`${BASE_URL}/api/desktopRoutes:create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: route
  });
  return response;
}

async function main() {
  try {
    const token = await login();

    // Get existing routes
    console.log('\nFetching existing routes...');
    let existingRoutes = await getExistingRoutes(token);
    console.log(`Found ${existingRoutes.length} total routes`);

    // Find all PRESTAGO-related routes
    const prestagoRoutes = existingRoutes.filter(r =>
      r.title === 'PRESTAGO' ||
      PRESTAGO_MENUS.some(m => m.title === r.title)
    );
    console.log(`Found ${prestagoRoutes.length} PRESTAGO-related routes`);

    // Delete all PRESTAGO routes first
    console.log('\nDeleting existing PRESTAGO routes...');
    for (const route of prestagoRoutes) {
      const result = await deleteRoute(token, route.id);
      if (result.status === 200) {
        console.log(`  Deleted: ${route.title} (${route.id})`);
      } else {
        console.log(`  Failed to delete ${route.title}:`, result.data);
      }
    }

    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));

    // Create PRESTAGO parent menu
    console.log('\nCreating PRESTAGO parent menu...');
    const parentResult = await createRoute(token, {
      title: 'PRESTAGO',
      icon: 'AppstoreOutlined',
      type: 'group',
      sort: 1,
      hideInMenu: false,
      hidden: false
    });

    if (parentResult.status !== 200) {
      console.log('Failed to create parent:', parentResult.data);
      return;
    }

    const parentId = parentResult.data?.data?.id;
    console.log(`✓ PRESTAGO parent created (ID: ${parentId})`);

    // Create child menus with options containing the URL
    console.log('\nCreating PRESTAGO submenus...');

    for (let i = 0; i < PRESTAGO_MENUS.length; i++) {
      const menu = PRESTAGO_MENUS[i];
      const path = `/admin/prestago/${menu.name}`;

      const result = await createRoute(token, {
        title: menu.title,
        icon: menu.icon,
        type: 'link',
        parentId: parentId,
        sort: i + 1,
        hideInMenu: false,
        hidden: false,
        options: {
          url: path,
          href: path
        }
      });

      if (result.status === 200) {
        console.log(`  ✓ ${menu.title} -> ${path}`);
      } else {
        console.log(`  ✗ ${menu.title} failed:`, result.data?.errors || result.data);
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }

    // Verify
    console.log('\nVerifying routes...');
    existingRoutes = await getExistingRoutes(token);
    const finalPrestagoRoutes = existingRoutes.filter(r =>
      r.title === 'PRESTAGO' ||
      r.parentId === parentId
    );
    console.log(`\nPRESTAGO routes created: ${finalPrestagoRoutes.length}`);
    finalPrestagoRoutes.forEach(r => {
      const url = r.options?.url || r.options?.href || '(no url)';
      console.log(`  - ${r.title}: ${url}`);
    });

    console.log('\nDone! Refresh the browser to see the menus.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
