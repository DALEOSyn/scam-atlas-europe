import { describe, expect, it } from 'vitest';
import { bestScore, resolveAction } from '../../src/engine/outcome.ts';
import { loadExample } from './helpers.ts';

describe('engine/outcome', () => {
  const s = loadExample();

  it('resolves an action to its outcome and score', () => {
    const r = resolveAction(s, 'tap_link');
    expect(r?.outcome.narrative).toMatch(/payments you don't recognise/);
    expect(r?.score).toBe(-10);
    expect(r?.best).toBe(false);
  });

  it('marks the verification habit as the best choice', () => {
    expect(bestScore(s)).toBe(15);
    expect(resolveAction(s, 'open_app')?.best).toBe(true);
  });

  it('returns undefined for unknown actions', () => {
    expect(resolveAction(s, 'nope')).toBeUndefined();
  });
});
