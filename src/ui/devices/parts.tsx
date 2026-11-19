/**
 * Shared device parts: frames, status strip, avatars, message text with inline checkables,
 * the Translate toggle and the "Show more" rule. Generic chrome only (UI_SPEC §0.1): no real OS,
 * client or app shapes, no notch, no message tails.
 */
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { assetUrl, brandForName, type BrandMark } from '../../content/brands.ts';
import type { Message } from '../../content/schema.ts';
import { t } from '../../i18n/index.ts';
import { Checkable } from '../check/Check.tsx';
import { Icon } from '../Icon.tsx';
import { Host, RichText, spokenNumber } from '../RichText.tsx';
import { isMasked, segmentMessage, words, type Segment } from '../text.ts';
import styles from './devices.module.css';

export function PhoneFrame({ label, children, brand }: { label: string; children: ComponentChildren; brand?: string }) {
  return (
    <section class={styles.phone} aria-label={label} data-brand={brand}>
      <div class={styles.status} aria-hidden="true">
        <span>{t('device_phone_name')}</span>
        <Icon name="battery" size={18} />
      </div>
      <div class={styles.screen}>{children}</div>
    </section>
  );
}

export function LaptopFrame({ label, children }: { label: string; children: ComponentChildren }) {
  return (
    <section class={styles.laptop} aria-label={label}>
      <div class={styles.laptopScreen}>{children}</div>
      <div class={styles.laptopBase} aria-hidden="true" />
    </section>
  );
}

/** Brand app header bar (Kettle, Larchwick, Gatewren …) through --brand-<id>-* tokens only. */
export function BrandBar({ brand, title, sub, children }: { brand: BrandMark | undefined; title: string; sub?: string | undefined; children?: ComponentChildren }) {
  const style = brand ? { background: `var(--brand-${brand.id}-primary)`, color: `var(--brand-${brand.id}-on-primary)` } : undefined;
  return (
    <div class={brand ? styles.brandBar : styles.appBar} style={style}>
      {brand?.mark ? <img class={styles.brandMark} src={assetUrl(brand.mark)} alt="" width={24} height={24} /> : null}
      <div class={styles.barText}>
        <span class={styles.barTitle}>{title}</span>
        {sub ? <span class={styles.barSub}>{sub}</span> : null}
      </div>
      {children}
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Brand mark for a display name that claims a brand, else initials on a neutral tint (UI_SPEC §2.5). */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const brand = brandForName(name);
  if (brand?.mark) {
    return (
      <span class={styles.avatar} style={{ width: `${size}px`, height: `${size}px`, background: `var(--brand-${brand.id}-primary)` }} aria-hidden="true">
        <img src={assetUrl(brand.mark)} alt="" width={size - 12} height={size - 12} />
      </span>
    );
  }
  const initials = name
    .split(/\s+/)
    .filter((w) => /^\p{L}/u.test(w))
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span class={styles.avatar} style={{ width: `${size}px`, height: `${size}px`, background: `var(--avatar-${(hash(name) % 6) + 1})` }} aria-hidden="true">
      {initials}
    </span>
  );
}



/** One checkable inside message text. Masked numbers get a spoken name. */
function InlineCheck({ seg }: { seg: Extract<Segment, { kind: 'check' }> }) {
  const base = seg.target.replace(/#\d$/, '');
  const masked = isMasked(seg.text);
  return (
    <Checkable target={seg.target} class={base === 'link' ? styles.link : styles.inlineId} name={masked ? spokenNumber(seg.text) : undefined}>
      {base === 'link' ? <Host text={seg.text} /> : masked ? <span aria-hidden="true">{seg.text}</span> : seg.text}
    </Checkable>
  );
}

export function Segments({ segs }: { segs: Segment[] }) {
  return (
    <>
      {segs.map((s, i) => (s.kind === 'check' ? <InlineCheck key={i} seg={s} /> : <RichText key={i} text={s.text} />))}
    </>
  );
}

/** Leftover references / numbers that are not in the text: chips under it, still checkable. */
export function Chips({ items }: { items: { target: string; text: string }[] }) {
  if (items.length === 0) return null;
  return (
    <ul class={styles.chips}>
      {items.map((c) => (
        <li key={c.target}>
          <InlineCheck seg={{ kind: 'check', target: c.target, text: c.text }} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Inline Translate toggle (UI_SPEC §4.8): free, freezes the timer while open, never a checkable,
 * never inside a Check card.
 */
export function Translate({
  message,
  onFreeze,
  alwaysOpen = false,
  id = 'translation',
}: {
  message: { lang?: string | undefined; translation?: string | undefined };
  onFreeze: (on: boolean) => void;
  alwaysOpen?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(alwaysOpen);
  // "Always show translations" changed in Settings: follow it (QA M7).
  useEffect(() => setOpen(alwaysOpen), [alwaysOpen]);
  // Each open translation holds one freeze; ScenarioView counts them.
  useEffect(() => {
    if (!open) return undefined;
    onFreeze(true);
    return () => onFreeze(false);
  }, [open]);
  if (!message.translation || !message.lang || message.lang === 'en') return null;
  return (
    <div class={styles.translate} lang="en">
      <button type="button" class={styles.translateToggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {open ? t('translate_hide') : t('translate_show')}
      </button>
      <div id={id} hidden={!open} class={styles.translation}>
        <span class={styles.translationLabel}>{t('scenario_translation')}</span> <RichText text={message.translation} />
      </div>
    </div>
  );
}

/** Body text with inline checkables; long bodies collapse with "Show more" (UI_SPEC §3). */
export function MessageBody({ message, collapse = false }: { message: Message; collapse?: boolean }) {
  const segs = segmentMessage(message);
  const long = collapse && words(message.body) > 80;
  const [more, setMore] = useState(false);
  if (!message.body) return null;
  return (
    <>
      <div class={long && !more ? `${styles.body} ${styles.clamped}` : styles.body} lang={message.lang} id="message-body">
        <Segments segs={segs.body} />
      </div>
      {long ? (
        <button type="button" class={styles.textButton} aria-expanded={more} aria-controls="message-body" onClick={() => setMore(!more)}>
          {more ? t('show_less') : t('show_more')}
        </button>
      ) : null}
    </>
  );
}

export function leftoverChips(message: Message): { target: string; text: string }[] {
  return segmentMessage(message).leftover;
}
