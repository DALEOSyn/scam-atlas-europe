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
 */
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
}

export interface QueueState {
  pending: Pending[];
  /** When the last category 3–5 item was announced (seconds), or null. */
  lastSlow: number | null;
}

export const EMPTY_QUEUE: QueueState = { pending: [], lastSlow: null };

export function enqueue(q: QueueState, category: Category, text: string, coalesce?: (count: number) => string, key?: string): QueueState {
  const same = (p: Pending) => p.category === category && p.key === key;
  const prev = q.pending.find(same);
  const count = category === 5 && prev && key === undefined ? prev.count + 1 : 1;
  const item: Pending = { category, key, text: count > 1 && coalesce ? coalesce(count) : text, count };
  return { ...q, pending: [...q.pending.filter((p) => !same(p)), item] };
}

/** The next item to announce at `now` (seconds), if any is due. */
export function nextAnnouncement(q: QueueState, now: number, minInterval: number): { queue: QueueState; say: string | null } {
  const ready = q.pending
    .filter((p) => p.category <= 2 || q.lastSlow === null || now - q.lastSlow >= minInterval)
    .sort((a, b) => a.category - b.category || (a.key === undefined ? 1 : 0) - (b.key === undefined ? 1 : 0));
  const first = ready[0];
  if (!first) return { queue: q, say: null };
  return {
    queue: { pending: q.pending.filter((p) => p !== first), lastSlow: first.category >= 3 ? now : q.lastSlow },
    say: first.text,
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
