/**
 * Chapter intro (CR-27, producer ruling): shown once on every chapter start from its first scenario,
 * after the Arrival scene when there is one. h1 = the chapter title (focused on arrival), the chapter's
 * `intro` text (it holds the rules the player is scored on, e.g. Ruchelune's payment procedure), and one
 * "Start" button.
 */
import { useEffect, useRef } from 'preact/hooks';
import { t } from '../i18n/index.ts';
import styles from './ChapterList.module.css';

export function ChapterIntro({ name, intro, onStart }: { name: string; intro: string; onStart: () => void }) {
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
        <div class={styles.buttons}>
          <button type="button" class={styles.primary} onClick={onStart}>
            {t('chapter_intro_start')}
          </button>
        </div>
      </section>
    </main>
  );
}
