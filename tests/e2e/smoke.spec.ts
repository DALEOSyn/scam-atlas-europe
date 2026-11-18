import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test('tutorial 0-1: start, choose the habit, read the debrief', async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
  const foreign: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol !== 'data:' && url.origin !== origin) foreign.push(req.url());
  });

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Scam Atlas: Europe' })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);

  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/Welcome aboard, inspector/)).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
  await expect(page.locator('form[action]')).toHaveCount(0);

  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await expect(page.getByText('That is the habit that works.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Who really sent this?' })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);

  // Red Line 7 / privacy: nothing but the game's own origin is ever requested.
  expect(foreign).toEqual([]);
  // Catches CSP violations and runtime errors.
  expect(consoleErrors).toEqual([]);
});

// The fall / training-page path (fee page, damage control) is covered in tests/unit/forms.test.tsx with the
// example fixture; the stub shell only plays the first tutorial scenario, which is genuine.
test('tutorial 0-1: report a genuine message, read the debrief', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('desk.waymarker-network.example/travel-pack', { exact: false })).toBeVisible();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await page.getByRole('button', { name: /Report the email as phishing/ }).click();
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await expect(page.getByText('0 of 3 stars.', { exact: false })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
});

test('service worker registers (offline-capable)', async ({ page }) => {
  await page.goto('/');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe('/');
});

test('production build ships a CSP that blocks form submission and a web app manifest', async ({ page }) => {
  await page.goto('/');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("form-action 'none'");
  expect(csp).toContain("connect-src 'self'");
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});
