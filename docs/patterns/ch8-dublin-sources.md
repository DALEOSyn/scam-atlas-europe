# Chapter 8 (Dublin): sources per likely beat

Companion to GDD §18 (Dublin summary) and §10 (Alex arc) until the full chapter spec exists.
- **Owner:** fraud-researcher (T-3.10r, 2026-11-19).
- **Ids:** all defined in `content/sources.yaml`.
- **Briefs:** `investment-ad-fake-platform.md`, `recovery-scam.md`; `remote-access-support-call.md` for the optional "adviser wants your screen" beat.

**Why this file exists:** as for Paris. Ids that name real bodies stay in `docs/patterns/`; the GDD points here.

**Rules for writers:**
- Use a fictional celebrity, a fictional social network, a fictional platform (`.example`) and a **fictional regulator** with a register of authorised firms and a warning list (ux-artist to register these in `brands.yaml`). No real faces, regulator names, registers or exchange look-alikes (Red Line 1).
- Kettle is the messenger and Larchwick the bank.
- Fake pages are non-functional `SimulatedForm`s (Red Line 2).
- Celebrity "endorsements" are shown as an obviously fictional person; don't depict deepfake-making.
- No investment walkthroughs, no crypto how-to, no realistic onboarding flow (GDD §10.1 authoring rule).
- Never promise a refund. Figures (losses, report counts) stay off screen.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Celebrity ad | A post where a famous (fictional) person "recommends" a platform; a short sign-up form | ie-fraudsmart-investment-2025, ie-fraudsmart-state-scheme-ads-2026, ie-ccpc-investment-scams, ie-cbi-fraud-landscape-2025, eu-esas-ai-scams-factsheet-sv | Tell: celebrity endorsement + guaranteed returns. The professional look is a neutral decoy. |
| The "adviser" call or chat | Friendly, knowledgeable, pushes a small first deposit now | ie-fraudsmart-investment-2025, ie-fraudsmart-state-scheme-ads-2026, se-konsumentverket-investment-fraud | "Legitimate investment opportunities will never pressure you to transfer money immediately." |
| Check the regulator (LO-13; Alex slot 5) | The player opens the fictional regulator's register from the home screen; the firm isn't there, or it's on the warning list, or it's a **clone** | ie-cbi-avoiding-scams, ie-cbi-unauthorised-firms, ie-ccpc-investment-scams, se-konsumentverket-investment-fraud | Two tools: register + warning list. Not on the warning list ≠ safe. Clone: contact only via the register's details. |
| Dashboard shows growth (Alex slot 6) | A balance going up, with a chart | be-fsma-trading-platforms-2025, de-evz-online-trading-scam-2026, se-konsumentverket-investment-fraud, ie-garda-crimecall-investment-2024, ie-ccpc-investment-scams | Debrief: "A dashboard shows whatever the website wants it to show." |
| Withdrawal needs a fee (Alex slot 7) | "Pay the tax / unlock fee to withdraw" | be-fsma-trading-platforms-2025, de-evz-online-trading-scam-2026 | Irish sources opened don't mention withdrawal fees (Garda: contact cut when you cash out). The beat rests on BE/DE sources. |
| Optional: "let me see your screen" | Adviser asks to install a helper app | ie-garda-crimecall-investment-2024, be-fsma-trading-platforms-2025 | Short; the finale owns remote access. |
| Recovery offer (ending C; Dublin beat) | A "recovery agency" or "regulator unit" messages after the loss: a fee first | ie-bpfi-recovery-2024, ie-cbi-avoiding-scams, ie-cbi-fraud-landscape-2025, ie-garda-crimecall-investment-2024, eu-esas-crypto-factsheet-2025 | Line: "Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam." |
| Genuine twin | A firm found on the fictional register, contacted on the register's number; no pressure; free withdrawal | investment-ad-fake-platform §7, recovery-scam §7 | |
| Fall → damage control | Stop paying; bank now; keep evidence; report to police and the regulator; ignore recovery offers | ie-cbi-avoiding-scams, ie-ccpc-investment-scams, ie-ccpc-spot-a-scam-2026, be-fsma-trading-platforms-2025 | Harmful: "pay the withdrawal fee", "pay the recovery agency", "wait and see". |

## Ireland help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** on the number on your card or in its app. (ie-ccpc-investment-scams, ie-ccpc-spot-a-scam-2026)
2. **Report it to the Gardaí** at your local station. For investment fraud there is also the Garda Confidential Line 1800 666 111. (ie-ccpc-spot-a-scam-2026, ie-garda-investment-2025)
3. **Tell the Central Bank of Ireland** about the firm through its "Report an Unauthorised Firm" page; phone 0818 681 681 or +353 1 224 5800. (ie-cbi-avoiding-scams, ie-cbi-report-unauthorised) Link to the centralbank.ie page only; the form itself sits on a third-party survey host.
4. **Check a firm** on the Central Bank's register before paying (Learn more screen). (ie-cbi-avoiding-scams)
5. **Beware of recovery offers.** (ie-bpfi-recovery-2024, ie-cbi-fraud-landscape-2025)
6. Support and young people's lines: as in the help list (Samaritans 116 123, Childline 1800 66 66 66; ie-hse-urgent-help).
