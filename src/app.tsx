import { useCallback, useMemo, useState } from 'preact/hooks';
import { balance } from './content/balance.ts';
import { listChapters } from './content/chapters.ts';
import type { Chapter, Scenario } from './content/schema.ts';
import { listScenarios } from './content/scenarios.ts';
import type { ChapterSummary } from './engine/chapter.ts';
import { debriefOf, type DebriefData } from './engine/debrief.ts';
import { beginChapter, carriedStress, commitScenario, finishChapter, runFlags, runIndex } from './engine/game.ts';
import { nextIndex, sequenceOf } from './engine/chapter.ts';
import { useSave } from './engine/hooks.ts';
import type { ScenarioResult } from './engine/result.ts';
import type { RunnerContext, RunnerState } from './engine/runner.ts';
import { calmPreset, type SaveState, type SaveStore } from './engine/save.ts';
import { defaultTimerMode, type TimerMode } from './engine/timer.ts';
import { t } from './i18n/index.ts';
import { DebriefView, ScenarioView } from './ui/ScenarioView.tsx';
import styles from './app.module.css';

type Screen =
  | { kind: 'title' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'timing'; scenario: Scenario }
  | { kind: 'playing'; scenario: Scenario; attempt: number }
  | { kind: 'debrief'; scenario: Scenario; data: DebriefData }
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

export function App({ loadFirst, store }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: 'title' });
  const [save, update] = useSave(store);
  const [solo, setSolo] = useState<Scenario | null>(null);
  const [soloDone, setSoloDone] = useState(false);
  const chapter = useMemo<Chapter>(() => (loadFirst ? soloChapter(solo) : (listChapters()[0] ?? soloChapter(null))), [loadFirst, solo]);
  const [stress, setStress] = useState<number | null>(null);

  const timerMode: TimerMode = save.settings.timerMode ?? defaultTimerMode(prefersReducedMotion());

  const play = (scenario: Scenario, current: SaveState) => {
    if (scenario.pressure.timer && current.settings.timerMode === null) setScreen({ kind: 'timing', scenario });
    else setScreen({ kind: 'playing', scenario, attempt: Date.now() });
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
        return play(s, started);
      }
      const started = beginChapter(current, chapter.city);
      if (started !== current) update(() => started);
      const flags = runFlags(started, chapter.city);
      let from = runIndex(started, chapter);
      for (;;) {
        const i = nextIndex(chapter, from, () => [], flags);
        const id = i < 0 ? undefined : sequenceOf(chapter)[i]?.id;
        if (!id) return endChapter(started, chapter);
        const s = await loadScenario(chapter.city, id);
        if (!s) throw new Error(`scenario ${id} is not bundled`);
        if (s.requires_flags.every((f) => flags.has(f))) return play(s, started);
        from = i + 1; // an echo whose flags are not set: skip it
      }
    } catch (e) {
      // Typically a stale chunk after an update while offline. Stay local: no error reporting service.
      console.warn('scenario load failed', e);
      setScreen({ kind: 'error' });
    }
  };

  const onDone = useCallback(
    (scenario: Scenario, st: RunnerState, r: ScenarioResult) => {
      const data = debriefOf(scenario, st, r, save.callouts);
      update((sv) => commitScenario(sv, balance, chapter, scenario, st, r));
      setStress(st.stress);
      if (loadFirst) setSoloDone(true);
      setScreen({ kind: 'debrief', scenario, data });
    },
    [save.callouts, update, chapter, loadFirst],
  );

  const ctx: RunnerContext = useMemo(
    () => ({ balance, slot: chapter.slot, settings: { timerMode, pushers: save.settings.pushers }, stress: carriedStress(balance, stress) }),
    [chapter.slot, timerMode, save.settings.pushers, stress],
  );

  const chooseTiming = (mode: TimerMode | 'calm', scenario: Scenario) => {
    update((sv) => ({ ...sv, settings: mode === 'calm' ? calmPreset(sv.settings) : { ...sv.settings, timerMode: mode } }));
    setScreen({ kind: 'playing', scenario, attempt: Date.now() });
  };

  return (
    <main class={styles.shell}>
      <header>
        <h1 class={styles.title}>{t('app_title')}</h1>
        {screen.kind === 'title' ? <p class={styles.tagline}>{t('app_tagline')}</p> : null}
      </header>
      {screen.kind === 'title' ? (
        <button type="button" class={styles.start} onClick={() => void next(save)}>
          {t('app_start')}
        </button>
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
      {screen.kind === 'timing' ? (
        <section aria-labelledby="timing-heading" class={styles.choices}>
          <h2 id="timing-heading">{t('timing_title')}</h2>
          <p>{t('timing_intro')}</p>
          {(['standard', 'extended', 'off'] as const).map((m) => (
            <button key={m} type="button" class={styles.choice} onClick={() => chooseTiming(m, screen.scenario)}>
              {t(m === 'standard' ? 'timing_standard' : m === 'extended' ? 'timing_extended' : 'timing_off')}
            </button>
          ))}
          <button type="button" class={styles.choice} onClick={() => chooseTiming('calm', screen.scenario)}>
            {t('timing_calm')}
          </button>
        </section>
      ) : null}
      {screen.kind === 'playing' ? (
        <ScenarioView key={`${screen.scenario.id}:${screen.attempt}`} scenario={screen.scenario} ctx={ctx} onDone={(st, r) => onDone(screen.scenario, st, r)} />
      ) : null}
      {screen.kind === 'debrief' ? (
        <DebriefView
          data={screen.data}
          onContinue={() => void next(save)}
          onAgain={() => setScreen({ kind: 'playing', scenario: screen.scenario, attempt: Date.now() })}
        />
      ) : null}
      {screen.kind === 'chapter_done' ? (
        <section aria-labelledby="chapter-done-heading">
          <h2 id="chapter-done-heading">{t('chapter_done_title')}</h2>
          {screen.summary.stamp ? (
            <p>
              <strong>{t(screen.summary.stamp === 'gold' ? 'stamp_gold' : screen.summary.stamp === 'silver' ? 'stamp_silver' : 'stamp_bronze')}</strong>
            </p>
          ) : null}
          {screen.summary.stamp === 'gold' ? <p>{t('stamp_gold_copy')}</p> : null}
          <p>{t('chapter_summary', { spotted: screen.summary.spottedShown, total: screen.summary.redFlags, reported: screen.summary.genuineReported, doubles: screen.summary.doubleChecks })}</p>
          <details>
            <summary>{t('debrief_points')}</summary>
            <p>{t('chapter_rating', { rating: Math.round(screen.summary.rating) })}</p>
          </details>
          <button type="button" class={styles.start} onClick={() => setScreen({ kind: 'title' })}>
            {t('app_back_to_title')}
          </button>
        </section>
      ) : null}
    </main>
  );
}
