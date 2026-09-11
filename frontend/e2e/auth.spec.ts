import { test, expect } from '@playwright/test';
import { validateApiBaseUrl } from '../lib/api';

test.describe('Authentication & Landing Flows', () => {
  test('API Base URL configuration validator', () => {
    // 1. Production with missing URL must throw
    expect(() => validateApiBaseUrl('', 'production')).toThrow(
      /NEXT_PUBLIC_API_BASE_URL is not configured/
    );
    expect(() => validateApiBaseUrl(undefined, 'production')).toThrow(
      /NEXT_PUBLIC_API_BASE_URL is not configured/
    );

    // 2. Production with valid URL strips trailing slashes
    const prodUrl = validateApiBaseUrl(
      'https://backend-api.example.com/api/v1///',
      'production'
    );
    expect(prodUrl).toBe('https://backend-api.example.com/api/v1');

    // 3. Development defaults safely to localhost without trailing slashes
    const devDefault = validateApiBaseUrl(undefined, 'development');
    expect(devDefault).toBe('http://localhost:8000/api/v1');

    const devCustom = validateApiBaseUrl('http://localhost:8000/api/v1/', 'development');
    expect(devCustom).toBe('http://localhost:8000/api/v1');
  });

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

  test('signup flow sends POST to correct endpoint with payload and handles success', async ({ page }) => {
    let capturedUrl = '';
    let capturedMethod = '';
    let capturedPayload: Record<string, string> = {};

    await page.route('**/api/v1/auth/signup', async (route) => {
      const request = route.request();
      capturedUrl = request.url();
      capturedMethod = request.method();
      try {
        capturedPayload = JSON.parse(request.postData() || '{}');
      } catch {
        capturedPayload = {};
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-123',
            name: 'Jane Doe',
            email: 'jane.test@example.com',
          },
          error: null,
        }),
      });
    });

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'user-123',
              name: 'Jane Doe',
              email: 'jane.test@example.com',
              plan: 'free',
            },
          },
          error: null,
        }),
      });
    });

    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'user-123',
            name: 'Jane Doe',
            email: 'jane.test@example.com',
            plan: 'free',
          },
          error: null,
        }),
      });
    });

    await page.goto('/signup');
    await page.locator('input[placeholder*="Jane Doe"]').fill('Jane Doe');
    await page.locator('input[type="email"]').fill('jane.test@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');

    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');

    expect(capturedMethod).toBe('POST');
    expect(capturedUrl).toContain('/api/v1/auth/signup');
    expect(capturedPayload.name).toBe('Jane Doe');
    expect(capturedPayload.email).toBe('jane.test@example.com');
  });

  test('signup network error shows clear diagnostic and stays on page', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.abort('failed');
    });

    await page.goto('/signup');
    await page.locator('input[placeholder*="Jane Doe"]').fill('Jane Doe');
    await page.locator('input[type="email"]').fill('network.err@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');

    await page.locator('button[type="submit"]').click();

    // Verify user-friendly error message is displayed
    const errorAlert = page.locator('text=Unable to reach the server').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    // Verify user is NOT navigated to dashboard
    expect(page.url()).toContain('/signup');
  });

  test('signup 409 conflict error shows duplicate email message', async ({ page }) => {
    await page.route('**/api/v1/auth/signup', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          data: null,
          error: 'An account with this email already exists.',
        }),
      });
    });

    await page.goto('/signup');
    await page.locator('input[placeholder*="Jane Doe"]').fill('Jane Doe');
    await page.locator('input[type="email"]').fill('existing@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('password123');

    await page.locator('button[type="submit"]').click();

    const conflictMsg = page.locator('text=already exists').first();
    await expect(conflictMsg).toBeVisible({ timeout: 5000 });
    expect(page.url()).toContain('/signup');
  });

  test('login error handling displays invalid credentials and network error messages', async ({ page }) => {
    // 1. Invalid credentials (401)
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          data: null,
          error: 'Invalid email or password. Please try again.',
        }),
      });
    });

    await page.goto('/login');
    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Invalid email or password').first()).toBeVisible({ timeout: 5000 });
    expect(page.url()).toContain('/login');

    // 2. Network error
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.abort('failed');
    });

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Unable to reach the server').first()).toBeVisible({ timeout: 5000 });
    expect(page.url()).toContain('/login');
  });
});
