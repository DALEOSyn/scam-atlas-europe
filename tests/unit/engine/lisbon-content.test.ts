/**
 * Lisbon (T-3.9): the authored chapter played through the runner, so the GDD §27.7 strategy check (CR-37
 * fallback: R 13, max 168), the genuine twins, the boss and the QR routes hold for the real YAML.
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
const DC_PARKING = ['block_card_in_bank_app', 'call_bank_known_number', 'report_sticker'];
const DC_RENTAL = ['block_card_in_bank_app', 'call_bank_known_number', 'report_listing_or_host'];
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
  'lisbon-02-meter-sticker': [...tagAll('start', 'qr.destination'), act('open_zonelet_sticker')],
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

describe('Lisbon: chapter totals (GDD §27.7, CR-37 fallback)', () => {
  const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

  it('8 scored (3 genuine), R = 13, max 168, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(13);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(168);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'lisbon-01-graca-studio': [0, 15],
      'lisbon-02-meter-sticker': [1, 17],
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
  it('row 1 ideal: 168 points, 13 spotted, gold', () => {
    const r = summary({});
    expect(r.points).toBe(168);
    expect(r.stamp).toBe('gold');
  });

  it('row 2: asking the real host of 7-1 for a transfer costs two stars (★, 5 points) and keeps gold', () => {
    const r = play(get('lisbon-01-graca-studio'), T(), [act('ask_host_transfer')]).r;
    expect(r.stars).toBe(1);
    expect(r.points).toBe(5);
    expect(summary({ 'lisbon-01-graca-studio': [act('ask_host_transfer')] }).points).toBe(158);
    expect(summary({ 'lisbon-01-graca-studio': [act('ask_host_transfer')] }).stamp).toBe('gold');
  });

  it('row 11: falling for 7-6 (the in-app host) with perfect damage control still reaches gold (input to R15)', () => {
    const s = get('lisbon-06-host-partner-page');
    const fell = play(s, c(), [act('open_partner_page'), act('pay_securepay')]);
    expect(fell.st.phase).toBe('damage_control');
    expect(fell.st.recovery?.options).toHaveLength(6);
    expect(summary({ 'lisbon-06-host-partner-page': [act('open_partner_page'), act('pay_securepay')] }).stamp).toBe('gold');
  });

  it('row 12: falling for both QR codes (7-2, 7-7): 152 of 168 (90.5%) with the CR-37 fallback', () => {
    const r = summary({
      'lisbon-02-meter-sticker': [act('scan_sticker'), act('pay_meter_page')],
      'lisbon-07-parking-slip': [act('scan_slip'), act('pay_slip')],
    });
    expect(r.points).toBe(152);
    // GDD §27.7 has silver at 152 of 170 (89.4%); without qr.mount the maximum is 168, so the row
    // rounds up to gold. Recorded for the balancing pass (R15); flip back to 'silver' when CR-37 lands.
    expect(r.stamp).toBe('gold');
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
  it('beat 2: starting the transfer opens the unscored banking step; confirming falls with six options', () => {
    const s = get(BOSS);
    let st = run(s, T(), [act('open_roostwell_b1'), cont, act('pay_in_larchwick_b2'), act('confirm_send_b2'), cont, act('open_roostwell_b3')]);
    for (let i = 0; i < 6 && st.phase !== 'damage_control' && st.phase !== 'done'; i++) {
      st = st.phase === 'interrupt' ? step(s, T(), st, { type: 'interrupt_act', interruptId: 'leonor_see_you', actionId: 'reply_leonor_obrigado' }) : step(s, T(), st, cont);
    }
    expect(st.phase).toBe('damage_control');
    expect(st.recovery?.options).toHaveLength(6);
  });

  it('every boss fall outcome sets lisbon_acted_fast (story variant L-M1)', () => {
    const s = get(BOSS);
    const falls = Object.values(s.outcomes).filter((o) => o.recovery && o.recovery.length > 0);
    expect(falls.length).toBe(3);
    for (const o of falls) expect(o.sets_flags ?? []).toContain('lisbon_acted_fast');
  });
});
