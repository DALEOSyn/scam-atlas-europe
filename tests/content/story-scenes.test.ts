/**
 * S4 story scenes (T-S4b): the authored scenes for Home, Berlin, Amsterdam and interlude I1 match the
 * story bible where its wording is fixed (STORY §3, §4.4, §5.6, §6) and keep the scene rules that the
 * generic validator cannot see (order, placement, habit poses, outcome-neutral claims).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { listFiles } from '../../scripts/lib/content.ts';
import { visiblePanels } from '../../src/engine/story.ts';
import { castMemberSchema, chapterSchema, sceneSchema, type Chapter, type Scene, type ScenePanel } from '../../src/content/schema.ts';
import { CONTENT } from './fixtures.ts';

const yaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const chapter = (id: string): Chapter => chapterSchema.parse(yaml(join(CONTENT, 'chapters', `${id}.yaml`)));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes'), ['.yaml']).map((f) => {
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
const ifThen = (id: string) => scene(id).panels.at(-1)?.if_then;

describe('S4 scenes are wired into their chapters (STORY §6, GDD §22.1)', () => {
  it('Home, Berlin and Amsterdam name an arrival, a turn and a resolution with the right slots', () => {
    for (const city of ['home', 'berlin', 'amsterdam']) {
      const c = chapter(city);
      expect(c.scenes?.arrival, city).toBe(`${city}-arrival`);
      expect(c.scenes?.turn, city).toBe(`${city}-turn`);
      expect(c.scenes?.resolution, city).toBe(`${city}-resolution`);
      for (const slot of ['arrival', 'turn', 'resolution'] as const) expect(scene(`${city}-${slot}`).slot).toBe(slot);
    }
  });
  it("Amsterdam's local problem plays at the stop point, after 2-3 and the 2-4 drill", () => {
    const c = chapter('amsterdam');
    expect(c.scenes?.placed).toEqual([{ scene: 'amsterdam-sanne-story', after: 'amsterdam-04-noor-lock-down' }]);
    expect(c.scenario_order.am.at(-1)).toBe('amsterdam-04-noor-lock-down');
    expect(scene('amsterdam-sanne-story').slot).toBe('beat');
  });
  it('the Atlas pages link the habit cards named in STORY §3', () => {
    expect(chapter('home').atlas_cards).toEqual(['stop-the-damage-first', 'ask-someone', 'open-it-yourself']);
    expect(chapter('berlin').atlas_cards).toEqual(['open-it-yourself', 'read-the-link', 'hang-up-call-back']);
    expect(chapter('amsterdam').atlas_cards).toEqual(['call-the-number-you-know', 'easy-money-costs-you', 'check-who-gets-the-money']);
  });
});

describe('fixed wording (STORY §4.4, §5.6)', () => {
  it('If-then lines are word for word', () => {
    expect(ifThen('home-resolution')).toEqual({ cue: "If I've typed my card in somewhere odd,", action: 'then I block it in the bank app and tell someone.' });
    expect(ifThen('berlin-resolution')).toEqual({ cue: 'If a parcel message wants money or a click,', action: "then I open the courier's app myself." });
    expect(ifThen('amsterdam-resolution')).toEqual({
      cue: "If someone messages me for money I didn't expect,",
      action: 'then I call them on the number I already have.',
      extra: 'A real job pays you.',
    });
  });
  it('the If-then speaker is the local, except Home (Teo)', () => {
    expect(scene('home-resolution').panels.at(-1)?.speaker).toBe('teo');
    expect(scene('berlin-resolution').panels.at(-1)?.speaker).toBe('jonas');
    expect(scene('amsterdam-resolution').panels.at(-1)?.speaker).toBe('sanne');
  });
  it('Amsterdam carries the exact content note, and its family-emergency scenes are sensitive', () => {
    expect(chapter('amsterdam').content_note).toBe('This chapter includes a family-emergency story. Everyone ends up safe. You can pause or skip any story scene.');
    expect(scene('amsterdam-sanne-story').sensitive).toBe(true);
    expect(scene('amsterdam-turn').sensitive).toBe(true);
    expect(scene('amsterdam-resolution').sensitive).toBe(true);
    expect(scene('amsterdam-arrival').sensitive).toBe(false);
  });
  it("Sanne's story ends relieved and the player's line puts the blame on the scammers", () => {
    const s = scene('amsterdam-sanne-story');
    expect(s.panels.at(-1)?.expression).toBe('relieved');
    expect(s.panels.find((p) => p.speaker === 'you')?.line).toMatch(/this is on them, not you/);
  });
  it('the Home rehearsal and the I1 check-in give one shared reply (STORY §3.0, §3.12)', () => {
    const rehearsal = scene('home-turn').panels.find((p) => p.choice)?.choice;
    expect(rehearsal).toEqual({ prompt: 'A message rushes you. First move?', options: ['Pause', 'Check who sent it', 'Ask someone'], reply: 'All three work. Pausing first makes the other two easier.' });
    const i1 = scene('i1-teo-cafe');
    expect(i1).toMatchObject({ chapter: 'interludes', slot: 'interlude', after_middle: 2 });
    expect(i1.panels.filter((p) => p.flip_postcard)).toHaveLength(1);
    expect(i1.panels.find((p) => p.choice)?.choice).toEqual({
      prompt: 'Made any friends on your travels?',
      options: ['A few', 'Mostly work so far'],
      reply: 'Good. Same rule for old friends and new: if anyone asks for money or secrets, tell me.',
    });
  });
});

describe('scene rules the generic validator does not see', () => {
  it('the Berlin turn never mentions Brewnook, codes or fees (STORY §6.2)', () => {
    const all = scene('berlin-turn').panels.map(text).join(' ');
    expect(all).not.toMatch(/brewnook|code|fee/i);
  });
  it('no S4 scene mentions dating or "anyone new" (STORY §2.2)', () => {
    for (const s of scenes.values()) expect(s.panels.map(text).join(' '), s.id).not.toMatch(/\bdat(e|ing)\b|anyone new|someone new|online friend/i);
  });
  it('habit poses mean one thing: phone-ear = calling a known number, phone-look = opening the app yourself', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        const words = text(p);
        if (p.expression?.endsWith('-phone-ear')) expect(words, s.id).toMatch(/\bcall|number (?:I|you|he|she) (?:already )?(?:have|has|know)|directory number|number in (?:our|your) file/i);
        // Dublin: the regulator's register is a home-screen tool you open yourself (GDD §28.9, CR-38).
        if (p.expression?.endsWith('-phone-look')) expect(words, s.id).toMatch(/\bapp\b|\b(?:on|in) the [\w' ]*register (?:myself|yourself)\b/i);
      }
    }
  });
  it('Amsterdam sets up the canal boat (2-6) and the evening flight (2-9) before either scenario, with no amount', () => {
    const arrival = scene('amsterdam-arrival').panels.map(text).join(' ');
    expect(arrival).toMatch(/canal boat/i);
    expect(arrival).toMatch(/breakfast/i);
    expect(arrival).toMatch(/last evening I fly/i);
    expect(arrival).not.toMatch(/€|euro/i);
    // The boat panel itself names no payment request, so 2-6's request arrives as the scenario's own content.
    const boat = scene('amsterdam-arrival').panels.find((p) => /canal boat/i.test(p.line ?? ''));
    expect(boat?.speaker).toBe('mateus');
    expect(boat?.line).not.toMatch(/request|pay/i);
  });
  it('Amsterdam resolution claims only outcome-neutral facts (the player\'s own interview depends on 2-5)', () => {
    const all = scene('amsterdam-resolution').panels.map(text).join(' ');
    expect(all).not.toMatch(/we both|you got|your interview|thanks to you|because you/i);
  });
  it('Sanne is in the cast with the guesthouse desk as her known channel; the impersonated are shown safe', () => {
    const cast = (yaml(join(CONTENT, 'cast.yaml')) as { cast: unknown[] }).cast.map((c) => castMemberSchema.parse(c));
    expect(cast.find((c) => c.id === 'sanne')?.known_channel?.label).toBe('Guesthouse desk');
    // Noor after 2-3 (turn) and Mateus after the boss (resolution) appear on video, fine (STORY §5.7).
    expect(scene('amsterdam-turn').panels.some((p) => p.speaker === 'noor' && p.video)).toBe(true);
    expect(scene('amsterdam-resolution').panels.some((p) => p.speaker === 'mateus' && p.video && p.expression === 'relieved')).toBe(true);
  });
});

describe('Madrid and Warsaw scenes (T-S4e; STORY §3.4, §3.5; GDD §24.2, §25.2)', () => {
  const shown = (id: string, flags: string[] = []) => visiblePanels(scene(id), new Set(flags));
  const words = (id: string, flags: string[] = []) => shown(id, flags).map(text).join(' ');
  const refund = /refund|money back|get it back|you'll get|we'll get/i;

  it('both chapters name an arrival, a turn and a resolution; Warsaw places Kasia\'s beat after drill 5-7', () => {
    for (const city of ['madrid', 'warsaw']) {
      const c = chapter(city);
      for (const slot of ['arrival', 'turn', 'resolution'] as const) {
        expect(c.scenes?.[slot], city).toBe(`${city}-${slot}`);
        expect(scene(`${city}-${slot}`).slot).toBe(slot);
      }
    }
    expect(chapter('madrid').scenes?.placed).toEqual([]);
    expect(chapter('warsaw').scenes?.placed).toEqual([{ scene: 'warsaw-kasia-back', after: 'warsaw-07-mateus-asks' }]);
    expect(scene('warsaw-kasia-back').slot).toBe('beat');
    // No content note (Madrid ruling R11; Warsaw has none in STORY §5.6): nothing is marked sensitive.
    for (const id of [...scenes.keys()].filter((k) => /^(madrid|warsaw)-/.test(k))) expect(scene(id).sensitive, id).toBe(false);
    expect(chapter('madrid').content_note).toBeUndefined();
    expect(chapter('warsaw').content_note).toBeUndefined();
  });
  it('If-then lines are word for word, with their extra lines; the speakers are Lucía and Mateus (Warsaw exception)', () => {
    expect(scene('madrid-resolution').panels.at(-1)).toMatchObject({
      speaker: 'lucia',
      expression: 'calm-phone-ear',
      if_then: { cue: 'If someone says my money isn\'t safe,', action: 'then I hang up and call the number on my card.', extra: 'No real bank asks you to move your money to keep it safe.' },
    });
    expect(scene('warsaw-resolution').panels.at(-1)).toMatchObject({
      speaker: 'mateus',
      expression: 'calm-phone-ear',
      if_then: { cue: 'If anyone asks for a code, even a friend,', action: "then I don't send it, and I call them on the number I know.", extra: 'Money comes to you inside the app.' },
    });
  });
  it('fixed lines from the spec', () => {
    expect(words('madrid-arrival')).toContain("Coffee's there. I'm going to sleep for a year.");
    expect(words('madrid-arrival')).toContain('Every euro is saved for the flat. Even this coffee is in a spreadsheet.');
    expect(words('madrid-turn')).toContain('After nights, my rule: no big decisions until I\'ve slept. Not one.');
    expect(words('madrid-resolution')).toContain('Signed. And I checked every step in the app myself.');
    expect(words('madrid-resolution')).toContain('Sleepy or not, same rule.');
    expect(words('warsaw-arrival')).toContain('Everything must go, except the cello.');
    expect(words('warsaw-turn')).toContain('the deal and the money stay inside Swaploft.');
    expect(words('warsaw-resolution')).toContain("Kasia's account asked for my code and I sent it. Me. The gadget guy.");
    expect(words('warsaw-resolution')).toContain('It wasn\'t really me. And you fixed it fast.');
    expect(words('warsaw-kasia-back')).toContain("Someone got into my Brewnook while I was playing. I've got it back in the app and turned on two-step.");
    expect(words('madrid-turn')).toContain('So I\'ll make the decisions. Kidding.');
    expect(words('warsaw-kasia-back')).toContain('Not your fault, Kasia. And the bank\'s on it: I called them first.');
  });
  it('Madrid boss-fall variant: the bank-step line plays first, then the keys; no refund promise', () => {
    const line = "The bank was called straight away, the right first step. We'll see what it can recall.";
    const fell = shown('madrid-resolution', ['madrid_money_moved']);
    expect(fell[0]).toMatchObject({ speaker: 'lucia', expression: 'calm', line });
    expect(fell[1]?.line).toBe('Signed. And I checked every step in the app myself.');
    expect(words('madrid-resolution')).not.toContain(line);
    expect(words('madrid-resolution', ['madrid_money_moved'])).not.toMatch(refund);
  });
  it('every boss-fall variant opens its resolution (STORY §4.2 rule 5)', () => {
    for (const [id, flag] of [['madrid-resolution', 'madrid_money_moved'], ['warsaw-resolution', 'warsaw_bank_called']] as const) {
      const panels = scene(id).panels;
      expect(panels[0]?.if_flag, id).toBe(flag);
      expect(panels.slice(1).some((p) => p.if_flag === flag), id).toBe(false);
    }
  });
  it('Madrid keys panel uses crop right with Andrés flipped (in the left crop the keys sit under his shoulder)', () => {
    const keys = scene('madrid-resolution').panels.find((p) => /keys/i.test(p.caption ?? ''));
    expect(keys).toBeDefined();
    expect(keys?.crop).toBe('right');
    expect(keys?.flip).toBe(true);
  });
  it('Warsaw boss-fall variant (R17): the merged line opens the resolution (STORY §4.2 rule 5); no refund promise', () => {
    const line = "The bank was called straight away, the right first step. We'll see what it can do.";
    const fell = shown('warsaw-resolution', ['warsaw_bank_called']);
    expect(fell[0]).toMatchObject({ speaker: 'kasia', expression: 'calm', line });
    expect(fell[1]?.line).toBe("Kasia's account asked for my code and I sent it. Me. The gadget guy.");
    expect(words('warsaw-resolution')).not.toContain(line);
    expect(words('warsaw-resolution', ['warsaw_bank_called'])).not.toMatch(refund);
  });
  it('Kasia is never at fault (R13) and never falls; Ola is a contact only, never drawn or named', () => {
    for (const id of [...scenes.keys()].filter((k) => k.startsWith('warsaw-'))) {
      for (const p of scene(id).panels) {
        if (p.speaker === 'kasia') expect(p.expression, id).not.toMatch(/^sheepish/);
        expect(p.speaker, id).not.toBe('ola');
        expect(p.with?.id, id).not.toBe('ola');
        expect(text(p), id).not.toMatch(/\bOla\b/);
      }
    }
    // The only sheepish panel is Mateus's own fall.
    expect(scene('warsaw-resolution').panels.filter((p) => p.expression?.startsWith('sheepish')).map((p) => p.speaker)).toEqual(['mateus']);
  });
  it('no scene before a scenario names its props: no safe account, security department or code (Madrid), no code, link or buyer (Warsaw)', () => {
    for (const id of ['madrid-arrival', 'madrid-turn']) expect(words(id), id).not.toMatch(/safe account|security|\bcode\b|text(ed|ing)? about/i);
    for (const id of ['warsaw-arrival', 'warsaw-turn']) expect(words(id), id).not.toMatch(/\bcode\b|\blink\b|buyer|collect/i);
    // Andrés's worry is the deposit itself, never a bank message (STORY §3.4, §4.2 rule 2).
    expect(words('madrid-turn')).not.toMatch(/bank/i);
  });
  it('alt texts describe only what is drawn: no time of day, light or "behind"', () => {
    for (const id of [...scenes.keys()].filter((k) => /^(madrid|warsaw)-/.test(k))) {
      for (const p of scene(id).panels) expect(p.alt, id).not.toMatch(/\b(behind|morning|evening|afternoon|night|light|sunny|sunset|dusk)\b/i);
    }
  });
  it('about 12 panels per chapter, 1–3 visible per non-resolution scene in every variant', () => {
    const total = (city: string, flags: string[]) => [...scenes.keys()].filter((k) => k.startsWith(`${city}-`)).reduce((n, id) => n + shown(id, flags).length, 0);
    expect(total('madrid', [])).toBeLessThanOrEqual(12);
    expect(total('madrid', ['madrid_money_moved'])).toBeLessThanOrEqual(12);
    expect(total('warsaw', [])).toBeLessThanOrEqual(12);
    expect(total('warsaw', ['warsaw_bank_called'])).toBeLessThanOrEqual(12);
    for (const id of ['madrid-arrival', 'madrid-turn', 'warsaw-arrival', 'warsaw-turn', 'warsaw-kasia-back']) expect(shown(id).length, id).toBeLessThanOrEqual(3);
  });
  it('every crop: right panel in Madrid and Warsaw is flipped (sceptic re-review)', () => {
    for (const s of scenes.values()) {
      if (!/^(madrid|warsaw)-/.test(s.id)) continue;
      for (const p of s.panels) if (p.crop === 'right') expect(p.flip, `${s.id}: ${p.alt}`).toBe(true);
    }
  });
});
