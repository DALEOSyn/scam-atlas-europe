/**
 * Check (magnifier) and tag ("Mark as suspicious"), UI_SPEC §4.
 *
 * - Every visible element of the beat on screen is a native <button> (Checkable) in reading order.
 *   Mouse click, keyboard and screen-reader activation open the Check card; on touch a plain tap only
 *   shows a hint, a long-press (or a tap in Check mode) opens it (§4.2). Hovering reveals nothing.
 * - The card shows facts, never verdicts: what you see, where it really goes (owner part boxed),
 *   the authored reveal or "Nothing unusual here", and the tag toggle (only after a check).
 * - "Details you can check" lists the same elements and never shows a total.
 */
import { createContext, type ComponentChildren } from 'preact';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { CheckableView } from '../../engine/runner.ts';
import { t } from '../../i18n/index.ts';
import { Icon } from '../Icon.tsx';
import { elementLabel, isAddress, isIdentifier } from '../labels.ts';
import { Host, RichText, spokenNumber } from '../RichText.tsx';
import { isMasked } from '../text.ts';
import styles from './check.module.css';

export interface CheckApi {
  /** Checkables of the beat on screen, by target. Elements not in here render as plain text. */
  items: ReadonlyMap<string, CheckableView>;
  checkMode: boolean;
  /** Visible text of an element before it is checked (e.g. the display name, not the address behind it). */
  visible: (c: CheckableView) => string;
  open: (target: string, el: HTMLElement) => void;
  /** Touch tap without Check mode: show the hint toast. */
  hint: () => void;
}

export const CheckContext = createContext<CheckApi | null>(null);

const LONG_PRESS_MS = 450;

/**
 * The text a screen reader would read for this element's content: text nodes in order, skipping
 * aria-hidden parts and the state suffix, using an inner aria-label where there is one.
 */
export function contentName(el: Element): string {
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) out += n.textContent ?? '';
    else if (n instanceof Element) {
      if (n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('data-state-text')) continue;
      out += n.getAttribute('aria-label') ?? contentName(n);
    }
  }
  return out.replace(/\s+/gu, ' ').trim();
}

