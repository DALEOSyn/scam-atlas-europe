import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

async function continueToNext(page: Page) {
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('tutorial chapter: full play-through with the habits, What now?, stamp and local save', async ({ page, baseURL }) => {
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
  await axeClean(page);
  await page.getByRole('button', { name: 'Start' }).click();

  // 0-1 genuine welcome email: Check tool + tag, then the verify habit.
  await expect(page.getByText(/Welcome aboard, inspector/)).toBeVisible();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await page.getByRole('button', { name: /Details you can check/ }).click();
  await page.getByRole('button', { name: /Check Sender/ }).click();
  await expect(page.getByRole('button', { name: 'Mark as suspicious' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await expect(page.getByText('That is the habit that works.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Who really sent this?' })).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  // 0-2 fraud: open the mail app yourself.
  await page.getByRole('button', { name: /Open Waymarker mail yourself/ }).click();
  await continueToNext(page);

  // 0-3: the first timer is on a genuine message; timing is chosen first (GDD §8, A1).
  await expect(page.getByRole('heading', { name: 'How much time do you want?' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Standard timer' }).click();
  await expect(page.getByRole('timer')).toContainText('left');
  await expect(page.getByRole('meter', { name: 'Stress' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Go to your inbox' }).click();
  await page.getByRole('button', { name: /Use the link and set a new password/ }).click();
  await expect(page.getByText('3 of 3 stars.')).toBeVisible();
  await continueToNext(page);

  // 0-4 fraud with a timer: open Kettle yourself.
  await page.getByRole('button', { name: /Open Kettle yourself/ }).click();
  await continueToNext(page);

  // 0-5 drill: damage control for Teo, unscored.
  await page.getByRole('button', { name: /Talk Teo through/ }).click();
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: /Block your card/ }).click();
  await page.getByRole('button', { name: /Call your bank/ }).click();
  await page.getByRole('button', { name: /Report it to the police/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await expect(page.getByText(/of 3 stars/)).toHaveCount(0);
  await continueToNext(page);

  // 0-6 boss: three beats on the scammer's schedule; beat 3 hang up → "What now?".
  await page.getByRole('button', { name: /Open Waymarker Desk from your bookmark/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Check with Adaeze/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Hang up', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What now?' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Ask Adaeze through the staff directory' }).click();
  await expect(page.getByText('3 of 3 stars.')).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  await expect(page.getByRole('heading', { name: 'Chapter complete' })).toBeVisible();
  await expect(page.getByText(/Passport stamp:/)).toBeVisible();
  await expect(page.getByText(/Genuine messages you reported: 0/)).toBeVisible();
  await axeClean(page);

  // Progress is saved locally only (Red Line 7).
  const saved = await page.evaluate(() => localStorage.getItem('scam-atlas-europe:save'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ version: 1, settings: { timerMode: 'standard' }, chapters: { home: { finished: true } } });
  expect(foreign).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('tutorial 0-2: fall on the training page, damage control, blame-free debrief', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: /Report the email as phishing/ }).click();
  await expect(page.getByText('0 of 3 stars.', { exact: false })).toBeVisible();
  await expect(page.getByText(/You chose: Report the email as phishing/)).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  await page.getByRole('button', { name: /Tap the link and free up space/ }).click();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await axeClean(page);
  await page.getByRole('button', { name: /Type your Waymarker password/ }).click();
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeVisible();
  await page.getByRole('button', { name: /Change the password/ }).first().click();
  await page.getByRole('button', { name: /Turn on two-step/ }).click();
  await page.getByRole('button', { name: /Sign out of every other session/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('heading', { name: 'Debrief' })).toBeVisible();
  await expect(page.getByText('1 of 3 stars.')).toBeVisible();
  await expect(page.getByText(/could happen to anyone/)).toBeVisible();
  await axeClean(page);
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
