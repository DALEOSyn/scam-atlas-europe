# Pattern brief: `rental-offplatform-payment`

**Chapter:** 7 Lisbon (GDD §18: holiday and student rental scams, digital vectors only; LO-11, LO-10, LO-02, LO-05) · **Status:** draft for review (T-3.8r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** rental scam; fake holiday let; fake listing; accommodation phishing; "pay the host directly".
- **Local (PT):** *burla no arrendamento* / *arrendamentos falsos* (police and news wording) [pt-rtp-gnr-rentals-2026], [pt-rr-psp-rentals-2026]; *sinal* is the deposit asked "to secure" the booking [pt-rtp-gnr-rentals-2026].
- **Game label:** a fictional rental platform (brand to be registered by ux-artist in `brands.yaml`; GDD §18). No real platform name, colours or UI (Red Line 1). All hosts `.example`.
- **Why Portugal is the stage:**
  - The PSP reports 4,553 fake-rental fraud cases in 2023–25 [pt-rr-psp-rentals-2026] (news of a PSP release).
  - The GNR counted 725 home purchase or rental scams in 2025, 86 of them in the Lisboa district [pt-rtp-gnr-rentals-2026] (news of a GNR warning).
  - The PSP warned of rising holiday-accommodation scams in July 2026 [pt-dn-psp-airbnb-2026]. The PSP and the national cybersecurity centre CNCS ran a traveller campaign in June 2025 [pt-dn-psp-cncs-campaign-2025].
  - All Portugal-specific figures come **via news**. The originals were not fetched.
  - Students hunting for rooms and travellers booking short stays are both targets.

## 2. Channel and psychological levers
Three digital shapes, each sourced:
- **A. Fake listing.**
  - A listing with photos copied from a real home and a below-market price [pt-rtp-gnr-rentals-2026], [de-evz-rental-fraud].
  - The listing may sit on a real platform, or on a look-alike site that copies a legitimate one [pt-dn-psp-airbnb-2026], [eu-europol-iocta-2026].
  - The "landlord" is often abroad and can't show it [de-evz-rental-fraud].
- **B. Off-platform payment.**
  - The "host" moves the chat to email or a messenger.
  - The host then asks for a deposit by direct bank transfer or through a link they send, sometimes presented as a "secure" or escrow payment [pt-dn-psp-airbnb-2026], [de-evz-rental-fraud], [pt-dn-psp-cncs-campaign-2025].
  - The ESAs describe marketplace deals moved off-platform that end at a fake bank login [eu-esas-ai-scams-factsheet-nl].
- **C. Platform-login phishing.**
  - An email that "looks as if it has been sent by the platform operators" asks you to log in through a link, and the login details are captured [de-evz-rental-fraud].
  - In the Netherlands, phishing linked to booking sites rose about tenfold in early 2026. Guests got messages that seemed to come from the place they had booked, asking for an extra payment [nl-nltimes-booking-phishing-2026] (news of Fraudehelpdesk figures).

**Levers:** a bargain in a tight market; scarcity ("many people are interested") [pt-rtp-gnr-rentals-2026]; urgency; the reassurance of a familiar platform's look; holiday mood ("people lower their guard on holiday", CNCS) [pt-dn-psp-cncs-campaign-2025].

## 3. Red flags a normal person can spot
1. **The host wants to move off the platform**: chat by email or messenger, pay by transfer or by their link [pt-dn-psp-airbnb-2026], [de-evz-rental-fraud], [pt-dn-psp-cncs-campaign-2025].
2. **A payment or login link sent by the host or by "the platform" in a message.** The page's address is not the platform's own [de-evz-rental-fraud], [pt-dn-psp-airbnb-2026], [pt-bdp-ficaadica-2023].
3. **Too cheap, and pressure to pay a deposit now** because "many are interested" [pt-rtp-gnr-rentals-2026], [pt-dn-psp-cncs-campaign-2025].
4. **You can't see it.** The owner is abroad, or there's no viewing before paying (for longer lets) [de-evz-rental-fraud], [pt-rtp-gnr-rentals-2026].
5. **The same photos appear elsewhere** with other contacts or prices [pt-rtp-gnr-rentals-2026], [de-evz-rental-fraud].
6. **The account holder's name doesn't match** the person you're dealing with [pt-rtp-gnr-rentals-2026].
   - In-game, Portugal is in the euro area, so the Larchwick payee-name check runs on a typed IBAN [eu-ec-ipr-vop-2025]. A match proves only whose account it is (P3).
7. **Payment via money-transfer services or a "secure escrow"** you've never heard of [de-evz-rental-fraud].
8. **Requests for a copy of your ID before anything is signed** [de-evz-rental-fraud].

## 4. The verification habit
**"Book, message and pay only inside the platform's app or site that you opened yourself. Never log in or pay through a link someone sends you, even if it looks like the platform."** [de-evz-rental-fraud], [pt-dn-psp-airbnb-2026], [pt-dn-psp-cncs-campaign-2025], [pt-bdp-ficaadica-2023]

- For a room you'll live in: see it (or have someone you trust see it) and sign before paying [de-evz-rental-fraud], [pt-rtp-gnr-rentals-2026].
- Check whether the photos are used elsewhere [pt-rtp-gnr-rentals-2026].
- Ask someone you trust when unsure (PSP) [pt-dn-psp-cncs-campaign-2025].
- Use different passwords and two-factor authentication on the platform account [pt-dn-psp-cncs-campaign-2025].

## 5. Already caught? (generic + Portugal where verified 2026-11-19)
1. **Paid?** Call your bank at once on the number on your card or in its app. If you paid by card, ask about a chargeback, and note that deadlines apply [pt-bdp-ficaadica-2023], [de-evz-rental-fraud].
2. **Typed your platform login?** Change the password in the real app, turn on two-factor authentication, and check your bookings and saved cards [pt-dn-psp-cncs-campaign-2025], [de-evz-rental-fraud].
3. **Typed bank details on a fake page?** Ask the bank to cancel your access credentials [pt-bdp-ficaadica-2023].
4. **Keep everything**: messages, emails, numbers, receipts, screenshots (PSP) [pt-dn-psp-cncs-campaign-2025].
5. **Report the listing or host to the platform** [de-evz-rental-fraud].
6. **Report to the police.** PT: PSP, GNR or PJ [pt-bdp-ficaadica-2023]; the PSP says to report at once [pt-dn-psp-cncs-campaign-2025].
   - The online complaint portal's scope for fraud was **not verified** (see the help list).
7. **Cross-border trader dispute (a real business that didn't deliver):** ECC-Net gives free advice; it is not the police [eu-eccnet-about].
8. **Never promise the money back.**

## 6. Variations by country / local hooks (game-facing: fictional only)
- **PT:** holiday lets; student rooms near universities; the deposit (*sinal*); listings with real photos at low prices [pt-rtp-gnr-rentals-2026].
- **DE (EU consumer centre):** a fake landlord abroad and fake escrow [de-evz-rental-fraud].
- **NL:** "message from your accommodation" asking for an extra payment after a booking [nl-nltimes-booking-phishing-2026] (news).
- **EU:** fake accommodation listings in ads [eu-europol-iocta-2026]; an off-platform move that ends at a fake bank login [eu-esas-ai-scams-factsheet-nl].

## 7. Genuine-twin notes
- A real listing on the fictional platform, where every message and the payment stay inside the app the player opened. The `pay_protected` choice is the twin (LO-11).
- A real host message inside the platform app with check-in details and no link to pay. The tell is never "the host messaged you"; it is "pay or log in outside the platform".

## 8. Game-design notes (non-binding)
- **Lead:** a student room for the player or a cast member. The "host" moves to Kettle and sends a "secure deposit" link to a look-alike page (`SimulatedForm`, non-functional, Red Line 2).
- **Platform-login phishing beat:** an email "from the platform" saying "your booking is at risk, log in to confirm". The owner part of the address gives it away (LO-02, LO-05).
- **Decoys:** the photos look great (neutral); a padlock (shared neutral wording).
- Show no loss figures on screen. The PT figures are news-sourced.

## 9. Sources (accessed 2026-11-19 unless noted)
pt-rtp-gnr-rentals-2026 (news) · pt-dn-psp-cncs-campaign-2025 (news) · pt-bdp-ficaadica-2023 · nl-nltimes-booking-phishing-2026 (news) · de-evz-rental-fraud (re-opened 2026-11-19) · accessed 2026-11-18: pt-dn-psp-airbnb-2026 (news) · pt-rr-psp-rentals-2026 (news) · eu-europol-iocta-2026 · eu-esas-ai-scams-factsheet-nl · eu-ec-ipr-vop-2025 · eu-eccnet-about

## 10. Confidence
**Medium.**
- The pattern, red flags and habit are backed by an official EU-network consumer centre [de-evz-rental-fraud], the Portuguese central bank's general advice [pt-bdp-ficaadica-2023] and EU sources.
- The Portugal-specific detail (PSP, GNR, CNCS) comes through news reports of their statements. The originals were not fetched.

**Unverified / caveats:**
- PSP, GNR and CNCS original pages were not opened. No CNCS page on rentals was found.
- The NL tenfold rise is a news report of Fraudehelpdesk figures. The original wasn't found.
- Portuguese refund or chargeback rules were not checked. Say "ask your bank".
