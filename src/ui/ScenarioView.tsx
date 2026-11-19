/**
 * One scenario on screen: HUD, the device stage, notifications and interrupts, and the action tray
 * ("Your options"), driven by the engine's useScenarioRunner view (docs/ENGINE.md).
 *
 * Accessibility (UI_SPEC §10): skip link "Skip to your options"; focus moves to the device heading on
 * arrival and on every new beat, to "What now?" after hanging up, to the consequence caption and to
 * damage control; never on interrupts, tags, translation or Take a breath. The engine's state.log
 * feeds the polite announcer (timer thresholds, stress changes, new messages), coalesced there.
 */
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Scenario } from '../content/schema.ts';
import { castMember } from '../content/cast.ts';
import { recoveryStepFeedback, recoveryStepLabel } from '../content/recoverySteps.ts';
import { useScenarioRunner } from '../engine/hooks.ts';
import type { RecoveryOption } from '../engine/recovery.ts';
import type { ScenarioResult } from '../engine/result.ts';
import type { Settings } from '../engine/save.ts';
import type { TimerMode } from '../engine/timer.ts';
import { beatById, type CheckableView, type RunnerContext, type RunnerLogEntry, type RunnerState, type RunnerView } from '../engine/runner.ts';
import { t } from '../i18n/index.ts';
import { AnnounceContext } from './Announcer.tsx';
import { CheckCard, CheckContext, DetailsList, type CheckApi } from './check/Check.tsx';
import { actionsInDevice, bankOf, channelKind, DeviceView, deviceHeading, nameCheckResultId, nameCheckText, spokenText, visibleLines } from './devices/Device.tsx';
import { Translate } from './devices/parts.tsx';
import type { CallStage } from './devices/types.ts';
import { BreathPanel, formatTime, Hud } from './Hud.tsx';
import { Icon } from './Icon.tsx';
import { deadlineText, WHAT_NOW_KEYS } from './labels.ts';
import { RichText } from './RichText.tsx';
import { SettingsPanel } from './Settings.tsx';
import { RevealCard } from './ArcFinale.tsx';
import { COACH_FAIRMEASURE, FairmeasurePanel, RegisterResult, regulatorName } from './Fairmeasure.tsx';
import { registerAvailable, registerEntries } from '../content/brands.ts';
import { linePace, readingHoldSeconds, unrevealedTargets } from './text.ts';
import styles from './ScenarioView.module.css';

export interface ScenarioViewProps {
  scenario: Scenario;
  ctx: RunnerContext;
  onDone: (state: RunnerState, result: ScenarioResult) => void;
  progress?: { index: number; total: number } | null;
  callLines?: 'auto' | 'step';
  onCallLines?: (v: 'auto' | 'step') => void;
  alwaysTranslate?: boolean;
  onQuit?: () => void;
  /** In-game Settings (QA M7): the saved settings and where changes go. */
  settings?: Settings;
  defaultTimer?: TimerMode;
  onSettings?: (next: Settings) => void;
  /** Coach marks already shown in this game (save.coachMarks), and where a newly shown one is recorded. */
  coachMarks?: readonly string[];
  onCoachMarkSeen?: (id: string) => void;
  /** CR-43(b): the finale's three profile names, for an outcome that opens the reveal card. */
  revealNames?: readonly string[] | undefined;
}

