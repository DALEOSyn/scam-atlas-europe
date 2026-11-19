# The team and how work flows between agents

| Agent | Role | Writes | Reviews |
|---|---|---|---|
| `producer` | Orchestrator: picks tasks, delegates, enforces reviews and gates, keeps STATUS.md | STATUS.md, DECISIONS.md (gate summaries only) | phase exit criteria |
| `game-designer` | Loop, progression, scoring, learning objectives | GDD.md, LEARNING_OBJECTIVES.md, balance.yaml | scenario fun and fairness |
| `fraud-researcher` | Real European fraud patterns, sources, fact-checks | patterns/*.md, sources.yaml, report-where list | every scenario and locale |
| `scenario-writer` | Scenarios, characters, debriefs as YAML | content/scenarios/** | — |
| `ux-artist` | Simulated devices, fictional brands, accessibility of UI | UI_SPEC.md, tokens, public/brands/** | UI implementation fidelity |
| `frontend-engineer` | Engine, UI, schema, red-line linter, tests, CI | src/**, scripts/**, tests/** | — |
| `qa-playtester` | Persona play-throughs, bugs, accessibility | qa/*.md | every playable change |
| `sceptic-reviewer` | Adversarial review, Red Lines veto, code review | nothing (read-only) | everything |
| `learning-psychologist` | Learning science, behaviour change, persuasion levers, emotional safety, no dark patterns (added 2026-11-19 at Roman's request) | PSYCHOLOGY.md; psychology sections of STORY.md and ART_DIRECTION.md | every story scene, chapter spec and UI change (review, no veto) |
| `localizer` | Cultural adaptation per locale | i18n/**, *.locale.yaml, GLOSSARY.md | — |

## Hand-off chains

**New fraud pattern → playable scenario**
```
fraud-researcher (pattern brief)
  → game-designer (decision design: actions, outcomes, scoring, LO ids, story beats)
  → learning-psychologist (review of the chapter spec)
  → scenario-writer (YAML + debrief, passes validate + redline lint)
  → [parallel] fraud-researcher fact-check · sceptic-reviewer · qa-playtester · learning-psychologist (story scenes and debrief tone)
  → producer marks Done (all PASS) or returns once with findings
```

**New mechanic / UI**
```
game-designer (spec) → ux-artist (UI spec) → frontend-engineer (code + tests)
  → [parallel] sceptic-reviewer · qa-playtester · learning-psychologist → producer
```

**Story scene (track S, see PLAN.md)**
```
game-designer + learning-psychologist (STORY.md beat) → scenario-writer (scene YAML)
  → ux-artist (illustrations: portraits, backdrops, panels as original SVG)
  → [parallel] sceptic-reviewer · learning-psychologist · qa-playtester → producer
```

**Localization of a chapter**
```
(English chapter Done) → localizer → [parallel] fraud-researcher (local accuracy) · sceptic-reviewer · qa-playtester → producer
```

## Review rules
- Reviewers are invoked as fresh agents and get the files, not the author's explanation, so their read is unanchored.
- Verdict is binary: PASS or FAIL with a numbered list of what would make it pass.
- One rework loop per task. A second FAIL means Blocked, logged in STATUS.md, and surfaced at the next gate.
- `sceptic-reviewer` has veto on Red Lines. Nobody can override it except Roman, in writing, in DECISIONS.md.

## Briefing template (producer → agent)
```
Task: T-<id> <goal>
Context: <links to pattern brief / GDD section / UI spec>
Files in scope: <paths>  (do not touch anything else)
Acceptance criteria: <numbered>
Reviewers: <list>
Return: list of changed files, what you were unsure about, STATUS line
```
