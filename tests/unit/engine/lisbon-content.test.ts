/**
 * Lisbon (T-3.9, T-3.9f): the authored chapter played through the runner, so the GDD §27.7 strategy check
 * (with CR-37: R 14, max 170), the genuine twins, the boss and the QR routes hold for the real YAML.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag } from './helpers.ts';

const DIR = 'content/scenarios/lisbon';
const chapter = chapterSchema.parse(readYaml('content/chapters/lisbon.yaml'));
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
const c = () => ctx({ slot: 7 });
const T = () => ctx({ slot: 7, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'lisbon-09-boss-thursday-flat';
const DC_PARKING = ['block_card_in_bank_app', 'tell_trusted_adult', 'report_sticker'];
const DC_RENTAL = ['block_card_in_bank_app', 'tell_trusted_adult', 'report_listing_or_host'];
const PARKING = new Set(['lisbon-02-meter-sticker', 'lisbon-07-parking-slip']);
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** Play to the end: Continue through consequences, answer interrupts kindly, perfect damage control. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState): RunnerState {
  let st = st0;
  for (let i = 0; i < 10 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') st = step(s, cx, st, { type: 'interrupt_act', interruptId: s.interrupts[0]?.id ?? '', actionId: s.interrupts[0]?.actions[0]?.id ?? '' });
    else if (st.phase === 'damage_control') st = step(s, cx, st, recover(PARKING.has(s.id) ? DC_PARKING : DC_RENTAL));
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
  'lisbon-01-graca-studio': [act('pay_in_roostwell')],
  'lisbon-02-meter-sticker': [...tagAll('start', 'qr.destination', 'qr.mount'), act('open_zonelet_sticker')],
  'lisbon-03-alfama-ad': [...tagAll('start', 'link', 'claim'), act('search_roostwell_ad')],
  'lisbon-05-printed-meter': [act('scan_printed')],
  'lisbon-06-host-partner-page': [...tagAll('start', 'link', 'request'), act('check_listing_app')],
  'lisbon-07-parking-slip': [...tagAll('start', 'qr.destination'), act('check_zonelet_notice')],
  'lisbon-08-city-tax-email': [act('pay_tax_in_app')],
  [BOSS]: [
    ...tagAll('start', 'sender.detail', 'link', 'request'),
    act('open_roostwell_b1'),
    cont,
    ...tagAll('host_kettle', 'sender.detail', 'request'),
    act('check_booking_b2'),
    cont,
    ...tagAll('final_sms', 'link', 'request'),
    act('open_roostwell_b3'),
  ],
};
const summary = (over: Record<string, RunnerEvent[]>) => {
  const rs = Object.entries({ ...ideal, ...over }).map(([id, ev]) => rec(id, ev));
  return summarise(B, chapter, rs, true);
};

describe('Lisbon: chapter totals (GDD §27.7, with CR-37)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 14, max 170, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(14);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(170);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'lisbon-01-graca-studio': [0, 15],
      'lisbon-02-meter-sticker': [2, 19],
      'lisbon-03-alfama-ad': [2, 19],
      'lisbon-05-printed-meter': [0, 15],
      'lisbon-06-host-partner-page': [2, 19],
      'lisbon-07-parking-slip': [1, 17],
      'lisbon-08-city-tax-email': [0, 15],
      [BOSS]: [7, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('every QR code resolves only to an in-game route (Red Line 3)', () => {
    for (const s of all.values()) {
      for (const m of [s.message, ...s.beats.map((b) => b.message)]) {
        if (m.qr) expect([s.id, m.qr.payload.startsWith('/qr/')]).toEqual([s.id, true]);
      }
    }
  });

  it('no figures or refund promises: refunds are never "will"', () => {
    for (const s of all.values()) expect([s.id, /\bwill (?:refund|get (?:it|your money) back)/i.test(JSON.stringify(s))]).toEqual([s.id, false]);
  });
});

describe('Lisbon strategy rows (GDD §27.7)', () => {
  it('row 1 ideal: 170 points, 14 spotted, gold', () => {
    const r = summary({});
    expect(r.points).toBe(170);
    expect(r.spotted).toBe(14);
    expect(r.redFlags).toBe(14);
    expect(r.stamp).toBe('gold');
  });

  it('row 2: asking the real host of 7-1 for a transfer costs two stars (★, 5 points) and keeps gold', () => {
    const r = play(get('lisbon-01-graca-studio'), T(), [act('ask_host_transfer')]).r;
    expect(r.stars).toBe(1);
    expect(r.points).toBe(5);
    expect(summary({ 'lisbon-01-graca-studio': [act('ask_host_transfer')] }).points).toBe(160);
    expect(summary({ 'lisbon-01-graca-studio': [act('ask_host_transfer')] }).stamp).toBe('gold');
  });

  it('row 11: falling for 7-6 (the in-app host) with perfect damage control still reaches gold (input to R15)', () => {
    const s = get('lisbon-06-host-partner-page');
    const fell = play(s, c(), [act('open_partner_page'), act('pay_securepay')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
    const r11 = summary({ 'lisbon-06-host-partner-page': [act('open_partner_page'), act('pay_securepay')] });
    expect(r11.points).toBe(160);
    expect(r11.spotted).toBe(12);
    expect(r11.stamp).toBe('gold');
  });

  it('row 12: falling for both QR codes (7-2, 7-7): 152 of 170 (89.4%), 11 spotted, silver', () => {
    const r = summary({
      'lisbon-02-meter-sticker': [act('scan_sticker'), act('pay_meter_page')],
      'lisbon-07-parking-slip': [act('scan_slip'), act('pay_slip')],
    });
    expect(r.points).toBe(152);
    expect(r.redFlags).toBe(14);
    expect(r.spotted).toBe(11);
    expect(r.stamp).toBe('silver');
  });

  it('row 6b: always tag the link or QR destination + always verify nets 4, one short of silver (bronze)', () => {
    const r = summary({
      'lisbon-01-graca-studio': [act('read_reviews_first')],
      'lisbon-02-meter-sticker': [...tagAll('start', 'qr.destination'), act('open_zonelet_sticker')],
      'lisbon-03-alfama-ad': [...tagAll('start', 'link'), act('search_roostwell_ad')],
      'lisbon-05-printed-meter': [...tagAll('start', 'qr.destination'), act('open_zonelet_printed')],
      'lisbon-06-host-partner-page': [...tagAll('start', 'link'), act('check_listing_app')],
      'lisbon-07-parking-slip': [...tagAll('start', 'qr.destination'), act('check_zonelet_notice')],
      'lisbon-08-city-tax-email': [...tagAll('start', 'link'), act('check_trips_first')],
      [BOSS]: [...tagAll('start', 'link'), act('open_roostwell_b1'), cont, act('check_booking_b2'), cont, ...tagAll('final_sms', 'link'), act('open_roostwell_b3')],
    });
    expect(r.correctTags).toBe(6);
    expect(r.wrongTags).toBe(2);
    expect(r.spotted).toBe(4);
    expect(r.stamp).toBe('bronze');
  });

  it('row 7 blind always-verify: bronze', () => {
    const r = summary({
      'lisbon-01-graca-studio': [act('read_reviews_first')],
      'lisbon-02-meter-sticker': [act('open_zonelet_sticker')],
      'lisbon-03-alfama-ad': [act('search_roostwell_ad')],
      'lisbon-05-printed-meter': [act('open_zonelet_printed')],
      'lisbon-06-host-partner-page': [act('check_listing_app')],
      'lisbon-07-parking-slip': [act('check_zonelet_notice')],
      'lisbon-08-city-tax-email': [act('check_trips_first')],
      [BOSS]: [act('open_roostwell_b1'), cont, act('check_booking_b2'), cont, act('open_roostwell_b3')],
    });
    expect(r.stamp).toBe('bronze');
  });
});

describe('Lisbon boss: three ways out of the app', () => {
  it('beat 2: starting the transfer opens the unscored banking step; confirming falls with six options, led by asking the bank to stop it', () => {
    const s = get(BOSS);
    let st = run(s, T(), [act('open_roostwell_b1'), cont, act('pay_in_larchwick_b2'), act('confirm_send_b2'), cont, act('open_roostwell_b3')]);
    for (let i = 0; i < 6 && st.phase !== 'damage_control' && st.phase !== 'done'; i++) {
      st = st.phase === 'interrupt' ? step(s, T(), st, { type: 'interrupt_act', interruptId: 'leonor_see_you', actionId: 'reply_leonor_obrigado' }) : step(s, T(), st, cont);
    }
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
    expect(st.recovery?.options.map((o) => o.step)).toContain('tell_trusted_adult');
    expect(st.recovery?.options.map((o) => o.step)).toContain('call_bank_stop_payment');
  });

  it('every boss fall outcome sets lisbon_acted_fast (story variant L-M1)', () => {
    const s = get(BOSS);
    const falls = Object.values(s.outcomes).filter((o) => o.recovery && o.recovery.length > 0);
    expect(falls.length).toBe(3);
    for (const o of falls) expect(o.sets_flags ?? []).toContain('lisbon_acted_fast');
  });
});

describe('Lisbon: R20 and the genuine city-tax email', () => {
  it('R20: Leonor\'s in-app follow-up is on_fall: show and still arrives after a beat-2 fall', () => {
    const s = get(BOSS);
    const leonor = s.interrupts.find((i) => i.id === 'leonor_see_you');
    expect(leonor?.on_fall).toBe('show');
    expect(leonor?.after_beat).toBe('final_sms');
    let st = run(s, T(), [act('open_roostwell_b1'), cont, act('pay_in_larchwick_b2'), act('confirm_send_b2'), cont, act('open_roostwell_b3')]);
    let sawLeonor = false;
    let sawDamageControl = false;
    for (let i = 0; i < 8 && st.phase !== 'done'; i++) {
      if (st.phase === 'interrupt') {
        sawLeonor = true;
        st = step(s, T(), st, { type: 'interrupt_act', interruptId: 'leonor_see_you', actionId: 'reply_leonor_obrigado' });
      } else if (st.phase === 'damage_control') {
        sawDamageControl = true;
        st = step(s, T(), st, recover(['call_bank_stop_payment', 'tell_trusted_adult', 'report_listing_or_host']));
      } else st = step(s, T(), st, cont);
    }
    expect(sawDamageControl).toBe(true);
    expect(st.interrupts.find((i) => i.id === 'leonor_see_you')?.skipped ?? false).toBe(false);
    expect(sawLeonor).toBe(true);
    expect(st.phase).toBe('done');
  });

  it('7-8 carries no payment link (only the booking page) and its correct action is pay_protected', () => {
    const s = get('lisbon-08-city-tax-email');
    const links = (s.message.body ?? '').match(/\b[\w.-]+\.example\/\S*/g) ?? [];
    expect(links).toEqual(['roostwell.example/trips/4471']);
    expect(s.message.request).toBe('pay');
    const target = s.actions.find((a) => a.pressure_target);
    expect(target?.kind).toBe('pay_protected');
    expect(play(s, T(), [act(target?.id ?? '')]).r.stars).toBe(3);
  });
});

