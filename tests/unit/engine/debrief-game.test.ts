import { describe, expect, it } from 'vitest';
import { debriefOf, pressureCalloutFor } from '../../../src/engine/debrief.ts';
import { beginChapter, carriedStress, chapterProgress, commitScenario, finishChapter, nextScenarioId } from '../../../src/engine/game.ts';
import { demonstratedLos, habitStatus, recordHabits } from '../../../src/engine/habits.ts';
import { checkablesOf, checklistPresentation } from '../../../src/engine/inspect.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { freshSave } from '../../../src/engine/save.ts';
import { rawFraud, rawGenuine, scenario } from '../../content/fixtures.ts';
import { act, B, check, ctx, play, run, tag } from './helpers.ts';

const none = { pressureAny: false, pressureGenuine: false };

describe('debrief data (UI_SPEC §8)', () => {
  it('layer 1 carries the verdict, tell, what works, stars and the matching already-clicked line', () => {
    const s = scenario(rawFraud());
    const { st, r } = play(s, ctx(), [act('tap_link'), act('enter_card'), { type: 'recovery', picks: ['block_card_in_bank_app', 'call_bank_known_number', 'report_to_police_online'] }]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1).toMatchObject({ verdict: 'fraud', tell: s.debrief.layer1.tell, stars: 1, alreadyClicked: { situation: 'paid', text: 'Block your card.' } });
    expect(d.layer1.youChose).toEqual([{ beatId: 'start', kind: 'action', label: 'Enter card details' }]);
    expect(d.layer2.points).toMatchObject({ recovery: 9, total: 9, max: 19 });
    expect(d.narratives).toEqual(['Unknown payments appear.']);
  });

  it('layer 2 marks flags, lists wrong tags, counts what you could mark (visited beats only)', () => {
    const s = scenario(rawFraud());
    const { st, r } = play(s, ctx(), [check('link'), tag('link'), check('reference'), tag('reference'), act('open_app')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer2.flags.map((f) => [f.target ?? null, f.status, f.senderCaveat])).toEqual([
      ['sender.detail', 'not_marked', true],
      ['link', 'marked', false],
    ]);
    expect(d.layer2.wrongTags).toEqual([{ beatId: 'start', target: 'reference', reveal: 'Looks like a tracking number.' }]);
    expect(d.layer2.spotted).toEqual({ marked: 1, could: 2 });
    expect(d.layer1.youChose).toEqual([]);
  });

  it('genuine debrief: no flags, tags on own details are "fine here"', () => {
    const s = scenario(rawGenuine());
    const { st, r } = play(s, ctx(), [check('sender.detail'), tag('sender.detail'), act('go_pick_up')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.verdict).toBe('genuine');
    expect(d.layer2.flags).toEqual([]);
    expect(d.layer2.wrongTags).toHaveLength(1);
  });

  it('arc debriefs have no verdict, stars, points or "You chose" line', () => {
    const raw = rawGenuine('arc1', { role: 'arc', arc_slot: 1, is_fraud: true, stakes: undefined, pattern: undefined, theme: undefined, difficulty: undefined });
    const s = scenario({
      ...raw,
      cast: ['alex'],
      message: { ...(raw.message as Record<string, unknown>), from_cast: 'alex' },
      debrief: { ...(raw.debrief as Record<string, unknown>), variant: 'arc', already_clicked: { clicked: 'Keep chats on the app.' } },
    });
    const { st, r } = play(s, ctx(), [act('report_it')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1).toMatchObject({ verdict: null, stars: null, youChose: [] });
    expect(d.layer2.points).toBeNull();
    expect(st.phase).toBe('done');
  });

  it('pressure callouts: first any, then first on a genuine message, never again', () => {
    expect(pressureCalloutFor(false, true, none)).toBeNull();
    expect(pressureCalloutFor(true, false, none)).toBe('first_any');
    expect(pressureCalloutFor(true, true, none)).toBe('first_any');
    expect(pressureCalloutFor(true, false, { pressureAny: true, pressureGenuine: false })).toBeNull();
    expect(pressureCalloutFor(true, true, { pressureAny: true, pressureGenuine: false })).toBe('first_genuine');
    expect(pressureCalloutFor(true, true, { pressureAny: true, pressureGenuine: true })).toBeNull();
  });
});

describe('check list presentation (never a count)', () => {
  it('lists every template checkable; unauthored ones have no reveal (neutral filler)', () => {
    const s = scenario(rawGenuine());
    const items = checkablesOf({ id: 'start', device: s.device, message: s.message, inspectables: s.inspectables });
    expect(items.map((i) => i.target)).toEqual(['sender.detail', 'link', 'reference', 'phone_number']);
    expect(items.find((i) => i.target === 'link')).toMatchObject({ shown: 'trundle.example/t/2', reveal: undefined });
    expect(checklistPresentation(0)).toEqual({ showCount: false, neutralFillers: true });
    expect(checklistPresentation(10)).toEqual(checklistPresentation(0));
  });
});

describe('game bookkeeping', () => {
  const chapter = { city: 'testcity', patterns: ['smishing-parcel-fee'], scenario_order: { am: ['f1'], pm: ['g1'] } };

  it('commits records, flags, habits and callouts; finishes with a stamp and keeps the best', () => {
    const f = scenario(rawFraud('f1', { outcomes: { ...(rawFraud().outcomes as object), fine: { narrative: 'No fee.', sets_flags: ['checked_trundle'] } } }));
    const g = scenario(rawGenuine('g1'));
    let save = beginChapter(freshSave(), chapter.city);
    expect(chapterProgress(save, chapter.city)).toMatchObject({ position: 0, run: { index: 0 } });
    const c = ctx({ stress: 45 });
    const st1 = run(f, c, [check('sender.detail'), tag('sender.detail'), check('link'), tag('link'), act('open_app')]);
    save = commitScenario(save, B, chapter, f, st1, resultOf(f, B, st1));
    // Echo flags live in the chapter run; game-wide flags are for the arc only.
    expect(save.flags).toEqual([]);
    expect(save.chapters.testcity?.run?.flags).toEqual(['checked_trundle']);
    expect(save.callouts.pressureAny).toBe(true);
    expect(Object.keys(save.habits).sort()).toEqual(['LO-01', 'LO-02', 'LO-03', 'LO-05']);
    expect(nextScenarioId(save, chapter, () => [])).toBe('g1');
    const st2 = run(g, ctx(), [act('go_pick_up')]);
    save = commitScenario(save, B, chapter, g, st2, resultOf(g, B, st2));
    expect(nextScenarioId(save, chapter, () => [])).toBeNull();
    const done = finishChapter(save, B, chapter);
    expect(done.summary).toMatchObject({ points: 34, max: 34, rating: 100, spotted: 2, stamp: 'gold' });
    expect(done.save.chapters.testcity).toMatchObject({ finished: true, bestStamp: 'gold', run: null });
    const again = finishChapter(beginChapter(done.save, chapter.city), B, chapter);
    expect(again.summary.stamp).toBe('bronze');
    expect(again.save.chapters.testcity?.bestStamp).toBe('gold');
  });

  it('stress carries with decay between scenarios and resets to 10 on resume', () => {
    expect(carriedStress(B, null)).toBe(B.stress.on_resume);
    expect(carriedStress(B, 60)).toBe(45);
    expect(carriedStress(B, 5)).toBe(0);
  });

  it('habit mastery: two scenarios, one at difficulty ≥ 3', () => {
    let h = recordHabits({}, ['LO-03'], 'a', 2);
    expect(habitStatus(h['LO-03'])).toBe('earned');
    h = recordHabits(h, ['LO-03'], 'b', 2);
    expect(habitStatus(h['LO-03'])).toBe('earned');
    h = recordHabits(h, ['LO-03'], 'c', 3);
    expect(habitStatus(h['LO-03'])).toBe('mastered');
    expect(habitStatus(undefined)).toBe('locked');
  });

  it('LO evidence: proceed on genuine → LO-17; a fall earns no action LO', () => {
    const g = scenario(rawGenuine());
    const st = run(g, ctx(), [act('go_pick_up')]);
    expect(demonstratedLos(g, B, st, resultOf(g, B, st))).toContain('LO-17');
    const f = scenario(rawFraud());
    const fell = run(f, ctx(), [act('tap_link'), act('enter_card'), { type: 'recovery', picks: ['wait_and_see'] }]);
    expect(demonstratedLos(f, B, fell, resultOf(f, B, fell))).toEqual([]);
  });
});
