import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HARNESS_URL } from '../../playwright.config.ts';

/**
 * CR-30 … CR-35 (Madrid, Warsaw): the fixture scenarios in tests/fixtures/scenarios played in the real
 * ScenarioView through the e2e harness (`?view=scenario&id=…`, slot 4, timers off). Keyboard only, axe
 * clean, tap targets ≥ 44 px, no horizontal overflow at 320 px.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

async function open(page: Page, id: string, extra = '') {
  await page.goto(`${HARNESS_URL}/?view=scenario&id=${id}${extra}`);
  await expect(page.locator('#device-heading')).toBeVisible();
}

/** Press a button by keyboard: focus it, then Enter. */
async function press(page: Page, name: string | RegExp) {
  const b = page.getByRole('button', { name, exact: typeof name === 'string' });
  await b.first().focus();
  await page.keyboard.press('Enter');
}

async function done(page: Page): Promise<{ stars: number; points: number; beats: number[] }> {
  for (let i = 0; i < 6; i++) {
    const attr = await page.locator('body').getAttribute('data-done');
    if (attr) return JSON.parse(attr) as { stars: number; points: number; beats: number[] };
    const cont = page.getByRole('button', { name: /^(Continue|Done)$/ });
    if (await cont.count()) await cont.first().click();
    else await page.waitForTimeout(200);
  }
  throw new Error('scenario did not finish');
}

async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(1);
}

async function minTarget(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
}

for (const width of [320, 1280]) {
  test(`CR-31/31(b) at ${width}px: on-call bar over the bank app, Hang up focuses its own options, ★★ (10 points)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr31-reserve-call');
    await press(page, 'Answer');
    await press(page, 'Open the app and follow their steps');
    const bar = page.locator('[data-on-call]');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('aria-label', 'On a call with Larchwick Bank');
    await expect(bar).toContainText('On a call · Larchwick Bank');
    await expect(bar.locator('[data-call-time]')).toHaveText(/ · \d\d:\d\d$/);
    // The caller's first line (beat-bound, at 6 s) arrives inside the bar, not as a notification.
    await expect(bar.locator('[data-call-line]').first()).toContainText('Type the name exactly: Larchwick Reserva.', { timeout: 15_000 });
    await minTarget(page, '[data-hang-up]');
    await noOverflow(page);
    await axeClean(page);
    await page.locator('[data-hang-up]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-action="hang_up_call_card"]')).toBeFocused();
    await page.keyboard.press('Enter');
    const r = await done(page);
    expect(r).toMatchObject({ stars: 2, points: 10 });
  });
}

test('CR-31: reduced motion: the bar is static (no animation) and still axe clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'fx-cr31-reserve-call');
  await press(page, 'Answer');
  await press(page, 'Open the app and follow their steps');
  const anim = await page.locator('[data-on-call]').evaluate((el) => [el, ...el.querySelectorAll('*')].map((x) => getComputedStyle(x).animationName).filter((n) => n !== 'none'));
  expect(anim).toEqual([]);
  await axeClean(page);
});

for (const width of [320, 1280]) {
  test(`CR-33 at ${width}px: marketplace notice with the listing card, Check by keyboard, axe clean`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr33-market-sale');
    await expect(page.locator('#device-heading')).toHaveText('Swaploft: notice');
    const listing = page.locator('[data-listing] [data-check="reference"]');
    await expect(listing).toContainText('Rucksack');
    await expect(listing).toContainText('€35.00');
    await expect(page.locator('[data-notice]')).toContainText('Swaploft');
    await minTarget(page, '[data-listing] [data-check="reference"]');
    await noOverflow(page);
    await axeClean(page);
    await listing.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Your own listing, as you put it up.').filter({ visible: true }).first()).toBeVisible();
    await axeClean(page);
  });
}

test('CR-35 + CR-33 buyer chat: "Move the chat to Kettle" ends beat 1 at ★★, beat 2 arrives', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open(page, 'fx-cr35-boss-off-platform');
  await expect(page.locator('#device-heading')).toHaveText('Swaploft: chat with user 3150');
  await noOverflow(page);
  await axeClean(page);
  await press(page, 'Move the chat to Kettle');
  await press(page, 'Continue');
  await expect(page.locator('#device-heading')).toHaveText(/Chat message from \+48/);
  await press(page, 'Open your Swaploft sales yourself');
  const r = await done(page);
  expect(r.beats).toEqual([2, 3]);
});

for (const width of [320, 1280]) {
  test(`CR-34 at ${width}px: the code confirmation, Decline keeps ★ (5 points)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr34-code-confirm');
    await press(page, 'Make a code and send it to her');
    const card = page.locator('[data-code-confirm]');
    await expect(card).toContainText('Confirm payment');
    await expect(card).toContainText('€249.00');
    await expect(card.locator('[data-check="payee.name"]')).toHaveText('to TREMOLIK');
    await expect(page.locator('#device-heading')).toHaveText('Banking app: confirm payment to TREMOLIK');
    await noOverflow(page);
    await axeClean(page);
    await press(page, 'Decline');
    const r = await done(page);
    expect(r).toMatchObject({ stars: 1, points: 5 });
  });
}

test('CR-32: damage control for Mateus names him, and his feedback is in his voice', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, 'fx-cr32-friend-drill');
  await press(page, 'Talk Mateus through it, step by step');
  await press(page, 'Continue');
  await expect(page.locator('[data-damage-prompt]')).toHaveText('Pick the step Mateus should take first, then 2 more.');
  await noOverflow(page);
  await axeClean(page);
  for (const step of ['keep_quiet', 'call_bank_stop_payment', 'keep_evidence']) {
    await page.locator(`[data-step="${step}"]`).focus();
    await page.keyboard.press('Enter');
  }
  await press(page, 'Done');
  await expect(page.locator('[data-voice]')).toHaveText(/^Mateus: Feeling embarrassed is normal/);
  await axeClean(page);
});
