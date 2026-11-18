# Engine API (T-2.1)

Owner: `frontend-engineer`. Code: `src/engine/` (pure TypeScript; Preact only in `hooks.ts`). Public entry: `src/engine/index.ts`.
Rules come from `docs/GDD.md` §3–§10 and every number from `content/balance.yaml` (validated at build time by `balanceSchema`, so the runtime trusts it and ships without Zod).

## Modules
| Module | What it does |
|---|---|
| `runner.ts` | Pure state machine for one scenario: `startScenario(s, ctx)`, `step(s, ctx, state, event)`, `viewOf(s, ctx, state)`. |
| `result.ts` | `resultOf(s, balance, state)`: stars, points, tag bonus, damage control, spotting inputs, boss summing. |
| `debrief.ts` | `debriefOf(s, state, result, save.callouts)`: layer 1 and layer 2 data (UI renders it). |
| `scoring.ts` | Star table, decisive-action merge, tag bonus, max points. Shared with `scripts/lib/rules.ts`. |
| `timer.ts`, `pushers.ts`, `stress.ts` | Slot timers and modes, authored pusher schedule with stress scaling, stress meter. |
| `inspect.ts` | Checkables from the device template, reveals or neutral filler, tag tallies. |
| `recovery.ts` | Damage-control scoring, option order, "Already clicked?" situation. |
| `chapter.ts` | Chapter summary, stamps, sequence (am/pm, stop point, echoes), unlocking. |
| `arc.ts`, `habits.ts` | Alex arc state and endings; LO demonstrations and mastery. |
| `save.ts` | Versioned localStorage save, sanitising parser, migrations, storage-less fallback. |
| `game.ts` | Fold a finished scenario into the save; begin and finish chapters. |
| `hooks.ts` | `useScenarioRunner(scenario, ctx)`, `useSave(store?)`. |

## Running a scenario (device components, T-2.3)
```tsx
const runner = useScenarioRunner(scenario, { balance, slot: chapter.slot, settings: { timerMode, pushers }, stress });
const { view } = runner;           // RunnerView: everything a device needs to render
runner.act(actionId);              // an action of view.beat
runner.check(beatId, target);      // Check tool (first check of an element costs 2 s of timer)
runner.tag(beatId, target, on);    // "Mark as suspicious" (only after a check; no cost)
runner.whatNow(choiceId);          // "What now?" after hanging up: built-ins or what_now.extra ids
runner.pause(); runner.endPause(); // Take a breath (auto-closes after 5 s)
runner.freeze('translation', on);  // freeze reasons: pause_menu, settings, help, debrief, take_a_breath, translation
runner.answerInterrupt(id, actionId);
runner.continueBoss();             // after a boss beat's consequence
runner.submitRecovery(stepIds);    // damage control
runner.result                      // ScenarioResult once view.phase === 'done'
```
`RunnerView` fields: `phase` (`playing | what_now | consequence | damage_control | done`), `beat` (device, message, actions with `styled` for the pressure style, `banner`), `thread`, `checkables` (`shown`, `reveal` once checked, or `undefined` = show "Nothing unusual here"; `checked`, `tagged`), `checkedCount` (the only number the list may show), `waitingBeats`, `interrupts`, `pusherMessages`, `timer` (null when timers are off), `stress`, `pause`, `whatNow` (`choices`, `note`), `consequence`, `recovery`.

The state's `log` lists announcement-worthy events (`beat_arrived`, `pusher`, `interrupt`, `timer` half / ten_left / escalated / expired, `stress` state change) for the screen-reader announcer (coalescing and the 15 s minimum are the UI's job).

