/**
 * Story-layer art checks (S3; ART_DIRECTION §4, §9, §11, §12). Pure functions over file text plus one
 * folder walker, used by content:validate (scripts/lib/content.ts) and the unit tests.
 *
 * - Budget (§11): per file, per chapter (its backdrops + its locals), shared (recurring cast, Alex,
 *   frames, map, glyphs) and the whole story layer, raw and gzip. 1 KB = 1024 bytes.
 * - File rules (§12.2, §12.3): header comment word for word, allowed elements only, no lettering,
 *   no filters, masks or blend modes, ≤ 2 clipPath, coordinates with at most one decimal, root with
 *   xmlns + viewBox and no fixed size, palette colours only (§3; backdrops may add ≤ 6 local colours
 *   listed in their header comment).
 * - Rig contract (§4.2, §4.3, §12.5.4): the four-rule fragment style, `x-calm` last and default,
 *   expression groups named `x-<expression>[-<pose>]`; Alex is one image with no groups.
 *
 * `samples/` and `rig/` are review material, not game assets: they are skipped here (and excluded from
 * precache in vite.config.ts); redline:lint still checks them for SVG safety.
 */
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { EXPRESSIONS } from '../../src/content/schema.ts';

const KB = 1024;

/** ART_DIRECTION §11 caps: [raw, gzip] in bytes. */
export const ART_CAPS = {
  recurring: [16 * KB, 5 * KB],
  local: [12 * KB, 4 * KB],
  alex: [8 * KB, 3 * KB],
  backdrop: [24 * KB, 8 * KB],
  small: [4 * KB, 1.5 * KB],
  glyph: [2 * KB, 1 * KB],
  map: [48 * KB, 16 * KB],
  chapter: [72 * KB, 24 * KB],
  shared: [160 * KB, 52 * KB],
  total: [800 * KB, 260 * KB],
} as const satisfies Record<string, readonly [number, number]>;

/** Recurring cast (STORY §2.1): the 16 KB / 5 KB budget and the shared total. Everyone else is a local. */
export const RECURRING_CAST: readonly string[] = ['teo', 'noor', 'adaeze', 'mateus'];
/** The arc character (STORY §2.2): one image, no expression groups, its own budget. */
export const ARC_CAST: readonly string[] = ['alex'];

/**
 * The two lists above are the art budget's view of content/cast.yaml; validation fails when they disagree
 * with the `recurring` and `arc_character` flags there (review T-S3 item 21).
 */
export function castListIssues(cast: Iterable<{ id: string; recurring?: boolean; arc_character?: boolean }>): string[] {
  const members = [...cast];
  const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));
  const out: string[] = [];
  const recurring = members.filter((c) => c.recurring).map((c) => c.id);
  const arc = members.filter((c) => c.arc_character).map((c) => c.id);
  if (!same(recurring, RECURRING_CAST)) out.push(`content/cast.yaml: recurring cast [${recurring.join(', ')}] differs from RECURRING_CAST in scripts/lib/art.ts [${RECURRING_CAST.join(', ')}]`);
  if (!same(arc, ARC_CAST)) out.push(`content/cast.yaml: arc characters [${arc.join(', ')}] differ from ARC_CAST in scripts/lib/art.ts [${ARC_CAST.join(', ')}]`);
  return out;
}

/** Folders that are not loaded by the game (ART_DIRECTION §12.1): no budget, no precache. */
export const NOT_SHIPPED_ART = ['samples', 'rig'] as const;

export type ArtKind = 'cast' | 'backdrop' | 'frame' | 'prop' | 'video' | 'map' | 'glyph' | 'other';

export function artKind(rel: string): ArtKind {
  const [top, sub] = rel.split('/');
  if (top === 'cast') return 'cast';
  if (top === 'backdrops') return 'backdrop';
  if (top === 'frames') return 'frame';
  if (top === 'props') return 'prop';
  if (top === 'video') return 'video';
  if (top === 'map') return sub === 'glyphs' ? 'glyph' : 'map';
  return 'other';
}

export const stemOf = (rel: string): string => (rel.split('/').pop() ?? rel).replace(/\.svg$/, '');

