/**
 * Node-side content loading and cross-reference validation.
 * Used by `npm run content:validate`, the Vite build plugin and Vitest.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep, basename, dirname } from 'node:path';
import { parseDocument } from 'yaml';
import { yamlStructureIssues } from './yaml-safety.ts';
import type { z } from 'zod';
import { isAllowedSourceHost } from './source-hosts.ts';
import { chapterRules, padlockRevealIssues, scenarioRules, unregisteredHostIssues, type Registries } from './rules.ts';
import {
  balanceSchema,
  brandsFileSchema,
  castFileSchema,
  FICTIONAL_HOST,
  chapterSchema,
  habitCardsFileSchema,
  i18nCatalogueSchema,
  recoveryStepsFileSchema,
  scenarioSchema,
  sourcesFileSchema,
  type Balance,
  type Brand,
  type CastMember,
  type Chapter,
  type HabitCard,
  type Scenario,
  type Source,
} from '../../src/content/schema.ts';

export interface ContentReport {
  errors: string[];
  warnings: string[];
  scenarios: Map<string, Scenario>;
  chapters?: Map<string, Chapter>;
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

/** Parse a content YAML file; throws on syntax errors and on anchors, aliases or merge keys. */
export function readYaml(file: string): unknown {
  const doc = parseDocument(readFileSync(file, 'utf8'), { uniqueKeys: true, merge: false });
  if (doc.errors.length > 0) throw new Error(doc.errors[0]?.message ?? 'invalid YAML');
  const issues = yamlStructureIssues(doc);
  if (issues.length > 0) throw new Error(issues.map((i) => i.message).join('; '));
  return doc.toJS();
}

export function loadBrands(contentDir: string, report: ContentReport): Map<string, Brand> {
  const file = join(contentDir, 'brands.yaml');
  const out = new Map<string, Brand>();
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return out;
  }
  let raw: unknown;
  try {
    raw = readYaml(file);
  } catch (e) {
    report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
    return out;
  }
  const res = brandsFileSchema.safeParse(raw);
  if (!res.success) {
    report.errors.push(...formatIssues(file, res.error));
    return out;
  }
  for (const b of res.data.brands) {
    if (out.has(b.id)) report.errors.push(`${file}: duplicate brand id "${b.id}"`);
    out.set(b.id, b);
    // Hosts in the registry must be non-routable (Red Line 3; FICTIONAL_HOST in schema.ts). Also linted by redline:lint.
    for (const { host, displayTextOnly } of brandHostEntries(b)) {
      // Display-only look-alikes may use capital-letter homoglyphs (trundIe); everything else is a lowercase host.
      if (!FICTIONAL_HOST.test(displayTextOnly ? host.toLowerCase() : host)) {
        report.errors.push(
          `${file}: brand "${b.id}": "${host}" must be a lowercase host ending in .example, .test or .invalid (Red Line 3)`,
        );
      }
    }
  }
  return out;
}

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
  return brandHostEntries(b).map((e) => e.host);
}

export function brandHostEntries(b: Brand): { host: string; displayTextOnly: boolean }[] {
  const values: { value: string; displayTextOnly: boolean }[] = [];
  const plain = (value: string) => values.push({ value, displayTextOnly: false });
  if (b.domain) plain(b.domain);
  for (const sb of b.sub_brands ?? []) if (sb.domain) plain(sb.domain);
  for (const e of b.email_addresses ?? []) plain(e);
  for (const l of b.lookalike_examples ?? []) {
    values.push(typeof l === 'string' ? { value: l, displayTextOnly: false } : { value: l.host, displayTextOnly: l.display_text_only });
  }
  return values.map(({ value, displayTextOnly }) => ({ host: hostOf(value), displayTextOnly }));
}

export function loadSources(contentDir: string, report: ContentReport): Map<string, Source> {
  const file = join(contentDir, 'sources.yaml');
  const out = new Map<string, Source>();
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return out;
  }
  let raw: unknown;
  try {
    raw = readYaml(file);
  } catch (e) {
    report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
    return out;
  }
  const res = sourcesFileSchema.safeParse(raw);
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

