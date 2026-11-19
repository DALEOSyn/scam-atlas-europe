/**
 * Engine change requests for Amsterdam and Paris (GDD §19, §22.7, §23.11): CR-17 … CR-26.
 * Schema and validator rules, scoring of the `step` class and the banking beat, boss chaining
 * (CR-18(e)), beat-bound pushers (CR-21) and the new checkables.
 */
import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintPaths, lintText, loadConfig } from '../../../scripts/redline-lint.ts';
import { svgSafetyIssues } from '../../../scripts/lib/svg-safety.ts';
import { chapterRules, scenarioRules } from '../../../scripts/lib/rules.ts';
import { videoAssetIssues } from '../../../scripts/lib/content.ts';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { holdingForTransfer, senderBeatBefore, startScenario, step, transferFloor, viewOf } from '../../../src/engine/runner.ts';
import { classOf, mergeDecision, scoreGroup, starsFor } from '../../../src/engine/scoring.ts';
import { ROOT, rawFraud, rawGenuine, realRegistries, scenario } from '../../content/fixtures.ts';
import { act, B, check, ctx, play, run, tag, tick, type Raw } from './helpers.ts';
import { beatOf, rawBoss, rawTransfer } from './cr-fixtures.ts';

const reg = realRegistries();

function schemaErrors(raw: Raw): string[] {
  const r = scenarioSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}
function ruleErrors(raw: Raw): string[] {
  const r = scenarioSchema.safeParse(raw);
  if (!r.success) return r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  return scenarioRules(r.data, reg).errors;
}
const clone = <T>(x: T): T => structuredClone(x);

// ---------------------------------------------------------------------------

describe('CR-17 (a): message.ask on pay, enter_details and reply from slot 2', () => {
  function chapterWith(slot: number, raws: Raw[]) {
    const scenarios = raws.map(scenario);
    const chapter = chapterSchema.parse({
      slot,
      city: 'testcity',
      name: 'Test',
      status: 'draft',
      patterns: ['smishing-parcel-fee'],
      lo_focus: ['LO-02'],
      scenario_order: { am: scenarios.map((s) => s.id), pm: [] },
      intro: 'Test.',
    });
    return chapterRules(chapter, 'testcity', scenarios, reg).errors.join('\n');
  }
  it('requires the ask from slot 2, on fraud and genuine alike, also on engage-reached beats', () => {
    // rawFraud: opening asks to pay (no ask), the fee page asks to enter details (no ask).
    const f = rawFraud('f1');
    const g = rawGenuine('g1', { stakes: 'high', message: { ...(rawGenuine().message as Raw), request: 'reply' }, actions: [{ id: 'reply_ok', label: 'Reply: see you then', kind: 'proceed', outcome: 'done', pressure_target: true }, { id: 'report_it', label: 'Report it', kind: 'report', outcome: 'reported' }] });
    const errs = chapterWith(2, [f, g]);
    expect(errs).toMatch(/"f1" opening message: request pay needs message.ask from slot 2 on/);
    expect(errs).toMatch(/"f1" beat "fee_page": request enter_details needs message.ask/);
    expect(errs).toMatch(/"g1" opening message: request reply needs message.ask/);
  });
  it('leaves slots 0–1 unchanged (existing content keeps validating)', () => {
    expect(chapterWith(1, [rawFraud('f1')])).not.toMatch(/CR-17/);
  });
  it('exempts banking beats (their payee is the checkable)', () => {
    expect(chapterWith(2, [rawTransfer()])).not.toMatch(/CR-17/);
  });
  it('an ask is allowed on pay, enter_details and reply only (plus share_code / approve)', () => {
    const raw = rawTransfer();
    expect(schemaErrors(raw)).toEqual([]);
    const none = clone(raw);
    (none.message as Raw).request = 'open_link';
    expect(schemaErrors(none).join('\n')).toMatch(/ask is only for messages whose request is/);
  });
});

