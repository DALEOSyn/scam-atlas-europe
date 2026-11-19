import { expect, test, type Page } from '@playwright/test';
import { HARNESS_URL } from '../../playwright.config.ts';

/**
 * Scene-player and HUD layout on phones (review T-S3 items 3, 4, 5), measured in a real browser on the
 * test-only harness (tests/e2e/harness), because the production build bundles zero scenes so far.
 */
const PHONES = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
] as const;

async function openScene(page: Page, id: string, size: { width: number; height: number }) {
  await page.setViewportSize(size);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${HARNESS_URL}/?view=scene&id=${id}`);
  await expect(page.locator('li[data-panel="1"]')).toBeVisible();
}

async function imagesLoaded(page: Page) {
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
}

test.describe('scene player layout (harness)', () => {
  for (const size of [...PHONES, { width: 1280, height: 800 }]) {
    test(`item 3: the listener stands beside the speaker, on the other side, at ${size.width} px`, async ({ page }) => {
      await openScene(page, 'harness-pair', size);
      await page.getByRole('button', { name: 'Next' }).click();
      await imagesLoaded(page);
      for (const [n, flipped] of [
        [1, false],
        [2, true],
      ] as const) {
        const li = page.locator(`li[data-panel="${n}"]`);
        const s = await li.locator('img[data-art="speaker"]').boundingBox();
        const l = await li.locator('img[data-art="listener"]').boundingBox();
        if (!s || !l) throw new Error(`panel ${n}: speaker or listener not laid out`);
        const w = Math.max(0, Math.min(s.x + s.width, l.x + l.width) - Math.max(s.x, l.x));
        const h = Math.max(0, Math.min(s.y + s.height, l.y + l.height) - Math.max(s.y, l.y));
        const smaller = Math.min(s.width * s.height, l.width * l.height);
        expect(smaller, `panel ${n}: figures have a size`).toBeGreaterThan(0);
        expect((w * h) / smaller, `panel ${n}: overlap share`).toBeLessThan(0.5);
        const centre = (b: { x: number; width: number }) => b.x + b.width / 2;
        // Speaker left and listener right by default; flipped, the speaker is on the right.
        if (flipped) expect(centre(l)).toBeLessThan(centre(s));
        else expect(centre(l)).toBeGreaterThan(centre(s));
      }
    });
  }

  for (const size of PHONES) {
    test(`CR-27: on open the sticky footer does not cover the end of the first panel, at ${size.width}×${size.height}`, async ({ page }) => {
      await openScene(page, 'harness-long', size);
      await imagesLoaded(page);
      const gap = await page.evaluate(() => {
        const panel = document.querySelector('li[data-panel="1"]')?.getBoundingClientRect();
        const foot = document.querySelector('[data-scene="next"]')?.parentElement?.getBoundingClientRect();
        const h1 = document.querySelector('h1')?.getBoundingClientRect();
        return panel && foot && h1 ? { overlap: panel.bottom - foot.top, h1Top: h1.top } : null;
      });
      if (!gap) throw new Error('scene not laid out');
      // Either the first panel ends above the footer, or the heading would have had to leave the screen.
      if (gap.overlap > 0.5) expect(gap.h1Top).toBeLessThanOrEqual(0.5);
      else expect(gap.overlap).toBeLessThanOrEqual(0.5);
      await expect(page.locator('h1')).toBeFocused();
    });

    test(`item 4: Next stays on screen after every press, focus on the new panel, at ${size.width}×${size.height}`, async ({ page }) => {
      await openScene(page, 'harness-long', size);
      const total = await page.evaluate(() => Number(/of (\d+)/.exec(document.querySelector('li[data-panel] span')?.textContent ?? '')?.[1] ?? 0));
      expect(total).toBe(8);
      const inView = async () => {
        const btn = page.locator('[data-scene="next"]');
        const box = await btn.boundingBox();
        if (!box) throw new Error('Next is not laid out');
        expect(box.y, 'Next top in view').toBeGreaterThanOrEqual(0);
        expect(box.y + box.height, 'Next bottom in view').toBeLessThanOrEqual(size.height + 0.5);
        // Nothing covers it: the button is what the page hits at its centre.
        const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-scene="next"]') !== null, [box.x + box.width / 2, box.y + box.height / 2] as const);
        expect(hit, 'Next is not covered').toBe(true);
      };
      await inView();
      for (let n = 2; n <= total; n++) {
        await page.locator('[data-scene="next"]').click();
        await expect(page.locator(`li[data-panel="${n}"]`)).toBeFocused();
        await inView();
      }
      await expect(page.locator('[data-scene="next"]')).toHaveText('Continue');
      // The page really scrolled: the sticky footer is what kept Next in view.
      expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
    });
  }
});

test.describe('HUD (harness)', () => {
  for (const size of PHONES) {
    test(`item 5: the HUD keeps one row with the tip open at ${size.width} px`, async ({ page }) => {
      await page.setViewportSize(size);
      const height = async (coach: 0 | 1) => {
        await page.goto(`${HARNESS_URL}/?view=hud&coach=${coach}`);
        const box = await page.locator('header').boundingBox();
        if (!box) throw new Error('HUD not laid out');
        return box.height;
      };
      const closed = await height(0);
      const open = await height(1);
      expect(open).toBe(closed);
      // Below 720 px only "Paused" shows; the full sentence stays for screen readers.
      await expect(page.locator('[data-frozen="narrow"]')).toBeVisible();
      await expect(page.locator('[data-frozen="narrow"]')).toHaveText('Paused');
      await expect(page.locator('[data-frozen="wide"]')).toBeHidden();
      await expect(page.locator('[role="timer"]')).toContainText('Paused while the tip is open');
    });
  }
  test('item 5: from 720 px the label reads "Paused: tip open"; one row with and without the tip from 320 to 1024 px', async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 800 });
    await page.goto(`${HARNESS_URL}/?view=hud&coach=1`);
    await expect(page.locator('[data-frozen="wide"]')).toHaveText('Paused: tip open');
    await expect(page.locator('[data-frozen="narrow"]')).toBeHidden();
    const rows: string[] = [];
    for (let width = 320; width <= 1024; width += 24) {
      await page.setViewportSize({ width, height: 800 });
      const h: number[] = [];
      for (const coach of [0, 1]) {
        await page.goto(`${HARNESS_URL}/?view=hud&coach=${coach}`);
        h.push((await page.locator('header').boundingBox())?.height ?? -1);
      }
      if (h[0] !== h[1]) rows.push(`${width}px: ${h.join(' vs ')}`);
    }
    expect(rows).toEqual([]);
  });
});
