/**
 * Runtime "Where to report and get help" data (content/help/where-to-report.en.yaml, T-4.2). Validated at build
 * time by scripts/lib/help.ts; the bundle gets helpProjection's output (no review_note, no sources), so the
 * runtime trusts the shape and ships without Zod.
 *
 * Card order (WHERE_TO_REPORT §3c):
 * - scam help: bank · "Report it" (report, then advice, then police) · support · child · crisis, last and on its own;
 * - sensitive-scene help ("Need to talk?"): support · child · crisis · bank · "Report it".
 * A missing role shows `fallbacks.<role>`; there is no crisis fallback (no verified crisis line → no crisis row).
 * `harassment` rows belong to the sextortion / online-harassment card only and never show here.
 * "EU / other country" (the default) shows the EU-wide entries in "Report it" plus the fallbacks.
 */
import data from '../../content/help/where-to-report.en.yaml';
import type { HelpEntry, HelpFallback, HelpFile } from './schema.ts';

type Shipped<T> = Omit<T, 'review_note' | 'sources'>;
export type HelpRowData = Shipped<HelpEntry>;
export interface HelpData {
  meta: Shipped<HelpFile['meta']>;
  fallbacks: Record<keyof HelpFile['fallbacks'], Shipped<HelpFallback>>;
  eu: Shipped<HelpFile['eu'][number]>[];
  countries: Record<string, HelpRowData[]>;
}

export type HelpGroupKind = 'bank' | 'report' | 'support' | 'child' | 'crisis';
export type HelpMode = 'scam' | 'sensitive';

/** One row on a card: a verified entry, or a fallback (no name, no number). */
export interface HelpRow {
  id: string;
  name?: string;
  body: string;
  phones?: readonly { number: string; label: string }[];
  email?: string;
  url?: string;
  scope?: string;
  checked: string;
  fallback: boolean;
}

export interface HelpGroup {
  kind: HelpGroupKind;
  rows: HelpRow[];
}

export const SCAM_ORDER: readonly HelpGroupKind[] = ['bank', 'report', 'support', 'child', 'crisis'];
export const SENSITIVE_ORDER: readonly HelpGroupKind[] = ['support', 'child', 'crisis', 'bank', 'report'];

/** The bundled data, or null when it is missing or malformed (the UI then shows the generic list). */
export function helpData(raw: unknown = data): HelpData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<HelpData>;
  const ok = !!d.meta && !!d.fallbacks && Array.isArray(d.eu) && !!d.countries && typeof d.countries === 'object';
  return ok ? (d as HelpData) : null;
}

/** Country codes with verified entries, as stored. */
export function helpCountries(d: HelpData): string[] {
  return Object.keys(d.countries);
}

/** A stored choice that the data knows, else null ("EU / other country"). */
export function knownCountry(d: HelpData, country: string | null | undefined): string | null {
  return country && Object.hasOwn(d.countries, country) ? country : null;
}

const row = (e: HelpRowData): HelpRow => ({
  id: e.id,
  name: e.name,
  body: e.body,
  ...(e.phones ? { phones: e.phones } : {}),
  ...(e.email ? { email: e.email } : {}),
  ...(e.url ? { url: e.url } : {}),
  ...(e.scope ? { scope: e.scope } : {}),
  checked: e.checked,
  fallback: false,
});

const fallbackRow = (id: string, f: Shipped<HelpFallback>): HelpRow => ({ id: `fallback-${id}`, body: f.body, checked: f.checked, fallback: true });

/** The cards for a country (null: EU / other country) in the §3c order for the mode. Empty groups are left out. */
export function helpGroups(d: HelpData, country: string | null, mode: HelpMode): HelpGroup[] {
  const cc = knownCountry(d, country);
  const rows = cc ? d.countries[cc] ?? [] : [];
  const of = (role: HelpEntry['role']) => rows.filter((e) => e.role === role).map(row);
  const orFallback = (list: HelpRow[], key: keyof HelpData['fallbacks']) => (list.length > 0 ? list : [fallbackRow(key, d.fallbacks[key])]);
  const eu: HelpRow[] = cc ? [] : d.eu.map((e) => ({ id: e.id, name: e.name, body: e.body, url: e.url, checked: e.checked, fallback: false }));
  const groups: Record<HelpGroupKind, HelpRow[]> = {
    bank: orFallback(of('bank'), 'bank'),
    report: [...eu, ...of('report'), ...of('advice'), ...orFallback(of('police'), 'police')],
    support: orFallback(of('support'), 'support'),
    child: orFallback(of('child'), 'child_helpline'),
    crisis: of('crisis'),
  };
  return (mode === 'sensitive' ? SENSITIVE_ORDER : SCAM_ORDER).filter((k) => groups[k].length > 0).map((kind) => ({ kind, rows: groups[kind] }));
}

/** "19 November 2026" from "2026-11-19" (UTC, so the date never shifts with the player's time zone). */
export function checkedDate(iso: string, locale = 'en-GB'): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** English country name from the browser's own data (no network), falling back to the code. */
export function countryName(code: string, locale = 'en'): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** Host shown next to a help link, so the player sees where it goes. */
export function linkHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
