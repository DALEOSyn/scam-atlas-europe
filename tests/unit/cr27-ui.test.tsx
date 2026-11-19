// @vitest-environment jsdom
/** CR-27 (Paris QA playtest) on screen: setup lead-in, lang (WCAG 3.1.2), bank-card timer, name-check target, quote block, bank header. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act as flush, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import type { Message } from '../../src/content/schema.ts';
import { AnnounceContext, AnnouncerProvider, type AnnounceApi } from '../../src/ui/Announcer.tsx';
import { EMPTY_QUEUE, enqueue, nextAnnouncement, splitForeign } from '../../src/ui/announcer.ts';
import { ChapterIntro } from '../../src/ui/ChapterIntro.tsx';
import { DeviceView } from '../../src/ui/devices/Device.tsx';
import { Translate, translationHoldSeconds } from '../../src/ui/devices/parts.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { quotedSplit, segmentMessage } from '../../src/ui/text.ts';
import { rawFraud, scenario } from '../content/fixtures.ts';
import { beatOf, rawTransfer } from './engine/cr-fixtures.ts';
import { ctx, type Raw } from './engine/helpers.ts';
import { useContext } from 'preact/hooks';
import { App } from '../../src/app.tsx';
import { headerBrand } from '../../src/content/brands.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { step } from '../../src/engine/runner.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { act, B, boss, run } from './engine/helpers.ts';
import type { Chapter } from '../../src/content/schema.ts';
import { createStore, freshSave, type StorageLike } from '../../src/engine/save.ts';
import { rawGenuine } from '../content/fixtures.ts';
import { readingHoldSeconds } from '../../src/ui/text.ts';

beforeEach(() => {
  document.documentElement.dataset.motion = 'reduced';
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

function props(device: DeviceProps['device'], message: Message, over: Partial<DeviceProps> = {}): DeviceProps {
  return {
    beatId: 'start',
    device,
    message,
    banner: null,
    scenario: { brands: [], role: 'standard' },
    thread: [],
    pushers: [],
    actions: [{ id: 'reply', label: 'Reply', kind: 'proceed', styled: false }],
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

/** A French email asking to pay, with a translated ask (Paris 3-7 shape). */
function frenchEmail(over: Raw = {}): Raw {
  const raw = rawTransfer('fr1', true, { device: 'email', pressure: { timer: true, levers: ['urgency'] }, ...over });
  raw.message = {
    sender: { display: 'Volet Bleu · Gestion', detail: 'gestion@trundle.example' },
    subject: 'Loyer du mois prochain · nouveau RIB',
    body: 'Bonjour, merci de régler le loyer sur notre nouveau compte avant vendredi. Cordialement.',
    lang: 'fr',
    translation: "Hello, please pay the rent to our new account before Friday. Kind regards.",
    request: 'pay',
    ask: { text: 'merci de régler le loyer sur notre nouveau compte avant vendredi.', translation: 'please pay the rent to our new account before Friday.' },
  };
  raw.inspectables = [
    { target: 'sender.detail', reveal: 'An added hyphen.', red_flag: true },
    { target: 'request', reveal: 'New account, a deadline.', red_flag: true, type: 'request' },
  ];
  return raw;
}

