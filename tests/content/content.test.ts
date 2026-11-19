import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import { brandHosts, loadBrands, loadHabitCards, validateContent, validateI18n, checkScenario, type ContentReport } from '../../scripts/lib/content.ts';
import { scenarioRules } from '../../scripts/lib/rules.ts';
import type { Brand } from '../../src/content/schema.ts';
import { realRegistries } from './fixtures.ts';
import { rawTransfer } from '../unit/engine/cr-fixtures.ts';
import { isAllowedSourceHost } from '../../scripts/lib/source-hosts.ts';
import {
  balanceSchema,
  brandSchema,
  castFileSchema,
  chapterSchema,
  i18nCatalogueSchema,
  lookalikeSchema,
  scenarioSchema,
  sourcesFileSchema,
} from '../../src/content/schema.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTENT = resolve(ROOT, 'content');

/** Template-derived example scenario (test fixture, not game content; cites placeholder sources). */
const EXAMPLE_FILE = resolve(ROOT, 'tests/fixtures/example-scenario.yaml');
function example(): Record<string, unknown> {
  return parse(readFileSync(EXAMPLE_FILE, 'utf8')) as Record<string, unknown>;
}

describe('content:validate', () => {
  it('all content validates (non-strict)', () => {
    const r = validateContent(CONTENT);
    expect(r.errors).toEqual([]);
    expect(r.scenarios.has('home-06-boss-new-portal')).toBe(true);
    expect(r.scenarios.has('home-00-example')).toBe(false);
  });

  it('strict mode: game content cites no placeholders, and a scenario that does is rejected', () => {
    expect(validateContent(CONTENT, { strict: true }).errors).toEqual([]);
    // The example fixture still cites the two template placeholder sources; its brand (Trundle) is registered.
    const dir = copyContent();
    writeFileSync(join(dir, 'scenarios', 'home', 'example.yaml'), readFileSync(EXAMPLE_FILE, 'utf8'));
    const r = validateContent(dir, { strict: true, docsDir: resolve(ROOT, 'docs') });
    expect(r.errors.some((e) => e.includes('placeholder source'))).toBe(true);
    expect(r.errors.some((e) => e.includes('placeholder brand'))).toBe(false);
  });

  it('the scenario template itself matches the schema and the per-scenario rules', () => {
    const tpl = parse(readFileSync(resolve(ROOT, 'templates/scenario.template.yaml'), 'utf8'));
    const res = scenarioSchema.safeParse(tpl);
    expect(res.success ? [] : res.error.issues).toEqual([]);
    if (res.success) expect(scenarioRules(res.data, realRegistries())).toEqual({ errors: [], warnings: [] });
  });

  it('the example passes the per-scenario rules with no warnings', () => {
    const s = scenarioSchema.parse(example());
    expect(scenarioRules(s, realRegistries())).toEqual({ errors: [], warnings: [] });
  });

  it('the tutorial chapter, cast, recovery steps and habit cards load without errors', () => {
    const r = validateContent(CONTENT);
    expect(r.chapters?.get('home')?.status).toBe('complete');
    expect(r.chapters?.get('home')?.scenario_order.am).toContain('home-01-welcome-pack');
    expect(r.warnings.join('\n')).not.toMatch(/draft chapter/);
    const reg = realRegistries();
    expect(reg.cast.get('alex')?.arc_character).toBe(true);
    expect(reg.recoverySteps.has('block_card_in_bank_app')).toBe(true);
    expect(reg.habitCards.get('open-it-yourself')?.lo).toBe('LO-03');
    expect(reg.los?.size).toBe(18);
    expect(reg.patterns?.has('smishing-parcel-fee')).toBe(true);
  });

  it('a scenario whose chapter has no chapter file fails', () => {
    const dir = copyContent();
    rmSync(join(dir, 'chapters', 'home.yaml'));
    expect(validateContent(dir, { docsDir: resolve(ROOT, 'docs') }).errors.join('\n')).toMatch(/chapter "home" has no content\/chapters\/home\.yaml/);
  });

  it('a complete chapter turns mix issues into errors', () => {
    const dir = copyContent();
    const file = join(dir, 'chapters', 'home.yaml');
    const original = readFileSync(file, 'utf8');
    expect(original).toMatch(/^status: complete$/m);
    writeFileSync(file, original.replace(/^boss: .*$/m, 'boss: home-01-welcome-pack'));
    const errs = validateContent(dir, { docsDir: resolve(ROOT, 'docs') }).errors.join('\n');
    expect(errs).toMatch(/boss plays in the afternoon/);
    writeFileSync(file, original.replace(/\nboss: .*/, ''));
    expect(validateContent(dir, { docsDir: resolve(ROOT, 'docs') }).errors.join('\n')).toMatch(/a complete chapter has a boss/);
    // Valid complete chapter shape, but the mix is far off (both genuine scenarios removed): errors, not warnings.
    rmSync(join(dir, 'scenarios', 'home', 'home-01-welcome-pack.yaml'));
    rmSync(join(dir, 'scenarios', 'home', 'home-03-password-reset.yaml'));
    writeFileSync(file, original.replace('home-01-welcome-pack, home-02-mailbox-full, home-03-password-reset', 'home-02-mailbox-full'));
    const r = validateContent(dir, { docsDir: resolve(ROOT, 'docs') });
    expect(r.errors.join('\n')).toMatch(/mix: genuine share 0%/);
    expect(r.warnings.join('\n')).not.toMatch(/draft chapter/);
  });
});