/** Every host content/brands.yaml registers (domains, sub-brand domains, e-mail domains, look-alikes), lowercased. */
export function registeredHosts(brands: Map<string, Brand>): Set<string> {
  return new Set([...brands.values()].flatMap((b) => brandHosts(b).map((h) => h.toLowerCase())));
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
  report.errors.push(...unregisteredHostIssues(s, registeredHosts(brands)).map((e) => `${file}: ${e}`));
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

/** Parse one YAML registry file against its schema; undefined (and an error) when missing or invalid. */
function loadYamlFile<T>(file: string, schema: z.ZodType<T>, report: ContentReport): T | undefined {
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return undefined;
  }
  let raw: unknown;
  try {
    raw = readYaml(file);
  } catch (e) {
    report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
    return undefined;
  }
  const res = schema.safeParse(raw);
  if (!res.success) {
    report.errors.push(...formatIssues(file, res.error));
    return undefined;
  }
  return res.data;
}

function uniqueMap<T extends { id: string }>(file: string, kind: string, items: T[], report: ContentReport): Map<string, T> {
  const out = new Map<string, T>();
  for (const it of items) {
    if (out.has(it.id)) report.errors.push(`${file}: duplicate ${kind} id "${it.id}"`);
    out.set(it.id, it);
  }
  return out;
}

export function loadBalance(contentDir: string, report: ContentReport): Balance | undefined {
  return loadYamlFile(join(contentDir, 'balance.yaml'), balanceSchema, report);
}

export function loadCast(contentDir: string, report: ContentReport): Map<string, CastMember> {
  const file = join(contentDir, 'cast.yaml');
  return uniqueMap(file, 'cast', loadYamlFile(file, castFileSchema, report)?.cast ?? [], report);
}

export function loadRecoverySteps(contentDir: string, report: ContentReport): Set<string> {
  const file = join(contentDir, 'recovery_steps.yaml');
  return new Set(uniqueMap(file, 'recovery step', loadYamlFile(file, recoveryStepsFileSchema, report)?.steps ?? [], report).keys());
}

/** Recovery steps that carry a harmful-pick feedback line (GDD §9). */
export function loadRecoveryFeedback(contentDir: string, report: ContentReport): Set<string> {
  const file = join(contentDir, 'recovery_steps.yaml');
  return new Set((loadYamlFile(file, recoveryStepsFileSchema, report)?.steps ?? []).filter((s) => s.feedback).map((s) => s.id));
}

export function loadHabitCards(contentDir: string, report: ContentReport, los: Set<string> | undefined): Map<string, HabitCard> {
  const file = join(contentDir, 'habit_cards.yaml');
  const cards = uniqueMap(file, 'habit card', loadYamlFile(file, habitCardsFileSchema, report)?.cards ?? [], report);
  const byLo = new Map<string, string>();
  for (const c of cards.values()) {
    if (los && !los.has(c.lo)) report.errors.push(`${file}: card "${c.id}": ${c.lo} is not in docs/LEARNING_OBJECTIVES.md`);
    const other = byLo.get(c.lo);
    if (other) report.errors.push(`${file}: cards "${other}" and "${c.id}" both teach ${c.lo} (one card per objective)`);
    byLo.set(c.lo, c.id);
  }
  return cards;
}

/** LO ids from the table rows of docs/LEARNING_OBJECTIVES.md; undefined when the docs are not present. */
export function loadLearningObjectives(docsDir: string): Set<string> | undefined {
  const file = join(docsDir, 'LEARNING_OBJECTIVES.md');
  if (!existsSync(file)) return undefined;
  return new Set([...readFileSync(file, 'utf8').matchAll(/^\| (LO-\d{2}) \|/gm)].map((m) => m[1] ?? ''));
}

/** Pattern briefs docs/patterns/<id>.md (lowercase file names only; BRAND_CHECK.md etc. are not patterns). */
export function loadPatternIds(docsDir: string): Set<string> | undefined {
  const dir = join(docsDir, 'patterns');
  if (!existsSync(dir)) return undefined;
  return new Set(readdirSync(dir).filter((f) => /^[a-z0-9-]+\.md$/.test(f)).map((f) => f.slice(0, -3)));
}

