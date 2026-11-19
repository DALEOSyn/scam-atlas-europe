/** Engine items from the Amsterdam QA round (g–p). */
import { describe, expect, it } from 'vitest';
import { bestLineOf, debriefOf, senderCaveatOf } from '../../../src/engine/debrief.ts';
import { startScenario, step, viewOf, type RunnerState } from '../../../src/engine/runner.ts';
import { tickTimer } from '../../../src/engine/timer.ts';
import { scenarioSchema } from '../../../src/content/schema.ts';
import { rawFraud, scenario } from '../../content/fixtures.ts';
import { act, B, boss, check, ctx, jonasAfter, play, run, tag, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const issues = (raw: Raw): string[] => {
  const r = scenarioSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

const timed = (raw: Raw) => scenario({ ...raw, pressure: { timer: true, levers: [] } });

/** A small seeded PRNG so the 200 runs are the same every time. */
function rng(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 2 ** 32;
  };
}

describe('g. timer float freeze', () => {
  it('a remaining time a hair above zero counts as zero', () => {
    const r = tickTimer(B, { remaining: 0.25 + 3.55e-15, length: 40, expiries: 0 }, 0.25, 'standard');
    expect(r.events).toContain('escalated');
  });
  it('jittered frame times (0.25 s ± jitter, 200 runs) always escalate and expire', () => {
    const s = timed(rawFraud());
    const c = ctx();
    for (let seed = 1; seed <= 200; seed++) {
      const rand = rng(seed);
      let st: RunnerState = startScenario(s, c);
      let t = 0;
      while (t < 200 && st.phase === 'playing') {
        const dt = 0.25 + (rand() - 0.5) * 0.2;
        t += dt;
        st = step(s, c, st, { type: 'tick', dt });
      }
      expect(st.phase, `seed ${seed}: stuck at clock ${st.clock}, remaining ${st.timer?.remaining}`).not.toBe('playing');
      expect(t, `seed ${seed}`).toBeLessThan(60 + B.timers.escalation_extra_seconds + 1);
    }
  });
  it('a boss keeps delivering later beats under jittered ticks', () => {
    const s = boss();
    const c = ctx();
    for (let seed = 1; seed <= 50; seed++) {
      const rand = rng(seed);
      let st: RunnerState = startScenario(s, c);
      for (let i = 0; i < 2000 && st.phase !== 'done'; i++) {
        st = st.phase === 'consequence' ? step(s, c, st, { type: 'continue' }) : step(s, c, st, { type: 'tick', dt: 0.25 + (rand() - 0.5) * 0.2 });
        if (st.phase === 'damage_control' || st.phase === 'what_now') break;
      }
      expect(st.groups.length, `seed ${seed}`).toBeGreaterThan(1);
    }
  });
});

describe('p. [P] a call that leads into non-call beats (2-7 chained timer)', () => {
  const callFirst = () =>
    timed({
      ...rawFraud('chain'),
      device: 'call',
      message: {
        sender: { display: '+31 6 •• •• •• 12', detail: '+31 6 •• •• •• 12' },
        transcript: [{ speaker: 'caller', text: 'Top up your account now, I will send you the page.' }],
        request: 'pay',
      },
      inspectables: [{ target: 'caller_id', reveal: 'A number on screen proves nothing.', red_flag: true }],
      actions: [
        { id: 'go_page', label: 'Open the page they sent', kind: 'open_link', next_beat: 'fee_page', pressure_target: true },
        { id: 'hang_up', label: 'Hang up', kind: 'hang_up', outcome: 'left' },
        { id: 'call_back', label: 'Call the bank on a known number', kind: 'call_back_known', outcome: 'fine' },
        { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' },
      ],
    });
  it('the call keeps its own call length; the first non-call beat starts a slot-length timer', () => {
    const s = callFirst();
    const c = ctx();
    let st = startScenario(s, c);
    expect(st.timer?.length).toBe(B.timers.call_beat);
    st = step(s, c, st, { type: 'tick', dt: B.timers.call_beat - 5 });
    expect(st.timer?.remaining).toBeCloseTo(5);
    st = step(s, c, st, { type: 'act', actionId: 'go_page' });
    const slotLen = B.timers.by_slot[String(c.slot)];
    expect(st.timer).toMatchObject({ remaining: slotLen, length: slotLen, expiries: 0 });
  });
});

describe('i. the ★★★ line on a genuine message won by acting on it', () => {
  it('"Acting on it was right here." when every scored beat was proceed on a genuine message; else the habit line', () => {
    const beat = (cls: string) => ({ scored: true, cls }) as Parameters<typeof bestLineOf>[1]['beats'][number];
    expect(bestLineOf({ is_fraud: false }, { beats: [beat('proceed')] })).toBe('acted');
    expect(bestLineOf({ is_fraud: false }, { beats: [beat('verify')] })).toBe('habit');
    expect(bestLineOf({ is_fraud: true }, { beats: [beat('proceed')] })).toBe('habit');
    expect(bestLineOf({ is_fraud: false }, { beats: [] })).toBe('habit');
  });
});

describe('j. spotted count: boss debrief and chapter on the same basis', () => {
  it('flags on an unscored beat are listed but not counted, like result.correctTags', () => {
    const base = boss();
    const s = { ...base, beats: base.beats.map((b) => (b.id === 'invoice' ? { ...b, scored: false } : b)) };
    const { st, r } = play(s, ctx(), [check('link'), tag('link'), act('report_it'), { type: 'continue' }, check('link', 'invoice'), tag('link', 'invoice'), act('report_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'done' }]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer2.flags.some((f) => f.beatId === 'invoice' && f.status === 'marked')).toBe(true);
    expect(d.layer2.spotted.marked).toBe(r.correctTags);
    expect(d.layer2.spotted.could).toBe(r.redFlags);
  });
});

describe('k. the sender-name caveat is for names, not new numbers', () => {
  it('no "familiar sender name" caveat on a new-number flag', () => {
    expect(senderCaveatOf('sender.detail', 'Mum', { type: 'phone_number', reveal: 'Different from the saved one.' })).toBeNull();
    expect(senderCaveatOf('sender.detail', 'Mum', { reveal: 'A new number, not the one you saved.' })).toBeNull();
    expect(senderCaveatOf('sender.detail', 'Trundle', { type: 'sender', reveal: 'Looks like the courier.' })).toBe('name');
    expect(senderCaveatOf('sender.detail', '+31 6 •• •• •• 12', { reveal: 'A new number.' })).toBe('number');
    expect(senderCaveatOf('link', 'Trundle')).toBeNull();
  });
});

describe('q. an after_beat interrupt can wait for the "What now?" choice', () => {
  const afterWhatNow = () => {
    const raw = structuredClone(jonasAfter('support_call')) as unknown as Raw;
    (raw.interrupts as Raw[])[0] = { ...(raw.interrupts as Raw[])[0], after_what_now: true };
    return scenario(raw);
  };
  it('not shown while "What now?" is open; arrives as its own step once the choice is made', () => {
    const s = afterWhatNow();
    const c = ctx();
    const cont = { type: 'continue' } as const;
    let st = step(s, c, run(s, c, [act('open_app'), cont, act('report_2'), cont]), act('hang_up'));
    expect(st.phase).toBe('what_now');
    expect(st.interrupts[0]?.arrived).toBe(false);
    expect(viewOf(s, c, st).interrupts).toEqual([]);
    st = step(s, c, st, { type: 'what_now', choice: 'call_back_known' });
    for (let i = 0; i < 3 && st.phase === 'consequence'; i++) st = step(s, c, st, cont);
    expect(st.phase).toBe('interrupt');
    expect(viewOf(s, c, st).interrupts.map((i) => i.id)).toEqual(['jonas']);
  });
  it('without the flag it also waits for the choice since CR-27 (the ruling made it the default); the flag needs after_beat', () => {
    const s = jonasAfter('support_call');
    const c = ctx();
    const cont = { type: 'continue' } as const;
    const st = step(s, c, run(s, c, [act('open_app'), cont, act('report_2'), cont]), act('hang_up'));
    expect(st.interrupts[0]?.arrived).toBe(false);
    const raw = structuredClone(s) as unknown as Raw;
    (raw.interrupts as Raw[])[0] = { ...(raw.interrupts as Raw[])[0], after_beat: undefined, at_seconds: 5, after_what_now: true };
    expect(issues(raw).join('\n')).toMatch(/after_what_now needs after_beat/);
  });
});
