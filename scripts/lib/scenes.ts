/**
 * Story scenes (S3): loading content/scenes/<folder>/<id>.yaml and the rules that need other files
 * (cast.yaml, chapter files, flags set by outcomes, the art under public/art). Within-file rules live in
 * sceneSchema (src/content/schema.ts). Used by content:validate and the Vite build.
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { INTERLUDE_FOLDER, sceneSchema, type CastMember, type Chapter, type Scene } from '../../src/content/schema.ts';
import { expressionsIn } from './art.ts';
import { svgSafetyIssues } from './svg-safety.ts';

export interface SceneRegistries {
  cast: ReadonlyMap<string, CastMember>;
  chapters: ReadonlyMap<string, Chapter>;
  /** Flags any outcome sets (sets_flags), for if_flag / unless_flag. */
  flagsSet: ReadonlySet<string>;
  /** public/ (art lives in public/art/cast and public/art/backdrops). */
  publicDir: string;
  habitCards?: ReadonlySet<string>;
}

export interface LoadedScene {
  file: string;
  scene: Scene;
}

type Report = { errors: string[]; warnings: string[] };

/** Parse every scene file; schema errors go to the report. `readYaml` is content.ts's safe reader. */
export function loadScenes(scenesDir: string, files: readonly string[], readYaml: (file: string) => unknown, report: Report): Map<string, LoadedScene> {
  const out = new Map<string, LoadedScene>();
  for (const file of files) {
    const rel = relative(scenesDir, file);
    if (rel.split(sep).length !== 2) {
      report.errors.push(`${file}: scenes live at content/scenes/<city or ${INTERLUDE_FOLDER}>/<id>.yaml`);
      continue;
    }
    let raw: unknown;
    try {
      raw = readYaml(file);
    } catch (e) {
      report.errors.push(`${file}: YAML error: ${(e as Error).message}`);
      continue;
    }
    const res = sceneSchema.safeParse(raw);
    if (!res.success) {
      report.errors.push(...res.error.issues.map((i) => `${file}: ${i.path.join('.') || '(root)'}: ${i.message}`));
      continue;
    }
    const scene = res.data;
    const folder = basename(dirname(file));
    if (scene.chapter !== folder) report.errors.push(`${file}: chapter "${scene.chapter}" does not match its folder "${folder}"`);
    if (basename(file).replace(/\.ya?ml$/, '') !== scene.id) report.errors.push(`${file}: the file name is the scene id ("${scene.id}.yaml")`);
    if (out.has(scene.id)) report.errors.push(`${file}: duplicate scene id "${scene.id}"`);
    out.set(scene.id, { file, scene });
  }
  return out;
}

const artCache = new Map<string, { exists: boolean; text: string }>();
function readArt(file: string): { exists: boolean; text: string } {
  let hit = artCache.get(file);
  if (!hit) {
    hit = existsSync(file) ? { exists: true, text: readFileSync(file, 'utf8') } : { exists: false, text: '' };
    artCache.set(file, hit);
  }
  return hit;
}
/** Tests swap art files between runs. */
export function clearSceneArtCache(): void {
  artCache.clear();
}

/** Arc characters (Alex) by id, and their names for the "no scene comments on Alex" rule. */
function arcCast(cast: ReadonlyMap<string, CastMember>): CastMember[] {
  return [...cast.values()].filter((c) => c.arc_character);
}

/**
 * Words that point at an arc character (review T-S3 item 20): the first name, and the capitalised names in
 * their role ("Friend met on Wordswap" → Wordswap; the role's first word is ordinary).
 */
export function arcTerms(c: Pick<CastMember, 'name' | 'role'>): string[] {
  const first = c.name.split(/\s+/)[0] ?? c.name;
  const named = c.role.split(/\s+/).slice(1).filter((w) => /^\p{Lu}/u.test(w)).map((w) => w.replace(/[^\p{L}\p{N}-]/gu, ''));
  return [...new Set([first, ...named].filter(Boolean))];
}

