/**
 * Debrief, two layers (UI_SPEC §8). Layer 1 stays within the 40-word budget the validator checks:
 * verdict chip + tell (h1, focus lands here), "What works:", "You chose" (below ★★★ only), stars,
 * and ONE link "Already clicked or paid? See what to do" into layer 2. The advice itself is never
 * inline in layer 1. Layer 2 ("More") holds the red flags, the real-phone tip, "If you already…",
 * the habit card, callouts and the points breakdown.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { habitCard } from '../content/habitCards.ts';
import type { ChoiceLine, DebriefData, DebriefWrongTag, OtherChoice } from '../engine/debrief.ts';
import { choiceLineText, choicePathText, nextTimeText } from '../engine/choiceText.ts';
import { lookup, t, type MessageKey } from '../i18n/index.ts';
import { deviceHeading } from './devices/Device.tsx';
import { Icon } from './Icon.tsx';
import { deadlineText, elementLabel } from './labels.ts';
import { RichText } from './RichText.tsx';
import styles from './DebriefView.module.css';

export interface DebriefViewProps {
  data: DebriefData;
  onContinue: () => void;
  onAgain: () => void;
  /** Arc debriefs (GDD §10.2): "Tell me now", behind a confirmation. Absent once the arc is closed. */
  onTellMeNow?: (() => void) | undefined;
}

/** "If you already…" headings (UI_SPEC §8.2 item 3; shared_code: ruling QA m10). */
const SITUATION_KEYS: Record<'clicked' | 'entered_details' | 'shared_code' | 'paid', MessageKey> = {
  clicked: 'debrief_clicked',
  entered_details: 'debrief_entered_details',
  shared_code: 'debrief_shared_code',
  paid: 'debrief_paid',
};
/** Arc beats are chats with no link (QA m4): `clicked` there means replying, moving chats or keeping secrets (GDD §10.2). */
const ARC_SITUATION_KEYS: Record<'clicked' | 'entered_details' | 'shared_code' | 'paid', MessageKey> = {
  clicked: 'debrief_arc_clicked',
  entered_details: 'debrief_arc_entered_details',
  shared_code: 'debrief_shared_code',
  paid: 'debrief_arc_paid',
};

const STATUS_KEYS: Record<DebriefData['layer2']['flags'][number]['status'], MessageKey> = {
  marked: 'debrief_marked',
  not_marked: 'debrief_not_marked',
  in_message: 'debrief_in_message',
};

/** The exact line the validator counts (src/engine/choiceText.ts). */
function choiceText(c: ChoiceLine): string {
  return choiceLineText(c, lookup);
}

/** "Your other choices" (ruling L1 item 3): on a boss, "{beat} ({stars} of 3 stars): {line}". */
function otherChoiceText(o: OtherChoice): string {
  // CR-27 round 2 (psych M4): a row whose beat had an engage before the final choice shows the whole path.
  const line = choicePathText(o.line, lookup) ?? choiceText(o.line);
  return o.beat ? t('debrief_other_choice', { beat: deviceHeading(o.beat.device, o.beat.message), stars: o.stars, line }) : line;
}

/** Wrong mark: "Fair instinct…" for caller ID, sender and logo decoys on fraud (ruling L2). */
function wrongTagText(w: DebriefWrongTag): string {
  if (!w.fairInstinct) return t('debrief_wrong_tag');
  if (w.type === 'caller_id') return t('debrief_wrong_tag_caller_id');
  if (w.type === 'logo') return t('debrief_wrong_tag_logo');
  return t('debrief_wrong_tag_sender');
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

export function DebriefView({ data, onContinue, onAgain, onTellMeNow }: DebriefViewProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [confirm, setConfirm] = useState(false);
  const confirmNo = useRef<HTMLButtonElement>(null);
  const tellButton = useRef<HTMLButtonElement>(null);
  const wasConfirm = useRef(false);
  useEffect(() => {
    if (confirm) confirmNo.current?.focus();
    else if (wasConfirm.current) tellButton.current?.focus();
    wasConfirm.current = confirm;
  }, [confirm]);
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
  // The slot holds ONE of: the ★★★ line, the kind line (after a fall, in the h1), a "You chose" line,
  // or the "Next time" pointer (layer-1 ruling 2026-11-19, ruling L1).
  const best = l1.stars === 3 && !data.fell && l1.youChose.length === 0 && !l1.nextTime && l1.allBest;
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
        {l1.nextTime ? <p>{nextTimeText(l1.nextTime, lookup)}</p> : null}
        {arc && l2.safeguardingLine ? <p>{l2.safeguardingLine}</p> : null}
        {l1.stars !== null ? <Stars n={l1.stars} /> : null}
        {best ? <p class={styles.best}>{t(l1.bestLine === 'acted' ? 'outcome_best_acted' : 'outcome_best')}</p> : null}
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
          {arc && onTellMeNow && !confirm ? (
            <button type="button" class={styles.secondary} ref={tellButton} onClick={() => setConfirm(true)}>
              {t('tell_me_now')}
            </button>
          ) : null}
        </div>
        {arc && onTellMeNow && confirm ? (
          <div class={styles.confirm} role="group" aria-labelledby="tell-me-now-q" data-tell-me-now="">
            <p id="tell-me-now-q">{t('tell_me_now_confirm')}</p>
            <div class={styles.buttons}>
              <button type="button" class={styles.primary} onClick={onTellMeNow}>
                {t('tell_me_now_yes')}
              </button>
              <button type="button" class={styles.secondary} ref={confirmNo} onClick={() => setConfirm(false)}>
                {t('tell_me_now_no')}
              </button>
            </div>
          </div>
        ) : null}
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
            {l2.deadline ? <p>{deadlineText(l2.deadline, l2.honestDeadline)}</p> : null}
          </section>
        ) : null}
        {l2.youChoseOther.length > 0 ? (
          <section aria-labelledby="other-choices-h">
            <h2 id="other-choices-h">{t('debrief_you_chose_more')}</h2>
            <ul>
              {l2.youChoseOther.map((c, i) => (
                <li key={i}>{otherChoiceText(c)}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {l2.choicePaths.length > 0 ? (
          // CR-27: the layer-1 line's whole path, where an engage came before the final choice.
          <section aria-labelledby="choice-path-h" data-choice-path="">
            <h2 id="choice-path-h">{t('debrief_choice_path')}</h2>
            {l2.choicePaths.map((c, i) => {
              const line = choicePathText(c.line, lookup) ?? '';
              return <p key={i}>{c.beat ? t('debrief_choice_path_beat', { beat: deviceHeading(c.beat.device, c.beat.message), line }) : line}</p>;
            })}
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
                      {f.senderCaveat ? <span> {t(f.senderCaveat === 'number' ? 'debrief_sender_caveat_number' : 'debrief_sender_caveat')}</span> : null}
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
                      {elementLabel(w.target, w.device)}: {wrongTagText(w)}
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
              {(['clicked', 'entered_details', 'shared_code', 'paid'] as const).map((k) =>
                ac[k] ? (
                  <div key={k} class={l1.alreadyClicked?.situation === k ? styles.yours : undefined}>
                    <dt>{t((arc ? ARC_SITUATION_KEYS : SITUATION_KEYS)[k])}</dt>
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
            {l2.points.bossFallCap ? <p>{t('boss_fall_cap')}</p> : null}
          </details>
        ) : null}
      </div>
    </main>
  );
}
