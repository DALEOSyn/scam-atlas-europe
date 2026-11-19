// @vitest-environment jsdom
/** Sceptic T-2.1 review fixes, producer rulings and the tutorial's "What now?" migration. */
import { describe, expect, it } from 'vitest';
import { renderHook, act as hookAct } from '@testing-library/preact';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { beginChapter, commitScenario, finishChapter, nextScenarioId, runFlags } from '../../../src/engine/game.ts';
import { clampDt, useSave } from '../../../src/engine/hooks.ts';
import { maxPointsOfScenario, resultOf } from '../../../src/engine/result.ts';
import { isSetupStep, step, viewOf } from '../../../src/engine/runner.ts';
import { createStore, freshSave, type SaveState, type StorageLike } from '../../../src/engine/save.ts';
import { scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { rawFraud, rawGenuine, realRegistries, scenario } from '../../content/fixtures.ts';
import { scenarioRules } from '../../../scripts/lib/rules.ts';
import { readYaml } from '../helpers.ts';
import { act, B, boss, check, ctx, play, run, tag, tick, type Raw } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };
const home = (file: string): Scenario => scenarioSchema.parse(readYaml(`content/scenarios/home/${file}.yaml`));

describe('#2 a verify before the deadline keeps its stars', () => {
  // Verify leads to a follow-up beat ("the app shows no fee; now what?").
  const raw = rawFraud();
  const s = scenario({
    ...raw,
    pressure: { timer: true, levers: [] },
    actions: [
      ...(raw.actions as Raw[]).filter((a) => a.id !== 'open_app'),
      { id: 'open_app', label: 'Open the app yourself', kind: 'verify_in_app', next_beat: 'app_view' },
    ],
    beats: [
      ...(raw.beats as Raw[]),
      {
        id: 'app_view',
        device: 'browser',
        message: { page: { address: 'trundle.example/track' }, body: 'No fee due.', request: 'none' },
        actions: [{ id: 'close_app', label: 'Close the app', kind: 'ignore', outcome: 'fine' }],
      },
    ],
  });

  it('the timer stops once the group is verified, so it can never expire afterwards', () => {
    const st = run(s, ctx(), [tick(10), act('open_app'), tick(500)]);
    expect(st.timer).toBeNull();
    expect(st.phase).toBe('playing');
    const done = step(s, ctx(), st, act('close_app'));
    expect(resultOf(s, B, done)).toMatchObject({ stars: 3, points: 15, timerExpired: false });
  });
});

describe('#3 "You chose" on a fall after an engage names the fall', () => {
  it('engage then proceed on fraud (a fall): the decisive action, not the engage', () => {
    const raw = rawFraud();
    const page = (raw.beats as Raw[])[0] as Raw;
    const s = scenario({
      ...raw,
      beats: [{ ...page, actions: [
        { id: 'enter_card', label: 'Continue to pay', kind: 'proceed', outcome: 'stolen', pressure_target: true },
        { id: 'close_page', label: 'Close the page', kind: 'ignore', outcome: 'left' },
      ] }],
    });
    const { st, r } = play(s, ctx(), [act('tap_link'), act('enter_card'), { type: 'recovery', picks: ['wait_and_see'] }]);
    expect(r.fell).toBe(true);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.youChose).toEqual([]); // after a fall the kind line takes the slot
    expect(d.layer2.youChoseOther).toEqual([{ line: { beatId: 'start', kind: 'action', label: 'Continue to pay' }, stars: 0, beat: null }]);
  });
});

