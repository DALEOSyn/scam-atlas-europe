import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { balance } from './content/balance.ts';
import { listChapters } from './content/chapters.ts';
import type { Chapter, Scenario, Scene } from './content/schema.ts';
import { loadScenario } from './content/scenarios.ts';
import { listScenes, type SceneRef } from './content/scenes.ts';
import { advanceFinale, arcSlotForRun, bankArcPoints, enterFinale, finaleDone, finaleStep, tellMeNow, timelineRows, type ArcEnding, type FinaleStep, type TimelineRow } from './engine/arc.ts';
import { orderOptions, scoreRecovery, type RecoveryOption } from './engine/recovery.ts';
import type { ChapterSummary } from './engine/chapter.ts';
import { debriefOf, type DebriefData } from './engine/debrief.ts';
import { beginChapter, carriedStress, chapterProgress, commitScenario, finishChapter, runFlags, runIndex, sceneFlags } from './engine/game.ts';
import { isStopPointAfter, messagesLeft, nextIndex, sequenceOf, unlockedChapters } from './engine/chapter.ts';
import { useSave } from './engine/hooks.ts';
import type { ScenarioResult } from './engine/result.ts';
import type { RunnerContext, RunnerState } from './engine/runner.ts';
import { calmPreset, type SaveState, type SaveStore, type Settings } from './engine/save.ts';
import {
  arrivalSceneId,
  atlasPages,
  chapterSceneIds,
  dueInterlude,
  epigraphOf,
  ifThenOf,
  INTERLUDES,
  markSeen,
  middleFinished,
  pickFlip,
  recordFlip,
  resolutionSceneId,
  resolutionSceneIds,
  scenePlaysFor,
  scenesAfter,
  storyVars,
  turnSceneId,
  type AtlasPage,
  type IfThen,
} from './engine/story.ts';
import { defaultTimerMode, type TimerMode } from './engine/timer.ts';
import { t } from './i18n/index.ts';
import { AnnouncerProvider } from './ui/Announcer.tsx';
import { ChapterDone, type BossLesson } from './ui/ChapterDone.tsx';
import { ChapterIntro } from './ui/ChapterIntro.tsx';
import { ChapterList, type ChapterListFocus, type ChapterRow } from './ui/ChapterList.tsx';
import { DebriefView } from './ui/DebriefView.tsx';
import { ArcReveal } from './ui/ArcReveal.tsx';
import { arcName, RevealScreen, TimelineScreen } from './ui/ArcFinale.tsx';
import { EndScreen } from './ui/EndScreen.tsx';
import { HelpCountryProvider } from './ui/HelpCards.tsx';
import { AtlasScreen, SceneReplayList } from './ui/Atlas.tsx';
import { ScenePlayer, sceneHeading, scenePart, type FlipPick } from './ui/ScenePlayer.tsx';
import { DamageControl, ScenarioView } from './ui/ScenarioView.tsx';
import { SettingsPanel } from './ui/Settings.tsx';
import { StopScreen } from './ui/StopScreen.tsx';
import styles from './app.module.css';

/** `finale`: a scenario of the arc finale block (CR-43): its debrief leads back to the block, not the chapter. */
type Progress = { index: number; total: number; finale?: FinaleStep | undefined };

type Screen =
  /** `from`: the screen we came back from, so focus returns to its button (QA T-2.8 m1), never to <body>. */
  | { kind: 'title'; from?: 'chapters' | 'settings' | 'atlas' | 'elsewhere' }
  /** `focus`: the button to return focus to (review T-S3 item 16), else the heading. */
  | { kind: 'chapters'; focus?: ChapterListFocus }
  | { kind: 'settings' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'timing'; scenario: Scenario; progress: Progress }
  | { kind: 'playing'; scenario: Scenario; attempt: number; progress: Progress }
  | { kind: 'debrief'; scenario: Scenario; data: DebriefData; progress: Progress }
  | { kind: 'stop'; done: number; total: number; left: number }
  /** CR-27: the chapter intro, on every chapter start from its first scenario (after the Arrival scene). */
  | { kind: 'intro'; chapter: Chapter; resume: boolean }
  | { kind: 'reveal'; timeline: TimelineRow[]; names: readonly string[] | null }
  /** CR-43: steps of the arc finale block that are screens of their own. */
  | { kind: 'finale_reveal'; chapter: Chapter; names: readonly string[] }
  | { kind: 'finale_damage'; chapter: Chapter; options: RecoveryOption[] }
  | { kind: 'finale_timeline'; chapter: Chapter; rows: TimelineRow[] }
  /** CR-44(b): the end screen "Your Atlas", after the finale's chapter end. */
  | { kind: 'end'; epigraph: { speaker: string; line: string } | null; pages: AtlasPage[] }
  | { kind: 'chapter_done'; summary: ChapterSummary; city: string; postcard: { ifThen: IfThen; backdrop?: string | undefined } | null; boss: BossLesson | null; end?: (() => void) | undefined }
  /** A story scene (S3). `then` runs after it ends (finished or skipped). */
  | { kind: 'scene'; scene: Scene; heading: string; chapterName: string; flip: FlipPick | null; flipChoices: FlipPick[] | null; note: string | null; flags: string[]; ending: ArcEnding | null; then: () => void }
  /** `back`: where the Atlas was opened from (the title screen or the chapter list). */
  | { kind: 'atlas'; pages: AtlasPage[]; loading: boolean; back: 'title' | 'chapters' }
  /** `scenes` null while loading; `focus`: the scene whose "Watch:" button gets focus (after a replay). */
  | { kind: 'replay'; city: string; scenes: { id: string; label: string }[] | null; focus?: string | undefined };

