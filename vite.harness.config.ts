/**
 * Test-only build of the e2e harness (tests/e2e/harness): the scene player and HUD with fixture scenes
 * and fixture art (built from public/art/samples), served by Playwright as a second web server. Output in
 * dist-harness/ (git-ignored). Never deployed.
 */
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { cpSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse, stringify } from 'yaml';
import { chapterSchema, sceneSchema, scenarioSchema } from './src/content/schema.ts';
import { fixturePublicDir, fixtureScene } from './tests/content/scene-fixtures.ts';
import type { Chapter, Scenario, Scene } from './src/content/schema.ts';
import { yamlModuleSource } from './scripts/lib/yaml-module.ts';

/**
 * content/*.yaml as data, exactly as the game build emits it (cast.yaml for speaker labels). CR-38: the
 * harness adds the test-only register entries (tests/fixtures/brands-register.yaml) to brands.yaml, so the
 * Fairmeasure view has firms on both lists. Harness only; the game build never sees that file.
 */
function yamlPlugin(): Plugin {
  const scenarios = resolve(import.meta.dirname, 'content', 'scenarios');
  const brandsFile = resolve(import.meta.dirname, 'content', 'brands.yaml');
  const extraBrands = (parse(readFileSync(resolve(import.meta.dirname, 'tests', 'fixtures', 'brands-register.yaml'), 'utf8')) as { brands: unknown[] }).brands;
  return {
    name: 'harness-yaml',
    transform(code, id) {
      if (!/\.ya?ml$/.test(id)) return null;
      if (resolve(id) === brandsFile) {
        const doc = parse(code) as { brands: { id?: unknown }[] };
        // Same id: the test-only entry replaces the shipped one (as tests/unit/engine/fixture-brands.ts), so a
        // firm the shipped register lists (Dublin, T-3.10) is never shown twice.
        const extraIds = new Set((extraBrands as { id?: unknown }[]).map((b) => b.id));
        return { code: yamlModuleSource(id, stringify({ ...doc, brands: [...doc.brands.filter((b) => !extraIds.has(b.id)), ...extraBrands] }), scenarios), map: null };
      }
      return { code: yamlModuleSource(id, code, scenarios), map: null };
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

/**
 * CR-40 … CR-44: the finale fixture (tests/fixtures/finale): a slot-10 chapter with an arc finale block, its
 * scenarios and resolution scenes, played in the real App (`?view=app&arc=<C|A|B|R>`). A finished stub chapter
 * (`fxpast`, slot 1, the Berlin fixture resolution as its If-then) gives the Open Evening a postcard to pick, and
 * the authored Berlin arc beat (slot 1) gives the red-flag timeline one row with a real tell.
 */
const FINALE_DIR = resolve(import.meta.dirname, 'tests', 'fixtures', 'finale');
const yamlIn = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => parse(readFileSync(join(dir, f), 'utf8')) as unknown);
const pastResolution = { ...fixtureScene('berlin', 'berlin-resolution'), id: 'fxpast-resolution', chapter: 'fxpast' };
const finale = {
  chapters: [
    chapterSchema.parse(parse(readFileSync(join(FINALE_DIR, 'chapter.yaml'), 'utf8'))),
    chapterSchema.parse({ slot: 1, city: 'fxpast', name: 'Berlin', status: 'draft', patterns: ['smishing-parcel-fee'], lo_focus: ['LO-03'], scenario_order: { am: ['berlin-arc-alex-01'], pm: [] }, intro: 'Stub.', arc_beat: 'berlin-arc-alex-01', scenes: { resolution: 'fxpast-resolution' } }),
  ] as Chapter[],
  scenarios: [...yamlIn(join(FINALE_DIR, 'scenarios')), parse(readFileSync(resolve(import.meta.dirname, 'content', 'scenarios', 'berlin', 'berlin-arc-alex-01.yaml'), 'utf8')) as unknown].map((x) => scenarioSchema.parse(x)),
  scenes: [...yamlIn(join(FINALE_DIR, 'scenes')).map((x) => sceneSchema.parse(x)), pastResolution] as Scene[],
};

/** Fixture art plus the game's own brand marks (public/brands), so device headers load their logos. */
function harnessPublicDir(): string {
  const dir = fixturePublicDir();
  cpSync(resolve(import.meta.dirname, 'public', 'brands'), join(dir, 'brands'), { recursive: true });
  return dir;
}

export default defineConfig({
  root: resolve(import.meta.dirname, 'tests', 'e2e', 'harness'),
  base: '/',
  publicDir: harnessPublicDir(),
  define: { __HARNESS_SCENES__: JSON.stringify(scenes), __HARNESS_REAL_SCENES__: JSON.stringify(realScenes), __HARNESS_SCENARIOS__: JSON.stringify(fixtureScenarios), __HARNESS_FINALE__: JSON.stringify(finale) },
  plugins: [yamlPlugin(), preact()],
  build: { outDir: resolve(import.meta.dirname, 'dist-harness'), emptyOutDir: true, target: 'es2022' },
});
