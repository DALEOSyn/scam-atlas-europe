# Pattern brief: `bank-safe-account-call`

**Chapter:** 4 Madrid (GDD §18: a spoofed Larchwick Bank SMS inside the genuine thread, then a "bank employee" call to move money to "safety"; genuine bank alerts with honest timers as twins) · **Status:** draft for review (T-3.6r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

Related: `multichannel-support-callback.md` (Berlin 1-9: the caller asks for a code or an in-app approval "to stop a charge"). This brief covers the variant where the caller asks for nothing secret and instead walks you through **your own real banking app** to move your money to a "safe" account.

## 1. Name and aliases
- **English:** "safe account" scam; fake bank security department; bank-impersonation call after a spoofed SMS; smishing plus vishing.
- **Local names (ES):** *estafa del falso empleado de banca* / falso departamento de seguridad (common label, not taken from a cited source); the account is called a *cuenta de respaldo de seguridad* in the INCIBE warning [es-incibe-smishing-bank-callback-2025]. *SMS spoofing* and *suplantación del identificador de llamadas* (Banco de España) [es-bde-sms-callerid-spoofing-2022].
- **Elsewhere:** *faux conseiller bancaire* (FR; manipulation fraud was 32% of French payment-fraud value in 2024) [fr-bdf-osmp-2024]; *helpdeskfraude* (NL, Fraudehelpdesk's top category for private individuals in 2025) [nl-fraudehelpdesk-2025]; *fałszywi konsultanci* (PL) [pl-cert-fake-consultants].
- **Why Spain is the stage:**
  - INCIBE (Spain's national cybersecurity institute) issued a high-severity warning on 30 Sept 2025 describing this exact chain: SMS in the genuine thread → call → "security department" → transfer in the real app [es-incibe-smishing-bank-callback-2025].
  - Banco de España's consumer portal explains why a fake SMS can land in the bank's real thread and why caller ID can show a bank number [es-bde-sms-callerid-spoofing-2022].
  - Spain has a legal response: a 2025 ministerial order and, since **15 September 2026**, an obligation on operators to block SMS whose sender name is not in a register run by the CNMC (telecom and competition regulator) [es-boe-orden-tdf-149-2025], [es-boe-cnmc-circular-3-2026], [es-cnmc-alias-callout-2026]. See §6.
  - EU level: the European Payments Council describes spoofed sender names and numbers and messages that give a number to call [eu-epc-threats-2025]; the EBA and ECB report that users bore about 85% of credit-transfer fraud losses in 2024, mainly from scams that tricked users into starting the payment themselves [eu-eba-ecb-fraud-2025].
- **Why it works:** the SMS sits among real messages from the bank; the "transfer" it warns about is frightening; the caller *protects* you and even says they won't ask for your details; and you do everything yourself, in the app you trust.

## 2. Channel and psychological levers
**Channel:** SMS → phone call → your own banking app. What the victim sees [es-incibe-smishing-bank-callback-2025]:
1. An SMS **in the bank's usual thread**, under real past messages, about a large transfer you don't recognise (amount, a masked destination account, sometimes a code "never share it") and "if you don't recognise it, call" a number. Variants: "contact us if you didn't make this", or a charge with "call immediately".
2. You call. A recorded voice that sounds like the bank answers, then a person from the "security department" says a suspicious transaction was detected.
3. The caller says they **won't ask for any personal or banking data**. Instead they guide you, step by step, in the bank's **real** app or website to move your balance to a "security backup account" until the problem is fixed. The money is gone.

Older Spanish variants (still useful as tells): the caller asks you to read out the one-time code "to cancel" the fraud [es-bde-vishing-2020], [es-bde-sms-callerid-spoofing-2022]; or the SMS links to a fake bank login [es-incibe-sms-banks-2022].

**Levers:** authority (the bank's security team); fear (a big transfer leaving now); consistency (the SMS sits in the real thread, the voice menu sounds real); helpfulness and relief ("we'll protect your money"); urgency; and a reassuring *absence* of the usual tell ("we will never ask for your passwords").

## 3. Red flags a normal person can spot
1. **Anyone asks you to move your money to another account "to keep it safe".** That is the scam itself, whoever asks and however it is explained [es-incibe-smishing-bank-callback-2025], [pl-cert-fake-consultants], [fr-bdf-osmp-2024].
2. **A message that asks you to call a number it gives you**, about a payment you don't recognise [es-incibe-smishing-bank-callback-2025], [eu-epc-threats-2025].
3. **Being in the bank's real SMS thread proves nothing.** A sender name can be faked so that a scam text lands next to genuine ones [es-bde-sms-callerid-spoofing-2022], [es-incibe-sms-banks-2022], [es-incibe-smishing-bank-callback-2025].
4. **The bank's name or number on the call screen proves nothing** either [es-bde-sms-callerid-spoofing-2022], [pl-cert-fake-consultants].
5. **"We won't ask for your data, just follow my steps in your app."** Not asking for passwords is not proof; being guided to make a payment *is* the tell [es-incibe-smishing-bank-callback-2025].
6. **A caller asks for a code "to cancel" a payment.** A code is only needed to make an operation; your bank does not need one from you to stop a fraud [es-bde-sms-callerid-spoofing-2022], [es-bde-vishing-2020].
7. **Pressure to stay on the line and act now** so you can't check [es-incibe-smishing-bank-callback-2025], [es-bde-vishing-2020].

*Not taught as reliable:* missing accents, odd phrasing or spelling in the SMS. INCIBE notes them in these campaigns, but AI-written messages are often clean (MAP cross-cutting rule 2). Bonus clue only.

## 4. The verification habit
**"No real bank asks you to move your money to keep it safe. Hang up, open your banking app yourself to check, and call the bank on the number on your card or in the app, never the number in the message or the one that called you."** [es-incibe-smishing-bank-callback-2025], [es-bde-sms-callerid-spoofing-2022], [es-bde-vishing-2020], [eu-europol-phishing-leaflet]

In the game: ignore the number in the SMS → open the Larchwick app yourself (it shows no such transfer) → or call Larchwick on the number on the card. On a call: hang up → call back on the card's number.

## 5. Already caught? (generic + Spain where verified)
1. **Call your bank at once** on the number on your card or in the app (not one from the SMS or call). Report the fraud and ask it to **try to stop or recall** the transfers [es-incibe-smishing-bank-callback-2025], [pl-uknf-seniors-payments-2025].
2. **Keep the evidence:** screenshots of the SMS, the call log, times, amounts [es-incibe-smishing-bank-callback-2025].
3. **File a police report** (Policía Nacional or Guardia Civil, or the courts) and give your bank a copy [es-incibe-smishing-bank-callback-2025], [es-bde-vishing-2020]. Regional police forces were not checked this session.
4. **Advice in Spain:** INCIBE's free, confidential helpline **017** (also WhatsApp 900 116 117), 8:00–23:00 every day. It advises and tells you where to report; it is **not** a police report [es-incibe-017-faq].
5. **If the bank refuses:** complain in writing to the bank's customer service department first; after 15 business days without an answer, or if you disagree, you can complain to the Banco de España [es-bde-reclamacion].
6. **Watch the account** in the following weeks and report any new unknown charge at once [es-incibe-smishing-bank-callback-2025].
7. **Beware "recovery" offers** after the loss (re-victimisation; see MAP cross-cutting rule 4).

**Refunds: say "may", never "will".** A transfer you made yourself after being tricked counts as an *authorised* operation in the Banco de España's complaint practice; the bank may not have to refund it, and the facts are settled by the police or courts [es-bde-msr2025-fraude]. A provisional EU deal (Nov 2025) would make providers refund victims of bank-employee impersonation who report to the police and the bank, but whether and when it was adopted was not verified [eu-ep-psr-deal-2025]. Never promise a refund on screen.

## 6. Variations by country and local hooks
- **ES, the SMS sender register (state it carefully):**
  - Orden TDF/149/2025 (12 Feb 2025) obliges operators to block calls and SMS that show unassigned Spanish numbers, calls and SMS from abroad that show a Spanish number or sender name, and SMS under sender names (alias) **not registered** with the CNMC. It also bans mobile numbers for customer-service calls [es-boe-orden-tdf-149-2025], [es-bde-medidas-fraude-telefono-2025].
  - The CNMC regulated the register in Circular 1/2026 [es-boe-cnmc-circular-1-2026]. The blocking start was moved from 7 June to **15 September 2026** [es-boe-cnmc-circular-2-2026] and confirmed for that date, with provisional pre-registration for pending requests [es-boe-cnmc-circular-3-2026], [es-cnmc-alias-callout-2026].
  - **What we can't say:** that spoofed bank SMS no longer reach Spanish phones, or that a message in the real thread is now safe. No source found measures the effect; registered senders and their authorised providers can still send, and the habit doesn't depend on the law. *Design rule:* the game never mentions the register as protection; the debrief may say "Since September 2026, Spanish phone companies must block texts under sender names that aren't registered. Even so, a text in your bank's real thread is no proof."
  - Customer-service and unsolicited commercial calls may not use Spanish mobile numbers; customer service is assigned the 800/900 ranges [es-boe-orden-tdf-149-2025]. The order names no sector, so "banks" is an inference. *Not taught as a tell:* a caller ID can be faked, so "it showed a landline" is no proof either.
- **ES, older chains:** SMS link to a fake bank login [es-incibe-sms-banks-2022]; call asking for card data and one-time codes "to cancel" a payment [es-bde-vishing-2020].
- **FR:** fake bank adviser / fake anti-fraud service is a third of fraud value [fr-bdf-osmp-2024] (see `ceo-fraud-bec.md` for the business side).
- **NL:** helpdesk fraud, the top private-individual category in 2025 [nl-fraudehelpdesk-2025]. The doorstep card pick-up that sometimes follows is out of scope (Red Line 8).
- **PL:** fake consultants, spoofed caller ID, "safe account" transfers, remote-access apps [pl-cert-fake-consultants].

## 7. Genuine-twin notes (what a real version looks like)
- **A real alert you can check yourself:** a genuine bank SMS about a card payment or a login matches something you are doing, or it says "check in your app". Opening the app yourself shows the same thing. A real alert never needs you to call a number from the text or to move money [es-bde-sms-callerid-spoofing-2022], [es-incibe-smishing-bank-callback-2025].
- **A real one-time code** arrives right after *you* start a payment or login, and the text says what it is for (amount, merchant). Honest timer (a few minutes) is normal. Contrast with Berlin 1-5 and the Home 0-3 reset.
- **A real bank call** (rare) is fine with you hanging up and calling back on the number on your card, and never asks you to move money or read out a code.
- **Design rule:** the fake must not be told apart by being in the thread, by the sender name or by the timer. The tells are "it gives me a number to call" and "it wants my money moved". The genuine twins also sit in the same Larchwick thread with honest timers.

## 8. Game-design notes (non-binding)
- **Larchwick Bank** stays the bank (fictional, Red Line 1). The SMS thread can show older real Larchwick messages above the fake one. The sender name is the same; don't show how it was faked.
- **The call:** a recorded "Larchwick" menu, then a "security department" agent. The agent's key line is the reassurance "I won't ask for your passwords" followed by "open your app, go to transfers…". The player's decisive action is a `pay`/transfer inside the real-looking Larchwick app device, to a payee called something like "Larchwick Security Reserve" (fictional, a holder name that is **not** the player's own). Teaching point: the payee-name check result (if shown) depends on what the player types; don't use a "match" as reassurance.
- Phone numbers on screen are masked or from fiction ranges (Red Line 3); the card's number must be a fiction-range or masked number too.
- **Safe actions:** `call_back_known` (number on the card / in the app); "open the Larchwick app yourself" (verify); report. **Wrong:** call the number in the SMS (engage); follow the transfer steps (comply).
- **Damage control (the fall):** stop = call the bank on the card's number; secure = keep screenshots and the call log; report = police report with a copy for the bank, 017 for advice; harmful = "call back the number that called you to ask for it back", "wait to see if the bank notices", "pay a recovery service".
- **Don't** depict how sender IDs or caller IDs are spoofed (Red Lines 2, 4), or show a "how the gang worked" walkthrough. Police press releases about arrests are not used as scenario material.

## 9. Sources (accessed 2026-11-19 unless noted)
es-incibe-smishing-bank-callback-2025 (re-opened) · es-incibe-sms-banks-2022 · es-bde-sms-callerid-spoofing-2022 · es-bde-vishing-2020 · es-bde-medidas-fraude-telefono-2025 · es-boe-orden-tdf-149-2025 · es-boe-cnmc-circular-1-2026 · es-boe-cnmc-circular-2-2026 · es-boe-cnmc-circular-3-2026 · es-cnmc-alias-callout-2026 · es-incibe-017-faq · es-bde-reclamacion · es-bde-msr2025-fraude · eu-ep-psr-deal-2025 · pl-uknf-seniors-payments-2025 · accessed 2026-11-18: eu-epc-threats-2025 · eu-eba-ecb-fraud-2025 · eu-europol-phishing-leaflet · fr-bdf-osmp-2024 · nl-fraudehelpdesk-2025 · pl-cert-fake-consultants

## 10. Confidence
**High** for the chain, red flags 1–5 and the habit: INCIBE (2025) describes the exact sequence; the Banco de España explains thread and caller-ID spoofing; EU, French, Dutch and Polish bodies confirm the "move money to safety" pattern.
**High** for the legal facts in §6 (read in the BOE and the CNMC's own release).

**Unverified / caveats:**
- No source measures how much the 15 Sept 2026 alias blocking has reduced spoofed SMS in Spain. Don't claim it has stopped them.
- Orden TDF/558/2026 (the postponement order) was not opened; its number and date come from CNMC Circular 2/2026.
- Two Interior Ministry press releases (Policía Nacional, Nov 2026, 43 arrests for posing as banks' anti-fraud departments; Guardia Civil, SMS in genuine bank threads) could not be fetched (site error). They are **not** cited; the news coverage found is not used either.
- INCIBE's incident-report page ("Reporte de fraude") could not be opened (robots/site error), so no INCIBE report URL or email is given.
- Spanish online police reporting (scope, ratification in person) was not verified; the help card says "file a police report" without a URL.
- The EU refund rule (PSR) is provisional; adoption and dates not verified.
- The 2022 Banco de España and INCIBE pages and the 2020 vishing page are older; they are used for mechanisms (spoofing, codes) that the 2025 INCIBE warning confirms, not for prevalence.
