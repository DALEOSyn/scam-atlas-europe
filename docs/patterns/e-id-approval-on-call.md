# Pattern brief: `e-id-approval-on-call`

**Chapter:** 9 Stockholm (GDD §18: callers who talk you into logging in or signing with your e-ID, and QR-login approvals sent by message; LO-09, LO-02; Gatewren prompts you started are the twins) · **Status:** draft for review (T-3.10r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

Related briefs:
- `spoofed-authority-call.md` (Rome): the caller-ID part of the same call.
- `bank-safe-account-call.md` (Madrid): the bank "security" call.
- `remote-access-support-call.md`: the finale preview call.

This brief covers two ways an e-ID approval is stolen. **(A) On a call:** a caller asks you to open your e-ID app and identify yourself, log in or sign, "to stop fraud" or "to verify". **(B) By message:** a message asks you to scan a login QR code with your banking or e-ID app. In both, *your* approval logs the scammer in or signs *their* transaction. It is described only at the level of what the victim sees and must never approve. Nothing here explains how the session is captured.

## 1. Name and aliases
- **English:** e-ID / BankID fraud; "log in to verify" call; QR-login phishing.
- **Swedish:** *telefonbedrägeri* / *vishing*; *legitimera dig*, *identifiera dig* (identify yourself), *signera* (sign) [se-polisen-telefonbedrageri], [se-polisen-nord-fake-police-2025].
- **Game label:** **Gatewren** (the fictional e-ID app). The real Swedish e-ID product is named in sources only as a research label, never shown (Red Line 1).
- **Why Sweden:**
  - Swedish police: "When you identify yourself with your e-ID you risk letting the fraudster into your internet bank"; "Never identify yourself with your e-ID" for a caller; "Serious companies, organisations and authorities never contact you and ask you to log in" [se-polisen-telefonbedrageri] (page reviewed 2026-08-19).
  - Regional police warning (Dec 2025): "The police NEVER call and ask for identification" with the e-ID; callers say "verification" is needed [se-polisen-nord-fake-police-2025].
  - National police: victims are manipulated into using their e-ID to move money; never log in with e-ID because a caller asks [se-polisen-vishing-2026], [se-polisen-campaign-2026].
  - The consumer agency: "don't use the e-ID or log in to your bank at someone else's request" [se-konsumentverket-investment-fraud].
  - Recovery callers posing as the financial supervisor also try to get victims to log in to their bank [se-konsumenternas-raddningshjalp].
  - EU: the European Payments Council reports victims asked to approve **login QR codes sent via messaging apps** [eu-epc-threats-2025]; the ESAs list "scan a QR code" among requests that are warning signs [eu-esas-ai-scams-factsheet-sv].
- **Trend (designer context only):** phone-fraud proceeds in Sweden more than halved since 2023, while attempts are rising [se-polisen-vishing-2026], [se-polisen-proceeds-2026].
- **Reframe note:** "MFA push bombing / approval fatigue" was not found in consumer-facing sources (MAP ch9). Stockholm teaches **social-engineered approvals**, not repeated push spam.

## 2. Channel and psychological levers
**(A) Call:**
1. A call from "the bank's security team", "the police" or "an authority". The number can be spoofed [se-polisen-telefonbedrageri]. Often an SMS first gives a number to call [se-polisen-campaign-2026].
2. A problem: a suspicious payment, a "case" about you, a refund, a "verification" [se-polisen-nord-fake-police-2025], [se-polisen-vishing-2026].
3. **The ask:** "Open your e-ID app and identify yourself / log in / sign so we can stop it." The victim's phone then shows a normal-looking approval prompt. The text may not match what the caller says (victim-level: "the app asks you to log in to your bank, or to sign a payment").
4. Pressure and friendliness: "Ofta är det bråttom" (it's often urgent) [se-polisen-anmal-telefonbedrageri]; "don't trust the caller even if they seem credible" [se-polisen-telefonbedrageri].

**(B) Message with a QR code:**
1. A chat or SMS says: "Scan this QR code with your banking / e-ID app to verify / receive / unlock" [eu-epc-threats-2025].
2. Scanning it with the e-ID app starts **someone else's** login or signature on your behalf.

**Levers:** authority; fear of loss; urgency; helpfulness ("we're protecting you"); the feeling that approving is a security step.

## 3. Red flags a normal person can spot
1. **Someone contacted you and wants you to identify yourself, log in or sign with your e-ID.** Never do it [se-polisen-telefonbedrageri], [se-polisen-nord-fake-police-2025], [se-konsumentverket-investment-fraud].
2. **An e-ID prompt you didn't start**: you didn't just open a site or app yourself [se-polisen-vishing-2026], [se-polisen-campaign-2026].
3. **A QR code sent to you to scan with your banking or e-ID app** [eu-epc-threats-2025], [eu-esas-ai-scams-factsheet-sv].
4. **The prompt says something different from what the caller says** (they say "cancel", the app says "log in" or "sign").
5. **"Police" or "the bank" on the phone.** Police never call to ask for e-ID identification [se-polisen-nord-fake-police-2025]; real organisations never call and ask you to log in [se-polisen-telefonbedrageri].
6. **Urgency** [se-polisen-anmal-telefonbedrageri].

*Not reliable:* the number on the screen (spoofing) [se-polisen-telefonbedrageri]; a calm, credible voice.

## 4. The verification habit
**"Never approve a sign-in, signature or QR login you didn't start. Whoever is on the phone, hang up and call your bank on the number on your card or in its app."** [se-polisen-telefonbedrageri], [se-polisen-campaign-2026], [se-konsumentverket-investment-fraud]

- "Started it yourself" means: you opened the site or app, you chose what to do, and the prompt is about that.
- Scan a login QR code only on a screen you opened yourself, never one someone sent you [eu-epc-threats-2025], [eu-esas-ai-scams-factsheet-sv].
- Swedish police campaign line: dare to be rude, hang up [se-polisen-campaign-2026], [se-polisen-nord-fake-police-2025].
- **Twins:** Gatewren prompts the player started (logging in to a fictional service they opened from the home screen) → `proceed`.

## 5. Already caught? (generic + Sweden, verified 2026-11-19)
1. **Call your bank now:** "Contact your bank directly to stop any payments or block your bank card. All banks have a special number you can call day and night." [se-polisen-telefonbedrageri]
2. **Ask the bank** what else to block (internet bank, e-ID) (generic advice; the e-ID provider's own guidance was not opened).
3. **Report to the police:** 114 14, or 112 if it's happening now [se-polisen-telefonbedrageri], [se-polisen-vishing-2026].
4. Keep the call log, number, name given and any messages [se-polisen-nord-fake-police-2025].
5. Never promise a refund on screen.

## 6. Variations by country
- **SE:** calls from "the bank", "the police" or "the supervisor"; SMS first; e-ID login or signing [se-polisen-telefonbedrageri], [se-polisen-campaign-2026], [se-konsumenternas-raddningshjalp].
- **DE/PL/ES:** the same structure with app approvals or codes instead of a national e-ID: see `bank-safe-account-call.md`, `hijacked-friend-payment-code.md`.
- **EU:** login-QR approvals sent via messaging apps [eu-epc-threats-2025].

## 7. Genuine twin
The player opens the fictional tax or bank service from the home screen, chooses "Log in", and the Gatewren prompt names that service. Approving is right.

## 8. Sources
se-polisen-telefonbedrageri · se-polisen-nord-fake-police-2025 · se-polisen-vishing-2026 · se-polisen-campaign-2026 · se-polisen-proceeds-2026 · se-polisen-anmal-telefonbedrageri · se-konsumentverket-investment-fraud · se-konsumenternas-raddningshjalp · eu-epc-threats-2025 · eu-esas-ai-scams-factsheet-sv.

## 9. Confidence
- **High:** call-based e-ID login/signing (several Swedish police pages, the consumer agency).
- **Medium:** QR-login sent by message. The EPC (EU level) reports it, and the ESAs list "scan a QR code" as a warning sign, but no Swedish official page opened this session describes the QR variant.
- **Not verified:** the e-ID provider's own public guidance (its site did not come up in searches); the Swedish Bankers' Association's consumer pages (not found); CERT-SE consumer advice (none found).
- **Red Line 2/4:** don't depict how a QR code is generated or relayed, or any session-capture step. Show only the victim's screens.
