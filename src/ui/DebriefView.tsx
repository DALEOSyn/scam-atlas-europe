/**
 * Debrief, two layers (UI_SPEC §8). Layer 1 stays within the 40-word budget the validator checks:
 * verdict chip + tell (h1, focus lands here), "What works:", "You chose" (below ★★★ only), stars,
 * and ONE link "Already clicked or paid? See what to do" into layer 2. The advice itself is never
 * inline in layer 1. Layer 2 ("More") holds the red flags, the real-phone tip, "If you already…",
 * the habit card, callouts and the points breakdown.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { habitCard } from '../content/habitCards.ts';
import type { ChoiceLine, DebriefData } from '../engine/debrief.ts';
import { choiceLineText } from '../engine/choiceText.ts';
import { lookup, t, type MessageKey } from '../i18n/index.ts';
import { Icon } from './Icon.tsx';
import { elementLabel } from './labels.ts';
import { RichText } from './RichText.tsx';
import styles from './DebriefView.module.css';

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

/** The exact line the validator counts (src/engine/choiceText.ts). */
function choiceText(c: ChoiceLine): string {
  return choiceLineText(c, lookup);
}

function Stars({ n }: { n: number }) {
  return (
    <p class={styles.stars} role="img" aria-label={t('outcome_stars', { stars: n })}>
      {[0, 1, 2].map((i) => (
        <Icon key={i} name={i < n ? 'star' : 'star-empty'} size={28} />
      ))}
      <span aria-hidden="true">{t('outcome_stars', { stars: n })}</span>
    </p>
  );
}

