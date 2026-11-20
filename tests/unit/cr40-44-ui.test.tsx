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
import { sceneSchema, scenarioSchema, timelineTextIssues, type Message, type Scenario } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { startScenario, step, type CheckableView } from '../../src/engine/runner.ts';
import { lookup, t } from '../../src/i18n/index.ts';
import { ArcReveal } from '../../src/ui/ArcReveal.tsx';
import { RedFlagTimeline, RevealCard, RevealScreen, TIMELINE_CHOICE_KEYS, TimelineScreen } from '../../src/ui/ArcFinale.tsx';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { CheckContext, type CheckApi } from '../../src/ui/check/Check.tsx';
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
    const line = container.querySelector('[data-advice-line]') as HTMLElement;
    expect(line.textContent).toBe('Noor asked, and that was the smart bit. With an offer like this, the answer is always no.');
    // R22: below the stars, not above them.
    const stars = container.querySelector('[role="img"][aria-label*="of 3"]') as HTMLElement;
    expect(stars.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.textContent).toContain('You chose: A few transfers? Probably fine.');
    expect(container.textContent).not.toContain(t('debrief_no_shame'));
  });
});

describe('CR-40/41 (QA B1, Brussels 10-4): a forwarded checkable is drawn once, inside the card', () => {
  const s = fixture('cr40-advice.yaml');
  const targets = (root: ParentNode) => [...root.querySelectorAll('[data-check]')].map((b) => b.getAttribute('data-check') ?? '');
  /** Every checkable the device may draw is live (as on the beat on screen), so each renders as a button. */
  const live = ['sender.detail', 'forwarded.sender', 'reference', 'reference#2', 'request', 'claim', 'claim#2', 'phone_number'];
  const api: CheckApi = {
    items: new Map(live.map((target) => [target, { target, beatId: 'start', device: 'messenger', checked: false, tagged: false } as unknown as CheckableView])),
    checkMode: false,
    visible: () => '',
    open: () => undefined,
    hint: () => undefined,
  };
  const draw = (m: Message) =>
    render(
      <CheckContext.Provider value={api}>
        <DeviceView {...props('messenger', m)} />
      </CheckContext.Provider>,
    );
  const brussels = (file: string) => scenarioSchema.parse(readYaml(join(ROOT, 'content', 'scenarios', 'brussels', file)));
  const cases: [string, () => Scenario][] = [
    ['fixture fx-cr40-advice', () => s],
    ['Brussels 10-4 (brussels-04-noor-easy-money)', () => brussels('brussels-04-noor-easy-money.yaml')],
    ['Brussels arc Teo (brussels-arc-teo)', () => brussels('brussels-arc-teo.yaml')],
  ];
  for (const [name, load] of cases) {
    it(`${name}: every data-check target appears exactly once, and none is drawn outside the forwarded card`, () => {
      const sc = load();
      expect(sc.message.forwarded).toBeDefined();
      const { container } = render(<ScenarioView scenario={sc} ctx={CTX} onDone={() => undefined} />);
      const card = container.querySelector('[data-forwarded]') as HTMLElement;
      expect(card).not.toBeNull();
      const all = targets(container);
      expect(all).toContain('forwarded.sender');
      if (sc.message.references?.length) expect(all).toContain('reference');
      expect(new Set(all).size, `duplicated targets: ${all.join(', ')}`).toBe(all.length);
      // CR-40: the forwarder's own bubble is never checkable, so every checkable sits inside the card.
      for (const b of container.querySelectorAll('[data-check]')) {
        expect(card.contains(b), `${b.getAttribute('data-check') ?? ''} is drawn outside the forwarded card`).toBe(true);
      }
    });
  }
  it('a reference that is not quoted in forwarded.body is still drawn once, as a chip inside the card', () => {
    const { container } = draw({ ...s.message, references: ['Ref QC-2291'] });
    const card = container.querySelector('[data-forwarded]') as HTMLElement;
    expect(container.querySelectorAll('[data-check="reference"]')).toHaveLength(1);
    expect(card.querySelectorAll('[data-check="reference"]')).toHaveLength(1);
  });
  it('a messenger beat without a forwarded card still shows its leftover reference once, in the bubble', () => {
    const { container } = draw({ ...s.message, forwarded: undefined, body: 'Hey, a quick one.', ask: undefined, claims: undefined, references: ['Ref QC-2291'] });
    expect(container.querySelector('[data-forwarded]')).toBeNull();
    expect(container.querySelectorAll('[data-check="reference"]')).toHaveLength(1);
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
    expect(container.querySelector('[data-overlay-behind]')?.textContent).toMatch(/^Page behind the warning: .*festival of street music/);
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
    expect(container.querySelector('[data-reveal-line]')?.textContent).toBe('A picture that checks out proves nothing either. Telling someone is what works.');
  });
  it('R22: the reveal step\'s tell and habit are the authored lines it is given; the timeline screen\'s h1 names it, with no points', () => {
    const r = render(<RevealScreen names={['Alex', 'Robin', 'Sacha']} tell="Authored tell." habit="Authored habit." onContinue={() => undefined} />);
    expect(r.container.querySelector('[data-reveal-tell]')?.textContent).toBe('Authored tell.');
    expect(r.container.querySelector('[data-reveal-habit]')?.textContent).toBe('Authored habit.');
    cleanup();
    const { container } = render(<TimelineScreen rows={[{ slot: 1, tell: 'Nothing to notice yet.', choice: 'replied' }]} onContinue={() => undefined} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('What you saw so far');
    expect(container.querySelectorAll('h2')).toHaveLength(0);
    expect(container.textContent).toContain('You replied. Nothing wrong with that.');
    expect(container.textContent).not.toMatch(/points|banked/i);
  });
  it('psych M3/M4: the arc damage control opens with the intro line; the authored note shows with the feedback', () => {
    const options = [
      { step: 'stop_paying', category: 'stop' as const },
      { step: 'call_bank_known_number', category: 'stop' as const },
      { step: 'keep_evidence', category: 'secure' as const },
      { step: 'pay_last_fee', category: 'harmful' as const },
    ];
    const { container } = render(<DamageControl view={{ options, pick: 3, forCast: null, forLabel: null, note: 'That says nothing about you.' }} intro={t('arc_damage_intro', { name: 'Alex' })} onDone={() => undefined} />);
    const intro = container.querySelector('[data-damage-intro]') as HTMLElement;
    expect(intro.textContent).toBe('Alex was never real. The lie was theirs, not yours.');
    expect(intro.compareDocumentPosition(container.querySelector('[data-step]') as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const st of ['stop_paying', 'call_bank_known_number', 'keep_evidence']) fireEvent.click(container.querySelector(`[data-step="${st}"]`) as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: t('damage_done') }));
    expect(container.querySelector('[data-recovery-note]')?.textContent).toBe('That says nothing about you.');
  });
  it('the stamp hint uses a plural ("1 red flag")', () => {
    expect(t('tier_need_spotted', { n: 1, net: 0 })).toBe('Spot at least 1 red flag. Each mark on a safe detail takes one off. Your count: 0.');
    expect(t('tier_need_spotted', { n: 2, net: 0 })).toContain('Spot at least 2 red flags.');
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
    for (const key of [...Object.values(TIMELINE_CHOICE_KEYS), 'timeline_header', 'reveal_caption', 'reveal_alt', 'reveal_fixed_line', 'arc_damage_intro']) {
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
    expect(document.activeElement, 'QA B3: focus on the pick line').toBe(container.querySelector('[data-postcard-picked]'));
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
    // No ranking, totals, amounts or counts anywhere on it. T-4.2: the help cards hold real phone numbers and
    // "Checked on" dates, so digits are allowed inside [data-help-cards] only; the other words stay banned there too.
    const help = container.querySelector('[data-help-cards]') as HTMLElement;
    expect(help).not.toBeNull();
    const rest = container.cloneNode(true) as HTMLElement;
    rest.querySelector('[data-help-cards]')?.remove();
    expect(rest.textContent ?? '').not.toMatch(/\d|€|%|rank|total|streak/i);
    expect(help.textContent ?? '').not.toMatch(/€|%|rank|total|streak|score|points/i);
  });
  it('Print uses the browser\'s own print', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<EndScreen epigraph={null} pages={[]} habits={{}} onBack={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Print your Atlas' }));
    expect(print).toHaveBeenCalled();
  });
});
