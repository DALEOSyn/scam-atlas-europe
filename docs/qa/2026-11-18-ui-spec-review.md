# QA review: T-1.6 UI spec, tokens and mock-ups

**Agent:** qa-playtester · **Date:** 2026-11-18 · **Scope:** `docs/UI_SPEC.md` (draft for G1), `src/styles/tokens.css`, `docs/ui-mockups/01-sms-magnifier.html`, `02-mail-browser-simulated-login.html`, `03-debrief.html`. Read against `CLAUDE.md`, `docs/PERSONAS.md`, my paper playtest `docs/qa/2026-11-18-gdd-paper-playtest.md` (A1–A9), and `content/balance.yaml` v3.

**Method**
- Opened the three static mock-ups in headless Chromium (Playwright). Reduced motion was emulated in every run.
- Viewports: 375×812, 1440×900, 320×568 (the WCAG 1.4.10 width), and 200% zoom simulated at 188×406 (375 @ 200%) and 720×450 (1440 @ 200%). Mock-up 3 was also shot in dark mode.
- Mock-up 1 draws a 390 px phone inside a padded page. I also rendered it full-bleed (padding removed, screen = viewport), which is how §1.2 says it ships.
- axe-core 4.x (WCAG 2.0/2.1/2.2 A+AA plus best-practice) at 375 and 1440.
- Keyboard-only Tab pass on every mock-up, with a check for focus hidden behind sticky or fixed bars.
- Network-request log. Contrast calculations for the Overwhelmed vignette.
- The mock-ups are static, so shortcuts, timers, live regions and motion are judged against the spec text. Mock-up defects are reported only where they expose a spec gap, or where the spec's own values cause them.

**Screenshots:** `docs/qa/screens/` (24 files). The ones cited below:
- `01-sms-fullbleed-tray-375.png`, `01-sms-fullbleed-tray-320.png`, `01-sms-fullbleed-tray-zoom200.png`, `01-sms-magnifier-375x812.png`, `01-sms-magnifier-320x568.png`
- `02-mail-browser-simulated-login-1440x900.png`, `02-mail-browser-simulated-login-375x812.png`
- `03-debrief-375x812.png`, `03-debrief-1440x900-dark.png`, `03-debrief-zoom200-focus-obscured.png`

## Verdict: FAIL

This is a strong, careful spec. These parts are right:
- the three-layer model, and the iris SIMULATION marker on genuine and fake pages alike;
- `<div>` fields with no `<input>` and no `<form>`;
- domain anatomy that uses a box and bold weight, not colour alone;
- long-press as a mirror of the real "press and hold to preview" habit (this resolves my earlier L5);
- actions that never reorder under stress;
- interrupts that never steal focus;
- the stress meter as `role="meter"` with value text;
- audio off by default, transcripts always shown, and letters as real text;
- a timing choice at first launch, the skip link, the `1–5` keys behind a confirm step, and AA contrast across the board in the static states.

