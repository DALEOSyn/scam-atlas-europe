# Pattern brief: `card-phishing-payment-failed`

**Chapters:** 1 (scenarios 1-6 genuine, 1-8 fake twin) and 0 (drill 0-5, prize link) · **Status:** draft for review (T-2.5) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** "payment failed / update your card" phishing; fake subscription-renewal or account-suspension email; fake prize or giveaway asking for a "small shipping fee".
- **Local names:** *phishing* (ES, PL, IT, PT, NL); *hameçonnage* (FR). INCIBE titles describe it as a renewal problem or "your subscription has not expired, it's phishing" [es-incibe-streaming-renewal-2024], [es-incibe-streaming-extension-2023]. Fake prizes: *falso sorteo / premio* (ES) [es-incibe-prize-2021].
- **Where it is prominent and why:** EU-wide; any shop or subscription with stored cards can be imitated.
  - Spain: INCIBE has issued repeated advisories on fake streaming renewal and suspension emails (2023, 2024) and fake prize emails asking for card data and a small fee (2021) [es-incibe-streaming-renewal-2024], [es-incibe-streaming-extension-2023], [es-incibe-prize-2021].
  - Poland: CERT Polska saw a music-streaming brand impersonated with a fake "update your payment method" page in 2025, and lists fake payment forms asking for card number, expiry and CVV, often for a small extra fee, as a core phishing form [pl-cert-monthly-2025-12], [pl-cert-phishing-kb-2026].
  - Why it works: almost everyone has a subscription or a recent order, and "your payment failed" is a message real shops do send.

## 2. Channel and psychological levers
**Channel:** email (also SMS) → browser. A message says a payment failed, the subscription couldn't be renewed, or the account will be suspended. A button leads to a page styled like the shop that asks you to log in and then for personal data and **card number, expiry date and security code (CVV)** [es-incibe-streaming-renewal-2024], [pl-cert-phishing-kb-2026].
- **Reward variant:** "free extension if you confirm your card" [es-incibe-streaming-extension-2023], or "you won a prize, just pay a small shipping fee" [es-incibe-prize-2021] (0-5 drill).
- **Follow-up risk:** card details taken on a fake page can be followed by a call from a fake "bank fraud team" asking you to read out an SMS code or approve a payment in your banking app "to stop" a charge [ch-ncsc-double-phishing-2026].

**Levers:** fear of losing a service; routine (payments do fail); reward ("free", "you won"); a tiny amount that doesn't feel risky [es-incibe-prize-2021].

## 3. Red flags a normal person can spot
1. **The link's real domain isn't the shop's own,** even though the page looks identical [es-incibe-streaming-renewal-2024], [pl-cert-phishing-kb-2026], [ch-ncsc-links-2025].
2. **A form asks for the full card number, expiry and CVV after a link from a message** [es-incibe-streaming-renewal-2024], [pl-cert-phishing-kb-2026].
3. **The sender address isn't the shop's usual one** [es-incibe-streaming-renewal-2024].
4. **Urgency:** suspension, loss of the account, "within 48 hours" [es-incibe-streaming-renewal-2024], [pl-cert-phishing-kb-2026]. *Caveat:* the genuine twin 1-6 also has a 48-hour deadline (see §7).
5. **A "free" thing that needs your card, or a prize you didn't enter that needs a small fee** [es-incibe-streaming-extension-2023], [es-incibe-prize-2021].
6. **The padlock is not proof.** A fake page can use https [es-incibe-streaming-extension-2023], [pt-gnr-phishing], [ch-ncsc-links-2025]. This is the 1-8 decoy.
7. **A follow-up call** asking you to read out a code or approve something in your banking app [ch-ncsc-double-phishing-2026], [pl-cert-phishing-kb-2026].

## 4. The verification habit
**"Never fix a payment through a link. Open the shop's app or type its address yourself and look at your account. If the payment really failed, it will say so there."** [es-incibe-streaming-renewal-2024], [de-bsi-protect-phishing], [es-incibe-prize-2021]

## 5. Already caught? (generic)
1. **Entered card details:** call your bank or card issuer now, on the number on your card or in your banking app, and block or replace the card [es-incibe-streaming-renewal-2024], [es-incibe-prize-2021], [ch-ncsc-double-phishing-2026]. (0-5 drill: "block card = stop", per GDD §16.)
2. **Never read out a code or approve a payment** for anyone who calls you after that; hang up and call the bank yourself [ch-ncsc-double-phishing-2026].
3. **Entered your shop password:** change it on the real site and wherever you reused it [pl-cert-phishing-kb-2026].
4. **Watch your statements** and ask the bank about disputing unauthorised charges [es-incibe-streaming-extension-2023].
5. **Keep evidence and report** to the police [es-incibe-streaming-extension-2023], [es-incibe-prize-2021]. In ES, INCIBE's free helpline 017 helps [es-incibe-prize-2021]. See `WHERE_TO_REPORT.md`.

## 6. Variations by country / local hooks
- **ES:** streaming renewal failure, "free 90-day extension", fake prize with a ~€6 "shipping" fee [es-incibe-streaming-renewal-2024], [es-incibe-streaming-extension-2023], [es-incibe-prize-2021].
- **PL:** music-streaming payment-method update; fake card forms for a small extra fee [pl-cert-monthly-2025-12], [pl-cert-phishing-kb-2026].
- **CH (non-EU, supporting):** card entered on a fake parcel-fee page, then a spoofed "bank" call to get a code [ch-ncsc-double-phishing-2026].

## 7. Genuine-twin notes (what a real version looks like)
- **1-6 Thimble & Pine genuine "payment failed":** it matches a real order or subscription you have; it comes from the shop's usual sender; it asks you to update the card **in your account**, and when you open the shop's app or typed address yourself, the same notice is there. It may still have a deadline (48 h); a deadline alone doesn't make it fake.
- **1-8 fake twin:** same look, same deadline, a padlocked login page. Differences the player can find: the real domain of the link, the sender address, and that the notice isn't in the account when opened independently.
- Scoring in GDD §17 already rewards verify_in_app on the genuine one (★★★); keep "report" penalised there, so the lesson is "check", not "distrust every shop email".

## 8. Game-design notes (non-binding)
- The INCIBE sources name a real streaming brand in their titles. The game uses only Thimble & Pine and other fictional brands (Red Line 1); the streaming variant can appear as a fictional service only if registered in `content/brands.yaml`.
- The fake card form must be visibly in-game and submit nowhere; never show a working card-number field pattern that could be reused (Red Line 2).
- 0-5 (Teo's prize link) is damage control: the right first step is the bank / card block, not changing a password.

## 9. Sources (all accessed 2026-11-18)
es-incibe-streaming-renewal-2024 · es-incibe-streaming-extension-2023 · es-incibe-prize-2021 · pl-cert-phishing-kb-2026 · pl-cert-monthly-2025-12 · ch-ncsc-double-phishing-2026 (supporting) · ch-ncsc-links-2025 (supporting) · pt-gnr-phishing · de-bsi-protect-phishing

## 10. Confidence
**High** for the payment-failed / card-form pattern, red flags and habit (two national CERTs, several advisories). **Medium** for the prize drill: the only official source found (INCIBE, 2021) is older; the pattern matches CERT Polska's "small extra fee" card forms.

**Unverified / caveats:**
- The ~€6 shipping fee is a single example, not a statistic.
- The INCIBE prize advisory lists spelling errors as a red flag; do not teach that (see `email-phishing-credential` §3).
- No official prevalence figure for this lure alone.
