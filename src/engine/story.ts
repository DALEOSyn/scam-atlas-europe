/**
 * Story layer (S3; STORY §1.3, §3, §3.12, §4, §6). Pure: where scenes play in a chapter, which panels a
 * run sees (story-only variant flags), interludes keyed to play position, postcards to Teo, flip the
 * postcard, and Atlas pages. The UI (src/ui/ScenePlayer.tsx, app.tsx) renders what these return.
 *
 * Rules kept here:
 * - Scenes never score and never set flags. Postcards and Atlas pages come with finishing a chapter,
 *   never with a score (STORY §1.3, §5.9): `recordPostcard` is called by `finishChapter` for every finish.
 * - Interludes follow play position (finished middle chapters: 2, 4, 6, 8), never a city (§3.12).
 * - Flip the postcard picks a line from a city finished at least two chapters earlier, preferring the one
 *   flipped least recently (§3.12). No right or wrong; the tap is the only input.
 * - Saved state is three lists of content ids (no personal data): postcards (finish order), flips (least
 *   recent first) and seen scenes.
 */
import type { Chapter, Scene, ScenePanel } from '../content/schema.ts';

/** The folder and `chapter` value of interludes (mirrors INTERLUDE_FOLDER in schema.ts; no Zod at runtime). */
export const INTERLUDES = 'interludes';

export interface StoryState {
  /** Cities whose chapter is finished, in the order they were first finished: one postcard each. */
  postcards: string[];
  /** Cities whose postcard was flipped, least recently flipped first. */
  flips: string[];
  /** Scene ids played to the end or skipped (interludes are shown once; replay lists these). */
  seen: string[];
}

export const EMPTY_STORY: StoryState = { postcards: [], flips: [], seen: [] };

export interface IfThen {
  cue: string;
  action: string;
  extra?: string | undefined;
}

// ---------------------------------------------------------------------------
// Placement in a chapter (STORY §3 scene slots, §6 retrofit)

type Placement = Pick<Chapter, 'scenes' | 'scenario_order'>;

export function arrivalSceneId(c: Placement): string | null {
  return c.scenes?.arrival ?? null;
}

export function turnSceneId(c: Placement): string | null {
  return c.scenes?.turn ?? null;
}

export function resolutionSceneId(c: Placement): string | null {
  return c.scenes?.resolution ?? null;
}

/** Spec-placed beats after a scenario's debrief (Amsterdam's local problem, Paris's turn after 3-5). */
export function scenesAfter(c: Placement, scenarioId: string): string[] {
  return (c.scenes?.placed ?? []).filter((p) => p.after === scenarioId).map((p) => p.scene);
}

/** A chapter's scenes in play order (for "Story scenes" replay on the chapter list). */
export function chapterSceneIds(c: Placement): string[] {
  const out: string[] = [];
  const arrival = arrivalSceneId(c);
  if (arrival) out.push(arrival);
  const am = c.scenario_order.am;
  for (const id of am) out.push(...scenesAfter(c, id));
  const turn = turnSceneId(c);
  if (turn) out.push(turn);
  for (const id of c.scenario_order.pm) out.push(...scenesAfter(c, id));
  const res = resolutionSceneId(c);
  if (res) out.push(res);
  return out;
}

// ---------------------------------------------------------------------------
// Panels

/** The panels this run sees: story-only variant flags (STORY §4.2 rule 5) pick panels; nothing else branches. */
export function visiblePanels(scene: Pick<Scene, 'panels'>, flags: ReadonlySet<string>): ScenePanel[] {
  return scene.panels.filter((p) => (p.if_flag === undefined || flags.has(p.if_flag)) && (p.unless_flag === undefined || !flags.has(p.unless_flag)));
}

export interface StoryVars {
  /** Cities done (postcards collected). */
  count: number;
  /** The name of the city finished last ('' before any). */
  lastCity: string;
}

/** Interlude placeholders {count} and {lastCity} (STORY §3.12). */
export function fillStory(text: string, vars: StoryVars): string {
  return text.replace(/\{count\}/g, String(vars.count)).replace(/\{lastCity\}/g, vars.lastCity);
}

export function storyVars(story: StoryState, chapters: readonly Pick<Chapter, 'city' | 'name'>[]): StoryVars {
  const last = story.postcards.at(-1);
  return { count: story.postcards.length, lastCity: chapters.find((c) => c.city === last)?.name ?? '' };
}

