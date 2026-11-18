# Pattern brief: `email-phishing-credential`

**Chapter:** 0 (Home / tutorial) · **Status:** rework 1 after sceptic FAIL (2026-11-18) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** email phishing (credential phishing), fake password reset / fake "security alert".
- **Local names:** *Phishing* or *Passwortdiebstahl durch Phishing* (DE); *hameçonnage* (FR); *phishing* (ES, IT, NL, PL, PT and most others; Polish is also *wyłudzanie danych*).
- **Where it is prominent:** everywhere in the EU. It works as a tutorial pattern because it is the baseline for nearly every other chapter.
  - ENISA counts phishing (including vishing, malspam and malvertising) as about 60% of observed intrusion cases for July 2024 to June 2025 [eu-enisa-etl-2025-press].
  - For calendar year 2025 ENISA reports phishing as 77.8% of social-engineering intrusion vectors [eu-enisa-etl-2026].
  - Europol IOCTA 2026 says phishing remains among the most common fraud methods [eu-europol-iocta-2026].
  - National helpers treat it as the base threat: BSI [de-bsi-password-theft], Cybermalveillance.gouv.fr [fr-cybermalveillance-fiche-hameconnage] and Safeonweb, which received about 10 million forwarded suspicious messages in 2025 [be-ccb-safeonweb-2025].

## 2. Channel and psychological levers
**Channel:** email. It may carry a button or link to a look-alike login page, or an attachment. The same lure also arrives by SMS or messenger (chapter 1 onward).

**What the victim sees (paraphrased, not copied):**
- A message that appears to come from a service they use (mail provider, bank, streaming, cloud storage, social network, employer IT). It says:
  - "unusual sign-in detected, reset your password", or
  - "your mailbox is full / account will be closed", or
  - "confirm your details to avoid suspension".
- A button leads to a page that copies the real logo, colours and fonts and asks for username and password, sometimes followed by a one-time code [de-bsi-password-theft], [ie-ncsc-phishing-guide].

**Levers:**
- Authority / familiarity: a known brand look [de-bsi-password-theft].
- Urgency and threat: account expiry, a "security incident" [de-bsi-password-theft], [eu-europol-phishing-leaflet].
- Helpfulness / fear of loss: "protect your account".
- Scale: mass campaigns rely on the recipient being a customer by chance [de-bsi-password-theft].

## 3. Red flags a normal person can spot
1. **You didn't start it.** An unsolicited password-reset or sign-in/authentication request is a listed warning sign [ie-ncsc-phishing-guide].
2. **The sender's display name doesn't match the actual address,** or the address differs from earlier genuine mail from that organisation [ie-ncsc-phishing-guide], [eu-europol-phishing-leaflet].
3. **The link's real destination is not the organisation's domain.** Hover on desktop, or long-press on mobile. The real domain is the name just before the ending (.de, .fr, .co.uk…); ignore anything after the first `/`. Look-alike spellings, extra hyphenated words and short links are warning signs [ch-ncsc-links-2025], [fr-cybermalveillance-fiche-hameconnage].
4. **Urgency or a threat.** "Within 24 hours", "account will be closed", "security incident" [de-bsi-password-theft], [eu-europol-phishing-leaflet].
5. **It asks for your password, card data or codes by email or via a linked form.** Banks and reputable providers don't ask for access data this way [de-bsi-protect-phishing], [eu-europol-phishing-leaflet].
6. **Generic greeting** ("Dear customer/friend") where the real service would use your name [ie-ncsc-phishing-guide]. *Weak signal:* targeted phishing can use your name.

**Do NOT teach as reliable signals:**
- **Padlock / "https".** GNR says a fraudulent link can start with https [pt-gnr-phishing]. The Swiss NCSC says the protocol says nothing about who runs the site [ch-ncsc-links-2025]. Some official pages still list https as a precondition [de-bsi-protect-phishing] or a safety sign [eu-ebf-cyberscams]. In the game, present https as *necessary but never proof*.
- **Spelling mistakes.** Safeonweb and the EU supervisory authorities warn that AI now produces polished messages, so good grammar is not proof of legitimacy [be-ccb-safeonweb-2025], [eu-esas-ai-scams-factsheet-nl]. Typos can appear as a *bonus* clue in easy tutorial items only.