describe('CR-27 item 1: chapter intro and scenario setup', () => {
  it('the intro screen: h1 = chapter title (focused), the intro text, one primary Start button (plus the stamps disclosure)', async () => {
    const onStart = vi.fn();
    render(<ChapterIntro name="Paris" intro={'Paris, the last working day.\n\nPinned by the screen: "Payments at Ruchelune."'} onStart={onStart} />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Paris' });
    await waitFor(() => expect(document.activeElement).toBe(h1));
    expect(screen.getByText('Paris, the last working day.')).toBeTruthy();
    expect(screen.getByText('Pinned by the screen: "Payments at Ruchelune."')).toBeTruthy();
    // One primary action; the only other button is the optional "How stamps work" disclosure (CR-48b).
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Start', 'How stamps work']);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(onStart).toHaveBeenCalledOnce();
  });
  it('setup: a lead-in paragraph above the first beat, read first (focus), gone on the next beat', async () => {
    const s = scenario({ ...rawFraud(), setup: '18:40, the last working day before the long weekend.' });
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} />);
    const p = container.querySelector<HTMLElement>('[data-setup]');
    expect(p?.textContent).toBe('18:40, the last working day before the long weekend.');
    await waitFor(() => expect(document.activeElement).toBe(p));
    const heading = container.querySelector('h2, h3');
    // Reading order = visual order: the lead-in comes before the device.
    expect(p && heading && p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open the link' }));
    await waitFor(() => expect(container.querySelector('[data-setup]')).toBeNull());
  });
  it('setup: the lead-in freezes the timer for its reading time, then the timer runs (psych M3)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] });
    const setup = '18:40, the last working day before the long weekend. Everyone else has already left the office.';
    const s = scenario({ ...rawFraud(), setup, pressure: { timer: true, levers: ['urgency'] } });
    const { container } = render(<ScenarioView scenario={s} ctx={ctx()} onDone={() => undefined} />);
    const timer = () => container.querySelector('[role="timer"]')?.textContent ?? '';
    await flush(() => {
      vi.advanceTimersByTime(300);
    });
    const start = timer();
    expect(start).toMatch(/paused/);
    const hold = readingHoldSeconds(setup);
    expect(hold).toBeGreaterThan(1.5);
    await flush(() => {
      vi.advanceTimersByTime(hold * 1000 - 600);
    });
    expect(timer()).toBe(start);
    for (let i = 0; i < 8; i++) {
      await flush(() => {
        vi.advanceTimersByTime(500);
      });
    }
    expect(timer()).not.toMatch(/paused/);
    expect(timer()).not.toBe(start);
  });
  it('no setup, no lead-in', () => {
    const { container } = render(<ScenarioView scenario={scenario(rawFraud())} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} />);
    expect(container.querySelector('[data-setup]')).toBeNull();
  });
});

describe('CR-27 item 2: French text keeps its lang (WCAG 3.1.2)', () => {
  it('Check card "You see" and the Details rows carry lang; the translation follows, labelled in English', async () => {
    const s = scenario(frenchEmail());
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} />);
    // The inbox list's subject preview.
    const subject = [...container.querySelectorAll('span')].find((x) => x.textContent === 'Loyer du mois prochain · nouveau RIB');
    expect(subject?.getAttribute('lang')).toBe('fr');
    fireEvent.click(screen.getByRole('button', { name: /Details you can check/ }));
    const row = container.querySelector<HTMLElement>('[data-check-row="request"]');
    expect(row?.querySelector('[lang="fr"]')?.textContent).toContain('merci de régler le loyer');
    fireEvent.click(row as HTMLElement);
    await waitFor(() => expect(container.querySelector('[data-check-translation]')).not.toBeNull());
    const tr = container.querySelector<HTMLElement>('[data-check-translation]');
    expect(tr?.getAttribute('lang')).toBe('en');
    expect(tr?.textContent).toBe('please pay the rent to our new account before Friday.');
    expect(tr?.previousElementSibling?.textContent).toBe('Translation');
    const seen = tr?.previousElementSibling?.previousElementSibling;
    expect(seen?.getAttribute('lang')).toBe('fr');
  });
  it('an English message: no lang on "You see", no translation row', async () => {
    const { container } = render(<ScenarioView scenario={scenario(rawTransfer())} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /Details you can check/ }));
    fireEvent.click(container.querySelector<HTMLElement>('[data-check-row="request"]') as HTMLElement);
    await waitFor(() => expect(container.querySelector('[data-check-card], [data-check-row="request"] ~ div, li dl')).not.toBeNull());
    expect(container.querySelector('[data-check-translation]')).toBeNull();
    expect(container.querySelector('dd[lang]')).toBeNull();
  });
  it('pusher announcements speak the foreign part with its lang; a coalesced summary has none', () => {
    let q = enqueue(EMPTY_QUEUE, 5, 'New message: Rappel : il suffit de confirmer.', (n) => `${n} new messages.`, undefined, { text: 'Rappel : il suffit de confirmer.', lang: 'fr' });
    const r = nextAnnouncement(q, 100, 15);
    expect(r.foreign).toEqual({ text: 'Rappel : il suffit de confirmer.', lang: 'fr' });
    expect(splitForeign(r.say ?? '', r.foreign)).toEqual(['New message: ', { text: 'Rappel : il suffit de confirmer.', lang: 'fr' }, '']);
    q = enqueue(EMPTY_QUEUE, 5, 'New message: a', (n) => `${n} new messages.`, undefined, { text: 'a', lang: 'fr' });
    q = enqueue(q, 5, 'New message: b', (n) => `${n} new messages.`, undefined, { text: 'b', lang: 'fr' });
    expect(nextAnnouncement(q, 100, 15)).toMatchObject({ say: '2 new messages.', foreign: undefined });
  });
  it('the polite live region renders the foreign part as <span lang>', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
    let api: AnnounceApi | null = null;
    const Grab = () => {
      api = useContext(AnnounceContext);
      return null;
    };
    render(
      <AnnouncerProvider minInterval={0}>
        <Grab />
      </AnnouncerProvider>,
    );
    await flush(() => {
      (api as unknown as AnnounceApi).polite(5, 'New message: Rappel : il suffit de confirmer.', undefined, undefined, { text: 'Rappel : il suffit de confirmer.', lang: 'fr' });
      vi.advanceTimersByTime(600);
    });
    const region = document.getElementById('announcer-polite');
    expect(region?.textContent).toBe('New message: Rappel : il suffit de confirmer.');
    expect(region?.querySelector('span[lang="fr"]')?.textContent).toBe('Rappel : il suffit de confirmer.');
  });
});