describe('CR-17 (b): claims', () => {
  it('derives claim and claim#2 checkables in reading order, before the request', () => {
    const raw = rawTransfer();
    (raw.message as Raw).body = 'Phone fell in the canal! Pay €84 into my new account today please. I will pay you back tomorrow. It is only for one day.';
    (raw.message as Raw).claims = [{ text: 'I will pay you back tomorrow.' }, { text: 'It is only for one day.' }];
    const s = scenario(raw);
    expect(deriveCheckables(s.device, s.message)).toEqual(['sender.detail', 'reference', 'claim', 'claim#2', 'request']);
    expect(checkablesOf({ id: 'start', device: s.device, message: s.message, inspectables: [] }).find((c) => c.target === 'claim#2')?.shown).toBe('It is only for one day.');
  });
  it('validates claims: verbatim, at most 2, type claim, no overlap with the ask', () => {
    const notVerbatim = rawTransfer();
    (notVerbatim.message as Raw).claims = [{ text: 'I will pay you back on Friday.' }];
    expect(schemaErrors(notVerbatim).join('\n')).toMatch(/claims\[\]\.text must be copied verbatim/);
    const three = rawTransfer();
    (three.message as Raw).claims = [{ text: 'I will pay you back tomorrow.' }, { text: 'Phone fell in the canal!' }, { text: 'Pay €84 into my new account' }];
    expect(schemaErrors(three).join('\n')).toMatch(/claims/);
    const wrongType = rawTransfer();
    (wrongType.inspectables as Raw[]).push({ target: 'claim', reveal: 'An excuse.', red_flag: false, type: 'request' });
    expect(schemaErrors(wrongType).join('\n')).toMatch(/a claim checkable has type: claim/);
    const overlap = rawTransfer();
    (overlap.message as Raw).claims = [{ text: 'Pay €84 into my new account today please.' }];
    expect(schemaErrors(overlap).join('\n')).toMatch(/must not overlap the ask/);
    const foreign = rawTransfer();
    Object.assign(foreign.message as Raw, { lang: 'nl', translation: 'Phone fell in the canal! Pay €84 into my new account today please. I will pay you back tomorrow.' });
    (foreign.message as Raw).ask = { text: 'Pay €84 into my new account today please.', translation: 'Pay €84 into my new account today please.' };
    expect(schemaErrors(foreign).join('\n')).toMatch(/claims\[\]\.translation is required/);
  });
});

describe('CR-18 (a): start_transfer is class step', () => {
  it('balance.yaml maps start_transfer to step; step has no star row and never decides', () => {
    expect(classOf(B, 'start_transfer')).toBe('step');
    expect(starsFor(B, 'step', 'fraud')).toBeUndefined();
    const verify = { cls: 'verify' as const, kind: 'call_back_known' as const, actionId: 'v' };
    expect(mergeDecision(verify, { cls: 'step', kind: 'start_transfer', actionId: 's' }, 'fraud', false)).toBe(verify);
    expect(mergeDecision(undefined, { cls: 'step', kind: 'start_transfer', actionId: 's' }, 'fraud', false)).toBeUndefined();
  });
  it('start_transfer + a banking-beat verify scores as that verify (★★★), no cap', () => {
    const s = scenario(rawTransfer());
    const { r, st } = play(s, ctx(), [act('start_transfer'), act('cancel_call')]);
    expect(r.stars).toBe(3);
    expect(r.points).toBe(15);
    expect(st.groups[0]?.engagedOnFraud).toBe(false);
    expect(st.groups[0]?.kinds).toEqual(['start_transfer', 'call_back_known']);
  });
  it('the banking beat decides: Cancel = dismiss ★★ on fraud; Pay anyway = a fall', () => {
    const s = scenario(rawTransfer());
    expect(play(s, ctx(), [act('start_transfer'), act('cancel')]).r.stars).toBe(2);
    const fall = run(s, ctx(), [act('start_transfer'), act('pay_anyway')]);
    expect(fall.phase).toBe('damage_control');
    expect(resultOf(s, B, fall).fell).toBe(true);
  });
  it('a timer expiry after start_transfer scores as expiry (step never decides)', () => {
    const raw = rawTransfer();
    (raw as Raw).pressure = { timer: true, levers: [] };
    const s = scenario(raw);
    const { r } = play(s, ctx(), [act('start_transfer'), tick(200), tick(200)]);
    expect(r.timerExpired).toBe(true);
    expect(r.beats[0]?.cls).toBe('dismiss');
  });
  it('the fixture scenarios pass every rule', () => {
    expect(ruleErrors(rawTransfer())).toEqual([]);
    expect(ruleErrors(rawTransfer('g1', false))).toEqual([]);
    expect(ruleErrors(rawBoss())).toEqual([]);
  });
  it('start_transfer ranks with the doing actions in action_order', () => {
    const raw = rawBoss();
    const actions = raw.actions as Raw[];
    raw.actions = [actions[1], actions[0], actions[2], actions[3]].map((a) => ({ ...a, pressure_target: false }));
    (raw.actions as Raw[])[1] = { ...(raw.actions as Raw[])[1], pressure_target: true };
    expect(ruleErrors(raw).join('\n')).toMatch(/action_order/);
    (raw.actions as Raw[])[1] = { ...(raw.actions as Raw[])[1], pressure_target: false };
    (raw.actions as Raw[])[0] = { ...(raw.actions as Raw[])[0], pressure_target: true };
    expect(ruleErrors(raw).join('\n')).not.toMatch(/action_order/);
  });
});

