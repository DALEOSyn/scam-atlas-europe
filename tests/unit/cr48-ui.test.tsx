// @vitest-environment jsdom
/** CR-48 (R24): the gold fall hints on the stamp screen, in the "To reach gold next time:" format; never a count of falls. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/preact';
import type { ChapterSummary } from '../../src/engine/chapter.ts';
import { ChapterDone } from '../../src/ui/ChapterDone.tsx';

afterEach(cleanup);

const RECOVERY = 'after a slip, pick only steps that help, starting with one that stops the damage';
const FALLS = 'keep it to one slip or none (you already stop the damage well)';
const summary = (needs: NonNullable<ChapterSummary['nextTier']>['needs']): ChapterSummary => ({
  points: 157,
  max: 172,
  rating: 91.3,
  spotted: 10,
  spottedShown: 10,
  correctShown: 10,
  correctTags: 10,
  wrongTags: 0,
  redFlags: 12,
  genuineReported: 0,
  doubleChecks: 0,
  offFocusDoubleChecks: 0,
  stamp: 'silver',
  nextTier: { tier: 'gold', needs, spottedNeeded: 8 },
});
const hints = (c: Element) => [...c.querySelectorAll('li')].map((li) => li.textContent);

describe('CR-48: gold fall hints', () => {
  it('an unrecovered fall: "To reach gold next time:" + the recovery line, word for word', () => {
    const { container } = render(<ChapterDone summary={summary(['falls_recovery'])} city="Berlin" onBack={() => undefined} />);
    expect(container.textContent).toContain('To reach gold next time:');
    expect(hints(container)).toEqual([RECOVERY]);
  });

  it('two recovered falls: the falls line, word for word', () => {
    const { container } = render(<ChapterDone summary={summary(['falls'])} city="Berlin" onBack={() => undefined} />);
    expect(hints(container)).toEqual([FALLS]);
  });

  it('with another need, both lines show; the hint never carries a number of falls', () => {
    const { container } = render(<ChapterDone summary={summary(['offfocus', 'falls_recovery'])} city="Berlin" onBack={() => undefined} />);
    expect(hints(container)).toEqual(["keep checking when it matters, and notice when a harmless message isn't like this chapter's scams: that one needs no extra check", RECOVERY]);
    expect(container.textContent).not.toMatch(/\bfalls?\b|\d+\s+slips?/i);
  });
});
