# Balancing pass, Phase 3 (T-3.13)

Owner: game-designer · 2026-11-19 · branch `phase3/balancing` · reviewers: sceptic-reviewer, learning-psychologist.
Rulings below are **proposed** (DECISIONS R24–R27) until the producer confirms them. Engine work is listed as CR-48…CR-54 and content work as T-3.13a…m in STATUS.md; none of it is implemented here.

**How the numbers were made.** Nothing was run. Every number is hand-computed from the strategy tables in GDD §7.2 (Berlin), §22.4, §23.7, §24.7, §25.7, §26.7, §27.7, §28.7, §29.7 and §30.8, from `content/balance.yaml`, and from these files: Home's maximum and R from `content/scenarios/home/home-0{2,4,6}*.yaml` (red flags counted by the engine: 0-2 2, 0-4 1 (its `page.address` flag sits on a sub-beat and adds nothing), boss 5); timers from `src/engine/timer.ts`, `src/engine/runner.ts` (`timerKindFor`) and every `timer_seconds` in `content/scenarios/`; arc order from `src/engine/arc.ts` (`arcSlotAt`) and `src/engine/game.ts` (`beginChapter`); stamps from `src/engine/chapter.ts` (`summarise`) and `src/content/schema.ts` (stamps are `.strict()`); habits from `src/engine/habits.ts`. Rows assume perfect damage control (9 points, a `stop` step first) unless stated. Damage control is always exactly 3 picks (`src/ui/ScenarioView.tsx` submits only at 3; +3 per helpful, −2 per harmful, floor 0), so it can only score 0, 4 or 9.

---

## 1. R15: `stamps.gold.max_falls`

**Decision: `max_falls: 1`, and that one fall must be recovered** (its damage control meets LO-16: ≥ 6 points with a `stop` step first; with 3 picks that means three helpful picks, no harmful one, the first a `stop`). In player words: "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage." `tell_trusted_adult` counts as `stop` (R23(3)), so telling someone first meets the rule; acceptable for a 14+ audience. Because the `stop` category now decides gold, its use must be consistent: `call_bank_known_number` is `stop` in 28 outcomes (some are drills or arc beats, which are not falls) but `secure` in 6 (Berlin `card_details_stolen` ×2, `account_and_card_stolen`, `fee_paid_by_card`; Amsterdam `topped_up`; Home drill `helping_teo`); T-3.13l audits every fall outcome (calling the bank on a known number after card or account details are stolen should be `stop`). Set in `balance.yaml` as `stamps.gold.max_falls: 1` and `stamps.gold.falls_need_lo16_recovery: true`, with the definition in a comment.

- **A fall** is a scored comply/proceed on fraud. Each fallen standard scenario counts 1; each fallen scheduled boss beat counts 1 (a banking sub-beat is its parent beat); a boss's "recovered" uses its one damage control. **Not falls:** `advise_comply` (CR-40), a code shared then declined (R18), ★ on a genuine message, engage caps (R16), timer expiry, drills, arc and finale beats, interrupts.
- **Why 1 and not 0.** Recovery is a learning objective (LO-16), the audience is 14+, and the learning-psychologist recommends 1 (PSYCHOLOGY §9). With 0, every chapter's "characteristic trap" row would lose gold after one well-handled slip, which teaches "one mistake and you've failed".
- **Why the recovery condition.** A boss beat's fall is the cheapest fall in the game: 15 − 9 = 6 points with full damage control (added once per boss), against 19 − 9 = 10 for a standard fall. An unrecovered boss fall (−15) still leaves 91.3%, which is gold today. The condition closes that gap without changing any point maths or any pinned rating.

**Rows that change stamp:**

