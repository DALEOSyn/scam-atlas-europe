// @vitest-environment jsdom
/**
 * Layer-1 ruling 2026-11-19: debrief layer 1 never renders more than 40 words. Plays every path of
 * each scenario of every chapter folder through the runner (every action, every "What now?" choice, letting the timer
 * run out), renders the real DebriefView for each ending and counts the words in layer 1
 * (section[aria-labelledby=debrief-h1]) without the stars and the More / Continue / Play again buttons.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/preact';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chapterSchema, scenarioSchema, type Scenario } from '../../src/content/schema.ts';
import { debriefOf } from '../../src/engine/debrief.ts';
import { resultOf } from '../../src/engine/result.ts';
import { startScenario, step, viewOf, type RunnerEvent, type RunnerState } from '../../src/engine/runner.ts';
import { DebriefView } from '../../src/ui/DebriefView.tsx';
import { wordCount } from '../../scripts/lib/rules.ts';
import { B, ctx, jonasAfter } from './engine/helpers.ts';
import { loadBalanceFile, readYaml, ROOT } from './helpers.ts';

afterEach(cleanup);

const LIMIT = loadBalanceFile().session.debrief_layer1_max_words;
const none = { pressureAny: false, pressureGenuine: false };

/** Every ending reachable by a player (depth-limited; meta actions are not repeated). */
function endings(s: Scenario, slot: number): { path: string[]; st: RunnerState }[] {
  const c = ctx({ slot });
  const out: { path: string[]; st: RunnerState }[] = [];
  const go = (st: RunnerState, path: string[], depth: number): void => {
    if (depth > 14) return;
    const next = (ev: RunnerEvent, label: string): void => go(step(s, c, st, ev), [...path, label], depth + 1);
    const v = viewOf(s, c, st);
    switch (st.phase) {
      case 'done':
        out.push({ path, st });
        return;
      case 'consequence':
        return next({ type: 'continue' }, 'continue');
      case 'damage_control': {
        const picks = (v.recovery?.options ?? []).slice(0, v.recovery?.pick ?? 3).map((o) => o.step);
        return next({ type: 'recovery', picks }, 'recovery');
      }
      case 'what_now':
        for (const ch of v.whatNow?.choices ?? []) next({ type: 'what_now', choice: ch.id }, `what_now:${ch.id}`);
        return;
      case 'interrupt':
        // An after_beat interrupt waits for its answer before the debrief (ruling QA M6): try each action.
        for (const i of v.interrupts) for (const a of i.actions) next({ type: 'interrupt_act', interruptId: i.id, actionId: a.id }, `interrupt:${i.id}:${a.id}`);
        return;
      case 'playing': {
        for (const a of v.beat?.actions ?? []) {
          if (path.at(-1) === a.id) continue;
          next({ type: 'act', actionId: a.id }, a.id);
        }
        if (v.timer && !path.includes('timer')) {
          let t = st;
          for (let i = 0; i < 600 && t.phase === 'playing' && t.groups.length === st.groups.length; i++) t = step(s, c, t, { type: 'tick', dt: 1 });
          if (t !== st) go(t, [...path, 'timer'], depth + 1);
        }
        return;
      }
    }
  };
  go(startScenario(s, c), [], 0);
  return out;
}

const BLOCKS = 'h1, h2, h3, h4, p, li, dt, dd, div, section';

/**
 * Words in layer 1, counted per block element, so text in adjacent blocks is never glued together
 * ("…tell.</h1><p>What works:" would read as one word from textContent). Inline markup inside a block
 * (chips, bold owner parts) stays part of its block's text.
 */
function layer1Words(container: Element): number {
  const section = container.querySelector('section[aria-labelledby="debrief-h1"]');
  if (!section) throw new Error('no layer 1');
  const copy = section.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[role="img"]').forEach((e) => e.remove()); // stars
  copy.querySelectorAll('button').forEach((b) => {
    if (['More', 'Continue', 'Play again'].includes((b.textContent ?? '').trim())) b.remove();
  });
  const leaves = [...copy.querySelectorAll(BLOCKS)].filter((el) => el.querySelector(BLOCKS) === null);
  // Text directly inside a non-leaf block (between child blocks) is counted too.
  const loose = [...copy.querySelectorAll(BLOCKS), copy]
    .filter((el) => el.querySelector(BLOCKS) !== null)
    .flatMap((el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? ''));
  return [...leaves.map((el) => el.textContent ?? ''), ...loose].reduce((n, text) => n + wordCount(text), 0);
}

/** Every chapter folder (home now, Berlin and the rest as they merge), with the chapter's slot. */
const scenariosRoot = resolve(ROOT, 'content/scenarios');
const chapterDirs = readdirSync(scenariosRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
function slotOf(chapter: string): number {
  const file = resolve(ROOT, `content/chapters/${chapter}.yaml`);
  if (!existsSync(file)) throw new Error(`content/chapters/${chapter}.yaml is missing`);
  return chapterSchema.parse(readYaml(`content/chapters/${chapter}.yaml`)).slot;
}

it('finds the tutorial scenarios', () => {
  expect(chapterDirs).toContain('home');
  expect(readdirSync(resolve(scenariosRoot, 'home')).filter((f) => f.endsWith('.yaml')).length).toBeGreaterThanOrEqual(6);
});

it('walks through a waiting after_beat interrupt with each of its actions to an ending', () => {
  const s = jonasAfter('support_call');
  const all = endings(s, 1);
  const answered = all.filter((e) => e.path.some((p) => p.startsWith('interrupt:jonas:')));
  expect(new Set(answered.map((e) => e.path.find((p) => p.startsWith('interrupt:'))))).toEqual(new Set(['interrupt:jonas:thanks', 'interrupt:jonas:report_jonas']));
  for (const e of all) expect(e.st.phase).toBe('done');
});

it('counts words per block, not across blocks', () => {
  const div = document.createElement('div');
  div.innerHTML = '<section aria-labelledby="debrief-h1"><h1>One two.</h1><p><strong>Three:</strong> four</p><p>five</p></section>';
  expect(layer1Words(div)).toBe(5);
});

for (const chapter of chapterDirs) describe(`debrief layer 1 stays within 40 words on every path (${chapter})`, () => {
  const files = readdirSync(resolve(scenariosRoot, chapter)).filter((f) => f.endsWith('.yaml')).sort();
  for (const f of files) {
    it(f, () => {
      const s = scenarioSchema.parse(readYaml(`content/scenarios/${chapter}/${f}`));
      const all = endings(s, slotOf(chapter));
      expect(all.length).toBeGreaterThan(0);
      let worst = { words: 0, path: [] as string[] };
      for (const { path, st } of all) {
        const r = resultOf(s, B, st);
        const { container } = render(<DebriefView data={debriefOf(s, st, r, none)} onContinue={() => undefined} onAgain={() => undefined} />);
        const words = layer1Words(container);
        if (words > worst.words) worst = { words, path };
        cleanup();
      }
      if (process.env['SHOW_LAYER1']) console.log(f, worst.words, worst.path.join(' > '), all.length);
      expect(worst.words).toBeGreaterThan(20); // the count is real
      expect(worst.words, `worst path ${worst.path.join(' → ')}`).toBeLessThanOrEqual(LIMIT);
    });
  }
});
