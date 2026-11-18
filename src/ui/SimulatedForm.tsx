/**
 * The ONLY way to render a <form> in this game (enforced by ESLint and a unit
 * test). Red Line 2: game forms never send data anywhere.
 *  - no `action`/`method` props exist, and none are rendered;
 *  - submit is always preventDefault-ed and routed to game logic;
 *  - typed values are never read or passed on (no personal data is collected);
 *  - every form is visibly a training page (UI_SPEC §5): dashed frame, watermark,
 *    the demo note, and the SIMULATION pill on the page (SimPill).
 * The production CSP adds form-action 'none' as a second barrier.
 */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { t } from '../i18n/index.ts';
import styles from './SimulatedForm.module.css';

export interface SimulatedFormProps {
  /** Accessible name of the form. */
  label: string;
  /** Called on submit with no form data; route to the scenario's outcome logic. */
  onSimulatedSubmit: () => void;
  children: ComponentChildren;
}

/** Shared note id: every demo field and a disabled submit point at it (UI_SPEC §5.2). */
export const DEMO_NOTE_ID = 'demo-note';

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
      <div class={styles.watermark} aria-hidden="true" />
      <div class={styles.content}>
        {children}
        <p id={DEMO_NOTE_ID} class={styles.note}>
          {t('form_demo_note')}
        </p>
      </div>
    </form>
  );
}

/** A read-only demo value styled like a field. Never an <input>: browsers and password managers never react. */
export function DemoField({ id, label, value, spoken }: { id: string; label: string; value: string; spoken?: string }) {
  return (
    <div class={styles.field}>
      <span class={styles.label} id={`${id}-label`}>
        {label}
      </span>
      <div class={styles.value} role="textbox" aria-readonly="true" aria-labelledby={`${id}-label`} aria-describedby={DEMO_NOTE_ID}>
        {spoken ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span class={styles.vh}>{spoken}</span>
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

/** "SIMULATION · nothing is sent" pill (UI_SPEC §5.1, §5.3); opens a short explainer. */
export function SimPill() {
  const [open, setOpen] = useState(false);
  return (
    <div class={styles.pillWrap}>
      <button type="button" class={styles.pill} aria-describedby="sim-desc" aria-expanded={open} aria-controls="sim-explainer" onClick={() => setOpen(!open)}>
        <span>{t('sim_pill')}</span>
        <span class={styles.long}>{t('sim_pill_long')}</span>
      </button>
      <p id="sim-desc" class={styles.vh}>
        {t('sim_desc')}
      </p>
      <p id="sim-explainer" class={styles.explainer} hidden={!open}>
        {t('sim_desc')}
      </p>
    </div>
  );
}
