/**
 * Scenario runner: a pure state machine over one scenario (GDD §3, §6, §8).
 *
 *   const s0 = startScenario(scenario, ctx);
 *   const s1 = step(scenario, ctx, s0, { type: 'tick', dt: 0.25 });
 *
 * No DOM, no timers of its own, no I/O. The Preact hook (hooks.ts) feeds it
 * `tick` events from a clock and player events from the devices.
 *
 * Model
 * - The opening message and every boss beat with `arrives_after` open a *beat
 *   group*. Actions with `next_beat` move within the group (link → page). The
 *   group's decisive action (scoring.ts mergeDecision) decides its stars.
 * - Boss beats arrive on the scenario clock whatever the player did (scammer-
 *   driven). One arriving while the player is still on an earlier beat waits as
 *   a notification; when the earlier group resolves, the clock fast-forwards to
 *   the next arrival so nobody waits idle.
 * - Interrupts arrive at `at_seconds`, are unscored, and any of their actions
 *   resolves them (a `next_beat` on an interrupt action is not followed).
 * - The clock and timer freeze while any freeze reason is active (pause menu,
 *   settings, help, debrief, Take a breath, an expanded translation).
 */
import type { Action, ActionClass, ActionKind, Message, Device, Scenario, WhatNow } from '../content/schema.ts';
import type { CheckableBeat } from './inspect.ts';
import { checkablesOf, keyOf } from './inspect.ts';
import { armBeat, firePusher, planPushers, startPushers, stopPushers, type PusherPlan, type PusherState } from './pushers.ts';
import { orderOptions, recoveryOptionsOf, scoreRecovery, type RecoveryOption, type RecoveryResult } from './recovery.ts';
import { classOf, decisionOf, isFall, mergeDecision, truthOf, type Decision, type EngineBalance, type Truth } from './scoring.ts';
import { clampStress, onArrival, pressureStyled, stressState, type StressState } from './stress.ts';
import { chargeTimer, modeFactor, startTimer, tickTimer, timerLength, type TimerKind, type TimerMode, type TimerState } from './timer.ts';

/** How long the non-modal "Take a breath" panel stays open by itself (UI_SPEC §6.4). */
export const BREATH_SECONDS = 5;

export interface RunnerSettings {
  timerMode: TimerMode;
  /** "Pushy follow-ups" setting. */
  pushers: boolean;
}

export interface RunnerContext {
  balance: EngineBalance;
  /** Chapter slot (timer length, check-list presentation). */
  slot: number;
  settings: RunnerSettings;
  /** Stress carried in from the previous scenario (10 at chapter start or on resume). */
  stress: number;
}

/**
 * `call_lines`: a call is ringing or its lines are still being revealed (UI_SPEC §3.4: the beat timer
 * starts only after the last line of the beat is shown).
 */
/** `coach_mark`: a coach mark is open (GDD §8, CR-23: the first payee-name check). */
export type FreezeReason = 'pause_menu' | 'settings' | 'help' | 'debrief' | 'take_a_breath' | 'translation' | 'call_lines' | 'coach_mark';
/**
 * `interrupt`: an `after_beat` interrupt still waits for an answer at the end of the scenario (ruling
 * QA M6): its own "New notification" step before the debrief.
 */
export type Phase = 'playing' | 'what_now' | 'consequence' | 'damage_control' | 'interrupt' | 'done';
/** Built-in "What now?" choices (GDD §6): call_back_known = verify, report = report, done = dismiss. */
export type WhatNowBuiltin = 'call_back_known' | 'report' | 'done';
export const WHAT_NOW_BUILTINS: readonly WhatNowBuiltin[] = ['call_back_known', 'report', 'done'];

/** Built-ins offered on a beat: an authored call_back_known extra replaces the generic call-back. */
export function builtinsFor(wn: WhatNow | undefined): WhatNowBuiltin[] {
  const replaced = wn?.extra.some((x) => x.kind === 'call_back_known') ?? false;
  return WHAT_NOW_BUILTINS.filter((b) => !(replaced && b === 'call_back_known'));
}

export interface GroupState {
  /** The scheduled beat that opened the group ('start' for the opening message). */
  beatId: string;
  /** Beat currently shown. */
  current: string;
  visited: string[];
  scored: boolean;
  decision: Decision | undefined;
  engagedOnFraud: boolean;
  kinds: ActionKind[];
  /** Actions in order with the beat they were taken on (for the "Already clicked?" situation). */
  steps: { beatId: string; kind: ActionKind }[];
  timerExpired: boolean;
  /** Outcome waiting for the "What now?" step after hanging up a call. */
  pendingOutcome: string | undefined;
  /** Note from a "What now?" extra the player just tried (it returns to the step). */
  whatNowNote: string | undefined;
  /** First engage action (authored or What-now extra) in the group: the "You chose" line on an engage cap. */
  firstEngage: { id: string; label: string } | undefined;
  outcome: string | undefined;
  resolved: boolean;
  /** Pause used before the decisive action under pressure (LO-04). */
  pausedUnderPressure: boolean;
  /** Keys checked before the decisive action (LO-01). */
  checkedBefore: string[];
  /**
   * CR-18: the banking beat opened by `start_transfer` in this group. While it is on screen in a boss,
   * the next scheduled beat is held (CR-18(e)): it arrives only after the banking card closes.
   */
  transferBeat?: string | undefined;
}

export interface InterruptState {
  id: string;
  /** Scenario-clock arrival; Infinity for `after_beat` interrupts (they arrive on events). */
  at: number;
  /** Arrives when this beat's call or message ends (ruling QA M6). */
  afterBeat?: string | undefined;
  /** The beat ended without "What now?": arrives at the next beat, or before the debrief. */
  due?: boolean | undefined;
  arrived: boolean;
  actionId: string | undefined;
  outcome: string | undefined;
  /** Index of the beat group that was live when the player answered (its consequence step shows the outcome). */
  group?: number | undefined;
}

export type RunnerLogEntry =
  | { type: 'beat_arrived'; beatId: string; at: number }
  | { type: 'pusher'; index: number; text: string; at: number }
  | { type: 'interrupt'; id: string; at: number }
  | { type: 'timer'; what: 'half' | 'ten_left' | 'escalated' | 'expired'; at: number }
  | { type: 'stress'; state: StressState; at: number };

