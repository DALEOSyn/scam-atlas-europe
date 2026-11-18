/**
 * Game-level bookkeeping: fold a finished scenario into the save, advance the
 * chapter, finish the chapter with its stamp. Pure (save in, save out); the
 * hook persists after every scenario (balance session.save_points).
 */
import type { Chapter, Scenario } from '../content/schema.ts';
import { applyArcBeat, setFlags } from './arc.ts';
import { betterStamp, nextIndex, recordOf, sequenceOf, summarise, type ChapterSummary } from './chapter.ts';
import { pressureCalloutFor } from './debrief.ts';
import { demonstratedLos, recordHabits } from './habits.ts';
import type { ScenarioResult } from './result.ts';
import type { RunnerState } from './runner.ts';
import type { ChapterProgress, SaveState } from './save.ts';
import type { EngineBalance } from './scoring.ts';
import { afterScenario } from './stress.ts';

export function chapterProgress(save: SaveState, city: string): ChapterProgress {
  return save.chapters[city] ?? { finished: false, bestStamp: null, bestRating: 0, position: null, run: null };
}

/** Start (or resume) a chapter run. Records its play position the first time. */
export function beginChapter(save: SaveState, city: string, chapter?: Pick<Chapter, 'scenario_order'>): SaveState {
  const p = chapterProgress(save, city);
  if (p.run && !(chapter && runIsTampered(p.run, chapter))) return save;
  const position = p.position ?? Object.values(save.chapters).filter((c) => c.position !== null).length;
  return { ...save, chapters: { ...save.chapters, [city]: { ...p, position, run: { index: 0, records: [], flags: [] } } } };
}

/**
 * QA E8: a run whose index is beyond what its records explain (index = 1 + the furthest recorded
 * scenario) can only come from an edited save. Such a run starts again instead of skipping scenarios.
 */
export function runIsTampered(run: { index: number; records: readonly { id: string }[] }, chapter: Pick<Chapter, 'scenario_order'>): boolean {
  const seq = sequenceOf(chapter);
  const explained = run.records.reduce((m, r) => Math.max(m, seq.findIndex((e) => e.id === r.id) + 1), 0);
  return run.index > explained;
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
): SaveState {
  const p = chapterProgress(save, chapter.city);
  const run = p.run ?? { index: 0, records: [], flags: [] };
  const seq = sequenceOf(chapter);
  const at = seq.findIndex((e) => e.id === s.id);
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
  if (s.role === 'arc' && s.arc_slot !== undefined) arc = applyArcBeat(arc, s.arc_slot, r, st.groups[0]?.decision?.kind);
  const habits = recordHabits(save.habits, demonstratedLos(s, b, st, r), s.id, s.difficulty);

  return {
    ...save,
    // Echo flags belong to this run (a replay starts clean); only arc flags are game-wide.
    flags: s.role === 'arc' ? setFlags(save.flags, r.flagsSet) : save.flags,
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
  return { save: { ...save, chapters: { ...save.chapters, [chapter.city]: next } }, summary };
}
