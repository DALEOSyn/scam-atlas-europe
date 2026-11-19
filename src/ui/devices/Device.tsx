/**
 * Simulated devices (UI_SPEC §3): mail, SMS, messenger (Kettle / Wordswap), social post, call,
 * browser (training pages), QR camera, banking app, sign-in prompt, letter (only as the carrier of
 * a QR code or URL, Red Line 8), plus in-beat banners.
 *
 * The game's own generic phone and laptop: no real OS, mail client, messenger or browser look-alike
 * (Red Line 1). Every visible element of the beat on screen is a Checkable; elements of earlier beats
 * render as plain text. Device content is always rendered as text, never as HTML.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { brandById, brandForName } from '../../content/brands.ts';
import type { Device, Message } from '../../content/schema.ts';
import type { ActionView } from '../../engine/runner.ts';
import { t } from '../../i18n/index.ts';
import { Checkable } from '../check/Check.tsx';
import { Icon } from '../Icon.tsx';
import { Host, RichText } from '../RichText.tsx';
import { DemoField, SimPill, SimulatedForm } from '../SimulatedForm.tsx';
import { hostParts, segmentMessage } from '../text.ts';
import { Avatar, BrandBar, Chips, LaptopFrame, MessageBody, PhoneFrame, Segments, Translate } from './parts.tsx';
import { QrGraphic } from './QrGraphic.tsx';
import type { DeviceProps } from './types.ts';
import styles from './devices.module.css';

/** Descriptive heading of a beat (focus target on arrival, UI_SPEC §10.3). */
export function deviceHeading(device: Device, m: Message): string {
  const from = m.sender?.display ?? '';
  switch (device) {
    case 'email':
      return t('heading_email', { from });
    case 'sms':
      return t('heading_sms', { from });
    case 'messenger':
      return t('heading_chat', { from });
    case 'social':
      return t('heading_social', { from });
    case 'call':
      return t('heading_call', { from });
    case 'browser':
      return t('heading_browser', { page: m.page?.title ?? m.page?.address ?? '' });
    case 'qr':
      return t('heading_qr');
    case 'banking':
      return t('heading_banking', { payee: m.payee?.name ?? '' });
    case 'auth':
      return t('heading_auth', { service: m.prompt?.service ?? '' });
    case 'letter':
      return t('heading_letter', { from: m.letterhead ?? '' });
  }
}

/** Requests that put a form on the page; the page's own button triggers the matching authored action. */
const FORM_KINDS: Record<string, readonly string[]> = {
  log_in: ['enter_details'],
  enter_details: ['enter_details'],
  share_code: ['share_code'],
  pay: ['pay', 'pay_unprotected', 'pay_protected'],
};

function formAction(m: Message, actions: readonly ActionView[]): ActionView | undefined {
  const kinds = FORM_KINDS[m.request];
  return kinds ? actions.find((a) => kinds.includes(a.kind)) : undefined;
}

function TrainingForm({ m, actions, canAct, onAct, idPrefix }: { m: Message; actions: readonly ActionView[]; canAct: boolean; onAct: (id: string) => void; idPrefix: string }) {
  const target = formAction(m, actions);
  const live = !!target && canAct;
  const fields =
    m.request === 'pay'
      ? [
          { label: t('demo_card'), value: '4000 •••• •••• 0002', spoken: t('demo_card_spoken') },
          { label: t('demo_expiry'), value: '•• / ••', spoken: t('demo_hidden') },
        ]
      : m.request === 'share_code'
        ? [
            { label: t('demo_phone'), value: '••• ••• ••00', spoken: t('demo_hidden') },
            { label: t('demo_code'), value: '••••••', spoken: t('demo_hidden') },
          ]
        : m.request === 'enter_details'
          ? [
              { label: t('demo_name'), value: t('demo_name_value') },
              { label: t('demo_card'), value: '4000 •••• •••• 0002', spoken: t('demo_card_spoken') },
            ]
          : [
              { label: t('demo_username'), value: t('demo_username_value') },
              { label: t('demo_password'), value: '••••••••', spoken: t('demo_hidden') },
            ];
  const label = m.request === 'pay' ? t('form_pay') : m.request === 'share_code' ? t('form_confirm') : m.request === 'enter_details' ? t('form_continue') : t('form_sign_in');
  return (
    <SimulatedForm label={t('form_label')} onSimulatedSubmit={() => live && target && onAct(target.id)}>
      {fields.map((f, i) => (
        <DemoField key={i} id={`${idPrefix}-f${i}`} label={f.label} value={f.value} spoken={f.spoken} />
      ))}
      {live ? (
        <button type="submit" class={styles.pageButton}>
          {label}
        </button>
      ) : (
        <button type="button" class={styles.pageButton} aria-disabled="true" aria-describedby="demo-note">
          {label}
        </button>
      )}
    </SimulatedForm>
  );
}