describe('CR-27 item 3: the bank-card timer runs out with "Always show translations"', () => {
  it('Translate: an auto-expanded translation freezes only for its reading time; nothing to translate never freezes', async () => {
    vi.useFakeTimers();
    const onFreeze = vi.fn();
    render(<Translate message={{ lang: 'en' }} onFreeze={onFreeze} alwaysOpen />);
    expect(onFreeze).not.toHaveBeenCalled();
    cleanup();
    const text = 'Reminder: your bank may say the name does not match. That is normal, just confirm.';
    render(<Translate message={{ lang: 'fr', translation: text }} onFreeze={onFreeze} alwaysOpen />);
    expect(onFreeze).toHaveBeenLastCalledWith(true);
    await flush(() => {
      vi.advanceTimersByTime(translationHoldSeconds(text) * 1000 + 10);
    });
    expect(onFreeze).toHaveBeenLastCalledWith(false);
    // The player's own tap still holds the freeze while open.
    onFreeze.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Show original|Hide translation|Translate/ }));
    fireEvent.click(screen.getByRole('button', { name: /Translate/ }));
    expect(onFreeze).toHaveBeenLastCalledWith(true);
    await flush(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onFreeze).toHaveBeenLastCalledWith(true);
  });
  it('a French follow-up on the bank card with "Always show translations": the timer escalates and expires', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance', 'Date'] });
    const raw = rawTransfer('t1', true, { pressure: { timer: true, levers: ['urgency'], pusher: { messages: [{ at_seconds: 5, beat: 'bank', text: 'Rappel : il suffit de confirmer.', lang: 'fr', translation: 'Reminder: just confirm.' }] } } });
    const s = scenario(raw);
    const onDone = vi.fn();
    const { container } = render(<ScenarioView scenario={s} ctx={{ ...ctx(), slot: 3 }} onDone={onDone} alwaysTranslate coachMarks={['payee_check']} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    const timer = () => container.querySelector('[role="timer"]')?.textContent ?? '';
    let escalated = false;
    for (let i = 0; i < 120 && !container.querySelector('#consequence-h'); i++) {
      await flush(() => {
      vi.advanceTimersByTime(1000);
    });
      if (/\+20 s/.test(timer())) escalated = true;
    }
    expect(escalated).toBe(true);
    expect(container.querySelector('#consequence-h')).not.toBeNull();
  });
});

