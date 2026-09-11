import { test, expect } from '@playwright/test';

test.describe('Dashboard Shell & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock /api/v1/auth/me response so useAuth sees a valid user
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'E2E Tester',
            email: 'e2e@example.com',
            plan: 'free',
            is_verified: true,
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      });
    });

    // Mock resumes list
    await page.route('**/api/v1/resume/list', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          error: null,
        }),
      });
    });

    // Mock history list
    await page.route('**/api/v1/analysis/history*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { items: [], total: 0, page: 1, limit: 10, total_pages: 1 },
          error: null,
        }),
      });
    });

    // Set localStorage auth tokens
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock_jwt_access_token');
      localStorage.setItem('refresh_token', 'mock_jwt_refresh_token');
      localStorage.setItem('auth_user', JSON.stringify({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'E2E Tester',
        email: 'e2e@example.com',
        plan: 'free',
        is_verified: true,
        created_at: new Date().toISOString(),
      }));
    });
  });

  test('dashboard renders greeting and primary navigation cards', async ({ page }) => {
    await page.goto('/dashboard');
    // Look for heading in main content area
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('main a[href="/dashboard/upload"]').first()).toBeVisible();
  });

  test('upload page renders resume dropzone and job description textarea', async ({ page }) => {
    await page.goto('/dashboard/upload');
    await expect(page.locator('text=Your Resume (PDF)').first()).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('history page renders without crashing', async ({ page }) => {
    await page.goto('/dashboard/history');
    await expect(page.locator('h1:has-text("Analysis History")')).toBeVisible();
  });
});
