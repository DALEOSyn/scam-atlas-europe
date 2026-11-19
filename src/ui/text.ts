/**
 * Pure text helpers for the device layer (UI_SPEC §1.5, §3, §4.4, §10.7):
 * - host anatomy (scheme | subdomain | owner part | path) for address bars and Check cards;
 * - splitting message text into plain text and inline checkables, numbered exactly like
 *   the engine's deriveCheckables (body links first, then transcript links);
 * - spoken forms for masked phone numbers, built only from the digits on screen.
 */
import { LINK_SOURCE, trimLink } from '../content/checkables.ts';
import type { Message } from '../content/schema.ts';

export interface HostParts {
  /** "https://" or "" */
  scheme: string;
  /** Labels before the owner part, each with its trailing dot: ["desk.", "waymarker-network."] */
  sub: string[];
  /** The last two labels of the host (UI_SPEC §4.4), e.g. example-sso.test. */
  owner: string;
  /** Path segments, each starting with "/": ["/mail", "/quota"] */
  path: string[];
  /** Everything before the host for e-mail addresses ("it-desk@"), else "". */
  local: string;
}

/** Owner part = the last two labels of the host (`<name>.<tld>`); the game uses no multi-label suffixes. */
export function hostParts(address: string): HostParts {
  const scheme = /^https?:\/\//.exec(address)?.[0] ?? '';
  let rest = address.slice(scheme.length);
  let local = '';
  const at = rest.lastIndexOf('@');
  if (at >= 0 && !rest.slice(0, at).includes('/')) {
    local = rest.slice(0, at + 1);
    rest = rest.slice(at + 1);
  }
  const cut = rest.search(/[/?#]/);
  const host = cut < 0 ? rest : rest.slice(0, cut);
  const tail = cut < 0 ? '' : rest.slice(cut);
  const labels = host.split('.');
  const owner = labels.slice(-2).join('.');
  const sub = labels.slice(0, -2).map((l) => `${l}.`);
  const path = tail ? tail.split(/(?=\/)/) : [];
  return { scheme, sub, owner, path, local };
}

/** Host-like tokens in running text: e-mail addresses and hosts on the reserved TLDs (with paths). */
const HOSTISH_RE = /(?<![\w.+-])[\w.+-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:example|test|invalid)\b|(?<![\w.@-])(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:example|test|invalid)(?:\/[^\s"'<>]*)?/gi;

/** Masked phone numbers: digits, spaces and at least one run of bullets, ending in digits. */
const MASKED_RE = /\+?\d[\d ]*?(?:\s?•+)+(?:[\d •]*\d)?/g;

export type RichPiece = { kind: 'text'; text: string } | { kind: 'host'; text: string } | { kind: 'masked'; text: string };

/** Split plain text so hosts never wrap at hyphens and masked numbers get a spoken form. */
export function richPieces(text: string): RichPiece[] {
  const marks: { start: number; end: number; kind: 'host' | 'masked' }[] = [];
  for (const m of text.matchAll(HOSTISH_RE)) {
    const t = trimLink(m[0]);
    marks.push({ start: m.index, end: m.index + t.length, kind: 'host' });
  }
  for (const m of text.matchAll(MASKED_RE)) {
    const t = m[0].trimEnd();
    if (!marks.some((x) => m.index < x.end && m.index + t.length > x.start)) marks.push({ start: m.index, end: m.index + t.length, kind: 'masked' });
  }
  marks.sort((a, b) => a.start - b.start);
  const out: RichPiece[] = [];
  let at = 0;
  for (const mk of marks) {
    if (mk.start < at) continue;
    if (mk.start > at) out.push({ kind: 'text', text: text.slice(at, mk.start) });
    out.push({ kind: mk.kind, text: text.slice(mk.start, mk.end) });
    at = mk.end;
  }
  if (at < text.length) out.push({ kind: 'text', text: text.slice(at) });
  return out;
}

export function isMasked(text: string): boolean {
  return text.includes('•');
}

/**
 * Spoken form of a masked number, from what is on screen only (never adds digits):
 * "0800 ••• 3310" → { start: "0800", end: "3310" }; "+32 2 ••• •• 00" → { start: "+32 2", end: "00" }.
 */
export function maskedParts(text: string): { start: string; end: string } | null {
  if (!isMasked(text)) return null;
  const first = text.indexOf('•');
  const last = text.lastIndexOf('•');
  const start = text.slice(0, first).trim();
  const end = text.slice(last + 1).replace(/\s+/g, '');
  return end ? { start, end } : null;
}

// ---------------------------------------------------------------------------
// Message segments with inline checkables

export type Segment = { kind: 'text'; text: string } | { kind: 'check'; target: string; text: string };

export interface MessageSegments {
  body: Segment[];
  transcript: Segment[][];
  /** Checkables of these kinds that do not appear in the text (shown as chips under it). */
  leftover: { target: string; text: string }[];
}

interface Candidate {
  start: number;
  end: number;
  target: string;
  text: string;
}

function numberedTarget(base: string, i: number): string {
  return i === 0 ? base : `${base}#${i + 1}`;
}

function linkCandidates(text: string, firstIndex: number): Candidate[] {
  const re = new RegExp(LINK_SOURCE, 'gi');
  return [...text.matchAll(re)].map((m, i) => {
    const t = trimLink(m[0]);
    return { start: m.index, end: m.index + t.length, target: numberedTarget('link', firstIndex + i), text: t };
  });
}

function toSegments(text: string, cands: Candidate[]): Segment[] {
  const sorted = [...cands].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Segment[] = [];
  let at = 0;
  for (const c of sorted) {
    if (c.start < at) continue;
    if (c.start > at) out.push({ kind: 'text', text: text.slice(at, c.start) });
    out.push({ kind: 'check', target: c.target, text: c.text });
    at = c.end;
  }
  if (at < text.length) out.push({ kind: 'text', text: text.slice(at) });
  return out;
}

/**
 * Split a message's body and transcript lines into text and checkables. Links are numbered across
 * body then transcript (engine order). References and phone numbers become inline checkables at
 * their first appearance; the ones not in the text are returned as leftovers.
 */
export function segmentMessage(m: Pick<Message, 'body' | 'transcript' | 'references' | 'phone_numbers' | 'ask' | 'claims'>): MessageSegments {
  const texts = [m.body ?? '', ...(m.transcript ?? []).map((l) => l.text)];
  const cands: Candidate[][] = [];
  let links = 0;
  for (const t of texts) {
    const c = linkCandidates(t, links);
    links += c.length;
    cands.push(c);
  }
  const leftover: { target: string; text: string }[] = [];
  const place = (base: string, values: readonly string[] | undefined) => {
    (values ?? []).forEach((value, i) => {
      const target = numberedTarget(base, i);
      for (let k = 0; k < texts.length; k++) {
        const text = texts[k] ?? '';
        let from = 0;
        for (;;) {
          const at = text.indexOf(value, from);
          if (at < 0) break;
          const list = cands[k] ?? [];
          if (!list.some((c) => at < c.end && at + value.length > c.start)) {
            list.push({ start: at, end: at + value.length, target, text: value });
            return;
          }
          from = at + 1;
        }
      }
      leftover.push({ target, text: value });
    });
  };
  place('phone_number', m.phone_numbers);
  place('reference', m.references);
  // The ask (ruling QA L1) and the claims (CR-17(b)) are highlighted where they stand, unless they
  // overlap another inline checkable (no nesting); they are always in the Details list either way.
  const quote = (text: string, target: string) => {
    for (let k = 0; k < texts.length; k++) {
      if (k > 0 && m.transcript?.[k - 1]?.speaker !== 'caller') continue;
      const at = (texts[k] ?? '').indexOf(text);
      if (at < 0) continue;
      const list = cands[k] ?? [];
      if (!list.some((c) => at < c.end && at + text.length > c.start)) list.push({ start: at, end: at + text.length, target, text });
      break;
    }
  };
  if (m.ask) quote(m.ask.text, 'request');
  (m.claims ?? []).forEach((c, i) => quote(c.text, numberedTarget('claim', i)));
  const segs = texts.map((t, k) => toSegments(t, cands[k] ?? []));
  return { body: m.body ? (segs[0] ?? []) : [], transcript: segs.slice(1), leftover };
}

/** Word count for the "Show more" rule on long e-mails (UI_SPEC §3). */
export function words(text: string | undefined): number {
  return text ? text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
}

/**
 * Checkable targets that appear only in transcript lines the player has not heard yet
 * (line index ≥ `shown`). The Details list hides them until their line is revealed (QA B3).
 */
export function unrevealedTargets(m: Pick<Message, 'body' | 'transcript' | 'references' | 'phone_numbers' | 'ask' | 'claims'>, shown: number): Set<string> {
  const segs = segmentMessage(m);
  const targets = (list: Segment[]) => list.flatMap((x) => (x.kind === 'check' ? [x.target] : []));
  const visible = new Set([...targets(segs.body), ...segs.transcript.slice(0, shown).flatMap(targets)]);
  return new Set(segs.transcript.slice(shown).flatMap(targets).filter((x) => !visible.has(x)));
}
