import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { checkRasterAssets, lintPaths, lintText, loadConfig } from '../../scripts/redline-lint.ts';
import {
  blankSvgGeometry,
  checkQrPayload,
  findDomains,
  findIbans,
  findMarkup,
  findPhones,
  findUrls,
  ibanChecksumValid,
  isFictionalPhone,
  luhnValid,
  normalise,
  scanText,
  type Category,
  type Finding,
} from '../../scripts/redline/rules.ts';
import { compileList, nameSegments, parseList } from '../../scripts/redline/lists.ts';
import { listFiles } from '../../scripts/lib/content.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const FIX = resolve(ROOT, 'tests/fixtures/redline');
const cfg = loadConfig();

const errors = (text: string, category?: Category): Finding[] =>
  scanText(text, cfg).filter((f) => f.severity === 'error' && (!category || f.category === category));
const warnings = (text: string): Finding[] => scanText(text, cfg).filter((f) => f.severity === 'warn');

function categories(file: string): Category[] {
  return lintPaths([resolve(FIX, file)], cfg)
    .filter((f) => f.severity === 'error')
    .map((f) => f.category);
}

describe('redline:lint fixtures', () => {
  const cases: [string, Category][] = [
    ['bad-domain.yaml', 'domain'],
    ['bad-url.yaml', 'url'],
    ['bad-markup.yaml', 'markup'],
    ['bad-markup-handlers.html', 'markup'],
    ['bad-iban.yaml', 'iban'],
    ['bad-phone.yaml', 'phone'],
    ['bad-brand.yaml', 'brand'],
    ['bad-brand-homoglyph.yaml', 'brand'],
    ['bad-escaped.yaml', 'domain'],
    ['bad-qr.yaml', 'qr'],
    ['bad-logo.svg', 'url'],
    ['bad-card.yaml', 'card'],
    ['bad-sources-list.yaml', 'domain'],
    ['bad-sources-list.yaml', 'phone'],
    ['bad-sources-list.yaml', 'iban'],
  ];
  it.each(cases)('%s is caught as %s', (file, category) => {
    expect(categories(file)).toContain(category);
  });

  it('every error category of the linter has a fixture', () => {
    expect([...new Set(cases.map(([, c]) => c))].sort()).toEqual(['brand', 'card', 'domain', 'iban', 'markup', 'phone', 'qr', 'url']);
  });

  it('bad-escaped.yaml is only visible after YAML decoding', () => {
    const raw = readFileSync(resolve(FIX, 'bad-escaped.yaml'), 'utf8');
    expect(raw).toContain('zoll' + String.fromCharCode(92) + 'u002Ecom');
    expect(scanText(raw, cfg).filter((f) => f.category === 'domain')).toEqual([]);
    expect(lintText('bad-escaped.yaml', raw, cfg).map((f) => f.match)).toContain('paketpilot-zoll.com');
  });

  it('clean.yaml and clean-logo.svg (tricky but allowed) have no findings', () => {
    expect(lintPaths([resolve(FIX, 'clean.yaml'), resolve(FIX, 'clean-logo.svg')], cfg)).toEqual([]);
  });
});

