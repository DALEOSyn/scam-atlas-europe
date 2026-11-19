/**
 * Madrid (T-3.6): the authored chapter played through the runner, so the GDD §24.7 strategy check, the
 * R16 engage cap on a fraud caller's banking steps (CR-31(b)), the payee-check results (CR-23) and the boss
 * hold for the real YAML.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag, tick } from './helpers.ts';
import { classOf } from '../../../src/engine/scoring.ts';

const DIR = 'content/scenarios/madrid';
const chapter = chapterSchema.parse(readYaml('content/chapters/madrid.yaml'));
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
const c = () => ctx({ slot: 4 });
const T = () => ctx({ slot: 4, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const whatNow = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'madrid-09-boss-reserve';
const DC = ['call_bank_stop_payment', 'keep_call_evidence', 'report_police_copy_to_bank'];
const DC_CODE = ['call_bank_stop_payment', 'refuse_codes_to_callers', 'report_police_copy_to_bank'];
const goodNight: RunnerEvent = { type: 'interrupt_act', interruptId: 'andres_buenas_noches', actionId: 'reply_buenas_noches' };
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** Play to the end: Continue through consequences, answer interrupts, perfect damage control. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState): RunnerState {
  let st = st0;
  for (let i = 0; i < 10 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') st = step(s, cx, st, s.id === BOSS ? goodNight : { type: 'interrupt_act', interruptId: s.interrupts[0]?.id ?? '', actionId: s.interrupts[0]?.actions[0]?.id ?? '' });
    else if (st.phase === 'damage_control') st = step(s, cx, st, recover(s.id === 'madrid-07-cancellation-code' ? DC_CODE : DC));
    else break;
  }
  return st;
}
function rec(id: string, events: RunnerEvent[]): ScenarioRecord {
  const s = get(id);
  const st = finish(s, T(), run(s, T(), events));
  expect([id, st.phase]).toEqual([id, 'done']);
  return recordOf(resultOf(s, B, st), s.pattern);
}

/** Row 1 (ideal) per scored scenario; other rows swap single entries. */
const ideal: Record<string, RunnerEvent[]> = {
  'madrid-01-dinner-at-nine': [act('reply_im_in')],
  'madrid-02-real-card-call': [act('answer_not_me')],
  'madrid-03-text-in-the-thread': [...tagAll('start', 'phone_number', 'request'), act('open_app_text')],
  'madrid-05-reserve-account-call': [...tagAll('start', 'claim#2', 'request'), act('hang_up_reserve'), whatNow('call_back_known')],
  'madrid-06-real-code-for-you': [act('wait_for_code'), act('type_code_checkout')],
  'madrid-07-cancellation-code': [...tagAll('start', 'request'), act('hang_up_cancel_code'), whatNow('call_card_after_code_call')],
  'madrid-08-card-paused-link': [...tagAll('start', 'link'), act('open_app_paused')],
  [BOSS]: [
    ...tagAll('start', 'phone_number', 'request'),
    act('open_app_b1'),
    cont,
    ...tagAll('security_call', 'claim#2', 'request'),
    act('hang_up_boss_call'),
    whatNow('call_back_known'),
    cont,
    ...tagAll('reserve_text', 'phone_number', 'request'),
    act('call_card_b3'),
  ],
};
const summary = (over: Record<string, RunnerEvent[]>) => {
  const rs = Object.entries({ ...ideal, ...over }).map(([id, ev]) => rec(id, ev));
  return summarise(B, chapter, rs, true);
};

