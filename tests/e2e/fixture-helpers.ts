/**
 * Shared steps for the engine-fixture e2e specs (CR-30 … CR-39): the fixture scenarios in
 * tests/fixtures/scenarios, played in the real ScenarioView through the harness (`?view=scenario&id=…`,
 * slot 4, timers off). Keyboard presses wait for focus to settle; results are polled, never read once.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HARNESS_URL } from '../../playwright.config.ts';

export const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
export async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

export async function open(page: Page, id: string, extra = '') {
  await page.goto(`${HARNESS_URL}/?view=scenario&id=${id}${extra}`);
  await expect(page.locator('#device-heading')).toBeVisible();
}

/**
 * Wait until focus has settled: the same element is focused for 3 animation frames in a row. ScenarioView
 * moves focus to the new screen's own target (device heading, "What now?", consequence heading) in a
 * post-paint effect keyed on phase and beat (UI_SPEC §10.3); a focus() made before that effect runs is
 * taken back (sceptic round 1: the Enter then hit the heading).
 */
export async function settle(page: Page) {
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
export async function pressOn(page: Page, el: Locator, what: string) {
  await expect(el, `${what} on screen`).toBeVisible();
  await settle(page);
  await expect(async () => {
    await el.focus();
    await settle(page);
    await expect(el, `${what} keeps focus`).toBeFocused({ timeout: 250 });
  }).toPass({ timeout: 10_000 });
  await page.keyboard.press('Enter');
}

export async function press(page: Page, name: string | RegExp) {
  await pressOn(page, page.getByRole('button', { name, exact: typeof name === 'string' }).first(), `button "${String(name)}"`);
}

/** Continue through the closing consequence step(s) until the harness records the result. */
export async function done(page: Page): Promise<{ stars: number; points: number; beats: number[] }> {
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

export async function noOverflow(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(1);
}

/** Every visible match is at least 44 × 44 px (UI_SPEC: --tap-min); at least one must match. */
export async function minTarget(page: Page, selector: string) {
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


/** Record everything the polite live region says (QA-2): the region is overwritten, so watch it. */
export async function recordPolite(page: Page) {
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
export const said = (page: Page) => page.evaluate(() => (window as unknown as { __said: string[] }).__said);
