/**
 * Design rulings L1–L4 (game-designer, 2026-11-18) and the layer-1 budget ruling (2026-11-19), T-2.7:
 * - L1: descriptive "What now?" lines; ★★★ displayed with a lower beat → no "You chose", a "Next time" pointer.
 * - L2: caller ID / sender / logo decoys on fraud carry the "Fair instinct…" wrong-mark line.
 * - L3: the summary shows gross correct marks (capped at R) and wrong marks apart; stamps stay net.
 * - L4: tutorial grace in slot 0 (report on genuine, dismiss on genuine high stakes: ★; 5 points since the
 *   producer ruling in T-2.8, so ★ = 5 everywhere and waiting out a timer never beats a deliberate pause).
 */
import { describe, expect, it } from 'vitest';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { recordOf, summarise, type ScenarioRecord } from '../../../src/engine/chapter.ts';
import { choiceLineText, nextTimeText, overCautionOf } from '../../../src/engine/choiceText.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { startScenario, step, viewOf, type RunnerContext } from '../../../src/engine/runner.ts';
import { graceFor, scoreGroup, type Decision } from '../../../src/engine/scoring.ts';
import { lookup } from '../../../src/i18n/index.ts';
import type { ActionClass } from '../../../src/content/schema.ts';
import { readYaml } from '../helpers.ts';
import { act, B, check, ctx, play, tag } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const home = (id: string): Scenario => scenarioSchema.parse(readYaml(`content/scenarios/home/${id}.yaml`));
/** The rendered layer-1 "You chose" line, or '' when there is none. */
const line1 = (dd: ReturnType<typeof debriefOf>): string => {
  const c = dd.layer1.youChose[0];
  return c ? choiceLineText(c, lookup) : '';
};
const d = (cls: ActionClass): Decision => ({ cls, kind: 'ignore', actionId: cls });
const plain = { engagedOnFraud: false, timerExpired: false };

describe('L4 tutorial grace: slot 0 against slot 1', () => {
  it('balance.yaml grants grace in slot 0 only', () => {
    expect(B.tutorial_grace).toEqual({ slots: [0], report_on_legit: { stars: 1, points: 5 }, dismiss_on_legit_high: { stars: 1, points: 5 } });
  });

  it.each([
    ['report', 'legit_high', { stars: 1, points: 5 }, { stars: 0, points: -5 }],
    ['report', 'legit_low', { stars: 1, points: 5 }, { stars: 0, points: -5 }],
    ['dismiss', 'legit_high', { stars: 1, points: 5 }, { stars: 0, points: 0 }],
  ] as const)('%s on %s: slot 0 %o, slot 1 %o', (cls, truth, slot0, slot1) => {
    expect(scoreGroup(B, truth, d(cls), { ...plain, slot: 0 })).toMatchObject(slot0);
    expect(scoreGroup(B, truth, d(cls), { ...plain, slot: 1 })).toMatchObject(slot1);
  });

  it('everything else scores the same in slot 0 and slot 1', () => {
    const same: [ActionClass, 'fraud' | 'legit_high' | 'legit_low'][] = [
      ['dismiss', 'legit_low'], ['dismiss', 'fraud'], ['report', 'fraud'], ['verify', 'legit_high'], ['proceed', 'legit_low'], ['engage', 'legit_high'], ['comply', 'legit_high'],
    ];
    for (const [cls, truth] of same) {
      expect(scoreGroup(B, truth, d(cls), { ...plain, slot: 0 }), `${cls} on ${truth}`).toEqual(scoreGroup(B, truth, d(cls), { ...plain, slot: 1 }));
    }
  });

  it('a timer running out is not a choice: no grace; on genuine high stakes it scores ★ and 5 in every slot (ruling QA L4)', () => {
    for (const slot of [0, 1, 5]) {
      expect(scoreGroup(B, 'legit_high', undefined, { engagedOnFraud: false, timerExpired: true, slot })).toMatchObject({ stars: 1, points: 5 });
    }
    expect(scoreGroup(B, 'legit_low', undefined, { engagedOnFraud: false, timerExpired: true, slot: 0 })).toMatchObject({ stars: 2, points: 10 });
    expect(graceFor(B, undefined, 'report', 'legit_low')).toBeUndefined();
  });

  it('grace ★ is worth 5 like every ★, stays below ★★ (10 points), and never below a timer running out (producer ruling T-2.8)', () => {
    expect(B.tutorial_grace.report_on_legit.points).toBe(B.points.per_star);
    expect(B.tutorial_grace.dismiss_on_legit_high.points).toBe(B.points.per_star);
    expect(B.tutorial_grace.dismiss_on_legit_high.points).toBeGreaterThanOrEqual(B.timer_expiry.genuine_high.points);
    expect(B.tutorial_grace.report_on_legit.points).toBeLessThan(2 * B.points.per_star);
    expect(B.tutorial_grace.dismiss_on_legit_high.points).toBeLessThan(2 * B.points.per_star);
  });

  it('home-01 (genuine, low): reporting scores ★ / 5 in the tutorial, 0 / −5 elsewhere; it still counts as reported', () => {
    const s = home('home-01-welcome-pack');
    expect(play(s, ctx({ slot: 0 }), [act('report_welcome')]).r).toMatchObject({ stars: 1, points: 5, genuineReported: 1 });
    expect(play(s, ctx({ slot: 1 }), [act('report_welcome')]).r).toMatchObject({ stars: 0, points: -5, genuineReported: 1 });
  });

  it('home-03 (genuine, high, player started): closing the page or reporting the reset scores ★ in the tutorial', () => {
    const s = home('home-03-password-reset');
    expect(play(s, ctx({ slot: 0 }), [act('close_forgot_page')]).r).toMatchObject({ stars: 1, points: 5 });
    expect(play(s, ctx({ slot: 1 }), [act('close_forgot_page')]).r).toMatchObject({ stars: 0, points: 0 });
    expect(play(s, ctx({ slot: 0 }), [act('go_to_inbox'), act('ignore_reset')]).r).toMatchObject({ stars: 1, points: 5 });
  });
});

