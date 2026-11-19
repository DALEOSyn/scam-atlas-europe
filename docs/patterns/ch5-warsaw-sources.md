# Chapter 5 (Warsaw): sources per likely beat

Companion to GDD §18 (Warsaw summary) until the full chapter spec exists. Owner: fraud-researcher (T-3.6r, 2026-11-19). All ids are defined in `content/sources.yaml`. Briefs: `marketplace-collect-payment-link.md`, `hijacked-friend-payment-code.md` (reuses `messenger-account-takeover-code.md` for how the friend's account is taken over).

**Why this file exists.** As for Paris: ids naming real bodies stay in `docs/patterns/`; the GDD points here.

**Rules for writers:** Swaploft is the marketplace, Kettle the messenger, Larchwick the bank; the payment code is a "6-digit instant payment code" in the Larchwick app (no real payment brand, marketplace, courier or locker brand; Red Line 1). Fake pages are non-functional `SimulatedForm`s (Red Line 2). Never promise a refund.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Selling on Swaploft: a "buyer" asks to move to Kettle | Friendly buyer, quick deal, "let's continue on Kettle" | pl-nask-okazja-czy-pulapka-2025, pl-cert-monthly-2025-12, pl-cert-monthly-2026-01, eu-esas-ai-scams-factsheet-nl | Red flag: off the platform. |
| "I've paid, collect your money here" link (GDD: "safe delivery") | Page styled as Swaploft or a courier with a card or bank-login panel "to receive the payment" | pl-cert-monthly-2025-12, pl-cert-monthly-2026-01, pl-cert-monthly-2026-03, pl-nask-okazja-czy-pulapka-2025 | Red flags: receiving money needs card/login; owner part of the address. "Safe delivery" is the game's label; the sources say "withdraw the funds". |
| Genuine twin: a real Swaploft sale | The order and label shown inside the Swaploft app the player opens; payout to the saved account | pl-nask-okazja-czy-pulapka-2025 (keep payments on the platform) | Design inference; no source describes a specific platform's genuine flow. |
| Hijacked friend asks for a payment code | A friend's real Kettle account with history: "can you send me a code from your bank app? I'll pay you back" | pl-policja-psp-na-znajomego, pl-nask-metoda-na-2020, pl-cert-monthly-2026-07, pl-uknf-seniors-payments-2025 | Red flag: any code request. 2026 official sources say "loan requests"/"votes"; the code detail is from the police-hosted warning (undated) and NASK 2020. |
| Larchwick app confirmation after a code | Amount and a shop-like recipient | pl-policja-psp-na-znajomego | "Always check the transaction details before confirming." |
| Habit: call the friend on their saved number | | pl-policja-psp-na-znajomego, pl-blik-podszywacze-2026 (supporting) | |
| Takeover pre-scene (optional): "vote for my cousin" or a code SMS | | pl-cert-vote-takeover-2026, messenger-account-takeover-code sources | Already used in ch0–1 as `messenger-account-takeover-code`; use sparingly. |
| Mateus falls → player-guided damage control | Card typed on a payout page, or code sent and confirmed | Marketplace: pl-nask-okazja-czy-pulapka-2025, pl-uknf-seniors-payments-2025, pl-cert-monthly-2025-12, pl-cert-monthly-2026-07. Code: pl-uknf-seniors-payments-2025, pl-nask-metoda-na-2020, pl-cert-vote-takeover-2026 | Steps: bank now on the card's number; block card; change bank password if typed; tell the friend another way; keep chats; report in the app, to incydent.cert.pl / 8080 (SMS), and the police. "Call your bank without shame" (UKNF) sets the tone. |

## Poland help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** on the number on your card or in its app; block the card if you typed its details. (pl-nask-okazja-czy-pulapka-2025, pl-uknf-seniors-payments-2025)
2. **CERT Polska:** report a fake page at incydent.cert.pl; forward a suspicious SMS free to **8080**. (pl-cert-monthly-2025-12, pl-cert-monthly-2026-07, pl-nask-okazja-czy-pulapka-2025)
3. **Police report** at a police station. (pl-nask-okazja-czy-pulapka-2025, pl-uknf-seniors-payments-2025)
4. **Report the account or buyer** with the app's own report button. (pl-nask-okazja-czy-pulapka-2025, pl-blik-podszywacze-2026)
