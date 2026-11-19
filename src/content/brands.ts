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
  /** CR-27: sub-brands (e.g. Larchwick Pro), id and name only. */
  sub_brands?: { id: string; name: string }[];
}

const brands = data as BrandMark[];

export function brandById(id: string): BrandMark | undefined {
  return brands.find((b) => b.id === id);
}

/**
 * CR-27: the brand for an app header, by brand id or sub-brand id. A sub-brand keeps its parent's id
 * (palette tokens `--brand-<id>-*`) and mark, with the sub-brand's name as `name` and no short name.
 */
export function headerBrand(id: string): BrandMark | undefined {
  const own = brandById(id);
  if (own) return own;
  for (const b of brands) {
    const sub = b.sub_brands?.find((x) => x.id === id);
    if (sub) return { id: b.id, name: sub.name, ...(b.mark ? { mark: b.mark } : {}) };
  }
  return undefined;
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
