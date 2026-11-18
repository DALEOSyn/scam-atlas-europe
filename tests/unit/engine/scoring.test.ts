import { describe, expect, it } from 'vitest';
import type { ActionClass } from '../../../src/content/schema.ts';
import {
  groupEarnsTagBonus,
  isFall,
  maxPointsOf,
  mergeDecision,
  scoreGroup,
  tagBonus,
  truthOf,
  type Decision,
  type Truth,
} from '../../../src/engine/scoring.ts';
import { B } from './helpers.ts';

const d = (cls: ActionClass, override?: number): Decision => ({ cls, kind: 'ignore', actionId: cls, ...(override !== undefined ? { override } : {}) });
const plain = { engagedOnFraud: false, timerExpired: false };

describe('star table (GDD §7.1, balance stars)', () => {
  const cases: [ActionClass, Truth, number, number][] = [
    ['verify', 'fraud', 3, 15],
    ['verify', 'legit_high', 3, 15],
    ['verify', 'legit_low', 3, 15],
    ['proceed', 'legit_high', 3, 15],
    ['proceed', 'legit_low', 3, 15],
    ['report', 'fraud', 2, 10],
    ['report', 'legit_high', 0, -5],
    ['report', 'legit_low', 0, -5],
    ['dismiss', 'fraud', 2, 10],
    ['dismiss', 'legit_high', 0, 0],
    ['dismiss', 'legit_low', 2, 10],
    ['engage', 'legit_high', 2, 10],
    ['engage', 'legit_low', 2, 10],
    ['comply', 'legit_high', 1, 5],
  ];
  it.each(cases)('%s on %s: %i stars, %i points', (cls, truth, stars, points) => {
    expect(scoreGroup(B, truth, d(cls), plain)).toMatchObject({ stars, points, fell: false });
  });

  it('comply or proceed on fraud is a fall scored 0 here (damage control adds points later)', () => {
    for (const cls of ['comply', 'proceed'] as const) {
      expect(isFall(cls, 'fraud')).toBe(true);
      expect(scoreGroup(B, 'fraud', d(cls), plain)).toMatchObject({ stars: 0, points: 0, fell: true });
    }
    expect(isFall('comply', 'legit_high')).toBe(false);
  });

  it('engage earlier in the group caps fraud at ★★ even after a verify', () => {
    expect(scoreGroup(B, 'fraud', d('verify'), { engagedOnFraud: true, timerExpired: false })).toMatchObject({ stars: 2, points: 10, capped: true });
  });

  it('timer expiry scores as dismiss, ignoring the override', () => {
    expect(scoreGroup(B, 'fraud', d('verify', 99), { engagedOnFraud: false, timerExpired: true })).toMatchObject({ cls: 'dismiss', stars: 2, points: 10, timerExpired: true });
    expect(scoreGroup(B, 'legit_high', undefined, { engagedOnFraud: false, timerExpired: true })).toMatchObject({ stars: 0, points: 0 });
  });

  it('an authored score override replaces the points, not the stars', () => {
    expect(scoreGroup(B, 'fraud', d('report', 7), plain)).toMatchObject({ stars: 2, points: 7 });
  });
});

describe('truth', () => {
  it('fraud, legit_high, legit_low', () => {
    expect(truthOf({ is_fraud: true, stakes: undefined })).toBe('fraud');
    expect(truthOf({ is_fraud: false, stakes: 'high' })).toBe('legit_high');
    expect(truthOf({ is_fraud: false, stakes: 'low' })).toBe('legit_low');
  });
});

describe('decisive action (GDD §6)', () => {
  it('verify stands unless followed by comply/proceed on fraud', () => {
    expect(mergeDecision(d('verify'), d('dismiss'), 'fraud', false)?.cls).toBe('verify');
    expect(mergeDecision(d('verify'), d('report'), 'fraud', false)?.cls).toBe('verify');
    expect(mergeDecision(d('verify'), d('comply'), 'fraud', false)?.cls).toBe('comply');
    expect(mergeDecision(d('verify'), d('proceed'), 'fraud', false)?.cls).toBe('proceed');
  });
  it('verify on genuine is replaced only by report', () => {
    expect(mergeDecision(d('verify'), d('proceed'), 'legit_high', false)?.cls).toBe('verify');
    expect(mergeDecision(d('verify'), d('report'), 'legit_low', false)?.cls).toBe('report');
  });
  it('engage on fraud and meta never decide; otherwise the latest action decides', () => {
    expect(mergeDecision(undefined, d('engage'), 'fraud', false)).toBeUndefined();
    expect(mergeDecision(d('dismiss'), d('meta'), 'fraud', false)?.cls).toBe('dismiss');
    expect(mergeDecision(d('engage'), d('comply'), 'legit_high', false)?.cls).toBe('comply');
  });
});

describe('tag bonus (balance tags)', () => {
  it('+2 per red flag, capped at 6', () => {
    expect(tagBonus(B, 2, 0)).toEqual({ bonus: 4, voided: false });
    expect(tagBonus(B, 5, 0)).toEqual({ bonus: 6, voided: false });
  });
  it('voided to 0 by any wrong tag', () => {
    expect(tagBonus(B, 3, 1)).toEqual({ bonus: 0, voided: true });
  });
  it('applies only to verify, report or dismiss endings, never on timer expiry', () => {
    const g = (cls: ActionClass, timerExpired = false) => scoreGroup(B, 'fraud', d(cls), { engagedOnFraud: false, timerExpired });
    expect(groupEarnsTagBonus(B, g('verify'))).toBe(true);
    expect(groupEarnsTagBonus(B, g('report'))).toBe(true);
    expect(groupEarnsTagBonus(B, g('dismiss'))).toBe(true);
    expect(groupEarnsTagBonus(B, g('comply'))).toBe(false);
    expect(groupEarnsTagBonus(B, g('verify', true))).toBe(false);
  });
  it('max points: 15 + min(6, 2R) on fraud, 15 on genuine, boss 3 × 15 + 6 = 51', () => {
    expect(maxPointsOf(B, 1, true, 2)).toBe(19);
    expect(maxPointsOf(B, 1, false, 0)).toBe(15);
    expect(maxPointsOf(B, 3, true, 4)).toBe(B.multi_step.boss.max_points);
  });
});
