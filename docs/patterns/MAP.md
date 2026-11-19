# City ↔ pattern map: evidence check (T-1.4)

> **Scope rule (Red Line 8, Roman, 2026-11-18):** every scenario must hinge on a digital or cyber vector. Purely offline fraud (doorstep visits, paper-only letters, in-person handovers) is **out of scope**; a letter or poster may appear only as the carrier of a QR code or URL. This map was revised on 2026-11-18 to apply that rule.

**Owner:** fraud-researcher · **Researched / accessed:** 2026-11-18 · **Status:** rework 1 after sceptic FAIL (2026-11-18)
Source ids refer to `content/sources.research.yaml` (to be merged into `content/sources.yaml`).

**How to read this.**
- **Verdict:**
  - *Confirm*: an official source shows the pattern is prominent or reported in that country.
  - *Adjust*: keep the city, but change or add a pattern.
  - *Replace*: the evidence points elsewhere.
- **Confidence:**
  - *High*: tier-1/2/3 official sources, recent (2025–26), specific to that country.
  - *Medium*: official but old, or only via news/consumer association, or EU-wide rather than country-specific.
  - *Low*: no official country source found this session.
- **A city is a stage, not a claim.** Almost every pattern here exists across Europe. A chapter tells the player "this is common here *and* elsewhere". The debrief must never say a scam "is Dutch" or "is Italian".
- **Never compare figures between countries on screen.** National numbers reflect how well each country records and reports fraud, its definitions and its reporting channels, not how "scam-prone" its people are. Figures in this file are for researcher and designer context only. If a debrief ever shows a figure, show one figure from one named source with its year, and never rank or compare countries.
- **Real payment products** named here (e.g. BLIK, MB WAY, BankID) are research labels only. In game content they become fictional equivalents ("6-digit instant payment code", "phone-number payment app", "national e-ID app") per Red Line 1.

## Summary table

| # | City | Draft patterns | Verdict | Proposed patterns | Habit (one line) | Conf. |
|---|---|---|---|---|---|---|
| 0 | Home | Email phishing, fake password reset | Confirm | same | Didn't start it? Don't use the link: open the app or type the address yourself. | High |
| 1 | Berlin | Parcel smishing, fake customs fee | Confirm | same (fee by SMS and emailed invoice; no customs letter. A delivery-card QR is held only as a swap, with the lesson on the QR destination) | Track parcels only in the carrier app/site you open, with the tracking number from your order. | High |
| 2 | Amsterdam | "Hi Mum, new number"; fake payment-request links | Adjust | "Hi Mum / friend in need" via messenger (keep); **replace** payment-request links with a **task/"easy work" job scam** run through a messenger chat plus a fake task-platform site | Before paying a "new number", call the old one or ask a question only they'd know. Never deposit money into a "job" platform. | Med-High |
| 3 | Paris | CEO fraud / invoice IBAN change | Confirm, adjust framing | CEO/BEC + supplier/landlord IBAN change; add **payee-name check** warning | Verify any payment-detail change on a number you already have, and heed the bank's name-mismatch warning. | Med-High |
| 4 | Madrid | Spoofed bank SMS in real thread + fake bank call | Confirm | same ("safe account" move) | Your bank never asks you to move money "to safety". Hang up and call the number on your card. | High |
| 5 | Warsaw | Marketplace "safe delivery" link; payment code to hacked friend | Confirm | same | Stay on the platform; never share a payment or login code, even with a "friend". | High (marketplace) / Med (code) |
| 6 | Rome | Fake police/grandchild calls; fake utility visits | Adjust | Fake police/bank and family-emergency calls with **spoofed caller ID**; family emergency via a **messenger "new number"**; **AI-cloned voice** variant. Fake utility visits **dropped (offline, out of scope)** | A familiar number or voice proves nothing: hang up and call the relative or 112 on a number you already know. Agree a family code word. | High (call scripts) / Medium (voice cloning) |
| 7 | Lisbon | Fake shops, holiday rentals, tampered QR on parking meters | Adjust | **Holiday/student rental** (lead) as fake listing/booking sites, off-platform payment links and platform-login phishing; tampered QR; fake shop. Phone-payment-app ATM trick **dropped (ATM step is offline)** | Book, message and pay only inside the platform's app you opened yourself; never log in or pay via a link the "host" sends; type the official URL instead of scanning stickers. | Medium |
| 8 | Dublin | Investment/crypto with fake celebrity ads; recovery scams | Confirm | same | Check the regulator's register yourself; nobody legit recovers money for a fee. | High |
| 9 | Stockholm | eID/MFA approval fatigue; fake support asking to approve login | Adjust (reframe) | "Never sign/log in with your e-ID because someone contacted you" (vishing + e-ID), incl. login-QR request | Never approve a sign-in or signature you didn't start, whoever is on the phone. | High (reframed) |
| 10 | Brussels | Romance arc payoff; tech-support remote access; mix | Confirm, **add** | romance→investment (dating app / messenger), tech-support remote access, plus **money-mule recruitment via social media or messenger** | Pause, verify, talk to someone. Never give anyone access to your banking app, account or device, or install remote-access software. | Med-High |

