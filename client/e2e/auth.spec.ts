import { test, expect } from '@playwright/test';
import { testUser } from './setup';

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill(testUser.email);
    await page.getByTestId('login-password').fill(testUser.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/weather');
    await expect(page.getByTestId('nav-favorites')).toBeVisible();
  });
});
