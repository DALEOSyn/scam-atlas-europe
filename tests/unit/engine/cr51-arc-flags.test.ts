/**
 * CR-51 (R25(5)): the engine sets `arc_told_someone` when any arc slot's decisive kind was `report` or
 * `ask_someone`; the close beat's solo photo check sets `arc_checked` (validator), never `arc_told_someone`;
 * Teo's chat is unchanged. Ending scenes may gate on both flags.
 */
import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { readYaml } from '../../../scripts/lib/content.ts';
import { ARC_CHECKED, ARC_TOLD_SOMEONE, scenarioSchema, sceneSchema, type Chapter, type Scenario } from '../../../src/content/schema.ts';
import { arcSlotFlags } from '../../../src/engine/arc.ts';
import { beginChapter, commitScenario } from '../../../src/engine/game.ts';
import { resultOf } from '../../../src/engine/result.ts';
import { freshSave } from '../../../src/engine/save.ts';
import { visiblePanels } from '../../../src/engine/story.ts';
import { ROOT } from '../../content/fixtures.ts';
import { act, B, ctx, run, type Raw } from './helpers.ts';

const FINALE = resolve(ROOT, 'tests', 'fixtures', 'finale');
const rawFinale = (file: string): Raw => structuredClone(readYaml(join(FINALE, 'scenarios', file)) as Raw);
const outcomes = (r: Raw): Record<string, Raw> => r.outcomes as Record<string, Raw>;
function schemaErrors(r: Raw): string {
  const res = scenarioSchema.safeParse(r);
  return res.success ? '' : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
}
const shipped = (city: string, id: string): Scenario => scenarioSchema.parse(readYaml(resolve(ROOT, 'content', 'scenarios', city, `${id}.yaml`)));

/** Play one action of an arc slot beat and commit it; the game-wide flags after it. */
function flagsAfter(s: Scenario, actionId: string): string[] {
  const c = { city: 'lisbon', scenario_order: { am: [s.id], pm: [] } } as unknown as Pick<Chapter, 'city' | 'scenario_order'>;
  const save = beginChapter(freshSave(), c.city, c);
  const cx = ctx({ timerMode: 'off' });
  const st = run(s, cx, [act(actionId)]);
  return commitScenario(save, B, c, s, st, resultOf(s, B, st)).flags;
}

describe('CR-51: arc_told_someone from any arc slot (R25(5))', () => {
  it('arcSlotFlags: report and ask_someone tell someone; nothing else does', () => {
    expect(arcSlotFlags('report')).toEqual([ARC_TOLD_SOMEONE]);
    expect(arcSlotFlags('ask_someone')).toEqual([ARC_TOLD_SOMEONE]);
    for (const k of ['reply', 'ignore', 'verify_identity', 'pay', 'check_official_list', undefined]) expect(arcSlotFlags(k), String(k)).toEqual([]);
  });
  it('the engine sets it when an arc slot is decided by a report or by asking someone (Lisbon slot 7)', () => {
    const s = shipped('lisbon', 'lisbon-arc-alex-07');
    expect(flagsAfter(s, 'ask_someone_release_fee')).toContain(ARC_TOLD_SOMEONE);
    expect(flagsAfter(s, 'say_scam_and_report')).toContain(ARC_TOLD_SOMEONE);
    expect(flagsAfter(s, 'say_probably_normal')).not.toContain(ARC_TOLD_SOMEONE);
  });
  it('a photo check in an arc slot is not telling someone (Paris slot 3); asking Teo is', () => {
    const s = shipped('paris', 'paris-arc-alex-03');
    expect(flagsAfter(s, 'photo_check_alex')).not.toContain(ARC_TOLD_SOMEONE);
    expect(flagsAfter(s, 'tell_teo_secret')).toContain(ARC_TOLD_SOMEONE);
  });
  it('stepping back never sets it (Berlin slot 1)', () => {
    const s = shipped('berlin', 'berlin-arc-alex-01');
    expect(flagsAfter(s, firstIgnore(s))).not.toContain(ARC_TOLD_SOMEONE);
  });
});

function firstIgnore(s: Scenario): string {
  const a = s.actions.find((x) => x.kind === 'ignore');
  if (!a) throw new Error('no ignore action');
  return a.id;
}

describe('CR-51: the close beat\'s solo photo check sets arc_checked (validator)', () => {
  it('the shipped close beat: photo check → arc_checked only; report → arc_told_someone (T-3.13i)', () => {
    const s = shipped('brussels', 'brussels-arc-close');
    const by = (kind: string) => s.outcomes[s.actions.find((a) => a.kind === kind)?.outcome ?? '']?.sets_flags ?? [];
    expect(by('verify_identity')).toEqual([ARC_CHECKED]);
    expect(by('report')).toEqual([ARC_TOLD_SOMEONE]);
  });
  it('the close beat\'s photo check must set arc_checked, not arc_told_someone', () => {
    const missing = rawFinale('fx-finale-arc-close.yaml');
    delete outcomes(missing).same_picture?.sets_flags;
    expect(schemaErrors(missing)).toMatch(/the close beat's photo check sets arc_checked/);
    const told = rawFinale('fx-finale-arc-close.yaml');
    (outcomes(told).same_picture as Raw).sets_flags = [ARC_TOLD_SOMEONE];
    expect(schemaErrors(told)).toMatch(/a solo photo check is not telling someone/);
    expect(schemaErrors(rawFinale('fx-finale-arc-close.yaml'))).toBe('');
  });
  it('arc_checked is set nowhere else: not by the close beat\'s report, not in Teo\'s chat', () => {
    const report = rawFinale('fx-finale-arc-close.yaml');
    (outcomes(report).reported_profile as Raw).sets_flags = [ARC_TOLD_SOMEONE, ARC_CHECKED];
    expect(schemaErrors(report)).toMatch(/arc_checked is set only by the close beat's photo check/);
    const teo = rawFinale('fx-finale-arc-teo.yaml');
    (outcomes(teo).same_picture as Raw).sets_flags = [ARC_CHECKED];
    const e = schemaErrors(teo);
    expect(e).toMatch(/arc_checked is set only by the close beat's photo check/);
    expect(e, "Teo's chat unchanged: the photo check together still tells someone").toMatch(/a report, photo check or asking someone sets arc_told_someone/);
  });
  it('ending scenes may gate on both flags', () => {
    const scene = sceneSchema.parse(readYaml(join(FINALE, 'scenes', 'fx-finale-ending-c.yaml')));
    const line = "And you checked before anything else. That's what works.";
    const lines = (flags: string[]) => visiblePanels(scene, new Set(flags), 'C').map((p) => p.line);
    expect(lines([ARC_CHECKED])).toContain(line);
    expect(lines([ARC_TOLD_SOMEONE])).not.toContain(line);
  });
});
