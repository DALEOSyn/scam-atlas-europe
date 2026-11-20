# G4 help re-check (T-4.4) and Italy crisis row (T-4.7a)

**Owner:** fraud-researcher · **Date:** 2026-11-20 · **Branch:** phase4/g4-sources · **For:** Roman (G4: public release, expected within 30 days; G3 point 4 asks for a re-check of every help number and link within 30 days before G4)

**Scope.** Every row of `content/help/where-to-report.en.yaml` that shows a phone number, email or link: 10 countries plus the EU block. Each was checked on the page in its `sources` list, or on another official page named below. Rows that show no number or link (first steps, fallbacks, the generic "your bank" and "police" rows) were re-checked only where the source page was opened anyway.

**Rule used.** `checked` was set to 2026-11-20 only where the number or link, and any hours or cost in the label, were read today. Rows that could not be confirmed today keep their old date and are listed in §3. The `accessed` date in `content/sources.yaml` was also moved to 2026-11-20 for each source opened today.

**Result in one line.** No phone number, email address or URL has changed. Four labels and two bodies changed, all in Belgium plus one in the Netherlands (§2). PT 1411's cost and hours are still not confirmed on an official page, so that row is unchanged. The krisinformation.se publisher open item is closed. Italy: keep the crisis row (§4).

## 1. Row by row

Result codes:
- **OK**: same as shown.
- **CHANGED**: the text was changed, see §2.
- **KEPT**: not confirmed today, so the old date stays.

### EU
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| EU | europol-report-signpost | URL; page sends you to your country's reporting site, local police where there's no online option | OK | eu-europol-report-cybercrime | 2026-11-20 |
| EU | ecc-net | URL; "free, confidential expert advice"; EU + Norway + Iceland | OK | eu-eccnet-about | 2026-11-20 |
| EU | eu-crisis-112 | 112 free from fixed and mobile phones everywhere in the EU (last checked by the Commission 2026-06-22) | OK | eu-youreurope-112 | 2026-11-20 |

### Belgium
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| BE | be-safeonweb-forward | suspicious@safeonweb.be (article updated 2025-12-23; verdacht@ also named) | OK | be-ccb-safeonweb-2025 | 2026-11-20 |
| BE | be-card-stop | 078 170 170, 24/7, same number as Fraudstop; no cost stated | OK ("Call costs may apply." stays) | be-febelfin-fraudstop-2026, be-brussels-hulpdiensten | 2026-11-20 |
| BE | be-police | URL; Police on Web for "certains faits non urgents", Belgian ID card; station "préférable" | OK | be-police-plainte-arnaque-en-ligne | 2026-11-20 |
| BE | be-fsma | URL; "the list cannot be considered as exhaustive" | OK | be-fsma-warnings-list | 2026-11-20 |
| BE | be-listening-line | 106 and 107 numbers (Brussels portal). 107: police.be zone 5329 is reachable again: "gratuit", "24h/24", anonymous; operator: "gratuit 24h/24 7j/7". 106: operator: "Gratis en anoniem", "24u op 24 en 7d op 7" | **CHANGED** (G3 item 3 closed) | be-police-autres-numeros, be-brussels-hulpdiensten, be-teleaccueil-home (new), be-teleonthaal-home (new) | 2026-11-20 |
| BE | be-youth-line | 102 free, 16:00-22:00, not Sundays or public holidays (vlaanderen.be); 103 free, 10:00-24:00 daily (police.be zone 5300) | OK | be-vlaanderen-awel, be-police-ecoute-enfants, be-brussels-hulpdiensten | 2026-11-20 |
| BE | be-crisis | 1813: operator "anoniem en gratis", "24/7 bereikbaar". 0800 32 123: zone 5329 "gratuit", "24 h/24"; the operator's own page: "anonyme, gratuite et ouverte 24h/24 et 7j/7"; operator name "Centre de Prévention du Suicide" | **CHANGED** (G3 item 3 closed) | be-zelfmoord1813, be-police-autres-numeros, be-brussels-hulpdiensten, be-cps-ligne-ecoute (new) | 2026-11-20 |

