import { expect, test, type Locator, type Page } from '@playwright/test';
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

/**
 * Wait until focus has settled: the same element is focused for 3 animation frames in a row. ScenarioView
 * moves focus to the new screen's own target (device heading, "What now?", consequence heading) in a
 * post-paint effect keyed on phase and beat (UI_SPEC §10.3); a focus() made before that effect runs is
 * taken back (sceptic round 1: the Enter then hit the heading).
 */
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last: Element | null = null;
        let same = 0;
        const tick = () => {
          const now = document.activeElement;
          same = now === last ? same + 1 : 0;
          last = now;
          if (same >= 3) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/** Press an element by keyboard: once focus has settled, focus it, check it kept focus, then Enter. */
async function pressOn(page: Page, el: Locator, what: string) {
  await expect(el, `${what} on screen`).toBeVisible();
  await settle(page);
  await expect(async () => {
    await el.focus();
    await settle(page);
    await expect(el, `${what} keeps focus`).toBeFocused({ timeout: 250 });
  }).toPass({ timeout: 10_000 });
  await page.keyboard.press('Enter');
}

async function press(page: Page, name: string | RegExp) {
  await pressOn(page, page.getByRole('button', { name, exact: typeof name === 'string' }).first(), `button "${String(name)}"`);
}

/** Continue through the closing consequence step(s) until the harness records the result. */
async function done(page: Page): Promise<{ stars: number; points: number; beats: number[] }> {
  const body = page.locator('body');
  await expect
    .poll(
      async () => {
        const attr = await body.getAttribute('data-done');
        if (attr) return attr;
        const cont = page.getByRole('button', { name: /^(Continue|Done)$/ });
        if (await cont.first().isVisible()) await cont.first().click();
        return null;
      },
      { message: 'the scenario reaches its end (body[data-done])', timeout: 30_000, intervals: [250] },
    )
    .not.toBeNull();
  return JSON.parse((await body.getAttribute('data-done')) ?? '{}') as { stars: number; points: number; beats: number[] };
}

async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(1);
}

/** Every visible match is at least 44 × 44 px (UI_SPEC: --tap-min); at least one must match. */
async function minTarget(page: Page, selector: string) {
  const all = page.locator(selector);
  const n = await all.count();
  expect(n, `${selector}: at least one target`).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const el = all.nth(i);
    if (!(await el.isVisible())) continue;
    const box = await el.boundingBox();
    const what = `${selector} #${i} "${((await el.textContent()) ?? '').trim().slice(0, 40)}"`;
    expect(box?.height ?? 0, `${what} height`).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0, `${what} width`).toBeGreaterThanOrEqual(44);
  }
}

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

/** Record everything the polite live region says (QA-2): the region is overwritten, so watch it. */
async function recordPolite(page: Page) {
  await page.addInitScript(() => {
    const said: string[] = [];
    (window as unknown as { __said: string[] }).__said = said;
    const watch = () => {
      const el = document.getElementById('announcer-polite');
      if (!el) return void requestAnimationFrame(watch);
      new MutationObserver(() => {
        const text = (el.textContent ?? '').trim();
        if (text && said[said.length - 1] !== text) said.push(text);
      }).observe(el, { childList: true, subtree: true, characterData: true });
    };
    watch();
  });
}
const said = (page: Page) => page.evaluate(() => (window as unknown as { __said: string[] }).__said);

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

test('CR-35 + CR-33 buyer chat: "Move the chat to Kettle" ends beat 1 at ★★, beat 2 arrives', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open(page, 'fx-cr35-boss-off-platform');
  await expect(page.locator('#device-heading')).toHaveText('Swaploft: chat with user 3150');
  await minTarget(page, '[data-action]');
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
