import { useEffect, useRef } from 'preact/hooks';
import type { Scenario } from '../content/schema.ts';
import { resolveAction, type Resolution } from '../engine/outcome.ts';
import { t } from '../i18n/index.ts';
import styles from './ScenarioView.module.css';

export interface ScenarioViewProps {
  scenario: Scenario;
  onDone: (r: Resolution) => void;
}

/** Renders the incoming message and the player's choices. Content is text only (never HTML). */
export function ScenarioView({ scenario, onDone }: ScenarioViewProps) {
  const { message } = scenario;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), [scenario.id]);
  return (
    <section class={styles.scenario} aria-labelledby="scenario-heading">
      <h2 id="scenario-heading" ref={heading} tabIndex={-1} class={styles.visuallyHidden}>
        {message.sender.display}
      </h2>
      <article class={styles.device} data-device={scenario.device}>
        <p class={styles.sender}>
          <span class={styles.label}>{t('scenario_from')}: </span>
          <strong>{message.sender.display}</strong>
          {message.sender.detail ? <span class={styles.detail}> {message.sender.detail}</span> : null}
        </p>
        {message.subject ? <p class={styles.subject}>{message.subject}</p> : null}
        <p class={styles.body}>{message.body}</p>
      </article>
      {scenario.pressure?.timer_seconds ? (
        <p class={styles.pressure}>{t('scenario_timer', { seconds: scenario.pressure.timer_seconds })}</p>
      ) : null}
      <h3>{t('scenario_choose')}</h3>
      <ul class={styles.actions}>
        {scenario.actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              class={styles.action}
              data-action={a.id}
              onClick={() => {
                const r = resolveAction(scenario, a.id);
                if (r) onDone(r);
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
  return (
    <section class={styles.scenario} aria-labelledby="outcome-heading">
      <h2 id="outcome-heading" ref={heading} tabIndex={-1}>
        {t('outcome_title')}
      </h2>
      <p>{result.outcome.narrative}</p>
      <p>
        <strong>{t('outcome_score', { score: result.score > 0 ? `+${result.score}` : result.score })}</strong>
        {result.best ? ` ${t('outcome_best')}` : null}
      </p>
      <h2>{t('debrief_title')}</h2>
      <p>{t('debrief_no_shame')}</p>
      {debrief.red_flags.length > 0 ? (
        <>
          <h3>{t('debrief_red_flags')}</h3>
          <ul>
            {debrief.red_flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : null}
      <h3>{t('debrief_habit')}</h3>
      <p>{debrief.habit}</p>
      {debrief.already_clicked ? (
        <>
          <h3>{t('debrief_already_clicked')}</h3>
          <p>{debrief.already_clicked}</p>
        </>
      ) : null}
      <button type="button" class={styles.primary} onClick={onAgain}>
        {t('app_again')}
      </button>
    </section>
  );
}
