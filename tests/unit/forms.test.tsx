// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SimulatedForm } from '../../src/ui/SimulatedForm.tsx';
import { App } from '../../src/app.tsx';
import { loadExample, ROOT } from './helpers.ts';

afterEach(cleanup);

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
    expect(screen.getByText(/nothing you type here is sent anywhere/i)).toBeTruthy();
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
    const { container } = render(<App loadFirst={async () => scenario} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Scam Atlas: Europe' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    await waitFor(() => screen.getByText(/Zollgebühr 1,99 EUR/));
    assertFormsAreSafe(container);
    expect(screen.getAllByRole('button').length).toBe(scenario.actions.length);

    fireEvent.click(screen.getByRole('button', { name: /Open the Trundle app yourself/ }));
    await waitFor(() => screen.getByRole('heading', { name: 'Debrief' }));
    expect(screen.getByText(/No fee\./)).toBeTruthy();
    expect(screen.getByText(/That is the habit that works/)).toBeTruthy();
    expect(screen.getByText(scenario.debrief.habit)).toBeTruthy();
    expect(screen.getByText(/Already clicked/)).toBeTruthy();
    assertFormsAreSafe(container);
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
    render(<App loadFirst={loadFirst} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('alert').textContent).toMatch(/could not be loaded/);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => screen.getByText(/Zollgebühr 1,99 EUR/));
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
