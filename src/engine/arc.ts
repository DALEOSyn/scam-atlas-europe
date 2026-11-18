/**
 * The Alex arc (GDD §10). Pure. Flags and arc variables are snake_case
 * (dotted names read as domains to the red-line linter).
 *
 * - Outcomes' `sets_flags` set game flags (echo scenarios read them via `requires_flags`).
 * - Arc outcomes' `arc_effects`: numbers accumulate (alex_invested += 50), booleans are set.
 * - Arc points are banked silently and never feed a chapter rating or stamp.
 * - The arc closes at a report, at "Tell me now", at a second "Close the app"
 *   (an `ignore` on the slot-1 beat), or at the finale. Ending rule: first match wins.
 */
import type { ScenarioResult } from './result.ts';

/** The arc variable that holds money put in (GDD §10.3 `alex.invested`, snake_case). */
export const ARC_INVESTED = 'alex_invested';

export interface ArcState {
  vars: Record<string, number | boolean>;
  closes: number;
  tellMeNow: boolean;
  reportedAtSlot: number | null;
  closed: boolean;
  /** Banked silently for the finale timeline. */
  points: number;
  /** Red-flag timeline: arc slots played, in order. */
  timeline: number[];
}

export const EMPTY_ARC: ArcState = { vars: {}, closes: 0, tellMeNow: false, reportedAtSlot: null, closed: false, points: 0, timeline: [] };

export function applyArcEffects(vars: Readonly<Record<string, number | boolean>>, effects: Readonly<Record<string, number | boolean>>): Record<string, number | boolean> {
  const out = { ...vars };
  for (const [k, v] of Object.entries(effects)) {
    const prev = out[k];
    out[k] = typeof v === 'number' ? (typeof prev === 'number' ? prev : 0) + v : v;
  }
  return out;
}

/** Fold one arc beat's result into the arc. `decisiveKind` is the decisive action kind. */
export function applyArcBeat(arc: ArcState, slot: number, r: ScenarioResult, decisiveKind: string | undefined): ArcState {
  if (arc.closed) return arc;
  const vars = applyArcEffects(arc.vars, r.arcEffects);
  const closes = arc.closes + (slot === 1 && decisiveKind === 'ignore' ? 1 : 0);
  const reported = decisiveKind === 'report' ? slot : null;
  const next: ArcState = {
    ...arc,
    vars,
    closes,
    reportedAtSlot: arc.reportedAtSlot ?? reported,
    points: arc.points + r.points,
    timeline: [...arc.timeline, slot],
  };
  return { ...next, closed: next.reportedAtSlot !== null || closes >= 2 };
}

export function tellMeNow(arc: ArcState): ArcState {
  return { ...arc, tellMeNow: true, closed: true };
}

/** Did the slot-1 beat get closed once (Alex messages once more next chapter)? */
export function arcPaused(arc: ArcState): boolean {
  return arc.closes === 1 && !arc.closed;
}

export type ArcEnding = 'R' | 'C' | 'A_prime' | 'A' | 'B';

/** GDD §10.3, ordered; the first match wins. Evaluated when the arc closes (or at the finale). */
export function arcEnding(arc: ArcState): ArcEnding {
  const invested = arc.vars[ARC_INVESTED];
  if (arc.tellMeNow) return 'R';
  if (typeof invested === 'number' && invested > 0) return 'C';
  if (arc.closes >= 2) return 'A_prime';
  if (arc.reportedAtSlot !== null && arc.reportedAtSlot <= 6) return 'A';
  return 'B';
}

/** Ending R with money in also plays C's damage control and recovery-agency test. */
export function endingPlaysRecovery(arc: ArcState): boolean {
  const invested = arc.vars[ARC_INVESTED];
  return typeof invested === 'number' && invested > 0;
}

export function setFlags(flags: readonly string[], add: readonly string[]): string[] {
  return [...new Set([...flags, ...add])];
}
