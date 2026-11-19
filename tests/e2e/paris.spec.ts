import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { playScene } from './scene-helpers.ts';

/**
 * Paris (T-3.5): a cheap play-through into the payee-check screen (CR-23). Home and Berlin are seeded as
 * finished (local save only, Red Line 7), timers off, so the run is quick and deterministic.
 * 3-1: close match with the holder's name and the first-use coach mark; 3-2: couldn't check, then the
 * four-eyes win ("Send it to Solène for her sign-off") on a business account (CR-26).
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

test('Paris 3-1 and 3-2: the payee check shows a close match, then "couldn\'t check"; both paths win ★★★ (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, SEED);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Play Paris' }).click();
  // S4: the Paris Arrival scene (street, Solène, Inès and the procedure card) plays before the intro.
  await playScene(page, 'paris-arrival', { axe: true });
  // CR-27: the chapter intro (Ruchelune's payment procedure) first, axe clean, then Start.
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Paris' })).toBeFocused();
  await expect(intro).toContainText('Pinned by the screen:');
  // CR-27 round 2: the procedure is a pinned rules card on the intro.
  const rules = intro.locator('[data-chapter-rules]');
  await expect(rules.getByRole('heading', { level: 2, name: 'Payments at Ruchelune' })).toBeVisible();
  await expect(rules.getByRole('listitem')).toHaveCount(2);
  await expect(rules.getByRole('listitem').nth(1)).toContainText('No exceptions, however urgent.');
  await axeClean(page);
  await intro.getByRole('button', { name: 'Start' }).click();

  // 3-1: Volet Bleu's rent notice (genuine). Pay with the details from your lease.
  await page.getByRole('button', { name: /Pay it with the details from your lease/ }).click();
  const result = page.locator('[id^="name-check-result-"]');
  // The check shows "Checking…" for 0.8 s; under a parallel run the card can take longer to mount.
  await expect(result, '3-1 payee check result').toContainText("Close match. The account is held by 'Volet Bleu Gestion SAS'.", { timeout: 20_000 });
  // The lease note to compare against (QA rework: not checkable, shown on the bank card).
  await expect(page.getByText('Your lease, page 4: Volet Bleu Gestion SAS · account ending 31')).toBeVisible();
  // The coach mark mounts with the result; give it a moment instead of a one-shot isVisible().
  const gotIt = page.getByRole('button', { name: 'Got it' });
  await gotIt.waitFor({ state: 'visible', timeout: 2_000 }).catch(() => undefined);
  if (await gotIt.isVisible()) {
    await axeClean(page); // coach mark open (first payee check in this save)
    await gotIt.click();
  }
  await axeClean(page);
  await page.getByRole('button', { name: /Use 'Volet Bleu Gestion SAS' and pay/ }).click();
  await expect(consequenceHeading(page), '3-1 consequence step').toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page), '3-1 debrief').toBeFocused();
  await expect(page.getByRole('img', { name: '3 of 3 stars' }), '3-1 scores ★★★').toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // 3-2: "Solène" from a look-alike address. Set it up in Larchwick Pro: the check can't run.
  await page.getByRole('button', { name: /Set up the transfer in Larchwick Pro/ }).click();
  await expect(result, '3-2 payee check result').toContainText("We couldn't check the name for this account.", { timeout: 20_000 });
  await expect(page.getByText('Ruchelune · current account')).toBeVisible();
  // CR-27: the business account shows the Larchwick Pro header.
  await expect(page.getByText('Larchwick Pro').first()).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: /Send it to Solène for her sign-off/ }).click();
  await expect(consequenceHeading(page)).toBeFocused();
  await expect(page.getByText(/I didn't ask for this\. Good thing it came to me\./)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await axeClean(page);
});
