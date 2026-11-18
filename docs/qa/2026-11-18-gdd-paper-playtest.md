# QA paper playtest: GDD, learning objectives and balance (chapters 0 and 1)

**Agent:** qa-playtester · **Date:** 2026-11-18 · **Scope:** `docs/GDD.md` (draft for G1), `docs/LEARNING_OBJECTIVES.md`, `content/balance.yaml` v2, read against `CLAUDE.md` and `docs/PERSONAS.md`.
**Method:** Paper playtest. There is no build, so there are no screenshots, no axe-core run, no keyboard pass and no network inspection. I walked chapter 0 (Home tutorial) and chapter 1 (Berlin) beat by beat as each of the 6 personas. I re-computed the §7.1 strategy table from `balance.yaml`, then checked the accessibility constraints against WCAG 2.2 AA.
**Screenshot paths:** none (paper playtest). Every bug below cites the GDD or balance line instead.

## Verdict: FAIL

The design is strong. The pillars, the genuine-twin mix, calm mode, the no-score-from-timer rule, the faceless scammers, the "deadline was fake" line and the no-shame recovery are the right calls. The FAIL has three causes:

1. **The rules contradict each other**, so the Berlin boss's taught habit (LO-08, hang up then call back) cannot be reached as written.
2. **Several scoring and presentation details teach the wrong lesson**: verdict leaks through button style, timers and pushers; stars and points disagree; delivery checks are penalised in the delivery chapter.
3. **The accessibility constraints are not enough for Aoife**: timing setup, the single-key shortcut, image-only letters and QR cards, the live-region rate, and focus stability under stress.

All of these are document fixes. The "Conditions for PASS" section at the end lists them.

---

## Bugs (design defects in the spec)

**B1. `hang_up` is terminal, so "hang up, then call back" can never happen.** Severity: **blocker**
- Where: `balance.yaml` `multi_step.terminal_classes: [verify, report, dismiss, comply, proceed]`; `action_kinds.hang_up: class dismiss`; `multi_step.hang_up_then_call_back`; GDD §6 "Decisive action … the first action of class … dismiss"; GDD §17 boss note.
- Steps: Berlin boss 1-8, call beat. The player picks "Hang up" (`hang_up`, class dismiss).
- Expected: the dialler stays available, the player calls PaketPilot on the number from the app, and the scenario scores as verify (+15 × 1.5). LO-08 is demonstrated.
- Actual (per the rules): dismiss is terminal, so the scenario ends on `hang_up` with +8 × 1.5. The `call_back_known` follow-up is unreachable, and LO-08 can never be demonstrated in Berlin, Madrid or Rome.
- The same contradiction affects `verify_then_follow_up`. Verify is terminal, yet the rule describes a follow-up that can replace the verify score.
- Fix: separate "scoring-decisive" from "ends the scenario". For example, `hang_up` opens a short "What now?" beat (dialler, report, done), and the decisive score is computed when the scenario closes.

**B2. A boss can end at beat 1, so the best players never see the boss.** Severity: **major**
- Where: GDD §4 Boss (3–5 beats), §6 "Decisive action", §17 1-8.
- Steps: 1-8 beat 1 (fake SMS). The player picks "Ignore" or "Check in the PaketPilot app".
- Expected: the scam escalates across channels whatever the player did (email invoice, then a call), because real campaigns do. Jonas's interrupt plays.
- Actual: the decisive action at beat 1 ends the scenario. Skilled players get a 20-second boss, and only players who engage see the email, the call and Jonas. This punishes good play with less content and less fun, and it hides the multi-channel lesson.
- Fix: for `role: boss`, drive beats from the scammer side (the next beat arrives on a schedule or trigger). Define boss scoring explicitly, for example "the lowest decisive class across beats" or "per-beat decisive actions averaged, then × 1.5", and update the §7.1 max.

**B3. Stars and points disagree.** Severity: **major** (scoring legibility for a 16-year-old)
- Where: `balance.yaml` `scoring.matrix` vs `stars`.
- Cases:
  - `comply` on legit_low: **+10 points, 0 stars** (no star rule covers it).
  - `engage` on legit_high: **+4 points, 0 stars**. Example: tapping the tracking link in the genuine shop email 1-5.
  - `engage` on legit_low (+8) **outscores** `verify` on legit_low (+6), and both get 2 stars. "Tap the link in the message" beats "open the app yourself".
  - `verify` on legit_high (+12) outscores `proceed` (+10), and both get 3 stars. So in 0-3 ("you started it, go ahead") the points say double-checking was better than going ahead.
