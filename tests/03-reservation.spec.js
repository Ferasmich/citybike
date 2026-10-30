const { test, expect } = require('@playwright/test');

test('invalid email blocks reservation', async ({ page }) => {
  const posts = [];

  page.on('request', request => {
    if (request.method() === 'POST' &&
        new URL(request.url()).pathname === '/api/reservations') {
      posts.push(request);
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('invalid-email');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect(page.getByRole('alert')).toHaveText('Enter a valid email address.');
  expect(posts).toHaveLength(0);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  let payload;

  await page.route('**/api/reservations', async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      json: { reservationId: 'CB-DEMO-777', stationId: 'central' }
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('student@example.com');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect(page.getByRole('status')).toHaveText('Reservation confirmed: CB-DEMO-777');
  expect(payload).toEqual({
    stationId: 'central',
    email: 'student@example.com'
  });
});
