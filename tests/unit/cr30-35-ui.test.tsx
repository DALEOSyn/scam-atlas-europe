// @vitest-environment jsdom
/** CR-30 … CR-35 on screen: the on-call bar's caller lines in the live region (QA-2, WCAG 4.1.3). */
import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { readYaml } from '../../scripts/lib/content.ts';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { EMPTY_QUEUE, enqueue, nextAnnouncement } from '../../src/ui/announcer.ts';
import { logAnnouncement } from '../../src/ui/ScenarioView.tsx';
import { ROOT } from '../content/fixtures.ts';

const fixture = (file: string): Scenario => scenarioSchema.parse(readYaml(join(resolve(ROOT, 'tests', 'fixtures', 'scenarios'), file)));

describe('QA-2: caller lines under the on-call bar are call transcript lines', () => {
  const s = fixture('cr31-reserve-call.yaml');
  const line = { type: 'pusher' as const, index: 0, text: 'Type the name exactly: Larchwick Reserva.', at: 6 };
  it('on the bar: category 1, "Caller: {text}", in its own slot', () => {
    expect(logAnnouncement(s, line, 'reserve_transfer')).toEqual({ category: 1, key: 'call-line-0', text: 'Caller: Type the name exactly: Larchwick Reserva.' });
  });
  it('without the bar (or bound to another beat) a follow-up stays a category-5 message', () => {
    expect(logAnnouncement(s, line, null)?.category).toBe(5);
    expect(logAnnouncement(s, line, 'some_other_beat')?.category).toBe(5);
  });
  it('two caller lines are each read at once, never folded into "N new messages"', () => {
    const second = { ...line, index: 1, text: "It'll say the name doesn't match. That's normal for our reserve. Just confirm.", at: 20 };
    let q = EMPTY_QUEUE;
    for (const e of [line, second]) {
      const a = logAnnouncement(s, e, 'reserve_transfer');
      if (!a) throw new Error('no announcement');
      q = enqueue(q, a.category, a.text, (n) => `${n} new messages`, a.key);
    }
    const said: string[] = [];
    for (let i = 0; i < 2; i++) {
      const next = nextAnnouncement(q, 0, 10);
      if (next.say !== null) said.push(next.say);
      q = next.queue;
    }
    expect(said).toEqual(['Caller: Type the name exactly: Larchwick Reserva.', "Caller: It'll say the name doesn't match. That's normal for our reserve. Just confirm."]);
  });
});