## 4. The verification habit
**"Don't use the link. Open the app or type the address yourself."** Then check whether the alert is real there, or contact the organisation on contact details you already have [de-bsi-protect-phishing], [fr-cybermalveillance-fiche-hameconnage], [eu-europol-phishing-leaflet].

Supporting micro-habits: bookmark login pages [de-bsi-protect-phishing], and use unique passwords plus two-factor authentication where offered [fr-cybermalveillance-fiche-hameconnage].

## 5. Already caught? (generic, EU-wide)
1. **Entered a password:** change it now, from the real site or app, and on every other site where you reused it [fr-cybermalveillance-fiche-hameconnage], [ie-ncsc-phishing-guide]. Turn on two-factor authentication.
2. **Entered card or bank details:** call your bank on the number on your card or in its app. Block or "oppose" the card or payments and watch your statements [fr-cybermalveillance-fiche-hameconnage], [de-bsi-protect-phishing].
3. **Opened an attachment or installed something:** run a security scan; get help if unsure [ie-ncsc-phishing-guide].
4. **Keep the evidence** (the message, the time, what you entered) [fr-cybermalveillance-fiche-hameconnage].
5. **Report:**
   - forward the message to the national reporting address where one exists (e.g. BE suspicious@safeonweb.be [be-ccb-safeonweb-2025]; FR Signal Spam / Phishing Initiative [fr-cybermalveillance-fiche-hameconnage]);
   - use your mail provider's "report phishing" button [ie-ncsc-phishing-guide];
   - file a police report if money or identity was lost.
   See `WHERE_TO_REPORT.md`.
6. **Check your account's recent sign-ins** if the service shows them [fr-cybermalveillance-fiche-hameconnage].

*Game rule:* real bodies appear only on the Where-to-report screen. Debriefs link to it.

## 6. Variations by country / local hooks (for later chapters and legit-vs-fake contrast)
- **Government / tax / authority themes:** fake customs or tax demands (DE [de-zoll-phishing]); FR guidance lists government agencies, energy suppliers and telecoms among the brands that get impersonated [fr-cybermalveillance-fiche-hameconnage].
- **Messages inside a real thread / reply chain:** the EU supervisory authorities note phishing inserted into existing email threads [eu-esas-ai-scams-factsheet-nl]. Good for a harder tutorial item.
- **QR codes in emails or letters** that bypass link checks [ie-ncsc-qr-guide], [eu-epc-threats-2025]. Optional late-tutorial item.

## 7. Game-design notes (for scenario-writer, non-binding)
- All brands come from `content/brands.yaml`. Domains use `.example` / `.test` / `.invalid`. The fake login form never transmits anything (Red Lines 1–3).
- Teach URL reading with fictional domains only. Example: `login.brandname.example` versus `brandname-secure-login.example`. Never use a real brand in the look-alike.
- Include at least one **legitimate** password-reset email that the player *did* trigger. The lesson is "did I start this?", not "all resets are fake".

## 8. Sources (all accessed 2026-11-18)
eu-enisa-etl-2025-press · eu-enisa-etl-2026 · eu-europol-iocta-2026 · eu-europol-phishing-leaflet · eu-ebf-cyberscams · eu-esas-ai-scams-factsheet-nl · eu-epc-threats-2025 · de-bsi-protect-phishing · de-bsi-password-theft · de-zoll-phishing · fr-cybermalveillance-fiche-hameconnage · ie-ncsc-phishing-guide · ie-ncsc-qr-guide · pt-gnr-phishing · be-ccb-safeonweb-2025 · ch-ncsc-links-2025 (non-EU, supporting)

## 9. Confidence
**High.** Six or more tier-1/2 sources agree on the red flags and the habit.

**Unverified / caveats:**
- The ENISA percentages measure *incident intrusion vectors* in ENISA's dataset, not how often consumers get scammed. Don't present them as "60% of people are phished".
- The Europol leaflet date is unclear (possibly 2020).
- The "AI >80% of social engineering" figure is ENISA citing third-party reporting. Don't put it on screen.
