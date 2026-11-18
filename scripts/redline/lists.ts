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
 * Every mode also matches the name with optional separators between its
 * letters ("Pay Pal", "Pay-Pal", "D.H.L", "N 26") as a stand-alone word.
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
const SEP_CLASS = `[${[...new Set(SEP_SOURCE.map((c) => foldForBrand(c) || c))].map(escapeRe).join('')}]*`;
const B_BEFORE = '(?<![\\p{L}\\p{N}])';
const B_AFTER = '(?![\\p{L}\\p{N}])';

export function compileEntry(entry: ListEntry): BrandMatcher {
  const letters = [...foldForBrand(entry.name).replace(/[^\p{L}\p{N}]/gu, '')].map(escapeRe);
  const compact = letters.join('');
  const spaced = entry.nosep ? compact : letters.join(SEP_CLASS);
  const alts = [`${B_BEFORE}${spaced}${B_AFTER}`];
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
