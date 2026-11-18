/**
 * Runtime chapter list (content/chapters/*.yaml). Small, so bundled eagerly;
 * scenarios stay lazily loaded (src/content/scenarios.ts). Validated at build time.
 */
import type { Chapter } from './schema.ts';

const modules = import.meta.glob<unknown>('/content/chapters/*.yaml', { import: 'default', eager: true });

export function listChapters(): Chapter[] {
  // Validated at build time by contentPlugin.
  return Object.values(modules)
    .map((c) => c as Chapter)
    .sort((a, b) => a.slot - b.slot || a.city.localeCompare(b.city));
}
