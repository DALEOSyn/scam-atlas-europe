import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HARNESS_URL } from '../../playwright.config.ts';

/**
 * CR-45 (Madrid QA engine fixes): the fixture scenarios tests/fixtures/scenarios/cr45-*.yaml in the real
 * ScenarioView through the e2e harness (`?view=scenario&id=…`, slot 4, timers off). Keyboard only, axe clean.
 * Helpers as in cr30-35.spec.ts.
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
  test(`CR-45 at ${width}px: a dialled call shows "Calling…", then connects; no Answer or Decline; announced as "Calling …"`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await recordPolite(page);
    await open(page, 'fx-cr45-dialled-call');
    await press(page, 'Call the number in the text');
    await expect(page.locator('#device-heading')).toHaveText('Call to 9•• ••• •14');
    await expect(page.locator('[data-call-state]')).toHaveText('Calling…');
    await expect(page.locator('[data-dialled-detail]')).toHaveText('The number from the text');
    await expect(page.getByRole('button', { name: 'Answer', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Decline', exact: true })).toHaveCount(0);
    await expect(page.getByText('Incoming call')).toHaveCount(0);
    await axeClean(page);
    await expect(page.locator('[data-call-state]')).toHaveText('Connected', { timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Hang up', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decline', exact: true })).toHaveCount(0);
    await expect.poll(() => said(page)).toContain('Calling 9 … 14, masked number.');
    expect(await said(page)).not.toContain('New message.');
    await noOverflow(page);
    await axeClean(page);
    await press(page, 'Hang up');
    await press(page, 'Call the number on your card');
    // The engage (calling the text's number) caps the beat at ★★ (10 points).
    expect(await done(page)).toMatchObject({ stars: 2, points: 10 });
  });

  test(`CR-45 at ${width}px: a personal account's bank header says "Payments", not "Business account"; Spanish lines carry lang`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr45-personal-account');
    // The interrupt (at 5 s): its reply label marks the Spanish words.
    const reply = page.locator('[data-interrupt-action="reply_coffee"]');
    await expect(reply).toBeVisible({ timeout: 15_000 });
    await expect(reply.locator('[lang="es"]')).toHaveText('¡sí, gracias!');
    await pressOn(page, reply, 'reply');
    await press(page, 'Pay her in the Larchwick app');
    await expect(page.getByText('From account')).toBeVisible();
    await expect(page.getByText('Payments', { exact: true })).toBeVisible();
    await expect(page.getByText('Business account')).toHaveCount(0);
    await noOverflow(page);
    await axeClean(page);
    const send = page.locator('[data-action="send_twelve"]');
    await expect(send).toBeVisible({ timeout: 5000 });
    await pressOn(page, send, 'Send €12');
    await expect(page.locator('#consequence-h')).toBeVisible();
    await expect(page.locator('[data-lang-span][lang="es"]', { hasText: '¡Genial, gracias!' })).toBeVisible();
    await axeClean(page);
    expect(await done(page)).toMatchObject({ stars: 3, points: 15 });
  });
}
