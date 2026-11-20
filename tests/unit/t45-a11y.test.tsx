// @vitest-environment jsdom
/**
 * T-4.5 accessibility audit fixes (docs/qa/T-4.5-a11y-privacy-audit.md):
 * B1 Escape in the HUD menu returns focus to the Menu button; m2 the menu closes when focus Tabs out of it;
 * m3 the scenario screen has an h1; m4 document.title names the screen. m5 (help → "Where to get help") is in
 * scene-player.test.tsx; the dark-mode contrast fixes (B2, B3) are in tests/e2e/t45-dark-axe.spec.ts.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { join } from 'node:path';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { readYaml } from '../../scripts/lib/content.ts';
import { balance } from '../../src/content/balance.ts';
import { ScenarioView, scenarioTitle } from '../../src/ui/ScenarioView.tsx';
import { documentTitle } from '../../src/ui/documentTitle.ts';
import { StopScreen } from '../../src/ui/StopScreen.tsx';
import { SettingsPanel } from '../../src/ui/Settings.tsx';
import { freshSave } from '../../src/engine/save.ts';
import { ROOT } from '../content/fixtures.ts';

afterEach(() => {
  cleanup();
  document.title = '';
});

function fixture(): Scenario {
  return scenarioSchema.parse(readYaml(join(ROOT, 'tests', 'fixtures', 'scenarios', 'cr36-voice-call.yaml')));
}

function renderScenario(extra: { chapterName?: string; progress?: { index: number; total: number } | null } = {}) {
  return render(<ScenarioView scenario={fixture()} ctx={{ balance, slot: 4, settings: { timerMode: 'off', pushers: true }, stress: 10 }} onDone={() => undefined} {...extra} />);
}

const menuButton = () => screen.getByRole('button', { name: 'Menu' });
const menuHidden = (c: Element) => c.querySelector('#hud-menu')?.hasAttribute('hidden');

describe('T-4.5 B1: Escape in the HUD menu', () => {
  it('closes the menu and puts focus back on the Menu button, never on <body>', () => {
    const { container } = renderScenario();
    menuButton().focus();
    fireEvent.click(menuButton());
    expect(menuHidden(container)).toBe(false);
    const item = screen.getByRole('button', { name: 'Check mode' });
    item.focus();
    expect(document.activeElement).toBe(item);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuHidden(container)).toBe(true);
    expect(document.activeElement).toBe(menuButton());
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves focus alone when it was outside the menu', () => {
    const { container } = renderScenario();
    fireEvent.click(menuButton());
    const pause = container.querySelector<HTMLElement>('[data-hud="pause"]');
    pause?.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menuHidden(container)).toBe(true);
    expect(document.activeElement).toBe(pause);
  });
});

describe('T-4.5 m2: the HUD menu closes when focus leaves it', () => {
  it('Tab out of the open menu closes it', () => {
    const { container } = renderScenario();
    fireEvent.click(menuButton());
    const items = container.querySelectorAll<HTMLElement>('#hud-menu button');
    const last = items[items.length - 1] as HTMLElement;
    last.focus();
    const outside = container.querySelector<HTMLElement>('#device-heading');
    expect(outside).not.toBeNull();
    fireEvent.focusOut(last, { relatedTarget: outside });
    expect(menuHidden(container)).toBe(true);
  });

  it('moving focus within the menu (Menu button → item) keeps it open', () => {
    const { container } = renderScenario();
    fireEvent.click(menuButton());
    const item = screen.getByRole('button', { name: 'Check mode' });
    fireEvent.focusOut(menuButton(), { relatedTarget: item });
    expect(menuHidden(container)).toBe(false);
  });

  it('focus dropping to nothing (a click on a non-focusing browser) does not close it before the click lands', () => {
    const { container } = renderScenario();
    fireEvent.click(menuButton());
    fireEvent.focusOut(menuButton(), { relatedTarget: null });
    expect(menuHidden(container)).toBe(false);
  });
});

describe('T-4.5 m3: the scenario screen has one h1', () => {
  it('names the chapter and the message count', () => {
    renderScenario({ chapterName: 'Berlin', progress: { index: 3, total: 10 } });
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]?.textContent).toBe('Berlin · Message 3 of 10');
  });

  it('without a chapter or progress it still has an h1', () => {
    renderScenario();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Message');
  });
});

describe('T-4.5 m4: document.title per screen', () => {
  it('formats "<screen> · Scam Atlas: Europe", the name alone for no screen', () => {
    expect(documentTitle('Chapters')).toBe('Chapters · Scam Atlas: Europe');
    expect(documentTitle(null)).toBe('Scam Atlas: Europe');
    expect(documentTitle('  ')).toBe('Scam Atlas: Europe');
    expect(scenarioTitle('Berlin', { index: 3, total: 10 })).toBe('Berlin · Message 3 of 10');
    expect(scenarioTitle(undefined, { index: 1, total: 4 })).toBe('Message 1 of 4');
  });

  it('a scenario sets its title', () => {
    renderScenario({ chapterName: 'Lisbon', progress: { index: 2, total: 9 } });
    expect(document.title).toBe('Lisbon · Message 2 of 9 · Scam Atlas: Europe');
  });

  it('a page screen sets its title; the in-scenario Settings dialog does not', () => {
    render(<StopScreen done={5} total={10} left={5} onKeepGoing={() => undefined} onBack={() => undefined} />);
    expect(document.title).toMatch(/ · Scam Atlas: Europe$/);
    expect(document.title).toBe(`${screen.getByRole('heading', { level: 1 }).textContent ?? ''} · Scam Atlas: Europe`);
    cleanup();
    const settings = freshSave().settings;
    render(<SettingsPanel settings={settings} defaultTimer="standard" onChange={() => undefined} onClose={() => undefined} />);
    expect(document.title).toBe('Settings · Scam Atlas: Europe');
    cleanup();
    document.title = 'Berlin · Message 1 of 10 · Scam Atlas: Europe';
    render(<SettingsPanel settings={settings} defaultTimer="standard" onChange={() => undefined} onClose={() => undefined} modal inScenario />);
    expect(document.title).toBe('Berlin · Message 1 of 10 · Scam Atlas: Europe');
  });
});
