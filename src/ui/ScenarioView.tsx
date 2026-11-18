import { useEffect, useRef, useState } from 'preact/hooks';
import type { Action, Device, Message, Scenario } from '../content/schema.ts';
import { scoring } from '../content/balance.ts';
import { habitCard } from '../content/habitCards.ts';
import { resolveAction, type Resolution } from '../engine/outcome.ts';
import { t } from '../i18n/index.ts';
import styles from './ScenarioView.module.css';

export interface ScenarioViewProps {
  scenario: Scenario;
  onDone: (r: Resolution) => void;
}

interface BeatState {
  id: string;
  device: Device;
  message: Message;
  actions: Action[];
}

function openingBeat(s: Scenario): BeatState {
  return { id: 'start', device: s.device, message: s.message, actions: s.actions };
}

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

/**
 * Renders the current beat and the player's choices; follows next_beat until
 * an outcome. Starts at the opening beat on mount (give it a `key` to restart).
 */
export function ScenarioView({ scenario, onDone }: ScenarioViewProps) {
  const [beat, setBeat] = useState<BeatState>(() => openingBeat(scenario));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), [scenario.id, beat.id]);
  const title = beat.message.sender?.display ?? beat.message.page?.title ?? beat.message.page?.address ?? t('scenario_message');
  return (
    <section class={styles.scenario} aria-labelledby="scenario-heading">
      <h2 id="scenario-heading" ref={heading} tabIndex={-1} class={styles.visuallyHidden}>
        {title}
      </h2>
      <MessageCard device={beat.device} message={beat.message} />
      {beat.id === 'start' && scenario.pressure.timer ? <p class={styles.pressure}>{t('scenario_timer')}</p> : null}
      <h3>{t('scenario_choose')}</h3>
      <ul class={styles.actions}>
        {beat.actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              class={styles.action}
              data-action={a.id}
              onClick={() => {
                const step = resolveAction(scenario, scoring, beat.id, a.id);
                if (step?.kind === 'beat') setBeat({ ...step.beat });
                else if (step) onDone(step.result);
              }}
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface DebriefViewProps {
  scenario: Scenario;
  result: Resolution;
  onAgain: () => void;
}

export function DebriefView({ scenario, result, onAgain }: DebriefViewProps) {
  const { debrief } = scenario;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const checkableFlags = [...scenario.inspectables, ...scenario.beats.flatMap((b) => b.inspectables)]
    .filter((i) => i.red_flag)
    .map((i) => i.reveal);
  const flags = [...checkableFlags, ...debrief.layer2.message_flags];
  const ac = debrief.already_clicked;
  const card = habitCard(debrief.habit_card);
  return (
    <section class={styles.scenario} aria-labelledby="outcome-heading">
      <h2 id="outcome-heading" ref={heading} tabIndex={-1}>
        {t('outcome_title')}
      </h2>
      <p>{result.outcome.narrative}</p>
      {result.stars !== undefined ? (
        <p>
          <strong>{t('outcome_stars', { stars: result.stars })}</strong>
          {result.best ? ` ${t('outcome_best')}` : null}
        </p>
      ) : null}
      <h2>{t('debrief_title')}</h2>
      <p>
        {debrief.variant === 'standard' ? (
          <strong>{scenario.is_fraud ? t('debrief_verdict_fraud') : t('debrief_verdict_genuine')} </strong>
        ) : null}
        {debrief.layer1.tell}
      </p>
      <p>
        <strong>{t('debrief_what_works')} </strong>
        {debrief.layer1.what_works}
      </p>
      <p>{t('debrief_no_shame')}</p>
      {flags.length > 0 ? (
        <>
          <h3>{t('debrief_red_flags')}</h3>
          <ul>
            {flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : null}
      {debrief.device_tip ? (
        <>
          <h3>{t('debrief_device_tip')}</h3>
          <p>{debrief.device_tip}</p>
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
      {debrief.safeguarding_line ? <p>{debrief.safeguarding_line}</p> : null}
      <button type="button" class={styles.primary} onClick={onAgain}>
        {t('app_again')}
      </button>
    </section>
  );
}