describe('Madrid: chapter totals (GDD §24.7)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 12, max 168, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(12);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(168);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'madrid-01-dinner-at-nine': [0, 15],
      'madrid-02-real-card-call': [0, 15],
      'madrid-03-text-in-the-thread': [2, 19],
      'madrid-05-reserve-account-call': [2, 19],
      'madrid-06-real-code-for-you': [0, 15],
      'madrid-07-cancellation-code': [1, 17],
      'madrid-08-card-paused-link': [1, 17],
      [BOSS]: [6, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('the card\'s number (ends 00) is never a red flag, and no other number in the chapter ends 00', () => {
    for (const s of all.values()) {
      const beats = [{ message: s.message, inspectables: s.inspectables }, ...s.beats];
      for (const b of beats) {
        const nums = b.message.phone_numbers ?? [];
        nums.forEach((n, i) => {
          if (!n.endsWith('00')) return;
          expect(n).toBe('9•• ••• •00');
          const target = i === 0 ? 'phone_number' : `phone_number#${i + 1}`;
          expect(b.inspectables.find((x) => x.target === target)?.red_flag ?? false).toBe(false);
        });
      }
    }
  });

  it('the Spain sender-register line appears once, in 4-3 layer 2 (ruling M5 / R10)', () => {
    const line = 'Since September 2026, Spanish phone companies must block texts under sender names that aren\'t registered. Even so, a text in your bank\'s real thread is no proof.';
    const hits = [...all.values()].filter((s) => JSON.stringify(s).includes('Spanish phone companies'));
    expect(hits.map((s) => s.id)).toEqual(['madrid-03-text-in-the-thread']);
    expect(get('madrid-03-text-in-the-thread').debrief.layer2.notes).toContain(line);
  });

  it('boss: only the first fall narrative names the amount, so a run that falls three times never moves the full balance twice (QA round 2)', () => {
    const o = get(BOSS).outcomes;
    const falls = ['moved_on_text_call', 'sent_to_custodia', 'moved_on_agent_line'];
    expect(falls.filter((k) => (o[k]?.narrative ?? '').includes('€3,215.28'))).toEqual(['moved_on_text_call']);
  });

  it('refunds are only ever "may" (no "will refund")', () => {
    for (const s of all.values()) expect([s.id, /\bwill (?:refund|get (?:it|your money) back)/i.test(JSON.stringify(s))]).toEqual([s.id, false]);
  });
});

