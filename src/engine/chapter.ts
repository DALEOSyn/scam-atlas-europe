/**
 * Chapter progression and the chapter result (GDD §4, §7.1, §11; balance
 * `stamps`, `rating_cap`). Pure.
 *
 * - Chapter max = sum of scored scenarios' max points (drills, arc beats,
 *   interrupts and pause excluded). Inspector rating = points ÷ max, capped.
 * - Spotted (net, chapter-wide) = correct tags − wrong tags over scored
 *   scenarios and boss beats. R = the chapter's red flags.
 * - Stamps: bronze when finished; silver/gold by rating, genuine reported,
 *   spotted thresholds and (gold) no off-focus double checks.
 * - Unlocking is never score-gated. Home (slot 0) → Berlin (slot 1) → free
 *   choice of every slot 2–9 chapter → the finale (slot 10) once all of those
 *   that exist are finished.
 * - The summary never shows a per-scenario count of checkables.
 */
import { SPOTTED_EXPR_RE } from '../content/constants.ts';
import type { Balance, Chapter } from '../content/schema.ts';
import type { ScenarioResult } from './result.ts';

export type Stamp = 'bronze' | 'silver' | 'gold';
const STAMP_RANK: Record<Stamp, number> = { bronze: 1, silver: 2, gold: 3 };

/** What the chapter keeps per played scenario (also stored in the save). */
export interface ScenarioRecord {
  id: string;
  scored: boolean;
  points: number;
  maxPoints: number;
  stars: number | null;
  correctTags: number;
  wrongTags: number;
  redFlags: number;
  genuineReported: number;
  doubleCheckedHarmless: boolean;
  /** The scenario's pattern (genuine twins: the pattern they mirror). */
  pattern: string | null;
}

export function recordOf(r: ScenarioResult, pattern: string | undefined): ScenarioRecord {
  return {
    id: r.scenarioId,
    scored: r.scored,
    points: r.points,
    maxPoints: r.maxPoints,
    stars: r.stars,
    correctTags: r.correctTags,
    wrongTags: r.wrongTags,
    redFlags: r.redFlags,
    genuineReported: r.genuineReported,
    doubleCheckedHarmless: r.doubleCheckedHarmless,
    pattern: pattern ?? null,
  };
}

/** Evaluate ceil(R/3) or ceil(2*R/3). */
export function spottedThreshold(expr: string, r: number): number {
  const m = SPOTTED_EXPR_RE.exec(expr);
  if (!m) throw new Error(`unsupported spotted expression "${expr}"`);
  const k = Number(m[1] ?? '1');
  const n = Number(m[2]);
  return Math.ceil((k * r) / n);
}

export interface ChapterSummary {
  points: number;
  max: number;
  /** Inspector rating in percent, capped at balance rating_cap. */
  rating: number;
  /** Net spotting (correct − wrong): the stamp rules use this. */
  spotted: number;
  /** For "Red flags you spotted: x of R": net spotting floored at 0 and capped at R (QA E7). */
  spottedShown: number;
  correctTags: number;
  wrongTags: number;
  redFlags: number;
  genuineReported: number;
  /** "Harmless messages you double-checked" (all of them). */
  doubleChecks: number;
  /** Double checks on harmless messages outside the chapter's focus patterns (gold rule). */
  offFocusDoubleChecks: number;
  stamp: Stamp | null;
  /** What the next tier still needs (plain words built by the UI from these). */
  nextTier: { tier: 'silver' | 'gold'; needs: ('rating' | 'genuine_reported' | 'spotted' | 'offfocus')[]; spottedNeeded: number } | null;
}

type StampTable = Pick<Balance, 'stamps' | 'rating_cap'>;

