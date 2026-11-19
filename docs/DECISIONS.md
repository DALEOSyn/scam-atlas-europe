# Decisions and gates

Only Roman approves a gate. Agents may prepare a gate (state: **Ready for Roman**) but never approve one.
Format: gate, state (Open / Ready for Roman / Approved / Changed), the question(s), the recommendation, Roman's answer and date.

## G0 — Kickoff (state: Approved 2026-11-18, repo creation pending)
1. **Audience:** general public 14+ (recommended), or employees for corporate training, or both?
   - **Roman, 2026-11-18: 14+ (general public).** ✅
2. **Languages at launch:** English only first, then which 2–3 locales? Recommended: EN, then DE, FR, and one of PL/ES/IT based on your audience.
   - **Roman: English first.** Further locales decided at G5. ✅
3. **Tech stack:** TypeScript + Vite + Preact static site, content in YAML, deployed to GitHub Pages (recommended). Alternative: a game engine such as Godot (richer visuals, heavier, harder for agents to test).
   - **Roman: choose for widest reach.** → TypeScript + Vite + Preact static web app, installable as an offline-capable PWA. It runs in any browser on phone, tablet, PC or school Chromebook with no install or app store. ✅
4. **Repository:** name and owner (e.g. `DALEOSyn/scam-atlas-europe`), public or private. Claude will not create it; please create it and say when it exists.
   - **Roman: `DALEOSyn/scam-atlas-europe`, private at first.** Roman creates it. ✅
5. **Working title:** "Scam Atlas: Europe" (alternatives: "Inbox Europa", "Red Flag Express").
   - **Roman: "Scam Atlas: Europe".** ✅
6. **Licence:** code MIT, content CC BY-SA 4.0 (recommended for an educational game), or proprietary.
   - **Roman: as proposed (code MIT, content CC BY-SA 4.0).** ✅
7. **Autonomy level:** may agents open PRs and merge them after all reviewers PASS and CI is green (recommended), or should every PR wait for you?
   - **Roman: as recommended. Agents may merge their own PRs after every reviewer passes them and CI is green.** Deploys and anything public still need a gate. ✅

## G1 — Design approved (state: Approved 2026-11-18)
Approve `docs/GDD.md`, the chapter list (`docs/patterns/MAP.md`), the learning objectives and the visual direction (`docs/UI_SPEC.md`, mock-ups in `docs/ui-mockups/`, screenshots in `docs/qa/screens/v2-*`).

**Summary.** Research, design, UI and the scaffold all passed sceptic review, and the design and UI passed QA. Most rounds took one or two reworks; the GDD took three (logged as a producer exception). Main design choices:
- A friendship-only arc, with no romance (the player may be 14).
- Players see stars and stamps, not points.
- Verifying is always rewarded. Silver and gold also need red flags actually spotted, so button-mashing stays at bronze.
- Calm mode exists, timers are optional, and nothing ever scores on speed.
- Pressure cues appear on genuine messages too, so they never give the answer away.
- Fictional brands: Waymarker, Trundle, Larchwick Bank, Thimble & Pine, Swaploft, Kettle, Gatewren, Wordswap.

**Questions for Roman** (GDD §21, plus two from review):
1. **Arc.** Friendship-only Alex arc. Debriefs don't reveal the verdict until the finale, and there is an optional "Tell me now" reveal. Approve? *Recommended: yes.*
2. **Sextortion.** A factual help card only, never a scenario. *Recommended: yes.*
3. **City order.** Linear, or a free choice of city after Berlin? *Recommended: free choice (QA), because adult players reach their topics sooner.*
4. **Length.** About 2.5–3 h in total, with chapters of 12–18 min split into two halves. Accept, or trim the later chapters? *Recommended: accept, then re-measure in the G2 playtest.*
5. **Gold strictness.** Gold allows no extra checks on harmless messages outside the chapter's focus. *Recommended: keep it, and tune after the G2 playtest.*
6. **Help screen.** May the "Where to report" screen show real reporting bodies' phone numbers and URLs? *Recommended: yes, under Red Line 1's carve-out*, on these conditions:
   - they come from one data file, which is the only file exempt from the linter;
   - links use `rel="noopener noreferrer"` with no tracking;
   - every entry carries a "checked on" date;
   - 116 111 / 116 006 are shown only once verified country by country.
7. **Known residual risk.** A player tagging details at random has about a 1-in-96 chance per chapter of a lucky silver. *Recommended: accept for now and tune in vertical-slice playtests.*

