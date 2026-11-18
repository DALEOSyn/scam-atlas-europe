/**
 * Brand list files: content/redline-denylist.txt (errors) and
 * content/redline-warnlist.txt (warnings only).
 *
 * Line format:   Name [| option, option] [| except: phrase; phrase]
 *   options:  word    whole word only (default for names under 5 letters/digits)
 *             affix   also inside longer words, e.g. "amazonsupport" (default for 5+)
 *             prefix  whole word or start of a longer word, e.g. "applesupport" but not "pineapple"
 *             nosep   do not allow separators between letters ("its me" must not hit "itsme")
 *   except:   phrases (same fold as the text) inside which a hit is ignored,
 *             e.g. "Revolut | except: revolution; revolutionary".
 *
 * Every mode also matches separated spellings as a stand-alone word: at the
 * name's own word/camelCase/digit boundaries ("Pay Pal", "Deutsche-Bank",
 * "N 26") or with a separator between every letter ("D.H.L"). See compileEntry().
 */
import { foldForBrand, foldWithOrigin, normalise } from './fold.ts';

export type Severity = 'error' | 'warn';
export type Mode = 'word' | 'affix' | 'prefix';

export interface ListEntry {
  name: string;
  mode: Mode;
  nosep: boolean;
  except: string[];
  severity: Severity;
  line: number;
}

export interface BrandMatcher {
  entry: ListEntry;
  re: RegExp;
  exceptions: string[];
}

export const MIN_SKELETON = 3;
const AFFIX_MIN_LENGTH = 5;

export function parseList(text: string, severity: Severity): { entries: ListEntry[]; problems: string[] } {
  const entries: ListEntry[] = [];
  const problems: string[] = [];
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.replace(/(^|\s)#.*$/, '').trim();
    if (!line) return;
    const [namePart = '', ...opts] = line.split('|').map((s) => s.trim());
    const name = namePart;
    const alnum = name.replace(/[^\p{L}\p{N}]/gu, '').length;
    let mode: Mode = alnum >= AFFIX_MIN_LENGTH ? 'affix' : 'word';
    let nosep = false;
    const except: string[] = [];
    for (const opt of opts) {
      if (/^except\s*:/i.test(opt)) {
        except.push(...opt.replace(/^except\s*:/i, '').split(/[;,]/).map((s) => s.trim()).filter(Boolean));
        continue;
      }
      for (const o of opt.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
        if (o === 'word' || o === 'affix' || o === 'prefix') mode = o;
        else if (o === 'nosep') nosep = true;
        else problems.push(`line ${idx + 1}: unknown option "${o}" for "${name}"`);
      }
    }
    const skeleton = foldForBrand(name).replace(/[^\p{L}\p{N}]/gu, '');
    if (skeleton.length < MIN_SKELETON) {
      problems.push(`line ${idx + 1}: "${name}" is too short to match safely (min ${MIN_SKELETON} letters)`);
      return;
    }
    entries.push({ name, mode, nosep, except, severity, line: idx + 1 });
  });
  return { entries, problems };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');
}

/** Separators allowed between letters, folded like the text so they line up. */
const SEP_SOURCE = [' ', '\t', '\n', '\r', '.', '-', '_', "'", String.fromCodePoint(0x00b7), String.fromCodePoint(0x2019)];
const SEP_CHARS = `[${[...new Set(SEP_SOURCE.map((c) => foldForBrand(c) || c))].map(escapeRe).join('')}]`;
const B_BEFORE = '(?<![\\p{L}\\p{N}])';
const B_AFTER = '(?![\\p{L}\\p{N}])';
/** camelCase splits are honoured only when both sides have at least this many letters (Pay|Pal, not In|Post). */
const CAMEL_MIN = 3;

/**
 * Split a list name into the segments between which separators are allowed:
 * the name's own word boundaries ("Deutsche Bank", "Smart-ID"), letter/digit
 * boundaries ("N26" -> N|26) and camelCase boundaries where both sides have
 * 3+ letters ("PayPal" -> Pay|Pal; "InPost", "WeChat", "LinkedIn" stay whole).
 */
