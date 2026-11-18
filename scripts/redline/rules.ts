/**
 * Red-line checks (CLAUDE.md Red Lines 1–3). Pure functions over text so they
 * can be unit-tested; the CLI in scripts/redline-lint.ts handles files.
 *
 * The linter is a safety net behind human review, tuned to be strict: a false
 * positive costs a writer a rewording, a false negative could ship a real
 * domain, IBAN, phone number or brand. When in doubt, rephrase the content
 * (use letters in reference numbers, mask phone numbers with "•").
 */
import { normalise } from './fold.ts';
import { findBrandHits, type BrandMatcher, type Severity } from './lists.ts';

export { normalise, foldForBrand } from './fold.ts';

export type Category = 'domain' | 'url' | 'markup' | 'iban' | 'phone' | 'brand' | 'qr' | 'asset';

export interface Finding {
  category: Category;
  severity: Severity;
  match: string;
  /** Character offset into the scanned (normalised) text. */
  index: number;
  message: string;
  /** 1-based line in the scanned text (set by scanText). */
  line?: number;
}

export interface RuleConfig {
  /** Compiled denylist (errors) and warnlist (warnings). */
  brands: readonly BrandMatcher[];
  /** Lower-case real domains allowed for the "Where to report" screen (subdomains included). */
  domainAllowlist: readonly string[];
}

const err = (category: Category, match: string, index: number, message: string): Finding => ({
  category,
  severity: 'error',
  match,
  index,
  message,
});

// ---------------------------------------------------------------------------
// Domains: inverted rule. Every label.label token whose last label is
// alphabetic (any script, 2+ letters, or xn-- punycode) is a domain unless
// its TLD is fictional, it is on the report-screen allowlist, or it is a known
// non-domain (engine paths, file names).

export const FICTIONAL_TLDS = ['example', 'test', 'invalid'] as const;

/** File extensions that are not delegated TLDs. Real TLDs such as .zip, .mov, .md, .py stay flagged. */
const FILE_EXTENSIONS = new Set([
  'pdf', 'exe', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'csv', 'txt', 'rtf',
  'html', 'htm', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'heic', 'bmp', 'mp3', 'mp4', 'wav', 'ogg',
  'yaml', 'yml', 'json', 'js', 'ts', 'tsx', 'jsx', 'apk', 'msi', 'scr', 'bat', 'cmd', 'rar', 'iso', 'ics', 'vcf',
  'lnk', 'jar', 'dmg', 'pkg', 'webmanifest',
]);

/** Dotted tokens that are engine paths or abbreviations, never domains. */
export const NON_DOMAIN_TOKENS = new Set([
  'e.g', 'i.e', 'sender.detail', 'sender.display', 'message.body', 'message.subject', 'message.sender',
  'message.sender.detail', 'message.sender.display', 'message.qr', 'message.qr.payload', 'qr.payload', 'qr.caption',
]);

const LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]*[\\p{L}\\p{N}])?';
const DOMAIN_TOKEN_RE = new RegExp(`(?<![\\p{L}\\p{N}_-])${LABEL}(?:\\.${LABEL})+`, 'gu');
const ALPHA_TLD_RE = /^(?:\p{L}{2,}|xn--[a-z0-9-]+)$/u;

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
    const lower = token.toLowerCase();
    const tld = lower.slice(lower.lastIndexOf('.') + 1);
    if (!ALPHA_TLD_RE.test(tld)) continue; // 1.99, v2.0, 18.11.2026
    if (FILE_EXTENSIONS.has(tld) || NON_DOMAIN_TOKENS.has(lower)) continue;
    if (isAllowedDomain(lower, allowlist)) continue;
    out.push(err('domain', token, m.index, `"${token}" looks like a real domain; use .example, .test or .invalid (Red Line 3)`));
  }
  return out;
}

// ---------------------------------------------------------------------------
// URLs, schemes and markup

