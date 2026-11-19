/**
 * Save state (Red Line 7: localStorage only; no network, no analytics, no
 * accounts). Versioned and migration-safe:
 *
 * - `parseSave(raw)` never throws. Unknown or corrupt data → a fresh save.
 *   Every field is sanitised on its own, so one bad field never loses the rest.
 * - A save from a *newer* version is left untouched in storage (the store
 *   goes read-only for this session) so an older cached build can't wipe it.
 * - `createStore(storage)` wraps every storage call in try/catch and works
 *   with no storage at all (private mode, disabled storage, quota errors):
 *   the game keeps running in memory.
 *
 * Stored: settings, per-chapter progress and records, flags, arc state,
 * habit progress, which one-off callouts were shown, and the story layer (postcards, flips, scenes seen). No personal data
 * beyond the optional in-game nickname (GDD §2), which never leaves the device.
 */
import { EMPTY_ARC, type ArcState } from './arc.ts';
import type { ScenarioRecord, Stamp } from './chapter.ts';
import type { HabitProgress } from './habits.ts';
import { EMPTY_STORY, sanitiseStory, type StoryState } from './story.ts';
import type { TimerMode } from './timer.ts';

export const SAVE_KEY = 'scam-atlas-europe:save';
export const SAVE_VERSION = 1;

export interface Settings {
  /** null until the player chose (asked before the first timed scenario). */
  timerMode: TimerMode | null;
  pushers: boolean;
  callLines: 'auto' | 'step';
  alwaysTranslate: boolean;
  shortcuts: boolean;
  nickname: string | null;
}

export interface ChapterRun {
  /** Index into the chapter sequence of the next scenario to play. */
  index: number;
  records: ScenarioRecord[];
  /** Flags set by outcomes in this run (echoes read them). A replay starts with none. */
  flags: string[];
}

export interface ChapterProgress {
  finished: boolean;
  bestStamp: Stamp | null;
  bestRating: number;
  /** Play position when first started (0-based), for difficulty-by-position tuning. */
  position: number | null;
  run: ChapterRun | null;
}

export interface SaveState {
  version: typeof SAVE_VERSION;
  settings: Settings;
  chapters: Record<string, ChapterProgress>;
  /** Game-wide flags: only those set by arc beats (the arc spans chapters). Echo flags live in the chapter run. */
  flags: string[];
  arc: ArcState;
  habits: Record<string, HabitProgress>;
  callouts: { pressureAny: boolean; pressureGenuine: boolean };
  /** Coach marks already shown in this game, e.g. `payee_check` (CR-23: first payee-name check). */
  coachMarks: string[];
  /** Story layer (S3): postcards collected, flips, scenes seen. Content ids only; additive, no version bump. */
  story: StoryState;
}

export const DEFAULT_SETTINGS: Settings = {
  timerMode: null,
  pushers: true,
  callLines: 'auto',
  alwaysTranslate: false,
  shortcuts: false,
  nickname: null,
};

export function freshSave(): SaveState {
  return {
    version: SAVE_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    chapters: {},
    flags: [],
    arc: { ...EMPTY_ARC, vars: {}, timeline: [] },
    habits: {},
    callouts: { pressureAny: false, pressureGenuine: false },
    coachMarks: [],
    story: { ...EMPTY_STORY, postcards: [], flips: [], seen: [] },
  };
}

/** Calm preset (GDD §8, UI_SPEC §11): timers off + pushy follow-ups off + call lines step through. */
export function calmPreset(s: Settings): Settings {
  return { ...s, timerMode: 'off', pushers: false, callLines: 'step' };
}

export function isCalm(s: Settings): boolean {
  return s.timerMode === 'off' && !s.pushers;
}

// ---------------------------------------------------------------------------
// Sanitisers (no Zod at runtime)

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const bool = (v: unknown, d: boolean): boolean => (typeof v === 'boolean' ? v : d);
const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const SNAKE = /^[a-z][a-z0-9_]*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LO = /^LO-\d{2}$/;
const strings = (v: unknown, re: RegExp): string[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && re.test(x)))] : []);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], d: T): T => (typeof v === 'string' && (opts as readonly string[]).includes(v) ? (v as T) : d);
const NICKNAME_MAX = 24;
const MAX_RUN_INDEX = 100;

function sanitiseSettings(v: unknown): Settings {
  const o = isObj(v) ? v : {};
  const nick = typeof o.nickname === 'string' ? o.nickname.trim().slice(0, NICKNAME_MAX) : '';
  return {
    timerMode: o.timerMode === null || o.timerMode === undefined ? null : oneOf(o.timerMode, ['standard', 'extended', 'off'] as const, 'standard'),
    pushers: bool(o.pushers, DEFAULT_SETTINGS.pushers),
    callLines: oneOf(o.callLines, ['auto', 'step'] as const, 'auto'),
    alwaysTranslate: bool(o.alwaysTranslate, false),
    shortcuts: bool(o.shortcuts, false),
    nickname: nick.length > 0 ? nick : null,
  };
}

function sanitiseRecord(v: unknown): ScenarioRecord | null {
  if (!isObj(v) || typeof v.id !== 'string' || !SLUG.test(v.id)) return null;
  return {
    id: v.id,
    scored: bool(v.scored, false),
    points: num(v.points, 0),
    maxPoints: Math.max(0, num(v.maxPoints, 0)),
    stars: typeof v.stars === 'number' ? Math.max(0, Math.min(3, Math.round(v.stars))) : null,
    correctTags: Math.max(0, num(v.correctTags, 0)),
    wrongTags: Math.max(0, num(v.wrongTags, 0)),
    redFlags: Math.max(0, num(v.redFlags, 0)),
    genuineReported: Math.max(0, num(v.genuineReported, 0)),
    doubleCheckedHarmless: bool(v.doubleCheckedHarmless, false),
    pattern: typeof v.pattern === 'string' && SLUG.test(v.pattern) ? v.pattern : null,
  };
}

