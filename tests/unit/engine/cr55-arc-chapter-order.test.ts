/**
 * CR-55 (QA Phase 3 gate, B1 + B2).
 *
 * B1: a chapter's arc position plays the lowest arc slot not yet played (CR-49), often another chapter's arc file.
 * The run records that foreign id; the QA E8 tamper check (`runIsTampered`) could not place it and restarted the
 * run before the next scenario, so the arc position came round again: Dublin (arc beat first) chained slots 2–8,
 * Rome replayed rome-01/02 after slot 9. The chapters below are played the way `next()` in src/app.tsx does it
 * (beginChapter before every scenario, the arc-file lookup by map slot, commit at the sequence index played), over
 * the real content, in the default order and in interleaved orders.
 *
 * B2: a `reply` on an arc beat (engage, never the scoring decision) was stored as `timer_expiry`, so the finale
 * timeline said "You stepped back from it." Every arc file's every option is played through `commitScenario`.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readYaml } from '../../../scripts/lib/content.ts';
import { chapterSchema, scenarioSchema, type Chapter, type Scenario } from '../../../src/content/schema.ts';
import { arcSlotForRun, finalePlan, timelineChoice, timelineRows, type TimelineChoice } from '../../../src/engine/arc.ts';
import { nextIndex, sequenceOf } from '../../../src/engine/chapter.ts';
import { arcDecisiveKind, beginChapter, chapterProgress, commitScenario, finishChapter, runFlags, runIndex, runIsTampered } from '../../../src/engine/game.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { startScenario, step, viewOf, type RunnerContext, type RunnerState } from '../../../src/engine/runner.ts';
import { ARC_CHOICES_FIX, freshSave, parseSave, SAVE_FIXES, type SaveState } from '../../../src/engine/save.ts';
import { classOf } from '../../../src/engine/scoring.ts';
import { timelineChoiceText } from '../../../src/ui/ArcFinale.tsx';
import { ROOT } from '../../content/fixtures.ts';
import { B } from './helpers.ts';

const CONTENT = resolve(ROOT, 'content');
const chapters: Chapter[] = readdirSync(resolve(CONTENT, 'chapters'))
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => chapterSchema.parse(readYaml(resolve(CONTENT, 'chapters', f))))
  .sort((a, b) => a.slot - b.slot);
const all = new Map<string, Scenario>();
for (const d of readdirSync(resolve(CONTENT, 'scenarios'))) {
  for (const f of readdirSync(resolve(CONTENT, 'scenarios', d)).filter((x) => x.endsWith('.yaml'))) {
    const s = scenarioSchema.parse(readYaml(resolve(CONTENT, 'scenarios', d, f)));
    all.set(s.id, s);
  }
}
const chapter = (city: string): Chapter => {
  const c = chapters.find((x) => x.city === city);
  if (!c) throw new Error(`no chapter ${city}`);
  return c;
};
const sc = (id: string): Scenario => {
  const s = all.get(id);
  if (!s) throw new Error(`no scenario ${id}`);
  return s;
};
const arcFiles = [...all.values()].filter((s) => s.role === 'arc' && s.arc_slot !== undefined).sort((a, b) => (a.arc_slot ?? 0) - (b.arc_slot ?? 0));

/** Arc beats: keep the arc open (never report, never Close at slot 1), so every slot plays. */
const ARC_PREF = ['reply', 'ask_someone', 'pay', 'verify_identity', 'check_official_list'];
const CLS_PREF = ['report', 'dismiss', 'verify', 'step'];

