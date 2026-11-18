/**
 * Minimal scenario and debrief screens over the engine API (src/engine).
 * Device-specific UIs (mail, SMS, call, browser, QR, bank, auth, letter)
 * replace MessageCard in T-2.3; they consume the same `useScenarioRunner` view.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Device, Message, Scenario } from '../content/schema.ts';
import { habitCard } from '../content/habitCards.ts';
import { recoveryStepLabel } from '../content/recoverySteps.ts';
import type { DebriefData } from '../engine/debrief.ts';
import { useScenarioRunner } from '../engine/hooks.ts';
import type { ScenarioResult } from '../engine/result.ts';
import type { CheckableView, RunnerContext, RunnerState, RunnerView, WhatNowBuiltin } from '../engine/runner.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import styles from './ScenarioView.module.css';

/** Plain-text rendering of whatever parts the message has. Content is text only (never HTML). */
function MessageCard({ device, message }: { device: Device; message: Message }) {
  return (
    <article class={styles.device} data-device={device} lang={message.lang}>
      {message.sender ? (
        <p class={styles.sender}>
          <span class={styles.label} lang="en">{t('scenario_from')}: </span>
          <strong>{message.sender.display}</strong>
          {message.sender.detail ? <span class={styles.detail}> {message.sender.detail}</span> : null}
        </p>
      ) : null}
      {message.page ? <p class={styles.sender}>{message.page.address}</p> : null}
      {message.letterhead ? <p class={styles.sender}>{message.letterhead}</p> : null}
      {message.subject ? <p class={styles.subject}>{message.subject}</p> : null}
      {message.body ? <p class={styles.body}>{message.body}</p> : null}
      {message.transcript?.map((l, i) => (
        <p key={i} class={styles.body}>
          {l.text}
        </p>
      ))}
      {message.translation ? (
        <p class={styles.detail} lang="en">
          <span class={styles.label}>{t('scenario_translation')}: </span>
          {message.translation}
        </p>
      ) : null}
    </article>
  );
}

const ELEMENT_KEYS: Record<string, MessageKey> = {
  'sender.detail': 'element_sender',
  caller_id: 'element_caller_id',
  link: 'element_link',
  attachment: 'element_attachment',
  reference: 'element_reference',
  phone_number: 'element_phone_number',
  'qr.destination': 'element_qr',
  'page.address': 'element_page_address',
  'page.info': 'element_page_info',
  'payee.name_check': 'element_payee_name',
  'payee.iban': 'element_payee_iban',
  'prompt.service': 'element_prompt',
  'prompt.where': 'element_prompt',
  'prompt.device': 'element_prompt',
  'prompt.when': 'element_prompt',
  'prompt.number': 'element_prompt',
  letterhead: 'element_letterhead',
  image: 'element_image',
};

