/**
 * Pure game logic for a single scenario. No DOM, no I/O: unit-testable.
 *
 * Minimal engine for the schema migration (T-2.2): follows next_beat, scores
 * the terminal action from the balance.yaml star table. Tags, recovery
 * scoring, timers, interrupts and boss summing are later engine tasks.
 */
import type { Action, Beat, Outcome, Scenario } from '../content/schema.ts';
import { classOf, starsFor, truthOf, type ScoringTable } from './scoring.ts';

export interface Resolution {
  action: Action;
  outcome: Outcome;
  /** 0–3 from the star table; undefined for unscored (meta) actions. */
  stars: number | undefined;
  /** Points: the action's override, else stars × points.per_star. */
  score: number;
  /** True when the decisive action earns full stars (the habit we teach). */
  best: boolean;
}

export type Step = { kind: 'beat'; beat: Beat } | { kind: 'outcome'; result: Resolution };

/** The actions shown on a beat ('start' is the opening message). */
export function actionsOf(s: Scenario, beatId: string): Action[] {
  if (beatId === 'start') return s.actions;
  return s.beats.find((b) => b.id === beatId)?.actions ?? [];
}

export function scoreAction(s: Scenario, table: ScoringTable, action: Action): { stars: number | undefined; score: number } {
  const st = starsFor(table, classOf(table, action.kind), truthOf(s));
  const stars = typeof st === 'number' ? st : undefined;
  return { stars, score: action.score ?? (stars ?? 0) * table.points.per_star };
}

export function resolveAction(s: Scenario, table: ScoringTable, beatId: string, actionId: string): Step | undefined {
  const action = actionsOf(s, beatId).find((a) => a.id === actionId);
  if (!action) return undefined;
  if (action.next_beat !== undefined) {
    const beat = s.beats.find((b) => b.id === action.next_beat);
    return beat ? { kind: 'beat', beat } : undefined;
  }
  const outcome = action.outcome === undefined ? undefined : s.outcomes[action.outcome];
  if (!outcome) return undefined;
  const { stars, score } = scoreAction(s, table, action);
  return { kind: 'outcome', result: { action, outcome, stars, score, best: stars === 3 } };
}
