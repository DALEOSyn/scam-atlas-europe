/**
 * Stockholm (T-3.11): the authored chapter played through the runner, so the GDD §29.7 strategy check (R 13,
 * max 170), the Gatewren prompts (genuine started vs not started), the on-call bar, the chat QR codes, the
 * boss and the damage-control lists hold for the real YAML.
 */
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { maxPointsOfScenario, redFlagCount, resultOf } from '../../../src/engine/result.ts';
import { callBehind, step, type RunnerContext, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { readYaml, ROOT } from '../helpers.ts';
import { act, B, check, ctx, play, run, tag } from './helpers.ts';

const DIR = 'content/scenarios/stockholm';
const chapter = chapterSchema.parse(readYaml('content/chapters/stockholm.yaml'));
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
const T = () => ctx({ slot: 9, timerMode: 'off' });
const cont: RunnerEvent = { type: 'continue' };
const wn = (choice: string): RunnerEvent => ({ type: 'what_now', choice });
const recover = (picks: string[]): RunnerEvent => ({ type: 'recovery', picks });
const BOSS = 'stockholm-09-boss-case-file';
const DC_BANK = ['call_bank_known_number', 'tell_trusted_adult', 'report_to_police'];
const DC_SCREEN = ['go_offline', 'call_bank_known_number', 'change_password'];
const tagAll = (beat: string, ...targets: string[]): RunnerEvent[] => targets.flatMap((t) => [check(t, beat), tag(t, beat)]);

/** Play to the end: Continue through consequences, answer interrupts kindly, perfect damage control. */
function finish(s: Scenario, cx: RunnerContext, st0: RunnerState): RunnerState {
  let st = st0;
  for (let i = 0; i < 12 && st.phase !== 'done'; i++) {
    if (st.phase === 'consequence') st = step(s, cx, st, cont);
    // Every Stockholm scenario has at most one interrupt.
    else if (st.phase === 'interrupt') st = step(s, cx, st, { type: 'interrupt_act', interruptId: s.interrupts[0]?.id ?? '', actionId: s.interrupts[0]?.actions[0]?.id ?? '' });
    else if (st.phase === 'damage_control') st = step(s, cx, st, recover(s.id === 'stockholm-08-support-call' ? DC_SCREEN : DC_BANK));
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
  'stockholm-01-desk-login': [act('approve_desk_login')],
  'stockholm-02-pending-payment': [...tagAll('start', 'phone_number', 'request'), act('open_larchwick_app')],
  'stockholm-03-birgitta-shopping': [act('sign_birgitta_payment')],
  'stockholm-05-loan-call': [...tagAll('start', 'claim#2', 'request'), act('call_card_loan')],
  'stockholm-06-buyer-qr': [...tagAll('start', 'sender.detail', 'claim#2'), act('open_swaploft_listing')],
  'stockholm-07-laptop-login': [act('scan_laptop_code')],
  'stockholm-08-support-call': [...tagAll('start', 'claim#2'), act('open_gatewren_devices')],
  [BOSS]: [
    ...tagAll('start', 'claim#2', 'request'),
    act('call_police_yourself_b1'),
    cont,
    ...tagAll('bank_call', 'claim#2', 'request'),
    act('deny_call_card_b2'),
    cont,
    ...tagAll('case_qr', 'claim', 'claim#2'),
    act('call_police_yourself_b3'),
  ],
};
const verifyAll: Record<string, RunnerEvent[]> = {
  'stockholm-01-desk-login': [act('check_desk_page')],
  'stockholm-02-pending-payment': [act('open_larchwick_app')],
  'stockholm-03-birgitta-shopping': [act('check_payment_in_app')],
  'stockholm-05-loan-call': [act('call_card_loan')],
  'stockholm-06-buyer-qr': [act('open_swaploft_listing')],
  'stockholm-07-laptop-login': [act('charge_use_app')],
  'stockholm-08-support-call': [act('open_gatewren_devices')],
  [BOSS]: [act('call_police_yourself_b1'), cont, act('deny_call_card_b2'), cont, act('call_police_yourself_b3')],
};
const summary = (base: Record<string, RunnerEvent[]>, over: Record<string, RunnerEvent[]> = {}) => {
  const rs = Object.entries({ ...base, ...over }).map(([id, ev]) => rec(id, ev));
  return summarise(B, chapter, rs, true);
};
const scored = () => [...all.values()].filter((s) => s.role === 'standard' || s.role === 'boss');

describe('Stockholm: chapter totals (GDD §29.7)', () => {
  it('8 scored (3 genuine), R = 13, max 170, boss 51', () => {
    expect(scored()).toHaveLength(8);
    expect(scored().filter((s) => !s.is_fraud)).toHaveLength(3);
    expect(scored().reduce((n, s) => n + redFlagCount(s), 0)).toBe(13);
    expect(scored().reduce((n, s) => n + maxPointsOfScenario(B, s), 0)).toBe(170);
    expect(maxPointsOfScenario(B, get(BOSS))).toBe(51);
  });

  it('per-scenario R and max points match the strategy table', () => {
    const expected: Record<string, [number, number]> = {
      'stockholm-01-desk-login': [0, 15],
      'stockholm-02-pending-payment': [2, 19],
      'stockholm-03-birgitta-shopping': [0, 15],
      'stockholm-05-loan-call': [2, 19],
      'stockholm-06-buyer-qr': [2, 19],
      'stockholm-07-laptop-login': [0, 15],
      'stockholm-08-support-call': [1, 17],
      [BOSS]: [6, 51],
    };
    for (const [id, [r, max]] of Object.entries(expected)) {
      expect([id, redFlagCount(get(id))]).toEqual([id, r]);
      expect([id, maxPointsOfScenario(B, get(id))]).toEqual([id, max]);
    }
  });

  it('genuine own checkables: 9-1 5, 9-3 5, 9-7 3 = 13; every Gatewren prompt has a request checkable (row 6c)', () => {
    const own = ['stockholm-01-desk-login', 'stockholm-03-birgitta-shopping', 'stockholm-07-laptop-login'].map((id) => deriveCheckables(get(id).device, get(id).message).length);
    expect(own).toEqual([5, 5, 3]);
    for (const s of all.values()) {
      for (const b of [{ device: s.device, message: s.message }, ...s.beats]) {
        if (b.device === 'auth') expect([s.id, deriveCheckables(b.device, b.message)]).toEqual([s.id, expect.arrayContaining(['request'])]);
      }
    }
  });

  it('every QR code resolves only to an in-game route (Red Line 3) and opens gatewren.example', () => {
    const codes = [...all.values()].flatMap((s) => [s.message, ...s.beats.map((b) => b.message)].filter((m) => m.qr).map((m) => [s.id, m.qr?.payload, m.qr?.destination]));
    expect(codes).toEqual([
      ['stockholm-06-buyer-qr', '/qr/stockholm-buyer-login', 'gatewren.example'],
      [BOSS, '/qr/stockholm-case-file', 'gatewren.example'],
    ]);
  });

  it('police numbers stay on the player side (SK6): never in a caller ID, transcript or scam message', () => {
    for (const s of all.values()) {
      for (const m of [s.message, ...s.beats.map((b) => b.message)]) {
        const scamSide = JSON.stringify({ sender: m.sender, transcript: m.transcript, body: m.body });
        expect([s.id, /\b11[24](?: 14)?\b/.test(scamSide)]).toEqual([s.id, false]);
      }
    }
  });

  it('no refund promises: refunds are never "will"', () => {
    for (const s of all.values()) expect([s.id, /\bwill (?:refund|get (?:it|your money) back)/i.test(JSON.stringify(s))]).toEqual([s.id, false]);
  });
});

describe('Stockholm strategy rows (GDD §29.7)', () => {
  it('row 1 ideal: 170 points, 13 spotted, gold', () => {
    const r = summary(ideal);
    expect(r.points).toBe(170);
    expect(r.spotted).toBe(13);
    expect(r.redFlags).toBe(13);
    expect(r.stamp).toBe('gold');
  });

  it('row 2: checking the page or app before approving 9-1 and 9-3 keeps 170 and gold', () => {
    const r = summary(ideal, { 'stockholm-01-desk-login': [act('check_desk_page')], 'stockholm-03-birgitta-shopping': [act('check_payment_in_app')] });
    expect(r.points).toBe(170);
    expect(r.stamp).toBe('gold');
  });

  it('row 3: following the caller into Gatewren in 9-5, then calling the card, caps at ★★ (165, gold)', () => {
    const ev = [...tagAll('start', 'claim#2', 'request'), act('open_gatewren_for_loan'), act('deny_call_card_loan')];
    const s = get('stockholm-05-loan-call');
    const st = run(s, T(), [act('open_gatewren_for_loan')]);
    expect(callBehind(s, st.groups[0] as RunnerState['groups'][number])?.id).toBe('start');
    expect(play(s, T(), ev).r.points).toBe(14);
    const r = summary(ideal, { 'stockholm-05-loan-call': ev });
    expect(r.points).toBe(165);
    expect(r.stamp).toBe('gold');
  });

  it('row 4 careful reporter: 135 (79.4%), 13 spotted, silver', () => {
    const r = summary(ideal, {
      'stockholm-02-pending-payment': [...tagAll('start', 'phone_number', 'request'), act('report_pending_text')],
      'stockholm-05-loan-call': [...tagAll('start', 'claim#2', 'request'), act('hang_up_loan'), wn('report')],
      'stockholm-06-buyer-qr': [...tagAll('start', 'sender.detail', 'claim#2'), act('block_buyer_number')],
      'stockholm-08-support-call': [...tagAll('start', 'claim#2'), act('hang_up_support'), wn('report')],
      [BOSS]: [
        ...tagAll('start', 'claim#2', 'request'),
        act('hang_up_police_b1'),
        wn('report'),
        cont,
        ...tagAll('bank_call', 'claim#2', 'request'),
        act('report_bank_call_b2'),
        cont,
        ...tagAll('case_qr', 'claim', 'claim#2'),
        act('block_case_number'),
      ],
    });
    expect(r.points).toBe(135);
    expect(r.spotted).toBe(13);
    expect(r.stamp).toBe('silver');
  });

  it('row 5: reporting Birgitta\'s real signature (9-3) costs 20 points: 150, silver', () => {
    const r = summary(ideal, { 'stockholm-03-birgitta-shopping': [act('report_birgitta_signature')] });
    expect(r.points).toBe(150);
    expect(r.genuineReported).toBe(1);
    expect(r.stamp).toBe('silver');
  });

  it('row 6c: always tag the request + always verify: 158, bronze (9-8 has no request checkable; see note)', () => {
    // GDD §29.7 row 6c counts 9-8's install sentence as "the request" (+2, net 3). It is authored as claim#2
    // (install carries no ask, CR-30), so a request tag is not possible there: 158 points, net 4 - 2 = 2.
    const req = (beat = 'start') => tagAll(beat, 'request');
    const r = summary(verifyAll, {
      'stockholm-01-desk-login': [...req(), act('check_desk_page')],
      'stockholm-02-pending-payment': [...req(), act('open_larchwick_app')],
      'stockholm-03-birgitta-shopping': [...req(), act('check_payment_in_app')],
      'stockholm-05-loan-call': [...req(), act('call_card_loan')],
      [BOSS]: [...req(), act('call_police_yourself_b1'), cont, ...req('bank_call'), act('deny_call_card_b2'), cont, act('call_police_yourself_b3')],
    });
    expect(r.points).toBe(158);
    expect(r.correctTags).toBe(4);
    expect(r.wrongTags).toBe(2);
    expect(r.stamp).toBe('bronze');
  });

  it('row 7 blind always-verify: 150 (88.2%), bronze', () => {
    const r = summary(verifyAll);
    expect(r.points).toBe(150);
    expect(r.stamp).toBe('bronze');
  });

  it('row 8 blind always-report: 55, bronze', () => {
    const r = summary({
      'stockholm-01-desk-login': [act('report_desk_login')],
      'stockholm-02-pending-payment': [act('report_pending_text')],
      'stockholm-03-birgitta-shopping': [act('report_birgitta_signature')],
      'stockholm-05-loan-call': [act('hang_up_loan'), wn('report')],
      'stockholm-06-buyer-qr': [act('block_buyer_number')],
      'stockholm-07-laptop-login': [act('report_laptop_page')],
      'stockholm-08-support-call': [act('hang_up_support'), wn('report')],
      [BOSS]: [act('hang_up_police_b1'), wn('report'), cont, act('report_bank_call_b2'), cont, act('block_case_number')],
    });
    expect(r.points).toBe(55);
    expect(r.stamp).toBe('bronze');
  });

  it('row 9 blind always-dismiss: 80, bronze (deny on 9-1 and 9-3 scores 0; closing 9-7 ★★)', () => {
    const r = summary({
      'stockholm-01-desk-login': [act('deny_desk_login')],
      'stockholm-02-pending-payment': [act('delete_pending_text')],
      'stockholm-03-birgitta-shopping': [act('deny_birgitta_signature')],
      'stockholm-05-loan-call': [act('hang_up_loan'), wn('done')],
      'stockholm-06-buyer-qr': [act('ignore_buyer')],
      'stockholm-07-laptop-login': [act('close_laptop_page')],
      'stockholm-08-support-call': [act('hang_up_support'), wn('done')],
      [BOSS]: [act('hang_up_police_b1'), wn('done'), cont, act('deny_bank_prompt_b2'), cont, act('ignore_case_message')],
    });
    expect(r.points).toBe(80);
    expect(r.stamp).toBe('bronze');
  });

  it('row 10 always trust, perfect damage control: 90, bronze', () => {
    const r = summary(ideal, {
      'stockholm-02-pending-payment': [act('call_text_number'), act('open_gatewren_for_erik'), act('approve_for_erik')],
      'stockholm-05-loan-call': [act('open_gatewren_for_loan'), act('approve_loan_prompt')],
      'stockholm-06-buyer-qr': [act('scan_buyer_code'), act('approve_buyer_prompt')],
      'stockholm-08-support-call': [act('install_kindhand')],
      [BOSS]: [act('approve_for_police'), cont, act('sign_for_bank'), cont, act('scan_case_code')],
    });
    expect(r.points).toBe(90);
    expect(r.stamp).toBe('bronze');
  });

  it('row 11 "trust the caller ID": 129 (75.9%), 6 spotted, silver', () => {
    const r = summary(ideal, {
      'stockholm-05-loan-call': [act('open_gatewren_for_loan'), act('approve_loan_prompt')],
      'stockholm-08-support-call': [act('install_kindhand')],
      [BOSS]: [act('approve_for_police'), cont, act('sign_for_bank'), cont, ...tagAll('case_qr', 'claim', 'claim#2'), act('call_police_yourself_b3')],
    });
    expect(r.points).toBe(129);
    expect(r.spotted).toBe(6);
    expect(r.stamp).toBe('silver');
  });

  it('row 12 "a code that opens Gatewren is fine": 154 (90.6%), 9 spotted, gold (input to R15)', () => {
    const r = summary(ideal, {
      'stockholm-06-buyer-qr': [act('scan_buyer_code'), act('approve_buyer_prompt')],
      [BOSS]: [
        ...tagAll('start', 'claim#2', 'request'),
        act('call_police_yourself_b1'),
        cont,
        ...tagAll('bank_call', 'claim#2', 'request'),
        act('deny_call_card_b2'),
        cont,
        act('scan_case_code'),
      ],
    });
    expect(r.points).toBe(154);
    expect(r.spotted).toBe(9);
    expect(r.stamp).toBe('gold');
  });
});

describe('Stockholm: Gatewren prompts and calls', () => {
  it('9-2: calling the number from the text caps at ★★; the prompt opens under the on-call bar', () => {
    const s = get('stockholm-02-pending-payment');
    const st = run(s, T(), [act('call_text_number'), act('open_gatewren_for_erik')]);
    expect(callBehind(s, st.groups[0] as RunnerState['groups'][number])?.id).toBe('security_line');
    expect(play(s, T(), [act('call_text_number'), act('open_gatewren_for_erik'), act('deny_call_card_erik')]).r.stars).toBe(2);
    expect(play(s, T(), [act('call_text_number'), act('hang_up_erik'), wn('call_back_known')]).r.stars).toBe(2);
  });

  it('approve_prompt appears only on fraud; the genuine prompts are proceed', () => {
    for (const s of all.values()) {
      const kinds = [...s.actions, ...s.beats.flatMap((b) => b.actions)].map((a) => a.kind);
      if (!s.is_fraud) expect([s.id, kinds.includes('approve_prompt')]).toEqual([s.id, false]);
    }
    for (const id of ['stockholm-01-desk-login', 'stockholm-03-birgitta-shopping', 'stockholm-07-laptop-login']) {
      const s = get(id);
      expect([id, s.actions.find((a) => a.pressure_target)?.kind]).toEqual([id, 'proceed']);
      expect([id, play(s, T(), [act(s.actions.find((a) => a.pressure_target)?.id ?? '')]).r.stars]).toEqual([id, 3]);
    }
  });

  it('9-8 stops at the request: the install is a fall with go_offline first and two harmful steps', () => {
    const s = get('stockholm-08-support-call');
    const st = run(s, T(), [act('install_kindhand')]);
    expect(st.phase === 'damage_control' || st.phase === 'consequence').toBe(true);
    const o = s.outcomes.kindhand_installed;
    expect(o?.recovery?.map((r) => r.step)).toEqual(['go_offline', 'call_bank_known_number', 'tell_trusted_adult', 'change_password', 'let_caller_finish', 'wait_and_see']);
    expect(o?.narrative).toMatch(/You stop and hang up/);
  });
});

describe('Stockholm boss: three asks for your Gatewren', () => {
  it('every boss fall outcome sets stockholm_bank_called (story variant) and offers six steps', () => {
    const s = get(BOSS);
    const falls = Object.values(s.outcomes).filter((o) => o.recovery && o.recovery.length > 0);
    expect(falls.length).toBe(3);
    for (const o of falls) {
      expect(o.sets_flags ?? []).toContain('stockholm_bank_called');
      expect(o.recovery).toHaveLength(6);
    }
  });

  it('beat 2 shows the signing banner (48 000 kr to Skarvlund Trygg AB); beat 3 is covered by beats 1–2', () => {
    const s = get(BOSS);
    expect(s.beats.find((b) => b.id === 'bank_call')?.banner?.message.body).toMatch(/48 000 kr to Skarvlund Trygg AB/);
    expect(s.beats.find((b) => b.id === 'case_qr')?.covered_by).toEqual(['start', 'bank_call']);
  });

  it('Birgitta\'s fika message is skipped after a fall', () => {
    const s = get(BOSS);
    expect(s.interrupts[0]).toMatchObject({ id: 'birgitta_fika_ready', after_beat: 'case_qr', on_fall: 'skip' });
  });
});

describe('Stockholm: every fall offers exactly two harmful steps, at most six, and tell_trusted_adult as a stop step', () => {
  it('holds for every fall outcome', () => {
    for (const s of all.values()) {
      for (const [key, o] of Object.entries(s.outcomes)) {
        if (!o.recovery) continue;
        expect([s.id, key, o.recovery.filter((r) => r.category === 'harmful').length]).toEqual([s.id, key, 2]);
        expect(o.recovery.length).toBeLessThanOrEqual(6);
        expect([s.id, key, o.recovery.find((r) => r.step === 'tell_trusted_adult')?.category]).toEqual([s.id, key, 'stop']);
      }
    }
  });
});