describe('CR-18 (b): start_transfer chains to a banking beat with a payee, a verify and a dismiss', () => {
  it('rejects an outcome instead of next_beat', () => {
    const raw = rawTransfer();
    (raw.actions as Raw[])[0] = { id: 'start_transfer', label: 'Pay it', kind: 'start_transfer', outcome: 'left', pressure_target: true };
    expect(schemaErrors(raw).join('\n')).toMatch(/start_transfer opens the banking app: it needs next_beat/);
  });
  it('rejects a target that is not a banking beat', () => {
    const raw = rawTransfer();
    beatOf(raw, 'bank').device = 'browser';
    (beatOf(raw, 'bank').message as Raw).page = { address: 'trundle.example/pay' };
    expect(schemaErrors(raw).join('\n')).toMatch(/leads to a banking beat with a payee; "bank" is a browser beat/);
  });
  it('rejects a banking beat without a payee (device rule) and the step rule names it', () => {
    const raw = rawTransfer();
    delete (beatOf(raw, 'bank').message as Raw).payee;
    beatOf(raw, 'bank').inspectables = [];
    const errs = schemaErrors(raw).join('\n');
    expect(errs).toMatch(/a banking message needs payee/);
    expect(errs).toMatch(/missing message.payee/);
  });
  it('rejects a banking beat without a verify, or without a dismiss', () => {
    const noVerify = rawTransfer();
    beatOf(noVerify, 'bank').actions = (beatOf(noVerify, 'bank').actions as Raw[]).filter((a) => a.kind !== 'call_back_known');
    expect(ruleErrors(noVerify).join('\n')).toMatch(/needs at least one verify action \(CR-18\(b\)\)/);
    const noDismiss = rawTransfer();
    beatOf(noDismiss, 'bank').actions = (beatOf(noDismiss, 'bank').actions as Raw[]).filter((a) => a.kind !== 'ignore');
    expect(ruleErrors(noDismiss).join('\n')).toMatch(/needs at least one dismiss action/);
  });
  it('genuine: Decline on the banking beat = dismiss on genuine high stakes (0); paying = ★', () => {
    const s = scenario(rawTransfer('g1', false));
    expect(s.stakes).toBe('high');
    expect(play(s, ctx(), [act('start_transfer'), act('cancel')]).r.stars).toBe(0);
    expect(play(s, ctx(), [act('start_transfer'), act('pay_anyway')]).r.stars).toBe(1);
  });
  it('is for standard and boss scenarios only', () => {
    const drill = rawTransfer('d1', true, { role: 'drill' });
    expect(schemaErrors(drill).join('\n')).toMatch(/start_transfer is for standard and boss scenarios/);
  });
});

describe('CR-18 (c): payment-request page', () => {
  function requestPage(): Raw {
    const raw = rawTransfer();
    beatOf(raw, 'bank').message = { payee: { name: 'Hotel Grachtzicht', amount: '€260.00', note: 'Room, one night', payment_request: true }, request: 'pay' };
    beatOf(raw, 'bank').inspectables = [{ target: 'payee.name', reveal: 'Who gets the money.', red_flag: false }];
    return raw;
  }
  it('has a plain payee.name checkable and no name check', () => {
    const s = scenario(requestPage());
    const bank = s.beats.find((b) => b.id === 'bank');
    expect(bank && deriveCheckables(bank.device, bank.message)).toEqual(['payee.name']);
    expect(ruleErrors(requestPage())).toEqual([]);
  });
  it('rejects a name-check result or a holder on a request page', () => {
    const raw = requestPage();
    ((beatOf(raw, 'bank').message as Raw).payee as Raw).name_check = 'match';
    expect(schemaErrors(raw).join('\n')).toMatch(/no payee-name check runs on a payment-request page/);
  });
});

