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
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { LineCounter, parse, parseDocument, isMap, isScalar, isSeq, type Node } from 'yaml';
import { listFiles } from './lib/content.ts';
import { blankSvgGeometry, checkQrPayload, scanText, type Finding, type RuleConfig } from './redline/rules.ts';
import { compileList } from './redline/lists.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = resolve(ROOT, 'content');
const PUBLIC = resolve(ROOT, 'public');
export const DENYLIST_FILE = resolve(CONTENT, 'redline-denylist.txt');
export const WARNLIST_FILE = resolve(CONTENT, 'redline-warnlist.txt');
export const ALLOWLIST_FILE = resolve(CONTENT, 'redline-allowlist.txt');
export const ASSETS_MANIFEST = resolve(PUBLIC, 'assets-manifest.yaml');

const SCANNED_EXTS = ['.yaml', '.yml', '.json', '.md', '.txt', '.svg', '.html', '.webmanifest'] as const;
const RASTER_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.heic'] as const;
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
/** Character ranges of scalars inside any `sources:` sequence (source ids). */
function sourceIdRanges(node: Node | null | undefined, inSources = false): [number, number][] {
  if (!node) return [];
  if (isScalar(node)) return inSources && node.range ? [[node.range[0], node.range[1]]] : [];
  if (isSeq(node)) return node.items.flatMap((i) => sourceIdRanges(i as Node | null, inSources));
  if (isMap(node)) {
    return node.items.flatMap((p) =>
      sourceIdRanges(p.value as Node | null, isScalar(p.key) && p.key.value === 'sources' && isSeq(p.value)),
    );
  }
  return [];
}

function walkYaml(
  node: Node | null | undefined,
  keys: string[],
  lc: LineCounter,
  onString: (value: string, line: number) => void,
  onQr: (f: Finding) => void,
): void {
  if (!node) return;
  const lineOf = (n: Node): number => (n.range ? lc.linePos(n.range[0]).line : 0);
  if (isScalar(node)) {
    if (typeof node.value !== 'string') return;
    const value = node.value;
    const key = keys[keys.length - 1] ?? '';
    if (key === 'sources') return; // source ids, see sourceIdRanges()
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
      walkYaml(pair.value as Node | null, [...keys, k], lc, onString, onQr);
    }
    return;
  }
  if (isSeq(node)) {
    for (const item of node.items) walkYaml(item as Node | null, keys, lc, onString, onQr);
  }
}

export function lintText(file: string, text: string, cfg: RuleConfig): FileFinding[] {
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

  // Source ids (debrief.sources) name real publishers by design and are checked
  // against content/sources.yaml by content:validate; blank them for the raw pass.
  let raw = /\.svg$/i.test(file) ? blankSvgGeometry(text) : text;
  if (doc) for (const [start, end] of sourceIdRanges(doc.contents as Node | null)) raw = raw.slice(0, start) + ' '.repeat(end - start) + raw.slice(end);

  for (const f of scanText(raw, cfg)) add(f);

  if (doc) {
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
    );
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
