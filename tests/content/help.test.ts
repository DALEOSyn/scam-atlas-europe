/**
 * T-4.2: the "Where to report and get help" data (content/help/where-to-report.en.yaml): schema, help checker,
 * bundle projection and the single-file red-line exemption (which must not leak to any other file).
 */
import { describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { loadHelp, loadSources, readYaml, type ContentReport } from '../../scripts/lib/content.ts';
import { checkHelp, hasKeyDeep, HELP_FILE_REL, HELP_HIDDEN_KEYS, helpPlayerText, helpProjection, type SourceIndex } from '../../scripts/lib/help.ts';
import { HELP_EMAIL_DOMAINS, HELP_LINK_HOSTS, isAllowedSourceHost, isHelpLinkHost } from '../../scripts/lib/source-hosts.ts';
import { yamlModuleData } from '../../scripts/lib/yaml-module.ts';
import { HELP_FILE, isHelpFile, lintText, loadConfig } from '../../scripts/redline-lint.ts';
import { HELP_CRISIS_TITLE, helpFileSchema, isCleanHelpUrl, isIsoDate, type HelpFile } from '../../src/content/schema.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTENT = resolve(ROOT, 'content');
const FILE = resolve(ROOT, HELP_FILE_REL);
const TEXT = readFileSync(FILE, 'utf8');
const cfg = loadConfig();

const report = (): ContentReport => ({ errors: [], warnings: [], scenarios: new Map() });
const SOURCES: SourceIndex = loadSources(CONTENT, report());
/** A fresh deep copy of the real file's parsed data, for mutation. */
const raw = (): HelpFile => structuredClone(readYaml(FILE)) as HelpFile;
const firstRow = (f: HelpFile) => {
  const rows = f.countries['BE'];
  if (!rows?.[0]) throw new Error('fixture: BE rows missing');
  return rows[0];
};
const errorsOf = (f: unknown) => checkHelp(f, SOURCES).errors;
function nn<T>(x: T | undefined): T {
  if (x === undefined) throw new Error('fixture: missing value');
  return x;
}
const rowsOf = (f: HelpFile, cc: string) => nn(f.countries[cc]);
const pick = (f: HelpFile, cc: string, pred: (r: HelpFile['countries'][string][number]) => boolean) => nn(rowsOf(f, cc).find(pred));

describe('help data: the real file', () => {
  it('passes the schema and every help check', () => {
    expect(helpFileSchema.safeParse(readYaml(FILE)).success).toBe(true);
    expect(errorsOf(readYaml(FILE))).toEqual([]);
  });

  it('lives at content/help/ and is no longer parked in docs/patterns/', () => {
    expect(HELP_FILE).toBe(FILE);
    expect(() => readFileSync(resolve(ROOT, 'docs/patterns/where-to-report.draft.en.yaml'))).toThrow();
  });

  it('covers the ten chapter countries; every crisis row has the calm title; no row lacks `checked`', () => {
    const f = helpFileSchema.parse(readYaml(FILE));
    expect(Object.keys(f.countries).sort()).toEqual(['BE', 'DE', 'ES', 'FR', 'IE', 'IT', 'NL', 'PL', 'PT', 'SE']);
    const rows = Object.values(f.countries).flat();
    for (const r of rows.filter((x) => x.role === 'crisis')) expect(r.name).toBe(HELP_CRISIS_TITLE);
    for (const r of [...rows, ...f.eu, ...f.first_steps, ...Object.values(f.fallbacks)]) expect(isIsoDate(r.checked)).toBe(true);
  });

  it('content:validate reports nothing for it', () => {
    const r = report();
    loadHelp(CONTENT, loadSources(CONTENT, r), r);
    expect(r.errors).toEqual([]);
  });
});

describe('help schema', () => {
  it('every row needs `checked`, as a real date', () => {
    const f = raw();
    delete (firstRow(f) as Partial<ReturnType<typeof firstRow>>).checked;
    expect(errorsOf(f).join('\n')).toMatch(/countries\.BE\.0\.checked/);
    const g = raw();
    firstRow(g).checked = '2026-02-30';
    expect(errorsOf(g).join('\n')).toMatch(/real date/);
    const h = raw();
    delete (h.first_steps[0] as Partial<HelpFile['first_steps'][number]>).checked;
    expect(errorsOf(h).join('\n')).toMatch(/first_steps\.0\.checked/);
    const i = raw();
    delete (i.fallbacks.police as Partial<HelpFile['fallbacks']['police']>).checked;
    expect(errorsOf(i).join('\n')).toMatch(/fallbacks\.police\.checked/);
    expect(isIsoDate('2026-11-20')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('20-11-2026')).toBe(false);
  });

  it('links are https only, with no query string, fragment or port', () => {
    expect(isCleanHelpUrl('https://incydent.cert.pl')).toBe(true);
    for (const bad of ['http://incydent.cert.pl', 'https://incydent.cert.pl/?utm_source=game', 'https://incydent.cert.pl/?', 'https://incydent.cert.pl/#x', 'https://incydent.cert.pl:8443/', 'javascript:alert(1)', 'https://user@incydent.cert.pl/']) {
      expect(isCleanHelpUrl(bad), bad).toBe(false);
    }
    const f = raw();
    const eu0 = nn(f.eu[0]);
    f.eu[0] = { ...eu0, url: `${eu0.url}?ref=game` };
    expect(errorsOf(f).join('\n')).toMatch(/eu\.0\.url: url must be an absolute https:\/\/ URL with no query string/);
  });

  it('rejects unknown keys and roles, duplicate ids and a second crisis row', () => {
    const f = raw();
    (firstRow(f) as Record<string, unknown>)['tracking'] = 'x';
    expect(errorsOf(f).join('\n')).toMatch(/Unrecognized key/i);
    const g = raw();
    (firstRow(g) as Record<string, unknown>)['role'] = 'scam';
    expect(errorsOf(g).join('\n')).toMatch(/countries\.BE\.0\.role/);
    const h = raw();
    nn(rowsOf(h, 'DE')[0]).id = firstRow(h).id;
    expect(errorsOf(h).join('\n')).toMatch(/duplicate help id/);
    const i = raw();
    const crisis = pick(i, 'SE', (r) => r.role === 'crisis');
    rowsOf(i, 'SE').push({ ...crisis, id: 'se-crisis-two' });
    expect(errorsOf(i).join('\n')).toMatch(/one crisis row per country/);
  });

  it('a crisis row keeps its calm title and the emergency line; a support row never takes that title', () => {
    const f = raw();
    const crisis = pick(f, 'ES', (r) => r.role === 'crisis');
    crisis.name = 'Crisis line';
    expect(errorsOf(f).join('\n')).toMatch(/a crisis row's title/);
    const g = raw();
    pick(g, 'ES', (r) => r.role === 'crisis').body = '024 is free.';
    expect(errorsOf(g).join('\n')).toMatch(/In danger now\? Call 112\./);
    const h = raw();
    pick(h, 'ES', (r) => r.role === 'crisis').role = 'support';
    expect(errorsOf(h).join('\n')).toMatch(/must have role crisis/);
  });

  it('pins the link rel and target (G1 question 6)', () => {
    const f = raw();
    (f.meta as Record<string, unknown>)['link_rel'] = 'noopener';
    expect(errorsOf(f).join('\n')).toMatch(/meta\.link_rel/);
    const g = raw();
    (g.meta as Record<string, unknown>)['link_target'] = '_self';
    expect(errorsOf(g).join('\n')).toMatch(/meta\.link_target/);
  });
});

describe('help checker', () => {
  it('every source id must exist in content/sources.yaml and not be a placeholder', () => {
    const f = raw();
    firstRow(f).sources = ['no-such-source-id'];
    expect(errorsOf(f)).toEqual(['countries.BE.0.sources: unknown source id "no-such-source-id" (add it to content/sources.yaml)']);
    const g = raw();
    nn(g.first_steps[0]).sources = ['no-such-source-id'];
    expect(errorsOf(g).join('\n')).toMatch(/first_steps\.0\.sources: unknown source id/);
    const placeholder: SourceIndex = new Map([...SOURCES, ['ph-source', { placeholder: true }]]);
    const h = raw();
    firstRow(h).sources = ['ph-source'];
    expect(checkHelp(h, placeholder).errors.join('\n')).toMatch(/"ph-source" is a placeholder source/);
  });

  it('link hosts must be on the exact help allowlist (incydent.cert.pl included); look-alike suffixes fail', () => {
    expect(HELP_LINK_HOSTS).toContain('incydent.cert.pl');
    expect(isHelpLinkHost('https://incydent.cert.pl')).toBe(true);
    expect(isHelpLinkHost('https://incydent.cert.pl.evil.example/')).toBe(false);
    expect(isHelpLinkHost('https://evil-incydent.cert.pl/')).toBe(false);
    expect(isHelpLinkHost('https://cert.pl/')).toBe(false);
    const f = raw();
    pick(f, 'PL', (r) => r.id === 'pl-cert-incident').url = 'https://help.example/report';
    expect(errorsOf(f)).toEqual(['countries.PL.1.url: host of "https://help.example/report" is not on HELP_LINK_HOSTS (scripts/lib/source-hosts.ts)']);
  });

  it('e-mail domains must be on the help allowlist', () => {
    expect(HELP_EMAIL_DOMAINS).toEqual(['safeonweb.be']);
    const f = raw();
    firstRow(f).email = 'report@mail.example';
    expect(errorsOf(f)).toEqual(['countries.BE.0.email: domain "mail.example" is not on HELP_EMAIL_DOMAINS (scripts/lib/source-hosts.ts)']);
  });

  it('player text holds no URL, scheme, unlisted domain or markup', () => {
    for (const [body, re] of [
      ['Report it at https://incydent.cert.pl now.', /holds no URL/],
      ['Write to mailto: the desk.', /holds no URL/],
      ['Visit helpdesk.example.org today.', /names the domain "helpdesk\.example\.org"/],
      ['Read <script>x</script>', /active or embedding HTML/],
    ] as const) {
      const f = raw();
      firstRow(f).body = body;
      expect(errorsOf(f).join('\n'), body).toMatch(re);
    }
    // A help host named in text (with or without www.) is fine.
    const g = raw();
    firstRow(g).body = 'See cybermalveillance.gouv.fr and incydent.cert.pl.';
    expect(errorsOf(g)).toEqual([]);
  });

  it('the pinned first steps (under-18, not-your-fault) must exist', () => {
    const f = raw();
    f.first_steps = f.first_steps.filter((x) => x.id !== 'under-18');
    expect(errorsOf(f)).toEqual(['first_steps: the pinned step "under-18" is missing']);
  });

  it('source hosts under a broad parent domain match exactly (gov.pt, gov.pl, belgium.be)', () => {
    for (const ok of ['https://www.gov.pt/x', 'https://portugal.gov.pt/x', 'https://samorzad.gov.pl/x', 'https://news.belgium.be/x', 'https://cncs.gov.pt/x', 'https://ccb.belgium.be/x']) {
      expect(isAllowedSourceHost(ok), ok).toBe(true);
    }
    for (const bad of ['https://gov.pt/x', 'https://anything.gov.pt/x', 'https://x.www.gov.pt/x', 'https://evil.samorzad.gov.pl/x', 'https://gov.pl/x', 'https://belgium.be/x', 'https://x.news.belgium.be/x']) {
      expect(isAllowedSourceHost(bad), bad).toBe(false);
    }
  });

  it('a support row is never a suicide or crisis line', () => {
    const f = raw();
    pick(f, 'DE', (r) => r.role === 'support').body = 'Free suicide prevention line.';
    expect(errorsOf(f).join('\n')).toMatch(/support row is never a suicide or crisis line/);
  });

  it('review_note and sources never reach the bundle, and no review_note text is player text', () => {
    const data = yamlModuleData(FILE, TEXT, resolve(CONTENT, 'scenarios'));
    expect(hasKeyDeep(data, HELP_HIDDEN_KEYS)).toEqual([]);
    expect(hasKeyDeep(readYaml(FILE), ['review_note']).length).toBeGreaterThan(10);
    const shipped = JSON.stringify(data);
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
    walk(readYaml(FILE));
    for (const n of notes) expect(shipped).not.toContain(JSON.stringify(n).slice(1, -1));
    const player = helpPlayerText(helpFileSchema.parse(readYaml(FILE))).map((p) => p.text);
    for (const n of notes) expect(player).not.toContain(n);
    expect(() => helpProjection({})).toThrow();
  });

  it('every help link host is also a reputable source host', () => {
    for (const h of HELP_LINK_HOSTS) expect(isAllowedSourceHost(`https://${h}/`), h).toBe(true);
  });

  it('only the one help file may live in content/help/', () => {
    const dir = mkdtempSync(join(tmpdir(), 'help-'));
    try {
      cpSync(CONTENT, dir, { recursive: true });
      writeFileSync(join(dir, 'help', 'extra.yaml'), 'meta: {}\n');
      const r = report();
      loadHelp(dir, loadSources(dir, r), r);
      expect(r.errors.join('\n')).toMatch(/only content\/help\/where-to-report\.en\.yaml may live in content\/help\//);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('redline:lint single-file exemption', () => {
  const realName = nn(helpFileSchema.parse(parse(TEXT)).eu[0]).name; // a denylisted real body, read from the data
  const realNumber = '078 170 170'; // a real card-blocking number listed in the help file

  it('the help file itself lints clean', () => {
    expect(isHelpFile(FILE)).toBe(true);
    expect(isHelpFile(resolve(ROOT, 'content/help/../help/where-to-report.en.yaml'))).toBe(true);
    expect(lintText(FILE, TEXT, cfg)).toEqual([]);
  });

  it('the same text anywhere else fails with phone, brand, domain and URL errors (no leak)', () => {
    for (const other of [
      'content/help/where-to-report.de.yaml',
      'content/help/Where-To-Report.en.yaml',
      'content/where-to-report.en.yaml',
      'content/scenarios/home/where-to-report.en.yaml',
      'content/chapters/where-to-report.en.yaml',
      'public/where-to-report.en.yaml',
      'docs/patterns/where-to-report.draft.en.yaml',
    ]) {
      const cats = new Set(lintText(resolve(ROOT, other), TEXT, cfg).filter((f) => f.severity === 'error').map((f) => f.category));
      expect([...cats].sort(), other).toEqual(expect.arrayContaining(['brand', 'domain', 'phone', 'url']));
    }
  });

  it('a real number or real body in any other content file still fails', () => {
    const scenario = resolve(ROOT, 'content/scenarios/home/x.yaml');
    const scene = resolve(ROOT, 'content/scenes/home/x.yaml');
    for (const file of [scenario, scene, resolve(ROOT, 'content/i18n/en/x.json')]) {
      const yaml = file.endsWith('.json') ? `{"a": "Call ${realNumber}"}` : `body: "Call ${realNumber}"\n`;
      expect(lintText(file, yaml, cfg).map((f) => f.category), file).toContain('phone');
      const brand = file.endsWith('.json') ? `{"a": "${realName}"}` : `body: "${realName}"\n`;
      expect(lintText(file, brand, cfg).map((f) => f.category), file).toContain('brand');
    }
  });

  it('inside the help file, markup, IBAN and help-checker failures still fail', () => {
    const withScript = TEXT.replace('intro: "', 'intro: "<script>x</script> ');
    expect(lintText(FILE, withScript, cfg).map((f) => f.category)).toEqual(expect.arrayContaining(['markup']));
    const withIban = TEXT.replace('intro: "', 'intro: "DE89 3704 0044 0532 0130 00 ');
    expect(lintText(FILE, withIban, cfg).map((f) => f.category)).toContain('iban');
    const withQuery = TEXT.replace('url: https://incydent.cert.pl\n', 'url: https://incydent.cert.pl/?utm_source=game\n');
    expect(withQuery).not.toBe(TEXT);
    const found = lintText(FILE, withQuery, cfg);
    expect(found.map((f) => f.category)).toEqual(['help']);
    expect(found[0]?.message).toMatch(/no query string/);
    const unparsable = lintText(FILE, `${TEXT}\n  bad: [\n`, cfg);
    expect(unparsable.some((f) => f.severity === 'error')).toBe(true);
  });
});
