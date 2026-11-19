# Threat catalogue: scams, social engineering and malicious campaigns seen by people in Europe (T-R.1)

**Owner:** fraud-researcher · **Researched / accessed:** 2026-11-18 · **Status:** draft for review (backlog research, not a content change) · **Branch:** `research/campaign-catalogue`

**Purpose.** This is a backlog for extending *Scam Atlas: Europe* beyond chapters 0–10. It is not a set of scenarios. Each entry is written **from the defender's side**: what an ordinary person sees, the tells, and the habit that defeats it (Red Line 4). It contains no attack steps, tooling, commands or configuration.

**Scope.**
- **Part A** covers social engineering and fraud.
- **Part B** covers malware and technical campaigns *as users experience them* . Part B widens the *research backlog* to these campaigns (Roman's request, 2026-11-18). Roman approved Part B for scenarios on 2026-11-18 (DECISIONS.md, standing rules; CLAUDE.md Red Line 8): each Part B scenario still needs a digital vector the player can see and act on, and stays at the defender's level.
- Every entry hinges on a digital vector (Red Line 8). Offline-only frauds are listed at the end under "Excluded".
- Brands are described generically. Source titles in `content/sources.yaml` may contain real names, as references only (Red Line 1).

**How to read an entry.**
- **id**: kebab-case, stable. Pattern briefs, if written later, use `docs/patterns/<id>.md`.
- **Status:**
  - `used`: in the chapter plan. "ch0–1" means briefed and scenario ids exist (GDD §16–17). "planned" means named in GDD §18 / MAP, scenarios not yet written.
  - `briefed`: a pattern brief covers it, but no scenario uses it.
  - `candidate`: new.
- **Fit:** fit for the game. *High* = playable in an existing device (sms, email, messenger, call, browser, app, QR) with a clear decision and habit. *Medium* = playable with caveats. *Low* = mostly invisible to a normal user, too sensitive, or too close to offline.
- **Reported in:** countries where a source in this session describes it. This is **not** a ranking, and the absence of a country means only "not checked". The MAP rule applies: never compare countries on screen.
- **ATT&CK:** MITRE ATT&CK technique ids (content v20.1), used as a **taxonomy only** (US, non-EU, tier 4 in our registry). They never count as evidence of European prevalence. Ids were checked on attack.mitre.org this session. Note: in v20, *Impersonation* moved from T1656 to **T1684.001** (Social Engineering: Impersonation) [int-mitre-attack-t1684].
- **Conf.:** confidence in the European evidence. *High*: recent official national or EU source specific to the pattern. *Medium*: official but older, generic or EU-level only. *Low*: news or non-EU only, or inferred.
- **Sources:** ids in `content/sources.yaml`. All are labelled `campaign-catalogue`.

---

## Summary

### Counts by family and status

| Part | Family | Entries | used (ch0–1) | used (planned) | briefed | candidate |
|---|---|---|---|---|---|---|
| A | A1 Credential phishing | 4 | 2 | 0 | 0 | 2 |
| A | A2 Payment & card data phishing | 4 | 3 | 0 | 0 | 1 |
| A | A3 Account takeover & code theft | 4 | 1 | 1 | 1 | 1 |
| A | A4 Impersonation calls & approvals (vishing) | 7 | 1 | 4 | 0 | 2 |
| A | A5 Investment, crypto & loans | 5 | 0 | 3 | 0 | 2 |
| A | A6 Romance & family impersonation | 3 | 0 | 3 | 0 | 0 |
| A | A7 Marketplaces & fake shops | 3 | 0 | 1 | 0 | 2 |
| A | A8 Jobs, identity misuse & money mules | 5 | 0 | 2 | 0 | 3 |
| A | A9 Tech support & remote access | 4 | 0 | 1 | 0 | 3 |
| A | A10 CEO fraud, BEC & payee changes | 4 | 0 | 2 | 0 | 2 |
| A | A11 Government services, authorities & e-ID | 4 | 0 | 0 | 0 | 4 |
| A | A12 Charity & humanitarian | 1 | 0 | 0 | 0 | 1 |
| A | A13 Travel, rentals & tickets | 3 | 0 | 2 | 0 | 1 |
| A | A14 QR codes (quishing) | 3 | 0 | 1 | 0 | 2 |
| A | A15 Teen, gaming & sextortion | 4 | 0 | 0 | 0 | 4 |
| **A** | **Part A total** | **58** | **7** | **20** | **1** | **30** |
| B | B1 Malware delivery | 6 | 0 | 0 | 0 | 6 |
| B | B2 Fake & malicious mobile apps | 4 | 0 | 0 | 0 | 4 |
| B | B3 Credential, session & MFA attacks | 6 | 0 | 0 | 0 | 6 |
| B | B4 Ransomware & extortion | 2 | 0 | 0 | 0 | 2 |
| B | B5 Networks, home devices & surveillance | 3 | 0 | 0 | 0 | 3 |
| B | B6 Supply chain | 1 | 0 | 0 | 0 | 1 |
| B | B7 Availability & hacktivism | 2 | 0 | 0 | 0 | 2 |
| B | B8 Data exposure | 2 | 0 | 0 | 0 | 2 |
| B | B9 Information manipulation | 1 | 0 | 0 | 0 | 1 |
| B | B10 Resource abuse | 1 | 0 | 0 | 0 | 1 |
| **B** | **Part B total** | **28** | **0** | **0** | **0** | **28** |
| | **Grand total** | **86** | **7** | **20** | **1** | **58** |

Fit across the 58 candidates:
- **high 27**;
- **medium 17** (3 of them rated medium–high);
- **low 14** (1 rated low–medium). Low covers invisible, sensitive and help-card-only entries.

### Top 15 candidates for future chapters (both parts)

| # | id | Part | Why (one line) |
|---|---|---|---|
| 1 | `qr-code-in-email` | A14 | One decision ("scan or open the site yourself"), official IE guidance, and ENISA lists quishing; reuses the QR device. |
| 2 | `fake-police-email-summons` | A11 | Belgian federal police (June 2026) and Europol warnings; strong "authorities never demand payment by email" habit; adults. |
| 3 | `clickfix-fake-fix-prompt` | B1 | ENISA 2026 calls it increasing. The rule is simple and absolute ("no website asks you to press keys and paste"); fits the browser device. |
| 4 | `fake-job-identity-video-ident` | A8 | German consumer centre (Aug 2026). Hits students. The habit is "never do a video ID check or open an account for an employer". |
| 5 | `fake-bank-app-card-tap` | B2 | CERT Polska (Nov 2025). The call + SMS + "install this app, tap your card" chain is playable; the habit is official stores only and calling back. |
| 6 | `ticket-resale-scam` | A13 | Swiss NCSC and ECC Belgium; high teen and adult relevance; seller-side variant too. |
| 7 | `data-breach-follow-up` | B8 | CNIL guidance gives a player-visible "you're in a breach, now what" angle, plus follow-up phishing and fake "check if you're affected" sites. |
| 8 | `aitm-phishing-code-relay` | B3 | Teaches that a login code does not save you on a fake page; CERT Polska's "password manager won't autofill" tell and passkeys. |
| 9 | `fake-loan-advance-fee` | A5 | FSMA H1 2026: about 20% of fraud complaints. Simple habit: never pay a fee to get a loan; check the register. |
| 10 | `messenger-stock-tips-group` | A5 | FSMA: more than EUR 2m of losses in H1 2026; a messenger-group device fits; ties to the Dublin regulator-register habit. |
| 11 | `social-giveaway-data-harvest` | A2 | Consumer centre (May 2026); very teen-relevant; easy checks (page age, no imprint, "tag friends"). |
| 12 | `malvertising-fake-download` | B1 | ENISA and Europol name malvertising. "The top search result isn't the official site" is a transferable habit. |
| 13 | `gaming-account-phishing` | A15 | Teen audience (14+); police booklet. "Never share login codes, even with friends", and fake "game maker" emails. |
| 14 | `credential-stuffing-password-reuse` | B3 | Player-visible ("someone logged in to your shop account"); CNIL habit: unique passwords + manager + MFA. |
| 15 | `sim-swap-number-hijack` | A3 | ENISA: "no signal" as the tell, plus calling the operator. Links to Stockholm/Madrid code lessons. Older source (2021). |

Runners-up: `browser-popup-scareware`, `gov-refund-phishing`, `malicious-browser-extension`, `public-wifi-evil-twin`, `fake-shop-social-ad`.

---

# Part A: Social engineering and fraud

## A1 Credential phishing

**A1.1 `email-phishing-credential`**: email phishing for a password
- **Sees:** an email styled like a provider says the account is at risk, and a button leads to a look-alike login page.
- **Channel:** email (also SMS and messenger). **Audience:** all. **ATT&CK:** T1566.002, T1204.001.
- **Red flags:** you didn't start it; the sender address and real link domain don't match; urgency. A padlock or correct spelling proves nothing.
- **Habit:** open the app or type the address yourself.
- **Reported in:** EU-wide (ENISA), DE, IE. **Status:** used (ch0–1: 0-6 beat 1, shared with A1.2; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** eu-enisa-etl-2026, de-bsi-protect-phishing, ie-ncsc-phishing-guide.

**A1.2 `it-portal-credential-phishing`**: "mailbox full" or "new portal" at work
- **Sees:** a workplace email says the mailbox is full or asks you to log in to a new portal. "IT" may follow up by chat or call.
- **Channel:** email → messenger → call. **Audience:** adult, business. **ATT&CK:** T1566.002, T1566.004, T1684.001.
- **Red flags:** unsolicited login request; an "IT" contact you can't verify; a request to read out a code.
- **Habit:** open the portal yourself, or ask a colleague through a known channel.
- **Reported in:** ES, PL, EU-wide. **Status:** used (ch0–1: 0-2, 0-6; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** es-incibe-mailbox-full-2022, eu-enisa-etl-2026, pl-cert-fake-consultants.

**A1.3 `thread-hijack-reply-phishing`**: phishing inside a real email conversation
- **Sees:** a reply appears in a genuine ongoing thread (with a supplier, landlord or club) with a link or "updated document".
- **Channel:** email. **Audience:** adult, business. **ATT&CK:** T1566.002, T1586 (compromised account).
- **Red flags:** the thread is real but the request is new (log in, pay, open); slight change in tone or sender address.
- **Habit:** a familiar thread proves nothing. Confirm unexpected requests by phone on a number you already have.
- **Reported in:** EU-wide. **Status:** candidate. **Fit:** high. **Suggested:** Paris variant (pairs with invoice change) or a new business-themed chapter. **Conf.:** Medium (EU factsheet only, no national figure).
- **Sources:** eu-esas-ai-scams-factsheet-nl.

**A1.4 `social-badge-or-account-warning`**: fake "get verified" or "account warning" on a social platform
- **Sees:** a message or ad offers a paid verification badge, or warns that the profile has a problem and must be confirmed via a link.
- **Channel:** social media DM or ad. **Audience:** teen, adult (creators, small businesses). **ATT&CK:** T1566.003, T1684.001.
- **Red flags:** offers to buy a badge (the consumer centre calls these "often a trap"); links outside the app; new pages with few posts and no imprint.
- **Habit:** check account status only inside the app's own settings, and turn on two-step login.
- **Reported in:** DE. **Status:** candidate. **Fit:** medium. **Suggested:** teen-focused chapter or Amsterdam pre-scene. **Conf.:** Low–Medium (no European source specific to the "account will be deleted" lure; only badge-offer and general account-security guidance).
- **Sources:** de-vznrw-fake-giveaways-2026, de-bsi-cyberstalking-safeguards, pl-cert-phishing-kb-2026.

## A2 Payment and card data phishing

**A2.1 `card-phishing-payment-failed`**: "payment failed, update your card"
- **Sees:** a subscription or shop email says payment failed and asks for card details via a link.
- **Channel:** email or SMS → browser. **Audience:** teen, adult. **ATT&CK:** T1566.002, T1657.
- **Red flags:** a request for card number, expiry and CVV; the link domain; a notice that isn't in your account when you open it yourself.
- **Habit:** update payment details only in the app or site you open yourself.
- **Reported in:** ES, PL, DE. **Status:** used (ch0–1: 1-6 genuine, 1-8; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** es-incibe-streaming-renewal-2024, pl-cert-phishing-kb-2026, de-bsi-protect-phishing.

**A2.2 `smishing-parcel-fee`**: parcel or customs fee by SMS
- **Sees:** an SMS says a parcel is held for a small fee or an address fix.
- **Channel:** SMS, email. **Audience:** all. **ATT&CK:** T1660 (mobile phishing), T1566.002.
- **Red flags:** you aren't expecting a parcel; no real tracking number; a small fee "today".
- **Habit:** track only in the carrier app or site, using your order's tracking number.
- **Reported in:** DE (ENISA names DE as the main target), PL, FR, IE, LT. **Status:** used (ch0–1: 1-3, 1-7, 1-9; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** de-vz-paketdienst-sms, eu-enisa-etl-2026, pl-cert-monthly-2025-12.

**A2.3 `prize-survey-shipping-fee`**: "you've won, just pay shipping"
- **Sees:** an unsolicited prize email leads to a survey, then a "you won" page asking for card details for a small shipping fee.
- **Channel:** email, social ad. **Audience:** teen, adult. **ATT&CK:** T1566.002, T1657.
- **Red flags:** a prize you never entered; a small fee; card details on a promo page.
- **Habit:** never enter bank details in a promotion you didn't ask for; check on the company's own site.
- **Reported in:** ES. **Status:** used (ch0–1: drill 0-5, via `card-phishing-payment-failed`). **Fit:** high. **Conf.:** Medium (2021 source).
- **Sources:** es-incibe-prize-2021.

**A2.4 `social-giveaway-data-harvest`**: fake brand giveaways on social media
- **Sees:** a page using a supermarket or electronics brand name offers high-value vouchers if you like, share, tag friends and fill in a form.
- **Channel:** social media, email, messenger. **Audience:** teen, adult, older. **ATT&CK:** T1684.001.
- **Red flags:** recently created page; few posts; no imprint or terms; "tag friends" mechanics. A blue badge means little.
- **Habit:** check the page's creation date and the brand's official site before taking part; don't share or tag.
- **Reported in:** DE. **Status:** candidate. **Fit:** high (social-post device). **Suggested:** teen-focused chapter, or a light opener in any chapter. **Conf.:** Medium–High (consumer centre, May 2026; its focus is data harvesting, not card theft).
- **Sources:** de-vznrw-fake-giveaways-2026.

## A3 Account takeover and code theft

**A3.1 `messenger-account-takeover-code`**: "send me the code I sent you by mistake"
- **Sees:** a verification code arrives unasked; then a "friend" or "support" asks for it.
- **Channel:** SMS + messenger. **Audience:** all, especially teens. **ATT&CK:** T1586, T1111.
- **Red flags:** a code you didn't request; anyone asking for it.
- **Habit:** never share a code; turn on the messenger's two-step PIN.
- **Reported in:** NL, PL, DE. **Status:** used (ch0–1: 0-4, 1-5; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** nl-politie-whatsapp-takeover-2024, pl-cert-phishing-kb-2026.

**A3.2 `messenger-vote-device-pairing`**: "vote for my niece" or a QR "security check" links your account to someone else's device
- **Sees:** a friend's (hijacked) account asks you to vote; the page asks for your number and a code, or a QR scan.
- **Channel:** messenger → browser/QR. **Audience:** all. **ATT&CK:** T1586, T1098 (account manipulation: device linked).
- **Red flags:** a vote or check that needs your phone number and code; unknown linked devices afterwards.
- **Habit:** never scan a login QR or enter a code from a link; check "linked devices" in the app.
- **Reported in:** PL, DE. **Status:** briefed (variant in `messenger-account-takeover-code`, not used in ch0–1). **Fit:** high. **Suggested:** Warsaw (pre-scene to the hijacked-friend code) or Amsterdam. **Conf.:** High (CERT Polska Aug 2026; consumer centre Oct 2026).
- **Sources:** pl-cert-vote-takeover-2026, de-vzn-ghost-pairing-2026.

**A3.3 `hijacked-friend-payment-code`**: a friend's hijacked account asks for your payment-app code
- **Sees:** a friend writes on social media or messenger asking for the 6-digit code from your banking app "to receive money".
- **Channel:** social messenger. **Audience:** teen, adult. **ATT&CK:** T1586, T1657.
- **Red flags:** a code request from anyone; urgency; an unusual way of writing.
- **Habit:** call the friend; never share payment or login codes.
- **Reported in:** PL. **Status:** used (planned: Warsaw ch5; brief `hijacked-friend-payment-code.md`, T-3.6r). **Fit:** high. **Conf.:** Medium-high for takeover plus money request, Medium for the payment-code detail (police-hosted warning, undated; NASK 2020; CERT Polska 2026 on friend-account takeovers).
- **Sources:** pl-policja-psp-na-znajomego, pl-nask-metoda-na-2020, pl-cert-monthly-2026-07.

**A3.4 `sim-swap-number-hijack`**: your phone number is moved to a criminal's SIM
- **Sees:** a sudden, lasting loss of mobile signal; you can't call or text; then login alerts or bank activity. It is often preceded by calls or messages pretending to be from your mobile operator.
- **Channel:** phone call or SMS (pretext) → loss of service. **Audience:** adult, older. **ATT&CK:** T1451 (Mobile: SIM Card Swap), T1111.
- **Red flags:** an "operator" call asking for personal data or a code; unexplained loss of network.
- **Habit:** if your signal vanishes unexpectedly, call your operator and your bank from another phone at once. Never give a code to a caller. Prefer app-based or passkey login over SMS where offered.
- **Reported in:** EU-wide (ENISA survey of operators), IE (operator-impersonation calls; the SIM-swap link not verified). **Status:** candidate. **Fit:** medium–high (the "no signal" moment is playable in the phone device). **Suggested:** Stockholm or Madrid variant, or a new "phone" chapter. **Conf.:** Medium (ENISA report from Dec 2021; IOCTA 2026 mentions SIM swapping only in passing).
- **Sources:** eu-enisa-sim-swapping-2021, ie-ncsc-mobile-scam-2024, eu-europol-iocta-2026.

## A4 Impersonation calls and approvals (vishing)

**A4.1 `multichannel-support-callback`**: parcel or card phishing followed by a "fraud team" call
- **Sees:** after a fake fee page, a "bank fraud team" calls (the caller ID may look right) and asks you to read out a code or approve in the app "to stop" a payment.
- **Channel:** SMS → email → call. **Audience:** all. **ATT&CK:** T1566.004, T1684.001, T1111.
- **Red flags:** an unsolicited call asking for codes or approvals. Caller ID can be faked.
- **Habit:** hang up; call the number on your card.
- **Reported in:** CH, ES, EU. **Status:** used (ch0–1: 1-9, 0-6 beat 3; brief exists). **Fit:** high. **Conf.:** High.
- **Sources:** ch-ncsc-double-phishing-2026, es-incibe-smishing-bank-callback-2025, eu-europol-phishing-leaflet.

**A4.2 `bank-safe-account-call`**: a spoofed bank SMS in the genuine thread, then "move money to safety"
- **Sees:** an alert about an unknown transfer appears in the bank's real SMS thread and gives a number to call; the "security department" guides you in your own app.
- **Channel:** SMS → call → banking app. **Audience:** all. **ATT&CK:** T1684.001, T1657.
- **Red flags:** a number to call inside an SMS; being asked to move money to a "safe" or "backup" account.
- **Habit:** no bank moves your money "to safety". Hang up and call the number on your card.
- **Reported in:** ES, FR, NL, PL. **Status:** used (planned: Madrid ch4; brief `bank-safe-account-call.md`, T-3.6r). **Fit:** high. **Conf.:** High.
- **Sources:** es-incibe-smishing-bank-callback-2025, es-bde-sms-callerid-spoofing-2022, fr-bdf-osmp-2024, nl-fraudehelpdesk-2025, pl-cert-fake-consultants.

**A4.3 `spoofed-police-or-relative-call`**: fake police, lawyer or bank call with a familiar-looking number
- **Sees:** a caller from "the police" says a relative is in trouble and money is needed now; the line is kept open.
- **Channel:** phone call. **Audience:** older, adult. **ATT&CK:** T1566.004, T1684.001.
- **Red flags:** a request for money; secrecy; not being allowed to hang up.
- **Habit:** hang up, then call the relative or 112 on a number you know.
- **Reported in:** IT, EU. **Status:** used (planned: Rome ch6; scenarios end at the call). **Fit:** high. **Conf.:** High.
- **Sources:** it-carabinieri-contro-truffe, eu-epc-threats-2025, it-mur-smishing-vishing, it-agcom-antispoofing-2025, it-bdi-truffe-cyber, eu-esas-ai-scams-factsheet-it.
- **T-3.8r note (2026-11-19):** brief `spoofed-authority-call.md`. Since 2025, phone companies must block calls from abroad that show an Italian number (fixed from 2025-08-19, mobile from 2025-11-19); state the rule, never its effect. Spoofing from inside Italy remains possible, so the caller ID is still a neutral decoy. Italian police sites refused automated access; no IT police URL is shown on screen.

**A4.4 `e-id-sign-on-call`**: a caller talks you into logging in or signing with your e-ID
- **Sees:** a "bank" or "authority" caller asks you to open your e-ID app and confirm "to stop fraud".
- **Channel:** call + e-ID app. **Audience:** adult, older. **ATT&CK:** T1684.001, T1078.
- **Red flags:** any e-ID request you didn't start.
- **Habit:** never approve a sign-in or signature you didn't start.
- **Reported in:** SE. **Status:** used (planned: Stockholm ch9). **Fit:** high. **Conf.:** High.
- **Sources:** se-polisen-vishing-2026, se-polisen-campaign-2026.

**A4.5 `qr-login-approval-by-message`**: "scan this QR to verify" sent by message
- **Sees:** a message asks you to scan a login QR with your banking or e-ID app.
- **Channel:** messenger + app. **Audience:** adult. **ATT&CK:** T1684.001, T1078.
- **Red flags:** a login QR you didn't generate yourself.
- **Habit:** only scan login QRs on a screen you opened yourself.
- **Reported in:** EU (EPC). **Status:** used (planned: Stockholm ch9). **Fit:** high. **Conf.:** Medium.
- **Sources:** eu-epc-threats-2025.

**A4.6 `ping-call-callback`**: one-ring "missed call" from a costly number
- **Sees:** a very short call from an unknown number, sometimes with a foreign prefix that looks like a local area code. Calling back reaches a recording that keeps you on the line at high cost.
- **Channel:** phone. **Audience:** all. **ATT&CK:** T1643 (Mobile: Generate Traffic from Victim) is the closest fit.
- **Red flags:** a missed call that rang once; an unfamiliar prefix.
- **Habit:** don't call back unknown numbers; look the number up first; ask your provider to block premium ranges.
- **Reported in:** DE. **Status:** candidate. **Fit:** medium (a small "drill" rather than a scenario; low stakes). **Suggested:** a light drill in any chapter. **Conf.:** Medium–High (regulator page, undated, copyright 2026).
- **Sources:** de-bnetza-ping-calls.

**A4.7 `voicebot-prescreen-call`**: an automated "bank" or "authority" voice call that asks you to press a key
- **Sees:** a robotic or very natural voice says there is a problem and asks you to press 1 to speak to an agent, who then runs a bank or police script.
- **Channel:** phone (AI voice). **Audience:** adult, older. **ATT&CK:** T1566.004, T1684.001.
- **Red flags:** an automated call about your account; being moved to a "specialist".
- **Habit:** hang up; call the number on your card or the official site.
- **Reported in:** EU (Europol: "voice chat bots ... deployed to pre-screen victims at industrial volume"). **Status:** candidate. **Fit:** medium (good opener for an AI chapter; the habit duplicates A4.2). **Suggested:** AI-themed chapter or Rome/Madrid variant. **Conf.:** Medium (EU-level only).
- **Sources:** eu-europol-iocta-2026.

## A5 Investment, crypto and loans

**A5.1 `celebrity-deepfake-investment-ad`**: an AI "celebrity" endorses an investment
- **Sees:** a social ad with a famous face leads to a form and then an "adviser" call.
- **Channel:** social ad → call. **Audience:** adult, older. **ATT&CK:** T1583.008 (malvertising), T1684.001.
- **Red flags:** a celebrity endorsement; guaranteed returns; an adviser who calls you.
- **Habit:** check the firm on the regulator's register yourself.
- **Reported in:** IE, EU. **Status:** used (planned: Dublin ch8). **Fit:** high. **Conf.:** High.
- **Sources:** ie-fraudsmart-investment-2025, ie-garda-investment-2025, eu-europol-iocta-2026.

**A5.2 `recovery-scam`**: "we can get your money back for a fee"
- **Sees:** after a loss, someone offers recovery for an upfront fee, sometimes posing as a lawyer or authority.
- **Channel:** call, email, social media. **Audience:** prior victims. **ATT&CK:** T1684.001, T1657.
- **Red flags:** a fee before recovery; they contact you.
- **Habit:** anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam; go to your bank and the police.
- **Reported in:** IE, BE. **Status:** used (planned: Dublin ch8; cross-cutting in debriefs). **Fit:** high. **Conf.:** High.
- **Sources:** ie-bpfi-recovery-2024, be-police-fake-police-messages-2026.

**A5.3 `fake-trading-platform-dashboard`**: an online trading or crypto platform shows fake gains
- **Sees:** a slick platform or app shows your balance growing; withdrawals need "taxes" or "fees".
- **Channel:** website or app (often after an ad, dating or messenger contact). **Audience:** adult. **ATT&CK:** T1657.
- **Red flags:** you can't withdraw without paying more; the firm isn't on the register.
- **Habit:** check the regulator's warnings and register before paying; stop if a withdrawal needs a fee.
- **Reported in:** BE (FSMA: 66.5% of H1 2026 reported losses), SE, NL, EU. **Status:** used (planned: Dublin ch8 Alex dashboard beat). **Fit:** high. **Conf.:** High.
- **Sources:** be-fsma-dashboard-2026-h1, se-polisen-proceeds-2026, nl-fraudehelpdesk-2025.

**A5.4 `messenger-stock-tips-group`**: fake stock-advice groups in a messenger
- **Sees:** you're added to a group where an "expert" and enthusiastic members share winning tips, then move you to a platform.
- **Channel:** messenger group. **Audience:** adult. **ATT&CK:** T1566.003, T1657.
- **Red flags:** being added to a group you didn't join; unverifiable "members"; tips plus a platform link.
- **Habit:** leave and report the group; check any firm on the regulator's site.
- **Reported in:** BE (FSMA: more than EUR 2m in H1 2026; complaints dropping since Feb 2026). **Status:** candidate. **Fit:** high (messenger device). **Suggested:** Dublin variant or new "investment II" chapter. **Conf.:** High for BE; elsewhere not checked.
- **Sources:** be-fsma-dashboard-2026-h1.

**A5.5 `fake-loan-advance-fee`**: "fast loan, no paperwork": pay a fee first
- **Sees:** an online loan offer promises money in 24 h even if banks refused you; you're asked for a "file", "insurance" or "legalisation" fee; fake contracts may look approved by a notary or bank.
- **Channel:** website, social media, email, messenger. **Audience:** adult (people in financial difficulty). **ATT&CK:** T1684.001, T1657.
- **Red flags:** an upfront fee; no checks; "approval when banks refuse".
- **Habit:** never pay to receive a loan; check the lender on the regulator's site.
- **Reported in:** BE (FSMA: about 20% of H1 2026 complaints, average loss about EUR 3,000). **Status:** candidate. **Fit:** high. **Suggested:** Brussels side scenario or a new chapter on money worries. **Conf.:** High for BE.
- **Sources:** be-fsma-dashboard-2026-h1.

## A6 Romance and family impersonation (cyber vector only)

**A6.1 `romance-to-investment`**: an online relationship leads to "investing together"
- **Sees:** a dating or social match builds trust over weeks and then introduces a platform or asks for money.
- **Channel:** dating app, messenger. **Audience:** adult, older. **ATT&CK:** T1684.001, T1657.
- **Red flags:** avoids video or meeting; money requests; an investment tip.
- **Habit:** never send money to someone you haven't met; talk to someone you trust.
- **Reported in:** BE, SE, EU. **Status:** used (planned: Brussels ch10, Alex arc). **Fit:** high. **Conf.:** High.
- **Sources:** be-police-romance-2026, eu-esas-ai-scams-factsheet-nl, se-polisen-proceeds-2026.

**A6.2 `hi-mum-new-number`**: "Hi Mum, new number, can you pay this?"
- **Sees:** a "relative" writes from a new number and urgently asks you to pay a bill.
- **Channel:** messenger, SMS. **Audience:** adult, older. **ATT&CK:** T1684.001.
- **Red flags:** a new number plus money; "pay my friend's account".
- **Habit:** call the old number.
- **Reported in:** NL. **Status:** used (planned: Amsterdam ch2). **Fit:** high. **Conf.:** Medium–High.
- **Sources:** nl-politie-hulpvraagfraude-2025.

**A6.3 `cloned-voice-family-emergency`**: a relative's AI-cloned voice asks for urgent help
- **Sees:** a voice message or call sounds exactly like a relative.
- **Channel:** call, voice message. **Audience:** all. **ATT&CK:** T1566.004, T1684.001.
- **Red flags:** urgency plus a new number; a voice alone is not proof.
- **Habit:** call back on the known number; use a family code word.
- **Reported in:** EU (no prevalence figure). **Status:** used (planned: Rome ch6). **Fit:** high. **Conf.:** Medium.
- **Sources:** eu-esas-ai-scams-factsheet-nl, eu-esas-ai-scams-factsheet-it, eu-epc-threats-2025, de-bsi-deepfakes, it-mur-smishing-vishing, nl-veiliginternetten-voice-cloning.
- **T-3.8r note (2026-11-19):** brief `cloned-voice-family-emergency.md`. Official sources speak of fake audio imitating a voice; none found describes a cloned voice note in a messenger chat specifically, so that variant is Low–Medium confidence and its tell is "new number + money + no call". No prevalence figures on screen.

## A7 Marketplaces and fake shops

**A7.1 `marketplace-collect-payment-link`**: a fake "buyer has paid, collect here" link while you sell
- **Sees:** a buyer sends a link to "receive payment" or "safe delivery"; the page asks for card or bank login.
- **Channel:** marketplace chat → messenger → browser. **Audience:** teen, adult. **ATT&CK:** T1566.003, T1657.
- **Red flags:** moving off the platform; "receiving" money needs your card details.
- **Habit:** keep the deal and payment on the platform.
- **Reported in:** PL, EU. **Status:** used (planned: Warsaw ch5; brief `marketplace-collect-payment-link.md`, T-3.6r). **Fit:** high. **Conf.:** High.
- **Sources:** pl-cert-monthly-2025-12, pl-cert-monthly-2026-01, pl-cert-monthly-2026-03, pl-nask-okazja-czy-pulapka-2025, eu-esas-ai-scams-factsheet-nl.

**A7.2 `fake-shop-social-ad`**: a fake web shop with big discounts
- **Sees:** a professional-looking shop (often via an ad) with low prices; at checkout only bank transfer is offered; the goods never arrive.
- **Channel:** web, social ad. **Audience:** teen, adult. **ATT&CK:** T1583.008, T1657.
- **Red flags:** prepayment only at the last step; missing or odd imprint; a strange domain ending; reviews only on the shop itself.
- **Habit:** check the shop independently (consumer-centre checker, reviews elsewhere); pay only with a method you can reverse.
- **Reported in:** DE, PL, EU. **Status:** candidate (named as secondary in MAP ch7; not in GDD §18). **Fit:** high. **Suggested:** Lisbon side scenario or a "shopping" chapter. **Conf.:** High (DE consumer centre 2025; ECC-Net; PL figures via news).
- **Sources:** de-vz-fakeshops-2025, eu-eccnet-online-fraud, pl-polskieradio-fake-shops-2025, eu-europol-iocta-2026.

**A7.3 `marketplace-fake-seller`**: you pay a "seller" for an item that doesn't exist
- **Sees:** a sought-after item at a good price; the seller sends a screenshot "as proof" and asks for a quick direct payment.
- **Channel:** marketplace or social media → messenger. **Audience:** teen, adult. **ATT&CK:** T1657.
- **Red flags:** pressure to pay now outside the platform's protected checkout; screenshots as proof.
- **Habit:** pay only via the platform's buyer protection, or in a way you can reverse.
- **Reported in:** NL (buy/sell fraud is #2 by reports in 2025), CH. **Status:** candidate. **Fit:** high. **Suggested:** Warsaw twin (buyer side) or Amsterdam. **Conf.:** High (NL); CH is supporting only.
- **Sources:** nl-fraudehelpdesk-2025, ch-ncsc-tickets-2025.

## A8 Jobs, identity misuse and money mules

**A8.1 `task-job-scam`**: "easy online work": earn, then deposit to unlock
- **Sees:** a recruiter in a messenger offers paid "tasks"; a platform shows earnings and pays once, then asks for deposits.
- **Channel:** messenger, call, social ad → fake site. **Audience:** teen, adult. **ATT&CK:** T1684.001, T1657.
- **Red flags:** a job that asks you to pay in.
- **Habit:** a real job never asks for deposits.
- **Reported in:** NL, EU. **Status:** used (planned: Amsterdam ch2). **Fit:** high. **Conf.:** Medium.
- **Sources:** nl-nos-easy-work-2025, eu-epc-threats-2025.

**A8.2 `money-mule-recruitment`**: "easy money, just use your account"
- **Sees:** a DM offers cash to receive and forward money or to lend banking-app access.
- **Channel:** social DM, messenger. **Audience:** teen, young adult. **ATT&CK:** T1657.
- **Red flags:** easy money; "just your account".
- **Habit:** never let anyone use your account, card or app; tell a trusted adult.
- **Reported in:** BE, IE, EU. **Status:** used (planned: Brussels ch10). **Fit:** high. **Conf.:** High.
- **Sources:** eu-europol-mule-jobs, eu-europol-mule-flyer-ie, be-febelfin-phishing-2025.

**A8.3 `fake-job-identity-video-ident`**: a fake employer has you complete a video ID check or open a bank account
- **Sees:** a quick "acceptance" by email or messenger with no real interview; the first task is a bank video-identification or opening an account "for work"; requests for ID copies and bank details.
- **Channel:** job portal ad → email/messenger → video-ident. **Audience:** students, young adults. **ATT&CK:** T1684.001, T1657.
- **Red flags:** no interview; high pay for simple tasks; a first task that is an ID check or account opening; requests to install software or share logins.
- **Habit:** never complete an ID check or open an account for an employer. Verify the company via its own imprint or phone number.
- **Reported in:** DE. **Status:** candidate. **Fit:** high. **Suggested:** Berlin "season 2", or Amsterdam alongside the task scam. **Conf.:** High (consumer centre, Aug 2026).
- **Sources:** de-vzn-jobscamming-2026.

**A8.4 `parcel-reshipping-agent`**: a "goods agent" job forwarding parcels
- **Sees:** a remote job to receive parcels at home and forward them, recruited online.
- **Channel:** job ad, messenger. **Audience:** young adult, adult. **ATT&CK:** T1657.
- **Red flags:** paid simply to forward goods; an employer you can't verify.
- **Habit:** decline; check the employer independently.
- **Reported in:** DE. **Status:** candidate. **Fit:** low–medium (the decisive harm is the physical forwarding; keep it as recruitment-message recognition only). **Conf.:** Medium (mentioned in passing).
- **Sources:** de-vzn-jobscamming-2026.

**A8.5 `crypto-wallet-renting-minors`**: "rent us your crypto wallet" or "here's a crypto gift"
- **Sees:** an offer online to be paid for lending your wallet or receiving and passing on a crypto "gift".
- **Channel:** social media, gaming chat, messenger. **Audience:** teen. **ATT&CK:** T1657.
- **Red flags:** being paid to let money pass through your wallet.
- **Habit:** same as mule recruitment: never lend accounts or wallets; tell a trusted adult.
- **Reported in:** EU (Europol: minors "may unknowingly engage in money laundering"). **Status:** candidate. **Fit:** medium (merge into the Brussels mule scenario as a variant). **Conf.:** Medium (EU-level only).
- **Sources:** eu-europol-iocta-2026.

## A9 Tech support and remote access

**A9.1 `remote-access-support-call`**: "support" asks you to install a remote-access app
- **Sees:** a caller from "your bank", "IT" or "the provider" asks you to install an app so they can "fix" something.
- **Channel:** call → app install. **Audience:** older, adult. **ATT&CK:** T1219.002, T1663 (mobile).
- **Red flags:** any request to install remote-access software.
- **Habit:** never let anyone control your device; hang up and call back on an official number.
- **Reported in:** EU (among the most common typologies), PL. **Status:** used (planned: Brussels ch10 boss; Stockholm preview). **Fit:** high. **Conf.:** Medium–High.
- **Sources:** eu-europol-iocta-2026, pl-cert-fake-consultants, eu-esas-ai-scams-factsheet-nl.

**A9.2 `browser-popup-scareware`**: a "your computer is locked, call this number" pop-up
- **Sees:** a full-screen browser warning with alarms and a support number.
- **Channel:** browser → call. **Audience:** older, adult. **ATT&CK:** T1189, T1684.001.
- **Red flags:** a number in a pop-up; the warning sits inside a browser window.
- **Habit:** don't call; close the browser (or restart); real security software doesn't ask you to phone.
- **Reported in:** CH (non-EU, supporting). **Status:** candidate. **Fit:** high (browser device). **Suggested:** Brussels pre-boss, or a "home tech" chapter. **Conf.:** Low–Medium (only a non-EU national source verified; EU sources cover tech support generally).
- **Sources:** ch-ncsc-fake-support-2024, eu-europol-iocta-2026.

**A9.3 `fake-helpline-search-result`**: a search ad or top result gives a fake customer-service number
- **Sees:** you search for an airline, bank or shop helpline; the first result or ad gives a number staffed by scammers.
- **Channel:** search engine → call. **Audience:** all. **ATT&CK:** T1583.008, T1608.006.
- **Red flags:** a number found in an ad rather than on the official site or app; the "agent" asks for card or login details.
- **Habit:** take helpline numbers from the official app, your card or the bill, not from search ads.
- **Reported in:** BE (consumer centre: "a vendor ranked first is not necessarily the official seller", said about tickets), EU (malvertising). **Status:** candidate. **Fit:** high. **Suggested:** a travel chapter (flight disruption) or Lisbon. **Conf.:** Low–Medium (no European source specific to fake helplines in ads verified this session).
- **Sources:** be-eccbe-concert-tickets, eu-enisa-etl-2025-press, int-mitre-attack-enterprise.

**A9.4 `email-bombing-fake-it-call`**: an inbox flood, then "IT" calls to help
- **Sees:** hundreds of sign-up emails swamp your inbox; soon "IT support" calls or messages offering to fix it and asks for a code or remote access.
- **Channel:** email flood → call or chat. **Audience:** business. **ATT&CK:** T1667 (Email Bombing), T1566.004, T1219.
- **Red flags:** help arrives before you asked; a request for a code or remote access.
- **Habit:** contact IT through the channel you already know.
- **Reported in:** EU (ENISA: vishing that impersonates IT staff to obtain credentials and MFA codes). **Status:** candidate. **Fit:** medium (workplace; good ch0 boss echo). **Suggested:** a workplace bonus chapter. **Conf.:** Medium (ENISA covers IT-staff vishing; the email-bombing step is from ATT&CK only).
- **Sources:** int-mitre-attack-t1667, eu-enisa-etl-2026.

## A10 CEO fraud, BEC and payee changes

**A10.1 `ceo-fraud`**: an urgent, confidential transfer for "the boss"
- **Sees:** an email or call from a "director" or "lawyer" asks for a secret urgent payment.
- **Channel:** email, call. **Audience:** business. **ATT&CK:** T1566.002, T1684.001, T1657.
- **Red flags:** secrecy plus urgency plus a payment.
- **Habit:** a fixed two-person check; call back on a known number.
- **Reported in:** FR, SE, EU. **Status:** used (planned: Paris ch3). **Fit:** high. **Conf.:** Medium–High.
- **Sources:** fr-gendarmerie-fovi, eu-ebf-cyberscams, se-polisen-proceeds-2026.

**A10.2 `invoice-iban-change`**: "our bank details have changed"
- **Sees:** a supplier's (or look-alike) email gives new bank details for the next invoice.
- **Channel:** email. **Audience:** business, adult. **ATT&CK:** T1566.002, T1684.002 (Email Spoofing), T1657.
- **Red flags:** a change of bank details by email; a payee-name mismatch warning.
- **Habit:** verify by phone on a number you already have; heed the name-check result.
- **Reported in:** FR, EU. **Status:** used (planned: Paris ch3). **Fit:** high. **Conf.:** Medium–High.
- **Sources:** fr-gendarmerie-fovi, eu-ebf-cyberscams, eu-ecb-ipr.

**A10.3 `deepfake-video-meeting-executive`**: a video call with a faked executive
- **Sees:** a video meeting where a familiar executive (face and voice) asks for an urgent payment or data.
- **Channel:** video call. **Audience:** business. **ATT&CK:** T1684.001.
- **Red flags:** an unusual request in an unexpected meeting; pressure; refusal to verify by other means.
- **Habit:** verify through a separate known channel before acting.
- **Reported in:** DE, BE (both mention deepfake audio/video in CEO fraud). **Status:** candidate. **Fit:** medium (needs a video-call device; Paris boss variant). **Conf.:** Medium (BSI page from 2022; CCB article from 2025 mentions it).
- **Sources:** de-bsi-deepfakes, be-ccb-safeonweb-2025.

**A10.4 `consumer-payee-change`**: a landlord, club or tradesperson "changed bank details"
- **Sees:** an email or messenger message gives new payment details for rent or fees.
- **Channel:** email, messenger. **Audience:** adult, student. **ATT&CK:** T1586, T1657.
- **Red flags:** as A10.2.
- **Habit:** as A10.2.
- **Reported in:** inferred from A10.2 (no consumer-specific official source). **Status:** candidate (MAP ch3 suggestion, not in GDD). **Fit:** high. **Suggested:** Paris consumer variant. **Conf.:** Low (inferred).
- **Sources:** fr-gendarmerie-fovi, eu-ecb-ipr.

## A11 Government services, authorities and e-ID

**A11.1 `gov-refund-phishing`**: tax refund, social-security or benefits message
- **Sees:** an SMS, email or call says you're owed a refund or must update details for a benefit; a link or caller asks for card or ID numbers.
- **Channel:** SMS, email, call. **Audience:** adult, older. **ATT&CK:** T1566.002, T1566.004, T1684.001.
- **Red flags:** card details to *receive* money; a refund you didn't expect; a request for national ID numbers.
- **Habit:** check refunds only in the official portal you open yourself; tax offices don't ask for card details by message.
- **Reported in:** IE (Revenue impersonation, 2020), FR (social-security lures after breaches), EU (ENISA: smishing impersonating public administration). **Status:** candidate. **Fit:** high. **Suggested:** Dublin side scenario or a new "public services" chapter. **Conf.:** Medium (IE source is from 2020; ENISA is EU-level).
- **Sources:** ie-garda-revenue-scam-2020, fr-cnil-data-leak-2024, eu-enisa-etl-2026.

**A11.2 `fake-fine-toll-smishing`**: "unpaid traffic fine, parking or toll: pay now"
- **Sees:** an SMS or a notice (with a QR) about an unpaid fine with a short deadline and a payment link.
- **Channel:** SMS, email, QR on a paper notice. **Audience:** adult. **ATT&CK:** T1660, T1566.002.
- **Red flags:** pay-now pressure; the link domain isn't the official portal; a fine you can't place.
- **Habit:** look the fine up on the official portal you type yourself.
- **Reported in:** PT (fake parking-fine notices, via news), EU (public-administration smishing). Spanish INCIBE warnings about traffic-authority smishing were **found by search but could not be opened** this session (server errors), so they are not cited. **Status:** candidate. **Fit:** high. **Suggested:** Madrid side scenario (pending the INCIBE re-check) or Lisbon. **Conf.:** Medium.
- **Sources:** eu-enisa-etl-2026, pt-portugalpost-gnr-quishing-2026.

**A11.3 `fake-police-email-summons`**: an email "from the police" accuses you of an offence and demands payment
- **Sees:** an official-looking email, sometimes signed with a real senior official's name, accuses you (often of a sexual offence), threatens prosecution and offers to settle by payment. Some versions claim your computer was hacked.
- **Channel:** email (also calls). **Audience:** adult. **ATT&CK:** T1566.001, T1684.001, T1684.002, T1657.
- **Red flags:** urgency and alarm; a look-alike sender domain; links or attachments; payment to avoid prosecution. Police don't settle cases by email.
- **Habit:** don't reply or click; call your local police on a number you look up; forward the email to the national phishing report address. Expect "recovery" follow-ups.
- **Reported in:** BE (federal police, June 2026); EU (Europol warned about emails using its leaders' names, 2021). **Status:** candidate. **Fit:** high (sensitive accusation: keep it generic, e.g. "a serious offence", and adult-only tone). **Suggested:** Brussels side scenario or a new chapter. **Conf.:** High (BE), Medium (EU, 2021).
- **Sources:** be-police-fake-police-messages-2026, eu-europol-ed-impersonation-2021.

**A11.4 `copycat-official-portal`**: unofficial sites for official travel or ID services
- **Sees:** a search result or ad for a travel-authorisation or document service that copies the official look, charges extra fees and collects passport data.
- **Channel:** search, ads → web. **Audience:** travellers, adult. **ATT&CK:** T1583.008, T1036.
- **Red flags:** official-sounding domain that isn't the government's; extra "service" fees; claims to accept applications before the service exists.
- **Habit:** start from the official government site and follow its links.
- **Reported in:** EU (Frontex found over 100 unofficial travel-authorisation sites, 2024). **Status:** candidate. **Fit:** medium–high (good for a travel chapter). **Conf.:** Medium (2024 source; its stated launch timing has passed and the current status of that EU travel-authorisation system was **not verified** this session, so don't put any launch date in content).
- **Sources:** eu-frontex-etias-sites-2024.

## A12 Charity and humanitarian

**A12.1 `fake-aid-or-donation-site`**: a site misusing an aid organisation's identity to collect payments
- **Sees:** a website or post claims to be backed by a well-known aid body and asks for a fee or donation after a crisis.
- **Channel:** web, social media. **Audience:** adult, older. **ATT&CK:** T1036, T1657.
- **Red flags:** official logos plus payment requests; urgency tied to news.
- **Habit:** give only via organisations you look up yourself on official registers or their own sites.
- **Reported in:** EU (the Commission warned about a site misusing the EU humanitarian-aid logo to charge "safe passage" fees, 2025). **Status:** candidate. **Fit:** medium (seasonal; risk of trivialising real crises). **Conf.:** Low (the only official source is about a fee-charging site, not donations; no national charity-scam source found).
- **Sources:** eu-echo-fake-aid-site-2025.

## A13 Travel, rentals and tickets

**A13.1 `rental-fake-listing-offplatform`**: a fake rental listing and off-platform payment
- **Sees:** an attractive room or holiday flat; the "host" moves you to messenger and sends a payment link or bank details.
- **Channel:** listing site → messenger → link. **Audience:** students, travellers. **ATT&CK:** T1566.003, T1657.
- **Red flags:** leaving the platform; paying before viewing.
- **Habit:** book, chat and pay only inside the platform.
- **Reported in:** PT (via news), DE, EU. **Status:** used (planned: Lisbon ch7). **Fit:** high. **Conf.:** Medium.
- **Sources:** de-evz-rental-fraud, pt-dn-psp-airbnb-2026, pt-rr-psp-rentals-2026, pt-rtp-gnr-rentals-2026, pt-dn-psp-cncs-campaign-2025, pt-bdp-ficaadica-2023.
- **T-3.8r note (2026-11-19):** brief `rental-offplatform-payment.md` (variants A and B). Portuguese facts come via news reports quoting the national police forces; keep Portuguese figures off screen.

**A13.2 `booking-platform-login-phishing`**: "your booking needs confirmation, log in here"
- **Sees:** a message styled like the rental platform asks you to log in or re-enter card details via a link.
- **Channel:** email, messenger. **Audience:** travellers. **ATT&CK:** T1566.002.
- **Red flags:** a login link in a message.
- **Habit:** open the platform's app yourself.
- **Reported in:** DE, PT. **Status:** used (planned: Lisbon ch7). **Fit:** high. **Conf.:** Medium.
- **Sources:** de-evz-rental-fraud, pt-dn-psp-airbnb-2026, nl-nltimes-booking-phishing-2026, pt-bdp-ficaadica-2023.
- **T-3.8r note (2026-11-19):** brief `rental-offplatform-payment.md` (variant C). The "message from your accommodation asking to pay again" variant is NL news-only evidence (optional beat).

**A13.3 `ticket-resale-scam`**: tickets for a sold-out concert or match
- **Sees:**
  - *As a buyer:* a social profile or a dating match offers tickets, sends a screenshot or a link to a slick ticket shop, and asks for quick payment or card details.
  - *As a seller:* a "buyer" asks for a photo of the ticket's QR code "as proof" and vanishes.
- **Channel:** social media, dating app, fake shop. **Audience:** teen, adult. **ATT&CK:** T1566.003, T1657.
- **Red flags:** below-face-value price for a sold-out event; pressure; off-platform sales; requests for ID copies; sharing a ticket QR.
- **Habit:** buy and sell only through the official or authorised resale channel; never send a photo of a ticket's QR code.
- **Reported in:** CH (non-EU; ahead of the 2025 festival season and a major song contest), BE (consumer centre). **Status:** candidate. **Fit:** high. **Suggested:** a festival-city chapter or Amsterdam/Lisbon. **Conf.:** Medium (BE consumer source covers resale risks; the scam detail comes from a non-EU national source).
- **Sources:** ch-ncsc-tickets-2025, be-eccbe-concert-tickets.

## A14 QR codes (quishing)

**A14.1 `qr-sticker-public-payment`**: a sticker over a parking or charger QR code
- **Sees:** a QR code on a meter or EV charger leads to a payment page.
- **Channel:** QR. **Audience:** adult. **ATT&CK:** T1566.002 (closest), T1036.
- **Red flags:** a sticker on top; the preview domain isn't the operator's.
- **Habit:** type the official address or use the official app.
- **Reported in:** IE, BE, LU, PT. **Status:** used (planned: Lisbon ch7). **Fit:** high. **Conf.:** Medium–High.
- **Sources:** ie-ncsc-qr-guide, be-safeonweb-qr-chargers, lu-vdl-parking-qr, eu-epc-threats-2025, pt-portugalpost-gnr-quishing-2026, pt-deco-qrishing-2024.
- **T-3.8r note (2026-11-19):** brief `qr-sticker-parking.md`. The lesson is the destination address; the sticker is a supporting clue. The Portuguese evidence is news plus a consumer body (Medium).

**A14.2 `qr-code-in-email`**: a QR code in an email ("scan to keep your account active")
- **Sees:** an email with a QR code instead of a link, often for a login or payment; scanning moves you to your phone, outside work filters.
- **Channel:** email → phone browser. **Audience:** adult, business. **ATT&CK:** T1566.002, T1660.
- **Red flags:** a QR in an email asking you to log in or pay; the preview domain.
- **Habit:** don't scan login QRs from emails; open the service yourself.
- **Reported in:** IE, EU (ENISA lists quishing). **Status:** candidate. **Fit:** high. **Suggested:** Home/ch0 echo or Dublin. **Conf.:** Medium–High.
- **Sources:** ie-ncsc-qr-guide, eu-enisa-etl-2026.

**A14.3 `qr-on-letter-or-invoice`**: a QR on a paper letter or invoice leads to a fake payment
- **Sees:** a letter or invoice (real-looking) carries a QR code for payment or login.
- **Channel:** paper → QR (allowed by Red Line 8 only as the carrier). **Audience:** adult, older. **ATT&CK:** T1566.002 (closest).
- **Red flags:** a QR swapped or added; a payee you don't recognise.
- **Habit:** pay via your banking app using known payee details, not a QR from a letter you can't verify.
- **Reported in:** EU (EPC). **Status:** candidate. **Fit:** medium (letter device exists; the lesson must stay on the QR). **Conf.:** Medium.
- **Sources:** eu-epc-threats-2025.

## A15 Teen, gaming and sextortion

**A15.1 `gaming-account-phishing`**: free skins or in-game currency, fake "game maker" emails, code requests
- **Sees:** an offer of free in-game items or a "game maker" email asks you to log in via a link; a "friend" asks for your login code.
- **Channel:** game chat, social media, email. **Audience:** teen. **ATT&CK:** T1566.002, T1586.
- **Red flags:** free currency or items; a login link; anyone asking for passwords or codes, even friends.
- **Habit:** log in only through the game or launcher; never share passwords or codes; turn on two-step login.
- **Reported in:** DE (police prevention booklet warns of phishing emails from supposed game makers and says never share codes even with best friends); EU (Europol: offenders target children on gaming platforms). **Status:** candidate. **Fit:** high (core 14+ audience). **Suggested:** a teen-focused chapter or Warsaw. **Conf.:** Low–Medium (no European source focused on skin or currency phishing; specific lures came only from vendor blogs, which are not cited).
- **Sources:** de-polizei-onlinetipps-2024, eu-europol-iocta-2026.

**A15.2 `sextortion-social-media`**: financial sextortion of young people via social media
- **Sees:** a new contact builds rapport, obtains or fakes intimate images, then demands money.
- **Channel:** social media, messenger. **Audience:** teen. **ATT&CK:** T1657.
- **Red flags:** fast intimacy; requests for images; threats.
- **Habit:** don't pay; stop contact; keep evidence; tell someone; report.
- **Reported in:** EU (Europol: "financial sexual extortion continues to surge"), IE. **Status:** candidate: **help card only** (G1 decision; never a scenario). **Fit:** low (safeguarding). **Conf.:** Medium (the Garda campaign page is from 2017).
- **Sources:** eu-europol-iocta-2026, ie-garda-sayno-2017.

**A15.3 `webcam-blackmail-email`**: "I hacked your webcam" mass email with an old password
- **Sees:** an email claims your camera was hacked and you were recorded, may show an old password or your address, and demands payment (often crypto).
- **Channel:** email. **Audience:** adult. **ATT&CK:** T1684.001, T1657.
- **Red flags:** generic text; an old leaked password as "proof"; a payment deadline.
- **Habit:** don't pay or reply; change any password shown; report.
- **Reported in:** FR (prefecture alert, campaign since 2018), BE (fake-police variants claiming a hacked computer). **Status:** help card only (Roman, 2026-11-18), never a scenario. **Fit:** help card. **Conf.:** Medium (French source undated, about 2018; the Cybermalveillance fiche could not be read this session).
- **Sources:** fr-lot-prefecture-webcam-2018, be-police-fake-police-messages-2026.

**A15.4 `violent-online-community-grooming`**: minors groomed into violent online networks
- **Sees:** "love-bombing" on social media or messengers, then coercion.
- **Channel:** social media, messenger, gaming. **Audience:** teen. **ATT&CK:** none (not a technical technique).
- **Red flags:** not for the game.
- **Habit:** tell a trusted adult; child helplines.
- **Reported in:** EU (Europol). **Status:** candidate: **help card only** (safeguarding; out of scope for scenarios). **Fit:** low. **Conf.:** Medium.
- **Sources:** eu-europol-iocta-2026.

---

# Part B: Malware and technical campaigns, as users experience them

Defender's level only: what you see and what you do. No samples, commands or configuration.

## B1 Malware delivery

**B1.1 `malicious-attachment`**: an "invoice", "delivery note" or "summons" attachment
- **Sees:** an email (sometimes after a phone call announcing it) with a document or archive to open; the document may ask you to "enable content".
- **Channel:** email. **Audience:** adult, business. **ATT&CK:** T1566.001, T1204.002.
- **Red flags:** an unexpected attachment; a call pressing you to open it; "enable content" prompts.
- **Habit:** don't open unexpected attachments; confirm with the sender via a known channel. If opened: disconnect and tell IT or the bank.
- **Reported in:** EU (ENISA: malspam), CH (call-then-email), BE (attachments in fake police emails). **Status:** candidate. **Fit:** high (email device; "open attachment" decision). **Suggested:** workplace chapter or Paris. **Conf.:** Medium.
- **Sources:** eu-enisa-etl-2025-press, ch-ncsc-parcel-calls-2022, be-police-fake-police-messages-2026, int-mitre-attack-enterprise.

**B1.2 `clickfix-fake-fix-prompt`**: a "verify you're human" or "fix this error" page tells you to press keys and paste
- **Sees:** a website shows a CAPTCHA or error with step-by-step keyboard instructions that open a command window. Something has already been copied for you.
- **Channel:** browser (compromised site or ad). **Audience:** all. **ATT&CK:** T1204.004 (Malicious Copy and Paste).
- **Red flags:** any page asking you to open a command window, press a key combination or paste something.
- **Habit:** no legitimate website asks you to enter system commands. Close the page. If you did it: assume passwords and sessions are stolen; change passwords from a clean device and report.
- **Reported in:** EU (ENISA 2026: increasing; fake CAPTCHA pages deliver infostealers), CH. **Status:** candidate. **Fit:** high (browser device; the game must never show a real command). **Suggested:** a new "malware" chapter, or Brussels pre-boss. **Conf.:** High (ENISA plus national CERT).
- **Sources:** eu-enisa-etl-2026, ch-ncsc-clickfix-2026, int-mitre-attack-t1204.

**B1.3 `fake-browser-update`**: "your browser is out of date, update now"
- **Sees:** a page claims your browser needs an update and offers a download or "fix".
- **Channel:** browser. **Audience:** all. **ATT&CK:** T1189, T1036.
- **Red flags:** an update offered by a website.
- **Habit:** update only through the browser's own settings or the official store.
- **Reported in:** CH (as a ClickFix lure). **Status:** candidate. **Fit:** high. **Suggested:** paired with B1.2. **Conf.:** Low–Medium (non-EU national source only; ENISA 2026 does not mention fake updates).
- **Sources:** ch-ncsc-clickfix-2026, int-mitre-attack-enterprise.

**B1.4 `malvertising-fake-download`**: an ad or top search result leads to a fake download page
- **Sees:** searching for free software, a PDF tool or a bank leads to an ad or a high result that looks official but serves a malicious installer or a fake login.
- **Channel:** search engine, ads. **Audience:** all. **ATT&CK:** T1583.008, T1608.006.
- **Red flags:** "sponsored" results; a domain that isn't the vendor's; a download from a mirror.
- **Habit:** get software from the official store or the vendor site you type; bookmark your bank.
- **Reported in:** EU (ENISA: malvertising among phishing vectors; Europol: malvertising for fake listings). **Status:** candidate. **Fit:** high (browser and search device). **Conf.:** Medium (EU-level; no national figure).
- **Sources:** eu-enisa-etl-2025-press, eu-enisa-etl-2026, eu-europol-iocta-2026, int-mitre-attack-enterprise.

**B1.5 `drive-by-compromised-site`**: a normal website has been tampered with
- **Sees:** usually nothing; at most an unexpected overlay or prompt on a site you trust.
- **Channel:** browser. **Audience:** all. **ATT&CK:** T1189.
- **Red flags:** a trusted site suddenly asks you to do something unusual (see B1.2).
- **Habit:** keep the browser and OS updated; treat unusual prompts on familiar sites as suspicious.
- **Reported in:** CH (ClickFix via compromised sites). **Status:** candidate. **Fit:** low (mostly invisible; play it only through its visible prompt, i.e. B1.2). **Conf.:** Low.
- **Sources:** ch-ncsc-clickfix-2026, int-mitre-attack-enterprise.

**B1.6 `usb-drop-or-gift-device`**: a found or gifted USB stick or gadget
- **Sees:** a USB stick found in a car park or office, or a free gadget, plugged in out of curiosity.
- **Channel:** physical device carrying a digital payload. **Audience:** business, adult. **ATT&CK:** T1091, T1200.
- **Red flags:** an unknown device.
- **Habit:** don't plug in unknown devices; hand them to IT.
- **Reported in:** not verified in a European source this session (ATT&CK only). **Status:** candidate: not briefable until a European source is found. **Fit:** low (close to physical; Red Line 8 borderline). **Conf.:** Low (non-EU taxonomy only).
- **Sources:** int-mitre-attack-enterprise.

## B2 Fake and malicious mobile apps

**B2.1 `fake-bank-app-card-tap`**: a "bank" call or SMS makes you install an app, tap your card on the phone and enter your PIN
- **Sees:** an SMS or email about a "security problem", then a call from "the bank". You're asked to install an app from a link (not the official store), hold your card to the phone "to verify", and type your PIN. Cash is later withdrawn with your card details.
- **Channel:** SMS/email → call → sideloaded app. **Audience:** adult, older. **ATT&CK:** T1660, T1655.001, T1417.002 (mobile).
- **Red flags:** an app link outside the official store; any request to tap your card on the phone or enter your PIN in an app.
- **Habit:** install bank apps only from the official store; hang up and call the bank's official number. Your PIN is never needed by an app or caller.
- **Reported in:** PL (CERT Polska, Nov 2025). **Status:** candidate. **Fit:** high (phone + call + app devices). **Suggested:** Warsaw "season 2" or a new mobile chapter. **Conf.:** High (PL).
- **Sources:** pl-cert-ngate-2025, int-mitre-attack-mobile.

**B2.2 `sideloaded-tracking-app`**: a parcel SMS asks you to install a "tracking app"
- **Sees:** on some phones, the parcel link prompts you to install an app from outside the store and to allow unknown sources.
- **Channel:** SMS → app install. **Audience:** all. **ATT&CK:** T1660, T1655, T1582 (SMS control).
- **Red flags:** an app download from a text; a prompt to allow unknown sources.
- **Habit:** never install apps from links; use the carrier's official app from the store. If installed: airplane mode, tell the provider and bank, then reset.
- **Reported in:** DE (BSI warning, 2021; consumer centre 2026 mentions app installs). **Status:** candidate. **Fit:** high (Berlin variant). **Conf.:** Medium (2021 baseline, with a 2026 mention).
- **Sources:** de-breg-bsi-paket-sms-2021, de-vz-paketdienst-sms, int-mitre-attack-mobile.

**B2.3 `accessibility-permission-takeover`**: an app asks for accessibility or device-admin rights
- **Sees:** a newly installed app (often a "helper", "security" or "update" app) insists you enable accessibility services or device-admin rights; the phone then behaves oddly or locks.
- **Channel:** app. **Audience:** all. **ATT&CK:** T1626.001, T1516, T1517 (mobile).
- **Red flags:** a non-accessibility app asking for accessibility or admin rights; repeated nagging prompts.
- **Habit:** refuse; uninstall; install only from official stores; keep the OS updated.
- **Reported in:** EU (ENISA 2026: a campaign on some phones using accessibility services to hijack devices; more attacks on outdated mobiles). **Status:** candidate. **Fit:** high (permission-prompt mechanic). **Conf.:** Medium (EU-level).
- **Sources:** eu-enisa-etl-2026, eu-enisa-etl-2025-press, int-mitre-attack-mobile.

**B2.4 `cheat-or-cracked-software`**: free cheats, mods, cracked games or apps carry malware
- **Sees:** a video or chat offers a free cheat, mod or "full version"; it asks you to turn off antivirus or run an installer.
- **Channel:** video platforms, chats, download sites. **Audience:** teen. **ATT&CK:** T1204.002, T1036.
- **Red flags:** "disable your antivirus"; downloads outside official stores; too-good-to-be-true free paid content.
- **Habit:** install only from official stores or the developer; never disable protection for a download.
- **Reported in:** DE (police prevention booklet: illegal downloads often contain malware). **Status:** candidate. **Fit:** high (teen). **Suggested:** teen-focused chapter with A15.1. **Conf.:** Low–Medium (generic warning only).
- **Sources:** de-polizei-onlinetipps-2024, int-mitre-attack-enterprise.

## B3 Credential, session and MFA attacks

**B3.1 `infostealer-session-theft`**: saved passwords and logged-in sessions stolen from your computer
- **Sees:** after running something (B1.2, B1.4, B2.4), accounts get "new login" alerts, contacts receive spam from you, or crypto disappears, sometimes without any password prompt.
- **Channel:** follows malware delivery. **Audience:** all. **ATT&CK:** T1555, T1539.
- **Red flags:** login alerts you can't explain; logged-out sessions; messages you didn't send.
- **Habit:** from a clean device, change key passwords, log out all sessions, turn on MFA or passkeys; clean or reset the infected device.
- **Reported in:** EU (Europol: infostealers a "key enabler"; ENISA 2026), CH. **Status:** candidate. **Fit:** medium (good as the "damage control" outcome of B1.x). **Conf.:** High (EU-level).
- **Sources:** eu-europol-iocta-2026, eu-enisa-etl-2026, ch-ncsc-clickfix-2026, int-mitre-attack-enterprise.

**B3.2 `credential-stuffing-password-reuse`**: a password leaked elsewhere opens your other accounts
- **Sees:** "new sign-in" alerts or orders you didn't make on a shop, streaming or game account after another site was breached.
- **Channel:** account alerts. **Audience:** all. **ATT&CK:** T1110.004, T1078.
- **Red flags:** reusing a password; alerts after a breach.
- **Habit:** a unique password per site with a password manager; MFA or passkeys; change reused passwords starting with email and bank.
- **Reported in:** FR (CNIL), EU (stolen logins sold in bulk; credentials advertised). **Status:** candidate. **Fit:** high. **Suggested:** Home/ch0 echo or a "breach" chapter. **Conf.:** Medium–High.
- **Sources:** fr-cnil-data-leak-2024, eu-ec-home-iocta-2025, eu-enisa-etl-2026, int-mitre-attack-enterprise.

**B3.3 `aitm-phishing-code-relay`**: a fake login page that also takes your one-time code
- **Sees:** a perfect copy of a login page asks for password and then your SMS or app code; the real service logs you in, but someone else is also in.
- **Channel:** email or SMS → browser. **Audience:** all. **ATT&CK:** T1557, T1111.
- **Red flags:** the password manager doesn't autofill (wrong domain); you arrived via a link; the code prompt describes a different action.
- **Habit:** passkeys or security keys where offered; read what a code or approval is for; never log in via message links.
- **Reported in:** PL (CERT Polska knowledge base: autofill tell, passkeys best), EU (ENISA: phishing kits and phishing-as-a-service). **Status:** candidate. **Fit:** high (extends ch0). **Conf.:** Medium (no source names the AiTM technique for consumers; ENISA covers the kits).
- **Sources:** pl-cert-phishing-kb-2026, eu-enisa-etl-2026, int-mitre-attack-enterprise.

**B3.4 `mfa-fatigue-push-bombing`**: repeated login approval prompts you didn't start
- **Sees:** many "Approve sign-in?" notifications in a row, sometimes followed by a "support" call telling you to approve.
- **Channel:** authenticator app, call. **Audience:** adult, business. **ATT&CK:** T1621.
- **Red flags:** any approval request you didn't start; repeated prompts.
- **Habit:** deny; change your password (someone has it); tell IT or the provider.
- **Reported in:** EU (ENISA 2026: "MFA abuse" and vishing for MFA codes; push-bombing as such is not named). **Status:** candidate. **Fit:** medium (needs a European source before briefing) (the Stockholm rule applies: "never approve what you didn't start"). **Conf.:** Low–Medium (the mechanism is described by ATT&CK; the MAP research found no consumer-facing European source).
- **Sources:** int-mitre-attack-t1621, eu-enisa-etl-2026.

**B3.5 `oauth-device-code-consent`**: "enter this code" or "allow this app to access your mail"
- **Sees:** a message (sometimes in a trusted messenger) asks you to enter a short code on a real sign-in page, or to grant an app access to your mailbox or files.
- **Channel:** email, messenger → real provider page. **Audience:** adult, business. **ATT&CK:** T1528.
- **Red flags:** you are asked to authorise something you didn't start; broad permissions (read mail, offline access).
- **Habit:** only enter device codes for devices you are setting up yourself; review and remove app permissions.
- **Reported in:** EU (ENISA 2026: device-code phishing by several groups, including via trusted messengers; stolen OAuth tokens). **Status:** candidate. **Fit:** medium (abstract, but the "real page, wrong request" twist teaches well). **Conf.:** Medium.
- **Sources:** int-mitre-attack-t1528, eu-enisa-etl-2026.

**B3.6 `malicious-browser-extension`**: a "useful" browser extension that spies or breaks things
- **Sees:** an ad blocker or helper extension; later the browser crashes and asks you to "repair" it, or search results and pages change.
- **Channel:** browser extension store or prompt. **Audience:** all. **ATT&CK:** T1176.001.
- **Red flags:** extensions asking to "read and change all data on all websites"; crash-then-fix prompts.
- **Habit:** install few extensions, from known developers; review and remove unused ones.
- **Reported in:** EU (ENISA 2026: compromised browser extensions), CH (crash-then-fix variant). **Status:** candidate. **Fit:** medium–high. **Conf.:** Medium.
- **Sources:** eu-enisa-etl-2026, ch-ncsc-clickfix-2026, int-mitre-attack-enterprise.

## B4 Ransomware and extortion

**B4.1 `ransomware-personal-device`**: files locked, ransom note on screen
- **Sees:** files won't open; a note demands payment for a key.
- **Channel:** follows malware delivery. **Audience:** all, business. **ATT&CK:** T1486, T1471 (mobile).
- **Red flags:** n/a (a response scenario).
- **Habit:** don't pay; disconnect from networks; report to police; check the official No More Ransom portal (Where-to-report / Learn-more screen only) for free decryptors; restore from backup. Prevention: offline backups and updates.
- **Reported in:** EU (ENISA: "most impactful threat"; 47.3% of financially motivated claims in 2025). **Status:** candidate. **Fit:** medium (a strong damage-control drill; the cause must be a visible earlier decision). **Conf.:** High (EU).
- **Sources:** eu-nmr-leaflet, eu-enisa-etl-2025-press, eu-enisa-etl-2026, int-mitre-attack-enterprise.

**B4.2 `data-theft-extortion`**: "we have your data, pay or we publish"
- **Sees (as an employee or customer):** your organisation announces a breach and extortion; you may receive messages using the stolen data.
- **Channel:** news or notification → follow-up phishing. **Audience:** adult, business. **ATT&CK:** T1657.
- **Red flags:** see B8.1.
- **Habit:** see B8.1; don't contact the criminals.
- **Reported in:** EU (ENISA 2026: a shift from encryption to data exfiltration). **Status:** candidate. **Fit:** low (organisational; play it through B8.1). **Conf.:** Medium.
- **Sources:** eu-enisa-etl-2026, int-mitre-attack-t1657.

## B5 Networks, home devices and surveillance

**B5.1 `public-wifi-evil-twin`**: a free hotspot with a familiar name
- **Sees:** an open network such as "Free WiFi" or a café or station name; the phone may join automatically; sometimes a "login" page asks for your email password or card.
- **Channel:** Wi-Fi. **Audience:** travellers, all. **ATT&CK:** T1557.004 (Evil Twin).
- **Red flags:** open networks with generic names; captive pages asking for real account passwords or card data.
- **Habit:** turn off auto-join; use mobile data or a trusted VPN for banking; never enter account passwords on a hotspot login page.
- **Reported in:** DE (BSI). **Status:** candidate. **Fit:** medium (needs a Wi-Fi picker UI; good for travel chapters). **Conf.:** Medium (2023 page).
- **Sources:** de-bsi-public-wifi, int-mitre-attack-enterprise.

**B5.2 `smart-home-iot-botnet`**: router, camera or smart device taken over
- **Sees:** usually nothing; at most a slow connection, odd device behaviour or an ISP notice.
- **Channel:** home network. **Audience:** adult. **ATT&CK:** T1498 (devices used in DDoS).
- **Red flags:** an ISP or vendor warning; unknown devices in the router list.
- **Habit:** change default passwords, update firmware, follow the vendor or national agency's clean-up advice.
- **Reported in:** DE (BSI: the router is a main point of attack; infected devices can be joined into botnets). **Status:** candidate. **Fit:** low (invisible; play it as "you got an ISP notice: what now"). **Conf.:** Medium.
- **Sources:** de-bsi-smart-home-infection-2025, int-mitre-attack-enterprise.

**B5.3 `stalkerware-spyware`**: a monitoring app secretly installed on your phone
- **Sees:** someone close insists on "setting up" your phone or gives you one; they seem to know where you were or what you wrote.
- **Channel:** phone. **Audience:** teen, adult. **ATT&CK:** T1430, T1429, T1636 (mobile).
- **Red flags:** someone wants access to your phone; unknown device-admin apps; unexplained knowledge of your messages or location.
- **Habit:** set up phones yourself; strong screen lock; don't share codes; check linked devices and account logins; seek specialised help before removing anything if you're at risk.
- **Reported in:** DE (BSI). **Status:** candidate. **Fit:** low (intimate-partner abuse is a safeguarding topic; recommend a help card, not a scenario). **Conf.:** Medium.
- **Sources:** de-bsi-cyberstalking-safeguards, int-mitre-attack-mobile.

## B6 Supply chain

**B6.1 `compromised-software-or-package`**: a trusted app, update or extension is poisoned upstream
- **Sees:** a vendor notice: "a version you installed was compromised; update and change passwords".
- **Channel:** vendor notice, app update. **Audience:** all, business. **ATT&CK:** T1195.002.
- **Red flags:** n/a for the user before disclosure.
- **Habit:** act on genuine vendor notices that you check on the vendor's site, not via the notice's link; keep auto-updates on.
- **Reported in:** EU (ENISA 2026: compromises of popular libraries and software package libraries; ENISA 2025: abuse of the digital supply chain). **Status:** candidate. **Fit:** low (invisible; the only playable angle is telling a genuine notice from a fake one). **Conf.:** Medium.
- **Sources:** eu-enisa-etl-2026, eu-enisa-etl-2025-press, int-mitre-attack-enterprise.

## B7 Availability and hacktivism

**B7.1 `ddos-hacktivism`**: public websites knocked offline
- **Sees:** a government, transport or bank site is unreachable for hours, sometimes with claims on social media.
- **Channel:** web. **Audience:** all. **ATT&CK:** T1498, T1499.
- **Red flags:** outage plus "use this alternative site or number" messages (inferred risk; no source verified for scams riding outages).
- **Habit:** wait and use official channels; don't use "alternative" links from strangers.
- **Reported in:** EU (ENISA 2025: DDoS 77% of reported incidents; ENISA 2026: 51.3%, mostly hacktivist). **Status:** candidate. **Fit:** low (no player decision except "don't take the bait during an outage"). **Conf.:** High for prevalence, Low for the scam angle.
- **Sources:** eu-enisa-etl-2025-press, eu-enisa-etl-2026, int-mitre-attack-enterprise.

**B7.2 `website-defacement`**: a site's pages replaced with a message
- **Sees:** a known website shows propaganda or a hacker message.
- **Channel:** web. **Audience:** all. **ATT&CK:** T1491.
- **Red flags / habit:** don't download or follow links from the defaced page; use official status updates.
- **Reported in:** ATT&CK only (not verified in a European source this session). **Status:** candidate: not briefable until a European source is found. **Fit:** low. **Conf.:** Low.
- **Sources:** int-mitre-attack-enterprise.

## B8 Data exposure

**B8.1 `data-breach-follow-up`**: "your data was in a breach": what now, and the phishing that follows
- **Sees:** a notice from a company (or news) that your data leaked; soon after, unusually personal phishing (bank, social security, parcel). Sites offer to "check if you're affected".
- **Channel:** email, SMS, news. **Audience:** all. **ATT&CK:** T1657, T1566.002.
- **Red flags:** messages that use your real details to seem credible; third-party "breach check" offers (CNIL advises against them).
- **Habit:** change passwords (email, tax, bank first); no reuse; turn on MFA; type official addresses; watch accounts; if fraud happens, contact the bank and file a complaint.
- **Reported in:** FR (CNIL), EU (ENISA: data breaches 36% of financially motivated claims; Europol: "data has become a commodity for crime"). **Status:** candidate. **Fit:** high (a player-visible angle for invisible breaches). **Suggested:** a dedicated "breach" chapter, or the Paris intro. **Conf.:** High.
- **Sources:** fr-cnil-data-leak-2024, eu-enisa-etl-2026, eu-ec-home-iocta-2025.

**B8.2 `doxxing`**: personal details gathered and published to harass
- **Sees:** your address, school or phone posted online, often after an argument.
- **Channel:** social media. **Audience:** teen, adult. **ATT&CK:** T1593.001.
- **Red flags:** oversharing; unknown "friends".
- **Habit:** share only what's necessary; accept only people you know; report to the platform; tell someone.
- **Reported in:** DE (BSI cyber-stalking safeguards). **Status:** candidate. **Fit:** low (harassment, not fraud; help card). **Conf.:** Low–Medium (BSI covers sharing and cyberstalking generally, not doxxing by name).
- **Sources:** de-bsi-cyberstalking-safeguards, int-mitre-attack-enterprise.

## B9 Information manipulation

**B9.1 `deepfake-disinformation`**: AI-made fake news, videos and accounts in influence campaigns
- **Sees:** shocking videos or "news" pages that look like real media, shared by many new accounts.
- **Channel:** social media, web. **Audience:** all. **ATT&CK:** none fits well (influence operations are outside ATT&CK's scope).
- **Red flags:** unverified origin; copycat media domains; emotional urgency to share.
- **Habit:** check the outlet's own site; pause before sharing.
- **Reported in:** EU (EEAS FIMI reports; ENISA 2026: LLM-made media for influence campaigns). **Status:** candidate. **Fit:** low (not a scam; politically sensitive; a "learn more" card at most). **Conf.:** Medium (the EEAS page summary contains little detail).
- **Sources:** eu-eeas-fimi-2025, eu-enisa-etl-2026.

## B10 Resource abuse

**B10.1 `cryptojacking-and-sms-pumping`**: your device or account is used to mine crypto or send paid messages
- **Sees:** a hot, slow device, or unexplained SMS charges.
- **Channel:** device, phone bill. **Audience:** all. **ATT&CK:** T1496 (incl. T1496.003 SMS Pumping), T1643 (mobile).
- **Red flags:** unexplained charges; a constantly busy device.
- **Habit:** check the bill; remove unknown apps; ask the provider for a premium-SMS block.
- **Reported in:** not verified in a European source this session. **Status:** candidate: not briefable until a European source is found. **Fit:** low. **Conf.:** Low (ATT&CK only).
- **Sources:** int-mitre-attack-enterprise, int-mitre-attack-mobile.

---

## Excluded as out of scope (Red Line 8: offline decisive step)

| Pattern | Why excluded | Source |
|---|---|---|
| Courier or "bank employee" collects card, PIN or valuables at your door | Decisive step is an in-person handover. The preceding call is in scope (A4.2). | nl-fraudehelpdesk-2025, se-polisen-vishing-2026 |
| Cash or gold collected at home after a fake-police call | In-person pickup; the call itself is A4.3. | it-carabinieri-21-arresti-2025 |
| Fake utility technician or meter-reader visits | Doorstep fraud. | it-carabinieri-contro-truffe |
| Phone-payment-app trick carried out at an ATM | Decisive step at a physical ATM. | pt-deco-mbway-2021 |
| Paper-only fake invoices or lottery letters (no QR or URL) | No digital vector; letters are allowed only as QR/URL carriers (A14.3). | n/a (not researched) |
| Street tricks, card skimming and shoulder-surfing at ATMs | Physical; not researched this session. | n/a |
| Parcel forwarding itself (A8.4) | Kept only as recognition of the online recruitment message. | de-vzn-jobscamming-2026 |

**Kept out of scenarios for safeguarding (help card at most):** `sextortion-social-media` (G1), `violent-online-community-grooming`, `stalkerware-spyware`, `doxxing`.

---

## Uncertain points and open items

1. **Country coverage is uneven.** Sources cluster in DE, BE, FR, IE, PL, ES, NL, SE, CH. No national sources were checked for AT, CZ, DK, FI, GR, HU, RO, the Baltics or others. "Reported in" never means "only in".
2. **ATT&CK is a taxonomy, not evidence.** Every Part B entry pairs it with a European source except B1.6, B7.2 and B10.1 (ATT&CK only, marked Low). ATT&CK *group* and *campaign* pages were not used; technique pages are enough for the defender's view.
3. **Pages that failed to load:**
   - INCIBE traffic-authority smishing advisories (A11.2): server errors.
   - The Gendarmerie fake-summons prevention page (A11.3): failed to load.
   - The Belgian Finance ministry's fake eBox notice: captcha.
   - The Cybermalveillance webcam-blackmail fiches (A15.3): no text extracted.
   - The Europol IOCTA 2025 page: JavaScript only.
   Re-check these before any brief.
4. **Non-EU or older sources lead some entries.** Swiss NCSC leads A9.2, A13.3, B1.3 and B1.5. Old sources lead A2.3 (2021), A3.3 (2020), A3.4 (2021), A11.1 (2020) and A15.3 (about 2018). Confidence is lowered accordingly.
5. **The travel-authorisation launch timing** in eu-frontex-etias-sites-2024 has passed and was not re-verified; content must not state a date.
6. **Gaming (A15.1, B2.4)** lacks a European source focused on skin or currency lures. Specific lures appear only in vendor blogs, which are not cited. A national Safer Internet Centre source should be sought before briefing.
7. **AI voicebots (A4.7)** and **MFA fatigue (B3.4)** rest on EU-level or taxonomy sources only.
8. **Several ATT&CK ids are "closest fit"**, e.g. T1643 for ping calls and T1566.002 for QR stickers. ATT&CK has no consumer-fraud techniques for many Part A patterns; T1657 Financial Theft and T1684.001 Impersonation are used as umbrellas.
9. **File name:** the coordinator's scope change arrived before any file was written, so the catalogue was created directly as `THREAT_CATALOGUE.md`. The `used_for` label stays `campaign-catalogue` as originally specified.
