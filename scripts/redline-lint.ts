/**
 * npm run redline:lint [-- <paths...>]
 *
 * Automated checks for Red Lines 1–3 over content/ and public/ (default).
 * Errors (exit 1): real-looking domains, external URLs and mailto:/javascript:
 * schemes, <form action=>, <script>/<iframe>/<object>/<embed>/<meta>, inline
 * on...= handlers, checksum-valid IBANs, unmasked phone numbers, denylisted
 * brand names, QR payloads that are not in-game /qr/<id> routes.
 * Warnings (printed, exit 0): warnlisted brand words, raster images in public/
 * that are not listed in public/assets-manifest.yaml.
 *
 * YAML/JSON files are scanned twice: as raw text (catches comments and keys)
 * and as decoded string values (catches escapes such as "\u002e" and folded
 * scalars). Results are de-duplicated.
 *
 * Not scanned: content/sources.yaml (real reference URLs by design, checked by
 * content:validate) and the linter's own list files.
 *
 * content/brands.yaml is scanned with two narrow exemptions (see
 * exemptBrandReviewNotes): the review-only fields brands[].checked_against,
 * web_check and rationale may name real brands (only brand-category findings
 * are dropped there; domains, URLs, phones, IBANs are still errors), and the
 * raw-text pass is skipped for this file because its comments document
 * real-brand collisions.
 * Every other value and key (name, short_name, app_name, sms_sender_id,
 * sub-brands, known_channels, email_addresses, look-alikes, ...) is linted
 * from decoded scalars; content:validate additionally enforces strict keys.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, basename, sep } from 'node:path';
import { LineCounter, parse, parseDocument, isMap, isScalar, isSeq, type Node } from 'yaml';
import { listFiles, loadPatternIds } from './lib/content.ts';
import { yamlStructureIssues } from './lib/yaml-safety.ts';
import { svgSafetyIssues } from './lib/svg-safety.ts';
import { blankSvgGeometry, checkQrPayload, scanText, type Finding, type RuleConfig } from './redline/rules.ts';
import { compileList } from './redline/lists.ts';
import { CHECKABLE_TARGETS } from '../src/content/checkables.ts';
import { DEVICES } from '../src/content/schema.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = resolve(ROOT, 'content');
const PUBLIC = resolve(ROOT, 'public');
export const DENYLIST_FILE = resolve(CONTENT, 'redline-denylist.txt');
export const WARNLIST_FILE = resolve(CONTENT, 'redline-warnlist.txt');
export const ALLOWLIST_FILE = resolve(CONTENT, 'redline-allowlist.txt');
export const ASSETS_MANIFEST = resolve(PUBLIC, 'assets-manifest.yaml');

const SCANNED_EXTS = ['.yaml', '.yml', '.json', '.md', '.txt', '.svg', '.html', '.webmanifest'] as const;
const RASTER_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.heic'] as const;
export const BRANDS_FILE = resolve(CONTENT, 'brands.yaml');
const EXCLUDED = new Set([resolve(CONTENT, 'sources.yaml'), DENYLIST_FILE, WARNLIST_FILE, ALLOWLIST_FILE]);

export interface FileFinding extends Finding {
  file: string;
}

export interface LoadedConfig extends RuleConfig {
  denyCount: number;
  warnCount: number;
  problems: string[];
}

export function readDomainList(file: string): string[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim().toLowerCase())
    .filter(Boolean);
}

export function loadConfig(): LoadedConfig {
  const read = (f: string): string => (existsSync(f) ? readFileSync(f, 'utf8') : '');
  const deny = compileList(read(DENYLIST_FILE), 'error');
  const warn = compileList(read(WARNLIST_FILE), 'warn');
  return {
    brands: [...deny.matchers, ...warn.matchers],
    domainAllowlist: readDomainList(ALLOWLIST_FILE),
    denyCount: deny.matchers.length,
    warnCount: warn.matchers.length,
    problems: [
      ...deny.problems.map((p) => `${relative(ROOT, DENYLIST_FILE)} ${p}`),
      ...warn.problems.map((p) => `${relative(ROOT, WARNLIST_FILE)} ${p}`),
    ],
  };
}

const QR_KEY_RE = /^qr(?:_?(?:payload|url|link|target))?$/i;
const QR_CHILD_KEYS = new Set(['payload', 'url', 'href', 'link', 'target', 'data', 'value']);

/** Walk a YAML document, yielding decoded string scalars and QR payload findings. */
const SCENARIOS_DIR = resolve(CONTENT, 'scenarios');
/** Engine fixture scenarios (CR-30 … CR-35): scenario-shaped test data, linted with the same exemptions. */
const FIXTURE_SCENARIOS_DIR = resolve(ROOT, 'tests', 'fixtures', 'scenarios');
const SOURCE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isScenarioFile(file: string): boolean {
  const f = resolve(file);
  return f.startsWith(`${SCENARIOS_DIR}${sep}`) || f.startsWith(`${FIXTURE_SCENARIOS_DIR}${sep}`);
}

