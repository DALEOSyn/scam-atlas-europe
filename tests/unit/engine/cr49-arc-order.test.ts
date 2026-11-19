/**
 * CR-49 (R25(1)): arc beats play in slot order. The next arc beat is the lowest slot not yet played (the slot-1
 * repeat next after a first Close, then slot 2 skipped), never above 9, and nothing in a replayed chapter.
 */
import { describe, expect, it } from 'vitest';
import { applyArcBeat, arcSlotAt, arcSlotForRun, EMPTY_ARC, LAST_ARC_SLOT, type ArcState } from '../../../src/engine/arc.ts';
import { unlockedChapters } from '../../../src/engine/chapter.ts';
import { beginChapter, chapterProgress } from '../../../src/engine/game.ts';
import type { ScenarioResult } from '../../../src/engine/result.ts';
import { freshSave, type SaveState } from '../../../src/engine/save.ts';

const res = (): ScenarioResult => ({ points: 0, arcEffects: {} }) as unknown as ScenarioResult;
const arc = (over: Partial<ArcState> = {}): ArcState => ({ ...EMPTY_ARC, vars: {}, timeline: [], choices: [], ...over });

/** The middle chapters (slots 2–9); they unlock once Berlin (slot 1) is done (G1, `unlockedChapters`). */
const MIDDLE = ['amsterdam', 'paris', 'madrid', 'warsaw', 'rome', 'lisbon', 'dublin', 'stockholm'];
const PATH = ['berlin', ...MIDDLE];
const CHAPTERS = [{ city: 'home', slot: 0 }, ...PATH.map((city, i) => ({ city, slot: i + 1 })), { city: 'brussels', slot: 10 }];

/** Start a chapter (fixes its play position the first time), as `startChapter` does. */
const start = (save: SaveState, city: string): SaveState => beginChapter(save, city);
/** The chapter reaches its arc beat: the slot it plays (null: none) and the save after the beat. */
function reachArcBeat(save: SaveState, city: string, kind = 'reply'): { slot: number | null; save: SaveState } {
  const slot = arcSlotForRun(save.arc, chapterProgress(save, city));
  return { slot, save: slot === null ? save : { ...save, arc: applyArcBeat(save.arc, slot, res(), kind) } };
}
const finish = (save: SaveState, city: string): SaveState => ({
  ...save,
  chapters: { ...save.chapters, [city]: { ...chapterProgress(save, city), finished: true, run: null } },
});
const withHome = (): SaveState => finish(start(freshSave(), 'home'), 'home');
/** Home and Berlin done, Berlin having played its arc beat (slot 1). */
const withBerlin = (): SaveState => {
  const save = start(withHome(), 'berlin');
  return finish(reachArcBeat(save, 'berlin').save, 'berlin');
};

