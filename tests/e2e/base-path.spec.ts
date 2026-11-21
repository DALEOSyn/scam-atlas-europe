import { expect, test } from '@playwright/test';

/**
 * T-4.9: the build works under its deploy base path. Run under the GitHub Pages subpath with
 * `PW_BASE_PATH=/scam-atlas-europe/ PW_PORT=<port> npx playwright test --trace off tests/e2e/base-path.spec.ts`;
 * with the default base (/) it checks the same things at the root. Navigation is relative to baseURL.
 */
test('manifest, icons, start_url and scope resolve inside the base path', async ({ page, baseURL }) => {
  const base = new URL(baseURL ?? '/');
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).not.toBeNull();
  const manifestUrl = new URL(href ?? '', base);
  expect(manifestUrl.pathname.startsWith(base.pathname)).toBe(true);
  const res = await page.request.get(manifestUrl.href);
  expect(res.ok()).toBe(true);
  const manifest = (await res.json()) as { start_url: string; scope: string; icons: { src: string; type: string }[] };
  expect(new URL(manifest.start_url, manifestUrl).href).toBe(base.href);
  expect(new URL(manifest.scope, manifestUrl).href).toBe(base.href);
  const icons = [...manifest.icons.map((i) => new URL(i.src, manifestUrl).href)];
  for (const rel of ['icon', 'apple-touch-icon']) {
    const h = await page.locator(`link[rel="${rel}"]`).getAttribute('href');
    icons.push(new URL(h ?? '', base).href);
  }
  for (const icon of icons) {
    expect(new URL(icon).pathname.startsWith(base.pathname), icon).toBe(true);
    const r = await page.request.get(icon);
    expect(r.ok(), icon).toBe(true);
    expect(r.headers()['content-type'] ?? '', icon).toMatch(/^image\//);
  }
});

test('service worker scope is the base path; a deep link such as qr/<id> opens the game offline', async ({ page, context, baseURL }) => {
  test.setTimeout(90_000);
  const base = new URL(baseURL ?? '/');
  const outside: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith('http') && (u.origin !== base.origin || !u.pathname.startsWith(base.pathname))) outside.push(r.url());
  });
  await page.goto('./');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toBe(base.href);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 60_000 });

  // QR payloads are in-game routes (/qr/<id>), never navigated to by the game; a typed or shared deep link
  // under the base path must still land on the game (service worker navigateFallback; 404.html on Pages).
  await context.setOffline(true);
  try {
    await page.goto('qr/lisbon-parking-slip');
    expect(new URL(page.url()).pathname).toBe(`${base.pathname}qr/lisbon-parking-slip`);
    await expect(page.getByRole('button', { name: 'Chapters' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  } finally {
    await context.setOffline(false);
  }
  expect(outside).toEqual([]);
});

test('404.html (the GitHub Pages fallback) is the game shell with base-prefixed assets', async ({ page, baseURL }) => {
  const base = new URL(baseURL ?? '/');
  const res = await page.request.get(new URL('404.html', base).href);
  expect(res.ok()).toBe(true);
  const body = await res.text();
  const refs = [...body.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1] ?? '');
  expect(refs.length).toBeGreaterThan(0);
  for (const r of refs) expect(r.startsWith(base.pathname), r).toBe(true);
  expect(body).toContain('<div id="app"></div>');
});
