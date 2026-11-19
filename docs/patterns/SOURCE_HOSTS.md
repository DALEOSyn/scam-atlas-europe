# Reputable source hosts (for `scripts/lib/source-hosts.ts`)

**Owner:** fraud-researcher · **Generated from:** `content/sources.yaml` (T-2.5, 2026-11-18) · **Not edited:** `scripts/` (engineer updates the allow-list).

One host per line: `host | publisher | tier`. Exact hostnames as they appear in the `url` fields (with or without `www.` as used). Tier = highest tier of any source on that host (see header of `content/sources.yaml`). Hosts marked *(news, supporting)* must never be the only source for a claim.

## EU level
www.enisa.europa.eu | ENISA (EU Agency for Cybersecurity) | 1
www.europol.europa.eu | Europol | 1
www.eba.europa.eu | European Banking Authority / European Supervisory Authorities | 1
finance.ec.europa.eu | European Commission, DG FISMA | 1
www.ecb.europa.eu | European Central Bank | 1
www.eccnet.eu | European Consumer Centres Network (ECC-Net) | 1
fra.europa.eu | EU Agency for Fundamental Rights (FRA) | 1
europa.eu | European Union, Your Europe portal | 1
www.europeanpaymentscouncil.eu | European Payments Council | 3
www.ebf.eu | European Banking Federation | 3
eucrim.eu | eucrim (Max Planck Institute journal; provenance only) | 4
childhelplineinternational.org | Child Helpline International (NGO) | 4

## Belgium
ccb.belgium.be | Centre for Cybersecurity Belgium (CCB) | 2
safeonweb.be | Safeonweb (CCB) | 2
www.police.be | Belgian Federal / Local Police | 3
febelfin.be | Febelfin (Belgian banking federation) | 3

## France
www.cybermalveillance.gouv.fr | Cybermalveillance.gouv.fr (GIP ACYMA) | 2
www.gendarmerie.interieur.gouv.fr | Gendarmerie nationale | 3
www.banque-france.fr | Banque de France (OSMP) | 3

## Germany
bsi.bund.de | BSI (Federal Office for Information Security), short links | 2
www.bsi.bund.de | BSI (Federal Office for Information Security) | 2
www.bundesregierung.de | Federal Government (carrying a BSI warning) | 3
www.zoll.de | German Customs (Zoll) | 3
www.bundesnetzagentur.de | Bundesnetzagentur (Federal Network Agency) | 3
www.bmbfsfj.bund.de | Federal Ministry for Education, Family, Senior Citizens, Women and Youth | 3
www.verbraucherzentrale.de | Verbraucherzentrale (federal consumer centres portal) | 3
www.verbraucherzentrale-niedersachsen.de | Verbraucherzentrale Niedersachsen | 3
www.evz.de | European Consumer Centre Germany | 3
www.nummergegenkummer.de | Nummer gegen Kummer e.V. (116 111 operator, NGO) | 4

## Ireland
www.ncsc.gov.ie | National Cyber Security Centre Ireland | 2
www.garda.ie | An Garda Síochána | 3
www.fraudsmart.ie | FraudSMART (BPFI fraud-awareness initiative) | 3
bpfi.ie | Banking & Payments Federation Ireland | 3

## Italy
www.carabinieri.it | Arma dei Carabinieri | 3

## Netherlands
www.politie.nl | Politie (Netherlands Police) | 3
politie.nl | Politie (Netherlands Police), host without www used by one PDF (T-2.5) | 3
www.fraudehelpdesk.nl | Fraudehelpdesk | 3
www.betaalvereniging.nl | Betaalvereniging Nederland (Dutch Payments Association) | 3
nos.nl | NOS (public broadcaster) *(news, supporting)* | 4

## Poland
cert.pl | CERT Polska (NASK) | 2
moje.cert.pl | CERT Polska (NASK), advisories (T-2.5) | 2
wiedza.cert.pl | CERT Polska (NASK), knowledge base (T-2.5) | 2
zabkowice-slaskie.policja.gov.pl | Polish Police, district unit (hosting a NASK guide) | 3
www.polskieradio.pl | Polskie Radio *(news, supporting)* | 4

## Portugal
www.gnr.pt | Guarda Nacional Republicana (GNR) | 3
www.deco.proteste.pt | DECO PROteste (consumer association) | 3
rr.pt | Rádio Renascença *(news, supporting)* | 4
www.dn.pt | Diário de Notícias *(news, supporting)* | 4
theportugalpost.com | The Portugal Post *(news, supporting)* | 4

## Spain
www.incibe.es | INCIBE (Spanish National Cybersecurity Institute) | 2

