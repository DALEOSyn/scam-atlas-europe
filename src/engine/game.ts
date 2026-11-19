/**
 * Game-level bookkeeping: fold a finished scenario into the save, advance the
 * chapter, finish the chapter with its stamp. Pure (save in, save out); the
 * hook persists after every scenario (balance session.save_points).
 */
import type { Chapter, Scenario } from '../content/schema.ts';
import { applyArcBeat, arcSlotFlags, bankArcPoints, setFlags } from './arc.ts';
import { betterStamp, nextIndex, recordOf, sequenceOf, summarise, type ChapterSummary } from './chapter.ts';
import { pressureCalloutFor } from './debrief.ts';
import { demonstratedLos, recordHabits } from './habits.ts';
import type { ScenarioResult } from './result.ts';
import type { GroupState, RunnerState } from './runner.ts';
import type { ChapterProgress, SaveState } from './save.ts';
import { classOf, isUnscoredClass, type EngineBalance } from './scoring.ts';
import { afterScenario } from './stress.ts';
import { recordPostcard } from './story.ts';

export function chapterProgress(save: SaveState, city: string): ChapterProgress {
  return save.chapters[city] ?? { finished: false, bestStamp: null, bestRating: 0, position: null, run: null };
}

/** Start (or resume) a chapter run. Records its play position the first time. */
export function beginChapter(save: SaveState, city: string, chapter?: Pick<Chapter, 'scenario_order' | 'arc_beat'>): SaveState {
  const p = chapterProgress(save, city);
  if (p.run && !(chapter && runIsTampered(p.run, chapter))) return save;
  const position = p.position ?? Object.values(save.chapters).filter((c) => c.position !== null).length;
  return { ...save, chapters: { ...save.chapters, [city]: { ...p, position, run: { index: 0, records: [], flags: [] } } } };
}

/**
 * QA E8: a run whose index is beyond what its records explain (index = 1 + the furthest recorded
 * scenario) can only come from an edited save. Such a run starts again instead of skipping scenarios.
 *
 * CR-55 (QA P3 B1): the chapter's arc position plays the lowest arc slot not yet played (CR-49), often another
 * chapter's arc file, so the run records an id outside this chapter's sequence there. Such a record is explained
 * by the chapter's arc-beat position (`arc_beat`), and by nothing else: a chapter without an arc beat explains
 * none, and a foreign record never explains more than the arc position. Without this, every arc beat borrowed
 * from another chapter read as tampering and restarted the run, which chained arc beats (the arc position came
 * round again) and wiped the scenarios played before it.
 */
export function runIsTampered(run: { index: number; records: readonly { id: string }[] }, chapter: Pick<Chapter, 'scenario_order' | 'arc_beat'>): boolean {
  const seq = sequenceOf(chapter);
  const arcAt = chapter.arc_beat === undefined ? -1 : seq.findIndex((e) => e.id === chapter.arc_beat);
  const at = (id: string): number => {
    const own = seq.findIndex((e) => e.id === id);
    return own >= 0 ? own : arcAt;
  };
  const explained = run.records.reduce((m, r) => Math.max(m, at(r.id) + 1), 0);
  return run.index > explained;
}

/**
 * CR-55 (QA P3 B2): the action kind that decided an arc slot, for the timeline wording and the arc rules. A reply
 * (an engage on a fraud beat) never becomes the group's scoring `decision` (engage is not terminal), so the last
 * scored action taken stands for it. undefined (stored as `timer_expiry`) only when the timer really ran out and
 * nothing decided, or when nothing was chosen at all.
 */
export function arcDecisiveKind(b: Pick<EngineBalance, 'action_kinds'>, g: Pick<GroupState, 'decision' | 'timerExpired' | 'kinds'> | undefined): string | undefined {
  if (!g) return undefined;
  if (g.decision) return g.decision.kind;
  if (g.timerExpired) return undefined;
  return [...g.kinds].reverse().find((k) => !isUnscoredClass(classOf(b, k)));
}

/** Stress the next scenario starts with: decayed after a scenario, 10 on resume (balance stress.on_resume). */
export function carriedStress(b: EngineBalance, previous: number | null): number {
  return previous === null ? b.stress.on_resume : afterScenario(b, previous);
}

