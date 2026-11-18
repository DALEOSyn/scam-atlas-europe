import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { balance } from './content/balance.ts';
import { listChapters } from './content/chapters.ts';
import type { Chapter, Scenario } from './content/schema.ts';
import { listScenarios } from './content/scenarios.ts';
import type { ChapterSummary } from './engine/chapter.ts';
import { debriefOf, type DebriefData } from './engine/debrief.ts';
import { beginChapter, carriedStress, chapterProgress, commitScenario, finishChapter, runFlags, runIndex } from './engine/game.ts';
import { nextIndex, sequenceOf } from './engine/chapter.ts';
import { useSave } from './engine/hooks.ts';
import type { ScenarioResult } from './engine/result.ts';
import type { RunnerContext, RunnerState } from './engine/runner.ts';
import { calmPreset, type SaveState, type SaveStore } from './engine/save.ts';
import { defaultTimerMode, type TimerMode } from './engine/timer.ts';
import { t } from './i18n/index.ts';
import { AnnouncerProvider } from './ui/Announcer.tsx';
import { ChapterDone } from './ui/ChapterDone.tsx';
import { DebriefView } from './ui/DebriefView.tsx';
import { ScenarioView } from './ui/ScenarioView.tsx';
import styles from './app.module.css';

type Progress = { index: number; total: number };

type Screen =
  | { kind: 'title' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'timing'; scenario: Scenario; progress: Progress }
  | { kind: 'playing'; scenario: Scenario; attempt: number; progress: Progress }
  | { kind: 'debrief'; scenario: Scenario; data: DebriefData; progress: Progress }
  | { kind: 'chapter_done'; summary: ChapterSummary };

export interface AppProps {
  /** Injected in tests: play this one scenario as the whole chapter. */
  loadFirst?: () => Promise<Scenario>;
  /** Injected in tests; defaults to localStorage (or memory when storage is unavailable). */
  store?: SaveStore;
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
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SR_MIN_INTERVAL = (balance.pushers as { sr_announce_min_interval_seconds?: number }).sr_announce_min_interval_seconds ?? 15;

/** Focus a screen's heading when it appears (UI_SPEC §10.3; QA: no focus loss on the timing screen). */
function useFocusOnMount() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}

function TimingScreen({ onChoose }: { onChoose: (mode: TimerMode | 'calm') => void }) {
  const heading = useFocusOnMount();
  return (
    <main class={styles.shell}>
      <section aria-labelledby="timing-heading" class={styles.choices}>
        <h1 id="timing-heading" ref={heading} tabIndex={-1} class={styles.screenTitle}>
          {t('timing_title')}
        </h1>
        <p>{t('timing_intro')}</p>
        {(['standard', 'extended', 'off'] as const).map((m) => (
          <button key={m} type="button" class={styles.choice} onClick={() => onChoose(m)}>
            {t(m === 'standard' ? 'timing_standard' : m === 'extended' ? 'timing_extended' : 'timing_off')}
          </button>
        ))}
        <button type="button" class={styles.choice} onClick={() => onChoose('calm')}>
          {t('timing_calm')}
        </button>
      </section>
    </main>
  );
}