describe('CR-23: four results; holder only on close match', () => {
  it('requires the holder on close match and forbids it everywhere else (never on no match)', () => {
    const close = rawTransfer();
    (((beatOf(close, 'bank').message as Raw).payee as Raw).name_check = 'close_match');
    expect(schemaErrors(close).join('\n')).toMatch(/a close match shows the account holder/);
    const mismatch = rawTransfer();
    ((beatOf(mismatch, 'bank').message as Raw).payee as Raw).holder = 'J. Doe Trading';
    expect(schemaErrors(mismatch).join('\n')).toMatch(/payee.holder is shown only on a close match/);
  });
  it('a match reveal never starts with "It fits"', () => {
    const raw = rawBoss();
    (beatOf(raw, 'boss_transfer').inspectables as Raw[])[0] = { target: 'payee.name_check', reveal: 'It fits: the name matches.', red_flag: false };
    expect(ruleErrors(raw).join('\n')).toMatch(/a "match" reveal must not start with "It fits"/);
  });
  it('a coach mark freezes the timer (freeze reason coach_mark)', () => {
    const raw = rawTransfer();
    (raw as Raw).pressure = { timer: true, levers: [] };
    const s = scenario(raw);
    const c = ctx();
    let st = run(s, c, [act('start_transfer')]);
    const before = st.timer?.remaining;
    st = step(s, c, st, { type: 'freeze', reason: 'coach_mark', on: true });
    st = step(s, c, st, tick(10));
    expect(st.timer?.remaining).toBe(before);
    st = step(s, c, st, { type: 'freeze', reason: 'coach_mark', on: false });
    st = step(s, c, st, tick(1));
    expect(st.timer?.remaining).toBe((before ?? 0) - 1);
  });
});

describe('CR-18 (e): boss chaining', () => {
  const s = scenario(rawBoss());
  it('the sub-beat action counts as the scheduled beat\'s decisive action', () => {
    const st = run(s, ctx(), [act('set_up'), act('sign_off')]);
    expect(st.groups).toHaveLength(1);
    expect(st.groups[0]?.beatId).toBe('start');
    expect(st.groups[0]?.decision?.cls).toBe('verify');
    expect(st.groups[0]?.visited).toEqual(['start', 'boss_transfer']);
  });
  it('covered_by on the next beat treats a verify on the sub-beat as the parent\'s', () => {
    const { r } = play(s, ctx(), [act('set_up'), act('sign_off'), { type: 'continue' }, act('report_call')]);
    expect(r.beats[1]?.covered).toBe(true);
    expect(r.beats[1]?.cls).toBe('verify');
    expect(r.beats.map((x) => x.stars)).toEqual([3, 3]);
  });
  it('the beat timer carries over with a 40 s floor (scaled by the timer mode)', () => {
    const c = ctx();
    let st = run(s, c, [tick(30)]);
    expect(st.timer?.remaining).toBe(10);
    st = step(s, c, st, act('set_up'));
    expect(st.timer?.remaining).toBe(40);
    const ext = ctx({ timerMode: 'extended' });
    const st2 = run(s, ext, [tick(60), act('set_up')]);
    expect(st2.timer?.remaining).toBe(80);
    // Carries over when there is more than the floor left.
    const st3 = run(s, c, [tick(1), act('set_up')]);
    expect(st3.timer?.remaining).toBe(39 + 1);
    const st4 = run(s, ctx({ timerMode: 'off' }), [act('set_up')]);
    expect(st4.timer).toBeNull();
  });
  it('holds the next scheduled beat while the banking card is open, then it arrives as normal', () => {
    const c = ctx();
    let st = run(s, c, [tick(10), act('set_up')]);
    expect(holdingForTransfer(st)).toBe(true);
    st = step(s, c, st, tick(38));
    expect(st.clock).toBeGreaterThan(45);
    expect(st.arrived).toEqual(['start']);
    expect(viewOf(s, c, st).waitingBeats).toEqual([]);
    expect(st.log.some((e) => e.type === 'beat_arrived' && e.beatId === 'lawyer_call')).toBe(false);
    st = step(s, c, st, act('cancel'));
    expect(st.phase).toBe('consequence');
    st = step(s, c, st, { type: 'continue' });
    expect(st.groups.map((g) => g.beatId)).toEqual(['start', 'lawyer_call']);
    // Its own timer starts on arrival (a call beat: timers.call_beat).
    expect(st.timer?.remaining).toBe(B.timers.call_beat);
  });
  it('the validator rejects a second chained sub-beat and start_transfer off a scheduled beat', () => {
    const two = rawBoss();
    const sub2 = { ...clone(beatOf(two, 'boss_transfer')), id: 'boss_transfer_2', actions: (beatOf(two, 'boss_transfer').actions as Raw[]).map((a) => ({ ...a, id: `${String(a.id)}_2` })) };
    (two.beats as Raw[]).splice(1, 0, sub2);
    two.actions = [...(two.actions as Raw[]).slice(0, 3), { id: 'set_up_2', label: 'Set it up again', kind: 'start_transfer', next_beat: 'boss_transfer_2' }];
    expect(schemaErrors(two).join('\n')).toMatch(/chains to 2 banking sub-beats; a scheduled boss beat chains to at most one/);
    const chained = rawBoss();
    (beatOf(chained, 'boss_transfer').actions as Raw[]).push({ id: 'again', label: 'Start again', kind: 'start_transfer', next_beat: 'boss_transfer' });
    expect(schemaErrors(chained).join('\n')).toMatch(/cannot chain another start_transfer|offered on a scheduled beat only/);
  });
  it('the sub-beat red flags count toward spotting, not R', () => {
    const raw = rawBoss();
    (beatOf(raw, 'boss_transfer').inspectables as Raw[])[0] = { target: 'payee.name_check', reveal: 'Not her company.', red_flag: true };
    const b = scenario(raw);
    const { r } = play(b, ctx(), [act('set_up'), check('payee.name_check', 'boss_transfer'), tag('payee.name_check', 'boss_transfer'), act('cancel'), { type: 'continue' }, act('ignore_call')]);
    expect(r.redFlags).toBe(1);
    expect(r.correctTags).toBe(1);
  });
});

