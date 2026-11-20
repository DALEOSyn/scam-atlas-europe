import { expect, test, type Page } from '@playwright/test';
import { axeClean, done, minTarget, noOverflow, open, press, pressOn, recordPolite, said } from './fixture-helpers.ts';

/**
 * CR-30 … CR-35 (Madrid, Warsaw): the fixture scenarios in tests/fixtures/scenarios played in the real
 * ScenarioView through the e2e harness (`?view=scenario&id=…`, slot 4, timers off). Keyboard only, axe
 * clean, tap targets ≥ 44 px, no horizontal overflow at 320 px.
 */

/** Punctuation after a highlight sits on the line where the highlight ends (psych nit, CR-33 notice). */
async function punctuationStays(page: Page, scope: string) {
  const bad = await page.locator(scope).evaluate((root) =>
    [...root.querySelectorAll('[data-trail]')].flatMap((trail) => {
      const box = trail.closest('[data-check]');
      const text = box?.firstChild;
      if (!box || !text || text.nodeType !== 3 || !text.textContent) return [];
      const r = document.createRange();
      r.setStart(text, text.textContent.length - 1);
      r.setEnd(text, text.textContent.length);
      const last = r.getBoundingClientRect();
      const t = trail.getBoundingClientRect();
      return Math.abs(t.top - last.top) > 4 || t.left < last.right - 2 ? [`${text.textContent.slice(-20)}${trail.textContent}`] : [];
    }),
  );
  expect(bad, 'punctuation on its own line').toEqual([]);
}

for (const width of [320, 1280]) {
  test(`CR-31/31(b) at ${width}px: on-call bar over the bank app, Hang up focuses its own options, ★★ (10 points)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await recordPolite(page);
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
    // QA-2 (WCAG 4.1.3): read as a call line at once, never as "N new messages".
    await expect.poll(() => said(page), { message: 'the caller line is announced', timeout: 5_000 }).toContain('Caller: Type the name exactly: Larchwick Reserva.');
    expect((await said(page)).filter((x) => /new messages/.test(x))).toEqual([]);
    // QA should-fix 4: the tray says the options end the call, and labels the list.
    await expect(page.locator('[data-oncall-hint]')).toHaveText('Choose how to end the call:');
    await expect(page.locator('ul[aria-labelledby^="oncall-choose"]')).toBeVisible();
    await minTarget(page, '[data-hang-up]');
    await noOverflow(page);
    await axeClean(page);
    await pressOn(page, page.locator('[data-hang-up]'), 'Hang up');
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
    // The app's header stays English UI text; only the notice body carries lang="pl" (QA r2 nit).
    await expect(page.locator('[data-notice] > [lang="pl"]')).toContainText('Sprzedane!');
    expect(await page.locator('[data-notice] [lang] [data-check="sender.detail"]').count()).toBe(0);
    await minTarget(page, '[data-listing] [data-check="reference"]');
    await minTarget(page, '[data-action]');
    await punctuationStays(page, '[data-notice]');
    await noOverflow(page);
    await axeClean(page);
    await pressOn(page, listing, 'the listing card');
    await expect(page.getByText('Your own listing, as you put it up.').filter({ visible: true }).first()).toBeVisible();
    await axeClean(page);
  });
}

test('CR-35 + CR-33 buyer chat: "Move the chat to Brewnook" ends beat 1 at ★★, beat 2 arrives', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open(page, 'fx-cr35-boss-off-platform');
  await expect(page.locator('#device-heading')).toHaveText('Swaploft: chat with user 3150');
  await minTarget(page, '[data-action]');
  await noOverflow(page);
  await axeClean(page);
  await press(page, 'Move the chat to Brewnook');
  await press(page, 'Continue');
  await expect(page.locator('#device-heading')).toHaveText(/Chat message from \+48/);
  await press(page, 'Open your Swaploft sales yourself');
  const r = await done(page);
  expect(r.beats).toEqual([2, 3]);
});

for (const width of [320, 1280]) {
  test(`CR-34 at ${width}px: the code confirmation, Decline scores ★★ (10 points, R18)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr34-code-confirm');
    await press(page, 'Make a code and send it to her');
    const card = page.locator('[data-code-confirm]');
    await expect(card).toContainText('Confirm payment');
    await expect(card).toContainText('€249.00');
    await expect(card.locator('[data-check="payee.name"]')).toHaveText('to TREMOLIK');
    await expect(card.locator('[data-code-used]')).toHaveText('Payment code used');
    await expect(page.locator('#device-heading')).toHaveText('Banking app: confirm payment to TREMOLIK');
    await expect(page.locator('[data-action]')).toHaveCount(3);
    await minTarget(page, '[data-action]');
    await noOverflow(page);
    await axeClean(page);
    await press(page, 'Decline');
    const r = await done(page);
    expect(r).toMatchObject({ stars: 2, points: 10 });
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
    await pressOn(page, page.locator(`[data-step="${step}"]`), `step ${step}`);
  }
  await press(page, 'Done');
  await expect(page.locator('[data-voice]')).toHaveText(/^Mateus: Feeling embarrassed is normal/);
  await axeClean(page);
});
