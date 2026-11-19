/** ICU-style formatting without any catalogue import (usable from the engine and build scripts). */
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
