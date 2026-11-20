/**
 * Paris story scenes (T-S4d; GDD §23.13, STORY §3.3): wiring, the If-then line word for word, the
 * story-only variants (paris_pay_redirected, paris_boss_sent), habit poses, and the scene rules the
 * generic validator cannot see (no verdict spoilers, no refund promise, arrival ends calm).
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
const paris = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'paris.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'paris'), ['.yaml']).map((f) => {
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

describe('Paris scenes are wired into the chapter (GDD §23.13)', () => {
  it('arrival, the placed turn after 3-5, and the resolution; the intro and rules stay', () => {
    expect(paris.scenes?.arrival).toBe('paris-arrival');
    expect(paris.scenes?.resolution).toBe('paris-resolution');
    // The turn plays after 3-5 and before 3-6; the stop point follows 3-4, so it is a placed beat.
    expect(paris.scenes?.turn).toBeUndefined();
    expect(paris.scenes?.placed).toEqual([{ scene: 'paris-ines-name', after: 'paris-05-salary-change' }]);
    expect(paris.scenario_order.pm.indexOf('paris-05-salary-change') + 1).toBe(paris.scenario_order.pm.indexOf('paris-06-solene-urgent'));
    expect(scene('paris-arrival').slot).toBe('arrival');
    expect(scene('paris-ines-name').slot).toBe('beat');
    expect(scene('paris-resolution').slot).toBe('resolution');
    expect(paris.intro).toBeTruthy();
    expect(paris.rules?.title).toBe('Payments at Ruchelune');
  });
  it('the Atlas page links the STORY §3.3 habit cards', () => {
    expect(paris.atlas_cards).toEqual(['check-who-gets-the-money', 'ask-someone', 'hang-up-call-back']);
  });
  it('about 12 panels per chapter, 1–3 shown per scene in every variant', () => {
    for (const flags of [[], ['paris_pay_redirected'], ['paris_boss_sent'], ['paris_pay_redirected', 'paris_boss_sent']]) {
      const counts = [...scenes.keys()].map((id) => shown(id, flags).length);
      for (const n of counts) expect(n).toBeGreaterThanOrEqual(1);
      for (const n of counts) expect(n).toBeLessThanOrEqual(3);
      expect(counts.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(12);
    }
  });
});

describe('fixed wording (STORY §3.3, §4.4; GDD §23.13)', () => {
  it("Solène's If-then line is word for word, with its extra line", () => {
    const last = scene('paris-resolution').panels.at(-1);
    expect(last?.speaker).toBe('solene');
    expect(last?.if_then).toEqual({
      cue: 'If a payment is new, changed, urgent or secret,',
      action: 'then we call the number in our file, and two of us sign off.',
      extra: 'A matching name only tells you whose account it is.',
    });
  });
  it('the arrival: Inès shows the card ("Solène wrote it. She means it."), the alt names the card, and it ends calm', () => {
    const a = scene('paris-arrival');
    const ines = a.panels.find((p) => p.speaker === 'ines');
    expect(ines?.line).toContain('Solène wrote it. She means it.');
    expect(ines?.alt).toMatch(/procedure card/);
    expect(a.panels.at(-1)?.expression).not.toMatch(/^(worried|sheepish)/);
    expect(a.panels.some((p) => p.speaker === 'solene' && p.expression === 'worried')).toBe(true);
  });
  it('the turn: "no exceptions" for everyone; the paris_pay_redirected variant puts the details back and blames nobody', () => {
    const plain = shown('paris-ines-name', []);
    const fell = shown('paris-ines-name', ['paris_pay_redirected']);
    const last = 'None of this is on you, Inès. This is why the card says no exceptions.';
    expect(plain.at(-1)?.line).toBe(last);
    expect(fell.at(-1)?.line).toBe(last);
    expect(plain.at(-1)?.expression).toBe('calm');
    const fellText = fell.map(text).join(' ');
    expect(fellText).toContain("We've put your real details back before payroll, and we'll sort this together.");
    expect(fellText).toContain('It would have fooled anyone.');
    expect(plain.map(text).join(' ')).not.toMatch(/put your real details back/);
  });
  it('the resolution: the new card line and Inès\'s mum; the paris_boss_sent variant names the bank step and promises no money back', () => {
    const r = all(scene('paris-resolution'));
    expect(r).toContain('a call or video call never replaces the sign-off');
    expect(r).toMatch(/shown my mum/);
    const fell = shown('paris-resolution', ['paris_boss_sent']).map(text).join(' ');
    const fine = shown('paris-resolution', []).map(text).join(' ');
    expect(fell).toMatch(/bank was called straight away/);
    expect(r).not.toMatch(/first thing/);
    expect(fell).not.toMatch(/nothing went out/);
    expect(fine).toMatch(/nothing went out/);
    expect(r).not.toMatch(/refund|get it back|money back|you'll get|we'll get/i);
  });
  it('Bastien is calm, never warm, in the resolution (also after a loss)', () => {
    for (const p of scene('paris-resolution').panels) {
      if (p.speaker === 'bastien') expect(p.expression).toBe('calm');
      if (p.with?.id === 'bastien') expect(p.with.expression).toBe('calm');
    }
    expect(scene('paris-resolution').panels.some((p) => p.speaker === 'bastien' || p.with?.id === 'bastien')).toBe(true);
  });
});

describe('scene rules the generic validator does not see', () => {
  it('no scene names a brand from a later scenario before it plays (GDD §23.13)', () => {
    for (const s of scenes.values()) expect(all(s), s.id).not.toMatch(/Brivolet|Feuillemont|Platinoir|Morvenac|Vellacourt|Ostrelle|Tessivane|Vardoulec/);
  });
  it('the player dials the directory number on Friday; an incoming caller is never treated as proof', () => {
    for (const p of scene('paris-resolution').panels.filter((x) => x.caption?.startsWith('Friday'))) {
      expect(p.caption).toBe('Friday evening. You ring Solène on the directory number.');
      expect(p.video).toBe(false);
      expect(p.backdrop).toBeUndefined();
    }
  });
  it('habit poses mean one thing: phone-ear = a call on a number already known (directory, file)', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.expression?.endsWith('-phone-ear')) expect(text(p), s.id).toMatch(/directory number|number in our file/);
        if (p.expression?.endsWith('-phone-look')) expect(text(p), s.id).toMatch(/\bapp\b/);
      }
    }
  });
  it('alt texts describe only what is drawn: no time of day, light, or "behind"', () => {
    for (const s of scenes.values()) for (const p of s.panels) expect(p.alt, s.id).not.toMatch(/\b(behind|morning|evening|afternoon|night|light|sunset|dusk)\b/i);
  });
  it('no line uses the If-then cue words loosely before the resolution (new, changed, urgent, secret)', () => {
    for (const id of ['paris-arrival', 'paris-ines-name']) {
      const lines = scene(id).panels.map((p) => `${p.line ?? ''} ${p.caption ?? ''}`).join(' ');
      expect(lines, id).not.toMatch(/\b(new|changed|urgent|secret)\b/i);
    }
  });
});
