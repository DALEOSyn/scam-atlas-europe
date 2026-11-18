import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const debriefHeading = (page: Page) => page.getByRole('heading', { level: 1, name: /^This was|Teo was right/ });

async function continueToNext(page: Page) {
  await expect(debriefHeading(page)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

/** Every control except inline checkables in running text is at least 44 × 44 CSS px (UI_SPEC --tap-min). */
async function tapTargetsOk(page: Page) {
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href], summary')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false; // hidden
        if (el.closest('[hidden]')) return false;
        if (el.matches('a[href^="#options"]') && r.top < 0) return false; // skip link off-screen until focused
        // Checkables in running text extend their hit area 12 px above and below through ::before.
        const extra = el.matches('[data-check]') ? 24 : 0;
        return r.height + extra < 43.5 || (r.width < 43.5 && !el.matches('[data-check]'));
      })
      .map((el) => `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
  );
  expect(small).toEqual([]);
}

/** Answer a call and wait for the actions (lines arrive at reading pace). */
async function answerCall(page: Page) {
  await page.getByRole('button', { name: 'Answer' }).click();
  await expect(page.getByRole('button', { name: 'Hang up', exact: true })).toBeVisible();
}

test('tutorial chapter: full play-through on the new devices, What now?, stamp and local save', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
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

  // 0-1 genuine welcome email on the laptop mail device: Check card + tag, then the verify habit.
  await expect(page.getByRole('region', { name: 'Laptop: Mail' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await page.locator('[data-check="sender.detail"]').click();
  const card = page.getByRole('dialog', { name: /Sender details/ });
  await expect(card).toBeVisible();
  await expect(card.getByText('adaeze.okafor-lind@waymarker-network.example').first()).toBeVisible();
  await expect(card.getByRole('button', { name: /^Mark as suspicious/ })).toHaveAttribute('aria-pressed', 'false');
  await axeClean(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-check="sender.detail"]')).toBeFocused();
  await tapTargetsOk(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByText('That is the habit that works.', { exact: false })).toBeVisible();
  await expect(page.getByText(/could happen to anyone/)).toHaveCount(0);
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Who really sent this?' })).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  // 0-2 fraud: open the mail app yourself.
  await page.getByRole('button', { name: /Open Waymarker mail yourself/ }).click();
  await continueToNext(page);

  // 0-3: timing is chosen first (GDD §8); the page opens on the browser, then the reset email.
  await expect(page.getByRole('heading', { name: 'How much time do you want?' })).toBeFocused();
  await axeClean(page);
  await page.getByRole('button', { name: 'Standard timer' }).click();
  await expect(page.getByRole('region', { name: 'Laptop: Browser' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText(/\d:\d\d/);
  await expect(page.getByRole('meter', { name: 'Stress' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Go to your inbox' }).click();
  await expect(page.getByRole('heading', { name: 'Email from Waymarker Desk' })).toBeFocused();
  await page.getByRole('button', { name: /Use the link and set a new password/ }).click();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await continueToNext(page);

  // 0-4 SMS with a timer and pushers: Take a breath, then open Kettle yourself.
  await expect(page.getByRole('region', { name: 'Phone: Messages' })).toBeVisible();
  await page.locator('[data-hud="pause"]').click();
  await expect(page.getByText('Real companies give you days, not seconds.')).toBeVisible();
  await expect(page.locator('[data-hud="pause"]')).toBeFocused(); // Take a breath never moves focus away from the control
  await axeClean(page);
  await page.getByRole('button', { name: 'Back to it' }).click();
  await page.getByRole('button', { name: /Open Kettle yourself/ }).click();
  await continueToNext(page);

  // 0-5 drill in the Kettle chat: damage control for Teo, unscored; drill layout has no verdict or stars.
  await expect(page.getByRole('region', { name: 'Phone: Kettle' })).toBeVisible();
  await page.getByRole('button', { name: /Talk Teo through/ }).click();
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeFocused();
  await axeClean(page);
  await page.getByRole('button', { name: /Block your card/ }).click();
  await page.getByRole('button', { name: /Call your bank/ }).click();
  await page.getByRole('button', { name: /Report it to the police/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('heading', { name: 'Your steps' })).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Teo was right to ask/ })).toBeVisible();
  await expect(page.getByText(/This was (a scam|genuine)/)).toHaveCount(0);
  await expect(page.getByRole('img', { name: /of 3 stars/ })).toHaveCount(0);
  await continueToNext(page);

  // 0-6 boss: email → Kettle chat → call; beat 3: answer, hang up → "What now?".
  await page.getByRole('button', { name: /Open Waymarker Desk from your bookmark/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Chat message from Waymarker IT' })).toBeFocused();
  await page.getByRole('button', { name: /Check with Adaeze/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('region', { name: 'Phone: Call' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText(/\d:\d\d/);
  await answerCall(page);
  await expect(page.getByRole('log')).toContainText('IT desk here');
  await page.getByRole('button', { name: 'Hang up', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What now?' })).toBeFocused();
  await expect(page.getByText('Call ended')).toBeVisible();
  // No checks after hanging up.
  await expect(page.getByRole('button', { name: /Details you can check/ })).toHaveCount(0);
  await axeClean(page);
  await page.getByRole('button', { name: 'Ask Adaeze through the staff directory' }).click();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Chapter complete' })).toBeFocused();
  await expect(page.getByText(/Passport stamp:/)).toBeVisible();
  await expect(page.getByText(/Red flags you spotted: 0 of \d+ · Genuine messages you reported: 0/)).toBeVisible();
  await expect(page.getByText(/To reach silver next time:/)).toBeVisible();
  await axeClean(page);

  // Progress is saved locally only (Red Line 7).
  const saved = await page.evaluate(() => localStorage.getItem('scam-atlas-europe:save'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ version: 1, settings: { timerMode: 'standard' }, chapters: { home: { finished: true } } });
  expect(foreign).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('tutorial 0-2: fall on the training page, damage control feedback, blame-free debrief', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: /Report the email as phishing/ }).click();
  await expect(page.getByRole('img', { name: '0 of 3 stars' })).toBeVisible();
  await expect(page.getByText(/You chose: Report the email as phishing/)).toBeVisible();
  await expect(page.getByText(/could happen to anyone/)).toHaveCount(0);
  await axeClean(page);
  await continueToNext(page);

  await page.getByRole('button', { name: /Tap the link and free up space/ }).click();
  await expect(page.getByRole('region', { name: 'Laptop: Browser, training page' })).toBeVisible();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Simulation/ })).toBeVisible();
  // The owner part is highlighted in the address bar once the address is checked.
  const address = page.locator('[data-check="page.address"]');
  await expect(address.locator('[class*="owner"]')).toHaveCount(0);
  await address.click();
  await expect(page.getByRole('dialog', { name: 'Page address details' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(address.locator('[class*="owner"]')).toHaveCount(1);
  await axeClean(page);
  // The training page's own button routes to the authored action; nothing is submitted anywhere.
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeVisible();
  await page.getByRole('button', { name: /Change the password/ }).first().click();
  await page.getByRole('button', { name: /Keep it to yourself/ }).click();
  await page.getByRole('button', { name: /Sign out of every other session/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText('Feeling embarrassed is normal, and it is what scammers count on. Telling IT fast is what limits the damage.')).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByText(/could happen to anyone/)).toBeVisible();
  await page.getByRole('button', { name: 'Already clicked or paid? See what to do' }).click();
  await expect(page.getByRole('heading', { name: 'If you already…' })).toBeFocused();
  await axeClean(page);
});

for (const vp of [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '375x812', width: 375, height: 812 },
  { name: '320x568', width: 320, height: 568 },
  // 200% zoom of a 1440×900 window = 720×450 CSS px.
  { name: '200% zoom', width: 720, height: 450 },
]) {
  test(`axe clean and no horizontal scroll at ${vp.name}: mail + Check card, browser training page, call, debrief`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const noHScroll = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole('button', { name: 'Start' }).click();
    await page.locator('[data-check="link"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await axeClean(page);
    await noHScroll();
    await page.keyboard.press('Escape');
    await tapTargetsOk(page);
    await page.getByRole('button', { name: /Find the pack/ }).click();
    await axeClean(page);
    await noHScroll();
    await continueToNext(page);
    await page.getByRole('button', { name: /Tap the link and free up space/ }).click();
    await axeClean(page);
    await noHScroll();
    await tapTargetsOk(page);
  });
}

test('keyboard only: skip link, Check from the Details list, tag, act, debrief (shortcuts off)', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Start' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
  // The skip link is the first stop on the page (before the HUD) and moves focus to "Your options".
  const skip = page.getByRole('link', { name: 'Skip to your options' });
  for (let i = 0; i < 6 && !(await skip.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Skip to your options' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#options')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /Details you can check/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab'); // Check mode
  await page.keyboard.press('Tab'); // first row: Sender
  await expect(page.getByRole('button', { name: /^Check Sender/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  // The tag toggle follows the checked item in DOM order and never moves focus.
  const tag = page.getByRole('button', { name: 'Mark as suspicious: Sender' });
  await expect(tag).toBeFocused();
  await page.keyboard.press('Space');
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await expect(tag).toBeFocused();
  await expect(page.getByRole('button', { name: 'Details you can check · 1 checked' })).toBeVisible();
  // Reach an action by keyboard.
  for (let i = 0; i < 30; i++) {
    if (await page.getByRole('button', { name: 'Leave it for later' }).evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: 'Leave it for later' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(debriefHeading(page)).toBeFocused();
  // Wrong tag on a genuine message: shown in layer 2 without the bonus clause (no bonus on genuine).
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByText(/You marked this. It was fine here./)).toBeVisible();
});

test('reload mid-chapter offers Continue and resumes at the next scenario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await expect(debriefHeading(page)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Email from Waymarker mail' })).toBeFocused();
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
