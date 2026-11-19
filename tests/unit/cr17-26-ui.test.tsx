// @vitest-environment jsdom
/** CR-19 … CR-26 on screen: payee-check cards, request page, bank-details card, call variants, coach mark. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act as flush, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import type { Message } from '../../src/content/schema.ts';
import { channelKind, DeviceView } from '../../src/ui/devices/Device.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { scenario } from '../content/fixtures.ts';
import { rawBoss, rawTransfer } from './engine/cr-fixtures.ts';
import { ctx, type Raw } from './engine/helpers.ts';

beforeEach(() => {
  // The "Checking…" text switches to the result at once (no 0.8 s wait) in reduced motion.
  document.documentElement.dataset.motion = 'reduced';
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.motion;
});

function props(device: DeviceProps['device'], message: Message, over: Partial<DeviceProps> = {}): DeviceProps {
  return {
    beatId: 'bank',
    device,
    message,
    banner: null,
    scenario: { brands: [], role: 'standard' },
    thread: [],
    pushers: [],
    actions: [
      { id: 'pay_anyway', label: 'Pay anyway', kind: 'pay', styled: false },
      { id: 'cancel_call', label: 'Cancel and call Noor', kind: 'call_back_known', styled: false },
      { id: 'cancel', label: 'Cancel', kind: 'ignore', styled: false },
    ],
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

const bankMessage = (payee: NonNullable<Message['payee']>, extra: Partial<Message> = {}): Message => ({ payee, request: 'pay', ...extra });
const resultCard = async (container: Element, result: string): Promise<HTMLElement> =>
  waitFor(() => {
    const el = container.querySelector<HTMLElement>(`[data-name-check="${result}"]`);
    if (!el) throw new Error(`no ${result} card yet`);
    return el;
  });

describe('CR-23: payee-name check result cards', () => {
  it('no match: a warning, never the holder name; the shared footer; actions inside the card in order', async () => {
    const onAct = vi.fn();
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', iban: 'NL00TEST0000000000', name_check: 'mismatch' }), { onAct })} />);
    const card = await resultCard(container, 'mismatch');
    expect(card.textContent).toContain("The name doesn't match this account. The money may go to someone else. If you pay anyway, Larchwick may not be responsible.");
    expect(card.textContent).toContain("Larchwick checks the name against the account. It can't tell you whether the request is genuine.");
    expect(card.textContent).not.toMatch(/held by/);
    expect([...card.querySelectorAll('[data-action]')].map((b) => b.getAttribute('data-action'))).toEqual(['pay_anyway', 'cancel_call', 'cancel']);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel and call Noor' }));
    expect(onAct).toHaveBeenCalledWith('cancel_call');
    // Red Line 2: the transfer is a training page; its form never sends anything.
    const form = container.querySelector('form');
    expect(form?.hasAttribute('action')).toBe(false);
    expect(form?.getAttribute('data-simulated')).toBe('true');
  });
  it('close match shows the holder; match shows the typed name; couldn\'t check shows none', async () => {
    const close = render(<DeviceView {...props('banking', bankMessage({ name: 'Volet Bleu', name_check: 'close_match', holder: 'Volet Bleu Gestion SARL' }))} />);
    expect((await resultCard(close.container, 'close_match')).textContent).toContain("Close match. The account is held by 'Volet Bleu Gestion SARL'. Is that who you mean to pay?");
    cleanup();
    const match = render(<DeviceView {...props('banking', bankMessage({ name: 'Feuillemont', name_check: 'match' }))} />);
    expect((await resultCard(match.container, 'match')).textContent).toContain("Name matches. The account is held by 'Feuillemont'.");
    cleanup();
    const un = render(<DeviceView {...props('banking', bankMessage({ name: 'Tessivane SAS', name_check: 'unavailable' }))} />);
    expect((await resultCard(un.container, 'unavailable')).textContent).toContain("We couldn't check the name for this account.");
  });
  it('one role="status" paragraph is mounted from the start and only its text changes (also in reduced motion)', async () => {
    for (const reduced of [false, true]) {
      vi.useFakeTimers();
      if (reduced) document.documentElement.dataset.motion = 'reduced';
      else delete document.documentElement.dataset.motion;
      const onNameCheck = vi.fn();
      const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }), { onNameCheck })} />);
      const status = container.querySelector('#name-check-result-bank') as HTMLElement;
      expect(status.getAttribute('role')).toBe('status');
      expect(status.textContent).toBe("Checking the name with the payee's bank…");
      // Nothing to act on while the bank is still checking.
      expect(container.querySelector('[data-action]')).toBeNull();
      await flush(async () => {
        vi.advanceTimersByTime(reduced ? 0 : 800);
      });
      expect(container.querySelector('#name-check-result-bank')).toBe(status);
      expect(status.textContent).toContain("The name doesn't match this account.");
      expect(onNameCheck).toHaveBeenLastCalledWith('bank', true);
      cleanup();
      vi.useRealTimers();
    }
  });
  it('the first payee check shows the coach mark; "Got it" focuses the result, never <body>; then never again', async () => {
    const onCoachMark = vi.fn();
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }), { coachMarks: [], onCoachMark })} />);
    const coach = await waitFor(() => {
      const el = container.querySelector<HTMLElement>('[data-coach="payee_check"]');
      if (!el) throw new Error('no coach mark yet');
      return el;
    });
    expect(coach.getAttribute('role')).toBe('note');
    expect(coach.textContent).toContain("Doesn't match? Stop and call. Close match? Compare the name it shows with your own papers. Matches? It only shows whose account it is.");
    expect(onCoachMark).toHaveBeenCalledWith('payee_check', true);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onCoachMark).toHaveBeenLastCalledWith('payee_check', false, true);
    expect(document.activeElement?.id).toBe('name-check-result-bank');
    cleanup();
    const again = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }), { coachMarks: ['payee_check'] })} />);
    await resultCard(again.container, 'mismatch');
    expect(again.container.querySelector('[data-coach]')).toBeNull();
  });
});

describe('CR-18 (c): payment-request page', () => {
  it('shows "Request from <name>", amount and note; no name check and no card fields', () => {
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'Mateus', amount: '€18.00', note: 'Canal boat', payment_request: true }))} />);
    expect(container.textContent).toContain('Request from Mateus');
    expect(container.textContent).toContain('€18.00');
    expect(container.textContent).toContain('Canal boat');
    expect(container.querySelector('[data-name-check]')).toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(container.textContent).not.toMatch(/4000|Card number|Expiry/i);
  });
});

describe('CR-19, CR-20, CR-22, CR-24, CR-25, CR-26 on screen', () => {
  it('CR-19: "Not in your contacts" on a new-contact chat', () => {
    const s = scenario(rawTransfer());
    const { container } = render(<DeviceView {...props('messenger', s.message, { beatId: 'start', actions: [] })} />);
    expect(container.querySelector('[data-new-contact]')?.textContent).toBe('Not in your contacts · +31 6 •• •• •• 17');
  });
  it('CR-20: "Recorded message" only once answered; "you" lines hidden', () => {
    const m: Message = {
      sender: { display: '+31 20 •• •• 55' },
      recorded: true,
      transcript: [
        { speaker: 'caller', text: 'Hello, this is a recorded message about easy work.' },
        { speaker: 'you', text: 'Hello?' },
        { speaker: 'caller', text: 'Press 1 to hear more.' },
      ],
      request: 'none',
    };
    const ringing = render(<DeviceView {...props('call', m, { beatId: 'start', actions: [], call: { beatId: 'start', answered: false, shown: 0, ended: false, step: false } })} />);
    expect(ringing.container.querySelector('[data-recorded]')).toBeNull();
    cleanup();
    const { container } = render(<DeviceView {...props('call', m, { beatId: 'start', actions: [] })} />);
    expect(container.querySelector('[data-recorded]')?.textContent).toBe('Recorded message');
    expect(container.textContent).not.toContain('Hello?');
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
  });
  it('CR-22 and CR-25: an email with a bank-details card (dotted IBAN) and quoted earlier emails', () => {
    const raw = rawBoss();
    (raw.message as Raw).earlier = [{ when: 'Monday', from: 'Solène Arbogast', body: 'Thanks for the invoice.' }];
    const s = scenario(raw);
    const { container } = render(<DeviceView {...props('email', s.message, { beatId: 'start', actions: [] })} />);
    const card = container.querySelector('[data-bank-details]') as HTMLElement;
    expect(card.textContent).toContain('Bank details');
    expect(card.textContent).toContain('Morvenac SAS');
    expect(card.textContent).toContain('FR00 TEST 0000 0000 0000 000');
    const quote = container.querySelector('blockquote[data-earlier]') as HTMLElement;
    expect(quote.textContent).toContain('Solène Arbogast · Monday');
    expect(quote.textContent).toContain('Thanks for the invoice.');
    expect(container.querySelector('[data-earlier] [class*="bubble"]')).toBeNull();
  });
  it('CR-24: the ringing screen keeps the avatar; answered shows the illustration once, no audio; heading "Video call from"', async () => {
    const { deviceHeading } = await import('../../src/ui/devices/Device.tsx');
    const v: Message = {
      sender: { display: 'Solène Arbogast' },
      video: { illustration: 'public/art/video/solene-gate.svg', alt: 'Illustration: Solène at an airport gate' },
      transcript: [{ speaker: 'caller', text: "It's me." }],
      request: 'none',
    };
    expect(deviceHeading('call', v)).toBe('Video call from Solène Arbogast');
    const ringing = render(<DeviceView {...props('call', v, { beatId: 'start', actions: [], call: { beatId: 'start', answered: false, shown: 0, ended: false, step: false } })} />);
    expect(ringing.container.querySelector('figure')).toBeNull();
    expect(ringing.container.querySelector('[aria-hidden="true"][style*="width: 64px"]')).toBeTruthy();
    cleanup();
    const { container } = render(<DeviceView {...props('call', v, { beatId: 'start', actions: [] })} />);
    expect(container.textContent).toContain('Video call');
    expect(container.querySelector('figure img')?.getAttribute('src')).toMatch(/art\/video\/solene-gate\.svg$/);
    expect(container.querySelector('figcaption')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('audio, video')).toBeNull();
  });
  it('CR-26: the business account row', () => {
    const b = scenario(rawBoss()).beats.find((x) => x.id === 'boss_transfer');
    const bank = render(<DeviceView {...props('banking', b?.message as Message)} />);
    expect(bank.container.textContent).toContain('Ruchelune · current account');
  });
  it('channelKind never falls back to "Text message" for a page', () => {
    expect(channelKind('browser')).toBe('Web page');
    expect(channelKind('sms')).toBe('Text message');
  });
});

describe('ScenarioView on a payee-check beat', () => {
  const s = () => scenario(rawTransfer());
  it('the tray pointer appears after "Checking…" and goes to the result, not the buttons', async () => {
    vi.useFakeTimers();
    delete document.documentElement.dataset.motion;
    const { container } = render(<ScenarioView scenario={s()} ctx={ctx({ timerMode: 'off', pushers: false })} onDone={() => undefined} coachMarks={['payee_check']} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    expect(container.querySelector('[data-options-in-device]')).toBeNull();
    await flush(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(container.querySelector('[data-options-in-device]')).toBeTruthy();
    expect(container.querySelectorAll('[data-action="cancel_call"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Go to the options' }));
    expect(document.activeElement?.id).toBe('name-check-result-bank');
    // The skip link goes to the same place.
    (document.body as HTMLElement).focus();
    fireEvent.click(screen.getByText('Skip to your options'));
    expect(document.activeElement?.id).toBe('name-check-result-bank');
  });
  it('records the coach mark as seen; HUD says the timer is paused while it is open', async () => {
    const seen = vi.fn();
    const { container } = render(<ScenarioView scenario={scenario({ ...rawTransfer(), pressure: { timer: true, levers: [] } })} ctx={ctx({ pushers: false })} onDone={() => undefined} coachMarks={[]} onCoachMarkSeen={seen} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    await waitFor(() => expect(container.querySelector('[data-coach]')).toBeTruthy());
    await waitFor(() => expect(container.textContent).toContain('Paused while the tip is open'));
    // Follow-up d: the visible label is short (one HUD row at 320 px); the full sentence is for screen readers.
    const timerEl = container.querySelector('[role="timer"]') as HTMLElement;
    const shortLabel = [...timerEl.querySelectorAll('span[aria-hidden="true"]')].find((el) => el.textContent === 'Paused: tip open');
    expect(shortLabel).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(seen.mock.calls).toEqual([['payee_check_once'], ['payee_check']]);
    expect(container.querySelector('[data-coach]')).toBeNull();
    expect(container.textContent).not.toContain('Paused while the tip is open');
  });
  it('any card action or Check use closes the coach mark and lifts the freeze', async () => {
    for (const how of ['check', 'act'] as const) {
      const seen = vi.fn();
      const { container } = render(<ScenarioView scenario={scenario({ ...rawTransfer(), pressure: { timer: true, levers: [] } })} ctx={ctx({ pushers: false })} onDone={() => undefined} coachMarks={[]} onCoachMarkSeen={seen} />);
      fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
      await waitFor(() => expect(container.querySelector('[data-coach]')).toBeTruthy());
      if (how === 'check') fireEvent.click(container.querySelector('[data-check="payee.iban"]') as HTMLElement);
      else fireEvent.click(container.querySelector('[data-action="cancel_call"]') as HTMLElement);
      await waitFor(() => expect(container.querySelector('[data-coach]')).toBeNull());
      expect(container.textContent).not.toContain('Paused while the tip is open');
      // A first showing closed this way leaves only the `_once` marker: the tip comes back once more.
      expect(seen.mock.calls).toEqual([['payee_check_once']]);
      cleanup();
    }
  });
  it('a tip closed by a Check comes back once; closing its second showing records it [P] (T-S3 item 15)', async () => {
    const seen = vi.fn();
    const first = render(<ScenarioView scenario={scenario({ ...rawTransfer(), pressure: { timer: true, levers: [] } })} ctx={ctx({ pushers: false })} onDone={() => undefined} coachMarks={[]} onCoachMarkSeen={seen} />);
    fireEvent.click(first.container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    await waitFor(() => expect(first.container.querySelector('[data-coach]')).toBeTruthy());
    fireEvent.click(first.container.querySelector('[data-check="payee.iban"]') as HTMLElement);
    await waitFor(() => expect(first.container.querySelector('[data-coach]')).toBeNull());
    cleanup();
    expect(seen.mock.calls).toEqual([['payee_check_once']]);
    // The save holds only the marker, so the next payee check shows the tip again.
    const next = render(<ScenarioView scenario={scenario({ ...rawTransfer(), pressure: { timer: true, levers: [] } })} ctx={ctx({ pushers: false })} onDone={() => undefined} coachMarks={['payee_check_once']} onCoachMarkSeen={seen} />);
    fireEvent.click(next.container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    await waitFor(() => expect(next.container.querySelector('[data-coach]')).toBeTruthy());
    expect(seen.mock.calls).toEqual([['payee_check_once']]);
    // Closed again by a Check: now it is recorded as seen and does not come back.
    fireEvent.click(next.container.querySelector('[data-check="payee.iban"]') as HTMLElement);
    await waitFor(() => expect(next.container.querySelector('[data-coach]')).toBeNull());
    expect(seen.mock.calls).toEqual([['payee_check_once'], ['payee_check']]);
  });

});
