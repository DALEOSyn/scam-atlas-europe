import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { balance } from './content/balance.ts';
import { listChapters } from './content/chapters.ts';
import type { Chapter, Scenario, Scene } from './content/schema.ts';
import { listScenarios } from './content/scenarios.ts';
import { listScenes, type SceneRef } from './content/scenes.ts';
import { tellMeNow } from './engine/arc.ts';
import type { ChapterSummary } from './engine/chapter.ts';
import { debriefOf, type DebriefData } from './engine/debrief.ts';
import { beginChapter, carriedStress, chapterProgress, commitScenario, finishChapter, runFlags, runIndex } from './engine/game.ts';
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
  ifThenOf,
  INTERLUDES,
  markSeen,
  middleFinished,
  pickFlip,
  recordFlip,
  resolutionSceneId,
  scenesAfter,
  storyVars,
  turnSceneId,
  type AtlasPage,
  type IfThen,
} from './engine/story.ts';
import { defaultTimerMode, type TimerMode } from './engine/timer.ts';
import { t } from './i18n/index.ts';
import { AnnouncerProvider } from './ui/Announcer.tsx';
import { ChapterDone } from './ui/ChapterDone.tsx';
import { ChapterList, type ChapterRow } from './ui/ChapterList.tsx';
import { DebriefView } from './ui/DebriefView.tsx';
import { ArcReveal } from './ui/ArcReveal.tsx';
import { AtlasScreen, SceneReplayList } from './ui/Atlas.tsx';
import { ScenePlayer, type FlipPick } from './ui/ScenePlayer.tsx';
import { ScenarioView } from './ui/ScenarioView.tsx';
import { SettingsPanel } from './ui/Settings.tsx';
import { StopScreen } from './ui/StopScreen.tsx';
import styles from './app.module.css';

type Progress = { index: number; total: number };

type Screen =
  /** `from`: the screen we came back from, so focus returns to its button (QA T-2.8 m1), never to <body>. */
  | { kind: 'title'; from?: 'chapters' | 'settings' | 'elsewhere' }
  | { kind: 'chapters' }
  | { kind: 'settings' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'timing'; scenario: Scenario; progress: Progress }
  | { kind: 'playing'; scenario: Scenario; attempt: number; progress: Progress }
  | { kind: 'debrief'; scenario: Scenario; data: DebriefData; progress: Progress }
  | { kind: 'stop'; done: number; total: number; left: number }
  | { kind: 'reveal'; timeline: { slot: number; tell: string }[] }
  | { kind: 'chapter_done'; summary: ChapterSummary; city: string; postcard: { ifThen: IfThen; backdrop?: string | undefined } | null }
  /** A story scene (S3). `then` runs after it ends (finished or skipped). */
  | { kind: 'scene'; scene: Scene; place: string | null; flip: FlipPick | null; note: string | null; flags: string[]; then: () => void }
  | { kind: 'atlas'; pages: AtlasPage[]; loading: boolean }
  | { kind: 'replay'; city: string };

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

