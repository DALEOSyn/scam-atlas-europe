/**
 * Star table lookups (balance.yaml `action_kinds`, `stars`, `points`). Pure;
 * shared by the engine and the content validator (scripts/lib/rules.ts).
 */
import type { ActionClass, ActionKind, Balance, Scenario } from '../content/schema.ts';

export type Truth = 'fraud' | 'legit_high' | 'legit_low';

/** The parts of balance.yaml the scoring needs. */
export type ScoringTable = Pick<Balance, 'action_kinds' | 'stars' | 'points'>;

export function truthOf(s: Pick<Scenario, 'is_fraud' | 'stakes'>): Truth {
  if (s.is_fraud) return 'fraud';
  return s.stakes === 'high' ? 'legit_high' : 'legit_low';
}

export function classOf(table: Pick<Balance, 'action_kinds'>, kind: ActionKind): ActionClass {
  return table.action_kinds[kind].class;
}

/** Stars for a class on a truth; undefined for unscored meta actions. */
export function starsFor(
  table: Pick<Balance, 'stars'>,
  cls: ActionClass,
  truth: Truth,
): number | 'non_terminal' | 'not_allowed' | undefined {
  if (cls === 'meta') return undefined;
  return table.stars[cls][truth];
}
