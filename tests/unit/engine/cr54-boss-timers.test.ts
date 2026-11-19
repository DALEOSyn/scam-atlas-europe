/**
 * CR-54 (R26(1)): a boss's opening beat may carry `timer_seconds` (scenario level, boss only, bounds as a scheduled
 * beat's), and a required validator check: every scheduled call beat of a timed boss runs
 * `timers.boss_call_beat_by_slot` for the chapter's slot.
 */
import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { readYaml } from '../../../scripts/lib/content.ts';
import { bossCallBeatIssues, chapterRules, scenarioRules } from '../../../scripts/lib/rules.ts';
import { chapterSchema, scenarioSchema, type Scenario } from '../../../src/content/schema.ts';
import { startScenario } from '../../../src/engine/runner.ts';
import { modeFactor } from '../../../src/engine/timer.ts';
import { rawFraud, ROOT, realRegistries } from '../../content/fixtures.ts';
import { B, boss, ctx, type Raw } from './helpers.ts';

const reg = realRegistries();
const content = (city: string, id: string): Scenario => scenarioSchema.parse(readYaml(resolve(ROOT, 'content', 'scenarios', city, `${id}.yaml`)));
const rome = content('rome', 'rome-09-boss-investigation');
const home = content('home', 'home-06-boss-new-portal');
const parseErrors = (r: Raw): string => {
  const res = scenarioSchema.safeParse(r);
  return res.success ? '' : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
};
/** The fixture boss with a call as its opening beat. */
const callOpener = (): Scenario => ({ ...boss(), device: 'call' }) as Scenario;

