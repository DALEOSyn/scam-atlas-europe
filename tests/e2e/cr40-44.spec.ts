import { expect, test, type Page } from '@playwright/test';
import { HARNESS_URL } from '../../playwright.config.ts';
import { axeClean, done, minTarget, noOverflow, open, press, pressOn, settle } from './fixture-helpers.ts';

/**
 * CR-40 … CR-44 (the Brussels finale, engine only): the fixture scenarios in the real ScenarioView
 * (`?view=scenario&id=…`), and the finale fixture chapter in the real App (`?view=app&arc=C|A`, a seeded
 * local save). Keyboard only, axe clean. Red Lines and the sceptic's §30.10 constraints: the warning overlay
 * is game-styled, never fullscreen, has no sound and a visible Close; the timeline never blames.
 */

async function noFullscreenNoAudio(page: Page) {
  expect(await page.evaluate(() => document.fullscreenElement), 'never fullscreen (CR-42)').toBeNull();
  expect(await page.locator('audio, video').count(), 'no audio (CR-42)').toBe(0);
}

for (const width of [320, 1280]) {
  test(`QA B1 at ${width}px: each checkable of the forwarded DM appears once, inside the card, and fits its box`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr40-advice');
    const card = page.locator('[data-forwarded]');
    await expect(card).toBeVisible();
    const targets = await page.locator('[data-check]').evaluateAll((els) => els.map((e) => e.getAttribute('data-check') ?? ''));
    expect(targets).toEqual(expect.arrayContaining(['forwarded.sender', 'reference', 'request', 'claim']));
    expect(new Set(targets).size, `duplicated targets: ${targets.join(', ')}`).toBe(targets.length);
    // CR-40/41: nothing checkable in Noor's own bubble; the reference is the DM's words, not hers.
    await expect(page.locator('[data-check]:not([data-forwarded] [data-check])')).toHaveCount(0);
    await expect(card.locator('[data-check="reference"]')).toHaveCount(1);
    // No pill spills past its own border or out of the card.
    const spill = await page.locator('[data-forwarded] [data-check]').evaluateAll((els) => {
      const box = document.querySelector('[data-forwarded]')?.getBoundingClientRect();
      // Inline pills wrap over several lines: every line box of the pill stays inside the card.
      return els.flatMap((e) =>
        [...e.getClientRects()].flatMap((r, i) => (box && (r.left < box.left - 1 || r.right > box.right + 1) ? [`${e.getAttribute('data-check') ?? ''} line ${i + 1}: outside the card`] : [])),
      );
    });
    expect(spill).toEqual([]);
    await noOverflow(page);
  });

  test(`CR-40 at ${width}px: a forwarded card inside Noor's chat, with its own checkable sender`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr40-advice');
    const card = page.locator('[data-forwarded]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Forwarded from');
    await expect(card.locator('[data-check="forwarded.sender"]')).toHaveCount(1);
    await expect(card.locator('blockquote')).toContainText('Send me your banking-app login and card details.');
    await noOverflow(page);
    await axeClean(page);
    // advise_comply: scores nothing, but it is not a fall, so no damage control follows.
    await press(page, 'A few transfers? Probably fine');
    await expect(page.locator('[data-damage-prompt]')).toHaveCount(0);
    expect(await done(page)).toMatchObject({ stars: 0 });
    await expect(page.locator('[data-damage-prompt]')).toHaveCount(0);
  });

  test(`CR-42 at ${width}px: a game-styled warning over the page, a visible Close that dismisses it`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await open(page, 'fx-cr42-browser-overlay');
    const overlay = page.locator('[data-page-overlay]');
    await expect(overlay).toBeVisible();
    await expect(overlay.locator('h3')).toHaveText('Security alert');
    await expect(overlay).toContainText(/simulation/i);
    await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toHaveCount(0);
    await minTarget(page, '[data-overlay-close]');
    await noFullscreenNoAudio(page);
    await noOverflow(page);
    await axeClean(page);
    await pressOn(page, overlay.locator('[data-overlay-close]'), 'the overlay Close');
    await expect(page.getByText('The page closes. Nothing else happens.')).toBeVisible();
    await done(page);
    await noFullscreenNoAudio(page);
  });
}

