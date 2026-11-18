Seeded bad examples for `scripts/redline-lint.ts`. Each `bad-<category>.yaml`
must produce at least one finding of that category; `clean.yaml` must produce
none. These files are test data only and are never shipped or scanned by the
default `npm run redline:lint` (which scans `content/`).