export function commitScenario(
  save: SaveState,
  b: EngineBalance,
  chapter: Pick<Chapter, 'city' | 'scenario_order'>,
  s: Scenario,
  st: RunnerState,
  r: ScenarioResult,
  /** CR-43(f): the sequence index the scenario played at, when it is not the chapter's own (an arc slot from another chapter). */
  seqIndex?: number,
): SaveState {
  const p = chapterProgress(save, chapter.city);
  const run = p.run ?? { index: 0, records: [], flags: [] };
  const seq = sequenceOf(chapter);
  const own = seq.findIndex((e) => e.id === s.id);
  const at = own >= 0 ? own : (seqIndex ?? -1);
  // A replay inside the run keeps the best attempt per scenario (producer decision), never just the latest.
  const record = recordOf(r, s.pattern);
  const previous = run.records.find((x) => x.id === s.id);
  const best = previous && previous.points >= record.points ? previous : record;
  const records = [...run.records.filter((x) => x.id !== s.id), best];
  const index = Math.max(run.index, at + 1);

  const callout = pressureCalloutFor(st.styledShown, !s.is_fraud, save.callouts);
  const callouts = {
    pressureAny: save.callouts.pressureAny || callout === 'first_any' || callout === 'first_genuine',
    pressureGenuine: save.callouts.pressureGenuine || callout === 'first_genuine',
  };
  let arc = save.arc;
  const decisive = s.role === 'arc' && s.arc_slot !== undefined ? arcDecisiveKind(b, st.groups[0]) : undefined;
  if (s.role === 'arc' && s.arc_slot !== undefined) arc = applyArcBeat(arc, s.arc_slot, r, decisive);
  // CR-51 (R25(5)): an arc slot decided by a report or by asking someone sets arc_told_someone.
  const engineFlags = s.role === 'arc' && s.arc_slot !== undefined ? arcSlotFlags(decisive) : [];
  // CR-43: the finale's scenarios bank their points (damage control after a fall) as arc points, never a chapter score.
  if (s.role === 'arc' && s.finale !== undefined) arc = bankArcPoints(arc, r.points);
  const habits = recordHabits(save.habits, demonstratedLos(s, b, st, r), s.id, s.difficulty);

  return {
    ...save,
    // Echo flags belong to this run (a replay starts clean); only arc flags are game-wide.
    flags: s.role === 'arc' ? setFlags(save.flags, [...r.flagsSet, ...engineFlags]) : save.flags,
    arc,
    habits,
    callouts,
    chapters: { ...save.chapters, [chapter.city]: { ...p, run: { index, records, flags: setFlags(run.flags, r.flagsSet) } } },
  };
}

/** Flags visible to `requires_flags` in a chapter run: this run's flags plus the game-wide arc flags. */
export function runFlags(save: SaveState, city: string): Set<string> {
  return new Set([...save.flags, ...(chapterProgress(save, city).run?.flags ?? [])]);
}

/**
 * The flags a story scene sees (`if_flag` / `unless_flag`): the chapter run's flags with the game-wide arc flags (or
 * only the game-wide ones outside a chapter), and in the finale the arc variables that are set (CR-43(d):
 * alex_invested above 0 counts as a flag).
 */
export function sceneFlags(save: SaveState, city: string | null): Set<string> {
  const arcVars = save.arc.finale ? Object.entries(save.arc.vars).filter(([, v]) => v === true || (typeof v === 'number' && v > 0)).map(([k]) => k) : [];
  return new Set([...(city !== null ? runFlags(save, city) : save.flags), ...arcVars]);
}

/** The run's next index, clamped to the chapter's sequence (a corrupt or stale save never skips past the end). */
export function runIndex(save: SaveState, chapter: Pick<Chapter, 'city' | 'scenario_order'>): number {
  const raw = chapterProgress(save, chapter.city).run?.index ?? 0;
  return Number.isInteger(raw) && raw >= 0 ? Math.min(raw, sequenceOf(chapter).length) : 0;
}

/** Next scenario id to play in the chapter run, or null when the chapter is done. */
export function nextScenarioId(save: SaveState, chapter: Pick<Chapter, 'city' | 'scenario_order'>, requires: (id: string) => readonly string[]): string | null {
  const i = nextIndex(chapter, runIndex(save, chapter), requires, runFlags(save, chapter.city));
  return i < 0 ? null : (sequenceOf(chapter)[i]?.id ?? null);
}

/** Close the run: bronze at least, best stamp and rating kept across replays. */
export function finishChapter(save: SaveState, b: EngineBalance, chapter: Pick<Chapter, 'city' | 'patterns'>): { save: SaveState; summary: ChapterSummary } {
  const p = chapterProgress(save, chapter.city);
  const summary = summarise(b, chapter, p.run?.records ?? [], true);
  const next: ChapterProgress = {
    ...p,
    finished: true,
    bestStamp: betterStamp(p.bestStamp, summary.stamp),
    bestRating: Math.max(p.bestRating, summary.rating),
    run: null,
  };
  // A postcard to Teo comes with finishing, never with a score (STORY §1.3).
  return { save: { ...save, chapters: { ...save.chapters, [chapter.city]: next }, story: recordPostcard(save.story, chapter.city) }, summary };
}
