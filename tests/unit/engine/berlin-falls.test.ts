/**
 * CR-48 (ruling R24, GDD §7.3, docs/BALANCE_PASS.md §1): the gold fall rule on the authored Berlin chapter,
 * played through the runner. Gold allows at most one fall, and only a recovered one (its damage control meets
 * LO-16: ≥ 6 points with a `stop` step first). Damage control is exactly 3 picks (+3 helpful, −2 harmful,
 * floor 0), so it scores only 0, 4 or 9.
 *
 * New rows (both gold before R24, silver under it):
 * - "1-7 fall, damage control 4" (2 helpful + 1 harmful): 172 − 19 + 4 = 157 / 172 = 91.3%, spotted 10.
 * - "boss beat 3 fall, damage control 0": 172 − 15 = 157 / 172 = 91.3%, spotted 11.
 * Plus the control row: one recovered fall on 1-7 stays gold (162, 94.2%, GDD §7.3 / BALANCE_PASS §2).
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, run, tag } from './helpers.ts';

const DIR = 'content/scenarios/berlin';
const chapter = chapterSchema.parse(readYaml('content/chapters/berlin.yaml'));
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
const T = (): RunnerContext => ctx({ slot: 1, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const wn = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const BOSS = 'berlin-09-boss-fraud-team';
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** Damage control picks per scenario (default: perfect, `stop` first). */
const PERFECT: Record<string, string[]> = {
  'berlin-07-customs-fee': ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'],
  [BOSS]: ['call_bank_stop_payment', 'block_card_in_bank_app', 'report_to_police_online'],
};

function finish(s: Scenario, cx: RunnerContext, st0: RunnerState, picks: Record<string, string[]>): RunnerState {
  let st = st0;
  for (let i = 0; i < 10 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    else if (st.phase === 'interrupt') st = step(s, cx, st, { type: 'interrupt_act', interruptId: s.interrupts[0]?.id ?? '', actionId: s.interrupts[0]?.actions[0]?.id ?? '' });
    else if (st.phase === 'damage_control') st = step(s, cx, st, { type: 'recovery', picks: picks[s.id] ?? PERFECT[s.id] ?? [] });
    else break;
  }
  return st;
}

function rec(id: string, events: RunnerEvent[], picks: Record<string, string[]>): ScenarioRecord {
  const s = get(id);
  const st = finish(s, T(), run(s, T(), events), picks);
  expect([id, st.phase]).toEqual([id, 'done']);
  return recordOf(resultOf(s, B, st), s.pattern);
}

/** GDD §7.2 row 1 (ideal) per scored Berlin scenario. */
const ideal: Record<string, RunnerEvent[]> = {
  'berlin-01-locker-code': [act('collect_parcel')],
  'berlin-02-briefing-moved': [act('reply_see_you')],
  'berlin-03-address-incomplete': [...tagAll('start', 'sender.detail', 'link'), act('open_trundle_app')],
  'berlin-05-brewnook-code': [...tagAll('start', 'phone_number', 'request'), act('open_brewnook_check')],
  'berlin-06-payment-failed': [act('open_shop_update')],
  'berlin-07-customs-fee': [...tagAll('start', 'sender.detail', 'link'), act('open_trundle_app_fee')],
  'berlin-08-payment-failed-lookalike': [...tagAll('start', 'sender.detail', 'link'), act('open_shop_check')],
  [BOSS]: [
    ...tagAll('start', 'link'),
    act('check_trundle_app_text'),
    cont,
    ...tagAll('customs_invoice', 'sender.detail', 'link'),
    act('check_trundle_app_invoice'),
    cont,
    ...tagAll('fraud_team_call', 'request'),
    act('hang_up_fraud_team'),
    wn('call_back_known'),
  ],
};
const records = (over: Record<string, RunnerEvent[]>, picks: Record<string, string[]> = {}) => Object.entries({ ...ideal, ...over }).map(([id, ev]) => rec(id, ev, picks));
const summary = (over: Record<string, RunnerEvent[]>, picks: Record<string, string[]> = {}) => summarise(B, chapter, records(over, picks), true);