## Rules as implemented
- **Decisive action:** verify stands unless followed by comply/proceed on fraud or report on genuine; engage on fraud never decides and caps the beat group at ★★; meta (pause) never decides.
- **Hang up** on a `call` beat (or any beat with `what_now`) opens "What now?": built-ins `call_back_known` = verify, `report` = report, `done` = dismiss, each ending with `what_now.outcomes[choice]` if authored, else the `hang_up` action's outcome. Extras are listed first. An extra of kind `call_back_known` replaces the generic call-back built-in. Verify-class extras (with `outcome`) end the step with that outcome; engage extras (with `note`) return to the step with the note and cap at ★★ (no fake `next_beat`).
- **"You chose"** (UI_SPEC §8.1, producer ruling): a fall names the decisive (falling) action; otherwise, when an engage capped the group, it names the first engage label, even if the player then dismissed or reported; otherwise the decisive action. Built-in What-now choices are reported with kind `what_now`.
- **Beat groups:** the opening and each boss beat with `arrives_after` open a group; `next_beat` moves inside it. Boss beats arrive on the clock whatever the player did; one that arrives early waits as a notification; when a group resolves the clock fast-forwards to the next arrival.
- **Timers:** length by chapter slot (`timers.by_slot`), boss beats `boss_beat` (or the beat's optional `timer_seconds`, validated between `call_beat` and `boss_beat`, scaled by mode), call beats `call_beat` (also inside a boss). Extended ×2 (escalation bonus too), Off = none. First expiry: +20 s and the next pusher fires now; second: scored as dismiss, no tag bonus. Expiry only applies to a group with no decision yet: once the decision is verify the timer stops (and a call beat reached afterwards does not restart it), so expiry can never remove verify's stars. A boss beat whose timer expires shows its consequence with `consequenceTimerExpired` (the UI renders the deadline line). Check and pause costs never expire the timer on their own (they leave ≥ 1 s).
- **Pushers:** authored `at_seconds`; each gap is scaled by `stress_interval_scale` for the stress state when the previous message fired. Off with the "Pushy follow-ups" setting or the Calm preset.
- **Tags:** correct = a red flag on fraud or a `context: quoted` red flag. Every other tag (decoys, neutral fillers, genuine details) is wrong. Interrupt and drill tags never count at chapter level. Check and tag are accepted only on beats of the active, unresolved group and on unanswered interrupts (`checkableBeatIds`). The tag bonus headroom in max points exists only when the scenario has red flags (R > 0).
- **R (red flags)** counts the scheduled, scored beats every player sees (opening + scored boss beats), not follow-up pages reached by engaging.
- **Boss:** per-group points summed; a fallen beat scores 0 (and 0 stars); damage control once at the end from the first fallen beat's outcome, added once; one tag bonus counting correct tags in groups that ended in verify/report/dismiss, voided by any wrong tag across the boss; displayed stars = rounded mean.
- **Drills and arc beats** are unscored: the debrief carries `stars: null`, `points: null` and an empty "You chose". Debrief narratives are de-duplicated. Card entry inside a group whose visited beats request `pay` gives the `paid` recovery situation.
- **Falls** run damage control when the outcome has recovery options (also in drills; never on arc beats).
- **Genuine reported** = report decided on a genuine scenario + reported genuine interrupts. Banners have no actions, so they can never count.
- **Double checks:** a verify-class action on a low-stakes genuine scenario; off-focus when its `pattern` is not in the chapter's `patterns`.
- **Chapter runs:** `beginChapter` starts `run = { index, records, flags: [] }`; `runIndex` is clamped to the sequence length. Echo flags (`snake_case`) live in `run.flags`, per chapter run, so a replay starts clean; only `role: arc` scenarios write global arc flags. A replayed scenario keeps the best record by points. `summarise` exposes `spottedShown = clamp(spotted, 0, R)` for "x of R".
- **Pause** (Take a breath) works only in `playing` and `what_now`. Interrupts are hidden during consequence and damage control. `checkedCount` counts the current beat only.
- **Unlocking:** home → Berlin → free choice of slots 2–9 → finale when all of those exist and are finished. Never score-gated.
- **Save:** key `scam-atlas-europe:save`, `version: 1`. Unknown or corrupt data → fresh save; a newer version → read-only for the session (never overwritten); every field sanitised separately; storage errors are swallowed and the game runs in memory. `useSave` writes outside the state updater; `useScenarioRunner` clamps each tick to at most 1 s (`clampDt`), so a backgrounded tab cannot expire a timer in one jump.
- **No Zod at runtime:** runtime code imports only types from `src/content/schema.ts`; shared regexes live in `src/content/constants.ts`. An ESLint `no-restricted-imports` rule and `tests/unit/bundle-guard.test.ts` enforce it (shell about 29 KB gzipped).
- **i18n:** `format()` supports ICU `plural` (Intl.PluralRules, `other` branch required by the catalogue schema), e.g. `waiting_beats`.

## Content contract additions (schema)
- `what_now: { call_back_label?, outcomes?: { call_back_known?, report?, done? }, extra: [{ id, label, kind, note? | outcome? }] }` (max 3 extras, exactly one of `note` (engage) or `outcome` (verify class)) on the opening or a beat; needs a `hang_up` action with an `outcome`. Interrupts cannot have `what_now`.
- Boss beats may set `timer_seconds` (scheduled beats only).
- Validator (`scripts/lib/rules.ts`): layer-1 budget = authored (+ `safeguarding_line` on arc) + fixed overhead + `choice_worst` (2 + longest label of any action, including What-now extras, that can leave the scenario below ★★★; 6 if timed). Action labels are capped at 8 words.
- `banner: { device, message }` on the opening or a beat: a notification with no actions, not checkable on its own.
- Boss beats: either scheduled (`arrives_after`) or reached by `next_beat`, never both; at least one scheduled.
- Runtime YAML for scenarios and chapters is emitted after Zod parsing (`scripts/lib/yaml-module.ts`), so schema defaults apply.
