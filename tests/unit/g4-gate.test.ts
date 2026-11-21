import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { checkG4Gate, isIsoDate } from '../../scripts/lib/g4-gate.ts';
import { ROOT } from './helpers.ts';

const TODAY = '2026-12-31';
const unticked = (n: number) => `- [ ] G4 condition ${n} met: <date>, <who>, <result>, confirmed by Roman <date> (<how>)`;
const ticked = (n: number, body = `2026-12-0${n}, Tone Reader ${n}, no findings left, fixed in #8${n}, confirmed by Roman 2026-12-1${n} (decision card)`) =>
  `- [x] G4 condition ${n} met: ${body}`;

/** A DECISIONS.md shaped like the real one, with the given marker lines in the G4 section. */
const doc = (...markers: string[]) =>
  ['# Decisions and gates', '## G3 — Content complete', ticked(1), '', '## G4 — Public release (state: Approved with conditions)', 'Conditions:', ...markers, '', '## G5 — Localization waves', ticked(2), ticked(3)].join('\n');

describe('G4 deploy gate (scripts/lib/g4-gate.ts)', () => {
  it('fails when every condition is unticked', () => {
    const r = checkG4Gate(doc(unticked(1), unticked(2), unticked(3)), TODAY);
    expect(r.ok).toBe(false);
    expect(r.errors).toEqual(['condition 1: not met (unticked)', 'condition 2: not met (unticked)', 'condition 3: not met (unticked)']);
  });

  it('fails with two of three ticked', () => {
    const r = checkG4Gate(doc(ticked(1), ticked(2), unticked(3)), TODAY);
    expect(r.ok).toBe(false);
    expect(r.errors).toEqual(['condition 3: not met (unticked)']);
  });

  it('fails with two of three ticked and the third line missing (ticks outside G4 do not count)', () => {
    const r = checkG4Gate(doc(ticked(1), ticked(2)), TODAY);
    expect(r.ok).toBe(false);
    expect(r.errors).toEqual(['condition 3: no marker line']);
  });

  it('fails when a ticked line has an empty or placeholder date', () => {
    for (const body of [', Reader, ok, confirmed by Roman 2026-12-12 (message)', '<date>, Reader, ok, confirmed by Roman 2026-12-12 (message)', '2026-02-30, Reader, ok, confirmed by Roman 2026-12-12 (message)']) {
      const r = checkG4Gate(doc(ticked(1), ticked(2, body), ticked(3)), TODAY);
      expect(r.ok, body).toBe(false);
      expect(r.errors.join('\n'), body).toMatch(/condition 2: met date/);
    }
  });

  it('fails when a ticked line has an empty or placeholder "who"', () => {
    for (const body of ['2026-12-02, , ok, confirmed by Roman 2026-12-12 (message)', '2026-12-02, <who>, ok, confirmed by Roman 2026-12-12 (message)']) {
      const r = checkG4Gate(doc(ticked(1), ticked(2, body), ticked(3)), TODAY);
      expect(r.ok, body).toBe(false);
      expect(r.errors.join('\n'), body).toMatch(/condition 2: "who"/);
    }
  });

  it('fails without Roman\'s confirmation, or with an empty one', () => {
    for (const body of [
      '2026-12-02, Reader, ok',
      '2026-12-02, Reader, ok, confirmed by Roman',
      '2026-12-02, Reader, ok, confirmed by Roman 2026-12-12',
      '2026-12-02, Reader, ok, confirmed by Roman 2026-12-12 ()',
      '2026-12-02, Reader, ok, confirmed by Roman <date> (<how>)',
      '2026-12-02, Reader, ok, confirmed by the sceptic 2026-12-12 (report)',
    ]) {
      const r = checkG4Gate(doc(ticked(1), ticked(2, body), ticked(3)), TODAY);
      expect(r.ok, body).toBe(false);
      expect(r.errors.join('\n'), body).toMatch(/condition 2: .*confirm/i);
    }
  });

  it('fails on impossible date order, a confirmation before the G4 approval, or a future date', () => {
    for (const body of [
      '2026-12-13, Reader, ok, confirmed by Roman 2026-12-12 (message)',
      '2026-11-10, Reader, ok, confirmed by Roman 2026-11-20 (message)',
      '2026-12-02, Reader, ok, confirmed by Roman 2027-01-05 (message)',
    ]) {
      expect(checkG4Gate(doc(ticked(1), ticked(2, body), ticked(3)), TODAY).ok, body).toBe(false);
    }
  });

  it('fails on a duplicate, malformed or out-of-range marker, an upper-case X, or no single G4 section', () => {
    expect(checkG4Gate(doc(ticked(1), ticked(2), ticked(3), unticked(3)), TODAY).ok).toBe(false);
    expect(checkG4Gate(doc(ticked(1), ticked(2), ticked(3), '- [x] G4 condition 4 met: 2026-12-02, R, ok, confirmed by Roman 2026-12-12 (message)'), TODAY).ok).toBe(false);
    expect(checkG4Gate(doc(ticked(1), ticked(2), ticked(3).replace('[x]', '[X]')), TODAY).ok).toBe(false);
    expect(checkG4Gate(doc(ticked(1), ticked(2), `* [x] G4 condition 3 met: ${'2026-12-03, R, ok, confirmed by Roman 2026-12-13 (message)'}`), TODAY).ok).toBe(false);
    expect(checkG4Gate(doc(ticked(1), ticked(2), ticked(3)).replace('## G4', '## G4b'), TODAY).ok).toBe(false);
    expect(checkG4Gate(`${doc(ticked(1), ticked(2), ticked(3))}\n## G4 again`, TODAY).ok).toBe(false);
  });

  it('passes when all three are ticked with date, who, result and Roman\'s confirmation (results may contain commas)', () => {
    const r = checkG4Gate(doc(ticked(1), ticked(2), ticked(3)), TODAY);
    expect(r).toEqual({ ok: true, errors: [] });
  });

  it('isIsoDate accepts only real calendar dates', () => {
    expect(isIsoDate('2026-11-21')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-1-21')).toBe(false);
  });

  it('the real docs/DECISIONS.md holds one well-formed marker per condition (unticked template or met)', () => {
    // Must stay true after the conditions are ticked, because the deploy workflow runs `npm test` too.
    const real = readFileSync(resolve(ROOT, 'docs/DECISIONS.md'), 'utf8');
    const r = checkG4Gate(real);
    const notMet = [1, 2, 3].filter((n) => !real.includes(`- [x] G4 condition ${n} met: `));
    for (const n of notMet) expect(real).toContain(unticked(n));
    expect(r.errors).toEqual(notMet.map((n) => `condition ${n}: not met (unticked)`));
  });

  it('the CLI runs under plain node (as the deploy workflow does) and exits 1 / 0', () => {
    const run = (file: string) => spawnSync(process.execPath, [resolve(ROOT, 'scripts/g4-gate.ts'), file], { cwd: ROOT, encoding: 'utf8' });
    const dir = mkdtempSync(join(tmpdir(), 'g4-gate-'));
    const open = join(dir, 'OPEN.md');
    writeFileSync(open, doc(ticked(1), ticked(2), unticked(3)));
    const blocked = run(open);
    expect(blocked.status).toBe(1);
    expect(blocked.stderr).toMatch(/g4:gate FAILED[\s\S]*condition 3: not met/);
    const ok = join(dir, 'DECISIONS.md');
    writeFileSync(ok, doc(ticked(1, '2026-11-21, R, ok, confirmed by Roman 2026-11-21 (message)'), ticked(2, '2026-11-21, R, ok, confirmed by Roman 2026-11-21 (message)'), ticked(3, '2026-11-21, R, ok, confirmed by Roman 2026-11-21 (message)')));
    const passed = run(ok);
    expect(passed.stderr).toBe('');
    expect(passed.status).toBe(0);
  });
}, 30_000);
