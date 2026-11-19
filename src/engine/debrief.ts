/**
 * Debrief data assembly, layers 1 and 2 (GDD §3 step 6, UI_SPEC §8). Pure.
 * The UI renders this; Red Line 4 content (tell, what works, already clicked)
 * is always in layer 1.
 */
import type { Device, Inspectable, Message, Scenario } from '../content/schema.ts';
import { overCautionOf } from './choiceText.ts';
import { inspectableFor } from './inspect.ts';
import { alreadyClickedLine, type AlreadySituation } from './recovery.ts';
import type { ScenarioResult } from './result.ts';
import { beatById, WHAT_NOW_BUILTINS, type GroupState, type RunnerState, type WhatNowBuiltin } from './runner.ts';
import type { BeatResult } from './result.ts';
import { truthOf } from './scoring.ts';

export type FlagStatus = 'marked' | 'not_marked' | 'in_message';

export interface DebriefFlag {
  text: string;
  status: FlagStatus;
  /** Bound checkable, when there is one. */
  target?: string;
  beatId?: string;
  /** Sender flags carry "Even a familiar sender name can be faked." (UI_SPEC §8.2, LI-3). */
  senderCaveat: boolean;
}

export interface DebriefWrongTag {
  beatId: string;
  target: string;
  /** Reveal text, or undefined for the neutral filler. */
  reveal: string | undefined;
  /** The inspectable's type (undefined for the neutral filler or an untyped detail). */
  type: Inspectable['type'];
  /**
   * A decoy of type caller_id, sender or logo on fraud (ruling L2): the UI uses the "Fair instinct…"
   * line, because a real call or message shows the same name or logo.
   */
  fairInstinct: boolean;
}

/** Over-caution on a genuine message (ruling L4): its own kind line, never a bare label. */
export type OverCaution = 'report_genuine' | 'dismiss_genuine' | 'dismiss_started';

/** A line in layer 2 "Your other choices" (ruling L1 item 3): with its beat's stars on a boss. */
export interface OtherChoice {
  line: ChoiceLine;
  stars: number;
  /** The beat, for "{beat} ({stars} of 3 stars): {line}"; null on single-beat scenarios (plain line). */
  beat: { device: Device; message: Message } | null;
}

/**
 * The action that cost the stars (UI_SPEC §8.1):
 * - a fall, report or dismiss: the decisive action;
 * - an engage cap (no fall): the first engage action, not the later one, also when that was a dismiss or report;
 * - verify then comply/proceed/report: the follow-up (it is the decisive action);
 * - timer expiry: "You let the timer run out."
 * `what_now` = a built-in "What now?" choice (label from i18n).
 */
export type ChoiceLine =
  | { beatId: string; kind: 'action'; label: string }
  | { beatId: string; kind: 'what_now'; choice: WhatNowBuiltin }
  | { beatId: string; kind: 'over_caution'; which: OverCaution; label?: string }
  | { beatId: string; kind: 'timer' };

/** Which "pressure button" callout to show (GDD §8), at most once each per game. */
export type PressureCallout = 'first_any' | 'first_genuine' | null;

export interface DebriefData {
  variant: 'standard' | 'arc';
  /** Drills are unscored teaching moments: no verdict chip, stars or "You chose" (QA, drill layout). */
  drill: boolean;
  /** The player fell for it (a fall's decisive action): "This could happen to anyone" is shown then. */
  fell: boolean;
  layer1: {
    /** null on arc beats and drills (no verdict line). */
    verdict: 'fraud' | 'genuine' | null;
    tell: string;
    whatWorks: string;
    /**
     * The "You chose" line (UI_SPEC §8.1): at most ONE line in layer 1 (CR-15). A boss shows the
     * line of the beat with the fewest stars (tie → the latest beat); the other beats' lines are in
     * layer2.youChoseOther. Empty when everything scored ★★★, on arc debriefs and drills, after
     * a fall (the kind line takes the slot, layer-1 ruling 2026-11-19), and when the displayed stars
     * are ★★★ but a beat scored lower (ruling L1: nextTime or nothing takes the slot).
     */
    youChose: ChoiceLine[];
    /**
     * Ruling L1: displayed ★★★ but the lead beat ended dismiss-class on fraud (hang up + "Leave it
     * there", ignore, timer) on a boss: "Next time: call a number you know." in the slot. Else null.
     */
    nextTime: 'after_hang_up' | null;
    /** Every scored beat earned ★★★ without a fall: the slot may hold "That is the habit that works." */
    allBest: boolean;
    /** null on arc beats and drills (no stars, no points). */
    stars: number | null;
    alreadyClicked: { situation: AlreadySituation; text: string } | null;
  };
  layer2: {
    /**
     * "What happened": outcome narratives in order (boss: one per beat), said once (QA E4). They are
     * first shown in the consequence step, never in layer 1 (layer-1 ruling 2026-11-19).
     */
    narratives: string[];
    /**
     * Timer expiry line under "What happened", gated like the consequence caption: `fake` on fraud
     * ("The deadline was fake…"), `real` on genuine ("Time ran out. This one was genuine…"), else null.
     */
    deadline: 'fake' | 'real' | null;
    /**
     * "Your other choices": the other beats' lines below ★★★, in beat order (CR-15), each with its
     * beat's stars. When layer 1 shows no line (after a fall, or ★★★ displayed with a lower beat) the
     * lead line comes first.
     */
    youChoseOther: OtherChoice[];
    flags: DebriefFlag[];
    wrongTags: DebriefWrongTag[];
    /** "You spotted {marked} of {could} you could mark." */
    spotted: { marked: number; could: number };
    deviceTip: string | null;
    alreadyClicked: { clicked?: string; entered_details?: string; paid?: string } | null;
    habitCard: string | null;
    pressureCallout: PressureCallout;
    /** Authored levers, the answer for the optional "Which pressure did they use?" tap. */
    levers: string[];
    sources: string[];
    notes: string | null;
    safeguardingLine: string | null;
    /** Points breakdown for "How the stars and points were worked out" (null on arc). */
    points: { base: number; tagBonus: number; tagBonusVoided: boolean; recovery: number | null; total: number; max: number } | null;
  };
}

