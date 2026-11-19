/**
 * Test-only build of the e2e harness (tests/e2e/harness): the scene player and HUD with fixture scenes
 * and fixture art (built from public/art/samples), served by Playwright as a second web server. Output in
 * dist-harness/ (git-ignored). Never deployed.
 */
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';
import { sceneSchema, scenarioSchema } from './src/content/schema.ts';
import { fixturePublicDir, fixtureScene } from './tests/content/scene-fixtures.ts';
import type { Scenario, Scene } from './src/content/schema.ts';
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

/**
 * CR-28: every authored scene in content/scenes, as the game parses it, for the footer-overlap checks
 * (`?view=real&id=<scene id>`). Art comes from the fixture public dir, so missing images are expected;
 * layout does not depend on them (the art box is sized by CSS).
 */
const SCENES_DIR = resolve(import.meta.dirname, 'content', 'scenes');
const realScenes: Scene[] = readdirSync(SCENES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(SCENES_DIR, d.name)).filter((f) => f.endsWith('.yaml')).map((f) => sceneSchema.parse(parse(readFileSync(join(SCENES_DIR, d.name, f), 'utf8')))));

/**
 * CR-30 … CR-35: the engine fixture scenarios (tests/fixtures/scenarios), played in the real ScenarioView
 * (`?view=scenario&id=<scenario id>`).
 */
const FIXTURE_SCENARIOS_DIR = resolve(import.meta.dirname, 'tests', 'fixtures', 'scenarios');
const fixtureScenarios: Scenario[] = readdirSync(FIXTURE_SCENARIOS_DIR)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => scenarioSchema.parse(parse(readFileSync(join(FIXTURE_SCENARIOS_DIR, f), 'utf8'))));

export default defineConfig({
  root: resolve(import.meta.dirname, 'tests', 'e2e', 'harness'),
  base: '/',
  publicDir: fixturePublicDir(),
  define: { __HARNESS_SCENES__: JSON.stringify(scenes), __HARNESS_REAL_SCENES__: JSON.stringify(realScenes), __HARNESS_SCENARIOS__: JSON.stringify(fixtureScenarios) },
  plugins: [yamlPlugin(), preact()],
  build: { outDir: resolve(import.meta.dirname, 'dist-harness'), emptyOutDir: true, target: 'es2022' },
});
