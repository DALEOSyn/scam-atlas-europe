// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact';
import { App } from '../../src/app.tsx';
import { createStore, SAVE_KEY, type StorageLike } from '../../src/engine/save.ts';
import { loadExample } from './helpers.ts';

afterEach(cleanup);

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('App: Check, tag, debrief layer 2, chapter stamp, save', () => {
  it('checks and tags red flags, verifies, and earns the stamp; progress is saved locally', async () => {
    const scenario = loadExample();
    const mem = memory();
    render(<App loadFirst={async () => scenario} store={createStore(mem)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => screen.getByRole('button', { name: /Calm preset/ }));
    fireEvent.click(screen.getByRole('button', { name: /Calm preset/ }));
    await waitFor(() => screen.getByText(/Zollgebühr 1,99 EUR/));

    const toggle = screen.getByRole('button', { name: 'Details you can check · 0 checked' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    // Tagging is only offered after checking.
    expect(screen.queryByRole('button', { name: /^Mark as suspicious/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Check Sender/ }));
    fireEvent.click(screen.getByRole('button', { name: /Check Link in the message/ }));
    expect(screen.getByText(/private phone, not the courier/)).toBeTruthy();
    const tags = screen.getAllByRole('button', { name: /^Mark as suspicious: / });
    expect(tags.map((b) => b.getAttribute('aria-label'))).toEqual(['Mark as suspicious: Sender', 'Mark as suspicious: Link in the message']);
    for (const b of tags) fireEvent.click(b);
    // The label stays the same (QA N1); the state is aria-pressed.
    expect(screen.getAllByRole('button', { name: /^Mark as suspicious: / }).every((b) => b.getAttribute('aria-pressed') === 'true')).toBe(true);
    expect(screen.getByRole('button', { name: 'Details you can check · 2 checked' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Open the Trundle app yourself/ }));
    await waitFor(() => screen.getByRole('heading', { level: 3, name: 'What happened' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { level: 1, name: /This was a scam/ }));
    expect(screen.getByRole('img', { name: '3 of 3 stars' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByText('You spotted 2 of 2 you could mark.')).toBeTruthy();
    expect(screen.getByText(/Points 19 of 19/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { name: 'Chapter complete' }));
    const done = screen.getByRole('heading', { name: 'Chapter complete' }).parentElement as HTMLElement;
    expect(within(done).getByText('Passport stamp: gold')).toBeTruthy();
    expect(within(done).getByText(/Red flags you spotted: 2 of 2 · Genuine messages you reported: 0/)).toBeTruthy();

    const saved = JSON.parse(mem.data.get(SAVE_KEY) ?? '{}') as { settings: { timerMode: string; pushers: boolean }; chapters: Record<string, { bestStamp: string; finished: boolean }> };
    expect(saved.settings).toMatchObject({ timerMode: 'off', pushers: false });
    expect(saved.chapters.home).toMatchObject({ finished: true, bestStamp: 'gold' });
  });
});
