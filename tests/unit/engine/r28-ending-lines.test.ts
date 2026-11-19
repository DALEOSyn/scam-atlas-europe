/**
 * R28, CR-51 (R25(5)), engine level: real YAML played through the real engine (`commitScenario` per beat,
 * `enterFinale` on entering Brussels, `sceneFlags` + `scenePlaysFor` + `visiblePanels` as app.tsx plays the
 * resolution list), asserting the exact ending lines each path shows. Also the one-time save fix `arc_flags_cr51`
 * (`fixArcFlags`) for saves written before CR-51 / R28.
 */
import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { listFiles, readYaml } from '../../../scripts/lib/content.ts';
import { ARC_CHECKED, ARC_TOLD_SOMEONE, chapterSchema, scenarioSchema, sceneSchema, type Chapter, type Scenario, type Scene } from '../../../src/content/schema.ts';
import { ARC_HELPED_TEO } from '../../../src/content/constants.ts';
import { enterFinale, type ArcEnding, type FinaleStep } from '../../../src/engine/arc.ts';
import { beginChapter, commitScenario, sceneFlags } from '../../../src/engine/game.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { freshSave, parseSave, SAVE_FIXES, type SaveState } from '../../../src/engine/save.ts';
import { resolutionSceneIds, scenePlaysFor, visiblePanels } from '../../../src/engine/story.ts';
import { ROOT } from '../../content/fixtures.ts';
import { act, B, ctx, run } from './helpers.ts';

const CONTENT = resolve(ROOT, 'content');
const chapter = (city: string): Chapter => chapterSchema.parse(readYaml(join(CONTENT, 'chapters', `${city}.yaml`)));
const scenario = (city: string, id: string): Scenario => scenarioSchema.parse(readYaml(join(CONTENT, 'scenarios', city, `${id}.yaml`)));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'brussels'), ['.yaml']).map((f) => {
    const s = sceneSchema.parse(readYaml(f));
    return [s.id, s];
  }),
);

/** Play one action of a shipped scenario in its chapter and commit it, as the game does. */
function play(save: SaveState, city: string, id: string, actionId: string): SaveState {
  const c = chapter(city);
  const s = scenario(city, id);
  const begun = beginChapter(save, city, c);
  const st = run(s, ctx({ timerMode: 'off' }), [act(actionId)]);
  expect(st.groups[0]?.decision?.actionId, `${id}: ${actionId} decided`).toBe(actionId);
  return commitScenario(begun, B, c, s, st, resultOf(s, B, st));
}

/** Enter the finale: the ending and steps are fixed from the saved arc (GDD §30.6). */
function enter(save: SaveState, ending: ArcEnding, steps: FinaleStep[]): SaveState {
  const next = { ...beginChapter(save, 'brussels', chapter('brussels')), arc: enterFinale(save.arc) };
  expect(next.arc.finale?.ending).toBe(ending);
  expect(next.arc.finale?.steps).toEqual(steps);
  return next;
}

/** Every line of the Brussels resolution list this save sees, as app.tsx `playScene` + ScenePlayer. */
function endingLines(save: SaveState): string[] {
  const ending = save.arc.finale?.ending ?? null;
  const flags = sceneFlags(save, 'brussels');
  return resolutionSceneIds(chapter('brussels'))
    .map((id) => scenes.get(id))
    .filter((s): s is Scene => s !== undefined && scenePlaysFor(s, ending, flags))
    .flatMap((s) => visiblePanels(s, flags, ending).flatMap((p) => (p.line ? [p.line] : [])));
}

const A_HELPED = "Teo asked you, and you helped him. That's what works.";
const A_REPORTED = "And you reported yours early. That's what works.";
const A_STEPPED_BACK = "You stepped back early, and you never sent any money. Next time, telling someone too makes it even easier.";
const B_TOLD = "You told someone, and the timeline did the rest. That's the whole trick.";
const B_UNTOLD = "You never sent any money, and the timeline did the rest. Next time, telling someone early makes it even easier.";
const C_CHECKED = "You checked in the end. That's what works.";
const C_REPORTED = "You reported it. That's what works.";
const ADAEZE_ENDING = [A_HELPED, A_REPORTED, A_STEPPED_BACK, B_TOLD, B_UNTOLD, C_CHECKED, C_REPORTED];
/** The ending lines on what the player did (Adaeze's), in play order. */
const said = (save: SaveState): string[] => endingLines(save).filter((l) => ADAEZE_ENDING.includes(l));

