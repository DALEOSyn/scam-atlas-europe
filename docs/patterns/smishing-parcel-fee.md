# Pattern brief: `smishing-parcel-fee`

**Chapter:** 1 (Berlin) · **Status:** rework 1 after sceptic FAIL (2026-11-18) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** parcel-delivery smishing; fake customs / redelivery / address-fee message.
- **Local names:**
  - DE: *Paket-SMS*, *Paketdienst-SMS*, *Smishing*, *Fake-Zollgebühren*.
  - PL: *oszustwo "na kuriera"* / *na dopłatę*. Working term only, not verified as an official label; CERT Polska describes the lure itself [pl-cert-monthly-2025-12].
- **Where it is prominent and why — Germany (chapter 1 pairing confirmed):**
  - ENISA Threat Landscape 2026: large-scale smishing campaigns impersonating **logistics providers** and public administration were aimed **mainly at Germany**, with France, Ireland, Poland and Lithuania also targeted [eu-enisa-etl-2026].
  - German consumer centres keep an updated warning page (last updated July 2026) [de-vz-paketdienst-sms].
  - The Federal Network Agency reported "a high number of complaints" about fake customs-fee SMS [de-bnetza-zoll-sms-2023].
  - German Customs runs a standing warning page [de-zoll-phishing].
  - BSI issued warnings as early as 2021 [de-breg-bsi-paket-sms-2021].
  - Also current in Poland (courier customs-fee emails and address/payment SMS in 2025) [pl-cert-monthly-2025-12].
  - Why it works: online shopping means many people are expecting a parcel at any given time, and the fee is tiny.

## 2. Channel and psychological levers
**Channel:** SMS, and also messenger apps, voicemail notices and email [de-vzn-smishing], [de-bnetza-zoll-sms-2023]. Some messages appear inside a genuine thread, as CERT Polska observed for courier SMS [pl-cert-monthly-2025-12].

**What the victim sees (paraphrased):** a short text claiming to come from a parcel carrier or the post. It says one of the following [de-vz-paketdienst-sms], [de-vzn-smishing]:
- the parcel is held;
- the address is incomplete;
- delivery failed;
- a small customs or redelivery fee (roughly €1–4) must be paid.

It comes with a link and a deadline of 12 or 24 hours. The link opens a page styled like the carrier. The page either:
- asks for **card details** to pay the "fee", or
- asks you to **install a "tracking app"** (malicious, on Android), or
- signs you up to a **paid subscription** [de-vz-paketdienst-sms], [de-breg-bsi-paket-sms-2021], [de-vzn-smishing].

Some texts greet you by first name, or as a relative of one of your contacts ("Hello, [name]'s mum"). The names come from contact lists harvested from other people's phones, not from the sender knowing you [de-vz-paketdienst-sms], [de-vzn-smishing].

**Levers:**
- Expectation: you probably *are* waiting for something.
- A tiny amount: "it's only €1.99".
- Deadline / fear of losing the parcel.
- The familiar carrier look.
- Personalisation.

## 3. Red flags a normal person can spot
1. **A fee requested via a link before delivery.** In Germany the carrier normally collects customs duties **at the door on delivery**, or customs notifies you **by letter** and you pay at the customs office [de-zoll-phishing], [de-vz-paketdienst-sms]. Parcel services usually don't ask for prepayment by SMS link [de-vzn-smishing]. *Nuance:* some carriers offer genuine pre-payment, but those messages carry your real tracking number and the sender's name [de-vz-paketdienst-sms].
2. **You weren't expecting a parcel,** or the message names no shop, sender or tracking number you recognise [de-vz-paketdienst-sms], [de-vzn-smishing].
3. **The link's real domain isn't the carrier's own,** or it's a short link [ch-ncsc-links-2025].
4. **A short deadline (12/24 h) or a threat** (returned to sender, prosecution, seizure) [de-vz-paketdienst-sms], [de-zoll-phishing].
5. **It asks you to install an app** or allow installs from unknown sources [de-vz-paketdienst-sms], [de-vzn-smishing], [de-breg-bsi-paket-sms-2021].
6. **It asks you to reply** (e.g. "reply Y"), which confirms your number is active [de-vz-paketdienst-sms].
7. **A card form for a "customs" payment,** or payment to a foreign account, crypto or prepaid voucher [de-zoll-phishing], [de-bnetza-zoll-sms-2023].
8. *(Weak)* Odd characters, typos or placeholder text. Sometimes these are deliberate to slip past filters [de-vzn-smishing]. Not reliable on its own (see `email-phishing-credential` §3).