describe('CR-27 item 5: the name-check result is the checkable', () => {
  it('the result paragraph holds the payee.name_check checkable; the payee field is plain; "You see" is the result', async () => {
    const s = scenario(rawTransfer());
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} coachMarks={['payee_check']} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    const btn = await waitFor(() => {
      const el = container.querySelector<HTMLElement>('#name-check-result-bank [data-check="payee.name_check"]');
      if (!el) throw new Error('no result checkable yet');
      return el;
    });
    expect(btn.textContent).toContain("The name doesn't match this account.");
    expect(container.querySelectorAll('[data-check="payee.name_check"]')).toHaveLength(1);
    fireEvent.click(btn);
    const card = await waitFor(() => {
      const el = container.querySelector<HTMLElement>('[data-check-card="payee.name_check"]') ?? document.querySelector<HTMLElement>('[data-check-card="payee.name_check"]');
      if (!el) throw new Error('no card');
      return el;
    });
    expect(within(card).getByRole('heading').textContent).toContain('Name check result');
    expect(card.textContent).toContain("The name doesn't match this account.");
  });
});

describe('CR-27 round 2: the name-check Details row waits for the check', () => {
  it('says "Checking…" until the bank card reports the result, then the result', async () => {
    delete document.documentElement.dataset.motion;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { container } = render(<ScenarioView scenario={scenario(rawTransfer())} ctx={ctx({ timerMode: 'off' })} onDone={() => undefined} coachMarks={['payee_check']} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    await flush(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: /Details you can check/ }));
    const row = () => container.querySelector<HTMLElement>('[data-check-row="payee.name_check"]');
    expect(row()?.textContent).toContain("Checking the name with the payee's bank…");
    expect(row()?.textContent).not.toContain("doesn't match");
    await flush(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(row()?.textContent).toContain("The name doesn't match this account.");
  });
});

describe('CR-27 item 6: a quoted message inside a chat bubble', () => {
  const body = 'Mum got this email. She nearly paid it!\n\nFrom factures@cuivrelin-factures.example: Balance of invoice 2026-088: €640. Questions: cuivrelin-factures.example/contact\n\nWhat would you have spotted?';
  const m: Message = { sender: { display: 'Inès', detail: 'Saved contact' }, body, request: 'reply', references: ['2026-088'], attachments: [{ name: 'RIB_Cuivrelin.pdf (forwarded)' }] };
  it('quotedSplit: the paragraphs holding quoted checkables, from the first to the last', () => {
    const segs = segmentMessage(m).body;
    const split = quotedSplit(body, segs, new Set(['link']));
    expect(split?.before).toEqual([{ kind: 'text', text: 'Mum got this email. She nearly paid it!' }]);
    expect(split?.quote.some((x) => x.kind === 'check' && x.target === 'link')).toBe(true);
    expect(split?.after).toEqual([{ kind: 'text', text: 'What would you have spotted?' }]);
    expect(quotedSplit(body, segs, new Set())).toBeNull();
  });
  it('renders a quote block in the bubble, with the quoted attachment chip inside it', () => {
    const { container } = render(<DeviceView {...props('messenger', m, { quoted: ['link', 'reference', 'attachment'] })} />);
    const quote = container.querySelector<HTMLElement>('blockquote[data-quoted]');
    expect(quote).not.toBeNull();
    expect(quote?.textContent).toContain('Balance of invoice');
    expect(quote?.textContent).not.toContain('Mum got this email');
    // Outside a scenario (no Check context) checkables render as plain spans: find the chip by its text.
    expect(quote?.querySelector('ul')?.textContent).toContain('RIB_Cuivrelin.pdf (forwarded)');
    expect(container.textContent?.split('RIB_Cuivrelin.pdf').length).toBe(2);
  });
  it('without quoted checkables: no quote block; chat attachments are still shown as chips', () => {
    const { container } = render(<DeviceView {...props('messenger', m)} />);
    expect(container.querySelector('blockquote[data-quoted]')).toBeNull();
    expect(container.textContent).toContain('RIB_Cuivrelin.pdf (forwarded)');
  });
});

