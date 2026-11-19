# Chapter 3 (Paris): sources per scenario

Companion to GDD §23. Owner: game-designer (lists); verification: fraud-researcher. Created in rework 1 (2026-11-19).

**Why this file exists.** Several source ids contain names on `content/redline-denylist.txt` (for example the ids for the Gendarmerie FOVI page and the Europol leaflets). The docs brand test rejects those outside `docs/patterns/`, so GDD §23 cites no source ids inline and points here. All ids are defined in `content/sources.yaml`. Briefs: `ceo-fraud-bec.md`, `payment-detail-change.md`.

## Per scenario
| Scenario | Sources | Notes |
|---|---|---|
| 3-1 `paris-01-rent-close-match` (genuine) | fr-inc-vop-2025, eu-eurlex-ipr-2024-886, eu-epc-vop-scheme, eu-ecb-ipr, eu-ec-ipr-vop-2025 | Close match shows the holder name. The trading-name case is the researcher's example, not how the check always behaves. Device tip ("euro countries, euro transfers"): eu-ec-ipr-vop-2025, eu-ecb-ipr. |
| 3-2 `paris-02-ceo-lookalike` | fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi, eu-europol-ceo-bec-leaflet, fr-inc-vop-2025, eu-epc-vop-scheme | "Skip the sign-off" and secrecy: Europol leaflet and FOVI fiche; "couldn't check": INC, EPC scheme. |
| 3-3 `paris-03-ines-plumber-rib` (drill) | fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-inc-iban-rib-fraudes-2025, eu-europol-ceo-bec-leaflet | Creditor list (landlord, tradesperson, energy or phone company): faux-RIB fiche, FBF. "Report even if nothing was paid": Europol leaflet. |
| 3-4 `paris-04-supplier-new-bank` (genuine) | fr-cybermalveillance-fiche-faux-rib, fr-bdf-fraude-moyens-paiement, fr-fbf-cles-faux-rib-2025, fr-cybermalveillance-fiche-fovi, eu-epc-vop-scheme | "A match must not lower your vigilance": Banque de France. |
| 3-5 `paris-05-salary-change` | fr-cybermalveillance-fiche-fovi, fr-cybermalveillance-fiche-faux-rib | Salary-account change variant. |
| 3-6 `paris-06-solene-urgent` (genuine) | eu-europol-ceo-bec-leaflet, fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi | Genuine-twin notes (ceo-fraud-bec §7). |
| 3-7 `paris-07-agency-new-account` | fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-inc-iban-rib-fraudes-2025, fr-inc-vop-2025, eu-eurlex-ipr-2024-886, fr-bdf-fraude-moyens-paiement, eu-epc-threats-2025, eu-ec-ipr-vop-2025, eu-ecb-ipr | Pusher ("the name check may say it doesn't match, just confirm"): EPC coaching tactic plus INC "don't confirm after a no-match". The bank "may not be responsible" / "may not have to refund you": INC, regulation. |
| 3-8 `paris-08-supplier-thread-match` | fr-bdf-fraude-moyens-paiement, eu-epc-vop-scheme, fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-cybermalveillance-fiche-fovi, eu-europol-ceo-bec-leaflet; supporting only: eu-epc-threats-2025, eu-esas-ai-scams-factsheet-nl, eu-ecb-ipr | The red flag "the name check is all the proof you need, no need to call" rests on the vigilance sources (Banque de France, EPC scheme) and the known-number callback sources. The EPC coaching tactic is supporting context, not the label. Complaint step: fr-cybermalveillance-fiche-fovi, fr-gendarmerie-fovi. |
| 3-9 `paris-09-boss-pont` | fr-gendarmerie-fovi, fr-cybermalveillance-fiche-fovi, eu-europol-ceo-bec-leaflet, fr-dgsi-flash-117-2025, eu-epc-threats-2025, de-bsi-deepfakes, fr-bdf-fraude-moyens-paiement, eu-epc-vop-scheme, eu-europol-phishing-leaflet, fr-inc-iban-rib-fraudes-2025, eu-esas-ai-scams-factsheet-nl | Beat 2 ("call back on a number you already hold, not one the caller gives"): eu-europol-phishing-leaflet, fr-inc-iban-rib-fraudes-2025. Timing (evenings, holidays, long weekends): fr-gendarmerie-fovi. Video call: DGSI case (modelled closely); BSI is a dated caveat only. "At home" family face or voice line: eu-esas-ai-scams-factsheet-nl, eu-epc-threats-2025. |

## Device moment and debrief material
| Item | Sources |
|---|---|
| Payee-name check screen (§23.5): four results, holder only on close match, can still pay, liability, wording left to banks | eu-eurlex-ipr-2024-886, eu-ecb-ipr, eu-epc-vop-scheme, eu-epc-vop-faq, fr-inc-vop-2025, fr-bdf-fraude-moyens-paiement, eu-ec-ipr-vop-2025 |
| France "Where to report" card (§23.9) | fr-cybermalveillance-fiche-faux-rib, fr-cybermalveillance-fiche-fovi, fr-gendarmerie-fovi, fr-bdf-fraude-moyens-paiement, fr-cybermalveillance-17cyber-2024, fr-justice-thesee-messagerie-2025, fr-cybermalveillance-fiche-hameconnage, eu-europol-ceo-bec-leaflet, eu-esas-ai-scams-factsheet-nl |
| Recovery steps (recall, warn the creditor, keep evidence, complaint, secure the mailbox) | fr-cybermalveillance-fiche-faux-rib, fr-cybermalveillance-fiche-fovi, fr-inc-iban-rib-fraudes-2025, fr-bdf-fraude-moyens-paiement, fr-gendarmerie-fovi |
| Habit card `verify-the-change` | fr-cybermalveillance-fiche-faux-rib, fr-fbf-cles-faux-rib-2025, fr-inc-vop-2025, fr-bdf-fraude-moyens-paiement, fr-gendarmerie-fovi |


## France help card wording (moved from GDD §23.9, producer 2026-11-19)
Only the card entries whose wording names real bodies are kept here (numbering follows GDD §23.9); real bodies are named only here and on the help screen (Red Line 1).
2. **Complaint** with the police or gendarmerie (you can start online), in parallel with the bank; the bank may ask for it. This is the route for workplace cases (3-2, 3-8, the boss).
3. **17Cyber** (17cyber.gouv.fr): "a government service from the police, gendarmerie and Cybermalveillance.gouv.fr. It helps you work out what happened and links you to reporting and complaints. In an emergency, call 17 or 112."
- Recovery step `file_complaint_police`, France help text: "File a complaint with the police or gendarmerie (you can start online)."
