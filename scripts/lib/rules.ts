/**
 * Game-design rules that need balance.yaml or other registries (GDD §6, §19
 * CR-11; balance.yaml `mix`, `session`, `recovery`; UI_SPEC §3, §6.3, §8.1,
 * §14). Pure functions: they return messages and never read files.
 *
 * - scenarioRules(): properties of one scenario. Always errors (warnings only
 *   for soft limits such as message length).
 * - chapterRules(): chapter structure (always errors) and the aggregate `mix`
 *   rules, which are errors for `status: complete` chapters and warnings for
 *   `status: draft` chapters, so chapters can be written incrementally.
 */
import { deriveCheckables } from '../../src/content/checkables.ts';
import { classOf, starsFor, truthOf } from '../../src/engine/scoring.ts';
import {
  HIGH_STAKES_REQUESTS,
  LANGUAGE_TYPES,
  NEVER_PROOF_TYPES,
  SCORED_ROLES,
  type Action,
  type Balance,
  type CastMember,
  type Chapter,
  type Device,
  type HabitCard,
  type Inspectable,
  type Message,
  type Scenario,
} from '../../src/content/schema.ts';

export interface Registries {
  balance: Balance;
  cast: Map<string, CastMember>;
  recoverySteps: Set<string>;
  habitCards: Map<string, HabitCard>;
  /** Known learning objectives (docs/LEARNING_OBJECTIVES.md); undefined skips the check. */
  los?: Set<string> | undefined;
  /** Known pattern briefs (docs/patterns/<id>.md); undefined skips the check. */
  patterns?: Set<string> | undefined;
  /** Every flag set by any outcome, and every arc variable written by any arc_effects. */
  flagsSet: Set<string>;
  arcVars: Set<string>;
}

export interface RuleResult {
  errors: string[];
  warnings: string[];
}

/**
 * Fixed copy around the authored layer-1 text (UI_SPEC §8.1), counted towards
 * session.debrief_layer1_max_words: the verdict chip ("This was a scam:", 4),
 * the "What works:" label (2) and the already-clicked line ("Already clicked
 * or paid? See what to do", 8). Arc debriefs have no verdict.
 */
export const LAYER1_OVERHEAD = { standard: 4 + 2 + 8, arc: 2 + 8 } as const;

export function wordCount(text: string | undefined): number {
  return text ? text.trim().split(/\s+/u).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
}

interface BeatView {
  where: string;
  device: Device;
  message: Message;
  inspectables: Inspectable[];
  actions: Action[];
  interrupt?: { is_fraud: boolean };
  /** Boss beats that arrive on their own schedule (independent messages). */
  scheduled: boolean;
  scored: boolean;
}

export function beatsOf(s: Scenario): BeatView[] {
  return [
    { where: 'opening message', device: s.device, message: s.message, inspectables: s.inspectables, actions: s.actions, scheduled: true, scored: true },
    ...s.beats.map((b) => ({
      where: `beat "${b.id}"`,
      device: b.device,
      message: b.message,
      inspectables: b.inspectables,
      actions: b.actions,
      scheduled: b.arrives_after !== undefined,
      scored: b.scored,
    })),
    ...s.interrupts.map((i) => ({
      where: `interrupt "${i.id}"`,
      device: i.device,
      message: i.message,
      inspectables: i.inspectables,
      actions: i.actions,
      interrupt: { is_fraud: i.is_fraud },
      scheduled: false,
      scored: false,
    })),
  ];
}

