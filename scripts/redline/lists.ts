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
  /**
   * The name's letter units joined without separators. Every spelling `re`
   * accepts consists of exactly these units, in order, with only SEP_CHARS
   * between them, so a text can match `re` only if it contains `compact`
   * once all SEP_CHARS are removed (see findBrandHits, CR-47).
   */
  compact: string;
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
const SEP_RE = new RegExp(SEP_CHARS, 'gu');
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

/** One unit per source character, so "m" (folded to "rn") stays a single letter in spelled-out forms. Units are literal letters/digits. */
const skeletonOf = (s: string): string[] =>
  [...s].map((c) => foldForBrand(c).replace(/[^\p{L}\p{N}]/gu, '')).filter(Boolean);

/**
 * Accepted spellings (always as a stand-alone word):
 *  - segments joined with optional separators: "PayPal", "Pay Pal", "Pay-Pal", "Deutsche-Bank", "N 26";
 *  - fully spelled out, a separator between EVERY letter: "D H L", "D.H.L", "P a y P a l".
 * Arbitrary partial splits ("in all" for INAIL, "in post" for InPost) do not match.
 * mode affix/prefix additionally match the compact form inside/at the start of longer words.
 */
export function compileEntry(entry: ListEntry): BrandMatcher {
  const literalSegments = nameSegments(entry.name).map(skeletonOf).filter((seg) => seg.length > 0);
  const literal = literalSegments.flat().join('');
  const segments = literalSegments.map((seg) => seg.map(escapeRe));
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
    compact: literal,
  };
}

export interface BrandHit {
  matcher: BrandMatcher;
  /** Offsets into the normalised text. */
  start: number;
  end: number;
}

interface BigramIndex {
  /** Matcher positions by the first two UTF-16 units of `compact`. */
  byBigram: Map<string, number[]>;
  /** Matchers whose `compact` is shorter than two units: always candidates. */
  always: number[];
}

const bigramIndexes = new WeakMap<readonly BrandMatcher[], BigramIndex>();

function bigramIndex(matchers: readonly BrandMatcher[]): BigramIndex {
  let index = bigramIndexes.get(matchers);
  if (index) return index;
  index = { byBigram: new Map(), always: [] };
  matchers.forEach((m, i) => {
    if (m.compact.length < 2) {
      index.always.push(i);
      return;
    }
    const key = m.compact.slice(0, 2);
    const list = index.byBigram.get(key);
    if (list) list.push(i);
    else index.byBigram.set(key, [i]);
  });
  bigramIndexes.set(matchers, index);
  return index;
}

/**
 * Matchers whose `compact` could occur in `stripped`: an occurrence implies its
 * first two units occur adjacently, so only matchers keyed by a bigram present
 * in the text are returned. Original list order is kept, so hits come out in
 * the same order as a plain loop over all matchers.
 */
function candidateMatchers(stripped: string, matchers: readonly BrandMatcher[]): BrandMatcher[] {
  const { byBigram, always } = bigramIndex(matchers);
  const picked = new Set<number>(always);
  const seen = new Set<string>();
  for (let i = 0; i + 1 < stripped.length; i++) {
    const key = stripped.slice(i, i + 2);
    if (seen.has(key)) continue;
    seen.add(key);
    for (const idx of byBigram.get(key) ?? []) picked.add(idx);
  }
  return [...picked].sort((a, b) => a - b).map((i) => matchers[i] as BrandMatcher);
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

/**
 * Find brand hits in already-normalised text.
 *
 * Speed (CR-47): running ~470 Unicode regexes with lookbehinds over every
 * string was ~90% of the linter's time. Each matcher's regex can only match
 * a run of its letter units (`compact`, literal alphanumerics) with
 * separators from SEP_CHARS in between, so deleting every SEP_CHARS
 * character from the text turns any match into a literal occurrence of
 * `compact`. A plain substring test on that stripped text is therefore a
 * sound pre-filter: it never skips a matcher that could match, and the
 * matcher's own regex (unchanged) still decides every hit, its offsets,
 * overlaps and except: phrases. Findings are identical; only matchers that
 * cannot match are skipped.
 */
export function findBrandHits(normalised: string, matchers: readonly BrandMatcher[]): BrandHit[] {
  return brandHits(normalised, matchers, true);
}

/** Reference for tests: every matcher's regex over the text, no pre-filter (the pre-CR-47 behaviour). */
export function findBrandHitsUnfiltered(normalised: string, matchers: readonly BrandMatcher[]): BrandHit[] {
  return brandHits(normalised, matchers, false);
}

function brandHits(normalised: string, matchers: readonly BrandMatcher[], prefilter: boolean): BrandHit[] {
  const { text: folded, origin } = foldWithOrigin(normalised);
  const stripped = prefilter ? folded.replace(SEP_RE, '') : '';
  const hits: BrandHit[] = [];
  for (const m of prefilter ? candidateMatchers(stripped, matchers) : matchers) {
    if (prefilter && !stripped.includes(m.compact)) continue;
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