/** A scratch copy of content/ (tests mutate it). */
function copyContent(): string {
  const dir = join(mkdtempSync(join(tmpdir(), 'content-')), 'content');
  cpSync(CONTENT, dir, { recursive: true });
  return dir;
}

describe('YAML anchors, aliases and merge keys (T-2.2 rework 2)', () => {
  it('content:validate rejects the alias probe in a scenario', () => {
    const dir = copyContent();
    const file = join(dir, 'scenarios', 'home', 'example.yaml');
    const text = readFileSync(EXAMPLE_FILE, 'utf8')
      .replace('  - target: sender.detail\n', '  - target: &t sender.detail\n')
      .replace(/^ {2}l10n_note: .*$/m, '  l10n_note: *t');
    writeFileSync(file, text);
    expect(validateContent(dir, { docsDir: resolve(ROOT, 'docs') }).errors.join('\n')).toMatch(/example\.yaml: YAML error: .*anchor &t.*alias \*t|example\.yaml: YAML error: .*alias \*t/);
  });

  it('content:validate rejects merge keys in registries', () => {
    const dir = copyContent();
    writeFileSync(join(dir, 'cast.yaml'), 'base: &b\n  role: x\ncast:\n  - id: a\n    name: A\n    <<: *b\n    arc_character: true\n');
    expect(validateContent(dir, { docsDir: resolve(ROOT, 'docs') }).errors.join('\n')).toMatch(/cast\.yaml: YAML error: .*merge key <</);
  });
});