function loadChapters(contentDir: string, report: ContentReport): Map<string, { file: string; chapter: Chapter }> {
  const out = new Map<string, { file: string; chapter: Chapter }>();
  for (const file of listFiles(join(contentDir, 'chapters'), ['.yaml', '.yml'])) {
    const chapter = loadYamlFile(file, chapterSchema, report);
    if (!chapter) continue;
    const base = basename(file).replace(/\.ya?ml$/, '');
    if (out.has(base)) report.errors.push(`${file}: duplicate chapter "${base}"`);
    out.set(base, { file, chapter });
  }
  const slots = new Map<number, string>();
  for (const [base, { file, chapter }] of out) {
    const other = slots.get(chapter.slot);
    if (other) report.errors.push(`${file}: slot ${chapter.slot} is also used by chapter "${other}"`);
    slots.set(chapter.slot, base);
  }
  return out;
}

export interface ValidateOptions {
  strict?: boolean;
  /** Where LEARNING_OBJECTIVES.md and patterns/ live; defaults to <contentDir>/../docs. */
  docsDir?: string;
}

export function validateContent(contentDir: string, opts: ValidateOptions = {}): ContentReport {
  const report: ContentReport = { errors: [], warnings: [], scenarios: new Map(), chapters: new Map() };
  validateI18n(contentDir, report);
  const brands = loadBrands(contentDir, report);
  const sources = loadSources(contentDir, report);
  const docsDir = opts.docsDir ?? join(contentDir, '..', 'docs');
  const los = loadLearningObjectives(docsDir);
  if (!los) report.warnings.push(`${docsDir}/LEARNING_OBJECTIVES.md not found: learning objective ids are not checked`);
  const patterns = loadPatternIds(docsDir);
  const balance = loadBalance(contentDir, report);
  const cast = loadCast(contentDir, report);
  const recoverySteps = loadRecoverySteps(contentDir, report);
  const recoveryFeedback = loadRecoveryFeedback(contentDir, { errors: [], warnings: [], scenarios: new Map(), chapters: new Map() });
  const habitCards = loadHabitCards(contentDir, report, los);
  const chapters = loadChapters(contentDir, report);

  const scenarioDir = join(contentDir, 'scenarios');
  const files = listFiles(scenarioDir, ['.yaml', '.yml']);
  if (files.length === 0) report.warnings.push(`${scenarioDir}: no scenarios found`);
  const fileOf = new Map<string, string>();
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
      report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
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
    fileOf.set(s.id, file);
  }

  // Rules that need balance.yaml and the registries.
  if (!balance) return report;
  const all = [...report.scenarios.values()];
  const reg: Registries = {
    balance,
    cast,
    recoverySteps,
    recoveryFeedback,
    habitCards,
    los,
    patterns,
    flagsSet: new Set(all.flatMap((s) => Object.values(s.outcomes).flatMap((o) => o.sets_flags ?? []))),
    arcVars: new Set(all.flatMap((s) => Object.values(s.outcomes).flatMap((o) => Object.keys(o.arc_effects ?? {})))),
  };
  for (const s of all) {
    const file = fileOf.get(s.id) ?? s.id;
    const r = scenarioRules(s, reg);
    report.errors.push(...r.errors.map((e) => `${file}: ${e}`));
    report.warnings.push(...r.warnings.map((w) => `${file}: ${w}`));
  }
  for (const p of padlockRevealIssues(all)) report.errors.push(`${fileOf.get(p.id) ?? p.id}: ${p.message}`);
  for (const [base, { file, chapter }] of chapters) {
    report.chapters?.set(chapter.city, chapter);
    const r = chapterRules(chapter, base, all.filter((s) => s.chapter === chapter.city), reg);
    report.errors.push(...r.errors.map((e) => `${file}: ${e}`));
    report.warnings.push(...r.warnings.map((w) => `${file}: ${w}`));
  }
  for (const s of all) {
    if (!chapters.has(s.chapter)) report.errors.push(`${fileOf.get(s.id) ?? s.id}: chapter "${s.chapter}" has no content/chapters/${s.chapter}.yaml`);
  }
  return report;
}