### Germany
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| DE | de-116111 | 116 111, Mon-Sat 14:00-20:00, "Der Anruf kostet nichts" (operator home page; the July 2026 flyer was not re-opened) | OK | de-ngk-116111-flyer-2026 (operator site) | 2026-11-20 |
| DE | de-police | online reporting in 13 Länder; Bavaria, Saarland and Thuringia have no online station | OK | de-hilfeinfo-onlinewache | 2026-11-20 |
| DE | de-card-block | "+49 116 116" for blocking payment cards | OK | de-hilfeinfo-onlinewache | 2026-11-20 |
| DE | de-telefonseelsorge | 116 123 "kostenlos und rund um die Uhr" (Stand 2026-04-23) | OK | de-gesundbund-krisen-2026 | 2026-11-20 |
| DE | de-bnetza | URL (clean, without ?nn=); customs-fee SMS warning; links to the SMS-spam and number-misuse complaint forms | OK | de-bnetza-zoll-sms-2023 | 2026-11-20 |
| DE | de-crisis | 116 123 free, 24/7, 112 in an emergency (federal portal); operator: "kostenfrei", "anonym", "Tag und Nacht", suicide prevention a core topic | OK | de-gesundbund-krisen-2026, de-telefonseelsorge-home | 2026-11-20 |

### Spain
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| ES | es-017 | 017, WhatsApp 900 116 117, 8:00-23:00 every day, free, confidential, "not a line for reports", minors helped | OK | es-incibe-017-faq | 2026-11-20 |
| ES | es-bde-complaint | URL; complaint to the bank first ("REQUISITO OBLIGATORIO"); 15 business days for payment services | OK | es-bde-reclamacion | 2026-11-20 |
| ES | es-116111 | 24/7, confidential, run with ANAR (regional page); "gratuito y confidencial", 24 h (operator charter) | OK | es-caib-116111, es-anar-116111-carta | 2026-11-20 |
| ES | es-024 | "gratuito, confidencial y disponible las 24 horas del día, los 365 días del año"; 112 for imminent danger | OK | es-sanidad-024 | 2026-11-20 |
| ES | es-police, es-bank | no number or link; source not re-opened | KEPT | es-incibe-smishing-bank-callback-2025 | 2026-11-19 |

### France
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| FR | fr-17cyber | live site title "17Cyber - Mon assistance en ligne"; "Dispositif d'assistance gouvernemental proposé par la Police, la gendarmerie et cybermalveillance.gouv.fr" | OK | fr-cybermalveillance-17cyber-2024 (live site) | 2026-11-20 |
| FR | fr-info-escroqueries | 0 805 805 817, "appel gratuit depuis la France", Mon-Fri 9:00-18:30. justice.fr unreachable today; confirmed on service-public.gouv.fr (vérifié le 28 mai 2025) | OK, source added | fr-servicepublic-escroquerie (new) | 2026-11-20 |
| FR | fr-cybermalveillance | PDF URL still indexed and resolves, but its text could not be read again (G3 open item 6) | KEPT | fr-cybermalveillance-fiche-hameconnage | 2026-11-18 |
| FR | fr-116006 | 116 006 free, 7/7 9:00-19:00; from outside mainland France +33 1 80 52 33 76 | OK | fr-santefr-lignes-ecoute | 2026-11-20 |
| FR | fr-sos-amitie | 09 72 39 40 50, 24/7, anonymous and free | OK | fr-santefr-lignes-ecoute | 2026-11-20 |
| FR | fr-3114 | 3114, 24/7, free | OK | fr-santefr-lignes-ecoute | 2026-11-20 |
| FR | fr-fil-sante-jeunes | 0 800 235 236, 12-25, 7/7 9:00-23:00, free | OK | fr-santefr-lignes-ecoute | 2026-11-20 |
| FR | fr-3018 | 3018, 7/7 9:00-23:00, free (sante.fr; the solidarites.gouv.fr page was not re-opened) | OK | fr-santefr-lignes-ecoute | 2026-11-20 |
| FR | fr-police, fr-bank | no number or link; source not re-opened | KEPT | fr-cybermalveillance-fiche-hameconnage, fr-bdf-fraude-moyens-paiement | 2026-11-18 / 2026-11-19 |

