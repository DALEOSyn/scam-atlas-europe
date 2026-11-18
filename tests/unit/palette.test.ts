/**
 * Brand palette sync (UI_SPEC §14): every colour in public/brands/<id>*.svg is
 * in that brand's content/brands.yaml palette, and the palette equals the
 * --brand-<id>-* tokens in src/styles/tokens.css (as sets of colour values,
 * case-insensitive; text_on_light has no token of its own).
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { brandsFileSchema } from '../../src/content/schema.ts';
import { ROOT, readYaml } from './helpers.ts';

const BRANDS = brandsFileSchema.parse(readYaml('content/brands.yaml')).brands;
const SVG_DIR = resolve(ROOT, 'public/brands');
const TOKENS = readFileSync(resolve(ROOT, 'src/styles/tokens.css'), 'utf8');

function norm(hex: string): string {
  const h = hex.toLowerCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

/** Colours used in an SVG. Anything that is not a hex colour, none, transparent or currentColor is reported as-is. */
export function svgColours(svg: string): Set<string> {
  const out = new Set<string>();
  const values = [
    ...[...svg.matchAll(/\b(?:fill|stroke|stop-color|flood-color|lighting-color|color)\s*[=:]\s*["']?([^"';>\s)]+\)?)/gi)].map((m) => m[1] ?? ''),
  ];
  for (const v of values) {
    if (/^(?:none|transparent|currentcolor|inherit)$/i.test(v) || /^url\(/i.test(v)) continue;
    out.add(/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? norm(v) : v);
  }
  // Bare hex anywhere (e.g. inside style blocks) also counts.
  for (const m of svg.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)) out.add(norm(m[0]));
  return out;
}

/** --brand-<id>-<name>: <hex> where <name> is not itself the start of another brand's id. */
function tokenColours(id: string): Set<string> {
  const others = BRANDS.map((b) => b.id).filter((o) => o !== id && o.startsWith(`${id}-`));
  const out = new Set<string>();
  for (const m of TOKENS.matchAll(/--brand-([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)) {
    const name = m[1] ?? '';
    if (!name.startsWith(`${id}-`) || others.some((o) => name.startsWith(`${o}-`))) continue;
    out.add(norm(m[2] ?? ''));
  }
  return out;
}

describe('brand palette sync (UI_SPEC §14)', () => {
  const svgs = readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg'));

  it('every brand SVG belongs to a registered brand', () => {
    const orphan = svgs.filter((f) => !BRANDS.some((b) => f === `${b.id}.svg` || f.startsWith(`${b.id}-`)));
    expect(orphan).toEqual([]);
  });

  describe.each(BRANDS.filter((b) => b.palette).map((b) => [b.id, b] as const))('%s', (id, brand) => {
    const palette = new Set(Object.values(brand.palette ?? {}).map(norm));

    it('every colour in its SVGs is in the palette', () => {
      const files = svgs.filter((f) => f === `${id}.svg` || f.startsWith(`${id}-`));
      expect(files.length).toBeGreaterThan(0);
      for (const f of files) {
        const extra = [...svgColours(readFileSync(resolve(SVG_DIR, f), 'utf8'))].filter((c) => !palette.has(c));
        expect(extra, `${f}: colours not in the ${id} palette`).toEqual([]);
      }
    });

    it('the palette equals the --brand-<id>-* tokens', () => {
      expect([...tokenColours(id)].sort()).toEqual([...palette].sort());
    });
  });

  it('svgColours reads attributes, styles and short hex', () => {
    expect([...svgColours('<svg><path fill="#FFF" stroke="#0E5E63"/><rect style="fill:#a8e6cf"/><g fill="none"/></svg>')].sort()).toEqual([
      '#0e5e63',
      '#a8e6cf',
      '#ffffff',
    ]);
    expect(svgColours('<path fill="red"/>').has('red')).toBe(true);
  });
});
