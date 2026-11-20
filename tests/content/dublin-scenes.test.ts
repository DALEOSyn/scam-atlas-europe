/**
 * Dublin story scenes (T-S4i; GDD §28.2, STORY §3.8): wiring, the If-then line and the fixed lines word for
 * word, the content note with no sensitive scene (producer ruling, GDD §28.11 Q5), the story-only variant
 * dublin_bank_called opening the resolution and set by every boss fall (STORY §4.2 rule 5), the rehearsal
 * choice, habit poses and crop/flip, and the rules the generic validator cannot see (no amount, no refund
 * promise, no link, no ad, firm or celebrity, no scam-side name, never "again", Declan never falls).
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
const dublin = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'dublin.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'dublin'), ['.yaml']).map((f) => {
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
const svgExpressions = (id: string): Set<string> =>
  new Set([...readFileSync(join(CONTENT, '..', 'public', 'art', 'cast', `${id}.svg`), 'utf8').matchAll(/id="x-([a-z-]+)"/g)].map((m) => m[1] ?? ''));

interface BossFile {
  outcomes: Record<string, { sets_flags?: string[]; recovery?: unknown[] }>;
}
const boss = yaml(join(CONTENT, 'scenarios', 'dublin', 'dublin-09-boss-clone-bond.yaml')) as BossFile;
interface DrillFile {
  outcomes: Record<string, { narrative: string }>;
}
const drill = yaml(join(CONTENT, 'scenarios', 'dublin', 'dublin-04-declan-two-ads.yaml')) as DrillFile;

describe('Dublin scenes are wired into the chapter (GDD §28.2)', () => {
  it('arrival, the turn at the stop point after 8-3, and the resolution; no placed beat', () => {
    expect(dublin.scenes).toEqual({ arrival: 'dublin-arrival', turn: 'dublin-turn', resolution: 'dublin-resolution', placed: [] });
    expect(dublin.scenario_order.am.at(-1)).toBe('dublin-03-recovery-offer');
    expect(dublin.scenario_order.pm[0]).toBe('dublin-04-declan-two-ads');
    for (const slot of ['arrival', 'turn', 'resolution'] as const) expect(scene(`dublin-${slot}`).slot).toBe(slot);
    expect([...scenes.keys()].sort()).toEqual(['dublin-arrival', 'dublin-resolution', 'dublin-turn']);
  });
  it('the Atlas page links the three habit cards named in STORY §3.8', () => {
    expect(dublin.atlas_cards).toEqual(['if-its-guaranteed-and-high-its-not', 'stop-the-damage-first', 'ask-someone']);
  });
  it('panel counts: 2 + 2 + 3 = 7, plus one with the variant (the turn folds the reply into the choice panel)', () => {
    expect(shown('dublin-arrival', [])).toHaveLength(2);
    expect(shown('dublin-turn', [])).toHaveLength(2);
    expect(shown('dublin-resolution', [])).toHaveLength(3);
    expect(shown('dublin-resolution', ['dublin_bank_called'])).toHaveLength(4);
  });
  it('no placed scene carries the 8-4 report, so every 8-4 outcome keeps its caption (GDD §28.4)', () => {
    expect(dublin.scenes?.placed ?? []).toEqual([]);
    for (const [id, o] of Object.entries(drill.outcomes)) {
      expect(o.narrative, id).toContain("You and Declan report the 'state-backed' bond through Fairmeasure's website.");
    }
  });
});

describe('Dublin fixed wording (STORY §3.8, §4.4, §5.6)', () => {
  it('the If-then line is word for word, spoken by Declan on the last panel, with the extra line', () => {
    const last = scene('dublin-resolution').panels.at(-1);
    expect(last?.if_then).toEqual({
      cue: 'If an investment promises guaranteed returns,',
      action: "then I find the firm on the regulator's register myself.",
      extra: "Not on the register? Don't pay. Paying to get money out or back? Stop.",
    });
    expect(last?.speaker).toBe('declan');
    expect(last?.if_flag).toBeUndefined();
    expect(last?.unless_flag).toBeUndefined();
  });
  it('the exact content note, and no scene is sensitive (GDD §28.11 Q5)', () => {
    expect(dublin.content_note).toBe('This chapter touches on job loss and on losing money to investment scams. You can pause or skip any story scene, and help is one tap away.');
    for (const s of scenes.values()) {
      expect(s.sensitive, s.id).toBe(false);
      expect(s.content_note, s.id).toBeUndefined();
    }
  });
  it('arrival lines are word for word, Róisín warm then Declan thinking, in the hall', () => {
    expect(lines('dublin-arrival')).toEqual([
      "Thanks for coming. Dad's been a bit lost since the warehouse closed.",
      "Twenty-two years. Now I've a lump sum, a daughter in college and no plan.",
    ]);
    expect(scene('dublin-arrival').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['roisin', 'warm'],
      ['declan', 'thinking'],
    ]);
  });
  it('turn: Declan thinking, then calm with the rehearsal choice and his own shared reply', () => {
    expect(lines('dublin-turn')[0]).toBe('Everyone online seems to be getting rich. Am I the only one being careful?');
    expect(scene('dublin-turn').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['declan', 'thinking'],
      ['declan', 'calm'],
    ]);
    const withChoice = scene('dublin-turn').panels.filter((p) => p.choice);
    expect(withChoice).toHaveLength(1);
    expect(withChoice[0]?.speaker).toBe('declan');
    expect(withChoice[0]?.choice).toEqual({
      prompt: 'Where would you start?',
      options: ["Find out who's behind it", 'Look it up on the register'],
      reply: "Both. Register first, and I'll find it myself, not through an ad.",
    });
  });
  it('resolution: Declan laughing, Declan calm, If-then; with dublin_bank_called Róisín opens the scene', () => {
    const story = [
      'Boring savings account and a course to retrain. Róisín says boring is the new exciting.',
      'And anyone charging a fee to get lost money back? Same crowd.',
      undefined,
    ];
    expect(lines('dublin-resolution')).toEqual(story);
    expect(shown('dublin-resolution', []).map((p) => [p.speaker, p.expression])).toEqual([
      ['declan', 'laughing'],
      ['declan', 'calm'],
      ['declan', 'calm-phone-look'],
    ]);
    const withVariant = shown('dublin-resolution', ['dublin_bank_called']);
    expect(withVariant[0]).toMatchObject({ speaker: 'roisin', expression: 'calm', line: "The bank was called straight away, the right first step. We'll see what it can do." });
    expect(withVariant.slice(1).map((p) => p.line)).toEqual(story);
  });
});

describe('dublin_bank_called is set by every boss fall and nothing else (GDD §28.2, §28.6)', () => {
  it('the three fall outcomes set it; no safe outcome does', () => {
    const falls = Object.entries(boss.outcomes)
      .filter(([, o]) => o.recovery?.length)
      .map(([id]) => id)
      .sort();
    expect(falls).toEqual(['bond_transfer_sent', 'card_typed_application', 'verification_fee_paid']);
    const setting = Object.entries(boss.outcomes)
      .filter(([, o]) => o.sets_flags?.includes('dublin_bank_called'))
      .map(([id]) => id)
      .sort();
    expect(setting).toEqual(falls);
  });
  it('the variant is the only conditional panel and names the step without blame or promise', () => {
    const conditional = scene('dublin-resolution').panels.filter((p) => p.if_flag || p.unless_flag);
    expect(conditional).toHaveLength(1);
    expect(conditional[0]?.if_flag).toBe('dublin_bank_called');
    expect(scene('dublin-resolution').panels[0]).toBe(conditional[0]);
    expect(conditional[0]?.line).toMatch(/bank was called straight away/);
    expect(conditional[0]?.line).not.toMatch(/should|fault|careless|will get|guarantee|back/i);
    for (const id of ['dublin-arrival', 'dublin-turn']) expect(scene(id).panels.some((p) => p.if_flag || p.unless_flag), id).toBe(false);
  });
});

describe('Dublin scene rules the generic validator does not see', () => {
  it('no amount, number, link, code artefact or refund promise in any scene (STORY §4.2 rule 1, §5.4)', () => {
    for (const s of scenes.values()) {
      // Declan's fixed line names the trick ("a fee to get lost money back"); no line promises money back.
      expect(all(s), s.id).not.toMatch(/€|\beuros?\b|\d|refund|(?:will|'ll|can) get|get (?:it|the money|your money) back|recover(?:ed)?\b|IBAN|https?:|www\.|\.(?:example|test|invalid)\b|\bQR\b|@/i);
    }
  });
  it('no brand, ad face, platform, firm or scam-side name; Orla Fennick is never drawn (STORY §3.8)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/Fairmeasure|Postwick|Orla|Fennick|Quorvex|Ellisfen|Backhaven|Brindlecove|Glimmerfund|Brewnook|Larchwick|Ciarán|Gráinne|Aisling|Tallyfern|Alex|Wordswap/);
      expect(all(s), s.id).not.toMatch(/celebrit|presenter|balance|platform/i);
      for (const p of s.panels) {
        expect(['declan', 'roisin'], s.id).toContain(p.speaker);
        if (p.with) expect(['declan', 'roisin'], s.id).toContain(p.with.id);
        expect(p.backdrop, s.id).toBe('dublin-hall');
      }
    }
  });
  it('no other city, no "again" or "twice", nobody called naive (STORY §4.2 rule 6, §5.2; PSYCHOLOGY.md)', () => {
    const cities = ['Berlin', 'Amsterdam', 'Paris', 'Madrid', 'Warsaw', 'Rome', 'Lisbon', 'Stockholm', 'Brussels'];
    for (const s of scenes.values()) {
      for (const c of cities) expect(all(s), s.id).not.toContain(c);
      expect(all(s), s.id).not.toMatch(/\bagain\b|\btwice\b|naive|gullible|obviously|should have|you fell/i);
    }
  });
  it('Declan never falls: no sheepish or worried Declan, and his plan is his own in every branch', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) if (p.speaker === 'declan') expect(['sheepish', 'worried'], s.id).not.toContain(p.expression);
    }
    for (const flags of [[], ['dublin_bank_called']]) {
      expect(shown('dublin-resolution', flags).some((p) => p.speaker === 'declan' && /savings account and a course to retrain/.test(p.line ?? ''))).toBe(true);
    }
  });
  it('the turn spoils no verdict: no ad named as fake, no firm, no state or guarantee talk', () => {
    expect(all(scene('dublin-turn'))).not.toMatch(/fake|scam|state|guarantee|warning list|bond|%/i);
  });
  it('every expression exists in the speaker\'s and listener\'s cast SVG', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.speaker && p.expression) expect(svgExpressions(p.speaker).has(p.expression), `${s.id} ${p.speaker} ${p.expression}`).toBe(true);
        if (p.with) expect(svgExpressions(p.with.id).has(p.with.expression), `${s.id} ${p.with.id} ${p.with.expression}`).toBe(true);
      }
    }
  });
  it('every crop: right panel is flipped so the speaker faces into the frame', () => {
    for (const s of scenes.values()) for (const p of s.panels) if (p.crop === 'right') expect(p.flip, s.id).toBe(true);
  });
  it('alt texts describe only what each crop shows of the hall', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        // The noticeboard sits at the left edge, the stacked chairs at the right edge (ART_DIRECTION, dublin-hall).
        if (p.crop !== 'left') expect(p.alt, s.id).not.toMatch(/noticeboard/i);
        if (p.crop !== 'right') expect(p.alt, s.id).not.toMatch(/chairs/i);
      }
    }
  });
  it('habit poses: phone-look only on the panel about looking the firm up yourself; no phone-ear', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        expect(p.expression ?? '', s.id).not.toMatch(/-phone-ear$/);
        if (p.expression?.endsWith('-phone-look')) expect(text(p), s.id).toMatch(/\bfind the firm on the regulator's register myself\b/);
      }
    }
    expect(scene('dublin-resolution').panels.at(-1)?.expression).toBe('calm-phone-look');
  });
});
