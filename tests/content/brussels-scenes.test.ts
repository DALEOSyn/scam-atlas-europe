/**
 * Brussels story scenes (T-3.12 part 2; GDD §30.2, §30.6, §30.14 item 9; STORY §1.5, §3.10, §5; R19, R22, CR-43(d),
 * CR-44): wiring and the resolution list, the fixed wording word for word, the story-only variant
 * brussels_bank_called opening the resolution, exactly one ending scene per arc ending, the gating of every
 * "you told someone" line on arc_told_someone (R22), the two psych notes on ending wording (A′'s "You stepped
 * back early…" only for a player who told nobody; C never "before anything else"), Adaeze's last line just before
 * Noor's If-then and as the epigraph (R19(3)), Noor never sharing, the panel budget, sensitive flags and the
 * content note (STORY §5.6, R19(4)), and the art rules the generic validator cannot see (crop/flip, alt per
 * crop, expressions in the SVGs, listeners, habit poses).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { listFiles } from '../../scripts/lib/content.ts';
import { resolutionSceneIds, scenePlaysFor, visiblePanels } from '../../src/engine/story.ts';
import { ARC_CHECKED, ARC_TOLD_SOMEONE, baseExpression, chapterSchema, sceneSchema, type Scene, type ScenePanel } from '../../src/content/schema.ts';
import type { ArcEnding } from '../../src/engine/arc.ts';
import { CONTENT } from './fixtures.ts';

const yaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const brussels = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'brussels.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'brussels'), ['.yaml']).map((f) => {
    const s = sceneSchema.parse(yaml(f));
    return [s.id, s];
  }),
);
const scene = (id: string): Scene => {
  const s = scenes.get(id);
  if (!s) throw new Error(`scene ${id} is missing`);
  return s;
};
const text = (p: ScenePanel): string =>
  [p.line, p.caption, p.alt, p.local?.text, p.local?.translation, p.if_then?.cue, p.if_then?.action, p.if_then?.extra, p.choice?.prompt, p.choice?.reply, ...(p.choice?.options ?? [])]
    .filter(Boolean)
    .join(' ');
const all = (s: Scene) => s.panels.map(text).join(' ');
const svgExpressions = (id: string): Set<string> =>
  new Set([...readFileSync(join(CONTENT, '..', 'public', 'art', 'cast', `${id}.svg`), 'utf8').matchAll(/id="x-([a-z-]+)"/g)].map((m) => m[1] ?? ''));

const RESOLUTION = ['brussels-resolution-open', 'brussels-ending-c', 'brussels-ending-r', 'brussels-ending-a', 'brussels-ending-a-prime', 'brussels-ending-b', 'brussels-feelings', 'brussels-open-evening'];
const ENDING_SCENES: Record<ArcEnding, string> = { A: 'brussels-ending-a', A_prime: 'brussels-ending-a-prime', B: 'brussels-ending-b', C: 'brussels-ending-c', R: 'brussels-ending-r' };

/**
 * A finale state: the ending, whether money went in (alex_invested counts as a flag), told someone
 * (arc_told_someone), the close beat's solo photo check (arc_checked), Teo's chat photo check or report
 * (arc_helped_teo, R28), the boss fall.
 */
interface State {
  ending: ArcEnding;
  invested: boolean;
  told: boolean;
  checked: boolean;
  helped: boolean;
  bank: boolean;
}
/**
 * Every [told, checked, helped] triple an ending can reach (GDD §30.6, arcEnding/finalePlan; R25(5), CR-51, R28):
 * - B and C: the close beat (photo check: arc_checked, plus arc_told_someone if an earlier arc slot was decided by
 *   asking someone; report: arc_told_someone) or an earlier report (CR-51: arc_told_someone); never neither flag.
 *   No Teo's chat, so never arc_helped_teo.
 * - A: reported at slot ≤ 6, so CR-51 always set arc_told_someone; Teo's chat may set arc_helped_teo; no close beat.
 * - A′: two Closes at slot 1, so only Teo's chat can set arc_told_someone, always with arc_helped_teo.
 * - R: "Tell me now"; arc_told_someone from Teo's chat (with arc_helped_teo, R without money only) or an earlier
 *   ask_someone, or not; no close beat.
 */
