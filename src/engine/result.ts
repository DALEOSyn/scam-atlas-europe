/**
 * Score a finished run (GDD §7.1, balance `stars`, `points`, `tags`,
 * `multi_step.boss`, `recovery`). Pure.
 *
 * - Standard: the decisive action's stars × per_star (report on genuine: −5),
 *   plus the tag bonus on verify/report/dismiss endings. A fall scores its
 *   damage-control points instead (★ if ≥ 6).
 * - Boss: each scored beat group scores on its own decisive action and the
 *   beat scores are summed. A fallen beat scores 0; damage control runs once
 *   and its points are added once. One tag bonus for the whole boss (cap 6),
 *   counting red flags tagged in beats whose ending qualifies, voided by any
 *   wrong tag across the boss. Displayed stars = rounded mean of beat stars.
 * - R (red flags) counts the scheduled beats every player sees (opening and
 *   scored boss beats), not follow-up pages reached only by engaging.
 */
import type { ActionKind, Scenario } from '../content/schema.ts';
import { tallyTags, redFlagsOf } from './inspect.ts';
import { situationOf, type AlreadySituation, type RecoveryResult } from './recovery.ts';
import { beatById, type GroupState, type RunnerState } from './runner.ts';
import { classOf, groupEarnsTagBonus, maxPointsOf, scoreGroup, tagBonus, type EngineBalance, type GroupScore, type Truth } from './scoring.ts';

export interface BeatResult extends GroupScore {
  beatId: string;
  scored: boolean;
  outcome: string | undefined;
  correctTags: number;
  wrongTags: number;
  kinds: ActionKind[];
}

export interface ScenarioResult {
  scenarioId: string;
  role: Scenario['role'];
  truth: Truth;
  /** standard and boss count toward the chapter; drill and arc never do. */
  scored: boolean;
  /** 0–3; null on arc beats (no stars shown, GDD §10.2). */
  stars: number | null;
  points: number;
  maxPoints: number;
  /** Points before tag bonus and damage control. */
  base: number;
  tagBonus: number;
  tagBonusVoided: boolean;
  recovery: RecoveryResult | null;
  fell: boolean;
  timerExpired: boolean;
  /** Net-spotting inputs (story beats only; interrupts never count). */
  correctTags: number;
  wrongTags: number;
  redFlags: number;
  /** Genuine messages reported: report on a genuine scenario + reported genuine interrupts. */
  genuineReported: number;
  /** A verify-class action on a low-stakes genuine message (gold off-focus rule input). */
  doubleCheckedHarmless: boolean;
  /** The decisive action earned full stars (the habit we teach). */
  best: boolean;
  beats: BeatResult[];
  pausedUnderPressure: boolean;
  situation: AlreadySituation | undefined;
  outcomes: string[];
  flagsSet: string[];
  arcEffects: Record<string, number | boolean>;
}

function groupTags(s: Scenario, st: RunnerState, g: GroupState): { correct: number; wrong: number } {
  let correct = 0;
  let wrong = 0;
  for (const beatId of g.visited) {
    const beat = beatById(s, beatId);
    if (!beat) continue;
    const prefix = `${beatId}|`;
    const targets = st.tags.filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
    const t = tallyTags(beat, s.is_fraud, targets);
    correct += t.correct;
    wrong += t.wrong;
  }
  return { correct, wrong };
}

/** Red flags on the scheduled, scored beats of a scenario (R for stamps and max points). */
export function redFlagCount(s: Scenario): number {
  const ids = ['start', ...(s.role === 'boss' ? s.beats.filter((b) => b.arrives_after !== undefined && b.scored).map((b) => b.id) : [])];
  return ids.reduce((n, id) => {
    const b = beatById(s, id);
    return n + (b ? redFlagsOf(b, s.is_fraud).length : 0);
  }, 0);
}

/** Scored beat groups of a scenario: 1, or the boss's scored scheduled beats. */
export function scoredGroupCount(s: Scenario): number {
  if (s.role !== 'boss') return 1;
  return 1 + s.beats.filter((b) => b.arrives_after !== undefined && b.scored).length;
}

