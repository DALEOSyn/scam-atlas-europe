// @vitest-environment jsdom
/** CR-45 on screen: dialled calls, the bank header's account kind, inline language spans, debrief sub-headings. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { join, resolve } from 'node:path';
import { readYaml } from '../../scripts/lib/content.ts';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { ScenarioView } from '../../src/ui/ScenarioView.tsx';
import { ROOT } from '../content/fixtures.ts';
import { act, B, ctx, run, type Raw } from './engine/helpers.ts';

const FIX = resolve(ROOT, 'tests', 'fixtures', 'scenarios');
const raw = (file: string): Raw => readYaml(join(FIX, file)) as Raw;
const fixture = (file: string): Scenario => scenarioSchema.parse(raw(file));
const none = { pressureAny: false, pressureGenuine: false };

afterEach(() => cleanup());

describe('item 1: a dialled call', () => {
  it('"Call to …", "Calling…" with no Answer or Decline, then connected with Hang up and the options', async () => {
    const s = fixture('cr45-dialled-call.yaml');
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', slot: 4 })} onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Call the number in the text' }));
    await waitFor(() => expect(container.querySelector('#device-heading')?.textContent).toBe('Call to 9•• ••• •14'));
    expect(container.querySelector('[data-call-state]')?.textContent?.trim()).toBe('Calling…');
    expect(screen.queryByRole('button', { name: 'Answer' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull();
    expect(document.body.textContent).toContain('Connecting the call…');
    // QA: where the number came from, while dialling; the Check label says it is the number you dialled.
    expect(container.querySelector('[data-dialled-detail]')?.textContent).toBe('The number from the text');
    expect(document.body.textContent).not.toContain('Incoming call');
    await waitFor(() => expect(container.querySelector('[data-call-state]')?.textContent?.trim()).toBe('Connected'), { timeout: 4000 });
    expect(screen.getByRole('button', { name: 'Hang up' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Details you can check/ }));
    expect(container.textContent).toContain('Number you dialled');
    expect(container.textContent).not.toContain('Caller ID');
    expect(screen.getByRole('button', { name: 'Follow their steps in your app' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Decline' })).toBeNull();
  });
});

describe('item 2: bank header sub-label', () => {
  const open = async (kind?: string) => {
    const r = raw('cr45-personal-account.yaml');
    if (kind) (((r.beats as Raw[])[0] as Raw).message as Raw).account = { nickname: 'Ruchelune · current account', kind };
    const { container } = render(<ScenarioView scenario={scenarioSchema.parse(r)} ctx={ctx({ timerMode: 'off', slot: 4 })} onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pay her in the Larchwick app' }));
    await waitFor(() => expect(container.textContent).toContain('From account'));
    return container;
  };
  it('a personal account shows "Payments", never "Business account"', async () => {
    const c = await open();
    expect(c.textContent).toContain('Payments');
    expect(c.textContent).not.toContain('Business account');
  });
  it('kind: business keeps "Business account" (Paris)', async () => {
    const c = await open('business');
    expect(c.textContent).toContain('Business account');
  });
});

describe('item 3: inline language spans', () => {
  it('a reply label marks its Spanish words and offers the translation beside the button', async () => {
    const s = fixture('cr45-personal-account.yaml');
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', slot: 4 })} onDone={() => undefined} />);
    const button = await waitFor(() => {
      const b = container.querySelector<HTMLElement>('[data-interrupt-action="reply_coffee"]');
      if (!b) throw new Error('no interrupt yet');
      return b;
    }, { timeout: 8000 });
    expect(button.textContent).toBe('Reply: ¡sí, gracias!');
    const span = button.querySelector('[lang="es"]');
    expect(span?.textContent).toBe('¡sí, gracias!');
    expect(button.textContent).not.toContain('{lang');
    const toggle = container.querySelector('[aria-controls="action-translation-reply_coffee"]');
    expect(toggle?.textContent).toBe('Translate');
    fireEvent.click(toggle as HTMLElement);
    expect(container.querySelector('#action-translation-reply_coffee')?.textContent).toContain('yes, thanks!');
  }, 15000);
  it('an outcome line marks its Spanish words, with its translation', async () => {
    const s = fixture('cr45-personal-account.yaml');
    const { container } = render(<ScenarioView scenario={s} ctx={ctx({ timerMode: 'off', slot: 4 })} onDone={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pay her in the Larchwick app' }));
    const send = await waitFor(() => {
      const b = container.querySelector<HTMLElement>('[data-action="send_twelve"]');
      if (!b) throw new Error('no options yet');
      return b;
    }, { timeout: 4000 });
    fireEvent.click(send);
    await waitFor(() => expect(container.querySelector('#consequence-h')).not.toBeNull());
    const span = [...container.querySelectorAll('[data-lang-span]')].find((x) => x.textContent === '¡Genial, gracias!');
    expect(span?.getAttribute('lang')).toBe('es');
    expect(container.querySelector('[aria-controls="consequence-translation"]')).not.toBeNull();
    expect(container.querySelector('#consequence-translation')?.textContent).toContain('Great, thanks!');
  });
});

describe('item 5: debrief sub-headings', () => {
  it('"Called the number they gave" for a call scenario; an authored heading wins ("Moved money")', () => {
    const s = fixture('cr45-dialled-call.yaml');
    const st = run(s, ctx({ timerMode: 'off' }), [act('open_app'), { type: 'continue' }]);
    const data = debriefOf(s, st, resultOf(s, B, st), none);
    render(<DebriefView data={data} onContinue={() => undefined} onAgain={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    const dts = [...document.querySelectorAll('dt')].map((d) => d.textContent);
    expect(dts).toEqual(['Called the number they gave', 'Moved money']);
    expect(document.body.textContent).not.toContain('Clicked the link');
  });
});
