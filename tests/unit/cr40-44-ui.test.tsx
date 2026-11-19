// @vitest-environment jsdom
/**
 * CR-40 … CR-44 on screen: the forwarded card, the advice line, damage control for someone off-cast, the browser
 * warning overlay, the reveal card and red-flag timeline, the Open Evening postcard pick and the end screen.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { join } from 'node:path';
import { readYaml } from '../../scripts/lib/content.ts';
import { balance } from '../../src/content/balance.ts';
import { sceneSchema, scenarioSchema, timelineTextIssues, type Message } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { startScenario, step } from '../../src/engine/runner.ts';
import { lookup, t } from '../../src/i18n/index.ts';
import { ArcReveal } from '../../src/ui/ArcReveal.tsx';
import { RedFlagTimeline, RevealCard, TIMELINE_CHOICE_KEYS } from '../../src/ui/ArcFinale.tsx';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { DeviceView } from '../../src/ui/devices/Device.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { EndScreen, earnedCards } from '../../src/ui/EndScreen.tsx';
import { DamageControl, ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { ScenePlayer } from '../../src/ui/ScenePlayer.tsx';
import { ROOT } from '../content/fixtures.ts';

beforeEach(() => {
  document.documentElement.dataset.motion = 'reduced';
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

const fixture = (file: string) => scenarioSchema.parse(readYaml(join(ROOT, 'tests', 'fixtures', 'scenarios', file)));
const finaleScene = (id: string) => sceneSchema.parse(readYaml(join(ROOT, 'tests', 'fixtures', 'finale', 'scenes', `${id}.yaml`)));
const CTX = { balance, slot: 4, settings: { timerMode: 'off' as const, pushers: true }, stress: 10 };

function props(device: DeviceProps['device'], message: Message, over: Partial<DeviceProps> = {}): DeviceProps {
  return {
    beatId: 'start',
    device,
    message,
    banner: null,
    scenario: { brands: [], role: 'standard' },
    thread: [],
    pushers: [],
    actions: [],
    canAct: true,
    onAct: () => undefined,
    onTranslation: () => undefined,
    alwaysTranslate: false,
    call: null,
    onAnswer: () => undefined,
    onDecline: null,
    onNextLine: () => undefined,
    coachMarks: ['payee_check'],
    onCoachMark: () => undefined,
    heading: 'Heading',
    headingRef: { current: null },
    ...over,
  };
}

describe('CR-40: the forwarded card and the advice line', () => {
  const s = fixture('cr40-advice.yaml');
  it('the forwarder\'s bubble is plain text; the forwarded card carries the checkables', () => {
    const { container } = render(<DeviceView {...props('messenger', s.message)} />);
    const card = container.querySelector('[data-forwarded]') as HTMLElement;
    expect(card.textContent).toContain('Forwarded from Swaploft');
    expect(card.textContent).toContain('Quick Cash Crew');
    expect(card.querySelector('blockquote')?.textContent).toContain('Send me your banking-app login and card details.');
    // The bubble's own words are outside the card, and the chat header's name is not a check button.
    expect(container.textContent).toContain('Can I ask you now?');
    expect(container.querySelector('.chatHead button, [class*="chatHead"] button')).toBeNull();
  });
  it('the debrief adds the authored line after the advice, under "You chose"; no "This could happen to anyone."', () => {
    const st0 = startScenario(s, CTX);
    const st = step(s, CTX, step(s, CTX, st0, { type: 'act', actionId: 'probably_fine' }), { type: 'continue' });
    const d = debriefOf(s, st, resultOf(s, balance, st), { pressureAny: true, pressureGenuine: true });
    const { container } = render(<DebriefView data={d} onContinue={() => undefined} onAgain={() => undefined} />);
    expect(container.querySelector('[data-advice-line]')?.textContent).toBe('Noor asked, and that was the smart bit. With an offer like this, the answer is always no.');
    expect(container.textContent).toContain('You chose: A few transfers? Probably fine.');
    expect(container.textContent).not.toContain(t('debrief_no_shame'));
  });
});

describe('CR-41: damage control for Noor\'s friend', () => {
  it('the prompt names the friend; harmful-step feedback is in Noor\'s voice', () => {
    const view = {
      options: [
        { step: 'tell_trusted_adult', category: 'stop' as const },
        { step: 'call_bank_stop_payment', category: 'stop' as const },
        { step: 'keep_quiet', category: 'harmful' as const, feedback: 'She wants it to go away. But getting help early is the right move.' },
      ],
      pick: 3,
      forCast: 'noor',
      forLabel: "Noor's friend",
    };
    const { container } = render(<DamageControl view={view} onDone={() => undefined} />);
    expect(container.querySelector('[data-damage-prompt]')?.textContent).toBe("Pick the step Noor's friend should take first, then 2 more.");
    for (const st of ['keep_quiet', 'tell_trusted_adult', 'call_bank_stop_payment']) fireEvent.click(container.querySelector(`[data-step="${st}"]`) as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: t('damage_done') }));
    expect(container.querySelector('[data-voice]')?.textContent).toBe('Noor: She wants it to go away. But getting help early is the right move.');
  });
});

describe('CR-42: the browser warning overlay', () => {
  const s = fixture('cr42-browser-overlay.yaml');
  it('draws the warning over the page in the training frame, with its checkables and a Close', () => {
    const acts = s.actions.map((a) => ({ id: a.id, label: a.label, kind: a.kind, styled: false }));
    const onAct = vi.fn();
    const { container } = render(<DeviceView {...props('browser', s.message, { actions: acts, onAct })} />);
    const overlay = container.querySelector('[data-page-overlay]') as HTMLElement;
    expect(overlay.getAttribute('aria-labelledby')).toBe('page-overlay-h');
    expect(overlay.querySelector('h3')?.textContent).toBe('Security alert');
    expect(overlay.textContent).toMatch(/simulation/i);
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
    // The page's own text is backdrop, hidden from the accessibility tree and never checkable.
    expect([...container.querySelectorAll('[aria-hidden="true"]')].some((e) => e.textContent?.includes('festival of street music'))).toBe(true);
    fireEvent.click(overlay.querySelector('[data-overlay-close]') as HTMLElement);
    expect(onAct).toHaveBeenCalledWith('close_it');
  });
  it('in a scenario, Close ends the beat as the dismiss action', () => {
    const { container } = render(<ScenarioView scenario={s} ctx={CTX} onDone={() => undefined} />);
    fireEvent.click(container.querySelector('[data-overlay-close]') as HTMLElement);
    expect(container.querySelector('#consequence-h')).not.toBeNull();
    expect(container.textContent).toContain('The page closes. Nothing else happens.');
  });
});

describe('CR-43: the reveal card and the red-flag timeline', () => {
  it('one picture, three names, under "The same picture Alex used." with a text alternative', () => {
    const { container } = render(<RevealCard names={['Alex', 'Robin', 'Sacha']} />);
    expect(container.querySelector('h3')?.textContent).toBe('The same picture Alex used.');
    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('The same picture on three profiles with different names.');
    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(new Set([...container.querySelectorAll('img')].map((i) => i.getAttribute('src')))).toEqual(new Set(['/art/cast/alex.svg']));
    expect(container.textContent).toContain('Names on the three profiles: Alex, Robin, Sacha.');
  });
  it('the timeline: header, tells and fixed choice wording; no amount, no count, no blame words', () => {
    const rows = [
      { slot: 1, tell: 'Nothing to notice yet.', choice: 'went_along' as const },
      { slot: 5, tell: 'An unknown platform.', choice: 'paid' as const },
      { slot: 6, tell: 'Too-good returns.', choice: 'asked' as const },
    ];
    const { container } = render(<RedFlagTimeline rows={rows} />);
    expect(container.querySelector('[data-timeline-header]')?.textContent).toBe("Every step below was Alex's plan, not your fault.");
    const items = [...container.querySelectorAll('li')].map((li) => li.textContent ?? '');
    expect(items[0]).toContain('Alex pushed, and you went along.');
    expect(items[1]).toContain('Alex asked for money, and you sent some.');
    expect(items[2]).toContain('You asked someone.');
  });
  it('every timeline template passes the timeline rule (validator, CR-43(c))', () => {
    for (const key of [...Object.values(TIMELINE_CHOICE_KEYS), 'timeline_header', 'reveal_caption', 'reveal_alt']) {
      const text = lookup(key);
      expect(text, key).toBeDefined();
      expect(timelineTextIssues((text ?? '').replace('{name}', 'Alex')), key).toEqual([]);
    }
  });
  it('"Tell me now" reuses the reveal card and the timeline wording', () => {
    const { container } = render(<ArcReveal timeline={[{ slot: 1, tell: 'Nothing to notice yet.', choice: 'stepped_back' }]} names={['Alex', 'Robin', 'Sacha']} onContinue={() => undefined} />);
    expect(container.querySelector('[data-reveal-card]')).not.toBeNull();
    expect(container.textContent).toContain('You stepped back from it.');
  });
});

describe('CR-44(a): the Open Evening postcard pick', () => {
  it('the player picks a postcard from a list of cities; Teo reads its cue; the pick is recorded as the flip', () => {
    const onFlip = vi.fn();
    const choices = [
      { city: 'berlin', cityName: 'Berlin', ifThen: { cue: 'If a parcel message wants money,', action: 'then I open the app myself.' } },
      { city: 'paris', cityName: 'Paris', ifThen: { cue: 'If bank details change by email,', action: 'then I call a number I know.' } },
    ];
    const { container } = render(<ScenePlayer scene={finaleScene('fx-finale-evening')} heading="Finale" flipChoices={choices} onFlip={onFlip} onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: t('scene_next') }));
    const pick = container.querySelector('[data-postcard-pick]') as HTMLElement;
    expect(pick.textContent).toContain('Pick a postcard for Teo to read.');
    expect([...pick.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['Berlin', 'Paris']);
    expect(onFlip).not.toHaveBeenCalled();
    fireEvent.click(pick.querySelector('[data-postcard="paris"]') as HTMLElement);
    expect(onFlip).toHaveBeenCalledWith('paris');
    expect(container.textContent).toContain('You picked Paris.');
    expect(container.querySelector('[data-flip-card]')?.textContent).toContain('If bank details change by email…');
  });
});

describe('CR-44(b): the end screen "Your Atlas"', () => {
  const habits = { 'LO-18': { scenarios: ['a', 'b'], hard: true }, 'LO-03': { scenarios: ['a'], hard: false } };
  const pages = [{ city: 'berlin', name: 'Berlin', ifThen: { cue: 'If a parcel message wants money,', action: 'then I open the app myself.' }, cards: [] }];
  it('opens with the epigraph, lists If-then lines, earned cards with a gold mark on mastered ones, and help', () => {
    const { container } = render(<EndScreen epigraph={{ speaker: 'adaeze', line: 'Pause. Ask someone.' }} pages={pages} habits={habits} onBack={() => undefined} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Your Atlas' })).toBe(document.activeElement);
    const epi = container.querySelector('[data-epigraph]') as HTMLElement;
    expect(epi.querySelector('blockquote')?.textContent).toBe('Pause. Ask someone.');
    expect(epi.querySelector('figcaption')?.textContent).toBe('Adaeze');
    expect(container.querySelector('[data-atlas-page="berlin"]')).not.toBeNull();
    const cards = earnedCards(habits);
    expect(cards.find((c) => c.gold)?.id).toBe('ask-someone');
    expect(container.querySelectorAll('[data-gold-mark]')).toHaveLength(cards.filter((c) => c.gold).length);
    expect(container.querySelector('[data-end-card="open-it-yourself"] [data-gold-mark]')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: t('help_title') })).not.toBeNull();
    // No ranking, totals, amounts or counts anywhere on it.
    expect(container.textContent ?? '').not.toMatch(/\d|€|%|rank|total|streak/i);
  });
  it('Print uses the browser\'s own print', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<EndScreen epigraph={null} pages={[]} habits={{}} onBack={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print your Atlas' }));
    expect(print).toHaveBeenCalled();
  });
});
