/**
 * npm run redline:lint [-- <paths...>]
 *
 * Automated checks for Red Lines 1–3 over content (default: content/).
 * Fails (exit 1) on: real-looking domains, external URLs, <form action=> and
 * <script>, checksum-valid IBANs, unmasked phone numbers, denylisted brand
 * names, and QR payloads that are not in-game /qr/<id> routes.
 *
 * Every text file is scanned twice: as raw text (catches comments and keys)
 * and, for YAML/JSON, as decoded string values (catches escapes such as
 * "." and folded scalars). Results are de-duplicated.
 *
 * Not scanned: content/sources.yaml (real reference URLs by design) and the
 * linter's own config files (denylist, allowlist).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { LineCounter, parseDocument, isMap, isScalar, isSeq, type Node } from 'yaml';
import { listFiles } from './lib/content.ts';
import { checkQrPayload, compileDenylist, scanText, type Finding, type RuleConfig } from './redline/rules.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = resolve(ROOT, 'content');
export const DENYLIST_FILE = resolve(CONTENT, 'redline-denylist.txt');
export const ALLOWLIST_FILE = resolve(CONTENT, 'redline-allowlist.txt');

const SCANNED_EXTS = ['.yaml', '.yml', '.json', '.md', '.txt', '.svg', '.html'] as const;
const EXCLUDED = new Set([resolve(CONTENT, 'sources.yaml'), DENYLIST_FILE, ALLOWLIST_FILE]);

export interface FileFinding extends Finding {
  file: string;
}

export function readListFile(file: string): string[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim().toLowerCase())
    .filter(Boolean);
}

export function loadConfig(): RuleConfig {
  return { denylist: readListFile(DENYLIST_FILE), domainAllowlist: readListFile(ALLOWLIST_FILE) };
}

const QR_KEY_RE = /^qr(?:_?(?:payload|url|link|target))?$/i;
const QR_CHILD_KEYS = new Set(['payload', 'url', 'href', 'link', 'target', 'data', 'value']);

/** Walk a YAML document, yielding decoded string scalars and QR payload findings. */
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

export function lintText(file: string, text: string, cfg: RuleConfig, denyRe = compileDenylist(cfg.denylist)): FileFinding[] {
  const found: FileFinding[] = [];
  const seen = new Set<string>();
  const add = (f: Finding): void => {
    const key = `${f.category}|${f.match.toLowerCase()}|${f.line ?? 0}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ ...f, file });
  };

  for (const f of scanText(text, cfg, denyRe)) add(f);

  if (/\.(ya?ml|json)$/i.test(file)) {
    const lc = new LineCounter();
    const doc = parseDocument(text, { lineCounter: lc, uniqueKeys: false });
    if (doc.errors.length > 0) {
      add({ category: 'markup', match: '(parse error)', index: 0, line: 0, message: `cannot parse: ${doc.errors[0]?.message ?? ''}` });
    }
    walkYaml(
      doc.contents as Node | null,
      [],
      lc,
      (value, line) => {
        for (const f of scanText(value, cfg, denyRe)) add({ ...f, line: line + (f.line ?? 1) - 1 });
      },
      add,
    );
  }
  return found.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}

export function lintPaths(paths: readonly string[], cfg = loadConfig()): FileFinding[] {
  const denyRe = compileDenylist(cfg.denylist);
  const files = paths.flatMap((p) => listFiles(resolve(p), SCANNED_EXTS)).filter((f) => !EXCLUDED.has(f));
  return files.flatMap((f) => lintText(f, readFileSync(f, 'utf8'), cfg, denyRe));
}

function main(): void {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const paths = args.length > 0 ? args : [CONTENT];
  const cfg = loadConfig();
  if (cfg.denylist.length === 0) {
    console.error(`redline:lint: denylist ${DENYLIST_FILE} is missing or empty`);
    process.exit(2);
  }
  const findings = lintPaths(paths, cfg);
  for (const f of findings) {
    console.error(`${relative(process.cwd(), f.file)}:${f.line ?? 0}  [${f.category}]  ${f.message}`);
  }
  if (findings.length > 0) {
    console.error(`\nredline:lint FAILED: ${findings.length} finding(s).`);
    process.exit(1);
  }
  console.log(`redline:lint OK (${paths.map((p) => relative(ROOT, resolve(p)) || '.').join(', ')}; denylist ${cfg.denylist.length} names, allowlist ${cfg.domainAllowlist.length} domains).`);
}

if (process.argv[1] && basename(process.argv[1]).startsWith('redline-lint')) main();