---

## Per-chapter evidence

### Ch 0 — Home: email phishing / fake password reset → **Confirm (High)**
- **Evidence:**
  - phishing is the leading intrusion vector in ENISA's data (~60% for Jul 2024–Jun 2025; 77.8% of social-engineering vectors in 2025) [eu-enisa-etl-2025-press], [eu-enisa-etl-2026];
  - Europol: phishing remains among the most common fraud methods [eu-europol-iocta-2026];
  - unsolicited password-reset requests are a named red flag [ie-ncsc-phishing-guide].
- **Brief:** `email-phishing-credential.md`.
- **Habit:** open the app or type the address yourself [de-bsi-protect-phishing], [fr-cybermalveillance-fiche-hameconnage].

### Ch 1 — Berlin: parcel smishing / customs fee → **Confirm (High)**
- **Evidence:**
  - ENISA 2026 names large-scale logistics-impersonation smishing aimed **mainly at Germany** [eu-enisa-etl-2026];
  - German consumer centres (updated July 2026) [de-vz-paketdienst-sms];
  - Federal Network Agency [de-bnetza-zoll-sms-2023] and Customs [de-zoll-phishing].
- **Brief:** `smishing-parcel-fee.md`.

### Ch 2 — Amsterdam → **Adjust (Medium-High)**
- **"Hi Mum / friend in need" (keep, Medium-High):**
  - Dutch police published a dedicated report form for *hulpvraagfraude* dated 1 Sep 2025. It describes the fake friend or relative with a hacked or "new" number, an urgent money request and a frequent second request, mostly on WhatsApp [nl-politie-hulpvraagfraude-2025];
  - the Netherlands was an early hotspot (2020 reports exceeded all of 2019) [nl-betaalvereniging-friend-in-need-2020];
  - pan-EU: the ESAs factsheet covers relative impersonation, including cloned voices [eu-esas-ai-scams-factsheet-nl].
  - *Caveat:* Fraudehelpdesk's 2025 review does not list it in the top 3. The top 3 are helpdesk fraud, buy/sell fraud and advance-fee fraud [nl-fraudehelpdesk-2025].
- **Fake payment-request links → replace (Low evidence):** I found no official 2025–26 Dutch source this session that quantifies payment-request-link phishing.
- **Proposed replacement: task / "easy work" job scam (Medium):**
  - **Part-year figures, via news:** NOS (6 Aug 2025), citing Fraudehelpdesk, reports that 2025 reports to that date were already 10× the whole of 2024, 88% started with a phone call, and the average loss was €6,500. These are mid-year, not full-year, and come from a news report, not a Fraudehelpdesk publication [nl-nos-easy-work-2025]. Fraudehelpdesk's full-year 2025 review does not itemise this type [nl-fraudehelpdesk-2025]. Don't put these figures on screen;
  - the EPC describes task scams with small early payouts across Europe [eu-epc-threats-2025];
  - it fits a 14+ audience and leads into money-mule awareness (ch 10).
  - **Digital framing (Red Line 8):** a messenger chat offers paid "tasks" (e.g. rating products). The player is sent to a **fake task-platform website/app** that shows growing "earnings", pays out a small amount once, then asks for deposits to "unlock" tasks, or says not enough tasks are done and you must pay more to finish the set (producer 2026-11-19, aligned to docs/patterns/task-job-scam.md). Accuracy note: NOS reports that most Dutch reporters were first contacted by a phone call, with SMS, WhatsApp and social-media ads also used [nl-nos-easy-work-2025]. The game uses the messenger variant, which is one of the reported channels. The deposit-to-a-platform mechanic is described in both [nl-nos-easy-work-2025] and [eu-epc-threats-2025].
  - **Habit:** a real job never asks you to pay in; never deposit money into a "job" site; look the company up yourself.
