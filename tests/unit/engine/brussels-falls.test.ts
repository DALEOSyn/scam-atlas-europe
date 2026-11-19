/**
 * CR-48 (ruling R24, GDD §30.8 rows 13, 13a, 14): the gold fall rule on the authored Brussels chapter, played
 * through the runner. Max 172, R 14 (silver 5, gold 10). Row 14 (two recovered falls) was gold before R24 and
 * is silver under it; row 13 (one recovered fall) stays gold; row 13a (one unrecovered fall) becomes silver.
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

const DIR = 'content/scenarios/brussels';
const chapter = chapterSchema.parse(readYaml('content/chapters/brussels.yaml'));
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
const T = (): RunnerContext => ctx({ slot: 10, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const BOSS = 'brussels-09-boss-helpdesk';
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** A perfect first-three pick per fall (`stop` first). */
const PERFECT: Record<string, string[]> = {
  'brussels-03-new-bank-details': ['call_bank_stop_payment', 'warn_creditor_known_number', 'keep_transfer_evidence'],
  [BOSS]: ['call_bank_known_number', 'tell_trusted_adult', 'change_password'],
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

/** GDD §30.8 row 1 (ideal) per scored Brussels scenario. */
const ideal: Record<string, RunnerEvent[]> = {
  'brussels-01-print-invoice': [act('call_ruchelune_directory')],
  'brussels-02-poster-parcel': [...tagAll('start', 'link', 'claim'), act('open_trundle_app_posters')],
  'brussels-03-new-bank-details': [...tagAll('start', 'claim', 'request'), act('call_ruchelune_directory_change')],
  'brussels-04-noor-easy-money': [...tagAll('start', 'claim', 'request'), act('advise_tell_mum')],
  'brussels-06-desk-signin': [act('approve_desk_signin')],
  'brussels-07-it-desk-visit': [act('reply_four_is_fine')],
  'brussels-08-mateus-new-number': [...tagAll('start', 'sender.detail', 'request'), act('call_mateus_saved')],
  [BOSS]: [
    ...tagAll('start', 'claim#2', 'request'),
    act('close_tell_it_desk'),
    cont,
    ...tagAll('card_call', 'claim', 'claim#2'),
    act('hang_up_call_card_b2'),
    cont,
    ...tagAll('bank_call', 'claim#2', 'request'),
    act('deny_call_card_b3'),
  ],
};
const records = (over: Record<string, RunnerEvent[]>, picks: Record<string, string[]> = {}) => Object.entries({ ...ideal, ...over }).map(([id, ev]) => rec(id, ev, picks));
const summary = (over: Record<string, RunnerEvent[]>, picks: Record<string, string[]> = {}) => summarise(B, chapter, records(over, picks), true);

/** Boss beats 1 and 2 ideal, beat 3: approve the "bank" sign-in (a fall). */
const FALL_B3 = {
  [BOSS]: [...tagAll('start', 'claim#2', 'request'), act('close_tell_it_desk'), cont, ...tagAll('card_call', 'claim', 'claim#2'), act('hang_up_call_card_b2'), cont, act('approve_switch_off')],
};

describe('Brussels strategy rows under R24 (GDD §30.8; CR-48)', () => {
  it('row 1 ideal: 172, spotted 14, gold', () => {
    expect(summary({})).toMatchObject({ points: 172, max: 172, redFlags: 14, spotted: 14, stamp: 'gold' });
  });

  it('row 13 approves the "bank" sign-in (boss beat 3), well recovered: 166 (96.5%), spotted 12, gold (one recovered fall)', () => {
    const rs = records(FALL_B3);
    expect(rs.find((r) => r.id === BOSS)).toMatchObject({ falls: 1, fallsRecovered: true });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 166, spotted: 12, stamp: 'gold' });
    expect(s.rating).toBeCloseTo(96.51, 1);
  });

  it('row 13a boss beat 3 fall, damage control 0: 157 (91.3%), spotted 12, silver (R24: fall not recovered; gold before)', () => {
    const s = summary(FALL_B3, { [BOSS]: ['approve_again_to_cancel', 'wait_and_see', 'change_password'] });
    expect(s).toMatchObject({ points: 157, spotted: 12, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(91.28, 1);
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls_recovery'], spottedNeeded: 10 });
  });

  it('row 14 two falls (pays 10-3\'s new account, approves boss beat 3), both recovered: 156 (90.7%), spotted 10, silver (R24: two falls; gold before)', () => {
    const rs = records({ ...FALL_B3, 'brussels-03-new-bank-details': [act('pay_new_account'), act('pay_reprint_anyway')] });
    expect(rs.find((r) => r.id === 'brussels-03-new-bank-details')).toMatchObject({ points: 9, falls: 1, fallsRecovered: true });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 156, spotted: 10, stamp: 'silver' });
    expect(s.rating).toBeCloseTo(90.7, 1);
    expect(s.nextTier).toEqual({ tier: 'gold', needs: ['falls'], spottedNeeded: 10 });
  });

  it('row 12 bad advice to Noor (advise_comply) is not a fall: 153, silver by rating only', () => {
    const rs = records({ 'brussels-04-noor-easy-money': [...tagAll('start', 'claim', 'request'), act('advise_probably_fine')] });
    expect(rs.find((r) => r.id === 'brussels-04-noor-easy-money')).toMatchObject({ falls: 0, fallsRecovered: true });
    const s = summarise(B, chapter, rs, true);
    expect(s).toMatchObject({ points: 153, stamp: 'silver' });
    expect(s.nextTier?.needs).toEqual(['rating']);
  });
});
