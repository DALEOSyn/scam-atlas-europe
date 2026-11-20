# Scam Atlas: Europe

A free browser game that teaches people to recognise and respond to online scams and other cyber attacks as they actually happen in Europe. For players aged 14 and up.

You travel with the Waymarker team through eleven chapters: Home, Berlin, Amsterdam, Paris, Madrid, Warsaw, Rome, Lisbon, Dublin, Stockholm and a finale in Brussels. In each chapter, simulated emails, texts, chats, calls, QR codes, shop pages and banking apps arrive on in-game devices. For each one you decide whether to trust it, check it, report it or ignore it. Every scenario ends with a short debrief covering:

- the warning signs;
- the check that would have worked, such as calling back on a number you already know, opening the app yourself, pausing, or asking someone;
- what to do if you already fell for it.

A story runs alongside: a friend, Alex, is slowly drawn into an investment scam, and how it ends depends on what you do.

## Safety rules

Scam Atlas teaches recognition and response, never how to run a scam. The full rules are the "Red Lines" in [`CLAUDE.md`](CLAUDE.md). In short:

- **Fictional brands only.** Every bank, courier, shop, app, person, domain, phone number and account number in the scenarios is made up (see `content/brands.yaml`). Domains use reserved test names such as `.example`, and QR codes only open in-game screens.
- **No working attack material.** Fake sign-in forms send nothing anywhere.
- **Real organisations appear only on the "Where to report and get help" screens.** These list national reporting, bank, support and crisis contacts for ten countries plus the EU. Each row shows when it was last checked.
- **Sourced.** Every scam pattern cites public European sources (`content/sources.yaml`).
- **Respectful.** The game blames the lie, never the person.

## Privacy

There are no accounts, no tracking and no analytics. Your progress and settings stay in your own browser (`localStorage`). The game makes no requests to any other site, and it works offline once loaded. Help links open only when you click them.

## Accessibility

The game is designed and tested against WCAG 2.2 AA. The pre-release audit ([`docs/qa/T-4.5-a11y-privacy-audit.md`](docs/qa/T-4.5-a11y-privacy-audit.md)) was an internal, automated one: axe checks plus scripted keyboard, dark-mode, forced-colours and small-screen checks in Chromium (Playwright). All its findings are fixed. It is not an independent conformance certification, and there has been no hands-on testing by people yet, with real screen readers or in Safari and Firefox. It supports keyboard-only play and is built for screen readers (accessible names, headings, live announcements), though not yet tested with one. It works at 320 px and 400 % zoom. It respects reduced motion and follows your device's dark mode. Timers can be set to Extended or turned off. Story scenes advance only when you choose, and can be skipped or replayed.

## Run it locally

You need Node.js 22 (as used in CI).

```sh
npm ci
npm run dev        # development server
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run check      # typecheck, lint, content validation, red-line lint, unit tests, build, bundle budget
npm run e2e        # Playwright end-to-end and accessibility tests
```

## How it is built

TypeScript, Vite and Preact, with no backend. Scenarios, scenes and help data are YAML files in `content/`, checked by Zod schemas (`src/content/schema.ts`) and by a red-line linter (`scripts/redline-lint.ts`) in CI.

The game was designed and built by an AI-assisted team of Claude Code agents, and every change was reviewed against the safety rules. The illustrations are SVG written as code; no image-generation model was used. See [`docs/TEAM.md`](docs/TEAM.md), [`docs/PLAN.md`](docs/PLAN.md) and [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Licences

- **Code** (everything except the game content and art): MIT, see [`LICENSE`](LICENSE).
- **Game content and art** (`content/`, `public/art/`, `public/brands/`, `public/icon.svg`, `public/icon-maskable.svg` and the app icon PNGs): CC BY-SA 4.0, see [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md) for the exact scope.

## If you've been scammed

Contact your bank straight away on the number on your card, and report it to the police in your country. In immediate danger, call 112 (free anywhere in the EU). The game's help screen lists checked contacts for each country.
