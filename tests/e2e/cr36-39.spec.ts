import { expect, test, type Page } from '@playwright/test';
import { axeClean, done, minTarget, noOverflow, open, press, pressOn, recordPolite, said } from './fixture-helpers.ts';

/**
 * CR-36 … CR-39 (Rome, Lisbon, Dublin, Stockholm): the fixture scenarios in tests/fixtures/scenarios played
 * in the real ScenarioView through the e2e harness (`?view=scenario&id=…`, slot 4, timers off). Keyboard
 * only, axe clean, tap targets ≥ 44 px, no horizontal overflow at 320 px. Red Lines: never an audio
 * element; QR codes are drawn (no link, no image to scan); the regulator view has no input of any kind.
 */

/** Check a detail by keyboard, wait for its authored reveal, then close the Check card with Escape. */
async function checkDetail(page: Page, target: string, reveal: string | RegExp) {
  await pressOn(page, page.locator(`[data-check="${target}"]`).first(), `the ${target} checkable`);
  await expect(page.getByText(reveal).filter({ visible: true }).first(), `${target} reveal`).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-check-card]').filter({ visible: true }), 'the Check card closes').toHaveCount(0);
}

async function noAudio(page: Page) {
  expect(await page.locator('audio').count(), 'no audio element (CR-36)').toBe(0);
}

for (const width of [320, 1280]) {
  test(`CR-36 at ${width}px: "Sounds like Grandpa Teo" once answered, neutral Voice check, no audio, ★★★ by calling back`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr36-voice-call');
    await expect(page.locator('[data-voice-label]')).toHaveCount(0);
    await press(page, 'Answer');
    await expect(page.locator('[data-voice-label]')).toHaveText('Sounds like Grandpa Teo');
    await noAudio(page);
    await checkDetail(page, 'voice', 'Sounds like Grandpa Teo. A voice can be copied from a short recording, so it can\'t prove anything either way.');
    await minTarget(page, '[data-action]');
    await noOverflow(page);
    await axeClean(page);
    await press(page, "Hang up and call Teo's saved number");
    expect(await done(page)).toMatchObject({ stars: 3 });
    await noAudio(page);
  });

  test(`CR-37 at ${width}px: a sticker over the printed code, "How the code is attached" after the destination, ★★★ by opening the app`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr37-qr-sticker');
    await expect(page.locator('[data-mount="sticker"]')).toBeVisible();
    await expect(page.locator('[data-qr-mount]')).toHaveText('How the code is attached: Sticker stuck over the printed code');
    await expect(page.locator('[data-qr="camera"] [role="img"]')).toHaveAttribute('aria-label', /Sticker stuck over the printed code\.$/);
    // Reading order: destination, then mount.
    const order = await page.locator('[data-qr="camera"] [data-check]').evaluateAll((els) => els.map((e) => e.getAttribute('data-check')));
    expect(order).toEqual(['qr.destination', 'qr.mount']);
    await expect(page.locator('[data-qr] a, [data-qr] img')).toHaveCount(0);
    await checkDetail(page, 'qr.mount', /A sticker stuck over the locker's printed code/);
    await noOverflow(page);
    await axeClean(page);
    await press(page, 'Open the Trundle app yourself');
    expect(await done(page)).toMatchObject({ stars: 3 });
  });
}

test('CR-37: reduced motion: the sticker does not move or animate, and stays axe clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'fx-cr37-qr-sticker');
  const sticker = page.locator('[data-mount="sticker"]');
  await expect(sticker).toBeVisible();
  expect(await sticker.evaluate((el) => [getComputedStyle(el).animationName, getComputedStyle(el).transform])).toEqual(['none', 'none']);
  await axeClean(page);
});

for (const width of [320, 1280]) {
  test(`CR-38 at ${width}px: "Look it up yourself" shows the result card: not on the register, warning list clean, don't pay`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr38-register-check');
    await press(page, 'Look Quorvex up on the Fairmeasure register yourself');
    const card = page.locator('[data-register-result="not_listed"]');
    await expect(card).toBeVisible();
    await expect(card.locator('li')).toHaveText(['Quorvex Wealth: not on the register.', 'Warning list: no warning found.', "Not on the register means don't pay, even when the warning list is clean."]);
    await noOverflow(page);
    await axeClean(page);
    expect(await done(page)).toMatchObject({ stars: 3 });
  });
}

