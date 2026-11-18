import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { brandHosts, loadBrands, validateContent, validateI18n, checkScenario, type ContentReport } from '../../scripts/lib/content.ts';
import { isAllowedSourceHost } from '../../scripts/lib/source-hosts.ts';
import { brandSchema, i18nCatalogueSchema, lookalikeSchema, scenarioSchema, sourcesFileSchema } from '../../src/content/schema.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTENT = resolve(ROOT, 'content');

function example(): Record<string, unknown> {
  return parse(readFileSync(resolve(CONTENT, 'scenarios/home/example.yaml'), 'utf8')) as Record<string, unknown>;
}

describe('content:validate', () => {
  it('all content validates (non-strict)', () => {
    const r = validateContent(CONTENT);
    expect(r.errors).toEqual([]);
    expect(r.scenarios.has('home-00-example')).toBe(true);
  });

  it('strict mode rejects placeholder sources', () => {
    // The example still cites the two template placeholder sources; its brand (Trundle) is now registered.
    const r = validateContent(CONTENT, { strict: true });
    expect(r.errors.some((e) => e.includes('placeholder source'))).toBe(true);
    expect(r.errors.some((e) => e.includes('placeholder brand'))).toBe(false);
  });

  it('the scenario template itself matches the schema', () => {
    const tpl = parse(readFileSync(resolve(ROOT, 'templates/scenario.template.yaml'), 'utf8'));
    const res = scenarioSchema.safeParse(tpl);
    expect(res.success ? [] : res.error.issues).toEqual([]);
  });
});

describe('scenario cross-checks', () => {
  const brands = new Map([['trundle', { id: 'trundle', name: 'Trundle', kind: 'courier' as const, placeholder: false }]]);
  const sources = new Map([
    ['europol-scam-smishing', { id: 'europol-scam-smishing', title: 't', placeholder: false }],
    ['bsi-smishing', { id: 'bsi-smishing', title: 't', placeholder: false }],
  ]);
  const run = (raw: unknown): ContentReport => {
    const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
    checkScenario('x.yaml', raw, brands, sources, r);
    return r;
  };

  it('accepts the example', () => {
    expect(run(example()).errors).toEqual([]);
  });

  it('rejects unknown source ids', () => {
    const s = example();
    (s.debrief as Record<string, unknown>).sources = ['no-such-source'];
    expect(run(s).errors.join()).toMatch(/unknown source id "no-such-source"/);
  });

  it('rejects unknown brand ids', () => {
    const s = { ...example(), brands: ['realbank'] };
    expect(run(s).errors.join()).toMatch(/unknown brand id "realbank"/);
  });

  it('rejects actions pointing at undefined outcomes', () => {
    const s = example();
    const actions = s.actions as Record<string, unknown>[];
    actions[0] = { ...actions[0], outcome: 'missing' };
    expect(run(s).errors.join()).toMatch(/outcome "missing" is not defined/);
  });

  it('requires a debrief with red flags and recovery for fraud scenarios', () => {
    const s = example();
    s.debrief = { habit: 'h', sources: ['bsi-smishing'] };
    const errs = run(s).errors.join('\n');
    expect(errs).toMatch(/red flags/);
    expect(errs).toMatch(/already fell for it/);
  });

  it('rejects unknown fields and QR payloads outside /qr/', () => {
    expect(run({ ...example(), surprise: 1 }).errors.length).toBeGreaterThan(0);
    const s = example();
    (s.message as Record<string, unknown>).qr = { payload: 'https://x.example' };
    expect(run(s).errors.join()).toMatch(/in-game route/);
  });
});

