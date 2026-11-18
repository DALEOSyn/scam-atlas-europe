/**
 * Text rendering shared by devices, Check cards and the debrief.
 * - Hosts never wrap at hyphens: line breaks only at scheme | subdomain labels | owner part | path
 *   (UI_SPEC §1.5 host wrapping rule).
 * - Masked numbers carry a spoken form ("number ending 3310") built only from the digits shown.
 */
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

/** A host or address with break opportunities only between its parts. `strong` marks the owner part (address bar after a check, Check card). */
export function Host({ text, strong = false, boxed = false, oneLine = false }: { text: string; strong?: boolean; boxed?: boolean; oneLine?: boolean }) {
  const p = hostParts(text);
  // The address bar is one line that truncates from the left (UI_SPEC §3.5): no break opportunities.
  const Wbr = oneLine ? NoBreak : Break;
  const ownerClass = [styles.nowrap, strong ? styles.owner : '', boxed ? styles.boxed : ''].filter(Boolean).join(' ');
  return (
    <span class={styles.host}>
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
      <span class={ownerClass}>{p.owner}</span>
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
