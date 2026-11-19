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
];

export function isAllowedSourceHost(url: string, allowlist: readonly string[] = SOURCE_HOST_ALLOWLIST): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowlist.some((a) => host === a || host.endsWith(`.${a}`));
  } catch {
    return false;
  }
}
