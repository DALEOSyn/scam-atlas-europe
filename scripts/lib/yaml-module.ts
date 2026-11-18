/**
 * What the Vite content plugin emits for a *.yaml import. Scenario files
 * (content/scenarios/<chapter>/<file>.yaml) are emitted as the schema's parse
 * output, so Zod defaults (beats: [], interrupts: [], inspectables: [], ...)
 * exist at runtime exactly as the Scenario type promises, without shipping Zod.
 */
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { parse } from 'yaml';
import { scenarioSchema } from '../../src/content/schema.ts';

/** True when `file` lies inside `dir` (any platform's separators). */
export function isInside(dir: string, file: string): boolean {
  const rel = relative(resolve(dir), resolve(file));
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

export function yamlModuleData(file: string, code: string, scenariosDir: string): unknown {
  const raw: unknown = parse(code);
  return isInside(scenariosDir, file) ? scenarioSchema.parse(raw) : raw;
}
