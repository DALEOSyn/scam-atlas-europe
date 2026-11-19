import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Warsaw (T-3.7): the marketplace boss beat (CR-33 buyer chat) in the real game. Home and Berlin are seeded
 * as finished and the Warsaw run as resumed at the boss (local save only, Red Line 7), timers off, so the run
 * is quick and deterministic. The resumed run shows "Kasia's selling rules" again (CR-27, psych M2), then
 * the boss: Swaploft chat with the listing card, axe clean; "Keep it in Swaploft" (★★★), then the Kettle
 * collect-your-payment beat (axe clean). A second test resumes at 5-3 and opens the collect page: the
 * training-page frame (SIMULATION pill, dashed form, demo note) is visible and axe is clean (sceptic, round 1).
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = { finished: true, bestStamp: 'bronze', bestRating: 0.5, position: null, run: null };
const record = { id: 'warsaw-08-atlas-lines', scored: true, points: 15, maxPoints: 15, stars: 3, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleCheckedHarmless: false, pattern: 'email-phishing-credential' };
const SEED = {
  version: 1,
  settings: { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null },
  chapters: {
    home: { ...done, position: 0 },
    berlin: { ...done, position: 1 },
    warsaw: { finished: false, bestStamp: null, bestRating: 0, position: 2, run: { index: 9, records: [record], flags: [] } },
  },
};

test('Warsaw boss beat 1: the Swaploft buyer chat with the listing card, then the Kettle "collect your payment" beat (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, SEED);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Continue Warsaw' }).click();

  // CR-27: a resumed run shows the pinned rules again, with Continue.
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Warsaw' })).toBeFocused();
  const rules = intro.locator('[data-chapter-rules]');
  await expect(rules.getByRole('heading', { level: 2, name: "Kasia's selling rules" })).toBeVisible();
  await expect(rules.getByRole('listitem')).toHaveCount(2);
  await axeClean(page);
  await intro.getByRole('button', { name: 'Continue' }).click();

  // Beat 1: the buyer chat inside Swaploft (CR-33), with the stove listing card as a checkable.
  await expect(page.locator('#device-heading')).toHaveText('Swaploft: chat with user 3150');
  const listing = page.locator('[data-listing] [data-check="reference"]');
  await expect(listing).toContainText('Camping stove');
  await expect(listing).toContainText('€40.00');
  await axeClean(page);
  await page.getByRole('button', { name: 'Keep it in Swaploft: check your sales' }).click();
  await expect(page.getByText(/Nothing paid yet\. Real offers and payments show here\./)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Beat 2: Kettle, from the number the buyer gave (CR-19 new contact), a link to collect the payment.
  await expect(page.locator('#device-heading')).toHaveText(/Chat message from \+48/);
  await expect(page.getByText('Not in your contacts').first()).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Open your Swaploft sales yourself' }).click();
  await expect(page.getByText(/the stove is still listed, nothing paid/)).toBeVisible();
  await axeClean(page);
});

const rec = (id: string, pattern: string, isFraud: boolean) => ({ ...record, id, pattern, redFlags: isFraud ? 2 : 0 });
const SEED_53 = {
  ...SEED,
  chapters: {
    ...SEED.chapters,
    warsaw: {
      finished: false,
      bestStamp: null,
      bestRating: 0,
      position: 2,
      run: { index: 2, records: [rec('warsaw-01-rucksack-sold', 'marketplace-collect-payment-link', false), rec('warsaw-02-vote-for-the-band', 'messenger-account-takeover-code', true)], flags: [] },
    },
  },
};

test('Warsaw 5-3: the "collect your payment" page is a visible training page (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, SEED_53);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Continue Warsaw' }).click();
  await page.locator('[data-chapter-intro]').getByRole('button', { name: 'Continue' }).click();

  await expect(page.locator('#device-heading')).toHaveText(/Chat message from \+48/);
  await page.getByRole('button', { name: 'Open the link and collect it' }).click();
  const form = page.locator('form[data-simulated="true"]');
  await expect(form).toBeVisible();
  await expect(page.getByText('Demo fields. Nothing can be typed or sent.')).toBeVisible();
  await expect(page.getByText(/simulation/i).first()).toBeVisible();
  await expect(page.getByText('swaploft-safe-delivery.example').first()).toBeVisible();
  await axeClean(page);
});
