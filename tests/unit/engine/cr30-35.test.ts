/**
 * Engine change requests for Madrid and Warsaw (GDD §24.9, §25.10): CR-30 … CR-35 and CR-31(b).
 * Schema and validator rules, engine scoring and views, on the fixture scenarios in
 * tests/fixtures/scenarios (one per CR) and on programmatic variants of them.
 */
import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { lintPaths, loadConfig } from '../../../scripts/redline-lint.ts';
import { chapterRules, choiceLines, continuesConversation, scenarioRules } from '../../../scripts/lib/rules.ts';
import { checkScenario, loadSources, readYaml, type ContentReport } from '../../../scripts/lib/content.ts';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { choiceLine } from '../../../src/engine/debrief.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { callBehind, startScenario, step, viewOf, type RunnerState } from '../../../src/engine/runner.ts';
import { scoreGroup } from '../../../src/engine/scoring.ts';
import { CONTENT, ROOT, rawFraud, rawGenuine, realRegistries, scenario } from '../../content/fixtures.ts';
import { act, B, ctx, play, run, tick, type Raw } from './helpers.ts';
import { fixtureBrands } from './fixture-brands.ts';
import { rawTransfer } from './cr-fixtures.ts';

const reg = realRegistries();
const FIX = resolve(ROOT, 'tests', 'fixtures', 'scenarios');
const FILES = readdirSync(FIX).filter((f) => f.endsWith('.yaml'));

function raw(file: string): Raw {
  return readYaml(join(FIX, file)) as Raw;
}
function fixture(file: string): Scenario {
  return scenarioSchema.parse(raw(file));
}
function schemaErrors(r: Raw): string[] {
  const res = scenarioSchema.safeParse(r);
  return res.success ? [] : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}
function ruleErrors(r: Raw): string[] {
  const res = scenarioSchema.safeParse(r);
  if (!res.success) return res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  return scenarioRules(res.data, reg).errors;
}
function crossErrors(r: Raw): string[] {
  const report: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
  checkScenario(`${String(r.id)}.yaml`, r, fixtureBrands(report), loadSources(CONTENT, report), report);
  return report.errors;
}
const clone = <T>(x: T): T => structuredClone(x);
const beat = (r: Raw, id: string): Raw => (r.beats as Raw[]).find((b) => b.id === id) as Raw;
const msg = (r: Raw): Raw => r.message as Raw;
const continueTo = (s: Scenario, st: RunnerState): RunnerState => step(s, ctx(), st, { type: 'continue' });

