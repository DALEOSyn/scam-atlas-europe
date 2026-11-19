import { readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { HARNESS_URL } from '../../playwright.config.ts';

/**
 * CR-28 (T-S4b QA M1): on short screens the sticky footer hid the end of the newest panel's text. For every
 * authored scene in content/scenes, at 320×568 and 720×450: when the scene opens and after every Next, the
 * newest panel's figcaption (its text, the postcard on If-then panels, the flip card) ends above the footer's
 * top edge. Runs on the harness (`?view=real`), which renders the authored scenes with the game's CSS.
 */
const SCENES = resolve(import.meta.dirname, '..', '..', 'content', 'scenes');
const IDS = readdirSync(SCENES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(SCENES, d.name)).filter((f) => f.endsWith('.yaml')).map((f) => basename(f, '.yaml')))
  .sort();

/** How far (px) the newest panel's figcaption runs under the footer; ≤ 0 is clear. Also: is the panel focused? */
async function measure(page: Page) {
  return page.evaluate(() => {
    const lis = [...document.querySelectorAll<HTMLElement>('li[data-panel]')];
    const li = lis.at(-1);
    const cap = li?.querySelector('figcaption')?.getBoundingClientRect();
    const foot = document.querySelector('[data-scene="next"]')?.parentElement?.getBoundingClientRect();
    if (!li || !cap || !foot) return null;
    return { panel: lis.length, under: Math.ceil(cap.bottom - foot.top), capTop: cap.top, focused: document.activeElement === li };
  });
}

for (const size of [
  { width: 320, height: 568 },
  { width: 720, height: 450 },
]) {
  test(`every authored scene at ${size.width}×${size.height}: the newest panel's text ends above the footer (${IDS.length} scenes)`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const bad: string[] = [];
    let panels = 0;
    for (const id of IDS) {
      await page.goto(`${HARNESS_URL}/?view=real&id=${id}`);
      await expect(page.locator('li[data-panel="1"]')).toBeVisible();
      const next = page.locator('[data-scene="next"]');
      for (;;) {
        // Instant scroll with reduced motion; one frame for layout to settle.
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        const m = await measure(page);
        if (!m) throw new Error(`${id}: no panel or footer`);
        panels++;
        if (m.under > 0) bad.push(`${id} panel ${m.panel}: ${m.under} px under the footer`);
        if (m.panel > 1 && !m.focused) bad.push(`${id} panel ${m.panel}: focus is not on the new panel`);
        if ((await next.textContent())?.trim() !== 'Next') break;
        await next.click();
      }
    }
    expect(panels).toBeGreaterThanOrEqual(30);
    expect(bad).toEqual([]);
  });
}
