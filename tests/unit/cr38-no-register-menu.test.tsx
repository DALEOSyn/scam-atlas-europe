// @vitest-environment jsdom
/**
 * CR-38 (psych M1), on screen: with no authorised firm in the brand registry, the HUD menu offers no
 * "Fairmeasure register" item (a player never opens an empty register). The shipped brands.yaml lists one
 * since Dublin (T-3.10), so the registry is mocked here without any `register` entries.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/preact';
import { join } from 'node:path';
import { scenarioSchema } from '../../src/content/schema.ts';
import { readYaml } from '../../scripts/lib/content.ts';
import { registerAvailable } from '../../src/content/brands.ts';
import { balance } from '../../src/content/balance.ts';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { ROOT } from '../content/fixtures.ts';

vi.mock('../../content/brands.yaml', async (importOriginal) => {
  const mod = (await importOriginal()) as { default: Record<string, unknown>[] };
  return { default: mod.default.map((b) => Object.fromEntries(Object.entries(b).filter(([k]) => k !== 'register'))) };
});

afterEach(() => cleanup());

describe('CR-38 (psych M1): no register item without an authorised firm', () => {
  it('the HUD menu has no "Fairmeasure register" item when no brand is on the register', () => {
    expect(registerAvailable()).toBe(false);
    const s = scenarioSchema.parse(readYaml(join(ROOT, 'tests', 'fixtures', 'scenarios', 'cr36-voice-call.yaml')));
    const { container } = render(<ScenarioView scenario={s} ctx={{ balance, slot: 4, settings: { timerMode: 'off', pushers: true }, stress: 10 }} onDone={() => undefined} />);
    fireEvent.click(container.querySelector('[data-hud="menu"]') as HTMLElement);
    expect(container.querySelector('#hud-menu')?.hasAttribute('hidden')).toBe(false);
    expect(container.querySelector('[data-menu="register"]')).toBeNull();
  });
});
