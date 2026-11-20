/**
 * HUD (UI_SPEC §2.1, §6): progress · timer · stress · Pause · menu. Timer, stress word, Pause and menu
 * never leave it. The timer is announced only at thresholds (role=timer, aria-live off); a "Time left"
 * item in the menu reads it on demand. Pause opens the non-modal "Take a breath" panel.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import type { RunnerView } from '../engine/runner.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import { Icon } from './Icon.tsx';
import styles from './Hud.module.css';

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const STRESS: Record<RunnerView['stress']['state'], { word: MessageKey; text: MessageKey; icon: 'stress-calm' | 'stress-tense' | 'stress-overwhelmed'; segs: number }> = {
  calm: { word: 'stress_word_calm', text: 'stress_calm', icon: 'stress-calm', segs: 1 },
  tense: { word: 'stress_word_tense', text: 'stress_tense', icon: 'stress-tense', segs: 2 },
  overwhelmed: { word: 'stress_word_overwhelmed', text: 'stress_overwhelmed', icon: 'stress-overwhelmed', segs: 3 },
};

export interface HudMenu {
  checkMode: boolean;
  onCheckMode: (on: boolean) => void;
  callLines: 'auto' | 'step';
  onCallLines: (v: 'auto' | 'step') => void;
  onTimeLeft: () => void;
  onQuit: () => void;
  onOpen: (open: boolean) => void;
  /** Opens Settings (QA M7); absent when there is nowhere to save them. */
  onSettings?: (() => void) | undefined;
  /** CR-38: opens the Fairmeasure regulator view (a home-screen tool in every chapter). */
  onRegister?: (() => void) | undefined;
  /** CR-38: the regulator's name from the brand registry. */
  registerName?: string | undefined;
}

