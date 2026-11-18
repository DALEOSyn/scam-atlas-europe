/**
 * Node-side content loading and cross-reference validation.
 * Used by `npm run content:validate`, the Vite build plugin and Vitest.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep, basename, dirname } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import {
  brandsFileSchema,
  scenarioSchema,
  sourcesFileSchema,
  type Brand,
  type Scenario,
  type Source,
} from '../../src/content/schema.ts';

export interface ContentReport {
  errors: string[];
  warnings: string[];
  scenarios: Map<string, Scenario>;
}

export function listFiles(dir: string, exts: readonly string[]): string[] {
  if (!existsSync(dir)) return [];
  if (statSync(dir).isFile()) return [dir];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((p) => join(dir, p))
    .filter((p) => exts.some((e) => p.endsWith(e)) && statSync(p).isFile())
    .sort();
}

function formatIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((i) => `${file}: ${i.path.join('.') || '(root)'}: ${i.message}`);
}

function readYaml(file: string): unknown {
  return parse(readFileSync(file, 'utf8'));
}

export function loadBrands(contentDir: string, report: ContentReport): Map<string, Brand> {
  const file = join(contentDir, 'brands.yaml');
  const out = new Map<string, Brand>();
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return out;
  }
  const res = brandsFileSchema.safeParse(readYaml(file));
  if (!res.success) {
    report.errors.push(...formatIssues(file, res.error));
    return out;
  }
  for (const b of res.data.brands) {
    if (out.has(b.id)) report.errors.push(`${file}: duplicate brand id "${b.id}"`);
    out.set(b.id, b);
  }
  return out;
}

export function loadSources(contentDir: string, report: ContentReport): Map<string, Source> {
  const file = join(contentDir, 'sources.yaml');
  const out = new Map<string, Source>();
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return out;
  }
  const res = sourcesFileSchema.safeParse(readYaml(file));
  if (!res.success) {
    report.errors.push(...formatIssues(file, res.error));
    return out;
  }
  for (const s of res.data.sources) {
    if (out.has(s.id)) report.errors.push(`${file}: duplicate source id "${s.id}"`);
    out.set(s.id, s);
  }
  return out;
}

/** Validate a single scenario object (already parsed) against schema + registries. */
export function checkScenario(
  file: string,
  raw: unknown,
  brands: Map<string, Brand>,
  sources: Map<string, Source>,
  report: ContentReport,
  opts: { strict?: boolean; expectedChapter?: string } = {},
): Scenario | undefined {
  const res = scenarioSchema.safeParse(raw);
  if (!res.success) {
    report.errors.push(...formatIssues(file, res.error));
    return undefined;
  }
  const s = res.data;
  if (opts.expectedChapter !== undefined && s.chapter !== opts.expectedChapter) {
    report.errors.push(`${file}: chapter "${s.chapter}" does not match its folder "${opts.expectedChapter}"`);
  }
  for (const id of s.debrief.sources) {
    const src = sources.get(id);
    if (!src) report.errors.push(`${file}: debrief.sources: unknown source id "${id}" (add it to content/sources.yaml)`);
    else if (src.placeholder) {
      (opts.strict ? report.errors : report.warnings).push(`${file}: debrief.sources: "${id}" is still a placeholder source`);
    }
  }
  for (const id of s.brands) {
    const b = brands.get(id);
    if (!b) report.errors.push(`${file}: brands: unknown brand id "${id}" (add it to content/brands.yaml)`);
    else if (b.placeholder) {
      (opts.strict ? report.errors : report.warnings).push(`${file}: brands: "${id}" is still a placeholder brand`);
    }
  }
  return s;
}

export function validateContent(contentDir: string, opts: { strict?: boolean } = {}): ContentReport {
  const report: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
  const brands = loadBrands(contentDir, report);
  const sources = loadSources(contentDir, report);
  const scenarioDir = join(contentDir, 'scenarios');
  const files = listFiles(scenarioDir, ['.yaml', '.yml']);
  if (files.length === 0) report.warnings.push(`${scenarioDir}: no scenarios found`);
  for (const file of files) {
    const rel = relative(scenarioDir, file);
    if (rel.split(sep).length !== 2) {
      report.errors.push(`${file}: scenarios must live at content/scenarios/<chapter>/<file>.yaml`);
      continue;
    }
    let raw: unknown;
    try {
      raw = readYaml(file);
    } catch (e) {
      report.errors.push(`${file}: YAML parse error: ${(e as Error).message}`);
      continue;
    }
    const s = checkScenario(file, raw, brands, sources, report, {
      strict: opts.strict,
      expectedChapter: basename(dirname(file)),
    });
    if (!s) continue;
    const prev = report.scenarios.get(s.id);
    if (prev) report.errors.push(`${file}: duplicate scenario id "${s.id}"`);
    report.scenarios.set(s.id, s);
  }
  return report;
}
