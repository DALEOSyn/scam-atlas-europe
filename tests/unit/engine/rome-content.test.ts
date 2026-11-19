/**
 * Rome (T-3.8): the authored chapter played through the runner, so the GDD §26.7 strategy check, the call
 * scenarios with "What now?" extras, the R16 engage cap on start_transfer from a call (CR-31(b)), the drill
 * for Davide (CR-32) and the boss's merged falls hold for the real YAML. CR-36 (voice label) is not in the
 * engine: its fallback (the voice line as claims[0]) keeps every number in the table (GDD §26.7 row note).
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag } from './helpers.ts';

const DIR = 'content/scenarios/rome';
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
const c = () => ctx({ slot: 6 });
const cont: RunnerEvent = { type: 'continue' };
const wn = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'rome-09-boss-investigation';
const tagBoth = (target: string, beat = 'start'): RunnerEvent[] => [check(target, beat), tag(target, beat)];

/** Interrupt replies by id (genuine small talk; never part of the score). */
const replies: Record<string, string> = {
  davide_exam_done: 'reply_pizza',
  noor_rome_hot: 'reply_noor_hot',
  teo_cannoli: 'reply_teo_cannoli',
  bruna_home_from_choir: 'reply_buonanotte',
};

/** Drive consequences, interrupts and (optionally) damage control to the end. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState, picks?: string[]): RunnerState {
  let st = st0;
  for (let i = 0; i < 12 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') {
      const pending = st.interrupts.find((x) => x.arrived && !x.actionId && !x.skipped);
      if (!pending) break;
      st = step(s, cx, st, { type: 'interrupt_act', interruptId: pending.id, actionId: replies[pending.id] ?? '' });
    } else if (st.phase === 'damage_control' && picks) st = step(s, cx, st, recover(picks));
    else break;
  }
  return st;
}
const points = (id: string, events: RunnerEvent[], picks?: string[]) => {
  const s = get(id);
  const cx = ctx({ slot: 6, timerMode: 'off' });
  return resultOf(s, B, finish(s, cx, run(s, cx, events), picks));
};

const BOSS_IDEAL: RunnerEvent[] = [
  ...tagBoth('claim#2'),
  ...tagBoth('request'),
  act('hang_up_police_boss'),
  wn('call_card_after_police_boss'),
  cont,
  ...tagBoth('claim#2', 'bank_call'),
  ...tagBoth('request', 'bank_call'),
  act('hang_up_bank_boss'),
  wn('call_card_after_bank_boss'),
  cont,
  ...tagBoth('link', 'police_text'),
  ...tagBoth('request', 'police_text'),
  act('open_app_police_text'),
];

/** Ideal play per standard scenario (GDD §26.7 row 1). */
const IDEAL: Record<string, RunnerEvent[]> = {
  'rome-01-breakfast-till-ten': [act('reply_on_my_way')],
  'rome-02-teo-calls-you': [act('tell_teo_fine')],
  'rome-03-police-card-call': [...tagBoth('claim#2'), ...tagBoth('request'), act('hang_up_police_card'), wn('call_police_yourself_card')],
  'rome-04-grandpa-new-number': [...tagBoth('caller_id'), ...tagBoth('claim#2'), ...tagBoth('request'), act('hang_up_grandpa'), wn('call_teo_saved_grandpa')],
  'rome-05-laundry': [act('pay_bruna_app'), act('send_bruna_eight')],
  'rome-07-police-text': [...tagBoth('phone_number'), ...tagBoth('request'), act('call_police_yourself_text')],
  'rome-08-new-number-davide': [...tagBoth('sender.detail'), ...tagBoth('request'), act('call_davide_saved')],
};
const sumIdeal = (skip: string[] = []) =>
  Object.entries(IDEAL)
    .filter(([id]) => !skip.includes(id))
    .reduce((n, [id, ev]) => n + points(id, ev).points, 0);

describe('Rome: chapter totals (GDD §26.7)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 15, max 174, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(15);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(174);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'rome-01-breakfast-till-ten': [0, 15],
      'rome-02-teo-calls-you': [0, 15],
      'rome-03-police-card-call': [2, 19],
      'rome-04-grandpa-new-number': [3, 21],
      'rome-05-laundry': [0, 15],
      'rome-07-police-text': [2, 19],
      'rome-08-new-number-davide': [2, 19],
      [BOSS]: [6, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('"112" appears only on the player\'s side: "Call the police yourself" outcomes, never in a message', () => {
    for (const s of all.values()) {
      const messages = JSON.stringify([s.message, s.banner, s.beats.map((b) => [b.message, b.banner]), s.interrupts.map((i) => i.message), s.pressure]);
      expect([s.id, messages.includes('112')]).toEqual([s.id, false]);
    }
  });

  it('the RM5 spoofing line appears in 6-3 only', () => {
    const withLine = [...all.values()].filter((s) => JSON.stringify(s).includes('phone companies must block')).map((s) => s.id);
    expect(withLine).toEqual(['rome-03-police-card-call']);
  });
});