- **Habit:** call the old number or speak in person; ask a question only they'd know; check the account name against the one you know [nl-politie-hulpvraagfraude-2025].
  - Note: since 9 Oct 2025, euro-area banks must offer a free **payee-name check** [eu-ec-ipr-vop-2025], [eu-ecb-ipr]. A mismatch warning is a useful in-game cue.
  - But "Hi Mum" scammers often say "pay my friend's account", so the name check alone doesn't save you. The voice check is the habit.

### Ch 3 — Paris: CEO fraud / IBAN change → **Confirm, adjust framing (Medium-High)**
- **Evidence:**
  - Gendarmerie guidance on *faux ordre de virement* / *arnaque au Président* (urgent confidential transfer from a fake executive or lawyer; supplier bank-detail change; SMEs, artisans and local authorities targeted) [fr-gendarmerie-fovi];
  - EU banking federation lists CEO/BEC and supplier IBAN change [eu-ebf-cyberscams];
  - Swedish police put CEO/BEC proceeds at SEK 214m in 2025, which shows the pattern is Europe-wide [se-polisen-proceeds-2026].
- **Concern for a 14+ consumer audience:** BEC mainly hits businesses. Two ways to keep it relevant:
  - it fits the "trust inspector" job premise, so play it as the player's workplace task;
  - add a **consumer** variant: a landlord, sports club or tradesperson "changed bank details", delivered by **email or messenger** (Red Line 8: never a paper-only notice). This variant is *inferred* from the supplier-IBAN pattern; no consumer-specific official source was verified.
  - **Update 2026-11-19 (Paris briefs):** the landlord and tradesperson variants are now **sourced** [fr-cybermalveillance-fiche-faux-rib], [fr-fbf-cles-faux-rib-2025]. The sports-club and school variants remain inferred. See `ceo-fraud-bec.md` and `payment-detail-change.md`.
- **France also strong for "fake bank adviser":** manipulation fraud was 32% of French payment-fraud value in 2024 [fr-bdf-osmp-2024]. That overlaps with Madrid, so keep it there.
- **Habit:** verify any payment change on a number you already hold; follow a fixed two-person validation [fr-gendarmerie-fovi]; take a "no match" payee-name warning seriously [eu-ecb-ipr].

### Ch 4 — Madrid: spoofed bank SMS in the real thread + fake bank call → **Confirm (High)**
- **Evidence:**
  - INCIBE warning (30 Sep 2025, severity *Alta*). An SMS about a big unrecognised transfer appears **in the bank's genuine SMS thread** and gives a number to call. A fake "security department" walks the victim through the **real app** to move money to a "backup security account" [es-incibe-smishing-bank-callback-2025];
  - the EPC confirms spoofed sender IDs and messages that give a phone number instead of a link [eu-epc-threats-2025];
  - France's figures show this manipulation type is big elsewhere too [fr-bdf-osmp-2024].
- **Habit:** hang up and call the number on your card or in your app; no bank asks you to move money to a "safe" account [es-incibe-smishing-bank-callback-2025], [eu-europol-phishing-leaflet].
- **Update 2026-11-19 (T-3.6r):** brief `bank-safe-account-call.md`, per-beat list `ch4-madrid-sources.md`. Added Banco de España pages on SMS and caller-ID spoofing [es-bde-sms-callerid-spoofing-2022], [es-bde-vishing-2020]. Spain's SMS sender register: operators must block SMS under unregistered sender names from **15 Sept 2026** [es-boe-orden-tdf-149-2025], [es-boe-cnmc-circular-3-2026], [es-cnmc-alias-callout-2026]. No source measures its effect, so the lesson stays "the real thread is no proof".

### Ch 5 — Warsaw → **Confirm (High for marketplace; Medium for payment-code)**
- **Marketplace "collect your payment" link:**
  - CERT Polska (Dec 2025 + full-year 2025): a fake marketplace "buyer" claims to have paid and sends a link to a fake withdrawal page that also imitates couriers;
  - 2025 had 260.8k incidents (~98% fraud) and 244.3k malicious domains blocked [pl-cert-monthly-2025-12].
