# G3 sources and help-screen check

**Owner:** fraud-researcher · **Date:** 2026-11-19 · **Branch:** phase3/g3-prep · **For:** Roman (G3: approve the sources list and the "Where to report" pages)

**Scope.**
- Every real body, phone number, email and URL in the help-screen data, `docs/patterns/where-to-report.draft.en.yaml`. It covers 10 countries plus the EU block, and the per-chapter help-card wording in `docs/patterns/ch*-sources.md` uses the same rows.
- Each one was re-checked today, on the body's own site or an official page where reachable. Some could not be re-confirmed from an official source today (see open items 1, 3, 5, 6 and 7 in §4: unreachable site, non-official source, or partial match).
- The player-facing screen in the build (`src/ui/EndScreen.tsx` → `HelpList`, `content/i18n/en/ui.json` `help_*`) still shows only the generic list, with no real numbers. The verified per-country cards are not wired in yet.

**Result.**
- No number, email or URL was found wrong or outdated. Not every claim could be re-confirmed today: the open items in §4 list those still resting on a secondary, non-official or unreachable source.
- No help-screen text had to change.
- Edits were limited to `checked` / `accessed` dates for re-verified rows, one added source, and review notes.

## 1. Help screen, per country

"Verified" means the number, URL or name was read today on the page given in the row's sources, or on another official page named here.

### EU
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| EU police agency "Report cybercrime online" signpost | name, URL, "sends you to your country's site" | yes. The page says "click … to be redirected to the reporting website of your country", and to use a local police station where there is no online option | 2026-11-19 | `checked` → 2026-11-19 |
| ECC-Net | name, URL (eccnet.eu/node/33), free advice for cross-border buys in EU/NO/IS | yes ("free, confidential expert advice") | 2026-11-19 | `checked` → 2026-11-19 |

### Belgium
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Safeonweb | suspicious@safeonweb.be | yes (CCB article: the official address; verdacht@ also in use) | 2026-11-19 | `checked` → 2026-11-19 |
| Card Stop / Fraudstop | 078 170 170, 24/7 | yes. Febelfin page (22 Jun 2026): same number, 24/7, blocks banking apps via the bank. The Brussels portal lists Card Stop +32 (0)78 170 170. fraudstop.be and cardstop.be refused automated access | 2026-11-19 | none |
| Police / Police on Web | police.be SCAM page URL, local station preferred, Belgian ID card for Police on Web | yes | 2026-11-19 | none |
| FSMA warnings list | URL, "not exhaustive" | yes | 2026-11-19 | none |
| Tele-Onthaal 106 / Télé-Accueil 107 | numbers; 107 "free, 24/7" | numbers yes (Brussels portal). The cost and hours for 107 come from police.be zone 5329, which returned a server error today | 2026-11-19 | none (open item 3) |
| Awel 102 / Écoute-Enfants 103 | numbers, free, hours | yes (vlaanderen.be: free, 16:00–22:00, not Sundays or holidays; police.be zone 5300: free, 10:00–24:00) | 2026-11-19 | none |
| Crisis: 1813 / 0800 32 123 | numbers, free, day and night | 1813 yes (operator: anonymous, free, 24/7). 0800 32 123: number yes (Brussels portal). Its "free, 24/7" comes from police.be zone 5329, unreachable today | 2026-11-19 | none (open item 3) |

### Germany
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Police (Onlinewache) | 13 Länder online; BY, SL, TH contact form | yes (hilfe-info.de) | 2026-11-19 | none |
| Card block 116 116 | 116 116 / +49 116 116 | yes (hilfe-info.de). The operator site refused automated access | 2026-11-19 | none |
| TelefonSeelsorge | 116 123, free, 24/7 | yes (gesund.bund.de and the operator site) | 2026-11-19 | none |
| Nummer gegen Kummer | 116 111, Mon–Sat 14:00–20:00, free | yes (operator flyer and home page) | 2026-11-19 | `checked` → 2026-11-19, review_note |
| Bundesnetzagentur | 2023 customs-SMS warning URL → complaint form | yes (page live, links to the SMS-spam form) | 2026-11-19 | `checked` → 2026-11-19 |

