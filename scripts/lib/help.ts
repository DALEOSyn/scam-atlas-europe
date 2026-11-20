/**
 * Help checker for content/help/where-to-report.en.yaml (T-4.2; G1 question 6, G3 2026-11-20).
 *
 * This is the one content file allowed to hold real bodies, phone numbers, e-mail addresses and URLs (Red Line 1:
 * real organisations are named only on the "Where to report" screen). redline:lint exempts exactly this file from
 * its domain, URL, phone and brand rules (scripts/redline-lint.ts, HELP_FILE) and runs this checker on it instead.
 * content:validate and the build run it too.
 *
 * Checks:
 * - shape (helpFileSchema): every row has `checked` (a real YYYY-MM-DD date), links are https with no query string;
 * - every `sources` id exists in content/sources.yaml (and is not a placeholder);
 * - every link host is on HELP_LINK_HOSTS and every e-mail domain on HELP_EMAIL_DOMAINS (exact match);
 * - player-visible text holds no URL or scheme, and names no domain other than an allowed help host;
 * - `review_note` and `sources` never reach the bundle (helpProjection drops them, eu_crisis included; checked here on the output);
 * - no support row is a suicide or crisis line (those are role `crisis`, WHERE_TO_REPORT §3b round 2).
 */
import { HELP_PINNED_STEPS } from '../../src/content/constants.ts';
import { helpFileSchema, type HelpFile } from '../../src/content/schema.ts';
import { findDomains, findMarkup, findUrls, normalise } from '../redline/rules.ts';
import { HELP_EMAIL_DOMAINS, HELP_LINK_HOSTS, isHelpLinkHost } from './source-hosts.ts';

/** Path of the file, relative to the repo root (the redline exemption matches its resolved absolute path). */
export const HELP_FILE_REL = 'content/help/where-to-report.en.yaml';

/** Keys that exist for reviewers only and must never be rendered or shipped. */
export const HELP_HIDDEN_KEYS = ['review_note', 'sources'] as const;

export interface HelpCheckOptions {
  linkHosts?: readonly string[];
  emailDomains?: readonly string[];
}

export interface HelpCheckResult {
  errors: string[];
  data?: HelpFile;
}

/** Source registry view: id → placeholder flag. */
export type SourceIndex = ReadonlyMap<string, { placeholder?: boolean }>;

/** A support line is never a suicide or crisis line (§3b round 2). Words in the languages of the listed lines. */
const CRISIS_WORDS = /suicid|ending your life|zelfmoord|självmord|selbstmord|suizid/iu;

/** Every player-visible string in the file, with where it lives (review_note and sources are not shown). */
export function helpPlayerText(f: HelpFile): { at: string; text: string }[] {
  const out: { at: string; text: string }[] = [];
  const add = (at: string, text: string | undefined) => {
    if (text !== undefined) out.push({ at, text });
  };
  add('meta.intro', f.meta.intro);
  add('meta.disclaimer', f.meta.disclaimer);
  add('meta.external_links_note', f.meta.external_links_note);
  f.first_steps.forEach((s, i) => {
    add(`first_steps.${i}.title`, s.title);
    add(`first_steps.${i}.body`, s.body);
  });
  for (const [k, fb] of Object.entries(f.fallbacks)) add(`fallbacks.${k}.body`, fb.body);
  f.eu.forEach((e, i) => {
    add(`eu.${i}.name`, e.name);
    add(`eu.${i}.body`, e.body);
  });
  if (f.eu_crisis) {
    add('eu_crisis.name', f.eu_crisis.name);
    add('eu_crisis.body', f.eu_crisis.body);
    f.eu_crisis.phones?.forEach((p, j) => {
      add(`eu_crisis.phones.${j}.number`, p.number);
      add(`eu_crisis.phones.${j}.label`, p.label);
    });
  }
  for (const [cc, rows] of Object.entries(f.countries)) {
    rows.forEach((e, i) => {
      const at = `countries.${cc}.${i}`;
      add(`${at}.name`, e.name);
      add(`${at}.body`, e.body);
      add(`${at}.scope`, e.scope);
      e.phones?.forEach((p, j) => {
        add(`${at}.phones.${j}.number`, p.number);
        add(`${at}.phones.${j}.label`, p.label);
      });
      add(`${at}.email`, e.email);
    });
  }
  return out;
}

/** True when a domain named in player text is an allowed help host, its bare form (no www.) or an e-mail domain. */
function allowedNamedDomain(domain: string, linkHosts: readonly string[], emailDomains: readonly string[]): boolean {
  const d = domain.toLowerCase();
  return emailDomains.includes(d) || linkHosts.some((h) => h === d || h === `www.${d}`);
}

