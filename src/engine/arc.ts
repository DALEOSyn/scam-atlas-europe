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
import { ARC_TOLD_KINDS, ARC_TOLD_SOMEONE } from '../content/constants.ts';
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
  /** CR-43(c): the decisive action kind per arc slot played (latest per slot), for the timeline's choice wording. */
  choices: { slot: number; kind: string }[];
  /**
   * CR-43: the finale block, fixed on entry (§30.6 "evaluated on entry"): its ending, the steps it plays and the
   * next step to play (a quit mid-block resumes there). Done when `step` reaches the end of `steps`.
   */
  finale: { ending: ArcEnding; steps: FinaleStep[]; step: number } | null;
}

export const EMPTY_ARC: ArcState = { vars: {}, closes: 0, tellMeNow: false, reportedAtSlot: null, closed: false, points: 0, timeline: [], choices: [], finale: null };

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
    choices: [...arc.choices.filter((c) => c.slot !== slot), { slot, kind: decisiveKind ?? 'timer_expiry' }],
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
/** Every ending id (mirrors ARC_ENDINGS in schema.ts; no Zod at runtime). */
export const ARC_ENDING_IDS: readonly ArcEnding[] = ['A', 'A_prime', 'B', 'C', 'R'];

/** GDD §10.3, ordered; the first match wins. Evaluated when the arc closes (or at the finale). */
export function arcEnding(arc: ArcState): ArcEnding {
  const invested = arc.vars[ARC_INVESTED];
  if (arc.tellMeNow) return 'R';
  if (typeof invested === 'number' && invested > 0) return 'C';
  if (arc.closes >= 2) return 'A_prime';
  if (arc.reportedAtSlot !== null && arc.reportedAtSlot <= 6) return 'A';
  return 'B';
}

/**
 * CR-51 (R25(5)): game flags the engine sets for an arc slot beat. Any slot decided by `report` or `ask_someone`
 * sets ARC_TOLD_SOMEONE, so ending lines that say "you told someone" are true for players who did it earlier in the
 * arc (not only at the close beat or in Teo's chat).
 */
export function arcSlotFlags(decisiveKind: string | undefined): string[] {
  return decisiveKind !== undefined && ARC_TOLD_KINDS.includes(decisiveKind) ? [ARC_TOLD_SOMEONE] : [];
}

export function setFlags(flags: readonly string[], add: readonly string[]): string[] {
  return [...new Set([...flags, ...add])];
}

// ---------------------------------------------------------------------------
// CR-43(f), CR-49 (R25(1)): arc slots play in slot order

/** The last arc slot before the finale (slot 9 is the climax the close beat reuses). */
export const LAST_ARC_SLOT = 9;

/**
 * The arc slot that plays in a chapter at this play position (Home 0, Berlin 1, the middle chapters 2–9 in the
 * order first started; the finale 10 has none). CR-49 (R25(1)): the next arc beat is the lowest slot not yet
 * played, whatever the position, so interleaved runs (start Amsterdam, leave before its arc beat, finish Paris; the middle chapters unlock after Berlin)
 * still play the arc in order: slot 1 first, slot 9 last. After one "Close the app" at slot 1 (GDD §10.2) the
 * next arc beat is the slot-1 repeat, once (timeline exactly [1]); slot 2 is then skipped (accepted, R22, R25(2)).
 * Never above 9. null: no arc beat here (Home, the finale, a closed arc, every slot played). A replayed
 * (finished) chapter never plays an arc beat: the caller passes null for it (`arcSlotForRun`).
 */
export function arcSlotAt(arc: ArcState, position: number | null): number | null {
  if (arc.closed || position === null || position < 1 || position > LAST_ARC_SLOT) return null;
  // QA B1: the paused slot-1 repeat is offered once, as the next arc beat after the first Close.
  if (arcPaused(arc) && arc.timeline.length === 1 && arc.timeline[0] === 1) return 1;
  const played = new Set(arc.timeline);
  // The slot-1 repeat took slot 2's place: slot 2 is skipped (R22).
  if (arc.timeline.filter((x) => x === 1).length > 1) played.add(2);
  for (let slot = 1; slot <= LAST_ARC_SLOT; slot++) if (!played.has(slot)) return slot;
  return null;
}

/** The arc slot for a chapter run: none in a replayed (finished) chapter (QA B1), else `arcSlotAt` its position. */
export function arcSlotForRun(arc: ArcState, chapter: { finished: boolean; position: number | null }): number | null {
  return chapter.finished ? null : arcSlotAt(arc, chapter.position);
}

// ---------------------------------------------------------------------------
// CR-43: the arc finale block (GDD §30.6)

export type FinaleStep = 'close' | 'reveal' | 'damage_control' | 'recovery_offer' | 'teo' | 'timeline';

function invested(arc: ArcState): boolean {
  const v = arc.vars[ARC_INVESTED];
  return typeof v === 'number' && v > 0;
}

