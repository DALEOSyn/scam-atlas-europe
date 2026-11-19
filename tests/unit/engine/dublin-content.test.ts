/**
 * Dublin (T-3.10): the authored chapter played through the runner, so the GDD §28.7 strategy check (R 15,
 * max 172, boss 51), the genuine twins, the Fairmeasure register cards (CR-38) and the boss hold for the
 * real YAML.
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

const DIR = 'content/scenarios/dublin';
const chapter = chapterSchema.parse(readYaml('content/chapters/dublin.yaml'));
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
const c = () => ctx({ slot: 8 });
const T = () => ctx({ slot: 8, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const wn = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'dublin-09-boss-clone-bond';
/** A perfect first-three pick per fall (stop first), by scenario. */
const DC: Record<string, string[]> = {
  'dublin-02-presenter-ad': ['block_adviser_number', 'report_ad_on_platform', 'report_firm_to_regulator'],
  'dublin-03-recovery-offer': ['block_card_in_bank_app', 'call_bank_known_number', 'tell_trusted_adult'],
  'dublin-06-rating-tasks': ['stop_paying', 'call_bank_known_number', 'tell_trusted_adult'],
  'dublin-07-adviser-call': ['block_card_in_bank_app', 'call_bank_known_number', 'tell_trusted_adult'],
  [BOSS]: ['call_bank_known_number', 'tell_trusted_adult', 'report_firm_to_regulator'],
};
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** Play to the end: Continue through consequences, answer interrupts kindly, perfect damage control. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState): RunnerState {
  let st = st0;
  for (let i = 0; i < 10 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') st = step(s, cx, st, { type: 'interrupt_act', interruptId: s.interrupts[0]?.id ?? '', actionId: s.interrupts[0]?.actions[0]?.id ?? '' });
    else if (st.phase === 'damage_control') st = step(s, cx, st, recover(DC[s.id] ?? []));
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
  'dublin-01-tea-money': [act('pay_roisin_app'), act('send_roisin_ten')],
  'dublin-02-presenter-ad': [...tagAll('start', 'image', 'claim'), act('check_quorvex_register')],
  'dublin-03-recovery-offer': [...tagAll('start', 'claim', 'request'), act('check_backhaven_register')],
  'dublin-05-ellisfen-sheet': [act('reply_thanks_read')],
  'dublin-06-rating-tasks': [...tagAll('start', 'sender.detail', 'claim'), act('ask_coordinator')],
  'dublin-07-adviser-call': [...tagAll('start', 'claim#2', 'request'), act('hang_up_check_quorvex')],
  'dublin-08-regulator-reply': [act('read_and_file')],
  [BOSS]: [
    ...tagAll('start', 'sender.detail', 'link', 'claim'),
    act('check_register_ring_b1'),
    cont,
    ...tagAll('bond_call', 'claim#2', 'request'),
    act('ring_register_number_b2'),
    cont,
    ...tagAll('protection_email', 'sender.detail', 'request'),
    act('open_fairmeasure_b3'),
  ],
};
const summary = (over: Record<string, RunnerEvent[]>) => {
  const rs = Object.entries({ ...ideal, ...over }).map(([id, ev]) => rec(id, ev));
  return summarise(B, chapter, rs, true);
};

describe('Dublin: chapter totals (GDD §28.7)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 15, max 172, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(15);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(172);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'dublin-01-tea-money': [0, 15],
      'dublin-02-presenter-ad': [2, 19],
      'dublin-03-recovery-offer': [2, 19],
      'dublin-05-ellisfen-sheet': [0, 15],
      'dublin-06-rating-tasks': [2, 19],
      'dublin-07-adviser-call': [2, 19],
      'dublin-08-regulator-reply': [0, 15],
      [BOSS]: [7, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('the arc beat is the first beat after the intro (GDD §28.11 Q1), the stop point follows 8-3', () => {
    expect(chapter.scenario_order.am[0]).toBe('dublin-arc-alex-08');
    expect(chapter.scenario_order.am.at(-1)).toBe('dublin-03-recovery-offer');
    expect(chapter.scenario_order.pm[0]).toBe('dublin-04-declan-two-ads');
    expect(get('dublin-arc-alex-08').arc_slot).toBe(8);
  });

  it('Glimmerfund appears only in the arc beat (§28.5)', () => {
    for (const s of all.values()) {
      if (s.role === 'arc') continue;
      expect([s.id, /glimmerfund/i.test(JSON.stringify(s))]).toEqual([s.id, false]);
    }
  });

  it('no refund promises: refunds are never "will"', () => {
    for (const s of all.values()) expect([s.id, /\bwill (?:refund|get (?:it|your money) back)/i.test(JSON.stringify(s))]).toEqual([s.id, false]);
  });
});

describe('Dublin strategy rows (GDD §28.7)', () => {
  it('row 1 ideal: 172 points, 15 spotted, gold', () => {
    const r = summary({});
    expect(r.points).toBe(172);
    expect(r.spotted).toBe(15);
    expect(r.redFlags).toBe(15);
    expect(r.stamp).toBe('gold');
  });

  it('row 2: checking 8-5 and 8-8 (in focus) keeps 172 and gold', () => {
    const r = summary({ 'dublin-05-ellisfen-sheet': [act('check_ellisfen_again')], 'dublin-08-regulator-reply': [act('open_fairmeasure_site')] });
    expect(r.points).toBe(172);
    expect(r.offFocusDoubleChecks).toBe(0);
    expect(r.stamp).toBe('gold');
  });

  it('row 3 curious ideal: opening 8-2\'s sign-up page, then checking the register: 167, gold', () => {
    const r = summary({ 'dublin-02-presenter-ad': [...tagAll('start', 'image', 'claim'), act('open_signup_page'), act('close_check_register')] });
    expect(r.points).toBe(167);
    expect(r.stamp).toBe('gold');
  });

  it('row 4 careful reporter: 137 (79.7%), silver', () => {
    const r = summary({
      'dublin-02-presenter-ad': [...tagAll('start', 'image', 'claim'), act('report_orla_ad')],
      'dublin-03-recovery-offer': [...tagAll('start', 'claim', 'request'), act('report_backhaven')],
      'dublin-06-rating-tasks': [...tagAll('start', 'sender.detail', 'claim'), act('block_aisling')],
      'dublin-07-adviser-call': [...tagAll('start', 'claim#2', 'request'), act('hang_up_ciaran'), wn('report')],
      [BOSS]: [
        ...tagAll('start', 'sender.detail', 'link', 'claim'),
        act('report_b1'),
        cont,
        ...tagAll('bond_call', 'claim#2', 'request'),
        act('report_b2'),
        cont,
        ...tagAll('protection_email', 'sender.detail', 'request'),
        act('report_b3'),
      ],
    });
    expect(r.points).toBe(137);
    expect(r.spotted).toBe(15);
    expect(r.stamp).toBe('silver');
  });

  it('row 5: reporting Róisín\'s real request (8-1) costs 20 points: 152, silver', () => {
    const r = summary({ 'dublin-01-tea-money': [act('report_tea')] });
    expect(r.points).toBe(152);
    expect(r.genuineReported).toBe(1);
    expect(r.stamp).toBe('silver');
  });

  it('row 6c always tag the request + always verify: 154, spotted −2, bronze', () => {
    const r = summary({
      'dublin-01-tea-money': [...tagAll('start', 'request'), act('ask_roisin_hall')],
      'dublin-02-presenter-ad': [...tagAll('start', 'request'), act('check_quorvex_register')],
      'dublin-03-recovery-offer': [...tagAll('start', 'request'), act('check_backhaven_register')],
      'dublin-05-ellisfen-sheet': [...tagAll('start', 'request'), act('check_ellisfen_again')],
      'dublin-06-rating-tasks': [...tagAll('start', 'request'), act('ask_coordinator')],
      'dublin-07-adviser-call': [...tagAll('start', 'request'), act('hang_up_check_quorvex')],
      'dublin-08-regulator-reply': [...tagAll('start', 'request'), act('open_fairmeasure_site')],
      [BOSS]: [
        ...tagAll('start', 'request'),
        act('check_register_ring_b1'),
        cont,
        ...tagAll('bond_call', 'request'),
        act('ring_register_number_b2'),
        cont,
        ...tagAll('protection_email', 'request'),
        act('open_fairmeasure_b3'),
      ],
    });
    expect(r.points).toBe(154);
    expect(r.spotted).toBe(-2);
    expect(r.stamp).toBe('bronze');
  });

  it('row 7 blind always-verify: 150, bronze', () => {
    const r = summary({
      'dublin-01-tea-money': [act('ask_roisin_hall')],
      'dublin-02-presenter-ad': [act('check_quorvex_register')],
      'dublin-03-recovery-offer': [act('check_backhaven_register')],
      'dublin-05-ellisfen-sheet': [act('check_ellisfen_again')],
      'dublin-06-rating-tasks': [act('ask_coordinator')],
      'dublin-07-adviser-call': [act('hang_up_check_quorvex')],
      'dublin-08-regulator-reply': [act('open_fairmeasure_site')],
      [BOSS]: [act('check_register_ring_b1'), cont, act('ring_register_number_b2'), cont, act('open_fairmeasure_b3')],
    });
    expect(r.points).toBe(150);
    expect(r.stamp).toBe('bronze');
  });

  it('row 8 blind always-report: 55; row 9 blind always-dismiss: 90', () => {
    const report = summary({
      'dublin-01-tea-money': [act('report_tea')],
      'dublin-02-presenter-ad': [act('report_orla_ad')],
      'dublin-03-recovery-offer': [act('report_backhaven')],
      'dublin-05-ellisfen-sheet': [act('report_ellisfen_sheet')],
      'dublin-06-rating-tasks': [act('block_aisling')],
      'dublin-07-adviser-call': [act('hang_up_ciaran'), wn('report')],
      'dublin-08-regulator-reply': [act('report_fairmeasure_reply')],
      [BOSS]: [act('report_b1'), cont, act('report_b2'), cont, act('report_b3')],
    });
    expect(report.points).toBe(55);
    expect(report.stamp).toBe('bronze');
    const dismiss = summary({
      'dublin-01-tea-money': [act('ignore_tea')],
      'dublin-02-presenter-ad': [act('scroll_past_orla')],
      'dublin-03-recovery-offer': [act('delete_backhaven')],
      'dublin-05-ellisfen-sheet': [act('delete_ellisfen_sheet')],
      'dublin-06-rating-tasks': [act('ignore_aisling')],
      'dublin-07-adviser-call': [act('hang_up_ciaran'), wn('done')],
      'dublin-08-regulator-reply': [act('delete_fairmeasure_reply')],
      [BOSS]: [act('delete_b1'), cont, act('hang_up_b2'), wn('done'), cont, act('delete_b3')],
    });
    expect(dismiss.points).toBe(90);
    expect(dismiss.stamp).toBe('bronze');
  });

  it('row 11 "it\'s on the register, so it\'s fine": falling for the clone (beats 1–2) stays silver at 149', () => {
    const r = summary({
      [BOSS]: [
        act('apply_through_link'),
        cont,
        act('transfer_in_larchwick'),
        act('send_two_thousand'),
        cont,
        ...tagAll('protection_email', 'sender.detail', 'request'),
        act('open_fairmeasure_b3'),
      ],
    });
    expect(r.points).toBe(149);
    expect(r.spotted).toBe(10);
    expect(r.stamp).toBe('silver');
  });

  it('row 12 "pays to get money back": falling for 8-3 and boss beat 3, well recovered: 156, gold (input to R15)', () => {
    const r = summary({
      'dublin-03-recovery-offer': [act('open_case_page'), act('pay_retainer')],
      [BOSS]: [
        ...tagAll('start', 'sender.detail', 'link', 'claim'),
        act('check_register_ring_b1'),
        cont,
        ...tagAll('bond_call', 'claim#2', 'request'),
        act('ring_register_number_b2'),
        cont,
        act('pay_ninety_five'),
      ],
    });
    expect(r.points).toBe(156);
    expect(r.spotted).toBe(11);
    expect(r.stamp).toBe('gold');
  });
});

describe('Dublin: the register (CR-38) and the calls', () => {
  it('every check_official_list on a firm shows the register card: Quorvex and Backhaven not listed, Ellisfen authorised', () => {
    const cards = [...all.values()].flatMap((s) => Object.values(s.outcomes).flatMap((o) => (o.register ? [o.register] : [])));
    expect(cards.filter((x) => x.firm === 'Quorvex').every((x) => x.result === 'not_listed')).toBe(true);
    expect(cards.find((x) => x.firm === 'Backhaven Recovery')?.result).toBe('not_listed');
    const ellisfen = cards.filter((x) => x.firm === 'Ellisfen Invest');
    expect(ellisfen.length).toBe(2);
    for (const x of ellisfen) expect(x).toEqual({ firm: 'Ellisfen Invest', result: 'authorised', address: 'ellisfen.example', phone: '+353 1 ••• ••60' });
  });

  it('8-7: calling the bank from "What now?" is ★★★; calling back the number first caps at ★★', () => {
    const s = get('dublin-07-adviser-call');
    expect(play(s, c(), [act('hang_up_ciaran'), wn('call_card_after_ciaran')]).r.stars).toBe(3);
    expect(play(s, c(), [act('hang_up_ciaran'), wn('call_back_ciaran_number'), wn('call_card_after_ciaran')]).r.stars).toBe(2);
  });

  it('boss beat 2 (R16): following the caller into the Larchwick app caps the beat at ★★, even when cancelled', () => {
    const s = get(BOSS);
    const st = finish(s, T(), run(s, T(), [act('delete_b1'), cont, act('transfer_in_larchwick'), act('cancel_ring_register'), cont, act('delete_b3')]));
    const r = resultOf(s, B, st);
    // Beat 3 deleted after ringing the register on beat 2: "already checked" (covered_by) scores it as verify.
    expect(r.beats.map((b) => b.stars)).toEqual([2, 2, 3]);
  });

  it('boss: the payee check does not match, with no holder shown', () => {
    const p = get(BOSS).beats.find((b) => b.id === 'bond_transfer')?.message.payee;
    expect(p?.name_check).toBe('mismatch');
    expect(p?.holder).toBeUndefined();
  });

  it('every boss fall outcome sets dublin_bank_called (story variant)', () => {
    const s = get(BOSS);
    const falls = Object.values(s.outcomes).filter((o) => o.recovery && o.recovery.length > 0);
    expect(falls.length).toBe(3);
    for (const o of falls) expect(o.sets_flags ?? []).toContain('dublin_bank_called');
  });

  it('8-5: timer expiry scores as the "Delete it" option (R21: never higher)', () => {
    const s = get('dublin-05-ellisfen-sheet');
    const dismissed = play(s, c(), [act('delete_ellisfen_sheet')]).r.points;
    let st = run(s, c(), [tick(41), tick(21)]);
    for (let i = 0; i < 4 && st.phase !== 'done'; i++) st = st.phase === 'interrupt' ? step(s, c(), st, { type: 'interrupt_act', interruptId: 'roisin_biscuit_investment', actionId: 'reply_biscuit_returns' }) : step(s, c(), st, cont);
    expect(resultOf(s, B, st).points).toBe(dismissed);
  });
});

describe('Dublin: damage control (GDD §9; tell_trusted_adult in every personal-money fall)', () => {
  // 8-2's fall gives a phone number, not money: its six steps follow GDD §28.4 as written.
  const falls = (s: Scenario) =>
    [...s.actions, ...s.beats.flatMap((b) => b.actions)].filter((a) => a.outcome && s.outcomes[a.outcome]?.recovery).map((a) => ({ kind: a.kind, outcome: a.outcome as string }));

  it('lists every fall', () => {
    const list = [...all.values()].flatMap((s) => falls(s).map((f) => `${s.id}:${f.outcome}`));
    expect(list.sort()).toEqual(
      [
        'dublin-02-presenter-ad:adviser_keeps_calling',
        'dublin-03-recovery-offer:retainer_paid',
        'dublin-06-rating-tasks:topped_up_forty',
        'dublin-07-adviser-call:card_read_to_ciaran',
        `${BOSS}:card_typed_application`,
        `${BOSS}:bond_transfer_sent`,
        `${BOSS}:verification_fee_paid`,
      ].sort(),
    );
  });

  it('each offers at most six steps with exactly two harmful; every money fall has tell_trusted_adult as a stop step', () => {
    for (const s of all.values()) {
      for (const f of falls(s)) {
        const list = s.outcomes[f.outcome]?.recovery ?? [];
        expect([s.id, f.outcome, list.filter((r) => r.category === 'harmful').length]).toEqual([s.id, f.outcome, 2]);
        expect(list.length).toBeLessThanOrEqual(6);
        if (f.outcome !== 'adviser_keeps_calling') expect([s.id, f.outcome, list.find((r) => r.step === 'tell_trusted_adult')?.category]).toEqual([s.id, f.outcome, 'stop']);
      }
    }
  });
});