function useDesk(): boolean {
  const q = '(min-width: 1024px)';
  const get = () => typeof matchMedia !== 'function' || matchMedia(q).matches;
  const [desk, setDesk] = useState(get);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const m = matchMedia(q);
    const on = () => setDesk(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return desk;
}

/** Reading pace for call lines (UI_SPEC §3.4); lives in text.ts so the announcer queue can use it too. */
export { linePace };

/**
 * What a log entry says in the polite live region (UI_SPEC §10.5). `onCallBeat`: the banking beat under the
 * CR-31 on-call bar, if any; the caller's follow-ups bound to it are call transcript lines (category 1,
 * "Caller: …", at once, each in its own slot so never folded into "N new messages"; QA-2, WCAG 4.1.3).
 */
export function logAnnouncement(
  s: Scenario,
  e: RunnerLogEntry,
  onCallBeat: string | null = null,
): { category: 1 | 3 | 4 | 5; text: string; key?: string; foreign?: { text: string; lang: string } } | null {
  switch (e.type) {
    case 'beat_arrived':
      return e.beatId === 'start' ? null : { category: 5, text: t('announce_new_message') };
    case 'pusher': {
      // CR-27 (WCAG 3.1.2): a follow-up in another language is spoken with its own lang.
      const lang = s.pressure.pusher?.messages[e.index]?.lang;
      if (onCallBeat !== null && s.pressure.pusher?.messages[e.index]?.beat === onCallBeat) {
        const line = spokenText(e.text);
        return { category: 1, key: `call-line-${e.index}`, text: t('announce_caller_line', { text: line }), ...(lang && lang !== 'en' ? { foreign: { text: line, lang } } : {}) };
      }
      return { category: 5, text: t('announce_pusher', { text: e.text }), ...(lang && lang !== 'en' ? { foreign: { text: e.text, lang } } : {}) };
    }
    case 'interrupt': {
      // Its own slot: never coalesced into "2 new messages" or replaced by a pusher (QA M3).
      const def = s.interrupts.find((i) => i.id === e.id);
      const from = def?.message.sender?.display;
      return { category: 5, key: 'interrupt', text: def && from ? t('announce_interrupt_from', { kind: channelKind(def.device), from }) : t('announce_interrupt') };
    }
    case 'timer':
      return { category: 3, text: t(e.what === 'half' ? 'announce_timer_half' : e.what === 'ten_left' ? 'announce_timer_ten' : e.what === 'escalated' ? 'announce_timer_escalated' : 'announce_timer_expired') };
    case 'stress':
      return { category: 4, text: t(e.state === 'calm' ? 'stress_calm' : e.state === 'tense' ? 'stress_tense' : 'stress_overwhelmed') };
  }
}

export function DamageControl({ view, onDone }: { view: NonNullable<RunnerView['recovery']>; onDone: (picks: string[]) => void }) {
  const [picks, setPicks] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const feedbackHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    if (submitted) feedbackHeading.current?.focus();
  }, [submitted]);
  const toggle = (step: string) => setPicks((p) => (p.includes(step) ? p.filter((x) => x !== step) : p.length < view.pick ? [...p, step] : p));
  const move = (i: number, by: -1 | 1) =>
    setPicks((p) => {
      const j = i + by;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j] as string, next[i] as string];
      return next;
    });
  const byStep = new Map<string, RecoveryOption>(view.options.map((o) => [o.step, o]));
  // CR-32: damage control for a cast member (a drill): the prompt names them, and this scenario's own
  // harmful-step feedback is theirs to say ("Mateus: Another code? …"). Generic feedback stays unattributed.
  // The first name, as a friend says it ("Mateus", not "Mateus Ferreira").
  const voiceName = view.forCast ? (castMember(view.forCast)?.name.split(/\s+/u)[0] ?? null) : null;
  // CR-41: someone off-cast ("Noor's friend") is named in the prompt; the feedback stays in the cast member's voice.
  const forName = view.forLabel ?? voiceName;
  if (submitted) {
    return (
      <section class={styles.panel} aria-labelledby="damage-feedback-heading">
        <h3 id="damage-feedback-heading" ref={feedbackHeading} tabIndex={-1}>
          {t('damage_feedback_title')}
        </h3>
        <ol class={styles.feedback}>
          {picks.map((step) => {
            const harmful = byStep.get(step)?.category === 'harmful';
            return (
              <li key={step}>
                <span class={styles.feedbackHead}>
                  <Icon name={harmful ? 'info' : 'seal'} />
                  <span>
                    <strong>{harmful ? t('damage_doesnt_help') : t('damage_helps')}</strong> {recoveryStepLabel(step)}
                  </span>
                </span>
                {harmful && voiceName && byStep.get(step)?.feedback ? (
                  <p data-voice="">
                    <strong>{t('damage_voice', { name: voiceName })}</strong> {byStep.get(step)?.feedback}
                  </p>
                ) : harmful && (byStep.get(step)?.feedback ?? recoveryStepFeedback(step)) ? (
                  <p>{byStep.get(step)?.feedback ?? recoveryStepFeedback(step)}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
        <button type="button" class={styles.primary} onClick={() => onDone(picks)}>
          {t('app_continue')}
        </button>
      </section>
    );
  }
  return (
    <section class={styles.panel} aria-labelledby="damage-heading">
      <h3 id="damage-heading" ref={heading} tabIndex={-1}>
        {t('damage_title')}
      </h3>
      <p>{t('damage_sub')}</p>
      <p data-damage-prompt="">{forName ? t('damage_prompt_for', { name: forName }) : t('damage_prompt')}</p>
      <ul class={styles.actions}>
        {view.options.map((o) => {
          const i = picks.indexOf(o.step);
          return (
            <li key={o.step}>
              <button type="button" class={styles.option} aria-pressed={i >= 0} data-step={o.step} onClick={() => toggle(o.step)}>
                {i >= 0 ? <span class={styles.order}>{t(i === 0 ? 'damage_first' : i === 1 ? 'damage_second' : 'damage_third')}</span> : null}
                <span>{recoveryStepLabel(o.step)}</span>
              </button>
              {i >= 0 && picks.length > 1 ? (
                <span class={styles.moves}>
                  <button type="button" class={styles.small} aria-disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('damage_move_up_named', { step: recoveryStepLabel(o.step) })}>
                    {t('damage_move_up')}
                  </button>
                  <button type="button" class={styles.small} aria-disabled={i === picks.length - 1} onClick={() => move(i, 1)} aria-label={t('damage_move_down_named', { step: recoveryStepLabel(o.step) })}>
                    {t('damage_move_down')}
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p role="status">{t('damage_counter', { chosen: picks.length, total: view.pick })}</p>
      <button type="button" class={styles.primary} aria-disabled={picks.length < view.pick} onClick={() => picks.length >= view.pick && setSubmitted(true)}>
        {t('damage_done')}
      </button>
    </section>
  );
}

/** One scenario from arrival to the end of damage control. Give it a `key` to restart. */
export function ScenarioView({ scenario, ctx, onDone, progress = null, callLines = 'auto', onCallLines, alwaysTranslate = false, onQuit, settings, defaultTimer = 'standard', onSettings, coachMarks = [], onCoachMarkSeen, revealNames }: ScenarioViewProps) {
  const runner = useScenarioRunner(scenario, ctx);
  const { view, state } = runner;
  const announce = useContext(AnnounceContext);
  const desk = useDesk();
  const deviceHeadingRef = useRef<HTMLHeadingElement>(null);
  const whatNowRef = useRef<HTMLHeadingElement>(null);
  const consequenceRef = useRef<HTMLHeadingElement>(null);
  const optionsRef = useRef<HTMLElement>(null);
  const [checkMode, setCheckMode] = useState(false);
  const [openTarget, setOpenTarget] = useState<string | null>(null);
  const returnEl = useRef<HTMLElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [chip, setChip] = useState<string | null>(null);
  const beat = view.beat;
  // Translations freeze the timer while any of them is open (UI_SPEC §4.8).
  const openTranslations = useRef(0);
  const onTranslation = (open: boolean) => {
    openTranslations.current = Math.max(0, openTranslations.current + (open ? 1 : -1));
    runner.freeze('translation', openTranslations.current > 0);
    if (open) announce.polite(2, t('translation_shown'));
  };

  // ---- coach marks (CR-23): the timer is frozen while one is open. A mark is recorded as seen for the game
  // on "Got it", or when its second showing closes, whatever closes it [P] (review T-S3 item 15). The first
  // showing leaves an `<id>_once` marker in the save; a mark closed by an action or a Check use is hidden for
  // that beat only and comes back on the next payee check (engine review follow-up a).
  const [coachSeen, setCoachSeen] = useState<readonly string[]>(coachMarks);
  const coachSeenRef = useRef<readonly string[]>(coachMarks);
  /** `<id>@<beat id>`: marks closed without "Got it", hidden on that beat only. */
  const [coachHidden, setCoachHidden] = useState<readonly string[]>([]);
  /** The coach mark on screen, if any: any action or Check use closes it and lifts the freeze (sceptic T-3.3). */
  const coachOpen = useRef<string | null>(null);
  /** The mark on screen is on its second (or later) showing: closing it records it as seen. */
  const coachRepeat = useRef<string | null>(null);
  const onCoachMark = useCallback(
    (id: string, open: boolean, gotIt = false) => {
      runner.freeze('coach_mark', open);
      coachOpen.current = open ? id : coachOpen.current === id ? null : coachOpen.current;
      const record = (key: string) => {
        if (coachSeenRef.current.includes(key)) return;
        coachSeenRef.current = [...coachSeenRef.current, key];
        setCoachSeen(coachSeenRef.current);
        onCoachMarkSeen?.(key);
      };
      if (open) {
        if (coachSeenRef.current.includes(`${id}_once`)) coachRepeat.current = id;
        else record(`${id}_once`);
        return;
      }
      if (gotIt || coachRepeat.current === id) {
        coachRepeat.current = null;
        record(id);
      }
    },
    [runner.freeze, onCoachMarkSeen],
  );

  const closeCoach = () => {
    const id = coachOpen.current;
    if (!id) return;
    if (beat) setCoachHidden((x) => [...x, `${id}@${beat.id}`]);
    onCoachMark(id, false);
  };
  /** What the device treats as already shown: seen for the game, plus marks closed on this beat. */
  const deviceCoachMarks = beat ? [...coachSeen, ...coachHidden.filter((k) => k.endsWith(`@${beat.id}`)).map((k) => k.slice(0, k.lastIndexOf('@')))] : coachSeen;
  const doAct = (id: string) => {
    closeCoach();
    runner.act(id);
  };
  // CR-23: is the payee-check result on screen (not "Checking…"), per beat.
  const [nameCheckReady, setNameCheckReady] = useState<Record<string, boolean>>({});
  const onNameCheck = useCallback((beatId: string, ready: boolean) => setNameCheckReady((x) => (x[beatId] === ready ? x : { ...x, [beatId]: ready })), []);

  // ---- result
  const reported = useRef(false);
  useEffect(() => {
    if (runner.result && !reported.current) {
      reported.current = true;
      announce.flush();
      announce.assertive(t('announce_scenario_ended'));
      onDone(runner.state, runner.result);
    }
  }, [runner.result, runner.state, onDone, announce]);
  // The last beat is over (its consequence, damage control or the closing interrupt step): nothing of
  // the scenario's timer, stress or message news is announced any more (QA m5).
  const ended = view.phase === 'damage_control' || view.phase === 'interrupt' || view.phase === 'done' || (view.phase === 'consequence' && state.schedule.length <= state.groups.length);
  const endedRef = useRef(false);
  useEffect(() => {
    if (ended && !endedRef.current) {
      endedRef.current = true;
      announce.flush();
    }
  }, [ended, announce]);

  // ---- announcer: state.log → polite queue (UI_SPEC §10.5). Stale items from the last screen go (QA B6).
  useEffect(() => {
    announce.reset();
    return () => announce.reset();
  }, [announce]);
  const logSeen = useRef(0);
  useEffect(() => {
    const fresh = state.log.slice(logSeen.current);
    logSeen.current = state.log.length;
    for (const e of fresh) {
      const a = logAnnouncement(scenario, e, view.onCall ? (view.beat?.id ?? null) : null);
      // Once the scenario has ended, timer/stress/message news is stale (QA B6, m5); a closing interrupt still needs its answer.
      if (a && (!endedRef.current || a.key === 'interrupt')) announce.polite(a.category, a.text, a.category === 5 && !a.key ? (n) => t('announce_new_messages', { count: n }) : undefined, a.key, a.foreign);
      if (e.type === 'timer' && e.what === 'escalated') setChip(t('timer_escalated_chip', { seconds: ctx.balance.timers.escalation_extra_seconds }));
    }
    // view.onCall is read with the log it belongs to (same render); it is not a trigger of its own.
  }, [state.log, announce, ctx.balance.timers.escalation_extra_seconds, scenario]);
  useEffect(() => {
    if (!chip) return undefined;
    const id = setTimeout(() => setChip(null), 1500);
    return () => clearTimeout(id);
  }, [chip]);
  useEffect(() => {
    if (view.pause.open) announce.polite(2, t('pause_panel'));
  }, [view.pause.open, announce]);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  // ---- call stage (UI_SPEC §3.4): ringing → answered → lines at reading pace; timer frozen until the last line.
  const isCall = beat?.device === 'call';
  const [callState, setCallState] = useState<CallStage | null>(null);
  const call: CallStage | null =
    isCall && beat
      ? { ...(callState && callState.beatId === beat.id ? callState : { beatId: beat.id, answered: false, shown: 0, ended: false, step: callLines === 'step' }), ended: view.phase === 'what_now' }
      : null;
  const lines = beat ? visibleLines(beat.message) : [];
  const revealing = !!call && !call.ended && (!call.answered || call.shown < lines.length);
  useEffect(() => {
    runner.freeze('call_lines', revealing);
  }, [revealing]);
  useEffect(() => {
    if (!call || !call.answered || call.ended || call.step || call.shown >= lines.length || view.pause.open) return undefined;
    const id = setTimeout(() => setCallState({ ...call, shown: call.shown + 1 }), linePace(lines[call.shown - 1]?.line.text ?? '') * 1000);
    return () => clearTimeout(id);
    // Only stage changes restart the line timer; engine ticks must not (QA B1).
  }, [call?.beatId, call?.shown, call?.answered, call?.ended, call?.step, view.pause.open, lines.length]);
  const answer = () => beat && setCallState({ beatId: beat.id, answered: true, shown: 1, ended: false, step: callLines === 'step' });
  const hangUpAction = beat?.actions.find((a) => a.kind === 'hang_up');
  const ringing = !!call && !call.answered && !call.ended;

  // ---- focus (UI_SPEC §10.3)
  const focusKey = `${view.phase}:${beat?.id ?? ''}`;
  const interruptHeading = (id: string) => document.getElementById(`interrupt-${id}-h`);
  // CR-27: the scenario's `setup` lead-in sits above its first beat; on arrival focus starts there, so the
  // lead-in is read before the device heading (reading order = visual order).
  const setupRef = useRef<HTMLParagraphElement>(null);
  const showSetup = !!scenario.setup && beat?.id === 'start';
  // CR-27 round 2 (psych M3): the lead-in is read on arrival, so it freezes the timer (and the clock) for its
  // reading time, max(1.5 s, 0.3 s × words), in every timer mode; the same hold as an auto-opened translation.
  const setupHeld = useRef<string | null>(null);
  useEffect(() => {
    if (!showSetup || view.phase !== 'playing' || !scenario.setup || setupHeld.current === scenario.id) return undefined;
    setupHeld.current = scenario.id;
    runner.freeze('setup', true);
    const id = setTimeout(() => runner.freeze('setup', false), readingHoldSeconds(scenario.setup) * 1000);
    return () => {
      clearTimeout(id);
      runner.freeze('setup', false);
    };
  }, [scenario.id, showSetup, view.phase === 'playing']);
  useEffect(() => {
    if (view.phase === 'playing' && showSetup && setupRef.current) setupRef.current.focus();
    else if (view.phase === 'playing') deviceHeadingRef.current?.focus();
    else if (view.phase === 'what_now') whatNowRef.current?.focus();
    else if (view.phase === 'consequence') consequenceRef.current?.focus();
    // The closing "New notification" step (ruling QA M6): its message is the only thing on screen.
    else if (view.phase === 'interrupt' && view.interrupts[0]) interruptHeading(view.interrupts[0].id)?.focus();
    // damage_control focuses its own heading.
  }, [focusKey]);
  // QA M4: answering an interrupt removes its buttons; focus goes back to the message the player is
  // dealing with (device heading, or "What now?") instead of falling to <body>. Layout effect: same commit.
  const answered = useRef(false);
  useLayoutEffect(() => {
    if (!answered.current) return;
    answered.current = false;
    const nextInterrupt = view.interrupts[0];
    if (view.phase === 'interrupt' && nextInterrupt) interruptHeading(nextInterrupt.id)?.focus();
    else if (view.phase === 'playing') deviceHeadingRef.current?.focus();
    else if (view.phase === 'what_now') whatNowRef.current?.focus();
  }, [view.interrupts.length, view.phase]);
  const answerInterrupt = (id: string, actionId: string) => {
    answered.current = true;
    runner.answerInterrupt(id, actionId);
  };
  // "View" on the interrupt banner (UI_SPEC §2.3): the player asks for it, so focus may move there.
  const viewInterrupt = (id: string) => {
    const h = interruptHeading(id);
    if (typeof h?.scrollIntoView === 'function') h.scrollIntoView({ block: 'start', behavior: 'auto' });
    h?.focus();
  };

  // ---- Settings (QA M7): a modal dialog; the timer is frozen while it is open (UI_SPEC §6.1).
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsReturn = useRef<HTMLElement | null>(null);
  const openSettings = () => {
    settingsReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    runner.freeze('settings', true);
    setSettingsOpen(true);
  };
  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    runner.freeze('settings', false);
    // Opened from the HUD menu, whose item is hidden once the menu closes: return to the Menu button.
    const el = settingsReturn.current;
    setTimeout(() => {
      const menu = document.querySelector<HTMLElement>('[data-hud="menu"]');
      const usable = !!el && el.isConnected && !el.closest('[hidden], [inert]');
      const target = usable ? el : (menu ?? deviceHeadingRef.current);
      target?.focus();
    }, 0);
  }, [runner.freeze]);

  // ---- CR-38: the Fairmeasure regulator view, a home-screen tool (HUD menu); the timer is frozen while open.
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerReturn = useRef<HTMLElement | null>(null);
  const openRegister = () => {
    registerReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    runner.freeze('register', true);
    setRegisterOpen(true);
  };
  const closeRegister = useCallback(() => {
    setRegisterOpen(false);
    runner.freeze('register', false);
    const el = registerReturn.current;
    setTimeout(() => {
      const menu = document.querySelector<HTMLElement>('[data-hud="menu"]');
      const usable = !!el && el.isConnected && !el.closest('[hidden], [inert]');
      (usable ? el : (menu ?? deviceHeadingRef.current))?.focus();
    }, 0);
  }, [runner.freeze]);
  /** One-time coach mark for the register, wherever it is first used (GDD §28.5). */
  const registerCoach = !coachSeen.includes(COACH_FAIRMEASURE);
  const registerCoachSeen = useCallback(() => {
    if (coachSeenRef.current.includes(COACH_FAIRMEASURE)) return;
    coachSeenRef.current = [...coachSeenRef.current, COACH_FAIRMEASURE];
    setCoachSeen(coachSeenRef.current);
    onCoachMarkSeen?.(COACH_FAIRMEASURE);
  }, [onCoachMarkSeen]);

  // ---- "Jump to your options" (QA M6): a sticky bar at the bottom of the screen on phones while the
  // tray is out of view; it moves focus to the tray. Hidden on the desk (the rail is always in view).
  const [trayInView, setTrayInView] = useState(true);
  // On a payee-check beat the options sit in the device, under the result (Amsterdam QA o): the bar
  // watches the result paragraph there, so it hides once the player's options are in view.
  const inDeviceOptions = !!beat && actionsInDevice(beat.device, beat.message);
  useEffect(() => {
    const el = (inDeviceOptions && beat ? document.getElementById(nameCheckResultId(beat.id)) : null) ?? optionsRef.current;
    if (!el || typeof IntersectionObserver !== 'function') return undefined;
    const io = new IntersectionObserver((entries) => setTrayInView(entries.some((x) => x.isIntersecting)), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [inDeviceOptions, beat?.id, beat ? nameCheckReady[beat.id] : false]);
  // Scroll padding for the sticky HUD and the jump bar (UI_SPEC §1.3), measured: a focused element is
  // never hidden under them (WCAG 2.4.11).
  const hudRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    const el = hudRef.current;
    if (!root) return undefined;
    const apply = () => {
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
      root.style.setProperty('--hud-h-live', `${h}px`);
      // Plus the jump bar under the HUD when it shows (CR-27).
      const jump = parseInt(root.style.getPropertyValue('--jump-h-live'), 10) || 0;
      root.style.scrollPaddingTop = `${h + 8 + jump}px`;
    };
    apply();
    const ro = el && typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null;
    if (el) ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty('--hud-h-live');
      root.style.scrollPaddingTop = '';
    };
  }, [view.phase === 'playing' || view.phase === 'what_now']);
  // CR-27 (Paris QA): the jump bar sat sticky at the bottom of the screen and covered attachments, the
  // Translate toggle (375/320 px) and the bank payee/IBAN (720×450), failing axe target-size. It now
  // sits in the flow at the top of the scenario, under the HUD, and sticks there; its space stays
  // reserved for the rest of the beat once shown (no layout jump when it hides). Scroll padding at the
  // top = HUD + bar, so a focused element is never under either (WCAG 2.4.11).
  const jumpRef = useRef<HTMLButtonElement>(null);
  // Runs in the live phases only (playing, "What now?"), when the bar shows or hides; it follows the bar's
  // size. Cleanup puts the scroll padding back to the HUD's alone (or nothing without a HUD).
  // CR-28 (Paris QA round 3, 720×450): the padding counted the bar only while it was visible, but the bar
  // shows *after* a focus scroll (its IntersectionObserver fires once the tray or result has left the
  // view), so a Shift+Tab target could land at HUD + 8 px and then sit under the bar that appeared. Off
  // the desk the padding now always keeps the bar's room in the live phases: its measured height when it
  // is in the layout (shown or reserved), else the 44 px target it will have.
  const jumpLive = view.phase === 'playing' || view.phase === 'what_now';
  const jumpShown = jumpLive && !desk && !trayInView;
  const jumpRoom = jumpLive && !desk;
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (!root || !jumpLive) return undefined;
    const hudOnly = () => {
      const hud = parseInt(root.style.getPropertyValue('--hud-h-live'), 10);
      return Number.isNaN(hud) ? '' : `${hud + 8}px`;
    };
    const bar = jumpRoom ? jumpRef.current : null;
    const apply = () => {
      const barH = bar ? Math.ceil(bar.getBoundingClientRect().height) : 0;
      const h = jumpRoom ? Math.max(barH, 44) + 8 : 0;
      const hud = parseInt(root.style.getPropertyValue('--hud-h-live'), 10) || 0;
      root.style.setProperty('--jump-h-live', `${h}px`);
      root.style.scrollPaddingTop = hud || h ? `${hud + 8 + h}px` : '';
    };
    apply();
    const ro = bar && typeof ResizeObserver === 'function' ? new ResizeObserver(apply) : null;
    if (bar) ro?.observe(bar);
    return () => {
      ro?.disconnect();
      root.style.removeProperty('--jump-h-live');
      root.style.scrollPaddingTop = hudOnly();
    };
  }, [jumpLive, jumpRoom, jumpShown]);
  /**
   * On a payee-check beat the options sit inside the result card: skip and jump links go to the result
   * paragraph, so reading runs result → footer → tip → options (learning-psychologist T-3.3).
   */
  const focusOptions = (): HTMLElement | null => {
    const id = beat && actionsInDevice(beat.device, beat.message) ? nameCheckResultId(beat.id) : null;
    const target = (id ? document.getElementById(id) : null) ?? optionsRef.current;
    target?.focus();
    return target;
  };
  const jumpToOptions = () => {
    const el = beat && actionsInDevice(beat.device, beat.message) ? document.getElementById(nameCheckResultId(beat.id)) ?? optionsRef.current : optionsRef.current;
    if (typeof el?.scrollIntoView === 'function') el.scrollIntoView({ block: 'start', behavior: 'auto' });
    el?.focus();
  };

  // CR-27: the beat's `context: quoted` checkables (quote block in chat bubbles).
  const quotedTargets = useMemo(() => (beat ? (beatById(scenario, beat.id)?.inspectables ?? []).filter((i) => i.context === 'quoted').map((i) => i.target) : []), [scenario, beat?.id]);

  // ---- Check
  const items = useMemo(() => {
    let list = view.checkables;
    // Elements not on screen yet (a ringing call, unrevealed lines) are not listed (no free preview, QA B3).
    if (call && !call.answered) list = list.filter((c) => c.target === 'caller_id');
    else if (call && beat) {
      // `shown` counts the lines on screen (a recorded message hides "you" lines, CR-20): map it to the transcript.
      const hidden = unrevealedTargets(beat.message, call.ended || call.shown >= lines.length ? Infinity : (lines[call.shown]?.index ?? Infinity));
      list = list.filter((c) => c.beatId !== beat.id || !hidden.has(c.target));
    }
    return list;
  }, [view.checkables, call?.answered, call?.shown, call?.ended, beat]);
  const itemMap = useMemo(() => new Map(items.map((c) => [c.target, c])), [items]);
  const sender = beat?.message.sender;
  const visible = useCallback(
    (c: CheckableView): string => {
      if (c.target === 'sender.detail' || c.target === 'caller_id') return sender?.display ?? c.shown ?? '';
      if (c.target === 'page.info') return t('page_info_visible');
      // CR-27: the name check is checked on its result line, so "You see" is that line.
      if (c.target === 'payee.name_check' && beat) {
        // Until the bank card reports the check done, the Details row says what the card says ("Checking…").
        if (!nameCheckReady[beat.id]) return t('bank_check_checking');
        const bank = bankOf(beat.message);
        return nameCheckText(beat.message, bank?.short_name ?? bank?.name ?? '') ?? c.shown ?? '';
      }
      return c.shown ?? '';
    },
    [sender, beat, nameCheckReady],
  );
  const doCheck = (c: CheckableView) => {
    if (!c.checked && view.timer && ctx.balance.timers.inspect_cost_seconds > 0) setChip(t('timer_cost_chip', { seconds: ctx.balance.timers.inspect_cost_seconds }));
    runner.check(c.beatId, c.target);
  };
  const doTag = (c: CheckableView, on: boolean) => {
    runner.tag(c.beatId, c.target, on);
    announce.polite(2, on ? t('tag_announce_on') : t('tag_announce_off'));
  };
  const closeCard = useCallback(() => {
    setOpenTarget(null);
    const el = returnEl.current;
    if (el) setTimeout(() => el.focus(), 0);
  }, []);
  const api: CheckApi = {
    items: itemMap,
    checkMode,
    visible,
    open: (target, el) => {
      const c = itemMap.get(target);
      if (!c) return;
      returnEl.current = el;
      closeCoach();
      doCheck(c);
      setToast(null); // the touch hint never sits on top of the sheet (QA B10)
      setOpenTarget(target);
    },
    hint: () => setToast(t('check_touch_hint')),
  };
  const openItem = openTarget ? itemMap.get(openTarget) : undefined;
  useEffect(() => {
    if (openTarget && !openItem) setOpenTarget(null);
  }, [openTarget, openItem]);
  const modal = !!openItem && !desk;

  const card = openItem ? <CheckCard item={openItem} visibleText={visible(openItem)} sender={sender} modal={modal} onTag={doTag} onClose={closeCard} /> : null;
  const live = view.phase === 'playing' || view.phase === 'what_now';
  // CR-38 (sceptic B1): the Fairmeasure dialog is modal too: the scenario and the HUD go inert under it.
  const blocked = modal || settingsOpen || registerOpen;
  const showJump = jumpShown;
  // The bar's place is kept for the rest of the beat once it has shown (CR-27).
  const [jumpBeat, setJumpBeat] = useState<string | null>(null);
  useEffect(() => {
    if (showJump && beat && jumpBeat !== beat.id) setJumpBeat(beat.id);
  }, [showJump, beat?.id]);
  const jumpReserved = !desk && live && !!beat && jumpBeat === beat.id;

  return (
    <div class={styles.play}>
      <a
        href="#options"
        class={styles.skip}
        onClick={(e) => {
          e.preventDefault();
          focusOptions();
        }}
      >
        {t('skip_to_options')}
      </a>
      {live ? (
        // The wrapper is what sticks: a sticky <header> inside a block of its own height cannot (QA M5).
        <div class={styles.hudWrap} inert={blocked} ref={hudRef}>
          <Hud
            view={view}
            progress={progress}
            chip={chip}
            timersOff={ctx.settings.timerMode === 'off'}
            onPause={runner.pause}
            menu={{
              checkMode,
              onCheckMode: setCheckMode,
              callLines,
              onCallLines: (v) => onCallLines?.(v),
              onTimeLeft: () => view.timer && announce.polite(2, t('timer_value_low', { time: formatTime(view.timer.remaining) })),
              onQuit: () => onQuit?.(),
              onOpen: (open) => runner.freeze('pause_menu', open),
              onSettings: settings && onSettings ? openSettings : undefined,
              // CR-38 (psych M1): only when the register lists at least one authorised firm.
              onRegister: registerAvailable() ? openRegister : undefined,
              registerName: regulatorName(),
            }}
          />
        </div>
      ) : null}
      <main class={beat ? styles.main : `${styles.main} ${styles.solo}`} inert={blocked}>
        <CheckContext.Provider value={api}>
          {showJump || jumpReserved ? (
            // Hidden (not unmounted) once the options are in view: it keeps its place, and visibility:hidden
            // takes it out of the tab order and the accessibility tree.
            <button type="button" class={showJump ? styles.jump : `${styles.jump} ${styles.jumpIdle}`} onClick={jumpToOptions} data-jump="" ref={jumpRef} aria-hidden={showJump ? undefined : 'true'} tabIndex={showJump ? undefined : -1}>
              {t('jump_to_options')}
            </button>
          ) : null}
          <div class={view.stress.state === 'overwhelmed' ? `${styles.stage} ${styles.vignette}` : styles.stage}>
            {/* Device banner for an interrupt (UI_SPEC §2.3, QA M3): focus never moves by itself; "View" brings it in. */}
            {live
              ? view.interrupts.map((i) => (
                  <div key={i.id} class={styles.interruptBanner} role="group" aria-label={t('banner_title')} data-interrupt-banner={i.id}>
                    <p class={styles.interruptBannerText}>
                      <strong>
                        {channelKind(i.device)}
                        {i.message.sender ? ` · ${i.message.sender.display}` : ''}
                      </strong>
                    </p>
                    <button type="button" class={styles.small} onClick={() => viewInterrupt(i.id)} aria-label={t('interrupt_view_named', { from: i.message.sender?.display ?? channelKind(i.device) })}>
                      {t('interrupt_view')}
                    </button>
                  </div>
                ))
              : null}
            {view.pause.open ? <BreathPanel onBack={runner.endPause} /> : null}
            {showSetup ? (
              <p class={styles.setup} id="scenario-setup" ref={setupRef} tabIndex={-1} data-setup="">
                {scenario.setup}
              </p>
            ) : null}
            {beat ? (
              <DeviceView
                key={beat.id}
                beatId={beat.id}
                device={beat.device}
                message={beat.message}
                banner={beat.banner}
                scenario={scenario}
                thread={view.thread}
                pushers={view.pusherMessages}
                onCall={view.onCall}
                actions={beat.actions}
                canAct={view.phase === 'playing'}
                onAct={doAct}
                onNameCheck={onNameCheck}
                quoted={quotedTargets}
                onTranslation={onTranslation}
                alwaysTranslate={alwaysTranslate}
                coachMarks={deviceCoachMarks}
                onCoachMark={onCoachMark}
                call={call}
                onAnswer={answer}
                onDecline={hangUpAction ? () => runner.act(hangUpAction.id) : null}
                onNextLine={() =>
                  // Functional update: two quick presses before a re-render still reveal two lines.
                  call && setCallState((prev) => {
                    const base = prev && prev.beatId === call.beatId ? prev : call;
                    return { ...base, shown: Math.min(base.shown + 1, lines.length) };
                  })
                }
                heading={deviceHeading(beat.device, beat.message)}
                headingRef={deviceHeadingRef}
              />
            ) : null}
            {view.waitingBeats.length > 0 && live ? (
              <p class={styles.waiting} role="note">
                {t('waiting_beats', { count: view.waitingBeats.length })}
              </p>
            ) : null}
            {toast ? (
              <p class={styles.toast} role="status">
                {toast}
              </p>
            ) : null}
          </div>
          {/* Interrupts: a distinct container; focus never moves to them (UI_SPEC §2.3). */}
          {view.interrupts.length > 0 ? (
            <aside class={styles.interrupts} aria-labelledby="interrupts-h">
              <h2 id="interrupts-h" class={styles.interruptsTitle}>
                {t('interrupt_title')}
              </h2>
              {view.interrupts.map((i) => (
                <div key={i.id} class={styles.interrupt} data-interrupt={i.id}>
                  <h3 class={styles.interruptMeta} id={`interrupt-${i.id}-h`} tabIndex={-1}>
                    {channelKind(i.device)}
                    {i.message.sender ? ` · ${i.message.sender.display}` : ''}
                  </h3>
                  {i.message.body ? (
                    <p class={styles.interruptBody} lang={i.message.lang}>
                      <RichText text={i.message.body} />
                    </p>
                  ) : null}
                  {/* Foreign text gets the same Translate toggle as messages and pushers (QA M1). */}
                  <Translate message={i.message} id={`interrupt-translation-${i.id}`} onFreeze={onTranslation} alwaysOpen={alwaysTranslate} />
                  <ul class={styles.actions}>
                    {i.actions.map((a) => (
                      <li key={a.id}>
                        <button type="button" class={styles.action} data-interrupt-action={a.id} onClick={() => answerInterrupt(i.id, a.id)}>
                          {a.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          ) : null}
          <section id="options" class={styles.tray} aria-labelledby={view.phase === 'consequence' ? 'consequence-h' : 'actions-h'} tabIndex={-1} ref={optionsRef}>
            {/* No empty "Your options" during the consequence step: its own heading labels the panel (QA F4). */}
            {view.phase !== 'consequence' ? (
              <h2 id="actions-h" class={styles.trayTitle}>
                {t('your_options')}
              </h2>
            ) : null}
            {/* Desk: the Check card and the Details list scroll inside the rail; the actions below stay pinned (QA B4). */}
            <div class={styles.trayScroll}>
            {desk && card ? card : null}
            {view.phase === 'playing' && items.length > 0 && !ringing ? (
              <DetailsList
                items={items}
                checkedCount={items.filter((c) => c.checked).length}
                visible={visible}
                sender={sender}
                checkMode={checkMode}
                onCheckMode={setCheckMode}
                onCheck={doCheck}
                onTag={doTag}
              />
            ) : null}
            </div>
            {beat && view.phase === 'playing' ? (
              ringing ? (
                <p class={styles.note}>{t('call_answer_first')}</p>
              ) : actionsInDevice(beat.device, beat.message) ? (
                // CR-23: the payee-check card holds this beat's actions (in action_order); not repeated here.
                // The pointer goes to the result first (not the buttons), and waits until the check is done.
                nameCheckReady[beat.id] ? (
                  <p class={styles.note} data-options-in-device="">
                    {t('bank_options_in_card')}{' '}
                    <button type="button" class={styles.small} onClick={focusOptions}>
                      {t('bank_options_go')}
                    </button>
                  </p>
                ) : null
              ) : (
                <>
                {view.onCall ? (
                  // CR-31 (QA should-fix 4): on the call bar, say that these options are how the call ends.
                  <p class={styles.note} id="oncall-choose" data-oncall-hint="">
                    {t('oncall_choose')}
                  </p>
                ) : null}
                <ul class={styles.actions} aria-labelledby={view.onCall ? 'oncall-choose' : undefined}>
                  {beat.actions.map((a) => (
                    <li key={a.id}>
                      <button type="button" class={a.styled ? `${styles.action} ${styles.pressure}` : styles.action} data-action={a.id} onClick={() => doAct(a.id)}>
                        {a.label}
                      </button>
                    </li>
                  ))}
                </ul>
                </>
              )
            ) : null}
            {view.whatNow ? (
              <div class={styles.panel}>
                <h3 id="what-now-h" ref={whatNowRef} tabIndex={-1}>
                  {t('what_now_title')}
                </h3>
                <p class={styles.note}>{t('what_now_intro')}</p>
                {view.whatNow.note ? (
                  <p class={styles.whatNowNote} role="status">
                    <Icon name="info" />
                    <span>{view.whatNow.note}</span>
                  </p>
                ) : null}
                <ul class={styles.actions}>
                  {view.whatNow.choices.map((c) => (
                    <li key={c.id}>
                      <button type="button" class={styles.action} data-what-now={c.id} onClick={() => runner.whatNow(c.id)}>
                        {c.label ?? (c.builtin ? t(WHAT_NOW_KEYS[c.builtin]) : c.id)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {view.phase === 'consequence' ? (
              <div class={styles.panel}>
                <h3 id="consequence-h" ref={consequenceRef} tabIndex={-1}>
                  {t('consequence_title')}
                </h3>
                <p class={styles.caption}>
                  <Icon name="info" />
                  <span>{view.consequenceDeadline ? deadlineText(view.consequenceDeadline, scenario.pressure.honest_deadline) : <RichText text={view.consequence ?? ''} />}</span>
                </p>
                {/* CR-38: what the register showed when you looked the firm up yourself. */}
                {view.consequenceRegister ? <RegisterResult card={view.consequenceRegister} coach={registerCoach} onCoachSeen={registerCoachSeen} /> : null}
                {/* CR-43(b): the photo check or report in the finale shows the same picture under three names. */}
                {view.consequenceReveal && revealNames ? <RevealCard names={revealNames} headingLevel={4} /> : null}
                {/* Boss "already checked" (ruling QA fun note a), after the beat's narrative. */}
                {view.consequenceCovered ? (
                  <p class={styles.caption} data-covered="">
                    <Icon name="seal" />
                    <span>{t('boss_covered')}</span>
                  </p>
                ) : null}
                {/* Interrupts answered during this beat (QA M3): their outcome, after the beat's own. */}
                {view.consequenceAsides.map((n, i) => (
                  <p key={i} class={styles.caption} data-aside="">
                    <Icon name="info" />
                    <span>
                      <RichText text={n} />
                    </span>
                  </p>
                ))}
                <button type="button" class={styles.primary} onClick={runner.continueConsequence}>
                  {t('app_continue')}
                </button>
              </div>
            ) : null}
            {view.phase === 'interrupt' ? <p class={styles.note}>{t('interrupt_closing')}</p> : null}
            {view.phase === 'damage_control' && view.recovery ? (
              // The outcome was the caption of the consequence step just before; not repeated here (ruling 2026-11-19).
              <DamageControl view={view.recovery} onDone={runner.submitRecovery} />
            ) : null}
          </section>
        </CheckContext.Provider>
      </main>
      {!desk && card ? card : null}
      {settingsOpen && settings && onSettings ? (
        <SettingsPanel settings={settings} defaultTimer={defaultTimer} onChange={onSettings} onClose={closeSettings} modal inScenario />
      ) : null}
      {registerOpen ? <FairmeasurePanel entries={registerEntries()} onClose={closeRegister} coach={registerCoach} onCoachSeen={registerCoachSeen} /> : null}
      <p id="check-hint" class={styles.vh}>
        {t('check_hint')}
      </p>
    </div>
  );
}