export function Hud({ view, progress, chip, timersOff, onPause, menu }: { view: RunnerView; progress: { index: number; total: number } | null; chip: string | null; timersOff: boolean; onPause: () => void; menu: HudMenu }) {
  const s = STRESS[view.stress.state];
  const timer = view.timer;
  const low = !!timer && timer.remaining <= 10;
  const overwhelmed = view.stress.state === 'overwhelmed';
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggle = (on: boolean) => {
    setOpen(on);
    menu.onOpen(on);
  };
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // T-4.5 B1: the menu is about to be hidden; if it holds focus, hand focus back to its button
      // (as Settings and Fairmeasure do), never to <body>.
      const wrap = menuRef.current;
      const inside = !!wrap && wrap.contains(document.activeElement);
      toggle(false);
      if (inside) wrap?.querySelector<HTMLButtonElement>('[data-hud="menu"]')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  return (
    <header class={styles.hud}>
      {progress ? (
        <span class={styles.progress} role="img" aria-label={t('progress_label', { n: progress.index, total: progress.total })}>
          {progress.index}/{progress.total}
        </span>
      ) : null}
      {timer ? (
        <span class={low ? `${styles.timer} ${styles.low}` : styles.timer} role="timer" aria-live="off" aria-label={t('timer_label')}>
          <Icon name={timer.frozen ? 'breath' : 'hourglass'} size={16} />
          <span>{low ? t('timer_value_low', { time: formatTime(timer.remaining) }) : formatTime(timer.remaining)}</span>
          {timer.coachMark ? (
            // One HUD row at 320–375 px (review T-S3 item 5): "Paused" below 400 px, "Paused: tip open" above;
            // the full sentence for screen readers.
            <>
              <span class={`${styles.frozenNote} ${styles.frozenWide}`} aria-hidden="true" data-frozen="wide">{t('coach_frozen_short')}</span>
              <span class={`${styles.frozenNote} ${styles.frozenNarrow}`} aria-hidden="true" data-frozen="narrow">{t('coach_frozen_tiny')}</span>
              <span class={styles.vh}> {t('coach_frozen')}</span>
            </>
          ) : timer.frozen ? <span class={styles.vh}> {t('timer_paused')}</span> : null}
          <span class={styles.bar} aria-hidden="true">
            <span style={{ width: `${Math.max(0, Math.min(100, (timer.remaining / Math.max(1, timer.length)) * 100))}%` }} />
          </span>
          {chip ? (
            <span class={styles.chip} aria-hidden="true">
              {chip}
            </span>
          ) : null}
        </span>
      ) : timersOff ? (
        <span class={styles.timer}>
          <Icon name="breath" size={16} />
          <span>{t('timers_off')}</span>
        </span>
      ) : null}
      <span class={styles.stress} role="meter" aria-label={t('stress_label')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(view.stress.value)} aria-valuetext={t(s.text)}>
        <Icon name={s.icon} size={18} />
        <span class={styles.segs} aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <i key={i} class={i <= s.segs ? styles.filled : undefined} />
          ))}
        </span>
        <span aria-hidden="true">{t(s.word)}</span>
      </span>
      <span class={styles.grow} />
      <button
        type="button"
        class={overwhelmed ? `${styles.button} ${styles.breathe}` : styles.button}
        aria-disabled={!view.pause.available}
        data-hud="pause"
        onClick={() => view.pause.available && onPause()}
      >
        <Icon name="breath" />
        <span class={styles.label}>{view.pause.available ? (overwhelmed ? t('pause_breath') : t('pause')) : t('pause_cooldown', { seconds: Math.ceil(view.pause.cooldownLeft) })}</span>
      </button>
      <div
        class={styles.menuWrap}
        ref={menuRef}
        onFocusOut={(e) => {
          // T-4.5 m2: Tabbing out of the open menu closes it, so it never covers what gets focus next.
          // Only when focus lands on a known element outside: a click that drops focus to nothing
          // (relatedTarget null, e.g. Safari) must not hide the menu before its item's click fires.
          const next = e.relatedTarget;
          if (open && next instanceof Node && !e.currentTarget.contains(next)) toggle(false);
        }}
      >
        <button type="button" class={styles.button} aria-expanded={open} aria-controls="hud-menu" data-hud="menu" onClick={() => toggle(!open)}>
          <Icon name="menu" />
          <span class={styles.label}>{t('menu')}</span>
        </button>
        <div id="hud-menu" class={styles.menu} hidden={!open}>
          {timer ? (
            <button type="button" class={styles.menuItem} onClick={menu.onTimeLeft}>
              {t('menu_time_left')}
            </button>
          ) : null}
          <button type="button" class={styles.menuItem} aria-pressed={menu.checkMode} onClick={() => menu.onCheckMode(!menu.checkMode)}>
            {t('check_mode')}
          </button>
          <button type="button" class={styles.menuItem} aria-pressed={menu.callLines === 'step'} onClick={() => menu.onCallLines(menu.callLines === 'step' ? 'auto' : 'step')}>
            {t('menu_call_lines_step')}
          </button>
          {menu.onRegister ? (
            <button
              type="button"
              class={styles.menuItem}
              data-menu="register"
              onClick={() => {
                toggle(false);
                menu.onRegister?.();
              }}
            >
              {t('register_menu', { name: menu.registerName ?? '' })}
            </button>
          ) : null}
          {menu.onSettings ? (
            <button
              type="button"
              class={styles.menuItem}
              data-menu="settings"
              onClick={() => {
                toggle(false);
                menu.onSettings?.();
              }}
            >
              {t('menu_settings')}
            </button>
          ) : null}
          <button type="button" class={styles.menuItem} onClick={menu.onQuit}>
            {t('menu_quit')}
          </button>
        </div>
      </div>
    </header>
  );
}

/** "Take a breath" (UI_SPEC §6.4): non-modal, takes no focus, never traps it. Words are not a live region. */
export function BreathPanel({ onBack }: { onBack: () => void }) {
  const [left, setLeft] = useState(5);
  useEffect(() => {
    const id = setInterval(() => setLeft((n) => Math.max(1, n - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const inhale = left > 2;
  return (
    <div class={styles.breath} data-breath="">
      <div class={styles.circle} aria-hidden="true" />
      <p class={styles.breathWord} aria-hidden="true">
        {inhale ? t('breath_in') : t('breath_out')} · {left}
      </p>
      <p>{t('pause_copy')}</p>
      <button type="button" class={styles.button} onClick={onBack}>
        {t('pause_back')}
      </button>
    </div>
  );
}
