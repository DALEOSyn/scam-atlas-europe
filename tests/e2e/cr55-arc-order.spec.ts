import { expect, test, type Page } from '@playwright/test';
import { skipScene } from './scene-helpers.ts';

/**
 * CR-55 (QA Phase 3 gate B1): an interleaved chapter order. Home and Berlin are finished (Berlin played arc slot 1)
 * and Dublin is the first middle chapter played. Dublin's arc position is its first scenario, so it plays slot 2,
 * Amsterdam's arc file ("Move the chat to Kettle"). After that beat Dublin goes on with its own 8-1: the run is
 * not restarted and no further arc beat (slot 3…) is chained in. Local save only (Red Line 7); timers off.
 */
const KEY = 'scam-atlas-europe:save';
const done = (position: number) => ({ finished: true, bestStamp: 'bronze', bestRating: 50, position, run: null });
const SEED = {
  version: 1,
  settings: { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null },
  chapters: { home: done(0), berlin: done(1) },
  arc: { vars: {}, closes: 0, tellMeNow: false, reportedAtSlot: null, closed: false, points: 0, timeline: [1], choices: [{ slot: 1, kind: 'reply' }], finale: null },
};

interface Saved {
  arc: { timeline: number[]; choices: { slot: number; kind: string }[] };
  chapters: Record<string, { run: { index: number; records: { id: string }[] } | null }>;
}
const saved = (page: Page): Promise<Saved> => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}') as Saved, KEY);

test('interleaved order: Dublin first plays arc slot 2 once, then its own 8-1 (no chained arc beats, run kept)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(
    ([k, seed]) => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(seed));
    },
    [KEY, SEED] as const,
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.locator('[data-play-chapter="dublin"]').click();
  await skipScene(page, 'dublin-arrival');
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Dublin' })).toBeFocused();
  await intro.getByRole('button', { name: 'Start' }).click();

  // Slot 2 (the lowest not yet played), from Amsterdam's arc file, at Dublin's arc position.
  await page.locator('[data-action="move_to_kettle"]').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  let s = await saved(page);
  expect(s.arc.timeline).toEqual([1, 2]);
  // CR-55 B2: the reply is recorded as a reply (the timeline says "went along"), not as a timer expiry.
  expect(s.arc.choices).toEqual([{ slot: 1, kind: 'reply' }, { slot: 2, kind: 'reply' }]);
  expect(s.chapters['dublin']?.run?.index).toBe(1);
  expect(s.chapters['dublin']?.run?.records.map((r) => r.id)).toEqual(['amsterdam-arc-alex-02']);

  // Debrief Continue: Dublin's own 8-1, not another Alex beat; the run is not restarted.
  await page.getByRole('button', { name: 'Continue' }).last().click();
  await expect(page.locator('[data-action="pay_roisin_app"]')).toBeVisible();
  await expect(page.locator('[data-action="move_to_kettle"]')).toHaveCount(0);
  s = await saved(page);
  expect(s.arc.timeline).toEqual([1, 2]);
  expect(s.chapters['dublin']?.run?.index).toBe(1);
  expect(s.chapters['dublin']?.run?.records.map((r) => r.id)).toEqual(['amsterdam-arc-alex-02']);
});
