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
