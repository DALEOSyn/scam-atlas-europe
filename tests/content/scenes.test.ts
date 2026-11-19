/**
 * S3 scene content type: schema rules (STORY §4, §5; ART_DIRECTION §9), cross-file validator rules
 * (cast, art fragments, chapters, flags), art budget and rig checks (ART_DIRECTION §11, §12), and
 * red-line lint over scene files.
 */
import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARC_CAST, artFile, artIssues, budgetIssues, castListIssues, expressionsIn, fileIssues, paletteFromDoc, RECURRING_CAST, rigIssues } from '../../scripts/lib/art.ts';
import { listFiles, loadCast, readYaml, validateContent, validateScenes, type ContentReport } from '../../scripts/lib/content.ts';
import { arcTerms, castByChapter, clearSceneArtCache, loadScenes, sceneRules, sceneSetRules, sceneWarnings } from '../../scripts/lib/scenes.ts';
import { yamlModuleData } from '../../scripts/lib/yaml-module.ts';
import { lintText, loadConfig } from '../../scripts/redline-lint.ts';
import { chapterSchema, sceneArtefacts, type Chapter } from '../../src/content/schema.ts';
import { CONTENT, DOCS, ROOT } from './fixtures.ts';
import { fixturePublicDir, fixtureScene, rawFixtureScene, rawScene, rigSvg, SAMPLES, SCENE_FIXTURES, sceneIssues, type Raw } from './scene-fixtures.ts';

/** The first panel of a parsed scene (fixtures always have one). */
function first<T>(xs: readonly T[]): T {
  const x = xs[0];
  if (x === undefined) throw new Error('fixture has no panels');
  return x;
}

const panel = (over: Raw = {}): Raw => ({ ...((rawScene().panels as Raw[])[0] as Raw), ...over });
const withPanels = (...panels: Raw[]): Raw => rawScene({ panels });

const emptyReport = (): ContentReport => ({ errors: [], warnings: [], scenarios: new Map(), chapters: new Map(), scenes: new Map() });

function berlinChapter(scenes?: Raw): Chapter {
  const raw = readYaml(join(CONTENT, 'chapters', 'berlin.yaml')) as Raw;
  return chapterSchema.parse(scenes ? { ...raw, scenes } : raw);
}