describe('CR-19 … CR-26: device-only parts', () => {
  it('CR-19 new_contact: messenger only, with the number in sender.detail', () => {
    const sms = rawFraud();
    ((sms.message as Raw).sender as Raw).new_contact = true;
    expect(schemaErrors(sms).join('\n')).toMatch(/new_contact .* is for messenger chats/);
    const noNumber = rawTransfer();
    delete ((noNumber.message as Raw).sender as Raw).detail;
    expect(schemaErrors(noNumber).join('\n')).toMatch(/a new contact shows its number/);
  });
  it('CR-20 recorded and CR-24 video: call beats only; video adds the video checkable', () => {
    const sms = rawFraud();
    (sms.message as Raw).recorded = true;
    (sms.message as Raw).video = { illustration: 'public/art/video/solene-gate.svg', alt: 'Solène at an airport gate' };
    const errs = schemaErrors(sms).join('\n');
    expect(errs).toMatch(/recorded is for call beats/);
    expect(errs).toMatch(/video is for call beats/);
    const boss = rawBoss();
    Object.assign(beatOf(boss, 'lawyer_call').message as Raw, { video: { illustration: 'public/art/video/solene-gate.svg', alt: 'Solène at an airport gate' } });
    const b = scenario(boss);
    const call = b.beats.find((x) => x.id === 'lawyer_call');
    expect(call && deriveCheckables(call.device, call.message).slice(0, 2)).toEqual(['caller_id', 'video']);
    expect(videoAssetIssues(b, ROOT)).toEqual(['beat "lawyer_call": video.illustration "public/art/video/solene-gate.svg" does not exist']);
    const photo = rawBoss();
    Object.assign(beatOf(photo, 'lawyer_call').message as Raw, { video: { illustration: 'public/art/video/solene.png', alt: 'x' } });
    expect(schemaErrors(photo).join('\n')).toMatch(/video.illustration is an SVG/);
  });
  it('CR-21: beat-bound pushers fire from when the beat opens, and never if it is not reached', () => {
    const raw = rawFraud();
    raw.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: '11 tasks to go!', beat: 'fee_page' }] } };
    const s = scenario(raw);
    const c = ctx();
    let st = run(s, c, [tick(30)]);
    expect(st.pushers.fired).toEqual([]);
    st = step(s, c, st, act('tap_link'));
    st = step(s, c, st, tick(4));
    expect(st.pushers.fired).toEqual([]);
    st = step(s, c, st, tick(2));
    expect(st.pushers.fired.map((f) => f.index)).toEqual([0]);
    expect(viewOf(s, c, st).pusherMessages.map((p) => p.text)).toEqual(['11 tasks to go!']);
    const never = run(s, c, [tick(30), act('open_app')]);
    expect(never.pushers.fired).toEqual([]);
  });
  it('CR-21: the validator checks the beat id and the listing order', () => {
    const raw = rawFraud();
    raw.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Hello?', beat: 'nope' }] } };
    expect(schemaErrors(raw).join('\n')).toMatch(/"nope" is not a follow-up beat id/);
    const order = rawFraud();
    order.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'A', beat: 'fee_page' }, { at_seconds: 10, text: 'B' }] } };
    expect(schemaErrors(order).join('\n')).toMatch(/list unbound follow-ups before beat-bound ones/);
  });
  it('CR-22: a bank-details card on email shows the IBAN only; no name check outside banking', () => {
    const s = scenario(rawBoss());
    expect(deriveCheckables(s.device, s.message)).toEqual(['sender.detail', 'reference', 'payee.iban', 'request']);
    const withCheck = rawBoss();
    ((withCheck.message as Raw).payee as Raw).name_check = 'match';
    expect(schemaErrors(withCheck).join('\n')).toMatch(/the payee-name check runs only in the bank app/);
    const sms = rawFraud();
    (sms.message as Raw).payee = { name: 'X', iban: 'NL00 TEST 0000 0000 00' };
    expect(schemaErrors(sms).join('\n')).toMatch(/not on sms \(CR-22\)/);
  });
  it('CR-25: email thread history is allowed; CR-26: account is for banking beats', () => {
    const mail = rawBoss();
    (mail.message as Raw).earlier = [{ when: 'Monday', body: 'Thanks for the update.' }];
    expect(schemaErrors(mail)).toEqual([]);
    const acct = rawBoss();
    (acct.message as Raw).account = { nickname: 'Ruchelune · current account' };
    expect(schemaErrors(acct).join('\n')).toMatch(/account .* is for banking beats/);
  });
});

