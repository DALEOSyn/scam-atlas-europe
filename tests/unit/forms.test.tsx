// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SimulatedForm } from '../../src/ui/SimulatedForm.tsx';
import { App } from '../../src/app.tsx';
import { loadExample, ROOT } from './helpers.ts';
import { createStore } from '../../src/engine/save.ts';

/** No storage in unit tests: every render starts from a fresh save. */
const memoryless = () => createStore(null);

afterEach(cleanup);

/** The consequence step after the last beat: focus on its heading, then Continue (ruling 2026-11-19). */
async function passConsequence() {
  const h = await waitFor(() => screen.getByRole('heading', { level: 3, name: 'What happened' }));
  await waitFor(() => expect(document.activeElement).toBe(h));
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
}

/** Every rendered form must be simulated, have no action/method, and swallow submit. */
function assertFormsAreSafe(container: ParentNode): number {
  const forms = Array.from(container.querySelectorAll('form'));
  for (const form of forms) {
    expect(form.hasAttribute('action')).toBe(false);
    expect(form.hasAttribute('method')).toBe(false);
    expect(form.getAttribute('data-simulated')).toBe('true');
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  }
  return forms.length;
}

describe('SimulatedForm (Red Line 2)', () => {
  it('renders without an action attribute and prevents submit', () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <SimulatedForm label="Fake login" onSimulatedSubmit={onSubmit}>
        <label>
          Password <input type="password" name="pw" />
        </label>
        <button type="submit">Log in</button>
      </SimulatedForm>,
    );
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.hasAttribute('action')).toBe(false);

    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    form?.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    // Routed to game logic, and no typed data is handed over.
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(assertFormsAreSafe(container)).toBe(1);
  });

  it('is visibly marked as part of the game', () => {
    render(<SimulatedForm label="x" onSimulatedSubmit={() => undefined}><span /></SimulatedForm>);
    expect(screen.getByText('Demo fields. Nothing can be typed or sent.')).toBeTruthy();
  });

  it('src/ renders <form> only inside SimulatedForm.tsx', () => {
    const srcDir = resolve(ROOT, 'src');
    const files = readdirSync(srcDir, { recursive: true, encoding: 'utf8' }).filter((f) => /\.(t|j)sx?$/.test(f));
    const offenders = files.filter(
      (f) => !f.endsWith('SimulatedForm.tsx') && /<form\b|createElement\(\s*['"]form['"]/.test(readFileSync(join(srcDir, f), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});

describe('App shell', () => {
  it('starts, renders the example scenario, resolves an action and shows the debrief', async () => {
    const scenario = loadExample();
    const { container } = render(<App loadFirst={async () => scenario} store={memoryless()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Scam Atlas: Europe' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    // The timing choice comes before the first timed scenario (GDD §8).
    await waitFor(() => screen.getByRole('heading', { name: 'How much time do you want?' }));
    fireEvent.click(screen.getByRole('button', { name: 'Standard timer' }));
    await waitFor(() => screen.getByText(/Zollgebühr 1,99 EUR/));
    assertFormsAreSafe(container);
    for (const a of scenario.actions) expect(screen.getByRole('button', { name: a.label })).toBeTruthy();
    expect(screen.getByRole('timer').textContent).toMatch(/1:00/);

    fireEvent.click(screen.getByRole('button', { name: /Open the Trundle app yourself/ }));
    await passConsequence();
    await waitFor(() => screen.getByRole('heading', { level: 1, name: /This was a scam/ }));
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
    expect(screen.getByText(/No fee\./)).toBeTruthy();
    expect(screen.getByText(/That is the habit that works/)).toBeTruthy();
    expect(screen.getByText(scenario.debrief.layer1.what_works)).toBeTruthy();
    // No fall: no "could happen to anyone" line (Red Line 5 wording is for after a fall).
    expect(screen.queryByText(/could happen to anyone/)).toBeNull();
    // Layer 1 carries one link into layer 2, never the advice inline.
    const layer1 = container.querySelector('#debrief-h1')?.closest('section')?.textContent ?? '';
    expect(layer1).not.toContain(scenario.debrief.already_clicked?.paid ?? '-');
    fireEvent.click(screen.getByRole('button', { name: 'Already clicked or paid? See what to do' }));
    expect(screen.getByRole('button', { name: 'More' }).getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'If you already…' }));
    // Mini habit card (UI_SPEC §8.2 item 4).
    expect(screen.getByRole('heading', { level: 3, name: 'Open it yourself' })).toBeTruthy();
    expect(container.querySelector('[data-habit-card="open-it-yourself"]')).not.toBeNull();
    assertFormsAreSafe(container);
  });

  it('follows a next_beat to the follow-up page and debriefs the fall without blame', async () => {
    const scenario = loadExample();
    const { container } = render(<App loadFirst={async () => scenario} store={memoryless()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => screen.getByRole('button', { name: 'Timers off' }));
    fireEvent.click(screen.getByRole('button', { name: 'Timers off' }));
    await waitFor(() => screen.getByText(/Zollgebühr 1,99 EUR offen/));
    expect(screen.queryByRole('timer')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Open the link/ }));
    await waitFor(() => screen.getByRole('button', { name: /Enter your card details/ }));
    const bar = container.querySelector('[data-check="page.address"]');
    // Full address in the bar (the "…" markers only show under 320 px); the owner part is always bold.
    expect(bar?.textContent?.replace(/…/g, '')).toBe('trundle-zoll.example/p/8812');
    expect(bar?.querySelector('strong')?.textContent).toBe('trundle-zoll.example');
    expect(screen.getByRole('region', { name: 'Laptop: Browser, training page' })).toBeTruthy();
    assertFormsAreSafe(container);
    fireEvent.click(screen.getByRole('button', { name: /Enter your card details/ }));
    // The consequence step says what happened (focus on its heading, caption right after), then damage control.
    await waitFor(() => screen.getByText(/payments you don't recognise/));
    await passConsequence();
    // Damage control (GDD §9): pick the first step, then 2 more. The caption is not repeated there.
    await waitFor(() => screen.getByRole('heading', { name: 'Limit the damage' }));
    expect(screen.queryByText(/payments you don't recognise/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Wait and see/ }));
    fireEvent.click(screen.getByRole('button', { name: /Reply to the scammer/ }));
    fireEvent.click(screen.getByRole('button', { name: /Block your card/ }));
    expect(screen.getByText('3 of 3 chosen')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    // Feedback per pick; harmful picks explain why without blame (GDD §9).
    await waitFor(() => screen.getByRole('heading', { name: 'Your steps' }));
    expect(screen.getAllByText("Doesn't help:")).toHaveLength(2);
    expect(screen.getByText(/invites a second scam/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => screen.getByRole('heading', { level: 1, name: /This was a scam/ }));
    expect(screen.getByRole('img', { name: '0 of 3 stars' })).toBeTruthy();
    // After a fall the kind line (in the h1) takes the slot: no "You chose" or best line in layer 1.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/^This could happen to anyone\. /);
    const layer1 = container.querySelector('section[aria-labelledby="debrief-h1"]');
    expect(layer1?.textContent).not.toMatch(/You chose/);
    expect(screen.getByText('You chose: Enter your card details and pay.').closest('#debrief-more')).toBeTruthy();
    // The advice lives in layer 2 only (no inline duplicate in layer 1).
    expect(screen.getAllByText(scenario.debrief.already_clicked?.paid ?? '-').length).toBe(1);
    expect(screen.queryByText(/That is the habit that works/)).toBeNull();
  });
});

describe('App error state (finding 13)', () => {
  it('shows an alert and can retry when the scenario fails to load', async () => {
    const scenario = loadExample();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    let calls = 0;
    const loadFirst = async () => {
      calls++;
      if (calls === 1) throw new Error('chunk missing');
      return scenario;
    };
    render(<App loadFirst={loadFirst} store={memoryless()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('alert').textContent).toMatch(/could not be loaded/);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => screen.getByRole('button', { name: 'Standard timer' }));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
