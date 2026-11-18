# STATUS

_Updated by the producer at the end of every session. Keep it readable in under a minute._

**Phase:** 2 — Vertical slice (started 2026-11-18) · **Next gate:** G2 (Roman plays tutorial + Berlin) · **Last update:** 2026-11-18

## Summary
Phase 1 is done. Research (PR #1) and the scaffold with the red-line linter (PR #2) are merged. The design, the UI spec and the brands are in the G1 design PR. G1 approved by Roman (all as recommended). Phase 2 (vertical slice) has started.

## Done
- [x] T-1.1/1.2 | frontend-engineer | Scaffold, schema, red-line linter, CI | PR #2 | sceptic: FAIL → FAIL → PASS (producer exception for a third round) | CI green
- [x] T-1.3/1.4 | fraud-researcher | Pattern briefs ch0–1, city map, where-to-report, 64 sources | PR #1 | sceptic: FAIL → PASS
- [x] T-1.5 | game-designer | GDD v3.2, 18 LOs, balance v3.2 | sceptic: FAIL ×3 → all G1 blockers fixed (v3.2 count/pusher tells fixed by producer) · QA: FAIL → PASS conditions met | producer exception logged
- [x] T-1.6 | ux-artist | UI spec v2, tokens, 8 fictional brands, 3 mock-ups | sceptic: FAIL → PASS · QA: FAIL → PASS
- [x] T-2.5 | fraud-researcher | Pattern briefs for ch0–1 scenarios (messenger code takeover, IT-portal phishing, card phishing, multichannel callback), 14 sources, SOURCE_HOSTS, where-to-report help draft (parked in docs/patterns) | sceptic: FAIL → PASS · 1-9 caller switched to Larchwick Bank fraud team
- [x] T-2.2 | frontend-engineer | Schema for CR-01…CR-12 + UI_SPEC §14 (pressure_target, already_clicked split, checkables from device template, palette sync test), per-chapter mix rules from balance.yaml, Red Line 8 letter check, strict brand hosts, stub chapter/cast/recovery/habit cards; CR-13 left open | branch phase2/schema | sceptic: FAIL → FAIL → PASS (producer exception for a third round)
- [x] T-R.1 | fraud-researcher | Threat catalogue backlog (86 entries: Part A social engineering/fraud, Part B malware and technical campaigns as users see them; ATT&CK-mapped), 33 sources | sceptic: PASS with notes (applied)
- [x] T-0.3 | producer | Recorded Roman's scope decision: malicious cyber campaigns (catalogue Part B) in scope at defender level; webcam blackmail help card only | CLAUDE.md Red Line 8, DECISIONS.md
- [x] T-1.7 | fraud-researcher | Brand-name web collision check (renamed Nodkey, Corvelle, Hoardly) | docs/patterns/BRAND_CHECK.md
- [x] T-2.6 | game-designer | GDD/UI_SPEC follow-ups (1-9 caller, high-stakes set, layer-1 budget, snake_case flags) | sceptic: FAIL → PASS

## Next up (Phase 2)
- [ ] T-2.1 | frontend-engineer | Engine: scenario runner, Check + tag, scoring v3.2, debrief layers, save state | reviewers: sceptic, qa
- [ ] T-2.3 | ux-artist + frontend-engineer | Devices: mail, SMS/messenger, call, browser, QR, bank, auth, letter | reviewers: sceptic, qa
- [ ] T-2.4 | scenario-writer | Tutorial (ch0) + Berlin (ch1) scenarios | reviewers: fraud-researcher, sceptic, qa

## Follow-ups (non-blocking, from reviews)
- Linter: brand letters split by `/` `,` `*`; "x dot com"; source-host check warning-only → error before G4; `St.Gallen`-style false positives; pin Actions by SHA.
- Brands: formal TMview/EUIPO search for all 8 names before G4; Kettle is spoofed in 0-4, so register look-alike domains and update role_in_game; add Swappie and Swapfiets to Swaploft's checked_against.
- Research: verify 116 111 / 116 006 per country before G3; confirm the Safeonweb address per language.
- UI: QA notes N1 (tag toggle label constant, show state by icon), N3 (first recovery step in debrief layer 1).
- Engine/schema: a "What now?" step construct (GDD §6/§17), so 1-9 beat 3 engage ("Call back this number") can return to it without a fake next_beat; GDD §6 "What now?" list should mention beat-added engage actions; state that 1-9 `message.request` sits on beat 3's message, not the banner.
- Validator (`scripts/lib/rules.ts`): the layer-1 check needs the UI_SPEC §8.1 worst case. Add choice_worst (2 + longest label of any action that can leave the scenario below ★★★, including engage; 6 if timed) for standard debriefs. Count `debrief.safeguarding_line` on arc debriefs. Cap action labels at 8 words. LAYER1_OVERHEAD 14/10 and the flag-name regex already match.
- Help screen: engineer adds single-file linter exemption + help checker (https, no query, checked, source ids, hosts incl. incydent.cert.pl, review_note never rendered) + test, then moves docs/patterns/where-to-report.draft.en.yaml to content/help/ (before G3). Update scripts/lib/source-hosts.ts from SOURCE_HOSTS.md.
- Example scenario still cites the two placeholder sources; replace when the first real scenario is written.

## Blocked
_(none)_

## Open gates
- G0 Kickoff: Approved 2026-11-18
- G1 Design: Approved 2026-11-18
- G2 Vertical slice: Open
