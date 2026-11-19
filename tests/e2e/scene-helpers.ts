import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Shared e2e steps for story scenes (S4). A chapter with an Arrival scene plays it first, then the chapter
 * intro (CR-27), then the first scenario. Tests about devices skip the scene; scene tests read it panel
 * by panel.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

/** The scene's own container (`main[data-scene-id]`), or any scene when no id is given. */
export const sceneLocator = (page: Page, id?: string): Locator => page.locator(id ? `main[data-scene-id="${id}"]` : 'main[data-scene-id]');

/** Skip a scene with its Skip button (same place on every scene) and wait until it has gone. */
export async function skipScene(page: Page, id?: string) {
  const scene = sceneLocator(page, id);
  await expect(scene).toBeVisible();
  await scene.locator('[data-scene="skip"]').click();
  await expect(scene).toHaveCount(0);
}

/** Reveal every panel with Next (focus moves to the new panel); every portrait and backdrop must load. */
export async function readAll(scene: Locator) {
  const next = scene.getByRole('button', { name: 'Next' });
  while (await next.isVisible()) {
    await next.click();
    await expect(scene.locator('li[tabindex="-1"]').last()).toBeFocused();
  }
  // Images can still be loading under a parallel run: wait for them, then fail with the broken srcs listed.
  await expect
    .poll(() => scene.locator('img').evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src'))), {
      message: 'every portrait and backdrop of the scene has loaded',
      timeout: 15_000,
    })
    .toEqual([]);
  // Let the last panel's fade-in finish, so contrast is measured on the end state.
  await scene.page().waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
}

/** Read a scene to the end, optionally answer its rehearsal choice and run axe, then press Continue. */
export async function playScene(page: Page, id: string, opts: { axe?: boolean; choose?: string } = {}) {
  const scene = sceneLocator(page, id);
  await expect(scene).toBeVisible();
  await readAll(scene);
  if (opts.choose) {
    // The optional rehearsal choice: one shared reply whatever the option (STORY §4.1).
    await scene.getByRole('button', { name: opts.choose }).click();
    await expect(scene.locator('[data-reply]')).toBeFocused();
  }
  if (opts.axe) await axeClean(page);
  await scene.getByRole('button', { name: 'Continue' }).click();
  await expect(scene).toHaveCount(0);
}
