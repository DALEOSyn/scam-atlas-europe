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

**Tutorial grace (chapter slot 0 only, ruling L4; balance `tutorial_grace`).** `report` on a genuine message (high or low stakes) earns **★, 0 points** (no −5), and `dismiss` on a genuine high-stakes message earns **★, 0 points**. Stamps are unchanged: the report still counts as "genuine message reported". ★ at 0 points stays below ★★ (10); ties with a ★ fall (6–9 points) are acceptable. Not applied to a timer running out (that is not a choice). From slot 1 the table above applies: the over-report cost is part of LO-17, and row 10 of §7.2 needs it. Copy in every chapter: over-caution on genuine never gets a bare label next to low stars ("You reported it. Careful is good; this one was safe.").

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
**Assumptions (v3.1):**
- **Standard fraud:** 4 scenarios, each with 2 red flags and 2 decoys, max 15 + 4 = 19.
  - In 1-3, 1-7 and 1-8 the sender and the link are the red flags.
  - In 1-5 the sender is a decoy (a spoofed Kettle sender ID), there is no link, and the red flags are the code request and the deadline.
- **Genuine:** 3 scenarios, max 15 each, with 2 checkable details each: 1-1 sender + pick-up code; 1-2 sender + meeting time; 1-6 sender + link.
- **Boss:** 3 beats, max 51.
  - 4 red flags: beat 1 link, beat 2 sender and link, beat 3 the request.
  - 3 decoys: beat 1 sender ID, beat 2 logo, beat 3 caller ID (it shows "Larchwick Bank").
- **Sender-or-link decoys:** 1-5 and the boss = 2 = ceil(5/3) ✓.
- **Totals:** max = 4×19 + 3×15 + 51 = **172**. R = 8 + 4 = 12, so silver needs spotted ≥ ceil(12/3) = **4** and gold needs ≥ ceil(24/3) = **8**.

| # | Strategy | Points arithmetic | Pts | Rating | Spotted (correct − wrong) | Stamp |
|---|---|---|---|---|---|---|
| 1 | Ideal: correct tags, verify fraud, proceed on genuine | 76 + 45 + 51 | 172 | 100% | 12 − 0 = 12 | **Gold** |
| 2 | Ideal + checks the genuine Trundle text in the app (focus twin) | same | 172 | 100% | 12 | **Gold** |
| 3 | Ideal + always verify, incl. calling Adaeze about 1-2 (off-focus) | same; 1 off-focus check | 172 | 100% | 12 | Silver |
| 4 | Careful reporter: correct tags, reports fraud, proceeds on genuine | 4×(10+4) + (3×10+6) + 45 | 137 | 79.7% | 12 | Silver |
| 5 | Ideal but reports Adaeze's message once | 172 − 15 − 5 | 152 | 88.4% | 12 | Silver |
| 6 | Tag everything + always verify | all bonuses void: 60 + 45 + 45 | 150 | 87.2% | 12 − (8 + 3 + 6) = −5 | Bronze |
| 6a | **Random single tag** per scenario/beat + always verify (expected) | 150 + 4×(½×2) + (⅙×6) | ≈155 | ≈90.1% | 3.67 − (3.33 + 3) ≈ −2.7 | Bronze (silver only if all 7 fraud tags hit, ≈1 in 96) |
| 6b | **Always tag sender + link** + always verify | 150 + 4 (1-3) + 4 (1-7) + 4 (1-8); 1-5 and boss void | 162 | 94.2% | 9 − (1 + 2 + 4) = 2 | Bronze |
| 7 | Check everything, no tags, always verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 8 | Blind always-verify | 60 + 45 + 45 | 150 | 87.2% | 0 | Bronze |
| 9 | Blind always-verify + pause everywhere | pause unscored | 150 | 87.2% | 0 | Bronze |
| 10 | Blind always-report | 40 + 30 − 15 | 55 | 32.0% | 0 | Bronze + calibration tip |
| 11 | Blind always-dismiss | 40 + 30 + 10 + 10 + 0 | 90 | 52.3% | 0 | Bronze |
| 12 | Trust everything, perfect damage control | 45 + 4×9 + 9 (boss: beats 0, damage control once) | 90 | 52.3% | 0 | Bronze |

Row 6a in detail:
- Expected correct tags = 4×½ (standard frauds) + ½ + ⅔ + ½ (boss beats) = 3.67.
- Wrong tags = 7 fraud tags − 3.67 = 3.33, plus 3 tags on genuine messages.

**What the numbers show:**
- No button-mashing strategy reaches silver **in expectation**, with or without pause.
- The one exception is luck. A random single-tagger reaches exactly silver's threshold only if every fraud tag hits, in about 1 in 96 runs. Even then, they have tagged the right detail 7 times.
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
  - First expiry: the pusher escalates and the timer gets +20 s. Second expiry: scored as dismiss. On fraud the debrief says *"The deadline was fake. Nothing happened."*
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

