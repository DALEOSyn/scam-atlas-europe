/**
 * CR-36 … CR-39 (Rome, Lisbon, Dublin, Stockholm; GDD §26.9, §27.9, §28.9, §29.9) and Dublin Q1 (§28.11):
 * schema, validator rules, checkables and runner behaviour, on the fixtures in tests/fixtures/scenarios.
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { chapterRules, scenarioRules } from '../../../scripts/lib/rules.ts';
import { readYaml, registerCardIssues } from '../../../scripts/lib/content.ts';
import { brandProjection } from '../../../scripts/lib/yaml-module.ts';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { registerEntries } from '../../../src/content/brands.ts';
import { brandSchema, chapterSchema, MASKED_PHONE_RE, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { sequenceOf } from '../../../src/engine/chapter.ts';
import { beginChapter, nextScenarioId } from '../../../src/engine/game.ts';
import { checkablesOf, qrMountText } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { callBehind, startScenario, step, viewOf, type RunnerState } from '../../../src/engine/runner.ts';
import { freshSave } from '../../../src/engine/save.ts';
import { CONTENT, ROOT, realRegistries, scenario } from '../../content/fixtures.ts';
import { act, B, ctx, play, run, tick, type Raw } from './helpers.ts';
import { FIXTURE_DIR, fixtureBrandList, fixtureBrands } from './fixture-brands.ts';
import { rawTransfer } from './cr-fixtures.ts';

const reg = realRegistries();
const raw = (file: string): Raw => readYaml(join(FIXTURE_DIR, file)) as Raw;
const fixture = (file: string): Scenario => scenarioSchema.parse(raw(file));
const clone = <T>(x: T): T => structuredClone(x);
function schemaErrors(r: Raw): string[] {
  const res = scenarioSchema.safeParse(r);
  return res.success ? [] : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}
function ruleErrors(r: Raw): string[] {
  const res = scenarioSchema.safeParse(r);
  if (!res.success) return res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  return scenarioRules(res.data, reg).errors;
}
const msg = (r: Raw): Raw => r.message as Raw;
const ins = (r: Raw): Raw[] => r.inspectables as Raw[];
type Group = RunnerState['groups'][number];

describe('fixtures for CR-36 … CR-39', () => {
  it('there is a fixture for every CR', () => {
    const files = readdirSync(FIXTURE_DIR);
    for (const cr of ['cr36', 'cr37', 'cr38', 'cr39a', 'cr39b']) expect(files.some((f) => f.startsWith(cr)), cr).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe('CR-36: the voice label on calls', () => {
  const s = fixture('cr36-voice-call.yaml');
  it('"voice" follows caller_id in reading order, on calls only', () => {
    expect(deriveCheckables('call', s.message).slice(0, 2)).toEqual(['caller_id', 'voice']);
    const sms = clone(raw('cr36-voice-call.yaml'));
    sms.device = 'sms';
    msg(sms).body = 'It is me, Grandpa. Please send €400 to this account for me today.';
    expect(schemaErrors(sms).join('\n')).toMatch(/voice \(the "Sounds like" label\) is for call beats \(CR-36\)/);
  });
  it('shows "Sounds like {cast name}" in the Check card', () => {
    const item = checkablesOf({ ...s, id: 'start' }).find((c) => c.target === 'voice');
    expect(item).toMatchObject({ shown: 'Sounds like Grandpa Teo', reveal: expect.stringMatching(/can be copied/) });
  });
  it('validator: never a red flag, never "It fits", type voice, always an authored reveal (RM2)', () => {
    const red = clone(raw('cr36-voice-call.yaml'));
    (ins(red).find((i) => i.target === 'voice') as Raw).red_flag = true;
    expect(schemaErrors(red).join('\n')).toMatch(/the voice is never a red flag/);
    const fits = clone(raw('cr36-voice-call.yaml'));
    (ins(fits).find((i) => i.target === 'voice') as Raw).reveal = 'It fits: that is his voice.';
    expect(schemaErrors(fits).join('\n')).toMatch(/a voice reveal never starts with "It fits"/);
    const type = clone(raw('cr36-voice-call.yaml'));
    (ins(type).find((i) => i.target === 'voice') as Raw).type = 'caller_id';
    expect(schemaErrors(type).join('\n')).toMatch(/a voice checkable has type: voice/);
    const elsewhere = clone(raw('cr36-voice-call.yaml'));
    (ins(elsewhere).find((i) => i.target === 'claim') as Raw).type = 'voice';
    expect(schemaErrors(elsewhere).join('\n')).toMatch(/type: voice is only for the voice checkable/);
    const none = clone(raw('cr36-voice-call.yaml'));
    none.inspectables = ins(none).filter((i) => i.target !== 'voice');
    expect(schemaErrors(none).join('\n')).toMatch(/a call with voice needs an inspectable with target: voice/);
  });
  it('validator: the voice is someone in the scenario\'s cast and in cast.yaml; allowed on genuine calls too', () => {
    const notCast = clone(raw('cr36-voice-call.yaml'));
    notCast.cast = [];
    expect(ruleErrors(notCast).join('\n')).toMatch(/voice.sounds_like "teo" is missing from the scenario's cast list \(CR-36\)/);
    const unknown = clone(raw('cr36-voice-call.yaml'));
    msg(unknown).voice = { sounds_like: 'nobody' };
    unknown.cast = ['nobody'];
    expect(ruleErrors(unknown).join('\n')).toMatch(/voice.sounds_like "nobody" is not in content\/cast.yaml/);
    const genuine = clone(raw('cr36-voice-call.yaml'));
    genuine.is_fraud = false;
    expect(schemaErrors(genuine).join('\n')).not.toMatch(/voice/);
  });
  it('scoring is unchanged: calling the saved number is ★★★, sending the money is a fall', () => {
    expect(play(s, ctx(), [act('call_saved_number')]).r.beats[0]).toMatchObject({ stars: 3 });
    expect(run(s, ctx(), [act('send_money')]).phase).toBe('damage_control');
  });
});

// ---------------------------------------------------------------------------

describe('CR-37: how a QR code is attached', () => {
  const s = fixture('cr37-qr-sticker.yaml');
  it('qr.mount follows qr.destination on qr and letter beats when set; never in a chat', () => {
    const order = deriveCheckables('qr', s.message);
    expect(order.indexOf('qr.mount')).toBe(order.indexOf('qr.destination') + 1);
    expect(deriveCheckables('letter', s.message)).toContain('qr.mount');
    expect(deriveCheckables('messenger', s.message)).not.toContain('qr.mount');
    const noMount = { ...(s.message.qr ?? { payload: '', destination: '' }), mount: undefined };
    expect(deriveCheckables('qr', { ...s.message, qr: noMount })).not.toContain('qr.mount');
    const chat = clone(raw('cr39b-chat-qr.yaml'));
    (msg(chat).qr as Raw).mount = 'sticker';
    expect(schemaErrors(chat).join('\n')).toMatch(/qr.mount \(how the code is attached\) is for qr and letter beats \(CR-37\)/);
  });
  it('text alternative (A6): sticker, printed panel, printed letter', () => {
    expect(qrMountText('qr', 'sticker')).toBe('Sticker stuck over the printed code');
    expect(qrMountText('qr', 'printed')).toBe('Printed on it');
    expect(qrMountText('qr', 'printed', 'panel')).toBe('Printed on the panel');
    expect(qrMountText('letter', 'printed')).toBe('Printed on the letter');
    expect(checkablesOf({ ...s, id: 'start' }).find((c) => c.target === 'qr.mount')?.shown).toBe('Sticker stuck over the printed code');
  });
  it('S1: surface names what a printed code is printed on, and needs mount: printed', () => {
    const printed = clone(raw('cr37-qr-sticker.yaml'));
    Object.assign(msg(printed).qr as Raw, { mount: 'printed', surface: 'panel' });
    (ins(printed).find((i) => i.target === 'qr.mount') as Raw).red_flag = false;
    expect(schemaErrors(printed)).toEqual([]);
    expect(checkablesOf({ ...scenarioSchema.parse(printed), id: 'start' }).find((c) => c.target === 'qr.mount')?.shown).toBe('Printed on the panel');
    const sticker = clone(raw('cr37-qr-sticker.yaml'));
    (msg(sticker).qr as Raw).surface = 'panel';
    expect(schemaErrors(sticker).join('\n')).toMatch(/surface names what a printed code is printed on: it needs mount: printed/);
  });
  it('validator: red flag only on a sticker ("printed" is never proof), never "It fits", type qr_mount', () => {
    const printed = clone(raw('cr37-qr-sticker.yaml'));
    (msg(printed).qr as Raw).mount = 'printed';
    expect(schemaErrors(printed).join('\n')).toMatch(/qr.mount can be a red flag only when the code is a sticker/);
    const fits = clone(raw('cr37-qr-sticker.yaml'));
    const m = ins(fits).find((i) => i.target === 'qr.mount') as Raw;
    m.reveal = 'It fits: printed on the panel.';
    m.red_flag = false;
    expect(schemaErrors(fits).join('\n')).toMatch(/a qr.mount reveal never starts with "It fits"/);
    const type = clone(raw('cr37-qr-sticker.yaml'));
    (ins(type).find((i) => i.target === 'qr.mount') as Raw).type = 'qr';
    expect(schemaErrors(type).join('\n')).toMatch(/a qr.mount checkable has type: qr_mount/);
  });
  it('from Lisbon (slot 7) every qr / letter QR code says how it is attached (parity); earlier slots unchanged', () => {
    const noMount = clone(raw('cr37-qr-sticker.yaml'));
    delete (msg(noMount).qr as Raw).mount;
    noMount.inspectables = ins(noMount).filter((i) => i.target !== 'qr.mount');
    const sc = scenarioSchema.parse(noMount);
    const chapter = (slot: number) =>
      chapterSchema.parse({ slot, city: 'testcity', name: 'Test', status: 'draft', patterns: ['qr-sticker-parking'], lo_focus: ['LO-02'], scenario_order: { am: [sc.id], pm: [] }, intro: 'Test.' });
    expect(chapterRules(chapter(7), 'testcity', [sc], reg).errors.join('\n')).toMatch(/sets qr.mount \(printed \| sticker\) from slot 7 on \(CR-37, parity\)/);
    expect(chapterRules(chapter(6), 'testcity', [sc], reg).errors.join('\n')).not.toMatch(/CR-37/);
  });
  it('the destination stays the lesson: open the app yourself is ★★★, scanning leads to the page', () => {
    expect(play(s, ctx(), [act('open_app')]).r.beats[0]).toMatchObject({ stars: 3 });
    expect(viewOf(s, ctx(), run(s, ctx(), [act('scan')])).beat?.id).toBe('fee_page');
  });
});

// ---------------------------------------------------------------------------

describe('CR-38: the Fairmeasure register', () => {
  const s = fixture('cr38-register-check.yaml');
  it('a check_official_list outcome shows its result card on the consequence step', () => {
    const st = step(s, ctx(), startScenario(s, ctx()), act('look_up'));
    expect(st.phase).toBe('consequence');
    expect(viewOf(s, ctx(), st).consequenceRegister).toEqual({ firm: 'Quorvex Wealth', result: 'not_listed' });
    expect(resultOf(s, B, st).beats[0]).toMatchObject({ stars: 3, cls: 'verify' });
    expect(viewOf(s, ctx(), step(s, ctx(), startScenario(s, ctx()), act('report_chat'))).consequenceRegister).toBeNull();
    // Gone once the player continues.
    expect(viewOf(s, ctx(), run(s, ctx(), [act('look_up')])).consequenceRegister).toBeNull();
  });
  it('schema: address and phone only for authorised; the phone is masked; only check_official_list opens a card', () => {
    const addr = clone(raw('cr38-register-check.yaml'));
    ((addr.outcomes as Raw).not_on_register as Raw).register = { firm: 'Quorvex Wealth', result: 'not_listed', address: '1 Main Street' };
    expect(schemaErrors(addr).join('\n')).toMatch(/address and phone are shown for authorised firms only/);
    const phone = clone(raw('cr38-register-authorised.yaml'));
    (((phone.outcomes as Raw).on_register as Raw).register as Raw).phone = '+353 1 555 0142';
    expect(schemaErrors(phone).join('\n')).toMatch(/the register's phone number hides at least 4 digits/);
    const via = clone(raw('cr38-register-check.yaml'));
    ((via.actions as Raw[]).find((a) => a.id === 'report_chat') as Raw).outcome = 'not_on_register';
    delete (via.outcomes as Raw).reported;
    expect(schemaErrors(via).join('\n')).toMatch(/a register result card is reached only by check_official_list actions \(CR-38\)/);
  });
  it('cross-check with brands.yaml: authorised firms show the register\'s own details; not_listed firms are on no list', () => {
    const brands = fixtureBrands();
    const authorised = fixture('cr38-register-authorised.yaml');
    expect(registerCardIssues(authorised, brands)).toEqual([]);
    const wrong = clone(raw('cr38-register-authorised.yaml'));
    (((wrong.outcomes as Raw).on_register as Raw).register as Raw).address = '9 Other Road, Dublin';
    expect(registerCardIssues(scenarioSchema.parse(wrong), brands).join('\n')).toMatch(/shows the register's own address for "Ellisfen Invest": "3 Quillon Street, Dublin"/);
    const notThere = clone(raw('cr38-register-check.yaml'));
    (((notThere.outcomes as Raw).not_on_register as Raw).register as Raw).firm = 'Ellisfen Invest';
    expect(registerCardIssues(scenarioSchema.parse(notThere), brands).join('\n')).toMatch(/"Ellisfen Invest" is on the register in content\/brands.yaml, not "not_listed"/);
    const warned = clone(raw('cr38-register-check.yaml'));
    ((warned.outcomes as Raw).not_on_register as Raw).register = { firm: 'Brindlecove Bonds', result: 'warning_list' };
    expect(registerCardIssues(scenarioSchema.parse(warned), brands)).toEqual([]);
    ((warned.outcomes as Raw).not_on_register as Raw).register = { firm: 'Quorvex Wealth', result: 'warning_list' };
    expect(registerCardIssues(scenarioSchema.parse(warned), brands).join('\n')).toMatch(/must be a brand with register.status: warning_list/);
  });
  it('the scenario clock and the timer stand still while the register is open (freeze reason "register")', () => {
    const c = ctx({ timerMode: 'standard' });
    let st = step(s, c, startScenario(s, c), tick(2));
    const clock = st.clock;
    const left = st.timer?.remaining;
    st = step(s, c, st, { type: 'freeze', reason: 'register', on: true });
    st = step(s, c, st, tick(10));
    expect(st.clock).toBe(clock);
    expect(st.timer?.remaining).toBe(left);
    st = step(s, c, st, { type: 'freeze', reason: 'register', on: false });
    st = step(s, c, st, tick(1));
    expect(st.clock).toBeCloseTo(clock + 1);
  });
  it('a masked phone hides at least 4 digits', () => {
    expect(MASKED_PHONE_RE.test('+353 1 ••• ••42')).toBe(true);
    expect(MASKED_PHONE_RE.test('+353 1 555 •142')).toBe(false);
    expect(MASKED_PHONE_RE.test('+353 1 55• ••42')).toBe(false);
  });
  it('brands.yaml: contact details only for authorised firms, masked phone; the runtime projection carries the lists', () => {
    expect(brandSchema.safeParse({ id: 'x', name: 'X', register: { status: 'warning_list', address: 'Somewhere' } }).success).toBe(false);
    expect(brandSchema.safeParse({ id: 'x', name: 'X', register: { status: 'authorised', phone: '+353 1 555 0142' } }).success).toBe(false);
    const projected = brandProjection({ brands: fixtureBrandList() });
    expect(projected.find((b) => b.id === 'ellisfen')?.register).toEqual({ status: 'authorised', address: '3 Quillon Street, Dublin', phone: '+353 1 ••• ••42' });
    expect(registerEntries(projected).map((e) => [e.name, e.status])).toEqual([
      ['Brindlecove Bonds', 'warning_list'],
      ['Ellisfen Invest', 'authorised'],
    ]);
  });
  it('the shipped brands.yaml projection works without any register entries (the view then lists none)', () => {
    const shipped = brandProjection(parse(readFileSync(join(CONTENT, 'brands.yaml'), 'utf8')));
    expect(registerEntries(shipped).every((e) => e.status === 'authorised' || e.status === 'warning_list')).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe('CR-39(a): the on-call bar over a Gatewren prompt reached from a call', () => {
  const s = fixture('cr39a-call-auth.yaml');
  it('shows the caller, the running call time and the prompt\'s own options (verify first)', () => {
    let st = run(s, ctx({ pushers: true }), [tick(5), act('open_gatewren')]);
    let v = viewOf(s, ctx(), st);
    expect(v.beat?.id).toBe('loan_prompt');
    expect(v.onCall).toMatchObject({ caller: 'Larchwick Bank', callBeatId: 'start', hangUp: ['deny_call_card', 'deny'] });
    expect(v.onCall?.seconds).toBeCloseTo(5);
    st = step(s, ctx({ pushers: true }), st, tick(6));
    v = viewOf(s, ctx(), st);
    expect(v.onCall?.seconds).toBeCloseTo(11);
    expect(v.pusherMessages.map((p) => p.boundTo)).toEqual(['loan_prompt']);
  });
  it('scoring is unchanged: following the caller caps at ★★ (engage), Approve is the fall', () => {
    expect(play(s, ctx(), [act('open_gatewren'), act('deny_call_card')]).r.beats[0]).toMatchObject({ stars: 2, points: 10 });
    expect(run(s, ctx(), [act('open_gatewren'), act('approve')]).phase).toBe('damage_control');
    expect(play(s, ctx(), [act('call_card')]).r.beats[0]).toMatchObject({ stars: 3 });
  });
  it('no bar on the call itself, on a prompt reached from a chat, or for a banking beat reached without start_transfer', () => {
    expect(viewOf(s, ctx(), startScenario(s, ctx())).onCall).toBeNull();
    const chat = fixture('cr39b-chat-qr.yaml');
    const st = run(chat, ctx(), [act('scan')]);
    expect(viewOf(chat, ctx(), st).beat?.id).toBe('buyer_prompt');
    expect(viewOf(chat, ctx(), st).onCall).toBeNull();
    const bank = scenario(rawTransfer());
    expect(callBehind(bank, run(bank, ctx(), [act('start_transfer')]).groups[0] as Group)).toBeUndefined();
  });
  it('the CR-31 banking bar is unchanged', () => {
    const cr31 = scenarioSchema.parse(readYaml(join(FIXTURE_DIR, 'cr31-reserve-call.yaml')));
    const st = run(cr31, ctx(), [act('follow_steps')]);
    expect(viewOf(cr31, ctx(), st).onCall).toMatchObject({ caller: 'Larchwick Bank', hangUp: ['hang_up_call_card', 'hang_up_report', 'hang_up_cancel'] });
  });
});

// ---------------------------------------------------------------------------

describe('CR-39(b): a QR code inside a chat message', () => {
  const s = fixture('cr39b-chat-qr.yaml');
  it('qr.destination is a checkable of the chat, after the body\'s own details; a QR code on other phone devices is rejected', () => {
    expect(deriveCheckables('messenger', s.message)).toEqual(['sender.detail', 'qr.destination', 'claim']);
    const sms = clone(raw('cr39b-chat-qr.yaml'));
    sms.device = 'sms';
    delete (msg(sms).sender as Raw).new_contact;
    expect(schemaErrors(sms).join('\n')).toMatch(/a QR code is shown on qr, letter, messenger beats, not on sms \(CR-39\(b\)\)/);
  });
  it('scan_qr_and_open needs a code on the same beat', () => {
    const noCode = clone(raw('cr39b-chat-qr.yaml'));
    delete msg(noCode).qr;
    msg(noCode).request = 'none';
    noCode.inspectables = ins(noCode).filter((i) => i.target !== 'qr.destination');
    expect(schemaErrors(noCode).join('\n')).toMatch(/scan_qr_and_open needs a QR code on the same beat/);
  });
  it('scanning opens the Gatewren QR-login prompt; Approve is the fall, the platform check after scanning is ★★', () => {
    expect(viewOf(s, ctx(), run(s, ctx(), [act('scan')])).beat?.device).toBe('auth');
    expect(run(s, ctx(), [act('scan'), act('approve')]).phase).toBe('damage_control');
    expect(play(s, ctx(), [act('scan'), act('deny_check')]).r.beats[0]).toMatchObject({ stars: 2 });
    expect(play(s, ctx(), [act('open_swaploft')]).r.beats[0]).toMatchObject({ stars: 3 });
  });
});

// ---------------------------------------------------------------------------

describe('Dublin Q1 (GDD §28.11): the arc beat may be the first beat after the intro', () => {
  const PARIS = resolve(ROOT, 'content', 'scenarios', 'paris');
  const scenarios = readdirSync(PARIS)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => scenarioSchema.parse(readYaml(join(PARIS, f))));
  const paris = chapterSchema.parse(readYaml(join(CONTENT, 'chapters', 'paris.yaml')));
  const arc = paris.arc_beat ?? '';
  const arcFirst = chapterSchema.parse({ ...paris, scenario_order: { am: [arc, ...paris.scenario_order.am], pm: paris.scenario_order.pm.filter((id) => id !== arc) } });
  it('the chapter file validates with am [arc, …]: no new errors or mix issues', () => {
    const before = chapterRules(paris, 'paris', scenarios, reg);
    const after = chapterRules(arcFirst, 'paris', scenarios, reg);
    expect(after.errors).toEqual(before.errors);
    expect(after.warnings).toEqual(before.warnings);
  });
  it('a fresh run plays the arc beat first, then the first scored scenario', () => {
    expect(sequenceOf(arcFirst)[0]).toEqual({ id: arc, half: 'am' });
    const save = beginChapter(freshSave(), 'paris', arcFirst);
    expect(nextScenarioId(save, arcFirst, () => [])).toBe(arc);
  });
});
