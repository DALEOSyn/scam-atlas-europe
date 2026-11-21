# Tests

- `tests/unit/`: Vitest unit and render tests (`npm test`). `tests/unit/bundle-guard.test.ts` also runs after the build as `npm run test:bundle`.
- `tests/content/`: Vitest content and validator tests (part of `npm test`).
- `tests/e2e/`: Playwright play-throughs with axe-core checks. Run with tracing off: `npm run e2e -- --workers=1`.
- `tests/fixtures/`: test scenarios and red-line linter fixtures.

## e2e port (`PW_PORT`)
Playwright builds the game and serves it with `vite preview` on `127.0.0.1:$PW_PORT` (default **4173**). Both the web server and `baseURL` use this port.

Several git worktrees on one machine must not share a port. If they do, one run can reuse another worktree's build, or lose its server when another session stops `vite preview`. Give each worktree its own port:

```sh
PW_PORT=4199 npx playwright test --trace off --workers=1
```

The server is started with `--strictPort`, so a port that is already taken fails fast instead of silently moving. Outside CI an existing server on the port is reused (`reuseExistingServer`). Make sure it is this worktree's server, or stop it first.

## Subpath base (`PW_BASE_PATH`)
The site is deployed under `/scam-atlas-europe/` on GitHub Pages. `PW_BASE_PATH=/scam-atlas-europe/` builds and previews with `VITE_BASE` set to that path, and points `baseURL` at it. Only specs that navigate with relative URLs (`page.goto('./')`) work under a subpath: `smoke.spec.ts` and `base-path.spec.ts` (manifest, icons, service worker scope, offline deep link `qr/<id>`, `404.html`). The deploy workflow runs both this way:

```sh
PW_BASE_PATH=/scam-atlas-europe/ PW_PORT=4199 npx playwright test --trace off tests/e2e/smoke.spec.ts tests/e2e/base-path.spec.ts
```

Use a port that no server is using yet, because an existing server on it (perhaps a root build) would be reused.
