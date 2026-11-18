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
  scanText,
  type Category,
  type Finding,
} from '../../scripts/redline/rules.ts';
import { compileList, parseList } from '../../scripts/redline/lists.ts';

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
  ];
  it.each(cases)('%s is caught as %s', (file, category) => {
    expect(categories(file)).toContain(category);
  });

  it('every error category of the linter has a fixture', () => {
    expect([...new Set(cases.map(([, c]) => c))].sort()).toEqual(['brand', 'domain', 'iban', 'markup', 'phone', 'qr', 'url']);
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
  });

  it('lists are well-formed and large enough', () => {
    expect(cfg.problems).toEqual([]);
    expect(cfg.denyCount).toBeGreaterThanOrEqual(250);
    expect(cfg.warnCount).toBeGreaterThan(0);
  });

  it('the domain allowlist is empty at Phase 1', () => {
    expect(cfg.domainAllowlist).toEqual([]);
  });

  it('source ids may name real publishers, other fields may not', () => {
    const yaml = 'debrief:\n  sources: [europol-scam-smishing]\n  habit: "Europol says hi"\n';
    const found = lintText('x.yaml', yaml, cfg).filter((f) => f.category === 'brand');
    expect(found.map((f) => f.line)).toEqual([3]);
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