- **Code request from a hijacked friend:**
  - NASK guide describes a friend's social account taken over to ask for the 6-digit banking-app code [pl-nask-metoda-na-2020]. Official but from 2020; current prevalence comes only from news (not cited).
- **Habit:** keep the deal and the payment on the platform; never share a payment or login code; confirm "friends" by calling [pl-nask-metoda-na-2020], [eu-esas-ai-scams-factsheet-nl].
- **Update 2026-11-19 (T-3.6r):** briefs `marketplace-collect-payment-link.md` and `hijacked-friend-payment-code.md`, per-beat list `ch5-warsaw-sources.md`. Marketplace pay-out pages confirmed again in CERT Polska's Jan and Mar 2026 summaries [pl-cert-monthly-2026-01], [pl-cert-monthly-2026-03] and NASK's 2025 seller checklist [pl-nask-okazja-czy-pulapka-2025]. Payment code: a police-hosted warning (undated) describes the code-and-confirm flow [pl-policja-psp-na-znajomego]; CERT Polska 2026 confirms friend-account takeovers used for loan requests [pl-cert-monthly-2026-07]. Confidence for the code pattern raised to **Medium-high**; no 2026 official source names the code itself.

### Ch 6 — Rome: fake police / bank and family-emergency calls (digital vectors) → **Adjust (High for call scripts; Medium for voice cloning)**
- **Scope change (Red Line 8):**
  - **Fake utility / technician visits are dropped.** They are doorstep fraud, so out of scope.
  - The in-person cash/gold collection that ends many Italian fake-police cases is **not depicted**. Scenarios end at the call or message, which is where the player can still act.
- **Vector 1: phone call with spoofed caller ID (fake police, lawyer or bank):**
  - Carabinieri: fake Carabinieri, lawyer or doctor calls about a relative's crash or arrest; scammers use **numbers that look like bank helplines** [it-carabinieri-contro-truffe];
  - Carabinieri operation (16 Dec 2025): callers kept the line open so victims couldn't check [it-carabinieri-21-arresti-2025] (cited for the call script only);
  - EU level: spoofed phone numbers and SMS sender names make contacts appear to come from a bank or authority [eu-epc-threats-2025], [eu-esas-ai-scams-factsheet-nl].
- **Vector 2: messenger "new number" from a relative in trouble:** see ch 2 [nl-politie-hulpvraagfraude-2025]. Carabinieri also describe fake-relative calls asking for an urgent transfer [it-carabinieri-contro-truffe].
- **Vector 3: AI-cloned voice of a relative:**
  - cloned voices are used in family-emergency scams [eu-epc-threats-2025];
  - impersonation of relatives with voice cloning and deepfakes; advice is a family safe word [eu-esas-ai-scams-factsheet-nl];
  - **new source (see "Sources to add" below):** BSI explains how fake voices are produced and are already used in fraud calls (CEO fraud). It lists audible tells such as a metallic sound, odd emphasis and a delay before replies [de-bsi-deepfakes]. BSI's page is from 2022 and doesn't mention calls impersonating relatives; that application comes from the EU sources above.
  - *Teach no audible tells as reliable.* Voice quality is improving, so the habit (call back, code word) is the lesson, not "listen for a metallic voice".
- **Why Medium for voice cloning:** no EU or national prevalence figures were found; the evidence is that these scams exist, not how common they are.
- **Habit:** a familiar number or voice proves nothing. Hang up, then call the relative on their known number, or 112. Police never ask for money. Use a family code word [it-carabinieri-contro-truffe], [eu-esas-ai-scams-factsheet-nl].
- **Tone note (Red Line 5):**
  - The cases in the sources mostly involve older people. Older characters must still be shown as capable: "gran" spots at least one tell herself, or is the one who checks. Her near-miss comes from the script (a continuous call, fear for a grandchild), not from age or confusion.
  - Elsewhere in the game, a **younger** character also falls for a family-emergency script, for example the "Hi Mum" message in Amsterdam or a cloned-voice call. That shows the lever is fear for someone you love, which works at any age.
  - No mocking, and no "silly old people" framing.

