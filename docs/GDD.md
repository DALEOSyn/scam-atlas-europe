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
| meta | `pause` (unscored) |

**Decisive-action rules.** The *decisive* action decides the stars. It is not always the action that ends the scenario.
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

**Stars by class and truth.** Points = stars × 5, except for the cells marked.

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
  - Timers **freeze** while the pause menu, settings, help, debrief, translation or "Take a breath" is open.
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

## 23. Chapter 3 — Paris
Status: **spec for review** (Phase 3, Paris step 2, game-designer, 2026-11-19). Briefs: `docs/patterns/ceo-fraud-bec.md`, `docs/patterns/payment-detail-change.md` (both draft, 2026-11-19). Every red flag, habit and recovery step below comes from those briefs; anything the briefs list as unverified is kept off screen (§23.9).
- **Placement:** set by the producer. The section sits after §17 on this branch; Amsterdam is §22 on its own branch, and nothing is renumbered.
- **CR numbers:** start at CR-21. The "start the transfer" step is Amsterdam's CR-18, shared.

### 23.1 Goal, shape, rules check
- **Goal:** before money goes to new bank details or on an urgent, secret request, check it with the person on a number you already had, keep the two-person sign-off, and read the bank's payee-name check: a warning means stop; a match only tells you whose account it is.
- **Shape:** slot 3, difficulty 2–4 (boss 4), timers 50 s (call and boss beats 40 s, as in Berlin's boss). **8 scored scenarios: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus 1 drill (3-3) and the arc beat (Alex, slot 3). Estimated 15–18 min (the banking sub-beats add time; QA to measure).
- **New patterns (2):** `ceo-fraud-bec`, `payment-detail-change`. **Callbacks:** no new pattern callbacks; habit callbacks only (LO-01 sender, LO-08 hang up and call back, LO-18 ask someone).
- **LO focus:** LO-06 (core), LO-18 (four-eyes sign-off, Inès), LO-01, LO-04 (secrecy, authority, urgency), LO-08 (boss calls), LO-16, LO-17, LO-14 (arc).
- **Flavour:** French in-world text (`lang="fr"`, inline translation, never a red flag), the *pont* (long weekend), the *RIB* (bank-details slip, shown as a PDF attachment, never paper), *Maître* for a lawyer. A city is a stage, not a claim: no debrief says this scam "is French" (MAP.md).
- **Premise:** Ruchelune, a small print-and-design cooperative in Paris and a Waymarker partner, has asked for an inspector on the last working day before a long weekend. Its accounts officer Bastien is on leave, so you prepare payments in the Larchwick Pro app and the director, Solène, approves them. The chapter intro (≤ 20 s) shows Ruchelune's **procedure card**, in-world: "Payments at Ruchelune. 1. New payee or changed bank details: call the number in our file, never one in the message. 2. Every payment: one person prepares, Solène or Bastien approves. No exceptions, however urgent." ("Two-person sign-off" and "number in our file" are the game's plain wording for the sourced *validation hiérarchique* and known-number callback; ceo-fraud-bec §4.)
- **Audience (14+):** the workplace beats sit inside the inspector job. Consumer beats: your own rent (3-1, 3-7), Inès's mum and the plumber (drill 3-3), and Inès's own pay (3-5, where the 17-year-old is the person impersonated). The club or school-fee variant is **held in reserve** (low confidence, no source; §23.12 Q5); the drill's layer 2 mentions it only generically ("anyone you pay regularly").

**Mix rules (balance v3.1):**
- Genuine share 3/8 = 37.5% ✓. Max consecutive same truth: PM runs F, G, F, F, F(boss) → 3 ✓.
- **Theme variety:** `ceo` 3 (3-2, 3-6, boss), `home` 2 (3-1, 3-7), `supplier` 2 (3-4, 3-8), `payroll` 1 (3-5). Max 3/8 ✓; scored order home, ceo, supplier, payroll, ceo, home, supplier, ceo: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 with timer or pusher (3-1 timer, 3-6 timer + pusher) = 66.7%; fraud 4/5 (3-2, 3-7, 3-8, boss) = 80%; gap 13.3 points ✓.
- **Difficulty parity:** genuine at 2 (3-1), 3 (3-4), 4 (3-6); fraud at 2 (3-2), 3 (3-7), 4 (3-5, 3-8, boss) ✓.
- **Decoys:** ≥ 2 on every fraud scenario (counts in §23.7). **Sender-or-link decoy:** F = 5, needs ceil(5/3) = 2: 3-8 (Pressoria's real, misused address) and the boss (Solène's real address on beat 1; caller IDs on beats 2–3) ✓. There are almost no links in this chapter (BEC is link-free), so the sender, the request and the bank details carry the checks.
- **Interrupts:** difficulty-4 scenarios get one each (3-5, 3-6, 3-8, boss); all genuine, unscored.
- **Red Line 8:** every scenario is email, messenger, banking, call or video call. The RIB is always a PDF attachment or an in-app card, never a paper letter.

### 23.2 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | LOs |
|---|---|---|---|---|---|---|---|
| 3-1 | AM | Rent: Volet Bleu's first-rent email; you pay with the details from your lease; the bank shows a **close match** (trading name vs company name). **First payee-check coach mark.** | email → banking | genuine / high (home twin of 3-7) | 2 | honest timer 50 | LO-06, LO-17 |
| 3-2 | AM | "Solène" from a look-alike address: secret, unplanned transfer for an acquisition, "not even Bastien"; the bank says **couldn't check the name** | email → banking | fraud | 2 | timer 50 + pusher | LO-06, LO-01, LO-04, LO-18 |
| 3-3 | AM | **Drill: Inès spots one.** Her mum got a "new RIB" from the plumber for the balance; Inès called the number on his quote | messenger (quoted email) | drill | 2 | — | LO-18, LO-06, LO-01 |
| | | *Stop point* ("Good place to take a break. 6 left today.") | | | | | |
| 3-4 | AM | Encrevive (paper supplier) really changed banks: calm email, 30 days to pay; the call to the number in your file confirms it; the bank says **match** | email → banking | genuine / high (supplier twin of 3-8) | 3 | — | LO-06, LO-17 |
| 3-5 | PM | "Inès" from an outside look-alike address asks to move her pay to a new account before payroll runs | email | fraud | 4 | interrupt (Adaeze) | LO-01, LO-06, LO-18 |
| 3-6 | PM | The **real** Solène: urgent, an invoice already in the system must be paid by 17:00; "prepare it and send it to me for approval as usual"; can't take calls, the front desk knows | email | genuine / high (ceo twin of 3-2) | 4 | honest timer 50 + pusher; interrupt (Inès) | LO-17, LO-04, LO-18 |
| 3-7 | PM | "Volet Bleu" from a look-alike address: changed banks, pay next month's rent early to the new RIB; a follow-up says the name check "may say it doesn't match, just confirm"; the bank says **doesn't match** | email → banking | fraud | 3 | timer 50 + pusher | LO-06, LO-01, LO-04 |
| *arc* | PM | Alex, slot 3: lots of praise, "keep this between us" (§10.1) | messenger | arc | — | — | LO-14 |
| 3-8 | PM | Pressoria (press maintenance) from its **real** address, in the real thread, real invoice: new account in a manager's name, "your bank will confirm the name matches, no need to call"; the bank says **match** | email → banking | fraud (twin of 3-4) | 4 | timer 50; interrupt (Inès) | LO-06, LO-01, LO-18 |
| 3-9 **Boss** | PM | 18:40 before the long weekend. Beat 1: secret acquisition deposit from Solène's **real** mailbox (bank check: **match**). Beat 2: "Maître Lenoir" calls to confirm. Beat 3: **video call** with Solène's face and voice: "I approve it myself, no sign-off tonight, keep it between us." Won by the sign-off and a call on the directory number. | email → call → video call | fraud | 4 | boss timers 40 + pusher; interrupt (Inès, after beat 3) | LO-06, LO-08, LO-18, LO-04, LO-16 |

