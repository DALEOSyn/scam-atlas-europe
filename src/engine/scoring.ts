/**
 * Star table lookups and per-scenario scoring (GDD §6–§7, balance.yaml
 * `action_kinds`, `stars`, `points`, `tags`, `multi_step.boss`). Pure;
 * shared by the engine and the content validator (scripts/lib/rules.ts).
 */
import type { Action, ActionClass, ActionKind, Balance, Inspectable, Scenario } from '../content/schema.ts';

export type Truth = 'fraud' | 'legit_high' | 'legit_low';

/** The parts of balance.yaml the star table needs. */
export type ScoringTable = Pick<Balance, 'action_kinds' | 'stars' | 'points' | 'tutorial_grace' | 'timer_expiry'>;

/** Every part of balance.yaml the engine reads (validated at build time by balanceSchema). */
export type EngineBalance = Pick<
  Balance,
  | 'action_kinds'
  | 'stars'
  | 'points'
  | 'tags'
  | 'pause'
  | 'multi_step'
  | 'recovery'
  | 'rating_cap'
  | 'stamps'
  | 'timers'
  | 'pushers'
  | 'stress'
  | 'tutorial_grace'
  | 'timer_expiry'
>;

export function truthOf(s: Pick<Scenario, 'is_fraud' | 'stakes'>): Truth {
  if (s.is_fraud) return 'fraud';
  return s.stakes === 'high' ? 'legit_high' : 'legit_low';
}

export function classOf(table: Pick<Balance, 'action_kinds'>, kind: ActionKind): ActionClass {
  return table.action_kinds[kind].class;
}

/** Classes that are never scored and never decide: pause (`meta`) and `start_transfer` (`step`, CR-18). */
export function isUnscoredClass(cls: ActionClass): cls is 'meta' | 'step' {
  return cls === 'meta' || cls === 'step';
}

/** Stars for a class on a truth; undefined for unscored classes (meta: pause; step: start_transfer). */
export function starsFor(
  table: Pick<Balance, 'stars'>,
  cls: ActionClass,
  truth: Truth,
): number | 'non_terminal' | 'not_allowed' | undefined {
  if (isUnscoredClass(cls)) return undefined;
  return table.stars[cls][truth];
}

/** A fall: comply or proceed on fraud (GDD §7.1). Scored by damage control instead of stars. */
export function isFall(cls: ActionClass, truth: Truth): boolean {
  return truth === 'fraud' && (cls === 'comply' || cls === 'proceed');
}

/**
 * The decisive action of one beat group (GDD §6 "Decisive-action rules").
 * `via` records how the class was reached: `what_now` (hang up → follow-up on a call)
 * or `timer` (second expiry, scored as balance `stars.timer_expiry`).
 */
export interface Decision {
  cls: ActionClass;
  kind: ActionKind | 'done' | 'timer_expiry';
  actionId: string;
  via?: 'what_now' | 'timer';
  /** Authored score override (CR-01) of the deciding action, if any. */
  override?: number;
}

/**
 * Merge a newly chosen action into the group's decisive action.
 * - Verify stands unless the follow-up is comply/proceed on fraud, or report on genuine.
 * - Engage on fraud never decides (it caps the group at ★★ instead; see `engagedOnFraud`).
 * - Meta (pause) never decides.
 * - Step (`start_transfer`, CR-18) never decides and never caps: the banking beat's action decides.
 * - Otherwise the latest action decides.
 */
export function mergeDecision(current: Decision | undefined, next: Decision, truth: Truth, engageTerminalOnFraud: boolean): Decision | undefined {
  if (isUnscoredClass(next.cls)) return current;
  if (next.cls === 'engage' && truth === 'fraud' && !engageTerminalOnFraud) return current;
  if (current?.cls === 'verify') {
    const replaces = truth === 'fraud' ? next.cls === 'comply' || next.cls === 'proceed' : next.cls === 'report';
    return replaces ? next : current;
  }
  return next;
}

export function decisionOf(table: Pick<Balance, 'action_kinds'>, a: Action): Decision {
  return { cls: classOf(table, a.kind), kind: a.kind, actionId: a.id, ...(a.score !== undefined ? { override: a.score } : {}) };
}

/** Score of one beat group before tags and damage control. */
export interface GroupScore {
  cls: ActionClass;
  stars: number;
  /** stars × per_star, report-on-genuine exception, or the authored override. Falls score 0 here. */
  points: number;
  fell: boolean;
  timerExpired: boolean;
  /** Engage on fraud happened earlier in the group: stars capped (balance points.engage_on_fraud.star_cap). */
  capped: boolean;
}