/** Plays a scenario to the end with a careful policy (report or check, no tags); `arcKind` forces the arc beat's choice. */
function playThrough(s: Scenario, slot: number, arcAction?: string): { st: RunnerState; c: RunnerContext } {
  const c: RunnerContext = { balance: B, slot, settings: { timerMode: 'off', pushers: false }, stress: 10 };
  let st = startScenario(s, c);
  for (let n = 0; n < 200 && st.phase !== 'done'; n++) {
    const v = viewOf(s, c, st);
    if (st.phase === 'consequence') st = step(s, c, st, { type: 'continue' });
    else if (st.phase === 'damage_control') st = step(s, c, st, { type: 'recovery', picks: (st.recovery?.options ?? []).filter((o) => o.category !== 'harmful').slice(0, B.recovery.pick).map((o) => o.step) });
    else if (st.phase === 'what_now') {
      const choices = v.whatNow?.choices ?? [];
      const pick = choices.find((x) => x.builtin === 'report') ?? choices[0];
      if (!pick) throw new Error(`${s.id}: no what-now choice`);
      st = step(s, c, st, { type: 'what_now', choice: pick.id });
    } else if (st.phase === 'interrupt' || (st.phase === 'playing' && !v.beat && v.interrupts.length > 0)) {
      const it = v.interrupts[0];
      const a = it?.actions[0];
      if (!it || !a) throw new Error(`${s.id}: interrupt without actions`);
      st = step(s, c, st, { type: 'interrupt_act', interruptId: it.id, actionId: a.id });
    } else if (st.phase === 'playing' && !v.beat) st = step(s, c, st, { type: 'tick', dt: 31 });
    else if (st.phase === 'playing' && v.beat) {
      const acts = v.beat.actions;
      const forced = arcAction !== undefined ? acts.find((a) => a.id === arcAction) : undefined;
      const arcPick = s.role === 'arc' ? ARC_PREF.map((k) => acts.find((a) => a.kind === k)).find((a) => a !== undefined) : undefined;
      const clsPick = CLS_PREF.map((cls) => acts.find((a) => classOf(B, a.kind) === cls)).find((a) => a !== undefined);
      const a = forced ?? arcPick ?? clsPick ?? acts[0];
      if (!a) throw new Error(`${s.id}: beat ${v.beat.id} has no action`);
      st = step(s, c, st, { type: 'act', actionId: a.id });
    } else throw new Error(`${s.id}: stuck in ${st.phase}`);
  }
  expect(st.phase, s.id).toBe('done');
  return { st, c };
}

interface Played {
  city: string;
  id: string;
  at: number;
  arcSlot: number | null;
}

/** One chapter played start to finish the way `next()` in src/app.tsx does it. */
function playChapter(save0: SaveState, c: Chapter, log: Played[]): { save: SaveState; ownRecords: string[] } {
  let save = save0;
  const seq = sequenceOf(c);
  for (let guard = 0; guard < 50; guard++) {
    // `next()` begins (or resumes) the chapter before every scenario.
    save = beginChapter(save, c.city, c);
    const flags = runFlags(save, c.city);
    let from = runIndex(save, c);
    let played = false;
    for (;;) {
      const i = nextIndex(c, from, () => [], flags);
      const id = i < 0 ? undefined : seq[i]?.id;
      if (!id) break;
      let s: Scenario | undefined = sc(id);
      let arcSlot: number | null = null;
      if (s.role === 'arc' && s.arc_slot !== undefined) {
        arcSlot = arcSlotForRun(save.arc, chapterProgress(save, c.city));
        const home = arcSlot === null ? undefined : chapters.find((x) => x.slot === arcSlot && x.arc_beat);
        s = home?.arc_beat ? sc(home.arc_beat) : undefined;
        if (!s) {
          from = i + 1;
          continue;
        }
      }
      if (!s.requires_flags.every((f) => flags.has(f))) {
        from = i + 1;
        continue;
      }
      const { st } = playThrough(s, c.slot);
      save = commitScenario(save, B, c, s, st, resultOf(s, B, st), i);
      log.push({ city: c.city, id: s.id, at: i, arcSlot });
      played = true;
      break;
    }
    if (!played) {
      const ownRecords = (chapterProgress(save, c.city).run?.records ?? []).map((r) => r.id);
      return { save: finishChapter(save, B, c).save, ownRecords };
    }
  }
  throw new Error(`${c.city}: the run never finished (restarted over and over?)`);
}

