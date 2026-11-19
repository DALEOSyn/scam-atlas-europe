/**
 * Checkable elements of a message, derived from what the device template
 * shows, never from the authored inspectables (UI_SPEC §3, "inspectable-count
 * parity"). Authored inspectables only supply reveal text for these targets;
 * every other checkable shows "Nothing unusual here".
 *
 * Pure and dependency-free so the engine can reuse it for the "Details you can
 * check" list. Repeated elements are numbered from the second one: link,
 * link#2, link#3 …
 */
import type { Device, Message } from './schema.ts';

/** A notification shown inside a beat (code SMS, approval prompt). Displayed only: it adds no checkables. */
export interface BannerLike {
  device: Device;
  message: Message;
}

/** Every target name the engine knows (for the red-line linter's non-domain list). */
export const CHECKABLE_TARGETS = [
  'sender.detail',
  'caller_id',
  'link',
  'attachment',
  'reference',
  'phone_number',
  'qr.destination',
  'page.address',
  'page.info',
  'payee.name_check',
  'payee.name',
  'payee.iban',
  'prompt.service',
  'prompt.where',
  'prompt.device',
  'prompt.when',
  'prompt.number',
  'letterhead',
  'image',
  'video',
  'claim',
  'request',
] as const;

/** Hosts on the reserved TLDs, with an optional path; e-mail addresses are not links. */
export const LINK_SOURCE = String.raw`(?<![\w.@-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:example|test|invalid)(?:\/[^\s"'<>]*)?`;
const LINK_RE = new RegExp(LINK_SOURCE, 'gi');

/** A link match without trailing sentence punctuation. */
export function trimLink(raw: string): string {
  return raw.replace(/[.,;:!?)]+$/, '');
}

export function linksIn(text: string | undefined): string[] {
  return text ? [...text.matchAll(LINK_RE)].map((m) => trimLink(m[0])) : [];
}

/** CR-33: the listing card as it reads ("Rucksack · €35.00"). */
export function listingText(m: Pick<Message, 'listing'>): string | undefined {
  return m.listing ? `${m.listing.title} · ${m.listing.price}` : undefined;
}

/**
 * The message's references in reading order. CR-33: a marketplace listing card is the first one
 * (checkable `reference`), so `message.references` then continue as reference#2, reference#3 …
 */
export function referencesOf(m: Pick<Message, 'listing' | 'references'>): string[] {
  const card = listingText(m);
  return [...(card ? [card] : []), ...(m.references ?? [])];
}

function numbered(base: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? base : `${base}#${i + 1}`));
}

/**
 * Checkables of a message in reading order. The `request` checkable comes only from the message's
 * own `ask` (the sentence asking for the code or approval; design ruling 2026-11-19, QA L1). A
 * beat's banner (the genuine code text) is evidence, not the tell: it adds no checkables.
 */
export function deriveCheckables(device: Device, m: Message): string[] {
  const out: string[] = [];
  if (m.sender) out.push(device === 'call' ? 'caller_id' : 'sender.detail');
  // CR-24: the video frame ("Face and voice") on a video call.
  if (m.video && device === 'call') out.push('video');
  if (m.letterhead) out.push('letterhead');
  if (m.page) out.push('page.address', 'page.info');
  if (m.prompt) {
    out.push('prompt.service', 'prompt.where', 'prompt.device', 'prompt.when');
    if (m.prompt.number !== undefined) out.push('prompt.number');
  }
  const transcript = m.transcript?.map((l) => l.text).join('\n');
  out.push(...numbered('link', linksIn(m.body).length + linksIn(transcript).length));
  out.push(...numbered('attachment', m.attachments?.length ?? 0));
  out.push(...numbered('reference', referencesOf(m).length));
  out.push(...numbered('phone_number', m.phone_numbers?.length ?? 0));
  if (m.qr) out.push('qr.destination');
  if (m.payee) {
    if (device === 'banking') {
      // CR-18(c): a payment-request page runs no name check; its payee name is a plain checkable.
      // CR-34: so does the confirmation after a payment code ("to {name}").
      out.push(m.payee.payment_request || m.payee.code_confirm ? 'payee.name' : 'payee.name_check');
      if (m.payee.iban) out.push('payee.iban');
    } else if (m.payee.iban) {
      // CR-22: a bank-details card in an email or chat. No name check outside the bank app.
      out.push('payee.iban');
    }
  }
  if (m.image) out.push('image');
  // CR-17(b): what they say (offers, promises, excuses), then the ask.
  out.push(...numbered('claim', m.claims?.length ?? 0));
  if (m.ask) out.push('request');
  return out;
}