describe('#4 verify extras in "What now?" (tutorial 0-6 beat 3, GDD §16)', () => {
  const s = home('home-06-boss-new-portal');
  const toCall = [act('open_desk_bookmark'), { type: 'continue' as const }, act('ask_adaeze_chat'), { type: 'continue' as const }, act('hang_up_it_call')];

  it('hang up opens "What now?" with the beat\'s verify routes first; the authored known-desk call replaces the generic call-back', () => {
    const st = run(s, ctx({ slot: 0 }), toCall);
    expect(st.phase).toBe('what_now');
    expect(viewOf(s, ctx({ slot: 0 }), st).whatNow?.choices.map((c) => c.id)).toEqual(['hang_up_ask_adaeze', 'hang_up_open_desk', 'call_it_desk_known', 'report', 'done']);
  });

  it('a verify extra ends the step as verify (★★★) with its own outcome', () => {
    const st = run(s, ctx({ slot: 0 }), [...toCall, { type: 'what_now', choice: 'hang_up_ask_adaeze' }]);
    expect(st.phase).toBe('done');
    const r = resultOf(s, B, st);
    expect(r.beats.map((b) => [b.cls, b.stars])).toEqual([['verify', 3], ['verify', 3], ['verify', 3]]);
    expect(r.outcomes.at(-1)).toBe('adaeze_says_no_move');
    expect(r.points).toBe(45);
    expect(r.maxPoints).toBe(51);
  });

  it('the generic call-back is refused when the beat replaces it; Done scores dismiss', () => {
    let st = run(s, ctx({ slot: 0 }), toCall);
    expect(step(s, ctx({ slot: 0 }), st, { type: 'what_now', choice: 'call_back_known' })).toBe(st);
    st = step(s, ctx({ slot: 0 }), st, { type: 'what_now', choice: 'done' });
    expect(resultOf(s, B, st).beats[2]).toMatchObject({ cls: 'dismiss', stars: 2 });
  });
});

describe('#5 Check and tag only on the live beat group and unanswered interrupts', () => {
  it('a resolved boss beat cannot be checked or tagged any more', () => {
    const s = boss();
    let st = run(s, ctx(), [check('link'), act('open_app'), { type: 'continue' }]);
    const before = st;
    st = step(s, ctx(), st, check('sender.detail'));
    expect(st).toBe(before);
    st = step(s, ctx(), st, tag('link'));
    expect(st.tags).toEqual([]);
    // The live beat still works.
    st = step(s, ctx(), st, check('link', 'invoice'));
    expect(st.checks).toContain('invoice|link');
  });

  it('a waiting (arrived, not active) boss beat cannot be checked', () => {
    const s = boss({ pressure: { timer: false, levers: [] } });
    const st = run(s, ctx(), [tick(35)]);
    expect(step(s, ctx(), st, check('link', 'invoice'))).toBe(st);
  });

  it('an answered interrupt is closed', () => {
    const s = scenario({
      ...rawFraud(),
      interrupts: [{
        id: 'jonas', at_seconds: 5, is_fraud: false, device: 'messenger',
        message: { sender: { display: 'Jonas', detail: '+49 •••• 0101' }, body: 'Took your parcel in!', request: 'none' },
        actions: [{ id: 'thanks', label: 'Say thanks', kind: 'proceed', outcome: 'fine' }],
      }],
    });
    const live = run(s, ctx(), [tick(6), check('sender.detail', 'jonas')]);
    expect(live.checks).toContain('jonas|sender.detail');
    const answered = run(s, ctx(), [tick(6), { type: 'interrupt_act', interruptId: 'jonas', actionId: 'thanks' }]);
    expect(step(s, ctx(), answered, check('sender.detail', 'jonas'))).toBe(answered);
  });
});

describe('#6 tag-bonus headroom on genuine messages with quoted red flags', () => {
  it('max points include the bonus whenever red flags exist', () => {
    const quoted = scenario(rawGenuine('gq', {
      inspectables: [
        { target: 'sender.detail', reveal: 'The short code you know.', red_flag: false, reassures: true },
        { target: 'link', reveal: 'In the screenshot: a look-alike link.', red_flag: true, context: 'quoted' },
      ],
    }));
    expect(maxPointsOfScenario(B, quoted)).toBe(15 + 2);
    expect(maxPointsOfScenario(B, scenario(rawGenuine()))).toBe(15);
    const { r } = play(quoted, ctx(), [check('link'), tag('link'), act('check_app')]);
    expect(r).toMatchObject({ points: 17, maxPoints: 17, correctTags: 1 });
  });
});

