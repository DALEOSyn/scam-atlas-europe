/**
 * T-4.6 P1: lazy content is grouped into one chunk per chapter (its scenarios and its story scenes), so the
 * service worker precaches about a dozen content files instead of one per scenario and scene. Interludes get
 * their own chunk. Anything else (the shell, eager chapter files) is left to the default splitting.
 */
const CONTENT_FILE = /\/content\/(?:scenarios|scenes)\/([a-z0-9-]+)\/[^/]+\.ya?ml$/;

export function chapterChunkName(moduleId: string): string | null {
  const m = CONTENT_FILE.exec(moduleId.split('\\').join('/').replace(/\?.*$/, ''));
  return m ? `chapter-${m[1]}` : null;
}