/** [raw, gzip] cap for one file (ART_DIRECTION §11). Video stills use the local-character cap. */
export function fileCap(rel: string): readonly [number, number] {
  const kind = artKind(rel);
  const stem = stemOf(rel);
  if (kind === 'cast') return ARC_CAST.includes(stem) ? ART_CAPS.alex : RECURRING_CAST.includes(stem) ? ART_CAPS.recurring : ART_CAPS.local;
  if (kind === 'backdrop') return ART_CAPS.backdrop;
  if (kind === 'glyph') return ART_CAPS.glyph;
  if (kind === 'map') return ART_CAPS.map;
  if (kind === 'video') return ART_CAPS.local;
  return ART_CAPS.small;
}

export interface ArtFile {
  /** Path relative to public/art, with forward slashes. */
  rel: string;
  text: string;
  raw: number;
  gzip: number;
}

export function artFile(rel: string, text: string): ArtFile {
  const buf = Buffer.from(text, 'utf8');
  return { rel, text, raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
}

/** Every shipped SVG under public/art (samples and rig skipped). */
export function readArt(artDir: string): ArtFile[] {
  if (!existsSync(artDir)) return [];
  return readdirSync(artDir, { recursive: true, encoding: 'utf8' })
    .map((p) => p.split(sep).join('/'))
    .filter((p) => p.endsWith('.svg') && !NOT_SHIPPED_ART.some((d) => p === d || p.startsWith(`${d}/`)))
    .filter((p) => statSync(join(artDir, p)).isFile())
    .sort()
    .map((p) => artFile(p, readFileSync(join(artDir, p), 'utf8')));
}

const fmt = (n: number): string => `${(n / KB).toFixed(1)} KB`;

function overCap(what: string, raw: number, gzip: number, cap: readonly [number, number]): string[] {
  const out: string[] = [];
  if (raw > cap[0]) out.push(`${what}: ${fmt(raw)} raw is over the ${fmt(cap[0])} budget (ART_DIRECTION §11)`);
  if (gzip > cap[1]) out.push(`${what}: ${fmt(gzip)} gzip is over the ${fmt(cap[1])} budget (ART_DIRECTION §11)`);
  return out;
}

/**
 * Budget totals. `chapterLocals` maps a chapter id to the local cast ids its scenes use (recurring cast
 * and Alex are counted as shared). A chapter's backdrops are `backdrops/<city>-*.svg`.
 */
export function budgetIssues(files: readonly ArtFile[], chapterLocals: ReadonlyMap<string, ReadonlySet<string>> = new Map()): string[] {
  const out: string[] = [];
  for (const f of files) out.push(...overCap(`art/${f.rel}`, f.raw, f.gzip, fileCap(f.rel)));
  const sum = (xs: readonly ArtFile[]): [number, number] => [xs.reduce((n, f) => n + f.raw, 0), xs.reduce((n, f) => n + f.gzip, 0)];
  const cast = (id: string) => files.find((f) => f.rel === `cast/${id}.svg`);
  const cities = new Set([...chapterLocals.keys(), ...files.filter((f) => artKind(f.rel) === 'backdrop').map((f) => stemOf(f.rel).split('-')[0] ?? '')]);
  for (const city of [...cities].sort()) {
    if (!city) continue;
    const backdrops = files.filter((f) => artKind(f.rel) === 'backdrop' && stemOf(f.rel).startsWith(`${city}-`));
    const locals = [...(chapterLocals.get(city) ?? [])].filter((id) => !RECURRING_CAST.includes(id) && !ARC_CAST.includes(id)).flatMap((id) => cast(id) ?? []);
    const [raw, gzip] = sum([...backdrops, ...locals]);
    out.push(...overCap(`chapter "${city}" art (backdrops + locals)`, raw, gzip, ART_CAPS.chapter));
  }
  const shared = files.filter((f) => {
    const k = artKind(f.rel);
    return (k === 'cast' && (RECURRING_CAST.includes(stemOf(f.rel)) || ARC_CAST.includes(stemOf(f.rel)))) || k === 'frame' || k === 'map' || k === 'glyph';
  });
  out.push(...overCap('shared art (recurring cast, Alex, frames, map, glyphs)', ...sum(shared), ART_CAPS.shared));
  out.push(...overCap('the whole story layer (public/art)', ...sum(files), ART_CAPS.total));
  return out;
}

// ---------------------------------------------------------------------------
// File rules (§12.2, §12.3)

const HEADER_RE =
  /^<!-- Scam Atlas: Europe\. (.+?)\. Original artwork written as SVG code by the project's AI-assisted team, element by element; no image-generation model, auto-vectorised raster, tracing, stock or reference photo\. Fictional, not a likeness of any real person, sign or brand\. CC BY-SA 4\.0\. -->/;

export const ALLOWED_ELEMENTS = new Set(['svg', 'g', 'defs', 'use', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'style', 'title', 'linearGradient', 'stop', 'clipPath']);

/** Element caps (§11): characters 150, backdrops 300; others share the backdrop cap. */
export function elementCap(rel: string): number {
  const k = artKind(rel);
  return k === 'cast' || k === 'video' ? 150 : 300;
}

/** Hex colours from ART_DIRECTION §3 (the palette section), lower-case #rrggbb. */
export function paletteFromDoc(doc: string): Set<string> {
  const start = doc.indexOf('## 3. Palette');
  const end = doc.indexOf('## 4.', start + 1);
  const section = start < 0 ? '' : doc.slice(start, end < 0 ? undefined : end);
  return new Set([...section.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()));
}

const norm = (hex: string): string => {
  const h = hex.toLowerCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
};

/** Colours used by the drawing (the header comment, which lists local colours, is not a use). */
export function svgHexColours(text: string): Set<string> {
  const body = text.replace(/<!--[\s\S]*?-->/g, '');
  return new Set([...body.matchAll(/#[0-9a-f]{6}(?![0-9a-z_-])|#[0-9a-f]{3}(?![0-9a-z_-])/gi)].map((m) => norm(m[0])));
}

export function fileIssues(f: ArtFile, palette?: ReadonlySet<string>): string[] {
  const where = `art/${f.rel}`;
  const out: string[] = [];
  const t = f.text;
  const header = HEADER_RE.exec(t);
  if (!header) out.push(`${where}: first line must be the header comment from ART_DIRECTION §12.2, word for word`);
  const body = t.replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...body.matchAll(/<([A-Za-z][\w:-]*)\b/g)].map((m) => m[1] ?? '');
  const bad = [...new Set(tags.filter((n) => !ALLOWED_ELEMENTS.has(n)))];
  if (bad.length > 0) out.push(`${where}: elements not allowed in art (ART_DIRECTION §12.3): ${bad.map((b) => `<${b}>`).join(', ')}`);
  const cap = elementCap(f.rel);
  if (tags.length > cap) out.push(`${where}: ${tags.length} elements, over the ${cap} cap (ART_DIRECTION §11)`);
  if (tags.filter((n) => n === 'clipPath').length > 2) out.push(`${where}: at most 2 clipPath per file (ART_DIRECTION §11)`);
  if (/\son[a-z]+\s*=/i.test(body)) out.push(`${where}: event attributes are not allowed`);
  if (/\b(?:filter|mask)\s*[:=]|mix-blend-mode|<animate|<set\b|@keyframes|animation\s*:/i.test(body)) out.push(`${where}: no filters, masks, blend modes or animation in art (ART_DIRECTION §10, §11)`);
  if (/@font-face|font-family/i.test(body)) out.push(`${where}: no fonts or lettering in art (ART_DIRECTION §12.3)`);
  const root = /<svg\b[^>]*>/.exec(body)?.[0] ?? '';
  if (!/\bxmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(root) || !/\bviewBox="/.test(root)) out.push(`${where}: the root <svg> needs xmlns and viewBox`);
  if (/\s(?:width|height)="/.test(root)) out.push(`${where}: no fixed width or height on the root (the layout sizes it)`);
  const kind = artKind(f.rel);
  const vb = /\bviewBox="([^"]*)"/.exec(root)?.[1];
  if (kind === 'cast' && vb !== '0 0 240 300') out.push(`${where}: character files use viewBox="0 0 240 300" (ART_DIRECTION §4.1)`);
  if (kind === 'backdrop' && vb !== '0 0 960 540') out.push(`${where}: backdrops use viewBox="0 0 960 540" (ART_DIRECTION §6.1)`);
  // Geometry precision: integers or one decimal place (§11). Look only inside attribute values.
  const precise = [...body.matchAll(/="([^"]*)"/g)].some((m) => /\d\.\d{2,}/.test(m[1] ?? ''));
  if (precise) out.push(`${where}: coordinates are integers or have one decimal place (ART_DIRECTION §11)`);
  if (palette && palette.size > 0) {
    const local = new Set(kind === 'backdrop' && header ? [...(header[1] ?? '').matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()) : []);
    if (local.size > 6) out.push(`${where}: a backdrop adds at most 6 local colours (ART_DIRECTION §3.5)`);
    const off = [...svgHexColours(t)].filter((c) => !palette.has(c) && !local.has(c));
    if (off.length > 0) out.push(`${where}: colours not in the art palette (ART_DIRECTION §3): ${off.join(', ')}`);
  }
  if (kind === 'cast') out.push(...rigIssues(f));
  return out;
}

// ---------------------------------------------------------------------------
// Rig contract (§4.2, §4.3)

const RIG_STYLE = '.x{display:none}.x-default{display:inline}.x:target{display:inline}.x:target~.x-default{display:none}';

/** Expression groups in file order: `x-<expression>[-<pose>]` with their class attribute. */
export function expressionGroups(text: string): { id: string; classes: string[] }[] {
  const out: { id: string; classes: string[] }[] = [];
  for (const m of text.matchAll(/<g\b([^>]*)>/g)) {
    const attrs = m[1] ?? '';
    const id = /\bid="(x-[a-z0-9-]+)"/.exec(attrs)?.[1];
    if (!id) continue;
    out.push({ id, classes: (/\bclass="([^"]*)"/.exec(attrs)?.[1] ?? '').split(/\s+/).filter(Boolean) });
  }
  return out;
}

/** Expression ids a cast file offers (`calm`, `relieved-parcels`), i.e. the valid `#x-…` fragments. */
export function expressionsIn(text: string): Set<string> {
  return new Set(expressionGroups(text).filter((g) => g.classes.includes('x')).map((g) => g.id.slice(2)));
}

export function rigIssues(f: ArtFile): string[] {
  const where = `art/${f.rel}`;
  const groups = expressionGroups(f.text);
  if (ARC_CAST.includes(stemOf(f.rel))) {
    return groups.length > 0 ? [`${where}: Alex is one image with no expression groups (ART_DIRECTION §4.7)`] : [];
  }
  const out: string[] = [];
  if (!f.text.replace(/\s+/g, '').includes(RIG_STYLE)) out.push(`${where}: missing the four-rule fragment style block (ART_DIRECTION §4.3)`);
  const exprRe = new RegExp(`^x-(?:${EXPRESSIONS.join('|')})(?:-[a-z0-9]+)*$`);
  for (const g of groups) {
    if (!exprRe.test(g.id)) out.push(`${where}: group "${g.id}" is not x-<expression>[-<pose>] from the shared set`);
    if (!g.classes.includes('x')) out.push(`${where}: group "${g.id}" needs class="x"`);
  }
  const last = groups.at(-1);
  if (!last || last.id !== 'x-calm' || !last.classes.includes('x-default')) out.push(`${where}: the default group x-calm (class "x x-default") is always last (ART_DIRECTION §4.2)`);
  const defaults = groups.filter((g) => g.classes.includes('x-default'));
  if (defaults.length > 1) out.push(`${where}: only x-calm is the default group`);
  const ids = groups.map((g) => g.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) out.push(`${where}: group "${dup}" appears twice`);
  return out;
}

/** All art checks for public/art; `docsDir` supplies the palette (ART_DIRECTION.md §3). */
export function artIssues(artDir: string, opts: { docsDir?: string; chapterLocals?: ReadonlyMap<string, ReadonlySet<string>> } = {}): { errors: string[]; warnings: string[] } {
  const files = readArt(artDir);
  const warnings: string[] = [];
  const doc = opts.docsDir ? join(opts.docsDir, 'ART_DIRECTION.md') : undefined;
  let palette: Set<string> | undefined;
  if (doc && existsSync(doc)) palette = paletteFromDoc(readFileSync(doc, 'utf8'));
  else if (files.length > 0) warnings.push(`${doc ?? 'docs/ART_DIRECTION.md'} not found: art colours are not checked`);
  const errors = [...files.flatMap((f) => fileIssues(f, palette)), ...budgetIssues(files, opts.chapterLocals)];
  return { errors, warnings };
}

export function relArt(artDir: string, file: string): string {
  return relative(artDir, file).split(sep).join('/');
}
