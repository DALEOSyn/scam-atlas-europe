import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * T-4.2: "Where to report and get help" with per-country cards (WHERE_TO_REPORT §3c) in the real build. Opens the
 * help list from a story scene, switches country, checks the crisis row (last, on its own), the safe links and that
 * the choice is kept in the existing local save. The game makes no request to any other origin (links are only
 * there to be clicked by the player; none is clicked here). Saves are seeded locally only (Red Line 7).
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const CRISIS = 'Thinking about ending your life, or worried about someone?';
const SAVE_KEY = 'scam-atlas-europe:save';

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = { finished: true, bestStamp: 'bronze', bestRating: 0.5, position: null, run: null };
const settings = { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null };

async function seed(page: Page, save: unknown) {
  await page.addInitScript(
    ({ key, s }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(s));
    },
    { key: SAVE_KEY, s: save },
  );
}

function watchForeign(page: Page, origin: string): string[] {
  const foreign: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol !== 'data:' && url.origin !== origin) foreign.push(req.url());
  });
  return foreign;
}

async function groupOrder(page: Page): Promise<(string | null)[]> {
  return page.locator('[data-help-group]').evaluateAll((els) => els.map((e) => e.getAttribute('data-help-group')));
}

test('help list: default EU, switch to Sweden, crisis row last; choice kept in the save; no outbound requests', async ({ page, baseURL }) => {
  const foreign = watchForeign(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  await seed(page, { version: 1, settings, chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 } } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Play Amsterdam' }).click();
  const scene = page.locator('main[data-scene-id="amsterdam-arrival"]');
  await scene.getByRole('button', { name: 'Where to get help' }).click();
  await expect(scene.getByRole('heading', { level: 1, name: 'Where to report and get help' })).toBeFocused();

  const country = scene.getByRole('combobox', { name: 'Your country' });
  await expect(country).toHaveValue('');
  await expect(country.locator('option:checked')).toHaveText('EU / other country');
  expect(await groupOrder(page)).toEqual(['bank', 'report', 'support', 'child']);
  await expect(scene.locator('[data-help-group="crisis"]')).toHaveCount(0);
  await expect(scene.locator('[data-help-row]').first().locator('[data-help-checked]')).toHaveText(/^Checked on \d{1,2} \w+ 2026$/);
  await axeClean(page);

  await country.selectOption({ label: 'Sweden' });
  await expect(scene.locator('[data-help-cards]')).toHaveAttribute('data-help-country', 'SE');
  expect(await groupOrder(page)).toEqual(['bank', 'report', 'support', 'child', 'crisis']);
  const crisis = scene.locator('[data-help-group="crisis"]');
  await expect(crisis.getByRole('heading', { level: 2 })).toHaveText(CRISIS);
  await expect(crisis.locator('[data-help-row]')).toHaveCount(1);
  await expect(crisis).toContainText('90101');
  await expect(crisis).toContainText('In danger now? Call 112.');
  // The crisis section is the last thing in the cards.
  expect(await scene.locator('[data-help-cards] > :last-child').getAttribute('data-help-group')).toBe('crisis');
  await expect(scene.locator('[data-help-checked]')).toHaveCount(await scene.locator('[data-help-row]').count());
  await axeClean(page);

  // Links: new tab, rel noopener noreferrer, no query string (EU entries carry the links in this data).
  await country.selectOption({ label: 'EU / other country' });
  const links = scene.locator('[data-help-cards] a');
  expect(await links.count()).toBeGreaterThan(0);
  for (const a of await links.all()) {
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(await a.getAttribute('href')).toMatch(/^https:\/\/[^?#]+$/);
  }
  await country.selectOption({ label: 'Sweden' });

  // Kept in the existing save only (settings.helpCountry); no new localStorage key.
  const stored = await page.evaluate(() => Object.keys(localStorage));
  expect(stored.filter((k) => !k.endsWith(':probe'))).toEqual([SAVE_KEY]);
  const save = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}') as { settings?: { helpCountry?: unknown } }, SAVE_KEY);
  expect(save.settings?.helpCountry).toBe('SE');

  // Back to the story and in again: still Sweden.
  await scene.getByRole('button', { name: 'Back to the story' }).click();
  await scene.getByRole('button', { name: 'Where to get help' }).click();
  await expect(scene.getByRole('combobox', { name: 'Your country' })).toHaveValue('SE');

  expect(foreign).toEqual([]);
});

test('sensitive scene ("Need to talk?"): support, young people and crisis first, from the saved country', async ({ page, baseURL }) => {
  const foreign = watchForeign(page, new URL(baseURL ?? 'http://127.0.0.1:4173').origin);
  await page.setViewportSize({ width: 320, height: 568 });
  await seed(page, {
    version: 1,
    settings: { ...settings, helpCountry: 'ES' },
    chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 }, amsterdam: { ...done, position: 2 } },
    story: { postcards: ['home', 'berlin', 'amsterdam'], flips: [], seen: ['amsterdam-arrival', 'amsterdam-sanne-story'] },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Story scenes: Amsterdam' }).click();
  await page.getByRole('button', { name: "Watch: Sanne's story" }).click();
  const scene = page.locator('main[data-scene-id="amsterdam-sanne-story"]');
  await scene.getByRole('button', { name: 'Need to talk? Where to get help' }).click();
  await expect(scene.getByRole('combobox', { name: 'Your country' })).toHaveValue('ES');
  expect(await groupOrder(page)).toEqual(['support', 'child', 'crisis', 'bank', 'report']);
  await expect(scene.locator('[data-help-group="crisis"]').getByRole('heading', { level: 2 })).toHaveText(CRISIS);
  await expect(scene.locator('[data-help-group="crisis"]')).toContainText('024');
  await axeClean(page);
  expect(foreign).toEqual([]);
});