export interface RunnerState {
  scenarioId: string;
  truth: Truth;
  /** Chapter slot the scenario is played in (tutorial grace in scoring). */
  slot: number;
  phase: Phase;
  /** Scenario clock (seconds); stops while frozen and outside play. */
  clock: number;
  /** Wall time since start (seconds); always advances (pause cooldown). */
  real: number;
  freezes: FreezeReason[];
  stress: number;
  timer: TimerState | null;
  /** Scheduled beats: the opening (at 0) and boss beats by arrives_after. */
  schedule: { beatId: string; at: number }[];
  arrived: string[];
  groups: GroupState[];
  pushers: PusherState;
  interrupts: InterruptState[];
  checks: string[];
  tags: string[];
  pause: { open: boolean; closesAt: number; cooldownUntil: number; uses: number };
  /** Pressure styling appeared in this scenario (layer-2 callouts, GDD §8). */
  styledShown: boolean;
  recovery: { options: RecoveryOption[]; result: RecoveryResult | null } | null;
  /** The consequence step after the end-of-scenario interrupt step (its outcome only). */
  tail?: boolean | undefined;
  log: RunnerLogEntry[];
}

export type RunnerEvent =
  | { type: 'tick'; dt: number }
  | { type: 'act'; actionId: string }
  /** A built-in choice, or the id of a `what_now.extra` action. */
  | { type: 'what_now'; choice: string }
  | { type: 'check'; beatId: string; target: string }
  | { type: 'tag'; beatId: string; target: string; on: boolean }
  | { type: 'pause' }
  | { type: 'pause_end' }
  | { type: 'freeze'; reason: FreezeReason; on: boolean }
  | { type: 'interrupt_act'; interruptId: string; actionId: string }
  | { type: 'continue' }
  | { type: 'recovery'; picks: string[] };

// ---------------------------------------------------------------------------
// Beat lookup

export interface BeatLike extends CheckableBeat {
  actions: Action[];
  banner?: { device: Device; message: Message } | undefined;
  what_now?: WhatNow | undefined;
}

export function beatById(s: Scenario, id: string): BeatLike | undefined {
  if (id === 'start') {
    return { id: 'start', device: s.device, message: s.message, inspectables: s.inspectables, actions: s.actions, banner: s.banner, what_now: s.what_now };
  }
  return s.beats.find((b) => b.id === id) ?? s.interrupts.find((i) => i.id === id);
}

/**
 * A setup step: `proceed` that only moves on (next_beat, no outcome) from a beat whose message asks
 * nothing (`request: none`), e.g. 0-3's "check your inbox" page → the reset email. Never decisive.
 */
export function isSetupStep(beat: Pick<BeatLike, 'message'>, action: Pick<Action, 'next_beat' | 'outcome'>, cls: ActionClass, truth: Truth): boolean {
  // On fraud a proceed is always decisive (a fall), even from a beat that asks nothing (sceptic T-2.8);
  // the validator makes authors use open_link (engage) there instead.
  if (truth === 'fraud') return false;
  return cls === 'proceed' && action.next_beat !== undefined && action.outcome === undefined && beat.message.request === 'none';
}

function storyBeat(s: Scenario, id: string): BeatLike | undefined {
  return id === 'start' ? beatById(s, 'start') : s.beats.find((b) => b.id === id);
}

/** Scheduled beats: the opening, then (bosses) every beat with arrives_after, cumulative from the previous one. */
export function scheduleOf(s: Scenario): { beatId: string; at: number }[] {
  const out = [{ beatId: 'start', at: 0 }];
  if (s.role !== 'boss') return out;
  let at = 0;
  for (const b of s.beats) {
    if (b.arrives_after === undefined) continue;
    at += b.arrives_after;
    out.push({ beatId: b.id, at });
  }
  return out;
}

/** Each follow-up placed on its scheduled beat (pushers.ts). */
export function pusherPlanOf(s: Scenario): PusherPlan[] {
  return planPushers(s.pressure.pusher?.messages ?? [], scheduleOf(s));
}

// ---------------------------------------------------------------------------
// Start

function timerKindFor(s: Scenario, device: Device, scheduled: boolean): TimerKind {
  if (device === 'call') return 'call_beat';
  if (s.role === 'boss' && scheduled) return 'boss_beat';
  return 'slot';
}

function newTimer(s: Scenario, ctx: RunnerContext, device: Device, scheduled: boolean, seconds?: number): TimerState | null {
  if (!s.pressure.timer) return null;
  if (seconds !== undefined) {
    // Authored boss-beat length (producer ruling, T-2.1), scaled by the mode like every other timer.
    const f = modeFactor(ctx.balance, ctx.settings.timerMode);
    return f === null ? null : startTimer(seconds * f);
  }
  const len = timerLength(ctx.balance, ctx.slot, timerKindFor(s, device, scheduled), ctx.settings.timerMode);
  return len === null ? null : startTimer(len);
}

function newGroup(s: Scenario, beatId: string): GroupState {
  const b = s.beats.find((x) => x.id === beatId);
  return {
    beatId,
    current: beatId,
    visited: [beatId],
    scored: beatId === 'start' ? true : (b?.scored ?? true),
    decision: undefined,
    engagedOnFraud: false,
    kinds: [],
    steps: [],
    timerExpired: false,
    pendingOutcome: undefined,
    whatNowNote: undefined,
    firstEngage: undefined,
    outcome: undefined,
    resolved: false,
    pausedUnderPressure: false,
    checkedBefore: [],
    transferBeat: undefined,
  };
}

