/**
 * Text normalisation for the red-line linter.
 *
 * normalise(): NFKC, strip invisible characters, map look-alike full stops to
 *   "." (so "paketpilot。com" is read as a domain). Used by every rule.
 * foldForBrand(): a UTS #39-style skeleton for brand matching. Accents are
 *   stripped, confusables (UTS #39 data via `unicode-confusables`, plus a hand
 *   map for small capitals) and leetspeak are folded, everything is lower-cased,
 *   and i/l/1/| collapse to "l". The same fold is applied to denylist names,
 *   so both sides always compare skeleton to skeleton. Each folded character
 *   remembers its index in the normalised text so findings can quote the
 *   original wording.
 *
 * Code points are written as numbers on purpose: escape sequences in source
 * have been silently decoded by tooling in this repo before.
 */
import confusablesData from 'unicode-confusables/data/confusables.json' with { type: 'json' };

const CONFUSABLES: Readonly<Record<string, string>> = confusablesData as Record<string, string>;

const cp = (...points: number[]): string => String.fromCodePoint(...points);

/** Soft hyphen, zero-width chars, bidi marks, word joiners, BOM, Mongolian vowel separator, CGJ. */
const INVISIBLE = new Set<string>([
  0x00ad, 0x034f, 0x180e, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e,
  0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0xfeff,
].map((p) => cp(p)));

/** Ideographic, halfwidth ideographic, small and fullwidth full stops, one-dot leader. */
const DOT_LOOKALIKES = new Set<string>([0x3002, 0xff61, 0xfe52, 0xff0e, 0x2024].map((p) => cp(p)));

export function normalise(text: string): string {
  let out = '';
  for (const ch of text.normalize('NFKC')) {
    if (INVISIBLE.has(ch)) continue;
    out += DOT_LOOKALIKES.has(ch) ? '.' : ch;
  }
  return out;
}

/** Leetspeak digits and symbols. "i" is merged into "l" separately (see step()). */
const LEET: Readonly<Record<string, string>> = {
  '0': 'o', '1': 'l', '|': 'l', '3': 'e', '4': 'a', '5': 's', '@': 'a', $: 's',
};

/** Small capitals and other Latin look-alikes missing from the UTS #39 v10 data. */
const HAND: Readonly<Record<string, string>> = Object.fromEntries(
  (
    [
      [0x1d00, 'a'], [0x0299, 'b'], [0x1d04, 'c'], [0x1d05, 'd'], [0x1d07, 'e'], [0xa730, 'f'], [0x0262, 'g'],
      [0x029c, 'h'], [0x026a, 'l'], [0x1d0a, 'j'], [0x1d0b, 'k'], [0x029f, 'l'], [0x1d0d, 'm'], [0x0274, 'n'],
      [0x1d0f, 'o'], [0x1d18, 'p'], [0xa7af, 'q'], [0x0280, 'r'], [0xa731, 's'], [0x1d1b, 't'], [0x1d1c, 'u'],
      [0x1d20, 'v'], [0x1d21, 'w'], [0x028f, 'y'], [0x1d22, 'z'], [0x0131, 'l'], [0x0251, 'a'], [0x0261, 'g'],
    ] as const
  ).map(([p, v]) => [cp(p), v]),
);

/** One folding step for a single character; iterated to a fixed point. */
function step(c: string): string {
  const leet = LEET[c];
  if (leet !== undefined) return leet;
  const hand = HAND[c];
  if (hand !== undefined) return hand;
  const conf = CONFUSABLES[c];
  if (conf !== undefined && conf !== c) return conf;
  const lower = c.toLowerCase();
  if (lower !== c) return lower;
  if (c === 'i') return 'l';
  return c;
}

const MARKS = /\p{M}/gu;

export interface Folded {
  /** The skeleton. */
  text: string;
  /** For each UTF-16 unit of `text`, the index of its source character in the input. */
  origin: number[];
}

/** Fold already-normalised text into its brand skeleton, tracking source offsets. */
export function foldWithOrigin(normalised: string): Folded {
  let chars: { ch: string; at: number }[] = [];
  let i = 0;
  for (const c of normalised) {
    const base = c.normalize('NFD').replace(MARKS, '');
    for (const b of base) chars.push({ ch: b, at: i });
    i += c.length;
  }
  for (let round = 0; round < 6; round++) {
    let changed = false;
    const next: { ch: string; at: number }[] = [];
    for (const { ch, at } of chars) {
      const mapped = step(ch);
      if (mapped !== ch) changed = true;
      for (const m of mapped.normalize('NFD').replace(MARKS, '')) next.push({ ch: m, at });
    }
    chars = next;
    if (!changed) break;
  }
  let text = '';
  const origin: number[] = [];
  for (const { ch, at } of chars) {
    text += ch;
    for (let k = 0; k < ch.length; k++) origin.push(at);
  }
  return { text, origin };
}

export function foldForBrand(text: string): string {
  return foldWithOrigin(normalise(text)).text;
}