export function App({ loadFirst, store }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const [save, update] = useSave(store);
  const [solo, setSolo] = useState<Scenario | null>(null);
  const [soloDone, setSoloDone] = useState(false);
  const chapter = useMemo<Chapter>(() => (loadFirst ? soloChapter(solo) : (listChapters()[0] ?? soloChapter(null))), [loadFirst, solo]);
  const [stress, setStress] = useState<number | null>(null);

  const timerMode: TimerMode = save.settings.timerMode ?? defaultTimerMode(prefersReducedMotion());
  const total = Math.max(1, sequenceOf(chapter).length);
  // "Continue" after a reload when a chapter run is in progress (QA carry-over).
  const resumable = !loadFirst && (chapterProgress(save, chapter.city).run?.index ?? 0) > 0;

  const play = (scenario: Scenario, current: SaveState, progress: Progress) => {
    if (scenario.pressure.timer && current.settings.timerMode === null) setScreen({ kind: 'timing', scenario, progress });
    else setScreen({ kind: 'playing', scenario, attempt: Date.now(), progress });
  };

  const endChapter = (current: SaveState, c: Chapter) => {
    const r = finishChapter(current, balance, c);
    update(() => r.save);
    setSoloDone(false);
    setStress(null);
    setScreen({ kind: 'chapter_done', summary: r.summary });
  };

  const next = async (current: SaveState) => {
    setScreen({ kind: 'loading' });
    try {
      if (loadFirst) {
        if (soloDone) return endChapter(current, chapter);
        const s = await loadFirst();
        setSolo(s);
        const started = beginChapter(current, s.chapter);
        update(() => started);
        return play(s, started, { index: 1, total: 1 });
      }
      const started = beginChapter(current, chapter.city, chapter);
      if (started !== current) update(() => started);
      const flags = runFlags(started, chapter.city);
      let from = runIndex(started, chapter);
      for (;;) {
        const i = nextIndex(chapter, from, () => [], flags);
        const id = i < 0 ? undefined : sequenceOf(chapter)[i]?.id;
        if (!id) return endChapter(started, chapter);
        const s = await loadScenario(chapter.city, id);
        if (!s) throw new Error(`scenario ${id} is not bundled`);
        if (s.requires_flags.every((f) => flags.has(f))) return play(s, started, { index: i + 1, total });
        from = i + 1; // an echo whose flags are not set: skip it
      }
    } catch (e) {
      // Typically a stale chunk after an update while offline. Stay local: no error reporting service.
      console.warn('scenario load failed', e);
      setScreen({ kind: 'error' });
    }
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

  const ctx: RunnerContext = useMemo(
    () => ({ balance, slot: chapter.slot, settings: { timerMode, pushers: save.settings.pushers }, stress: carriedStress(balance, stress) }),
    [chapter.slot, timerMode, save.settings.pushers, stress],
  );

  const chooseTiming = (mode: TimerMode | 'calm', scenario: Scenario, progress: Progress) => {
    update((sv) => ({ ...sv, settings: mode === 'calm' ? calmPreset(sv.settings) : { ...sv.settings, timerMode: mode } }));
    setScreen({ kind: 'playing', scenario, attempt: Date.now(), progress });
  };

  return (
    <AnnouncerProvider minInterval={SR_MIN_INTERVAL}>
      {screen.kind === 'title' || screen.kind === 'loading' || screen.kind === 'error' ? (
        <main class={styles.shell}>
          <h1 class={styles.title}>{t('app_title')}</h1>
          {screen.kind === 'title' ? (
            <>
              <p class={styles.tagline}>{t('app_tagline')}</p>
              <button type="button" class={styles.start} onClick={() => void next(save)}>
                {resumable ? t('app_continue') : t('app_start')}
              </button>
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
      {screen.kind === 'timing' ? <TimingScreen onChoose={(m) => chooseTiming(m, screen.scenario, screen.progress)} /> : null}
      {screen.kind === 'playing' ? (
        <ScenarioView
          key={`${screen.scenario.id}:${screen.attempt}`}
          scenario={screen.scenario}
          ctx={ctx}
          progress={screen.progress}
          callLines={save.settings.callLines}
          onCallLines={(v) => update((sv) => ({ ...sv, settings: { ...sv.settings, callLines: v } }))}
          alwaysTranslate={save.settings.alwaysTranslate}
          onQuit={() => setScreen({ kind: 'title' })}
          onDone={(st, r) => onDone(screen.scenario, st, r, screen.progress)}
        />
      ) : null}
      {screen.kind === 'debrief' ? (
        <DebriefView
          data={screen.data}
          onContinue={() => void next(save)}
          onAgain={() => setScreen({ kind: 'playing', scenario: screen.scenario, attempt: Date.now(), progress: screen.progress })}
        />
      ) : null}
      {screen.kind === 'chapter_done' ? <ChapterDone summary={screen.summary} onBack={() => setScreen({ kind: 'title' })} /> : null}
    </AnnouncerProvider>
  );
}
