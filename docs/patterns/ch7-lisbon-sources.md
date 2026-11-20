# Chapter 7 (Lisbon): sources per likely beat

Companion to GDD §18 (Lisbon summary) until the full chapter spec exists.
- **Owner:** fraud-researcher (T-3.8r, 2026-11-19).
- **Ids:** all defined in `content/sources.yaml`.
- **Briefs:** `rental-offplatform-payment.md` and `qr-sticker-parking.md`.

**Why this file exists:** as for Paris. Ids naming real bodies or platforms stay in `docs/patterns/`; the GDD points here.

**Rules for writers:**
- Use the fictional rental platform (ux-artist to register it in `brands.yaml`) and a fictional parking app and parking brand.
- Kettle is the messenger and Larchwick the bank.
- Fake pages are non-functional `SimulatedForm`s (Red Line 2); every host ends in `.example`; QR codes resolve to `/qr/<id>` only (Red Line 3).
- No ATM, street or in-person tricks (Red Line 8).
- Never promise a refund.
- The Portugal figures are news-sourced, so keep them off screen.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Fake listing (student room or holiday let) | Great photos, low price, "many people interested", owner abroad | pt-rtp-gnr-rentals-2026 (news), de-evz-rental-fraud, eu-europol-iocta-2026, pt-dn-psp-cncs-campaign-2025 (news) | Photos are a neutral decoy. Red flags: too cheap + pressure + no viewing. |
| Host moves to Kettle and sends a "secure deposit" link | Chat outside the platform; a link to a look-alike payment page | pt-dn-psp-airbnb-2026 (news), de-evz-rental-fraud, pt-dn-psp-cncs-campaign-2025 (news), eu-esas-ai-scams-factsheet-nl | LO-10 / LO-11: stay on the platform, use `pay_protected`. |
| Host asks for a bank transfer instead | A typed IBAN in the Larchwick app | pt-rtp-gnr-rentals-2026 (news), eu-ec-ipr-vop-2025 | Portugal is in the euro area, so the payee check runs. GNR: check the holder matches the name. A match proves only whose account it is (P3). |
| Platform-login phishing email | "Your booking is at risk, log in to confirm" with a link; owner part of the address wrong | de-evz-rental-fraud, nl-nltimes-booking-phishing-2026 (news), pt-bdp-ficaadica-2023 | LO-02 / LO-05: open the app yourself. |
| "Message from your accommodation" asking for an extra payment | After a real booking, a message asks to pay again via a link | nl-nltimes-booking-phishing-2026 (news) | Optional. NL evidence only (news). |
| Parking-meter QR sticker | A "pay by phone" sticker over the meter's code; the QR destination is a look-alike address | lu-vdl-parking-qr, ie-ncsc-qr-guide, pt-portugalpost-gnr-quishing-2026 (news), pt-deco-qrishing-2024, be-safeonweb-qr-chargers, eu-epc-threats-2025 | The lesson is the destination (LO-02). The sticker is a supporting clue. |
| Genuine twins | A real listing with all messages and payment inside the platform app; the fictional official parking app opened from the home screen | rental-offplatform-payment §7, qr-sticker-parking §6 | |
| Fall → damage control | Bank now (card block, chargeback question); change the platform password + 2FA; report the listing in the platform; police | pt-bdp-ficaadica-2023, de-evz-rental-fraud, pt-dn-psp-cncs-campaign-2025 (news) | Harmful: "pay the 'refundable' second deposit", "keep chatting to the host on Kettle", "wait and see". |

## Portugal help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** on the number on your card or in its app; ask it to cancel your access details if you typed them. (pt-bdp-ficaadica-2023)
2. **Report to the police: PSP, GNR or PJ.** (pt-bdp-ficaadica-2023)
   - The online complaint portal (Queixa Eletrónica) was not verified for fraud reports, so it is not listed (pt-deco-queixa-eletronica-2025).
3. **Report the listing or host to the platform** where you found it. (de-evz-rental-fraud)
4. **Bought from a business in another EU country?** ECC-Net, free advice. (eu-eccnet-about)
5. **Under 18?** Linha de Apoio à Criança **116 111**, free, 24 hours (pt-gov-emergency-contacts-2026).
   - **Need to talk?** SNS 24 psychological counselling **808 24 24 24**, in Portuguese and English. Label: "Normal call rate." (G3, 2026-11-20: gov.pt emergency guide, landline rate; was "Call costs may apply.") The official page gives no cost or hours (pt-gov-sns24-psych-2022).
6. **Crisis row, last and on its own:** "Thinking about ending your life, or worried about someone?" Body: "1411 is answered by psychologists and mental-health nurses. In danger now? Call 112." Number, service and staffing from the government page (pt-gov-1411-2025). G3 (2026-11-20): "free" and "day and night" rest only on the consumer body (pt-deco-1411-2025), so they were dropped; re-check before G4 (G3_SOURCES_CHECK §4 item 1). Never shown as the support line; the wording goes to the G3 human review.