describe('CR-49: arc slot by beats played (R25(1))', () => {
  it('returns the lowest slot not yet played, whatever the position; never above 9', () => {
    expect(arcSlotAt(arc(), 5)).toBe(1);
    expect(arcSlotAt(arc({ timeline: [1] }), 7)).toBe(2);
    expect(arcSlotAt(arc({ timeline: [1, 2, 3, 5] }), 4)).toBe(4);
    expect(arcSlotAt(arc({ timeline: [1, 2, 3, 4, 5, 6, 7, 8] }), 2)).toBe(9);
    expect(arcSlotAt(arc({ timeline: [1, 2, 3, 4, 5, 6, 7, 8, 9] }), 9)).toBeNull();
    expect(LAST_ARC_SLOT).toBe(9);
  });
  it('Home (0), the finale (10), no position and a closed arc play nothing', () => {
    expect(arcSlotAt(arc(), 0)).toBeNull();
    expect(arcSlotAt(arc(), 10)).toBeNull();
    expect(arcSlotAt(arc(), null)).toBeNull();
    expect(arcSlotAt(arc({ closed: true, timeline: [1] }), 3)).toBeNull();
  });
  it('after a first Close the slot-1 repeat is next (at any position), once; then slot 2 is skipped', () => {
    const once = applyArcBeat(arc(), 1, res(), 'ignore');
    expect(arcSlotAt(once, 2)).toBe(1);
    expect(arcSlotAt(once, 5), 'interleaved (position 2 started and left, more started): the repeat still comes next').toBe(1);
    const repeated = applyArcBeat(once, 1, res(), 'reply');
    expect(arcSlotAt(repeated, 3)).toBe(3);
    // Position 2 again: it was started and left before its arc beat while position 3 played the repeat.
    expect(arcSlotAt(repeated, 2)).toBe(3);
  });
  it('a replayed (finished) chapter never plays an arc beat', () => {
    expect(arcSlotForRun(arc({ timeline: [1] }), { finished: true, position: 2 })).toBeNull();
    expect(arcSlotForRun(arc({ timeline: [1] }), { finished: false, position: 2 })).toBe(2);
  });
  it('interleaved: start Amsterdam, leave before its arc beat, finish Paris: Paris plays slot 2, then Amsterdam slot 3', () => {
    // Reachable: the middle chapters unlock once Berlin is done (G1), so Berlin plays slot 1 first.
    expect(unlockedChapters(CHAPTERS, new Set(['home']))).toEqual(['home', 'berlin']);
    let save = withBerlin();
    expect(save.arc.timeline).toEqual([1]);
    save = start(save, 'amsterdam');
    expect(chapterProgress(save, 'amsterdam').position).toBe(2);
    save = start(save, 'paris');
    expect(chapterProgress(save, 'paris').position).toBe(3);
    const p = reachArcBeat(save, 'paris');
    expect(p.slot, 'not slot 3 before slot 2').toBe(2);
    save = finish(p.save, 'paris');
    const a = reachArcBeat(save, 'amsterdam');
    expect(a.slot).toBe(3);
    expect(a.save.arc.timeline).toEqual([1, 2, 3]);
  });
  it('interleaved: slot 8 can no longer follow slot 9', () => {
    // Positions 1–7 done (Berlin first); start position 8 (Dublin) and leave; finish position 9 (Stockholm) first.
    let save = withHome();
    for (const city of PATH.slice(0, 7)) {
      save = start(save, city);
      save = finish(reachArcBeat(save, city).save, city);
    }
    save = start(save, 'dublin');
    save = start(save, 'stockholm');
    const s = reachArcBeat(save, 'stockholm');
    expect(s.slot).toBe(8);
    save = finish(s.save, 'stockholm');
    const d = reachArcBeat(save, 'dublin');
    expect(d.slot).toBe(9);
    expect(d.save.arc.timeline).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('the full nine-chapter path ends on slot 9 (default order, reversed middle, and after a slot-1 Close)', () => {
    // Berlin first (the middle chapters unlock once it is done, G1); then every middle chapter started before any
    // is finished (the worst interleaving), finished in the same order.
    const path = (middle: readonly string[], berlinKind: string): number[] => {
      let save = start(withHome(), 'berlin');
      const first = reachArcBeat(save, 'berlin', berlinKind);
      const slots: number[] = first.slot === null ? [] : [first.slot];
      save = finish(first.save, 'berlin');
      for (const city of middle) save = start(save, city);
      for (const city of middle) {
        const r = reachArcBeat(save, city);
        if (r.slot !== null) slots.push(r.slot);
        save = finish(r.save, city);
      }
      return slots;
    };
    expect(path(MIDDLE, 'reply')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(path([...MIDDLE].reverse(), 'reply')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(path(MIDDLE, 'ignore'), 'slot-1 Close: repeat, slot 2 skipped').toEqual([1, 1, 3, 4, 5, 6, 7, 8, 9]);
    expect(path([...MIDDLE].reverse(), 'ignore')).toEqual([1, 1, 3, 4, 5, 6, 7, 8, 9]);
  });
});
