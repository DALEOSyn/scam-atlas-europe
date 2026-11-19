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
  it('the intro screen: h1 = chapter title (focused), the intro text, one Start button', async () => {
    const onStart = vi.fn();
    render(<ChapterIntro name="Paris" intro={'Paris, the last working day.\n\nPinned by the screen: "Payments at Ruchelune."'} onStart={onStart} />);
    const h1 = screen.getByRole('heading', { level: 1, name: 'Paris' });
    await waitFor(() => expect(document.activeElement).toBe(h1));
    expect(screen.getByText('Paris, the last working day.')).toBeTruthy();
    expect(screen.getByText('Pinned by the screen: "Payments at Ruchelune."')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
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
    expect(header(pay({ brand: 'waymarker-desk' }))).toContain('Waymarker Desk');
    expect(header(pay({ brand: 'nope' }))).toContain('Larchwick Bank');
  });
  it('fixtures: a banking beat may set it (schema)', () => {
    const raw = rawTransfer();
    (beatOf(raw, 'bank').message as Raw).bank = { brand: 'waymarker-desk' };
    expect(scenario(raw).beats[0]?.message.bank).toEqual({ brand: 'waymarker-desk' });
  });
});
