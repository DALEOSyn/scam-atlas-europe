import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HARNESS_URL } from '../../playwright.config.ts';
import { pressOn, press, settle, WCAG } from './fixture-helpers.ts';

/**
 * T-4.5 (docs/qa/T-4.5-a11y-privacy-audit.md): dark colour scheme, axe with the WCAG 2.2 AA tags, zero
 * violations. Authored scenarios of every chapter through the harness (`?view=content&id=…`), one story
 * scene per chapter, the letter with its Translate toggle (B2), and the finale fixture in the real App
 * through the debrief stars, damage control, timeline, postcard pick, chapter end and the end screen with
 * its Gold mark (B3). Also B1 and m2 (HUD menu focus) and m4 (document.title) in a real browser.
 */
test.use({ colorScheme: 'dark' });

async function axeClean(page: Page, where: string) {
  // Let fade-ins finish, so contrast is measured on the end state.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const v = (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations;
  expect(
    v.map((x) => `${x.id}: ${x.nodes.map((n) => `${n.target.join(' ')} ${n.failureSummary ?? ''}`).join(' | ')}`),
    `${where}: axe violations in dark mode`,
  ).toEqual([]);
}

/** T-4.5 R3: one h1, and no heading level skipped going down (h1 → h3) among the visible headings. */
async function headingsInOrder(page: Page, where: string) {
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((h) => !h.closest('[hidden], [aria-hidden="true"]'))
      .map((h) => `${h.tagName.toLowerCase()} ${(h.textContent ?? '').trim().slice(0, 40)}`),
  );
  expect(levels.filter((l) => l.startsWith('h1 ')), `${where}: one h1`).toHaveLength(1);
  const skips = levels.flatMap((l, i) => (i > 0 && Number(l[1]) > Number((levels[i - 1] ?? 'h1')[1]) + 1 ? [`${levels[i - 1]} → ${l}`] : []));
  expect(skips, `${where}: heading levels`).toEqual([]);
}

async function darkActive(page: Page) {
  expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), 'the page sees the dark scheme').toBe(true);
}

async function openContent(page: Page, id: string) {
  await page.goto(`${HARNESS_URL}/?view=content&id=${id}`);
  await expect(page.locator('#device-heading')).toBeVisible();
  await darkActive(page);
}

/** Open every Translate toggle on screen (letters, bubbles, notifications). */
async function translateAll(page: Page) {
  const toggles = page.getByRole('button', { name: 'Translate', exact: true });
  for (let i = await toggles.count(); i > 0; i--) {
    const first = toggles.first();
    if (!(await first.isVisible())) break;
    await first.click();
  }
}

