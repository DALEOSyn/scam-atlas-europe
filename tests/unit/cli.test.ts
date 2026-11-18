import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const TSX = resolve(ROOT, 'node_modules/.bin/tsx');
const run = (script: string, ...args: string[]) =>
  spawnSync(TSX, [resolve(ROOT, script), ...args], { cwd: ROOT, encoding: 'utf8' });

describe('CLI exit codes', () => {
  it('redline:lint exits 0 on content/ and 1 on the bad fixtures', () => {
    expect(run('scripts/redline-lint.ts').status).toBe(0);
    const bad = run('scripts/redline-lint.ts', 'tests/fixtures/redline');
    expect(bad.status).toBe(1);
    expect(bad.stderr).toMatch(/redline:lint FAILED/);
  });

  it('redline:lint prints warnings but exits 0 when only warnlist words occur', () => {
    const res = run('scripts/redline-lint.ts', 'tests/fixtures/redline/warn-only.yaml');
    expect(res.status).toBe(0);
    expect(res.stderr + res.stdout).toMatch(/warning \[brand\]/);
  });

  it('content:validate exits 0 normally and 1 with --strict while placeholders remain', () => {
    expect(run('scripts/content-validate.ts').status).toBe(0);
    expect(run('scripts/content-validate.ts', '--strict').status).toBe(1);
  });
}, 30_000);
