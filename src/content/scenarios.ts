/**
 * Runtime access to scenario content. Scenario YAML files are lazily loaded, one chunk per chapter
 * (vite.config.ts `chapterChunk`, T-4.6); data was validated at build time (see vite.config.ts), so
 * the runtime trusts the shape and ships without Zod.
 */
import type { Scenario } from './schema.ts';

const modules = import.meta.glob<unknown>('/content/scenarios/*/*.yaml', { import: 'default' });

export interface ScenarioRef {
  chapter: string;
  file: string;
  load: () => Promise<Scenario>;
}

function buildRefs(entries: Record<string, () => Promise<unknown>>): ScenarioRef[] {
  return Object.entries(entries)
    .map(([path, load]) => {
      const [, , , chapter = '', file = ''] = path.split('/');
      // Validated at build time by contentPlugin (schema + cross-references).
      return { chapter, file, load: load as () => Promise<Scenario> };
    })
    .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.file.localeCompare(b.file));
}

let refs: readonly ScenarioRef[] | null = null;

/** Every bundled scenario, sorted by chapter then file. Built once (T-4.6 P2). */
export function listScenarios(): readonly ScenarioRef[] {
  refs ??= buildRefs(modules);
  return refs;
}

/**
 * The ref of scenario `id` in chapter `city`, or undefined. This is a lookup by file name, so only that one
 * file is ever loaded (T-4.6 P2; before, every scenario of the city was loaded in turn until the id matched).
 * It relies on every scenario file being named `<id>.yaml`: `checkScenario` in scripts/lib/content.ts fails
 * content:validate (and the build) when a file name differs from its id, and its folder from its chapter.
 */
export function findScenarioRef(all: readonly ScenarioRef[], city: string, id: string): ScenarioRef | undefined {
  return all.find((r) => r.chapter === city && r.file.replace(/\.ya?ml$/, '') === id);
}

/** Load scenario `id` of chapter `city`; undefined when it is not bundled. */
export async function loadScenario(city: string, id: string, all: readonly ScenarioRef[] = listScenarios()): Promise<Scenario | undefined> {
  const ref = findScenarioRef(all, city, id);
  return ref ? ref.load() : undefined;
}