## Sweden
polisen.se | Polisen (Swedish Police) | 3

## Switzerland (non-EU, supporting only)
www.bacs.admin.ch | Swiss Federal Office for Cybersecurity (BACS / NCSC) | 2

---

## Hosts used only in `docs/patterns/where-to-report.draft.en.yaml` (help-screen draft; not sources)
These are link targets on the help screen, not citation hosts. Listed so the engineer can decide whether the help-file check uses the same allow-list.

incydent.cert.pl | CERT Polska incident-report portal | 2

## New hosts from T-R.1 (threat catalogue, 2026-11-18): all marked **new**, not yet in `scripts/lib/source-hosts.ts`

### EU level
www.frontex.europa.eu | Frontex (European Border and Coast Guard Agency) | 1 | **new**
civil-protection-humanitarian-aid.ec.europa.eu | European Commission, DG ECHO | 1 | **new**
home-affairs.ec.europa.eu | European Commission, DG Migration and Home Affairs | 1 | **new**
eeas.europa.eu | European External Action Service (host without www, as opened) | 1 | **new**

### Belgium
www.fsma.be | FSMA (Financial Services and Markets Authority) | 3 | **new**
www.eccbe.eu | European Consumer Centre Belgium (redirect target of eccbelgium.be) | 3 | **new**

### France
cnil.fr | CNIL (data protection authority; host without www, as opened) | 3 | **new**
lot.gouv.fr | Services de l'État dans le Lot (prefecture website) | 3 | **new**

### Germany
www.verbraucherzentrale.nrw | Verbraucherzentrale NRW | 3 | **new**
polizei-beratung.de | Police crime prevention (ProPK); opened as `Polizei-Beratung.de`, hostnames are case-insensitive | 3 | **new**

### Switzerland (non-EU, supporting only)
www.ncsc.admin.ch | Swiss NCSC (older host of the federal cyber office; www.bacs.admin.ch is already listed) | 2 | **new**

### Reference / taxonomy (non-EU)
attack.mitre.org | MITRE ATT&CK (US). Taxonomy only, never evidence of European prevalence. Registry tier 4 because the schema allows tiers 1-4 only | 4 | **new**

T-R.1 also cites new pages on hosts already listed: www.enisa.europa.eu, www.europol.europa.eu, www.police.be (incl. a No More Ransom leaflet), bsi.bund.de, www.bsi.bund.de, www.verbraucherzentrale.de, www.verbraucherzentrale-niedersachsen.de, www.bundesnetzagentur.de, www.garda.ie, cert.pl, www.bacs.admin.ch.

## New hosts from T-2.4b (Berlin arc beat sources, 2026-11-18): all marked **new**, not yet in `scripts/lib/source-hosts.ts`

better-internet-for-kids.europa.eu | Better Internet for Kids (European Commission portal; article by the German Safer Internet Centre) | 3 | **new**
www.klicksafe.eu | klicksafe (German Awareness Centre, coordinated by the Rhineland-Palatinate Media Authority with BzKJ) | 3 | **new**
lippe.polizei.nrw | Polizei NRW, Kreispolizeibehörde Lippe | 3 | **new**
www.polizei-beratung.de | Police crime prevention (ProPK), www host (the host without www is listed under T-R.1) | 3 | **new**

T-2.4b also cites a new page on www.europol.europa.eu (already listed).

## Hosts from phase 3, chapter 2 (Amsterdam briefs, 2026-11-19)

The six hosts below are now in `scripts/lib/source-hosts.ts`. That allow-list matches suffixes, so its entries `veiligbankieren.nl`, `nvb.nl`, `veiliginternetten.nl`, `rijksoverheid.nl` and `rvig.nl` cover the www hosts too. `betaalvereniging.nl` was also added on this branch.

veiligbankieren.nl | Veilig Bankieren (Dutch Banking Association, NVB), host without www as opened | 3
www.veiligbankieren.nl | Veilig Bankieren (Dutch Banking Association, NVB) | 3
www.nvb.nl | Nederlandse Vereniging van Banken (Dutch Banking Association) | 3
veiliginternetten.nl | Veiliginternetten.nl (Ministry of Economic Affairs, NCSC-NL and ECP) | 3
www.rijksoverheid.nl | Rijksoverheid (Government of the Netherlands) | 3
www.rvig.nl | Rijksdienst voor Identiteitsgegevens (RvIG), incl. Centraal Meldpunt Identiteitsfraude | 3

The chapter-2 briefs also cite new pages on hosts already listed: www.politie.nl, www.fraudehelpdesk.nl, www.betaalvereniging.nl.