## 4. The verification habit
**"Track parcels only in the carrier's official app or site that *you* open, by typing the tracking number from the shop's order confirmation."** If in doubt, ask the shop or sender [de-vz-paketdienst-sms]. For customs, contact customs using details you look up yourself, never those in the message [de-zoll-phishing].

## 5. Already caught? (generic + DE specifics where verified)
1. **Entered card details / paid a "fee":**
   - call your bank or card issuer now (number on the card or in the app);
   - block the card if in doubt;
   - ask about a **chargeback**;
   - watch statements [de-vz-paketdienst-sms], [de-bnetza-zoll-sms-2023].
2. **Installed an app:**
   - switch on **airplane mode**;
   - screenshot the evidence;
   - remove unknown apps (safe mode);
   - factory reset as a last resort, and **only after police have taken evidence** if you file a report [de-vz-paketdienst-sms], [de-breg-bsi-paket-sms-2021].
   - Tell your **mobile provider**, ask for a statement of SMS costs and turn on a **third-party billing block** [de-vz-paketdienst-sms], [de-vzn-smishing].
3. **Report:**
   - **police**: online or at a station; bring the phone if malware was installed [de-vz-paketdienst-sms], [de-vzn-smishing];
   - in DE, unwanted SMS can also go to the **Bundesnetzagentur** number-misuse complaint form [de-bnetza-zoll-sms-2023];
   - in PL, forward the SMS free to **8080** [pl-cert-monthly-2025-12].
   See `WHERE_TO_REPORT.md`.
4. **Just received it, didn't click:** don't reply, delete or report it, and consider an SMS spam filter [de-vz-paketdienst-sms].

*Game rule:* real bodies appear only on the Where-to-report screen. Debriefs link to it.

## 6. Variations by country / local hooks
- **DE:**
  - customs-fee variant [de-bnetza-zoll-sms-2023];
  - "address incomplete" variant [de-vzn-smishing];
  - fake customs letters and emails that threaten prosecution, sometimes demanding big sums and then "settling" for a small quick payment [de-zoll-phishing];
  - voicemail-notification SMS [de-vzn-smishing].
- **PL:**
  - courier-themed customs-fee emails and address/payment SMS [pl-cert-monthly-2025-12];
  - crossover with **marketplace** fraud: fake "collect your payment" pages also imitate couriers (chapter 5) [pl-cert-monthly-2025-12].
- **Cross-EU:** the same lure is used against FR, IE and LT [eu-enisa-etl-2026].

## 7. Game-design notes (non-binding)
- Use a fictional carrier from `content/brands.yaml` and a fictional "post" brand. Sender IDs and links must use `.example`/`.test`/`.invalid` (Red Lines 1, 3).
- The game must not mention or depict any real carrier, even in debriefs. Debriefs say "your real carrier's app".
- Pair each fake with a **legit** carrier SMS that contains the real tracking number from an in-game order. The skill is matching against your own order, not distrusting all carrier messages.
- **The debrief teaches "match it to your own order and tracking number", not "any fee is fake".** Genuine duties and carrier fees do exist [de-zoll-phishing], and some carriers offer real pre-payment [de-vz-paketdienst-sms]. The tell is a fee you can't match to an order you placed, requested through a link, which you can't confirm in the carrier's app you opened yourself.
- Boss idea for Berlin: a fake customs *letter* with a QR code that leads to `/qr/<id>` (in-game only), contrasted with a genuine in-game "collect at customs office" notice.
- Avoid the malicious-app mechanics beyond "the page asks you to install an app". Don't depict how it spreads (Red Line 2 / victim-perspective rule).

## 8. Sources (all accessed 2026-11-18)
eu-enisa-etl-2026 · de-vz-paketdienst-sms · de-vzn-smishing · de-zoll-phishing · de-bnetza-zoll-sms-2023 · de-breg-bsi-paket-sms-2021 · pl-cert-monthly-2025-12 · ch-ncsc-links-2025 (supporting)

## 9. Confidence
**High** for the Germany pairing, red flags and habit: tier-1 EU (ENISA 2026) plus German federal bodies plus consumer centres.

**Unverified / caveats:**
- The "€1–4" fee range comes from a consumer-centre example, not statistics. In the game, use it as flavour, not as a rule.
- No current official *count* of parcel-smishing reports for DE was found. The 2023 Bundesnetzagentur notice gives no figure.
- I did not verify which national Land online-police portal applies to which city. The game should say "your local police (online or in person)".
