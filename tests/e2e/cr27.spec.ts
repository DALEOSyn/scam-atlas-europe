import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { skipScene } from './scene-helpers.ts';

/**
 * CR-27 (Paris QA): the chapter intro, and the "Jump to your options" bar no longer covering targets
 * (attachments and the Translate toggle at 375/320 px, the bank payee/IBAN at 720×450). Local save only.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = { finished: true, bestStamp: 'bronze', bestRating: 0.5, position: null, run: null };
const seed = (chapters: Record<string, unknown>) => ({
  version: 1,
  settings: { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null },
  chapters,
});

async function open(page: Page, save: unknown, city: string) {
  await page.addInitScript((s) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(s));
  }, save);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: `Play ${city}` }).click();
  // Berlin and Amsterdam open on their Arrival scene (S4) first; order: Arrival → intro → first scenario.
  await skipScene(page, `${city.toLowerCase()}-arrival`);
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: city })).toBeFocused();
  await axeClean(page);
  await intro.getByRole('button', { name: 'Start' }).click();
}

/**
 * No visible button or checkable intersects the jump bar (`only`: just the focused element). Like the
 * sticky HUD, the bar sits over content that the player scrolls under it by hand; what must never happen
 * is a target under it at load or after focus moves to it (scroll padding, WCAG 2.4.11).
 */
async function jumpCoversNothing(page: Page, only?: 'focused') {
  const covered = await page.evaluate((onlyFocused) => {
    const bar = document.querySelector<HTMLElement>('[data-jump]');
    if (!bar || getComputedStyle(bar).visibility === 'hidden') return [];
    const b = bar.getBoundingClientRect();
    const all = onlyFocused ? [document.activeElement as HTMLElement] : [...document.querySelectorAll<HTMLElement>('button, a[href], [data-check], [data-check-row]')];
    return all
      .filter((el) => el !== bar && !bar.contains(el) && el.offsetParent !== null)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const w = Math.min(r.right, b.right) - Math.max(r.left, b.left);
        const h = Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top);
        return w > 0.5 && h > 0.5;
      })
      .map((el) => el.textContent?.trim().slice(0, 40) ?? el.tagName);
  }, only === 'focused');
  expect(covered).toEqual([]);
}

