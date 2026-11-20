/**
 * "Where to report and get help" (T-4.2): per-country cards from content/help/where-to-report.en.yaml, in the
 * WHERE_TO_REPORT §3c order (src/content/help.ts), used by the scene player's help view and the end screen.
 *
 * - The player picks a country in a native <select> (label "Your country"); the default is "EU / other country".
 *   The choice lives in the existing save (settings.helpCountry) through HelpCountryContext; without a provider
 *   (tests, harness) it is kept in local state only.
 * - Every row shows "Checked on <date>". Links open the official page in a new tab with rel="noopener noreferrer"
 *   and the URL exactly as verified (no parameters added). The game never fetches them: they are plain links the
 *   player may click. Phone numbers and e-mail addresses are plain text.
 * - review_note and sources never reach the bundle (scripts/lib/yaml-module.ts), so they cannot be rendered.
 * - If the bundled data is missing or malformed, the generic list (GenericHelpList) is shown instead.
 */
import { createContext, type ComponentChildren } from 'preact';
import { useContext, useId, useState } from 'preact/hooks';
import { checkedDate, countryName, helpCountries, helpData, helpGroups, knownCountry, linkHost, type HelpData, type HelpGroup, type HelpGroupKind, type HelpRow } from '../content/help.ts';
import { HELP_LINK_REL, HELP_LINK_TARGET } from '../content/constants.ts';
import { t, type MessageKey } from '../i18n/index.ts';
import styles from './Help.module.css';

export interface HelpCountryApi {
  country: string | null;
  setCountry: (country: string | null) => void;
}

/** Provided by the app from the save; null means "no provider" (local state). */
export const HelpCountryContext = createContext<HelpCountryApi | null>(null);

export function HelpCountryProvider({ country, onChange, children }: { country: string | null; onChange: (c: string | null) => void; children: ComponentChildren }) {
  return <HelpCountryContext.Provider value={{ country, setCountry: onChange }}>{children}</HelpCountryContext.Provider>;
}

/** The generic list (before T-4.2, and the fallback when the help data is unavailable). Sensitive scenes put "talk to someone" first [P]. */
export function GenericHelpList({ sensitive = false }: { sensitive?: boolean }) {
  const talk = <li key="talk">{t('help_talk')}</li>;
  return (
    <ul class={styles.generic}>
      {sensitive ? talk : null}
      <li key="bank">{t('help_bank')}</li>
      <li key="police">{t('help_police')}</li>
      <li key="consumer">{t('help_consumer')}</li>
      <li key="platform">{t('help_platform')}</li>
      {sensitive ? null : talk}
    </ul>
  );
}

const GROUP_HEADING: Record<Exclude<HelpGroupKind, 'crisis'>, MessageKey> = {
  bank: 'help_group_bank',
  report: 'help_group_report',
  support: 'help_group_support',
  child: 'help_group_child',
};

type Level = 2 | 3;

function Heading({ level, id, children }: { level: Level; id: string; children: ComponentChildren }) {
  return level === 2 ? <h2 id={id} class={styles.groupHeading}>{children}</h2> : <h3 id={id} class={styles.groupHeading}>{children}</h3>;
}

function Row({ row, showName, nameLevel }: { row: HelpRow; showName: boolean; nameLevel: 3 | 4 }) {
  const Name = nameLevel === 3 ? 'h3' : 'h4';
  return (
    <li class={styles.row} data-help-row={row.id} data-help-fallback={row.fallback ? '' : undefined}>
      {showName && row.name ? <Name class={styles.rowName}>{row.name}</Name> : null}
      <p class={styles.body}>{row.body}</p>
      {row.phones ? (
        <ul class={styles.phones}>
          {row.phones.map((p) => (
            <li key={p.number}>
              <span class={styles.number}>{p.number}</span> <span class={styles.label}>{p.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {row.email ? <p class={styles.email}>{t('help_email', { email: row.email })}</p> : null}
      {row.scope ? <p class={styles.scope}>{row.scope}</p> : null}
      {row.url ? (
        <p class={styles.linkLine}>
          <a class={styles.link} href={row.url} target={HELP_LINK_TARGET} rel={HELP_LINK_REL}>
            {t('help_link', { host: linkHost(row.url) })} <span class={styles.vh}>{t('help_new_tab')}</span>
          </a>
        </p>
      ) : null}
      <p class={styles.checked} data-help-checked="">
        {t('help_checked', { date: checkedDate(row.checked) })}
      </p>
    </li>
  );
}

function Group({ group, level, idBase }: { group: HelpGroup; level: Level; idBase: string }) {
  const id = `${idBase}-${group.kind}`;
  const nameLevel = (level + 1) as 3 | 4;
  if (group.kind === 'crisis') {
    // Its own calm row (§3c): the row's fixed title is the heading; nothing else shares the section.
    return (
      <section class={`${styles.group} ${styles.crisis}`} aria-labelledby={id} data-help-group="crisis">
        <Heading level={level} id={id}>
          {group.rows[0]?.name ?? ''}
        </Heading>
        <ul class={styles.rows}>
          {group.rows.map((r) => (
            <Row key={r.id} row={r} showName={false} nameLevel={nameLevel} />
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section class={styles.group} aria-labelledby={id} data-help-group={group.kind}>
      <Heading level={level} id={id}>
        {t(GROUP_HEADING[group.kind])}
      </Heading>
      <ul class={styles.rows}>
        {group.rows.map((r) => (
          <Row key={r.id} row={r} showName={true} nameLevel={nameLevel} />
        ))}
      </ul>
    </section>
  );
}

export interface HelpCardsProps {
  /** Sensitive scenes ("Need to talk?") put support, child and crisis first (§3c). */
  sensitive?: boolean;
  /** Heading level of the group headings: 2 under the scene help h1, 3 under the end screen's h2. */
  level?: Level;
  /** Test seam: the help data (defaults to the bundled file). */
  data?: HelpData | null;
}

/** Country picker and cards. Falls back to the generic list when the data is unavailable. */
export function HelpCards({ sensitive = false, level = 2, data = helpData() }: HelpCardsProps) {
  const shared = useContext(HelpCountryContext);
  const [local, setLocal] = useState<string | null>(null);
  const idBase = `help${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  if (!data) {
    return (
      <>
        <p>{t('help_intro')}</p>
        <GenericHelpList sensitive={sensitive} />
      </>
    );
  }
  const country = knownCountry(data, shared ? shared.country : local);
  const setCountry = shared ? shared.setCountry : setLocal;
  const countries = helpCountries(data)
    .map((code) => ({ code, name: countryName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const groups = helpGroups(data, country, sensitive ? 'sensitive' : 'scam');
  return (
    <div class={styles.help} data-help-cards="" data-help-country={country ?? 'EU'}>
      <p>{data.meta.intro}</p>
      <div class={styles.picker}>
        <label for={`${idBase}-country`}>{t('help_country_label')}</label>
        <select
          id={`${idBase}-country`}
          class={styles.select}
          value={country ?? ''}
          onChange={(e) => {
            const v = (e.currentTarget as HTMLSelectElement).value;
            setCountry(v === '' ? null : v);
          }}
        >
          <option value="">{t('help_country_eu')}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <p class={styles.note}>{data.meta.disclaimer}</p>
      <p class={styles.note}>{data.meta.external_links_note}</p>
      {/* §3c: the crisis row is the last card on the scam screen; nothing follows the cards. */}
      {groups.map((g) => (
        <Group key={g.kind} group={g} level={level} idBase={idBase} />
      ))}
    </div>
  );
}
