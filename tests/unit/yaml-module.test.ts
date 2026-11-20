import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { isInside, yamlModuleData } from '../../scripts/lib/yaml-module.ts';
import { listFiles } from '../../scripts/lib/content.ts';
import type { Scenario } from '../../src/content/schema.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const SCENARIOS = resolve(ROOT, 'content/scenarios');

describe('runtime scenario data carries schema defaults (vite content plugin)', () => {
  const files = listFiles(SCENARIOS, ['.yaml', '.yml']);

  it('home-01 (no beats: key in YAML) ships beats: [] and interrupts: []', () => {
    const file = files.find((f) => f.includes('home-01-')) ?? '';
    expect(file).not.toBe('');
    const text = readFileSync(file, 'utf8');
    expect((parse(text) as Record<string, unknown>).beats).toBeUndefined();
    const data = yamlModuleData(file, text, SCENARIOS) as Scenario;
    expect(data.beats).toEqual([]);
    expect(data.interrupts).toEqual([]);
  });

  it.each(files.map((f) => [f.slice(SCENARIOS.length + 1), f]))('%s has every defaulted array', (_, file) => {
    const data = yamlModuleData(file, readFileSync(file, 'utf8'), SCENARIOS) as Scenario;
    for (const key of ['beats', 'interrupts', 'inspectables', 'brands', 'cast', 'requires_flags'] as const) {
      expect(Array.isArray(data[key])).toBe(true);
    }
    for (const b of data.beats) expect(Array.isArray(b.inspectables)).toBe(true);
  });

  it('chapter files ship schema defaults (callbacks: [])', () => {
    const file = resolve(ROOT, 'content/chapters/home.yaml');
    const text = readFileSync(file, 'utf8');
    const data = yamlModuleData(file, text, SCENARIOS) as { callbacks: unknown };
    expect(Array.isArray(data.callbacks)).toBe(true);
  });

  it('a scenario that fails the schema fails loudly', () => {
    expect(() => yamlModuleData(join(SCENARIOS, 'home', 'broken.yaml'), 'id: x\n', SCENARIOS)).toThrow();
  });

  it('other YAML is passed through unchanged', () => {
    expect(yamlModuleData(resolve(ROOT, 'content/habit_cards.yaml'), 'a: 1\n', SCENARIOS)).toEqual({ a: 1 });
  });

  it('brands.yaml ships only id, names, the mark file and the register entry (no review-only fields in the bundle)', () => {
    const file = resolve(ROOT, 'content/brands.yaml');
    const data = yamlModuleData(file, readFileSync(file, 'utf8'), SCENARIOS) as Record<string, unknown>[];
    expect(data.length).toBeGreaterThan(0);
    for (const b of data) expect(Object.keys(b).every((k) => ['id', 'name', 'short_name', 'mark', 'sub_brands', 'register'].includes(k))).toBe(true);
    // CR-27: sub-brands (bank header names) ship id and name only, never their domain or purpose.
    for (const b of data) for (const sb of (b.sub_brands as Record<string, unknown>[] | undefined) ?? []) expect(Object.keys(sb).sort()).toEqual(['id', 'name']);
    expect(data.find((b) => b.id === 'brewnook')).toMatchObject({ name: 'Brewnook', mark: 'brands/brewnook-mark.svg' });
    expect(JSON.stringify(data)).not.toMatch(/checked_against|rationale|web_check/);
    // CR-38 (Dublin, T-3.10): the register entry ships status and the register's own (masked) contact details only.
    expect(data.find((b) => b.id === 'ellisfen')?.register).toEqual({ status: 'authorised', address: 'ellisfen.example', phone: '+353 1 ••• ••60' });
    expect(data.find((b) => b.id === 'brindlecove-bonds')?.register).toEqual({ status: 'warning_list' });
  });

  it('isInside is separator- and prefix-safe', () => {
    expect(isInside(SCENARIOS, join(SCENARIOS, 'home', 'x.yaml'))).toBe(true);
    expect(isInside(SCENARIOS, `${SCENARIOS}-other/x.yaml`)).toBe(false);
    expect(isInside(SCENARIOS, join(SCENARIOS, '..', 'x.yaml'))).toBe(false);
    expect(isInside(SCENARIOS, SCENARIOS)).toBe(false);
  });
});
