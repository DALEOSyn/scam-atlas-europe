// @vitest-environment jsdom
/**
 * S3 scene player (src/ui/ScenePlayer.tsx) and its place in the app: no auto-advance, focus moves to each
 * new panel, panel structure for screen readers, Skip and Help in the chrome, content notes with a way
 * out, rehearsal choice with one shared reply, flip the postcard, reduced motion, axe in jsdom; and the
 * app plays arrival, placed beats and the resolution around scenarios, then shows the postcard.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import axe from 'axe-core';
import { App } from '../../src/app.tsx';
import type { SceneRef } from '../../src/content/scenes.ts';
import { chapterSchema, type Scene } from '../../src/content/schema.ts';
import { createStore, freshSave, SAVE_KEY, type StorageLike } from '../../src/engine/save.ts';
import { AtlasScreen } from '../../src/ui/Atlas.tsx';
import { ChapterDone } from '../../src/ui/ChapterDone.tsx';
import { ScenePlayer } from '../../src/ui/ScenePlayer.tsx';
import { fixtureScene } from '../content/scene-fixtures.ts';
import { loadExample } from './helpers.ts';

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.motion;
});

async function axeClean(container: HTMLElement) {
  // Layout-dependent rules cannot run in jsdom; the e2e suite runs axe in a browser.
  const r = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)).toEqual([]);
}

const arrival = () => fixtureScene('berlin', 'berlin-arrival');

describe('ScenePlayer: panels, focus and screen-reader structure (ART_DIRECTION §9)', () => {
  it('reveals one panel per press, never by itself; focus moves to the new panel', async () => {
    vi.useFakeTimers();
    const onDone = vi.fn();
    const { container } = render(<ScenePlayer scene={arrival()} place="Berlin" onDone={onDone} />);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(container.querySelectorAll('li[data-panel]').length).toBe(1);
    vi.useRealTimers();
    expect(document.activeElement?.id).toBe('scene-h');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Berlin · Arrival');
    const section = container.querySelector('section[aria-labelledby="scene-h"]') as HTMLElement;
    expect(section.querySelector('ol > li[tabindex="-1"] > figure > figcaption')).toBeTruthy();
    expect(within(section).getByText('Panel 1 of 3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    const second = container.querySelector('li[data-panel="2"]') as HTMLElement;
    expect(document.activeElement).toBe(second);
    expect(within(second).getByText('Panel 2 of 3')).toBeTruthy();
    // Earlier panels stay on screen.
    expect(container.querySelectorAll('li[data-panel]').length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onDone).toHaveBeenCalledWith('finished');
  });
  it('one description per picture; art is <img> with fragment ids; speaker label and role; the player is never drawn', () => {
    const { container } = render(<ScenePlayer scene={arrival()} place="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    const panel = (n: number) => container.querySelector(`li[data-panel="${n}"]`) as HTMLElement;
    const [p1, p2, p3] = [panel(1), panel(2), panel(3)];
    expect(within(p1).getByRole('img', { name: 'Jonas in the courtyard, smiling, by the parcel locker.' })).toBeTruthy();
    expect(p1.querySelector<HTMLImageElement>('img[data-art="speaker"]')?.getAttribute('src')).toBe('/art/cast/jonas.svg#x-warm');
    expect(p1.querySelector<HTMLImageElement>('img[data-art="backdrop"]')?.getAttribute('src')).toBe('/art/backdrops/berlin-courtyard.svg');
    for (const img of container.querySelectorAll('img')) expect(img.getAttribute('alt')).toBe('');
    expect(p1.textContent).toContain('Jonas · Neighbour, Berlin');
    expect(p2.querySelector('img[data-art="listener"]')?.getAttribute('src')).toBe('/art/cast/jonas.svg#x-calm');
    expect(p2.textContent).toContain('Mateus Ferreira · Field partner');
    expect(p3.querySelector('img[data-art="speaker"]')).toBeNull();
    expect(p3.textContent).toContain('You');
  });
  it('Skip ends the scene; Help opens the help list and returns to the same panel', () => {
    const onDone = vi.fn();
    const { container } = render(<ScenePlayer scene={arrival()} place="Berlin" onDone={onDone} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Where to get help' }));
    expect(document.activeElement?.textContent).toBe('Where to report and get help');
    fireEvent.click(screen.getByRole('button', { name: 'Back to the story' }));
    expect(document.activeElement).toBe(container.querySelector('li[data-panel="2"]'));
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    expect(onDone).toHaveBeenCalledWith('skipped');
  });
  it('a sensitive scene opens on its content note with a way out; the help link says "Need to talk?"', () => {
    const scene: Scene = { ...arrival(), sensitive: true };
    const onDone = vi.fn();
    render(<ScenePlayer scene={scene} place="Berlin" contentNote="This chapter includes a family-emergency story. Everyone ends up safe." onDone={onDone} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Before this story scene' })).toBeTruthy();
    expect(document.activeElement?.id).toBe('scene-note-h');
    expect(screen.getByRole('button', { name: 'Need to talk? Where to get help' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the story' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Before this story scene' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show the scene' }));
    expect(screen.getByText('Panel 1 of 3')).toBeTruthy();
    cleanup();
    render(<ScenePlayer scene={scene} place="Berlin" contentNote="A note." onDone={onDone} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip this scene' }));
    expect(onDone).toHaveBeenLastCalledWith('skipped');
  });
  it('the rehearsal choice gives the same reply to every option and moves focus to it; local phrase has lang', () => {
    for (const option of ['Pause', 'Ask someone']) {
      const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-turn')} place="Berlin" onDone={() => undefined} />);
      expect(container.querySelector('span[lang="de"]')?.textContent).toBe('Gute Nacht.');
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      fireEvent.click(screen.getByRole('button', { name: option }));
      const reply = container.querySelector('[data-reply]') as HTMLElement;
      expect(reply.textContent).toContain('All three work. Pausing first makes the other two easier.');
      expect(document.activeElement).toBe(reply);
      expect(screen.getByText(`You: ${option}`)).toBeTruthy();
      cleanup();
    }
  });
  it('the If-then panel shows "Postcard to Teo" and the line word for word; variant panels follow run flags', () => {
    const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-resolution')} place="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(container.querySelectorAll('li[data-panel]').length).toBe(2);
    expect(screen.getByText('Postcard to Teo')).toBeTruthy();
    expect(container.querySelector('[data-if-then]')?.textContent).toBe("If a parcel message wants money or a click, then I open the courier's app myself.");
    cleanup();
    render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-resolution')} place="Berlin" flags={new Set(['berlin_test_variant'])} onDone={() => undefined} />);
    expect(screen.getByText('Panel 1 of 3')).toBeTruthy();
  });
  it('interlude: placeholders, flip the postcard (one tap, recorded), skipped when no postcard is eligible', () => {
    const onFlip = vi.fn();
    const scene = fixtureScene('interludes', 'interlude-cafe');
    const flip = { city: 'berlin', cityName: 'Berlin', ifThen: { cue: 'If a parcel message wants money or a click,', action: "then I open the courier's app myself." } };
    const { container } = render(<ScenePlayer scene={scene} place={null} vars={{ count: 4, lastCity: 'Rome' }} flip={flip} onFlip={onFlip} onDone={() => undefined} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Between cities · On the road');
    expect(container.textContent).toContain('4 cities so far, the last one Rome.');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Remember what they did? Tap to flip.')).toBeTruthy();
    const card = container.querySelector('[data-flip-card]') as HTMLElement;
    expect(card.textContent).toContain('If a parcel message wants money or a click…');
    expect(card.textContent).not.toContain('then I open');
    fireEvent.click(within(card).getByRole('button', { name: 'Turn over' }));
    expect(onFlip).toHaveBeenCalledWith('berlin');
    expect(card.textContent).toContain("then I open the courier's app myself.");
    fireEvent.click(within(card).getByRole('button', { name: 'Turn over' }));
    expect(card.textContent).not.toContain('then I open');
    expect(onFlip).toHaveBeenCalledTimes(1);
    cleanup();
    render(<ScenePlayer scene={scene} place={null} flip={null} onDone={() => undefined} />);
    expect(screen.getByText('Panel 1 of 2')).toBeTruthy();
  });
  it('axe: no violations on panels, choice, content note and help', async () => {
    const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-turn')} place="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await axeClean(container as HTMLElement);
    cleanup();
    const note = render(<ScenePlayer scene={{ ...arrival(), sensitive: true }} place="Berlin" contentNote="A note." onDone={() => undefined} />);
    await axeClean(note.container as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    await axeClean(note.container as HTMLElement);
  });
  it('reduced motion: panels and postcards still render their end state (durations are 0 via tokens)', () => {
    document.documentElement.dataset.motion = 'reduced';
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<ScenePlayer scene={arrival()} place="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'nearest' });
    delete (Element.prototype as Partial<Element>).scrollIntoView;
  });
});

describe('postcards on the chapter end and the Atlas', () => {
  const ifThen = { cue: 'If a parcel message wants money or a click,', action: "then I open the courier's app myself.", extra: 'A real job pays you.' };
  it('chapter end shows the postcard (score-neutral), with Turn over when the front exists', () => {
    const summary = { points: 0, max: 0, rating: 0, spotted: 0, spottedShown: 0, correctShown: 0, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleChecks: 0, offFocusDoubleChecks: 0, stamp: 'bronze' as const, nextTier: null };
    const { container } = render(<ChapterDone summary={summary} city="Berlin" postcard={{ ifThen, backdrop: 'berlin-courtyard' }} onBack={() => undefined} />);
    const card = container.querySelector('[data-chapter-postcard]') as HTMLElement;
    expect(card.textContent).toContain("Postcard to Teo:If a parcel message wants money or a click, then I open the courier's app myself.A real job pays you.");
    fireEvent.click(within(card).getByRole('button', { name: 'Turn over' }));
    expect(within(card).getByRole('img', { name: 'Postcard front: Berlin.' })).toBeTruthy();
  });
  it('the Atlas lists pages with habit-card links; empty state', () => {
    const { container } = render(<AtlasScreen pages={[{ city: 'berlin', name: 'Berlin', ifThen, cards: ['open-it-yourself'] }]} onBack={() => undefined} />);
    expect(container.querySelector('[data-atlas-page="berlin"]')?.textContent).toContain(ifThen.cue);
    expect(container.querySelector('[data-habit-card="open-it-yourself"]')).toBeTruthy();
    cleanup();
    render(<AtlasScreen pages={[]} onBack={() => undefined} />);
    expect(screen.getByText('No pages yet. Finish a city to add its page.')).toBeTruthy();
  });
});

describe('App: scenes around scenarios (retrofit hooks)', () => {
  function memory(): StorageLike & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
  }
  const ex = loadExample();
  const chapter = chapterSchema.parse({
    slot: 0,
    city: 'berlin',
    name: 'Berlin',
    status: 'draft',
    patterns: ['smishing-parcel-fee'],
    lo_focus: ['LO-03'],
    scenario_order: { am: [ex.id], pm: [] },
    intro: 'Test chapter.',
    scenes: { arrival: 'berlin-arrival', resolution: 'berlin-resolution', placed: [{ scene: 'berlin-turn', after: ex.id }] },
    atlas_cards: ['open-it-yourself'],
  });
  const refs: SceneRef[] = [
    { folder: 'berlin', id: 'berlin-arrival', load: async () => fixtureScene('berlin', 'berlin-arrival') },
    { folder: 'berlin', id: 'berlin-turn', load: async () => fixtureScene('berlin', 'berlin-turn') },
    { folder: 'berlin', id: 'berlin-resolution', load: async () => fixtureScene('berlin', 'berlin-resolution') },
  ];
  const finishScene = async () => {
    for (;;) {
      const btn = await screen.findByRole('button', { name: /^(Next|Continue)$/ });
      const isLast = btn.textContent === 'Continue';
      fireEvent.click(btn);
      if (isLast) return;
    }
  };

  it('arrival → scenario → placed beat → resolution → chapter end with the postcard; scenes are saved as seen', async () => {
    const mem = memory();
    render(<App chapters={[chapter]} load={async () => ex} sceneRefs={refs} store={createStore(mem)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await screen.findByText('Panel 1 of 3');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Berlin · Arrival');
    await finishScene();
    fireEvent.click(await screen.findByRole('button', { name: /Calm preset/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText(/Berlin · Midday/);
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByText(/Berlin · Before you go/);
    await finishScene();
    const done = await screen.findByRole('heading', { name: 'Chapter complete' });
    expect(done.closest('section')?.textContent).toContain("If a parcel message wants money or a click, then I open the courier's app myself.");
    const saved = JSON.parse(mem.data.get(SAVE_KEY) ?? '{}') as { story: { postcards: string[]; seen: string[] } };
    expect(saved.story.postcards).toEqual(['berlin']);
    expect(saved.story.seen).toEqual(['berlin-arrival', 'berlin-turn', 'berlin-resolution']);
    // Chapter list: replay the story scenes; the title screen offers the Atlas.
    fireEvent.click(screen.getByRole('button', { name: 'Back to the chapters' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Story scenes: Berlin' }));
    expect(screen.getByRole('button', { name: 'Watch Arrival' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Watch Before you go' }));
    await screen.findByText(/Berlin · Before you go/);
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByRole('heading', { name: 'Story scenes: Berlin' });
  });
  it('with zero scenes the chapter plays unchanged: no scene screens, no Atlas button', async () => {
    const plain = chapterSchema.parse({ ...chapter, scenes: undefined });
    const s = freshSave();
    s.story.postcards = ['berlin'];
    const mem = memory();
    mem.data.set(SAVE_KEY, JSON.stringify(s));
    render(<App chapters={[plain]} load={async () => ex} sceneRefs={[]} store={createStore(mem)} />);
    expect(screen.queryByRole('button', { name: 'Waymarker Atlas' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await screen.findByRole('button', { name: /Calm preset/ });
    expect(screen.queryByText(/Panel 1 of/)).toBeNull();
  });
  it('an interlude plays on the way back to the map when its play position is reached', async () => {
    const middle = (city: string, slot: number) => chapterSchema.parse({ ...chapter, city, name: city[0]?.toUpperCase() + city.slice(1), slot, scenes: undefined });
    const chapters = [middle('rome', 6), middle('madrid', 4)];
    const s = freshSave();
    s.chapters.rome = { finished: true, bestStamp: 'bronze', bestRating: 0, position: 0, run: null };
    s.chapters.madrid = { finished: false, bestStamp: null, bestRating: 0, position: 1, run: { index: 0, records: [], flags: [] } };
    s.story.postcards = ['rome'];
    const mem = memory();
    mem.data.set(SAVE_KEY, JSON.stringify(s));
    const interlude: SceneRef = { folder: 'interludes', id: 'interlude-cafe', load: async () => fixtureScene('interludes', 'interlude-cafe') };
    render(<App chapters={chapters} load={async () => ({ ...ex, id: 'home-00-example' })} sceneRefs={[interlude]} store={createStore(mem)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: /Calm preset/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Back to the chapters' }));
    await screen.findByText(/Between cities · On the road/);
    // No postcard is two chapters old yet, so the flip panel is left out.
    expect(screen.getByText('Panel 1 of 2')).toBeTruthy();
    expect(screen.getByText(/2 cities so far, the last one Madrid\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByRole('heading', { level: 1, name: 'Chapters' });
    const saved = JSON.parse(mem.data.get(SAVE_KEY) ?? '{}') as { story: { seen: string[] } };
    expect(saved.story.seen).toContain('interlude-cafe');
  });
});
