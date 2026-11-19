/**
 * "Tell me now" reveal (GDD §10.2, §10.3 ending R): what the photo check shows, the red-flag timeline so
 * far (slot 1 says "Nothing to notice yet"), and the arc is closed. Neutral wording, no judgement.
 */
import { useEffect, useRef } from 'preact/hooks';
import { t } from '../i18n/index.ts';
import { RichText } from './RichText.tsx';
import styles from './ChapterList.module.css';

export function ArcReveal({ timeline, onContinue }: { timeline: { slot: number; tell: string }[]; onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <main class={styles.shell}>
      <h1 id="reveal-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('reveal_title')}
      </h1>
      <p class={styles.intro}>{t('reveal_body')}</p>
      {timeline.length > 0 ? (
        <section aria-labelledby="reveal-timeline-h">
          <h2 id="reveal-timeline-h" class={styles.name}>
            {t('reveal_timeline')}
          </h2>
          <ol class={styles.list}>
            {timeline.map((x) => (
              <li key={x.slot}>
                <RichText text={t('reveal_slot', { slot: x.slot, tell: x.tell })} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      <p class={styles.intro}>{t('reveal_closed')}</p>
      <button type="button" class={styles.primary} onClick={onContinue}>
        {t('app_continue')}
      </button>
    </main>
  );
}
