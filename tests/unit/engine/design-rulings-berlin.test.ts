/**
 * Design rulings on the Berlin QA playtest (game-designer, 2026-11-19), [FE] items: the ask, boss
 * fall cap, genuine timer expiry, after_beat interrupts, thread history, action order, sender caveat
 * on numbers, shared_code, covered_by. Fixtures only: no Berlin content on this branch.
 */
import { describe, expect, it } from 'vitest';
import { actionRank, chapterRules, scenarioRules } from '../../../scripts/lib/rules.ts';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { alreadyClickedLine, situationOf } from '../../../src/engine/recovery.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { step, viewOf, type RunnerEvent, type RunnerState } from '../../../src/engine/runner.ts';
import { segmentMessage } from '../../../src/ui/text.ts';
import { rawFraud, rawGenuine, realRegistries, scenario, validChapter } from '../../content/fixtures.ts';
import { act, B, boss, ctx, jonasAfter, run, tick, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const cont: RunnerEvent = { type: 'continue' };
const reg = realRegistries();
const issues = (raw: Raw): string[] => {
  const r = scenarioSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

/** The fixture boss with an ask on its call beat (the caller's line) and its request inspectable. */
function askBoss(over: Raw = {}): Scenario {
  const b = boss();
  const raw = structuredClone(b) as unknown as Raw;
  const beats = raw.beats as Raw[];
  const call = beats.find((x) => x.id === 'support_call') as Raw;
  (call.message as Raw).ask = { text: 'Read me the code to stop the payment.' };
  (call.inspectables as Raw[]).push({ target: 'request', reveal: 'The code text says it approves a payment of EUR 900.', red_flag: true, type: 'request' });
  return scenario({ ...raw, ...over });
}

describe('1. message.ask is the request checkable (QA L1)', () => {
  it('the ask adds the request checkable, with the ask as "You see"; the banner adds none', () => {
    const s = askBoss();
    const call = s.beats.find((b) => b.id === 'support_call');
    if (!call) throw new Error('fixture');
    expect(deriveCheckables(call.device, call.message)).toContain('request');
    expect(checkablesOf(call).find((c) => c.target === 'request')).toMatchObject({ shown: 'Read me the code to stop the payment.', device: 'call' });
    const plain = boss().beats.find((b) => b.id === 'support_call');
    if (!plain) throw new Error('fixture');
    expect(deriveCheckables(plain.device, plain.message)).not.toContain('request');
  });

  it('ask.text is a whole request: at least 4 words (sceptic T-2.8)', () => {
    const raw = structuredClone(askBoss()) as unknown as Raw;
    const call = (raw.beats as Raw[]).find((b) => b.id === 'support_call') as Raw;
    (call.message as Raw).ask = { text: 'the code' };
    expect(issues(raw).join('\n')).toMatch(/at least 4 words/);
    (call.message as Raw).ask = { text: 'Read me the code' };
    expect(issues(raw)).toEqual([]);
  });

  it('the quoted span is highlighted in the caller line where it stands', () => {
    const call = askBoss().beats.find((b) => b.id === 'support_call');
    if (!call) throw new Error('fixture');
    const segs = segmentMessage(call.message);
    expect(segs.transcript[0]).toEqual([{ kind: 'check', target: 'request', text: 'Read me the code to stop the payment.' }]);
  });

  it('from slot 1 on a share_code / approve beat needs an ask; Home (slot 0) is exempt', () => {
    const { chapter } = validChapter();
    const s = boss({ id: 'boss-no-ask' });
    const msgs = (c: typeof chapter) => chapterRules({ ...c, scenario_order: { am: [], pm: [s.id] }, boss: s.id }, c.city, [s], reg).errors.join('\n');
    expect(msgs({ ...chapter, slot: 1 })).toMatch(/beat "support_call": request share_code needs message.ask/);
    expect(msgs({ ...chapter, slot: 0 })).not.toMatch(/needs message.ask/);
    const withAsk = askBoss({ id: 'boss-ask' });
    expect(chapterRules({ ...chapter, slot: 1, scenario_order: { am: [], pm: [withAsk.id] }, boss: withAsk.id }, chapter.city, [withAsk], reg).errors.join('\n')).not.toMatch(/needs message.ask/);
  });
});

describe('2. a fall in any boss beat caps the boss stars (QA L3)', () => {
  const fallAt3 = (picks: string[]) => {
    const s = boss();
    let st: RunnerState = run(s, ctx({ timerMode: 'off' }), [act('open_app'), cont, act('check_app_2'), cont, act('read_code'), cont]);
    expect(st.phase).toBe('damage_control');
    st = step(s, ctx({ timerMode: 'off' }), st, { type: 'recovery', picks });
    return { s, st, r: resultOf(s, B, st) };
  };
  it('3/3/fall with damage control 9 → ★ and 39 points; the breakdown says why', () => {
    const { s, st, r } = fallAt3(['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online']);
    expect(r.beats.map((b) => b.stars)).toEqual([3, 3, 0]);
    expect(r).toMatchObject({ stars: 1, points: 39, bossFallCap: true });
    expect(debriefOf(s, st, r, none).layer2.points?.bossFallCap).toBe(true);
  });
  it('3/3/fall with damage control 3 → 0 stars and 33 points', () => {
    const { r } = fallAt3(['block_card_in_bank_app']);
    expect(r).toMatchObject({ stars: 0, points: 33 });
  });
  it('no fall: the rounded mean as before, no cap line', () => {
    const s = boss();
    const st = run(s, ctx({ timerMode: 'off' }), [act('open_app'), cont, act('report_2'), cont, act('hang_up'), { type: 'what_now', choice: 'call_back_known' }]);
    expect(resultOf(s, B, st)).toMatchObject({ stars: 3, bossFallCap: false });
  });
});

describe('3. timer expiry on genuine high stakes (QA L4)', () => {
  it('scores ★ and 5 in slot 1, and the validator wants honest_deadline on any genuine timed scenario', () => {
    const raw = rawGenuine('g-high', { stakes: 'high', message: { sender: { display: 'Thimble & Pine', detail: 'orders@thimble-pine.example' }, body: 'Payment failed. Update your card at thimble-pine.example/account', request: 'enter_details' } });
    const s = scenario({ ...raw, pressure: { timer: true, levers: [], honest_deadline: 'Order held 48 hours' } });
    const st = run(s, ctx(), [tick(1000)]);
    const r = resultOf(s, B, st);
    expect(r.beats[0]).toMatchObject({ stars: 1, points: 5, timerExpired: true });
    expect(debriefOf(s, st, r, none).layer2).toMatchObject({ deadline: 'genuine', honestDeadline: 'Order held 48 hours' });
    const missing = scenario({ ...rawGenuine(), pressure: { timer: true, levers: [] } });
    expect(scenarioRules(missing, reg).errors.join('\n')).toMatch(/genuine timed scenario needs pressure.honest_deadline/);
  });
});


describe('4. after_beat interrupts (QA M6)', () => {
  const c = ctx({ timerMode: 'off', stress: 0 });
  it('exactly one of at_seconds or after_beat; after_beat names a beat', () => {
    const raw = structuredClone(jonasAfter('support_call')) as unknown as Raw;
    expect(issues(raw)).toEqual([]);
    (raw.interrupts as Raw[])[0] = { ...(raw.interrupts as Raw[])[0], at_seconds: 5 };
    expect(issues(raw).join('\n')).toMatch(/exactly one of at_seconds or after_beat/);
    const bad = structuredClone(jonasAfter('support_call')) as unknown as Raw;
    (bad.interrupts as Raw[])[0] = { ...(bad.interrupts as Raw[])[0], after_beat: 'nowhere' };
    expect(issues(bad).join('\n')).toMatch(/after_beat "nowhere" is not a beat id/);
  });

  it('hang up: it waits until the "What now?" choice is made (CR-27 ruling), then arrives with its stress', () => {
    const s = jonasAfter('support_call');
    const before = run(s, c, [act('open_app'), cont, act('report_2'), cont]);
    let st = step(s, c, before, act('hang_up'));
    expect(st.phase).toBe('what_now');
    expect(st.interrupts[0]?.arrived).toBe(false);
    expect(viewOf(s, c, st).interrupts).toEqual([]);
    st = step(s, c, st, { type: 'what_now', choice: 'report' });
    expect(st.interrupts[0]).toMatchObject({ arrived: false, due: true });
    const preArrival = st;
    while (st.phase === 'consequence') st = step(s, c, st, cont);
    expect(st.phase).toBe('interrupt');
    expect(st.interrupts[0]?.arrived).toBe(true);
    expect(st.stress).toBe(preArrival.stress + B.stress.on_interrupt);
    expect(run(s, c, [act('open_app'), cont, act('report_2'), cont, act('hang_up'), { type: 'what_now', choice: 'report' }])).toMatchObject({ phase: 'interrupt', stress: st.stress });
    expect(viewOf(s, c, st).interrupts.map((i) => i.id)).toEqual(['jonas']);
  });

  it('a fall: on_fall skip (default) drops it, no cheerful message after damage control (CR-27)', () => {
    const s = jonasAfter('support_call');
    let st = step(s, c, run(s, c, [act('open_app'), cont, act('report_2'), cont]), act('read_code'));
    expect(st.phase).toBe('consequence');
    expect(st.interrupts[0]?.skipped).toBe(true);
    st = step(s, c, st, cont);
    expect(st.phase).toBe('damage_control');
    st = step(s, c, st, { type: 'recovery', picks: ['block_card_in_bank_app'] });
    expect(st.phase).toBe('done');
    expect(st.interrupts[0]?.arrived).toBe(false);
    const d = debriefOf(s, st, resultOf(s, B, st), none);
    expect(d.layer2.narratives).not.toContain('Jonas: see you later.');
  });

  it('a fall with on_fall: show: it waits until after damage control, as its own step, and the debrief waits for the answer', () => {
    const raw = structuredClone(jonasAfter('support_call')) as unknown as Raw;
    (raw.interrupts as Raw[])[0] = { ...(raw.interrupts as Raw[])[0], on_fall: 'show' };
    const s = scenario(raw);
    let st = step(s, c, run(s, c, [act('open_app'), cont, act('report_2'), cont]), act('read_code'));
    expect(st.phase).toBe('consequence');
    expect(viewOf(s, c, st).interrupts).toEqual([]);
    st = step(s, c, st, cont);
    expect(st.phase).toBe('damage_control');
    expect(st.interrupts[0]?.arrived).toBe(false);
    st = step(s, c, st, { type: 'recovery', picks: ['block_card_in_bank_app'] });
    expect(st.phase).toBe('interrupt');
    expect(viewOf(s, c, st).interrupts.map((i) => i.id)).toEqual(['jonas']);
    st = step(s, c, st, { type: 'interrupt_act', interruptId: 'jonas', actionId: 'thanks' });
    expect(st.phase).toBe('consequence');
    const v = viewOf(s, c, st);
    expect(v).toMatchObject({ consequence: null, consequenceDeadline: null, consequenceAsides: ['Jonas: see you later.'] });
    st = step(s, c, st, cont);
    expect(st.phase).toBe('done');
    const d = debriefOf(s, st, resultOf(s, B, st), none);
    expect(d.layer2.narratives.at(-1)).toBe('Jonas: see you later.');
  });

  it('on_fall is for after_beat interrupts only', () => {
    const raw = structuredClone(jonasAfter('support_call')) as unknown as Raw;
    (raw.interrupts as Raw[])[0] = { ...(raw.interrupts as Raw[])[0], after_beat: undefined, at_seconds: 5, on_fall: 'show' };
    expect(issues(raw).join('\n')).toMatch(/on_fall is for after_beat interrupts/);
  });

  it('a beat that is not the last: it arrives when the next beat starts', () => {
    const s = jonasAfter('invoice');
    let st = run(s, c, [act('open_app'), cont, act('report_2')]);
    expect(st.interrupts[0]).toMatchObject({ arrived: false, due: true });
    st = step(s, c, st, cont);
    expect(st.groups.at(-1)?.beatId).toBe('support_call');
    expect(st.interrupts[0]?.arrived).toBe(true);
  });
});

describe('5. message.earlier (QA L5)', () => {
  const earlier = [{ when: 'Yesterday', body: 'Trundle: your parcel TR-1 is on its way. Track it at trundle.example/t/1', lang: 'en' }];
  it('sms, messenger and email (CR-25) only, at most 3, never checkable', () => {
    const raw = rawFraud();
    (raw.message as Raw).earlier = earlier;
    expect(issues(raw)).toEqual([]);
    const s = scenario(raw);
    expect(deriveCheckables(s.device, s.message)).toEqual(deriveCheckables(scenario(rawFraud()).device, scenario(rawFraud()).message));
    const four = rawFraud();
    (four.message as Raw).earlier = [...earlier, ...earlier, ...earlier, ...earlier];
    expect(issues(four).join('\n')).toMatch(/earlier/);
    const mail = structuredClone(boss()) as unknown as Raw;
    ((mail.beats as Raw[]).find((b) => b.id === 'invoice')?.message as Raw).earlier = earlier;
    expect(issues(mail).join('\n')).not.toMatch(/earlier/);
    const call = structuredClone(boss()) as unknown as Raw;
    ((call.beats as Raw[]).find((b) => b.id === 'support_call')?.message as Raw).earlier = earlier;
    expect(issues(call).join('\n')).toMatch(/earlier \(thread history\) is for sms, messenger and email messages only/);
    const foreign = rawFraud();
    (foreign.message as Raw).earlier = [{ when: 'Gestern', body: 'Ihr Paket ist unterwegs.', lang: 'de' }];
    expect(issues(foreign).join('\n')).toMatch(/needs an inline translation/);
  });
});

describe('6. action_order (QA L6)', () => {
  it('ranks: own action, verify, other doing actions, report, dismiss', () => {
    const s = scenario(rawFraud());
    expect(s.actions.map((a) => actionRank(s.message, s.actions, a, B))).toEqual([1, 2, 4]);
    expect(scenarioRules(s, reg).errors.join('\n')).not.toMatch(/action_order/);
    const swapped = rawFraud();
    const acts = swapped.actions as Raw[];
    swapped.actions = [acts[1], acts[0], acts[2]];
    expect(scenarioRules(scenario(swapped), reg).errors.join('\n')).toMatch(/opening message: action_order: "tap_link" \(the message's own action\) comes after "open_app" \(verify\)/);
  });
  it('request: none → the first proceed/engage/comply action is the message\'s own', () => {
    const s = scenario(rawGenuine());
    const ranks = s.actions.map((a) => actionRank(s.message, s.actions, a, B));
    expect(ranks[0]).toBe(1);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });
});

describe('7. sender caveat on a number (QA m9)', () => {
  it('a sender shown as a phone number gets the number caveat', () => {
    const raw = rawFraud();
    (raw.message as Raw).sender = { display: '+49 151 •••• 0173', detail: '+49 151 •••• 0173' };
    const s = scenario(raw);
    const st = run(s, ctx(), [act('open_app')]);
    const d = debriefOf(s, st, resultOf(s, B, st), none);
    expect(d.layer2.flags.find((f) => f.target === 'sender.detail')?.senderCaveat).toBe('number');
  });
});

describe('8. shared_code (QA m10)', () => {
  it('severity paid > shared_code > entered_details > clicked; required where codes are shared', () => {
    expect(situationOf(['enter_details', 'share_code'])).toBe('shared_code');
    const s = { debrief: { already_clicked: { entered_details: 'E', shared_code: 'S' } } } as Parameters<typeof alreadyClickedLine>[0];
    expect(alreadyClickedLine(s, 'shared_code')).toEqual({ situation: 'shared_code', text: 'S' });
    expect(alreadyClickedLine(s, undefined)).toEqual({ situation: 'entered_details', text: 'E' });
    const errs = scenarioRules(boss(), reg).errors.join('\n');
    expect(errs).toMatch(/already_clicked.shared_code is required/);
  });
});

describe('9. boss covered_by (QA fun note a)', () => {
  const covered = (): Scenario => {
    const raw = structuredClone(boss()) as unknown as Raw;
    const inv = (raw.beats as Raw[]).find((b) => b.id === 'invoice') as Raw;
    inv.covered_by = ['start'];
    return scenario(raw);
  };
  const c = ctx({ timerMode: 'off' });
  it('verify on the covering beat: report here scores as verify, with the "already checked" line', () => {
    const s = covered();
    const st = run(s, c, [act('open_app'), cont, act('report_2')]);
    expect(st.phase).toBe('consequence');
    expect(viewOf(s, c, st).consequenceCovered).toBe(true);
    const done = run(s, c, [act('open_app'), cont, act('report_2'), cont, act('hang_up'), { type: 'what_now', choice: 'call_back_known' }]);
    const r = resultOf(s, B, done);
    expect(r.beats[1]).toMatchObject({ stars: 3, points: 15, covered: true, cls: 'verify' });
  });
  it('no verify on the covering beat, or a payment here: no cover', () => {
    const s = covered();
    const reported = run(s, c, [act('report_it'), cont, act('report_2')]);
    expect(viewOf(s, c, reported).consequenceCovered).toBe(false);
    const paid = run(s, c, [act('open_app'), cont, act('pay_invoice')]);
    expect(resultOf(s, B, { ...paid, phase: 'done' }).beats[1]).toMatchObject({ fell: true, covered: false });
  });
  it('validator: boss only, earlier scheduled beats only', () => {
    const raw = structuredClone(boss()) as unknown as Raw;
    ((raw.beats as Raw[]).find((b) => b.id === 'invoice') as Raw).covered_by = ['support_call'];
    expect(scenarioRules(scenario(raw), reg).errors.join('\n')).toMatch(/covered_by "support_call" must be an earlier scheduled beat/);
  });
});
