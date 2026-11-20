// @vitest-environment jsdom
/**
 * S3 scene player (src/ui/ScenePlayer.tsx) and its place in the app: no auto-advance, focus moves to each
 * new panel, panel structure for screen readers, Skip and Help in the chrome, content notes with a way
 * out, rehearsal choice with one shared reply, flip the postcard, reduced motion, axe in jsdom; and the
 * app plays arrival, placed beats and the resolution around scenarios, then shows the postcard.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import axe from 'axe-core';
import { App } from '../../src/app.tsx';
import type { SceneRef } from '../../src/content/scenes.ts';
import { chapterSchema, type Scene } from '../../src/content/schema.ts';
import { createStore, freshSave, SAVE_KEY, type StorageLike } from '../../src/engine/save.ts';
import { AtlasScreen } from '../../src/ui/Atlas.tsx';
import { ChapterDone } from '../../src/ui/ChapterDone.tsx';
import { liftArtCap, revealOnOpen, revealPanel, ScenePlayer, sceneHeading, scenePart, shrinkArt } from '../../src/ui/ScenePlayer.tsx';
import { GenericHelpList } from '../../src/ui/HelpCards.tsx';
import { fixtureScene } from '../content/scene-fixtures.ts';
import { loadExample } from './helpers.ts';

afterEach(() => {
  cleanup();
  // CR-28 follow-up: motion and geometry stubs are reset here, so a failing test cannot leak them.
  delete document.documentElement.dataset.motion;
  vi.restoreAllMocks();
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
    const { container } = render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={onDone} />);
    act(() => void vi.advanceTimersByTime(60_000));
    expect(container.querySelectorAll('li[data-panel]').length).toBe(1);
    vi.useRealTimers();
    expect(document.activeElement?.id).toBe('scene-h');
    // Item 14: the visible "Story scene" kicker sits outside the h1 (aria-hidden); the h1 carries a
    // visually hidden "Story scene: " so screen readers hear the same.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Story scene: Berlin · Arrival');
    expect(container.querySelector('p[class*="kicker"]')?.textContent?.trim()).toBe('Story scene');
    expect(container.querySelector('p[class*="kicker"]')?.getAttribute('aria-hidden')).toBe('true');
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
    const { container } = render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={() => undefined} />);
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
  it('Skip ends the scene; Help opens the help list and returns to the same panel, focus on it (T-4.5 round 2)', () => {
    const onDone = vi.fn();
    const { container } = render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={onDone} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Where to get help' }));
    expect(document.activeElement?.textContent).toBe('Where to report and get help');
    // QA 2 (T-4.2 review): two Back buttons, above and below the cards; both return to the same place.
    expect(screen.getAllByRole('button', { name: 'Back to the story' })).toHaveLength(2);
    // Opened from the panels: back on the same panel (the reading place), and no panel was skipped.
    const onPanel2 = () => {
      const p2 = container.querySelector('li[data-panel="2"]');
      expect(document.activeElement).toBe(p2);
      expect(within(p2 as HTMLElement).getByText('Panel 2 of 3')).toBeTruthy();
      expect(container.querySelector('li[data-panel="3"]')).toBeNull();
      expect(screen.queryByText('Panel 3 of 3')).toBeNull();
    };
    fireEvent.click(screen.getAllByRole('button', { name: 'Back to the story' })[1] as HTMLElement);
    onPanel2();
    // The top Back button does the same.
    fireEvent.click(screen.getByRole('button', { name: 'Where to get help' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Back to the story' })[0] as HTMLElement);
    onPanel2();
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    expect(onDone).toHaveBeenCalledWith('skipped');
  });
  it('T-4.2: the help view shows the per-country cards; sensitive scenes put support first (WHERE_TO_REPORT §3c)', () => {
    const groups = () => [...document.querySelectorAll('[data-help-group]')].map((g) => g.getAttribute('data-help-group'));
    render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Where to get help' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Your country (for local numbers; stays on this device)' }), { target: { value: 'SE' } });
    expect(groups()).toEqual(['bank', 'report', 'support', 'child', 'crisis']);
    expect(screen.getAllByRole('heading', { level: 2 }).at(-1)?.textContent).toBe('Thinking about ending your life, or worried about someone?');
    cleanup();
    render(<ScenePlayer scene={{ ...arrival(), sensitive: true }} heading="Berlin · Arrival" chapterName="Berlin" contentNote="A note." onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Your country (for local numbers; stays on this device)' }), { target: { value: 'SE' } });
    expect(groups()).toEqual(['support', 'child', 'crisis', 'bank', 'report']);
  });
  it('a sensitive scene opens on its content note with a way out; the help link says "Need to talk?"', () => {
    const scene: Scene = { ...arrival(), sensitive: true };
    const onDone = vi.fn();
    render(<ScenePlayer scene={scene} heading="Berlin · Arrival" chapterName="Berlin" contentNote="This chapter includes a family-emergency story. Everyone ends up safe." onDone={onDone} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Before this story scene' })).toBeTruthy();
    expect(document.activeElement?.id).toBe('scene-note-h');
    expect(screen.getByRole('button', { name: 'Need to talk? Where to get help' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Back to the story' })[0] as HTMLElement);
    expect(screen.getByRole('heading', { level: 1, name: 'Before this story scene' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show the scene' }));
    expect(screen.getByText('Panel 1 of 3')).toBeTruthy();
    cleanup();
    render(<ScenePlayer scene={scene} heading="Berlin · Arrival" chapterName="Berlin" contentNote="A note." onDone={onDone} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip this scene' }));
    expect(onDone).toHaveBeenLastCalledWith('skipped');
  });
  it('the rehearsal choice gives the same reply to every option and moves focus to it; local phrase has lang', () => {
    for (const option of ['Pause', 'Ask someone']) {
      const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-turn')} heading="Berlin · Later" chapterName="Berlin" onDone={() => undefined} />);
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
  it('the If-then panel shows the postcard (its own "Postcard to Teo:" heading, no extra narration) word for word; variant panels follow run flags', () => {
    const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-resolution')} heading="Berlin · Before you go" chapterName="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(container.querySelectorAll('li[data-panel]').length).toBe(2);
    const last = container.querySelector('li[data-panel="2"]') as HTMLElement;
    expect(within(last).getByText('Postcard to Teo:')).toBeTruthy();
    expect(within(last).queryByText('Postcard to Teo')).toBeNull();
    expect(last.querySelector('[data-postcard]')?.getAttribute('data-postcard')).toBe('Berlin');
    expect(container.querySelector('[data-if-then]')?.textContent).toBe("If a parcel message wants money or a click, then I open the courier's app myself.");
    cleanup();
    render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-resolution')} heading="Berlin · Before you go" chapterName="Berlin" flags={new Set(['berlin_test_variant'])} onDone={() => undefined} />);
    expect(screen.getByText('Panel 1 of 3')).toBeTruthy();
  });
  it('interlude: placeholders, flip the postcard (recorded when shown, the tap optional), skipped when no postcard is eligible', () => {
    const onFlip = vi.fn();
    const scene = fixtureScene('interludes', 'interlude-cafe');
    const flip = { city: 'berlin', cityName: 'Berlin', ifThen: { cue: 'If a parcel message wants money or a click,', action: "then I open the courier's app myself." } };
    const { container } = render(<ScenePlayer scene={scene} heading="Between cities" vars={{ count: 4, lastCity: 'Rome' }} flip={flip} onFlip={onFlip} onDone={() => undefined} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Story scene: Between cities');
    expect(container.textContent).toContain('4 cities so far, the last one Rome.');
    expect(onFlip).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    // [P] Item 8: shown = flipped, before any tap.
    expect(onFlip).toHaveBeenCalledWith('berlin');
    // CR-28 (S6): STORY §3.12's caption, word for word.
    expect(screen.getByText('Remember what they did? Tap to flip.')).toBeTruthy();
    const card = container.querySelector('[data-flip-card]') as HTMLElement;
    expect(card.textContent).toContain('If a parcel message wants money or a click…');
    expect(card.textContent).not.toContain('then I open');
    const flipBtn = within(card).getByRole('button', { name: 'Flip' });
    expect(flipBtn.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(flipBtn);
    expect(card.textContent).toContain("then I open the courier's app myself.");
    // CR-28 (S6, round 2): the label carries the state; no aria-pressed (the live region announces the face).
    const back = within(card).getByRole('button', { name: 'Flip back' });
    expect(back.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(back);
    expect(card.textContent).not.toContain('then I open');
    expect(within(card).getByRole('button', { name: 'Flip' })).toBeTruthy();
    expect(onFlip).toHaveBeenCalledTimes(1);
    cleanup();
    render(<ScenePlayer scene={scene} heading="Between cities" flip={null} onDone={() => undefined} />);
    expect(screen.getByText('Panel 1 of 2')).toBeTruthy();
  });
  it('axe: no violations on panels, choice, content note and help', async () => {
    const { container } = render(<ScenePlayer scene={fixtureScene('berlin', 'berlin-turn')} heading="Berlin · Later" chapterName="Berlin" onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await axeClean(container as HTMLElement);
    cleanup();
    const note = render(<ScenePlayer scene={{ ...arrival(), sensitive: true }} heading="Berlin · Arrival" chapterName="Berlin" contentNote="A note." onDone={() => undefined} />);
    await axeClean(note.container as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Need to talk? Where to get help' }));
    await axeClean(note.container as HTMLElement);
  });
  for (const reduced of [false, true]) {
    it(`Next scrolls the new caption above the footer: ${reduced ? "'auto' with reduced motion (durations are 0 via tokens)" : "'smooth' without reduced motion"}`, () => {
      if (reduced) document.documentElement.dataset.motion = 'reduced';
      const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
      // Stubbed geometry: every figcaption ends at 560, the footer starts at 500, a panel spans 200..560.
      const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
      const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        if (this.tagName === 'FIGCAPTION') return box(400, 560);
        if (this.tagName === 'LI') return box(200, 560);
        if (this.querySelector?.('[data-scene="next"]')) return box(500, 568);
        return box(0, 0);
      });
      render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={() => undefined} />);
      scroll.mockClear();
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(scroll).toHaveBeenCalledWith({ top: 68, behavior: reduced ? 'auto' : 'smooth' });
      expect(rect).toHaveBeenCalled();
    });
  }
  it('CR-28 round 2: a time caption comes before the speaker and the line, on screen and in reading order', () => {
    const sc = arrival();
    const first = sc.panels[0];
    if (!first?.line || !first.speaker) throw new Error('fixture changed: panel 1 needs a speaker line');
    const scene = { ...sc, panels: [{ ...first, caption: 'Later that evening.' }, ...sc.panels.slice(1)] };
    const { container } = render(<ScenePlayer scene={scene} heading="Berlin · Arrival" chapterName="Berlin" onDone={() => undefined} />);
    const texts = [...(container.querySelector('li[data-panel="1"] figcaption')?.children ?? [])].map((x) => x.textContent ?? '');
    expect(texts[0]).toBe('Later that evening.');
    expect(texts.findIndex((x) => x.includes(first.line ?? ''))).toBeGreaterThan(0);
  });
  it('CR-28 revealPanel: the caption end goes above the footer; a panel that fits is shown whole; else the caption wins', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
    const make = (liTop: number, capBottom: number) => {
      const li = document.createElement('li');
      const cap = document.createElement('figcaption');
      li.append(cap);
      li.getBoundingClientRect = () => box(liTop, capBottom);
      cap.getBoundingClientRect = () => box(capBottom - 50, capBottom);
      return li;
    };
    const footer = document.createElement('div');
    footer.getBoundingClientRect = () => box(500, 568);
    // Caption runs 60 px under the footer (edge 500 − 8): scroll down by 68.
    revealPanel(make(200, 560), footer, 'smooth');
    expect(scroll).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
    // Fits but its top is above the viewport: scroll up to show the top (8 px margin).
    revealPanel(make(-100, 300), footer, 'auto');
    expect(scroll).toHaveBeenLastCalledWith({ top: -108, behavior: 'auto' });
    // Taller than the room: only as far up as keeps the caption end above the footer.
    revealPanel(make(-400, 450), footer, 'auto');
    expect(scroll).toHaveBeenLastCalledWith({ top: -42, behavior: 'auto' });
    // Already clear: no scroll.
    scroll.mockClear();
    revealPanel(make(100, 400), footer, 'auto');
    expect(scroll).not.toHaveBeenCalled();
    // CR-29 round 2, side by side: the caption clears the footer but the picture ends 40 px lower; the
    // panel fits, so its whole end (the picture's) goes above the footer: 440 − 492 + … = scroll 28.
    const side = make(100, 480);
    side.getBoundingClientRect = () => box(100, 520);
    revealPanel(side, footer, 'auto');
    expect(scroll).toHaveBeenLastCalledWith({ top: 28, behavior: 'auto' });
    scroll.mockRestore();
  });
});

describe('CR-29: art caps and the open path (geometry stubbed)', () => {
  const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }) as DOMRect;
  /** A panel whose art height follows the inline cap (CSS is not applied in jsdom). */
  function panel(top: number, artH: number, capH: number) {
    const li = document.createElement('li');
    const art = document.createElement('div');
    art.setAttribute('role', 'img');
    const cap = document.createElement('figcaption');
    li.append(art, cap);
    const h = () => parseInt(li.style.getPropertyValue('--art-max-h'), 10) || artH;
    art.getBoundingClientRect = () => box(top, top + h());
    cap.getBoundingClientRect = () => box(top + h() + 8, top + h() + 8 + capH);
    li.getBoundingClientRect = () => box(top, top + h() + 8 + capH);
    return li;
  }
  const footerAt = (y: number) => {
    const f = document.createElement('div');
    f.getBoundingClientRect = () => box(y, y + 60);
    return f;
  };
  const headAt = (top: number, bottom: number) => {
    const h = document.createElement('header');
    h.getBoundingClientRect = () => box(top, bottom);
    return h;
  };

  it('revealOnOpen: fits without scrolling; else scrolls no further than keeps the heading row; then caps the art; the heading row wins', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    // Everything fits above the footer edge (500 − 8): no scroll, no cap.
    let li = panel(130, 200, 100);
    revealOnOpen(headAt(16, 120), li, footerAt(500));
    expect(scroll).not.toHaveBeenCalled();
    expect(li.style.getPropertyValue('--art-max-h')).toBe('');
    // Caption 10 px under; the heading row is 16 px from the top: scroll 10, no cap.
    li = panel(130, 200, 164);
    revealOnOpen(headAt(16, 120), li, footerAt(500));
    expect(scroll).toHaveBeenLastCalledWith({ top: 10, behavior: 'auto' });
    expect(li.style.getPropertyValue('--art-max-h')).toBe('');
    // 68 px under, 16 px of room: the art is capped by 52 (+ 2 for rounding), then the page scrolls the
    // 14 px still needed (within the 16 px of room).
    li = panel(130, 200, 222);
    revealOnOpen(headAt(16, 120), li, footerAt(500));
    expect(li.style.getPropertyValue('--art-max-h')).toBe('146px');
    expect(scroll).toHaveBeenLastCalledWith({ top: 14, behavior: 'auto' });
    // Too tall even at the 88 px floor: the art stops at 88, the scroll stops at the heading row's top.
    li = panel(130, 200, 400);
    revealOnOpen(headAt(16, 120), li, footerAt(500));
    expect(li.style.getPropertyValue('--art-max-h')).toBe('88px');
    expect(scroll).toHaveBeenLastCalledWith({ top: 16, behavior: 'auto' });
    // A heading row above the viewport is brought back first.
    scroll.mockClear();
    revealOnOpen(headAt(-30, 70), panel(80, 200, 100), footerAt(500));
    expect(scroll).toHaveBeenNthCalledWith(1, { top: -30, behavior: 'auto' });
  });

  it('shrinkArt never goes under 88 px and does nothing when it would not make the panel shorter; liftArtCap undoes it', () => {
    const li = panel(0, 200, 100);
    shrinkArt(li, 50);
    expect(li.style.getPropertyValue('--art-max-h')).toBe('148px');
    expect('artCapped' in li.dataset).toBe(true);
    liftArtCap(li);
    expect(li.style.getPropertyValue('--art-max-h')).toBe('');
    expect('artCapped' in li.dataset).toBe(false);
    shrinkArt(li, 500);
    expect(li.style.getPropertyValue('--art-max-h')).toBe('88px');
    // Side by side (a caption taller than the picture): a smaller picture leaves the panel as tall, so no cap.
    const side = panel(0, 200, 300);
    side.getBoundingClientRect = () => box(0, 300);
    shrinkArt(side, 50);
    expect(side.style.getPropertyValue('--art-max-h')).toBe('');
  });

  it('the player lifts the cap from a panel once the next one is revealed, and from every panel on a width change or rotation, then reveals the newest again', () => {
    vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    // Every panel is taller than the room (footer at 300): each newest panel gets a cap.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.querySelector?.('[data-scene="next"]')) return box(300, 360);
      if (this.tagName === 'LI') {
        const capped = parseInt((this as HTMLElement).style.getPropertyValue('--art-max-h'), 10);
        return box(0, (capped || 200) + 200);
      }
      if (this.getAttribute?.('role') === 'img') {
        const li = this.closest('li') as HTMLElement | null;
        return box(0, parseInt(li?.style.getPropertyValue('--art-max-h') ?? '', 10) || 200);
      }
      return box(0, 0);
    });
    const { container } = render(<ScenePlayer scene={arrival()} heading="Berlin · Arrival" chapterName="Berlin" onDone={() => undefined} />);
    const capped = () => [...container.querySelectorAll<HTMLElement>('li[data-panel]')].map((li) => li.style.getPropertyValue('--art-max-h') !== '');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(capped()).toEqual([false, true]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(capped()).toEqual([false, false, true]);
    // A height-only resize (the address bar collapsing) keeps the caps.
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(capped()).toEqual([false, false, true]);
    // A width change lifts every cap at once; the newest panel is then revealed again for the new
    // viewport (here still too tall, so capped again) on the next frame.
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(window.innerWidth + 100);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(capped()).toEqual([false, false, false]);
    const frame = raf.mock.calls.at(-1)?.[0];
    act(() => frame?.(0));
    expect(capped()).toEqual([false, false, true]);
    // A rotation does the same.
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });
    expect(capped()).toEqual([false, false, false]);
  });
});