function sanitiseChapter(v: unknown): ChapterProgress {
  const o = isObj(v) ? v : {};
  const run = isObj(o.run)
    ? {
        // Upper bound: no chapter has this many scenarios; game.ts clamps to the real sequence (QA E8).
        index: Math.min(MAX_RUN_INDEX, Math.max(0, Math.floor(num(o.run.index, 0)))),
        records: Array.isArray(o.run.records) ? o.run.records.map(sanitiseRecord).filter((r): r is ScenarioRecord => r !== null) : [],
        flags: strings(o.run.flags, SNAKE),
      }
    : null;
  return {
    finished: bool(o.finished, false),
    bestStamp: o.bestStamp === 'bronze' || o.bestStamp === 'silver' || o.bestStamp === 'gold' ? o.bestStamp : null,
    bestRating: Math.max(0, Math.min(100, num(o.bestRating, 0))),
    position: typeof o.position === 'number' && Number.isInteger(o.position) && o.position >= 0 ? o.position : null,
    run,
  };
}

function sanitiseArc(v: unknown): ArcState {
  const o = isObj(v) ? v : {};
  const vars: Record<string, number | boolean> = {};
  if (isObj(o.vars)) {
    for (const [k, x] of Object.entries(o.vars)) if (SNAKE.test(k) && (typeof x === 'boolean' || (typeof x === 'number' && Number.isFinite(x)))) vars[k] = x;
  }
  return {
    vars,
    closes: Math.max(0, Math.floor(num(o.closes, 0))),
    tellMeNow: bool(o.tellMeNow, false),
    reportedAtSlot: typeof o.reportedAtSlot === 'number' && o.reportedAtSlot >= 1 && o.reportedAtSlot <= 9 ? o.reportedAtSlot : null,
    closed: bool(o.closed, false),
    points: num(o.points, 0),
    timeline: Array.isArray(o.timeline) ? o.timeline.filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 9) : [],
  };
}

function sanitiseHabits(v: unknown): Record<string, HabitProgress> {
  const out: Record<string, HabitProgress> = {};
  if (!isObj(v)) return out;
  for (const [k, x] of Object.entries(v)) {
    if (!LO.test(k) || !isObj(x)) continue;
    out[k] = { scenarios: strings(x.scenarios, SLUG), hard: bool(x.hard, false) };
  }
  return out;
}

/**
 * Migrations from older versions, keyed by the version they upgrade *from*.
 * v0 = any unversioned object a pre-release build might have written.
 */
const MIGRATIONS: Record<number, (o: Obj) => Obj> = {
  0: (o) => ({ ...o, version: 1 }),
};

export type ParseResult = { save: SaveState; status: 'ok' | 'fresh' | 'migrated' | 'newer' };

export function parseSave(raw: string | null): ParseResult {
  if (raw === null) return { save: freshSave(), status: 'fresh' };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { save: freshSave(), status: 'fresh' };
  }
  if (!isObj(data)) return { save: freshSave(), status: 'fresh' };
  let version = typeof data.version === 'number' && Number.isInteger(data.version) ? data.version : 0;
  if (version > SAVE_VERSION) return { save: freshSave(), status: 'newer' };
  let o: Obj = data;
  let migrated = false;
  while (version < SAVE_VERSION) {
    const m = MIGRATIONS[version];
    if (!m) return { save: freshSave(), status: 'fresh' };
    o = m(o);
    version++;
    migrated = true;
  }
  const chapters: Record<string, ChapterProgress> = {};
  if (isObj(o.chapters)) for (const [k, v] of Object.entries(o.chapters)) if (SLUG.test(k)) chapters[k] = sanitiseChapter(v);
  const callouts = isObj(o.callouts) ? o.callouts : {};
  const save: SaveState = {
    version: SAVE_VERSION,
    settings: sanitiseSettings(o.settings),
    chapters,
    flags: strings(o.flags, SNAKE),
    arc: sanitiseArc(o.arc),
    habits: sanitiseHabits(o.habits),
    callouts: { pressureAny: bool(callouts.pressureAny, false), pressureGenuine: bool(callouts.pressureGenuine, false) },
    coachMarks: strings(o.coachMarks, SNAKE),
    story: sanitiseStory(o.story),
  };
  return { save, status: migrated ? 'migrated' : 'ok' };
}

/** Minimal Storage surface (localStorage, or a fake in tests). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveStore {
  load(): SaveState;
  /** Returns false when the save could not be written (no storage, quota, newer save present). */
  save(s: SaveState): boolean;
  reset(): boolean;
  /** True when a newer build's save is in storage; writes are skipped to protect it. */
  readonly readOnly: boolean;
}

/** The browser's localStorage if usable, else null. Never throws. */
export function browserStorage(): StorageLike | null {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    const probe = `${SAVE_KEY}:probe`;
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

export function createStore(storage: StorageLike | null): SaveStore {
  let readOnly = false;
  return {
    get readOnly() {
      return readOnly;
    },
    load() {
      let raw: string | null;
      try {
        raw = storage?.getItem(SAVE_KEY) ?? null;
      } catch {
        raw = null;
      }
      const r = parseSave(raw);
      readOnly = r.status === 'newer';
      return r.save;
    },
    save(s) {
      if (!storage || readOnly) return false;
      try {
        storage.setItem(SAVE_KEY, JSON.stringify(s));
        return true;
      } catch {
        return false;
      }
    },
    reset() {
      if (!storage) return false;
      try {
        storage.removeItem(SAVE_KEY);
        readOnly = false;
        return true;
      } catch {
        return false;
      }
    },
  };
}