/**
 * GDD §30.6 dispatch from the saved arc state on entering the finale (first match wins, §10.3 order):
 * - open, invested: close beat → arc damage control → recovery-agency test → timeline (C);
 * - open, nothing invested: close beat → timeline walk-through (B);
 * - closed by "Tell me now": arc damage control → recovery-agency test (invested), or Teo's chat → timeline (R;
 *   R22: GDD §10.3 wins over the §30.6 table, R with money in plays C's damage control too);
 * - closed by a second Close (A′), or reported at slot ≤ 6 with nothing invested (A): Teo's chat → timeline;
 * - reported at slot 7–9 (or earlier with money in): the reveal → (invested: arc damage control → recovery-agency
 *   test) → timeline (B or C). Damage control at the report itself is not built, so it runs here (CR-43(e)).
 * The recovery-agency test plays for every ending with money in (CR-43(e)). The ending is §10.3's.
 */
export function finalePlan(arc: ArcState): { ending: ArcEnding; steps: FinaleStep[] } {
  const money = invested(arc);
  const ending = arcEnding(arc);
  const recovery: FinaleStep[] = money ? ['damage_control', 'recovery_offer'] : [];
  let steps: FinaleStep[];
  if (!arc.closed) steps = ['close', ...recovery];
  else if (arc.tellMeNow) steps = money ? recovery : ['teo'];
  else if (arc.closes >= 2) steps = money ? ['reveal', ...recovery] : ['teo'];
  else if (arc.reportedAtSlot !== null && arc.reportedAtSlot <= 6 && !money) steps = ['teo'];
  else steps = ['reveal', ...recovery];
  return { ending, steps: [...steps, 'timeline'] };
}

/** Enter the finale: the arc closes and its ending and steps are fixed (evaluated on entry, §30.6). Idempotent. */
export function enterFinale(arc: ArcState): ArcState {
  if (arc.finale) return arc;
  const plan = finalePlan(arc);
  return { ...arc, closed: true, finale: { ending: plan.ending, steps: plan.steps, step: 0 } };
}

/** The finale step to play now; null before the finale and once it is done. */
export function finaleStep(arc: ArcState): FinaleStep | null {
  return arc.finale?.steps[arc.finale.step] ?? null;
}

/** The current step is over: move to the next one (only from `from`, so a double tap cannot skip a step). */
export function advanceFinale(arc: ArcState, from: FinaleStep): ArcState {
  if (!arc.finale || finaleStep(arc) !== from) return arc;
  return { ...arc, finale: { ...arc.finale, step: arc.finale.step + 1 } };
}

export function finaleDone(arc: ArcState): boolean {
  return !!arc.finale && arc.finale.step >= arc.finale.steps.length;
}

/** Arc points from the finale's steps (damage control, the recovery-agency test), banked silently (§10.2). */
export function bankArcPoints(arc: ArcState, points: number): ArcState {
  return { ...arc, points: arc.points + Math.max(0, points) };
}

/**
 * CR-43(c), GDD §30.6 (psych M3): the fixed wording of the player's choice on one timeline slot, by kind. Keys in
 * content/i18n (timeline_choice_*): pay "{name} asked for money, and you sent some." · reply (and other ways of
 * going along) "{name} pushed, and you went along." (a reply at slot 1: "You replied. Nothing wrong with that.") · ignore and other ways of leaving it "You stepped back from
 * it." · ask_someone "You asked someone." · report "You reported it." · check_official_list / verify_identity
 * (and other checks) "You checked."
 */
export type TimelineChoice = 'paid' | 'went_along' | 'replied' | 'stepped_back' | 'asked' | 'reported' | 'checked';

const PAID_KINDS = ['pay', 'pay_unprotected', 'pay_protected'];
const ALONG_KINDS = ['reply', 'open_link', 'call_number_in_message', 'scan_qr_and_open', 'enter_details', 'share_code', 'approve_prompt', 'install_or_remote', 'proceed', 'advise_comply'];
const CHECK_KINDS = ['check_official_list', 'verify_identity', 'verify_in_app', 'call_back_known', 'check_with_platform'];

export function timelineChoice(kind: string | undefined, slot?: number): TimelineChoice {
  if (kind === undefined) return 'stepped_back';
  // R22: replying at slot 1 is just being friendly ("You replied. Nothing wrong with that.").
  if (slot === 1 && kind === 'reply') return 'replied';
  if (PAID_KINDS.includes(kind)) return 'paid';
  if (ALONG_KINDS.includes(kind)) return 'went_along';
  if (kind === 'ask_someone') return 'asked';
  if (kind === 'report') return 'reported';
  if (CHECK_KINDS.includes(kind)) return 'checked';
  return 'stepped_back';
}

export interface TimelineRow {
  slot: number;
  /** The slot's layer-1 tell (slot 1: "Nothing to notice yet…"). */
  tell: string;
  choice: TimelineChoice;
}

/** The red-flag timeline rows: slots played, in slot order, with the latest choice made there. */
export function timelineRows(arc: Pick<ArcState, 'timeline' | 'choices'>, tellOf: (slot: number) => string | undefined): TimelineRow[] {
  const slots = [...new Set(arc.timeline)].sort((a, b) => a - b);
  return slots.flatMap((slot) => {
    const tell = tellOf(slot);
    if (tell === undefined) return [];
    return [{ slot, tell, choice: timelineChoice(arc.choices.find((c) => c.slot === slot)?.kind, slot) }];
  });
}
