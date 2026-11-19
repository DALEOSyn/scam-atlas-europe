# Game Design Document — Scam Atlas: Europe

Owner: `game-designer` · Status: **v3.1, final revision for G1** (v3.1: net spotting, decoy rules, slot-bound list and timers, boss-fall rule, Phase-2 cleanups) · Last update: 2026-11-18
Related: `docs/LEARNING_OBJECTIVES.md`, `content/balance.yaml` (v3, all numbers), `content/brands.yaml` (brand names, owned by `ux-artist`), `docs/patterns/` and `docs/patterns/MAP.md` (fraud facts, owned by `fraud-researcher`), `templates/scenario.template.yaml`, `docs/qa/2026-11-18-gdd-paper-playtest.md`.

> This document states no fraud facts. Scenario ideas are **candidates** until the pattern brief confirms them. Brand names come from `brands.yaml`: **Waymarker Network** (employer; IT portal **Waymarker Desk**; **Waymarker mail**), **Trundle** (courier), **Larchwick Bank**, **Thimble & Pine** (shop; non-craft products only), **Swaploft** (marketplace), **Kettle** (messenger), **Gatewren** (sign-in and e-ID approvals), **Wordswap** (language app). Any other brand a chapter needs is added to `brands.yaml` first. Open questions for Roman are in §21.

---

## 1. Pillars
1. **Decisions, not trivia.** Every scenario is a choice inside a believable device. We reward the habit (verify through an independent channel) and spotting the real red flags, not lucky guesses.
2. **Calm, not paranoid.** 30–40% of messages are genuine. Reporting a genuine message costs a star and blocks gold. Genuine messages carry honest deadlines and nudges too, so pressure alone never gives the answer away.
3. **Pressure you can feel and beat.** Timers, pushy follow-ups and a stress meter, with *pause* as the counter-move.
4. **Fall safely, recover well.** Mistakes play out believably and then teach recovery.
5. **A trip, not a test.** Cities as chapters, a recurring cast, and a slow-burn arc that pays off in the finale.

## 2. Premise and cast
You've joined the **Waymarker Network**, a fictional non-profit (not an EU body, and never styled like one) that sends "trust inspectors" around Europe to help people spot scams. Your phone, inbox and Larchwick Bank app travel with you.

| Character | Role | Notes |
|---|---|---|
| **You** (optional nickname, default "Sam") | Inspector | No gender or appearance. The nickname stays in `localStorage`. |
| **Adaeze Okafor-Lind** | Coordinator, Brussels | Calm, dry. Her number is in your staff directory, so she is the known channel for work checks. The game says early that she never asks for money or secrecy. |
| **Mateus Ferreira** | Field partner | Quick, gadget fan. Falls for one scam in Warsaw, and you help him recover. |
| **Grandpa Teo** (74) | Family back home | Sharp and funny. **Spots scams and teaches you** (Berlin 1-4, Rome). Slips once (0-5) and asks you for help. |
| **Noor** (15) | Cousin | Messenger-native. New-number scenario (Amsterdam) and the easy-money offer (finale). |
| **Alex** | Friend met on Wordswap | The arc character (§10). **Friendship only.** Illustrated, never a photo. |
| **Locals** | Per chapter (`content/cast.yaml`) | E.g. Jonas (Berlin neighbour); Signora Bruna (72, Rome B&B owner, capable) and her grandson Davide (19). They reach you by message or call, never on the doorstep. |

Scammers are faceless: "unknown sender", a spoofed fictional brand, or a transcript. No names pointing to an ethnicity, no accents. **Spelling, grammar and foreign phrasing are never red flags** (validator rule). They may appear only as decoys.

## 3. Core loop (one scenario, 1–2.5 min)
1. **Arrive.** A notification lands on a device (§5). Pressure may start: timer, pusher, stress.
2. **Check and tag (optional).** Use the **Check** tool (magnifier icon) on any element. You may then mark the detail as **suspicious**. Only correct tags count (§7).
3. **Act.** Choose from 2–5 plain-language actions. Each has a `kind` (§6). Calls and bosses have several beats.
4. **Consequence.** A short in-device outcome (≤ 15 s), after every scenario (and every boss beat) with an outcome or an expired timer, before damage control or the debrief. It is not repeated in debrief layer 1 (layer-1 ruling 2026-11-19); layer 2 keeps it under "What happened".
5. **Damage control** after falling for fraud (§9). Not on arc beats.
6. **Debrief, two layers** (Red Line 4 content is always in layer 1):
   - **Layer 1 (≤ 40 words, always shown):** verdict, the one key tell, the verification step that works, a one-line "Already clicked?", and stars.
   - **Layer 2 ("More"):** all red flags with your tags marked right or wrong, how to check this on a real phone ("Press and hold a link to preview it"), full recovery advice, the habit card, sources, points, and the optional "Which pressure did they use?" tap.
   - Genuine debriefs say **why it was safe to act** ("It asked for nothing and matched your order. The sender fits, but that isn't proof on its own."). A reassuring detail is never presented as proof.