export interface AppProps {
  /** Injected in tests: play this one scenario as the whole chapter. */
  loadFirst?: () => Promise<Scenario>;
  /** Injected in tests; defaults to localStorage (or memory when storage is unavailable). */
  store?: SaveStore;
  /** Injected in tests: the chapter list (defaults to content/chapters/*.yaml). */
  chapters?: Chapter[];
  /** Injected in tests: scenario lookup (defaults to the lazily loaded content chunks). */
  load?: (city: string, id: string) => Promise<Scenario | undefined>;
  /** Injected in tests: story scenes (defaults to the lazily loaded content/scenes chunks). */
  sceneRefs?: SceneRef[];
}

/** A one-scenario stand-in chapter (tests, or no chapter file). */
function soloChapter(s: Scenario | null): Chapter {
  return {
    slot: 0,
    city: s?.chapter ?? 'home',
    name: 'Home',
    status: 'draft',
    patterns: s?.pattern ? [s.pattern] : ['none'],
    callbacks: [],
    lo_focus: ['LO-01'],
    scenario_order: { am: s ? [s.id] : [], pm: [] },
    intro: '',
  };
}


function prefersReducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SR_MIN_INTERVAL = (balance.pushers as { sr_announce_min_interval_seconds?: number }).sr_announce_min_interval_seconds ?? 15;

/** Focus a screen's heading when it appears (UI_SPEC §10.3; QA: no focus loss on the timing screen). */
function useFocusOnMount() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}

/**
 * Timing, asked before the first timed scenario (UI_SPEC §6.1, §11): Standard / Extended / Off as one
 * choice, Extended pre-selected when the device asks for reduced motion (QA m7), plus the Calm preset.
 */
export function TimingScreen({ onChoose, preselect }: { onChoose: (mode: TimerMode | 'calm') => void; preselect: TimerMode }) {
  const heading = useFocusOnMount();
  const [mode, setMode] = useState<TimerMode>(preselect);
  return (
    <main class={styles.shell}>
      <section aria-labelledby="timing-heading" class={styles.choices}>
        <h1 id="timing-heading" ref={heading} tabIndex={-1} class={styles.screenTitle}>
          {t('timing_title')}
        </h1>
        <p>{t('timing_intro')}</p>
        <fieldset class={styles.radios}>
          <legend class={styles.vh}>{t('settings_timing')}</legend>
          {(['standard', 'extended', 'off'] as const).map((m) => (
            <label key={m} class={styles.choice}>
              <input type="radio" name="timing" value={m} checked={mode === m} onChange={() => setMode(m)} />
              <span>{t(m === 'standard' ? 'timing_standard' : m === 'extended' ? 'timing_extended' : 'timing_off')}</span>
            </label>
          ))}
        </fieldset>
        <button type="button" class={styles.start} onClick={() => onChoose(mode)}>
          {t('timing_continue')}
        </button>
        <button type="button" class={styles.choice} onClick={() => onChoose('calm')}>
          {t('timing_calm')}
        </button>
      </section>
    </main>
  );
}

/** The chapter a press on Start continues: one with a run in progress, else the first unlocked one not finished. */
export function resumeChapter(chapters: readonly Chapter[], save: SaveState): Chapter | null {
  const finished = new Set(chapters.filter((c) => chapterProgress(save, c.city).finished).map((c) => c.city));
  const unlocked = unlockedChapters(chapters, finished);
  const open = chapters.filter((c) => unlocked.includes(c.city));
  return open.find((c) => (chapterProgress(save, c.city).run?.index ?? 0) > 0) ?? open.find((c) => !finished.has(c.city)) ?? null;
}

export function chapterRows(chapters: readonly Chapter[], save: SaveState): ChapterRow[] {
  const finished = new Set(chapters.filter((c) => chapterProgress(save, c.city).finished).map((c) => c.city));
  const unlocked = unlockedChapters(chapters, finished);
  return chapters.map((c) => {
    const p = chapterProgress(save, c.city);
    const before = chapters.filter((x) => x.slot < c.slot && !finished.has(x.city)).at(-1);
    return {
      city: c.city,
      name: c.name,
      locked: !unlocked.includes(c.city),
      lockedBy: before?.name ?? null,
      inProgress: (p.run?.index ?? 0) > 0,
      finished: p.finished,
      stamp: p.bestStamp,
    };
  });
}