describe('CR-27: content sets the bank header', () => {
  const pay = (bank?: { brand: string }): Message => ({ payee: { name: 'Morvenac SAS', iban: 'FR00 TEST', name_check: 'match' }, request: 'pay', ...(bank ? { bank } : {}) });
  it('default Larchwick; a sub-brand id shows the sub-brand name; an unknown id falls back', () => {
    const header = (m: Message) => {
      const { container } = render(<DeviceView {...props('banking', m, { beatId: 'bank' })} />);
      const label = container.querySelector('section[aria-label]')?.getAttribute('aria-label') ?? '';
      cleanup();
      return label;
    };
    expect(header(pay())).toContain('Larchwick Bank');
    expect(header(pay({ brand: 'nope' }))).toContain('Larchwick Bank');
  });
  it('headerBrand: a bank sub-brand keeps the bank\'s id (palette) and mark, with its own name', () => {
    // Fixture registry: main ships no bank sub-brand yet (Paris adds larchwick-pro).
    const reg = [{ id: 'larchwick', name: 'Larchwick Bank', mark: 'brands/larchwick.svg', sub_brands: [{ id: 'larchwick-business', name: 'Larchwick Business' }] }];
    expect(headerBrand('larchwick-business', reg)).toEqual({ id: 'larchwick', name: 'Larchwick Business', mark: 'brands/larchwick.svg' });
    expect(headerBrand('larchwick', reg)?.name).toBe('Larchwick Bank');
    expect(headerBrand('nope', reg)).toBeUndefined();
  });
  it('fixtures: a banking beat may set it (schema)', () => {
    const raw = rawTransfer();
    (beatOf(raw, 'bank').message as Raw).bank = { brand: 'larchwick-business' };
    expect(scenario(raw).beats[0]?.message.bank).toEqual({ brand: 'larchwick-business' });
  });
});