const FLAG_SETS: Record<ArcEnding, [boolean, boolean, boolean][]> = {
  A: [[true, false, true], [true, false, false]],
  A_prime: [[true, false, true], [false, false, false]],
  B: [[true, true, false], [false, true, false], [true, false, false]],
  C: [[true, true, false], [false, true, false], [true, false, false]],
  R: [[true, false, true], [true, false, false], [false, false, false]],
};
/** Every state the dispatch can reach: A, A′ and B have nothing in; C has money in. */
const STATES: State[] = (['A', 'A_prime', 'B', 'C', 'R'] as ArcEnding[]).flatMap((ending) =>
  (ending === 'C' ? [true] : ending === 'R' ? [true, false] : [false]).flatMap((invested) =>
    FLAG_SETS[ending]
      .filter(([, , helped]) => !(helped && invested))
      .flatMap(([told, checked, helped]) => [true, false].map((bank) => ({ ending, invested, told, checked, helped, bank }))),
  ),
);
const ARC_HELPED_TEO = 'arc_helped_teo';
const flagsOf = (st: State) =>
  new Set([...(st.invested ? ['alex_invested'] : []), ...(st.told ? [ARC_TOLD_SOMEONE] : []), ...(st.checked ? [ARC_CHECKED] : []), ...(st.helped ? [ARC_HELPED_TEO] : []), ...(st.bank ? ['brussels_bank_called'] : [])]);
/** The scenes and panels a run in this state sees, in order (as app.tsx playScene + ScenePlayer). */
const run = (st: State) =>
  resolutionSceneIds(brussels)
    .map(scene)
    .filter((s) => scenePlaysFor(s, st.ending, flagsOf(st)))
    .map((s) => ({ id: s.id, panels: visiblePanels(s, flagsOf(st), st.ending) }));
const runLines = (st: State) => run(st).flatMap((s) => s.panels.map((p) => p.line).filter((l): l is string => !!l));
const label = (st: State) => `${st.ending} invested=${st.invested} told=${st.told} checked=${st.checked} helped=${st.helped} bank=${st.bank}`;

const TEO_A = ['Same picture, different name.', 'Asking was the smart bit.'];
const R_LINE = 'Sometimes you just want to know. Asking is never wrong.';
const C_KIND = 'You were kind to someone who turned out not to exist. The lie was theirs, not yours.';
const C_RECOVERY = 'Stop paying, call the bank on the number on your card, and keep the chats. The Help link shows who else can help.';
const C_TEO = "I typed my card into a prize page, remember? It happens. What counts is what you do next, and you're doing it.";
const C_CHECKED = "You checked in the end. That's what works.";
const C_REPORTED = "You reported it. That's what works.";
const A_HELPED = "Teo asked you, and you helped him. That's what works.";
const A_REPORTED = "And you reported yours early. That's what works.";
const A_STEPPED_BACK = "You stepped back early, and you never sent any money. Next time, telling someone too makes it even easier.";
const B_TOLD = "You told someone, and the timeline did the rest. That's the whole trick.";
const B_UNTOLD = "You never sent any money, and the timeline did the rest. Next time, telling someone early makes it even easier.";
const B_PATTERN = "Friendly, patient, and asking for a bit more each time. It's built to work on anyone.";
const BANK = "The bank was called straight away, the right first step. We'll see what it can do. IT will check the laptop too.";
const OPEN = 'The Open Evening is tomorrow. Before we carry the boxes over, sit with me a minute.';
const FEELINGS = ['The chats felt real because you were real.', "It's fine to feel sad, embarrassed, or both. Talking to someone helps."];
const NOOR = 'I nearly said yes. Then I asked you, and I told Mum too. Asking was the smart bit.';
const ADAEZE_LAST = 'Pause. Check on a number or app you already know. Ask someone. Then be the someone for the next person.';

