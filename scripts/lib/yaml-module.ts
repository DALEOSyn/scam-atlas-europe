/**
 * What the Vite content plugin (and the Vitest YAML plugin) emits for a
 * *.yaml import. Scenario files (content/scenarios/<chapter>/<file>.yaml) and
 * chapter files (content/chapters/<city>.yaml) and scene files (content/scenes/<folder>/<id>.yaml) are emitted as the schema's
 * parse output, so Zod defaults (beats: [], interrupts: [], callbacks: [], ...)
 * exist at runtime exactly as the types promise, without shipping Zod.
 *
 * On a schema failure this throws: the build fails loudly (validateContent at
 * build start reports the same file with all its issues).
 */
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { parse } from 'yaml';
import { brandsFileSchema, castFileSchema, chapterSchema, scenarioSchema, sceneSchema } from '../../src/content/schema.ts';

/** True when `file` lies inside `dir` (any platform's separators). */
export function isInside(dir: string, file: string): boolean {
  const rel = relative(resolve(dir), resolve(file));
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

/**
 * @param scenariosDir content/scenarios
 * @param chaptersDir  content/chapters (defaults to its sibling of scenariosDir)
 */
export function yamlModuleData(file: string, code: string, scenariosDir: string, chaptersDir = resolve(scenariosDir, '..', 'chapters')): unknown {
  const raw: unknown = parse(code);
  if (isInside(scenariosDir, file)) return scenarioSchema.parse(raw);
  if (isInside(chaptersDir, file)) return chapterSchema.parse(raw);
  if (isInside(resolve(scenariosDir, '..', 'scenes'), file)) return sceneSchema.parse(raw);
  if (resolve(file) === resolve(scenariosDir, '..', 'brands.yaml')) return brandProjection(raw);
  if (resolve(file) === resolve(scenariosDir, '..', 'cast.yaml')) return castProjection(raw);
  return raw;
}

/**
 * The runtime needs only what devices show: id, names and logo files. Review-only fields
 * (rationale, checked_against, web_check, which may name real brands) never reach the bundle.
 */
export function brandProjection(raw: unknown): {
  id: string;
  name: string;
  short_name?: string;
  mark?: string;
  sub_brands?: { id: string; name: string }[];
  register?: { status: 'authorised' | 'warning_list'; address?: string; phone?: string };
}[] {
  return brandsFileSchema.parse(raw).brands.map((b) => ({
    id: b.id,
    name: b.name,
    ...(b.short_name ? { short_name: b.short_name } : {}),
    ...(b.logo?.mark ? { mark: b.logo.mark.replace(/^public\//, '') } : {}),
    // CR-27: sub-brand names for the banking header (message.bank.brand), id and name only.
    ...(b.sub_brands?.length ? { sub_brands: b.sub_brands.map((x) => ({ id: x.id, name: x.name })) } : {}),
    // CR-38: the Fairmeasure regulator view lists registered and warned-about firms (masked phone).
    ...(b.register
      ? { register: { status: b.register.status, ...(b.register.address ? { address: b.register.address } : {}), ...(b.register.phone ? { phone: b.register.phone } : {}) } }
      : {}),
  }));
}

/** Scenes need only who someone is (speaker label "Jonas · neighbour"); review notes stay out of the bundle. */
export function castProjection(raw: unknown): { id: string; name: string; role: string; arc_character: boolean }[] {
  return castFileSchema.parse(raw).cast.map((c) => ({ id: c.id, name: c.name, role: c.role, arc_character: c.arc_character }));
}

/** ES module source for a YAML import. */
export function yamlModuleSource(file: string, code: string, scenariosDir: string): string {
  return `export default ${JSON.stringify(yamlModuleData(file, code, scenariosDir))};`;
}
