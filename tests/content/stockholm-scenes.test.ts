/**
 * Stockholm story scenes (T-S4j; GDD §29.2, STORY §3.9): wiring, the If-then line and the fixed lines word for
 * word, no content note and no sensitive scene (none proposed, STORY §5.6), the story-only variant
 * stockholm_bank_called opening the resolution and set by every boss fall (STORY §4.2 rule 5), habit poses,
 * crop/flip, and the rules the generic validator cannot see (no amount, no refund promise, no link, number or
 * code, no scam-side or real names, nobody falls in a scene, Lina never handles money or e-ID).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { listFiles } from '../../scripts/lib/content.ts';
import { visiblePanels } from '../../src/engine/story.ts';
import { chapterSchema, sceneSchema, type Scene, type ScenePanel } from '../../src/content/schema.ts';
import { CONTENT } from './fixtures.ts';

const yaml = (path: string): unknown => parse(readFileSync(path, 'utf8'));
const stockholm = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'stockholm.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'stockholm'), ['.yaml']).map((f) => {
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
const shown = (id: string, flags: string[]) => visiblePanels(scene(id), new Set(flags));
const lines = (id: string, flags: string[] = []) => shown(id, flags).map((p) => p.line);
const cast = ['birgitta', 'jamal', 'lina'];

interface BossFile {
  outcomes: Record<string, { sets_flags?: string[] }>;
}
const boss = yaml(join(CONTENT, 'scenarios', 'stockholm', 'stockholm-09-boss-case-file.yaml')) as BossFile;

describe('Stockholm scenes are wired into the chapter (GDD §29.2)', () => {
  it('arrival, the turn at the stop point after 9-3 (drill 9-4 next), and the resolution; no placed beat', () => {
    expect(stockholm.scenes).toEqual({ arrival: 'stockholm-arrival', turn: 'stockholm-turn', resolution: 'stockholm-resolution', placed: [] });
    expect(stockholm.scenario_order.am.at(-1)).toBe('stockholm-03-birgitta-shopping');
    expect(stockholm.scenario_order.pm[0]).toBe('stockholm-04-jamal-police-call');
    for (const slot of ['arrival', 'turn', 'resolution'] as const) expect(scene(`stockholm-${slot}`).slot).toBe(slot);
    expect([...scenes.keys()].sort()).toEqual(['stockholm-arrival', 'stockholm-resolution', 'stockholm-turn']);
  });
  it('the Atlas page links the three habit cards named in STORY §3.9', () => {
    expect(stockholm.atlas_cards).toEqual(['only-approve-what-you-started', 'nobody-needs-your-screen', 'hang-up-call-back']);
  });
  it('panel counts: 3 + 4 + 3 = 10, plus one with the variant (GDD §29.2)', () => {
    expect(shown('stockholm-arrival', [])).toHaveLength(3);
    expect(shown('stockholm-turn', [])).toHaveLength(4);
    expect(shown('stockholm-resolution', [])).toHaveLength(3);
    expect(shown('stockholm-resolution', ['stockholm_bank_called'])).toHaveLength(4);
  });
});

describe('Stockholm fixed wording (STORY §3.9, §4.4)', () => {
  it('the If-then line is word for word, spoken by Jamal on the last panel, with the extra line', () => {
    const last = scene('stockholm-resolution').panels.at(-1);
    expect(last?.if_then).toEqual({
      cue: "If a login or signing request pops up that I didn't start,",
      action: 'then I deny it and call the bank on its own number.',
      extra: 'Nobody needs your screen, either.',
    });
    expect(last?.speaker).toBe('jamal');
    expect(last?.if_flag).toBeUndefined();
    expect(last?.unless_flag).toBeUndefined();
  });
  it('no content note and no sensitive scene (none proposed for Stockholm, STORY §5.6)', () => {
    expect(stockholm.content_note).toBeUndefined();
    for (const s of scenes.values()) expect(s.sensitive, s.id).toBe(false);
  });
  it('arrival lines are word for word, with the right speakers and expressions', () => {
    expect(lines('stockholm-arrival')).toEqual([
      "Adaeze's inspector! Fika first, questions after.",
      'New flat, new bank, new e-ID app. My head is full.',
      'I translate. Dad pays me in cinnamon buns.',
    ]);
    expect(scene('stockholm-arrival').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['birgitta', 'laughing'],
      ['jamal', 'thinking'],
      ['lina', 'laughing'],
    ]);
  });
  it('turn lines are word for word: laughing → thinking, ending on Jamal thinking', () => {
    expect(lines('stockholm-turn')).toEqual([
      "My rule: if a caller wants me to log in, I'm rude. I hang up. Rudeness is free.",
      "I'm new here. I want to be polite.",
      'Be polite to people. Hang up on requests.',
      "At the lab we never sign for a sample we didn't order. Same idea, I suppose.",
    ]);
    expect(scene('stockholm-turn').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['birgitta', 'laughing'],
      ['jamal', 'worried'],
      ['birgitta', 'calm'],
      ['jamal', 'thinking'],
    ]);
  });
  it('resolution: Jamal, Lina, If-then; with stockholm_bank_called Birgitta opens the scene', () => {
    const story = ["A 'police officer' wanted my e-ID. I hung up, like Birgitta.", 'Dad hangs up on requests now. Politely.', undefined];
    expect(lines('stockholm-resolution')).toEqual(story);
    expect(shown('stockholm-resolution', []).map((p) => [p.speaker, p.expression])).toEqual([
      ['jamal', 'proud'],
      ['lina', 'laughing'],
      ['jamal', 'calm-phone-ear'],
    ]);
    const withVariant = shown('stockholm-resolution', ['stockholm_bank_called']);
    expect(withVariant[0]).toMatchObject({
      speaker: 'birgitta',
      expression: 'calm',
      line: "The bank was called straight away, the right first step. We'll see what it can do.",
    });
    expect(withVariant.slice(1).map((p) => p.line)).toEqual(story);
  });
});

describe('stockholm_bank_called is set by every boss fall and nothing else (GDD §29.6)', () => {
  it('the three fall outcomes set it; no safe outcome does', () => {
    const setting = Object.entries(boss.outcomes)
      .filter(([, o]) => o.sets_flags?.includes('stockholm_bank_called'))
      .map(([id]) => id)
      .sort();
    expect(setting).toEqual(['bank_signed', 'case_code_scanned', 'police_logged_in']);
  });
  it('the variant is the only flagged panel, names the step taken, and neither blames nor promises', () => {
    const flagged = scene('stockholm-resolution').panels.filter((p) => p.if_flag || p.unless_flag);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]?.if_flag).toBe('stockholm_bank_called');
    expect(flagged[0]?.line).toMatch(/bank was called straight away/);
    expect(flagged[0]?.line).not.toMatch(/should|fault|careless|will get|guarantee|refund/i);
    for (const id of ['stockholm-arrival', 'stockholm-turn']) expect(scene(id).panels.every((p) => !p.if_flag && !p.unless_flag), id).toBe(true);
  });
});

describe('Stockholm scene rules the generic validator does not see', () => {
  it('no amount, number, link, code artefact or refund promise in any scene (STORY §4.2 rule 1, §5.4)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/kr\b|kronor|€|\d|refund|get (?:it|the money) back|money back|IBAN|https?:|www\.|\.(?:example|test|invalid)\b|\bQR\b|@|\bcode\b|screen shows/i);
    }
  });
  it('no other city, no brand, no scam-side name, only the Stockholm cast (STORY §3.9, §4.2 rules 6, 7)', () => {
    const cities = ['Berlin', 'Amsterdam', 'Paris', 'Madrid', 'Warsaw', 'Rome', 'Lisbon', 'Dublin', 'Brussels'];
    for (const s of scenes.values()) {
      for (const c of cities) expect(all(s), s.id).not.toContain(c);
      expect(all(s), s.id).not.toMatch(/Gatewren|Larchwick|Kettle|Swaploft|Kindhand|Waymarker|Holm\b|Erik|Skarvlund|Alex/);
      for (const p of s.panels) {
        expect(cast, s.id).toContain(p.speaker);
        if (p.with) expect(cast, s.id).toContain(p.with.id);
      }
    }
  });
  it('nobody falls in a scene, and Lina never handles money or e-ID (GDD §29.2)', () => {
    for (const s of scenes.values()) for (const p of s.panels) expect(p.expression ?? '', s.id).not.toMatch(/^sheepish/);
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.speaker === 'lina') expect(text(p), s.id).not.toMatch(/e-ID|log in|\bsign|approve|bank|money|transfer/i);
      }
    }
    // Jamal hung up in every drill branch: his line is shown with or without the variant.
    for (const flags of [[], ['stockholm_bank_called']]) expect(lines('stockholm-resolution', flags)).toContain("A 'police officer' wanted my e-ID. I hung up, like Birgitta.");
  });
  it('no mocking: politeness and being new are never the joke (STORY §5.2, learning-psychologist)', () => {
    for (const s of scenes.values()) expect(all(s), s.id).not.toMatch(/gullible|obviously|should have known|naive|foolish|stupid|silly/i);
    // Being new is mentioned only by Jamal himself, never as the reason anyone gets scammed.
    for (const s of scenes.values()) {
      for (const p of s.panels) if (/\bnew\b/i.test(p.line ?? '')) expect(p.speaker, s.id).toBe('jamal');
    }
    expect(all(scene('stockholm-turn'))).not.toMatch(/scam|fraud|fake|police|Gatewren/i);
  });
  it('every crop: right panel is flipped so the speaker faces into the frame', () => {
    for (const s of scenes.values()) for (const p of s.panels) if (p.crop === 'right') expect(p.flip, s.id).toBe(true);
  });
  it('alt texts describe only what the crop shows (ART_DIRECTION §6.1: tree left, bikes right)', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (/\btree\b/i.test(p.alt)) expect(p.crop, `${s.id}: ${p.alt}`).toBe('left');
        if (/\bbikes?\b/i.test(p.alt)) expect(p.crop, `${s.id}: ${p.alt}`).toBe('right');
        expect(p.backdrop, s.id).toBe('stockholm-courtyard');
      }
    }
  });
  it('habit poses: phone-ear only about calling a known number, phone-look only about opening the app yourself', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.expression?.endsWith('-phone-ear')) expect(text(p), s.id).toMatch(/\bcall .*\b(?:known|own) number/i);
        if (p.expression?.endsWith('-phone-look')) expect(text(p), s.id).toMatch(/\bapp\b.*\b(?:opened|open) (?:myself|yourself)|open(?:ed)? the app/i);
      }
    }
    // The If-then panel models the habit (ART_DIRECTION §5): Jamal, phone to his ear, calling the bank's own number.
    expect(scene('stockholm-resolution').panels.at(-1)?.expression).toBe('calm-phone-ear');
    // No Stockholm scene is about opening an app yourself: the phone-look pose never appears.
    for (const s of scenes.values()) for (const p of s.panels) expect(p.expression ?? '', s.id).not.toMatch(/-phone-look$/);
  });
});