/** The If-then line of a resolution scene (its last panel, STORY §4.4). */
export function ifThenOf(scene: Pick<Scene, 'panels'> | undefined): IfThen | null {
  const p = scene?.panels.at(-1)?.if_then;
  return p ? { cue: p.cue, action: p.action, extra: p.extra } : null;
}

/** One wording everywhere (STORY §4.4): the line is cue + action, word for word. */
export function ifThenLine(x: IfThen): string {
  return `${x.cue} ${x.action}`;
}

// ---------------------------------------------------------------------------
// Interludes (STORY §3.12)

/** Middle chapters (slots 2–9) finished so far: the interludes' play position. */
export function middleFinished(chapters: readonly Pick<Chapter, 'city' | 'slot'>[], finished: (city: string) => boolean): number {
  return chapters.filter((c) => c.slot >= 2 && c.slot <= 9 && finished(c.city)).length;
}

/** The interlude to show on the map now: the earliest one whose position is reached and not yet seen. */
export function dueInterlude(interludes: readonly { id: string; after_middle?: number | undefined }[], done: number, seen: readonly string[]): string | null {
  const due = interludes
    .filter((i) => i.after_middle !== undefined && i.after_middle <= done && !seen.includes(i.id))
    .sort((a, b) => (a.after_middle ?? 0) - (b.after_middle ?? 0));
  return due[0]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Postcards and flip the postcard

/** A postcard comes with every first finish of a chapter, whatever the score. */
export function recordPostcard(story: StoryState, city: string): StoryState {
  return story.postcards.includes(city) ? story : { ...story, postcards: [...story.postcards, city] };
}

export function markSeen(story: StoryState, sceneId: string): StoryState {
  return story.seen.includes(sceneId) ? story : { ...story, seen: [...story.seen, sceneId] };
}

/** Cities whose postcard can be flipped now: finished at least two chapters before the latest finish. */
export function flipCandidates(story: StoryState): string[] {
  return story.postcards.slice(0, Math.max(0, story.postcards.length - 2));
}

/**
 * The postcard Teo reads: among the candidates that have an If-then line, the one flipped least recently
 * (never-flipped first, then by flip order), ties broken by finish order. Null when none is eligible.
 * `open` (the Open Evening, where "you pick a postcard") allows every collected postcard.
 */
export function pickFlip(story: StoryState, hasLine: (city: string) => boolean, open = false): string | null {
  const pool = (open ? story.postcards : flipCandidates(story)).filter(hasLine);
  if (pool.length === 0) return null;
  const rank = (city: string) => story.flips.indexOf(city); // -1 = never flipped
  return [...pool].sort((a, b) => rank(a) - rank(b) || story.postcards.indexOf(a) - story.postcards.indexOf(b))[0] ?? null;
}

/** The player flipped this postcard: it becomes the most recently flipped. */
export function recordFlip(story: StoryState, city: string): StoryState {
  return { ...story, flips: [...story.flips.filter((c) => c !== city), city] };
}

// ---------------------------------------------------------------------------
// Atlas pages (STORY §1.3: the If-then line + links to the chapter's habit cards)

export interface AtlasPage {
  city: string;
  name: string;
  ifThen: IfThen;
  cards: string[];
}

/** Atlas pages for the postcards collected, in finish order. Chapters without an If-then line have no page yet. */
export function atlasPages(chapters: readonly Pick<Chapter, 'city' | 'name' | 'atlas_cards'>[], story: StoryState, lines: ReadonlyMap<string, IfThen>): AtlasPage[] {
  return story.postcards.flatMap((city) => {
    const c = chapters.find((x) => x.city === city);
    const ifThen = lines.get(city);
    return c && ifThen ? [{ city, name: c.name, ifThen, cards: [...(c.atlas_cards ?? [])] }] : [];
  });
}

// ---------------------------------------------------------------------------
// Save sanitiser (save.ts calls it; no Zod at runtime)

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IDS = 200;

export function sanitiseStory(v: unknown): StoryState {
  const o = typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const ids = (x: unknown): string[] => (Array.isArray(x) ? [...new Set(x.filter((s): s is string => typeof s === 'string' && SLUG.test(s)))].slice(0, MAX_IDS) : []);
  return { postcards: ids(o.postcards), flips: ids(o.flips), seen: ids(o.seen) };
}
