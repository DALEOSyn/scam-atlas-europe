/**
 * The exact English line debrief layer 1 renders for a "You chose" item (UI_SPEC §8.1). Shared by
 * DebriefView and the validator (scripts/lib/rules.ts), so the layer-1 word budget counts exactly
 * what is shown (layer-1 ruling 2026-11-19).
 *
 * `msg(key)` returns the catalogue template for a key, or undefined when the key does not exist.
 * - `you_chose_whatnow_<choice>`: descriptive past-tense line for a "What now?" built-in (ruling L1),
 *   never the button label. Falls back to "You chose: <built-in label>." if the key is missing.
 * - `you_chose_report_genuine` / `_dismiss_genuine` / `_dismiss_started`: over-caution on a genuine
 *   message never gets a bare label next to low stars (ruling L4, game-wide copy).
 * - `you_chose_then`: layer 2's path line after an engage and another final choice (CR-27): in "Step by step"
 *   for the layer-1 line, in the row itself for "Your other choices".
 * - `next_time_after_hang_up`: the "Next time" pointer (ruling L1, budget ruling 2026-11-19).
 */
import { format } from '../i18n/format.ts';
import type { ActionClass } from '../content/schema.ts';
import type { ChoiceLine, OverCaution } from './debrief.ts';
import type { Truth } from './scoring.ts';

export type CatalogueLookup = (key: string) => string | undefined;

export const WHAT_NOW_LABEL_KEYS = {
  call_back_known: 'what_now_call_back_known',
  report: 'what_now_report',
  done: 'what_now_done',
} as const;

export const OVER_CAUTION_KEYS: Record<OverCaution, string> = {
  report_genuine: 'you_chose_report_genuine',
  dismiss_genuine: 'you_chose_dismiss_genuine',
  dismiss_started: 'you_chose_dismiss_started',
};

export const NEXT_TIME_KEYS = { after_hang_up: 'next_time_after_hang_up' } as const;

/**
 * Over-caution on a genuine message (ruling L4), by decisive class × truth:
 * report on genuine (high or low stakes); dismiss on genuine high stakes (`dismiss_started` when the
 * player started it, e.g. their own password reset). Anything else is not over-caution: undefined.
 */
export function overCautionOf(cls: ActionClass, truth: Truth, playerStarted: boolean): OverCaution | undefined {
  if (truth === 'fraud') return undefined;
  if (cls === 'report') return 'report_genuine';
  if (cls === 'dismiss' && truth === 'legit_high') return playerStarted ? 'dismiss_started' : 'dismiss_genuine';
  return undefined;
}

export function choiceLineText(c: ChoiceLine, msg: CatalogueLookup): string {
  if (c.kind === 'timer') return format((c.genuine ? msg('you_chose_timer_genuine') : undefined) ?? msg('you_chose_timer') ?? '');
  if (c.kind === 'over_caution') {
    const own = msg(OVER_CAUTION_KEYS[c.which]);
    if (own) return format(own);
    return c.label ? format(msg('you_chose') ?? '', { label: c.label }) : '';
  }
  if (c.kind === 'what_now') {
    const own = msg(`you_chose_whatnow_${c.choice}`);
    if (own) return format(own);
    return format(msg('you_chose') ?? '', { label: msg(WHAT_NOW_LABEL_KEYS[c.choice]) ?? c.choice });
  }
  return format(msg('you_chose') ?? '', { label: c.label });
}

/**
 * CR-27: the whole path of a beat where an engage was followed by another final choice, for layer 2:
 * "You chose: Call back the number he gave. Then: Leave it there." null when the line has no path.
 */
export function choicePathText(c: ChoiceLine, msg: CatalogueLookup): string | null {
  if ((c.kind !== 'action' && c.kind !== 'what_now') || !c.path) return null;
  const then = 'label' in c.path.then ? c.path.then.label : (msg(WHAT_NOW_LABEL_KEYS[c.path.then.builtin]) ?? c.path.then.builtin);
  return format(msg('you_chose_then') ?? '', { label: c.path.engage, then });
}

/** The "Next time" pointer shown in the layer-1 slot instead of a "You chose" line (ruling L1). */
export function nextTimeText(which: keyof typeof NEXT_TIME_KEYS, msg: CatalogueLookup): string {
  return format(msg(NEXT_TIME_KEYS[which]) ?? '');
}
