/**
 * Thin Preact wiring over the pure engine. Device components (T-2.3) use
 * `useScenarioRunner` for one scenario and `useSave` for persistent progress.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Scenario } from '../content/schema.ts';
import { resultOf, type ScenarioResult } from './result.ts';
import { startScenario, step, viewOf, type FreezeReason, type RunnerContext, type RunnerEvent, type RunnerState, type RunnerView } from './runner.ts';
import { browserStorage, createStore, type SaveState, type SaveStore } from './save.ts';

/** Clock resolution. Time only advances while the page is visible. */
export const TICK_MS = 250;
/**
 * Largest step one tick may take. A device that sleeps (or a throttled background tab) can deliver
 * a huge gap between intervals; without the clamp a timer would expire twice in one tick.
 */
export const MAX_TICK_SECONDS = 1;

export function clampDt(dt: number): number {
  return Number.isFinite(dt) ? Math.max(0, Math.min(MAX_TICK_SECONDS, dt)) : 0;
}

export interface ScenarioRunner {
  state: RunnerState;
  view: RunnerView;
  /** Available once the run is done (phase 'done'). */
  result: ScenarioResult | null;
  dispatch: (ev: RunnerEvent) => void;
  act: (actionId: string) => void;
  check: (beatId: string, target: string) => void;
  tag: (beatId: string, target: string, on: boolean) => void;
  whatNow: (choice: string) => void;
  pause: () => void;
  endPause: () => void;
  freeze: (reason: FreezeReason, on: boolean) => void;
  answerInterrupt: (interruptId: string, actionId: string) => void;
  /** Continue from the consequence step: the next boss beat, damage control or the debrief. */
  continueConsequence: () => void;
  submitRecovery: (picks: string[]) => void;
}

/**
 * Run one scenario. `ctx` is read when the scenario starts (give the
 * component a `key` per scenario to restart). `now` is injectable for tests.
 */
export function useScenarioRunner(scenario: Scenario, ctx: RunnerContext, now: () => number = () => performance.now()): ScenarioRunner {
  const ctxRef = useRef(ctx);
  const [state, setState] = useState<RunnerState>(() => startScenario(scenario, ctx));
  const dispatch = useCallback((ev: RunnerEvent) => setState((st) => step(scenario, ctxRef.current, st, ev)), [scenario]);

  const running = state.phase !== 'done';
  useEffect(() => {
    if (!running) return undefined;
    let last = now();
    const id = setInterval(() => {
      const t = now();
      const dt = (t - last) / 1000;
      last = t;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      dispatch({ type: 'tick', dt: clampDt(dt) });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, dispatch, now]);

  const view = useMemo(() => viewOf(scenario, ctxRef.current, state), [scenario, state]);
  const result = useMemo(() => (state.phase === 'done' ? resultOf(scenario, ctxRef.current.balance, state) : null), [scenario, state]);

  return {
    state,
    view,
    result,
    dispatch,
    act: (actionId) => dispatch({ type: 'act', actionId }),
    check: (beatId, target) => dispatch({ type: 'check', beatId, target }),
    tag: (beatId, target, on) => dispatch({ type: 'tag', beatId, target, on }),
    whatNow: (choice) => dispatch({ type: 'what_now', choice }),
    pause: () => dispatch({ type: 'pause' }),
    endPause: () => dispatch({ type: 'pause_end' }),
    freeze: (reason, on) => dispatch({ type: 'freeze', reason, on }),
    answerInterrupt: (interruptId, actionId) => dispatch({ type: 'interrupt_act', interruptId, actionId }),
    continueConsequence: () => dispatch({ type: 'continue' }),
    submitRecovery: (picks) => dispatch({ type: 'recovery', picks }),
  };
}

/** Persistent progress in localStorage (Red Line 7). Works without storage. */
export function useSave(store?: SaveStore): [SaveState, (update: (s: SaveState) => SaveState) => void, () => SaveState] {
  const storeRef = useRef<SaveStore | null>(null);
  storeRef.current ??= store ?? createStore(browserStorage());
  const [save, setSave] = useState<SaveState>(() => (storeRef.current as SaveStore).load());
  // The latest save, so several updates in one event chain compose and the write happens outside the
  // state updater (updaters must stay pure; Preact may call them more than once).
  const latest = useRef(save);
  const update = useCallback((fn: (s: SaveState) => SaveState) => {
    const next = fn(latest.current);
    latest.current = next;
    storeRef.current?.save(next);
    setSave(next);
  }, []);
  // The latest save for handlers that run after an await or a story scene (never a stale render's copy).
  const current = useCallback(() => latest.current, []);
  return [save, update, current];
}