describe('scoring stays table-driven', () => {
  it('scoreGroup never sees a step decision', () => {
    const g = scoreGroup(B, 'fraud', undefined, { engagedOnFraud: false, timerExpired: true });
    expect(g.cls).toBe('dismiss');
  });
  it('startScenario on a transfer scenario opens on the chat, not the bank', () => {
    const s: Scenario = scenario(rawTransfer());
    expect(startScenario(s, ctx()).groups[0]?.current).toBe('start');
  });
});

// ---------------------------------------------------------------------------
// Review round 1 (sceptic, QA, learning-psychologist; T-3.3)

describe('review fixes: pushers, waiting beats, follow-up channel', () => {
  it('#1 a follow-up bound to the banking sub-beat never hides a later scheduled beat\'s follow-ups', () => {
    const raw = rawBoss();
    raw.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 60, text: 'BEAT2 unbound' }, { at_seconds: 5, text: 'Did you send it yet?', beat: 'boss_transfer' }] } };
    expect(schemaErrors(raw)).toEqual([]);
    const s = scenario(raw);
    const c = ctx({ timerMode: 'off' });
    let st = run(s, c, [act('set_up'), tick(6)]);
    expect(st.pushers.fired.map((f) => f.index)).toEqual([1]);
    st = step(s, c, st, act('cancel'));
    st = step(s, c, st, { type: 'continue' });
    st = step(s, c, st, tick(20));
    expect(st.pushers.fired.map((f) => f.index)).toEqual([1, 0]);
    expect(viewOf(s, c, st).pusherMessages.map((p) => p.text)).toEqual(['BEAT2 unbound']);
  });
  it('#2 a beat that arrived before start_transfer does not wait on top of the bank card; it shows again after', () => {
    for (const timerMode of ['off', 'extended'] as const) {
      const s = scenario(rawBoss());
      const c = ctx({ timerMode });
      let st = run(s, c, [tick(50)]);
      expect(viewOf(s, c, st).waitingBeats).toEqual(['lawyer_call']);
      st = step(s, c, st, act('set_up'));
      expect(viewOf(s, c, st).waitingBeats).toEqual([]);
      st = step(s, c, st, tick(10));
      expect(viewOf(s, c, st).waitingBeats).toEqual([]);
      st = step(s, c, st, act('cancel'));
      expect(st.phase).toBe('consequence');
      expect(viewOf(s, c, st).waitingBeats).toEqual(['lawyer_call']);
    }
  });
  it('#3 a follow-up bound to a banking beat comes from the group\'s sender and channel', () => {
    const raw = rawBoss();
    raw.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Did you send it yet??', beat: 'boss_transfer' }] } };
    const s = scenario(raw);
    const c = ctx({ timerMode: 'off' });
    const st = run(s, c, [act('set_up'), tick(6)]);
    const [p] = viewOf(s, c, st).pusherMessages;
    expect(p?.device).toBe('email');
    expect(p?.sender).toBe('Solène Arbogast');
  });
  it('follow-up c: a page-bound follow-up comes from the most recently visited beat with a sender', () => {
    const raw = rawFraud();
    (raw.actions as Raw[])[0] = { id: 'tap_link', label: 'Open the link', kind: 'open_link', next_beat: 'chat', pressure_target: true };
    raw.beats = [
      {
        id: 'chat',
        device: 'messenger',
        message: { sender: { display: 'Trundle help desk', detail: 'help@trundle-zoll.example' }, body: 'Hi! Pay the fee on our page.', request: 'pay' },
        inspectables: [{ target: 'sender.detail', reveal: 'Not Trundle.', red_flag: true }],
        actions: [
          { id: 'open_page', label: 'Open their page', kind: 'open_link', next_beat: 'fee_page', pressure_target: true },
          { id: 'leave_chat', label: 'Leave the chat', kind: 'ignore', outcome: 'left' },
        ],
      },
      ...(raw.beats as Raw[]),
    ];
    raw.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Paid yet?', beat: 'fee_page' }] } };
    const s = scenario(raw);
    const c = ctx({ timerMode: 'off' });
    const st = run(s, c, [act('tap_link'), act('open_page'), tick(6)]);
    const [p] = viewOf(s, c, st).pusherMessages;
    expect(p?.text).toBe('Paid yet?');
    expect(p?.device).toBe('messenger');
    expect(p?.sender).toBe('Trundle help desk');
    expect(p?.beatId).toBe('chat');
    // Fallback: nothing visited with a sender before the page → the group's scheduled beat.
    expect(senderBeatBefore(s, { visited: ['fee_page'] }, 'fee_page')).toBeUndefined();
  });
  it('#3 the validator: a follow-up bound to a banking beat or a page must resolve to a chat sender', () => {
    const ok = rawFraud();
    ok.pressure = { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Still there?', beat: 'fee_page' }] } };
    expect(schemaErrors(ok)).toEqual([]);
    const page = rawFraud('p1', {
      device: 'browser',
      message: { page: { address: 'trundle-zoll.example/p/1' }, body: 'Your parcel is held.', request: 'pay' },
      inspectables: [{ target: 'page.address', reveal: 'A look-alike.', red_flag: true }],
      pressure: { timer: false, levers: [], pusher: { messages: [{ at_seconds: 5, text: 'Still there?', beat: 'fee_page' }] } },
    });
    expect(schemaErrors(page).join('\n')).toMatch(/a follow-up bound to the browser beat "fee_page" must resolve to a chat sender/);
  });
});

