/**
 * Node-side content loading and cross-reference validation.
 * Used by `npm run content:validate`, the Vite build plugin and Vitest.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep, basename, dirname } from 'node:path';
import { parse } from 'yaml';
import type { z } from 'zod';
import { isAllowedSourceHost } from './source-hosts.ts';
import {
  brandsFileSchema,
  i18nCatalogueSchema,
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
    for (const host of brandHosts(b)) {
      if (!FICTIONAL_HOST.test(host)) {
        report.errors.push(`${file}: brand "${b.id}": "${host}" must end in .example, .test or .invalid (Red Line 3)`);
      }
    }
  }
  return out;
}

/** Hosts in the registry must be non-routable (Red Line 3). Also enforced by redline:lint on brands.yaml. */
const FICTIONAL_HOST = /\.(example|test|invalid)$/i;

/** Host part of a domain, URL-ish string ("host/path") or email address. */
function hostOf(value: string): string {
  const afterAt = value.includes('@') ? value.slice(value.lastIndexOf('@') + 1) : value;
  return (afterAt.split('/')[0] ?? afterAt).trim();
}

/**
 * Every host a brand entry declares, from parsed, typed data: domain,
 * sub-brand domains, email addresses and look-alikes (plain strings and
 * {host, display_text_only} objects alike).
 */
export function brandHosts(b: Brand): string[] {
  const values: string[] = [];
  if (b.domain) values.push(b.domain);
  for (const sb of b.sub_brands ?? []) if (sb.domain) values.push(sb.domain);
  values.push(...(b.email_addresses ?? []));
  for (const l of b.lookalike_examples ?? []) values.push(typeof l === 'string' ? l : l.host);
  return values.map(hostOf);
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
    if (s.url && !isAllowedSourceHost(s.url)) {
      report.warnings.push(`${file}: source "${s.id}" host is not on the reputable-source host list (scripts/lib/source-hosts.ts): ${s.url}`);
    }
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

/** content/i18n/<locale>/*.json: schema, and every locale has exactly the English keys. */
export function validateI18n(contentDir: string, report: ContentReport): void {
  const root = join(contentDir, 'i18n');
  const files = listFiles(root, ['.json']);
  if (!files.some((f) => relative(root, f).startsWith(`en${sep}`))) {
    report.errors.push(`${root}: missing English source catalogue (content/i18n/en/*.json)`);
  }
  const keysByFile = new Map<string, Set<string>>();
  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      report.errors.push(`${file}: JSON parse error: ${(e as Error).message}`);
      continue;
    }
    const res = i18nCatalogueSchema.safeParse(raw);
    if (!res.success) {
      report.errors.push(...formatIssues(file, res.error));
      continue;
    }
    keysByFile.set(relative(root, file), new Set(Object.keys(res.data)));
  }
  for (const [rel, keys] of keysByFile) {
    const [locale, ...rest] = rel.split(sep);
    if (locale === 'en') continue;
    const source = keysByFile.get(['en', ...rest].join(sep));
    if (!source) {
      report.errors.push(`${join(root, rel)}: no English source catalogue en/${rest.join('/')}`);
      continue;
    }
    for (const k of source) if (!keys.has(k)) report.warnings.push(`${join(root, rel)}: missing translation "${k}"`);
    for (const k of keys) if (!source.has(k)) report.errors.push(`${join(root, rel)}: unknown key "${k}" (not in English source)`);
  }
}

export function validateContent(contentDir: string, opts: { strict?: boolean } = {}): ContentReport {
  const report: ContentReport = { errors: [], warnings: [], scenarios: new Map() };
  validateI18n(contentDir, report);
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
