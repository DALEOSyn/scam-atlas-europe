/**
 * Message lookup for shell UI strings. Catalogues live in
 * content/i18n/<locale>/*.json (CC BY-SA, red-line linted, validated by
 * content:validate) and are bundled at build time. English only at launch.
 * Placeholders use ICU simple-argument syntax ({name}) and ICU plurals; a full ICU formatter
 * (@formatjs) can replace format() without touching call sites.
 */
import en from '../../content/i18n/en/ui.json';

export type MessageKey = keyof typeof en;

const PLURAL_RE = /\{(\w+), plural,((?:\s*(?:=\d+|zero|one|two|few|many|other)\s*\{[^{}]*\})+)\s*\}/g;
const BRANCH_RE = /(=\d+|zero|one|two|few|many|other)\s*\{([^{}]*)\}/g;
const rules = new Intl.PluralRules('en');

/** {name} placeholders plus ICU plurals: exact (=n) branch, then the CLDR category, then `other`. */
export function format(message: string, vars: Record<string, string | number> = {}): string {
  const plural = message.replace(PLURAL_RE, (whole, name: string, body: string) => {
    if (!(name in vars)) return whole;
    const n = Number(vars[name]);
    const branches = new Map([...body.matchAll(BRANCH_RE)].map((m) => [m[1] ?? '', m[2] ?? '']));
    const text = branches.get(`=${n}`) ?? branches.get(rules.select(n)) ?? branches.get('other') ?? '';
    return text.replace(/#/g, String(n));
  });
  return plural.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return format(en[key], vars);
}
