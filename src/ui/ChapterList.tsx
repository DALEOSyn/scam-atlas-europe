/**
 * Chapters (UI_SPEC §9.3 "Chapters" list, the primary keyboard and screen-reader path; QA B1). Until the
 * illustrated map exists this list is the map: every chapter with its state, locked ones marked
 * "Locked" (never score-gated, GDD §11), and a button to play, continue or replay each unlocked one.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { Stamp } from '../engine/chapter.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import styles from './ChapterList.module.css';

export interface ChapterRow {
  city: string;
  name: string;
  locked: boolean;
  /** The chapter to finish first (for "Locked: finish Home first"). */
  lockedBy: string | null;
  inProgress: boolean;
  finished: boolean;
  stamp: Stamp | null;
}

const STAMP_WORD: Record<Stamp, MessageKey> = { bronze: 'stamp_word_bronze', silver: 'stamp_word_silver', gold: 'stamp_word_gold' };

export function ChapterList({ rows, onPlay, onBack }: { rows: ChapterRow[]; onPlay: (city: string) => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <main class={styles.shell}>
      <h1 id="chapters-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('chapters_title')}
      </h1>
      <p class={styles.intro}>{t('chapters_intro')}</p>
      <ol class={styles.list} aria-labelledby="chapters-h">
        {rows.map((r) => {
          const status = r.locked
            ? t('chapter_locked', { previous: r.lockedBy ?? '' })
            : r.inProgress
              ? t('chapter_in_progress')
              : r.finished
                ? t('chapter_finished', { stamp: r.stamp ? t(STAMP_WORD[r.stamp]) : '' })
                : t('chapter_new');
          return (
            <li key={r.city} class={r.locked ? `${styles.row} ${styles.locked}` : styles.row} data-chapter={r.city}>
              <h2 class={styles.name}>{r.name}</h2>
              <p class={styles.status}>{status}</p>
              {!r.locked ? (
                <button type="button" class={r.finished && !r.inProgress ? styles.secondary : styles.primary} onClick={() => onPlay(r.city)}>
                  {t(r.inProgress ? 'chapter_continue' : r.finished ? 'chapter_replay' : 'chapter_play', { city: r.name })}
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
      <button type="button" class={styles.secondary} onClick={onBack}>
        {t('app_back_to_title')}
      </button>
    </main>
  );
}
