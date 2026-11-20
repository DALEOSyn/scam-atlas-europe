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
// The consequence step's own heading (h2 since T-4.5 R3; the debrief also has an h2 "What happened").
const consequenceHeading = (page: Page) => page.getByRole('heading', { level: 2, name: 'What happened' }).and(page.locator('#consequence-h'));

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

/** A Madrid run resumed at `index` (records explain the index, QA E8); timers and follow-ups off. */
const ORDER: [string, boolean, string | undefined][] = [
  ['madrid-01-dinner-at-nine', true, 'messenger-family-impersonation'],
  ['madrid-02-real-card-call', true, 'bank-safe-account-call'],
  ['madrid-03-text-in-the-thread', true, 'bank-safe-account-call'],
  ['madrid-04-lucia-slept-on-it', false, 'bank-safe-account-call'],
  ['madrid-05-reserve-account-call', true, 'bank-safe-account-call'],
  ['madrid-06-real-code-for-you', true, 'multichannel-support-callback'],
  ['madrid-07-cancellation-code', true, 'multichannel-support-callback'],
  ['madrid-arc-alex-04', false, undefined],
  ['madrid-08-card-paused-link', true, 'bank-safe-account-call'],
];
function seedAt(index: number) {
  const records = ORDER.slice(0, index).map(([id, scored, pattern]) => ({
    id, scored, points: scored ? 15 : 0, maxPoints: scored ? 15 : 0, stars: scored ? 3 : null, correctTags: 0, wrongTags: 0, redFlags: 0, genuineReported: 0, doubleCheckedHarmless: false, ...(pattern ? { pattern } : {}),
  }));
  return { ...SEED, chapters: { ...SEED.chapters, madrid: { finished: false, bestStamp: null, bestRating: 0, position: 4, run: { index, records, flags: [] } } } };
}
async function resumeMadrid(page: Page, index: number) {
  await page.addInitScript((seed) => {
    if (!localStorage.getItem('scam-atlas-europe:save')) localStorage.setItem('scam-atlas-europe:save', JSON.stringify(seed));
  }, seedAt(index));
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Continue Madrid' }).click();
  await page.locator('[data-chapter-intro]').getByRole('button', { name: /^(Start|Continue)$/ }).click();
}
const option = (page: Page, name: string) => page.getByRole('region', { name: 'Your options' }).getByRole('button', { name, exact: true });

test('Madrid 4-3: calling the number in the text, then hanging up and calling the card\'s number, is ★★', async ({ page }) => {
  test.setTimeout(90_000);
  await resumeMadrid(page, 2);
  await option(page, 'Call the number in the text').click();
  // CR-45: the player placed this call, so it dials ("Calling…", then "Connected"); no Answer or Decline.
  await expect(page.locator('#device-heading')).toHaveText('Call to 9•• ••• •14');
  await expect(page.locator('[data-dialled-detail]')).toHaveText('The number from the text');
  await expect(page.getByRole('button', { name: 'Answer', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Decline', exact: true })).toHaveCount(0);
  await expect(page.locator('[data-call-state]')).toHaveText('Connected', { timeout: 5000 });
  await page.getByRole('button', { name: 'Hang up', exact: true }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'What now?' })).toBeVisible();
  await option(page, 'Call the number on your card').click();
  await expect(consequenceHeading(page)).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByRole('img', { name: '2 of 3 stars' })).toBeVisible();
  await expect(page.getByText('You chose: Call the number in the text.', { exact: true })).toBeVisible();
  // QA (Madrid round 2): the "More" line is true whether or not the player called.
  await page.getByText('More', { exact: true }).click();
  await expect(page.getByText(/^Behind that number: a recorded menu/)).toBeVisible();
  await expect(page.getByText(/If you'd called/)).toHaveCount(0);
  // CR-45: the "If you already…" sub-heading over "Called the number?" names the call, not a link.
  await expect(page.getByText('Called the number they gave', { exact: true })).toBeVisible();
  await expect(page.getByText('Clicked the link', { exact: true })).toHaveCount(0);
  await axeClean(page);
});

test('Madrid boss 4-9: the ideal run (app, hang up and call the card, call the card) is ★★★', async ({ page }) => {
  test.setTimeout(150_000);
  await resumeMadrid(page, 9);
  // Beat 1, the text: open the app yourself.
  await option(page, 'Open the Larchwick app yourself').click();
  // Beat 2, the "Larchwick Bank" call: answer, hang up, call the card's number.
  const answer = page.getByRole('button', { name: 'Answer', exact: true });
  const cont = page.getByRole('button', { name: 'Continue', exact: true });
  for (let i = 0; i < 60 && !(await answer.isVisible()); i++) {
    if (await cont.isVisible()) await cont.click();
    await page.waitForTimeout(500);
  }
  await answer.click();
  await page.getByRole('button', { name: 'Hang up', exact: true }).click();
  await option(page, 'Call the number on your card').click();
  // Beat 3, the second text: call the card's number.
  const b3 = option(page, 'Call the number on your card');
  for (let i = 0; i < 60; i++) {
    if (await b3.isVisible() && !(await page.getByRole('heading', { level: 3, name: 'What now?' }).isVisible())) break;
    if (await cont.isVisible()) await cont.click();
    await page.waitForTimeout(500);
  }
  await b3.click();
  // Andrés says good night (after beat 3), then the debrief.
  const goodNight = page.locator('[data-interrupt-action]', { hasText: 'buenas noches' }).first();
  let sawSpan = false;
  for (let i = 0; i < 60 && !(await debriefHeading(page).isVisible()); i++) {
    if (await goodNight.isVisible()) {
      // CR-45: the Spanish words in the label carry lang="es" for screen readers.
      await expect(goodNight.locator('span[lang="es"]')).toHaveText('¡buenas noches!');
      sawSpan = true;
      await goodNight.click();
    }
    else if (await cont.isVisible()) await cont.click();
    await page.waitForTimeout(500);
  }
  await expect(debriefHeading(page)).toBeVisible();
  expect(sawSpan).toBe(true);
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  // QA (Madrid round 2): the app line is conditional, and no later beat restates the full balance.
  await page.getByText('More', { exact: true }).click();
  await expect(page.getByText(/^If you opened the app during the call:/)).toBeVisible();
  await expect(page.getByText(/In the app: the name matched/)).toHaveCount(0);
  await axeClean(page);
});

