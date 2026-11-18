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
  continueBoss: () => void;
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
      dispatch({ type: 'tick', dt });
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
    continueBoss: () => dispatch({ type: 'continue' }),
    submitRecovery: (picks) => dispatch({ type: 'recovery', picks }),
  };
}

/** Persistent progress in localStorage (Red Line 7). Works without storage. */
export function useSave(store?: SaveStore): [SaveState, (update: (s: SaveState) => SaveState) => void] {
  const storeRef = useRef<SaveStore>(store ?? createStore(browserStorage()));
  const [save, setSave] = useState<SaveState>(() => storeRef.current.load());
  const update = useCallback((fn: (s: SaveState) => SaveState) => {
    setSave((prev) => {
      const next = fn(prev);
      storeRef.current.save(next);
      return next;
    });
  }, []);
  return [save, update];
}
