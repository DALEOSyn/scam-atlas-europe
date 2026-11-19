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
  /** Content note shown on the map before the chapter (STORY §5.6). */
  note?: string | null;
  /** The player has seen some of this chapter's story scenes: offer "Story scenes" (replay). */
  replay?: boolean;
}

const STAMP_WORD: Record<Stamp, MessageKey> = { bronze: 'stamp_word_bronze', silver: 'stamp_word_silver', gold: 'stamp_word_gold' };

/** Where focus lands when coming back (review T-S3 item 16): the button that opened the page we left. */
export type ChapterListFocus = { kind: 'atlas' } | { kind: 'replay'; city: string };

export function ChapterList({
  rows,
  focus,
  onPlay,
  onReplay,
  onAtlas,
  onBack,
}: {
  rows: ChapterRow[];
  focus?: ChapterListFocus | undefined;
  onPlay: (city: string) => void;
  onReplay?: (city: string) => void;
  /** "Waymarker Atlas" (item 23): shown once a postcard is collected. */
  onAtlas?: (() => void) | undefined;
  onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const sel = focus?.kind === 'atlas' ? '[data-chapters-atlas]' : focus?.kind === 'replay' ? `[data-replay-chapter="${focus.city}"]` : null;
    const btn = sel ? main.current?.querySelector<HTMLElement>(sel) : null;
    (btn ?? heading.current)?.focus();
  }, []);
  return (
    <main class={styles.shell} ref={main}>
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
              {r.note ? (
                <p class={styles.status} data-content-note={r.city}>
                  {t('chapter_content_note', { note: r.note })}
                </p>
              ) : null}
              {!r.locked ? (
                <button type="button" class={r.finished && !r.inProgress ? styles.secondary : styles.primary} onClick={() => onPlay(r.city)}>
                  {t(r.inProgress ? 'chapter_continue' : r.finished ? 'chapter_replay' : 'chapter_play', { city: r.name })}
                </button>
              ) : null}
              {r.replay && onReplay ? (
                <button type="button" class={styles.secondary} data-replay-chapter={r.city} onClick={() => onReplay(r.city)}>
                  {t('chapters_story', { city: r.name })}
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
      {onAtlas ? (
        <button type="button" class={styles.secondary} data-chapters-atlas="" onClick={onAtlas}>
          {t('atlas_open')}
        </button>
      ) : null}
      <button type="button" class={styles.secondary} onClick={onBack}>
        {t('app_back_to_title')}
      </button>
    </main>
  );
}
