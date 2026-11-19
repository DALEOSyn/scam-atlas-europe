import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * S4 story scenes in the real build (T-S4b): the Amsterdam arrival before 2-1, and the sensitive local
 * problem ("Sanne's story") through replay, which always opens on the chapter's content note. Saves are
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

/** Reveal every panel with Next; every portrait and backdrop must load. */
async function readAll(scene: Locator) {
  const next = scene.getByRole('button', { name: 'Next' });
  while (await next.isVisible()) {
    await next.click();
    await expect(scene.locator('li[tabindex="-1"]').last()).toBeFocused();
  }
  const broken = await scene.locator('img').evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')));
  expect(broken).toEqual([]);
  // Let the last panel's fade-in finish, so contrast is measured on the end state.
  await scene.page().waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
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
