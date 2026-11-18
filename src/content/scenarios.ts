/**
 * Runtime access to scenario content. Each YAML file becomes its own lazily
 * loaded chunk; data was validated at build time (see vite.config.ts), so
 * the runtime trusts the shape and ships without Zod.
 */
import type { Scenario } from './schema.ts';

const modules = import.meta.glob<unknown>('/content/scenarios/*/*.yaml', { import: 'default' });

export interface ScenarioRef {
  chapter: string;
  file: string;
  load: () => Promise<Scenario>;
}

export function listScenarios(): ScenarioRef[] {
  return Object.entries(modules)
    .map(([path, load]) => {
      const [, , , chapter = '', file = ''] = path.split('/');
      // Validated at build time by contentPlugin (schema + cross-references).
      return { chapter, file, load: load as () => Promise<Scenario> };
    })
    .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.file.localeCompare(b.file));
}