/** The content note for a chapter (STORY §5.6): the Brussels variant when the arc closed with "Tell me now". */
export function chapterNote(c: Pick<Chapter, 'content_note' | 'content_note_arc_closed'> | undefined, save: SaveState): string | null {
  if (!c?.content_note) return null;
  return save.arc.tellMeNow && c.content_note_arc_closed ? c.content_note_arc_closed : c.content_note;
}

export function App({ loadFirst, store, chapters: injected, load = loadScenario, sceneRefs: injectedScenes }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const [save, update, currentSave] = useSave(store);
  // Story scenes (S3). With none bundled the game plays exactly as before (no Atlas button, no scene screens).
  const sceneRefs = useMemo(() => (loadFirst ? [] : (injectedScenes ?? listScenes())), [injectedScenes, loadFirst]);
  const hasScenes = sceneRefs.length > 0;
  const [solo, setSolo] = useState<Scenario | null>(null);
  const [soloDone, setSoloDone] = useState(false);
  const chapters = useMemo(() => injected ?? listChapters(), [injected]);
  const [city, setCity] = useState<string | null>(null);
  const soloCh = useMemo(() => soloChapter(solo), [solo]);
  // The chapter being played: picked on the chapter list or by Start (B1), never just the first one.
  const chapter: Chapter = loadFirst ? soloCh : (chapters.find((c) => c.city === city) ?? resumeChapter(chapters, save) ?? chapters[0] ?? soloCh);
  const [stress, setStress] = useState<number | null>(null);
  // Back on the start screen: focus the button that opened the page we left, else the title (QA T-2.8 m1).
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleFrom = screen.kind === 'title' ? screen.from : undefined;
  useEffect(() => {
    if (!titleFrom) return;
    const btn = titleFrom === 'elsewhere' ? null : document.querySelector<HTMLElement>(`[data-title-button="${titleFrom}"]`);
    (btn ?? titleRef.current)?.focus();
  }, [screen]);

  const reduced = prefersReducedMotion();
  const timerMode: TimerMode = save.settings.timerMode ?? defaultTimerMode(reduced);
  const resume = loadFirst ? null : resumeChapter(chapters, save);
  // "Continue" after a reload when a chapter run is in progress (QA carry-over).
  const resumable = !!resume && (chapterProgress(save, resume.city).run?.index ?? 0) > 0;

  const play = (scenario: Scenario, current: SaveState, progress: Progress) => {
    if (scenario.pressure.timer && current.settings.timerMode === null) setScreen({ kind: 'timing', scenario, progress });
    else setScreen({ kind: 'playing', scenario, attempt: Date.now(), progress });
  };

  const sceneById = async (id: string | null | undefined): Promise<Scene | undefined> => {
    const ref = id ? sceneRefs.find((r) => r.id === id) : undefined;
    return ref ? ref.load().catch(() => undefined) : undefined;
  };

  /** If-then lines of these cities' resolution scenes (postcards, flip the postcard, Atlas pages). */
  const ifThenLines = async (cities: readonly string[]): Promise<Map<string, IfThen>> => {
    const out = new Map<string, IfThen>();
    for (const city of cities) {
      const c = chapters.find((x) => x.city === city);
      const line = ifThenOf(await sceneById(c ? resolutionSceneId(c) : null));
      if (line) out.set(city, line);
    }
    return out;
  };

  /** Chapter runs (by city) whose content note was already shown in a scene (review T-S3 item 13). */
  const notedRuns = useRef(new Set<string>());
  /**
   * CR-28 (T-S4b QA S3): a replay session shows the content note once, on its first sensitive scene; the
   * session ends when the player leaves the replay list (it is reset when the list is opened from the chapters).
   */
  const replayNoted = useRef(false);

  /**
   * Play a story scene, then `then()`. A missing scene (or none placed) simply carries on, so a chapter
   * without scenes plays unchanged. The scene is recorded as seen when it ends, finished or skipped.
   * The content note gates the first sensitive scene of a chapter run and of a replay session [P, CR-28];
   * later sensitive scenes of the same run or session keep only the "Need to talk?" label.
   */
  const playScene = async (id: string | null | undefined, then: () => void, c: Chapter | null, opts: { replay?: boolean } = {}) => {
    if (!id) return then();
    // Loading first, so a second tap while the chunk loads cannot queue the scene twice (item 19).
    setScreen({ kind: 'loading' });
    const scene = await sceneById(id);
    if (!scene) return then();
    const current = currentSave();
    // CR-43(d): a finale resolution scene keyed to other arc endings does not play (replays included).
    const ending = current.arc.finale?.ending ?? null;
    const flags = sceneFlags(current, c?.city ?? null);
    if (!scenePlaysFor(scene, ending, flags)) return then();
    let flip: FlipPick | null = null;
    let flipChoices: FlipPick[] | null = null;
    if (scene.panels.some((p) => p.flip_postcard)) {
      const lines = await ifThenLines(current.story.postcards);
      const pickOf = (city: string): FlipPick | null => {
        const line = lines.get(city);
        return line ? { city, cityName: chapters.find((x) => x.city === city)?.name ?? city, ifThen: line } : null;
      };
      if (scene.slot === 'resolution') {
        // CR-44(a): at the Open Evening (a resolution) the player picks any collected postcard.
        flipChoices = current.story.postcards.flatMap((c) => pickOf(c) ?? []);
      } else {
        // Interludes: the engine picks by the spacing rule (STORY §3.12).
        const city = pickFlip(current.story, (x) => lines.has(x));
        flip = city ? pickOf(city) : null;
      }
    }
    // Interludes all share one chapter key, so each sensitive interlude gates on its own id.
    const noteKey = scene.slot === 'interlude' ? scene.id : scene.chapter;
    const gate = opts.replay ? !replayNoted.current : !notedRuns.current.has(noteKey);
    const note = scene.sensitive && gate ? (scene.content_note ?? chapterNote(c ?? undefined, current)) : null;
    if (note && opts.replay) replayNoted.current = true;
    else if (note) notedRuns.current.add(noteKey);
    const home = scene.chapter === INTERLUDES ? null : (c ?? chapters.find((x) => x.city === scene.chapter) ?? null);
    setScreen({
      kind: 'scene',
      scene,
      heading: sceneHeading(scene, home),
      chapterName: home?.name ?? '',
      flip,
      flipChoices,
      note,
      flags: [...flags],
      ending,
      then: () => {
        update((sv) => ({ ...sv, story: markSeen(sv.story, scene.id) }));
        then();
      },
    });
  };

  /** Several scenes in a row (spec-placed beats after one scenario), then `then()`. */
  const playScenes = (ids: readonly string[], then: () => void, c: Chapter | null) => {
    const [first, ...rest] = ids;
    if (!first) return then();
    void playScene(first, () => playScenes(rest, then, c), c);
  };

  const endChapter = async (current: SaveState, c: Chapter) => {
    const r = finishChapter(current, balance, c);
    update(() => r.save);
    setSoloDone(false);
    setStress(null);
    // The postcard to Teo comes with finishing the chapter, whatever the score (STORY §1.3).
    const resolution = await sceneById(resolutionSceneId(c));
    const ifThen = ifThenOf(resolution);
    const backdrop = resolution?.panels.at(-1)?.backdrop;
    // [P] Amsterdam QA h: the stamp screen carries the boss's layer-1 tell and what works.
    const bossScenario = c.boss ? await load(c.city, c.boss).catch(() => undefined) : undefined;
    const boss = bossScenario ? { tell: bossScenario.debrief.layer1.tell, whatWorks: bossScenario.debrief.layer1.what_works } : null;
    // CR-44(b): after the finale's chapter end, the end screen "Your Atlas" instead of the map.
    const end = c.arc_finale ? () => void openEnd(c) : undefined;
    setScreen({ kind: 'chapter_done', summary: r.summary, city: c.name, postcard: ifThen ? { ifThen, backdrop } : null, boss, end });
  };

  /** CR-44(b): "Your Atlas": Adaeze's line as the epigraph, every If-then line in play order, cards, help. */
  const openEnd = async (c: Chapter) => {
    setScreen({ kind: 'loading' });
    const current = currentSave();
    const scenes = await Promise.all(resolutionSceneIds(c).map((id) => sceneById(id)));
    const lines = await ifThenLines(current.story.postcards);
    setScreen({ kind: 'end', epigraph: epigraphOf(scenes), pages: atlasPages(chapters, current.story, lines) });
  };

  /**
   * Resolution scenes (after the last debrief, before the summary; CR-43(d): the finale's several scenes in order,
   * each keyed to the arc ending or for everyone), then the chapter end.
   */
  const finishWithResolution = (c: Chapter) => playScenes(resolutionSceneIds(c), () => void endChapter(currentSave(), c), c);

  // -------------------------------------------------------------------------
  // CR-43: the arc finale block (GDD §30.6), after the last scenario's debrief, before the resolution.

  /** Load the finale's three profile names (any chapter's arc_finale), for the reveal card. */
  const revealNames = (): readonly string[] | null => chapters.find((x) => x.arc_finale)?.arc_finale?.reveal_names ?? null;

  /** Slot tells for the red-flag timeline: each slot's arc beat is the arc_beat of the chapter with that map slot. */
  const slotTells = async (): Promise<Map<number, string>> => {
    const tells = new Map<number, string>();
    for (const ch of chapters) {
      if (!ch.arc_beat) continue;
      const s = await load(ch.city, ch.arc_beat).catch(() => undefined);
      if (s?.arc_slot !== undefined) tells.set(s.arc_slot, s.debrief.layer1.tell);
    }
    return tells;
  };

  /** Play the finale step the save is on; when the block is done, the resolution. A quit mid-block resumes here. */
  const runFinale = async (c: Chapter) => {
    const f = c.arc_finale;
    if (!f) return finishWithResolution(c);
    setScreen({ kind: 'loading' });
    let current = currentSave();
    if (!current.arc.finale) {
      const entered = { ...current, arc: enterFinale(current.arc) };
      update(() => entered);
      current = entered;
    }
    if (finaleDone(current.arc)) return finishWithResolution(c);
    const step = finaleStep(current.arc);
    const total = Math.max(1, sequenceOf(c).length);
    try {
      if (step === 'close' || step === 'recovery_offer' || step === 'teo') {
        const s = await load(c.city, f[step]);
        if (!s) throw new Error(`finale scenario ${f[step]} is not bundled`);
        return play(s, current, { index: total, total, finale: step });
      }
      if (step === 'reveal') return setScreen({ kind: 'finale_reveal', chapter: c, names: f.reveal_names });
      // QA B2: the options are shuffled like any damage control, seeded by the close beat's id (stable per finale).
      if (step === 'damage_control') return setScreen({ kind: 'finale_damage', chapter: c, options: orderOptions(f.damage_control.map((x) => ({ step: x.step, category: x.category, ...(x.feedback ? { feedback: x.feedback } : {}) })), f.close) });
      if (step === 'timeline') {
        const tells = await slotTells();
        return setScreen({ kind: 'finale_timeline', chapter: c, rows: timelineRows(current.arc, (slot) => tells.get(slot)) });
      }
    } catch (e) {
      console.warn('finale load failed', e);
      return setScreen({ kind: 'error' });
    }
    return finishWithResolution(c);
  };

  /** The finale step `from` is over: record it and play the next one. */
  const finaleNext = (c: Chapter, from: FinaleStep, extra?: (sv: SaveState) => SaveState) => {
    update((sv) => {
      // Sceptic nb3: `extra` (banking arc points) applies only while `from` is still the current step, like
      // advanceFinale, so a double tap or a stale screen cannot bank twice.
      const base = extra && finaleStep(sv.arc) === from ? extra(sv) : sv;
      return { ...base, arc: advanceFinale(base.arc, from) };
    });
    void runFinale(c);
  };

  const next = async (current: SaveState, c: Chapter = chapter) => {
    setScreen({ kind: 'loading' });
    try {
      if (loadFirst) {
        if (soloDone) return void endChapter(current, c);
        const s = await loadFirst();
        setSolo(s);
        const started = beginChapter(current, s.chapter);
        update(() => started);
        return play(s, started, { index: 1, total: 1 });
      }
      const started = beginChapter(current, c.city, c);
      if (started !== current) update(() => started);
      const flags = runFlags(started, c.city);
      const all = Math.max(1, sequenceOf(c).length);
      let from = runIndex(started, c);
      for (;;) {
        const i = nextIndex(c, from, () => [], flags);
        const id = i < 0 ? undefined : sequenceOf(c)[i]?.id;
        // CR-43(a): the finale's arc block plays after the last scenario's debrief, before the resolution.
        if (!id) return void (c.arc_finale ? runFinale(c) : finishWithResolution(c));
        let s = await load(c.city, id);
        if (!s) throw new Error(`scenario ${id} is not bundled`);
        if (s.role === 'arc' && s.arc_slot !== undefined) {
          // CR-43(f), CR-49 (R25(1)): the chapter's arc beat plays the lowest arc slot not yet played (slot order,
          // whatever the chapter order), found in the chapter with map slot N. A closed arc ("Tell me now", a report, a second
          // close, GDD §10.3) or a slot already played plays nothing here, and a replayed (finished) chapter never
          // plays an arc beat (QA B1).
          const slot = arcSlotForRun(started.arc, chapterProgress(started, c.city));
          const home = slot === null ? undefined : chapters.find((x) => x.slot === slot && x.arc_beat);
          s = home?.arc_beat ? ((home.city === c.city && home.arc_beat === s.id ? s : await load(home.city, home.arc_beat).catch(() => undefined)) ?? undefined) : undefined;
          if (!s || s.role !== 'arc') {
            from = i + 1;
            continue;
          }
        }
        if (s.requires_flags.every((f) => flags.has(f))) return play(s, started, { index: i + 1, total: all });
        from = i + 1; // an echo whose flags are not set: skip it
      }
    } catch (e) {
      // Typically a stale chunk after an update while offline. Stay local: no error reporting service.
      console.warn('scenario load failed', e);
      setScreen({ kind: 'error' });
    }
  };

  const startChapter = (c: Chapter) => {
    setCity(c.city);
    setStress(null);
    // Arrival scene (STORY §3) before the first scenario of a fresh run; a resumed run goes straight on.
    // `fresh` is read after beginChapter, so a tampered run (restarted there) also gets its arrival (item 18).
    const current = currentSave();
    const started = beginChapter(current, c.city, c);
    if (started !== current) update(() => started);
    const p = chapterProgress(started, c.city);
    const fresh = !p.run || (p.run.index === 0 && p.run.records.length === 0);
    if (fresh) notedRuns.current.delete(c.city);
    // CR-27: a fresh run shows the chapter intro before the first scenario, after the Arrival scene; a chapter
    // without intro text (a one-scenario stand-in) has none. A resumed run shows it again, with "Continue",
    // only when the chapter has pinned `rules` (psych M2).
    const hasIntro = c.intro.trim() !== '' || !!c.rules;
    const intro = () => (hasIntro ? setScreen({ kind: 'intro', chapter: c, resume: !fresh }) : void next(currentSave(), c));
    if (fresh && arrivalSceneId(c)) return void playScene(arrivalSceneId(c), intro, c);
    if (fresh || c.rules) return intro();
    void next(started, c);
  };

  const onDone = useCallback(
    (scenario: Scenario, st: RunnerState, r: ScenarioResult, progress: Progress) => {
      const data = debriefOf(scenario, st, r, save.callouts);
      // CR-43(f): an arc slot from another chapter advances this chapter's run at the position it played.
      update((sv) => commitScenario(sv, balance, chapter, scenario, st, r, progress.finale ? undefined : progress.index - 1));
      setStress(st.stress);
      if (loadFirst) setSoloDone(true);
      setScreen({ kind: 'debrief', scenario, data, progress });
    },
    [save.callouts, update, chapter, loadFirst],
  );

  /** Debrief "Continue": the half-day stop screen after the morning block (UI_SPEC §8.3, FI-2), else the next message. */
  const afterDebrief = (progress: Progress) => {
    const at = progress.index - 1;
    const c = chapter;
    // CR-43: a finale scenario's debrief leads to the next step of the block.
    if (progress.finale) return finaleNext(c, progress.finale);
    const go = () => {
      if (!loadFirst && isStopPointAfter(c, at)) {
        const left = messagesLeft(c, at + 1).today;
        setScreen({ kind: 'stop', done: c.scenario_order.am.length, total: sequenceOf(c).length, left });
        return;
      }
      void next(currentSave(), c);
    };
    // Spec-placed beats after this scenario's debrief (STORY §3.2, §3.3), then the stop screen or the next message.
    const id = sequenceOf(c)[at]?.id;
    const placed = !loadFirst && id ? scenesAfter(c, id) : [];
    if (placed.length === 0) return go();
    playScenes(placed, go, c);
  };

  /** "Keep going" at the stop point: the turn scene (STORY §3), then the afternoon. */
  const keepGoing = () => {
    const c = chapter;
    void playScene(loadFirst ? null : turnSceneId(c), () => void next(currentSave(), c), c);
  };

  /** Back on the chapter list (the map): a travel interlude first when its play position is reached (STORY §3.12). */
  const toMap = async () => {
    setStress(null);
    if (loadFirst) return setScreen({ kind: 'title', from: 'elsewhere' });
    const refs = sceneRefs.filter((r) => r.folder === INTERLUDES);
    if (refs.length > 0) {
      const current = currentSave();
      const interludes = (await Promise.all(refs.map((r) => r.load().catch(() => undefined)))).filter((x): x is Scene => !!x);
      const done = middleFinished(chapters, (city) => chapterProgress(current, city).finished);
      const id = dueInterlude(interludes, done, current.story.seen);
      if (id) return void playScene(id, () => setScreen({ kind: 'chapters' }), null);
    }
    setScreen({ kind: 'chapters' });
  };

  const openAtlas = async (back: 'title' | 'chapters') => {
    setScreen({ kind: 'atlas', pages: [], loading: true, back });
    const current = currentSave();
    const lines = await ifThenLines(current.story.postcards);
    setScreen({ kind: 'atlas', pages: atlasPages(chapters, current.story, lines), loading: false, back });
  };

  /** Scenes of a chapter the player has seen, in play order (replay from the chapter menu). */
  const replayable = (c: Chapter, sv: SaveState) => chapterSceneIds(c).filter((id) => sv.story.seen.includes(id));

  /** "Story scenes: <city>": each seen scene as "Watch: <title>" (the scene's title or its slot title). */
  const openReplay = async (c: Chapter, focus?: string) => {
    setScreen({ kind: 'replay', city: c.city, scenes: null, focus });
    const scenes = await Promise.all(
      replayable(c, currentSave()).map(async (id) => {
        const sc = await sceneById(id);
        return sc ? { id, label: scenePart(sc, c) ?? sceneHeading(sc, c) } : null;
      }),
    );
    setScreen({ kind: 'replay', city: c.city, scenes: scenes.filter((x): x is { id: string; label: string } => !!x), focus });
  };

  /** "Tell me now" (GDD §10.2): closes the arc and shows the reveal with the timeline so far. */
  const onTellMeNow = async (current: DebriefData) => {
    const arc = currentSave().arc;
    update((sv) => ({ ...sv, arc: tellMeNow(sv.arc) }));
    const tells = await slotTells();
    // CR-43(b), (c): the same reveal card and timeline wording as the finale (no amounts, fixed choice lines).
    setScreen({ kind: 'reveal', timeline: timelineRows(arc, (slot) => tells.get(slot) ?? current.layer1.tell), names: revealNames() });
  };

  const ctx: RunnerContext = useMemo(
    () => ({ balance, slot: chapter.slot, settings: { timerMode, pushers: save.settings.pushers }, stress: carriedStress(balance, stress) }),
    [chapter.slot, timerMode, save.settings.pushers, stress],
  );

  const chooseTiming = (mode: TimerMode | 'calm', scenario: Scenario, progress: Progress) => {
    update((sv) => ({ ...sv, settings: mode === 'calm' ? calmPreset(sv.settings) : { ...sv.settings, timerMode: mode } }));
    setScreen({ kind: 'playing', scenario, attempt: Date.now(), progress });
  };
  const saveSettings = (s: Settings) => update((sv) => ({ ...sv, settings: s }));
  const toTitle = () => {
    // Resuming later starts calm (UI_SPEC §8.3: on resume, stress resets to 10).
    setStress(null);
    setScreen({ kind: 'title', from: 'elsewhere' });
  };
  const toChapters = () => {
    setStress(null);
    setScreen(loadFirst ? { kind: 'title', from: 'elsewhere' } : { kind: 'chapters' });
  };

  const onStart = () => {
    if (loadFirst) return void next(save);
    if (resume) return startChapter(resume);
    setScreen({ kind: 'chapters' });
  };

  return (
    <AnnouncerProvider minInterval={SR_MIN_INTERVAL}>
      {/* T-4.2: the help screen's country choice lives in the existing save (settings.helpCountry), no new key. */}
      <HelpCountryProvider country={save.settings.helpCountry} onChange={(c) => update((sv) => ({ ...sv, settings: { ...sv.settings, helpCountry: c } }))}>
      {screen.kind === 'title' || screen.kind === 'loading' || screen.kind === 'error' ? (
        <main class={styles.shell}>
          <h1 class={styles.title} ref={titleRef} tabIndex={-1}>
            {t('app_title')}
          </h1>
          {screen.kind === 'title' ? (
            <>
              <p class={styles.tagline}>{t('app_tagline')}</p>
              <div class={styles.titleButtons}>
                <button type="button" class={styles.start} onClick={onStart}>
                  {resumable ? t('app_continue') : t('app_start')}
                </button>
                {hasScenes && save.story.postcards.length > 0 ? (
                  <button type="button" class={styles.secondary} data-title-button="atlas" onClick={() => void openAtlas('title')}>
                    {t('atlas_open')}
                  </button>
                ) : null}
                {!loadFirst && chapters.length > 0 ? (
                  <button type="button" class={styles.secondary} data-title-button="chapters" onClick={() => setScreen({ kind: 'chapters' })}>
                    {t('chapters_title')}
                  </button>
                ) : null}
                <button type="button" class={styles.secondary} data-title-button="settings" onClick={() => setScreen({ kind: 'settings' })}>
                  {t('app_settings')}
                </button>
              </div>
            </>
          ) : null}
          {screen.kind === 'loading' ? <p role="status">{t('app_loading')}</p> : null}
          {screen.kind === 'error' ? (
            <div role="alert">
              <p>{t('app_load_error')}</p>
              <button type="button" class={styles.start} onClick={() => void next(save)}>
                {t('app_retry')}
              </button>
            </div>
          ) : null}
        </main>
      ) : null}
      {screen.kind === 'chapters' ? (
        <ChapterList
          rows={chapterRows(chapters, save).map((r) => {
            const ch = chapters.find((x) => x.city === r.city);
            return { ...r, note: !r.locked ? chapterNote(ch, save) : null, replay: !!ch && hasScenes && replayable(ch, save).length > 0 };
          })}
          focus={screen.focus}
          onPlay={(c) => {
            const ch = chapters.find((x) => x.city === c);
            if (ch) startChapter(ch);
          }}
          onReplay={(c) => {
            const ch = chapters.find((x) => x.city === c);
            replayNoted.current = false; // a new replay session
            if (ch) void openReplay(ch);
          }}
          onAtlas={hasScenes && save.story.postcards.length > 0 ? () => void openAtlas('chapters') : undefined}
          onBack={() => setScreen({ kind: 'title', from: 'chapters' })}
        />
      ) : null}
      {screen.kind === 'settings' ? (
        <main class={styles.shell}>
          <SettingsPanel settings={save.settings} defaultTimer={defaultTimerMode(reduced)} onChange={saveSettings} onClose={() => setScreen({ kind: 'title', from: 'settings' })} />
        </main>
      ) : null}
      {screen.kind === 'timing' ? <TimingScreen preselect={defaultTimerMode(reduced)} onChoose={(m) => chooseTiming(m, screen.scenario, screen.progress)} /> : null}
      {screen.kind === 'playing' ? (
        <ScenarioView
          key={`${screen.scenario.id}:${screen.attempt}`}
          scenario={screen.scenario}
          ctx={ctx}
          progress={screen.progress}
          callLines={save.settings.callLines}
          onCallLines={(v) => update((sv) => ({ ...sv, settings: { ...sv.settings, callLines: v } }))}
          alwaysTranslate={save.settings.alwaysTranslate}
          settings={save.settings}
          defaultTimer={defaultTimerMode(reduced)}
          onSettings={saveSettings}
          coachMarks={save.coachMarks}
          onCoachMarkSeen={(id) => update((sv) => (sv.coachMarks.includes(id) ? sv : { ...sv, coachMarks: [...sv.coachMarks, id] }))}
          onQuit={toTitle}
          revealNames={screen.progress.finale ? (revealNames() ?? undefined) : undefined}
          recoveryOffered={screen.progress.finale === 'recovery_offer' ? chapter.arc_finale?.damage_control.map((x) => x.step) : undefined}
          onDone={(st, r) => onDone(screen.scenario, st, r, screen.progress)}
        />
      ) : null}
      {screen.kind === 'debrief' ? (
        <DebriefView
          data={screen.data}
          onContinue={() => afterDebrief(screen.progress)}
          onAgain={screen.progress.finale ? undefined : () => setScreen({ kind: 'playing', scenario: screen.scenario, attempt: Date.now(), progress: screen.progress })}
          onTellMeNow={screen.data.variant === 'arc' && !save.arc.closed ? () => void onTellMeNow(screen.data) : undefined}
        />
      ) : null}
      {screen.kind === 'intro' ? (
        <ChapterIntro
          name={screen.chapter.name}
          intro={screen.chapter.intro}
          rules={screen.chapter.rules}
          resume={screen.resume}
          onStart={() => void next(currentSave(), screen.chapter)}
          onBack={
            loadFirst
              ? undefined
              : () => {
                  setStress(null);
                  setScreen({ kind: 'chapters', focus: { kind: 'play', city: screen.chapter.city } });
                }
          }
        />
      ) : null}
      {screen.kind === 'stop' ? <StopScreen done={screen.done} total={screen.total} left={screen.left} onKeepGoing={keepGoing} onBack={toChapters} /> : null}
      {screen.kind === 'reveal' ? <ArcReveal timeline={screen.timeline} names={screen.names} onContinue={() => void next(currentSave())} /> : null}
      {screen.kind === 'finale_reveal' ? <RevealScreen names={screen.names} tell={screen.chapter.arc_finale?.reveal.tell ?? ''} habit={screen.chapter.arc_finale?.reveal.habit ?? ''} onContinue={() => finaleNext(screen.chapter, 'reveal')} /> : null}
      {screen.kind === 'finale_damage' ? (
        <main class={styles.shell} data-finale-step="damage_control">
          <DamageControl
            view={{ options: screen.options, pick: balance.recovery.pick, forCast: null, forLabel: null }}
            intro={t('arc_damage_intro', { name: arcName() })}
            onDone={(picks) => {
              // Ending C's arc damage control: banked as arc points, never a chapter score (GDD §10.2, §30.6).
              const points = scoreRecovery(balance, screen.options, picks).points;
              finaleNext(screen.chapter, 'damage_control', (sv) => ({ ...sv, arc: bankArcPoints(sv.arc, points) }));
            }}
          />
        </main>
      ) : null}
      {screen.kind === 'finale_timeline' ? <TimelineScreen rows={screen.rows} onContinue={() => finaleNext(screen.chapter, 'timeline')} /> : null}
      {screen.kind === 'end' ? <EndScreen epigraph={screen.epigraph} pages={screen.pages} habits={save.habits} onBack={() => void toMap()} /> : null}
      {screen.kind === 'chapter_done' ? <ChapterDone summary={screen.summary} city={screen.city} postcard={screen.postcard} boss={screen.boss} onBack={screen.end ?? (() => void toMap())} /> : null}
      {screen.kind === 'scene' ? (
        <ScenePlayer
          key={screen.scene.id}
          scene={screen.scene}
          heading={screen.heading}
          chapterName={screen.chapterName}
          flags={new Set(screen.flags)}
          vars={storyVars(save.story, chapters)}
          flip={screen.flip}
          flipChoices={screen.flipChoices}
          arcEnding={screen.ending}
          onFlip={(c) => update((sv) => ({ ...sv, story: recordFlip(sv.story, c) }))}
          contentNote={screen.note}
          onDone={() => screen.then()}
        />
      ) : null}
      {screen.kind === 'atlas' ? (
        <AtlasScreen
          pages={screen.pages}
          loading={screen.loading}
          backTo={screen.back}
          onBack={() => setScreen(screen.back === 'chapters' ? { kind: 'chapters', focus: { kind: 'atlas' } } : { kind: 'title', from: 'atlas' })}
        />
      ) : null}
      {screen.kind === 'replay'
        ? (() => {
            const c = chapters.find((x) => x.city === screen.city);
            if (!c) return null;
            return (
              <SceneReplayList
                city={c.name}
                scenes={screen.scenes}
                focus={screen.focus}
                onPlay={(id) => void playScene(id, () => void openReplay(c, id), c, { replay: true })}
                onBack={() => {
                  replayNoted.current = false; // leaving the replay list ends the session
                  setScreen({ kind: 'chapters', focus: { kind: 'replay', city: c.city } });
                }}
              />
            );
          })()
        : null}
      </HelpCountryProvider>
    </AnnouncerProvider>
  );
}
