/**
 * Pushy follow-ups (GDD §8, balance `pushers`). Pure and deterministic.
 *
 * Every pusher, genuine or fraud, fires on its authored schedule (`at_seconds`).
 * Stress shortens the gap before the next message by the same factor for
 * genuine and fraud (balance `stress_interval_scale`), using the stress state
 * at the moment the previous message fired (the scenario start for the first).
 * Given the same sequence of stress states, the schedule is always the same.
 * With the "Pushy follow-ups" setting off (or the Calm preset) nothing fires.
 */
import type { Balance } from '../content/schema.ts';
import type { StressState } from './stress.ts';

export interface PusherMessage {
  at_seconds: number;
  text: string;
}

export interface PusherState {
  /** Messages already shown, with the scenario-clock time they fired. */
  fired: { index: number; at: number }[];
  /** Scenario-clock time the next message fires; null when done or disabled. */
  nextDue: number | null;
}

type PusherTable = Pick<Balance, 'pushers'>;

export function scaleFor(b: PusherTable, state: StressState): number {
  return b.pushers.stress_interval_scale[state];
}

/** Gap between authored message i-1 and i (message 0: from the scenario start). */
function gap(messages: readonly PusherMessage[], i: number): number {
  const prev = i === 0 ? 0 : (messages[i - 1]?.at_seconds ?? 0);
  return Math.max(0, (messages[i]?.at_seconds ?? prev) - prev);
}

export function startPushers(b: PusherTable, messages: readonly PusherMessage[], enabled: boolean, state: StressState, now = 0): PusherState {
  if (!enabled || messages.length === 0) return { fired: [], nextDue: null };
  return { fired: [], nextDue: now + gap(messages, 0) * scaleFor(b, state) };
}

/**
 * Fire the next message at time `at` and schedule the one after, scaled by
 * the stress state *after* this message's own stress was applied.
 */
export function firePusher(b: PusherTable, messages: readonly PusherMessage[], p: PusherState, at: number, stateAfter: StressState): PusherState {
  const index = p.fired.length;
  if (index >= messages.length || p.nextDue === null) return p;
  const fired = [...p.fired, { index, at }];
  const next = index + 1;
  return { fired, nextDue: next < messages.length ? at + gap(messages, next) * scaleFor(b, stateAfter) : null };
}

/** The pure schedule (no stress changes in between): used by tests and by QA tooling. */
export function plannedSchedule(b: PusherTable, messages: readonly PusherMessage[], state: StressState): number[] {
  let p = startPushers(b, messages, true, state);
  const out: number[] = [];
  while (p.nextDue !== null) {
    out.push(p.nextDue);
    p = firePusher(b, messages, p, p.nextDue, state);
  }
  return out;
}
