/**
 * CR-48 (ruling R24): the gold fall rule, unit level. Gold allows at most `stamps.gold.max_falls` (1) falls,
 * and with `falls_need_lo16_recovery` every fall must be recovered (its damage control met LO-16). Hints:
 * `falls_recovery` wins over `falls` when both apply. Old saves default to falls 0, recovered.
 */
import { describe, expect, it } from 'vitest';
import { fallsOf, goldFallNeed, recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { parseSave } from '../../../src/engine/save.ts';
import { B } from './helpers.ts';

const berlin = { patterns: ['smishing-parcel-fee'] };
const gold = { max_falls: 1, falls_need_lo16_recovery: true };
const r = (falls: number, fallsRecovered: boolean) => ({ falls, fallsRecovered });

/** Berlin-shaped records (max 172, R 12): everything ideal; `fall` replaces 1-7's record. */
function berlinRecords(fall?: Partial<ScenarioRecord>, bossFall?: Partial<ScenarioRecord>): ScenarioRecord[] {
  const base = { scored: true, stars: 3, genuineReported: 0, doubleCheckedHarmless: false, pattern: 'smishing-parcel-fee', falls: 0, fallsRecovered: true };
  return [
    ...['f1', 'f2', 'f3'].map((id) => ({ ...base, id, points: 19, maxPoints: 19, correctTags: 2, wrongTags: 0, redFlags: 2 })),
    { ...base, id: 'f17', points: 19, maxPoints: 19, correctTags: 2, wrongTags: 0, redFlags: 2, ...fall },
    ...['g1', 'g2', 'g3'].map((id) => ({ ...base, id, points: 15, maxPoints: 15, correctTags: 0, wrongTags: 0, redFlags: 0 })),
    { ...base, id: 'boss', points: 51, maxPoints: 51, correctTags: 4, wrongTags: 0, redFlags: 4, ...bossFall },
  ];
}

describe('balance carries the R24 keys', () => {
  it('stamps.gold.max_falls 1, falls_need_lo16_recovery true; silver has no fall rule', () => {
    expect(B.stamps.gold).toMatchObject(gold);
    expect(B.stamps.silver).not.toHaveProperty('max_falls');
  });
});

describe('goldFallNeed (R24)', () => {
  it('no falls, or one recovered fall: nothing needed', () => {
    expect(goldFallNeed(gold, [r(0, true), r(0, true)])).toBeNull();
    expect(goldFallNeed(gold, [r(1, true), r(0, true)])).toBeNull();
  });
  it('one unrecovered fall: falls_recovery', () => {
    expect(goldFallNeed(gold, [r(1, false)])).toBe('falls_recovery');
  });
  it('two recovered falls (in two scenarios or two boss beats): falls', () => {
    expect(goldFallNeed(gold, [r(1, true), r(1, true)])).toBe('falls');
    expect(goldFallNeed(gold, [r(2, true)])).toBe('falls');
  });
  it('both apply (too many falls, one unrecovered): only falls_recovery', () => {
    expect(goldFallNeed(gold, [r(1, true), r(1, false)])).toBe('falls_recovery');
    expect(goldFallNeed(gold, [r(3, false)])).toBe('falls_recovery');
  });
  it('a record with fallsRecovered false but no falls never counts', () => {
    expect(goldFallNeed(gold, [r(0, false)])).toBeNull();
  });
  it('follows the balance values: max_falls 0, and the recovery condition switched off', () => {
    expect(goldFallNeed({ max_falls: 0, falls_need_lo16_recovery: true }, [r(1, true)])).toBe('falls');
    expect(goldFallNeed({ max_falls: 1, falls_need_lo16_recovery: false }, [r(1, false)])).toBeNull();
    expect(goldFallNeed({ max_falls: 1, falls_need_lo16_recovery: false }, [r(2, false)])).toBe('falls');
  });
});

describe('summarise with falls (GDD §7.3 Berlin rows)', () => {
  it('one recovered fall on 1-7 (damage control 9): 162 (94.2%), spotted 10, gold', () => {
    const s = summarise(B, berlin, berlinRecords({ points: 9, correctTags: 0, falls: 1, fallsRecovered: true }), true);
    expect(s).toMatchObject({ points: 162, spotted: 10, stamp: 'gold', nextTier: null });
  });
  it('1-7 fall, damage control 4: 157 (91.3%), spotted 10, silver; hint falls_recovery only', () => {
    const s = summarise(B, berlin, berlinRecords({ points: 4, correctTags: 0, falls: 1, fallsRecovered: false }), true);
    expect(s).toMatchObject({ points: 157, spotted: 10, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(91.28, 1);
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls_recovery'], spottedNeeded: 8 });
  });
  it('boss beat 3 fall, damage control 0: 157 (91.3%), spotted 11, silver', () => {
    const s = summarise(B, berlin, berlinRecords(undefined, { points: 36, correctTags: 3, falls: 1, fallsRecovered: false }), true);
    expect(s).toMatchObject({ points: 157, spotted: 11, stamp: 'silver' });
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls_recovery'], spottedNeeded: 8 });
  });
  it('the fall needs sit after the other gold needs and never reach the silver hint', () => {
    const recs = berlinRecords({ points: 4, correctTags: 0, falls: 1, fallsRecovered: false }).map((x) => (x.id === 'g1' ? { ...x, doubleCheckedHarmless: true, pattern: 'staff-briefing' } : x));
    const s = summarise(B, berlin, recs, true);
    expect(s.nextTier?.needs).toEqual(['offfocus', 'falls_recovery']);
    const low = summarise(B, berlin, recs.map((x) => ({ ...x, correctTags: 0 })), true);
    expect(low.nextTier?.tier).toBe('silver');
    expect(low.nextTier?.needs).not.toContain('falls_recovery');
  });
  it('drills and arc beats never count as falls, even if a record says so', () => {
    const drill: ScenarioRecord = { id: 'd', scored: false, points: 0, maxPoints: 15, stars: 0, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleCheckedHarmless: false, pattern: null, falls: 3, fallsRecovered: false };
    expect(summarise(B, berlin, [...berlinRecords(), drill], true).stamp).toBe('gold');
  });
  it('the summary carries no count of falls', () => {
    const s = summarise(B, berlin, berlinRecords({ points: 4, falls: 1, fallsRecovered: false }), true);
    expect(Object.keys(s).filter((k) => /fall/i.test(k))).toEqual([]);
  });
});

describe('fallsOf / recordOf', () => {
  const beat = (fell: boolean, scored = true) => ({ fell, scored });
  const lo16 = (ok: boolean) => ({ points: ok ? 9 : 4, picks: [], lo16: ok, stars: ok ? (1 as const) : (0 as const) });
  it('counts fallen scored beat groups; recovered from the one damage control', () => {
    expect(fallsOf({ scored: true, beats: [beat(false)], recovery: null } as never)).toEqual({ falls: 0, fallsRecovered: true });
    expect(fallsOf({ scored: true, beats: [beat(true)], recovery: lo16(true) } as never)).toEqual({ falls: 1, fallsRecovered: true });
    expect(fallsOf({ scored: true, beats: [beat(true), beat(false), beat(true)], recovery: lo16(false) } as never)).toEqual({ falls: 2, fallsRecovered: false });
    expect(fallsOf({ scored: true, beats: [beat(true)], recovery: null } as never)).toEqual({ falls: 1, fallsRecovered: false });
  });
  it('unscored beats and unscored scenarios (drill, arc) never count', () => {
    expect(fallsOf({ scored: true, beats: [beat(true, false)], recovery: null } as never)).toEqual({ falls: 0, fallsRecovered: true });
    expect(fallsOf({ scored: false, beats: [beat(true)], recovery: lo16(false) } as never)).toEqual({ falls: 0, fallsRecovered: true });
  });
  it('recordOf stores them', () => {
    const res = { scenarioId: 'x', scored: true, points: 4, maxPoints: 19, stars: 0, correctTags: 0, wrongTags: 0, redFlags: 2, genuineReported: 0, doubleCheckedHarmless: false, beats: [beat(true)], recovery: lo16(false) };
    expect(recordOf(res as never, 'p')).toMatchObject({ falls: 1, fallsRecovered: false });
  });
});

describe('save: records from before R24 (CR-48)', () => {
  const saveWith = (records: unknown[]) => JSON.stringify({ version: 1, chapters: { berlin: { finished: true, bestStamp: 'gold', bestRating: 100, run: { index: 9, records, flags: [] } } } });
  it('a record without falls / fallsRecovered loads as falls 0, recovered, and keeps its stamp', () => {
    const { save } = parseSave(saveWith([{ id: 'berlin-07-customs-fee', scored: true, points: 9, maxPoints: 19 }]));
    expect(save.chapters.berlin?.run?.records[0]).toMatchObject({ falls: 0, fallsRecovered: true });
    expect(save.chapters.berlin?.bestStamp).toBe('gold');
  });
  it('stored values round-trip; bad values fall back to the defaults', () => {
    const { save } = parseSave(
      saveWith([
        { id: 'a', falls: 2, fallsRecovered: false },
        { id: 'b', falls: -1, fallsRecovered: 'no' },
        { id: 'c', falls: 1.7, fallsRecovered: true },
      ]),
    );
    expect(save.chapters.berlin?.run?.records.map((x) => [x.falls, x.fallsRecovered])).toEqual([
      [2, false],
      [0, true],
      [1, true],
    ]);
  });
});
