# Engine fixture scenarios (CR-30 to CR-39)

Test-only scenarios, one per engine change request for Madrid and Warsaw. Not game content: they are in
no chapter and never ship. `tests/unit/engine/cr30-35.test.ts` validates them (schema, scenario rules,
cross-file checks, red-line lint) and plays them through the runner; the e2e harness
(`?view=scenario&id=<id>`, `tests/e2e/cr30-35.spec.ts`) renders them in the real ScenarioView.
Fictional brands only (content/brands.yaml), non-routable identifiers (Red Lines 1 and 3).

CR-36 to CR-39 (Rome, Lisbon, Dublin, Stockholm) follow the same pattern: `cr36-*` … `cr39b-*`, validated
and played in `tests/unit/engine/cr36-39.test.ts`, rendered in `tests/e2e/cr36-39.spec.ts`. The CR-38 register
firms live in `tests/fixtures/brands-register.yaml` (test-only, merged into the brand registry by the unit
tests and the harness, never shipped).
