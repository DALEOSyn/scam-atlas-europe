# Chapter 4 (Madrid): sources per likely beat

Companion to GDD §18 (Madrid summary) until the full chapter spec exists. Owner: fraud-researcher (T-3.6r, 2026-11-19). All ids are defined in `content/sources.yaml`. Brief: `bank-safe-account-call.md` (reuses `multichannel-support-callback.md` for the code-request variant).

**Why this file exists.** Several ids contain names on `content/redline-denylist.txt`. The docs brand test rejects those outside `docs/patterns/`, so the GDD should cite no source ids inline and point here, as for Paris.

**Rules for writers:** real bodies (INCIBE, 017, Banco de España, Policía Nacional, Guardia Civil, CNMC) appear only on the Spain help card. In scenarios the bank is Larchwick, the messenger Kettle, and numbers are masked or fiction-range (Red Lines 1, 3). Never promise a refund. Never say Spain's SMS sender register has stopped spoofed texts.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Spoofed SMS in the genuine Larchwick thread ("transfer of €X to ES•••; if you don't recognise it, call …") | Real past Larchwick texts above, the fake below, a number to call | es-incibe-smishing-bank-callback-2025, es-bde-sms-callerid-spoofing-2022, es-incibe-sms-banks-2022, eu-epc-threats-2025 | Red flag: a number to call; "in the real thread" is a decoy (neutral reveal). Spelling/accents: bonus clue only. |
| Same SMS, link variant (older) | Link to a fake Larchwick login | es-incibe-sms-banks-2022 | Optional; Home already teaches login links. |
| "Security department" call after the player rings the number | Recorded menu, then an agent; "I won't ask for your passwords"; guided transfer in the real app to a "safe" account | es-incibe-smishing-bank-callback-2025, pl-cert-fake-consultants, fr-bdf-osmp-2024, eu-eba-ecb-fraud-2025 | The decisive act is a transfer the player makes; red flag "move your money to keep it safe". |
| Incoming call showing "Larchwick" (caller-ID variant) | Bank name on the call screen; asks for a code "to cancel" a payment | es-bde-sms-callerid-spoofing-2022, es-bde-vishing-2020, multichannel-support-callback sources | Caller ID is a decoy. "A code makes no sense if you made no operation." |
| Habit: hang up, open the app yourself, call the number on the card | Larchwick app shows no such transfer; the card's number | es-incibe-smishing-bank-callback-2025, es-bde-sms-callerid-spoofing-2022, es-bde-vishing-2020, eu-europol-phishing-leaflet | |
| Genuine twins: real bank alerts with honest timers | A one-time code for a purchase the player is making; a card-payment alert that matches; "check in your app" | es-bde-sms-callerid-spoofing-2022 (check your account yourself), es-incibe-smishing-bank-callback-2025 | Same thread and sender as the fake; the difference is "did I start this, and does the app confirm it?". |
| Fall → damage control | Bank on the card's number (try to stop or recall); screenshots and call log; police report with a copy for the bank; 017 for advice; complaint to the bank, then the Banco de España | es-incibe-smishing-bank-callback-2025, es-incibe-017-faq, es-bde-reclamacion, es-bde-vishing-2020, es-bde-msr2025-fraude | "May not have to refund you" (authorised payment): es-bde-msr2025-fraude. EU refund rule only provisional: eu-ep-psr-deal-2025 (designer context, not on screen). |
| Debrief context line on Spain's sender register (optional) | "Since September 2026, Spanish phone companies must block texts under sender names that aren't registered. Even so, a text in your bank's real thread is no proof." | es-boe-orden-tdf-149-2025, es-boe-cnmc-circular-1-2026, es-boe-cnmc-circular-2-2026, es-boe-cnmc-circular-3-2026, es-cnmc-alias-callout-2026, es-bde-medidas-fraude-telefono-2025 | Only this wording or weaker. No effectiveness claim. |

## Spain help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** on the number on your card or in its app; ask it to try to stop or recall the transfer. (es-incibe-smishing-bank-callback-2025)
2. **017, INCIBE's free and confidential cybersecurity helpline** (WhatsApp 900 116 117), 8:00–23:00 every day. Advice on what to do and where to report; it doesn't take police reports. (es-incibe-017-faq)
3. **Police report** with the Policía Nacional or Guardia Civil; keep a copy for your bank. (es-incibe-smishing-bank-callback-2025, es-bde-vishing-2020)
4. **If your bank says no:** a written complaint to the bank's customer service first; then the Banco de España. (es-bde-reclamacion)