describe('redline:lint on real content', () => {
  it('content/ and public/ (incl. the example scenario) have no errors or warnings', () => {
    expect(lintPaths([resolve(ROOT, 'content'), resolve(ROOT, 'public')], cfg)).toEqual([]);
    // Scans all of content/ and public/ with the full rule set; it grows with every chapter and
    // passed 5 s on a loaded CI runner (PR #17), so it gets the same timeout as the docs/ scan.
  }, 30_000);

  it('lists are well-formed and large enough', () => {
    expect(cfg.problems).toEqual([]);
    expect(cfg.denyCount).toBeGreaterThanOrEqual(250);
    expect(cfg.warnCount).toBeGreaterThan(0);
  });

  it('the domain allowlist is empty at Phase 1', () => {
    expect(cfg.domainAllowlist).toEqual([]);
  });

  it('source ids may name real publishers only at debrief.sources in scenario files', () => {
    const scenarioFile = resolve(ROOT, 'content/scenarios/home/x.yaml');
    const yaml = 'debrief:\n  sources: [europol-scam-smishing]\n  habit: "Europol says hi"\n';
    expect(lintText(scenarioFile, yaml, cfg).map((f) => f.line)).toEqual([3]);
    // Same text outside content/scenarios/: no exemption.
    expect(lintText(resolve(ROOT, 'content/other.yaml'), yaml, cfg).map((f) => f.line)).toEqual([2, 3]);
  });

  it('the source-id exemption is narrow (finding 2 of the re-review)', () => {
    const scenarioFile = resolve(ROOT, 'content/scenarios/home/x.yaml');
    // Not slug-shaped: linted.
    expect(lintText(scenarioFile, 'debrief:\n  sources: [realbank.com]\n', cfg).map((f) => f.category)).toEqual(['domain']);
    // A sources list at another path: linted.
    const other = 'message:\n  sources: [europol-scam-smishing, "+49 30 1234567"]\n';
    expect(lintText(scenarioFile, other, cfg).map((f) => f.category).sort()).toEqual(['brand', 'phone']);
  });

  it('reports line numbers', () => {
    expect(lintText('x.yaml', 'a: ok\nb: "visit bank.com"\n', cfg)[0]?.line).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Sceptic review findings (T-1.1/1.2 rework). Exact strings from the review.

describe('finding 1: phone numbers are not hidden by the date scrub', () => {
  it.each(['+49-30-1234-567', '06.12.34.56.78', '+33.6.12.34.56.78', '+48 12-345-67-89'])('%s is caught', (s) => {
    expect(errors(s, 'phone')).toHaveLength(1);
  });

  it('plausible dates are still not phones', () => {
    expect(findPhones('on 18.11.2026, 2026-11-18, 01/02/26 and 31-12-2025 at 10:30')).toEqual([]);
  });
});

describe('finding 2: masks are judged per digit run', () => {
  it.each([
    'Call +49 30 1234567 *',
    'press 1, +49 30 1234567#',
    '+49 30 1234567 xx',
    'Kontakt: 0151 2345678 • 24h',
    'ref 0151 2345678 · today',
  ])('%s is caught', (s) => {
    expect(errors(s, 'phone')).toHaveLength(1);
  });

  it('properly masked numbers pass', () => {
    expect(findPhones('+49 ••• ••• 0173, +49 151 •••• 0173, +49 30 xx xx 12, **** **** **** 4242')).toEqual([]);
  });
});

describe('finding 3: brand matching bypasses', () => {
  it.each([
    'Societe Generale',
    'Credit Agricole',
    'Révolut',
    'Pay Pal',
    'Pay-Pal',
    'D H L',
    'D.H.L',
    'N 26',
    'Amaz0n',
    'PayPa1',
    'PayPaI',
    String.fromCodePoint(0x0280) + 'evolut', // small capital R
    String.fromCodePoint(0x13a1) + 'evolut', // Cherokee letter that looks like R
    'dhlexpress',
    'amazonsupport',
    'Sparkassen',
    'Caisse d’Épargne',
    'P a y P a l',
    'Deutsche-Bank',
    'M o n z o',
    'InPost',
  ])('%s is caught', (s) => {
    expect(errors(s, 'brand').length).toBeGreaterThan(0);
  });

  it('paketpilot。com (ideographic full stop) is read as a real domain', () => {
    expect(errors('paketpilot' + String.fromCodePoint(0x3002) + 'com', 'domain')).toHaveLength(1);
    expect(errors('paketpilot' + String.fromCodePoint(0xff61) + 'com', 'domain')).toHaveLength(1);
    expect(errors('paketpilot' + String.fromCodePoint(0xfe52) + 'com', 'domain')).toHaveLength(1);
  });

  it('short names keep strict word boundaries', () => {
    for (const s of ['during the morning', 'thing', 'ingredients', 'Olxen', 'upgrade', 'N260X']) expect(errors(s, 'brand')).toEqual([]);
    for (const s of ['ING', 'pay ING now', 'DPD', 'GLS', 'OLX', 'N26']) expect(errors(s, 'brand').length).toBeGreaterThan(0);
  });

  it('known false positives stay quiet', () => {
    for (const s of [
      "Hi Mum, it's me",
      'Can we chat later?',
      'we transfer the deposit',
      'a revolution in payments',
      'the embankment',
      'my cellphone',
      'a pineapple',
      'they are linked in',
      'Amélie and Amelia',
      'interpolate the values',
      'all express trains',
      'In all cases',
      'Fill in all fields',
      'all or nothing',
      'Tell a friend',
      'post I',
      'Is she in?',
      'in post',
    ]) {
      expect(errors(s, 'brand'), s).toEqual([]);
    }
  });

  it('reports the original wording, not the folded skeleton', () => {
    expect(errors('Write to Amaz0n now', 'brand')[0]?.match).toBe('Amaz0n');
  });
});

describe('finding 4: denylist and warnlist', () => {
  it.each(['Steam', 'Roblox', 'Epic Games', 'Fortnite', 'PlayStation', 'Xbox', 'Discord', 'Twitch', 'HMRC', 'BankID', 'Vodafone', 'Bizum', 'Binance'])(
    '%s is denylisted',
    (s) => {
      expect(errors(s, 'brand').length).toBeGreaterThan(0);
    },
  );

  it('warnlist words warn but do not fail', () => {
    for (const s of ['Pay by Visa', 'Orange', 'Hermes', 'Allegro', 'UPS', 'Telekom', 'Lydia']) {
      expect(errors(s, 'brand'), s).toEqual([]);
      expect(warnings(s).length, s).toBeGreaterThan(0);
    }
  });

  it('warnlist except: phrases suppress the warning', () => {
    expect(warnings('ups and downs')).toEqual([]);
    expect(warnings('orange juice')).toEqual([]);
  });

  it('list syntax: options, exceptions and problems', () => {
    const { entries, problems } = parseList('Foo Bar | prefix, nosep | except: foo bars; foobarista\nAB\nBaz | bogus', 'error');
    expect(entries[0]).toMatchObject({ name: 'Foo Bar', mode: 'prefix', nosep: true, except: ['foo bars', 'foobarista'] });
    expect(problems.join('\n')).toMatch(/"AB" is too short/);
    expect(problems.join('\n')).toMatch(/unknown option "bogus"/);
    const { matchers } = compileList('Foo Bar | prefix | except: foobarista', 'error');
    expect(matchers).toHaveLength(1);
  });
});

describe('finding 5: public/ scanning', () => {
  it('ignores SVG/XLink namespace URLs but not other URLs', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink=\'http://www.w3.org/1999/xlink\'><text>see http://bank.example</text></svg>';
    const found = lintText('x.svg', svg, cfg);
    expect(found.map((f) => f.match)).toEqual(['http://bank.example']);
  });

  it('ignores numeric SVG geometry', () => {
    expect(blankSvgGeometry('<svg viewBox="0 0 512 512"><path d="M10 20 30 40 50 60 70 80 90"/></svg>')).not.toMatch(/\d/);
  });

  it('warns on raster images missing from the assets manifest', () => {
    const pub = resolve(FIX, 'public');
    const found = checkRasterAssets(pub, resolve(pub, 'assets-manifest.yaml'));
    expect(found.map((f) => [f.match, f.severity])).toEqual([['undeclared.png', 'warn']]);
  });
});

describe('finding 6: inverted domain rule', () => {
  it('flags any alphabetic TLD, incl. IDN', () => {
    const m = (s: string) => findDomains(s, []).map((f) => f.match);
    expect(m('bank.md invoice.zip x.shop bank.zoll bank.рф foo.bar.xn--p1ai')).toEqual(['bank.md', 'invoice.zip', 'x.shop', 'bank.zoll', 'bank.рф', 'foo.bar.xn--p1ai']);
  });

  it('allows fictional TLDs, non-domain tokens, file names and numbers', () => {
    expect(findDomains('a.example b.test c.invalid sender.detail e.g. i.e. invoice.pdf 1.99 v2.0 18.11.2026 D.H.L', [])).toEqual([]);
  });

  it('allowlist covers the domain and its subdomains only', () => {
    expect(findDomains('report.gov.example.org www.report.org', ['report.org'])).toHaveLength(1);
    expect(findDomains('notreport.org', ['report.org'])).toHaveLength(1);
  });
});

describe('findings 9 and 10: markup, schemes, looser IBANs', () => {
  it('flags embedding elements, inline handlers and mailto:', () => {
    for (const s of ['<iframe src=x>', '<object data=x>', '<embed src=x>', '<meta http-equiv="refresh">', '<img src=x onerror="go()">', '<form onsubmit="x">', '<script>']) {
      expect(findMarkup(s), s).toHaveLength(1);
    }
    expect(findMarkup('<FORM class="x" Action = "/a">').length).toBeGreaterThan(0);
    expect(findMarkup('the button = blue; everyone = welcome')).toEqual([]);
    expect(findUrls('mailto:help@bank.example')).toHaveLength(1);
    expect(findUrls('see http://x.example and HTTPS://y.test')).toHaveLength(2);
    expect(findUrls('javascript:alert(1)')).toHaveLength(1);
  });

  it('IBANs with any [ .-] separators are checked', () => {
    expect(ibanChecksumValid('DE89370400440532013000')).toBe(true);
    expect(ibanChecksumValid('DE00370400440532013000')).toBe(false);
    for (const s of ['DE89370400440532013000', 'gb82west12345698765432', 'DE89 3704 0044 0532 0130 00', 'DE89.3704.0044.0532.0130.00', 'DE89-3704-0044-0532-0130-00', 'DE 89 370 400 440 532 013 000', 'DE89 3704 0044 0532 0130 00 EXTRA']) {
      expect(findIbans(s), s).toHaveLength(1);
    }
    expect(findIbans('DE00 3704 0044 0532 0130 00')).toEqual([]);
  });
});

describe('fictional phone ranges and QR payloads', () => {
  it('UK Ofcom drama ranges pass', () => {
    expect(isFictionalPhone('+44 7700 900123')).toBe(true);
    expect(isFictionalPhone('07700 900123')).toBe(true);
    expect(isFictionalPhone('07700 800123')).toBe(false);
    expect(findPhones('+44 7700 900 123, 01632 960 001')).toEqual([]);
    expect(findPhones('call (030) 1234567 or 0049 30 1234567')).toHaveLength(2);
  });

  it('qr payloads must be in-game routes', () => {
    expect(checkQrPayload('/qr/lisbon-parking-01')).toEqual([]);
    expect(checkQrPayload('https://x.example')).toHaveLength(1);
    expect(checkQrPayload('/qr/../admin')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Re-review findings (final narrow fix). Exact strings from the review.

describe('re-review 1: separators only at the name\'s own boundaries or between every letter', () => {
  it('segments follow word, digit and 3+3 camelCase boundaries', () => {
    expect(nameSegments('PayPal')).toEqual(['Pay', 'Pal']);
    expect(nameSegments('InPost')).toEqual(['InPost']);
    expect(nameSegments('N26')).toEqual(['N', '26']);
    expect(nameSegments('Deutsche Bank')).toEqual(['Deutsche', 'Bank']);
    expect(nameSegments('WeChat')).toEqual(['WeChat']);
  });

  it('docs/ prose produces no brand errors', () => {
    // docs/patterns/ (research) names real organisations as sources by design, so it is excluded.
    const docs = listFiles(resolve(ROOT, 'docs'), ['.md']).filter((f) => !/[\\/]docs[\\/]patterns[\\/]/.test(f));
    expect(docs.length).toBeGreaterThan(0);
    const found = docs.flatMap((f) => scanText(readFileSync(f, 'utf8'), cfg).filter((x) => x.category === 'brand' && x.severity === 'error').map((x) => `${f}:${x.line} ${x.match}`));
    expect(found).toEqual([]);
    // Scans every docs/*.md with the full rule set (≈1.5 s locally); generous timeout for loaded CI runners.
  }, 30_000);
});

describe('re-review 3: typographic dashes and more IBAN separators', () => {
  const c = (n: number) => String.fromCodePoint(n);
  const EN = c(0x2013);
  it.each([
    ['030' + EN + '1234567', 'phone'],
    ['0151 ' + EN + ' 2345678', 'phone'],
    ['030' + c(0x2212) + '1234567', 'phone'],
    ['0151' + c(0x2012) + '2345678', 'phone'],
    ['DE89' + EN + '3704' + EN + '0044' + EN + '0532' + EN + '0130' + EN + '00', 'iban'],
    ['+49 151 2345' + EN + '678', 'phone'],
    ['DE89_3704_0044_0532_0130_00', 'iban'],
    ['DE89/3704/0044/0532/0130/00', 'iban'],
  ] as [string, Category][])('%s is caught as %s', (s, category) => {
    expect(errors(s, category)).toHaveLength(1);
  });

  it('every listed dash maps to "-"', () => {
    for (const p of [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d]) {
      expect(normalise('a' + String.fromCodePoint(p) + 'b'), p.toString(16)).toBe('a-b');
    }
  });
});

describe('re-review extras', () => {
  it('defanged domains are caught', () => {
    for (const s of ['bank[.]com', 'bank(dot)com', 'bank[dot]com', 'bank (dot) com', 'bank{.}co.uk']) expect(errors(s, 'domain'), s).toHaveLength(1);
    expect(errors('paketpilot[.]example', 'domain')).toEqual([]);
  });

  it('Luhn-valid card numbers fail, invalid ones pass', () => {
    expect(luhnValid('4111111111111111')).toBe(true);
    expect(luhnValid('4111111111111112')).toBe(false);
    for (const s of ['4111 1111 1111 1111', '4111-1111-1111-1111', '4111111111111111', '3782 822463 10005']) expect(errors(s, 'card'), s).toHaveLength(1);
    expect(errors('4111 1111 1111 1112')).toEqual([]);
    // A compact unprefixed phone is still a phone even if it fails Luhn.
    expect(errors('4930123456789', 'phone')).toHaveLength(1);
  });

  it('SEB moved to the warnlist', () => {
    expect(errors('SEB', 'brand')).toEqual([]);
    expect(warnings('SEB')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// T-1.8: brands.yaml and balance.yaml are linted again.

describe('T-1.8: brand registry and balance tables are linted', () => {
  const BRANDS = resolve(ROOT, 'content/brands.yaml');
  const brandYaml = (fields: string) =>
    `brands:\n  - id: trundle\n    name: "Trundle"\n${fields}    checked_against: ["DHL", "Deutsche Post", "InPost"]\n    web_check: "Low. Not DHL or bol (BRAND_CHECK)."\n    rationale:\n      name: "Not PayPal."\n      colour_shape: "Couriers cluster on yellow (DHL) and orange."\n`;
  const lintBrands = (fields: string) => lintText(BRANDS, brandYaml(fields), cfg).filter((f) => f.severity === 'error');

  it('the real brands.yaml and balance.yaml are scanned and produce no findings', () => {
    const files = [BRANDS, resolve(ROOT, 'content/balance.yaml')];
    expect(lintPaths(files, cfg)).toEqual([]);
    const scanned = lintPaths([resolve(ROOT, 'content')], cfg);
    expect(scanned).toEqual([]);
  });

  it('review-only fields may name real brands', () => {
    expect(lintBrands('')).toEqual([]);
  });

  it('review-only fields are exempt from the brand rule only (T-2.2): domains, phones and URLs still fail', () => {
    const withNote = (note: string) =>
      lintText(BRANDS, brandYaml('').replace('web_check: "Low. Not DHL or bol (BRAND_CHECK)."', `web_check: "${note}"`), cfg)
        .filter((f) => f.severity === 'error')
        .map((f) => f.category);
    expect(withNote('Low. trundle.me is a travel app.')).toEqual(['domain']);
    expect(withNote('See https://trundle.example/about')).toContain('url');
    expect(withNote('Low. trundle dot me is a travel app.')).toEqual([]);
    const checked = lintText(BRANDS, brandYaml('').replace('"InPost"]', '"InPost", "bol.com"]'), cfg).filter((f) => f.severity === 'error');
    expect(checked.map((f) => f.category)).toEqual(['domain']);
  });

  it('a denylisted name fails', () => {
    const found = lintText(BRANDS, brandYaml('').replace('name: "Trundle"', 'name: "DHL Paket"'), cfg);
    expect(found.filter((f) => f.severity === 'error').map((f) => [f.category, f.line])).toEqual([['brand', 3]]);
  });

  it.each([
    ['short_name', '    short_name: "PayPal"\n'],
    ['app_name', '    app_name: "Revolut app"\n'],
    ['sms_sender_id', '    sms_sender_id: "DHL"\n'],
    ['known_channels', '    known_channels: "Call 030 1234567"\n'],
    ['email_addresses', '    email_addresses: ["help@trundle.com"]\n'],
    ['sub_brands name', '    sub_brands:\n      - { id: t-pay, name: "Trundle x Klarna" }\n'],
    ['lookalike object host', '    lookalike_examples:\n      - { host: "trundle.de", display_text_only: true }\n'],
    ['role_in_game', '    role_in_game: "Like Amazon lockers"\n'],
  ])('player-facing field %s is linted', (_, fields) => {
    expect(lintBrands(fields).length).toBeGreaterThan(0);
  });

  it('exemptions apply only to brands[] review fields in content/brands.yaml', () => {
    // Same review fields in another file: linted.
    expect(lintText(resolve(ROOT, 'content/other.yaml'), brandYaml(''), cfg).some((f) => f.severity === 'error')).toBe(true);
    // A review-field name at another path inside brands.yaml: linted.
    expect(lintText(BRANDS, 'common:\n  checked_against: ["DHL"]\nbrands: []\n', cfg).map((f) => f.category)).toEqual(['brand']);
  });

  it('keys are still scanned in brands.yaml (raw pass is skipped there)', () => {
    expect(lintText(BRANDS, 'brands:\n  - id: t\n    name: T\n    paypal_id: "x"\n', cfg).map((f) => f.category)).toEqual(['brand']);
  });
});

// ---------------------------------------------------------------------------
// T-2.2 rework: checkable names are exempt only as inspectable target values.

describe('checkable names are not a domain loophole (T-2.2)', () => {
  const SCENARIO = resolve(ROOT, 'content/scenarios/home/x.yaml');
  const domains = (file: string, yaml: string) =>
    lintText(file, yaml, cfg)
      .filter((f) => f.severity === 'error' && f.category === 'domain')
      .map((f) => f.match.toLowerCase());

  it.each(['page.info', 'PAYEE.NAME', 'Page.Info', 'payee.name_check'])('"Pay at %s" in a message body is flagged', (host) => {
    expect(domains(SCENARIO, `message:\n  body: "Pay at ${host} today"\n`).length).toBeGreaterThan(0);
  });

  it('checkable names as inspectables[].target values are exempt (opening, beats, interrupts)', () => {
    const yaml = [
      'inspectables:',
      '  - { target: page.info, reveal: "x", red_flag: false }',
      '  - { target: payee.name_check, reveal: "x", red_flag: false }',
      'beats:',
      '  - id: b',
      '    inspectables: [{ target: page.address, reveal: "x", red_flag: true }]',
      'interrupts:',
      '  - id: i',
      '    inspectables: [{ target: qr.destination, reveal: "x", red_flag: true }]',
      '',
    ].join('\n');
    expect(domains(SCENARIO, yaml)).toEqual([]);
  });

  it('the exemption is path-, value- and file-bound', () => {
    // Not a known checkable in target position.
    expect(domains(SCENARIO, 'inspectables:\n  - { target: evil.info, reveal: "x", red_flag: true }\n')).toEqual(['evil.info']);
    // A known checkable under another key.
    expect(domains(SCENARIO, 'inspectables:\n  - { target: link, reveal: "page.info", red_flag: true }\n')).toEqual(['page.info']);
    // Same structure outside content/scenarios.
    expect(domains(resolve(ROOT, 'content/other.yaml'), 'inspectables:\n  - { target: page.info, reveal: "x", red_flag: true }\n')).toEqual(['page.info']);
  });
});

describe('YAML anchors, aliases and merge keys are rejected (T-2.2 rework 2)', () => {
  const SCENARIO = resolve(ROOT, 'content/scenarios/home/x.yaml');
  const yamlErrors = (file: string, yaml: string) =>
    lintText(file, yaml, cfg).filter((f) => f.severity === 'error' && /^YAML (alias|anchor|merge key)/.test(f.message));

  it('the alias probe (exempt target copied into the body) fails', () => {
    const probe = 'inspectables:\n  - target: &t page.info\n    reveal: x\nmessage:\n  body: *t\n';
    const found = yamlErrors(SCENARIO, probe);
    expect(found.map((f) => f.message).join('\n')).toMatch(/alias \*t/);
    expect(found.map((f) => f.message).join('\n')).toMatch(/anchor &t/);
    expect(found.some((f) => f.line === 5)).toBe(true);
  });

  it('merge keys fail, in any content file', () => {
    const merge = 'base: &b\n  body: "hello"\nmessage:\n  <<: *b\n';
    const msgs = yamlErrors(resolve(ROOT, 'content/other.yaml'), merge).map((f) => f.message).join('\n');
    expect(msgs).toMatch(/merge key <</);
    expect(msgs).toMatch(/alias \*b/);
  });

  it('plain YAML has no such findings', () => {
    expect(yamlErrors(SCENARIO, 'message:\n  body: "a & b * c"\n')).toEqual([]);
  });
});

// T-2.4a: schema identifiers (device enum values, pattern ids) may contain warnlisted words.

describe('schema identifiers are exempt only at their path and only when known (T-2.4a)', () => {
  const SCENARIO = resolve(ROOT, 'content/scenarios/home/x.yaml');
  const CHAPTER = resolve(ROOT, 'content/chapters/x.yaml');
  const brandHits = (file: string, yaml: string) =>
    lintText(file, yaml, cfg)
      .filter((f) => f.category === 'brand')
      .map((f) => f.match.toLowerCase());

  it('device enum values are exempt (opening message, beats, interrupts)', () => {
    const yaml = [
      'device: messenger',
      'beats:',
      '  - id: b',
      '    device: messenger',
      'interrupts:',
      '  - id: i',
      '    device: messenger',
      '',
    ].join('\n');
    expect(brandHits(SCENARIO, yaml)).toEqual([]);
  });

  it('a known pattern id is exempt in scenario pattern and chapter patterns/callbacks', () => {
    expect(brandHits(SCENARIO, 'pattern: messenger-account-takeover-code\n')).toEqual([]);
    expect(brandHits(CHAPTER, 'patterns: [messenger-account-takeover-code]\ncallbacks:\n  - messenger-account-takeover-code\n')).toEqual([]);
  });

  it('the same word in free text still warns', () => {
    expect(brandHits(SCENARIO, 'device: messenger\nmessage:\n  body: "Write to me on Messenger"\n')).toEqual(['messenger']);
    // message.prompt.device is free text, not the enum.
    expect(brandHits(SCENARIO, 'message:\n  prompt:\n    device: messenger\n')).toEqual(['messenger']);
    // An enum value under another key.
    expect(brandHits(SCENARIO, 'theme: messenger\n')).toEqual(['messenger']);
  });

  it('values that are not the enum or a known brief still warn', () => {
    expect(brandHits(SCENARIO, 'device: Messenger\n')).toEqual(['messenger']);
    expect(brandHits(SCENARIO, 'device: messenger-app-clone\n').length).toBeGreaterThan(0);
    expect(brandHits(SCENARIO, 'pattern: messenger-unknown-brief\n').length).toBeGreaterThan(0);
    expect(brandHits(CHAPTER, 'patterns: [messenger-unknown-brief]\n').length).toBeGreaterThan(0);
    // A denylisted brand as a device value is still an error.
    expect(lintText(SCENARIO, 'device: WhatsApp\n', cfg).some((f) => f.severity === 'error' && f.category === 'brand')).toBe(true);
  });

  it('the same paths outside content/scenarios and content/chapters still warn', () => {
    const other = resolve(ROOT, 'content/other.yaml');
    expect(brandHits(other, 'device: messenger\n')).toEqual(['messenger']);
    expect(brandHits(other, 'pattern: messenger-account-takeover-code\n').length).toBeGreaterThan(0);
    expect(brandHits(other, 'patterns: [messenger-account-takeover-code]\n').length).toBeGreaterThan(0);
    // Chapter-only fields do not exempt in scenarios, and vice versa.
    expect(brandHits(SCENARIO, 'patterns: [messenger-account-takeover-code]\n').length).toBeGreaterThan(0);
    expect(brandHits(CHAPTER, 'device: messenger\n')).toEqual(['messenger']);
  });
});

describe('schema identifier exemption drops only warnlist hits (T-2.4a follow-up)', () => {
  const SCENARIO = resolve(ROOT, 'content/scenarios/home/x.yaml');
  const CHAPTER = resolve(ROOT, 'content/chapters/x.yaml');
  const briefs = new Set(['whatsapp-code-theft', 'messenger-account-takeover-code']);

  it('a denylisted brand in a known pattern id still errors', () => {
    for (const [file, yaml] of [
      [SCENARIO, 'pattern: whatsapp-code-theft\n'],
      [CHAPTER, 'patterns: [whatsapp-code-theft]\n'],
      [CHAPTER, 'callbacks:\n  - whatsapp-code-theft\n'],
    ] as const) {
      const found = lintText(file, yaml, cfg, briefs);
      expect(found.some((f) => f.severity === 'error' && f.category === 'brand' && /whatsapp/i.test(f.match))).toBe(true);
    }
  });

  it('warnlist hits in the same position are still dropped', () => {
    expect(lintText(SCENARIO, 'pattern: messenger-account-takeover-code\n', cfg, briefs).filter((f) => f.category === 'brand')).toEqual([]);
  });
});
