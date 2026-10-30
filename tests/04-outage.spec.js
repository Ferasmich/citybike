const { test, expect } = require('@playwright/test');

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let attempts = 0;

  await page.route('**/api/stations', async route => {
    attempts++;

    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        json: { error: 'Service unavailable' }
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('Unable to load stations.');

  await page.getByRole('button', { name: 'Retry loading' }).click();

  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await expect(page.getByRole('alert')).toBeHidden();

  expect(attempts).toBe(2);
});