### Spain
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| INCIBE 017 | 017, WhatsApp 900 116 117, 8:00–23:00, free, not a report line | yes (INCIBE FAQ) | 2026-11-19 | none |
| Police (denuncia) | Policía Nacional / Guardia Civil, keep a copy for the bank | yes (INCIBE warning 30 Sep 2025) | 2026-11-19 | none |
| Banco de España complaints | URL; 15 business days for payment services | yes | 2026-11-19 | none |
| 116 111 (ANAR) | free, 24/7 | yes (CAIB page: 24/7, confidential; ANAR charter: free, 24 h) | 2026-11-19 | none |
| 024 | free, confidential, 24/7 | yes (Ministerio de Sanidad) | 2026-11-19 | none |

### France
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| 17Cyber | 17cyber.gouv.fr | yes (live: "Dispositif d'assistance gouvernemental proposé par la Police, la gendarmerie et cybermalveillance.gouv.fr") | 2026-11-19 | none |
| Info Escroqueries | 0 805 805 817, free | yes, on justice.fr (free from France, Mon–Fri 9:00–18:30) and service-public.gouv.fr. The cited fiche PDF exists but could not be read as text | 2026-11-19 | `checked` → 2026-11-19; new source `fr-justice-arnaque-escroquerie` added to the row |
| Cybermalveillance fiche réflexe | PDF URL | URL resolves (indexed, returns a document). Its content was not re-read | 2026-11-18 (kept) | none (open item 6) |
| Bank recall | "ask for a fraud recall" | yes (Banque de France: "demande de retour de fonds", "recall") | 2026-11-19 | none |
| 116 006, SOS Amitié, 3114, Fil Santé Jeunes, 3018 | numbers, costs, hours | yes, all match sante.fr | 2026-11-19 | none |

### Ireland (T-3.10f3)
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Local Garda station | report phishing/fraud | yes (NCSC phishing guide; CCPC 23 Apr 2026) | 2026-11-19 | `checked` → 2026-11-19 |
| Garda Confidential Line | 1800 666 111, investment fraud | yes (Garda press release 2 Oct 2025, unchanged) | 2026-11-19 | review_note |
| Central Bank of Ireland | 0818 681 681, +353 1 224 5800, report page URL | yes (the "Avoiding Scams" page shows "+353 (0)1 224 5800"; the report page is live, its only route is the third-party form) | 2026-11-19 | none |
| Samaritans | 116 123, freephone, 24/7 | yes (HSE) | 2026-11-19 | none |
| Childline | 1800 66 66 66, freephone | yes (HSE) | 2026-11-19 | none |

