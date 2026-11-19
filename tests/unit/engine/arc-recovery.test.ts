import { describe, expect, it } from 'vitest';
import { applyArcBeat, applyArcEffects, arcEnding, arcPaused, EMPTY_ARC, tellMeNow, type ArcState } from '../../../src/engine/arc.ts';
import { alreadyClickedLine, orderOptions, scoreRecovery, situationOf, type RecoveryOption } from '../../../src/engine/recovery.ts';
import type { ScenarioResult } from '../../../src/engine/result.ts';
import { defaultTimerMode } from '../../../src/engine/timer.ts';
import { B } from './helpers.ts';

const options: RecoveryOption[] = [
  { step: 'block_card_in_bank_app', category: 'stop' },
  { step: 'call_bank_known_number', category: 'secure' },
  { step: 'report_to_police_online', category: 'report' },
  { step: 'reply_ask_money_back', category: 'harmful' },
  { step: 'pay_recovery_service', category: 'harmful' },
];

describe('damage control (GDD §9)', () => {
  it('+3 per helpful pick, max 9; LO-16 needs ≥ 6 and stop first', () => {
    expect(scoreRecovery(B, options, ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'])).toMatchObject({ points: 9, lo16: true, stars: 1 });
    expect(scoreRecovery(B, options, ['call_bank_known_number', 'block_card_in_bank_app', 'report_to_police_online'])).toMatchObject({ points: 9, lo16: false });
  });
  it('−2 per harmful pick, floor 0; only the first 3 distinct picks count', () => {
    expect(scoreRecovery(B, options, ['block_card_in_bank_app', 'reply_ask_money_back', 'call_bank_known_number']).points).toBe(4);
    expect(scoreRecovery(B, options, ['reply_ask_money_back', 'pay_recovery_service', 'block_card_in_bank_app']).points).toBe(0);
    expect(scoreRecovery(B, options, ['block_card_in_bank_app', 'block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online', 'reply_ask_money_back']).points).toBe(9);
    expect(scoreRecovery(B, options, ['not_an_option']).points).toBe(0);
  });
  it('option order is a deterministic permutation seeded by the scenario', () => {
    const a = orderOptions(options, 'home-04');
    expect(orderOptions(options, 'home-04')).toEqual(a);
    expect([...a].sort((x, y) => x.step.localeCompare(y.step))).toEqual([...options].sort((x, y) => x.step.localeCompare(y.step)));
  });
  it('already clicked: the player\'s own situation first (paid > shared code > entered details > clicked)', () => {
    expect(situationOf(['open_link'])).toBe('clicked');
    expect(situationOf(['open_link', 'share_code'])).toBe('shared_code');
    expect(situationOf(['approve_prompt', 'enter_details'])).toBe('shared_code');
    expect(situationOf(['open_link', 'enter_details'])).toBe('entered_details');
    expect(situationOf(['share_code', 'pay'])).toBe('paid');
    expect(situationOf(['open_link', 'enter_details', 'pay'])).toBe('paid');
    expect(situationOf(['verify_in_app'])).toBeUndefined();
    const s = { debrief: { already_clicked: { clicked: 'Close it.', paid: 'Block your card.' } } } as Parameters<typeof alreadyClickedLine>[0];
    expect(alreadyClickedLine(s, 'paid')).toEqual({ situation: 'paid', text: 'Block your card.' });
    expect(alreadyClickedLine(s, 'entered_details')).toEqual({ situation: 'paid', text: 'Block your card.' });
    expect(alreadyClickedLine(s, undefined)).toEqual({ situation: 'clicked', text: 'Close it.' });
  });
  it('timing default: extended when the device asks for reduced motion', () => {
    expect(defaultTimerMode(true)).toBe('extended');
    expect(defaultTimerMode(false)).toBe('standard');
  });
});

describe('Alex arc (GDD §10.3)', () => {
  const res = (points: number, arcEffects: Record<string, number | boolean> = {}) => ({ points, arcEffects }) as ScenarioResult;
  const arc = (over: Partial<ArcState> = {}): ArcState => ({ ...EMPTY_ARC, ...over });

  it('arc effects accumulate numbers and set booleans; points are banked', () => {
    expect(applyArcEffects({ alex_invested: 50 }, { alex_invested: 25, alex_moved_chat: true })).toEqual({ alex_invested: 75, alex_moved_chat: true });
    const a = applyArcBeat(arc(), 5, res(0, { alex_invested: 50 }), 'pay');
    expect(a.vars.alex_invested).toBe(50);
    expect(applyArcBeat(a, 6, res(15), 'ask_someone').points).toBe(15);
  });

  it('closing at slot 1 pauses the arc; a second close ends it (A′)', () => {
    const once = applyArcBeat(arc(), 1, res(10), 'ignore');
    expect(arcPaused(once)).toBe(true);
    const twice = applyArcBeat(once, 1, res(10), 'ignore');
    expect(twice.closed).toBe(true);
    expect(arcEnding(twice)).toBe('A_prime');
  });

  it('ending order: R, then C, then A′, then A (report ≤ 6), else B', () => {
    expect(arcEnding(tellMeNow(arc({ vars: { alex_invested: 50 } })))).toBe('R');
    expect(arcEnding(arc({ vars: { alex_invested: 50 }, closes: 2 }))).toBe('C');
    expect(arcEnding(arc({ closes: 2, reportedAtSlot: 3 }))).toBe('A_prime');
    expect(arcEnding(applyArcBeat(arc(), 4, res(10), 'report'))).toBe('A');
    expect(arcEnding(applyArcBeat(arc(), 7, res(10), 'report'))).toBe('B');
    expect(arcEnding(arc())).toBe('B');
  });

  it('a closed arc ignores further beats', () => {
    const closed = applyArcBeat(arc(), 3, res(10), 'report');
    expect(applyArcBeat(closed, 4, res(10), 'pay')).toBe(closed);
  });
});