describe('CR-27 round 2: chapter rules card, resume and the way back (psych M1, M2)', () => {
  const rules = { title: 'Payments at Ruchelune', items: ['Check the payee name.', 'Call the supplier on the number in the file.'] };
  it('rules render after the intro as a pinned card: section labelled by its h2, an ordered list', async () => {
    const onBack = vi.fn();
    render(<ChapterIntro name="Paris" intro="Paris, the last working day." rules={rules} onStart={() => undefined} onBack={onBack} />);
    const card = screen.getByRole('region', { name: 'Payments at Ruchelune' });
    expect(within(card).getByRole('heading', { level: 2 })).toBeTruthy();
    expect(within(card).getAllByRole('listitem').map((x) => x.textContent)).toEqual(rules.items);
    expect(card.querySelector('ol')).not.toBeNull();
    expect(screen.getByText('Paris, the last working day.').compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back to the chapters' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  function memory(): StorageLike {
    const m = new Map<string, string>();
    return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
  }
  const ch = (city: string, name: string, over: Partial<Chapter> = {}): Chapter => ({
    slot: 1,
    city,
    name,
    status: 'draft',
    patterns: ['smishing-parcel-fee'],
    callbacks: [],
    lo_focus: ['LO-01'],
    scenario_order: { am: ['t1'], pm: ['t2'] },
    intro: 'x',
    ...over,
  });
  const byId = { t1: scenario(rawGenuine('t1')), t2: scenario(rawGenuine('t2')) };
  const seeded = () => {
    const store = createStore(memory());
    store.save({ ...freshSave(), chapters: { home: { finished: true, bestStamp: 'gold', bestRating: 100, position: 0, run: null } } });
    return store;
  };
  async function playMorning(name: string) {
    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));
    fireEvent.click(screen.getByRole('button', { name: `Play ${name}` }));
    await screen.findByRole('heading', { level: 1, name });
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Check in the app first' }));
    await waitFor(() => screen.getByRole('heading', { level: 3, name: 'What happened' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { level: 1, name: /This was genuine/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { level: 1, name: 'Good place to take a break' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the chapters' }));
  }

  it('a resumed run of a chapter with rules shows the intro again, with "Continue"; "Back to the chapters" focuses its button', async () => {
    render(<App store={seeded()} chapters={[ch('home', 'Home', { slot: 0, scenario_order: { am: ['h1'], pm: [] } }), ch('paris', 'Paris', { rules })]} load={async (_c, id) => byId[id as 't1']} />);
    await playMorning('Paris');
    fireEvent.click(await screen.findByRole('button', { name: 'Continue Paris' }));
    const h1 = await screen.findByRole('heading', { level: 1, name: 'Paris' });
    await waitFor(() => expect(document.activeElement).toBe(h1));
    expect(screen.getByRole('region', { name: 'Payments at Ruchelune' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back to the chapters' }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continue Paris' })));
    fireEvent.click(screen.getByRole('button', { name: 'Continue Paris' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('img', { name: /2 of 2/ }));
  });

  it('a resumed run of a chapter without rules goes straight on; a chapter without intro text has no intro', async () => {
    render(<App store={seeded()} chapters={[ch('home', 'Home', { slot: 0, scenario_order: { am: ['h1'], pm: [] } }), ch('testcity', 'Testcity')]} load={async (_c, id) => byId[id as 't1']} />);
    await playMorning('Testcity');
    fireEvent.click(await screen.findByRole('button', { name: 'Continue Testcity' }));
    await waitFor(() => screen.getByRole('img', { name: /2 of 2/ }));
    expect(screen.queryByRole('heading', { level: 1, name: 'Testcity' })).toBeNull();
    cleanup();
    render(<App store={seeded()} chapters={[ch('home', 'Home', { slot: 0, scenario_order: { am: ['h1'], pm: [] } }), ch('bare', 'Bare', { intro: '' })]} load={async (_c, id) => byId[id as 't1']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Bare' }));
    await waitFor(() => screen.getByRole('img', { name: /1 of 2/ }));
    expect(screen.queryByRole('heading', { level: 1, name: 'Bare' })).toBeNull();
  });
});

describe('CR-27 round 2: the choice path in the debrief (psych M4)', () => {
  const none = { pressureAny: false, pressureGenuine: false };
  const cont = { type: 'continue' } as const;
  const c = ctx({ timerMode: 'off' });
  it('layer-1 path: "Step by step" with the beat heading on a boss', () => {
    const s = boss();
    const st = run(s, c, [act('open_app'), cont, act('report_2'), cont, act('hang_up'), { type: 'what_now', choice: 'call_this_number' }, { type: 'what_now', choice: 'done' }]);
    const { container } = render(<DebriefView data={debriefOf(s, st, resultOf(s, B, st), none)} onContinue={() => undefined} onAgain={() => undefined} />);
    const path = container.querySelector('[data-choice-path]');
    expect(path?.querySelectorAll('p')).toHaveLength(1);
    expect(path?.querySelector('p')?.textContent).toMatch(/^.+: You chose: Call back this number\. Then: Leave it there\.$/);
    expect(container.querySelector('#other-choices-h ~ ul')?.textContent ?? '').not.toContain('Then:');
  });
  it('a path on another beat is shown in its "Your other choices" row; no "Step by step"', () => {
    const s = boss();
    let st = run(s, c, [act('tap_link'), act('close_page'), cont, act('pay_invoice')]);
    for (let i = 0; i < 8 && st.phase !== 'done'; i++) {
      st =
        st.phase === 'damage_control'
          ? step(s, c, st, { type: 'recovery', picks: [] })
          : st.phase === 'playing'
            ? step(s, c, st, act('hang_up'))
            : st.phase === 'what_now'
              ? step(s, c, st, { type: 'what_now', choice: 'done' })
              : step(s, c, st, cont);
    }
    const { container } = render(<DebriefView data={debriefOf(s, st, resultOf(s, B, st), none)} onContinue={() => undefined} onAgain={() => undefined} />);
    expect(container.querySelector('[data-choice-path]')).toBeNull();
    expect(container.querySelector('#other-choices-h ~ ul')?.textContent).toContain('You chose: Open the link. Then: Close the page.');
  });
});
