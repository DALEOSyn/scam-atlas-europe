/**
 * Chapter end (UI_SPEC §9.2, GDD §7): the postcard to Teo first (S3), then the stamp with the city ("Passport stamp: Berlin, gold"), the
 * plain-words summary "x of R", and what the next tier needs. Stamp art comes later.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { ChapterSummary } from '../engine/chapter.ts';
import type { IfThen } from '../engine/story.ts';
import { Postcard } from './Postcard.tsx';
import { RichText } from './RichText.tsx';
import { t, type MessageKey } from '../i18n/index.ts';
import styles from './DebriefView.module.css';

const NEED_KEYS: Record<NonNullable<ChapterSummary['nextTier']>['needs'][number], MessageKey> = {
  rating: 'tier_need_rating',
  genuine_reported: 'tier_need_genuine',
  spotted: 'tier_need_spotted',
  offfocus: 'tier_need_offfocus',
};

/** The boss's layer-1 lesson, repeated on the stamp screen [P] (Amsterdam QA h). */
export interface BossLesson {
  tell: string;
  whatWorks: string;
}

const TIER_WORD: Record<'bronze' | 'silver' | 'gold', MessageKey> = { bronze: 'stamp_word_bronze', silver: 'stamp_word_silver', gold: 'stamp_word_gold' };

export function ChapterDone({
  summary,
  city,
  postcard = null,
  boss = null,
  onBack,
}: {
  summary: ChapterSummary;
  /** The chapter's name ("Berlin"), also the postcard front's place. */
  city?: string;
  /** The chapter's postcard to Teo (S3): given for finishing, whatever the score. */
  postcard?: { ifThen: IfThen; backdrop?: string | undefined } | null;
  /** The chapter boss's tell and what works (layer 1), when the chapter has a boss. */
  boss?: BossLesson | null;
  onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const next = summary.nextTier;
  const stampKey: MessageKey = summary.stamp === 'gold' ? 'stamp_gold' : summary.stamp === 'silver' ? 'stamp_silver' : 'stamp_bronze';
  return (
    <main class={styles.debrief}>
      <section class={styles.layer1} aria-labelledby="chapter-done-heading">
        <h1 id="chapter-done-heading" ref={heading} tabIndex={-1} class={styles.h1}>
          {t('chapter_done_title')}
        </h1>
        {/* [P] The postcard comes first, right under the heading; the score follows (review T-S3 item 12). */}
        {postcard ? (
          <section aria-labelledby="chapter-postcard-h" data-chapter-postcard="">
            <h2 id="chapter-postcard-h">{t('chapter_done_postcard')}</h2>
            <Postcard ifThen={postcard.ifThen} city={city ?? ''} backdrop={postcard.backdrop} />
          </section>
        ) : null}
        {boss ? (
          <section aria-labelledby="chapter-boss-h" data-chapter-boss="">
            <h2 id="chapter-boss-h">{t('chapter_done_boss')}</h2>
            <p>
              <RichText text={boss.tell} />
            </p>
            <p>
              <strong>{t('debrief_what_works')} </strong>
              <RichText text={boss.whatWorks} />
            </p>
          </section>
        ) : null}
        {summary.stamp ? (
          <p>
            <strong data-stamp={summary.stamp}>{city ? t('stamp_city', { city, tier: t(TIER_WORD[summary.stamp]) }) : t(stampKey)}</strong>
          </p>
        ) : null}
        {summary.stamp === 'gold' ? <p>{t('stamp_gold_copy')}</p> : null}
        {next ? (
          <div>
            <p>{t(next.tier === 'gold' ? 'tier_next_gold' : 'tier_next_silver')}</p>
            <ul>
              {next.needs.map((n) => (
                <li key={n}>{t(NEED_KEYS[n], { n: next.spottedNeeded, net: Math.max(0, summary.spotted) })}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <p>
          {t('chapter_summary', {
            correct: summary.correctShown,
            total: summary.redFlags,
            wrong: summary.wrongTags,
            reported: summary.genuineReported,
            doubles: summary.doubleChecks,
          })}
        </p>
        <details class={styles.points}>
          <summary>{t('debrief_points')}</summary>
          <p>{t('chapter_rating', { rating: Math.round(summary.rating) })}</p>
        </details>
        <div class={styles.buttons}>
          <button type="button" class={styles.primary} onClick={onBack}>
            {t(city ? 'app_back_to_chapters' : 'app_back_to_title')}
          </button>
        </div>
      </section>
    </main>
  );
}