function playOrder(order: readonly string[]): { save: SaveState; log: Played[]; records: Record<string, string[]> } {
  let save = freshSave();
  const log: Played[] = [];
  const records: Record<string, string[]> = {};
  for (const city of order) {
    const r = playChapter(save, chapter(city), log);
    save = r.save;
    records[city] = r.ownRecords;
  }
  return { save, log, records };
}

const MIDDLE_DEFAULT = chapters.filter((c) => c.slot >= 2 && c.slot <= 9).map((c) => c.city);
const DEFAULT = ['home', 'berlin', ...MIDDLE_DEFAULT];
// QA P3 B1's repro (Dublin first: its arc beat is its first scenario; Rome next: its arc beat is third), then the rest reversed.
const QA_ORDER = ['home', 'berlin', 'dublin', 'rome', ...MIDDLE_DEFAULT.filter((c) => c !== 'dublin' && c !== 'rome').reverse()];
const REVERSED = ['home', 'berlin', ...[...MIDDLE_DEFAULT].reverse()];

function expectSane(order: readonly string[], { save, log, records }: ReturnType<typeof playOrder>) {
  const arcBeats = log.filter((p) => sc(p.id).role === 'arc');
  // Exactly one arc beat per chapter that has one (Berlin and the eight middle chapters), none in Home.
  for (const city of order) {
    const n = arcBeats.filter((p) => p.city === city).length;
    expect(n, `${city}: arc beats played`).toBe(chapter(city).arc_beat ? 1 : 0);
  }
  // Slots strictly rising in play order; slot 9 is the last arc beat (the close beat follows in Brussels).
  const slots = arcBeats.map((p) => sc(p.id).arc_slot);
  expect(slots).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(save.arc.timeline).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(save.arc.closed).toBe(false);
  expect(finalePlan(save.arc).steps[0], 'Brussels opens the finale with the close beat, right after slot 9').toBe('close');
  // Every chapter plays each of its own scenarios once, in order: no run restarted, nothing wiped.
  for (const city of order) {
    const c = chapter(city);
    const own = log.filter((p) => p.city === city && sc(p.id).role !== 'arc').map((p) => p.id);
    const expected = sequenceOf(c).map((e) => e.id).filter((id) => sc(id).role !== 'arc' && sc(id).requires_flags.length === 0);
    for (const id of expected) expect(own.filter((x) => x === id), `${city}: ${id} played once`).toHaveLength(1);
    const ats = log.filter((p) => p.city === city).map((p) => p.at);
    expect(ats, `${city}: sequence positions strictly rising`).toEqual([...ats].sort((a, b) => a - b));
    expect(new Set(ats).size, `${city}: no position played twice`).toBe(ats.length);
    for (const id of own) expect(records[city], `${city}: ${id} kept in the run's records`).toContain(id);
  }
}

