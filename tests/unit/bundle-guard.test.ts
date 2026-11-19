import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { ROOT } from './helpers.ts';

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

  it.runIf(built)('the shell JS loaded by index.html stays under 300 KB gzipped', () => {
    const html = readFileSync(resolve(ROOT, 'dist/index.html'), 'utf8');
    const entries = [...html.matchAll(/<script[^>]+src="[^"]*?(assets\/[^"]+\.js)"/g), ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="[^"]*?(assets\/[^"]+\.js)"/g)].map((m) => m[1] ?? '');
    expect(entries.length).toBeGreaterThan(0);
    const total = entries.reduce((n, f) => n + gzipSync(readFileSync(resolve(ROOT, 'dist', f))).length, 0);
    expect(total).toBeLessThan(300 * 1024);
  });

  it.runIf(built)('the service worker precaches no art review material (ART_DIRECTION §11: samples and rig)', () => {
    const sw = readFileSync(resolve(ROOT, 'dist/sw.js'), 'utf8');
    expect(sw).not.toMatch(/art\/(?:samples|rig)\//);
  });
});
