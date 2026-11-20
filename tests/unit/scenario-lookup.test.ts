import { describe, expect, it, vi } from 'vitest';
import { findScenarioRef, listScenarios, loadScenario, type ScenarioRef } from '../../src/content/scenarios.ts';
import type { Scenario } from '../../src/content/schema.ts';

/** T-4.6 P2: a scenario is looked up by file name; no other file of the chapter is loaded. */
describe('scenario lookup', () => {
  const ref = (chapter: string, id: string): ScenarioRef => ({ chapter, file: `${id}.yaml`, load: vi.fn(async () => ({ id }) as unknown as Scenario) });

  it('loads only the requested file, even when it sorts last in its chapter', async () => {
    const refs = [ref('berlin', 'berlin-01-a'), ref('berlin', 'berlin-09-boss'), ref('berlin', 'berlin-arc-alex-01'), ref('paris', 'berlin-arc-alex-01')];
    const s = await loadScenario('berlin', 'berlin-arc-alex-01', refs);
    expect(s?.id).toBe('berlin-arc-alex-01');
    expect(refs.map((r) => (r.load as ReturnType<typeof vi.fn>).mock.calls.length)).toEqual([0, 0, 1, 0]);
  });

  it('returns undefined and loads nothing for an unknown id or chapter', async () => {
    const refs = [ref('berlin', 'berlin-01-a')];
    expect(await loadScenario('berlin', 'berlin-02-b', refs)).toBeUndefined();
    expect(await loadScenario('paris', 'berlin-01-a', refs)).toBeUndefined();
    expect((refs[0]?.load as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('matches the whole file name, not a prefix', () => {
    const refs = [ref('home', 'home-01-welcome-pack'), ref('home', 'home-01')];
    expect(findScenarioRef(refs, 'home', 'home-01')?.file).toBe('home-01.yaml');
  });

  it('builds the bundled list once and finds every bundled scenario by its own id', async () => {
    const all = listScenarios();
    expect(listScenarios()).toBe(all);
    expect(all.length).toBeGreaterThan(0);
    for (const r of all.slice(0, 5)) {
      const s = await r.load();
      expect(findScenarioRef(all, r.chapter, s.id)).toBe(r);
    }
  });
});