const URL_RE = /\b(?:https?|ftps?|wss?):\/\/[^\s"'<>)]*|\b(?:javascript|mailto|vbscript):|\bdata:text\/html/gi;

/** XML namespace identifiers in SVG/HTML: not links, never fetched. */
export const XML_NAMESPACE_URLS = [
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  'http://www.w3.org/1999/xhtml',
  'http://www.w3.org/XML/1998/namespace',
] as const;

export function blankNamespaces(text: string): string {
  let out = text;
  for (const ns of XML_NAMESPACE_URLS) {
    for (const q of ['"', "'"]) out = out.split(`${q}${ns}${q}`).join(`${q}${' '.repeat(ns.length)}${q}`);
  }
  return out;
}

/** SVG geometry attributes hold numbers, not content; blank them so they are not read as phones/IBANs. */
const SVG_GEOMETRY_RE =
  /(\s(?:d|points|viewBox|transform|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|width|height|stroke-width|stroke-dasharray|stroke-dashoffset|offset|font-size|letter-spacing)\s*=\s*)("[^"]*"|'[^']*')/g;

export function blankSvgGeometry(svg: string): string {
  return svg.replace(SVG_GEOMETRY_RE, (_, attr: string, value: string) => `${attr}${value[0]}${' '.repeat(value.length - 2)}${value[0]}`);
}

export function findUrls(text: string): Finding[] {
  return [...text.matchAll(URL_RE)].map((m) =>
    err('url', m[0], m.index, `external URL/scheme "${m[0]}" is not allowed in content; show links as bare fictional text (Red Lines 2–3)`),
  );
}

const MARKUP_RULES: readonly [RegExp, string][] = [
  [/<form\b[^>]*\baction\s*=/gi, '<form action=...> is not allowed; game forms never submit anywhere (Red Line 2)'],
  [/<(?:script|iframe|object|embed|meta|base)\b/gi, 'active or embedding HTML elements are not allowed in content (Red Line 2)'],
  [/<[a-z][^>]*?\son[a-z]+\s*=/gi, 'inline event handlers (on...=) are not allowed in content (Red Line 2)'],
];

export function findMarkup(text: string): Finding[] {
  return MARKUP_RULES.flatMap(([re, message]) => [...text.matchAll(re)].map((m) => err('markup', m[0], m.index, message)));
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

/**
 * Country code, 2 check digits, then 11–30 alphanumerics with any single
 * [ .-] separators (upper case, as IBANs are printed), or a compact
 * lower-case run.
 */
const IBAN_CANDIDATE_RES = [
  /(?<![A-Za-z0-9])[A-Z]{2}[ .-]?[0-9]{2}(?:[ .-]?[A-Z0-9]){11,30}(?![A-Za-z0-9])/g,
  /(?<![A-Za-z0-9])[a-z]{2}[0-9]{2}[a-z0-9]{11,30}(?![A-Za-z0-9])/g,
];

export function ibanCandidates(text: string): { match: string; index: number }[] {
  return IBAN_CANDIDATE_RES.flatMap((re) => [...text.matchAll(re)].map((m) => ({ match: m[0], index: m.index })));
}

export function findIbans(text: string): Finding[] {
  const out: Finding[] = [];
  for (const c of ibanCandidates(text)) {
    const compact = c.match.replace(/[ .-]/g, '').toUpperCase();
    // Shortest real IBAN is 15 chars (NO); try every prefix so trailing text can't hide a valid one.
    for (let len = 15; len <= Math.min(34, compact.length); len++) {
      if (ibanChecksumValid(compact.slice(0, len))) {
        out.push(err('iban', c.match, c.index, `"${c.match}" has a valid IBAN checksum; game IBANs must fail mod-97 (Red Line 3)`));
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
  '07700900', '01134960', '01144960', '01154960', '01164960', '01174960', '01184960', '01214960', '01314960',
  '01414960', '01514960', '01614960', '01914980', '02079460', '02896496', '02920180', '01632960', '08081570',
  '09098790', '03069990',
].map((prefix) => ({ cc: '44', prefix, length: 11 }));

export function isFictionalPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  const intl = raw.trim().startsWith('+') ? digits : digits.startsWith('00') ? digits.slice(2) : undefined;
  return FICTIONAL_PHONE_RANGES.some((r) => {
    const national = intl === undefined ? digits : intl.startsWith(r.cc) ? `0${intl.slice(r.cc.length)}` : undefined;
    return national !== undefined && national.length === r.length && national.startsWith(r.prefix);
  });
}

/**
 * Only plausible dates are blanked before the phone check: D.M.YY(YY) with
 * day <= 31 and month <= 12 (separator . / or -, used consistently), or ISO
 * YYYY-MM-DD, and never when glued to more digit groups
 * (so "06.12.34.56.78" stays a phone number).
 */
const DATE_RES = [
  /(?<![\d+][./-]?|[./-])(?:0?[1-9]|[12]\d|3[01])([./-])(?:0?[1-9]|1[0-2])\1(?:\d{4}|\d{2})(?![./-]?\d)/g,
  /(?<![\d+][./-]?|[./-])\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?![./-]?\d)/g,
];

/**
 * A digit run: optional "+", digits joined by single separators [ -./()].
 * Mask characters (•, *, #, x, …) are not part of a run, so every unmasked
 * run is judged on its own and trailing masks cannot hide a full number.
 */
const PHONE_RUN_RE = /(?<![\p{L}\p{N}])\+?\(?\d(?:[ \-./()]{0,2}\d)*/gu;

function blank(text: string, start: number, length: number): string {
  return text.slice(0, start) + ' '.repeat(length) + text.slice(start + length);
}

export function findPhones(text: string): Finding[] {
  let scrubbed = text;
  for (const re of DATE_RES) for (const m of text.matchAll(re)) scrubbed = blank(scrubbed, m.index, m[0].length);
  for (const c of ibanCandidates(scrubbed)) scrubbed = blank(scrubbed, c.index, c.match.length);
  const out: Finding[] = [];
  for (const m of scrubbed.matchAll(PHONE_RUN_RE)) {
    const cand = m[0];
    const digits = cand.replace(/\D/g, '');
    // Trunk/international prefix: "+", "00", "0" directly followed by a digit 1-9, or "(0".
    const prefixed = /^(?:\+|00|0[1-9]|\(0)/.test(cand);
    // +/0-prefixed: 7+ digits look dialable. Otherwise (e.g. ES/IT style 612 345 678) 9+ digits.
    if (digits.length < (prefixed ? 7 : 9)) continue;
    if (isFictionalPhone(cand)) continue;
    out.push(
      err('phone', cand, m.index, `"${cand}" looks like a dialable phone number; mask it (e.g. "+49 151 •••• 0173") or use a fiction-reserved range (Red Line 3)`),
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// Brands

export function findBrands(text: string, matchers: readonly BrandMatcher[]): Finding[] {
  return findBrandHits(text, matchers).map(({ matcher, start, end }) => {
    const match = text.slice(start, end);
    const { entry } = matcher;
    return {
      category: 'brand' as const,
      severity: entry.severity,
      match,
      index: start,
      message:
        entry.severity === 'error'
          ? `"${match}" matches the real brand "${entry.name}" (denylist); use a fictional brand from content/brands.yaml (Red Line 1)`
          : `"${match}" may refer to the real brand "${entry.name}" (warnlist); check it is not used as a brand, or add an except: phrase`,
    };
  });
}

// ---------------------------------------------------------------------------
// QR payloads (structured check; see redline-lint.ts for the YAML walk)

export const QR_ROUTE_RE = /^\/qr\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkQrPayload(value: string): Finding[] {
  if (QR_ROUTE_RE.test(value.trim())) return [];
  return [err('qr', value, 0, `QR payload "${value}" must be an in-game route /qr/<id> (Red Line 3)`)];
}

// ---------------------------------------------------------------------------

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

export function scanText(text: string, cfg: RuleConfig): Finding[] {
  const t = normalise(blankNamespaces(text));
  return [
    ...findDomains(t, cfg.domainAllowlist),
    ...findUrls(t),
    ...findMarkup(t),
    ...findIbans(t),
    ...findPhones(t),
    ...findBrands(t, cfg.brands),
  ].map((f) => ({ ...f, line: lineOf(t, f.index) }));
}
