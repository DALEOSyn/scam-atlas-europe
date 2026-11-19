/**
 * Text rendering shared by devices, Check cards and the debrief.
 * - Hosts never wrap at hyphens, and the owner part never wraps at all (UI_SPEC §1.5): line breaks
 *   only between scheme | subdomain labels | owner part | path. Where the owner part is wider than
 *   its container, it scrolls sideways inside itself as a focusable box (OwnerPart), or, inside a
 *   control (Checkable), the control's container scrolls (devices / check CSS).
 * - Masked numbers carry a spoken form that starts with the visible text ("0800 … 3310, masked number").
 */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { t } from '../i18n/index.ts';
import { hostParts, maskedParts, richPieces } from './text.ts';
import styles from './text.module.css';

export function spokenNumber(text: string): string {
  const p = maskedParts(text);
  if (!p) return text;
  return p.start ? t('masked_number_start', { start: p.start, end: p.end }) : t('masked_number', { end: p.end });
}

const Break = () => <wbr />;
const NoBreak = () => null;

const INTERACTIVE = 'button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';

/**
 * The owner part: one unbreakable piece. Outside controls it is an inline box that scrolls sideways
 * when it does not fit; only then does it become focusable (tabindex 0, role group, named by the
 * owner part), so keyboard users can scroll it. Inside a control it stays plain text, because a
 * focusable box inside a button would be nested interactive content; there the container scrolls.
 */
function OwnerPart({ text, cls }: { text: string; cls: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inControl, setInControl] = useState(false);
  const [over, setOver] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (el.parentElement?.closest(INTERACTIVE)) {
      setInControl(true);
      return undefined;
    }
    if (typeof ResizeObserver === 'undefined') return undefined;
    const check = () => setOver(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      class={inControl ? cls : `${cls} ${styles.ownerScroll}`}
      data-owner=""
      tabIndex={over ? 0 : undefined}
      role={over ? 'group' : undefined}
      aria-label={over ? text : undefined}
    >
      {text}
    </span>
  );
}

/** A host or address with break opportunities only between its parts. `strong` marks the owner part; `boxed` frames it (Check card). */
export function Host({ text, strong = false, boxed = false, oneLine = false }: { text: string; strong?: boolean; boxed?: boolean; oneLine?: boolean }) {
  const p = hostParts(text);
  // A one-line host has no break opportunities at all.
  const Wbr = oneLine ? NoBreak : Break;
  const ownerClass = [styles.nowrap, strong ? styles.owner : '', boxed ? styles.boxed : ''].filter(Boolean).join(' ');
  return (
    <span class={styles.host} data-host="">
      {p.scheme ? (
        <>
          <span class={styles.nowrap}>{p.scheme}</span>
          <Wbr />
        </>
      ) : null}
      {p.local ? (
        <>
          <span class={styles.nowrap}>{p.local}</span>
          <Wbr />
        </>
      ) : null}
      {p.sub.map((l, i) => (
        <span key={i}>
          <span class={styles.nowrap}>{l}</span>
          <Wbr />
        </span>
      ))}
      <OwnerPart text={p.owner} cls={ownerClass} />
      {p.path.map((seg, i) => (
        <span key={i}>
          <Wbr />
          <span class={styles.nowrap}>{seg}</span>
        </span>
      ))}
    </span>
  );
}

/** A masked number: visible bullets for sighted users, the spoken form for screen readers. */
export function Masked({ text }: { text: string }) {
  return (
    <span class={styles.nowrap}>
      <span aria-hidden="true">{text}</span>
      <span class={styles.vh}>{spokenNumber(text)}</span>
    </span>
  );
}

export function RichText({ text }: { text: string }) {
  return (
    <>
      {richPieces(text).map((p, i) => (p.kind === 'host' ? <Host key={i} text={p.text} /> : p.kind === 'masked' ? <Masked key={i} text={p.text} /> : p.text))}
    </>
  );
}
