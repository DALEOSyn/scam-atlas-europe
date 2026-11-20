// @vitest-environment jsdom
/**
 * T-4.2: per-country help cards (src/content/help.ts, src/ui/HelpCards.tsx): WHERE_TO_REPORT §3c order, crisis row
 * on its own, the country choice in the existing save, "Checked on", safe links, no review notes, generic fallback.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/preact';
import axe from 'axe-core';
import { resolve } from 'node:path';
import { readYaml } from '../../scripts/lib/content.ts';
import { checkedDate, countryName, helpCountries, helpData, helpFirstSteps, helpGroups, knownCountry, SCAM_ORDER, SENSITIVE_ORDER, type HelpData } from '../../src/content/help.ts';
import { HELP_CRISIS_TITLE, type HelpFile } from '../../src/content/schema.ts';
import { DEFAULT_SETTINGS, freshSave, parseSave } from '../../src/engine/save.ts';
import { t } from '../../src/i18n/index.ts';
import { GenericHelpList, HelpCards, HelpCountryProvider } from '../../src/ui/HelpCards.tsx';
import { EndScreen } from '../../src/ui/EndScreen.tsx';
import { ROOT } from './helpers.ts';

afterEach(cleanup);

const data = helpData() as HelpData;
const source = readYaml(resolve(ROOT, 'content/help/where-to-report.en.yaml')) as HelpFile;
const kinds = (cc: string | null, mode: 'scam' | 'sensitive' = 'scam') => helpGroups(data, cc, mode).map((g) => g.kind);
const ids = (cc: string | null, kind: string) => helpGroups(data, cc, 'scam').find((g) => g.kind === kind)?.rows.map((r) => r.id) ?? [];

async function axeClean(el: Element) {
  const r = await axe.run(el, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)).toEqual([]);
}

describe('help data at runtime', () => {
  it('is bundled with every chapter country', () => {
    expect(data).not.toBeNull();
    expect(helpCountries(data).sort()).toEqual(['BE', 'DE', 'ES', 'FR', 'IE', 'IT', 'NL', 'PL', 'PT', 'SE']);
  });

  it('scam order: bank, Report it, support, child, crisis last (§3c)', () => {
    expect(SCAM_ORDER).toEqual(['bank', 'report', 'support', 'child', 'crisis']);
    for (const cc of helpCountries(data)) {
      const k = kinds(cc);
      expect(k.slice(0, 4), cc).toEqual(['bank', 'report', 'support', 'child']);
      const hasCrisis = (data.countries[cc] ?? []).some((r) => r.role === 'crisis');
      expect(k, cc).toEqual(hasCrisis ? [...SCAM_ORDER] : SCAM_ORDER.slice(0, 4));
    }
  });

  it('sensitive order: support, child, crisis, then bank and Report it (§3c)', () => {
    expect(SENSITIVE_ORDER).toEqual(['support', 'child', 'crisis', 'bank', 'report']);
    expect(kinds('SE', 'sensitive')).toEqual(['support', 'child', 'crisis', 'bank', 'report']);
    expect(kinds('DE', 'sensitive')).toEqual(['support', 'child', 'bank', 'report']);
  });

  it('"Report it" lists report, then advice, then police', () => {
    expect(ids('FR', 'report')).toEqual(['fr-17cyber', 'fr-cybermalveillance', 'fr-info-escroqueries', 'fr-police']);
    expect(ids('BE', 'report')).toEqual(['be-safeonweb-forward', 'be-fsma', 'be-police']);
    expect(ids('ES', 'report')).toEqual(['es-017', 'es-police']);
  });

  it('the crisis row is on its own: one row, the calm title; no crisis fallback', () => {
    for (const cc of ['BE', 'ES', 'FR', 'PT', 'SE']) {
      const crisis = helpGroups(data, cc, 'scam').at(-1);
      expect(crisis?.kind, cc).toBe('crisis');
      expect(crisis?.rows).toHaveLength(1);
      expect(crisis?.rows[0]?.name).toBe(HELP_CRISIS_TITLE);
    }
    for (const cc of [null, 'DE', 'IE', 'IT', 'NL', 'PL']) expect(kinds(cc), String(cc)).not.toContain('crisis');
  });

  it('a missing role falls back: ES support; EU / other country gets the EU entries and every fallback', () => {
    expect(ids('ES', 'support')).toEqual(['fallback-support']);
    expect(kinds(null)).toEqual(['bank', 'report', 'support', 'child']);
    expect(ids(null, 'bank')).toEqual(['fallback-bank']);
    expect(ids(null, 'report')).toEqual([...data.eu.map((e) => e.id), 'fallback-police']);
    expect(ids(null, 'support')).toEqual(['fallback-support']);
    expect(ids(null, 'child')).toEqual(['fallback-child_helpline']);
    // The EU entries belong to "EU / other country" only.
    expect(ids('SE', 'report')).not.toContain(data.eu[0]?.id);
  });

  it('harassment rows never show on the scam help list (sextortion card only)', () => {
    const all = helpCountries(data).flatMap((cc) => (['scam', 'sensitive'] as const).flatMap((m) => helpGroups(data, cc, m).flatMap((g) => g.rows.map((r) => r.id))));
    expect(all).not.toContain('fr-3018');
    expect(all.length).toBeGreaterThan(50);
  });

  it('a stored country the data does not know shows the default', () => {
    expect(knownCountry(data, 'SE')).toBe('SE');
    expect(knownCountry(data, 'LU')).toBeNull();
    expect(knownCountry(data, 'constructor')).toBeNull();
    expect(knownCountry(data, null)).toBeNull();
    expect(kinds('LU')).toEqual(kinds(null));
  });

  it('dates and names come from local data only', () => {
    expect(checkedDate('2026-11-19')).toBe('19 November 2026');
    expect(checkedDate('not a date')).toBe('not a date');
    expect(countryName('SE')).toBe('Sweden');
  });

  it('missing or malformed data means the generic list', () => {
    expect(helpData(null)).toBeNull();
    expect(helpData({ meta: {} })).toBeNull();
  });
});

describe('the country choice lives in the existing save', () => {
  it('defaults to EU / other country; a valid code survives a reload; junk does not', () => {
    expect(DEFAULT_SETTINGS.helpCountry).toBeNull();
    expect(freshSave().settings.helpCountry).toBeNull();
    const load = (helpCountry: unknown) => parseSave(JSON.stringify({ version: 1, settings: { helpCountry } })).save.settings.helpCountry;
    expect(load('SE')).toBe('SE');
    for (const bad of ['se', 'SWE', '', 42, null, '<b>']) expect(load(bad), String(bad)).toBeNull();
    // An older save without the field loads with the default.
    expect(parseSave(JSON.stringify({ version: 1, settings: { pushers: false } })).save.settings.helpCountry).toBeNull();
  });
});

describe('<HelpCards>', () => {
  const select = () => screen.getByRole('combobox', { name: t('help_country_label') }) as HTMLSelectElement;

  it('defaults to "EU / other country", lists the countries by name and shows "Checked on" on every row', async () => {
    const { container } = render(<HelpCards />);
    expect(select().value).toBe('');
    expect(within(select()).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'EU / other country', 'Belgium', 'France', 'Germany', 'Ireland', 'Italy', 'Netherlands', 'Poland', 'Portugal', 'Spain', 'Sweden',
    ]);
    const rows = container.querySelectorAll('[data-help-row]');
    expect(rows.length).toBe(helpGroups(data, null, 'scam').reduce((n, g) => n + g.rows.length, 0));
    for (const r of rows) expect(r.querySelector('[data-help-checked]')?.textContent).toMatch(/^Checked on \d{1,2} \w+ 2026$/);
    expect(container.textContent).toContain(data.meta.intro);
    expect(container.textContent).toContain(data.meta.external_links_note);
    await axeClean(container);
  });

  it('switching country shows its cards, crisis last and on its own; local state without a provider', async () => {
    const { container } = render(<HelpCards />);
    fireEvent.change(select(), { target: { value: 'SE' } });
    expect(select().value).toBe('SE');
    const groups = [...container.querySelectorAll('[data-help-group]')].map((g) => g.getAttribute('data-help-group'));
    expect(groups).toEqual(['bank', 'report', 'support', 'child', 'crisis']);
    const last = container.querySelector('[data-help-cards]')?.lastElementChild as HTMLElement;
    expect(last.getAttribute('data-help-group')).toBe('crisis');
    expect(within(last).getByRole('heading', { level: 2 }).textContent).toBe(HELP_CRISIS_TITLE);
    expect(last.querySelectorAll('[data-help-row]')).toHaveLength(1);
    expect(last.textContent).toContain('90101');
    await axeClean(container);
  });

  it('every link opens the verified URL unchanged in a new tab with rel="noopener noreferrer"', () => {
    for (const cc of [null, ...helpCountries(data)]) {
      const { container } = render(<HelpCards />);
      fireEvent.change(select(), { target: { value: cc ?? '' } });
      const urls = helpGroups(data, cc, 'scam').flatMap((g) => g.rows.flatMap((r) => (r.url ? [r.url] : [])));
      const links = [...container.querySelectorAll('a')];
      expect(links.map((a) => a.getAttribute('href')), String(cc)).toEqual(urls);
      for (const a of links) {
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.getAttribute('rel')).toBe('noopener noreferrer');
        expect(a.getAttribute('href')).not.toMatch(/[?#]/);
        expect(a.textContent).toContain('(opens in a new tab)');
      }
      cleanup();
    }
  });

  it('no review_note text is ever rendered, in any country or mode', () => {
    const notes: string[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') {
        for (const [k, x] of Object.entries(v)) {
          if (k === 'review_note' && typeof x === 'string') notes.push(x);
          else walk(x);
        }
      }
    };
    walk(source);
    expect(notes.length).toBeGreaterThan(10);
    for (const sensitive of [false, true]) {
      for (const cc of [null, ...helpCountries(data)]) {
        const { container } = render(<HelpCards sensitive={sensitive} />);
        fireEvent.change(select(), { target: { value: cc ?? '' } });
        const text = container.textContent ?? '';
        for (const n of notes) expect(text).not.toContain(n.slice(0, 40));
        cleanup();
      }
    }
  });

  it('a sensitive scene puts support first', () => {
    const { container } = render(<HelpCards sensitive />);
    fireEvent.change(select(), { target: { value: 'ES' } });
    expect([...container.querySelectorAll('[data-help-group]')].map((g) => g.getAttribute('data-help-group'))).toEqual(['support', 'child', 'crisis', 'bank', 'report']);
  });

  it('with the app provider, the choice is read from and written to the save', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <HelpCountryProvider country="PT" onChange={onChange}>
        <HelpCards />
      </HelpCountryProvider>,
    );
    expect(select().value).toBe('PT');
    expect(container.querySelector('[data-help-cards]')?.getAttribute('data-help-country')).toBe('PT');
    fireEvent.change(select(), { target: { value: 'IE' } });
    expect(onChange).toHaveBeenLastCalledWith('IE');
    fireEvent.change(select(), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
    // A code the data does not know shows the default.
    rerender(
      <HelpCountryProvider country="LU" onChange={onChange}>
        <HelpCards />
      </HelpCountryProvider>,
    );
    expect(select().value).toBe('');
  });

  it('without data, the generic strings are the fallback', () => {
    const { container } = render(<HelpCards data={null} />);
    expect(container.textContent).toContain(t('help_intro'));
    expect(container.textContent).toContain(t('help_bank'));
    expect(container.querySelector('select')).toBeNull();
    cleanup();
    const generic = render(<GenericHelpList />);
    expect(generic.container.querySelectorAll('li')).toHaveLength(5);
  });

  it('the end screen uses the cards under its h2 (group headings are h3)', async () => {
    const { container } = render(<EndScreen epigraph={null} pages={[]} habits={{}} onBack={() => undefined} />);
    const help = container.querySelector('[data-help-cards]') as HTMLElement;
    expect(help).not.toBeNull();
    expect(within(help).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([t('help_group_bank'), t('help_group_report'), t('help_group_support'), t('help_group_child')]);
    await axeClean(container);
  });
});

describe('first steps, intro, headings and the live line (T-4.2 review)', () => {
  const select = () => screen.getByRole('combobox', { name: t('help_country_label') }) as HTMLSelectElement;
  const step = (id: string) => {
    const st = data.first_steps.find((x) => x.id === id);
    if (!st) throw new Error(`fixture: first step ${id} missing`);
    return st;
  };
  /** Document order of the main parts of the help list. */
  const order = (container: Element) =>
    [...container.querySelectorAll('[data-help-intro], [data-help-step="under-18"], [data-help-step="not-your-fault"], [data-help-steps-more], select, [data-help-group]')].map(
      (el) => el.getAttribute('data-help-step') ?? (el.hasAttribute('data-help-steps-more') ? 'more' : el.hasAttribute('data-help-intro') ? 'intro' : el.tagName === 'SELECT' ? 'picker' : `group:${el.getAttribute('data-help-group')}`),
    );

  it('splits the first steps: under-18 then not-your-fault pinned, the rest in file order', () => {
    const { pinned, more } = helpFirstSteps(data);
    expect(pinned.map((x) => x.id)).toEqual(['under-18', 'not-your-fault']);
    expect(more.map((x) => x.id)).toEqual(data.first_steps.map((x) => x.id).filter((id) => id !== 'under-18' && id !== 'not-your-fault'));
    expect(more.map((x) => x.id)).toEqual(expect.arrayContaining(['report-platform', 'recovery-warning']));
  });

  it('scam screen: intro, under-18, not-your-fault, collapsed first steps, picker, then the cards (crisis last)', () => {
    const { container } = render(<HelpCards />);
    fireEvent.change(select(), { target: { value: 'SE' } });
    expect(order(container)).toEqual(['intro', 'under-18', 'not-your-fault', 'more', 'picker', 'group:bank', 'group:report', 'group:support', 'group:child', 'group:crisis']);
    expect(container.querySelector('[data-help-intro]')?.textContent).toBe(data.meta.intro);
    for (const id of ['under-18', 'not-your-fault']) {
      const el = container.querySelector(`[data-help-step="${id}"]`) as HTMLElement;
      expect(el.closest('details')).toBeNull();
      expect(el.textContent).toContain(step(id).title);
      expect(el.textContent).toContain(step(id).body);
    }
    const more = container.querySelector('details[data-help-steps-more]') as HTMLDetailsElement;
    expect(more.open).toBe(false);
    expect(more.querySelector('summary')?.textContent).toBe('First steps, wherever you are');
    for (const id of ['report-platform', 'recovery-warning']) {
      expect(more.textContent).toContain(step(id).title);
      expect(more.textContent).toContain(step(id).body);
    }
    // Platform reporting is a first step, never part of "Report it".
    const report = container.querySelector('[data-help-group="report"]') as HTMLElement;
    expect(report.textContent).not.toContain(step('report-platform').title);
    expect(report.querySelector('[data-help-step]')).toBeNull();
    expect((container.querySelector('[data-help-cards]') as HTMLElement).lastElementChild?.getAttribute('data-help-group')).toBe('crisis');
  });

  it('sensitive scenes: the gentler intro and the pinned steps on top; the collapsed first steps after the cards', () => {
    const { container } = render(<HelpCards sensitive />);
    fireEvent.change(select(), { target: { value: 'ES' } });
    expect(container.querySelector('[data-help-intro]')?.textContent).toBe("You're not alone. Start with whichever feels right.");
    expect(t('help_intro_sensitive')).toBe("You're not alone. Start with whichever feels right.");
    expect(order(container)).toEqual(['intro', 'under-18', 'not-your-fault', 'picker', 'group:support', 'group:child', 'group:crisis', 'group:bank', 'group:report', 'more']);
    expect(container.querySelector('details[data-help-steps-more]')?.textContent).toContain(step('report-platform').body);
  });

  it('the end screen shows the pinned steps and the collapsed first steps too', async () => {
    const { container } = render(<EndScreen epigraph={null} pages={[]} habits={{}} onBack={() => undefined} />);
    expect(container.querySelector('[data-help-step="under-18"]')?.textContent).toContain(step('under-18').title);
    expect(container.querySelector('details[data-help-steps-more]')?.textContent).toContain(step('recovery-warning').body);
    await axeClean(container);
  });

  it('QA 1: a row named like its group heading does not repeat it', () => {
    const { container } = render(<HelpCards />);
    fireEvent.change(select(), { target: { value: 'SE' } });
    const bank = container.querySelector('[data-help-group="bank"]') as HTMLElement;
    expect(within(bank).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Your bank']);
    // Rows with their own name keep it (Belgium: Card Stop under "Your bank").
    fireEvent.change(select(), { target: { value: 'BE' } });
    const be = container.querySelector('[data-help-group="bank"]') as HTMLElement;
    expect(within(be).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Your bank', 'Card Stop / Fraudstop']);
  });

  it('the label says why and where the choice is kept; a polite live line names the new country after a change only', () => {
    const { container } = render(<HelpCards />);
    expect(select()).toBe(screen.getByRole('combobox', { name: 'Your country (for local numbers; stays on this device)' }));
    const live = container.querySelector('[data-help-showing]') as HTMLElement;
    expect(live.getAttribute('role')).toBe('status');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toBe('');
    fireEvent.change(select(), { target: { value: 'PT' } });
    expect(live.textContent).toBe('Showing help for Portugal');
    fireEvent.change(select(), { target: { value: '' } });
    expect(live.textContent).toBe('Showing help for EU / other country');
  });
});
