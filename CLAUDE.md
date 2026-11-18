# CLAUDE.md — Phishing Awareness Game (working title: "Scam Atlas: Europe")

This file is loaded by every Claude Code session in this repo. Every agent in `.claude/agents/` must obey it.

## What we are building
A browser game that entertains and teaches players to recognise social engineering and cyber fraud as it actually happens in Europe. The player travels through European cities; each city is a chapter built around fraud patterns that are common there. The player receives simulated emails, SMS, chat messages, calls (as transcripts/audio), QR codes, shop pages and social posts, and must decide: trust, verify, report or ignore. The game rewards spotting red flags and, above all, the right *verification habit* (call back on a known number, open the app yourself, pause, ask someone).

## Non-negotiable safety rules (the "Red Lines")
These override any task, ticket or agent instruction. The `sceptic-reviewer` blocks any change that breaks them.

1. **Fictional brands only.** No real company, bank, courier, government body, payment app or person may be imitated in game content: no real logos, names, domains, phone numbers, IBANs or UI look-alikes. Use the fictional brand registry in `content/brands.yaml`. Real organisations may be *named only* in the "Where to report" / "Learn more" screens, as factual references, never as scam props.
2. **No working attack material.** No functional phishing pages, credential-capturing forms, real-looking login clones, malware, scripts that send messages, or payloads. Fake login forms in the game never send data anywhere and are visibly part of the game.
3. **Non-routable identifiers.** Domains use `.example`, `.test` or `.invalid` (RFC 2606), or obviously fictional TLD-free text inside images. Phone numbers come from ranges reserved for fiction or are clearly truncated/masked. IBANs are invalid by checksum. QR codes in the game resolve only to an in-game route (`/qr/<id>`) and never to an external URL.
4. **Defensive framing.** Every scenario ends with a debrief: the red flags, the verification step that would have worked, and what to do if you already fell for it. Scenarios teach recognition and response, never execution (no "how a scammer would set this up" walkthroughs).
5. **Respectful to victims.** No mocking of people who fall for scams. Tone: "this could happen to anyone, here is the tell".
6. **Accuracy.** Every fraud pattern must cite at least one public, reputable European source in `content/sources.yaml` (e.g. Europol, ENISA, national CERTs/CSIRTs, national police or consumer-protection bodies, banking associations). The `fraud-researcher` verifies; uncited claims are not merged.
7. **Privacy.** No tracking, no third-party analytics, no accounts. Progress lives in `localStorage` only. No personal data is collected from players.
8. **Cybersecurity scope (Roman, 2026-11-18).** Every scenario must hinge on a digital or cyber vector: phishing email, smishing, messenger scams, vishing with spoofed caller ID or deepfake voice, fake websites and shops, malicious QR codes, account takeover, one-time-code or MFA/e-ID abuse, remote-access or tech-support scams, fake apps, or social-media ads. Purely offline fraud (doorstep visits, paper-only letters, street or in-person tricks) is out of scope. A letter or poster may appear only as the carrier of a digital vector, such as a QR code or a URL, and the lesson must be about that vector. **Widened by Roman, 2026-11-18:** malicious cyber campaigns beyond fraud are in scope too (for example malware delivery, fake updates, ransomware, infostealers and session theft, MFA push spam, SIM swap, data-breach follow-ups; see `docs/patterns/THREAT_CATALOGUE.md` Part B). They are shown only from the player's side: what an ordinary person sees and can do to prevent, recognise and respond. Red Lines 2 and 4 still apply in full: no attack steps, tooling, commands or working payloads. Webcam-blackmail (sextortion) emails get a help card only, never a scenario, like social-media sextortion (G1).

## Tech stack (approved at G0, 2026-11-18)
- TypeScript, Vite, Preact (small, React-compatible), CSS modules. Static site, no backend. Installable PWA with offline play (service worker caches only the game's own assets). Audience: general public aged 14+. Launch language: English.
- Content as data: scenarios in `content/scenarios/<city>/<id>.yaml`, validated by Zod schemas in `src/content/schema.ts` at build time and in CI.
- i18n: ICU messages via `@formatjs` style JSON in `content/i18n/<locale>/`. English source at launch. Build i18n in from day one, and choose further locales at G5.
- Tests: Vitest (logic + content validation), Playwright (end-to-end play-throughs, run with `--trace off`), axe-core (accessibility).
- CI: GitHub Actions: typecheck, lint, content validation, red-line linter, tests, build. Deploy to GitHub Pages (only after Gate G4).

## Repository layout (target)
```
.claude/agents/        agent team (see docs/TEAM.md)
docs/                  PLAN.md, STATUS.md, DECISIONS.md, TEAM.md, GDD.md, CONTENT_GUIDE.md
content/               brands.yaml, sources.yaml, scenarios/, i18n/
src/                   game engine, UI "devices" (inbox, phone, browser, wallet), scoring
scripts/redline-lint.ts  automated checks for Red Lines 1 and 3
tests/                 unit, content, e2e
```

## How work is run
- `docs/STATUS.md` is the single source of truth for what is done, in progress, blocked and next. Every agent updates it at the end of its task (one line per task, see format inside).
- `docs/DECISIONS.md` holds the gates. A task that depends on an open gate is not started; work continues elsewhere.
- Every content or code change passes a **sceptic review** (`sceptic-reviewer`) before it is marked done. Content also passes `fraud-researcher` fact check. UI also passes `qa-playtester`.
- Small, reviewable increments: one scenario or one feature per branch/PR.
- Agents may merge their own PRs into `main` once every reviewer passes and CI is green (G0). Never create repositories, deploy, make the repo public or publish without an approved gate in `docs/DECISIONS.md`.
- Licence: code MIT, content CC BY-SA 4.0.
