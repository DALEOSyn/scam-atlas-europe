/**
 * Red-line checks (CLAUDE.md Red Lines 1–3). Pure functions over text so they
 * can be unit-tested; the CLI in scripts/redline-lint.ts handles files.
 *
 * Design choice: the linter is deliberately strict. A false positive costs a
 * writer a rewording; a false negative could ship a real domain, IBAN or phone
 * number. When in doubt, rephrase the content (e.g. use letters in reference
 * numbers, mask phone numbers with "•").
 */

import tldList from 'tlds';

export type Category = 'domain' | 'url' | 'markup' | 'iban' | 'phone' | 'brand' | 'qr';

export interface Finding {
  category: Category;
  match: string;
  /** Character offset into the scanned text. */
  index: number;
  message: string;
  /** 1-based line in the scanned text (set by scanText). */
  line?: number;
}

export interface RuleConfig {
  /** Lower-case brand names, matched case-insensitively as whole words. */
  denylist: readonly string[];
  /** Lower-case domains allowed for the "Where to report" screen (subdomains included). */
  domainAllowlist: readonly string[];
}

// ---------------------------------------------------------------------------
// Normalisation

const INVISIBLE_RE = /[\u00AD\u200B-\u200F\u2060-\u2064\uFEFF]/g;

/** Common Cyrillic/Greek homoglyphs of Latin letters (lower-case after folding). */
const HOMOGLYPHS: Record<string, string> = {
  а: 'a', в: 'b', е: 'e', ё: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x',
  і: 'i', ї: 'i', ј: 'j', ѕ: 's', ԁ: 'd', ԛ: 'q', ԝ: 'w', ɡ: 'g',
  α: 'a', β: 'b', ε: 'e', ι: 'i', κ: 'k', ν: 'v', ο: 'o', ρ: 'p', τ: 't', υ: 'u', χ: 'x',
};

/** NFKC, strip invisible characters. Keeps string length stable enough for line lookup of raw text. */
export function normalise(text: string): string {
  return text.normalize('NFKC').replace(INVISIBLE_RE, '');
}

/** For brand matching only: also fold case and homoglyphs. */
export function foldForBrand(text: string): string {
  return Array.from(normalise(text), (c) => {
    const ch = c.toLowerCase();
    return HOMOGLYPHS[ch] ?? ch;
  }).join('');
}

// ---------------------------------------------------------------------------
// Domains

export const FICTIONAL_TLDS = ['example', 'test', 'invalid'] as const;

/**
 * All delegated top-level domains (IANA root zone, via the `tlds` package,
 * lower-case ASCII incl. xn-- punycode). A dotted token is treated as a domain
 * when its last label is a real TLD (so "invoice.pdf" or the inspect path
 * "sender.detail" pass, but "invoice.zip" and "bank.md" are flagged), or when
 * it is URL-shaped (followed by "/", e.g. "bank.zoll/login") whatever its TLD.
 */
const REAL_TLDS: ReadonlySet<string> = new Set(tldList);