export function nameSegments(name: string): string[] {
  const out: string[] = [];
  for (const word of name.split(/[^\p{L}\p{N}]+/u).filter(Boolean)) {
    for (const run of word.split(/(?<=\p{L})(?=\p{N})|(?<=\p{N})(?=\p{L})/u)) {
      const parts = run.split(/(?<=\p{Ll})(?=\p{Lu})/u);
      let current = parts[0] ?? '';
      for (const part of parts.slice(1)) {
        if (current.length >= CAMEL_MIN && part.replace(/\P{L}/gu, '').length >= CAMEL_MIN) {
          out.push(current);
          current = part;
        } else {
          current += part;
        }
      }
      if (current) out.push(current);
    }
  }
  return out;
}

/** One regex unit per source character, so "m" (folded to "rn") stays a single letter in spelled-out forms. */
const skeletonOf = (s: string): string[] =>
  [...s].map((c) => foldForBrand(c).replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean).map(escapeRe);

/**
 * Accepted spellings (always as a stand-alone word):
 *  - segments joined with optional separators: "PayPal", "Pay Pal", "Pay-Pal", "Deutsche-Bank", "N 26";
 *  - fully spelled out, a separator between EVERY letter: "D H L", "D.H.L", "P a y P a l".
 * Arbitrary partial splits ("in all" for INAIL, "in post" for InPost) do not match.
 * mode affix/prefix additionally match the compact form inside/at the start of longer words.
 */
export function compileEntry(entry: ListEntry): BrandMatcher {
  const segments = nameSegments(entry.name).map(skeletonOf).filter((seg) => seg.length > 0);
  const letters = segments.flat();
  const compact = letters.join('');
  const alts: string[] = [];
  if (entry.nosep) {
    alts.push(`${B_BEFORE}${compact}${B_AFTER}`);
  } else {
    alts.push(`${B_BEFORE}${segments.map((seg) => seg.join('')).join(`${SEP_CHARS}*`)}${B_AFTER}`);
    if (letters.length > 1) alts.push(`${B_BEFORE}${letters.join(`${SEP_CHARS}+`)}${B_AFTER}`);
  }
  if (entry.mode === 'affix') alts.push(compact);
  if (entry.mode === 'prefix') alts.push(`${B_BEFORE}${compact}`);
  return {
    entry,
    re: new RegExp(alts.map((a) => `(?:${a})`).join('|'), 'gu'),
    exceptions: entry.except.map((p) => foldForBrand(p)),
  };
}

export interface BrandHit {
  matcher: BrandMatcher;
  /** Offsets into the normalised text. */
  start: number;
  end: number;
}

function coveredByException(folded: string, s: number, e: number, phrases: readonly string[]): boolean {
  for (const p of phrases) {
    if (!p) continue;
    let from = Math.max(0, e - p.length);
    for (;;) {
      const at = folded.indexOf(p, from);
      if (at === -1 || at > s) break;
      if (at + p.length >= e) return true;
      from = at + 1;
    }
  }
  return false;
}

/** Find brand hits in already-normalised text. */
export function findBrandHits(normalised: string, matchers: readonly BrandMatcher[]): BrandHit[] {
  const { text: folded, origin } = foldWithOrigin(normalised);
  const hits: BrandHit[] = [];
  for (const m of matchers) {
    for (const r of folded.matchAll(m.re)) {
      const s = r.index;
      const e = s + r[0].length;
      if (e === s) continue;
      if (coveredByException(folded, s, e, m.exceptions)) continue;
      const start = origin[s] ?? 0;
      const lastSrc = origin[e - 1] ?? start;
      const end = lastSrc + ((normalised.codePointAt(lastSrc) ?? 0) > 0xffff ? 2 : 1);
      hits.push({ matcher: m, start, end });
    }
  }
  return hits;
}

export function compileList(text: string, severity: Severity): { matchers: BrandMatcher[]; problems: string[] } {
  const { entries, problems } = parseList(normalise(text), severity);
  return { matchers: entries.map(compileEntry), problems };
}
