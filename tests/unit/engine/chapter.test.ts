import { describe, expect, it } from 'vitest';
import {
  isStopPointAfter,
  messagesLeft,
  nextIndex,
  sequenceOf,
  spottedThreshold,
  summarise,
  unlockedChapters,
  type ScenarioRecord,
} from '../../../src/engine/chapter.ts';
import { B } from './helpers.ts';

/**
 * GDD §7.2 Berlin strategy check, replayed through summarise():
 * 4 standard fraud (2 red flags + 2 decoys each, max 19), 3 genuine (2 own details each,
 * max 15; 1-1 Trundle twin in focus, 1-2 Adaeze off-focus), boss (4 red flags + 3 decoys, max 51).
 * Max 172, R = 12: silver needs spotted ≥ 4, gold ≥ 8.
 */
const FOCUS = 'smishing-parcel-fee';
const berlin = { patterns: [FOCUS, 'customs-fee'] };

interface Play {
  fraud: { points: number; correct: number; wrong: number }[];
  genuine: { points: number; wrong: number; reported?: boolean; doubleChecked?: boolean }[];
  boss: { points: number; correct: number; wrong: number };
}

function records(p: Play): ScenarioRecord[] {
  const base = { scored: true, stars: 3, genuineReported: 0, doubleCheckedHarmless: false };
  const genuinePatterns = [FOCUS, 'staff-briefing', 'shop-payment'];
  return [
    ...p.fraud.map((f, i) => ({ ...base, id: `f${i}`, points: f.points, maxPoints: 19, correctTags: f.correct, wrongTags: f.wrong, redFlags: 2, pattern: FOCUS })),
    ...p.genuine.map((g, i) => ({
      ...base,
      id: `g${i}`,
      points: g.points,
      maxPoints: 15,
      correctTags: 0,
      wrongTags: g.wrong,
      redFlags: 0,
      genuineReported: g.reported ? 1 : 0,
      // 1-6 (shop) is high stakes, so verifying it is never a harmless double check.
      doubleCheckedHarmless: (g.doubleChecked ?? false) && i < 2,
      pattern: genuinePatterns[i] ?? null,
    })),
    { ...base, id: 'boss', points: p.boss.points, maxPoints: 51, correctTags: p.boss.correct, wrongTags: p.boss.wrong, redFlags: 4, pattern: FOCUS },
  ];
}

const fraud = (points: number, correct = 0, wrong = 0) => Array.from({ length: 4 }, () => ({ points, correct, wrong }));
const genuine = (points: number, wrong = 0) => Array.from({ length: 3 }, () => ({ points, wrong }));
const stampOf = (p: Play) => summarise(B, berlin, records(p), true);

