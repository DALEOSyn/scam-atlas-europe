/**
 * Amsterdam (T-3.4): the authored chapter played through the runner, so the GDD §22.4 strategy check
 * and the banking paths (CR-18 `step`) hold for the real YAML, not only for fixtures.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, viewOf, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, ctx, play, run, tag, tick } from './helpers.ts';

const DIR = 'content/scenarios/amsterdam';
const all = new Map<string, Scenario>(
  readdirSync(resolve(ROOT, DIR))
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      const s = scenarioSchema.parse(readYaml(`${DIR}/${f}`));
      return [s.id, s] as const;
    }),
);
const get = (id: string): Scenario => {
  const s = all.get(id);
  if (!s) throw new Error(`missing ${id}`);
  return s;
};
const c = () => ctx({ slot: 2 });
const cont: RunnerEvent = { type: 'continue' };
const whatNow = (choice: string): RunnerEvent => ({ type: 'what_now', choice });

describe('Amsterdam: chapter totals (GDD §22.4)', () => {
  it('R = 15 and max points 174 over the scored scenarios', () => {
    const scored = [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');
    expect(scored).toHaveLength(8);
    expect(scored.reduce((n, s) => n + redFlagCount(s), 0)).toBe(15);
    expect(scored.reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(174);
    expect(maxPointsOfScenario(B, get('amsterdam-09-boss-last-evening'))).toBe(51);
  });
});

describe('Amsterdam banking paths (CR-18: start_transfer never decides or caps)', () => {
  it('2-3: start → no match → "Cancel and call" is ★★★ with the tag bonus; "Cancel" is ★★; "Send anyway" falls', () => {
    const s = get('amsterdam-03-noor-new-number');
    const best = play(s, c(), [{ type: 'check', beatId: 'start', target: 'request' }, tag('request'), act('start_noor_transfer'), act('cancel_call_noor')]);
    expect(best.r.stars).toBe(3);
    expect(best.r.tagBonus).toBe(2);
    expect(play(s, c(), [act('start_noor_transfer'), act('cancel_noor_transfer')]).r.stars).toBe(2);
    const fell = play(s, c(), [act('start_noor_transfer'), act('send_84_anyway')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
  });

  it('2-6: start → request page → Pay is ★★★; Decline is dismiss on genuine high stakes (0)', () => {
    const s = get('amsterdam-06-boat-tour-share');
    expect(play(s, c(), [act('open_boat_request'), act('pay_18')]).r.stars).toBe(3);
    expect(play(s, c(), [act('open_boat_request'), act('call_mateus_from_request')]).r.stars).toBe(3);
    expect(play(s, c(), [act('open_boat_request'), act('decline_boat_request')]).r.stars).toBe(0);
  });

  it('2-8: start → match → "Cancel and phone Jonas" is ★★★; tagging the matching name voids the bonus', () => {
    const s = get('amsterdam-08-jonas-rent');
    expect(play(s, c(), [act('start_landlord_transfer'), act('cancel_phone_jonas')]).r.stars).toBe(3);
    const wrong = play(s, c(), [
      act('start_landlord_transfer'),
      { type: 'check', beatId: 'landlord_transfer', target: 'payee.name_check' },
      tag('payee.name_check', 'landlord_transfer'),
      act('cancel_phone_jonas'),
    ]);
    expect(wrong.r.tagBonusVoided).toBe(true);
  });
});

describe('Amsterdam 2-7 (engage chain)', () => {
  it('verify at the call ("What now?" extra) is ★★★; stopping at the top-up with Teo is ★★ (engage cap)', () => {
    const s = get('amsterdam-07-easy-work');
    expect(play(s, c(), [act('hang_up_recording'), whatNow('look_up_klaverwerk_call')]).r.stars).toBe(3);
    const curious = play(s, c(), [act('message_on_kettle'), act('open_trial'), act('start_task_set'), act('stop_ask_teo')]);
    expect(curious.r.stars).toBe(2);
  });

  it('the top-up follow-up fires only once the top-up page is reached (CR-21)', () => {
    const s = get('amsterdam-07-easy-work');
    const early = run(s, ctx({ slot: 2, timerMode: 'off' }), [act('message_on_kettle'), tick(30)]);
    expect(early.pushers.fired.map((f) => f.index)).not.toContain(1);
    const late = run(s, ctx({ slot: 2, timerMode: 'off' }), [act('message_on_kettle'), act('open_trial'), act('start_task_set'), tick(21)]);
    expect(late.pushers.fired.map((f) => f.index)).toContain(1);
  });
});

describe('Amsterdam boss (CR-18(e) chaining, covered_by, interrupt)', () => {
  const s = get('amsterdam-09-boss-last-evening');
  /** Ideal: verify on every beat (beat 2 through the request page), tag the 6 red flags, reply to the real Mateus. */
  function ideal(): RunnerState {
    let st = run(s, c(), [
      { type: 'check', beatId: 'start', target: 'link' },
      tag('link'),
      { type: 'check', beatId: 'start', target: 'request' },
      tag('request'),
      act('look_up_klaverwerk_boss'),
      cont,
      { type: 'check', beatId: 'mateus_new_number', target: 'sender.detail' },
      tag('sender.detail', 'mateus_new_number'),
      { type: 'check', beatId: 'mateus_new_number', target: 'request' },
      tag('request', 'mateus_new_number'),
      act('open_hotel_request'),
      act('close_call_mateus'),
      cont,
      { type: 'check', beatId: 'mateus_voice_call', target: 'caller_id' },
      tag('caller_id', 'mateus_voice_call'),
      { type: 'check', beatId: 'mateus_voice_call', target: 'request' },
      tag('request', 'mateus_voice_call'),
      act('hang_up_voice'),
      whatNow('call_back_known'),
    ]);
    if (st.phase === 'consequence') st = step(s, c(), st, cont);
    expect(st.phase).toBe('interrupt');
    st = step(s, c(), st, { type: 'interrupt_act', interruptId: 'real_mateus_landed', actionId: 'reply_real_mateus' });
    while (st.phase === 'consequence') st = step(s, c(), st, cont);
    return st;
  }

  it('the ideal run scores 51 of 51 with ★★★ and no genuine report', () => {
    const st = ideal();
    expect(st.phase).toBe('done');
    const r = resultOf(s, B, st);
    expect(r.points).toBe(51);
    expect(r.stars).toBe(3);
    expect(r.genuineReported).toBe(0);
  });

  it('the beat-2 call-back on the request page covers a report on the voice call', () => {
    let st = run(s, c(), [act('report_klaverwerk_text'), cont, act('open_hotel_request'), act('close_call_mateus'), cont, act('hang_up_voice'), whatNow('report')]);
    if (st.phase === 'consequence') st = step(s, c(), st, cont);
    st = step(s, c(), st, { type: 'interrupt_act', interruptId: 'real_mateus_landed', actionId: 'reply_real_mateus' });
    while (st.phase === 'consequence') st = step(s, c(), st, cont);
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => b.stars)).toEqual([2, 3, 3]);
  });

  it('while the request page is open the voice call waits, then arrives', () => {
    let st = run(s, c(), [act('look_up_klaverwerk_boss'), cont, act('open_hotel_request'), tick(50)]);
    expect(viewOf(s, c(), st).waitingBeats).toEqual([]);
    expect(st.groups.at(-1)?.beatId).toBe('mateus_new_number');
    st = run(s, c(), [act('look_up_klaverwerk_boss'), cont, act('open_hotel_request'), tick(50), act('close_hotel_request'), cont]);
    expect(st.groups.at(-1)?.beatId).toBe('mateus_voice_call');
  });

  it('paying on the request page is a fall with damage control', () => {
    let st = run(s, c(), [act('report_klaverwerk_text'), cont, act('open_hotel_request'), act('pay_260'), cont, act('hang_up_voice'), whatNow('done')]);
    while (st.phase === 'consequence') st = step(s, c(), st, cont);
    expect(st.phase).toBe('damage_control');
  });
});

describe('Amsterdam drill 2-4', () => {
  it('"I paid it, actually" opens the generic damage control; nothing is scored', () => {
    const s = get('amsterdam-04-noor-lock-down');
    const { st, r } = play(s, c(), [act('admit_paid')]);
    expect(st.phase).toBe('damage_control');
    expect(r.scored).toBe(false);
  });
});