describe('L4 kind lines for over-caution on genuine (game-wide copy)', () => {
  it('picks the line by class × truth', () => {
    expect(overCautionOf('report', 'legit_low', false)).toBe('report_genuine');
    expect(overCautionOf('report', 'legit_high', true)).toBe('report_genuine');
    expect(overCautionOf('dismiss', 'legit_high', false)).toBe('dismiss_genuine');
    expect(overCautionOf('dismiss', 'legit_high', true)).toBe('dismiss_started');
    expect(overCautionOf('dismiss', 'legit_low', false)).toBeUndefined();
    expect(overCautionOf('report', 'fraud', false)).toBeUndefined();
    expect(overCautionOf('engage', 'legit_high', false)).toBeUndefined();
  });

  it('home-01 report and home-03 close render the kind lines, never the bare label', () => {
    const s1 = home('home-01-welcome-pack');
    const p1 = play(s1, ctx({ slot: 0 }), [act('report_welcome')]);
    const d1 = debriefOf(s1, p1.st, p1.r, none);
    expect(d1.layer1.youChose).toHaveLength(1);
    expect(line1(d1)).toBe('You reported it. Careful is good; this one was safe.');
    const s3 = home('home-03-password-reset');
    const p3 = play(s3, ctx({ slot: 0 }), [act('close_forgot_page')]);
    expect(line1(debriefOf(s3, p3.st, p3.r, none))).toBe('You left it. You started this reset; it was safe.');
    // Low-stakes "leave it for later" is not over-caution: it keeps its label.
    const p1b = play(s1, ctx({ slot: 0 }), [act('leave_for_later')]);
    expect(line1(debriefOf(s1, p1b.st, p1b.r, none))).toBe('You chose: Leave it for later.');
  });

  it('home-01 welcome_reported agrees with ★', () => {
    expect(home('home-01-welcome-pack').outcomes['welcome_reported']?.narrative).toBe('IT replies: "Thanks for checking! This one really is from Adaeze, so go ahead and open your pack."');
  });
});

