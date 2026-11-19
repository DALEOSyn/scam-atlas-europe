/**
 * Live regions #announcer-polite and #announcer-assertive (UI_SPEC §10.1, §10.5). Mounted once at the
 * app root so they exist before anything is announced. Assertive is only for "Scenario ended".
 */
import { createContext, type ComponentChildren } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { dropSlow, EMPTY_QUEUE, enqueue, flushAll, nextAnnouncement, splitForeign, type Category, type Foreign, type QueueState } from './announcer.ts';
import styles from './text.module.css';

export interface AnnounceApi {
  /** `foreign`: a part of `text` in another language (CR-27, WCAG 3.1.2), spoken with its own lang. */
  polite: (category: Category, text: string, coalesce?: (count: number) => string, key?: string, foreign?: Foreign) => void;
  /** "Scenario ended" and the like; also drops stale timer/stress/message items. */
  assertive: (text: string) => void;
  /** A new screen mounted: drop stale category 3–5 items. */
  reset: () => void;
  /** The scenario ended: drop everything pending (QA m5). */
  flush: () => void;
}

const noop: AnnounceApi = { polite: () => undefined, assertive: () => undefined, reset: () => undefined, flush: () => undefined };
export const AnnounceContext = createContext<AnnounceApi>(noop);

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

export function AnnouncerProvider({ minInterval, children }: { minInterval: number; children: ComponentChildren }) {
  const queue = useRef<QueueState>(EMPTY_QUEUE);
  // Bumped by flush(): a polite text already on its 50 ms way out is dropped too (QA m5).
  const gen = useRef(0);
  const [polite, setPolite] = useState<{ text: string; foreign?: Foreign | undefined }>({ text: '' });
  const [assertive, setAssertive] = useState('');
  const flush = useCallback(() => {
    const r = nextAnnouncement(queue.current, now(), minInterval);
    queue.current = r.queue;
    if (r.say !== null) {
      const said = { text: r.say, foreign: r.foreign };
      const g = gen.current;
      // Clear first so the same text is announced again.
      setPolite({ text: '' });
      setTimeout(() => g === gen.current && setPolite(said), 50);
    }
  }, [minInterval]);
  useEffect(() => {
    const id = setInterval(flush, 500);
    return () => clearInterval(id);
  }, [flush]);
  const api = useMemo<AnnounceApi>(
    () => ({
      polite: (category, text, coalesce, key, foreign) => {
        queue.current = enqueue(queue.current, category, text, coalesce, key, foreign);
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
      flush: () => {
        queue.current = flushAll(queue.current);
        gen.current++;
        setPolite({ text: '' });
      },
    }),
    [flush],
  );
  return (
    <AnnounceContext.Provider value={api}>
      {children}
      <div id="announcer-polite" class={styles.vh} aria-live="polite" aria-atomic="true">
        {(() => {
          const parts = splitForeign(polite.text, polite.foreign);
          if (!parts) return polite.text;
          const [before, foreign, after] = parts;
          return (
            <>
              {before}
              <span lang={foreign.lang}>{foreign.text}</span>
              {after}
            </>
          );
        })()}
      </div>
      <div id="announcer-assertive" class={styles.vh} aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </AnnounceContext.Provider>
  );
}