### Ireland
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| IE | ie-garda-confidential | 1800 666 111 "for further information or to report suspected investment fraud" | OK | ie-garda-investment-2025 | 2026-11-20 |
| IE | ie-cbi-report | URL live, heading "Report or Query an Unauthorised Firm", route is the third-party form (not linked); 0818 681 681 and +353 (0)1 224 5800 on the "Avoiding Scams" page; no hours or cost | OK | ie-cbi-report-unauthorised, ie-cbi-avoiding-scams | 2026-11-20 |
| IE | ie-samaritans | 116 123, freephone, 24 hours (HSE, reviewed 2025-05-28) | OK | ie-hse-urgent-help | 2026-11-20 |
| IE | ie-childline | 1800 66 66 66, freephone; no phone hours | OK | ie-hse-urgent-help | 2026-11-20 |
| IE | ie-pieta | 1800 247 247, freephone, "Any time" (HSE, reviewed 2025-08-28) | OK | ie-hse-supports-services | 2026-11-20 |
| IE | ie-garda, ie-bank | no number or link; the consumer-body page could not be fetched (fetch limit) | KEPT | ie-ccpc-spot-a-scam-2026 | 2026-11-19 |

### Italy
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| IT | it-112 | 112 named for the fake-relative trick and phone money requests; not in the fake-police paragraph | OK | it-carabinieri-contro-truffe | 2026-11-20 |
| IT | it-polizia-postale | route (offices or other channels) on the Banca d'Italia page; no URL shown | OK | it-bdi-truffe-cyber | 2026-11-20 |
| IT | it-bank | bank at once; reclamo (15 working days, payment services); ABF after a reclamo | OK | it-bdi-truffe-cyber | 2026-11-20 |
| IT | it-telefono-amico | 02 2327 2327, "tutti i giorni 24 ore su 24"; service free; Milan landline | OK, sources added | it-telefonoamico-home, it-senato-ddl64-2025 (new) | 2026-11-20 |
| IT | it-114 | "Gratuito, attivo 24 ore al giorno"; for children in distress and the adults who look after them | OK | it-minori-114-2024 | 2026-11-20 |
| IT | it-crisis | see §4 | OK, kept (T-4.7a) | it-telefonoamico-home, it-senato-ddl64-2025, it-lespresso-telefonoamico-2026 (new), eu-youreurope-112 | 2026-11-20 |

### Netherlands
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| NL | nl-fraudehelpdesk | 088 786 73 72 / +31 88 786 73 72 on both pages; government guide (modified 2026-03-17) says "lokaal tarief"; hours still differ between the pages (none shown) | **CHANGED** (label adds "Normal call rate.") | nl-fraudehelpdesk-contact-en, nl-rijksoverheid-fraudehelpdesk-contact | 2026-11-20 |
| NL | nl-police-account-takeover | PDF URL (with the zero-width characters) loads; "Aangifte WhatsApp-accountovername", version September 2024 | OK | nl-politie-whatsapp-takeover-2024 | 2026-11-20 |
| NL | nl-luisterlijn | 088 0767 000, day and night, "only the normal calling rate" (municipal notice); NJI day and night; operator home page 24/7, no cost stated | OK | nl-kerkrade-luisterlijn, nl-nji-bellen-chatten | 2026-11-20 |
| NL | nl-kindertelefoon | 0800 0432 "(gratis)" (government); ages 8-18, every day 11:00-21:00 (NJI; operator page also 11:00-21:00, free) | OK | nl-rijksoverheid-kindertelefoon, nl-nji-bellen-chatten | 2026-11-20 |
| NL | nl-113 | 113 free, 24/7, anonymous (contact guide, modified 2026-03-17); 113 or 0800 0113, 24/7, anonymous and free (theme page) | OK | nl-rijksoverheid-113-contact, nl-rijksoverheid-zelfmoorden-verminderen | 2026-11-20 |
| NL | nl-bank | own bank and forwarding confirmed; "card-blocking lines answer day and night" not found in today's read | KEPT | nl-veiligbankieren-meld-fraude | 2026-11-19 |
| NL | nl-cmi-id-copy, nl-police-hulpvraagfraude | no number or link; pages could not be fetched (fetch limit) | KEPT | nl-rvig-cmi-id-copy, nl-politie-aangifte-hulpvraagfraude | 2026-11-19 |