**Follow-up (payee-name check sources, 2026-11-19):**
- eur-lex.europa.eu | EUR-Lex (Official Journal of the EU) | 1 | covered by the `europa.eu` suffix entry.
- www.europeanpaymentscouncil.eu | European Payments Council | 3 | listed above under EU level, but **not in `scripts/lib/source-hosts.ts`**, so it gives a warning.
- febelfin.be | Febelfin (Belgian banking federation) | 3 | listed above under Belgium, but **not in `scripts/lib/source-hosts.ts`**, so it gives a warning.
- business.gov.nl is not used (`nl-business-gov-minimum-wage-2026` was not added).
## New hosts from phase 3, chapter 3 (Paris research, 2026-11-19)

**Already in `scripts/lib/source-hosts.ts`** (added by the engineer as base domains, checked 2026-11-19):
www.justice.fr | Ministère de la Justice, justice.fr (Service-Public fiches on THESEE) | 3 | in allow-list as `justice.fr`
www.inc-conso.fr | Institut national de la consommation (INC, public consumer body) | 3 | in allow-list as `inc-conso.fr`
www.lesclesdelabanque.com | Fédération bancaire française, "Les clés de la banque" consumer site | 3 | in allow-list as `lesclesdelabanque.com`

**Not yet in `scripts/lib/source-hosts.ts`** (new):
eur-lex.europa.eu | EUR-Lex (Official Journal of the EU, legal texts) | 1 | **new**
www.dgsi.interieur.gouv.fr | DGSI (Direction générale de la sécurité intérieure) | 3 | **new**

**Candidates to confirm in `scripts/lib/source-hosts.ts`.** These hosts are listed above in this file, and the Paris research cites new pages on them, but I didn't find them in a search of the allow-list for these names:
www.banque-france.fr | Banque de France | 3 | candidate
www.europeanpaymentscouncil.eu | European Payments Council | 3 | candidate

The Paris research also cites new pages on www.europol.europa.eu and www.cybermalveillance.gouv.fr (already listed above).

## New hosts from T-3.8r (Rome + Lisbon research, verified help list, 2026-11-19): all **new**, not yet checked against `scripts/lib/source-hosts.ts`

### EU level
eba.europa.eu | European Banking Authority (host without www, as opened; ESAs factsheet IT edition) | 1 | covered by the `europa.eu` suffix entry if suffix matching applies

### Italy
www.agcom.it | AGCOM (telecom regulator) | 3 | **new**
www.bancaditalia.it | Banca d'Italia | 3 | **new**
www.unipr.it | University of Parma, hosting a Ministry of University and Research (MUR) brochure | 3 | **new** (publisher is the ministry; host is a mirror)
www.minori.gov.it | National childhood documentation centre (Department for Family Policies) | 3 | **new**
www.telefonoamico.it | Telefono Amico Italia (NGO helpline operator; help screen only) | 4 | **new**
www.open.online | Open *(news, supporting)* | 4 | **new**

### Portugal
www.bportugal.pt | Banco de Portugal | 3 | **new**
www.gov.pt | Governo de Portugal (gov.pt guides and news) | 3 | **new**
portugal.gov.pt | Governo de Portugal (government news) | 3 | **new**
www.rtp.pt | RTP (public broadcaster) *(news, supporting)* | 4 | **new**

### Netherlands
www.nji.nl | Nederlands Jeugdinstituut (youth knowledge institute; supporting) | 4 | **new**
en.kerkrade.nl | Gemeente Kerkrade (municipality) | 3 | **new**
nltimes.nl | NL Times *(news, supporting)* | 4 | **new**

