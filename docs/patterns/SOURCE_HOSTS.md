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

## Notes for the engineer
- **New to `scripts/lib/source-hosts.ts`** (not in the allow-list yet, per sceptic review 2026-11-18): `politie.nl` (no www), `moje.cert.pl`, `wiedza.cert.pl`, `www.nummergegenkummer.de`, `www.bmbfsfj.bund.de`, `www.bacs.admin.ch`, `www.verbraucherzentrale-niedersachsen.de`, and `incydent.cert.pl` (help file only). The last two were already used in `content/sources.yaml` before T-2.5 but never added to the allow-list.
- `www.incibe.es` gained new sources in T-2.5 and is already in the allow-list.
- Match on exact hostname, not suffix, unless you deliberately allow subdomains of `cert.pl` and `politie.nl`.
- Placeholder entries (`europol-scam-smishing`, `bsi-smishing`) have no URL.
