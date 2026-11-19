# Pattern brief: `hijacked-friend-payment-code`

**Chapter:** 5 Warsaw (GDD §18: code requests from a hacked friend, LO-05, LO-07; Mateus falls and you guide his damage control, LO-16) · **Status:** draft for review (T-3.6r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

Related: `messenger-account-takeover-code.md` (how the friend's account gets taken over: a verification code or a "vote" page) and `messenger-family-impersonation.md` (Amsterdam: "new number" money requests). This brief covers the **Polish payment-code** variant: the hijacked account asks for the 6-digit code from your banking app.

## 1. Name and aliases
- **English:** "friend in need" via a hijacked account; payment-code request from a friend; "can you send me a code?".
- **Local names (PL):** *oszustwo „na znajomego”* (title of the warning hosted by the Polish police) [pl-policja-psp-na-znajomego]; *metoda „na kod”* / *„na znajomego”* (NASK, 2020) [pl-nask-metoda-na-2020]; *podszywacze* ("impersonators", a 2026 payment-scheme campaign) [pl-blik-podszywacze-2026] (supporting only).
- **Game label:** a "6-digit instant payment code" from the fictional Larchwick app (MAP rule: real payment products are research labels only).
- **Why Poland is the stage:**
  - Poland's widely used mobile payment code works like this: the payer generates a code in the banking app, it is typed in where the payment is made, and the payer confirms in the app. If you give your code to *someone else*, their payment comes out of *your* account once you confirm it [pl-policja-psp-na-znajomego]. (How widely it is used was not sourced; don't state market share.)
  - A warning hosted on the Polish police site describes friends' social accounts being taken over to ask contacts for that code [pl-policja-psp-na-znajomego]; NASK described the same in 2020 [pl-nask-metoda-na-2020].
  - CERT Polska's July 2026 summary warns of fake loan requests from friends after a social account takeover [pl-cert-monthly-2026-07]; its August 2026 advisory covers friends' hijacked accounts asking for votes [pl-cert-vote-takeover-2026].
  - The UKNF (financial supervisor) lists payment codes among the data criminals want [pl-uknf-seniors-payments-2025].
- **Why it works:** it really is your friend's account and chat history; the amount is small and the story plausible ("my card is blocked, I'll pay you back tonight"); and a 6-digit code feels like nothing until the app asks you to confirm.

## 2. Channel and psychological levers
**Channel:** social network or messenger (the friend's real, hijacked account) → your banking app's confirmation prompt. What the victim sees [pl-policja-psp-na-znajomego], [pl-nask-metoda-na-2020]:
1. A message from a friend's real account: they urgently need a bit of money and ask you to generate a payment code in your banking app and send it to them.
2. If you send the code, **your banking app then asks you to confirm a payment** with its details. Many people confirm with their PIN without checking them [pl-policja-psp-na-znajomego].
3. Follow-ups may ask for more. A second request is frequent in friend-in-need fraud generally [nl-politie-hulpvraagfraude-2025]; no Polish source checked describes it for the code variant.

**Levers:** trust in the friend's account and chat history; helpfulness and friendship; urgency ("right now, I'm at the till"); small amounts; a code feeling harmless; the app's confirmation step being tapped through by habit.

## 3. Red flags a normal person can spot
1. **Anyone asks for a code from your banking app**, even a friend. A payment code is a way to pay *from your account*; giving it to someone lets them spend your money once you confirm [pl-policja-psp-na-znajomego], [pl-nask-metoda-na-2020], [pl-uknf-seniors-payments-2025].
2. **An urgent money request in a chat**, even from a real friend's account [pl-policja-psp-na-znajomego], [pl-cert-monthly-2026-07], [pl-blik-podszywacze-2026].
3. **The banking app's confirmation shows details you didn't expect.** Read the amount and the recipient before you confirm [pl-policja-psp-na-znajomego]. *(The source says "check the transaction details"; that the recipient is a shop rather than the friend is a design choice, see §8.)*
4. **The request exists only in the chat.** If a call to the friend's saved number doesn't confirm it, don't act [pl-blik-podszywacze-2026] (supporting), [pl-policja-psp-na-znajomego].
5. **A second request** after the first, as in friend-in-need fraud generally [nl-politie-hulpvraagfraude-2025] (see `messenger-family-impersonation.md`).

## 4. The verification habit
**"Never send a code from your banking app to anyone. If a friend asks for money in a chat, call them on the number you already have, not through the same chat. And always read who gets the money before you confirm in your app."** [pl-policja-psp-na-znajomego], [pl-nask-metoda-na-2020], [pl-blik-podszywacze-2026]

Prevention for debriefs: turn on two-step verification for social and messenger accounts [pl-policja-psp-na-znajomego], [nl-politie-whatsapp-takeover-2024]; agree a check word with close friends, but don't keep it in the same chat [pl-blik-podszywacze-2026] (supporting).

## 5. Already caught? (generic + Poland where verified)
**If you gave a code and confirmed the payment:**
1. **Call your bank at once** on the number on your card or in the app; report the fraud [pl-uknf-seniors-payments-2025], [pl-nask-okazja-czy-pulapka-2025].
2. **Tell your friend through another channel** (call them): their account is taken over [pl-nask-metoda-na-2020], [pl-cert-vote-takeover-2026].
3. **Keep the chat** (screenshots) and the app's payment record [pl-nask-okazja-czy-pulapka-2025].
4. **Report:** the account to the social network or messenger (in-app report) [pl-blik-podszywacze-2026]; a police report [pl-uknf-seniors-payments-2025], [pl-nask-okazja-czy-pulapka-2025]; CERT Polska at incydent.cert.pl [pl-cert-vote-takeover-2026], [pl-cert-monthly-2026-07].
5. **Don't send any more codes or money**, whatever the follow-up says.

**If it's your account that was hijacked** (the friend's side): follow `messenger-account-takeover-code.md` §5 (log out unknown devices, recover the account with your own number, turn on two-step verification, warn contacts by another channel, report) [pl-cert-vote-takeover-2026], [nl-politie-whatsapp-takeover-2024].

**If you only sent the code but did NOT confirm in the app:** the payment should not go through without your confirmation [pl-policja-psp-na-znajomego]; still tell your friend and report the account. *(Inference from the two-step flow the source describes; don't promise it on screen.)*

**Refunds:** a payment you confirmed yourself may count as authorised, so the bank may not have to refund it. This was checked for Spain only, not for Poland ([es-bde-msr2025-fraude]; see `bank-safe-account-call.md` §5). Never promise the money back.

## 6. Variations by country and local hooks
- **PL:** 6-digit mobile-payment code, then confirmation in the banking app [pl-policja-psp-na-znajomego]; older NASK description [pl-nask-metoda-na-2020]; "loan" requests after takeovers [pl-cert-monthly-2026-07]; vote requests leading to takeover [pl-cert-vote-takeover-2026].
- **NL:** the same hijacked-account start, but the ask is a bank transfer ("Hi Mum") [nl-politie-hulpvraagfraude-2025].
- **DE:** device-linking ("ghost pairing") takeovers that start with a friend's message [de-vzn-ghost-pairing-2026].
- **EU:** login-approval QR codes sent via messaging apps [eu-epc-threats-2025].

## 7. Genuine-twin notes (what a real version looks like)
- **A real friend in a fix** is happy to take a call, and a real request can wait two minutes while you ring them on their saved number. They can ask you to send money to *their* number or account by a normal transfer, which you start yourself.
- **A real payment code** is one *you* generate to pay at a till or website *you* are using. The confirmation shows the shop you're at and the amount you expect.
- **Design rule:** the hijacked message must not be told apart by spelling or tone alone: it comes from the friend's real account with real history. The tells are "a code from my app" and "the confirmation names someone else".

## 8. Game-design notes (non-binding)
- Kettle is the messenger; the friend's chat shows real history (CR-25 `earlier`). Don't show how the account was taken over; at most, a later scene where the friend says "someone got into my account".
- The Larchwick app's code screen and confirmation prompt are fictional; the confirmation names a shop-like recipient and an amount (e.g. a fictional electronics shop), so "read the recipient" is a checkable.
- **Mateus's fall (GDD §18: "Mateus falls"):** if the chapter uses this pattern for his fall, he sends the code *and* confirms; the player guides: call the bank on the card's number (stop) → call the real friend (warn) → keep the chat (secure) → report the account in Kettle and to the police (report). Harmful: "send another code to cancel it", "reply in the same chat to ask for the money back", "keep quiet".
- Who falls is a writing choice; this brief supports either the marketplace page (`marketplace-collect-payment-link.md`) or the code as Mateus's fall.

## 9. Sources (accessed 2026-11-19 unless noted)
pl-policja-psp-na-znajomego · pl-cert-monthly-2026-07 · pl-uknf-seniors-payments-2025 · pl-nask-okazja-czy-pulapka-2025 · pl-blik-podszywacze-2026 (supporting only) · es-bde-msr2025-fraude · accessed 2026-11-18: pl-nask-metoda-na-2020 · pl-cert-vote-takeover-2026 · nl-politie-whatsapp-takeover-2024 · nl-politie-hulpvraagfraude-2025 · de-vzn-ghost-pairing-2026 · eu-epc-threats-2025

## 10. Confidence
**Medium-high** (was Medium in MAP): the warning hosted by the Polish police (undated) describes the code-and-confirm flow; NASK (2020) confirms it; CERT Polska's 2026 material confirms friend-account takeovers used for money requests; UKNF (2025) lists payment codes as a target.

**Unverified / caveats:**
- The police-hosted warning names no issuer or date; its file name suggests the payment-scheme operator. Treat it as official-hosted, not as a police statement.
- No current (2026) Polish *official* source names the payment code in a hijacked-friend request; CERT Polska's 2026 items say "loan requests" and "votes". The code detail rests on the police-hosted warning and NASK 2020. A 2026 payment-scheme campaign covers impersonating friends, but it is industry material (tier 4).
- No prevalence figure. Don't put a number on screen.
- Whether a bank refunds a confirmed code payment was not checked; don't promise it.
