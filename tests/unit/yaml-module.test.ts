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
    expect(yamlModuleData(resolve(ROOT, 'content/brands.yaml'), 'a: 1\n', SCENARIOS)).toEqual({ a: 1 });
  });

  it('isInside is separator- and prefix-safe', () => {
    expect(isInside(SCENARIOS, join(SCENARIOS, 'home', 'x.yaml'))).toBe(true);
    expect(isInside(SCENARIOS, `${SCENARIOS}-other/x.yaml`)).toBe(false);
    expect(isInside(SCENARIOS, join(SCENARIOS, '..', 'x.yaml'))).toBe(false);
    expect(isInside(SCENARIOS, SCENARIOS)).toBe(false);
  });
});