export function DebriefView({ data, onContinue, onAgain }: DebriefViewProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const alreadyRef = useRef<HTMLHeadingElement>(null);
  const [more, setMore] = useState(false);
  const [jump, setJump] = useState(false);
  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    if (more && jump) {
      alreadyRef.current?.focus();
      setJump(false);
    }
  }, [more, jump]);
  const { layer1: l1, layer2: l2 } = data;
  const arc = data.variant === 'arc';
  const ac = l2.alreadyClicked;
  const card = habitCard(l2.habitCard ?? undefined);
  const genuine = l1.verdict === 'genuine';
  // The ★★★ line shares the slot; after a fall the kind line holds it (layer-1 ruling 2026-11-19).
  const best = l1.stars === 3 && !data.fell && l1.youChose.length === 0;
  const flagged = l2.flags.length > 0;
  const bonusPossible = l2.points !== null && l2.spotted.could > 0;

  return (
    <main class={styles.debrief}>
      <section class={styles.layer1} aria-labelledby="debrief-h1">
        {/* Focus lands on the h1, so everything before it in reading order lives inside it (QA B9). */}
        <h1 id="debrief-h1" ref={heading} tabIndex={-1} class={styles.h1}>
          {/* Red Line 5: said after a fall, where it helps; never on a good outcome. */}
          {data.fell ? <span class={styles.noShame}>{t('debrief_no_shame')} </span> : null}
          {l1.verdict ? (
            <span class={l1.verdict === 'fraud' ? `${styles.chip} ${styles.scam}` : `${styles.chip} ${styles.genuine}`}>
              <Icon name={l1.verdict === 'fraud' ? 'tag-crossed' : 'seal'} />
              <span>{l1.verdict === 'fraud' ? t('debrief_verdict_fraud') : t('debrief_verdict_genuine')}</span>
            </span>
          ) : null}{' '}
          <span>
            <RichText text={l1.tell} />
          </span>
        </h1>
        <p>
          <strong>{arc ? t('debrief_the_habit') : t('debrief_what_works')} </strong>
          <RichText text={l1.whatWorks} />
        </p>
        {l1.youChose.map((c, i) => (
          <p key={i}>{choiceText(c)}</p>
        ))}
        {arc && l2.safeguardingLine ? <p>{l2.safeguardingLine}</p> : null}
        {l1.stars !== null ? <Stars n={l1.stars} /> : null}
        {best ? <p class={styles.best}>{t('outcome_best')}</p> : null}
        {ac ? (
          <p>
            <button
              type="button"
              class={styles.link}
              aria-controls="debrief-more"
              onClick={() => {
                setMore(true);
                setJump(true);
              }}
            >
              {arc ? t('debrief_already_link_arc') : t('debrief_already_link')}
            </button>
          </p>
        ) : null}
        <div class={styles.buttons}>
          <button type="button" class={styles.secondary} aria-expanded={more} aria-controls="debrief-more" onClick={() => setMore(!more)}>
            {t('debrief_more')}
          </button>
          <button type="button" class={styles.primary} onClick={onContinue}>
            {t('app_continue')}
          </button>
          <button type="button" class={styles.secondary} onClick={onAgain}>
            {t('app_again')}
          </button>
        </div>
      </section>

      <div id="debrief-more" class={styles.layer2} hidden={!more}>
        {l2.narratives.length > 0 || l2.deadline ? (
          <section aria-labelledby="what-happened-h">
            <h2 id="what-happened-h">{t('debrief_what_happened')}</h2>
            {l2.narratives.map((n, i) => (
              <p key={i}>
                <RichText text={n} />
              </p>
            ))}
            {l2.deadline ? <p>{t(l2.deadline === 'fake' ? 'deadline_fake' : 'deadline_real')}</p> : null}
          </section>
        ) : null}
        {l2.youChoseOther.length > 0 ? (
          <section aria-labelledby="other-choices-h">
            <h2 id="other-choices-h">{t('debrief_you_chose_more')}</h2>
            <ul>
              {l2.youChoseOther.map((c, i) => (
                <li key={i}>{choiceText(c)}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {flagged || l2.wrongTags.length > 0 ? (
          <section aria-labelledby="flags-h">
            <h2 id="flags-h">{t('debrief_red_flags')}</h2>
            {flagged ? (
              <ul class={styles.flags}>
                {l2.flags.map((f, i) => (
                  <li key={i}>
                    <Icon name={f.status === 'marked' ? 'flag-filled' : 'flag'} />
                    <span>
                      <RichText text={f.text} /> <span class={styles.status}>({t(STATUS_KEYS[f.status])})</span>
                      {f.senderCaveat ? <span> {t('debrief_sender_caveat')}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {l2.wrongTags.length > 0 ? (
              <ul class={styles.flags}>
                {l2.wrongTags.map((w) => (
                  <li key={`${w.beatId}|${w.target}`}>
                    <Icon name="info" />
                    <span>
                      {elementLabel(w.target)}: {t('debrief_wrong_tag')}
                      {bonusPossible ? ` ${t('debrief_wrong_tag_bonus')}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {l2.spotted.could > 0 && !data.drill ? <p>{t('debrief_spotted', l2.spotted)}</p> : null}
          </section>
        ) : null}
        {l2.notes ? (
          <p>
            <RichText text={l2.notes} />
          </p>
        ) : null}
        {l2.deviceTip ? (
          <section aria-labelledby="tip-h">
            <h2 id="tip-h">{t('debrief_device_tip')}</h2>
            <p>
              <RichText text={l2.deviceTip} />
            </p>
          </section>
        ) : null}
        {ac ? (
          <section aria-labelledby="already-h">
            <h2 id="already-h" ref={alreadyRef} tabIndex={-1}>
              {t('debrief_already_clicked')}
            </h2>
            <dl class={styles.already}>
              {(['clicked', 'entered_details', 'paid'] as const).map((k) =>
                ac[k] ? (
                  <div key={k} class={l1.alreadyClicked?.situation === k ? styles.yours : undefined}>
                    <dt>{t(k === 'clicked' ? 'debrief_clicked' : k === 'entered_details' ? 'debrief_entered_details' : 'debrief_paid')}</dt>
                    <dd>
                      <RichText text={ac[k] ?? ''} />
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </section>
        ) : null}
        {card ? (
          <section class={styles.habitCard} aria-labelledby="habit-card-title" data-habit-card={card.id}>
            <p class={styles.label}>{t('debrief_habit')}</p>
            <h3 id="habit-card-title">{card.title}</h3>
            <p>
              <RichText text={card.habit} />
            </p>
            {/* Hosts in the example never wrap at a hyphen (QA F3). */}
            <p class={styles.example}>
              <RichText text={card.example} />
            </p>
            {/* On a genuine message there was nothing to fall for: no "Already clicked?" line (QA). */}
            {!genuine ? (
              <p>
                <strong>{t('habit_card_already_clicked')} </strong>
                <RichText text={card.already_clicked} />
              </p>
            ) : null}
          </section>
        ) : null}
        {l2.pressureCallout ? <p class={styles.callout}>{t(l2.pressureCallout === 'first_any' ? 'callout_first_any' : 'callout_first_genuine')}</p> : null}
        {!arc && l2.safeguardingLine ? <p>{l2.safeguardingLine}</p> : null}
        {l2.points ? (
          <details class={styles.points}>
            <summary>{t('debrief_points')}</summary>
            <p>
              {t('debrief_points_detail', {
                total: l2.points.total,
                max: l2.points.max,
                base: l2.points.base,
                bonus: l2.points.tagBonus,
                recovery: l2.points.recovery ?? 0,
              })}
            </p>
          </details>
        ) : null}
      </div>
    </main>
  );
}
