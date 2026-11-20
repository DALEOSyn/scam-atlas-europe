/**
 * Chapter intro (CR-27, producer ruling): shown on every chapter start from its first scenario, after
 * the Arrival scene when there is one. h1 = the chapter title (focused on arrival), the chapter's `intro`
 * text, then its optional `rules` as a framed "pinned card" (h2 + numbered list; psych M1), one primary
 * button and a quiet way back to the map. A resumed run of a chapter with `rules` shows it again with
 * "Continue" (psych M2), so the rules the player is scored on are never lost.
 *
 * CR-48b: below the buttons, an optional, collapsed "How stamps work" disclosure (h2 > button with
 * aria-expanded, WAI disclosure pattern; no animation): bronze, silver and gold in player words, the
 * R24 rule line, and that stamps are about habits. Never a count of the player's own slips.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Chapter } from '../content/schema.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import { Icon } from './Icon.tsx';
import styles from './ChapterList.module.css';
import { useDocumentTitle } from './documentTitle.ts';

/** CR-48b: the "How stamps work" bullets, in order (≤ 5). */
export const STAMPS_HELP_KEYS: readonly MessageKey[] = ['stamps_help_bronze', 'stamps_help_silver', 'stamps_help_gold', 'stamps_help_slip', 'stamps_help_habits'];

export function StampsHelp() {
  const [open, setOpen] = useState(false);
  return (
    <section class={styles.stampsHelp} data-stamps-help="">
      <h2 class={styles.stampsHelpHeading}>
        <button type="button" class={styles.stampsHelpToggle} aria-expanded={open} aria-controls="stamps-help-panel" onClick={() => setOpen(!open)}>
          <Icon name="seal" />
          <span>{t('stamps_help_title')}</span>
        </button>
      </h2>
      <ul id="stamps-help-panel" class={styles.stampsHelpList} hidden={!open}>
        {STAMPS_HELP_KEYS.map((k) => (
          <li key={k}>{t(k)}</li>
        ))}
      </ul>
    </section>
  );
}

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
  useDocumentTitle(name);
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
        <StampsHelp />
      </section>
    </main>
  );
}