interface BossFile {
  outcomes: Record<string, { sets_flags?: string[]; recovery?: unknown[] }>;
}
const boss = yaml(join(CONTENT, 'scenarios', 'brussels', 'brussels-09-boss-helpdesk.yaml')) as BossFile;

describe('Brussels scenes are wired into the chapter (GDD §30.2, CR-43(d))', () => {
  it('arrival, the turn at the stop point after 10-3, and the resolution list in order; no placed beat', () => {
    expect(brussels.scenes).toEqual({ arrival: 'brussels-arrival', turn: 'brussels-turn', resolution: RESOLUTION, placed: [] });
    expect(brussels.scenario_order.am.at(-1)).toBe('brussels-03-new-bank-details');
    expect(brussels.scenario_order.pm[0]).toBe('brussels-04-noor-easy-money');
    expect(scene('brussels-arrival').slot).toBe('arrival');
    expect(scene('brussels-turn').slot).toBe('turn');
    for (const id of RESOLUTION) expect(scene(id).slot, id).toBe('resolution');
    expect([...scenes.keys()].sort()).toEqual(['brussels-arrival', 'brussels-turn', ...RESOLUTION].sort());
  });
  it('one ending scene per arc ending, keyed by if_arc_ending; R splits on alex_invested inside its scene', () => {
    for (const [ending, id] of Object.entries(ENDING_SCENES)) {
      expect(scene(id).if_arc_ending, id).toEqual([ending]);
      expect(scene(id).if_flag, id).toBeUndefined();
      expect(scene(id).unless_flag, id).toBeUndefined();
    }
    for (const id of ['brussels-resolution-open', 'brussels-feelings', 'brussels-open-evening']) expect(scene(id).if_arc_ending, id).toBeUndefined();
  });
  it('every reachable state plays the opening, exactly its own ending scene, the feelings scene and the Open Evening', () => {
    for (const st of STATES) {
      expect(run(st).map((s) => s.id), label(st)).toEqual(['brussels-resolution-open', ENDING_SCENES[st.ending], 'brussels-feelings', 'brussels-open-evening']);
      for (const s of run(st)) expect(s.panels.length, `${label(st)} ${s.id}`).toBeGreaterThan(0);
    }
  });
});

describe('panel budget (GDD §30.2: about 16–17 panels, each scene at most 6)', () => {
  it('counts per scene', () => {
    expect(scene('brussels-arrival').panels).toHaveLength(2);
    expect(scene('brussels-turn').panels).toHaveLength(2);
    expect(scene('brussels-feelings').panels).toHaveLength(2);
    expect(scene('brussels-open-evening').panels).toHaveLength(5);
    const seen = (id: string, st: Partial<State>) => visiblePanels(scene(id), flagsOf({ ending: 'B', invested: false, told: false, checked: false, helped: false, bank: false, ...st }), st.ending ?? 'B').length;
    expect(seen('brussels-resolution-open', {})).toBe(1);
    expect(seen('brussels-resolution-open', { bank: true })).toBe(2);
    // R25(4), T-3.13h: ending C is 3 panels on every path.
    expect(seen('brussels-ending-c', { ending: 'C', invested: true, checked: true })).toBe(3);
    expect(seen('brussels-ending-c', { ending: 'C', invested: true, told: true, checked: true })).toBe(3);
    expect(seen('brussels-ending-c', { ending: 'C', invested: true, told: true })).toBe(3);
    // psych on T-3.13 (R25(4) reasoning): R with money drops Adaeze's warm panel too.
    expect(seen('brussels-ending-r', { ending: 'R', invested: true })).toBe(3);
    expect(seen('brussels-ending-r', { ending: 'R' })).toBe(3);
    expect(seen('brussels-ending-a', { ending: 'A' })).toBe(3);
    expect(seen('brussels-ending-a-prime', { ending: 'A_prime' })).toBe(3);
    expect(seen('brussels-ending-b', {})).toBe(2);
  });
  it('the longest run is 16 panels (T-3.13 trims: C and R with money at 3) with the arrival and the turn; no scene has more than 6', () => {
    for (const s of scenes.values()) expect(s.panels.length, s.id).toBeLessThanOrEqual(6);
    const total = (st: State) => 4 + run(st).reduce((n, s) => n + s.panels.length, 0);
    expect(Math.max(...STATES.map(total))).toBe(16);
    expect(Math.min(...STATES.map(total))).toBe(14);
  });
});

