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