async function loadScenario(city: string, id: string): Promise<Scenario | undefined> {
  for (const ref of listScenarios().filter((r) => r.chapter === city)) {
    const s = await ref.load();
    if (s.id === id) return s;
  }
  return undefined;
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

  /**
   * Play a story scene, then `then()`. A missing scene (or none placed) simply carries on, so a chapter
   * without scenes plays unchanged. The scene is recorded as seen when it ends, finished or skipped.
   */
  const playScene = async (id: string | null | undefined, then: () => void, c: Chapter | null) => {
    const scene = id ? await sceneById(id) : undefined;
    if (!scene) return then();
    const current = currentSave();
    let flip: FlipPick | null = null;
    if (scene.panels.some((p) => p.flip_postcard)) {
      const lines = await ifThenLines(current.story.postcards);
      // The Open Evening (a resolution) lets you pick from every postcard; interludes use the spacing rule.
      const city = pickFlip(current.story, (x) => lines.has(x), scene.slot === 'resolution');
      const line = city ? lines.get(city) : undefined;
      if (city && line) flip = { city, cityName: chapters.find((x) => x.city === city)?.name ?? city, ifThen: line };
    }
    const note = scene.sensitive ? (scene.content_note ?? chapterNote(c ?? undefined, current)) : null;
    const flags = c ? [...runFlags(current, c.city)] : [...current.flags];
    setScreen({
      kind: 'scene',
      scene,
      place: scene.chapter === INTERLUDES ? null : (c?.name ?? chapters.find((x) => x.city === scene.chapter)?.name ?? null),
      flip,
      note,
      flags,
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
    setScreen({ kind: 'chapter_done', summary: r.summary, city: c.name, postcard: ifThen ? { ifThen, backdrop } : null });
  };

  /** Resolution scene (after the last debrief, before the summary), then the chapter end. */
  const finishWithResolution = (c: Chapter) => playScene(resolutionSceneId(c), () => void endChapter(currentSave(), c), c);

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
        if (!id) return void finishWithResolution(c);
        const s = await load(c.city, id);
        if (!s) throw new Error(`scenario ${id} is not bundled`);
        // A closed Alex arc ("Tell me now", a report, a second close) plays no more arc beats (GDD §10.3).
        const arcClosed = s.role === 'arc' && started.arc.closed;
        if (!arcClosed && s.requires_flags.every((f) => flags.has(f))) return play(s, started, { index: i + 1, total: all });
        from = i + 1; // an echo whose flags are not set, or a closed arc: skip it
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
    const p = chapterProgress(save, c.city);
    const fresh = !p.run || (p.run.index === 0 && p.run.records.length === 0);
    if (fresh && arrivalSceneId(c)) return void playScene(arrivalSceneId(c), () => void next(currentSave(), c), c);
    void next(save, c);
  };

  const onDone = useCallback(
    (scenario: Scenario, st: RunnerState, r: ScenarioResult, progress: Progress) => {
      const data = debriefOf(scenario, st, r, save.callouts);
      update((sv) => commitScenario(sv, balance, chapter, scenario, st, r));
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

  const openAtlas = async () => {
    setScreen({ kind: 'atlas', pages: [], loading: true });
    const current = currentSave();
    const lines = await ifThenLines(current.story.postcards);
    setScreen({ kind: 'atlas', pages: atlasPages(chapters, current.story, lines), loading: false });
  };

  /** Scenes of a chapter the player has seen, in play order (replay from the chapter menu). */
  const replayable = (c: Chapter, sv: SaveState) => chapterSceneIds(c).filter((id) => sv.story.seen.includes(id));

  /** "Tell me now" (GDD §10.2): closes the arc and shows the reveal with the timeline so far. */
  const onTellMeNow = async (current: DebriefData) => {
    const arc = save.arc;
    update((sv) => ({ ...sv, arc: tellMeNow(sv.arc) }));
    const tells = new Map<number, string>();
    for (const c of chapters) {
      if (!c.arc_beat) continue;
      const s = await load(c.city, c.arc_beat).catch(() => undefined);
      if (s?.arc_slot !== undefined) tells.set(s.arc_slot, s.debrief.layer1.tell);
    }
    const slots = [...new Set(arc.timeline)].sort((a, b) => a - b);
    setScreen({ kind: 'reveal', timeline: slots.map((slot) => ({ slot, tell: tells.get(slot) ?? current.layer1.tell })) });
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
                  <button type="button" class={styles.secondary} data-title-button="atlas" onClick={() => void openAtlas()}>
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
      {screen.kind === 'chapters' ? <ChapterList rows={chapterRows(chapters, save).map((r) => {
        const ch = chapters.find((x) => x.city === r.city);
        return { ...r, note: !r.locked ? chapterNote(ch, save) : null, replay: !!ch && hasScenes && replayable(ch, save).length > 0 };
      })} onPlay={(c) => {
        const ch = chapters.find((x) => x.city === c);
        if (ch) startChapter(ch);
      }} onReplay={(c) => setScreen({ kind: 'replay', city: c })} onBack={() => setScreen({ kind: 'title', from: 'chapters' })} /> : null}
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
          onDone={(st, r) => onDone(screen.scenario, st, r, screen.progress)}
        />
      ) : null}
      {screen.kind === 'debrief' ? (
        <DebriefView
          data={screen.data}
          onContinue={() => afterDebrief(screen.progress)}
          onAgain={() => setScreen({ kind: 'playing', scenario: screen.scenario, attempt: Date.now(), progress: screen.progress })}
          onTellMeNow={screen.data.variant === 'arc' && !save.arc.closed ? () => void onTellMeNow(screen.data) : undefined}
        />
      ) : null}
      {screen.kind === 'stop' ? <StopScreen done={screen.done} total={screen.total} left={screen.left} onKeepGoing={keepGoing} onBack={toChapters} /> : null}
      {screen.kind === 'reveal' ? <ArcReveal timeline={screen.timeline} onContinue={() => void next(save)} /> : null}
      {screen.kind === 'chapter_done' ? <ChapterDone summary={screen.summary} city={screen.city} postcard={screen.postcard} onBack={() => void toMap()} /> : null}
      {screen.kind === 'scene' ? (
        <ScenePlayer
          key={screen.scene.id}
          scene={screen.scene}
          place={screen.place}
          flags={new Set(screen.flags)}
          vars={storyVars(save.story, chapters)}
          flip={screen.flip}
          onFlip={(c) => update((sv) => ({ ...sv, story: recordFlip(sv.story, c) }))}
          contentNote={screen.note}
          onDone={() => screen.then()}
        />
      ) : null}
      {screen.kind === 'atlas' ? <AtlasScreen pages={screen.pages} loading={screen.loading} onBack={() => setScreen({ kind: 'title', from: 'elsewhere' })} /> : null}
      {screen.kind === 'replay'
        ? (() => {
            const c = chapters.find((x) => x.city === screen.city);
            if (!c) return null;
            const slotName = (id: string) =>
              id === c.scenes?.arrival ? t('scene_slot_arrival') : id === c.scenes?.turn ? t('scene_slot_turn') : id === c.scenes?.resolution ? t('scene_slot_resolution') : t('scene_slot_beat');
            return (
              <SceneReplayList
                city={c.name}
                scenes={replayable(c, save).map((id) => ({ id, label: slotName(id) }))}
                onPlay={(id) => void playScene(id, () => setScreen({ kind: 'replay', city: c.city }), c)}
                onBack={() => setScreen({ kind: 'chapters' })}
              />
            );
          })()
        : null}
    </AnnouncerProvider>
  );
}
