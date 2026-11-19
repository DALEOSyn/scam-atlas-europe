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
runner.freeze('translation', on);  // freeze reasons: pause_menu, settings, help, debrief, take_a_breath, translation, call_lines
runner.answerInterrupt(id, actionId);
runner.continueConsequence();      // after the consequence step (every resolved beat with a narrative or expired timer)
runner.submitRecovery(stepIds);    // damage control
runner.result                      // ScenarioResult once view.phase === 'done'
```
`RunnerView` fields: `phase` (`playing | what_now | consequence | damage_control | done`), `beat` (device, message, actions with `styled` for the pressure style, `banner`), `thread`, `checkables` (`shown`, `reveal` once checked, or `undefined` = show "Nothing unusual here"; `checked`, `tagged`), `checkedCount` (the only number the list may show), `waitingBeats`, `interrupts`, `pusherMessages`, `timer` (null when timers are off), `stress`, `pause`, `whatNow` (`choices`, `note`), `consequence`, `recovery`.

`pusherMessages` items are `PusherMessageView { text, at, lang?, translation? }` (CR-14: a pusher in another language carries an inline translation; the UI renders it like any translated message).

The UI holds the `call_lines` freeze while a call rings and while transcript lines are still being revealed at reading pace (or in step mode), so the call timer only runs while the player can act.

The state's `log` lists announcement-worthy events (`beat_arrived`, `pusher`, `interrupt`, `timer` half / ten_left / escalated / expired, `stress` state change) for the screen-reader announcer (coalescing and the 15 s minimum are the UI's job).

## Rules as implemented
- **Decisive action:** verify stands unless followed by comply/proceed on fraud or report on genuine; engage on fraud never decides and caps the beat group at ★★; meta (pause) never decides.
- **Hang up** on a `call` beat (or any beat with `what_now`) opens "What now?": built-ins `call_back_known` = verify, `report` = report, `done` ("Leave it there") = dismiss, each ending with `what_now.outcomes[choice]` if authored, else the `hang_up` action's outcome. Extras are listed first. An extra of kind `call_back_known` replaces the generic call-back built-in. Verify-class extras (with `outcome`) end the step with that outcome; engage extras (with `note`) return to the step with the note and cap at ★★ (no fake `next_beat`).
- **"You chose"** (UI_SPEC §8.1, producer ruling): a fall names the decisive (falling) action; otherwise, when an engage capped the group, it names the first engage label, even if the player then dismissed or reported; otherwise, over-caution on a genuine message (`overCautionOf(cls, truth, player_started)`: report on genuine; dismiss on genuine high stakes) gives kind `over_caution` (`report_genuine` | `dismiss_genuine` | `dismiss_started`, ruling L4); otherwise the decisive action. Built-in What-now choices are reported with kind `what_now` and render `you_chose_whatnow_*` ("You hung up and left it there.", ruling L1).
- **Tutorial grace** (ruling L4, balance `tutorial_grace`): `RunnerState.slot` (from `ctx.slot`) goes to `scoreGroup(…, { slot })`; in a grace slot (0) report on genuine and dismiss on genuine high stakes score ★ and 0 points (`graceFor()`). Not on timer expiry. Order in `scoreGroup`: star table (incl. the −5 report exception) → grace → an authored `score` override (CR-01), which sets the points only, never the stars. The override is the author's explicit per-action decision, so it wins over every table rule, grace included; a test pins this. `genuineReported` is unchanged, so stamps are unchanged. `balanceSchema` rejects grace cells above ★ or paying ≥ (stars + 1) × per_star, so stars and points never invert.
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
- **Chapter runs:** `beginChapter` starts `run = { index, records, flags: [] }`; `runIndex` is clamped to the sequence length. Echo flags (`snake_case`) live in `run.flags`, per chapter run, so a replay starts clean; only `role: arc` scenarios write global arc flags. A replayed scenario keeps the best record by points. `summarise` exposes `correctShown = min(R, correctTags)` for "Red flags you spotted: x of R" next to `wrongTags` ("Marks on safe details", ruling L3); `spotted` (net) still decides stamps, and the tier hint shows `max(0, spotted)`. `spottedShown = clamp(spotted, 0, R)` stays available.
- **Check and tag** are accepted only in phase `playing`; `view.checkables` is empty in every other phase (no checks after hanging up, in "What now?", consequence or damage control).
- **Corrupt run (QA E8):** `beginChapter(save, city, chapter?)` restarts the run when the saved index is beyond 1 + the furthest recorded scenario of the chapter's sequence (tampered saves only).
- **Consequence step:** after every resolved beat group that has an outcome narrative or an expired timer (also the last one), the phase is `consequence`; `continue` goes to the next boss beat, damage control or `done` (layer-1 ruling 2026-11-19).
- **Debrief data (T-2.3):** `drill` (unscored drill) and `fell` (the player fell; the UI shows "This could happen to anyone." only then). `layer1.verdict` is null when unscored (arc, drill). CR-15: `layer1.youChose` holds at most one line, for the boss beat with the fewest stars (tie → latest beat); other lines are in `layer2.youChoseOther`. After a fall `layer1.youChose` is empty and the lead line opens `layer2.youChoseOther`. The same when the displayed stars are 3 but a beat scored lower (ruling L1): then, on a boss only, `layer1.nextTime = 'after_hang_up'` if the lead beat's class is dismiss on fraud ("Next time: call a number you know."), else null (the validator counts the pointer only on a boss). `layer1.allBest` (every scored beat ★★★) gates the "That is the habit that works." line. `layer2.youChoseOther` entries are `{ line, stars, beat }` (`beat` = `{ device, message }` on a boss for "{beat} ({stars} of 3 stars): {line}", null on single-beat scenarios). `layer2.wrongTags` entries carry the inspectable `type` and `fairInstinct` (a caller_id / sender / logo decoy on fraud, ruling L2). `layer2.narratives` and `layer2.deadline` (`fake` on fraud, `real` on genuine, gated by `is_fraud` like `view.consequenceDeadline`) feed "What happened"; they are not in layer 1.
- **Choice lines:** `choiceLineText(line, lookup)` and `nextTimeText()` (`src/engine/choiceText.ts`) are the one source of the rendered slot text, used by DebriefView and by the validator's `choiceLines()` / `layer1Slot()`. The validator builds each line with the engine's own `overCautionOf()`, so it counts exactly what can be shown.
- **Pause** (Take a breath) works only in `playing` and `what_now`. Interrupts are hidden during consequence and damage control. `checkedCount` counts the current beat only.
- **Unlocking:** home → Berlin → free choice of slots 2–9 → finale when all of those exist and are finished. Never score-gated.
- **Save:** key `scam-atlas-europe:save`, `version: 1`. Unknown or corrupt data → fresh save; a newer version → read-only for the session (never overwritten); every field sanitised separately; storage errors are swallowed and the game runs in memory. `useSave` writes outside the state updater; `useScenarioRunner` clamps each tick to at most 1 s (`clampDt`), so a backgrounded tab cannot expire a timer in one jump.
- **No Zod at runtime:** runtime code imports only types from `src/content/schema.ts`; shared regexes live in `src/content/constants.ts`. An ESLint `no-restricted-imports` rule and `tests/unit/bundle-guard.test.ts` enforce it (shell about 47 KB gzipped after T-2.3). `npm run test:bundle` runs after the build (in `check` and CI) with `BUNDLE_REQUIRED=1`, so a missing `dist/` fails, and checks the 300 KB gzipped shell budget.
- **i18n:** `format()` supports ICU `plural` (Intl.PluralRules, `other` branch required by the catalogue schema), e.g. `waiting_beats`.

## Content contract additions (schema)
- `what_now: { call_back_label?, outcomes?: { call_back_known?, report?, done? }, extra: [{ id, label, kind, note? | outcome? }] }` (max 3 extras, exactly one of `note` (engage) or `outcome` (verify class)) on the opening or a beat; needs a `hang_up` action with an `outcome`. Interrupts cannot have `what_now`.
- Boss beats may set `timer_seconds` (scheduled beats only).
- Validator (`scripts/lib/rules.ts`): layer-1 budget = authored (+ `safeguarding_line` on arc) + fixed overhead + slot (the longest line that can actually appear: the ★★★ line, the kind line after a fall, every rendered choice line, the "Next time" pointer on a boss; UI_SPEC §8.1). Action labels are capped at 8 words.
- `balance.yaml` `tutorial_grace: { slots, report_on_legit: { stars, points }, dismiss_on_legit_high: { stars, points } }` (required; stars 0–1, points 0 ≤ p < (stars + 1) × per_star).
- Validator: a padlock reveal (`type: padlock` or `page.info`) must not start with "It fits", and padlock reveals must be identical in every scenario (`padlockRevealIssues`, docs/CONTENT_GUIDE.md).
- `banner: { device, message }` on the opening or a beat: a notification with no actions and a required `body`. A beat with a banner gets the `request` checkable (the banner's text, e.g. the code SMS or approval prompt); inspectables on `request` need a banner, `type: request` and a `message.request` other than `none`.
- Pusher messages may carry `lang` + `translation` (CR-14), validated like message translations.
- Outcome `recovery` entries may carry their own `feedback` (scenario-specific harmful-pick line; `RecoveryOption.feedback`), which overrides the shared one. Shared lines in `content/recovery_steps.yaml` stay generic because steps are reused across scenarios.
- `content/recovery_steps.yaml` steps may carry `feedback` (a non-blaming line shown when the player picks the step in damage control); the validator requires it on every `harmful` step.
- `brands.yaml` is emitted to the runtime as a projection `{ id, name, short_name?, mark? }` only.
- Boss beats: either scheduled (`arrives_after`) or reached by `next_beat`, never both; at least one scheduled.
- Runtime YAML for scenarios and chapters is emitted after Zod parsing (`scripts/lib/yaml-module.ts`), so schema defaults apply.
