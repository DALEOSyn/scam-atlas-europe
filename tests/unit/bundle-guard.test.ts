import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { ROOT } from './helpers.ts';
import { chapterChunkName } from '../../scripts/lib/chunks.ts';

/** The runtime bundle ships no Zod: content is validated at build time (sceptic T-2.1 #1). */
describe('runtime bundle has no Zod', () => {
  const src = resolve(ROOT, 'src');
  const files = readdirSync(src, { recursive: true, encoding: 'utf8' }).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('schema.ts'));

  it('src/ imports only types from schema.ts and never imports zod', () => {
    const offenders: string[] = [];
    for (const f of files) {
      const text = readFileSync(join(src, f), 'utf8');
      for (const m of text.matchAll(/^import\s+(type\s+)?[^;]*?from\s+'([^']+)'/gms)) {
        const spec = m[2] ?? '';
        if (/^zod/.test(spec)) offenders.push(`${f}: ${spec}`);
        if (/(^|\/)schema(\.ts)?$/.test(spec) && !m[1]) offenders.push(`${f}: value import from ${spec}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /** `npm run test:bundle` (after `npm run build`, in `check` and CI) sets BUNDLE_REQUIRED so a missing dist fails. */
  const required = process.env['BUNDLE_REQUIRED'] === '1';
  const built = existsSync(resolve(ROOT, 'dist/assets'));

  it.runIf(required)('dist/assets exists (build ran first)', () => {
    expect(built).toBe(true);
  });

  it.runIf(built)('the built JS (when present) contains no Zod', () => {
    const dir = resolve(ROOT, 'dist/assets');
    const js = readdirSync(dir).filter((f) => f.endsWith('.js'));
    for (const f of js) expect(readFileSync(join(dir, f), 'utf8'), f).not.toMatch(/_zod|ZodError/);
  });

  it.runIf(built)('the shell JS loaded by index.html stays within its budget (130 KB gzipped, T-4.6)', () => {
    const entries = shellJs();
    expect(entries.length).toBeGreaterThan(0);
    expect(gz(entries)).toBeLessThanOrEqual(BUDGET.shellJs);
  });

  it.runIf(built)('the service worker precaches no art review material (ART_DIRECTION §11: samples and rig)', () => {
    const sw = readFileSync(resolve(ROOT, 'dist/sw.js'), 'utf8');
    expect(sw).not.toMatch(/art\/(?:samples|rig)\//);
  });
});

/**
 * T-4.6 performance budgets (docs/ENGINE.md "Performance budgets"). Sizes are gzip (zlib default level, as the
 * shell check above), 1 KB = 1024 B. They run on the production build: `npm run build && npm run test:bundle`.
 */
const KB = 1024;
const BUDGET = {
  /** Shell JS: the entry script and its modulepreloads. Measured 105 KB at T-4.6. */
  shellJs: 130 * KB,
  /** Stylesheets linked by index.html. Measured 14.3 KB. */
  css: 20 * KB,
  /** Everything a first visit fetches before the game is usable: html, shell JS, CSS, manifest, workbox-window. Measured 123 KB. */
  initial: 160 * KB,
  /** Requests the browser needs before first paint: the html plus its scripts, modulepreloads and stylesheets. */
  renderRequests: 4,
  /** One lazy chunk per chapter (its scenarios and scenes). Measured 9–18 KB. */
  chapter: 35 * KB,
  /** Fictional brand marks (public/brands), total and per file. Measured 13.4 KB, largest 0.6 KB. */
  brandsTotal: 20 * KB,
  brandFile: 1 * KB,
  /** Service-worker precache: total transfer and entry count (precache install fetches one entry at a time). */
  precache: 600 * KB,
  precacheEntries: 120,
} as const;

const DIST = resolve(ROOT, 'dist');
const distBuilt = existsSync(resolve(DIST, 'assets'));
const html = (): string => readFileSync(resolve(DIST, 'index.html'), 'utf8');
const gz = (files: readonly string[]): number => files.reduce((n, f) => n + gzipSync(readFileSync(resolve(DIST, f))).length, 0);
const shellJs = (): string[] =>
  [...html().matchAll(/<script[^>]+src="[^"]*?(assets\/[^"]+\.js)"/g), ...html().matchAll(/<link[^>]+rel="modulepreload"[^>]+href="[^"]*?(assets\/[^"]+\.js)"/g)].map((m) => m[1] ?? '');
const stylesheets = (): string[] => [...html().matchAll(/<link[^>]+rel="stylesheet"[^>]+href="[^"]*?(assets\/[^"]+\.css)"/g)].map((m) => m[1] ?? '');
const assets = (): string[] => readdirSync(resolve(DIST, 'assets'));
/** The configured base of this build (vite.config.ts `base: process.env.VITE_BASE ?? '/'`), with a trailing slash. */
const BASE = ((b: string) => (b.endsWith('/') ? b : `${b}/`))(process.env['VITE_BASE'] ?? '/');
/** A URL from index.html as a path inside dist/: the base is removed (absolute or relative hrefs). */
function distPath(href: string, base: string = BASE): string {
  const path = href.split(/[?#]/)[0] ?? '';
  if (base !== '/' && path.startsWith(base)) return path.slice(base.length);
  return path.replace(/^\.?\//, '');
}
const precacheUrls = (): string[] => [...readFileSync(resolve(DIST, 'sw.js'), 'utf8').matchAll(/\{url:"([^"]+)",revision:/g)].map((m) => m[1] ?? '');
const manifest = (): { theme_color?: string; icons?: { src: string; sizes: string; type: string; purpose?: string }[] } => JSON.parse(readFileSync(resolve(DIST, 'manifest.webmanifest'), 'utf8')) as ReturnType<typeof manifest>;

describe.runIf(distBuilt)('performance budgets (T-4.6)', () => {
  it('initial load: CSS, total transfer and render-blocking requests', () => {
    expect(stylesheets().length).toBeGreaterThan(0);
    expect(gz(stylesheets())).toBeLessThanOrEqual(BUDGET.css);
    const workboxWindow = assets().filter((f) => /^workbox-window\./.test(f)).map((f) => `assets/${f}`);
    expect(workboxWindow).toHaveLength(1);
    const initial = ['index.html', 'manifest.webmanifest', ...shellJs(), ...stylesheets(), ...workboxWindow];
    expect(gz(initial)).toBeLessThanOrEqual(BUDGET.initial);
    expect(1 + shellJs().length + stylesheets().length).toBeLessThanOrEqual(BUDGET.renderRequests);
  });

  it('lazy content: one chunk per chapter, each within its budget, and no stray per-scenario chunks', () => {
    const cities = readdirSync(resolve(ROOT, 'content', 'scenarios'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    const js = assets().filter((f) => f.endsWith('.js'));
    for (const city of cities) {
      const chunks = js.filter((f) => f.startsWith(`chapter-${city}-`));
      expect(chunks, `chapter-${city} chunk`).toHaveLength(1);
      expect(gz(chunks.map((f) => `assets/${f}`)), `chapter-${city} gzip`).toBeLessThanOrEqual(BUDGET.chapter);
    }
    // Every other JS file is the shell, a chapter chunk, the bundler runtime or workbox-window.
    const other = js.filter((f) => !/^(?:index|chapter-[a-z0-9-]+|rolldown-runtime|workbox-window\.prod\.es5)-[\w-]+\.js$/.test(f));
    expect(other).toEqual([]);
  });

  it('chapterChunkName groups scenario and scene files by chapter folder only', () => {
    expect(chapterChunkName('/repo/content/scenarios/berlin/berlin-01-locker-code.yaml')).toBe('chapter-berlin');
    expect(chapterChunkName('C:\\repo\\content\\scenes\\berlin\\berlin-arrival.yaml')).toBe('chapter-berlin');
    expect(chapterChunkName('/repo/content/scenes/interludes/i1-teo-cafe.yaml')).toBe('chapter-interludes');
    expect(chapterChunkName('/repo/content/chapters/berlin.yaml')).toBeNull();
    expect(chapterChunkName('/repo/content/brands.yaml')).toBeNull();
    expect(chapterChunkName('/repo/src/app.tsx')).toBeNull();
  });

  it('brand marks: total and per file', () => {
    const files = readdirSync(resolve(DIST, 'brands')).filter((f) => f.endsWith('.svg')).map((f) => `brands/${f}`);
    expect(files.length).toBeGreaterThan(0);
    expect(gz(files)).toBeLessThanOrEqual(BUDGET.brandsTotal);
    for (const f of files) expect(gz([f]), f).toBeLessThanOrEqual(BUDGET.brandFile);
  });

  it('precache: no duplicate entries, entry count and total transfer within budget', () => {
    const urls = precacheUrls();
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter((u, i) => urls.indexOf(u) !== i)).toEqual([]);
    expect(urls.length).toBeLessThanOrEqual(BUDGET.precacheEntries);
    expect(gz(urls)).toBeLessThanOrEqual(BUDGET.precache);
  });

  it('the service worker takes control of the first-visit tab (skipWaiting + clientsClaim, T-4.6 P1)', () => {
    const sw = readFileSync(resolve(DIST, 'sw.js'), 'utf8');
    expect(sw).toMatch(/skipWaiting\(\)/);
    expect(sw).toMatch(/clientsClaim\(\)/);
  });

  it('distPath strips the configured base from index.html URLs (subpath builds)', () => {
    expect(distPath('/touch-icon-180.png', '/')).toBe('touch-icon-180.png');
    expect(distPath('/scam-atlas-europe/touch-icon-180.png', '/scam-atlas-europe/')).toBe('touch-icon-180.png');
    expect(distPath('./touch-icon-180.png', '/scam-atlas-europe/')).toBe('touch-icon-180.png');
    expect(distPath('/scam-atlas-europe/assets/x.js?v=1', '/scam-atlas-europe/')).toBe('assets/x.js');
  });

  it('one theme colour, a maskable icon and an apple-touch-icon, all present in the build (T-4.6 P4)', () => {
    const meta = /<meta name="theme-color" content="([^"]+)"/.exec(html())?.[1];
    expect(meta).toBeDefined();
    expect(manifest().theme_color).toBe(meta);
    const icons = manifest().icons ?? [];
    expect(icons.some((i) => i.purpose === 'maskable' && i.type === 'image/png' && i.sizes === '512x512')).toBe(true);
    expect(icons.some((i) => (i.purpose ?? 'any') === 'any' && i.sizes === '192x192')).toBe(true);
    for (const i of icons) expect(existsSync(resolve(DIST, i.src)), i.src).toBe(true);
    // The href carries the configured base (VITE_BASE, e.g. /scam-atlas-europe/ on a subpath build): strip it.
    const apple = /<link rel="apple-touch-icon" href="([^"]+)"/.exec(html())?.[1];
    expect(apple).toBeDefined();
    expect(existsSync(resolve(DIST, distPath(apple ?? '')))).toBe(true);
  });
});