export function startScenario(s: Scenario, ctx: RunnerContext): RunnerState {
  const stress = onArrival(ctx.balance, ctx.stress, s.pressure.levers.length);
  const state: RunnerState = {
    scenarioId: s.id,
    truth: truthOf(s),
    slot: ctx.slot,
    phase: 'playing',
    clock: 0,
    real: 0,
    freezes: [],
    stress,
    timer: newTimer(s, ctx, s.device, true),
    schedule: scheduleOf(s),
    arrived: ['start'],
    groups: [newGroup(s, 'start')],
    pushers: startPushers(ctx.balance, pusherPlanOf(s), ctx.settings.pushers, stressState(ctx.balance, stress)),
    interrupts: s.interrupts.map((i) => ({ id: i.id, at: i.at_seconds ?? Infinity, afterBeat: i.after_beat, arrived: false, actionId: undefined, outcome: undefined })),
    checks: [],
    tags: [],
    pause: { open: false, closesAt: 0, cooldownUntil: 0, uses: 0 },
    styledShown: false,
    recovery: null,
    log: [],
  };
  return noteStyling(s, ctx, state);
}

// ---------------------------------------------------------------------------
// Helpers

export function activeGroup(st: RunnerState): GroupState | undefined {
  return st.groups[st.groups.length - 1];
}

function withGroup(st: RunnerState, g: GroupState): RunnerState {
  return { ...st, groups: [...st.groups.slice(0, -1), g] };
}

function setStress(ctx: RunnerContext, st: RunnerState, v: number): RunnerState {
  const stress = clampStress(ctx.balance, v);
  const before = stressState(ctx.balance, st.stress);
  const after = stressState(ctx.balance, stress);
  const log: RunnerLogEntry[] = before === after ? st.log : [...st.log, { type: 'stress', state: after, at: st.clock }];
  return { ...st, stress, log };
}

/** Is a timer or pusher currently putting on pressure? */
function underPressure(s: Scenario, ctx: RunnerContext, st: RunnerState): boolean {
  const timerActive = st.timer !== null && st.timer.expiries < 2;
  const g = activeGroup(st);
  const plan = st.pushers.fired.length > 0 && g ? pusherPlanOf(s) : [];
  const pusherActive = st.pushers.nextDue !== null || st.pushers.fired.some((f) => ownsPusher(g, plan[f.index]?.beat));
  return timerActive || pusherActive || stressState(ctx.balance, st.stress) !== 'calm';
}

