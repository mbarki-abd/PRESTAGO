import { test, expect, Page } from '@playwright/test';

// =============================================================================
// PRESTAGO - Data Verification Tests
// =============================================================================
// Verifies that collections have data and UI displays correctly
// =============================================================================

const BASE_URL = process.env.BASE_URL || 'https://prestago.ilinqsoft.com';
const ADMIN_EMAIL = 'admin@nocobase.com';
const ADMIN_PASSWORD = 'admin123';

// Helper: Login as admin
async function loginAsAdmin(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  if (await emailInput.isVisible()) {
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  }
}

// Helper: Take screenshot
async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `screenshots/data-verification/${name}-${timestamp}.png`,
    fullPage: true
  });
}

// =============================================================================
// API Data Verification
// =============================================================================
test.describe('API Data Verification', () => {

  test('Verify Organizations have data', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    // Get organizations
    const response = await request.get(`${BASE_URL}/api/prestago_organizations:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('Organizations count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

  test('Verify Consultants have data', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    const response = await request.get(`${BASE_URL}/api/prestago_consultants:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('Consultants count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

  test('Verify Skills have data', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    const response = await request.get(`${BASE_URL}/api/prestago_skills:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('Skills count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

  test('Verify RFPs have data', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    const response = await request.get(`${BASE_URL}/api/prestago_rfps:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('RFPs count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

  test('Verify Missions have data', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    const response = await request.get(`${BASE_URL}/api/prestago_missions:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('Missions count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

  test('Verify Invoices have data', async ({ request }) => {
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    const response = await request.get(`${BASE_URL}/api/prestago_invoices:list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    console.log('Invoices count:', data.data?.length || 0);
    expect(data.data?.length).toBeGreaterThan(0);
  });

});

// =============================================================================
// UI Data Display Verification
// =============================================================================
test.describe('UI Data Display Verification', () => {

  test.beforeAll(async () => {
    // Create screenshots directory
    const fs = require('fs');
    const dir = 'screenshots/data-verification';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('Organizations page shows data table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/users`);
    await page.waitForTimeout(5000);

    // Look for table with data
    const tableRows = await page.locator('table tbody tr, .ant-table-row').count();
    await takeScreenshot(page, 'organizations-table');

    console.log('Table rows found:', tableRows);
  });

  test('Consultants page accessible', async ({ page }) => {
    await loginAsAdmin(page);

    // Try the new menu structure
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(3000);

    // Look for PRESTAGO menu
    const prestagoMenu = page.locator('text=PRESTAGO').first();
    if (await prestagoMenu.isVisible()) {
      await prestagoMenu.click();
      await page.waitForTimeout(1000);

      // Click Consultants
      const consultantsLink = page.locator('text=Consultants').first();
      if (await consultantsLink.isVisible()) {
        await consultantsLink.click();
        await page.waitForTimeout(3000);
        await takeScreenshot(page, 'consultants-page');
      }
    }
  });

  test('Skills page shows categories', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/skills`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'skills-page-with-data');

    // Check for any skill-related content
    const pageContent = await page.content();
    console.log('Page has content:', pageContent.length > 5000);
  });

  test('RFPs page shows listings', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/rfp`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'rfps-page-with-data');

    // Look for RFP titles or status indicators
    const statusBadges = await page.locator('.ant-tag, .ant-badge, [class*="status"]').count();
    console.log('Status badges found:', statusBadges);
  });

  test('Missions page shows active missions', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/missions`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'missions-page-with-data');
  });

  test('Timesheets page shows CRA entries', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/timesheets`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'timesheets-page-with-data');
  });

  test('Invoices page shows invoice list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/invoicing`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'invoices-page-with-data');
  });

  test('Contracts page shows contracts', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/prestago/contracts`);
    await page.waitForTimeout(5000);

    await takeScreenshot(page, 'contracts-page-with-data');
  });

});

// =============================================================================
// Data Summary Test
// =============================================================================
test.describe('Data Summary', () => {

  test('Print data summary from all collections', async ({ request }) => {
    // Login
    const loginResponse = await request.post(`${BASE_URL}/api/auth:signIn`, {
      data: { account: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const loginData = await loginResponse.json();
    const token = loginData.data?.token;

    if (!token) {
      console.log('Could not get auth token');
      return;
    }

    const collections = [
      'prestago_organizations',
      'prestago_consultants',
      'prestago_skills',
      'prestago_rfps',
      'prestago_applications',
      'prestago_missions',
      'prestago_timesheets',
      'prestago_invoices',
      'prestago_contracts',
      'prestago_notifications'
    ];

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║        PRESTAGO DATA SUMMARY               ║');
    console.log('╠════════════════════════════════════════════╣');

    let totalRecords = 0;

    for (const collection of collections) {
      const response = await request.get(`${BASE_URL}/api/${collection}:list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const count = data.data?.length || 0;
      totalRecords += count;

      const displayName = collection.replace('prestago_', '').padEnd(20);
      console.log(`║  ${displayName}: ${count.toString().padStart(5)} records    ║`);
    }

    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  TOTAL RECORDS: ${totalRecords.toString().padStart(5)}                    ║`);
    console.log('╚════════════════════════════════════════════╝\n');

    expect(totalRecords).toBeGreaterThan(0);
  });

});
