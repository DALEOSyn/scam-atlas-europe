/**
 * "Tell me now" reveal (GDD §10.2, §10.3 ending R): what the photo check shows (CR-43(b): the reveal card, reused
 * from the finale, when the finale's names are bundled), the red-flag timeline so far with the finale's fixed
 * choice wording (CR-43(c); slot 1 says "Nothing to notice yet"), and the arc is closed. Neutral wording, no judgement.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { TimelineRow } from '../engine/arc.ts';
import { t } from '../i18n/index.ts';
import { RedFlagTimeline, RevealCard } from './ArcFinale.tsx';
import styles from './ChapterList.module.css';
import { useDocumentTitle } from './documentTitle.ts';

export function ArcReveal({ timeline, names = null, onContinue }: { timeline: TimelineRow[]; names?: readonly string[] | null; onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useDocumentTitle(t('reveal_title'));
  useEffect(() => heading.current?.focus(), []);
  return (
    <main class={styles.shell}>
      <h1 id="reveal-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('reveal_title')}
      </h1>
      <p class={styles.intro}>{t('reveal_body')}</p>
      {names ? <RevealCard names={names} headingLevel={2} /> : null}
      {timeline.length > 0 ? <RedFlagTimeline rows={timeline} /> : null}
      <p class={styles.intro}>{t('reveal_closed')}</p>
      <button type="button" class={styles.primary} onClick={onContinue}>
        {t('app_continue')}
      </button>
    </main>
  );
}
