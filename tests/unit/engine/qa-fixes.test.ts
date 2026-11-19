/** QA playtest findings E1–E10 for T-2.1 and the producer decisions that came with them. */
import { describe, expect, it } from 'vitest';
import { summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { beginChapter, commitScenario, nextScenarioId } from '../../../src/engine/game.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { step, viewOf } from '../../../src/engine/runner.ts';
import { freshSave, parseSave } from '../../../src/engine/save.ts';
import { startTimer, tickTimer } from '../../../src/engine/timer.ts';
import { format } from '../../../src/i18n/index.ts';
import { i18nCatalogueSchema } from '../../../src/content/schema.ts';
import { rawFraud, rawGenuine, scenario } from '../../content/fixtures.ts';
import { act, B, boss, check, ctx, play, run, tick, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };

describe('QA E1: a boss beat that times out has a consequence to show', () => {
  it('flags the timer expiry instead of an empty narrative', () => {
    const s = boss();
    const st = run(s, ctx(), [tick(B.timers.boss_beat), tick(B.timers.escalation_extra_seconds)]);
    expect(st.phase).toBe('consequence');
    const v = viewOf(s, ctx(), st);
    expect(v.consequence).toBeNull();
    expect(v.consequenceTimerExpired).toBe(true);
  });
});

describe('QA E2: drills are unscored in the debrief', () => {
  it('no stars, points or "You chose" line', () => {
    const s = scenario(rawGenuine('d1', { role: 'drill', stakes: undefined, pattern: undefined, theme: undefined }));
    const { st, r } = play(s, ctx(), [act('report_it')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1).toMatchObject({ stars: null, youChose: [] });
    expect(d.layer2.points).toBeNull();
    expect(r.scored).toBe(false);
  });
});

describe('QA E3/E10: view details', () => {
  it('"k checked" counts the beat on screen only', () => {
    const s = boss();
    let st = run(s, ctx(), [check('link'), check('sender.detail'), act('open_app'), { type: 'continue' }]);
    expect(viewOf(s, ctx(), st).checkedCount).toBe(0);
    st = step(s, ctx(), st, check('link', 'invoice'));
    expect(viewOf(s, ctx(), st).checkedCount).toBe(1);
  });

  it('unanswered interrupts are hidden during consequence and damage control', () => {
    const s = scenario({
      ...rawFraud(),
      interrupts: [{ id: 'jonas', at_seconds: 5, is_fraud: false, device: 'messenger', message: { sender: { display: 'Jonas', detail: '+49 •••• 0101' }, body: 'Hi!', request: 'none' }, actions: [{ id: 'thanks', label: 'Thanks', kind: 'proceed', outcome: 'fine' }] }],
    });
    const playing = run(s, ctx(), [tick(6)]);
    expect(viewOf(s, ctx(), playing).interrupts).toHaveLength(1);
    const fell = step(s, ctx(), step(s, ctx(), playing, act('tap_link')), act('enter_card'));
    expect(fell.phase).toBe('consequence');
    expect(viewOf(s, ctx(), fell).interrupts).toEqual([]);
    const dc = step(s, ctx(), fell, { type: 'continue' });
    expect(dc.phase).toBe('damage_control');
    expect(viewOf(s, ctx(), dc).interrupts).toEqual([]);
  });
});

describe('QA E4: narratives are said once', () => {
  it('a boss reaching the same outcome twice shows it once', () => {
    const s = boss();
    const { st, r } = play(s, ctx(), [act('open_app'), { type: 'continue' }, act('check_app_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'done' }]);
    expect(r.outcomes).toEqual(['fine', 'fine', 'hung_up']);
    expect(debriefOf(s, st, r, none).layer2.narratives).toEqual(['No fee.', 'The line goes quiet.']);
  });
});

describe('QA E5: one announcement when half time is also "10 s left"', () => {
  it('a 20 s timer crossing 10 s announces ten_left only', () => {
    expect(tickTimer(B, startTimer(20), 10.5, 'standard').events).toEqual(['ten_left']);
    expect(tickTimer(B, startTimer(60), 31, 'standard').events).toEqual(['half']);
  });
});

describe('QA E6: pause only while a message is live', () => {
  it('ignored during the consequence step', () => {
    const s = boss();
    const st = run(s, ctx(), [act('open_app')]);
    expect(st.phase).toBe('consequence');
    expect(step(s, ctx(), st, { type: 'pause' })).toBe(st);
    expect(viewOf(s, ctx(), st).pause.available).toBe(false);
  });
});

describe('QA E7: spotted for display is floored at 0 and capped at R', () => {
  const rec = (correct: number, wrong: number, redFlags: number): ScenarioRecord => ({ id: 'x', scored: true, points: 0, maxPoints: 15, stars: 0, correctTags: correct, wrongTags: wrong, redFlags, genuineReported: 0, doubleCheckedHarmless: false, pattern: null });
  it('net stays for the stamp rules', () => {
    expect(summarise(B, { patterns: [] }, [rec(1, 4, 2)], true)).toMatchObject({ spotted: -3, spottedShown: 0 });
    expect(summarise(B, { patterns: [] }, [rec(3, 0, 2)], true)).toMatchObject({ spotted: 3, spottedShown: 2 });
  });
});

describe('QA E8: a corrupt run index never skips the chapter', () => {
  it('is bounded when loading and clamped to the sequence', () => {
    const { save } = parseSave(JSON.stringify({ version: 1, chapters: { testcity: { run: { index: 1e9, records: [] } } } }));
    expect(save.chapters.testcity?.run?.index).toBe(100);
    const chapter = { city: 'testcity', scenario_order: { am: ['a'], pm: ['b'] } };
    expect(nextScenarioId(save, chapter, () => [])).toBeNull();
    const neg = parseSave(JSON.stringify({ version: 1, chapters: { testcity: { run: { index: -5, records: [] } } } })).save;
    expect(nextScenarioId(neg, chapter, () => [])).toBe('a');
  });
});

describe('QA E9: ICU plurals', () => {
  const msg = '{count, plural, one {# new message is waiting.} other {# new messages are waiting.}}';
  it('formats and validates', () => {
    expect(format(msg, { count: 1 })).toBe('1 new message is waiting.');
    expect(format(msg, { count: 3 })).toBe('3 new messages are waiting.');
    expect(format('{n, plural, =0 {none} other {# left}}', { n: 0 })).toBe('none');
    expect(i18nCatalogueSchema.safeParse({ waiting: msg }).success).toBe(true);
    expect(i18nCatalogueSchema.safeParse({ bad: '{count, plural, one {x}}' }).success).toBe(false);
    expect(i18nCatalogueSchema.safeParse({ bad: '{count, select, a {x} other {y}}' }).success).toBe(false);
  });
});

describe('producer decisions', () => {
  it('built-in "What now?" choices may have their own outcome, else the hang-up outcome', () => {
    const base = boss();
    const raw = { ...base, outcomes: { ...base.outcomes, bank_never_called: { narrative: 'Your bank: we never called.' } } } as Raw;
    raw.beats = base.beats.map((b) => (b.what_now ? { ...b, what_now: { ...b.what_now, outcomes: { call_back_known: 'bank_never_called' } } } : b));
    const s = scenario(raw);
    const go = [act('open_app'), { type: 'continue' as const }, act('check_app_2'), { type: 'continue' as const }, act('hang_up')];
    expect(resultOf(s, B, run(s, ctx(), [...go, { type: 'what_now', choice: 'call_back_known' }])).outcomes.at(-1)).toBe('bank_never_called');
    expect(resultOf(s, B, run(s, ctx(), [...go, { type: 'what_now', choice: 'done' }])).outcomes.at(-1)).toBe('hung_up');
  });

  it('a replay keeps the best attempt per scenario in the chapter record', () => {
    const s = scenario(rawFraud('f1'));
    const chapter = { city: 'testcity', scenario_order: { am: ['f1'], pm: [] } };
    const commit = (save: ReturnType<typeof freshSave>, events: Parameters<typeof run>[2]) => {
      const st = run(s, ctx(), events);
      return commitScenario(save, B, chapter, s, st, resultOf(s, B, st));
    };
    let save = commit(beginChapter(freshSave(), 'testcity'), [act('open_app')]);
    save = commit(save, [act('report_it')]);
    expect(save.chapters.testcity?.run?.records.map((r) => r.points)).toEqual([15]);
    save = commit(save, [check('link'), { type: 'tag', beatId: 'start', target: 'link', on: true }, act('open_app')]);
    expect(save.chapters.testcity?.run?.records.map((r) => r.points)).toEqual([17]);
  });
});

describe('T-2.3 carry-overs: no checks after hang-up, QA E8 tampered run index', () => {
  it('after hanging up nothing can be checked or tagged, and the view lists no checkables', () => {
    const s = boss();
    const go = [act('open_app'), { type: 'continue' as const }, act('check_app_2'), { type: 'continue' as const }, act('hang_up')];
    const st = run(s, ctx(), [...go, { type: 'check', beatId: 'support_call', target: 'caller_id' }]);
    expect(st.phase).toBe('what_now');
    expect(st.checks.filter((k) => k.startsWith('support_call|'))).toEqual([]);
    expect(viewOf(s, ctx(), st).checkables).toEqual([]);
  });

  it('a saved run index beyond the recorded scenarios restarts the run', () => {
    const chapter = { city: 'testcity', scenario_order: { am: ['f1', 'g1'], pm: ['f2'] } };
    const base = beginChapter(freshSave(), 'testcity', chapter);
    const current = base.chapters.testcity;
    if (!current) throw new Error('chapter not started');
    const tampered = { ...base, chapters: { testcity: { ...current, run: { index: 2, records: [], flags: ['x_flag'] } } } };
    const again = beginChapter(tampered, 'testcity', chapter);
    expect(again.chapters.testcity?.run).toEqual({ index: 0, records: [], flags: [] });
    expect(nextScenarioId(again, chapter, () => [])).toBe('f1');
    // An honest run (index explained by its records) is kept.
    const s = scenario(rawFraud('f1'));
    const st = run(s, ctx(), [act('open_app')]);
    const honest = commitScenario(base, B, chapter, s, st, resultOf(s, B, st));
    expect(beginChapter(honest, 'testcity', chapter)).toBe(honest);
  });
});

describe('CR-15: a boss debrief shows one "You chose" line in layer 1', () => {
  const s = boss();
  it('the beat with the fewest stars leads; the others move to layer 2', () => {
    const { st, r } = play(s, ctx(), [act('report_it'), { type: 'continue' }, act('pay_invoice'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'done' }, { type: 'recovery', picks: [] }]);
    expect(st.phase).toBe('done');
    const d = debriefOf(s, st, r, none);
    // Paying was a fall: the kind line holds the layer-1 slot and the lead line opens layer 2.
    expect(d.layer1.youChose).toEqual([]);
    expect(d.layer2.youChoseOther).toEqual([
      { beatId: 'invoice', kind: 'action', label: 'Pay the invoice' },
      { beatId: 'start', kind: 'action', label: 'Report it' },
      { beatId: 'support_call', kind: 'what_now', choice: 'done' },
    ]);
  });
  it('on a tie the latest beat leads', () => {
    const { st, r } = play(s, ctx(), [act('report_it'), { type: 'continue' }, act('report_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'done' }]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.youChose.map((c) => c.beatId)).toEqual(['support_call']);
    expect(d.layer2.youChoseOther.map((c) => c.beatId)).toEqual(['start', 'invoice']);
  });
  it('no line when every beat scored three stars', () => {
    const { st, r } = play(s, ctx(), [act('open_app'), { type: 'continue' }, act('check_app_2'), { type: 'continue' }, act('hang_up'), { type: 'what_now', choice: 'call_back_known' }]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.youChose).toEqual([]);
    expect(d.layer2.youChoseOther).toEqual([]);
  });
});

describe('CR-15: the layer-1 validator counts one "You chose" line for a boss', () => {
  it('choice_worst is the longest single line, never the sum over beats', async () => {
    const { choiceWorst } = await import('../../../scripts/lib/rules.ts');
    const { loadBalanceFile } = await import('../helpers.ts');
    const s = boss();
    const labels = [...s.actions, ...s.beats.flatMap((b) => b.actions)].map((a) => a.label.split(/\s+/).length);
    const worst = choiceWorst(s, loadBalanceFile());
    expect(worst).toBeLessThanOrEqual(2 + Math.max(...labels, 4));
    expect(worst).toBeLessThan(labels.reduce((a, b) => a + b, 0));
  });
});

describe('CR-14: pusher view carries lang and translation', () => {
  it('passes the authored lang/translation through to the device', () => {
    const raw = rawFraud('p1', { pressure: { timer: false, levers: ['urgency'], pusher: { messages: [{ at_seconds: 5, text: 'Heute zahlen!', lang: 'de', translation: 'Pay today!' }] } } });
    const s = scenario(raw);
    const st = run(s, ctx(), [tick(1), tick(1), tick(1), tick(1), tick(1), tick(1)]);
    expect(viewOf(s, ctx(), st).pusherMessages).toEqual([{ text: 'Heute zahlen!', at: 5, lang: 'de', translation: 'Pay today!' }]);
  });
});

describe('recovery feedback per scenario (T-2.3 rework)', () => {
  it('an outcome can override the shared feedback line for a step; the generic line stays the fallback', async () => {
    const { recoveryOptionsOf } = await import('../../../src/engine/recovery.ts');
    const { recoveryStepFeedback } = await import('../../../src/content/recoverySteps.ts');
    const opts = recoveryOptionsOf({
      narrative: 'x',
      recovery: [
        { step: 'keep_quiet', category: 'harmful', feedback: 'Tell the club secretary today.' },
        { step: 'wait_and_see', category: 'harmful' },
      ],
    });
    expect(opts[0]?.feedback).toBe('Tell the club secretary today.');
    expect(opts[1]?.feedback).toBeUndefined();
    // The shared line names no one context-specific (it is reused across scenarios).
    expect(recoveryStepFeedback('keep_quiet')).not.toMatch(/\bIT\b(?! team)/);
  });
});
