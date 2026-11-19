/**
 * CR-38 (GDD §28.9): Fairmeasure, the in-world financial regulator. A home-screen tool in every chapter (the
 * HUD menu), never a link in a message. Two read-only lists, "Register of authorised firms" and "Warning
 * list", from content/brands.yaml (`register`); no search box, no input of any kind. A `check_official_list`
 * outcome shows its result card (`outcome.register`) as a plain list. The lesson the card always states:
 * not on the register means don't pay, and a clean warning list never makes a firm safe.
 *
 * Styling is the game's own neutral surface: no crest, flag, star ring or colour scheme of any real
 * regulator or EU body (Red Line 1).
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { RegisterEntry } from '../content/brands.ts';
import type { RegisterCard } from '../content/schema.ts';
import { t } from '../i18n/index.ts';
import styles from './Fairmeasure.module.css';

/** The one-time coach mark id (save.coachMarks). */
export const COACH_FAIRMEASURE = 'fairmeasure';

function Coach({ onSeen }: { onSeen: () => void }) {
  return (
    <div class={styles.coach} data-coach={COACH_FAIRMEASURE}>
      <p>{t('register_coach')}</p>
      <button type="button" class={styles.secondary} onClick={onSeen}>
        {t('coach_got_it')}
      </button>
    </div>
  );
}

/** The result lines of a card, in reading order (also its text alternative: a list). */
export function registerResultLines(card: RegisterCard): string[] {
  switch (card.result) {
    case 'authorised':
      return [
        t('register_result_authorised', { firm: card.firm }),
        ...(card.address || card.phone ? [t('register_contact_only')] : []),
        ...(card.address ? [t('register_address', { address: card.address })] : []),
        ...(card.phone ? [t('register_phone', { phone: card.phone })] : []),
      ];
    case 'not_listed':
      return [t('register_result_not_listed', { firm: card.firm }), t('register_warning_nothing'), t('register_not_listed_rule')];
    case 'warning_list':
      return [t('register_result_warning', { firm: card.firm }), t('register_warning_rule')];
  }
}

/** CR-38: the result card on the consequence step of a `check_official_list` outcome. */
export function RegisterResult({ card, coach, onCoachSeen }: { card: RegisterCard; coach: boolean; onCoachSeen: () => void }) {
  return (
    <section class={styles.card} aria-labelledby="register-result-h" data-register-result={card.result}>
      <h4 id="register-result-h" class={styles.cardTitle}>
        <span class={styles.wordmark}>{t('register_title')}</span> <span class={styles.sub}>{t('register_card_sub')}</span>
      </h4>
      {coach ? <Coach onSeen={onCoachSeen} /> : null}
      <ul class={styles.lines}>
        {registerResultLines(card).map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

type Tab = 'register' | 'warnings';

/** CR-38: the regulator view, a modal dialog over the scenario (the timer is frozen while it is open). */
export function FairmeasurePanel({ entries, onClose, coach, onCoachSeen }: { entries: readonly RegisterEntry[]; onClose: () => void; coach: boolean; onCoachSeen: () => void }) {
  const [tab, setTab] = useState<Tab>('register');
  const heading = useRef<HTMLHeadingElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tabs: [Tab, string][] = [
    ['register', t('register_tab_register')],
    ['warnings', t('register_tab_warnings')],
  ];
  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Modal: Tab stays inside the dialog.
      if (e.key !== 'Tab' || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>('button:not([tabindex="-1"])')];
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  /** ARIA tabs: arrows move between the two tabs and select them. */
  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const next: Tab = e.key === 'Home' ? 'register' : e.key === 'End' ? 'warnings' : tab === 'register' ? 'warnings' : 'register';
    setTab(next);
    box.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus();
  };
  const list = entries.filter((e) => (tab === 'register' ? e.status === 'authorised' : e.status === 'warning_list'));
  return (
    <div class={styles.layer}>
      <div class={styles.scrim} aria-hidden="true" onClick={onClose} />
      <div ref={box} class={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="register-h" data-register="">
        <h2 id="register-h" ref={heading} tabIndex={-1} class={styles.title}>
          <span class={styles.wordmark}>{t('register_title')}</span>
        </h2>
        <p class={styles.note}>{t('register_intro')}</p>
        {coach ? <Coach onSeen={onCoachSeen} /> : null}
        <div class={styles.tabs} role="tablist" aria-label={t('register_title')}>
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`register-tab-${id}`}
              class={styles.tab}
              aria-selected={tab === id}
              aria-controls={`register-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              data-tab={id}
              onClick={() => setTab(id)}
              onKeyDown={onTabKey}
            >
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`register-panel-${tab}`} aria-labelledby={`register-tab-${tab}`} class={styles.panel} data-register-panel={tab}>
          {list.length === 0 ? (
            <p class={styles.note}>{t('register_empty')}</p>
          ) : (
            <ul class={styles.entries}>
              {list.map((e) => (
                <li key={e.name} data-register-entry="">
                  <strong>{e.name}</strong>
                  {e.address ? <span>{t('register_address', { address: e.address })}</span> : null}
                  {e.phone ? <span>{t('register_phone', { phone: e.phone })}</span> : null}
                </li>
              ))}
            </ul>
          )}
          <p class={styles.rule}>{tab === 'register' ? t('register_not_listed_rule') : t('register_warning_clean_rule')}</p>
        </div>
        <div class={styles.buttons}>
          <button type="button" class={styles.primary} onClick={onClose} data-register-close="">
            {t('register_close')}
          </button>
        </div>
      </div>
    </div>
  );
}
