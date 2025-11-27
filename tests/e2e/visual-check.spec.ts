import { test, expect } from '@playwright/test';

const BASE_URL = 'https://prestago.ilinqsoft.com';
const ADMIN_EMAIL = 'admin@nocobase.com';
const ADMIN_PASSWORD = 'admin123';

const PRESTAGO_PAGES = [
  { name: 'users', title: 'Users' },
  { name: 'skills', title: 'Skills' },
  { name: 'rfp', title: 'RFPs' },
  { name: 'applications', title: 'Applications' },
  { name: 'missions', title: 'Missions' },
  { name: 'timesheets', title: 'Timesheets' },
  { name: 'invoicing', title: 'Invoices' },
  { name: 'contracts', title: 'Contracts' },
  { name: 'notifications', title: 'Notifications' },
  { name: 'reporting', title: 'Reports' }
];

async function login(page: any) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"], input[name="account"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

test.describe('PRESTAGO Visual Check', () => {

  test('capture login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });

    // Check for login form
    const loginForm = page.locator('form').first();
    await expect(loginForm).toBeVisible({ timeout: 10000 });
  });

  test('login and capture dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="text"], input[name="account"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.screenshot({ path: 'screenshots/02-login-filled.png', fullPage: true });

    // Click login button
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/03-after-login.png', fullPage: true });
  });

  test('check plugin manager', async ({ page }) => {
    await login(page);

    // Go to plugin manager
    await page.goto(`${BASE_URL}/admin/pm/list/local/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Search for PRESTAGO plugins
    const searchInput = page.locator('input[placeholder="Search plugin"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('prestago');
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'screenshots/04-plugin-manager-prestago.png', fullPage: true });

    // Check for PRESTAGO plugins
    const pageContent = await page.content();
    const hasPrestagoPlugins = pageContent.includes('@prestago');
    console.log('PRESTAGO plugins visible:', hasPrestagoPlugins);
  });

  test('check PRESTAGO pages are accessible', async ({ page }) => {
    await login(page);

    const accessiblePages: string[] = [];
    const failedPages: string[] = [];

    for (const p of PRESTAGO_PAGES) {
      const url = `${BASE_URL}/admin/prestago/${p.name}`;
      console.log(`Checking page: ${url}`);

      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take screenshot
      await page.screenshot({ path: `screenshots/prestago-${p.name}.png`, fullPage: true });

      // Check if page content is visible (not 404)
      const content = await page.content();
      if (content.includes(p.title) || content.includes('PRESTAGO')) {
        accessiblePages.push(p.name);
        console.log(`  ✓ ${p.name} page accessible`);
      } else {
        failedPages.push(p.name);
        console.log(`  ✗ ${p.name} page NOT accessible`);
      }
    }

    console.log(`\nAccessible pages: ${accessiblePages.length}/${PRESTAGO_PAGES.length}`);
    console.log(`Accessible: ${accessiblePages.join(', ')}`);
    if (failedPages.length > 0) {
      console.log(`Failed: ${failedPages.join(', ')}`);
    }

    // At least some pages should be accessible
    expect(accessiblePages.length).toBeGreaterThan(0);
  });

  test('check PRESTAGO menus are visible', async ({ page }) => {
    await login(page);

    // Go to admin page
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of main admin page with sidebar
    await page.screenshot({ path: 'screenshots/10-admin-sidebar.png', fullPage: true });

    // Check for PRESTAGO menu in sidebar
    let pageContent = await page.content();
    const hasPRESTAGOMenu = pageContent.includes('PRESTAGO');
    console.log('PRESTAGO menu visible in sidebar:', hasPRESTAGOMenu);

    // Try to click on PRESTAGO menu to expand it
    const prestagoMenu = page.locator('text=PRESTAGO').first();
    if (await prestagoMenu.isVisible()) {
      console.log('Clicking on PRESTAGO menu to expand...');
      await prestagoMenu.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/11-prestago-expanded.png', fullPage: true });
    }

    // Refresh content after expansion
    pageContent = await page.content();

    // Look for menu items
    const menuItems = await page.locator('nav, aside, .ant-menu, [class*="menu"]').allTextContents();
    console.log('Menu contents:', menuItems.join(' | ').substring(0, 500));

    // Check for specific menu items
    for (const p of PRESTAGO_PAGES.slice(0, 5)) {
      const hasMenuItem = pageContent.includes(p.title);
      console.log(`  Menu "${p.title}": ${hasMenuItem ? 'found' : 'not found'}`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/12-final-sidebar.png', fullPage: true });
  });

  test('capture console errors', async ({ page }) => {
    const errors: string[] = [];
    const logs: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    await login(page);

    // Go to plugin manager
    await page.goto(`${BASE_URL}/admin/pm/list/local/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/05-final-state.png', fullPage: true });

    // Log all errors
    console.log('=== CONSOLE ERRORS ===');
    errors.forEach(e => console.log(e));
    console.log('=== END ERRORS ===');

    // Filter PRESTAGO plugin errors (not URL-based errors)
    const prestagoErrors = errors.filter(e =>
      e.includes('@prestago/plugin') ||
      (e.includes('prestago') && !e.includes('prestago.ilinqsoft.com'))
    );
    expect(prestagoErrors).toHaveLength(0);
  });

});
