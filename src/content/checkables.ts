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
  'payee.iban',
  'prompt.service',
  'prompt.where',
  'prompt.device',
  'prompt.when',
  'prompt.number',
  'letterhead',
  'image',
] as const;

/** Hosts on the reserved TLDs, with an optional path; e-mail addresses are not links. */
const LINK_RE = /(?<![\w.@-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:example|test|invalid)(?:\/[^\s"'<>]*)?/gi;

export function linksIn(text: string | undefined): string[] {
  return text ? [...text.matchAll(LINK_RE)].map((m) => m[0].replace(/[.,;:!?)]+$/, '')) : [];
}

function numbered(base: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? base : `${base}#${i + 1}`));
}

export function deriveCheckables(device: Device, m: Message): string[] {
  const out: string[] = [];
  if (m.sender) out.push(device === 'call' ? 'caller_id' : 'sender.detail');
  if (m.letterhead) out.push('letterhead');
  if (m.page) out.push('page.address', 'page.info');
  if (m.prompt) {
    out.push('prompt.service', 'prompt.where', 'prompt.device', 'prompt.when');
    if (m.prompt.number !== undefined) out.push('prompt.number');
  }
  const transcript = m.transcript?.map((l) => l.text).join('\n');
  out.push(...numbered('link', linksIn(m.body).length + linksIn(transcript).length));
  out.push(...numbered('attachment', m.attachments?.length ?? 0));
  out.push(...numbered('reference', m.references?.length ?? 0));
  out.push(...numbered('phone_number', m.phone_numbers?.length ?? 0));
  if (m.qr) out.push('qr.destination');
  if (m.payee) {
    out.push('payee.name_check');
    if (m.payee.iban) out.push('payee.iban');
  }
  if (m.image) out.push('image');
  return out;
}
