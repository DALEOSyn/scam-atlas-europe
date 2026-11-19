/**
 * The exact English line debrief layer 1 renders for a "You chose" item (UI_SPEC §8.1). Shared by
 * DebriefView and the validator (scripts/lib/rules.ts), so the layer-1 word budget counts exactly
 * what is shown (layer-1 ruling 2026-11-19).
 *
 * `msg(key)` returns the catalogue template for a key, or undefined when the key does not exist.
 * Optional keys are used as soon as they exist in the catalogue, with no code change:
 * - `you_chose_whatnow_<choice>` replaces "You chose: <built-in label>." for a "What now?" built-in.
 */
import { format } from '../i18n/format.ts';
import type { ChoiceLine } from './debrief.ts';

export type CatalogueLookup = (key: string) => string | undefined;

export const WHAT_NOW_LABEL_KEYS = {
  call_back_known: 'what_now_call_back_known',
  report: 'what_now_report',
  done: 'what_now_done',
} as const;

export function choiceLineText(c: ChoiceLine, msg: CatalogueLookup): string {
  if (c.kind === 'timer') return format(msg('you_chose_timer') ?? '');
  if (c.kind === 'what_now') {
    const own = msg(`you_chose_whatnow_${c.choice}`);
    if (own) return format(own);
    return format(msg('you_chose') ?? '', { label: msg(WHAT_NOW_LABEL_KEYS[c.choice]) ?? c.choice });
  }
  return format(msg('you_chose') ?? '', { label: c.label });
}
