/**
 * CR-49 (R25(1)): arc beats play in slot order. The next arc beat is the lowest slot not yet played (the slot-1
 * repeat next after a first Close, then slot 2 skipped), never above 9, and nothing in a replayed chapter.
 */
import { describe, expect, it } from 'vitest';
import { applyArcBeat, arcSlotAt, arcSlotForRun, EMPTY_ARC, LAST_ARC_SLOT, type ArcState } from '../../../src/engine/arc.ts';
import { beginChapter, chapterProgress } from '../../../src/engine/game.ts';
import type { ScenarioResult } from '../../../src/engine/result.ts';
import { freshSave, type SaveState } from '../../../src/engine/save.ts';

const res = (): ScenarioResult => ({ points: 0, arcEffects: {} }) as unknown as ScenarioResult;
const arc = (over: Partial<ArcState> = {}): ArcState => ({ ...EMPTY_ARC, vars: {}, timeline: [], choices: [], ...over });

const MIDDLE = ['berlin', 'amsterdam', 'paris', 'madrid', 'warsaw', 'rome', 'lisbon', 'dublin', 'stockholm'];

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
    expect(arcSlotAt(once, 5), 'interleaved: the repeat still comes next').toBe(1);
    const repeated = applyArcBeat(once, 1, res(), 'reply');
    expect(arcSlotAt(repeated, 3)).toBe(3);
    expect(arcSlotAt(repeated, 2)).toBe(3);
  });
  it('a replayed (finished) chapter never plays an arc beat', () => {
    expect(arcSlotForRun(arc({ timeline: [1] }), { finished: true, position: 2 })).toBeNull();
    expect(arcSlotForRun(arc({ timeline: [1] }), { finished: false, position: 2 })).toBe(2);
  });
  it('interleaved: start Berlin, leave before its arc beat, finish Amsterdam: Amsterdam plays slot 1, then Berlin slot 2', () => {
    let save = start(withHome(), 'berlin');
    expect(chapterProgress(save, 'berlin').position).toBe(1);
    save = start(save, 'amsterdam');
    expect(chapterProgress(save, 'amsterdam').position).toBe(2);
    const a = reachArcBeat(save, 'amsterdam');
    expect(a.slot, 'not slot 2 ("let\'s move to Kettle") as the first message').toBe(1);
    save = finish(a.save, 'amsterdam');
    const b = reachArcBeat(save, 'berlin');
    expect(b.slot).toBe(2);
    expect(b.save.arc.timeline).toEqual([1, 2]);
  });
  it('interleaved: slot 8 can no longer follow slot 9', () => {
    // Positions 1–7 done; start position 8 (Dublin) and leave; finish position 9 (Stockholm) first.
    let save = withHome();
    for (const city of MIDDLE.slice(0, 7)) {
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
  it('the full nine-chapter path ends on slot 9 (default order, an interleaved order, and after a slot-1 Close)', () => {
    const path = (order: readonly string[], firstKind: string): number[] => {
      let save = withHome();
      for (const city of order) save = start(save, city); // every chapter started first (worst interleaving)
      const slots: number[] = [];
      order.forEach((city, i) => {
        const r = reachArcBeat(save, city, i === 0 ? firstKind : 'reply');
        if (r.slot !== null) slots.push(r.slot);
        save = finish(r.save, city);
      });
      return slots;
    };
    expect(path(MIDDLE, 'reply')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(path([...MIDDLE].reverse(), 'reply')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(path(MIDDLE, 'ignore'), 'slot-1 Close: repeat, slot 2 skipped').toEqual([1, 1, 3, 4, 5, 6, 7, 8, 9]);
    expect(path([...MIDDLE].reverse(), 'ignore')).toEqual([1, 1, 3, 4, 5, 6, 7, 8, 9]);
  });
});
