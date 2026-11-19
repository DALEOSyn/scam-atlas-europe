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
import { classOf, isFall, isUnscoredClass, starsFor, truthOf } from '../../src/engine/scoring.ts';
import { choiceLineText, nextTimeText, overCautionOf } from '../../src/engine/choiceText.ts';
import type { ChoiceLine } from '../../src/engine/debrief.ts';
import { lookup } from '../../src/i18n/index.ts';
import {
  ASK_REQUESTS,
  CR17_ASK_REQUESTS,
  CR30_ASK_DEVICES,
  CR30_FROM_SLOT,
  CR37_FROM_SLOT,
  HIGH_STAKES_REQUESTS,
  LANGUAGE_TYPES,
  NEVER_PROOF_TYPES,
  QR_MOUNT_DEVICES,
  SCORED_ROLES,
  type Action,
  type ActionClass,
  type ActionKind,
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
  /** Steps with a harmful-pick feedback line (GDD §9); undefined skips the check. */
  recoveryFeedback?: Set<string> | undefined;
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

/** Word count of a catalogue string (content/i18n/en/ui.json); 0 when the key does not exist yet. */
function wcKey(key: string): number {
  return wordCount(lookup(key));
}

/**
 * Fixed copy around the authored layer-1 text (UI_SPEC §8.1), counted towards
 * session.debrief_layer1_max_words, read from the catalogue: the verdict chip (the longer of
 * "This was a scam:" / "This was genuine:"), the "What works:" label and the already-clicked line.
 * Arc debriefs have no verdict: "The habit:" and the arc already-clicked line.
 */
export const LAYER1_OVERHEAD = {
  standard: Math.max(wcKey('debrief_verdict_fraud'), wcKey('debrief_verdict_genuine')) + wcKey('debrief_what_works') + wcKey('debrief_already_link'),
  arc: wcKey('debrief_the_habit') + wcKey('debrief_already_link_arc'),
} as const;

/**
 * The fixed copy this scenario's layer 1 really shows (CR-45; STATUS follow-up "compute genuine-scenario
 * layer-1 overhead without … the already-clicked link"): the already-clicked link renders only when the
 * debrief has `already_clicked` (DebriefView), so a debrief without it does not count its words.
 */
export function layer1Overhead(s: Pick<Scenario, 'debrief'>): number {
  const v = s.debrief.variant;
  if (s.debrief.already_clicked) return LAYER1_OVERHEAD[v];
  return LAYER1_OVERHEAD[v] - wcKey(v === 'arc' ? 'debrief_already_link_arc' : 'debrief_already_link');
}

/** "That is the habit that works." / "Acting on it was right here." (`outcome_best`, `outcome_best_acted`): the ★★★ line in the layer-1 slot. */
export const BEST_LINE_WORDS = Math.max(wcKey('outcome_best'), wcKey('outcome_best_acted'));

export function wordCount(text: string | undefined): number {
  return text ? text.trim().split(/\s+/u).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
}

interface BeatView {
  /** Beat id ('start' for the opening message). */
  id: string;
  where: string;
  device: Device;
  message: Message;
  inspectables: Inspectable[];
  actions: Action[];
  what_now?: Scenario['what_now'];
  interrupt?: { is_fraud: boolean };
  /** Boss beats that arrive on their own schedule (independent messages). */
  scheduled: boolean;
  scored: boolean;
}

/**
 * CR-35: a later scheduled boss beat continues the conversation of scheduled beat `id`: it names `id` in
 * covered_by, or it comes from the same sender (display and detail) on the same device.
 */
export function continuesConversation(s: Scenario, id: string): boolean {
  const scheduled = beatsOf(s).filter((b) => !b.interrupt && b.scheduled);
  const at = scheduled.findIndex((b) => b.id === id);
  const own = scheduled[at];
  if (!own) return false;
  return scheduled.slice(at + 1).some((later) => {
    const covers = s.beats.find((x) => x.id === later.id)?.covered_by ?? [];
    const sameThread = later.device === own.device && !!own.message.sender && later.message.sender?.display === own.message.sender.display && later.message.sender.detail === own.message.sender.detail;
    return covers.includes(id) || sameThread;
  });
}

export function beatsOf(s: Scenario): BeatView[] {
  return [
    { id: 'start', where: 'opening message', device: s.device, message: s.message, inspectables: s.inspectables, actions: s.actions, what_now: s.what_now, scheduled: true, scored: true },
    ...s.beats.map((b) => ({
      id: b.id,
      where: `beat "${b.id}"`,
      device: b.device,
      message: b.message,
      inspectables: b.inspectables,
      actions: b.actions,
      what_now: b.what_now,
      scheduled: b.arrives_after !== undefined,
      scored: b.scored,
    })),
    ...s.interrupts.map((i) => ({
      id: i.id,
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

/** The padlock / "Page info" detail (UI_SPEC §3.5). */
export function isPadlock(i: Inspectable): boolean {
  return i.type === 'padlock' || i.target === 'page.info';
}

/**
 * Padlock reveals read the same on every page, genuine or fraud, in every scenario (producer ruling,
 * T-2.7 review): otherwise the wording itself tells real pages from fake ones. Returns one error per
 * reveal that differs from the most common wording.
 */
export function padlockRevealIssues(scenarios: readonly Scenario[]): { id: string; message: string }[] {
  const seen: { id: string; where: string; reveal: string }[] = [];
  for (const s of scenarios) {
    for (const b of beatsOf(s)) for (const i of b.inspectables) if (isPadlock(i)) seen.push({ id: s.id, where: `${b.where}: ${i.target}`, reveal: i.reveal.trim() });
  }
  const counts = new Map<string, number>();
  for (const x of seen) counts.set(x.reveal, (counts.get(x.reveal) ?? 0) + 1);
  const canonical = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  return seen
    .filter((x) => x.reveal !== canonical)
    .map((x) => ({ id: x.id, message: `${x.where}: padlock reveals must be identical in every scenario; use "${canonical ?? ''}"` }));
}

export function isDecoy(i: Inspectable): boolean {
  return !i.red_flag && i.context !== 'quoted';
}

/** UI_SPEC §8.1: action labels are capped so the "You chose" line stays short. */
export const ACTION_LABEL_MAX_WORDS = 8;
function whatNowsOf(s: Scenario): [string, NonNullable<Scenario['what_now']>][] {
  const out: [string, NonNullable<Scenario['what_now']>][] = [];
  if (s.what_now) out.push(['opening message', s.what_now]);
  for (const b of s.beats) if (b.what_now) out.push([`beat "${b.id}"`, b.what_now]);
  return out;
}

/** Class of each built-in "What now?" choice (docs/ENGINE.md). */
const WHAT_NOW_BUILTIN_CLASS = { call_back_known: 'verify', report: 'report', done: 'dismiss' } as const;

/** Does the scenario have an action that is a fall (comply or proceed on fraud)? */
export function anyFall(s: Scenario, balance: Registries['balance']): boolean {
  const truth = truthOf(s);
  return beatsOf(s)
    .filter((b) => !b.interrupt)
    .some((b) => b.actions.some((a) => isFall(classOf(balance, a.kind), truth, a.kind)));
}

/**
 * Every "You chose" line this scenario can put in the layer-1 slot, as the exact text
 * choiceLineText() renders (src/engine/choiceText.ts, shared with DebriefView). Counted: every action,
 * "What now?" extra and built-in that can leave it (or a boss beat) below 3 stars and is NOT a fall
 * (after a fall the kind line takes the slot), engage actions included; the timer line when timed.
 * Each line is built as the same ChoiceLine the engine's choiceLine() builds, so the count is exact:
 * built-ins render you_chose_whatnow_* (ruling L1); over-caution on genuine (report; dismiss on high
 * stakes) renders you_chose_report_genuine / _dismiss_genuine / _dismiss_started (ruling L4, picked by
 * overCautionOf()). Plus the "Next time" pointer on a boss with a dismiss-class ending on fraud (a
 * dismiss action, the "Leave it there" built-in, or a timer).
 */
export function choiceLines(s: Scenario, balance: Registries['balance']): string[] {
  const truth = truthOf(s);
  const below3 = (cls: ReturnType<typeof classOf>, kind?: ActionKind) => {
    // Pause and start_transfer (step, CR-18) never decide, so they never name a "You chose" line.
    // CR-40: advise_comply is comply but not a fall, so its "You chose" line names the advice.
    if (isUnscoredClass(cls) || isFall(cls, truth, kind)) return false;
    if (cls === 'engage') return true;
    const st = starsFor(balance, cls, truth);
    return typeof st === 'number' ? st < 3 : true;
  };
  const lines: ChoiceLine[] = [];
  const classes = new Set<string>();
  const started = s.player_started === true;
  const lineFor = (beatId: string, cls: ActionClass, plain: ChoiceLine): ChoiceLine => {
    const which = overCautionOf(cls, truth, started);
    return which ? { beatId, kind: 'over_caution', which } : plain;
  };
  if (s.pressure.timer) {
    lines.push({ beatId: 'start', kind: 'timer', ...(s.is_fraud ? {} : { genuine: true as const }) });
    classes.add(balance.stars.timer_expiry);
  }
  for (const b of beatsOf(s).filter((x) => !x.interrupt)) {
    for (const a of b.actions) {
      const cls = classOf(balance, a.kind);
      // CR-31(b): a capped start_transfer is named like an engage; CR-34: a shared payment code before the
      // confirmation is named when the player then declines (★).
      const named = (a.kind === 'start_transfer' && a.cap === 'engage') || (a.kind === 'share_code' && a.next_beat !== undefined);
      if (below3(cls, a.kind) || named) {
        lines.push(named ? { beatId: b.where, kind: 'action', label: a.label } : lineFor(b.where, cls, { beatId: b.where, kind: 'action', label: a.label }));
        classes.add(cls);
      }
    }
  }
  for (const [, wn] of whatNowsOf(s)) {
    for (const x of wn.extra) {
      const cls = classOf(balance, x.kind);
      if (below3(cls, x.kind)) lines.push(lineFor('what_now', cls, { beatId: 'what_now', kind: 'action', label: x.label }));
    }
    for (const [choice, cls] of Object.entries(WHAT_NOW_BUILTIN_CLASS) as [keyof typeof WHAT_NOW_BUILTIN_CLASS, ActionClass][]) {
      if (below3(cls)) {
        lines.push(lineFor('what_now', cls, { beatId: 'what_now', kind: 'what_now', choice }));
        classes.add(cls);
      }
    }
  }
  const texts = lines.map((c) => choiceLineText(c, lookup));
  if (s.role === 'boss' && truth === 'fraud' && classes.has('dismiss')) texts.push(nextTimeText('after_hang_up', lookup));
  return [...new Set(texts)].filter((x) => x.length > 0);
}

/** The longest "You chose" line (words), see choiceLines(). */
export function choiceWorst(s: Scenario, balance: Registries['balance']): number {
  return Math.max(0, ...choiceLines(s, balance).map(wordCount));
}

/**
 * The layer-1 slot (layer-1 ruling 2026-11-19): it holds ONE of the ★★★ line, the kind line (after a
 * fall, instead of any choice line) or a "You chose" line, so it costs the longest of them.
 */
export function layer1Slot(s: Scenario, balance: Registries['balance']): { words: number; source: string } {
  const candidates: { words: number; source: string }[] = [{ words: BEST_LINE_WORDS, source: 'the ★★★ line' }];
  if (anyFall(s, balance)) candidates.push({ words: wcKey('debrief_no_shame'), source: 'the kind line after a fall' });
  for (const text of choiceLines(s, balance)) candidates.push({ words: wordCount(text), source: `"${text}"` });
  return candidates.reduce((a, b) => (b.words > a.words ? b : a));
}

/** Canonical action order (ruling QA L6), 1-based ranks. */
const ACTION_RANK_NAMES = ["the message's own action", 'verify', 'other proceed/engage/comply', 'report', 'dismiss'] as const;

/**
 * Rank of an action in the canonical order: 1 the message's own action (its pressure_target, or with
 * request: none the first proceed/engage/comply/step action), 2 verify, 3 any other
 * proceed/engage/comply/step (start_transfer, CR-18: "Set up the transfer" sits with the doing
 * actions), 4 report, 5 dismiss. Meta actions (pause) and others rank with dismiss.
 */
export function actionRank(m: Pick<Message, 'request'>, actions: readonly Action[], a: Action, balance: Pick<Registries['balance'], 'action_kinds'>): number {
  const c = classOf(balance, a.kind);
  const doingClasses = ['proceed', 'engage', 'comply', 'step'];
  const doing = doingClasses.includes(c);
  const own = m.request === 'none' ? actions.find((x) => doingClasses.includes(classOf(balance, x.kind))) : actions.find((x) => x.pressure_target);
  if (own === a) return 1;
  if (c === 'verify') return 2;
  if (doing) return 3;
  if (c === 'report') return 4;
  return 5;
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
  // Verify extras in "What now?" are offered to the player like actions (GDD §16: Adaeze, Desk, known desk).
  const whatNowVerify = whatNowsOf(s).flatMap(([, wn]) => wn.extra.filter((x) => x.outcome !== undefined));
  const cls = (a: Action) => classOf(balance, a.kind);
  // CR-45 (sceptic B1): a one-action opener is a setup step (isSetupStep): its action is proceed-class.
  if (s.actions.length === 1 && s.actions[0] && cls(s.actions[0]) !== 'proceed') errors.push(`a single opening action must be a setup step (a proceed-class action with next_beat), not ${s.actions[0].kind}`);

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
    // CR-36: the voice belongs to someone the story knows: a cast member of this scenario.
    if (m.voice) {
      if (!reg.cast.has(m.voice.sounds_like)) errors.push(`${b.where}: voice.sounds_like "${m.voice.sounds_like}" is not in content/cast.yaml (CR-36)`);
      else if (!s.cast.includes(m.voice.sounds_like)) errors.push(`${b.where}: voice.sounds_like "${m.voice.sounds_like}" is missing from the scenario's cast list (CR-36)`);
    }
    // CR-43: the finale's scenarios (a recovery firm's email, Teo's chat) are not Alex speaking.
    const arcLine = (s.role === 'arc' && s.finale === undefined) || (m.from_cast !== undefined && reg.cast.get(m.from_cast)?.arc_character === true);
    if (arcLine && wordCount(m.body) > arcLimit) errors.push(`${b.where}: arc lines are at most ${arcLimit} words (has ${wordCount(m.body)})`);
    if (wordCount(m.body) > session.max_message_words) warnings.push(`${b.where}: body has ${wordCount(m.body)} words (guideline ${session.max_message_words})`);

    const targets = b.actions.filter((a) => a.pressure_target);
    if (m.request !== 'none' && targets.length !== 1) {
      errors.push(`${b.where}: the message asks for something (request: ${m.request}), so exactly one action needs pressure_target: true (has ${targets.length})`);
    }
    // CR-30: a `none` message with an ask ("Print your label…") tells the reader what to do: that action may be its target.
    if (m.request === 'none' && !m.ask && targets.length > 0) errors.push(`${b.where}: pressure_target is set but the message asks for nothing (request: none)`);
    if (m.request === 'none' && m.ask && targets.length > 1) errors.push(`${b.where}: at most one action has pressure_target: true (has ${targets.length})`);

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
      // Reveal wording (docs/CONTENT_GUIDE.md): a padlock looks the same on real and fake pages, so its
      // reveal never opens like a genuine detail's would; that would leak the verdict.
      if (isPadlock(ins) && /^\s*It fits\b/i.test(ins.reveal)) {
        errors.push(`${b.where}: ${ins.target}: a padlock reveal must not start with "It fits" (it looks the same on real and fake pages; use the shared padlock wording)`);
      }
    }
  }
  if (s.role === 'arc' && s.finale === undefined) {
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

  // "What now?" extras (GDD §6, §16, §17): engage extras (note) return to the step and cap the beat at ★★;
  // verify extras (outcome) end the step as verify.
  for (const [where, wn] of whatNowsOf(s)) {
    for (const x of wn.extra) {
      const c = classOf(balance, x.kind);
      if (x.note !== undefined && c !== 'engage') errors.push(`${where}: what_now extra "${x.id}" has a note, so it returns to "What now?": it must be an engage kind, not ${x.kind}`);
      if (x.outcome !== undefined && c !== 'verify') errors.push(`${where}: what_now extra "${x.id}" ends the step with an outcome: it must be a verify kind, not ${x.kind}`);
    }
  }
  for (const b of beats) {
    for (const a of [...b.actions, ...(b.what_now?.extra ?? [])]) {
      if (wordCount(a.label) > ACTION_LABEL_MAX_WORDS) errors.push(`${b.where}: action "${a.id}" label is over ${ACTION_LABEL_MAX_WORDS} words (UI_SPEC §8.1)`);
    }
  }
  // Action order (design ruling 2026-11-19, QA L6): one canonical order by role on every beat and
  // interrupt, so position never hints at the verdict.
  for (const b of beats) {
    const ranks = b.actions.map((a) => actionRank(b.message, b.actions, a, balance));
    for (let i = 1; i < ranks.length; i++) {
      if ((ranks[i] ?? 0) < (ranks[i - 1] ?? 0)) {
        errors.push(
          `${b.where}: action_order: "${b.actions[i]?.id}" (${ACTION_RANK_NAMES[(ranks[i] ?? 1) - 1]}) comes after "${b.actions[i - 1]?.id}" (${ACTION_RANK_NAMES[(ranks[i - 1] ?? 1) - 1]}); order: the message's own action, verify, other proceed/engage/comply, report, dismiss`,
        );
        break;
      }
    }
  }
  // CR-18(b): the banking beat opened by start_transfer offers at least one verify and one dismiss.
  for (const b of story) {
    for (const a of b.actions) {
      if (a.kind !== 'start_transfer' || a.next_beat === undefined) continue;
      if (cls(a) !== 'step') errors.push(`${b.where}: action "${a.id}": start_transfer must be class step in balance.yaml (CR-18)`);
      const target = s.beats.find((x) => x.id === a.next_beat);
      if (!target) continue;
      if (!target.actions.some((x) => cls(x) === 'verify')) errors.push(`beat "${target.id}": the banking beat opened by start_transfer needs at least one verify action (CR-18(b))`);
      if (!target.actions.some((x) => cls(x) === 'dismiss')) errors.push(`beat "${target.id}": the banking beat opened by start_transfer needs at least one dismiss action, e.g. "Cancel" (CR-18(b))`);
    }
  }
  // CR-34: the code confirmation offers Confirm (pay, the fall), a dismiss ("Decline") and may offer a verify.
  for (const b of story) {
    if (!b.message.payee?.code_confirm) continue;
    if (!b.actions.some((x) => x.kind === 'pay')) errors.push(`${b.where}: the code confirmation needs a pay action ("Confirm"), the fall (CR-34)`);
    if (!b.actions.some((x) => cls(x) === 'dismiss')) errors.push(`${b.where}: the code confirmation needs a dismiss action ("Decline") (CR-34)`);
    if (b.actions.some((x) => x.kind !== 'pay' && !['verify', 'dismiss', 'report'].includes(cls(x)))) errors.push(`${b.where}: the code confirmation offers only Confirm (pay), Decline (dismiss), a verify or a report (CR-34)`);
  }
  // CR-32: recovery_for names a cast member from content/cast.yaml (CR-41: voiced_by does).
  for (const [key, o] of Object.entries(s.outcomes)) {
    const voice = o.recovery_for === undefined ? undefined : typeof o.recovery_for === 'string' ? o.recovery_for : o.recovery_for.voiced_by;
    if (voice !== undefined && !reg.cast.has(voice)) errors.push(`outcomes.${key}.recovery_for: "${voice}" is not in content/cast.yaml (CR-32, CR-41)`);
  }
  // CR-40: the advised person is a cast member.
  if (s.advice && !reg.cast.has(s.advice.for)) errors.push(`advice.for: "${s.advice.for}" is not in content/cast.yaml (CR-40)`);
  // CR-42: the overlay's "Close" picks the beat's one dismiss action; nothing on it is a training form.
  for (const b of beats) {
    if (!b.message.page?.overlay) continue;
    const dismiss = b.actions.filter((x) => cls(x) === 'dismiss');
    if (dismiss.length !== 1) errors.push(`${b.where}: a page overlay's "Close" picks the beat's dismiss action: it needs exactly one (has ${dismiss.length}) (CR-42)`);
    if (b.actions.some((x) => x.kind === 'enter_details' || x.kind === 'pay')) errors.push(`${b.where}: a page with a warning overlay is not a training form (CR-42)`);
  }
  // CR-23: "Matches" only says whose account it is, on genuine and fraud alike; its reveal never opens like a genuine fit.
  for (const b of beats) {
    if (b.device !== 'banking' || b.message.payee?.name_check !== 'match') continue;
    for (const ins of b.inspectables) {
      if (ins.target === 'payee.name_check' && /^\s*It fits\b/i.test(ins.reveal)) errors.push(`${b.where}: payee.name_check: a "match" reveal must not start with "It fits" (a match only shows whose account it is; CR-23)`);
    }
  }
  // Shared a code (ruling QA m10): code-sharing and approval actions need their own "If you already…" advice.
  const sharesCode = beats.some((b) => [...b.actions, ...(b.what_now?.extra ?? [])].some((a) => a.kind === 'share_code' || a.kind === 'approve_prompt'));
  if (sharesCode && !s.debrief.already_clicked?.shared_code) errors.push('debrief.already_clicked.shared_code is required: a share_code or approve_prompt action exists');
  // Genuine timer expiry shows the message's own deadline (ruling QA L4).
  if (!s.is_fraud && s.pressure.timer && !s.pressure.honest_deadline) errors.push('a genuine timed scenario needs pressure.honest_deadline (shown when the game timer runs out)');
  // Boss "already checked" (ruling QA fun note a): covered_by names earlier scheduled beats.
  if (s.role === 'boss') {
    const scheduled = ['start', ...s.beats.filter((x) => x.arrives_after !== undefined).map((x) => x.id)];
    s.beats.forEach((b) => {
      if (!b.covered_by) return;
      const at = scheduled.indexOf(b.id);
      if (at < 0) errors.push(`beat "${b.id}": covered_by is for scheduled boss beats (arrives_after)`);
      for (const c of b.covered_by) {
        const ci = scheduled.indexOf(c);
        if (ci < 0 || (at >= 0 && ci >= at)) errors.push(`beat "${b.id}": covered_by "${c}" must be an earlier scheduled beat (start or a beat with arrives_after)`);
      }
    });
  } else if (s.beats.some((b) => b.covered_by)) errors.push('covered_by is for boss beats only');

  // Producer ruling (T-2.1): a boss beat may state its own timer length, within the balance bounds; CR-54: so may a
  // boss's opening beat (scenario-level timer_seconds), same bounds.
  {
    const lo = Math.min(balance.timers.call_beat, balance.timers.boss_beat);
    const hi = Math.max(balance.timers.call_beat, balance.timers.boss_beat);
    for (const b of [{ id: 'start', timer_seconds: s.timer_seconds }, ...s.beats]) {
      if (b.timer_seconds === undefined) continue;
      if (b.timer_seconds < lo || b.timer_seconds > hi) errors.push(`beat "${b.id}": timer_seconds ${b.timer_seconds} is outside ${lo}–${hi} (timers.call_beat … timers.boss_beat)`);
    }
  }

  // Actions.
  for (const b of beats) {
    const beatFraud = b.interrupt ? b.interrupt.is_fraud : s.is_fraud;
    for (const a of b.actions) {
      if (a.kind === 'approve_prompt' && mix.approve_prompt_only_on_fraud && !beatFraud) {
        errors.push(`${b.where}: action "${a.id}": approve_prompt only on fraud (a prompt you started is proceed)`);
      }
      // A proceed that only moves on from a fraud beat that asks nothing reads as a setup step but is a
      // fall in the engine; author it as open_link (engage) instead (sceptic T-2.8, GDD §6 opener ruling).
      if (beatFraud && b.message.request === 'none' && cls(a) === 'proceed' && a.next_beat !== undefined && a.outcome === undefined) {
        errors.push(`${b.where}: action "${a.id}": a proceed with next_beat from a fraud message with request: none is ambiguous; use kind open_link (engage), or give the message a request`);
      }
      if (!b.interrupt && s.is_fraud && s.role !== 'arc' && cls(a) === 'engage' && !balance.points.engage_on_fraud.terminal && !a.next_beat) {
        // CR-35 (ruling R14): on a scheduled boss beat, an engage may end the beat's group (★★) when a later
        // scheduled beat continues the same conversation (names it in covered_by, or shares its sender thread).
        const own = b.scheduled && s.role === 'boss' ? b.id : undefined;
        if (own === undefined) errors.push(`${b.where}: action "${a.id}": engage on fraud is never terminal; it needs next_beat (CR-35: only a scheduled boss beat may end on an engage)`);
        else if (!continuesConversation(s, own)) {
          errors.push(`${b.where}: action "${a.id}": an engage that ends a boss beat needs a later scheduled beat that continues the conversation: one that names "${own}" in covered_by, or comes from the same sender on the same device (CR-35)`);
        }
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
    // Every story beat counts: a harmless opening that leads to a payment page is high stakes.
    const requests = story.map((b) => b.message.request);
    const high = requests.some((r) => HIGH_STAKES_REQUESTS.includes(r));
    if (high !== (s.stakes === 'high')) {
      errors.push(
        `stakes: ${s.stakes} does not match the requests (${[...new Set(requests)].join(', ')}); high stakes = any beat asks to pay, log in, enter data or a code, approve or install`,
      );
    }
  }
  if (s.player_started) {
    for (const a of storyActions) {
      if (a.kind === 'open_link' || a.kind === 'approve_prompt') errors.push(`action "${a.id}": the player started this, so the in-message action is proceed, not ${a.kind}`);
    }
    if (!storyActions.some((a) => a.kind === 'proceed')) errors.push('the player started this: add a proceed action');
  }
  if (mix.authoring_rule_applies_to_roles.includes(s.role)) {
    if (!storyActions.some((a) => cls(a) === 'verify') && whatNowVerify.length === 0) errors.push(`${s.role} scenarios offer at least one verify action`);
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
    // Scored beat groups: the opening and scored scheduled beats. Banking or request pages reached from a
    // scheduled beat (next_beat) score inside their parent beat, so they never count here (follow-up e).
    const scoredBeats = story.filter((b) => b.scheduled && b.scored).length;
    const max = balance.multi_step.boss.scored_beats_max;
    if (scoredBeats > max) errors.push(`a boss has at most ${max} scored beats (has ${scoredBeats}); mark later beats scored: false`);
  }

  // Debrief layer 1 word budget (UI_SPEC §8.1, layer-1 ruling 2026-11-19). Outcome narratives and
  // deadline_fake are shown in the consequence step, not in layer 1, so they count 0.
  {
    const arcDebrief = s.debrief.variant === 'arc';
    const overhead = layer1Overhead(s);
    const authored = wordCount(s.debrief.layer1.tell) + wordCount(s.debrief.layer1.what_works) + (arcDebrief ? wordCount(s.debrief.safeguarding_line) : 0);
    const slot = arcDebrief
      ? { words: anyFall(s, balance) ? wcKey('debrief_no_shame') : 0, source: 'the kind line after a fall' }
      : layer1Slot(s, balance);
    const words = authored + overhead + slot.words;
    if (words > session.debrief_layer1_max_words) {
      errors.push(
        `debrief.layer1 is ${words} words in the worst case (authored ${authored} + fixed ${overhead} + slot ${slot.words}: ${slot.source}); the limit is ${session.debrief_layer1_max_words}`,
      );
    }
  }

  // Damage control (CR-07).
  // CR-43: the finale's arc scenarios run damage control after a fall too. CR-40: advise_comply is never a fall.
  if (s.is_fraud && (s.role !== 'arc' || s.finale !== undefined)) {
    for (const b of story) {
      for (const a of b.actions) {
        const c = cls(a);
        if ((c === 'comply' || c === 'proceed') && a.kind !== 'advise_comply' && a.outcome && !s.outcomes[a.outcome]?.recovery) {
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
    for (const r of o.recovery) {
      if (r.category === 'harmful' && !r.feedback && reg.recoveryFeedback && !reg.recoveryFeedback.has(r.step)) {
        errors.push(`outcomes.${key}.recovery: harmful step "${r.step}" needs a feedback line (here or in content/recovery_steps.yaml; GDD §9: why it hurts, what works instead, no blame)`);
      }
    }
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
/**
 * R26(1), CR-54: a boss's scheduled call beats (the opening beat and every beat with arrives_after on the call device)
 * whose timer length differs from balance timers.boss_call_beat_by_slot for the chapter's slot. A boss without a
 * timer has none to check.
 */
export function bossCallBeatIssues(s: Scenario, slot: number, balance: { timers: Pick<Registries['balance']['timers'], 'call_beat' | 'boss_call_beat_by_slot'> }): string[] {
  if (s.role !== 'boss' || !s.pressure.timer) return [];
  const want = balance.timers.boss_call_beat_by_slot[String(slot)];
  if (want === undefined) return [`balance.yaml timers.boss_call_beat_by_slot has no entry for slot ${slot}`];
  const beats = [{ id: 'start', device: s.device, timer_seconds: s.timer_seconds }, ...s.beats.filter((b) => b.arrives_after !== undefined)];
  return beats.flatMap((b) => {
    if (b.device !== 'call') return [];
    const len = b.timer_seconds ?? balance.timers.call_beat;
    if (len === want) return [];
    const where = b.id === 'start' ? 'opening beat (scenario-level timer_seconds)' : `beat "${b.id}"`;
    return [`boss "${s.id}" ${where}: a boss call beat in slot ${slot} runs ${want} s (timers.boss_call_beat_by_slot, R26(1)); it runs ${len} s`];
  });
}

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
  const finale = c.arc_finale;
  const finaleIds = finale ? [finale.close, finale.recovery_offer, finale.teo] : [];
  for (const s of scenarios) if (!order.includes(s.id) && !finaleIds.includes(s.id)) errors.push(`scenario "${s.id}" is missing from scenario_order`);
  if (c.boss && byId.get(c.boss)?.role !== 'boss') errors.push(`boss "${c.boss}" must be a scenario with role: boss`);
  // R26(1), CR-54 (required): every scheduled call beat of a timed boss runs timers.boss_call_beat_by_slot for the
  // chapter's slot (the beat's timer_seconds, the opening beat's scenario-level timer_seconds, else timers.call_beat).
  for (const s of scenarios) for (const e of bossCallBeatIssues(s, c.slot, balance)) errors.push(e);
  if (c.arc_beat && byId.get(c.arc_beat)?.role !== 'arc') errors.push(`arc_beat "${c.arc_beat}" must be a scenario with role: arc`);
  // CR-43(f): arc slot N plays in the Nth chapter played; the slot-N beat is the arc beat of the chapter with map slot N.
  const beat = c.arc_beat ? byId.get(c.arc_beat) : undefined;
  if (beat?.role === 'arc' && beat.arc_slot !== undefined && beat.arc_slot !== c.slot) errors.push(`arc_beat "${beat.id}" has arc_slot ${beat.arc_slot}; the engine plays slot N in the Nth chapter played and finds it in the chapter with slot N, so it must be ${c.slot} (CR-43(f))`);
  if (beat?.finale !== undefined) errors.push(`arc_beat "${beat.id}" is a finale scenario (finale: ${beat.finale}), not a slot beat`);
  for (const s of scenarios) if (s.finale !== undefined && !finaleIds.includes(s.id)) errors.push(`scenario "${s.id}" has finale: ${s.finale} but the chapter's arc_finale does not name it (CR-43)`);
  if (finale) {
    for (const key of ['close', 'recovery_offer', 'teo'] as const) {
      const f = byId.get(finale[key]);
      if (!f) errors.push(`arc_finale.${key}: "${finale[key]}" is not a scenario in content/scenarios/${c.city}/`);
      else if (f.role !== 'arc' || f.finale !== key) errors.push(`arc_finale.${key}: "${f.id}" must be role: arc with finale: ${key} (CR-43)`);
    }
    const close = byId.get(finale.close);
    if (close && !Object.values(close.outcomes).some((o) => o.reveal)) errors.push(`arc_finale.close: "${close.id}" opens the reveal card: an outcome needs reveal: true (GDD §30.6)`);
    const teo = byId.get(finale.teo);
    if (teo && !Object.values(teo.outcomes).some((o) => o.reveal)) errors.push(`arc_finale.teo: "${teo.id}" plays the reveal inside it: an outcome needs reveal: true (GDD §30.6)`);
    const offer = byId.get(finale.recovery_offer);
    if (offer && !offer.is_fraud) errors.push(`arc_finale.recovery_offer: "${offer.id}" is the recovery-agency test: is_fraud: true (GDD §30.6)`);
    const arcName = [...reg.cast.values()].find((m) => m.arc_character)?.name.split(/\s+/u)[0];
    if (arcName && finale.reveal_names[0] !== arcName) errors.push(`arc_finale.reveal_names: the first name is the arc character's ("${arcName}"), the picture the player knows (CR-43(b))`);
    finale.damage_control.forEach((x, i) => {
      if (!reg.recoverySteps.has(x.step)) errors.push(`arc_finale.damage_control.${i}: step "${x.step}" is not in content/recovery_steps.yaml`);
      if (x.feedback && x.category !== 'harmful') errors.push(`arc_finale.damage_control.${i}: feedback is for harmful steps`);
    });
  }
  for (const s of scenarios) if (s.role === 'boss' && s.id !== c.boss) errors.push(`scenario "${s.id}" is a boss but the chapter's boss is "${c.boss ?? '(none)'}"`);

  // The ask (ruling QA L1): from slot 1 on, every scored beat whose message asks for a code or an
  // approval quotes that sentence in message.ask (its request checkable). Home (slot 0) is exempt.
  if (c.slot >= 1) {
    for (const s of scenarios) {
      if (!SCORED_ROLES.includes(s.role)) continue;
      for (const b of beatsOf(s)) {
        if (b.interrupt || !b.scored) continue;
        if (!['sms', 'messenger', 'email', 'social', 'call'].includes(b.device)) continue;
        if ((b.message.request === 'share_code' || b.message.request === 'approve') && !b.message.ask) {
          errors.push(`scenario "${s.id}" ${b.where}: request ${b.message.request} needs message.ask (the sentence that asks for the code or approval)`);
        }
      }
    }
  }

  // CR-17(a) (Amsterdam, reused by Paris): from slot 2 on, every scored beat whose message asks to pay,
  // enter details or reply quotes that sentence in message.ask, genuine or fraud alike, so "always tag
  // the request" cannot tell twins apart. Banking beats are exempt: their payee is the checkable.
  if (c.slot >= 2) {
    for (const s of scenarios) {
      if (!SCORED_ROLES.includes(s.role)) continue;
      for (const b of beatsOf(s)) {
        if (b.interrupt || !b.scored || b.device === 'banking') continue;
        if (CR17_ASK_REQUESTS.includes(b.message.request) && !b.message.ask) {
          errors.push(`scenario "${s.id}" ${b.where}: request ${b.message.request} needs message.ask from slot 2 on (CR-17: the sentence that asks, genuine or fraud)`);
        }
      }
    }
  }

  // CR-30 (Madrid, Warsaw): from slot 4 on, every scored scheduled beat on a message device quotes what it asks
  // (or, on request: none, what it tells the reader to do) in message.ask, whatever the request, genuine or
  // fraud alike, so the request checkable exists on every one of them. Not banking, interrupts, follow-up beats
  // reached by next_beat, or `scored: false` boss beats. Requests that cannot carry an ask (scan_qr, install:
  // not in ASK_REQUESTS) are exempt: a chat QR code (CR-39(b)) or an install request on a call quotes its
  // sentence as a claim instead (GDD §29.4, 9-6, 9-8, Stockholm boss beat 3).
  if (c.slot >= CR30_FROM_SLOT) {
    for (const s of scenarios) {
      if (!SCORED_ROLES.includes(s.role)) continue;
      for (const b of beatsOf(s)) {
        if (b.interrupt || !b.scheduled || !b.scored || !CR30_ASK_DEVICES.includes(b.device)) continue;
        if (!ASK_REQUESTS.includes(b.message.request)) continue;
        if (!b.message.ask) {
          errors.push(`scenario "${s.id}" ${b.where}: request ${b.message.request} needs message.ask from slot ${CR30_FROM_SLOT} on (CR-30: every scored scheduled beat on ${CR30_ASK_DEVICES.join(', ')} quotes its ask)`);
        }
      }
    }
  }

  // CR-37 (Lisbon on): every QR code on a physical surface says how it is attached, genuine and fraud alike,
  // so the `qr.mount` checkable is never itself a hint (parity). Interrupts included.
  if (c.slot >= CR37_FROM_SLOT) {
    for (const s of scenarios) {
      for (const b of beatsOf(s)) {
        if (b.message.qr && QR_MOUNT_DEVICES.includes(b.device) && !b.message.qr.mount) {
          errors.push(`scenario "${s.id}" ${b.where}: a QR code on a ${b.device} beat sets qr.mount (printed | sticker) from slot ${CR37_FROM_SLOT} on (CR-37, parity)`);
        }
      }
    }
  }

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
  // GDD §30.1, §30.5: the finale (arc_finale) reviews every earlier chapter's habit, one callback per habit family,
  // so the per-chapter callback cap does not apply to it when balance.yaml lists it (R23(1), R27, CR-52:
  // `difficulty.callback_cap_exempt`, which the schema restricts to `arc_finale`).
  const capExempt = balance.difficulty.callback_cap_exempt.includes('arc_finale') && !!c.arc_finale;
  if (!capExempt && c.callbacks.length > balance.difficulty.max_callbacks_per_chapter) mixIssues.push(`${c.callbacks.length} callbacks; at most ${balance.difficulty.max_callbacks_per_chapter}`);
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

/** Hosts on the reserved TLDs anywhere in a string, including the host part of e-mail addresses. */
const HOST_RE = /(?<![a-z0-9.-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:example|test|invalid)(?![a-z0-9-])/gi;

function stringsIn(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === 'object') return Object.values(value).flatMap(stringsIn);
  return [];
}

/** Every reserved-TLD host a message shows: page.address, qr.destination, sender addresses, links in body/transcript, ... (lowercased). */
export function messageHosts(m: Message): string[] {
  return [...new Set(stringsIn(m).flatMap((t) => [...t.matchAll(HOST_RE)].map((x) => x[0].toLowerCase())))];
}

/**
 * Every host a scenario message shows must be registered in content/brands.yaml
 * (a brand or sub-brand domain, e-mail domain or lookalike_examples entry), so
 * look-alikes get a brand-resemblance review before they reach players.
 */
export function unregisteredHostIssues(s: Scenario, registered: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const b of beatsOf(s)) {
    for (const host of messageHosts(b.message)) {
      if (!registered.has(host)) out.push(`${b.where}: host "${host}" is not registered in content/brands.yaml (brand domain or lookalike_examples)`);
    }
  }
  return out;
}
