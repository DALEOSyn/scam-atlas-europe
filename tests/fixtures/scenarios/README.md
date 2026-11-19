# Engine fixture scenarios (CR-30 to CR-35)

Test-only scenarios, one per engine change request for Madrid and Warsaw. Not game content: they are in
no chapter and never ship. `tests/unit/engine/cr30-35.test.ts` validates them (schema, scenario rules,
cross-file checks, red-line lint) and plays them through the runner; the e2e harness
(`?view=scenario&id=<id>`, `tests/e2e/cr30-35.spec.ts`) renders them in the real ScenarioView.
Fictional brands only (content/brands.yaml), non-routable identifiers (Red Lines 1 and 3).