describe('chapter result: GDD §7.2 strategy table', () => {
  it('max 172, R 12, thresholds 4 and 8', () => {
    const s = stampOf({ fraud: fraud(19, 2), genuine: genuine(15), boss: { points: 51, correct: 4, wrong: 0 } });
    expect(s.max).toBe(172);
    expect(s.redFlags).toBe(12);
    expect(spottedThreshold(B.stamps.silver.min_spotted, 12)).toBe(4);
    expect(spottedThreshold(B.stamps.gold.min_spotted, 12)).toBe(8);
  });

  it('row 1 ideal: 172, 100%, spotted 12 → gold', () => {
    expect(stampOf({ fraud: fraud(19, 2), genuine: genuine(15), boss: { points: 51, correct: 4, wrong: 0 } })).toMatchObject({ points: 172, rating: 100, spotted: 12, stamp: 'gold' });
  });

  it('row 2 ideal + checking the genuine Trundle text (focus twin) → still gold', () => {
    const p: Play = { fraud: fraud(19, 2), genuine: [{ points: 15, wrong: 0, doubleChecked: true }, { points: 15, wrong: 0 }, { points: 15, wrong: 0 }], boss: { points: 51, correct: 4, wrong: 0 } };
    expect(stampOf(p)).toMatchObject({ stamp: 'gold', doubleChecks: 1, offFocusDoubleChecks: 0 });
  });

  it('row 3 ideal + always verify incl. calling Adaeze (off-focus) → silver', () => {
    const p: Play = { fraud: fraud(19, 2), genuine: [{ points: 15, wrong: 0, doubleChecked: true }, { points: 15, wrong: 0, doubleChecked: true }, { points: 15, wrong: 0, doubleChecked: true }], boss: { points: 51, correct: 4, wrong: 0 } };
    expect(stampOf(p)).toMatchObject({ rating: 100, offFocusDoubleChecks: 1, stamp: 'silver' });
  });

  it('row 4 careful reporter: 137, 79.7% → silver', () => {
    const s = stampOf({ fraud: fraud(14, 2), genuine: genuine(15), boss: { points: 36, correct: 4, wrong: 0 } });
    expect(s.points).toBe(137);
    expect(s.rating).toBeCloseTo(79.65, 1);
    expect(s.stamp).toBe('silver');
  });

  it('row 5 ideal but reports Adaeze once: 152, 88.4% → silver', () => {
    const p: Play = { fraud: fraud(19, 2), genuine: [{ points: 15, wrong: 0 }, { points: -5, wrong: 0, reported: true }, { points: 15, wrong: 0 }], boss: { points: 51, correct: 4, wrong: 0 } };
    const s = stampOf(p);
    expect(s).toMatchObject({ points: 152, genuineReported: 1, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(88.37, 1);
  });

  it('row 6 tag everything + always verify: 150, spotted −5 → bronze', () => {
    const s = stampOf({ fraud: fraud(15, 2, 2), genuine: genuine(15, 2), boss: { points: 45, correct: 4, wrong: 3 } });
    expect(s).toMatchObject({ points: 150, spotted: -5, stamp: 'bronze' });
  });

  it('row 6b always tag sender + link: 162, 94.2%, spotted 2 → bronze (high rating alone never earns silver)', () => {
    const p: Play = {
      fraud: [
        { points: 19, correct: 2, wrong: 0 },
        { points: 15, correct: 0, wrong: 1 },
        { points: 19, correct: 2, wrong: 0 },
        { points: 19, correct: 2, wrong: 0 },
      ],
      genuine: genuine(15, 2).map((g, i) => ({ ...g, wrong: i === 2 ? 2 : i === 0 ? 1 : 1 })),
      boss: { points: 45, correct: 3, wrong: 2 },
    };
    const s = stampOf(p);
    expect(s.points).toBe(162);
    expect(s.rating).toBeCloseTo(94.19, 1);
    expect(s.spotted).toBe(2);
    expect(s.stamp).toBe('bronze');
    expect(s.nextTier).toMatchObject({ tier: 'silver', needs: ['spotted'], spottedNeeded: 4 });
  });

  it('rows 7–9 (no tags, always verify, with or without pause) → bronze at 87.2%', () => {
    const s = stampOf({ fraud: fraud(15), genuine: genuine(15), boss: { points: 45, correct: 0, wrong: 0 } });
    expect(s).toMatchObject({ points: 150, spotted: 0, stamp: 'bronze' });
  });

  it('row 10 blind always-report: 55, 32% → bronze', () => {
    const p: Play = { fraud: fraud(10), genuine: [{ points: -5, wrong: 0, reported: true }, { points: -5, wrong: 0, reported: true }, { points: -5, wrong: 0, reported: true }], boss: { points: 30, correct: 0, wrong: 0 } };
    expect(stampOf(p)).toMatchObject({ points: 55, genuineReported: 3, stamp: 'bronze' });
  });

  it('row 12 trust everything with perfect damage control: 90 → bronze', () => {
    expect(stampOf({ fraud: fraud(9), genuine: genuine(15), boss: { points: 9, correct: 0, wrong: 0 } })).toMatchObject({ points: 90, stamp: 'bronze' });
  });

  it('rating is capped at 100% and never negative; unfinished chapters have no stamp', () => {
    const over: ScenarioRecord = { id: 'x', scored: true, points: 30, maxPoints: 15, stars: 3, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleCheckedHarmless: false, pattern: null };
    expect(summarise(B, berlin, [over], true).rating).toBe(100);
    expect(summarise(B, berlin, [{ ...over, points: -5 }], true).rating).toBe(0);
    expect(summarise(B, berlin, [over], false).stamp).toBeNull();
  });

  it('drills and arc beats never count', () => {
    const drill: ScenarioRecord = { id: 'd', scored: false, points: 99, maxPoints: 15, stars: null, correctTags: 5, wrongTags: 0, redFlags: 5, genuineReported: 1, doubleCheckedHarmless: true, pattern: null };
    expect(summarise(B, berlin, [drill], true)).toMatchObject({ points: 0, max: 0, spotted: 0, redFlags: 0, genuineReported: 0 });
  });
});

describe('chapter sequence and unlocking', () => {
  const chapter = { scenario_order: { am: ['a1', 'a2', 'echo'], pm: ['p1', 'boss'] } };
  it('morning then afternoon, stop point after the morning, messages left counts scenarios', () => {
    expect(sequenceOf(chapter).map((e) => e.half)).toEqual(['am', 'am', 'am', 'pm', 'pm']);
    expect(isStopPointAfter(chapter, 2)).toBe(true);
    expect(isStopPointAfter(chapter, 1)).toBe(false);
    expect(messagesLeft(chapter, 1)).toEqual({ today: 4, thisHalf: 2 });
  });
  it('skips echoes whose requires_flags are not set', () => {
    const req = (id: string) => (id === 'echo' ? ['kettle_hacked'] : []);
    expect(nextIndex(chapter, 2, req, new Set())).toBe(3);
    expect(nextIndex(chapter, 2, req, new Set(['kettle_hacked']))).toBe(2);
    expect(nextIndex(chapter, 5, req, new Set())).toBe(-1);
  });
  it('home, then Berlin, then free choice of slots 2–9, finale after all of them; never score-gated', () => {
    const chapters = [
      { city: 'home', slot: 0 },
      { city: 'berlin', slot: 1 },
      { city: 'amsterdam', slot: 2 },
      { city: 'paris', slot: 3 },
      { city: 'brussels', slot: 10 },
    ];
    expect(unlockedChapters(chapters, new Set())).toEqual(['home']);
    expect(unlockedChapters(chapters, new Set(['home']))).toEqual(['home', 'berlin']);
    expect(unlockedChapters(chapters, new Set(['home', 'berlin']))).toEqual(['home', 'berlin', 'amsterdam', 'paris']);
    expect(unlockedChapters(chapters, new Set(['home', 'berlin', 'paris', 'amsterdam']))).toContain('brussels');
  });
});