describe('#7 echo flags belong to the chapter run', () => {
  const chapter = { city: 'testcity', patterns: ['smishing-parcel-fee'], scenario_order: { am: ['f1', 'echo'], pm: ['g1'] } };
  const requires = (id: string) => (id === 'echo' ? ['card_stolen'] : []);
  const f = scenario(rawFraud('f1', { outcomes: { ...(rawFraud().outcomes as object), stolen: { ...((rawFraud().outcomes as Raw).stolen as object), sets_flags: ['card_stolen'] } } }));

  function playF(save: SaveState, fall: boolean): SaveState {
    const st = run(f, ctx(), fall ? [act('tap_link'), act('enter_card'), { type: 'recovery', picks: ['block_card_in_bank_app'] }] : [act('open_app')]);
    return commitScenario(save, B, chapter, f, st, resultOf(f, B, st));
  }

  it('a fall sets the echo flag for this run; a replay starts clean', () => {
    let save = playF(beginChapter(freshSave(), chapter.city), true);
    expect(nextScenarioId(save, chapter, requires)).toBe('echo');
    expect(save.flags).toEqual([]);
    save = finishChapter(save, B, chapter).save;
    // Replay: the player verifies this time, so the echo is skipped.
    save = playF(beginChapter(save, chapter.city), false);
    expect([...runFlags(save, chapter.city)]).toEqual([]);
    expect(nextScenarioId(save, chapter, requires)).toBe('g1');
  });
});

