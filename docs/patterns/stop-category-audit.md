# `stop` category audit (T-3.13l)

Owner: fraud-researcher · 2026-11-19 · branch `phase3/balancing-followups` · decides the gold "recovered fall" rule (R24, BALANCE_PASS §1, §9).

**Scope.** Every damage-control step in every outcome with a `recovery:` list in `content/scenarios/**` (78 outcomes: falls in scored scenarios and bosses, the drills home-05, rome-06, warsaw-07 and brussels-05 ×2, and the arc finale's recovery offer), plus the arc damage control in `content/chapters/brussels.yaml`. `content/recovery_steps.yaml` has labels and feedback only; it carries no categories or per-outcome overrides.

**Rule applied.** A step is `stop` when, in that outcome, it is a correct *first* action that cuts off further loss: block or call the bank on a known number after card, account or payment loss (GDD §9: "after card theft, blocking the card ... is `stop`"); change the password / log out unknown devices after a login or messenger takeover; stop paying in an advance-fee loop; `tell_trusted_adult` (R23(3)). Evidence keeping, IT/management notes, regulator or platform reports stay `secure` / `report` / `warn`.

## Changes

| Outcome | Step | Old → new | Reason | Source ids |
|---|---|---|---|---|
| berlin-03 `card_details_stolen` | `call_bank_known_number` | secure → stop | Card details typed on a fake parcel page and unknown payments seen: telling the bank and having the card blocked is the first step; the phone route is the same action as the in-app block. | de-vz-paketdienst-sms, de-bsi-protect-phishing |
| berlin-07 `card_details_stolen` | `call_bank_known_number` | secure → stop | Same, customs-fee variant. | de-vz-paketdienst-sms, de-zoll-phishing |
| berlin-08 `account_and_card_stolen` | `call_bank_known_number` | secure → stop | Card and shop login stolen, card already misused: contact the provider through trusted contact details and block. | de-bsi-protect-phishing, de-vz-paketdienst-sms |
| berlin-09 `fee_paid_by_card` | `call_bank_known_number` | secure → stop | Card details given on the boss's fee page: block via the bank. | de-vz-paketdienst-sms, de-zoll-phishing |
| amsterdam-07 `topped_up` | `call_bank_known_number` | secure → stop | Task-scam top-ups already paid: report to your own bank at once (card-blocking lines run 24/7); the EU police agency's money-mule job-offer flyer (already in the scenario's sources) also says to stop and tell the bank. | nl-veiligbankieren-meld-fraude |
| home-05 `helping_teo` (drill, not a fall) | `call_bank_known_number` | secure → stop | Card typed on a prize page: contact the bank at once. Changed for consistency only; drills never decide a stamp. | es-incibe-prize-2021 |

After the change `call_bank_known_number` is `stop` in all 34 scenario outcomes that offer it, and in the Brussels arc damage control.

## Checked, unchanged (noted for the record)

| Outcome | Step | Category | Why it stays |
|---|---|---|---|
| berlin-08 `account_and_card_stolen` | `change_password` | secure | GDD §9 makes a password change `stop` after credential theft, but here the card is already being misused, so the bank call or block comes first. The shop password is the follow-up. Arguable: a game-designer may still make it `stop`. |
| madrid-08 `login_typed`, brussels-09 `logged_in_phone_off`, warsaw-09 (both falls) | `change_password` | secure | Bank login or e-ID approval taken: only the bank can freeze the session and new payees, so the call or block comes first. A new password does not end a session approved through the e-ID. |
| home-02, home-06 `portal_password_stolen`, lisbon-09 b1 | `change_password` | stop | Credential theft of a work or platform account: GDD §9 rule; de-bsi-protect-phishing. |
| amsterdam-02 `id_photo_sent` | `report_id_copy` | stop | No money moved; reporting the copy to the identity-fraud point is the only act that limits misuse (nl-rvig-cmi-id-copy). Plus `tell_trusted_adult` (stop). |
| paris-05 `pay_details_changed` | `check_pay_details_with_person` | stop | Payroll not yet run; restoring the real details stops the loss. |
| dublin-02 `adviser_keeps_calling` | `block_adviser_number` | stop | No money moved; cutting contact is the stop. |
| home-02 vs paris-05 | `tell_it_team` | report vs secure | Inconsistent, but neither is `stop`, so it cannot change a stamp. Left for scenario-writer. |
| all outcomes | `keep_evidence`, `keep_call_evidence`, `keep_transfer_evidence` | secure | Never a first action. |

All 78 outcomes still have at least one `stop` step, exactly 2 `harmful` steps and at most 6 options (GDD §9). No step labels, feedback or option counts changed.

**Confidence: high** for the six changes: German, Dutch and Spanish consumer, bank and cyber-agency sources all name the bank and card block as the first step after card or payment loss. Verified this session: verbraucherzentrale.de parcel-SMS page, accessed 2026-11-19 ("inform your bank as a precaution"; "if in doubt, have the card blocked"; chargeback via your bank). Medium for the "unchanged" judgement on `change_password` after a bank-login theft; that one is a design call, not a fact.