for (const size of [
  { width: 375, height: 812 },
  { width: 320, height: 568 },
]) {
  test(`Berlin 1-1 at ${size.width}×${size.height}: the jump bar sits under the HUD and covers no target (axe clean)`, async ({ page }) => {
    await page.setViewportSize(size);
    await open(page, seed({ home: { ...done, position: 0 } }), 'Berlin');
    await expect(page.getByRole('heading', { name: /^Text message from/ })).toBeFocused();
    await page.evaluate(() => window.scrollTo(0, 0));
    await jumpCoversNothing(page);
    await axeClean(page);
    // Keyboard focus on the Translate toggle and every checkable scrolls them clear of the bar.
    for (const sel of ['button[aria-controls="translation"]', '[data-check]']) {
      const els = page.locator(sel);
      for (let i = 0; i < (await els.count()); i++) {
        await els.nth(i).focus();
        await jumpCoversNothing(page, 'focused');
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const jump = page.getByRole('button', { name: 'Jump to your options' });
    if (await jump.isVisible()) {
      await jump.click();
      await expect(page.locator('#options')).toBeFocused();
    }
  });
}

test('Amsterdam 2-3 bank card at 720×450: payee and IBAN are never under the jump bar (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 720, height: 450 });
  await open(page, seed({ home: { ...done, position: 0 }, berlin: { ...done, position: 1 } }), 'Amsterdam');
  const next = async () => {
    const consequence = page.getByRole('heading', { level: 2, name: 'What happened' }).and(page.locator('#consequence-h'));
    const debrief = page.getByRole('heading', { level: 1, name: /This was (a scam|genuine):/ });
    await expect(consequence.or(debrief)).toBeVisible();
    if (await consequence.isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
    await expect(debrief).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
  };
  await page.getByRole('button', { name: /Save the number and reply/ }).click();
  await next();
  await page.getByRole('button', { name: /Look up Klaverwerk Staffing yourself/ }).click();
  await next();
  await page.getByRole('button', { name: /Pay her in the Larchwick app/ }).click();
  await expect(page.locator('[id^="name-check-result-"]')).toContainText("The name doesn't match this account.", { timeout: 5_000 });
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.isVisible()) await gotIt.click();
  // CR-27 item 5: the result line is the checkable, the payee field is not.
  await expect(page.locator('[id^="name-check-result-"] [data-check="payee.name_check"]')).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await jumpCoversNothing(page);
  await axeClean(page);
  // Focus on the payee-check result, the IBAN and every card action scrolls them clear of the bar.
  for (const sel of ['[id^="name-check-result-"] [data-check]', '[data-check="payee.iban"]', '[id^="bank-options-"] button']) {
    const els = page.locator(sel);
    for (let i = 0; i < (await els.count()); i++) {
      await els.nth(i).focus();
      await jumpCoversNothing(page, 'focused');
    }
  }
});

test('CR-28 (Paris QA r3): Shift+Tab to a bank checkable at 720×450 leaves it fully below the jump bar', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 720, height: 450 });
  await open(page, seed({ home: { ...done, position: 0 }, berlin: { ...done, position: 1 } }), 'Amsterdam');
  const next = async () => {
    const consequence = page.getByRole('heading', { level: 2, name: 'What happened' }).and(page.locator('#consequence-h'));
    const debrief = page.getByRole('heading', { level: 1, name: /This was (a scam|genuine):/ });
    await expect(consequence.or(debrief)).toBeVisible();
    if (await consequence.isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
    await expect(debrief).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
  };
  await page.getByRole('button', { name: /Save the number and reply/ }).click();
  await next();
  await page.getByRole('button', { name: /Look up Klaverwerk Staffing yourself/ }).click();
  await next();
  await page.getByRole('button', { name: /Pay her in the Larchwick app/ }).click();
  await expect(page.locator('[id^="name-check-result-"]')).toContainText("The name doesn't match this account.", { timeout: 5_000 });
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.isVisible()) await gotIt.click();
  // Scroll the result line out of view above (the bar shows), keep focus on a card action below it.
  await page.evaluate(() => {
    const r = document.querySelector('[id^="name-check-result-"]') as HTMLElement;
    window.scrollBy(0, r.getBoundingClientRect().bottom + 4);
    (document.querySelector('[id^="bank-options-"] button') as HTMLElement).focus({ preventScroll: true });
  });
  await expect(page.locator('[data-jump]')).toBeVisible();
  const geometry = () =>
    page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>('[data-jump]');
      const el = document.activeElement as HTMLElement | null;
      if (!bar || !el) return null;
      const shown = getComputedStyle(bar).visibility !== 'hidden';
      return { shown, barBottom: bar.getBoundingClientRect().bottom, top: el.getBoundingClientRect().top, check: el.getAttribute('data-check') };
    });
  let found = false;
  for (let i = 0; i < 10 && !found; i++) {
    await page.keyboard.press('Shift+Tab');
    // Let the focus scroll and the bar's show/hide settle (the bar may appear after the scroll).
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const g = await geometry();
    // Shown or only reserved (it can show at any moment): the focused element is fully below it.
    if (g) expect(g.top, `${g.check ?? 'focus'} top vs jump bar bottom (bar shown: ${g.shown})`).toBeGreaterThanOrEqual(g.barBottom);
    found = g?.check === 'payee.iban';
  }
  expect(found).toBe(true);
});

/** CR-48b: "How stamps work" on the chapter intro, before play: keyboard, axe, no sideways scroll (320 px, 200% zoom). */
for (const size of [
  { width: 320, height: 568, label: '320×568' },
  { width: 640, height: 400, label: '200% zoom (1280×800 at 2×)' },
]) {
  test(`CR-48b: How stamps work on the Berlin intro at ${size.label} opens by keyboard (axe clean)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.addInitScript((s) => {
      if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(s));
    }, seed({ home: { ...done, position: 0 } }));
    await page.goto('/');
    await page.getByRole('button', { name: 'Chapters' }).click();
    await page.getByRole('button', { name: 'Play Berlin' }).click();
    await skipScene(page, 'berlin-arrival');
    const intro = page.locator('[data-chapter-intro]');
    await expect(intro.getByRole('heading', { level: 1, name: 'Berlin' })).toBeFocused();
    const toggle = intro.getByRole('button', { name: 'How stamps work' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#stamps-help-panel')).toBeHidden();
    // Keyboard: Tab reaches Start first, then the way back, then the disclosure.
    await page.keyboard.press('Tab');
    await expect(intro.getByRole('button', { name: 'Start' })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toBeFocused();
    const items = page.locator('#stamps-help-panel li');
    await expect(items).toHaveCount(5);
    await expect(items.nth(3)).toHaveText('Gold still allows one slip (doing what a scam asks). After it, every step you pick to limit the damage must help, and your first step must stop the damage.');
    await items.nth(4).scrollIntoViewIfNeeded();
    await expect(items.nth(4)).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await axeClean(page);
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#stamps-help-panel')).toBeHidden();
  });
}
