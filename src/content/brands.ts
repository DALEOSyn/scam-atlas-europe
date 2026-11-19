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
  /** CR-38: the firm's entry with the in-world regulator (Fairmeasure). */
  register?: { status: 'authorised' | 'warning_list'; address?: string; phone?: string };
}

/** CR-38: one line of the Fairmeasure register or warning list. */
export interface RegisterEntry {
  name: string;
  status: 'authorised' | 'warning_list';
  address?: string;
  phone?: string;
}

const brands = data as BrandMark[];

export function brandById(id: string): BrandMark | undefined {
  return brands.find((b) => b.id === id);
}

/**
 * CR-27: the brand for an app header, by brand id or sub-brand id. A sub-brand keeps its parent's id
 * (palette tokens `--brand-<id>-*`) and mark, with the sub-brand's name as `name` and no short name.
 */
export function headerBrand(id: string, registry: readonly BrandMark[] = brands): BrandMark | undefined {
  const own = registry.find((b) => b.id === id);
  if (own) return own;
  for (const b of registry) {
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

/** CR-38: firms on the Fairmeasure register and warning list (brands.yaml `register`), sorted by name. */
export function registerEntries(registry: readonly BrandMark[] = brands): RegisterEntry[] {
  return registry
    .flatMap((b) => (b.register ? [{ name: b.name, ...b.register }] : []))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/**
 * CR-38 (psych M1): the Fairmeasure view is offered only when the register has at least one authorised firm,
 * so a player never opens an empty register ("not on the register" would be true of every firm).
 */
export function registerAvailable(entries: readonly RegisterEntry[] = registerEntries()): boolean {
  return entries.some((e) => e.status === 'authorised');
}
