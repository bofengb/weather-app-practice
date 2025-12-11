import { test, expect } from '@playwright/test';
import { testUser } from './setup';

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page }) => {
    // login before each test
    await page.goto('/login');
    await page.getByTestId('login-email').fill(testUser.email);
    await page.getByTestId('login-password').fill(testUser.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/weather');
  });

  test('search city, add to favorites, verify on favorites page', async ({
    page,
  }) => {
    // search for a city
    await page.getByTestId('weather-search').fill('Tokyo');

    // wait for suggestions and click first result
    await page.getByTestId('city-suggestion-0').click();

    // wait for weather to load, then add to favorites
    await expect(page.getByTestId('favorite-toggle')).toBeVisible();
    await page.getByTestId('favorite-toggle').click();

    // navigate to favorites page
    await page.getByTestId('nav-favorites').click();
    await expect(page).toHaveURL('/favorites');

    // verify Tokyo appears in favorites
    await expect(page.getByTestId('favorites-grid')).toBeVisible();
    await expect(page.getByTestId('favorite-card-Tokyo')).toBeVisible();
  });
});