| Row | Falls | Pts / max | Rating | Spotted | Today | R24 |
|---|---|---|---|---|---|---|
| Dublin §28.7 row 12 (8-3 + boss b3) | 2 | 156 / 172 | 90.7% | 11 | Gold | Silver |
| Stockholm §29.7 row 12 (9-6 + boss b3) | 2 | 154 / 170 | 90.6% | 9 | Gold | Silver |
| Brussels §30.8 row 14 (10-3 + boss b3) | 2 | 156 / 172 | 90.7% | 10 | Gold | Silver |
| Berlin, new: fall on 1-7, damage control 4 (2 helpful + 1 harmful; 172 − 19 + 4) | 1, not recovered | 157 / 172 | 91.3% | 10 | Gold | Silver |
| Berlin, new: boss beat 3 fall, damage control 0 (172 − 15) | 1, not recovered | 157 / 172 | 91.3% | 11 | Gold | Silver |
| Brussels row 13a, new: boss beat 3 fall, damage control 0 (172 − 51 + 36) | 1, not recovered | 157 / 172 | 91.3% | 12 | Gold | Silver |

**Rows that keep gold** (one recovered fall): Paris row 5 (162, 95.3%), Warsaw row 11 (157, 92.4%), Rome row 12 (162, 93.1%), Lisbon row 11 (160, 94.1%), Brussels row 13 (166, 96.5%). Madrid row 11 (three falls) was already silver by rating and spotting (144, 85.7%, spotted 7 < 8) and stays silver. Under `max_falls: 0` the five rows above would also drop to silver.

**Needs CR-48.** `stamps.gold` is `.strict()` in `src/content/schema.ts` (lines 1813–1820), so `content:validate` rejects the two new keys until CR-48 adds them and `chapter.ts` counts falls. CR-48 merges first or with this file. Pinned content tests for Dublin row 12, Stockholm row 12 and Brussels row 14 flip to silver then.

---

## 2. Stamp thresholds across chapters

Max, R and spotting thresholds, with the rows that define what each stamp means (rating, stamp):

| Ch | Max | R | Silver / gold spotted | Ideal | Careful reporter | One genuine report | Blind verify | One recovered fall |
|---|---|---|---|---|---|---|---|---|
| Home | 117 | 8 | 3 / 6 | 100% G | 92 = 78.6% S | 107 = 91.5% S (grace; genuine-report rule) | 105 = 89.7% B | 0-2: 107 = 91.5% G |
| Berlin | 172 | 12 | 4 / 8 | 100% G | 79.7% S | 88.4% S | 87.2% B | 1-7: 162 = 94.2% G |
| Amsterdam | 174 | 15 | 5 / 10 | 100% G | 79.9% S | 88.5% S | 86.2% B | 164 = 94.3% G |
| Paris | 170 | 11 | 4 / 8 | 100% G | 79.4% S | 88.2% S | 88.2% B | row 5: 95.3% G |
| Madrid | 168 | 12 | 4 / 8 | 100% G | 79.2% S | 88.1% S | 89.3% B | 158 = 94.0% G |
| Warsaw | 170 | 12 | 4 / 8 | 100% G | 79.4% S | 88.2% S | 88.2% B | row 11: 92.4% G |
| Rome | 174 | 15 | 5 / 10 | 100% G | 79.9% S | 88.5% S | 86.2% B | row 12: 93.1% G |
| Lisbon | 170 | 14 | 5 / 10 | 100% G | 79.4% S | 88.2% S | 88.2% B | row 11: 94.1% G |
| Dublin | 172 | 15 | 5 / 10 | 100% G | 79.7% S | 88.4% S | 87.2% B | 162 = 94.2% G |
| Stockholm | 170 | 13 | 5 / 9 | 100% G | 79.4% S | 88.2% S | 88.2% B | 160 = 94.1% G |
| Brussels | 172 | 14 | 5 / 10 | 100% G | 79.7% S | 88.4% S | 87.2% B | row 13: 96.5% G |

