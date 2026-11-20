/**
 * T-4.6 P4: renders the PWA's PNG icons from our own vector icons, so no raster is drawn by hand, taken from
 * stock or generated. Run after changing public/icon.svg or public/icon-maskable.svg, then commit the PNGs:
 *
 *   npx tsx scripts/build-icons.ts        (PW_CHROMIUM_PATH=/path/to/chrome to force a browser binary)
 *
 * Outputs (public/): icon-192.png and icon-512.png (purpose any, from icon.svg, transparent corners),
 * icon-maskable-512.png (purpose maskable) and touch-icon-180.png (180 px, the page's apple-touch-icon; iOS rounds the corners itself; the file name avoids the brand denylist),
 * both from icon-maskable.svg. Each PNG is listed in public/assets-manifest.yaml.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PUBLIC = resolve(import.meta.dirname, '..', 'public');

export const ICONS: readonly { out: string; from: string; size: number }[] = [
  { out: 'icon-192.png', from: 'icon.svg', size: 192 },
  { out: 'icon-512.png', from: 'icon.svg', size: 512 },
  { out: 'icon-maskable-512.png', from: 'icon-maskable.svg', size: 512 },
  { out: 'touch-icon-180.png', from: 'icon-maskable.svg', size: 180 },
];

async function main(): Promise<void> {
  const executablePath = process.env['PW_CHROMIUM_PATH'];
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  try {
    for (const icon of ICONS) {
      const svg = readFileSync(resolve(PUBLIC, icon.from), 'utf8');
      const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size }, deviceScaleFactor: 1 });
      // The SVG is our own file, inlined: nothing is fetched.
      await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${icon.size}px;height:${icon.size}px}</style>${svg}`);
      writeFileSync(resolve(PUBLIC, icon.out), await page.screenshot({ omitBackground: true, type: 'png' }));
      await page.close();
      console.log(`${icon.out} ← ${icon.from} (${icon.size} px)`);
    }
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