const SENDER_OR_LINK = /^(?:sender\.detail|caller_id|link(?:#\d)?)$/;

export function isDecoy(i: Inspectable): boolean {
  return !i.red_flag && i.context !== 'quoted';
}

export function scenarioRules(s: Scenario, reg: Registries): RuleResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { balance } = reg;
  const { mix, session } = balance;
  const truth = truthOf(s);
  const scored = SCORED_ROLES.includes(s.role);
  const beats = beatsOf(s);
  const story = beats.filter((b) => !b.interrupt);
  const storyActions = story.flatMap((b) => b.actions);
  const cls = (a: Action) => classOf(balance, a.kind);

  // Registries.
  for (const lo of s.learning_objectives) if (reg.los && !reg.los.has(lo)) errors.push(`learning objective ${lo} is not in docs/LEARNING_OBJECTIVES.md`);
  if (s.pattern && reg.patterns && !reg.patterns.has(s.pattern)) errors.push(`pattern "${s.pattern}" has no brief at docs/patterns/${s.pattern}.md`);
  for (const id of s.cast) if (!reg.cast.has(id)) errors.push(`cast: unknown cast member "${id}" (content/cast.yaml)`);
  if (s.debrief.habit_card) {
    const card = reg.habitCards.get(s.debrief.habit_card);
    if (!card) errors.push(`debrief.habit_card: unknown habit card "${s.debrief.habit_card}" (content/habit_cards.yaml)`);
    else if (!s.learning_objectives.includes(card.lo)) {
      errors.push(`debrief.habit_card "${card.id}" teaches ${card.lo}, which is not in this scenario's learning_objectives`);
    }
  }
  for (const f of s.requires_flags) if (!reg.flagsSet.has(f)) errors.push(`requires_flags: no outcome anywhere sets "${f}"`);
  if (s.arc_branch_on && !reg.arcVars.has(s.arc_branch_on)) errors.push(`arc_branch_on: no arc outcome writes "${s.arc_branch_on}"`);

  // Messages: cast, arc line limit, length, request -> pressure_target.
  const arcLimit = session.arc_line_max_words;
  for (const b of beats) {
    const m = b.message;
    if (m.from_cast !== undefined) {
      if (!reg.cast.has(m.from_cast)) errors.push(`${b.where}: from_cast "${m.from_cast}" is not in content/cast.yaml`);
      else if (!s.cast.includes(m.from_cast)) errors.push(`${b.where}: from_cast "${m.from_cast}" is missing from the scenario's cast list`);
    }
    const arcLine = s.role === 'arc' || (m.from_cast !== undefined && reg.cast.get(m.from_cast)?.arc_character === true);
    if (arcLine && wordCount(m.body) > arcLimit) errors.push(`${b.where}: arc lines are at most ${arcLimit} words (has ${wordCount(m.body)})`);
    if (wordCount(m.body) > session.max_message_words) warnings.push(`${b.where}: body has ${wordCount(m.body)} words (guideline ${session.max_message_words})`);

    const targets = b.actions.filter((a) => a.pressure_target);
    if (m.request !== 'none' && targets.length !== 1) {
      errors.push(`${b.where}: the message asks for something (request: ${m.request}), so exactly one action needs pressure_target: true (has ${targets.length})`);
    }
    if (m.request === 'none' && targets.length > 0) errors.push(`${b.where}: pressure_target is set but the message asks for nothing (request: none)`);

    // Inspectable rules.
    for (const ins of b.inspectables) {
      const t = ins.type;
      if (t && LANGUAGE_TYPES.includes(t) && mix.language_never_red_flag) {
        if (ins.red_flag || ins.reassures) errors.push(`${b.where}: ${ins.target}: ${t} is never a red flag or reassurance, only a decoy`);
        if (!s.is_fraud && ins.context !== 'quoted') errors.push(`${b.where}: ${ins.target}: ${t} may appear only as a decoy on fraud`);
      }
      if (t === 'padlock' && mix.padlock_never_reassurance_as_proof && (ins.reassures || ins.red_flag)) {
        errors.push(`${b.where}: ${ins.target}: the padlock is necessary but never proof; it is neither a red flag nor a reassurance`);
      }
    }
  }
  if (s.role === 'arc') {
    const speaker = s.message.from_cast;
    if (!speaker || reg.cast.get(speaker)?.arc_character !== true) errors.push('arc beats are spoken by an arc character: set message.from_cast');
  }
  if (mix.logo_or_sender_name_never_proof) {
    const reassuring = story.flatMap((b) => b.inspectables).filter((i) => i.reassures);
    if (reassuring.length > 0 && reassuring.every((i) => i.type && NEVER_PROOF_TYPES.includes(i.type))) {
      errors.push('a logo or display name is never proof: it cannot be the only reassuring detail');
    }
  }
  for (const p of s.pressure.pusher?.messages ?? []) {
    if (s.role === 'arc' && wordCount(p.text) > arcLimit) errors.push(`pusher at ${p.at_seconds}s: arc lines are at most ${arcLimit} words`);
  }

  // Actions.
  for (const b of beats) {
    const beatFraud = b.interrupt ? b.interrupt.is_fraud : s.is_fraud;
    for (const a of b.actions) {
      if (a.kind === 'approve_prompt' && mix.approve_prompt_only_on_fraud && !beatFraud) {
        errors.push(`${b.where}: action "${a.id}": approve_prompt only on fraud (a prompt you started is proceed)`);
      }
      if (!b.interrupt && s.is_fraud && s.role !== 'arc' && cls(a) === 'engage' && !balance.points.engage_on_fraud.terminal && !a.next_beat) {
        errors.push(`${b.where}: action "${a.id}": engage on fraud is never terminal; it needs next_beat`);
      }
    }
  }
  if (scored && truth === 'legit_low') {
    if (mix.no_comply_on_legit_low) {
      for (const a of storyActions) if (cls(a) === 'comply') errors.push(`action "${a.id}": no comply actions on low-stakes genuine messages`);
    }
    if (!storyActions.some((a) => a.kind === mix.genuine_normal_response_kind)) {
      errors.push(`the normal response to a low-stakes genuine message is ${mix.genuine_normal_response_kind}: add that action`);
    }
  }
  if (scored && !s.is_fraud && s.stakes) {
    const high = HIGH_STAKES_REQUESTS.includes(s.message.request);
    if (high !== (s.stakes === 'high')) {
      errors.push(`stakes: ${s.stakes} does not match the request (${s.message.request}); high stakes = asks to pay, log in, enter data or a code, approve or install`);
    }
  }
  if (s.player_started) {
    for (const a of storyActions) {
      if (a.kind === 'open_link' || a.kind === 'approve_prompt') errors.push(`action "${a.id}": the player started this, so the in-message action is proceed, not ${a.kind}`);
    }
    if (!storyActions.some((a) => a.kind === 'proceed')) errors.push('the player started this: add a proceed action');
  }
  if (mix.authoring_rule_applies_to_roles.includes(s.role)) {
    if (!storyActions.some((a) => cls(a) === 'verify')) errors.push(`${s.role} scenarios offer at least one verify action`);
    const tempting = storyActions.some((a) => {
      const st = starsFor(balance, cls(a), truth);
      return st !== undefined && st !== 3;
    });
    if (!tempting) errors.push(`${s.role} scenarios offer at least one tempting wrong action (fewer than 3 stars)`);
  }
  for (const a of storyActions) {
    if (starsFor(balance, cls(a), truth) === 'not_allowed' && scored) errors.push(`action "${a.id}": ${cls(a)} is not allowed on ${truth}`);
  }

  // Checkables and decoys (scored scenarios).
  if (scored) {
    const min = s.is_fraud ? mix.min_checkables.fraud : mix.min_checkables.legit;
    for (const b of story.filter((x) => x.scheduled)) {
      const n = deriveCheckables(b.device, b.message).length;
      if (n < min) errors.push(`${b.where}: ${n} checkable details; ${s.is_fraud ? 'fraud' : 'genuine'} messages need at least ${min}`);
    }
    if (s.is_fraud) {
      const decoys = story.flatMap((b) => b.inspectables).filter(isDecoy).length;
      if (decoys < mix.min_decoys_on_fraud) errors.push(`fraud scenarios need at least ${mix.min_decoys_on_fraud} decoys (non-red-flag inspectables), has ${decoys}`);
    }
  }
  if (s.role === 'boss') {
    const scoredBeats = story.filter((b) => b.scored).length;
    const max = balance.multi_step.boss.scored_beats_max;
    if (scoredBeats > max) errors.push(`a boss has at most ${max} scored beats (has ${scoredBeats}); mark later beats scored: false`);
  }

  // Debrief layer 1 word budget.
  const overhead = LAYER1_OVERHEAD[s.debrief.variant];
  const words = wordCount(s.debrief.layer1.tell) + wordCount(s.debrief.layer1.what_works) + overhead;
  if (words > session.debrief_layer1_max_words) {
    errors.push(`debrief.layer1 is ${words} words with the fixed copy (${overhead}); the limit is ${session.debrief_layer1_max_words}`);
  }

  // Damage control (CR-07).
  if (s.is_fraud && s.role !== 'arc') {
    for (const b of story) {
      for (const a of b.actions) {
        const c = cls(a);
        if ((c === 'comply' || c === 'proceed') && a.outcome && !s.outcomes[a.outcome]?.recovery) {
          errors.push(`action "${a.id}" is a fall on fraud: outcome "${a.outcome}" needs recovery options`);
        }
      }
    }
  }
  const pick = balance.recovery.pick;
  for (const [key, o] of Object.entries(s.outcomes)) {
    if (!o.recovery) continue;
    const ids = o.recovery.map((r) => r.step);
    for (const id of ids) if (!reg.recoverySteps.has(id)) errors.push(`outcomes.${key}.recovery: unknown step "${id}" (content/recovery_steps.yaml)`);
    if (new Set(ids).size !== ids.length) errors.push(`outcomes.${key}.recovery: duplicate steps`);
    const harmful = o.recovery.filter((r) => r.category === 'harmful').length;
    if (o.recovery.length < pick + 2 || o.recovery.length > pick + 3) errors.push(`outcomes.${key}.recovery: offer ${pick + 2}–${pick + 3} options (has ${o.recovery.length})`);
    if (harmful < 2) errors.push(`outcomes.${key}.recovery: include at least 2 harmful options (has ${harmful})`);
    if (!o.recovery.some((r) => r.category === 'stop')) errors.push(`outcomes.${key}.recovery: one option must be the stop step for this scenario`);
    if (o.recovery.length - harmful < pick) errors.push(`outcomes.${key}.recovery: at least ${pick} helpful options`);
  }

  return { errors, warnings };
}

/** Checkables of the opening message, used for twin parity. */
export function openingCheckables(s: Scenario): number {
  return deriveCheckables(s.device, s.message).length;
}

function ceilShare(expr: string, f: number): number {
  const n = Number(/^ceil\(F\/(\d+)\)$/.exec(expr)?.[1] ?? '1');
  return Math.ceil(f / n);
}

/**
 * @param scenarios all scenarios whose `chapter` is this chapter's city
 * @param fileBase  the chapter file's base name (must equal city)
 */
export function chapterRules(c: Chapter, fileBase: string, scenarios: Scenario[], reg: Registries): RuleResult {
  const errors: string[] = [];
  const mixIssues: string[] = [];
  const { balance } = reg;
  const { mix } = balance;
  const byId = new Map(scenarios.map((s) => [s.id, s]));

  if (c.city !== fileBase) errors.push(`city "${c.city}" does not match the file name "${fileBase}.yaml"`);
  const slot = balance.difficulty.chapter_slots[String(c.slot)];
  if (!slot) errors.push(`slot ${c.slot} is not in balance.yaml difficulty.chapter_slots`);
  for (const lo of c.lo_focus) if (reg.los && !reg.los.has(lo)) errors.push(`lo_focus: ${lo} is not in docs/LEARNING_OBJECTIVES.md`);
  for (const p of [...c.patterns, ...c.callbacks]) {
    if (reg.patterns && !reg.patterns.has(p)) errors.push(`pattern "${p}" has no brief at docs/patterns/${p}.md`);
  }

  const order = [...c.scenario_order.am, ...c.scenario_order.pm];
  for (const id of order) if (!byId.has(id)) errors.push(`scenario_order: "${id}" is not a scenario in content/scenarios/${c.city}/`);
  for (const s of scenarios) if (!order.includes(s.id)) errors.push(`scenario "${s.id}" is missing from scenario_order`);
  if (c.boss && byId.get(c.boss)?.role !== 'boss') errors.push(`boss "${c.boss}" must be a scenario with role: boss`);
  if (c.arc_beat && byId.get(c.arc_beat)?.role !== 'arc') errors.push(`arc_beat "${c.arc_beat}" must be a scenario with role: arc`);
  for (const s of scenarios) if (s.role === 'boss' && s.id !== c.boss) errors.push(`scenario "${s.id}" is a boss but the chapter's boss is "${c.boss ?? '(none)'}"`);

  // Twins: same chapter, opposite truth, checkable-count parity ±1 (UI_SPEC §3).
  for (const s of scenarios) {
    if (!s.twin_of) continue;
    const t = byId.get(s.twin_of);
    if (!t) {
      errors.push(`scenario "${s.id}": twin_of "${s.twin_of}" is not in this chapter`);
      continue;
    }
    if (t.is_fraud === s.is_fraud) errors.push(`scenario "${s.id}": its twin "${t.id}" must have the opposite truth`);
    const a = openingCheckables(s);
    const b = openingCheckables(t);
    if (Math.abs(a - b) > 1) errors.push(`twins "${s.id}" (${a}) and "${t.id}" (${b}) must expose the same number of checkable details, ±1`);
  }

  // Aggregate mix rules over scored scenarios in play order.
  const scored = order.map((id) => byId.get(id)).filter((s): s is Scenario => !!s && SCORED_ROLES.includes(s.role));
  const fraud = scored.filter((s) => s.is_fraud);
  const legit = scored.filter((s) => !s.is_fraud);
  if (slot) {
    const [lo, hi] = slot.scored;
    if (scored.length < lo || scored.length > hi) mixIssues.push(`${scored.length} scored scenarios; slot ${c.slot} expects ${lo}–${hi}`);
    for (const s of scored) {
      if (s.role === 'boss' && s.difficulty !== slot.boss_difficulty) mixIssues.push(`boss "${s.id}" difficulty ${s.difficulty}; slot ${c.slot} boss is ${slot.boss_difficulty}`);
      if (s.role === 'standard' && s.difficulty !== undefined && (s.difficulty < slot.band[0] || s.difficulty > slot.band[1])) {
        mixIssues.push(`"${s.id}" difficulty ${s.difficulty} is outside slot ${c.slot}'s band ${slot.band[0]}–${slot.band[1]}`);
      }
    }
  }
  if (c.patterns.length > balance.difficulty.max_new_patterns_per_chapter) mixIssues.push(`${c.patterns.length} new patterns; at most ${balance.difficulty.max_new_patterns_per_chapter}`);
  if (c.callbacks.length > balance.difficulty.max_callbacks_per_chapter) mixIssues.push(`${c.callbacks.length} callbacks; at most ${balance.difficulty.max_callbacks_per_chapter}`);
  for (const s of fraud) {
    if (s.pattern && ![...c.patterns, ...c.callbacks].includes(s.pattern)) mixIssues.push(`fraud "${s.id}" uses pattern "${s.pattern}", which is not in the chapter's patterns or callbacks`);
  }
  if (scored.length > 0) {
    const share = legit.length / scored.length;
    if (share < mix.legit_share.min || share > mix.legit_share.max) {
      mixIssues.push(`genuine share ${(share * 100).toFixed(0)}% (${legit.length} of ${scored.length}); must be ${mix.legit_share.min * 100}–${mix.legit_share.max * 100}%`);
    }
  }
  if (mix.boss_is_fraud && c.boss && byId.get(c.boss)?.is_fraud === false) mixIssues.push('the boss must be fraud');
  if (mix.legit_twin_required) {
    const paired = scored.some((s) => s.twin_of && byId.get(s.twin_of) && byId.get(s.twin_of)?.is_fraud !== s.is_fraud);
    if (!paired) mixIssues.push('the chapter needs at least one genuine twin of a fraud scenario (twin_of)');
  }
  let run = 0;
  scored.forEach((s, i) => {
    run = i > 0 && scored[i - 1]?.is_fraud === s.is_fraud ? run + 1 : 1;
    if (run === mix.max_consecutive_same_truth + 1) mixIssues.push(`more than ${mix.max_consecutive_same_truth} ${s.is_fraud ? 'fraud' : 'genuine'} scenarios in a row (ending at "${s.id}")`);
  });
  const themes = new Map<string, number>();
  for (const s of scored) if (s.theme) themes.set(s.theme, (themes.get(s.theme) ?? 0) + 1);
  for (const [theme, n] of themes) {
    if (n > Math.floor(mix.max_same_theme_share * scored.length)) mixIssues.push(`theme "${theme}" on ${n} of ${scored.length} scored scenarios; at most ${mix.max_same_theme_share * 100}%`);
  }
  scored.forEach((s, i) => {
    const prev = scored[i - 1];
    if (prev && s.theme && prev.theme === s.theme) mixIssues.push(`"${prev.id}" and "${s.id}" share the theme "${s.theme}" and sit next to each other`);
  });
  if (c.slot >= 1 && legit.length > 0 && fraud.length > 0) {
    const pressured = (s: Scenario) => s.pressure.timer || s.pressure.pusher !== undefined;
    const pl = (legit.filter(pressured).length / legit.length) * 100;
    const pf = (fraud.filter(pressured).length / fraud.length) * 100;
    if (Math.abs(pl - pf) > mix.pressure_parity_pp) {
      mixIssues.push(`pressure parity: timer/pusher on ${pl.toFixed(0)}% of genuine vs ${pf.toFixed(0)}% of fraud; max gap ${mix.pressure_parity_pp} points`);
    }
  }
  if (fraud.length > 0) {
    const need = ceilShare(mix.sender_or_link_decoy_min_share, fraud.length);
    const have = fraud.filter((s) => beatsOf(s).filter((b) => !b.interrupt).some((b) => b.inspectables.some((i) => isDecoy(i) && SENDER_OR_LINK.test(i.target)))).length;
    if (have < need) mixIssues.push(`${have} of ${fraud.length} fraud scenarios have the sender or link as a decoy; need ${need} (${mix.sender_or_link_decoy_min_share})`);
  }
  if (mix.genuine_at_every_difficulty_used) {
    const levels = new Set(scored.map((s) => s.difficulty));
    for (const d of levels) if (!legit.some((s) => s.difficulty === d)) mixIssues.push(`difficulty ${d} is used but has no genuine scenario`);
  }

  const prefixed = mixIssues.map((m) => `mix: ${m}`);
  return c.status === 'complete'
    ? { errors: [...errors, ...prefixed], warnings: [] }
    : { errors, warnings: prefixed.map((m) => `${m} (draft chapter)`) };
}

export { classOf, starsFor, truthOf };
export type { Truth } from '../../src/engine/scoring.ts';
