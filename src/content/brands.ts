/**
 * Runtime brand marks (content/brands.yaml). The YAML import is a projection
 * (scripts/lib/yaml-module.ts brandProjection): id, names and the mark file only,
 * so review-only fields never reach the bundle. Validated at build time.
 */
import data from '../../content/brands.yaml';

export interface BrandMark {
  id: string;
  name: string;
  short_name?: string;
  /** Path under public/, e.g. brands/kettle-mark.svg */
  mark?: string;
}

const brands = data as BrandMark[];

export function brandById(id: string): BrandMark | undefined {
  return brands.find((b) => b.id === id);
}

/**
 * The brand a display name claims, e.g. "Waymarker IT" → Waymarker, "Kettle" → Kettle.
 * Same display name → same mark, genuine or spoof (UI_SPEC §2.5, §12): the tell is never the logo.
 */
export function brandForName(display: string | undefined): BrandMark | undefined {
  if (!display) return undefined;
  const d = display.toLowerCase();
  return brands.find((b) =>
    [b.name, b.short_name].some((n) => {
      if (!n) return false;
      const x = n.toLowerCase();
      return d === x || d.startsWith(`${x} `);
    }),
  );
}

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}
