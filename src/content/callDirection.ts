/**
 * CR-45: which way a call beat goes. A call the player dials (the beat is reached by an action where the
 * player places the call, e.g. "Call the number in the text") is `outgoing`: "Calling …", then connected,
 * with no Answer or Decline. Every other call beat rings: `incoming`. A beat's own `direction` wins.
 * Pure and Zod-free (types only from schema.ts): used by the schema, the engine and the UI.
 */
import type { ActionKind, Scenario } from './schema.ts';

/** Action kinds where the player places the call. */
export const DIAL_KINDS: readonly ActionKind[] = ['call_number_in_message', 'call_back_known'];

export type CallDirection = 'incoming' | 'outgoing';

type Source = Pick<Scenario, 'actions' | 'beats' | 'interrupts'>;

/** Kinds of every action (opening, beats, interrupts) whose next_beat is `beatId`. */
export function parentKinds(s: Source, beatId: string): ActionKind[] {
  return [...s.actions, ...s.beats.flatMap((b) => b.actions), ...s.interrupts.flatMap((i) => i.actions)].filter((a) => a.next_beat === beatId).map((a) => a.kind);
}

/** Inferred from the parent actions: outgoing when every action leading to the beat dials (and there is one). */
export function inferredDirection(s: Source, beatId: string): CallDirection {
  const kinds = parentKinds(s, beatId);
  return kinds.length > 0 && kinds.every((k) => DIAL_KINDS.includes(k)) ? 'outgoing' : 'incoming';
}

/** Direction of a call beat ('start' and non-call beats are incoming). */
export function callDirectionOf(s: Source, beatId: string): CallDirection {
  if (beatId === 'start') return 'incoming';
  const beat = s.beats.find((b) => b.id === beatId);
  if (!beat || beat.device !== 'call') return 'incoming';
  return beat.direction ?? inferredDirection(s, beatId);
}