describe('scene titles [P] and the help list (review T-S3 items 6, 7)', () => {
  const ch = chapterSchema.parse({
    slot: 1,
    city: 'berlin',
    name: 'Berlin',
    status: 'draft',
    patterns: ['smishing-parcel-fee'],
    lo_focus: ['LO-03'],
    scenario_order: { am: ['berlin-01', 'berlin-02'], pm: ['berlin-03'] },
    intro: 'Test chapter.',
    scenes: {
      arrival: 'berlin-arrival',
      turn: 'berlin-turn',
      resolution: 'berlin-resolution',
      placed: [
        { scene: 'berlin-beat-b', after: 'berlin-03' },
        { scene: 'berlin-beat-a', after: 'berlin-01' },
      ],
    },
  });
  const sc = (id: string, slot: Scene['slot'], title?: string) => ({ id, slot, ...(title ? { title } : {}) });
  it('Arrival, Later, Before you go; placed beats "Story" or "Story 1/2" in play order; interludes "Between cities"; a title overrides', () => {
    expect(sceneHeading(sc('berlin-arrival', 'arrival'), ch)).toBe('Berlin · Arrival');
    expect(sceneHeading(sc('berlin-turn', 'turn'), ch)).toBe('Berlin · Later');
    expect(sceneHeading(sc('berlin-resolution', 'resolution'), ch)).toBe('Berlin · Before you go');
    expect(scenePart(sc('berlin-beat-a', 'beat'), ch)).toBe('Story 1');
    expect(scenePart(sc('berlin-beat-b', 'beat'), ch)).toBe('Story 2');
    const one = chapterSchema.parse({ ...ch, scenes: { ...ch.scenes, placed: [{ scene: 'berlin-beat-a', after: 'berlin-01' }] } });
    expect(sceneHeading(sc('berlin-beat-a', 'beat'), one)).toBe('Berlin · Story');
    expect(sceneHeading(sc('interlude-cafe', 'interlude'), null)).toBe('Between cities');
    expect(scenePart(sc('interlude-cafe', 'interlude'), null)).toBeNull();
    expect(sceneHeading(sc('berlin-resolution', 'resolution', 'Open Evening'), ch)).toBe('Berlin · Open Evening');
    expect(sceneHeading(sc('interlude-cafe', 'interlude', 'Teo\'s café'), null)).toBe("Teo's café");
  });
  it('the generic help list (fallback) on a sensitive scene puts "talk to someone" first [P]', () => {
    const items = (sensitive: boolean) => {
      const { container } = render(<GenericHelpList sensitive={sensitive} />);
      const out = [...container.querySelectorAll('li')].map((li) => li.textContent ?? '');
      cleanup();
      return out;
    };
    const plain = items(false);
    const sensitive = items(true);
    expect(sensitive[0]).toBe(plain.at(-1));
    expect([...sensitive].sort()).toEqual([...plain].sort());
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
    expect(within(card).getByRole('img', { name: 'Postcard front: the Berlin courtyard.' })).toBeTruthy();
    // [P] Item 12: the postcard sits right under the h1, before the stamp and the score.
    const order = [...container.querySelectorAll('h1, [data-chapter-postcard], [data-stamp]')].map((el) => el.tagName === 'H1' ? 'h1' : el.hasAttribute('data-stamp') ? 'stamp' : 'postcard');
    expect(order).toEqual(['h1', 'postcard', 'stamp']);
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

  /** CR-27: the chapter intro (h1 = chapter name, the intro, Start) on every fresh chapter start. */
  const passIntro = async (name = 'Berlin') => {
    const h = await screen.findByRole('heading', { level: 1, name });
    const intro = h.closest('[data-chapter-intro]') as HTMLElement | null;
    expect(intro).not.toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(h));
    fireEvent.click(within(intro as HTMLElement).getByRole('button', { name: 'Start' }));
  };

  it('arrival → scenario → placed beat → resolution → chapter end with the postcard; scenes are saved as seen', async () => {
    const mem = memory();
    render(<App chapters={[chapter]} load={async () => ex} sceneRefs={refs} store={createStore(mem)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await screen.findByText('Panel 1 of 3');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Berlin · Arrival');
    await finishScene();
    // CR-27: the intro comes after the Arrival scene and before the first scenario.
    expect(await screen.findByText(chapter.intro)).toBeTruthy();
    await passIntro();
    fireEvent.click(await screen.findByRole('button', { name: /Calm preset/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText(/Berlin · Later/);
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
    expect(await screen.findByRole('button', { name: 'Watch: Arrival' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Watch: Before you go' }));
    await screen.findByText(/Berlin · Before you go/);
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByRole('heading', { name: 'Story scenes: Berlin' });
    // Item 16: focus returns to the "Watch:" button of the scene just replayed, then to "Story scenes: Berlin".
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Watch: Before you go'));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the chapters' }));
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Story scenes: Berlin'));
    // Item 23: the Atlas is on the chapter list too; its Back returns focus to that button.
    fireEvent.click(screen.getByRole('button', { name: 'Waymarker Atlas' }));
    await screen.findByRole('heading', { level: 1, name: 'Waymarker Atlas' });
    fireEvent.click(await screen.findByRole('button', { name: /^Back/ }));
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Waymarker Atlas'));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Waymarker Atlas' }));
    await screen.findByRole('heading', { level: 1, name: 'Waymarker Atlas' });
    fireEvent.click(await screen.findByRole('button', { name: /^Back/ }));
    await waitFor(() => expect(document.activeElement?.getAttribute('data-title-button')).toBe('atlas'));
  });
  it('[P] the content note gates only the first sensitive scene of a run, and of a replay session (item 13, CR-28)', async () => {
    const noted = chapterSchema.parse({ ...chapter, content_note: 'This chapter includes a family-emergency story. Everyone ends up safe.' });
    const sensitive: SceneRef[] = refs.map((r) => ({ ...r, load: async () => ({ ...(await r.load()), sensitive: true }) }));
    render(<App chapters={[noted]} load={async () => ex} sceneRefs={sensitive} store={createStore(memory())} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await screen.findByRole('heading', { level: 1, name: 'Before this story scene' });
    fireEvent.click(screen.getByRole('button', { name: 'Show the scene' }));
    await finishScene();
    await passIntro();
    fireEvent.click(await screen.findByRole('button', { name: /Calm preset/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    // The placed beat: no second gate, but the help link still reads "Need to talk?".
    await screen.findByText(/Berlin · Later/);
    expect(screen.queryByRole('heading', { name: 'Before this story scene' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Need to talk? Where to get help' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByText(/Berlin · Before you go/);
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Back to the chapters' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Story scenes: Berlin' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Watch: Later' }));
    // CR-28: a replay session shows the note once, on its first sensitive scene…
    await screen.findByRole('heading', { level: 1, name: 'Before this story scene' });
    fireEvent.click(screen.getByRole('button', { name: 'Show the scene' }));
    await screen.findByText(/Berlin · Later/);
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Watch: Before you go' }));
    await screen.findByText(/Berlin · Before you go/);
    expect(screen.queryByRole('heading', { name: 'Before this story scene' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Need to talk? Where to get help' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    // …and leaving the replay list ends the session: the next one shows it again.
    fireEvent.click(await screen.findByRole('button', { name: 'Back to the chapters' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Story scenes: Berlin' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Watch: Arrival' }));
    await screen.findByRole('heading', { level: 1, name: 'Before this story scene' });
  });
  it('a tampered run (restarted by beginChapter) still plays the arrival (item 18)', async () => {
    const s = freshSave();
    s.chapters.berlin = { finished: false, bestStamp: null, bestRating: 0, position: 0, run: { index: 1, records: [], flags: [] } };
    const mem = memory();
    mem.data.set(SAVE_KEY, JSON.stringify(s));
    render(<App chapters={[chapter]} load={async () => ex} sceneRefs={refs} store={createStore(mem)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));
    fireEvent.click(await screen.findByRole('button', { name: /Berlin/ }));
    await screen.findByText(/Berlin · Arrival/);
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
    await passIntro();
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
    await passIntro('Madrid');
    fireEvent.click(await screen.findByRole('button', { name: /Calm preset/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Back to the chapters' }));
    await screen.findByRole('heading', { level: 1, name: /Between cities/ });
    // No postcard is two chapters old yet, so the flip panel is left out.
    expect(screen.getByText('Panel 1 of 2')).toBeTruthy();
    expect(screen.getByText(/2 cities so far, the last one Madrid\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Skip story' }));
    await screen.findByRole('heading', { level: 1, name: 'Chapters' });
    const saved = JSON.parse(mem.data.get(SAVE_KEY) ?? '{}') as { story: { seen: string[] } };
    expect(saved.story.seen).toContain('interlude-cafe');
  });
  it('two sensitive interludes in one session each show their own content note (per-interlude gate)', async () => {
    const middle = (city: string, slot: number) => chapterSchema.parse({ ...chapter, city, name: city[0]?.toUpperCase() + city.slice(1), slot, scenes: undefined });
    const chapters = [middle('rome', 6), middle('madrid', 4)];
    const s = freshSave();
    s.chapters.rome = { finished: true, bestStamp: 'bronze', bestRating: 0, position: 0, run: null };
    s.chapters.madrid = { finished: false, bestStamp: null, bestRating: 0, position: 1, run: { index: 0, records: [], flags: [] } };
    s.story.postcards = ['rome'];
    const mem = memory();
    mem.data.set(SAVE_KEY, JSON.stringify(s));
    const sensitive = (id: string, note: string): SceneRef => ({ folder: 'interludes', id, load: async () => ({ ...fixtureScene('interludes', 'interlude-cafe'), id, sensitive: true, content_note: note }) });
    const refs = [sensitive('interlude-one', 'Note for the first interlude.'), sensitive('interlude-two', 'Note for the second interlude.')];
    render(<App chapters={chapters} load={async () => ({ ...ex, id: 'home-00-example' })} sceneRefs={refs} store={createStore(mem)} />);
    const playThrough = async (city: string) => {
      await passIntro(city);
      const first = await screen.findByRole('button', { name: /Calm preset|Open the Trundle app yourself/ });
      const wasTiming = /Calm preset/.test(first.textContent ?? '');
      fireEvent.click(first);
      if (wasTiming) fireEvent.click(await screen.findByRole('button', { name: /Open the Trundle app yourself/ }));
      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      await screen.findByRole('heading', { level: 1, name: /This was a scam/ });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Back to the chapters' }));
    };
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await playThrough('Madrid');
    await screen.findByRole('heading', { level: 1, name: 'Before this story scene' });
    expect(screen.getByText('Note for the first interlude.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Skip this scene' }));
    await screen.findByRole('heading', { level: 1, name: 'Chapters' });
    // Play Rome again: on the way back the second interlude is due, and its note is shown too.
    const rome = (await screen.findAllByRole('button', { name: /Rome/ }))[0] as HTMLElement;
    fireEvent.click(rome);
    await playThrough('Rome');
    await screen.findByRole('heading', { level: 1, name: 'Before this story scene' });
    expect(screen.getByText('Note for the second interlude.')).toBeTruthy();
  });
});
