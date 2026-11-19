/**
 * Rome story scenes (T-S4f; GDD §26.2, STORY §3.6): wiring, the If-then line and the fixed lines word for
 * word, the content note and sensitive flags (STORY §5.6), the story-only variant rome_bank_called opening
 * the resolution (STORY §4.2 rule 5), habit poses, and the rules the generic validator cannot see (no
 * amount, no refund promise, the code word as an extra, the impersonated shown safe).
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
const rome = chapterSchema.parse(yaml(join(CONTENT, 'chapters', 'rome.yaml')));
const scenes = new Map<string, Scene>(
  listFiles(join(CONTENT, 'scenes', 'rome'), ['.yaml']).map((f) => {
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

describe('Rome scenes are wired into the chapter (GDD §26.2, §26.10)', () => {
  it('arrival, the turn at the stop point after 6-3, Giulia safe after drill 6-6, and the resolution', () => {
    expect(rome.scenes).toEqual({
      arrival: 'rome-arrival',
      turn: 'rome-turn',
      resolution: 'rome-resolution',
      placed: [{ scene: 'rome-giulia-safe', after: 'rome-06-davide-paid' }],
    });
    expect(rome.scenario_order.am.at(-1)).toBe('rome-03-police-card-call');
    expect(scene('rome-giulia-safe').slot).toBe('beat');
    for (const slot of ['arrival', 'turn', 'resolution'] as const) expect(scene(`rome-${slot}`).slot).toBe(slot);
    expect([...scenes.keys()].sort()).toEqual(['rome-arrival', 'rome-giulia-safe', 'rome-resolution', 'rome-turn']);
  });
  it('the Atlas page links the four habit cards named in STORY §3.6', () => {
    expect(rome.atlas_cards).toEqual(['call-the-number-you-know', 'hang-up-call-back', 'ask-someone', 'stop-the-damage-first']);
  });
});

describe('Rome fixed wording (STORY §3.6, §4.4, §5.6)', () => {
  it('the If-then line is word for word, spoken by Davide with the phone at his ear', () => {
    const last = scene('rome-resolution').panels.at(-1);
    expect(last?.if_then).toEqual({
      cue: 'If someone I love asks for money by call, voice note or new number,',
      action: 'then I call their known number and ask for our word.',
      extra: 'A voice can be copied. Calling the number you have reaches the real person.',
    });
    expect(last?.speaker).toBe('davide');
    expect(last?.expression).toBe('calm-phone-ear');
  });
  it('the exact content note; Giulia safe and the resolution are sensitive, arrival and turn are not', () => {
    expect(rome.content_note).toBe('This chapter includes a family-emergency story and a lost payment. Everyone ends up safe. You can pause or skip any story scene.');
    expect(scene('rome-giulia-safe').sensitive).toBe(true);
    expect(scene('rome-resolution').sensitive).toBe(true);
    expect(scene('rome-arrival').sensitive).toBe(false);
    expect(scene('rome-turn').sensitive).toBe(false);
  });
  it('arrival, turn and placed-beat lines are word for word', () => {
    expect(lines('rome-arrival')).toEqual(["Teo's grandchild! Forty years of postcards and finally a visitor.", 'Nonna has told every guest about you. Sorry in advance.']);
    expect(lines('rome-turn')).toEqual([
      'Giulia calls every Sunday. I still worry every Monday.',
      "That's the job, Bruna. So we keep in touch, on the numbers we know.",
      "Then you'll ring me on mine, old man.",
    ]);
    expect(lines('rome-giulia-safe')).toEqual(['I was in a lecture the whole time! Phone on silent.', "Everyone's safe. The bank first, then the rest."]);
  });
  it('resolution: five panels without the variant; with rome_bank_called it opens the scene (six, the cap)', () => {
    const story = [
      "A caller once said he was police. I said I'd ring the station myself. He hung up first.",
      "It sounded exactly like Giulia. I didn't even think.",
      "Of course not. They made it sound like her. That's the trick, not you. We called the bank straight away.",
      "Let's have a family code word for calls and voice messages. Both families. And it stays in the family.",
      undefined,
    ];
    expect(lines('rome-resolution')).toEqual(story);
    const withVariant = shown('rome-resolution', ['rome_bank_called']);
    expect(withVariant).toHaveLength(6);
    expect(withVariant[0]).toMatchObject({ speaker: 'bruna', expression: 'calm', line: "The bank was called straight away, the right first step. We'll see what it can do." });
    expect(withVariant.slice(1).map((p) => p.line)).toEqual(story);
  });
});

describe('Rome scene rules the generic validator does not see', () => {
  it('no amount, no refund promise, no number or account in any scene (STORY §3.6 safety, §5)', () => {
    for (const s of scenes.values()) {
      expect(all(s), s.id).not.toMatch(/€|\beuros?\b|\d{2,}|refund|get (?:it|the money) back|IBAN/i);
    }
  });
  it('the impersonated are shown safe: Giulia on video right after the drill, Teo only on video', () => {
    const g = scene('rome-giulia-safe').panels[0];
    expect(g).toMatchObject({ speaker: 'giulia', video: true });
    for (const s of scenes.values()) {
      for (const p of s.panels) {
        if (p.speaker === 'teo' || p.speaker === 'giulia') expect(p.video, s.id).toBe(true);
      }
    }
    // Davide is drawn beside Bruna (R-S3) and the scene ends calm, the bank first.
    expect(scene('rome-giulia-safe').panels.at(-1)).toMatchObject({ speaker: 'bruna', with: { id: 'davide' } });
  });
  it('Davide is never blamed: Bruna answers his line at once and takes the blame off him', () => {
    const panels = shown('rome-resolution', []);
    const i = panels.findIndex((p) => p.speaker === 'davide' && p.expression === 'sheepish');
    expect(panels[i + 1]?.speaker).toBe('bruna');
    expect(panels[i + 1]?.line).toMatch(/That's the trick, not you/);
  });
  it('the code word is an extra: the If-then calls the known number first (GDD §26.1, RM7)', () => {
    const ifThen = scene('rome-resolution').panels.at(-1)?.if_then;
    expect(ifThen?.action.indexOf('call their known number')).toBeLessThan(ifThen?.action.indexOf('our word') ?? -1);
  });
  it('the turn has no scam content and ends calm on Bruna', () => {
    expect(all(scene('rome-turn'))).not.toMatch(/police|bank|code|money|accident/i);
    expect(scene('rome-turn').panels.at(-1)).toMatchObject({ speaker: 'bruna', expression: 'calm' });
  });
  it('habit poses: phone-ear only on a panel about calling a known number', () => {
    for (const s of scenes.values()) {
      for (const p of s.panels) if (p.expression?.endsWith('-phone-ear')) expect(text(p), s.id).toMatch(/\bcall .*known number/i);
    }
  });
});