test('CR-38: an authorised firm shows the register\'s own address and masked phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, 'fx-cr38-register-authorised');
  await press(page, 'Look Ellisfen up on the Fairmeasure register yourself');
  const card = page.locator('[data-register-result="authorised"]');
  await expect(card.locator('li')).toHaveText([
    'Ellisfen Invest: on the register of authorised firms.',
    "Contact it only on the register's own details:",
    'Address: 3 Quillon Street, Dublin',
    'Phone: +353 1 ••• ••42',
  ]);
  await axeClean(page);
});

for (const width of [320, 1280]) {
  test(`CR-38 at ${width}px: the Fairmeasure view from the menu: two read-only tabs, keyboard, Escape returns focus`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr36-voice-call', '&coach=1');
    const menu = page.locator('[data-hud="menu"]');
    await pressOn(page, menu, 'Menu');
    await pressOn(page, page.locator('[data-menu="register"]'), 'Fairmeasure register');
    const dialog = page.locator('[data-register]');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#register-h')).toBeFocused();
    await expect(dialog.locator('input, textarea, select, form, [contenteditable]')).toHaveCount(0);
    // One-time coach mark on first use (GDD §28.5).
    await expect(dialog.getByText('Two lists: firms allowed to sell investments, and firms the regulator warns about.')).toBeVisible();
    await expect(dialog.locator('[data-register-panel="register"]')).toContainText('Ellisfen Invest');
    await expect(dialog.locator('[data-register-panel="register"]')).not.toContainText('Brindlecove');
    await minTarget(page, '[data-register] [role="tab"]');
    await minTarget(page, '[data-register-close]');
    await noOverflow(page);
    await axeClean(page);
    await pressOn(page, dialog.locator('[data-tab="register"]'), 'the register tab');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-tab="warnings"]')).toBeFocused();
    await expect(dialog.locator('[data-tab="warnings"]')).toHaveAttribute('aria-selected', 'true');
    await expect(dialog.locator('[data-register-panel="warnings"]')).toContainText('Brindlecove Bonds');
    await expect(dialog.locator('[data-register-panel="warnings"]')).toContainText('A name missing from this list proves nothing');
    await axeClean(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(menu).toBeFocused();
  });
}

for (const width of [320, 1280]) {
  test(`CR-39(a) at ${width}px: on-call bar over the Gatewren prompt, caller line inside, Hang up focuses its own options, ★★`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await recordPolite(page);
    await open(page, 'fx-cr39a-call-auth');
    await press(page, 'Answer');
    await press(page, 'Open Gatewren as they ask');
    await expect(page.locator('#device-heading')).toHaveText('Sign-in app: request from Larchwick internet bank');
    const bar = page.locator('[data-on-call]');
    await expect(bar).toHaveAttribute('aria-label', 'On a call with Larchwick Bank');
    await expect(bar.locator('[data-call-time]')).toHaveText(/ · \d\d:\d\d$/);
    await expect(bar.locator('[data-call-line]').first()).toContainText("Just tap Approve, then it's blocked.", { timeout: 15_000 });
    await expect.poll(() => said(page), { message: 'the caller line is announced as a call line', timeout: 5_000 }).toContain("Caller: Just tap Approve, then it's blocked.");
    await expect(page.locator('[data-oncall-hint]')).toHaveText('Choose how to end the call:');
    await minTarget(page, '[data-hang-up]');
    await minTarget(page, '[data-action]');
    await noOverflow(page);
    await axeClean(page);
    await pressOn(page, page.locator('[data-hang-up]'), 'Hang up');
    await expect(page.locator('[data-action="deny_call_card"]')).toBeFocused();
    await page.keyboard.press('Enter');
    expect(await done(page)).toMatchObject({ stars: 2, points: 10 });
  });

  test(`CR-39(b) at ${width}px: a QR code in a chat, destination chip checkable after the body, scanning opens the prompt`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr39b-chat-qr');
    const qr = page.locator('[data-qr="chat"]');
    await expect(qr.locator('[role="img"]')).toHaveAttribute('aria-label', 'A QR code in the message. It opens gatewren.example.');
    await expect(qr).toContainText('QR code · opens gatewren.example');
    await expect(qr.locator('a, img')).toHaveCount(0);
    await checkDetail(page, 'qr.destination', /a real Gatewren login\. Scanning it logs someone in as you/);
    await noOverflow(page);
    await axeClean(page);
    await press(page, 'Scan it with Gatewren');
    await expect(page.locator('#device-heading')).toHaveText(/^Sign-in app: /);
    await expect(page.locator('[data-on-call]')).toHaveCount(0);
    await press(page, 'Deny and open Swaploft yourself');
    expect(await done(page)).toMatchObject({ stars: 2 });
  });
}
