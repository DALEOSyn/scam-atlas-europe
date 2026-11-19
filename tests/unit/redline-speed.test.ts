/**
 * CR-47: the red-line linter's speed-ups must not change a single finding.
 *
 * - findBrandHits skips matchers whose separator-free name cannot occur in the
 *   text (bigram index + substring test). It must return exactly what running
 *   every matcher's regex returns (findBrandHitsUnfiltered, the old behaviour).
 * - foldWithOrigin folds each character once and caches it. It must return
 *   exactly what the old lock-step fold returns (foldWithOriginLockstep).
 * - lintText caches results per config, file and text. Repeated calls must
 *   return equal, independent copies.
 *
 * The corpus is adversarial on purpose: every list name in many spellings
 * (spaced, dotted, hyphenated, glued into longer words, homoglyphs, leetspeak,
 * except phrases), the red-line fixtures, and the research briefs in
 * docs/patterns/, which name hundreds of real organisations.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import confusablesData from 'unicode-confusables/data/confusables.json' with { type: 'json' };
import { lintPaths, lintText, loadConfig } from '../../scripts/redline-lint.ts';
import { findBrandHits, findBrandHitsUnfiltered, nameSegments, type BrandHit } from '../../scripts/redline/lists.ts';
import { foldWithOrigin, foldWithOriginLockstep, normalise } from '../../scripts/redline/fold.ts';
import { listFiles } from '../../scripts/lib/content.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const cfg = loadConfig();

/** Homoglyph and leetspeak substitutions used to disguise names. */
const DISGUISE: Readonly<Record<string, string>> = {
  a: String.fromCodePoint(0x0430), // Cyrillic a
  e: '3',
  o: '0',
  i: '1',
  l: '|',
  s: '$',
  c: String.fromCodePoint(0x0441), // Cyrillic es
  p: String.fromCodePoint(0x0440), // Cyrillic er
};

function spellings(name: string, except: readonly string[]): string[] {
  const letters = [...name.replace(/[^\p{L}\p{N}]/gu, '')];
  const segs = nameSegments(name);
  const disguised = [...name].map((c) => DISGUISE[c.toLowerCase()] ?? c).join('');
  const accented = [...name].map((c) => (/[aeiou]/i.test(c) ? `${c}${String.fromCodePoint(0x0301)}` : c)).join('');
  return [
    name,
    name.toUpperCase(),
    name.toLowerCase(),
    letters.join(' '),
    letters.join('.'),
    letters.join('-'),
    letters.join(' . '),
    segs.join(' '),
    segs.join('-'),
    segs.join('_'),
    `x${name}y`,
    `${name}support`,
    `my${name.toLowerCase()}`,
    `pine${name.toLowerCase()}`,
    disguised,
    accented,
    `${name.slice(0, 2)} ${name.slice(2)}`,
    `${name}${String.fromCodePoint(0x200b)}`,
    ...except,
    ...except.map((e) => `${e} and ${name}`),
  ];
}

function corpus(): string[] {
  const lists = ['content/redline-denylist.txt', 'content/redline-warnlist.txt'].map((f) => readFileSync(resolve(ROOT, f), 'utf8'));
  const texts: string[] = [...lists];
  for (const m of cfg.brands) {
    const variants = spellings(m.entry.name, m.entry.except);
    texts.push(variants.join('\n'), ...variants);
  }
  for (const f of listFiles(resolve(ROOT, 'tests/fixtures/redline'), ['.yaml', '.svg', '.html', '.md'])) texts.push(readFileSync(f, 'utf8'));
  for (const f of listFiles(resolve(ROOT, 'docs/patterns'), ['.md'])) texts.push(readFileSync(f, 'utf8'));
  return texts.map((t) => normalise(t));
}

const key = (h: BrandHit): string => `${h.matcher.entry.severity}|${h.matcher.entry.line}|${h.start}|${h.end}`;

describe('CR-47: fast paths give identical results', () => {
  it('findBrandHits equals running every matcher (denylist and warnlist)', () => {
    const texts = corpus();
    let total = 0;
    for (const t of texts) {
      const fast = findBrandHits(t, cfg.brands).map(key);
      const reference = findBrandHitsUnfiltered(t, cfg.brands).map(key);
      expect(fast).toEqual(reference);
      total += reference.length;
    }
    // The corpus must exercise the matchers, not pass vacuously.
    expect(total).toBeGreaterThan(cfg.brands.length * 5);
  }, 30_000); // the unfiltered reference is the old, slow path (~5 s locally)

  it('every list name is still found by its own matcher (known gaps pinned)', () => {
    // Pre-existing before CR-47 (the unfiltered reference agrees): "Cl@ve" is split at "@" into
    // cl|ve, but the text fold turns "@" into "a", so the entry cannot match. Reported for a list
    // fix; when it is fixed, remove it here.
    const KNOWN_GAPS = ['Cl@ve'];
    const missed: string[] = [];
    for (const m of cfg.brands) {
      // nosep names match only without separators ("Just Eat | nosep" matches "JustEat").
      const name = m.entry.nosep ? m.entry.name.replace(/[^\p{L}\p{N}]/gu, '') : m.entry.name;
      const t = normalise(name);
      const hits = findBrandHits(t, cfg.brands);
      expect(hits.map(key)).toEqual(findBrandHitsUnfiltered(t, cfg.brands).map(key));
      if (!hits.some((h) => h.matcher === m)) missed.push(m.entry.name);
    }
    expect(missed).toEqual(KNOWN_GAPS);
  });

  it('foldWithOrigin equals the lock-step fold, incl. every confusable and repeated calls', () => {
    const confusables = Object.keys(confusablesData as Record<string, string>).join(' ');
    const texts = [confusables, ...corpus().slice(0, 50), 'D.H.L Pay Pal 0123456789 |$@ ', confusables];
    for (const t of texts) {
      const n = normalise(t);
      expect(foldWithOrigin(n)).toEqual(foldWithOriginLockstep(n));
    }
  });

  it('lintText returns the same findings on repeated calls, as independent copies', () => {
    const file = resolve(ROOT, 'tests/fixtures/redline/bad-brand.yaml');
    const text = readFileSync(file, 'utf8');
    const first = lintText(file, text, cfg);
    expect(first.length).toBeGreaterThan(0);
    const firstCopy = structuredClone(first);
    const head = first[0];
    if (head) head.match = 'mutated';
    first.pop();
    expect(lintText(file, text, cfg)).toEqual(firstCopy);
    // A different text for the same path is linted afresh.
    expect(lintText(file, `${text}\nnote: "paketpilot.com"\n`, cfg).some((f) => f.category === 'domain')).toBe(true);
    // A different config object is not served from another config's cache.
    expect(lintText(file, text, { ...cfg, brands: [] }).some((f) => f.category === 'brand')).toBe(false);
  });

  it('linting the same paths twice gives identical findings', () => {
    const paths = [resolve(ROOT, 'tests/fixtures/redline')];
    const a = lintPaths(paths, cfg);
    expect(a.length).toBeGreaterThan(0);
    expect(lintPaths(paths, cfg)).toEqual(a);
  });
});