const TEO = 'brussels-arc-teo';
const CLOSE = 'brussels-arc-close';

describe('R28: ending A after a Madrid slot 4 report, per Teo option (real engine)', () => {
  const reported = () => enter(play(freshSave(), 'madrid', 'madrid-arc-alex-04', 'report_alex_trading'), 'A', ['teo', 'timeline']);
  it('the early report alone sets arc_told_someone (CR-51), not arc_helped_teo', () => {
    const s = reported();
    expect(s.flags).toContain(ARC_TOLD_SOMEONE);
    expect(s.flags).not.toContain(ARC_HELPED_TEO);
  });
  it.each([
    ['advise_little_cant_hurt', A_REPORTED],
    ['advise_teo_stop', A_REPORTED],
    ['photo_check_robin', A_HELPED],
    ['advise_teo_report', A_HELPED],
  ])('Teo option %s → "%s"', (actionId, line) => {
    expect(said(play(reported(), 'brussels', TEO, actionId))).toEqual([line]);
  });
});

describe('R28: ending A′ (two Closes at slot 1), per Teo option (real engine)', () => {
  const closedTwice = () => {
    const once = play(freshSave(), 'berlin', 'berlin-arc-alex-01', 'close_wordswap');
    return enter(play(once, 'berlin', 'berlin-arc-alex-01', 'close_wordswap'), 'A_prime', ['teo', 'timeline']);
  };
  it.each([
    ['advise_little_cant_hurt', A_STEPPED_BACK],
    ['advise_teo_stop', A_STEPPED_BACK],
    ['photo_check_robin', A_HELPED],
    ['advise_teo_report', A_HELPED],
  ])('Teo option %s → "%s"', (actionId, line) => {
    expect(said(play(closedTwice(), 'brussels', TEO, actionId))).toEqual([line]);
  });
});

describe('CR-51: endings B and C, photo check only vs told someone (real engine)', () => {
  const open = (save: SaveState, ending: ArcEnding, steps: FinaleStep[]) => enter(save, ending, steps);
  const stepBack = () => play(freshSave(), 'madrid', 'madrid-arc-alex-04', 'change_topic_alex');
  const paid = () => play(freshSave(), 'warsaw', 'warsaw-arc-alex-05', 'sign_up_add_fifty');

  it('B, close beat photo check only: arc_checked, not told → "You never sent any money…"', () => {
    const s = play(open(stepBack(), 'B', ['close', 'timeline']), 'brussels', CLOSE, 'photo_check_alex');
    expect(s.flags).toContain(ARC_CHECKED);
    expect(s.flags).not.toContain(ARC_TOLD_SOMEONE);
    expect(said(s)).toEqual([B_UNTOLD]);
  });
  it('B, close beat report → "You told someone…"', () => {
    expect(said(play(open(stepBack(), 'B', ['close', 'timeline']), 'brussels', CLOSE, 'report_alex_profile'))).toEqual([B_TOLD]);
  });
  it('B, asked Teo at slot 5, then the close beat photo check → "You told someone…"', () => {
    const asked = play(freshSave(), 'warsaw', 'warsaw-arc-alex-05', 'tell_teo_trading');
    expect(said(play(open(asked, 'B', ['close', 'timeline']), 'brussels', CLOSE, 'photo_check_alex'))).toEqual([B_TOLD]);
  });
  it('B, reported at slot 7 (Lisbon): the reveal, then "You told someone…"', () => {
    const s = open(play(freshSave(), 'lisbon', 'lisbon-arc-alex-07', 'say_scam_and_report'), 'B', ['reveal', 'timeline']);
    expect(said(s)).toEqual([B_TOLD]);
  });
  it('C, close beat photo check only → "You checked in the end."', () => {
    const s = play(open(paid(), 'C', ['close', 'damage_control', 'recovery_offer', 'timeline']), 'brussels', CLOSE, 'photo_check_alex');
    expect(said(s)).toEqual([C_CHECKED]);
  });
  it('C, close beat report → "You reported it."', () => {
    const s = play(open(paid(), 'C', ['close', 'damage_control', 'recovery_offer', 'timeline']), 'brussels', CLOSE, 'report_alex_profile');
    expect(said(s)).toEqual([C_REPORTED]);
  });
  it('C, asked Teo at slot 3, paid at slot 5, then the close beat photo check → "You checked in the end."', () => {
    const asked = play(freshSave(), 'paris', 'paris-arc-alex-03', 'tell_teo_secret');
    const s = play(open(play(asked, 'warsaw', 'warsaw-arc-alex-05', 'sign_up_add_fifty'), 'C', ['close', 'damage_control', 'recovery_offer', 'timeline']), 'brussels', CLOSE, 'photo_check_alex');
    expect(said(s)).toEqual([C_CHECKED]);
  });
  it('C, paid at slot 5 then reported at slot 7: the reveal, then "You reported it."', () => {
    const s = open(play(paid(), 'lisbon', 'lisbon-arc-alex-07', 'say_scam_and_report'), 'C', ['reveal', 'damage_control', 'recovery_offer', 'timeline']);
    expect(said(s)).toEqual([C_REPORTED]);
  });
});