describe('CR-54: a boss opening beat may carry timer_seconds', () => {
  it('schema: bosses only', () => {
    expect(parseErrors({ ...rawFraud(), timer_seconds: 40 })).toMatch(/timer_seconds is for a boss's opening beat \(CR-54\)/);
    expect(() => boss({ timer_seconds: 40 })).not.toThrow();
  });
  it('rules: same bounds as a scheduled beat (timers.call_beat … timers.boss_beat)', () => {
    expect(scenarioRules(boss({ timer_seconds: 40 }), reg).errors.filter((e) => /timer_seconds/.test(e))).toEqual([]);
    expect(scenarioRules(boss({ timer_seconds: 30 }), reg).errors.filter((e) => /timer_seconds/.test(e))).toEqual([]);
    expect(scenarioRules(boss({ timer_seconds: 25 }), reg).errors.join('\n')).toMatch(/beat "start": timer_seconds 25 is outside 30–40/);
    expect(scenarioRules(boss({ timer_seconds: 45 }), reg).errors.join('\n')).toMatch(/beat "start": timer_seconds 45 is outside 30–40/);
  });
  it('engine: the opening beat runs it, scaled by the timer mode', () => {
    expect(rome.timer_seconds).toBe(40);
    expect(startScenario(rome, ctx({ slot: 6 })).timer?.length).toBe(40);
    const ext = modeFactor(B, 'extended') ?? 1;
    expect(startScenario(rome, ctx({ slot: 6, timerMode: 'extended' })).timer?.length).toBe(40 * ext);
    expect(startScenario(rome, ctx({ slot: 6, timerMode: 'off' })).timer).toBeNull();
    // Without it, an opening call beat still runs timers.call_beat.
    expect(startScenario(callOpener(), ctx({ slot: 6 })).timer?.length).toBe(B.timers.call_beat);
  });
});

describe('CR-54: boss call beats match timers.boss_call_beat_by_slot (required)', () => {
  it('balance: 40 s in slots 0–7, 30 s from slot 8', () => {
    for (let slot = 0; slot <= 10; slot++) expect(B.timers.boss_call_beat_by_slot[String(slot)], `slot ${slot}`).toBe(slot <= 7 ? 40 : 30);
  });
  it('flags an opening call beat and a scheduled call beat that run the wrong length; non-call beats are not checked', () => {
    // The fixture boss: its scheduled call beat (support_call) defaults to call_beat (30 s).
    expect(bossCallBeatIssues(boss(), 8, B)).toEqual([]);
    expect(bossCallBeatIssues(boss(), 3, B).join('\n')).toMatch(/beat "support_call": a boss call beat in slot 3 runs 40 s .* it runs 30 s/);
    const fixed = boss({ beats: boss().beats.map((b) => (b.id === 'support_call' ? { ...b, timer_seconds: 40 } : b)) });
    expect(bossCallBeatIssues(fixed, 3, B)).toEqual([]);
    expect(bossCallBeatIssues(fixed, 9, B).join('\n')).toMatch(/runs 30 s .* it runs 40 s/);
    const opener = { ...fixed, device: 'call' } as Scenario;
    expect(bossCallBeatIssues(opener, 3, B).join('\n')).toMatch(/opening beat \(scenario-level timer_seconds\): a boss call beat in slot 3 runs 40 s/);
    expect(bossCallBeatIssues({ ...opener, timer_seconds: 40 } as Scenario, 3, B)).toEqual([]);
  });
  it('a boss without a timer, and every non-boss, has nothing to check', () => {
    expect(bossCallBeatIssues({ ...boss(), pressure: { timer: false, levers: [] } } as Scenario, 3, B)).toEqual([]);
    expect(bossCallBeatIssues({ ...boss(), role: 'standard' } as Scenario, 3, B)).toEqual([]);
  });
  it('chapter rules report it as an error (content:validate fails)', () => {
    const romeChapter = chapterSchema.parse(readYaml(resolve(ROOT, 'content', 'chapters', 'rome.yaml')));
    const romeAll = readdirSync(resolve(ROOT, 'content', 'scenarios', 'rome')).map((f) => scenarioSchema.parse(readYaml(resolve(ROOT, 'content', 'scenarios', 'rome', f))));
    expect(chapterRules(romeChapter, 'rome', romeAll, reg).errors).toEqual([]);
    const thirty = romeAll.map((s) => (s.id === rome.id ? ({ ...s, timer_seconds: undefined } as Scenario) : s));
    expect(chapterRules(romeChapter, 'rome', thirty, reg).errors.join('\n')).toMatch(/boss "rome-09-boss-investigation" opening beat .* slot 6 runs 40 s .* it runs 30 s/);
  });
  it('T-3.13a: Home beat 3 (it_call) and Rome beat 1 run 40 s; every shipped boss passes', () => {
    expect(home.beats.find((b) => b.id === 'it_call')?.timer_seconds).toBe(40);
    expect(rome.timer_seconds).toBe(40);
    for (const city of readdirSync(resolve(ROOT, 'content', 'chapters')).map((f) => f.replace(/\.yaml$/, ''))) {
      const c = chapterSchema.parse(readYaml(resolve(ROOT, 'content', 'chapters', `${city}.yaml`)));
      if (!c.boss) continue;
      const s = content(city, c.boss);
      expect(bossCallBeatIssues(s, c.slot, B), s.id).toEqual([]);
    }
  });
});

describe('CR-54 (sceptic nit): an unscheduled call sub-beat with timer_seconds is rejected', () => {
  /** The fixture boss whose scheduled call (support_call) leads by next_beat to a second call beat, with or without its own timer. */
  const withSubCall = (timer?: number): Raw => {
    const b = structuredClone(boss()) as unknown as Raw;
    const beats = b.beats as Raw[];
    const call = beats.find((x) => x.id === 'support_call') as Raw;
    (call.actions as Raw[]).push({ id: 'ask_who', label: 'Ask who is calling', kind: 'reply', next_beat: 'second_call' });
    const sub = structuredClone(call);
    sub.id = 'second_call';
    delete sub.arrives_after;
    delete sub.banner;
    delete sub.what_now;
    sub.actions = [{ id: 'hang_up_again', label: 'Hang up', kind: 'hang_up', outcome: 'hung_up' }];
    if (timer !== undefined) sub.timer_seconds = timer;
    beats.push(sub);
    return b;
  };
  it('the engine starts no timer on a beat reached by next_beat, so the schema rejects timer_seconds there (an error, not a warning)', () => {
    expect(parseErrors(withSubCall())).toBe('');
    expect(parseErrors(withSubCall(40))).toMatch(/beats\.3\.timer_seconds: timer_seconds is for scheduled boss beats \(arrives_after\): .* the engine ignores it on a beat reached by next_beat/);
  });
});
