# Pattern brief: `it-portal-credential-phishing`

**Chapter:** 0 (scenarios 0-2 and boss 0-6; genuine twins 0-1 and 0-3) · **Status:** draft for review (T-2.5) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

Builds on `email-phishing-credential` (general red flags, padlock and spelling caveats). This brief covers the **workplace / IT-portal** form of it and the **multi-channel "IT support"** escalation used in the 0-6 boss.

## 1. Name and aliases
- **English:** "mailbox full" phishing; fake IT-portal or webmail login; fake IT helpdesk / IT-support call.
- **Local names:** *phishing* almost everywhere; *hameçonnage* (FR). For the call: *falsi konsultanci* (PL, "fake consultants", CERT Polska's label for fake callers from banks and institutions) [pl-cert-fake-consultants]; fake support / tech-support calls (CH usage) [ch-ncsc-fake-support-2024].
- **Where it is prominent and why:** EU-wide; not tied to one country, which suits the home-city tutorial.
  - ENISA Threat Landscape 2026: phishing is 77.8% of social-engineering intrusion vectors, and voice phishing impersonating IT staff was used to obtain single-sign-on credentials and MFA codes [eu-enisa-etl-2026].
  - Europol IOCTA 2026 lists tech-support fraud among the most common typologies reported by Member States [eu-europol-iocta-2026].
  - INCIBE (ES) warned about "your mailbox is full" campaigns that lead to a fake mail-provider login [es-incibe-mailbox-full-2022].
  - Why it works: people expect IT to send admin messages, a new portal or migration is a normal workplace event, and "IT" has authority.

## 2. Channel and psychological levers
**Channel:**
- **0-2:** email → browser. An "urgent" email says the mailbox is full or will stop receiving mail; a button to "update" or "free up space" opens a page styled like the mail provider that asks for the password [es-incibe-mailbox-full-2022].
- **0-6 boss:** email → messenger → call. An email asks you to log in to a "new portal"; then a chat from someone claiming to be "IT" pushes you to do it now; then a phone call from "IT" asks you to read out a code or log in while they "help" [eu-enisa-etl-2026], [ch-ncsc-fake-support-2024], [pl-cert-fake-consultants].
  - Caller ID and caller names can be faked, so a familiar name or number on screen proves nothing [pl-cert-fake-consultants], [eu-epc-threats-2025].

**Levers:** authority (IT, the employer); urgency (mail will stop, account will be disabled); routine (portals change all the time); persistence across channels, which feels like confirmation but isn't.

## 3. Red flags a normal person can spot
1. **You didn't expect it.** An unexpected request to log in, reset or "re-validate" is a warning sign [ie-ncsc-phishing-guide], [es-incibe-mailbox-full-2022].
2. **The link's real domain isn't your organisation's or provider's own** [ch-ncsc-links-2025], [pl-cert-phishing-kb-2026], [es-incibe-mailbox-full-2022].
3. **Your password manager doesn't offer to fill in the password.** It recognises the real site; silence on a look-alike page is a warning [pl-cert-phishing-kb-2026].
4. **Urgency or a threat:** "urgent", mailbox will be closed, account disabled today [es-incibe-mailbox-full-2022], [de-bsi-protect-phishing].
5. **Anyone (chat, call) asks for your password or a one-time code.** Genuine IT does not need them [eu-enisa-etl-2026], [pl-cert-phishing-kb-2026], [ch-ncsc-fake-support-2024].
6. **A caller asks you to install remote-access software or let them "take over" your screen** [ch-ncsc-fake-support-2024], [pl-cert-fake-consultants], [eu-epc-threats-2025].
7. **The same request arrives on several channels in quick succession.** More channels is not more proof; it's more pressure. *(Inference from the multi-channel cases in [eu-enisa-etl-2026] and [eu-epc-threats-2025]; flag as design framing.)*

**Not reliable:** the padlock, polished language, or a familiar caller name. See `email-phishing-credential` §3 [be-ccb-safeonweb-2025], [pl-cert-fake-consultants].

## 4. The verification habit
**"Go to the portal the way you always do (bookmark, typed address or the app), never through the link. If 'IT' contacts you, hang up or stop chatting and contact IT yourself through the channel you already know, or ask a colleague."** [de-bsi-protect-phishing], [pl-cert-fake-consultants], [ch-ncsc-fake-support-2024]

In the game: verify_in_app, or ask_someone (Adaeze), as GDD §16 sets for 0-6.

## 5. Already caught? (generic)
1. **Typed your password:** change it at once on the real site, and everywhere you reused it [es-incibe-mailbox-full-2022], [pl-cert-phishing-kb-2026], [fr-cybermalveillance-fiche-hameconnage].
2. **Turn on two-factor authentication** and log out other sessions; check for unknown linked devices or mail-forwarding rules you didn't set [es-incibe-mailbox-full-2022], [pl-cert-phishing-kb-2026].
3. **Gave a code or remote access:** stop using the device (taking it offline, e.g. airplane mode, is one example), tell your real IT team, and tell your bank if you bank on that device [ch-ncsc-parcel-calls-2022], [eu-esas-ai-scams-factsheet-nl], [de-vz-paketdienst-sms].
4. **Work account:** tell your IT or security team straight away, even if you feel embarrassed. Early reporting limits the damage. *(Generic workplace advice; consistent with [ie-ncsc-phishing-guide].)*
5. **Report** the email with your mail app's "report phishing" button, and to the police where money or identity was lost. See `WHERE_TO_REPORT.md`.

## 6. Variations by country / local hooks
- **ES:** "mailbox full", subject "Urgente" [es-incibe-mailbox-full-2022].
- **PL:** fake consultants calling as banks or institutions, spoofed caller ID, remote-access requests [pl-cert-fake-consultants].
- **CH (non-EU, supporting):** fake IT/tech-support calls and fake "your computer is locked" pop-ups with a number to call [ch-ncsc-fake-support-2024].
- **EU:** vishing as IT staff to obtain SSO credentials and MFA codes [eu-enisa-etl-2026].

## 7. Genuine-twin notes (what a real version looks like)
- **0-1 Waymarker welcome email (genuine):** expected (you just joined), asks for nothing secret, and every link goes to the organisation's own domain. You can also reach the same content by opening the portal yourself.
- **0-3 Password reset you started (genuine):** it arrives right after you clicked "forgot password"; the timer is honest (15 min). The difference from 0-2 is not tone or urgency but **who started it**.
- **Real IT** announces new portals through known channels (intranet, team lead, all-staff mail with the usual sender), will tell you the address to type yourself, and never asks for your password or a code by chat or phone.
- **Design rule:** the genuine items may also carry deadlines and calls to action (GDD: pressure cues appear on genuine messages too). The tell must be the domain, who started it, and whether IT confirms through a known channel.

## 8. Game-design notes (non-binding)
- Waymarker mail / Waymarker Desk are fictional; use `.example` domains (Red Lines 1, 3). The look-alike in 0-2 should differ in the real domain, not just in a typo.
- The fake login page must be visibly part of the game and submit nowhere (Red Line 2).
- 0-6 beat 3 (the call): show a familiar-looking caller name to teach "caller ID can be faked"; the safe action is to end the call and contact IT through the Waymarker Desk you open yourself or by asking Adaeze.
- After a fall in 0-6, the stop step is changing the password (GDD §16). Add "tell IT" as the second step.

## 9. Sources (all accessed 2026-11-18)
es-incibe-mailbox-full-2022 · eu-enisa-etl-2026 · eu-europol-iocta-2026 · eu-epc-threats-2025 · pl-cert-phishing-kb-2026 · pl-cert-fake-consultants · ch-ncsc-fake-support-2024 (supporting) · ch-ncsc-parcel-calls-2022 (supporting) · ch-ncsc-links-2025 (supporting) · ie-ncsc-phishing-guide · de-bsi-protect-phishing · de-vz-paketdienst-sms · eu-esas-ai-scams-factsheet-nl · fr-cybermalveillance-fiche-hameconnage · be-ccb-safeonweb-2025

## 10. Confidence
**High** for the email and fake-login part (many national CERTs plus ENISA). **Medium** for the full email → chat → call sequence: ENISA confirms IT-staff vishing for credentials and MFA codes, and the EPC confirms multi-channel social engineering, but no single official source describes this exact three-step chain.

**Unverified / caveats:**
- The INCIBE mailbox-full advisory is from 2022 (older, but the lure is a standard one and matches the general guidance).
- Red flag 7 ("more channels is more pressure, not more proof") is my framing from the sources, not a quoted rule.
- The "password manager won't autofill" sign is from CERT Polska only. Present it as a helpful hint, not proof (password managers can fail on real sites too).