describe('fixed wording (STORY §3.10, §4.4, §5.6; GDD §30.2)', () => {
  it('arrival: Adaeze thinking, then the caption over Teo laughing and Noor', () => {
    const [a, b] = scene('brussels-arrival').panels;
    expect(a).toMatchObject({ speaker: 'adaeze', expression: 'thinking', line: 'Two days to the Open Evening. The laptop and I are not friends.' });
    expect(b).toMatchObject({ speaker: 'teo', expression: 'laughing', with: { id: 'noor', expression: 'calm' }, caption: 'Teo and Noor arrive with one suitcase too many.' });
    expect(b?.line).toBeUndefined();
  });
  it('turn: Noor thinking, then your reply (thinking → warm); no choice', () => {
    const [a, b] = scene('brussels-turn').panels;
    expect(a).toMatchObject({ speaker: 'noor', expression: 'thinking', line: "Can I ask you something later? It's probably nothing." });
    expect(b).toMatchObject({ speaker: 'you', line: "Any time. I'm here." });
    expect(scene('brussels-turn').panels.some((p) => p.choice)).toBe(false);
  });
  it('the ending lines per state, word for word', () => {
    const want = (st: State): string[] => {
      switch (st.ending) {
        case 'C':
          return [st.checked ? C_CHECKED : C_REPORTED, C_RECOVERY, C_TEO];
        case 'R':
          return st.invested ? [C_RECOVERY, C_TEO, R_LINE] : [...TEO_A, R_LINE];
        case 'A':
          return [...TEO_A, st.helped ? A_HELPED : A_REPORTED];
        case 'A_prime':
          return [...TEO_A, st.helped ? A_HELPED : A_STEPPED_BACK];
        case 'B':
          return [B_PATTERN, st.told ? B_TOLD : B_UNTOLD];
      }
    };
    for (const st of STATES) {
      const ending = run(st).find((s) => s.id === ENDING_SCENES[st.ending]);
      expect(ending?.panels.map((p) => p.line), label(st)).toEqual(want(st));
    }
  });
  it('Teo is sheepish, then proud; C: Adaeze calm, Adaeze calm (recovery), Teo warm last; R-with-money: Adaeze calm (recovery), Teo warm, Teo (R line)', () => {
    for (const id of ['brussels-ending-a', 'brussels-ending-a-prime']) {
      expect(scene(id).panels.slice(0, 2).map((p) => [p.speaker, p.expression]), id).toEqual([
        ['teo', 'sheepish'],
        ['teo', 'proud'],
      ]);
    }
    for (const st of STATES.filter((x) => x.ending === 'C')) {
      const c = visiblePanels(scene('brussels-ending-c'), flagsOf(st), 'C');
      expect(c.map((p) => [p.speaker, p.expression]), label(st)).toEqual([
        ['adaeze', 'calm'],
        ['adaeze', 'calm'],
        ['teo', 'warm'],
      ]);
    }
    // R25(4), T-3.13h: Adaeze's warm panel is dropped from C (the arc damage control opens with "The lie was theirs").
    expect(scene('brussels-ending-c').panels.some((p) => p.line === C_KIND)).toBe(false);
    expect(scene('brussels-ending-r').panels.some((p) => p.line === C_KIND)).toBe(false);
    const r = visiblePanels(scene('brussels-ending-r'), flagsOf({ ending: 'R', invested: true, told: false, checked: false, helped: false, bank: false }), 'R');
    expect(r.map((p) => [p.speaker, p.expression])).toEqual([
      ['adaeze', 'calm'],
      ['teo', 'warm'],
      ['teo', 'warm'],
    ]);
    expect(scene('brussels-ending-r').panels.at(-1)).toMatchObject({ speaker: 'teo', expression: 'warm', line: R_LINE });
  });
  it('feelings: both lines word for word, for every player', () => {
    expect(scene('brussels-feelings').panels.map((p) => p.line)).toEqual(FEELINGS);
    for (const st of STATES) expect(runLines(st).filter((l) => FEELINGS.includes(l)), label(st)).toEqual(FEELINGS);
  });
  it('the Open Evening: Noor relieved, the video-wall caption, the postcard pick, Adaeze\'s last line, Noor\'s If-then', () => {
    const p = scene('brussels-open-evening').panels;
    expect(p[0]).toMatchObject({ speaker: 'noor', expression: 'relieved', line: NOOR });
    expect(p[1]?.caption).toBe('Everyone you met, on one wall.');
    expect(p[1]?.speaker).toBeUndefined();
    expect(p[2]).toMatchObject({ speaker: 'teo', flip_postcard: true });
    expect(p[2]?.expression).toBe('warm-postcard');
    expect(p[3]).toMatchObject({ speaker: 'adaeze', expression: 'proud', epigraph: true, line: ADAEZE_LAST });
    expect(p[4]?.speaker).toBe('noor');
    expect(p[4]?.if_then).toEqual({
      cue: 'If an easy-money offer wants my bank login or card,',
      action: 'then I say no and ask someone first.',
      extra: 'Nobody needs your screen, either.',
    });
  });
  it("R19(3): Adaeze's last line is the panel just before the If-then, shown to everyone, and the only epigraph", () => {
    for (const st of STATES) {
      const panels = run(st).flatMap((s) => s.panels);
      expect(panels.at(-1)?.if_then, label(st)).toBeDefined();
      expect(panels.at(-2), label(st)).toMatchObject({ speaker: 'adaeze', line: ADAEZE_LAST, epigraph: true });
    }
    const epigraphs = [...scenes.values()].flatMap((s) => s.panels.filter((p) => p.epigraph));
    expect(epigraphs).toHaveLength(1);
    const last = scene('brussels-open-evening').panels.at(-1);
    expect([last?.if_flag, last?.unless_flag, last?.if_arc_ending]).toEqual([undefined, undefined, undefined]);
  });
  it('the content notes word for word (STORY §5.6, R19(4)); the ending and feelings scenes are sensitive, the others not', () => {
    expect(brussels.content_note).toBe('This chapter ends the trip, including the Alex storyline. It touches on friendship, feeling let down, money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away.');
    expect(brussels.content_note_arc_closed).toBe('This chapter ends the trip and touches on money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away.');
    for (const id of [...Object.values(ENDING_SCENES), 'brussels-feelings']) expect(scene(id).sensitive, id).toBe(true);
    for (const id of ['brussels-arrival', 'brussels-turn', 'brussels-resolution-open', 'brussels-open-evening']) expect(scene(id).sensitive, id).toBe(false);
    for (const s of scenes.values()) expect(s.content_note, s.id).toBeUndefined();
  });
});

