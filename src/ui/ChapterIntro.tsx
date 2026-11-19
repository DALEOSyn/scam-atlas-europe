/**
 * Chapter intro (CR-27, producer ruling): shown on every chapter start from its first scenario, after
 * the Arrival scene when there is one. h1 = the chapter title (focused on arrival), the chapter's `intro`
 * text, then its optional `rules` as a framed "pinned card" (h2 + numbered list; psych M1), one primary
 * button and a quiet way back to the map. A resumed run of a chapter with `rules` shows it again with
 * "Continue" (psych M2), so the rules the player is scored on are never lost.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { Chapter } from '../content/schema.ts';
import { t } from '../i18n/index.ts';
import styles from './ChapterList.module.css';

export function ChapterIntro({
  name,
  intro,
  rules,
  resume = false,
  onStart,
  onBack,
}: {
  name: string;
  intro: string;
  rules?: Chapter['rules'];
  resume?: boolean;
  onStart: () => void;
  onBack?: (() => void) | undefined;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const paragraphs = intro.split(/\n\s*\n/u).map((x) => x.trim()).filter(Boolean);
  return (
    <main class={styles.shell}>
      <section class={styles.row} aria-labelledby="chapter-intro-h" data-chapter-intro="">
        <h1 id="chapter-intro-h" ref={heading} tabIndex={-1} class={styles.title}>
          {name}
        </h1>
        {paragraphs.map((p, i) => (
          <p key={i} class={styles.intro}>
            {p}
          </p>
        ))}
        {rules ? (
          <section class={styles.pinned} aria-labelledby="chapter-rules-h" data-chapter-rules="">
            <h2 id="chapter-rules-h" class={styles.pinnedTitle}>
              {rules.title}
            </h2>
            <ol class={styles.pinnedList}>
              {rules.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </section>
        ) : null}
        <div class={styles.buttons}>
          <button type="button" class={styles.primary} onClick={onStart}>
            {t(resume ? 'chapter_intro_continue' : 'chapter_intro_start')}
          </button>
          {onBack ? (
            <button type="button" class={styles.quiet} data-chapter-intro-back="" onClick={onBack}>
              {t('chapter_intro_back')}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
