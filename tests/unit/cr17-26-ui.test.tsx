// @vitest-environment jsdom
/** CR-19 … CR-26 on screen: payee-check cards, request page, bank-details card, call variants, coach mark. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import type { Message } from '../../src/content/schema.ts';
import { DeviceView } from '../../src/ui/devices/Device.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { scenario } from '../content/fixtures.ts';
import { beatOf, rawBoss, rawTransfer } from './engine/cr-fixtures.ts';
import { ctx, type Raw } from './engine/helpers.ts';

beforeEach(() => {
  // Results show at once (the ≤ 1 s "Checking…" state is skipped in reduced motion).
  document.documentElement.dataset.motion = 'reduced';
});
afterEach(() => {
  cleanup();
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

describe('CR-23: payee-name check result cards', () => {
  it('no match: a warning, never the holder name; the shared footer; actions inside the card in order', () => {
    const onAct = vi.fn();
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', iban: 'NL00TEST0000000000', name_check: 'mismatch' }), { onAct })} />);
    const card = container.querySelector('[data-name-check="mismatch"]') as HTMLElement;
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
  it('close match shows the holder; match shows the typed name; couldn\'t check shows none; no seal icon', () => {
    const close = render(<DeviceView {...props('banking', bankMessage({ name: 'Volet Bleu', name_check: 'close_match', holder: 'Volet Bleu Gestion SARL' }))} />);
    expect(close.container.querySelector('[data-name-check="close_match"]')?.textContent).toContain("Close match. The account is held by 'Volet Bleu Gestion SARL'. Is that who you mean to pay?");
    cleanup();
    const match = render(<DeviceView {...props('banking', bankMessage({ name: 'Feuillemont', name_check: 'match' }))} />);
    expect(match.container.querySelector('[data-name-check="match"]')?.textContent).toContain("Name matches. The account is held by 'Feuillemont'.");
    cleanup();
    const un = render(<DeviceView {...props('banking', bankMessage({ name: 'Tessivane SAS', name_check: 'unavailable' }))} />);
    expect(un.container.querySelector('[data-name-check="unavailable"]')?.textContent).toContain("We couldn't check the name for this account.");
  });
  it('shows "Checking the name…" first when motion is allowed', () => {
    vi.useFakeTimers();
    delete document.documentElement.dataset.motion;
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }))} />);
    expect(container.querySelector('[data-name-check="checking"]')?.textContent).toBe("Checking the name with the payee's bank…");
    vi.useRealTimers();
  });
  it('the first payee check shows the coach mark, reports open/close for the timer freeze, then never again', () => {
    const onCoachMark = vi.fn();
    const { container } = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }), { coachMarks: [], onCoachMark })} />);
    const coach = container.querySelector('[data-coach="payee_check"]') as HTMLElement;
    expect(coach.getAttribute('role')).toBe('note');
    expect(coach.textContent).toContain("Doesn't match? Stop and call. Close match? Compare the name it shows with your own papers. Matches? It only shows whose account it is.");
    expect(onCoachMark).toHaveBeenCalledWith('payee_check', true);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onCoachMark).toHaveBeenLastCalledWith('payee_check', false);
    cleanup();
    const again = render(<DeviceView {...props('banking', bankMessage({ name: 'R. ••••', name_check: 'mismatch' }), { coachMarks: ['payee_check'] })} />);
    expect(again.container.querySelector('[data-coach]')).toBeNull();
  });
});

describe('CR-18 (c): payment-request page', () => {
  it('shows "Request from <name>", amount and note, and no name check', () => {
    const { container } = render(
      <DeviceView {...props('banking', bankMessage({ name: 'Mateus', amount: '€18.00', note: 'Canal boat', payment_request: true }))} />,
    );
    expect(container.textContent).toContain('Request from Mateus');
    expect(container.textContent).toContain('€18.00');
    expect(container.textContent).toContain('Canal boat');
    expect(container.querySelector('[data-name-check]')).toBeNull();
  });
});

describe('CR-19, CR-20, CR-22, CR-24, CR-25, CR-26 on screen', () => {
  it('CR-19: "Not in your contacts" on a new-contact chat', () => {
    const s = scenario(rawTransfer());
    const { container } = render(<DeviceView {...props('messenger', s.message, { beatId: 'start', actions: [] })} />);
    expect(container.querySelector('[data-new-contact]')?.textContent).toBe('Not in your contacts · +31 6 •• •• •• 17');
  });
  it('CR-20: a recorded message shows the label and hides "you" lines', () => {
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
    const { container } = render(<DeviceView {...props('call', m, { beatId: 'start', actions: [] })} />);
    expect(container.querySelector('[data-recorded]')?.textContent).toBe('Recorded message');
    expect(container.textContent).not.toContain('Hello?');
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
  });
  it('CR-22 and CR-25: an email with a bank-details card and earlier messages', () => {
    const raw = rawBoss();
    (raw.message as Raw).earlier = [{ when: 'Monday', body: 'Thanks for the invoice.' }];
    const s = scenario(raw);
    const { container } = render(<DeviceView {...props('email', s.message, { beatId: 'start', actions: [] })} />);
    const card = container.querySelector('[data-bank-details]') as HTMLElement;
    expect(card.textContent).toContain('Bank details');
    expect(card.textContent).toContain('Morvenac SAS');
    expect(card.textContent).toContain('FR00 TEST 0000 0000 0000 000');
    expect(container.querySelector('[data-earlier]')?.textContent).toContain('Thanks for the invoice.');
  });
  it('CR-24: a video call shows an illustration (no audio element) and CR-26 the account', () => {
    const v: Message = {
      sender: { display: 'Solène Arbogast' },
      video: { illustration: 'public/illustrations/solene-gate.svg', alt: 'Illustration: Solène at an airport gate' },
      transcript: [{ speaker: 'caller', text: "It's me." }],
      request: 'none',
    };
    const { container } = render(<DeviceView {...props('call', v, { beatId: 'start', actions: [] })} />);
    expect(container.textContent).toContain('Video call');
    expect(container.querySelector('figure img')?.getAttribute('src')).toMatch(/illustrations\/solene-gate\.svg$/);
    expect(container.querySelector('audio, video')).toBeNull();
    cleanup();
    const raw = rawBoss();
    const b = scenario(raw).beats.find((x) => x.id === 'boss_transfer');
    const bank = render(<DeviceView {...props('banking', b?.message as Message)} />);
    expect(bank.container.textContent).toContain('Ruchelune · current account');
    expect(beatOf(raw, 'boss_transfer')).toBeTruthy();
  });
});

describe('ScenarioView: the tray points to the options in the bank card', () => {
  it('after start_transfer the tray holds a note, and the card holds the actions', () => {
    const s = scenario(rawTransfer());
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', pushers: false })} onDone={() => undefined} coachMarks={['payee_check']} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    expect(container.querySelector('[data-options-in-device]')).toBeTruthy();
    expect(container.querySelectorAll('[data-action="cancel_call"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Go to the options' }));
    expect(document.activeElement?.getAttribute('data-action')).toBe('pay_anyway');
  });
  it('records the coach mark as seen for the game', () => {
    const seen = vi.fn();
    const s = scenario(rawTransfer());
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', pushers: false })} onDone={() => undefined} coachMarks={[]} onCoachMarkSeen={seen} />);
    fireEvent.click(container.querySelector('[data-action="start_transfer"]') as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(seen).toHaveBeenCalledWith('payee_check');
    expect(container.querySelector('[data-coach]')).toBeNull();
  });
});
