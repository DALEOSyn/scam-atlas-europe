# Release checklist: 1.0.0 (GitHub Pages)

Do these steps in order. Nothing is deployed until step 1 is complete. The deploy workflow (`.github/workflows/deploy.yml`) runs only by hand, and its `gate` job refuses to run until `docs/DECISIONS.md` G4 records all three conditions in the machine-checked format.

Planned URL: `https://daleosyn.github.io/scam-atlas-europe/` (build base `/scam-atlas-europe/`).

## 1. G4 conditions (Roman)
All three must be met, and each must be confirmed by Roman himself in the project thread (a decision-card tap or his own message). An agent's or reviewer's report never counts on its own.

1. Human tone read of Amsterdam, Rome, Brussels and the crisis-line wording (T-4.3). Findings are fixed and reviewed.
2. Trademark registry search by a person (TMview, WIPO, KBO) for every name in `content/brands.yaml` (docs/patterns/BRAND_CHECK.md). Any hit is renamed and reviewed.
3. Roman's final playthrough. His feedback is fixed and reviewed.

When a condition is confirmed, the producer ticks its line in DECISIONS.md G4 and fills it in (format and rules: DECISIONS.md G4, "Condition record"):

```
- [x] G4 condition 1 met: 2026-12-03, <reader's name or role>, <result>, confirmed by Roman 2026-12-04 (decision card)
```

Check locally with `npm run g4:gate`. It exits 0 only when all three lines are ticked and complete. Merge the ticked lines to `main` through a reviewed PR.

## 2. Content freeze
- Announce the freeze in the project thread. From then on only release-blocking fixes are merged, each with its normal reviews.
- `main` is green in CI (typecheck, lint, content validation, red-line lint, unit tests, build, bundle budgets, e2e).
- Locally on `main`: `npm run check`, `npm run e2e`, and the subpath run: `PW_BASE_PATH=/scam-atlas-europe/ PW_PORT=<free port> npx playwright test --trace off tests/e2e/smoke.spec.ts tests/e2e/base-path.spec.ts`.
- Set `"version": "1.0.0"` in package.json in the freeze PR.

## 3. Help re-check (only if launching after 2026-12-20)
The help numbers were last re-checked on 2026-11-20 (docs/patterns/G4_HELP_RECHECK.md). If the launch date is more than 30 days after that, the fraud-researcher re-checks every help number, email and URL again (G3 point 4) before the deploy. Any change is fixed and reviewed, and the re-check date is recorded in STATUS.md.

## 4. Roman enables Pages
Only Roman does this, in the repository settings: **Settings → Pages → Build and deployment → Source: GitHub Actions**. No agent enables Pages or changes repository settings through the GitHub API.

This creates the `github-pages` environment. By default it allows deployments from `main` only. To allow a rollback redeploy from a release tag (step 10), add the tag rule `v*` under Settings → Environments → github-pages → Deployment branches and tags.

## 5. Run the deploy
Actions → "Deploy to GitHub Pages" → Run workflow → branch `main`. The jobs run in this order:
1. `gate`: checks the ref (main or a `vX.Y.Z` tag), then runs `node scripts/g4-gate.ts docs/DECISIONS.md`.
2. `build`: the same checks as ci.yml, then `npm run build` with `VITE_BASE=/scam-atlas-europe/`, then `npm run test:bundle`, then the Pages artifact upload.
3. `e2e`: the full e2e suite, then the smoke and base-path specs under `/scam-atlas-europe/`.
4. `deploy`: `actions/deploy-pages` into the `github-pages` environment. Only this job gets `pages: write` and `id-token: write`.

Write down the commit SHA that was deployed (from the run summary).

## 6. Live smoke check
On `https://daleosyn.github.io/scam-atlas-europe/`, in a fresh private window with DevTools open (Network, "Preserve log"):
- **Every chapter's first scenario:** Home, Berlin, Amsterdam, Paris, Madrid, Warsaw, Rome, Lisbon, Dublin, Stockholm and Brussels. Each one opens, plays to its debrief, and shows no error.
- **Offline after first load:** reload once, wait until the service worker is active (Application → Service workers), switch the network to Offline, then open a chapter you have not played yet and play its first scenario. Also open a deep link such as `/scam-atlas-europe/qr/lisbon-parking-slip` while online in a new private window: it shows the start screen (404.html fallback), not GitHub's 404 page.
- **Help screens:** open "Where to get help" for several countries and the EU / other-country default. Numbers and links match `content/` and are not broken.
- **No requests leave the origin:** every request in the Network log goes to `daleosyn.github.io` under `/scam-atlas-europe/`. No fonts, analytics or other hosts. The links on the help screens open only when clicked.
- **Install:** the browser offers to install the app, and the installed app opens at the start screen.

If any check fails, roll back (step 10) and fix the problem before going on.

## 7. Tag v1.0.0
Tag the deployed commit: `git tag -a v1.0.0 <deployed SHA> -m "Scam Atlas: Europe 1.0.0"`, then push the tag. Tags are created only after the live smoke check passes.

## 8. Changelog date
In CHANGELOG.md, change "1.0.0 (release candidate, not yet published)" to "1.0.0 (<release date>)" and drop the "Publishing waits for Gate G4" sentence. If the help re-check in step 3 ran, update the "checked in November 2026" line too. Merge this through a normal reviewed PR. It is a docs change, so no redeploy is needed.

## 9. Announcement
Roman posts the announcement. The draft is in docs/ANNOUNCEMENT-DRAFT.md. Agents do not post anything.

## 10. Rollback
- **Take the site down:** Roman goes to Settings → Pages and unpublishes the site, or disables Pages. The game stops being served. Players who installed it keep their cached copy until their browser updates it.
- **Go back to an earlier release:** Actions → "Deploy to GitHub Pages" → Run workflow → choose the tag (for example `v1.0.0`). The tag rule from step 4 must be in place. Players' service workers pick up the redeployed build on their next visit (autoUpdate).
- Record the rollback and its reason in STATUS.md, and fix forward on `main` with normal reviews.