/** 1-7: open the link, pay on the fee page (a fall). */
const FALL_17 = { 'berlin-07-customs-fee': [act('tap_pay_fee'), act('enter_card_pay_fee')] };
/** Boss: beats 1 and 2 handled ideally, beat 3 the code read out (a fall). */
const FALL_B3 = {
  [BOSS]: [...tagAll('start', 'link'), act('check_trundle_app_text'), cont, ...tagAll('customs_invoice', 'sender.detail', 'link'), act('check_trundle_app_invoice'), cont, act('read_out_code')],
};

describe('Berlin under R24 (CR-48): the gold fall rule', () => {
  it('row 1 ideal: 172, no falls, gold', () => {
    const rs = records({});
    expect(rs.every((r) => r.falls === 0 && r.fallsRecovered)).toBe(true);
    expect(summarise(B, chapter, rs, true)).toMatchObject({ points: 172, max: 172, spotted: 12, stamp: 'gold', nextTier: null });
  });

  it('one recovered fall on 1-7 (damage control 9, stop first): 162 (94.2%), spotted 10, stays gold', () => {
    const rs = records(FALL_17);
    expect(rs.find((r) => r.id === 'berlin-07-customs-fee')).toMatchObject({ points: 9, falls: 1, fallsRecovered: true });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 162, spotted: 10, stamp: 'gold' });
    expect(s.rating).toBeCloseTo(94.19, 1);
  });

  it('new row "1-7 fall, damage control 4" (2 helpful + 1 harmful): 157 (91.3%), spotted 10, silver (gold before R24)', () => {
    const picks = { 'berlin-07-customs-fee': ['block_card_in_bank_app', 'report_to_police_online', 'reply_ask_money_back'] };
    const rs = records(FALL_17, picks);
    expect(rs.find((r) => r.id === 'berlin-07-customs-fee')).toMatchObject({ points: 4, falls: 1, fallsRecovered: false });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 157, spotted: 10, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(91.28, 1);
    // Every other gold criterion holds; only the recovery hint is shown.
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls_recovery'], spottedNeeded: 8 });
  });

  it('new row "boss beat 3 fall, damage control 0": 157 (91.3%), spotted 11, silver (gold before R24)', () => {
    const picks = { [BOSS]: ['wait_and_see', 'pay_recovery_service', 'block_card_in_bank_app'] };
    const rs = records(FALL_B3, picks);
    expect(rs.find((r) => r.id === BOSS)).toMatchObject({ points: 36, falls: 1, fallsRecovered: false });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 157, spotted: 11, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(91.28, 1);
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls_recovery'], spottedNeeded: 8 });
  });

  it('boss beat 3 fall with full damage control (stop first) is one recovered fall: gold', () => {
    const rs = records(FALL_B3);
    expect(rs.find((r) => r.id === BOSS)).toMatchObject({ points: 45, falls: 1, fallsRecovered: true });
    expect(summarise(B, chapter, rs, true)).toMatchObject({ points: 166, stamp: 'gold' });
  });

  it('two recovered falls (1-7 and boss beat 3): silver, hint "falls" only', () => {
    const s = summary({ ...FALL_17, ...FALL_B3 });
    expect(s.points).toBe(156);
    expect(s.rating).toBeGreaterThanOrEqual(90);
    expect(s.stamp).toBe('silver');
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls'], spottedNeeded: 8 });
  });

  it('two falls, one not recovered: only the recovery hint is shown', () => {
    const s = summary({ ...FALL_17, ...FALL_B3 }, { [BOSS]: ['wait_and_see', 'pay_recovery_service', 'block_card_in_bank_app'] });
    expect(s.stamp).not.toBe('gold');
    expect(s.nextTier?.needs).toContain('falls_recovery');
    expect(s.nextTier?.needs).not.toContain('falls');
  });

  it('a boss with falls in two scheduled beats counts 2 falls (one damage control decides "recovered")', () => {
    const r = rec(
      BOSS,
      [act('pay_fee_link'), cont, act('pay_invoice_link'), cont, ...tagAll('fraud_team_call', 'request'), act('hang_up_fraud_team'), wn('call_back_known')],
      { [BOSS]: ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'] },
    );
    expect(r).toMatchObject({ falls: 2, fallsRecovered: true });
  });
});