describe('brussels_bank_called opens the resolution (GDD §30.2, STORY §4.2 rule 5)', () => {
  it('every boss fall sets it, and no safe outcome does', () => {
    const falls = Object.entries(boss.outcomes)
      .filter(([, o]) => o.recovery?.length)
      .map(([id]) => id)
      .sort();
    expect(falls.length).toBeGreaterThan(0);
    const setting = Object.entries(boss.outcomes)
      .filter(([, o]) => o.sets_flags?.includes('brussels_bank_called'))
      .map(([id]) => id)
      .sort();
    expect(setting).toEqual(falls);
  });
  it('it is the first panel of the resolution, Adaeze calm, word for word; the shared panel follows', () => {
    const open = scene('brussels-resolution-open');
    expect(open.panels[0]).toMatchObject({ speaker: 'adaeze', expression: 'calm', if_flag: 'brussels_bank_called', line: BANK });
    expect(open.panels[1]).toMatchObject({ speaker: 'adaeze', line: OPEN });
    expect(open.panels[1]?.if_flag).toBeUndefined();
    for (const st of STATES) {
      const first = run(st)[0]?.panels[0]?.line;
      expect(first, label(st)).toBe(st.bank ? BANK : OPEN);
    }
    for (const id of ['brussels-arrival', 'brussels-turn', 'brussels-feelings', 'brussels-open-evening']) {
      expect(scene(id).panels.some((p) => p.if_flag || p.unless_flag || p.if_arc_ending), id).toBe(false);
    }
  });
  it('calm, no blame, no refund promise, no amount, never "again"', () => {
    expect(BANK).not.toMatch(/should|fault|careless|your mistake|will get|guarantee|refund|\bback\b|\d|€|again|twice/i);
  });
});