The FAIL has four causes:
1. **The HUD does not fit the primary mobile width.** At 375 px the timer is clipped to "0:". At 320 px and at 200% zoom, Pause (the game's core safety habit) is off-screen.
2. **The spec is out of sync with `balance.yaml` v3 on several A1–A9 fixes** that the game designer already accepted: free inline translation, timer freeze, a separate pushers setting, coalesced announcements, and hiding the count from difficulty 3.
3. **The tag toggle, a core GDD mechanic, is not specified at all.**
4. **Three findings each teach the wrong lesson or break WCAG 2.2 AA in the Overwhelmed or debrief paths:**
   - the pressure styling is a meta-tell;
   - the vignette drops contrast below AA;
   - the focus ring and the inspect affordance both use `outline`, so focus can't be seen.

All of these are spec fixes. They are listed under "Conditions for PASS".

**Safety basics in the mock-ups:** 0 requests outside `file:` or `data:` in all 23 page loads. There is no `<form>` and no `<input>`, and the page "Sign in" button is `type="button"`. Domains are `.example`/`.test`, and the number is masked. "Learn more" links are placeholders (`#`). The QR rule (§3.6: encode `/qr/<id>` only) resolves B11, because a real phone scanning it gets a relative, non-routable string. I still recommend that the red-line linter decode the generated QR images and assert this.

---

## Bugs

**U1. The HUD overflows at the primary target; the timer and Pause are lost.** Severity: **blocker**
- Steps: render mock-up 1 full-bleed at 375×812, then 320×568, then 188×406 (375 @ 200%).
- Expected (§1.1, §2.1, §6.1, §6.4): city chip, a 96×36 timer, stress, Pause and menu all fit on one 56 px row from 360 px up. On `xs`, only the stress label collapses. Pause is "always available".
- Actual:
  - At 375 the flex row shrinks the timer pill to 33 px and `overflow:hidden` clips it to "0:". The −2 s chip sits over it.
  - At 320 the HUD content is 349 px wide in a 320 px bar, and Pause is cut off.
  - At 200% zoom the timer, the stress label and Pause are all off-screen.
  - The spec's own budget doesn't fit even at 430 px: chip ~90, timer 96, cost chip ~37, stress ~115, Pause 44, menu 44, plus gaps.
  - Mock-up 1 has no menu button at all, so Help is unreachable there (3.2.6 depends on Help being in a consistent place).
  - Mock-up 2 wraps the HUD to three rows (~140 px) at 375 px. A sticky HUD of that height plus a tray of up to 50dvh leaves very little device area.
- Screens: `01-sms-fullbleed-tray-375.png`, `01-sms-fullbleed-tray-320.png`, `01-sms-fullbleed-tray-zoom200.png`, `02-mail-browser-simulated-login-375x812.png`.
- WCAG: 1.4.10 Reflow and 1.4.4 Resize Text (loss of content).
- Fix:
  - Give the spec a HUD width budget per breakpoint (xs, sm, md) and per text-size setting (100/115/130%). For example, on sm/xs: count only ("4/9"), a timer of at least 64 px that never shrinks (`flex: none`), the cost chip overlaid on the timer, stress as icon + short word, Pause as icon + "Pause", and menu.
  - State a priority order for what moves into the menu first (city name, then the stress segments). Timer, stress word and Pause never leave the HUD.
  - At heights under about 500 CSS px (200% zoom, landscape), HUD and tray stop being sticky, or the tray caps at 40% with the HUD on one row.

**U2. The tag toggle ("Mark as suspicious") is unspecified.** Severity: **major**
- Where: GDD §5 makes it a core mechanic. The GDD hand-off asks `ux-artist` for "device specs for … the tag toggle". `balance.yaml tags` is fully defined. UI_SPEC has no section for it, and neither the lens card (§4.4), the list (§4.5), mock-up 1 nor mock-up 2 shows it.
- Effect: the frontend engineer will invent it. My A5 condition is unresolved: `aria-pressed`, a fixed position after the inspected item, no focus move, and the same control in the lens card and the list.
- Fix: add a §4.x "Tag toggle" covering:
  - a `<button aria-pressed>` labelled "Mark as suspicious", in the lens card under the reveal and in each list row;
  - an icon plus text state ("Marked suspicious");
  - no time cost;
  - activating it never moves focus;
  - a visible marker on the inspected element (an icon plus visually hidden text);
  - a notebook entry;
  - behaviour on genuine messages (allowed, no points, per `legit_tags`);
  - quoted-example inspectables (`context: quoted`, B6), with their visual treatment inside a screenshot or quote.

**U3. Inspect affordance and focus ring are both `outline`, so focus is invisible on inspectables.** Severity: **major**
- Where: §4.3 (affordance = "2 px dashed outline `--color-accent`") vs §10.4 (focus = `outline: var(--focus-ring-w) solid …`).
- Steps: mock-up 2, Tab to the address bar (item 5 in the Tab order).
- Expected: a solid 3 px focus ring plus the dashed affordance.
- Actual: one `outline` overrides the other. The focused address bar shows only the dashed 2 px outline it already had in inspect mode, so focus can't be told from idle. None of the mock-ups uses the focus-ring tokens; every other control falls back to Chromium's default ring.
- WCAG: 2.4.7 Focus Visible. 2.4.13 is AAA, but the tokens aim for it.
- Fix: render the affordance with `box-shadow` or a pseudo-element border, and keep `outline` exclusively for focus. Use the §10.4 ring in the mock-ups.

**U4. The debrief's verdict is outside the focused heading.** Severity: **major** (Aoife)
- Where: §8.1, mock-up 3. Focus lands on `h1` (the tell). The verdict chip "This was a scam" comes before it in the DOM and is not part of it.
- Effect: a screen-reader user hears "The link went to trundle-zoll.example, not Trundle's own site" and reads forward from there. They never hear whether it was a scam or genuine unless they move backwards. On genuine debriefs that is the whole point.
- Fix: put the verdict inside the `h1` ("This was a scam: the link went to …"), with the chip as its visual styling. Alternatively, give focus to a container whose name includes both.

**U5. The fixed debrief footer hides focused controls.** Severity: **major**
- Steps: mock-up 3 at 188×406 (375 @ 200%), Tab through.
- Actual: "Greed", "Small amount", "Social proof", "Check my answer" and "Skip" each receive focus while **entirely** under the 77 px fixed footer. At 375×812 the first source link is partly covered.
- Screen: `03-debrief-zoom200-focus-obscured.png`.
- WCAG: 2.4.11 Focus Not Obscured (Minimum).
- Fix: generalise §1.2's `scroll-padding-bottom` rule to every sticky or fixed bar: the debrief footer, damage control's "Done" sticky bar, and the city chip. Also drop the footer to static below about 500 CSS px of height.

**U6. The Overwhelmed vignette pushes text and borders below AA and covers the HUD and tray.** Severity: **major**
- Where: §6.3, tokens `--color-vignette: rgb(60 20 10 / .38)`, `--z-vignette: 70`, which is above `--z-hud: 60` and `--z-tray: 30`.
- Computed: at the vignette's darkest point, muted text on bg drops from 6.23 to **2.67**, warn text on warn-bg to **2.93**, accent to **2.53**, and button borders to **1.40–1.62**. The Overwhelmed state is exactly when the player most needs to read the tray and find Pause.
- WCAG: 1.4.3 Contrast (Minimum) and 1.4.11 Non-text Contrast.
- Fix: keep the vignette inside the device layer, below the HUD and tray. Cap its strength so every §13 pair stays at or above AA where it overlaps text, and add those blended pairs to §13 and the contrast test. The same check applies to the dark theme.

**U7. Translation conflicts with `balance.yaml` v3 and is bundled into the link card.** Severity: **major** (A7, Yusuf, Aoife)
- Where:
  - §3.2 makes the translation "an inspectable", and §4.1 charges 2 s per first reveal.
  - `balance.yaml` has `translation_cost_seconds: 0`, adds translation to `freeze_while_open`, and the GDD keeps it out of the inspectable minimums.
  - In mock-up 1 the translation appears only **inside the link's lens card**. To understand the message you must inspect the link.
  - The pusher bubble "Letzte Erinnerung. Frist endet in 30 Min." has no translation at all.
- Fix:
  - an inline "Translate" toggle (a disclosure button) under every foreign-language bubble, letter or page block;
  - free, not an inspectable, not counted in "Details you can check (n)", and it freezes the timer while open;
  - the translated text carries `lang="en"`;
  - never placed inside another inspectable's reveal.

**U8. Pushers in Calm mode and screen-reader pacing conflict with `balance.yaml` v3.** Severity: **major** (A2, A3)
- Where:
  - §6.1 and §11: Calm only replaces the timer. There is no separate "Pushy follow-ups" setting, but `balance.yaml pushers.setting: on_off` and "Calm preset = timers off + pushers off" require one.
  - §6.3 "queued so at most one is announced per 15 s" contradicts balance's "coalesced". Pushers fire every 8–12 s, so a queue grows without end. The §11 30 s option makes it worse.
  - The call transcript (`role="log"`, polite), notifications, pushers, timer warnings and stress changes all share the polite channel, and no priority is defined.
- Fix:
  - add "Pushy follow-ups (on/off)" to §11 and to the Calm preset;
  - specify coalescing ("2 more messages from unknown sender"), with the latest text reachable in the thread;
  - give an announcement priority for the polite channel: transcript line > player-caused feedback > timer threshold > stress change > pusher summary;
  - set a maximum queue length of 1 per category, so newer replaces older.

**U9. Timer freeze and the call transcript's pace are unspecified.** Severity: **major** (A1)
- Where:
  - §6 never says when timers stop. Balance v3 freezes them in the pause menu, settings, help, debrief, "take a breath" and translation. The spec should also state the lens card rule: freeze while open, or explicitly not.
  - §3.4 says transcript lines "appear one at a time" with a 30 s beat timer. Who controls the pace is undefined. For Aoife, or Ingrid at 130% text, auto-advancing lines plus a running timer is moving content she can't stop (2.2.2) and a 2.2.1 problem in Standard mode.
  - `default_mode: extended_if: prefers_reduced_motion` from balance is not in §11.
- Fix:
  - copy the freeze list into §6.1;
  - the beat timer starts only after the last transcript line of the beat has appeared, or lines advance on a "Next line" button (Space) when a setting is on;
  - §11 states the default mode and that the choice is offered before the first timed scenario.

**U10. The details count is always shown, against balance v3 and my L6.** Severity: **minor**
- Where: §2.2, §4.5 and the §10.6 label "Details you can check, {n}, {k} checked". `balance.yaml difficulty.list_shows_count` is false from difficulty 3.
- Fix: from difficulty 3, show the label without a count ("Details you can check"), the same for sighted and screen-reader users. Keep "{k} checked".

**U11. The lens sheet on mobile is modal visually but not for the keyboard.** Severity: **minor**
- Steps: mock-up 1, Tab. Pause, Details and all three actions behind the scrim receive focus before the sheet does.
- Where: §10.3 traps focus only for Pause and damage control. §4.4 gives the mobile sheet a scrim.
- Fix: the mobile lens sheet is `aria-modal` with the rest made `inert`. The desktop popover is non-modal (no trap, Esc closes). Say which applies at which breakpoint.

**U12. Accessible names don't start with the visible text.** Severity: **minor** (axe "serious": `label-content-name-mismatch`)
- Where: the §10.6 strings for the address bar ("Web address: {full host}…") and the SIMULATION pill ("Simulation. Nothing you do on this page is sent anywhere. More info", while the visible text is "Simulation · nothing is sent"). axe flags `.addr` and `.simpill` in mock-up 2.
- WCAG: 2.5.3 Label in Name (voice-control users say what they see).
- Fix: start the name with the visible text and put the extra explanation in `aria-describedby`. Example: name "Simulation, nothing is sent", description "This is a training page inside the game…".

**U13. The registrable domain wraps mid-name, so the "owner part" box splits.** Severity: **minor** (learning)
- Steps: mock-up 1 at 375 and 320. The boxed owner part breaks as "trundle-" / "zoll.example", and in the bubble as "trundle" / "-zoll.example".
- Mock-up 2 at 375: the status bar breaks "example-" / "sso.test".
- Effect: the half that lands on the second line looks like the domain ("zoll.example", "sso.test"), which weakens exactly the lesson the anatomy teaches.
- The desktop address bar truncates to "s://desk…" with no "…" marker, against §3.5.
- Fix: the registrable domain is `white-space: nowrap`, and breaks are allowed only at the subdomain/domain/path boundaries. Add a "…" element for left truncation.

**U14. A plain tap on an inspectable shows only a toast; for touch screen-reader users that is a dead button.** Severity: **minor**
- Where: §3.2, §4.2. VoiceOver and TalkBack activate a control with a synthetic click. Outside inspect mode a click shows the toast, and the §10.6 description says "Inspect. Press Enter."
- Fix: keyboard or AT activation (click without a preceding touch pointerdown) opens the lens card. Alternatively, change the description on touch to point to the Details list.

**U15. Mouse hover peek charges the 2 s cost and has unclear 1.4.13 behaviour.** Severity: **minor**
- Where: §4.2. Ingrid moving the mouse across a message pays time for information she didn't ask for. "Moving away closes an unpinned peek after 300 ms" doesn't say whether moving onto the popover keeps it open.
- WCAG: 1.4.13 Content on Hover or Focus (hoverable, dismissible, persistent).
- Fix: charge on pin (click), not on peek. State that the peek stays open while the pointer is over it, and that Esc dismisses it without moving the pointer.

**U16. Small spec/token inconsistencies.** Severity: **minor**
- `--dur-breath: 4000ms` vs §6.4's 2.5 s phases (5 s total).
- §6.3 says the pause button "gains a 2 px outline". Use the U3 rule, so it doesn't collide with focus.
- Mock-ups 1 and 2 use `aria-label` on role-less `<span>`s for the timer and stress. They should demonstrate `role="timer"` and `role="meter"` as specified.
- The mock-up 3 habit card uses `aria-labelledby` on a plain `<div>`.
- In-page form fields are non-focusable `<p>`s, but §10.2 lists "in-page fields' notes" in the Tab order. Say whether the demo note is reachable by keyboard (I suggest one static note under the form rather than per-field taps).

---

## Learning issues (where a player would learn the wrong lesson)

**LI-1. Pressure styling is still a meta-tell (my L1, unresolved in UI).** §6.3 styles "the authored risky action (`pressure_primary: true` or **first `comply` action**)". `balance.yaml` forbids comply on legit_low, and approve prompts are fraud-only. So in Tense the bright button appears almost only on scams. Tomasz will learn "orange button = scam" (see `01-sms-fullbleed-tray-375.png`). The once-per-game note "Scam pages do that" confirms the meta-tell instead of correcting it.
- Fix:
  - in Tense, style the message's requested action whatever the truth (on genuine messages, the `proceed` or in-message action);
  - make `pressure_primary` required on every scenario with an in-message request, with a validator rule;
  - reword the note: "When you're stressed, the button you're being pushed toward looks brighter. The game did that to show you how pressure feels."

**LI-2. "Not checked" for a red flag that can't be inspected.** Mock-up 3 marks "A tiny fee plus a same-day deadline" as "Not checked". That flag sits in the message text, not in the Details list, so there was nothing to check. The player is graded on something they couldn't do.
- Fix: the checked/not-checked status applies only to flags bound to inspectables. Content flags show "In the message" with no status, or link to the pressure quiz.

**LI-3. Sender name as proof (my L3).** The mock-up 3 flag "It came from an ordinary mobile number, not from Trundle's usual sender name" implies that the right sender name means safe. Berlin 1-7 later puts a fake message in the genuine sender thread.
- Fix: add "(and even the right name can be faked)", or name the content rule in §8.

**LI-4. Points are still prominent (my S1).** §8.2 and mock-up 3 show "Points +19" at 22 px bold next to the stars. Balance v3 says "Points and rating live behind 'Details'".
- Fix: move points inside the "How?" disclosure.

**LI-5. "Already clicked" step "Report it." is not actionable.** Red Line 4 needs a response the player can actually follow. This is content, not UI. Flag it to the game designer and fraud researcher: "Report it to …" with the generic real-world channel shown in "Where to report".

---

## Fun issues (where attention drops)

**FI-1. The debrief is about 5.5 screens on a phone (my F2, unresolved).** Mock-up 3 is 2,093 px tall at 375×812 and 2,374 px at 320. It has eight sections after every 1–3 min scenario, and Lena will tap Continue without reading. The spec has no two-layer structure.
- Fix:
  - layer 1 (≤ 40 words, one screen at 375×812): verdict + tell, your choice + stars, one "Already clicked?" line, Continue;
  - layer 2 ("More"): flags list, habit card, quiz, sources, points.
- The Red Line 4 elements must stay in layer 1.

**FI-2. No UI for the half-day stop (balance `half_day_split`, my F3).** Specify the stop screen and the progress indicator ("3 messages left this morning"). This can be a short §9.4.

**FI-3. Positive:** the mail + browser layout at 1440 is excellent for Marco. The action "Type desk.waymarker-network.example yourself" teaches the habit in its own label.

---

## Accessibility: status of my earlier A1–A9

| ID | Earlier finding | Status in T-1.6 | What remains |
|---|---|---|---|
| A1 | Timing choice before 0-4; freeze; call beat | **Partial.** The choice is at first launch (§11) and the call beat is 30 s in balance. | Freeze list and default mode missing from spec; transcript pace undefined (U9) |
| A2 | Calm must remove pushers | **Not resolved in spec** (balance has it) | U8 |
| A3 | Live-region coalescing | **Not resolved.** The queue still grows; no priority. | U8 |
| A4 | `I` shortcut conflict | **Resolved for 2.1.4.** Shortcuts can be turned off and are offered at first launch; inspectables are native buttons; the list is the screen-reader path; keys are inactive in dialogs. | Recommended: say that shortcuts are ignored unless focus is inside `<main>` or the HUD; define where focus goes for the `1–5` confirm step; sync GDD §5 ("press `I`" opens the list, not the magnifier) |
| A5 | Stable focus/order under stress | **Partial.** No reorder, no focus steal, "Take a breath" is non-modal. | Tag toggle undefined (U2); lens sheet focus containment (U11) |
| A6 | Letters/cards/QR/screenshots as text | **Mostly resolved.** Letters are real text; QR has a screen-reader description. | Quoted screenshots (1-3) and quoted inspectables not specified (part of U2) |
| A7 | `lang` + free inline translation | **Partial.** `lang` is set. | Translation costs time and is bundled into the link card (U7) |
| A8 | Stress as text, audio off | **Resolved** (§6.2, §6.3, §3.4) | Mock-ups should show `role="meter"` (U16) |
| A9 | Programmatic training-page label | **Resolved** (§5.2, §5.3, §10.6) | Label in Name fix (U12) |

### WCAG 2.2 AA judgement per element

| Element | Result | Notes |
|---|---|---|
| Magnifier | Fail as specified | U3 (2.4.7), U13 (learning), U14, U15 (1.4.13). Otherwise good: 2.5.1 single-pointer alternative, list parity, mono identifiers, anatomy not by colour. |
| Tagging toggle | Not specified | U2 |
| Timer | Fail at 320–430 px | U1 (1.4.10/1.4.4), U9 (2.2.1/2.2.2). Good: `role="timer" aria-live="off"`, threshold announcements, warning by text + stripe + colour, no blinking. |
| Stress meter | Pass (spec) | `role="meter"` + value text + icon + segment count. The Overwhelmed vignette fails 1.4.3/1.4.11 (U6). |
| SIMULATION marker | Pass with minor fix | 9.54:1, sticky, survives screenshots (`02-…-1440x900.png`), region and group labels. 2.5.3 name mismatch (U12). |
| Debrief | Fail | U4 (verdict not in heading), U5 (2.4.11), FI-1 length. Good: heading structure, text-labelled statuses, `aria-pressed` quiz chips, "opens outside the game", dark-mode contrast holds (`03-debrief-1440x900-dark.png`). |

### Other checks
- **axe-core:** 0 violations on mock-ups 1 and 3 at 375 and 1440, light and dark. Mock-up 2 has 2 × `label-content-name-mismatch` (U12). axe can't see the U3–U6 problems in static mock-ups; those came from the keyboard pass and the contrast maths.
- **320 px reflow:** no page-level horizontal scroll in any mock-up. The HUD clips content inside its own box (U1).
- **200% zoom:** the debrief scrolls horizontally at 188 px (212 px content, from the mono `h1` domain). That isn't required by 1.4.10, which is measured at 320, but it is avoidable with U13's break rule.
- **Reduced motion:** the token collapse is correct, and long-press and hover dwell are rightly not collapsed. The §6.5 inventory is complete. The breathing text alternates every 2.5 s inside the dialog; make sure it is not a live region.

---

## Persona notes

| Persona | Result |
|---|---|
| Lena (375 phone) | Can't read the timer (U1). Learns "orange = scam" (LI-1). Debrief too long (FI-1). |
| Marco (desktop) | Mock-up 2 is clear and fast. No issues beyond U3. |
| Ingrid | The fake fields look exactly like real inputs. The demo note helps, but with U16 only one field shows it. Hover peek charges her time (U15). The vignette lowers contrast when she's stressed (U6). |
| Tomasz | Will find the pressure-style meta-tell within 2–3 scenarios (LI-1). |
| Aoife (keyboard + screen reader) | Skip link, Tab order (§10.2), native inspect buttons and the list path are good. Blocked or hindered by U2, U3, U4, U7, U8, U9 and U11. |
| Yusuf | Must inspect the link to read the German SMS, which costs 2 s. The follow-up is never translated (U7). |

---

## Conditions for PASS (all required)

1. **U1:** a HUD width budget per breakpoint and per text size, with a minimum timer width and a never-hidden Pause, timer and stress word. A priority order for collapsing into the menu, and the menu/Help always present. Sticky behaviour relaxed at short viewport heights. The mock-up must show Pause and a readable timer at 320, 375 and 188 (200%).
2. **U2:** a tag-toggle section (control, states, placement in card and list, focus behaviour, notebook, genuine and quoted cases).
3. **U3:** the inspect affordance must not use `outline`. Mock-ups use the §10.4 focus ring.
4. **U4:** the verdict is part of the focused debrief heading.
5. **U5:** a scroll-padding rule for every fixed or sticky bar, including the debrief footer and damage control.
6. **U6:** the vignette stays below the HUD and tray, its strength is capped so the §13 pairs hold, and the blended pairs are added to §13.
7. **U7:** a free inline Translate toggle per foreign block, outside the inspectables and the count, which freezes the timer.
8. **U8:** a "Pushy follow-ups" setting in §11 and the Calm preset, coalesced announcements, and polite-channel priorities.
9. **U9:** the timer freeze list and default mode in the spec, and a transcript pacing rule (timer starts after the last line, or player-advanced lines).
10. **U10:** the count is hidden from difficulty 3, with parity for sighted and screen-reader users.
11. **LI-1:** pressure styling applies to the requested action whatever the truth, and the debrief note is reworded.
12. **FI-1:** a two-layer debrief with a one-screen first layer that carries the Red Line 4 elements. Points move behind "How?" (LI-4).

Recommended (not required for PASS): U11–U16, LI-2, LI-3, LI-5 (route to content), FI-2, the A4 notes above, and a red-line linter step that decodes generated QR images.

Once the build exists I will re-run this with real timers, live regions and shortcuts. That run will include NVDA-style browse/focus mode checks for `I`, a keyboard-only Playwright play-through with shortcuts off, and network and CSP inspection.

---

## Re-check v2 (UI_SPEC v2 "rework 1", tokens and mock-ups re-rendered), 2026-11-18

**Method:** I repeated the first review's runs on the v2 files:
- the same viewports: 375×812, 1440×900, 320×568, and 200% zoom at 188×406 and 720×450, with reduced motion emulated and dark mode for the debrief;
- axe-core 4.x on WCAG 2.0/2.1/2.2 A+AA plus best-practice;
- a full keyboard Tab pass with checks for focus hidden behind fixed or sticky bars;
- HUD measurements at 430, 375, 360, 320 and 188 px, plus 130% root text at 360 and 375;
- the vignette contrast recomputed from the tokens;
- a network log.

Screenshots are the `docs/qa/screens/v2-*.png` files (e.g. `v2-01-sms-magnifier-375x812.png`, `v2-01-sms-magnifier-zoom200-mobile.png`, `v2-01-sms-zoom200-viewport.png`, `v2-02-mail-browser-simulated-login-375x812.png`, `v2-03-debrief-layer1-375.png`, `v2-03-debrief-layer2-375.png`, `v2-01-checkable-focus.png`).

**Results across all three mock-ups:**
- axe: **0 violations** in all mock-ups at 375 and 1440, light and dark. The two U12 name mismatches are gone.
- Network: 0 requests outside `file:`/`data:` in 23 page loads. Still no `<form>` or `<input>`.

### Verdict: PASS

All 12 conditions are met. As the coordinator instructed, I did not judge the "(n)" count in slots 0–1. The spec's slot-based rule (§4.6) is consistent with that change either way.

| # | Condition | Result | Evidence |
|---|---|---|---|
| 1 | U1: HUD budget | **Met** | §2.1 has a budget table, a collapse order, and timer, stress word, Pause and menu that never leave. Measured: no HUD overflow at 430, 375, 360, 320 or 188, or at 130% text. The timer is 69 px with `flex:none` and the cost chip overlaps it. At 188 the HUD becomes two rows (75 px) with timer, Tense, Pause and menu all visible. Menu present (Help, 3.2.6). |
| 2 | U2: tag toggle | **Met** | §4.7 covers `aria-pressed`, card and list placement in DOM order, no cost, no focus move, genuine, quoted and drill cases, and notebook entries only after the debrief. Shown in mock-ups 1 and 2. |
| 3 | U3: affordance vs focus | **Met** | §4.3: `outline` is for focus only. Measured on a focused checkable in Check mode: solid 3 px outline at a 6 px offset plus a 2 px dashed `::after`, both visible (`v2-01-checkable-focus.png`). |
| 4 | U4: verdict in heading | **Met** | `h1` = "This was a scam: the link went to trundle-zoll.example, not trundle.example." |
| 5 | U5: focus not obscured | **Met** | §1.3 adds measured scroll-padding to every bar, and bars go static under 500 px of height. Full Tab pass of the debrief with layer 2 open at 375×812, 188×406 and 1440: no focused element hidden. At 188 the footer is static. |
| 6 | U6: vignette | **Met** | The vignette sits inside the device layer (`--z-vignette: 5`, below the tray and HUD) and is capped at alpha 0.12. I independently recomputed the §13.4 values (5.99, 4.79, 3.55, 3.46) and they match. |
| 7 | U7: translation | **Met** | §4.8: an inline free toggle that freezes the timer, is not a checkable and is never in the card. Mock-up 1 has a Translate toggle under both German bubbles, including the follow-up. |
| 8 | U8: pushers and announcements | **Met** | Pushy follow-ups setting and Calm preset (§11). §10.5 has a priority queue, one pending item per category, a newer item replacing the older, coalescing, and no pushers when the setting is off. |
| 9 | U9: freeze, default mode, call pacing | **Met** | §6.1 freeze list and paused indicator. Extended is pre-selected under reduced motion. §3.4: the beat timer starts after the last line, and Step-through mode advances line by line. |
| 10 | U10: count | **Met** (per coordinator) | §4.6 ties the count to the chapter slot, the same for sighted and screen-reader users. |
| 11 | LI-1: pressure style | **Met** | §6.3: `pressure_target` is required on every scenario that asks for something, genuine or fraud. There is no class fallback, styling follows stress only, and the debrief callout is reworded, including the genuine-message case. |
| 12 | FI-1: two-layer debrief | **Met** | Layer 1 is 35 words and fits one screen at 375×812 ("More" ends at y=352, footer starts at 735). Points are in layer 2. The "See what to do" link opens the closed `<details>` (verified). |

Also resolved: U11 (the mobile sheet makes the rest `inert`; the Tab pass stays inside the sheet), U12, U13 (the host breaks only at boundaries, the owner part is `nowrap` and scrolls inside its box at 188, the address bar truncates with "…"), U14, U15 (hover reveals nothing and is free), U16 (`--dur-breath` 2500 ms, `role="timer"` and `role="meter"` in the mock-ups, habit card `<section>`, a single static demo note), LI-2, LI-3, LI-4 and FI-2. LI-5 is routed to content.

### Remaining notes (minor, non-blocking)
- **N1. The tag toggle has a double state and a name mismatch.** The mock-ups change the label ("Mark as suspicious" → "Marked suspicious") *and* set `aria-pressed`, so a screen reader says "Marked suspicious, toggle button, pressed". §10.7's name "Mark {element} as suspicious" also doesn't contain the visible text as one string (2.5.3).
  - Fix: keep the visible label constant ("Mark as suspicious") with `aria-pressed`, and show the state by icon fill or a badge. Give the element context through `aria-describedby`, not the name.
- **N2. Malformed HTML in mock-up 1.** It opens `<div class="screen chkmode">` twice (lines 100–101).
- **N3. Layer 1's recovery line is only a pointer.** "Already clicked or paid? See what to do in More" works, and the link opens layer 2. A first step in the line itself would be stronger for Lena: "Paid? Block your card in your banking app first."
- **N4. Horizontal overflow at 188 px (375 @ 200%).** The debrief (205 px) and mock-up 2 (190 px) still scroll sideways. A `span.owner` in the layer-2 flag text and the status line don't use the §1.5 in-box scroll rule. This is not a 1.4.10 failure, since 320 px reflows cleanly.
- **Design note, no change needed.** The timer keeps running while a Check card is open (§4.1). That is a reasonable call because Extended and Off modes exist. I'll watch it with Ingrid and Aoife in the first build playtest.

Build-time re-test still pending: live timers, the announcement queue, shortcuts, NVDA browse/focus mode, CSP and QR decoding.
