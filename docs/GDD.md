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
- **Engage** ends the scenario on genuine messages. On fraud it does not: it always leads to a next beat (validator), and the scenario's stars are capped at 2. **Boss beats** (interim, until the engine supports in-beat follow-ups) offer no engage kinds on fraud; use the comply kind the link leads to, labelled "<do X> through the link" (§16 ruling 4). Exceptions: Madrid boss beat 2's capped `start_transfer` (R16, CR-31(b)) and Warsaw boss beat 1's engage choice (R14, CR-35).
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
  - **Gold:** rating ≥ 90%, no genuine message reported, spotted ≥ ceil(2R/3), and **no extra checks on harmless messages outside the chapter's focus patterns.** Checking a genuine Trundle text in the Trundle chapter never counts against you (QA L2). **Falls (R15, decided at the balancing pass; proposed ruling R24, needs CR-48):** gold allows **at most one fall, and only a recovered one** (its damage control meets LO-16: ≥ 6 points with a `stop` step first). A second fall, or one unrecovered fall, caps the chapter at silver. Definition and numbers: §7.3.
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

### 7.3 Gold and falls; stamps across chapters (balancing pass T-3.13, proposed R24)
Full working: `docs/BALANCE_PASS.md`. All numbers below are hand-computed from the strategy tables in §7.2, §22.4, §23.7, §24.7, §25.7, §26.7, §27.7, §28.7, §29.7 and §30.8 (Home from the three scored fraud files: max 117, R 8; home-04's `page.address` red flag sits on a sub-beat, so 0-4 is worth 17). Damage control is always exactly 3 picks (+3 per helpful step, −2 per harmful, floor 0), so it scores only 0, 4 or 9; "≥ 6 points" therefore means three helpful picks and no harmful one.
- **What counts as a fall:** a scored decision of class comply or proceed on fraud (the cases that run damage control). Each fallen standard scenario counts 1; each fallen scheduled boss beat counts 1 (a banking sub-beat is its parent beat). Not falls: `advise_comply` (CR-40), a code shared then declined (R18), comply on a genuine message (★), an engage cap, a timer expiry, drills, arc and finale beats, interrupts.
- **Rule:** `stamps.gold.max_falls: 1` with `falls_need_lo16_recovery: true`. A boss uses its one damage control for "recovered". `tell_trusted_adult` counts as `stop` (R23(3)), so telling someone first meets the rule; acceptable for 14+. Which steps are `stop` in each fall outcome now decides gold, so T-3.13l audits them (`call_bank_known_number` is `stop` in 28 fall outcomes but `secure` in 6).
- **Rows that change stamp** (all assume perfect damage control, a `stop` step first, unless stated):

| Row | Falls | Pts / max | Rating | Spotted | Today | Under R24 |
|---|---|---|---|---|---|---|
| Dublin §28.7 row 12 (8-3 + boss b3) | 2 | 156 / 172 | 90.7% | 11 | Gold | **Silver** |
| Stockholm §29.7 row 12 (9-6 + boss b3) | 2 | 154 / 170 | 90.6% | 9 | Gold | **Silver** |
| Brussels §30.8 row 14 (10-3 + boss b3) | 2 | 156 / 172 | 90.7% | 10 | Gold | **Silver** |
| New: Berlin, one fall on 1-7 with damage control 4 (2 helpful + 1 harmful) | 1 (not recovered) | 157 / 172 | 91.3% | 10 | Gold | **Silver** |
| New: Berlin, boss beat 3 fall, damage control 0 | 1 (not recovered) | 157 / 172 | 91.3% | 11 | Gold | **Silver** |
| New: Brussels row 13a, boss beat 3 fall, damage control 0 | 1 (not recovered) | 157 / 172 | 91.3% | 12 | Gold | **Silver** |

- **Rows that stay gold** (one recovered fall): Paris row 5 (162, 95.3%), Warsaw row 11 (157, 92.4%), Rome row 12 (162, 93.1%), Lisbon row 11 (160, 94.1%), Brussels row 13 (166, 96.5%). With `max_falls: 0` these five would also drop to silver; R24 keeps them gold on the learning-psychologist's advice (PSYCHOLOGY §9: recovering is itself LO-16).
- **Rows already below gold** are unchanged: Madrid 11, Rome 11, Lisbon 12, Dublin 11, Stockholm 11, Brussels 11 (silver), Paris 11 and every "trust everything" row (bronze).
- **Why the boss rows mattered:** a boss beat's fall costs only 15 − 9 = 6 points with full damage control (added once per boss), against 19 − 9 = 10 for a standard fall, and an unrecovered boss fall (−15) still left 91.3%. The LO-16 condition closes both gaps without touching the point maths or any pinned rating.
- **Stamps across chapters (all ten plus Home):** ideal 100% gold everywhere; careful reporter 78.6–79.9% silver everywhere (Home 92 / 117 = 78.6%); one genuine report 88.1–88.5% silver everywhere (Home 107 / 117 = 91.5% under grace, silver through the genuine-report rule); blind always-verify 86.2–89.7% bronze everywhere (Home 105 / 117 = 89.7%); blind always-report 31.6–32.7% bronze in chapters 1–10 (Home about 51% under grace, still bronze: nothing spotted). One recovered fall at Home (0-2) is 107 / 117 = 91.5%, gold; a Home fall with damage control 4 is 102 / 117 = 87.2%, silver by rating (and not recovered). No systematic tagging rule reaches silver in any chapter; the thinnest margins are net 4 against silver's 5 (Amsterdam 6c, Rome 6c, Lisbon 6b, Stockholm 6d), to stay pinned in content tests (T-3.13k).
- **Stamp copy (learning-psychologist):** two hint keys in the existing "To reach gold next time:" format, only the first shown if both apply: `tier_need_falls_recovery` (a fall without LO-16) "after a slip, pick only steps that help, starting with the one that stops the damage"; `tier_need_falls` (2+ falls, all recovered) "keep it to one slip or none (you already stop the damage well)". Rule line wherever gold is explained before play: "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage." Never a count of falls on the end screen (§30.5).

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
  - **Length is set by chapter slot** (60 s in slots 0–1, down to 35 s in slots 9–10) and is the same for genuine and fraud scenarios. Call beats last 30 s, boss beats 40 s. **A call beat inside a boss** runs 40 s in slots 0–7 and 30 s from slot 8 (balancing pass, proposed R26; balance `timers.boss_call_beat_by_slot`), so the curve only tightens; content sets it with `timer_seconds` (Home beat 3 to fix, T-3.13a; Rome beat 1 needs CR-54).
  - Timers **freeze** while the pause menu, settings, help, debrief, translation, a coach mark or "Take a breath" is open. Coach marks were added in Paris rework 1; the engine needs a `coach_mark` freeze reason, requested in CR-23.
  - First expiry: the pusher escalates and the timer gets +20 s. Second expiry: scored as dismiss. On fraud the debrief says *"The deadline was fake. Nothing happened."* ("Nothing happened" only when nothing fell; after a fall: *"The deadline was fake."*). On a **genuine** message the expiry scores what the beat's deliberate dismiss option scores, never more (producer ruling R21, 2026-11-19, superseding the Berlin QA ruling below: on high stakes that is 0 from slot 1, ★ and 5 points under tutorial grace; with no dismiss option on that beat, the lowest one on the group's later beats; with none at all, ★ and 5 points). Before R21: ★, 5 points in every slot (Berlin QA ruling, T-2.8; balance `timer_expiry.genuine_high`), and the debrief names the message's own deadline (`honest_deadline`, required by the validator on timed genuine scenarios). **Balancing pass (T-3.13, proposed R26):** R21's scores stay. Where a genuine expiry scores 0 (the 12 timed high-stakes genuine scenarios from Berlin on), the debrief no longer says "Nothing is lost yet" next to no stars; it uses `deadline_genuine_missed` (CR-50): "Time's up in the game, so it counts like leaving it. Its real deadline: {deadline}. Checking it your own way works." (wording for learning-psychologist). "Nothing is lost yet" stays where the expiry scores ★ or ★★.
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

All endings show the red-flag timeline (slot 1 is shown as "Nothing to notice yet"), the habit cards, and the help list. Every ending shows the reveal (R22): it plays on "Tell me now", and every outcome of the finale's close beat and Teo's chat opens it. Whenever money is in (C, and R or a late report with `alex_invested > 0`), the arc damage control opens with "Alex was never real. The lie was theirs, not yours." (R22).

**Balancing pass (T-3.13, proposed R25; `docs/BALANCE_PASS.md` §4):**
- **Arc order follows beats played, not chapter position (CR-49).** Today position N plays slot N (`arcSlotAt`), and a position is fixed when a chapter is first started. A player who starts Berlin, leaves it before its arc beat and finishes Amsterdam meets Alex first with slot 2's "move to Kettle". CR-49: the next arc beat plays the lowest slot not yet played (after a slot-1 Close, the slot-1 repeat comes next and slot 2 is then skipped). Nine middle chapters still play nine arc beats, so slot 9 is always the last one before Brussels and the close beat's "Yesterday" (slot 9's message) is always true. Until CR-49 lands, the default map order is unaffected.
- **Slot 2 skipped after a slot-1 Close: accepted.** That player has already stepped back once; the off-platform tell returns in Warsaw boss beat 1 and Lisbon, and slot 3 carries the same safeguarding line. Slot 3's layer 2 gains one true-for-everyone sentence about being moved to another app (T-3.13b). The timeline lists only played slots, so no empty row.
- **Ending C's extra scored rounds: accepted.** Arc points are never shown (R22) and arc beats demonstrate no habit, so the extra rounds are practice, not an advantage.
- **"You told someone" (ending B):** a photo check alone is not telling someone. The close beat's photo check sets `arc_checked`, not `arc_told_someone`; `arc_told_someone` comes from any report or `ask_someone` anywhere in the arc (CR-51). Ending B's line has a truthful variant (§30.6).

## 11. Progression and rewards
- **Passport stamps** per city on an illustrated map (no tile services, no network).
- **Habit cards** (one per LO) are earned on first demonstration and turn gold at mastery. They are printable on the end screen.
- **Notebook** of correctly spotted red flags.
- No currencies, streaks or leaderboards.

## 12. Difficulty and session length
- **Difficulty** is 1–5 per scenario, and the band is set by **chapter slot**, not city (`balance.yaml`). At level 5, the main tell is the request itself.
- **New material:** up to 2 new patterns plus 2 callbacks per chapter. The finale (`arc_finale`) is exempt from the callback cap (R23(1); balance `difficulty.callback_cap_exempt`, confirmed at the balancing pass).
- **Curve check (balancing pass T-3.13, `docs/BALANCE_PASS.md` §3):** bands, boss difficulty, timers and interrupts rise monotonically by slot. Flags: boss call beats now tighten from 40 s to 30 s at slot 8 (rule in §8; Home beat 3 and Rome beat 1 ran 30 s early); Rome is the only chapter with no calm scored scenario (LO-04 is core in slot 6 and the content note is in place; QA watches stress; after psych review one calm scored scenario is added in T-3.13m: timer off 6-5 and the timer or pusher off one non-call fraud scenario, keeping parity); Madrid has one new pattern (a deliberate breather after Paris); the spec estimates sum to about 3 h, the top of the band.
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
1. **`you_chose_dismiss_started`** is "You left it. This one was safe; it was yours." (CR-45: generic, no longer names a reset; was "You left it. You started this reset; it was safe.") The ruled "…reset, so it was safe." is 11 words on the validator's `wordCount()` and put 0-3 at 41 layer-1 words; dropping "so" keeps it at 10.
2. **"Fair instinct" wrong-mark lines are per type** (UI_SPEC §8.2): caller ID "…a faked number can show the same saved name…" (fact-check wording, T-2.7 review), sender "…a real message shows the same name…", logo "…a real message shows the same logo…", each ending "so it can't tell you which this is."
3. **The spotting tier hint drops "to reach silver"**: "Spot at least {n} red flags. Each mark on a safe detail takes one off. Your count: {net}." It sits under "To reach silver next time:" or "To reach gold next time:", which already names the tier.
4. **No tutorial grace on timer expiry.** (Superseded by producer ruling R21, 2026-11-19: on a genuine message the expiry scores what the deliberate dismiss option scores, grace included, never more; the rest of this item is history.) A timer running out is not a choice, so it scores the star table (timer_expiry = dismiss) in slot 0 too. **Superseded in part (Berlin QA ruling, T-2.8):** on a genuine high-stakes message the expiry scores ★ and 5 points in every slot, slot 0 included (`timer_expiry.genuine_high`); the copy is `deadline_genuine` with `{deadline}` = the scenario's `honest_deadline`. Fraud expiry still scores as dismiss. **Producer ruling (T-2.8, from the sceptic review):** both `tutorial_grace` cells are now ★ and 5 points, so a deliberate "Close the page and try later" in Home is never worth less than letting the timer run out. **QA T-2.8 M1:** the opener's `proceed` (a setup step: `proceed` with `next_beat` from a beat with `request: none`) is never recorded as a decision, so an expiry on the next beat scores as the expiry (★, 5), not as the opener's ★★★.

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
  - **(a) Kind and class.** New kind `start_transfer` in a new class **`step`**: non-terminal, never decisive, no star cap. Allowed on genuine and fraud, in standard and boss scenarios (boss beats included; the §16 ruling 4 engage ban doesn't apply). Test: a group with only `start_transfer` + a banking-beat verify scores as that verify (★★★). Exception: a `start_transfer` reached from a fraud call carries `cap: engage` (R16, CR-31(b)).
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
3. `stamps.gold.max_falls: 0` is a global change: parked for the Phase 3 balancing pass, not this chapter. **Balancing pass (T-3.13):** `max_falls: 1` with LO-16 recovery proposed (R24); rows 4 (★ on a genuine change, not a fall) and 5 (one recovered fall) stay gold (§7.3).
4. (a)–(e) go to the fraud-researcher fact-check of this spec.
5. Keep the generic mention in the drill only. **Superseded by fact-check (rework 1, item 5):** the drill names only sourced creditors (a landlord, a tradesperson, an energy or phone company). Clubs and schools are not mentioned on screen.
6. Accepted for now: the trust-inspector premise makes the workplace natural, and 3-1, 3-3, 3-5 and 3-7 are personal. The learning-psychologist review weighs it.
7. Illustration plus transcript, no synthetic audio, even fictional. The sceptic confirms.
8. Follow-ups after merge, as listed.
9. Track S is merged (PLAN.md); the story bible (`docs/STORY.md`) is in progress and §23.13 aligns to it.

### 23.13 Story beats (track S; illustrated panels, never scored)
Panels are illustrated scenes, ≤ 20 s each and skippable, with real text, and they never score. They never hint at whether a later message is genuine or fake: no panel mentions Volet Bleu, Feuillemont or Platinoir before their scenarios. The real Solène in the panels and the "Solène" on the boss video call are drawn the same: a familiar face proves nothing.
1. **Arrival** (chapter intro, before 3-1). You arrive at your third-floor studio, then walk to Ruchelune's workshop. Inès shows you round and points at the procedure card pinned by the screen ("Solène wrote it. She means it."). Cast: You, Inès. Emotion: **calm** (curious, welcoming). *Producer ruling R8 (DECISIONS.md): beats 1 and 2 play as one Arrival scene: the studio as a caption only, then Solène, then Inès with the card, ending calm.*
2. **Whose problem it is** (also in the intro, second panel). Solène, coat on, between meetings: Bastien is away for the long weekend, and it's the busiest week of the year. That's why she asked Waymarker for an inspector. Cast: Solène, You. Emotion: **worried** (stretched thin, not panicked).
3. **Mid-chapter turn** (after 3-5, before 3-6). Inès learns someone used her name to try to move her pay. She is shaken ("They knew my staff number!"); Solène sits with her: "None of this is on you, Inès. This is why the card says no exceptions." Cast: Inès, Solène, You. Emotion: **worried → calm**. Variant if the player fell in 3-5 (flag `paris_pay_redirected`): the same scene, with "We've put your real details back before payroll, and we'll sort this together." Inès adds: "It even had my staff number. It would have fooled anyone." It ends calm, never blames, and promises no money back.
4. **Resolution** (after the boss debrief). Friday evening: you ring the real Solène on the directory number; she answers at home (a plain-wall panel, not a video call; rulings R4, R5). Tuesday: Solène, Bastien (back from leave) and Inès add a line to the procedure card, "A call or video call never replaces the sign-off", and Inès says she has shown her mum the card. Cast: Solène, Bastien, Inès, You. Emotion: **relieved**. Bastien is calm throughout (R7). Variant if any boss beat fell (flag `paris_boss_sent`): until the story layer can read the first damage-control pick, one merged line is used, "The bank was called straight away, the right first step. We'll see what it can recall." (ruling R6). Once that hook exists, the line depends on the player's first damage-control pick, which the story layer reads from the boss result (the same data as LO-16's "first pick is `stop`"; track S to expose it):
- first pick `stop`: "You called the bank straight away, and that was the right first step. We'll see what it can recall.";
- otherwise: "We called the bank together straight away; that's always the first step. We'll see what it can recall."

Either way the relief is about acting fast, not about the money, and there is no promise of a refund (§23.9).

## 24. Chapter 4 — Madrid
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Brief: `docs/patterns/bank-safe-account-call.md` (BSA), plus `docs/patterns/multichannel-support-callback.md` (MSC) for the one callback. Per-scenario sources are in `docs/patterns/ch4-madrid-sources.md`. This section cites no source ids inline, because several contain names on the red-line denylist (as for Paris). It replaces the §18 Madrid summary. CR numbers continue after CR-29: Madrid adds **CR-30 and CR-31**, Warsaw adds **CR-32 to CR-35** (§25.10). Review round 2 (2026-11-19) applies the round-1 fixes and producer rulings R9–R17 (DECISIONS.md).

### 24.1 Goal, shape, rules check
- **The chapter habit (H), worded once and reused** (goal line, layer 1 of the boss, the stamp screen, Lucía's If-then line in spirit): **"No real bank asks you to move your money to keep it safe. Hang up, and call the number on your card."** (BSA §4.) The second half has a twin for texts: "Call only the number on your card, or open the Larchwick app yourself. Never call a different number a text gives you." (Real Larchwick texts may quote the card's number, as 4-6 does; that is consistent with the habit.)
- **What the chapter teaches, in order of weight:**
  1. Moving money "to keep it safe" **is** the scam, whoever asks, whatever the screen shows (BSA §3.1). Being guided to make a payment in your own real app is the tell; "we won't ask for your passwords" is **not** reassurance (BSA §3.5). **Ruling R16:** following a fraud caller's steps into your own banking app takes the engage cap (★★), even if you hang up before confirming (4-5, boss beat 2; CR-31(b)).
  2. A text inside the bank's **real** thread proves nothing; the tell is that it gives you a number to call that isn't the one on your card (BSA §3.2–3.3).
  3. The bank's name or number on the call screen proves nothing (BSA §3.4). A number **you dial yourself**, from your card, is the one you can trust.
  4. Codes: a code "to cancel" a payment is a code to make one (BSA §3.6; MSC callback).
  5. Calibration: real Larchwick texts and a real Larchwick call sit in the same thread or on the same caller ID, and ask for nothing like that (BSA §7).
- **Shape:** slot 4, difficulty 2–4, boss 4. Timers 50 s (slot 4), call beats 30 s, boss beats 40 s. **8 scored scenarios: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus 1 drill (4-4) and the arc beat. Estimated 16–18 min including scenes (QA to measure; the cut candidate if over is 4-3's engage branch, not a scenario).
- **New pattern (1):** `bank-safe-account-call` (4-2 genuine twin, 4-3, 4-5, 4-8, boss; 4-8 is BSA's "older chain", a text link to a fake bank login, BSA §2, §6). **Callback (1):** `multichannel-support-callback` (4-7 the code "to cancel"; 4-6 is its genuine twin).
- **LO focus:** LO-08 (core), LO-01, LO-04 (core in slot-4 chapters per the LO doc), LO-05, LO-03, LO-02 (4-8), LO-17, LO-16, LO-18 (drill), LO-14 (arc).
- **Flavour:** Spanish in-world text (`lang="es"`, inline translation, never a red flag) in chats with Andrés and Lucía, the market stall, and interrupts. **Larchwick is the player's own bank and writes in English in every message, real or fake**, so language is never a tell. Late dinners, night shifts, saving for a first flat. A city is a stage, not a claim: no debrief says this scam "is Spanish" (MAP.md).
- **Premise and intro** (CR-27 intro screen, ≤ 20 s): "Madrid: you're staying in Lucía and Andrés's spare room while you write the Madrid page of the Atlas. Your travel allowance has just landed in your Larchwick account, so this week your phone is your wallet."
- **Rules card** (CR-27 pinned card, title **"On the back of your Larchwick card"**), one item only: "Questions about your account? Call us on 9•• ••• •00 or open the Larchwick app." It makes the known channel a concrete object the player can compare numbers with. It says nothing about what Larchwick never asks, so it hands over the channel, not the verdict. The number is masked (Red Line 3); "the number on your card" in every label means this one.

**Mix rules (balance v3.1):**
- **Genuine share** 3/8 = 37.5% ✓. **Truth order** (scored): G G F · F G F F F(boss), max run 3 ✓.
- **Themes:** `home` 1 (4-1), `bank-call` 4 (4-2, 4-5, 4-7, boss), `bank-text` 3 (4-3, 4-6, 4-8). Max 4/8 = 50% ✓. Scored order home, call, text, call, text, call, text, call: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 (4-2 call timer, 4-6 timer + pusher) = 66.7%; fraud 4/5 (4-3, 4-5, 4-7, boss) = 80%; gap 13.3 points ✓. 4-1 and 4-8 are deliberately calm.
- **Difficulty parity:** genuine at 2 (4-1), 3 (4-2), 4 (4-6); fraud at 2 (4-3), 3 (4-5), 4 (4-7, 4-8, boss) ✓.
- **Decoys:** ≥ 2 on every fraud (counts in §24.7). **Sender-or-link decoy:** F = 5 needs 2; the in-thread sender in 4-3, 4-8 and boss beats 1 and 3, and the caller ID in 4-5, 4-7 and boss beat 2 ✓.
- **Interrupts:** every difficulty-4 scenario has one, all genuine, unscored, small talk that never points to the verdict (4-6 Andrés, 4-7 Lucía, 4-8 Noor, boss Andrés after beat 3).
- **Off-focus genuine:** 4-1 (Andrés, no pattern). Calling Andrés to check costs gold, as Berlin 1-2. 4-2 (pattern `bank-safe-account-call`) and 4-6 (pattern `multichannel-support-callback`) are in focus, so checking them is always free.
- **Red Line 8:** every scenario is SMS, call, messenger, browser or banking. No doorstep card pick-up, no cash courier (MAP: out of scope); scenarios end at the digital request.
- **Never on screen** (BSA §5, §6, §10): no statistics; no refund promise ("may", never "will"); no claim that Spain's sender register has stopped spoofed texts; no depiction of how sender IDs or caller IDs are spoofed; no "how the gang worked"; spelling and accents are never tells.
- **The Spain sender register (ruling M5):** the register is **never presented as protection**. Its only on-screen use is one layer-2 line in 4-3, word for word from `ch4-madrid-sources.md`: "Since September 2026, Spanish phone companies must block texts under sender names that aren't registered. Even so, a text in your bank's real thread is no proof." It appears nowhere else (no layer 1, no habit card, no help card, no scene).

### 24.2 Story beats (track S; illustrated panels, never scored)
Scenes follow STORY §3.4 (updated with this spec) and §4. No panel shows a message, number, amount or the word "bank" next to a phone screen before its scenario; no panel mentions a safe account, a security department or a code.
1. **Arrival** (before 4-1; 3 panels; calm). A sunny kitchen at 8 a.m. Lucía comes in from her night shift as you get up: "Coffee's there. I'm going to sleep for a year." Andrés, laughing: "Every euro is saved for the flat. Even this coffee is in a spreadsheet." Caption on the street backdrop first: "Madrid. Your host's spare room, and the Atlas page to write." Cast: Lucía, Andrés. *Calm.*
2. **Turn** (stop point, after 4-3, before drill 4-4; 3 panels; worried → calm). Afternoon. Andrés, worried: "Next week we send the deposit for the flat. Biggest transfer of our lives. I keep checking the app." Lucía, just up, calm and last: "After nights, my rule: no big decisions until I've slept. Not one." Andrés, laughing: "So I'll make the decisions. Kidding." *Change from STORY v1.3:* Andrés no longer says "the bank's been texting about the deposit transfer". Right before a drill about a fake bank text, that line would have cast doubt on his real bank messages (STORY §4.2 rule 2). Cast: Andrés, Lucía. *Worried, ending calm.*
3. **Resolution** (after the boss debrief; 3 panels + If-then, 4 total; relieved). Two days later, keys on the kitchen table: they got the flat. Andrés, proud: "Signed. And I checked every step in the app myself." Lucía, warm: "Sleepy or not, same rule." Then the **If-then panel (Lucía), word for word from STORY §3.4:** "If someone says my money isn't safe, then I hang up and call the number on my card." Extra line under it on the postcard and Atlas page: "No real bank asks you to move your money to keep it safe."
   - **Variant `madrid_money_moved`** (story-only flag, set by the boss's fall outcomes; STORY §4.2 rule 5). One extra panel, Lucía (calm): "The bank was called straight away, the right first step. We'll see what it can recall." Same merged wording as Paris R6 (true for every first pick, no refund promise). **Order with the variant (psych S1):** Lucía's bank-step panel first → the keys and Andrés's "Signed" → Lucía's "Sleepy or not" → If-then, so the player's loss is acknowledged before the hosts' good news. Andrés's "Signed" panel still plays: their flat is never at stake in any branch.
- **Truth in every branch:** the locals' money is never in a scored scenario, so "they got the flat" is true whatever the player did. Lucía's rule is shown working in drill 4-4 (her own phone), which is unscored and ends the same way for every pick.
- **Map invitation (Lucía):** "Our spare room is yours whenever you come. Bring an appetite." (STORY §3.4.)
- **Panels:** 3 + 3 + 4 = 10 (+1 with the variant), inside the budget of about 12.
- **Safety:** money-fear theme, calm pacing (STORY §5.3). `worried` never escalates; the turn resolves its own worry. No content note (ruling R11).
- **Art (psych S4):** Lucía's If-then panel uses a phone-at-the-ear pose (she is calling the number on her card), flat on the ear as in ART_DIRECTION's phone-ear rule.

### 24.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 4-1 | AM | Andrés: "Lucía's asleep till three. Dinner at nine, are you in?" | messenger | genuine / low (off-focus) | 2 | — | home | LO-17 |
| 4-2 | AM | A **real** Larchwick call: "We held a €212 card payment as a precaution. Was it you? Just yes or no. Rather check? Hang up and call the number on your card." | call | genuine / low (twin of 4-5) | 3 | call timer 30 | bank-call | LO-17, LO-08 |
| 4-3 | AM | A fake text **in the real Larchwick thread**: "A transfer of €2,940 is being processed. Not you? Call us now to stop it: 9•• ••• •14." Calling leads to a "security department" | sms → call | fraud | 2 | timer 50 + pusher | bank-text | LO-01, LO-08, LO-03, LO-04 |
| | | *Stop point + turn* | | | | | | |
| 4-4 | PM | **Drill: Lucía slept on it.** A text landed in *her* real Larchwick thread overnight. She followed her rule; now she asks you what to check | messenger (quoted sms) | drill | 2 | — | — | LO-18, LO-01 |
| 4-5 | PM | Incoming call, caller ID **"Larchwick Bank"**: "I won't ask for your passwords or codes. Stay on the line, open your app, and I'll guide you to move your balance to a reserve account." The call stays on the line over the Larchwick app; the bank says **doesn't match** | call → banking | fraud (new pattern core) | 3 | call 30 + pusher; then timer 50 | bank-call | LO-08, LO-04, LO-06 |
| 4-6 | PM | You're paying €24.90 at Thimble & Pine; a **real** Larchwick code arrives in the same thread, under this morning's fake: "Enter it to confirm your payment… Valid 5 minutes." | browser → sms | genuine / high (twin of 4-7, 4-8) | 4 | timer 50 + honest pusher; interrupt | bank-text | LO-17, LO-05 |
| 4-7 | PM | Caller ID "Larchwick Bank", knows your name and card ending: "Read me the cancellation code we've just texted you and I'll stop the €640 payment." The text says the code is to **confirm** a payment | call (code banner) | fraud (callback MSC) | 4 | call timer 30; interrupt | bank-call | LO-05, LO-08, LO-01 |
| *arc* | PM | Arc slot N for this play position (default position: slot 4, §10.1) | messenger | arc | — | — | — | LO-14 |
| 4-8 | PM | In-thread text: "We've paused your card after an unusual payment. Check it and turn it back on in your Larchwick app: larchwick-secure.example/app" | sms → browser | fraud | 4 | interrupt | bank-text | LO-02, LO-03, LO-01, LO-05 |
| 4-9 **Boss** | PM | Evening, alone. Beat 1: in-thread text, a €1,950 transfer, "call our security department". Beat 2: a call showing "Larchwick Bank" that guides you to move your balance in your own app (bank: **match** on the name the caller dictates). Beat 3: in-thread text, "move your balance to the security reserve tonight". | sms → call (+ banking) → sms | fraud | 4 | boss timers 40 + pusher; interrupt after beat 3 | bank-call | LO-08, LO-01, LO-04, LO-03, LO-16 |

### 24.4 Scenario specs
Shared rules: action order follows the validator (`action_order`); labels ≤ 8 words, describing behaviour, never the verdict. Phone numbers masked as `9•• ••• •NN`; the card's number ends **00** and no other number in the chapter does. IBANs checksum-invalid, generated by content tooling, masked (`ES•• •••• •••• •••• •••• 0417`). "R" = red flag in R, "D" = decoy, "G" = a genuine message's own detail. Every scored scheduled beat has a `request` checkable (CR-30, §24.9), genuine or fraud. Reveal wording follows CONTENT_GUIDE and the Madrid rulings M1–M6 (§24.8). Layer-1 counts are authored words; the writer runs the validator's full count and shortens the tell, never the habit.

**Damage control (all Madrid falls):** at most 6 options, exactly 2 harmful (§9). `tell_trusted_adult` counts as `stop` next to the scenario's own stop step (as Amsterdam), because the player's own money is at stake and players may be 14.

**4-1 `madrid-01-dinner-at-nine`** · genuine, low, off-focus · messenger · diff 2 · calm · Kettle · cast Andrés, Lucía (mentioned)
- **Message:** from the saved contact "Andrés (Madrid)". "¡Buenos días! Lucía's asleep till three after her nights, so the kitchen's yours, quietly 🙂 I'm cooking lentils tonight. Dinner at nine, are you in?" (`lang` mix: the greeting is Spanish with translation). `request: reply`, `ask` = "Dinner at nine, are you in?"
- **Checkables (G, 2):** `sender.detail` ("It fits: Andrés's saved contact, in your usual chat. That isn't proof on its own, so weigh it with what he asks for: whether you're in for dinner."; allowed, low stakes, ruling 1 of §22.8) · `request` ("Asks whether you'll be in for dinner. No money, no code, no link.").
- **Actions:** "Reply: I'm in, thanks!" (`proceed`, target, ★★★) · "Call Andrés first to check" (`call_back_known`, ★★★, off-focus double check: blocks gold; outcome "Andrés, puzzled but cheerful: 'Yes, it's me. Lentils at nine!'") · "Report the message" (report, 0, −5) · "Don't answer" (`ignore`, ★★).
- **Debrief L1 (genuine):** tell "Your host, asking about dinner. Nothing else." · what works "Reply as normal." Layer 2: "Most messages are fine. Save your checks for ones that ask for money, codes or a login." Habit card `calm-not-paranoid`.

**4-2 `madrid-02-real-card-call`** · genuine, low · call · diff 3 · call timer 30 · `pattern: bank-safe-account-call` (in-focus twin of 4-5) · Larchwick
- **Setup:** "Mid-morning. Your phone rings."
- **Message (call):** caller ID "Larchwick Bank" (detail: "Saved contact: Larchwick Bank, the number on your card"). Transcript:
  1. "Hello, Larchwick Bank's card team. We've held a card payment of €212.00 to an online shop as a precaution."
  2. "We'll never ask for your PIN, passwords or codes, or ask you to move money." (`claims[0]`)
  3. "Was it you? Just yes or no." (`ask`)
  4. "If you'd rather check, hang up and call us on the number on your card, 9•• ••• •00."
  `request: reply`; `phone_numbers: ["9•• ••• •00"]`.
- **Checkables (G, 5; parity with 4-5 and 4-7):** `phone_number` (M3 neutral: "9•• ••• •00, the number on the back of your card. A call can quote it, so it can't prove the call is real, but calling that number reaches Larchwick.") · `caller_id` (neutral, M2: "Shows Larchwick Bank, the number on your card, as a real call would. A number on screen can be faked to show the same, so it can't prove anything either way. Judge what the caller asks.") · `reference` (the held payment, neutral: "A card payment you didn't make, held. A fake call can describe a payment too, so it can't prove anything either way.") · `claim` (neutral, M4: "Says the bank never asks for passwords or codes, or to move money. Real banks say this, and a fake caller can say it too, so it can't prove anything either way. Judge what you're asked to do.") · `request` ("Asks only whether the payment was yours, yes or no. Nothing to move, no code, no app steps, and you're free to hang up and call back.").
- **Actions:** "Answer: no, that wasn't me" (`proceed`, target, ★★★; outcome "Thanks. We've blocked that card. Your new card is in the app's Cards tab. Nothing else to do.") · "Hang up" (`hang_up`) → "What now?": call-back label "Call the number on your card" (verify ★★★; outcome "Same team, same answer: the payment was held and the card is blocked. 'Calling back is always fine.'") · report (0, −5) · "Leave it there" (dismiss on genuine low, ★★; outcome "Later the app asks you to confirm the held payment wasn't yours. You tap 'Not me'.").
- **Debrief L1 (genuine):** tell "A yes or no, nothing to move, and fine with a call-back." · what works "Answering was fine; calling back is never wrong." Layer 2, why it was safe: it asked nothing you'd regret (no code, no money moved, no app steps), and it offered the number on your card. "The bank's name on screen proved nothing either way; what it asked for did." This is the "real" half of the chapter's twin; the fake (4-5) copies the caller ID and the reassurance and differs in the request.

**4-3 `madrid-03-text-in-the-thread`** · fraud · sms → call · diff 2 · timer 50; pusher at 25 s (same thread): "LARCHWICK: Transfer still processing. Call now to stop it." · levers fear, urgency, authority · Larchwick
- **Message (sms, sender LARCHWICK).** `earlier[]` (CR-25 thread history, genuine, muted): "Yesterday 18:12 · Card payment of €18.60 at MERCADO PUESTO 14." · "Mon 09:03 · You've received €400.00 from WAYMARKER NETWORK." Today: "LARCHWICK: A transfer of €2,940.00 to ES•• •••• 0417 is being processed. Not you? Call us now to stop it: 9•• ••• •14." `request: call`; `ask` = "Not you? Call us now to stop it" (CR-30); `phone_numbers: ["9•• ••• •14"]`; `references: ["ES•• •••• 0417"]`.
- **Checkables (4; R 2):**
  - `sender.detail` **D** (M1): "Shows LARCHWICK, in the same thread as your real Larchwick texts, as a real one would. A sender name can be faked so a text lands in the real thread, so it can't prove anything either way. Judge what it asks."
  - `reference` **D**: "An account ending 0417. Real and fake alerts both show a masked account, so it can't prove anything either way."
  - `phone_number` **R** (M3): "9•• ••• •14: a number given in the text. It isn't the number on your card, which ends 00. Calling it reaches whoever sent the text."
  - `request` **R**: "Asks you to call a number it gives you about a payment you don't recognise. A real alert sends you to your own app or the number on your card."
- **Actions:** "Call the number in the text" (`call_number_in_message`, engage → `security_line`, target) · "Open the Larchwick app yourself" (`verify_in_app` ★★★; outcome "No transfer, nothing pending. Your balance is as it was.") · "Call the number on your card" (`call_back_known` ★★★; outcome "Larchwick: 'No such transfer. We'd never ask you to move money, and the number on your card is the only number to call us on. Thanks for checking.'") · "Report the text" (report ★★) · "Delete it" (`delete` ★★).
- **`security_line` (call you placed, 30 s; not in R).** Transcript: "(Recorded message) Welcome to Larchwick Bank. Connecting you to our security department." · "Security department. I can see the transfer. We've paused it, but your account is exposed." · "I won't ask for your passwords." (`claims[0]`) · "Open your Larchwick app and I'll guide you to move your balance to a safe reserve account while we fix this." (`ask`). Sender display "9•• ••• •14", detail "The number from the text". `request: pay`. Checkables: `claim` D (M4), `request` R ("Asks you to move your money to keep it safe. No real bank does that. That request is the scam."). Actions: "Follow their steps in your app" (`pay`, fall) · "Hang up" → "What now?": "Call the number on your card" (verify, ★★ engage cap) · extra "Open the Larchwick app yourself" (`verify_in_app`) · report · "Leave it there".
- **Fall** (`pay` on `security_line`): narrative "You move €3,240.18 to the 'reserve account' as the voice guides you. 'Done. We'll be in touch.' The line goes quiet." Damage control (6, 2 harmful): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `keep_call_evidence` (secure, new) · `report_police_copy_to_bank` (report, new) · harmful `call_back_caller_number` (new) · harmful `wait_and_see`.
- **Debrief L1 (≈18):** tell "A number that isn't your card's, in your bank's real thread." · what works "Don't call it. Open your app, or call your card's number." Layer 2:
  - "A logo or familiar name proves nothing. Scammers copy them perfectly, even into a real thread." (LO doc standard line.)
  - **The register line (M5), word for word:** "Since September 2026, Spanish phone companies must block texts under sender names that aren't registered. Even so, a text in your bank's real thread is no proof."
  - **"Behind that number"** (true whether or not the player called; was "If you'd called", Madrid QA round): "Behind that number: a recorded menu, then a 'security department' that won't ask for your passwords, and wants you to move your money to a 'safe' account. That move is the scam."
  - Device tip: "On a real phone, a text can sit right under your bank's genuine messages. Check in the app you open yourself."
  - `already_clicked`: `clicked` "Called the number? Hang up, then call the number on your card and tell your bank what happened." · `paid` "Moved money? Call your bank now on the number on your card and ask it to try to stop or recall the transfer. Keep the texts and the call log."
- Habit card `hang-up-call-back` (producer ruling, Madrid QA round, 2026-11-19: its already-clicked line fits a call that led to a transfer; was `who-really-sent`, whose "change that password" line doesn't). `who-really-sent` is no longer shown in a Madrid debrief; it stays on the atlas page.

**4-4 `madrid-04-lucia-slept-on-it`** (drill, unscored) · messenger with a quoted sms · cast Lucía · `pattern: bank-safe-account-call`
- **Message:** Lucía's saved contact "Lucía (Madrid)". "Just woke up. This came in overnight, in my real Larchwick chat. My rule: nothing big till I've slept. Slept now 😄 What would you check?" Quoted text (`context: quoted`): "LARCHWICK: New sign-in to your account from a new device. Not you? Call us immediately on 9•• ••• •52."
- **Quoted checkables:** `sender.detail` D (quoted; M1 wording, "in her real Larchwick thread") · `phone_number` **R** (quoted; "a number in a text, not the one on her card"). Drill tags never count.
- **Picks** (each gets a Lucía reply; no stars):
  - "Don't call it. Open your Larchwick app yourself." (`proceed`) → "App says no new sign-in. Phew. Deleting it."
  - "Call the number on the back of your card." (`proceed`) → "Card line says they'd never ask me to move money. And the number to call them on? Only ever the number on my card."
  - "Call the number in the text, it's your bank's chat" (`reply`) → "Hmm. Texts can land in the real chat, can't they? I'll use the number on my card instead." (Gentle; Lucía is capable and does the right thing anyway.)
- **Debrief (drill):** tell "Her real bank chat, but a number that isn't her card's." · what works "Her rule worked: she slept, then checked in the app." Layer 2 (psych M3): "Pausing is allowed. A real problem still shows when you open the app yourself or call the number on your card." `already_clicked.clicked`: "Called a number a text gave you? Hang up and call the number on your card." Habit card `pressure-is-the-tell`.

**4-5 `madrid-05-reserve-account-call`** · fraud (BSA core) · call → banking · diff 3 · call 30 s; banking beat on the slot timer (50 s, fresh after the call, §22.7) · levers authority, fear, urgency, helpfulness · Larchwick
- **Message (incoming call):** caller ID "Larchwick Bank" (detail "Saved contact: Larchwick Bank, the number on your card"; M2). Transcript:
  1. "Larchwick Bank, security department. A payment of €1,180 is leaving your account for an online shop right now."
  2. "Don't worry. I won't ask for your passwords or any codes." (`claims[0]`)
  3. You: "Can I call you back on the number on my card?"
  4. "Please stay on the line, or the payment goes through." (`claims[1]`)
  5. "Open your Larchwick app and I'll guide you to move your balance to our reserve account until we've blocked it." (`ask`)
  `request: pay`; `references: ["€1,180 to an online shop"]`.
- **Checkables (5; R 2):** `caller_id` **D** (M2) · `reference` **D** (neutral, as 4-2) · `claim` **D** (M4, the same wording as 4-2's claim) · `claim#2` **R**: "Wants you to stay on the line so you can't check. A real bank is fine with you hanging up and calling back." · `request` **R**: "Asks you to move your money to another account to keep it safe. No real bank does that, however it's explained. That request is the scam."
- **Sourcing note (fraud-researcher):** the "stay on the line" lever (`claims[1]`) is sourced from outside Spain (see `ch4-madrid-sources.md`, the "security department" call row); the debrief presents it as a general tell, never as Spanish.
- **Actions (call):** "Open the app and follow their steps" (`start_transfer` → `reserve_transfer`, target; **R16:** `cap: engage`, so everything after it scores at most ★★, CR-31(b)) · "Hang up" (`hang_up`) → "What now?": "Call the number on your card" (verify ★★★; outcome "Larchwick: 'No payment is leaving your account. We'd never ask you to move money. Thank you for calling.'") · extra "Open the Larchwick app yourself" (`verify_in_app` ★★★) · extra "Call back this number" (`call_number_in_message`, note: "That's the number that just called. It can show the bank's real number, so you can't tell whose line it is. Use the number on your card.") · report · "Leave it there" (★★).
- **`reserve_transfer` (banking; the device moment, §24.5):** the call stays on the line over the app (CR-31; interim: beat-bound pushers from the caller, CR-21). Payee typed as the caller dictates: "Larchwick Reserva"; IBAN `ES•• … 7731`; amount "€3,240.18 (your whole balance)". Result **doesn't match** (no holder shown, CR-23). Caller lines (beat-bound, at 6 s and 20 s): "Type the name exactly: Larchwick Reserva." · "It'll say the name doesn't match. That's normal for our internal reserve. Just confirm."
  - Checkables (not in R): `payee.name_check` **R**: "Doesn't match: this account isn't held by Larchwick Reserva, the name the caller gave you. And no real bank moves your money to keep it safe, whatever the screen says." · `payee.iban` D (P2, neutral).
  - Actions: "Confirm and send €3,240.18" (`pay`, fall, target) · "Hang up and call the number on your card" (`call_back_known`, ★★ under R16) · "Hang up and report it" (report ★★) · "Hang up and cancel" (`ignore` ★★). *Superseded (learning-psychologist CR review, T-3.6):* no custom "You chose" line; the engine's standard line names the capped path (final choice in layer 2), and 4-5 layer 2 carries a fixed sentence true for every player: "Following a caller's steps into your own app is already the risky part, even if you hang up before sending." The 8-word label rule makes the call-back label "Hang up and call your card's number" here and in the boss.
- **Fall** (sets no flag): narrative "Sent. 'Perfect, your money is safe now. Don't use the app for a few hours.' The line goes dead." Damage control as 4-3.
- **Debrief L1 (≈19):** tell "'No passwords needed', just move your money to keep it safe." · what works "Hang up. Call the number on your card." Layer 2:
  - "Not asking for passwords isn't reassurance. They didn't need them: you were going to make the transfer yourself, in your real app. Being guided to move money **is** the tell."
  - "The call showed your bank's name, maybe even its real number. A number that calls you proves nothing. A number you dial yourself, from your card, does."
  - "'Stay on the line' is there so you can't check."
  - "After a 'doesn't match' warning, your bank may not have to refund you. Call it at once anyway." (refunds: "may", never "will"; BSA §5.)
  - `already_clicked.paid`: as 4-3.
- Habit card `hang-up-call-back`.

**4-6 `madrid-06-real-code-for-you`** · genuine, high · browser → sms · diff 4 · timer 50 (honest deadline "Code valid 5 minutes") · `pattern: multichannel-support-callback` (twin of 4-7; also the thread twin of 4-3/4-8) · Thimble & Pine, Larchwick · you started it
- **Setup:** "You're buying a travel adapter from Thimble & Pine, the online shop."
- **Opener (browser, `request: none`):** thimbleandpine.example/checkout, "Confirm with your bank. We've sent a code to your phone." Action "Wait for the code" (`proceed`, setup step, §6 opener ruling).
- **SMS beat (sender LARCHWICK):** `earlier[]`: "Yesterday 18:12 · Card payment of €18.60 at MERCADO PUESTO 14." · "Today 10:41 · A transfer of €2,940.00 to ES•• •••• 0417 is being processed. Not you? Call us now to stop it: 9•• ••• •14." (this morning's fake from 4-3, still in the thread, muted, not checkable). Today: "LARCHWICK: Code 4••••• to confirm your payment of €24.90 to THIMBLE & PINE. Enter it on the payment page. Valid 5 minutes. Never share this code with anyone. Not you? Call us on 9•• ••• •00." `request: enter_details`; `ask` = "Enter it on the payment page."; `claims[0]` = "Never share this code with anyone."; `phone_numbers: ["9•• ••• •00"]`.
- **Pusher** (honest, from the checkout page, at 30 s): "Waiting for your bank… 3:00 left." **Interrupt** at 15 s, Andrés (genuine, small talk): "¿Lentejas otra vez? Joking. Pasta tonight 🙂" (translation).
- **Checkables (G, 5; parity with 4-7):** `sender.detail` (M1 neutral, plus "…You started this payment a moment ago.") · `reference` "€24.90 to Thimble & Pine" (**"It fits":** something the player started: "It fits: €24.90 to Thimble & Pine, the adapter in your basket right now. That isn't proof on its own, so weigh it with what it asks: to type the code where you're paying.") · `claim` (neutral) · `phone_number` (M3: "9•• ••• •00, the number on the back of your card. A text can copy it, so it can't prove the text is real, but calling that number reaches Larchwick.") · `request` ("Asks you to type the code into the page where you're paying, for a payment you started. Nobody is asking you to read it out.").
- **Actions:** "Type the code into the checkout page" (`proceed`, target ★★★; outcome "Payment confirmed. Adapter on its way.") · "Open the Larchwick app first" (`verify_in_app` ★★★; outcome "A pending €24.90 to Thimble & Pine, waiting for your code. You type it in."; follow-up `proceed`) · "Report the text as a scam" (report, 0, −5) · "Leave it, buy the adapter later" (`ignore`, dismiss on genuine high, 0).
- **Debrief L1 (genuine):** tell "A code you asked for, for the payment you're making." · what works "Type it where you're paying. Never read it out." Layer 2: "Same thread as this morning's fake, same sender name, same kind of deadline. The difference: you started this, it says what the code is for, and nobody wants it from you. The only number it gives is the one on your card." Second pressure-style callout (§8) is likely to fire here. Habit card `codes-are-only-for-you`.

**4-7 `madrid-07-cancellation-code`** · fraud (MSC callback) · call with code banner · diff 4 · call timer 30 · levers authority, fear, urgency · Larchwick
- **Message (incoming call):** caller ID "Larchwick Bank" (M2). Transcript:
  1. "Good afternoon, am I speaking to {nickname}? Larchwick security. It's about your card ending 17." (`references[0]` = "your card ending 17", a real detail)
  2. "Someone's trying to pay €640 to an electronics site with it right now. I won't ask for your PIN or passwords." (`claims[0]`)
  3. "We've just sent you a cancellation code. Read it to me and I'll stop the payment." (`ask`)
  4. "You can check us on 9•• ••• •00, the number on your card, afterwards."
  `request: share_code`; `phone_numbers: ["9•• ••• •00"]`. **Banner** inside the call (§17 rule, no actions, no checkable): "LARCHWICK: Code 5••••• to confirm a card payment of €640.00 online. Never share this code, not even with Larchwick." **Interrupt** at 12 s, Lucía (genuine): "¡Despierta! Coffee? ☕" (translation).
- **Checkables (5; R 1):** `caller_id` D (M2) · `reference` D ("Knows your name and the last digits of your card. Details like these aren't hard to find out, so they can't prove anything either way.") · `claim` D (M4) · `phone_number` **D** (M3: "9•• ••• •00, the number on the back of your card. A caller can quote it, so it can't prove the call is real, but calling that number yourself reaches Larchwick."; as Berlin 1-9's quoted card number) · `request` **R**: "Wants the code read out to 'cancel' a payment. Read the text: the code is to **confirm** a payment. A code is only for making an operation; your bank never needs one from you to stop fraud."
- **Actions:** "Read out the code" (`share_code`, target, fall) · "Hang up" → "What now?": "Call the number on your card" (verify ★★★; "Larchwick: 'We've blocked that payment attempt and your card. Never share a code with anyone who calls.'") · extra "Call back this number" (engage note as 4-5) · report · "Leave it there".
- **Fall** narrative: "'Thank you, that's cancelled.' Your app shows €640.00 paid." Damage control (6, 2 harmful): `call_bank_stop_payment` (stop) · `block_card_in_bank_app` (stop) · `refuse_codes_to_callers` (secure) · `report_police_copy_to_bank` (report) · harmful `call_back_caller_number` · harmful `wait_and_see`.
- **Debrief L1 (≈17):** tell "A code 'to cancel' a payment is a code to make one." · what works "Hang up. Call the number on your card." Layer 2: "Real details (your name, your card's last digits) prove nothing. Read what the code text says it's for." `already_clicked.shared_code`: "Read out a code? Call your bank now on the number on your card: block the card and ask it to try to stop or recall the payment." Habit card `codes-are-only-for-you`.

**Arc beat (`madrid-arc-alex-NN`).** Arc slot N for the play position (STORY §1.4); placed between 4-7 and 4-8. Reason: not adjacent to 4-5 (a "move your money" debrief right before or after a money-themed arc beat could unmask slots 5–9), and 4-8's link debrief says nothing about friends or platforms.

**4-8 `madrid-08-card-paused-link`** · fraud (BSA older chain) · sms → browser · diff 4 · no timer · interrupt · levers fear, authority · Larchwick (look-alike `larchwick-secure.example`, registered)
- **Message (sms, LARCHWICK, in the thread).** `earlier[]`: the 4-6 code text and yesterday's market payment. Today: "LARCHWICK: For your security we've paused your card ending 17 after an unusual payment. Check it and turn it back on in your Larchwick app: larchwick-secure.example/app". `request: log_in`; `ask` = "Check it and turn it back on in your Larchwick app" (CR-30). **Interrupt** at 15 s, Noor (genuine): "inspector!! how's Madrid, eaten anything good?" Honest deadline: none; "before 20:00" is not used, to keep the chapter's calm fraud calm.
- **Checkables (4; R 1; difficulty 4, real details mixed in):** `sender.detail` D (M1) · `reference` D ("your card ending 17", true; neutral as 4-7) · `request` **D**: "Asks you to check your card in your Larchwick app. Real banks do send you to the app, so it can't prove anything either way. Judge where the link goes." (the one fraud whose request is ordinary, §24.7 row 6c) · `link` **R**: "larchwick-secure.example. Read the end: the owner part is larchwick-secure.example, not larchwick-bank.example, where your real app and site live. It says 'your app' but opens a web page."
- **Actions:** "Open the link" (`open_link` → `paused_page`, target) · "Open the Larchwick app yourself" (`verify_in_app` ★★★; "Your card is active. Nothing is paused.") · "Report the text" (report) · "Delete it" (delete).
- **`paused_page` (browser training page, not in R):** "Larchwick · Turn your card back on". Read-only demo fields: **user ID, password** only (researcher M-B: no card fields, no text-code field). Checkables: `page.address` R, `page.info` padlock D (shared wording). Actions: "Log in" (`enter_details`, fall) · "Close it and open the app yourself" (`verify_in_app`, ★★ engage cap) · "Close the page" (`ignore`).
- **Fall** narrative: "'Thank you. Your card will be active again shortly.' Nothing changes in your real app." Damage control (6, 2 harmful): `call_bank_known_number` (stop) · `tell_trusted_adult` (stop) · `change_password` (secure: "from the real app") · `report_police_copy_to_bank` (report) · harmful `wait_and_see` · harmful `reply_to_sender`. `already_clicked.entered_details`: "Typed your login? Call Larchwick now on the number on your card, then change your password from the real app."
- **Debrief L1 (≈16):** tell "In the real thread, real card digits, but a look-alike link." · what works "Open the Larchwick app yourself." Layer 2 links back to 4-3: "Same thread, same name. Texts can carry a different number to call, or a link. Either way, go to the app or the card yourself." Habit card `read-the-link`.

### 24.5 Device moment: "the call is still on the line"
The new thing Madrid shows is that the fall happens **in the player's own, real Larchwick app**, with nothing on the bank screen that looks fake.
- **CR-31 on-call bar** (banking beats reached from a call by `start_transfer`): a slim, persistent bar at the top of the banking device, "On a call · Larchwick Bank · 02:14", with a **Hang up** control that opens the banking beat's dismiss-and-call-back choices (it maps to the beat's actions, never a new scored path). The caller's lines arrive as beat-bound follow-ups in the bar (CR-21 timing). The bar uses the same neutral styling as any call; no red, no warning.
- **Interim (until CR-31):** beat-bound pushers carry the caller's lines (engine follow-up c already shows them with the caller as sender), and every banking action label starts "Hang up and…" or "Confirm and send", so the player still feels the call is live.
- **Payee-check results used:** **doesn't match** (4-5, red flag, with the caller coaching past it) and **match** (boss, on the name the caller dictates, neutral). The coach mark (CR-23) shows on first use in the game, whichever chapter that is, so Madrid works before or after Paris.
- **Never shown:** how caller IDs or sender names are faked; any real bank's screens; a real "reserve" product.

### 24.6 Boss 4-9 `madrid-09-boss-reserve`
- **Setup:** "22:15. Lucía has left for her night shift; Andrés has gone to bed early before school. You're on the sofa with your phone."
- **Levers:** authority, fear, urgency, helpfulness. Pusher on beat 2 at 20 s (caller): "Are you in the app yet? Every minute counts."
- **Beats** are scammer-driven (§6) and arrive whatever the player did.

**Beat 1, sms (start, 40 s).** LARCHWICK, in the thread (`earlier[]`: the 4-6 code text and the 4-8 "paused card" text, so the thread visibly holds real and fake together). "LARCHWICK: We've detected a transfer of €1,950.00 from your account to ES•• •••• 2268. If it wasn't you, call our security department now: 9•• ••• •61. Never share your codes." `request: call`; `ask` = "If it wasn't you, call our security department now".
- Checkables (5; R 2): `sender.detail` D (M1) · `reference` D (ES••2268) · `claim` D ("Never share your codes.": "Good advice that real texts give too. A fake can copy it, so it can't prove anything either way.") · `phone_number` **R** (M3; not your card's 00) · `request` **R** (as 4-3).
- Actions (no engage on boss beats, §16 ruling 4; beat 2's capped `start_transfer` is the R16 exception): "Call the number and follow their steps" (`pay`, target) · "Open the Larchwick app yourself" (`verify_in_app` ★★★; "No transfer. Balance as it was. Then your phone rings: 'Larchwick Bank'.") · "Call the number on your card" (`call_back_known` ★★★; "'No such transfer. We'd never ask you to move money, and the number on your card is the only number to call us on.' As you hang up, your phone rings: 'Larchwick Bank'.") · report · delete.

**Beat 2, call (`arrives_after: 45`, 40 s, `covered_by: [start]`).** Caller ID "Larchwick Bank" (M2; may show the real number). Transcript:
1. "Larchwick security department. You didn't call us back about the €1,950 transfer, so I'm calling you."
2. "We've paused it, but your account is exposed. I won't ask for your passwords or codes; the bank never does." (`claims[0]`)
3. You: "Can I call you back on the number on my card?"
4. "Please don't hang up, or the transfer goes through." (`claims[1]`)
5. "Open your Larchwick app now and I'll guide you to move your balance to our security reserve account until it's safe." (`ask`)
- Checkables (4; R 2): `caller_id` D · `claim` D (M4) · `claim#2` **R** (as 4-5) · `request` **R** (as 4-5).
- Actions: "Open the app and follow their steps" (`start_transfer` → `boss_reserve`, target; **R16:** `cap: engage`, the beat's best after it is ★★, CR-31(b)) · "Hang up" → "What now?": "Call the number on your card" (verify) · extra "Open the Larchwick app yourself" (verify) · extra "Call back this number" (engage note as 4-5) · report · "Leave it there".
- **`boss_reserve` (banking sub-beat, CR-18(e); on-call bar CR-31; 40 s floor; beat 3 held until it closes).** Caller lines: "New payee. Type the name exactly: Olvarde Custodia SL. That's our reserve partner." · "Amount: your full balance." · "When it says the name matches, confirm. Quickly." Payee "Olvarde Custodia SL" (brand-checked company holder, shown in full, CONTENT_GUIDE payee rule), IBAN `ES•• … 5590`, amount €3,215.60. Result **match**.
  - Checkables: `payee.name_check` D (P3 + M6): "Name matches: the account is held by Olvarde Custodia SL, the name the caller gave you. That shows whose account it is. It can't show the call is real, and no real bank asks you to move money to keep it safe." · `payee.iban` D.
  - Actions: "Confirm and send €3,215.60" (`pay`, fall, target) · "Hang up and call the number on your card" (`call_back_known`, ★★ under R16) · "Hang up and report it" (report ★★) · "Hang up and cancel" (`ignore` ★★).

**Beat 3, sms (`arrives_after: 45`, 40 s, `covered_by: [start, security_call]`).** LARCHWICK, in the thread. "LARCHWICK: Your account is still at risk. Move your balance to the security reserve tonight to protect it. Your agent's direct line: 9•• ••• •61." `request: pay`; `ask` = "Move your balance to the security reserve tonight to protect it." Written so it reads true whether or not the player moved money at beat 2. **Design combination (fraud-researcher):** a follow-up text pushing the same "move your balance" request combines elements the brief sources separately (in-thread text, number to call, safe-account request); it is not a separately sourced step, and no debrief presents it as a known sequence.
- Checkables (3; R 2): `sender.detail` D (M1) · `phone_number` **R** (same number as beat 1, not your card's) · `request` **R** ("Moving your money 'to protect it' is the scam, in a text as on a call.").
- Actions: "Call the agent and move your balance" (`pay`, target) · "Call the number on your card" (verify) · "Open the Larchwick app yourself" (verify) · report · delete.

**Interrupt** (`after_beat: reserve_text`, genuine, `on_fall: skip`): Andrés: "Still up? Lucía says her shift's quiet tonight 🙂 Buenas noches." Actions: "Reply: buenas noches!" (`proceed`) · "Report the message" (`report`; counts as a genuine report; outcome "You reported it. Careful is good; this one really was Andrés, saying good night.").

- **Counts:** R = 6 (b1 2, b2 2, b3 2); decoys 6 on scheduled beats (b1 3: sender, reference, claim; b2 2: caller ID, claim; b3 1: sender; see §24.7), plus the sub-beat's match and IBAN (not in R). Max 3 × 15 + 6 = **51**. One layer-1 "You chose" line (CR-15); fall cap (T-2.8).
- **After a fall** (once, merged, cap 6): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `keep_call_evidence` (secure) · `report_police_copy_to_bank` (report) · harmful `call_back_caller_number` · harmful `wait_and_see`. Every fall outcome sets `madrid_money_moved` (story only).
- **Layer 1 for the boss and the stamp screen** (≈19): tell **"A text, a 'bank' call, a text: all wanting your money moved."** · what works **"Hang up. Call the number on your card."**
- **Layer 2, per beat:** beat 1 "A number that isn't your card's, in the real thread." · beat 2 "'No passwords needed' and 'don't hang up' came with the real request: move your money." · sub-beat "The name matched because you typed what the caller said." · beat 3 "Same number, same request, back in the thread." Then: "Most calls from your bank are what they seem. When one asks you to move money, read out a code, or stay on the line, hang up and call the number on your card." *Superseded (learning-psychologist CR review, T-3.6):* no conditional line (the engine has no hook for it); the beat-2 line always adds the fixed sentence "Following a caller's steps into your own app is already the risky part, even if you hang up before sending." `already_clicked.paid` as 4-3; `already_clicked.clicked` as 4-3.
- **QA:** paper-playtest the load of beat 2 (5 transcript lines + the banking sub-beat with caller lines).

### 24.7 Strategy check (as §7.2)
**Assumptions:** CR-17/18/23/30 and CR-31(b) landed (R16 cap). R counts scheduled beats only. Flags on `security_line`, `reserve_transfer`, `paused_page` and `boss_reserve` count toward spotted, not R. Every scheduled beat has a `request` checkable.
- **Standard fraud:** 4-3 R 2 (19), 4-5 R 2 (19), 4-7 R 1 (17), 4-8 R 1 (17) = **72**. Decoys on scheduled beats: 4-3 2, 4-5 3, 4-7 4 (caller ID, reference, claim, card's number), 4-8 3 (sender, reference, request), boss 6 = 18.
- **Genuine:** 3 × 15 = **45**. Own checkables: 4-1 2, 4-2 5, 4-6 5 = 12.
- **Boss:** R 6, max **51**.
- **Totals:** max = 72 + 45 + 51 = **168**. R = 6 + 6 = **12**: silver needs spotted ≥ **4**, gold ≥ **8**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed or verify on genuine (4-1 proceed) | 72 + 45 + 51 | 168 | 100% | 12 | **Gold** |
| 2 | Ideal + calls Andrés about dinner (off-focus double check) | same | 168 | 100% | 12 | Silver |
| 3 | Curious ideal: calls the number in 4-3, then hangs up and calls the card | 168 − 5 (engage cap) | 163 | 97.0% | 12 | **Gold** |
| 3a | Ideal via the app: follows the caller into the app in 4-5 and boss beat 2, then "Hang up and call the number on your card" | 168 − 5 (4-5) − 5 (boss b2), R16 engage cap | 158 | 94.0% | 12 (+ 4-5 no-match flag) | **Gold** |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (14+14+12+12) + 45 + (30+6) | 133 | 79.2% | 12 | Silver |
| 5 | Ideal but reports the real bank call (4-2) | 168 − 15 − 5 | 148 | 88.1% | 12 | Silver |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 89.3% | 12 − (18 + 12) = −18 | Bronze |
| 6a | Random single tag per beat + always verify (expected) | 150 + 2×(½+⅖+⅕+¼) + boss ≈0.8 | ≈154 | ≈91.6% | 2.92 − 7.08 ≈ −4.2 | Bronze (silver only if all 7 fraud tags hit: about 1 in 750) |
| 6b | Always tag sender / caller ID + link + always verify | 150 (every set includes a decoy) | 150 | 89.3% | 1 − 10 = −9 | Bronze |
| 6c | **Always tag the request** + always verify | 150 + 2 + 2 + 2 + 6 (4-8 void) | 162 | 96.4% | 6 − 4 = 2 | Bronze |
| 6d | Tag request + every phone number + always verify | 150 + 4 (4-3) + 2 (4-5) + 6 (boss); 4-7 void (card's number), 4-8 void (request) | 162 | 96.4% | 9 − 7 = 2 | Bronze |
| 6e | Tag request + every claim + always verify | 150 + 2 (4-3 only; 4-5, 4-7, 4-8 and boss void) | 152 | 90.5% | 8 − 10 = −2 | Bronze |
| 7 | Blind always-verify (± pause) | 60 + 45 + 45 | 150 | 89.3% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.7% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 10 + 10 + 0 | 90 | 53.6% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 53.6% | 0 | Bronze |
| 11 | **"Trust the caller ID"**: does what any call showing "Larchwick Bank" says, verifies and tags texts as ideal | 4-2 15; 4-5 fall 9; 4-7 fall 9; 4-3 19; 4-8 17; boss b1 15, b2 0 (+9 DC), b3 15, tags +6 (4 correct tags earn 8, capped at 6); 4-1 15; 4-6 15 | 144 | 85.7% | 12 − 5 (4-5, 4-7, b2 untagged) = 7 | **Silver** (rating < 90 and spotted 7 < 8; `max_falls` parked, R15) |

Row notes:
- **6a hit chances:** 4-3 2/4, 4-5 2/5, 4-7 1/5 (caller ID, reference, claim, card's number, request), 4-8 1/4, b1 2/5, b2 2/4, b3 2/3. Product ≈ 1/750. Perfect luck nets 7 − 3 genuine = 4 = silver, the one luck path, as in Berlin.
- **6c:** the request is R on 4-3, 4-5, 4-7 and all three boss beats, and a decoy on 4-8 (the one ordinary request, as Paris 3-5), plus a wrong tag on each genuine request.
- **6d:** fraud phone numbers R on 4-3, b1, b3 (3) + 6 requests R = 9 correct. Wrong: 4-8 request, 4-7's quoted card number (D), 3 genuine requests, and the card's number on genuine 4-2 and 4-6 = 7. Net **2**. This is why 4-2 line 4 and 4-7 line 4 quote the card's number as digits with a `phone_numbers` entry (neutral, M3): without them, phone tagging alone reached silver.
- **6e:** correct = 6 requests + 4-5 claim#2 + b2 claim#2 = 8; wrong = 4-8 request; fraud claims 4-5 claim#1, 4-7 claim, b1 claim, b2 claim#1 (4; 4-3's `security_line` claim is not on a scheduled beat); genuine requests 3; genuine claims 4-2 and 4-6 (2) = 10. Net −2. Bonuses void wherever a decoy was tagged (4-5, 4-7, 4-8, boss), so only 4-3 keeps +2: **152, 90.5%**.
- **Row 11:** shows the chapter's point: trusting the bank's name on screen loses two scenarios and a boss beat, and stays silver. The boss fall cap (T-2.8) can only lower it further.

**Checkable parity:** 4-2 has 5 own checkables (phone, caller ID, reference, claim, request) and 4-7 has 5 (caller ID, reference, claim, phone, request); 4-5 has 5. The list length never differs between the call twins (balance `show_count: []` already hides counts; parity is belt and braces).

**What the numbers show:** no blind tagging rule reaches silver; random tagging needs a 1-in-750 run. Trusting a call because it shows the bank's name is the costliest "reasonable" strategy (row 11). Over-reporting the real bank call costs silver-to-gold, which is the calibration the chapter wants. QA re-runs 6a–6e on the authored YAML at the Phase 3 balancing pass.

### 24.8 Madrid reveal rulings (for scenario-writer and sceptic-reviewer)
- **M1. The LARCHWICK sender in the thread is neutral everywhere, genuine and fraud alike.** Fakes land in the real thread in this chapter, so "It fits" is never used on a LARCHWICK sender. Wording as 4-3. On genuine texts the reveal may add a separate, true sentence about what the player started (4-6).
- **M2. Caller ID "Larchwick Bank" is neutral everywhere**, including the real call (4-2). Never "It fits" on a caller ID (validator follow-up from T-2.7).
- **M3. Phone numbers:** a number in a text or on a call that **is not** the card's (ends 00) is a red flag when the message asks you to call it. The card's number, quoted by a real or fake message, is neutral: "A message can copy it, so it can't prove the message is real, but calling that number reaches Larchwick." A number from the player's own card is never a checkable on the dialler; it is the "What now?" call-back.
- **M4. "We won't ask for your passwords/codes" is a claim with one neutral wording on genuine and fraud.** The lesson that it is not reassurance lives in the request reveal and layer 2, never in the claim's opening words.
- **M5. The Spain register line** appears once, in 4-3 layer 2, word for word (§24.1). Never as protection.
- **M6. Payee check:** a match on a name the caller dictated is neutral (P3) and adds "It can't show the call is real". A no-match is a red flag. Neither is the scenario's tell: the request is.

### 24.9 Madrid change requests (to `frontend-engineer`)
- **CR-30 (blocker for the request parity in §24.7; shared with Warsaw): `ask` on every request type.** `ASK_REQUESTS` gains `call`, `log_in`, `open_link` and `none` (for `none`, the ask is the sentence telling the reader what to do, e.g. "Print your label…"). From slot 4, `chapterRules` requires `ask` on every scored scheduled beat on `sms`, `messenger`, `marketplace` (CR-33), `email`, `social` or `call` (not `banking`, not interrupts, not `scored: false`), genuine and fraud alike. Slots 0–3 keep CR-17. Test: a slot-4 chapter with a `request: call` beat and no `ask` fails. Fallback if refused: 4-3 and boss beats 1/3 lose their `request` R (R drops to 9, silver 3, gold 6), and §24.7 must be re-run.
- **CR-31 (non-blocker): on-call bar over a banking beat** (§24.5). A banking beat reached by `start_transfer` from a `call` beat shows "On a call · {caller display} · mm:ss" with a Hang up control; Hang up focuses the beat's own dismiss/verify actions (no new scored path). Caller follow-ups bound to the beat (CR-21) render inside the bar. Interim as §24.5.
  - **CR-31(b) (blocker for the R16 scoring in 4-5 and boss beat 2): `start_transfer` with `cap: engage`.** A `start_transfer` action may set `cap: engage`; then every outcome of its group (including the banking beat's call-back, report and cancel) scores at most ★★, like an engage, and the fall is unchanged. The validator requires `cap: engage` when the source beat is a `call` on a fraud scenario or boss beat (ruling R16), and forbids it on genuine scenarios (5-4's `start_transfer` stays a `step`, CR-18). Test: 4-5 "follow their steps" then "Hang up and call the number on your card" = ★★ (10 points).

### 24.10 New brands, cast, content
- **Account holder (not a brand; registered like Paris holders after BRAND_CHECK):** **"Olvarde Custodia SL"** (boss sub-beat). Kept by BRAND_CHECK (MW1–MW4), as is "Larchwick Reserva". Alternative "Corvaldo Custodia SL" (the second earlier alternative dropped after review: one letter from a registered company). Checked against Spanish banks, custody firms and company directories (list in docs/patterns/BRAND_CHECK.md MW1). "Larchwick Reserva" (4-5) is the bank's own fictional brand plus a word; no holder exists, it never matches.
- **Merchant descriptor** "MERCADO PUESTO 14" ("market stall 14"): a generic descriptor, not a brand; sceptic to confirm it needs no registry entry.
- **Larchwick:** no new look-alike (`larchwick-secure.example` is registered). The card's number (masked, ends 00) is added to `known_channels`.
- **Cast (`content/cast.yaml`):** `lucia` "Lucía Herrera", role "Night-shift nurse, your host (Madrid)", known channel "Saved contact: Lucía (Madrid)"; `andres` "Andrés", role "Teacher, your host (Madrid)", known channel "Saved contact: Andrés (Madrid)". Both already in STORY §2.3 and the name register. Neither is ever impersonated, and their money is never in a scored scenario.
- **Recovery steps** (new, in `content/recovery_steps.yaml`; harmful ones need non-blaming `feedback`):
  - `keep_call_evidence`: "Keep screenshots of the texts, the call log and the times".
  - `report_police_copy_to_bank`: "Make a police report and give your bank a copy".
  - `call_back_caller_number` (harmful): "Call back the number that called you and ask them to send it back". Feedback (researcher M-A): "Wanting to fix it fast is natural, but the number that called you can be faked, so you can't tell whose line you'd reach. Call the number on your card instead."
- **Habit cards** (wording owned by game-designer; scenario-writer edits `content/habit_cards.yaml`):
  - `hang-up-call-back` habit becomes: "An unexpected call from your bank, the police or any official? Hang up, then call back on a number you find yourself, like the one on your card. Caller ID proves nothing, and no real bank asks you to move your money to keep it safe." Example unchanged (first shown in Berlin).
  - `who-really-sent` habit gains one sentence: "A fake text can even land in your bank's real thread."
  - `codes-are-only-for-you` and `pressure-is-the-tell` unchanged.
- **Atlas page:** `atlas_cards: [hang-up-call-back, who-really-sent, pressure-is-the-tell]` (STORY §3.4).
- **"Where to report and get help" (Spain) card:** wording in `docs/patterns/ch4-madrid-sources.md` ("Spain help card"), linked from layer 2 of every Madrid debrief. Real bodies only there (Red Line 1). It does not mention the sender register.
- **Chapter file:** `content/chapters/madrid.yaml`: slot 4; `patterns: [bank-safe-account-call]`; `callbacks: [multichannel-support-callback]`; am `[01, 02, 03]` (stop point after 03), pm `[04, 05, 06, 07, arc, 08, 09]`; `boss: madrid-09-boss-reserve`; intro and rules as §24.1; `scenes: { arrival: madrid-arrival, turn: madrid-turn, resolution: madrid-resolution }`.

### 24.11 Open questions for the producer (Madrid)
*Answered 2026-11-19: Q1 by R9 (both ★★★, as specified), Q2 by R10 (keep, once, researcher's wording), Q3 by R15 (parked), Q4 by R11 (no note). Q5 went to fraud-researcher in round 1: (a) is sourced outside Spain (note in 4-5), (d) is labelled a design combination (boss beat 3). Kept below for the record.*
1. **The genuine bank call (4-2).** It teaches that a real bank call asks nothing you'd regret and welcomes a call-back. Accept answering "no, that wasn't me" as `proceed` ★★★, or score the real call so that only hanging up and calling back earns ★★★ (verify), with answering at ★★?
2. **The register line** (M5): keep it once in 4-3 layer 2, or drop it entirely? I recommend keeping it: it pre-empts "Spain fixed this", and its wording says the thread is no proof.
3. **`stamps.gold.max_falls`** (parked from Paris Q3): row 11 reaches silver with two falls; with the parked rule it would stay silver either way. No change needed here.
4. **Content note:** Madrid has a money-fear theme but no family emergency. No note proposed; add one?
5. **For fraud-researcher:** (a) the "stay on the line" claim as a red flag (BSA §3.7); (b) the card's number quoted by a fake caller as a decoy (as Berlin 1-9); (c) 4-8 as BSA's "older chain" with a link that says "your app" but opens a web page; (d) boss beat 3 (a follow-up text asking to move the balance) as a combination of BSA §2 elements, not a separately sourced step.

## 25. Chapter 5 — Warsaw
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/marketplace-collect-payment-link.md` (MCP) and `docs/patterns/hijacked-friend-payment-code.md` (HFC), plus `docs/patterns/messenger-account-takeover-code.md` (MAT) for the one callback. Per-scenario sources: `docs/patterns/ch5-warsaw-sources.md`. No source ids inline. Replaces the §18 Warsaw summary.

### 25.1 Goal, shape, rules check
- **The chapter habit (H):** **"Money comes to you inside the app; codes stay with you."** Long form, for the habit cards and layer 2: "Keep the deal and the payment inside Swaploft, which you open yourself: if you've been paid, it shows there. Receiving money never needs your card details or bank login. And never send a code from your banking app or messenger to anyone, even a friend: call them on the number you know." (MCP §4, HFC §4.)
- **Producer constraints (research revision 85e2484):**
  - The **payment-code detail is Medium confidence**, so it appears in **one scored scenario only (5-6)**. Mateus's drill (5-7) is the same event seen from his phone (he got the same message), not a second code scenario. The rest of the friend thread leans on the **account takeover plus a request** (5-2, Medium-high).
  - **No fake marketplace login pages.** Every fake page in Warsaw is a "collect your payment" page with a card or **bank-login** panel (MCP §2.3, sourced), never a Swaploft sign-in clone.
  - Refunds are always "may".
- **Wording:** debriefs say **"a link to collect your payment"** (MCP §6). "Swaploft Safe Delivery" is used **only** as the fake page's own label, never in a debrief as a real thing.
- **Shape:** slot 5, difficulty 3–4, boss 4. Timers 45 s, call beats 30 s, boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud.** Plus drill 5-7 (Mateus) and the arc beat. Estimated 16–18 min.
- **New patterns (2):** `marketplace-collect-payment-link` (5-1 twin, 5-3, 5-5, boss), `hijacked-friend-payment-code` (5-4 twin, 5-6, drill 5-7). **Callback (1):** `messenger-account-takeover-code` (5-2, the vote request, MAT and the CERT vote advisory cited in HFC).
- **LO focus:** LO-10 (core), LO-05, LO-07, LO-16 (drill + falls), LO-02, LO-01, LO-17, LO-18 (drill: you are the someone), LO-14 (arc).
- **Flavour:** Polish in-world text (`lang="pl"`, inline translation): Swaploft's app texts and notifications, buyers' messages (genuine and fake alike, so language is never a tell), Kasia's odd word. Moving boxes, a cello, parcel lockers (Trundle). Kasia, Mateus and the player write English.
- **Premise and intro:** "Warsaw: Kasia, a Waymarker volunteer, is moving to a smaller flat to afford her last year of music school, and is selling half of what she owns on Swaploft. You're helping, and selling your old rucksack and camping stove too." (The writer may swap the items; one item per sale scenario.)
- **Rules card** (CR-27): title "Kasia's selling rules", two items: "The deal and the money stay inside Swaploft." · "Paid? It shows in the Swaploft app. Check there, not in a message." This is the habit (STORY §4.2 rule 2 allows a general rule) and is never wrong on the genuine twins.

**Mix rules:**
- **Genuine** 3/8 ✓. **Truth order:** G F F · G F F G F(boss), max run 2 ✓.
- **Themes:** `marketplace` 4 (5-1, 5-3, 5-5, boss), `friend` 3 (5-2, 5-4, 5-6), `work` 1 (5-8). Max 50% ✓; order M, F, M, F, M, F, W, M: no two adjacent ✓ (the drill and arc don't count).
- **Pressure parity:** genuine 2/3 (5-1 honest timer, 5-4 timer + honest pusher) = 66.7%; fraud 4/5 (5-3, 5-5, 5-6, boss) = 80%; gap 13.3 ✓. 5-2 and 5-8 are calm.
- **Difficulty parity:** genuine at 3 (5-1, 5-8) and 4 (5-4); fraud at 3 (5-2, 5-3) and 4 (5-5, 5-6, boss) ✓.
- **Decoys and sender-or-link:** ≥ 2 on every fraud; sender decoys in 5-2 (Ola's saved contact), 5-5 (a buyer inside Swaploft), 5-6 (Kasia's saved contact) and boss beats 1–3; link decoys (Swaploft's real domain) in 5-5 and boss beat 1. F = 5 needs 2 ✓.
- **Interrupts:** 5-4, 5-5, 5-6 and the boss (difficulty 4): small talk, genuine, unscored.
- **Off-focus genuine:** 5-8 (Adaeze). Checking it costs gold; 5-1 and 5-4 are in focus.
- **Echo:** none (the boss is the same for every player). The §18 "echo of earlier account choices" is replaced by the drill: Mateus's fall is the consequence the player meets.
- **Red Line 8:** every scenario is messenger, Swaploft chat, SMS, browser or banking. Lockers appear only as places a parcel is dropped (no locker QR, no in-person trick).
- **Never on screen:** statistics (the CERT totals are designer context only); no prevalence claim for the payment code (how often it happens, or how widely the code is used); the €349 and €249 amounts are illustrative and never presented as typical; the real payment scheme, marketplace, courier or locker brand; how pages are built or hosted; how accounts are taken over (only "someone got into my Kettle"); refunds as certain.

### 25.2 Story beats (track S)
STORY §3.5, updated with this spec. The hijacked account is **Kasia's** (her real Kettle, taken over while she is at rehearsal; never her fault, never shown how). Mateus is still the one who falls. No panel shows a buyer, link, code, amount or listing price.
1. **Arrival** (before 5-1; 3 panels; calm). A flat full of boxes and a cello case. Kasia (warm): "Everything must go, except the cello." Mateus photographs a lamp (laughing): "Good photos sell. Trust me, I'm a professional." Kasia pins her two selling rules to the fridge (the rules card follows on the intro screen). Cast: Kasia, Mateus.
2. **Turn** (stop point, after 5-3; 3 panels; calm → focused). Kasia (focused): "I sell a lot. My rule is simple: the deal and the money stay inside Swaploft." Mateus (thinking): "Good rule. I might borrow it." Kasia, shouldering the cello case: "Rehearsal at four, concert tonight. Phone on silent, but I'll pick up between pieces." (Sets up why "Kasia" can't be asked in person in 5-6, and that a call reaches her: no verdict, it's true for her real message in 5-4 too.)
3. **Placed beat after drill 5-7** (2 panels; worried → relieved). Kasia, back from rehearsal, phone in hand (worried): "Someone got into my Kettle while I was playing. I've got it back and turned on two-step." Mateus (relieved): "Not your fault, Kasia. And the bank's on it: I called them first." (psych M1.) Kasia's `worried` expression is new art (§25.9). True in every branch: the drill always ends with Mateus having called his bank (§25.4, 5-7).
4. **Resolution** (after the boss debrief; 3 panels + If-then). Late evening, empty shelves. Mateus (sheepish): "Kasia's account asked for my code and I sent it. Me. The gadget guy." Kasia (warm): "It wasn't really me. And you fixed it fast." *(Was "It wasn't really your friend" in STORY v1.3; the friend is now Kasia herself.)* Then the **If-then panel (Mateus; Warsaw exception), word for word from STORY §3.5:** "If anyone asks for a code, even a friend, then I don't send it, and I call them on the number I know." Extra line under it: "Money comes to you inside the app."
   - **Variant `warsaw_bank_called`** (story-only, set by every boss fall outcome, beat 2 or beat 3; ruling R17): one panel before the If-then, Kasia (calm): "The bank was called straight away, the right first step. We'll see what it can do." True for a card typed on the collect page and for a bank login typed on the "release" step. Same merged-line approach as Paris R6; no refund promise.
- **Map invitation (Kasia):** "I'm selling half my flat before I move. Want to see how to do it safely?" (STORY §3.5.)
- **Panels:** 3 + 3 + 2 + 4 = 12 (+1 with the variant).
- **Safety:** a confident expert falls and recovers; nobody teases him; Kasia's account takeover is not her fault (STORY §5; ruling R13).
- **Art (psych S4):** Mateus's If-then panel uses a phone-at-the-ear pose (he is calling the number he knows); Kasia needs `worried` for the placed beat.

### 25.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 5-1 | AM | Swaploft (in the app you opened): "Sold! Your rucksack, €35. Swaploft holds the payment until delivery. Print your label and drop it at a Trundle locker by Friday." | marketplace (CR-33) | genuine / low (twin of 5-3, 5-5, boss) | 3 | honest timer 45 | marketplace | LO-10, LO-17 |
| 5-2 | AM | Ola (a volunteer, her **real** Kettle account): "Could you vote for my little sister's band? You just log in with your phone number and type the code you get." | messenger → browser | fraud (MAT callback) | 3 | — | friend | LO-05, LO-02, LO-07 |
| 5-3 | AM | A new Kettle number: "I'm the buyer for your rucksack on Swaploft. I've paid already, courier delivery included. Collect your payment here: swaploft-safe-delivery.example/collect/…" | messenger → browser | fraud (MCP) | 3 | timer 45 + pusher | marketplace | LO-10, LO-02, LO-01 |
| | | *Stop point + turn* | | | | | | |
| 5-4 | PM | The **real** Kasia, leaving for rehearsal: "Can you send me the €12 for the tape and boxes from this morning? To my account as usual. Tonight's fine." | messenger → banking | genuine / high (twin of 5-6) | 4 | timer 45 + honest pusher; interrupt | friend | LO-07, LO-17, LO-06 |
| *arc* | PM | Arc slot N for this play position (default: slot 5) | messenger | arc | — | — | — | LO-14 |
| 5-5 | PM | **Inside Swaploft's own chat**, a buyer for your stove: "Swaploft verifies sellers before payout. Send me a photo of your card, both sides, so the money can reach you." | marketplace (CR-33) | fraud (MCP) | 4 | timer 45; interrupt | marketplace | LO-10, LO-05 |
| 5-6 | PM | Kasia's **real** Kettle (taken over): "Card declined at the music shop 😩 Can you send me a 6-digit payment code from your Larchwick app? I'll pay you back tonight." | messenger | fraud (HFC; the one code scenario) | 4 | timer 45 + pusher; interrupt | friend | LO-05, LO-07 |
| 5-7 | PM | **Drill: Mateus asks for help.** He got the same message, sent a code and confirmed without reading. You guide his damage control | messenger | drill | 3 | — | — | LO-16, LO-18 |
| 5-8 | PM | Adaeze: "Three lines on Warsaw for the Atlas by Thursday?" (link to the Atlas draft on Waymarker Desk) | email | genuine / low (off-focus) | 3 | — | work | LO-17 |
| 5-9 **Boss** | PM | Evening, Kasia at her concert. Beat 1 (Swaploft chat): a buyer for your stove asks to "continue on Kettle". Beat 2 (Kettle): "I've paid with courier delivery; collect your payment here" (card panel). Beat 3 (Kettle): "The courier's coming; the payment is on hold until you confirm with your bank: log in here." | marketplace → messenger → messenger | fraud (MCP) | 4 | boss timers 40 + pusher; interrupt after beat 3 | marketplace | LO-10, LO-02, LO-05, LO-04, LO-16 |

### 25.4 Scenario specs
Shared rules as §24.4. Polish phone numbers masked `+48 5•• ••• •NN`; IBANs `PL•• … NNNN`, checksum-invalid. Buyer display names are neutral handles ("user 2208"), never a name that points to an ethnicity (§2). Every scored scheduled beat has a `request` (CR-30). Reveals follow CONTENT_GUIDE and W1–W5 (§25.8). `tell_trusted_adult` is `stop` in every personal-money fall.

**5-1 `warsaw-01-rucksack-sold`** · genuine, low · marketplace (Swaploft app, CR-33) · diff 3 · honest timer 45, `honest_deadline` "Drop it off by Friday" · Swaploft, Trundle · `pattern: marketplace-collect-payment-link` · you started it (your listing)
- **Message** (Swaploft notification inside the app the player opened; Polish with translation): "Sprzedane! Sold! Your rucksack, €35.00, order SW-•••• 4471. Swaploft holds the payment until the buyer receives it, then pays it to your saved account. Print your label and drop it at a Trundle locker by Friday. swaploft.example/sales/4471". `request: none`; `ask` = "Print your label and drop it at a Trundle locker by Friday." (CR-30); `claims[0]` = "Swaploft holds the payment until the buyer receives it".
- **Checkables (G, 5):** `sender.detail` (W1, "It fits: a notice inside the Swaploft app you opened yourself, about your own listing. That isn't proof on its own, so weigh it with what it asks: to post the parcel.") · `link` (W3, "It fits: swaploft.example, Swaploft's own address, the sale in your own account…"; allowed: owner part matches, low stakes) · `reference` (order number, neutral) · `claim` (neutral: "Says the money is held until delivery, then paid to your saved account. That's how a real sale shows, inside the app.") · `request` ("Asks you to post the parcel. No card, no login, nothing to collect.").
- **Actions:** "Print the label" (`proceed`, target ★★★) · "Check the sale in your Swaploft sales list" (`check_with_platform` ★★★; in focus) · "Report the notice" (report, 0, −5) · "Ignore it for now" (`ignore` ★★; outcome "Friday comes; the app reminds you once, then the sale is cancelled.").
- **Debrief L1 (genuine):** tell "In the app you opened: sold, money held, post it." · what works "Posting it was right. That's what being paid looks like." Habit card `calm-not-paranoid`. Layer 2: "A real sale shows inside Swaploft, and the money goes to the account you saved there. Remember this screen: it's the one a fake buyer can't show you."

**5-2 `warsaw-02-vote-for-the-band`** · fraud (MAT callback) · messenger → browser → browser · diff 3 · calm (no timer) · levers helpfulness, affection, small_amount · Kettle, **Votelark** (new, scam-only) · contact Ola (contact-only, §25.9)
- **Message:** Ola's saved contact "Ola (volunteers)", in your usual chat (`earlier[]`: "Ola: Welcome to Warsaw! See you at Saturday's stall 🙂"). "Hi! Could you vote for my little sister's band in the city school contest? 🙏 You just log in with your phone number and type the code you get. votelark-vote.example/band/…" `request: log_in`; `ask` = "Could you vote for my little sister's band in the city school contest?"; `claims[0]` = "You just log in with your phone number and type the code you get."
- **Checkables (4; R 2):** `sender.detail` **D** (W2 neutral: "Shows Ola's saved contact, in your usual chat, as a real message from her would. An account can be taken over and show the same contact, so it can't prove anything either way. Judge the request.") · `request` **D** ("Asks you to vote for a band. Friends ask favours like this, so it can't prove anything either way. Look at what voting needs.") · `claim` **R** ("A vote that needs the code sent to your phone. That code is a key to your Kettle account, not a vote.") · `link` **R** ("votelark-vote.example: a voting site you don't know, asking you to log in with your number.").
- **Actions:** "Open the link and vote" (`open_link` → `vote_page`, target) · "Call Ola's saved number (a normal call)" (`call_back_known` ★★★; outcome "Ola: 'Vote? My sister's eleven and plays the recorder. Someone's in my Kettle, I think.'") · "Report the chat" (report) · "Ignore it" (ignore).
- **`vote_page` (training page):** "Vote now · Enter your phone number". Read-only demo field. Action "Enter your number" (`open_link` → `code_page`) · "Close it" (`ignore`). Checkables `page.address` R, `page.info` D.
- **`code_page` (training page + banner):** banner (Kettle SMS, no actions): "Kettle code: 3•••••. Don't share it. This code registers your Kettle account on a new device." Page: "Enter the 6-digit code to confirm your vote." Checkable `request` R ("asks for the code the banner says registers your account on a new device"). Actions: "Type the code to vote" (`enter_details`, fall) · "Close it and call Ola" (`call_back_known`, ★★ engage cap) · "Close it" (`ignore`, ★★).
- **Writer note (BRAND_CHECK):** real institutions do run online votes, so the tell stays on the code banner ("registers your Kettle account on a new device"). No reveal, debrief or habit card says or implies "online votes are fake".
- **Fall** narrative: "'Thanks for voting!' A minute later Kettle logs you out on your phone. Your contacts start getting 'vote for my sister's band' from you." Damage control (6, 2 harmful): `log_out_unknown_devices` (stop) · `reregister_app_own_number` (stop) · `turn_on_two_step` (secure) · `warn_contacts` (warn: "another way, not in Kettle") · harmful `reply_to_sender` · harmful `keep_quiet`.
- **Debrief L1 (≈17):** tell "A vote that needs the code from your phone." · what works "Never type that code anywhere. Call your friend." Layer 2: "This is one way friends' accounts get taken over: the code that registers your account goes to someone else. Then your account asks your friends." Prevention: "Turn on Kettle's two-step PIN." `already_clicked.entered_details`: "Typed the code? Open Kettle's linked devices and log out any you don't know, set the app up again with your own number, turn on two-step, and warn your contacts another way." Habit card `codes-are-only-for-you`.

**5-3 `warsaw-03-collect-your-payment`** · fraud (MCP) · messenger → browser · diff 3 · timer 45; pusher at 25 s (same number): "Courier comes at 5! Please collect it now 🙏" · levers helpfulness, urgency, greed (small) · Kettle, Swaploft (claimed), look-alike `swaploft-safe-delivery.example` (registered)
- **Message:** Kettle, new contact (CR-19) "+48 5•• ••• •12". Polish with translation: "Hi! I'm the buyer for your rucksack on Swaploft 🙂 I've paid already, courier delivery included. Collect your payment here: swaploft-safe-delivery.example/collect/rk-82" (the path never reuses the private order number from 5-1; a scammer sees only the public listing). `request: open_link`; `ask` = "Collect your payment here"; `claims[0]` = "I've paid already, courier delivery included."; `references: ["your rucksack on Swaploft"]`.
- **Checkables (5; R 3):** `sender.detail` **R** ("Not in your contacts: a number writing about your Swaploft listing, outside Swaploft. A real buyer talks to you in the Swaploft chat.") · `link` **R** ("swaploft-safe-delivery.example. Read the end: the owner part is swaploft-safe-delivery.example, not swaploft.example.") · `request` **R** ("A link to collect money. When you're paid, it shows inside Swaploft; nobody sends you a link to receive it.") · `claim` **D** ("Says they've paid. A real buyer might say so too; if it's true, it shows in your Swaploft sales, so the message can't prove anything either way.") · `reference` **D** (neutral: "Names your real listing. It's public, so it can't prove anything either way.").
- **Actions:** "Open the link and collect it" (`open_link` → `collect_page`, target) · "Open your Swaploft sales yourself" (`check_with_platform` ★★★; outcome "This morning's real sale is there: rucksack sold, €35.00 held by Swaploft until delivery, then paid to your saved account. Nothing to collect. Real payments show here.") · "Block and report the number" (`block` ★★) · "Ignore it" (ignore ★★).
- **`collect_page` (training page, label "Swaploft Safe Delivery"):** "Collect €35.00 · Enter your card to receive the payment": card number, expiry, security code (read-only demo values, nothing sent). Checkables: `page.address` R, `page.info` D, `request` R ("Asks for your card's security code to pay you. Nobody needs that to send you money."). Actions: "Enter your card to collect" (`enter_details`, fall) · "Close it and open Swaploft yourself" (`check_with_platform`, ★★; same outcome as above: this morning's sale, money held until delivery, nothing to collect) · "Close the page" (ignore, ★★).
- **Fall:** narrative "'Processing your payout…' Ten minutes later your Larchwick app shows €349.00 paid to an online shop. Nothing came in." Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `tell_trusted_adult` (stop) · `keep_evidence` (secure) · `report_buyer_in_app` (report, new) · harmful `ask_buyer_to_cancel` (new) · harmful `wait_for_money` (new). Layer 2 adds "Then call your bank on the number on your card; some payments can still be stopped." (MCP §5.1.)
- **Debrief L1 (≈18):** tell "A buyer off Swaploft, with a link to collect your money." · what works "Open Swaploft yourself: real payments show there." Habit card `stay-on-the-platform` (first shown here).

**5-4 `warsaw-04-kasia-twelve-euros`** · genuine, high · messenger → banking · diff 4 · timer 45; honest pusher at 30 s (Kasia): "Off now! Tonight's fine 🎻" · `pattern: hijacked-friend-payment-code` (twin of 5-6) · Kettle, Larchwick · cast Kasia
- **Message:** Kasia's saved contact "Kasia (Warsaw)" (`earlier[]`: "Kasia: Tape's in the hall if you need it 📦"). "Leaving for rehearsal! Can you send me the €12 for the tape and boxes from this morning? To my account as usual, in your Larchwick app. Tonight's fine 🙂" `request: pay`; `ask` = "Can you send me the €12 for the tape and boxes from this morning?"; `references: ["the tape and boxes from this morning"]`; `honest_deadline` "Tonight's fine". **Interrupt** at 15 s, Mateus (genuine, small talk): "Lamp's sold. Twenty minutes. I'm framing the photo."
- **Checkables (G, 3):** `sender.detail` (W2 neutral, money request) · `reference` (neutral: "The tape and boxes you agreed this morning, in person.") · `request` ("Asks for the €12 you agreed in person, to her own account, by a transfer you start yourself. No code, no link.").
- **Banking `kasia_transfer`** (`start_transfer`, a `step`, no cap): payee typed from her contact, "Kasia Wójcik", IBAN `PL•• … 3308`, €12.00. Result **unavailable** (researcher M-C: the payee-name check can't return a match on a Polish account in Nov 2026). `payee.name_check` (neutral): "The name couldn't be checked for this account. That proves nothing either way; you agreed the €12 with Kasia in person." · `payee.iban` (neutral). Stars unchanged. Actions: "Send €12" (`proceed` ★★★) · "Cancel and call Kasia first" (`call_back_known` ★★★) · "Cancel" (`ignore`, dismiss on genuine high, 0; "You didn't send the €12 you'd agreed. Kasia was real.").
- **Actions (message):** "Pay her in the Larchwick app" (`start_transfer`, target) · "Call Kasia's saved number first" (`call_back_known` ★★★; "Kasia, on the stairs: 'Yes, me! Tonight's fine.'") · "Report the message" (0, −5) · "Ignore it" (ignore, 0).
- **Debrief L1 (genuine):** tell "Money you agreed in person, to her own account, by a normal transfer." · what works "Paying was fine; a call never hurts." Layer 2: "A real friend asks for a transfer you start yourself, to their own account, and is happy to take a call. Remember that shape." Habit card `call-the-number-you-know` (scope line: requests you didn't agree in person).

**Arc beat (`warsaw-arc-alex-NN`).** Placed between 5-4 and 5-5, after a genuine friend payment and before a marketplace scam: never next to 5-6, so a "friend asks for money in a chat" debrief can't be read against the arc.

**5-5 `warsaw-05-card-photo-in-app`** · fraud (MCP) · marketplace (Swaploft chat inside the app, CR-33) · diff 4 · timer 45 · levers helpfulness, authority · Swaploft
- **Message:** Swaploft in-app chat, buyer "user 2208" on your stove listing (Polish with translation): "Hi! I'll take the stove for €40. Swaploft verifies sellers before payout: send me a photo of your card, both sides, so the money can reach you. Their rules: swaploft.example/help/payouts". `request: enter_details`; `ask` = "send me a photo of your card, both sides, so the money can reach you"; `claims[0]` = "Swaploft verifies sellers before payout"; `references: ["your stove listing"]`. **Interrupt** at 20 s, Mateus: "Does this lamp photo need more light? Be honest."
- **Checkables (5; R 1; difficulty 4: on the real platform, a real help link):** `sender.detail` **D** (W1: "A buyer's account inside Swaploft's own chat, as a real buyer's would be. Anyone can open an account, so it can't prove anything either way.") · `link` **D** (W3: "swaploft.example: Swaploft's own address. Anyone can paste a real link, so it can't prove anything either way.") · `reference` D · `claim` **D** ("Says Swaploft checks sellers. Platforms do run checks, inside their own settings; a buyer saying so can't prove anything either way.") · `request` **R** ("A photo of your card, sent to a buyer. Being paid never needs your card details, and the platform never asks for them through a buyer.").
- **Actions:** "Send a photo of your card" (`enter_details`, target, fall) · "Check your Swaploft settings yourself" (`check_with_platform` ★★★; "Payouts go to the bank account saved in Settings. Swaploft never asks for card photos, and never through chat.") · "Report the buyer in Swaploft" (report ★★) · "Ignore it" (ignore ★★).
- **Fall:** damage control as 5-3 (block card = stop).
- **Debrief L1 (≈17):** tell "Even inside Swaploft: being paid never needs your card." · what works "Check your settings yourself; report the buyer." Layer 2: "Staying on the platform helps, but it isn't proof. What the buyer asks for is." Habit card `stay-on-the-platform`.

**5-6 `warsaw-06-kasia-payment-code`** · fraud (HFC; the chapter's only code scenario) · messenger · diff 4 · timer 45; pusher at 20 s (same chat): "Please, they're waiting at the till 😬" · levers affection, urgency, small_amount, helpfulness · Kettle, Larchwick · cast Kasia (account taken over)
- **Message:** Kasia's saved contact, her real chat (`earlier[]`: "Kasia: Tape's in the hall if you need it 📦" · "Kasia: Leaving for rehearsal!"). "Help! I'm at the music shop for new strings and my card's been declined 😩 Can you send me a 6-digit payment code from your Larchwick app? I'll pay you back tonight, promise." `request: share_code`; `ask` = "Can you send me a 6-digit payment code from your Larchwick app?"; `claims` = ["my card's been declined", "I'll pay you back tonight, promise."]. **Interrupt** at 12 s, Noor: "inspector, quick q: is Warsaw cold?? packing for a trip".
- **Checkables (4; R 1):** `sender.detail` **D** (W2) · `claim` **D** ("An excuse for asking. Real friends' cards do get declined, so it can't prove anything either way.") · `claim#2` **D** (neutral promise) · `request` **R** ("A payment code from your banking app. A code like this pays **from your account** once you confirm, wherever it's typed. Never send it to anyone, even a friend.").
- **Actions:** "Make a code and send it to her" (`share_code`, target, fall) · "Call Kasia's saved number (a normal call)" (`call_back_known` ★★★; "Kasia picks up between pieces: 'Strings? I'm in rehearsal, my phone was in my bag. Someone's in my Kettle!'") · "Report the chat" (report ★★; outcome "Reported. Now call Kasia on her number, a normal call, so she can get her account back.") · "Ignore it" (ignore ★★).
- **Fall** narrative (CR-34 fallback until it lands): "You send the code. Your Larchwick app asks: 'Confirm €249.00 to TREMOLIK?' You confirm, as you would at a till. 'Thanks!! 😘' Then: 'It didn't go through, can you send one more?'" (second request: generic friend-in-need pattern, HFC §2.3). Damage control (6, 2 harmful): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `tell_real_person` (warn: Kasia, by a normal call) · `report_account_in_app` (report, new) · harmful `send_code_to_cancel` (new) · harmful `reply_ask_money_back`.
- **The lesson is the code request (psych S3).** The call-back outcome shows it wasn't her, but no reveal, "You chose" line or debrief says her story didn't fit (being at a shop with a declined card is plausible). Every tell points at "a code from your banking app", and the `claim` reveals stay neutral.
- **With CR-34:** the code send opens the Larchwick confirmation (`code_confirm` beat) where the player can still read the recipient (§25.5).
- **Debrief L1 (≈18):** tell "Her real chat, but a code from your bank app." · what works "Never send a code. Call her on her saved number." Layer 2: "A Kettle call goes to whoever holds the account; a normal phone call goes to her SIM." (as Amsterdam 2-8) · "Read who gets the money before you confirm anything in your app." · "Compare this afternoon's real request: a normal transfer, to her own account, that you start yourself." · **Payment-code line (Warsaw only, sceptic 8):** "A payment code from your banking app is money: only type it where you are paying yourself, and read what you're confirming." `already_clicked.shared_code`: "Sent a code? If the app asks you to confirm, don't. If you already confirmed, call your bank now on the number on your card. Then call your friend another way." Habit card `codes-are-only-for-you`.

**5-7 `warsaw-07-mateus-asks`** (drill, unscored; damage control for Mateus, like Home 0-5) · messenger · cast Mateus · `pattern: hijacked-friend-payment-code`
- **Message:** Mateus's saved contact "Mateus (work phone)": "Um. 'Kasia' asked me for a payment code an hour ago. I sent it AND confirmed in my app, didn't even read it. €249 to some music shop. Kasia just rang from rehearsal: it wasn't her. What do I do first? 😬" It works whatever the player did in 5-6 (Mateus got the message on his own phone).
- **Actions:** "Talk Mateus through it, step by step" (`proceed` → outcome `helping_mateus`, with recovery list) · "Tell him it's only €249, let it go" (`reply` → outcome "Mateus: 'Mm. I'll still call the bank, it's free.' He does, and comes back: 'Glad I did.'"; no damage control, no stars).
- **`helping_mateus` recovery (6, 2 harmful):** `call_bank_stop_payment` (stop) · `keep_evidence` (secure: the chat and the app's payment record) · `report_account_in_app` (report: Kasia's account, in Kettle) · `report_to_police` (report) · harmful `send_code_to_cancel` (feedback in Mateus's voice: "Another code? That's how they'd take more. Bank first.") · harmful `keep_quiet` (feedback, psych S2: "Feeling embarrassed is normal. The advice is to call the bank straight away, without shame. I'm calling.").
- **Whatever the player picks, Mateus calls his bank first** (outcome narrative after damage control): "Mateus calls Larchwick on the number on his card, then reports Kasia's account. 'Done. Thanks for staying calm for me.'" So the placed beat and the resolution are true in every branch (STORY §3.11 (7)). Engine: CR-32.
- **Debrief (drill):** tell "He told someone fast, and the bank came first." · what works "Stop the damage first: call the bank on the card's number." Layer 2: "Experts get caught too. What counts is the next ten minutes." Then the payment-code line, as 5-6. Habit card `stop-the-damage-first`.

**5-8 `warsaw-08-atlas-lines`** · genuine, low, off-focus · email · diff 3 · calm · Waymarker
- **Message:** from adaeze.okafor-lind@waymarker-network.example: "Hi! Could you send me three lines on Warsaw for the Atlas by Thursday? The draft is here: desk.waymarker-network.example/atlas/warsaw. No rush. A." `request: reply`; `ask` = "Could you send me three lines on Warsaw for the Atlas by Thursday?"
- **Checkables (G, 3):** `sender.detail` ("It fits: Waymarker's own domain and Adaeze's address in the staff directory…") · `link` ("It fits: desk.waymarker-network.example, Waymarker's own address…") · `request` ("Asks for three lines of writing. No money, no code, no login request.").
- **Actions:** "Reply: on it, Thursday's fine" (`proceed` ★★★) · "Ask Adaeze through the staff directory first" (`ask_someone` ★★★, off-focus double check) · report (0, −5) · "Leave it" (ignore ★★).
- **Debrief L1 (genuine):** tell "Your coordinator, asking for writing." · what works "Reply as normal." Habit card `calm-not-paranoid`.

### 25.5 Device moments
- **Swaploft in the app vs. outside it (CR-33).** The marketplace view (5-1, 5-5, boss beat 1) shows a Swaploft header, the listing card and, for system notices, a "Swaploft" sender row; buyer chats show the buyer's handle. The contrast the chapter builds: **5-1** (a real sale, money held, nothing to collect) → **5-3** (off the app, a link to collect) → **5-5** (on the app, but asking for your card) → **boss** (on, then off, then card, then bank login). Being in the app is evidence to weigh, never proof (W1).
- **The collect page.** A training page labelled "Swaploft Safe Delivery" with a card panel (5-3, boss beat 2) or a bank-login panel (boss beat 3). Read-only demo values, watermark, "Training page" title and landmark, no network (Red Line 2). Never a Swaploft sign-in page (producer constraints, §25.1: no fake marketplace login pages).
- **The code confirmation (CR-34).** In 5-6, sending the code opens the Larchwick app's confirmation: "Confirm payment · €249.00 · to TREMOLIK · Confirm / Decline". The recipient is a checkable (`payee.name`, red flag: "Not Kasia: a shop you're not in."). Scoring with CR-34: Confirm = fall; Decline or "Decline and call Kasia" = ★★ (10 points, ruling R18; you sent a code, but declining at the confirmation is a real save). Without CR-34 the confirmation is narrated in the fall (§25.4).

### 25.6 Boss 5-9 `warsaw-09-boss-stove`
- **Setup:** "Evening. Kasia is at her concert and Mateus is packing. Your stove listing has a new message."
- **Levers:** helpfulness, urgency, greed (small). Pusher on beat 3 at 20 s: "Courier's downstairs!!"

**Beat 1, Swaploft chat (start, 40 s).** Buyer "user 3150" (Polish with translation): "Hi! I'll take the stove for €40 and add €5 for a quick pick-up 🙂 I'm hardly ever on here, let's continue on Kettle: +48 5•• ••• •31. This one: swaploft.example/item/…" `request: reply`; `ask` = "let's continue on Kettle"; `phone_numbers: ["+48 5•• ••• •31"]`; `claims` none.
- Checkables (5; R 1): `sender.detail` D (W1) · `link` D (W3) · `reference` D (the listing) · `phone_number` D ("A number for chatting. Real buyers share numbers too, so it can't prove anything either way. What matters is leaving Swaploft.") · `request` **R** ("Asks you to leave Swaploft's chat for Kettle. Off the platform, Swaploft can't see the deal or protect it.").
- Actions: "Move the chat to Kettle" (`reply`, target; **CR-35**, built per R14: an engage that ends a boss beat, ★★) · "Keep it in Swaploft: check your sales" (`check_with_platform` ★★★; "Nothing paid yet. Real offers and payments show here. Then Kettle pings anyway.") · "Report the buyer in Swaploft" (report ★★) · "Ignore it" (ignore ★★).

**Beat 2, Kettle (`arrives_after: 45`, 40 s, `covered_by: [start]`).** From "+48 5•• ••• •31" (CR-19 new contact): "It's the stove buyer 🙂 I've paid already, courier delivery included. To receive the money, collect your payment here: swaploft-safe-delivery.example/collect/3150. The courier comes in an hour." `request: enter_details`; `ask` = "To receive the money, collect your payment here"; `claims[0]` = "I've paid already, courier delivery included."
- Checkables (5; R 2): `sender.detail` D ("Not in your contacts: the number the buyer gave you in Swaploft. It is the buyer, so it can't tell you anything either way.") · `claim` D (as 5-3) · `reference` D · `link` **R** (as 5-3) · `request` **R** (as 5-3).
- Actions (no engage on boss beats): "Enter your card details through the link" (`enter_details`, target) · "Open your Swaploft sales yourself" (`check_with_platform` ★★★) · "Block and report" (`block` ★★) · "Ignore it" (ignore ★★).

**Beat 3, Kettle (`arrives_after: 45`, 40 s, `covered_by: [start, collect]`).** Same number: "Courier's here in 30 min! Your payment is on hold until you confirm with your bank. Log in here to release it: swaploft-safe-delivery.example/release/3150". `request: log_in`; `ask` = "Log in here to release it"; `claims[0]` = "Courier's here in 30 min!" **Design combination (fraud-researcher):** the brief sources a collect page that asks for a card "or your bank login"; the "release a payment on hold" framing as a separate follow-up is the game's combination, and no debrief presents it as a known sequence.
- Checkables (4; R 2): `sender.detail` D · `claim` D (neutral pressure line; deadlines are never checkables, but this is a claim about a courier, not a deadline: the writer keeps it free of times if the sceptic reads it as one) · `link` **R** · `request` **R** ("A bank login to receive money. Nobody needs your banking password to pay you.").
- Actions: "Log in with your bank through the link" (`enter_details`, target) · "Open your Swaploft sales yourself" (`check_with_platform` ★★★) · "Block and report" (★★) · "Ignore it" (★★).

**Interrupt** (`after_beat: release`, genuine, `on_fall: skip`): Kasia: "Concert done! I think I played well 🎻 Home by eleven." Actions: "Reply: bravo, see you soon!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was Kasia, back on her own account.").

- **Counts:** R = 1 + 2 + 2 = 5; decoys on scheduled beats 4 + 3 + 2 = 9. Max **51**.
- **After a fall** (merged, cap 6): `block_card_in_bank_app` (stop; beat 2) · `call_bank_known_number` (stop; beat 3: bank login typed) · `change_password` (secure: "from the real app") · `report_buyer_in_app` (report) · harmful `ask_buyer_to_cancel` · harmful `wait_for_money`. Every fall outcome (beat 2 or beat 3) sets `warsaw_bank_called` (story only, R17). Beat 1's ★★ is not a fall.
- **Layer 1 for the boss and stamp screen** (≈18): tell **"Off Swaploft, a link to collect, then your bank login."** · what works **"Money comes to you inside the app. Check there."**
- **Layer 2, per beat:** beat 1 "Leaving the platform is the first step of this scam." · beat 2 "A link to collect money, on a look-alike address." · beat 3 "A bank login 'to release' a payment: nobody needs it to pay you." `already_clicked.entered_details`: "Typed card details? Block the card in your banking app now. Typed a bank login? Call your bank on the number on your card and change the password from the real app."

### 25.7 Strategy check (as §7.2)
**Assumptions:** CR-17/18/30/33/35 landed; R counts scheduled beats only; flags on `vote_page`, `code_page`, `collect_page`, `kasia_transfer` and the CR-34 confirmation count toward spotted, not R.
- **Standard fraud:** 5-2 R 2 (19), 5-3 R 3 (21), 5-5 R 1 (17), 5-6 R 1 (17) = **74**. Decoys on scheduled beats: 5-2 2, 5-3 2, 5-5 4, 5-6 3, boss 9 = 20.
- **Genuine:** 45. Own checkables: 5-1 5, 5-4 3, 5-8 3 = 11.
- **Boss:** R 5, max 51 (beat 1's best is ★★★ via `check_with_platform`; "Move the chat" is ★★ under CR-35).
- **Totals:** max = 74 + 45 + 51 = **170**. R = 7 + 5 = **12**: silver ≥ **4**, gold ≥ **8**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal | 74 + 45 + 51 | 170 | 100% | 12 | **Gold** |
| 2 | Ideal + asks Adaeze about 5-8 (off-focus) | same | 170 | 100% | 12 | Silver |
| 3 | Ideal but moves the boss chat to Kettle, then verifies beats 2–3 | 170 − 5 | 165 | 97.1% | 12 | **Gold** |
| 4 | Careful reporter | (14+16+12+12) + 45 + (30+6) | 135 | 79.4% | 12 | Silver |
| 5 | Ideal but reports Kasia's real €12 request | 170 − 20 | 150 | 88.2% | 12 | Silver |
| 6 | Tag everything + always verify | 60 + 45 + 45 | 150 | 88.2% | 12 − 31 = −19 | Bronze |
| 6a | Random single tag + always verify | 150 + 2×(½+⅗+⅕+¼) + ≈0.5 | ≈154 | ≈90.6% | 2.65 − 7.35 ≈ −4.7 | Bronze (silver only with all 7 hits: about 1 in 1,700) |
| 6b | Sender + link + always verify | 150 + 0 (5-3 tags sender R and link R: +4) | 154 | 90.6% | 5 − 13 = −8 | Bronze |
| 6c | Always tag the request + always verify | 150 + 2 (5-3) + 2 (5-5) + 2 (5-6) + 6 | 162 | 95.3% | 6 − 4 = 2 | Bronze |
| 6d | Request + every claim | 150 + 0 (every scenario's set includes a decoy claim or request: all void) | 150 | 88.2% | 7 − 11 = −4 | Bronze |
| 6e | Request + every link | 150 + 4 (5-3) | 154 | 90.6% | 10 − 8 = 2 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 88.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.4% | 0 | Bronze + tip |
| 9 | Blind always-dismiss | 40 + 30 + 10 + 0 + 10 | 90 | 52.9% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 52.9% | 0 | Bronze |
| 11 | **"Inside the app is safe"**: trusts anything in Swaploft (no tags there), checks and tags everything else as ideal | 5-2 19, 5-3 21, 5-5 fall 9, 5-6 17; genuine 45; boss b1 10 (moves, untagged), b2 15, b3 15, tags +6 (4 correct tags earn 8, capped at 6): boss 46 | 157 | 92.4% | 12 − 2 (5-5, b1 untagged) = 10 | **Gold** (rating ≥ 90, spotted ≥ 8; input to R15) |

Row notes:
- **6a:** hit chances 5-2 2/4, 5-3 3/5, 5-5 1/5, 5-6 1/4, b1 1/5, b2 2/5, b3 2/4; product ≈ 1/1,700.
- **6c:** the request is R on 5-3, 5-5, 5-6 and all boss beats, a decoy on 5-2 (the ordinary favour, as Paris 3-5), and a genuine detail on 5-1, 5-4, 5-8. Net 6 − 4 = 2.
- **6e:** links R on 5-2, 5-3, b2, b3 (4); decoy links on 5-5 and b1 (2); genuine links 5-1, 5-8 (2). Correct 6 + 4 = 10; wrong 1 + 3 + 2 + 2 = 8. Net 2.
- **Row 11** lands at 92.4% (157; corrected 2026-11-19, the boss tag bonus is capped at +6, not +4) with 10 spotted, so **gold** under today's rules (one well-recovered fall plus one ★★ boss beat). This is Paris's Q3 again; per R15, `stamps.gold.max_falls` stays parked and this row is an input to the balancing pass. If that pass sets `max_falls: 0`, row 11 becomes silver. **Balancing pass (T-3.13):** `max_falls: 1` with LO-16 recovery proposed (R24), so row 11 stays gold (§7.3).

### 25.8 Warsaw reveal rulings
- **W1. Swaploft senders.** A Swaploft **system notice inside the app the player opened** (5-1) may use "It fits" (something the player opened, about their own listing). A **buyer's account inside Swaploft chat** (5-5, boss beat 1) is neutral: anyone can open one.
- **W2. Saved contacts on money, code or login requests are neutral** (ruling 1, §22.8): Ola (5-2), Kasia (5-4 genuine and 5-6 fraud alike).
- **W3. Swaploft's real domain in a buyer's message is neutral** (5-5, boss beat 1); only a system notice in the app may say "It fits" on it (5-1).
- **W4. "Collect your payment"** is the debrief wording; "Swaploft Safe Delivery" appears only as the fake page's label.
- **W5. A new number writing about your listing outside Swaploft** is a red flag (5-3), but on boss beat 2 the number is one the buyer gave you in beat 1, so it is neutral there: the tell has already happened (leaving the platform).

### 25.9 New brands, cast, content
- **Votelark** (new, scam-only): a "school contest" voting page that asks for your phone number and the code you get. Host `votelark-vote.example`. Training pages only. Kept by BRAND_CHECK (MW1–MW4). Alternatives "Cheerpoll", "Tunepoll".
- **TREMOLIK** (new; merchant name on the Larchwick confirmation, 5-6 and drill 5-7): a fictional online music shop, never a real one, no domain. Kept by BRAND_CHECK (MW1–MW4). No alternatives kept (both earlier alternatives dropped after review: too close to a real Polish retailer and a real festival).
- **Swaploft:** `swaploft-safe-delivery.example` (registered) gains paths `/collect/<id>` and `/release/<id>`; real-domain paths `/sales/<id>`, `/item/<id>`, `/help/payouts`. The fake page label "Swaploft Safe Delivery" is already implied by the look-alike; `ux-artist` notes it in `role_in_game`. Add Swappie and Swapfiets to `checked_against` (open STATUS follow-up).
- **Larchwick:** a "6-digit instant payment code" feature (5-6 only), generic, never styled after a real payment scheme (HFC §1).
- **Trundle:** named only as the locker for posting in 5-1.
- **Art notes (sceptic 5; for `ux-artist`):** the Trundle locker must not use a yellow-and-black locker look (or any real locker network's colours or shape); the Larchwick payment-code screen and its confirmation use Larchwick's own app style and must not resemble any real Polish mobile-payment scheme's look (no look-alike code layout, colours or logo mark). New expressions: Kasia `worried` (placed beat); phone-ear poses for Mateus's If-then panel and Lucía's (§24.2).
- **Cast (`content/cast.yaml`):** `kasia` "Kasia Wójcik", role "Music student, Waymarker volunteer (Warsaw)", known channel "Saved contact: Kasia (Warsaw)"; notes: her real Kettle account is taken over in 5-6 (never her fault, never shown how); she is never the one who falls.
- **Cast proposal (contact only, for STORY's name register):** **Ola**, a fellow Waymarker volunteer, saved contact "Ola (volunteers)". Never drawn, never in a scene, no lines outside 5-2. Her real account is taken over in 5-2.
- **Recovery steps (new):** `report_buyer_in_app` ("Report the buyer with the app's own report button") · `report_account_in_app` ("Report the taken-over account in the app") · harmful `ask_buyer_to_cancel` ("Message the buyer and ask them to cancel it"; feedback "It feels like the quickest fix, but the 'buyer' is the scammer and won't undo anything. Block the card in your banking app first.") · harmful `wait_for_money` ("Wait until the money arrives"; feedback "Hoping the payment is on its way is natural, but no money is coming, and every minute counts. Block the card now.") · harmful `send_code_to_cancel` ("Send another code to cancel the payment"; feedback "A code only ever makes a payment; it can't cancel one. Call your bank on the number on your card instead.").
- **Habit cards:**
  - **New `stay-on-the-platform` (LO-10).** Title "Stay on the platform". Habit: "Keep the deal and the money inside the marketplace app you opened yourself. If you've been paid, it shows there. Receiving money never needs your card details or bank login." Example (first shown at 5-3; no scam domain): "A buyer you've never met says they've paid and sends a link to collect it? Open Swaploft yourself: real payments show there." Already clicked: "Typed card details? Block the card in your banking app now and call your bank on the number on your card. Typed a bank login? Call the bank and change the password from the real app."
  - `codes-are-only-for-you`: **body unchanged** (sceptic 8: it is first earned in Berlin, 1-5, so a payment-code sentence on the shared card would appear long before Warsaw). The payment-code sentence, "A payment code from your banking app is money: only type it where you are paying yourself, and read what you're confirming.", appears only from Warsaw on: in layer 2 of 5-6 and drill 5-7. A card-level addendum shown only after Warsaw (e.g. `habit_cards.yaml` `addendum: { after_chapter: warsaw, text }`) is a possible frontend follow-up, not required for this chapter.
  - `call-the-number-you-know`, `stop-the-damage-first` unchanged.
- **Atlas page:** `atlas_cards: [codes-are-only-for-you, stay-on-the-platform, call-the-number-you-know, stop-the-damage-first]` (STORY §3.5).
- **"Where to report and get help" (Poland) card:** wording in `docs/patterns/ch5-warsaw-sources.md` ("Poland help card"), linked from layer 2 of every Warsaw debrief.
- **Chapter file:** `content/chapters/warsaw.yaml`: slot 5; `patterns: [marketplace-collect-payment-link, hijacked-friend-payment-code]`; `callbacks: [messenger-account-takeover-code]`; am `[01, 02, 03]` (stop point after 03), pm `[04, arc, 05, 06, 07, 08, 09]`; `boss: warsaw-09-boss-stove`; rules as §25.1; `scenes: { arrival: warsaw-arrival, turn: warsaw-turn, resolution: warsaw-resolution, placed: [{ scene: warsaw-kasia-back, after: warsaw-07-mateus-asks }] }`.

### 25.10 Engine and schema change requests (CR-32 to CR-35)
- **CR-32 (non-blocker): damage control for a cast member in a drill.** An outcome may set `recovery_for: <cast id>`. The prompt reads "Pick the step {name} should take first, then 2 more." and the harmful-pick feedback may be voiced by that person (scenario `feedback` overrides already exist). Points and LO-16 count exactly as in Home 0-5. Interim: Home 0-5's generic prompt, with Mateus's message asking "What do I do first?".
- **CR-33 (blocker for 5-1, 5-5, boss beat 1, or fallback): marketplace view.** New device `marketplace` (or `messenger` with `message.app: swaploft`): Swaploft header, a listing card (`message.listing: { title, price }`, checkable as `reference`), system notices with a "Swaploft" sender row, and buyer chats with a handle. Same Check, tag, translation and timer behaviour as `messenger`. Fallback: `messenger` with sender detail "Swaploft app · notice" / "Swaploft chat · user 2208"; checkables and §25.7 unchanged.
- **CR-34 (non-blocker): code then confirm.** A `share_code` action may set `next_beat` to a `banking` beat with `payee.code_confirm: true` (renders "Confirm payment · amount · to {name}", checkable `payee.name`). That `share_code` is non-terminal and caps the group at ★★ (10 points, ruling R18; balance `points.code_then_confirm.star_cap: 2`); on the confirmation beat Confirm (`pay`) is the fall and Decline (dismiss) or "Decline and call {friend}" (verify) keep the ★★ cap. Fallback: terminal `share_code` with the confirmation narrated (§25.4).
- **CR-35 (blocker for boss beat 1): an engage that ends a boss beat.** On a scheduled boss beat, an engage action without `next_beat` may end that beat's group when a later scheduled beat continues the same conversation; it scores ★★ (the engage cap). Validator: allowed only if a later scheduled beat names it in `covered_by` or shares its sender thread. Built rather than a fallback (ruling R14).
- CR-30 (§24.9) is shared: Warsaw needs `ask` on `none` (5-1), `open_link` (5-3) and `log_in` (5-2, boss beat 3).

### 25.11 Open questions for the producer (Warsaw)
*Answered 2026-11-19: Q1 by R12 (the code stays Mateus's fall), Q2 by R13 (Kasia), Q3 by R14 (CR-35 built), Q4 by R15 (parked; row 11 is gold, an input). Q5 went to fraud-researcher in round 1: (c) is labelled a design combination (boss beat 3), (d) the amounts are illustrative and never typical (§25.1). Kept below for the record.*
1. **One code scenario.** 5-6 is the only scored code scenario; drill 5-7 is the same message on Mateus's phone, which keeps STORY's If-then line (Mateus, codes) word for word. Accept, or move Mateus's fall to the "collect your payment" page (High confidence, MCP §8) and ask `learning-psychologist` to reword his If-then line?
2. **Kasia as the hijacked account.** It makes the afternoon coherent (her real €12 request, then her taken-over account) and puts "it wasn't really me" in her mouth. Accept, or use an off-screen friend of Mateus's?
3. **CR-35 vs. its fallback** for the "move to Kettle" step in the boss.
4. **Row 11** (one in-app fall still reaches gold): feed into the parked `stamps.gold.max_falls` decision.
5. **For fraud-researcher:** (a) the vote request (5-2) as the MAT callback with the CERT vote-takeover advisory; (b) the card-photo request inside the platform's own chat (5-5; MCP §3.6 names the request, not the channel); (c) the "bank login to release the payment" beat (MCP §2.3 "or your bank login"); (d) the €349 and €249 loss amounts (invented, small, plausible); (e) "Swaploft holds the payment until delivery" as the genuine flow (MCP §7 calls the genuine flow a design inference).

## 26. Chapter 6 — Rome
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/spoofed-authority-call.md` (SAC) and `docs/patterns/cloned-voice-family-emergency.md` (CVF); callbacks `multichannel-support-callback.md` (MSC) and `messenger-family-impersonation.md` (MFI). Per-beat sources and their limits: `docs/patterns/ch6-rome-sources.md`. No source ids and no real body names inline (docs brand test). Replaces the §18 Rome summary. Rome adds **CR-36** (§26.9).

### 26.1 Goal, shape, rules check
- **The chapter habit (H):** **"Verify through a number you already know. Caller ID and a familiar voice prove nothing."** Teo's version, used on the rules card and in layer 2: "The number on the screen is the caller's choice. The number I dial is mine." (SAC §4.)
- **What the chapter teaches, in order of weight:**
  1. A number on the screen proves nothing, even an official-looking one or a saved contact's name (SAC §3.1). The tell is the **ask**: card details, a code, an approval, moving money, or "stay on the line" and "don't call your bank" (SAC §3.2–3.5).
  2. A familiar voice proves nothing (CVF §3.2). The tell is **new number + money + no normal call** (CVF §3.1, §3.4).
  3. The habit: hang up, then call a number you looked up yourself: the emergency number for the police, the number on your card for the bank, the saved number for family (SAC §4, CVF §4).
  4. The family code word is an **extra**, never the main check: "If you can't remember it, hang up and call the saved number anyway" (CVF §4, §8).
  5. Calibration: Teo's real call, Bruna's real request and Davide's real message are normal and ask for nothing odd.
- **Shape:** slot 6, difficulty 3–4, boss 4. Timers 45 s (slot 6), call beats 30 s, boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus drill 6-6 (Davide) and the arc beat. Estimated 16–18 min including scenes (QA to measure; cut candidate if over: 6-7's `officer_line` branch).
- **New patterns (2):** `spoofed-authority-call` (6-3, 6-7, boss), `cloned-voice-family-emergency` (6-2 twin, 6-4, drill 6-6). **Callbacks (2):** `multichannel-support-callback` (6-7, a text giving a number to call), `messenger-family-impersonation` (6-8, "new number" text; 6-5 and 6-1 are its genuine neighbours).
- **LO focus:** LO-08 (core), LO-07 (core), LO-04 (core in slot 6 per the LO doc), LO-18 (Teo, Davide, the code word), LO-06, LO-05, LO-01, LO-16, LO-17, LO-14 (arc).
- **Voice:** illustration and transcript only, **no synthetic audio**, not even fictional (as Paris, §23.12 item 7). Davide's case and the player's 6-4 are **calls** from a new number (CVF §2 "safer alternative"). No scenario uses a voice note in a chat (Low–Medium confidence); the If-then line's "voice note" stays as a general cue (§26.11 Q2).
- **Flavour:** Italian in-world text (`lang="it"`, inline translation, never a red flag) in texts from "Police Info", Davide's and Bruna's messages and small talk. The B&B with the lemon tree, Davide's exams, Giulia's first year abroad. Teo is at home and appears by phone and video only. A city is a stage, not a claim: no debrief says a scam "is Italian".
- **Premise and intro** (CR-27, ≤ 20 s): "Rome: you're staying at Signora Bruna's B&B. She and Teo have written postcards to each other for forty years, and this week you're writing the Rome page of the Atlas."
- **Rules card** (CR-27 pinned card), title **"Teo's rule for calls"**, two items: "The number on the screen is the caller's choice. The number I dial is mine." · "Police: 112. Bank: the number on my card. Family: their saved number." (Producer ruling on Q3: "112" appears only on the player's side, on this card and in "Call the police yourself" labels and outcomes; never in a scam message, transcript or caller ID, never a `tel:` link; Italy chapter and help card only. If redline:lint flags it, add a narrow allowlist entry.) A general rule (STORY §4.2 rule 2), never wrong on a genuine twin: calling Teo, Bruna or Davide back on their saved numbers is always ★★★ in this chapter.

**Mix rules (balance v3.1):**
- **Genuine** 3/8 = 37.5% ✓. **Truth order** (scored): G G F · F G F F F(boss); max run 3 ✓.
- **Themes:** `home` 2 (6-1, 6-5), `family` 3 (6-2, 6-4, 6-8), `authority` 3 (6-3, 6-7, boss). Max 3/8 ✓. Scored order home, family, authority, family, home, authority, family, authority: no two adjacent ✓.
- **Pressure parity:** genuine 3/3 (6-1 honest timer, 6-2 call timer, 6-5 timer) = 100%; fraud 5/5 = 100%; gap 0 ✓.
- **Difficulty parity:** genuine at 3 (6-1, 6-2) and 4 (6-5); fraud at 3 (6-3) and 4 (6-4, 6-7, 6-8, boss) ✓.
- **Decoys:** ≥ 2 on every fraud (counts in §26.7). **Sender-or-link decoy:** F = 5 needs 2: the official-looking caller ID in 6-3 and boss beats 1–2, the "Police Info" sender in 6-7 and boss beat 3 ✓.
- **Interrupts:** every difficulty-4 scenario has one (6-4 none: a call with a banking beat is already loaded; 6-5 Davide, 6-7 Noor, 6-8 Teo, boss Bruna after beat 3), genuine small talk that never points to the verdict.
- **Off-focus genuine:** 6-1 (Davide, no pattern). Calling Davide to check costs gold. 6-2 (pattern `cloned-voice-family-emergency`) and 6-5 (pattern `messenger-family-impersonation`) are in focus.
- **Red Line 8:** every scenario is a call, text, chat or banking beat. No courier, no cash or jewellery pick-up, no doorstep (SAC §2): stories that would continue offline end at the call or the transfer.
- **Never on screen:** prevalence or loss figures; refunds as certain ("may"); real police forces, badges, uniforms or numbers as props (the caller is a generic "Police"); how numbers are spoofed or voices cloned; voice quality as a tell (CVF §3, "not to teach"); accent, background noise or grammar as tells (SAC §3).
- **The Italy spoofing rule (ruling RM5):** never presented as protection. One layer-2 line in 6-3, word for word from `ch6-rome-sources.md`: "Since 2025, phone companies must block calls from abroad that show an Italian number. Even so, a number on your screen proves nothing." Nowhere else.
- **Sensitive chapter:** family emergency and a lost payment. Content note (STORY §5.6, unchanged): "This chapter includes a family-emergency story and a lost payment. Everyone ends up safe. You can pause or skip any story scene." Scenes with Davide's fall are `sensitive: true` (help order "Need to talk?" first, WHERE_TO_REPORT §3c).

### 26.2 Story beats (track S)
STORY §3.6, updated with this spec. No panel shows a caller, number, amount, voice clip or bank screen; nobody in a panel is injured, crying or endangered (STORY §5.7).
1. **Arrival** (before 6-1; 2 panels; calm). A small B&B with a lemon tree. Bruna (warm): "Teo's grandchild! Forty years of postcards and finally a visitor." Davide (laughing): "Nonna has told every guest about you. Sorry in advance." Cast: Bruna, Davide.
2. **Turn** (stop point, after 6-3; 3 panels; worried → calm). Teo and Bruna on a video call, like old friends. Bruna (worried): "Giulia calls every Sunday. I still worry every Monday." Teo (warm): "That's the job, Bruna. So we keep in touch, on the numbers we know." Bruna (calm), last: "Then you'll ring me on mine, old man." No scam content.
3. **Placed beat `rome-giulia-safe`** (after drill 6-6; 2 panels; worried → relieved; `sensitive: true`). Giulia on video (laughing, relieved): "I was in a lecture the whole time! Phone on silent." Bruna (calm), Davide drawn beside her (R-S3): "Everyone's safe. The bank first, then the rest." True in every branch: the drill always ends with Davide having called his bank (§26.4, 6-6). Moves Giulia's STORY v1.3 resolution line here, so the impersonated person is shown safe straight after the fall (STORY §5.7) and the resolution fits its cap with the variant.
4. **Resolution** (after the boss debrief; 4 panels + If-then; relieved; `sensitive: true`).
   - Bruna (calm), her past-tense story, placed after every Rome police debrief (STORY §4.2 rule 7): "A caller once said he was police. I said I'd ring the station myself. He hung up first."
   - Davide (sheepish): "It sounded exactly like Giulia. I didn't even think."
   - Bruna (calm): "Of course not. They made it sound like her. That's the trick, not you. We called the bank straight away."
   - Teo on video (warm): "Let's have a family code word for calls and voice messages. Both families. And it stays in the family."
   - **If-then panel (Davide), word for word from STORY §3.6:** "If someone I love asks for money by call, voice note or new number, then I call their known number and ask for our word." Extra line under it: "A voice can be copied. Calling the number you have reaches the real person."
   - **Variant `rome_bank_called`** (story-only, set by every boss fall outcome; the R17 approach): when set, it is the **first panel of the resolution** (R-M1), before the police story: Bruna (calm): "The bank was called straight away, the right first step. We'll see what it can do." No refund promise. Order with the variant: variant, police story, Davide, Bruna, Teo, If-then.
- **Map invitation (Bruna):** "Teo says you'd like Rome. My B&B has a room, and the lemon tree has opinions." (STORY §3.6.)
- **Panels:** 2 + 3 + 2 + 5 = 12 (+1 with the variant; the resolution is 6 with it, at the cap).
- **Art:** Davide's If-then panel uses a phone-at-the-ear pose (he is calling the known number). Giulia appears only as a video frame; Teo only on video.

### 26.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 6-1 | AM | Davide: "Green key = street door. Nonna says breakfast on the terrace till ten. Coming?" | messenger | genuine / low (off-focus) | 3 | honest timer 45 | home | LO-17 |
| 6-2 | AM | Teo's **real** call from his saved number: a "police" caller told him you'd had an accident; he hung up, called the police himself, then you. "Are you all right? That's all I need." | call | genuine / low (twin of 6-4) | 3 | call timer 30 | family | LO-17, LO-07, LO-08 |
| *arc* | AM | Arc slot N for this play position (default: slot 6) | messenger | arc | — | — | — | LO-14 |
| 6-3 | AM | Incoming call, official-looking number: "Police, fraud unit. Your card was copied and used in a crime. Stay on the line. Read me the card number and the three digits on the back." | call | fraud (SAC) | 3 | call timer 30 + pusher | authority | LO-08, LO-05, LO-04 |
| | | *Stop point + turn* | | | | | | |
| 6-4 | PM | A new number, **Teo's voice**: "Kiddo, it's Grandpa, on a neighbour's phone. I bumped a parked car; send €480 to the owner's account. Don't ring my phone, it's dead." Payee check: **match** on a stranger's name | call → banking | fraud (CVF core) | 4 | call 30; banking 45 | family | LO-07, LO-06, LO-04 |
| 6-5 | PM | Bruna: "Your laundry's washed and folded. €8 to my account, as on the price list in your room. Any time before you leave." Payee check: **match** | messenger → banking | genuine / high (twin of 6-8) | 4 | timer 45; interrupt | home | LO-17, LO-06 |
| 6-6 | PM | **Drill: Davide paid.** A new number with Giulia's voice; the bank said the name didn't match; he sent it anyway. Bruna is with him; you guide his damage control | messenger | drill | 3 | — | — | LO-16, LO-18 |
| 6-7 | PM | Text from "Police Info" (Italian): "Your Larchwick card is linked to a fraud investigation. Call the officer in charge today: 06 •••• ••41." Calling leads to an "inspector" who wants you to tap Approve in your bank app | sms → call | fraud (MSC callback, SAC) | 4 | timer 45 + pusher; interrupt | authority | LO-08, LO-09, LO-01 |
| 6-8 | PM | A new Kettle number: "Ciao! It's Davide, new number. Can you lend me €60 for the B&B's gas bill? Nonna's phone is off. My account's below." Payee check: **doesn't match** | messenger → banking | fraud (MFI callback) | 4 | timer 45 + pusher; interrupt | family | LO-07, LO-06 |
| 6-9 **Boss** | PM | Evening, alone. Beat 1: "Police" call: "Don't call your bank, staff there are under investigation. Read me the code they text you." Beat 2: "Larchwick Bank" call: move your savings to a "protected account" (payee check: **close match**). Beat 3: "Police Info" text: log in with your bank details to "confirm your identity" | call → call (+ banking) → sms | fraud (SAC) | 4 | boss timers 40 + pusher; interrupt after beat 3 | authority | LO-08, LO-05, LO-04, LO-06, LO-16 |

**Arc placement.** Arc slot N sits in the morning, between 6-2 and 6-3: every afternoon slot is next to a family-money debrief (6-4, 6-6, 6-8), which could unmask the arc's later "emergency, needs a loan" beat; 6-2's debrief (a real relative asking for nothing) and 6-3's (a police call) say nothing about friends or platforms.

### 26.4 Scenario specs
Shared rules as §24.4. Italian phone numbers masked `06 •••• ••NN` or `3•• ••• ••NN`; IBANs `IT•• … NNNN`, checksum-invalid. The card's number ends **00** (as every chapter; "the number on your card"). Every scored scheduled beat has a `request` (CR-30). Reveals follow CONTENT_GUIDE and RM1–RM7 (§26.8). `tell_trusted_adult` is `stop` in every personal-money fall. Every `start_transfer` from a fraud call carries `cap: engage` (R16, CR-31(b)).

**6-1 `rome-01-breakfast-till-ten`** · genuine, low, off-focus · messenger · diff 3 · honest timer 45, `honest_deadline` "Breakfast till ten" · cast Davide
- **Message:** saved contact "Davide (B&B)". "Ciao! 🔑 Green key = street door, small one = your room. Nonna says breakfast on the terrace till ten. Coming?" (`lang` mix, translation for "Ciao" and "Nonna"). `request: reply`; `ask` = "Coming?".
- **Checkables (G, 2):** `sender.detail` ("It fits: Davide's saved contact, in your usual chat. That isn't proof on its own, so weigh it with what he asks: whether you're coming to breakfast."; low stakes, §22.8 ruling 1) · `request` ("Asks if you're coming to breakfast. No money, no code, no link.").
- **Actions:** "Reply: on my way!" (`proceed` ★★★) · "Call Davide first to check" (`call_back_known` ★★★, off-focus double check: blocks gold; "Davide, from the stairs: 'Yes, me. Coffee's getting cold.'") · report (0, −5) · "Don't answer" (`ignore` ★★).
- **Debrief L1 (genuine):** tell "Your host's grandson, about breakfast. Nothing else." · what works "Reply as normal." Habit card `calm-not-paranoid`.

**6-2 `rome-02-teo-calls-you`** · genuine, low · call · diff 3 · call timer 30 · `pattern: cloned-voice-family-emergency` (in-focus twin of 6-4) · cast Teo
- **Setup:** "Mid-morning, on the terrace. Your phone rings: Grandpa Teo."
- **Message (call):** caller ID "Grandpa Teo" (detail "Saved contact: Grandpa Teo"); `voice: { sounds_like: teo }` (CR-36). Transcript:
  1. "Kiddo, it's Grandpa, on my own phone."
  2. "A man rang me saying he was police, and that you'd had an accident in Rome. The screen showed an official-looking number." (`claims[0]`)
  3. "I hung up, rang the police myself: nothing. Then I rang you, on the number I have saved."
  4. "So, are you all right? That's all I need." (`ask`)
  5. "And if anyone rings you saying they're police: same thing. The number on the screen is the caller's choice; the number you dial is yours."
  `request: reply`.
- **Checkables (G, 4; parity with 6-4):** `caller_id` (RM1 neutral: "Shows Teo's saved contact, as a real call from him would. A number on screen can be faked, so it can't prove anything either way. Judge what he asks.") · `voice` (RM2 neutral) · `claim` (neutral: "His story about someone else's call. It asks you for nothing.") · `request` ("Asks only whether you're all right. No money, no code, no number to call.").
- **Actions:** "Tell him you're fine" (`proceed`, target ★★★; "Teo, relieved: 'Good. Back to my café, then. Eight neighbours and a cake.'") · "Hang up" → "What now?": "Call Teo's saved number" (verify ★★★, in focus; "Teo picks up at once: 'Calling back? That's my grandchild.'") · report (0, −5) · "Leave it there" (dismiss, low ★★).
- **Debrief L1 (genuine):** tell "His saved number, and he asks for nothing but you." · what works "Answer him. Calling back is never wrong." Layer 2: "A real relative with a scare still asks for nothing you'd regret, and is happy for you to call back. Teo's rule is on your card: the number he dialled was his own choice." Habit card `hang-up-call-back` (Teo's example).

**6-3 `rome-03-police-card-call`** · fraud (SAC core) · call · diff 3 · call timer 30; pusher at 18 s (caller): "Are you still there? Don't hang up." · levers authority, fear, urgency · Larchwick (named only)
- **Message (incoming call):** caller ID "06 •••• ••13" (detail "Not in your contacts"). Transcript:
  1. "Police, fraud unit. Your bank card has been copied and used in a crime here in Rome."
  2. "You're not in any trouble. I just need to confirm the card is yours." (`claims[0]`)
  3. You: "Can I call you back?"
  4. "Please stay on the line. If we hang up, the case goes forward without you." (`claims[1]`)
  5. "Read me the card number, the expiry and the three digits on the back." (`ask`)
  `request: enter_details`.
- **Checkables (4; R 2):** `caller_id` **D** (RM1: "An official-looking number. A number on screen can be faked, even a real police or bank number, so it can't prove anything either way. Judge what the caller asks.") · `claim` **D** ("Says you're not in trouble. Real calls and fake ones both reassure you, so it can't prove anything either way.") · `claim#2` **R** ("Wants you to stay on the line so you can't check. A real officer is fine with you hanging up and calling back.") · `request` **R** ("Real police never ask for money, and nobody needs your card details read out on a call.").
- **Actions:** "Read out your card details" (`enter_details`, target, fall) · "Hang up" → "What now?": "Call the police yourself" (verify ★★★; "'We didn't call you. Calling us yourself was exactly right.'") · extra "Call your bank on the number on your card" (`call_back_known` ★★★; "Larchwick: 'Your card's fine. Nobody from the police needs its details.'") · extra "Call back this number" (`call_number_in_message`, note: "That's the number that just called. It can be faked, so you can't tell whose line it is. Dial a number you looked up yourself.") · report · "Leave it there" (★★).
- **Fall** narrative: "'Thank you. We'll be in touch.' An hour later your Larchwick app shows two online payments you didn't make." Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop) · `keep_call_evidence` (secure) · `report_to_police` (report) · harmful `call_back_caller_number` · harmful `wait_and_see`.
- **Debrief L1 (≈18):** tell "'Police' asking for card details, and to stay on the line." · what works "Hang up. Call a number you looked up yourself." Layer 2:
  - "The number on your screen is the caller's choice. The number you dial is yours."
  - **The spoofing line (RM5), word for word:** "Since 2025, phone companies must block calls from abroad that show an Italian number. Even so, a number on your screen proves nothing."
  - "Professional callers sound calm and credible; an accent or background noise is never the tell. The ask is."
  - `already_clicked.entered_details`: "Read out your card? Block it in your banking app now and call your bank on the number on your card."
- Habit card `hang-up-call-back`.

**6-4 `rome-04-grandpa-new-number`** · fraud (CVF core) · call → banking · diff 4 · call 30 s; banking beat on the slot timer (45 s, fresh after the call) · levers affection, fear, urgency · Larchwick · cast Teo (impersonated; never his fault)
- **Setup:** "After lunch. Your phone rings: a number you don't know."
- **Message (incoming call):** caller ID "+•• ••• ••• ••52" (detail "Not in your contacts"); `voice: { sounds_like: teo }` (CR-36: "Sounds like Grandpa Teo"). Transcript (illustration and transcript; no audio):
  1. "Kiddo? It's Grandpa. I'm on a neighbour's phone; mine's dead." (`claims[0]`)
  2. "I bumped a parked car. The owner says he'll call the police unless I pay €480 today."
  3. "My card's at home. Can you send it to his account? I'll pay you back tonight." (`ask`)
  4. "Don't ring my phone, it's dead. Just send it, please." (`claims[1]`)
  `request: pay`.
- **Checkables (5; R 3):** `caller_id` **R** (RM3: "A number you don't have saved, saying it's Teo. Teo's saved number is the one to call.") · `voice` **D** (RM2) · `claim` **D** ("An excuse for the new number. Phones do die, so it can't prove anything either way.") · `claim#2` **R** ("Tells you not to call his own number. A real Teo would be glad you checked.") · `request` **R** ("Money to a stranger's account, today. Teo's own rule: call his saved number first.").
- **Actions (call):** "Open the app and send it" (`start_transfer` → `owner_transfer`, target; `cap: engage`, R16) · "Hang up" → "What now?": "Call Teo's saved number" (verify ★★★; "Teo, at his library café: 'Dead phone? It's in my hand. Whoever that was, it wasn't me. Eight neighbours and a cake can vouch.'") · extra "Call back this number" (engage note as 6-3) · report · "Leave it there" (★★).
- **`owner_transfer` (banking; CR-31 on-call bar):** payee typed as the voice dictates, "J. Ashdale"; IBAN `•• … 6618` (masked, checksum-invalid); €480.00. Result **match**. Caller lines (beat-bound): "Type it exactly: J. Ashdale." · "See? It matches. Quick, before he calls the police."
  - Checkables (not in R): `payee.name_check` **D** (RM6, P3: "Name matches: the account is held by J. Ashdale, the name the caller gave you. That shows whose account it is. It doesn't show who's calling, and it isn't Teo's.") · `payee.iban` D.
  - Actions: "Confirm and send €480" (`pay`, fall, target) · "Hang up and call Teo's saved number" (`call_back_known`, ★★ under R16) · "Hang up and report it" (report ★★) · "Hang up and cancel" (`ignore` ★★).
- **Fall** narrative: "Sent. 'Thanks, kiddo.' The line goes dead. A minute later the same number rings again." (the second request, CVF §2) Damage control (6, 2 harmful): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `tell_real_person` (warn: Teo, on his saved number) · `keep_call_evidence` (secure) · harmful `pay_second_request` · harmful `call_back_caller_number`.
- **After damage control, every branch (R-M2):** outcome "You ring Teo's saved number. He picks up at the café: 'I'm fine, kiddo. That wasn't me, and it isn't on you.'" Shown after a fall too, so Teo is shown safe and the player is not blamed.
- **Debrief L1 (≈18):** tell "Teo's voice, but a new number, money, and 'don't call me'." · what works "Hang up. Call his saved number." Layer 2:
  - "A voice can be copied from a short recording. Calling the number you already have reaches the real person." (CVF §3.2; never "scammers send voice notes", never voice quality)
  - "The name matched because you typed what the caller said. It shows whose account it is, not who's asking."
  - "A family code word helps too, as an extra. If you can't remember it, hang up and call the saved number anyway." (RM7)
  - `already_clicked.paid`: "Sent money? Call your bank now on the number on your card and ask it to try to stop or recall the transfer. Don't pay a second request."
- Habit card `call-the-number-you-know`.

**6-5 `rome-05-laundry`** · genuine, high · messenger → banking · diff 4 · timer 45, `honest_deadline` "Any time before you leave" · `pattern: messenger-family-impersonation` (in-focus twin of 6-8) · cast Bruna
- **Message:** saved contact "Bruna (B&B)" (`earlier[]`: "Bruna: Welcome! The lemon tree says hello 🍋"). "Your laundry's washed and folded on your bed 🙂 €8, to my account as on the price list in your room. Any time before you leave." `request: pay`; `ask` = "€8, to my account as on the price list in your room."; `references: ["the price list in your room"]`. **Interrupt** at 15 s, Davide (genuine, small talk): "Exam done!! 🎉 Pizza later?"
- **Checkables (G, 3):** `sender.detail` (§22.8 ruling 1, neutral on a money request: "Shows Bruna's saved contact, in your usual chat. An account can be taken over and show the same, so it can't prove anything either way. Judge the request.") · `reference` ("It fits: the price list in your room says laundry €8. That isn't proof on its own, so weigh it with what she asks.") · `request` ("€8 to her own account, by a transfer you start yourself, for something you used. No link, no code.").
- **Actions (message):** "Pay her in the Larchwick app" (`start_transfer` → `laundry_transfer`, a plain `step`) · "Ask Bruna at the desk first" (`ask_someone` ★★★, in focus; "Bruna, at the desk: 'Yes, me. And thank you for asking.'") · report (0, −5) · "Ignore it" (`ignore`, dismiss on genuine high, 0).
- **`laundry_transfer`:** payee typed from the price list, "Bruna Esposito"; IBAN `IT•• … 2207`; €8.00. Result **match** (P3 neutral). Actions: "Send €8" (`proceed` ★★★) · "Cancel and ask Bruna first" (`ask_someone` ★★★) · "Cancel" (`ignore`, 0).
- **Debrief L1 (genuine):** tell "Her saved chat, her own name, for laundry you had." · what works "Paying was fine; asking is never wrong." Layer 2: "A real request is for something you know about, to the person's own account, and can wait for a question." Habit card `call-the-number-you-know` (scope line: requests you didn't expect).

**6-6 `rome-06-davide-paid`** (drill, unscored; damage control for Davide, CR-32 `recovery_for: davide`) · messenger · cast Davide, Bruna · `pattern: cloned-voice-family-emergency`
- **Message:** Davide's saved contact, in the usual chat. "Can you come down? A call from a new number. It was Giulia's voice: lost her bag on the train, needed €350 for a hostel tonight, to a friend's account. The bank said the name didn't match. She said it was her friend's, so I sent it. Then Giulia texted from her normal number: she's in a lecture. Nonna's here. What do I do first?" Amount and story stay in the device (never in a scene).
- **Actions:** "Go down and talk him through it" (`proceed` → outcome `helping_davide`, `recovery_for: davide`) · "Tell him to wait and see if she calls again" (`reply` → outcome: Bruna: "No waiting. Bank first, Davide." He calls; no damage control, no stars).
- **`helping_davide` recovery (6, 2 harmful):** `call_bank_stop_payment` (stop) · `keep_call_evidence` (secure: the call log, the number, the payment) · `report_to_police` (report) · `tell_real_person` (warn, R-S1: "Tell Giulia on her saved number that her voice is being used.") · harmful `pay_second_request` (feedback, Davide's voice: "If they ring again, I'm not sending more. Bank first.") · harmful `call_back_caller_number` (feedback: "Calling that number back reaches them, not Giulia. Bank first.").
- **Whatever the player picks, Davide calls his bank first** (outcome after damage control): "Davide calls Larchwick on the number on his card, with Nonna beside him. 'Done. They're trying to stop it.'" So the placed beat and the resolution are true in every branch (STORY §3.11 (7)).
- **Debrief (drill):** tell "A familiar voice, a new number, and money to someone else's account." · what works "Bank first, on the number on the card. Then the real person." Layer 2: "This works on people who care, at any age. Calling the bank fast was the right first move." (CVF §5.7) · "A 'doesn't match' warning is worth stopping for, even when the caller has an explanation ready." (R-S2) Habit card `stop-the-damage-first`.

**6-7 `rome-07-police-text`** · fraud (MSC callback, SAC) · sms → call · diff 4 · timer 45; pusher at 25 s (same thread, Italian): "Promemoria: chiami oggi per evitare il blocco della carta." ("Reminder: call today to avoid your card being blocked.") · levers authority, fear, urgency · Larchwick (named) · **Interrupt** at 15 s, Noor: "inspector!! is Rome as hot as everyone says"
- **Message (sms, sender "Police Info"):** Italian with translation: "AVVISO: la sua carta Larchwick risulta collegata a un'indagine per frode. Chiami oggi l'agente incaricato: 06 •••• ••41." ("NOTICE: your Larchwick card is linked to a fraud investigation. Call the officer in charge today: 06 •••• ••41.") `request: call`; `ask` = "Chiami oggi l'agente incaricato" (translation "Call the officer in charge today"); `phone_numbers: ["06 •••• ••41"]`; `references: ["la sua carta Larchwick"]`.
- **Checkables (4; R 2):** `sender.detail` **D** ("An official-sounding sender name. Anyone can set a sender name, so it can't prove anything either way.") · `reference` **D** ("Names your bank. A guess or a detail that's easy to find, so it can't prove anything either way.") · `phone_number` **R** ("A number given in the text. To reach the police or your bank, dial a number you looked up yourself.") · `request` **R** ("Asks you to call a number it gives you, today. That's how this call is set up for you.").
- **Actions:** "Call the number in the text" (`call_number_in_message`, engage → `officer_line`, target) · "Call the police yourself" (`call_back_known` ★★★; "'We didn't call you. Calling us yourself was exactly right.'") · "Open the Larchwick app yourself" (`verify_in_app` ★★★; "Your card is active. Nothing is pending.") · "Report the text" (report ★★) · "Delete it" (★★).
- **`officer_line` (call you placed, 30 s; not in R):** display "06 •••• ••41", detail "The number from the text". Transcript: "Inspector's office." · "A gang is using your card. Don't worry, you're not under suspicion." (`claims[0]`) · "I'm sending a request to your Larchwick app now. Tap Approve, and it freezes your card." (`ask`). **Banner** (Larchwick, no actions, §17 rule): "Larchwick: Approve sign-in to your account on a new device? Open the app to Approve or Deny." `request: approve`. Checkables: `claim` D · `request` R ("Approve a sign-in you didn't start. That lets someone into your account; it freezes nothing."). Actions: "Tap Approve as they say" (`approve_prompt`, fall) · "Hang up" → "What now?": "Call the number on your card" (verify, ★★ engage cap) · extra "Call the police yourself" (verify, ★★) · report · "Leave it there".
- **Fall:** narrative "'Card frozen. Don't use the app tonight.' Ten minutes later your Larchwick app shows a payment you didn't make." Damage control (6, 2 harmful): `call_bank_known_number` (stop: ask it to block access) · `tell_trusted_adult` (stop) · `change_password_sign_out` (secure: "from the real app; sign out devices you don't know") · `report_to_police` (report) · harmful `call_back_caller_number` · harmful `wait_and_see`.
- **Debrief L1 (≈17):** tell "A 'police' text with a number to call, then 'tap Approve'." · what works "Call the police or your bank yourself." Layer 2: "A text can set up the call: the number it gives reaches whoever sent it." · "Read what the app asks. 'Approve sign-in on a new device' never freezes anything." `already_clicked.clicked`: "Called the number? Hang up and call your bank on the number on your card." · `already_clicked.shared_code` (approve): "Tapped Approve? Call your bank now on the number on your card and ask it to block access to your account." Habit card `hang-up-call-back`.

**6-8 `rome-08-new-number-davide`** · fraud (MFI callback) · messenger → banking · diff 4 · timer 45; pusher at 20 s (same chat): "Please, it's due at six 😬" · levers helpfulness, urgency, affection · Kettle, Larchwick · cast Davide (impersonated; never his fault) · **Interrupt** at 12 s, Teo: "Café's packed today. Somebody brought cannoli 🙂"
- **Message:** Kettle, new contact (CR-19) "+39 3•• ••• ••08"; profile photo Davide's (`image`). Italian opener with translation: "Ciao! It's Davide, new number, my old phone died 🙃 Can you lend me €60? The B&B's gas bill is due today and Nonna's phone is off. I'll pay you back tonight!" Bank-details card (CR-22): "Davide Esposito · IT•• … 9134 · €60.00". `request: pay`; `ask` = "Can you lend me €60?"; `claims` = ["my old phone died", "Nonna's phone is off"].
- **Checkables (6; R 2):** `sender.detail` **R** (RM3: "Not in your contacts: a new number saying it's Davide. Davide's saved number is the one to call.") · `image` **D** ("His photo. Photos are easy to copy, so it can't prove anything either way.") · `claim` **D** (neutral excuse) · `claim#2` **D** ("Says Bruna can't be reached. It can't prove anything either way, but you can ask her yourself.") · `payee.iban` **D** (P2 neutral) · `request` **R** ("Money today, from a new number, to an account you can't check with him. Call his saved number first.").
- **Actions:** "Pay it in the Larchwick app" (`start_transfer` → `gas_transfer`; a messenger source, so no cap) · "Call Davide's saved number" (`call_back_known` ★★★; "Davide, at the library: 'New number? Same old phone. Don't send anything.'") · "Block and report the number" (`block` ★★) · "Ignore it" (★★).
- **`gas_transfer`:** payee typed from the card, "Davide Esposito"; IBAN `IT•• … 9134`; €60.00. Result **doesn't match** (no holder, CR-23). Checkables (not in R): `payee.name_check` **R** ("Doesn't match: this account isn't held by Davide Esposito.") · `payee.iban` D. Actions: "Confirm and send €60" (`pay`, fall) · "Cancel and call Davide's saved number" (`call_back_known` ★★★) · "Cancel and report it" (report ★★) · "Cancel" (`ignore` ★★).
- **Fall:** damage control (6, 2 harmful): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `tell_real_person` (warn: Davide, on his saved number) · `report_number_in_app` (report, new) · harmful `pay_second_request` · harmful `reply_ask_money_back`.
- **Debrief L1 (≈16):** tell "A new number, money today, and nobody you can call." · what works "Call his saved number first." Layer 2: "A 'doesn't match' warning means the account isn't his. Stop there." `already_clicked.paid` as 6-4. Habit card `call-the-number-you-know`.

### 26.5 Device moment: "a voice you know"
- **CR-36 voice label** (§26.9): a call shows "Sounds like Grandpa Teo" under the caller ID, with a "Voice" checkable that is **neutral everywhere** (6-2 genuine, 6-4 fraud, boss calls where set). The contrast the chapter builds: **6-2** (Teo's voice, his saved number, asks for nothing) → **6-4** (Teo's voice, a new number, money, "don't call me") → drill **6-6** (Giulia's voice, Davide paid). What differs is never the voice.
- **On-call bar (CR-31)** over 6-4's and the boss's banking beats; R16 caps apply.
- **Payee-check results used:** match on a stranger (6-4, neutral), match on Bruna (6-5, genuine), doesn't match (6-8, red flag; Davide's drill, narrated), close match (boss, neutral). The coach mark shows on first use in the game, whichever chapter that is.
- **Never shown:** how voices are copied or numbers spoofed; audio; real police insignia.

### 26.6 Boss 6-9 `rome-09-boss-investigation`
- **Setup:** "Evening. Bruna is at choir and Davide is at the library. You're on the terrace, alone. Your phone rings."
- **Levers:** authority, fear, secrecy, urgency. Pusher on beat 2 at 20 s (caller): "Are you in the app yet? We're running out of time."

**Beat 1, call (start, 40 s).** Caller ID "06 •••• ••13" (detail "Not in your contacts"). Transcript: "Police, fraud unit. Your Larchwick account is part of an investigation into staff at your bank." · "You're not under suspicion." (`claims[0]`) · "Don't call your bank. We don't know who's involved there." (`claims[1]`) · "They'll text you a code now. Read it to me and we freeze the account before it's emptied." (`ask`). **Banner** (Larchwick, no actions): "LARCHWICK: Code 7••••• to add a new device to your Larchwick app. Never share this code." `request: share_code`.
- Checkables (4; R 2): `caller_id` D (RM1) · `claim` D · `claim#2` **R** ("Tells you not to call your bank. Anyone who wants to cut you off from your bank is the one to hang up on.") · `request` **R** ("A code, read out to a caller. Read the text: it adds a new device to your bank app. Nobody needs it to freeze anything.").
- Actions (no engage on boss beats, §16 ruling 4): "Read out the code" (`share_code`, target) · "Hang up" → "What now?": "Call the number on your card" (verify; "Larchwick: 'No investigation, and we'd never ask you not to call us.' As you hang up, your phone rings: 'Larchwick Bank'.") · extra "Call the police yourself" (verify) · report · "Leave it there".

**Beat 2, call (`arrives_after: 45`, 40 s, `covered_by: [start]`).** Caller ID "Larchwick Bank" (RM1; may show the real number). Transcript: "Larchwick security. The police have briefed us about the investigation." (`claims[0]`) · "Please don't hang up; they're listening in to protect you." (`claims[1]`) · "Open your app and I'll guide you to move your savings to our protected account until it's over." (`ask`). `request: pay`.
- Checkables (4; R 2): `caller_id` D · `claim` D ("Says the police briefed them. A fake caller can say it too, so it can't prove anything either way.") · `claim#2` **R** ("Wants you to stay on the line so you can't check.") · `request` **R** ("Move your savings 'to keep them safe'. No real bank or police asks that. That request is the scam.").
- Actions: "Open the app and follow their steps" (`start_transfer` → `boss_tutela`, target; `cap: engage`, R16) · "Hang up" → "What now?": "Call the number on your card" (verify) · extra "Call the police yourself" (verify) · extra "Call back this number" (engage note as 6-3) · report · "Leave it there".
- **`boss_tutela` (banking sub-beat, CR-18(e); on-call bar; 40 s floor; beat 3 held until it closes).** Caller lines: "Type the name as I spell it: Velastri Tutela." · "It'll suggest our full company name. Accept it and confirm, quickly." Payee typed "Velastri Tutela"; IBAN `IT•• … 5512`; amount €4,120.00 (your savings). Result **close match**, holder shown (CR-23): "Vellastri Tutela Srl".
  - Checkables: `payee.name_check` D (RM6: "Close match: the account is held by Vellastri Tutela Srl, close to what the caller spelled. That only shows whose account it is. No real bank or police asks you to move money to keep it safe.") · `payee.iban` D.
  - Actions: "Use the suggested name and send €4,120" (`pay`, fall, target) · "Hang up and call the number on your card" (`call_back_known`, ★★ under R16) · "Hang up and report it" (report ★★) · "Hang up and cancel" (`ignore` ★★).

**Beat 3, sms (`arrives_after: 45`, 40 s, `covered_by: [start, bank_call]`).** Sender "Police Info" (same thread as 6-7 if the player kept it; Italian with translation): "Fascicolo 2026/••••: confermi la sua identità stasera per proteggere il conto. Acceda con i dati Larchwick: caseportal-verify.example/id" ("Case file 2026/••••: confirm your identity tonight to protect your account. Log in with your Larchwick details: …"). `request: log_in`; `ask` = "Acceda con i dati Larchwick" (translation "Log in with your Larchwick details"). Written so it reads true whatever the player did at beats 1–2. **Design combination (fraud-researcher):** a "police" link asking for your bank login combines elements SAC sources separately (a text before or after the call; card or login details); it is not a separately sourced step, and no debrief presents it as a known sequence.
- Checkables (3; R 2): `sender.detail` D · `link` **R** ("caseportal-verify.example: an address you don't know, asking for your bank login.") · `request` **R** ("Your bank login, for the 'police'. Nobody needs it but you, in your bank's own app.").
- Actions: "Log in through the link" (`enter_details`, target) · "Open the Larchwick app yourself" (verify) · "Call the number on your card" (verify) · report · delete.

**Interrupt** (`after_beat: police_text`, genuine, `on_fall: skip`): Bruna: "Home from choir 🎶 We sang badly and happily. Buonanotte!" Actions: "Reply: buonanotte!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was Bruna, home from choir.").

- **Counts:** R = 6 (b1 2, b2 2, b3 2); decoys on scheduled beats 5 (b1 caller ID, claim; b2 caller ID, claim; b3 sender), plus the sub-beat's close match and IBAN (not in R). Max 3 × 15 + 6 = **51**. Fall cap (T-2.8).
- **After a fall** (once, merged, cap 6): `call_bank_stop_payment` (stop) · `tell_trusted_adult` (stop) · `change_password_sign_out` (secure: "if you typed your login or read out a code") · `report_to_police` (report) · harmful `call_back_caller_number` · harmful `wait_and_see`. Every fall outcome sets `rome_bank_called` (story only).
- **Layer 1 (boss and stamp screen, ≈18):** tell **"'Police', then 'your bank', then a link: all wanting your keys or your money."** · what works **"Hang up. Dial a number you looked up yourself."**
- **Layer 2, per beat:** beat 1 "'Don't call your bank' is the tell: they wanted you cut off." · beat 2 "Same story, now with your bank's name on screen, and a request to move money." · sub-beat "A close match shows whose account it is. It can't make the call real." · beat 3 "A link for your bank login, sent as 'police'." Then: "Real police and real banks are fine with you hanging up and calling them yourself." `already_clicked.paid` as 6-4; `already_clicked.shared_code` "Read out a code? Call your bank now on the number on your card and ask it to block access."
- **QA:** paper-playtest the load of beats 1–2 (two calls back to back, then a banking sub-beat).

### 26.7 Strategy check (as §7.2)
**Assumptions:** CR-17/18/23/30/31(b) landed; CR-36 landed (voice checkable; without it see note). R counts scheduled beats only. Flags on `officer_line`, `owner_transfer`, `gas_transfer` and `boss_tutela` count toward spotted, not R.
- **Standard fraud:** 6-3 R 2 (19), 6-4 R 3 (21), 6-7 R 2 (19), 6-8 R 2 (19) = **78**. Decoys on scheduled beats: 6-3 2, 6-4 2, 6-7 2, 6-8 4, boss 5 = 15.
- **Genuine:** 3 × 15 = **45**. Own checkables: 6-1 2, 6-2 4, 6-5 3 = 9.
- **Boss:** R 6, max **51**.
- **Totals:** max = 78 + 45 + 51 = **174**. R = 9 + 6 = **15**: silver needs spotted ≥ **5**, gold ≥ **10**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed or verify on genuine | 78 + 45 + 51 | 174 | 100% | 15 | **Gold** |
| 2 | Ideal + calls Davide about breakfast (off-focus double check) | same | 174 | 100% | 15 | Silver |
| 3 | Curious ideal: calls the number in 6-7, then hangs up and calls the card | 174 − 5 | 169 | 97.1% | 15 | **Gold** |
| 3a | Follows the caller into the app in 6-4 and boss beat 2, then hangs up and calls (R16) | 174 − 5 − 5 | 164 | 94.3% | 15 | **Gold** |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (14+16+14+14) + 45 + (30+6) | 139 | 79.9% | 15 | Silver |
| 5 | Ideal but reports Teo's real call (6-2) | 174 − 15 − 5 | 154 | 88.5% | 15 | Silver |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 86.2% | 15 − (15 + 9) = −9 | Bronze |
| 6a | Random single tag per beat + always verify | ≈150 + small bonus | ≈153 | ≈88% | at most 7 − 3 = 4 | Bronze (silver unreachable: 7 hits at best, minus 3 genuine tags) |
| 6c | **Always tag the request** + always verify | 150 + 2 × 4 + 6 | 164 | 94.3% | 7 − 3 = 4 | Bronze |
| 6d | Request + every caller ID / sender + always verify | 150 + 4 (6-4) + 4 (6-8); 6-3, 6-7, boss void | 158 | 90.8% | 9 − 11 = −2 | Bronze |
| 6e | Request + every claim + always verify | 150 + 2 (6-7, no claim); others void | 152 | 87.4% | 11 − 10 = 1 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 86.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 31.6% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 10 + 10 + 0 | 90 | 51.7% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 51.7% | 0 | Bronze |
| 11 | **"Trust an official-looking caller"**: does what police and bank callers say, verifies texts and family | 174 − 19 + 9 (6-3 fall); boss b1 0, b2 0, b3 15, tags +4 (b3's 2 flags), DC 9: boss 28 | 141 | 81.0% | 15 − 2 − 4 = 9 | **Silver** |
| 12 | **"A familiar voice is enough"**: falls only for Teo's voice (6-4), ideal elsewhere | 174 − 21 + 9 | 162 | 93.1% | 15 − 3 = 12 | Gold (input to R15) |

Row notes:
- **6c:** every fraud request in Rome is R, so tagging only requests nets 7 correct − 3 genuine requests = **4**, one short of silver. A decoy request (as Madrid 4-8) was not needed; the margin is recorded for the balancing pass.
- **6d:** sender/caller ID is R only on the two new numbers (6-4, 6-8); decoys on 6-3, 6-7 and boss beats 1–3 (5), genuine 6-1, 6-2, 6-5 (3). Correct 7 + 2 = 9; wrong 3 + 5 + 3 = 11.
- **6e:** claims are R on 6-3, 6-4, b1, b2 (claim#2: "stay on the line", "don't call me", "don't call your bank"); decoy claims on 6-3, 6-4, 6-8 (×2), b1, b2 (6); genuine claim 6-2. Correct 7 + 4 = 11; wrong 6 + 3 + 1 = 10.
- **Without CR-36:** 6-4's `voice` decoy becomes `claims[0]` (already a decoy), so 6-4 keeps R 3 and loses one decoy (2 → 1 + the claim = 2 still, because `claim` stays D). Rows unchanged.
- **Row 11** is the chapter's point: trusting an official-looking caller loses the call scenario and two boss beats, and stays silver.
- **Row 12:** one well-recovered fall to a cloned voice still reaches gold (as Warsaw row 11). Recorded for R15 (`stamps.gold.max_falls` parked). **Balancing pass (T-3.13):** stays gold under proposed R24 (one recovered fall; §7.3).

### 26.8 Rome reveal rulings
- **RM1. Caller ID is neutral everywhere**, saved contact or official-looking number, genuine or fraud (as M2). Never "It fits" on a caller ID. **A number the player dialled from a message** (6-7 `officer_line`) is the exception in kind, not in rule: its reveal is about the number's source (it came from the text, so it reaches whoever sent it), never about what the screen shows; it may be a red flag on that basis (T-3.8 round 1, sceptic note).
- **RM2. Voice (CR-36) is neutral everywhere:** "Sounds like {name}. A voice can be copied from a short recording, so it can't prove anything either way." Never a red flag, never "It fits", and never about sound quality (CVF §3).
- **RM3. A number you don't have saved, claiming to be someone you do know, is a red flag when it asks for money** (6-4, 6-8). On a genuine "new number" without a money request it would be neutral (none in Rome).
- **RM4. "Stay on the line" and "don't call your bank / my phone" claims are red flags; reassurances ("you're not in trouble") are neutral.**
- **RM5. The Italy spoofing line** appears once, in 6-3 layer 2, word for word (§26.1). Never as protection.
- **RM6. Payee check:** match on a stranger or close match is neutral (P3) and adds "it shows whose account it is"; doesn't match is a red flag. Neither is the scenario's tell: the request is.
- **RM7. The code word is an extra.** It is never a checkable, never the tell and never the habit; every mention says "call the saved number" first.

### 26.9 Rome change request (to `frontend-engineer`)
- **CR-36 (non-blocker): voice label on calls.** `message.voice: { sounds_like: <cast id> }` (call only; the id is in the scenario's `cast` and in cast.yaml). Once answered, the call header shows "Sounds like {display name}" under the caller ID; a "Voice" checkable (`voice`, inspectable `type: voice`) follows `caller_id` in reading order. No audio element is ever rendered. Validator: a `voice` inspectable is never `red_flag: true` and never starts with "It fits" (RM2); allowed on genuine and fraud. Fallback: the first transcript line ("It's Grandpa…") as `claims[0]` with the RM2 wording; §26.7 is unchanged (row note).
- Uses CR-30 (`ask` on `reply`, `call`, `approve`, `log_in`), CR-31 and CR-31(b) (6-4, boss beat 2), CR-32 (`recovery_for: davide`, 6-6), CR-19 (6-8), CR-22 (6-8's bank-details card), CR-23 (all four results).

### 26.10 New brands, cast, content
- **Account holders (not brands; BRAND_CHECK before use):** **"J. Ashdale"** (6-4, a person's initial and surname; alternatives "J. Brenmoor", "J. Callery") and **"Vellastri Tutela Srl"** with the caller's spelling "Velastri Tutela" (boss, close match; alternative "Corvessa Tutela Srl"). Check against Italian company registers and Italian banks' trustee and custody firms.
- **Domains:** `caseportal-verify.example` (boss beat 3; scam-only; no police wording in the host). "Police Info" is a generic sender label, never a real force's name (Red Line 1).
- **Larchwick:** the "add a new device" code text (boss beat 1) and the "Approve sign-in on a new device" prompt text (6-7), both generic.
- **Cast (`content/cast.yaml`):** `bruna` "Signora Bruna Esposito", role "B&B owner, Teo's pen-pal (Rome)", known channel "Saved contact: Bruna (B&B)"; `davide` "Davide Esposito", role "Bruna's grandson, student (Rome)", known channel "Saved contact: Davide (B&B)"; `giulia` "Giulia Esposito", role "Bruna's granddaughter, studying abroad (video only)"; Teo gains a `voice` use (CR-36). All already in STORY §2.3 and the name register.
- **Recovery steps (new):** `report_number_in_app` ("Block and report the number in Kettle"). Uses Madrid's `keep_call_evidence` and `call_back_caller_number` (with M-A's feedback) from T-3.6; if Rome is written first, add them as specified in §24.10.
- **Habit cards:** `call-the-number-you-know`, `hang-up-call-back`, `ask-someone`, `stop-the-damage-first` bodies **unchanged** (as §25.9: shared cards are earned earlier). Rome's sentences live in layer 2: "A voice can be copied from a short recording. Calling the number you already have reaches the real person." (6-4, drill) and the code-word line (6-4, resolution). `hang-up-call-back` uses Teo's example only in 6-2's debrief text, not on the card.
- **Atlas page:** `atlas_cards: [call-the-number-you-know, hang-up-call-back, ask-someone, stop-the-damage-first]` (STORY §3.6).
- **"Where to report and get help" (Italy) card:** wording in `docs/patterns/ch6-rome-sources.md` ("Italy help card"), in the WHERE_TO_REPORT §3c order (scam screen: bank, report, support, young people, crisis; sensitive scenes: support first). Linked from layer 2 of every Rome debrief.
- **Chapter file:** `content/chapters/rome.yaml`: slot 6; `patterns: [spoofed-authority-call, cloned-voice-family-emergency]`; `callbacks: [multichannel-support-callback, messenger-family-impersonation]`; am `[01, 02, arc, 03]` (stop point after 03), pm `[04, 05, 06, 07, 08, 09]`; `boss: rome-09-boss-investigation`; intro and rules as §26.1; `content_note` per STORY §5.6; `scenes: { arrival: rome-arrival, turn: rome-turn, resolution: rome-resolution, placed: [{ scene: rome-giulia-safe, after: rome-06-davide-paid }] }`.

### 26.11 Open questions for the producer (Rome)
1. **Arc in the morning** (between 6-2 and 6-3). **Answered (producer): accepted.** STORY §1.4 now says a spec decides where in the chapter the arc sits.
2. **"Voice note" in Davide's If-then line.** **Answered (producer): keep it word for word.**
3. **"112" in-game.** **Answered (producer):** allowed only on the player's side (rules card "Police: 112", "Call the police yourself" labels and outcomes); never in a scam message, transcript or caller ID (those stay masked), never a `tel:` link; Italy and Sweden chapters and help cards only (amended 2026-11-19 by the Stockholm Q3 ruling: Sweden adds 114 14 and 112, §29.8 SK6). Narrow redline allowlist entry if the linter flags it.
4. **Row 12** (one cloned-voice fall reaches gold): input to R15.
5. **For fraud-researcher:** (a) 6-7's "tap Approve on a new-device sign-in" as the bank-app ask (SAC §2.4 "approve a request in your banking app"); (b) the "don't call your bank, staff are under investigation" line (SAC §3.4 isolation; EPC "ignore bank alerts"); (c) the €480, €350, €60 and €4,120 amounts (illustrative, never typical); (d) boss beat 3 (labelled a design combination).

## 27. Chapter 7 — Lisbon
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/rental-offplatform-payment.md` (ROP) and `docs/patterns/qr-sticker-parking.md` (QRP). Per-beat sources and their limits: `docs/patterns/ch7-lisbon-sources.md`. No source ids and no real platform names inline. Replaces the §18 Lisbon summary. Lisbon adds **CR-37** (§27.9).

### 27.1 Goal, shape, rules check
- **The chapter habit (H):** **"Book, message and pay inside the app you opened yourself. Pay parking in the app you installed, and read where a QR code goes."** Short form for layer 1: "Stay in the app you opened yourself." (ROP §4, QRP §4.)
- **What the chapter teaches, in order of weight:**
  1. A host who wants you to pay, chat or log in **outside** the platform is the tell, even when the message arrives inside the platform's own chat (ROP §3.1–3.2).
  2. A link "from the platform" that asks you to log in or re-enter your card goes to someone else's address. Open the app yourself (ROP §3.2, LO-05).
  3. A QR code is a link: read its destination. A sticker on a meter is a reason not to scan (QRP §3).
  4. Check before you pay: find the listing yourself in the app, and pay there (LO-11). Too cheap, "many people interested" and "can't show it" are reasons to slow down (ROP §3.3–3.4).
  5. Calibration: a real booking, a real Roostwell email and a meter's own printed code are normal and safe to use.
- **Shape:** slot 7, difficulty 3–5, boss 5. Timers 40 s (slot 7), boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus drill 7-4 (Beatriz) and the arc beat. Estimated 15–17 min including scenes.
- **New patterns (2):** `rental-offplatform-payment` (7-1 twin, 7-3, 7-6, 7-8 twin, boss), `qr-sticker-parking` (7-2, 7-5 twin, 7-7). **Callbacks:** none (the boss's login email is ROP shape C, not a callback).
- **LO focus:** LO-10 (core), LO-11 (core), LO-02 (core: link and QR destination), LO-05, LO-03, LO-06 (boss), LO-18 (drill: Beatriz asks you), LO-16, LO-17, LO-14 (arc).
- **Flavour:** Portuguese in-world text (`lang="pt-PT"`, inline translation, never a red flag) on meters, the parking slip, host messages (genuine and fake alike) and small talk. Tiled streets, room-hunting near the faculty, Mateus's family kitchen, his mum's car. Roostwell and Zonelet write in English and Portuguese in every message, real or fake.
- **Premise and intro** (CR-27, ≤ 20 s): "Lisbon: you're at Mateus's family home for two nights. From Thursday his cousins arrive, so you need your own place for the rest of the week. Beatriz, his sister, is hunting a room before her master's."
- **Rules card** (CR-27), title **"Mateus's Lisbon rules"**, two items: "Book and pay in the Roostwell app. Never by a link or a transfer someone sends." · "Pay parking in the Zonelet app, or read where the code goes before you open it." General rules, never wrong on the genuine twins (7-1 is paid in the app; 7-5's printed code opens zonelet.example; 7-8 is paid in the app; its only link opens the booking on roostwell.example, not a payment).
- **No figures on screen:** the Portugal numbers are news-sourced (ROP §1, §10). No statistics, no "rising" claims, no Lisbon-specific QR case claimed (QRP §1).

**Mix rules:**
- **Genuine** 3/8 ✓. **Truth order:** G F F · G F F G F(boss); max run 2 ✓.
- **Themes:** `rental` 4 (7-1, 7-3, 7-6, boss), `parking` 3 (7-2, 7-5, 7-7), `email` 1 (7-8). Max 50% ✓. Scored order rental, parking, rental, parking, rental, parking, email, rental: no two adjacent ✓ (drill and arc don't count).
- **Pressure parity:** genuine 2/3 (7-1 honest hold timer, 7-5 honest timer) = 66.7%; fraud 4/5 (7-2, 7-3, 7-6, boss) = 80%; gap 13.3 ✓. 7-7 (the parking slip) and 7-8 are deliberately calm.
- **Difficulty parity:** genuine at 3 (7-1), 4 (7-5), 5 (7-8); fraud at 3 (7-2), 4 (7-3, 7-6), 5 (7-7, boss) ✓ (`genuine_at_every_difficulty_used`).
- **Decoys and sender-or-link:** ≥ 2 on every fraud; sender decoys in 7-3 (an ad account named after Roostwell) and 7-6 (a host account inside Roostwell), plus boss beat 3 ✓.
- **Interrupts:** 7-3 Mateus, 7-5 Mateus, 7-6 Beatriz, 7-8 Noor, boss Leonor (the real host, in the app). 7-7 has none (calm on purpose).
- **Off-focus genuine:** none; all three genuine scenarios are in focus (checking them is free).
- **Red Line 8:** the meter and the slip are carriers of a QR code only; the lesson is the destination (QRP §7). No ATM, street trick, viewing visit or key hand-over is played.

### 27.2 Story beats (track S)
STORY §3.7, updated with this spec. No panel shows a listing, price, host, link, QR code, meter screen or parking slip. Beatriz never falls; her real room is booked through the app in every branch.
1. **Arrival** (before 7-1; 3 panels; calm). A tiled street, then Mateus's family kitchen. Mateus (laughing): "Mum's cooking, so you're staying for dinner. No arguments." Beatriz (worried): "Six weeks of room-hunting. Everything good goes in an hour." Mateus (calm): "And from Thursday the cousins invade, so you need a bed too. We'll hunt together." Cast: Mateus, Beatriz.
2. **Turn** (stop point, after 7-3; 2 panels; laughing → thinking). Beatriz (laughing): "I think I've found one! Near the faculty, with a balcony." Mateus (thinking): "Great. Let's look at it properly before anyone pays anything." (Order-safe: no other city mentioned.) The drill 7-4 follows directly.
3. **Resolution** (after the boss debrief; 2 panels + If-then; relieved). Beatriz (relieved): "Booked through the app, viewing on Saturday. I'll pay in the app, after I've seen it." (L-M1) Mateus (laughing): "And I pay parking in the app now. No stickers for me." *(Was "I type the parking address myself" in STORY v1.3; the habit is the installed app.)*
   - **If-then panel (Beatriz), word for word from STORY §3.7:** "If a host wants me to chat, pay or log in outside the app, then I stay in the app I opened myself." Extra line under it (L-M2): "Parking too: pay in the app you installed, and read where a code goes."
   - **Variant `lisbon_acted_fast`** (story-only, set by every boss fall outcome): when set, it is the **first panel of the resolution** (L-M1), before Beatriz's line, Mateus (calm): "You acted straight away, the right first step. We'll see what can still be stopped." True for each fall (a login typed, a transfer, a card); no refund promise.
- **Map invitation (Mateus):** "Come home with me. My sister's room-hunting and could use a second pair of eyes." (STORY §3.7.)
- **Panels:** 3 + 2 + 3 = 8 (+1 with the variant). No placed beat; the drill carries Beatriz's story.
- **Safety:** money theme only; no content note proposed (as R11 for Madrid). Beatriz is capable and slows down; Mateus's mum is never drawn.

### 27.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 7-1 | AM | In the Roostwell app you opened: a studio in Graça, Thu–Sun, €246. "Reserve now: pay in the app to confirm. We hold it for you for 20 minutes." | marketplace (CR-33, app Roostwell) | genuine / high (twin of 7-3, 7-6) | 3 | honest timer 40 | rental | LO-11, LO-17 |
| 7-2 | AM | A parking meter near the faculty. A sticker: "Pay by phone, no app needed. Scan here." (destination: zonelet-pay.example) | qr → browser | fraud (QRP) | 3 | timer 40 + pusher | parking | LO-02, LO-05, LO-03 |
| 7-3 | AM | A social ad, "Roostwell Deals": "Sunny studio in Alfama, €29 a night. 5 people viewing now. Book: roostwell-stays.example/…" | social → browser | fraud (ROP A) | 4 | timer 40 + pusher; interrupt | rental | LO-11, LO-02 |
| | | *Stop point + turn* | | | | | | |
| 7-4 | PM | **Drill: Beatriz's two rooms.** One in Roostwell with a viewing; one cheaper, owner abroad, deposit and ID today. "What would you check?" | messenger (quoted) | drill | 3 | — | — | LO-18, LO-11 |
| 7-5 | PM | Another meter, no sticker: the printed panel "Zonelet · Zone 2 · Scan to pay in the app" (destination zonelet.example) | qr | genuine / low (twin of 7-2, 7-7) | 4 | honest timer 40; interrupt | parking | LO-02, LO-17 |
| 7-6 | PM | **Inside Roostwell's chat**, a host on a real listing: "Roostwell's fees are high. Book through our secure partner page and save 15%, same protection: roostwell-securepay.example/…" | marketplace → browser | fraud (ROP B) | 4 | timer 40 + pusher; interrupt | rental | LO-10, LO-02 |
| *arc* | PM | Arc slot N (default: slot 7) | messenger | arc | — | — | — | LO-14 |
| 7-7 | PM | A slip under the wiper: "Unpaid parking, Zone 3, 14:22. Pay €12 within 24 hours to avoid a €60 surcharge. Scan to pay." (destination zonelet-multas.example) | letter (QR) → browser | fraud (QRP) | 5 | — (calm) | parking | LO-02, LO-03, LO-04 |
| 7-8 | PM | A **real** Roostwell email: "Your stay Thu–Sun: a city tax of €6 is due before check-in. Pay it in the Roostwell app under Trips." (one non-payment link to the booking, roostwell.example/trips/…) | email | genuine / high (twin of the boss's emails) | 5 | interrupt | email | LO-17, LO-03, LO-11 |
| 7-9 **Boss** | PM | Thursday's flat. Beat 1 (email, roostwell-bookings.example): "Payment not verified. Log in within 12 hours to keep your booking." Beat 2 (Kettle, new number, "Leonor, your host"): "Pay us directly instead" (bank-details card; payee check **doesn't match**). Beat 3 (SMS "ROOSTWELL"): "Booking cancelled at 20:00 unless your card is re-confirmed." | email → messenger (+ banking) → sms | fraud (ROP B, C) | 5 | boss timers 40 + pusher; interrupt after beat 3 | rental | LO-05, LO-10, LO-06, LO-02, LO-16 |

**Arc placement.** Between 7-6 and 7-7: not next to the drill (a friend asking for advice), and neither neighbour's debrief mentions friends, chats moving apps or money to people.

### 27.4 Scenario specs
Shared rules as §24.4. Portuguese numbers masked `+351 9•• ••• •NN`; IBANs `PT•• … NNNN`, checksum-invalid; plates masked `AA-••-12`. Every scored scheduled beat on a CR-30 device has a `request` (`qr` and `letter` beats carry none; the destination is the checkable). Reveals follow LS1–LS6 (§27.8). `tell_trusted_adult` is `stop` in every personal-money fall.

**7-1 `lisbon-01-graca-studio`** · genuine, high · marketplace (Roostwell app, CR-33; `app: { brand: roostwell }`, `notice: true`) · diff 3 · honest timer 40, `honest_deadline` "We hold it for you for 20 minutes" · Roostwell · you started it (your search)
- **Message:** Roostwell notice with listing card (`listing: { title: "Studio with a tiled kitchen, Graça · Thu–Sun", price: "€246.00" }`). "Your dates are free. Reserve now: pay in the app to confirm. We hold it for you for 20 minutes. Your payment stays with Roostwell until check-in." Host line under it (in-app, from "Leonor (host)"): "Olá! Welcome in advance 🙂" `request: pay`; `ask` = "Reserve now: pay in the app to confirm."; `claims[0]` = "Your payment stays with Roostwell until check-in".
- **Checkables (G, 4):** `sender.detail` (LS1 "It fits: a notice inside the Roostwell app you opened yourself, for dates you searched. That isn't proof on its own, so weigh it with what it asks: to pay inside the app.") · `reference` (the listing card, neutral) · `claim` (neutral: "Says the money is held until check-in. That's how a booking paid in the app works.") · `request` ("Asks you to pay inside the Roostwell app, for a stay you searched for. No link, no transfer.").
- **Actions:** "Pay in the Roostwell app" (`pay_protected`, target ★★★) · "Read the reviews in the app first" (`check_with_platform` ★★★, in focus; "Forty reviews, all in the app. You book.") · "Ask the host to take a bank transfer" (`pay_unprotected` ★, LO doc; outcome "Leonor replies in the app: 'Please pay in the app, it protects us both.' You do.") · report (0, −5) · "Leave it" (`ignore`, dismiss on genuine high, 0).
- **Debrief L1 (genuine):** tell "In the app you opened, for dates you chose, paid in the app." · what works "Paying in the app was right." Layer 2: "Remember this screen: a booking you search for and pay inside the app. Every fake this week tries to get you outside it." Fixed layer-2 sentence on the `pay_unprotected` choice (L-S1): "Asking for a bank transfer gives up the app's protection, even with a real host. Leonor kept you in the app." Habit card `check-before-you-pay` (new, §27.10).

**7-2 `lisbon-02-meter-sticker`** · fraud (QRP core) · qr → browser · diff 3 · timer 40; pusher at 20 s (Beatriz, genuine sender): "Viewing in 5 min! 🙈" · levers convenience, urgency · Zonelet (claimed), look-alike `zonelet-pay.example`
- **Setup:** "You've parked Mateus's mum's car by the faculty for Beatriz's viewing. The meter's screen is off; there's a code to pay by phone."
- **Message (`qr` device):** meter panel text "Zonelet · ZONA 3 · €1.60/h" (Portuguese with translation) and, on top of the printed code, a sticker (`qr.mount: sticker`, CR-37): "Pague pelo telemóvel, sem app. Digitalize aqui." ("Pay by phone, no app needed. Scan here."). `qr: { payload: /qr/lisbon-meter-sticker, destination: zonelet-pay.example }`; `references: ["ZONA 3 · €1.60/h"]`; `claims[0]` = "sem app" text. `request: scan_qr`.
- **Checkables (4; R 2):** `qr.destination` **R** (LS2: "zonelet-pay.example. Read the end: the owner part is zonelet-pay.example, not zonelet.example, where the parking app lives.") · `qr.mount` **R** (CR-37: "A sticker stuck over the meter's printed code. A sticker is a reason not to scan; open the parking app yourself.") · `claim` **D** ("'No app needed.' Real meters also let you pay by phone, so it can't prove anything either way.") · `reference` **D** ("The zone and price match the meter. A sticker can copy them, so they can't prove anything either way.").
- **Actions:** "Scan and pay" (`scan_qr_and_open` → `meter_page`, target) · "Open the Zonelet app yourself" (`verify_in_app` ★★★; "Zone 3, €1.60. Paid in the app, done.") · "Report the sticker" (report ★★; "You photograph it and report it in the Zonelet app.") · "Leave it" (`ignore` ★★).
- **`meter_page` (training page, label "Zonelet · Pay parking"):** address `zonelet-pay.example/zona3`; "Pay €1.60", fields as the engine's `enter_details` training page (TrainingForm; read-only, nothing sent). Checkables: `page.address` R · `page.info` D (padlock). Actions: "Pay €1.60 with your card" (`enter_details`, fall) · "Close it and open the Zonelet app" (`verify_in_app`, ★★ engage cap) · "Close the page" (`ignore` ★★).
- **Fall** narrative: "'Payment received.' That evening your Larchwick app shows €286.00 at an online shop." Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop) · `keep_evidence` (secure: "a photo of the sticker and the meter, the address, the time") · `report_sticker` (report, new) · harmful `wait_and_see` · harmful `rescan_to_cancel` (new).
- **Debrief L1 (≈17):** tell "A sticker over the meter's code, opening a look-alike address." · what works "Pay in the parking app you installed." Layer 2: "A QR code is a link: read the address it shows before you open it." · `already_clicked.entered_details`: "Typed your card? Block it in your banking app now and call your bank on the number on your card." Habit card `read-the-link`.

**7-3 `lisbon-03-alfama-ad`** · fraud (ROP A) · social → browser · diff 4 · timer 40; pusher at 22 s (ad comment from the same account): "Only 1 date left!" · levers greed (bargain), scarcity, urgency · Roostwell (claimed), look-alike `roostwell-stays.example` · **Interrupt** at 14 s, Mateus: "Mum asks: do you eat octopus? Be honest."
- **Message (social, sponsored post):** account "Roostwell Deals" (detail "Sponsored · page created 3 weeks ago"); `image` (a bright studio photo). "Sunny studio in Alfama, €29 a night 🌞 5 people viewing now. Book: roostwell-stays.example/alfama-studio" `request: open_link`; `ask` = "Book: roostwell-stays.example/alfama-studio"; `claims[0]` = "€29 a night 🌞 5 people viewing now".
- **Checkables (5; R 2):** `sender.detail` **D** ("A page named after Roostwell. Anyone can name a page or ad like that, so it can't prove anything either way.") · `image` **D** (LS4: "Lovely photos. Photos are easy to copy from a real home, so they can't prove anything either way.") · `claim` **R** ("Far below the usual price, and '5 people viewing now'. Too cheap plus a rush is a reason to slow down.") · `link` **R** ("roostwell-stays.example. Read the end: the owner part is roostwell-stays.example, not roostwell.example.") · `request` **D** ("Asks you to book. Ads do that, so it can't prove anything either way. Where the link goes matters.").
- **Actions:** "Open the booking page" (`open_link` → `stays_page`, target) · "Search for it in the Roostwell app yourself" (`check_with_platform` ★★★; "No studio like it in Alfama at €29. Similar ones: €85–€110 a night.") · "Report the ad" (report ★★) · "Scroll past" (`ignore` ★★).
- **`stays_page` (training page, look-alike listing):** address `roostwell-stays.example/alfama-studio`; "Hold it with a €90 deposit", fields as the engine's `enter_details` training page (TrainingForm; read-only, nothing sent). Checkables: `page.address` R · `page.info` D. Actions: "Pay the €90 deposit" (`enter_details`, fall) · "Close it and search in the app" (`check_with_platform`, ★★) · "Close the page" (★★).
- **Fall:** damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop; "ask about a chargeback; deadlines apply", ROP §5.1) · `keep_evidence` (secure) · `report_listing_or_host` (report, new) · harmful `wait_and_see` · harmful `pay_second_deposit` (new).
- **Debrief L1 (≈17):** tell "Too cheap, in a rush, on a look-alike address." · what works "Find it in the Roostwell app yourself." Layer 2: "Great photos prove nothing; they can be copied from a real home." · "Check before you pay: if you can't find it in the app, don't pay for it." Habit card `check-before-you-pay`.

**7-4 `lisbon-04-beatriz-two-rooms`** (drill, unscored) · messenger with a quoted message · cast Beatriz · `pattern: rental-offplatform-payment`
- **Message:** Beatriz's saved contact "Beatriz (Lisbon)": "Two rooms!! A: in Roostwell, €420, balcony, viewing Saturday, pay in the app after. B: €290, right by the faculty, owner's abroad so no viewing. B's a steal, right?? What would you check?" Quoted (`context: quoted`), B's owner: "Many students are interested. Send a €300 deposit and a copy of your ID today and the room is yours."
- **Quoted checkables:** `claim` **R** ("many students, today") · `request` **R** ("a deposit and your ID before you've seen it"). Drill tags never count.
- **Picks** (each gets a Beatriz reply; no stars):
  - "Go with A: book and pay in the app." (`proceed`) → "A it is. Viewing Saturday. B can stay a steal for someone else."
  - "Ask to see B first, or have someone see it for you." (`proceed`) → "Asked. 'Not possible, I'm abroad.' Hmm. That's my answer, then."
  - "Check whether B's photos are in other listings." (`proceed`) → "Same photos, another city, another name. Wow. A it is."
  - "Pay B's deposit before someone else does." (`reply`) → "Hmm. Mateus says not before I've seen it. I'll wait for A on Saturday." (Gentle; Beatriz decides well anyway.)
- **Debrief (drill):** tell "Too cheap, can't be seen, deposit and ID today." · what works "See it first, and pay inside the platform." Layer 2: "Check whether the same photos appear elsewhere. And never send a copy of your ID before anything is signed." (ROP §3.5, §3.8) Habit card `check-before-you-pay`.

**7-5 `lisbon-05-printed-meter`** · genuine, low · qr · diff 4 · honest timer 40, `honest_deadline` "Maximum stay 2 hours" · `pattern: qr-sticker-parking` (in-focus twin of 7-2 and 7-7) · Zonelet · **Interrupt** at 15 s, Mateus: "Beatriz booked her viewing in the app. Saturday! 🙂"
- **Setup:** "Next morning, another street, another meter. Its screen is on."
- **Message (`qr` device):** printed panel only (`qr.mount: printed`): "Zonelet · ZONA 2 · €1.20/h · Digitalize para pagar na app." ("Scan to pay in the app."). `qr: { payload: /qr/lisbon-meter-printed, destination: zonelet.example }`; `references: ["ZONA 2 · €1.20/h"]`. `request: scan_qr`.
- **Checkables (G, 3):** `qr.destination` (LS2 "It fits: zonelet.example, the parking app's own address. That isn't proof on its own, so weigh it with what it asks: to pay in the app.") · `qr.mount` (neutral: "Printed on the meter's panel. A sticker can be printed to look the same, so it can't prove anything either way. Check where it goes.") · `reference` (neutral).
- **Actions:** "Scan and open zonelet.example" (`proceed`, target ★★★; "It opens the Zonelet app at Zone 2. You pay €1.20 there.") · "Open the Zonelet app yourself" (`verify_in_app` ★★★, in focus) · "Report the meter's code" (report, 0, −5) · "Leave it, risk a notice" (`ignore`, low ★★).
- **Debrief L1 (genuine):** tell "This code opens Zonelet's own address." · what works "Scanning was fine; so was the app." Layer 2: "Same street furniture as yesterday. The difference is the address: zonelet.example, Zonelet's own. A sticker is a reason to look closer, but the address decides." *(Round 2 of T-3.9, learning-psychologist: the address decides; "no sticker" and "printed" are never the reason.)* Habit card `calm-not-paranoid`.

**7-6 `lisbon-06-host-partner-page`** · fraud (ROP B, in-platform chat) · marketplace (Roostwell chat, CR-33) → browser · diff 4 · timer 40; pusher at 22 s (same chat): "Another guest is asking 🙂" · levers greed (save 15%), scarcity, helpfulness · Roostwell, look-alike `roostwell-securepay.example` · **Interrupt** at 12 s, Beatriz: "Mum's asking if you've found a place yet 😅"
- **Message:** in-app chat from host handle "casa.velarim" on a real-looking listing card (`listing: { title: "Two-room flat, Alfama · Thu–Sun", price: "€310.00" }`). Portuguese opener with translation: "Olá! It's free Thursday. Roostwell's fees are high: book through our secure partner page and save 15%, same protection. roostwell-securepay.example/casa-velarim" `request: open_link`; `ask` = "book through our secure partner page and save 15%"; `claims[0]` = "Roostwell's fees are high".
- **Checkables (5; R 2):** `sender.detail` **D** (LS1: "A host's account inside Roostwell's chat, as a real host's would be. Anyone can open an account, so it can't prove anything either way.") · `reference` **D** (the listing card) · `claim` **D** ("Fees are a real cost, so it can't prove anything either way.") · `link` **R** ("roostwell-securepay.example: not roostwell.example. A 'partner page' is outside the app.") · `request` **R** ("Asks you to book and pay outside Roostwell. Inside the app is where you're protected; a host asking you to leave it is the tell.").
- **Actions:** "Open the partner page" (`open_link` → `securepay_page`, target) · "Check the listing in the Roostwell app" (`check_with_platform` ★★★; "Roostwell's Help: 'Pay only in the app. Report hosts who ask otherwise.' You report the message.") · "Report the host in Roostwell" (report ★★) · "Ignore it" (★★).
- **`securepay_page` (training page "Roostwell Secure Pay"):** address `roostwell-securepay.example/casa-velarim`; "€263.50", fields as the engine's `enter_details` training page (TrainingForm; read-only, nothing sent). Checkables `page.address` R, `page.info` D. Actions: "Pay €263.50" (`enter_details`, fall) · "Close it and book in the app" (`check_with_platform` ★★) · "Close the page" (★★).
- **Fall:** damage control as 7-3, with `report_listing_or_host` naming the host.
- **Debrief L1 (≈17):** tell "Inside Roostwell, but asked to pay outside it." · what works "Book and pay only in the app." Layer 2: "Being in the app helps, but it isn't proof. What the host asks for is." Habit card `stay-on-the-platform` (from Warsaw's spec; first showing here if Lisbon comes first).

**7-7 `lisbon-07-parking-slip`** · fraud (QRP, fake fine) · letter (QR carrier, Red Line 8) → browser · diff 5 · **no timer** (calm) · levers fear (surcharge), authority · Zonelet (claimed), look-alike `zonelet-multas.example`
- **Setup:** "Back at the car after lunch: a slip under the wiper."
- **Message (`letter`):** letterhead "Zonelet · Aviso de estacionamento" (styled text). Portuguese with translation: "Zona 3 · AA-••-12 · 14:22. Estacionamento não pago. Pague €12,00 em 24 horas para evitar uma sobretaxa de €60. Digitalize para pagar." ("Zone 3 · AA-••-12 · 14:22. Unpaid parking. Pay €12.00 within 24 hours to avoid a €60 surcharge. Scan to pay."). `qr: { payload: /qr/lisbon-parking-slip, destination: zonelet-multas.example }`; `references: ["Zona 3 · AA-••-12 · 14:22"]`; `claims[0]` = "para evitar uma sobretaxa de €60". (`qr.mount: printed`; a slip is printed.)
- **Checkables (5; R 1; difficulty 5: real plate, zone and time mixed in):** `letterhead` **D** ("Zonelet's name in print. Easy to copy, so it can't prove anything either way.") · `reference` **D** (LS5: "Your car's plate, the zone and a time: real details anyone passing could read, so they can't prove anything either way.") · `claim` **D** ("A surcharge if you wait. Real notices have deadlines too, so it can't prove anything either way.") · `qr.mount` D (printed, neutral) · `qr.destination` **R** ("zonelet-multas.example. Read the end: not zonelet.example. Check it yourself in the Zonelet app or on its site you open yourself, never through the slip's code.").
- **Actions:** "Scan and pay the €12" (`scan_qr_and_open` → `slip_page`, target) · "Check for a notice in the Zonelet app" (`verify_in_app` ★★★; "No notice. Your session ran until 14:40.") · "Report the slip" (report ★★; "You photograph it and report it in the Zonelet app.") · "Bin it" (`ignore` ★★).
- **`slip_page` (training page):** address `zonelet-multas.example/aviso`; "Pay €12.00", fields as the engine's `enter_details` training page (TrainingForm; read-only, nothing sent). Checkables `page.address` R, `page.info` D. Actions: "Pay the €12" (`enter_details`, fall) · "Close it and check the Zonelet app" (`verify_in_app`, ★★) · "Close the page" (★★).
- **Fall:** damage control as 7-2.
- **Debrief L1 (≈16):** tell "Real plate, real zone, but the code goes to a look-alike address." · what works "Check it yourself in the Zonelet app or on its site you open yourself, never through the slip's code." Layer 2: "Real details on a slip prove nothing: anyone walking past can read a plate. Where the code goes is the tell." Habit card `read-the-link`.

**7-8 `lisbon-08-city-tax-email`** · genuine, high · email · diff 5 · calm (no timer) · `pattern: rental-offplatform-payment` (in-focus twin of boss beats 1 and 3) · Roostwell · you started it (your booking) · **Interrupt** at 15 s, Noor: "inspector, pastel de nata report please. for science"
- **Message (email):** from "Roostwell" <trips@roostwell.example>, subject "Your stay Thu–Sun: before check-in". "Hi Sam, your stay at the Graça studio starts Thursday. A city tax of €6.00 is due before check-in. Pay it in the Roostwell app under Trips. Your booking: roostwell.example/trips/4471. See you soon!" (nickname from the save). `request: pay`; `ask` = "Pay it in the Roostwell app under Trips."; `references: ["your stay at the Graça studio starts Thursday"]`. Option (a), review round 1: the email carries **no payment link**; its one link is the booking page (non-payment). The tax stays generic: no per-night rate and nothing about how the city collects it (item 15).
- **Checkables (G, 4):** `sender.detail` (LS3 "It fits: trips@roostwell.example, Roostwell's own address. That isn't proof on its own, so weigh it with what it asks: a small tax, paid in the app.") · `link` (LS3 "It fits: roostwell.example, the owner part is Roostwell's own, and it opens your booking, not a payment.") · `reference` ("It fits: your booking, the studio and dates you chose. That isn't proof on its own.") · `request` ("Pay €6 inside the Roostwell app. No payment link, no login link, no transfer, no card form in the email.").
- **Actions:** "Open the Roostwell app and pay there" (`pay_protected`, target ★★★) · "Check the booking in the Roostwell app first" (`verify_in_app` ★★★; "Trips: €6 city tax due. You pay it there.") · "Report the email" (report, 0, −5) · "Leave it" (`ignore`, dismiss on genuine high, 0; "At check-in the app reminds you once; you pay there.").
- **Debrief L1 (genuine):** tell "Roostwell's own address, about a booking you made." · what works "Paying in the app was right." Layer 2: "The boss's emails will look like this. The difference is the address after the @ and in the link." *(Layer 2 must not name the boss's domain; the habit card example rule.)* Habit card `calm-not-paranoid`.

### 27.5 Device moments
- **The QR destination (CR-37).** On `qr` and `letter` beats the destination is shown as text before anything opens (§5), and CR-37 adds how the code is attached: a sticker over the printed panel (7-2) or the meter's own print (7-5, 7-7). The contrast: **7-2** (sticker, look-alike) → **7-5** (printed, real address) → **7-7** (printed slip, real details, look-alike address). The address is the tell every time; a sticker is a supporting clue, and "printed" is never proof.
- **Roostwell in the app vs. outside it (CR-33).** **7-1** (a booking you search and pay in the app) → **7-3** (an ad outside the app) → **7-6** (inside the app's chat, asked to leave it) → **boss** (email, Kettle, SMS: three ways out of the app). Being in the app is evidence to weigh, never proof (LS1).
- **Training pages:** every look-alike page is read-only, watermarked, labelled "Training page", no network (Red Line 2). No Roostwell or Zonelet sign-in clone beyond boss beat 1's login page, which is generic (no real platform's look).

### 27.6 Boss 7-9 `lisbon-09-boss-thursday-flat`
- **Setup:** "Wednesday evening. Your Graça studio is booked and paid in the app. Beatriz is at the faculty; Mateus is cooking."
- **Levers:** fear of losing the booking, urgency, authority (the platform's name). Pusher on beat 2 at 20 s (same number): "Please today, I have other guests asking 🙏"
- **Real details mixed in (difficulty 5):** every beat knows the studio and dates (LS5).

**Beat 1, email (start, 40 s).** From "Roostwell" <support@roostwell-bookings.example>, subject "Action needed: your booking Thu–Sun". "Hi, your payment for the Graça studio (Thu–Sun) could not be verified. Log in within 12 hours to keep your booking: roostwell-bookings.example/login" `request: log_in`; `ask` = "Log in within 12 hours to keep your booking"; `references: ["the Graça studio (Thu–Sun)"]`; `claims[0]` = "your payment … could not be verified".
- Checkables (5; R 3): `sender.detail` **R** ("support@roostwell-bookings.example: the owner part isn't roostwell.example.") · `reference` **D** (LS5: "Your real booking. Details like these can leak or be guessed, so they can't prove anything either way.") · `claim` **D** ("Payments do fail sometimes, so it can't prove anything either way. Your app would show it.") · `link` **R** ("roostwell-bookings.example, a look-alike.") · `request` **R** ("Log in through a link in an email. Open the app yourself instead.").
- Actions: "Log in through the link" (`enter_details`, target) · "Open the Roostwell app yourself" (`verify_in_app` ★★★; "Booking confirmed, paid. Nothing to do.") · report · delete.

**Beat 2, Kettle (`arrives_after: 45`, 40 s, `covered_by: [start]`).** New contact (CR-19) "+351 9•• ••• •27", display "Leonor (host) 🙂". "Olá! It's Leonor, your host for Thursday. Roostwell had a problem with your payment. To keep the flat, please send the €246 to us directly; details below." Bank-details card (CR-22): "Leonor Brito · PT•• … 3390 · €246.00". `request: pay`; `ask` = "please send the €246 to us directly"; `claims[0]` = "Roostwell had a problem with your payment."
- Checkables (4; R 2): `sender.detail` **R** ("Not in your contacts, and not in the Roostwell chat where your real host writes.") · `claim` **D** (as beat 1's claim) · `payee.iban` **D** · `request` **R** ("Pay the host directly, outside the app. A booking paid in the app never needs paying again by transfer.").
- Actions: "Pay it in the Larchwick app" (`start_transfer` → `host_transfer`, target; messenger source, no cap) · "Check your booking in the Roostwell app" (`check_with_platform` ★★★; "Paid and confirmed. Leonor's last message in the app: 'See you Thursday!'") · "Block and report the number" (block ★★) · "Ignore it" (★★).
- **`host_transfer` (banking sub-beat, CR-18(e); 40 s floor; beat 3 held):** payee typed from the card, "Leonor Brito"; IBAN `PT•• … 3390`; €246.00. Result **doesn't match** (no holder). Checkables: `payee.name_check` **R** ("Doesn't match: this account isn't held by Leonor Brito.") · `payee.iban` D. Actions: "Confirm and send €246" (`pay`, fall, target) · "Cancel and check the Roostwell app" (`check_with_platform` ★★★) · "Cancel and report it" (report ★★) · "Cancel" (`ignore` ★★).

**Beat 3, SMS (`arrives_after: 45`, 40 s, `covered_by: [start, host_kettle]`).** Sender "ROOSTWELL" (in a thread with no earlier texts). "ROOSTWELL: Final notice. Booking 4471 is cancelled at 20:00 unless your card is re-confirmed: roostwell-bookings.example/card" `request: enter_details`; `ask` = "unless your card is re-confirmed"; `references: ["Booking 4471"]`. Written so it reads true whatever the player did at beats 1–2. **Design combination (fraud-researcher):** an SMS asking to re-confirm a card after a login email combines ROP shapes B and C (and the "extra payment" variant, NL news only); it is not a separately sourced sequence, and no debrief presents it as one.
- Checkables (4; R 2): `sender.detail` **D** ("ROOSTWELL as the sender name. Anyone can set a sender name, so it can't prove anything either way.") · `reference` **D** (LS5) · `link` **R** (as beat 1) · `request` **R** ("Your card details through a link, to 'keep' a booking that's already paid.").
- Actions: "Re-confirm your card through the link" (`enter_details`, target) · "Open the Roostwell app yourself" (`verify_in_app` ★★★) · report · delete.

**Interrupt** (`after_beat: final_sms`, genuine, `on_fall: show` per producer ruling **R20**, which overrides the earlier `skip`; marketplace, Roostwell app, the real host chat): Leonor: "Olá! See you Thursday 🙂 The key-box code comes here in the app on the day." Actions: "Reply: obrigado, see you!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was your host, in the app.").

- **Counts:** R = 3 + 2 + 2 = **7**; decoys on scheduled beats 2 + 2 + 2 = 6, plus the sub-beat's no-match and IBAN (not in R). Max **51**. Fall cap (T-2.8).
- **After a fall** (merged, cap 6): `change_password` (stop: "in the real Roostwell app, if you typed your login"; secure order per first pick) · `block_card_in_bank_app` (stop: card typed) · `call_bank_known_number` (stop: transfer sent; "ask it to try to stop or recall it") · `report_listing_or_host` (report) · harmful `keep_chatting_host` (new) · harmful `pay_second_deposit`. `turn_on_two_step` is named in layer 2 ("then turn on two-step in the real app"). Every fall outcome sets `lisbon_acted_fast` (story only).
- **Layer 1 (boss and stamp screen, ≈18):** tell **"An email, a 'host', a text: three ways to get you outside the app."** · what works **"Open the Roostwell app yourself. It's all there."**
- **Layer 2, per beat:** beat 1 "A login link with your real booking in it. The address after the @ gave it away." · beat 2 "A new number, and a transfer for a stay already paid. The name didn't match." · beat 3 "Your card, to 'keep' a booking. Paid is paid, in the app." `already_clicked`: `entered_details` "Typed your login? Change the password in the real Roostwell app and turn on two-step. Typed your card? Block it in your banking app now." · `paid` "Sent a transfer? Call your bank now on the number on your card and ask it to try to stop or recall it."

### 27.7 Strategy check (as §7.2)
**Assumptions:** CR-17/18/22/23/30/33 and CR-37 landed. R counts scheduled beats only. Flags on `meter_page`, `stays_page`, `securepay_page`, `slip_page` and `host_transfer` count toward spotted, not R.
- **Standard fraud:** 7-2 R 2 (19), 7-3 R 2 (19), 7-6 R 2 (19), 7-7 R 1 (17) = **74**. Decoys on scheduled beats: 7-2 2, 7-3 3, 7-6 3, 7-7 4, boss 6 = 18.
- **Genuine:** 45. Own checkables: 7-1 4, 7-5 3, 7-8 4 = 11.
- **Boss:** R 7, max 51.
- **Totals:** max = 74 + 45 + 51 = **170**. R = 7 + 7 = **14**: silver ≥ **5**, gold ≥ **10**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal | 74 + 45 + 51 | 170 | 100% | 14 | **Gold** |
| 2 | Ideal but asks the real host of 7-1 for a bank transfer (`pay_unprotected` ★; Leonor keeps the payment in the app, L-S1) | 170 − 10 | 160 | 94.1% | 14 | Gold |
| 3 | Curious ideal: opens 7-6's partner page, then closes it and checks the app | 170 − 5 | 165 | 97.1% | 14 | **Gold** |
| 4 | Careful reporter | (14+14+14+12) + 45 + (30+6) | 135 | 79.4% | 14 | Silver |
| 5 | Ideal but reports the real meter code (7-5) | 170 − 15 − 5 | 150 | 88.2% | 14 | Silver |
| 6 | Tag everything + always verify | 60 + 45 + 45 | 150 | 88.2% | 14 − (18 + 11) = −15 | Bronze |
| 6a | Random single tag + always verify | ≈150 + small bonus | ≈153 | ≈90% | at most 7 − 3 = 4 | Bronze (silver unreachable) |
| 6b | **Always tag the link / QR destination** + always verify | 150 + 2 × 4 (7-2, 7-3, 7-6, 7-7) + 4 (b1, b3) | 162 | 95.3% | 6 − 2 = 4 | Bronze |
| 6c | Always tag the request + always verify | 150 + 2 (7-6) + 6 (boss); 7-3 void | 158 | 92.9% | 4 − 3 = 1 | Bronze |
| 6d | Link/destination + sender + always verify | 150 + 2 (7-2) + 2 (7-7); 7-3, 7-6, boss void | 154 | 90.6% | 8 − 7 = 1 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 88.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.4% | 0 | Bronze + tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 + 10 + 0 | 80 | 47.1% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 52.9% | 0 | Bronze |
| 11 | **"Inside Roostwell is safe"**: falls for 7-6 (in-app host), ideal elsewhere | 170 − 19 + 9 | 160 | 94.1% | 14 − 2 = 12 | Gold (input to R15) |
| 12 | **"Scan what's on the meter"**: falls for 7-2 and 7-7, ideal elsewhere | 170 − 19 − 17 + 18 | 152 | 89.4% | 14 − 3 = 11 | Silver (rating) |

Row notes:
- **6b:** destinations and links are R on 7-2, 7-3, 7-6, 7-7, b1, b3 (6); genuine 7-5's destination and 7-8's link are wrong tags (2). Net **4**, one short of silver: the two genuine QR/link twins carry the calibration. Recorded for the balancing pass. **Re-run after review round 1 (7-8 option (a)):** 7-8 keeps one link (the booking page, non-payment), so its own checkables stay 4 and the wrong-tag count stays 2; every row of the table is unchanged (all rows re-checked).
- **6c:** the request is R on 7-6 and b1–b3, a decoy on 7-3 (the ad), and a genuine detail on 7-1 and 7-8 (7-5 has no request: a `qr` beat). `qr` and `letter` beats carry no `request` (not CR-30 devices), so 7-2 and 7-7 add nothing.
- **6d:** sender decoys on 7-3, 7-6 and b3, R on b1 and b2; genuine senders 7-1, 7-8.
- **CR-37 fallback (past; CR-37 merged, T-3.9f):** before CR-37, 7-2 had no `qr.mount` (R 1, max 17), so the chapter was R 13 / max 168 and row 12 (152 of 168, 90.5%) rounded up to gold. With CR-37 merged, 7-2 carries the `qr.mount` red flag and the sticker text no longer names the sticker; the built content matches this table: R 14, max 170, row 12 **silver** at 152 of 170, rows 1, 2, 6b, 7, 11 and 12 pinned in `tests/unit/engine/lisbon-content.test.ts`. Row 6b is unchanged (it never tags `qr.mount`: net 4, still one short of silver 5).
- **Row 2:** asking a genuine host for a transfer costs two stars on that scenario but not the stamp; the debrief carries the lesson (LO-11) with the fixed L-S1 sentence. Producer accepted the ★ (§27.11 Q3); revisit at balancing with R15.
- **Row 11:** one in-app fall still reaches gold (as Warsaw row 11), an input to R15. **Balancing pass (T-3.13):** stays gold under proposed R24 (one recovered fall). Row 2 (★ for a genuine host transfer) is not a fall and keeps gold; the L-S1 sentence carries the lesson (§7.3).

### 27.8 Lisbon reveal rulings
- **LS1. Roostwell senders.** A Roostwell **notice inside the app the player opened** (7-1) may say "It fits". A **host's account inside the chat** (7-6) is neutral: anyone can open one. The real host Leonor in the app (boss interrupt) is genuine, unscored.
- **LS2. QR destinations.** A destination whose owner part is zonelet.example may say "It fits" (7-5); a look-alike is a red flag (7-2, 7-7). `qr.mount: sticker` is a red flag (supporting); `printed` is always neutral, never "It fits".
- **LS3. Roostwell's own domain** in an email (7-8) may say "It fits" on the sender and the link (matching owner part). A look-alike (`roostwell-bookings.example`, `roostwell-stays.example`, `roostwell-securepay.example`) is a red flag.
- **LS4. Photos are neutral decoys** ("easy to copy from a real home").
- **LS5. Real booking details, plates, zones and times** in a fake message are neutral decoys (difficulty 5).
- **LS6. No figures and no country claims:** no numbers of cases, no "Lisbon has this problem", no claim that a sticker was found in a specific city.

### 27.9 Lisbon change request (to `frontend-engineer`)
- **CR-37 (non-blocker): how a QR code is attached.** `qr.mount: printed | sticker` (on `qr` and `letter` beats; default `printed`). The QR device draws a sticker edge over the printed panel for `sticker`; a checkable `qr.mount` ("How the code is attached", inspectable `type: qr_mount`) follows `qr.destination` in reading order on every QR beat (genuine and fraud alike, for parity). Text alternative (A6): "Sticker stuck over the meter's printed code" / "Printed on the meter's panel". Validator: `qr.mount` is never "It fits" (LS2) and may be `red_flag: true` only when `sticker`. Merged (CR-36…39); 7-2, 7-5 and 7-7 set `qr.mount`, and the interim fallback (sticker in the body text) was removed in T-3.9f (§27.7 note).
- Uses CR-30 (`ask` on `pay`, `open_link`, `log_in`, `enter_details`), CR-33 (Roostwell `marketplace` app, listing cards, notices, in-app chat and the boss interrupt), CR-19 and CR-22 (boss beat 2), CR-23 (no match), CR-18(e) (boss sub-beat). No R16 cap in Lisbon: no `start_transfer` comes from a call.

### 27.10 New brands, cast, content
- **Roostwell** (new; rental platform: holiday lets and rooms; app and site; genuine): domain `roostwell.example` (paths `/trips/<id>`, `/trips/<id>/tax`, `/help`). Look-alikes (scam-only): `roostwell-stays.example` (7-3), `roostwell-securepay.example` (7-6), `roostwell-bookings.example` (boss). Its own palette and mark, never a real platform's colours, logo shape or listing layout (Red Line 1). Alternatives "Tilestay", "Hearthlane". BRAND_CHECK (fraud-researcher) against the major holiday-let, hotel and student-room platforms and Portuguese property and classifieds sites (list kept in BRAND_CHECK.md, not here).
- **Zonelet** (new; the city's official parking app and operator, fictional; genuine): domain `zonelet.example`. Look-alikes (scam-only): `zonelet-pay.example` (7-2), `zonelet-multas.example` (7-7; *multas* = fines). Meter panels show only the Zonelet name, a zone and a price: no real municipal colours, meter shape or parking signage. Renamed from Kerbello in review round 1 (see BRAND_CHECK RL2); spare name "Lanefare". BRAND_CHECK against parking apps and municipal parking operators in Portugal and Europe.
- **Art notes (ux-artist):** meters and the slip are device UI, not story art; the sticker must look like a sticker without copying any real sticker found in the sources. Roostwell's listing card must not echo any real platform's card layout.
- **Cast (`content/cast.yaml`):** `beatriz` "Beatriz Ferreira", role "Mateus's sister, room-hunting (Lisbon)", known channel "Saved contact: Beatriz (Lisbon)". Mateus as recurring. **Contact-only proposal:** **Leonor**, the genuine host of the Graça studio, shown as "Leonor (host)" inside the Roostwell app (7-1, boss interrupt); her name is borrowed by the boss's Kettle number ("never her fault"). Never drawn, never in a scene. Mateus's mum is mentioned, never drawn or named.
- **Scam-side names (name register):** "casa.velarim" (host handle), "Roostwell Deals" (ad page), "Leonor Brito" as the typed payee in boss beat 2 (borrowed name; the real Leonor has no surname on screen).
- **Recovery steps (new):** `report_sticker` ("Photograph the sticker or slip and report it in the parking app or to the city"; common sense, no PT source, QRP §5.4) · `report_listing_or_host` ("Report the listing or host on the platform") · harmful `rescan_to_cancel` ("Scan the code again to cancel the payment"; feedback "It feels like undoing it, but the code leads to the same page. Block the card in your banking app first.") · harmful `pay_second_deposit` ("Pay the 'refundable' second deposit they ask for"; feedback "Wanting your money back is natural, but a second payment only adds to the loss. Call your bank instead.") · harmful `keep_chatting_host` ("Keep chatting to the 'host' on Kettle to sort it out"; feedback "They're the ones who'll never sort it out. Report them in the app and call your bank.").
- **Habit cards:**
  - **New `check-before-you-pay` (LO-11).** Title "Check before you pay". Habit: "Before you pay for a stay, a room or an offer, find it yourself in the platform's app or site, and pay there, where you're protected. Too cheap, 'many people interested' or 'can't show it' are reasons to slow down." Example (first shown on 7-1, a genuine debrief, so no scam domain): "A great flat in an ad? Search for it in the Roostwell app yourself. If you can't find it there, don't pay for it." Already clicked: "Paid outside the app? Call your bank now on the number on your card; for a card payment, ask about a chargeback. Report the listing in the app."
  - `stay-on-the-platform` (Warsaw §25.9): unchanged; if Lisbon is merged first, the card is added with Warsaw's wording.
  - `read-the-link`: body unchanged (shared). The QR sentence, "A QR code is a link: read the address it shows before you open it.", appears in layer 2 of 7-2, 7-5 and 7-7 only (as §25.9).
- **Atlas page:** `atlas_cards: [stay-on-the-platform, check-before-you-pay, read-the-link]` (STORY §3.7).
- **"Where to report and get help" (Portugal) card:** wording in `docs/patterns/ch7-lisbon-sources.md` ("Portugal help card"), in the WHERE_TO_REPORT §3c order, crisis row last and on its own. Linked from layer 2 of every Lisbon debrief.
- **Chapter file:** `content/chapters/lisbon.yaml`: slot 7; `patterns: [rental-offplatform-payment, qr-sticker-parking]`; `callbacks: []`; am `[01, 02, 03]` (stop point after 03), pm `[04, 05, 06, arc, 07, 08, 09]`; `boss: lisbon-09-boss-thursday-flat`; intro and rules as §27.1; `scenes: { arrival: lisbon-arrival, turn: lisbon-turn, resolution: lisbon-resolution }`.

### 27.11 Open questions for the producer (Lisbon)
1. **Brand names:** Roostwell (rental platform) and Zonelet (parking app and operator; renamed from Kerbello in review round 1, spare Lanefare), for fraud-researcher's brand check. The host handle is now "casa.velarim".
2. **The player's own booking** (7-1, 7-8, boss) alongside Beatriz's room hunt (drill only). **Answered (producer): the boss stays on the player's own booking.**
3. **`pay_unprotected` on a genuine booking** costs ★★ but keeps gold (row 2). **Answered (producer): accept the ★, plus the L-S1 layer-2 sentence; revisit at balancing with R15.**
4. **Rows 6b and 11:** link-only tagging nets 4 (one short of silver); an in-app fall still reaches gold. Inputs to the balancing pass and R15.
5. **For fraud-researcher:** (a) 7-6, a host inside the platform's chat sending an off-platform "partner page" (ROP §2.B: "through a link they send"; channel inside the app is a design choice); (b) 7-7, a fake parking slip with a QR (QRP §2: "a fake 'parking fine' with a QR is a related hook", news for PT); (c) the "city tax due before check-in" as the genuine twin (design; no claim about real tax rules); (d) boss beat 3 (labelled a design combination); (e) €246, €90, €263.50, €286, €12 and €1.60 (illustrative, never typical).
6. **R20 (producer, 2026-11-19, on learning-psychologist advice):** the boss shows Leonor's in-app follow-up after a fall too (`on_fall: show`), so a player who fell sees the impersonated host safe and the booking intact. See DECISIONS.md.

## 18. Chapters 2–10 (map owned by `fraud-researcher`)
**2 Amsterdam (slot 2, diff 2–3).** *Full chapter spec: §22, which replaces this summary.*
- Patterns: the "Hi Mum / new number" messenger scam, and the **task / easy-work job scam**.
- Noor writes from a "new number" while her real number also messages you; call the old number (LO-07).
- **Task scam:** a Kettle message recruits you for "easy online work". It leads to a fake task-platform website or app that shows small earnings and then asks for deposits to "unlock" tasks (LO-12, LO-02). The genuine twin is a real job message from a known contact that asks for nothing.
- The Larchwick **payee-name check** shows "Name doesn't match" on the new-number request (LO-06).
- Arc slot 2.

**3 Paris (slot 3, diff 2–4).** Replaced by §23 (producer, 2026-11-19).

**4 Madrid (slot 4, diff 2–4).** Replaced by §24 (game-designer, 2026-11-19; in review).

**5 Warsaw (slot 5, diff 3–4).** Replaced by §25 (game-designer, 2026-11-19; in review).

**6 Rome (slot 6, diff 3–4).** Replaced by §26 (game-designer, 2026-11-19; in review).

**7 Lisbon (slot 7, diff 3–5).** Replaced by §27 (game-designer, 2026-11-19; in review).

**8 Dublin (slot 8, diff 3–5).** Replaced by §28 (game-designer, 2026-11-19; in review). The Alex arc's slots 4–9 are specified in §28.5 (play-position beats, any city).

**9 Stockholm (slot 9, diff 3–5).** Replaced by §29 (game-designer, 2026-11-19; in review).

**10 Brussels: finale (slot 10, diff 4–5).** Replaced by §30 (game-designer, 2026-11-19; in review), which also ticks off the hand-over items below (§30.12). The summary is kept for history.
- New patterns: tech-support remote access (boss, LO-15) and **money-mule recruitment**.
  - The hook is a social-media or Kettle DM offering Noor easy money.
  - She asks your advice: they want her **banking-app login, card details or account access** "just for a few transfers".
  - The cyber lesson: never hand over your banking-app login, card details or account access.
  - The tone is non-threatening: "If you've already shared it, it's not too late: change your login, call your bank on the number on your card, and tell a trusted adult" (LO-12, LO-05, LO-18).
- Plus callbacks and the Alex resolution (§10.3).
- End screen: habit cards and the help list.
- **Hand-over to the Brussels spec:** what the finale must pick up from the arc and the remote-access preview is listed in §28.5 ("What Brussels must pick up") and §29.5.

## 28. Chapter 8 — Dublin
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/investment-ad-fake-platform.md` (IAF) and `docs/patterns/recovery-scam.md` (RCS); callback `task-job-scam.md` (TJS). Per-beat sources and their limits: `docs/patterns/ch8-dublin-sources.md`. No source ids and no real body names inline. Replaces the §18 Dublin summary. Also specifies the **Alex arc slots 4–9** (§28.5), which play by position in any city. Dublin adds **CR-38** (§28.9).

### 28.1 Goal, shape, rules check
- **The chapter habit (H):** **"Before you pay, look the firm up yourself on the regulator's register, and contact it only through the details the register gives. If you're asked to pay to get your money out, or back: stop."** (IAF §4, RCS §4; wording per review round 1: real products may set out early-withdrawal charges up front, so the rule is about being *asked to pay*, not about any charge.) Short form for layer 1: "Find the firm on the register yourself."
- **What the chapter teaches, in order of weight:**
  1. **Not on the register = don't pay.** A clean warning list proves nothing: scammers change names (IAF §4, §4a).
  2. **A real firm's name is not enough (clone firms).** Contact a registered firm only on the register's own details (IAF §4, §4a).
  3. Celebrity endorsements, "guaranteed" returns, "don't tell your bank" and "today only" are tells; a professional site, a firm number, a local phone number or a growing balance prove nothing (IAF §3).
  4. **Never pay to get money out or back.** Anyone who contacts you offering to recover money for a fee is almost certainly running a second scam (RCS §4).
  5. Calibration: Róisín's real request, a firm you found on the register, and the regulator's own reply are normal.
- **Shape:** slot 8, difficulty 3–5, boss 5. Timers 40 s (slot 8), call beats 30 s, boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus drill 8-4 (Declan) and the arc beat. Estimated 16–18 min including scenes.
- **New patterns (2):** `investment-ad-fake-platform` (8-2, 8-5 twin, 8-7, boss), `recovery-scam` (8-3, 8-8 twin, boss beat 3). **Callback (1):** `task-job-scam` (8-6; Declan's job hunt is the soil).
- **LO focus:** LO-13 (core), LO-16 (core: never pay to recover), LO-04, LO-18 (drill, scenes), LO-12 (8-6), LO-06 (boss), LO-02, LO-17, LO-14 (arc).
- **Flavour:** Irish English, a community-centre "money clinic", tea and biscuits, Declan's redundancy and retraining, Róisín's first college term. A few Irish-language greetings in small talk only (`lang="ga"`, inline translation, never a red flag). A city is a stage, not a claim: no debrief says a scam "is Irish".
- **Premise and intro** (CR-27, ≤ 20 s): "Dublin: Waymarker runs a free money clinic in a community centre this week, and you're helping. Since you looked up savings accounts for it, your own feeds are full of money ads."
- **Rules card** (CR-27), title **"The money clinic's rules"**, two items: "Before you pay, find the firm on the register yourself, and contact it only on the register's details." · "If you're asked to pay to get your money out, or back: stop." General rules, never wrong on the genuine twins (8-5's firm is on the register and contacted on its details, and its sheet states its early-withdrawal terms up front without asking for any payment; 8-1 and 8-8 ask no fee).
- **Never on screen:** loss or report figures, prevalence claims, a refund as certain. Refunds are always "may": a payment you made yourself to an investment scam is generally not "unauthorised" (IAF §5.7), so layer 2 says "Call your bank straight away; it may be able to help." No investment walkthrough, no crypto how-to, no realistic onboarding (§10.1 authoring rule). The celebrity (Orla Fennick) is an obviously fictional person, always illustrated, never photo-realistic; no deepfake-making is shown.

**Mix rules (balance v3.1):**
- **Genuine** 3/8 = 37.5% ✓. **Truth order** (scored): G F F · G F F G F(boss); max run 2 ✓.
- **Themes:** `clinic` 1 (8-1), `investment` 4 (8-2, 8-5, 8-7, boss), `recovery` 2 (8-3, 8-8), `job` 1 (8-6). Max 4/8 ✓. Scored order clinic, investment, recovery, investment, job, investment, recovery, investment: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 (8-1 honest timer, 8-5 honest timer) = 66.7%; fraud 4/5 (8-2, 8-6, 8-7, boss) = 80%; gap 13.3 ✓. 8-3 and 8-8 are calm on purpose (a recovery offer arrives slowly and kindly).
- **Difficulty parity:** genuine at 3 (8-1), 4 (8-5), 5 (8-8); fraud at 3 (8-2), 4 (8-3, 8-6), 5 (8-7, boss) ✓.
- **Decoys:** ≥ 2 on every fraud (counts in §28.7). **Sender-or-link decoy:** F = 5 needs 2: 8-2's link (the platform's own tidy address), 8-3's sender and link, 8-7's Dublin caller ID ✓.
- **Interrupts:** 8-3 Declan, 8-5 Róisín, 8-6 Declan, 8-7 Róisín (after "What now?"), 8-8 Noor, boss Róisín. Genuine small talk, never pointing to the verdict.
- **Off-focus genuine:** none (8-1 is high stakes; 8-5 and 8-8 are in focus).
- **Red Line 8:** every scenario is an ad, an email, a chat, a call or a banking beat. No in-person "adviser", no cash.

### 28.2 Story beats (track S)
STORY §3.8, updated with this spec. No panel shows an ad, a celebrity, a platform, a balance, a firm name or an amount. Declan is tempted and checks; he never falls. Róisín is supportive, never the parent.
1. **Arrival** (before the arc beat and 8-1; 2 panels; calm). A community-centre hall set up for the money clinic, an urn and a tray of biscuits. Róisín (warm): "Thanks for coming. Dad's been a bit lost since the warehouse closed." Declan (thinking): "Twenty-two years. Now I've a lump sum, a daughter in college and no plan." Cast: Róisín, Declan.
2. **Turn** (stop point, after 8-3; 3 panels; thinking → calm). Declan (thinking): "Everyone online seems to be getting rich. Am I the only one being careful?" Optional rehearsal choice: "Where would you start?" (Find out who's behind it / Look it up on the register). Same reply to both, Declan (calm): "Both. Register first, and I'll find it myself, not through an ad." (D-M1: Declan decides for himself.) Drill 8-4 follows directly.
3. **Resolution** (after the boss debrief; 2 panels + If-then; relieved).
   - **Variant `dublin_bank_called`** (story-only, set by every boss fall outcome; R17 approach): when set, it is the **first panel**, Róisín (calm): "The bank was called straight away, the right first step. We'll see what it can do." No refund promise.
   - Declan (laughing): "Boring savings account and a course to retrain. Róisín says boring is the new exciting."
   - Declan (calm): "And anyone charging a fee to get lost money back? Same crowd."
   - **If-then panel (Declan), word for word from STORY §3.8:** "If an investment promises guaranteed returns, then I find the firm on the regulator's register myself." Extra line under it: "Not on the register? Don't pay. Paying to get money out or back? Stop."
- **Map invitation (Róisín):** "My dad lost his job and everyone's selling him a plan. Could you come and talk to him?" (STORY §3.8.)
- **Panels:** 2 + 2 + 3 = 7 (+1 with the variant). The turn's reply sits inside its choice panel.
- **Safety:** job loss and money worry (STORY §5.3). Declan stays dignified and in charge of his choices; nobody calls him naive. **Content note** (producer ruling, §28.11 Q5): "This chapter touches on job loss and on losing money to investment scams. You can pause or skip any story scene, and help is one tap away." No scene is `sensitive`.

### 28.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| *arc* | AM | Arc slot N (default: slot 8), first beat after the intro | messenger | arc | — | — | — | LO-14 |
| 8-1 | AM | Róisín (saved contact): "Doors at 10 ☕ Could you send me €10 for the hall's tea and biscuits?" | messenger → banking | genuine / high | 3 | honest timer 40 | clinic | LO-17, LO-06 |
| 8-2 | AM | Postwick sponsored post: an illustrated "interview" with presenter Orla Fennick: "I moved my savings into Quorvex. It pays 2% a week, guaranteed." | social → browser | fraud (IAF A) | 3 | timer 40 + pusher | investment | LO-13, LO-04 |
| 8-3 | AM | Email from "Backhaven Recovery": "Lost money to an online investment or a celebrity ad? … A €150 retainer opens your case today." | email → browser | fraud (RCS) | 4 | — (calm); interrupt | recovery | LO-13, LO-16 |
| | | *Stop point + turn* | | | | | | |
| 8-4 | PM | **Drill: Declan's two ads.** A "state-backed" bond and "Brindlecove Bonds, guaranteed 9%". "Which one?" | messenger (quoted) | drill | 3 | — | — | LO-13, LO-18 |
| 8-5 | PM | Email from Ellisfen Invest (a firm you found on the register and rang on the register's number): the information sheet you asked for; "no rush" | email | genuine / low (twin of boss beat 1) | 4 | honest timer 40; interrupt | investment | LO-13, LO-17 |
| 8-6 | PM | Kettle, new number: "Aisling from Tallyfern 🙂 We pay €45 an hour to rate finance apps from home. Interested? Reply YES" | messenger → messenger | fraud (TJS callback) | 4 | timer 40 + pusher; interrupt | job | LO-12, LO-18 |
| 8-7 | PM | Call from a Dublin number: "Ciarán from Quorvex Wealth … Start with €250 today … don't mention it to your bank." | call | fraud (IAF A) | 5 | call 30 s; interrupt after "What now?" | investment | LO-13, LO-04, LO-08 |
| 8-8 | PM | Email from Fairmeasure, the regulator you reported a firm to: "not authorised, now on our warning list … we never charge a fee" | email | genuine / low (twin of 8-3, boss beat 3) | 5 | — (calm); interrupt | recovery | LO-13, LO-17 |
| 8-9 **Boss** | PM | The clone bond. Beat 1 (email "Ellisfen Invest", ellisfen-invest.example): "8% a year, guaranteed … authorised by Fairmeasure (firm no. FM-20417)". Beat 2 (call, caller ID "Ellisfen Invest"): "Transfer the €2,000 to our client account today" (payee check **doesn't match**). Beat 3 (email "Fairmeasure Investor Protection", fairmeasure-claims.example): "funds can be released after a €95 verification fee" | email → call (+ banking) → email | fraud (IAF A, clone; RCS) | 5 | boss timers 40, call 30 + pusher; interrupt after beat 3 | investment | LO-13, LO-06, LO-16, LO-04 |

**Arc placement.** First beat after the intro, before 8-1 (the morning; STORY §1.4 as amended: a spec decides where in the chapter). Every other gap in Dublin sits next to an investment, recovery or easy-money debrief, which could be read against slots 4–9 (trading brags, a platform, a dashboard, a fee, a deadline, a loan). 8-1's debrief (a real tea-money request) says nothing about friends, platforms or returns. §28.11 Q1.

### 28.4 Scenario specs
Shared rules as §24.4. Irish numbers masked `+353 1 ••• ••NN` (landline) and `+353 8• ••• ••NN` (mobile); IBANs `IE•• … NNNN`, checksum-invalid. Every scored scheduled beat on a CR-30 device has an `ask`. Reveals follow DB1–DB6 (§28.8). Training pages: fields as the engine's `enter_details`/`pay` page (TrainingForm; read-only, nothing sent), never a promised field list. `tell_trusted_adult` is `stop` in every personal-money fall.

**8-1 `dublin-01-tea-money`** · genuine, high · messenger → banking · diff 3 · honest timer 40, `honest_deadline` "Any time before Friday" · Larchwick · cast Róisín · no pattern (calibration)
- **Message:** saved contact "Róisín (clinic)" (`earlier[]`: "Róisín: See you Monday! Dad's practising his handshake 😄"). "Morning! Doors at 10 ☕ Could you send me €10 for the hall's tea and biscuits? Any time before Friday. Dad's bringing more biscuits, God help us." `request: pay`; `ask` = "Could you send me €10 for the hall's tea and biscuits?"; `references: ["Doors at 10"]`.
- **Checkables (G, 3):** `sender.detail` (§22.8 ruling 1, neutral on a money request: "Shows Róisín's saved contact, in your usual chat. An account can be taken over and show the same, so it can't prove anything either way. Judge the request.") · `reference` ("It fits: the clinic opens at 10. That isn't proof on its own.") · `request` ("€10 for tea you'll drink, by a transfer you start yourself, to her own account. No link, no code.").
- **Actions:** "Pay her in the Larchwick app" (`start_transfer` → `tea_transfer`, plain `step`) · "Ask Róisín at the hall first" (`ask_someone` ★★★; "Róisín: 'Yes, me! Thanks for checking.'") · report (0, −5) · "Ignore it" (`ignore`, dismiss on genuine high, 0).
- **`tea_transfer`:** payee typed from her saved contact, "Róisín Byrne"; IBAN `IE•• … 7712`; €10.00. Result **match**. Actions: "Send €10" (`proceed` ★★★) · "Cancel and ask her first" (`ask_someone` ★★★) · "Cancel" (`ignore`, 0).
- **Debrief L1 (genuine):** tell "Her saved chat, her own name, for tea you'll share." · what works "Paying was fine; asking is never wrong." Layer 2: "A real request is for something you know about, to the person's own account, and can wait for a question." Habit card `calm-not-paranoid`.

**8-2 `dublin-02-presenter-ad`** · fraud (IAF A) · social → browser · diff 3 · timer 40; pusher at 20 s (a comment from the same page): "Only 12 places left tonight!" · levers authority (a famous face), greed, urgency, social_proof · Postwick, Quorvex (scam-only), Fairmeasure (verify)
- **Message (social, sponsored post):** page "Money Today with Orla" (detail "Sponsored · page created 2 weeks ago"); `image` (alt: "An illustrated TV-studio 'interview': presenter Orla Fennick smiling beside a rising chart."). "'I moved my savings into Quorvex. It pays 2% a week, guaranteed.' Orla Fennick on how ordinary people are building wealth. Start with Quorvex: quorvex-invest.example/start" `request: open_link`; `ask` = "Start with Quorvex: quorvex-invest.example/start"; `claims[0]` = "It pays 2% a week, guaranteed."
- **Checkables (5; R 2):** `sender.detail` **D** ("A page with a friendly name and a 'Sponsored' tag. Anyone can pay for an ad, so it can't prove anything either way.") · `image` **R** (DB2: "A famous face 'recommending' an investment. Endorsements like this are often fake, sometimes made with AI, and the person never agreed.") · `claim` **R** ("'Guaranteed', and high. Real investments can lose money; nobody can guarantee 2% a week.") · `link` **D** (DB4: "quorvex-invest.example, the platform's own address. A scam platform can have a tidy address too, so it can't prove anything either way. Check the firm, not the address.") · `request` **D** ("Asks you to sign up. Ads do that, so it can't prove anything either way. Who the firm is matters.").
- **Actions:** "Open the sign-up page" (`open_link` → `signup_page`, target) · "Look Quorvex up on the Fairmeasure register yourself" (`check_official_list` ★★★; CR-38 result "Not on the register." + "Warning list: no warning found." Outcome: "No firm called Quorvex is authorised. The warning list has nothing either, and that proves nothing: scammers change names. Not on the register means don't pay.") · "Report the ad on Postwick" (report ★★) · "Scroll past" (`ignore` ★★).
- **`signup_page` (training page "Quorvex · Start"):** address `quorvex-invest.example/start`; "Leave your details and an adviser will call you in 10 minutes", fields as the engine's `enter_details` page. Checkables: `page.address` D · `page.info` R ("An 'adviser' will call: the ad leads to a sales call, not to an authorised firm."). Actions: "Send your details" (`enter_details`, fall) · "Close it and check the register" (`check_official_list`, ★★ engage cap) · "Close the page" (`ignore` ★★).
- **Fall** narrative: "Seven minutes later a friendly 'adviser' rings. You say you'll think about it. He rings again the next day, and the next." Damage control (6, 2 harmful): `block_adviser_number` (stop, new) · `report_ad_on_platform` (report, new) · `report_firm_to_regulator` (report, new) · `keep_evidence` (secure: "the ad, the page address, the call log") · harmful `pay_first_deposit` (new: "Pay a small first deposit to see if it's real"; T-3.10 review) · harmful `wait_and_see`.
- **Debrief L1 (≈16):** tell "A famous face promising guaranteed returns." · what works "Look the firm up on the register yourself." Layer 2: "Not on the register means don't pay. A clean warning list proves nothing: scammers change names." · `already_clicked.entered_details`: "Gave your number? Expect calls. Don't pay anything, block the number, and report the ad." Habit card `if-its-guaranteed-and-high-its-not` (new, §28.10).

**8-3 `dublin-03-recovery-offer`** · fraud (RCS) · email → browser · diff 4 · calm (no timer) · levers authority (borrowed regulator), helpfulness, small_amount · Backhaven Recovery (scam-only), Fairmeasure (claimed) · **Interrupt** at 15 s, Declan: "Does a tin of biscuits count as a business expense? Asking for the clinic."
- **Message (email):** from "Backhaven Recovery" <cases@backhaven-recovery.example>, subject "Lost money online? We can help". "Hi Sam, lost money to an online investment or a celebrity ad? Our legal team works with Fairmeasure and recovers most clients' money. A €150 retainer opens your case today: backhaven-recovery.example/case" `request: pay`; `ask` = "A €150 retainer opens your case today"; `claims[0]` = "Our legal team works with Fairmeasure and recovers most clients' money."; `references: ["Hi Sam"]`.
- **Checkables (5; R 2):** `sender.detail` **D** ("A firm's own address. A website and email address can't tell you who runs them, so it can't prove anything either way.") · `reference` **D** ("Uses your name. It's easy to find, so it can't prove anything either way.") · `link` **D** ("backhaven-recovery.example, its own address. It can't prove anything either way.") · `claim` **R** (DB6: "Claims to work with the regulator and promises success. Regulators don't team up with fee-charging recovery firms, and nobody can promise your money back.") · `request` **R** ("A fee first, to get money back. That's the tell of a second scam.").
- **Actions:** "Open the case page" (`open_link` → `case_page`, target) · "Look Backhaven up on the Fairmeasure register" (`check_official_list` ★★★; "Not authorised. Fairmeasure's own page: 'We never work with recovery firms and never charge fees.'") · "Report the email" (report ★★) · "Delete it" (`delete` ★★).
- **`case_page` (training page "Backhaven · Open your case"):** address `backhaven-recovery.example/case`; "Retainer €150", fields as the engine's `pay` page. Checkables `page.address` D, `page.info` R ("A fee before anything comes back."). Actions: "Pay the €150 retainer" (`enter_details`, fall) · "Close it and check the register" (★★) · "Close the page" (★★).
- **Fall** narrative: "'Case opened.' Two days later: 'Good news, we traced funds. A €400 release fee is due.'" Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop) · `report_firm_to_regulator` (report) · `keep_evidence` (secure) · harmful `pay_recovery_service` · harmful `wait_and_see`.
- **Debrief L1 (≈14):** tell "Contacted out of the blue, with a fee first." · what works "Never pay to get money back." Layer 2: "Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam. If you did lose money, go to your bank and the police yourself." (RCS §4) "People who've lost money are often targeted on purpose afterwards, because scammers share victims' details. That says nothing about you." (D-S3; T-3.10 round 1, psych M1: no "again") `already_clicked.paid`: "Paid a fee? Stop paying, block your card in your banking app and call your bank on the number on your card." Habit card `stop-the-damage-first`.

**8-4 `dublin-04-declan-two-ads`** (drill, unscored) · messenger with quoted ads · cast Declan · `pattern: investment-ad-fake-platform`
- **Message:** Declan's saved contact "Declan (clinic)": "Two of these look grand. A 'state-backed' bond at 7%, and Brindlecove Bonds, 'guaranteed 9%'. My lump sum would do well in either. Which one?" Quoted (`context: quoted`): "State-backed savings bond: 7% a year, government guaranteed. Limited window." · "Brindlecove Bonds: guaranteed 9%. Join thousands of happy savers."
- **Quoted checkables** (should-fix 8: the tags point at the high rate and the deadline, never at "government guaranteed" alone, since real state-backed savings exist): `claim` **R** = "7% a year" ("A high rate offered as a sure thing. High returns always come with risk, whoever's name is on them.") · `claim#2` **R** = "Limited window" ("A deadline, so you don't stop to check.") · `claim#3` **D** = "government guaranteed" ("Real state-backed savings exist, so the label can't prove anything either way. Check who is behind it yourself."). Drill tags never count.
- **Picks** (each gets a Declan reply; no stars):
  - "Look both up on the Fairmeasure register together." (`proceed`) → "Brindlecove's on the warning list! And the 'state' one isn't on the register at all, or on the warning list. So: not on the register, no money. Got it."
  - "Check the warning list." (`proceed`) → "Brindlecove's on it. The other one isn't, so it's fine? … Róisín says not on the register means no. Right so." (the trap, corrected kindly)
  - "Ask the clinic's adviser first." (`proceed`) → "She says the same: register first, and nothing 'guaranteed'."
  - "Go for the 9%: it's guaranteed." (`reply`) → "Hmm. Róisín's giving me a look. Register first, she says." (Gentle; Declan decides well anyway.)
- **Debrief (drill):** tell "A high rate, a deadline, and a firm you can't find." · what works "Not on the register? Don't pay." Layer 2: "A firm missing from the warning list isn't safe: the list only names firms already warned about." (IAF §4) Habit card `if-its-guaranteed-and-high-its-not`.
- **Story:** after the debrief, a caption: "You and Declan report the 'state-backed' bond through Fairmeasure's website." (Sets up 8-8, true in every branch.)

**8-5 `dublin-05-ellisfen-sheet`** · genuine, low · email · diff 4 · honest timer 40, `honest_deadline` "This rate holds for 14 days" · `pattern: investment-ad-fake-platform` (in-focus twin of boss beat 1) · Ellisfen Invest · you started it · **Interrupt** at 15 s, Róisín: "Dad's asking if biscuits count as an investment 🙄"
- **Setup:** "Yesterday you found Ellisfen Invest on the Fairmeasure register and rang the number listed there about a savings bond for your travel fund. They said they'd email the details."
- **Message (email):** from "Ellisfen Invest" <savings@ellisfen.example>, subject "The fixed-term bond you asked about". "Hi Sam, thanks for your call. Attached is the information sheet for our 1-year fixed-term bond. Take your time and talk it over: this rate holds for 14 days. Reply with any questions, or apply at ellisfen.example/apply when you're ready. Page 2 sets out the terms for taking money out early, including any charges." `attachments: ["Information sheet.pdf"]`; `request: reply`; `ask` = "Reply with any questions, or apply at ellisfen.example/apply when you're ready."; `references: ["thanks for your call"]`; `claims[0]` = "Page 2 sets out the terms for taking money out early, including any charges."
- **Checkables (G, 6):** `sender.detail` (DB1 "It fits: ellisfen.example, the address the register lists for Ellisfen. That isn't proof on its own, so weigh it with what it asks.") · `attachment` (neutral: "An information sheet you asked for.") · `link` ("It fits: ellisfen.example, the register's address.") · `reference` ("It fits: your call, on the register's number.") · `claim` (neutral: "Says the terms for taking money out early, in writing. Real products set out any charges up front; nobody asks you to send new money to get yours out.") · `request` ("Questions, or apply when you're ready. No deadline today, no transfer, nobody pushing.").
- **Actions:** "Reply: thanks, I'll read it" (`proceed`, target ★★★) · "Check Ellisfen on the register again" (`check_official_list` ★★★, in focus; "Authorised. The address and number on the register match this email.") · report (0, −5) · "Delete it" (`ignore` ★★).
- **Debrief L1 (genuine):** tell "A firm you found on the register, on its own address, with no rush." · what works "Reading it at your own pace was right." Layer 2: "You found the firm and rang the register's number yourself. Copies of real firms exist, so that's the part that counts." *(Layer 2 must not name the boss's domain.)* Habit card `calm-not-paranoid`. *Never says "invest": deciding is the player's own business; the scenario only shows what a genuine contact looks like.*

**8-6 `dublin-06-rating-tasks`** · fraud (TJS callback) · messenger → messenger · diff 4 · timer 40; pusher at 22 s (same chat): "Only 3 spots left today 😊" · levers greed, urgency, helpfulness · Kettle, Tallyfern (scam-only, Amsterdam brand) · **Interrupt** at 12 s, Declan: "Róisín's college says retraining courses open next week. Fancy that."
- **Message:** Kettle, new contact (CR-19) "+353 8• ••• ••31", display "Aisling · Tallyfern". "Hi! Aisling from Tallyfern 🙂 We pay €45 an hour to rate finance apps from home, paid daily. Saw your money clinic online, perfect fit! Interested? Reply YES" `request: reply`; `ask` = "Interested? Reply YES"; `claims[0]` = "We pay €45 an hour to rate finance apps from home, paid daily."; `references: ["Saw your money clinic online"]`.
- **Checkables (4; R 2):** `sender.detail` **R** ("Not in your contacts: a stranger with a job you never applied for.") · `reference` **D** ("Mentions the clinic. It's advertised publicly, so it can't prove anything either way.") · `claim` **R** ("€45 an hour to tap stars. Pay like that for easy tasks is the tell.") · `request` **D** ("Asks for a reply. Recruiters do ask, so it can't prove anything either way.").
- **Actions:** "Reply YES" (`reply` → `task_intro`, target) · "Ask the clinic's volunteer coordinator" (`ask_someone` ★★★; "'A job that finds you in a chat and pays €45 to rate apps? Those nearly always end with a top-up.'") · "Block and report the number" (`block` ★★) · "Ignore it" (★★).
- **`task_intro` (messenger, not in R):** "Great! Do 3 trial ratings, then top up €40 to unlock paid tasks (refunded with your earnings)." `request: pay`; `ask` = "top up €40 to unlock paid tasks". Checkable `request` R ("Paying to start a job."). Actions: "Top up €40" (`pay`, fall) · "Block and report" (★★ engage cap) · "Ask the coordinator" (★★).
- **Fall:** narrative "The €40 'unlocks' tasks. Your balance says €112 earned. To withdraw, Tallyfern wants another €90." Damage control (6, 2 harmful): `stop_paying` (stop) · `call_bank_known_number` (stop) · `keep_evidence` (secure) · `report_to_police_online` (report) · harmful `pay_last_fee` · harmful `wait_and_see`.
- **Debrief L1 (≈15):** tell "A stranger offering easy money for easy tasks." · what works "A real job pays you. Never pay to work." Layer 2: "A balance that grows but needs a top-up to withdraw is the same trick as a fake investment dashboard." Habit card `easy-money-costs-you`.

**8-7 `dublin-07-adviser-call`** · fraud (IAF A) · call · diff 5 · call 30 s; pusher at 18 s (caller): "Are you with me? The rate goes at five." · levers authority, greed, secrecy, urgency · Quorvex (scam-only) · **Interrupt** (`after_what_now`, genuine), Róisín: "Clinic's packing up. Chips? 🍟"
- **Message (incoming call):** caller ID "+353 1 ••• ••42" (detail "Not in your contacts"). Transcript:
  1. "Hi Sam, Ciarán here from Quorvex Wealth. You looked at one of our partner ads this week." (`references: ["one of our partner ads this week"]`)
  2. "We're fully regulated, and clients are seeing about 2% a week." (`claims[0]`)
  3. "Start with €250 today and I'll set it up with you." (`ask`)
  4. "One thing: don't mention it to your bank. They block us because they hate competition." (`claims[1]`)
  `request: pay`.
- **Checkables (5; R 2; difficulty 5: the main tell is the ask):** `caller_id` **D** (RM1 wording: "A Dublin number. A number on screen can be bought or faked, so it can't prove anything either way.") · `reference` **D** ("Lots of people saw that ad, so it can't prove anything either way.") · `claim` **D** (DB4: "Anyone can say 'regulated'. Only the register can tell you, so it can't prove anything either way.") · `claim#2` **R** ("'Don't tell your bank' cuts you off from help.") · `request` **R** ("Money today, on a call you didn't ask for.").
- **Actions:** "Read him your card to start" (`enter_details`, target, fall) · "Hang up and look Quorvex up on the register" (`check_official_list` ★★★; as 8-2's result) · "Hang up" → "What now?": "Call your bank on the number on your card" (verify ★★★; "Larchwick: 'Thanks for checking with us. You can always tell your bank about a payment.'" ("hate competition" stays in the transcript only; no reveal, outcome or debrief repeats it)) · extra "Call back this number" (engage note as 6-3) · report · "Leave it there" (★★).
- **Fall** narrative: "He takes the card. €250 goes. An email brings a login: your €250 'is already €261'." Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop) · `report_firm_to_regulator` (report) · `keep_evidence` (secure) · harmful `add_more_to_test` ("Add a bit more to see if the gains are real") · harmful `wait_and_see`.
- **Debrief L1 (≈16):** tell "A cold call: money today, and 'don't tell your bank'." · what works "Hang up. Check the register yourself." Layer 2: "'Don't tell your bank' is there to cut you off from help." · `already_clicked.entered_details`: "Gave your card? Block it in your banking app now and call your bank on the number on your card. A balance that 'grows' proves nothing: a dashboard shows whatever the website wants it to show." Habit card `if-its-guaranteed-and-high-its-not`.

**8-8 `dublin-08-regulator-reply`** · genuine, low · email · diff 5 · calm (no timer) · `pattern: recovery-scam` (in-focus twin of 8-3 and boss beat 3) · Fairmeasure · you started it (your report after 8-4) · **Interrupt** at 15 s, Noor: "inspector. is it true irish tea is stronger. Grandad says yes"
- **Message (email):** from "Fairmeasure" <reports@fairmeasure.example>, subject "Your report: FM-•••• 118". "Thank you for your report about 'State-backed savings bond'. The firm behind it is not authorised, and we have added it to our warning list. We will never contact you to recover money and never charge a fee. If you paid anything, contact your bank and the police. Our warnings: fairmeasure.example/warnings" `request: none`; `ask` = "If you paid anything, contact your bank and the police."; `references: ["Your report: FM-•••• 118"]`.
- **Checkables (G, 4):** `sender.detail` ("It fits: fairmeasure.example, the regulator's own address, replying to a report you made. That isn't proof on its own, so weigh it with what it asks: nothing.") · `reference` ("It fits: your report's number.") · `link` ("It fits: fairmeasure.example, the regulator's own address.") · `request` ("Asks for nothing: no fee, no login, no call.").
- **Actions:** "Read it and file it" (`proceed`, target ★★★) · "Open Fairmeasure's site yourself to check" (`check_official_list` ★★★, in focus; "The warning is there.") · report (0, −5) · "Delete it" (`ignore` ★★).
- **Debrief L1 (genuine):** tell "The regulator you wrote to, asking for nothing." · what works "Reading it was right." Layer 2: "A real regulator never charges you to get money back. Remember that for the next 'recovery' offer." Habit card `calm-not-paranoid`.

### 28.5 Device moments, the Alex arc (slots 4–9) and what Brussels must pick up
- **The register (CR-38).** **8-2** (not on the register, warning list clean: don't pay) → drill **8-4** (one on the warning list, one on neither: both no) → **8-5** (on the register, contacted on its details: fine) → **boss beat 1** (on the register, but a different address: a clone). The register is opened from the home screen, never from a link in a message (IAF §4a).
- **Pay to get money out or back.** **8-3** (a recovery fee) → **8-6** (a top-up to withdraw "earnings") → **8-8** (the real regulator: no fee, ever) → **boss beat 3** (a fake regulator's fee).
- **Training pages:** read-only, watermarked, labelled "Training page", no network (Red Line 2). No trading dashboard is ever a page in Dublin; dashboards appear only as text in outcomes and in arc slot 6.

**Alex arc, slots 4–9 (play-position beats, any city; §10.1, STORY §1.4).** Dublin's research covers them, so they are specified here; each chapter's spec only places "arc slot N". Friendship only, no romance coding, Alex's lines ≤ 25 words, generic, no persuasion copy, no platform walkthrough (§10.1). Device `messenger` (Kettle, after slot 2's move, or Wordswap if the player stayed: the line is the same). Alex's platform is **Glimmerfund** (arc-only brand, `glimmerfund.example`): never named in any chapter's scored scenario or debrief, so no chapter's debrief can unmask it. Layer 1 per §10.2 (no verdict, no stars; fixed copy adds 10 words; authored words in brackets).

| Slot | Alex's line | Options → kind | Layer 1 (tell · what works) |
|---|---|---|---|
| 4 | **As shipped** in `content/scenarios/madrid/madrid-arc-alex-04.yaml` (the shipped file wins): "Guess what, I made €300 this week just from trading 😎 Easiest money ever. Anyway, how's your trip going?" | Ask how to join → `reply` · Report the profile → `report` · Change the topic: tell Alex about your trip → `ignore` | "Talk of easy profits often comes before an invitation." · "Change the subject, and tell someone you trust." (17) |
| 5 | "Start small with me? Put €50 on Glimmerfund and I'll show you. glimmerfund.example" | Look Glimmerfund up on the Fairmeasure register → `check_official_list` ("Not on the register. Warning list: no warning found. Not on the register means don't pay.") · Sign up and add €50 → `pay` (`alex_invested` += 50) | "A platform you can't find on the register." · "Not on the register? Don't pay." (14) |
| 6 | Invested: "Look, your €50 is already €71 on Glimmerfund! 🚀 Add a bit more while it's rising?" · Not invested: "Look at mine: €300 is now €640 🚀 Still not joining me?" (`arc_branch_on: alex_invested`) | Ask someone → `ask_someone` · Add more → `pay` (+ amount) · Report → `report` | "A dashboard shows whatever the website wants it to show." · "Growing numbers prove nothing. Ask someone before adding money." (19; IAF §4a line) |
| 7 | Invested: "Weird: Glimmerfund says you pay a €40 release fee before you can withdraw. Everyone pays it, I did!" · Not invested: "Mine's stuck. Glimmerfund wants a 'release fee' before I can withdraw. That's normal, right?" | Invested: Refuse and report → `report` · Pay → `pay` (+40). Not invested: Say it sounds like a scam and report → `report` · Say it's probably normal → `reply` · Ask someone → `ask_someone` | "Paying to get your own money out." · "If you have to pay to get your money out, the balance on screen isn't real. Stop paying." (25; IAF §4a line; D-S1 wording; Medium for Ireland, so the line stays city-agnostic) |
| 8 | "Glimmerfund's VIP window closes tonight. Put €200 in with me? It'd be so fun doing this together 🙌" | Ask someone → `ask_someone` · Transfer → `pay` (+200) · Report → `report` (D-S2) | "A deadline, plus 'do it with me'." · "Ask someone before you send money. A real friend can wait." (18) |
| 9 | "I'm in trouble. My account's frozen and I need €300 by tomorrow. You're the only one I can ask. Please?" | Call Adaeze or Teo → `ask_someone` · Send it → `pay` (+300) · Report → `report` (D-S2) | "An emergency, money, and 'only you'." · "Call Teo or Adaeze before you send anything." (14) |

- **Every arc debrief from slot 4:** `already_clicked.paid` = §10.2's line ("If you've already paid … stop paying, call your bank on the number on your card, and keep the chat history"); "Tell me now" behind its confirmation; no damage control at the beat (§10.2).
- **Flags (CR-08, snake_case):** `alex_invested` (sum of `pay` amounts, slots 5–9) and the closing state the engine already keeps (report slot, close count, Tell me now). No slot-4 flag: the shipped slot-4 file sets none, and nothing reads one (the draft's `alex_interested` is dropped). Ending rule unchanged (§10.3): report at slot ≤ 6 → A; at 7–9 → B (so the Report options added at slots 8 and 9 close the arc as B).
- **Slot 5 needs CR-38 game-wide:** slot 5 may land in any city, before or after Dublin, so the Fairmeasure register is a home-screen tool in every chapter. Its first use shows a one-time coach mark ("Two lists: firms allowed to sell investments, and firms the regulator warns about"), wherever it comes first.
- **Teo check-ins (I1, I3)** stay unscored and the same for every answer (STORY §2.2).

**What Brussels must pick up (hand-over to the finale spec):**
1. **Close the arc** for everyone still open at the finale: ending C if `alex_invested > 0`, otherwise B (refused every request) or the endings already reached (A, A′, R), per §10.3.
2. **Ending C's recovery-agency test** (and R with an investment): a "recovery" offer with a fee first, as in RCS. Reuse **Backhaven Recovery** (registered here) or a new name; either way a fee-first contact, scored on refusing it (LO-13, LO-16). Damage control reuses Dublin's steps: `stop_paying`, `call_bank_known_number`, `keep_evidence`, `report_firm_to_regulator`, harmful `pay_recovery_service`, harmful `pay_last_fee`. No refund promise: "Call your bank straight away; it may be able to help."
3. **The red-flag timeline** lists slots 1–9 with the layer-1 tells above (slot 1 "Nothing to notice yet").
4. **A / A′ Teo scene:** "a similar friendly profile" approaches Teo; it must not reuse Glimmerfund's name in a way that tells the player before Teo asks.
5. **The reveal** (Tell me now and the finale): the same Alex portrait on profiles with other names (§10.2).
6. **Slot 9 is the last arc beat before the finale** (the ninth chapter played); the finale adds no new Alex request.
7. **The remote-access boss** extends Stockholm's preview (§29.5): the same **Kindhand** helper app, the same "Nobody needs your screen" card (first earned in Stockholm if played).
8. **No amounts lost on screen** (D-M2a): no scene, ending or timeline shows the `alex_invested` amount or any total lost (STORY §5.4).
9. **Blame the lie, not the player** (D-M2b): ending C's recovery-agency test opens by putting the blame on the lie, not the player (STORY §5.8), and its debrief uses the Dublin line "Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam." Never "again" or "twice".

### 28.6 Boss 8-9 `dublin-09-boss-clone-bond`
- **Setup:** "Friday. Your travel fund is still in Larchwick. You've been reading about savings bonds all week."
- **Levers:** borrowed authority (a real firm's name and number, then the regulator's), greed, urgency, fear of loss. Pusher on beat 2 at 18 s (caller): "Are you still there? These places are going fast."
- **Real details mixed in (difficulty 5):** a real firm's name and firm number, a Dublin number, the regulator's name.

**Beat 1, email (start, 40 s).** From "Ellisfen Invest" <bonds@ellisfen-invest.example>, subject "Fixed-rate bond: 8%, guaranteed". "Hi Sam, our fixed-rate bond pays 8% a year, guaranteed, with your capital protected. Ellisfen Invest is authorised by Fairmeasure (firm no. FM-20417). Only 40 places at this rate: apply today at ellisfen-invest.example/bond" `request: open_link`; `ask` = "apply today at ellisfen-invest.example/bond"; `references: ["authorised by Fairmeasure (firm no. FM-20417)"]`; `claims[0]` = "pays 8% a year, guaranteed, with your capital protected".
- Checkables (5; R 3): `sender.detail` **R** (DB1: "bonds@ellisfen-invest.example. The register lists ellisfen.example. A real firm's name on a different address is a clone.") · `reference` **D** (DB4: "A real firm number, copied from the register. Clones copy names and numbers, so it can't prove anything either way.") · `claim` **R** ("'Guaranteed' and 'capital protected' at 8%. Nobody can guarantee that.") · `link` **R** ("ellisfen-invest.example, not ellisfen.example.") · `request` **D** ("Asks you to apply. Firms do; where you apply matters.").
- Actions (no engage on boss beats): "Apply through the link" (`enter_details`, target) · "Look Ellisfen up on the register and ring the number listed there" (`check_official_list` ★★★; "Register: Ellisfen Invest, authorised, at ellisfen.example. On the register's number: 'That's not us. We don't sell that bond, and we never email from that address. Thank you for telling us.'") · report (★★) · delete (★★).

**Beat 2, call (`arrives_after: 45`, call 30 s, `covered_by: [start]`).** Caller ID "Ellisfen Invest" (detail "+353 1 ••• ••87"). Transcript: "Hi Sam, Gráinne from Ellisfen Invest about the 8% bond. Only a few places left today." (`claims[1]`) · "Ellisfen is on the Fairmeasure register; you can check." (`claims[0]`) · "Transfer the €2,000 to our client account today and the rate is locked. I'll text you the details." (`ask`). `request: pay`.
- Checkables (4; R 2): `caller_id` **D** (RM1: "Shows Ellisfen Invest. A caller can set the name and number, so it can't prove anything either way.") · `claim` **D** (DB1: "True: the real Ellisfen is on the register. A clone uses that. It can't prove anything either way.") · `claim#2` **R** ("'Only a few places today.' Pressure to pay now.") · `request` **R** ("A transfer today, to a 'client account', on a call you didn't make.").
- Actions: "Do it now in the Larchwick app" (`start_transfer` → `bond_transfer`, target; `cap: engage`, R16) · "Hang up and ring the register's number" (`call_back_known` ★★★; as beat 1's outcome) · "Hang up" → "What now?" (as §6) · report.
- **`bond_transfer` (banking sub-beat, CR-18(e), CR-31 on-call bar; 40 s floor; beat 3 held):** payee typed from the caller's text, "Ellisfen Invest"; IBAN `IE•• … 5521`; €2,000.00. Result **doesn't match** (no holder). Caller line (beat-bound): "The name check is always odd for client accounts, don't worry." Checkables (not in R): `payee.name_check` **R** ("Doesn't match: this account isn't held by Ellisfen Invest.") · `payee.iban` D. Actions: "Send €2,000 anyway" (`pay`, fall, target) · "Cancel, hang up and ring the register's number" (`call_back_known`, ★★ under R16) · "Cancel and report it" (report ★★) · "Cancel" (`ignore` ★★).

**Beat 3, email (`arrives_after: 45`, 40 s, `covered_by: [start, bond_call]`).** From "Fairmeasure Investor Protection" <protection@fairmeasure-claims.example>, subject "Ellisfen Invest bond holders". "We have frozen a fraudulent scheme using Ellisfen Invest's name. If you invested, your funds can be released to you after a €95 verification fee, paid to the account below within 48 hours. If you did not invest, please ignore this email." Bank-details card (CR-22): "Fairmeasure Claims Ltd · IE•• … 0042 · €95.00". `request: pay`; `ask` = "your funds can be released to you after a €95 verification fee"; `claims[0]` = "We have frozen a fraudulent scheme using Ellisfen Invest's name." Written so it reads true whatever the player did at beats 1–2. **Design combination (fraud-researcher):** a fake regulator's recovery fee after a clone-firm approach combines IAF (clone) and RCS (recovery posing as a regulator, BE/DE/IE sources); not a separately sourced sequence, and no debrief presents it as one.
- Checkables (4; R 2): `sender.detail` **R** ("fairmeasure-claims.example, not fairmeasure.example.") · `claim` **D** ("Regulators do warn about clones, so it can't prove anything either way.") · `payee.iban` **D** · `request` **R** (DB6: "A fee to get money back. A real regulator never charges one.").
- Actions: "Pay the €95 now" (`pay`, target, fall) · "Open Fairmeasure's site yourself" (`check_official_list` ★★★; "Fairmeasure's warnings: 'Ellisfen Invest clone. We never charge fees to return money.'") · report (★★) · delete (★★).

**Interrupt** (`after_beat: protection_email`, genuine, `on_fall: skip`; Kettle, Róisín's saved contact): "Dad's signed up for the retraining course! Chips to celebrate? 🍟" Actions: "Reply: on my way!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was Róisín.").

- **Counts:** R = 3 + 2 + 2 = **7**; decoys on scheduled beats 2 + 2 + 2 = 6, plus the sub-beat's no-match and IBAN (not in R). Max 3 × 15 + 6 = **51**. Fall cap (T-2.8).
- **After a fall** (merged, cap 6): `call_bank_known_number` (stop: transfer or fee sent; "ask it to try to stop or recall it") · `stop_paying` (stop) · `block_card_in_bank_app` (stop: "if you typed your card details on the application page") · `report_firm_to_regulator` (report) · harmful `pay_recovery_service` · harmful `add_more_to_test` (beats 1 and 2, feedback override "More money only adds to the loss. Call your bank instead."); the beat-3 fee fall uses harmful `pay_last_fee` instead of `add_more_to_test` (T-3.10 review). `keep_evidence` is named in layer 2. Every fall outcome sets `dublin_bank_called` (story only).
- **Layer 1 (boss and stamp screen, ≈18):** tell **"A copied firm, a pushy call, then a fee to get money back."** · what works **"Use only the register's details. Never pay to get money back."**
- **Layer 2, per beat:** beat 1 "The firm was real; the address wasn't. Contact a firm only on the register's details." · beat 2 "Same story by phone, with the firm's name on screen. The name check didn't match." · beat 3 "A 'regulator' asking for a fee. Real regulators never charge to return money." `already_clicked`: `entered_details` "Typed your card details? Block the card in your banking app and call your bank on the number on your card." · `paid` "Sent money? Call your bank now on the number on your card and ask it to try to stop or recall it. It may be able to help; reporting quickly matters."

### 28.7 Strategy check (as §7.2)
**Assumptions:** CR-17/18/22/23/30/31(b) landed; CR-38 landed or its fallback (no scoring effect). R counts scheduled beats only. Flags on `signup_page`, `case_page`, `task_intro` and `bond_transfer` count toward spotted, not R.
- **Standard fraud:** 8-2 R 2 (19), 8-3 R 2 (19), 8-6 R 2 (19), 8-7 R 2 (19) = **76**. Decoys on scheduled beats: 8-2 3, 8-3 3, 8-6 2, 8-7 3, boss 6 = **17**.
- **Genuine:** 3 × 15 = **45**. Own checkables: 8-1 3, 8-5 6, 8-8 4 = **13**.
- **Boss:** R 7, max **51** (tags capped at +6).
- **Totals:** max = 76 + 45 + 51 = **172**. R = 8 + 7 = **15**: silver needs spotted ≥ ceil(15/3) = **5**, gold ≥ ceil(30/3) = **10**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed on genuine | 76 + 45 + 51 | 172 | 100% | 15 | **Gold** |
| 2 | Ideal + checks 8-5 and 8-8 on the register (in focus) | same | 172 | 100% | 15 | **Gold** |
| 3 | Curious ideal: opens 8-2's sign-up page, then closes it and checks the register | 172 − 5 | 167 | 97.1% | 15 | **Gold** |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | (14+14+14+14) + 45 + (30+6) | 137 | 79.7% | 15 | Silver |
| 5 | Ideal but reports Róisín's real request (8-1) | 172 − 15 − 5 | 152 | 88.4% | 15 | Silver |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 87.2% | 15 − (17 + 13) = −15 | Bronze |
| 6a | Random single tag per beat + always verify (expected) | 150 + 2×(⅖+⅖+½+⅖) + boss 0.15×6 | ≈154 | ≈89.7% | 3.3 − 3.7 − 3 ≈ −3.4 | Bronze (silver unreachable: 7 hits at best, minus 3 genuine tags = 4) |
| 6b | Always tag the link + always verify | 150 + 2 (b1 only; 8-2 and 8-3 void) | 152 | 88.4% | 1 − (2 + 2) = −3 | Bronze |
| 6c | **Always tag the request** + always verify | 150 + 2 (8-3) + 2 (8-7); 8-2, 8-6, boss void | 154 | 89.5% | 4 − (2 + 1 + 3) = −2 | Bronze |
| 6d | Request + every claim + always verify | 150 + 4 (8-3); 8-2, 8-6, 8-7, boss void | 154 | 89.5% | 10 − 10 = 0 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.0% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 (8-1) + 10 + 10 | 90 | 52.3% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 52.3% | 0 | Bronze |
| 11 | **"It's on the register, so it's fine"**: falls for the clone (boss beats 1–2), ideal elsewhere | 172 − 51 + boss (b1 0, b2 0, b3 15, tags +4 (b3's 2 flags), DC 9 = 28) | 149 | 86.6% | 15 − 3 − 2 = 10 | **Silver** (rating < 90) |
| 12 | **"Pays to get money back"**: falls for 8-3 and boss beat 3, ideal elsewhere | 172 − 19 + 9 (8-3); boss b1 15, b2 15, b3 0, tags +6 (5 correct tags earn 10, capped at 6), DC 9 = 45 | 156 | 90.7% | 15 − 2 − 2 = 11 | Gold today; **Silver** under R24 (two falls, §7.3) |

Row notes:
- **6a hit chances:** 8-2 2/5, 8-3 2/5, 8-6 2/4, 8-7 2/5, b1 3/5, b2 2/4, b3 2/4. Expected correct 3.3. The boss bonus survives only if all three beat tags hit (0.6 × 0.5 × 0.5 = 0.15), worth +6 then.
- **6b:** links are decoys on 8-2 and 8-3 and R only on b1; genuine links on 8-5 and 8-8. The two tidy fraud addresses are the sender-or-link decoys doing their job.
- **6c:** the request is R on 8-3, 8-7, b2 and b3, a decoy on 8-2 (sign up), 8-6 (reply) and b1 (apply), and a genuine detail on 8-1, 8-5 and 8-8.
- **6d:** correct = claims 8-2, 8-3, 8-6, 8-7#2, b1, b2#2 (6) + requests 8-3, 8-7, b2, b3 (4) = 10; wrong = 8-2 request, 8-6 request, 8-7 claim#1, b1 request, b2 claim#1, b3 claim (6) + genuine 8-1 request, 8-5 claim and request, 8-8 request (4) = 10. Net 0.
- **Row 11** is the chapter's point: trusting a registered name without using the register's details loses two boss beats and stays silver.
- **Row 12:** two recovery-fee falls, both well recovered, still reach gold (as Warsaw row 11 and Lisbon row 11). Recorded for R15 (`stamps.gold.max_falls` parked); with `max_falls: 1` it would be silver. §28.11 Q3. **Balancing pass (T-3.13):** `max_falls: 1` proposed (R24), so silver (§7.3).
- **Without CR-38:** no scoring change (outcome text carries the result).

### 28.8 Dublin reveal rulings
- **DB1. The register is evidence, never proof alone.** "On the register" reveals always add the clone clause ("contact it only on the register's details"). A firm missing from the warning list is never called safe: "the list only names firms already warned about".
- **DB2. A celebrity in an investment ad is always R.** Wording: "often fake, sometimes made with AI, and the person never agreed". Never "this is a deepfake" as a certainty; never how it was made.
- **DB3. Dashboards and balances are never proof.** Any growing number: "A dashboard shows whatever the website wants it to show." Never R on its own, never "It fits".
- **DB4. "Regulated", firm numbers, tidy sites and local numbers are decoys** ("can't prove anything either way"); clones copy them.
- **DB5. Refunds are always "may".** For a payment you made yourself: "Call your bank straight away; it may be able to help." Never "your bank will refund you". No figures on screen.
- **DB6. Any fee to get money out or back is R**, and the layer-2 line is RCS §4's ("almost certainly running a second scam"). Never "all recovery firms are scams" beyond "anyone who contacts you … for a fee".

### 28.9 Dublin change request (to `frontend-engineer`)
- **CR-38 (non-blocker): the Fairmeasure regulator view.** A home-screen tool in every chapter (arc slot 5 can land anywhere): title "Fairmeasure", two tabs, "Register of authorised firms" and "Warning list". `check_official_list` outcomes may name a result card: `register: { firm, result: authorised | not_listed | warning_list, address?, phone? }` (address and phone only for `authorised`, taken from brands.yaml, phone masked). The card is read-only; no free-text search box (no input to mistype). One-time coach mark on first use (§28.5). Text alternative: the card as a list. Fallback: the outcome narrative states the result.
- Uses CR-17/30 (`ask`, claims), CR-18(e) and CR-31/31(b) (boss beat 2, R16), CR-19 (8-6), CR-22 (boss beat 3's bank-details card), CR-23 (8-1 match, boss no-match). The `social` device for 8-2 (existing, with `image`).

### 28.10 New brands, cast, content
**Brand proposals** (fictional; ux-artist registers them in `brands.yaml`; fraud-researcher runs BRAND_CHECK against real people, regulators, platforms and firms before use; lists of real names stay in BRAND_CHECK.md, not here):
- **Fairmeasure** (genuine; the in-world financial regulator, used in every chapter by CR-38): `fairmeasure.example` (paths `/register`, `/warnings`). Look-alike (scam-only): `fairmeasure-claims.example` (boss beat 3). Never styled like any real regulator or EU body. Alternatives "Truebalance", "Steadweight".
- **Orla Fennick** (a fictional TV presenter; scam prop only; always illustrated, never photo-realistic, no likeness of a real person). Renamed after BRAND_CHECK DS2; her ad page is "Money Today with Orla" (DS12; spare "The Savings Hour with Orla").
- **Postwick** (a fictional social network; genuine platform, where scam ads appear): `postwick.example`. Renamed after BRAND_CHECK DS3; spare "Chatterbrook". Reusable in later chapters (Brussels' DM).
- **Quorvex** ("Quorvex Invest" / "Quorvex Wealth"; scam-only trading platform): `quorvex-invest.example`. Alternatives "Brivantis", "Zentrallo".
- **Glimmerfund** (scam-only; Alex's platform, arc slots 5–9 only): `glimmerfund.example`. Alternatives "Ashlight Trade", "Brightmoor Yield". Must not appear in any chapter scenario.
- **Ellisfen Invest** (genuine, authorised in-world firm; the clone's target): `ellisfen.example`. Look-alike (scam-only): `ellisfen-invest.example`. Renamed after BRAND_CHECK DS6.
- **Brindlecove Bonds** (scam-only; drill 8-4, named on Fairmeasure's warning list). Replaced after BRAND_CHECK DS10.
- **Backhaven Recovery** (scam-only "recovery agency"; reusable by Brussels' ending C): `backhaven-recovery.example`. Alternatives "Retrievo Partners", "Reclaimly".
- **Reused:** Larchwick, Kettle, Tallyfern (Amsterdam's task platform, as the 8-6 callback).
- **Account holders and scam-side names (name register):** "Ciarán (Quorvex Wealth)", "Gráinne (Ellisfen clone)", "Aisling · Tallyfern", "Fairmeasure Claims Ltd" (payee), "Money Today with Orla" (ad page), "Brindlecove Bonds" (drill; warning list), "State-backed savings bond" (drill; not on the register). Never cast.
- **Cast (`content/cast.yaml`):** `declan` "Declan Byrne", role "Made redundant after 22 years, planning what's next (Dublin)", known channel "Saved contact: Declan (clinic)"; `roisin` "Róisín Byrne", role "Declan's daughter, first year at college (Dublin)", known channel "Saved contact: Róisín (clinic)". Both already in STORY §2.3.
- **Recovery steps (new):** `report_firm_to_regulator` ("Report the firm to the financial regulator") · `report_ad_on_platform` ("Report the ad on the social network") · `block_adviser_number` ("Block the 'adviser's' number and don't take their calls") · harmful `add_more_to_test` ("Add a bit more to see if the gains are real"; feedback "Wanting proof is natural, but more money only adds to the loss. The gains on screen were never real. Call your bank instead."). Reused: `stop_paying`, `pay_recovery_service`, `pay_last_fee`, `keep_evidence`, `block_card_in_bank_app`, `call_bank_known_number`, `report_to_police_online`, `change_password`, `wait_and_see`.
- **Habit cards:**
  - **New `if-its-guaranteed-and-high-its-not` (LO-13).** Title "If it's guaranteed and high, it's not" (review round 1: real guaranteed savings exist; the tell is a high return sold as a sure thing). Habit: "Before you pay, look the firm up yourself on the regulator's register, and contact it only through the details the register gives. Not on the register? Don't pay, even if the warning list is clean. If you're asked to pay to get your money out, or back: stop." Example: "A famous face recommends a platform in an ad? Find the firm on the register yourself. Not there? Don't pay." Already clicked: "Paid already? Stop paying, call your bank now on the number on your card, keep the chats, and report the firm. Ignore anyone who offers to get it back for a fee."
  - `stop-the-damage-first`, `easy-money-costs-you`, `calm-not-paranoid`: bodies unchanged (shared). Dublin's sentence "Never pay to get money back" lives in layer 2.
- **Atlas page:** `atlas_cards: [if-its-guaranteed-and-high-its-not, stop-the-damage-first, ask-someone]` (STORY §3.8).
- **"Where to report and get help" (Ireland) card:** wording in `docs/patterns/ch8-dublin-sources.md` ("Ireland help card"), in the WHERE_TO_REPORT §3c order, crisis row last and on its own. Linked from layer 2 of every Dublin debrief.
- **Chapter file:** `content/chapters/dublin.yaml`: slot 8; `patterns: [investment-ad-fake-platform, recovery-scam]`; `callbacks: [task-job-scam]`; am `[arc, 01, 02, 03]` (stop point after 03), pm `[04, 05, 06, 07, 08, 09]`; `boss: dublin-09-boss-clone-bond`; intro and rules as §28.1; `content_note` as §28.2; `scenes: { arrival: dublin-arrival, turn: dublin-turn, resolution: dublin-resolution }`.

### 28.11 Open questions for the producer (Dublin)
1. **Arc beat first in the morning** (before 8-1), because every other gap neighbours an investment, recovery or easy-money debrief. **Answered (producer): accepted.** Engine-ticket note: the engine must allow the arc as the first beat after the intro (chapter file am `[arc, 01, 02, 03]`).
2. **LO-13 wording.** **Answered (producer): register-first approved.** LEARNING_OBJECTIVES.md LO-13 updated (v3.1): "Checks an investment firm on the regulator's register (and warning list), contacts it only through the register's details, and rejects high returns sold as guaranteed, celebrity endorsements and fee-charging 'recovery' services. Never treats 'not on the warning list' as safe."
3. **Row 12** (two recovery-fee falls still gold), together with Stockholm row 12 and Warsaw/Lisbon rows 11. **Answered (producer): decided at the balancing pass (R15);** the learning-psychologist supports `stamps.gold.max_falls: 1`. Rows 12 stay as R15 input.
4. **Brand names.** **Answered (BRAND_CHECK DS1–DS12, review round 1):** keep Fairmeasure, Quorvex, Glimmerfund, Backhaven Recovery, Fairmeasure Claims Ltd; renamed to **Orla Fennick** (ad page "Money Today with Orla"), **Postwick**, **Ellisfen Invest** (`ellisfen.example`, clone `ellisfen-invest.example`) and **Brindlecove Bonds**.
5. **Content note.** **Answered (producer): add one** (wording in §28.2). No scene is sensitive.
6. **For fraud-researcher:** (a) 8-3, a cold recovery offer to someone who may not have lost money ("Lost money to …?"); RCS describes offers to victims and agents for several victims; (b) 8-6, a task-job approach that names a public event; (c) boss beat 3, a fake regulator's fee after a clone approach (labelled a design combination); (d) 8-7's "don't tell your bank" (IAF §3.8 secrecy) and "they hate competition"; (e) arc slot 7's withdrawal fee (Medium for Ireland, rests on BE/DE/SE; the arc is city-agnostic); (f) amounts €10, €150, €250, €400, €40, €90, €2,000, €95 (illustrative, never typical).
7. **For learning-psychologist:** 8-5's genuine twin is an investment firm's information sheet. The proceed action is "Reply: thanks, I'll read it", never "invest"; confirm this models calm checking without nudging anyone to invest.

## 29. Chapter 9 — Stockholm
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/e-id-approval-on-call.md` (EID) and `docs/patterns/remote-access-support-call.md` (RAS, preview scope); callbacks `multichannel-support-callback.md` (MSC) and `spoofed-authority-call.md` (SAC). Per-beat sources and their limits: `docs/patterns/ch9-stockholm-sources.md`. No source ids and no real body or product names inline (the real e-ID product is never named). Replaces the §18 Stockholm summary. Stockholm adds **CR-39** (§29.9).

### 29.1 Goal, shape, rules check
- **The chapter habit (H):** **"Never approve a sign-in, signature or QR login you didn't start. Whoever is on the phone, hang up and call your bank on the number on your card or in its app."** (EID §4.) Short form for layer 1: "Approve only what you started."
- **"Started it yourself" means** (EID §4): you opened the site or app, you chose what to do, and the request names that.
- **What the chapter teaches, in order of weight:**
  1. Someone who contacted you and wants you to identify yourself, log in, sign or scan with your e-ID is the tell, whoever they say they are (EID §3.1, §3.5).
  2. **Read the prompt, not the caller.** When the caller says "cancel" and Gatewren says "log in" or "sign a payment", believe the prompt (EID §3.4).
  3. **A login QR code sent to you starts someone else's login**, even though it opens the real Gatewren. Scan login codes only on a screen you opened yourself (EID §4; Medium).
  4. **Nobody needs your screen** (preview): never install an app or share your screen for someone who contacted you (RAS §4).
  5. Calibration: three Gatewren requests the player started (a work sign-in, a payment to Birgitta, a login on Birgitta's laptop) are normal; approving is right.
- **Shape:** slot 9, difficulty 3–5, boss 5. Timers 35 s (slot 9), call beats 30 s, boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus drill 9-4 (Jamal) and the arc beat. Estimated 15–17 min including scenes.
- **New patterns (2):** `e-id-approval-on-call` (9-1, 9-3, 9-7 twins; 9-5, 9-6, boss), `remote-access-support-call` (9-8, preview). **Callbacks (2):** `multichannel-support-callback` (9-2, a text giving a number to call), `spoofed-authority-call` (drill 9-4, boss beat 1: "police").
- **LO focus:** LO-09 (core), LO-08 (core), LO-15 (preview), LO-02 (QR), LO-04, LO-18 (drill, Birgitta), LO-16, LO-17, LO-14 (arc).
- **Flavour:** Swedish in-world text (`lang="sv"`, inline translation, never a red flag) in texts, call openings and small talk; amounts in kronor; fika, a snowy courtyard, Jamal's lab know-how, Lina translating. Birgitta's "dare to be rude, hang up" reflects public police campaign guidance (EID §4). A city is a stage, not a claim: no debrief says a scam "is Swedish".
- **Premise and intro** (CR-27, ≤ 20 s): "Stockholm: you're staying in Birgitta's spare room. Her new neighbour Jamal moved here three weeks ago for a hospital job, with his daughter Lina: new flat, new bank, new e-ID."
- **Rules card** (CR-27), title **"Birgitta's rules"**, two items: "If someone contacted you, don't log in, sign or scan for them. Hang up: rudeness is free." · "Approve only what you started: you opened it, you chose it, and the request names it." General rules, never wrong on the genuine twins (all three are started by the player).
- **Never on screen:** how a session is captured or a QR is relayed (EID §9, Red Lines 2 and 4); real e-ID or remote-access product names or icons; home visits or card pick-ups (Red Line 8); figures; refunds as certain.

**Mix rules:**
- **Genuine** 3/8 ✓. **Truth order:** G F G · F F G F F(boss); max run 2 ✓.
- **Themes:** `work` 1 (9-1), `bank` 3 (9-2, 9-5, 9-7), `home` 1 (9-3), `marketplace` 1 (9-6), `support` 1 (9-8), `authority` 1 (boss). Max 3/8 ✓. Scored order work, bank, home, bank, marketplace, bank, support, authority: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 (9-1 and 9-3 honest timers) = 66.7%; fraud 4/5 (9-2, 9-5, 9-8, boss) = 80%; gap 13.3 ✓. 9-6 and 9-7 are calm.
- **Difficulty parity:** genuine at 3 (9-1), 4 (9-3), 5 (9-7); fraud at 3 (9-2), 4 (9-5, 9-6), 5 (9-8, boss) ✓.
- **Decoys and sender-or-link:** ≥ 2 on every fraud; F = 5 needs 2: 9-2's "Larchwick" sender, 9-5's and 9-8's caller IDs, boss beats 1–2 ✓.
- **Interrupts:** 9-3 Lina, 9-5 Birgitta, 9-6 Jamal, 9-7 Noor, 9-8 Lina (after "What now?"), boss Birgitta after beat 3.
- **Off-focus genuine:** none (all three genuine scenarios are e-ID twins, in focus).
- **Red Line 8:** calls, texts, chats, Gatewren prompts and a browser page only.

### 29.2 Story beats (track S)
STORY §3.9, updated with this spec. No panel shows a prompt, a caller, a number, a QR code or a screen. Jamal's near-miss is the drill (he hangs up in every branch); nobody in a scene falls.
1. **Arrival** (before 9-1; 3 panels; calm). A snowy courtyard, warm windows. Birgitta (laughing): "Adaeze's inspector! Fika first, questions after." Jamal (thinking): "New flat, new bank, new e-ID app. My head is full." Lina (laughing): "I translate. Dad pays me in cinnamon buns." Cast: Birgitta, Jamal, Lina.
2. **Turn** (stop point, after 9-3; 4 panels; laughing → thinking). Birgitta (laughing): "My rule: if a caller wants me to log in, I'm rude. I hang up. Rudeness is free." Jamal (worried): "Everything's new here. I want to be polite." Birgitta (calm): "Be polite to people. Hang up on requests." Jamal (thinking): "At the lab we never sign for a sample we didn't order. Same idea, I suppose." Drill 9-4 follows directly.
3. **Resolution** (after the boss debrief; 2 panels + If-then; proud).
   - **Variant `stockholm_bank_called`** (story-only, set by every boss fall outcome): when set, it is the **first panel**, Birgitta (calm): "The bank was called straight away, the right first step. We'll see what it can do." No refund promise.
   - Jamal (proud): "A 'police officer' wanted my e-ID. I hung up, like Birgitta." (True in every drill branch.)
   - Lina (laughing): "Dad hangs up on requests now. Politely."
   - **If-then panel (Jamal), word for word from STORY §3.9:** "If a login or signing request pops up that I didn't start, then I deny it and call the bank on its own number." Extra line under it: "Nobody needs your screen, either."
- **Map invitation (Birgitta):** "My new neighbour has a new everything. Come and help, and I'll make fika." (STORY §3.9.)
- **Panels:** 3 + 4 + 3 = 10 (+1 with the variant).
- **Safety:** an older woman teaches a younger man, who brings his own professional know-how; being new is the risk, not ability. Lina is 12 and never handles money or e-ID.

### 29.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 9-1 | AM | You open Waymarker Desk and tap "Log in with Gatewren". Gatewren: "Log in to Waymarker Desk · This phone · Stockholm · Just now" | auth | genuine / high | 3 | honest timer 35 | work | LO-09, LO-17 |
| 9-2 | AM | SMS "Larchwick": "A card payment of 4 890 kr is pending. Not you? Call our security team now on 08-••• •• 41." | sms → call → auth | fraud (MSC, EID A) | 3 | timer 35 + pusher | bank | LO-08, LO-09, LO-03 |
| 9-3 | AM | You pay Birgitta back 236 kr for the fika shopping in the Larchwick app. Gatewren: "Sign: pay 236 kr to Birgitta Lind" | auth | genuine / high | 4 | honest timer 35; interrupt | home | LO-09, LO-17 |
| | | *Stop point + turn* | | | | | | |
| 9-4 | PM | **Drill: Jamal's "police" call.** "He says someone used my identity and I must identify myself with Gatewren. Is this normal here?" | messenger | drill | 3 | — | — | LO-09, LO-18 |
| 9-5 | PM | Call, caller ID "Larchwick Bank": "Someone is taking out a loan in your name. Open Gatewren and log in so we can stop it." Gatewren shows a login from another computer and city | call → auth | fraud (EID A) | 4 | call 30 s; interrupt | bank | LO-09, LO-08 |
| 9-6 | PM | Kettle, new number: "Is your bike lamp still for sale? 🙂 … Before I pay, please confirm you're the seller: scan this with Gatewren." (QR → gatewren.example) | messenger (QR) → auth | fraud (EID B, Medium) | 4 | — (calm); interrupt | marketplace | LO-09, LO-02 |
| *arc* | PM | Arc slot N (default: slot 9) | messenger | arc | — | — | — | LO-14 |
| 9-7 | PM | Your phone's at 3%, so you borrow Birgitta's laptop. You opened larchwick-bank.example yourself and chose "Log in with Gatewren": the page shows a code to scan | browser (QR) | genuine / low (twin of 9-6, boss beat 3) | 5 | — (calm); interrupt | bank | LO-09, LO-02, LO-17 |
| 9-8 | PM | Call, caller ID "Gatewren Support": "Your Gatewren was used on another device. Install Kindhand Support and read me the code it shows." | call | fraud (RAS preview) | 5 | call 30 s; interrupt after "What now?" | support | LO-15, LO-08 |
| 9-9 **Boss** | PM | The case file. Beat 1 (call, "Police"): "Identify yourself with Gatewren … Don't call your bank." Beat 2 (call, "Larchwick Bank"): "Gatewren will ask you to sign. It moves nothing out of your name." (banner: "Sign: pay 48 000 kr to Skarvlund Trygg AB"). Beat 3 (Kettle, "Inspector Holm"): "Scan this with Gatewren to confirm your statement." | call → call → messenger (QR) | fraud (EID A, B; SAC) | 5 | boss call 30 / 40 s + pusher; interrupt after beat 3 | authority | LO-09, LO-08, LO-02, LO-16 |

**Arc placement.** Between 9-6 and 9-7: neither neighbour's debrief mentions friends, money to people, platforms or deadlines (9-6 is a stranger and a QR code; 9-7 a login on a borrowed laptop). Not next to the drill.

### 29.4 Scenario specs
Shared rules as §24.4. Swedish numbers masked `08-••• •• NN` (landline) and `+46 7•• ••• •NN` (mobile); amounts in kr; IBANs `SE•• … NNNN`, checksum-invalid. Every scored scheduled beat on a CR-30 device has an `ask`. **Auth prompts** (`device: auth`, `prompt: { type, service, where, device, when }`) carry an `ask` (the prompt's own line, request `approve`) so the `request` checkable appears on genuine and fraud prompts alike (§29.7 row 6c). Reveals follow SK1–SK6 (§29.8). `tell_trusted_adult` is `stop` in every personal-money fall.

**9-1 `stockholm-01-desk-login`** · genuine, high · auth · diff 3 · honest timer 35, `honest_deadline` "Gatewren requests expire after 3 minutes" · Gatewren, Waymarker Desk · you started it · `pattern: e-id-approval-on-call` (in-focus twin of 9-5)
- **Setup:** "You open Waymarker Desk from your home screen to file your Stockholm travel claim, and tap 'Log in with Gatewren'."
- **Message (auth):** `prompt: { type: sign_in, service: "Waymarker Desk", where: "Stockholm, Sweden", device: "This phone", when: "Just now" }`. Body: "Log in to Waymarker Desk?" `request: approve`; `ask` = "Log in to Waymarker Desk?".
- **Checkables (G, 5):** `prompt.service` (SK2: "It fits: Waymarker Desk, the site you just opened yourself. That isn't proof on its own, so weigh it with what you started.") · `prompt.where` ("It fits: here, in Stockholm.") · `prompt.device` ("It fits: this phone.") · `prompt.when` (neutral: "'Just now'. Every request says that, so it can't prove anything either way.") · `request` ("A login you started, to the site you opened. Approving is right.").
- **Actions:** "Approve" (`proceed`, target ★★★; §6: anything the player started) · "Check the Waymarker Desk page first" (`verify_in_app` ★★★, in focus; "The page says 'Waiting for Gatewren'. You approve.") · report (0, −5) · "Deny it" (`deny_prompt`, dismiss on genuine high, 0; "You try again later; the claim waits a day.").
- **Debrief L1 (genuine):** tell "You opened it, you chose to log in, and the request names it." · what works "Approving was right." Layer 2: "That's what 'started it yourself' means. Hold on to it: every fake this week starts somewhere else." Habit card `only-approve-what-you-started` (new, §29.10).

**9-2 `stockholm-02-pending-payment`** · fraud (MSC callback, EID A) · sms → call → auth · diff 3 · timer 35; pusher at 18 s (same thread): "Betalningen genomförs om 10 minuter." ("The payment goes through in 10 minutes.") · levers fear, urgency, authority · Larchwick (named)
- **Message (sms, sender "Larchwick", new thread):** Swedish with translation: "Larchwick: Ett kortköp på 4 890 kr väntar. Inte du? Ring vår säkerhetsavdelning nu på 08-••• •• 41." ("Larchwick: A card payment of 4 890 kr is pending. Not you? Call our security team now on 08-••• •• 41.") `request: call`; `ask` = "Ring vår säkerhetsavdelning nu på 08-••• •• 41" (translation "Call our security team now on 08-••• •• 41"); `references: ["Ett kortköp på 4 890 kr"]`; `phone_numbers: ["08-••• •• 41"]`.
- **Checkables (4; R 2):** `sender.detail` **D** ("Shows 'Larchwick'. Anyone can set a sender name, so it can't prove anything either way.") · `reference` **D** ("An amount. Real or invented, your app would show it, so it can't prove anything either way.") · `phone_number` **R** ("A number in a text, not the one on your card or in your app.") · `request` **R** ("Call a number from a text about a payment. Open the Larchwick app yourself instead.").
- **Actions:** "Call the number" (`call_number_in_message` → `security_line`, target) · "Open the Larchwick app yourself" (`verify_in_app` ★★★; "No pending payment. Nothing to stop.") · report (★★) · delete (★★).
- **`security_line` (call you placed, 30 s; not in R):** display "08-••• •• 41", detail "The number from the text". Transcript: "Larchwick security, this is Erik." · "I can stop the payment. First I need to verify you: open Gatewren and identify yourself." (`ask`, request `approve`) · "It only takes a second." Checkables: `request` R ("Identify yourself with Gatewren for someone on the phone. That is how someone else logs in."). Actions: "Open Gatewren as he asks" (`reply` → `security_prompt`) · "Hang up" → "What now?": "Call the number on your card" (verify, ★★ engage cap) · report · "Leave it there".
- **`security_prompt` (auth; CR-39(a) on-call bar):** `prompt: { type: sign_in, service: "Larchwick internet bank", where: "Malmö, Sweden", device: "Windows computer", when: "Just now" }`. Checkables: `prompt.where` R ("Malmö: not where you are.") · `prompt.device` R ("A Windows computer: not your phone.") · `prompt.service` D · `prompt.when` D. Actions: "Approve" (`approve_prompt`, fall) · "Deny" (`deny_prompt`, ★★ cap) · "Deny, hang up and call the number on your card" (`call_back_known`, ★★ cap).
- **Fall:** narrative "Gatewren: 'Logged in.' Erik thanks you. Ten minutes later your Larchwick app shows a new payee, then a payment you didn't make." Damage control (6, 2 harmful): `call_bank_known_number` (stop: "any time, day or night") · `tell_trusted_adult` (stop) · `keep_call_evidence` (secure: "the text, the number, the name he gave") · `report_to_police` (report) · harmful `approve_again_to_cancel` (new) · harmful `call_back_text_number` (Madrid's step: "Call the number from the text again and ask them to send it back"; the player dialled the number from the text).
- **Debrief L1 (≈15):** tell "A text with a number to call about a payment." · what works "Open your bank app yourself." Layer 2: "On that call, they'd ask you to identify yourself with Gatewren. Never do that for someone who contacted you." · `already_clicked.shared_code` (approve): "Approved it? Call your bank now on the number on your card. Banks answer day and night." Habit card `hang-up-call-back`.

**9-3 `stockholm-03-birgitta-shopping`** · genuine, high · auth · diff 4 · honest timer 35, `honest_deadline` "Gatewren requests expire after 3 minutes" · Gatewren, Larchwick · cast Birgitta · you started it · **Interrupt** at 14 s, Lina: "Dad burnt the kanelbullar 😭 Birgitta says they're 'rustic'"
- **Setup:** "Birgitta bought the fika shopping. In the Larchwick app you opened, you've typed in her saved account to pay her back 236 kr, and tapped Pay."
- **Message (auth):** `prompt: { type: signature, service: "Larchwick: pay 236 kr to Birgitta Lind", where: "Stockholm, Sweden", device: "This phone", when: "Just now" }`. Body: "Sign the payment?" `request: approve`; `ask` = "Sign the payment?".
- **Checkables (G, 5):** `prompt.service` ("It fits: the payment you just made, to Birgitta, the amount you typed. That isn't proof on its own, so weigh it with what you started.") · `prompt.where` ("It fits.") · `prompt.device` ("It fits: this phone.") · `prompt.when` (neutral) · `request` ("A signature for the payment you just made. Signing is right.").
- **Actions:** "Sign it" (`proceed`, target ★★★) · "Check the payment in the Larchwick app first" (`verify_in_app` ★★★) · report (0, −5) · "Deny it" (`deny_prompt`, 0; "Birgitta: 'No rush, dear. But the cardamom was expensive.'").
- **Debrief L1 (genuine):** tell "Your payment, your amount, signed on your phone." · what works "Signing was right." Layer 2: "Read what you sign: who gets the money and how much. Here it matched what you did." Habit card `calm-not-paranoid`.

**9-4 `stockholm-04-jamal-police-call`** (drill, unscored) · messenger · cast Jamal, Birgitta · `pattern: e-id-approval-on-call`
- **Message:** Jamal's saved contact "Jamal (downstairs)": "A 'police officer' just called. He said someone used my identity, and I must identify myself with Gatewren so they can protect me. He's calling back in 5 minutes. Is this normal in Sweden?"
- **Picks** (each gets a Jamal reply; no stars):
  - "No. The police never call and ask you to identify yourself with your e-ID. Hang up and call them yourself on 114 14." (`proceed`; SK6) → "He called back. I said I'd call the police myself, and hung up. Rudeness is free!" (S-M1: Jamal hangs up himself in every branch, so his resolution line is true.)
  - "Ask him for his badge number first." (`proceed`) → "He gave one instantly. Birgitta says a number on the phone proves nothing. I hung up."
  - "Ask Birgitta: she knows how things work here." (`proceed`) → "She came down in her slippers and said 'Lägg på!' (Hang up!). So I did."
  - "Do it, so they can protect you." (`reply`) → "Birgitta just shouted 'Lägg på!' from upstairs. So I hung up." (Gentle; Jamal hangs up in every branch.)
- **Debrief (drill):** tell "'Police' asking you to identify yourself with your e-ID." · what works "Hang up. Police never call to ask for it." Layer 2: "Police never call and ask you to identify yourself with your e-ID. Whoever it is, hang up and call the police or your bank yourself." (EID §3.5, SK6) Habit card `only-approve-what-you-started`.

**9-5 `stockholm-05-loan-call`** · fraud (EID A core) · call → auth · diff 4 · call 30 s; pusher at 16 s (caller): "Are you still there? It's going through." · levers fear, authority, urgency · Larchwick · **Interrupt** at 10 s, Birgitta (knock, genuine): "Fika in ten!"
- **Message (incoming call):** caller ID "Larchwick Bank" (detail "08-••• •• 00 · Not a saved contact"). Transcript:
  1. "Hej, Larchwick security. Someone is taking out a loan in your name right now." (`claims[0]`)
  2. "To stop it, open Gatewren and log in, so we can see it's you and block the loan." (`ask`)
  3. "Stay on the line; it's urgent." (`claims[1]`)
  `request: approve`.
- **Checkables (4; R 2):** `caller_id` **D** (SK1: "Shows Larchwick Bank. A caller can set the name and number on your screen, so it can't prove anything either way.") · `claim` **D** ("Loan fraud is real, so it can't prove anything either way. Your app would show it.") · `claim#2` **R** ("Keeps you on the line so you can't check.") · `request` **R** ("Log in with Gatewren for a caller. Real banks never call and ask you to log in.").
- **Actions:** "Open Gatewren as they ask" (`reply` → `loan_prompt`, target) · "Hang up and call the number on your card" (`call_back_known` ★★★; "Larchwick: 'No loan, and we'd never ask you to log in on a call.'") · "Hang up" → "What now?" (as §6) · report.
- **`loan_prompt` (auth; CR-39(a) on-call bar; caller line, beat-bound: "Just tap Approve, then it's blocked."):** `prompt: { type: sign_in, service: "Larchwick internet bank", where: "Göteborg, Sweden", device: "Windows computer", when: "Just now" }`. Checkables (not in R): `prompt.where` R · `prompt.device` R · `prompt.service` D ("Your bank, as the caller said. The name is right; it's still a login you didn't start.") · `prompt.when` D. Actions: "Approve" (`approve_prompt`, fall) · "Deny" (`deny_prompt` ★★ cap) · "Deny, hang up and call the number on your card" (`call_back_known` ★★ cap).
- **Fall** narrative: "Gatewren: 'Logged in.' The caller thanks you warmly and hangs up. Ten minutes later a new payee appears in your Larchwick app." Damage control as 9-2, except the second harmful step is `call_back_caller_number` (an incoming call, not a number from a text).
- **Debrief L1 (≈17):** tell "A caller asking you to log in, then a login you didn't start." · what works "Deny it. Hang up and call the number on your card." Layer 2: "Read the prompt, not the caller: it was a login you didn't start." · "It's fine to hang up. Rudeness is free." (SK5) *(Where and device stay game clues on the prompt only, never the lesson; SK2.)* Habit card `only-approve-what-you-started`.

**9-6 `stockholm-06-buyer-qr`** · fraud (EID B; **Medium**: EU-level sources only) · messenger with QR (CR-39(b)) → auth · diff 4 · calm (no timer) · levers helpfulness, greed (small) · Kettle, Swaploft (claimed), Gatewren · **Interrupt** at 15 s, Jamal: "Lina says thank you for the maths help. I say thank you for the patience."
- **Message:** Kettle, new contact (CR-19) "+46 7•• ••• •19". "Hej! Is your bike lamp still for sale? 🙂 It's for my son's bike. Before I pay, please confirm you're the seller: scan this with Gatewren. Then I'll send the money straight away." QR: `qr: { payload: /qr/stockholm-buyer-login, destination: gatewren.example }`. `request: scan_qr` (no `ask`: CR-30 excludes `scan_qr`); `claims[0]` = "Then I'll send the money straight away."; `claims[1]` = "please confirm you're the seller: scan this with Gatewren."; `references: ["your bike lamp"]`. *(Opener per the producer's Stockholm Q2 ruling: a question from a would-be buyer who hasn't paid, a seller "check" and a QR code, unlike Warsaw 5-3's "I've paid already, collect your payment here" link.)*
- **Checkables (5; R 2):** `sender.detail` **R** ("Not in your contacts, writing about your listing outside Swaploft.") · `reference` **D** ("Names your real listing. It's public, so it can't prove anything either way.") · `qr.destination` **D** (SK3: "gatewren.example: it opens Gatewren itself. That's why it's dangerous: a login code made for someone else's login. The address can't help you here.") · `claim` **D** ("A promise to pay. If money comes, it shows in your Swaploft sales, so it can't prove anything either way.") · `claim#2` **R** ("Nobody needs your e-ID to buy from you. A login code sent to you starts someone else's login.").
- **Actions:** "Scan it with Gatewren" (`scan_qr_and_open` → `buyer_prompt`, target) · "Open your Swaploft listing yourself" (`check_with_platform` ★★★; "Your lamp is still listed. No message from a buyer in Swaploft, and Swaploft never asks sellers to scan anything.") · "Block and report the number" (`block` ★★) · "Ignore it" (★★).
- **`buyer_prompt` (auth):** `prompt: { type: qr_login, service: "Larchwick internet bank", where: "Uppsala, Sweden", device: "Windows computer", when: "Just now" }`. Checkables (not in R): `prompt.service` R ("Log in to your bank, not 'confirm the seller'.") · `prompt.device` R · `prompt.where` D · `prompt.when` D. Actions: "Approve" (`approve_prompt`, fall) · "Deny" (★★ cap) · "Deny and open Swaploft yourself" (`check_with_platform` ★★ cap).
- **Fall:** narrative "Gatewren: 'Logged in.' The buyer stops replying. That evening Larchwick texts: a new device was added to your internet bank." Damage control as 9-2, with `keep_evidence` instead of `keep_call_evidence` ("the chat and the number") and harmful `wait_and_see` instead of `call_back_text_number` (no number was called).
- **Debrief L1 (≈16):** tell "A login code sent to you, to 'confirm' you're the seller." · what works "Scan login codes only on a screen you opened yourself." Layer 2: "A QR code can open the real app and still be a trap: this one started someone else's login." Habit card `only-approve-what-you-started`.

**9-7 `stockholm-07-laptop-login`** · genuine, low · browser (QR) · diff 5 · calm (no timer) · `pattern: e-id-approval-on-call` (in-focus twin of 9-6 and boss beat 3) · Larchwick, Gatewren · cast Birgitta (lends the laptop; not in the beat) · you started it · **Interrupt** at 15 s, Noor: "is it true swedes have a word for coffee break. asking for Grandad"
- **Setup:** "Your phone's at 3%, so you borrow Birgitta's laptop to pay your phone bill. You opened larchwick-bank.example yourself and chose 'Log in with Gatewren'." *(Moved off a library computer in review round 1. The fraud prompts' "Windows computer" stays a clue: this genuine prompt reads "Laptop · Stockholm".)*
- **Message (browser):** `page: { address: larchwick-bank.example/login, info: "Log in with Gatewren: scan the code with your app" }`; QR `qr: { payload: /qr/stockholm-laptop-login, destination: gatewren.example }`. `request: scan_qr`.
- **Checkables (G, 3):** `page.address` ("It fits: larchwick-bank.example, which you typed yourself.") · `page.info` (neutral) · `qr.destination` (SK3: "It fits: gatewren.example, on a screen you opened yourself, for a login you chose. That's the difference from a code someone sends you.").
- **Actions:** "Scan it with Gatewren and approve" (`proceed`, target ★★★; "Gatewren: 'Log in to Larchwick internet bank · Laptop · Stockholm.' That's you, on Birgitta's laptop. You approve, pay your phone bill, and log out.") · "Charge your phone and use the Larchwick app instead" (`verify_in_app` ★★★, in focus) · report (0, −5) · "Close the page" (`ignore` ★★).
- **Debrief L1 (genuine):** tell "A code on a screen you opened, for a login you chose." · what works "Scanning that was fine." Layer 2: "Same kind of code as the 'buyer's'. The difference is who started it. Log out when you finish on someone else's computer." Habit card `calm-not-paranoid`.

**9-8 `stockholm-08-support-call`** · fraud (RAS preview; LO-15) · call · diff 5 · call 30 s; pusher at 18 s (caller): "Have you found it in the store?" · levers fear, helpfulness, authority · Gatewren (claimed), Kindhand (scam prop) · **Interrupt** (`after_what_now`, genuine), Lina: "Can you check my Swedish homework? Dad says his grammar is 'experimental'."
- **Message (incoming call):** caller ID "Gatewren Support" (detail "08-••• •• 12 · Not a saved contact"). Transcript:
  1. "Hi, Gatewren Support. Your Gatewren was just used on another device." (`claims[0]`)
  2. "I can check your settings for you. Install Kindhand Support from your app store and read me the code it shows." (`ask`)
  `request: install`; `ask` per CR-30 is not used for `install` (CR-30 excludes `install`), so the request checkable is authored as `claims[1]` = the same sentence.
- **Checkables (3; R 1; difficulty 5: the main tell is the request):** `caller_id` **D** (SK1) · `claim` **D** ("Accounts are misused, so it can't prove anything either way. Your Gatewren app would show your devices.") · `claim#2` **R** (RAS §3.1: "An app so a stranger can see your screen, and a code to let them in. Nobody needs your screen.").
- **Actions:** "Install it and read out the code" (`install_or_remote`, target, fall) · "Hang up and open Gatewren yourself" (`verify_in_app` ★★★; "Your devices: just this phone. Nothing used anywhere else.") · "Hang up" → "What now?" (as §6) · report.
- **Fall (stops at the request; RAS §6):** narrative "You install it and read out the code. A banner says 'Someone is viewing your screen.' 'Now open your bank app so I can check it,' he says. You stop and hang up. The app is still on your phone." (S-S1: the damage control starts from there.) Damage control (6, 2 harmful): `go_offline` (stop, new) · `call_bank_known_number` (stop: "from another phone if you can") · `tell_trusted_adult` (stop) · `change_password` (secure: "from another device") · harmful `let_caller_finish` (new) · harmful `wait_and_see`. (`get_device_checked` (new) is named in `already_clicked` and on the card; it left the list for `tell_trusted_adult`, producer ruling at the T-3.11 review, 2026-11-19.)
- **Debrief L1 (≈15):** tell "A support caller asking you to install an app." · what works "Nobody needs your screen. Hang up." Layer 2: "With an app like that, they could see and do what you can. Contact a company yourself, through its own app, card or website." (RAS §4; no detail of what the app does) Habit card `nobody-needs-your-screen` (new, §29.10).

### 29.5 Device moments, and what Brussels must pick up
- **Gatewren: started vs not started.** **9-1** (a login you started) → **9-3** (a payment you signed) → **9-5** (a login a caller asked for; the prompt shows another computer) → **9-6** (a QR code sent to you) → **9-7** (a QR code on a screen you opened) → **boss** (approve, sign, scan, each for someone else). The prompt's `where` and `device` are clues on the fraud follow-up beats; the deciding question is always "did I start this?" (SK2).
- **Calls (CR-39(a)).** The on-call bar keeps the caller visible over the Gatewren prompt, so the player reads the prompt while being talked at (EID §2). Fallback: a setup line on the prompt beat.
- **Never shown:** how the login is captured or the code relayed (EID §9); what the remote-access app can do beyond "they could see and do what you can" (RAS §6).
- **Brussels must pick up (remote access):** the finale's tech-support boss owns the full remote-access story. Reuse **Kindhand** as the helper app (non-functional, visibly a game screen), the `nobody-needs-your-screen` card (first earned in Stockholm if played; the finale earns it otherwise), and the damage-control steps `go_offline`, `get_device_checked`, `let_caller_finish`. Stockholm stops at the install request; the finale may go one step further only as narrative (Red Lines 2 and 4).

### 29.6 Boss 9-9 `stockholm-09-boss-case-file`
- **Setup:** "Evening. Birgitta, Jamal and Lina are in Birgitta's kitchen, icing buns. You're in your room. Your phone rings." (S-M2: you stay in Birgitta's spare room; Jamal and Lina live downstairs.)
- **Levers:** authority (police, then the bank), fear, urgency, isolation ("don't call your bank"). Pusher on beat 2 at 16 s (caller): "Have you signed? It's only protection."
- **Real details mixed in (difficulty 5):** your bank's name, a believable case story, the real Gatewren app.

**Beat 1, call (start, 30 s).** Caller ID "Police" (detail "+46 77 ••• •• 14 · Not a saved contact"). Transcript: "This is Inspector Holm, fraud unit. Your details were found on a seized phone." (`claims[0]`) · "We need to confirm it's you. Open Gatewren and identify yourself now." (`ask`) · "Don't call your bank: one of their staff is involved." (`claims[1]`). `request: approve`.
- Checkables (4; R 2): `caller_id` **D** (SK1) · `claim` **D** ("A worrying story. Real and fake calls both start like this, so it can't prove anything either way.") · `claim#2` **R** ("'Don't call your bank' is there to cut you off from help.") · `request` **R** (SK6: "Police never call and ask you to identify yourself with your e-ID.").
- Actions (no engage on boss beats): "Open Gatewren and approve as he asks" (`approve_prompt`, target) · "Hang up and call the police yourself on 114 14" (`call_back_known` ★★★; "'We didn't call you. Hanging up was exactly right.'"; SK6) · "Hang up" → "What now?" (as §6) · report.

**Beat 2, call (`arrives_after: 45`, 30 s, `covered_by: [start]`).** Caller ID "Larchwick Bank" (detail "08-••• •• 00 · Not a saved contact"). Transcript: "Larchwick security. The police asked us to call you." (`claims[0]`) · "Gatewren will ask you to sign a protective transfer. Just tap Sign; it moves nothing out of your name." (`ask`, and `claims[1]` = "it moves nothing out of your name"). **Banner** (auth, display only, §17 rule): "Gatewren · Sign: pay 48 000 kr to Skarvlund Trygg AB · Windows computer · Just now". `request: approve`.
- Checkables (4; R 2): `caller_id` **D** (SK1) · `claim` **D** ("Banks and police do work together, so it can't prove anything either way.") · `claim#2` **R** ("Gatewren shows a payment of 48 000 kr to a company. The caller says it moves nothing. Read the prompt, not the caller.") · `request` **R** ("Sign a payment for a caller.").
- Actions: "Tap Sign as they say" (`approve_prompt`, target) · "Deny, hang up and call the number on your card" (`call_back_known` ★★★; "Larchwick: 'We'd never ask you to sign anything on a call. Your money's where it was.'") · "Deny it" (`deny_prompt` ★★) · report (★★).

**Beat 3, Kettle (`arrives_after: 45`, 40 s, `covered_by: [start, bank_call]`).** New contact (CR-19) "+46 7•• ••• •03", display "Inspector Holm (Police)". "To close your case file, scan this with Gatewren. It confirms your statement. Please do it within 10 minutes." QR (CR-39(b)): `qr: { payload: /qr/stockholm-case-file, destination: gatewren.example }`. `request: scan_qr`; `claims[0]` = "scan this with Gatewren. It confirms your statement."; `claims[1]` = "Please do it within 10 minutes." Written so it reads true whatever the player did at beats 1–2. **Design combination (fraud-researcher):** police call → bank call → QR login combines EID A and B (B is Medium); not a separately sourced sequence, and no debrief presents it as one.
- Checkables (4; R 2): `sender.detail` **D** ("A name and title anyone can type, so it can't prove anything either way.") · `qr.destination` **D** (SK3) · `claim` **R** ("Scan with Gatewren to 'confirm a statement'. A login code sent to you starts someone else's login.") · `claim#2` **R** ("A deadline, so you don't stop to check.").
- Actions: "Scan it and approve the login" (`approve_prompt`, target) · "Call the police yourself on 114 14" (`call_back_known` ★★★; "'That's not one of ours. You did right to check.'"; SK6) · "Block and report the number" (`block` ★★) · "Ignore it" (★★).

**Interrupt** (`after_beat: case_qr`, genuine, `on_fall: skip`; Kettle, Birgitta's saved contact): "Fika's ready. Lina iced the buns herself, so be kind." Actions: "Reply: coming!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was Birgitta.").

- **Counts:** R = 2 + 2 + 2 = **6**; decoys on scheduled beats 2 + 2 + 2 = 6. Max 3 × 15 + 6 = **51**. Fall cap (T-2.8).
- **After a fall** (merged, cap 6): `call_bank_known_number` (stop: "any time, day or night; ask it to block your internet bank and e-ID access") · `tell_trusted_adult` (stop) · `keep_call_evidence` (secure) · `report_to_police` (report) · harmful `approve_again_to_cancel` · harmful `call_back_caller_number` (beats 1–2 are incoming calls, and beat 3 sends a QR code, not a number, so the player never dials a number from a text here; `call_back_text_number` is used in 9-2, should-fix 11). Every fall outcome sets `stockholm_bank_called` (story only).
- **Layer 1 (boss and stamp screen, ≈18):** tell **"'Police', then 'the bank', then a code: each wanted your Gatewren."** · what works **"Approve only what you started. Hang up and call the bank yourself."**
- **Layer 2, per beat:** beat 1 "Police never call to ask for your e-ID, and 'don't call your bank' cuts you off." · beat 2 "The caller said 'nothing moves'. The prompt said 48 000 kr. Believe the prompt." · beat 3 "A login code sent to you, dressed as police paperwork." `already_clicked.shared_code` (approve): "Approved or signed? Call your bank now on the number on your card; banks answer day and night. Then report it to the police."

### 29.7 Strategy check (as §7.2)
**Assumptions:** CR-17/19/30 landed; CR-39 landed or its fallbacks (no scoring effect). R counts scheduled beats only. Flags on `security_line`, `security_prompt`, `loan_prompt` and `buyer_prompt` count toward spotted, not R. Auth prompts carry an `ask` (§29.4), so genuine prompts have a `request` checkable.
- **Standard fraud:** 9-2 R 2 (19), 9-5 R 2 (19), 9-6 R 2 (19), 9-8 R 1 (17) = **74**. Decoys on scheduled beats: 9-2 2, 9-5 2, 9-6 3, 9-8 2, boss 6 = **15**.
- **Genuine:** 45. Own checkables: 9-1 5, 9-3 5, 9-7 3 = **13**.
- **Boss:** R 6, max **51**.
- **Totals:** max = 74 + 45 + 51 = **170**. R = 7 + 6 = **13**: silver ≥ ceil(13/3) = **5**, gold ≥ ceil(26/3) = **9**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal | 74 + 45 + 51 | 170 | 100% | 13 | **Gold** |
| 2 | Ideal + checks the page or app before approving 9-1 and 9-3 (in focus) | same | 170 | 100% | 13 | **Gold** |
| 3 | Follows the caller into Gatewren in 9-5, then denies, hangs up and calls the card's number | 170 − 5 | 165 | 97.1% | 13 | **Gold** |
| 4 | Careful reporter | (14+14+14+12) + 45 + (30+6) | 135 | 79.4% | 13 | Silver |
| 5 | Ideal but reports Birgitta's real signature (9-3) | 170 − 15 − 5 | 150 | 88.2% | 13 | Silver |
| 6 | Tag everything + always verify | 60 + 45 + 45 | 150 | 88.2% | 13 − (15 + 13) = −15 | Bronze |
| 6a | Random single tag + always verify (expected) | 150 + 2×(½+½+⅖+⅓) + boss 0.125×6 | ≈154 | ≈90.7% | 3.2 − 3.8 − 3 ≈ −3.6 | Bronze (silver unreachable: 7 − 3 = 4) |
| 6b | Always tag the sender / caller ID + always verify | 150 + 2 (9-6) | 152 | 89.4% | 1 − 6 = −5 | Bronze |
| 6c | **Always tag the request** + always verify | 150 + 2 (9-2) + 2 (9-5) + 4 (b1, b2) | 158 | 92.9% | 4 − 2 = 2 | Bronze |
| 6d | Request + every claim + always verify | 150 + 2 (9-2); 9-5, 9-6, 9-8, boss void | 152 | 89.4% | 11 − 7 = 4 | Bronze |
| 6e | Tag the place and device on every prompt + always verify | 150 (always-verify never reaches a fraud prompt) | 150 | 88.2% | 0 − 4 = −4 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 88.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.4% | 0 | Bronze + tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 (9-1) + 0 (9-3) + 10 (9-7) | 80 | 47.1% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 4 × 9 + 9 | 90 | 52.9% | 0 | Bronze |
| 11 | **"Trust the caller ID"**: does what bank-, police- and support-looking callers say, ideal on texts, chats and QR | 170 − 10 (9-5: 19 → 9) − 8 (9-8: 17 → 9) − 23 (boss: b1 0, b2 0, b3 15, tags +4, DC 9 = 28) | 129 | 75.9% | 13 − 2 − 1 − 2 − 2 = 6 | Silver |
| 12 | **"A code that opens Gatewren is fine"**: falls for 9-6 and boss beat 3, ideal elsewhere | 170 − 10 (9-6) − 6 (boss: b1 15, b2 15, b3 0, tags +6 (4 correct tags earn 8, capped at 6), DC 9 = 45) | 154 | 90.6% | 13 − 2 − 2 = 9 | Gold today; **Silver** under R24 (two falls, §7.3) |

Row notes:
- **6a hit chances:** 9-2 2/4, 9-5 2/4, 9-6 2/5, 9-8 1/3, b1 2/4, b2 2/4, b3 2/4; boss bonus only if all three hit (⅛).
- **6b:** the sender or caller ID is a decoy on 9-2, 9-5, 9-8 and every boss beat, and R only on 9-6. Genuine prompts and the laptop's login page have no sender.
- **6c:** the request is R on 9-2, 9-5, b1, b2; 9-6, 9-8 and b3 have no `request` checkable (`scan_qr` and `install` carry no `ask`; 9-8's install sentence is authored as `claim#2`, T-3.11 review round 1). Without the genuine prompts' `ask`, this row would net 5 = silver: **the `ask` on genuine auth prompts is required** (§29.4; validator note for the writer).
- **6d:** correct = 9-2 request, 9-5 claim#2 and request, 9-6 claim#2, 9-8 claim#2, b1 claim#2 and request, b2 claim#2 and request, b3 both claims = 11; wrong = 9-5, 9-6, 9-8, b1, b2 first claims (5) + genuine requests 9-1, 9-3 (2) = 7. Net 4, one short of silver; recorded for the balancing pass.
- **Row 11** lands at 75.9% with 6 spotted: silver, just. Trusting callers loses two scenarios and two boss beats.
- **Row 12:** two well-recovered QR falls still reach gold, as Dublin row 12. Input to R15 (§28.11 Q3). **Balancing pass (T-3.13):** silver under proposed R24 (§7.3).
- **Without CR-39:** no scoring change.

### 29.8 Stockholm reveal rulings
- **SK1. Caller ID is always D** ("A caller can set the name and number on your screen"), never "It fits", on genuine and fraud alike.
- **SK2. Prompt details.** On genuine prompts: "It fits: … you started", always with "That isn't proof on its own" on the first one. On fraud follow-up prompts: `where` and `device` are R when they aren't the player's; `service` is R only when it contradicts the story ("log in to your bank" vs "confirm you're the seller"), otherwise D; `when` is always D. The deciding line in every debrief is "did you start it?", never "check the city".
- **SK3. `qr.destination` = gatewren.example** is D on fraud ("it opens Gatewren itself; that's why it's dangerous") and "It fits … on a screen you opened yourself" on genuine. Never "read the address" as the lesson for login codes.
- **SK4. Never explain the mechanism.** Only "your approval logs someone else in" or "signs their payment". No session, relay or remote-control detail.
- **SK5. Rudeness is free.** Birgitta's line and layer 2 may say "It's fine to hang up. Rudeness is free." Never mocks politeness or the person who stayed on the line.
- **SK6. Police.** "Police never call and ask you to identify yourself with your e-ID" (EID §3.5) appears in Stockholm's drill and boss only. **Police numbers (producer ruling, Stockholm Q3, per the sceptic):** 114 14 (to check something or report) and 112 (only "if it's happening now") may appear on the player's side only: the Sweden help card, the "Call the police yourself" action labels and their outcomes in drill 9-4 and boss beats 1 and 3, and damage-control text. They never appear in scam messages, transcripts or caller IDs (the boss's caller ID stays masked), and are never `tel:` links. Example label: "Hang up and call the police yourself on 114 14"; outcome: "'We didn't call you. Hanging up was exactly right.'"

### 29.9 Stockholm change request (to `frontend-engineer`)
- **CR-39 (non-blocker).** (a) The CR-31 on-call bar over an `auth` beat reached by an engage from a `call` beat (9-2, 9-5): caller name, call time, Hang up (focus moves to the beat's verify/dismiss), beat-bound caller lines inside the bar. (b) A QR code inside a `messenger` message (9-6, boss beat 3): the stylised QR (no finder patterns, as T-2.3), the destination chip as text ("QR code · opens gatewren.example"), checkable `qr.destination` in reading order after the body, `scan_qr_and_open` on standard beats. Fallbacks: (a) the auth beat's setup line "The caller is still on the line."; (b) the code as the message's `image` (alt "A QR code") with "opens gatewren.example" in the body, and the destination reveal moved to a claim.
- Uses `auth` prompts (T-2.3) with `approve_prompt`/`deny_prompt` (validator: `approve_prompt` only on fraud), the §17 banner rule (boss beat 2), CR-19 (9-6, boss beat 3), CR-30 (`ask` on `call` and `approve`).

### 29.10 New brands, cast, content
- **Kindhand** ("Kindhand Support"; a fictional, non-functional "helper" app, scam prop only; reused by Brussels' boss): no domain needed in Stockholm (named in a call only); if Brussels shows a store page or link, it uses `kindhand-support.example`. Its icon must not resemble any real remote-access or support app (no monitor-with-arrows, no hand-on-screen). Alternatives "Handover Help", "Assistwell". BRAND_CHECK against remote-access, screen-sharing and support apps.
- **Reused:** Gatewren (first real use of the `auth` device), Larchwick, Kettle, Swaploft (9-6 claimed), Waymarker Desk (9-1).
- **Scam-side names (name register):** "Erik (Larchwick security)", "Inspector Holm", "Skarvlund Trygg AB" (payee in the boss banner). Never cast; "Holm" and "Erik" do not clash with Birgitta Lind or any cast first name.
- **Cast (`content/cast.yaml`):** `birgitta` "Birgitta Lind", role "Retired teacher, Adaeze's aunt (Stockholm)", known channel "Saved contact: Birgitta (fika host)"; `jamal` "Jamal Haddad", role "Hospital lab technician, new in Stockholm", known channel "Saved contact: Jamal (downstairs)"; `lina` "Lina Haddad", role "Jamal's daughter, 12 (Stockholm)", known channel "Saved contact: Lina (downstairs)" (floor plan per S-M2: you stay in Birgitta's spare room; Jamal and Lina live downstairs) (messages only small talk; never money, codes or e-ID). All in STORY §2.3.
- **Recovery steps (new):** `go_offline` ("Turn on airplane mode and stop using the device for banking") · `get_device_checked` ("Get the device checked before you use it for banking again") · harmful `approve_again_to_cancel` ("Approve another request to cancel the first one"; feedback "It feels like undoing it, but a new approval can let them in again. Call your bank instead.") · harmful `let_caller_finish` ("Call them back so they can finish the 'check'"; feedback "They're the ones who got in. Hang up, go offline and call your bank."). Reused: `call_bank_known_number`, `tell_trusted_adult`, `keep_call_evidence`, `call_back_caller_number` and `call_back_text_number` (Madrid T-3.6, in `content/recovery_steps.yaml`), `keep_evidence`, `report_to_police`, `change_password`, `wait_and_see`.
- **Habit cards:**
  - **New `only-approve-what-you-started` (LO-09).** Title "Only approve what you started". Habit: "Approve a sign-in, signature or QR login only when you opened the app or site yourself, chose what to do, and the request names it. Whoever is on the phone, hang up and call your bank on the number on your card or in its app." Example (first shown on 9-1, a genuine debrief): "You open a site, tap 'Log in with Gatewren', and the request names that site: approve. A caller asks you to open Gatewren: deny and hang up." Already clicked: "Approved one you didn't start? Call your bank now on the number on your card; banks answer day and night. Then report it to the police."
  - **New `nobody-needs-your-screen` (LO-15; shared with Brussels).** Title "Nobody needs your screen". Habit: "Never install an app or share your screen for someone who contacted you. Hang up and contact the company yourself, through its own app, card or website." Already clicked: "Installed something for them? Turn on airplane mode, call your bank from another phone if you can, change your passwords from another device, and get the device checked."
  - `hang-up-call-back`, `calm-not-paranoid`: bodies unchanged.
- **Atlas page:** `atlas_cards: [only-approve-what-you-started, nobody-needs-your-screen, hang-up-call-back]` (STORY §3.9).
- **"Where to report and get help" (Sweden) card:** wording in `docs/patterns/ch9-stockholm-sources.md` ("Sweden help card"), in the WHERE_TO_REPORT §3c order, crisis row last and on its own. Linked from layer 2 of every Stockholm debrief.
- **Chapter file:** `content/chapters/stockholm.yaml`: slot 9; `patterns: [e-id-approval-on-call, remote-access-support-call]`; `callbacks: [multichannel-support-callback, spoofed-authority-call]`; am `[01, 02, 03]` (stop point after 03), pm `[04, 05, 06, arc, 07, 08, 09]`; `boss: stockholm-09-boss-case-file`; intro and rules as §29.1; `scenes: { arrival: stockholm-arrival, turn: stockholm-turn, resolution: stockholm-resolution }`.

### 29.11 Open questions for the producer (Stockholm)
1. **CR-39** (on-call bar over Gatewren prompts; QR in a chat). **Answered (producer): accepted as a non-blocker** with the fallbacks.
2. **9-6 reuses Swaploft.** **Answered (producer): keep Swaploft, but make the opener clearly different from Warsaw 5-3.** Done: 9-6 is now a would-be buyer who hasn't paid, asking whether the lamp is still for sale and wanting a seller "check" by QR (§29.4); Warsaw 5-3 is "I've paid already, collect your payment here" with a link.
3. **Police numbers.** **Answered (producer, per the sceptic's ruling):** 114 14 (to check or report) and 112 (only "if it's happening now") on the player's side only; never in scam messages, transcripts or caller IDs; no `tel:` links. Applied in SK6 (§29.8), drill 9-4 and boss beats 1 and 3; Rome's §26.11 Q3 limit amended to "Italy and Sweden chapters and help cards".
4. **Row 12** (two QR falls still gold) and **row 11** (silver at 75.9%): inputs to R15 and the balancing pass (§28.11 Q3, answered: decided there).
5. **For fraud-researcher:** (a) the QR-login-by-message beats (9-6, boss beat 3) rest on EU-level sources (Medium; no Swedish page); (b) 9-8, a "Gatewren Support" caller (no Sweden-specific tech-support source; RAS §8), kept as a preview that stops at the request; (c) the prompt-mismatch tell (a design inference from the police wording, EID §2.3); (d) the boss as a design combination; (e) amounts 4 890 kr, 236 kr, 48 000 kr (illustrative, never typical).
6. **For learning-psychologist:** 9-8's fall narrative stops before any further harm ("You stop and hang up"); confirm this is enough consequence for LO-16 without frightening detail.

## 30. Chapter 10 — Brussels (finale)
Status: **spec for review** (Phase 3, game-designer, 2026-11-19). Briefs: `docs/patterns/remote-access-support-call.md` (RAS, full pattern) and `docs/patterns/money-mule-recruitment.md` (MMR); arc endings `recovery-scam.md` (RCS) and `investment-ad-fake-platform.md` (IAF); the card-line decoy `spoofed-authority-call.md` (SAC). Per-beat sources, the on-screen rules and the Belgium help card: `docs/patterns/ch10-brussels-sources.md` (BXS). No source ids and no real body names inline: real organisations appear only on the Belgium help card. Replaces the §18 Brussels summary. Picks up every item of the §28.5 and §29.5 hand-overs (ticked off in §30.12). Brussels adds **CR-40 to CR-44** (§30.10).

### 30.1 Goal, shape, rules check
- **The chapter habit (H):** **"Nobody who contacted you gets your screen, your codes or your account. Hang up or say no, then check on a number or app you already know, and ask someone."** (RAS §5, MMR §5.) Short form for layer 1: "Nobody needs your screen" (boss) and "Never lend your account" (Noor).
- **What the chapter teaches, in order of weight:**
  1. **Nobody needs your screen.** Someone who contacted you and asks you to install an app or share your screen is the tell, whoever they say they are. A genuine bank employee never asks you to install remote-access software (RAS §4.1).
  2. **A warning that gives you a number to call is the scam.** Close it; don't call (RAS §4.2).
  3. **The real card-blocking line never calls you first.** It is a number you call. This line is about the card-blocking line only; the game never says "your bank never calls you" (BXS rules; RAS §4.4).
  4. **Never lend your account, card, banking-app login or codes,** whatever the offer. If an offer involves your account, stop and talk to someone you trust (MMR §5). The player is the trusted person here: Noor asks first.
  5. **Already caught? It's not too late.** Go offline, call the bank on the number on your card, change passwords, get the device checked (RAS §6); for an account already lent: stop, tell a trusted adult, call the bank, change the login, police (MMR §7).
  6. **Every habit from the trip, once more** (§30.5): each standard scenario calls back one earlier chapter's habit, and the boss combines three.
  7. Calibration: a print invoice you expected, a sign-in you started and an IT visit you asked for are normal.
- **Shape:** slot 10, difficulty 4–5, boss 5. Timers 35 s (slot 10), call beats 30 s, boss beats 40 s. **8 scored: 3 genuine (37.5%), 5 fraud (4 standard + boss).** Plus drill 10-5 (Noor's friend), then after the boss the **arc finale block** (§30.6, unscored for the chapter; arc points only). No new arc slot (the finale adds no Alex request, §28.5 item 6). Estimated 18–20 min including scenes (balance target 14–20).
- **New patterns (2):** `remote-access-support-call` (boss; 10-7 twin), `money-mule-recruitment` (10-4; drill 10-5). **Callbacks (5, one per earlier habit family):** `payment-detail-change` (10-1 twin, 10-3), `smishing-parcel-fee` (10-2), `messenger-family-impersonation` (10-8), `e-id-approval-on-call` (10-6 twin, boss beat 3), `recovery-scam` (arc ending C, §30.6).
- **LO focus:** LO-15 (core), LO-12 (core: never lend your account), LO-18 (Noor, Teo, drill), LO-16 (boss, drill, ending C), LO-14 (arc finale), LO-13 (ending C), LO-08, LO-09, LO-06, LO-07, LO-02, LO-03, LO-17.
- **Flavour:** Waymarker's Brussels office and the Open Evening hall (never EU-styled: no blue-and-gold stars, flags or institutional buildings; STORY §3.10). Small talk in French and Dutch (`lang="fr"` / `lang="nl"`, inline translation, never a red flag). A city is a stage, not a claim: no debrief says a scam "is Belgian".
- **Premise and intro** (CR-27, ≤ 20 s): "Brussels: the Open Evening is in two days. The Atlas is printed, Teo and Noor are on their way, and the projector laptop is being difficult."
- **Rules card** (CR-27), title **"Adaeze's Open Evening rules"**, two items: "Nobody who contacted you gets your screen, your codes or your account." · "Pause, check on a number or app you already know, and ask someone." General rules, never wrong on the genuine twins: 10-1 asks for a payment you expected, on the usual account; 10-6 is a sign-in you started; 10-7 answers a ticket you raised and asks for nothing.
- **Never on screen** (BXS rules, Red Lines 2 and 4): how a remote session is set up, or what the helper app can do beyond "they could see and do what you can"; how mule money is moved, or what happens to money after it arrives; parents' liability and recruiters' threats (MMR §6, designer-only); any amount lost or total lost (§28.5 item 8); a refund as certain; survey figures; real product names or icons; the real card-blocking line's name or number outside the help card.

**Mix rules (balance v3.1):**
- **Genuine** 3/8 = 37.5% ✓. **Truth order** (scored): G F F · F G G F F(boss); max run 3 ✓ (10-2, 10-3, 10-4).
- **Themes:** `supplier` 2 (10-1, 10-3), `parcel` 1 (10-2), `easy_money` 1 (10-4), `work` 1 (10-6), `support` 2 (10-7, boss), `family` 1 (10-8). Max 2/8 ✓. Scored order supplier, parcel, supplier, easy_money, work, support, family, support: no two adjacent ✓.
- **Pressure parity:** genuine 2/3 (10-1 and 10-6 honest timers) = 66.7%; fraud 4/5 (10-2, 10-3, 10-8, boss) = 80%; gap 13.3 ✓. 10-4 is calm on purpose (a sensitive topic, and Noor asks before anything is due).
- **Difficulty parity:** genuine at 4 (10-1), 5 (10-6, 10-7); fraud at 4 (10-2, 10-4), 5 (10-3, 10-8, boss) ✓.
- **Decoys:** ≥ 2 on every fraud (counts in §30.8). **Sender-or-link decoy:** F = 5 needs 2: 10-2's "TRUNDLE" sender, 10-3's real Ruchelune address, 10-4's recruiter profile, boss beat 1's page address and beats 2–3's caller IDs ✓.
- **Interrupts:** 10-2 Adaeze, 10-3 Teo, 10-6 Mateus, 10-7 Teo, 10-8 Adaeze, boss Noor after beat 3. None on 10-4 (calm; Noor is the sender). Genuine small talk, never pointing to the verdict.
- **Off-focus genuine:** none (10-1 and 10-6 are high stakes; 10-7 is the boss's in-focus twin).
- **Red Line 8:** every scenario is an email, a text, a chat, a browser page, a call or an approval prompt. No visit by a "technician", no cash, no card handed over in person.

### 30.2 Story beats (track S)
STORY §3.10, kept, with three spec decisions marked **(spec)**. No panel shows a pop-up, a caller, a number, a DM, an amount or a profile picture. Noor never shares her details, whatever the player advises (STORY §3.10 constraint): every branch of 10-4 ends with Noor saying no and telling her mum. Alex has no scene lines (STORY §2.2).
1. **Arrival** (before 10-1; 2 panels; calm; STORY §3.10 wording). Waymarker's office, boxes of freshly printed Atlas covers (no printer's name visible). Adaeze (thinking): "Two days to the Open Evening. The laptop and I are not friends." Caption over Teo (laughing) and Noor in the doorway: "Teo and Noor arrive with one suitcase too many."
2. **Turn** (stop point, after 10-3; 2 panels; thinking → warm). Noor (thinking), scrolling at the next desk: "Can I ask you something later? It's probably nothing." You: "Any time. I'm here." (A human cue only; the DM lives in 10-4.)
3. **Resolution** (after the arc finale block, §30.6). Scenes in this order, each ≤ 6 panels:
   - **(spec) Opening variant `brussels_bank_called`** (story-only flag, set by every boss fall outcome; STORY §4.2 rule 5, R17 approach): when set, it is the **first panel of the resolution**, Adaeze (calm): "The bank was called straight away, the right first step. We'll see what it can do. IT will check the laptop too." (22 words; Adaeze's plan, true in every fall branch.) No refund promise.
   - **Ending scene, one per arc ending** (STORY §3.10 part 1, unchanged lines; `sensitive: true`): C and R-with-investment (Adaeze, Adaeze's recovery panel, Teo); A / A′ / R-without-investment (Teo's "Same picture, different name. Good thing I asked you.", R adds "Sometimes you just want to know. Asking is never wrong."); B (Adaeze's "You told someone, and the timeline did the rest. That's the whole trick.").
   - **Feelings scene** (2 panels, `sensitive: true`, Help link): "The chats felt real because you were real." / "It's fine to feel sad, embarrassed, or both. Talking to someone helps."
   - **Part 2, the Open Evening** (all players; 5 panels): Noor (relieved): "I nearly said yes. Then I asked you, and I told Mum too. Asking was the smart bit." · the video wall of locals (reused portraits, one caption: "Everyone you met, on one wall.") · you pick a postcard and Teo reads its cue (flip the postcard, CR-44(a)) · Adaeze (proud): "Pause. Check on a number or app you already know. Ask someone. Then be the someone for the next person." · **If-then panel (Noor), word for word from STORY §3.10:** "If an easy-money offer wants my bank login or card, then I say no and ask someone first." Extra line under it: "Nobody needs your screen, either."
   - **Adaeze's line placement (R19(3)):** her line is the panel **before** Noor's If-then (the scene validator's "ends on If-then" rule stands), and it opens the end screen as its epigraph (CR-44(b)). STORY §1.5 and §3.10 updated to match.
- **Map invitation:** none (the finale has no next city). The end screen replaces it.
- **Panels:** arrival 2 + turn 2 + variant 1 + ending ≤ 5 + feelings 2 + part 2 5 ≈ 16–17, about 150 s (STORY §4.1 Brussels budget).
- **(spec) Drill 10-5** (Noor's friend, §30.4) is a device drill, not a scene. It carries the "already said yes" steps without Noor ever sharing anything.
- **Safety:** the ending and feelings scenes are `sensitive: true`; content note in §30.11. Noor is 15: no scene, line or debrief calls her action, or anyone's, a crime; the one consequence sentence lives only in 10-4's general debrief (layer 2), always with the next step (MMR §6). Teo arrives as a co-presenter, capable and kind.

### 30.3 Scenario list
| # | Half | Scenario | Device | Truth | Diff | Pressure | Theme | LOs |
|---|---|---|---|---|---|---|---|---|
| 10-1 | AM | Ruchelune's accounts email: the Atlas print invoice, "to our usual account, as on Waymarker's supplier list" | email → banking | genuine / high (twin of 10-3) | 4 | honest timer 35 | supplier | LO-06, LO-17 |
| 10-2 | AM | SMS "TRUNDLE": "Your parcel (Waymarker posters) is held: unpaid delivery fee of €1.95. Pay today at trundle-redelivery.example/pay" | sms → browser | fraud (smishing callback) | 4 | timer 35 + pusher; interrupt | parcel | LO-02, LO-03 |
| 10-3 | AM | Same Ruchelune thread, real address: "our bank has changed … please use our new account below … the old account closes today at 5" | email → banking | fraud (payment-detail-change callback) | 5 | timer 35; interrupt | supplier | LO-06, LO-18 |
| | | *Stop point + turn* | | | | | | |
| 10-4 | PM | Noor (saved contact) forwards a Postwick DM: "Want €300 this week? Super easy. I just need to use your account for a few transfers. Send me your banking-app login and card details." "Is this legit??" | messenger (forwarded DM; CR-40) | fraud (MMR), advice | 4 | — (calm) | easy_money | LO-12, LO-18, LO-05 |
| 10-5 | PM | **Drill: Noor's friend already said yes.** "What should she do first?" | messenger → damage control (CR-41) | drill | 4 | — | — | LO-16, LO-12, LO-18 |
| 10-6 | PM | You open Waymarker Desk on the office laptop and tap "Log in with Gatewren". Gatewren: "Log in to Waymarker Desk · Laptop · Brussels · Just now" | auth | genuine / high (twin of boss beat 3) | 5 | honest timer 35; interrupt | work | LO-09, LO-17 |
| 10-7 | PM | Waymarker IT desk replies to your ticket: "I'll come by at 4 to look at the laptop in person." | email | genuine / low (twin of the boss) | 5 | — (calm); interrupt | support | LO-15, LO-17 |
| 10-8 | PM | Kettle, new number, display "Mateus": "Lost my phone at the station, using a friend's. The hotel wants a €60 deposit … Can you send it to this account?" | messenger → banking | fraud (family-impersonation callback) | 5 | timer 35 + pusher; interrupt | family | LO-07, LO-06 |
| 10-9 **Boss** | PM | The helpdesk. Beat 1 (browser warning on the projector laptop): "Virus detected … Call Kindhand Support now on 02 ••• •• 17." Beat 2 (call, caller ID "Marrowby"): "the card-blocking line … install Kindhand on the computer you're using and read me the code." Beat 3 (call, "Larchwick Bank", Gatewren banner): "Approve the security sign-in … then switch off your phone for an hour." | browser → call → call (+ banner) | fraud (RAS; SAC; EID) | 5 | boss 40 s, calls 30 s + pusher; interrupt after beat 3 | support | LO-15, LO-08, LO-09, LO-16 |
| *arc* | PM | **Arc finale block** (§30.6): close beat (if open), reveal, ending content (recovery-agency test / Teo's chat / timeline walk-through), red-flag timeline | messenger, email, timeline | arc | — | — | — | LO-14, LO-13, LO-16, LO-18 |

### 30.4 Scenario specs
Shared rules as §24.4. Belgian numbers masked `+32 2 ••• •• NN` (landline) and `+32 4•• •• •• NN` (mobile); never a mask that resembles the real card-blocking line's number (BXS help card). IBANs `BE•• … NNNN` / `FR•• … NNNN`, checksum-invalid. Every scored scheduled beat on a CR-30 device has an `ask`. Reveals follow BX1–BX7 (§30.9). Training pages: fields as the engine's `enter_details` / `pay` page (TrainingForm; read-only, nothing sent). `tell_trusted_adult` is `stop` in every personal-money fall.

**10-1 `brussels-01-print-invoice`** · genuine, high · email → banking · diff 4 · honest timer 35, `honest_deadline` "Due within 30 days" · Ruchelune, Larchwick Pro (`message.account: { nickname: "Waymarker events" }`, CR-26) · `pattern: payment-detail-change` (twin of 10-3) · callback: Paris
- **Setup:** "The Atlas print run arrived this morning. Adaeze has asked you to pay Ruchelune's invoice from the events account; she signs off after you."
- **Message (email):** from "Ruchelune accounts" <compta@ruchelune.example>, subject "Atlas print run: invoice R-2611". "Bonjour Sam, the Atlas print run is delivered. Invoice R-2611 is attached: €1,180.00. Please pay it to our usual account, as on Waymarker's supplier list. Due within 30 days. Merci ! Ruchelune" (`lang` fragments with translation). `attachments: ["Invoice R-2611.pdf"]`; `request: pay`; `ask` = "Please pay it to our usual account, as on Waymarker's supplier list."; `claims[0]` = "the Atlas print run is delivered"; `references: ["Invoice R-2611"]`.
- **Checkables (G, 5):** `sender.detail` ("It fits: Ruchelune's accounts address, the one on the supplier list. That isn't proof on its own, so weigh it with what it asks.") · `attachment` (neutral) · `reference` ("It fits: the order Adaeze placed.") · `claim` ("It fits: the boxes are in the office.") · `request` ("The usual account, from your own list. Nothing changed, no rush.").
- **Actions:** "Pay it in Larchwick Pro to the list's account" (`start_transfer` → `invoice_transfer`, plain `step`) · "Call Ruchelune on the directory number first" (`call_back_known` ★★★; "Inès: 'Bonjour! Yes, that's ours, same account as always.'") · report (0, −5) · "Leave it for now" (`ignore`, dismiss on genuine high, 0).
- **`invoice_transfer`:** payee typed from the supplier list, "Ruchelune"; IBAN `FR•• … 3301`; €1,180.00. Result **match**. Actions: "Pay €1,180.00" (`proceed` ★★★; "Paid. Adaeze signs it off: 'Lovely. Same account as the list.'") · "Cancel and call Ruchelune first" (`call_back_known` ★★★) · "Cancel" (`ignore`, 0).
- **Debrief L1 (genuine):** tell "A bill you expected, from the usual address, to the usual account." · what works "Paying was fine; calling first is never wrong." Layer 2: "Nothing changed: the account matched your own list. If bank details ever change, call on a number you already have." Habit card `check-who-gets-the-money`.

**10-2 `brussels-02-poster-parcel`** · fraud (smishing callback) · sms → browser · diff 4 · timer 35; pusher at 18 s (same thread): "Last reminder: your parcel goes back to the sender today." · levers urgency, small_amount · Trundle (spoofed), look-alike `trundle-redelivery.example` (registered) · **Interrupt** at 12 s, Adaeze: "Badges printed! One says 'Inspecter'. We'll live." · callback: Berlin
- **Setup:** "The Atlas posters are on their way with Trundle."
- **Message (sms, sender "TRUNDLE", new thread):** "TRUNDLE: Your parcel (Waymarker posters) is held: unpaid delivery fee of €1.95. Pay today at trundle-redelivery.example/pay or it goes back." `request: pay`; `ask` = "Pay today at trundle-redelivery.example/pay"; `claims[0]` = "Your parcel (Waymarker posters) is held: unpaid delivery fee of €1.95."; `references: ["Waymarker posters"]`.
- **Checkables (5; R 2):** `sender.detail` **D** ("Shows TRUNDLE. Anyone can set a sender name, so it can't prove anything either way.") · `reference` **D** ("Names your posters. A parcel is easy to guess, so it can't prove anything either way.") · `link` **R** ("trundle-redelivery.example, not trundle.example.") · `claim` **R** ("A small fee to release a parcel, by text. Trundle shows any real fee in its app.") · `request` **D** ("Asks you to pay. Couriers can charge fees, so it can't prove anything either way. Where you pay is what matters.").
- **Actions:** "Pay the fee through the link" (`open_link` → `fee_page`, target) · "Open the Trundle app yourself" (`verify_in_app` ★★★; "Posters: out for delivery today. No fee.") · report (★★) · delete (★★).
- **`fee_page` (training page "Trundle · Pay delivery fee"):** address `trundle-redelivery.example/pay`; fields as the engine's `pay` page. Checkables `page.address` R, `page.info` D. Actions: "Pay €1.95" (`enter_details`, fall) · "Close it and open the Trundle app" (★★ engage cap) · "Close the page" (★★).
- **Fall:** narrative "The page says 'Paid'. That evening your Larchwick app shows a card payment you didn't make." Damage control (6, 2 harmful): `block_card_in_bank_app` (stop) · `call_bank_known_number` (stop) · `keep_evidence` (secure: "the text and the page address") · `report_to_police_online` (report) · harmful `wait_and_see` · harmful `reply_to_scam_text` (Berlin's step).
- **Debrief L1 (≈14):** tell "A small fee by text, on a look-alike address." · what works "Open the courier's app yourself." Layer 2: "Same trick as ever: a tiny fee, a deadline, a link. The app you installed tells you the truth." Habit card `open-it-yourself`.

**10-3 `brussels-03-new-bank-details`** · fraud (payment-detail-change callback) · email → banking · diff 5 · timer 35 · levers authority (a real supplier), urgency · Ruchelune (real mailbox misused, never shown how; as Paris), Larchwick Pro · **Interrupt** at 14 s, Teo: "Noor has eaten all the sandwiches. I'm told this is normal." · callback: Paris
- **Message (email, same thread as 10-1; `earlier[]` shows 10-1's invoice):** from "Ruchelune accounts" <compta@ruchelune.example>, subject "Re: Atlas print run". "Sam, small change: our bank has changed this month. For the poster reprint (invoice R-2614, €480.00), please use our new account below. The old account closes today at 5, so today would be ideal. Merci !" Bank-details card (CR-22): "Ruchelune · BE•• … 7720 · €480.00". `request: pay`; `ask` = "please use our new account below"; `claims[0]` = "our bank has changed this month"; `references: ["invoice R-2614"]`. The deadline is a layer-2 text flag, not a checkable.
- **Checkables (5; R 2):** `sender.detail` **D** (BX6: "Ruchelune's real address, in your real thread. A real mailbox can be misused, so it can't prove anything either way.") · `reference` **D** ("A real-looking invoice number. Anyone in the thread can copy one, so it can't prove anything either way.") · `payee.iban` **D** ("A Belgian account. Accounts can be opened anywhere, so it can't prove anything either way.") · `claim` **R** ("New bank details by email. That's the change to check, on a number you already have.") · `request` **R** ("Pay a new account, today.").
- **Actions:** "Pay the new account in Larchwick Pro" (`start_transfer` → `reprint_transfer`; an email source, so no cap) · "Call Ruchelune on the directory number" (`call_back_known` ★★★; "Inès: 'We haven't changed banks! Thank you for calling. We're telling our IT now.'") · "Ask Adaeze to check it with you" (`ask_someone` ★★★; "Adaeze: 'New details? We ring them first. Always.'") · report (★★) · "Leave it" (`ignore` ★★).
- **`reprint_transfer`:** payee typed from the email, "Ruchelune"; IBAN `BE•• … 7720`; €480.00. Result **doesn't match** (no holder). Actions: "Pay €480.00 anyway" (`pay`, fall) · "Cancel and call Ruchelune on the directory number" (`call_back_known` ★★★) · "Cancel and report it" (report ★★) · "Cancel" (`ignore` ★★).
- **Fall:** narrative "Paid. Inès rings that afternoon: 'Did you pay the reprint? We never changed banks.'" Damage control (6, 2 harmful): `call_bank_known_number` (stop: "ask it to try to stop or recall the payment") · `tell_real_person` (warn: Ruchelune, on the directory number) · `keep_transfer_evidence` (secure) · `report_to_police_online` (report) · harmful `reply_to_scam_email` ("Reply to the email and ask for it back") · harmful `wait_and_see`.
- **Debrief L1 (≈14):** tell "New bank details by email, with a same-day deadline." · what works "Call on a number you already have." Layer 2: "The address was real and the thread was real. The change was the tell, and a phone call to a number you already have catches it." Habit card `check-who-gets-the-money`.

**10-4 `brussels-04-noor-easy-money`** · fraud (MMR), **advice scenario** (CR-40: you advise Noor; Noor never acts on bad advice) · messenger with a forwarded DM · diff 4 · calm (no timer) · levers greed, social_proof, helpfulness · Kettle, Postwick (genuine platform), recruiter profile (scam-only) · cast Noor · debrief wording per BX7 (MMR §6, §10)
- **Message:** Noor's saved contact "Noor (cousin)" (`earlier[]`: "Noor: Train food: a sandwich-shaped disappointment"). "Can I ask you now? Someone on Postwick sent me this. It's just a few transfers, and I really want summer job money 👀 Is this legit??" Forwarded DM (CR-40 `forwarded`), from "Summer Euro Club" (detail "@summer_euro_club · Postwick · 2 mutual friends"): "Hey Noor! Want €300 this week? Super easy 💸 I just need to use your account for a few transfers. Send me your banking-app login and card details. Totally safe, loads of people at your school already do it 🙂" `request: enter_details` (the DM's ask); `ask` = "Send me your banking-app login and card details."; `claims[0]` = "Want €300 this week? Super easy"; `references: ["loads of people at your school already do it"]`. "Banking-app login" is the game's translation of "login details or codes" (MMR §10); the DM never says how money moves (BXS rules).
- **Checkables (4; R 2; all on the forwarded DM):** `forwarded.sender` **D** ("Two mutual friends. Friends' accounts can be faked or tricked too, so it can't prove anything either way.") · `reference` **D** ("Says others at her school do it. Anyone can say that, so it can't prove anything either way.") · `claim` **R** ("Easy money you didn't ask for, for 'a few transfers'.") · `request` **R** ("Her banking-app login and card details. Nobody needs those to pay you.").
- **Actions (your reply to Noor):** "It's a trap. Don't send anything; tell your mum" (`ask_someone` ★★★; Noor: "Okay. Telling Mum now. She says thanks, inspector.") · "Let's report the account on Postwick" (report ★★; Noor: "Reported. And I'm telling Mum too.") · "Ignore it and block them" (`ignore` ★★; Noor: "Blocked. I'll tell Mum as well, just in case.") · "If it's only a few transfers, it's probably fine" (`advise_comply`, CR-40: comply class, **0, not a fall**, no damage control; Noor: "Hmm. I'll check with Mum too." Then: "Mum says no way. I'm not sending anything.").
- **Debrief L1 (≈17):** tell "Easy money for using your account, login or card." · what works "Never lend your account. Say no and ask someone." Layer 2, **the general debrief, the only place for the consequence sentence** (MMR §6, word for word, always with the next step): "Letting someone use your account like this is a crime, and the account holder can be held responsible. If it's already happened, getting help early is the right move." Then: "If anyone pressures you to keep going, that's a reason to get help now." Then: "Asking for help is never the wrong thing to do." (MMR §7 recommendation.) `already_clicked.entered_details` (the player's own case): "If you've already shared it, it's not too late: change your login, call your bank on the number on your card, and tell a trusted adult." Habit card `easy-money-costs-you`.
- **Outcome lines never** call Noor's action a crime, never mention punishment, parents' liability or threats, and never say "you won't be in trouble" (MMR §6, §7). After `advise_comply` the debrief adds, without blame: "Noor asked, and that was the smart bit. With an offer like this, the answer is always no." (psych M1) "You chose" names the advice, never "You fell".

**10-5 `brussels-05-noor-friend`** (drill, unscored) · messenger → damage control for someone else (CR-41) · cast Noor · `pattern: money-mule-recruitment`
- **Message:** Noor's saved contact: "One more thing. My friend from football already sent hers last night. She's really worried now. What should she do first?" The friend is never named, drawn or cast.
- **Damage control** (CR-41, `recovery_for: { label: "Noor's friend", voiced_by: noor }`; prompt "Pick the step Noor's friend should take first, then 2 more."; 6 options, 2 harmful): `stop_sharing` (stop, new: "Stop: don't move any money and don't share anything else") · `tell_trusted_adult` (stop: "today: a parent, carer, teacher or another adult she trusts") · `call_bank_known_number` (stop: "now, on the number on her card or in the app") · `change_password` (secure: "her banking login and passcodes") · harmful `keep_quiet` (scenario feedback, voiced by Noor: "She wants it to go away. But getting help early is the right move.") · harmful `one_more_to_end_it` (new: "Do one more transfer so they leave her alone"; feedback "If anyone pressures you to keep going, that's a reason to get help now.").
- **After the picks** (every branch): Noor: "She's telling her mum tonight. They'll call the bank together, go to the police, and report the account. And I'm warning the team chat."
- **Debrief (drill):** tell "Already said yes? It's not too late." · what works "Stop, tell an adult, call the bank." Layer 2 (MMR §7 order): "Stop. Tell a trusted adult today. Call the bank now on the number on the card. Change the banking login. Go to the police with an adult. Report the account. Warn friends." No consequence sentence here (it lives in 10-4 only). Habit card `stop-the-damage-first`.

**10-6 `brussels-06-desk-signin`** · genuine, high · auth · diff 5 · honest timer 35, `honest_deadline` "Gatewren requests expire after 3 minutes" · Gatewren, Waymarker Desk · you started it · `pattern: e-id-approval-on-call` (in-focus twin of boss beat 3) · **Interrupt** at 14 s, Mateus: "On the train, arriving at 6. Save me a chair and a sandwich." · callback: Stockholm
- **Setup:** "On the office laptop you opened Waymarker Desk yourself to print tomorrow's guest list, and tapped 'Log in with Gatewren'."
- **Message (auth):** `prompt: { type: sign_in, service: "Waymarker Desk", where: "Brussels, Belgium", device: "Laptop", when: "Just now" }`. Body: "Log in to Waymarker Desk?" `request: approve`; `ask` = "Log in to Waymarker Desk?".
- **Checkables (G, 5):** `prompt.service` ("It fits: Waymarker Desk, the site you just opened yourself. That isn't proof on its own, so weigh it with what you started.") · `prompt.where` ("It fits: here, in Brussels.") · `prompt.device` ("It fits: the office laptop.") · `prompt.when` (neutral) · `request` ("A login you started, to the site you opened. Approving is right.").
- **Actions:** "Approve" (`proceed`, target ★★★) · "Check the Waymarker Desk page first" (`verify_in_app` ★★★; "The page says 'Waiting for Gatewren'. You approve.") · report (0, −5) · "Deny it" (`deny_prompt`, 0; "You try again later.").
- **Debrief L1 (genuine):** tell "You opened it, chose to log in, and the request names it." · what works "Approving was right." Layer 2: "Approve only what you started. That's the whole rule, whoever calls." Habit card `only-approve-what-you-started`.

**10-7 `brussels-07-it-desk-visit`** · genuine, low · email · diff 5 · calm (no timer) · Waymarker (IT desk) · you started it (your ticket) · `pattern: remote-access-support-call` (in-focus twin of the boss) · **Interrupt** at 15 s, Teo: "Noor says the projector is 'vibing'. Is that good?"
- **Setup:** "This morning you raised a ticket on Waymarker Desk: the projector laptop keeps freezing."
- **Message (email):** from "Waymarker IT desk" <it-desk@waymarker-network.example>, subject "Re: Ticket WD-4471, projector laptop". "Hi Sam, thanks for the ticket. I'll come by at 4 to look at the laptop in person. Reply if 4 doesn't suit you. IT desk" `request: reply`; `ask` = "Reply if 4 doesn't suit you."; `references: ["Ticket WD-4471"]`.
- **Checkables (G, 3):** `sender.detail` ("It fits: the IT desk's address in the staff directory. That isn't proof on its own, so weigh it with what it asks.") · `reference` ("It fits: the ticket you raised.") · `request` ("A reply about a visit you asked for. Nothing to install, no code, no screen.").
- **Actions:** "Reply: 4 is fine, thanks" (`proceed`, target ★★★) · "Check the ticket on Waymarker Desk" (`verify_in_app` ★★★, in focus; "Ticket WD-4471: 'Visit booked, 4 pm.'") · report (0, −5) · "Delete it" (`ignore` ★★).
- **Debrief L1 (genuine):** tell "Your own ticket, answered by the IT desk you contacted." · what works "Replying was right." Layer 2: "Help you asked for, through your own channel, asks for nothing on the spot. Nobody needs your screen for that." Habit card `calm-not-paranoid`.

**10-8 `brussels-08-mateus-new-number`** · fraud (family-impersonation callback) · messenger → banking · diff 5 · timer 35; pusher at 15 s (same chat): "Please? The desk is waiting 🙏" · levers affection, urgency, small_amount · Kettle, Larchwick · **Interrupt** at 12 s, Adaeze: "Chairs: sixty. Sandwiches: questionable." · callback: Amsterdam, Rome
- **Message:** Kettle, new contact (CR-19) "+32 4•• •• •• 58", display "Mateus". "Hey, it's Mateus! Lost my phone at the station, using a friend's. The hotel wants a €60 deposit and my card won't work here. Can you send it to this account? I'll pay you back tonight 🙏 BE•• … 0419, M. Ferreira" `request: pay`; `ask` = "Can you send it to this account?"; `claims[0]` = "Lost my phone at the station, using a friend's."; `claims[1]` = "I'll pay you back tonight".
- **Checkables (4; R 2):** `sender.detail` **R** ("Not Mateus's saved number. Anyone can type his name.") · `claim` **D** ("Phones do get lost, so it can't prove anything either way. His saved number will tell you.") · `claim#2` **D** ("Friends do pay back, so it can't prove anything either way.") · `request` **R** ("Money to a new account, from a new number.").
- **Actions:** "Send €60 in the Larchwick app" (`start_transfer` → `deposit_transfer`; a messenger source, so no cap) · "Call Mateus's saved number" (`call_back_known` ★★★; "Mateus: 'My phone's right here, at eighty percent. Not me! I'm on the train.'") · "Block and report the number" (`block` ★★) · "Ignore it" (★★).
- **`deposit_transfer`:** payee typed from the message, "Mateus Ferreira"; IBAN `BE•• … 0419`; €60.00. Result **doesn't match**. Actions: "Send €60 anyway" (`pay`, fall) · "Cancel and call Mateus's saved number" (`call_back_known` ★★★) · "Cancel" (`ignore` ★★).
- **Fall:** narrative "Sent. Ten minutes later the real Mateus texts from his saved number: 'Save me a sandwich!' He knows nothing about a deposit." Damage control (6, 2 harmful): `call_bank_known_number` (stop) · `tell_real_person` (warn: Mateus, on his saved number) · `report_number_in_app` (report) · `keep_evidence` (secure) · harmful `pay_second_request` · harmful `wait_and_see`.
- **Debrief L1 (≈15):** tell "A new number, a friend's name, money to a new account." · what works "Call the number you already have." Layer 2: "A friend's name proves nothing. The name check didn't match, and his saved number reached the real Mateus." Habit card `call-the-number-you-know`.

### 30.5 How the finale reviews every chapter's habit
Every player reaches Brussels with all ten earlier chapters finished (ENGINE unlocking), so the finale may recall any of them. It does so three ways, all unscored beyond the scenarios themselves:
1. **In play (callbacks).** One scenario per habit family, at difficulty 4–5, with no new rule to learn:

| Chapter | Habit (If-then family) | Comes back in |
|---|---|---|
| Home | Who really sent this; sign in only where you started | 10-6 (a sign-in you started) |
| Berlin | Open the courier's app yourself | 10-2 |
| Amsterdam | Call the number you already know; easy money costs you | 10-8; 10-4 |
| Paris | Verify the change, not the email | 10-1 / 10-3 (same thread, real address) |
| Madrid | Hang up, call back on the number on your card | boss beats 2 and 3 |
| Warsaw | Codes are only for you; stay on the platform | boss beat 2 ("read me the code"); 10-4 (report in the app) |
| Rome | Caller ID proves nothing | boss beats 2 and 3 |
| Lisbon | Read where a link or code goes | 10-2 (look-alike address) |
| Dublin | Find the firm on the register; never pay to get money back | arc ending C (§30.6) |
| Stockholm | Approve only what you started; nobody needs your screen | 10-6, boss beats 1–3 |

2. **In the story.** The Open Evening's postcard pick (CR-44(a)): the player chooses any collected postcard, Teo reads its cue, the player flips it (STORY §3.12). One pick, no right or wrong.
3. **On the end screen** (CR-44(b)): "Your Atlas": every city's If-then line in the order played, the habit cards (earned and gold), the Belgium help card and the player's other help cards, printable. Adaeze's last line is the epigraph. No score ranking, no totals lost.

The boss combines three habits but keeps **one deciding question per beat** (RAS §8): beat 1 "did a warning give me a number to call?", beat 2 "did someone who contacted me ask to get onto my device?", beat 3 "did I start this sign-in?".

### 30.6 The arc finale block (closing the Alex arc)
Plays after the boss's debrief and damage control, before the resolution. Unscored for the chapter (arc points banked, §10.2); every content item has a debrief (Red Line 4). Engine: CR-43.

**Dispatch** (§10.3 order; evaluated on entry):

| Arc state on entering Brussels | Plays | Ending |
|---|---|---|
| Open, `alex_invested > 0` | Close beat → arc damage control → recovery-agency test → timeline | **C** |
| Open, `alex_invested = 0` | Close beat → timeline walk-through | **B** |
| Closed by Tell me now, `alex_invested > 0` | Arc damage control → recovery-agency test → timeline (R22: §10.3 wins) | **R** (C's damage control and test) |
| Closed by Tell me now, `alex_invested = 0` | Teo's chat → timeline | **R** (A's Teo scene) |
| Closed by a second Close | Teo's chat (the reveal plays inside it) → timeline | **A′** |
| Reported at slot ≤ 6 | Teo's chat (reveal inside) → timeline | **A** |
| Reported at slot 7–9, `alex_invested = 0` | Reveal → timeline walk-through | **B** |
| Reported at slot 7–9 (or earlier) with `alex_invested > 0` | Reveal → arc damage control → recovery-agency test → timeline (damage control at the report itself is not built, so it runs here) | **C** |

**Close beat `brussels-arc-close`** (role `arc`; only if the arc is still open). Messenger: your chat with Alex, the last message (slot 9's) in `earlier[]`. **Alex sends nothing new** (§28.5 item 6). Setup: "The Open Evening is tomorrow. You open your chat with Alex one more time." Options: "Do a photo check on Alex's picture" (`verify_identity`) · "Report the profile" (`report`). Both lead to the **reveal** (CR-43(b); R22: every outcome of the close beat opens it, and the photo check and report set `arc_told_someone`): under the caption **"The same picture Alex used."** (psych S), the same illustrated Alex portrait on three profile cards with different names ("Alex", "Robin", "Sacha"), text alternative "The same picture on three profiles with different names." (§28.5 item 5; BXS: the game's visualisation of a reverse image search). Under every reveal card a fixed line (R22, psych M2): "A picture that checks out proves nothing either. Telling someone is what works." The finale's reveal step (an arc closed earlier) shows the tell and habit from the chapter's `arc_finale.reveal` (content, not engine text). Debrief layer 1: tell "Same picture, other names." · what works "A photo check and a trusted person beat a feeling." Layer 2: "A clean photo check doesn't prove a profile is real: pictures can be made with AI. Telling someone is what works."
- **Arc damage control, whenever money is in** (C; R and a report with money in, R22) (scored as arc points; prompt as §9; no amounts; options shuffled like any damage control; opens with "Alex was never real. The lie was theirs, not yours." before any step): `stop_paying` (stop) · `call_bank_known_number` (stop: "it may be able to help") · `keep_evidence` (secure: "the chat history") · `report_firm_to_regulator` (report: "report Glimmerfund to the regulator") · harmful `pay_last_fee` ("Pay the release fee so the money comes out") · harmful `add_more_to_test`.

**Recovery-agency test `brussels-arc-recovery-offer`** (role `arc`; `alex_invested > 0`; §28.5 items 2 and 9). Setup: "A few days later, an email arrives." (the blame-on-the-lie line, STORY §5.8, now comes from the arc damage control just before; psych review of the scenes, M1) Email from "Backhaven Recovery" <cases@backhaven-recovery.example>, subject "We can get your money back". "Hi Sam, our records show you lost money on Glimmerfund. Our legal team works with the police and the regulator to trace it. A small release fee opens your file today: backhaven-recovery.example/file" (no amount anywhere, §28.5 item 8). `request: pay`; `ask` = "A small release fee opens your file today"; `claims[0]` = "Our legal team works with the police and the regulator"; `references: ["you lost money on Glimmerfund"]`.
- Checkables (5): `sender.detail` D · `reference` D ("Knows where you lost money. Scammers share victims' details, so it can't prove anything either way.") · `link` D · `claim` R ("Recovery firms may falsely claim to work with the police or the regulator. Regulators never contact people to recover money for a fee.") · `request` R ("A fee first, to get money back.").
- Actions: "Pay the fee to open your file" (`pay`, fall) · "Look Backhaven up on the Fairmeasure register" (`check_official_list` ★★★; "Not authorised.") · report (★★) · "Delete it" (★★).
- Fall damage control: as Dublin (`stop_paying`, `call_bank_known_number`, `keep_evidence`, `report_firm_to_regulator`, harmful `pay_recovery_service`, harmful `pay_last_fee`).
- Debrief layer 1: tell "A stranger offering your money back, fee first." · what works "Never pay to get money back." Layer 2, the Dublin line word for word: "Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam." Then (psych M2): "People who've lost money are often targeted on purpose afterwards, because scammers share victims' details. That says nothing about you." Then: "Call your bank straight away; it may be able to help." **After a fall on this test** the same M2 line is also shown in the fall's debrief (layer 1's "Already did this?" view and the damage-control feedback screen, via the outcome's authored `recovery_note`, R22), so the player who paid reads it at once. Never "again" or "twice" (§28.5 item 9). LO-13, LO-16.

**Teo's chat `brussels-arc-teo`** (role `arc`; A, A′, R without investment; §28.5 item 4). Teo, across the table, sends you a screenshot (Kettle, his saved contact "Grandpa Teo"): "Nice person from my language app. Wants to show me a trading app. Is this normal?" Quoted (`context: quoted`), from "Robin": "Teo, your postcard stories are lovely 😊 I've been making a little extra trading on my phone. Want me to show you? Just between us." The quoted message names **no platform** (Glimmerfund is never named before Teo asks, and he never does).
- R22 (psych M1): **every** option ends in the reveal (`reveal: true` on every outcome); the photo check and the report set `arc_told_someone`, stepping away does not. (Teo's photo check is done *together* with Teo, so it is telling someone; the close beat's solo photo check is not: see the next bullet.)
- **Balancing pass (T-3.13, proposed R25, CR-51):** in the **close beat**, the photo check sets `arc_checked` instead of `arc_told_someone` (the report keeps `arc_told_someone`), and the engine also sets `arc_told_someone` when any arc slot's decisive kind was `report` or `ask_someone`. Ending B's Adaeze line then has two truthful forms: `if_flag: arc_told_someone` "You told someone, and the timeline did the rest. That's the whole trick." · `unless_flag: arc_told_someone` "You never sent any money, and the timeline did the rest. Next time, telling someone early makes it even easier." (wording for learning-psychologist; scenes in T-S4l). **Ending C trims:** the recovery-agency test's fall shows its steps read-only after the arc damage control just played them (CR-53), and ending C's scene stays ≤ 3 panels (T-3.13h). Ending scenes gate any "you told someone" line on that flag, with a truthful variant (`if_flag` / `unless_flag`).
- Options: "Do a photo check on Robin's picture together" (`verify_identity`; reveal as above, showing "Robin" among the names; Teo: "Well. That settles it.") · "Tell him to report the profile" (`report`) · "Tell him to stop replying" (`ignore`) · "A little can't hurt" (`advise_comply`, CR-40; Teo: "Hmm. I'll ask Adaeze too." Teo never sends money).
- Debrief layer 1: tell "Praise, a secret, and an easy-money invitation." · what works "Do a photo check and tell someone." Layer 2 as the close beat's. After `advise_comply` the debrief adds, without blame (psych M1): "Teo asked, and that was the smart bit. With an offer like this, the answer is always no."

**Red-flag timeline** (all endings; CR-43(c); §28.5 item 3). Header above the slots (psych M3): **"Every step below was Alex's plan, not your fault."** Slots 1–9 with each slot's layer-1 tell (§10.2, §28.5 table; slot 1 "Nothing to notice yet"), the player's choice per slot in plain words, and **no amount anywhere** (R22: no "arc points banked" line either: a player who fell would see a higher number) (no `alex_invested`, no total lost; §28.5 item 8). B's walk-through is the same screen with Adaeze's resolution panel after it.
- **Choice wording per slot (psych M3)**, by the kind the player chose there:
  - `pay`: "Alex asked for money, and you sent some."
  - `reply` (asked how to join, moved chats, kept the secret, said it's probably normal): "Alex pushed, and you went along." At slot 1 (R22) a reply is just friendliness: "You replied. Nothing wrong with that."
  - `ignore` (changed the subject, stayed on Wordswap, closed the app): "You stepped back from it."
  - `ask_someone`: "You asked someone." · `report`: "You reported it." · `check_official_list` / `verify_identity`: "You checked."
- **Never** "you fell", "you were fooled", "mistake", a count of falls, a score per slot, or any amount. Validator (CR-43(c)): these words and any currency amount are rejected in timeline strings.

### 30.7 Boss 10-9 `brussels-09-boss-helpdesk`
- **Setup:** "Late afternoon in Waymarker's office. IT has been and gone, and Teo and Noor have gone to the hotel. You're loading tomorrow's slides on the projector laptop."
- **Levers:** fear (virus, card payment), authority (support, the card line, the bank), urgency, helpfulness. Pusher on beat 2 at 16 s (caller): "Are you installing it? It goes through in two minutes."
- **Real details mixed in (difficulty 5):** your bank's name, a Brussels number, the real Gatewren app, a plausible card story.
- **Design combination (fraud-researcher):** pop-up → card-line call → bank call combines RAS entry points 1 and 3 with the approval habit (EID); not a separately sourced sequence, and no debrief presents it as one.

**Beat 1, browser warning (start, 40 s; CR-42).** On the projector laptop, a news page `brussels-daily.example/culture` with a full-screen warning (game-styled, no OS or security-product look): "Security alert. Virus detected. This computer is blocked to protect your data. Call Kindhand Support now on 02 ••• •• 17. You have 5 minutes before your files are deleted." `request: call`; `ask` = "Call Kindhand Support now on 02 ••• •• 17."; `claims[0]` = "Virus detected. This computer is blocked to protect your data."; `claims[1]` = "You have 5 minutes before your files are deleted."; `phone_numbers: ["02 ••• •• 17"]`.
- Checkables (5; R 2): `page.address` **D** ("A news site. Warnings like this can pop up on ordinary sites, so it can't prove anything either way.") · `phone_number` **D** (BX3: "A Brussels number. A number on screen can be bought anywhere, so it can't prove anything either way.") · `claim` **D** ("A page can show any warning it likes, so it can't prove anything either way.") · `claim#2` **R** ("A countdown, so you call before you think.") · `request` **R** (BX2: "A warning that gives you a number to call. That's the scam: close it, don't call.").
- Actions (no engage on boss beats): "Call the number and let support fix it" (`install_or_remote`, target, fall; RAS §3) · "Close the browser and tell the IT desk" (`call_back_known` ★★★; IT desk on its directory number: "Closing it was exactly right. I'll check the laptop tomorrow anyway.") · "Close the browser" (`ignore` ★★) · report (★★).

**Beat 2, call (`arrives_after: 45`, call 30 s, `covered_by: [start]`).** On your phone. Caller ID "Marrowby" (detail "+32 2 ••• •• 64 · Not a saved contact"). Transcript: "Good afternoon, Marrowby, the card-blocking line. We're calling about your Larchwick card." (`claims[0]`) · "A payment of €1,240 is waiting to go through." (`claims[1]`) · "To block it, install Kindhand on the computer you're using and read me the code it shows." `request: install`. CR-30 excludes `install` from `ask`, so (as 9-8) there is no `request` checkable: `claims[0]` = "Marrowby, the card-blocking line. We're calling about your Larchwick card."; `claims[1]` = "install Kindhand on the computer you're using and read me the code it shows"; `references: ["your Larchwick card"]`; the payment line is uncheckable story text.
- Checkables (4; R 2): `caller_id` **D** (SK1 wording: "Shows Marrowby. A caller can set the name and number on your screen, so it can't prove anything either way.") · `reference` **D** ("Knows your bank. Lots of people bank there, so it can't prove anything either way.") · `claim` **R** (BX1: "The real card-blocking line never calls you first. It's a number you call.") · `claim#2` **R** (BX4: "Install an app and read out a code, for someone who called you. A genuine bank employee never asks you to install remote-access software.").
- Actions: "Install Kindhand and read out the code" (`install_or_remote`, target, fall) · "Hang up and call the number on your card" (`call_back_known` ★★★; "Larchwick: 'No payment waiting. The card-blocking line never calls you first, and we'd never ask you to install anything.'") · "Hang up" → "What now?" (as §6) · report.

**Beat 3, call (`arrives_after: 45`, call 30 s, `covered_by: [start, card_call]`).** Caller ID "Larchwick Bank" (detail "+32 2 ••• •• 00 · Not a saved contact"). Transcript: "Larchwick fraud team. Marrowby passed your case to us." (`claims[0]`) · "Approve the security sign-in Gatewren is showing you now." (`ask`) · "Then switch off your phone for an hour, so the scammers can't reach you." (`claims[1]`). **Banner** (auth, display only, §17 rule): "Gatewren · Log in to Larchwick internet bank · Windows computer · Antwerp · Just now". `request: approve`. Written so it reads true whatever the player did at beats 1–2.
- Checkables (4; R 2): `caller_id` **D** (SK1) · `claim` **D** ("Card lines and banks do work together, so it can't prove anything either way.") · `request` **R** (BX5: "A sign-in you didn't start, for a caller.") · `claim#2` **R** ("Switching off your phone cuts you off from your bank's alerts. That's what they want.").
- Actions: "Approve it and switch off your phone" (`approve_prompt`, target, fall) · "Deny it, hang up and call the number on your card" (`call_back_known` ★★★; "Larchwick: 'That wasn't us. Your account's fine. Keep your phone on.'") · "Deny it" (`deny_prompt` ★★) · report (★★).

**Interrupt** (`after_beat: bank_call`, genuine, `on_fall: skip`; Kettle, Noor's saved contact): "Grandad wants to know if the projector works yet 😄 Also Mum says hi." Actions: "Reply: nearly!" (`proceed`) · "Report the message" (report; genuine report; "You reported it. Careful is good; this one really was Noor.").

- **Counts:** R = 2 + 2 + 2 = **6**; decoys on scheduled beats 3 + 2 + 2 = **7**. Max 3 × 15 + 6 = **51**. Fall cap (T-2.8).
- **Fall narrative** (RAS §3, narrative cut only; §29.5). Beat 1: "You call. A calm voice asks you to install a helper app and read out its code. You do. The pointer starts moving on its own… Then the screen goes dark: 'Repair in progress. Do not turn off.'" Beat 2: "You install it and read out the code. The pointer starts moving on its own. Then the screen goes dark: 'Repair in progress. Do not turn off.'" Beat 3: "Gatewren: 'Logged in.' Your phone is off. When you switch it back on, Larchwick has sent three alerts." No amount.
- **After a fall** (merged, cap 6; RAS §6 order): `go_offline` (stop: "turn off the laptop's wifi or unplug it") · `call_bank_known_number` (stop: "switch your phone back on if it's off, then call your bank now on the number on your card; ask it to block your card and banking app") · `change_password` (secure: "banking and email first, from another device") · `get_device_checked` (secure: "uninstall what you were told to install, and have IT check the laptop") · harmful `let_caller_finish` · harmful `pay_to_unlock` (new). Police report and "tell someone" are named in layer 2. The list is merged across beats and cannot be ordered per beat (one `damage_control` per scenario), so a beat-3-only faller (phone switched off, laptop untouched) is served by the "switch your phone back on" wording in `call_bank_known_number` (fact-check S3). Every fall outcome sets `brussels_bank_called` (story only).
- **Layer 1 (boss and stamp screen, ≈22):** tell **"A pop-up number, a 'card line' calling you, a sign-in you didn't start."** · what works **"Nobody needs your screen. Call the number on your card."**
- **Layer 2, per beat:** beat 1 "A real virus warning on a web page never gives you a number to call. Close it." · beat 2 "The real card-blocking line never calls you first. A genuine bank employee never asks you to install remote-access software." · beat 3 "A sign-in you didn't start, and 'switch off your phone'. Keep your phone on and call your bank." `already_clicked.shared_code`: "Installed it, read out a code or approved it? Go offline, call your bank on the number on your card, change your passwords from another device, and get the device checked. It can happen to anyone, and telling someone helps." Report to the police: "Go to the police with screenshots, the numbers used and a short timeline" (BXS help card wording, organisations only on the card).

### 30.8 Strategy check (as §7.2)
**Assumptions:** CR-17/18/19/22/23/30 landed; CR-40 built (else see row 12 note); CR-42 or its fallback (no scoring effect). R counts scheduled beats only. Flags on `fee_page`, `invoice_transfer`, `reprint_transfer` and `deposit_transfer` count toward spotted, not R. The arc finale block and drill 10-5 are outside the chapter max.
- **Standard fraud:** 10-2 R 2 (19), 10-3 R 2 (19), 10-4 R 2 (19), 10-8 R 2 (19) = **76**. Decoys on scheduled beats: 10-2 3, 10-3 3, 10-4 2, 10-8 2, boss 7 = **17**.
- **Genuine:** 3 × 15 = **45**. Own checkables: 10-1 5, 10-6 5, 10-7 3 = **13**.
- **Boss:** R 6, max **51** (tags capped at +6).
- **Totals:** max = 76 + 45 + 51 = **172**. R = 8 + 6 = **14**: silver needs spotted ≥ ceil(14/3) = **5**, gold ≥ ceil(28/3) = **10**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed on genuine, best advice to Noor | 76 + 45 + 51 | 172 | 100% | 14 | **Gold** |
| 2 | Ideal + checks 10-1 and 10-6 before acting, and 10-7's ticket (in focus) | same | 172 | 100% | 14 | **Gold** |
| 3 | Curious ideal: opens 10-2's fee page, then closes it and opens the app | 172 − 5 | 167 | 97.1% | 14 | **Gold** |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | 4 × 14 + 45 + (30 + 6) | 137 | 79.7% | 14 | Silver |
| 5 | Ideal but reports Ruchelune's real invoice (10-1) | 172 − 15 − 5 | 152 | 88.4% | 14 | Silver |
| 6 | Tag everything + always verify | bonuses void: 60 + 45 + 45 | 150 | 87.2% | 14 − (17 + 13) = −16 | Bronze |
| 6a | Random single tag per beat + always verify (expected) | 150 + 2 × (⅖ + ⅖ + ½ + ½) + boss: +6 at a one-in-ten chance (0.4 × 0.5 × 0.5) | ≈154 | ≈89.7% | 3.2 − 3.8 − 3 ≈ −3.6 | Bronze (silver unreachable: 7 hits at best − 3 genuine tags = 4) |
| 6b | Always tag the sender / caller ID / page address + always verify | 150 + 2 (10-8); 10-2, 10-3, 10-4 and boss void | 152 | 88.4% | 1 − (6 + 2) = −7 | Bronze |
| 6c | **Always tag the request** + always verify | 150 + 2 (10-3) + 2 (10-4) + 2 (10-8) + 4 (boss: b1, b3; b2 has none); 10-2 void | 160 | 93.0% | 5 − (1 + 3) = 1 | Bronze |
| 6d | Request + every claim + always verify | 150 + 4 (10-3) + 4 (10-4); 10-2, 10-8, boss void | 158 | 91.9% | 12 − 9 = 3 | Bronze |
| 7 | Blind always-verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 8 | Blind always-report | 40 + 30 − 15 | 55 | 32.0% | 0 | Bronze + calibration tip |
| 9 | Blind always-dismiss | 40 + 30 + 0 (10-1) + 0 (10-6) + 10 (10-7) | 80 | 46.5% | 0 | Bronze |
| 10 | Always trust, perfect damage control | 45 + 3 × 9 + 0 (10-4: `advise_comply`, no fall, no damage control) + 9 | 81 | 47.1% | 0 | Bronze |
| 11 | **"Support will fix it"**: falls for boss beats 1 and 2, ideal elsewhere | 172 − 51 + boss (b1 0, b2 0, b3 15, tags +4, DC 9 = 28) | 149 | 86.6% | 14 − 2 − 2 = 10 | **Silver** (rating < 90) |
| 12 | **"Probably fine"**: gives Noor the bad advice, ideal elsewhere | 172 − 19 | 153 | 89.0% | 14 − 2 = 12 | **Silver** (rating < 90) |
| 13 | Approves the "bank" sign-in (boss beat 3), ideal elsewhere | 172 − 51 + (15 + 15 + 0 + 6 (4 correct tags earn 8, capped) + 9) | 166 | 96.5% | 14 − 2 = 12 | Gold (one fall) |
| 14 | Two falls: pays 10-3's new account and approves boss beat 3, ideal elsewhere | 172 − 10 (10-3: 19 → 9) − 6 (boss 45) | 156 | 90.7% | 14 − 2 − 2 = 10 | Gold today; **Silver** under R24 (two falls, §7.3) |
| 13a | Approves boss beat 3, damage control scores 0, ideal elsewhere | 172 − 51 + (15 + 15 + 0 + 6 + 0) | 157 | 91.3% | 14 − 2 = 12 | Gold today; **Silver** under R24 (fall not recovered, §7.3) |

Row notes:
- **6a hit chances:** 10-2 2/5, 10-3 2/5, 10-4 2/4, 10-8 2/4, b1 2/5, b2 2/4, b3 2/4; expected correct 3.2. The boss bonus survives only if all three beat tags hit (0.4 × 0.5 × 0.5, a one-in-ten chance), worth +6 then.
- **6b:** the sender, caller ID or page address is R only on 10-8, a decoy on 10-2, 10-3, 10-4 (the forwarded sender) and every boss beat; genuine senders on 10-1 and 10-7 (10-6 has none). 10-2's link would be a correct tag, but the row tags senders only.
- **6c:** the request is R on 10-3, 10-4, 10-8, b1 and b3, a decoy on 10-2, absent on b2 (`install` carries no `ask`, CR-30), and a genuine detail on 10-1, 10-6 and 10-7. 10-2's request is a decoy on purpose (where you pay is the tell, not that a fee is asked); with it as R this row would net 3, still bronze but closer.
- **6d:** correct = claims 10-2, 10-3, 10-4, b1#2, b2#1, b2#2, b3#2 (7) + requests 10-3, 10-4, 10-8, b1, b3 (5) = 12; wrong = 10-2 request, 10-8 claims ×2, b1 claim, b3 claim (5) + genuine 10-1 claim and requests 10-1, 10-6, 10-7 (4) = 9. Net 3, two short of silver.
- **Row 11** is the chapter's point: trusting "support" costs two boss beats and stays silver.
- **Row 12:** bad advice to Noor scores 0 without a fall, so the chapter shows it matters (silver) without ever showing Noor harmed. **Without CR-40** (fallback, §30.10): the bad advice is a `reply` leading to a second advice beat, capped at ★★, so the row reads 172 − 9 = 163 (94.8%), gold; the fallback is weaker on purpose-ranking, which is why CR-40 is recommended.
- **Row 14:** two well-recovered falls still reach gold (as Dublin and Stockholm rows 12). Input to R15; R15 stays with the balancing pass. **Balancing pass (T-3.13):** silver under proposed R24 (`max_falls: 1`); row 13 (one recovered fall) stays gold; row 13a (one unrecovered fall) becomes silver (§7.3).
- **Without CR-42:** no scoring change.

### 30.9 Brussels reveal rulings
- **BX1. The card-blocking line.** "The real card-blocking line never calls you first. It's a number you call." Only about the card-blocking line, never widened to "your bank never calls you" (real banks sometimes do; BXS rules, RAS §4.4). The in-world line is **Marrowby** (fictional); the real one appears only on the help card.
- **BX2. A warning with a number is R.** "A warning that gives you a number to call. That's the scam: close it, don't call." Never "this is malware" or how it got there.
- **BX3. Local numbers are decoys.** A Brussels or Belgian-looking number "can't prove anything either way" (RAS §3.1).
- **BX4. Install or share-screen requests are R** with the sourced line "A genuine bank employee never asks you to install remote-access software." What the app could do: only "they could see and do what you can" (RAS §6, Red Lines 2 and 4).
- **BX5. Approvals:** as SK2 (the deciding line is "did you start it?").
- **BX6. Real addresses in real threads are decoys** (as Paris): a real mailbox can be misused; the change is the tell.
- **BX7. Money-mule wording** (MMR §6, §7, §10): the consequence sentence appears once, in 10-4's layer 2 only, always followed by the next step; the pressure sentence is the only mention of pressure; never on screen: punishments, prison imagery, parents' liability, threats, "you won't be in trouble", whether anyone "knew", or how money moves. Noor and her friend are targets, never criminals.

### 30.10 Brussels change requests (to `frontend-engineer`)
- **CR-40 (non-blocker, recommended): advice scenarios.** (a) `advice: { for: <cast id> }` on a standard scenario or arc beat: the player advises a cast member about a message they forward. (b) `message.forwarded: { app: <brand id>, sender: { display, detail }, body }` renders the forwarded message as a quoted card inside the cast member's bubble; checkables `forwarded.sender`, the forwarded body's `claims`, `ask` (→ `request`) and `references` (scenario truth = the forwarded message's truth; the cast member's own bubble is never checkable). (c) New action kind `advise_comply` (class comply, fraud only, advice scenarios only): scores 0 like a fall but **is not a fall**: no damage control, no wallet loss, no +15 stress, no "This could happen to anyone." line; "You chose" names the advice. Validator: every advice scenario's outcomes keep the cast member safe (no `pay`/`enter_details`/`share_code` outcome for them). Fallback: author bad advice as `reply` (engage) to a second beat where the cast member asks again with the good options; capped ★★ (§30.8 row 12 note).
- **CR-41 (non-blocker): damage control for someone off-cast** (extends CR-32). `recovery_for: { label: <text>, voiced_by: <cast id> }`: prompt "Pick the step {label} should take first, then 2 more."; harmful-pick overrides voiced by `voiced_by`. Drills only. Fallback: Home 0-5's generic prompt with Noor's message "What should she do first?".
- **CR-42 (non-blocker): browser warning overlay.** `page.overlay: { title, body }` drawn over the page as a game-styled panel (Waymarker training frame; no operating-system, browser or security-product look, no real icons, no sound, no fullscreen API, no `beforeunload`, no real countdown: the beat timer is the only clock). Its phone number and claims are checkable as message text; a visible "Close" maps to the beat's dismiss action. Fallback: the warning text is the page's `page.info`, and the page itself is the warning.
- **CR-43 (blocker for the finale): the arc finale block.** (a) A chapter field `arc_finale: true` (Brussels only) that runs, after the boss's debrief and damage control and before the resolution, the dispatch in §30.6 from the saved arc state (open/closed, how closed, report slot, `alex_invested`). (b) The **reveal card**: a `verify_identity` outcome may open a grid of 3 profile cards using the one Alex portrait with different names under the caption "The same picture Alex used." (alt and text list), reused by Tell me now. (c) The **red-flag timeline** screen: the header "Every step below was Alex's plan, not your fault.", slots 1–9, each slot's layer-1 tell, the player's choice in the fixed wording of §30.6 (per kind), arc points; validator: no currency amount, no `alex_invested` value, no count of falls, and none of "fell", "fooled" in any timeline string. (d) Scene variants keyed to the arc ending (`if_arc_ending: [A, A_prime, B, C, R]` plus `if_flag: alex_invested`) and a resolution made of several scenes in order (`resolution: [opening variant, ending scene, feelings, part 2]`); ENGINE "Not in S3" lists these as open. (e) The recovery-agency test plays in the finale for every `alex_invested > 0` ending, also when the arc closed earlier. (f) Arc slots keyed to play position (STORY §1.4; ENGINE "Not in S3") must land before Brussels, so that slot 9 is the last arc beat.
- **CR-44 (blocker for the finale's last screen, non-blocker for scenarios): Open Evening and end screen.** (a) The postcard pick: the player picks one collected postcard (a list of city names), Teo reads its cue, the flip as STORY §3.12 (ENGINE: "a player choice of postcard is not built"). (b) The end screen "Your Atlas": every If-then line in play order (reusing `AtlasPages`), habit cards earned, with gold shown as a small mark on each mastered card (never as a count; psych, optional), the help cards, Adaeze's last line as the epigraph, printable; no ranking, no totals lost, no streaks.
- Uses CR-17/18/19/22/23/26/30, CR-31(b) not needed (no transfer from a fraud call), CR-32 via CR-41, the §17 banner rule (boss beat 3), the existing `auth` device (10-6) and the `browser` device (10-2, boss beat 1).

### 30.11 New brands, cast, content
**Brand proposals** (fictional; ux-artist registers them in `brands.yaml`; fraud-researcher runs BRAND_CHECK before use; lists of real names stay in BRAND_CHECK.md):
- **Marrowby** (genuine in-world card-blocking line; impersonated on boss beat 2; R19(6)): "Marrowby, the card-blocking line"; an invented place-like word with no stop or card meaning. Known channel "the number on the back of your Larchwick card and in the Larchwick app" (masked). No domain needed. Never styled like the real Belgian card-blocking service: no shared colours, and a number that doesn't resemble it. BRAND_CHECK against card-blocking services and banks.
- **"Summer Euro Club"** (`@summer_euro_club`, no dot, so the handle never ends in a real TLD; scam-only recruiter profile on Postwick, 10-4). Alternative "Quick Cash Crew". Scam-side name.
- **`brussels-daily.example`** (a fictional news site hosting the boss pop-up; genuine site, malicious ad). Alternative `capital-courant.example`.
- **Reused:** Kindhand (helper app, as §29.10; no store page needed: the fall is narrative), Postwick, Backhaven Recovery, Glimmerfund (arc finale only, after the reveal), Fairmeasure (CR-38), Larchwick (+ Larchwick Pro), Gatewren, Waymarker Desk and IT desk, Ruchelune, Trundle (+ `trundle-redelivery.example`), Kettle.
- **Scam-side names (name register):** "Robin" and "Sacha" (reveal cards and Teo's chat; never cast), "Summer Euro Club", "M. Ferreira" (10-8 payee; borrowed from Mateus, never his fault). Not cast first names (STORY §2.3 register checked).
- **Cast:** no new cast. Noor's friend is unnamed, never drawn, never cast. Adaeze, Teo, Noor and Mateus already in `content/cast.yaml`.
- **Recovery steps (new):** `stop_sharing` ("Stop: don't move any money and don't share anything else") · harmful `one_more_to_end_it` ("Do one more transfer so they leave you alone"; feedback "If anyone pressures you to keep going, that's a reason to get help now.") · harmful `pay_to_unlock` ("Pay the fee to unlock the screen"; feedback "Paying only adds to the loss; the locked screen is part of the trick. It's safe to switch it off or unplug it. Go offline and call your bank."). Reused: `go_offline`, `get_device_checked`, `let_caller_finish` (Stockholm); `stop_paying`, `pay_recovery_service`, `pay_last_fee`, `add_more_to_test`, `report_firm_to_regulator` (Dublin); `call_bank_known_number`, `block_card_in_bank_app`, `tell_trusted_adult`, `tell_real_person`, `keep_evidence`, `keep_transfer_evidence`, `report_number_in_app`, `report_to_police_online`, `change_password`, `keep_quiet`, `pay_second_request`, `wait_and_see`, `reply_to_scam_text`, `reply_to_scam_email` (earlier chapters; the writer uses each chapter's shipped id).
- **Habit cards:**
  - **New `a-real-friend-never-needs-your-money` (LO-14).** Title "A real friend never needs your money". Habit: "Someone you've only met online moves you to another app, wants secrets, or steers you to money? Tell someone you trust, do a photo check, and never send money." Example: "A new online friend's 'easy profits' come with an invitation? Ask someone before you reply." Already clicked: "Sent money already? Stop paying, call your bank on the number on your card, and keep the chat history. Ignore anyone who offers to get it back for a fee."
  - **`easy-money-costs-you` (LO-12; shared with Amsterdam):** new example only (the habit line stays; R19(5)): "Someone online wants to 'use your account for a few transfers'? Say no and ask someone." Already-clicked addition: "Shared your login or card? Change your login, call your bank on the number on your card, and tell a trusted adult." Approved (R19(5)).
  - `nobody-needs-your-screen` (§29.10), `ask-someone`, `stop-the-damage-first`, `call-the-number-you-know`, `check-who-gets-the-money`, `only-approve-what-you-started`, `open-it-yourself`, `calm-not-paranoid`: bodies unchanged.
- **Atlas page:** `atlas_cards: [easy-money-costs-you, nobody-needs-your-screen, a-real-friend-never-needs-your-money, ask-someone]` (STORY §3.10).
- **"Where to report and get help" (Belgium) card:** wording in `docs/patterns/ch10-brussels-sources.md` ("Belgium help card"), crisis row last and on its own, the under-18 police line on the card. Linked from layer 2 of every Brussels debrief and from the end screen.
- **Content note** (shown on the map before the chapter; R19(4), STORY §5.6 updated to match): "This chapter ends the trip, including the Alex storyline. It touches on friendship, feeling let down, money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away." If the arc already closed with Tell me now: "This chapter ends the trip and touches on money and a teenager being offered easy money. You can pause or skip any story scene, and help is one tap away." Sensitive scenes: the ending scenes and the feelings scene.
- **Chapter file:** `content/chapters/brussels.yaml`: slot 10; `patterns: [remote-access-support-call, money-mule-recruitment]`; `callbacks: [payment-detail-change, smishing-parcel-fee, messenger-family-impersonation, e-id-approval-on-call, recovery-scam]`; am `[01, 02, 03]` (stop point after 03), pm `[04, 05, 06, 07, 08, 09]`; `boss: brussels-09-boss-helpdesk`; `arc_finale: true` (CR-43); intro and rules as §30.1; `content_note` and `content_note_arc_closed` as above; `scenes: { arrival: brussels-arrival, turn: brussels-turn, resolution: [brussels-resolution-open, brussels-ending-<variant>, brussels-feelings, brussels-open-evening] }` (CR-43(d)).

### 30.12 Hand-over check (§28.5 and §29.5)
| # | Item | Where it is met |
|---|---|---|
| 28.5-1 | Close the arc for everyone still open (C if invested, else B; earlier endings honoured) | §30.6 dispatch table; close beat ✓ |
| 28.5-2 | Ending C's recovery-agency test, fee first, Backhaven, Dublin's steps, no refund promise | §30.6 recovery-agency test and arc damage control ✓ |
| 28.5-3 | Red-flag timeline, slots 1–9, slot 1 "Nothing to notice yet" | §30.6 timeline; CR-43(c) ✓ |
| 28.5-4 | Teo scene: a similar profile; Glimmerfund never named before Teo asks | §30.6 Teo's chat (no platform named at all) ✓ |
| 28.5-5 | The reveal: same portrait, other names | §30.6 reveal card; CR-43(b) ✓ |
| 28.5-6 | No new Alex request in the finale | §30.6 close beat (Alex sends nothing new) ✓ |
| 28.5-7 | Remote-access boss extends Stockholm's preview with Kindhand and "Nobody needs your screen" | §30.7 boss; habit card and Atlas page ✓ |
| 28.5-8 | No amounts lost on screen | §30.1 never on screen; §30.6 (no amounts in the email, damage control or timeline); CR-43(c) validator ✓ |
| 28.5-9 | Blame the lie first; the Dublin line; never "again" or "twice" | §30.6 recovery test setup and layer 2 ✓ |
| 29.5 | Kindhand reused (non-functional, game screen), the card, steps `go_offline`, `get_device_checked`, `let_caller_finish`; further than Stockholm only as narrative | §30.7 fall narrative (a narrative cut) and merged steps ✓ |

### 30.13 Open questions for the producer (Brussels)
1. **Noor never says yes; the "already said yes" steps go to drill 10-5 (Noor's unnamed friend).** **Answered (R19(1)): Noor never says yes in any branch**; the steps are taught through drill 10-5.
2. **CR-40 `advise_comply` (0, not a fall) vs the fallback (★★).** **Answered (R19(2)): build CR-40**, not the fallback.
3. **Adaeze's last line vs the If-then panel.** **Answered (R19(3)):** the panel just before Noor's If-then, and the end screen's epigraph (§30.2; STORY §1.5, §3.10 updated).
4. **Content note: add "and a teenager being offered easy money"?** **Answered (R19(4)): yes** (§30.11; STORY §3.10 and §5.6 updated).
5. **`easy-money-costs-you` example and already-clicked additions** (shared Amsterdam card). **Answered (R19(5)): approved**; the habit sentence is unchanged.
6. **Card-blocking line name.** **Answered (R19(6), sceptic rounds 1–2): "Marrowby"**, pending BRAND_CHECK; Stillcard, Cardhalt and Haltwell rejected as echoes of the real name's meaning.
7. **Arc ending C damage control timing.** When the arc closed earlier with an investment, damage control ran at close (§10.2) and the finale plays only the recovery-agency test. **Answered (R19(7)): accepted**; the test belongs at the end because a recovery offer arrives later in real life.
8. **Row 14** (two well-recovered falls still gold). **Answered (R19(8)): input to R15** at the balancing pass, as Dublin and Stockholm rows 12.
9. **For fraud-researcher:** (a) the boss as a design combination (pop-up, card-line call, bank call); (b) "Repair in progress. Do not turn off." as the dark-screen line: screen blocked (RAS §3); the on-screen text is design (fact-check PASS, S4); (c) 10-4's "two mutual friends" and "loads of people at your school" (MMR §3 "friend of a friend", social proof); (d) the recovery email's "works with the police and the regulator" (BXS ending C row); (e) amounts €1,180, €480, €1.95, €60, €1,240, €300 (illustrative, never typical; none is a loss).
10. **For learning-psychologist:** (a) 10-4 and drill 10-5 wording for a 14+ audience; (b) the debrief line after `advise_comply` (round 1 M1: "Noor asked, and that was the smart bit. With an offer like this, the answer is always no."); (c) whether the reveal card should follow a confirmation for players who reported Alex early (A), who have not seen it before.

### 30.14 Writer's deviations (T-3.12 part 1, scenario-writer, 2026-11-19; for review)
Where the authored content differs from §30.1–§30.11, and why. Everything else is as specified.
1. **`tell_trusted_adult` in every personal-money fall** (§30.4 shared rule, as Dublin 8-3 and Stockholm 9-8): added as a stop step to 10-2, 10-8, the boss, the recovery-agency test's fall and the arc damage control. To keep 6 options with exactly 2 harmful: `keep_evidence` moves to layer 2 / "Already did this?" in 10-2, 10-8 and the arc damage control (the chat history stays in the close beat's and the habit card's already-clicked lines); `change_password` moves to the boss's layer 2 and `already_clicked.shared_code` ("from another device"). 10-3 is the events account (no change).
2. **Shared step ids:** "reply to the scam text/email" is the shipped `reply_ask_money_back` (10-2, 10-3, with scenario feedback); 10-3's and 10-8's "call the bank, ask it to try to stop or recall" is `call_bank_stop_payment`; 10-3's warn step is Paris's `warn_creditor_known_number`. Per-step wording in brackets in §30.4/§30.7 (e.g. "turn off the laptop's wifi", fact-check S3's "switch your phone back on") cannot be authored per scenario (labels are shared, feedback is for harmful steps only), so it is in layer 2 and already_clicked.
3. **Close beat body:** a chat beat needs a body and Alex sends nothing new, so Alex's last message (slot 9's) is the body rather than `earlier[]`, without its amount sentence, so no amount a player may have sent appears in the finale (§28.5 item 8).
4. **Layer-1 budget (40 words with the longest "You chose" line):** 10-1's tell is "A bill you expected, to the usual account."; the boss's tell is "Pop-up number, 'card line' call, sign-in you didn't start." (what-works lines unchanged).
5. **10-1 neutral reveals:** the sender address and invoice number look the same on 10-3 (the real mailbox, misused), so 10-1 uses the neutral wording for both (CONTENT_GUIDE test, Paris P1); "It fits" stays on the claim and the request.
6. **Boss site:** `weekfold.example` ("Weekfold", a coined culture-listings site), replacing `brussels-daily.example` ("<city> Daily" is a common real news-brand pattern) and, after sceptic S1 in round 1, "Capital Courant" ("Capital" echoes a real Brussels daily). No city stem and no echo of Belgian news brands (checked by name against the list in brands.yaml); web-checked 2026-11-19 with no match; TMview/KBO trademark search pending (G4 watch). Boss beat 1 also authors `page.info` (the shared padlock line), one more decoy.
7. **10-2's fee page** carries an `ask` and a request flag (CR-17 needs an ask on every scored non-banking pay beat from slot 2).
8. **Callbacks cap:** balance.yaml allows 2 callbacks per chapter; §30.1 lists 5. The validator now exempts `arc_finale` chapters (scripts/lib/rules.ts), so the chapter stays `complete` with every other mix rule enforced. For game-designer to confirm (or move into balance.yaml).
10. **Round-1 fixes (2026-11-19):** "tell someone you trust" in the money-loss already-clicked lines (habit card, close beat, recovery test); Teo's chat without "praise" (unsourced) and with "secret" cited to ie-ccpc-investment-scams; the LO-14 card drops "wants secrets"; `pay_to_unlock` feedback "Disconnect it from the internet and call your bank."; `one_more_to_end_it` label "Do one more transfer to make it stop" (neutral; GDD §30.4/§30.11 wording superseded); the boss's beat-3 fall (an approved sign-in) has its own steps (bank, trusted adult, change password, police; harmful `approve_again_to_cancel`, `wait_and_see`); drill 10-5's other branch runs the same damage control; new sources be-febelfin-help-request-fraud, be-police-hi-mom-smishing, be-fsma-dating-platforms-2026.
11. **Open for game-designer / balancing (round 1, not changed here):** psych 1 (RESOLVED: recovery-offer setup trimmed; the "never real, the lie was theirs" line plays twice for ending C: the arc damage control's engine intro and the recovery test's setup); psych 4/5 (shared step labels across chapters, e.g. `tell_trusted_adult` "(if you're under 18)" and second-person labels in a drill about someone else); fact-check notes 1, 2, 4 and 5.
12. **Item 11 ruled at the balancing pass (T-3.13, proposed R27; content tickets T-3.13c–g):**
    - **Psych 4, `tell_trusted_adult`:** the label "Tell a parent or trusted adult now (if you're under 18)" reads as optional for adult players while it scores as `stop`. New shared label: **"Tell someone you trust now (under 18: a parent, carer or another adult you trust)"**. Category unchanged (`stop` in every personal-money fall).
    - **Psych 5, second-person labels in a drill about someone else (10-5, also 0-5, 5-7, 6-6):** accepted. The prompt already names who the steps are for (CR-32/CR-41), and the labels read as the advice you pass on. No per-drill label overrides.
    - **Psych, duplicated steps on `easy-money-costs-you`:** one already-clicked line in the MMR §7 order: **"It's not too late: paid, or shared your login or card? Stop: no last fee releases the money. Tell someone you trust today, call your bank on the number on your card, then change your login. Keep the chats."** Money-mule case flagged for fraud-researcher (T-3.13g): whether to add "Money arrived in your account? Don't pass it on; tell your bank."
    - **Fact 1, `go_offline` on a laptop:** new shared label **"Take the device offline: wifi off, cable out or airplane mode"** (fits a phone, 9-8, and the projector laptop, boss).
    - **Fact 2, police-online label for Belgium:** Brussels uses the plain `report_to_police` ("Report it to the police") in 10-2, 10-3 and the boss; the help card names the channel.
    - **Fact 4, Marrowby decoy (boss beat 2 `caller_id`):** "can't prove anything either way" sat next to the claim reveal "the real card-blocking line never calls you first". New reveal: **"Shows Marrowby. A caller can make any name and number show on your screen, so the screen can't prove who is calling. Judge what the caller says and asks."** Caller ID stays a decoy (SK1); the tell stays on the claim (BX1).
    - **Fact 5, 10-4 `already_clicked.entered_details`:** MMR §7 order, bank before login: **"Already shared it? It's not too late: stop replying, tell someone you trust today and call your bank on the number on your card. Then change your login."**
9. **Psych notes for the ending scenes** (part 2, not written here): ending A's "never too late to start" line is gated so a player who told someone earlier (a report, "Tell me now", or `arc_told_someone`) is not told to "start"; ending C never says "you checked before anything else" when money went in ("And you checked in the end. That's what works.").

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
- **CR-30** (Madrid and Warsaw, blocker for request parity from slot 4) `ask` on every request type, required from slot 4. §24.9.
- **CR-31** (Madrid, non-blocker) On-call bar over a banking beat reached from a call; **CR-31(b)** (blocker for the R16 scoring) `start_transfer` with `cap: engage` when reached from a fraud call. §24.5, §24.9.
- **CR-32** (Warsaw, non-blocker) Damage control for a cast member in a drill (`recovery_for`). §25.10.
- **CR-33** (Warsaw, blocker for 5-1, 5-5 and boss beat 1, or fallback) Marketplace view. §25.10.
- **CR-34** (Warsaw, non-blocker) Code then confirm: non-terminal `share_code` into a confirmation banking beat, ★★ cap (R18). §25.4, §25.10.
- **CR-35** (Warsaw, blocker for boss beat 1; built per R14) An engage that ends a boss beat at ★★. §25.10.
- **CR-36** (Rome, non-blocker) A voice label on calls (`message.voice: { sounds_like: <cast id> }`) and a `voice` checkable, always neutral ("sounds like Teo; a voice can be copied"). Fallback without it: the same text as a decoy claim. §26.9.
- **CR-37** (Lisbon, non-blocker) `qr.mount: printed | sticker` on `qr` beats and a `qr.mount` checkable (the sticker as a supporting clue; the destination stays the lesson). Fallback without it: the sticker moves into the meter text and a claim. §27.9.
- **CR-38** (Dublin and Alex arc slot 5, non-blocker) An in-world regulator view (Fairmeasure): a home-screen tool, available in every chapter, with two tabs, "Register of authorised firms" and "Warning list"; `check_official_list` outcomes open it on a result card (authorised, with the register's own contact details · not on the register · on the warning list). Fallback: the outcome narrative states the result in words. §28.9.
- **CR-39** (Stockholm, non-blocker) (a) The CR-31 on-call bar also over an `auth` beat reached from a `call` beat; (b) a QR code inside a `messenger` message, with its destination chip and the `qr.destination` checkable. Fallbacks: (a) the auth beat's setup line says "The caller is still on the line."; (b) the code is shown as the message's `image` with the destination named in the body text. §29.9.
- **CR-40** (Brussels and the Teo ending, non-blocker, recommended) Advice scenarios: `advice: { for: <cast id> }`, a forwarded message card with its own checkables, and kind `advise_comply` (comply class, 0, not a fall: no damage control, no wallet loss). Fallback: bad advice as a `reply` to a second advice beat, ★★ cap. §30.10.
- **CR-41** (Brussels drill 10-5, non-blocker) `recovery_for: { label, voiced_by }` for someone who is not cast (extends CR-32). Fallback: the generic prompt plus the cast member's question. §30.10.
- **CR-42** (Brussels boss beat 1, non-blocker) A game-styled browser warning overlay (`page.overlay`), no OS or security-product look, no sound, no fullscreen, no real countdown. Fallback: the warning as `page.info`. §30.10.
- **CR-43** (Brussels, blocker for the finale) The arc finale block: dispatch by arc state, the reveal card, the red-flag timeline (validator: no amounts), scene variants keyed to the arc ending and multi-scene resolutions, the recovery-agency test for every invested ending, arc slots by play position. §30.6, §30.10.
- **CR-44** (Brussels, blocker for the last screen) The Open Evening postcard pick and the "Your Atlas" end screen (all If-then lines, habit cards, help cards, Adaeze's line as epigraph; printable; no ranking). §30.5, §30.10.

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
