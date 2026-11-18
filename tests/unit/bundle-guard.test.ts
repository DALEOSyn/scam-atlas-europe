import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

  it.runIf(existsSync(resolve(ROOT, 'dist/assets')))('the built JS (when present) contains no Zod', () => {
    const dir = resolve(ROOT, 'dist/assets');
    const js = readdirSync(dir).filter((f) => f.endsWith('.js'));
    for (const f of js) expect(readFileSync(join(dir, f), 'utf8'), f).not.toMatch(/_zod|ZodError/);
  });
});
