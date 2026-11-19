/**
 * Lisbon story scenes (T-S4g; GDD §27.2, STORY §3.7): wiring, the If-then line and the fixed lines word for
 * word, no content note and no sensitive scene (money theme only, as Madrid), the story-only variant
 * lisbon_acted_fast opening the resolution and set by every boss fall (STORY §4.2 rule 5), habit poses,
 * and the rules the generic validator cannot see (no amount, no refund promise, no link or code, Leonor
 * never in a scene, Beatriz never falls).
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
const lisbon = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'lisbon.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'lisbon'), ['.yaml']).map((f) => {
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

interface BossFile {
  outcomes: Record<string, { sets_flags?: string[] }>;
  interrupts?: { id: string; on_fall?: string; is_fraud?: boolean }[];
}
const boss = yaml(join(CONTENT, 'scenarios', 'lisbon', 'lisbon-09-boss-thursday-flat.yaml')) as BossFile;

describe('Lisbon scenes are wired into the chapter (GDD §27.2)', () => {
  it('arrival, the turn at the stop point after 7-3, and the resolution; no placed beat', () => {
    expect(lisbon.scenes).toEqual({ arrival: 'lisbon-arrival', turn: 'lisbon-turn', resolution: 'lisbon-resolution', placed: [] });
    expect(lisbon.scenario_order.am.at(-1)).toBe('lisbon-03-alfama-ad');
    expect(lisbon.scenario_order.pm[0]).toBe('lisbon-04-beatriz-two-rooms');
    for (const slot of ['arrival', 'turn', 'resolution'] as const) expect(scene(`lisbon-${slot}`).slot).toBe(slot);
    expect([...scenes.keys()].sort()).toEqual(['lisbon-arrival', 'lisbon-resolution', 'lisbon-turn']);
  });
  it('the Atlas page links the three habit cards named in STORY §3.7', () => {
    expect(lisbon.atlas_cards).toEqual(['stay-on-the-platform', 'check-before-you-pay', 'read-the-link']);
  });
  it('panel counts: 3 + 2 + 3 = 8, plus one with the variant (GDD §27.2)', () => {
    expect(shown('lisbon-arrival', [])).toHaveLength(3);
    expect(shown('lisbon-turn', [])).toHaveLength(2);
    expect(shown('lisbon-resolution', [])).toHaveLength(3);
    expect(shown('lisbon-resolution', ['lisbon_acted_fast'])).toHaveLength(4);
  });
});

describe('Lisbon fixed wording (STORY §3.7, §4.4)', () => {
  it('the If-then line is word for word, spoken by Beatriz on the last panel, with the extra line', () => {
    const last = scene('lisbon-resolution').panels.at(-1);
    expect(last?.if_then).toEqual({
      cue: 'If a host wants me to chat, pay or log in outside the app,',
      action: 'then I stay in the app I opened myself.',
      extra: 'Parking too: pay in the app you installed, and read where a code goes.',
    });
    expect(last?.speaker).toBe('beatriz');
    expect(last?.if_flag).toBeUndefined();
  });
  it('no content note and no sensitive scene (money theme only, STORY §3.7)', () => {
    expect(lisbon.content_note).toBeUndefined();
    for (const s of scenes.values()) expect(s.sensitive, s.id).toBe(false);
  });
  it('arrival and turn lines are word for word, with the right speakers and expressions', () => {
    expect(lines('lisbon-arrival')).toEqual([
      "Mum's cooking, so you're staying for dinner. No arguments.",
      'Six weeks of room-hunting. Everything good goes in an hour.',
      "And from Thursday the cousins invade, so you need a bed too. We'll hunt together.",
    ]);
    expect(scene('lisbon-arrival').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['mateus', 'laughing'],
      ['beatriz', 'worried'],
      ['mateus', 'calm'],
    ]);
    expect(scene('lisbon-arrival').panels[0]?.backdrop).toBe('lisbon-street');
    expect(scene('lisbon-arrival').panels.slice(1).every((p) => p.backdrop === 'lisbon-kitchen')).toBe(true);
    expect(lines('lisbon-turn')).toEqual(["I think I've found one! Near the faculty, with a balcony.", "Great. Let's look at it properly before anyone pays anything."]);
    expect(scene('lisbon-turn').panels.map((p) => [p.speaker, p.expression])).toEqual([
      ['beatriz', 'laughing'],
      ['mateus', 'thinking'],
    ]);
  });
  it('resolution: Beatriz, Mateus, If-then; with lisbon_acted_fast Mateus opens the scene', () => {
    const story = [
      "Booked through the app, viewing on Saturday. I'll pay in the app, after I've seen it.",
      'And I pay parking in the app now. No stickers for me.',
      undefined,
    ];
    expect(lines('lisbon-resolution')).toEqual(story);
    expect(shown('lisbon-resolution', []).map((p) => [p.speaker, p.expression])).toEqual([
      ['beatriz', 'relieved'],
      ['mateus', 'laughing'],
      ['beatriz', 'calm'],
    ]);
    const withVariant = shown('lisbon-resolution', ['lisbon_acted_fast']);
    expect(withVariant[0]).toMatchObject({ speaker: 'mateus', expression: 'calm', line: "You acted straight away, the right first step. We'll see what can still be stopped." });
    expect(withVariant.slice(1).map((p) => p.line)).toEqual(story);
  });
});

describe('lisbon_acted_fast is set by every boss fall and nothing else (GDD §27.2)', () => {
  it('the three fall outcomes set it; no safe outcome does', () => {
    const falls = ['login_typed_b1', 'transfer_sent_b2', 'card_typed_b3'];
    const setting = Object.entries(boss.outcomes)
      .filter(([, o]) => o.sets_flags?.includes('lisbon_acted_fast'))
      .map(([id]) => id)
      .sort();
    expect(setting).toEqual([...falls].sort());
  });
  it("Leonor's in-app follow-up shows after a fall too (DECISIONS R20)", () => {
    expect(boss.interrupts?.find((i) => i.id === 'leonor_see_you')).toMatchObject({ on_fall: 'show', is_fraud: false });
  });
});

describe('Lisbon scene rules the generic validator does not see', () => {
  it('no amount, number, link, code artefact or refund promise in any scene (STORY §4.2 rule 1, §5.4)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/€|\beuros?\b|\d|refund|get (?:it|the money) back|money back|IBAN|https?:|www\.|\.(?:example|test|invalid)\b|\bQR\b|@/i);
    }
  });
  it("no other city, no Leonor, no brand, and Mateus's mum is never drawn (STORY §3.7, §4.2 rule 6)", () => {
    const cities = ['Berlin', 'Amsterdam', 'Paris', 'Madrid', 'Warsaw', 'Rome', 'Dublin', 'Stockholm', 'Brussels'];
    for (const s of scenes.values()) {
      for (const c of cities) expect(all(s), s.id).not.toContain(c);
      expect(all(s), s.id).not.toMatch(/Leonor|Roostwell|Zonelet|Larchwick/);
      for (const p of s.panels) {
        expect(['mateus', 'beatriz'], s.id).toContain(p.speaker);
        if (p.with) expect(['mateus', 'beatriz'], s.id).toContain(p.with.id);
      }
    }
  });
  it('Beatriz never falls: no sheepish Beatriz, and her room is booked through the app in every branch', () => {
    for (const s of scenes.values()) for (const p of s.panels) if (p.speaker === 'beatriz') expect(p.expression).not.toBe('sheepish');
    for (const flags of [[], ['lisbon_acted_fast']]) {
      expect(shown('lisbon-resolution', flags).some((p) => p.speaker === 'beatriz' && /Booked through the app/.test(p.line ?? ''))).toBe(true);
    }
  });
  it('the variant names the step taken without blame or promise', () => {
    const v = scene('lisbon-resolution').panels.find((p) => p.if_flag === 'lisbon_acted_fast');
    expect(v?.line).toMatch(/acted straight away/);
    expect(v?.line).not.toMatch(/should|fault|careless|will get|guarantee/i);
    expect(scene('lisbon-resolution').panels.filter((p) => p.if_flag || p.unless_flag)).toHaveLength(1);
  });
  it('the turn spoils no verdict: no host, link, transfer or deposit, and ends on Mateus thinking', () => {
    expect(all(scene('lisbon-turn'))).not.toMatch(/host|link|transfer|deposit|fake|scam/i);
    expect(scene('lisbon-turn').panels.at(-1)).toMatchObject({ speaker: 'mateus', expression: 'thinking' });
  });
  it('habit poses: phone-ear only about calling a known number, phone-look only about opening the app yourself', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.expression?.endsWith('-phone-ear')) expect(text(p), s.id).toMatch(/\bcall .*known number/i);
        if (p.expression?.endsWith('-phone-look')) expect(text(p), s.id).toMatch(/\bapp\b.*\b(?:opened|open) (?:myself|yourself)|open(?:ed)? the app/i);
      }
    }
    // Lisbon has no calls: the phone-ear pose never appears.
    for (const s of scenes.values()) for (const p of s.panels) expect(p.expression ?? '', s.id).not.toMatch(/-phone-ear$/);
  });
});