describe('save fix arc_flags_cr51: saves written before CR-51 / R28', () => {
  type Finale = { ending: ArcEnding; steps: FinaleStep[]; step: number } | null;
  const old = (flags: string[], choices: { slot: number; kind: string }[], finale: Finale, extra: Record<string, unknown> = {}) =>
    parseSave(JSON.stringify({ version: 1, flags, arc: { closed: finale !== null, timeline: choices.map((c) => c.slot), choices, finale }, ...extra })).save;

  it('a fresh save has every fix; a parsed old save gets it once and keeps the marker', () => {
    expect(freshSave().fixes).toEqual([...SAVE_FIXES]);
    expect(old([], [], null).fixes).toContain('arc_flags_cr51');
  });
  it('an arc slot decided by report or ask_someone sets arc_told_someone', () => {
    expect(old([], [{ slot: 4, kind: 'report' }], null).flags).toEqual([ARC_TOLD_SOMEONE]);
    expect(old([], [{ slot: 1, kind: 'reply' }, { slot: 5, kind: 'ask_someone' }], null).flags).toEqual([ARC_TOLD_SOMEONE]);
    expect(old([], [{ slot: 3, kind: 'verify_identity' }, { slot: 5, kind: 'pay' }], null).flags).toEqual([]);
  });
  it('A′ with Teo\'s photo check or report (arc_told_someone, no slot explains it) gets arc_helped_teo, and the line', () => {
    const finale: Finale = { ending: 'A_prime', steps: ['teo', 'timeline'], step: 2 };
    const s = old([ARC_TOLD_SOMEONE], [{ slot: 1, kind: 'ignore' }], finale);
    expect(new Set(s.flags)).toEqual(new Set([ARC_TOLD_SOMEONE, ARC_HELPED_TEO]));
    expect(said(s)).toEqual([A_HELPED]);
    // "A little can't hurt" or "stop replying" set nothing then and nothing now.
    expect(old([], [{ slot: 1, kind: 'ignore' }], finale).flags).toEqual([]);
  });
  it('ending A is left as the save proves: the early report tells someone; Teo\'s branch cannot be told apart', () => {
    const s = old([ARC_TOLD_SOMEONE], [{ slot: 4, kind: 'report' }], { ending: 'A', steps: ['teo', 'timeline'], step: 2 });
    expect(s.flags).toEqual([ARC_TOLD_SOMEONE]);
    expect(said(s)).toEqual([A_REPORTED]);
  });
  it('a close beat (photo check or report) is not rewritten: the save holds no trace of which it was', () => {
    const s = old([ARC_TOLD_SOMEONE], [{ slot: 4, kind: 'ignore' }], { ending: 'B', steps: ['close', 'timeline'], step: 2 });
    expect(s.flags).toEqual([ARC_TOLD_SOMEONE]);
    expect(s.flags).not.toContain(ARC_CHECKED);
  });
  it('one-time: a save that already has the fix is not changed again', () => {
    const s = old([], [{ slot: 4, kind: 'report' }], null, { fixes: ['arc_flags_cr51'] });
    expect(s.flags).toEqual([]);
  });
  it('idempotent through a save/load round trip', () => {
    const once = old([ARC_TOLD_SOMEONE], [{ slot: 1, kind: 'ignore' }], { ending: 'A_prime', steps: ['teo', 'timeline'], step: 2 });
    const again = parseSave(JSON.stringify({ ...once, fixes: [] })).save;
    expect(new Set(again.flags)).toEqual(new Set(once.flags));
  });
});
