# Chapter 9 (Stockholm): sources per likely beat

Companion to GDD §18 (Stockholm summary) until the full chapter spec exists.
- **Owner:** fraud-researcher (T-3.10r, 2026-11-19).
- **Ids:** all defined in `content/sources.yaml`.
- **Briefs:** `e-id-approval-on-call.md`, `remote-access-support-call.md`; `spoofed-authority-call.md` for the caller-ID decoy.

**Why this file exists:** as for Paris. Ids that name real bodies stay in `docs/patterns/`; the GDD points here.

**Rules for writers:**
- Gatewren is the fictional e-ID app, Larchwick the bank, and Kettle the messenger.
- Show only the victim's screens: the call, the Gatewren prompt and what it names, the QR in a chat. Never show how a session is captured or a QR is relayed (Red Lines 2 and 4).
- QR codes resolve to `/qr/<id>` only (Red Line 3).
- No home visits or card pick-ups (Red Line 8; Swedish police mention them, but they are out of scope).
- Never promise a refund. Figures stay off screen.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| SMS that gives a number to call | "Suspicious payment? Call us on …" | se-polisen-campaign-2026, eu-epc-threats-2025 | Links to `multichannel-support-callback.md`. |
| "Bank security" call asks you to log in with Gatewren to "stop" a payment | Call screen with a bank-looking number; a Gatewren prompt appears | se-polisen-telefonbedrageri, se-polisen-vishing-2026, se-polisen-campaign-2026, se-konsumentverket-investment-fraud | Tell: an e-ID prompt you didn't start. The caller ID is a neutral decoy. |
| "Police" call asks you to identify yourself | "We need to verify you" | se-polisen-nord-fake-police-2025, se-polisen-telefonbedrageri | "The police never call and ask for e-ID identification." |
| QR login sent by message | A Kettle or SMS message: "Scan this with Gatewren to verify / receive" | eu-epc-threats-2025, eu-esas-ai-scams-factsheet-sv | **Medium:** EU-level sources; no Swedish official page opened describes the QR variant. |
| Prompt text ≠ caller's story | The caller says "cancel"; Gatewren says "Log in to Larchwick" or "Sign payment" | se-polisen-telefonbedrageri | Design inference from "identifying lets the fraudster into your internet bank"; keep the prompt generic. |
| Boss beat 1: "Don't call your bank: one of their staff is involved" (GDD §29.6) | Isolation claim on a "police" call | de-polizei-berlin-falsche-polizei-2025, eu-epc-threats-2025 | Sourced as a known claim (DE police: a "mole" in the bank; EPC: victims told to ignore bank alerts). Not Sweden-specific, so no debrief says it is. Added 2026-11-19 (Stockholm spec fact-check). |
| Place and device on a Gatewren prompt (9-2, 9-5, 9-6) | "Malmö / Windows computer" on a login the player didn't start | (design; no source) | The fictional prompt shows them as game clues. Whether real e-ID prompts show the requester's place or device was not verified (the provider's guidance wasn't opened, EID §9), and a place can match yours, so debriefs keep "did you start it?" as the deciding question, never "check the city" (GDD SK2). |
| Twins (`proceed`) | The player opens a fictional service from the home screen and the Gatewren prompt names it | e-id-approval-on-call §7 | |
| Remote-access preview (LO-15) | A "support" caller asks you to install a helper app; the player hangs up | eu-esas-ai-scams-factsheet-sv, se-konsumentverket-investment-fraud, eu-europol-iocta-2026 | Stops at the request. The Brussels boss owns the full version. |
| Fall → damage control | Bank now (24/7 number on the card or in the app); police 114 14; keep the call log | se-polisen-telefonbedrageri, se-polisen-nord-fake-police-2025 | Harmful: "approve again to cancel", "call back the number they gave", "wait and see". |

## Sweden help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** to stop payments or block your card. Banks have a number you can call day and night: use the one on your card or in your bank's app. (se-polisen-telefonbedrageri)
2. **Report to the police:** 114 14, or 112 if it's happening now. (se-polisen-telefonbedrageri)
3. **Never identify yourself with your e-ID for someone who contacted you.** (se-polisen-telefonbedrageri, se-polisen-nord-fake-police-2025)
4. Support, crisis and young people's lines: as in the help list (Jourhavande medmänniska, Mind Självmordslinjen 90101 as the crisis row, BRIS 116 111).
