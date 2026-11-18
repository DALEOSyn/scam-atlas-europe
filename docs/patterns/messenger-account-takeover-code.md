# Pattern brief: `messenger-account-takeover-code`

**Chapters:** 0 (scenario 0-4) and 1 (scenario 1-5) · **Status:** draft for review (T-2.5) · **Researched:** 2026-11-18 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** messenger account takeover; verification-code theft; "send me the code I sent you by mistake"; device-linking / "ghost pairing" scam; fake "account will be deleted / locked" alert.
- **Local names:**
  - NL: *WhatsApp-account overgenomen / gehackt* (police wording) [nl-politie-whatsapp-takeover-2024].
  - DE: *Ghost Pairing*, *WhatsApp-Konto gekapert* (consumer-centre wording) [de-vzn-ghost-pairing-2026].
  - PL: *prośby o głosowanie od znajomych* ("vote requests from friends", CERT Polska advisory title) [pl-cert-vote-takeover-2026]; the older banking-code variant is *metoda "na kod"* [pl-nask-metoda-na-2020].
- **Where it is prominent and why:**
  - **Netherlands:** the national police publish a dedicated report-preparation form for hijacked messenger accounts, because the hijacked account is then used for friend-in-need fraud [nl-politie-whatsapp-takeover-2024], [nl-politie-hulpvraagfraude-2025].
  - **Germany:** a consumer centre warned in October 2026 about device-linking ("ghost pairing") takeovers that start with a message from a friend's account [de-vzn-ghost-pairing-2026].
  - **Poland:** CERT Polska issued an advisory in August 2026 about "vote for my friend's child" requests that end in device pairing [pl-cert-vote-takeover-2026].
  - EU-wide, the European Payments Council lists victims being asked to approve login QR codes sent via messaging apps [eu-epc-threats-2025].
  - Why it works: a code feels like "just a number", the request often comes from a friend's real account, and messenger accounts are the key to the victim's whole contact list.

## 2. Channel and psychological levers
**Channel:** SMS and messenger. Two shapes, both in the game:
- **Code request (1-5):** you receive a genuine verification code by SMS that you did not ask for. Soon after, someone (a "friend", or a fake "support team") asks you to send it to them: "sent to you by mistake", "needed to stop your account being deleted" [nl-politie-whatsapp-takeover-2024], [pl-cert-phishing-kb-2026].
- **Fake security alert with a link (0-4):** a text says there was an unusual sign-in and your account will be locked soon. The link opens a page that looks like the messenger and asks for your phone number and then a code, or shows a QR code to scan [de-vzn-ghost-pairing-2026], [pl-cert-vote-takeover-2026].
- **Variant (not used in ch0–1):** a friend's hijacked account asks you to "vote" in a contest; the vote page asks for your number and code, or a QR scan [pl-cert-vote-takeover-2026], [de-vzn-ghost-pairing-2026].