/** Deep search for a key anywhere in a JSON-like value. */
export function hasKeyDeep(value: unknown, keys: readonly string[]): string[] {
  const hits: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}.${i}`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (keys.includes(k)) hits.push(`${path}.${k}`.replace(/^\./, ''));
        walk(x, `${path}.${k}`);
      }
    }
  };
  walk(value, '');
  return hits;
}

/**
 * What the game bundle gets for the help file: the parsed data without review_note and sources (not shown).
 * Throws on a schema failure, like the other YAML projections (the build fails loudly).
 */
export function helpProjection(raw: unknown): unknown {
  const f = helpFileSchema.parse(raw);
  const strip = <T extends object>(o: T): Partial<T> =>
    Object.fromEntries(Object.entries(o).filter(([k]) => !(HELP_HIDDEN_KEYS as readonly string[]).includes(k))) as Partial<T>;
  return {
    meta: strip(f.meta),
    first_steps: f.first_steps.map(strip),
    fallbacks: Object.fromEntries(Object.entries(f.fallbacks).map(([k, v]) => [k, strip(v)])),
    eu: f.eu.map(strip),
    ...(f.eu_crisis ? { eu_crisis: strip(f.eu_crisis) } : {}),
    countries: Object.fromEntries(Object.entries(f.countries).map(([cc, rows]) => [cc, rows.map(strip)])),
  };
}

/** Run every help check on the parsed YAML of the help file. */
export function checkHelp(raw: unknown, sources: SourceIndex, opts: HelpCheckOptions = {}): HelpCheckResult {
  const linkHosts = opts.linkHosts ?? HELP_LINK_HOSTS;
  const emailDomains = opts.emailDomains ?? HELP_EMAIL_DOMAINS;
  const res = helpFileSchema.safeParse(raw);
  if (!res.success) return { errors: res.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`) };
  const f = res.data;
  const errors: string[] = [];

  // Source ids.
  const cite = (at: string, ids: readonly string[]) => {
    for (const id of ids) {
      const s = sources.get(id);
      if (!s) errors.push(`${at}.sources: unknown source id "${id}" (add it to content/sources.yaml)`);
      else if (s.placeholder) errors.push(`${at}.sources: "${id}" is a placeholder source`);
    }
  };
  f.first_steps.forEach((s, i) => cite(`first_steps.${i}`, s.sources));
  for (const [k, fb] of Object.entries(f.fallbacks)) cite(`fallbacks.${k}`, fb.sources);
  f.eu.forEach((e, i) => cite(`eu.${i}`, e.sources));
  if (f.eu_crisis) cite('eu_crisis', f.eu_crisis.sources);
  for (const [cc, rows] of Object.entries(f.countries)) rows.forEach((e, i) => cite(`countries.${cc}.${i}`, e.sources));

  // Link hosts and e-mail domains (exact match).
  const link = (at: string, url: string | undefined) => {
    if (url !== undefined && !isHelpLinkHost(url, linkHosts)) errors.push(`${at}.url: host of "${url}" is not on HELP_LINK_HOSTS (scripts/lib/source-hosts.ts)`);
  };
  f.eu.forEach((e, i) => link(`eu.${i}`, e.url));
  for (const [cc, rows] of Object.entries(f.countries)) {
    rows.forEach((e, i) => {
      const at = `countries.${cc}.${i}`;
      link(at, e.url);
      if (e.email !== undefined) {
        const domain = e.email.slice(e.email.lastIndexOf('@') + 1);
        if (!emailDomains.includes(domain)) errors.push(`${at}.email: domain "${domain}" is not on HELP_EMAIL_DOMAINS (scripts/lib/source-hosts.ts)`);
      }
      if (e.role === 'support' && [e.name, e.body, ...(e.phones ?? []).map((p) => p.label)].some((x) => CRISIS_WORDS.test(x))) {
        errors.push(`${at}: a support row is never a suicide or crisis line; use role crisis (WHERE_TO_REPORT §3b)`);
      }
    });
  }

  // Player-visible text: links only through `url`; named domains only if allowed; no markup.
  for (const { at, text } of helpPlayerText(f)) {
    if (at.endsWith('.email')) continue; // checked above
    const t = normalise(text);
    for (const u of findUrls(t)) errors.push(`${at}: "${u.match}": player text holds no URL or scheme; put the page in \`url\``);
    for (const d of findDomains(t, [])) if (!allowedNamedDomain(d.match, linkHosts, emailDomains)) errors.push(`${at}: names the domain "${d.match}", which is not an allowed help host`);
    for (const m of findMarkup(t)) errors.push(`${at}: ${m.message}`);
  }

  // Hidden keys never reach the bundle.
  for (const hit of hasKeyDeep(helpProjection(raw), HELP_HIDDEN_KEYS)) errors.push(`${hit}: must not be shipped to the game (helpProjection)`);

  // The psychologist's ruling pins these first steps at the top of every help list (src/content/help.ts).
  for (const id of HELP_PINNED_STEPS) if (!f.first_steps.some((s) => s.id === id)) errors.push(`first_steps: the pinned step "${id}" is missing`);

  // A listed country has at least one row for the scam help screen (harassment rows show only on their own card).
  for (const [cc, rows] of Object.entries(f.countries)) {
    if (!rows.some((e) => e.role !== 'harassment')) errors.push(`countries.${cc}: no row for the scam help screen`);
  }

  return errors.length > 0 ? { errors } : { errors, data: f };
}
