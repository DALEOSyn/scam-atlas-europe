/**
 * Scenario timers (GDD §8, balance `timers`). Pure.
 *
 * - Length is set by chapter slot for every timed scenario, genuine or fraud.
 *   Boss beats use `boss_beat`; call beats use `call_beat` (a call beat inside a
 *   boss also uses `call_beat`: "every call beat, genuine or fraud").
 * - Mode multiplies the length (and the escalation bonus): standard ×1,
 *   extended ×2, off = no timer. Calm preset = off.
 * - First expiry: escalate, +escalation_extra_seconds. Second: scored as dismiss.
 */
import type { Balance } from '../content/schema.ts';

export type TimerMode = 'standard' | 'extended' | 'off';
export type TimerKind = 'slot' | 'boss_beat' | 'call_beat';
type TimerTable = Pick<Balance, 'timers'>;

export interface TimerState {
  /** Seconds left (never below 0). */
  remaining: number;
  /** Full length of the current run, for "half time" announcements. */
  length: number;
  expiries: 0 | 1 | 2;
}

export function modeFactor(b: TimerTable, mode: TimerMode): number | null {
  return b.timers.modes[mode];
}

/** Base length in seconds for a timed segment, or null when timers are off. */
export function timerLength(b: TimerTable, slot: number, kind: TimerKind, mode: TimerMode): number | null {
  const f = modeFactor(b, mode);
  if (f === null) return null;
  const base = kind === 'boss_beat' ? b.timers.boss_beat : kind === 'call_beat' ? b.timers.call_beat : b.timers.by_slot[String(slot)];
  if (base === undefined) throw new Error(`balance.yaml timers.by_slot has no entry for slot ${slot}`);
  return base * f;
}

export function startTimer(length: number): TimerState {
  return { remaining: length, length, expiries: 0 };
}

export type TimerEvent = 'escalated' | 'expired' | 'half' | 'ten_left';

/**
 * Advance by dt seconds (callers skip this while frozen). Returns the events
 * crossed in this step; at most one expiry is processed per call.
 */
export function tickTimer(b: TimerTable, t: TimerState, dt: number, mode: TimerMode): { timer: TimerState; events: TimerEvent[] } {
  if (t.expiries === 2 || dt <= 0) return { timer: t, events: [] };
  const events: TimerEvent[] = [];
  const before = t.remaining;
  const after = Math.max(0, before - dt);
  if (before > t.length / 2 && after <= t.length / 2 && after > 0) events.push('half');
  if (before > 10 && after <= 10 && after > 0) {
    // One announcement when half time and "10 s left" fall in the same step (QA E5).
    if (events[events.length - 1] === 'half') events.pop();
    events.push('ten_left');
  }
  if (after > 0) return { timer: { ...t, remaining: after }, events };
  if (t.expiries === 0) {
    const extra = b.timers.escalation_extra_seconds * (modeFactor(b, mode) ?? 1);
    return { timer: { remaining: extra, length: extra, expiries: 1 }, events: [...events, 'escalated'] };
  }
  return { timer: { ...t, remaining: 0, expiries: 2 }, events: [...events, 'expired'] };
}

/** Deduct a cost (first check of an element, pause). Never expires the timer by itself: it leaves at least 1 s. */
export function chargeTimer(t: TimerState, seconds: number): TimerState {
  if (t.expiries === 2 || seconds <= 0) return t;
  return { ...t, remaining: Math.max(Math.min(t.remaining, 1), t.remaining - seconds) };
}

/** Onboarding default (balance `timers.default_mode`): extended when the device asks for reduced motion. */
export function defaultTimerMode(prefersReducedMotion: boolean): TimerMode {
  return prefersReducedMotion ? 'extended' : 'standard';
}