async function checkModeOn(page: Page) {
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.locator('#hud-menu').getByRole('button', { name: 'Check mode' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hud-menu')).toBeHidden();
}

/** One scenario per chapter: the chapter's boss (or a letter for Lisbon), first view and the step after the first choice. */
const CHAPTERS: [string, string][] = [
  ['home', 'home-06-boss-new-portal'],
  ['berlin', 'berlin-09-boss-fraud-team'],
  ['amsterdam', 'amsterdam-09-boss-last-evening'],
  ['paris', 'paris-09-boss-pont'],
  ['madrid', 'madrid-09-boss-reserve'],
  ['rome', 'rome-09-boss-investigation'],
  ['warsaw', 'warsaw-09-boss-stove'],
  ['lisbon', 'lisbon-07-parking-slip'],
  ['dublin', 'dublin-09-boss-clone-bond'],
  ['stockholm', 'stockholm-09-boss-case-file'],
  ['brussels', 'brussels-09-boss-helpdesk'],
];

for (const [city, id] of CHAPTERS) {
  test(`dark: ${city} (${id}) first view, translated, in Check mode, and after the first choice`, async ({ page }) => {
    await openContent(page, id);
    await axeClean(page, `${id} first view`);
    await translateAll(page);
    await checkModeOn(page);
    await axeClean(page, `${id} translated, Check mode`);
    // An incoming call (Rome, Stockholm): answer it first; the options come with the caller's lines.
    const answer = page.getByRole('button', { name: 'Answer', exact: true });
    if (await answer.isVisible()) {
      await answer.click();
      await settle(page);
      await axeClean(page, `${id} call answered`);
    }
    const first = page.locator('#options').getByRole('button').first();
    await expect(first).toBeVisible({ timeout: 30_000 });
    await first.click();
    await settle(page);
    await axeClean(page, `${id} after the first choice`);
    await headingsInOrder(page, `${id} after the first choice`);
  });

  test(`dark: ${city} resolution scene to its last panel`, async ({ page }) => {
    const sceneId = city === 'brussels' ? 'brussels-resolution-open' : `${city}-resolution`;
    await page.goto(`${HARNESS_URL}/?view=real&id=${sceneId}`);
    const scene = page.locator(`main[data-scene-id="${sceneId}"]`);
    await expect(scene).toBeVisible();
    await darkActive(page);
    const next = scene.getByRole('button', { name: 'Next' });
    while (await next.isVisible()) await next.click();
    await axeClean(page, `${sceneId} all panels`);
  });
}

test('dark B2: the letter on the table keeps every control at AA on its paper (Lisbon parking slip)', async ({ page }) => {
  await openContent(page, 'lisbon-07-parking-slip');
  const letter = page.locator('article[data-surface="paper"]');
  await expect(letter).toBeVisible();
  const toggle = letter.getByRole('button', { name: 'Translate', exact: true });
  await expect(toggle).toBeVisible();
  // The Translate toggle takes the letter ink, not the dark theme's light link colour.
  const colours = await letter.evaluate((el) => {
    const ink = getComputedStyle(el).color;
    const t = el.querySelector('button[aria-expanded]') ?? [...el.querySelectorAll('button')].find((b) => b.textContent === 'Translate');
    return { ink, toggle: t ? getComputedStyle(t).color : null, paper: getComputedStyle(el).backgroundColor };
  });
  expect(colours.toggle).toBe(colours.ink);
  await axeClean(page, 'letter');
  await toggle.click();
  await checkModeOn(page);
  await axeClean(page, 'letter translated, Check mode');
});

/** The seeded finale chapter in the App (harness `?view=app`), its one scenario played to the arc block. */
async function toArcBlock(page: Page) {
  await page.goto(`${HARNESS_URL}/?view=app&arc=C`);
  await darkActive(page);
  await expect(page).toHaveTitle('Scam Atlas: Europe');
  await axeClean(page, 'title screen');
  await press(page, 'Start');
  await axeClean(page, 'finale chapter intro');
  await press(page, 'Start');
  await expect(page.locator('#device-heading')).toBeVisible();
  await axeClean(page, 'finale scenario');
  await pressOn(page, page.locator('[data-overlay-close]'), 'the overlay Close');
  await press(page, 'Continue');
  await expect(page.getByText('2 of 3 stars')).toBeVisible();
  await expect(page).toHaveTitle('Debrief · Scam Atlas: Europe');
  await axeClean(page, 'debrief with stars');
  await press(page, 'Continue');
}

async function storyUntil(page: Page, stop: string) {
  const target = page.locator(stop);
  await expect(async () => {
    if (await target.first().isVisible()) return;
    const btn = page.getByRole('button', { name: /^(Next|Continue)$/ });
    if (await btn.first().isVisible()) await btn.first().click();
    await expect(target.first()).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 20_000 });
}

test('dark: the finale (ending C) through the timeline, postcard pick, chapter end and the end screen with its Gold mark', async ({ page }) => {
  await toArcBlock(page);
  await press(page, "Do a photo check on Alex's picture");
  await expect(page.locator('[data-reveal-card]')).toBeVisible();
  await axeClean(page, 'finale reveal card');
  await press(page, 'Continue');
  await press(page, 'Continue');
  await expect(page.locator('#damage-heading')).toHaveText('Limit the damage');
  await expect(page).toHaveTitle('Limit the damage · Scam Atlas: Europe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finale fixture · Finale');
  await axeClean(page, 'finale damage control');
  await headingsInOrder(page, 'finale damage control');
  for (const st of ['stop_paying', 'call_bank_known_number', 'keep_evidence']) await pressOn(page, page.locator(`[data-step="${st}"]`), st);
  await press(page, 'Done');
  await press(page, 'Continue');
  await expect(page.getByText('We can get your money back').filter({ visible: true }).first()).toBeVisible();
  await axeClean(page, 'finale recovery offer');
  await press(page, 'Report the email');
  await press(page, 'Continue');
  await press(page, 'Continue');
  await expect(page.locator('[data-finale-step="timeline"]')).toBeVisible();
  await axeClean(page, 'finale timeline');
  await press(page, 'Continue');
  await storyUntil(page, '[data-postcard-pick]');
  await axeClean(page, 'Open Evening postcard pick');
  await pressOn(page, page.locator('[data-postcard-pick] [data-postcard="fxpast"]'), 'the Berlin postcard');
  await expect(page.getByText('You picked Berlin.')).toBeVisible();
  await axeClean(page, 'flip card');
  await storyUntil(page, 'text=Chapter complete');
  await expect(page).toHaveTitle('Finale fixture · Chapter complete · Scam Atlas: Europe');
  await axeClean(page, 'chapter complete (stamp)');
  await press(page, 'Back to the chapters');
  const end = page.locator('[data-end-screen]');
  await expect(end.getByRole('heading', { level: 1 })).toHaveText('Your Atlas');
  await expect(page).toHaveTitle('Your Atlas · Scam Atlas: Europe');
  const gold = end.locator('[data-gold-mark]').first();
  await expect(gold).toContainText('Gold');
  await gold.scrollIntoViewIfNeeded();
  await axeClean(page, 'end screen');
});

/**
 * `busy`: animation frames never fire (as on a loaded CI runner), so passive effects wait for Preact's 35 ms
 * fallback. The Escape listener must already be on when the keys arrive faster than that (round 2: CI saw
 * the menu stay open because the listener was added after paint).
 */
for (const busy of [false, true]) test(`B1 and m2${busy ? ' (no animation frames)' : ''}: Escape returns focus to Menu; Tab out of the menu closes it`, async ({ page }) => {
  if (busy) await page.addInitScript(() => Object.assign(window, { requestAnimationFrame: () => 0 }));
  await openContent(page, 'berlin-09-boss-fraud-team');
  await expect(page).toHaveTitle('Berlin · Message 1 of 1 · Scam Atlas: Europe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Berlin · Message 1 of 1');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hud-menu')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('#hud-menu button').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hud-menu')).toBeHidden();
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  // m2: Tab through to the last item, then once more: focus leaves the menu and it closes.
  await page.keyboard.press('Enter');
  const items = await page.locator('#hud-menu button').count();
  for (let i = 0; i < items; i++) await page.keyboard.press('Tab');
  await expect(page.locator('#hud-menu button').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#hud-menu')).toBeHidden();
  expect(await page.evaluate(() => document.activeElement?.closest('#hud-menu') === null && document.activeElement !== document.body)).toBe(true);
});

test('m6 at 320×640: the jump bar keeps the 44 px target, and content does not move when it goes idle', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openContent(page, 'berlin-09-boss-fraud-team');
  const bar = page.locator('[data-jump]');
  // The options are below the fold on a phone: the bar shows once they are out of view.
  await expect(bar).toBeVisible();
  const shown = await bar.boundingBox();
  expect(shown?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(shown?.height ?? 99).toBeLessThan(48);
  const stageTop = () => page.locator('#device-heading').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const before = await stageTop();
  await bar.click();
  // Idle: hidden but keeping its room, at the same size, so nothing above or below it moves.
  await expect(page.getByRole('button', { name: 'Jump to your options' })).toHaveCount(0);
  const idle = await bar.evaluate((el) => ({ h: el.getBoundingClientRect().height, v: getComputedStyle(el).visibility }));
  expect(idle).toEqual({ h: shown?.height, v: 'hidden' });
  expect(await stageTop()).toBe(before);
});
