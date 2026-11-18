Seeded examples for `scripts/redline-lint.ts`.

- `bad-*` files must each produce at least one ERROR of their category.
- `clean.yaml` and `clean-logo.svg` must produce nothing (tricky but allowed).
- `public/` exercises the raster-image manifest check.
- Exact strings from the sceptic review live in `tests/unit/redline.test.ts`.

Test data only: never shipped, and not scanned by the default
`npm run redline:lint` (which scans `content/` and `public/`).
