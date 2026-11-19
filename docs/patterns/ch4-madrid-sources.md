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

## Per scenario (GDD §24, fact-checked 2026-11-19 against commit 470bc31)
Fixes M-A (feedback for `call_back_caller_number`) and M-B (4-8 login-only, option 1) are assumed applied.

| Scenario | Source ids | Notes |
|---|---|---|
| 4-1 dinner | (none) | Genuine, no fraud claim. |
| 4-2 real card call | es-bde-sms-callerid-spoofing-2022, es-incibe-smishing-bank-callback-2025 | Genuine-twin tells: no request to move money or for codes; you can hang up and call the card's number. |
| 4-3 text in thread → security_line | es-incibe-smishing-bank-callback-2025, es-bde-sms-callerid-spoofing-2022, es-incibe-sms-banks-2022, eu-epc-threats-2025, es-boe-orden-tdf-149-2025, es-boe-cnmc-circular-3-2026, es-cnmc-alias-callout-2026, es-bde-msr2025-fraude | M5 sender-register line: only the GDD wording or weaker, no claim that it works. |
| 4-4 drill (Lucía) | es-incibe-smishing-bank-callback-2025, es-bde-sms-callerid-spoofing-2022 | |
| 4-5 reserve-account call | es-incibe-smishing-bank-callback-2025, es-bde-vishing-2020, ch-ncsc-double-phishing-2026 (supporting), it-carabinieri-21-arresti-2025, pl-cert-fake-consultants, fr-bdf-osmp-2024, eu-eba-ecb-fraud-2025, eu-epc-threats-2025, fr-inc-vop-2025 (supporting), eu-ec-ipr-vop-2025, eu-eurlex-ipr-2024-886, eu-ecb-ipr, es-bde-msr2025-fraude | **The "stay on the line" lever is sourced outside Spain** (ch-ncsc-double-phishing-2026, it-carabinieri-21-arresti-2025, pl-cert-fake-consultants). The Spanish ids support the habit (hang up, call the number on the card). The "Doesn't match" name check is valid for a euro-area (ES) account; caller coaching past a mismatch: eu-epc-threats-2025. |
| 4-6 real code | es-bde-sms-callerid-spoofing-2022 | Genuine: a code the player requested for their own action. |
| 4-7 cancellation code | es-bde-sms-callerid-spoofing-2022, es-bde-vishing-2020, ch-ncsc-double-phishing-2026 (supporting), pl-cert-fake-consultants | "A code to cancel is a code to make a payment." |
| 4-8 card-paused link (older in-thread link chain) | es-incibe-sms-banks-2022 | Login fields only (user ID, password), per M-B option 1; no card or one-time-code fields. Fall stop: `call_bank_known_number`; secure: `change_password`. |
| 4-9 boss | the 4-3 and 4-5 sets; eu-ecb-ipr, eu-epc-threats-2025 (beat 2 "Name matches" reveal: shows whose account, not that the call is real) | Beat 3 ("move your balance to the security reserve tonight") is a **design combination** of brief §2 elements (an SMS with a number to call, then a guided transfer), not a single sourced case. |
| Recovery (all falls) | es-incibe-smishing-bank-callback-2025 (`call_bank_stop_payment`, `keep_call_evidence`, `report_police_copy_to_bank`), es-bde-vishing-2020, es-incibe-017-faq, es-bde-reclamacion, es-bde-msr2025-fraude, eu-europol-phishing-leaflet and es-bde-sms-callerid-spoofing-2022 (harmful `call_back_caller_number`: caller ID can be faked) | Refunds "may", never "will". Feedback for `call_back_caller_number` per M-A: the number can be faked, so you can't tell whose line you'd reach. |

## Spain help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** on the number on your card or in its app; ask it to try to stop or recall the transfer. (es-incibe-smishing-bank-callback-2025)
2. **017, INCIBE's free and confidential cybersecurity helpline** (WhatsApp 900 116 117), 8:00–23:00 every day. Advice on what to do and where to report; it doesn't take police reports. (es-incibe-017-faq)
3. **Police report** with the Policía Nacional or Guardia Civil; keep a copy for your bank. (es-incibe-smishing-bank-callback-2025, es-bde-vishing-2020)
4. **If your bank says no:** a written complaint to the bank's customer service first; then the Banco de España. (es-bde-reclamacion)
