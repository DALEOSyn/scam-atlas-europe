// @vitest-environment jsdom
/** UI items from the Amsterdam QA round: h (boss lesson on the stamp screen), i, m, n. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/preact';
import type { CheckableView } from '../../src/engine/runner.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { CheckContext, Checkable } from '../../src/ui/check/Check.tsx';
import { ChapterDone } from '../../src/ui/ChapterDone.tsx';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { Segments } from '../../src/ui/devices/parts.tsx';
import { rawGenuine, scenario } from '../content/fixtures.ts';
import { act, ctx, play } from './engine/helpers.ts';

afterEach(cleanup);
const none = { pressureAny: false, pressureGenuine: false };

describe('h. [P] the stamp screen carries the boss tell and what works', () => {
  it('shows both under the postcard, before the stamp', () => {
    const summary = { points: 0, max: 0, rating: 0, spotted: 0, spottedShown: 0, correctShown: 0, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleChecks: 0, offFocusDoubleChecks: 0, stamp: 'bronze' as const, nextTier: null };
    const { container } = render(<ChapterDone summary={summary} city="Amsterdam" boss={{ tell: 'The new number asked for money.', whatWorks: 'Call the number you already have.' }} onBack={() => undefined} />);
    const sec = container.querySelector('[data-chapter-boss]') as HTMLElement;
    expect(within(sec).getByRole('heading', { level: 2 }).textContent).toBe('What to remember');
    expect(sec.textContent).toContain('The new number asked for money.');
    expect(sec.textContent).toContain('What works: Call the number you already have.');
    const order = [...container.querySelectorAll('[data-chapter-boss], [data-stamp]')].map((el) => (el.hasAttribute('data-stamp') ? 'stamp' : 'boss'));
    expect(order).toEqual(['boss', 'stamp']);
  });
});

describe('i. genuine message won by acting on it', () => {
  it('"Acting on it was right here." instead of "That is the habit that works."', () => {
    const s = scenario(rawGenuine());
    const { st, r } = play(s, ctx(), [act('go_pick_up')]);
    const d = debriefOf(s, st, r, none);
    expect(d.layer1.stars).toBe(3);
    render(<DebriefView data={d} onContinue={() => undefined} onAgain={() => undefined} />);
    expect(screen.getByText('Acting on it was right here.')).toBeTruthy();
    expect(screen.queryByText('That is the habit that works.')).toBeNull();
  });
});

describe('m. punctuation stays with the highlighted text', () => {
  it('the full stop after a checkable sits in one no-wrap span with it', () => {
    const { container } = render(<Segments segs={[{ kind: 'text', text: 'Hi. ' }, { kind: 'check', target: 'request', text: 'Top up the deposit today' }, { kind: 'text', text: '. Save it for later.' }]} />);
    const keep = container.querySelector('[data-keep-punct]') as HTMLElement;
    expect(keep.textContent).toBe('Top up the deposit today.');
    expect(container.textContent).toBe('Hi. Top up the deposit today. Save it for later.');
    cleanup();
    const plain = render(<Segments segs={[{ kind: 'check', target: 'request', text: 'Vacature' }, { kind: 'text', text: ' open' }]} />);
    expect(plain.container.querySelector('[data-keep-punct]')).toBeNull();
  });
});

describe('n. accessible name of a checked element', () => {
  it('no space before the comma: "…forget!, checked"', () => {
    const item = { target: 'request', beatId: 'start', device: 'sms', checked: true, tagged: false } as unknown as CheckableView;
    const api = { items: new Map([['request', item]]), checkMode: false, visible: () => '', open: () => undefined, hint: () => undefined };
    render(
      <CheckContext.Provider value={api}>
        <Checkable target="request">Pay today, don't forget!</Checkable>
      </CheckContext.Provider>,
    );
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe("Pay today, don't forget!, checked");
  });
});
