/**
 * Pure game logic for a single scenario. No DOM, no I/O: unit-testable.
 */
import type { Action, Outcome, Scenario } from '../content/schema.ts';

export interface Resolution {
  action: Action;
  outcome: Outcome;
  score: number;
  /** True when the player picked the highest-scoring action (the habit we teach). */
  best: boolean;
}

export function bestScore(s: Scenario): number {
  return Math.max(...s.actions.map((a) => a.score));
}

export function resolveAction(s: Scenario, actionId: string): Resolution | undefined {
  const action = s.actions.find((a) => a.id === actionId);
  if (!action) return undefined;
  const outcome = s.outcomes[action.outcome];
  if (!outcome) return undefined;
  return { action, outcome, score: action.score, best: action.score === bestScore(s) };
}
