/** CR-27 (Paris QA playtest): engine and schema parts. UI parts are in tests/unit/cr27-ui.test.tsx. */
import { describe, expect, it } from 'vitest';
import { scenarioSchema } from '../../../src/content/schema.ts';
import { choiceLineText, choicePathText } from '../../../src/engine/choiceText.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { beatById, coveredDecision, startScenario, step, viewOf, type RunnerEvent } from '../../../src/engine/runner.ts';
import { lookup } from '../../../src/i18n/index.ts';
import { rawFraud, scenario } from '../../content/fixtures.ts';
import { beatOf, rawBoss, rawTransfer } from './cr-fixtures.ts';
import { act, B, boss, ctx, run, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const cont: RunnerEvent = { type: 'continue' };
const issues = (raw: Raw): string[] => {
  const r = scenarioSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('CR-27 schema', () => {
  it('setup is an optional scenario string', () => {
    expect(issues({ ...rawFraud(), setup: '18:40, the last working day before the long weekend.' })).toEqual([]);
    expect(issues({ ...rawFraud(), setup: '' }).join('\n')).toMatch(/setup/);
    expect(scenario(rawFraud()).setup).toBeUndefined();
  });
  it('message.bank (the bank app header) is for banking beats only', () => {
    const raw = rawTransfer();
    (beatOf(raw, 'bank').message as Raw).bank = { brand: 'larchwick-pro' };
    expect(issues(raw)).toEqual([]);
    const bad = rawTransfer();
    (bad.message as Raw).bank = { brand: 'larchwick-pro' };
    expect(issues(bad).join('\n')).toMatch(/bank \(the bank app header\) is for banking beats/);
  });
  it('interrupt on_fall defaults to skip', () => {
    const raw = structuredClone(boss()) as unknown as Raw;
    raw.interrupts = [
      {
        id: 'ines',
        after_beat: 'support_call',
        is_fraud: false,
        device: 'messenger',
        message: { sender: { display: 'Inès' }, body: 'Have a good long weekend!', request: 'none' },
        actions: [{ id: 'bye', label: 'Say bye', kind: 'proceed', outcome: 'hung_up' }],
      },
    ];
    expect(scenario(raw).interrupts[0]?.on_fall).toBe('skip');
  });
});

describe('CR-27 item 3: the bank-card timer always runs out', () => {
  it('checks push the timer to the 1 s floor; it still escalates and expires on the bank card', () => {
    const s = scenario(rawTransfer('t1', true, { pressure: { timer: true, levers: ['urgency'] } }));
    const c = ctx({ pushers: false });
    let st = step(s, c, startScenario(s, c), act('start_transfer'));
    // Every first check costs 2 s and never expires the timer by itself: down to the 1 s floor.
    for (let i = 0; i < 40 && (st.timer?.remaining ?? 0) > 1; i++) st = { ...st, timer: st.timer ? { ...st.timer, remaining: Math.max(1, st.timer.remaining - 2) } : null };
    for (const target of ['payee.name_check', 'payee.iban']) st = step(s, c, st, { type: 'check', beatId: 'bank', target });
    expect(st.timer?.remaining).toBe(1);
    let escalated = false;
    for (let i = 0; i < 400 && st.phase === 'playing'; i++) {
      st = step(s, c, st, { type: 'tick', dt: 0.2 + (i % 7) * 0.013 });
      if (st.log.some((e) => e.type === 'timer' && e.what === 'escalated')) escalated = true;
    }
    expect(escalated).toBe(true);
    expect(st.groups[0]?.timerExpired).toBe(true);
  });
});

describe('CR-27 item 4: after_beat interrupts after "What now?"', () => {
  it('a fall in an earlier beat drops a later after_beat interrupt (skip)', () => {
    const raw = structuredClone(boss()) as unknown as Raw;
    raw.interrupts = [
      {
        id: 'ines',
        after_beat: 'support_call',
        is_fraud: false,
        device: 'messenger',
        message: { sender: { display: 'Inès' }, body: 'Have a good long weekend!', request: 'none' },
        actions: [{ id: 'bye', label: 'Say bye', kind: 'proceed', outcome: 'hung_up' }],
      },
    ];
    const s = scenario(raw);
    const c = ctx({ timerMode: 'off', stress: 0 });
    const st = run(s, c, [act('tap_link'), act('enter_card')]);
    expect(st.interrupts[0]?.skipped).toBe(true);
  });
});

describe('CR-27 item 7: "You chose" after an engage and another final choice', () => {
  const s = boss();
  const c = ctx({ timerMode: 'off' });
  const toCall = [act('open_app'), cont, act('report_2'), cont, act('hang_up')];
  it('engage extra, then "Leave it there": layer 1 names the final choice (★★, as dismiss scores), layer 2 the path', () => {
    const st = run(s, c, [...toCall, { type: 'what_now', choice: 'call_this_number' }, { type: 'what_now', choice: 'done' }]);
    const r = resultOf(s, B, st);
    expect(r.beats[2]).toMatchObject({ stars: 2, capped: true, cls: 'dismiss' });
    const d = debriefOf(s, st, r, none);
    const line = [...d.layer1.youChose, ...d.layer2.youChoseOther.map((x) => x.line)].find((l) => l.beatId === 'support_call');
    expect(line && choiceLineText(line, lookup)).toBe('You hung up and left it there.');
    expect(d.layer2.choicePaths.map((l) => choicePathText(l, lookup))).toEqual(['You chose: Call back this number, then Leave it there.']);
  });
  it('engage extra, then the call-back: the engage cost the star, so it is named; the path uses call_back_label', () => {
    const st = run(s, c, [...toCall, { type: 'what_now', choice: 'call_this_number' }, { type: 'what_now', choice: 'call_back_known' }]);
    const r = resultOf(s, B, st);
    expect(r.beats[2]).toMatchObject({ stars: 2, capped: true, cls: 'verify' });
    const d = debriefOf(s, st, r, none);
    const line = [...d.layer1.youChose, ...d.layer2.youChoseOther.map((x) => x.line)].find((l) => l.beatId === 'support_call');
    expect(line && choiceLineText(line, lookup)).toBe('You chose: Call back this number.');
    expect(d.layer2.choicePaths.map((l) => choicePathText(l, lookup))).toEqual(['You chose: Call back this number, then Call the number on your card.']);
  });
  it('a covered beat with an engage on it is not "already checked": the caption never contradicts ★★', () => {
    const raw = rawBoss();
    const call = beatOf(raw, 'lawyer_call');
    call.actions = [
      { id: 'ring_back', label: 'Call back the number he gave', kind: 'call_number_in_message', next_beat: 'lawyer_page' },
      { id: 'report_call', label: 'Report the call', kind: 'report', outcome: 'reported' },
    ];
    (raw.beats as Raw[]).push({
      id: 'lawyer_page',
      device: 'call',
      message: { sender: { display: '+33 1 •• •• •• 07' }, transcript: [{ speaker: 'caller', text: 'Cabinet Ostrelle, how can I help?' }], request: 'none' },
      actions: [{ id: 'hang_up_again', label: 'Leave it there', kind: 'ignore', outcome: 'left' }],
    });
    const bs = scenario(raw);
    const cc = ctx({ timerMode: 'off' });
    let st = step(bs, cc, run(bs, cc, [act('call_solene'), cont, act('ring_back')]), act('hang_up_again'));
    expect(st.phase).toBe('consequence');
    const g = st.groups[1];
    expect(g && coveredDecision(bs, st.groups, g).covered).toBe(false);
    expect(viewOf(bs, cc, st).consequenceCovered).toBe(false);
    st = step(bs, cc, st, cont);
    expect(resultOf(bs, B, st).beats[1]).toMatchObject({ covered: false, stars: 2 });
    // Without the engage, the same beat is covered as before.
    const plain = step(bs, cc, run(bs, cc, [act('call_solene'), cont]), act('report_call'));
    expect(viewOf(bs, cc, plain).consequenceCovered).toBe(true);
  });
});

describe('CR-27 item 2: checkables carry the message language', () => {
  it('ask and claims carry lang and translation; language-neutral details do not; English carries nothing', () => {
    const raw = rawTransfer();
    raw.message = {
      ...(raw.message as Raw),
      body: 'Merci de payer 84 € sur mon nouveau compte. Je te rembourse demain sans faute.',
      lang: 'fr',
      translation: 'Please pay €84 into my new account. I will pay you back tomorrow without fail.',
      references: ['Loyer'],
      ask: { text: 'Merci de payer 84 € sur mon nouveau compte.', translation: 'Please pay €84 into my new account.' },
      claims: [{ text: 'Je te rembourse demain sans faute.', translation: 'I will pay you back tomorrow without fail.' }],
    };
    const s = scenario(raw);
    const items = checkablesOf(beatById(s, 'start') as NonNullable<ReturnType<typeof beatById>>);
    expect(items.find((x) => x.target === 'request')).toMatchObject({ lang: 'fr', translation: 'Please pay €84 into my new account.' });
    expect(items.find((x) => x.target === 'claim')).toMatchObject({ lang: 'fr', translation: 'I will pay you back tomorrow without fail.' });
    expect(items.find((x) => x.target === 'reference')?.lang).toBeUndefined();
    const en = checkablesOf(beatById(scenario(rawTransfer()), 'start') as NonNullable<ReturnType<typeof beatById>>);
    expect(en.every((x) => x.lang === undefined && x.translation === undefined)).toBe(true);
  });
});
