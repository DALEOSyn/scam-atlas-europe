/**
 * Pushy follow-ups (GDD §8, balance `pushers`). Pure and deterministic.
 *
 * Every pusher, genuine or fraud, fires on its authored schedule (`at_seconds`).
 * Stress shortens the gap before the next message by the same factor for
 * genuine and fraud (balance `stress_interval_scale`), using the stress state
 * at the moment the previous message fired (the beat start for the first).
 * Given the same sequence of stress states, the schedule is always the same.
 * With the "Pushy follow-ups" setting off (or the Calm preset) nothing fires.
 *
 * Boss beats (T-2.8, QA M2): each follow-up belongs to one scheduled beat (the
 * last beat scheduled at or before its `at_seconds`) and is
 * timed from the moment that beat's group starts on screen, not from the
 * scenario clock. A beat's follow-ups only run while its group is live: they
 * stop when the beat ends (resolved, or hung up) and never fire during the
 * fast-forward between boss beats.
 */
import type { Balance } from '../content/schema.ts';
import type { StressState } from './stress.ts';

export interface PusherMessage {
  at_seconds: number;
  text: string;
}

/** One follow-up placed on its beat: seconds after that beat's group starts. */
export interface PusherPlan {
  beat: string;
  offset: number;
}

export interface PusherState {
  /** Messages already shown, with the scenario-clock time they fired. */
  fired: { index: number; at: number }[];
  /** Scenario-clock time the next message fires; null when done, disabled or between beats. */
  nextDue: number | null;
  /** Index of the next message to consider (earlier ones fired or were skipped with their beat). */
  cursor: number;
  /** Follow-ups are on (setting). */
  enabled: boolean;
}

type PusherTable = Pick<Balance, 'pushers'>;

export function scaleFor(b: PusherTable, state: StressState): number {
  return b.pushers.stress_interval_scale[state];
}

/**
 * Place each follow-up on a scheduled beat. `schedule` is the scenario's beat schedule
 * (`{ beatId, at }`, ascending): the last beat at or before `at_seconds`.
 */
export function planPushers(messages: readonly PusherMessage[], schedule: readonly { beatId: string; at: number }[]): PusherPlan[] {
  return messages.map((m) => {
    const owner = [...schedule].reverse().find((x) => x.at <= m.at_seconds) ?? schedule[0] ?? { beatId: 'start', at: 0 };
    return { beat: owner.beatId, offset: Math.max(0, m.at_seconds - owner.at) };
  });
}

/** Gap before message i: from the previous message of the same beat, or from the beat start. */
function gap(plan: readonly PusherPlan[], i: number): number {
  const cur = plan[i];
  if (!cur) return 0;
  const prev = plan[i - 1];
  const from = prev && prev.beat === cur.beat ? prev.offset : 0;
  return Math.max(0, cur.offset - from);
}

/** Arm the follow-ups of `beat`, whose group starts at `now`. Earlier beats' unfired messages are skipped. */
export function armBeat(b: PusherTable, plan: readonly PusherPlan[], p: PusherState, beat: string, now: number, state: StressState): PusherState {
  if (!p.enabled) return p;
  let cursor = p.cursor;
  const first = plan.findIndex((x, i) => i >= cursor && x.beat === beat);
  if (first < 0) return { ...p, nextDue: null };
  cursor = first;
  return { ...p, cursor, nextDue: now + gap(plan, cursor) * scaleFor(b, state) };
}

/** The beat ended: its remaining follow-ups never fire. */
export function stopPushers(p: PusherState): PusherState {
  return p.nextDue === null ? p : { ...p, nextDue: null };
}

export function startPushers(b: PusherTable, plan: readonly PusherPlan[], enabled: boolean, state: StressState, now = 0): PusherState {
  const p: PusherState = { fired: [], nextDue: null, cursor: 0, enabled: enabled && plan.length > 0 };
  return armBeat(b, plan, p, 'start', now, state);
}

/**
 * Fire the next message at time `at` and schedule the one after (same beat only), scaled by
 * the stress state *after* this message's own stress was applied.
 */
export function firePusher(b: PusherTable, plan: readonly PusherPlan[], p: PusherState, at: number, stateAfter: StressState): PusherState {
  const index = p.cursor;
  const cur = plan[index];
  if (!cur || p.nextDue === null) return p;
  const fired = [...p.fired, { index, at }];
  const next = index + 1;
  const sameBeat = plan[next]?.beat === cur.beat;
  return { ...p, fired, cursor: next, nextDue: sameBeat ? at + gap(plan, next) * scaleFor(b, stateAfter) : null };
}

/** Single-beat plan (every message on the opening). */
export function openingPlan(messages: readonly PusherMessage[]): PusherPlan[] {
  return messages.map((m) => ({ beat: 'start', offset: m.at_seconds }));
}

/** The pure schedule of a single-beat scenario (no stress changes in between): used by tests and by QA tooling. */
export function plannedSchedule(b: PusherTable, messages: readonly PusherMessage[], state: StressState): number[] {
  const plan = openingPlan(messages);
  let p = startPushers(b, plan, true, state);
  const out: number[] = [];
  while (p.nextDue !== null) {
    out.push(p.nextDue);
    p = firePusher(b, plan, p, p.nextDue, state);
  }
  return out;
}