### Poland
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| PL | pl-8080 | "bezpłatny skrócony numer 8080" | OK | pl-cert-monthly-2026-07 | 2026-11-20 |
| PL | pl-cert-incident | URL loads ("Zgłoś incydent \| CERT.PL"); also named in the July 2026 summary, fn 1 | OK | pl-cert-monthly-2026-07 | 2026-11-20 |
| PL | pl-116123, pl-116111 | both "bezpłatne, anonimowe i dostępne 24/7"; phone, chat, form; adults / children and young people | OK | pl-gov-cyfryzacja-116-2025 | 2026-11-20 |
| PL | pl-crisis | 800 70 2222 "całodobową, bezpłatną"; for a mental-health crisis; 112 in a sudden threat to life (page 2024-12-05) | OK | pl-gov-zdrowie-pomoc-psych | 2026-11-20 |
| PL | pl-police, pl-bank | no number or link; source not re-opened | KEPT | pl-policja-oszukany | 2026-11-19 |

### Portugal
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| PT | pt-sns24-psych | 808 24 24 24 at the landline rate ("rede fixa"), guide updated 2026-04-29; English counselling (2022 page) | OK | pt-gov-emergency-contacts-2026, pt-gov-sns24-psych-2022 | 2026-11-20 |
| PT | pt-1411 | number, start date 2025-09-10 and staffing (government page); **cost and hours: still no official statement**; the SNS 24 home page lists only 808 24 24 24; the gov.pt emergency guide doesn't list 1411; no SNS 24 or SPMS page found by search | OK as shown (open item stays open, wording already omits cost and hours) | pt-gov-1411-2025 | 2026-11-20 |
| PT | pt-116111 | "Disponível 24h por dia", "As chamadas são gratuitas" | OK | pt-gov-emergency-contacts-2026 | 2026-11-20 |
| PT | pt-police, pt-bank | no number or link; source not re-opened | KEPT | pt-bdp-ficaadica-2023, pt-gnr-phishing | 2026-11-19 |

### Sweden
| Country | Row | What was checked | Result | Source id | Date |
|---|---|---|---|---|---|
| SE | se-police | 112 if happening now; 114 14 otherwise; some crimes online with a Swedish personal or coordination number | OK | se-polisen-bedragerier-anmalan | 2026-11-20 |
| SE | se-bank | "Kontakta din bank direkt …"; "Alla banker har ett särskilt telefonnummer som du kan ringa dygnet runt" (reviewed 2026-08-19) | OK | se-polisen-telefonbedrageri | 2026-11-20 |
| SE | se-jourhavande | 08-702 16 80, "alla dagar kl 21-06" (NASP, updated 2026-09-11); "every night between 9 pm and 6 am"; no cost | OK | se-ki-nasp-hjalplinjer, se-krisinformation-phone-numbers | 2026-11-20 |
| SE | se-mind | 90101 "Öppet dygnet runt, varje dag" (NASP); no cost | OK | se-ki-nasp-hjalplinjer | 2026-11-20 |
| SE | se-bris | "Telefonen är alltid öppen – även på natten"; "Det kostar inget …, syns inte på telefonräkningen" | OK | se-bris-prata-med-oss | 2026-11-20 |
| SE | (publisher) | krisinformation.se publisher: the site's About page says it is owned by the Swedish Civil Contingencies Agency (MSB); the successor agency's site (reviewed 2026-08-19) lists it under "Our websites" as the Swedish Civil Defence and Resilience Agency | **CHANGED** in sources.yaml (publisher field); open item closed | se-krisinformation-about (new), se-mcf-websites (new) | 2026-11-20 |