describe('scene schema (STORY §4.5)', () => {
  it('the fixtures parse', () => {
    for (const [folder, id] of [
      ['berlin', 'berlin-arrival'],
      ['berlin', 'berlin-turn'],
      ['berlin', 'berlin-resolution'],
      ['interludes', 'interlude-cafe'],
    ] as const) {
      expect(sceneIssues(rawFixtureScene(folder, id)), id).toEqual([]);
    }
  });
  it('a cast speaker needs an expression; the player and narration never have one', () => {
    expect(sceneIssues(withPanels(panel({ expression: undefined }))).join('\n')).toMatch(/needs an expression/);
    expect(sceneIssues(withPanels(panel({ speaker: 'you', alt: 'The courtyard.' }))).join('\n')).toMatch(/only a cast speaker has an expression/);
    expect(sceneIssues(withPanels({ caption: 'Later.', alt: 'The courtyard.' }))).toEqual([]);
  });
  it('lines are at most 25 words', () => {
    const long = Array.from({ length: 26 }, () => 'word').join(' ');
    expect(sceneIssues(withPanels(panel({ line: long }))).join('\n')).toMatch(/at most 25 words/);
  });
  it('no scam artefacts: URLs, domains, e-mail, IBANs, phone numbers, codes, masked digits, amounts', () => {
    for (const bad of [
      'Open trundle.example/p/1 now.',
      'Go to https://x.test please.',
      'Write to help@desk.example today.',
      'Pay into NL00 TEST 0000 0000 00 now.',
      'Call +49 151 2345 678 back.',
      'The code is 4821.',
      'It ends in ••17, see?',
      'Only €2 to pay.',
      'Only 2 euros to pay.',
      // Evasions (sceptic T-S3 review).
      'Go to parcel-help dot example now.',
      'Go to parcel\u200b.example now.',
      'Go to parcel.\u2060example now.',
      'Type parcel help dot example slash pay.',
      'Write to user at parcel dot example.',
      'Open www . parcel . example today.',
      'See parcel-help[.]example for it.',
      'See parcel-help。example for it.',
      'Call ０１５１２３４５６７８ today.',
      'Call ٠١٥١٢٣٤٥٦٧ today.',
      'Call 𝟎𝟏𝟓𝟏𝟐𝟑𝟒𝟓 today.',
      'Ring ＋31 6 now.',
      'Mail user＠parcel please.',
      'Open hxxps://parcel quickly.',
      'Code is 1 2 3 4.',
    ]) {
      expect(sceneArtefacts(bad), bad).not.toEqual([]);
      expect(sceneIssues(withPanels(panel({ line: bad }))).join('\n'), bad).toMatch(/no scam artefacts/);
    }
    for (const ok of ['Coffee at 8 a.m., then the market.', 'Twenty-two years. Now I have no plan…', 'Mia turns eight on Saturday.', 'The Atlas has {count} pages now.', 'Good point. Then we call.', 'Wait…what? Fine.', 'A polka dot dress, on the 3rd.']) {
      expect(sceneArtefacts(ok), ok).toEqual([]);
    }
  });
  it('content notes and titles are checked too (scene and chapter)', () => {
    expect(sceneIssues(rawScene({ sensitive: true, content_note: 'See parcel dot example.' })).join('\n')).toMatch(/content_note: no scam artefacts/);
    expect(sceneIssues(rawScene({ title: 'Code 1 2 3 4' })).join('\n')).toMatch(/title: no scam artefacts/);
    expect(sceneIssues(rawScene({ title: 'Open Evening' }))).toEqual([]);
    const raw = readYaml(join(CONTENT, 'chapters', 'berlin.yaml')) as Raw;
    const r = chapterSchema.safeParse({ ...raw, content_note: 'A story.', content_note_arc_closed: 'Call ０１５１２３４５６７８.' });
    expect(r.success ? '' : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')).toMatch(/content_note_arc_closed: no scam artefacts/);
  });
  it('alt text contains the fixed expression word and stays short (ART_DIRECTION §9)', () => {
    expect(sceneIssues(withPanels(panel({ expression: 'worried', alt: 'Jonas in the courtyard, worried.' }))).join('\n')).toMatch(/must contain "looking worried"/);
    expect(sceneIssues(withPanels(panel({ expression: 'sheepish', alt: 'Jonas, with a sheepish smile.' })))).toEqual([]);
    expect(sceneIssues(withPanels(panel({ expression: 'relieved-parcels', alt: 'Jonas, relieved, holding two parcels.' })))).toEqual([]);
    expect(sceneIssues(withPanels(panel({ alt: `Jonas smiling ${'x'.repeat(150)}` }))).join('\n')).toMatch(/at most 150 characters/);
    expect(sceneIssues(withPanels({ caption: 'Later.', alt: 'x'.repeat(81) })).join('\n')).toMatch(/at most 80 characters/);
    expect(sceneIssues(withPanels(panel({ alt: 'Image of Jonas smiling.' }))).join('\n')).toMatch(/does not start with "Image of"/);
  });
  it('a sensitive scene never ends on worried or sheepish, also when the last panels are variants', () => {
    const worried = panel({ expression: 'worried', alt: 'Jonas, looking worried.' });
    expect(sceneIssues(rawScene({ sensitive: true, panels: [panel(), worried] })).join('\n')).toMatch(/never ends on worried/);
    expect(sceneIssues(rawScene({ sensitive: false, panels: [panel(), worried] }))).toEqual([]);
    expect(sceneIssues(rawScene({ sensitive: true, panels: [worried, panel()] }))).toEqual([]);
    const variant = panel({ expression: 'sheepish', alt: 'Jonas, with a sheepish smile.', if_flag: 'x_flag' });
    expect(sceneIssues(rawScene({ sensitive: true, panels: [panel(), variant] })).join('\n')).toMatch(/never ends on sheepish/);
  });
  it('the If-then panel: resolution only, last, cue "If…" and action "then…", spoken by a cast member', () => {
    const ifThen = panel({ line: undefined, expression: 'proud', alt: 'Jonas, proud.', if_then: { cue: 'If a parcel message wants money,', action: 'then I open the app myself.' } });
    expect(sceneIssues(rawScene({ slot: 'resolution', panels: [panel(), ifThen] }))).toEqual([]);
    expect(sceneIssues(rawScene({ slot: 'arrival', panels: [panel(), ifThen] })).join('\n')).toMatch(/in a resolution scene/);
    expect(sceneIssues(rawScene({ slot: 'resolution', panels: [ifThen, panel()] })).join('\n')).toMatch(/is the last panel/);
    expect(sceneIssues(rawScene({ slot: 'resolution', panels: [{ ...ifThen, if_then: { cue: 'When x,', action: 'I do y.' } }] })).join('\n')).toMatch(/starts with "If"/);
  });
  it('choices: at most one per scene, 2–3 options, no flag fields; flip the postcard only in interludes and resolutions', () => {
    const choice = { prompt: 'First move?', options: ['Pause', 'Ask someone'], reply: 'Both work.' };
    expect(sceneIssues(withPanels(panel({ choice })))).toEqual([]);
    expect(sceneIssues(withPanels(panel({ choice }), panel({ choice }))).join('\n')).toMatch(/at most one choice/);
    expect(sceneIssues(withPanels(panel({ choice: { ...choice, options: ['Only one'] } }))).join('\n')).toMatch(/options/);
    expect(sceneIssues(withPanels(panel({ choice: { ...choice, sets_flag: 'x' } }))).join('\n')).toMatch(/Unrecognized key/);
    expect(sceneIssues(withPanels(panel({ line: undefined, flip_postcard: true }))).join('\n')).toMatch(/for interludes and the Open Evening/);
  });
  it('interludes: folder interludes, after_middle 2/4/6/8, at most 4 panels; {count} only there', () => {
    expect(sceneIssues(rawScene({ chapter: 'interludes', slot: 'interlude' })).join('\n')).toMatch(/after_middle is required/);
    expect(sceneIssues(rawScene({ chapter: 'interludes', slot: 'interlude', after_middle: 3 })).join('\n')).toMatch(/after_middle/);
    expect(sceneIssues(rawScene({ chapter: 'interludes', slot: 'interlude', after_middle: 2, panels: Array.from({ length: 5 }, () => panel()) })).join('\n')).toMatch(/at most 4 panels/);
    expect(sceneIssues(withPanels(panel({ line: 'The Atlas has {count} pages.' }))).join('\n')).toMatch(/for interludes/);
    expect(sceneIssues(withPanels(panel({ line: 'Hello {name}.' }))).join('\n')).toMatch(/only \{count\} and \{lastCity\}/);
  });
  it('listeners are calm or warm only; at most one local-language phrase', () => {
    expect(sceneIssues(withPanels(panel({ with: { id: 'mateus', expression: 'laughing' } }))).join('\n')).toMatch(/calm or warm only/);
    const local = { text: 'Hallo.', lang: 'de', translation: 'Hello.' };
    expect(sceneIssues(withPanels(panel({ local }), panel({ local }))).join('\n')).toMatch(/one local-language phrase/);
  });
});

describe('scene validator (cross-file rules)', () => {
  const publicDir = fixturePublicDir();
  const report = emptyReport();
  const cast = loadCast(CONTENT, report);
  const chapters = new Map([['berlin', berlinChapter()]]);
  const reg = { cast, chapters, flagsSet: new Set(['berlin_test_variant']), publicDir };

  it('fixture scenes pass: portraits, expression fragments and backdrops exist', () => {
    clearSceneArtCache();
    for (const id of ['berlin-arrival', 'berlin-turn', 'berlin-resolution']) expect(sceneRules(fixtureScene('berlin', id), reg), id).toEqual([]);
    expect(sceneRules(fixtureScene('interludes', 'interlude-cafe'), reg)).toEqual([]);
  });
  it('an expression whose #x-<expression> group is missing from the SVG fails', () => {
    const s = fixtureScene('berlin', 'berlin-arrival');
    const bad = { ...s, panels: [{ ...first(s.panels), expression: 'focused', alt: 'Jonas, concentrating.' }] };
    expect(sceneRules(bad, reg).join('\n')).toMatch(/jonas\.svg has no expression group "x-focused"/);
    const pose = { ...s, panels: [{ ...first(s.panels), expression: 'relieved-parcels', alt: 'Jonas, relieved, with parcels.' }] };
    expect(sceneRules(pose, reg).join('\n')).toMatch(/no expression group "x-relieved-parcels"/);
  });
  it('missing portraits and backdrops fail; unknown cast fails', () => {
    const s = fixtureScene('berlin', 'berlin-arrival');
    const p = first(s.panels);
    expect(sceneRules({ ...s, panels: [{ ...p, speaker: 'sanne' }] }, reg).join('\n')).toMatch(/unknown cast id "sanne"/);
    expect(sceneRules({ ...s, panels: [{ ...p, speaker: 'noor' }] }, reg).join('\n')).toMatch(/cast\/noor\.svg does not exist/);
    expect(sceneRules({ ...s, panels: [{ ...p, backdrop: 'berlin-station' }] }, reg).join('\n')).toMatch(/berlin-station\.svg does not exist/);
  });
  it('Alex never has scene lines, never appears as a listener, and is never mentioned', () => {
    const s = fixtureScene('berlin', 'berlin-arrival');
    const p = first(s.panels);
    expect(sceneRules({ ...s, panels: [{ ...p, speaker: 'alex' }] }, reg).join('\n')).toMatch(/never appears in a scene and has no scene lines/);
    expect(sceneRules({ ...s, panels: [{ ...p, with: { id: 'alex', expression: 'calm' } }] }, reg).join('\n')).toMatch(/never appears in a scene/);
    expect(sceneRules({ ...s, panels: [{ ...p, line: 'Did Alex write back?' }] }, reg).join('\n')).toMatch(/never mention Alex/);
    // Item 20: every text field of a panel, the scene title and content note, and the app Alex was met on.
    expect(arcTerms({ name: 'Alex', role: 'Friend met on Wordswap' })).toEqual(['Alex', 'Wordswap']);
    const r = (panel: Partial<typeof p>, scene: Partial<typeof s> = {}) => sceneRules({ ...s, ...scene, panels: [{ ...p, ...panel }] }, reg).join('\n');
    const ifThen = { cue: 'If Alex asks for money,', action: 'then I talk to someone first.' };
    expect(r({ if_then: ifThen })).toMatch(/never mention Alex/);
    expect(r({ if_then: { cue: 'If a message asks for money,', action: 'then I ask on Wordswap.' } })).toMatch(/never mention Wordswap/);
    expect(r({ local: { lang: 'de', text: 'Alex?', translation: 'Alex?' } })).toMatch(/never mention Alex/);
    expect(r({ local: { lang: 'de', text: 'Hallo.', translation: 'Wordswap hello.' } })).toMatch(/never mention Wordswap/);
    expect(r({ line: 'Still on wordswap?' })).toMatch(/never mention Wordswap/);
    expect(r({}, { content_note: 'A story about Alex.' })).toMatch(/never mention Alex/);
    expect(r({}, { title: 'Wordswap' })).toMatch(/never mention Wordswap/);
    expect(r({ line: 'Alexandra waved.' })).not.toMatch(/never mention/);
  });
  it('soft warnings: prompt repeats the line, a plain-wall panel with a long alt, an interlude naming a city (item 22)', () => {
    const s = fixtureScene('berlin', 'berlin-turn');
    const p = first(s.panels);
    expect(sceneWarnings(s, ['Berlin'])).toEqual([]);
    const choice = { prompt: 'What now?', options: ['Pause', 'Ask someone'], reply: 'Both work.' };
    expect(sceneWarnings({ ...s, panels: [{ ...p, line: 'What now?', choice }] }, []).join('\n')).toMatch(/choice\.prompt repeats the line/);
    const plain = { ...p, backdrop: undefined, speaker: undefined, expression: undefined, with: undefined, alt: 'A busy street market with stalls, bikes and a fountain in the sun.' };
    expect(sceneWarnings({ ...s, panels: [plain] }, []).join('\n')).toMatch(/nothing is drawn here/);
    expect(sceneWarnings({ ...s, panels: [{ ...plain, alt: 'Plain background.' }] }, [])).toEqual([]);
    const inter = fixtureScene('interludes', 'interlude-cafe');
    const ip = first(inter.panels);
    expect(sceneWarnings(inter, ['Berlin', 'Rome'])).toEqual([]);
    expect(sceneWarnings({ ...inter, panels: [{ ...ip, caption: 'Back from Rome.' }] }, ['Berlin', 'Rome']).join('\n')).toMatch(/do not name a chapter city \("Rome"\)/);
    // Chapter scenes may name their city.
    expect(sceneWarnings({ ...s, panels: [{ ...p, line: 'Welcome to Berlin.' }] }, ['Berlin'])).toEqual([]);
  });
  it('the art budget cast lists agree with content/cast.yaml (item 21)', () => {
    expect(castListIssues(cast.values())).toEqual([]);
    expect(RECURRING_CAST.every((id) => cast.get(id)?.recurring)).toBe(true);
    expect(ARC_CAST.every((id) => cast.get(id)?.arc_character)).toBe(true);
    const drifted = [...cast.values()].map((c) => (c.id === 'noor' ? { ...c, recurring: false } : c.id === 'jonas' ? { ...c, recurring: true } : c));
    expect(castListIssues(drifted).join('\n')).toMatch(/recurring cast \[.*jonas.*\] differs from RECURRING_CAST/);
  });
  it('variant flags must be set by an outcome; sensitive scenes need a content note', () => {
    const s = fixtureScene('berlin', 'berlin-resolution');
    expect(sceneRules(s, { ...reg, flagsSet: new Set() }).join('\n')).toMatch(/flag "berlin_test_variant" is not set by any outcome/);
    expect(sceneRules({ ...s, sensitive: true }, reg).join('\n')).toMatch(/needs a content note/);
    expect(sceneRules({ ...s, sensitive: true, content_note: 'A family story. Everyone ends up safe.' }, reg)).toEqual([]);
  });
  it('chapter placement: slots match, the resolution ends on its If-then panel, unplaced scenes warn, interlude positions are unique', () => {
    const r = { errors: [] as string[], warnings: [] as string[] };
    const scenes = loadScenes(SCENE_FIXTURES, listFiles(SCENE_FIXTURES, ['.yaml']), readYaml, r);
    expect(r.errors).toEqual([]);
    expect(scenes.size).toBe(4);
    const ok = berlinChapter({ arrival: 'berlin-arrival', turn: 'berlin-turn', resolution: 'berlin-resolution' });
    expect(sceneSetRules(scenes, new Map([['berlin', { file: 'berlin.yaml', chapter: ok }]]))).toEqual({ errors: [], warnings: [] });
    const swapped = berlinChapter({ arrival: 'berlin-turn', resolution: 'berlin-arrival' });
    const res = sceneSetRules(scenes, new Map([['berlin', { file: 'berlin.yaml', chapter: swapped }]]));
    expect(res.errors.join('\n')).toMatch(/scenes\.arrival: "berlin-turn" has slot turn/);
    expect(res.errors.join('\n')).toMatch(/must end on the If-then panel|has slot arrival/);
    expect(res.warnings.join('\n')).toMatch(/"berlin-resolution" is not placed/);
    expect(castByChapter(scenes.values()).get('berlin')).toEqual(new Set(['jonas', 'mateus']));
  });
  it('chapter schema: placed beats name a scenario; a turn needs a stop point', () => {
    const raw = readYaml(join(CONTENT, 'chapters', 'berlin.yaml')) as Raw;
    const bad = chapterSchema.safeParse({ ...raw, scenes: { placed: [{ scene: 'x', after: 'nope' }] } });
    expect(bad.success).toBe(false);
    const noStop = chapterSchema.safeParse({ ...raw, scenario_order: { am: ['berlin-01-locker-code'], pm: [] }, boss: undefined, arc_beat: undefined, status: 'draft', scenes: { turn: 'berlin-turn' } });
    expect(noStop.success ? [] : noStop.error.issues.map((i) => i.message).join('\n')).toMatch(/no stop point/);
  });
  it('validateScenes reads content/scenes and the art; a repo with zero scenes is valid', () => {
    const real = validateContent(CONTENT);
    expect(real.errors).toEqual([]);
    expect(real.scenes?.size).toBe(0);
    // A content dir with the fixture scenes and the real registries.
    const contentDir = mkdtempSync(join(tmpdir(), 'sae-content-'));
    mkdirSync(join(contentDir, 'scenes', 'berlin'), { recursive: true });
    for (const id of ['berlin-arrival', 'berlin-turn', 'berlin-resolution']) writeFileSync(join(contentDir, 'scenes', 'berlin', `${id}.yaml`), readFileSync(join(SCENE_FIXTURES, 'berlin', `${id}.yaml`)));
    const rep = emptyReport();
    const ch = berlinChapter({ arrival: 'berlin-arrival', turn: 'berlin-turn', resolution: 'berlin-resolution' });
    validateScenes(contentDir, DOCS, rep, { cast, chapters: new Map([['berlin', { file: 'berlin.yaml', chapter: ch }]]), flagsSet: new Set(['berlin_test_variant']), habitCards: new Set() }, publicDir);
    expect(rep.errors).toEqual([]);
    expect(rep.scenes?.size).toBe(3);
  });
  it('the build emits scenes with schema defaults and the cast as a projection without notes', () => {
    const file = join(ROOT, 'content', 'scenes', 'berlin', 'berlin-arrival.yaml');
    const data = yamlModuleData(file, readFileSync(join(SCENE_FIXTURES, 'berlin', 'berlin-arrival.yaml'), 'utf8'), join(ROOT, 'content', 'scenarios')) as { sensitive: boolean; panels: { crop: string }[] };
    expect(data.sensitive).toBe(false);
    expect(data.panels[0]?.crop).toBe('centre');
    const cast = yamlModuleData(join(CONTENT, 'cast.yaml'), readFileSync(join(CONTENT, 'cast.yaml'), 'utf8'), join(CONTENT, 'scenarios')) as Raw[];
    expect(cast.find((c) => c.id === 'teo')).toEqual({ id: 'teo', name: 'Grandpa Teo', role: 'Family back home', arc_character: false });
  });
});

describe('red-line lint covers scenes like scenarios', () => {
  it('a real-looking domain or phone number in a scene file is an error', () => {
    const cfg = loadConfig();
    const file = join(CONTENT, 'scenes', 'berlin', 'bad.yaml');
    const text = readFileSync(join(SCENE_FIXTURES, 'berlin', 'berlin-arrival.yaml'), 'utf8').replace("Bikes, boxes, birthday presents.", 'See parcels-now.com for more.');
    expect(lintText(file, text, cfg).some((f) => f.severity === 'error' && f.category === 'domain')).toBe(true);
    const clean = readFileSync(join(SCENE_FIXTURES, 'berlin', 'berlin-arrival.yaml'), 'utf8');
    expect(lintText(file, clean, cfg).filter((f) => f.severity === 'error')).toEqual([]);
  });
});

describe('story-layer art (ART_DIRECTION §11, §12)', () => {
  const palette = paletteFromDoc(readFileSync(join(DOCS, 'ART_DIRECTION.md'), 'utf8'));
  const sample = (f: string) => readFileSync(join(SAMPLES, f), 'utf8');

  it('the samples meet the file rules (the Teo sample shows warm by default, so only the x-calm rule fails)', () => {
    expect(fileIssues(artFile('backdrops/berlin-courtyard.svg', sample('sample-backdrop-berlin-courtyard.svg')), palette)).toEqual([]);
    expect(fileIssues(artFile('frames/postcard-stamp.svg', sample('sample-postcard-frame.svg')), palette)).toEqual([]);
    expect(fileIssues(artFile('cast/teo.svg', sample('sample-portrait-teo.svg')), palette)).toEqual(['art/cast/teo.svg: the default group x-calm (class "x x-default") is always last (ART_DIRECTION §4.2)']);
    expect(fileIssues(artFile('cast/teo.svg', rigSvg(['calm', 'thinking'])), palette)).toEqual([]);
  });
  it('rig contract: groups from the shared set, x-calm last and default; Alex has no groups', () => {
    expect(expressionsIn(rigSvg(['warm', 'calm']))).toEqual(new Set(['warm', 'calm']));
    expect(rigIssues(artFile('cast/teo.svg', rigSvg(['calm', 'angry']))).join('\n')).toMatch(/"x-angry" is not x-<expression>/);
    expect(rigIssues(artFile('cast/alex.svg', rigSvg(['calm']))).join('\n')).toMatch(/Alex is one image/);
  });
  it('file rules: header, allowed elements, no lettering, filters, fixed size, precision, palette', () => {
    const base = sample('sample-backdrop-berlin-courtyard.svg');
    const f = (text: string) => fileIssues(artFile('backdrops/berlin-courtyard.svg', text), palette).join('\n');
    expect(f(base.replace('<!-- Scam Atlas', '<!-- Scam Atlas!'))).toMatch(/header comment/);
    expect(f(base.replace('</svg>', '<text x="1" y="2">Hi</text></svg>'))).toMatch(/<text>/);
    expect(f(base.replace('</svg>', '<rect filter="url(#f)"/></svg>'))).toMatch(/no filters/);
    expect(f(base.replace('viewBox="0 0 960 540"', 'viewBox="0 0 960 540" width="960"'))).toMatch(/no fixed width/);
    expect(f(base.replace('</svg>', '<rect x="1.25" y="2" width="3" height="4" fill="#cfdde6"/></svg>'))).toMatch(/one decimal place/);
    expect(f(base.replace('</svg>', '<rect width="3" height="4" fill="#ff0000"/></svg>'))).toMatch(/not in the art palette.*#ff0000/);
  });
  it('budgets: per file, per chapter (backdrops + locals), shared and total', () => {
    const big = (rel: string, kb: number) => ({ rel, text: '', raw: kb * 1024, gzip: Math.round((kb * 1024) / 3) });
    expect(budgetIssues([big('cast/teo.svg', 17)]).join('\n')).toMatch(/art\/cast\/teo\.svg: 17\.0 KB raw is over the 16\.0 KB/);
    expect(budgetIssues([big('cast/jonas.svg', 13)]).join('\n')).toMatch(/12\.0 KB/);
    expect(budgetIssues([big('cast/alex.svg', 9)]).join('\n')).toMatch(/8\.0 KB/);
    expect(budgetIssues([big('backdrops/berlin-courtyard.svg', 23), big('backdrops/berlin-door.svg', 23), big('backdrops/berlin-yard.svg', 23)])).toEqual([]);
    const chapter = budgetIssues([big('backdrops/berlin-a.svg', 23), big('backdrops/berlin-b.svg', 23), big('backdrops/berlin-c.svg', 23), big('cast/jonas.svg', 4)], new Map([['berlin', new Set(['jonas', 'teo'])]]));
    expect(chapter.join('\n')).toMatch(/chapter "berlin" art \(backdrops \+ locals\): 73\.0 KB raw is over the 72\.0 KB/);
  });
  it('the shipped art passes, and the fixture art dir passes the whole check', () => {
    expect(artIssues(join(ROOT, 'public', 'art'), { docsDir: DOCS }).errors).toEqual([]);
    expect(artIssues(join(fixturePublicDir(), 'art'), { docsDir: DOCS }).errors).toEqual([]);
  });
});