### Italy
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| 112 | fake police / relative "in trouble" | partly: the Carabinieri page says to call 112 for the fake-relative trick and for phone money requests. Its fake-police section does not name 112 | 2026-11-19 | `checked` → 2026-11-19 (open item 7) |
| Polizia Postale | name only, no URL | name and route yes (Banca d'Italia). commissariatodips.it still blocks automated access | 2026-11-19 | none (open item 5) |
| Bank → reclamo → ABF | | yes (Banca d'Italia) | 2026-11-19 | none |
| Telefono Amico Italia | 02 2327 2327, 24 h, normal call cost | yes (operator) | 2026-11-19 | none |
| 114 Emergenza Infanzia | free, 24 h | yes (minori.gov.it) | 2026-11-19 | none |

### Netherlands
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Fraudehelpdesk | 088 786 73 72 / +31 88 786 73 72 | yes (own site and the government contact guide; opening hours still differ slightly, and none are shown) | 2026-11-19 | none |
| CMI (RvIG) | ID-copy report, email reply within one day | yes | 2026-11-19 | none |
| Police, help-request fraud | online report in many cases | yes. Not for a taken-over account used for fraud: that goes to the police directly, and the account-takeover row covers it | 2026-11-19 | none |
| Police, account-takeover form | politie.nl PDF URL (zero-width characters) | yes, PDF still live ("Aangifte WhatsApp-accountovername", Sept 2024) | 2026-11-19 | `checked` → 2026-11-19 |
| Bank | report to your own bank; 24/7 card lines | yes (veiligbankieren.nl) | 2026-11-19 | none |
| De Luisterlijn | 088 0767 000, day and night, normal rate | number and 24/7 yes, on the operator's site (cost not stated there) | 2026-11-19 | none |
| De Kindertelefoon | 0800 0432, free, 8–18, 11:00–21:00 | yes (operator: free, 11:00–21:00; NJI: ages 8–18) | 2026-11-19 | none |

### Poland
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| 8080 SMS | free | yes (CERT Polska July 2026 summary) | 2026-11-19 | none |
| incydent.cert.pl | URL | yes (loads: "Zgłoś incydent \| CERT.PL") | 2026-11-19 | none |
| Police, bank | report; contact bank | yes (policja.pl PDF) | 2026-11-19 | none |
| 116 123 / 116 111 | free, anonymous, 24/7 | yes (gov.pl) | 2026-11-19 | none |

### Portugal
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Police PSP/GNR/PJ, bank | | yes (Banco de Portugal brochure; GNR phishing page) | 2026-11-19 | none |
| SNS 24 counselling | 808 24 24 24, "Call costs may apply." | number yes. gov.pt's emergency guide now says the call costs the same as a call to a landline | 2026-11-19 | none (open item 2) |
| 1411 | free, day and night | number and staffing yes (government). "Free" and "24 h" still come only from DECO. sns24.gov.pt was unreachable | 2026-11-19 | none (open item 1) |
| 116 111 | free, 24/7 | yes (gov.pt) | 2026-11-19 | none |

### Sweden
| Organisation | Shown | Verified | Date | Change |
|---|---|---|---|---|
| Polisen | 112 now / 114 14 / some online reports with a Swedish ID number | yes | 2026-11-19 | none |
| Bank | 24/7 bank number | yes (polisen.se, reviewed 19 Aug 2026) | 2026-11-19 | none |
| Jourhavande medmänniska | 08-702 16 80, 21:00–06:00 | yes (NASP, Krisinformation) | 2026-11-19 | none |
| Mind Självmordslinjen | 90101, day and night | yes (NASP) | 2026-11-19 | none |
| BRIS | 116 111, day and night, "Call costs may apply." | yes. **New:** BRIS's own site says "samtalet kostar ingenting" (the call is free) | 2026-11-19 | none (open item 4) |

## 2. sources.yaml spot-check

**What was sampled.**
- About 45 entries were opened today.
- That covers at least 2 per chapter (Berlin, Amsterdam, Paris, Madrid, Warsaw, Rome, Lisbon, Dublin, Stockholm, Brussels) and every source behind the help screen.
- 77 entries have a single `used_for` label. I sampled 25 of them (help-screen, chapter-brief and campaign-catalogue ones), not all 77.

**What the entries contain.** Every entry has a publisher, URL and `accessed` date, except the two placeholders below. Publishers are EU bodies, national authorities, CERTs, consumer bodies or banking associations. Tier-4 entries (news, NGOs, a payment-scheme campaign, MITRE) are marked as supporting only.

**Live and still supporting the claim:**
- **Berlin:** de-vz-paketdienst-sms (Stand 22 Jul 2026), de-bsi-password-theft, de-vzn-ghost-pairing-2026 (Stand 6 Oct 2026).
- **Amsterdam:** nl-fraudehelpdesk-takeover-alert-2026 (dated 18 Nov 2026), nl-betaalvereniging-iban-name-check, nl-politie-ik-ben-opgelicht.
- **Paris:** fr-inc-vop-2025, the EU police agency CEO/BEC leaflet, fr-bdf-fraude-moyens-paiement.
- **Madrid:** es-incibe-smishing-bank-callback-2025, es-bde-medidas-fraude-telefono-2025, es-boe-cnmc-circular-2-2026 (sender-alias register, as the brief says).
- **Warsaw:** pl-cert-monthly-2026-07, pl-blik-podszywacze-2026 (tier 4, correctly supporting only), pl-policja-oszukany.
- **Rome:** it-agcom-antispoofing-2025 (international spoof blocking, plus a domestic VoIP working group the notes don't mention), it-mur-smishing-vishing, it-open-roma-finti-poliziotti-2026 (news, supporting).
- **Lisbon:** pt-gnr-phishing, pt-deco-qrishing-2024, pt-rr-psp-rentals-2026 (news; PSP figures as noted).
- **Dublin:** ie-garda-crimecall-investment-2024, ie-fraudsmart-state-scheme-ads-2026, ie-cbi-fraud-landscape-2025.
- **Stockholm:** se-polisen-telefonbedrageri, se-polisen-anmal-telefonbedrageri, se-konsumentverket-investment-fraud.
- **Brussels:** be-ccb-remote-access-2019, be-police-money-mules-2020, be-febelfin-games-campaign-2025, be-fsma-warnings-list.
- **EU / catalogue:** eu-ep-psr-deal-2025 (date 27 Nov 2025 matches), eu-frontex-etias-sites-2024, de-bnetza-ping-calls, ie-garda-revenue-scam-2020, ch-ncsc-tickets-2025 (old ncsc.admin.ch URL still serves).

**Problems:**
- **nl-politie-money-mules:** the page did not load today (client error), while other politie.nl pages loaded. It may have moved. Single use (task-job-scam, context only).
- **es-incibe-sms-banks-2022:** the server returned an error on one try. Not re-tried.
- **be-police-autres-numeros:** server error. It backs the help screen (open item 3).
- **fr-cybermalveillance-fiche-hameconnage:** the URL resolves but the PDF text could not be read. Its content was not re-checked (open item 6).
- **The two placeholder entries at the end of the file (`placeholder: true`):** no URL, publisher or date. They are used only by the template and the tests, and no content uses them. Either keep them excluded from the G3 list or remove them once the tests use fixtures.
- **Provenance-only entries (`used_for: []`):** eu-eucrim-iocta-2026, eu-esas-ai-scams-2025, de-klicksafe-cybergrooming, the 2017 OSCE child-extortion report. They are not cited on screen. Not opened today.

**Dates.** I set `accessed` to 2026-11-19 on the 16 entries re-opened today that still showed 2026-11-18. Entries already dated 2026-11-19 were left as they were.

## 3. Changes made
- `docs/patterns/where-to-report.draft.en.yaml`:
  - `checked` 2026-11-18 → 2026-11-19 on the EU signpost, ecc-net, be-safeonweb-forward, de-116111 (plus review_note), de-bnetza, fr-info-escroqueries (plus source and review_note), ie-garda, it-112 and nl-police-account-takeover.
  - G3 note added to ie-garda-confidential.
  - No displayed text changed.
- `content/sources.yaml`:
  - `accessed` → 2026-11-19 on 16 re-verified entries.
  - New entry `fr-justice-arnaque-escroquerie` (Ministère de la Justice, Info Escroqueries number and hours).
- `docs/STATUS.md`: T-3.10f3 closed; G3 task line added.

## 4. Open items for Roman
1. **PT 1411, "free, day and night".** This still rests only on DECO PROteste, a consumer body. No government or SNS 24 page states it, and sns24.gov.pt was unreachable today. Options:
   - keep it (DECO is tier 4, supporting), or
   - show "1411. In danger now? Call 112." without the cost and hours.
   - **G3 outcome (2026-11-20): fixed.** Cost and hours removed from the pt-1411 label and body. The label is now "Mental-health support line (SNS 24). Call costs may apply." The body is "1411 is answered by psychologists and mental-health nurses. In danger now? Call 112."; the staffing is confirmed by the government page. `checked` stays 2026-11-19 (wording change only, nothing re-opened). A review_note says why, and asks for a re-check of sns24.gov.pt before G4.
2. **PT SNS 24 808 24 24 24.** gov.pt now says the call costs the same as a call to a landline. I suggest changing the label to "Normal call rate." (house rule). Your call; I did not change it.
   - **G3 outcome (2026-11-20): fixed.** Label is now "Portuguese or English. Normal call rate." The gov.pt guide was re-opened on 2026-11-20 and still says "rede fixa" rate. It is added to the row's sources.
3. **BE 107 and 0800 32 123 "free, 24/7".** The source page (police.be zone 5329) was down today. The numbers are confirmed on the Brussels portal, but the costs and hours are not. Re-check in a browser before G4.
   - **G3 outcome (2026-11-20): fixed for now, re-check before G4.** The "free, 24/7" claim (107) and "free, day and night" (0800 32 123) were removed from the labels and from the be-crisis body. Both now say "Call costs may apply." `checked` stays 2026-11-19. Both rows carry a review_note for the pre-G4 re-check. Restore the claim only if an official page states it.
4. **SE BRIS 116 111.** BRIS's own site says the call is free. I suggest the label "Free, day and night." with a new operator source, which would also settle the "Free lines" heading question in WHERE_TO_REPORT §3c. Needs your or the psychologist's OK.
   - **G3 outcome (2026-11-20): fixed.** Label is now "Free, day and night." The operator page "Prata med Bris" was opened on 2026-11-20. It says the phone is always open, even at night, that it costs nothing, and that the call doesn't show on the phone bill. New source `se-bris-prata-med-oss` (tier 4, operator site).
5. **IT Polizia Postale URL.** The site blocks automated access, so the row has no link. A human should open commissariatodips.it in a browser if a link is wanted.
   - **G3 outcome (2026-11-20): open.** No URL is shown. A human still needs to open the site in a browser.
6. **FR fiche réflexe PDF.** It could not be re-read today. The Info Escroqueries number is now also backed by justice.fr. The "Cybermalveillance.gouv.fr" row still links the PDF.
   - **G3 outcome (2026-11-20): open.** The PDF still needs a human read before G4.
7. **IT 112 row wording.** "Someone claiming to be police … call 112" is general good practice. The Carabinieri page names 112 for the fake-relative trick and for phone money requests, but not in its fake-police paragraph. Low risk. Keep it, or narrow it to "a relative 'in trouble' or a caller asking for money".
   - **G3 outcome (2026-11-20): fixed.** Body narrowed to "Call if a caller says a relative is 'in trouble', or a caller asks you for money." Fake police is no longer in the body.
8. **FR Info Escroqueries hours** (Mon–Fri 9:00–18:30) are verified but not shown. Add them to the label?
   - **G3 outcome (2026-11-20): fixed.** Label is now "Free advice, Monday to Friday 9:00-18:30".
9. **EU signpost body.** "Does not take reports itself" is inferred from the page, which redirects to national sites. Wording that sticks closer to the page would be "Its page sends you to your country's official reporting site."
   - **G3 outcome (2026-11-20): fixed.** Body is now "Its page sends you to your country's official online reporting site." The inferred sentence is gone.
10. **Crisis-row wording** (ES, SE, PT, FR, BE) still goes to your G3 human review, as already logged.
    - **G3 outcome (2026-11-20): open.** A human reads the crisis rows. Note that the PT and BE crisis rows changed today (items 1 and 3).
11. **Re-check all numbers within 30 days before G4** (PLAN risk table). The help data is still parked in docs/ until the per-country cards are wired into the help screen.
    - **G3 outcome (2026-11-20): open.** Accepted. Every number is re-checked within 30 days before G4, including items 1, 3 and 6.