function mentions(text: string, term: string): boolean {
  return new RegExp(`(?<![\\p{L}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'iu').test(text);
}

/**
 * Soft checks for authors (review T-S3 item 22), reported as warnings: a choice prompt that repeats the
 * panel's line, a plain-wall panel (no backdrop, nobody drawn) with an alt that describes more than that,
 * and an interlude that names a chapter city (interludes are keyed to play position, not to a city).
 */
export function sceneWarnings(sc: Scene, chapterNames: readonly string[]): string[] {
  const out: string[] = [];
  const norm = (x: string) => x.trim().replace(/\s+/g, ' ').toLowerCase();
  sc.panels.forEach((p, i) => {
    const where = `panels.${i}`;
    if (p.choice && p.line && norm(p.choice.prompt) === norm(p.line)) out.push(`${where}: choice.prompt repeats the line; the line is shown once, so drop one`);
    const drawn = (p.speaker && p.speaker !== 'you') || p.with;
    if (!p.backdrop && !drawn && p.alt.trim().length > PLAIN_PANEL_ALT) out.push(`${where}: nothing is drawn here (no backdrop or character), but the alt describes a picture; keep it short (ART_DIRECTION §9)`);
    if (sc.slot === 'interlude') {
      const text = [p.line, p.caption, p.alt, p.choice?.prompt, p.choice?.reply, ...(p.choice?.options ?? [])].filter(Boolean).join(' ');
      for (const name of chapterNames) if (mentions(text, name)) out.push(`${where}: interludes do not name a chapter city ("${name}"); use {lastCity} or none (STORY §3.12)`);
    }
  });
  return out;
}

/** A plain-wall panel's alt: "Plain background." and the like. */
const PLAIN_PANEL_ALT = 40;

/** Rules for one scene that need the registries and the art. */
export function sceneRules(sc: Scene, reg: SceneRegistries): string[] {
  const out: string[] = [];
  const arc = arcCast(reg.cast);
  const portrait = (who: string, expression: string, where: string) => {
    const member = reg.cast.get(who);
    if (!member) {
      out.push(`${where}: unknown cast id "${who}" (add it to content/cast.yaml)`);
      return;
    }
    if (member.arc_character) {
      out.push(`${where}: ${member.name} never appears in a scene and has no scene lines (STORY §2.2)`);
      return;
    }
    const file = join(reg.publicDir, 'art', 'cast', `${who}.svg`);
    const art = readArt(file);
    if (!art.exists) {
      out.push(`${where}: portrait public/art/cast/${who}.svg does not exist`);
      return;
    }
    for (const i of svgSafetyIssues(art.text)) out.push(`${where}: public/art/cast/${who}.svg: ${i.message}`);
    if (!expressionsIn(art.text).has(expression)) out.push(`${where}: public/art/cast/${who}.svg has no expression group "x-${expression}"`);
  };
  sc.panels.forEach((p, i) => {
    const where = `panels.${i}`;
    if (p.speaker && p.speaker !== 'you') portrait(p.speaker, p.expression ?? 'calm', `${where}.speaker`);
    if (p.with) portrait(p.with.id, p.with.expression, `${where}.with`);
    if (p.backdrop) {
      const file = join(reg.publicDir, 'art', 'backdrops', `${p.backdrop}.svg`);
      const art = readArt(file);
      if (!art.exists) out.push(`${where}.backdrop: public/art/backdrops/${p.backdrop}.svg does not exist`);
      else for (const x of svgSafetyIssues(art.text)) out.push(`${where}.backdrop: ${x.message}`);
    }
    for (const flag of [p.if_flag, p.unless_flag]) {
      if (flag && !reg.flagsSet.has(flag)) out.push(`${where}: flag "${flag}" is not set by any outcome (story-only variant flags come from a chapter spec, STORY §4.2 rule 5)`);
    }
    // STORY §2.2: no scene comments on the arc character: their name or the app they were met on.
    const text = [p.line, p.caption, p.alt, p.choice?.prompt, p.choice?.reply, ...(p.choice?.options ?? []), p.if_then?.cue, p.if_then?.action, p.if_then?.extra, p.local?.text, p.local?.translation].filter(Boolean).join(' ');
    for (const c of arc) for (const term of arcTerms(c)) if (mentions(text, term)) out.push(`${where}: scenes never mention ${term} (STORY §2.2)`);
  });
  const sceneWide = [sc.title, sc.content_note].filter(Boolean).join(' ');
  for (const c of arc) for (const term of arcTerms(c)) if (mentions(sceneWide, term)) out.push(`title/content_note: scenes never mention ${term} (STORY §2.2)`);
  if (sc.slot !== 'interlude') {
    const ch = reg.chapters.get(sc.chapter);
    if (!ch) out.push(`chapter "${sc.chapter}" has no content/chapters/${sc.chapter}.yaml`);
    else if (sc.sensitive && !sc.content_note && !ch.content_note) out.push('a sensitive scene needs a content note (its own content_note or the chapter\'s, STORY §5.6)');
  } else if (sc.sensitive && !sc.content_note) {
    out.push('a sensitive interlude needs its own content_note');
  }
  return out;
}

/** Rules across scenes and chapters: placement references, slots, If-then panels, orphans, interludes. */
export function sceneSetRules(scenes: ReadonlyMap<string, LoadedScene>, chapters: ReadonlyMap<string, { file: string; chapter: Chapter }>, habitCards?: ReadonlySet<string>): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const placed = new Set<string>();
  for (const { file, chapter } of chapters.values()) {
    for (const id of chapter.atlas_cards ?? []) if (habitCards && !habitCards.has(id)) errors.push(`${file}: atlas_cards: unknown habit card "${id}"`);
    const sc = chapter.scenes;
    if (!sc) continue;
    const want: [string | undefined, string, readonly string[]][] = [
      [sc.arrival, 'arrival', ['arrival']],
      [sc.turn, 'turn', ['turn']],
      [sc.resolution, 'resolution', ['resolution']],
      ...sc.placed.map((p, i): [string, string, readonly string[]] => [p.scene, `placed.${i}`, ['beat', 'turn']]),
    ];
    for (const [id, where, slots] of want) {
      if (!id) continue;
      placed.add(id);
      const hit = scenes.get(id);
      if (!hit) {
        errors.push(`${file}: scenes.${where}: no scene "${id}" in content/scenes/${chapter.city}/`);
        continue;
      }
      if (hit.scene.chapter !== chapter.city) errors.push(`${file}: scenes.${where}: "${id}" belongs to "${hit.scene.chapter}"`);
      if (!slots.includes(hit.scene.slot)) errors.push(`${file}: scenes.${where}: "${id}" has slot ${hit.scene.slot} (expected ${slots.join(' or ')})`);
    }
    if (sc.resolution) {
      const r = scenes.get(sc.resolution)?.scene;
      if (r && !r.panels.at(-1)?.if_then) errors.push(`${file}: scenes.resolution: "${sc.resolution}" must end on the If-then panel (STORY §4.4)`);
    }
  }
  const byPosition = new Map<number, string>();
  for (const [id, { file, scene }] of scenes) {
    if (scene.slot === 'interlude') {
      const other = byPosition.get(scene.after_middle ?? 0);
      if (other) errors.push(`${file}: after_middle ${scene.after_middle} is also used by "${other}"`);
      byPosition.set(scene.after_middle ?? 0, id);
      continue;
    }
    if (!placed.has(id)) warnings.push(`${file}: scene "${id}" is not placed in content/chapters/${scene.chapter}.yaml (scenes:)`);
  }
  return { errors, warnings };
}

/** Local cast per chapter (for the art budget): every drawn speaker and listener in its scenes. */
export function castByChapter(scenes: Iterable<LoadedScene>): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const { scene } of scenes) {
    if (scene.slot === 'interlude') continue;
    const set = out.get(scene.chapter) ?? new Set<string>();
    for (const p of scene.panels) {
      if (p.speaker && p.speaker !== 'you') set.add(p.speaker);
      if (p.with) set.add(p.with.id);
    }
    out.set(scene.chapter, set);
  }
  return out;
}
