/**
 * CR-40 … CR-44 (Brussels finale, GDD §30.10; details §30.4–§30.7, §30.11): schema, validator rules, checkables,
 * runner, arc dispatch and story behaviour, on the fixtures in tests/fixtures/scenarios (cr40–cr42) and
 * tests/fixtures/finale (the finale chapter, its arc scenarios and resolution scenes).
 */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chapterRules, scenarioRules } from '../../../scripts/lib/rules.ts';
import { readYaml } from '../../../scripts/lib/content.ts';
import { sceneSetRules } from '../../../scripts/lib/scenes.ts';
import { deriveCheckables } from '../../../src/content/checkables.ts';
import { ARC_TOLD_SOMEONE, chapterSchema, sceneSchema, scenarioSchema, timelineTextIssues, type Chapter, type Scenario, type Scene } from '../../../src/content/schema.ts';
import {
  advanceFinale,
  applyArcBeat,
  arcSlotAt,
  arcSlotForRun,
  EMPTY_ARC,
  enterFinale,
  finaleDone,
  finalePlan,
  finaleStep,
  tellMeNow,
  timelineChoice,
  timelineRows,
  type ArcState,
} from '../../../src/engine/arc.ts';
import { debriefOf } from '../../../src/engine/debrief.ts';
import { beginChapter, commitScenario } from '../../../src/engine/game.ts';
import { checkablesOf } from '../../../src/engine/inspect.ts';
import { resultOf, type ScenarioResult } from '../../../src/engine/result.ts';
import { startScenario, step, viewOf } from '../../../src/engine/runner.ts';
import { freshSave, parseSave } from '../../../src/engine/save.ts';
import { isFall } from '../../../src/engine/scoring.ts';
import { orderOptions } from '../../../src/engine/recovery.ts';
import { chapterSceneIds, epigraphOf, resolutionSceneId, resolutionSceneIds, scenePlaysFor, visiblePanels } from '../../../src/engine/story.ts';
import { ROOT, realRegistries } from '../../content/fixtures.ts';
import { act, B, ctx, play, run, tick, type Raw } from './helpers.ts';
import { FIXTURE_DIR } from './fixture-brands.ts';

const reg = realRegistries();
const FINALE = resolve(ROOT, 'tests', 'fixtures', 'finale');
const raw = (file: string): Raw => readYaml(join(FIXTURE_DIR, file)) as Raw;
const rawFinale = (file: string): Raw => readYaml(join(FINALE, 'scenarios', file)) as Raw;
const fixture = (file: string): Scenario => scenarioSchema.parse(raw(file));
const finale = (file: string): Scenario => scenarioSchema.parse(rawFinale(file));
const chapterRaw = (): Raw => readYaml(join(FINALE, 'chapter.yaml')) as Raw;
const chapter = (): Chapter => chapterSchema.parse(chapterRaw());
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
const actions = (r: Raw): Raw[] => r.actions as Raw[];
const outcomes = (r: Raw): Record<string, Raw> => r.outcomes as Record<string, Raw>;
const finaleScenarios = (): Scenario[] => readdirSync(join(FINALE, 'scenarios')).map((f) => finale(f));
const finaleScenes = (): Map<string, { file: string; scene: Scene }> =>
  new Map(readdirSync(join(FINALE, 'scenes')).map((f) => {
    const scene = sceneSchema.parse(readYaml(join(FINALE, 'scenes', f)));
    return [scene.id, { file: f, scene }];
  }));
const arc = (over: Partial<ArcState> = {}): ArcState => ({ ...EMPTY_ARC, vars: {}, timeline: [], choices: [], ...over });
const res = (points = 0): ScenarioResult => ({ points, arcEffects: {} }) as unknown as ScenarioResult;