/**
 * Source ids name real publishers by design (e.g. europol-iocta-2025) and are
 * checked against content/sources.yaml by content:validate. Exempt ONLY
 * slug-shaped scalars at the path debrief.sources, in scenario files.
 */
export function exemptSourceIds(file: string, root: Node | null | undefined): Set<Node> {
  const out = new Set<Node>();
  if (!isScenarioFile(file) || !isMap(root)) return out;
  const debrief = root.get('debrief', true);
  if (!isMap(debrief)) return out;
  const sources = debrief.get('sources', true);
  if (!isSeq(sources)) return out;
  for (const item of sources.items) {
    if (isScalar(item) && typeof item.value === 'string' && SOURCE_ID_RE.test(item.value)) out.add(item);
  }
  return out;
}

/** An inspectable target value: a known checkable, optionally numbered (link#2). */
export function isCheckableTarget(value: string): boolean {
  const base = value.replace(/#[2-9]$/, '');
  return (CHECKABLE_TARGETS as readonly string[]).includes(base);
}

/**
 * Checkable names such as page.info or payee.name_check look like domains
 * (.info and .name are real TLDs). Exempt ONLY the scalar value of
 * inspectables[].target (opening message, beats[] and interrupts[]) in
 * scenario files, and only when it is a known checkable. Anywhere else
 * ("Pay at page.info") they are linted like any other domain.
 */
export function exemptInspectableTargets(file: string, root: Node | null | undefined): Set<Node> {
  const out = new Set<Node>();
  if (!isScenarioFile(file) || !isMap(root)) return out;
  const fromInspectables = (holder: unknown): void => {
    if (!isMap(holder)) return;
    const list = holder.get('inspectables', true);
    if (!isSeq(list)) return;
    for (const ins of list.items) {
      if (!isMap(ins)) continue;
      const target = ins.get('target', true);
      if (isScalar(target) && typeof target.value === 'string' && isCheckableTarget(target.value)) out.add(target);
    }
  };
  fromInspectables(root);
  for (const key of ['beats', 'interrupts']) {
    const seq = root.get(key, true);
    if (isSeq(seq)) for (const b of seq.items) fromInspectables(b);
  }
  return out;
}

const CHAPTERS_DIR = resolve(CONTENT, 'chapters');

export function isChapterFile(file: string): boolean {
  return resolve(file).startsWith(`${CHAPTERS_DIR}${sep}`);
}

let patternIdCache: Set<string> | undefined;
function patternIds(): Set<string> {
  patternIdCache ??= loadPatternIds(resolve(ROOT, 'docs')) ?? new Set();
  return patternIdCache;
}

const isStringScalar = (n: unknown): n is Node & { value: string } => isScalar(n) && typeof n.value === 'string';

/**
 * Schema identifiers can contain warnlisted words (device: messenger, pattern
 * messenger-account-takeover-code). Only warnlist (warn-severity brand) hits
 * are dropped on these nodes; lintText re-scans them, so denylisted brands,
 * domains, phones etc. still fail. Applies ONLY to:
 *  - in scenario files: `device` of the opening message, beats[] and
 *    interrupts[] when it is a member of the schema's DEVICES enum (not
 *    message.prompt.device, which is free text), and the top-level `pattern`
 *    when it names an existing brief docs/patterns/<id>.md;
 *  - in chapter files: patterns[] and callbacks[] items naming an existing brief.
 */
export function exemptSchemaIdentifiers(file: string, root: Node | null | undefined, briefs: ReadonlySet<string> = patternIds()): Set<Node> {
  const out = new Set<Node>();
  if (!isMap(root)) return out;
  const isBrief = (n: unknown): n is Node => isStringScalar(n) && briefs.has(n.value);
  if (isScenarioFile(file)) {
    const fromDevice = (holder: unknown): void => {
      if (!isMap(holder)) return;
      const device = holder.get('device', true);
      if (isStringScalar(device) && (DEVICES as readonly string[]).includes(device.value)) out.add(device);
    };
    fromDevice(root);
    for (const key of ['beats', 'interrupts']) {
      const seq = root.get(key, true);
      if (isSeq(seq)) for (const b of seq.items) fromDevice(b);
    }
    const pattern = root.get('pattern', true);
    if (isBrief(pattern)) out.add(pattern);
  } else if (isChapterFile(file)) {
    for (const key of ['patterns', 'callbacks']) {
      const seq = root.get(key, true);
      if (isSeq(seq)) for (const item of seq.items) if (isBrief(item)) out.add(item);
    }
  }
  return out;
}

/** Review-only brand fields that document which real brands a design was kept away from. */
export const BRAND_REVIEW_FIELDS = ['checked_against', 'web_check', 'rationale'] as const;

export function isBrandsFile(file: string): boolean {
  return resolve(file) === BRANDS_FILE;
}

/**
 * In content/brands.yaml only: the value nodes (with all sub-fields) of
 * brands[].checked_against, brands[].web_check and brands[].rationale. These
 * are exempt from the brand-name rule only (lintText re-scans them).
 */
export function exemptBrandReviewNotes(file: string, root: Node | null | undefined): Set<Node> {
  const out = new Set<Node>();
  if (!isBrandsFile(file) || !isMap(root)) return out;
  const brands = root.get('brands', true);
  if (!isSeq(brands)) return out;
  for (const brand of brands.items) {
    if (!isMap(brand)) continue;
    for (const field of BRAND_REVIEW_FIELDS) {
      const value = brand.get(field, true);
      if (value && typeof value === 'object') out.add(value as Node);
    }
  }
  return out;
}

function walkYaml(
  node: Node | null | undefined,
  keys: string[],
  lc: LineCounter,
  onString: (value: string, line: number) => void,
  onQr: (f: Finding) => void,
  exempt: ReadonlySet<Node> = new Set(),
): void {
  if (!node || exempt.has(node)) return;
  const lineOf = (n: Node): number => (n.range ? lc.linePos(n.range[0]).line : 0);
  if (isScalar(node)) {
    if (typeof node.value !== 'string') return;
    const value = node.value;
    const key = keys[keys.length - 1] ?? '';
    onString(value, lineOf(node));
    const inQr = keys.slice(0, -1).some((k) => /qr/i.test(k));
    if (QR_KEY_RE.test(key) || (inQr && QR_CHILD_KEYS.has(key.toLowerCase()))) {
      for (const f of checkQrPayload(value)) onQr({ ...f, line: lineOf(node) });
    }
    return;
  }
  if (isMap(node)) {
    for (const pair of node.items) {
      const k = isScalar(pair.key) ? String(pair.key.value) : '';
      if (isScalar(pair.key) && typeof pair.key.value === 'string') onString(pair.key.value, lineOf(pair.key));
      walkYaml(pair.value as Node | null, [...keys, k], lc, onString, onQr, exempt);
    }
    return;
  }
  if (isSeq(node)) {
    for (const item of node.items) walkYaml(item as Node | null, keys, lc, onString, onQr, exempt);
  }
}

/**
 * Results of lintText by config object, then by file path and exact text
 * (CR-47: the test suite lints content/ more than once per process). The key
 * includes the full text, so an edited file is linted afresh; callers get
 * copies, so a cached result cannot be changed from outside. Calls with
 * `briefs` (tests) bypass the cache.
 */
const lintCache = new WeakMap<RuleConfig, Map<string, FileFinding[]>>();

/** `briefs` overrides the pattern ids from docs/patterns (tests). */
export function lintText(file: string, text: string, cfg: RuleConfig, briefs?: ReadonlySet<string>): FileFinding[] {
  if (briefs) return lintTextUncached(file, text, cfg, briefs);
  let byKey = lintCache.get(cfg);
  if (!byKey) {
    byKey = new Map();
    lintCache.set(cfg, byKey);
  }
  const key = `${file}\0${text}`;
  let found = byKey.get(key);
  if (!found) {
    found = lintTextUncached(file, text, cfg);
    byKey.set(key, found);
  }
  return found.map((f) => ({ ...f }));
}

function lintTextUncached(file: string, text: string, cfg: RuleConfig, briefs?: ReadonlySet<string>): FileFinding[] {
  const found: FileFinding[] = [];
  const seen = new Set<string>();
  const add = (f: Finding): void => {
    const key = `${f.category}|${f.match.toLowerCase()}|${f.line ?? 0}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ ...f, file });
  };

  const isData = /\.(ya?ml|json|webmanifest)$/i.test(file);
  const lc = new LineCounter();
  const doc = isData ? parseDocument(text, { lineCounter: lc, uniqueKeys: false }) : undefined;

  // Exempt nodes (see exemptSourceIds, exemptInspectableTargets, exemptSchemaIdentifiers, exemptBrandReviewNotes) are blanked for the raw pass and skipped when decoding.
  let raw = /\.svg$/i.test(file) ? blankSvgGeometry(text) : text;
  const root = doc?.contents as Node | null | undefined;
  const brandNotes = exemptBrandReviewNotes(file, root);
  const schemaIds = exemptSchemaIdentifiers(file, root, briefs);
  const exempt = new Set<Node>([...exemptSourceIds(file, root), ...exemptInspectableTargets(file, root), ...schemaIds, ...brandNotes]);
  for (const n of exempt) {
    if (n.range) raw = raw.slice(0, n.range[0]) + raw.slice(n.range[0], n.range[1]).replace(/[^\n]/g, ' ') + raw.slice(n.range[1]);
  }

  // Every SVG under public/: drawn as code only, nothing embedded or loaded from outside (sceptic T-3.3).
  if (/\.svg$/i.test(file) && resolve(file).startsWith(`${PUBLIC}${sep}`)) {
    for (const i of svgSafetyIssues(text)) {
      const line = text.slice(0, i.index).split('\n').length;
      add({ category: 'markup', severity: 'error', match: i.match, index: i.index, line, message: `${i.message} (Red Lines 1–2, ART_DIRECTION §12.3)` });
    }
  }

  // brands.yaml: decoded-scalar pass only (its comments record real-brand collision checks).
  if (!isBrandsFile(file)) for (const f of scanText(raw, cfg)) add(f);

  if (doc) {
    // Anchors/aliases/merge keys could copy an exempt value into player text unseen.
    for (const issue of yamlStructureIssues(doc)) {
      add({ category: 'markup', severity: 'error', match: issue.token, index: issue.offset, line: lc.linePos(issue.offset).line, message: `${issue.message} (Red Lines 1 and 3: every string must be linted where it is shown)` });
    }
    if (doc.errors.length > 0) {
      add({ category: 'markup', severity: 'error', match: '(parse error)', index: 0, line: 0, message: `cannot parse: ${doc.errors[0]?.message ?? ''}` });
    }
    walkYaml(
      doc.contents as Node | null,
      [],
      lc,
      (value, line) => {
        for (const f of scanText(value, cfg)) add({ ...f, line: line + (f.line ?? 1) - 1 });
      },
      add,
      exempt,
    );
    // Brand review notes: every rule except the brand-name rule.
    for (const n of brandNotes) {
      walkYaml(
        n,
        [],
        lc,
        (value, line) => {
          for (const f of scanText(value, cfg)) if (f.category !== 'brand') add({ ...f, line: line + (f.line ?? 1) - 1 });
        },
        add,
      );
    }
    // Schema identifiers: everything except warnlist brand hits (denylist errors still fire).
    for (const n of schemaIds) {
      walkYaml(
        n,
        [],
        lc,
        (value, line) => {
          for (const f of scanText(value, cfg)) if (!(f.category === 'brand' && f.severity === 'warn')) add({ ...f, line: line + (f.line ?? 1) - 1 });
        },
        add,
      );
    }
  }
  return found.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}

/** Raster images can hide real logos and text the linter cannot read: each must be declared. */
export function checkRasterAssets(publicDir: string, manifestFile: string): FileFinding[] {
  const images = listFiles(publicDir, RASTER_EXTS);
  if (images.length === 0) return [];
  let declared = new Set<string>();
  if (existsSync(manifestFile)) {
    const data = parse(readFileSync(manifestFile, 'utf8')) as { assets?: { path?: unknown }[] } | null;
    declared = new Set((data?.assets ?? []).map((a) => String(a.path ?? '')));
  }
  return images
    .filter((img) => !declared.has(relative(publicDir, img).split('\\').join('/')))
    .map((img) => ({
      file: img,
      category: 'asset' as const,
      severity: 'warn' as const,
      match: relative(publicDir, img),
      index: 0,
      line: 0,
      message: `raster image is not listed in public/assets-manifest.yaml; declare its origin and get a brand-resemblance review`,
    }));
}

export function lintPaths(paths: readonly string[], cfg: RuleConfig = loadConfig()): FileFinding[] {
  const files = paths.flatMap((p) => listFiles(resolve(p), SCANNED_EXTS)).filter((f) => !EXCLUDED.has(f));
  const findings = files.flatMap((f) => lintText(f, readFileSync(f, 'utf8'), cfg));
  for (const p of paths) {
    const abs = resolve(p);
    if (abs === PUBLIC || abs.startsWith(`${PUBLIC}/`)) findings.push(...checkRasterAssets(PUBLIC, ASSETS_MANIFEST));
  }
  return findings;
}

function main(): void {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const paths = args.length > 0 ? args : [CONTENT, PUBLIC];
  const cfg = loadConfig();
  if (cfg.denyCount === 0) {
    console.error(`redline:lint: denylist ${DENYLIST_FILE} is missing or empty`);
    process.exit(2);
  }
  for (const p of cfg.problems) console.error(`redline:lint config: ${p}`);
  const findings = lintPaths(paths, cfg);
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warn');
  for (const f of findings) {
    const where = `${relative(process.cwd(), f.file)}:${f.line ?? 0}`;
    const line = `${where}  ${f.severity === 'error' ? 'error' : 'warning'} [${f.category}]  ${f.message}`;
    if (f.severity === 'error') console.error(line);
    else console.warn(line);
  }
  if (errors.length > 0 || cfg.problems.length > 0) {
    console.error(`\nredline:lint FAILED: ${errors.length} error(s), ${warnings.length} warning(s), ${cfg.problems.length} list problem(s).`);
    process.exit(1);
  }
  const scanned = paths.map((p) => relative(ROOT, resolve(p)) || '.').join(', ');
  console.log(
    `redline:lint OK (${scanned}; denylist ${cfg.denyCount}, warnlist ${cfg.warnCount}, allowlist ${cfg.domainAllowlist.length} domains; ${warnings.length} warning(s)).`,
  );
}

if (process.argv[1] && basename(process.argv[1]).startsWith('redline-lint')) main();
