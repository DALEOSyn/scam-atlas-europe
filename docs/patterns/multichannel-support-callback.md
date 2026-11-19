# Pattern brief: `multichannel-support-callback`

**Chapters:** 1 (boss 1-9: SMS → customs invoice email → call from a fake "Larchwick Bank fraud team") and 0 (call beat of boss 0-6) · **Status:** rework 1 after sceptic FAIL (T-2.5, 2026-11-18) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** multi-step or "double" phishing; text-then-call scam; fake bank fraud-team call; spoofed caller ID.
- **Local names:** *falsi konsultanci* (PL) [pl-cert-fake-consultants]; *helpdeskfraude* (NL, the Fraudehelpdesk's top category for private individuals in 2025) [nl-fraudehelpdesk-2025]; "double phishing" (Swiss NCSC, 2026) [ch-ncsc-double-phishing-2026].
- **Where it is prominent and why:**
  - **Germany (chapter 1):** parcel and customs-fee messages are the hook there [eu-enisa-etl-2026], [de-zoll-phishing], [de-bnetza-zoll-sms-2023]. A follow-up call from a fake bank is the escalation.
  - EU: the European Payments Council describes spoofed sender names and numbers and messages that give a phone number to call instead of a link [eu-epc-threats-2025].
  - Spain: an SMS about an unrecognised transfer, in the bank's genuine SMS thread, leads to a call with a fake "security department" [es-incibe-smishing-bank-callback-2025].
  - Sweden: police say phone fraud often starts with an SMS giving a number to call [se-polisen-campaign-2026].
  - Switzerland (supporting): a parcel-fee SMS takes card details, then a caller posing as the bank's or card issuer's fraud team (caller ID may show the bank's real number) asks you to read out an SMS code or approve in the banking app "to stop" a suspicious transaction, which in fact authorises the payment [ch-ncsc-double-phishing-2026].
  - Why it works: each step seems to confirm the last one; a human voice feels more trustworthy than a text; the caller "already knows" details; and the call sounds like protection, not a demand.

## 2. Channel and psychological levers
**Channel:** SMS → email → phone call (1-9). What the victim sees:
1. A carrier-style SMS with details that look right (a plausible parcel, a real-looking reference) [de-vz-paketdienst-sms], [pl-cert-monthly-2025-12].
2. An email "customs invoice" asking for a small payment by card via a link [de-zoll-phishing], [de-bnetza-zoll-sms-2023], [ch-ncsc-double-phishing-2026].
3. A call from someone claiming to be the **bank's fraud team**, possibly showing the bank's name or number. They say a suspicious charge is under way and ask you to **read out the code you just received** or **approve a request in your banking app "to stop the charge"** [ch-ncsc-double-phishing-2026], [pl-cert-fake-consultants], [es-incibe-smishing-bank-callback-2025], [eu-epc-threats-2025].

**Levers:** consistency (three channels "agree"); authority (the bank's security team); fear (money leaving now); helpfulness ("we're stopping it for you"); urgency; the caller already knowing details.

## 3. Red flags a normal person can spot
1. **Caller ID can be faked.** The bank's name or real number on screen is not proof [pl-cert-fake-consultants], [ch-ncsc-double-phishing-2026], [eu-epc-threats-2025].
2. **A caller asks you to read out a code or approve something in your banking app**, even "to stop" or "cancel" a charge. Read what the code or approval is actually for; a real bank won't ask you to read out a code or approve anything to stop a payment; being asked for a TAN or code on the phone is always a sign of fraud [ch-ncsc-double-phishing-2026], [pl-cert-phishing-kb-2026], [pl-cert-fake-consultants], [de-vzhh-fake-bank-calls-2025].
3. **A message that asks you to call a number it gives you** [eu-epc-threats-2025], [se-polisen-campaign-2026], [es-incibe-smishing-bank-callback-2025].
4. **A customs or delivery fee asked for by email or link.** In Germany genuine customs assessments come by post, or the carrier collects at the door [de-zoll-phishing].
5. **Pressure to stay on the line or act right now,** so you can't check [ch-ncsc-double-phishing-2026], [pl-cert-fake-consultants].
6. **A "fraud alert" call shortly after you entered card details on a page you reached from a message.** The timing is the tell. *(Framing from the sequence in [ch-ncsc-double-phishing-2026]; flag as design framing.)*

## 4. The verification habit
**"Hang up. Call your bank back yourself on the number on your card or in the banking app you open. Never on the number in the message or the one that called you."** In the game: hang up → call back on the number on the card or in the Larchwick app. [ch-ncsc-double-phishing-2026], [pl-cert-fake-consultants], [eu-europol-phishing-leaflet], [se-polisen-campaign-2026]

GDD §17, 1-9: **done (T-2.6, game-designer).** The call-back target is now "the number on the Larchwick card or in the Larchwick app" (decision 2026-11-18, see §8).

## 5. Already caught? (generic + DE where verified)
1. **Read out a code or approved something:** call your bank now on the number on your card or in its app; ask it to block the card and stop or recall payments [ch-ncsc-double-phishing-2026], [es-incibe-smishing-bank-callback-2025].
2. **Paid a "fee" by card:** same, and ask about a chargeback [de-vz-paketdienst-sms], [de-bnetza-zoll-sms-2023].
3. **Opened a file or installed an app at a caller's request:** stop using the device, tell the bank, and get it checked [ch-ncsc-parcel-calls-2022], [pl-cert-fake-consultants].
4. **Keep evidence** (numbers, times, messages) and **report to the police**; keep a copy of the report for the bank [es-incibe-smishing-bank-callback-2025], [de-vz-paketdienst-sms]. In DE, SMS spam can also go to the Bundesnetzagentur [de-bnetza-zoll-sms-2023]. See `WHERE_TO_REPORT.md`.

## 6. Variations by country / local hooks
- **DE:** parcel or customs-fee SMS and emails as the opening step [de-zoll-phishing], [de-vz-paketdienst-sms], [eu-enisa-etl-2026].
- **ES:** bank "unrecognised transfer" SMS with a number to call, leading to a fake security department [es-incibe-smishing-bank-callback-2025].
- **SE:** SMS with a number to call; police campaign "dare to be rude" says hang up [se-polisen-campaign-2026].
- **PL:** fake consultants from banks or institutions, spoofed caller ID [pl-cert-fake-consultants].
- **CH (supporting):** parcel-fee page, then a fake bank-fraud call ("double phishing") [ch-ncsc-double-phishing-2026]. Older variant: calls from a fake delivery firm with a spoofed number pushing an emailed attachment, aimed at companies [ch-ncsc-parcel-calls-2022].

## 7. Genuine-twin notes (what a real version looks like)
- **1-1 genuine Trundle locker code:** from the carrier's usual short code, no link, matches an order you placed, and the same pick-up code shows in the Trundle app.
- **A real bank call:** a genuine bank fraud team never asks you to read out a code or approve something in the app to stop a payment, and is fine with you hanging up and calling back on the number on your card. If you call back that way, the real bank can tell you whether anything is wrong.
- **Jonas's genuine interrupt during beat 3** (GDD §17) is a good contrast: a known person on a known channel, asking for nothing sensitive.

## 8. Game-design notes (non-binding except where marked)
- **Decision (coordinator, 2026-11-18): beat 3 is a "Larchwick Bank fraud team" caller.** The caller asks for the code just texted, or for an approval in the Larchwick app, "to stop a charge". They do **not** ask for the customs invoice to be paid. This is directly sourced [ch-ncsc-double-phishing-2026].
- **Considered and rejected:** a "Trundle support" caller pushing invoice payment. No EU or national source found describes a fake courier support call of that kind (the only courier-call case is Swiss, 2022, aimed at companies and about opening an attachment [ch-ncsc-parcel-calls-2022]). Rejected for lack of sources.
- The call screen may show "Larchwick Bank" as the caller name to teach "caller ID can be faked". Any number shown must be **masked or from a range reserved for fiction** (Red Line 3), never a real bank number.
- Safe action: hang_up → call_back_known on the number on the Larchwick card or in the Larchwick app. Wrong actions: read out the code; approve in the app; call back on the number that called.
- Don't depict how numbers are spoofed; only that they can be.

## 9. Sources (all accessed 2026-11-18)
eu-epc-threats-2025 · eu-enisa-etl-2026 · eu-europol-phishing-leaflet · es-incibe-smishing-bank-callback-2025 · se-polisen-campaign-2026 · pl-cert-fake-consultants · de-vzhh-fake-bank-calls-2025 · pl-cert-phishing-kb-2026 · pl-cert-monthly-2025-12 · nl-fraudehelpdesk-2025 · de-zoll-phishing · de-vz-paketdienst-sms · de-bnetza-zoll-sms-2023 · ch-ncsc-double-phishing-2026 (supporting) · ch-ncsc-parcel-calls-2022 (supporting)

## 10. Confidence
**High** for the habit (hang up, call the bank back on the number on your card or in its app) and red flags 1–5: EU-level EPC plus CERTs and police in four countries.
**Medium-high** for the 1-9 chain as now designed: the parcel → card → fake bank-fraud call sequence is described in full by the Swiss NCSC (non-EU, 2026). The individual steps (parcel/customs lure; SMS or call leading to a fake bank security team asking for codes or in-app actions) are each confirmed by EU national bodies (DE, ES, PL) and the EPC.

**Unverified / caveats:**
- No EU-member source describes the full three-step chain in one place; the Swiss alert is supporting evidence.
- "Helpdeskfraude" in the NL figures covers fake bank helpdesks broadly; no split by how the first contact happened.