### Ch 7 — Lisbon → **Adjust (Medium)**
- **Holiday / student rental (promote to lead):**
  - PSP figures reported by Lusa/RR: 4,553 fake-rental fraud cases in 2023–25 [pt-rr-psp-rentals-2026] (news);
  - PSP + platform summer warning, July 2026 [pt-dn-psp-airbnb-2026] (news);
  - official EU consumer guidance on rental fraud [de-evz-rental-fraud];
  - Europol notes fake accommodation listings in ads [eu-europol-iocta-2026].
  - Good fit: a travelling player, and students looking for rooms.
  - **Digital framing (Red Line 8):** the scenario must hinge on one of these vectors, each sourced:
    - a **fake listing or booking site** imitating a real platform [pt-dn-psp-airbnb-2026] (news);
    - an "owner" who moves the chat and **payment off-platform** via a link or a bank transfer request [pt-dn-psp-airbnb-2026], [de-evz-rental-fraud];
    - **platform-login phishing**: an email or message that looks like it's from the platform and asks you to log in via a link, leading to a fake page that captures your password or card details [de-evz-rental-fraud], [pt-dn-psp-airbnb-2026].
  - The "landlord is abroad, can't show the flat" story is fine as context, but the decision point must be the link, payment request or login.
- **Tampered QR codes:**
  - GNR warning (24 Mar 2026) about stickers on menus, fake parking-fine notices and posters [pt-portugalpost-gnr-quishing-2026] (news report of a GNR post);
  - official guidance elsewhere: Ireland's NCSC on parking payment points [ie-ncsc-qr-guide]; Belgium's Safeonweb on EV chargers [be-safeonweb-qr-chargers]; the EPC [eu-epc-threats-2025].
- **Fake shops:** EU-wide [eu-eccnet-online-fraud]. The strongest country data found was Poland's [pl-polskieradio-fake-shops-2025], not Portugal's.
- **Dropped (Red Line 8):** the phone-payment-app ATM trick. Its decisive step is carried out in person at an ATM, so it is out of scope. [pt-deco-mbway-2021] is now cited only in the out-of-scope row of the missing-patterns table.
- **Why only Medium:** the Portugal-specific sources are news reports of police statements. The PSP and GNR originals were not fetched, and the Banco de Portugal pages were unreachable this session.
- **Habit:** book, message and pay only inside the platform's app or site you opened yourself; never log in or pay via a link the "host" sends; check for stickers over QR codes and type the official address instead [pt-dn-psp-airbnb-2026], [de-evz-rental-fraud], [ie-ncsc-qr-guide].

### Ch 8 — Dublin: investment / crypto ads, recovery scams → **Confirm (High)**
- **Evidence:**
  - Garda (2 Oct 2025): €8.58m reported stolen by end of July 2025; +21% in 3 months; fake bond and deposit ads [ie-garda-investment-2025];
  - FraudSMART (10 Nov 2025): ~€31m lost in 2024; AI-generated celebrity endorsement ads lead to an "adviser" call [ie-fraudsmart-investment-2025];
  - recovery scams with upfront fees [ie-bpfi-recovery-2024];
  - EU-wide: investment fraud especially prevalent via ads on large platforms [eu-europol-iocta-2026].
  - *Correction (rework):* an earlier draft said "€4.2bn EEA online investment fraud in 2024". That was wrong. The joint EBA-ECB report puts **total EEA payment fraud** (all types) at €4.2bn in 2024 [eu-eba-ecb-fraud-2025]. It gives no investment-fraud figure. Don't use €4.2bn as an investment figure anywhere.
- **Habit:** find the firm yourself on the regulator's register and call it on an independently found number; never pay a fee to recover money [ie-fraudsmart-investment-2025], [ie-bpfi-recovery-2024].

### Ch 9 — Stockholm → **Adjust: reframe (High once reframed)**
- **Why reframe:** "MFA approval fatigue / push bombing" did not appear in any consumer-facing source checked; ENISA 2026 does not mention it [eu-enisa-etl-2026]. The Swedish evidence is about victims being talked into **logging in or signing with their e-ID** during a call.
- **Evidence:**
  - Swedish police: victims are manipulated into using their e-ID to move money. Advice: never log in with e-ID because a caller asks [se-polisen-vishing-2026], [se-polisen-campaign-2026]. (The police also mention follow-up home visits. Those are out of scope under Red Line 8 and are not depicted.)
  - police campaign Sept 2026: "Dare to be rude", aimed at people 60+ [se-polisen-campaign-2026];
  - EPC: victims asked to approve **login QR codes** sent via messaging apps [eu-epc-threats-2025].