/**
 * Tutorial grace (balance `tutorial_grace`, design ruling L4): in a grace slot, report on genuine and
 * dismiss on genuine high stakes score the grace cell instead of the star table. undefined otherwise.
 */
export function graceFor(
  b: Pick<Balance, 'tutorial_grace'>,
  slot: number | undefined,
  cls: ActionClass,
  truth: Truth,
): { stars: number; points: number } | undefined {
  const g = b.tutorial_grace;
  if (slot === undefined || !g.slots.includes(slot) || truth === 'fraud') return undefined;
  if (cls === 'report') return g.report_on_legit;
  if (cls === 'dismiss' && truth === 'legit_high') return g.dismiss_on_legit_high;
  return undefined;
}

export function scoreGroup(
  b: Pick<Balance, 'stars' | 'points' | 'tutorial_grace' | 'timer_expiry'>,
  truth: Truth,
  decision: Decision | undefined,
  opts: { engagedOnFraud: boolean; timerExpired: boolean; /** Chapter slot, for tutorial grace. */ slot?: number },
): GroupScore {
  // Expiry scores as dismiss only when nothing was decided yet: a verify (or any decision) before the
  // deadline keeps its own score (sceptic T-2.1 #2).
  const expired = opts.timerExpired && decision === undefined;
  const cls: ActionClass = expired ? b.stars.timer_expiry : (decision?.cls ?? b.stars.timer_expiry);
  const raw = starsFor(b, cls, truth);
  let stars = typeof raw === 'number' ? raw : raw === 'non_terminal' ? b.points.engage_on_fraud.star_cap : 0;
  const capped = opts.engagedOnFraud && truth === 'fraud';
  if (capped) stars = Math.min(stars, b.points.engage_on_fraud.star_cap);
  const fell = !expired && isFall(cls, truth);
  if (fell) return { cls, stars: 0, points: 0, fell, timerExpired: expired, capped };
  let points = stars * b.points.per_star;
  if (cls === 'report' && truth !== 'fraud') points = b.points.exceptions.report_on_legit;
  // Grace applies to a choice the player made, never to a timer running out. Order: star table, then
  // grace, then an authored `score` override (CR-01) on the deciding action, which sets the points
  // only. The override is the author's explicit, per-action decision, reviewed with the scenario, so
  // it wins over every table rule, grace included; it never changes the stars.
  const grace = expired ? undefined : graceFor(b, opts.slot, cls, truth);
  if (grace) {
    stars = grace.stars;
    points = grace.points;
  }
  // Ruling QA L4: running out of game time on a genuine high-stakes message is not dropping it.
  if (expired && truth === 'legit_high') {
    stars = b.timer_expiry.genuine_high.stars;
    points = b.timer_expiry.genuine_high.points;
  }
  // (an authored override, if any, comes last: see above)
  if (!expired && decision?.override !== undefined) points = decision.override;
  return { cls, stars, points, fell, timerExpired: expired, capped };
}

/** A tag is correct when it marks a red flag (on fraud, or a quoted example anywhere). */
export function tagIsCorrect(ins: Inspectable | undefined, beatIsFraud: boolean): boolean {
  if (!ins || !ins.red_flag) return false;
  return beatIsFraud || ins.context === 'quoted';
}

export interface TagTally {
  correct: number;
  wrong: number;
}

/**
 * Tag bonus (balance `tags`): +per_tagged_red_flag per correct tag, capped,
 * void if any wrong tag, only when the final class qualifies and not on timer expiry.
 * `eligibleCorrect` counts correct tags in groups whose ending qualifies (boss: per beat).
 */
export function tagBonus(b: Pick<Balance, 'tags'>, eligibleCorrect: number, wrongAnywhere: number): { bonus: number; voided: boolean } {
  const voided = b.tags.void_if_any_non_red_flag_tagged && wrongAnywhere > 0;
  if (voided) return { bonus: 0, voided };
  return { bonus: Math.min(b.tags.cap, eligibleCorrect * b.tags.per_tagged_red_flag), voided };
}

export function groupEarnsTagBonus(b: Pick<Balance, 'tags'>, g: GroupScore): boolean {
  if (g.timerExpired && b.tags.not_on_timer_expiry) return false;
  return b.tags.apply_if_final_class_in.includes(g.cls);
}

/**
 * Max points of one scored scenario: 3 stars per scored group + the tag bonus potential, which exists
 * whenever there are taggable red flags (fraud, or quoted examples inside a genuine message).
 */
export function maxPointsOf(b: Pick<Balance, 'points' | 'tags'>, scoredGroups: number, redFlags: number): number {
  const bonus = redFlags > 0 ? Math.min(b.tags.cap, redFlags * b.tags.per_tagged_red_flag) : 0;
  return scoredGroups * 3 * b.points.per_star + bonus;
}
