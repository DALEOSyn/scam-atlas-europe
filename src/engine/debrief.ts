/**
 * Debrief data assembly, layers 1 and 2 (GDD §3 step 6, UI_SPEC §8). Pure.
 * The UI renders this; Red Line 4 content (tell, what works, already clicked)
 * is always in layer 1.
 */
import type { Device, Inspectable, Message, Scenario } from '../content/schema.ts';
import { overCautionOf } from './choiceText.ts';
import { inspectableFor } from './inspect.ts';
import { alreadyClickedLine, clickedViaOf, type AlreadySituation, type ClickedVia } from './recovery.ts';
import type { ScenarioResult } from './result.ts';
import { beatById, deadlineLine, interruptNarratives, WHAT_NOW_BUILTINS, type DeadlineLine, type GroupState, type RunnerState, type WhatNowBuiltin } from './runner.ts';
import type { BeatResult } from './result.ts';
import { truthOf } from './scoring.ts';

export type FlagStatus = 'marked' | 'not_marked' | 'in_message';

export interface DebriefFlag {
  text: string;
  status: FlagStatus;
  /** Bound checkable, when there is one. */
  target?: string;
  beatId?: string;
  /**
   * Sender flags carry a caveat (UI_SPEC §8.2, LI-3; ruling QA m9): `name` = "Even a familiar sender name
   * can be faked."; `number` when the sender shows a phone number ("If it had shown the company's name
   * instead, that wouldn't prove it real either."). null on other flags.
   */
  senderCaveat: 'name' | 'number' | null;
}

export interface DebriefWrongTag {
  beatId: string;
  device: Device;
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
/** The beat a choice line belongs to, for a "{beat}: …" prefix. */
function beatOfLine(s: Scenario, line: ChoiceLine): { device: Device; message: Message } | null {
  const def = beatById(s, line.beatId);
  return def ? { device: def.device, message: def.message } : null;
}

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
  | { beatId: string; kind: 'action'; label: string; path?: ChoicePath }
  | { beatId: string; kind: 'what_now'; choice: WhatNowBuiltin; path?: ChoicePath }
  | { beatId: string; kind: 'over_caution'; which: OverCaution; label?: string }
  /** `genuine` (CR-45, psych M2): the timer ran out on a genuine message (`you_chose_timer_genuine`). */
  | { beatId: string; kind: 'timer'; genuine?: true };

/** The final choice after an engage (CR-27): an authored label, or a What-now built-in. */
export type ChoiceThen = { label: string } | { builtin: WhatNowBuiltin };

/**
 * CR-27: the whole path of a beat where an engage was followed by another final choice ("Call back the
 * number he gave", then "Leave it there"). Layer 2 renders it ("You chose: {engage}, then {then}.",
 * choiceText.ts choicePathText); layer 1 keeps one budgeted line (the 40-word rule).
 */
export interface ChoicePath {
  engage: string;
  then: ChoiceThen;
}

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
    /**
     * Which ★★★ line fits (Amsterdam QA i): `acted` on a genuine message won by acting on it (every scored
     * beat `proceed`): "Acting on it was right here."; else `habit`: "That is the habit that works."
     */
    bestLine: 'habit' | 'acted';
    /** null on arc beats and drills (no stars, no points). */
    stars: number | null;
    alreadyClicked: { situation: AlreadySituation; text: string } | null;
    /**
     * CR-40: after `advise_comply` in an advice scenario, the authored line shown without blame under the "You
     * chose" line ("Noor asked, and that was the smart bit. …"). null otherwise.
     */
    adviceLine: string | null;
  };
  layer2: {
    /**
     * "What happened": outcome narratives in order (boss: one per beat), said once (QA E4). They are
     * first shown in the consequence step, never in layer 1 (layer-1 ruling 2026-11-19).
     */
    narratives: string[];
    /**
     * Timer expiry line under "What happened", gated like the consequence caption: `fake` on fraud
     * ("The deadline was fake…"), `fake_fell` on fraud after a fall (no "Nothing happened", QA m1),
     * `genuine` on genuine ("Time's up in the game, not in real life…", ruling QA L4) at ★/★★, `genuine_missed` when
     * the genuine expiry scored 0 stars (CR-50, R26(2)), else null.
     */
    deadline: DeadlineLine;
    /** pressure.honest_deadline, for the genuine line's {deadline}. */
    honestDeadline: string | null;
    /**
     * "Your other choices": the other beats' lines below ★★★, in beat order (CR-15), each with its
     * beat's stars. When layer 1 shows no line (after a fall, or ★★★ displayed with a lower beat) the
     * lead line comes first.
     */
    youChoseOther: OtherChoice[];
    /**
     * CR-27 (round 2, psych M4): "Step by step", the path of the layer-1 line only, when an engage was
     * followed by another final choice ("You chose: Call back the number he gave. Then: Leave it there.";
     * choicePathText). A "Your other choices" row with a path shows the path in its own row instead.
     * `beat` (for a "{beat}: {line}" prefix) is set when the scenario has more than one scored beat.
     */
    choicePaths: { line: ChoiceLine; beat: { device: Device; message: Message } | null }[];
    flags: DebriefFlag[];
    wrongTags: DebriefWrongTag[];
    /** "You spotted {marked} of {could} you could mark." */
    spotted: { marked: number; could: number };
    deviceTip: string | null;
    /** CR-45: `headings` = authored sub-headings per situation (else the game's own). */
    alreadyClicked: { clicked?: string; entered_details?: string; shared_code?: string; paid?: string; headings?: Partial<Record<AlreadySituation, string>> | undefined } | null;
    /** CR-45: what "clicked" means in this scenario (link, call, reply, QR code), for its default sub-heading. */
    clickedVia?: ClickedVia;
    habitCard: string | null;
    pressureCallout: PressureCallout;
    /** Authored levers, the answer for the optional "Which pressure did they use?" tap. */
    levers: string[];
    sources: string[];
    notes: string | null;
    safeguardingLine: string | null;
    /** Points breakdown for "How the stars and points were worked out" (null on arc). */
    points: { base: number; tagBonus: number; tagBonusVoided: boolean; recovery: number | null; total: number; max: number; bossFallCap: boolean } | null;
  };
}