**Roman, 2026-11-18: "continue as recommended". All 7 answered as recommended:** friendship-only arc with "Tell me now"; sextortion as a help card only; free city choice after Berlin; about 2.5–3 h length, re-measured at G2; strict gold, tuned after G2; real reporting bodies on the help screen under the stated conditions; lucky-silver risk accepted for now. ✅

## Standing rules from Roman
- **2026-11-18: keep the scams in the cybersecurity realm.** Every scenario must hinge on a digital or cyber vector; purely offline fraud is out of scope. Recorded as Red Line 8 in CLAUDE.md, which the sceptic-reviewer enforces.
- **2026-11-18: widen the scope to malicious cyber campaigns, not only scams** (Roman: "both yes" to the catalogue questions). Malware and technical campaigns from THREAT_CATALOGUE.md Part B may become scenarios when the player can see the vector and act on it, at the defender's level only. Webcam-blackmail emails: help card only, never a scenario. Recorded in CLAUDE.md Red Line 8.

## G2 — Vertical slice approved (state: Approved ✅)
Play the tutorial + first city chapter yourself (link to preview build). Approve fun, tone and difficulty before content is mass-produced.

**Roman, 2026-11-19: "ok, game makes sense, we can continue."** Played the private G2 preview (tutorial + Berlin, build 2f58f36, delivered as a private claude.ai page and a local zip; nothing deployed publicly). Phase 3 (content production) may start. ✅

**Roman, 2026-11-19 (Phase 3): add an actual story with graphical elements, because it has more impact on learning, and onboard a psychological advisor agent.** Recorded as PLAN.md Phase 3 track S and the new `learning-psychologist` agent (TEAM.md). Level of visual ambition: see the decision below.

**D-S1, decided by Roman 2026-11-19: "Illustrated story layer".** Comic-style scenes, character portraits, city backdrops and an illustrated map around the existing device scenarios, built in Phase 3 (track S). Not chosen: a walkable 2D city, or graphics after G3. ✅

