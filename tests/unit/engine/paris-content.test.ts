/**
 * Paris (T-3.5): the authored chapter played through the runner, so the GDD §23.7 strategy check, the
 * payee-check banking paths (CR-18 `step`, CR-23) and the boss (CR-18(e), CR-24) hold for the real YAML.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, viewOf, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag, tick } from './helpers.ts';

const DIR = 'content/scenarios/paris';
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
const c = () => ctx({ slot: 3 });
const cont: RunnerEvent = { type: 'continue' };
const whatNow = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });

describe('Paris: chapter totals (GDD §23.7)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 11, max 170, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(11);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(170);
    expect(maxPointsOfScenario(B, get('paris-09-boss-pont'))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'paris-01-rent-close-match': [0, 15],
      'paris-02-ceo-lookalike': [2, 19],
      'paris-04-supplier-new-bank': [0, 15],
      'paris-05-salary-change': [1, 17],
      'paris-06-solene-urgent': [0, 15],
      'paris-07-agency-new-account': [3, 21],
      'paris-08-supplier-thread-match': [1, 17],
      'paris-09-boss-pont': [4, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('all four payee-check results appear, and "match" appears on genuine and fraud alike', () => {
    const results = new Map<string, boolean[]>();
    for (const s of all.values()) {
      for (const b of s.beats) {
        const r = b.message.payee?.name_check;
        if (r) results.set(r, [...(results.get(r) ?? []), s.is_fraud]);
      }
    }
    expect([...results.keys()].sort()).toEqual(['close_match', 'match', 'mismatch', 'unavailable']);
    expect(results.get('match')).toContain(true);
    expect(results.get('match')).toContain(false);
  });
});

describe('Paris banking paths (CR-18: start_transfer never decides or caps)', () => {
  it('3-1 close match: "Use the shown name and pay" is ★★★; cancelling a genuine rent is 0; reporting it costs 5', () => {
    const s = get('paris-01-rent-close-match');
    expect(play(s, c(), [act('start_rent_transfer'), act('pay_rent_holder')]).r.stars).toBe(3);
    expect(play(s, c(), [act('start_rent_transfer'), act('cancel_call_agency')]).r.stars).toBe(3);
    expect(play(s, c(), [act('start_rent_transfer'), act('cancel_rent')]).r.stars).toBe(0);
    const reported = play(s, c(), [act('start_rent_transfer'), act('cancel_report_rent')]).r;
    expect(reported.points).toBe(-5);
    expect(reported.genuineReported).toBe(1);
  });

  it('3-2 couldn\'t check: sending it for Solène\'s sign-off is ★★★ (four-eyes); "Cancel" ★★; signing off alone falls', () => {
    const s = get('paris-02-ceo-lookalike');
    const best = play(s, c(), [check('sender.detail'), tag('sender.detail'), check('request'), tag('request'), act('start_ceo_transfer'), act('send_ceo_for_signoff')]);
    expect(best.r.stars).toBe(3);
    expect(best.r.tagBonus).toBe(4);
    expect(best.r.points).toBe(19);
    expect(play(s, c(), [act('start_ceo_transfer'), act('cancel_ceo')]).r.stars).toBe(2);
    const fell = play(s, c(), [act('start_ceo_transfer'), act('send_alone_ceo')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
  });

  it('3-4 genuine change: paying the new account without the call is ★ (5); the call is ★★★', () => {
    const s = get('paris-04-supplier-new-bank');
    const paid = play(s, c(), [act('update_payee_email'), act('pay_new_feuillemont')]).r;
    expect(paid.stars).toBe(1);
    expect(paid.points).toBe(5);
    expect(play(s, c(), [act('call_feuillemont_file')]).r.stars).toBe(3);
    expect(play(s, c(), [act('update_payee_email'), act('cancel_call_feuillemont')]).r.stars).toBe(3);
  });

  it('3-7 doesn\'t match: tagging the warning counts toward spotting; "Pay anyway" falls with 6 options', () => {
    const s = get('paris-07-agency-new-account');
    const stopped = play(s, c(), [
      act('start_agency_transfer'),
      check('payee.name_check', 'agency_transfer'),
      tag('payee.name_check', 'agency_transfer'),
      act('stop_call_agency'),
    ]).r;
    expect(stopped.stars).toBe(3);
    expect(stopped.correctTags).toBe(1);
    expect(stopped.wrongTags).toBe(0);
    const fell = play(s, c(), [act('start_agency_transfer'), act('pay_anyway_agency')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
  });

  it('3-8 match: tagging the matching name is a wrong tag; trusting it falls', () => {
    const s = get('paris-08-supplier-thread-match');
    const wrong = play(s, c(), [
      act('setup_platinoir_payment'),
      check('payee.name_check', 'platinoir_transfer'),
      tag('payee.name_check', 'platinoir_transfer'),
      act('cancel_call_platinoir'),
    ]).r;
    expect(wrong.stars).toBe(3);
    expect(wrong.tagBonusVoided).toBe(true);
    const fell = play(s, c(), [act('setup_platinoir_payment'), act('pay_vardoulec'), recover(['call_bank_recall_transfer', 'warn_creditor_known_number', 'tell_management_known_channel'])]);
    expect(fell.r.fell).toBe(true);
    expect(fell.r.points).toBe(9);
  });

  it('3-5: changing the pay details is a fall that sets the story flag; asking Inès is ★★★', () => {
    const s = get('paris-05-salary-change');
    const fell = play(s, ctx({ slot: 3, timerMode: 'off' }), [act('update_ines_pay'), recover(['check_pay_details_with_person', 'tell_management_known_channel', 'tell_it_team'])]);
    expect(fell.r.fell).toBe(true);
    expect(fell.r.points).toBe(9);
    expect(fell.r.flagsSet).toContain('paris_pay_redirected');
    expect(play(s, ctx({ slot: 3, timerMode: 'off' }), [act('ask_ines_brewnook')]).r.stars).toBe(3);
  });

  it('3-6 genuine urgent: the usual approval is ★★★, signing off alone ★, reporting it −5', () => {
    const s = get('paris-06-solene-urgent');
    expect(play(s, c(), [act('prepare_for_approval')]).r.stars).toBe(3);
    expect(play(s, c(), [act('pay_alone_genuine')]).r.stars).toBe(1);
    expect(play(s, c(), [act('report_solene_real')]).r.points).toBe(-5);
  });
});

describe('Paris boss (CR-18(e) four-eyes sub-beat, held call, covered_by, video call)', () => {
  const s = get('paris-09-boss-pont');
  const interruptReply: RunnerEvent = { type: 'interrupt_act', interruptId: 'ines_long_weekend', actionId: 'reply_ines_weekend' };
  function finish(st0: RunnerState): RunnerState {
    let st = st0;
    for (let i = 0; i < 6 && st.phase !== 'done' && st.phase !== 'damage_control'; i++) {
      if (st.phase === 'consequence') st = step(s, c(), st, cont);
      else if (st.phase === 'interrupt') st = step(s, c(), st, interruptReply);
    }
    return st;
  }

  it('ideal: four-eyes on beat 1, directory call-backs on beats 2 and 3, all 4 red flags tagged: 51 of 51', () => {
    const st = finish(
      run(s, c(), [
        check('request'),
        tag('request'),
        act('setup_boss_transfer'),
        act('send_boss_for_signoff'),
        cont,
        check('phone_number', 'lawyer_call'),
        tag('phone_number', 'lawyer_call'),
        check('request', 'lawyer_call'),
        tag('request', 'lawyer_call'),
        act('hang_up_lawyer'),
        whatNow('call_back_known'),
        cont,
        check('request', 'video_call'),
        tag('request', 'video_call'),
        act('end_video_call'),
        whatNow('call_back_known'),
      ]),
    );
    expect(st.phase).toBe('done');
    const r = resultOf(s, B, st);
    expect(r.points).toBe(51);
    expect(r.stars).toBe(3);
    expect(r.genuineReported).toBe(0);
  });

  it('the Adaeze "What now?" extra on the video call is verify (★★★)', () => {
    const st = finish(run(s, c(), [act('call_solene_boss'), cont, act('hang_up_lawyer'), whatNow('call_back_known'), cont, act('end_video_call'), whatNow('ask_adaeze_directory_paris')]));
    expect(resultOf(s, B, st).beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('a call-back on beat 1 covers "leave it there" on the lawyer call and the video call', () => {
    const st = finish(run(s, c(), [act('call_solene_boss'), cont, act('hang_up_lawyer'), whatNow('done'), cont, act('end_video_call'), whatNow('done')]));
    expect(resultOf(s, B, st).beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('while the Larchwick Pro card is open the lawyer call waits, then arrives when it closes', () => {
    let st = run(s, c(), [act('setup_boss_transfer'), tick(50)]);
    expect(viewOf(s, c(), st).waitingBeats).toEqual([]);
    expect(st.groups.at(-1)?.beatId).toBe('start');
    st = run(s, c(), [act('setup_boss_transfer'), tick(50), act('cancel_boss'), cont]);
    expect(st.groups.at(-1)?.beatId).toBe('lawyer_call');
  });

  it('falls on every beat merge into one six-step list; perfect damage control adds 9', () => {
    let st = run(s, c(), [act('setup_boss_transfer'), act('send_alone_boss'), cont, act('send_on_lawyer_call'), cont, act('send_on_her_word')]);
    st = finish(st);
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    st = finish(step(s, c(), st, recover(['call_bank_recall_transfer', 'tell_management_known_channel', 'secure_mailbox_owner'])));
    const r = resultOf(s, B, st);
    expect(r.points).toBe(9);
    expect(r.flagsSet).toContain('paris_boss_sent');
  });

  it('after a fall, Inès\'s "Have a good long weekend!" is dropped (on_fall: skip, CR-27)', () => {
    let st = run(s, c(), [act('call_solene_boss'), cont, act('hang_up_lawyer'), whatNow('done'), cont, act('send_on_her_word')]);
    while (st.phase === 'consequence') st = step(s, c(), st, cont);
    expect(st.phase).toBe('damage_control');
    st = step(s, c(), st, recover(['call_bank_recall_transfer', 'tell_management_known_channel', 'secure_mailbox_owner']));
    while (st.phase === 'consequence') st = step(s, c(), st, cont);
    expect(st.phase).toBe('done');
    expect(st.interrupts.find((i) => i.id === 'ines_long_weekend')?.skipped).toBe(true);
  });
});

describe('Paris strategy rows (GDD §23.7)', () => {
  /** Row 11, "Trust the bank's check": pay unless it says "doesn't match"; perfect damage control. */
  it('row 11 trusting the bank\'s check scores 81 of 170 (bronze territory)', () => {
    const T = ctx({ slot: 3, timerMode: 'off' });
    const pts = (id: string, events: RunnerEvent[]) => {
      const sc = get(id);
      let st = run(sc, T, events);
      for (let i = 0; i < 8 && st.phase !== 'done'; i++) {
        if (st.phase === 'consequence') st = step(sc, T, st, cont);
        else if (st.phase === 'interrupt') st = step(sc, T, st, { type: 'interrupt_act', interruptId: 'ines_long_weekend', actionId: 'reply_ines_weekend' });
        else if (st.phase === 'damage_control') st = step(sc, T, st, recover(sc.id === 'paris-09-boss-pont' ? ['call_bank_recall_transfer', 'tell_management_known_channel', 'secure_mailbox_owner'] : ['call_bank_recall_transfer', 'tell_management_known_channel', 'file_complaint_police']));
        else break;
      }
      return resultOf(sc, B, st).points;
    };
    const total =
      pts('paris-01-rent-close-match', [act('start_rent_transfer'), act('pay_rent_holder')]) +
      pts('paris-02-ceo-lookalike', [act('start_ceo_transfer'), act('send_alone_ceo')]) +
      pts('paris-04-supplier-new-bank', [act('update_payee_email'), act('pay_new_feuillemont')]) +
      pts('paris-05-salary-change', [act('update_ines_pay'), recover(['check_pay_details_with_person', 'tell_management_known_channel', 'tell_it_team'])]) +
      pts('paris-06-solene-urgent', [act('prepare_for_approval')]) +
      pts('paris-07-agency-new-account', [act('start_agency_transfer'), act('cancel_agency')]) +
      pts('paris-08-supplier-thread-match', [act('setup_platinoir_payment'), act('pay_vardoulec'), recover(['call_bank_recall_transfer', 'warn_creditor_known_number', 'tell_management_known_channel'])]) +
      pts('paris-09-boss-pont', [act('setup_boss_transfer'), act('send_alone_boss'), cont, act('send_on_lawyer_call'), cont, act('send_on_her_word')]);
    expect(total).toBe(81);
  });
});

describe('Paris drill 3-3 and arc beat', () => {
  it('the drill is unscored', () => {
    const s = get('paris-03-ines-plumber-rib');
    const { r } = play(s, c(), [check('link'), tag('link'), act('reply_well_spotted')]);
    expect(r.scored).toBe(false);
  });

  it('the arc beat is slot 3 and unscored', () => {
    const s = get('paris-arc-alex-03');
    expect(s.arc_slot).toBe(3);
    expect(play(s, c(), [act('tell_teo_secret')]).r.stars).toBeNull();
  });
});
