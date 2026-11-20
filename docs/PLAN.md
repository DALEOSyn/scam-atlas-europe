# Project plan — "Scam Atlas: Europe"

Goal: a free, browser-based game (mobile and desktop) in which players travel across European cities and learn to recognise and respond to social engineering and cyber fraud, through play rather than lectures.

The plan is built so the `producer` agent can run it with minimal supervision. Work only stops at the **gates** (G0–G5 in DECISIONS.md), where Roman decides. Everything between gates is executed, reviewed and logged by the agent team.

---

## Game concept (seed for the GDD, to be refined in Phase 1)

**Premise.** You've just landed a job as a travelling "trust inspector" for a fictional pan-European agency. Your phone, inbox and wallet come with you from city to city. Every chapter, the scammers adapt to where you are. A recurring cast (your manager, a colleague, Grandpa Teo back home, a friendly online stranger) gives the game an arc; the stranger is quietly running a friendship-based investment/money scam across the whole game (friendship only, GDD §10), revealed in the finale.

**Core loop (one scenario, 1–3 min).** Something arrives (mail, SMS, messenger, call, QR, ad, shop page) → inspect it (magnifier on sender, link, QR, payment details) → choose an action (open, reply, pay, call back, verify in app, ask someone, report, ignore) → see the believable consequence → debrief with red flags, the verification habit, and "already clicked? do this".

**Meta loop (one chapter, 10–15 min).** A city day with mixed legit and fraudulent messages under light time pressure, a "stress" meter that rises with urgency, and a city boss scenario. Rewards: stamps in your passport, a "habit card" collection (e.g. *Call back on a number you already know*), unlocking the next city.

**Draft chapter map (country associations are hypotheses for fraud-researcher to confirm or replace):**
| # | City | Main patterns | Core habit taught |
|---|---|---|---|
| 0 | Home (tutorial) | Classic email phishing, fake password reset | Check the real sender and link target; open the site yourself |
| 1 | Berlin | Parcel-delivery smishing, fake customs fee | Track parcels only in the official app/site you navigate to |
| 2 | Amsterdam | "Hi Mum/Dad, new number" messenger scam, fake payment-request links | Call the old number; never pay a "new number" before voice check |
| 3 | Paris | CEO fraud / invoice IBAN change (BEC) | Verify payment changes via a known channel; four-eyes rule |
| 4 | Madrid | Spoofed bank SMS in a real thread + fake bank-employee call | The bank never asks you to move money "to safety"; hang up, call back |
| 5 | Warsaw | Marketplace "safe delivery" link, instant-payment code requests from a hacked friend | Don't leave the platform; never share one-time payment codes |
| 6 | Rome | Fake police / grandchild-in-trouble calls, fake utility visits | Hang up and call the official number; family code word |
| 7 | Lisbon | Fake shops, holiday-rental scams, tampered QR codes on parking meters | Check the shop's history; pay with buyer protection; type URLs, don't scan stickers |
| 8 | Dublin | Investment/crypto scams with fake celebrity endorsement ads, recovery scams | Check the regulator's warning list; nobody "recovers" your money for a fee |
| 9 | Stockholm | eID/MFA approval fatigue, fake support asking you to approve a login | Never approve a sign-in you didn't start |
| 10 | Brussels (finale) | Friendship-based investment scam arc pays off (friendship only, GDD §10); tech-support remote-access scam; everything mixed | Pause, verify, talk to someone; recovery and reporting |

---

## Phases

Each phase lists its owner(s), deliverables and **exit criteria**. The producer keeps the phase open until every exit criterion is met with reviewer PASS, then prepares the gate.

### Phase 0 — Kickoff (½ day, mostly Roman)
- Roman answers **G0** (audience, languages, stack, repo, title, licence, autonomy).
- Roman creates the GitHub repo and attaches it to the project; producer copies this kit in as the first commit.
- **Exit:** G0 approved; repo exists with CLAUDE.md, agents, docs.

### Phase 1 — Research and design (agent-run, ~2–3 days of agent time)
- `fraud-researcher`: pattern briefs for every pattern in the chapter map, `sources.yaml`, verified "Where to report" list for the launch locales; confirm/replace city ↔ pattern associations.
- `game-designer`: `GDD.md`, `LEARNING_OBJECTIVES.md` (LO-01…), scoring and difficulty curve, chapter specs.
- `ux-artist`: `UI_SPEC.md`, design tokens, 4–6 fictional brands with rationale, device mock-ups as HTML/SVG.
- `frontend-engineer`: project scaffold, Zod content schema, `content:validate`, `redline:lint` and denylist, CI pipeline (typecheck, lint, validate, redline, test, build).
- `sceptic-reviewer`: reviews every artefact; `qa-playtester` reviews UI spec for accessibility.
- **Exit:** all briefs cite sources; GDD maps every mechanic to an LO; CI green on scaffold; redline linter catches a seeded set of bad examples (test fixtures). → **G1**.

### Phase 2 — Vertical slice (agent-run, ~1 week of agent time)
- Engine: scenario runner, devices (mail, SMS/messenger, call transcript, browser, QR camera, banking app), magnifier inspection, outcomes, debrief, scoring, save state.
- Content: tutorial (5–6 scenarios) + Berlin chapter (8–10 scenarios incl. 3–4 legit, 1 boss).
- QA: persona play-throughs, axe-core, mobile and desktop screenshots, Playwright e2e of both chapters.
- Private preview build (local or a private preview link; no public deploy).
- **Exit:** both chapters PASS from all reviewers; e2e green; QA reports no blockers or majors; mean scenario length 1–3 min in playtests. → **G2** (Roman plays it).