describe('L1 "What now?" built-ins', () => {
  it('render descriptive past-tense lines, not the button label', () => {
    expect(choiceLineText({ beatId: 'x', kind: 'what_now', choice: 'done' }, lookup)).toBe('You hung up and left it there.');
    expect(choiceLineText({ beatId: 'x', kind: 'what_now', choice: 'report' }, lookup)).toBe('You hung up and reported the call.');
    expect(choiceLineText({ beatId: 'x', kind: 'what_now', choice: 'call_back_known' }, lookup)).toBe('You hung up and called a number you know.');
    expect(lookup('what_now_done')).toBe('Leave it there');
    expect(nextTimeText('after_hang_up', lookup)).toBe('Next time: call a number you know.');
  });

  it('home-06: ★★★ displayed after "Leave it there" on the call → no "You chose", the Next time pointer, the line in layer 2 with its stars', () => {
    const s = home('home-06-boss-new-portal');
    const c = ctx({ slot: 0 });
    const { st, r } = play(s, c, [act('open_desk_bookmark'), { type: 'continue' }, act('ask_adaeze_chat'), { type: 'continue' }, act('hang_up_it_call'), { type: 'what_now', choice: 'done' }]);
    expect(r.beats.map((b) => b.stars)).toEqual([3, 3, 2]);
    expect(r.stars).toBe(3);
    const dd = debriefOf(s, st, r, none);
    expect(dd.layer1).toMatchObject({ youChose: [], nextTime: 'after_hang_up', allBest: false });
    expect(dd.layer2.youChoseOther).toMatchObject([{ line: { kind: 'what_now', choice: 'done' }, stars: 2, beat: { device: 'call' } }]);
  });

  it('home-06: reporting the call (★★, not a dismiss) moves the line to layer 2 without a pointer', () => {
    const s = home('home-06-boss-new-portal');
    const { st, r } = play(s, ctx({ slot: 0 }), [act('open_desk_bookmark'), { type: 'continue' }, act('ask_adaeze_chat'), { type: 'continue' }, act('hang_up_it_call'), { type: 'what_now', choice: 'report' }]);
    const dd = debriefOf(s, st, r, none);
    expect(dd.layer1).toMatchObject({ youChose: [], nextTime: null });
    expect(dd.layer2.youChoseOther).toHaveLength(1);
  });

  it('displayed stars below ★★★ keep the lead line in layer 1', () => {
    const s = home('home-06-boss-new-portal');
    const { st, r } = play(s, ctx({ slot: 0 }), [act('ignore_portal_email'), { type: 'continue' }, act('ignore_it_chat'), { type: 'continue' }, act('hang_up_it_call'), { type: 'what_now', choice: 'done' }]);
    expect(r.stars).toBe(2);
    const dd = debriefOf(s, st, r, none);
    expect(dd.layer1.youChose).toEqual([{ beatId: 'it_call', kind: 'what_now', choice: 'done' }]);
    expect(dd.layer1.nextTime).toBeNull();
    expect(dd.layer2.youChoseOther).toHaveLength(2);
  });
});

describe('L2 caller ID stays a decoy; the wrong mark says "Fair instinct"', () => {
  it('home-06 caller_id: reworded reveal, still a decoy, flagged for the Fair-instinct line', () => {
    const s = home('home-06-boss-new-portal');
    const ins = s.beats.find((b) => b.id === 'it_call')?.inspectables.find((i) => i.target === 'caller_id');
    expect(ins).toMatchObject({
      red_flag: false,
      type: 'caller_id',
      reveal: 'Shows "Waymarker IT": the number matches a saved contact, as a real call would. Faked numbers can match too, so it can\'t prove anything either way. Judge the request.',
    });
    const { st, r } = play(s, ctx({ slot: 0 }), [
      act('open_desk_bookmark'), { type: 'continue' },
      check('image', 'kettle_it_chat'), tag('image', 'kettle_it_chat'), act('ask_adaeze_chat'), { type: 'continue' },
      check('caller_id', 'it_call'), tag('caller_id', 'it_call'), check('reference', 'it_call'), tag('reference', 'it_call'),
      act('hang_up_it_call'), { type: 'what_now', choice: 'hang_up_ask_adaeze' },
    ]);
    const wrong = debriefOf(s, st, r, none).layer2.wrongTags;
    expect(wrong.map((w) => [w.target, w.type, w.fairInstinct])).toEqual([
      ['image', 'logo', true],
      ['caller_id', 'caller_id', true],
      ['reference', 'reference', false],
    ]);
  });

  it('a tag on a genuine message\'s own sender is not a decoy: plain "fine here" line', () => {
    const s = home('home-01-welcome-pack');
    const { st, r } = play(s, ctx({ slot: 0 }), [check('sender.detail'), tag('sender.detail'), act('open_pack')]);
    expect(debriefOf(s, st, r, none).layer2.wrongTags).toMatchObject([{ type: 'sender', fairInstinct: false }]);
  });
});

describe('L3 chapter summary: gross correct and wrong apart, stamps on net', () => {
  const rec = (correct: number, wrong: number, redFlags: number): ScenarioRecord => ({ id: 'x', scored: true, points: 0, maxPoints: 15, stars: 0, correctTags: correct, wrongTags: wrong, redFlags, genuineReported: 0, doubleCheckedHarmless: false, pattern: null });
  it('correctShown = min(R, correct); spotted stays net', () => {
    expect(summarise(B, { patterns: [] }, [rec(7, 3, 8)], true)).toMatchObject({ correctShown: 7, wrongTags: 3, spotted: 4, spottedShown: 4 });
    expect(summarise(B, { patterns: [] }, [rec(1, 4, 2)], true)).toMatchObject({ correctShown: 1, spotted: -3, spottedShown: 0 });
    expect(summarise(B, { patterns: [] }, [rec(3, 0, 2)], true)).toMatchObject({ correctShown: 2 });
  });
});