describe('registry schemas (T-2.2)', () => {
  const balanceRaw = () => parse(readFileSync(resolve(CONTENT, 'balance.yaml'), 'utf8')) as Record<string, Record<string, unknown>>;

  it('balance.yaml parses; action_kinds must cover every engine action kind exactly', () => {
    expect(balanceSchema.safeParse(balanceRaw()).success).toBe(true);
    const missing = balanceRaw();
    delete missing.action_kinds?.pause;
    expect(balanceSchema.safeParse(missing).success).toBe(false);
    const extra = balanceRaw();
    (extra.action_kinds as Record<string, unknown>).teleport = { class: 'verify', los: [] };
    expect(balanceSchema.safeParse(extra).success).toBe(false);
  });

  it('tutorial grace cannot invert stars and points (ruling L4)', () => {
    const grace = (cell: Record<string, unknown>) => {
      const b = balanceRaw();
      (b.tutorial_grace as Record<string, unknown>).report_on_legit = cell;
      return balanceSchema.safeParse(b).success;
    };
    expect(grace({ stars: 1, points: 0 })).toBe(true);
    expect(grace({ stars: 1, points: 9 })).toBe(true);
    expect(grace({ stars: 1, points: 10 })).toBe(false); // = ★★ (2 × per_star)
    expect(grace({ stars: 0, points: 5 })).toBe(false); // = ★
    expect(grace({ stars: 2, points: 0 })).toBe(false); // grace is at most a softened ★
    expect(grace({ stars: 1, points: -1 })).toBe(false);
  });

  it('a new mix rule fails validation until the validator implements it', () => {
    const b = balanceRaw();
    (b.mix as Record<string, unknown>).brand_new_rule = true;
    expect(balanceSchema.safeParse(b).success).toBe(false);
  });

  it('cast members need a known channel unless they are the arc character', () => {
    expect(castFileSchema.safeParse({ cast: [{ id: 'x', name: 'X', role: 'r' }] }).success).toBe(false);
    expect(castFileSchema.safeParse({ cast: [{ id: 'x', name: 'X', role: 'r', arc_character: true }] }).success).toBe(true);
  });

  it('chapters: no duplicates in the order, boss in the afternoon', () => {
    const base = { slot: 1, city: 'c', name: 'C', status: 'draft', patterns: ['p'], lo_focus: ['LO-01'], intro: 'i' };
    expect(chapterSchema.safeParse({ ...base, scenario_order: { am: ['a', 'a'], pm: [] } }).success).toBe(false);
    expect(chapterSchema.safeParse({ ...base, scenario_order: { am: ['b'], pm: [] }, boss: 'b' }).success).toBe(false);
    expect(chapterSchema.safeParse({ ...base, scenario_order: { am: [], pm: ['b'] }, boss: 'b' }).success).toBe(true);
  });

  it('habit cards: one per learning objective', () => {
    const dir = copyContent();
    const file = join(dir, 'habit_cards.yaml');
    writeFileSync(file, readFileSync(file, 'utf8').replace('lo: LO-02', 'lo: LO-03'));
    const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
    loadHabitCards(dir, r, new Set(['LO-02', 'LO-03']));
    expect(r.errors.join('\n')).toMatch(/both teach LO-03/);
  });
});

