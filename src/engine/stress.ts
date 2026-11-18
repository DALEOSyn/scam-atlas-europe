/**
 * Stress meter (GDD §8, balance `stress`). 0–cap, three states. Pure.
 * No score element depends on stress.
 */
import type { Balance } from '../content/schema.ts';

export type StressState = 'calm' | 'tense' | 'overwhelmed';
type StressTable = Pick<Balance, 'stress'>;

export function clampStress(b: StressTable, v: number): number {
  return Math.max(0, Math.min(b.stress.cap, v));
}

export function stressState(b: StressTable, v: number): StressState {
  const t = b.stress.thresholds;
  if (v >= t.overwhelmed[0]) return 'overwhelmed';
  if (v >= t.tense[0]) return 'tense';
  return 'calm';
}

/** Stress when a scenario arrives: carried stress + per lever. */
export function onArrival(b: StressTable, carried: number, levers: number): number {
  return clampStress(b, carried + levers * b.stress.per_pressure_lever);
}

/** Between scenarios. */
export function afterScenario(b: StressTable, v: number): number {
  return clampStress(b, v - b.stress.decay_after_scenario);
}

/** Pressure styling (UI_SPEC §6.3): only the stress state decides, never truth or class. */
export function pressureStyled(state: StressState, pressureTarget: boolean): boolean {
  return pressureTarget && state !== 'calm';
}