describe('ending wording: R22 and the psych notes (GDD §30.14 item 9)', () => {
  it('"You stepped back early…" shows only to an A′ player who told nobody (no report, no "Tell me now", no arc_told_someone)', () => {
    for (const st of STATES) {
      const start = runLines(st).includes(A_STEPPED_BACK);
      expect(start, label(st)).toBe(st.ending === 'A_prime' && !st.told);
    }
    // R28: gated on arc_helped_teo, which in A′ coincides with arc_told_someone (only Teo's chat can set either).
    const panel = scene('brussels-ending-a-prime').panels.find((p) => p.line === A_STEPPED_BACK);
    expect(panel?.unless_flag).toBe(ARC_HELPED_TEO);
    for (const id of ['brussels-ending-a', 'brussels-ending-b', 'brussels-ending-c', 'brussels-ending-r']) expect(all(scene(id)), id).not.toMatch(/too late|\bstart\b|stepped back/i);
    // psych (T-3.13): no "never too late to start" anywhere: the A′ line says what the player did instead.
    for (const s of scenes.values()) expect(all(s), s.id).not.toMatch(/never too late/i);
  });
  it('ending C never says "before anything else"; the photo-check variant is "You checked in the end." (R25(5), CR-51)', () => {
    for (const s of scenes.values()) expect(all(s), s.id).not.toMatch(/before anything else/i);
    expect(scene('brussels-ending-c').panels.find((p) => p.line === C_CHECKED)?.if_flag).toBe(ARC_CHECKED);
    expect(scene('brussels-ending-c').panels.find((p) => p.line === C_REPORTED)?.unless_flag).toBe(ARC_CHECKED);
    // psych round 2: no leading "And" (the line opens the scene).
    for (const p of scene('brussels-ending-c').panels) expect(p.line ?? '', 'ending C').not.toMatch(/^And\b/);
  });
  it('R28: arc_helped_teo gates exactly the "helped him" lines, in A and A′, each with an unless twin', () => {
    for (const s of scenes.values()) {
      const on = s.panels.filter((p) => p.if_flag === ARC_HELPED_TEO);
      const off = s.panels.filter((p) => p.unless_flag === ARC_HELPED_TEO);
      const both = s.id === 'brussels-ending-a' || s.id === 'brussels-ending-a-prime';
      expect(on.map((p) => p.line), s.id).toEqual(both ? [A_HELPED] : []);
      expect(off.length, s.id).toBe(both ? 1 : 0);
      for (const p of s.panels) if (/helped him/i.test(p.line ?? '')) expect(p.if_flag, `${s.id}: ${p.line}`).toBe(ARC_HELPED_TEO);
    }
  });
  it('arc_checked gates only ending C, and every arc_checked line has an unless twin', () => {
    for (const s of scenes.values()) {
      const on = s.panels.filter((p) => p.if_flag === ARC_CHECKED).length;
      const off = s.panels.filter((p) => p.unless_flag === ARC_CHECKED).length;
      expect([on, off], s.id).toEqual(s.id === 'brussels-ending-c' ? [1, 1] : [0, 0]);
    }
  });
  it('every line that says the player told someone is gated on arc_told_someone; every gated line has a truthful twin', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (/\byou told\b|\byou('ve)? (?:asked|talked to) someone\b|\btold someone\b/i.test(p.line ?? '')) expect(p.if_flag, `${s.id}: ${p.line}`).toBe(ARC_TOLD_SOMEONE);
      }
    }
    for (const id of Object.values(ENDING_SCENES)) {
      const told = scene(id).panels.filter((p) => p.if_flag === ARC_TOLD_SOMEONE).length;
      const notTold = scene(id).panels.filter((p) => p.unless_flag === ARC_TOLD_SOMEONE).length;
      expect(told, id).toBe(notTold);
    }
    for (const st of STATES) if (!st.told) expect(runLines(st).join(' '), label(st)).not.toMatch(/\byou told someone\b/i);
  });
  it('no ending says the player checked, reported or told someone unless that path did it', () => {
    // R25(5), CR-51: C without arc_checked reported (the close beat's report or an earlier one); B without
    // arc_told_someone did the photo check only, so it never says "reported" or "told"; A always reported at
    // slot ≤ 6 (and so always has the flag, which no longer tells Teo's chat branches apart: "helped him" is
    // gated on arc_helped_teo, R28). A′ and R never reported, so neither says "reported". Only arc_checked says
    // "you checked".
    for (const st of STATES) {
      const lines = runLines(st).join(' ');
      if (st.ending === 'A_prime' || st.ending === 'R') expect(lines, label(st)).not.toMatch(/\breported\b/i);
      if (st.ending === 'B' && !st.told) expect(lines, label(st)).not.toMatch(/\breported\b|\byou told\b/i);
      if (st.ending === 'C' && st.checked) expect(lines, label(st)).not.toMatch(/\breported\b/i);
      if (!st.checked) expect(lines, label(st)).not.toMatch(/\byou checked\b/i);
      if (!st.helped) expect(lines, label(st)).not.toMatch(/helped him/i);
      if (st.invested) expect(lines, label(st)).not.toMatch(/never sent any money/i);
    }
  });
  it('the recovery panel is in every money-in ending, promises nothing and names no amount; never in a no-money ending', () => {
    for (const st of STATES) expect(runLines(st).includes(C_RECOVERY), label(st)).toBe(st.invested);
    expect(C_RECOVERY).not.toMatch(/refund|get (?:it|the money|your money) back|will|\d|€/i);
  });
});