describe('Home strategy check (slot 0, GDD §16): grace does not lift always-report', () => {
  const chapter = chapterSchema.parse(readYaml('content/chapters/home.yaml'));
  const ids = [...chapter.scenario_order.am, ...chapter.scenario_order.pm];

  /** Blind always-report: report when offered, hang up then report on calls, else the normal way forward. */
  function playReporter(s: Scenario, c: RunnerContext): ScenarioRecord {
    let st = startScenario(s, c);
    for (let guard = 0; guard < 40 && st.phase !== 'done'; guard++) {
      const v = viewOf(s, c, st);
      if (st.phase === 'consequence') st = step(s, c, st, { type: 'continue' });
      else if (st.phase === 'damage_control') st = step(s, c, st, { type: 'recovery', picks: (v.recovery?.options ?? []).slice(0, 3).map((o) => o.step) });
      else if (st.phase === 'what_now') st = step(s, c, st, { type: 'what_now', choice: 'report' });
      else {
        const actions = v.beat?.actions ?? [];
        const cls = (k: string) => B.action_kinds[k as keyof typeof B.action_kinds].class;
        const pick = actions.find((a) => cls(a.kind) === 'report') ?? actions.find((a) => a.kind === 'hang_up') ?? actions.find((a) => cls(a.kind) === 'proceed') ?? actions[0];
        if (!pick) throw new Error(`no action on ${s.id}`);
        st = step(s, c, st, { type: 'act', actionId: pick.id });
      }
    }
    expect(st.phase, s.id).toBe('done');
    return recordOf(resultOf(s, B, st), s.pattern);
  }

  it('blind always-report in Home: 2 genuine messages reported → bronze, even with grace', () => {
    const records = ids.map((id) => playReporter(scenarioSchema.parse(readYaml(`content/scenarios/home/${id}.yaml`)), ctx({ slot: 0 })));
    const sum = summarise(B, chapter, records, true);
    expect(sum.genuineReported).toBe(2);
    expect(sum.stamp).toBe('bronze');
    // Grace: the two genuine reports score ★ and 5 points each instead of 0 and −5; stamps don't use points.
    expect(records.filter((x) => x.genuineReported > 0).map((x) => [x.stars, x.points])).toEqual([[1, 5], [1, 5]]);
  });
});

describe('T-2.7 review round 1', () => {
  it('the "Next time" pointer names a ★★★ habit: on home-06 the call verifies score ★★★, report only ★★', () => {
    const s = home('home-06-boss-new-portal');
    const toCall = [act('open_desk_bookmark'), { type: 'continue' as const }, act('ask_adaeze_chat'), { type: 'continue' as const }, act('hang_up_it_call')];
    for (const choice of ['call_it_desk_known', 'hang_up_ask_adaeze', 'hang_up_open_desk']) {
      expect(play(s, ctx({ slot: 0 }), [...toCall, { type: 'what_now', choice }]).r.beats[2], choice).toMatchObject({ stars: 3 });
    }
    expect(play(s, ctx({ slot: 0 }), [...toCall, { type: 'what_now', choice: 'report' }]).r.beats[2]).toMatchObject({ stars: 2 });
    expect(lookup('next_time_after_hang_up')).toBe('Next time: call a number you know.');
  });

  it('nextTime is only ever set on a boss (the validator counts it only there)', () => {
    const s = { ...home('home-06-boss-new-portal'), role: 'standard' as const };
    const h = home('home-06-boss-new-portal');
    const { st, r } = play(h, ctx({ slot: 0 }), [act('open_desk_bookmark'), { type: 'continue' }, act('ask_adaeze_chat'), { type: 'continue' }, act('hang_up_it_call'), { type: 'what_now', choice: 'done' }]);
    expect(debriefOf(h, st, r, none).layer1.nextTime).toBe('after_hang_up');
    expect(debriefOf(s, st, r, none).layer1.nextTime).toBeNull();
  });

  it('an authored score override comes after grace: it sets the points, never the stars', () => {
    const dec: Decision = { cls: 'report', kind: 'report', actionId: 'r', override: 3 };
    expect(scoreGroup(B, 'legit_low', dec, { ...plain, slot: 0 })).toMatchObject({ stars: 1, points: 3 });
    expect(scoreGroup(B, 'legit_low', dec, { ...plain, slot: 1 })).toMatchObject({ stars: 0, points: 3 });
  });

  it('every home padlock reveal reads the same, and none opens with "It fits"', () => {
    const reveals = ['home-02-mailbox-full', 'home-03-password-reset', 'home-04-kettle-locked'].flatMap((id) => {
      const s = home(id);
      return [s.inspectables, ...s.beats.map((b) => b.inspectables)].flat().filter((i) => i.type === 'padlock').map((i) => i.reveal);
    });
    expect(reveals).toHaveLength(3);
    expect(new Set(reveals).size).toBe(1);
    expect(reveals[0]).toBe("The connection is encrypted, the same lock a real site shows. Necessary, but it can't show who runs the site, so it can't prove anything either way.");
  });
});