describe('fixtures for CR-40 … CR-44', () => {
  it('every fixture passes the schema and the scenario rules', () => {
    for (const f of ['cr40-advice.yaml', 'cr41-friend-offcast.yaml', 'cr42-browser-overlay.yaml']) expect(ruleErrors(raw(f)), f).toEqual([]);
    for (const f of readdirSync(join(FINALE, 'scenarios'))) expect(ruleErrors(rawFinale(f)), f).toEqual([]);
  });
  it('the finale chapter passes the chapter rules and its scenes the scene-set rules', () => {
    expect(chapterRules(chapter(), 'fxfinale', finaleScenarios(), reg).errors).toEqual([]);
    expect(sceneSetRules(finaleScenes(), new Map([['fxfinale', { file: 'chapter.yaml', chapter: chapter() }]])).errors).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('CR-40: advice scenarios', () => {
  const s = fixture('cr40-advice.yaml');
  it('the forwarded message is the checkable text: forwarded.sender, never the forwarder\'s own sender.detail', () => {
    const list = deriveCheckables('messenger', s.message);
    expect(list[0]).toBe('forwarded.sender');
    expect(list).not.toContain('sender.detail');
    expect(list).toEqual(expect.arrayContaining(['reference', 'claim', 'request']));
    expect(checkablesOf({ ...s, id: 'start' }).find((c) => c.target === 'forwarded.sender')?.reveal).toMatch(/mutual friends/);
  });
  it('claims, the ask and references are quoted from forwarded.body, not from the bubble', () => {
    const r = clone(raw('cr40-advice.yaml'));
    (msg(r).ask as Raw).text = "Is this legit?? I really want it";
    expect(schemaErrors(r).join('\n')).toMatch(/ask.text must be copied verbatim from forwarded.body/);
  });
  it('forwarded is for messenger beats, inside an advice scenario, from an app in the brands list', () => {
    const sms = clone(raw('cr40-advice.yaml'));
    sms.device = 'sms';
    expect(schemaErrors(sms).join('\n')).toMatch(/forwarded \(a message a cast member forwards\) is for messenger beats \(CR-40\)/);
    const noAdvice = clone(raw('cr40-advice.yaml'));
    delete noAdvice.advice;
    expect(schemaErrors(noAdvice).join('\n')).toMatch(/a forwarded message belongs to an advice scenario/);
    const app = clone(raw('cr40-advice.yaml'));
    (msg(app).forwarded as Raw).app = 'trundle';
    expect(schemaErrors(app).join('\n')).toMatch(/forwarded.app "trundle" must be listed in the scenario's brands/);
  });
  it('advise_comply scores 0 but is not a fall: no damage control, no stress penalty, no kind line', () => {
    const st = run(s, ctx({ timerMode: 'off' }), [act('probably_fine')]);
    expect(st.phase).toBe('done');
    expect(st.recovery).toBeNull();
    expect(st.stress).toBe(run(s, ctx({ timerMode: 'off' }), [act('tell_mum')]).stress);
    const r = resultOf(s, B, st);
    expect(r).toMatchObject({ fell: false, points: 0, stars: 0 });
    expect(isFall('comply', 'fraud', 'advise_comply')).toBe(false);
    expect(isFall('comply', 'fraud', 'pay')).toBe(true);
  });
  it('the debrief names the advice in "You chose" and adds the authored advice line; never after other choices', () => {
    const st = run(s, ctx({ timerMode: 'off' }), [act('probably_fine')]);
    const d = debriefOf(s, st, resultOf(s, B, st), { pressureAny: true, pressureGenuine: true });
    expect(d.fell).toBe(false);
    expect(d.layer1.youChose).toEqual([expect.objectContaining({ label: 'A few transfers? Probably fine' })]);
    expect(d.layer1.adviceLine).toBe('Noor asked, and that was the smart bit. With an offer like this, the answer is always no.');
    const good = run(s, ctx({ timerMode: 'off' }), [act('tell_mum')]);
    expect(debriefOf(s, good, resultOf(s, B, good), { pressureAny: true, pressureGenuine: true }).layer1.adviceLine).toBeNull();
  });
  it('validator: the cast member stays safe (no pay, details, code or damage control), advise_comply only in advice scenarios on fraud', () => {
    const pay = clone(raw('cr40-advice.yaml'));
    actions(pay)[1] = { id: 'pay_it', label: 'Pay it', kind: 'pay', outcome: 'telling_mum' };
    expect(schemaErrors(pay).join('\n')).toMatch(/in an advice scenario nobody pays/);
    const rec = clone(raw('cr40-advice.yaml'));
    (outcomes(rec).noor_checks as Raw).recovery = [{ step: 'call_bank_known_number', category: 'stop' }];
    expect(schemaErrors(rec).join('\n')).toMatch(/keeps the cast member safe: no outcome has damage control/);
    const noLine = clone(raw('cr40-advice.yaml'));
    delete (noLine.debrief as Raw).advice_line;
    expect(schemaErrors(noLine).join('\n')).toMatch(/needs debrief.advice_line/);
    const plain = clone(raw('cr40-advice.yaml'));
    delete plain.advice;
    delete msg(plain).forwarded;
    expect(schemaErrors(plain).join('\n')).toMatch(/advise_comply is for advice scenarios/);
    const genuine = clone(raw('cr40-advice.yaml'));
    genuine.is_fraud = false;
    genuine.stakes = 'high';
    expect(schemaErrors(genuine).join('\n')).toMatch(/advise_comply is for fraud scenarios/);
    const notCast = clone(raw('cr40-advice.yaml'));
    notCast.advice = { for: 'teo' };
    expect(schemaErrors(notCast).join('\n')).toMatch(/advice.for "teo" must be in the scenario's cast list/);
  });
  it('validator: a fall in an advice scenario never asks for recovery (advise_comply is not a fall)', () => {
    expect(ruleErrors(raw('cr40-advice.yaml')).filter((e) => /needs recovery options/.test(e))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('CR-41: damage control for someone off-cast', () => {
  const s = fixture('cr41-friend-offcast.yaml');
  it('the view names the label in the prompt and the cast member who voices the feedback', () => {
    const st = run(s, ctx({ timerMode: 'off' }), [act('help_friend')]);
    expect(st.phase).toBe('damage_control');
    expect(viewOf(s, ctx({ timerMode: 'off' }), st).recovery).toMatchObject({ forCast: 'noor', forLabel: "Noor's friend" });
  });
  it('CR-32 still works with a cast id (forLabel null)', () => {
    const s32 = fixture('cr32-friend-drill.yaml');
    const st = run(s32, ctx({ timerMode: 'off' }), [act('help_mateus')]);
    expect(viewOf(s32, ctx({ timerMode: 'off' }), st).recovery).toMatchObject({ forCast: 'mateus', forLabel: null });
  });
  it('validator: drills only; voiced_by in the cast; the label is plain words', () => {
    const notCast = clone(raw('cr41-friend-offcast.yaml'));
    ((outcomes(notCast).helping_friend as Raw).recovery_for as Raw).voiced_by = 'teo';
    expect(schemaErrors(notCast).join('\n')).toMatch(/recovery_for "teo" must be in the scenario's cast list/);
    const scored = clone(raw('cr41-friend-offcast.yaml'));
    scored.role = 'standard';
    expect(schemaErrors(scored).join('\n')).toMatch(/recovery_for is for drills/);
    const label = clone(raw('cr41-friend-offcast.yaml'));
    ((outcomes(label).helping_friend as Raw).recovery_for as Raw).label = 'friend@club.example';
    expect(schemaErrors(label).join('\n')).toMatch(/recovery_for.label is a plain description/);
  });
});

// ---------------------------------------------------------------------------

describe('CR-42: the browser warning overlay', () => {
  const s = fixture('cr42-browser-overlay.yaml');
  it('the overlay is the message text: its number and claims are checkable; the page text is not', () => {
    const list = deriveCheckables('browser', s.message);
    expect(list).toEqual(['page.address', 'page.info', 'phone_number', 'claim', 'claim#2', 'request']);
    const r = clone(raw('cr42-browser-overlay.yaml'));
    (msg(r).claims as Raw[])[0] = { text: 'Tonight: a festival of street music' };
    expect(schemaErrors(r).join('\n')).toMatch(/claims\[\].text must be copied verbatim from page.overlay.body/);
  });
  it('browser only; exactly one dismiss action for "Close"; never a training form', () => {
    const notBrowser = clone(raw('cr42-browser-overlay.yaml'));
    notBrowser.device = 'email';
    msg(notBrowser).sender = { display: 'News', detail: 'news@news-daily.example' };
    msg(notBrowser).subject = 'News';
    expect(schemaErrors(notBrowser).join('\n')).toMatch(/page.overlay \(the warning drawn over a page\) is for browser beats \(CR-42\)/);
    const two = clone(raw('cr42-browser-overlay.yaml'));
    actions(two).push({ id: 'delete_it', label: 'Delete it', kind: 'delete', outcome: 'closed' });
    expect(ruleErrors(two).join('\n')).toMatch(/needs exactly one \(has 2\) \(CR-42\)/);
    const none = clone(raw('cr42-browser-overlay.yaml'));
    (actions(none).find((a) => a.kind === 'ignore') as Raw).kind = 'call_back_known';
    expect(ruleErrors(none).join('\n')).toMatch(/needs exactly one \(has 0\)/);
  });
  it('"Close" is the dismiss action: ★★ on fraud, no fall', () => {
    expect(play(s, ctx({ timerMode: 'off' }), [act('close_it')]).r).toMatchObject({ fell: false, stars: 2 });
  });
  it('safety: no fullscreen, beforeunload, sound or vibration anywhere in the game code', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : /\.(tsx?|css)$/.test(d.name) ? [join(dir, d.name)] : []));
    const banned = /requestFullscreen|webkitRequestFullScreen|beforeunload|onbeforeunload|<audio|new Audio\(|AudioContext|navigator\.vibrate|speechSynthesis/;
    const hits = files(resolve(ROOT, 'src')).filter((f) => banned.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

describe('CR-43(a), (e): the finale dispatch from the saved arc state (GDD §30.6)', () => {
  const invested = { alex_invested: 50 };
  it('open with money in: close beat → arc damage control → recovery-agency test → timeline (C)', () => {
    expect(finalePlan(arc({ vars: invested, timeline: [1, 2, 3, 4, 5] }))).toEqual({ ending: 'C', steps: ['close', 'damage_control', 'recovery_offer', 'timeline'] });
  });
  it('open with nothing in: close beat → timeline (B)', () => {
    expect(finalePlan(arc({ timeline: [1, 2, 3] }))).toEqual({ ending: 'B', steps: ['close', 'timeline'] });
  });
  it('"Tell me now": arc damage control → recovery-agency test (money in, R22: §10.3 wins), or Teo\'s chat → timeline (R)', () => {
    expect(finalePlan(tellMeNow(arc({ vars: invested })))).toEqual({ ending: 'R', steps: ['damage_control', 'recovery_offer', 'timeline'] });
    expect(finalePlan(tellMeNow(arc()))).toEqual({ ending: 'R', steps: ['teo', 'timeline'] });
  });
  it('a second Close: Teo\'s chat → timeline (A′); reported at slot ≤ 6: Teo\'s chat → timeline (A)', () => {
    expect(finalePlan(arc({ closes: 2, closed: true }))).toEqual({ ending: 'A_prime', steps: ['teo', 'timeline'] });
    expect(finalePlan(applyArcBeat(arc(), 4, res(), 'report'))).toEqual({ ending: 'A', steps: ['teo', 'timeline'] });
  });
  it('reported at slot 7–9: the reveal → timeline (B), or with money in → damage control → recovery test (C)', () => {
    expect(finalePlan(applyArcBeat(arc({ timeline: [1, 2, 3, 4, 5, 6] }), 7, res(), 'report'))).toEqual({ ending: 'B', steps: ['reveal', 'timeline'] });
    expect(finalePlan(applyArcBeat(arc({ vars: invested }), 8, res(), 'report'))).toEqual({ ending: 'C', steps: ['reveal', 'damage_control', 'recovery_offer', 'timeline'] });
  });
  it('CR-43(e): every ending with money in plays the recovery-agency test, also when the arc closed earlier', () => {
    for (const a of [arc({ vars: invested }), tellMeNow(arc({ vars: invested })), applyArcBeat(arc({ vars: invested }), 5, res(), 'report'), applyArcBeat(arc({ vars: invested }), 9, res(), 'report')]) {
      expect(finalePlan(a).steps).toContain('recovery_offer');
    }
  });
  it('entering fixes ending and steps (evaluated on entry), closes the arc, and steps advance one at a time', () => {
    let a = enterFinale(arc({ vars: invested }));
    expect(a.closed).toBe(true);
    expect(a.finale).toEqual({ ending: 'C', steps: ['close', 'damage_control', 'recovery_offer', 'timeline'], step: 0 });
    expect(enterFinale(a)).toBe(a);
    expect(finaleStep(a)).toBe('close');
    expect(advanceFinale(a, 'timeline')).toBe(a); // not the current step: a double tap never skips
    for (const s of ['close', 'damage_control', 'recovery_offer', 'timeline'] as const) a = advanceFinale(a, s);
    expect(finaleDone(a)).toBe(true);
    expect(finaleStep(a)).toBeNull();
  });
  it('the save keeps the finale state, choices and ending; malformed finale state starts the block again', () => {
    const save = { ...freshSave(), arc: enterFinale(applyArcBeat(arc(), 3, res(), 'reply')) };
    const back = parseSave(JSON.stringify(save)).save;
    expect(back.arc.finale).toEqual(save.arc.finale);
    expect(back.arc.choices).toEqual([{ slot: 3, kind: 'reply' }]);
    const bad = JSON.parse(JSON.stringify(save));
    bad.arc.finale.steps = ['close', 'hack'];
    expect(parseSave(JSON.stringify(bad)).save.arc.finale).toBeNull();
    bad.arc.finale = { ending: 'Z', steps: ['timeline'], step: 0 };
    expect(parseSave(JSON.stringify(bad)).save.arc.finale).toBeNull();
  });
});

describe('CR-43: the finale scenarios', () => {
  it('a fall on the recovery-agency test runs its damage control (finale arc scenarios do, slot beats never)', () => {
    const s = finale('fx-finale-arc-recovery.yaml');
    expect(run(s, ctx({ timerMode: 'off' }), [act('pay_fee')]).phase).toBe('damage_control');
  });
  it('the close beat\'s photo check and report both open the reveal card on the consequence step', () => {
    const s = finale('fx-finale-arc-close.yaml');
    for (const a of ['photo_check', 'report_profile']) {
      const st = step(s, ctx({ timerMode: 'off' }), startScenario(s, ctx({ timerMode: 'off' })), act(a));
      expect(viewOf(s, ctx({ timerMode: 'off' }), st).consequenceReveal, a).toBe(true);
    }
  });
  it('validator: the reveal follows verify_identity or report, in the finale only', () => {
    const notFinale = clone(rawFinale('fx-finale-arc-close.yaml'));
    delete notFinale.finale;
    notFinale.arc_slot = 9;
    expect(schemaErrors(notFinale).join('\n')).toMatch(/the reveal card is shown in the finale block only/);
    const via = clone(rawFinale('fx-finale-arc-teo.yaml'));
    (outcomes(via).stopped as Raw).reveal = true;
    expect(schemaErrors(via)).toEqual([]); // R22: in Teo's chat, ignore and advise_comply reach the reveal too
    const offer = clone(rawFinale('fx-finale-arc-recovery.yaml'));
    (outcomes(offer).deleted as Raw).reveal = true;
    expect(schemaErrors(offer).join('\n')).toMatch(/reached by verify_identity, report actions only here/);
  });
  it('finale scenarios bank their points as arc points, never in a chapter rating', () => {
    const s = finale('fx-finale-arc-recovery.yaml');
    const c = chapter();
    const save = beginChapter({ ...freshSave(), arc: enterFinale(arc({ vars: { alex_invested: 50 } })) }, c.city, c);
    const st = run(s, ctx({ timerMode: 'off' }), [act('pay_fee'), { type: 'recovery', picks: ['stop_paying', 'call_bank_known_number', 'keep_evidence'] }]);
    const r = resultOf(s, B, st);
    const after = commitScenario(save, B, c, s, st, r);
    expect(after.arc.points).toBe(save.arc.points + r.points);
    expect(r.scored).toBe(false);
  });
});

describe('CR-43(c): the red-flag timeline', () => {
  it('the fixed choice wording per kind (§30.6)', () => {
    expect(timelineChoice('pay')).toBe('paid');
    expect(timelineChoice('reply')).toBe('went_along');
    expect(timelineChoice('ignore')).toBe('stepped_back');
    expect(timelineChoice('ask_someone')).toBe('asked');
    expect(timelineChoice('report')).toBe('reported');
    expect(timelineChoice('check_official_list')).toBe('checked');
    expect(timelineChoice('verify_identity')).toBe('checked');
    expect(timelineChoice(undefined)).toBe('stepped_back');
  });
  it('rows: slots played, in slot order, the latest choice per slot, slots without a tell left out', () => {
    let a = arc();
    a = applyArcBeat(a, 2, res(), 'reply');
    a = applyArcBeat(a, 1, res(), 'reply');
    a = applyArcBeat(a, 2, res(), 'ask_someone');
    const rows = timelineRows(a, (slot) => (slot === 1 ? 'Nothing to notice yet.' : slot === 2 ? 'Leaving the app.' : undefined));
    expect(rows).toEqual([
      { slot: 1, tell: 'Nothing to notice yet.', choice: 'replied' },
      { slot: 2, tell: 'Leaving the app.', choice: 'asked' },
    ]);
  });
  it('validator: no "fell", "fooled", "mistake", amounts, figures or counts in a timeline string', () => {
    expect(timelineTextIssues('Leaving the app you met on is a common scam step.')).toEqual([]);
    for (const bad of ['You fell for it.', 'You were fooled.', 'A small mistake.', 'You sent €50.', 'You sent 50 euros.', 'Paid twice.', 'Three times.']) {
      expect(timelineTextIssues(bad), bad).not.toEqual([]);
    }
    const beat = clone(rawFinale('fx-finale-arc-close.yaml'));
    delete beat.finale;
    beat.arc_slot = 4;
    ((beat.debrief as Raw).layer1 as Raw).tell = 'You fell for the profit bragging.';
    for (const o of Object.values(outcomes(beat))) delete o.reveal;
    expect(schemaErrors(beat).join('\n')).toMatch(/this tell is shown on the red-flag timeline: no blame words/);
  });
  it('every shipped arc beat tell passes the timeline rule', async () => {
    const { validateContent } = await import('../../../scripts/lib/content.ts');
    const report = validateContent(resolve(ROOT, 'content'));
    expect(report.errors.filter((e) => /red-flag timeline/.test(e))).toEqual([]);
  });
});

describe('CR-43(f): arc slots follow play position (STORY §1.4)', () => {
  it('slot N plays in the Nth chapter played; Home and the finale have none; a played slot never repeats', () => {
    expect(arcSlotAt(arc(), 0)).toBeNull();
    expect(arcSlotAt(arc(), 1)).toBe(1);
    expect(arcSlotAt(arc({ timeline: [1] }), 2)).toBe(2);
    expect(arcSlotAt(arc({ timeline: [1, 2, 3, 4, 5, 6, 7, 8] }), 9)).toBe(9);
    expect(arcSlotAt(arc({ timeline: [1, 2, 3, 4, 5, 6, 7, 8, 9] }), 10)).toBeNull();
    expect(arcSlotAt(arc({ timeline: [1, 2] }), 2)).toBeNull();
    expect(arcSlotAt(arc({ closed: true }), 3)).toBeNull();
    expect(arcSlotAt(arc(), null)).toBeNull();
  });
  it('after one "Close the app" at slot 1, slot 1 plays once more in the next chapter (GDD §10.2)', () => {
    const once = applyArcBeat(arc(), 1, res(), 'ignore');
    expect(arcSlotAt(once, 2)).toBe(1);
    expect(arcSlotAt(applyArcBeat(once, 1, res(), 'reply'), 3)).toBe(3);
  });
  it('QA B1: the slot-1 repeat is offered once; position 2 plays nothing more; a replayed chapter plays no arc beat', () => {
    const once = applyArcBeat(arc(), 1, res(), 'ignore');
    const repeated = applyArcBeat(once, 1, res(), 'reply'); // timeline [1, 1], still one close
    expect(arcSlotAt(repeated, 2)).toBeNull();
    expect(arcSlotForRun(once, { finished: false, position: 2 })).toBe(1);
    expect(arcSlotForRun(once, { finished: true, position: 2 }), 'replaying Berlin\'s successor').toBeNull();
    expect(arcSlotForRun(arc({ timeline: [1, 2, 3] }), { finished: true, position: 3 })).toBeNull();
    expect(arcSlotForRun(arc({ timeline: [1, 2] }), { finished: false, position: 3 })).toBe(3);
    // A slot-2 arc beat is never offered at position 2 after a pause (skipped, R22).
    expect(arcSlotAt(arc({ closes: 1, timeline: [1, 1] }), 2)).toBeNull();
  });
  it('validator: a chapter\'s arc beat carries the chapter\'s map slot; the finale has none', () => {
    const c = chapterRaw();
    const withBeat = { ...c, arc_beat: 'fx-finale-01-warning' };
    expect(chapterSchema.safeParse(withBeat).success).toBe(false);
  });
  it('a slot played from another chapter advances this chapter\'s run at its position', () => {
    const c = { ...chapter(), arc_finale: undefined, slot: 4, scenario_order: { am: ['fx-finale-01-warning', 'x-arc'], pm: [] } } as Chapter;
    const s = finale('fx-finale-arc-teo.yaml');
    const save = beginChapter(freshSave(), c.city, c);
    const st = run(s, ctx({ timerMode: 'off' }), [act('stop_replying')]);
    expect(commitScenario(save, B, c, { ...s, finale: undefined, arc_slot: 3 }, st, resultOf(s, B, st), 1).chapters[c.city]?.run?.index).toBe(2);
  });
});

describe('CR-43(d): resolution scenes keyed to the arc ending', () => {
  const c = chapter();
  const scenes = finaleScenes();
  const get = (id: string) => scenes.get(id)?.scene as Scene;
  it('the resolution is several scenes in order; the last one is the postcard', () => {
    expect(resolutionSceneIds(c)).toEqual(['fx-finale-open', 'fx-finale-ending-c', 'fx-finale-ending-a', 'fx-finale-ending-b', 'fx-finale-evening']);
    expect(resolutionSceneId(c)).toBe('fx-finale-evening');
    expect(chapterSceneIds(c).slice(-2)).toEqual(['fx-finale-ending-b', 'fx-finale-evening']);
  });
  it('scenes play for their endings; R with money in plays C\'s scene, R without plays A\'s', () => {
    const money = new Set(['alex_invested']);
    expect(scenePlaysFor(get('fx-finale-open'), null)).toBe(true);
    expect(scenePlaysFor(get('fx-finale-ending-c'), 'C', money)).toBe(true);
    expect(scenePlaysFor(get('fx-finale-ending-c'), 'R', money)).toBe(true);
    expect(scenePlaysFor(get('fx-finale-ending-c'), 'R')).toBe(false);
    expect(scenePlaysFor(get('fx-finale-ending-a'), 'R')).toBe(true);
    expect(scenePlaysFor(get('fx-finale-ending-a'), 'R', money)).toBe(false);
    expect(scenePlaysFor(get('fx-finale-ending-a'), 'B')).toBe(false);
    expect(scenePlaysFor(get('fx-finale-ending-b'), 'B')).toBe(true);
    expect(scenePlaysFor(get('fx-finale-ending-b'), null)).toBe(false);
  });
  it('panels keyed to an ending (R adds Teo\'s line)', () => {
    expect(visiblePanels(get('fx-finale-ending-a'), new Set(), 'R')).toHaveLength(3);
    expect(visiblePanels(get('fx-finale-ending-a'), new Set(), 'A')).toHaveLength(2);
  });
  it('R22 (psych M1): a told-someone line only when the player did; a truthful variant otherwise', () => {
    const told = visiblePanels(get('fx-finale-ending-a'), new Set([ARC_TOLD_SOMEONE]), 'A').map((p) => p.line);
    const not = visiblePanels(get('fx-finale-ending-a'), new Set(), 'A').map((p) => p.line);
    expect(told).toContain("And you told someone. That's what works.");
    expect(not).not.toContain("And you told someone. That's what works.");
    expect(not).toContain("Telling someone early is what works. It's never too late to start.");
  });
  it('the epigraph is the panel marked epigraph (Adaeze\'s last line)', () => {
    expect(epigraphOf([get('fx-finale-open'), get('fx-finale-evening')])).toEqual({
      speaker: 'adaeze',
      line: 'Pause. Check on a number or app you already know. Ask someone. Then be the someone for the next person.',
    });
  });
  it('validator: several resolution scenes only in the finale; only the last ends on If-then; arc-keyed scenes only in the finale', () => {
    const notFinale = { ...chapterRaw() } as Raw;
    delete notFinale.arc_finale;
    notFinale.slot = 9;
    expect(chapterSchema.safeParse(notFinale).error?.issues.map((i) => i.message).join('\n')).toMatch(/a resolution of several scenes is for the finale/);
    const order = { ...c, scenes: { ...c.scenes, placed: [], resolution: ['fx-finale-evening', 'fx-finale-open'] } } as Chapter;
    const errs = sceneSetRules(scenes, new Map([['fxfinale', { file: 'chapter.yaml', chapter: order }]])).errors.join('\n');
    expect(errs).toMatch(/"fx-finale-open" must end on the If-then panel/);
    expect(errs).toMatch(/"fx-finale-evening" has an If-then panel, but only the last resolution scene ends on it/);
    const plain = { ...c, arc_finale: undefined, scenes: { placed: [], resolution: 'fx-finale-ending-b' } } as Chapter;
    expect(sceneSetRules(scenes, new Map([['fxfinale', { file: 'chapter.yaml', chapter: plain }]])).errors.join('\n')).toMatch(/keyed to the arc ending, which only the finale/);
  });
  it('validator: an epigraph is a cast line shown to everyone; scene-level flags go with if_arc_ending', () => {
    const ev = clone(readYaml(join(FINALE, 'scenes', 'fx-finale-evening.yaml')) as Raw);
    ((ev.panels as Raw[])[2] as Raw).if_arc_ending = ['C'];
    expect(sceneSchema.safeParse(ev).error?.issues.map((i) => i.message).join('\n')).toMatch(/the epigraph panel is shown to everyone/);
    const flag = clone(readYaml(join(FINALE, 'scenes', 'fx-finale-ending-c.yaml')) as Raw);
    delete flag.if_arc_ending;
    expect(sceneSchema.safeParse(flag).error?.issues.map((i) => i.message).join('\n')).toMatch(/scene-level if_flag \/ unless_flag goes with if_arc_ending/);
  });
});

describe('R22: round-1 review fixes (finale)', () => {
  it('psych M1: every outcome of the close beat and Teo\'s chat opens the reveal', () => {
    const teo = clone(rawFinale('fx-finale-arc-teo.yaml'));
    delete (outcomes(teo).stopped as Raw).reveal;
    expect(schemaErrors(teo).join('\n')).toMatch(/every outcome of the finale's Teo's chat opens the reveal card/);
    const close = clone(rawFinale('fx-finale-arc-close.yaml'));
    delete (outcomes(close).reported_profile as Raw).reveal;
    expect(schemaErrors(close).join('\n')).toMatch(/every outcome of the finale's close beat opens the reveal card/);
    const s = finale('fx-finale-arc-teo.yaml');
    for (const a of ['little_cant_hurt', 'photo_check_teo', 'tell_report', 'stop_replying']) {
      const st = step(s, ctx({ timerMode: 'off' }), startScenario(s, ctx({ timerMode: 'off' })), act(a));
      expect(viewOf(s, ctx({ timerMode: 'off' }), st).consequenceReveal, a).toBe(true);
    }
  });
  it('psych M1: arc_told_someone is set by a report, a photo check or asking someone, never by stepping away', () => {
    const close = clone(rawFinale('fx-finale-arc-close.yaml'));
    delete (outcomes(close).same_picture as Raw).sets_flags;
    expect(schemaErrors(close).join('\n')).toMatch(/a report, photo check or asking someone sets arc_told_someone/);
    const teo = clone(rawFinale('fx-finale-arc-teo.yaml'));
    (outcomes(teo).stopped as Raw).sets_flags = [ARC_TOLD_SOMEONE];
    expect(schemaErrors(teo).join('\n')).toMatch(/stepping away is not telling someone/);
  });
  it('finale scenarios have no timer', () => {
    const r = clone(rawFinale('fx-finale-arc-recovery.yaml'));
    r.pressure = { timer: true, levers: [] };
    expect(schemaErrors(r).join('\n')).toMatch(/the finale block has no timer/);
  });
  it('psych M4: an authored recovery_note shows on the "Your steps" screen; it needs damage control', () => {
    const s = finale('fx-finale-arc-recovery.yaml');
    const st = run(s, ctx({ timerMode: 'off' }), [act('pay_fee')]);
    expect(viewOf(s, ctx({ timerMode: 'off' }), st).recovery?.note).toBe("Recovery offers often follow a loss because scammers share victims' details. That says nothing about you.");
    const bad = clone(rawFinale('fx-finale-arc-recovery.yaml'));
    (outcomes(bad).deleted as Raw).recovery_note = 'A note.';
    expect(schemaErrors(bad).join('\n')).toMatch(/recovery_note is shown with damage control/);
  });
  it('sceptic nb4: the reveal step\'s tell and habit are content (arc_finale.reveal), never blame', () => {
    expect(chapter().arc_finale?.reveal).toEqual({ tell: 'Same picture, other names.', habit: 'A photo check and a trusted person beat a feeling.' });
    const f = chapterRaw().arc_finale as Raw;
    const errs = chapterSchema.safeParse({ ...chapterRaw(), arc_finale: { ...f, reveal: { tell: 'You fell for it.', habit: 'x' } } }).error?.issues.map((i) => i.message).join('\n');
    expect(errs).toMatch(/the reveal is never blame/);
  });
  it('QA B2: arc damage control options are shuffled, seeded by the close beat\'s id (stable, a permutation)', () => {
    const f = chapter().arc_finale;
    if (!f) throw new Error('fixture has arc_finale');
    const opts = f.damage_control.map((x) => ({ step: x.step, category: x.category }));
    const a = orderOptions(opts, f.close);
    expect(a).toEqual(orderOptions(opts, f.close));
    expect([...a].map((o) => o.step).sort()).toEqual(opts.map((o) => o.step).sort());
    expect(['x', 'y', 'z', f.close].some((seed) => orderOptions(opts, seed).map((o) => o.step).join() !== opts.map((o) => o.step).join())).toBe(true);
  });
});

describe('CR-43: chapter validator for arc_finale', () => {
  it('slot 10 only; three different finale scenarios outside scenario_order; three different names', () => {
    const errs = (over: Raw) => chapterSchema.safeParse({ ...chapterRaw(), ...over }).error?.issues.map((i) => i.message).join('\n') ?? '';
    expect(errs({ slot: 9 })).toMatch(/arc_finale is for the finale \(slot 10/);
    expect(errs({ scenario_order: { am: ['fx-finale-01-warning', 'fx-finale-arc-teo'], pm: [] } })).toMatch(/plays in the finale block, not in scenario_order/);
    expect(errs({ arc_finale: { ...(chapterRaw().arc_finale as Raw), reveal_names: ['Alex', 'alex', 'Sacha'] } })).toMatch(/three different names/);
  });
  it('the named scenarios exist with the matching finale role; the first reveal name is the arc character\'s', () => {
    const c = chapter();
    const f = c.arc_finale;
    if (!f) throw new Error('fixture has arc_finale');
    const wrong = { ...c, arc_finale: { ...f, close: 'fx-finale-arc-teo', teo: 'fx-finale-arc-close' } } as Chapter;
    expect(chapterRules(wrong, 'fxfinale', finaleScenarios(), reg).errors.join('\n')).toMatch(/must be role: arc with finale: close/);
    const names = { ...c, arc_finale: { ...f, reveal_names: ['Robin', 'Alex', 'Sacha'] as [string, string, string] } } as Chapter;
    expect(chapterRules(names, 'fxfinale', finaleScenarios(), reg).errors.join('\n')).toMatch(/the first name is the arc character's \("Alex"\)/);
  });
});

it('ticks do nothing odd on a browser overlay beat (no real countdown)', () => {
  const s = fixture('cr42-browser-overlay.yaml');
  const st = run(s, ctx({ timerMode: 'off' }), [tick(30)]);
  expect(st.phase).toBe('playing');
});
