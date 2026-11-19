/**
 * The brand registry the engine fixtures are checked against: content/brands.yaml plus the test-only
 * register entries in tests/fixtures/brands-register.yaml (CR-38), exactly as the e2e harness merges them.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { loadBrands, type ContentReport } from '../../../scripts/lib/content.ts';
import { brandsFileSchema, type Brand } from '../../../src/content/schema.ts';
import { CONTENT, ROOT } from '../../content/fixtures.ts';

export const FIXTURE_BRANDS_FILE = resolve(ROOT, 'tests', 'fixtures', 'brands-register.yaml');

export function fixtureBrandList(): Brand[] {
  return brandsFileSchema.parse(parse(readFileSync(FIXTURE_BRANDS_FILE, 'utf8'))).brands;
}

export function fixtureBrands(report: ContentReport = { errors: [], warnings: [], scenarios: new Map() }): Map<string, Brand> {
  const out = loadBrands(CONTENT, report);
  for (const b of fixtureBrandList()) out.set(b.id, b);
  return out;
}

export const FIXTURE_DIR = join(ROOT, 'tests', 'fixtures', 'scenarios');