**Tutorial grace and the Home strategy check (ruling L4, T-2.7).** Slot 0 scores over-caution on genuine as ★, 0 points (§7.1): reporting 0-1 or 0-3, or closing 0-3 (you started the reset) is not punished below ★ while the player has not yet met a scam. 0-1's `welcome_reported` narrative agrees with ★: "IT replies: "Thanks for checking! This one really is from Adaeze, so go ahead and open your pack."" 0-3's `still_locked_out` stays. Home recheck (played through the runner, `tests/unit/engine/learning-rulings.test.ts`): **blind always-report stays bronze**, because it reports both genuine messages (2 > silver's 1); the two reports score ★ and 0 points each instead of 0 and −5.

**L1–L4 implementation decisions (T-2.7, accepted by producer ruling, 2026-11-19):**
1. **`you_chose_dismiss_started`** is "You left it. You started this reset; it was safe." The ruled "…reset, so it was safe." is 11 words on the validator's `wordCount()` and put 0-3 at 41 layer-1 words; dropping "so" keeps it at 10. The copy names a reset: a future `player_started` scenario that is not a reset needs its own wording.
2. **"Fair instinct" wrong-mark lines are per type** (UI_SPEC §8.2): caller ID "…a faked number can show the same saved name…" (fact-check wording, T-2.7 review), sender "…a real message shows the same name…", logo "…a real message shows the same logo…", each ending "so it can't tell you which this is."
3. **The spotting tier hint drops "to reach silver"**: "Spot at least {n} red flags. Each mark on a safe detail takes one off. Your count: {net}." It sits under "To reach silver next time:" or "To reach gold next time:", which already names the tier.
4. **No tutorial grace on timer expiry.** A timer running out is not a choice, so it scores the star table (timer_expiry = dismiss) in slot 0 too.

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
- **Patterns** (pending the brief): `smishing-parcel-fee`, fake customs fee, and for the boss `multichannel-support-callback` (parcel → customs invoice → fake bank fraud-team call). Plus 2 callbacks: 0-2 credential phishing on a shop pretext, and 0-4 Kettle account takeover.
- **Flavour:** German in-world text (`lang="de"`, inline translation), lockers, the courier **Trundle**, the shop **Thimble & Pine**, neighbour **Jonas**.
- **Parcel-themed scored scenarios:** 4 of 8 (1-1, 1-3, 1-7, boss), never adjacent.
- **Pressure parity:** timer or pusher on 2 of 3 genuine (67%) vs 4 of 5 fraud (80%), a 13-point gap ✓. Every timer is 60 s (the slot-1 length), genuine or fraud; boss beats are 40 s.
- **Difficulty parity:** genuine scenarios at difficulty 1 (1-1), 2 (1-2) and 3 (1-6), matching the fraud range 1–3 ✓.
- **Decoys:** 2 per fraud scenario. The sender or link is a decoy in 1-5 (spoofed Kettle sender ID) and in the boss (beat 1 sender ID, beat 3 caller ID): 2 of 5 = ceil(5/3) ✓.

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
  - **Red flag:** the request (read out a code or approve in the app). **Decoy:** the caller ID showing "Larchwick Bank", which may even be the bank's real number. Re-checked: §7.2 is unchanged (beat 3: 1 red flag, 1 decoy; boss 4 red flags and 3 decoys; R = 12; the boss is still one of the 2 sender-or-link-decoy scenarios).
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

## 18. Chapters 2–10 (map owned by `fraud-researcher`)
**2 Amsterdam (slot 2, diff 2–3).**
- Patterns: the "Hi Mum / new number" messenger scam, and the **task / easy-work job scam**.
- Noor writes from a "new number" while her real number also messages you; call the old number (LO-07).
- **Task scam:** a Kettle message recruits you for "easy online work". It leads to a fake task-platform website or app that shows small earnings and then asks for deposits to "unlock" tasks (LO-12, LO-02). The genuine twin is a real job message from a known contact that asks for nothing.
- The Larchwick **payee-name check** shows "Name doesn't match" on the new-number request (LO-06).
- Arc slot 2.

**3 Paris (slot 3, diff 2–4).**
- Patterns: CEO fraud and invoice IBAN change by **email** (business email compromise) at a partner office, plus a spoofed-caller-ID follow-up call (LO-06, LO-18). Genuine emailed supplier invoices are the twins.
- The payee-name check appears twice: once mismatching, once **matching** while the request is still fake. Lesson: a match doesn't prove it's genuine.
- Boss: a "CEO" email + call + secrecy, won by the four-eyes rule.

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