const DOMAIN_TOKEN_RE = /(?<![A-Za-z0-9_-])[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+/g;

export function isAllowedDomain(domain: string, allowlist: readonly string[]): boolean {
  const d = domain.toLowerCase();
  const tld = d.slice(d.lastIndexOf('.') + 1);
  if ((FICTIONAL_TLDS as readonly string[]).includes(tld)) return true;
  return allowlist.some((a) => d === a || d.endsWith(`.${a}`));
}

export function findDomains(text: string, allowlist: readonly string[]): Finding[] {
  const out: Finding[] = [];
  for (const m of text.matchAll(DOMAIN_TOKEN_RE)) {
    const token = m[0];
    const tld = token.slice(token.lastIndexOf('.') + 1).toLowerCase();
    if (!/^[a-z]/.test(tld)) continue; // numbers such as 1.99 or v2.0
    const urlShaped = text[m.index + token.length] === '/';
    if (!REAL_TLDS.has(tld) && !urlShaped) continue;
    if (isAllowedDomain(token, allowlist)) continue;
    out.push({
      category: 'domain',
      match: token,
      index: m.index,
      message: `"${token}" looks like a real domain; use .example, .test or .invalid (Red Line 3)`,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// URLs and markup

const URL_RE = /\b(?:https?|ftps?|wss?):\/\/[^\s"'<>)]*|\bjavascript:|\bdata:text\/html/gi;
const FORM_ACTION_RE = /<form\b[^>]*\baction\s*=/gi;
const SCRIPT_RE = /<script\b/gi;

export function findUrls(text: string): Finding[] {
  return [...text.matchAll(URL_RE)].map((m) => ({
    category: 'url' as const,
    match: m[0],
    index: m.index,
    message: `external URL/scheme "${m[0]}" is not allowed in content; show links as bare fictional text (Red Lines 2–3)`,
  }));
}

export function findMarkup(text: string): Finding[] {
  const out: Finding[] = [];
  for (const m of text.matchAll(FORM_ACTION_RE)) {
    out.push({ category: 'markup', match: m[0], index: m.index, message: '<form action=...> is not allowed; game forms never submit anywhere (Red Line 2)' });
  }
  for (const m of text.matchAll(SCRIPT_RE)) {
    out.push({ category: 'markup', match: m[0], index: m.index, message: '<script> is not allowed in content (Red Line 2)' });
  }
  return out;
}

// ---------------------------------------------------------------------------
// IBANs

/** ISO 13616 mod-97 check on a compact, upper-case candidate. */
export function ibanChecksumValid(compact: string): boolean {
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(compact)) return false;
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  let rem = 0;
  for (const ch of rearranged) {
    const v = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem === 1;
}

/** Compact (DE89370400440532013000) or printed in groups (DE89 3704 0044 0532 0130 00). */
const IBAN_CANDIDATE_RE = /(?<![A-Za-z0-9])[A-Za-z]{2}[0-9]{2}(?:[A-Za-z0-9]{11,30}|(?:[ -][A-Z0-9]{4}){2,7}(?:[ -][A-Z0-9]{1,4})?)(?![A-Za-z0-9])/g;

export function ibanCandidates(text: string): { match: string; index: number }[] {
  return [...text.matchAll(IBAN_CANDIDATE_RE)].map((m) => ({ match: m[0], index: m.index }));
}

export function findIbans(text: string): Finding[] {
  const out: Finding[] = [];
  for (const c of ibanCandidates(text)) {
    const compact = c.match.replace(/[ -]/g, '').toUpperCase();
    // Shortest real IBAN is 15 chars (NO); try every prefix so trailing groups can't hide a valid one.
    for (let len = 15; len <= Math.min(34, compact.length); len++) {
      if (ibanChecksumValid(compact.slice(0, len))) {
        out.push({
          category: 'iban',
          match: c.match,
          index: c.index,
          message: `"${c.match}" has a valid IBAN checksum; game IBANs must fail mod-97 (Red Line 3)`,
        });
        break;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Phone numbers

/**
 * Number ranges reserved for fiction/drama, as national-format digit prefixes
 * per country calling code. Seeded with UK Ofcom drama ranges only; the
 * fraud-researcher should verify and extend (e.g. ARCEP ranges for France).
 * Source: Ofcom, "Telephone numbers for use in TV and radio drama programmes".
 */
export const FICTIONAL_PHONE_RANGES: readonly { cc: string; prefix: string; length: number }[] = [
  { cc: '44', prefix: '07700900', length: 11 },
  { cc: '44', prefix: '01134960', length: 11 },
  { cc: '44', prefix: '01144960', length: 11 },
  { cc: '44', prefix: '01154960', length: 11 },
  { cc: '44', prefix: '01164960', length: 11 },
  { cc: '44', prefix: '01174960', length: 11 },
  { cc: '44', prefix: '01184960', length: 11 },
  { cc: '44', prefix: '01214960', length: 11 },
  { cc: '44', prefix: '01314960', length: 11 },
  { cc: '44', prefix: '01414960', length: 11 },
  { cc: '44', prefix: '01514960', length: 11 },
  { cc: '44', prefix: '01614960', length: 11 },
  { cc: '44', prefix: '01914980', length: 11 },
  { cc: '44', prefix: '02079460', length: 11 },
  { cc: '44', prefix: '02896496', length: 11 },
  { cc: '44', prefix: '02920180', length: 11 },
  { cc: '44', prefix: '01632960', length: 11 },
  { cc: '44', prefix: '08081570', length: 11 },
  { cc: '44', prefix: '09098790', length: 11 },
  { cc: '44', prefix: '03069990', length: 11 },
];

export function isFictionalPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  const intl = raw.trim().startsWith('+') ? digits : digits.startsWith('00') ? digits.slice(2) : undefined;
  return FICTIONAL_PHONE_RANGES.some((r) => {
    const national = intl === undefined ? digits : intl.startsWith(r.cc) ? `0${intl.slice(r.cc.length)}` : undefined;
    return national !== undefined && national.length === r.length && national.startsWith(r.prefix);
  });
}

/** Characters that count as masking when they appear inside a number. */
const MASK_CHARS = /[•●∙·*…#]|xx|XX/;
const PHONE_CANDIDATE_RE = /(?<![A-Za-z0-9.,/])(?:\+|\(?0)?[0-9•●∙·*…#xX][0-9•●∙·*…#xX \-./()]{5,}[0-9•●∙·*…#xX]/g;
const DATE_TIME_RE = /\b\d{1,4}[./-]\d{1,2}[./-]\d{1,4}\b|\b\d{1,2}:\d{2}\b/g;

export function findPhones(text: string): Finding[] {
  // Blank out dates/times and IBAN-shaped tokens (checked separately) so they are not read as phones.
  let scrubbed = text.replace(DATE_TIME_RE, (s) => ' '.repeat(s.length));
  for (const c of ibanCandidates(scrubbed)) {
    scrubbed = scrubbed.slice(0, c.index) + ' '.repeat(c.match.length) + scrubbed.slice(c.index + c.match.length);
  }
  const out: Finding[] = [];
  for (const m of scrubbed.matchAll(PHONE_CANDIDATE_RE)) {
    const cand = m[0].trim();
    if (MASK_CHARS.test(cand)) continue;
    const digits = cand.replace(/\D/g, '');
    const prefixed = /^(?:\+|\(?0)/.test(cand);
    // +/0-prefixed: 7+ digits looks dialable. Otherwise (e.g. ES/IT style 612 345 678) 9+ digits.
    if (digits.length < (prefixed ? 7 : 9)) continue;
    if (isFictionalPhone(cand)) continue;
    out.push({
      category: 'phone',
      match: cand,
      index: m.index + m[0].indexOf(cand),
      message: `"${cand}" looks like a dialable phone number; mask it (e.g. "+49 ••• ••• 0173") or use a fiction-reserved range (Red Line 3)`,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Brands

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function compileDenylist(names: readonly string[]): RegExp | undefined {
  const parts = names
    .map((n) => foldForBrand(n.trim()))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((n) => escapeRe(n).replace(/\s+/g, '[\\s\\-_]*'));
  if (parts.length === 0) return undefined;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join('|')})(?![\\p{L}\\p{N}])`, 'gu');
}

export function findBrands(text: string, denylist: RegExp | undefined): Finding[] {
  if (!denylist) return [];
  const folded = foldForBrand(text);
  return [...folded.matchAll(denylist)].map((m) => ({
    category: 'brand' as const,
    match: m[0],
    index: m.index,
    message: `"${m[0]}" is a real brand on the denylist; use a fictional brand from content/brands.yaml (Red Line 1)`,
  }));
}

// ---------------------------------------------------------------------------
// QR payloads (structured check; see redline-lint.ts for the YAML walk)

export const QR_ROUTE_RE = /^\/qr\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkQrPayload(value: string): Finding[] {
  if (QR_ROUTE_RE.test(value.trim())) return [];
  return [{ category: 'qr', match: value, index: 0, message: `QR payload "${value}" must be an in-game route /qr/<id> (Red Line 3)` }];
}

// ---------------------------------------------------------------------------

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

export function scanText(text: string, cfg: RuleConfig, denylistRe = compileDenylist(cfg.denylist)): Finding[] {
  const t = normalise(text);
  const folded = foldForBrand(text);
  const withLine = (src: string) => (f: Finding): Finding => ({ ...f, line: lineOf(src, f.index) });
  return [
    ...findDomains(t, cfg.domainAllowlist).map(withLine(t)),
    ...findUrls(t).map(withLine(t)),
    ...findMarkup(t).map(withLine(t)),
    ...findIbans(t).map(withLine(t)),
    ...findPhones(t).map(withLine(t)),
    ...findBrands(folded, denylistRe).map(withLine(folded)),
  ];
}
