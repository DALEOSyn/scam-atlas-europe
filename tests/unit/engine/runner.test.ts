import { describe, expect, it } from 'vitest';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { plannedSchedule } from '../../../src/engine/pushers.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { startScenario, step, viewOf } from '../../../src/engine/runner.ts';
import { timerLength } from '../../../src/engine/timer.ts';
import { rawFraud, rawGenuine, scenario } from '../../content/fixtures.ts';
import { act, B, boss, check, ctx, play, run, tag, tick, type Raw } from './helpers.ts';

const fraud = () => scenario(rawFraud());
const genuine = (over: Raw = {}) => scenario(rawGenuine('g1', over));
const timed = (raw: Raw) => scenario({ ...raw, pressure: { timer: true, levers: [] } });
const seen = { pressureAny: false, pressureGenuine: false };

describe('runner: actions, beats and outcomes', () => {
  it('verify ends with 3 stars and 15 points', () => {
    const { st, r } = play(fraud(), ctx(), [act('open_app')]);
    expect(st.phase).toBe('done');
    expect(r).toMatchObject({ stars: 3, points: 15, maxPoints: 19, best: true, fell: false });
  });

  it('correct tags add +2 each on a verify ending; one wrong tag voids the bonus but still counts for spotting', () => {
    const good = play(fraud(), ctx(), [check('sender.detail'), tag('sender.detail'), check('link'), tag('link'), act('open_app')]).r;
    expect(good).toMatchObject({ points: 19, tagBonus: 4, correctTags: 2, wrongTags: 0, redFlags: 2 });
    const bad = play(fraud(), ctx(), [check('sender.detail'), tag('sender.detail'), check('reference'), tag('reference'), act('open_app')]).r;
    expect(bad).toMatchObject({ points: 15, tagBonus: 0, tagBonusVoided: true, correctTags: 1, wrongTags: 1 });
  });

  it('a filler (no authored reveal) counts as a wrong tag; you cannot tag what you have not checked', () => {
    const g = genuine();
    const st = run(g, ctx(), [tag('reference')]);
    expect(st.tags).toEqual([]);
    const { r } = play(g, ctx(), [check('reference'), tag('reference'), act('go_pick_up')]);
    expect(r).toMatchObject({ stars: 3, points: 15, wrongTags: 1, correctTags: 0, tagBonus: 0 });
    const v = viewOf(g, ctx(), run(g, ctx(), [check('reference')]));
    expect(v.checkables.find((c) => c.target === 'reference')).toMatchObject({ checked: true, reveal: undefined });
  });

  it('engage then dismiss on the follow-up page: capped at ★★ and the debrief names the engage (producer ruling)', () => {
    const s = fraud();
    const { st, r } = play(s, ctx(), [act('tap_link'), act('close_page')]);
    expect(r).toMatchObject({ stars: 2, points: 10 });
    expect(r.beats[0]?.capped).toBe(true);
    const d = debriefOf(s, st, r, seen);
    expect(d.layer1.youChose).toEqual([{ beatId: 'start', kind: 'action', label: 'Open the link' }]);
  });

  it('a fall runs damage control: ★ and its points when ≥ 6, else 0', () => {
    const s = fraud();
    const fell = run(s, ctx(), [act('tap_link'), act('enter_card')]);
    expect(fell.phase).toBe('damage_control');
    expect(viewOf(s, ctx(), fell).recovery?.options).toHaveLength(5);
    const good = resultOf(s, B, step(s, ctx(), fell, { type: 'recovery', picks: ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'] }));
    // Card details typed to pay a fee get the "paid" advice.
    expect(good).toMatchObject({ fell: true, stars: 1, points: 9, situation: 'paid' });
    expect(good.recovery?.lo16).toBe(true);
    const poor = resultOf(s, B, step(s, ctx(), fell, { type: 'recovery', picks: ['wait_and_see', 'reply_ask_money_back', 'block_card_in_bank_app'] }));
    expect(poor).toMatchObject({ stars: 0, points: 0 });
    expect(fell.stress).toBe(10 + B.stress.on_fall);
  });

  it('report on a genuine message: 0 stars, −5 points, counted as a genuine message reported', () => {
    const { r } = play(genuine(), ctx(), [act('report_it')]);
    expect(r).toMatchObject({ stars: 0, points: -5, genuineReported: 1 });
  });

  it('verify on a harmless genuine message is a double check (gold rule input)', () => {
    expect(play(genuine(), ctx(), [act('check_app')]).r).toMatchObject({ stars: 3, doubleCheckedHarmless: true });
    expect(play(genuine(), ctx(), [act('go_pick_up')]).r.doubleCheckedHarmless).toBe(false);
  });

  it('ignores actions of other beats and events after the end', () => {
    const s = fraud();
    const st = run(s, ctx(), [act('enter_card')]);
    expect(st.groups[0]?.kinds).toEqual([]);
    const done = run(s, ctx(), [act('open_app')]);
    expect(step(s, ctx(), done, act('report_it'))).toBe(done);
  });
});

describe('runner: timers, Calm mode and freezing', () => {
  it('timer length by chapter slot and mode, same for genuine and fraud', () => {
    const f = run(timed(rawFraud()), ctx({ slot: 3 }), []);
    const g = run(timed(rawGenuine()), ctx({ slot: 3 }), []);
    expect(f.timer?.remaining).toBe(B.timers.by_slot['3']);
    expect(g.timer?.remaining).toBe(f.timer?.remaining);
    expect(run(timed(rawFraud()), ctx({ slot: 3, timerMode: 'extended' }), []).timer?.remaining).toBe(2 * (B.timers.by_slot['3'] ?? 0));
    expect(timerLength(B, 1, 'boss_beat', 'standard')).toBe(B.timers.boss_beat);
    expect(timerLength(B, 1, 'call_beat', 'extended')).toBe(2 * B.timers.call_beat);
  });

  it('Calm mode (timers off + pushers off): no timer, no pushers, no check cost', () => {
    const raw = { ...rawFraud(), pressure: { timer: true, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Still there?' }] } } };
    const st = run(scenario(raw), ctx({ timerMode: 'off', pushers: false }), [check('link'), tick(300)]);
    expect(st.timer).toBeNull();
    expect(st.pushers.fired).toEqual([]);
    expect(st.phase).toBe('playing');
  });

  it('first expiry escalates (+20 s), second scores as dismiss with no tag bonus; on fraud the deadline was fake', () => {
    const s = timed(rawFraud());
    const first = run(s, ctx(), [check('link'), tag('link'), tick(58)]);
    expect(first.timer).toMatchObject({ expiries: 1, remaining: B.timers.escalation_extra_seconds });
    const after = step(s, ctx(), first, tick(B.timers.escalation_extra_seconds));
    expect(after.phase).toBe('done');
    const r = resultOf(s, B, after);
    expect(r).toMatchObject({ stars: 2, points: 10, tagBonus: 0, timerExpired: true, correctTags: 1 });
    const d = debriefOf(s, after, r, seen);
    expect(d.layer1.deadlineWasFake).toBe(true);
    expect(d.layer1.youChose).toEqual([{ beatId: 'start', kind: 'timer' }]);
    expect(after.stress).toBe(10 + 2 * B.stress.on_timer_expiry);
  });

  it('extended mode doubles the escalation too', () => {
    const st = run(timed(rawFraud()), ctx({ timerMode: 'extended' }), [tick(120)]);
    expect(st.timer).toMatchObject({ expiries: 1, remaining: 2 * B.timers.escalation_extra_seconds });
  });

  it('the first check of an element costs 2 s; re-checking is free; checks never expire the timer', () => {
    const s = timed(rawFraud());
    const st = run(s, ctx(), [check('link'), check('link'), check('sender.detail')]);
    expect(st.timer?.remaining).toBe(60 - 2 * B.timers.inspect_cost_seconds);
    const almost = run(s, ctx(), [tick(59.5), check('reference')]);
    expect(almost.timer).toMatchObject({ expiries: 0 });
    expect(almost.timer?.remaining).toBeGreaterThan(0);
  });

  it('timer and clock freeze while a freeze reason is open', () => {
    const s = timed(rawFraud());
    const st = run(s, ctx(), [{ type: 'freeze', reason: 'translation', on: true }, tick(30)]);
    expect(st.timer?.remaining).toBe(60);
    expect(st.clock).toBe(0);
    const resumed = run(s, ctx(), [{ type: 'freeze', reason: 'translation', on: true }, tick(30), { type: 'freeze', reason: 'translation', on: false }, tick(10)]);
    expect(resumed.timer?.remaining).toBe(50);
  });

  it('pause: stress −25, timer −5 s, frozen while open, 10 s cooldown, LO-04 only under pressure', () => {
    const s = timed(rawFraud());
    const c = ctx({ stress: 50 });
    let st = run(s, c, [{ type: 'pause' }]);
    expect(st.stress).toBe(25);
    expect(st.timer?.remaining).toBe(55);
    expect(st.groups[0]?.pausedUnderPressure).toBe(true);
    st = step(s, c, st, tick(3));
    expect(st.timer?.remaining).toBe(55);
    st = step(s, c, st, { type: 'pause' });
    expect(st.pause.uses).toBe(1);
    st = step(s, c, st, tick(3));
    expect(st.pause.open).toBe(false);
    st = step(s, c, st, tick(5));
    st = step(s, c, st, { type: 'pause' });
    expect(st.pause.uses).toBe(2);
    const calm = run(fraud(), ctx({ timerMode: 'off', pushers: false }), [{ type: 'pause' }]);
    expect(calm.groups[0]?.pausedUnderPressure).toBe(false);
    const calmTense = run(fraud(), ctx({ timerMode: 'off', pushers: false, stress: 60 }), [{ type: 'pause' }]);
    expect(calmTense.groups[0]?.pausedUnderPressure).toBe(true);
  });
});

describe('runner: pushers on the authored schedule', () => {
  const messages = [
    { at_seconds: 10, text: 'Still there?' },
    { at_seconds: 30, text: 'Last chance.' },
  ];
  const withPusher = (raw: Raw) => scenario({ ...raw, pressure: { timer: false, levers: [], pusher: { messages } } });

  it('fires at the authored times when calm, identically for genuine and fraud', () => {
    const f = run(withPusher(rawFraud()), ctx({ stress: 0 }), [tick(40)]);
    const g = run(withPusher(rawGenuine()), ctx({ stress: 0 }), [tick(40)]);
    expect(f.pushers.fired.map((x) => x.at)).toEqual([10, 30]);
    expect(g.pushers.fired).toEqual(f.pushers.fired);
    expect(plannedSchedule(B, messages, 'calm')).toEqual([10, 30]);
  });

  it('stress scales the gaps by the same factor (deterministic)', () => {
    expect(plannedSchedule(B, messages, 'tense')).toEqual([10 * 0.85, 10 * 0.85 + 20 * 0.85]);
    const a = run(withPusher(rawFraud()), ctx({ stress: 75 }), [tick(1), tick(39)]);
    const b = run(withPusher(rawFraud()), ctx({ stress: 75 }), [tick(40)]);
    expect(a.pushers.fired).toEqual(b.pushers.fired);
    expect(b.pushers.fired[0]?.at).toBeCloseTo(7);
  });

  it('each pusher adds stress; the "Pushy follow-ups" setting off stops them', () => {
    const st = run(withPusher(rawFraud()), ctx({ stress: 0 }), [tick(40)]);
    expect(st.stress).toBe(2 * B.stress.on_pusher_message);
    expect(run(withPusher(rawFraud()), ctx({ pushers: false }), [tick(40)]).pushers.fired).toEqual([]);
  });

  it('the first timer expiry brings the next pusher forward', () => {
    const s = scenario({ ...rawFraud(), pressure: { timer: true, levers: [], pusher: { messages: [{ at_seconds: 100, text: 'Now!' }] } } });
    const st = run(s, ctx(), [tick(60)]);
    expect(st.pushers.fired).toEqual([{ index: 0, at: 60 }]);
  });

  it('pressure styling depends on stress only, on genuine and fraud alike', () => {
    const f = scenario(rawFraud());
    expect(viewOf(f, ctx(), startScenario(f, ctx({ stress: 10 }))).beat?.actions.some((a) => a.styled)).toBe(false);
    const tense = startScenario(f, ctx({ stress: 45 }));
    expect(viewOf(f, ctx(), tense).beat?.actions.find((a) => a.id === 'tap_link')?.styled).toBe(true);
    expect(tense.styledShown).toBe(true);
    const g = scenario(rawGenuine('g9', { message: { ...(rawGenuine().message as Raw), request: 'reply' }, actions: [
      { id: 'reply_ok', label: 'Reply OK', kind: 'proceed', outcome: 'done', pressure_target: true },
      { id: 'check_app', label: 'Check in the app first', kind: 'verify_in_app', outcome: 'done' },
    ], outcomes: { done: { narrative: 'Done.' } } }));
    expect(viewOf(g, ctx(), startScenario(g, ctx({ stress: 45 }))).beat?.actions.find((a) => a.id === 'reply_ok')?.styled).toBe(true);
  });
});

describe('runner: interrupts', () => {
  const withInterrupt = (isFraud: boolean) =>
    scenario({
      ...rawFraud(),
      interrupts: [
        {
          id: 'jonas',
          at_seconds: 5,
          is_fraud: isFraud,
          device: 'messenger',
          message: { sender: { display: 'Jonas', detail: '+49 •••• 0101' }, body: 'Took your parcel in!', request: 'none' },
          actions: [
            { id: 'thanks', label: 'Say thanks', kind: 'proceed', outcome: 'fine' },
            { id: 'report_jonas', label: 'Report', kind: 'report', outcome: 'reported' },
          ],
        },
      ],
    });

  it('arrive on the clock, add stress, are unscored', () => {
    const s = withInterrupt(false);
    const st = run(s, ctx({ stress: 0 }), [tick(6)]);
    expect(st.interrupts[0]?.arrived).toBe(true);
    expect(st.stress).toBe(B.stress.on_interrupt);
    expect(viewOf(s, ctx(), st).interrupts.map((i) => i.id)).toEqual(['jonas']);
    const { r } = play(s, ctx(), [tick(6), check('sender.detail', 'jonas'), tag('sender.detail', 'jonas'), { type: 'interrupt_act', interruptId: 'jonas', actionId: 'thanks' }, act('open_app')]);
    expect(r).toMatchObject({ points: 15, wrongTags: 0, genuineReported: 0 });
  });

  it('reporting a genuine interrupt counts as a genuine message reported; a fraud one does not', () => {
    const ev = [tick(6), { type: 'interrupt_act' as const, interruptId: 'jonas', actionId: 'report_jonas' }, act('open_app')];
    expect(play(withInterrupt(false), ctx(), ev).r.genuineReported).toBe(1);
    expect(play(withInterrupt(true), ctx(), ev).r.genuineReported).toBe(0);
  });
});

describe('runner: bosses (scammer-driven beats, summed scores)', () => {
  it('beats arrive on schedule whatever the player did; the clock fast-forwards to the next arrival', () => {
    const s = boss();
    let st = run(s, ctx(), [act('open_app')]);
    expect(st.phase).toBe('consequence');
    expect(viewOf(s, ctx(), st).consequence).toBe('No fee.');
    st = step(s, ctx(), st, { type: 'continue' });
    expect(st.clock).toBe(30);
    expect(st.groups.map((g) => g.beatId)).toEqual(['start', 'invoice']);
    expect(st.timer?.remaining).toBe(B.timers.boss_beat);
  });

  it('a beat that arrives while the player is still busy waits as a notification', () => {
    const s = boss({ pressure: { timer: false, levers: [] } });
    let st = run(s, ctx(), [tick(35)]);
    expect(viewOf(s, ctx(), st).waitingBeats).toEqual(['invoice']);
    st = step(s, ctx(), st, act('report_it'));
    st = step(s, ctx(), st, { type: 'continue' });
    expect(st.clock).toBe(35);
    expect(st.groups.at(-1)?.beatId).toBe('invoice');
  });

  it('ideal play: 3 × 15 + tag bonus capped at 6 = 51; call beat uses "What now?"', () => {
    const s = boss();
    const { st, r } = play(s, ctx(), [
      check('link'), tag('link'), act('open_app'), { type: 'continue' },
      check('sender.detail', 'invoice'), tag('sender.detail', 'invoice'), check('link', 'invoice'), tag('link', 'invoice'), act('check_app_2'), { type: 'continue' },
      act('hang_up'), { type: 'what_now', choice: 'call_back_known' },
    ]);
    expect(st.phase).toBe('done');
    expect(r).toMatchObject({ points: 51, maxPoints: 51, stars: 3, tagBonus: 6, redFlags: 3, correctTags: 3 });
    expect(st.groups[2]?.timerExpired).toBe(false);
  });

  it('a fallen beat scores 0, damage control runs once at the end and is added once', () => {
    const s = boss();
    let st = run(s, ctx(), [
      act('open_app'), { type: 'continue' },
      act('pay_invoice'), { type: 'continue' },
      act('read_code'),
    ]);
    expect(st.phase).toBe('damage_control');
    st = step(s, ctx(), st, { type: 'recovery', picks: ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'] });
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => b.points)).toEqual([15, 0, 0]);
    expect(r).toMatchObject({ points: 15 + 9, fell: true, stars: 1 });
  });

  it('one wrong tag anywhere in the boss voids the single tag bonus', () => {
    const s = boss();
    const { r } = play(s, ctx(), [
      check('link'), tag('link'), check('sender.detail'), tag('sender.detail'), act('open_app'), { type: 'continue' },
      check('link', 'invoice'), tag('link', 'invoice'), act('check_app_2'), { type: 'continue' },
      act('hang_up'), { type: 'what_now', choice: 'done' },
    ]);
    expect(r).toMatchObject({ tagBonus: 0, tagBonusVoided: true, correctTags: 2, wrongTags: 1, points: 15 + 15 + 10, stars: 3 });
  });

  it('"What now?" extra returns to the step with a note, caps the beat at ★★ and is the "You chose" line', () => {
    const s = boss();
    let st = run(s, ctx(), [act('open_app'), { type: 'continue' }, act('check_app_2'), { type: 'continue' }, act('hang_up')]);
    expect(st.phase).toBe('what_now');
    let v = viewOf(s, ctx(), st);
    expect(v.whatNow?.choices.map((c) => c.id)).toEqual(['call_this_number', 'call_back_known', 'report', 'done']);
    expect(v.whatNow?.choices[1]?.label).toBe('Call the number on your card');
    expect(v.beat?.banner?.message.body).toMatch(/approves a payment/);
    st = step(s, ctx(), st, { type: 'what_now', choice: 'call_this_number' });
    expect(st.phase).toBe('what_now');
    v = viewOf(s, ctx(), st);
    expect(v.whatNow?.note).toMatch(/whose line/);
    st = step(s, ctx(), st, { type: 'what_now', choice: 'call_back_known' });
    const r = resultOf(s, B, st);
    expect(r.beats[2]).toMatchObject({ stars: 2, capped: true, cls: 'verify' });
    expect(r.genuineReported).toBe(0);
    const d = debriefOf(s, st, r, seen);
    expect(d.layer1.youChose).toEqual([{ beatId: 'support_call', kind: 'action', label: 'Call back this number' }]);
  });

  it('"Done" in What now? scores dismiss and is named as a built-in choice', () => {
    const s = boss();
    const { st, r } = play(s, ctx(), [act('open_app'), { type: 'continue' }, act('check_app_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'done' }]);
    expect(r.beats[2]).toMatchObject({ cls: 'dismiss', stars: 2 });
    expect(debriefOf(s, st, r, seen).layer1.youChose).toEqual([{ beatId: 'support_call', kind: 'what_now', choice: 'done' }]);
  });

  it('boss stars are the rounded mean of beat stars', () => {
    const s = boss();
    const { r } = play(s, ctx(), [act('report_it'), { type: 'continue' }, act('report_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'call_back_known' }]);
    expect(r.beats.map((b) => b.stars)).toEqual([2, 2, 3]);
    expect(r.stars).toBe(2);
    expect(r.points).toBe(35);
  });
});