Passing on the code, or scanning the QR, lets someone else register or link a device to your account. They can then read your chats and message your contacts as you [pl-cert-vote-takeover-2026], [de-vzn-ghost-pairing-2026]. *(Described only from the victim's side; no technical detail.)*

**Levers:**
- Trust in a friend's account (it really is their account, already hijacked).
- Fear of losing the account: "deleted", "locked in 30 minutes".
- Helpfulness: "I sent it to you by mistake, can you forward it?"
- Low perceived value of a short code.

## 3. Red flags a normal person can spot
1. **Anyone asking for a code that was sent to *you*.** A login or verification code is only for the person who started the login. No genuine friend or support team needs it [nl-politie-whatsapp-takeover-2024], [pl-cert-phishing-kb-2026], [de-vzn-ghost-pairing-2026].
2. **A code arrives that you did not ask for.** An unsolicited authentication request is a warning sign by itself [ie-ncsc-phishing-guide], [de-vzn-ghost-pairing-2026].
3. **The text that comes with the code says something different from what you are doing.** Read the description in the SMS or the approval prompt: if it says "registration on a new device" or "link a device" and you are not doing that, stop [pl-cert-phishing-kb-2026].
4. **A security alert that sends you to a link** to "keep" your account, with a short deadline [de-vzn-ghost-pairing-2026], [pl-cert-phishing-kb-2026].
5. **A web page that asks you to scan a QR code or enter your phone number and code** to vote, verify or "confirm your identity" [pl-cert-vote-takeover-2026], [de-vzn-ghost-pairing-2026], [eu-epc-threats-2025].
6. **An unusual request from a friend** (vote for something, forward a code, urgent money) that doesn't sound like them [de-vzn-ghost-pairing-2026], [nl-politie-hulpvraagfraude-2025].

## 4. The verification habit
**"Codes are like keys: never pass them on. To check a security alert, open the messenger app yourself and look at its settings (linked devices, security notices). If a friend asks for something odd, call them on the number you already have."** [nl-politie-whatsapp-takeover-2024], [de-vzn-ghost-pairing-2026], [pl-cert-vote-takeover-2026], [nl-politie-hulpvraagfraude-2025]

Prevention to mention in debriefs: turn on the app's **two-step verification PIN** [nl-politie-whatsapp-takeover-2024], [de-vzn-ghost-pairing-2026], and check the **linked devices** list from time to time [de-vzn-ghost-pairing-2026], [pl-cert-vote-takeover-2026].

## 5. Already caught? (generic + country specifics where verified)
1. **Open the app's linked-devices list and log out every device you don't recognise** [de-vzn-ghost-pairing-2026], [pl-cert-vote-takeover-2026], [pl-cert-phishing-kb-2026].
2. **If you are locked out, register the app again with your own phone number.** You may have to wait some hours before it lets you back in [nl-politie-whatsapp-takeover-2024].
3. **Turn on two-step verification** once you are back in [nl-politie-whatsapp-takeover-2024], [de-vzn-ghost-pairing-2026].
4. **Warn your contacts** by another channel that your account was taken over and that they must not send money or codes [nl-politie-whatsapp-takeover-2024], [de-vzn-ghost-pairing-2026], [pl-nask-metoda-na-2020].
5. **Report** to the police. In NL the police offer a preparation form for this exact case [nl-politie-whatsapp-takeover-2024]. In PL, report to CERT Polska (incydent.cert.pl) [pl-cert-vote-takeover-2026]. See `WHERE_TO_REPORT.md`.
6. If the same password or code protects other accounts (email, bank), change those and log out other sessions [pl-cert-phishing-kb-2026].

## 6. Variations by country / local hooks
- **NL:** the hijacked account is used straight away for friend-in-need money requests [nl-politie-whatsapp-takeover-2024], [nl-politie-hulpvraagfraude-2025]. The police also advise not putting your phone number in public listings (e.g. second-hand ads), because that is where the first contact can come from [nl-politie-whatsapp-takeover-2024].
- **DE:** "ghost pairing": a message from a friend or from "the messenger" asks for a vote, security check or ID confirmation [de-vzn-ghost-pairing-2026].
- **PL:** "vote for my friend's child" requests; QR scan or code read-out [pl-cert-vote-takeover-2026]. Older variant: a hijacked friend asks for a **banking-app code** [pl-nask-metoda-na-2020].
- **EU:** login-approval QR codes sent via messaging apps [eu-epc-threats-2025].

## 7. Genuine-twin notes (what a real version looks like)
- **A real verification code** arrives only right after *you* started a login or registration. The real message usually says what it is for and tells you not to share it. In the game, 0-3 (a reset you started yourself, with an honest 15-minute timer) is the twin to contrast.
- **A real security notice** can be checked inside the app you open yourself: the same notice, or the linked-devices list, shows there. A real service never asks you to send it a code by chat or SMS reply.
- **Design rule:** the fake must not be told apart by its tone or deadline alone. 0-3's genuine message also has a timer. The tell is "did I start this, and does the app confirm it?"

## 8. Game-design notes (non-binding)
- Kettle is the fictional messenger. No real messenger names, colours or UI in content (Red Line 1). Real-world sources above name a real messenger; the game must not.
- 1-5 ("send us the 6-digit code we just texted you") is **supported** by the sources, so the delivery-card QR swap held in GDD §17 is not needed.
- Don't depict how a device link is performed technically. Show only what the victim sees: a code SMS, a request, a QR on a web page.
- Debrief 1-5: safe action is "don't send it; open Kettle yourself; turn on the PIN". If fallen: "log out unknown devices, warn your contacts".

## 9. Sources (all accessed 2026-11-18)
nl-politie-whatsapp-takeover-2024 · de-vzn-ghost-pairing-2026 · pl-cert-vote-takeover-2026 · pl-cert-phishing-kb-2026 · eu-epc-threats-2025 · ie-ncsc-phishing-guide · nl-politie-hulpvraagfraude-2025 · pl-nask-metoda-na-2020

## 10. Confidence
**High** for the red flags, the habit and the recovery steps: three national bodies in three countries (NL police, a German consumer centre, CERT Polska) agree, plus the EPC at EU level.

**Unverified / caveats:**
- No EU-level prevalence figure for messenger takeovers was found. Don't put a number on screen.
- The "wait some hours before re-registering" detail comes from the NL police form and depends on the real app. In the game, say "it may take a while".
- The 0-4 wording ("locked in 30 min") is a game invention consistent with the sources' urgency pattern, not a quoted lure.