- Expected: stars and points rank the same choices in the same order.
- Fix: derive stars from the matrix (score bands), or add the missing star rules and make the matrix monotonic with them. Set verify = proceed on legit_high, or explain in the debrief why verify scores more.

**B4. Scenario 1-5 is labelled high stakes but asks for nothing.** Severity: **minor**
- Where: GDD §7 defines high stakes as "asks for money, data, code, approval". §17 1-5 is "Order shipped … tracking also in your account", marked `legit / high`.
- Effect: the calibration lesson (LO-17: "verify when a message asks for something") is contradicted by the content. The §7.1 maximum (14 for 1-5) and the gold maths depend on this label.
- Fix: relabel 1-5 as low stakes and re-run §7.1, or rewrite 1-5 so it does ask for something (e.g. "confirm delivery slot / pay balance on delivery").

**B5. Scenario 1-3 breaks the authoring rule.** Severity: **minor**
- Where: §6 says "every scenario offers at least one verify action and at least one tempting wrong action". §17 1-3 offers only `proceed` and `report` (−4). Reporting Grandpa Teo is not tempting.
- §7.1's "Inspect-all + tag-all + always verify" row (122.5) assumes a verify on 1-3, which doesn't exist. Its "2 low-stakes verifies" therefore can't both happen in Berlin.
- Fix: either exempt `role: drill`-like "lesson" scenarios from the rule (and mark 1-3 so), or add a real choice (e.g. "Forward the screenshot to your group chat as a warning" vs "Save the tip"). Then recompute the table.

