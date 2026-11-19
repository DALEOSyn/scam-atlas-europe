/**
 * Settings (UI_SPEC §11, §4.8, §6.1; QA M7): timing (Standard / Extended / Off), the Calm preset, pushy
 * follow-ups, call lines and "Always show translations". All of them live in the save (localStorage
 * only). Reached from the in-game menu (a modal dialog that freezes the timer) and from the start
 * screen. Timer and follow-up changes apply from the next message: a running message keeps the
 * pressure it started with, so nothing changes under the player's hands mid-decision.
 */
import { useEffect, useRef } from 'preact/hooks';
import type { Settings } from '../engine/save.ts';
import { calmPreset } from '../engine/save.ts';
import type { TimerMode } from '../engine/timer.ts';
import { t } from '../i18n/index.ts';
import styles from './Settings.module.css';

export interface SettingsPanelProps {
  settings: Settings;
  /** The timer mode in effect when none was chosen yet (Extended under reduced motion, §6.1). */
  defaultTimer: TimerMode;
  onChange: (next: Settings) => void;
  onClose: () => void;
  /** In a scenario: a modal dialog over the game. On the start screen: a page section. */
  modal?: boolean;
  /** A message is on screen: say that timer and follow-up changes apply from the next one. */
  inScenario?: boolean;
}

const TIMER_KEYS = { standard: 'timing_standard', extended: 'timing_extended', off: 'timing_off' } as const;

export function SettingsPanel({ settings, defaultTimer, onChange, onClose, modal = false, inScenario = false }: SettingsPanelProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => heading.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      // Modal: Tab stays inside the dialog.
      if (!modal || e.key !== 'Tab' || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>('button, input')].filter((x) => !x.hasAttribute('disabled'));
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
  }, [onClose, modal]);
  const timer = settings.timerMode ?? defaultTimer;
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const panel = (
    <div
      ref={box}
      class={modal ? `${styles.panel} ${styles.dialog}` : styles.panel}
      role={modal ? 'dialog' : undefined}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby="settings-h"
      data-settings=""
    >
      <h2 id="settings-h" ref={heading} tabIndex={-1} class={styles.title}>
        {t('settings_title')}
      </h2>
      {inScenario ? <p class={styles.note}>{t('settings_next_message')}</p> : null}
      <fieldset class={styles.group}>
        <legend>{t('settings_timing')}</legend>
        {(['standard', 'extended', 'off'] as const).map((m) => (
          <label key={m} class={styles.option}>
            <input type="radio" name="settings-timer" value={m} checked={timer === m} onChange={() => set({ timerMode: m })} />
            <span>{t(TIMER_KEYS[m])}</span>
          </label>
        ))}
      </fieldset>
      <fieldset class={styles.group}>
        <legend>{t('settings_pushers')}</legend>
        {([true, false] as const).map((on) => (
          <label key={String(on)} class={styles.option}>
            <input type="radio" name="settings-pushers" checked={settings.pushers === on} onChange={() => set({ pushers: on })} />
            <span>{t(on ? 'settings_on' : 'settings_off')}</span>
          </label>
        ))}
      </fieldset>
      <fieldset class={styles.group}>
        <legend>{t('settings_call_lines')}</legend>
        {(['auto', 'step'] as const).map((v) => (
          <label key={v} class={styles.option}>
            <input type="radio" name="settings-call-lines" checked={settings.callLines === v} onChange={() => set({ callLines: v })} />
            <span>{t(v === 'auto' ? 'settings_call_lines_auto' : 'settings_call_lines_step')}</span>
          </label>
        ))}
      </fieldset>
      <label class={`${styles.option} ${styles.check}`}>
        <input type="checkbox" checked={settings.alwaysTranslate} onChange={(e) => set({ alwaysTranslate: (e.currentTarget as HTMLInputElement).checked })} />
        <span>{t('settings_always_translate')}</span>
      </label>
      <div class={styles.buttons}>
        <button type="button" class={styles.secondary} onClick={() => onChange(calmPreset(settings))}>
          {t('timing_calm')}
        </button>
        <button type="button" class={styles.primary} onClick={onClose}>
          {t('settings_done')}
        </button>
      </div>
    </div>
  );
  if (!modal) return panel;
  return (
    <div class={styles.layer}>
      <div class={styles.scrim} aria-hidden="true" onClick={onClose} />
      {panel}
    </div>
  );
}