function chapterWith(slot: number, raws: Raw[]): string {
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

// ---------------------------------------------------------------------------

describe('fixture scenarios (one per CR) are valid content', () => {
  it('there is a fixture for every CR', () => {
    for (const cr of ['cr30', 'cr31', 'cr32', 'cr33', 'cr34', 'cr35']) expect(FILES.some((f) => f.startsWith(cr)), cr).toBe(true);
  });
  it.each(FILES)('%s passes the schema, the scenario rules and the cross-file checks', (file) => {
    expect(ruleErrors(raw(file))).toEqual([]);
    expect(crossErrors(raw(file))).toEqual([]);
  });
  it('passes the red-line linter (fictional brands, non-routable identifiers)', () => {
    const errors = lintPaths(FILES.map((f) => join(FIX, f)), loadConfig()).filter((f) => f.severity === 'error');
    expect(errors).toEqual([]);
  });
  it('fits the layer-1 budget with the new "You chose" lines', () => {
    expect(choiceLines(fixture('cr31-reserve-call.yaml'), reg.balance)).toContain('You chose: Open the app and follow their steps.');
    expect(choiceLines(fixture('cr34-code-confirm.yaml'), reg.balance)).toContain('You chose: Make a code and send it to her.');
  });
});

// ---------------------------------------------------------------------------

describe('CR-30: ask on every request type, required from slot 4', () => {
  it('a slot-4 chapter with a request: call beat and no ask fails', () => {
    const f = rawFraud('f1', { message: { ...(rawFraud().message as Raw), request: 'call' } });
    expect(chapterWith(4, [f])).toMatch(/"f1" opening message: request call needs message.ask from slot 4 on \(CR-30/);
    // Slot 3 keeps CR-17 only: a call request needs no ask there.
    expect(chapterWith(3, [f])).not.toMatch(/CR-30/);
  });
  it('covers none, open_link and log_in on every message device, genuine and fraud alike', () => {
    const g = rawGenuine('g1');
    expect(chapterWith(4, [g])).toMatch(/"g1" opening message: request none needs message.ask from slot 4 on/);
    const link = rawFraud('f2', { message: { ...(rawFraud().message as Raw), request: 'open_link' } });
    expect(chapterWith(4, [link])).toMatch(/"f2" opening message: request open_link needs message.ask/);
  });
  it('exempts banking, follow-up beats, interrupts and scored: false beats', () => {
    // rawFraud's fee page (a next_beat follow-up) has no ask; rawTransfer's banking beat neither.
    const errs = chapterWith(4, [{ ...rawTransfer(), id: 't1' }]);
    expect(errs).not.toMatch(/beat "bank".*CR-30/);
    const f = rawFraud('f3', {
      message: { ...(rawFraud().message as Raw), ask: { text: 'customs fee EUR 1.99 due today' } },
      inspectables: [...(rawFraud().inspectables as Raw[]), { target: 'request', reveal: 'A fee by text.', red_flag: true, type: 'request' }],
    });
    expect(chapterWith(4, [f])).not.toMatch(/fee_page.*CR-30/);
  });
  it('allows an ask, its request checkable and a pressure target on request: none (fixture 5-1 shape)', () => {
    const s = fixture('cr30-ask-none.yaml');
    expect(deriveCheckables(s.device, s.message)).toContain('request');
    expect(checkablesOf({ ...s, id: 'start' }).find((c) => c.target === 'request')?.shown).toBe('Print your label and drop it at a Trundle locker by Friday.');
    const noAsk = clone(raw('cr30-ask-none.yaml'));
    delete msg(noAsk).ask;
    expect(ruleErrors(noAsk).join('\n')).toMatch(/request checkable needs message.request on the same beat .* or message.ask on a request: none message/);
    noAsk.inspectables = (noAsk.inspectables as Raw[]).filter((i) => i.target !== 'request');
    expect(ruleErrors(noAsk).join('\n')).toMatch(/pressure_target is set but the message asks for nothing/);
  });
  it('still rejects an ask on scan_qr and install', () => {
    const r = clone(raw('cr30-ask-none.yaml'));
    msg(r).request = 'scan_qr';
    expect(schemaErrors(r).join('\n')).toMatch(/ask is only for messages whose request is/);
  });
  it('exempts scan_qr and install from the slot-4 ask rule: they cannot carry an ask (GDD §29.4, CR-39(b))', () => {
    for (const request of ['scan_qr', 'install']) {
      const f = rawFraud('f4', { message: { ...(rawFraud().message as Raw), request } });
      expect(chapterWith(9, [f]), request).not.toMatch(/CR-30/);
    }
    // Positive control: a request that can carry an ask still needs one at slot 9.
    const call = rawFraud('f5', { message: { ...(rawFraud().message as Raw), request: 'call' } });
    expect(chapterWith(9, [call])).toMatch(/"f5" opening message: request call needs message.ask from slot 4 on \(CR-30/);
  });
});

// ---------------------------------------------------------------------------

describe('CR-31(b), ruling R16: start_transfer with cap: engage', () => {
  const s = fixture('cr31-reserve-call.yaml');
  it('"follow their steps" then "Hang up and call the number on your card" = ★★ (10 points)', () => {
    const { st, r } = play(s, ctx(), [act('follow_steps'), act('hang_up_call_card')]);
    expect(st.groups[0]?.engagedOnFraud).toBe(true);
    expect(r.beats[0]).toMatchObject({ stars: 2, points: 10, capped: true, fell: false, cls: 'verify' });
    expect(r.stars).toBe(2);
  });
  it('report and cancel in the bank app score ★★ too; hanging up before the app still scores ★★★', () => {
    expect(play(s, ctx(), [act('follow_steps'), act('hang_up_report')]).r.beats[0]).toMatchObject({ stars: 2, points: 10 });
    expect(play(s, ctx(), [act('follow_steps'), act('hang_up_cancel')]).r.beats[0]).toMatchObject({ stars: 2, points: 10 });
    const st = run(s, ctx(), [act('hang_up'), { type: 'what_now', choice: 'call_back_known' }]);
    expect(resultOf(s, B, st).beats[0]).toMatchObject({ stars: 3, points: 15, capped: false });
  });
  it('the fall is unchanged: Confirm and send is a fall with damage control', () => {
    const st = run(s, ctx(), [act('follow_steps'), act('confirm_send')]);
    expect(st.phase).toBe('damage_control');
    expect(resultOf(s, B, st).beats[0]).toMatchObject({ fell: true, stars: 0 });
  });
  it('"You chose" names the capped start_transfer, with the final choice as the path', () => {
    const { st, r } = play(s, ctx(), [act('follow_steps'), act('hang_up_call_card')]);
    const g = st.groups[0];
    const b = r.beats[0];
    if (!g || !b) throw new Error('no group');
    expect(choiceLine(s, g, b)).toMatchObject({ kind: 'action', label: 'Open the app and follow their steps', path: { then: { label: 'Hang up and call your card\'s number' } } });
  });
  it('a genuine start_transfer stays an uncapped step (CR-18)', () => {
    const g = scenario(rawTransfer('g2', false));
    const { r } = play(g, ctx(), [act('start_transfer'), act('cancel_call')]);
    expect(r.beats[0]).toMatchObject({ stars: 3, capped: false });
  });
  it('validator: required from a call on fraud, forbidden on genuine, start_transfer only', () => {
    const missing = clone(raw('cr31-reserve-call.yaml'));
    delete ((missing.actions as Raw[])[0] as Raw).cap;
    expect(schemaErrors(missing).join('\n')).toMatch(/a start_transfer from a call on a fraud scenario needs cap: engage.*R16/);
    const genuine = clone(rawTransfer('g3', false));
    ((genuine.actions as Raw[])[0] as Raw).cap = 'engage';
    expect(schemaErrors(genuine).join('\n')).toMatch(/cap: engage is for fraud scenarios; a genuine start_transfer stays a step/);
    const wrongKind = clone(raw('cr31-reserve-call.yaml'));
    ((wrongKind.actions as Raw[])[1] as Raw).cap = 'engage';
    expect(schemaErrors(wrongKind).join('\n')).toMatch(/cap: engage is for start_transfer actions/);
    // From a chat on fraud the cap stays optional (only calls require it).
    expect(schemaErrors(rawTransfer())).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('CR-31: the on-call bar over the banking beat', () => {
  const s = fixture('cr31-reserve-call.yaml');
  it('shows the caller, the call time and the beat\'s own hang-up actions (verify first)', () => {
    let st = run(s, ctx({ pushers: true }), [tick(4), act('follow_steps')]);
    let v = viewOf(s, ctx(), st);
    expect(v.beat?.id).toBe('reserve_transfer');
    expect(v.onCall).toMatchObject({ caller: 'Larchwick Bank', callBeatId: 'start', hangUp: ['hang_up_call_card', 'hang_up_report', 'hang_up_cancel'] });
    expect(v.onCall?.seconds).toBeCloseTo(4);
    st = step(s, ctx(), st, tick(7));
    v = viewOf(s, ctx(), st);
    expect(v.onCall?.seconds).toBeCloseTo(11);
    // The caller's line bound to the banking beat (CR-21) is marked for the bar.
    expect(v.pusherMessages.map((p) => p.boundTo)).toEqual(['reserve_transfer']);
    expect(v.pusherMessages[0]).toMatchObject({ device: 'call', sender: 'Larchwick Bank' });
  });
  it('is gone on the call itself, after the banking beat, and for a transfer started from a chat', () => {
    expect(viewOf(s, ctx(), startScenario(s, ctx())).onCall).toBeNull();
    const done = run(s, ctx(), [act('follow_steps'), act('hang_up_cancel')]);
    expect(viewOf(s, ctx(), done).onCall).toBeNull();
    const chat = scenario(rawTransfer());
    const st = run(chat, ctx(), [act('start_transfer')]);
    expect(viewOf(chat, ctx(), st).beat?.id).toBe('bank');
    expect(viewOf(chat, ctx(), st).onCall).toBeNull();
    expect(callBehind(chat, st.groups[0] as RunnerState['groups'][number])).toBeUndefined();
  });
  it('Hang up adds no scored path: the bar only points at existing actions', () => {
    const st = run(s, ctx(), [act('follow_steps')]);
    const v = viewOf(s, ctx(), st);
    const ids = v.beat?.actions.map((a) => a.id) ?? [];
    for (const id of v.onCall?.hangUp ?? []) expect(ids).toContain(id);
  });
});

// ---------------------------------------------------------------------------

describe('CR-32: damage control for a cast member (recovery_for)', () => {
  const s = fixture('cr32-friend-drill.yaml');
  it('the damage-control view names whose it is; points and LO-16 count as in Home 0-5', () => {
    const st = run(s, ctx(), [act('help_mateus'), { type: 'continue' }]);
    expect(st.phase).toBe('damage_control');
    expect(viewOf(s, ctx(), st).recovery?.forCast).toBe('mateus');
    const end = step(s, ctx(), st, { type: 'recovery', picks: ['call_bank_stop_payment', 'keep_evidence', 'report_to_police'] });
    expect(end.recovery?.result).toMatchObject({ points: 9, lo16: true });
  });
  it('no recovery_for: forCast is null', () => {
    const t = fixture('cr34-code-confirm.yaml');
    const st = run(t, ctx(), [act('send_code'), act('confirm_payment')]);
    expect(viewOf(t, ctx(), st).recovery?.forCast).toBeNull();
  });
  it('validator: needs recovery steps, a drill and a cast member of the scenario', () => {
    const r = clone(raw('cr32-friend-drill.yaml'));
    (r.outcomes as Raw).mateus_calls_anyway = { narrative: 'x', recovery_for: 'mateus' };
    expect(schemaErrors(r).join('\n')).toMatch(/recovery_for names whose damage control it is: the outcome needs recovery steps/);
    const notCast = clone(raw('cr32-friend-drill.yaml'));
    ((notCast.outcomes as Raw).helping_mateus as Raw).recovery_for = 'teo';
    expect(schemaErrors(notCast).join('\n')).toMatch(/recovery_for "teo" must be in the scenario's cast list/);
    const standard = clone(raw('cr34-code-confirm.yaml'));
    ((standard.outcomes as Raw).paid_shop as Raw).recovery_for = 'mateus';
    standard.cast = ['mateus'];
    expect(schemaErrors(standard).join('\n')).toMatch(/recovery_for is for drills/);
    const unknown = clone(raw('cr32-friend-drill.yaml'));
    ((unknown.outcomes as Raw).helping_mateus as Raw).recovery_for = 'nobody';
    unknown.cast = ['mateus', 'nobody'];
    expect(ruleErrors(unknown).join('\n')).toMatch(/recovery_for: "nobody" is not in content\/cast.yaml/);
  });
});

// ---------------------------------------------------------------------------

describe('CR-33: the marketplace device', () => {
  it('derives sender, link, the listing card as the first reference, references, claim and ask', () => {
    const s = fixture('cr33-market-sale.yaml');
    expect(deriveCheckables(s.device, s.message)).toEqual(['sender.detail', 'link', 'reference', 'reference#2', 'claim', 'request']);
    const items = checkablesOf({ ...s, id: 'start' });
    expect(items.find((c) => c.target === 'reference')?.shown).toBe('Rucksack · €35.00');
    expect(items.find((c) => c.target === 'reference#2')?.shown).toBe('SW-•••• 4471');
  });
  it('behaves like messenger in the runner: check, tag, timer', () => {
    const s = fixture('cr33-market-sale.yaml');
    const st = run(s, ctx(), [{ type: 'check', beatId: 'start', target: 'reference' }, tick(5)]);
    expect(st.checks).toContain('start|reference');
    expect(st.timer?.remaining).toBeLessThan(st.timer?.length ?? 0);
    expect(play(s, ctx(), [act('print_label')]).r.beats[0]).toMatchObject({ stars: 3, points: 15 });
  });
  it('validator: app is required; listing, app and notice are marketplace-only; the notice speaks as the app', () => {
    const noApp = clone(raw('cr33-market-sale.yaml'));
    delete msg(noApp).app;
    expect(schemaErrors(noApp).join('\n')).toMatch(/a marketplace message needs app/);
    const onChat = clone(rawTransfer());
    msg(onChat).listing = { title: 'Lamp', price: '€10.00' };
    msg(onChat).notice = true;
    expect(schemaErrors(onChat).join('\n')).toMatch(/listing \(the listing card\) is for marketplace beats/);
    expect(schemaErrors(onChat).join('\n')).toMatch(/notice \(a system notice from the app\) is for marketplace beats/);
    const wrongSender = clone(raw('cr33-market-sale.yaml'));
    (msg(wrongSender).sender as Raw).display = 'Swaploft Support';
    expect(crossErrors(wrongSender).join('\n')).toMatch(/a notice comes from the app itself: sender.display must be "Swaploft"/);
    const unlisted = clone(raw('cr33-market-sale.yaml'));
    unlisted.brands = ['trundle'];
    expect(crossErrors(unlisted).join('\n')).toMatch(/message.app.brand "swaploft" must be in the scenario's brands/);
    const unknown = clone(raw('cr33-market-sale.yaml'));
    msg(unknown).app = { brand: 'nosuchapp' };
    expect(crossErrors(unknown).join('\n')).toMatch(/message.app.brand "nosuchapp" is not a brand/);
  });
});

// ---------------------------------------------------------------------------

describe('CR-34: code then confirm', () => {
  const s = fixture('cr34-code-confirm.yaml');
  it('sharing the code is non-terminal; Decline scores ★★ (10 points, ruling R18)', () => {
    const mid = run(s, ctx(), [act('send_code')]);
    expect(mid.phase).toBe('playing');
    expect(mid.groups[0]).toMatchObject({ current: 'code_confirm', decision: undefined, codeShared: { id: 'send_code' } });
    expect(viewOf(s, ctx(), mid).checkables.map((c) => c.target)).toEqual(['payee.name']);
    expect(play(s, ctx(), [act('send_code'), act('decline')]).r.beats[0]).toMatchObject({ stars: 2, points: 10, fell: false, capped: true });
  });
  it('"Decline and call Kasia" (verify) is capped at ★★ too (R18); Confirm is the fall', () => {
    expect(play(s, ctx(), [act('send_code'), act('decline_call')]).r.beats[0]).toMatchObject({ stars: 2, points: 10, cls: 'verify', capped: true });
    const fell = run(s, ctx(), [act('send_code'), act('confirm_payment')]);
    expect(fell.phase).toBe('damage_control');
    expect(resultOf(s, B, fell).beats[0]).toMatchObject({ fell: true });
  });
  it('QA-1 (R18, GDD §7): Decline and "Decline and call" outrank Confirm plus a perfect damage-control pick, on stars and on points', () => {
    const fell = run(s, ctx(), [act('send_code'), act('confirm_payment')]);
    expect(fell.phase).toBe('damage_control');
    const best = step(s, ctx(), fell, { type: 'recovery', picks: ['call_bank_stop_payment', 'tell_trusted_adult', 'keep_evidence'] });
    expect(best.recovery?.result).toMatchObject({ lo16: true });
    const fall = resultOf(s, B, best);
    for (const id of ['decline', 'decline_call']) {
      const save = play(s, ctx(), [act('send_code'), act(id)]).r;
      expect(save.beats[0]?.stars, `${id} stars`).toBeGreaterThan(fall.beats[0]?.stars ?? 0);
      expect(save.points, `${id} points`).toBeGreaterThan(fall.points);
      expect(save.stars, `${id} scenario stars`).toBeGreaterThan(fall.stars ?? 0);
    }
  });
  it('without the code, the message\'s own verify scores ★★★', () => {
    expect(play(s, ctx(), [act('call_kasia')]).r.beats[0]).toMatchObject({ stars: 3, points: 15 });
  });
  it('the cap is a balance value and scoreGroup applies it on fraud only', () => {
    expect(B.points.code_then_confirm.star_cap).toBe(2);
    const d = { cls: 'verify' as const, kind: 'call_back_known' as const, actionId: 'x' };
    expect(scoreGroup(B, 'fraud', d, { engagedOnFraud: false, timerExpired: false, codeShared: true })).toMatchObject({ stars: 2, points: 10, capped: true });
    expect(scoreGroup(B, 'legit_low', d, { engagedOnFraud: false, timerExpired: false, codeShared: true })).toMatchObject({ stars: 3, capped: false });
  });
  it('"You chose" names the code, with Decline as the path', () => {
    const { st, r } = play(s, ctx(), [act('send_code'), act('decline')]);
    const g = st.groups[0];
    const b = r.beats[0];
    if (!g || !b) throw new Error('no group');
    expect(choiceLine(s, g, b)).toMatchObject({ kind: 'action', label: 'Make a code and send it to her', path: { then: { label: 'Decline' } } });
  });
  it('validator: share_code leads only to a code confirmation, on fraud; the confirmation offers Confirm and Decline', () => {
    const toPage = clone(raw('cr34-code-confirm.yaml'));
    delete (beat(toPage, 'code_confirm').message as Raw as { payee: Raw }).payee.code_confirm;
    (beat(toPage, 'code_confirm').message as Raw as { payee: Raw }).payee.name_check = 'match';
    expect(schemaErrors(toPage).join('\n')).toMatch(/a share_code with next_beat leads to a banking beat with payee.code_confirm: true/);
    const viaTransfer = clone(raw('cr34-code-confirm.yaml'));
    ((viaTransfer.actions as Raw[])[0] as Raw).kind = 'start_transfer';
    expect(schemaErrors(viaTransfer).join('\n')).toMatch(/only a share_code leads there/);
    const genuine = clone(raw('cr34-code-confirm.yaml'));
    genuine.is_fraud = false;
    genuine.stakes = 'high';
    expect(schemaErrors(genuine).join('\n')).toMatch(/a share_code leads to a code confirmation on fraud scenarios only/);
    const noPay = clone(raw('cr34-code-confirm.yaml'));
    beat(noPay, 'code_confirm').actions = (beat(noPay, 'code_confirm').actions as Raw[]).filter((a) => a.kind !== 'pay');
    (beat(noPay, 'code_confirm').actions as Raw[]).forEach((a) => {
      if (a.id === 'decline_call') a.pressure_target = true;
    });
    delete (noPay.outcomes as Raw).paid_shop;
    expect(ruleErrors(noPay).join('\n')).toMatch(/the code confirmation needs a pay action/);
    const iban = clone(raw('cr34-code-confirm.yaml'));
    (beat(iban, 'code_confirm').message as Raw as { payee: Raw }).payee.iban = 'PL•• •••• 3308';
    expect(schemaErrors(iban).join('\n')).toMatch(/a code confirmation shows no IBAN/);
  });
});

// ---------------------------------------------------------------------------

describe('CR-35 (ruling R14): an engage that ends a boss beat', () => {
  const s = fixture('cr35-boss-off-platform.yaml');
  it('"Move the chat to Brewnook" ends beat 1 at ★★ (10 points); beat 2 still arrives and scores on its own', () => {
    let st = run(s, ctx(), [act('move_to_brewnook')]);
    expect(st.groups[0]).toMatchObject({ resolved: true, engagedOnFraud: true, decision: { cls: 'engage', actionId: 'move_to_brewnook' } });
    expect(st.phase).toBe('consequence');
    st = continueTo(s, st);
    expect(st.groups[1]?.beatId).toBe('collect');
    st = step(s, ctx(), st, act('open_sales'));
    st = continueTo(s, st);
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => [b.stars, b.points])).toEqual([
      [2, 10],
      [3, 15],
    ]);
    // An engage is never "already checked" cover for beat 2's report.
    const reported = continueTo(s, step(s, ctx(), continueTo(s, run(s, ctx(), [act('move_to_brewnook')])), act('block_report')));
    expect(resultOf(s, B, reported).beats[1]).toMatchObject({ covered: false, stars: 2 });
  });
  it('limited to scheduled boss beats at run time: the Alex arc engages still never decide (sceptic round 1)', () => {
    const arcs: [string, string][] = [
      ['berlin/berlin-arc-alex-01.yaml', 'chat_back_alex'],
      ['amsterdam/amsterdam-arc-alex-02.yaml', 'move_to_brewnook'],
      ['paris/paris-arc-alex-03.yaml', 'promise_secret'],
    ];
    for (const [file, id] of arcs) {
      const a = scenarioSchema.parse(readYaml(join(CONTENT, 'scenarios', file)));
      const st = run(a, ctx(), [act(id)]);
      const g = st.groups[0];
      expect(g?.resolved, file).toBe(true);
      expect(g?.decision, file).toBeUndefined();
      expect(resultOf(a, B, st).beats[0]?.cls, file).toBe('dismiss');
    }
    // A standard fraud scenario with an engage outcome (invalid content, but the engine stays as before).
    const f = scenario(rawFraud('f8'));
    const raw8 = clone(f) as unknown as Scenario;
    raw8.actions = [{ ...f.actions[0], next_beat: undefined, outcome: 'left' } as Scenario['actions'][number], ...f.actions.slice(1)];
    expect(run(raw8, ctx(), [act('tap_link')]).groups[0]?.decision).toBeUndefined();
  });
  it('validator: only on a scheduled boss beat continued by a later one (covered_by or the same sender thread)', () => {
    expect(continuesConversation(s, 'start')).toBe(true);
    const uncovered = clone(raw('cr35-boss-off-platform.yaml'));
    delete beat(uncovered, 'collect').covered_by;
    expect(ruleErrors(uncovered).join('\n')).toMatch(/an engage that ends a boss beat needs a later scheduled beat that continues the conversation.*CR-35/);
    // Same sender, same device: the thread continues.
    const thread = clone(uncovered);
    beat(thread, 'collect').device = 'marketplace';
    (beat(thread, 'collect').message as Raw).sender = { display: 'user 3150', detail: 'Swaploft buyer · user 3150' };
    (beat(thread, 'collect').message as Raw).app = { brand: 'swaploft' };
    expect(ruleErrors(thread).join('\n')).not.toMatch(/CR-35/);
    // A standard scenario still needs next_beat on a fraud engage.
    const standard = rawFraud('f9', { actions: [{ id: 'reply_them', label: 'Reply to them', kind: 'reply', outcome: 'left', pressure_target: true }, { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', outcome: 'fine' }], beats: [] });
    (standard.outcomes as Raw).stolen = undefined;
    delete (standard.outcomes as Raw).stolen;
    delete (standard.outcomes as Raw).reported;
    expect(ruleErrors(standard).join('\n')).toMatch(/engage on fraud is never terminal; it needs next_beat/);
  });
});

