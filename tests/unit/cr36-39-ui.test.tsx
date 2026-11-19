// @vitest-environment jsdom
/** CR-36 … CR-39 on screen: voice label (never audio), QR mount and chat QR, the Fairmeasure view, on-call bar over auth. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Message } from '../../src/content/schema.ts';
import { scenarioSchema } from '../../src/content/schema.ts';
import { DeviceView } from '../../src/ui/devices/Device.tsx';
import type { DeviceProps } from '../../src/ui/devices/types.ts';
import { FairmeasurePanel, RegisterResult, registerResultLines } from '../../src/ui/Fairmeasure.tsx';
import { listFiles, readYaml } from '../../scripts/lib/content.ts';
import { brandProjection } from '../../scripts/lib/yaml-module.ts';
import { registerAvailable, registerEntries } from '../../src/content/brands.ts';
import { balance } from '../../src/content/balance.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { parse } from 'yaml';
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

describe('CR-36: no audio, ever', () => {
  it('nothing in src/ renders or plays sound (no <audio>, Audio(), AudioContext or speech synthesis)', () => {
    const offenders = listFiles(join(ROOT, 'src'), ['.ts', '.tsx']).filter((f) => /<audio\b|new Audio\(|AudioContext|speechSynthesis|SpeechSynthesisUtterance/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
  it('the voice label appears under the caller ID once answered, as a checkable; no audio element', () => {
    const s = fixture('cr36-voice-call.yaml');
    const ringing = render(<DeviceView {...props('call', s.message, { call: { beatId: 'start', answered: false, shown: 0, ended: false, step: false } })} />);
    expect(ringing.container.querySelector('[data-voice-label]')).toBeNull();
    cleanup();
    const { container } = render(<DeviceView {...props('call', s.message, { call: { beatId: 'start', answered: true, shown: 2, ended: false, step: false } })} />);
    expect(container.querySelector('[data-voice-label]')?.textContent).toBe('Sounds like Grandpa Teo');
    expect(container.querySelector('audio, video')).toBeNull();
  });
});

describe('CR-37 and CR-39(b): QR codes', () => {
  it('a sticker is drawn as a sticker and named in the text alternative; the mount line follows the destination', () => {
    const s = fixture('cr37-qr-sticker.yaml');
    const { container } = render(<DeviceView {...props('qr', s.message)} />);
    expect(container.querySelector('[data-mount="sticker"]')).not.toBeNull();
    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toMatch(/Sticker stuck over the printed code\.$/);
    // Reading order: the destination chip, then how the code is attached (the Check targets are e2e-tested).
    const chip = container.querySelector('[class*="qrChip"]');
    expect(chip?.nextElementSibling?.hasAttribute('data-qr-mount')).toBe(true);
    expect(container.querySelector('[data-qr-mount]')?.textContent).toBe('How the code is attached: Sticker stuck over the printed code');
  });
  it('a QR code in a chat: stylised code in the bubble, destination chip shown at once, no mount line', () => {
    const s = fixture('cr39b-chat-qr.yaml');
    const { container } = render(<DeviceView {...props('messenger', s.message)} />);
    const qr = container.querySelector('[data-qr="chat"]');
    expect(qr?.closest('[class*="bubbleIn"]')).not.toBeNull();
    expect(qr?.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('A QR code in the message. It opens gatewren.example.');
    expect(qr?.textContent).toContain('QR code · opens');
    expect(qr?.textContent).toContain('gatewren.example');
    expect(container.querySelector('[data-qr-mount]')).toBeNull();
    // The code is drawn, not an image or a link: nothing to scan or follow outside the game.
    expect(qr?.querySelector('a, img')).toBeNull();
  });
});

describe('CR-38: Fairmeasure', () => {
  const entries = [
    { name: 'Brindlecove Bonds', status: 'warning_list' as const },
    { name: 'Ellisfen Invest', status: 'authorised' as const, address: '3 Quillon Street, Dublin', phone: '+353 1 ••• ••42' },
  ];
  it('result cards as lists: "not on the register" always says a clean warning list proves nothing', () => {
    expect(registerResultLines({ firm: 'Quorvex Wealth', result: 'not_listed' })).toEqual([
      'Quorvex Wealth: not on the register.',
      'Warning list: no warning found.',
      "Not on the register means don't pay, even when the warning list is clean.",
    ]);
    expect(registerResultLines({ firm: 'Ellisfen Invest', result: 'authorised', address: '3 Quillon Street, Dublin', phone: '+353 1 ••• ••42' })).toEqual([
      'Ellisfen Invest: on the register of authorised firms.',
      "Contact it only on the register's own details:",
      'Address: 3 Quillon Street, Dublin',
      'Phone: +353 1 ••• ••42',
    ]);
    for (const result of ['authorised', 'not_listed', 'warning_list'] as const) {
      expect(registerResultLines({ firm: 'X', result }).join(' ')).not.toMatch(/\bsafe\b(?! )|is safe|looks safe/i);
    }
    const { container } = render(<RegisterResult card={{ firm: 'Quorvex Wealth', result: 'not_listed' }} coach={false} onCoachSeen={() => undefined} />);
    expect(container.querySelectorAll('ul > li')).toHaveLength(3);
  });
  it('the view: two read-only tabs, no input of any kind, arrows switch tabs, Escape closes', () => {
    const onClose = vi.fn();
    const { container } = render(<FairmeasurePanel entries={entries} onClose={onClose} coach={false} onCoachSeen={() => undefined} />);
    expect(container.querySelector('input, textarea, select, form, [contenteditable]')).toBeNull();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((x) => x.textContent)).toEqual(['Register of authorised firms', 'Warning list']);
    expect(container.querySelector('[data-register-panel="register"]')?.textContent).toContain('Ellisfen Invest');
    expect(container.querySelector('[data-register-panel="register"]')?.textContent).not.toContain('Brindlecove');
    fireEvent.keyDown(tabs[0] as HTMLElement, { key: 'ArrowRight' });
    expect(container.querySelector('[data-register-panel="warnings"]')?.textContent).toContain('Brindlecove Bonds');
    expect(screen.getAllByRole('tab')[1]?.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  it('the one-time coach mark names both lists', () => {
    const seen = vi.fn();
    render(<FairmeasurePanel entries={entries} onClose={() => undefined} coach onCoachSeen={seen} />);
    expect(screen.getByText('Two lists: firms allowed to sell investments, and firms the regulator warns about.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(seen).toHaveBeenCalled();
  });
});

describe('CR-38 (psych M1): no empty register in the menu', () => {
  it('offered only when the register lists an authorised firm: absent with the shipped brands.yaml, present with the fixture register', () => {
    const shipped = brandProjection(parse(readFileSync(join(ROOT, 'content', 'brands.yaml'), 'utf8')));
    const fixtureBrands = brandProjection(parse(readFileSync(join(ROOT, 'tests', 'fixtures', 'brands-register.yaml'), 'utf8')));
    expect(registerAvailable(registerEntries(shipped))).toBe(false);
    expect(registerAvailable(registerEntries([...shipped, ...fixtureBrands]))).toBe(true);
    // A warning list alone is not a register to look things up in.
    expect(registerAvailable([{ name: 'Brindlecove Bonds', status: 'warning_list' }])).toBe(false);
  });
  it('the HUD menu of a scenario has no "Fairmeasure register" item with the shipped brands', () => {
    const s = fixture('cr36-voice-call.yaml');
    const { container } = render(<ScenarioView scenario={s} ctx={{ balance, slot: 4, settings: { timerMode: 'off', pushers: true }, stress: 10 }} onDone={() => undefined} />);
    fireEvent.click(container.querySelector('[data-hud="menu"]') as HTMLElement);
    expect(container.querySelector('#hud-menu')?.hasAttribute('hidden')).toBe(false);
    expect(container.querySelector('[data-menu="register"]')).toBeNull();
  });
});

describe('CR-39(a): the on-call bar over a Gatewren prompt', () => {
  it('renders over the auth prompt with the caller\'s bound line', () => {
    const s = fixture('cr39a-call-auth.yaml');
    const prompt = s.beats[0];
    if (!prompt) throw new Error('fixture changed');
    const { container } = render(
      <DeviceView
        {...props('auth', prompt.message, {
          beatId: 'loan_prompt',
          onCall: { caller: 'Larchwick Bank', callBeatId: 'start', seconds: 65, hangUp: ['deny_call_card', 'deny'] },
          pushers: [{ index: 0, text: "Just tap Approve, then it's blocked.", device: 'call', sender: 'Larchwick Bank', boundTo: 'loan_prompt' } as DeviceProps['pushers'][number]],
        })}
      />,
    );
    const bar = container.querySelector('[data-on-call]');
    expect(bar?.getAttribute('aria-label')).toBe('On a call with Larchwick Bank');
    expect(bar?.querySelector('[data-call-time]')?.textContent).toBe(' · 01:05');
    expect(bar?.querySelector('[data-call-line]')?.textContent).toContain("Just tap Approve, then it's blocked.");
    // The bar sits above the Gatewren header, inside the phone.
    expect(bar?.nextElementSibling?.textContent).toContain('Gatewren');
  });
});
