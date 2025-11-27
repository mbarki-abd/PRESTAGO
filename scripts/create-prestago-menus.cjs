// Create PRESTAGO menus in NocoBase desktopRoutes via API
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
  console.log('Fetching existing routes...');
  const response = await fetchJson(`${BASE_URL}/api/desktopRoutes:list?pageSize=100&appends=children`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status !== 200) {
    console.log('Failed to get routes:', response.data);
    return [];
  }

  console.log('Routes response:', JSON.stringify(response.data?.data?.slice(0, 3), null, 2));
  return response.data?.data || [];
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
    const existingRoutes = await getExistingRoutes(token);
    console.log(`Found ${existingRoutes.length} existing routes`);

    // Check for existing PRESTAGO parent menu
    let prestagoParent = existingRoutes.find(r => r.title === 'PRESTAGO');

    if (!prestagoParent) {
      console.log('\nCreating PRESTAGO parent menu...');
      const parentResult = await createRoute(token, {
        title: 'PRESTAGO',
        icon: 'AppstoreOutlined',
        type: 'group',
        enabledTabs: true,
        sort: 10
      });

      if (parentResult.status === 200) {
        prestagoParent = parentResult.data?.data;
        console.log('✓ PRESTAGO parent menu created');
      } else {
        console.log('Failed to create parent:', parentResult.data);
      }
    } else {
      console.log('PRESTAGO parent menu already exists');
    }

    const parentId = prestagoParent?.id;

    // Create child menus
    console.log('\nCreating PRESTAGO submenus...');

    for (let i = 0; i < PRESTAGO_MENUS.length; i++) {
      const menu = PRESTAGO_MENUS[i];
      const existingMenu = existingRoutes.find(r => r.title === menu.title && r.path?.includes('prestago'));

      if (existingMenu) {
        console.log(`  - ${menu.title} already exists`);
        continue;
      }

      const result = await createRoute(token, {
        title: menu.title,
        icon: menu.icon,
        type: 'link',
        path: `/admin/prestago/${menu.name}`,
        parentId: parentId,
        sort: i + 1
      });

      if (result.status === 200) {
        console.log(`  ✓ ${menu.title} menu created`);
      } else {
        console.log(`  ✗ ${menu.title} failed:`, result.data?.errors || result.data);
      }
    }

    // Verify
    console.log('\nVerifying routes...');
    const finalRoutes = await getExistingRoutes(token);
    const prestagoRoutes = finalRoutes.filter(r => r.path?.includes('prestago') || r.title === 'PRESTAGO');
    console.log(`PRESTAGO routes count: ${prestagoRoutes.length}`);
    prestagoRoutes.forEach(r => console.log(`  - ${r.title}: ${r.path || '(group)'}`));

    console.log('\nDone! Refresh the browser to see the menus.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