const SENDER_TARGETS = /^(?:sender\.detail|caller_id)$/;
/** Decoy types that look the same on a real call or message (ruling L2). */
const FAIR_INSTINCT_TYPES: ReadonlySet<string> = new Set(['caller_id', 'sender', 'logo']);

/** Decide the pressure callout given what the game has already shown (save.callouts). */
export function pressureCalloutFor(
  styledShown: boolean,
  isGenuine: boolean,
  seen: { pressureAny: boolean; pressureGenuine: boolean },
): PressureCallout {
  if (!styledShown) return null;
  if (!seen.pressureAny) return 'first_any';
  if (isGenuine && !seen.pressureGenuine) return 'first_genuine';
  return null;
}

export function debriefOf(
  s: Scenario,
  st: RunnerState,
  r: ScenarioResult,
  seen: { pressureAny: boolean; pressureGenuine: boolean },
): DebriefData {
  const d = s.debrief;
  const arc = d.variant === 'arc';
  const visited = new Set(st.groups.flatMap((g) => g.visited));
  const shownBeats = [...visited];

  const flags: DebriefFlag[] = [];
  let could = 0;
  let marked = 0;
  for (const id of shownBeats) {
    const beat = beatById(s, id);
    if (!beat) continue;
    for (const ins of beat.inspectables) {
      const isFlag = ins.red_flag && (s.is_fraud || ins.context === 'quoted');
      if (!isFlag) continue;
      const tagged = st.tags.includes(`${id}|${ins.target}`);
      could++;
      if (tagged) marked++;
      flags.push({ text: ins.reveal, status: tagged ? 'marked' : 'not_marked', target: ins.target, beatId: id, senderCaveat: SENDER_TARGETS.test(ins.target) });
    }
  }
  for (const text of d.layer2.message_flags) flags.push({ text, status: 'in_message', senderCaveat: false });

  const wrongTags: DebriefWrongTag[] = st.tags.flatMap((key) => {
    const [beatId = '', target = ''] = key.split('|');
    if (!visited.has(beatId)) return [];
    const beat = beatById(s, beatId);
    if (!beat) return [];
    const ins = inspectableFor(beat, target);
    const correct = !!ins && ins.red_flag && (s.is_fraud || ins.context === 'quoted');
    if (correct) return [];
    const fairInstinct = s.is_fraud && !!ins && !ins.red_flag && ins.context !== 'quoted' && FAIR_INSTINCT_TYPES.has(ins.type ?? 'other');
    return [{ beatId, target, reveal: ins?.reveal, type: ins?.type, fairInstinct }];
  });

  // Drills are unscored teaching moments (GDD §4): no stars, points or "You chose" line, like arc beats (QA E2).
  const unscored = arc || s.role === 'drill';
  const multi = st.groups.length > 1;
  const lines: (OtherChoice & { cls: BeatResult['cls'] })[] = unscored
    ? []
    : st.groups.flatMap((g, i) => {
        const beat = r.beats[i];
        const line = beat && beat.scored ? choiceLine(s, g, beat) : null;
        const def = beatById(s, g.beatId);
        return line && beat ? [{ line, stars: beat.stars, cls: beat.cls, beat: multi && def ? { device: def.device, message: def.message } : null }] : [];
      });
  const lead = layerOneChoice(lines);
  // Layer 1 shows the lead line only when the displayed stars are below ★★★ and nobody fell. After a
  // fall the kind line takes the slot (layer-1 ruling 2026-11-19); with ★★★ displayed but a lower beat
  // (a boss's rounded mean), the "Next time" pointer or nothing does (ruling L1). Then the lead line
  // opens "Your other choices".
  const leadInLayer1 = !!lead && !r.fell && r.stars !== 3;
  const youChose = lead && leadInLayer1 ? [lead.line] : [];
  const others = lines.filter((x) => x !== lead);
  const strip = ({ line, stars, beat }: OtherChoice): OtherChoice => ({ line, stars, beat });
  const youChoseOther = (lead && !leadInLayer1 ? [lead, ...others] : others).map(strip);
  // Only a boss can show ★★★ over a lower beat; the role check keeps the engine and the validator
  // (scripts/lib/rules.ts counts this line only on a boss) in step.
  const nextTime = s.role === 'boss' && lead && !leadInLayer1 && !r.fell && r.stars === 3 && s.is_fraud && lead.cls === 'dismiss' ? ('after_hang_up' as const) : null;

  return {
    variant: d.variant,
    drill: s.role === 'drill',
    fell: r.fell,
    layer1: {
      verdict: unscored ? null : s.is_fraud ? 'fraud' : 'genuine',
      tell: d.layer1.tell,
      whatWorks: d.layer1.what_works,
      youChose,
      nextTime,
      allBest: r.best,
      stars: unscored ? null : r.stars,
      alreadyClicked: alreadyClickedLine(s, r.situation) ?? null,
    },
    layer2: {
      // A boss can reach the same outcome on several beats: say it once (QA E4).
      narratives: [...new Set(r.outcomes.flatMap((o) => (s.outcomes[o] ? [s.outcomes[o].narrative] : [])))],
      deadline: r.timerExpired ? (s.is_fraud ? 'fake' : 'real') : null,
      youChoseOther,
      flags,
      wrongTags,
      spotted: { marked, could },
      deviceTip: d.device_tip ?? null,
      alreadyClicked: d.already_clicked ?? null,
      habitCard: d.habit_card ?? null,
      pressureCallout: arc ? null : pressureCalloutFor(st.styledShown, !s.is_fraud, seen),
      levers: [...s.pressure.levers],
      sources: [...d.sources],
      notes: d.layer2.notes ?? null,
      safeguardingLine: d.safeguarding_line ?? null,
      points: unscored
        ? null
        : { base: r.base, tagBonus: r.tagBonus, tagBonusVoided: r.tagBonusVoided, recovery: r.fell ? (r.recovery?.points ?? 0) : null, total: r.points, max: r.maxPoints },
    },
  };
}

