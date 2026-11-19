/**
 * Screen-reader announcement queue (UI_SPEC §10.5). Pure.
 *
 * One polite channel, a priority queue with at most one pending item per category; a newer item
 * replaces the older one in its category:
 *   1 call transcript line, 2 player-caused feedback, 3 timer thresholds, 4 stress change,
 *   5 new-message / pusher summary.
 * Categories 1–2 are immediate. Categories 3–5 keep at least `minInterval` seconds between
 * announcements (balance pushers.sr_announce_min_interval_seconds). New messages arriving inside
 * the interval coalesce ("2 new messages").
 * A category 1–2 text holds the region for its reading pace (`linePace`): a category 3–5 item waits in
 * the queue until then, so it never replaces a caller line or feedback before it is spoken (QA r2, WCAG 4.1.3).
 */
import { linePace } from './text.ts';

export type Category = 1 | 2 | 3 | 4 | 5;

export interface Pending {
  category: Category;
  /**
   * A separate slot inside the category (e.g. 'interrupt'): never replaced by, merged with or coalesced
   * into the category's other items, and announced before them (QA M3: an interrupt needs an answer).
   */
  key?: string | undefined;
  text: string;
  /** Category 5: how many messages this item stands for. */
  count: number;
  /** CR-27 (WCAG 3.1.2): a part of `text` in another language, e.g. a French follow-up quoted in "New message: …". */
  foreign?: Foreign | undefined;
}

/** A quoted part of an announcement in another language (rendered as <span lang>). */
export interface Foreign {
  text: string;
  lang: string;
}

export interface QueueState {
  pending: Pending[];
  /** When the last category 3–5 item was announced (seconds), or null. */
  lastSlow: number | null;
  /** Until when (seconds) the last category 1–2 text holds the region; category 3–5 waits until then. */
  holdUntil?: number | undefined;
}

export const EMPTY_QUEUE: QueueState = { pending: [], lastSlow: null };

export function enqueue(q: QueueState, category: Category, text: string, coalesce?: (count: number) => string, key?: string, foreign?: Foreign): QueueState {
  const same = (p: Pending) => p.category === category && p.key === key;
  const prev = q.pending.find(same);
  const count = category === 5 && prev && key === undefined ? prev.count + 1 : 1;
  const merged = count > 1 && coalesce;
  // A coalesced summary ("2 new messages.") quotes nothing, so it carries no foreign part.
  const item: Pending = { category, key, text: merged ? coalesce(count) : text, count, ...(!merged && foreign && text.includes(foreign.text) ? { foreign } : {}) };
  return { ...q, pending: [...q.pending.filter((p) => !same(p)), item] };
}

/** The next item to announce at `now` (seconds), if any is due. */
export function nextAnnouncement(q: QueueState, now: number, minInterval: number): { queue: QueueState; say: string | null; foreign?: Foreign | undefined } {
  const ready = q.pending
    .filter((p) => p.category <= 2 || ((q.holdUntil === undefined || now >= q.holdUntil) && (q.lastSlow === null || now - q.lastSlow >= minInterval)))
    .sort((a, b) => a.category - b.category || (a.key === undefined ? 1 : 0) - (b.key === undefined ? 1 : 0));
  const first = ready[0];
  if (!first) return { queue: q, say: null };
  return {
    queue: {
      pending: q.pending.filter((p) => p !== first),
      lastSlow: first.category >= 3 ? now : q.lastSlow,
      holdUntil: first.category <= 2 ? Math.max(q.holdUntil ?? 0, now + linePace(first.text)) : q.holdUntil,
    },
    say: first.text,
    foreign: first.foreign,
  };
}

/** Drop pending category 3–5 items (timer, stress, new messages): they belong to a screen that has gone (QA B6). */
export function dropSlow(q: QueueState): QueueState {
  return { ...q, pending: q.pending.filter((p) => p.category <= 2) };
}

/** Drop everything pending: the scenario ended (QA m5); nothing of it may be announced later. */
export function flushAll(q: QueueState): QueueState {
  return { ...q, pending: [] };
}

/** Split an announcement around its foreign part: [before, foreign, after], or null when there is none. */
export function splitForeign(text: string, foreign: Foreign | undefined): [string, Foreign, string] | null {
  if (!foreign) return null;
  const at = text.indexOf(foreign.text);
  if (at < 0) return null;
  return [text.slice(0, at), foreign, text.slice(at + foreign.text.length)];
}
