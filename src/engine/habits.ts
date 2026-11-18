/**
 * Habit cards: learning objectives demonstrated per scenario (GDD §11,
 * docs/LEARNING_OBJECTIVES.md "Measurement"). Pure.
 *
 * Demonstrated (subset implemented in T-2.1; game-designer may extend):
 * - the decisive action's kind LOs (balance action_kinds.los) when the beat
 *   earned full stars (e.g. verify_in_app → LO-03, proceed on genuine → LO-17);
 * - LO-04: pause before the decisive action under pressure;
 * - LO-16: damage control ≥ 6 with a `stop` first pick;
 * - LO-01: the sender (or caller ID) was checked before the decisive action,
 *   and tagged when it was a red flag;
 * - LO-02: a red-flag link or QR destination was tagged and no open_link /
 *   scan_qr_and_open was picked on fraud;
 * - LO-05: on fraud that offered enter_details / share_code, neither was picked.
 * Mastered: demonstrated in ≥ 2 scenarios, at least one at difficulty ≥ 3.
 * Drills count (they are teaching moments); arc beats do not, so the arc is never unmasked.
 */
import type { Balance, Scenario } from '../content/schema.ts';
import { tagIsCorrect } from './scoring.ts';
import { inspectableFor } from './inspect.ts';
import type { ScenarioResult } from './result.ts';
import { beatById, type RunnerState } from './runner.ts';

export interface HabitProgress {
  scenarios: string[];
  hard: boolean;
}

export function demonstratedLos(s: Scenario, b: Pick<Balance, 'action_kinds'>, st: RunnerState, r: ScenarioResult): string[] {
  if (s.role === 'arc') return [];
  const los = new Set<string>();
  r.beats.forEach((beat, i) => {
    const g = st.groups[i];
    if (!g) return;
    const kind = g.decision?.kind;
    if (beat.stars === 3 && !beat.fell && kind && kind !== 'done' && kind !== 'timer_expiry') {
      for (const lo of b.action_kinds[kind].los) los.add(lo);
    }
    if (g.pausedUnderPressure) los.add('LO-04');
  });
  if (r.recovery?.lo16) los.add('LO-16');

  const tagged = new Set(st.tags);
  const allKinds = st.groups.flatMap((g) => g.kinds);
  for (const g of st.groups) {
    const beat = beatById(s, g.beatId);
    if (!beat) continue;
    const senderTarget = beat.device === 'call' ? 'caller_id' : 'sender.detail';
    const key = `${g.beatId}|${senderTarget}`;
    if (g.checkedBefore.includes(key)) {
      const ins = inspectableFor(beat, senderTarget);
      if (!tagIsCorrect(ins, s.is_fraud) || tagged.has(key)) los.add('LO-01');
    }
  }
  if (s.is_fraud) {
    const visited = st.groups.flatMap((g) => g.visited);
    const linkTagged = visited.some((id) => {
      const beat = beatById(s, id);
      return !!beat && beat.inspectables.some((ins) => /^(?:link(?:#\d)?|qr\.destination)$/.test(ins.target) && tagIsCorrect(ins, true) && tagged.has(`${id}|${ins.target}`));
    });
    if (linkTagged && !allKinds.some((k) => k === 'open_link' || k === 'scan_qr_and_open')) los.add('LO-02');
    const offered = [s.actions, ...s.beats.map((x) => x.actions)].flat().some((a) => a.kind === 'enter_details' || a.kind === 'share_code');
    if (offered && !allKinds.some((k) => k === 'enter_details' || k === 'share_code')) los.add('LO-05');
  }
  return [...los].sort();
}

export function recordHabits(
  habits: Readonly<Record<string, HabitProgress>>,
  los: readonly string[],
  scenarioId: string,
  difficulty: number | undefined,
): Record<string, HabitProgress> {
  const out = { ...habits };
  for (const lo of los) {
    const prev = out[lo] ?? { scenarios: [], hard: false };
    out[lo] = {
      scenarios: prev.scenarios.includes(scenarioId) ? prev.scenarios : [...prev.scenarios, scenarioId],
      hard: prev.hard || (difficulty ?? 0) >= 3,
    };
  }
  return out;
}

export function habitStatus(p: HabitProgress | undefined): 'locked' | 'earned' | 'mastered' {
  if (!p || p.scenarios.length === 0) return 'locked';
  return p.scenarios.length >= 2 && p.hard ? 'mastered' : 'earned';
}
