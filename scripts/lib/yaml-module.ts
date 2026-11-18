/**
 * What the Vite content plugin (and the Vitest YAML plugin) emits for a
 * *.yaml import. Scenario files (content/scenarios/<chapter>/<file>.yaml) and
 * chapter files (content/chapters/<city>.yaml) are emitted as the schema's
 * parse output, so Zod defaults (beats: [], interrupts: [], callbacks: [], ...)
 * exist at runtime exactly as the types promise, without shipping Zod.
 *
 * On a schema failure this throws: the build fails loudly (validateContent at
 * build start reports the same file with all its issues).
 */
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { parse } from 'yaml';
import { chapterSchema, scenarioSchema } from '../../src/content/schema.ts';

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
  return raw;
}

/** ES module source for a YAML import. */
export function yamlModuleSource(file: string, code: string, scenariosDir: string): string {
  return `export default ${JSON.stringify(yamlModuleData(file, code, scenariosDir))};`;
}
