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

## G1 — Design approved (state: Open)
Approve `docs/GDD.md`, the chapter list, learning objectives and the visual direction (3 mood screenshots from the prototype).

## G2 — Vertical slice approved (state: Open)
Play the tutorial + first city chapter yourself (link to preview build). Approve fun, tone and difficulty before content is mass-produced.

## G3 — Content complete (state: Open)
All chapters in English pass review. Approve sources list and "Where to report" pages. Decide on external expert review (e.g. a contact at a CERT or consumer body), optional.

## G4 — Public release (state: Open)
Approve going public: deploy to GitHub Pages (or other host), domain, announcement. Irreversible in practice (content gets indexed).

## G5 — Localization waves (state: Open)
Approve each additional locale before it ships.
