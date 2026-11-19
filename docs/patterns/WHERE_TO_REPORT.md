# "Where to report / get help": draft for the English launch (players across Europe)

**Owner:** fraud-researcher · **Verified / accessed:** 2026-11-18 · **Status:** rework 1 after sceptic FAIL. Re-verify every entry at G3 and before each locale (PLAN risk table).

**Rules applied:**
- Only bodies, numbers and addresses that I read on the body's own site, or in that body's own published document, in this session. Each line carries its source id from `content/sources.research.yaml`.
- Real organisations appear here only as factual references, per Red Line 1. Nothing here may be reused as a scam prop.
- Where a country-specific contact was not verified, the list gives generic advice instead. A missing entry means "not verified yet", not "doesn't exist".

---

## 1. First steps, wherever you are in Europe (generic)
0. **Under 18? Tell a parent, carer or another adult you trust first.** You are not in trouble for asking for help. They can call the bank or the police with you. *(Safeguarding step; no source needed. It reflects the game's 14+ audience. Wording to be checked by sceptic-reviewer and qa-playtester.)*
1. **Money or card details involved? Call your bank or card issuer now.**
   - Use the number on your card or in your banking app, never one from the message.
   - Ask them to block the card or payments and to try to recall the transfer. Speed matters [fr-gendarmerie-fovi], [es-incibe-smishing-bank-callback-2025], [eu-esas-ai-scams-factsheet-nl].
2. **Password entered? Change it** on the real site or app, and everywhere you reused it. Turn on two-factor authentication [fr-cybermalveillance-fiche-hameconnage].
3. **Installed an app or gave someone remote access? Disconnect the device** (airplane mode) and get help before you keep using it for banking [de-vz-paketdienst-sms], [eu-esas-ai-scams-factsheet-nl].
4. **Keep evidence:** screenshots, sender numbers or addresses, links, times, transaction references [fr-cybermalveillance-fiche-hameconnage], [es-incibe-smishing-bank-callback-2025].
5. **Report the account, profile or message in the platform or app itself** (the social network, marketplace, messenger, mail provider). Use its "report" button and, where available, its "report phishing" option [ie-ncsc-phishing-guide], [be-police-romance-2026], [eu-europol-mule-flyer-ie].
6. **Report to the police.** Many countries offer online reporting; otherwise go to a local station.
   - Europol does not take reports from the public. Its page sends you to your country's national reporting site [eu-europol-report-cybercrime].
7. **Warn people** who might get the same message, such as family, friends or your contacts if your account was taken over [pl-nask-metoda-na-2020].
8. **Be wary of anyone offering to get your money back for a fee.** That is a second scam [ie-bpfi-recovery-2024], [eu-esas-ai-scams-factsheet-nl].
9. **It's not your fault, and you're not alone.** Many people never report [nl-fraudehelpdesk-police-pilot]. Reporting helps stop the next attempt.

## 2. EU-wide bodies (verified)
| Body | What it does for you | Checked | Source id |
|---|---|---|---|
| **Europol: "Report cybercrime online"** | Signpost only: redirects to each country's national reporting website; where none exists, go to a local police station | 2026-11-18 | eu-europol-report-cybercrime |
| **European Consumer Centres Network (ECC-Net)** | Free, confidential advice when you bought from a trader in *another* EU country, Norway or Iceland (incl. online shops and travel). Helps with complaints and out-of-court resolution. Not a police body. | 2026-11-18 | eu-eccnet-about |
| **Your national financial regulator's register / warning list** | Check that an investment firm is authorised *before* paying. The EU supervisory authorities also point to the IOSCO I-SCAN list | 2026-11-18 | eu-esas-ai-scams-factsheet-nl |

**Not listed as current (open items):**
- **116 006** (EU-recommended helpline for crime victims). The only official per-country table is FRA data from 2014 [eu-fra-helplines].
- **116 111** (EU harmonised child helpline). The EU's Your Europe page (last checked by the Commission 22 Jun 2026) says the 116 numbers work "in most EU countries (though coverage is not yet EU-wide)" but has no country list [eu-youreurope-116].
  - Child Helpline International (an NGO, not an official body) lists 116 111 operators for DE, IE, NL, PL, PT, ES and SE. It lists none for BE, FR or IT. That page was last modified in 2023 [chi-116111-eu].
  - Recommendation: before G3, verify each country on the national operator's or regulator's own site. Then show 116 111 on the under-18 card as "free and confidential in most EU countries".
- **T-2.5 update (2026-11-18):** 116 111 verified for **Germany only**, from the operator's own 2026 flyer [de-ngk-116111-flyer-2026] and a poster on the federal family ministry's site [de-bmbfsfj-ngk-poster]. It is in `docs/patterns/where-to-report.draft.en.yaml` under DE (the help-screen draft, parked in docs/ until the engineer adds a linter exemption and moves it to `content/help/`). Every other country still gets the fallback line, which gives no number.
- The screen can already say "In most EU countries, 116 111 is a free helpline for children and young people", citing [eu-youreurope-116], **if** sceptic-reviewer accepts EU-level wording without a per-country list.

## 3. Country entries verified this session (for the "Learn more" screen)
Shown as found. Formats follow the source. Phone numbers are real and must appear **only** on this screen (Red Line 3 applies to scenario content, not to factual help screens; sceptic-reviewer to confirm).

| Country | Contact | What for | Checked | Source id |
|---|---|---|---|---|
| **Belgium** | Forward suspicious messages to **suspicious@safeonweb.be** | Reporting phishing messages/links; Safeonweb analyses the links | 2026-11-18 | be-ccb-safeonweb-2025 |
| Belgium | **Card Stop 078 170 170** | Block cards if you shared bank details or money is leaving your account | 2026-11-18 | be-safeonweb-qr-chargers, be-police-romance-2026 |
| Belgium | Local police | Complaint after fraud | 2026-11-18 | be-police-romance-2026 |
| **France** | **Info Escroqueries 0 805 805 817** (free) | Advice after a scam | 2026-11-18 | fr-cybermalveillance-fiche-hameconnage |
| France | Signal Spam (signal-spam.fr); Phishing Initiative (phishinginitiative.fr) | Report phishing messages / phishing sites | 2026-11-18 | fr-cybermalveillance-fiche-hameconnage |
| France | Police, gendarmerie or public prosecutor | Complaint | 2026-11-18 | fr-cybermalveillance-fiche-hameconnage |
| **Germany** | Police: online report or any station | Complaint (bring the phone if malware was installed) | 2026-11-18 | de-vz-paketdienst-sms, de-vzn-smishing |
| Germany | Bundesnetzagentur complaint form (via bundesnetzagentur.de/rufnummernmissbrauch) | Report SMS spam / number misuse | 2026-11-18 | de-bnetza-zoll-sms-2023 |
| Germany | Customs Zentrale Auskunft (find contact on zoll.de yourself) | Check whether a "customs" demand is real | 2026-11-18 | de-zoll-phishing |
| **Ireland** | Local Garda station | Report phishing, smishing, vishing and fraud | 2026-11-18 | ie-ncsc-phishing-guide, ie-garda-investment-2025 |
| Ireland | Garda Confidential Line **1800 666 111** | Given by Gardaí as a contact for suspected investment fraud | 2026-11-18 | ie-garda-investment-2025 |
| Ireland | Central Bank Registers (registers.centralbank.ie) | Check that a financial firm is authorised | 2026-11-18 | ie-garda-investment-2025, ie-fraudsmart-investment-2025 |
| **Italy** | **112** | Suspicious caller or visitor claiming to be police, or a relative "in trouble" | 2026-11-18 | it-carabinieri-contro-truffe |
| **Netherlands** | Fraudehelpdesk (national reporting point for fraud) | Report fraud and get advice; can refer you to the police for a report | 2026-11-18 | nl-fraudehelpdesk-police-pilot |
| Netherlands | Police report (*aangifte*) | Complaint; the police publish a preparation form for friend-in-need fraud | 2026-11-18 | nl-politie-hulpvraagfraude-2025 |
| **Poland** | Forward suspicious SMS free to **8080** | Report smishing | 2026-11-19 | pl-cert-monthly-2025-12, pl-cert-monthly-2026-07 |
| Poland | **incydent.cert.pl** (sites: incydent.cert.pl/phishing) | Report phishing sites (incl. fake "collect payment" pages) and incidents to CERT Polska | 2026-11-19 | pl-cert-monthly-2025-12, pl-cert-monthly-2026-07, pl-nask-okazja-czy-pulapka-2025 |
| Poland | Police report at a station (no online route verified) | Complaint | 2026-11-19 | pl-nask-okazja-czy-pulapka-2025, pl-uknf-seniors-payments-2025 |
| **Portugal** | Police (PSP / GNR) | Complaint; no specific online channel verified this session | 2026-11-18 | pt-gnr-phishing, pt-dn-psp-airbnb-2026 |
| **Spain** | **017** (INCIBE "Tu Ayuda en Ciberseguridad", free, confidential; WhatsApp 900 116 117; 8:00–23:00 daily) | Advice after a scam and where to report; **not** a police report. INCIBE also takes fraud reports through its own channels (report page not opened, so no URL) | 2026-11-19 | es-incibe-017-faq, es-incibe-smishing-bank-callback-2025 |
| Spain | Police report (*denuncia*) with the Policía Nacional or Guardia Civil; keep a copy for your bank | Complaint | 2026-11-19 | es-incibe-smishing-bank-callback-2025, es-bde-vishing-2020 |
| Spain | Banco de España complaints service, after a written complaint to your bank (15 business days for payment services) | Complaint about how the bank handled it | 2026-11-19 | es-bde-reclamacion |
| **Sweden** | **112** if the crime is happening now; **114 14** otherwise | Police | 2026-11-18 | se-polisen-vishing-2026, se-polisen-campaign-2026 |

**Removed in rework (finding 9): phishing@ncsc.gov.ie.**
- It appears in only one NCSC Ireland document, the QR guide (Jan 2025), and only for "if you suspect a QR code is fake" [ie-ncsc-qr-guide].
- NCSC Ireland's general phishing guide [ie-ncsc-phishing-guide] and two other NCSC advisories checked today [ie-ncsc-seasonal-advisory], [ie-ncsc-mobile-scam-2024] send the public to the **local Garda station** and give no public phishing inbox.
- So it is not presented as a general reporting address. If it is ever used, the label must read "suspected fake QR codes only (NCSC Ireland QR guide, Jan 2025)".

**Not yet verified (generic advice only):**
- every other EU/EEA country;
- the Dutch Fraudehelpdesk phone number and the exact report URL;
- German Länder online-police portals;
- Portuguese online complaint portal;
- Banco de Portugal pages (unreachable this session);
- INCIBE's incident-report email address.

## 4. Open items before G3
- Safeonweb's Dec 2025 article mentions both suspicious@ and verdacht@ addresses. The English address is used above; confirm language variants.
- Decide with sceptic-reviewer whether real phone numbers are allowed on the help screen. Recommendation: yes, with the per-row "checked" date shown and a link to the official page.
- Verify 116 111 and 116 006 per launch-relevant country on official sites (see §2).
- Re-check all numbers within 30 days of G4 release.