### Phase 3 — Content production (agent-run, repeated per chapter)
- For each chapter 2–10: research check → chapter spec → scenarios → parallel reviews → QA play-through → done. Producer runs up to 2 chapters in parallel.
- Cross-chapter arc (friendship-based investment/money scam, friendship only, GDD §10), finale, end screen with habit-card summary and "Where to report" per locale.
- Balancing pass by `game-designer` using QA timing data.
- **Track S, story and scene layer (added 2026-11-19 at Roman's request: "having an actual story with a graphical element is having more impact on learning").** Runs in parallel with the chapters; the device scenarios stay the core loop, and the story wraps them. Scope set by Roman's decision D-S1 (2026-11-19): an **illustrated story layer**, not a walkable world.
  - **S1 Story bible** (`game-designer` + `learning-psychologist`, `scenario-writer` for voice): `docs/STORY.md`. One through-line for the whole trip, built on the existing cast (Teo, Alex, the Waymarker team, locals). Per chapter: an arrival scene, the local character's problem that the chapter's scams grow out of, a mid-chapter turn, and a resolution that shows the habit working. Characters model good habits and recoverable mistakes.
  - **S2 Art direction** (`ux-artist` + `learning-psychologist`): `docs/ART_DIRECTION.md`. Original SVG/CSS only, in `public/art/**` (scanned by `redline:lint`, licensed CC BY-SA): character sheets with a few expressions each, one illustrated backdrop per city, comic-style story panels, and the illustrated map. Warm, light, no fear imagery; works at 320 px, in dark mode and with reduced motion; every image has alt text.
    - **Red Line 1 guard for art:** no real logos, signage, vehicle liveries, uniforms or insignia (police, government, banks, couriers, transit); only brands from `brands.yaml`; any visible text uses fictional or reserved identifiers. No likeness of real or public people. Alex is illustrated, never photo-realistic and never romance-coded. No image-generation models, auto-vectorised rasters, traced references, stock assets or externally hosted fonts. SVG written element by element as code by the AI-assisted agent team is allowed and is disclosed as such in each file header (producer clarification D-S2, 2026-11-19). `sceptic-reviewer` checks every illustration for brand and likeness resemblance.
  - **Scene rules (all of track S):** a scene never contains a scam message or artefact; those live only in device scenarios, which have the debrief (Red Line 4). Scenes stay inside Red Line 8 and show no offline fraud as a lesson. Alex's scene lines follow GDD §10.1 (≤ 25 words, no polished persuasion copy). Scene choices set no score or arc flag unless `game-designer` specs one.
  - **S3 Scene engine** (`frontend-engineer`): a `scene` content type in YAML under `content/scenes/<city>/` (panels, speaker, portrait plus expression, backdrop, short lines, optional choice that never scores), checked by `content:validate` and `redline:lint` like scenarios, schema and validator rules, a scene player between scenarios, keyboard and screen-reader support, skip and replay, and a bundle budget for art.
  - **S4 Retrofit** Home and Berlin with scenes, then every new chapter ships its scenes with its scenarios (the chapter spec names them).
  - **S5 Review:** every scene passes `sceptic-reviewer`, `learning-psychologist` and `qa-playtester`. Proposed: before G4, a qualified human (learning or behavioural psychologist, or a CERT/consumer-body awareness lead) reviews tone and safety; decided at G3 (2026-11-20): yes, see DECISIONS.md G3.
- **Exit:** all chapters PASS, with story scenes as decided in D-S1; full-game e2e green; red-line lint clean; sources complete. → **G3**.

### Phase 4 — Hardening and release prep (agent-run)
- Accessibility audit (WCAG 2.2 AA), performance budget, privacy check (no third-party requests), content freeze.
- Teacher/trainer pack: one-page guide per chapter, discussion questions (optional, if audience includes schools/companies).
- Release notes, README, licence files.
- **Exit:** audit reports PASS; Roman's final playthrough feedback addressed. → **G4** (public release).

### Phase 5 — Localization waves (agent-run per locale)
- `localizer` per locale, local fact-check of hooks and reporting info, QA layout pass. → **G5** per locale.

---

## Running it autonomously

1. **One-time setup (after G0):** repo created by Roman, kit committed, Claude Code permissions allow `npm`, `npx`, `git` (no push to `main`), and web search for the researcher.
2. **Work sessions:** the producer must be the *main* session, because subagents cannot start other subagents. Start it with `claude --agent producer` and say *"Run one work session."* It reads STATUS.md, delegates to the specialists, collects reviews and updates STATUS.md. For hands-off running, run it headless (`claude --agent producer -p "Run one work session per CLAUDE.md"`) or as a recurring scheduled cloud session every few hours.
3. **Each task = one branch and one PR**, opened by the producer after all reviewers PASS and CI is green. Whether agents may merge their own PRs is decided at G0 (item 7).
4. **Gates stop the line.** When a phase is done the producer marks the gate *Ready for Roman* in DECISIONS.md and the scheduled sessions only do backlog work for the next phase that doesn't depend on that gate.
5. **Roman's touchpoints:** G0 (15 min of answers), G1 (read GDD, ~30 min), G2 (play ~30 min), G3 (skim sources, ~20 min), G4 (go/no-go), G5 (per language). Everything else is optional.

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Content resembles a real brand → legal/ethical issue | Fictional brand registry, denylist + linter, sceptic veto |
| Game becomes a phishing training kit for attackers | Victim-perspective only, no attacker tooling, sceptic Red Line 3 |
| Outdated or wrong fraud facts / reporting numbers | Sources with access dates; researcher re-verifies at G3 and before each locale |
| Teaches paranoia instead of judgement | 30–40% legit messages; scoring rewards verification habit over guessing |
| Boring quiz feel | Pressure mechanics, consequences, story arc, playtest "fun issues" in every QA report |
| Agent loops on failing work | One rework loop then Blocked; producer moves on |
