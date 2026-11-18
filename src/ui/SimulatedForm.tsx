/**
 * The ONLY way to render a <form> in this game (enforced by ESLint and a unit
 * test). Red Line 2: game forms never send data anywhere.
 *  - no `action`/`method` props exist, and none are rendered;
 *  - submit is always preventDefault-ed and routed to game logic;
 *  - typed values are never read or passed on (no personal data is collected);
 *  - a visible label marks the form as part of the game.
 */
import type { ComponentChildren } from 'preact';
import { t } from '../i18n/index.ts';
import styles from './SimulatedForm.module.css';

export interface SimulatedFormProps {
  /** Accessible name of the form. */
  label: string;
  /** Called on submit with no form data; route to the scenario's outcome logic. */
  onSimulatedSubmit: () => void;
  children: ComponentChildren;
}

export function SimulatedForm({ label, onSimulatedSubmit, children }: SimulatedFormProps) {
  return (
    <form
      class={styles.form}
      aria-label={label}
      data-simulated="true"
      autoComplete="off"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSimulatedSubmit();
      }}
    >
      <p class={styles.badge}>{t('form.simulated')}</p>
      {children}
    </form>
  );
}
