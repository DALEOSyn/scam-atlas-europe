/**
 * Live regions #announcer-polite and #announcer-assertive (UI_SPEC §10.1, §10.5). Mounted once at the
 * app root so they exist before anything is announced. Assertive is only for "Scenario ended".
 */
import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { dropSlow, EMPTY_QUEUE, enqueue, nextAnnouncement, type Category, type QueueState } from './announcer.ts';
import styles from './text.module.css';

export interface AnnounceApi {
  polite: (category: Category, text: string, coalesce?: (count: number) => string) => void;
  /** "Scenario ended" and the like; also drops stale timer/stress/message items. */
  assertive: (text: string) => void;
  /** A new screen mounted: drop stale category 3–5 items. */
  reset: () => void;
}

const noop: AnnounceApi = { polite: () => undefined, assertive: () => undefined, reset: () => undefined };
export const AnnounceContext = createContext<AnnounceApi>(noop);

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

export function AnnouncerProvider({ minInterval, children }: { minInterval: number; children: ComponentChildren }) {
  const queue = useRef<QueueState>(EMPTY_QUEUE);
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const flush = useCallback(() => {
    const r = nextAnnouncement(queue.current, now(), minInterval);
    queue.current = r.queue;
    if (r.say !== null) {
      const text = r.say;
      // Clear first so the same text is announced again.
      setPolite('');
      setTimeout(() => setPolite(text), 50);
    }
  }, [minInterval]);
  useEffect(() => {
    const id = setInterval(flush, 500);
    return () => clearInterval(id);
  }, [flush]);
  const api = useMemo<AnnounceApi>(
    () => ({
      polite: (category, text, coalesce) => {
        queue.current = enqueue(queue.current, category, text, coalesce);
        if (category <= 2) flush();
      },
      assertive: (text) => {
        queue.current = dropSlow(queue.current);
        setAssertive('');
        setTimeout(() => setAssertive(text), 50);
      },
      reset: () => {
        queue.current = dropSlow(queue.current);
      },
    }),
    [flush],
  );
  return (
    <AnnounceContext.Provider value={api}>
      {children}
      <div id="announcer-polite" class={styles.vh} aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div id="announcer-assertive" class={styles.vh} aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnounceContext.Provider>
  );
}
