/**
 * Zod-free constants shared by the schema (build time) and the engine
 * (runtime). The runtime must never import values from schema.ts, which
 * would pull Zod into the bundle (lint rule + tests/unit/bundle-guard.test.ts).
 */

/**
 * UI catalogue messages: plain text with {name} placeholders and ICU plurals
 * ({count, plural, one {# message} other {# messages}}; branch text has no braces, `#` is the number).
 */
export const ICU_MESSAGE_RE =
  /^(?:[^{}]|\{[a-zA-Z_][a-zA-Z0-9_]*\}|\{[a-zA-Z_][a-zA-Z0-9_]*, plural,(?:\s*(?:=\d+|zero|one|two|few|many|other)\s*\{[^{}]*\})+\s*\})*$/;

/** Spotting thresholds for stamps: ceil(R/3), ceil(2*R/3). */
export const SPOTTED_EXPR_RE = /^ceil\((?:(\d+)\*)?R\/(\d+)\)$/;

/**
 * R22 (psych M1), R25(5): the game flag for "the player told someone" (a report, asking someone, Teo's photo check
 * together). Set by the close beat's report, Teo's chat, and (CR-51) by the engine when any arc slot's decisive kind
 * was `report` or `ask_someone`.
 */
export const ARC_TOLD_SOMEONE = 'arc_told_someone';
/** R25(5), CR-51: the close beat's solo photo check sets this instead of ARC_TOLD_SOMEONE ("You checked in the end."). */
export const ARC_CHECKED = 'arc_checked';
/** CR-51: arc slots decided by these kinds set ARC_TOLD_SOMEONE. */
export const ARC_TOLD_KINDS: readonly string[] = ['report', 'ask_someone'];
