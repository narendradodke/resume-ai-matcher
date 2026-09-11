import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('landing page mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 1-2px tolerance
  });

  test('login page on mobile renders submit button visibly', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});
