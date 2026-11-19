/**
 * Message lookup for shell UI strings. Catalogues live in
 * content/i18n/<locale>/*.json (CC BY-SA, red-line linted, validated by
 * content:validate) and are bundled at build time. English only at launch.
 * Placeholders use ICU simple-argument syntax ({name}) and ICU plurals; a full ICU formatter
 * (@formatjs) can replace format() without touching call sites.
 */
import en from '../../content/i18n/en/ui.json';
import { format } from './format.ts';

export { format };

export type MessageKey = keyof typeof en;

/** Catalogue template for any key, or undefined (optional keys, e.g. choiceLineText). */
export function lookup(key: string): string | undefined {
  return (en as Record<string, string>)[key];
}

export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return format(en[key], vars);
}
