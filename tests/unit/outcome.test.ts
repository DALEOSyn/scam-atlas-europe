import { describe, expect, it } from 'vitest';
import { actionsOf, resolveAction, scoreAction } from '../../src/engine/outcome.ts';
import { truthOf } from '../../src/engine/scoring.ts';
import { loadBalanceFile, loadExample } from './helpers.ts';

describe('engine/outcome', () => {
  const s = loadExample();
  const table = loadBalanceFile();

  it('follows next_beat to the follow-up beat', () => {
    const step = resolveAction(s, table, 'start', 'tap_link');
    expect(step?.kind).toBe('beat');
    expect(step?.kind === 'beat' ? step.beat.id : '').toBe('fee_page');
    expect(actionsOf(s, 'fee_page').map((a) => a.id)).toEqual(['enter_card', 'close_page']);
  });

  it('scores a fall on fraud with 0 stars from the star table', () => {
    const step = resolveAction(s, table, 'fee_page', 'enter_card');
    if (step?.kind !== 'outcome') throw new Error('expected an outcome');
    expect(step.result.outcome.narrative).toMatch(/payments you don't recognise/);
    expect(step.result.stars).toBe(0);
    expect(step.result.score).toBe(0);
    expect(step.result.best).toBe(false);
  });

  it('marks the verification habit as the best choice (3 stars x per_star)', () => {
    const step = resolveAction(s, table, 'start', 'open_app');
    if (step?.kind !== 'outcome') throw new Error('expected an outcome');
    expect(step.result.stars).toBe(3);
    expect(step.result.score).toBe(3 * table.points.per_star);
    expect(step.result.best).toBe(true);
    const report = resolveAction(s, table, 'start', 'delete_report');
    expect(report?.kind === 'outcome' ? report.result.stars : -1).toBe(2);
  });

  it('honours a score override', () => {
    const report = s.actions.find((x) => x.kind === 'report');
    if (!report) throw new Error('example has a report action');
    const a = { ...report, score: 7, score_reason: 'test' };
    expect(scoreAction(s, table, a)).toEqual({ stars: 2, score: 7 });
  });

  it('truth: fraud, legit_high, legit_low', () => {
    expect(truthOf({ is_fraud: true, stakes: undefined })).toBe('fraud');
    expect(truthOf({ is_fraud: false, stakes: 'high' })).toBe('legit_high');
    expect(truthOf({ is_fraud: false, stakes: 'low' })).toBe('legit_low');
  });

  it('returns undefined for unknown actions or actions of another beat', () => {
    expect(resolveAction(s, table, 'start', 'nope')).toBeUndefined();
    expect(resolveAction(s, table, 'start', 'enter_card')).toBeUndefined();
  });
});