describe('Rome standard scenarios', () => {
  it('6-1 off-focus genuine: replying ★★★; calling Davide also ★★★; reporting costs 5', () => {
    const s = get('rome-01-breakfast-till-ten');
    expect(play(s, c(), [act('reply_on_my_way')]).r.stars).toBe(3);
    expect(play(s, c(), [act('call_davide_check')]).r.stars).toBe(3);
    expect(play(s, c(), [act('report_breakfast')]).r.points).toBe(-5);
  });

  it('6-2 Teo\'s real call: answering or calling his saved number back are both ★★★', () => {
    const s = get('rome-02-teo-calls-you');
    expect(play(s, c(), [act('tell_teo_fine')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_teo'), wn('call_teo_saved_after')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_teo'), wn('report')]).r.points).toBe(-5);
  });

  it('6-3: reading out the card falls (6 options); "Call back this number" caps the call at ★★', () => {
    const s = get('rome-03-police-card-call');
    const fell = play(s, c(), [act('read_out_card')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
    expect(play(s, c(), [act('hang_up_police_card'), wn('call_bank_card_number_police')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_police_card'), wn('call_back_this_number_police'), wn('call_police_yourself_card')]).r.stars).toBe(2);
  });

  it('6-4 (R16): following the caller into the app caps every way out at ★★; Confirm falls', () => {
    const s = get('rome-04-grandpa-new-number');
    expect(s.beats[0]?.message.payee?.name_check).toBe('match');
    expect(play(s, c(), [act('send_owner_app'), act('hang_up_call_teo_transfer')]).r.stars).toBe(2);
    expect(play(s, c(), [act('send_owner_app'), act('hang_up_cancel_owner')]).r.stars).toBe(2);
    const fell = play(s, c(), [act('send_owner_app'), act('send_480')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options.map((o) => o.step)).toContain('pay_second_request');
  });

  it('6-5 genuine €8: paying ★★★, asking Bruna ★★★, cancelling the agreed payment 0', () => {
    const s = get('rome-05-laundry');
    expect(play(s, c(), [act('pay_bruna_app'), act('send_bruna_eight')]).r.stars).toBe(3);
    expect(play(s, c(), [act('ask_bruna_desk')]).r.stars).toBe(3);
    expect(play(s, c(), [act('pay_bruna_app'), act('cancel_laundry_transfer')]).r.stars).toBe(0);
  });

  it('6-7: calling the number in the text is engage (★★ after hanging up and calling the card); Approve falls', () => {
    const s = get('rome-07-police-text');
    expect(play(s, c(), [act('call_officer_number'), act('hang_up_officer'), wn('call_card_after_officer')]).r.stars).toBe(2);
    const fell = play(s, c(), [act('call_officer_number'), act('tap_approve')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options.map((o) => o.step)).toContain('call_back_text_number');
  });

  it('6-8: "doesn\'t match" with no holder; cancelling and calling Davide\'s saved number ★★★', () => {
    const s = get('rome-08-new-number-davide');
    const p = s.beats[0]?.message.payee;
    expect(p?.name_check).toBe('mismatch');
    expect(p?.holder).toBeUndefined();
    expect(play(s, c(), [act('pay_gas_app'), act('cancel_call_davide')]).r.stars).toBe(3);
  });
});

describe('Rome drill 6-6 (CR-32)', () => {
  it('damage control is for Davide, 6 options with 2 harmful', () => {
    const s = get('rome-06-davide-paid');
    const st = run(s, c(), [act('go_down_help_davide')]);
    const st2 = st.phase === 'consequence' ? step(s, c(), st, cont) : st;
    expect(st2.phase).toBe('damage_control');
    expect(st2.recovery?.options).toHaveLength(6);
    expect(s.outcomes.helping_davide?.recovery_for).toBe('davide');
  });
});

describe('Rome boss (call → call + banking → sms, covered_by)', () => {
  const s = get(BOSS);

  it('ideal: verify every beat, all 6 red flags tagged: 51 of 51', () => {
    const cx = c();
    const st = finish(s, cx, run(s, cx, BOSS_IDEAL));
    expect(st.phase).toBe('done');
    const r = resultOf(s, B, st);
    expect(r.points).toBe(51);
    expect(r.correctTags).toBe(6);
  });

  it('a check on beat 1 covers dismissing beats 2 and 3 ("already checked")', () => {
    const cx = c();
    const st = finish(s, cx, run(s, cx, [act('hang_up_police_boss'), wn('call_card_after_police_boss'), cont, act('hang_up_bank_boss'), wn('done'), cont, act('delete_police_text_boss')]));
    expect(resultOf(s, B, st).beats.map((b) => b.stars)).toEqual([3, 3, 3]);
  });

  it('falls on beats 1 and 2 merge into one six-step list, set rome_bank_called, and skip Bruna\'s goodnight', () => {
    const cx = c();
    let st = run(s, cx, [act('read_out_code_boss'), cont, act('follow_steps_tutela'), act('send_tutela'), cont, act('open_app_police_text')]);
    while (st.phase === 'consequence') st = step(s, cx, st, cont);
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    st = finish(s, cx, step(s, cx, st, recover(['call_bank_stop_payment', 'tell_trusted_adult', 'change_password_sign_out'])));
    const r = resultOf(s, B, st);
    expect(r.flagsSet).toContain('rome_bank_called');
    expect(st.interrupts.find((i) => i.id === 'bruna_home_from_choir')?.skipped).toBe(true);
  });
});

describe('Rome strategy rows (GDD §26.7)', () => {
  it('row 1 ideal: 174 of 174', () => {
    expect(sumIdeal() + points(BOSS, BOSS_IDEAL).points).toBe(174);
  });

  it('row 11 "trust an official-looking caller": 141, spotted net 9', () => {
    const p63 = points('rome-03-police-card-call', [act('read_out_card')], ['block_card_in_bank_app', 'call_bank_known_number', 'keep_call_evidence']);
    expect(p63.points).toBe(9);
    const boss = points(
      BOSS,
      [act('read_out_code_boss'), cont, act('follow_steps_tutela'), act('send_tutela'), cont, ...tagBoth('link', 'police_text'), ...tagBoth('request', 'police_text'), act('open_app_police_text')],
      ['call_bank_stop_payment', 'tell_trusted_adult', 'change_password_sign_out'],
    );
    expect(boss.points).toBe(28);
    expect(sumIdeal(['rome-03-police-card-call']) + p63.points + boss.points).toBe(141);
  });

  it('row 12 "a familiar voice is enough": 162', () => {
    const p64 = points('rome-04-grandpa-new-number', [act('send_owner_app'), act('send_480')], ['call_bank_stop_payment', 'tell_trusted_adult', 'tell_real_person']);
    expect(p64.points).toBe(9);
    expect(sumIdeal(['rome-04-grandpa-new-number']) + p64.points + points(BOSS, BOSS_IDEAL).points).toBe(162);
  });

  it('row 6c "always tag the request + always verify": 164, net spotted 4 (one short of silver)', () => {
    const verify: Record<string, RunnerEvent[]> = {
      'rome-01-breakfast-till-ten': [act('call_davide_check')],
      'rome-02-teo-calls-you': [act('hang_up_teo'), wn('call_teo_saved_after')],
      'rome-03-police-card-call': [act('hang_up_police_card'), wn('call_police_yourself_card')],
      'rome-04-grandpa-new-number': [act('hang_up_grandpa'), wn('call_teo_saved_grandpa')],
      'rome-05-laundry': [act('ask_bruna_desk')],
      'rome-07-police-text': [act('call_police_yourself_text')],
      'rome-08-new-number-davide': [act('call_davide_saved')],
    };
    let total = 0;
    let net = 0;
    for (const [id, ev] of Object.entries(verify)) {
      const r = points(id, [...tagBoth('request'), ...ev]);
      total += r.points;
      net += r.correctTags - r.wrongTags;
    }
    const boss = points(BOSS, [
      ...tagBoth('request'),
      act('hang_up_police_boss'),
      wn('call_card_after_police_boss'),
      cont,
      ...tagBoth('request', 'bank_call'),
      act('hang_up_bank_boss'),
      wn('call_card_after_bank_boss'),
      cont,
      ...tagBoth('request', 'police_text'),
      act('open_app_police_text'),
    ]);
    total += boss.points;
    net += boss.correctTags - boss.wrongTags;
    expect(total).toBe(164);
    expect(net).toBe(4);
  });
});