### Germany
gesund.bund.de | Federal Ministry of Health health portal | 3 | **new**
www.hilfe-info.de | Federal Ministry of Justice and Consumer Protection (victims' information portal) | 3 | **new**

### France
www.sante.fr | Santé.fr (public health information service) | 3 | **new**
www.solidarites.gouv.fr | Ministère des Solidarités | 3 | **new**

### Spain
www.sanidad.gob.es | Ministerio de Sanidad | 3 | **new**
www.caib.es | Govern de les Illes Balears (regional government) | 3 | **new**
www.anar.org | Fundación ANAR (NGO, 116 111 operator; supporting) | 4 | **new**

### Poland
www.gov.pl | Polish government (Ministry of Digital Affairs pages) | 3 | **new**
www.policja.pl | Polish Police (national site) | 3 | **new**

### Ireland
www2.hse.ie | Health Service Executive | 3 | **new**

### Sweden
ki.se | Karolinska Institutet, NASP (national centre for suicide research and prevention) | 3 | **new**
www.krisinformation.se | Krisinformation.se (government crisis-information service; round 2) | 3 | **new**

### Belgium
be.brussels | Brussels-Capital Region portal | 3 | **new**
www.vlaanderen.be | Flemish government (round 2) | 3 | **new**

### Luxembourg (supporting for Lisbon QR)
www.vdl.lu | Ville de Luxembourg (City of Luxembourg) | 3 | **new**

T-3.8r also cites new pages on hosts already listed: www.dn.pt, www.deco.proteste.pt (incl. round 2 1411 page), www.rijksoverheid.nl, polisen.se, febelfin.be, www.police.be, www.evz.de (re-opened), eur-lex.europa.eu (round 2, 116 decision).

### Help-screen link targets only (not sources)
17cyber.gouv.fr | 17Cyber (French government online assistance; live site opened 2026-11-19) | 2
## New hosts from phase 3, chapters 4–5 (Madrid and Warsaw research, T-3.6r, 2026-11-19)

**Already covered by `scripts/lib/source-hosts.ts`:** www.incibe.es (`incibe.es`), www.europarl.europa.eu (`europa.eu`).

**Not yet in `scripts/lib/source-hosts.ts`** (new; content:validate warns until added):
clientebancario.bde.es | Banco de España, Portal del Cliente Bancario | 3 | **new** (suggest `bde.es`, which also covers www.bde.es)
www.bde.es | Banco de España (Memoria del Servicio de Reclamaciones) | 3 | **new**
www.boe.es | Boletín Oficial del Estado (Spain's official gazette: ministerial order, CNMC circulars) | 3 | **new** (suggest `boe.es`)
cnmc.es | Comisión Nacional de los Mercados y la Competencia (host without www, as opened) | 3 | **new**
www.nask.pl | NASK, national research institute running CERT Polska | 2 | **new** (suggest `nask.pl`)
www.policja.pl | Polish Police, national site (hosting a warning whose issuer is not stated) | 3 | **new** (suggest `policja.pl`; district sites such as zabkowice-slaskie.policja.gov.pl sit under a different domain, `policja.gov.pl`)
samorzad.gov.pl | Polish government portal (hosting UKNF slides) | 3 | **new** (exact host only; gov.pl is too broad)
podszywacze.pl | Payment-scheme campaign site *(industry, supporting only, tier 4)* | 4 | **new**; do not add to the allow-list, the warning is correct

The chapter 4–5 research also cites new pages on cert.pl (still not in the allow-list, see below) and www.incibe.es.

## New hosts from phase 3, chapters 8–9 (Dublin and Stockholm research, T-3.10r, 2026-11-19): all **new**, not yet checked against `scripts/lib/source-hosts.ts`

### Ireland
www.centralbank.ie | Central Bank of Ireland | 3 | **new** (suggest `centralbank.ie`, which also covers the two below)
centralbank.ie | Central Bank of Ireland (host without www, as opened; also the help-screen link for reporting an unauthorised firm) | 3 | **new**
edit.centralbank.ie | Central Bank of Ireland (press-release host as indexed) | 3 | **new**
www.ccpc.ie | Competition and Consumer Protection Commission | 3 | **new**

### Sweden
www.konsumentverket.se | Konsumentverket (Swedish Consumer Agency) | 3 | **new**
konsumenternasbankochfinansbyra.se | Konsumenternas Bank- och finansbyrå (consumer bureau; reached via redirect from konsumenternas.se) | 3 | **new**

### EU level
www.esma.europa.eu | European Securities and Markets Authority | 1 | covered by the `europa.eu` suffix entry if suffix matching applies

T-3.10r also cites new pages on hosts already listed: www.garda.ie, bpfi.ie, www.fsma.be, www.evz.de, polisen.se, www.eba.europa.eu.

**Not a source host:** the Central Bank's report form sits on a third-party survey host. It is NOT linked from the help screen or sources (link the centralbank.ie page instead).

## Notes for the engineer
- **New to `scripts/lib/source-hosts.ts`** (not in the allow-list yet, per sceptic review 2026-11-18): `politie.nl` (no www), `moje.cert.pl`, `wiedza.cert.pl`, `www.nummergegenkummer.de`, `www.bmbfsfj.bund.de`, `www.bacs.admin.ch`, `www.verbraucherzentrale-niedersachsen.de`, and `incydent.cert.pl` (help file only). The last two were already used in `content/sources.yaml` before T-2.5 but never added to the allow-list.
- `www.incibe.es` gained new sources in T-2.5 and is already in the allow-list.
- Match on exact hostname, not suffix, unless you deliberately allow subdomains of `cert.pl` and `politie.nl`.
- Placeholder entries (`europol-scam-smishing`, `bsi-smishing`) have no URL.
