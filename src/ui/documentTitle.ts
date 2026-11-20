/**
 * Per-screen document titles (T-4.5 m4, WCAG 2.4.2 advisory): "<screen> · Scam Atlas: Europe", the game's
 * own name alone on the title screen. Screen-reader and tab-switching players hear where they are.
 */
import { useEffect } from 'preact/hooks';
import { t } from '../i18n/index.ts';

/** The document title for a screen name; empty or missing → the game's name alone. */
export function documentTitle(screen?: string | null): string {
  const app = t('app_title');
  const name = screen?.replace(/\s+/g, ' ').trim();
  return name ? t('doc_title', { screen: name, app }) : app;
}

/**
 * Sets document.title while a screen shows. `undefined` leaves the title alone (a parent that is not the
 * current screen); `null` is the game's name alone.
 */
export function useDocumentTitle(screen: string | null | undefined): void {
  useEffect(() => {
    if (screen === undefined || typeof document === 'undefined') return;
    document.title = documentTitle(screen);
  }, [screen]);
}
