/**
 * Runtime access to story scenes (content/scenes/<city or interludes>/<id>.yaml, S3). Each file is its
 * own lazily loaded chunk, like scenarios; data was validated at build time (scripts/lib/scenes.ts), so
 * the runtime trusts the shape and ships without Zod. With no scene files the list is empty and every
 * chapter plays exactly as before.
 */
import type { Scene } from './schema.ts';

const modules = import.meta.glob<unknown>('/content/scenes/*/*.yaml', { import: 'default' });

export interface SceneRef {
  /** City (chapter id) or `interludes`. */
  folder: string;
  id: string;
  load: () => Promise<Scene>;
}

export function listScenes(): SceneRef[] {
  return Object.entries(modules)
    .map(([path, load]) => {
      const [, , , folder = '', file = ''] = path.split('/');
      // The file name is the scene id (content:validate).
      return { folder, id: file.replace(/\.ya?ml$/, ''), load: load as () => Promise<Scene> };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder) || a.id.localeCompare(b.id));
}

/** Load one scene by id; undefined when it is not bundled (the game then simply carries on). */
export async function loadSceneById(id: string, refs: readonly SceneRef[] = listScenes()): Promise<Scene | undefined> {
  const ref = refs.find((r) => r.id === id);
  return ref ? ref.load() : undefined;
}
