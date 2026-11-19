/**
 * Shared device parts: frames, status strip, avatars, message text with inline checkables,
 * the Translate toggle and the "Show more" rule. Generic chrome only (UI_SPEC §0.1): no real OS,
 * client or app shapes, no notch, no message tails.
 */
import type { ComponentChildren, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { assetUrl, brandForName, type BrandMark } from '../../content/brands.ts';
import type { Message } from '../../content/schema.ts';
import { t } from '../../i18n/index.ts';
import { Checkable } from '../check/Check.tsx';
import { Icon } from '../Icon.tsx';
import { Host, RichText, spokenNumber } from '../RichText.tsx';
import { isMasked, quotedSplit, segmentMessage, words, type Segment } from '../text.ts';
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

/** Punctuation that belongs to the text before it ("…highlighted sentence." / "…sentence, then"). */
const TRAILING_PUNCT = /^[.,;:!?…)\]»”’"']+/u;

/**
 * Message text with its inline checkables. A checkable is a button (an atomic inline box), so the browser
 * may break the line right after it and leave "." alone at the start of the next line (Amsterdam QA m:
 * 2-1 ". Save it…", 2-2 ". Vacature"). Trailing punctuation is kept with the checkable in a no-wrap span;
 * the checkable's own text still wraps.
 */
export function Segments({ segs }: { segs: Segment[] }) {
  const out: JSX.Element[] = [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (!s) continue;
    if (s.kind !== 'check') {
      out.push(<RichText key={i} text={s.text} />);
      continue;
    }
    const next = segs[i + 1];
    const punct = next && next.kind !== 'check' ? TRAILING_PUNCT.exec(next.text)?.[0] : undefined;
    if (!next || !punct) {
      out.push(<InlineCheck key={i} seg={s} />);
      continue;
    }
    out.push(
      <span key={i} class={styles.keepPunct} data-keep-punct="">
        <InlineCheck seg={s} />
        {punct}
      </span>,
    );
    const rest = next.text.slice(punct.length);
    if (rest) out.push(<RichText key={`${i}r`} text={rest} />);
    i++;
  }
  return <>{out}</>;
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
 * How long an auto-expanded translation ("Always show translations") freezes the timer: reading pace,
 * max(1.5 s, 0.3 s × words), as for call lines (UI_SPEC §3.4). CR-27.
 */
export function translationHoldSeconds(text: string): number {
  return Math.max(1.5, 0.3 * words(text));
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
  /** Expanded by the "Always show translations" setting, not by the player's own tap. */
  const [auto, setAuto] = useState(alwaysOpen);
  // "Always show translations" changed in Settings: follow it (QA M7).
  useEffect(() => {
    setOpen(alwaysOpen);
    setAuto(alwaysOpen);
  }, [alwaysOpen]);
  const shown = !!message.translation && !!message.lang && message.lang !== 'en';
  // Each open translation holds one freeze; ScenarioView counts them. CR-27 (Paris QA, bank-card timer stuck
  // at "0:01 left"): a translation the setting keeps open freezes only for its reading time, then the timer
  // runs again; before, it held the freeze for as long as it was on screen, so a French follow-up arriving
  // on the bank card stopped the timer for good. A toggle with nothing to translate never freezes.
  useEffect(() => {
    if (!open || !shown) return undefined;
    onFreeze(true);
    let held = true;
    const release = () => {
      if (!held) return;
      held = false;
      onFreeze(false);
    };
    const id = auto ? setTimeout(release, translationHoldSeconds(message.translation ?? '') * 1000) : undefined;
    return () => {
      if (id !== undefined) clearTimeout(id);
      release();
    };
  }, [open, auto, shown]);
  if (!shown) return null;
  return (
    <div class={styles.translate} lang="en">
      <button type="button" class={styles.translateToggle} aria-expanded={open} aria-controls={id} onClick={() => {
          setOpen(!open);
          setAuto(false);
        }}>
        {open ? t('translate_hide') : t('translate_show')}
      </button>
      <div id={id} hidden={!open} class={styles.translation}>
        <span class={styles.translationLabel}>{t('scenario_translation')}</span> <RichText text={message.translation ?? ''} />
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

/** Attachment chips (file name and size), checkable like in the mail device. `only`: these targets. */
export function AttachmentChips({ message, only, skip }: { message: Message; only?: ReadonlySet<string>; skip?: ReadonlySet<string> }) {
  const list = (message.attachments ?? []).map((a, i) => ({ a, target: i === 0 ? 'attachment' : `attachment#${i + 1}` })).filter((x) => (!only || only.has(x.target)) && !skip?.has(x.target));
  if (list.length === 0) return null;
  return (
    <ul class={styles.chips}>
      {list.map(({ a, target }) => (
        <li key={target}>
          <Checkable target={target} class={styles.attachment}>
            <Icon name="attach" />
            <span>{a.name}</span>
            {a.size ? <span class={styles.muted}>{a.size}</span> : null}
          </Checkable>
        </li>
      ))}
    </ul>
  );
}

/**
 * A chat bubble's body (CR-27): when part of it quotes someone else's message (`context: quoted`
 * inspectables), that part is a quote block inside the bubble, with the quoted attachment chips drawn
 * inside it. Other attachments follow the body. Without a quote it is the plain body.
 */
export function ChatBody({ message, quoted }: { message: Message; quoted: ReadonlySet<string> }) {
  const segs = segmentMessage(message);
  const split = message.body ? quotedSplit(message.body, segs.body, quoted) : null;
  const quotedFiles = new Set((message.attachments ?? []).map((_, i) => (i === 0 ? 'attachment' : `attachment#${i + 1}`)).filter((x) => quoted.has(x)));
  if (!split) {
    return (
      <>
        <MessageBody message={message} />
        <AttachmentChips message={message} />
      </>
    );
  }
  return (
    <>
      <div class={styles.body} lang={message.lang} id="message-body">
        {split.before.length ? <Segments segs={split.before} /> : null}
        <blockquote class={styles.chatQuote} data-quoted="">
          <Segments segs={split.quote} />
          <AttachmentChips message={message} only={quotedFiles} />
        </blockquote>
        {split.after.length ? <Segments segs={split.after} /> : null}
      </div>
      <AttachmentChips message={message} skip={quotedFiles} />
    </>
  );
}

export function leftoverChips(message: Message): { target: string; text: string }[] {
  return segmentMessage(message).leftover;
}
