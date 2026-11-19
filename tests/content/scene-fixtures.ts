/**
 * Scene fixtures (S3): art built from the three style samples in public/art/samples/ (the only place the
 * samples are used), and the fixture scenes in tests/fixtures/scenes/.
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { sceneSchema, type Scene } from '../../src/content/schema.ts';
import { ROOT } from './fixtures.ts';

export const SAMPLES = resolve(ROOT, 'public', 'art', 'samples');
export const SCENE_FIXTURES = resolve(ROOT, 'tests', 'fixtures', 'scenes');

const TEO = readFileSync(join(SAMPLES, 'sample-portrait-teo.svg'), 'utf8');

/**
 * A rig file from the Teo sample: its base, then one expression group per id (a copy of the sample's
 * `x-thinking` group), with `x-calm` last as the default group (ART_DIRECTION §4.2).
 */
export function rigSvg(expressions: readonly string[]): string {
  const lines = TEO.split('\n');
  const start = lines.findIndex((l) => l.startsWith('<g id="x-thinking"'));
  const end = lines.findIndex((l, i) => i > start && l === '</g>');
  const base = lines.slice(0, start);
  const body = lines.slice(start + 1, end);
  const group = (id: string, cls: string) => [`<g id="x-${id}" class="${cls}" stroke="#2b2433" stroke-linecap="round" stroke-linejoin="round">`, ...body, '</g>'];
  const others = expressions.filter((e) => e !== 'calm');
  return [...base, ...others.flatMap((e) => group(e, 'x')), ...group('calm', 'x x-default'), '</svg>', ''].join('\n');
}

export const FIXTURE_CAST: Record<string, string[]> = {
  teo: ['calm', 'warm', 'thinking', 'proud', 'sheepish', 'laughing'],
  jonas: ['calm', 'warm', 'worried', 'thinking', 'relieved', 'proud'],
  mateus: ['calm', 'laughing', 'focused', 'sheepish', 'worried', 'relieved', 'thinking'],
  // CR-43, CR-44: the finale fixture's resolution scenes (tests/fixtures/finale/scenes).
  adaeze: ['calm', 'warm'],
  noor: ['calm', 'relieved', 'proud'],
};

/** A temporary public/ with art/cast and art/backdrops built from the samples. */
export function fixturePublicDir(cast: Record<string, readonly string[]> = FIXTURE_CAST): string {
  const dir = mkdtempSync(join(tmpdir(), 'sae-art-'));
  mkdirSync(join(dir, 'art', 'cast'), { recursive: true });
  mkdirSync(join(dir, 'art', 'backdrops'), { recursive: true });
  mkdirSync(join(dir, 'art', 'frames'), { recursive: true });
  for (const [id, ex] of Object.entries(cast)) writeFileSync(join(dir, 'art', 'cast', `${id}.svg`), rigSvg(ex));
  copyFileSync(join(SAMPLES, 'sample-backdrop-berlin-courtyard.svg'), join(dir, 'art', 'backdrops', 'berlin-courtyard.svg'));
  copyFileSync(join(SAMPLES, 'sample-backdrop-berlin-courtyard.svg'), join(dir, 'art', 'backdrops', 'home-kitchen.svg'));
  copyFileSync(join(SAMPLES, 'sample-postcard-frame.svg'), join(dir, 'art', 'frames', 'postcard-stamp.svg'));
  return dir;
}

export type Raw = Record<string, unknown>;

export function rawFixtureScene(folder: string, id: string): Raw {
  return parse(readFileSync(join(SCENE_FIXTURES, folder, `${id}.yaml`), 'utf8')) as Raw;
}

export function fixtureScene(folder: string, id: string): Scene {
  return sceneSchema.parse(rawFixtureScene(folder, id));
}

/** A minimal valid scene; tests change one thing. */
export function rawScene(over: Raw = {}): Raw {
  return {
    id: 'berlin-arrival',
    chapter: 'berlin',
    slot: 'arrival',
    panels: [
      {
        backdrop: 'berlin-courtyard',
        speaker: 'jonas',
        expression: 'warm',
        line: 'I take in everyone\'s parcels.',
        alt: 'Jonas in the courtyard, smiling, by the parcel locker.',
      },
    ],
    ...over,
  };
}

export function sceneIssues(raw: Raw): string[] {
  const r = sceneSchema.safeParse(raw);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
}