export function maxPointsOfScenario(b: EngineBalance, s: Scenario): number {
  return maxPointsOf(b, scoredGroupCount(s), s.is_fraud, redFlagCount(s));
}

export function resultOf(s: Scenario, b: EngineBalance, st: RunnerState): ScenarioResult {
  const truth = st.truth;
  const beats: BeatResult[] = st.groups.map((g) => {
    const score = scoreGroup(b, truth, g.decision, { engagedOnFraud: g.engagedOnFraud, timerExpired: g.timerExpired });
    const tags = groupTags(s, st, g);
    return { ...score, beatId: g.beatId, scored: g.scored, outcome: g.outcome, correctTags: tags.correct, wrongTags: tags.wrong, kinds: g.kinds };
  });
  const scoredBeats = beats.filter((x) => x.scored);
  const fell = scoredBeats.some((x) => x.fell);
  const recovery = st.recovery?.result ?? null;
  const recoveryPoints = fell ? (recovery?.points ?? 0) : 0;

  const correct = scoredBeats.reduce((n, x) => n + x.correctTags, 0);
  const wrong = scoredBeats.reduce((n, x) => n + x.wrongTags, 0);
  const eligible = scoredBeats.filter((x) => !x.fell && groupEarnsTagBonus(b, x)).reduce((n, x) => n + x.correctTags, 0);
  const bonus = tagBonus(b, eligible, wrong);

  const base = scoredBeats.reduce((n, x) => n + x.points, 0);
  let stars: number;
  let points: number;
  if (s.role === 'boss') {
    stars = scoredBeats.length > 0 ? Math.round(scoredBeats.reduce((n, x) => n + x.stars, 0) / scoredBeats.length) : 0;
    points = base + bonus.bonus + recoveryPoints;
  } else if (fell) {
    stars = recovery?.stars ?? 0;
    points = recoveryPoints;
  } else {
    stars = scoredBeats[0]?.stars ?? 0;
    points = base + bonus.bonus;
  }

  const allKinds = st.groups.flatMap((g) => g.kinds);
  const storyReported = truth !== 'fraud' && scoredBeats.some((x) => x.cls === 'report');
  const interruptReports = st.interrupts.filter((i) => {
    const def = s.interrupts.find((x) => x.id === i.id);
    const a = def?.actions.find((x) => x.id === i.actionId);
    return def && !def.is_fraud && a && classOf(b, a.kind) === 'report';
  }).length;
  const outcomes = st.groups.flatMap((g) => (g.outcome ? [g.outcome] : []));
  const flagsSet = [...new Set(outcomes.flatMap((o) => s.outcomes[o]?.sets_flags ?? []))];
  const arcEffects: Record<string, number | boolean> = {};
  for (const o of outcomes) Object.assign(arcEffects, s.outcomes[o]?.arc_effects ?? {});

  return {
    scenarioId: s.id,
    role: s.role,
    truth,
    scored: s.role === 'standard' || s.role === 'boss',
    stars: s.role === 'arc' ? null : stars,
    points,
    maxPoints: maxPointsOfScenario(b, s),
    base,
    tagBonus: bonus.bonus,
    tagBonusVoided: bonus.voided,
    recovery,
    fell,
    timerExpired: beats.some((x) => x.timerExpired),
    correctTags: correct,
    wrongTags: wrong,
    redFlags: redFlagCount(s),
    genuineReported: (storyReported ? 1 : 0) + interruptReports,
    doubleCheckedHarmless: truth === 'legit_low' && allKinds.some((k) => classOf(b, k) === 'verify'),
    best: !fell && scoredBeats.length > 0 && scoredBeats.every((x) => x.stars === 3),
    beats,
    pausedUnderPressure: st.groups.some((g) => g.pausedUnderPressure),
    situation: situationOf(allKinds),
    outcomes,
    flagsSet,
    arcEffects,
  };
}