(Home by hand, three scored fraud files plus two genuine: ideal 0-1 15 + 0-2 19 + 0-3 15 + 0-4 17 + boss 51 = 117; R = 2 + 1 + 5 = 8, thresholds ceil(8/3) = 3 and ceil(16/3) = 6, unchanged; reporter 14 + 12 + 36 + 30 = 92 (spotted 8); one genuine report under grace 117 − 15 + 5 = 107; blind verify 15 + 15 + 15 + 15 + 45 = 105 (spotted 0); one recovered fall on 0-2 117 − 19 + 9 = 107 (spotted 6 without 0-2's tags, still gold); a fall with damage control 4 117 − 19 + 4 = 102 = 87.2%, silver. Rows marked "=" without a GDD row number are one standard fall, 19 → 9.)

**Findings.**
- **The stamps mean the same thing everywhere.** Careful reporting is silver in every chapter (78.6–79.9%, never gold); reporting one genuine message is silver everywhere; blind verifying is bronze everywhere (no spotting); blind reporting is 31.6–32.7% bronze in chapters 1–10 (Home 60 / 117 = 51.3% under grace, still bronze: nothing spotted). Nothing that reports everything reaches gold.
- **Anti-mashing holds everywhere:** no systematic tagging rule reaches silver. Thinnest margins (net 4 against silver's 5): Amsterdam 6c, Rome 6c, Lisbon 6b, Stockholm 6d. Rome 6c and Lisbon 6b are pinned in tests; T-3.13k pins the other two. Random single tagging can reach silver only by luck in Berlin (1 in 162), Madrid (1 in 750), Paris (1 in 1,600) and Warsaw (1 in 1,700), and not at all elsewhere.
- **Out of line before this pass:** two falls reached gold in Dublin, Stockholm and Brussels (a cheap boss fall plus one standard fall), while two standard falls in Lisbon (row 12, 89.4%) did not; and an unrecovered boss fall reached gold anywhere. R24 fixes both (§1). No point or threshold change is needed.
- **Accepted differences:** the off-focus rule can only bite in Berlin, Madrid, Warsaw and Rome (other chapters have no off-focus harmless genuine message; accepted for Amsterdam in §22.9 Q6, same reasoning later). Home's smaller max makes a fall cost more rating: with damage control 4 a Home fall is 102 / 117 = 87.2% (silver by rating) against Berlin's 157 / 172 = 91.3%; under R24 both are silver anyway (4 is not a recovery), and with full recovery both stay gold (Home 91.5%, Berlin 94.2%), so the difference no longer changes a stamp; accepted for the tutorial. ★ on a genuine message (Paris row 4, Lisbon row 2) is not a fall and keeps gold; the debrief carries the lesson.
- **Considered and rejected:** voiding the boss tag bonus after any fallen beat (it would push Stockholm row 11 from 75.9% to 73.5%, bronze, and re-pin several tests for no stamp gain once R24 is in).

---

## 3. Difficulty curve, chapters 1–10

| Slot · chapter | Band / boss | Timer | Boss call beats | Genuine | Pressure parity (gen / fraud) | Calm scored | New / callbacks | Interrupts | Boss sub-beat |
|---|---|---|---|---|---|---|---|---|---|
| 0 Home | 1–2 / 2 | 60 | b3 30 s | 2/5 | exempt | 2 | 2 / 0 | 0 | — |
| 1 Berlin | 1–3 / 3 | 60 | b3 40 s | 3/8 | 67 / 80 | 2 | 2 / 2 | 1 | — |
| 2 Amsterdam | 2–3 / 3 | 55 | b3 40 s | 3/8 | 67 / 80 | 2 | 2 / 0 | 1 | b2 request page |
| 3 Paris | 2–4 / 4 | 50 | b2, b3 40 s | 3/8 | 67 / 80 | 2 | 2 / 0 | 4 | b1 banking |
| 4 Madrid | 2–4 / 4 | 50 | b2 40 s | 3/8 | 67 / 80 | 2 | **1** / 1 | 4 | b2 banking |
| 5 Warsaw | 3–4 / 4 | 45 | none | 3/8 | 67 / 80 | 2 | 2 / 1 | 4 | — |
| 6 Rome | 3–4 / 4 | 45 | **b1 30 s**, b2 40 s | 3/8 | **100 / 100** | **0** | 2 / 2 | 4 | b2 banking |
| 7 Lisbon | 3–5 / 5 | 40 | none | 3/8 | 67 / 80 | 2 | 2 / 0 | 5 | b2 banking |
| 8 Dublin | 3–5 / 5 | 40 | b2 30 s | 3/8 | 67 / 80 | 2 | 2 / 1 | 6 | b2 banking |
| 9 Stockholm | 3–5 / 5 | 35 | b1, b2 30 s | 3/8 | 67 / 80 | 2 | 2 / 2 | 6 | — |
| 10 Brussels | 4–5 / 5 | 35 | b2, b3 30 s | 3/8 | 67 / 80 | 2 | 2 / 5 (exempt) | 6 | — |

Every band, boss difficulty and scored count matches `difficulty.chapter_slots`; slot timers, difficulty and interrupts rise monotonically; every boss has 3 scheduled beats.

**Flags and decisions.**
- **Boss call beats (spike/dip).** The engine runs any call beat at `call_beat` (30 s) unless the beat sets `timer_seconds`. Berlin, Paris, Madrid and Rome b2 set 40; Home b3 and Rome b1 (an opening beat, which can't set it) run 30; Dublin, Stockholm and Brussels run 30. So the tutorial's first-ever call and Rome's opening call are harsher than Berlin's to Rome b2's. **Rule (R26):** boss call beats 40 s in slots 0–7, 30 s from slot 8 (`timers.boss_call_beat_by_slot`). Home b3 → 40 (T-3.13a); Rome b1 needs CR-54, else stays 30 with a GDD note.
- **Rome: pressure spike.** All 8 scored scenarios have a timer or pusher (3 of them are calls, which are always timed), so it is the only chapter with no calm scenario, in a sensitive chapter. Accepted: LO-04 is core in slot 6, parity is exact, and the content note is in place. Removing 6-5's timer alone would break parity (67 vs 100). QA watches stress levels in the Rome play-through. After the learning-psychologist's review, a calm scored scenario is added as T-3.13m (timer off 6-5 and the timer or pusher off one non-call fraud scenario, so parity holds), with fraud-researcher and learning-psychologist review.
- **Madrid: one new pattern** (a dip in novelty after Paris's two heavy patterns), with a new device moment (the call over the bank app). Accepted as a breather.
- **Callback cap:** R23(1)'s exemption for `arc_finale` chapters is confirmed and now stated in balance.yaml (`difficulty.callback_cap_exempt`); CR-52 makes the validator read it.
- **Session length:** the specs' estimates sum to about 180 min (Home 12, Berlin 16, Amsterdam 16, Paris 16.5, Madrid 17, Warsaw 17, Rome 17, Lisbon 16, Dublin 17, Stockholm 16, Brussels 19), the top of `session.game_hours` [2.5, 3]; ending C adds 2–3 min (§4d). QA re-baselines on a timed full play-through (T-3.13j).

---

## 4. Arc balance (R22 notes)

**a. Slot 2 skipped after a slot-1 Close: accept.** That player has already stepped back once. The off-platform tell returns in Warsaw boss beat 1 ("continue on Kettle") and Lisbon, and slot 3 carries the same safeguarding line. One sentence true for everyone goes into slot 3's layer 2 (T-3.13b). The timeline lists only played slots, so there is no empty row. The alternatives cost more: shifting every later slot by one drops slot 9 (the climax, reused by the close beat), and turning the repeat into slot 2 breaks the A′ "second Close" rule.

**b. Unusual chapter order: change it (CR-49).** Positions are fixed when a chapter is first *started* (`beginChapter`), and position N plays slot N (`arcSlotAt`). A plain unusual order is fine, but interleaved runs are not: start Berlin (position 1), leave before its arc beat, finish Amsterdam (position 2), and Alex's first message is slot 2's "let's move to Kettle". With CR-49 the next arc beat is the lowest slot not yet played. Nine middle chapters still play nine arc beats, so slot 9 is always last; the slot-1 repeat and slot-2 skip behave as today. Default map order is unaffected, so this is a non-blocker.

**c. Ending C's extra scored rounds: accept.** Arc points are banked but never shown (R22 removed the timeline line) and never feed a rating, stamp or habit card (`habits.ts` returns no LOs for arc beats). The extra rounds are practice for the players who need it, not an advantage. `balance.yaml` `arc` comment updated.

**d. Ending C length: two trims.** Hand estimate after the boss: B ≈ 225 s (close 30, reveal and debrief 30, timeline 45, ending scene 40, feelings 20, Open Evening 60); C ≈ 355 s (close 30, reveal and debrief 30, arc damage control 45, recovery email 45, its debrief 20, timeline 45, variant 10, ending scene 50, feelings 20, Open Evening 60), plus 45 s if the recovery test falls. That makes C 2–3 min longer and Brussels about 20.5–22.5 min against the 14–20 target.
- **Trim 1 (CR-53):** a fall on the recovery-agency test shows its steps read-only (correct steps, `recovery_note`, feedback on `pay_recovery_service`) instead of a second scored pick straight after the arc damage control, which has just taught the same stop steps. Saves about 45 s. Red Line 4 still holds through the read-only steps and `already_clicked`.
- **Trim 2 (T-3.13h):** ending C's scene ≤ 3 panels (keep Adaeze's recovery panel, the only scene panel with next steps and the help-list pointer (STORY §5.4, §5.8); drop Adaeze's warm panel instead, whose "the lie was theirs" already opens the arc damage control (R22(4)) and whose "you were real" the feelings scene covers). Saves about 20 s.
- **Kept:** the reveal, both debriefs (Red Line 4), the feelings scene (psych), and the blame-on-the-lie line, which now plays once (the recovery test's setup is only "A few days later, an email arrives.", so §30.14 item 11's "plays twice" note is out of date).
- Result: about 20–21.5 min for C with a fall on the recovery test; QA measures (T-3.13j).

**e. Slot 9 before the close beat: verified.** The close beat plays only with the arc open. On every such path, position 9's chapter (which must be finished before Brussels unlocks) reaches its arc beat with `arcSlotAt` returning 9: the arc isn't closed, slot 9 isn't in the timeline, and the slot-1 repeat only affects position 2. Default order: Stockholm plays slot 9 between 9-6 and 9-7, then `brussels-arc-close` shows it under "Yesterday". Today's one gap is interleaving (slot 8 could follow slot 9, making "Yesterday" slightly untrue); CR-49 closes it. T-3.13j adds the full-path e2e.

**"You told someone" (ending B).** The close beat's photo check sets `arc_told_someone` (R22(2)), so a player who only ever stepped back and then did the photo check would read Adaeze's "You told someone…". Decision (R25(5)): the close beat's solo photo check sets `arc_checked`; the engine also sets `arc_told_someone` when any arc slot was decided by `report` or `ask_someone` (CR-51); ending B gets the truthful line "You never sent any money, and the timeline did the rest. Next time, telling someone early makes it even easier." (`unless_flag`, psych to word). Teo's chat keeps its flags: that photo check is done together with Teo. Ending C (after CR-51): `if_flag: arc_checked` "You checked in the end. That's what works." · `unless_flag: arc_checked` "You reported it. That's what works." (no leading "And"; 3 panels: this line, Adaeze's recovery panel, Teo; psych round 2).

---

## 5. Open items ruled (GDD §30.14 item 11 and the two flagged lines)

| Item | Ruling | Ticket |
|---|---|---|
| Psych 4: `tell_trusted_adult` reads optional for adults | Shared label "Tell someone you trust now (under 18: a parent, carer or another adult you trust)"; still `stop` | T-3.13c |
| Psych 5: second-person labels in a drill about someone else | Accept: the CR-32/CR-41 prompt names who; labels read as advice you pass on (0-5, 5-7, 6-6, 10-5) | none |
| Psych: duplicated steps on `easy-money-costs-you` | One line in MMR §7 order: "It's not too late: paid, or shared your login or card? Stop: no last fee releases the money. Tell someone you trust today, call your bank on the number on your card, then change your login. Keep the chats." | T-3.13g |
| Fact 1: `go_offline` on a laptop | Shared label "Take the device offline: wifi off, cable out or airplane mode" | T-3.13c |
| Fact 2: police-online label for Belgium | Brussels uses `report_to_police`; the help card names the channel | T-3.13d |
| Fact 4: Marrowby decoy wording | "Shows Marrowby. A caller can make any name and number show on your screen, so the screen can't prove who is calling. Judge what the caller says and asks." Caller ID stays D (SK1); the tell stays on the claim (BX1) | T-3.13e |
| Fact 5: 10-4 already-clicked | "Already shared it? It's not too late: stop replying, tell someone you trust today and call your bank on the number on your card. Then change your login." | T-3.13f |
| Ending B "You told someone…" after a photo check only | §4 above (R25(5)) | CR-51, T-3.13h, T-3.13i |
| 4-6 timer-out at ★0 next to "Nothing is lost yet" | Keep R21's 0 (expiry = "Leave it"); change the copy wherever a genuine expiry scores 0: `deadline_genuine_missed` "Time's up in the game, so it counts as leaving it. The message's real deadline: {deadline}. Checking it your own way works." "Nothing is lost yet" stays for ★/★★ expiries | CR-50 |

---

## 6. 50 s timers and R21 expiry, all timed genuine scenarios

- **Lengths are consistent by construction.** Only boss files set `timer_seconds` (14 occurrences, all scheduled boss beats); every standard scenario takes `timers.by_slot` through the engine, so Paris 3-1/3-6 and Madrid 4-6 run 50 s like every other slot-3/4 timer, and Madrid 4-2/Rome 6-2 run the 30 s call length.
- **All 20 timed genuine scenarios have an `honest_deadline`.** R21 outcomes: 12 of the 13 high-stakes ones score 0/0 on expiry (Berlin 1-6, Paris 3-1, 3-6, Madrid 4-6, Warsaw 5-4, Rome 6-5, Lisbon 7-1, Dublin 8-1, Stockholm 9-1, 9-3, Brussels 10-1, 10-6), Home 0-3 scores ★/5 (grace), and the 7 low-stakes ones score ★★/10 (Amsterdam 2-5, Madrid 4-2, Warsaw 5-1, Rome 6-1, 6-2, Lisbon 7-5, Dublin 8-5). Every one of them has a dismiss option, so `timer_expiry.genuine_high` (★/5) is no longer reached in shipped content; it stays as the rule's fallback.
- **One inconsistency, in copy, not scoring:** "Nothing is lost yet" was shown next to 0 stars on the 12 high-stakes expiries (CR-50). Four of them have real deadlines of days (Paris 3-1, Rome 6-5, Dublin 8-1, Brussels 10-1). I considered scoring a deliberate "Leave it for now" there at ★, but an authored `score` sets points only, never stars (`scoring.ts`), and replacing those timers with pushers would leave timers on 1 of 3 genuine vs 4 of 5 fraud in four chapters (a timer tell). So R21 stands as is.

---

## What changed in this pass
- `content/balance.yaml` v3.3: `stamps.gold.max_falls: 1`, `falls_need_lo16_recovery: true` (needs CR-48); `timers.boss_call_beat_by_slot`; `difficulty.callback_cap_exempt: [arc_finale]`; comments on R21 expiry, arc points and session length.
- `docs/GDD.md`: §7.1 gold bullet, new §7.3 (gold and falls, stamps across chapters), §8 boss call beats and genuine-expiry copy, §10.3 arc balancing notes, §12 curve check, §30.6 flag semantics and ending C trims, §30.14 item 12 (rulings), stamp notes on Paris Q3, Warsaw row 11, Rome row 12, Lisbon row 11, Dublin row 12, Stockholm row 12, Brussels rows 13a/14.
- `docs/DECISIONS.md`: R24–R27, proposed (game-designer, T-3.13); renumber at merge if a parallel PR takes these numbers.
- `docs/STATUS.md`: T-3.13 (in review: sceptic, learning-psychologist), CR-48…CR-54, T-3.13a…m.

## 8. Review round 1: learning-psychologist (FAIL, 3 must-fixes, all applied)

1. Ending C keeps Adaeze's recovery panel (the only scene panel with next steps and the help list); her warm panel is dropped instead (T-3.13h).
2. The gold hint is two keys in the "To reach gold next time:" format: `tier_need_falls_recovery` and `tier_need_falls` (R24, CR-48). Rule line before play (as reworded after the sceptic's round 1, §9): "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage."
3. `deadline_genuine_missed`: "Time's up in the game, so it counts as leaving it. The message's real deadline: {deadline}. Checking it your own way works." (CR-50).

Suggestions taken: `tell_trusted_adult` "(under 18: a parent, carer or another adult you trust)"; Marrowby decoy "can't prove who is calling"; ending B `unless_flag` line "You never sent any money, and the timeline did the rest. Next time, telling someone early makes it even easier."; CR-54 raised to medium; T-3.13j adds one Extended-timer run. Also taken, with final wording now in the tickets (§9): the easy-money line opens "It's not too late:" (T-3.13g), the 10-4 line says "stop replying" and "someone you trust" (T-3.13f), T-3.13b gives a concrete reason instead of "helps". The calm scored scenario in Rome is ticket T-3.13m.

## 9. Review round 1: sceptic-reviewer (FAIL, all fixes applied)

Must-fix:
1. `balance.yaml`: the gold comment no longer contains a dotted path that `redline:lint` reads as a domain ("fall_on_fraud in points exceptions", "recovery's lo16_demonstrated_if"); "every one-fall row stays gold" → "every one-recovered-fall row stays gold".
2. Damage control is exactly 3 picks, so it scores 0, 4 or 9. The impossible "Berlin 1-7 fall, damage control 3 = 156 / 90.7%" row is now "damage control 4 (2 helpful + 1 harmful) = 157 / 172 = 91.3%", gold today, silver under R24 (§1, GDD §7.3, CR-48). The unreachable "damage control 6" in §2 is recomputed with 4 (Home 87.2%, Berlin 91.3%).
3. Home: the engine's max is 117 and R 8 (home-04 is worth 17; its `page.address` flag is on a sub-beat). Thresholds stay 3 / 6. Rows recomputed against balance.yaml's bands: careful reporter 92 = 78.6% silver; one genuine report under grace 107 = 91.5% silver; blind verify 105 = 89.7% bronze; one recovered fall on 0-2 107 = 91.5% gold; a fall with damage control 4 102 = 87.2% silver (§2, GDD §7.3: "three scored fraud files").
4. "≥ 6 points with 3 picks" means no harmful pick, so the rule line and hint say so: rule line "Gold allows one slip, as long as every step you picked after it helped, starting with one that stops the damage."; `tier_need_falls_recovery` "after a slip, pick only steps that help, starting with one that stops the damage"; `tier_need_falls` unchanged (R24, GDD §7.3, CR-48, §1, §8).
5. `stop` categories: `call_bank_known_number` is `stop` in 28 outcomes (some are drills or arc beats, which are not falls) and `secure` in 6. New ticket T-3.13l (scenario-writer + fraud-researcher) audits every fall outcome; named in R24 and §1. Note: Berlin 1-7's `fee_paid_by_card` is one of the six, so the Berlin 1-7 rows depend on it.
6. Wording: 10-4 "stop replying, tell someone you trust today" (T-3.13f, GDD §30.14 item 12); Marrowby "A caller can make any name and number show on your screen, so the screen can't prove who is calling. Judge what the caller says and asks." (T-3.13e, R27, GDD, §5); easy-money line opens "It's not too late:" (T-3.13g); T-3.13b's sentence gives the reason (like a secret, moving apps takes the chat away from where you could report the profile). Nothing is left to the scenario-writer's choice.

Non-blocking, also applied: CR-48 defaults saved records without `falls` / `fallsRecovered` in `save.ts` `sanitiseRecord` (0 and true) and adds the rule line wherever gold is explained before play; T-3.13d/f/g name the pinned tests they break (tests/content/brussels.test.ts:174, :199, the easy-money card test at :371–381); CR-52 restricts `callback_cap_exempt` to `z.array(z.literal('arc_finale'))` and keeps brussels.test.ts:102; CR-54's validator check of boss call beats is required; T-3.13m (calm Rome scenario); `tell_trusted_adult` counts as `stop` (R23(3)), so telling someone first meets the rule, which is acceptable for 14+ (§1); the money-mule case ("money arrived in your account? don't pass it on, tell your bank") is flagged to fraud-researcher in T-3.13g.