export function elementLabel(target: string): string {
  const base = target.replace(/#(\d)$/, '');
  const n = /#(\d)$/.exec(target)?.[1];
  const label = t(ELEMENT_KEYS[base] ?? 'element_other');
  return n ? `${label} ${n}` : label;
}

/** "Details you can check": the primary keyboard and screen-reader path (UI_SPEC §4.6). Never shows a total. */
function DetailsList({ items, checked, onCheck, onTag }: {
  items: CheckableView[];
  checked: number;
  onCheck: (c: CheckableView) => void;
  onTag: (c: CheckableView, on: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" class={styles.secondary} aria-expanded={open} aria-controls="details-list" onClick={() => setOpen(!open)}>
        {t('details_toggle', { checked })}
      </button>
      <ul id="details-list" class={styles.details} hidden={!open}>
        {items.map((c) => (
          <li key={c.key}>
            <button type="button" class={styles.secondary} data-check={c.target} onClick={() => onCheck(c)}>
              {t('check_item', { element: elementLabel(c.target) })}
              {c.shown ? <span> · {c.shown}</span> : null}
            </button>
            {c.checked ? (
              <>
                <p class={styles.reveal}>{c.reveal ?? t('check_nothing_unusual')}</p>
                <button type="button" class={styles.secondary} aria-pressed={c.tagged} data-tag={c.target} onClick={() => onTag(c, !c.tagged)}>
                  {c.tagged ? t('tag_marked') : t('tag_mark')}
                </button>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(seconds: number): string {
  const s = Math.ceil(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Hud({ view, onPause }: { view: RunnerView; onPause: () => void }) {
  const stressKey: MessageKey = view.stress.state === 'calm' ? 'stress_calm' : view.stress.state === 'tense' ? 'stress_tense' : 'stress_overwhelmed';
  return (
    <div class={styles.hud}>
      {view.timer ? (
        <p role="timer" aria-live="off" aria-label={t('timer_label')}>
          {t('timer_value', { time: formatTime(view.timer.remaining) })}
          {view.timer.frozen ? <span class={styles.visuallyHidden}> {t('timer_paused')}</span> : null}
        </p>
      ) : null}
      <p role="meter" aria-label={t('stress_label')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={view.stress.value} aria-valuetext={t(stressKey)}>
        {t(stressKey)}
      </p>
      <button type="button" class={styles.secondary} aria-disabled={!view.pause.available} onClick={() => view.pause.available && onPause()}>
        {view.pause.available ? t('pause') : t('pause_cooldown', { seconds: Math.ceil(view.pause.cooldownLeft) })}
      </button>
    </div>
  );
}

const WHAT_NOW_KEYS: Record<WhatNowBuiltin, MessageKey> = {
  call_back_known: 'what_now_call_back_known',
  report: 'what_now_report',
  done: 'what_now_done',
};

function DamageControl({ view, onDone }: { view: NonNullable<RunnerView['recovery']>; onDone: (picks: string[]) => void }) {
  const [picks, setPicks] = useState<string[]>([]);
  const toggle = (step: string) => setPicks((p) => (p.includes(step) ? p.filter((x) => x !== step) : p.length < view.pick ? [...p, step] : p));
  return (
    <section aria-labelledby="damage-heading">
      <h3 id="damage-heading">{t('damage_title')}</h3>
      <p>{t('damage_sub')}</p>
      <p>{t('damage_prompt')}</p>
      <ul class={styles.actions}>
        {view.options.map((o) => {
          const i = picks.indexOf(o.step);
          return (
            <li key={o.step}>
              <button type="button" class={styles.action} aria-pressed={i >= 0} data-step={o.step} onClick={() => toggle(o.step)}>
                {i >= 0 ? `${t('damage_order', { n: i + 1 })} ` : ''}
                {recoveryStepLabel(o.step)}
              </button>
            </li>
          );
        })}
      </ul>
      <p role="status">{t('damage_counter', { chosen: picks.length, total: view.pick })}</p>
      <button type="button" class={styles.primary} aria-disabled={picks.length < view.pick} onClick={() => picks.length >= view.pick && onDone(picks)}>
        {t('damage_done')}
      </button>
    </section>
  );
}

export interface ScenarioViewProps {
  scenario: Scenario;
  ctx: RunnerContext;
  onDone: (state: RunnerState, result: ScenarioResult) => void;
}

/** One scenario from arrival to the end of damage control. Give it a `key` to restart. */
export function ScenarioView({ scenario, ctx, onDone }: ScenarioViewProps) {
  const runner = useScenarioRunner(scenario, ctx);
  const { view } = runner;
  const heading = useRef<HTMLHeadingElement>(null);
  const beatId = view.beat?.id ?? view.phase;
  useEffect(() => heading.current?.focus(), [scenario.id, beatId]);
  const reported = useRef(false);
  useEffect(() => {
    if (runner.result && !reported.current) {
      reported.current = true;
      onDone(runner.state, runner.result);
    }
  }, [runner.result, runner.state, onDone]);

  const beat = view.beat;
  const title = beat ? (beat.message.sender?.display ?? beat.message.page?.title ?? beat.message.page?.address ?? t('scenario_message')) : t('consequence_title');
  return (
    <section class={styles.scenario} aria-labelledby="scenario-heading">
      <h2 id="scenario-heading" ref={heading} tabIndex={-1} class={beat ? styles.visuallyHidden : undefined}>
        {title}
      </h2>
      <Hud view={view} onPause={runner.pause} />
      {view.pause.open ? (
        <div class={styles.breath}>
          <p role="status">{t('pause_panel')}</p>
          <p>{t('pause_copy')}</p>
          <button type="button" class={styles.secondary} onClick={runner.endPause}>
            {t('pause_back')}
          </button>
        </div>
      ) : null}
      {view.thread.map((m) => (
        <MessageCard key={m.id} device={m.device} message={m.message} />
      ))}
      {beat ? <MessageCard device={beat.device} message={beat.message} /> : null}
      {beat?.banner ? (
        <aside aria-label={t('banner_title')}>
          <MessageCard device={beat.banner.device} message={beat.banner.message} />
        </aside>
      ) : null}
      {view.pusherMessages.length > 0 ? (
        <ul class={styles.pushers} aria-label={t('pusher_from')}>
          {view.pusherMessages.map((p, i) => (
            <li key={i}>{p.text}</li>
          ))}
        </ul>
      ) : null}
      {view.waitingBeats.length > 0 ? <p>{t('waiting_beats', { count: view.waitingBeats.length })}</p> : null}
      {view.interrupts.map((i) => (
        <aside key={i.id} aria-label={t('interrupt_title')}>
          <MessageCard device={i.device} message={i.message} />
          <ul class={styles.actions}>
            {i.actions.map((a) => (
              <li key={a.id}>
                <button type="button" class={styles.action} onClick={() => runner.answerInterrupt(i.id, a.id)}>
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      ))}
      {beat && view.checkables.length > 0 ? (
        <DetailsList
          items={view.checkables}
          checked={view.checkedCount}
          onCheck={(c) => runner.check(c.beatId, c.target)}
          onTag={(c, on) => runner.tag(c.beatId, c.target, on)}
        />
      ) : null}
      {beat && view.phase === 'playing' ? (
        <>
          <h3>{t('scenario_choose')}</h3>
          <ul class={styles.actions}>
            {beat.actions.map((a) => (
              <li key={a.id}>
                <button type="button" class={a.styled ? `${styles.action} ${styles.styled}` : styles.action} data-action={a.id} onClick={() => runner.act(a.id)}>
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {view.whatNow ? (
        <>
          <h3>{t('what_now_title')}</h3>
          {view.whatNow.note ? <p role="status">{view.whatNow.note}</p> : null}
          <ul class={styles.actions}>
            {view.whatNow.choices.map((c) => (
              <li key={c.id}>
                <button type="button" class={styles.action} onClick={() => runner.whatNow(c.id)}>
                  {c.label ?? (c.builtin ? t(WHAT_NOW_KEYS[c.builtin]) : c.id)}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {view.phase === 'consequence' || view.phase === 'damage_control' ? <p>{view.consequence}</p> : null}
      {view.phase === 'consequence' ? (
        <button type="button" class={styles.primary} onClick={runner.continueBoss}>
          {t('app_continue')}
        </button>
      ) : null}
      {view.recovery ? <DamageControl view={view.recovery} onDone={runner.submitRecovery} /> : null}
    </section>
  );
}

export interface DebriefViewProps {
  data: DebriefData;
  onContinue: () => void;
  onAgain: () => void;
}

const STATUS_KEYS: Record<DebriefData['layer2']['flags'][number]['status'], MessageKey> = {
  marked: 'debrief_marked',
  not_marked: 'debrief_not_marked',
  in_message: 'debrief_in_message',
};

export function DebriefView({ data, onContinue, onAgain }: DebriefViewProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => heading.current?.focus(), []);
  const { layer1: l1, layer2: l2 } = data;
  const ac = l2.alreadyClicked;
  const card = habitCard(l2.habitCard ?? undefined);
  const best = l1.stars === 3 && l1.youChose.length === 0;
  return (
    <section class={styles.scenario} aria-labelledby="outcome-heading">
      <h2 id="outcome-heading" ref={heading} tabIndex={-1}>
        {t('outcome_title')}
      </h2>
      {data.narratives.map((n, i) => (
        <p key={i}>{n}</p>
      ))}
      {l1.deadlineWasFake ? <p>{t('deadline_fake')}</p> : null}
      {l1.stars !== null ? (
        <p>
          <strong>{t('outcome_stars', { stars: l1.stars })}</strong>
          {best ? ` ${t('outcome_best')}` : null}
        </p>
      ) : null}
      <h2>{t('debrief_title')}</h2>
      <p>
        {l1.verdict ? <strong>{l1.verdict === 'fraud' ? t('debrief_verdict_fraud') : t('debrief_verdict_genuine')} </strong> : null}
        {l1.tell}
      </p>
      <p>
        <strong>{t('debrief_what_works')} </strong>
        {l1.whatWorks}
      </p>
      {l1.youChose.map((c, i) => (
        <p key={i}>
          {c.kind === 'timer' ? t('you_chose_timer') : t('you_chose', { label: c.kind === 'action' ? c.label : t(WHAT_NOW_KEYS[c.choice]) })}
        </p>
      ))}
      {l1.alreadyClicked ? (
        <p>
          <strong>{t('habit_card_already_clicked')} </strong>
          {l1.alreadyClicked.text}
        </p>
      ) : null}
      <p>{t('debrief_no_shame')}</p>
      <button type="button" class={styles.secondary} aria-expanded={more} aria-controls="debrief-more" onClick={() => setMore(!more)}>
        {t('debrief_more')}
      </button>
      <div id="debrief-more" hidden={!more}>
        {l2.flags.length > 0 ? (
          <>
            <h3>{t('debrief_red_flags')}</h3>
            <ul>
              {l2.flags.map((f, i) => (
                <li key={i}>
                  {f.text} <span>({t(STATUS_KEYS[f.status])})</span>
                  {f.senderCaveat ? <span> {t('debrief_sender_caveat')}</span> : null}
                </li>
              ))}
            </ul>
            <p>{t('debrief_spotted', l2.spotted)}</p>
          </>
        ) : null}
        {l2.wrongTags.length > 0 ? (
          <ul>
            {l2.wrongTags.map((w) => (
              <li key={`${w.beatId}|${w.target}`}>
                {elementLabel(w.target)}: {t('debrief_wrong_tag')}
              </li>
            ))}
          </ul>
        ) : null}
        {l2.pressureCallout ? <p>{t(l2.pressureCallout === 'first_any' ? 'callout_first_any' : 'callout_first_genuine')}</p> : null}
        {l2.points ? (
          <p>
            {t('debrief_points_detail', {
              total: l2.points.total,
              max: l2.points.max,
              base: l2.points.base,
              bonus: l2.points.tagBonus,
              recovery: l2.points.recovery ?? 0,
            })}
          </p>
        ) : null}
      </div>
      {l2.deviceTip ? (
        <>
          <h3>{t('debrief_device_tip')}</h3>
          <p>{l2.deviceTip}</p>
        </>
      ) : null}
      {card ? (
        <section class={styles.habitCard} aria-labelledby="habit-card-title" data-habit-card={card.id}>
          <p class={styles.label}>{t('debrief_habit')}</p>
          <h3 id="habit-card-title">{card.title}</h3>
          <p>{card.habit}</p>
          <p class={styles.detail}>{card.example}</p>
          <p>
            <strong>{t('habit_card_already_clicked')} </strong>
            {card.already_clicked}
          </p>
        </section>
      ) : null}
      {ac ? (
        <>
          <h3>{t('debrief_already_clicked')}</h3>
          <dl>
            {ac.clicked ? (
              <>
                <dt>{t('debrief_clicked')}</dt>
                <dd>{ac.clicked}</dd>
              </>
            ) : null}
            {ac.entered_details ? (
              <>
                <dt>{t('debrief_entered_details')}</dt>
                <dd>{ac.entered_details}</dd>
              </>
            ) : null}
            {ac.paid ? (
              <>
                <dt>{t('debrief_paid')}</dt>
                <dd>{ac.paid}</dd>
              </>
            ) : null}
          </dl>
        </>
      ) : null}
      {l2.safeguardingLine ? <p>{l2.safeguardingLine}</p> : null}
      <div class={styles.footer}>
        <button type="button" class={styles.primary} onClick={onContinue}>
          {t('app_continue')}
        </button>
        <button type="button" class={styles.secondary} onClick={onAgain}>
          {t('app_again')}
        </button>
      </div>
    </section>
  );
}
