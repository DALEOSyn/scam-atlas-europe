import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { balance } from './content/balance.ts';
import { listChapters } from './content/chapters.ts';
import type { Chapter, Scenario } from './content/schema.ts';
import { listScenarios } from './content/scenarios.ts';
import { tellMeNow } from './engine/arc.ts';
import type { ChapterSummary } from './engine/chapter.ts';
import { debriefOf, type DebriefData } from './engine/debrief.ts';
import { beginChapter, carriedStress, chapterProgress, commitScenario, finishChapter, runFlags, runIndex } from './engine/game.ts';
import { isStopPointAfter, messagesLeft, nextIndex, sequenceOf, unlockedChapters } from './engine/chapter.ts';
import { useSave } from './engine/hooks.ts';
import type { ScenarioResult } from './engine/result.ts';
import type { RunnerContext, RunnerState } from './engine/runner.ts';
import { calmPreset, type SaveState, type SaveStore, type Settings } from './engine/save.ts';
import { defaultTimerMode, type TimerMode } from './engine/timer.ts';
import { t } from './i18n/index.ts';
import { AnnouncerProvider } from './ui/Announcer.tsx';
import { ChapterDone } from './ui/ChapterDone.tsx';
import { ChapterList, type ChapterRow } from './ui/ChapterList.tsx';
import { DebriefView } from './ui/DebriefView.tsx';
import { ArcReveal } from './ui/ArcReveal.tsx';
import { ScenarioView } from './ui/ScenarioView.tsx';
import { SettingsPanel } from './ui/Settings.tsx';
import { StopScreen } from './ui/StopScreen.tsx';
import styles from './app.module.css';

type Progress = { index: number; total: number };

type Screen =
  | { kind: 'title' }
  | { kind: 'chapters' }
  | { kind: 'settings' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'timing'; scenario: Scenario; progress: Progress }
  | { kind: 'playing'; scenario: Scenario; attempt: number; progress: Progress }
  | { kind: 'debrief'; scenario: Scenario; data: DebriefData; progress: Progress }
  | { kind: 'stop'; done: number; total: number; left: number }
  | { kind: 'reveal'; timeline: { slot: number; tell: string }[] }
  | { kind: 'chapter_done'; summary: ChapterSummary; city: string };

export interface AppProps {
  /** Injected in tests: play this one scenario as the whole chapter. */
  loadFirst?: () => Promise<Scenario>;
  /** Injected in tests; defaults to localStorage (or memory when storage is unavailable). */
  store?: SaveStore;
  /** Injected in tests: the chapter list (defaults to content/chapters/*.yaml). */
  chapters?: Chapter[];
  /** Injected in tests: scenario lookup (defaults to the lazily loaded content chunks). */
  load?: (city: string, id: string) => Promise<Scenario | undefined>;
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

export function App({ loadFirst, store, chapters: injected, load = loadScenario }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const [save, update] = useSave(store);
  const [solo, setSolo] = useState<Scenario | null>(null);
  const [soloDone, setSoloDone] = useState(false);
  const chapters = useMemo(() => injected ?? listChapters(), [injected]);
  const [city, setCity] = useState<string | null>(null);
  const soloCh = useMemo(() => soloChapter(solo), [solo]);
  // The chapter being played: picked on the chapter list or by Start (B1), never just the first one.
  const chapter: Chapter = loadFirst ? soloCh : (chapters.find((c) => c.city === city) ?? resumeChapter(chapters, save) ?? chapters[0] ?? soloCh);
  const [stress, setStress] = useState<number | null>(null);

  const reduced = prefersReducedMotion();
  const timerMode: TimerMode = save.settings.timerMode ?? defaultTimerMode(reduced);
  const resume = loadFirst ? null : resumeChapter(chapters, save);
  // "Continue" after a reload when a chapter run is in progress (QA carry-over).
  const resumable = !!resume && (chapterProgress(save, resume.city).run?.index ?? 0) > 0;

  const play = (scenario: Scenario, current: SaveState, progress: Progress) => {
    if (scenario.pressure.timer && current.settings.timerMode === null) setScreen({ kind: 'timing', scenario, progress });
    else setScreen({ kind: 'playing', scenario, attempt: Date.now(), progress });
  };

  const endChapter = (current: SaveState, c: Chapter) => {
    const r = finishChapter(current, balance, c);
    update(() => r.save);
    setSoloDone(false);
    setStress(null);
    setScreen({ kind: 'chapter_done', summary: r.summary, city: c.name });
  };

  const next = async (current: SaveState, c: Chapter = chapter) => {
    setScreen({ kind: 'loading' });
    try {
      if (loadFirst) {
        if (soloDone) return endChapter(current, c);
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
        if (!id) return endChapter(started, c);
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
    if (!loadFirst && isStopPointAfter(chapter, at)) {
      const left = messagesLeft(chapter, at + 1).today;
      setScreen({ kind: 'stop', done: chapter.scenario_order.am.length, total: sequenceOf(chapter).length, left });
      return;
    }
    void next(save);
  };

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
    setScreen({ kind: 'title' });
  };
  const toChapters = () => {
    setStress(null);
    setScreen(loadFirst ? { kind: 'title' } : { kind: 'chapters' });
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
          <h1 class={styles.title}>{t('app_title')}</h1>
          {screen.kind === 'title' ? (
            <>
              <p class={styles.tagline}>{t('app_tagline')}</p>
              <div class={styles.titleButtons}>
                <button type="button" class={styles.start} onClick={onStart}>
                  {resumable ? t('app_continue') : t('app_start')}
                </button>
                {!loadFirst && chapters.length > 0 ? (
                  <button type="button" class={styles.secondary} onClick={() => setScreen({ kind: 'chapters' })}>
                    {t('chapters_title')}
                  </button>
                ) : null}
                <button type="button" class={styles.secondary} onClick={() => setScreen({ kind: 'settings' })}>
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
      {screen.kind === 'chapters' ? <ChapterList rows={chapterRows(chapters, save)} onPlay={(c) => {
        const ch = chapters.find((x) => x.city === c);
        if (ch) startChapter(ch);
      }} onBack={() => setScreen({ kind: 'title' })} /> : null}
      {screen.kind === 'settings' ? (
        <main class={styles.shell}>
          <SettingsPanel settings={save.settings} defaultTimer={defaultTimerMode(reduced)} onChange={saveSettings} onClose={() => setScreen({ kind: 'title' })} />
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
      {screen.kind === 'stop' ? <StopScreen done={screen.done} total={screen.total} left={screen.left} onKeepGoing={() => void next(save)} onBack={toChapters} /> : null}
      {screen.kind === 'reveal' ? <ArcReveal timeline={screen.timeline} onContinue={() => void next(save)} /> : null}
      {screen.kind === 'chapter_done' ? <ChapterDone summary={screen.summary} city={screen.city} onBack={toChapters} /> : null}
    </AnnouncerProvider>
  );
}