describe('CR-55 B1: arc beats borrowed from another chapter do not restart the run', () => {
  it('default map order: each chapter plays its own arc file; timeline [1..9]', () => {
    const res = playOrder(DEFAULT);
    expectSane(DEFAULT, res);
    for (const p of res.log.filter((x) => sc(x.id).role === 'arc')) expect(p.id, p.city).toBe(chapter(p.city).arc_beat);
  });

  it("QA's order (Home, Berlin, Dublin, Rome, the rest reversed): one arc beat per chapter, slots rising, Rome keeps rome-01/02", () => {
    const res = playOrder(QA_ORDER);
    expectSane(QA_ORDER, res);
    const dublin = res.log.filter((p) => p.city === 'dublin');
    expect(dublin[0]).toMatchObject({ id: 'amsterdam-arc-alex-02', at: 0 });
    expect(dublin[1]?.id).toBe('dublin-01-tea-money');
    const rome = res.log.filter((p) => p.city === 'rome').map((p) => p.id);
    expect(rome.slice(0, 4)).toEqual(['rome-01-breakfast-till-ten', 'rome-02-teo-calls-you', 'paris-arc-alex-03', 'rome-03-police-card-call']);
    expect(res.records.rome).toEqual(expect.arrayContaining(['rome-01-breakfast-till-ten', 'rome-02-teo-calls-you', 'paris-arc-alex-03']));
    const last = res.log.filter((p) => sc(p.id).role === 'arc').at(-1);
    expect(last).toMatchObject({ id: 'stockholm-arc-alex-09' });
    expect(last?.city).toBe(QA_ORDER.at(-1));
  });

  it('middle chapters in reverse map order: same guarantees', () => {
    expectSane(REVERSED, playOrder(REVERSED));
  });

  it('a save already holding a borrowed arc record resumes after it (old saves in that state load sanely)', () => {
    const dublin = chapter('dublin');
    // QA's tamper repro: Dublin's run after the borrowed slot-2 beat, saved before `next()` ran.
    const raw = JSON.stringify({ ...freshSave(), fixes: [], chapters: { dublin: { finished: false, bestStamp: null, bestRating: 0, position: 2, run: { index: 1, records: [{ id: 'amsterdam-arc-alex-02', scored: false, points: 0, maxPoints: 0, stars: null, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleCheckedHarmless: false, pattern: null }], flags: [] } } } });
    const save = parseSave(raw).save;
    const run = chapterProgress(save, 'dublin').run;
    expect(run && runIsTampered(run, dublin)).toBe(false);
    const begun = beginChapter(save, 'dublin', dublin);
    expect(begun).toBe(save);
    expect(runIndex(begun, dublin)).toBe(1);
    // A save already reset by the old build (index 0, no records) simply plays on: one more arc beat at the arc position, then the chapter.
    const reset = { ...save, chapters: { dublin: { ...chapterProgress(save, 'dublin'), run: { index: 0, records: [], flags: [] } } } };
    expect(beginChapter(reset, 'dublin', dublin)).toBe(reset);
  });

  it('real tampering is still caught (QA E8): a foreign record explains the arc position and nothing beyond it', () => {
    const dublin = chapter('dublin');
    const rome = chapter('rome');
    const home = chapter('home');
    const foreign = [{ id: 'amsterdam-arc-alex-02' }];
    expect(runIsTampered({ index: 1, records: foreign }, dublin)).toBe(false);
    expect(runIsTampered({ index: 2, records: foreign }, dublin)).toBe(true);
    expect(runIsTampered({ index: 5, records: foreign }, dublin)).toBe(true);
    // Rome's arc beat is its third scenario.
    expect(runIsTampered({ index: 3, records: [{ id: 'rome-01-breakfast-till-ten' }, { id: 'rome-02-teo-calls-you' }, { id: 'stockholm-arc-alex-09' }] }, rome)).toBe(false);
    expect(runIsTampered({ index: 4, records: [{ id: 'stockholm-arc-alex-09' }] }, rome)).toBe(true);
    // A chapter without an arc beat explains no foreign record; an unknown id with no arc beat explains nothing.
    expect(runIsTampered({ index: 1, records: foreign }, home)).toBe(true);
    expect(runIsTampered({ index: 1, records: foreign }, { scenario_order: dublin.scenario_order })).toBe(true);
    // Own records as before.
    expect(runIsTampered({ index: 3, records: [{ id: 'dublin-02-presenter-ad' }] }, dublin)).toBe(false);
    expect(runIsTampered({ index: 4, records: [{ id: 'dublin-02-presenter-ad' }] }, dublin)).toBe(true);
  });
});

const EXPECTED: Record<string, (slot: number) => TimelineChoice> = {
  reply: (slot) => (slot === 1 ? 'replied' : 'went_along'),
  pay: () => 'paid',
  ignore: () => 'stepped_back',
  ask_someone: () => 'asked',
  report: () => 'reported',
  verify_identity: () => 'checked',
  check_official_list: () => 'checked',
};

