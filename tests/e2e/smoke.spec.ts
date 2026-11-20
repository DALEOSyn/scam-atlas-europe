import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { playScene, skipScene } from './scene-helpers.ts';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axeClean(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations).toEqual([]);
}

const debriefHeading = (page: Page) => page.getByRole('heading', { level: 1, name: /This was (a scam|genuine):|Teo was right/ });

// The consequence step's own heading (h2 since T-4.5 R3; the debrief also has an h2 "What happened").
const consequenceHeading = (page: Page) => page.getByRole('heading', { level: 2, name: 'What happened' }).and(page.locator('#consequence-h'));

/**
 * The consequence step after every resolved scenario (layer-1 ruling 2026-11-19): focus lands on its
 * heading with the outcome caption right after it; Continue goes on to damage control or the debrief.
 */
/** CR-27: a fresh chapter run opens on the chapter intro (h1 = chapter name, focused; one Start button). */
async function passIntro(page: Page, chapter = 'Home', axe = false) {
  const intro = page.locator('[data-chapter-intro]');
  await expect(intro.getByRole('heading', { level: 1, name: chapter })).toBeFocused();
  if (axe) await axeClean(page);
  await intro.getByRole('button', { name: 'Start' }).click();
}

async function passConsequence(page: Page, axe = false) {
  await expect(consequenceHeading(page)).toBeFocused();
  // No empty "Your options" heading during this step (QA F4).
  await expect(page.getByRole('heading', { name: 'Your options' })).toHaveCount(0);
  if (axe) await axeClean(page);
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function continueToNext(page: Page) {
  await expect(consequenceHeading(page).or(debriefHeading(page))).toBeVisible();
  if (await consequenceHeading(page).isVisible()) await passConsequence(page);
  await expect(debriefHeading(page)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

/** Every control except inline checkables in running text is at least 44 × 44 CSS px (UI_SPEC --tap-min). */
async function tapTargetsOk(page: Page) {
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href], summary')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false; // hidden
        if (el.closest('[hidden]')) return false;
        if (el.matches('a[href^="#options"]') && r.top < 0) return false; // skip link off-screen until focused
        // Checkables in running text extend their hit area 12 px above and below through ::before.
        const extra = el.matches('[data-check]') ? 24 : 0;
        return r.height + extra < 43.5 || (r.width < 43.5 && !el.matches('[data-check]'));
      })
      .map((el) => `${el.tagName} "${(el.textContent ?? '').trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
  );
  expect(small).toEqual([]);
}

/** UI_SPEC §1.5: an owner part is never split across lines (it scrolls inside its box instead). */
async function ownersOneLine(page: Page) {
  const split = await page.evaluate(() =>
    [...document.querySelectorAll('[data-owner], [data-check="page.address"] strong')]
      .filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0)
      .filter((el) => {
        const rects = [...el.getClientRects()];
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.6;
        return rects.length > 1 || (rects[0]?.height ?? 0) > lh * 1.5;
      })
      .map((el) => el.textContent),
  );
  expect(split).toEqual([]);
}

/** The timing screen (GDD §8, QA m7): pick Standard and press Continue. */
async function chooseStandard(page: Page) {
  await page.getByRole('radio', { name: /^Standard timer/ }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
}

/** The half-day stop screen after the morning (QA M8). */
async function keepGoing(page: Page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Good place to take a break' })).toBeFocused();
  await page.getByRole('button', { name: 'Keep going' }).click();
}

/** Answer a call and wait for the actions (lines arrive at reading pace). */
async function answerCall(page: Page) {
  await page.getByRole('button', { name: 'Answer' }).click();
  await expect(page.getByRole('button', { name: 'Hang up', exact: true })).toBeVisible();
}

test('tutorial chapter: full play-through on the new devices, What now?, stamp and local save', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  const origin = new URL(baseURL ?? 'http://127.0.0.1:4173').origin;
  const foreign: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.protocol !== 'data:' && url.origin !== origin) foreign.push(req.url());
  });
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Scam Atlas: Europe' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Start' }).click();
  // Home arrival (S4): read every panel; art loads from the game's own origin (checked below).
  await playScene(page, 'home-arrival', { axe: true });
  await passIntro(page, 'Home', true);

  // 0-1 genuine welcome email on the laptop mail device: Check card + tag, then the verify habit.
  await expect(page.getByRole('region', { name: 'Laptop: Mail' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await page.locator('[data-check="sender.detail"]').click();
  const card = page.getByRole('dialog', { name: /Sender details/ });
  await expect(card).toBeVisible();
  await expect(card.getByText('adaeze.okafor-lind@waymarker-network.example').first()).toBeVisible();
  await expect(card.getByRole('button', { name: /^Mark as suspicious/ })).toHaveAttribute('aria-pressed', 'false');
  await axeClean(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-check="sender.detail"]')).toBeFocused();
  await tapTargetsOk(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await passConsequence(page, true);
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByText('That is the habit that works.', { exact: false })).toBeVisible();
  await expect(page.getByText(/could happen to anyone/)).toHaveCount(0);
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Who really sent this?' })).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  // 0-2 fraud: open the mail app yourself.
  await page.getByRole('button', { name: /Open Waymarker mail yourself/ }).click();
  await continueToNext(page);

  // 0-3: timing is chosen first (GDD §8); the page opens on the browser, then the reset email.
  await expect(page.getByRole('heading', { name: 'How much time do you want?' })).toBeFocused();
  // Reduced motion is off here, so Standard is pre-selected (QA m7).
  await expect(page.getByRole('radio', { name: /^Standard timer/ })).toBeChecked();
  await axeClean(page);
  await chooseStandard(page);
  await expect(page.getByRole('region', { name: 'Laptop: Browser' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText(/\d:\d\d/);
  await expect(page.getByRole('meter', { name: 'Stress' })).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Go to your inbox' }).click();
  await expect(page.getByRole('heading', { name: 'Email from Waymarker Desk' })).toBeFocused();
  await page.getByRole('button', { name: /Use the link and set a new password/ }).click();
  await passConsequence(page);
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await continueToNext(page);
  // Half-day stop after the morning (QA M8): progress is saved, the player chooses.
  await expect(page.getByRole('heading', { level: 1, name: 'Good place to take a break' })).toBeFocused();
  await expect(page.getByText('3 messages left today. Your progress is saved.')).toBeVisible();
  await axeClean(page);
  await keepGoing(page);
  await playScene(page, 'home-turn', { choose: 'Pause' });

  // 0-4 SMS with a timer and pushers: Take a breath, then open Kettle yourself.
  await expect(page.getByRole('region', { name: 'Phone: Messages' })).toBeVisible();
  await page.locator('[data-hud="pause"]').click();
  await expect(page.getByText('Real companies give you days, not seconds.')).toBeVisible();
  await expect(page.locator('[data-hud="pause"]')).toBeFocused(); // Take a breath never moves focus away from the control
  await axeClean(page);
  await page.getByRole('button', { name: 'Back to it' }).click();
  await page.getByRole('button', { name: /Open Kettle yourself/ }).click();
  await continueToNext(page);

  // 0-5 drill in the Kettle chat: damage control for Teo, unscored; drill layout has no verdict or stars.
  await expect(page.getByRole('region', { name: 'Phone: Kettle' })).toBeVisible();
  await page.getByRole('button', { name: /Talk Teo through/ }).click();
  await passConsequence(page);
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeFocused();
  await axeClean(page);
  await page.getByRole('button', { name: /Block your card/ }).click();
  await page.getByRole('button', { name: /Call your bank/ }).click();
  await page.getByRole('button', { name: /Report it to the police/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('heading', { name: 'Your steps' })).toBeFocused();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Teo was right to ask/ })).toBeVisible();
  await expect(page.getByText(/This was (a scam|genuine)/)).toHaveCount(0);
  await expect(page.getByRole('img', { name: /of 3 stars/ })).toHaveCount(0);
  await continueToNext(page);

  // 0-6 boss: email → Kettle chat → call; beat 3: answer, hang up → "What now?".
  await page.getByRole('button', { name: /Open Waymarker Desk from your bookmark/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Chat message from Waymarker IT' })).toBeFocused();
  await page.getByRole('button', { name: /Check with Adaeze/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('region', { name: 'Phone: Call' })).toBeVisible();
  await expect(page.getByRole('timer')).toContainText(/\d:\d\d/);
  await answerCall(page);
  await expect(page.getByRole('log')).toContainText('IT desk here');
  await page.getByRole('button', { name: 'Hang up', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What now?' })).toBeFocused();
  await expect(page.getByText('Call ended')).toBeVisible();
  // No checks after hanging up.
  await expect(page.getByRole('button', { name: /Details you can check/ })).toHaveCount(0);
  await axeClean(page);
  await page.getByRole('button', { name: 'Ask Adaeze through the staff directory' }).click();
  await passConsequence(page);
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await axeClean(page);
  await continueToNext(page);

  // Home resolution (S4): Adaeze, Noor and Teo, then Teo's If-then panel; the postcard carries it word for word.
  await playScene(page, 'home-resolution', { axe: true });
  await expect(page.getByRole('heading', { level: 1, name: 'Chapter complete' })).toBeFocused();
  await expect(page.getByText("then I block it in the bank app and tell someone.", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/^Passport stamp: Home, (bronze|silver|gold)$/)).toBeVisible();
  await expect(page.getByText(/Red flags you spotted: 0 of \d+ · Marks on safe details: \d+ · Genuine messages you reported: 0/)).toBeVisible();
  await expect(page.getByText(/To reach silver next time:/)).toBeVisible();
  await axeClean(page);

  // Progress is saved locally only (Red Line 7).
  const saved = await page.evaluate(() => localStorage.getItem('scam-atlas-europe:save'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ version: 1, settings: { timerMode: 'standard' }, chapters: { home: { finished: true } } });

  // Back to the chapter list (QA B1): Home is finished and can be replayed.
  await page.getByRole('button', { name: 'Back to the chapters' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Chapters' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Replay Home' })).toBeVisible();
  await axeClean(page);
  expect(foreign).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('tutorial 0-2: fall on the training page, damage control feedback, blame-free debrief', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await page.getByRole('button', { name: /Report the email as phishing/ }).click();
  await passConsequence(page);
  // Tutorial grace (ruling L4): reporting a genuine message in Home scores ★ with a kind line, never a bare label.
  await expect(page.getByRole('img', { name: '1 of 3 stars' })).toBeVisible();
  await expect(page.getByText('You reported it. Careful is good; this one was safe.')).toBeVisible();
  await expect(page.getByText(/You chose: Report the email as phishing/)).toHaveCount(0);
  await expect(page.getByText(/could happen to anyone/)).toHaveCount(0);
  await axeClean(page);
  await continueToNext(page);

  await page.getByRole('button', { name: /Tap the link and free up space/ }).click();
  await expect(page.getByRole('region', { name: 'Laptop: Browser, training page' })).toBeVisible();
  await expect(page.locator('form[action]')).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Simulation/ })).toBeVisible();
  // The owner part is bold in the address bar at all times (UI_SPEC §3.5); the Check card boxes it.
  const address = page.locator('[data-check="page.address"]');
  await expect(address.locator('strong')).toHaveText('waymarker-it-support.example');
  await address.click();
  const card = page.getByRole('dialog', { name: 'Page address details' });
  await expect(card).toBeVisible();
  await expect(card.locator('[class*="boxed"]')).toHaveCount(1);
  await axeClean(page);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await axeClean(page);
  // The training page's own button routes to the authored action; nothing is submitted anywhere.
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await passConsequence(page, true);
  await expect(page.getByRole('heading', { name: 'Limit the damage' })).toBeFocused();
  await page.getByRole('button', { name: /Change the password/ }).first().click();
  await page.getByRole('button', { name: /Keep it to yourself/ }).click();
  await page.getByRole('button', { name: /Sign out of every other session/ }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByText(/^Feeling embarrassed is normal, and it is what scammers count on\./)).toBeVisible();
  await axeClean(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  // After a fall the no-blame line is part of the focused h1, before the verdict (QA B9).
  await expect(debriefHeading(page)).toHaveAccessibleName(/^This could happen to anyone\. This was a scam: /);
  // After a fall the kind line takes the slot: no "You chose" line in layer 1; the outcome is under "What happened".
  await expect(page.locator('section[aria-labelledby="debrief-h1"]')).not.toContainText('You chose');
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'What happened' })).toBeVisible();
  await expect(page.locator('#debrief-more')).toContainText('You chose: Type your Waymarker password and sign in.');
  await page.getByRole('button', { name: 'Already clicked or paid? See what to do' }).click();
  await expect(page.getByRole('heading', { name: 'If you already…' })).toBeFocused();
  await axeClean(page);
});

for (const vp of [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '375x812', width: 375, height: 812 },
  { name: '320x568', width: 320, height: 568 },
  // 200% zoom of a 1440×900 window = 720×450 CSS px.
  { name: '200% zoom', width: 720, height: 450 },
  // 375 px phone at 200% zoom.
  { name: '188x406', width: 188, height: 406 },
]) {
  test(`axe clean and no horizontal scroll at ${vp.name}: mail + Check card, browser training page, damage control, debrief`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const noHScroll = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.getByRole('button', { name: 'Start' }).click();
    await skipScene(page, 'home-arrival');
    await passIntro(page);
    const firstAction = page.getByRole('button', { name: /Find the pack/ });
    await page.getByRole('button', { name: /Details you can check/ }).click();
    await page.locator('[data-check="link"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Desk layout: the Check card and the open Details list never push the actions off screen (QA B4).
    if (vp.width >= 1024) await expect(firstAction).toBeInViewport();
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
    await page.keyboard.press('Escape');
    await tapTargetsOk(page);
    await firstAction.click();
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
    await continueToNext(page);
    await page.getByRole('button', { name: /Tap the link and free up space/ }).click();
    // The owner part always stays visible in the address bar, with "…" where text is cut (QA B5).
    const bar = page.locator('[data-check="page.address"]');
    const owner = bar.locator('strong');
    const [barBox, ownerBox] = [await bar.boundingBox(), await owner.boundingBox()];
    if (vp.width >= 320) {
      expect(barBox && ownerBox && ownerBox.x >= barBox.x - 1 && ownerBox.x + ownerBox.width <= barBox.x + barBox.width + 1).toBe(true);
    } else {
      // Under 320 px: "…" + the owner part; if that is still wider, the bar (a focusable control) scrolls sideways.
      await expect(bar.locator('[class*="addrMore"]').first()).toBeVisible();
      expect(await bar.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
      expect(await bar.evaluate((el) => el.scrollWidth >= (el.querySelector('strong')?.getBoundingClientRect().width ?? 0))).toBe(true);
    }
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
    await tapTargetsOk(page);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await passConsequence(page, true);
    await noHScroll();
    await ownersOneLine(page);
    for (const step of [/Change the password/, /Keep it to yourself/, /Sign out of every other session/]) await page.getByRole('button', { name: step }).first().click();
    await page.getByRole('button', { name: 'Done' }).click();
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    // The debrief h1 names waymarker-network.example and must not widen the page (QA B7).
    await expect(debriefHeading(page)).toBeFocused();
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
    await tapTargetsOk(page);
    // Layer 2 expanded: long owner parts scroll inside their own boxes, never the page (QA F1).
    await page.getByRole('button', { name: 'More' }).click();
    await axeClean(page);
    await noHScroll();
    await ownersOneLine(page);
  });
}

/** Play the tutorial to 0-6 beat 3 (the IT call) with Standard timers. */
async function reachBossCall(page: Page) {
  await page.goto('/');
  // Reach 0-6 beat 3 quickly with timers on (Standard).
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await continueToNext(page);
  await page.getByRole('button', { name: /Open Waymarker mail yourself/ }).click();
  await continueToNext(page);
  await chooseStandard(page);
  await page.getByRole('button', { name: 'Go to your inbox' }).click();
  await page.getByRole('button', { name: /Use the link and set a new password/ }).click();
  await continueToNext(page);
  await keepGoing(page);
  await skipScene(page, 'home-turn');
  await page.getByRole('button', { name: /Open Kettle yourself/ }).click();
  await continueToNext(page);
  await page.getByRole('button', { name: /Talk Teo through/ }).click();
  await passConsequence(page);
  for (const step of [/Block your card/, /Call your bank/, /Report it to the police/]) await page.getByRole('button', { name: step }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await continueToNext(page);
  await page.getByRole('button', { name: /Open Waymarker Desk from your bookmark/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: /Check with Adaeze/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('boss call: lines arrive at reading pace, the call timer starts, checks follow the transcript', async ({ page }) => {
  test.setTimeout(120_000);
  await reachBossCall(page);

  const timer = page.getByRole('timer');
  const time = async () => /\d+:\d\d/.exec((await timer.textContent()) ?? '')?.[0] ?? '';
  const before = await time();
  await page.getByRole('button', { name: 'Answer' }).click();
  // Focus moves to the transcript heading, never to <body> (QA B2).
  await expect(page.getByRole('heading', { name: 'Call transcript' })).toBeFocused();
  // Line 4 holds the call-back number and the ticket: not listed until it is said (QA B3).
  await page.getByRole('button', { name: /Details you can check/ }).click();
  await expect(page.getByRole('button', { name: /^Check Phone number/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Check Reference/ })).toHaveCount(0);
  await page.waitForTimeout(2_000);
  expect(await time()).toBe(before); // frozen while lines are still arriving
  // QA B1: every line arrives (reading pace ≈ 15 s for lines 1–3), not just line 1.
  await expect(page.getByRole('log')).toContainText('call me back on', { timeout: 30_000 });
  await expect(page.getByRole('log').locator('li')).toHaveCount(4);
  await expect(page.getByRole('button', { name: /^Check Phone number/ })).toHaveCount(1);
  // The call timer starts once the last line is in.
  await expect.poll(time, { timeout: 5_000 }).not.toBe(before);
});

test('call, step-through mode: after the last "Next line" focus stays in the call (QA R1)', async ({ page }) => {
  test.setTimeout(120_000);
  await reachBossCall(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Call lines: step through' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Answer' }).click();
  // Answer moves focus to the transcript heading (B2); wait for it before using the keyboard.
  await expect(page.getByRole('heading', { name: 'Call transcript' })).toBeFocused();
  const next = page.getByRole('button', { name: 'Next line' });
  for (let i = 0; i < 3; i++) {
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('log').locator('li')).toHaveCount(i + 2);
  }
  await expect(page.getByRole('log').locator('li')).toHaveCount(4);
  await expect(next).toHaveCount(0);
  await expect(page.getByRole('log').locator('li').last()).toBeFocused();
  const inCall = await page.evaluate(() => {
    const a = document.activeElement;
    return !!a && a !== document.body && !!a.closest('[aria-label="Phone: Call"], section[aria-label^="Phone: Call"]') ? 'in call' : (a?.outerHTML.slice(0, 120) ?? 'none');
  });
  expect(inCall).toBe('in call');
  await expect(page.getByRole('log').locator('li').last()).toBeFocused();
  await axeClean(page);
});

test('1440x900: with every detail checked, hidden text stays inside the scrolling rail (QA R2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await page.getByRole('button', { name: /Details you can check/ }).click();
  const rows = page.locator('[data-check-row]');
  const n = await rows.count();
  expect(n).toBeGreaterThan(1);
  for (let i = 0; i < n; i++) {
    await rows.nth(i).click();
    await page.keyboard.press('Escape');
  }
  await expect(page.getByRole('button', { name: `Details you can check · ${n} checked` })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true);
});

test('keyboard only: skip link, Check from the Details list, tag, act, debrief (shortcuts off)', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Start' })).toBeFocused();
  await page.keyboard.press('Enter');
  // The Home arrival scene (S4) opens with focus on its heading; Tab reaches "Skip story" by keyboard.
  const arrival = page.locator('main[data-scene-id="home-arrival"]');
  await expect(arrival.getByRole('heading', { level: 1 })).toBeFocused();
  const skipStory = arrival.locator('[data-scene="skip"]');
  for (let i = 0; i < 6 && !(await skipStory.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(skipStory).toBeFocused();
  await page.keyboard.press('Enter');
  // CR-27: the chapter intro, keyboard only: the h1 has focus, Tab reaches Start.
  await expect(page.getByRole('heading', { level: 1, name: 'Home' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-chapter-intro]').getByRole('button', { name: 'Start' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
  // The skip link is the first stop on the page (before the HUD) and moves focus to "Your options".
  const skip = page.getByRole('link', { name: 'Skip to your options' });
  for (let i = 0; i < 6 && !(await skip.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Skip to your options' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#options')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /Details you can check/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab'); // Check mode
  await page.keyboard.press('Tab'); // first row: Sender
  await expect(page.getByRole('button', { name: /^Check Sender/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  // The tag toggle follows the checked item in DOM order and never moves focus.
  const tag = page.getByRole('button', { name: 'Mark as suspicious: Sender' });
  await expect(tag).toBeFocused();
  await page.keyboard.press('Space');
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await expect(tag).toBeFocused();
  await expect(page.getByRole('button', { name: 'Details you can check · 1 checked' })).toBeVisible();
  // Reach an action by keyboard.
  for (let i = 0; i < 30; i++) {
    if (await page.getByRole('button', { name: 'Leave it for later' }).evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: 'Leave it for later' })).toBeFocused();
  await page.keyboard.press('Enter');
  // Consequence step: focus on its heading; Tab reaches Continue.
  await expect(consequenceHeading(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(debriefHeading(page)).toBeFocused();
  // Wrong tag on a genuine message: shown in layer 2 without the bonus clause (no bonus on genuine).
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByText(/You marked this. It was fine here./)).toBeVisible();
});

test('reload mid-chapter offers Continue and resumes at the next scenario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await passConsequence(page);
  await expect(debriefHeading(page)).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Email from Waymarker mail' })).toBeFocused();
});

test('service worker registers (offline-capable)', async ({ page }) => {
  await page.goto('/');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe('/');
});

test('production build ships a CSP that blocks form submission and a web app manifest', async ({ page }) => {
  await page.goto('/');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("form-action 'none'");
  expect(csp).toContain("connect-src 'self'");
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});

test('start screen: Chapters list, Settings page; Start continues the next unfinished chapter (QA B1, M7)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Chapters' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Chapters' })).toBeFocused();
  await expect(page.locator('[data-chapter="home"]')).toContainText('Not started');
  await axeClean(page);
  await page.getByRole('button', { name: 'Back to the start' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Always show translations' }).check();
  await axeClean(page);
  await page.getByRole('button', { name: 'Done' }).click();
  const saved = await page.evaluate(() => localStorage.getItem('scam-atlas-europe:save'));
  expect(JSON.parse(saved ?? '{}')).toMatchObject({ settings: { alwaysTranslate: true } });
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
});

test('in a scenario: sticky HUD, Settings dialog from the menu, Jump to your options on a small phone (QA M5, M6, M7)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 560 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await expect(page.getByRole('heading', { name: 'Email from Adaeze Okafor-Lind' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 0));

  // The tray is below the fold: the jump bar is shown and moves focus to the options.
  const jump = page.getByRole('button', { name: 'Jump to your options' });
  await expect(jump).toBeVisible();
  await axeClean(page);
  await jump.click();
  await expect(page.locator('#options')).toBeFocused();
  await expect(jump).toHaveCount(0);

  // Scrolled down, the HUD stays at the top of the viewport.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toBeInViewport();
  const top = await menu.evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeLessThan(80);

  // Settings is a modal dialog; Escape returns focus to the menu control.
  await menu.click();
  await page.getByRole('button', { name: 'Settings' }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Timer and follow-up changes apply from the next message.')).toBeVisible();
  await axeClean(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test('0-3: "Go to your inbox", then the reset email\'s timer runs out twice → ★, not ★★★ (QA T-2.8 M1)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await skipScene(page, 'home-arrival');
  await passIntro(page);
  await page.getByRole('button', { name: /Find the pack in Waymarker Desk yourself/ }).click();
  await continueToNext(page);
  await page.getByRole('button', { name: /Open Waymarker mail yourself/ }).click();
  await continueToNext(page);
  await chooseStandard(page);
  await page.getByRole('button', { name: 'Go to your inbox' }).click();
  await expect(page.getByRole('heading', { name: 'Email from Waymarker Desk' })).toBeFocused();
  // First expiry: +20 s; second expiry ends the scenario. Run the game clock well past both.
  await page.clock.runFor(150_000);
  await expect(consequenceHeading(page)).toBeFocused();
  await expect(page.getByText(/Time's up in the game, not in real life\./)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(debriefHeading(page)).toBeFocused();
  await expect(page.getByRole('img', { name: '1 of 3 stars' })).toBeVisible();
  await expect(page.getByText('That is the habit that works.', { exact: false })).toHaveCount(0);
  await expect(page.getByText(/15 of 15/)).toHaveCount(0);
});

test('start screen: Done on Settings and Back from Chapters return focus to their buttons (QA T-2.8 m1, m2)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeFocused();
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  await page.getByRole('button', { name: 'Chapters' }).click();
  await page.getByRole('button', { name: 'Back to the start' }).click();
  await expect(page.getByRole('button', { name: 'Chapters' })).toBeFocused();
});