## 4. Meta loop (one chapter, 12–18 min, in two halves)
- **Two half-days.** Morning: 3–4 scenarios. Then a **stop point** ("Good place to take a break. 4 messages left today"). Afternoon: the rest, then the boss. A progress indicator is always visible. The game saves after every scenario. On resume, stress resets to 10.
- **Boss.** A scammer-driven, multi-channel fraud: beats arrive on schedule whatever the player did before (§6), with up to 3 scored beats.
- **Arc beat.** A 30–60 s Alex interlude (chapters 1–9).
- **Drills.** Unscored teaching moments (e.g. Teo's tip). They are outside the mix and the chapter maximum.
- **Interrupts.** Genuine or fake notifications arriving mid-scenario. They are unscored, except that reporting a genuine interrupt counts as "genuine message reported" for stamps.
- **Echo.** At most one per chapter. A compromise earlier in the chapter (`sets_flags`) shows up later.
- **Flag names are snake_case** (e.g. `alex_invested`): lowercase letters, digits and underscores only, never dots. Dotted names like `alex.invested` read as domains to the red-line linter (Red Line 3).
- **Chapter end.** A stamp (§7) and habit cards. The summary is in plain words and shows correct and wrong marks apart, so effort is never shown as zero (ruling L3): "Red flags you spotted: 7 of 8 · Marks on safe details: 3 · Genuine messages you reported: 0 · Harmless messages you double-checked: 1". "7 of 8" is the gross count of correct marks (capped at R). Stamps still use **net** spotting (§7.1); the tier hint says so: "Spot at least {n} red flags. Each mark on a safe detail takes one off. Your count: {net}."
- **Unlocking** is never score-gated, and every chapter can be replayed.

## 5. Devices and the Check tool
| Device | Use | Notes |
|---|---|---|
| `email` | Inbox, threads | Display name vs. address. |
| `sms` | Texts, including in existing genuine threads | Short code vs. mobile number. |
| `messenger` | Kettle chats, new-number messages, the arc | Profile, number, "new contact" banner. |
| `call` | Transcript, optional audio. Vishing with spoofed caller ID or a cloned voice. | `hang_up` and the dialler are always visible. The Check tool on the caller ID says it shows the same name a real call would, so it can't prove anything either way (decoy reveal rule, docs/CONTENT_GUIDE.md). |
| `browser` | Shops, rentals, login pages, ads | Training pages (see below). |
| `qr` | Posters, meters, letters | The destination is shown as text before anything opens. |
| `banking` | Larchwick Bank app | Balances, payees, transfers, and the **payee-name check** (fictional "Name doesn't match" / "Name matches" banners). |
| `social` | Feeds, ads | Fictional people only. |
| `auth` | Gatewren approvals | Sign-in, e-ID signature and QR-login prompts, with context. |
| `letter` | **Only as the carrier of a digital vector** (a QR code or URL on a delivery card, poster or letter). The lesson must be about that vector. No doorstep notes, no paper-only letters (Red Line 8). | **Rendered as styled real text.** Images are decorative only. |

**Check tool.**
- Every visible element of a message is a native button ("Check sender", "Check link"), in reading order.
- The list view ("Details you can check") is the primary keyboard and screen-reader path, and gives identical content to pointer users.
- Checking reveals the real address, the full domain, the payee name, the QR destination or the caller-ID note. The list's presentation is set by **chapter slot**, the same for every scenario in a chapter, genuine or fraud. It never shows a count (a count let players tell fraud, with more checkable details, from genuine), and every element without an authored reveal says "Nothing unusual here". So the list never hints at which scenario is harder or which is a scam.
- Each check costs 2 s of timer.
- **Translation** of in-world foreign text is an inline toggle that costs no time, is marked with `lang`, and is never a red flag.
- **Tagging:** after a check, a "Mark as suspicious" toggle (`aria-pressed`) appears directly after the item in DOM order. It does not move focus and costs no time.

**Safety constraints:**
- **QR codes** are drawn as deliberately non-decodable stylised codes. If a decodable code is ever needed, it may encode only a `.invalid` text string (e.g. `QR-DEMO-1-7.invalid`). The red-line linter decodes every QR asset and fails on anything else (Red Line 3).
- **Training pages** are visibly part of the game:
  - a watermark;
  - a page title and landmark label "Training page";
  - inputs are read-only demo values (`aria-readonly`, described as "Demo field, nothing is sent");
  - no network requests (Red Line 2).
- The **padlock** may appear on fraud pages only as a decoy. Debriefs say "necessary, never proof".
- **Logos and familiar sender names** are never proof. Fraud scenarios use the fictional brand's real-looking logo and name, and may land inside a genuine thread. Debrief line: "A logo or familiar name proves nothing. Scammers copy them perfectly, even into a real thread." (LO-01; used in 1-5, 1-8, the Berlin boss and Madrid.)

## 6. Actions and rules
| Class | Kinds |
|---|---|
| verify | `verify_in_app`, `call_back_known`, `check_official_list`, `check_with_platform`, `ask_someone`, `verify_identity` (in-game photo or profile check only) |
| report | `report`, `block` |
| dismiss | `ignore`, `delete`, `hang_up`, `deny_prompt` |
| engage | `reply`, `open_link`, `call_number_in_message`, `scan_qr_and_open` |
| comply | `pay`, `pay_unprotected`, `enter_details`, `share_code`, `approve_prompt` (fraud only), `install_or_remote` |
| proceed | `proceed`, `pay_protected` |
| step | `start_transfer` (opens the banking device; never scored; CR-18, producer ruling 2026-11-19) |
| meta | `pause` (unscored) |

**Decisive-action rules.** The *decisive* action decides the stars. It is not always the action that ends the scenario.
- **Step is never decisive.** `start_transfer` leads to a `banking` beat, and the action taken there decides the stars. It applies no cap, on genuine or fraud, and is allowed on boss beats as the one exception to the boss engage ban below (CR-18(e)).
- **Verify is not terminal.** It shows the truth, then the player picks a follow-up. Verify's 3 stars stand, unless the follow-up is comply or proceed on fraud, or report on a genuine message. In those cases the follow-up's score replaces it.
- **On `call`, `hang_up` is not terminal.** It opens a "What now?" step with the dialler open: `call_back_known` counts as **verify**, `report` counts as report, and **"Leave it there"** (built-in `done`, renamed from "Done" by ruling L1: it describes the behaviour without hinting at the verdict) counts as dismiss. The debrief describes built-ins in the past tense ("You hung up and left it there."), never with the button label (UI_SPEC §8.1).
- **Engage** ends the scenario on genuine messages. On fraud it does not: it always leads to a next beat (validator), and the scenario's stars are capped at 2. **Boss beats** (interim, until the engine supports in-beat follow-ups) offer no engage kinds on fraud; use the comply kind the link leads to, labelled "<do X> through the link" (§16 ruling 4).
- **Opener beats.** A standard scenario may open on a setup beat (e.g. the page where the player started a reset). If the player reaches the next beat, the opener's `proceed` is not the decisive action (§16 ruling 2).
- **Timer expiry** (second) scores as **dismiss**, with no tag bonus.
- **Bosses** are scammer-driven. Beats 2–3 arrive on schedule regardless of beat 1, each beat is scored on its own decisive action, and the beat scores are summed (§7). A fallen beat scores 0 and the other beats score normally. If any beat was a fall, damage control runs once at the end and its points (0–9) are added **once per boss**.

**Authoring rules (validated where possible):**
- Each `standard` or `boss` scenario offers at least one verify action and one tempting wrong action. Drills are exempt.
- **Anything the player started** (a reset link they requested, a sign-in they began): the in-message action is `proceed`, never `open_link` or `approve_prompt`.
- No comply actions on low-stakes genuine messages. **"High stakes"** means the request (`message.request`, on any story beat) is one of exactly six: `pay`, `log_in`, `enter_details`, `share_code`, `approve` or `install` (install an app or allow remote access; its comply kind is `install_or_remote`). The validator uses this set; any other request is low stakes.
- Labels describe behaviour, never the verdict.
- **Pressure parity:** from slot 1, the share of genuine scenarios with a timer or pusher stays within 15 percentage points of the share of fraud scenarios that have one. Genuine messages use honest deadlines ("Locker holds your parcel 7 days", "Link valid 15 minutes").
- **Cyber scope (Red Line 8):** every scenario hinges on a digital vector (email, SMS, messenger, spoofed or cloned-voice call, fake site, shop or app, QR code, account takeover, code or MFA/e-ID abuse, remote access, social ads). No doorstep, street, ATM, in-person or paper-only tricks. Where a real-world scam would continue offline (e.g. someone coming to collect cash), the scenario ends at the digital request and the debrief stays on that vector.
- **Theme variety:** at most half of a chapter's scored scenarios share a surface theme, and no two of them sit next to each other.
- **Timer length** is set by chapter slot (`timers.by_slot`) and is the same for genuine and fraud scenarios. Only bosses (always fraud, announced as the boss) and call beats use their own fixed lengths.
- **Difficulty parity:** every difficulty level a chapter uses includes at least one genuine scenario.
- **Decoys:** every fraud scenario has at least 2 decoys. In each chapter, at least ceil(F/3) of the F fraud scenarios have the **sender or the link** as a decoy (e.g. a spoofed sender ID or a spoofed caller ID that checks out), so "always tag sender and link" doesn't pay.
- **Normal response to a genuine message is `proceed`**, even when it is a reply or opening a link (e.g. "Reply: see you at 10"). Engage kinds on genuine messages are only for partial or off-target responses.

## 7. Scoring
### 7.1 Rules
The player sees **stars per scenario** and a **stamp per chapter**. Points and the **Inspector rating** (renamed from "Trust rating") live under "Details".

**Stars by class and truth.** Points = stars × 5, except for the cells marked. The `step` class has no row: it is never scored, and the next beat's action decides (§6, CR-18).

| Class | Fraud | Genuine, high stakes | Genuine, low stakes |
|---|---|---|---|
| verify | ★★★ | ★★★ | ★★★ ("good habit, optional this time") |
| proceed | 0 (a fall) | ★★★ | ★★★ |
| report | ★★ | 0, **−5 points** | 0, **−5 points** |
| dismiss | ★★ | 0 (you missed something real) | ★★ |
| engage | not terminal; caps the scenario at ★★ | ★★ | ★★ |
| comply | 0 (a fall); ★ if damage control ≥ 6 | ★ | not allowed |

**Tutorial grace (chapter slot 0 only, ruling L4; balance `tutorial_grace`).** `report` on a genuine message (high or low stakes) earns **★, 5 points** (no −5), and `dismiss` on a genuine high-stakes message earns **★, 5 points** (producer ruling, T-2.8: ★ = 5 points everywhere, so waiting out a timer, ★ and 5 points, never beats a deliberate pause; it was 0 points in T-2.7). Stamps are unchanged: they don't use points, and the report still counts as "genuine message reported". ★ at 5 points stays below ★★ (10); ties with a ★ fall (6–9 points) are acceptable. Not applied to a timer running out (that is not a choice). From slot 1 the table above applies: the over-report cost is part of LO-17, and row 10 of §7.2 needs it. Copy in every chapter: over-caution on genuine never gets a bare label next to low stars ("You reported it. Careful is good; this one was safe.").

- **Falls** score their damage-control points (0–9) instead of stars × 5, so ★ for a fall is worth 6–9, which still sits below ★★ (10). Stars and points always rank choices in the same order.
- **Tag bonus (fraud and quoted examples only):** +2 per red flag tagged, capped at +6. It is **voided to 0 if any decoy or reassuring detail is tagged** in that scenario (or across a boss). It applies only to verify, report or dismiss endings, never to timer expiry. Tags on a genuine message's own details earn and cost no points, but they **count as wrong tags for spotting** (below). **Drill tags never count** toward points or spotting.
- **Quoted examples:** an inspectable with `context: quoted` (e.g. the fake text in Teo's screenshot) can be a red flag inside a genuine message without changing that message's truth.
- **Pause is unscored.** It counts only toward LO-04, and only when used before the decisive action while a timer or pusher is active, or while stress is Tense or higher. The stress clause is there so Calm mode can still earn the card.
- **Boss:** up to 3 scored beats × 15, plus one tag bonus (cap 6) = **51 max**. Fallen beats score 0, and damage-control points are added once per boss. The boss's displayed stars are the rounded mean of its beats.
- **Excluded from the chapter max:** drills, arc beats (banked silently for the finale, §10), interrupts and pause.
- **Inspector rating** = points ÷ chapter max, **capped at 100%**.
- **Spotted (net, chapter-wide)** = correct tags − wrong tags, across all scored scenarios and boss beats. Wrong tags are decoys on fraud plus any tag on a genuine message's own details. R = the chapter's red flags. Scoring uses net (the anti-mashing maths in §7.2 depends on it); the chapter summary *shows* correct and wrong marks separately (ruling L3, §4).
- **Stamps:**
  - **Bronze:** chapter finished.
  - **Silver:** rating ≥ 75%, at most 1 genuine message reported, and spotted ≥ ceil(R/3).
  - **Gold:** rating ≥ 90%, no genuine message reported, spotted ≥ ceil(2R/3), and **no extra checks on harmless messages outside the chapter's focus patterns.** Checking a genuine Trundle text in the Trundle chapter never counts against you (QA L2).
- **Stamp screen copy:** "Gold: you spotted the red flags, checked when it mattered, and didn't report genuine messages."
- **Position on always-verify:** verifying everything is a sound real-world habit, so it earns ★★★ on every scenario. But it shows no evidence of spotting anything, so it stays at **bronze**. Silver and gold need spotted red flags; gold also needs calibration.

### 7.2 Strategy check (Berlin, §17)
**Assumptions (v3.2, re-run at T-2.4b against the authored Berlin YAML, final state with `request` checkable):**
- **R counts the scheduled beats only** (the opening message and each scored boss beat; `redFlagCount` in the engine). Red flags on a page reached only through an engage (`page.address` in 1-3, 1-7, 1-8) are taggable and count toward "spotted" for players who get there, but are not in R. Decoys there (the padlock) count toward the 2-decoy rule.
- **Standard fraud:** 4 scenarios, each with 2 red flags in R, max 15 + 4 = 19.
  - In 1-3, 1-7 and 1-8 the sender and the link are the red flags. Decoys on the message: 1-3 and 1-7 the tracking number; 1-8 the order number and logo. Each also has the padlock on its engage page.
  - In 1-5 the sender is a decoy (a spoofed Kettle sender name), there is no link, and the red flags are **the private mobile number** the code is to be texted to and **the request** (pass on the code). Decoys: sender name, request number. The 10-minute deadline is a layer-2 text flag, not a checkable (T-2.4b ruling 2).
- **Genuine:** 3 scenarios, max 15 each. Own checkable details: 1-1 sender, tracking number, pick-up code (3, parity with its twin 1-3); 1-2 sender, meeting time (2); 1-6 sender, link, order number, logo (4, parity with its twin 1-8). 9 in total.
- **Boss:** 3 beats, max 51.
  - 4 red flags: beat 1 link, beat 2 sender and link, beat 3 the request.
  - 6 decoys: beat 1 sender name and tracking number; beat 2 logo; beat 3 caller ID (it shows "Larchwick Bank"), the number the caller quotes ("the number on your card"), and the case number.
- **Minimum checkables** (`mix.min_checkables`) apply per scheduled beat: 3 on every fraud beat, 2 on every genuine message.
- **Sender-or-link decoys:** 1-5 and the boss = 2 = ceil(5/3) ✓.
- **Totals:** max = 4×19 + 3×15 + 51 = **172**. R = 8 + 4 = 12, so silver needs spotted ≥ ceil(12/3) = **4** and gold needs ≥ ceil(24/3) = **8**.
- **Interim, only if `request` checkables were not to land:** R = 10 (1-5 and boss beat 3 lose their request flag), max = 170 (1-5's tag cap drops to +2), silver 4, gold 7. Not to be shipped: T-2.3 lands before merge.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed on genuine | 76 + 45 + 51 | 172 | 100% | 12 − 0 = 12 | **Gold** |
| 2 | Ideal + checks the genuine Trundle text in the app (focus twin) | same | 172 | 100% | 12 | **Gold** |
| 3 | Ideal + always verify, incl. calling Adaeze about 1-2 (off-focus) | same; 1 off-focus check | 172 | 100% | 12 | Silver |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | 4×(10+4) + (3×10+6) + 45 | 137 | 79.7% | 12 | Silver |
| 5 | Ideal but reports Adaeze's message once | 172 − 15 − 5 | 152 | 88.4% | 12 | Silver |
| 6 | Tag everything + always verify | all bonuses void: 60 + 45 + 45 | 150 | 87.2% | 12 − (6 + 6 + 9) = −9 | Bronze |
| 6a | **Random single tag** per scenario/beat + always verify (expected) | 150 + 2×(⅔+⅔+½+½) + (1/18×6) | ≈155 | ≈90.1% | 3.58 − (3.42 + 3) ≈ −2.8 | Bronze (silver only if all 7 fraud tags hit, 1 in 162) |
| 6b | **Always tag sender + link** + always verify | 150 + 4 (1-3) + 4 (1-7) + 4 (1-8); 1-5 and boss void | 162 | 94.2% | 9 − (1 + 2 + 4) = 2 | Bronze |
| 7 | Check everything, no tags, always verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 8 | Blind always-verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 9 | Blind always-verify + pause everywhere | pause unscored | 150 | 87.2% | 0 | Bronze |
| 10 | Blind always-report | 40 + 30 − 15 | 55 | 32.0% | 0 | Bronze + calibration tip |
| 11 | Blind always-dismiss | 40 + 30 + 10 + 10 + 0 | 90 | 52.3% | 0 | Bronze |
| 12 | Trust everything, perfect damage control | 45 + 4×9 + 9 (boss: beats 0, damage control once) | 90 | 52.3% | 0 | Bronze |

Row 6a in detail (T-2.4b re-run, checkables as authored):
- Hit chance per fraud tag = red flags ÷ checkables on that beat: 1-3 ⅔, 1-7 ⅔, 1-8 ½ (2 of 4), 1-5 ½ (2 of 4); boss beat 1 ⅓, beat 2 ⅔, beat 3 ¼ (1 of 4).
- Expected correct tags = 7/3 (standard frauds) + 5/4 (boss beats) ≈ 3.58.
- Wrong tags = 7 fraud tags − 3.58 ≈ 3.42, plus 3 tags on genuine messages.
- The boss bonus survives only if all 3 beat tags hit (1/18), so it adds 6/18 ≈ 0.33 in expectation.
- Rows 6 and 6a changed with the extra decoys (more decoys make blind tagging worse); rows 1–5, 6b and 7–12 are unchanged. QA re-runs 6a/6b in the Phase 3 balancing pass as planned.

**What the numbers show:**
- No button-mashing strategy reaches silver **in expectation**, with or without pause.
- The one exception is luck. A random single-tagger reaches exactly silver's threshold only if every fraud tag hits, in about 1 in 162 runs. Even then, they have tagged the right detail 7 times.
- Row 6b is the closest systematic strategy, at 2 of the 4 needed. Its margin depends on the sender-or-link decoy rule and on genuine messages having their own sender and link details. The validator enforces the first; QA re-runs rows 6a and 6b for every chapter at the Phase 3 balancing pass.
- A high rating alone (up to 94%) never earns silver. Gold needs both spotting and calibration.

## 8. Stress, pressure, timers
- **Levers** (`pressure.levers`): `urgency`, `authority`, `fear`, `greed`, `helpfulness`, `affection`, `secrecy`, `small_amount`, `social_proof`.
- **Stress (0–100)** starts at 10 and resets to 10 on resume. It rises per lever (+8), per pusher message (+10), per interrupt (+10), on timer expiry (+15) and after a fall (+15). It drops by 15 between scenarios.
  - **States:** Calm (0–39), Tense (40–69), Overwhelmed (70+).
  - The meter is exposed as text (`role="meter"`, e.g. "Stress: Tense") and announced only when its state changes.
  - The vignette is static, with no flashing. Heartbeat audio is **off by default**.
- **Pushers.** Follow-ups from the sender of whatever the message is pushing, on genuine messages ("Jonas: still at home?") and fraud alike. **All pushers run on an authored schedule** (`at_seconds`). Stress shortens the interval by the same factor for genuine and fraud, so a pusher's timing never hints at the verdict. They are controlled by a separate **"Pushy follow-ups" on/off** setting.
- **Pressure styling.** In Tense or higher, the action **the message is pushing** gets the bright primary style, **on genuine and fraud messages alike**. Action order and position never change, and focus never moves.
- **Pause** is always available: stress −25, 5 s of timer (0 with timers off), 10 s cooldown. The pause screen says: "Real companies give you days, not seconds."
- **Timers:**
  - **Modes:** Standard, Extended (×2) or Off. The choice is offered in onboarding **before the first timed scenario**. Extended is the default when the device asks for reduced motion.
  - **Calm preset** = timers off + pushers off.
  - **Length is set by chapter slot** (60 s in slots 0–1, down to 35 s in slots 9–10) and is the same for genuine and fraud scenarios. Call beats last 30 s, boss beats 40 s.
  - Timers **freeze** while the pause menu, settings, help, debrief, translation, a coach mark or "Take a breath" is open. Coach marks were added in Paris rework 1; the engine needs a `coach_mark` freeze reason, requested in CR-23.
  - First expiry: the pusher escalates and the timer gets +20 s. Second expiry: scored as dismiss. On fraud the debrief says *"The deadline was fake. Nothing happened."* ("Nothing happened" only when nothing fell; after a fall: *"The deadline was fake."*). On a **genuine high-stakes** message the expiry scores **★, 5 points** in every slot (Berlin QA ruling, T-2.8; balance `timer_expiry.genuine_high`), and the debrief names the message's own deadline (`honest_deadline`, required by the validator on timed genuine scenarios).
- **No score element depends on timers, pushers or stress.**
- **Screen readers:** announcements come at most once every 15 s, with queued messages coalesced ("2 more messages from unknown sender"). The timer is announced only at half time and at 10 s, and a "Time left" button can be queried at any time.
- **UI_SPEC open question, answered: should the debrief point out the bright "pressure" button?** Yes, as a layer-2 callout shown **twice per game**:
  1. The first time any Tense styling appears: "The bright button is the one the sender wants you to press."
  2. The first time it appears on a **genuine** message: "Same bright button, and this time the request was genuine. Bright buttons show what the sender wants, not whether to trust it."

  ux-artist proposed once per game. I added the second callout because a single callout, if the player first sees it on fraud, would teach "bright = scam" (QA L1). It is not shown every time, because that would turn the styling into a tell.

## 9. Consequences, recovery, help
- **Consequences** are believable and calm: card debits, a locked account, your Kettle account messaging Noor a link. No blame: "This happens to careful people every day. Here's how to limit the damage."
- **Damage control** after every fall (in a boss, once at the end):
  - The prompt reads "Pick the step you'd do first, then 2 more." The options are 5–6 steps from `content/recovery_steps.yaml`, including 2 harmful ones ("reply and ask for the money back", "pay the recovery service").
  - **Each scenario's outcome assigns the categories** (`stop`, `secure`, `report`, `warn`, `harmful`). After credential theft, changing the password is `stop`; after card theft, blocking the card in the Larchwick Bank app is `stop`.
  - Scoring: +3 per correct pick (max 9), −2 per harmful pick, floor 0. LO-16 counts only if the score is ≥ 6 and the first pick is `stop`.
  - Select buttons only, no drag.
  - **Harmful steps** describe a behaviour, never a judgement of the person. Feedback on a harmful pick explains why it hurts and what works instead, without blame (e.g. `keep_quiet`: "Feeling embarrassed is normal, and it is what scammers count on. Telling IT fast is what limits the damage.").
- **Wallet.** Losses are narrative only. They persist across chapters but never block progress.
- **"Where to report and get help" needs list.** `fraud-researcher` verifies each entry per locale; real organisations are named only here (Red Line 1):
  1. Your bank (the number on your card).
  2. Police online reporting.
  3. The national consumer or anti-fraud body.
  4. The platform's reporting.
  5. **"Talk to someone" support line**, including the EU child helpline **116 111** once verified.
  6. **Help card (sextortion):** a short, factual "If someone threatens to share images of you" card, linked from the help screen. Never dramatised or played as a scenario **[G1-Q3]**.

## 10. The Alex arc (friendship only) and the finale
### 10.1 Beats
Alex is a **friend** met on Wordswap. There is no flirting or romance and no player choice about it: players may be 14, and the pattern overlaps with grooming tactics. The arc depends on the researcher confirming the pattern **[G1-Q2]**.

| Slot | Beat (candidate) | Warning sign | Options → kind |
|---|---|---|---|
| 1 | Friendly chat, practising phrases | none | Chat back → `reply` · Close the app → `ignore` |
| 2 | Suggests moving chats to Kettle | off-platform | Stay on Wordswap → `ignore` · Move → `reply` · Mention it to Teo → `ask_someone` |
| 3 | Lots of praise; "keep this between us" | secrecy, can't be verified | Photo check → `verify_identity` · Tell Teo or Adaeze → `ask_someone` · Keep it secret → `reply` |
| 4 | Brags about trading wins | profit bragging | Change topic → `ignore` · Ask how to join → `reply` · Report → `report` |
| 5 | "Start small with me" on an unknown platform | unregistered platform | Check the regulator list → `check_official_list` · Sign up and add €50 → `pay` |
| 6 | Dashboard shows growth (yours, or Alex's if you didn't invest) | too-good returns | Ask someone → `ask_someone` · Add more → `pay` · Report → `report` |
| 7 | Withdrawing needs a "fee" | pay to withdraw | Refuse and report → `report` · Pay → `pay` |
| 8 | "Limited window" | urgency + affection | Ask someone → `ask_someone` · Transfer → `pay` |
| 9 | Emergency, needs a loan | affection + fear | Call Adaeze or Teo → `ask_someone` · Send → `pay` |

**Authoring rule:** Alex's lines are ≤ 25 words, generic small talk and plain requests. No polished persuasion copy, no platform walkthroughs, no reusable templates, no realistic onboarding flow. The sceptic-reviewer checks every line.

### 10.2 Arc debriefs (Red Line 4)
- **Every arc beat, including slot 1, has a debrief.** Layer 1 has **no verdict line, no stars and no points**, and fits the same ≤ 40 words (UI_SPEC §8.1). It shows:
  - **Things to notice** = `debrief.layer1.tell` (generic, no verdict).
  - **The habit** = `debrief.layer1.what_works`.
  - **Slots 2 and 3 only:** `debrief.safeguarding_line`, which links to the support line.
  - **"Already did this? See what to do next"**, a link to layer 2. The full advice is `debrief.already_clicked` there (`clicked` for replying, moving chats or keeping secrets; `paid` for money), e.g. "If you've already paid a 'withdrawal fee', stop paying, call your bank on the number on your card, and keep the chat history".
- **Layer-1 examples** (word counts are authored words; fixed copy adds 10):
  - **Slot 1** (18 → 28): tell "Nothing to notice yet. Being friendly isn't a warning sign." · what works "Keep chats on the app you met on."
  - **Slot 2** (28 → 38): tell "Leaving the app you met on is a common scam step." · what works "Stay on Wordswap until you know someone." · safeguarding "Asked to switch apps or keep secrets? Tell a trusted adult."
  - **Slot 3** (28 → 38): tell "Secrets and lots of praise are common in scams." · what works "Tell Teo or Adaeze; do a photo check." · the same safeguarding line.
- **"Close the app" at slot 1:** the arc pauses and Alex messages once more in the next chapter. Closing a second time ends the arc (ending rule 3).
- **A fall on an arc beat** (`pay`) gets no damage control at that moment, since that would unmask the arc. Layer 1's "Already did this?" link opens the generic steps in layer 2 right away. Scored damage control runs at arc close (ending C).
- **"Tell me now"** appears on every arc debrief and in the pause menu, **behind a confirmation** ("This reveals the Alex storyline. Continue?"). It plays the reveal (the photo check shows the same illustration on profiles with other names), shows the red-flag timeline so far, and closes the arc.
- **Arc points** are banked silently, shown in the finale timeline, and **never feed any chapter rating or stamp**.

### 10.3 Ending rule (ordered; the first match wins, evaluated when the arc closes)
The arc closes at a report, at Tell me now, at a second Close, or at the finale.
1. "Tell me now" was used → **R, "Revealed"** (a neutral label that implies no judgement). If `alex_invested > 0`, it plays C's damage control and recovery-agency test; otherwise it plays the Teo scene from A.
2. `alex_invested > 0` → **C, "Recovered":** damage control, then a "recovery agency" offers to get the money back for a fee. Spotting it is the final test (LO-13, LO-16).
3. The arc was closed by "Close the app" twice → **A′, "Stepped away":** in the finale, Teo is approached by a similar friendly profile and you guide him.
4. Reported at slot ≤ 6 → **A, "Caught it early":** same Teo scene as A′, plus your timeline.
5. Otherwise (reported at slots 7–9, or the finale reached having refused every request) → **B, "Caught it in time":** you report it, and the team walks through the timeline.

All endings show the red-flag timeline (slot 1 is shown as "Nothing to notice yet"), the habit cards, and the help list.

## 11. Progression and rewards
- **Passport stamps** per city on an illustrated map (no tile services, no network).
- **Habit cards** (one per LO) are earned on first demonstration and turn gold at mastery. They are printable on the end screen.
- **Notebook** of correctly spotted red flags.
- No currencies, streaks or leaderboards.

## 12. Difficulty and session length
- **Difficulty** is 1–5 per scenario, and the band is set by **chapter slot**, not city (`balance.yaml`). At level 5, the main tell is the request itself.
- **New material:** up to 2 new patterns plus 2 callbacks per chapter.
- **Lengths:** scenario 1–2.5 min; chapter 12–18 min in two halves; game about 2.5–3 h. These replace the earlier 10–15 min target, following QA's F3 estimate, and are re-baselined after the vertical slice **[G1-Q5]**.
- **Mobile:** portrait, one-handed, message bodies ≤ 80 words, actions in the bottom half of the screen.

## 13. Mechanic → LO map
| Mechanic | LOs |
|---|---|
| Check tool + tagging (void on any wrong tag) | LO-01, LO-02, LO-06 |
| Verify actions | LO-03, LO-06–08, LO-10, LO-11, LO-13–15, LO-18 |
| Star table, over-report cost, calibrated gold | LO-17 |
| Genuine twins, honest deadlines, pressure parity, pressure styling on both | LO-17, LO-04 |
| Payee-name check banner (mismatch and misleading match) | LO-06, LO-07 |
| `pay_protected` vs `pay_unprotected` | LO-11 |
| Timers, pushers, stress, "deadline was fake", pause | LO-04 |
| Gatewren prompts: deny unstarted, `proceed` on started | LO-09 |
| Call: hang up → dialler | LO-08 |
| Falls + damage control (per-scenario stop step) | LO-05, LO-16 |
| Echo scenarios | LO-16, LO-07 |
| Easy-money offers (Amsterdam, Noor in the finale) | LO-12, LO-18 |
| Alex arc, arc debriefs, endings | LO-14, LO-13, LO-18 |
| Teo, Noor and Davide scenarios | LO-18, LO-16, LO-07 |
| Two-layer debrief with real-device gesture | all (transfer to real phones) |
| Habit cards, notebook | all (retrieval) |
| Passport, intros, half-day stop point | pacing only (≤ 20 s per intro) |

## 14. Accessibility (target WCAG 2.2 AA; QA A1–A9)
- **A1 Timing:** mode choice before the first timed scenario; Off satisfies 2.2.1. Timers freeze in menus, debriefs and help. Call beats are 30 s.
- **A2 Pushers:** a separate on/off setting (2.2.2). The Calm preset turns them off.
- **A3 Status messages:** a 15 s minimum between announcements, with coalescing. Timer announced only at half time and 10 s. A queryable "Time left".
- **A4 Keyboard:** native Check buttons in DOM order; the list is the primary path. The `I` shortcut is **off by default**, can be remapped, and works only with focus in the game region (2.1.4).
- **A5 Focus:** action order and position never change during a scenario. Styling changes don't move focus. The tag toggle sits after its item. "Take a breath" is non-modal and doesn't take focus.
- **A6 Text, not images:** letters, cards, screenshots and QR posters are real text, and the QR destination is available as text.
- **A7 Language:** `lang` attributes; a no-time inline translation; translation is never a checkable red flag.
- **A8 Meter and audio:** the stress meter is exposed as text; audio is off by default; nothing flashes.
- **A9 Training pages:** labelled in the title, landmark and field descriptions as well as visually.
- Also: no drag, 44 px targets, reduced motion, 200% / 320 px reflow, call transcripts, plain English around B1. Player-facing copy avoids jargon ("harmless message", not "low-stakes"; "red flags you spotted", not "calibration").

## 15. Tone
- Warm, brisk, lightly witty. Humour targets the trick, never the victim.
- Never use "stupid", "gullible", "obviously" or "you should have known". Lead with the tell.
- Older characters are capable. Teo and Signora Bruna lead in Rome, and it is the 19-year-old Davide who falls for the cloned-voice family-emergency message: it can happen to anyone.
- Scammers are faceless. Language mistakes never signal a scam.
- Every debrief ends forward-looking. Red Lines 1 and 3 apply everywhere, including jokes.

## 16. Chapter 0 — Home (tutorial)
- **Shape:** slot 0, difficulty 1–2. 5 scored scenarios (2 genuine = 40%) + 1 drill, about 10–14 min. **One new mechanic per scenario**, with skippable coach marks. Only stars are explained; points stay in Details.
- **Patterns** (pending the brief): credential phishing by email, fake password reset.
- **Timing:** the timing and pushers choice is offered before 0-3. The first timer appears on a **genuine** message (0-3), so "timer = scam" is never learned. Slot 0 is exempt from the pressure-parity rule because mechanics arrive in a fixed order.

| # | Scenario (candidate) | Device | Truth | Diff | New mechanic | LOs |
|---|---|---|---|---|---|---|
| 0-1 | Welcome email from Waymarker Network with your travel pack | email | genuine / low | 1 | Check tool | LO-01, LO-17 |
| 0-2 | "Mailbox full, log in" from a look-alike of **Waymarker mail** | email → browser | fraud | 1 | Tagging | LO-01, LO-02, LO-03 |
| 0-3 | Password-reset email right after *you* tapped "forgot password"; "link valid 15 minutes" (honest timer). Opens on the Waymarker Desk "check your inbox" page (opener beat, `request: none`); the reset email is beat 2. The in-message link is `proceed`. `message.request: log_in` on the email beat (the link opens the page where you set a new password), so it is high stakes. | browser → email | genuine / high | 2 | Timer; things you started | LO-17, LO-03 |
| 0-4 | "Unusual sign-in to your Kettle account. Locked in 30 min" | sms | fraud | 2 | Pusher, stress, pause, "deadline was fake" | LO-04, LO-05, LO-02 |
| 0-5 | Teo: "I clicked a prize link and typed my card number. What now?" | messenger | drill | 1 | Damage control (block card = stop) | LO-18, LO-16 |
| 0-6 **Boss** | Beat 1: "Waymarker Desk" email to log in to a new travel portal. Beat 2: a Kettle chat from "IT" pushing. Beat 3: a call showing a familiar "Waymarker IT" caller name; the caller asks you to read out a code or log in while they "help". | email → messenger → call | fraud | 2 | Combine; **coach mark the first time the call device appears** (beat 3: answer, hang up, dialler) | LO-01–05, LO-08, LO-18 |

0-6: verify through `ask_someone` (Adaeze, from the staff directory) or `verify_in_app` (open Waymarker Desk yourself). On beat 3, `hang_up` opens "What now?", which offers the same two. The caller name stays a decoy (ruling L2; it is Home's only sender-or-link decoy, ceil(3/3) = 1). The call shows "Caller ID: Waymarker IT (saved contact)": the faked incoming number matches the IT desk's real number, while the call-back number the caller gives (0800 ••• 3310) is the fake one (its own red flag). The caller-ID reveal follows the decoy reveal rule (docs/CONTENT_GUIDE.md): "Shows "Waymarker IT": the number matches a saved contact, as a real call would. Faked numbers can match too, so it can't prove anything either way. Judge the request." A wrong mark on it says "Fair instinct, but a faked number can show the same saved name, so it can't tell you which this is." After a fall, the `stop` step is changing the password; "tell IT through Waymarker Desk" is the second correct step (`report`). Brief: `docs/patterns/it-portal-credential-phishing.md`.

**Tutorial grace and the Home strategy check (ruling L4, T-2.7).** Slot 0 scores over-caution on genuine as ★, 5 points (§7.1; 0 points until the T-2.8 producer ruling): reporting 0-1 or 0-3, or closing 0-3 (you started the reset) is not punished below ★ while the player has not yet met a scam. 0-1's `welcome_reported` narrative agrees with ★: "IT replies: "Thanks for checking! This one really is from Adaeze, so go ahead and open your pack."" 0-3's `still_locked_out` stays. Home recheck (played through the runner, `tests/unit/engine/learning-rulings.test.ts`): **blind always-report stays bronze**, because it reports both genuine messages (2 > silver's 1); the two reports score ★ and 5 points each instead of 0 and −5.

**L1–L4 implementation decisions (T-2.7, accepted by producer ruling, 2026-11-19):**
1. **`you_chose_dismiss_started`** is "You left it. You started this reset; it was safe." The ruled "…reset, so it was safe." is 11 words on the validator's `wordCount()` and put 0-3 at 41 layer-1 words; dropping "so" keeps it at 10. The copy names a reset: a future `player_started` scenario that is not a reset needs its own wording.
2. **"Fair instinct" wrong-mark lines are per type** (UI_SPEC §8.2): caller ID "…a faked number can show the same saved name…" (fact-check wording, T-2.7 review), sender "…a real message shows the same name…", logo "…a real message shows the same logo…", each ending "so it can't tell you which this is."
3. **The spotting tier hint drops "to reach silver"**: "Spot at least {n} red flags. Each mark on a safe detail takes one off. Your count: {net}." It sits under "To reach silver next time:" or "To reach gold next time:", which already names the tier.
4. **No tutorial grace on timer expiry.** A timer running out is not a choice, so it scores the star table (timer_expiry = dismiss) in slot 0 too. **Superseded in part (Berlin QA ruling, T-2.8):** on a genuine high-stakes message the expiry scores ★ and 5 points in every slot, slot 0 included (`timer_expiry.genuine_high`); the copy is `deadline_genuine` with `{deadline}` = the scenario's `honest_deadline`. Fraud expiry still scores as dismiss. **Producer ruling (T-2.8, from the sceptic review):** both `tutorial_grace` cells are now ★ and 5 points, so a deliberate "Close the page and try later" in Home is never worth less than letting the timer run out. **QA T-2.8 M1:** the opener's `proceed` (a setup step: `proceed` with `next_beat` from a beat with `request: none`) is never recorded as a decision, so an expiry on the next beat scores as the expiry (★, 5), not as the opener's ★★★.

The decoy reveal rule (docs/CONTENT_GUIDE.md) is applied to every Home decoy and padlock reveal (T-2.7). **Review round 1 (producer ruling):** "It fits:" opens a reveal only where the check result really differs between real and fake (a matching owner part of a sender or link domain, a saved contact, something the player started). Details that look the same either way (display names, logos, reference numbers, padlocks, caller ID, normal-looking numbers) use the neutral decoy wording on genuine messages too, so a reveal's opening words never give the verdict away. The padlock reads the same on every page (validator). The "Next time" pointer is "Next time: call a number you know." (7 words): reporting scores ★★ like "Leave it there", so it points to the ★★★ habit.

**T-2.4a rulings (game-designer, 2026-11-18):**
1. **0-3 is difficulty 2** (was 1). The chapter uses 2 for 0-4 and the boss, so difficulty parity (§6) needs a genuine scenario at 2. A high-stakes genuine message that must be acted on is a fair "2"; 0-1 stays the genuine at 1.
2. **0-3 opens on the browser** ("check your inbox" page), then the reset email. Accepted: it makes "you started this" visible instead of told, which is the point of the mechanic. The opener beat is setup: its `proceed` ("Go to your inbox") is not the decisive action when the email beat is reached; the email beat's action is. If the player leaves on the opener (`ignore`), that is the decisive action (dismiss). The "things you started" coach mark shows on the opener, the timer coach mark on the email.
3. **0-6 beat 3, interim.** Until T-2.1 ships the "What now?" construct, the call beat offers the checks directly ("Hang up and ask Adaeze" = `ask_someone`, "Hang up, open Waymarker Desk yourself" = `verify_in_app`, "Hang up, call the IT desk you know" = `call_back_known`), and plain "Hang up" ends the beat as dismiss. Each label must start with "Hang up" so the habit (end the call first) is still taught. **Migrate once the construct lands:** beat 3 then offers `share_code`, `hang_up` → "What now?" (`ask_someone`, `verify_in_app`, `call_back_known`, `report`, "Done", now "Leave it there"), matching §6. Not a G2 blocker. **Migrated (T-2.1):** the three checks are now "What now?" verify extras ("Ask Adaeze through the staff directory", "Open Waymarker Desk yourself", "Call the IT desk you know"); the "Hang up" prefix is dropped because the player has already hung up.
4. **Boss beats use `enter_details` ("Log in through the link"), not `open_link`.** Accepted: the label names the whole risky behaviour, so it is honest comply, and boss beats arrive on schedule regardless (§6), so an engage sub-beat adds nothing here. Rule for all bosses until the engine supports in-beat follow-ups: no `open_link` on fraud boss beats; use the comply kind the link leads to, labelled as "<do X> through the link". The `already_clicked.clicked` debrief line still covers players who only opened it in real life.
5. **`keep_quiet` ("Keep it to yourself and hope nobody notices") is OK under Red Line 5.** It names a real, common reaction (embarrassment) as a choice to avoid, without mocking. Condition: when it is picked, the damage-control feedback must not blame; it says "Feeling embarrassed is normal, and it is what scammers count on. Telling IT fast is what limits the damage." (§9).

## 17. Chapter 1 — Berlin
- **Goal:** check deliveries in the official app you open yourself.
- **Shape:** slot 1, difficulty 1–3. 8 scored scenarios: 3 genuine (37.5%) and 5 fraud. Plus 1 drill and 1 arc beat.
- **Patterns** (pending the brief): `smishing-parcel-fee`, fake customs fee, and for the boss `multichannel-support-callback` (parcel → customs invoice → fake bank fraud-team call). Plus 2 callbacks: `card-phishing-payment-failed` (1-6 genuine twin, 1-8; calls back 0-2's look-alike sign-in page and 0-5's card typed into a fake page, now on a shop pretext), and 0-4 Kettle account takeover (`messenger-account-takeover-code`, 1-5).
- **Flavour:** German in-world text (`lang="de"`, inline translation), lockers, the courier **Trundle**, the shop **Thimble & Pine**, neighbour **Jonas**.
- **Parcel-themed scored scenarios:** 4 of 8 (1-1, 1-3, 1-7, boss), never adjacent.
- **Pressure parity:** timer or pusher on 2 of 3 genuine (67%) vs 4 of 5 fraud (80%), a 13-point gap ✓. Every timer is 60 s (the slot-1 length), genuine or fraud; boss beats are 40 s.
- **Difficulty parity:** genuine scenarios at difficulty 1 (1-1), 2 (1-2) and 3 (1-6), matching the fraud range 1–3 ✓.
- **Decoys:** at least 2 per fraud scenario (as authored: 1-3 and 1-7 two, 1-8 three, 1-5 two, boss six; counts in §7.2). The sender or link is a decoy in 1-5 (spoofed Kettle sender name) and in the boss (beat 1 sender name, beat 3 caller ID): 2 of 5 = ceil(5/3) ✓.

| # | Half | Scenario (candidate) | Device | Truth | Diff | Pressure | LOs |
|---|---|---|---|---|---|---|---|
| 1-1 | AM | Trundle: parcel in locker, pick-up code, from the short code, no link | sms | genuine / low (Trundle twin) | 1 | — | LO-01, LO-17 |
| 1-2 | AM | Adaeze: "Tomorrow's briefing moved to 10:00, can you confirm by noon?" with an honest follow-up at a fixed time. Replying "See you at 10" is `proceed`. | messenger | genuine / low (off-focus) | 2 | pusher (fixed schedule) | LO-17 |
| 1-3 | AM | "Address incomplete. Update within 12 h" from a mobile number with a look-alike link | sms | fraud | 1 | — | LO-01, LO-02, LO-03 |
| 1-4 | AM | **Drill: Teo spots one first.** His screenshot of a fake customs text (quoted inspectables). He walks you through sender and link; you can tag along. | messenger | drill | 1 | — | LO-18, LO-01, LO-02 |
| | | *Stop point* | | | | | |
| 1-5 | PM | Callback: "Your Kettle account will be deleted. Send us the 6-digit code we just texted you" | sms | fraud | 3 | timer 60 | LO-05, LO-01 |
| 1-6 | PM | Thimble & Pine: "Payment for your order failed. Update it in your account within 48 h or the order is cancelled" | email | genuine / high | 3 | honest timer 60 | LO-03, LO-17 |
| 1-7 | PM | Customs fee €1.99, pay today or it goes back (template scenario) | sms → browser | fraud | 2 | timer 60 | LO-02, LO-03, LO-04, LO-05 |
| *arc* | PM | Alex on Wordswap: "Your German is better than you think!" | messenger | arc, slot 1 | — | — | LO-14 (seed) |
| 1-8 | PM | Look-alike "Thimble & Pine" payment-failed email with a padlocked login page (padlock = decoy) | email → browser | fraud (twin of 1-6) | 3 | timer 60 | LO-02, LO-03, LO-05 |
| 1-9 **Boss** | PM | You expect real Waymarker documents. Beat 1: fake Trundle SMS with correct-looking details. Beat 2: fake customs invoice email. Beat 3: call showing "Larchwick Bank" from its "fraud team": a suspicious charge is under way, so read out the code just texted or approve the request in the Larchwick app "to stop the charge". Genuine interrupt during beat 3: Jonas says he took a parcel in (unscored; reporting him counts as a genuine report). | sms → email → call | fraud | 3 | boss timers + pusher | LO-01–05, LO-08, LO-16 |

**Notes:**
- 1-6 is high stakes because it asks you to update payment details (`message.request: enter_details`). It has **no separate `proceed` action**. The actions are:
  - `verify_in_app` (open Thimble & Pine yourself and update the card there; ★★★);
  - `comply` (update via the email link; ★);
  - `ignore` (the order is cancelled; 0);
  - `report` (0, −5).
- **Boss beat 3 (1-9), per `docs/patterns/multichannel-support-callback.md` §8:**
  - The caller does **not** ask for the customs invoice to be paid. The request is the code or the in-app approval "to stop the charge". Any number shown is masked or from a range reserved for fiction (Red Line 3); spoofing is never shown, only that it happens.
  - **The code SMS or approval prompt is part of beat 3, not an interrupt.** The scenario-writer picks one variant: a Larchwick code SMS (default; `message.request: share_code`) or a Larchwick approval prompt (`message.request: approve`). It shows as a notification banner inside the call screen, with no actions of its own, so it can't be reported and can never count as "genuine message reported" for silver or gold. Its text says the code or approval is **for a payment**, not a cancellation. That text is the reveal of beat 3's single `request` inspectable (`red_flag: true`). It is not a separate inspectable, so R doesn't change.
  - **Red flag:** the request (read out a code or approve in the app). **Decoys:** the caller ID showing "Larchwick Bank", which may even be the bank's real number; the number the caller quotes as "the number on your card"; the case number. Re-checked at T-2.4b: beat 3 has 1 red flag and 3 decoys; the boss has 4 red flags and 6 decoys; R = 12; the boss is still one of the 2 sender-or-link-decoy scenarios (§7.2).
  - **Actions on beat 3** (≤ 5): Hang up (`hang_up`, pressure target: no), Read out the code (`share_code`, pressure target) or Approve in the app (`approve_prompt`), depending on the variant.
  - **"What now?" after hanging up:** `call_back_known` on the number on the Larchwick card or in the Larchwick app you open yourself = **verify** (★★★); "Call back this number" (the number that just called) = `call_number_in_message` (engage); `report`; "Leave it there" = dismiss (★★).
    - "Call back this number" caps the beat at ★★. The game doesn't play out who answers: that number may be the bank's real one shown on a faked caller ID, so the player can't know whose line it really is. The engage step returns to "What now?" with the note "You can't tell whose line that number really is. Use the number on your card." A verify after that still scores ★★ (engage cap).
    - The layer-1 "You chose" line names this engage action (UI_SPEC §8.1).
  - **QA:** check the load in the 40 s beat (call transcript + code banner + Jonas's interrupt) in a paper playtest. If it's too much, Jonas arrives once the "What now?" step is open.
  - **Debrief, beat 3.** `debrief.layer1.tell`: "the caller wanted your code to 'stop' a charge." `debrief.layer1.what_works`: "hang up, call the number on your card." (17 authored words, inside the UI_SPEC §8.1 budget.) Layer-2 habit and red flags: "Hang up. Call Larchwick back on the number on your card or in the app you open yourself. A real fraud team never needs your code or an approval to stop a payment. Caller ID can be faked, even showing the bank's real number, so you can't tell whose line it is. Read what a code or approval is for."
  - **After a fall:** the `stop` step is calling Larchwick on the number on your card (or blocking the card in the Larchwick app) and asking it to stop or recall the payment; then `report` (police, keep the numbers and times).
  - Beats keep arriving even after a beat-1 verify, so skilled players see the whole boss.
- **Red Line 8 check:** every Berlin scenario is SMS, email, messenger, browser or call. There is no customs *letter*: the customs fee arrives by SMS (1-7) and as an emailed invoice (boss beat 2).
- The delivery-card QR candidate is held as a swap for 1-5 if research doesn't support the Kettle-code callback. If used, the card is only a `letter` carrying a QR code, and the lesson is checking the QR destination (LO-02).

**T-2.4b rulings (game-designer, 2026-11-18):**
1. **§7.2 numbers for the final state are confirmed** with `request` checkable on 1-5 and boss beat 3: max 172, R = 12, silver spotted ≥ 4, gold ≥ 8. The writer's TODO inspectables are added when T-2.3 lands, before merge. R counts scheduled beats only; flags on engage pages count toward spotted but not R (§7.2).
2. **1-5: the private mobile number is the checkable red flag, plus the request; the deadline is a layer-2 text flag.** General rule: **a deadline is never a checkable red flag.** Honest deadlines appear on genuine messages too (1-6's 48 h), so a taggable deadline would either be a tell or punish calibration. Deadlines are taught as pressure (LO-04) in layer 2 and through the timer.
3. **Extra decoys accepted.** 1-1 keeps 3 checkables (count parity with its twin 1-3, so the list length never hints at the verdict). The boss keeps 6 decoys: every visible element is a Check button anyway (§5), and a quoted "number on your card" or a case number answered with the filler "Nothing unusual here" would mislead, so authored decoy reveals are better. §7.2 re-run: rows 6 and 6a change (both still bronze; lucky silver now 1 in 162); 6b unchanged at spotted 2. QA re-runs 6a/6b in the Phase 3 pass as planned.
4. **Second callback is `card-phishing-payment-failed` (1-6/1-8). Accepted.** 1-8 is a look-alike sign-in page on a shop pretext that then asks for the card, so it is the "0-2 credential phishing on a shop pretext" callback, filed under the brief that covers it. §17 Patterns line updated. Gold's off-focus rule is unaffected (1-6 is high stakes).
5. **One layer 1 for the whole boss, from beat 3. Accepted** (beat 3 is the climax and the new pattern; the customs-fee flags are in layer 2). **Condition:** the engine currently renders one "You chose" line per boss beat below 3 stars, which could reach 14 + 17 + 22 = 53 words, while the validator counts one line (39). Rule: **a boss shows at most one "You chose" line in layer 1**, for the beat with the fewest stars; on a tie, the latest such beat (closest to the tell). Per-beat choices go in layer 2 next to each beat's outcome. Hand-off to `frontend-engineer` (engine) and `ux-artist` (UI_SPEC §8.1 wording).
6. **Habit-card examples reviewed and reworded** (`content/habit_cards.yaml`). Rule: **a habit-card example uses only material the player has already seen where the card first appears, or none; it never names a later scenario's pretext or domain, and never puts a scam domain into a genuine debrief.** `read-the-link` (first shown at 0-2; also 1-4 drill and 1-8 fraud) uses 0-2's own hosts. `open-it-yourself` (first shown at 1-3; also genuine 1-6) uses the 0-2 "mailbox full" pretext with no domain, and now also shows the genuine path (a real problem is there too, and you fix it there), which fits 1-6.
7. **English TRUNDLE pusher in a German thread: accepted for merge, schema addition requested (CR-14).** A language switch inside one sender's thread could read as a language tell, which §6/`language_never_red_flag` rules out. When CR-14 lands, the scenario-writer makes the boss pusher German with a translation.
8. **1-8 look-alike: change to the "real name first" form `thimbleandpine.example-account.test`** (owner part `example-account.test`). Reason: 1-3 and 1-7 already use brand-plus-word hosts, so 1-8 at difficulty 3 needs a subtler shape; this repeats 0-4/0-6's trick in Berlin just before the boss's beat 1 uses it, which is reinforcement, not a spoiler. `ux-artist` registers it in `brands.yaml`; the scenario-writer updates the sender, link, page address, reveals ("Read the end"), tell and device tip ("one extra word" no longer fits).
9. **Boss beat 3 load (40 s: transcript, code banner, Jonas at 100 s = 10 s into the beat, caller pusher at 115 s): accepted for merge, the paper-playtest gate stays.** Mitigations already in place: translation and pause freeze the timer, first expiry adds 20 s, screen-reader announcements coalesce, and no score depends on timers. My prediction is that it sits at the limit. If QA finds overload, the pre-agreed fallback applies: Jonas arrives when "What now?" opens (needs an interrupt trigger from `frontend-engineer`); do not move him by `at_seconds` alone, because a fast player could finish the boss before he arrives and lose the payoff.

## 22. Chapter 2 — Amsterdam
*Numbered 22 because §18–§21 were taken; placed here so it sits next to Berlin. §18's Amsterdam paragraph is the old summary; this section replaces it.* Briefs: `docs/patterns/messenger-family-impersonation.md` (FI) and `docs/patterns/task-job-scam.md` (TJ); `docs/patterns/MAP.md` Ch 2. Every red flag, habit and story element below comes from those briefs, and the brief section is cited as FI §n / TJ §n. **The source ids for each scenario are in `docs/patterns/ch2-amsterdam-sources.md`.** They are kept out of this file so the docs brand test passes on ids that contain real organisation names.

- **The chapter habit (H), worded once and reused** (goal line, 2-1 what-works, the card `call-the-number-you-know`, story beat 3): **"Asked by message for money you didn't expect, or to an account that isn't theirs? Call a number you already had."** Every shortened form says who dials and which number, e.g. "a call from me, on the number I already have". **Scope:** requests you didn't agree in person. Money you agreed face to face, paid to the person's own name, is fine to pay (2-6).
- **Goal:** H. For work, the companion line: a real job pays you; it never asks you to pay in.
- **Shape:** slot 2, difficulty 2–3, boss 3. 8 scored scenarios: 3 genuine (37.5%) and 5 fraud. Plus 1 drill and 1 arc beat (slot 2). About 15–17 min in two halves.
- **New patterns (2):** `messenger-family-impersonation` (variant A "new number", variant B "hacked real account", variant C "cloned voice" **as a call only**, FI §2) and `task-job-scam` (TJ). **Callbacks:** none as separate scenarios. 2-8 points back to 1-5 (a taken-over Kettle account is how variant B starts) in layer 2 only.
- **Flavour:** Dutch in-world text (`lang="nl"`, inline translation) on recruiter, shop and bank texts. Family and friends write in English. Bikes, canals, and settling up by payment request (FI §6 NL hooks). Fictional brands only: Kettle, Larchwick Bank (incl. its payment requests), Thimble & Pine, and two new ones (§22.6). Cast: Teo, Noor, Mateus, Jonas, Adaeze, plus the new local **Sanne** (story scenes only, §22.1).
- **Setup line (chapter intro):** "Amsterdam: everyone settles up by payment request, and your travel allowance doesn't go far. You've applied for a weekend shift at the Thimble & Pine warehouse." The player is looking for side income, so a work message feels expected. That is the lever, and it is never presented as naivety (Red Line 5).
- **On-screen numbers (brief caveats):** no statistics at all. The news-only (part-year) and historic figures named in the briefs never appear on screen, and neither source backs a scenario (sources file, "Not used"). No screen says teens are targeted by task scams (TJ §6: that relevance is inferred). Task-scam wording follows the source: **"not enough tasks done, pay more to finish the set or avoid a fine"** (TJ §2.5, §10), never "negative balance".

### 22.1 Story beats (illustrated scenes; never scored)
Scenes are 1–3 illustrated panels with ≤ 25 words each, and skippable. They never hint at a later scenario's verdict. Track S (PLAN.md) owns art and layout.
1. **Arrival (calm).** A canal bridge full of bikes. **Sanne** (19, student, works the desk at your guesthouse) hands over your key and laughs that in Amsterdam "you pay your friends back before the coffee's cold". Panel 2: Sanne says her rent went up, so she is job hunting too; you both applied to the Thimble & Pine warehouse. *Calm.*
2. **The local problem (worried → relieved).** Shown at the half-day stop point, after 2-3 and 2-4. **Sanne tells it in her own words. The panels show no message bubble, phone screen, number or IBAN.** Her mum got a message "from Sanne" on a new number, with Sanne's own photo, asking for money for a broken phone. Sanne worries it was her fault for having a public profile photo. You (≤ 25 words): "Scammers copy photos from anywhere. Locking your profile helps, but this is on them, not you." The last panel shows Sanne relieved. Cast: Sanne. *Worried, ending relieved.*
3. **Mid-chapter turn (worried → determined).** The start of the afternoon. Sanne: "Mum didn't pay. She rang my real number first and I picked up." She'll do the same with her little brother: "Money by message he didn't expect, or to someone else's account? Then he calls me, on the number he already has." This sets up the afternoon's money requests without saying which are real. Cast: Sanne, Noor (on a video call, waving). *Worried, then determined.*
4. **Resolution (relieved).** After the boss. Mateus (real, his saved contact "Mateus (work phone)") sends a "made it" photo from the next city. Sanne and you both got Thimble & Pine interviews. She reads out "paid monthly into your account" and adds: "And if a 'job' wants money first, I walk." Teo calls on his new mobile: "New mobile, me again. Saved it yet?" The closing panel stacks the habit cards "Call the number you already know" (the LO-07 title) and "Easy money costs you". Cast: Sanne, Mateus, Teo. *Relieved.*

Notes: Sanne is a local like Jonas (`content/cast.yaml`, known channel "Guesthouse desk"). She never sends a scored message, and no scam impersonates her in a scored scenario. Her mum's near-miss happens off screen and is resolved by the habit (FI §4, §8 tone: capable parent; the lever is love and urgency).

### 22.2 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 2-1 | AM | Teo: "New mobile, this is me now", asks for nothing | messenger | genuine / low (twin of 2-3) | 2 | — | new-number | LO-07, LO-17 |
| 2-2 | AM | "Easy work" SMS from a "Klaverwerk Staffing recruiter": send a photo of your ID on Kettle to register | sms | fraud (TJ) | 2 | — | job-offer | LO-12, LO-01, LO-03 |
| 2-3 | AM | "Noor" from a new number: phone in the canal, pay €84 into "my new account" today | messenger → banking | fraud (FI-A) | 2 | timer 55 + pusher | new-number | LO-07, LO-06, LO-04, LO-01 |
| 2-4 | AM | **Drill: help Noor lock it down.** Real Noor: "someone pretended to be me?!" | messenger | drill | 2 | — | — | LO-18, LO-07 |
| | | *Stop point + story beat 2* | | | | | | |
| 2-5 | PM | Thimble & Pine: interview slot for the job you applied for; pay "€15.50 an hour, paid monthly"; bring ID on your first day, before you start | email | genuine / low (twin of 2-2, 2-7) | 3 | honest timer 55 | job-offer | LO-17, LO-12 |
| 2-6 | PM | Mateus (saved contact): "Booked the canal boat we talked about at breakfast, €18 each, request's here, no rush" | messenger → banking | genuine / high (twin of 2-8) | 3 | pusher (honest) | friend-money | LO-17, LO-07 |
| *arc* | PM | Alex suggests moving the chat to Kettle (§10.1 slot 2) | messenger | arc, slot 2 | — | — | — | LO-14 |
| 2-7 | PM | **Easy-work thread:** recorded call → Kettle "mentor" → trial with a €6 payout → "not enough tasks done: top up €40 to finish the set" | call → messenger → browser → browser | fraud (TJ) | 3 | timer + pusher | job-offer | LO-12, LO-02, LO-04, LO-18, LO-16 |
| 2-8 | PM | Jonas's **real** Kettle account (taken over): "pay my rent share straight to my landlord today, on a quiet train, can't talk" | messenger → banking | fraud (FI-B) | 3 | timer 55 + pusher | friend-money | LO-07, LO-06, LO-01, LO-16 |
| 2-9 **Boss** | PM | Last evening; Mateus is on a flight to the next city. Beat 1: KLAVERWERK SMS, "activate your task account with a €30 starter top-up". Beat 2: "Mateus", new number, landed, phone and wallet stolen, pay the hotel's payment request. Beat 3: a call from that number in a voice that sounds like Mateus. Genuine interrupt after beat 3: the real Mateus. | sms → messenger → call | fraud (TJ + FI-A + FI-C) | 3 | boss timers + pusher | new-number | LO-12, LO-07, LO-04, LO-03, LO-02, LO-16 |

**Mix checks.**
- **Genuine share:** 3 of 8 = 37.5% ✓. **Twins:** 2-1↔2-3, 2-6↔2-8, 2-5↔2-2/2-7 ✓.
- **Truth runs:** G F F · G G F F F, so at most 3 in a row ✓.
- **Theme share:** job-offer 3, new-number 3 (2-1, 2-3, boss), friend-money 2. None above 4 of 8, and no two of the same theme are adjacent ✓.
- **Pressure parity:** genuine 2 of 3 (2-5, 2-6) = 67% vs fraud 4 of 5 (2-3, 2-7, 2-8, boss) = 80%, a 13-point gap ✓. The first two scenarios are deliberately calm (one genuine, one fraud).
- **Timers:** 55 s (slot 2) on every timed standard beat, genuine or fraud. Call beats 30 s. Boss beats 40 s.
- **Difficulty parity:** levels 2 and 3 used. Genuine at 2 (2-1) and 3 (2-5, 2-6) ✓.
- **Decoys:** every fraud scenario has ≥ 2 (§22.4). Sender or link as a decoy in 2-2 (link), 2-7 (caller ID and link), 2-8 (sender) and the boss (beat 1 sender name, beat 2 link) = 4 ≥ ceil(5/3) = 2 ✓.
- **Off-focus genuine:** none. All three genuine scenarios mirror a chapter pattern, so verifying them never costs gold (QA L2). See open question 6.

### 22.3 Scenario specs
Shared rules for this chapter: action order follows the validator (`action_order`). Labels describe behaviour. Phone numbers are masked (`+31 6 •• •• •• 17`). IBANs are checksum-invalid and masked. Payee names on scam accounts are an initial plus a masked surname (`R. ••••`), never a public figure. "R" = red flag in R, "D" = decoy, "G" = a genuine message's own detail. `request` and `claim` checkables need CR-17. **Every scored scheduled beat in this chapter has a `request` checkable, genuine or fraud** (CR-17 trigger), so "always tag the request" can't tell twins apart (§22.4).

**Damage control (all falls):**
- At most 6 options, exactly 2 of them harmful (§9).
- `tell_trusted_adult` ("Tell a parent or trusted adult now (if you're under 18)") counts as `stop` in 2-2, 2-3, 2-7, 2-8 and the boss, next to the scenario's own stop step. Several `stop` entries are allowed, as in 1-9's `code_read_out`.

**2-1 Teo's new mobile** (`amsterdam-01-teo-new-number`; genuine, low; messenger; diff 2; Kettle; cast Teo)
- **Message:** from an unknown number with Teo's profile photo: "Hello, it's Grandad. New mobile, the shop moved my contacts over. This is my number now; the home phone stays the same. Save it before you forget! T." `request: reply`, with `ask` = "Save it before you forget!"
- **Checkables (G):**
  - `sender.detail`: "Not in your contacts: a new number, not Teo's saved one. People do change numbers; on its own that isn't a warning sign…"
  - `image`: the profile photo, neutral ("…photos are easy to copy, so it can't prove anything either way").
  - `claim` "the home phone stays the same": "…a number you already have, so you can check with it if you like."
  - `request`: "It asks you to save a new number. No money, no code, no link."
- **Actions:**
  - "Save the number and reply" (`proceed`, pressure target) ★★★.
  - "Call Teo's home number first" (`call_back_known`) ★★★. Outcome: Teo laughs, "That's exactly what I'd have done."
  - "Report the message" (`report`) 0, −5.
  - "Ignore it" (`ignore`) ★★.
- **Debrief:**
  - Tell: "Asks for nothing."
  - What works: H, in full. Layer 1 is 24 authored words; the validator checks the 40-word budget with the longest choice line. If it is over, the scenario-writer shortens the tell, never H.
  - Layer 2, why it was safe to act: it asked only to save a number, and the home line you already had still works. The tell is never a new number alone; it is **new number + money + no call** (FI §7). Then: **"Scam chats can start like this too and ask for money days later. That's when you call."** (FI §2.A).

**2-2 "Easy work": send your ID** (`amsterdam-02-id-photo`; fraud; sms; diff 2; calm; brands Klaverwerk Staffing (new), Kettle)
- **Message:** an SMS in Dutch from a mobile number. A "recruiter at Klaverwerk Staffing" offers remote product-rating work, "€150 a day for one hour, no experience needed", and asks you to "send a photo of your ID on Kettle to register". It names Klaverwerk's real site and a vacancy number. You never applied to Klaverwerk. `request: enter_details`.
- **Red flags (TJ §3):**
  - **R** `sender.detail`: a job offer you didn't ask for (TJ §3.2).
  - **R** `claim`: high pay for little time, no experience (TJ §3.3).
  - **R** `request`: **an ID photo demanded by chat from a recruiter you can't check** (TJ §3.8).
- **Decoys:**
  - **D** `link` klaverwerk-staffing.example, Klaverwerk's real site. Neutral: "…naming a real company's site costs nothing, so it can't prove anything either way." Accepted by the producer (answer 3).
  - **D** `reference`: the vacancy number.
- **Habit:** look the agency up yourself; never send an ID copy to a chat "recruiter" (TJ §4).
- **Actions:**
  - "Send a photo of your ID on Kettle" (`enter_details`, target).
  - "Look up Klaverwerk Staffing yourself" (`verify_in_app`). Outcome: you type klaverwerk-staffing.example. "Klaverwerk never asks for money, and checks your ID itself when you start work, never through a chat app."
  - "Report the text as spam" (`report`).
  - "Delete the text" (`delete`).
- **Fall → damage control (6, 2 harmful):** `report_id_copy` (stop), `tell_trusted_adult` (stop), `keep_evidence` (secure), `report_to_police` (report), harmful `reply_to_sender`, harmful `keep_quiet`.
- **Debrief:**
  - Tell: "A job you never applied for wants your ID by chat."
  - What works: "Look the agency up yourself."
  - Layer 2: showing ID when you start a real job is normal (see 2-5). An ID photo sent by chat to a recruiter you can't check isn't (TJ §7).

**2-3 "Noor", new number** (`amsterdam-03-noor-new-number`; fraud, FI-A; messenger → banking; diff 2; timer 55; pusher at 25 s "??" and 45 s "please it has to be today 😭"; Kettle, Larchwick; cast Noor (impersonated; the real Noor appears in the verify outcome))
- Unknown number with Noor's photo: her phone fell in the canal, this is her new number. Her banking app isn't set up on the new phone. Can you pay €84 for the repair into "my new account" today? She'll pay you back tomorrow. She can't call yet because the new phone isn't set up for calls. The IBAN is in the text. `request: pay`. Levers: affection, urgency.
- Red flags (FI §3): **R** `sender.detail` (a known person on an unknown number, FI §3.1; it opens with the same words as 2-1's reveal). **R** `request` (money by message, today, FI §3.2–3). Decoys: **D** `image` (profile photo copied, FI §2.A). **D** `claim` "I'll pay you back tomorrow, promise" (FI §2 lever; neutral). Layer-2 text flags: the "can't call" excuse (FI §3.4) and the deadline.
- **Banking beat** (reached by `start_transfer`, class `step`; not in R). You type Noor's saved name and the IBAN from the chat.
  - **Payee check: no match.** The banner shows a warning, **never a name**: for private persons, a no-match doesn't reveal the holder (producer answer 3; a close match would show the name).
  - `payee.name_check` is a red flag (FI §3.5). `payee.iban` is a decoy.
- **Habit:** H. A call from you, on the number you already have for Noor (FI §4).
- **Actions (message):**
  - "Pay her in the Larchwick app" (`start_transfer`, target → banking beat).
  - "Call Noor's saved number" (`call_back_known`). Outcome: Noor picks up in a lesson break, "Canal?? My phone's right here."
  - "Report the chat" (`report`). Outcome: "Reported. Now tell the real Noor, with a call to her saved number, so she can warn the family."
  - "Ignore it" (`ignore`).
- **Actions (banking beat):**
  - "Send €84 anyway" (`pay`).
  - "Cancel and call Noor's saved number" (`call_back_known`) ★★★. Verdict line: **"The name check caught it. Good stop."**
  - "Cancel" (`ignore`) ★★.
- **Fall → damage control (6, 2 harmful):** `call_bank_stop_payment` (stop), `tell_trusted_adult` (stop), `report_to_police_online` (report), `tell_real_person` (warn), harmful `pay_second_request`, harmful `reply_ask_money_back`. The fall narrative shows a second request (FI §3.6).
- **Debrief:**
  - Tell: "Noor's name, a new number, money today, no call."
  - What works: "A call from you, on Noor's saved number."
  - Already paid: "Call your bank now on the number on your card (with a parent or trusted adult if you're under 18). Save the chat, then report it. Don't pay a second request."
  - Layer 2: save the chat first and report it in Kettle **last**, because it disappears (FI §5.6).

**2-4 Drill: help Noor lock it down** (`amsterdam-04-noor-lock-down`; drill; messenger; Noor's saved contact)
- The real Noor: "Mum says someone's texting the family as me from a new number 😳 Did you get one? How do I stop it happening again?" The text works whatever the player did in 2-3. You pick advice. Each pick gets a Noor reply; there are no stars.
- **Good picks** (FI §4 prevention):
  - Turn on Kettle's two-step PIN.
  - Share fewer photos and family details publicly. Noor's reply frames it as lowering risk, not blame: "ok, fewer for them to copy. still their fault though, right?" You: "Right."
  - Agree as a family that money requests mean you call them, on the number you already have, plus a question only you'd know.
- **Weak pick:** "Just ignore it". Noor: "and let them try Grandad next? nope."
- **Pick "I paid it, actually 😬"** (the player speaks for themselves). Noor: "not your fault, it's built to fool people who care. call the bank now, and tell a parent or someone you trust." This opens the generic "Already paid?" steps; nothing is scored.
- Noor closes with "also I'm looking for a summer job, if you hear of anything 👀". This seeds the finale (§18 Brussels) without a lesson here.
- The family code word stays in Rome (§18).

**2-5 Thimble & Pine interview** (`amsterdam-05-warehouse-interview`; genuine, low; email; diff 3; honest timer 55, `honest_deadline` "Reply by 17:00 today to get a Thursday slot"; Thimble & Pine; you started it: you applied)
- **Message:** a Dutch email from jobs@thimbleandpine.example. Thanks for your application for weekend warehouse assistant; "can you do a 15-minute video call on Thursday, 10:00 or 14:00?" Then: "€15.50 an hour, paid monthly into your account. Please bring your ID on your first day, before you start." The application link is on thimbleandpine.example. `request: reply`, with `ask` = the video-call sentence.
- **Pay rate:** €15.50, above the Dutch adult minimum wage (checked by fraud-researcher on business.gov.nl, 2026-11-19; never shown on screen). If the fact-check prefers, the rate is dropped rather than changed.
- **Checkables (G):**
  - `sender.detail` and `link`: "It fits: Thimble & Pine's own domain, and the job you applied for…"
  - `reference`: the application number, neutral.
  - `claim`: the pay, neutral ("Shows the pay: €15.50 an hour, paid to you monthly… not proof on its own").
  - `request`: "It asks you to pick an interview time. No money, no ID photo by chat."
- **Actions:**
  - "Reply: Thursday 14:00 works" (`proceed`, target).
  - "Check the application in your Thimble & Pine account" (`verify_in_app`). Outcome: "You open thimbleandpine.example yourself. Your application says 'Invited to interview', with the same two Thursday slots. A good habit, and this time a reply would have done."
  - "Report the email" (`report`).
  - "Leave it for now" (`ignore`).
- **Debrief:**
  - Tell: "You applied, it pays you, it asks nothing up front."
  - What works: "Reply as normal."
  - Layer 2: showing ID in person when you start is normal. The scam tells are paying in, or an ID photo demanded by chat from a recruiter you can't check (TJ §7).

**2-6 Mateus: boat-tour share** (`amsterdam-06-boat-tour-share`; genuine, high; messenger → banking; diff 3; pusher at 30 s "No rush! I'm settling up with everyone tonight"; Kettle, Larchwick payment requests; cast Mateus)
- **Message:** from the saved contact "Mateus (work phone)" (`content/cast.yaml`). "Booked the canal boat we talked about at breakfast, Saturday 16:30 🙂 €18 each. Request's here: larchwick-bank.example/pay/…". You agreed this in person, so the card's scope (requests you didn't agree in person) doesn't apply. `request: pay`.
- **Checkables (G):**
  - `sender.detail`: saved contact, **neutral** (ruling 1, §22.8).
  - `link`: Larchwick's real domain, **neutral** (ruling 2).
  - `reference`: the booking, "Sat 16:30, 4 tickets".
  - `request`.
- **Banking beat** (payment-request page, reached by `start_transfer`, class `step`): "Request from Mateus Ferreira · €18 · Canal boat".
  - **No payee check runs on a request page**, because you don't type an IBAN and a name.
  - The `payee.name` checkable (today's target `payee.name_check`, with no `name_check` result set): "The request page shows who gets the money: Mateus Ferreira. That shows whose account it is, so it can't prove the message is from him."
- **Actions (message):**
  - "Open the request in the Larchwick app" (`start_transfer`, target).
  - "Call Mateus on his saved work phone first" (`call_back_known`). Outcome: "Mateus picks up: 'Yes, that's me, no rush.' A call never hurts, and this time paying straight away would have been fine too."
  - "Report the message" (`report`).
  - "Ignore the request" (`ignore`).
- **Actions (banking beat):**
  - "Pay €18" (`proceed`) ★★★.
  - "Decline the request" (`ignore`): dismiss on genuine high stakes, 0 stars. Verdict: "You declined money you'd agreed to pay, and it really was Mateus."
- **Scoring unchanged:** proceed and verify both earn ★★★.
- **Debrief, which leads with the habit:**
  - Tell: "Money you agreed, to his own name: fine to pay."
  - What works: "A call never hurts."
  - Layer 2: why it was safe (agreed in person, his own name on the request page, nothing urgent). H applies to requests you didn't agree in person.

**Arc, slot 2** (`amsterdam-arc-alex-02`). As in §10.1–10.2 (stay on Wordswap / move / mention it to Teo). It sits just before 2-7 on purpose: 2-7's "save this number and move to Kettle" debrief makes the arc's warning sign readable in hindsight, without unmasking it.

**2-7 Easy-work thread** (`amsterdam-07-easy-work`; fraud; call → messenger → browser → browser; diff 3; timer on (30 s call beat, then the slot length; frontend to confirm per-beat lengths in a single group); brands Klaverwerk Staffing (claimed), Tallyfern (new, scam platform), Kettle, Larchwick; cast Teo (the trusted person); levers `greed`, `fear`, `urgency`, `small_amount`)
- **Pushers, bound to beats (CR-21):**
  - On `mentor_chat`, 40 s after it opens: "Still there? 😊 Today's task spots fill up fast".
  - On `top_up`, 20 s after it opens: "Only 11 tasks to go! Finish before midnight or the fine applies". This one never fires on the clock alone, so a player who stopped earlier never sees it. Interim until CR-21: drop it.
- **Lever gap:** the brief's sunk-cost lever ("pay this one fee and you get it all back") has no enum value. Fear + greed is accepted for now; sunk cost is noted for a later review of the lever set.
- This is the recruitment → small payout → deposit thread (TJ §2, §8). Four beats chained by the player's own engage choices:
  1. **start (call, recorded message, CR-20):** "flexible online work, about an hour a day, €100 to €300 a day, no experience needed… save this number and send us a message on Kettle". It names Klaverwerk's real site. `request: reply`. Checkables: **D** `caller_id` (unknown number, neutral: real recruiters call from numbers you don't have). **D** `link` (klaverwerk-staffing.example said in the recording; producer answer 3). **R** `claim` (the pay offer, TJ §3.3). **R** `request` ("save this number and send us a message on Kettle", TJ §3.4; also TJ §3.2, unsolicited). Actions: "Save the number and message them on Kettle" (`reply`, engage → `mentor_chat`, target). "Hang up" (`hang_up`) → "What now?" with the extra "Look up Klaverwerk Staffing yourself" (verify) and the built-ins report and "Leave it there".
  2. **mentor_chat (messenger):** the "mentor" (a role title, never a name) explains rating hotels, 30 tasks a day, and three free trial tasks paid straight away: tallyfern-earn.example/trial.
     - Actions:
       - "Open the link and try the trial" (`open_link` → `trial_payout`).
       - "Look up Klaverwerk Staffing yourself" (`verify_in_app`). Outcome: "You type klaverwerk-staffing.example. No 'mentor', no rating work, and a notice: 'We never ask you to pay, and we don't hire through chat apps. Got a message in our name? Call us on the number on this page.' You stop replying."
       - "Block and report" (`block`).
       - "Stop replying" (`ignore`).
     - Flag: `link` (a site you don't know, not Klaverwerk's).
  3. **trial_payout** (browser training page + banking banner "You received €6.00 from TALLYFERN"): "Trial complete! €6.00 paid. Today's set: 30 tasks." Debrief note: a small early payout is part of the trick, not proof (TJ §3 note).
     - Actions:
       - "Start today's 30-task set" (`open_link` → `top_up`).
       - "Ask Teo what he thinks" (`ask_someone`). Outcome: "Teo rings back at once: 'Six euros to try it? Clever. They'll want money from you next, you'll see. Real jobs pay you, full stop. Glad you asked before going further.'" No blame for playing along.
       - "Close the site" (`ignore`).
  4. **top_up** (browser training page, "two hours later"): "Task 19 of 30. Not enough tasks done to finish the set. Top up €40 to continue and unlock your €86.40. Unfinished sets get a €25 fine." `request: pay`.
     - Checkables: `request` red flag (pay to earn, TJ §3.1, §3.6). `page.address` red flag. `page.info` padlock decoy (shared wording).
     - Actions (≤ 5):
       - "Top up €40 to finish the set" (`pay`, target).
       - "Stop and ask Teo" (`ask_someone`). Outcome: "Teo: 'Pay to get paid? No. You did the right thing stopping here, love. Plenty of people get pulled in this far; it's built that way. Close it, and keep the chat in case you report it.'"
       - "Look up Klaverwerk Staffing yourself" (`verify_in_app`). The outcome is the same as on beat 2, plus: "The €6 was bait."
       - "Report the site" (`report`).
       - "Close it and stop" (`ignore`).
- **Scoring:** verify at the call = ★★★. Each engage caps the scenario at ★★, so stopping at the top-up with a verify is ★★ (ruling 4). The fall narrative follows the source: "Set complete! Bonus set unlocked: top up €120 to withdraw." The amounts keep growing (TJ §2.5).
- **Fall → damage control (6, 2 harmful):** `stop_paying` (stop), `tell_trusted_adult` (stop), `call_bank_known_number` (secure), `contact_fraud_helpline` (report), harmful `pay_last_fee`, harmful `keep_quiet` (feedback: "Feeling embarrassed is normal… there is no need to feel ashamed", TJ §5).
  - Police reporting stays generic and sits in layer 2, because online reporting for job fraud isn't confirmed (TJ §10).
  - `pay_recovery_service` is dropped here. Layer 2 still warns about paid "recovery" offers (TJ §5.7).
- **Debrief:**
  - Tell (true at every exit point: call, chat, payout or top-up): **"A job you never asked for, pay too good to be true, and a fee before you get paid."**
  - What works: "A real job pays you. Stop and ask."
  - Layer 2 adds **"If you'd kept going"**, a 4-step timeline (offer → move to Kettle → €6 payout → top-ups that keep growing), so players who stopped at the call still see the whole turn.
  - Already paid: "Stop paying: no last fee releases the money. Tell a trusted adult, call your bank on the number on your card, keep the chats."
  - Pointer: "If a 'job' ever wants to use your bank account, that's a different trap" (Brussels; TJ §6).

**2-8 Jonas's real account** (`amsterdam-08-jonas-rent`; fraud, FI-B; messenger → banking; diff 3; timer 55; pusher at 30 s "You there? Landlord's waiting 😬"; Kettle, Larchwick; cast Jonas)
- Jonas's saved contact in your usual chat. `earlier[]`: "Last week · Jonas: Have a good trip to Amsterdam! 🚲". Message: his banking app is blocked since an update and his rent share is due today. Could you pay it straight to his landlord's account (IBAN, "K. ••••")? He'll send it back tomorrow. He's on a quiet train and can't talk. `request: pay`.
- Red flags (FI §3): **R** `request` (money by message, to someone else's account, today, FI §3.2, §3.3, §3.5). **R** `claim#1` "on a quiet train, can't talk" (avoids a call, FI §3.4). Decoys: **D** `sender.detail` (saved contact, neutral per ruling 1: "…an account can be taken over and show the same contact, so it can't prove anything either way. Judge the request."). **D** `claim#2` "I'll send it back tomorrow".
- **Banking beat** (reached by `start_transfer`, class `step`). The payee name field is **prefilled from the chat and masked ("K. ••••")**. The full name never appears anywhere: chat, field, banner or reveal.
  - The typed name is exactly the account name, so the result is a clear **"Name matches"** (FI §3.5).
  - `payee.name_check` is a decoy, neutral: "…shows whose account it is, not whether the story is true."
  - This is the chapter's misleading-match moment (LO-06).
- **Habit:** H. A call from you, on Jonas's saved number, as a normal phone call (FI §4, variant B).
- **Actions (message):**
  - "Pay the landlord in the Larchwick app" (`start_transfer` → banking, target).
  - "Phone Jonas (a normal call, not in Kettle)" (`call_back_known`). Outcome: Jonas at work, "My Kettle logged me out this morning…"
  - "Report the chat" (`report`). Outcome: "Reported. Now phone Jonas, a normal call, so he can get his account back."
  - "Ignore it" (`ignore`).
- **Actions (banking beat):**
  - "Send €350" (`pay`).
  - "Cancel and phone Jonas (a normal call)" (`call_back_known`) ★★★. Verdict line: "A match only shows whose account it is. Your call settled it. Good stop."
  - "Cancel" (`ignore`) ★★.
- **Fall → damage control (6, 2 harmful):** `call_bank_stop_payment` (stop), `tell_trusted_adult` (stop), `tell_real_person` (warn: Jonas, so he can recover his account and warn his contacts, FI §5.7), `report_to_police_online` (report), harmful `pay_second_request`, harmful `reply_to_sender`.
- **Debrief:**
  - Tell: "His real chat, but money to someone else today, and no call."
  - What works: "A call from you, on Jonas's saved number."
  - Layer 2:
    - **"A Kettle call goes to whoever holds the Kettle account, and right now that may not be Jonas. A normal phone call goes to his SIM."** (FI §4 variant B).
    - It calls back 1-5: a passed-on code is how accounts like this get taken over; turn on the two-step PIN.
    - A matching name shows whose account it is, not that the story is true.

**2-9 Boss: last evening** (`amsterdam-09-boss-last-evening`; fraud; sms → messenger → call; diff 3; beats 40 s; Klaverwerk, Tallyfern, Kettle, Larchwick; cast Mateus)
- **Setup:** Mateus is on an evening flight to the next city, and his phone is off until he lands. You're packing, and your phone keeps going. Two scams land on one evening. No source describes them as one combined pattern, so the boss is **two sourced patterns side by side** (producer answer 1), joined by one habit.
- **Beat 1 (sms, at 0):** sender name KLAVERWERK. "Your profile is approved for paid review tasks. Activate your task account with a €30 starter top-up, paid back with your first pay." Link to tallyfern-start.example. `request: pay` (TJ §2.5: pay in first to get tasks).
  - Checkables: **R** `link` (not Klaverwerk's site). **R** `request` (pay to earn). **D** `sender.detail` (any sender can set the name KLAVERWERK; neutral; spoofed sender names per the EPC source). **D** `reference` (profile number).
  - Actions:
    - "Pay the €30 top-up through the link" (`pay`).
    - "Look up Klaverwerk Staffing yourself" (`verify_in_app`). Outcome: "You type klaverwerk-staffing.example. No task accounts, no top-ups: 'We never ask you to pay.' Then Kettle pings."
    - Report.
    - Delete.
- **Beat 2 (messenger, +45 s):** "Mateus" from a new number with his photo. He's landed, phone and wallet stolen at the airport, on a borrowed phone. Can you pay the hotel's €260 payment request (larchwick-bank.example/pay/…)? He'll pay you back. `request: pay` (FI §2: stranded abroad, payment-request link, someone else's account).
  - Checkables: **R** `sender.detail` (a new number, not his saved contact "Mateus (work phone)"). **R** `request`. **D** `link` (Larchwick's real domain, neutral, ruling 2). **D** `image`.
  - **Actions:**
    - "Open the request in the Larchwick app" (`start_transfer`, class `step`, target → `hotel_request`).
    - "Call Mateus on his saved work phone" (`call_back_known`). Outcome: "No answer: his phone is off, he's still in the air. Can't reach him? Then don't pay. You message Adaeze through the staff directory. Adaeze replies: 'He lands at nine. Whoever that is, it isn't him.'"
    - "Report the chat" (`report`).
    - "Ignore it" (`ignore`).
  - **`hotel_request` (banking, request page, not scheduled):** "Request from **R. ••••** · €260 · 'Hotel'". The person's name is masked. It is never "Mateus" and never a hotel.
    - **No payee check runs on a request page.** `payee.name` red flag: "The request page shows who gets the money: R. ••••. Not Mateus, and not a hotel."
    - Actions:
      - "Pay €260" (`pay`).
      - "Close it and call Mateus on his saved work phone" (`call_back_known`), with the same outcome as above.
      - "Close it" (`ignore`).
  - Pusher: "please, they need it before 22:00".
- **Beat 3 (call, +45 s, `timer_seconds: 40`, `covered_by: [beat 2]`):** a call from that new number. The voice sounds like Mateus: "It's me! Did you see my message? Please just pay the request now… I can't hear you well."
  - **Transcript is the main mode.** Audio is **off by default and opt-in**. It is a voice actor, never a synthetic copy of a real voice. The voice is urgent but not crying or panicked, with no distress sound effects. It is never used to teach "robotic" artefacts (FI §3 note).
  - Checkables: **R** `caller_id` (the same new number). **R** `request` (the ask line). **D** `claim` "It's me, Mateus" (neutral: "Sounds like him and says it's him, as a real call would. Voices can be imitated with AI, so it can't prove anything either way.", FI §3.7). **D** `reference` (a hotel booking number).
  - Actions: "Pay the request now" (`pay`). "Hang up" (`hang_up`) opens "What now?":
    - `call_back_label` "Call Mateus on his saved work phone" (verify). Outcome: "No answer, he's still in the air. Can't reach him? Then don't pay. Try someone close, like Adaeze."
    - Extra "Ask Adaeze through the staff directory" (`ask_someone`, verify). Outcome: "Adaeze: 'He lands at nine. Don't pay anything.'"
    - Extra "Call back this number" (engage). Note: "That's the number that just called. Only a number you saved tells you who answers."
    - Report.
    - "Leave it there".
- **Interrupt (`after_beat` beat 3, genuine):** the real Mateus, from his saved contact: "Hotel wifi finally 🙂 All fine here, see you Monday!" Actions:
  - "Reply: glad you're OK, someone's using your photo" (`proceed`).
  - "Report the message" (`report`). This counts as a genuine report. Its outcome uses the over-caution copy: "You reported it. Careful is good; this one really was Mateus, back online."
- **Counts:** R = 6 (2 per scheduled beat), decoys 6, boss max 51. The `hotel_request` flag counts toward spotted, not R.
- **Layer 1 for the whole boss and the Amsterdam stamp screen** (producer ruling; this replaces every other boss wording):
  - Tell: **"Two strangers wanting money first: one as a job, one as Mateus."**
  - What works: **"Asked to pay first? Check it yourself, on a number or site you already know."**
- **Layer 2, per beat:**
  - Beat 1: "A real job pays you; it never asks you to pay in."
  - Beat 2: "The request page showed R. ••••, not Mateus." A request page doesn't run the bank's name check. **No debrief says the name check would have caught beat 2.**
  - Beat 3: **"You don't have to tell a fake voice from a real one. Your call-back does that."**
- **After a fall,** damage control runs from the first fallen beat (6 options, 2 harmful):
  - Beat 1: the 2-7 list.
  - Beat 2/3: the 2-3 list (`call_bank_stop_payment` and `tell_trusted_adult` as stop).

### 22.4 Strategy check (Amsterdam)
**Assumptions.**
- CR-17 and CR-18 have landed. R counts scheduled beats only (§7.2). Flags on beats reached by `start_transfer` or engage count toward spotted, not R: the 2-3, 2-6 and 2-8 banking beats, boss `hotel_request`, and 2-7 beats 2–4.
- **`start_transfer` is class `step`** (producer ruling, shared with Paris): non-terminal, never decisive, no star cap. The banking beat's own action decides.
- **Checkables (scheduled beats).** Every scored scheduled beat has a `request`.
  - Fraud: 2-2 has 5 (R 3, D 2). 2-3, 2-7 and 2-8 have 4 each (R 2, D 2). Boss beats 1–3 have 4 each (R 2, D 2).
  - Genuine own details: 2-1 has 4 (sender, image, claim, request). 2-5 has 5 (sender, link, reference, claim, request). 2-6 has 4 (sender, link, reference, request). 13 in total.
- **Max:** 2-2 = 15 + 6 = 21; 2-3, 2-7 and 2-8 = 19 each; genuine 3 × 15; boss 51. Total **174**.
- **R** = 3 + 2 + 2 + 2 + 6 = **15**. Silver needs spotted ≥ **5**; gold needs ≥ **10**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed on genuine | 78 + 45 + 51 | 174 | 100% | 15 | **Gold** |
| 2 | Ideal + verifies all 3 genuine (all in focus) | same | 174 | 100% | 15 | **Gold** |
| 3 | Curious ideal: plays 2-7 along to the top-up, then asks Teo | 174 − 5 (engage cap) | 169 | 97.1% | 15 | **Gold** |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (16+14+14+14) + (30+6) + 45 | 139 | 79.9% | 15 | Silver |
| 5 | Ideal but reports Teo's new number | 174 − 15 − 5 | 154 | 88.5% | 15 | Silver |
| 3a | Ideal via the bank app: starts the transfer or opens the request in 2-3, 2-6, 2-8 and boss beat 2, then verifies (fraud) or pays (2-6) on the banking beat; tags only red flags | `step` never decides or caps | 174 | 100% | 15 (+ engage/step-page flags, e.g. 2-3 no-match) | **Gold** |
| 3b | As 3a, but closes the banking beat on fraud with "Cancel" | 174 − 5 (2-3) − 5 (2-8) − 5 (boss beat 2, ★★) | 159 | 91.4% | 15 | **Gold** |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 86.2% | 15 − (14 + 13) = −12 | Bronze |
| 6a | Random single tag per beat + always verify (expected) | 150 + 1.2 + 3 + 0.75 | ≈155 | ≈89.1% | 3.6 − (3.4 + 3) ≈ −2.8 | Bronze. Silver impossible even with perfect luck: all 7 fraud hits nets 7 − 3 = 4 |
| 6b | Always tag sender/caller ID + link + always verify | 150 + 2 (2-3 only; 2-2, 2-7, 2-8, boss void) | 152 | 87.4% | 5 − 11 = −6 | Bronze |
| 6c | **Always tag the request** + always verify | 150 + 4 × 2 + 6 | 164 | 94.3% | 7 − 3 = 4 | Bronze (silver needs 5) |
| 6d | Always tag request + every claim + always verify | 150 + 4 (2-2) + 4 (2-7); 2-3, 2-8, boss void | 158 | 90.8% | 10 − (3 + 5) = 2 | Bronze |
| 7 | Blind always-verify (± pause) | 60 + 45 + 45 | 150 | 86.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 31.6% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 10 + 10 + 0 | 90 | 51.7% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 51.7% | 0 | Bronze |

Row 6a in detail:
- Hit chance per fraud tag: 2-2 ⅗; every other scheduled fraud beat ½.
- Expected correct tags = 0.6 + 6 × 0.5 = 3.6.
- Expected bonus = 1.2 + 3 × 1 + (⅛ × 6).
- Every genuine tag is wrong.

Row 6b: wrong tags are 2-2 link, 2-7 caller ID and link, 2-8 sender, boss beat 1 sender and beat 2 link (6), plus genuine sender/link (2-1: 1, 2-5: 2, 2-6: 2).

Row 6c: every fraud request is a red flag (7 correct), and every genuine request is the message's own detail (3 wrong). This is why 2-1 and 2-5 got a `request` checkable: without them the row netted 6, which is silver.

Row 6d: the wrong claims are 2-3 and 2-8 claim#2 ("pay you back") and the boss beat 3 voice claim, plus the genuine claims in 2-1 and 2-5 and the 3 genuine requests.

**Banking paths (re-run for `step`):**
- 2-3: start → no-match → "Cancel and call" scores ★★★ + tags. "Cancel" scores ★★. "Send anyway" is a fall.
- 2-8: start → match → the same three outcomes.
- 2-6: start → "Pay €18" scores ★★★. "Decline the request" is dismiss on genuine high stakes, 0.
- Boss beat 2: start → request page → "Close it and call" scores ★★★. "Close it" scores ★★. "Pay €260" is a fall (0, damage control once).
- None of these changes rows 1–2 or 4–10. Rows 3a and 3b are new.

**What the numbers show:**
- "Always trust" (52%) and "always ignore" (52%) are far below playing well.
- "Always report" is the worst row, because three genuine messages cost −5 each.
- "Always verify blindly" scores 86% and stays bronze: it spots nothing.
- No blind tagging rule we tested reaches silver. The closest, always tagging the request (6c), nets 4 of the 5 needed. Random single tagging can't reach silver even with perfect luck (6a).
- The reason is that every twin pair shares the same checkable details (new number; saved contact asking for money; job offer with a request). A rule that tags a detail scores on the fraud twin and costs on the genuine one.
- Using the bank app as a checking step costs nothing (3a), so the payee check teaches without punishing.
- Gold needs spotting and no genuine reports.
- QA re-runs 6a/6b against the authored YAML in the Phase 3 balancing pass.

### 22.5 Learning-objective coverage
- LO-07 is demonstrated in 2-1 (optional), 2-3, 2-8 and the boss. Mastery is possible because 2-8 and the boss are difficulty 3.
- LO-06: mismatch 2-3, misleading match 2-8, genuine request 2-6.
- LO-12: 2-2, 2-7, boss beat 1, plus the twin 2-5.
- LO-17: 2-1, 2-5, 2-6.
- LO-18: drill 2-4, 2-7.
- LO-04: timers and pushers.
- LO-16: every fall.
- LO-14: arc.
- **New habit cards** (wording owned by game-designer; scenario-writer adds them to `content/habit_cards.yaml`; examples follow ruling 6 of T-2.4b):
  - `call-the-number-you-know` (LO-07):
    - Title "Call the number you already know" (LO doc).
    - Habit: H, verbatim.
    - Scope line: "For requests you didn't agree in person."
    - Example: "Teo's new mobile? A call from you, on the home number you already had."
    - Already paid: "Call your bank now on the number on your card (with a parent or trusted adult if you're under 18). Don't pay a second request."
  - `easy-money-costs-you` (LO-12):
    - Habit: "A real job pays you. If a 'job' wants a deposit, a top-up, a fee or a fine before you can earn or withdraw, or your ID copy before any contract, stop and talk to someone you trust."
    - Example (first shown at 2-2): "A job you never applied for wants your ID by chat? Look the agency up yourself."
  - `check-who-gets-the-money` (LO-06): see open question 4.

### 22.6 New brands and content (for `ux-artist`, `scenario-writer`)
- **Klaverwerk Staffing** (new; candidate name, brand check pending). A genuine in-world staffing agency whose name scammers borrow (TJ §2.1). Domain `klaverwerk-staffing.example`; SMS sender ID `KLAVERWERK` (spoofed in the boss). No look-alike domains are needed.
- **Tallyfern** (new; candidate name, alternatives "Rankrally", "Gleamtask"; brand check pending). A **scam-only** "review-task platform". It is never genuine and never styled after a real job, review or crypto site. Hosts: `tallyfern-earn.example` (2-7) and `tallyfern-start.example` (boss). Training pages only: read-only, watermarked, no network (Red Line 2).
- **Larchwick Bank: payment requests** (existing brand, new feature). Path `larchwick-bank.example/pay/<id>`. The request page in the `banking` device shows "Request from <name>".
- **Thimble & Pine:** add `jobs@thimbleandpine.example` and the `/jobs` path.
- **Cast:** add **Sanne** (local, Amsterdam, story scenes only; known channel "Guesthouse desk"). Teo's note: a new mobile from 2-1; the home line stays his known channel.
- **Recovery steps** (new, in `content/recovery_steps.yaml`; harmful ones need non-blaming `feedback`): `stop_paying`, `keep_evidence`, `report_to_police` (generic), `contact_fraud_helpline` (generic label; real names only in the help list), `tell_real_person`, `report_id_copy`, `tell_trusted_adult` (label "Tell a parent or trusted adult now (if you're under 18)"; category `stop` in this chapter's falls), harmful `pay_second_request`, harmful `pay_last_fee`. Every damage-control list in this chapter has at most 6 options, exactly 2 of them harmful.
- **Help list (NL):** fraud-researcher confirms the entries named in FI §5 / TJ §5 for the "Where to report" screen only (Red Line 1).

### 22.7 Engine and schema change requests
- **CR-17 (blocker; the single definition, Paris reuses it): request and claim checkables.**
  - **(a) Trigger.** From slot 2 on, `message.ask` is **required** on every scored beat whose `message.request` is `pay`, `enter_details` or `reply`, **regardless of `is_fraud`**. That covers the standard opening, boss scheduled beats, and engage-reached beats on sms, messenger, email, social, call or browser. `banking` beats are exempt: their payee is the checkable. That way the validator enforces the same list for both twins.
    - `reply` is included on purpose: 2-1, 2-5 and the 2-7 opening need it for the anti-mashing maths (§22.4 row 6c).
    - The verbatim rules are unchanged. Other requests keep today's rule (`ask` allowed only on `share_code` / `approve`). Slot 0–1 content is unaffected.
  - **(b) Claims.** New `message.claims: [{ text, translation? }]` (max 2), verbatim from the body or a caller line. Checkables `claim`, `claim#2`, labelled "What they say" / "What the caller says", type `claim`. For offers, promises and excuses.
  - Authoring rule: a claim is never a deadline (T-2.4b ruling 2).
  - Without CR-17, 2-7 and 2-8 would have R = 0, so it is a blocker.
- **CR-18 (blocker for the banking beats in 2-3, 2-6, 2-8 and boss beat 2): `start_transfer`** (producer ruling, shared with Paris). Acceptance tests per part:
  - **(a) Kind and class.** New kind `start_transfer` in a new class **`step`**: non-terminal, never decisive, no star cap. Allowed on genuine and fraud, in standard and boss scenarios (boss beats included; the §16 ruling 4 engage ban doesn't apply). Test: a group with only `start_transfer` + a banking-beat verify scores as that verify (★★★).
  - **(b) Chaining.** `start_transfer` requires `next_beat` to a `banking` beat whose message has `payee`. The validator requires that beat to offer ≥ 1 verify-class action and ≥ 1 dismiss-class action. Tests: the validator rejects a missing `payee`, a missing verify, a missing dismiss. The banking beat's action decides: `ignore` on genuine 2-6's banking beat = dismiss on genuine high stakes (0).
  - **(c) Request page.** The banking device renders a payment-request variant ("Request from <name> · €x · <note>"). **No payee check runs there**, and the payee name is a plain `payee.name` checkable (today's target `payee.name_check` with no `name_check` value, or a new alias). Test: no match/close-match banner on a request page.
  - **(d) No-match banner.** It shows a warning, never a holder name. This UI fix is owned by **Paris CR-23**; CR-18 only depends on it.
  - **(e) Boss chaining (producer ruling 2026-11-19, from the sceptic re-review).** A scheduled boss beat may chain through `start_transfer` to exactly one unscheduled `banking` sub-beat. The sub-beat's action is the scheduled beat's decisive action, and `covered_by` treats it as that beat. The beat timer carries over, with a floor: the banking card always gets at least 40 s (Paris `boss_transfer`). The next scheduled beat is held until the banking card closes, then arrives as normal (its own timer starts on arrival). Tests: sub-beat action scored as the parent beat; `covered_by` on the parent covers a decision made on the sub-beat; the timer floor; the next beat queued, not interrupting, while the banking card is open; the validator rejects a second chained sub-beat.
- **CR-19 (non-blocker): messenger new-contact chrome.** A "Not in your contacts" banner and the profile photo as the `image` checkable on chats from unknown numbers (§5 already promises this). Interim: the `sender.detail` text says it.
- **CR-20 (non-blocker): recorded-message calls.** `message.recorded: true` shows "Recorded message" in the call header and hides the "you" lines. Interim: the first transcript line says "(Recorded message)".
- **CR-21 (non-blocker): beat-bound pushers.** A pusher message may set `beat: <beat id>`; its `at_seconds` then counts from when that beat opens, and it never fires if the beat isn't reached (2-7's "11 tasks to go" on `top_up`). Interim: leave that follow-up out.
- Timer lengths when a standard group runs call → messenger → browser (2-7), confirmed by the frontend [P] (2026-11-19, Amsterdam QA p): the call runs on its own call length (`timers.call_beat`, 30 s); the first non-call beat after it starts a fresh slot-length timer (`timers.by_slot`, × mode), and later beats in the group keep that timer. See docs/ENGINE.md.

### 22.8 Design rulings for this chapter (game-designer, 2026-11-19)
1. **Saved-contact reveals on money requests are neutral.** A taken-over account shows the same saved contact (FI §2.B, §7). So from Amsterdam on, "It fits" on a saved contact is allowed only when the message asks for nothing high-stakes (Teo in Berlin, Jonas's parcel). On any `pay`, `share_code`, `log_in`, `enter_details` or `approve` request, the saved contact uses the neutral wording, genuine (2-6) and fraud (2-8) alike. `scenario-writer` adds this to `docs/CONTENT_GUIDE.md`.
2. **Real-domain payment-request links are neutral everywhere.** The fraud request in boss beat 2 and the genuine one in 2-6 open on the same real domain, so the owner part doesn't differ (CONTENT_GUIDE test). Both use: "larchwick-bank.example: Larchwick's own address. A payment request opens there whoever sent it, so it can't prove anything either way. The request page shows who gets the money."
3. **The new-number sender** is a red flag on 2-3 and boss beat 2 and a wrong tag on 2-1. The reveals open with the same words ("Not in your contacts: a new number, not X's saved one."). This is the chapter's main calibration lesson: new number + money + no call (FI §7).
4. **The engage cap in 2-7 is kept.** Answering an unsolicited job offer is itself a sourced warning sign (TJ §3.2, §4), so playing along costs one star (row 3: still gold). Everyone meets the pay-in turn: in the boss's beat 1 and in 2-7's layer-2 "If you'd kept going" timeline. `start_transfer` is different: it is a `step` and never caps (CR-18), because opening the bank app is where the payee check helps.
4a. **Payee-check facts used in this chapter.**
   - No match: a warning, no name (private persons; 2-3).
   - Close match: shows the name (not used in Amsterdam).
   - Match: clear (2-8, where the typed name is exactly the account name).
   - A payment-request page runs no check and just shows who gets the money (2-6, boss beat 2).
5. **No echo** in Amsterdam, so the boss is the same for every player. **Gift-card requests** (FI §2.B) are left out: no digital shop flow is needed.
6. **Red Lines:** every scenario is a message, call, site or app (Red Line 8). Task pages and banking screens are training devices (Red Line 2). Fictional brands, `.example` hosts and masked numbers and IBANs throughout (Red Lines 1, 3). Every scenario has a debrief with the tell, the habit and "Already paid?" (Red Line 4). Tone is "built to hit people who care" / "no need to feel ashamed" (Red Line 5; FI §5, TJ §5).

### 22.9 Open questions for the producer
1. **Boss shape.** The boss is two sourced scams on one evening, joined by one habit, rather than one story (no source combines them). Accept, or make the boss family-only (A → payee check → C) and move the starter top-up into a standard scenario?
2. **2-7 engage chain.** Careful players never see 2-7's payout or top-up stages there, only in the boss and in layer 2. Accept, or request a scammer-driven "thread" role (boss-style `arrives_after` in a standard scenario)?
3. **[researcher]** Does the euro payee check show the holder's name on a no-match? Is a scam text naming the real agency's website (2-2, 2-7 decoys) acceptable as a plausible, unsourced detail, or should those decoys be swapped for reference numbers?
4. **LO-06 habit-card title.** "Verify the change, not the email" doesn't fit chat requests. Retitle it "Check who gets the money" (it applies to Paris too)?
5. **Scam payee names.** Is an initial plus a masked common surname (`R. ••••`) acceptable to the sceptic?
6. **Gold in Amsterdam.** There is no off-focus genuine message, so the off-focus rule never applies here. Accept, given the twins all mirror chapter patterns?
7. **MAP alignment.** MAP Ch 2 still says "clear a negative balance". Ask fraud-researcher to align it to "not enough tasks done, pay more to finish the set" (TJ §10).

**Producer answers (2026-11-19):**
1. Accepted: two sourced scams on one evening, joined by one habit. Boss layer 1 and stamp screen (rework ruling): tell "Two strangers wanting money first: one as a job, one as Mateus." What works "Asked to pay first? Check it yourself, on a number or site you already know."
2. Accepted: no new engine role; the layer-2 "If you'd kept going" timeline and boss beat 1 carry the pay-in turn.
3. Payee check: per the Paris brief (`docs/patterns/payment-detail-change.md`, Reg. (EU) 2024/886 Art. 5c), a **close match** shows the real holder's name; a **no match** shows a warning, not a name. Use that. Agency-website decoys are acceptable (fictional `.example` brand, neutral decoy wording per CONTENT_GUIDE); the fraud-researcher confirms in the fact-check.
4. Accepted: retitle the LO-06 card "Check who gets the money" (Paris uses it too).
5. Provisionally accepted (`R. ••••`); the sceptic rules at scenario review.
6. Accepted.
7. Done: MAP Ch 2 aligned.
**Producer rulings at scenario writing (T-3.4, 2026-11-19):**
1. 40-word layer 1: the shortened tells in 2-1, 2-7 and the boss are accepted. In 2-1 the short habit line "Asked for money by message? Call a number you already had." is the layer-1 form; the full sentence stays in layer 2 and on the habit card. Boss layer 1 and stamp screen: tell "Two strangers, both wanting money first.", what works "Asked to pay first? Check on a number or site you already know."
2. 2-6: the verify option "Call Mateus on his saved work phone" (★★★) is accepted; every bank screen opened from a message offers a verify action.
3. 2-3: Noor's phone "went in the bath", not "in the canal" (no location clue the game doesn't teach).
4. Boss request page `scored: false` is accepted as a workaround; the validator will ignore pages reached from a scheduled beat (engine follow-up).
5. Engine-generated verdict lines are not authored; the spec's verdict wording opens the outcome text instead.
6. Mateus being on a flight is set up in the Amsterdam story scene before the boss (track S4), not in the scenario.

## 23. Chapter 3 — Paris
Status: **spec for review** (Phase 3, Paris step 2, game-designer, 2026-11-19). Briefs: `docs/patterns/ceo-fraud-bec.md`, `docs/patterns/payment-detail-change.md` (both draft, 2026-11-19). Every red flag, habit and recovery step below comes from those briefs; anything the briefs list as unverified is kept off screen (§23.9).
- **Placement:** set by the producer. The section sits after §17 on this branch; Amsterdam is §22 on its own branch, and nothing is renumbered.
- **CR numbers:** CR-17 (`message.ask` for pay and enter-details requests) and CR-18 (`start_transfer`) are shared with Amsterdam. Paris adds CR-22 to CR-26.
- **Sources:** per-scenario source lists live in `docs/patterns/ch3-paris-sources.md`. Some source ids contain names on the red-line denylist, and the docs brand test rejects those outside `docs/patterns/`. This section therefore cites no source ids inline.
- **Rework 1 (2026-11-19):** applies the fact-check, sceptic and learning-psychologist fixes. The brand check is applied (2026-11-19):

  | Before | After |
  |---|---|
  | Encrevive | Feuillemont |
  | Pressoria | Platinoir (`platinoir.example`) |
  | Maître Lenoir | Maître Vellacourt |
  | 3-8 holder | N. Vardoulec (shown in full, an exception to the masked-surname rule: the player must type it; brand-checked) |
  | 3-2 holder | Tessivane SAS |
  | Boss holder | Morvenac SAS |
  | "Project Ardoise" | "Projet Lys" |

  Volet Bleu, Ruchelune, Larchwick Pro, Cuivrelin, Cabinet Ostrelle and the cast names are cleared.

### 23.1 Goal, shape, rules check
- **Goal:** before money goes to new bank details or on an urgent, secret request, check it with the person on a number you already had, keep the two-person sign-off, and read the bank's payee-name check: a warning means stop; a match only tells you whose account it is.
- **Shape:** slot 3, difficulty 2–4 (boss 4), timers 50 s (call and boss beats 40 s, as in Berlin's boss). **8 scored scenarios: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus 1 drill (3-3) and the arc beat (Alex, slot 3). Estimated 15–18 min (the banking sub-beats add time; QA to measure).
- **New patterns (2):** `ceo-fraud-bec`, `payment-detail-change`. **Callbacks:** no new pattern callbacks; habit callbacks only (LO-01 sender, LO-08 hang up and call back, LO-18 ask someone).
- **LO focus:** LO-06 (core), LO-18 (four-eyes sign-off, Inès), LO-01, LO-04 (secrecy, authority, urgency), LO-08 (boss calls), LO-16, LO-17, LO-14 (arc).
- **Flavour:** French in-world text (`lang="fr"`, inline translation, never a red flag), the *pont* (long weekend), the *RIB* (bank-details slip, shown as a PDF attachment, never paper), *Maître* for a lawyer. A city is a stage, not a claim: no debrief says this scam "is French" (MAP.md).
- **Premise:** Ruchelune, a small print-and-design cooperative in Paris and a Waymarker partner, has asked for an inspector on the last working day before a long weekend. Its accounts officer Bastien is on leave, so you prepare payments in the Larchwick Pro app and the director, Solène, approves them. The chapter intro (≤ 20 s) shows Ruchelune's **procedure card**, in-world: "Payments at Ruchelune. 1. New payee or changed bank details: call the number in our file, never one in the message. 2. Every payment: one person prepares, Solène or Bastien approves. No exceptions, however urgent." ("Two-person sign-off" and "number in our file" are the game's plain wording for the sourced *validation hiérarchique* and known-number callback; ceo-fraud-bec §4.)
- **Audience (14+):** the workplace beats sit inside the inspector job. Consumer beats: your own rent (3-1, 3-7), Inès's mum and the plumber (drill 3-3), and Inès's own pay (3-5, where the 17-year-old is the person impersonated). The club or school-fee variant is **held in reserve** (low confidence, no source) and is not mentioned on screen. The drill names only sourced creditors (rework 1, item 5).
- **Bridge to home life:** layer 2 of 3-2, 3-6 and the boss carries one "At home" line, so workplace lessons transfer to personal life.

**Mix rules (balance v3.1):**
- Genuine share 3/8 = 37.5% ✓. Max consecutive same truth: PM runs F, G, F, F, F(boss) → 3 ✓.
- **Theme variety:** `ceo` 3 (3-2, 3-6, boss), `home` 2 (3-1, 3-7), `supplier` 2 (3-4, 3-8), `payroll` 1 (3-5). Max 3/8 ✓; scored order home, ceo, supplier, payroll, ceo, home, supplier, ceo: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 with timer or pusher (3-1 timer, 3-6 timer + pusher) = 66.7%; fraud 4/5 (3-2, 3-7, 3-8, boss) = 80%; gap 13.3 points ✓.
- **Difficulty parity:** genuine at 2 (3-1), 3 (3-4), 4 (3-6); fraud at 2 (3-2), 3 (3-7), 4 (3-5, 3-8, boss) ✓.
- **Decoys:** ≥ 2 on every fraud scenario (counts in §23.7). **Sender-or-link decoy:** F = 5, needs ceil(5/3) = 2: 3-8 (Platinoir's real, misused address) and the boss (Solène's real address on beat 1; caller IDs on beats 2–3) ✓. There are almost no links in this chapter (BEC is link-free), so the sender, the request and the bank details carry the checks.
- **Interrupts:** difficulty-4 scenarios get one each (3-5, 3-6, 3-8, boss); all genuine and unscored. They are **neutral small talk** that never points to the procedure or the verdict.
- **The procedure card** is shown in the intro panel only. It is never repeated as an interrupt on a fraud scenario, where it would hint at the verdict.
- **Red Line 8:** every scenario is email, messenger, banking, call or video call. The RIB is always a PDF attachment or an in-app card, never a paper letter.

### 23.2 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | LOs |
|---|---|---|---|---|---|---|---|
| 3-1 | AM | Rent: Volet Bleu's first-rent email; you pay with the details from your lease; the bank shows a **close match** with the holder's full company name, which you compare with your lease. **First payee-check coach mark.** | email → banking | genuine / high (home twin of 3-7) | 2 | honest timer 50 | LO-06, LO-17 |
| 3-2 | AM | "Solène" from a look-alike address: secret, unplanned transfer for an acquisition, "send it yourself, no need to put it through approval", "not even Bastien"; the bank says **couldn't check the name** | email → banking | fraud | 2 | timer 50 + pusher | LO-06, LO-01, LO-04, LO-18 |
| 3-3 | AM | **Drill: Inès spots one (a near miss).** Her mum nearly paid a "new RIB" from the plumber for the balance, then Inès called the number on his quote | messenger (quoted email) | drill | 2 | — | LO-18, LO-06, LO-01 |
| 3-4 | AM | Feuillemont (paper supplier) really changed banks: calm email, 30 days to pay; the call to the number in your file confirms it; the bank says **match** | email → banking | genuine / high (supplier twin of 3-8) | 3 | — | LO-06, LO-17 |
| | | *Stop point* ("Good place to take a break. 5 left today.") | | | | | |
| 3-5 | PM | "Inès" from an outside look-alike address asks to move her pay to a new account before payroll runs | email | fraud | 4 | interrupt (Adaeze, small talk) | LO-01, LO-06, LO-18 |
| 3-6 | PM | The **real** Solène: urgent, an invoice already in the system must be paid by 17:00; "prepare it and send it to me for approval as usual"; can't take calls, the front desk knows | email | genuine / high (ceo twin of 3-2) | 4 | honest timer 50 + pusher; interrupt (Inès, small talk) | LO-17, LO-04, LO-18 |
| 3-7 | PM | "Volet Bleu" from a look-alike address: changed banks, pay next month's rent early to the new RIB; a follow-up says the name check "may say it doesn't match, just confirm"; the bank says **doesn't match** | email → banking | fraud | 3 | timer 50 + pusher | LO-06, LO-01, LO-04 |
| *arc* | PM | Alex, slot 3: lots of praise, "keep this between us" (§10.1) | messenger | arc | — | — | LO-14 |
| 3-8 | PM | Platinoir (press maintenance) from its **real** address, in the real thread, real invoice: new account in a manager's name, "your bank's name check is all the proof you need, so no need to call us"; the bank says **match** | email → banking | fraud (twin of 3-4) | 4 | timer 50; interrupt (Inès, small talk) | LO-06, LO-01, LO-18 |
| 3-9 **Boss** | PM | 18:40 before the long weekend. Beat 1: secret acquisition deposit from Solène's **real** mailbox, "send it yourself tonight, I can't approve from the plane" (bank check: **match**). Beat 2: "Maître Vellacourt" calls to confirm. Beat 3: **video call** with Solène's face and voice: "I approve it myself, no sign-off tonight, keep it between us." Won by the sign-off and a call on the directory number. | email → call → video call | fraud | 4 | boss timers 40 + pusher; interrupt (Inès, after beat 3) | LO-06, LO-08, LO-18, LO-04, LO-16 |

All four payee-check results appear: close match (3-1, genuine), couldn't check (3-2, fraud), match (3-4 genuine, 3-8 fraud, boss fraud), doesn't match (3-7, fraud). "Match" appears on genuine and fraud alike, so it is never a tell either way.

### 23.3 New action step and scoring of the banking moment
The decision often happens in the banking app, after the email. That needs the "start the transfer" action, **CR-18 `start_transfer` (shared with Amsterdam)**. By producer ruling, these semantics are CR-18 for both chapters; they supersede Amsterdam's earlier "class engage", and Amsterdam re-runs its strategy table:
- **`start_transfer`** ("Pay it in the Larchwick app", "Set up the transfer in Larchwick Pro"): class `step`. Non-terminal, **never decisive, no star cap**, allowed on genuine and fraud, in standard scenarios and bosses. It must have `next_beat` to a `banking` beat with a `payee`. The banking beat's action decides the stars.
- **Inside a boss** (rework 1, item 21), a banking beat reached by `start_transfer`:
  - follows CR-18(e) (§22.7, the single definition): the beat timer carries over with a 40 s floor for the banking card;
  - holds the next scheduled beat until the banking card closes; that beat then arrives as normal, so a call never rings over the bank form.
- **Why no ★★ cap (unlike engage):** opening your own banking app exposes nothing, and the name check is built for exactly this moment. Stopping at a warning and calling the known number is the habit the brief asks for ("If your bank says the name doesn't match, stop and check"), so it earns ★★★ like calling first.
- **Banking beat actions** (action_order): comply (`pay`: "Pay anyway", "Send it now, signing off alone"), verify (`call_back_known`: "Cancel and call … on the number in your file / lease / directory"; `ask_someone`: "Send it to Solène for her sign-off"), report ("Cancel and report it"), dismiss ("Cancel"). Validator: every banking beat reached by `start_transfer` offers ≥ 1 verify and a dismiss.
- **Paying genuine new details without the call** is `pay` (comply, ★ on genuine high stakes), as Berlin 1-6. Paying unchanged details you already hold (3-1) is `proceed` (★★★).
- **Four-eyes as a verify:** "Send it to Solène for her sign-off" is `ask_someone` (verify class, LO-18, LO-06). On fraud it reaches the real Solène, who says she never asked for it. On genuine 3-6 the normal "prepare and send for approval" is `proceed`.

### 23.4 Per-scenario specs
Format per scenario: message, checkables (RF = red flag; D = decoy; G = genuine own detail), actions → kind → stars, pressure, outcomes and damage control, debrief, sources. French bodies get an English translation; ≤ 80 words each. Phone numbers masked, IBANs checksum-invalid and generated by content tooling, domains as listed in §23.10. Reveal wording follows CONTENT_GUIDE plus the Paris rulings in §23.8. Layer-1 counts are authored words for `tell` + `what_works` (the writer runs the validator's full count). Action labels here are drafts: the writer trims every label to ≤ 8 words (validator) and keeps the behaviour each one names.

**3-1 `paris-01-rent-close-match`** · pattern `payment-detail-change` (genuine) · theme `home` · brands Volet Bleu, Larchwick
- **Message (email):** from "Volet Bleu · Loyers" `loyers@voletbleu.example`. Your first rent of €690 is due by the 5th (4 days away), "to the account in your lease (page 4)", reference VB-2291-03; attachment "Avis d'échéance VB-2291-03.pdf". `request: pay`; honest deadline "due by the 5th".
- **Checkables (G, 4):** sender (neutral, ruling P1), request ("Asks you to pay this month's rent to the account in your lease, the one you agreed when you signed. Nothing new is asked."), reference (neutral), attachment (neutral rent notice).
- **Actions (email):** "Pay it with the details from your lease" (`start_transfer` → `rent_transfer`; you type the name and account from your lease) · "Call Volet Bleu on the number in your lease" (`call_back_known` ★★★; outcome "Yes, that's us"; follow-up `start_transfer`) · "Report the email as a scam" (report: 0, −5) · "Leave it for now" (`ignore`: 0, the 5th passes and a reminder arrives).
- **Banking `rent_transfer`:** payee typed "Volet Bleu" (lease front page), IBAN from lease page 4, €690. Result **close match**, holder shown: "Volet Bleu Gestion SAS". Checkables: `payee.name_check` (G, "It fits: the bank shows the holder as Volet Bleu Gestion SAS, the company name in the footer of your lease. That isn't proof on its own, so weigh it with what you're paying: the rent, to the account in your lease.") · `payee.iban` (G, "It fits: the same account as page 4 of your lease…"). Actions: "Use 'Volet Bleu Gestion SAS' and pay" (`proceed` ★★★) · "Cancel and call Volet Bleu on the lease number" (verify ★★★) · "Cancel and report the email" (0, −5) · "Cancel for now" (dismiss: 0).
- **Coach mark** (first payee check in the game; it freezes the timer, §8): "Your bank checks the name you typed against the account. Doesn't match? Stop and call. Close match? Compare the name it shows with your own papers. Matches? It only shows whose account it is."
- **Debrief L1 (genuine, 20):** tell "The account in your lease, and the full company name." · what works "Read the shown name and compare it with your own papers." Layer 2:
  - "A close match isn't an alarm. Read the name your bank shows. If it's someone you don't know, stop and call."
  - The debrief never says why the names differed. It never says a trading name "gives" a close match.
  - Device tip: "Banks in euro countries run this check on euro transfers. If your bank shows no name check, the call to the number you already had is your only check."
  - Habit card `verify-the-change` is not shown here (first shown at 3-2).
- **Sources:** `ch3-paris-sources.md` §3-1.

**3-2 `paris-02-ceo-lookalike`** · `ceo-fraud-bec` · theme `ceo` · Ruchelune, Larchwick Pro · levers authority, secrecy, urgency, helpfulness
- **Message (email):** from "Solène Arbogast" `solene@ruchelune-direction.example`, subject "Confidentiel · Dossier LY-2207". Asks you to prepare today a €18,400 transfer for the deposit on a purchase, "strictly confidential until the announcement: don't mention it to anyone, not even Bastien"; details in the attached RIB. Then: **"Send it yourself today, no need to put it through approval. I'll sign it off later."** And: "I'm in meetings all day, reply by email only. I'm counting on you." `request: pay`. Pusher at 25 s (same sender): "Have you started the transfer? It's urgent."
- **Checkables (4; R = 2):**
  - sender **RF**: "ruchelune-direction.example. The owner part is ruchelune-direction.example, not ruchelune.example, where Solène's address in the Ruchelune directory ends."
  - request **RF** (CR-17). The `ask` is one sentence, verbatim: "Send it yourself today, no need to put it through approval." Reveal: "Asks you to send a transfer nobody planned without the usual approval, and to keep it even from Bastien, who co-signs payments. Skipping the sign-off and secrecy about a payment are the tells."
  - reference D (neutral); attachment D ("A bank-details slip (RIB). A tidy RIB can't prove anything either way.").
- **Actions (email):** "Call Solène on the Ruchelune directory number" (`call_back_known` ★★★; Solène: "I never sent that. Thanks for calling.") · "Set up the transfer in Larchwick Pro" (`start_transfer` → `ceo_transfer`) · "Forward it to Ruchelune IT as phishing" (report ★★) · "Leave it for now" (ignore ★★).
- **Banking `ceo_transfer`:** payee "Tessivane SAS", an account Ruchelune has never paid. This holder and its IBAN differ from the boss's. Result **couldn't check**. Checkables: `payee.name_check` D ("Larchwick couldn't check the name for this account. Some accounts and transfers can't be checked. Nothing was checked, so it can't prove anything either way.") · `payee.iban` D (neutral, ruling P2). Actions: "Send it now, signing off alone" (`pay`, fall) · "Send it to Solène for her sign-off" (`ask_someone` ★★★: the real Solène calls, "I didn't ask for this.") · "Cancel and call Solène on the directory number" (★★★) · "Cancel and report it" (★★) · "Cancel" (★★).
- **After a fall** (stop first): `call_bank_recall_transfer` (stop) · `tell_management_known_channel` (warn) · `keep_evidence` (secure) · `file_complaint_police` (report) · `wait_until_after_long_weekend` (harmful) · `keep_quiet` (harmful).
- **Debrief L1 (17):** tell "A secret, unplanned transfer from a look-alike address." · what works "Call Solène on the directory number; keep the sign-off." Layer 2 flags:
  - an unplanned transfer;
  - "send it yourself, no need for approval" (skipping the sign-off);
  - secrecy ("not even Bastien");
  - the look-alike address;
  - "I'm counting on you" (helpfulness: you're the one she trusts);
  - "email only" blocks a call. That pressure tactic also appears on genuine 3-6, so it isn't proof on its own;
  - "couldn't check" means nothing was checked, not "safe".

  At home: "The same pressure turns up in personal messages too: an urgent, secret money request is a reason to call the person on the number you have." Habit card `verify-the-change` (first shown here). `already_clicked.paid`: "Call your bank now on the number you already have and ask it to recall the transfer for fraud. Then tell Solène on the directory number and keep the emails."
- **Sources:** `ch3-paris-sources.md` §3-2.

**3-3 `paris-03-ines-plumber-rib` (drill, unscored)** · `payment-detail-change` · Cuivrelin · cast Inès
- **Message (messenger, Inès, saved contact):** "Mum got this from Cuivrelin, the plumber who fixed our boiler: new bank, pay the balance there. She nearly paid it! It felt off, so I called the number on his quote. He never changed bank. Mum's reporting it. What would you have spotted?" Quoted screenshot (`context: quoted`): from `factures@cuivrelin-factures.example`, "Balance of invoice 2026-088: €640. Following a change of bank, please pay to our new RIB attached, within 48 h."
- **Quoted checkables:** sender **RF** (look-alike: owner part cuivrelin-factures.example; the quote came from cuivrelin.example); attachment D (tidy RIB proves nothing); reference D.
- **Actions:** "Reply: well spotted, and good call phoning him" (`proceed`) · "Ask what else she noticed" (`reply`).
- **Debrief (drill, 17):** tell "New bank details by email as the bill fell due." · what works "Call the number you already had, like Inès." Layer 2:
  - "Anyone you pay regularly can be imitated like this: a landlord, a tradesperson, an energy or phone company."
  - "If it's a family bill, show the message to the adult who pays it."
  - "Under 18? Tell a parent or guardian straight away; the call to the bank is the urgent step if anything was paid."
  - Report it even when nothing was paid.
- **Sources:** `ch3-paris-sources.md` §3-3.

**3-4 `paris-04-supplier-new-bank`** · `payment-detail-change` (genuine) · theme `supplier` · Feuillemont, Larchwick Pro · no timer (honest deadline: the usual 30 days)
- **Message (email):** from "Feuillemont · Comptabilité" `compta@feuillemont.example`, subject "Nouvelles coordonnées bancaires · facture F-2026-118". "We've changed banks. From invoice F-2026-118, please pay to the account below. Usual terms: 30 days. Any questions, call us on the usual number. Odile, accounts." Bank-details card (CR-22): Feuillemont, new IBAN. Attachment "RIB_Feuillemont.pdf". `request: pay`.
- **Checkables (G, 5; parity with its twin 3-8):** sender (neutral, P1) · request ("Asks you to pay invoice F-2026-118 to a new account, with the usual 30 days. A change of bank details is a reason to call the number in your supplier file before paying.") · `payee.iban` (neutral, P2: "A new account, as the email says. A real change and a fake one look the same here, so it can't prove anything either way. The number in your supplier file can.") · attachment (neutral) · reference (neutral).
- **Actions (email):** "Call Feuillemont on the number in your supplier file" (`call_back_known` ★★★; Odile: "Yes, new bank since Monday. The account ends 47."; follow-up "Add the new details and send for Solène's approval" `proceed`) · "Update the payee from the email" (`start_transfer` → `feuillemont_new`) · "Report it as a scam" (0, −5) · "Leave it for later" (ignore: 0).
- **Banking `feuillemont_new`:** result **match** ("Name matches"). `payee.name_check` (neutral, P3: "Name matches: the account is held by Feuillemont. That shows whose account it is. Only a call on a number you already had shows the request is real.") · `payee.iban` (neutral). Actions: "Pay the new account and send for approval" (`pay`: ★ on genuine, the change was never checked) · "Cancel and call Feuillemont on the file number" (★★★) · "Cancel and report it" (0, −5) · "Cancel" (0).
- **Debrief L1 (genuine, 16; synced with content, T-3.5 rework):** tell "It was real, but only a call to your file's number showed that." · what works "Call before paying." Layer 2: "Real bank changes happen. The name check told you whose account it is; the call told you the change was real. Solène's approval checks the payment, not the change: she sees the same details you took from the email." (The Banque de France point: the check must not lower your vigilance.)
- **Sources:** `ch3-paris-sources.md` §3-4.

**3-5 `paris-05-salary-change`** · `payment-detail-change` (salary variant) · theme `payroll` · Ruchelune · cast Inès (impersonated) · lever helpfulness · no timer
- **Message (email):** from "Inès Roussel" `ines@ruchelune.example-rh.test`. "I've opened an account with a new online bank. Can you pay my wages into it from this month? RIB attached. Payroll goes out tomorrow, thanks so much! Inès (apprentice, staff no. R-0417)". `request: enter_details`. Interrupt at 20 s, Adaeze (genuine, small talk): "How's Paris? Tried the bakery on the corner yet?"
- **Checkables (4; R = 1, difficulty 4):** sender **RF** ("ruchelune.example-rh.test. Read the end: the owner part is example-rh.test. The real name at the start is borrowed. Inès's directory address ends ruchelune.example.") · request D ("Asks you to pay her wages into a new account. Staff do change banks, and a real request reads just like this, so it can't prove anything either way. Check it with Inès herself.") · attachment D · reference D ("Her staff number, R-0417, which is correct. Details like this aren't hard to find out, so it can't prove anything either way.").
- **Actions:** "Ask Inès on her saved Kettle contact" (`call_back_known` ★★★; Inès: "What? I didn't send that. My bank's the same!") · "Update her pay details from the RIB" (`enter_details`, fall) · "Report it to Ruchelune IT" (★★) · "Leave it for Bastien after the long weekend" (ignore ★★).
- **After a fall:** outcome "Payroll is updated. An hour later Inès gets a 'your pay details have changed' notice and comes to you." (Sets `paris_pay_redirected`.) Payroll hasn't gone out yet, so the first step is to put her real details back.

Recovery:
- `check_pay_details_with_person` (**stop**: check them with Inès in person and put the right ones back before payroll runs);
- `tell_management_known_channel` (warn);
- `keep_evidence` (secure);
- `report_to_police_online` (report);
- `keep_quiet` (harmful);
- `reply_to_sender` (harmful).
- **Debrief L1 (19):** tell "An outside address using Inès's name to move her pay." · what works "Ask the person on a contact you already have." Layer 2 adds Inès's side, for 14+ players with a first job: "If your pay ever goes missing, tell your employer straight away; they call their bank."
- **`already_clicked`** (3-5): "Changed someone's pay details? Check with them directly and put the right ones back before payroll; if it already went out, call the bank."
- **Sources:** `ch3-paris-sources.md` §3-5.

**3-6 `paris-06-solene-urgent`** · `ceo-fraud-bec` (genuine) · theme `ceo` · Ruchelune, Feuillemont · levers urgency, authority · honest deadline "Feuillemont ships the rest today only if paid by 17:00"
- **Message (email):** from "Solène Arbogast" `solene@ruchelune.example`, subject "Urgent : facture Feuillemont F-2026-131". "Sorry for the rush: half the paper for the school festival order is missing. Feuillemont will only ship the rest today if invoice F-2026-131 (€1,240, already in the system) is paid before 17:00. Can you prepare it and send it to me for approval as usual? I'm in meetings until 17:00 and can't pick up; Margaux at the front desk knows about it." Attachment "F-2026-131.pdf". Pusher at 30 s (Solène): "Any news? I'm out at five." Interrupt at 15 s, Inès (genuine, small talk): "Is the big printer jammed again, or is it just me?"
- **Checkables (G, 4; parity with its twin 3-2):** sender (neutral, P1) · request ("Asks you to prepare a payment to a supplier already in the system, for an invoice already there, and send it to her for approval as usual. Nothing secret, no new account.") · reference · attachment (both neutral).
- **Actions:** "Prepare it and send it to Solène for approval" (`proceed` ★★★) · "Call Margaux at the front desk (directory)" (`call_back_known` ★★★; follow-up `proceed`) · "Pay it now, signing off alone" (`pay`: ★, real request but the sign-off was skipped) · "Report it as CEO fraud" (0, −5) · "Leave it until after the long weekend" (ignore: 0, the festival order arrives late).
- **Debrief L1 (genuine, 16; synced with content, T-3.5 rework):** tell "Urgent, not secret: a known invoice, usual sign-off." · what works "Urgency alone isn't the tell; keep the sign-off." Layer 2: "Compare this morning's fake: secret, unplanned, a new account, and 'not even Bastien'. A real urgent request still goes through the sign-off, and a real boss shouldn't mind you checking." At home: "A real urgent request from someone you know still survives a quick call back on their usual number." The second pressure-style callout (§8) is likely to fire here.
- **Sources:** `ch3-paris-sources.md` §3-6.

**3-7 `paris-07-agency-new-account`** · `payment-detail-change` · theme `home` · Volet Bleu, Larchwick · levers urgency, fear
- **Message (email):** from "Volet Bleu · Gestion" `gestion@volet-bleu.example`, subject "Loyer du mois prochain · nouveau RIB". "We've changed banks and the old account is closing. Please pay next month's rent before Friday to our new account (RIB attached). Late fees apply after that date. Ref. VB-2291-03." Agency logo. `request: pay`. Pusher at 25 s (same sender): "Reminder: your bank's name check may say the name doesn't match our new account. That's normal, just confirm." This is a game example of the sourced tactic of coaching victims past bank warnings (EPC), together with the INC advice not to confirm a transfer after a no-match result.
- **Checkables (5; R = 3):**
  - sender **RF**: "volet-bleu.example. Read it slowly: there's a hyphen. The agency's address on your lease and on its first email is voletbleu.example."
  - request **RF**: "Asks you to pay early, to a new account, with a late fee if you don't. New bank details with a deadline, just as a payment falls due, is the pattern."
  - attachment **RF**: "Opens the RIB: the account-holder line is in a different typeface from the rest, as if pasted in. An edited-looking RIB is a bonus clue; a tidy one proves nothing."
  - reference D (your real lease reference); logo D (neutral).
- **Actions (email):** "Call Volet Bleu on the number in your lease" (★★★; "We haven't changed banks.") · "Pay it in the Larchwick app" (`start_transfer` → `agency_transfer`) · "Report the email" (★★) · "Leave it" (★★).
- **Banking `agency_transfer`:** payee typed "Volet Bleu" (your lease), new IBAN. Result **doesn't match** (no holder name shown, CR-23). `payee.name_check` **RF** (not in R): "Doesn't match: the account isn't held by Volet Bleu, the name from your lease. That warning is the moment to stop, even when the sender told you to expect it." · `payee.iban` D (neutral). Actions: "Pay anyway" (`pay`, fall) · "Stop and call Volet Bleu on the lease number" (★★★) · "Cancel and report the email" (★★) · "Cancel" (★★).
- **After a fall:** `call_bank_recall_transfer` (stop) · `warn_creditor_known_number` (warn) · `keep_evidence` (secure) · `file_complaint_police` (report) · `reply_ask_money_back` (harmful) · `pay_recovery_service` (harmful). Layer 2 adds, without promising a refund: "After a 'doesn't match' warning, your bank may not have to refund you. Call it at once anyway and ask it to recall the transfer."
- **Debrief L1 (19):** tell "A new account, pay early, and a warning to ignore." · what works "Name warning? Stop. Call the number on your lease." Device tip (layer 2): "Banks in euro countries run this check on euro transfers. If your bank shows no name check, the call to the number you already had is your only check."
- **Sources:** `ch3-paris-sources.md` §3-7.

**3-8 `paris-08-supplier-thread-match`** · `payment-detail-change` · theme `supplier` · Platinoir, Larchwick Pro · levers urgency, helpfulness · difficulty 4: real details mixed in
- **Message (email):** from "Platinoir · Facturation" `facturation@platinoir.example` (the real address), subject "RE: Maintenance presse · facture P-7713", shown under earlier genuine Platinoir messages (CR-25; until then the "RE:" subject carries it). "Thanks for paying the last invoice. For P-7713 (€2,860, attached), we're changing banks before the long weekend: please pay to the account below, in the name of N. Vardoulec, our accounts manager. Your bank's name check is all the proof you need, so no need to call us. Have a good weekend!" Bank-details card: "N. Vardoulec", new IBAN. `request: pay`. Interrupt at 20 s, Inès (genuine): "Coffee run, want one?"
- **Checkables (5; R = 1):**
  - sender D (P1: "Shows facturation@platinoir.example, the address in your supplier file and this thread, as a real Platinoir email would. A real mailbox can be misused, so it can't prove anything either way.")
  - request **RF** (`ask` = "Your bank's name check is all the proof you need, so no need to call us."): "Asks you to pay a new account before the long weekend, and says your bank's name check is all the proof you need, so there's no need to call. A name check only shows whose account it is. Being steered away from the call is the tell."
    - Basis (rework 1, item 3): a name check must not lower your vigilance (Banque de France; EPC scheme). The usual-number callback before paying new details is advised by Cybermalveillance, the FBF and the CEO-fraud sources. The EPC coaching tactic is supporting context only, not the label.
  - reference D (the real invoice number); attachment D (real-looking invoice); `payee.iban` D (P2).
- **Actions (email):** "Call Platinoir on the number in your supplier file" (★★★) · "Set up the payment in Larchwick Pro" (`start_transfer` → `platinoir_transfer`) · "Report it to Ruchelune IT" (★★) · "Leave it for now" (★★).
- **Banking `platinoir_transfer`:** payee typed "N. Vardoulec" (as the email says). Result **match**. `payee.name_check` D (P3: "Name matches: the account is held by N. Vardoulec, the name the email gave you. That shows whose account it is. Only a call on a number you already had shows the request is real."). Actions: "Pay it and send for approval" (`pay`, fall: Solène approves it, she can't know either) · "Cancel and call Platinoir on the file number" (★★★; "We haven't changed banks. We'll check our email account. Thank you.") · "Cancel and report it" (★★) · "Cancel" (★★).
- **After a fall:**
  - `call_bank_recall_transfer` (stop);
  - `warn_creditor_known_number` (warn: they're being impersonated, and their mailbox may be misused);
  - `tell_management_known_channel` (warn);
  - `file_complaint_police` (report). France label: same as the generic one (producer ruling: the in-game label says "police"; the France help card names both national forces, see docs/patterns/ch3-paris-sources.md);
  - `reply_to_sender` (harmful);
  - `wait_until_after_long_weekend` (harmful).

  That makes 6 options, the §9 maximum. `keep_evidence` moves into the layer-2 recovery text.
- **Debrief L1 (18):** tell "Real address, real invoice, new account, and 'no need to call'." · what works "Call the number in your supplier file." Layer 2:
  - "A match only tells you whose account it is. You typed the name the email gave you, so the bank matched it. Had you typed Platinoir, the name in your own file, the check should have flagged that the account isn't Platinoir's. Use names from your own records, and call." The "had you typed" sentence is phrased as how the check works, never as an official statement.
  - "Sign-off catches a fake boss, because the real boss sees the request. It can't catch a fake supplier: Solène sees the same email you did. The call to the number in your file is the check."
  - "Even a real address in a real thread can carry a fake request."
- **Sources:** `ch3-paris-sources.md` §3-8.

### 23.5 The payee-name check (device moment)
An **invented** Larchwick screen. It must not copy any real bank's screen (Red Line 1; the EPC leaves wording and design to each bank). It appears on genuine and fraud transfers alike, in the `banking` device, after the payee name and IBAN (read-only demo values, nothing sent; Red Line 2).

**Flow:** payee name + IBAN + amount (prefilled from the scenario) → "Checking the name with the payee's bank…" (≤ 1 s; static in reduced motion) → one result card → the scenario's actions, rendered inside the card in action_order.

| Result | Card text (fictional Larchwick copy) | Styling | Holder name |
|---|---|---|---|
| **Matches** | "Name matches. The account is held by '{typed name}'." | calm tick, neutral or soft green; **no seal, shield or badge** (the current `seal` icon reads as certification) | the typed name |
| **Close match** | "Close match. The account is held by '{holder}'. Is that who you mean to pay?" | info icon, **information colours** (not warning colours: compare, don't panic) | **shown** (the bank shows the real holder name; regulation and EPC scheme) |
| **Doesn't match** | "The name doesn't match this account. The money may go to someone else. If you pay anyway, Larchwick may not be responsible." | warning triangle, **warning colours (the only result that uses them)** | **not shown**: the brief gives the holder only for a close match. The current `bank_name_mismatch` copy shows it and must change (CR-23) |
| **Couldn't check** | "We couldn't check the name for this account." | neutral surface | none |

- **Footer on every card, genuine or fraud:** "Larchwick checks the name against the account. It can't tell you whether the request is genuine." This is our invented bank's copy. It repeats the Banque de France point (the check must not lower your vigilance) without claiming any real bank says it, and it is identical on all four results, so it is never a tell.
- **You can still pay after any result** (the regulation doesn't let the check block you). So "Pay anyway" is always offered on fraud, as the tempting wrong action.
- **Coach mark** on first use (3-1). It freezes the timer (§8). It gives the rule: "Doesn't match? Stop and call. Close match? Compare the name it shows with your own papers. Matches? It only shows whose account it is."
- **What the game teaches, and where:**
  - **Type the name from your own records, so the check can warn you:** taught in 3-1 and 3-7, and named in the 3-8 debrief and the habit card.
  - **A warning should stop you:** 3-7 (doesn't match, after the sender told you to expect it); the pusher line is the coaching tactic.
  - **A match doesn't prove the request is genuine:** 3-4 (genuine), 3-8 and the boss (fraud). The same neutral reveal on all three (ruling P3).
  - **Read the shown name:** 3-1 (genuine close match; compare it with your lease).
  - **Couldn't check = nothing checked:** 3-2.
- **Never claimed on screen** (payment-detail-change "Not verified" list): refunds; how real banks word or design the check; which accounts or countries fall outside it (3-2 says only "some accounts and transfers can't be checked", and no country is named for any IBAN); anything about card payments; figures.
- **Debrief device tip** (layer 2, on 3-1 and 3-7): "Banks in euro countries run this check on euro transfers. If your bank shows no name check, the call to the number you already had is your only check."

### 23.6 Boss 3-9 `paris-09-boss-pont`
Setup (intro, ≤ 20 s): "18:40, the last working day before the long weekend. Bastien is away; Solène left at five. You're closing the accounts inbox." Theme `ceo`. Levers authority, secrecy, urgency, social_proof. Pusher: Solène's mailbox at 25 s ("Is it done? 19:00 is the deadline."). Interrupt `after_beat: video_call`, Inès (genuine): "Off now. Have a good long weekend! See you Tuesday." (reply = `proceed`; reporting her counts as a genuine report).

**Beat 1, email (start, 40 s).** From Solène's **real** address `solene@ruchelune.example` (brief §7 design rule: one fake from a real, misused mailbox; how it was misused is never shown). "I can't talk about this on the phone: tonight we sign the purchase of a workshop in Lyon (Projet Lys). The €38,500 deposit must leave before 19:00 to the account below. Maître Vellacourt of Cabinet Ostrelle will call you to confirm. **Send it yourself tonight, I can't approve from the plane.** Don't mention it to anyone before Tuesday's announcement, not even Bastien. Email only. I know I can count on you." Bank-details card "Morvenac SAS", with an IBAN different from 3-2's. `request: pay`.
- Checkables (4; R = 1):
  - sender D (P1);
  - request **RF**. The `ask` is "Send it yourself tonight, I can't approve from the plane." Reveal: "Asks you to send a transfer nobody planned without the usual approval, before 19:00 on the eve of a long weekend, and to keep it even from Bastien, who co-signs. Skipping the sign-off and secrecy are the tells, whichever address it comes from.";
  - reference D ("Projet Lys");
  - `payee.iban` D (P2).
- Because the fake asks you to bypass approval, sending it to Solène for her sign-off is the logical win.
- Actions: "Call Solène on the Ruchelune directory number" (`call_back_known` ★★★: Solène, at home: "I'm not boarding anything, and I never sent that. I'll change my email password now. Please don't pay anything.") · "Set up the transfer in Larchwick Pro" (`start_transfer` → `boss_transfer`) · "Report it to Ruchelune IT and Adaeze" (★★) · "Leave it for now" (★★).
- **`boss_transfer` (banking, `next_beat` inside beat 1's group):** result **match** ("Morvenac SAS"). `payee.name_check` D (P3), `payee.iban` D. Actions: "Send it now, signing off alone" (`pay`, fall) · "Send it to Solène for her sign-off" (`ask_someone` ★★★: the approval request reaches Solène's own app and she calls: "What payment? I'm at home.") · "Cancel and call Solène on the directory number" (★★★) · "Cancel and report it" (★★) · "Cancel" (★★). **This is the four-eyes win.**

**Beat 2, call (`arrives_after: 45`, 40 s, `covered_by: [start]`).** Caller ID "+33 1 •• •• •• 07" (not in your contacts). The brief's reassurance call from "the lawyer"; no spoofing is shown or claimed. It arrives 45 s after beat 1's group resolves, or after the `boss_transfer` card closes (§23.3). Transcript (English):
1. "Good evening, Maître Vellacourt from Cabinet Ostrelle. Ms Arbogast asked me to call you about Projet Lys."
2. "I confirm everything in her email. The deposit must leave before seven, or the seller walks away."
3. You: "Normally Bastien or Solène signs off."
4. "She has authorised it herself. Please send it now and keep it strictly confidential until Tuesday." (`ask`)
5. "If you need to check, call me back on 01 •• •• •• 07. Your bank will show the name matches."
- Checkables (4; R = 2): caller_id D ("Shows a Paris number that isn't in your contacts, as a real lawyer's call might. A number on screen can't show who's calling, so it can't prove anything either way.") · request **RF** ("He wants the transfer sent now, without the usual sign-off, and kept secret. A second person 'confirming' right after a secret request adds pressure, not proof.") · phone_number **RF** ("01 •• •• •• 07: the number he gives you to check him. Calling a number the caller gives you only reaches him again. Use the Ruchelune directory.") · reference D ("Cabinet Ostrelle", neutral).
- Actions: "Send the transfer now" (`pay`) · "Hang up" (`hang_up`) → "What now?": call-back label "Call Solène on the directory number" (verify), extra "Call back the number he gave" (`call_number_in_message`, note "That number reaches whoever gave it to you. Use the Ruchelune directory."), report, "Leave it there".

**Beat 3, video call (`arrives_after: 45`, 40 s, `covered_by: [start, lawyer_call]`; CR-24).** "Video call · Solène Arbogast" (Kettle). A stylised **illustration** of the fictional Solène at an airport gate: never photoreal, no generated face or voice, **no glitch effects** (the lesson is the request, not "spot the glitch"; see the DGSI case and the BSI caveat in the sources file). Transcript:
1. "It's me. I know this is unusual, and I'm sorry to put it on you."
2. "I'm boarding in two minutes. I'm approving it myself, right now, so you don't need anyone else's sign-off tonight." (`ask`)
3. You: "Shouldn't Bastien see it too?"
4. "No. Keep it between us until Tuesday. Please send it now. I'm counting on you."
- Checkables (3; R = 1): caller_id D ("Shows the name Solène Arbogast and her photo, as a real call from her would. Names and photos are easy to copy, so it can't prove anything either way.") · `video` D ("Her face and voice, as you know them. A face and voice can be faked convincingly on a live call, so they can't prove anything either way. Judge the request.") · request **RF** ("Her word on a call is meant to replace the sign-off, and you're asked to keep it secret. A real request keeps the usual sign-off, whoever is on the screen.").
- Actions: "Send it now on her word" (`pay`) · "End the call" (`hang_up`) → "What now?": "Call Solène on the directory number" (verify: Solène answers from home, "A video call? That wasn't me. Don't pay anything. I'm calling our bank and changing my email password now.") · extra "Message Adaeze through the staff directory" (`ask_someone`, outcome: "End of the week, secret, no sign-off? Don't send. I'll ring Solène on her directory number.") · report · "Leave it there".
- This models the DGSI case closely: the person found the request unusual, ended the call and alerted management through the usual channels. The debrief never says deepfake calls are "common" (medium confidence, no prevalence figure).

**Boss totals:** R = 4 (b1 1, b2 2, b3 1); decoys 7 (b1 sender, reference, IBAN; b2 caller ID, reference; b3 caller ID, video), plus the sub-beat's match and IBAN (not in R). Max 3 × 15 + 6 = **51**. Boss-fall cap and one layer-1 "You chose" line apply (CR-15, T-2.8).
- **After a fall** (once, at the end): `call_bank_recall_transfer` (stop) · `tell_management_known_channel` (warn: Solène on the directory number) · `secure_mailbox_owner` (secure: Solène changes her mailbox password and turns on two-step sign-in) · `file_complaint_police` (report) · `wait_until_after_long_weekend` (harmful) · `keep_quiet` (harmful).
- **Debrief L1 (19):** tell "A secret transfer, a 'lawyer', then her face: the same request." · what works "End the call. Call Solène on the directory number." Layer 2:
  - the three beats' flags;
  - timing: "These requests often come in the evening, on holidays and over long weekends, when accounts teams are short-staffed." This is a text flag, never a checkable, as with deadlines;
  - "Even a real address can carry a fake request; Solène's mailbox may have been misused, so she changes its password.";
  - "Most calls are what they seem. When one asks for money, secrecy or skipping a check, end it and call back.";
  - at home: "The same trick works with a family member's face or voice: end the call and call them back on the number you have."

  `already_clicked.paid`: "Call your bank now on the number you already have and ask it to recall the transfer for fraud. Tell Solène on the directory number, keep everything, and file a complaint." Workplace cases point to a complaint with the police, made in parallel with the bank call; the THESEE complaint service is not used here (§23.9).
- **Sources:** `ch3-paris-sources.md` §3-9.
- **QA:** `boss_transfer` has its own 40 s timer and holds beat 2 until its card closes (§23.3). Paper-playtest the load anyway.

### 23.7 Strategy check (as §7.2)
**Assumptions:** R counts scheduled beats only (`redFlagCount`); flags on banking sub-beats (3-7's "doesn't match") count toward spotting for players who get there, but are not in R.
- **Standard fraud, R and max:** 3-2 R 2 (19), 3-5 R 1 (17), 3-7 R 3 (21), 3-8 R 1 (17) = 74.
- **Fraud decoys on scheduled beats:** 3-2: 2, 3-5: 3, 3-7: 2, 3-8: 4, boss: 7 = 18.
- **Genuine:** 3 × 15 = 45. Own checkables: 3-1: 4, 3-4: 5, 3-6: 4 = 13. Every genuine message has a `request` checkable (CR-17), so the request is never a fraud-only element.
- **Boss:** R 4, max 51.
- **Totals:** max = 74 + 45 + 51 = **170**. R = 7 + 4 = **11**: silver needs spotted ≥ ceil(11/3) = **4**, gold ≥ ceil(22/3) = **8**.
- **No low-stakes genuine message** in Paris (every genuine one asks for money), so the gold off-focus rule can't bite here, and verifying a genuine message is always the habit. Calibration is taught through the over-report cost and the twins.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed or verify genuine | 74 + 45 + 51 | 170 | 100% | 11 − 0 = 11 | **Gold** |
| 2 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (14+12+16+12) + 45 + (30+6) | 135 | 79.4% | 11 | Silver |
| 3 | Ideal but reports Solène's real request (3-6) | 170 − 15 − 5 | 150 | 88.2% | 11 | Silver |
| 4 | Ideal but pays Feuillemont's genuine change without calling (3-4, ★) | 170 − 10 | 160 | 94.1% | 11 | Gold (see Q3) |
| 5 | Ideal but trusts the match in 3-8 (fall, damage control 9) | 170 − 17 + 9 | 162 | 95.3% | 11 | Gold (see Q3) |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 88.2% | 11 − (18 + 13) = −20 | Bronze |
| 6a | Random single tag per scenario/beat + always verify (expected) | 150 + 2×(½+¼+⅗+⅕) + 6×(¼·½·⅓) | ≈153 | ≈90.2% | 2.63 − 7.37 ≈ −4.7 | Bronze (silver only if all 7 fraud tags hit: 1 in 1,600) |
| 6b | **Always tag the request** + always verify | 150 + 2 + 2 + 2 (3-2, 3-7, 3-8) + 6 (boss) | 162 | 95.3% | 6 − (1 + 3) = 2 | Bronze |
| 6c | Always tag sender / caller ID + always verify | 150 + 2 + 2 + 2 (3-2, 3-5, 3-7) | 156 | 91.8% | 3 − (4 + 3) = −4 | Bronze |
| 6d | Tag request + sender + always verify | 150 + 4 + 4 (3-2, 3-7) | 158 | 92.9% | 9 − (5 + 6) = −2 | Bronze |
| 6e | Tag request + every bank-details item (IBAN, RIB) + always verify | 150 + 4 (3-7 only; every other tag set includes a decoy IBAN or RIB) | 154 | 90.6% | 7 − (5 + 5) = −3 | Bronze |
| 7 | Blind always-verify (± pause everywhere) | 60 + 45 + 45 | 150 | 88.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.4% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 | 70 | 41.2% | 0 | Bronze |
| 10 | Always trust, perfect damage control | genuine 15 + 5 + 15; 4 × 9; boss 9 | 80 | 47.1% | 0 | Bronze |
| 11 | **"Trust the bank's check"**: pay unless it says "doesn't match", cancel then | 3-1 15, 3-4 5, 3-6 15, 3-2 fall 9, 3-5 fall 9, 3-7 dismiss 10, 3-8 fall 9, boss 9 | 81 | 47.6% | 0 | Bronze |

Row details:
- **6a hit chances** (red flags ÷ checkables per scheduled beat): 3-2 2/4, 3-5 1/4, 3-7 3/5, 3-8 1/5; boss b1 1/4, b2 2/4, b3 1/3. Expected correct = 1.55 + 1.08 ≈ 2.63; wrong = 7 − 2.63 + 3 genuine tags ≈ 7.37. Silver needs every fraud tag to hit (7 correct − 3 genuine = 4): 0.5 × 0.25 × 0.6 × 0.2 × 0.25 × 0.5 × ⅓ ≈ 1 in 1,600.
- **6b (the closest systematic strategy).** The request is a red flag on 3-2, 3-7, 3-8 and all three boss beats, but a decoy on 3-5 (an employee changing banks is an ordinary request; the tell is the outside address), and a genuine detail on all three genuine messages. Net 6 − 4 = 2 of the 4 needed. Its margin depends on two rules the validator should hold for future chapters too: `request` checkables on genuine pay requests (CR-17), and at least one fraud whose request is ordinary.
- **6e (corrected in rework 1):** the strategy tags the request plus any IBAN card or RIB attachment.
  - **Correct (7):** 3-2 request; 3-7 request and RIB; 3-8 request; boss b1, b2 and b3 requests.
  - **Wrong on fraud (5):** 3-2 RIB; 3-5 request and RIB; 3-8 IBAN; boss b1 IBAN. 3-8's attachment is an invoice, not a RIB.
  - **Wrong on genuine (5):** 3-1 request (its attachment is a rent notice); 3-4 request, IBAN and RIB; 3-6 request (its attachment is an invoice).
  - **Bonus:** only 3-7 keeps its bonus (+4).
- **Rows re-checked after rework 1:**
  - The changes touched the asks of 3-2 and boss beat 1 (still the same red flag), the interrupts, the names and the recovery lists. None of them changes R, the checkables or any decisive action, so rows 1–6d and 7–11 stand.
  - Row 5 is unchanged: 3-8's damage-control list still offers 3 correct picks.

**What the numbers show:**
- No mashing strategy reaches silver in expectation; a random single tagger needs a 1-in-1,600 run.
- Blanket distrust loses: always-report 32%, always-dismiss 41%. Blind trust loses (47%), and so does trusting the bank's check (48%): a match is not a green light.
- Blind verifying is a sound habit and scores 88%, but shows no spotting, so it stays bronze. Silver needs spotted red flags; gold needs spotting plus no genuine report.
- Rows 4–5 reach gold with one ★ or one well-recovered fall (as in Berlin). See Q3.
- QA re-runs 6a–6e on the authored YAML at the Phase 3 balancing pass, as for Berlin.

### 23.8 Paris reveal rulings (for scenario-writer and sceptic-reviewer)
- **P1. Real addresses use the neutral wording in Paris, on genuine and fraud alike.** This chapter has frauds from real, misused mailboxes (3-8, boss beat 1). So a matching owner part no longer "differs between real and fake" (the CONTENT_GUIDE test), and "It fits" is not used for email senders here. Wording: "Shows {address}, the address in your file, as a real email would. A real mailbox can be misused, so it can't prove anything either way." Look-alike addresses still get their red-flag reveal. Saved Kettle contacts (Inès, interrupts) keep "It fits": no hijacked messenger account appears in Paris.
- **P2. A new IBAN or new payee is never a checkable red flag.** Genuine changes have one too (3-4), so a taggable "new account" would either be a tell or punish calibration (the same logic as T-2.4b ruling 2 on deadlines). `payee.iban` uses the neutral wording on every beat. "New bank details as a payment falls due" is taught through the request reveal (when the request adds a tell the genuine twin lacks: secrecy, skipping the sign-off, paying early with a penalty, being steered away from the call), layer 2 and the habit card.
- **P3. Payee-check results:**
  - **matches:** always neutral (brief §8: it looks the same on real and fake), never "It fits". Fixed suffix on every match reveal, genuine or fraud: "That shows whose account it is. Only a call on a number you already had shows the request is real.";
  - **close match:** "It fits" only on genuine, and only when the shown holder can be compared with a document the player already holds (3-1's lease). No reveal or debrief explains why a close match occurred: 3-1's trading-name case is one example, not how the check always behaves;
  - **doesn't match:** a red flag on fraud;
  - **couldn't check:** neutral ("nothing was checked").

  Validator (CR-23): a `payee.name_check` reveal on a `match` never starts with "It fits".
- **P4. Request reveals** (CR-17) open with "Asks you to…" on genuine and fraud alike. On fraud they go on to name the tell; on genuine they say why the request is ordinary. Never "It fits".
- **P5. Faces and voices** use the neutral wording and never list audible or visual artefacts.
- **P6. A number the sender or caller gives you as the way to check them** is a red flag (boss beat 2). A number from the player's own file is never shown as a checkable; it is the "What now?" call-back or the verify action.
- Deadlines and timing ("before Friday", "before 19:00", "the eve of a long weekend") stay text flags in layer 2, never checkables (T-2.4b ruling 2).

### 23.9 Debrief, recovery and reporting (France)
**Accuracy limits** (from the briefs' "Not verified" lists), checked by the sceptic:
- no loss figures;
- no refund promise anywhere: "ask your bank straight away";
- the instant-transfer recall difference is not explained on screen (only "call your bank at once");
- 17Cyber is described generically;
- no opening hours for Info Escroqueries;
- deepfake calls are never called "common";
- no country is named for any IBAN;
- the bank-side shared fraud file (FNC-RF) is not mentioned;
- the "match with the name the scammer supplies" is shown as how the check works, never as an official statement.

**New recovery steps** for `content/recovery_steps.yaml` (scenario-writer adds them; labels are generic, and every harmful step needs `feedback`):
- `call_bank_recall_transfer`: "Call your bank at once on the number you already have and ask it to recall the transfer for fraud".
- `warn_creditor_known_number`: "Warn the real landlord or supplier on the number you already have: they're being impersonated, and their mailbox may be misused".
- `file_complaint_police`: "File a complaint with the police (you can start online)". Producer ruling (2026-11-19): the in-game label stays generic ("police"); real bodies are named only on the France help card (Red Line 1), whose wording is in docs/patterns/ch3-paris-sources.md.
- `keep_evidence`: "Keep the emails, bank details, transfer and times".
- `tell_management_known_channel`: "Tell your manager through the directory, not by replying".
- `check_pay_details_with_person`: "Check the pay details with the person directly and put the right ones back".
- `secure_mailbox_owner`: "Ask the person whose mailbox was used to change its password and turn on two-step sign-in".
- `wait_until_after_long_weekend` (harmful). Feedback: "Waiting for the office to reopen feels sensible, but the sooner you call, the better the chance of getting a transfer back. Call the bank now."

**New habit card `verify-the-change` (LO-06):**
- **Title:** "Verify the change, not the email".
- **Habit**, as three if-then lines:
  - "If the bank details change, or a payment is secret or urgent: call the person on a number you already had, and keep the usual sign-off."
  - "If your bank says the name doesn't match: stop."
  - "If it matches: still call about any change. Type the name from your own records, so the check can warn you."
- **Example** (first shown at 3-2; personal, with no scam domain, since it also shows on genuine 3-4): "'New bank details for the bill'? Call the number you already had, like Inès did."
- **Alignment with Amsterdam:** if Amsterdam's card "Check who gets the money" is also LO-06, keep one LO-06 card (one card per LO, §11). In that case, merge these lines into it under Amsterdam's title; producer to pick. Otherwise both stay, each on its own LO.
- **Already clicked:** "Paid already? Call your bank now on the number you already have and ask it to recall the transfer. Then warn the person on their known number."

**"Where to report and get help" (France) card**, linked from layer 2 of every Paris debrief. Real organisations are named only here (Red Line 1). `fraud-researcher` verifies each entry into `docs/patterns/where-to-report.draft.en.yaml`, and the red-line allowlist must list them.
1. **Your bank, first and at once:** the number on your card or in your app. Ask it to block or recall the transfer for fraud. The sooner you call, the better the chance.
2. **Complaint** with the police (you can start online), in parallel with the bank; the bank may ask for it. This is the route for workplace cases (3-2, 3-8, the boss). The France help card wording, which names the national forces, is in docs/patterns/ch3-paris-sources.md.
3. **17Cyber**: the government help service; exact help-card wording in docs/patterns/ch3-paris-sources.md.
4. **THESEE** (general information only, not mapped to any scenario): "an online complaint for individuals (18+), in their own name, when a contact's hijacked mailbox asked them for money. Minors can only make a report."
5. **Info Escroqueries 0 805 805 817** (free): advice. No hours shown.
6. **Suspicious texts:** forward them to **33 700**.
7. Report attempts **even if no money was lost**.
8. **Beware of "recovery" offers** afterwards.

Paying after a "doesn't match" warning: the card says the bank "may not be responsible". It never says "isn't".

**14+ line** (on the card and in 3-3, 3-5 and 3-7 layer 2): "Under 18? Tell a parent or guardian straight away and call the bank with them: that call is the urgent step. They can make the complaint; some online complaint services are for adults only."

### 23.10 New brands and cast (requests to `ux-artist`; BRAND_CHECK by `fraud-researcher`)
All names are candidates until BRAND_CHECK clears them. Hosts follow the owner-part rule and survive lowercasing.

| id | Name | Role | Real domain | Look-alikes (scenario) | Notes |
|---|---|---|---|---|---|
| `ruchelune` | Ruchelune | partner cooperative (print and design), Paris | `ruchelune.example` | `ruchelune-direction.example` (3-2, brand plus word, diff 2); `ruchelune.example-rh.test` (3-5, real name first, owner part `example-rh.test`) | addresses `solene@`, `ines@`, `compta@`; staff directory with Solène, Bastien and the front desk (masked numbers) |
| `larchwick-pro` | Larchwick Pro | sub-brand of Larchwick: business account app | `pro.larchwick-bank.example` | none | Ruchelune's account; "Send for approval" (CR-26) |
| `volet-bleu` | Volet Bleu (legal name "Volet Bleu Gestion SAS") | letting agency (your Paris studio) | `voletbleu.example` | `volet-bleu.example` (3-7, an added hyphen, diff 3) | cleared by the brand check |
| `feuillemont` | Feuillemont | paper and ink supplier | `feuillemont.example` | none (genuine only) | replaces Encrevive, which collided with "Encre Vive" in the same trade; cleared by the brand check |
| `platinoir` | Platinoir | press maintenance firm | `platinoir.example` | none (its real mailbox is misused in 3-8) | replaces Pressoria; cleared by the brand check |
| `cuivrelin` | Cuivrelin | plumber (drill, quoted) | `cuivrelin.example` | `cuivrelin-factures.example` (3-3) | — |
| `ostrelle` | Cabinet Ostrelle | a law firm the scammer invents (voice only) | none | none | registered so the name is cleared; never a real firm |

- **Fictional account holders** (not brands; ux-artist decides whether they go in the registry): "Tessivane SAS" (3-2), "Morvenac SAS" (boss; a different IBAN from 3-2's), "N. Vardoulec" (3-8).
- **Cast** (`content/cast.yaml`):
  - `solene`: Solène Arbogast, director, Ruchelune; known channel: Ruchelune directory.
  - `bastien`: Bastien Morel, accounts officer, on leave; known channel: Ruchelune directory.
  - `ines`: Inès Roussel, 17, apprentice designer at Ruchelune; known channel: saved contact (Kettle). Capable: she spots the plumber fake herself.
  - Margaux (front desk) is a directory entry, not cast.

### 23.11 Engine change requests (to `frontend-engineer`)
CR-17 and CR-18 are reused by reference. Paris's own CRs are CR-22 to CR-26; CR-19 to CR-21 are Amsterdam's.
- **CR-17 (Amsterdam's, reused; blocker).** `message.ask` extended to `pay` and `enter_details`. It is required whenever `message.request` is one of those, genuine and fraud alike, from slot 2. Paris relies on it for every `request` checkable (§23.7 row 6b) and keeps each `ask` to one verbatim sentence.
- **CR-18 `start_transfer` (shared with Amsterdam; blocker).** Producer ruling: §23.3's semantics, for both chapters:
  - class `step`, non-terminal, never decisive, no star cap;
  - allowed on genuine and fraud, standard and boss;
  - `next_beat` to a `banking` beat with `payee`, which must offer ≥ 1 verify and a dismiss;
  - in a boss, that banking beat has its own 40 s timer and holds the next scheduled beat until its card closes.

  `balance.yaml` gets the kind (game-designer, when the engine lands).
- **CR-22 bank-details card on email and messenger (blocker, or the fallback below).** `payee` (name, iban) on a non-banking message renders as a stylised "Bank details" card, never a real bank's RIB layout. Checkable `payee.iban` only; no name check outside `banking`. Fallback: carry the IBAN in the RIB attachment's reveal. That moves 3-4, 3-8 and boss beat 1 one decoy down, so §23.7 must be re-run.
- **CR-23 payee-check result screen (blocker; with `ux-artist`).** Implements §23.5:
  - the checking state and the four result cards with fictional copy;
  - **no holder name on "doesn't match"** (accuracy fix to the current `bank_name_mismatch` and UI_SPEC §3.7);
  - the liability line on "doesn't match" and the shared footer on every card;
  - match styling without a seal or badge;
  - the scenario's actions rendered inside the card in action_order;
  - styling: information colours on close match, warning colours only on doesn't match;
  - the first-use coach mark, with the rule text from §23.5. The coach mark freezes the timer (new freeze reason `coach_mark`, §8);
  - new i18n keys.

  The no-name fix stays in Paris; Amsterdam references it as CR-23.

  Validator: `holder` is required exactly when the result is `close_match`; a `match` reveal never starts with "It fits".
- **CR-24 video call (blocker for boss beat 3).** `call` gains `message.video: { illustration, alt }`: an illustrated, stylised frame of a fictional person. No photoreal images, no synthesised voice audio, no glitch effects. New checkable target `video` (type `video`, label "Face and voice"). `hang_up` is labelled "End the call" and opens "What now?" as usual. Fallback: a voice call with caller ID, request and reference; R and decoys are unchanged if `reference` replaces `video`.
- **CR-25 email thread history (not a blocker).** `message.earlier` allowed on `email` (max 3 earlier messages, muted, not checkable), so 3-8 visibly lands inside a real thread.
- **CR-26 business account context (not a blocker).** `message.account: { nickname }` on banking beats (e.g. "Ruchelune · current account") under a Larchwick Pro header, so the player can see whose money it is.

### 23.12 Hand-offs and open questions
**Hand-offs:**
- **scenario-writer:** 3-1 to 3-9 per §23.4–§23.6, with French in-world text plus translations; `content/chapters/paris.yaml` with order am `[01, 02, 03, 04]` (stop point after 04), pm `[05, 06, 07, arc, 08, 09]`, `patterns: [ceo-fraud-bec, payment-detail-change]`; the recovery steps and habit card from §23.9.
- **ux-artist:** the brands and cast in §23.10, the payee-check cards and video frame in §23.5 and CR-24, and the four story panels in §23.13. The scenario-writer sets the variant flags: `paris_pay_redirected` on 3-5's fall outcome and `paris_boss_sent` on the boss's fall outcomes; both are story-only, not echo scenarios.
- **fraud-researcher:** confirm Q4; draft the France card (§23.9); run BRAND_CHECK.
- **frontend-engineer:** CR-17 and CR-18 (shared), and CR-22 to CR-26. CR-23 (the result screen) should land with or after CR-18, since both touch the banking device.
- **QA:** the boss load (beat 1 includes a banking sub-beat, now with its own timer and a held beat 2) and rows 6a–6e of §23.7.

**Open questions (producer):**
1. **Placement and the old Paris bullet.** At merge, §23 should sit after §22 (Amsterdam). The Paris bullet in §18 ("Chapters 2–10") mentions a "spoofed-caller-ID follow-up call", which this spec does not depict: the brief doesn't source spoofing for the lawyer call. Proposal: replace that bullet with "See §23" (one line, not a renumbering).
2. **CR numbers:** Paris reuses CR-17 and CR-18 and adds CR-22 to CR-26 (§23.11).
3. **Gold after one ★ or one well-recovered fall** (rows 4–5). This is the existing rule and holds in Berlin too. I recommend adding `stamps.gold.max_falls: 0` (global; QA re-runs Berlin), so that "trusted the match" can't reach gold in the chapter that teaches it. Producer call.
4. **For fraud-researcher:**
   - (a) 3-8's red flag ("says your bank's name check is all the proof you need, so there's no need to call"). Rework 1 re-sources it to the vigilance and known-number-callback sources, with the EPC as support only.
   - (b) The "had you typed Platinoir, the check should have flagged that the account isn't Platinoir's" line (an inference from how the check works), phrased as logic.
   - (c) The salary-change request via an outside look-alike address (the brief names the variant, not the channel detail).
   - (d) The fictional liability line and "Some accounts and transfers can't be checked".
   - (e) A trading name vs legal name as the genuine close match.
5. **Club and school fees** are held in reserve (low confidence) and only mentioned generically in the drill. Agree, or cut the mention?
6. **Balance of audiences:** 4 of 8 scored scenarios are workplace (3-2, 3-4, 3-6, 3-8) plus a workplace boss; the consumer side is 3-1, 3-7, the drill and Inès's pay (3-5). Acceptable for 14+, or swap 3-4 for a consumer twin (e.g. a genuine tradesperson change)?
7. **Deepfake portrayal:** illustration plus transcript only, no audio. Sceptic to confirm. Should even fictional synthetic-voice audio stay out permanently?
8. **Follow-ups after merge** (kept out of this branch to avoid conflicts with Amsterdam): LEARNING_OBJECTIVES chapter columns (add 3 to LO-01 and LO-08); CONTENT_GUIDE gets the P1–P6 rulings; UI_SPEC §3.7 is updated by CR-23.
9. **Story beats (§23.13)** depend on PLAN.md track S (separate PR): the panel format, length and skip rules come from there; §23.13 gives only the content.

**Producer answers (2026-11-19):**
1. Done: the §18 Paris bullet now points to §23.
2. CR-18 is `start_transfer` (Amsterdam's name) with the §23.3 semantics: class `step`, no cap, never decisive. This supersedes Amsterdam's earlier "class engage", and Amsterdam re-runs its strategy table. Paris's `request` checkable reuses Amsterdam's CR-17; Paris's own CRs are CR-22 to CR-26.
3. `stamps.gold.max_falls: 0` is a global change: parked for the Phase 3 balancing pass, not this chapter.
4. (a)–(e) go to the fraud-researcher fact-check of this spec.
5. Keep the generic mention in the drill only. **Superseded by fact-check (rework 1, item 5):** the drill names only sourced creditors (a landlord, a tradesperson, an energy or phone company). Clubs and schools are not mentioned on screen.
6. Accepted for now: the trust-inspector premise makes the workplace natural, and 3-1, 3-3, 3-5 and 3-7 are personal. The learning-psychologist review weighs it.
7. Illustration plus transcript, no synthetic audio, even fictional. The sceptic confirms.
8. Follow-ups after merge, as listed.
9. Track S is merged (PLAN.md); the story bible (`docs/STORY.md`) is in progress and §23.13 aligns to it.

### 23.13 Story beats (track S; illustrated panels, never scored)
Panels are illustrated scenes, ≤ 20 s each and skippable, with real text, and they never score. They never hint at whether a later message is genuine or fake: no panel mentions Volet Bleu, Feuillemont or Platinoir before their scenarios. The real Solène in the panels and the "Solène" on the boss video call are drawn the same: a familiar face proves nothing.
1. **Arrival** (chapter intro, before 3-1). You arrive at your third-floor studio, then walk to Ruchelune's workshop. Inès shows you round and points at the procedure card pinned by the screen ("Solène wrote it. She means it."). Cast: You, Inès. Emotion: **calm** (curious, welcoming). *Producer ruling R8 (DECISIONS.md): beats 1 and 2 play as one Arrival scene: the studio as a caption only, then Solène, then Inès with the card, ending calm.*
2. **Whose problem it is** (also in the intro, second panel). Solène, coat on, between meetings: Bastien is away for the long weekend, and it's the busiest week of the year. That's why she asked Waymarker for an extra pair of hands. Cast: Solène, You. Emotion: **worried** (stretched thin, not panicked).
3. **Mid-chapter turn** (after 3-5, before 3-6). Inès learns someone used her name to try to move her pay. She is shaken ("They knew my staff number!"); Solène sits with her: "This is why the card says no exceptions." Cast: Inès, Solène, You. Emotion: **worried → calm**. Variant if the player fell in 3-5 (flag `paris_pay_redirected`): the same scene, with "We've put your real details back before payroll, and we'll sort this together." Inès adds: "It even had my staff number. It would have fooled anyone." It ends calm, never blames, and promises no money back.
4. **Resolution** (after the boss debrief). Friday evening: you ring the real Solène on the directory number; she answers at home (a plain-wall panel, not a video call; rulings R4, R5). Tuesday: Solène, Bastien (back from leave) and Inès add a line to the procedure card, "A call or video call never replaces the sign-off", and Inès says she has shown her mum the card. Cast: Solène, Bastien, Inès, You. Emotion: **relieved**. Bastien is calm throughout (R7). Variant if any boss beat fell (flag `paris_boss_sent`): until the story layer can read the first damage-control pick, one merged line is used, "The bank was called straight away, the right first step. We'll see what it can recall." (ruling R6). Once that hook exists, the line depends on the player's first damage-control pick, which the story layer reads from the boss result (the same data as LO-16's "first pick is `stop`"; track S to expose it):
- first pick `stop`: "You called the bank straight away, and that was the right first step. We'll see what it can recall.";
- otherwise: "We called the bank together first thing; that's always the first step. We'll see what it can recall."

Either way the relief is about acting fast, not about the money, and there is no promise of a refund (§23.9).

## 18. Chapters 2–10 (map owned by `fraud-researcher`)
**2 Amsterdam (slot 2, diff 2–3).** *Full chapter spec: §22, which replaces this summary.*
- Patterns: the "Hi Mum / new number" messenger scam, and the **task / easy-work job scam**.
- Noor writes from a "new number" while her real number also messages you; call the old number (LO-07).
- **Task scam:** a Kettle message recruits you for "easy online work". It leads to a fake task-platform website or app that shows small earnings and then asks for deposits to "unlock" tasks (LO-12, LO-02). The genuine twin is a real job message from a known contact that asks for nothing.
- The Larchwick **payee-name check** shows "Name doesn't match" on the new-number request (LO-06).
- Arc slot 2.

**3 Paris (slot 3, diff 2–4).** Replaced by §23 (producer, 2026-11-19).

**4 Madrid (slot 4, diff 2–4).**
- Patterns: a spoofed Larchwick Bank SMS inside a genuine thread, then a "bank employee" call to move money to "safety" (LO-08, LO-05, LO-01).
- Genuine bank alerts with honest timers as twins.

**5 Warsaw (slot 5, diff 3–4).**
- Patterns: Swaploft "safe delivery" links while you sell something (LO-10), and code requests from a hacked friend (LO-05, LO-07).
- Mateus falls, and you guide his damage control (LO-16).
- Echo of earlier account choices.

**6 Rome (slot 6, diff 3–4).**
- Patterns: calls from "police" or "Larchwick Bank" with a **spoofed caller ID**, and family-emergency messages or calls using a **cloned voice** or a **"new number" on Kettle**. Doorstep and utility-visit content is cut (Red Line 8).
- **Habit:** verify through a number you already know. Caller ID and a familiar voice prove nothing.
- **Teo and Signora Bruna lead.** Teo gets a "police" call showing an official-looking number. He hangs up, calls back on the number he looks up himself, and coaches you through the same.
- **Davide (19)** gets a voice message that sounds like his sister, from a new number, asking for an urgent transfer. He pays. Bruna and you guide his damage control.
- You agree a family code word with Teo for calls and voice messages (LO-08, LO-07, LO-18, LO-04).
- Scenarios end at the digital request (the call or the transfer). No in-person cash pickups.

**7 Lisbon (slot 7, diff 3–5).**
- Patterns: **holiday and student rental scams, digital vectors only**:
  - fake listing pages cloning a fictional rental platform;
  - off-platform payment links sent by the "host";
  - phishing for your rental-platform login.
- Rental LOs: LO-11 (`pay_protected` inside the platform), LO-10 (stay on the platform), LO-02 (check the domain), LO-05 (don't log in via a message).
- Tampered **QR stickers on parking meters** stay; the lesson is the QR destination (LO-02).
- No ATM, street or in-person tricks.
- Twins: genuine listings on the platform and a genuine *(fictional)* parking app.
- Needs a fictional rental-platform brand in `brands.yaml` (ux-artist).

**8 Dublin (slot 8, diff 3–5).**
- Patterns: investment ads with fake endorsements by fictional celebrities, checked against an in-world regulator list (LO-13), then recovery-scam offers.
- Alex's dashboard beat lands here too.

**9 Stockholm (slot 9, diff 3–5).**
- Patterns: **callers who talk you into logging in or signing with your e-ID**, and **QR-login approvals sent by message** (LO-09, LO-02).
- Habit: "Never approve a sign-in, signature or QR login you didn't start."
- Gatewren prompts you started (`proceed`) are the twins.
- One remote-access "support" call previews the finale (LO-15).

**10 Brussels: finale (slot 10, diff 4–5).**
- New patterns: tech-support remote access (boss, LO-15) and **money-mule recruitment**.
  - The hook is a social-media or Kettle DM offering Noor easy money.
  - She asks your advice: they want her **banking-app login, card details or account access** "just for a few transfers".
  - The cyber lesson: never hand over your banking-app login, card details or account access.
  - The tone is non-threatening: "If you've already shared it, it's not too late: change your login, call your bank on the number on your card, and tell a trusted adult" (LO-12, LO-05, LO-18).
- Plus callbacks and the Alex resolution (§10.3).
- End screen: habit cards and the help list.

## 19. Data and schema change requests
Each chapter has `content/chapters/<city>.yaml` with `slot`, `city`, `patterns[]`, `lo_focus[]`, `scenario_order[]` (with the `half` split), `boss`, `arc_beat` and `intro`. Difficulty, timers and mix rules come from `balance.yaml` by slot.

Requests to `frontend-engineer`:
- **CR-01** `actions[].kind` (required). `score` is an optional override that requires `score_reason`.
- **CR-02** `stakes: low | high` on genuine scenarios. A `pattern` on genuine twins, used for the gold off-focus rule.
- **CR-03** `role: standard | boss | drill | arc`. `beats[]` with `next_beat`. Boss beats have `arrives_after` (scammer-driven).
- **CR-04** Inspectables: `red_flag: bool`, `reassures`, `context: quoted`, `type` (validator: `spelling|grammar|language` never `red_flag: true`), and a `padlock` type that is never reassuring proof. Engine support for tags.
- **CR-05** `pressure.levers` enum, `pressure.pusher`, `pressure.honest_deadline` for genuine messages.
- **CR-06** `interrupts[]` (`at_seconds`, `message`, `is_fraud`, `actions`).
- **CR-07** `recovery_steps.yaml` (id, label). Outcomes reference `{step, category}` per scenario.
- **CR-08** `sets_flags[]`, `requires_flags[]`, `arc_effects`, `arc_branch_on` (e.g. `alex_invested`). Flag names must match `^[a-z][a-z0-9_]*$` (snake_case, no dots; §4).
- **CR-09** Devices `auth` and `letter`. A `letter` must contain a QR code or URL inspectable, and that must be its red flag or decoy focus (validator, Red Line 8). Inspectable targets `qr.destination` and `payee.name_check`.
- **CR-10** `debrief.layer1.tell` and `debrief.layer1.what_works` (≤ 40 rendered words in the worst case, counted as in UI_SPEC §8.1: fixed copy + `tell` + `what_works` + the longest possible "You chose" line, or + `debrief.safeguarding_line` on arc debriefs), `debrief.layer2`, `debrief.device_tip`, `debrief.habit_card`, `debrief.variant: arc`, `debrief.safeguarding_line`.
- **CR-11** Per-chapter validation of all `mix` rules (balance.yaml), including pressure parity, theme share, `approve_prompt` only on fraud, no comply on low-stakes genuine, and Alex lines ≤ 25 words.
- **CR-12** `content/cast.yaml` (id, name, role, known-channel contact).
- **CR-13** Red-line linter: decode every QR asset; fail unless it is non-decodable or decodes to a `.invalid` string.
- **CR-14** (T-2.4b) Pusher messages accept optional `lang` and `translation`, with the same inline translation toggle as messages (0 s, freezes the timer). Not a merge blocker for Berlin.
- **CR-15** (T-2.4b) Boss layer 1 shows at most one "You chose" line (fewest stars; tie → latest beat). Per-beat choice lines move to layer 2. Keep the validator's single-line `choice_worst` count.
- **CR-16** (T-2.4b, only if QA triggers the §17 ruling 9 fallback) An interrupt trigger `on: what_now` so an interrupt arrives when the "What now?" step opens.
- **CR-17** (Amsterdam, blocker; also used by Paris) From slot 2, `message.ask` is required on every scored beat whose request is `pay`, `enter_details` or `reply`, genuine or fraud. New `message.claims[]` (max 2) → `claim` checkables ("What they say"). §22.7.
- **CR-18** (Amsterdam + Paris, blocker for the banking beats) Kind `start_transfer`, new class `step` (non-terminal, never decisive, no cap; genuine and fraud, standard and boss) → `banking` beat with `payee`, ≥ 1 verify and a dismiss. Payment-request page variant without a payee check. The no-match banner fix is Paris CR-23. §22.7.
- **CR-19** (Amsterdam, non-blocker) Messenger "Not in your contacts" banner and profile photo checkable.
- **CR-20** (Amsterdam, non-blocker) `message.recorded` for recorded-message calls.
- **CR-21** (Amsterdam, non-blocker) Beat-bound pushers (`beat: <id>`).
- **CR-22** (Paris, blocker or strategy re-run) Bank-details card in emails and messages. §23.11.
- **CR-23** (Paris, blocker) Payee-check result screen with four results; holder name only on close match; coach mark with timer freeze. §23.5, §23.11.
- **CR-24** (Paris, blocker for boss beat 3; voice-call fallback) Video-call variant: illustration and transcript only, no synthetic audio. §23.11.
- **CR-25** (Paris, non-blocker) Earlier messages in email threads. §23.11.
- **CR-26** (Paris, non-blocker) Business-account context in the bank app. §23.11.

## 20. Hand-offs
- **frontend-engineer:** §3–§9, §14, CR-01 to CR-13, `balance.yaml` v3.
- **scenario-writer:** §16–§17 once the briefs land. The §6 authoring rules and the §10.1 Alex rule apply.
- **ux-artist:** the tag toggle, the two-layer debrief, the half-day stop screen, the payee-name banners in the Larchwick app, Gatewren QR-login prompts, the pressure-style callout copy (§8), and the "Pushy follow-ups" setting.
- **fraud-researcher:**
  - confirm the §16–§18 candidates, the arc shape, the payee-check behaviour and the money-mule framing;
  - verify the help list, including 116 111 and the sextortion help card.

## 21. Open questions for Roman (G1)
1. **Arc.** Is the friendship-only Alex arc, with no-verdict debriefs plus "Tell me now", the right through-line and an acceptable reading of Red Line 4? It is pending research confirmation.
2. **Sextortion.** Recommended: a factual help card only, never a scenario. Agree?
3. **City order.** Linear (simpler for the arc), or a free choice after Berlin? QA recommends free choice so adult personas reach their topics sooner. Difficulty is bound to play position, so free choice is feasible, but scenarios would need tuning per band.
4. **Length.** Realistic estimates put the game at about 2.5–3 h, with chapters of 12–18 min in two halves. Accept, or trim later chapters to 7 scored scenarios?
5. **Gold strictness.** Gold allows no extra checks on harmless messages outside the chapter's focus. Too strict for a 14+ audience, or right?
