import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { skipScene } from './scene-helpers.ts';

/**
 * Amsterdam (T-3.4): a cheap play-through to 2-3's banking beat. Home and Berlin are seeded as finished
 * (local save only, Red Line 7), timers off, so the run is quick and deterministic.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = { finished: true, bestStamp: 'bronze', bestRating: 0.5, position: null, run: null };
const SEED = {
  version: 1,
  settings: { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null },
  chapters: { home: { ...done, position: 0 }, berlin: { ...done, position: 1 } },
};

const debriefHeading = (page: Page) => page.getByRole('heading', { level: 1, name: /This was (a scam|genuine):/ });
const consequenceHeading = (page: Page) => page.getByRole('heading', { level: 3, name: 'What happened' });

async function continueToNext(page: Page) {
  await expect(consequenceHeading(page).or(debriefHeading(page))).toBeVisible();
  if (await consequenceHeading(page).isVisible()) await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('Amsterdam 2-3: open the transfer, the name check says no match, cancel and call Noor (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, SEED);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Play Amsterdam' }).click();
  // Amsterdam arrival (S4) plays before the intro and 2-1; this test is about the bank device, so it skips the story.
  await skipScene(page, 'amsterdam-arrival');
  // CR-27: the chapter intro first (its rules), axe clean, then Start.
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Amsterdam' })).toBeFocused();
  await axeClean(page);
  await intro.getByRole('button', { name: 'Start' }).click();

  // 2-1: Teo's new mobile (genuine): save and reply.
  await page.getByRole('button', { name: /Save the number and reply/ }).click();
  await continueToNext(page);
  // 2-2: "easy work" SMS: look the agency up yourself.
  await page.getByRole('button', { name: /Look up Klaverwerk Staffing yourself/ }).click();
  await continueToNext(page);

  // 2-3: "Noor" from a new number. The "Not in your contacts" banner is shown (CR-19).
  await expect(page.getByText(/Not in your contacts/).first()).toBeVisible();
  await page.getByRole('button', { name: /Pay her in the Larchwick app/ }).click();

  // Banking beat: the name check runs and shows a warning without a name (CR-23).
  const result = page.locator('[id^="name-check-result-"]');
  await expect(result).toContainText("The name doesn't match this account.", { timeout: 5_000 });
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.isVisible()) {
    await axeClean(page); // coach mark open
    await gotIt.click();
  }
  await axeClean(page);
  await page.getByRole('button', { name: /Cancel and call Noor's saved number/ }).click();

  await expect(consequenceHeading(page)).toBeFocused();
  await expect(page.getByText(/The name check caught it\. Good stop\./)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await axeClean(page);
});
