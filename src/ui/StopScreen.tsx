/**
 * Half-day stop screen (UI_SPEC §8.3, FI-2): after the morning block. "Keep going" plays on; "Back to
 * the chapters" leaves (progress is saved after every scenario; on resume stress starts at Calm).
 */
import { useEffect, useRef } from 'preact/hooks';
import { t } from '../i18n/index.ts';
import styles from './ChapterList.module.css';
import { useDocumentTitle } from './documentTitle.ts';

export function StopScreen({ done, total, left, onKeepGoing, onBack }: { done: number; total: number; left: number; onKeepGoing: () => void; onBack: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useDocumentTitle(t('stop_title'));
  useEffect(() => heading.current?.focus(), []);
  return (
    <main class={styles.shell}>
      <section class={styles.row} aria-labelledby="stop-h" data-stop="">
        <h1 id="stop-h" ref={heading} tabIndex={-1} class={styles.title}>
          {t('stop_title')}
        </h1>
        <p class={styles.intro}>{t('stop_body', { count: left })}</p>
        <p class={styles.dots}>
          <span aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (i < done ? '●' : '○')).join(' ')}
          </span>{' '}
          <span>{t('stop_progress', { done, total })}</span>
        </p>
        <div class={styles.buttons}>
          <button type="button" class={styles.primary} onClick={onKeepGoing}>
            {t('stop_keep_going')}
          </button>
          <button type="button" class={styles.secondary} onClick={onBack}>
            {t('stop_back')}
          </button>
        </div>
      </section>
    </main>
  );
}