describe('review fixes: timer carry-over above the floor (#13)', () => {
  it('transferFloor keeps more time than the floor, raises less', () => {
    const c = ctx();
    expect(transferFloor(c, { remaining: 55, length: 60, expiries: 0 }).remaining).toBe(55);
    expect(transferFloor(c, { remaining: 12, length: 60, expiries: 0 })).toEqual({ remaining: 40, length: 60, expiries: 0 });
  });
  it('a scheduled beat with its own 60 s timer carries 50 s over to its banking sub-beat', () => {
    const raw = rawBoss();
    const sub = { ...clone(beatOf(raw, 'boss_transfer')), id: 'transfer_2', actions: (beatOf(raw, 'boss_transfer').actions as Raw[]).map((a) => ({ ...a, id: `${String(a.id)}_2` })) };
    const beat2 = {
      id: 'second_mail',
      arrives_after: 45,
      timer_seconds: 60,
      device: 'email',
      message: { ...(raw.message as Raw) },
      inspectables: [{ target: 'request', reveal: 'Skips the sign-off.', red_flag: true, type: 'request' }],
      actions: (raw.actions as Raw[]).map((a) => ({ ...a, id: `${String(a.id)}_b2`, ...(a.next_beat ? { next_beat: 'transfer_2' } : {}) })),
    };
    raw.beats = [beatOf(raw, 'boss_transfer'), sub, beat2];
    const s = scenario(raw);
    const c = ctx();
    let st = run(s, c, [act('leave_it'), { type: 'continue' }]);
    expect(st.groups.at(-1)?.beatId).toBe('second_mail');
    expect(st.timer?.remaining).toBe(60);
    st = step(s, c, st, tick(10));
    st = step(s, c, st, act('set_up_b2'));
    expect(st.timer?.remaining).toBe(50);
  });
});