describe('scenario cross-checks', () => {
  const brands = new Map([
    [
      'trundle',
      { id: 'trundle', name: 'Trundle', kind: 'courier' as const, placeholder: false, domain: 'trundle.example', lookalike_examples: ['trundle-zoll.example'] },
    ],
  ]);
  const sources = new Map([
    ['europol-scam-smishing', { id: 'europol-scam-smishing', title: 't', placeholder: false }],
    ['bsi-smishing', { id: 'bsi-smishing', title: 't', placeholder: false }],
  ]);
  const run = (raw: unknown): ContentReport => {
    const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
    checkScenario('x.yaml', raw, brands, sources, r);
    return r;
  };

  it('message.bank.brand: a bank-sector brand or its sub-brand only (CR-27)', () => {
    // Fixture registry: a bank with a sub-brand (main has none yet) and a non-bank brand with one.
    const reg = new Map<string, Brand>([
      ...[...brands].map(([k, v]): [string, Brand] => [k, v as Brand]),
      ['larchwick', { id: 'larchwick', name: 'Larchwick Bank', kind: 'bank' as const, placeholder: false, sector: 'retail bank (player\'s own bank)', domain: 'larchwick-bank.example', sub_brands: [{ id: 'larchwick-business', name: 'Larchwick Business' }] } as Brand],
      ['waymarker', { id: 'waymarker', name: 'Waymarker Network', kind: 'other' as const, placeholder: false, sector: 'non-profit / player\'s employer', domain: 'waymarker-network.example', sub_brands: [{ id: 'waymarker-desk', name: 'Waymarker Desk' }] } as Brand],
    ]);
    const withBank = (brand: string) => {
      const raw = structuredClone(rawTransfer()) as Record<string, unknown>;
      const bank = (raw.beats as Record<string, unknown>[]).find((b) => b.id === 'bank') as { message: Record<string, unknown> };
      bank.message.bank = { brand };
      const r: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
      checkScenario('x.yaml', raw, reg, sources, r);
      return r.errors.filter((e) => e.includes('message.bank.brand'));
    };
    expect(withBank('larchwick-business')).toEqual([]);
    expect(withBank('larchwick')).toEqual([]);
    expect(withBank('waymarker-desk').join('\n')).toMatch(/"waymarker-desk" is not a bank brand or a bank's sub-brand/);
    expect(withBank('waymarker').join('\n')).toMatch(/is not a bank brand/);
    expect(withBank('nope').join('\n')).toMatch(/is not a bank brand/);
  });

  it('accepts the example', () => {
    expect(run(example()).errors).toEqual([]);
  });

  describe('every host a message shows is registered in brands.yaml', () => {
    type Raw = Record<string, unknown>;
    const msgOf = (s: Raw) => s.message as Raw;
    const hostErrors = (s: Raw) => run(s).errors.filter((e) => /is not registered in content\/brands\.yaml/.test(e));

    it('registered domains and look-alikes pass (body, translation, page.address)', () => {
      expect(hostErrors(example())).toEqual([]);
    });

    it('an unregistered link in the body fails, whatever its case', () => {
      const s = example();
      msgOf(s).body = 'Pay today: Trundle-Fees.example/p/1';
      expect(hostErrors(s).join('\n')).toMatch(/opening message: host "trundle-fees\.example"/);
    });

    it('sender addresses, qr.destination and page.address in beats are checked', () => {
      const s = example();
      msgOf(s).sender = { display: 'Trundle', detail: 'service@trundle-mail.test' };
      msgOf(s).qr = { payload: '/qr/x', destination: 'trundle-qr.example' };
      const [beat] = s.beats as Raw[];
      if (beat) (beat.message as Raw).page = { address: 'https://trundle-pay.invalid/x' };
      const errs = hostErrors(s).join('\n');
      expect(errs).toMatch(/opening message: host "trundle-mail\.test"/);
      expect(errs).toMatch(/opening message: host "trundle-qr\.example"/);
      expect(errs).toMatch(/beat "fee_page": host "trundle-pay\.invalid"/);
    });

    it('a subdomain of a registered domain is not registered by itself', () => {
      const s = example();
      msgOf(s).body = 'See pay.trundle.example/p/1';
      expect(hostErrors(s).join('\n')).toMatch(/host "pay\.trundle\.example"/);
    });
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

  it('fraud debriefs need what to do if you already fell for it, a habit card and a device tip', () => {
    const s = example();
    s.debrief = { layer1: { tell: 't', what_works: 'w' }, sources: ['bsi-smishing'] };
    const errs = run(s).errors.join('\n');
    expect(errs).toMatch(/already fell for it/);
    expect(errs).toMatch(/habit_card/);
    expect(errs).toMatch(/device_tip/);
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
    expect(brands.size).toBe(20); // 8 + Amsterdam (T-3.4): klaverwerk, tallyfern + Paris (T-3.5): ruchelune, volet-bleu, feuillemont, platinoir, cuivrelin, ostrelle + Madrid/Warsaw story art (T-S6a): votelark, tremolik + Lisbon (T-S6b): roostwell, zonelet
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

  it('hosts match ^[a-z0-9.-]+\\.(example|test|invalid)$ (display-only look-alikes are lowercased first)', () => {
    const lookalike = (l: string) =>
      loadFrom(`brands:\n  - id: trundle\n    name: Trundle\n    domain: trundle.example\n    lookalike_examples: [${l}]\n`).errors.join('\n');
    expect(lookalike('"trundle-zoll.example"')).toBe('');
    expect(lookalike('"TrundIe.example"')).toMatch(/must be a lowercase host/);
    expect(lookalike('"trundle_zoll.example"')).toMatch(/must be a lowercase host/);
    expect(lookalike('"trundle .example"')).toMatch(/must be a lowercase host/);
    expect(lookalike('"trundle.EXAMPLE"')).toMatch(/must be a lowercase host/);
    expect(lookalike('{ host: "TrundIe.example", display_text_only: true }')).toBe('');
    expect(lookalike('{ host: "trundIe.com", display_text_only: true }')).toMatch(/trundIe\.com/);
  });

  it('look-alike objects must be exactly {host, display_text_only}', () => {
    expect(lookalikeSchema.safeParse({ host: 'a.example', display_text_only: true }).success).toBe(true);
    expect(lookalikeSchema.safeParse({ host: 'a.example', url: 'a.com' }).success).toBe(false);
  });
});
