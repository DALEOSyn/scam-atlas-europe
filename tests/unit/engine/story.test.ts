/**
 * S3 story layer (src/engine/story.ts): placement, variant panels, interludes keyed to play position,
 * postcards (with finishing, never with a score), flip the postcard (spacing and least recently flipped),
 * Atlas pages, and the save format (additive, sanitised).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { chapterSchema, type Chapter } from '../../../src/content/schema.ts';
import { beginChapter, finishChapter } from '../../../src/engine/game.ts';
import { createStore, freshSave, parseSave } from '../../../src/engine/save.ts';
import {
  arrivalSceneId,
  atlasPages,
  chapterSceneIds,
  dueInterlude,
  EMPTY_STORY,
  fillStory,
  flipCandidates,
  ifThenLine,
  ifThenOf,
  markSeen,
  middleFinished,
  pickFlip,
  recordFlip,
  recordPostcard,
  resolutionSceneId,
  sanitiseStory,
  scenesAfter,
  storyVars,
  turnSceneId,
  visiblePanels,
  type StoryState,
} from '../../../src/engine/story.ts';
import { fixtureScene } from '../../content/scene-fixtures.ts';
import { ROOT } from '../helpers.ts';
import { B } from './helpers.ts';

function berlin(scenes?: Record<string, unknown>): Chapter {
  const raw = parse(readFileSync(join(ROOT, 'content', 'chapters', 'berlin.yaml'), 'utf8')) as Record<string, unknown>;
  // Without an argument: Berlin as it was before S4 (no scenes), so the placement rules are tested on
  // their own; the authored scenes are checked in tests/content/story-scenes.test.ts.
  return chapterSchema.parse({ ...raw, scenes });
}

const story = (postcards: string[], flips: string[] = []): StoryState => ({ ...EMPTY_STORY, postcards, flips });

describe('placement in a chapter (STORY §3, §6)', () => {
  it('a chapter without scenes has none (Home and Berlin play unchanged)', () => {
    const c = berlin();
    expect(arrivalSceneId(c)).toBeNull();
    expect(turnSceneId(c)).toBeNull();
    expect(resolutionSceneId(c)).toBeNull();
    expect(chapterSceneIds(c)).toEqual([]);
    expect(scenesAfter(c, 'berlin-04-teo-customs')).toEqual([]);
  });
  it('arrival, placed beats, turn and resolution in play order', () => {
    const c = berlin({ arrival: 'a', turn: 't', resolution: 'r', placed: [{ scene: 'p-pm', after: 'berlin-06-payment-failed' }, { scene: 'p-am', after: 'berlin-04-teo-customs' }] });
    expect(chapterSceneIds(c)).toEqual(['a', 'p-am', 't', 'p-pm', 'r']);
    expect(scenesAfter(c, 'berlin-04-teo-customs')).toEqual(['p-am']);
  });
});

describe('panels and text', () => {
  it('story-only variant flags pick panels; nothing else branches', () => {
    const s = fixtureScene('berlin', 'berlin-resolution');
    expect(visiblePanels(s, new Set()).length).toBe(2);
    expect(visiblePanels(s, new Set(['berlin_test_variant'])).length).toBe(3);
  });
  it('the If-then line is cue + action, word for word, from the resolution\'s last panel', () => {
    const line = ifThenOf(fixtureScene('berlin', 'berlin-resolution'));
    expect(line && ifThenLine(line)).toBe("If a parcel message wants money or a click, then I open the courier's app myself.");
    expect(ifThenOf(fixtureScene('berlin', 'berlin-arrival'))).toBeNull();
  });
  it('{count} and {lastCity}', () => {
    const chapters = [{ city: 'home', name: 'Home' }, { city: 'berlin', name: 'Berlin' }];
    const vars = storyVars(story(['home', 'berlin']), chapters);
    expect(fillStory('{count} cities, last {lastCity}.', vars)).toBe('2 cities, last Berlin.');
  });
});

describe('interludes follow play position, never a city (STORY §3.12)', () => {
  const chapters = [
    { city: 'home', slot: 0 },
    { city: 'berlin', slot: 1 },
    { city: 'madrid', slot: 4 },
    { city: 'rome', slot: 6 },
    { city: 'lisbon', slot: 7 },
    { city: 'brussels', slot: 10 },
  ];
  const interludes = [
    { id: 'i2', after_middle: 4 },
    { id: 'i1', after_middle: 2 },
  ];
  it('counts finished middle chapters only', () => {
    expect(middleFinished(chapters, (c) => ['home', 'berlin', 'rome'].includes(c))).toBe(1);
    expect(middleFinished(chapters, (c) => ['rome', 'lisbon', 'brussels'].includes(c))).toBe(2);
  });
  it('the earliest unseen interlude whose position is reached, whatever the cities', () => {
    expect(dueInterlude(interludes, 1, [])).toBeNull();
    expect(dueInterlude(interludes, 2, [])).toBe('i1');
    expect(dueInterlude(interludes, 2, ['i1'])).toBeNull();
    expect(dueInterlude(interludes, 4, ['i1'])).toBe('i2');
    expect(dueInterlude(interludes, 5, [])).toBe('i1');
  });
});

describe('postcards and flip the postcard', () => {
  it('a postcard comes with every first finish, whatever the score', () => {
    const chapter = berlin();
    for (const save of [beginChapter(freshSave(), 'berlin', chapter)]) {
      const done = finishChapter(save, B, chapter);
      expect(done.save.story.postcards).toEqual(['berlin']);
      expect(done.summary.stamp).toBe('bronze'); // no records at all: still a postcard
      const again = finishChapter(beginChapter(done.save, 'berlin', chapter), B, chapter);
      expect(again.save.story.postcards).toEqual(['berlin']);
    }
    expect(recordPostcard(story(['home']), 'home')).toEqual(story(['home']));
  });
  it('flips come from cities finished at least two chapters earlier', () => {
    expect(flipCandidates(story(['home', 'berlin']))).toEqual([]);
    expect(flipCandidates(story(['home', 'berlin', 'rome']))).toEqual(['home']);
    expect(flipCandidates(story(['home', 'berlin', 'rome', 'madrid']))).toEqual(['home', 'berlin']);
  });
  it('prefers the postcard flipped least recently; skips cities with no line', () => {
    const all = () => true;
    const s = story(['home', 'berlin', 'rome', 'madrid', 'lisbon']);
    expect(pickFlip(s, all)).toBe('home');
    const s1 = recordFlip(s, 'home');
    expect(pickFlip(s1, all)).toBe('berlin');
    const s2 = recordFlip(recordFlip(s1, 'berlin'), 'rome');
    expect(pickFlip(s2, all)).toBe('home');
    expect(pickFlip(s, (c) => c === 'rome')).toBe('rome');
    expect(pickFlip(story(['home']), all)).toBeNull();
    expect(pickFlip(story(['home']), all, true)).toBe('home');
    expect(recordFlip(story([], ['a', 'b']), 'a').flips).toEqual(['b', 'a']);
  });
  it('Atlas pages: If-then line + the chapter\'s habit cards, in finish order; no page without a line', () => {
    const chapters = [
      { city: 'home', name: 'Home', atlas_cards: ['ask-someone'] },
      { city: 'berlin', name: 'Berlin', atlas_cards: ['open-it-yourself', 'read-the-link'] },
    ];
    const lines = new Map([['berlin', { cue: 'If a parcel message wants money or a click,', action: "then I open the courier's app myself." }]]);
    const pages = atlasPages(chapters, story(['home', 'berlin']), lines);
    expect(pages).toEqual([{ city: 'berlin', name: 'Berlin', ifThen: lines.get('berlin'), cards: ['open-it-yourself', 'read-the-link'] }]);
  });
});

describe('save (additive story field, sanitised, no personal data)', () => {
  it('a fresh save has an empty story; old saves without it load', () => {
    expect(freshSave().story).toEqual({ postcards: [], flips: [], seen: [] });
    const old = JSON.stringify({ version: 1, settings: {}, chapters: {} });
    expect(parseSave(old).save.story).toEqual({ postcards: [], flips: [], seen: [] });
  });
  it('keeps only content ids; drops junk and duplicates', () => {
    expect(sanitiseStory({ postcards: ['home', 'home', 'Berlin!', 3, 'rome'], flips: 'x', seen: ['berlin-arrival', { a: 1 }] })).toEqual({ postcards: ['home', 'rome'], flips: [], seen: ['berlin-arrival'] });
  });
  it('round-trips through storage', () => {
    const data = new Map<string, string>();
    const store = createStore({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) });
    const s = freshSave();
    s.story = markSeen(recordFlip(recordPostcard(recordPostcard(s.story, 'home'), 'berlin'), 'home'), 'berlin-arrival');
    store.save(s);
    expect(store.load().story).toEqual({ postcards: ['home', 'berlin'], flips: ['home'], seen: ['berlin-arrival'] });
  });
});