/** "Text message", "Email", "Chat message" … for a banner or notification from this channel. */
export function channelKind(device: Device): string {
  switch (device) {
    case 'auth':
      return t('banner_kind_auth');
    case 'email':
      return t('banner_kind_email');
    case 'banking':
      return t('banner_kind_banking');
    case 'messenger':
    case 'social':
      return t('banner_kind_chat');
    case 'call':
      return t('banner_kind_call');
    default:
      return t('banner_kind_sms');
  }
}

/**
 * A notification inside the beat (code SMS, approval prompt). Displayed evidence only: no checkables
 * (the beat's request checkable is the scam's ask, ruling QA L1). Foreign text has its own lang and
 * Translate toggle (QA M1).
 */
function Banner({ banner, beatId, onTranslation, alwaysTranslate }: { banner: NonNullable<DeviceProps['banner']>; beatId: string; onTranslation: (open: boolean) => void; alwaysTranslate: boolean }) {
  const m = banner.message;
  return (
    <div class={styles.deviceBanner} role="group" aria-label={t('banner_title')}>
      <p class={styles.bannerMeta}>
        {channelKind(banner.device)}
        {m.sender ? ` · ${m.sender.display}` : ''}
      </p>
      <p class={styles.bannerBody} lang={m.lang}>
        <RichText text={m.body ?? ''} />
      </p>
      <Translate message={m} id={`banner-translation-${beatId}`} onFreeze={onTranslation} alwaysOpen={alwaysTranslate} />
    </div>
  );
}

/** Follow-ups shown as notifications, each with its own channel and sender (QA M2). */
function Notifications({ pushers, onTranslation, alwaysTranslate }: { pushers: DeviceProps['pushers']; onTranslation: (open: boolean) => void; alwaysTranslate: boolean }) {
  if (pushers.length === 0) return null;
  return (
    <ul class={styles.notifications} aria-label={t('pusher_from')}>
      {pushers.map((p) => (
        <li key={p.index} class={styles.notification} data-pusher={p.device}>
          <span class={styles.bannerMeta}>
            {channelKind(p.device)}
            {p.sender ? ` · ${p.sender}` : ''}
          </span>
          <span class={styles.bannerBody} lang={p.lang}>
            <RichText text={p.text} />
          </span>
          <Translate message={p} id={`pusher-translation-${p.index}`} onFreeze={onTranslation} alwaysOpen={alwaysTranslate} />
        </li>
      ))}
    </ul>
  );
}

/** A caller's spoken follow-up as its own transcript line: "Caller: …" prefix and outer quotes dropped (QA M2). */
export function spokenText(text: string): string {
  const label = t('call_caller').replace(/:\s*$/u, '').toLowerCase();
  let out = text.trim();
  if (out.toLowerCase().startsWith(`${label}:`)) out = out.slice(label.length + 1).trim();
  const m = /^["“„](.*)["”“]$/su.exec(out);
  return m?.[1] ?? out;
}

