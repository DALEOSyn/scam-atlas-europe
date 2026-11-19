/** T-2.8 Berlin readiness, engine side: per-beat pushers (M2), interrupt outcomes (M3), deadline line (m1), merged damage control (L2). */
import { describe, expect, it } from 'vitest';
import type { Scenario } from '../../../src/content/schema.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { planPushers } from '../../../src/engine/pushers.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { step, viewOf, type RunnerState } from '../../../src/engine/runner.ts';
import { rawFraud, scenario } from '../../content/fixtures.ts';
import { act, B, boss, ctx, play, run, tick, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const cont = { type: 'continue' as const };
const withPushers = (messages: Raw[]) => boss({ pressure: { timer: false, levers: [], pusher: { messages } } });

describe('M2: a pusher belongs to its beat', () => {
  it('is placed on the last beat scheduled at or before its time, timed from that beat', () => {
    const plan = planPushers(
      [
        { at_seconds: 20, text: 'a' },
        { at_seconds: 30, text: 'b' },
        { at_seconds: 70, text: 'c' },
      ],
      [
        { beatId: 'start', at: 0 },
        { beatId: 'invoice', at: 30 },
        { beatId: 'support_call', at: 60 },
      ],
    );
    expect(plan).toEqual([
      { beat: 'start', offset: 20 },
      { beat: 'invoice', offset: 0 },
      { beat: 'support_call', offset: 10 },
    ]);
  });

  it('never fires after its beat ended, nor during the fast-forward to the next beat', () => {
    const s = withPushers([{ at_seconds: 20, text: 'Pay now!' }]);
    let st = run(s, ctx(), [tick(5), act('report_it')]);
    expect(st.phase).toBe('consequence');
    st = step(s, ctx(), st, cont);
    expect(st.clock).toBe(30);
    st = run(s, ctx(), [tick(5), act('report_it'), cont, tick(60)]);
    expect(st.pushers.fired).toEqual([]);
  });

  it('a later beat\'s pusher is timed from when that beat appears, not from the scenario clock', () => {
    const s = withPushers([{ at_seconds: 70, text: 'Caller: "Are you still there?"' }]);
    // Slow on beat 2: beat 3 (scheduled at 60) only appears at 75.
    let st = run(s, ctx(), [act('report_it'), cont, tick(45), act('report_2'), cont]);
    expect(st.groups.at(-1)?.beatId).toBe('support_call');
    expect(st.clock).toBe(75);
    expect(st.pushers.fired).toEqual([]);
    st = step(s, ctx(), st, tick(9.5));
    expect(st.pushers.fired).toEqual([]);
    st = step(s, ctx(), st, tick(0.5));
    expect(st.pushers.fired).toEqual([{ index: 0, at: 85 }]);
    const v = viewOf(s, ctx(), st);
    expect(v.pusherMessages).toMatchObject([{ beatId: 'support_call', device: 'call', sender: 'Larchwick Bank' }]);
  });

  it('shows each beat\'s own pushers only, with that beat\'s sender and channel', () => {
    const s = withPushers([{ at_seconds: 10, text: 'Trundle: pay today.' }]);
    let st = run(s, ctx(), [tick(10)]);
    expect(viewOf(s, ctx(), st).pusherMessages).toMatchObject([{ device: 'sms', sender: 'Trundle', beatId: 'start' }]);
    st = run(s, ctx(), [tick(10), act('report_it'), cont]);
    expect(viewOf(s, ctx(), st).pusherMessages).toEqual([]);
  });

  it('hanging up ends the call and its follow-ups', () => {
    const s = withPushers([{ at_seconds: 70, text: 'Still there?' }]);
    const st = run(s, ctx(), [act('report_it'), cont, act('report_2'), cont, tick(2), act('hang_up'), tick(30)]);
    expect(st.phase).toBe('what_now');
    expect(st.pushers.fired).toEqual([]);
  });
});

function withJonas(raw: Raw = rawFraud()): Scenario {
  return scenario({
    ...raw,
    interrupts: [
      {
        id: 'jonas',
        at_seconds: 5,
        is_fraud: false,
        device: 'messenger',
        message: { sender: { display: 'Jonas', detail: 'Saved contact' }, body: 'Your parcel is with me.', request: 'none' },
        actions: [
          { id: 'thanks', label: 'Say thanks', kind: 'proceed', outcome: 'jonas_thanked' },
          { id: 'report_jonas', label: 'Report', kind: 'report', outcome: 'jonas_reported' },
        ],
      },
    ],
    outcomes: { ...(raw.outcomes as Raw), jonas_thanked: { narrative: 'Jonas: see you later.' }, jonas_reported: { narrative: 'Jonas laughs it off.' } },
  });
}

describe('M3: an interrupt\'s outcome is shown', () => {
  it('in the consequence step of the beat it was answered in, and in layer 2 "What happened"', () => {
    const s = withJonas();
    const st = run(s, ctx(), [tick(6), { type: 'interrupt_act', interruptId: 'jonas', actionId: 'thanks' }]);
    const before = step(s, ctx(), st, act('report_it'));
    expect(before.phase).toBe('consequence');
    const v = viewOf(s, ctx(), before);
    expect(v.consequence).toBe('Reported.');
    expect(v.consequenceAsides).toEqual(['Jonas: see you later.']);
    const done = step(s, ctx(), before, cont);
    const d = debriefOf(s, done, resultOf(s, B, done), none);
    expect(d.layer2.narratives).toEqual(['Reported.', 'Jonas: see you later.']);
  });

  it('an unanswered interrupt adds nothing', () => {
    const s = withJonas();
    const st = run(s, ctx(), [tick(6)]);
    const after = step(s, ctx(), st, act('report_it'));
    expect(viewOf(s, ctx(), after).consequenceAsides).toEqual([]);
  });
});

describe('m1: the fake-deadline line after a fall', () => {
  it('says "Nothing happened" only when nobody fell', () => {
    const s = boss();
    const expire = [tick(B.timers.boss_beat), tick(B.timers.escalation_extra_seconds)];
    const clean = run(s, ctx(), [act('open_app'), cont, ...expire]);
    expect(viewOf(s, ctx(), clean).consequenceDeadline).toBe('fake');
    const fell = run(s, ctx(), [act('tap_link'), act('enter_card'), cont, ...expire]);
    expect(fell.phase).toBe('consequence');
    expect(viewOf(s, ctx(), fell).consequenceDeadline).toBe('fake_fell');
  });

  it('a timer expiry on a boss beat: displayed ★★★ (rounded mean) never sits next to "You let the timer run out"', () => {
    const s = boss();
    let st: RunnerState = run(s, ctx(), [act('open_app'), cont, act('check_app_2'), cont]);
    st = step(s, ctx(), st, tick(1000));
    st = step(s, ctx(), st, cont);
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => b.stars)).toEqual([3, 3, 2]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.stars).toBe(3);
    expect(d.layer1.youChose).toEqual([]);
    expect(d.layer1.nextTime).toBe('after_hang_up');
    expect(d.layer2.youChoseOther[0]).toMatchObject({ line: { kind: 'timer' }, stars: 2 });
  });
});

describe('L2: damage control after several falls in a boss', () => {
  it('merges the steps of every fall, in beat order, without repeats', () => {
    const s = structuredClone(boss()) as Scenario;
    s.outcomes.code_gone = {
      narrative: 'The payment goes through.',
      recovery: [
        { step: 'call_bank_stop_payment', category: 'stop' },
        { step: 'block_card_in_bank_app', category: 'stop' },
        { step: 'refuse_codes_to_callers', category: 'secure' },
      ],
    } as Scenario['outcomes'][string];
    const call = s.beats.find((b) => b.id === 'support_call');
    const read = call?.actions.find((a) => a.id === 'read_code');
    if (read) read.outcome = 'code_gone';
    const { st } = play(s, ctx({ timerMode: 'off' }), [act('tap_link'), act('enter_card'), cont, act('report_2'), cont, act('read_code')]);
    expect(st.phase).toBe('damage_control');
    const steps = st.recovery?.options.map((o) => o.step) ?? [];
    expect(new Set(steps)).toEqual(
      new Set(['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online', 'reply_ask_money_back', 'wait_and_see', 'call_bank_stop_payment', 'refuse_codes_to_callers']),
    );
    expect(steps.length).toBe(7);
  });
});