describe('producer rulings', () => {
  it('a boss beat with timer_seconds uses that length (scaled by mode); a boss call beat defaults to call_beat', () => {
    const base = boss();
    const withLen = scenarioSchema.parse({ ...base, beats: base.beats.map((b) => (b.id === 'support_call' ? { ...b, timer_seconds: 40 } : b)) });
    const go = [act('open_app'), { type: 'continue' as const }, act('check_app_2'), { type: 'continue' as const }];
    expect(run(base, ctx(), go).timer?.remaining).toBe(B.timers.call_beat);
    expect(run(withLen, ctx(), go).timer?.remaining).toBe(40);
    expect(run(withLen, ctx({ timerMode: 'extended' }), go).timer?.remaining).toBe(80);
  });

  it('0-3: the opener\'s proceed is not decisive once the next beat is reached', () => {
    const s = home('home-03-password-reset');
    // Tutorial grace (ruling L4, ★ = 5 by producer ruling T-2.8): slot 0 scores a report on genuine ★, 5 points; it still counts as reported.
    expect(play(s, ctx({ slot: 0 }), [act('go_to_inbox'), act('report_reset')]).r).toMatchObject({ stars: 1, points: 5, genuineReported: 1 });
    expect(play(s, ctx({ slot: 1 }), [act('go_to_inbox'), act('report_reset')]).r).toMatchObject({ stars: 0, points: -5, genuineReported: 1 });
    expect(play(s, ctx({ slot: 0 }), [act('go_to_inbox'), act('use_reset_link')]).r).toMatchObject({ stars: 3, points: 15 });
  });

  it('0-3: opener proceed, then the timer runs out twice on the reset email → scored as expiry, not as the proceed (QA T-2.8 M1)', () => {
    const s = home('home-03-password-reset');
    for (const slot of [0, 1]) {
      const c = ctx({ slot });
      const ticks = Array.from({ length: 400 }, () => tick(1));
      const { st, r } = play(s, c, [act('go_to_inbox'), ...ticks]);
      expect(st.phase).toBe('done');
      // Ruling R21 (CR-45): expiry on a genuine beat scores what its deliberate dismiss ("Leave it") scores:
      // ★, 5 points under tutorial grace (slot 0, where 0-3 ships); 0 from slot 1 on.
      const want = slot === 0 ? { stars: 1, points: 5 } : { stars: 0, points: 0 };
      expect(r.beats[0], `slot ${slot}`).toMatchObject({ ...want, timerExpired: true });
      expect(r).toMatchObject(want);
      const dd = debriefOf(s, st, r, { pressureAny: true, pressureGenuine: true });
      expect(dd.layer1.allBest).toBe(false);
      // R26(2), CR-50: re-pinned. A 0-star genuine expiry (slot 1) gets `genuine_missed`, never "Nothing is lost yet"; ★ (slot 0) keeps `genuine`.
      expect(dd.layer2.deadline).toBe(slot === 0 ? 'genuine' : 'genuine_missed');
    }
  });

  it('a setup step is never decisive: checks and a pause on the next beat still count as "before deciding" (LO-01, LO-04)', () => {
    const s = home('home-03-password-reset');
    const c = ctx({ slot: 0 });
    const st = run(s, c, [act('go_to_inbox')]);
    expect(st.groups[0]?.decision).toBeUndefined();
    const checked = run(s, c, [act('go_to_inbox'), check('sender.detail', 'reset_email')]);
    expect(checked.groups[0]?.checkedBefore.length).toBe(1);
  });

  /** A fraud opener that asks nothing, with a proceed that only moves on to the scam page (sceptic T-2.8 repro). */
  const fraudOpener = (): Raw => {
    const raw = rawFraud('f-opener', { pressure: { timer: true, levers: ['urgency'] } });
    (raw.message as Raw).request = 'none';
    raw.actions = (raw.actions as Raw[]).map((a) => (a.id === 'tap_link' ? { ...a, kind: 'proceed' } : a));
    return raw;
  };

  it('fraud: a proceed from an opener that asks nothing stays decisive; an expiry on the scam page is still a fall (sceptic T-2.8)', () => {
    const s = scenario(fraudOpener());
    const c = ctx({ slot: 1 });
    const st = run(s, c, [act('tap_link')]);
    expect(st.groups[0]?.decision).toMatchObject({ cls: 'proceed' });
    const { r } = play(s, c, [act('tap_link'), ...Array.from({ length: 400 }, () => tick(1))]);
    expect(r.beats[0]).toMatchObject({ fell: true, stars: 0, timerExpired: false });
    expect(r.stars).toBe(0);
  });

  it('validator: a fraud message with request none and a proceed with next_beat and no outcome is rejected (use open_link)', () => {
    const reg = realRegistries();
    expect(scenarioRules(scenario(fraudOpener()), reg).errors.join('\n')).toMatch(/opening message: action "tap_link": a proceed with next_beat from a fraud message with request: none is ambiguous; use kind open_link/);
    const asOpenLink = fraudOpener();
    asOpenLink.actions = (asOpenLink.actions as Raw[]).map((a) => (a.id === 'tap_link' ? { ...a, kind: 'open_link' } : a));
    expect(scenarioRules(scenario(asOpenLink), reg).errors.join('\n')).not.toMatch(/ambiguous/);
    // Home 0-3 (genuine) is untouched by the rule.
    expect(scenarioRules(home('home-03-password-reset'), reg).errors.join('\n')).not.toMatch(/ambiguous/);
  });

  it('isSetupStep: only a non-terminal proceed from a beat that asks nothing', () => {
    const none = { message: { request: 'none' } } as Parameters<typeof isSetupStep>[0];
    const asks = { message: { request: 'log_in' } } as Parameters<typeof isSetupStep>[0];
    expect(isSetupStep(none, { next_beat: 'x' }, 'proceed', 'legit_high')).toBe(true);
    expect(isSetupStep(asks, { next_beat: 'x' }, 'proceed', 'legit_high')).toBe(false); // e.g. 0-2 "Tap the link": a click on fraud stays a fall
    expect(isSetupStep(none, { next_beat: 'x', outcome: 'o' }, 'proceed', 'legit_high')).toBe(false);
    expect(isSetupStep(none, { outcome: 'o' }, 'proceed', 'legit_high')).toBe(false);
    expect(isSetupStep(none, { next_beat: 'x' }, 'verify', 'legit_high')).toBe(false);
    expect(isSetupStep(none, { next_beat: 'x' }, 'proceed', 'legit_low')).toBe(true);
    expect(isSetupStep(none, { next_beat: 'x' }, 'proceed', 'fraud')).toBe(false); // a proceed on fraud is a fall
  });
});

describe('hooks', () => {
  it('clamps tick steps after device sleep', () => {
    expect(clampDt(0.25)).toBe(0.25);
    expect(clampDt(3600)).toBe(1);
    expect(clampDt(-1)).toBe(0);
    expect(clampDt(Number.NaN)).toBe(0);
  });

  it('useSave composes updates and writes outside the state updater', () => {
    const writes: string[] = [];
    const mem: StorageLike = { getItem: () => null, setItem: (_k, v) => void writes.push(v), removeItem: () => undefined };
    const { result } = renderHook(() => useSave(createStore(mem)));
    hookAct(() => {
      const [, update] = result.current;
      update((s) => ({ ...s, flags: ['a_flag'] }));
      update((s) => ({ ...s, flags: [...s.flags, 'b_flag'] }));
    });
    expect(result.current[0].flags).toEqual(['a_flag', 'b_flag']);
    expect(writes).toHaveLength(2);
    expect(JSON.parse(writes[1] ?? '{}').flags).toEqual(['a_flag', 'b_flag']);
  });
});