describe('Madrid R16: following a fraud caller into your own app caps at ★★ (CR-31(b))', () => {
  it('4-5: follow their steps, then "Hang up and call your card\'s number" = ★★ (10); with both tags 14', () => {
    const s = get('madrid-05-reserve-account-call');
    const r = play(s, c(), [act('follow_steps_reserve'), act('hang_up_call_card_reserve')]).r;
    expect(r.stars).toBe(2);
    expect(r.points).toBe(10);
    expect(play(s, c(), [...tagAll('start', 'claim#2', 'request'), act('follow_steps_reserve'), act('hang_up_cancel_reserve')]).r.points).toBe(14);
  });

  it('4-5: the "doesn\'t match" warning is a red flag worth tagging (spotted, not in R); confirming falls with 6 options', () => {
    const s = get('madrid-05-reserve-account-call');
    const r = play(s, c(), [act('follow_steps_reserve'), check('payee.name_check', 'reserve_transfer'), tag('payee.name_check', 'reserve_transfer'), act('hang_up_report_reserve')]).r;
    expect(r.stars).toBe(2);
    expect(r.correctTags).toBe(1);
    expect(r.wrongTags).toBe(0);
    const fell = play(s, c(), [act('follow_steps_reserve'), act('confirm_send_reserve')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
  });

  it('4-5: hanging up at once and calling the card\'s number is ★★★; "Call back this number" caps at ★★', () => {
    const s = get('madrid-05-reserve-account-call');
    expect(play(s, c(), [act('hang_up_reserve'), whatNow('call_back_known')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_reserve'), whatNow('open_app_after_reserve_call')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_reserve'), whatNow('call_back_this_number_reserve'), whatNow('call_back_known')]).r.stars).toBe(2);
  });

  it('4-3: calling the number in the text, then hanging up and calling the card = ★★; following their steps falls', () => {
    const s = get('madrid-03-text-in-the-thread');
    expect(play(s, c(), [act('call_number_in_text'), act('hang_up_security'), whatNow('call_back_known')]).r.stars).toBe(2);
    const fell = play(s, c(), [act('call_number_in_text'), act('follow_steps_security'), recover(DC)]).r;
    expect(fell.fell).toBe(true);
    expect(fell.points).toBe(9);
  });
});

describe('Madrid genuine twins and calls (ruling R9)', () => {
  it('4-2 real call: answering and calling the card\'s number are both ★★★; reporting it costs 5; leaving it ★★', () => {
    const s = get('madrid-02-real-card-call');
    expect(play(s, c(), [act('answer_not_me')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_card_team'), whatNow('call_card_after_real_call')]).r.stars).toBe(3);
    const reported = play(s, c(), [act('hang_up_card_team'), whatNow('report')]).r;
    expect(reported.points).toBe(-5);
    expect(reported.genuineReported).toBe(1);
    expect(play(s, c(), [act('hang_up_card_team'), whatNow('done')]).r.stars).toBe(2);
  });

  it('4-6 real code: typing it where you pay or checking the app first is ★★★; the opener never decides', () => {
    const s = get('madrid-06-real-code-for-you');
    expect(play(s, T(), [act('wait_for_code'), act('type_code_checkout')]).r.stars).toBe(3);
    expect(play(s, T(), [act('wait_for_code'), act('open_app_first')]).r.stars).toBe(3);
    expect(play(s, T(), [act('wait_for_code'), act('report_code_text')]).r.points).toBe(-5);
    expect(play(s, T(), [act('wait_for_code'), act('leave_adapter')]).r.stars).toBe(0);
  });

  it('4-6: the checkout opener has one action, the setup step (CR-45 single-action opener; the old workaround option is gone)', () => {
    const s = get('madrid-06-real-code-for-you');
    expect(s.actions.map((a) => a.id)).toEqual(['wait_for_code']);
  });
  it('4-7: reading out the code falls (6 options); the card\'s number on "What now?" is ★★★', () => {
    const s = get('madrid-07-cancellation-code');
    const fell = play(s, c(), [act('read_out_cancel_code')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
    expect(play(s, c(), [act('hang_up_cancel_code'), whatNow('call_card_after_code_call')]).r.stars).toBe(3);
  });

  it('4-7: tagging the quoted card number (a decoy) voids the bonus', () => {
    const s = get('madrid-07-cancellation-code');
    const r = play(s, c(), [...tagAll('start', 'phone_number', 'request'), act('hang_up_cancel_code'), whatNow('call_card_after_code_call')]).r;
    expect(r.tagBonusVoided).toBe(true);
  });
});

describe('Madrid boss (call into the bank app, match on a dictated name, covered_by)', () => {
  const s = get(BOSS);

  it('ideal: all 6 red flags tagged and three verifies: 51 of 51', () => {
    const st = finish(s, T(), run(s, T(), ideal[BOSS] ?? []));
    const r = resultOf(s, B, st);
    expect(r.points).toBe(51);
    expect(r.beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('beat 2: following their steps, then hanging up to call the card is ★★ (R16); tagging the match is a wrong tag', () => {
    const st = finish(
      s,
      T(),
      run(s, T(), [
        act('open_app_b1'),
        cont,
        act('follow_steps_boss'),
        check('payee.name_check', 'boss_reserve'),
        tag('payee.name_check', 'boss_reserve'),
        act('hang_up_call_card_boss'),
        cont,
        act('call_card_b3'),
      ]),
    );
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => b.stars)).toEqual([3, 2, 3]);
    expect(r.wrongTags).toBe(1);
  });

  it('a call-back on beat 1 covers "leave it there" on the call and "delete" on the last text', () => {
    const st = finish(s, T(), run(s, T(), [act('call_card_b1'), cont, act('hang_up_boss_call'), whatNow('done'), cont, act('delete_b3')]));
    expect(resultOf(s, B, st).beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('falls on every beat merge into one six-step list and set madrid_money_moved; Andrés\'s good night is skipped', () => {
    let st = run(s, T(), [act('call_follow_steps_b1'), cont, act('follow_steps_boss'), act('confirm_send_boss'), cont, act('call_agent_move_b3')]);
    while (st.phase === 'consequence') st = step(s, T(), st, cont);
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    st = finish(s, T(), st);
    const r = resultOf(s, B, st);
    expect(r.points).toBe(9);
    expect(r.flagsSet).toContain('madrid_money_moved');
    expect(st.interrupts.find((i) => i.id === 'andres_buenas_noches')?.skipped).toBe(true);
  });
});

describe('Madrid strategy rows (GDD §24.7)', () => {
  it('row 1 ideal: 168 of 168, spotted 12, gold', () => {
    const m = summary({});
    expect([m.points, m.max, m.spotted, m.stamp]).toEqual([168, 168, 12, 'gold']);
  });

  it('row 2 ideal + calls Andrés about dinner (off-focus double check): 168, silver', () => {
    const m = summary({ 'madrid-01-dinner-at-nine': [act('call_andres_check')] });
    expect([m.points, m.stamp]).toEqual([168, 'silver']);
  });

  it('row 3a follows the caller into the app in 4-5 and boss beat 2, then calls the card: 158, gold', () => {
    const m = summary({
      'madrid-05-reserve-account-call': [...tagAll('start', 'claim#2', 'request'), act('follow_steps_reserve'), act('hang_up_call_card_reserve')],
      [BOSS]: [
        ...tagAll('start', 'phone_number', 'request'),
        act('open_app_b1'),
        cont,
        ...tagAll('security_call', 'claim#2', 'request'),
        act('follow_steps_boss'),
        act('hang_up_call_card_boss'),
        cont,
        ...tagAll('reserve_text', 'phone_number', 'request'),
        act('call_card_b3'),
      ],
    });
    expect([m.points, m.spotted, m.stamp]).toEqual([158, 12, 'gold']);
  });

  it('row 5 ideal but reports the real bank call: 148, silver', () => {
    const m = summary({ 'madrid-02-real-card-call': [act('hang_up_card_team'), whatNow('report')] });
    expect([m.points, m.stamp]).toEqual([148, 'silver']);
  });

  // GDD §24.7 row 11 counts the boss tags as +4, but the 4 correct tags on beats 1 and 3 earn 2 each up to the
  // boss cap of 6 (balance multi_step.boss.tag_bonus), so the chapter scores 144 (85.7%). Still silver: rating
  // < 90 and spotted 7 < 8. Reported to game-designer for the table.
  it('row 11 "trust the caller ID": 144 (85.7%), spotted 7, silver', () => {
    const m = summary({
      'madrid-05-reserve-account-call': [act('follow_steps_reserve'), act('confirm_send_reserve'), recover(DC)],
      'madrid-07-cancellation-code': [act('read_out_cancel_code'), recover(DC_CODE)],
      [BOSS]: [
        ...tagAll('start', 'phone_number', 'request'),
        act('open_app_b1'),
        cont,
        act('follow_steps_boss'),
        act('confirm_send_boss'),
        cont,
        ...tagAll('reserve_text', 'phone_number', 'request'),
        act('call_card_b3'),
      ],
    });
    expect([m.points, m.spotted, m.stamp]).toEqual([144, 7, 'silver']);
    expect(m.rating).toBeCloseTo(85.7, 1);
  });
});

describe('Madrid drill 4-4 and arc beat', () => {
  it('the drill is unscored', () => {
    const s = get('madrid-04-lucia-slept-on-it');
    expect(play(s, c(), [check('phone_number'), tag('phone_number'), act('say_open_app')]).r.scored).toBe(false);
  });

  it('the arc beat is slot 4 and unscored', () => {
    const s = get('madrid-arc-alex-04');
    expect(s.arc_slot).toBe(4);
    expect(play(s, c(), [act('change_topic_alex')]).r.stars).toBeNull();
  });
});

describe('Madrid R21: timer expiry on a genuine scenario never beats its dismiss option', () => {
  const expire: RunnerEvent[] = Array.from({ length: 400 }, () => tick(1));
  // [expiry stars, expiry points, the dismiss option it scores as]
  const EXPIRY: Record<string, [number, number, RunnerEvent[]]> = {
    'madrid-02-real-card-call': [2, 10, [act('hang_up_card_team'), whatNow('done')]], // low stakes: as "Hang up", then "Leave it there"
    'madrid-06-real-code-for-you': [0, 0, [act('wait_for_code'), act('leave_adapter')]], // psych M1: the code text's "Leave it, buy the adapter later"
  };
  it('timed genuine scenarios are exactly 4-2 and 4-6, and their expiry scores are pinned', () => {
    const timed = [...all.values()].filter((s) => !s.is_fraud && s.pressure.timer && s.role !== 'arc' && s.role !== 'drill');
    expect(timed.map((s) => s.id).sort()).toEqual(Object.keys(EXPIRY).sort());
    for (const [id, [stars, points, dismiss]] of Object.entries(EXPIRY)) {
      const s = get(id);
      const expired = play(s, c(), expire).r.beats[0];
      expect([id, expired?.timerExpired, expired?.stars, expired?.points]).toEqual([id, true, stars, points]);
      const left = play(s, c(), dismiss).r.beats[0];
      expect([id, left?.stars, left?.points]).toEqual([id, stars, points]);
    }
  });
  it('4-6: no dismiss on the opener, so the expiry looks ahead to the code text', () => {
    const s = get('madrid-06-real-code-for-you');
    expect(s.actions.filter((a) => classOf(B, a.kind) === 'dismiss')).toEqual([]);
    expect(s.beats[0]?.actions.filter((a) => classOf(B, a.kind) === 'dismiss').map((a) => a.id)).toEqual(['leave_adapter']);
  });
});
