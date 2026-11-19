# Finale fixtures (CR-40 … CR-44)

Test-only: a slot-10 chapter (`fxfinale`) with an arc finale block, its three finale scenarios and its
resolution scenes. Not game content (the Brussels chapter is written later by `scenario-writer`); never shipped.
`tests/unit/engine/cr40-44.test.ts` validates them (schema, chapter and scenario rules, scene set rules) and
plays the dispatch; the e2e harness (`?view=app&arc=<state>`, `tests/e2e/cr40-44.spec.ts`) plays the chapter
in the real App with a seeded in-memory save. Fictional brands and names only; no amounts in the arc block.
