// @vitest-environment jsdom
/**
 * CR-50 (R26(2)): a genuine expiry that scores 0 stars says "Time's up in the game, so it counts like leaving it…"
 * (`deadline_genuine_missed`, `_plain` without `honest_deadline`), never "Nothing is lost yet"; ★ / ★★ expiries keep
 * `deadline_genuine` / `_plain`. Checked in the consequence view data, the rendered debrief layer 2 and on every
 * shipped timed genuine scenario.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/preact';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { deadlineLine, startScenario, step, viewOf } from '../../src/engine/runner.ts';
import { t } from '../../src/i18n/index.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { deadlineText } from '../../src/ui/labels.ts';
import { rawGenuine, scenario } from '../content/fixtures.ts';
import { B, ctx, tick, type Raw } from './engine/helpers.ts';
import { readYaml, ROOT } from './helpers.ts';

afterEach(cleanup);

const none = { pressureAny: false, pressureGenuine: false };
const LOST = 'Nothing is lost yet';
const MISSED = "Time's up in the game, so it counts like leaving it.";

/** A genuine, high-stakes, timed message with a "Leave it" option: R21 scores its expiry like leaving it, 0 stars. */
function highStakes(honest: boolean): Scenario {
  const raw: Raw = rawGenuine('g-high', { stakes: 'high' });
  (raw.actions as Raw[]).push({ id: 'leave_it', label: 'Leave it', kind: 'ignore', outcome: 'done' });
  return scenario({ ...raw, pressure: { timer: true, levers: [], ...(honest ? { honest_deadline: 'Pay by Friday' } : {}) } });
}
function lowStakes(honest: boolean): Scenario {
  return scenario({ ...rawGenuine(), pressure: { timer: true, levers: [], ...(honest ? { honest_deadline: 'Locker holds it 7 days' } : {}) } });
}

function expire(s: Scenario) {
  const c = ctx();
  const st = step(s, c, step(s, c, startScenario(s, c), tick(60)), tick(B.timers.escalation_extra_seconds));
  return { c, st };
}

function debriefText(s: Scenario): { caption: ReturnType<typeof viewOf>['consequenceDeadline']; stars: number | null; more: string } {
  const { c, st } = expire(s);
  expect(st.phase).toBe('consequence');
  const caption = viewOf(s, c, st).consequenceDeadline;
  const done = step(s, c, st, { type: 'continue' });
  const r = resultOf(s, B, done);
  render(<DebriefView data={debriefOf(s, done, r, none)} onContinue={() => undefined} onAgain={() => undefined} />);
  const more = document.getElementById('debrief-more')?.textContent ?? '';
  cleanup();
  return { caption, stars: r.stars, more };
}

describe('CR-50: genuine-expiry copy follows the stars (R26(2))', () => {
  it('the copy is the ruled wording', () => {
    expect(t('deadline_genuine_missed', { deadline: 'Pay by Friday' })).toBe(
      "Time's up in the game, so it counts like leaving it. The message's real deadline: Pay by Friday. Checking it your own way works.",
    );
    expect(t('deadline_genuine_missed_plain')).toBe("Time's up in the game, so it counts like leaving it. Checking it your own way works.");
    expect(t('deadline_genuine_missed_plain')).not.toContain(LOST);
    expect(deadlineText('genuine_missed', null)).toBe(t('deadline_genuine_missed_plain'));
    expect(deadlineText('genuine_missed', 'X')).toBe(t('deadline_genuine_missed', { deadline: 'X' }));
  });
  it('deadlineLine: 0 stars on genuine → missed; ★/★★ (or unknown) → genuine; fraud unchanged', () => {
    expect(deadlineLine(false, false, 0)).toBe('genuine_missed');
    expect(deadlineLine(false, false, 1)).toBe('genuine');
    expect(deadlineLine(false, false, 2)).toBe('genuine');
    expect(deadlineLine(false, false, null)).toBe('genuine');
    expect(deadlineLine(true, false, 0)).toBe('fake');
    expect(deadlineLine(true, true, 0)).toBe('fake_fell');
  });
  for (const honest of [true, false]) {
    it(`0-star genuine expiry (${honest ? 'with' : 'without'} honest_deadline): caption and layer 2 say "counts like leaving it", never "${LOST}"`, () => {
      const d = debriefText(highStakes(honest));
      expect(d.stars).toBe(0);
      expect(d.caption).toBe('genuine_missed');
      expect(d.more).toContain(MISSED);
      if (honest) expect(d.more).toContain("The message's real deadline: Pay by Friday.");
      expect(d.more).not.toContain(LOST);
    });
    it(`★★ genuine expiry (${honest ? 'with' : 'without'} honest_deadline) keeps "${LOST}"`, () => {
      const d = debriefText(lowStakes(honest));
      expect(d.stars).toBe(2);
      expect(d.caption).toBe('genuine');
      expect(d.more).toContain(LOST);
      expect(d.more).not.toContain(MISSED);
    });
  }
  it('every shipped timed genuine scenario: "Nothing is lost yet" only next to ★ or ★★ (Madrid 4-6 included)', () => {
    const dir = resolve(ROOT, 'content/scenarios');
    const checked: string[] = [];
    for (const city of readdirSync(dir)) {
      const cityDir = resolve(dir, city);
      if (!existsSync(cityDir)) continue;
      for (const f of readdirSync(cityDir).filter((x) => x.endsWith('.yaml'))) {
        const s = scenarioSchema.parse(readYaml(resolve(cityDir, f)));
        if (s.is_fraud || !s.pressure.timer || s.role !== 'standard') continue;
        const c = ctx({ slot: s.chapter === 'home' ? 0 : 1 });
        let st = startScenario(s, c);
        for (let i = 0; i < 600 && st.phase === 'playing'; i++) st = step(s, c, st, tick(1));
        if (st.phase !== 'consequence') continue;
        const caption = viewOf(s, c, st).consequenceDeadline;
        while (st.phase !== 'done') st = step(s, c, st, { type: 'continue' });
        const r = resultOf(s, B, st);
        const line = debriefOf(s, st, r, none).layer2.deadline;
        expect(caption, s.id).toBe(line);
        expect(line, s.id).toBe(r.stars === 0 ? 'genuine_missed' : 'genuine');
        if (line) expect(deadlineText(line, s.pressure.honest_deadline).includes(LOST), s.id).toBe(r.stars !== 0);
        checked.push(s.id);
      }
    }
    // BALANCE_PASS §6: all 20 timed genuine scenarios.
    expect(checked).toHaveLength(20);
    expect(checked).toContain('madrid-06-real-code-for-you');
  });
});
