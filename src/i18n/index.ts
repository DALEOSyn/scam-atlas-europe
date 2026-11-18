/**
 * Minimal message lookup for shell UI strings. English source only at launch.
 * Keys and {placeholders} follow ICU/@formatjs style so the catalogue can move
 * to content/i18n/<locale>/ and a full ICU formatter later without touching
 * call sites.
 */
import { en } from './en.ts';

export type MessageKey = keyof typeof en;

export function t(key: MessageKey, vars: Record<string, string | number> = {}): string {
  return en[key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}