## 2. What differs from before

**No phone number, email or URL changed.** Text changes:

| Row | Field | Before | After | Why |
|---|---|---|---|---|
| be-listening-line | 106 label | "Tele-Onthaal (Dutch). Call costs may apply." | "Tele-Onthaal (Dutch): free, 24/7" | operator site: free, 24/7 (no official page states the cost; operator pages are allowed by the cost rule) |
| be-listening-line | 107 label | "Télé-Accueil (French). Call costs may apply." | "Télé-Accueil (French): free, 24/7" | police.be zone 5329 (official, reachable again) + operator |
| be-listening-line | body | "Someone to talk to, anonymously." | "Someone to talk to, anonymously, day and night." | both lines 24/7 |
| be-crisis | 0800 32 123 label | "Suicide prevention line (French). Call costs may apply." | "Centre de Prévention du Suicide (French): free, anonymous, day and night" | zone 5329 + the operator's own page (name verified there) |
| be-crisis | body | "Call 1813 (Dutch) or 0800 32 123 (French). In danger now? Call 112." | "Call 1813 (Dutch) or 0800 32 123 (French). Both are free and anonymous, day and night. In danger now? Call 112." | as above; crisis wording still goes to the T-4.3 human review |
| nl-fraudehelpdesk | label | "Advice and reporting (from abroad: +31 88 786 73 72)" | "Advice and reporting. Normal call rate. From abroad: +31 88 786 73 72" | government guide: "lokaal tarief" (house cost rule) |

New sources: be-teleaccueil-home, be-teleonthaal-home, be-cps-ligne-ecoute, fr-servicepublic-escroquerie, it-senato-ddl64-2025, it-lespresso-telefonoamico-2026, se-krisinformation-about, se-mcf-websites. The se-krisinformation-phone-numbers publisher field was corrected.

## 3. Unreachable or not confirmed today

| Source | Row(s) | What happened | Effect |
|---|---|---|---|
| fr-justice-arnaque-escroquerie (justice.fr) | fr-info-escroqueries | robots.txt could not be read; page not fetched | confirmed instead on service-public.gouv.fr; row re-dated |
| fr-cybermalveillance-fiche-hameconnage (PDF) | fr-cybermalveillance, fr-police | URL resolves (search index, metadata only) but the text cannot be read by the tool | **KEPT at 2026-11-18. A human must open the PDF in a browser before G4** (G3 open item 6) |
| sns24.gov.pt | pt-1411 | home page loads; no 1411 page found; no cost or hours on any official page | no change; PT 1411 open item 1 stays open |
| nl-rvig-cmi-id-copy, nl-politie-aangifte-hulpvraagfraude, ie-ccpc-spot-a-scam-2026 | nl-cmi-id-copy, nl-police-hulpvraagfraude, ie-garda, ie-bank | the session's fetch limit (shared by all agents) ran out | **KEPT at 2026-11-19**; these rows show no number or link |
| not re-opened (no number or link on the row) | es-police, es-bank, fr-bank, pl-police, pl-bank, pt-police, pt-bank, first_steps, fallbacks | not in scope for a number/link check | old dates kept |
| commissariatodips.it | it-polizia-postale | not tried (still blocks automated access per G3); the row shows no URL | G3 open item 5 unchanged |
| de-ngk-116111-flyer-2026 (the flyer PDF), de-bmbfsfj-ngk-poster, fr-solidarites-numeros-2025, se-konsumentverket-investment-fraud | DE child, FR 3018, SE bank | not re-opened; the row was confirmed on its other source | none |