- **Note:** Swedish police say proceeds from phone fraud have **more than halved since 2023 and keep falling**, but attempts (incl. mass SMS) are rising [se-polisen-vishing-2026], [se-polisen-proceeds-2026]. The figures are in the source notes; the two police releases give slightly different 2025 values. Investment (SEK 1.6bn) and romance (SEK 551m) are bigger by value [se-polisen-proceeds-2026].
- **Habit:** never approve a sign-in, signature or QR login you didn't start yourself; hang up and call the bank [se-polisen-campaign-2026].

### Ch 10 — Brussels finale → **Confirm + add money mules (Medium-High)**
- **Romance (arc payoff):**
  - Belgian police Valentine's warning (2026) [be-police-romance-2026];
  - romance is Sweden's #2 by proceeds [se-polisen-proceeds-2026];
  - dating-to-investment pipeline [eu-esas-ai-scams-factsheet-nl].
- **Tech support / remote access:**
  - among the most common typologies reported by Member States [eu-europol-iocta-2026]; fake remote support [eu-epc-threats-2025]; never install remote-access software [eu-esas-ai-scams-factsheet-nl];
  - *no Belgium-specific official source found* (EU-level evidence only).
- **Money mules (add):**
  - Febelfin (Aug 2025): 14% of young Belgians would share bank card + PIN for money (5% overall); 45% of young people have never heard of money muling [be-febelfin-phishing-2025];
  - Europol EMMA flyers [eu-europol-mule-jobs], [eu-europol-mule-flyer-ie].
  - **Digital framing (Red Line 8):**
    - recruitment arrives as a DM, a messenger chat or a social-media ad promising "easy money" [eu-europol-mule-jobs], [eu-europol-mule-flyer-ie];
    - the ask is to let money pass through your account, or to hand over your **banking-app login or access**.
    - The lesson: **never share banking-app access, login codes or your account with anyone**.
    - Accuracy note: Febelfin's survey asked about sharing a **bank card and PIN** [be-febelfin-phishing-2025]. Europol's flyers warn against giving bank-account details and using your own account to move money for others [eu-europol-mule-jobs]. The "banking-app access" wording is the game's digital translation of those, not a quoted statistic.
  - **Framing (non-threatening):** the player is the target of a trap, never the "criminal". The debrief line is "If you're already involved: stop, tell a trusted adult, then your bank and the police." The Febelfin percentages are for designers only and are not shown on screen (see "never compare figures" above).
- Belgium also runs a high-volume national reporting address that the finale's "report" mechanic can model generically [be-ccb-safeonweb-2025].
- **Habit:** pause, verify, talk to someone you trust; never let anyone use your account, card or device.

---

## Missing patterns: candidates

Every row states its digital vector. Rows marked **Out of scope** fail Red Line 8 and must not become scenarios.

