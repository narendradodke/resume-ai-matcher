import { test, expect } from '@playwright/test';

test.describe('Authentication & Landing Flows', () => {
  test('landing page renders hero, navigation, and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Resume/i);
    await expect(page.locator('text=Resume AI Matcher').or(page.locator('text=ResumeAI')).first()).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    await expect(page.locator('a[href="/signup"]').first()).toBeVisible();
  });

  test('login page has email and password inputs with validation', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('signup page renders input fields and navigation link to login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[placeholder*="Jane Doe"], input[placeholder*="Name"], input[id*="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});
