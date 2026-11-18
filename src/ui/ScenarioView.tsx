/**
 * One scenario on screen: HUD, the device stage, notifications and interrupts, and the action tray
 * ("Your options"), driven by the engine's useScenarioRunner view (docs/ENGINE.md).
 *
 * Accessibility (UI_SPEC §10): skip link "Skip to your options"; focus moves to the device heading on
 * arrival and on every new beat, to "What now?" after hanging up, to the consequence caption and to
 * damage control; never on interrupts, tags, translation or Take a breath. The engine's state.log
 * feeds the polite announcer (timer thresholds, stress changes, new messages), coalesced there.
 */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Scenario } from '../content/schema.ts';
import { recoveryStepFeedback, recoveryStepLabel } from '../content/recoverySteps.ts';
import { useScenarioRunner } from '../engine/hooks.ts';
import type { RecoveryOption } from '../engine/recovery.ts';
import type { ScenarioResult } from '../engine/result.ts';
import type { CheckableView, RunnerContext, RunnerLogEntry, RunnerState, RunnerView } from '../engine/runner.ts';
import { t } from '../i18n/index.ts';
import { AnnounceContext } from './Announcer.tsx';
import { CheckCard, CheckContext, DetailsList, type CheckApi } from './check/Check.tsx';
import { DeviceView, deviceHeading } from './devices/Device.tsx';
import type { CallStage } from './devices/types.ts';
import { BreathPanel, formatTime, Hud } from './Hud.tsx';
import { Icon } from './Icon.tsx';
import { WHAT_NOW_KEYS } from './labels.ts';
import { RichText } from './RichText.tsx';
import { words } from './text.ts';
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

/** Reading pace for call lines (UI_SPEC §3.4): max(1.5 s, 0.3 s × words). */
export function linePace(text: string): number {
  return Math.max(1.5, 0.3 * words(text));
}

function logAnnouncement(e: RunnerLogEntry): { category: 3 | 4 | 5; text: string } | null {
  switch (e.type) {
    case 'beat_arrived':
      return e.beatId === 'start' ? null : { category: 5, text: t('announce_new_message') };
    case 'pusher':
      return { category: 5, text: t('announce_pusher', { text: e.text }) };
    case 'interrupt':
      return { category: 5, text: t('announce_interrupt') };
    case 'timer':
      return { category: 3, text: t(e.what === 'half' ? 'announce_timer_half' : e.what === 'ten_left' ? 'announce_timer_ten' : e.what === 'escalated' ? 'announce_timer_escalated' : 'announce_timer_expired') };
    case 'stress':
      return { category: 4, text: t(e.state === 'calm' ? 'stress_calm' : e.state === 'tense' ? 'stress_tense' : 'stress_overwhelmed') };
  }
}

