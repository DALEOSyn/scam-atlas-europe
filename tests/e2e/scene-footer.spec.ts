import { readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { HARNESS_URL } from '../../playwright.config.ts';

/**
 * CR-28 (T-S4b QA M1, round 2): on short screens the sticky footer hid the end of the newest panel's text,
 * and the first fix scrolled the focused h1 and Help off on open. For every authored scene, at 320×568,
 * 375×667 and 720×450: on open the heading row and the focused h1 are in view; when the scene opens and after every Next, the
 * newest panel's figcaption (its text, the postcard on If-then panels, the flip card) ends above the footer's
 * top edge. Runs on the harness (`?view=real`), which renders the authored scenes with the game's CSS.
 */
const SCENES = resolve(import.meta.dirname, '..', '..', 'content', 'scenes');
const IDS = readdirSync(SCENES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(SCENES, d.name)).filter((f) => f.endsWith('.yaml')).map((f) => basename(f, '.yaml')))
  .sort();

/**
 * CR-28 (CI): CI resolves the system font stack to wider fonts than a dev machine. `PW_SCENE_FONT` (e.g.
 * `"DejaVu Sans"`, the widest stack we have seen) forces one font for a local run that simulates CI.
 */
const FONT = process.env['PW_SCENE_FONT'];

const SENSITIVE = new Set(['amsterdam-sanne-story', 'amsterdam-turn', 'amsterdam-resolution']);

/**
 * The newest panel's figcaption against the footer (`under` ≤ 0 is clear; `capTop` ≥ 0 its start is on
 * screen), the focused element's box, and the heading row (h1, Help, Skip).
 */
async function measure(page: Page) {
  return page.evaluate(() => {
    const lis = [...document.querySelectorAll<HTMLElement>('li[data-panel]')];
    const li = lis.at(-1);
    const cap = li?.querySelector('figcaption')?.getBoundingClientRect();
    const foot = document.querySelector('[data-scene="next"]')?.parentElement?.getBoundingClientRect();
    const head = document.querySelector('header')?.getBoundingClientRect();
    const f = (document.activeElement as HTMLElement | null)?.getBoundingClientRect();
    if (!li || !cap || !foot || !head || !f) return null;
    return {
      panel: lis.length,
      under: Math.ceil(cap.bottom - foot.top),
      capTop: Math.floor(cap.top),
      focusTag: document.activeElement?.tagName ?? '',
      onLi: document.activeElement === li,
      focusTop: Math.floor(f.top),
      focusBottom: Math.ceil(f.bottom),
      footTop: foot.top,
      headTop: Math.floor(head.top),
      headBottom: Math.ceil(head.bottom),
      art: Math.round(li.querySelector('[role="img"]')?.getBoundingClientRect().height ?? 0),
      liH: Math.round(li.getBoundingClientRect().height),
      // CR-29: revealed panels before the newest one, with their art box, column width and inline cap.
      earlier: lis.slice(0, -1).map((x) => {
        const a = x.querySelector('[role="img"]')?.getBoundingClientRect();
        return { n: Number(x.dataset['panel']), artW: Math.round(a?.width ?? 0), colW: Math.round(x.getBoundingClientRect().width), capped: 'artCapped' in x.dataset || x.style.getPropertyValue('--art-max-h') !== '' };
      }),
      newestArtTop: Math.floor(li.querySelector('[role="img"]')?.getBoundingClientRect().top ?? 0),
      liBottom: Math.ceil(li.getBoundingClientRect().bottom),
      artRatio: (() => {
        const a = li.querySelector('[role="img"]')?.getBoundingClientRect();
        return a && a.height > 0 ? a.width / a.height : 0;
      })(),
    };
  });
}

/** Portrait phones where the art spans the column (CR-29 item 4 checks earlier panels there). */
// 375×667 is left out on purpose: there the CSS cap (50dvh) is below the column width × 3/4, so every
// picture is a centred 4:3 box narrower than the column by design, capped or not.
const FULL_WIDTH = new Set(['320×568', '360×640']);
/** Short landscape screens: picture and caption side by side (CR-29). */
const SIDE_BY_SIDE = new Set(['568×320', '640×360', '720×450']);