| Pattern | Why it belongs | Suggested placement | Evidence | Conf. |
|---|---|---|---|---|
| **Money-mule recruitment via social media / messenger** ("easy money, just use your account"). Vector: DM, messenger, social ad; ask to share banking-app access or receive and forward money. Lesson: never share banking-app access, codes or your account. | Directly targets under-35s incl. minors; consequences fall on the person whose account is used. **Framing:** never threatening or shaming. The scenario shows the offer as a trap set *for* the player. The debrief says: "If you're already involved: stop moving money, tell a trusted adult, then your bank and the police. Getting help early is the right move, and you won't be in trouble for asking." Consequences (account closure, legal risk, per [eu-europol-mule-flyer-ie]) are stated factually and once, as the reason to get help, not as a scare. | Brussels (finale) or a mid-game social-media scenario; also a "learn more" card | [eu-europol-mule-jobs], [eu-europol-mule-flyer-ie], [be-febelfin-phishing-2025], [eu-europol-iocta-2026] | **High** |
| **Task / "easy work" job scam**. Vector: messenger chat plus a fake task-platform site with deposits. | Fast-growing; teens and students look for side income | Amsterdam (replaces payment-request links) | [nl-nos-easy-work-2025] (news), [eu-epc-threats-2025] | Medium |
| **Rental scams (student room / holiday)**. Vector: fake listing/booking sites, off-platform payment links, platform-login phishing. | Students and travellers | Lisbon (lead) | [de-evz-rental-fraud], [pt-rr-psp-rentals-2026], [pt-dn-psp-airbnb-2026] | Medium (same as ch 7: the EU guidance is official, but the Portugal-specific figures come via news) |
| **AI voice cloning / deepfake relative or executive**. Vector: phone or voice-message call with a cloned voice, often with a spoofed number. | Changes the "I recognised the voice" check; drives the family-code-word habit | Variant in Rome (relative) and Paris (executive) | [eu-esas-ai-scams-factsheet-nl], [eu-epc-threats-2025], [be-ccb-safeonweb-2025], [de-bsi-deepfakes] (to add) | Medium (no EU prevalence figures found) |
| **Bank helpdesk fraud: phone/SMS part** ("your account is compromised"). Vector: spoofed call or SMS, then pressure to move money in the app or read out codes. | Dutch #1 by reports in 2025 | Covered by Madrid; Rome boss variant | [nl-fraudehelpdesk-2025], [se-polisen-vishing-2026], [eu-epc-threats-2025] | High |
| ~~Bank helpdesk fraud: home pick-up of card~~ (courier collects card/valuables at the door) | Real and growing ("online-to-offline") | **Out of scope (Red Line 8):** the decisive step is an in-person handover. Only the preceding call is in scope (row above). | [nl-fraudehelpdesk-2025], [se-polisen-vishing-2026] | n/a |
| ~~Fake utility / technician visits~~ | Real in Italy | **Out of scope (Red Line 8):** doorstep fraud. Removed from Rome. | [it-carabinieri-contro-truffe] | n/a |
| ~~Phone-payment-app ATM trick~~ (seller talked through an ATM) | Real in Portugal (2021 source) | **Out of scope (Red Line 8):** decisive step at a physical ATM. Removed from Lisbon. | [pt-deco-mbway-2021] | n/a |
| **Messaging/social account takeover via shared verification code**. Vector: messenger / SMS code request. | Precondition for the "hacked friend" scams; very relevant to teens | Warsaw or Amsterdam pre-scene | [pl-nask-metoda-na-2020] (hijacked accounts); code-sharing mechanics not verified on an official source this session | Low-Medium |
| **Sextortion (financial)**. Vector: social media / messenger. | High harm for 14–17s | **Do not dramatise.** Learn-more / where-to-get-help card only, pending a G1 decision | Europol press page title only; body not readable this session | Low (needs dedicated research + safeguarding review) |
| **Fake charity / disaster appeals**. In scope only if the vector is digital (social post, SMS link, fake donation site); street or door collections are out of scope. | Seasonal; plausible | Not recommended yet | No EU or national official source found this session | Low |


- **Annotation needed:** `pt-deco-mbway-2021` is now cited only in the out-of-scope row above. Its `used_for` should become `[MAP-missing]`, with the note "out of scope under Red Line 8".
- **Checked but not added:** Polisen "Scam calls" (https://polisen.se/en/victims-of-crime/protect-yourself-against-fraud/scam-calls/, reviewed 2026-08-18) and two Safeonweb fake-police warnings (pages failed to load). The Polisen page mentions neither spoofed numbers nor voice cloning, so it doesn't support the Rome claims.

---

## Cross-cutting corrections for the GDD and scenario-writer
1. **Padlock/https is not a trust signal.** Teach it as "necessary, never sufficient" [pt-gnr-phishing], [ch-ncsc-links-2025].
2. **Spelling mistakes are no longer a dependable tell** because of AI [be-ccb-safeonweb-2025], [eu-esas-ai-scams-factsheet-nl]. Make them bonus clues only.
3. **Payee-name check (Verification of Payee)** is live in the euro area since 9 Oct 2025; non-euro EU deadline is 9 Jul 2027 [eu-ec-ipr-vop-2025], [eu-ecb-ipr]. Model a fictional "name doesn't match" warning in the banking-app device. Teach that a matching name proves only *whose* account it is, not that the request is genuine.
4. **Re-victimisation.** Europol notes victims are "relentlessly re-victimised" [eu-europol-iocta-2026]. Recovery-scam follow-ups belong in the "already caught?" debriefs of every money-loss scenario, not only in Dublin.