/** CR-15: the beat with the fewest stars leads layer 1; on a tie the latest beat. */
export function layerOneChoice<T extends { stars: number }>(lines: readonly T[]): T | undefined {
  let best: T | undefined;
  for (const x of lines) if (!best || x.stars <= best.stars) best = x;
  return best;
}

/** Label of an authored action or What-now extra anywhere in the scenario. */
function labelOf(s: Scenario, id: string): string | undefined {
  const all = [s, ...s.beats];
  for (const b of all) {
    const a = b.actions.find((x) => x.id === id) ?? b.what_now?.extra.find((x) => x.id === id);
    if (a) return a.label;
  }
  return undefined;
}

export function choiceLine(s: Scenario, g: GroupState, beat: BeatResult): ChoiceLine | null {
  if (beat.stars >= 3 && !beat.fell) return null;
  if (beat.timerExpired) return { beatId: g.beatId, kind: 'timer' };
  const d = g.decision;
  // A fall always names the decisive action. Otherwise an engage cap names the first engage action, even
  // when the later choice was a dismiss or report (producer ruling, T-2.1: it teaches more).
  if (!beat.fell && beat.capped && g.firstEngage) return { beatId: g.beatId, kind: 'action', label: g.firstEngage.label };
  if (!d) return null;
  // Over-caution on a genuine message gets its kind line, whichever button got there (ruling L4).
  const which = overCautionOf(beat.cls, truthOf(s), s.player_started === true);
  if (which) {
    const label = labelOf(s, d.actionId);
    return { beatId: g.beatId, kind: 'over_caution', which, ...(label ? { label } : {}) };
  }
  if (d.via === 'what_now' && (WHAT_NOW_BUILTINS as readonly string[]).includes(d.actionId)) {
    return { beatId: g.beatId, kind: 'what_now', choice: d.actionId as WhatNowBuiltin };
  }
  const label = labelOf(s, d.actionId);
  return label ? { beatId: g.beatId, kind: 'action', label } : null;
}
