// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/preact';
import { hostParts, maskedParts, richPieces, segmentMessage, words } from '../../src/ui/text.ts';
import { Host, spokenNumber } from '../../src/ui/RichText.tsx';
import { EMPTY_QUEUE, enqueue, nextAnnouncement } from '../../src/ui/announcer.ts';
import { CORNER_MARKS, QrGraphic } from '../../src/ui/devices/QrGraphic.tsx';

afterEach(cleanup);

describe('hostParts (owner part = last two labels)', () => {
  it('splits scheme, subdomains, owner and path', () => {
    expect(hostParts('https://desk.waymarker-network.example/travel-pass/renew')).toEqual({
      scheme: 'https://',
      sub: ['desk.'],
      owner: 'waymarker-network.example',
      path: ['/travel-pass', '/renew'],
      local: '',
    });
  });
  it('keeps a look-alike prefix out of the owner part', () => {
    expect(hostParts('brewnook.account-check.test').owner).toBe('account-check.test');
  });
  it('separates the local part of an e-mail address', () => {
    const p = hostParts('it-desk@example-sso.test');
    expect(p.local).toBe('it-desk@');
    expect(p.owner).toBe('example-sso.test');
  });
});

describe('Host rendering never wraps at hyphens', () => {
  it('keeps the owner part in one unbreakable piece; breaks only between parts', () => {
    const { container } = render(<Host text="https://desk.waymarker-network.example/travel-pass" />);
    const owner = container.querySelector('[data-owner]');
    expect(owner?.textContent).toBe('waymarker-network.example');
    expect(owner?.className).toMatch(/nowrap/);
    expect(owner?.querySelector('wbr')).toBeNull();
    // Breaks: after the scheme, after "desk.", before the path. Never inside the owner part or at a hyphen.
    expect(container.querySelectorAll('wbr')).toHaveLength(3);
    for (const s of container.querySelectorAll('[class*="nowrap"]')) expect(s.querySelector('wbr')).toBeNull();
    // Outside a control it is a sideways-scrolling box (focusable only once it overflows; no layout in jsdom).
    expect(owner?.className).toMatch(/ownerScroll/);
    expect(owner?.hasAttribute('tabindex')).toBe(false);
  });
  it('only the owner part is nowrap; other labels may break so they never widen a 188 px page (QA T-2.8 m4)', () => {
    const { container } = render(<Host text="desk.waymarker-network.example-sso.test" />);
    const nowrap = [...container.querySelectorAll('[class*="nowrap"]')].map((e) => e.textContent);
    expect(nowrap).toEqual(['example-sso.test']);
    const labels = [...container.querySelectorAll('[class*="label"]')].map((e) => e.textContent);
    expect(labels).toEqual(['desk.', 'waymarker-network.']);
  });
  it('inside a control the owner part is plain text (no nested focusable box)', () => {
    const { container } = render(
      <button type="button">
        <Host text="brewnook.example-verify.test/keep" />
      </button>,
    );
    expect(container.querySelector('[data-owner]')?.className).not.toMatch(/ownerScroll/);
  });
  it('oneLine (address bar) has no break opportunities; strong marks the owner part', () => {
    const { container } = render(<Host text="https://desk.waymarker-network.example/x" oneLine strong />);
    expect(container.querySelectorAll('wbr')).toHaveLength(0);
    const owner = [...container.querySelectorAll('span')].find((s) => s.textContent === 'waymarker-network.example');
    expect(owner?.className).toMatch(/owner/);
  });
});

describe('masked numbers', () => {
  it('builds the spoken form only from the digits shown', () => {
    expect(maskedParts('0800 ••• 3310')).toEqual({ start: '0800', end: '3310' });
    expect(maskedParts('+32 2 ••• •• 00')).toEqual({ start: '+32 2', end: '00' });
    expect(maskedParts('0800 123')).toBeNull();
    expect(spokenNumber('••• 3310')).toMatch(/3310/);
    // The accessible name starts with what is visible (axe label-content-name-mismatch, QA B8).
    expect(spokenNumber('+32 2 ••• •• 00')).toBe('+32 2 … 00, masked number');
    expect(spokenNumber('••• 3310')).toBe('… 3310, masked number'); // no repeated digits (sceptic note 5)
    expect(spokenNumber('••• 3310')).not.toMatch(/\d{5,}/);
  });
  it('richPieces finds hosts and masked numbers in running text', () => {
    const pieces = richPieces('Call 0800 ••• 3310 or visit help.brewnook.example/now.');
    expect(pieces.filter((p) => p.kind !== 'text').map((p) => [p.kind, p.text])).toEqual([
      ['masked', '0800 ••• 3310'],
      ['host', 'help.brewnook.example/now'],
    ]);
  });
});

describe('segmentMessage (numbered like the engine)', () => {
  it('numbers links across body then transcript and places references inline once', () => {
    const s = segmentMessage({
      body: 'Go to a.example/x now. Ref WN-1187.',
      transcript: [{ speaker: 'caller', text: 'Or b.test/y, ref WN-1187 again.' }],
      references: ['WN-1187', 'ZZ-1'],
      phone_numbers: [],
    } as unknown as Parameters<typeof segmentMessage>[0]); // transcript line shape is the schema's; only text is read
    const checks = [...s.body, ...s.transcript.flat()].filter((x) => x.kind === 'check').map((x) => (x.kind === 'check' ? x.target : ''));
    expect(checks).toEqual(['link', 'reference', 'link#2']);
    expect(s.leftover).toEqual([{ target: 'reference#2', text: 'ZZ-1' }]);
  });
  it('counts words for Show more', () => {
    expect(words('Hello — world 42')).toBe(3);
  });
});

describe('announcer queue (UI_SPEC §10.5)', () => {
  it('says categories 1–2 at once and spaces 3–5 by the minimum interval', () => {
    let q = enqueue(EMPTY_QUEUE, 3, '30 seconds left');
    let r = nextAnnouncement(q, 0, 15);
    expect(r.say).toBe('30 seconds left');
    q = enqueue(r.queue, 5, 'New message', (n) => `${n} new messages`);
    q = enqueue(q, 5, 'New message', (n) => `${n} new messages`);
    q = enqueue(q, 1, 'Caller: hello');
    r = nextAnnouncement(q, 5, 15);
    expect(r.say).toBe('Caller: hello');
    r = nextAnnouncement(r.queue, 6, 15);
    expect(r.say).toBeNull();
    r = nextAnnouncement(r.queue, 15, 15);
    expect(r.say).toBe('2 new messages');
  });
});

describe('QR graphic markup (decoder test: qr-undecodable.test.ts)', () => {
  it('draws two non-finder corner marks and a disc, and carries only the in-game route', () => {
    expect(CORNER_MARKS).toHaveLength(2);
    const { container } = render(<QrGraphic route="/qr/parking-1" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('data-route')).toBe('/qr/parking-1');
    expect(container.querySelectorAll('[data-corner-mark]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-disc-corner]')).toHaveLength(1);
    expect(container.innerHTML).not.toMatch(/https?:/);
  });
});