describe('CR-55 B2: the arc timeline records the action actually chosen', () => {
  it('there is one arc file per slot 1–9', () => {
    expect(arcFiles.map((s) => s.arc_slot)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  for (const s of arcFiles) {
    for (const a of s.actions) {
      it(`${s.id} (slot ${s.arc_slot}): ${a.id} (${a.kind})`, () => {
        const slot = s.arc_slot ?? 0;
        const want = EXPECTED[a.kind];
        expect(want, `no expected wording for kind ${a.kind}`).toBeDefined();
        const { st } = playThrough(s, slot, a.id);
        expect(st.groups[0]?.timerExpired).toBe(false);
        expect(arcDecisiveKind(B, st.groups[0])).toBe(a.kind);
        const save = commitScenario(freshSave(), B, chapter('home'), s, st, resultOf(s, B, st), 0);
        expect(save.arc.choices).toEqual([{ slot, kind: a.kind }]);
        const rows = timelineRows(save.arc, () => s.debrief.layer1.tell);
        expect(rows).toHaveLength(1);
        const choice = want?.(slot);
        expect(rows[0]?.choice).toBe(choice);
        if (a.kind !== 'ignore') expect(timelineChoiceText(rows[0]?.choice ?? 'stepped_back', 'Alex')).not.toBe('You stepped back from it.');
        if (a.kind === 'reply') expect(timelineChoiceText(rows[0]?.choice ?? 'stepped_back', 'Alex')).toBe(slot === 1 ? 'You replied. Nothing wrong with that.' : 'Alex pushed, and you went along.');
        // CR-51: only report and ask_someone tell someone.
        expect(save.flags.includes('arc_told_someone'), 'arc_told_someone').toBe(a.kind === 'report' || a.kind === 'ask_someone');
      });
    }
  }

  it('a real timer expiry with nothing decided still records timer_expiry ("You stepped back from it.")', () => {
    const g = { decision: undefined, timerExpired: true, kinds: [] };
    expect(arcDecisiveKind(B, g)).toBeUndefined();
    expect(arcDecisiveKind(B, { ...g, kinds: ['reply'] })).toBeUndefined();
    expect(arcDecisiveKind(B, { decision: undefined, timerExpired: false, kinds: ['pause', 'reply'] })).toBe('reply');
    expect(arcDecisiveKind(B, { decision: undefined, timerExpired: false, kinds: ['reply', 'pause'] })).toBe('reply');
    expect(arcDecisiveKind(B, undefined)).toBeUndefined();
    expect(timelineChoice('timer_expiry', 4)).toBe('stepped_back');
  });

  it('old saves: a stored timer_expiry on an arc slot (only ever a reply) becomes reply once, on load', () => {
    expect(SAVE_FIXES).toContain(ARC_CHOICES_FIX);
    expect(freshSave().fixes).toContain(ARC_CHOICES_FIX);
    const choices = [{ slot: 1, kind: 'timer_expiry' }, { slot: 2, kind: 'ask_someone' }, { slot: 4, kind: 'timer_expiry' }];
    const raw = (fixes: string[]) => JSON.stringify({ ...freshSave(), fixes, arc: { ...freshSave().arc, timeline: [1, 2, 4], choices } });
    const fixed = parseSave(raw(['arc_flags_cr51'])).save;
    expect(fixed.arc.choices).toEqual([{ slot: 1, kind: 'reply' }, { slot: 2, kind: 'ask_someone' }, { slot: 4, kind: 'reply' }]);
    expect(fixed.fixes).toContain(ARC_CHOICES_FIX);
    expect(timelineRows(fixed.arc, () => 'tell').map((r) => r.choice)).toEqual(['replied', 'asked', 'went_along']);
    // Idempotent and applied once: a save that already has the fix keeps what it stores.
    expect(parseSave(JSON.stringify(fixed)).save.arc.choices).toEqual(fixed.arc.choices);
    expect(parseSave(raw(['arc_flags_cr51', ARC_CHOICES_FIX])).save.arc.choices).toEqual(choices);
  });
});
