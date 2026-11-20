/**
 * CR-44(b): the end screen "Your Atlas" (GDD §30.5, STORY §1.5, §3.10), after the finale's chapter end.
 * - Opens with Adaeze's last line as its epigraph (the resolution panel marked `epigraph`).
 * - Every city's If-then line in the order played (reusing AtlasPages).
 * - The habit cards earned; a mastered card carries a small gold mark (a label on the card, never a count).
 * - The help list ("Where to report and get help"): the per-country cards (HelpCards, T-4.2), scam order.
 * - Printable (the browser's own print). No ranking, no totals, no amounts, no streaks, no scores.
 */
import { useEffect, useRef } from 'preact/hooks';
import { castMember } from '../content/cast.ts';
import { allHabitCards } from '../content/habitCards.ts';
import { habitStatus, type HabitProgress } from '../engine/habits.ts';
import type { AtlasPage } from '../engine/story.ts';
import { t } from '../i18n/index.ts';
import { AtlasPages } from './Atlas.tsx';
import { HelpCards } from './HelpCards.tsx';
import styles from './Scene.module.css';

export interface EndScreenProps {
  epigraph: { speaker: string; line: string } | null;
  pages: readonly AtlasPage[];
  habits: Readonly<Record<string, HabitProgress>>;
  onBack: () => void;
}

/** Habit cards earned (in content order) and whether each is mastered (the gold mark). */
export function earnedCards(habits: Readonly<Record<string, HabitProgress>>): { id: string; title: string; habit: string; gold: boolean }[] {
  return allHabitCards().flatMap((c) => {
    const status = habitStatus(habits[c.lo]);
    return status === 'locked' ? [] : [{ id: c.id, title: c.title, habit: c.habit, gold: status === 'mastered' }];
  });
}

export function EndScreen({ epigraph, pages, habits, onBack }: EndScreenProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const cards = earnedCards(habits);
  const speaker = epigraph ? castMember(epigraph.speaker)?.name.split(/\s+/u)[0] : undefined;
  return (
    <main class={styles.shell} data-end-screen="">
      <section class={styles.scene} aria-labelledby="end-h">
        <h1 id="end-h" ref={heading} tabIndex={-1} class={styles.title}>
          {t('end_title')}
        </h1>
        {epigraph ? (
          <figure class={styles.epigraph} data-epigraph="">
            <blockquote>
              <p>{epigraph.line}</p>
            </blockquote>
            {speaker ? <figcaption>{t('end_epigraph_by', { name: speaker })}</figcaption> : null}
          </figure>
        ) : null}
        <section aria-labelledby="end-lines-h">
          <h2 id="end-lines-h">{t('end_lines')}</h2>
          {pages.length > 0 ? <AtlasPages pages={pages} headingLevel={3} /> : <p>{t('atlas_empty')}</p>}
        </section>
        {cards.length > 0 ? (
          <section aria-labelledby="end-cards-h">
            <h2 id="end-cards-h">{t('end_cards')}</h2>
            <ul class={styles.endCards}>
              {cards.map((c) => (
                <li key={c.id} data-end-card={c.id} data-gold={c.gold ? '' : undefined}>
                  <strong>{c.title}</strong>
                  {c.gold ? (
                    <span class={styles.goldMark} data-gold-mark="">
                      {' '}
                      <span aria-hidden="true">●</span> {t('end_card_mastered')}
                    </span>
                  ) : null}
                  <p>{c.habit}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section aria-labelledby="end-help-h">
          <h2 id="end-help-h">{t('help_title')}</h2>
          <HelpCards level={3} />
        </section>
        <div class={styles.buttons}>
          <button type="button" class={styles.secondary} data-end="print" onClick={() => (typeof window.print === 'function' ? window.print() : undefined)}>
            {t('end_print')}
          </button>
          <button type="button" class={styles.primary} onClick={onBack}>
            {t('end_back')}
          </button>
        </div>
      </section>
    </main>
  );
}