`meta.checked` (2026-11-18) was not changed. It is not a per-row date.

## 4. Italy crisis row (T-4.7a): recommendation

**Recommendation: KEEP** the it-crisis row (Telefono Amico Italia, 02 2327 2327). The wording stays as it is, confirmed today:

- body: "Telefono Amico Italia answers anyone in emotional crisis, every day, 24 hours. In danger now? Call 112."
- label: "Telefono Amico Italia: every day, 24 hours. Normal call cost."

**Reasons.**
1. **The hours question is now settled.** The operator's home page (re-opened 2026-11-20) says "tutti i giorni 24 ore su 24". A national weekly reported on 2026-09-08 that round-the-clock cover began on 1 September 2026, after a six-month overnight trial [it-lespresso-telefonoamico-2026, news, supporting]. So the 2024 release's 9-24 hours were right at the time and are now outdated. The Milan municipal page with an old, suspended number refers to a different, older number.
2. **There is no state line to point to instead.** An Italian Senate bill (DDL 64, presented 2025-09-10) proposes that the Health Ministry set up a public suicide-prevention number in cooperation with Telefono Amico Italia [it-senato-ddl64-2025]. This is an official parliamentary document. It confirms that no state line exists yet, and it names this operator as the existing reference service. A September 2026 trade-press report on the ministry's planned national suicide-prevention plan mentions no helpline number either (not cited).
3. **A 112-only row would remove the only listening option** for Italian players in crisis or worried about someone. Every other chapter country shows a crisis line. 112 stays in the body for immediate danger [eu-youreurope-112]. The operator itself also points to 112 or 118.
4. **The cost wording stays cautious.** The service is free, but the number is a Milan landline, so the label says "Normal call cost.", not "free".

**Risks and conditions.**
- The 24-hour cover is only 2.5 months old and rests on the operator (tier 4) plus one news report. Re-check the hours at every help re-check.
- The human review (T-4.3) still decides whether an NGO-only crisis row is acceptable. If it is not, the fallback is the `eu_crisis` pattern: the body "In danger now? Call 112." with no phone (the schema allows it).
- The support row (it-telefono-amico) uses the same number. This is deliberate and already flagged for the learning-psychologist.
- **Confidence: medium.** Number, service scope, free service, 24 h and 112/118 come from the operator (re-opened today). The 24 h start date comes from news. The absence of a state line comes from an official document (Senate bill). The call cost is inferred from a landline number, which is why the label says "Normal call cost." rather than "free".

**YAML change made:** it-crisis keeps its text. Its `sources` now add it-senato-ddl64-2025 and it-lespresso-telefonoamico-2026, and its review_note records the decision. The it-telefono-amico support row adds it-senato-ddl64-2025.

**Not done (other T-4.7a sub-points, not asked here):** the PL body suggestion (", free, day and night" after 116 111), the EU row label for non-EU players, and the fixture test for a country with no crisis row.

## 5. Checks not run

This session had no shell, so `npm run content:validate`, `npm run redline:lint` and `npx vitest run tests/content tests/unit/redline.test.ts` were **not run**. Please run them before commit. What to expect:
- content:validate: 44 host warnings (the 38 before + 6 new hosts from new sources: tele-accueil.be, www.tele-onthaal.be, www.preventionsuicide.be, www.senato.it, lespresso.it, www.mcf.se). Once the SOURCE_HOSTS.md "G4 vetting" entries are added, 22 remain, all on the proposed secondary list.
- The new `accessed` values are quoted YYYY-MM-DD strings (schema regex).
- No help-file link, email or link host changed, so HELP_LINK_HOSTS is unchanged.
- No real name was added to docs outside `docs/patterns/`.
