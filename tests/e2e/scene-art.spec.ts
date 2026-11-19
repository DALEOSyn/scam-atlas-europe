import { expect, test, type Page } from '@playwright/test';

/**
 * ART_DIRECTION §4.3, §12.5.5: the expression is chosen by the fragment id of a plain <img>
 * (`cast/<id>.svg#x-<expression>`), through the file's :target style, with no script. Uses the style
 * sample (public/art/samples, test-only; not precached). The scene player mounts each portrait with its
 * final src (keyed by src), so engines that ignore a fragment-only src change are still safe; the last
 * test records how this engine handles one.
 *
 * Browsers: the projects in playwright.config.ts (Chromium only in this environment). Firefox and WebKit
 * are a manual check until their Playwright builds are installed (docs/ENGINE.md, scene engine).
 */
const SAMPLE = '/art/samples/sample-portrait-teo.svg';

async function showImages(page: Page, srcs: string[]) {
  await page.goto('/');
  await page.evaluate((list) => {
    document.body.innerHTML = '';
    for (const [i, src] of list.entries()) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.width = 240;
      img.height = 300;
      img.id = `img${i}`;
      img.style.background = '#ffffff';
      img.style.display = 'block';
      document.body.append(img);
    }
  }, srcs);
  await page.waitForFunction((n) => [...document.images].filter((i) => i.complete && i.naturalWidth > 0).length === n, srcs.length);
}

/** Share of pixels that differ between two PNG screenshots (decoded in the page; byte equality is too strict). */
async function diffRatio(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(
    async ([x, y]) => {
      const load = async (b64: string) => {
        // An <img> (img-src allows data:), not fetch (the game's CSP limits connect-src to 'self').
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const bmp = await createImageBitmap(img);
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = c.getContext('2d') as OffscreenCanvasRenderingContext2D;
        ctx.drawImage(bmp, 0, 0);
        return ctx.getImageData(0, 0, bmp.width, bmp.height).data;
      };
      const [p, q] = [await load(x), await load(y)];
      if (p.length !== q.length) return 1;
      let diff = 0;
      const at = (d: Uint8ClampedArray, i: number) => d[i] ?? 0;
      for (let i = 0; i < p.length; i += 4) {
        const delta = Math.abs(at(p, i) - at(q, i)) + Math.abs(at(p, i + 1) - at(q, i + 1)) + Math.abs(at(p, i + 2) - at(q, i + 2));
        if (delta > 30) diff++;
      }
      return diff / (p.length / 4);
    },
    [a.toString('base64'), b.toString('base64')] as const,
  );
}

test('an <img> fragment switches the expression group (sample portrait)', async ({ page }) => {
  // One image at a time in the same place, so screenshots compare like with like (no scroll or subpixel shift).
  const shot = async (src: string) => {
    await showImages(page, [src]);
    return page.locator('#img0').screenshot();
  };
  const plain = await shot(SAMPLE);
  const thinking = await shot(`${SAMPLE}#x-thinking`);
  const warm = await shot(`${SAMPLE}#x-warm`);
  const unknown = await shot(`${SAMPLE}#x-nope`);
  // The default group (last in the file) shows without a fragment and for an unknown fragment.
  expect(await diffRatio(page, plain, warm)).toBeLessThan(0.001);
  expect(await diffRatio(page, plain, unknown)).toBeLessThan(0.001);
  // A listed fragment shows its own group instead of the default (eyes, mouth and the hand at the chin).
  expect(await diffRatio(page, plain, thinking)).toBeGreaterThan(0.01);
});

test('a fresh <img> per expression renders the right face (what the scene player does)', async ({ page }) => {
  await showImages(page, [`${SAMPLE}#x-thinking`]);
  const first = await page.locator('#img0').screenshot();
  // Replace the element (new mount with its final src), as ScenePlayer does with key={src}.
  await page.evaluate((src) => {
    const old = document.getElementById('img0') as HTMLImageElement;
    const img = old.cloneNode() as HTMLImageElement;
    img.src = src;
    old.replaceWith(img);
  }, `${SAMPLE}#x-warm`);
  await page.waitForFunction(() => (document.getElementById('img0') as HTMLImageElement).complete);
  const second = await page.locator('#img0').screenshot();
  expect(await diffRatio(page, first, second)).toBeGreaterThan(0.01);
});
