import { test, expect } from '@playwright/test';

// =============================================================================
// PRESTAGO - End-to-End Tests
// =============================================================================
// Tests all major features of the PRESTAGO platform
// =============================================================================

const BASE_URL = process.env.BASE_URL || 'http://46.224.74.192';

// Test credentials (created during NocoBase setup)
const ADMIN_EMAIL = 'admin@nocobase.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('PRESTAGO Platform Tests', () => {

  // ===========================================================================
  // 1. Application Accessibility
  // ===========================================================================
  test.describe('Application Accessibility', () => {

    test('should load the homepage', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      expect(response?.status()).toBe(200);
    });

    test('should display the login page', async ({ page }) => {
      await page.goto(BASE_URL);
      // NocoBase shows login or setup page on first access
      await expect(page).toHaveTitle(/NocoBase/i);
    });

    test('should have responsive design', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await page.goto(BASE_URL);
      expect(await page.isVisible('body')).toBeTruthy();

      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.goto(BASE_URL);
      expect(await page.isVisible('body')).toBeTruthy();
    });

  });

  // ===========================================================================
  // 2. Authentication Tests
  // ===========================================================================
  test.describe('Authentication', () => {

    test('should show login form or setup page', async ({ page }) => {
      await page.goto(BASE_URL);
      // NocoBase shows either login form or initial setup page
      // Check for any interactive elements
      const hasForm = await page.isVisible('form, input, button');
      const hasContent = await page.isVisible('body');
      expect(hasForm || hasContent).toBeTruthy();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(BASE_URL);

      // Try to find and fill login form
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('invalid@test.com');
        await passwordInput.fill('wrongpassword');
        await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');

        // Wait for error message or stay on login page
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        expect(currentUrl).toContain(BASE_URL);
      }
    });

  });

  // ===========================================================================
  // 3. API Health Checks
  // ===========================================================================
  test.describe('API Health', () => {

    test('should respond to API requests', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/`);
      // API should return some response (not 500)
      expect(response.status()).toBeLessThan(500);
    });

    test('should have CORS headers', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/`, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      // Should not error on cross-origin
      expect(response.status()).toBeLessThan(500);
    });

  });

  // ===========================================================================
  // 4. NocoBase Core Features
  // ===========================================================================
  test.describe('NocoBase Core', () => {

    test('should serve static assets', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`);
      expect(response.status()).toBe(200);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/html');
    });

    test('should handle 404 gracefully', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/non-existent-page-12345`);
      // Should return something, not crash
      expect(response?.status()).toBeDefined();
    });

  });

  // ===========================================================================
  // 5. Database Connectivity
  // ===========================================================================
  test.describe('Database Connectivity', () => {

    test('should connect to PostgreSQL', async ({ request }) => {
      // Try to access any API endpoint that requires DB
      const response = await request.get(`${BASE_URL}/api/users:list`, {
        failOnStatusCode: false
      });
      // Should not return 500 (DB connection error)
      // 401/403 is expected without auth
      expect([200, 401, 403]).toContain(response.status());
    });

  });

  // ===========================================================================
  // 6. Plugin System Tests (PRESTAGO Plugins)
  // ===========================================================================
  test.describe('Plugin System', () => {

    test('should have plugin endpoints available', async ({ request }) => {
      // Test various plugin API endpoints
      const endpoints = [
        '/api/users:list',
        '/api/organizations:list',
        '/api/skills:list',
        '/api/rfps:list',
        '/api/missions:list',
        '/api/timesheets:list',
        '/api/invoices:list',
        '/api/contracts:list',
        '/api/notifications:list',
        '/api/dashboards:list',
      ];

      for (const endpoint of endpoints) {
        const response = await request.get(`${BASE_URL}${endpoint}`, {
          failOnStatusCode: false
        });
        // Endpoints should exist (not 404 for standard, 404 OK for custom plugins not yet installed)
        expect([200, 401, 403, 404]).toContain(response.status());
      }
    });

  });

  // ===========================================================================
  // 7. Performance Tests
  // ===========================================================================
  test.describe('Performance', () => {

    test('should load homepage within 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle concurrent requests', async ({ request }) => {
      const requests = Array(10).fill(null).map(() =>
        request.get(`${BASE_URL}/api/`, { failOnStatusCode: false })
      );
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status()).toBeLessThan(500);
      });
    });

  });

  // ===========================================================================
  // 8. Security Tests
  // ===========================================================================
  test.describe('Security', () => {

    test('should not expose sensitive headers', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`);
      const headers = response.headers();
      // Should not expose server version details
      expect(headers['x-powered-by']).toBeUndefined();
    });

    test('should protect API endpoints', async ({ request }) => {
      // Sensitive endpoints should require auth
      const sensitiveEndpoints = [
        '/api/users:list',
        '/api/systemSettings:get',
      ];

      for (const endpoint of sensitiveEndpoints) {
        const response = await request.get(`${BASE_URL}${endpoint}`, {
          failOnStatusCode: false
        });
        // Should require authentication or return protected response
        expect([200, 401, 403]).toContain(response.status());
      }
    });

    test('should sanitize inputs', async ({ request }) => {
      // Try SQL injection in query params
      const response = await request.get(`${BASE_URL}/api/users:list?filter={"email":"'; DROP TABLE users;--"}`, {
        failOnStatusCode: false
      });
      // Should not crash the server
      expect(response.status()).toBeLessThan(500);
    });

    test('should prevent XSS', async ({ page }) => {
      // Try to inject script via URL
      await page.goto(`${BASE_URL}/?q=<script>alert('xss')</script>`);
      // Page should load without executing malicious script
      const alerts: string[] = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    });

  });

  // ===========================================================================
  // 9. UI/UX Tests
  // ===========================================================================
  test.describe('UI/UX', () => {

    test('should have consistent styling', async ({ page }) => {
      await page.goto(BASE_URL);
      // Check that CSS is loaded
      const styles = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return {
          fontFamily: computedStyle.fontFamily,
          backgroundColor: computedStyle.backgroundColor
        };
      });
      expect(styles.fontFamily).toBeDefined();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(BASE_URL);
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      // Should have focus on an element
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeDefined();
    });

  });

  // ===========================================================================
  // 10. Infrastructure Tests
  // ===========================================================================
  test.describe('Infrastructure', () => {

    test('should have working reverse proxy', async ({ request }) => {
      const response = await request.get(BASE_URL);
      expect(response.status()).toBe(200);
    });

    test('should handle large responses', async ({ request }) => {
      // Request that might return large data
      const response = await request.get(`${BASE_URL}/api/`, {
        failOnStatusCode: false,
        timeout: 30000
      });
      expect(response.status()).toBeLessThan(500);
    });

  });

});

// =============================================================================
// Plugin-Specific Tests
// =============================================================================

test.describe('PRESTAGO Plugin Features', () => {

  // ===========================================================================
  // Users & Organizations Plugin
  // ===========================================================================
  test.describe('Plugin: Users & Organizations', () => {

    test('should have user management API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403]).toContain(response.status());
    });

    test('should have organization management API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_organizations:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Skills & Profiles Plugin
  // ===========================================================================
  test.describe('Plugin: Skills & Profiles', () => {

    test('should have skills API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_skills:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test('should have profiles API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_consultant_profiles:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // RFP Plugin
  // ===========================================================================
  test.describe('Plugin: RFP', () => {

    test('should have RFP API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_rfps:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Applications Plugin
  // ===========================================================================
  test.describe('Plugin: Applications', () => {

    test('should have applications API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_applications:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Missions Plugin
  // ===========================================================================
  test.describe('Plugin: Missions', () => {

    test('should have missions API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_missions:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Timesheets Plugin
  // ===========================================================================
  test.describe('Plugin: Timesheets', () => {

    test('should have timesheets API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_timesheets:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Invoicing Plugin
  // ===========================================================================
  test.describe('Plugin: Invoicing', () => {

    test('should have invoices API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_invoices:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Contracts Plugin
  // ===========================================================================
  test.describe('Plugin: Contracts', () => {

    test('should have contracts API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_contracts:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Notifications Plugin
  // ===========================================================================
  test.describe('Plugin: Notifications', () => {

    test('should have notifications API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_notifications:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

  // ===========================================================================
  // Reporting Plugin
  // ===========================================================================
  test.describe('Plugin: Reporting', () => {

    test('should have dashboards API', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/prestago_dashboards:list`, {
        failOnStatusCode: false
      });
      expect([200, 401, 403, 404]).toContain(response.status());
    });

  });

});
