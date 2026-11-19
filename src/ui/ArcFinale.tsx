/**
 * The Alex arc's finale pieces (CR-43; GDD §10.3, §30.6). Neutral wording, no judgement (Red Line 5):
 * - RevealCard: one portrait on three profile cards with different names, under "The same picture {name} used."
 *   (the game's visualisation of a reverse image search). Shown on a finale consequence step and on "Tell me now".
 * - RedFlagTimeline: "Every step below was {name}'s plan, not your fault." then each arc slot played, its layer-1
 *   tell and the player's choice in fixed wording (§30.6, psych M3). Never an amount, a count of falls, a score per
 *   slot, or "fell", "fooled", "mistake" (validator: timelineTextIssues).
 * - TimelineScreen and RevealScreen: the finale steps as screens; ArcDamageScreen: ending C's arc damage control.
 * The arc character is never drawn in a scene; the portrait here is a device-layer profile picture (ART_DIRECTION §4.7).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { arcCharacter } from '../content/cast.ts';
import type { TimelineRow } from '../engine/arc.ts';
import { t } from '../i18n/index.ts';
import { RichText } from './RichText.tsx';
import styles from './ChapterList.module.css';

/** The arc character's first name (content/cast.yaml `arc_character`), for "The same picture {name} used.". */
export function arcName(): string {
  return arcCharacter()?.name.split(/\s+/u)[0] ?? '';
}

/**
 * The reveal card (CR-43(b)): the one illustrated portrait (`public/art/cast/<arc id>.svg`, same file and crop
 * everywhere) on three profile cards, with a text alternative and the names as a list. The picture is decorative
 * inside the described group; if the file is missing the cards still read correctly (names and caption).
 */
export function RevealCard({ names, headingLevel = 3 }: { names: readonly string[]; headingLevel?: 2 | 3 | 4 }) {
  const H = headingLevel === 2 ? 'h2' : headingLevel === 3 ? 'h3' : 'h4';
  const [art, setArt] = useState(true);
  const name = arcName();
  const arcId = arcCharacter()?.id;
  return (
    <section class={styles.reveal} aria-labelledby="reveal-card-h" data-reveal-card="">
      <H id="reveal-card-h" class={styles.name}>
        {t('reveal_caption', { name })}
      </H>
      <div role="img" aria-label={t('reveal_alt')} class={styles.revealGrid}>
        {names.map((n) => (
          <div key={n} class={styles.revealProfile} aria-hidden="true">
            {art && arcId ? <img src={`/art/cast/${arcId}.svg`} alt="" width={96} height={120} onError={() => setArt(false)} /> : <span class={styles.revealBlank} />}
            <span>{n}</span>
          </div>
        ))}
      </div>
      <p class={styles.intro}>{t('reveal_names', { names: names.join(', ') })}</p>
    </section>
  );
}

const CHOICE_KEYS = {
  paid: 'timeline_choice_paid',
  went_along: 'timeline_choice_went_along',
  stepped_back: 'timeline_choice_stepped_back',
  asked: 'timeline_choice_asked',
  reported: 'timeline_choice_reported',
  checked: 'timeline_choice_checked',
} as const;

/** The fixed choice wording per slot (§30.6). Exported for the validator test over every key. */
export function timelineChoiceText(choice: TimelineRow['choice'], name: string): string {
  return t(CHOICE_KEYS[choice], { name });
}
export const TIMELINE_CHOICE_KEYS = CHOICE_KEYS;

export function RedFlagTimeline({ rows, points, headingLevel = 2 }: { rows: readonly TimelineRow[]; points?: number | null; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  const name = arcName();
  return (
    <section aria-labelledby="timeline-h" data-timeline="">
      <H id="timeline-h" class={styles.name}>
        {t('reveal_timeline')}
      </H>
      <p class={styles.intro} data-timeline-header="">
        <strong>{t('timeline_header', { name })}</strong>
      </p>
      <ol class={styles.list}>
        {rows.map((x) => (
          <li key={x.slot} data-timeline-slot={x.slot}>
            <RichText text={t('reveal_slot', { slot: x.slot, tell: x.tell })} />
            <br />
            <span>{timelineChoiceText(x.choice, name)}</span>
          </li>
        ))}
      </ol>
      {points !== undefined && points !== null ? <p class={styles.intro}>{t('timeline_points', { points })}</p> : null}
    </section>
  );
}

function useHeadingFocus() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}

/** A finale step: the reveal on its own (an arc closed earlier by a report or a second Close, §30.6). */
export function RevealScreen({ names, onContinue }: { names: readonly string[]; onContinue: () => void }) {
  const heading = useHeadingFocus();
  return (
    <main class={styles.shell} data-finale-step="reveal">
      <h1 id="finale-reveal-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('finale_reveal_title')}
      </h1>
      <RevealCard names={names} headingLevel={2} />
      <p class={styles.intro}>{t('finale_reveal_tell')}</p>
      <p class={styles.intro}>{t('finale_reveal_habit')}</p>
      <button type="button" class={styles.primary} onClick={onContinue}>
        {t('app_continue')}
      </button>
    </main>
  );
}

/** A finale step: the red-flag timeline (all endings; B's walk-through is the same screen). */
export function TimelineScreen({ rows, points, onContinue }: { rows: readonly TimelineRow[]; points: number; onContinue: () => void }) {
  const heading = useHeadingFocus();
  return (
    <main class={styles.shell} data-finale-step="timeline">
      <h1 id="finale-timeline-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('finale_timeline_title')}
      </h1>
      <RedFlagTimeline rows={rows} points={points} />
      <button type="button" class={styles.primary} onClick={onContinue}>
        {t('app_continue')}
      </button>
    </main>
  );
}