function noteStyling(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerState {
  if (st.styledShown || st.phase !== 'playing') return st;
  const g = activeGroup(st);
  const beat = g && !g.resolved ? storyBeat(s, g.current) : undefined;
  const state = stressState(ctx.balance, st.stress);
  const shown = !!beat && beat.actions.some((a) => pressureStyled(state, a.pressure_target));
  return shown ? { ...st, styledShown: true } : st;
}

function frozen(st: RunnerState): boolean {
  return st.freezes.length > 0;
}

/** A follow-up belongs to the live group: its scheduled beat, or (CR-21) a beat-bound follow-up of a beat it visited. */
function ownsPusher(g: GroupState | undefined, beat: string | undefined): boolean {
  return !!g && beat !== undefined && (beat === g.beatId || g.visited.includes(beat));
}

/**
 * CR-18(e): in a boss, the banking card opened by start_transfer is on screen. The next scheduled beat
 * is held (it neither arrives nor waits as a notification) until the card closes.
 */
export function holdingForTransfer(st: Pick<RunnerState, 'groups'>): boolean {
  const g = st.groups[st.groups.length - 1];
  return !!g && !g.resolved && g.transferBeat !== undefined && g.current === g.transferBeat;
}

// ---------------------------------------------------------------------------
// Resolution

function resolveGroup(s: Scenario, ctx: RunnerContext, st: RunnerState, g: GroupState): RunnerState {
  const done: GroupState = { ...g, resolved: true, pendingOutcome: undefined };
  // The beat is over: its follow-ups stop (QA M2); its after_beat interrupts become due (ruling QA M6).
  let next = withGroup({ ...st, timer: null, pushers: stopPushers(st.pushers), interrupts: markDue(st.interrupts, done.visited) }, done);
  const fell = !done.timerExpired && done.decision !== undefined && isFall(done.decision.cls, st.truth);
  if (fell) next = setStress(ctx, next, next.stress + ctx.balance.stress.on_fall);

  // The consequence step (GDD §3 step 4, UI_SPEC §7) follows every resolved beat that has a narrative
  // or an expired timer, also the last one, before damage control or the debrief (layer-1 ruling
  // 2026-11-19: the narrative is not part of debrief layer 1).
  const moreScheduled = next.schedule.length > next.groups.length;
  const narrative = done.outcome ? s.outcomes[done.outcome]?.narrative : undefined;
  const asides = interruptNarratives(s, next, next.groups.length - 1);
  if (moreScheduled || narrative || done.timerExpired || asides.length > 0) return { ...next, phase: 'consequence' };
  return enterDamageControlOrDone(s, ctx, next);
}

function markDue(list: readonly InterruptState[], beats: readonly string[]): InterruptState[] {
  return list.map((i) => (i.afterBeat !== undefined && !i.arrived && beats.includes(i.afterBeat) ? { ...i, due: true } : i));
}

function arriveInterrupt(ctx: RunnerContext, st: RunnerState, id: string): RunnerState {
  const next = setStress(ctx, st, st.stress + ctx.balance.stress.on_interrupt);
  return {
    ...next,
    interrupts: next.interrupts.map((x) => (x.id === id ? { ...x, arrived: true, due: false } : x)),
    log: [...next.log, { type: 'interrupt', id, at: next.clock }],
  };
}

/** Due after_beat interrupts arrive now. */
function arriveDue(ctx: RunnerContext, st: RunnerState): RunnerState {
  return st.interrupts.filter((i) => i.due && !i.arrived).reduce((acc, i) => arriveInterrupt(ctx, acc, i.id), st);
}

/** The scenario is over: an after_beat interrupt still unanswered gets its own step first (ruling QA M6). */
function finish(ctx: RunnerContext, st: RunnerState): RunnerState {
  const next = arriveDue(ctx, st);
  const waiting = next.interrupts.some((i) => i.afterBeat !== undefined && i.arrived && i.actionId === undefined);
  return { ...next, phase: waiting ? 'interrupt' : 'done' };
}

function enterDamageControlOrDone(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerState {
  if (s.role === 'arc') return finish(ctx, st);
  // Boss: damage control once at the end, with the steps of every beat that fell, merged in beat order
  // and de-duplicated (QA L2). Others: the outcome reached.
  const truth = st.truth;
  const sources =
    s.role === 'boss'
      ? st.groups.filter((g) => g.decision && !g.timerExpired && isFall(g.decision.cls, truth) && g.outcome)
      : st.groups.slice(-1);
  const options = mergeRecoveryOptions(sources.map((g) => recoveryOptionsOf(g.outcome ? s.outcomes[g.outcome] : undefined)));
  if (options.length === 0) return finish(ctx, st);
  return { ...st, phase: 'damage_control', recovery: { options: orderOptions(options, s.id), result: null } };
}

/**
 * Boss "already checked" (ruling QA fun note a): this beat lists covering beats (`covered_by`) and the
 * player's decisive action on one of them was verify (not overridden by a comply follow-up).
 */
export function isCovered(s: Scenario, groups: readonly GroupState[], g: GroupState): boolean {
  if (s.role !== 'boss') return false;
  const covers = s.beats.find((x) => x.id === g.beatId)?.covered_by;
  if (!covers) return false;
  return groups.some((h) => h !== g && covers.includes(h.beatId) && h.resolved && h.decision?.cls === 'verify');
}

/** A report or dismiss on a covered beat scores as verify; a fall stays a fall, a timer stays a timer. */
export function coveredDecision(s: Scenario, groups: readonly GroupState[], g: GroupState): { decision: GroupState['decision']; covered: boolean } {
  const d = g.decision;
  if (!d || g.timerExpired || (d.cls !== 'report' && d.cls !== 'dismiss') || !isCovered(s, groups, g)) return { decision: d, covered: false };
  return { decision: { ...d, cls: 'verify' }, covered: true };
}

/** Merge damage-control steps: first appearance wins (order and category), no step twice. */
export function mergeRecoveryOptions(lists: readonly (readonly RecoveryOption[])[]): RecoveryOption[] {
  const out: RecoveryOption[] = [];
  for (const list of lists) for (const o of list) if (!out.some((x) => x.step === o.step)) out.push(o);
  return out;
}

/** Outcome narratives of interrupts the player answered while group `group` was live, in answer order. */
export function interruptNarratives(s: Scenario, st: Pick<RunnerState, 'interrupts'>, group: number): string[] {
  return st.interrupts.flatMap((i) => {
    if (i.group !== group || !i.outcome) return [];
    const n = s.outcomes[i.outcome]?.narrative;
    return n ? [n] : [];
  });
}

function finishWithOutcome(s: Scenario, ctx: RunnerContext, st: RunnerState, g: GroupState, outcome: string): RunnerState {
  return resolveGroup(s, ctx, st, { ...g, outcome });
}

function moveToBeat(s: Scenario, ctx: RunnerContext, st: RunnerState, g: GroupState, beatId: string, via?: ActionKind): RunnerState {
  const beat = s.beats.find((b) => b.id === beatId);
  if (!beat) return st;
  const firstVisit = !g.visited.includes(beatId);
  const g2: GroupState = { ...g, current: beatId, visited: firstVisit ? [...g.visited, beatId] : g.visited };
  const prev = storyBeat(s, g.current);
  // A call beat runs on its own call length; other follow-ups keep the running timer.
  const verified = g.decision?.cls === 'verify';
  let timer = !verified && beat.device === 'call' && prev?.device !== 'call' ? newTimer(s, ctx, 'call', false) : st.timer;
  // CR-18(e): in a boss, the beat timer carries over to the banking card, with a floor of the boss-beat
  // length (40 s, scaled by the timer mode), so the card always gets time to read the name check.
  if (via === 'start_transfer' && s.role === 'boss' && timer && timer.expiries < 2) timer = transferFloor(ctx, timer);
  let next: RunnerState = { ...st, timer };
  // CR-21: follow-ups bound to this beat are timed from now; they never fire if the beat is not reached.
  if (firstVisit && pusherPlanOf(s).some((p) => p.beat === beatId) && !st.schedule.some((x) => x.beatId === beatId)) {
    next = { ...next, pushers: armBeat(ctx.balance, pusherPlanOf(s), next.pushers, beatId, next.clock, stressState(ctx.balance, next.stress)) };
  }
  return noteStyling(s, ctx, withGroup(next, g2));
}

/** CR-18(e): remaining time on the banking card is at least timers.boss_beat × mode. */
export function transferFloor(ctx: RunnerContext, t: TimerState): TimerState {
  const f = modeFactor(ctx.balance, ctx.settings.timerMode);
  if (f === null) return t;
  const floor = ctx.balance.timers.boss_beat * f;
  if (t.remaining >= floor) return t;
  return { ...t, remaining: floor, length: Math.max(t.length, floor) };
}

// ---------------------------------------------------------------------------
// Time

function applyTimerEvents(s: Scenario, ctx: RunnerContext, st: RunnerState, events: readonly string[]): RunnerState {
  let next = st;
  for (const e of events) {
    if (e === 'half' || e === 'ten_left') next = { ...next, log: [...next.log, { type: 'timer', what: e, at: next.clock }] };
    if (e === 'escalated') {
      next = { ...next, log: [...next.log, { type: 'timer', what: 'escalated', at: next.clock }] };
      next = setStress(ctx, next, next.stress + ctx.balance.stress.on_timer_expiry);
      // The pusher escalates: the next authored follow-up arrives now.
      if (next.pushers.nextDue !== null) next = firePusherNow(s, ctx, next);
    }
    if (e === 'expired') {
      next = { ...next, log: [...next.log, { type: 'timer', what: 'expired', at: next.clock }] };
      next = setStress(ctx, next, next.stress + ctx.balance.stress.on_timer_expiry);
      const g = activeGroup(next);
      if (g && !g.resolved) next = resolveGroup(s, ctx, next, { ...g, timerExpired: true });
    }
  }
  return next;
}

function firePusherNow(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerState {
  const messages = s.pressure.pusher?.messages ?? [];
  const index = st.pushers.cursor;
  const msg = messages[index];
  if (!msg || st.pushers.nextDue === null) return st;
  let next = setStress(ctx, st, st.stress + ctx.balance.stress.on_pusher_message);
  next = {
    ...next,
    pushers: firePusher(ctx.balance, pusherPlanOf(s), st.pushers, st.clock, stressState(ctx.balance, next.stress)),
    log: [...next.log, { type: 'pusher', index, text: msg.text, at: st.clock }],
  };
  return noteStyling(s, ctx, next);
}

/** Next clock-driven event time after `now` (pusher, interrupt, scheduled beat), or Infinity. */
function nextEventAt(st: RunnerState): number {
  let t = Infinity;
  if (st.pushers.nextDue !== null) t = Math.min(t, st.pushers.nextDue);
  for (const i of st.interrupts) if (!i.arrived) t = Math.min(t, i.at);
  // A held boss beat (CR-18(e)) is not a clock event while the banking card is open.
  if (!holdingForTransfer(st)) for (const b of st.schedule) if (!st.arrived.includes(b.beatId)) t = Math.min(t, b.at);
  return t;
}

function fireDue(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerState {
  let next = st;
  if (next.pushers.nextDue !== null && next.pushers.nextDue <= next.clock) next = firePusherNow(s, ctx, next);
  for (const i of next.interrupts) {
    if (!i.arrived && i.at <= next.clock) {
      next = setStress(ctx, next, next.stress + ctx.balance.stress.on_interrupt);
      next = {
        ...next,
        interrupts: next.interrupts.map((x) => (x.id === i.id ? { ...x, arrived: true } : x)),
        log: [...next.log, { type: 'interrupt', id: i.id, at: next.clock }],
      };
    }
  }
  for (const b of next.schedule) {
    if (holdingForTransfer(next)) break;
    if (!next.arrived.includes(b.beatId) && b.at <= next.clock) {
      next = { ...next, arrived: [...next.arrived, b.beatId], log: [...next.log, { type: 'beat_arrived', beatId: b.beatId, at: next.clock }] };
    }
  }
  return next;
}

/** Advance the scenario clock by dt in event order (no freeze check). */
function advanceClock(s: Scenario, ctx: RunnerContext, st: RunnerState, dt: number): RunnerState {
  let next = st;
  const end = st.clock + dt;
  for (let guard = 0; guard < 1000; guard++) {
    if (next.phase === 'done' || next.phase === 'damage_control') return next;
    const timerAt = next.timer && next.phase === 'playing' && next.timer.expiries < 2 ? next.clock + next.timer.remaining : Infinity;
    const at = Math.min(nextEventAt(next), timerAt, end);
    const step = Math.max(0, at - next.clock);
    if (next.timer && next.phase === 'playing') {
      const r = tickTimer(ctx.balance, next.timer, step, ctx.settings.timerMode);
      next = { ...next, clock: at, timer: r.timer };
      next = applyTimerEvents(s, ctx, next, r.events);
    } else {
      next = { ...next, clock: at };
    }
    next = fireDue(s, ctx, next);
    if (at >= end && nextEventAt(next) > end) return next;
  }
  return next;
}

// ---------------------------------------------------------------------------
// Pause

function doPause(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerState {
  // Pause only while a message is live (QA E6).
  if (st.real < st.pause.cooldownUntil || (st.phase !== 'playing' && st.phase !== 'what_now')) return st;
  const g = activeGroup(st);
  const lo04 = !!g && !g.resolved && g.decision === undefined && underPressure(s, ctx, st);
  let next = setStress(ctx, st, st.stress - ctx.balance.pause.reduces_stress_by);
  const cost = ctx.settings.timerMode === 'off' ? 0 : ctx.balance.pause.timer_cost_seconds;
  next = {
    ...next,
    timer: next.timer ? chargeTimer(next.timer, cost) : null,
    freezes: next.freezes.includes('take_a_breath') ? next.freezes : [...next.freezes, 'take_a_breath'],
    pause: { open: true, closesAt: st.real + BREATH_SECONDS, cooldownUntil: st.real + ctx.balance.pause.cooldown_seconds, uses: st.pause.uses + 1 },
  };
  if (g && lo04) next = withGroup(next, { ...g, pausedUnderPressure: true });
  return next;
}

function endPause(st: RunnerState): RunnerState {
  if (!st.pause.open) return st;
  return { ...st, freezes: st.freezes.filter((f) => f !== 'take_a_breath'), pause: { ...st.pause, open: false } };
}

// ---------------------------------------------------------------------------
// Visible beats (for Check)

export function visibleBeatIds(st: RunnerState): string[] {
  return [...st.groups.flatMap((g) => g.visited), ...st.interrupts.filter((i) => i.arrived).map((i) => i.id)];
}

/**
 * Beats the player may Check or tag right now: the active, unresolved group's beats and
 * arrived interrupts not yet answered. A resolved beat is closed: its tags are final.
 */
export function checkableBeatIds(st: RunnerState): string[] {
  const g = activeGroup(st);
  const group = g && !g.resolved ? g.visited : [];
  return [...group, ...st.interrupts.filter((i) => i.arrived && i.actionId === undefined).map((i) => i.id)];
}

// ---------------------------------------------------------------------------
// The reducer

export function step(s: Scenario, ctx: RunnerContext, st: RunnerState, ev: RunnerEvent): RunnerState {
  switch (ev.type) {
    case 'tick': {
      if (!(ev.dt > 0)) return st;
      let next: RunnerState = { ...st, real: st.real + ev.dt };
      if (next.pause.open && next.real >= next.pause.closesAt) next = endPause(next);
      if (frozen(next) || (next.phase !== 'playing' && next.phase !== 'what_now')) return next;
      return advanceClock(s, ctx, next, ev.dt);
    }

    case 'act': {
      if (st.phase !== 'playing') return st;
      const g = activeGroup(st);
      if (!g || g.resolved) return st;
      const beat = storyBeat(s, g.current);
      const action = beat?.actions.find((a) => a.id === ev.actionId);
      if (!beat || !action) return st;
      let next = st;
      let g2: GroupState = { ...g, kinds: [...g.kinds, action.kind], steps: [...g.steps, { beatId: beat.id, kind: action.kind }] };
      const cls = classOf(ctx.balance, action.kind);
      if (cls === 'meta') {
        next = doPause(s, ctx, next);
        g2 = { ...g2, pausedUnderPressure: activeGroup(next)?.pausedUnderPressure ?? g2.pausedUnderPressure };
      } else if (action.kind === 'hang_up' && (beat.device === 'call' || beat.what_now) && action.outcome !== undefined) {
        // GDD §6: hanging up is not terminal; "What now?" with the dialler open.
        // The call is over: its follow-ups stop with it (QA M2); its after_beat interrupts arrive now (ruling QA M6).
        let ended: RunnerState = { ...withGroup(next, { ...g2, pendingOutcome: action.outcome }), phase: 'what_now', timer: null, pushers: stopPushers(next.pushers) };
        for (const i of ended.interrupts) if (i.afterBeat !== undefined && !i.arrived && g2.visited.includes(i.afterBeat)) ended = arriveInterrupt(ctx, ended, i.id);
        return ended;
      } else if (isSetupStep(beat, action, cls, st.truth)) {
        // GDD §6 / §16 ruling 2: proceeding from a setup beat (an opener that asks nothing) is not the
        // decisive action. Recording it would let a timer expiry on the next beat score as that proceed
        // (QA T-2.8 M1), and would end LO-01/LO-04 credit (checks and pauses "before deciding") early.
      } else {
        if (cls === 'engage' && !g2.firstEngage) g2 = { ...g2, firstEngage: { id: action.id, label: action.label } };
        g2 = {
          ...g2,
          decision: mergeDecision(g.decision, decisionOf(ctx.balance, action), st.truth, ctx.balance.points.engage_on_fraud.terminal),
          engagedOnFraud: g.engagedOnFraud || (cls === 'engage' && st.truth === 'fraud'),
        };
      }
      // Verify shows the truth: the deadline pressure is over for this group (sceptic T-2.1 #2).
      if (g2.decision?.cls === 'verify') next = { ...next, timer: null };
      // CR-18: start_transfer (class step) never decides; it opens the banking beat, whose action decides.
      if (action.kind === 'start_transfer' && action.next_beat !== undefined) g2 = { ...g2, transferBeat: action.next_beat };
      if (action.next_beat !== undefined) return moveToBeat(s, ctx, next, g2, action.next_beat, action.kind);
      if (action.outcome !== undefined) return finishWithOutcome(s, ctx, next, g2, action.outcome);
      return withGroup(next, g2);
    }

    case 'what_now': {
      if (st.phase !== 'what_now') return st;
      const g = activeGroup(st);
      if (!g || g.pendingOutcome === undefined) return st;
      const wn = storyBeat(s, g.current)?.what_now;
      const extra = wn?.extra.find((x) => x.id === ev.choice);
      if (extra && extra.outcome !== undefined) {
        // A verify extra ("Ask Adaeze through the staff directory") ends the step as verify with its own outcome.
        const decision = mergeDecision(g.decision, { cls: classOf(ctx.balance, extra.kind), kind: extra.kind, actionId: extra.id, via: 'what_now' }, st.truth, ctx.balance.points.engage_on_fraud.terminal);
        return finishWithOutcome(s, ctx, { ...st, phase: 'playing' }, { ...g, kinds: [...g.kinds, extra.kind], decision, whatNowNote: undefined }, extra.outcome);
      }
      if (extra) {
        // An extra (e.g. "Call back this number") returns to "What now?" with its note; engage on fraud caps at ★★.
        const cls = classOf(ctx.balance, extra.kind);
        const g2: GroupState = {
          ...g,
          kinds: [...g.kinds, extra.kind],
          whatNowNote: extra.note ?? undefined,
          firstEngage: g.firstEngage ?? (cls === 'engage' ? { id: extra.id, label: extra.label } : undefined),
          engagedOnFraud: g.engagedOnFraud || (cls === 'engage' && st.truth === 'fraud'),
          decision: mergeDecision(g.decision, { cls, kind: extra.kind, actionId: extra.id, via: 'what_now' }, st.truth, ctx.balance.points.engage_on_fraud.terminal),
        };
        return withGroup(st, g2);
      }
      if (!builtinsFor(wn).includes(ev.choice as WhatNowBuiltin)) return st;
      const choice = ev.choice as WhatNowBuiltin;
      const cls = choice === 'call_back_known' ? 'verify' : choice === 'report' ? 'report' : 'dismiss';
      const kind = choice === 'call_back_known' ? 'call_back_known' : choice === 'report' ? 'report' : 'done';
      const decision = mergeDecision(g.decision, { cls, kind, actionId: choice, via: 'what_now' }, st.truth, false);
      const outcome = wn?.outcomes?.[choice] ?? g.pendingOutcome;
      return finishWithOutcome(s, ctx, { ...st, phase: 'playing' }, { ...g, kinds: kind === 'done' ? g.kinds : [...g.kinds, kind], decision, whatNowNote: undefined }, outcome);
    }

    case 'check': {
      // After hanging up the call is gone: nothing left on screen to check (QA, T-2.1 carry-over).
      if (st.phase !== 'playing') return st;
      if (!checkableBeatIds(st).includes(ev.beatId)) return st;
      const beat = beatById(s, ev.beatId);
      if (!beat || !checkablesOf(beat).some((c) => c.target === ev.target)) return st;
      const key = keyOf(ev.beatId, ev.target);
      if (st.checks.includes(key)) return st;
      let next: RunnerState = { ...st, checks: [...st.checks, key] };
      if (next.timer && next.phase === 'playing') next = { ...next, timer: chargeTimer(next.timer, ctx.balance.timers.inspect_cost_seconds) };
      const g = activeGroup(next);
      if (g && !g.resolved && g.decision === undefined && g.visited.includes(ev.beatId)) next = withGroup(next, { ...g, checkedBefore: [...g.checkedBefore, key] });
      return next;
    }

    case 'tag': {
      if (st.phase !== 'playing') return st;
      if (!checkableBeatIds(st).includes(ev.beatId)) return st;
      const key = keyOf(ev.beatId, ev.target);
      if (!st.checks.includes(key)) return st; // you can't tag what you haven't looked at
      const has = st.tags.includes(key);
      if (ev.on === has) return st;
      return { ...st, tags: ev.on ? [...st.tags, key] : st.tags.filter((k) => k !== key) };
    }

    case 'pause':
      return doPause(s, ctx, st);

    case 'pause_end':
      return endPause(st);

    case 'freeze': {
      const has = st.freezes.includes(ev.reason);
      if (ev.on === has) return st;
      return { ...st, freezes: ev.on ? [...st.freezes, ev.reason] : st.freezes.filter((f) => f !== ev.reason) };
    }

    case 'interrupt_act': {
      if (st.phase === 'done' || st.phase === 'damage_control') return st;
      const i = st.interrupts.find((x) => x.id === ev.interruptId);
      const def = s.interrupts.find((x) => x.id === ev.interruptId);
      const action = def?.actions.find((a) => a.id === ev.actionId);
      if (!i || !i.arrived || i.actionId !== undefined || !action) return st;
      // In the end-of-scenario step the answer belongs after the last beat (a virtual group index).
      const ending = st.phase === 'interrupt';
      const group = ending ? st.groups.length : st.groups.length - 1;
      const next: RunnerState = { ...st, interrupts: st.interrupts.map((x) => (x.id === i.id ? { ...x, actionId: action.id, outcome: action.outcome, group } : x)) };
      if (!ending || next.interrupts.some((x) => x.arrived && x.actionId === undefined)) return next;
      return interruptNarratives(s, next, group).length > 0 ? { ...next, phase: 'consequence', tail: true } : { ...next, phase: 'done' };
    }

    case 'continue': {
      if (st.phase !== 'consequence') return st;
      const nextBeat = st.schedule[st.groups.length];
      if (st.tail) return { ...st, phase: 'done', tail: false };
      if (!nextBeat) return enterDamageControlOrDone(s, ctx, st);
      let next: RunnerState = { ...st, phase: 'playing' };
      if (next.clock < nextBeat.at) next = advanceClock(s, ctx, next, nextBeat.at - next.clock);
      if (next.phase !== 'playing') return next;
      if (!next.arrived.includes(nextBeat.beatId)) next = { ...next, arrived: [...next.arrived, nextBeat.beatId] };
      const beat = s.beats.find((b) => b.id === nextBeat.beatId);
      next = { ...next, groups: [...next.groups, newGroup(s, nextBeat.beatId)], timer: beat ? newTimer(s, ctx, beat.device, true, beat.timer_seconds) : null };
      // This beat's follow-ups are timed from now, when it is on screen (QA M2).
      next = { ...next, pushers: armBeat(ctx.balance, pusherPlanOf(s), next.pushers, nextBeat.beatId, next.clock, stressState(ctx.balance, next.stress)) };
      next = arriveDue(ctx, next);
      return noteStyling(s, ctx, next);
    }

    case 'recovery': {
      if (st.phase !== 'damage_control' || !st.recovery) return st;
      return finish(ctx, { ...st, recovery: { ...st.recovery, result: scoreRecovery(ctx.balance, st.recovery.options, ev.picks) } });
    }
  }
}

// ---------------------------------------------------------------------------
// View for device components

export interface ActionView {
  id: string;
  label: string;
  kind: ActionKind;
  /** Bright "pressure" style: Tense or higher and the action the message is pushing. */
  styled: boolean;
}

export interface BeatView {
  id: string;
  device: Device;
  message: Message;
  actions: ActionView[];
  /** Notification shown inside the beat (code SMS, approval prompt). No actions, never reportable. */
  banner: { device: Device; message: Message } | null;
}

export interface WhatNowView {
  /** Built-ins first (label from i18n, or `call_back_label`), then authored extras. Order never changes. */
  choices: { id: string; builtin: WhatNowBuiltin | null; label: string | null }[];
  /** Note after trying an extra ("You can't tell whose line that number really is."). */
  note: string | null;
}

export interface CheckableView {
  key: string;
  beatId: string;
  device: Device;
  target: string;
  shown: string | undefined;
  /** Authored reveal; undefined → show the neutral filler. Only present once checked. */
  reveal: string | undefined;
  checked: boolean;
  tagged: boolean;
}

export interface PusherMessageView {
  /** Index in the authored list (stable key). */
  index: number;
  text: string;
  at: number;
  /** The scheduled beat it belongs to, and that beat's channel and sender (QA M2). */
  beatId: string;
  device: Device;
  sender: string;
  lang?: string | undefined;
  translation?: string | undefined;
}

export interface RunnerView {
  phase: Phase;
  /** The beat on screen (null between boss beats and after the end). */
  beat: BeatView | null;
  /** Earlier beats of the current group (thread history), oldest first. */
  thread: { id: string; device: Device; message: Message }[];
  checkables: CheckableView[];
  checkedCount: number;
  /** Arrived boss beats still waiting behind the current one. */
  waitingBeats: string[];
  /** Arrived interrupts not yet answered. */
  interrupts: { id: string; device: Device; message: Message; actions: ActionView[] }[];
  /**
   * Follow-ups of the beat group on screen, fired so far, each with its own beat's channel and sender;
   * `lang`/`translation` for in-world foreign text (CR-14). Earlier beats' follow-ups are not shown.
   */
  pusherMessages: PusherMessageView[];
  /** `coachMark`: frozen because a coach mark is open (HUD: "Paused while the tip is open", CR-23). */
  timer: { remaining: number; length: number; expiries: number; frozen: boolean; coachMark: boolean } | null;
  stress: { value: number; state: StressState };
  pause: { open: boolean; available: boolean; cooldownLeft: number };
  whatNow: WhatNowView | null;
  /** Narrative of the last resolved beat (boss consequence step, damage control intro). */
  consequence: string | null;
  /** The last beat ended by timer expiry with no outcome (QA E1). */
  consequenceTimerExpired: boolean;
  /**
   * Which caption that expiry gets: `fake` on fraud ("The deadline was fake. Nothing happened."),
   * `fake_fell` on fraud after an earlier fall in the scenario ("The deadline was fake."; QA m1),
   * `genuine` on a genuine scenario ("Time's up in the game, not in real life. The message's own deadline:
   * {pressure.honest_deadline}…", ruling QA L4).
   * null when the timer did not end the beat.
   */
  consequenceDeadline: DeadlineLine;
  /** Outcomes of interrupts answered during the beat that just ended (QA M3), shown with the caption. */
  consequenceAsides: string[];
  /** The beat that just ended was "already checked" (boss covered_by, ruling QA fun note a). */
  consequenceCovered: boolean;
  recovery: { options: RecoveryOption[]; pick: number } | null;
}

/** The timer-expiry line (consequence caption and layer 2 "What happened", UI_SPEC §7). */
export type DeadlineLine = 'fake' | 'fake_fell' | 'genuine' | null;

export function deadlineLine(isFraud: boolean, fell: boolean): Exclude<DeadlineLine, null> {
  return !isFraud ? 'genuine' : fell ? 'fake_fell' : 'fake';
}

function groupFell(g: GroupState, truth: Truth): boolean {
  return !!g.decision && !g.timerExpired && isFall(g.decision.cls, truth);
}

function actionViews(actions: readonly Action[], state: StressState): ActionView[] {
  return actions.map((a) => ({ id: a.id, label: a.label, kind: a.kind, styled: pressureStyled(state, a.pressure_target) }));
}

export function viewOf(s: Scenario, ctx: RunnerContext, st: RunnerState): RunnerView {
  const state = stressState(ctx.balance, st.stress);
  const g = activeGroup(st);
  const live = !!g && !g.resolved && (st.phase === 'playing' || st.phase === 'what_now');
  const cur = live && g ? storyBeat(s, g.current) : undefined;
  const beat: BeatView | null = cur
    ? {
        id: cur.id,
        device: cur.device,
        message: cur.message,
        actions: st.phase === 'what_now' ? [] : actionViews(cur.actions, state),
        banner: cur.banner ? { device: cur.banner.device, message: cur.banner.message } : null,
      }
    : null;
  const checkables: CheckableView[] = cur && st.phase === 'playing'
    ? checkablesOf(cur).map((c) => {
        const checked = st.checks.includes(c.key);
        return { ...c, reveal: checked ? c.reveal : undefined, checked, tagged: st.tags.includes(c.key) };
      })
    : [];
  const thread =
    live && g
      ? g.visited
          .filter((id) => id !== g.current)
          .flatMap((id) => {
            const b = storyBeat(s, id);
            return b ? [{ id: b.id, device: b.device, message: b.message }] : [];
          })
      : [];
  const last = st.groups.filter((x) => x.resolved).at(-1);
  const messages = s.pressure.pusher?.messages ?? [];
  const plan = st.pushers.fired.length > 0 ? pusherPlanOf(s) : [];
  return {
    phase: st.phase,
    beat,
    thread,
    checkables,
    // "k checked" counts the beat on screen only (QA E3).
    checkedCount: checkables.filter((c) => c.checked).length,
    // CR-18(e): nothing waits on top of the banking card; an already-arrived beat shows again once it closes.
    waitingBeats: holdingForTransfer(st) ? [] : st.arrived.filter((id) => !st.groups.some((x) => x.beatId === id)),
    // Hidden while a consequence or damage control is on screen (QA E10).
    interrupts: st.interrupts
      .filter((i) => i.arrived && i.actionId === undefined && (st.phase === 'playing' || st.phase === 'what_now' || st.phase === 'interrupt'))
      .flatMap((i) => {
        const def = s.interrupts.find((x) => x.id === i.id);
        return def ? [{ id: def.id, device: def.device, message: def.message, actions: actionViews(def.actions, state) }] : [];
      }),
    pusherMessages: live && g
      ? st.pushers.fired.flatMap((f) => {
          const m = messages[f.index];
          const owner = plan[f.index]?.beat;
          const bound = ownsPusher(g, owner) && owner !== undefined ? storyBeat(s, owner) : undefined;
          // A follow-up bound to a banking beat or a page (CR-21) still comes from the person who sent the
          // message: channel and sender of the group's scheduled beat (sceptic T-3.3).
          const ob = bound && (bound.device === 'banking' || !bound.message.sender) ? storyBeat(s, g.beatId) : bound;
          return m && ob ? [{ index: f.index, text: m.text, at: f.at, lang: m.lang, translation: m.translation, beatId: ob.id, device: ob.device, sender: ob.message.sender?.display ?? '' }] : [];
        })
      : [],
    timer: st.timer && live ? { remaining: st.timer.remaining, length: st.timer.length, expiries: st.timer.expiries, frozen: frozen(st), coachMark: st.freezes.includes('coach_mark') } : null,
    stress: { value: st.stress, state },
    pause: {
      open: st.pause.open,
      available: st.real >= st.pause.cooldownUntil && (st.phase === 'playing' || st.phase === 'what_now'),
      cooldownLeft: Math.max(0, st.pause.cooldownUntil - st.real),
    },
    whatNow:
      st.phase === 'what_now' && g
        ? {
            choices: [
              // Authored extras first (they are the beat's own verify routes), then the built-ins.
              ...(cur?.what_now?.extra ?? []).map((x) => ({ id: x.id, builtin: null, label: x.label })),
              ...builtinsFor(cur?.what_now).map((b) => ({ id: b, builtin: b, label: b === 'call_back_known' ? (cur?.what_now?.call_back_label ?? null) : null })),
            ],
            note: g.whatNowNote ?? null,
          }
        : null,
    consequence: !st.tail && last?.outcome ? (s.outcomes[last.outcome]?.narrative ?? null) : null,
    consequenceTimerExpired: !st.tail && !!last && last.timerExpired && !last.outcome,
    consequenceDeadline: !st.tail && !!last && last.timerExpired && !last.outcome ? deadlineLine(s.is_fraud, st.groups.some((x) => groupFell(x, st.truth))) : null,
    consequenceCovered: st.phase === 'consequence' && !st.tail && !!last && coveredDecision(s, st.groups, last).covered,
    consequenceAsides: st.phase !== 'consequence' ? [] : st.tail ? interruptNarratives(s, st, st.groups.length) : last ? interruptNarratives(s, st, st.groups.indexOf(last)) : [],
    recovery: st.phase === 'damage_control' && st.recovery ? { options: st.recovery.options, pick: ctx.balance.recovery.pick } : null,
  };
}