describe('review fixes: schema (#5, #17) and SVG safety (#4)', () => {
  it('#5 no bank-details card on a letter', () => {
    const raw = rawFraud('l1', {
      device: 'letter',
      message: { letterhead: 'Trundle', body: 'Pay at trundle-zoll.example/p/1', request: 'pay', payee: { name: 'X', iban: 'NL00 TEST 0000 0000 00' } },
    });
    expect(schemaErrors(raw).join('\n')).toMatch(/bank-details card on email or messenger, not on letter/);
  });
  it('#17 type claim / video only on their own targets', () => {
    const raw = rawTransfer();
    (raw.inspectables as Raw[])[2] = { target: 'reference', reveal: 'A note.', red_flag: false, type: 'claim' };
    expect(schemaErrors(raw).join('\n')).toMatch(/type: claim is only for the claim/);
    (raw.inspectables as Raw[])[2] = { target: 'reference', reveal: 'A note.', red_flag: false, type: 'video' };
    expect(schemaErrors(raw).join('\n')).toMatch(/type: video is only for the video checkable/);
  });
  it('#4 the illustration lives in public/art/video/ and may not embed a photo', () => {
    const at = (path: string) => {
      const raw = rawBoss();
      Object.assign(beatOf(raw, 'lawyer_call').message as Raw, { video: { illustration: path, alt: 'Solène at an airport gate' } });
      return raw;
    };
    expect(schemaErrors(at('public/illustrations/solene.svg')).join('\n')).toMatch(/public\/art\/video\/<id>\.svg/);
    const root = mkdtempSync(join(tmpdir(), 'sae-video-'));
    mkdirSync(join(root, 'public', 'art', 'video'), { recursive: true });
    writeFileSync(join(root, 'public/art/video/clean.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"/></defs><rect fill="url(#g)" width="10" height="10"/><use href="#g"/></svg>');
    writeFileSync(join(root, 'public/art/video/photo.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><image href="data:image/png;base64,iVBORw0KGgo=" width="10" height="10"/></svg>');
    expect(videoAssetIssues(scenario(at('public/art/video/clean.svg')), root)).toEqual([]);
    const issues = videoAssetIssues(scenario(at('public/art/video/photo.svg')), root).join('\n');
    expect(issues).toMatch(/<image>/);
    expect(issues).toMatch(/data:image\//);
    expect(issues).toMatch(/links outside the file/);
  });
  it('#4 svgSafetyIssues: foreignObject, script, external href, url() outside the file', () => {
    const bad = '<svg><foreignObject/><script>x</script><a xlink:href="https://evil.example/">x</a><style>.a{fill:url(https://x.example/p.svg#a)}</style><rect style="fill:url(#ok)"/></svg>';
    const msgs = svgSafetyIssues(bad).map((i) => i.message).join('\n');
    expect(msgs).toMatch(/foreignObject/);
    expect(msgs).toMatch(/<script>/);
    expect(msgs).toMatch(/links outside the file/);
    expect(msgs).toMatch(/url\(\) outside the file/);
    expect(svgSafetyIssues(bad).filter((i) => i.match.includes('#ok'))).toEqual([]);
  });
  it('follow-up b: svgSafetyIssues rejects <!DOCTYPE, <!ENTITY and @import', () => {
    const bad = '<!DOCTYPE svg [<!ENTITY t "x">]><svg><style>@import "other.css";</style></svg>';
    const msgs = svgSafetyIssues(bad).map((i) => i.message).join('\n');
    expect(msgs).toMatch(/DOCTYPE/);
    expect(msgs).toMatch(/ENTITY/);
    expect(msgs).toMatch(/@import/);
    expect(svgSafetyIssues('<svg><style>.x{display:none}</style></svg>')).toEqual([]);
  });
  it('#4 redline:lint fails on an embedded raster in any SVG under public/, and the shipped SVGs are clean', () => {
    const cfg = loadConfig();
    const file = join(ROOT, 'public', 'art', 'video', 'fake.svg');
    const found = lintText(file, '<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,AAAA"/></svg>', cfg);
    expect(found.some((f) => f.category === 'markup' && f.severity === 'error' && /data:image/.test(f.message))).toBe(true);
    const shipped = lintPaths([join(ROOT, 'public')], cfg).filter((f) => f.severity === 'error');
    expect(shipped).toEqual([]);
  });
});