All four payee-check results appear: close match (3-1, genuine), couldn't check (3-2, fraud), match (3-4 genuine, 3-8 fraud, boss fraud), doesn't match (3-7, fraud). "Match" appears on genuine and fraud alike, so it is never a tell either way.

### 23.3 New action step and scoring of the banking moment
The decision often happens in the banking app, after the email. That needs the "start the transfer" action, **CR-18 (shared with Amsterdam)**. This spec calls it `prepare_payment`; use whatever kind name CR-18 settles on. Paris needs these semantics from it:
- **`prepare_payment`** ("Pay it in the Larchwick app", "Set up the transfer in Larchwick Pro"): class `step`. Non-terminal, **never decisive, no star cap**, allowed on genuine and fraud, in standard scenarios and bosses. It must have `next_beat` to a `banking` beat with a `payee`. The banking beat's action decides the stars.
- **Why no ★★ cap (unlike engage):** opening your own banking app exposes nothing, and the name check is built for exactly this moment. Stopping at a warning and calling the known number is the habit the brief asks for ("If your bank says the name doesn't match, stop and check"), so it earns ★★★ like calling first.
- **Banking beat actions** (action_order): comply (`pay`: "Pay anyway", "Send it now, signing off alone"), verify (`call_back_known`: "Cancel and call … on the number in your file / lease / directory"; `ask_someone`: "Send it to Solène for her sign-off"), report ("Cancel and report it"), dismiss ("Cancel"). Validator: every banking beat reached by `prepare_payment` offers ≥ 1 verify and a dismiss.
- **Paying genuine new details without the call** is `pay` (comply, ★ on genuine high stakes), as Berlin 1-6. Paying unchanged details you already hold (3-1) is `proceed` (★★★).
- **Four-eyes as a verify:** "Send it to Solène for her sign-off" is `ask_someone` (verify class, LO-18, LO-06). On fraud it reaches the real Solène, who says she never asked for it. On genuine 3-6 the normal "prepare and send for approval" is `proceed`.

