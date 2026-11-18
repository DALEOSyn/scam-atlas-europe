# Learning objectives — Scam Atlas: Europe

Owner: `game-designer` · Status: v3 for G1 · Last update: 2026-11-18

Every mechanic, scenario and reward must point at one or more LO ids below (see GDD §13). Each objective describes a behaviour the game can **observe**: an action `kind`, a red flag the player tags, or the steps they choose in damage control.

## Measurement
- **Demonstrated:** in a scenario, the player meets the "Evidence" condition (action kinds are listed in `content/balance.yaml → action_kinds`).
- **Mastered:** demonstrated in at least 2 scenarios, at least one of them at difficulty 3 or higher. The habit card turns gold. Stored in `localStorage` only.
- LOs belong to **patterns**, not cities. Chapters list their patterns in `content/chapters/<city>.yaml`, so when `fraud-researcher` changes the map, the LOs follow. The "Chapters" column shows the current map (PLAN.md plus the research conclusions of 2026-11-18).

## Objectives

| ID | Objective (observable behaviour) | Evidence in game | Habit card | Chapters |
|---|---|---|---|---|
| LO-01 | Checks the real sender (address or number behind the display name) before acting, and knows that a logo or familiar sender name proves nothing: spoofs copy logos perfectly and can land inside genuine threads. | Checks `sender.detail` before the decisive action, and tags it when it is a red flag. | *Who really sent this?* | 0, 1, 2, 4 |
| LO-02 | Checks where a link or QR code really goes and spots a look-alike destination before opening it. Treats the padlock as necessary but never as proof. | Tags a look-alike `link` or `qr.destination`. On fraud, does not pick `open_link` or `scan_qr_and_open`. | *Read the link before you tap* | 0, 1, 5, 7, 9 |
| LO-03 | Reaches a service by opening the official app or typing the known address, not via a link in a message. | `verify_in_app` | *Open it yourself* | 0, 1, 4, 5, 7 |
| LO-04 | Recognises pressure (urgency, authority, fear, greed, helpfulness, affection, secrecy) and slows down before acting. | Uses `pause` before the decisive action while a timer or pusher is active, or while stress is Tense or higher (so Calm mode can earn it too). Unscored; it counts only for this LO. | *Pressure is the tell* | all; core in 0, 4, 6 |
| LO-05 | Never enters passwords, card data or one-time codes via an unsolicited message, and never passes a code to anyone. | On fraud, does not pick `enter_details` / `share_code`. | *Codes are only for you* | 0, 1, 4, 5, 9 |
| LO-06 | Verifies a change of payment details or an "urgent" transfer through a known channel or a second person before paying. Reads the bank's payee-name check, and knows that a matching name does not prove the request is genuine. | `call_back_known` / `ask_someone` on payment-change scenarios, including one where the payee name *matches*. | *Verify the change, not the email* | 2, 3 |
| LO-07 | Confirms a friend's or relative's identity on the old number before sending money to a "new number" or an unusual request. | `call_back_known` on new-number and hacked-friend scenarios. | *Call the number you already know* | 2, 5, 6 |
| LO-08 | Ends an unsolicited call from a "bank", "police" or official and calls back on an independently found number. Never moves money "to safety". | `hang_up` then `call_back_known` (scores as verify). | *Hang up, call back* | 1 (boss), 4, 6 |
| LO-09 | Never approves a sign-in, e-ID signature or QR login they did not start, even when a caller talks them through it. Approves the ones they did start. | `deny_prompt` on fraud. `proceed` on the genuine twin (a prompt the player started is always `proceed`). | *Only approve what you started* | 9 |
| LO-10 | Keeps a marketplace deal on the platform and refuses off-platform payment or "safe delivery" links. | `check_with_platform` or dismiss instead of `open_link` / `enter_details`. | *Stay on the platform* | 5 |
| LO-11 | Checks a rental, shop or offer through independent sources before paying, and uses a payment method with buyer protection. | `check_official_list` on fraud. `pay_protected` (3 stars) rather than `pay_unprotected` (1 star) on genuine offers. | *Check before you pay* | 7 |
| LO-12 | Turns down "easy money": jobs that make you pay in first (task scams) or ask to let money pass through your account (money mule). If already involved, stops and tells a trusted adult or the bank. | Dismisses or reports the offer, or `ask_someone`. In the Noor scenario, advises her to stop and talk to an adult or her bank. | *Easy money costs you* | 2, 10 |
| LO-13 | Checks an investment offer against the regulator's warning list, and rejects guaranteed returns, celebrity endorsements and fee-charging "recovery" services. | `check_official_list`; dismisses or reports recovery offers. | *If it's guaranteed, it's not* | 8, 10 |
| LO-14 | Spots friendship-based manipulation (moves chat off-platform, asks for secrecy, cannot be verified, steers to money) and tells a trusted adult. | `verify_identity`, `ask_someone` or `report` on arc beats. Declines money requests. | *A real friend never needs your money* | arc 1–10 (GDD §10) |
| LO-15 | Refuses remote access or installs requested by unsolicited "support", and contacts support through the official channel. | Does not pick `install_or_remote`; `verify_in_app` / `call_back_known`. | *Nobody needs your screen* | 9, 10 |
| LO-16 | After a mistake, first stops the damage (the right first step depends on the scam: block the card, or change the stolen password), then secures, reports and warns. Never pays to "get money back". | Damage-control points ≥ 6 **and** the first pick has category `stop` *for that scenario*. | *Stop the damage first* | all |
| LO-17 | Handles genuine messages normally without reporting them, and saves extra checks for messages that ask for money, data, codes or approval. | `proceed` on genuine messages; no `report` on genuine messages. Gold stamp: no extra checks on harmless messages outside the chapter's focus. | *Calm, not paranoid* | all |
| LO-18 | Asks a trusted person before acting on an unusual request, takes good advice, and acts as the trusted person for others (including a family code word). | `ask_someone`; completes the Teo and Noor trusted-person scenarios. | *Ask someone* | 0, 1, 3, 6, 10 |

## Rules that protect the objectives
- Spelling, grammar and foreign phrasing are **never** red flags. They may only appear as decoys (validator rule `language_never_red_flag`).
- The padlock or `https` is never presented as proof of safety. On fraud pages it is a decoy.
- A logo or familiar sender name is never presented as proof. Spoofs copy logos perfectly and can land inside genuine threads. Standard debrief line (layer 1 or 2): "A logo or familiar name proves nothing. Scammers copy them perfectly, even into a real thread."
- A reassuring detail is never presented as proof. Genuine debriefs explain why it was safe to act, e.g. "It asked for nothing and matched an order you placed."

## Changes in v3
- QR codes merged into LO-02.
- LO-12 now covers task scams and money mules (research: strong 14+ evidence).
- Payee-name check added to LO-06.
- LO-09 reframed to cover callers and QR logins.
- LO-04 is unscored.
- LO-16 stop-step categories are now set per scenario.