**B6. Tagging is undefined for a genuine message that contains a scam (Teo's screenshot in 1-3).** Severity: **major**
- Steps: 1-3. The player inspects the sender and link inside Teo's screenshot of a fake customs text, then marks them suspicious.
- Expected: the player is rewarded for spotting the red flags Teo describes.
- Actual (per the rules): 1-3 is genuine, so every inspectable is reassuring and `legit_apply: always` gives −1 per tag. The player is punished for the exact behaviour the scenario models.
- Fix: add a schema notion of "embedded example" inspectables (e.g. `context: quoted`) that score as red flags without changing the message truth. Or make the screenshot non-inspectable and have Teo narrate it.

**B7. Pause can be spammed for free points, so a blind strategy reaches silver.** Severity: **major** (balance)
- Where: `pause_bonus` +2 per scenario with ≥1 lever and a safe final class, mode-independent, no stress threshold. Pause is "always available".
- Recomputed for Berlin: Blind always-verify = 106.5. Add "press Pause first" on the 5 fraud scenarios (each has an urgency lever): +2 × 4 + 2 (or 3 if the ×1.5 boss multiplier applies) = +10 to +11, giving **116.5–117.5 / 149.5 = 78%, SILVER** with 0 genuine reports.
- This contradicts §7.1: "no single button-mashing strategy reaches silver".
- Fix (any one):
  - require stress ≥ tense for the bonus;
  - require the pause to happen before the first inspection/action and only when a pusher or timer is active;
  - count the pause bonus only toward stars and LO-04, not points/rating.
- Then add a "Pause + X" row to every strategy table.

**B8. Recovery step categories are global, but which step is "stop" depends on the scam.** Severity: **major** (breaks LO-16 in the tutorial boss)
- Where: §9 lists "change the password" under `secure`. §16 0-6 boss failure (credential phishing) lists "change password, turn on MFA, tell IT". LO-16 requires the first chosen step to be category `stop`.
- Effect: after credential theft, changing the password **is** the stop step. With global categories, 0-6 has no `stop` step, so LO-16 can't be demonstrated. Worse, the feedback would tell the player "stop the damage first" while marking "change password first" as not-stop.
- Fix: put the category on the outcome's step reference (per scenario), not on the global step in `recovery_steps.yaml`.

**B9. Behaviour of genuine messages in a boss is unspecified (Jonas's interrupt).** Severity: **minor**
- Where: §17 1-8 and CR-06 `interrupts[]` (`is_fraud`).
- Open questions: does the player act on Jonas's message? Is reporting it a "genuine message reported" for stamps? Does it count in the legit share?
- Fix: specify the interrupt's actions, whether it is scored and whether it counts in calibration.

**B10. Stars and the LO-16 order rule contradict each other in the recovery copy.** Severity: **minor**
- `order_scored: false`, but LO-16 is demonstrated only if the **first** step is `stop`. A 16-year-old will read "order doesn't matter" and then lose the habit card.
- Also, `pick_up_to: 4` but `max_points: 9` (3 steps). The fourth correct pick earns nothing, and the player isn't told why.
- Fix: say in the UI "Pick the step you'd do first, then up to 3 more". Either drop the cap or pick 3.

**B11. A QR code in the game could be scanned with a real phone.** Severity: **major** (Red Line 3 implementation risk; spec gap)
- Where: §5 `qr` device; 1-6 delivery card.
- A rendered, scannable QR on screen can be scanned by the player's real phone camera. `/qr/<id>` is relative. Its encoded payload must not resolve anywhere outside the game.
- Fix: specify that QR images are either deliberately non-decodable (stylised) or encode only an absolute in-game URL on the game's own origin, or a non-routable `.invalid` text string. Add a red-line linter check.

**B12. Arc slot 1 has no debrief.** Severity: **minor** (Red Line 4)
- §10.2 gives debriefs only to scored arc beats (slot ≥ 2). The Berlin arc beat (slot 1) is unscored and has none specified. Red Line 4: "Every scenario ends with a debrief."
- Fix: give slot 1 a minimal debrief ("Nothing wrong here. Friendly people are normal. Habit: keep chats on the app you met on until you know someone"). Also specify what happens if the player picks "Close the app" (does the arc end, pause or continue?).

---

## Learning issues (where a player would learn the wrong lesson)

**L1. Meta-tells leak the verdict (Lena, Tomasz).** Players learn the game's tells instead of the scam's.
- **Button style:** in Tense, "the risky action gets the bright primary button style" (§8). If only fraud scenarios have a "risky action", a bright button means scam. Tomasz will find this by scenario 3.
- **Timers:** in chapter 0, timers appear only on fraud (0-4, 0-6). In Berlin, every timed scenario except 1-5 is fraud. Lesson learned: "a countdown = scam".
- **Pushers:** if only fraud has pushers, a pusher means scam.
- Fix: apply styling to the message's requested action regardless of truth. Give genuine twins real, honest deadlines (e.g. "Locker holds your parcel for 7 days", a 60 s timer and a friendly reminder from Jonas). Add a content-validation rule that legit scenarios carry levers and timers at a rate within ±15 percentage points of fraud scenarios in the same chapter.

**L2. Berlin penalises the habit Berlin teaches.** Chapter goal (§17): "check deliveries in the official app you open yourself." Yet opening the PaketPilot app for the genuine 1-1 locker SMS scores +6 and 2 stars instead of +10, and a second such check blocks gold. Ingrid, careful and rule-following, will check every delivery SMS in the app and be told she is "not calibrated". That's the correct real-world behaviour.
- Fix (any one):
  - make `verify_in_app` on legit_low score at least as well as `proceed` when the chapter's `lo_focus` includes LO-03;
  - drop `max_verify_on_legit_low` from gold;
  - frame the debrief as "Good habit. This one asked for nothing, so it was optional", with no points penalty.
- Keep the over-**report** penalty. That one teaches the right thing.

**L3. "The sender looked right, so it's safe" (1-1 → 1-7).** 1-1 teaches the courier short code as the *reassuring* detail. 1-7 then puts a fake SMS in that same genuine thread. If 1-1's debrief says "it came from the short code, so it's genuine", 1-7 feels like a trick, and the player learns that sender checks are worthless.
- Fix: a GDD rule that reassuring details are never presented as proof. Genuine debriefs say why it was safe to act: "It asked for nothing and matched an order you placed. The short code fits, but senders can be faked; see 1-7."

**L4. Reset links you asked for (0-3).** The natural action is "open the reset link", which is `open_link`, class engage (+4 on legit_high, 0 stars per B3). Authors could label it `proceed`, but the GDD gives no rule. Players may learn "never tap any link, even one you requested". That is paranoia, against Pillar 2.
- Fix: a kind rule for "expected message the player initiated: the in-message action is `proceed`", stated in §6 next to the existing approve-prompt rule.

**L5. Magnifier skill vs. real-world skill (Ingrid, Lena).** The magnifier "reveals the real address" in one tap. Real phones don't. You tap the sender name, long-press a link or expand the header. Players may master the game and still not know the gesture.
- Fix: the debrief's red-flag line includes the real-device way to check ("On most phones: press and hold the link to preview it").

**L6. The inspectables list hints at the answer.** "Details you can check (3)" tells every player how many things matter and where they are. It's fine at difficulty 1–2. By difficulty 4–5 it's a hint real life never gives.
- Fix: from difficulty 3, the list includes non-inspectable-but-checkable neutral elements, or does not show a count. This must be equal for list and pointer users. Do not give screen-reader users more hints than others.

**L7. Spelling mistakes as red flags.** §2 and §15 say typos are "never the **main** tell". That still lets authors use typos as a scored secondary red flag, and at difficulty 1 ("2-3 obvious") they will. Yusuf, who writes in second-language English, would learn that imperfect English signals a scammer.
- Fix: typos, grammar and foreign phrasing may only ever be a **decoy** (tagging costs −1). Add a content-validator rule (no inspectable with `red_flag: true` of type `spelling|grammar|language`).

**L8. Arc timeline vs. friendliness.** All endings show "You could have noticed it here" for **every** beat (§10.3). Slot 1 is a friendly hello with no warning sign. A 14-year-old should not learn that a friendly stranger is a red flag.
- Fix: slot 1 shows "Nothing to notice yet. Being friendly isn't a warning sign."

**L9. Pause costs time, but the lesson says the deadline is fake.** Pausing costs 5 s of timer in Standard mode, while the debrief says the deadline was fake. This is a mild mixed message. It's acceptable if the pause screen itself says "Real deadlines from real companies give you days, not seconds".

---

## Fun issues (where attention drops)

**F1. Berlin repeats the same theme.** 6 of 9 scored items are about parcels (1-1, 1-2, 1-4, 1-6, 1-7, boss), and 1-3 is a parcel screenshot. Lena tunes out by 1-6; Marco by 1-4.
- Fix: keep the pattern but vary the surface. 1-5 already helps. Make one genuine scenario non-delivery (Jonas asking you to water plants; an Agency schedule change), and order them so no two parcel SMS are adjacent.

**F2. Debriefs are long after every 1–3 min scenario.** Each debrief has up to 9 parts: verdict, flags with right/wrong, habit, habit card, "Already clicked?", sources, stars, points, and the optional pressure quiz. There is no length cap. For Lena (low patience for text) this is where attention dies.
- Fix: a two-layer debrief. Layer 1 (≤ 40 words, always shown) has the verdict, the one tell, the habit and stars. Layer 2 ("More") has the rest. Red Line 4 content stays on layer 1: red flag, verification step, and a one-line "Already clicked?".

**F3. Session length is unrealistic on a phone.** My per-scenario estimate:
- read 20–40 s, inspect and tag 15–30 s, decide 5–15 s, consequence ≤ 15 s, debrief 30–60 s: **1.5–2.5 min** per standard scenario;
- boss 3–5 min, arc 0.5–1 min, intro plus chapter end about 1.5 min.

| Chapter | Estimate | Target |
|---|---|---|
| Berlin | **17–26 min** | 10–15 min |
| Tutorial (with mode setup and coach marks) | **12–16 min** | 8–12 min |

Lena's break between classes is 5–10 min. Saving per scenario is good, but she'll quit mid-chapter.
- Fix: split each chapter into two "half-days" with a natural stop and progress indicator ("3 messages left today"), and specify that stress resets to a fixed value on resume. Re-baseline the targets after the vertical slice.

**F4. The tutorial is heavy.** Six minutes of real play introduces the magnifier, tagging, 6 action classes, report cost, timer, pusher, stress meter, pause, debrief, stars, points, recovery, habit cards and a multi-beat boss. Coach marks cover only the first two scenarios.
- Fix: one new mechanic per scenario, each with a coach mark: 0-1 magnifier, 0-2 tag, 0-3 genuine/proceed, 0-4 timer and pause, 0-5 recovery, 0-6 combine. Explain stars only, not points (see S1). Let Marco skip coach marks.

**F5. Persona relevance comes late.** Marco's pattern (CEO/invoice) arrives in chapter 3, about 45 min in. Tomasz's marketplace pattern is chapter 5. Yusuf's job, rental and official-letter scams are in chapter 7 or not mapped (G1-Q5). With linear order (G1-Q6), these adults may drop out before their content. I recommend answering G1-Q6 with a free city choice after Berlin.

**F6. The hidden arc is good.** Tomasz will deliberately play along with Alex to see what happens, and the silent banking supports that. The "Tell me now" option in the pause menu sits next to normal pause controls and is easy to hit by accident, which spoils the arc. Put it behind a confirm.

---

## Scoring legibility for a 16-year-old (Lena)

**S1. There are too many numbers.** Lena sees points, stars, a trust rating % and a stamp tier, plus hidden arc points. Stamps are gated on "calibration" counts, and the score includes a clamp, a ×1.5 multiplier and a pause bonus. She will understand stars and stamps. She will not understand why a 3-star run is "silver" (the gold calibration rule), or why verifying something got fewer points than tapping a link (B3).
- Fix: show stars per scenario and the stamp per chapter. Points become secondary, behind "Details". The stamp screen explains in one sentence: "Gold = you checked when it mattered and didn't report genuine messages."

**S2. "Trust rating" reads backwards.** In a scam game, "Trust rating 29%" reads as "you didn't trust enough". Rename it to something like "Inspector rating" or "Judgement".

**S3. Jargon.** "Calibration", "low-stakes", "decoy" and "reassuring detail" appear in player-facing copy (§4 calibration summary). These are above B1 for Yusuf. Use: "Genuine messages you reported: 0 · Harmless messages you double-checked: 1".

---

## Persona walkthrough summary

| Persona | Understands what to do? | Fun / attention | Right lesson? | Main blockers |
|---|---|---|---|---|
| Lena 16 | Yes for actions. The magnifier only with coach marks. Skips tagging. | Drops at long debriefs and repeated parcel SMS. Session too long for a class break. | Risk of meta-tells (L1) and "timer = scam". | F2, F3, L1, S1 |
| Marco 38 | Yes, fast. | Bored by the tutorial pace; his content comes late. | Fine. | F4 (skip), F5 |
| Ingrid 71 | Mostly. "Magnifier" may read as *zoom text* (a common accessibility meaning). | Fine with Calm/Extended if offered up front. 20 s call beat too short in Standard. | Penalised for checking deliveries in the app (L2). | L2, A1, rename magnifier to "Check" or "Inspect" |
| Tomasz 27 | Yes. Will min-max. | Enjoys the arc. Will find the pause-spam (B7) and button-style tells (L1). | Learns the game's tells unless L1 is fixed. | B7, L1 |
| Aoife 45 | Only if A1–A9 are fixed. | The pusher queue in the screen reader will be noisy. | Equal, if L6 parity holds. | A1–A9 |
| Yusuf 30 | Yes, at B1. German SMS needs translation (which currently costs timer). | Fine. | Risk of "imperfect language = scam" (L7). | L7, A6, S3 |

---

## Accessibility issues (WCAG 2.2 AA)

**A1. Timing modes (2.2.1 Timing Adjustable).** "Changeable at any time" is good, but:
- Extended ×2 does not meet the "adjust" option (needs ≥ 10×). Only Calm (turn off) satisfies 2.2.1, so the player must be **offered the choice before the first timed scenario (0-4)**, ideally in onboarding. Default to Extended if the OS reports a screen reader or reduced motion is on.
- `call_beat: 20` s for a transcript is unworkable for screen-reader users in Standard.
- Specify that all timers freeze while the pause menu, settings, help, debriefs or the "Take a breath" prompt are open.

**A2. The pusher and stress effects aren't covered by 2.2.2 Pause, Stop, Hide.** Pusher messages are auto-updating content. Their interval comes from the stress state, not the timer mode, so Calm mode still gets pushers every 8–12 s.
- Fix: Calm mode also disables pushers and stress escalation, or add a separate "No pushy follow-ups" setting.

**A3. Live-region rate mismatch (4.1.3 Status Messages).** Pushers fire every 12 s (Tense) and 8 s (Overwhelmed), but screen-reader announcements are throttled to one per 15 s. Undefined queue behaviour means either a growing backlog or dropped content.
- Fix: coalesce ("2 more messages from unknown sender"). Never announce timer ticks; announce only at fixed points (e.g. half time, 10 s). Specify an in-text timer readout the user can query.

**A4. Single-key shortcut `I` (2.1.4 Character Key Shortcuts).** `I` conflicts with screen-reader browse-mode quick keys (NVDA and JAWS use `i` for list item), and the spec gives no way to turn it off or remap it. Keyboard behaviour after pressing `I` (which element gets inspected?) is also undefined.
- Fix: each inspectable is a native button ("Check sender") in DOM order, the list alternative is the primary keyboard path, and `I` is optional, remappable or off, active only when focus is in the game region.

**A5. Focus and order under stress (2.4.3 Focus Order, 3.2.1/3.2.2 On Focus/On Input).** The Tense state restyles the "risky action" as primary. Also:
- the "Mark as suspicious" toggle appears after inspecting;
- the "Take a breath" prompt appears in Overwhelmed.

None of these may move focus, reorder buttons or change positions; otherwise keyboard users pressing Enter, and one-handed mobile users like Lena, can hit "Pay" by accident.
- Fix: specify stable action order and position for the whole scenario. The tag toggle uses `aria-pressed` and appears immediately after the inspected item in DOM order. "Take a breath" is non-modal and doesn't take focus.

**A6. Letters, delivery cards, screenshots and QR posters as images (1.1.1 Non-text Content, 1.4.5 Images of Text).** §5 `letter` says "as images". 1-6 (letter → QR) and 1-3 (Teo's screenshot) put inspectable content inside images. Aoife can't read or inspect them.
- Fix: render letters, cards and screenshots as styled real text with images only for decoration. Each inspectable is a real element. The QR's destination is reachable as text via the inspect list.

**A7. Foreign in-world text (3.1.2 Language of Parts).** German SMS must carry `lang="de"`. The translation should be available inline (a toggle or under the message), not only as a timed "inspection" costing 2 s. Translation is comprehension, not evidence; it should not count toward the ≥3 inspectables minimum, and it should never be a red flag (see L7).

**A8. The stress meter needs a text equivalent (1.3.1 Info and Relationships, 1.4.1 Use of Color).** The meter state (Calm/Tense/Overwhelmed) must be exposed as text (`role="meter"` with a value text) and announced once on state change, not on every tick. Audio (heartbeat) must be **off by default** (1.4.2 Audio Control); "optional" is ambiguous.

**A9. Training-page watermark for non-visual users.** Red Line 2 says fake forms must be "visibly part of the game". For Aoife the watermark must also be programmatic: page title, a landmark label and input descriptions such as "Training page: demo field, nothing is sent". Read-only demo inputs need `aria-readonly` and a description, so they don't read as broken fields.

The design already meets: no drag in damage control (2.5.7), 44 px targets (2.5.8), static vignette and no flashing (2.3.1), reduced motion, 200% / 320 px reflow (1.4.4 / 1.4.10), transcripts for calls (1.2.1). These need verification in the build.

---

## Safety basics (paper check)
- Fake forms: no network, watermark, demo values. Fine on paper; add A9 for non-visual users.
- QR codes: see B11. This must be specified before the build.
- No real brands: PaketPilot, the Agency and the language app are provisional pending the `ux-artist` check (G1-Q1). No issue found in chapters 0–1 copy.
- Privacy: nickname and progress in `localStorage` only. Fine.

---

## Conditions for PASS (all required)

1. **B1:** Separate "decisive for scoring" from "ends the scenario". `hang_up` (and verify, where a follow-up is defined) must allow `call_back_known` in the same scenario. State this in GDD §6 and `balance.yaml multi_step`.
2. **B2:** Specify boss beat progression independent of the player's first decisive action, plus an explicit boss scoring rule. Update the §7.1 chapter max.
3. **B3:** Make stars and points consistent: every class × truth cell has a star value, and the point order matches the star order. Resolve verify vs proceed on legit_high and engage vs verify on legit_low.
4. **B4 + B5:** Fix the 1-5 stakes label or content, and make 1-3 meet (or be formally exempt from) the authoring rule. Recompute §7.1.
5. **B6:** Define how inspectables inside quoted or embedded scam examples score.
6. **B7:** Change the pause bonus so that no blind strategy, including "Pause, then X", reaches silver. Add those rows to §7.1.
7. **B8:** Move recovery step categories to the per-scenario reference.
8. **B11:** Specify the QR payload rule (not decodable, or same-origin only) and add it to the red-line linter scope.
9. **B12:** Give arc slot 1 a debrief and define the "Close the app" outcome.
10. **L1:** Add a content rule that pressure levers, timers, pushers and Tense button styling occur on genuine scenarios too (within ±15 pp of fraud per chapter). Styling applies regardless of truth.
11. **L2:** Stop penalising `verify_in_app` on low-stakes delivery messages in a chapter whose focus is LO-03 (or drop the gold cap on it).
12. **L3 + L4:** Add GDD rules that reassuring details are never presented as proof of safety, and that the in-message action on a player-initiated message is `proceed`.
13. **L7:** Spelling, grammar and language may only be decoys. Add a content-validator rule.
14. **A1–A9:**
    - timing choice before 0-4; timers freeze in menus and debriefs;
    - Calm mode removes pushers;
    - a defined live-region coalescing rule;
    - `I` optional or remappable, with native inspect buttons;
    - stable focus and action order under stress;
    - letters, cards, screenshots and QR posters as real text;
    - `lang` on foreign text with an inline translation that costs no time;
    - the stress meter exposed as text, with audio off by default;
    - a programmatic training-page label.
15. **F2 + F3 + S1:**
    - a two-layer debrief with a ≤ 40-word first layer that still carries the Red Line 4 elements;
    - a mid-chapter stop point with a progress indicator;
    - player-facing scoring reduced to stars per scenario and the stamp per chapter, with points secondary;
    - "Trust rating" renamed and jargon replaced (S2, S3).

Recommended, not required for PASS: F1 (vary Berlin's surface), F4 (one mechanic per tutorial scenario, skippable coach marks), F5 (free city choice after Berlin, G1-Q6), F6 (confirm before "Tell me now"), L5 (real-device gesture in debriefs), L6 (no count hint from difficulty 3), L8, L9, B9, B10, and renaming "magnifier" to "Check".

Once a build exists I will re-test these with Playwright at 375×812 and 1440×900, run axe-core and a keyboard-only pass, check reduced motion and 200% zoom, and inspect network requests and QR payloads.

---

## Re-check v3 (2026-11-18)

**Inputs:** `docs/GDD.md` v3, `docs/LEARNING_OBJECTIVES.md` v3 and `content/balance.yaml` v3. These are untracked files in the main checkout and are not yet on any branch.
**Method:** I checked each of the 15 PASS conditions above against the v3 text, recomputed the GDD §7.2 Berlin strategy table from `balance.yaml` v3, and re-walked chapters 0 and 1 for new issues.

### Per condition

| # | Condition | Result | Evidence in v3 |
|---|---|---|---|
| 1 | B1: hang up, then call back is reachable | **PASS** | §6 decisive-action rules; `multi_step.verify.terminal: false`; `hang_up_on_call` opens `[call_back_known, report, done]`. |
| 2 | B2: boss is scammer-driven and has a defined score | **PASS** | §6 Bosses; `multi_step.boss` (`beats_arrive: scammer_driven`, `per_beat_summed`, max 51); §17 note. See N2 for an arithmetic ambiguity. |
| 3 | B3: stars and points consistent | **PASS** | §7.1 star table; points = stars × 5; falls score 0–9, so ★ for a fall is still below ★★ (10). Verify = proceed on high-stakes genuine. Engage (★★) is below verify (★★★) on low-stakes genuine. No comply allowed on low-stakes genuine. |
| 4 | B4 + B5: stakes labels, authoring rule, §7.2 | **PASS** | 1-6 (payment failed, update in account) is high stakes by the §6 definition. Teo is now drill 1-4, and drills are exempt from the authoring rule. I recomputed every §7.2 row; all 12 rows are arithmetically correct (max 172; silver needs 4 red flags spotted, gold needs 8). |
| 5 | B6: quoted examples | **PASS** | `context: quoted`, `tags.quoted_examples: score_like_fraud`. See N3 for a minor accounting gap. |
| 6 | B7: no blind strategy reaches silver | **PASS** | Pause is unscored. Silver needs ≥ 34% of red flags spotted. Rows 6–12 are all bronze, including "always verify + pause". |
| 7 | B8: recovery categories per scenario | **PASS** | §9; `recovery.categories_are_per_scenario`; LO-16 evidence updated; 0-6 names password change as the `stop` step. |
| 8 | B11: QR payload rule | **PASS** | §5 safety constraints (non-decodable, or a `.invalid` string only); CR-13 makes the linter decode every QR asset. |
| 9 | B12: arc slot-1 debrief and "Close the app" | **PASS** | §10.2: slot-1 debrief text written; Close pauses the arc once and ends it on the second Close (ending A′). |
| 10 | L1: pressure parity, styling regardless of truth | **PASS** | §6 pressure-parity rule (±15 pp, validated); §8 styling "on genuine and fraud messages alike" plus the two-callout design; honest timers; the tutorial's first timer is on a genuine message (0-3). Berlin parity is 67% vs 80%, a 13 pp gap ✓. A related, new leak is described in N1. |
| 11 | L2: delivery checks not penalised in the delivery chapter | **PASS** | Verify on low-stakes genuine is ★★★. Gold blocks only *off-focus* double-checks (`max_offfocus_doublechecks`). §7.2 row 2 is gold. |
| 12 | L3 + L4: reassurance isn't proof; player-started = proceed | **PASS** | §3 genuine debrief rule; §5 logo/padlock lines; LO "Rules that protect"; validator `logo_or_sender_name_never_proof`; §6 "Anything the player started → `proceed`"; 0-3 states it. |
| 13 | L7: language never a red flag | **PASS** | §2; validator `language_never_red_flag`; CR-04 `type`. |
| 14 | A1–A9 | **PASS** | §14 A1–A9 one-to-one. Details: mode choice before 0-3; Off mode; freeze list; 30 s call beats; pushers on/off and the Calm preset; 15 s coalesced announcements plus "Time left"; `I` off by default and remappable; stable order and focus; letters, cards and screenshots as real text; `lang` plus a no-time inline translation; `role="meter"`; heartbeat off by default; training-page title, landmark and field descriptions. |
| 15 | F2 + F3 + S1–S3 | **PASS** | Two-layer debrief: layer 1 ≤ 40 words, carrying the Red Line 4 essentials, plus a real-device tip in layer 2. Half-day stop point with progress indicator; stress resets on resume. Players see stars and stamps; points sit in Details. "Inspector rating"; plain copy ("harmless message", "red flags you spotted"). Chapter targets re-baselined to 12–18 min, and a half-day (about 7–9 min) now fits Lena's break. |

### New issues found in v3

**N1. The "no count" list leaks the verdict in Berlin.** Severity: **major**. This is a learning issue in the same class as L1.
- The cause: `difficulty.scenario_levels.*.list_shows_count` and the "Nothing unusual here" responses switch on at **scenario difficulty 3**. In Berlin every difficulty-3 scenario is fraud (1-5, 1-8, the boss), and every genuine scenario is difficulty 1–2 (1-1, 1-2, 1-6).
- What a player learns: "If the checklist shows no count, it's a scam" is 100% reliable in the vertical-slice chapter. Tomasz will spot this.
- I share the blame: my L6 recommendation suggested "from difficulty 3" without a parity guard.
- Fix (either one):
  - (a) tie `list_shows_count` and "Nothing unusual here" to the **chapter slot** (e.g. slot ≥ 2), so they are uniform within a chapter; or
  - (b) add a `mix` validator rule that every chapter whose band reaches difficulty d has at least one genuine scenario at d. For Berlin, that means raising 1-6 to difficulty 3.
- Interrupts (difficulty ≥ 3) would leak the same way. Option (b) covers them too.

**N2. Boss fall points are ambiguous.** Severity: **minor**, but it is a spec contradiction.
- `multi_step.boss.scoring: per_beat_summed` ("each beat: stars × 5 (or exception)"), and the fall exception is the recovery score. Read literally, three fallen beats score 3 × recovery. §7.2 row 12 counts the boss as 9, a single recovery score.
- The engineer and the table will disagree.
- Fix: state that a boss's damage-control points (0–9) are counted **once**, and that fallen beats otherwise score 0.

**N3. Drills with quoted examples aren't in the chapter accounting.** Severity: **minor**.
- Quoted tags "score like fraud", but drills are excluded from the chapter maximum. v3 no longer says the rating is capped at 100%. It's also not stated whether quoted red flags count toward "red flags spotted" for stamps.
- Fix: say whether drill tag points and spotted flags count, and restore "rating capped at 100%".

**N4. Replying to a genuine message may score as engage (★★).** Severity: **minor**.
- In 1-2, Adaeze asks you to "confirm by noon". The natural action is to reply, which is `reply`, class engage, ★★. The player-started rule doesn't cover this case.
- Fix: an authoring rule that the intended normal response on a genuine message is `proceed`, even when it is a reply or a link tap.

**N5. The tutorial boss introduces the call device without a coach mark.** Severity: **minor**.
- 0-6 beat 3 introduces the call device and the "What now?" dialler for the first time, inside the boss. This breaks "one new mechanic per scenario".
- Ingrid may not find the dialler.
- Fix: a coach mark on first use of `hang_up`, or move the call to a 0-4 variant.

**Observations (no action required):**
- Gold now allows **zero** off-focus checks; v2 allowed one. Under §7.2 row 3, checking Adaeze's meeting change with her costs gold. I lean towards allowing one (G1 question 5 is for Roman).
- Once beat 1 of a boss is verified, beats 2–3 carry less tension. They still teach hang up and call back, so this is acceptable.
- 1-5 (the Kettle code callback) has no genuine twin in Berlin. Check that `legit_twin_required` is meant per chapter rather than per fraud scenario.

### Re-check verdict: **FAIL** (narrow)

All 15 original conditions **PASS**. v3 is a thorough revision. Two new items block a PASS:

1. **N1:** remove the difficulty-based verdict leak. Either make `list_shows_count`, "Nothing unusual here" and interrupts uniform within a chapter (tie them to the slot), or require at least one genuine scenario at each difficulty level the chapter uses (Berlin: a genuine scenario at difficulty 3).
2. **N2:** state that boss damage-control points count once, so that `balance.yaml multi_step.boss` matches §7.2 row 12.

N3–N5 are recommended before content authoring but do not block. Once N1 and N2 are fixed, this becomes a PASS for the design and for G1 from QA's side, subject to the hands-on re-test once there is a build.
