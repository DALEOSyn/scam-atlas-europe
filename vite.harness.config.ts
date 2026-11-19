/**
 * Test-only build of the e2e harness (tests/e2e/harness): the scene player and HUD with fixture scenes
 * and fixture art (built from public/art/samples), served by Playwright as a second web server. Output in
 * dist-harness/ (git-ignored). Never deployed.
 */
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';
import { fixturePublicDir, fixtureScene } from './tests/content/scene-fixtures.ts';
import type { Scene } from './src/content/schema.ts';
import { yamlModuleSource } from './scripts/lib/yaml-module.ts';

/** content/*.yaml as data, exactly as the game build emits it (cast.yaml for speaker labels). */
function yamlPlugin(): Plugin {
  const scenarios = resolve(import.meta.dirname, 'content', 'scenarios');
  return {
    name: 'harness-yaml',
    transform(code, id) {
      return /\.ya?ml$/.test(id) ? { code: yamlModuleSource(id, code, scenarios), map: null } : null;
    },
  };
}

const arrival = fixtureScene('berlin', 'berlin-arrival');
const [p1, p2, p3] = arrival.panels;
if (!p1 || !p2 || !p3) throw new Error('berlin-arrival fixture changed: expected three panels');

/** Long scenes for the phone checks, and a speaker + listener pair on both sides. */
const scenes: Scene[] = [
  arrival,
  fixtureScene('berlin', 'berlin-turn'),
  fixtureScene('berlin', 'berlin-resolution'),
  { ...arrival, id: 'harness-long', panels: [p1, p2, p3, p1, { ...p2, flip: false }, p3, p1, p2] },
  { ...arrival, id: 'harness-pair', panels: [{ ...p2, flip: false }, { ...p2, flip: true }] },
];

export default defineConfig({
  root: resolve(import.meta.dirname, 'tests', 'e2e', 'harness'),
  base: '/',
  publicDir: fixturePublicDir(),
  define: { __HARNESS_SCENES__: JSON.stringify(scenes) },
  plugins: [yamlPlugin(), preact()],
  build: { outDir: resolve(import.meta.dirname, 'dist-harness'), emptyOutDir: true, target: 'es2022' },
});