describe('Lisbon: every fall on a money action offers tell_trusted_adult (sceptic round 3)', () => {
  const MONEY = new Set(['pay', 'pay_unprotected', 'enter_details', 'start_transfer', 'log_in']);
  // Falls reached from a money action, found by following actions (and beat actions) to their outcomes.
  const moneyFalls = (s: Scenario): string[] => {
    const acts = [...s.actions, ...s.beats.flatMap((b) => b.actions ?? [])];
    return acts.filter((a) => MONEY.has(a.kind) && a.outcome && s.outcomes[a.outcome]?.recovery).map((a) => a.outcome as string);
  };
  it('lists every money fall', () => {
    const all7 = [...all.values()].flatMap((s) => moneyFalls(s).map((o) => `${s.id}:${o}`));
    expect(all7.sort()).toEqual(
      [
        'lisbon-02-meter-sticker:card_taken_meter',
        'lisbon-03-alfama-ad:deposit_taken',
        'lisbon-06-host-partner-page:securepay_taken',
        'lisbon-07-parking-slip:card_taken_slip',
        `${BOSS}:login_typed_b1`,
        `${BOSS}:transfer_sent_b2`,
        `${BOSS}:card_typed_b3`,
      ].sort(),
    );
  });
  // Option (b), coordinator ruling: both harmful steps kept (GDD §9); card falls drop the bank call
  // (blocking the card is the bank action; the call stays in already_clicked), b1 drops two-step (layer 2).
  it('each includes tell_trusted_adult as a stop step, with exactly two harmful steps and at most six', () => {
    for (const s of all.values()) {
      for (const o of moneyFalls(s)) {
        const list = s.outcomes[o]?.recovery ?? [];
        expect([s.id, o, list.find((r) => r.step === 'tell_trusted_adult')?.category]).toEqual([s.id, o, 'stop']);
        expect([s.id, o, list.filter((r) => r.category === 'harmful').length]).toEqual([s.id, o, 2]);
        expect(list.length).toBeLessThanOrEqual(6);
      }
    }
  });
});
