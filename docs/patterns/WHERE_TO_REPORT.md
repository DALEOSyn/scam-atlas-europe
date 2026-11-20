# "Where to report / get help": draft for the English launch (players across Europe)

**Owner:** fraud-researcher · **Verified / accessed:** 2026-11-18 · **Status:** rework 1 after sceptic FAIL. Re-verify every entry at G3 and before each locale (PLAN risk table).

**Rules applied:**
- Only bodies, numbers and addresses that I read on the body's own site, or in that body's own published document, in this session. Each line carries its source id from `content/sources.research.yaml`.
- Real organisations appear here only as factual references, per Red Line 1. Nothing here may be reused as a scam prop.
- Where a country-specific contact was not verified, the list gives generic advice instead. A missing entry means "not verified yet", not "doesn't exist".

---

## 1. First steps, wherever you are in Europe (generic)
0. **Under 18? Tell a parent, carer or another adult you trust first.** Getting help early is the right move. Asking for help is never the wrong thing to do. They can call the bank or the police with you. *(Safeguarding step; no source needed. It reflects the game's 14+ audience. Wording to be checked by sceptic-reviewer and qa-playtester.)*
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
| **Spain** | **017** (INCIBE "Tu Ayuda en Ciberseguridad", free, confidential; WhatsApp 900 116 117; 8:00–23:00 daily) | Advice after a scam and where to report; **not** a police report. INCIBE's 2025 warning also asks people to report these scams to INCIBE through its own channels [es-incibe-smishing-bank-callback-2025] (report page not opened, so no URL) | 2026-11-19 | es-incibe-017-faq, es-incibe-smishing-bank-callback-2025 |
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

## 3b. T-3.8r verified help list (2026-11-19): every chapter country
For each chapter country there is now a checked entry for the reporting route, police, bank step, emotional-support line and child line, except where the table marks "fallback" or a caveat. All entries are in `docs/patterns/where-to-report.draft.en.yaml`, with a coverage block in §4b. Everything below was read on the body's own site or an official page on 2026-11-19, unless a row says otherwise.

| Country | Role | Contact | Notes | Source id |
|---|---|---|---|---|
| **Belgium** | bank | **Card Stop / Fraudstop 078 170 170**, 24/7, "Call costs may apply." | Since 22 Jun 2026 the same number also blocks banking apps via your bank. One local police page still shows the old 070 344 344: never use it | be-febelfin-fraudstop-2026, be-brussels-hulpdiensten |
| Belgium | support | Tele-Onthaal **106** (Dutch, "Call costs may apply."); Télé-Accueil **107** (French, "Call costs may apply.") | 106: no cost/hours on the regional page; 107 "free, 24/7" not re-confirmed at G3 (police.be down), dropped until an official page confirms it | be-police-autres-numeros, be-brussels-hulpdiensten |
| Belgium | child | Awel **102** (Dutch, free, 16:00–22:00, not Sundays or public holidays); Écoute-Enfants **103** (French, free, 10:00–24:00) | No 116 111 found | be-police-ecoute-enfants, be-brussels-hulpdiensten, be-vlaanderen-awel |
| **Germany** | police / report | Online report (Onlinewache) in most states; otherwise any station | 13 Länder online; BY, SL, TH contact form. No Länder URLs shown | de-hilfeinfo-onlinewache |
| Germany | bank | **116 116** to block cards (+49 116 116), then your bank | Number from the federal justice ministry page; operator site not opened | de-hilfeinfo-onlinewache |
| Germany | support | TelefonSeelsorge **116 123**, free, 24/7 | | de-gesundbund-krisen-2026 |
| **France** | report | **17Cyber** (17cyber.gouv.fr): government online assistance | Describe as the live site does (no 24/7 or chat claim) | fr-cybermalveillance-17cyber-2024 |
| France | bank | Your bank at once; ask for a fraud recall | | fr-bdf-fraude-moyens-paiement |
| France | support | **116 006** victims' line (free, 9:00–19:00); SOS Amitié **09 72 39 40 50** (free, 24/7) | | fr-santefr-lignes-ecoute |
| France | advice | Info Escroqueries **0 805 805 817** (free advice) | Now role `advice`, not report | fr-cybermalveillance-fiche-hameconnage |
| France | child | Fil Santé Jeunes **0 800 235 236** (ages 12–25, free, anonymous, 9:00–23:00) | No 116 111 found | fr-santefr-lignes-ecoute |
| France | harassment card only | **3018** (online harassment or violence, free, 9:00–23:00) | Sextortion / online-harassment help card only, not the scam help screen | fr-solidarites-numeros-2025, fr-santefr-lignes-ecoute |
| France | crisis | **3114**, free, 24/7 | Added for consistency; drop if crisis rows are wanted only for ES/SE/PT | fr-santefr-lignes-ecoute |
| **Ireland** | bank | Your bank, after clicking, giving details or paying | | ie-ncsc-phishing-guide, ie-ccpc-investment-scams, ie-ccpc-spot-a-scam-2026 |
| Ireland | police (T-3.10r) | Garda Confidential Line **1800 666 111**, scope "suspected investment fraud" (re-opened 2026-11-19); no "free" claim | Now listed in the help YAML as `ie-garda-confidential` | ie-garda-investment-2025 |
| Ireland | report (T-3.10r) | Central Bank of Ireland: report an unauthorised firm (centralbank.ie page; the form is on a third-party host and is not linked); phone **0818 681 681** / **+353 1 224 5800**, "Call costs may apply." | Not the police; report to the Gardaí too | ie-cbi-report-unauthorised, ie-cbi-avoiding-scams |
| Ireland | support | Samaritans **116 123**, freephone, 24/7 | | ie-hse-urgent-help |
| Ireland | child | Childline **1800 66 66 66**, freephone | Text HELLO to 50808 (free, 24/7) also listed | ie-hse-urgent-help |
| **Italy** | report | Polizia Postale e delle comunicazioni | Named by the central bank; police site blocked automated access, so **no URL** | it-bdi-truffe-cyber |
| Italy | bank | Your bank through official channels; then *reclamo*; then Arbitro Bancario Finanziario | | it-bdi-truffe-cyber |
| Italy | support | Telefono Amico Italia **02 2327 2327**: "Someone to talk to when you're feeling low or shaken." / "Every day, 24 hours. Normal call cost." | Operator's site only (NGO) | it-telefonoamico-home |
| Italy | child | **114** Emergenza Infanzia, free, 24 h | Government line; no 116 111 page found | it-minori-114-2024 |
| **Netherlands** | bank | Your own bank, at once | | nl-veiligbankieren-meld-fraude |
| Netherlands | support | De Luisterlijn **088 0767 000**, "Day and night. Normal call rate." | Municipal notice + NJI | nl-kerkrade-luisterlijn, nl-nji-bellen-chatten |
| Netherlands | child | De Kindertelefoon **0800 0432**, free (ages 8–18, 11:00–21:00) | 116 111 not stated | nl-rijksoverheid-kindertelefoon, nl-nji-bellen-chatten |
| **Poland** | police | Police: report suspected fraud | Merge with T-3.6r's pl-police | pl-policja-oszukany |
| Poland | bank | Your bank straight away | | pl-policja-oszukany, pl-cert-fake-consultants |
| Poland | support / child | **116 123** adults; **116 111** children and young people; both free, anonymous, 24/7 | | pl-gov-cyfryzacja-116-2025 |
| **Portugal** | police / report | PSP, GNR or PJ | Online portal and CNCS form **not verified** | pt-bdp-ficaadica-2023 |
| Portugal | bank | Your bank immediately; cancel access details if typed | | pt-bdp-ficaadica-2023 |
| Portugal | support | SNS 24 psychological counselling **808 24 24 24** (PT/EN), "Normal call rate." | Cost: gov.pt emergency guide (landline rate, G3 2026-11-20); hours, menu option not stated | pt-gov-sns24-psych-2022 |
| Portugal | child | **116 111** Linha de Apoio à Criança, free, 24 h | | pt-gov-emergency-contacts-2026 |
| Portugal | crisis | **1411**, free, day and night | Number and service from the government page; "free" and "24 h" from the consumer body only: confirm on an SNS 24 page at G3 | pt-gov-1411-2025, pt-deco-1411-2025 |
| **Spain** | advice | **017** (INCIBE, free advice, 8:00–23:00) | Now role `advice`, not report: "not a line for reports" | es-incibe-017-faq |
| Spain | bank | Your bank now; ask to stop or recall | T-3.6r adds the complaint route | es-incibe-smishing-bank-callback-2025 |
| Spain | support | **Fallback** (no number) | No general listening line verified on an official page | — |
| Spain | crisis | **024**, free, confidential, 24/7 | Crisis row only, never support | es-sanidad-024 |
| Spain | child | **116 111** (ANAR), free, 24/7 | Regional government page + operator | es-caib-116111, es-anar-116111-carta |
| **Sweden** | police / report | 112 now; 114 14 otherwise; some online reports with a Swedish ID number | | se-polisen-bedragerier-anmalan |
| Sweden | bank | Your bank straight away to stop payments or block the card; banks have a 24/7 number (T-3.10r, replaces the fallback) | Police vishing page, reviewed 2026-08-19 | se-polisen-telefonbedrageri, se-konsumentverket-investment-fraud |
| Sweden | support | Jourhavande medmänniska **08-702 16 80**, "Every night, 21:00–06:00. Call costs may apply." | Cost not stated on either page | se-ki-nasp-hjalplinjer, se-krisinformation-phone-numbers |
| Sweden | crisis | Mind Självmordslinjen **90101**, day and night | Crisis row only, never support; cost not stated | se-ki-nasp-hjalplinjer, se-krisinformation-phone-numbers |
| Sweden | child | BRIS **116 111**, "Free, day and night." | Free and always open per the operator page (se-bris-prata-med-oss, G3 2026-11-20); the EU 116 decision alone does not oblige free calls | se-ki-nasp-hjalplinjer, se-krisinformation-phone-numbers, eu-dec-2007-116 |
| **EU / home** | all | Europol signpost; ECC-Net; generic fallbacks for police, bank, support (no number) and child line (no number); no crisis row | | eu-europol-report-cybercrime, eu-eccnet-about, eu-esas-ai-scams-factsheet-nl |

**Round 2 rulings applied (sceptic and learning-psychologist, 2026-11-19):**
- A suicide or crisis line is never the "support" line. It has role `crisis` and is shown as its own calm final row. Title for every country: "Thinking about ending your life, or worried about someone?" Bodies: ES "024 is free and confidential, day and night. In danger now? Call 112."; SE "Mind Självmordslinjen 90101 is open day and night. In danger now? Call 112."; PT "1411 is free, day and night. In danger now? Call 112."; FR "3114 is free, day and night. In danger now? Call 112." **The crisis-row wording goes to the G3 human review.**
- Costs: "free" only where a page says so. Known normal rate: "Normal call rate." (IT: "Normal call cost."). Unknown: "Call costs may apply." (crisis rows too; their wording also goes to the human tone read, T-4.3) The 2007 EU decision on 116 numbers says they "should be freephone numbers" but does not oblige operators to carry the calls free (eu-dec-2007-116), so it cannot back "free" for BRIS.
- New roles: `advice` (an advice line, not a report: ES 017, FR Info Escroqueries), shown in the "Report it" group after report and police; `harassment` (FR 3018), shown only on the sextortion / online-harassment help card.

## 3c. Card order (T-3.8r round 2)
- **Scam help screen:**
  1. Bank.
  2. "Report it" (report, then advice, then police).
  3. Support.
  4. Child, with the heading "Under 18? Lines for young people".
  5. Crisis, last.
- **Sensitive-scene help** (scene content notes, "Need to talk?"):
  1. Support.
  2. Child.
  3. Crisis.
  4. Then bank and "Report it".
- A missing role falls back to `fallbacks.<role>`. There is no crisis fallback: a country without a verified crisis line shows no crisis row.
- ~~The child heading "Free lines" vs BRIS cost~~: settled at G3 (2026-11-20). BRIS confirmed free on its own site, so "Free lines" holds for SE.

## 4. Open items before G3
- Safeonweb's Dec 2025 article mentions both suspicious@ and verdacht@ addresses. The English address is used above; confirm language variants.
- Decide with sceptic-reviewer whether real phone numbers are allowed on the help screen. Recommendation: yes, with the per-row "checked" date shown and a link to the official page.
- Verify 116 111 and 116 006 per launch-relevant country on official sites (see §2).
- Re-check all numbers within 30 days of G4 release.