function DamageControl({ view, onDone }: { view: NonNullable<RunnerView['recovery']>; onDone: (picks: string[]) => void }) {
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
                  <strong>{harmful ? t('damage_doesnt_help') : t('damage_helps')}</strong> {recoveryStepLabel(step)}
                </span>
                {harmful && recoveryStepFeedback(step) ? <p>{recoveryStepFeedback(step)}</p> : null}
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
      <p>{t('damage_prompt')}</p>
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
export function ScenarioView({ scenario, ctx, onDone, progress = null, callLines = 'auto', onCallLines, alwaysTranslate = false, onQuit }: ScenarioViewProps) {
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

  // ---- result
  const reported = useRef(false);
  useEffect(() => {
    if (runner.result && !reported.current) {
      reported.current = true;
      announce.assertive(t('announce_scenario_ended'));
      onDone(runner.state, runner.result);
    }
  }, [runner.result, runner.state, onDone, announce]);

  // ---- announcer: state.log → polite queue (UI_SPEC §10.5)
  const logSeen = useRef(0);
  useEffect(() => {
    const fresh = state.log.slice(logSeen.current);
    logSeen.current = state.log.length;
    for (const e of fresh) {
      const a = logAnnouncement(e);
      if (a) announce.polite(a.category, a.text, a.category === 5 ? (n) => t('announce_new_messages', { count: n }) : undefined);
      if (e.type === 'timer' && e.what === 'escalated') setChip(t('timer_escalated_chip', { seconds: ctx.balance.timers.escalation_extra_seconds }));
    }
  }, [state.log, announce, ctx.balance.timers.escalation_extra_seconds]);
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
  const lines = beat?.message.transcript ?? [];
  const revealing = !!call && !call.ended && (!call.answered || call.shown < lines.length);
  useEffect(() => {
    runner.freeze('call_lines', revealing);
  }, [revealing]);
  useEffect(() => {
    if (!call || !call.answered || call.ended || call.step || call.shown >= lines.length || view.pause.open) return undefined;
    const id = setTimeout(() => setCallState({ ...call, shown: call.shown + 1 }), linePace(lines[call.shown - 1]?.text ?? '') * 1000);
    return () => clearTimeout(id);
  });
  const answer = () => beat && setCallState({ beatId: beat.id, answered: true, shown: 1, ended: false, step: callLines === 'step' });
  const hangUpAction = beat?.actions.find((a) => a.kind === 'hang_up');
  const ringing = !!call && !call.answered && !call.ended;

  // ---- focus (UI_SPEC §10.3)
  const focusKey = `${view.phase}:${beat?.id ?? ''}`;
  useEffect(() => {
    if (view.phase === 'playing') deviceHeadingRef.current?.focus();
    else if (view.phase === 'what_now') whatNowRef.current?.focus();
    else if (view.phase === 'consequence') consequenceRef.current?.focus();
    // damage_control focuses its own heading.
  }, [focusKey]);

  // ---- Check
  const items = useMemo(() => {
    let list = view.checkables;
    // Elements not on screen yet (a ringing call, unrevealed lines) are not listed (no free preview).
    if (call && !call.answered) list = list.filter((c) => c.target === 'caller_id');
    return list;
  }, [view.checkables, call?.answered]);
  const itemMap = useMemo(() => new Map(items.map((c) => [c.target, c])), [items]);
  const sender = beat?.message.sender;
  const visible = useCallback(
    (c: CheckableView): string => {
      if (c.target === 'sender.detail' || c.target === 'caller_id') return sender?.display ?? c.shown ?? '';
      if (c.target === 'page.info') return t('page_info_visible');
      return c.shown ?? '';
    },
    [sender],
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
      doCheck(c);
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
  const pageAddress = itemMap.get('page.address');

  return (
    <div class={styles.play}>
      <a
        href="#options"
        class={styles.skip}
        onClick={(e) => {
          e.preventDefault();
          optionsRef.current?.focus();
        }}
      >
        {t('skip_to_options')}
      </a>
      {live ? (
        <div inert={modal}>
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
            }}
          />
        </div>
      ) : null}
      <main class={beat ? styles.main : `${styles.main} ${styles.solo}`} inert={modal}>
        <CheckContext.Provider value={api}>
          <div class={view.stress.state === 'overwhelmed' ? `${styles.stage} ${styles.vignette}` : styles.stage}>
            {view.pause.open ? <BreathPanel onBack={runner.endPause} /> : null}
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
                actions={beat.actions}
                canAct={view.phase === 'playing'}
                onAct={runner.act}
                onTranslation={onTranslation}
                alwaysTranslate={alwaysTranslate}
                addressChecked={!!pageAddress?.checked}
                call={call}
                onAnswer={answer}
                onDecline={hangUpAction ? () => runner.act(hangUpAction.id) : null}
                onNextLine={() => call && setCallState({ ...call, shown: call.shown + 1 })}
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
                <div key={i.id} class={styles.interrupt}>
                  <p class={styles.interruptMeta}>
                    {t(i.device === 'email' ? 'banner_kind_email' : i.device === 'messenger' ? 'banner_kind_chat' : i.device === 'call' ? 'banner_kind_call' : 'banner_kind_sms')}
                    {i.message.sender ? ` · ${i.message.sender.display}` : ''}
                  </p>
                  {i.message.body ? (
                    <p class={styles.interruptBody}>
                      <RichText text={i.message.body} />
                    </p>
                  ) : null}
                  <ul class={styles.actions}>
                    {i.actions.map((a) => (
                      <li key={a.id}>
                        <button type="button" class={styles.action} onClick={() => runner.answerInterrupt(i.id, a.id)}>
                          {a.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>
          ) : null}
          <section id="options" class={styles.tray} aria-labelledby="actions-h" tabIndex={-1} ref={optionsRef}>
            {desk && card ? card : null}
            <h2 id="actions-h" class={styles.trayTitle}>
              {t('your_options')}
            </h2>
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
            {beat && view.phase === 'playing' ? (
              ringing ? (
                <p class={styles.note}>{t('call_answer_first')}</p>
              ) : (
                <ul class={styles.actions}>
                  {beat.actions.map((a) => (
                    <li key={a.id}>
                      <button type="button" class={a.styled ? `${styles.action} ${styles.pressure}` : styles.action} data-action={a.id} onClick={() => runner.act(a.id)}>
                        {a.label}
                      </button>
                    </li>
                  ))}
                </ul>
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
                <h3 ref={consequenceRef} tabIndex={-1}>
                  {t('consequence_title')}
                </h3>
                <p class={styles.caption}>
                  <Icon name="info" />
                  <span>{view.consequenceTimerExpired ? t('deadline_fake') : <RichText text={view.consequence ?? ''} />}</span>
                </p>
                <button type="button" class={styles.primary} onClick={runner.continueBoss}>
                  {t('app_continue')}
                </button>
              </div>
            ) : null}
            {view.phase === 'damage_control' && view.recovery ? (
              <>
                {view.consequence ? (
                  <p class={styles.caption}>
                    <Icon name="info" />
                    <span>
                      <RichText text={view.consequence} />
                    </span>
                  </p>
                ) : null}
                <DamageControl view={view.recovery} onDone={runner.submitRecovery} />
              </>
            ) : null}
          </section>
        </CheckContext.Provider>
      </main>
      {!desk && card ? card : null}
      <p id="check-hint" class={styles.vh}>
        {t('check_hint')}
      </p>
    </div>
  );
}
