import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { playScene, readAll } from './scene-helpers.ts';

/**
 * S4 story scenes in the real build (T-S4b): the Amsterdam arrival before 2-1, and the sensitive local
 * problem ("Sanne's story") through replay, which opens on the chapter's content note (once per replay session, CR-28). Saves are
 * seeded locally only (Red Line 7).
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = { finished: true, bestStamp: 'bronze', bestRating: 0.5, position: null, run: null };
const settings = { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null };

async function seed(page: Page, save: unknown) {
  await page.addInitScript((s) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(s));
  }, save);
}

test('Amsterdam arrival plays before 2-1: Sanne, the Dutch greeting with its translation, Mateus at breakfast', async ({ page }) => {
  await seed(page, { version: 1, settings, chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 } } });
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Play Amsterdam' }).click();
  const scene = page.locator('main[data-scene-id="amsterdam-arrival"]');
  await expect(scene.getByRole('heading', { level: 1 })).toContainText('Amsterdam · Arrival');
  // Not sensitive: no content note before it, and the plain help label.
  await expect(page.getByText('Before this story scene')).toHaveCount(0);
  await expect(scene.getByRole('button', { name: 'Where to get help' })).toBeVisible();
  await expect(scene.locator('span[lang="nl"]')).toHaveText('Welkom!');
  await readAll(scene);
  await expect(scene.getByText('Next morning, at breakfast.')).toBeVisible();
  await axeClean(page);
  await scene.getByRole('button', { name: 'Continue' }).click();
  // CR-27: the chapter intro comes after the Arrival scene, then the first scenario.
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Amsterdam' })).toBeFocused();
  await intro.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('heading', { name: /Teo/ }).first()).toBeVisible();
});

test("Sanne's story (sensitive): replay opens on the content note, ends relieved, help says Need to talk", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await seed(page, {
    version: 1,
    settings,
    chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 }, amsterdam: { ...done, position: 2 } },
    story: { postcards: ['home', 'berlin', 'amsterdam'], flips: [], seen: ['amsterdam-arrival', 'amsterdam-sanne-story'] },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Story scenes: Amsterdam' }).click();
  await page.getByRole('button', { name: "Watch: Sanne's story" }).click();

  const scene = page.locator('main[data-scene-id="amsterdam-sanne-story"]');
  await expect(scene.getByRole('heading', { level: 1, name: 'Before this story scene' })).toBeFocused();
  await expect(scene.locator('[data-content-note]')).toHaveText('This chapter includes a family-emergency story. Everyone ends up safe. You can pause or skip any story scene.');
  await expect(scene.getByRole('button', { name: 'Need to talk? Where to get help' })).toBeVisible();
  await axeClean(page);
  await scene.getByRole('button', { name: 'Show the scene' }).click();
  await readAll(scene);
  await expect(scene.getByText('this is on them, not you.', { exact: false })).toBeVisible();
  await expect(scene.getByText('On them, not me. Okay. I needed to hear that.')).toBeVisible();
  await axeClean(page);
  // The sticky footer keeps Continue in view on a small phone.
  await expect(scene.getByRole('button', { name: 'Continue' })).toBeInViewport();
  await scene.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: "Watch: Sanne's story" })).toBeFocused();
});

for (const { city, id, first } of [
  { city: 'Madrid', id: 'madrid-arrival', first: "Madrid. Your host's spare room" },
  { city: 'Warsaw', id: 'warsaw-arrival', first: 'Everything must go, except the cello.' },
]) {
  test(`${city} arrival (T-S4e) plays before the chapter intro and its pinned card; art loads, axe clean`, async ({ page }) => {
    await seed(page, { version: 1, settings, chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 } } });
    await page.goto('/');
    await page.getByRole('button', { name: 'Chapters' }).click();
    await page.getByRole('button', { name: `Play ${city}` }).click();
    const scene = page.locator(`main[data-scene-id="${id}"]`);
    await expect(scene.getByRole('heading', { level: 1 })).toContainText(`${city} · Arrival`);
    await expect(page.getByText('Before this story scene')).toHaveCount(0);
    await expect(scene.getByText(first, { exact: false })).toBeVisible();
    await playScene(page, id, { axe: true });
    const intro = page.locator('[data-chapter-intro]');
    await expect(intro.getByRole('heading', { level: 1, name: city })).toBeFocused();
    await expect(intro.locator('[data-chapter-rules]')).toBeVisible();
  });
}