**D-S2, producer clarification 2026-11-19 (pending Roman's confirmation at G3): what "no AI-generated images" means.** Art in `public/art/**` is SVG written element by element as code by the AI-assisted agent team, and each file header says so. Not allowed: image-generation models, auto-vectorised rasters, traced references, stock assets. Reason: hand-written SVG code has no training-image provenance risk and stays reviewable line by line. Raised by `sceptic-reviewer` as a public provenance claim; Roman may change it at G3 (including a human illustrator).

## G3 — Content complete (state: Open)
All chapters in English pass review. Approve sources list and "Where to report" pages. Decide on external expert review (e.g. a contact at a CERT or consumer body), optional, including the proposed human review of story tone and emotional safety (PLAN.md track S5).

## G4 — Public release (state: Open)
Approve going public: deploy to GitHub Pages (or other host), domain, announcement. Irreversible in practice (content gets indexed).

## G5 — Localization waves (state: Open)
Approve each additional locale before it ships.

## Producer rulings (no gate)
Rulings by the producer on spec trade-offs. They need no gate; Roman may overturn any of them.
- **R1 (2026-11-19, CR-27): Check card "Translation" row.** Non-English messages show an English "Translation" row inside the Check card, a verbatim copy of the message's authored translation. Accepted exception to "never inside a Check card" (UI_SPEC §4.4, §4.8, [U7]) for second-language players.
- **R2 (2026-11-19, CR-27): translation freeze.** A translation auto-opened by "Always show translations" freezes the timer for reading time only, max(1.5 s, 0.3 s × words). A translation opened by hand freezes it while open (UI_SPEC §4.8, §6.1).
- **R3 (2026-11-19, CR-27): jump bar at the top.** "Jump to your options" stays sticky at the top, under the HUD. The trade-off against UI_SPEC principle 7 (reach) is accepted: the bar covering targets at the bottom was worse.
- **R4 (2026-11-19, T-S4d): the player rings Solène.** In the Paris resolution the player rings Solène on the directory number (the spec had her call in), so the scene models the habit and never treats an incoming caller as proof.
- **R5 (2026-11-19, T-S4d): the Friday call is a plain-wall panel.** Not a video call: after the boss's video call, a video panel would blur the lesson that a call or video call proves nothing. Solène's kitchen has no backdrop.
- **R6 (2026-11-19, T-S4d): one merged bank-step line after a boss fall.** On `paris_boss_sent` the resolution uses one line true for every first damage-control pick: "The bank was called straight away, the right first step. We'll see what it can recall." ("straight away", never "first thing"; no refund promise). The two pick-keyed lines in GDD §23.13 wait for a frontend hook that exposes the first damage-control pick to the story layer.
- **R7 (2026-11-19, T-S4d): Bastien is always calm** in Paris scenes, including after a loss (never warm in a variant that follows one).
- **R8 (2026-11-19, T-S4d): Paris beats 1 and 2 are one Arrival scene.** The studio is a caption only (on the street backdrop), then Solène (why she asked for an inspector), then Inès with the procedure card, so the arrival ends calm.
- **R9 (2026-11-19, GDD §24): 4-2 genuine bank call.** Staying on the real card-team call (`proceed`) and hanging up to call the number on the card both earn ★★★. Verifying is never penalised, and trusting a genuine call that asks for nothing sensitive is not either; the debrief names the call-back as the habit for any call that asks you to act.
- **R10 (2026-11-19, GDD §24): the Spain sender-register line stays, once, in 4-3 layer 2,** in the fraud-researcher's wording only (ch4-madrid-sources.md). Never anywhere else, never as protection.
- **R11 (2026-11-19, GDD §24): no content note for Madrid.** Money fear is not a sensitive theme in the §6 sense (no family emergency, no harm to a person); the chapter's help card is enough.
- **R12 (2026-11-19, GDD §25): Mateus's fall stays the payment code** (keeps his If-then word for word); the code appears in 5-6 and the 5-7 drill only. If fraud-researcher cannot support the code variant in the spec review, his fall moves to the collect-payment page and learning-psychologist rewords the line.
- **R13 (2026-11-19, GDD §25): Kasia is the hijacked account.** She never falls; every line about it says it wasn't her fault.
- **R14 (2026-11-19, GDD §25): CR-35 is built** (engage choice that ends a boss beat at ★★) rather than the fallback, so boss beat 1 keeps its intended shape.
- **R15 (2026-11-19, GDD §24–25): `stamps.gold.max_falls` stays parked** until the balancing pass, which uses the Madrid and Warsaw score checks (row 11) as inputs.
- **R16 (2026-11-19, GDD §24): following a fraud caller's steps in your own banking app caps at ★★,** like calling the number in a fake text. Being guided to make a payment in your own app is the chapter's tell, so `start_transfer` reached from a fraud call takes the engage cap even if the player hangs up before confirming (sceptic finding 4 on 470bc31).
- **R17 (2026-11-19, GDD §25): one merged Warsaw bank-step line after a boss fall,** true for a card typed on the collect page and a bank login typed on the "release" step: "The bank was called straight away, the right first step. We'll see what it can do." The story flag is `warsaw_bank_called` (same pattern as R6).
- **R18 (2026-11-19, producer, on learning-psychologist advice):** in a payment-code scenario (CR-34), typing the code and then declining the confirmation scores ★★ (star_cap 2), not ★: declining at the confirmation is a real save and should be rewarded above a fall. Confirm remains the fall.
- **R19 (2026-11-19, producer, GDD §30.13): Brussels finale rulings.** (1) Noor never says yes in any branch (STORY rule kept); the "already said yes" steps are taught through drill 10-5 with Noor's unnamed friend. (2) CR-40 (advice scenarios, `advise_comply` scores 0 but is not a fall) is built, not the fallback. (3) Adaeze's last line goes in the panel just before Noor's If-then panel and returns as the end screen's epigraph. (4) The Brussels content note adds "and a teenager being offered easy money"; STORY §5.6 updated by its owner. (5) The shared `easy-money-costs-you` card takes the new example and already-clicked lines; the habit sentence is unchanged. (6) "Marrowby" is the fictional card-blocking line (Stillcard, Cardhalt and Haltwell rejected: echo of the real name's meaning), pending BRAND_CHECK. (7) If the arc closed earlier with an investment, damage control ran then, and the finale plays only the recovery-agency test. (8) Two-fall gold (§30.8 row 14) is input to R15 at the balancing pass.
- **R21 (2026-11-19, producer, from Madrid QA):** on a genuine beat, timer expiry scores the same as the beat's deliberate dismiss option, never higher (T-2.8 intent: waiting out a timer never beats a deliberate pause). Built in CR-45: `scoreGroup(…, { expiryDismiss })` scores the expiry as the lowest-scoring dismiss-class action of the beat the timer ran out on (grace and authored `score` overrides included); a beat with no dismiss option keeps `timer_expiry.genuine_high` (★, 5 points). Fraud unchanged.