/** Earlier texts of the thread (ruling QA L5): muted, never checkable, links as plain text, no actions. */
function Earlier({ items, onTranslation, alwaysTranslate }: { items: NonNullable<Message['earlier']>; onTranslation: (open: boolean) => void; alwaysTranslate: boolean }) {
  return (
    <>
      <p class={styles.earlierSep}>{t('thread_earlier')}</p>
      {items.map((e, i) => (
        <div key={i} class={styles.earlier} data-earlier="">
          <span class={styles.earlierWhen}>{e.when}</span>
          {/* RichText: hosts follow §1.5 (sceptic T-2.8); still plain text, never a link or a checkable. */}
          <div class={styles.bubbleIn} lang={e.lang}>
            <RichText text={e.body} />
          </div>
          <Translate message={e} id={`earlier-translation-${i}`} onFreeze={onTranslation} alwaysOpen={alwaysTranslate} />
        </div>
      ))}
    </>
  );
}

function ImageBox({ alt }: { alt: string }) {
  return (
    <Checkable target="image" class={styles.imageBox}>
      <Icon name="camera" />
      <span>{alt}</span>
    </Checkable>
  );
}

// ---------------------------------------------------------------------------

function Mail(p: DeviceProps) {
  const m = p.message;
  const display = m.sender?.display ?? '';
  const rows = [...p.thread.filter((x) => x.device === 'email').map((x) => x.message), m];
  const segs = segmentMessage(m);
  return (
    <LaptopFrame label={t('region_mail')}>
      <div class={styles.mail}>
        <div class={styles.inbox}>
          <p class={styles.paneTitle}>{t('mail_inbox')}</p>
          <ul class={styles.inboxList}>
            {rows.map((r, i) => (
              <li key={i} class={r === m ? `${styles.inboxRow} ${styles.selected}` : styles.inboxRow} aria-current={r === m ? 'true' : undefined}>
                <Avatar name={r.sender?.display ?? '?'} size={32} />
                <span class={styles.inboxText}>
                  <strong>{r.sender?.display}</strong>
                  {r === m ? <span class={styles.vh}> {t('mail_unread')}</span> : null}
                  <span class={styles.inboxSubject}>{r.subject}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <article class={styles.reading} lang={m.lang}>
          <h3 class={styles.subject}>{m.subject}</h3>
          <div class={styles.senderLine}>
            <Avatar name={display} />
            <span>
              <Checkable target="sender.detail">
                <strong>{display}</strong>
              </Checkable>{' '}
              <span class={styles.muted}>{t('mail_to_me')}</span>
            </span>
          </div>
          <MessageBody message={m} collapse />
          {m.attachments?.length ? (
            <ul class={styles.chips}>
              {m.attachments.map((a, i) => (
                <li key={i}>
                  <Checkable target={i === 0 ? 'attachment' : `attachment#${i + 1}`} class={styles.attachment}>
                    <Icon name="attach" />
                    <span>{a.name}</span>
                    {a.size ? <span class={styles.muted}>{a.size}</span> : null}
                  </Checkable>
                </li>
              ))}
            </ul>
          ) : null}
          <Chips items={segs.leftover} />
          {m.image ? <ImageBox alt={m.image.alt} /> : null}
          <Translate message={m} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
        </article>
      </div>
    </LaptopFrame>
  );
}

function Chat(p: DeviceProps) {
  const m = p.message;
  const display = m.sender?.display ?? '';
  const segs = segmentMessage(m);
  const arc = p.scenario.role === 'arc' && p.scenario.brands.includes('wordswap');
  const app = p.device === 'messenger' ? brandById(arc ? 'wordswap' : 'kettle') : undefined;
  const region = p.device === 'sms' ? t('region_sms') : p.device === 'social' ? t('region_social') : t('region_chat', { app: app?.name ?? '' });
  const sender =
    m.sender && p.device !== 'social' ? (
      <div class={styles.chatHead}>
        {p.device === 'sms' ? <Icon name="back" class={styles.inert} /> : null}
        {m.image && p.device === 'messenger' ? (
          <Checkable target="image" name={m.image.alt} class={styles.avatarButton}>
            <Avatar name={display} />
          </Checkable>
        ) : (
          <Avatar name={display} />
        )}
        <span class={styles.chatTitle}>
          <Checkable target="sender.detail">
            <strong>{display}</strong>
          </Checkable>
          <span class={styles.muted}>{p.device === 'sms' ? t('sms_sub') : t('chat_sub')}</span>
        </span>
      </div>
    ) : null;
  return (
    <PhoneFrame label={region} brand={app?.id}>
      {app ? <BrandBar brand={app} title={app.name} /> : null}
      {sender}
      {p.banner ? <Banner banner={p.banner} beatId={p.beatId} onTranslation={p.onTranslation} alwaysTranslate={p.alwaysTranslate} /> : null}
      <div class={styles.chat}>
        {m.earlier?.length && p.device !== 'social' ? <Earlier items={m.earlier} onTranslation={p.onTranslation} alwaysTranslate={p.alwaysTranslate} /> : null}
        <p class={styles.daySep}>{t('chat_today')}</p>
        {p.device === 'social' ? (
          <article class={styles.post}>
            <div class={styles.postHead}>
              <Avatar name={display} />
              <span class={styles.chatTitle}>
                <Checkable target="sender.detail">
                  <strong>{display}</strong>
                </Checkable>
                <span class={styles.muted}>{t('social_sponsored')}</span>
              </span>
            </div>
            {m.image ? <ImageBox alt={m.image.alt} /> : null}
            <MessageBody message={m} />
            <Chips items={segs.leftover} />
            <Translate message={m} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
          </article>
        ) : (
          <>
            {p.thread
              .filter((x) => x.device === p.device)
              .map((x) => (
                <div key={x.id} class={styles.bubbleIn}>
                  <RichText text={x.message.body ?? ''} />
                </div>
              ))}
            <div class={styles.bubbleIn}>
              <MessageBody message={m} />
              <Chips items={segs.leftover} />
              {m.image && p.device !== 'messenger' ? <ImageBox alt={m.image.alt} /> : null}
            </div>
            <Translate message={m} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
            {/* Pusher follow-ups are ordinary bubbles with no "follow-up" label (UI_SPEC §3.2). */}
            {p.pushers
              .filter((x) => x.device === p.device)
              .map((x) => (
                <div key={`p${x.index}`} class={styles.bubbleWrap}>
                  <div class={styles.bubbleIn} lang={x.lang}>
                    <RichText text={x.text} />
                  </div>
                  <Translate message={x} id={`pusher-translation-${x.index}`} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
                </div>
              ))}
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

function Call(p: DeviceProps) {
  const m = p.message;
  const display = m.sender?.display ?? '';
  const stage = p.call;
  const segs = segmentMessage(m);
  const lines = m.transcript ?? [];
  const shown = stage?.shown ?? lines.length;
  const answered = stage?.answered ?? true;
  const ended = stage?.ended ?? false;
  // After Answer the Answer button is gone: focus moves to the transcript heading (QA B2).
  const transcriptRef = useRef<HTMLHeadingElement>(null);
  const wasAnswered = useRef(answered);
  useEffect(() => {
    if (answered && !wasAnswered.current && !ended) transcriptRef.current?.focus();
    wasAnswered.current = answered;
  }, [answered, ended]);
  // Step-through: the last "Next line" press unmounts the button, so focus moves to the line it
  // revealed instead of falling to <body> (QA R1).
  const lastLineRef = useRef<HTMLLIElement>(null);
  const focusLast = useRef(false);
  const nextLine = () => {
    focusLast.current = shown + 1 >= lines.length;
    p.onNextLine();
  };
  // Layout effect: focus lands in the same commit that removes the button, never via <body>.
  useLayoutEffect(() => {
    if (focusLast.current && shown >= lines.length) {
      focusLast.current = false;
      lastLineRef.current?.focus();
    }
  }, [shown, lines.length]);
  return (
    <PhoneFrame label={t('region_call')}>
      <div class={styles.call}>
        <div class={styles.caller}>
          <Avatar name={display} size={64} />
          <Checkable target="caller_id" class={styles.callerName}>
            {display}
          </Checkable>
          <span class={styles.callerSub}>{ended ? t('call_ended') : answered ? t('call_in_progress') : t('call_incoming')}</span>
        </div>
        {p.banner && answered ? <Banner banner={p.banner} beatId={p.beatId} onTranslation={p.onTranslation} alwaysTranslate={p.alwaysTranslate} /> : null}
        {!answered && !ended ? (
          <div class={styles.callButtons}>
            <button type="button" class={styles.round} onClick={p.onAnswer}>
              <Icon name="phone-answer" size={28} />
              <span>{t('call_answer')}</span>
            </button>
            {p.onDecline ? (
              <button type="button" class={styles.round} onClick={p.onDecline}>
                <Icon name="phone-end" size={28} />
                <span>{t('call_decline')}</span>
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <h3 class={styles.transcriptHead} id="transcript-h" ref={transcriptRef} tabIndex={-1}>
              {t('call_transcript')}
            </h3>
            <div role="log" aria-labelledby="transcript-h">
            <ol class={styles.transcript}>
              {lines.slice(0, shown).map((l, i) => (
                <li key={i} ref={i === shown - 1 ? lastLineRef : undefined} tabIndex={i === shown - 1 ? -1 : undefined}>
                  <span class={styles.speaker}>{l.speaker === 'caller' ? t('call_caller') : t('call_you')}</span> <Segments segs={segs.transcript[i] ?? []} />
                </li>
              ))}
              {/* The caller's spoken follow-ups are call lines, not text messages (QA M2). */}
              {shown >= lines.length
                ? p.pushers
                    .filter((x) => x.device === 'call')
                    .map((x) => (
                      <li key={`p${x.index}`} data-pusher="call" lang={x.lang}>
                        <span class={styles.speaker}>{t('call_caller')}</span> <RichText text={spokenText(x.text)} />
                        <Translate message={{ lang: x.lang, translation: x.translation ? spokenText(x.translation) : undefined }} id={`pusher-translation-${x.index}`} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
                      </li>
                    ))
                : null}
            </ol>
            </div>
            {stage && stage.step && shown < lines.length && !ended ? (
              <button type="button" class={styles.pageButton} onClick={nextLine}>
                {t('call_next_line')}
              </button>
            ) : null}
            <Chips items={segs.leftover} />
          </>
        )}
      </div>
    </PhoneFrame>
  );
}

/**
 * Address bar text (UI_SPEC §3.5): the owner part is bold at all times and never wraps. Scheme and
 * subdomains truncate from the left behind a visible "…", the path from the right, so the owner part
 * always stays visible; under 320 CSS px only "…" + the owner part is shown (subdomain and path stay
 * in the Check card), and if the owner part is still wider, the bar (the address control itself)
 * scrolls sideways. The full address is the Checkable's accessible name.
 */
function AddressText({ address }: { address: string }) {
  const p = hostParts(address);
  const prefix = `${p.scheme}${p.local}${p.sub.join('')}`;
  const path = p.path.join('');
  return (
    <span class={styles.addr} aria-hidden="true">
      {prefix ? (
        <>
          <span class={styles.addrPrefix}>
            <span class={styles.addrLtr}>{prefix}</span>
          </span>
          <span class={styles.addrMore}>…</span>
        </>
      ) : null}
      <strong class={styles.addrOwner}>{p.owner}</strong>
      {path ? (
        <>
          <span class={styles.addrPath}>{path}</span>
          <span class={styles.addrMore}>…</span>
        </>
      ) : null}
    </span>
  );
}

function Browser(p: DeviceProps) {
  const m = p.message;
  const page = m.page;
  const form = !!FORM_KINDS[m.request];
  const brand = brandForName(page?.title);
  const segs = segmentMessage(m);
  return (
    <LaptopFrame label={form ? t('region_browser_training') : t('region_browser')}>
      <div class={styles.browser}>
        <div class={styles.chrome}>
          <Icon name="back" class={styles.inert} />
          <Checkable target="page.info" class={styles.pageInfo} name={t('element_page_info')}>
            <Icon name="lock" />
          </Checkable>
          <Checkable target="page.address" class={styles.address} name={page?.address}>
            {page ? <AddressText address={page.address} /> : null}
          </Checkable>
        </div>
        <div class={styles.page}>
          {form ? <SimPill /> : null}
          {brand ? <BrandBar brand={brand} title={page?.title ?? brand.name} /> : null}
          <div class={styles.pageBody}>
            {!brand && page?.title ? <h3 class={styles.pageTitle}>{page.title}</h3> : null}
            <MessageBody message={m} />
            <Chips items={segs.leftover} />
            {m.image ? <ImageBox alt={m.image.alt} /> : null}
            <Translate message={m} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
            {form ? <TrainingForm m={m} actions={p.actions} canAct={p.canAct} onAct={p.onAct} idPrefix="page" /> : null}
          </div>
        </div>
      </div>
    </LaptopFrame>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced') return true;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** QR camera: the code resolves only to an in-game route; nothing opens unless an authored action is chosen. */
function QrView({ m, chip = true }: { m: Message; chip?: boolean }) {
  const qr = m.qr;
  const [found, setFound] = useState(prefersReducedMotion());
  useEffect(() => {
    if (found) return undefined;
    const id = setTimeout(() => setFound(true), 600);
    return () => clearTimeout(id);
  }, [found]);
  if (!qr) return null;
  return (
    <div class={styles.qr}>
      <div class={styles.viewfinder} role="img" aria-label={t('qr_alt', { caption: qr.caption ?? t('qr_caption_default'), host: qr.destination })}>
        {qr.caption ? <p class={styles.qrCaption}>{qr.caption}</p> : null}
        <QrGraphic route={qr.payload} />
      </div>
      {chip ? (
        <p class={styles.qrChip} aria-live="polite">
          {found ? (
            <>
              <span>{t('qr_opens')} </span>
              <Checkable target="qr.destination">
                <Host text={qr.destination} />
              </Checkable>
            </>
          ) : (
            t('qr_scanning')
          )}
        </p>
      ) : null}
    </div>
  );
}

function Qr(p: DeviceProps) {
  return (
    <PhoneFrame label={t('region_qr')}>
      <div class={styles.camera}>
        <QrView m={p.message} />
        <MessageBody message={p.message} />
      </div>
    </PhoneFrame>
  );
}

function groupIban(iban: string): string {
  return iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

function Bank(p: DeviceProps) {
  const m = p.message;
  const payee = m.payee;
  const bank = brandById('larchwick');
  const segs = segmentMessage(m);
  const check = payee?.name_check;
  return (
    <PhoneFrame label={t('region_banking', { app: bank?.name ?? '' })} brand="larchwick">
      <BrandBar brand={bank} title={bank?.name ?? ''} sub={t('bank_payments')} />
      <div class={styles.bank}>
        <SimPill />
        <MessageBody message={m} />
        {payee ? (
          <div class={styles.transfer}>
            <div class={styles.field}>
              <span class={styles.fieldLabel}>{t('bank_payee')}</span>
              <Checkable target="payee.name_check" class={styles.fieldValue}>
                {payee.name}
              </Checkable>
            </div>
            {payee.iban ? (
              <div class={styles.field}>
                <span class={styles.fieldLabel}>{t('bank_iban')}</span>
                <Checkable target="payee.iban" class={`${styles.fieldValue} ${styles.mono}`}>
                  {groupIban(payee.iban)}
                </Checkable>
              </div>
            ) : null}
            {check ? (
              <p class={check === 'match' ? styles.nameOk : check === 'unavailable' ? styles.nameNeutral : styles.nameWarn} role="status">
                <Icon name={check === 'match' ? 'seal' : 'info'} />
                <span>
                  {check === 'match'
                    ? t('bank_name_match')
                    : check === 'mismatch'
                      ? t('bank_name_mismatch', { holder: payee.holder ?? '' })
                      : check === 'close_match'
                        ? t('bank_name_close', { holder: payee.holder ?? '' })
                        : t('bank_name_unavailable')}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}
        <Chips items={segs.leftover} />
        {m.request !== 'none' ? <TrainingForm m={{ ...m, request: 'pay' }} actions={p.actions} canAct={p.canAct} onAct={p.onAct} idPrefix="bank" /> : null}
      </div>
    </PhoneFrame>
  );
}

function Auth(p: DeviceProps) {
  const m = p.message;
  const pr = m.prompt;
  const app = brandById('gatewren');
  if (!pr) return null;
  const title = pr.type === 'signature' ? t('auth_title_signature') : pr.type === 'qr_login' ? t('auth_title_qr') : t('auth_title_sign_in');
  const question = pr.type === 'signature' ? t('auth_q_signature') : pr.type === 'qr_login' ? t('auth_q_qr') : t('auth_q_sign_in');
  const rows: [string, string, string][] = [
    ['prompt.where', t('auth_where'), pr.where],
    ['prompt.device', t('auth_device'), pr.device],
    ['prompt.when', t('auth_when'), pr.when],
  ];
  return (
    <PhoneFrame label={t('region_auth', { app: app?.name ?? '' })} brand="gatewren">
      <BrandBar brand={app} title={app?.name ?? ''} />
      <div class={styles.prompt}>
        <h3 class={styles.promptTitle}>{title}</h3>
        <p>
          <Checkable target="prompt.service">{pr.service}</Checkable>
        </p>
        <dl class={styles.promptRows}>
          {rows.map(([target, label, value]) => (
            <div key={target}>
              <dt>{label}</dt>
              <dd>
                <Checkable target={target}>{value}</Checkable>
              </dd>
            </div>
          ))}
        </dl>
        {pr.number !== undefined ? (
          <p class={styles.promptNumber}>
            {t('auth_number')}{' '}
            <Checkable target="prompt.number" class={styles.mono}>
              {String(pr.number)}
            </Checkable>
          </p>
        ) : null}
        <MessageBody message={m} />
        <p class={styles.promptQuestion}>{question}</p>
        <p class={styles.muted}>{t('auth_choose_below')}</p>
      </div>
    </PhoneFrame>
  );
}

function Letter(p: DeviceProps) {
  const m = p.message;
  const segs = segmentMessage(m);
  return (
    <section class={styles.table} aria-label={t('region_letter')}>
      <article class={styles.letter} aria-label={t('heading_letter', { from: m.letterhead ?? '' })} lang={m.lang}>
        <p class={styles.letterhead}>
          <Checkable target="letterhead">{m.letterhead}</Checkable>
        </p>
        <MessageBody message={m} />
        <Chips items={segs.leftover} />
        {m.qr ? <QrView m={m} /> : null}
        <Translate message={m} onFreeze={p.onTranslation} alwaysOpen={p.alwaysTranslate} />
      </article>
    </section>
  );
}

/** Is a follow-up from `from` shown inside the `on` device (chat bubble or call line)? */
function inDevice(on: Device, from: Device): boolean {
  return on === from && (on === 'sms' || on === 'messenger' || on === 'call');
}

export function DeviceView(p: DeviceProps) {
  const body = (() => {
    switch (p.device) {
      case 'email':
        return <Mail {...p} />;
      case 'sms':
      case 'messenger':
      case 'social':
        return <Chat {...p} />;
      case 'call':
        return <Call {...p} />;
      case 'browser':
        return <Browser {...p} />;
      case 'qr':
        return <Qr {...p} />;
      case 'banking':
        return <Bank {...p} />;
      case 'auth':
        return <Auth {...p} />;
      case 'letter':
        return <Letter {...p} />;
    }
  })();
  const chat = p.device === 'sms' || p.device === 'messenger';
  return (
    <div class={styles.stageInner} data-device={p.device}>
      <h2 class={styles.deviceHeading} id="device-heading" ref={p.headingRef} tabIndex={-1}>
        {p.heading}
      </h2>
      {/* Follow-ups from another channel arrive as notifications above the device; a chat's own follow-ups
          are bubbles, a caller's are call lines (QA M2). */}
      <Notifications onTranslation={p.onTranslation} alwaysTranslate={p.alwaysTranslate} pushers={p.pushers.filter((x) => !inDevice(p.device, x.device))} />
      {p.device !== 'call' && !chat && p.banner ? <Banner banner={p.banner} beatId={p.beatId} onTranslation={p.onTranslation} alwaysTranslate={p.alwaysTranslate} /> : null}
      {body}
    </div>
  );
}