test('CR-41: damage control for Noor\'s friend, voiced by Noor', async ({ page }) => {
  await open(page, 'fx-cr41-friend-offcast');
  await press(page, 'Talk it through with Noor, step by step');
  const cont = page.getByRole('button', { name: 'Continue', exact: true });
  await expect(async () => {
    if (await cont.first().isVisible()) await cont.first().click();
    await expect(page.locator('[data-damage-prompt]')).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
  await expect(page.locator('[data-damage-prompt]')).toHaveText("Pick the step Noor's friend should take first, then 2 more.");
  await axeClean(page);
  for (const st of ['keep_quiet', 'tell_trusted_adult', 'call_bank_stop_payment']) await pressOn(page, page.locator(`[data-step="${st}"]`), st);
  await press(page, 'Done');
  await expect(page.locator('[data-voice]')).toHaveText('Noor: She wants it to go away. But getting help early is the right move.');
});

/** Open the seeded finale chapter in the App, play its one scenario (Close on the overlay) to the arc block. */
async function toArcBlock(page: Page, arc: 'C' | 'A' | 'R') {
  await page.goto(`${HARNESS_URL}/?view=app&arc=${arc}`);
  await press(page, 'Start');
  await press(page, 'Start');
  await pressOn(page, page.locator('[data-overlay-close]'), 'the overlay Close');
  await press(page, 'Continue');
  await expect(page.getByText('2 of 3 stars')).toBeVisible();
  await press(page, 'Continue');
}

const BLAME = /\b(fell|fooled|mistake|lost)\b|€|\d+\s*(times|falls)/i;

async function timeline(page: Page) {
  const tl = page.locator('[data-finale-step="timeline"]');
  await expect(tl).toBeVisible();
  await expect(tl.getByRole('heading', { level: 1 })).toHaveText('What you saw so far');
  await expect(tl).not.toContainText(/points|banked/i);
  await expect(tl.locator('[data-timeline-header]')).toHaveText("Every step below was Alex's plan, not your fault.");
  await expect(tl.locator('[data-timeline-slot="1"]')).toContainText('You replied. Nothing wrong with that.');
  expect(await tl.locator('[data-timeline]').innerText()).not.toMatch(BLAME);
  await axeClean(page);
  await press(page, 'Continue');
}

/** Click Continue/Next through story panels until `stop` is visible. */
async function storyUntil(page: Page, stop: string) {
  const target = page.locator(stop);
  await expect(async () => {
    if (await target.first().isVisible()) return;
    const btn = page.getByRole('button', { name: /^(Next|Continue)$/ });
    if (await btn.first().isVisible()) await btn.first().click();
    await expect(target.first()).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 20_000 });
}

test('CR-43/44, ending C: reveal card, damage control, recovery offer, timeline, ending-C resolution, postcard pick, end screen', async ({ page }) => {
  await toArcBlock(page, 'C');
  // The close beat: the photo check reveals one picture under three names.
  await press(page, "Do a photo check on Alex's picture");
  const reveal = page.locator('[data-reveal-card]');
  await expect(reveal).toBeVisible();
  await expect(reveal.getByRole('heading')).toHaveText('The same picture Alex used.');
  await expect(reveal).toContainText('Names on the three profiles: Alex, Robin, Sacha.');
  await expect(reveal.locator('[data-reveal-line]')).toHaveText('A picture that checks out proves nothing either. Telling someone is what works.');
  await axeClean(page);
  await press(page, 'Continue');
  await expect(page.getByRole('button', { name: 'Play again' }), 'no replay of a finale step').toHaveCount(0);
  await press(page, 'Continue');
  // Ending C: money in, so damage control for the arc.
  await expect(page.getByText('Limit the damage')).toBeVisible();
  // R22 (psych M3): the comfort line comes before any step.
  await expect(page.locator('[data-damage-intro]')).toHaveText('Alex was never real. The lie was theirs, not yours.');
  // QA B2: shuffled (seeded by the close beat), not in the authored order.
  const order = await page.locator('[data-step]').evaluateAll((els) => els.map((e) => e.getAttribute('data-step')));
  expect(order.slice().sort()).toEqual(['call_bank_known_number', 'keep_evidence', 'pay_last_fee', 'pay_recovery_service', 'report_to_police_online', 'stop_paying']);
  expect(order).not.toEqual(['stop_paying', 'call_bank_known_number', 'keep_evidence', 'report_to_police_online', 'pay_last_fee', 'pay_recovery_service']);
  for (const st of ['stop_paying', 'call_bank_known_number', 'keep_evidence']) await pressOn(page, page.locator(`[data-step="${st}"]`), st);
  await press(page, 'Done');
  await press(page, 'Continue');
  // The recovery offer: a fee-first stranger.
  await expect(page.getByText('We can get your money back').filter({ visible: true }).first()).toBeVisible();
  await press(page, 'Report the email');
  await press(page, 'Continue');
  await press(page, 'Continue');
  await timeline(page);
  // Resolution: the opening, then only the ending-C scene, then the Open Evening.
  await expect(page.getByText("The hall is ready. Let's talk before the guests arrive.")).toBeVisible();
  await press(page, 'Continue');
  await expect(page.getByText('You were kind to someone who turned out not to exist.')).toBeVisible();
  await expect(page.getByText('Asking was the smart bit.')).toHaveCount(0);
  // R25(5), CR-51: the close beat's photo check set arc_checked, so the checked line plays.
  await storyUntil(page, "text=And you checked before anything else. That's what works.");
  await storyUntil(page, '[data-postcard-pick]');
  const pick = page.locator('[data-postcard-pick]');
  await expect(pick).toContainText('Pick a postcard for Teo to read. Any one will do.');
  await expect(pick.locator('[data-postcard]')).toHaveText(['Berlin']);
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await axeClean(page);
  await pressOn(page, pick.locator('[data-postcard="fxpast"]'), 'the Berlin postcard');
  await expect(page.getByText('You picked Berlin.')).toBeVisible();
  await settle(page);
  await expect(page.locator('[data-postcard-picked]'), 'QA B3: focus on the pick line').toBeFocused();
  await expect(page.locator('[data-flip-card]')).toContainText('If a parcel message wants money or a click');
  await storyUntil(page, 'text=Chapter complete');
  await press(page, 'Back to the chapters');
  // The end screen: epigraph, If-then lines, cards with a gold mark, help; no totals or rankings.
  const end = page.locator('[data-end-screen]');
  await expect(end.getByRole('heading', { level: 1 })).toHaveText('Your Atlas');
  await settle(page);
  await expect(end.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(end.locator('[data-epigraph] blockquote')).toContainText('Then be the someone for the next person.');
  await expect(end.locator('[data-epigraph] figcaption')).toHaveText('Adaeze');
  await expect(end.locator('[data-atlas-page]')).toHaveCount(2);
  await expect(end.locator('[data-end-card="ask-someone"] [data-gold-mark]')).toContainText('Gold');
  await expect(end.getByText('Where to report and get help')).toBeVisible();
  expect(await end.innerText()).not.toMatch(/\b(rank|total|score|points|streak)\b|€|★/i);
  await minTarget(page, '[data-end-screen] button');
  await noOverflow(page);
  await axeClean(page);
  await press(page, 'Back to the map');
  await expect(page.getByRole('heading', { name: 'Chapters' })).toBeVisible();
});

test('CR-40/43, ending A: Teo forwards a profile; "A little can\'t hurt" shows the authored advice line, then the timeline and ending-A', async ({ page }) => {
  await toArcBlock(page, 'A');
  await expect(page.locator('[data-forwarded]')).toContainText('Forwarded from');
  await axeClean(page);
  await press(page, "A little can't hurt");
  // R22 (psych M1): every Teo outcome ends in the reveal.
  await expect(page.locator('[data-reveal-card]')).toBeVisible();
  await press(page, 'Continue');
  await expect(page.locator('[data-advice-line]')).toHaveText('Teo asked, and that was the smart bit. With an offer like this, the answer is always no.');
  await expect(page.getByText('Limit the damage')).toHaveCount(0);
  await press(page, 'Continue');
  await timeline(page);
  await press(page, 'Continue');
  await expect(page.getByText('Same picture, different name. Asking was the smart bit.')).toBeVisible();
  await expect(page.getByText('You were kind to someone who turned out not to exist.')).toHaveCount(0);
  // R28: "A little can't hurt" did not help Teo: the player's own early report is the line, never "you helped him".
  await storyUntil(page, "text=And you reported yours early. That's what works.");
  await expect(page.getByText("Teo asked you, and you helped him. That's what works.")).toHaveCount(0);
  await expect(page.getByText("You stepped back early, and you never sent any money.")).toHaveCount(0);
});

test('R22, "Tell me now" with money in: arc damage control first, then the recovery test; a fall shows the authored note', async ({ page }) => {
  await toArcBlock(page, 'R');
  await expect(page.getByText('Limit the damage')).toBeVisible();
  await expect(page.locator('[data-damage-intro]')).toHaveText('Alex was never real. The lie was theirs, not yours.');
  for (const st of ['stop_paying', 'call_bank_known_number', 'keep_evidence']) await pressOn(page, page.locator(`[data-step="${st}"]`), st);
  await press(page, 'Done');
  await press(page, 'Continue');
  await expect(page.getByText('We can get your money back').filter({ visible: true }).first()).toBeVisible();
  await press(page, 'Pay the fee to open your file');
  await expect(async () => {
    const cont = page.getByRole('button', { name: 'Continue', exact: true });
    if (await cont.first().isVisible()) await cont.first().click();
    await expect(page.locator('[data-step]').first()).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 10_000 });
  // R25(4), CR-53: re-pinned. Right after the arc damage control, the recovery test's fall shows "Your steps"
  // read-only (no second scored pick): the note first, then the helpful steps; the harmful steps the arc damage
  // control just offered are not repeated.
  const steps = page.locator('[data-recovery-readonly]');
  await expect(steps.getByRole('heading', { name: 'Your steps' })).toBeFocused();
  await expect(steps.locator('[data-recovery-note]')).toHaveText("Recovery offers often follow a loss because scammers share victims' details. That says nothing about you.");
  await expect(steps.locator('[data-step]')).toHaveCount(4);
  await expect(steps.locator('[data-step="pay_recovery_service"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(0);
  await axeClean(page);
  await press(page, 'Continue');
  // The debrief still carries the already-clicked advice (Red Line 4).
  await expect(page.locator('#debrief-more')).toContainText('Paid a fee already? Stop paying');
});