export function summarise(b: StampTable, chapter: Pick<Chapter, 'patterns'>, records: readonly ScenarioRecord[], finished: boolean): ChapterSummary {
  const scored = records.filter((r) => r.scored);
  const points = scored.reduce((n, r) => n + r.points, 0);
  const max = scored.reduce((n, r) => n + r.maxPoints, 0);
  const rating = max > 0 ? Math.min(b.rating_cap, Math.max(0, (points / max) * 100)) : 0;
  const correctTags = scored.reduce((n, r) => n + r.correctTags, 0);
  const wrongTags = scored.reduce((n, r) => n + r.wrongTags, 0);
  const redFlags = scored.reduce((n, r) => n + r.redFlags, 0);
  const genuineReported = scored.reduce((n, r) => n + r.genuineReported, 0);
  const doubles = scored.filter((r) => r.doubleCheckedHarmless);
  const offFocus = doubles.filter((r) => !r.pattern || !chapter.patterns.includes(r.pattern)).length;
  const spotted = correctTags - wrongTags;

  const silver = b.stamps.silver;
  const gold = b.stamps.gold;
  const silverNeeds: ('rating' | 'genuine_reported' | 'spotted')[] = [];
  if (rating < silver.min_rating) silverNeeds.push('rating');
  if (genuineReported > silver.max_genuine_reported) silverNeeds.push('genuine_reported');
  const silverSpotted = spottedThreshold(silver.min_spotted, redFlags);
  if (spotted < silverSpotted) silverNeeds.push('spotted');
  const goldNeeds: ('rating' | 'genuine_reported' | 'spotted' | 'offfocus')[] = [];
  if (rating < gold.min_rating) goldNeeds.push('rating');
  if (genuineReported > gold.max_genuine_reported) goldNeeds.push('genuine_reported');
  const goldSpotted = spottedThreshold(gold.min_spotted, redFlags);
  if (spotted < goldSpotted) goldNeeds.push('spotted');
  if (offFocus > gold.max_offfocus_doublechecks) goldNeeds.push('offfocus');

  let stamp: Stamp | null = null;
  if (finished) stamp = goldNeeds.length === 0 ? 'gold' : silverNeeds.length === 0 ? 'silver' : 'bronze';
  const nextTier =
    stamp === 'gold'
      ? null
      : silverNeeds.length === 0
        ? { tier: 'gold' as const, needs: goldNeeds, spottedNeeded: goldSpotted }
        : { tier: 'silver' as const, needs: silverNeeds, spottedNeeded: silverSpotted };

  return {
    points,
    max,
    rating,
    spotted,
    spottedShown: Math.max(0, Math.min(redFlags, spotted)),
    correctTags,
    wrongTags,
    redFlags,
    genuineReported,
    doubleChecks: doubles.length,
    offFocusDoubleChecks: offFocus,
    stamp,
    nextTier,
  };
}

export function betterStamp(a: Stamp | null, b: Stamp | null): Stamp | null {
  if (!a) return b;
  if (!b) return a;
  return STAMP_RANK[b] > STAMP_RANK[a] ? b : a;
}

// ---------------------------------------------------------------------------
// Sequence inside a chapter

export interface SequenceEntry {
  id: string;
  half: 'am' | 'pm';
}

export function sequenceOf(c: Pick<Chapter, 'scenario_order'>): SequenceEntry[] {
  return [...c.scenario_order.am.map((id) => ({ id, half: 'am' as const })), ...c.scenario_order.pm.map((id) => ({ id, half: 'pm' as const }))];
}

/**
 * Index of the next playable scenario at or after `from`, skipping echoes whose
 * `requires_flags` are not all set. -1 when the chapter is finished.
 */
export function nextIndex(
  c: Pick<Chapter, 'scenario_order'>,
  from: number,
  requires: (id: string) => readonly string[],
  flags: ReadonlySet<string>,
): number {
  const seq = sequenceOf(c);
  for (let i = Math.max(0, from); i < seq.length; i++) {
    const entry = seq[i];
    if (entry && requires(entry.id).every((f) => flags.has(f))) return i;
  }
  return -1;
}

/** The half-day stop point comes after the last morning scenario (balance half_day_split). */
export function isStopPointAfter(c: Pick<Chapter, 'scenario_order'>, index: number): boolean {
  return c.scenario_order.am.length > 0 && c.scenario_order.pm.length > 0 && index === c.scenario_order.am.length - 1;
}

/** "4 messages left today" / "3 messages left this morning": counts scenarios, never checkables. */
export function messagesLeft(c: Pick<Chapter, 'scenario_order'>, index: number): { today: number; thisHalf: number } {
  const seq = sequenceOf(c);
  const today = Math.max(0, seq.length - index);
  const half = seq[index]?.half;
  const thisHalf = half ? seq.slice(index).filter((e) => e.half === half).length : 0;
  return { today, thisHalf };
}

// ---------------------------------------------------------------------------
// Unlocking (G1: free city choice after Berlin; never score-gated)

export function unlockedChapters(chapters: readonly Pick<Chapter, 'city' | 'slot'>[], finished: ReadonlySet<string>): string[] {
  const done = (slot: number) => chapters.filter((c) => c.slot === slot).every((c) => finished.has(c.city));
  const middle = chapters.filter((c) => c.slot >= 2 && c.slot <= 9);
  return chapters
    .filter((c) => {
      if (c.slot === 0) return true;
      if (c.slot === 1) return done(0);
      if (c.slot <= 9) return done(0) && done(1);
      return done(0) && done(1) && middle.every((m) => finished.has(m.city));
    })
    .sort((a, b) => a.slot - b.slot)
    .map((c) => c.city);
}