const SENDER_TARGETS = /^(?:sender\.detail|caller_id)$/;
/** Decoy types that look the same on a real call or message (ruling L2). */
const FAIR_INSTINCT_TYPES: ReadonlySet<string> = new Set(['caller_id', 'sender', 'logo']);

/** A sender that shows a phone number, not a name (ruling QA m9). */
const PHONE_DISPLAY = /^[+\d][\d\s•.-]*$/u;
/** A sender flag about the number, not the name ("a new number", "an unknown number"). */
const NEW_NUMBER = /\b(?:new|unknown|different|unsaved|another)\s+(?:mobile\s+|phone\s+)?number\b/i;

export function senderCaveatOf(target: string, display: string | undefined, ins?: { type?: string | undefined; reveal: string }): 'name' | 'number' | null {
  if (!SENDER_TARGETS.test(target)) return null;
  if (display && PHONE_DISPLAY.test(display.trim())) return 'number';
  // Amsterdam QA k: "Even a familiar sender name can be faked." is about a name. A flag about a new or
  // unknown number (type phone_number, or a reveal that says so) gets no caveat.
  if (ins && (ins.type === 'phone_number' || NEW_NUMBER.test(ins.reveal))) return null;
  return 'name';
}

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
  // Amsterdam QA j: "You spotted x of y" counts the same beats as the chapter's spotting (result.ts
  // groupTags): beats of scored groups only. Flags on unscored beats (a boss's later narrative beat or
  // request page) are still listed, but not counted.
  const counted = new Set(st.groups.filter((g) => g.scored).flatMap((g) => g.visited));

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
      if (counted.has(id)) {
        could++;
        if (tagged) marked++;
      }
      flags.push({ text: ins.reveal, status: tagged ? 'marked' : 'not_marked', target: ins.target, beatId: id, senderCaveat: senderCaveatOf(ins.target, beat.message.sender?.display, ins) });
    }
  }
  for (const text of d.layer2.message_flags) flags.push({ text, status: 'in_message', senderCaveat: null });

  const wrongTags: DebriefWrongTag[] = st.tags.flatMap((key) => {
    const [beatId = '', target = ''] = key.split('|');
    if (!visited.has(beatId)) return [];
    const beat = beatById(s, beatId);
    if (!beat) return [];
    const ins = inspectableFor(beat, target);
    const correct = !!ins && ins.red_flag && (s.is_fraud || ins.context === 'quoted');
    if (correct) return [];
    const fairInstinct = s.is_fraud && !!ins && !ins.red_flag && ins.context !== 'quoted' && FAIR_INSTINCT_TYPES.has(ins.type ?? 'other');
    return [{ beatId, device: beat.device, target, reveal: ins?.reveal, type: ins?.type, fairInstinct }];
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
  // stays in "Your other choices", at its beat.
  const leadInLayer1 = !!lead && !r.fell && r.stars !== 3;
  const youChose = lead && leadInLayer1 ? [lead.line] : [];
  const strip = ({ line, stars, beat }: OtherChoice): OtherChoice => ({ line, stars, beat });
  // Amsterdam QA l: "Your other choices" in beat order (the lead line, when not in layer 1, sits at its beat).
  const youChoseOther = lines.filter((x) => !(leadInLayer1 && x === lead)).map(strip);
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
      bestLine: bestLineOf(s, r),
      stars: unscored ? null : r.stars,
      alreadyClicked: alreadyClickedLine(s, r.situation) ?? null,
      adviceLine: st.groups.some((g) => g.decision?.kind === 'advise_comply') ? (d.advice_line ?? null) : null,
    },
    layer2: {
      // A boss can reach the same outcome on several beats: say it once (QA E4). Interrupts the player
      // answered come right after the beat they arrived in (QA M3).
      narratives: [
        ...new Set(
          [
            ...st.groups.flatMap((g, i) => [...(g.outcome && s.outcomes[g.outcome] ? [s.outcomes[g.outcome]?.narrative ?? ''] : []), ...interruptNarratives(s, st, i)]),
            // An after_beat interrupt answered in its own step at the end (ruling QA M6).
            ...interruptNarratives(s, st, st.groups.length),
          ],
        ),
      ],
      // CR-50 (R26(2)): a genuine expiry that scored 0 stars gets `genuine_missed` (the expired group's stars).
      deadline: r.timerExpired ? deadlineLine(s.is_fraud, r.fell, r.beats.find((x) => x.timerExpired)?.stars ?? null) : null,
      honestDeadline: s.pressure.honest_deadline ?? null,
      youChoseOther,
      choicePaths: youChose.filter((l) => (l.kind === 'action' || l.kind === 'what_now') && !!l.path).map((line) => ({ line, beat: lines.length > 1 ? beatOfLine(s, line) : null })),
      flags,
      wrongTags,
      spotted: { marked, could },
      deviceTip: d.device_tip ?? null,
      alreadyClicked: d.already_clicked ?? null,
      clickedVia: clickedViaOf(s),
      habitCard: d.habit_card ?? null,
      pressureCallout: arc ? null : pressureCalloutFor(st.styledShown, !s.is_fraud, seen),
      levers: [...s.pressure.levers],
      sources: [...d.sources],
      notes: d.layer2.notes ?? null,
      safeguardingLine: d.safeguarding_line ?? null,
      points: unscored
        ? null
        : { base: r.base, tagBonus: r.tagBonus, tagBonusVoided: r.tagBonusVoided, recovery: r.fell ? (r.recovery?.points ?? 0) : null, total: r.points, max: r.maxPoints, bossFallCap: r.bossFallCap },
    },
  };
}

