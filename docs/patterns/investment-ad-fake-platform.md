# Pattern brief: `investment-ad-fake-platform`

**Chapter:** 8 Dublin (GDD §18: investment ads with fake endorsements by fictional celebrities, checked against an in-world regulator list; Alex arc dashboard beat, GDD §10.1 slots 5–7) · **Status:** draft for review (T-3.10r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

Related briefs:
- `recovery-scam.md` (Dublin): the second scam that follows a loss.
- `task-job-scam.md` (Amsterdam): the same "small gains, then pay to unlock" shape, in a job wrapper.
- `remote-access-support-call.md` (Stockholm/Brussels): some investment "advisers" ask to take over the device.

This brief covers one pipeline in three stages. **(A)** A social-media ad with a fake celebrity endorsement leads to a form, then an "adviser" call or chat. **(B)** The victim lands on a trading platform or app whose **dashboard shows growing gains**. **(C)** A withdrawal needs a "tax", "fee" or "deposit" first. Defender level only: what the victim sees and how to check.

## 1. Name and aliases
- **English:** investment scam; fake celebrity / deepfake endorsement ad; fake trading platform; "boiler room" (older term, used by the Irish central bank [ie-cbi-avoiding-scams]).
- **Local names:**
  - SE: *investeringsbedrägeri* [se-konsumentverket-investment-fraud].
  - BE (FR/NL): *plateformes de trading frauduleuses* [be-fsma-trading-platforms-2025].
- **Game labels:** a fictional celebrity on a fictional social network; a fictional "platform" with a `.example` address; a fictional regulator with a fictional **register of authorised firms** and a **warning list**. No real faces, regulators, registers or platform look-alikes (Red Line 1).
- **Why Ireland is the stage:**
  - The Garda economic-crime bureau warned in October 2025 about rising investment fraud and fake bond and deposit products in professional ads [ie-garda-investment-2025].
  - FraudSMART (the banks' federation) warned in November 2025 about AI-generated celebrity endorsement ads that lead to a form and an "adviser" call [ie-fraudsmart-investment-2025], and in May 2026 about AI ads with fake politicians and businesspeople promoting bogus "state-backed" schemes [ie-fraudsmart-state-scheme-ads-2026].
  - The Central Bank of Ireland launched an anti-scam campaign in November 2025, citing AI-made ads and profiles "impersonating public or business figures" and fake investment platforms [ie-cbi-fraud-landscape-2025].
  - The CCPC names "fake celebrity promotions" and "deepfake videos of celebrities" [ie-ccpc-investment-scams].
  - EU level: investment fraud is especially prevalent, increasingly via ads on very large platforms [eu-europol-iocta-2026]; the ESAs' factsheets warn about fake celebrity recommendations [eu-esas-ai-scams-factsheet-sv].
- **Why it works:** a familiar face; the look of a real finance product; an adviser who is friendly and knowledgeable; numbers on a screen that seem to prove it works; and, at the end, the fear of losing the "gains" already shown.

## 2. Channel and psychological levers
**What the victim sees:**
1. **The ad (stage A).** A social-media post or video in which a famous person seems to recommend an investment, often as a "news" or "interview" format [ie-ccpc-investment-scams], [se-konsumentverket-investment-fraud], [be-fsma-trading-platforms-2025]. The ad links to a short form for contact details [ie-fraudsmart-investment-2025], [ie-fraudsmart-state-scheme-ads-2026].
2. **The adviser.** A call or messenger chat from an "adviser" who is professional and has answers ready, and who pushes a first small deposit [ie-fraudsmart-investment-2025], [se-konsumentverket-investment-fraud], [ie-garda-crimecall-investment-2024].
3. **The dashboard (stage B).** A platform or app shows the balance rising, sometimes with charts. These numbers are only what the site chooses to display:
   - "Fake charts and graphs" show apparent gains [ie-garda-crimecall-investment-2024];
   - the platform "manipulates the transactions to give the impression that significant profits have been achieved"; the money is never invested [be-fsma-trading-platforms-2025];
   - "the first profits are displayed in the customer account after a short time" [de-evz-online-trading-scam-2026];
   - fake login portals show rising values, "manipulated to create a sense of security" [se-konsumentverket-investment-fraud];
   - small early "trial" returns build trust before larger requests [ie-ccpc-investment-scams].
4. **The withdrawal wall (stage C).** Trying to withdraw meets costs, "taxes" or "processing fees" to pay first, or excuses; the money is never paid out [be-fsma-trading-platforms-2025], [de-evz-online-trading-scam-2026]. The Garda advice says contact is cut off when the victim tries to cash out [ie-garda-crimecall-investment-2024].
5. **Sometimes:** a request to install a remote-access app "to help" [ie-garda-crimecall-investment-2024], [be-fsma-trading-platforms-2025] (see `remote-access-support-call.md`).

**Levers:** borrowed authority (celebrity, "state-backed", official look); social proof; reward and greed; sunk cost ("protect your gains"); urgency ("limited window") [ie-cbi-avoiding-scams], [ie-fraudsmart-state-scheme-ads-2026]; friendliness and trust built over time [se-konsumentverket-investment-fraud].

## 3. Red flags a normal person can spot
1. **A celebrity or politician "recommends" an investment in an ad.** These endorsements are often fake: some are made with AI, and the famous person never agreed to them [ie-ccpc-investment-scams], [se-konsumentverket-investment-fraud], [eu-esas-ai-scams-factsheet-sv].
2. **High or "guaranteed" returns with little or no risk** [ie-cbi-avoiding-scams], [ie-ccpc-investment-scams], [ie-garda-crimecall-investment-2024].
3. **Pressure to pay now** or "a limited window" [ie-fraudsmart-state-scheme-ads-2026], [ie-cbi-avoiding-scams].
4. **The firm isn't on the regulator's register of authorised firms**, or it's on the warning list [ie-cbi-avoiding-scams], [ie-ccpc-investment-scams].
5. **You have to pay to get your own money out** (a "tax", "fee" or "unlock deposit"). Stop: this is the tell that the gains were never real [be-fsma-trading-platforms-2025], [de-evz-online-trading-scam-2026].
6. **The deal runs through social media or a messenger chat.** "Reputable providers do not operate via social media or messenger services" [de-evz-online-trading-scam-2026].
7. **Someone asks to install an app to "help" or to see your screen** [ie-garda-crimecall-investment-2024], [eu-esas-ai-scams-factsheet-sv].
8. **Secrecy** ("don't tell your bank", "keep this between us") [ie-ccpc-investment-scams].

*Not reliable:* a professional website, a real-looking authorisation number, a local phone number, or a growing balance. Clone firms copy a real firm's name, number and address [ie-cbi-avoiding-scams]; calls can be spoofed [ie-garda-crimecall-investment-2024]; the dashboard shows whatever the site wants [be-fsma-trading-platforms-2025].

## 4. The verification habit
**"Before you pay, look the firm up yourself on the regulator's register of authorised firms, and contact it only through the details the register gives. If getting your money out costs money, stop."** [ie-cbi-avoiding-scams], [ie-ccpc-investment-scams], [be-fsma-trading-platforms-2025]

- Check the **register** (is it authorised?) **and** the **warning list** (has the regulator warned about it?). A clean warning list proves nothing: scammers change names [se-konsumentverket-investment-fraud], and the Irish central bank's list covers only firms already named in warnings [ie-cbi-unauthorised-firms].
- On the register, check it's the **real** firm: call it back on the number listed there, not one from the ad or caller (clone firms) [ie-cbi-avoiding-scams], [ie-ccpc-investment-scams].
- Talk to family, friends or a regulated adviser before investing [ie-fraudsmart-state-scheme-ads-2026], [ie-garda-crimecall-investment-2024].

### 4a. Design notes for the in-world regulator list (GDD LO-13, Alex slot 5)
- Give the fictional regulator **two** tools: a register of authorised firms and a warning list. The lesson that transfers: "not on the register = don't pay", **not** "not on the warning list = safe".
- Include one **clone** case: a firm whose name is on the register, but whose contact details in the ad differ from the register's. The habit wins (contact through the register's details).
- The register is opened by the player from the in-game home screen or bookmarks (never via a link in the ad), to match LO-02/LO-05.
- **Alex slot 6 (dashboard):** the debrief line should say what's true in every real case: "A dashboard shows whatever the website wants it to show. Growing numbers aren't proof of anything." [be-fsma-trading-platforms-2025], [se-konsumentverket-investment-fraud]
- **Alex slot 7 (withdrawal fee):** "If you have to pay to get your money out, the money was never there. Stop paying." The GDD's "Already did this?" line ("stop paying, call your bank on the number on your card, and keep the chat history") is consistent with the sources [be-fsma-trading-platforms-2025], [ie-cbi-avoiding-scams].
- Keep Alex's platform generic (no onboarding flow, no real exchange or wallet look-alikes, no crypto how-to): GDD §10.1 authoring rule.

## 5. Already caught? (generic + Ireland, verified 2026-11-19)
1. **Stop sending money**, including any "fee" to withdraw [ie-cbi-avoiding-scams], [ie-garda-crimecall-investment-2024], [be-fsma-trading-platforms-2025].
2. **Call your bank now** on the number on your card or in its app [ie-ccpc-investment-scams], [ie-ccpc-spot-a-scam-2026].
3. **Installed an app for them?** Stop using the device and get it checked (see `remote-access-support-call.md`).
4. **Keep evidence:** the ad, chats, the platform's address, payment receipts [be-fsma-trading-platforms-2025].
5. **Report:**
   - IE: the Gardaí (local station) [ie-ccpc-spot-a-scam-2026], [ie-garda-investment-2025]; the Central Bank (report an unauthorised firm) [ie-cbi-avoiding-scams], [ie-cbi-report-unauthorised]. The Garda Confidential Line 1800 666 111 is given for investment fraud [ie-garda-investment-2025].
   - Report the ad on the social network.
6. **Expect a second scam:** anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam (`recovery-scam.md`).
7. **Refunds:** a payment you made yourself to an investment scam is generally not an "unauthorised" payment; the Irish statutory refund right the central bank mentions is for unauthorised payments [ie-cbi-fraud-research-2026]. Never promise a refund; say "call your bank straight away; people who report it get money back more often" [ie-cbi-fraud-research-2026].
8. **Shame:** 38% of Irish victims never report [ie-cbi-fraud-research-2026] (designer context; keep the figure off screen). Debrief tone: "This could happen to anyone. Reporting helps."

## 6. Variations by country
- **IE:** fake bond and deposit products; bogus "state-backed savings schemes" riding on news coverage [ie-garda-investment-2025], [ie-fraudsmart-state-scheme-ads-2026].
- **BE:** fraudulent trading platforms were 66.5% of reported losses in H1 2026 (designer context) [be-fsma-dashboard-2026-h1].
- **SE:** investment fraud is Sweden's biggest fraud type by proceeds (2025) [se-polisen-proceeds-2026]; fake login portals with rising values [se-konsumentverket-investment-fraud].
- **DE:** "taxes or processing fees" to pay out profits [de-evz-online-trading-scam-2026].
- **EU:** crypto variants, lookalike exchange sites, giveaway scams with celebrity imagery [eu-esas-crypto-factsheet-2025].

## 7. Genuine twin
A real, authorised firm found by the player on the fictional register, contacted on the register's number; no celebrity, no pressure, and money can be withdrawn without paying anything first.

## 8. Sources
ie-garda-investment-2025 · ie-fraudsmart-investment-2025 · ie-fraudsmart-state-scheme-ads-2026 · ie-cbi-avoiding-scams · ie-cbi-unauthorised-firms · ie-cbi-report-unauthorised · ie-cbi-fraud-landscape-2025 · ie-cbi-fraud-research-2026 · ie-ccpc-investment-scams · ie-ccpc-spot-a-scam-2026 · ie-garda-crimecall-investment-2024 · be-fsma-trading-platforms-2025 · be-fsma-dashboard-2026-h1 · de-evz-online-trading-scam-2026 · se-konsumentverket-investment-fraud · se-polisen-proceeds-2026 · eu-europol-iocta-2026 · eu-esas-ai-scams-factsheet-sv · eu-esas-crypto-factsheet-2025. All accessed 2026-11-19 except those dated 2026-11-18 in sources.yaml.

## 9. Confidence
- **High:** fake celebrity ads → adviser → deposit (IE, SE, BE, EU, several official sources); check the register.
- **High:** dashboard showing fake gains and fees/taxes to withdraw (BE regulator, DE consumer centre, SE consumer agency, Garda "fake charts").
- **Medium:** that Irish sources specifically describe *withdrawal fees*: none of the Irish pages opened says so (Garda says contact is cut when you try to cash out). The withdrawal-fee beat rests on BE/DE/SE sources.
- **Not verified:** how the Irish central bank's search tool works (page not opened); the CBI phone numbers' opening hours.
