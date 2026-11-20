/**
 * Hosts expected for sources (Red Line 6: public, reputable European sources).
 * A source URL outside this list produces a content:validate WARNING only,
 * so fraud-researcher can extend the list in the same PR that adds the source.
 * Entries match the host itself and any subdomain.
 */
export const SOURCE_HOST_ALLOWLIST: readonly string[] = [
  // EU institutions and agencies (europol.europa.eu, enisa.europa.eu, ec.europa.eu, ...)
  'europa.eu',
  // EU payment-industry bodies
  'europeanpaymentscouncil.eu',
  // United Kingdom
  'gov.uk',
  'police.uk',
  'ncsc.gov.uk',
  // Germany
  'bund.de',
  'polizei-beratung.de',
  'verbraucherzentrale.de',
  'vzhh.de',
  // France
  'gouv.fr',
  'cybermalveillance.gouv.fr',
  'justice.fr',
  'inc-conso.fr',
  'lesclesdelabanque.com',
  // Netherlands, Belgium
  'ncsc.nl',
  'politie.nl',
  'fraudehelpdesk.nl',
  'rijksoverheid.nl',
  'rvig.nl',
  'veiliginternetten.nl',
  'veiligbankieren.nl',
  'nvb.nl',
  'betaalvereniging.nl',
  'safeonweb.be',
  'febelfin.be',
  'police.be',
  'fsma.be',
  // Ireland
  'garda.ie',
  'ncsc.gov.ie',
  'statesavings.ie',
  'ntma.ie',
  // Spain, Italy, Portugal
  'incibe.es',
  'policianacional.es',
  'commissariatodips.it',
  'cncs.gov.pt',
  // T-4.2 (2026-11-20): reputable hosts listed in docs/patterns/SOURCE_HOSTS.md as "new" (tiers 1-3 only).
  // Not added on purpose: news hosts (supporting only), NGO operators and industry campaign sites (tier 4: the
  // warning is expected, SOURCE_HOSTS.md), and broad suffixes the doc rules out (gov.pt, gov.pl, belgium.be: see SOURCE_HOST_EXACT).
  // EU level and Switzerland (supporting only)
  'eccnet.eu',
  'ebf.eu',
  'eccbe.eu',
  'klicksafe.eu',
  'bacs.admin.ch',
  'ncsc.admin.ch',
  // Germany
  'bundesnetzagentur.de',
  'bundesregierung.de',
  'zoll.de',
  'evz.de',
  'hilfe-info.de',
  'verbraucherzentrale-niedersachsen.de',
  'verbraucherzentrale.nrw',
  'lippe.polizei.nrw',
  // France
  'banque-france.fr',
  'cnil.fr',
  'sante.fr',
  // Belgium, Netherlands, Luxembourg
  'ccb.belgium.be',
  'be.brussels',
  'vlaanderen.be',
  'en.kerkrade.nl',
  'vdl.lu',
  // Ireland
  'fraudsmart.ie',
  'bpfi.ie',
  'centralbank.ie',
  'ccpc.ie',
  'hse.ie',
  // Italy, Portugal, Spain
  'carabinieri.it',
  'agcom.it',
  'bancaditalia.it',
  'minori.gov.it',
  'gnr.pt',
  'bportugal.pt',
  'bde.es',
  'boe.es',
  'cnmc.es',
  'sanidad.gob.es',
  'caib.es',
  // Poland (cert.pl deliberately with its subdomains: moje., wiedza., incydent. are all CERT Polska)
  'cert.pl',
  'nask.pl',
  'policja.pl',
  'policja.gov.pl',
  // Sweden
  'polisen.se',
  'konsumentverket.se',
  'krisinformation.se',
  'konsumenternasbankochfinansbyra.se',
  'ki.se',
];

/**
 * Link targets on the "Where to report and get help" screen (content/help/where-to-report.en.yaml, T-4.2).
 * Matched on the EXACT hostname (SOURCE_HOSTS.md: "Match on exact hostname, not suffix"): a help link may only
 * go to a page fraud-researcher opened on one of these hosts. Adding a host here is a sceptic-reviewed change.
 */
export const HELP_LINK_HOSTS: readonly string[] = [
  'www.europol.europa.eu',
  'www.eccnet.eu',
  'www.police.be',
  'www.fsma.be',
  'www.bundesnetzagentur.de',
  'www.incibe.es',
  'clientebancario.bde.es',
  '17cyber.gouv.fr',
  'www.cybermalveillance.gouv.fr',
  'centralbank.ie',
  'politie.nl',
  // CERT Polska incident-report portal (help link only; SOURCE_HOSTS.md "Hosts used only in" the help file).
  'incydent.cert.pl',
];

/** Domains of the e-mail addresses the help screen shows (exact match, same rule as HELP_LINK_HOSTS). */
export const HELP_EMAIL_DOMAINS: readonly string[] = ['safeonweb.be'];

/** True when `url` is an https URL whose hostname is exactly one of `hosts`. */
export function isHelpLinkHost(url: string, hosts: readonly string[] = HELP_LINK_HOSTS): boolean {
  try {
    return hosts.includes(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Source hosts matched on the EXACT hostname only (no subdomains): hosts under a parent domain too broad to allow
 * as a suffix (gov.pt, gov.pl, belgium.be; SOURCE_HOSTS.md "exact host only"). T-4.2 review.
 */
export const SOURCE_HOST_EXACT: readonly string[] = ['www.gov.pt', 'portugal.gov.pt', 'samorzad.gov.pl', 'news.belgium.be'];

export function isAllowedSourceHost(url: string, allowlist: readonly string[] = SOURCE_HOST_ALLOWLIST, exact: readonly string[] = SOURCE_HOST_EXACT): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return exact.includes(host) || allowlist.some((a) => host === a || host.endsWith(`.${a}`));
  } catch {
    return false;
  }
}