/** Amsterdam QA i: a genuine message handled by acting on it did not need a checking habit. */
export function bestLineOf(s: Pick<Scenario, 'is_fraud'>, r: Pick<ScenarioResult, 'beats'>): 'habit' | 'acted' {
  const scored = r.beats.filter((b) => b.scored);
  return !s.is_fraud && scored.length > 0 && scored.every((b) => b.cls === 'proceed') ? 'acted' : 'habit';
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

/**
 * A group's final choice for the "then" part: an authored action or What-now extra by its label, or a
 * What-now built-in (its `call_back_label` when authored, else the built-in, labelled by the catalogue).
 */
function finalChoice(s: Scenario, g: GroupState, actionId: string, via: string | undefined): ChoiceThen | undefined {
  if (via === 'what_now' && (WHAT_NOW_BUILTINS as readonly string[]).includes(actionId)) {
    const wn = g.visited.map((id) => beatById(s, id)?.what_now).find((x) => x !== undefined);
    if (actionId === 'call_back_known' && wn?.call_back_label) return { label: wn.call_back_label };
    return { builtin: actionId as WhatNowBuiltin };
  }
  const label = labelOf(s, actionId);
  return label ? { label } : undefined;
}

export function choiceLine(s: Scenario, g: GroupState, beat: BeatResult): ChoiceLine | null {
  if (beat.stars >= 3 && !beat.fell) return null;
  if (beat.timerExpired) return { beatId: g.beatId, kind: 'timer', ...(s.is_fraud ? {} : { genuine: true as const }) };
  const d = g.decision;
  // CR-34: a payment code shared, then the confirmation declined: the code is what cost the third star (★★, ruling R18), so it is
  // named, with the final choice as the path ("You chose: Make a code and send it. Then: Decline.").
  if (!beat.fell && g.codeShared) {
    const code = g.codeShared;
    const then = d ? finalChoice(s, g, d.actionId, d.via) : undefined;
    return { beatId: g.beatId, kind: 'action', label: code.label, ...(then ? { path: { engage: code.label, then } } : {}) };
  }
  // A fall always names the decisive action. Otherwise an engage cap names the first engage action, even
  // when the later choice was a dismiss or report (producer ruling, T-2.1: it teaches more).
  if (!beat.fell && beat.capped && g.firstEngage) {
    const engage = g.firstEngage;
    const then = d && d.actionId !== engage.id ? finalChoice(s, g, d.actionId, d.via) : undefined;
    const path = then ? { engage: engage.label, then } : undefined;
    // CR-27 (Paris QA): after an engage, a final report or dismiss scores what it always scores (★★), so
    // "You chose" names that final choice, and the line agrees with the stars. Only a final verify loses a
    // star to the engage cap: then the engage is what cost it, and it is named. Layer 2 shows the path.
    if (d && then && d.cls !== 'verify') {
      if ('builtin' in then) return { beatId: g.beatId, kind: 'what_now', choice: then.builtin, ...(path ? { path } : {}) };
      return { beatId: g.beatId, kind: 'action', label: then.label, ...(path ? { path } : {}) };
    }
    return { beatId: g.beatId, kind: 'action', label: engage.label, ...(path ? { path } : {}) };
  }
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
