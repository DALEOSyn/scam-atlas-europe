import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Madrid (T-3.6): 4-5, the "Larchwick Bank" call that guides you to move your balance in your own app.
 * Home, Berlin, Amsterdam and Paris are seeded as finished and a Madrid run is in progress at 4-5 (local
 * save only, Red Line 7), timers and follow-ups off, so the run is quick and deterministic.
 * Resume shows the intro with the pinned card "On the back of your Larchwick card" (CR-27); then the call,
 * "Open the app and follow their steps" (start_transfer, cap: engage, ruling R16), the on-call bar over the
 * bank app (CR-31), the "doesn't match" result (CR-23), and Hang up → "Hang up and call your card's number",
 * which scores ★★ (CR-31(b)). Axe clean on the intro, the bank app and the debrief.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const done = (position: number) => ({ finished: true, bestStamp: 'bronze', bestRating: 50, position, run: null });
const rec = (id: string, scored: boolean, points: number, max: number, redFlags: number, pattern: string) => ({
  id, scored, points, maxPoints: max, stars: scored ? 3 : null, correctTags: redFlags, wrongTags: 0, redFlags, genuineReported: 0, doubleCheckedHarmless: false, pattern,
});
const PLAYED = [
  rec('madrid-01-dinner-at-nine', true, 15, 15, 0, 'messenger-family-impersonation'),
  rec('madrid-02-real-card-call', true, 15, 15, 0, 'bank-safe-account-call'),
  rec('madrid-03-text-in-the-thread', true, 19, 19, 2, 'bank-safe-account-call'),
  rec('madrid-04-lucia-slept-on-it', false, 0, 0, 0, 'bank-safe-account-call'),
];
const SEED = {
  version: 1,
  settings: { timerMode: 'off', pushers: false, callLines: 'auto', alwaysTranslate: false, shortcuts: false, nickname: null },
  chapters: {
    home: done(0),
    berlin: done(1),
    amsterdam: done(2),
    paris: done(3),
    // A run that has played 4-1 … 4-4 (records explain the index, QA E8), so it resumes at 4-5.
    madrid: { finished: false, bestStamp: null, bestRating: 0, position: 4, run: { index: 4, records: PLAYED, flags: [] } },
  },
};

const debriefHeading = (page: Page) => page.getByRole('heading', { level: 1, name: /This was (a scam|genuine):/ });
const consequenceHeading = (page: Page) => page.getByRole('heading', { level: 3, name: 'What happened' });

test('Madrid 4-5: a "bank" call guides you into your own app; the name doesn\'t match; hanging up there is ★★ (axe clean)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, SEED);
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Continue Madrid' }).click();

  // CR-27: the intro and the pinned card (on resume too).
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: 'Madrid' })).toBeFocused();
  const rules = intro.locator('[data-chapter-rules]');
  await expect(rules.getByRole('heading', { level: 2, name: 'On the back of your Larchwick card' })).toBeVisible();
  await expect(rules.getByRole('listitem')).toHaveCount(1);
  await expect(rules.getByRole('listitem').first()).toContainText('Call us on 9•• ••• •00 or open the Larchwick app.');
  await axeClean(page);
  await intro.getByRole('button', { name: /^(Start|Continue)$/ }).click();

  // 4-5: the call. Answer, then follow the caller into the Larchwick app.
  await page.getByRole('button', { name: 'Answer', exact: true }).click();
  await page.getByRole('button', { name: 'Open the app and follow their steps' }).click();

  // CR-31: the call stays on the line over the bank app; the name check says it doesn't match.
  const bar = page.locator('[data-on-call]');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('On a call · Larchwick Bank');
  const result = page.locator('[id^="name-check-result-"]');
  await expect(result).toContainText("The name doesn't match this account.", { timeout: 5_000 });
  await expect(page.getByText('Larchwick Reserva').first()).toBeVisible();
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.isVisible()) {
    await axeClean(page); // coach mark open (first payee check in this save)
    await gotIt.click();
  }
  await axeClean(page);

  // Hang up on the bar: focus moves to the bank app's own call-back option (verify first).
  await page.locator('[data-hang-up]').click();
  const callCard = page.locator('[data-action="hang_up_call_card_reserve"]');
  await expect(callCard).toBeFocused();
  await expect(callCard).toContainText("Hang up and call your card's number");
  await callCard.click();
  await expect(consequenceHeading(page)).toBeFocused();
  await expect(page.getByText(/No payment is leaving your account\. We'd never ask you to move money\./)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // R16: following a fraud caller's steps into your own app caps the scenario at ★★.
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByRole('img', { name: '2 of 3 stars' })).toBeVisible();
  await expect(page.getByText('You chose: Open the app and follow their steps.', { exact: true })).toBeVisible();
  await expect(page.getByText('Being guided to move your money is the tell.').first()).toBeVisible();
  await axeClean(page);
});