describe('Brussels scene rules the generic validator does not see', () => {
  it('no amount, digit, link, code or refund promise in any scene (STORY §4.2 rule 1, §5.4)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/€|\beuros?\b|\d|refund|get (?:it|the money|your money) back|recover(?:ed)?\b|IBAN|https?:|www\.|\.(?:example|test|invalid)\b|\bQR\b|@/i);
    }
  });
  it('no scam-side name, brand, app or platform; Alex never appears (STORY §2.2)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/Alex|Wordswap|Robin|Sacha|Glimmerfund|Backhaven|Marrowby|Kindhand|Larchwick|Gatewren|Weekfold|Summer Euro|Kettle|Fairmeasure|platform|pop-up|helpdesk/i);
      for (const p of s.panels) {
        if (p.speaker && p.speaker !== 'you') expect(['adaeze', 'teo', 'noor'], s.id).toContain(p.speaker);
        if (p.with) expect(['adaeze', 'teo', 'noor'], s.id).toContain(p.with.id);
      }
    }
  });
  it('no dating wording, no "again" or "twice", no blame, never a crime (STORY §2.2, §5.2; GDD §30.2)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/\bdat(e|ing)\b|anyone new|someone new|online friend|romance|love|heart|betray/i);
      expect(all(s), s.id).not.toMatch(/\bagain\b|\btwice\b|naive|gullible|obviously|should have|you fell|fooled|mistake|crime|illegal/i);
    }
  });
  it('Noor never shares: her lines say no and asking, never giving anything (R19(1))', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.speaker === 'noor') expect(text(p), s.id).not.toMatch(/\bshared?\b|\bgave\b|\bsent\b|\blent\b|my login was|my card was/i);
      }
    }
  });
  it('the turn spoils no verdict: no offer, account, job or money', () => {
    expect(all(scene('brussels-turn'))).not.toMatch(/money|offer|account|job|bank|card|login|DM|message/i);
  });
  it('the Brussels art is never EU-styled (STORY §3.10): no stars, flags or institutions in any alt', () => {
    for (const s of scenes.values()) for (const p of s.panels) expect(p.alt, s.id).not.toMatch(/\bstars?\b|\bflags?\b|institution|parliament|commission/i);
  });
  it('every expression exists in the speaker\'s and listener\'s cast SVG', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.speaker && p.speaker !== 'you' && p.expression) expect(svgExpressions(p.speaker).has(p.expression), `${s.id} ${p.speaker} ${p.expression}`).toBe(true);
        if (p.with) expect(svgExpressions(p.with.id).has(p.with.expression), `${s.id} ${p.with.id} ${p.with.expression}`).toBe(true);
      }
    }
  });
  it('listeners are never more expressive than the speaker (a warm listener only beside a warm or livelier speaker)', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (!p.with) continue;
        expect(['calm', 'warm'], s.id).toContain(p.with.expression);
        if (p.with.expression === 'warm') expect(['calm', 'thinking'], s.id).not.toContain(baseExpression(p.expression ?? 'calm'));
      }
    }
  });
  it('every crop: right panel is flipped so the speaker faces into the frame', () => {
    for (const s of scenes.values()) for (const p of s.panels) if (p.crop === 'right') expect(p.flip, `${s.id}: ${p.alt}`).toBe(true);
  });
  it('alt texts describe only what each crop shows (backdrops 960×540, about 720 px per crop)', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.backdrop === 'brussels-office') {
          // Boxes and the noticeboard stand at the left edge (x 20–192); the big plant at the right edge (x 858–932).
          if (p.crop === 'right') expect(p.alt, s.id).not.toMatch(/boxes|noticeboard/i);
          if (p.crop !== 'right') expect(p.alt, s.id).not.toMatch(/big plant/i);
          // Sceptic M1: an unflipped speaker in the centre crop stands in front of the laptop (x 300–400).
          if (p.crop === 'centre' && p.speaker && p.speaker !== 'you') expect(p.alt, s.id).not.toMatch(/laptop/i);
        }
        if (p.backdrop === 'brussels-hall') {
          // The table with cups and a plant stands at the right edge (x 800–940).
          if (p.crop !== 'right') expect(p.alt, s.id).not.toMatch(/table|cups|plant/i);
          expect(p.alt, s.id).not.toMatch(/portrait|faces|grid/i);
        }
        expect(p.alt, s.id).not.toMatch(/door|suitcase/i);
        // ART_DIRECTION §9.2, §9.6: a drawn phone is always described with its screen turned away (STORY §4.2 rule 1).
        if (/phone/i.test(p.alt)) expect(p.alt, s.id).toMatch(/screen turned away/i);
      }
    }
  });
  it("Noor's thinking, calm and relieved art hold her phone, screen turned away: her alts say so (sceptic M2)", () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        const noor = p.speaker === 'noor' || p.with?.id === 'noor';
        if (noor) expect(p.alt, s.id).toMatch(/phone, screen turned away/);
      }
    }
  });
  it('habit poses: no phone pose in the finale scenes (nobody calls or opens an app here); Teo holds the postcard', () => {
    for (const s of scenes.values()) for (const p of s.panels) expect(p.expression ?? '', s.id).not.toMatch(/-phone-(?:ear|look)$/);
    const flip = scene('brussels-open-evening').panels.find((p) => p.flip_postcard);
    expect(flip?.expression).toBe('warm-postcard');
  });
  it('the office plays before the Open Evening; the hall only at the Open Evening', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) expect(p.backdrop, s.id).toBe(s.id === 'brussels-open-evening' ? 'brussels-hall' : 'brussels-office');
    }
  });
});