describe('sources.yaml (finding 8)', () => {
  const parseUrl = (url: string) =>
    sourcesFileSchema.safeParse({ sources: [{ id: 'x', title: 't', publisher: 'p', url, accessed: '2026-11-18' }] }).success;

  it('accepts https URLs only', () => {
    expect(parseUrl('https://www.europol.europa.eu/')).toBe(true);
    expect(parseUrl('http://www.europol.europa.eu/')).toBe(false);
    expect(parseUrl('javascript:alert(1)')).toBe(false);
    expect(parseUrl('data:text/html,hi')).toBe(false);
    expect(parseUrl('https://user:pw@europa.eu/')).toBe(false);
    expect(parseUrl('not a url')).toBe(false);
  });

  it('non-placeholder sources need publisher, url and accessed date', () => {
    expect(sourcesFileSchema.safeParse({ sources: [{ id: 'x', title: 't' }] }).success).toBe(false);
    expect(sourcesFileSchema.safeParse({ sources: [{ id: 'x', title: 't', placeholder: true }] }).success).toBe(true);
  });

  it('host allowlist matches hosts and subdomains (warn-only in content:validate)', () => {
    expect(isAllowedSourceHost('https://www.europol.europa.eu/x')).toBe(true);
    expect(isAllowedSourceHost('https://www.bsi.bund.de/x')).toBe(true);
    expect(isAllowedSourceHost('https://europa.eu.evil.example/x')).toBe(false);
    expect(isAllowedSourceHost('https://blog.example/x')).toBe(false);
  });
});

describe('i18n catalogues (finding 5)', () => {
  it('content/i18n validates', () => {
    const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
    validateI18n(CONTENT, r);
    expect(r.errors).toEqual([]);
  });

  it('rejects dotted keys, empty values and complex placeholders', () => {
    expect(i18nCatalogueSchema.safeParse({ 'app.title': 'x' }).success).toBe(false);
    expect(i18nCatalogueSchema.safeParse({ app_title: '' }).success).toBe(false);
    expect(i18nCatalogueSchema.safeParse({ app_title: '{n, plural, one {#}}' }).success).toBe(false);
    expect(i18nCatalogueSchema.safeParse({ app_title: 'Score: {score}' }).success).toBe(true);
  });
});

describe('brand registry (T-1.8)', () => {
  const report = (): ContentReport => ({ errors: [], warnings: [], scenarios: new Map() });
  const loadFrom = (yaml: string): ContentReport => {
    const dir = mkdtempSync(join(tmpdir(), 'brands-'));
    writeFileSync(join(dir, 'brands.yaml'), yaml);
    const r = report();
    loadBrands(dir, r);
    return r;
  };

  it('the real registry validates strictly and every host is fictional', () => {
    const r = report();
    const brands = loadBrands(CONTENT, r);
    expect(r.errors).toEqual([]);
    expect(brands.size).toBe(8);
  });

  it('collects domain, sub-brand domains, email hosts and look-alikes incl. {host} objects', () => {
    const b = brandSchema.parse({
      id: 'x',
      name: 'X',
      domain: 'a.example',
      sub_brands: [{ id: 'x-sub', name: 'X Sub', domain: 'b.a.example' }],
      email_addresses: ['x@d.invalid'],
      lookalike_examples: ['c.test/x', { host: 'xI.example', display_text_only: true }],
    });
    expect(brandHosts(b)).toEqual(['a.example', 'b.a.example', 'd.invalid', 'c.test', 'xI.example']);
  });

  it('rejects a real-looking host in a plain look-alike', () => {
    const r = loadFrom('brands:\n  - id: trundle\n    name: Trundle\n    domain: trundle.example\n    lookalike_examples: ["trundle-parcel.com"]\n');
    expect(r.errors.join('\n')).toMatch(/trundle-parcel\.com/);
  });

  it('rejects a real-looking host in a {host, display_text_only} look-alike', () => {
    const r = loadFrom(
      'brands:\n  - id: trundle\n    name: Trundle\n    lookalike_examples:\n      - host: "trundIe.com"\n        display_text_only: true\n',
    );
    expect(r.errors.join('\n')).toMatch(/trundIe\.com/);
  });

  it('a mistyped key carrying a real host fails validation (strict schema)', () => {
    const r = loadFrom('brands:\n  - id: trundle\n    name: Trundle\n    lookalike_exmaples: ["trundle-parcel.com"]\n');
    expect(r.errors.join('\n')).toMatch(/lookalike_exmaples/);
    const sub = loadFrom('brands:\n  - id: trundle\n    name: Trundle\n    sub_brands:\n      - { id: t-pay, name: T Pay, domian: t-pay.com }\n');
    expect(sub.errors.join('\n')).toMatch(/domian/);
  });

  it('look-alike objects must be exactly {host, display_text_only}', () => {
    expect(lookalikeSchema.safeParse({ host: 'a.example', display_text_only: true }).success).toBe(true);
    expect(lookalikeSchema.safeParse({ host: 'a.example', url: 'a.com' }).success).toBe(false);
  });
});
