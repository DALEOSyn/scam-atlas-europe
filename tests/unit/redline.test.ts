import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { lintPaths, lintText, loadConfig } from '../../scripts/redline-lint.ts';
import {
  findBrands,
  compileDenylist,
  findDomains,
  findIbans,
  findPhones,
  findUrls,
  findMarkup,
  checkQrPayload,
  ibanChecksumValid,
  isFictionalPhone,
  scanText,
  type Category,
} from '../../scripts/redline/rules.ts';

const ROOT = resolve(import.meta.dirname, '..', '..');
const FIX = resolve(ROOT, 'tests/fixtures/redline');
const cfg = loadConfig();

function categories(file: string): Category[] {
  return lintPaths([resolve(FIX, file)], cfg).map((f) => f.category);
}

describe('redline:lint fixtures', () => {
  const cases: [string, Category][] = [
    ['bad-domain.yaml', 'domain'],
    ['bad-url.yaml', 'url'],
    ['bad-markup.yaml', 'markup'],
    ['bad-iban.yaml', 'iban'],
    ['bad-phone.yaml', 'phone'],
    ['bad-brand.yaml', 'brand'],
    ['bad-brand-homoglyph.yaml', 'brand'],
    ['bad-escaped.yaml', 'domain'],
    ['bad-qr.yaml', 'qr'],
  ];
  it.each(cases)('%s is caught as %s', (file, category) => {
    expect(categories(file)).toContain(category);
  });

  it('bad-domain.yaml catches both the email domain and the link', () => {
    const matches = lintPaths([resolve(FIX, 'bad-domain.yaml')], cfg).map((f) => f.match);
    expect(matches).toEqual(expect.arrayContaining(['parcel-help.com', 'paketpilot-zoll.de']));
  });

  it('bad-phone.yaml catches international, 0-prefixed and bare 9-digit numbers', () => {
    const phones = lintPaths([resolve(FIX, 'bad-phone.yaml')], cfg).filter((f) => f.category === 'phone');
    expect(phones.map((f) => f.match)).toEqual(expect.arrayContaining(['+49 30 12345678', '0612 345 678', '612 345 678']));
  });

  it('bad-brand.yaml matches case-insensitively', () => {
    const brands = lintPaths([resolve(FIX, 'bad-brand.yaml')], cfg).filter((f) => f.category === 'brand');
    expect(brands.map((f) => f.match)).toEqual(expect.arrayContaining(['paypal', 'dhl']));
  });

  it('bad-escaped.yaml is only visible after YAML decoding', () => {
    const raw = readFileSync(resolve(FIX, 'bad-escaped.yaml'), 'utf8');
    expect(raw).toContain('zoll' + String.fromCharCode(92) + 'u002Ecom');
    expect(scanText(raw, cfg).filter((f) => f.category === 'domain')).toEqual([]);
    expect(lintText('bad-escaped.yaml', raw, cfg).map((f) => f.match)).toContain('paketpilot-zoll.com');
  });

  it('clean.yaml (tricky but allowed) has no findings', () => {
    expect(lintPaths([resolve(FIX, 'clean.yaml')], cfg)).toEqual([]);
  });

  it('every fixture category of the linter is covered', () => {
    const all = new Set(cases.map(([, c]) => c));
    expect([...all].sort()).toEqual(['brand', 'domain', 'iban', 'markup', 'phone', 'qr', 'url']);
  });
});

describe('redline:lint on real content', () => {
  it('content/ (incl. the example scenario) passes', () => {
    expect(lintPaths([resolve(ROOT, 'content')], cfg)).toEqual([]);
  });

  it('the denylist is seeded with at least 40 names', () => {
    expect(cfg.denylist.length).toBeGreaterThanOrEqual(40);
  });

  it('the domain allowlist is empty at Phase 1', () => {
    expect(cfg.domainAllowlist).toEqual([]);
  });

  it('reports line numbers', () => {
    const f = lintText('x.yaml', 'a: ok\nb: "visit bank.com"\n', cfg);
    expect(f[0]?.line).toBe(2);
  });
});

describe('rules', () => {
  it('domains: fictional TLDs pass, real TLDs and URL-shaped tokens fail', () => {
    expect(findDomains('a.example b.test c.invalid sender.detail invoice.pdf 1.99', [])).toEqual([]);
    expect(findDomains('bank.md invoice.zip x.shop', []).map((f) => f.match)).toEqual(['bank.md', 'invoice.zip', 'x.shop']);
    expect(findDomains('bank.zoll/login', []).map((f) => f.match)).toEqual(['bank.zoll']);
  });

  it('domains: allowlist covers the domain and its subdomains only', () => {
    expect(findDomains('report.gov.example.org www.report.org', ['report.org'])).toHaveLength(1);
    expect(findDomains('notreport.org', ['report.org'])).toHaveLength(1);
  });

  it('urls and markup', () => {
    expect(findUrls('see http://x.example and HTTPS://y.test')).toHaveLength(2);
    expect(findUrls('javascript:alert(1)')).toHaveLength(1);
    expect(findMarkup('<FORM class="x" Action = "/a">')).toHaveLength(1);
    expect(findMarkup('<form onsubmit="x">')).toHaveLength(0);
    expect(findMarkup('<script src="a.js">')).toHaveLength(1);
  });

  it('iban: mod-97 checksum', () => {
    expect(ibanChecksumValid('DE89370400440532013000')).toBe(true);
    expect(ibanChecksumValid('GB82WEST12345698765432')).toBe(true);
    expect(ibanChecksumValid('DE00370400440532013000')).toBe(false);
    expect(findIbans('DE89370400440532013000')).toHaveLength(1);
    expect(findIbans('gb82west12345698765432')).toHaveLength(1);
    expect(findIbans('DE89 3704 0044 0532 0130 00 EXTRA')).toHaveLength(1);
    expect(findIbans('DE00 3704 0044 0532 0130 00')).toHaveLength(0);
  });

  it('phones: masked and fiction-reserved numbers pass', () => {
    expect(findPhones('+49 ••• ••• 0173, +44 7700 900 123, 01632 960 001, +49 30 xx xx 12')).toEqual([]);
    expect(findPhones('on 2026-11-18 at 10:30, ref 18.11.2026')).toEqual([]);
    expect(isFictionalPhone('+44 7700 900123')).toBe(true);
    expect(isFictionalPhone('07700 900123')).toBe(true);
    expect(isFictionalPhone('07700 800123')).toBe(false);
    expect(findPhones('call (030) 1234567')).toHaveLength(1);
    expect(findPhones('call 0049 30 1234567')).toHaveLength(1);
  });

  it('brands: whole word only', () => {
    const re = compileDenylist(['ING', 'Deutsche Bank', 'UPS']);
    expect(findBrands('during the morning', re)).toEqual([]);
    expect(findBrands('ups and downs', re)).toHaveLength(1);
    expect(findBrands('Deutsche-Bank login', re)).toHaveLength(1);
    expect(findBrands('pay ING now', re)).toHaveLength(1);
  });

  it('qr payloads must be in-game routes', () => {
    expect(checkQrPayload('/qr/lisbon-parking-01')).toEqual([]);
    expect(checkQrPayload('https://x.example')).toHaveLength(1);
    expect(checkQrPayload('/qr/../admin')).toHaveLength(1);
  });
});
