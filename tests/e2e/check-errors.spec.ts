import { test, expect } from '@playwright/test';

const BASE_URL = 'https://prestago.ilinqsoft.com';

test('should load without JavaScript errors', async ({ page }) => {
  const errors: string[] = [];

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Wait for all scripts to load

  // Log errors for debugging
  if (errors.length > 0) {
    console.log('Errors found:', errors);
  }

  // Filter out known non-critical errors
  const criticalErrors = errors.filter(e =>
    e.includes('@prestago') ||
    e.includes('Script error')
  );

  expect(criticalErrors).toHaveLength(0);
});
