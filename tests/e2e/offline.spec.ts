import { expect, test } from '@playwright/test';
import { playScene } from './scene-helpers.ts';

/**
 * T-4.6 P1: the service worker takes control of the tab it was installed from (skipWaiting + clientsClaim), so a
 * first visit can go offline in the same tab and keep playing: the lazy chapter chunk and the story art come from
 * the precache. vite preview sends `Cache-Control: no-cache`, so nothing here can come from the HTTP cache.
 */
test('first visit: the tab is controlled after install and plays a scene and a scenario offline in the same tab', async ({ page, context }) => {
  test.setTimeout(90_000);
  const failed: string[] = [];
  page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText ?? ''}`));

  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // clientsClaim: the controller arrives without a reload.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 60_000 });

  await context.setOffline(true);
  try {
    await page.getByRole('button', { name: 'Chapters' }).click();
    await page.getByRole('button', { name: 'Play Home' }).click();
    // The Arrival scene: its chunk and every portrait and backdrop must load from the precache.
    await playScene(page, 'home-arrival');
    const intro = page.locator('[data-chapter-intro]');
    await expect(intro.getByRole('heading', { level: 1, name: 'Home' })).toBeFocused();
    await intro.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#device-heading')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(failed).toEqual([]);
  } finally {
    await context.setOffline(false);
  }
});