/** An inline checkable element. Outside the beat on screen it renders as plain text. */
export function Checkable({ target, children, class: cls, name }: { target: string; children: ComponentChildren; class?: string; name?: string }) {
  const api = useContext(CheckContext);
  const item = api?.items.get(target);
  const touch = useRef<{ timer: ReturnType<typeof setTimeout> | null; fired: boolean; isTouch: boolean }>({ timer: null, fired: false, isTouch: false });
  const [holding, setHolding] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  /** The content's name, read from the DOM once a state is shown (Amsterdam QA n). */
  const [auto, setAuto] = useState<string | null>(null);
  const state = item ? (item.tagged ? t('state_marked') : item.checked ? t('state_checked') : null) : null;
  useLayoutEffect(() => {
    const el = button.current;
    const next = el && state && !name ? contentName(el) : null;
    if (next !== auto) setAuto(next);
  });
  useEffect(() => () => {
    if (touch.current.timer) clearTimeout(touch.current.timer);
  }, []);
  if (!api || !item) return <span class={cls}>{children}</span>;

  const stop = () => {
    if (touch.current.timer) clearTimeout(touch.current.timer);
    touch.current.timer = null;
    setHolding(false);
  };
  const classes = [styles.checkable, api.checkMode ? styles.mode : '', item.checked ? styles.checked : '', item.tagged ? styles.tagged : '', cls ?? ''].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      class={classes}
      data-check={target}
      ref={button}
      // A visually hidden ", checked" span inside the content made browsers compute "…forget! , checked"
      // (a space before the comma, Amsterdam QA n). With a state shown, the name is built as one string.
      aria-label={name ? `${name}${state ? `, ${state}` : ''}` : state && auto ? `${auto}, ${state}` : undefined}
      aria-describedby="check-hint"
      onPointerDown={(e) => {
        touch.current.isTouch = e.pointerType === 'touch';
        touch.current.fired = false;
        if (!touch.current.isTouch) return;
        const el = e.currentTarget;
        setHolding(true);
        touch.current.timer = setTimeout(() => {
          touch.current.fired = true;
          setHolding(false);
          api.open(target, el);
        }, LONG_PRESS_MS);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onPointerLeave={stop}
      onContextMenu={(e) => {
        if (touch.current.isTouch) e.preventDefault();
      }}
      onClick={(e) => {
        const wasTouch = touch.current.isTouch;
        touch.current.isTouch = false;
        if (wasTouch) {
          if (touch.current.fired) return;
          if (!api.checkMode) {
            api.hint();
            return;
          }
        }
        api.open(target, e.currentTarget);
      }}
    >
      {children}
      {item.checked ? <Icon name="checked" class={styles.badge} /> : null}
      {item.tagged ? <Icon name="flag" class={styles.badge} /> : null}
      {state && !name && !auto ? (
        <span class={styles.vh} data-state-text="">
          , {state}
        </span>
      ) : null}
      {holding ? <span class={styles.hold} aria-hidden="true">{t('check_hold')}</span> : null}
    </button>
  );
}

/**
 * Tag toggle: the label stays "Mark as suspicious" (QA N1); the state is the pressed state, the
 * filled flag icon and a 2 px inset shadow. Toggling never moves focus or closes the card.
 */
export function TagToggle({ item, onTag }: { item: CheckableView; onTag: (c: CheckableView, on: boolean) => void }) {
  return (
    <button
      type="button"
      class={styles.tag}
      aria-pressed={item.tagged}
      aria-label={t('tag_mark_named', { element: elementLabel(item.target, item.device) })}
      data-tag={item.target}
      onClick={() => onTag(item, !item.tagged)}
    >
      <Icon name={item.tagged ? 'flag-filled' : 'flag'} />
      <span>{t('tag_mark')}</span>
    </button>
  );
}

function Value({ target, text }: { target: string; text: string }) {
  if (isAddress(target)) return <Host text={text} />;
  if (isMasked(text)) {
    return (
      <>
        <span aria-hidden="true">{text}</span>
        <span class={styles.vh}>{spokenNumber(text)}</span>
      </>
    );
  }
  return <RichText text={text} />;
}

/** The facts part of a Check card (shared by the card and the Details list). */
export function CheckFacts({ item, visibleText, sender }: { item: CheckableView; visibleText: string; sender?: { display: string; detail?: string | undefined } | undefined }) {
  const mono = isIdentifier(item.target) ? styles.mono : undefined;
  const isSender = item.target === 'sender.detail' || item.target === 'caller_id';
  return (
    <div class={styles.facts}>
      {isSender && sender ? (
        <dl class={styles.anatomy}>
          <dt>{t('check_shown_as')}</dt>
          <dd>{sender.display}</dd>
          {sender.detail ? (
            <>
              <dt>{t('check_actually_from')}</dt>
              <dd class={styles.mono}>
                <Value target={item.target} text={sender.detail} />
              </dd>
            </>
          ) : null}
        </dl>
      ) : (
        <dl class={styles.anatomy}>
          <dt>{t('check_you_see')}</dt>
          <dd class={mono}>
            <Value target={item.target} text={visibleText} />
          </dd>
          {isAddress(item.target) && item.shown ? (
            <>
              <dt>{t('check_goes_to')}</dt>
              <dd class={styles.mono}>
                <Host text={item.shown} boxed />
              </dd>
            </>
          ) : null}
        </dl>
      )}
      {isAddress(item.target) && item.shown ? <p class={styles.ownerNote}>{t('check_owner_note')}</p> : null}
      <p class={styles.reveal}>
        <RichText text={item.reveal ?? t('check_nothing_unusual')} />
      </p>
    </div>
  );
}

/**
 * The Check card. `modal` (phones and tablets): a bottom sheet with a scrim; everything else is inert
 * while it is open. Otherwise (desk layout): a non-modal panel in the action rail that never covers the
 * element. Esc or Close returns focus to the element.
 */
export function CheckCard({
  item,
  visibleText,
  sender,
  modal,
  onTag,
  onClose,
}: {
  item: CheckableView;
  visibleText: string;
  sender?: { display: string; detail?: string | undefined } | undefined;
  modal: boolean;
  onTag: (c: CheckableView, on: boolean) => void;
  onClose: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  // Layout effects: focus and Esc are live in the same frame the card appears (no early-Esc race).
  useLayoutEffect(() => title.current?.focus(), [item.key]);
  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const card = (
    <div
      class={modal ? `${styles.card} ${styles.sheet}` : styles.card}
      role="dialog"
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby="check-card-title"
      data-check-card={item.target}
    >
      <div class={styles.cardHead}>
        <h2 id="check-card-title" ref={title} tabIndex={-1}>
          <Icon name="magnifier" />
          <span>{t('check_card_title', { element: elementLabel(item.target, item.device) })}</span>
        </h2>
        <button type="button" class={styles.close} onClick={onClose}>
          <Icon name="close" />
          <span>{t('check_close')}</span>
        </button>
      </div>
      <CheckFacts item={item} visibleText={visibleText} sender={sender} />
      <TagToggle item={item} onTag={onTag} />
    </div>
  );
  if (!modal) return card;
  return (
    <div class={styles.layer}>
      <div class={styles.scrim} aria-hidden="true" onClick={onClose} />
      {card}
    </div>
  );
}

/** "Details you can check" (UI_SPEC §4.6): the primary keyboard and screen-reader path. Never a total. */
export function DetailsList({
  items,
  checkedCount,
  visible,
  sender,
  checkMode,
  onCheckMode,
  onCheck,
  onTag,
}: {
  items: CheckableView[];
  checkedCount: number;
  visible: (c: CheckableView) => string;
  sender?: { display: string; detail?: string | undefined } | undefined;
  checkMode: boolean;
  onCheckMode: (on: boolean) => void;
  onCheck: (c: CheckableView) => void;
  onTag: (c: CheckableView, on: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div class={styles.details}>
      <div class={styles.detailsRow}>
        <button type="button" class={styles.detailsToggle} aria-expanded={open} aria-controls="details-list" onClick={() => setOpen(!open)}>
          <Icon name="magnifier" />
          <span>{t('details_toggle', { checked: checkedCount })}</span>
        </button>
        <button type="button" class={styles.modeToggle} aria-pressed={checkMode} onClick={() => onCheckMode(!checkMode)}>
          {t('check_mode')}
        </button>
      </div>
      <ul id="details-list" class={styles.list} hidden={!open}>
        {items.map((c) => (
          <li key={c.key}>
            <button type="button" class={styles.row} data-check-row={c.target} onClick={() => onCheck(c)} aria-expanded={c.checked}>
              <span class={styles.rowLabel}>{t('check_item', { element: elementLabel(c.target, c.device) })}</span>
              <span class={isIdentifier(c.target) ? `${styles.rowValue} ${styles.mono}` : styles.rowValue}>
                <Value target={c.target} text={visible(c)} />
              </span>
              {c.checked ? (
                <span class={styles.rowState}>
                  <Icon name="checked" />
                  {t('state_checked')}
                </span>
              ) : null}
            </button>
            {c.checked ? (
              <>
                <CheckFacts item={c} visibleText={visible(c)} sender={sender} />
                <TagToggle item={c} onTag={onTag} />
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
