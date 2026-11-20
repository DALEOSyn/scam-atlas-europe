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
import { checkHelp, HELP_FILE_REL } from './help.ts';
import { svgSafetyIssues } from './svg-safety.ts';
import { artIssues, castListIssues } from './art.ts';
import { castByChapter, loadScenes, sceneRules, sceneSetRules, sceneWarnings } from './scenes.ts';
import { beatsOf, chapterRules, padlockRevealIssues, scenarioRules, unregisteredHostIssues, type Registries } from './rules.ts';
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
  type Scene,
  type Source,
} from '../../src/content/schema.ts';

export interface ContentReport {
  errors: string[];
  warnings: string[];
  scenarios: Map<string, Scenario>;
  chapters?: Map<string, Chapter>;
  /** Story scenes (S3), by id. */
  scenes?: Map<string, Scene>;
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

/** A bank-sector brand: its registry `sector` names a bank ("retail bank (player's own bank)"). CR-27. */
export function isBankBrand(b: Brand): boolean {
  return /\bbank\b/iu.test(b.sector ?? '');
}

/**
 * CR-38: a Fairmeasure result card agrees with the register in content/brands.yaml (`register` on a brand):
 * an authorised firm is on the register and shows the register's own address and phone; a warning-list firm
 * is on the warning list; a firm "not on the register" has no entry at all.
 */
export function registerCardIssues(s: Scenario, brands: Map<string, Brand>): string[] {
  const out: string[] = [];
  const entryOf = (firm: string) => [...brands.values()].find((b) => b.register && (b.name === firm || b.short_name === firm));
  for (const [key, o] of Object.entries(s.outcomes)) {
    const card = o.register;
    if (!card) continue;
    const at = `outcomes.${key}.register`;
    const b = entryOf(card.firm);
    if (card.result === 'not_listed') {
      if (b) out.push(`${at}: "${card.firm}" is ${b.register?.status === 'authorised' ? 'on the register' : 'on the warning list'} in content/brands.yaml, not "not_listed" (CR-38)`);
      continue;
    }
    if (!b || b.register?.status !== card.result) {
      out.push(`${at}: "${card.firm}" must be a brand with register.status: ${card.result} in content/brands.yaml (CR-38)`);
      continue;
    }
    if (card.result === 'authorised') {
      for (const k of ['address', 'phone'] as const) {
        const want = b.register[k];
        if (want !== undefined && card[k] !== want) out.push(`${at}.${k}: shows the register's own ${k} for "${card.firm}": "${want}" (CR-38)`);
        if (want === undefined && card[k] !== undefined) out.push(`${at}.${k}: the register lists no ${k} for "${card.firm}" in content/brands.yaml (CR-38)`);
      }
    }
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
  // T-4.6 (sceptic PR #72): the runtime finds a scenario by its file name (src/content/scenarios.ts
  // findScenarioRef), so a file whose name differs from its id would never load. The name must be the id.
  const fileId = basename(file).replace(/\.ya?ml$/, '');
  if (fileId !== s.id) {
    report.errors.push(`${file}: file name "${basename(file)}" does not match the scenario id "${s.id}" (name the file "${s.id}.yaml"; the game loads scenarios by file name)`);
  }
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
  // CR-27: a banking header brand must be a bank-sector brand (registry `sector` names a bank) or one
  // of its sub-brands, e.g. a bank's business app.
  const bankIds = new Set([...brands.values()].filter(isBankBrand).flatMap((b) => [b.id, ...(b.sub_brands ?? []).map((x) => x.id)]));
  for (const b of beatsOf(s)) {
    const id = b.message.bank?.brand;
    if (id && !bankIds.has(id)) report.errors.push(`${file}: ${b.where}: message.bank.brand "${id}" is not a bank brand or a bank's sub-brand in content/brands.yaml`);
  }
  // CR-33: the marketplace header is a registered brand the scenario lists; a system notice speaks as that app.
  for (const b of beatsOf(s)) {
    const id = b.message.app?.brand;
    if (!id) continue;
    const brand = brands.get(id);
    if (!brand) report.errors.push(`${file}: ${b.where}: message.app.brand "${id}" is not a brand in content/brands.yaml (CR-33)`);
    else if (!s.brands.includes(id)) report.errors.push(`${file}: ${b.where}: message.app.brand "${id}" must be in the scenario's brands (CR-33)`);
    if (brand && b.message.notice && b.message.sender?.display !== brand.name) report.errors.push(`${file}: ${b.where}: a notice comes from the app itself: sender.display must be "${brand.name}" (CR-33)`);
  }
  report.errors.push(...registerCardIssues(s, brands).map((e) => `${file}: ${e}`));
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

/**
 * T-4.2: the "Where to report and get help" data (content/help/where-to-report.en.yaml), checked by scripts/lib/help.ts.
 * Any other file under content/help/ is an error: the real-name exemption covers that one file only.
 */
export function loadHelp(contentDir: string, sources: Map<string, Source>, report: ContentReport): void {
  const file = join(contentDir, 'help', basename(HELP_FILE_REL));
  const helpDir = dirname(file);
  for (const other of listFiles(helpDir, ['.yaml', '.yml', '.json'])) {
    if (other !== file) report.errors.push(`${other}: only ${HELP_FILE_REL} may live in content/help/ (single-file red-line exemption)`);
  }
  if (!existsSync(file)) {
    report.errors.push(`${file}: missing`);
    return;
  }
  let raw: unknown;
  try {
    raw = readYaml(file);
  } catch (e) {
    report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
    return;
  }
  report.errors.push(...checkHelp(raw, sources).errors.map((e) => `${file}: ${e}`));
}

export function validateContent(contentDir: string, opts: ValidateOptions = {}): ContentReport {
  const report: ContentReport = { errors: [], warnings: [], scenarios: new Map(), chapters: new Map(), scenes: new Map() };
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
  loadHelp(contentDir, sources, report);

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
  const publicRoot = join(contentDir, '..');
  for (const s of all) for (const m of videoAssetIssues(s, publicRoot)) report.errors.push(`${fileOf.get(s.id) ?? s.id}: ${m}`);
  for (const [base, { file, chapter }] of chapters) {
    report.chapters?.set(chapter.city, chapter);
    const r = chapterRules(chapter, base, all.filter((s) => s.chapter === chapter.city), reg);
    report.errors.push(...r.errors.map((e) => `${file}: ${e}`));
    report.warnings.push(...r.warnings.map((w) => `${file}: ${w}`));
  }
  for (const s of all) {
    if (!chapters.has(s.chapter)) report.errors.push(`${fileOf.get(s.id) ?? s.id}: chapter "${s.chapter}" has no content/chapters/${s.chapter}.yaml`);
  }
  // CR-43(d): finale scenes may also show a panel on an arc variable (if_flag: alex_invested, set by arc_effects).
  validateScenes(contentDir, docsDir, report, { cast, chapters, flagsSet: new Set([...reg.flagsSet, ...reg.arcVars]), habitCards: new Set(habitCards.keys()) });
  return report;
}

/**
 * Story scenes (S3) and the story-layer art. The engine runs with zero scenes; with none, only the art
 * under public/art is checked (budget, file rules, rig contract).
 */
export function validateScenes(
  contentDir: string,
  docsDir: string,
  report: ContentReport,
  reg: { cast: Map<string, CastMember>; chapters: Map<string, { file: string; chapter: Chapter }>; flagsSet: ReadonlySet<string>; habitCards: ReadonlySet<string> },
  publicDir = join(contentDir, '..', 'public'),
): void {
  const scenesDir = join(contentDir, 'scenes');
  const scenes = loadScenes(scenesDir, listFiles(scenesDir, ['.yaml', '.yml']), readYaml, report);
  const byCity = new Map([...reg.chapters.values()].map(({ chapter }) => [chapter.city, chapter]));
  // "Home" is an ordinary word in a line; the travel cities are what an interlude must not name.
  const cityNames = [...byCity.values()].filter((c) => c.city !== 'home').map((c) => c.name);
  for (const { file, scene } of scenes.values()) {
    report.scenes?.set(scene.id, scene);
    for (const e of sceneRules(scene, { cast: reg.cast, chapters: byCity, flagsSet: reg.flagsSet, publicDir })) report.errors.push(`${file}: ${e}`);
    for (const w of sceneWarnings(scene, cityNames)) report.warnings.push(`${file}: ${w}`);
  }
  const set = sceneSetRules(scenes, reg.chapters, reg.habitCards);
  report.errors.push(...set.errors);
  report.warnings.push(...set.warnings);
  const art = artIssues(join(publicDir, 'art'), { docsDir, chapterLocals: castByChapter(scenes.values()) });
  report.errors.push(...castListIssues(reg.cast.values()));
  report.errors.push(...art.errors);
  report.warnings.push(...art.warnings);
}

/**
 * CR-24: every video-call illustration exists and is drawn as SVG code (no embedded photo, page,
 * script or external reference; ART_DIRECTION §12.3). Also linted by redline:lint.
 */
export function videoAssetIssues(s: Scenario, root: string): string[] {
  const out: string[] = [];
  const beats = [{ id: 'start', message: s.message }, ...s.beats.map((b) => ({ id: b.id, message: b.message }))];
  for (const b of beats) {
    const path = b.message.video?.illustration;
    if (!path) continue;
    const file = join(root, path);
    if (!existsSync(file)) {
      out.push(`beat "${b.id}": video.illustration "${path}" does not exist`);
      continue;
    }
    for (const i of svgSafetyIssues(readFileSync(file, 'utf8'))) out.push(`beat "${b.id}": video.illustration "${path}": ${i.message}`);
  }
  return out;
}
