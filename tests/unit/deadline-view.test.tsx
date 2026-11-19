// @vitest-environment jsdom
/**
 * Timer expiry copy is gated by is_fraud (sceptic, T-2.3 round 4): "The deadline was fake" only on
 * fraud; a genuine scenario names the message's own deadline (ruling QA L4). Checked in the consequence view data and in
 * the rendered debrief layer 2 ("What happened").
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/preact';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { startScenario, step, viewOf } from '../../src/engine/runner.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { rawFraud, rawGenuine, scenario } from '../content/fixtures.ts';
import { B, ctx, tick, type Raw } from './engine/helpers.ts';

afterEach(cleanup);

const none = { pressureAny: false, pressureGenuine: false };
const timed = (raw: Raw) => scenario({ ...raw, pressure: raw.is_fraud ? { timer: true, levers: [] } : { timer: true, levers: [], honest_deadline: 'Locker holds it 7 days' } });

function expire(fraud: boolean) {
  const s = timed(fraud ? rawFraud() : rawGenuine());
  const c = ctx();
  const st = step(s, c, step(s, c, startScenario(s, c), tick(60)), tick(B.timers.escalation_extra_seconds));
  return { s, c, st };
}

describe('timer expiry copy is gated by is_fraud', () => {
  for (const fraud of [true, false]) {
    it(fraud ? 'fraud: "The deadline was fake."' : 'genuine: the game timer is not the message\'s deadline (ruling QA L4)', () => {
      const { s, c, st } = expire(fraud);
      expect(st.phase).toBe('consequence');
      expect(viewOf(s, c, st).consequenceDeadline).toBe(fraud ? 'fake' : 'genuine');
      const done = step(s, c, st, { type: 'continue' });
      render(<DebriefView data={debriefOf(s, done, resultOf(s, B, done), none)} onContinue={() => undefined} onAgain={() => undefined} />);
      const more = document.getElementById('debrief-more');
      expect(more?.textContent).toContain(
        fraud ? 'The deadline was fake. Nothing happened.' : "Time's up in the game, not in real life. The message's own deadline: Locker holds it 7 days. Nothing is lost yet",
      );
      expect(more?.textContent ?? '').not.toContain(fraud ? 'in real life' : 'deadline was fake');
      expect(screen.getByRole('heading', { level: 2, name: 'What happened', hidden: true })).toBeTruthy();
    });
  }
});
