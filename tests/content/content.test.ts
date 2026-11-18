import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { validateContent, checkScenario, type ContentReport } from '../../scripts/lib/content.ts';
import { scenarioSchema } from '../../src/content/schema.ts';

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

  it('strict mode rejects placeholder sources and brands', () => {
    const r = validateContent(CONTENT, { strict: true });
    expect(r.errors.some((e) => e.includes('placeholder source'))).toBe(true);
    expect(r.errors.some((e) => e.includes('placeholder brand'))).toBe(true);
  });

  it('the scenario template itself matches the schema', () => {
    const tpl = parse(readFileSync(resolve(ROOT, 'templates/scenario.template.yaml'), 'utf8'));
    const res = scenarioSchema.safeParse(tpl);
    expect(res.success ? [] : res.error.issues).toEqual([]);
  });
});

describe('scenario cross-checks', () => {
  const brands = new Map([['paketpilot', { id: 'paketpilot', name: 'PaketPilot', kind: 'courier' as const, placeholder: false }]]);
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