for (const size of [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 720, height: 450 },
  // CR-29: landscape phones (picture and caption side by side).
  { width: 568, height: 320 },
  { width: 640, height: 360 },
]) {
  test(`every authored scene at ${size.width}×${size.height}: heading row in view on open, focus on screen, the newest caption above the footer (${IDS.length} scenes)`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    if (FONT) {
      await page.addInitScript((f) => {
        // Before the app's module script runs ("interactive" comes first), so the first layout uses it,
        // as system fonts do in CI.
        document.addEventListener('readystatechange', () => {
          if (document.readyState !== 'interactive') return;
          const st = document.createElement('style');
          st.textContent = `:root { --font-ui: ${f} !important; } body, button { font-family: ${f} !important; }`;
          document.head.append(st);
        });
      }, FONT);
    }
    const bad: string[] = [];
    let panels = 0;
    for (const id of IDS) {
      await page.goto(`${HARNESS_URL}/?view=real&id=${id}`);
      await expect(page.locator('li[data-panel="1"]')).toBeVisible();
      // Sensitive scenes: "Need to talk? Where to get help" is on screen on open (the only cue on later ones).
      if (SENSITIVE.has(id)) await expect(page.getByRole('button', { name: 'Need to talk? Where to get help' }), `${id}: help link on open`).toBeInViewport({ ratio: 1 });
      const next = page.locator('[data-scene="next"]');
      for (;;) {
        // Instant scroll with reduced motion; one frame for layout to settle.
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        const m = await measure(page);
        if (!m) throw new Error(`${id}: no panel, footer or heading`);
        panels++;
        const at = `${size.width}×${size.height} ${id} panel ${m.panel} [art ${m.art}, head ${m.headTop}, li ${m.liH}, room ${Math.floor(m.footTop)}]`;
        if (m.panel === 1) {
          // On open: the focused h1 and the whole heading row are on screen (WCAG 2.4.11), above the footer.
          if (m.focusTag !== 'H1') bad.push(`${at}: focus is on ${m.focusTag}, not the h1`);
          if (m.headTop < 0 || m.headBottom > m.footTop) bad.push(`${at}: heading row ${m.headTop}..${m.headBottom} not fully in view`);
          // Headroom against font variance (CI fonts are wider): the opening layout fits with the first
          // panel's art at least 24 px above its 88 px floor, so a taller caption or heading still fits.
          if (m.art - 88 < 24) bad.push(`${at}: only ${m.art - 88} px of art headroom on open (needs ≥ 24)`);
        } else if (!m.onLi) bad.push(`${at}: focus is not on the new panel`);
        // The focused element is on screen: its top in view, and not hidden under the footer.
        if (m.focusTop < 0 || m.focusTop >= m.footTop) bad.push(`${at}: focused element top ${m.focusTop} off screen`);
        if (m.focusBottom > m.footTop && m.focusTag === 'H1') bad.push(`${at}: h1 runs under the footer`);
        if (m.capTop < 0) bad.push(`${at}: caption starts ${-m.capTop} px above the viewport`);
        if (m.under > 0) bad.push(`${at}: caption ${m.under} px under the footer`);
        // CR-29: the newest panel's whole picture is on screen after Next (no head cut off at the top).
        const key = `${size.width}×${size.height}`;
        if (SIDE_BY_SIDE.has(key)) {
          // CR-29 round 2: after Next the whole newest panel (picture and caption) ends above the footer.
          if (m.panel > 1 && m.liBottom > m.footTop) bad.push(`${at}: panel ends ${Math.ceil(m.liBottom - m.footTop)} px under the footer`);
          // The picture keeps 4:3 beside the caption.
          if (Math.abs(m.artRatio - 4 / 3) > 0.03) bad.push(`${at}: picture ratio ${m.artRatio.toFixed(3)}, not 4:3`);
        } else if (m.panel > 1 && m.newestArtTop < 0) bad.push(`${at}: picture top ${m.newestArtTop} above the viewport`);
        // CR-29: a tighter art cap is for the newest panel only; earlier panels are back to the column width.
        for (const e of m.earlier) {
          if (e.capped) bad.push(`${at}: earlier panel ${e.n} keeps an inline art cap`);
          if (FULL_WIDTH.has(`${size.width}×${size.height}`) && Math.abs(e.artW - e.colW) > 2) bad.push(`${at}: earlier panel ${e.n} art ${e.artW} px wide in a ${e.colW} px column`);
        }
        if ((await next.textContent())?.trim() !== 'Next') break;
        await next.click();
      }
    }
    expect(panels).toBeGreaterThanOrEqual(30);
    expect(bad).toEqual([]);
  });
}

test('CR-29: a rotation mid-scene (640×360 → 360×640) lifts the caps and reveals the newest panel again', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 360 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${HARNESS_URL}/?view=real&id=home-resolution`);
  await expect(page.locator('li[data-panel="1"]')).toBeVisible();
  await page.locator('[data-scene="next"]').click();
  await expect(page.locator('li[data-panel="2"]')).toBeFocused();
  await page.setViewportSize({ width: 360, height: 640 });
  const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  await settle();
  const m = await page.evaluate(() => {
    const li = document.querySelector<HTMLElement>('li[data-panel="2"]');
    const cap = li?.querySelector('figcaption')?.getBoundingClientRect();
    const foot = document.querySelector('[data-scene="next"]')?.parentElement?.getBoundingClientRect();
    const capped = [...document.querySelectorAll<HTMLElement>('li[data-panel]')].filter((x) => x !== li && x.style.getPropertyValue('--art-max-h') !== '').length;
    return li && cap && foot ? { capBottom: cap.bottom, capTop: cap.top, footTop: foot.top, capped, focused: document.activeElement === li } : null;
  });
  expect(m).not.toBeNull();
  if (!m) return;
  expect(m.capped).toBe(0);
  expect(m.focused).toBe(true);
  expect(m.capTop).toBeGreaterThanOrEqual(0);
  expect(m.capBottom).toBeLessThanOrEqual(m.footTop);
});