### 23.4 Per-scenario specs
Format per scenario: message, checkables (RF = red flag; D = decoy; G = genuine own detail), actions → kind → stars, pressure, outcomes and damage control, debrief, sources. French bodies get an English translation; ≤ 80 words each. Phone numbers masked, IBANs checksum-invalid and generated by content tooling, domains as listed in §23.10. Reveal wording follows CONTENT_GUIDE plus the Paris rulings in §23.8. Layer-1 counts are authored words for `tell` + `what_works` (the writer runs the validator's full count).

**3-1 `paris-01-rent-close-match`** · pattern `payment-detail-change` (genuine) · theme `home` · brands Volet Bleu, Larchwick
- **Message (email):** from "Volet Bleu · Loyers" `loyers@voletbleu.example`. Your first rent of €690 is due by the 5th (4 days away), "to the account in your lease (page 4)", reference VB-2291-03; attachment "Avis d'échéance VB-2291-03.pdf". `request: pay`; honest deadline "due by the 5th".
- **Checkables (G, 4):** sender (neutral, ruling P1), request ("Asks you to pay this month's rent to the account in your lease, the one you agreed when you signed. Nothing new is asked."), reference (neutral), attachment (neutral rent notice).
- **Actions (email):** "Pay it in the Larchwick app, with the details from your lease" (`prepare_payment` → `rent_transfer`) · "Call Volet Bleu on the number in your lease" (`call_back_known` ★★★; outcome "Yes, that's us"; follow-up `prepare_payment`) · "Report the email as a scam" (report: 0, −5) · "Leave it for now" (`ignore`: 0, the 5th passes and a reminder arrives).
- **Banking `rent_transfer`:** payee typed "Volet Bleu" (lease front page), IBAN from lease page 4, €690. Result **close match**, holder shown: "Volet Bleu Gestion SAS". Checkables: `payee.name_check` (G, "It fits: the bank shows the holder as Volet Bleu Gestion SAS, the company name in the footer of your lease. That isn't proof on its own, so weigh it with what you're paying: the rent, to the account in your lease.") · `payee.iban` (G, "It fits: the same account as page 4 of your lease…"). Actions: "Use 'Volet Bleu Gestion SAS' and pay" (`proceed` ★★★) · "Cancel and call Volet Bleu on the lease number" (verify ★★★) · "Cancel and report the email" (0, −5) · "Cancel for now" (dismiss: 0).
- **Coach mark** (first payee check in the game): "Your bank checks the name you typed against the account. Four results: matches, close match, doesn't match, couldn't check. Read what it shows."
- **Debrief L1 (genuine, 18):** tell "The account in your lease, and the full company name." · what works "Compare the shown name with your own papers." Layer 2: "A close match isn't an alarm. Read the name your bank shows; if it's someone you don't know, stop and call." Device tip: "On a real banking app, the wording and look of this check differ by bank." Habit card `verify-the-change` is not shown here (first shown at 3-2).
- **Sources:** fr-inc-vop-2025, eu-eurlex-ipr-2024-886, eu-epc-vop-scheme, eu-ecb-ipr.

**3-2 `paris-02-ceo-lookalike`** · `ceo-fraud-bec` · theme `ceo` · Ruchelune, Larchwick Pro · levers authority, secrecy, urgency
- **Message (email):** from "Solène Arbogast" `solene.arbogast@ruchelune-direction.example`, subject "Confidentiel · Dossier LY-2207". Asks you to prepare today a €18,400 transfer for the deposit on a purchase, "strictly confidential until the announcement: don't mention it to anyone, not even Bastien"; details in the attached RIB; "I'm in meetings all day, reply by email only. I'm counting on you." `request: pay`. Pusher at 25 s (same sender): "Have you started the transfer? It's urgent."
- **Checkables (4; R = 2):**
  - sender **RF**: "ruchelune-direction.example. The owner part is ruchelune-direction.example, not ruchelune.example, where Solène's address in the Ruchelune directory ends."
  - request **RF** (CR-21; `ask` = the two sentences asking for the transfer and the secrecy): "A transfer nobody planned, kept secret even from Bastien, who co-signs payments. Secrecy about a payment and skipping the usual sign-off are the tells."
  - reference D (neutral); attachment D ("A bank-details slip (RIB). A tidy RIB can't prove anything either way.").
- **Actions (email):** "Call Solène on the Ruchelune directory number" (`call_back_known` ★★★; Solène: "I never sent that. Thanks for calling.") · "Set up the transfer in Larchwick Pro" (`prepare_payment` → `ceo_transfer`) · "Forward it to Ruchelune IT as phishing" (report ★★) · "Leave it for now" (ignore ★★).
- **Banking `ceo_transfer`:** payee "Ardoise Ateliers", an account Ruchelune has never paid. Result **couldn't check**. Checkables: `payee.name_check` D ("Larchwick couldn't check the name for this account. Some accounts and transfers can't be checked. Nothing was checked, so it can't prove anything either way.") · `payee.iban` D (neutral, ruling P2). Actions: "Send it now, signing off alone" (`pay`, fall) · "Send it to Solène for her sign-off" (`ask_someone` ★★★: the real Solène calls, "I didn't ask for this.") · "Cancel and call Solène on the directory number" (★★★) · "Cancel and report it" (★★) · "Cancel" (★★).
- **After a fall** (stop first): `call_bank_recall_transfer` (stop) · `tell_management_known_channel` (warn) · `keep_evidence` (secure) · `report_to_police_online` (report) · `wait_until_after_long_weekend` (harmful) · `keep_quiet` (harmful).
- **Debrief L1 (17):** tell "A secret, unplanned transfer from a look-alike address." · what works "Call Solène on the directory number; keep the sign-off." Layer 2 flags: unplanned transfer; secrecy ("not even Bastien"); pressure to skip the sign-off; look-alike address; "I'm counting on you" (flattery); "email only" blocks a call (a pressure tactic that also appears on genuine 3-6, so not proof on its own); "Couldn't check" means nothing was checked, not "safe". Habit card `verify-the-change` (first shown here). `already_clicked.paid`: "Call your bank now on the number you already have and ask it to recall the transfer for fraud. Then tell Solène on the directory number and keep the emails."
- **Sources:** fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi, eu-europol-ceo-bec-leaflet, fr-inc-vop-2025.

**3-3 `paris-03-ines-plumber-rib` (drill, unscored)** · `payment-detail-change` · Cuivrelin · cast Inès
- **Message (messenger, Inès, saved contact):** "Mum got this from Cuivrelin, the plumber who fixed our boiler: new bank, pay the balance there. It felt off, so I called the number on his quote. He never changed bank! Mum's reporting it. What would you have spotted?" Quoted screenshot (`context: quoted`): from `factures@cuivrelin-factures.example`, "Balance of invoice 2026-088: €640. Following a change of bank, please pay to our new RIB attached, within 48 h."
- **Quoted checkables:** sender **RF** (look-alike: owner part cuivrelin-factures.example; the quote came from cuivrelin.example); attachment D (tidy RIB proves nothing); reference D.
- **Actions:** "Reply: well spotted, and good call phoning him" (`proceed`) · "Ask what else she noticed" (`reply`).
- **Debrief (drill, 17):** tell "New bank details by email as the bill fell due." · what works "Call the number you already had, like Inès." Layer 2: "Anyone you pay regularly can be imitated like this: a landlord, a tradesperson, a club." · "If it's a family bill, show the message to the adult who pays it." · "Under 18? Tell a parent or guardian straight away; the call to the bank is the urgent step if anything was paid." · Report even when nothing was paid (eu-europol-ceo-bec-leaflet).
- **Sources:** fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-inc-iban-rib-fraudes-2025.

**3-4 `paris-04-supplier-new-bank`** · `payment-detail-change` (genuine) · theme `supplier` · Encrevive, Larchwick Pro · no timer (honest deadline: the usual 30 days)
- **Message (email):** from "Encrevive · Comptabilité" `compta@encrevive.example`, subject "Nouvelles coordonnées bancaires · facture F-2026-118". "We've changed banks. From invoice F-2026-118, please pay to the account below. Usual terms: 30 days. Any questions, call us on the usual number. Lucie, accounts." Bank-details card (CR-22): Encrevive, new IBAN. Attachment "RIB_Encrevive.pdf". `request: pay`.
- **Checkables (G, 5; parity with its twin 3-8):** sender (neutral, P1) · request ("Asks you to pay invoice F-2026-118 to a new account, with the usual 30 days. A change of bank details is a reason to call the number in your supplier file before paying.") · `payee.iban` (neutral, P2: "A new account, as the email says. A real change and a fake one look the same here, so it can't prove anything either way. The number in your supplier file can.") · attachment (neutral) · reference (neutral).
- **Actions (email):** "Call Encrevive on the number in your supplier file" (`call_back_known` ★★★; Lucie: "Yes, new bank since Monday. The account ends 47."; follow-up "Add the new details and send for Solène's approval" `proceed`) · "Update the payee from the email" (`prepare_payment` → `encrevive_new`) · "Report it as a scam" (0, −5) · "Leave it for later" (ignore: 0).
- **Banking `encrevive_new`:** result **match** ("Name matches"). `payee.name_check` (neutral, P3: "Name matches: the account is held by Encrevive. That shows whose account it is, as it would for any account in that name. It can't show whether the change itself is genuine, so it can't prove anything either way.") · `payee.iban` (neutral). Actions: "Pay the new account and send for approval" (`pay`: ★ on genuine, the change was never checked) · "Cancel and call Encrevive on the file number" (★★★) · "Cancel and report it" (0, −5) · "Cancel" (0).
- **Debrief L1 (genuine, 19):** tell "It was real: Encrevive confirms on the number in your file." · what works "New bank details? Call the number you already had." Layer 2: "Real bank changes happen. The name check told you whose account it is; the call told you the change was real." (fr-bdf-fraude-moyens-paiement: the check must not lower your vigilance.)
- **Sources:** fr-cybermalveillance-fiche-faux-rib, fr-bdf-fraude-moyens-paiement, fr-fbf-cles-faux-rib-2025, fr-cybermalveillance-fiche-fovi.

**3-5 `paris-05-salary-change`** · `payment-detail-change` (salary variant) · theme `payroll` · Ruchelune · cast Inès (impersonated) · lever helpfulness · no timer
- **Message (email):** from "Inès Roussel" `ines.roussel@ruchelune.example-rh.test`. "I've opened an account with a new online bank. Can you pay my wages into it from this month? RIB attached. Payroll goes out tomorrow, thanks so much! Inès (apprentice, staff no. R-0417)". `request: enter_details`. Interrupt at 20 s, Adaeze (genuine): "How's Paris? Ruchelune's procedure card is pinned at the top of the accounts inbox."
- **Checkables (4; R = 1, difficulty 4):** sender **RF** ("ruchelune.example-rh.test. Read the end: the owner part is example-rh.test. The real name at the start is borrowed. Inès's directory address ends ruchelune.example.") · request D ("Asks you to pay her wages into a new account. Staff do change banks, and a real request reads just like this, so it can't prove anything either way. Check it with Inès herself.") · attachment D · reference D ("Her staff number, R-0417, which is correct. Details like this aren't hard to find out, so it can't prove anything either way.").
- **Actions:** "Ask Inès on her saved Kettle contact" (`call_back_known` ★★★; Inès: "What? I didn't send that. My bank's the same!") · "Update her pay details from the RIB" (`enter_details`, fall) · "Report it to Ruchelune IT" (★★) · "Leave it for Bastien after the long weekend" (ignore ★★).
- **After a fall:** outcome "Payroll goes out. On Tuesday Inès asks why her pay hasn't arrived." Recovery: `call_bank_recall_transfer` (stop) · `check_pay_details_with_person` (secure) · `tell_management_known_channel` (warn) · `report_to_police_online` (report) · `keep_quiet` (harmful) · `reply_to_sender` (harmful).
- **Debrief L1 (19):** tell "An outside address using Inès's name to move her pay." · what works "Ask the person on a contact you already have." Layer 2 adds Inès's side, for 14+ players with a first job: "If your pay ever goes missing, tell your employer straight away; they call their bank."
- **Sources:** fr-cybermalveillance-fiche-fovi, fr-cybermalveillance-fiche-faux-rib.

**3-6 `paris-06-solene-urgent`** · `ceo-fraud-bec` (genuine) · theme `ceo` · Ruchelune, Encrevive · levers urgency, authority · honest deadline "Encrevive ships the rest today only if paid by 17:00"
- **Message (email):** from "Solène Arbogast" `solene.arbogast@ruchelune.example`, subject "Urgent : facture Encrevive F-2026-131". "Sorry for the rush: half the paper for the school festival order is missing. Encrevive will only ship the rest today if invoice F-2026-131 (€1,240, already in the system) is paid before 17:00. Can you prepare it and send it to me for approval as usual? I'm in meetings until 17:00 and can't pick up; Margaux at the front desk knows about it." Attachment "F-2026-131.pdf". Pusher at 30 s (Solène): "Any news? I'm out at five." Interrupt at 15 s, Inès (genuine): "Solène's been chasing Encrevive all day about the festival paper."
- **Checkables (G, 4; parity with its twin 3-2):** sender (neutral, P1) · request ("Asks you to prepare a payment to a supplier already in the system, for an invoice already there, and send it to her for approval as usual. Nothing secret, no new account.") · reference · attachment (both neutral).
- **Actions:** "Prepare it and send it to Solène for approval" (`proceed` ★★★) · "Call Margaux at the front desk (directory)" (`call_back_known` ★★★; follow-up `proceed`) · "Pay it now, signing off alone" (`pay`: ★, real request but the sign-off was skipped) · "Report it as CEO fraud" (0, −5) · "Leave it until after the long weekend" (ignore: 0, the festival order arrives late).
- **Debrief L1 (genuine, 17):** tell "Urgent, but nothing secret: a known invoice, usual sign-off." · what works "Urgency alone isn't the tell; keep the procedure." Layer 2: "Compare this morning's fake: secret, unplanned, a new account, and 'not even Bastien'. A real urgent request still goes through the sign-off, and a real boss doesn't mind you checking." The second pressure-style callout (§8) is likely to fire here.
- **Sources:** eu-europol-ceo-bec-leaflet, fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi.

**3-7 `paris-07-agency-new-account`** · `payment-detail-change` · theme `home` · Volet Bleu, Larchwick · levers urgency, fear
- **Message (email):** from "Volet Bleu · Gestion" `gestion@volet-bleu.example`, subject "Loyer du mois prochain · nouveau RIB". "We've changed banks and the old account is closing. Please pay next month's rent before Friday to our new account (RIB attached). Late fees apply after that date. Ref. VB-2291-03." Agency logo. `request: pay`. Pusher at 25 s (same sender): "Reminder: your bank's name check may say the name doesn't match our new account. That's normal, just confirm." (brief RF 7, game example of the sourced coaching tactic.)
- **Checkables (5; R = 3):**
  - sender **RF**: "volet-bleu.example. Read it slowly: there's a hyphen. The agency's address on your lease and on its first email is voletbleu.example."
  - request **RF**: "Asks you to pay early, to a new account, with a late fee if you don't. New bank details with a deadline, just as a payment falls due, is the pattern."
  - attachment **RF**: "Opens the RIB: the account-holder line is in a different typeface from the rest, as if pasted in. An edited-looking RIB is a bonus clue; a tidy one proves nothing."
  - reference D (your real lease reference); logo D (neutral).
- **Actions (email):** "Call Volet Bleu on the number in your lease" (★★★; "We haven't changed banks.") · "Pay it in the Larchwick app" (`prepare_payment` → `agency_transfer`) · "Report the email" (★★) · "Leave it" (★★).
- **Banking `agency_transfer`:** payee typed "Volet Bleu" (your lease), new IBAN. Result **doesn't match** (no holder name shown, CR-23). `payee.name_check` **RF** (not in R): "Doesn't match: the account isn't held by Volet Bleu, the name from your lease. That warning is the moment to stop, even when the sender told you to expect it." · `payee.iban` D (neutral). Actions: "Pay anyway" (`pay`, fall) · "Stop and call Volet Bleu on the lease number" (★★★) · "Cancel and report the email" (★★) · "Cancel" (★★).
- **After a fall:** `call_bank_recall_transfer` (stop) · `warn_creditor_known_number` (warn) · `keep_evidence` (secure) · `report_to_police_online` (report) · `reply_ask_money_back` (harmful) · `pay_recovery_service` (harmful). Layer 2 adds, without promising a refund: "Paying after a 'doesn't match' warning means you were warned; your bank may not be responsible. Call it at once anyway and ask it to recall the transfer." (fr-inc-vop-2025, eu-eurlex-ipr-2024-886).
- **Debrief L1 (19):** tell "A new account, pay early, and a warning to ignore." · what works "Name warning? Stop. Call the number on your lease."
- **Sources:** fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-inc-iban-rib-fraudes-2025, fr-inc-vop-2025, fr-bdf-fraude-moyens-paiement, eu-epc-threats-2025.

**3-8 `paris-08-supplier-thread-match`** · `payment-detail-change` · theme `supplier` · Pressoria, Larchwick Pro · levers urgency, helpfulness · difficulty 4: real details mixed in
- **Message (email):** from "Pressoria · Facturation" `facturation@pressoria.example` (the real address), subject "RE: Maintenance presse · facture P-7713", shown under earlier genuine Pressoria messages (CR-25; until then the "RE:" subject carries it). "Thanks for paying the last invoice. For P-7713 (€2,860, attached), we're changing banks before the long weekend: please pay to the account below, in the name of N. Ferrand, our accounts manager. Your bank will confirm the name matches, no need to call us. Have a good weekend!" Bank-details card: "N. Ferrand", new IBAN. `request: pay`. Interrupt at 20 s, Inès (genuine): "Coffee run, want one?"
- **Checkables (5; R = 1):**
  - sender D (P1: "Shows facturation@pressoria.example, the address in your supplier file and this thread, as a real Pressoria email would. A real mailbox can be misused, so it can't prove anything either way.")
  - request **RF** (`ask` = "Your bank will confirm the name matches, no need to call us."): "Asks you to pay a new account before the long weekend, and says your bank's name check will prove it's them, so there's no need to call. A name check only shows whose account it is. Being steered away from the call is the tell."
  - reference D (the real invoice number); attachment D (real-looking invoice); `payee.iban` D (P2).
- **Actions (email):** "Call Pressoria on the number in your supplier file" (★★★) · "Set up the payment in Larchwick Pro" (`prepare_payment` → `pressoria_transfer`) · "Report it to Ruchelune IT" (★★) · "Leave it for now" (★★).
- **Banking `pressoria_transfer`:** payee typed "N. Ferrand" (as the email says). Result **match**. `payee.name_check` D (P3: "Name matches: the account is held by N. Ferrand, the name the email gave you. It shows whose account it is, as it would for any account. It can't show whether the request is genuine, so it can't prove anything either way."). Actions: "Pay it and send for approval" (`pay`, fall: Solène approves it, she can't know either) · "Cancel and call Pressoria on the file number" (★★★; "We haven't changed banks. We'll check our email account. Thank you.") · "Cancel and report it" (★★) · "Cancel" (★★).
- **After a fall:** `call_bank_recall_transfer` (stop) · `warn_creditor_known_number` (warn: their mailbox may be misused) · `tell_management_known_channel` (report) · `keep_evidence` (secure) · `reply_to_sender` (harmful) · `wait_until_after_long_weekend` (harmful).
- **Debrief L1 (18):** tell "Real address, real invoice, new account, and 'no need to call'." · what works "Call the number in your supplier file." Layer 2: "A match only tells you whose account it is. You typed the name the email gave you, so the bank matched it. Had you typed Pressoria, the name in your own file, it would have warned you. Use names from your own records, and call." · "Even a real address in a real thread can carry a fake request." The "had you typed Pressoria" line is an inference from how the check works (payment-detail-change §5 limit 2); it is phrased as logic, never as an official statement (§23.12 Q4).
- **Sources:** fr-bdf-fraude-moyens-paiement, eu-epc-vop-scheme, eu-ecb-ipr, fr-cybermalveillance-fiche-faux-rib, eu-esas-ai-scams-factsheet-nl, eu-epc-threats-2025.

### 23.5 The payee-name check (device moment)
An **invented** Larchwick screen. It must not copy any real bank's screen (Red Line 1; the EPC leaves wording and design to each bank). It appears on genuine and fraud transfers alike, in the `banking` device, after the payee name and IBAN (read-only demo values, nothing sent; Red Line 2).

**Flow:** payee name + IBAN + amount (prefilled from the scenario) → "Checking the name with the payee's bank…" (≤ 1 s; static in reduced motion) → one result card → the scenario's actions, rendered inside the card in action_order.

| Result | Card text (fictional Larchwick copy) | Styling | Holder name |
|---|---|---|---|
| **Matches** | "Name matches. The account is held by '{typed name}'." | calm tick, neutral or soft green; **no seal, shield or badge** (the current `seal` icon reads as certification) | the typed name |
| **Close match** | "Close match. The account is held by '{holder}'. Is that who you mean to pay?" | info icon, warning colours | **shown** (the bank shows the real holder name; eu-eurlex-ipr-2024-886, eu-epc-vop-scheme) |
| **Doesn't match** | "The name doesn't match this account. If you pay, the money may go to an account that doesn't belong to '{typed name}'. If you continue, you're paying knowing this warning, and Larchwick isn't responsible if the money goes to someone else." | warning triangle, warning colours | **not shown**: the brief gives the holder only for a close match. The current `bank_name_mismatch` copy shows it and must change (CR-23) |
| **Couldn't check** | "We couldn't check the name for this account." | neutral surface | none |

- **Footer on every card, genuine or fraud:** "Larchwick checks the name against the account. It can't tell you whether the request is genuine." This is our invented bank's copy. It repeats the Banque de France point (the check must not lower your vigilance) without claiming any real bank says it, and it is identical on all four results, so it is never a tell.
- **You can still pay after any result** (the regulation doesn't let the check block you; eu-eurlex-ipr-2024-886). So "Pay anyway" is always offered on fraud, as the tempting wrong action.
- **What the game teaches, and where:**
  - **A warning should stop you:** 3-7 (doesn't match, after the sender told you to expect it); the pusher line is the coaching tactic (eu-epc-threats-2025).
  - **A match doesn't prove the request is genuine:** 3-4 (genuine), 3-8 and the boss (fraud). The same neutral reveal on all three (ruling P3).
  - **Read the shown name:** 3-1 (genuine close match; compare it with your lease).
  - **Couldn't check = nothing checked:** 3-2.
- **Never claimed on screen** (payment-detail-change "Not verified" list): refunds; how real banks word or design the check; which accounts or countries fall outside it (3-2 says only "some accounts and transfers can't be checked", and no country is named for any IBAN); anything about card payments; figures.
- **Debrief device tip** (layer 2, on 3-1 and 3-7): "On a real banking app, the wording and look of this check differ by bank. What matters is the same: a warning means stop; a match only shows whose account it is."

### 23.6 Boss 3-9 `paris-09-boss-pont`
Setup (intro, ≤ 20 s): "18:40, the last working day before the long weekend. Bastien is away; Solène left at five. You're closing the accounts inbox." Theme `ceo`. Levers authority, secrecy, urgency, social_proof. Pusher: Solène's mailbox at 25 s ("Is it done? 19:00 is the deadline."). Interrupt `after_beat: video_call`, Inès (genuine): "Off now. Have a good long weekend! See you Tuesday." (reply = `proceed`; reporting her counts as a genuine report).

**Beat 1, email (start, 40 s).** From Solène's **real** address `solene.arbogast@ruchelune.example` (brief §7 design rule: one fake from a real, misused mailbox; how it was misused is never shown). "I can't talk about this on the phone: tonight we sign the purchase of the Ardoise workshop in Lyon. The €38,500 deposit must leave before 19:00 to the account below. Maître Lenoir of Cabinet Ostrelle will call you to confirm. Don't mention it to anyone before Tuesday's announcement, not even Bastien. I'm boarding; email only. I know I can count on you." Bank-details card "Ardoise Ateliers SAS". `request: pay`.
- Checkables (4; R = 1): sender D (P1) · request **RF** ("A transfer nobody planned, before 19:00 on the eve of a long weekend, secret even from Bastien, who co-signs. Secrecy and skipping the sign-off are the tells, whichever address it comes from.") · reference D ("Project Ardoise") · `payee.iban` D (P2).
- Actions: "Call Solène on the Ruchelune directory number" (`call_back_known` ★★★: Solène, at home: "I'm not boarding anything, and I never sent that. I'll change my email password now. Please don't pay anything.") · "Set up the transfer in Larchwick Pro" (`prepare_payment` → `boss_transfer`) · "Report it to Ruchelune IT and Adaeze" (★★) · "Leave it for now" (★★).
- **`boss_transfer` (banking, `next_beat` inside beat 1's group):** result **match** ("Ardoise Ateliers SAS"). `payee.name_check` D (P3), `payee.iban` D. Actions: "Send it now, signing off alone" (`pay`, fall) · "Send it to Solène for her sign-off" (`ask_someone` ★★★: the approval request reaches Solène's own app and she calls: "What payment? I'm at home.") · "Cancel and call Solène on the directory number" (★★★) · "Cancel and report it" (★★) · "Cancel" (★★). **This is the four-eyes win.**

**Beat 2, call (`arrives_after: 45`, 40 s, `covered_by: [start]`).** Caller ID "+33 1 •• •• •• 07" (not in your contacts). The brief's reassurance call from "the lawyer" (fr-gendarmerie-fovi); no spoofing is shown or claimed. Transcript (English):
1. "Good evening, Maître Lenoir from Cabinet Ostrelle. Ms Arbogast asked me to call you about Project Ardoise."
2. "I confirm everything in her email. The deposit must leave before seven, or the seller walks away."
3. You: "Normally Bastien or Solène signs off."
4. "She has authorised it herself. Please send it now and keep it strictly confidential until Tuesday." (`ask`)
5. "If you need to check, call me back on 01 •• •• •• 07. Your bank will show the name matches."
- Checkables (4; R = 2): caller_id D ("Shows a Paris number that isn't in your contacts, as a real lawyer's call might. A number on screen can't show who's calling, so it can't prove anything either way.") · request **RF** ("He wants the transfer sent now, without the usual sign-off, and kept secret. A second person 'confirming' right after a secret request adds pressure, not proof.") · phone_number **RF** ("01 •• •• •• 07: the number he gives you to check him. Calling a number the caller gives you only reaches him again. Use the Ruchelune directory.") · reference D ("Cabinet Ostrelle", neutral).
- Actions: "Send the transfer now" (`pay`) · "Hang up" (`hang_up`) → "What now?": call-back label "Call Solène on the directory number" (verify), extra "Call back the number he gave" (`call_number_in_message`, note "That number reaches whoever gave it to you. Use the Ruchelune directory."), report, "Leave it there".

**Beat 3, video call (`arrives_after: 45`, 40 s, `covered_by: [start, lawyer_call]`; CR-24).** "Video call · Solène Arbogast" (Kettle). A stylised **illustration** of the fictional Solène at an airport gate: never photoreal, no generated face or voice, **no glitch effects** (the lesson is the request, not "spot the glitch"; fr-dgsi-flash-117-2025, de-bsi-deepfakes caveat). Transcript:
1. "It's me. I know this is unusual, and I'm sorry to put it on you."
2. "I'm boarding in two minutes. I'm approving it myself, right now, so you don't need anyone else's sign-off tonight." (`ask`)
3. You: "Shouldn't Bastien see it too?"
4. "No. Keep it between us until Tuesday. Please send it now. I'm counting on you."
- Checkables (3; R = 1): caller_id D ("Shows the name Solène Arbogast and her photo, as a real call from her would. Names and photos are easy to copy, so it can't prove anything either way.") · `video` D ("Her face and voice, as you know them. A face and voice can be faked convincingly on a live call, so they can't prove anything either way. Judge the request.") · request **RF** ("Her word on a call is meant to replace the sign-off, and you're asked to keep it secret. A real request keeps the usual sign-off, whoever is on the screen.").
- Actions: "Send it now on her word" (`pay`) · "End the call" (`hang_up`) → "What now?": "Call Solène on the directory number" (verify: Solène answers from home, "A video call? That wasn't me. Don't pay anything. I'm calling our bank and changing my email password now.") · extra "Message Adaeze through the staff directory" (`ask_someone`, outcome: "End of the week, secret, no sign-off? Don't send. I'll ring Solène on her directory number.") · report · "Leave it there".
- This models the DGSI case exactly: the person found the request unusual, ended the call and alerted management through the usual channels (fr-dgsi-flash-117-2025). The debrief never says deepfake calls are "common" (medium confidence, no prevalence figure).

**Boss totals:** R = 4 (b1 1, b2 2, b3 1); decoys 7 (b1 sender, reference, IBAN; b2 caller ID, reference; b3 caller ID, video), plus the sub-beat's match and IBAN (not in R). Max 3 × 15 + 6 = **51**. Boss-fall cap and one layer-1 "You chose" line apply (CR-15, T-2.8).
- **After a fall** (once, at the end): `call_bank_recall_transfer` (stop) · `tell_management_known_channel` (warn: Solène on the directory number) · `secure_mailbox_owner` (secure: Solène changes her mailbox password and turns on two-step sign-in) · `report_to_police_online` (report) · `wait_until_after_long_weekend` (harmful) · `keep_quiet` (harmful).
- **Debrief L1 (19):** tell "A secret transfer, a 'lawyer', then her face: the same request." · what works "End the call. Call Solène on the directory number." Layer 2: the three beats' flags; timing ("the eve of a long weekend, when accounts teams are short-staffed": fr-gendarmerie-fovi; a text flag, never a checkable, as with deadlines); "Even a real address can carry a fake request; Solène's mailbox may have been misused, so she changes its password." `already_clicked.paid`: "Call your bank now on the number you already have and ask it to recall the transfer for fraud. Tell Solène on the directory number, keep everything, and report it."
- **Sources:** fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi, eu-europol-ceo-bec-leaflet, fr-dgsi-flash-117-2025, eu-epc-threats-2025, de-bsi-deepfakes, fr-bdf-fraude-moyens-paiement, eu-epc-vop-scheme.
- **QA:** the 40 s beat 1 now includes a banking sub-beat. Paper-playtest the load; the fallback is to give `boss_transfer` its own `timer_seconds: 40` (as a scheduled beat would) if players run out mid-form.

### 23.7 Strategy check (as §7.2)
**Assumptions:** R counts scheduled beats only (`redFlagCount`); flags on banking sub-beats (3-7's "doesn't match") count toward spotting for players who get there, but are not in R.
- **Standard fraud, R and max:** 3-2 R 2 (19), 3-5 R 1 (17), 3-7 R 3 (21), 3-8 R 1 (17) = 74.
- **Fraud decoys on scheduled beats:** 3-2: 2, 3-5: 3, 3-7: 2, 3-8: 4, boss: 7 = 18.
- **Genuine:** 3 × 15 = 45. Own checkables: 3-1: 4, 3-4: 5, 3-6: 4 = 13. Every genuine message has a `request` checkable (CR-21), so the request is never a fraud-only element.
- **Boss:** R 4, max 51.
- **Totals:** max = 74 + 45 + 51 = **170**. R = 7 + 4 = **11**: silver needs spotted ≥ ceil(11/3) = **4**, gold ≥ ceil(22/3) = **8**.
- **No low-stakes genuine message** in Paris (every genuine one asks for money), so the gold off-focus rule can't bite here, and verifying a genuine message is always the habit. Calibration is taught through the over-report cost and the twins.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed or verify genuine | 74 + 45 + 51 | 170 | 100% | 11 − 0 = 11 | **Gold** |
| 2 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (14+12+16+12) + 45 + (30+6) | 135 | 79.4% | 11 | Silver |
| 3 | Ideal but reports Solène's real request (3-6) | 170 − 15 − 5 | 150 | 88.2% | 11 | Silver |
| 4 | Ideal but pays Encrevive's genuine change without calling (3-4, ★) | 170 − 10 | 160 | 94.1% | 11 | Gold (see Q3) |
| 5 | Ideal but trusts the match in 3-8 (fall, damage control 9) | 170 − 17 + 9 | 162 | 95.3% | 11 | Gold (see Q3) |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 88.2% | 11 − (18 + 13) = −20 | Bronze |
| 6a | Random single tag per scenario/beat + always verify (expected) | 150 + 2×(½+¼+⅗+⅕) + 6×(¼·½·⅓) | ≈153 | ≈90.2% | 2.63 − 7.37 ≈ −4.7 | Bronze (silver only if all 7 fraud tags hit: 1 in 1,600) |
| 6b | **Always tag the request** + always verify | 150 + 2 + 2 + 2 (3-2, 3-7, 3-8) + 6 (boss) | 162 | 95.3% | 6 − (1 + 3) = 2 | Bronze |
| 6c | Always tag sender / caller ID + always verify | 150 + 2 + 2 + 2 (3-2, 3-5, 3-7) | 156 | 91.8% | 3 − (4 + 3) = −4 | Bronze |
| 6d | Tag request + sender + always verify | 150 + 4 + 4 (3-2, 3-7) | 158 | 92.9% | 9 − (5 + 6) = −2 | Bronze |
| 6e | Tag request + every bank-details item (IBAN, RIB) + always verify | 150 + 4 (3-7 only; every other tag set includes a decoy IBAN or RIB) | 154 | 90.6% | 7 − (6 + 7) = −6 | Bronze |
| 7 | Blind always-verify (± pause everywhere) | 60 + 45 + 45 | 150 | 88.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.4% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 | 70 | 41.2% | 0 | Bronze |
| 10 | Always trust, perfect damage control | genuine 15 + 5 + 15; 4 × 9; boss 9 | 80 | 47.1% | 0 | Bronze |
| 11 | **"Trust the bank's check"**: pay unless it says "doesn't match", cancel then | 3-1 15, 3-4 5, 3-6 15, 3-2 fall 9, 3-5 fall 9, 3-7 dismiss 10, 3-8 fall 9, boss 9 | 81 | 47.6% | 0 | Bronze |

Row details:
- **6a hit chances** (red flags ÷ checkables per scheduled beat): 3-2 2/4, 3-5 1/4, 3-7 3/5, 3-8 1/5; boss b1 1/4, b2 2/4, b3 1/3. Expected correct = 1.55 + 1.08 ≈ 2.63; wrong = 7 − 2.63 + 3 genuine tags ≈ 7.37. Silver needs every fraud tag to hit (7 correct − 3 genuine = 4): 0.5 × 0.25 × 0.6 × 0.2 × 0.25 × 0.5 × ⅓ ≈ 1 in 1,600.
- **6b (the closest systematic strategy).** The request is a red flag on 3-2, 3-7, 3-8 and all three boss beats, but a decoy on 3-5 (an employee changing banks is an ordinary request; the tell is the outside address), and a genuine detail on all three genuine messages. Net 6 − 4 = 2 of the 4 needed. Its margin depends on two rules the validator should hold for future chapters too: `request` checkables on genuine pay requests (CR-21), and at least one fraud whose request is ordinary.
- **6e:** 3-7 is the only scenario where request and RIB are both red flags (+4); every other fraud tag set includes a decoy IBAN or RIB, so its bonus is void.

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
  - **matches:** always neutral (brief §8: it looks the same on real and fake);
  - **close match:** "It fits" only on genuine, and only when the shown holder can be compared with a document the player already holds (3-1's lease);
  - **doesn't match:** a red flag on fraud;
  - **couldn't check:** neutral ("nothing was checked").

  Validator (CR-23): a `payee.name_check` reveal on a `match` never starts with "It fits".
- **P4. Request reveals** (CR-21) open with "Asks you to…" on genuine and fraud alike. On fraud they go on to name the tell; on genuine they say why the request is ordinary. Never "It fits".
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
- `warn_creditor_known_number`: "Warn the real landlord or supplier on the number you already have: their mailbox may be misused".
- `keep_evidence`: "Keep the emails, bank details, transfer and times".
- `tell_management_known_channel`: "Tell your manager through the directory, not by replying".
- `check_pay_details_with_person`: "Check the pay details with the person directly and put the right ones back".
- `secure_mailbox_owner`: "Ask the person whose mailbox was used to change its password and turn on two-step sign-in".
- `wait_until_after_long_weekend` (harmful). Feedback: "Waiting for the office to reopen feels sensible, but the first hours matter most for getting a transfer back. Call the bank now."

**New habit card `verify-the-change` (LO-06):**
- **Title:** "Verify the change, not the email".
- **Habit:** "New bank details, or an urgent, secret payment? Call the person on a number you already had, and keep the usual sign-off. If your bank says the name doesn't match, stop. If it matches, that only tells you whose account it is."
- **Example** (first shown at 3-2; no scam domain, since it also shows on genuine 3-4): "'Keep this between us and pay today'? Call Solène on the Ruchelune directory number first."
- **Already clicked:** "Paid already? Call your bank now on the number you already have and ask it to recall the transfer. Then warn the person on their known number."

**"Where to report and get help" (France) card**, linked from layer 2 of every Paris debrief. Real organisations are named only here (Red Line 1). `fraud-researcher` verifies each entry into `docs/patterns/where-to-report.draft.en.yaml`, and the red-line allowlist must list them.
1. **Your bank, first and at once:** the number on your card or in your app. Ask it to block or recall the transfer for fraud.
2. **Complaint** with the police or gendarmerie (an online pre-complaint is possible); the bank may ask for it.
3. **17Cyber** (17cyber.gouv.fr): online help 24/7, and a chat with a police officer or gendarme for serious cases.
4. **THESEE online complaint:** only for a money request from a contact's **hijacked** mailbox (3-8 and the boss, not the look-alike scenarios). **Adults only (18+)**, via FranceConnect. Minors can only make a report.
5. **Info Escroqueries 0 805 805 817** (free): advice. No hours shown.
6. **Suspicious texts:** forward them to **33 700**.
7. **Gendarmerie brigade numérique:** questions answered 24/7.
8. Report attempts **even if no money was lost**.
9. **Beware of "recovery" offers** afterwards.

**14+ line** (on the card and in 3-3, 3-5 and 3-7 layer 2): "Under 18? Tell a parent or guardian straight away and call the bank with them: that call is the urgent step. They can make the complaint; online complaint services such as THESEE are for adults."

### 23.10 New brands and cast (requests to `ux-artist`; BRAND_CHECK by `fraud-researcher`)
All names are candidates until BRAND_CHECK clears them. Hosts follow the owner-part rule and survive lowercasing.

| id | Name | Role | Real domain | Look-alikes (scenario) | Notes |
|---|---|---|---|---|---|
| `ruchelune` | Ruchelune | partner cooperative (print and design), Paris | `ruchelune.example` | `ruchelune-direction.example` (3-2, brand plus word, diff 2); `ruchelune.example-rh.test` (3-5, real name first, owner part `example-rh.test`) | addresses `solene.arbogast@`, `ines.roussel@`, `compta@`; staff directory with Solène, Bastien and the front desk (masked numbers) |
| `larchwick-pro` | Larchwick Pro | sub-brand of Larchwick: business account app | `pro.larchwick-bank.example` | none | Ruchelune's account; "Send for approval" (CR-26) |
| `volet-bleu` | Volet Bleu (legal name "Volet Bleu Gestion SAS") | letting agency (your Paris studio) | `voletbleu.example` | `volet-bleu.example` (3-7, an added hyphen, diff 3) | collision risk (restaurant names); alternative "Clef d'Ocre Locations" |
| `encrevive` | Encrevive | paper and ink supplier | `encrevive.example` | none (genuine only) | collision risk with "Encre Vive" shops; alternative "Feuillemont" |
| `pressoria` | Pressoria | press maintenance firm | `pressoria.example` | none (its real mailbox is misused in 3-8) | — |
| `cuivrelin` | Cuivrelin | plumber (drill, quoted) | `cuivrelin.example` | `cuivrelin-factures.example` (3-3) | — |
| `ostrelle` | Cabinet Ostrelle | a law firm the scammer invents (voice only) | none | none | registered so the name is cleared; never a real firm |

- **Fictional account holders** (not brands; ux-artist decides whether they go in the registry): "Ardoise Ateliers" / "Ardoise Ateliers SAS", "N. Ferrand".
- **Cast** (`content/cast.yaml`):
  - `solene`: Solène Arbogast, director, Ruchelune; known channel: Ruchelune directory.
  - `bastien`: Bastien Morel, accounts officer, on leave; known channel: Ruchelune directory.
  - `ines`: Inès Roussel, 17, apprentice designer at Ruchelune; known channel: saved contact (Kettle). Capable: she spots the plumber fake herself.
  - Margaux (front desk) is a directory entry, not cast.

### 23.11 Engine change requests (to `frontend-engineer`; Paris numbers start at CR-21)
- **CR-18 (shared with Amsterdam), "start the transfer" = `prepare_payment` (blocker).** Paris needs no duplicate; it relies on CR-18 having these semantics: class `step` (§23.3), non-terminal, never decisive, no star cap, genuine and fraud, standard and boss. Requires `next_beat` to a `banking` beat with `payee`. The validator requires that beat to offer ≥ 1 verify and a dismiss. `balance.yaml` gets the kind (game-designer, when the engine lands).
- **CR-21 `request` checkable for `pay` and `enter_details` (blocker).** Extend `message.ask` beyond `share_code`/`approve`. `ask.text` may be up to two consecutive sentences, still verbatim. **Required from slot 3 on** every scored email, sms, messenger or call beat whose request is `pay` or `enter_details`, **genuine and fraud alike**, so the request is never a fraud-only element (§23.7 row 6b). Home and Berlin are exempt.
- **CR-22 bank-details card on email and messenger (blocker, or the fallback below).** `payee` (name, iban) on a non-banking message renders as a stylised "Bank details" card, never a real bank's RIB layout. Checkable `payee.iban` only; no name check outside `banking`. Fallback: carry the IBAN in the RIB attachment's reveal. That moves 3-4, 3-8 and boss beat 1 one decoy down, so §23.7 must be re-run.
- **CR-23 payee-check result screen (blocker; with `ux-artist`).** Implements §23.5:
  - the checking state and the four result cards with fictional copy;
  - **no holder name on "doesn't match"** (accuracy fix to the current `bank_name_mismatch` and UI_SPEC §3.7);
  - the liability line on "doesn't match" and the shared footer on every card;
  - match styling without a seal or badge;
  - the scenario's actions rendered inside the card in action_order;
  - the first-use coach mark and new i18n keys.

  Validator: `holder` is required exactly when the result is `close_match`; a `match` reveal never starts with "It fits".
- **CR-24 video call (blocker for boss beat 3).** `call` gains `message.video: { illustration, alt }`: an illustrated, stylised frame of a fictional person. No photoreal images, no synthesised voice audio, no glitch effects. New checkable target `video` (type `video`, label "Face and voice"). `hang_up` is labelled "End the call" and opens "What now?" as usual. Fallback: a voice call with caller ID, request and reference; R and decoys are unchanged if `reference` replaces `video`.
- **CR-25 email thread history (not a blocker).** `message.earlier` allowed on `email` (max 3 earlier messages, muted, not checkable), so 3-8 visibly lands inside a real thread (eu-esas-ai-scams-factsheet-nl).
- **CR-26 business account context (not a blocker).** `message.account: { nickname }` on banking beats (e.g. "Ruchelune · current account") under a Larchwick Pro header, so the player can see whose money it is.

### 23.12 Hand-offs and open questions
**Hand-offs:**
- **scenario-writer:** 3-1 to 3-9 per §23.4–§23.6, with French in-world text plus translations; `content/chapters/paris.yaml` with order am `[01, 02, 03]`, pm `[05, 06, 07, arc, 08, 09]`, `patterns: [ceo-fraud-bec, payment-detail-change]`; the recovery steps and habit card from §23.9.
- **ux-artist:** the brands and cast in §23.10, the payee-check cards and video frame in §23.5 and CR-24, and the four story panels in §23.13. The scenario-writer sets the variant flags: `paris_pay_redirected` on 3-5's fall outcome and `paris_boss_sent` on the boss's fall outcomes; both are story-only, not echo scenarios.
- **fraud-researcher:** confirm Q4; draft the France card (§23.9); run BRAND_CHECK.
- **frontend-engineer:** CR-18 (Paris requirements, shared with Amsterdam) and CR-21 to CR-26. CR-23 (the result screen) should land with or after CR-18, since both touch the banking device.
- **QA:** the boss load (beat 1 now includes a banking sub-beat) and rows 6a–6e of §23.7.

**Open questions (producer):**
1. **Placement and the old Paris bullet.** At merge, §23 should sit after §22 (Amsterdam). The Paris bullet in §18 ("Chapters 2–10") mentions a "spoofed-caller-ID follow-up call", which this spec does not depict: the brief doesn't source spoofing for the lawyer call. Proposal: replace that bullet with "See §23" (one line, not a renumbering).
2. **CR numbers:** Paris uses CR-21 to CR-26 and shares CR-18 with Amsterdam (§23.11). If Amsterdam's CR-18 ends up as a plain engage or with a ★★ cap, Paris needs the §23.3 semantics added to it, or a separate kind.
3. **Gold after one ★ or one well-recovered fall** (rows 4–5). This is the existing rule and holds in Berlin too. I recommend adding `stamps.gold.max_falls: 0` (global; QA re-runs Berlin), so that "trusted the match" can't reach gold in the chapter that teaches it. Producer call.
4. **For fraud-researcher:**
   - (a) 3-8's red flag, "the sender says your bank's check will prove it's them, no need to call", as an application of the EPC coaching tactic (RF 7). If rejected, 3-8 has no checkable red flag and needs a redesign.
   - (b) The "had you typed Pressoria, it would have warned you" line (VoP limit 2 inference), phrased as logic.
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
2. CR-18 is specified once for both chapters in the engine ticket, with the §23.3 semantics (step, never decisive, no star cap). Amsterdam's needs are a subset.
3. `stamps.gold.max_falls: 0` is a global change: parked for the Phase 3 balancing pass, not this chapter.
4. (a)–(e) go to the fraud-researcher fact-check of this spec.
5. Keep the generic mention in the drill only.
6. Accepted for now: the trust-inspector premise makes the workplace natural, and 3-1, 3-3, 3-5 and 3-7 are personal. The learning-psychologist review weighs it.
7. Illustration plus transcript, no synthetic audio, even fictional. The sceptic confirms.
8. Follow-ups after merge, as listed.
9. Track S is merged (PLAN.md); the story bible (`docs/STORY.md`) is in progress and §23.13 aligns to it.

### 23.13 Story beats (track S; illustrated panels, never scored)
Panels are illustrated scenes, ≤ 20 s each and skippable, with real text, and they never score. They never hint at whether a later message is genuine or fake: no panel mentions Volet Bleu, Encrevive or Pressoria before their scenarios. The real Solène in the panels and the "Solène" on the boss video call are drawn the same: a familiar face proves nothing.
1. **Arrival** (chapter intro, before 3-1). You arrive at your third-floor studio, then walk to Ruchelune's workshop. Inès shows you round and points at the procedure card pinned by the screen ("Solène wrote it. She means it."). Cast: You, Inès. Emotion: **calm** (curious, welcoming).
2. **Whose problem it is** (also in the intro, second panel). Solène, coat on, between meetings: the school-festival order is late, Bastien is away for the long weekend, and a small cooperative can't afford a payment going to the wrong place. That's why she asked Waymarker for an inspector. Cast: Solène, You. Emotion: **worried** (stretched thin, not panicked).
3. **Mid-chapter turn** (after 3-5, before 3-6). Inès learns someone used her name to try to move her pay. She is shaken ("They knew my staff number!"); Solène sits with her: "This is why the card says no exceptions." Cast: Inès, Solène, You. Emotion: **worried → calm**. Variant if the player fell in 3-5 (flag `paris_pay_redirected`): the same scene, with "We've called the bank, and we'll sort your pay together." It ends calm, never blames, and promises no money back.
4. **Resolution** (after the boss debrief). Friday evening: the real Solène calls you on the directory number from her kitchen. Tuesday: Solène, Bastien (back from leave) and Inès add a line to the procedure card, "A call or video call never replaces the sign-off", and Inès says she has shown her mum the card. Cast: Solène, Bastien, Inès, You. Emotion: **relieved**. Variant if any boss beat fell (flag `paris_boss_sent`): Solène says "You called the bank straight away, and that was the right first step. We'll see what it can recall." That is relieved that they acted fast, not about the money; there is no promise of a refund (§23.9).

## 18. Chapters 2–10 (map owned by `fraud-researcher`)
**2 Amsterdam (slot 2, diff 2–3).**
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
