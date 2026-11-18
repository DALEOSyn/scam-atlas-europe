/**
 * Message lookup for shell UI strings. Catalogues live in
 * content/i18n/<locale>/*.json (CC BY-SA, red-line linted, validated by
 * content:validate) and are bundled at build time. English only at launch.
 * Placeholders use ICU simple-argument syntax ({name}); a full ICU formatter
 * (@formatjs) can replace format() without touching call sites.
 */
import en from '../../content/i18n/en/ui.json';

export type MessageKey = keyof typeof en;

export function format(message: string, vars: Record<string, string | number> = {}): string {
  return message.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return format(en[key], vars);
}
