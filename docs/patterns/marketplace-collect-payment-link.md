# Pattern brief: `marketplace-collect-payment-link`

**Chapter:** 5 Warsaw (GDD §18: Swaploft "safe delivery" links while you sell something, LO-10; Mateus falls and you guide his damage control, LO-16) · **Status:** draft for review (T-3.6r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** fake buyer / "collect your payment" link; fake "safe delivery" or courier payment page; seller phishing on second-hand marketplaces.
- **Local names (PL):** CERT Polska describes it without a fixed name ("fałszywy kupujący", a link "poprzez którą rzekomo można wypłacić środki") [pl-cert-monthly-2025-12], [pl-cert-monthly-2026-01]. Polish banks and the press call it *oszustwo „na kupującego”*; that label was seen only on bank pages and in news, so it is not cited.
- **Why Poland is the stage:**
  - CERT Polska (the national CERT, run by NASK) lists it repeatedly in its monthly summaries: Dec 2025 [pl-cert-monthly-2025-12], Jan 2026 [pl-cert-monthly-2026-01] and Mar 2026 [pl-cert-monthly-2026-03], with pages imitating the marketplace and couriers.
  - 2025 context: about 260,800 incidents handled, around 98% of them fraud, and 244,300 malicious domains added to the warning list [pl-cert-monthly-2025-12]. *Figures for designers only (MAP rule: never compare countries).*
  - NASK's 2025 shopping guide gives sellers a checklist against exactly these buyers [pl-nask-okazja-czy-pulapka-2025].
  - EU level: the ESAs' factsheet describes marketplace deals that move the victim off-platform to a fake bank login [eu-esas-ai-scams-factsheet-nl].
- **Why it works:** you are the one *receiving* money, so a payment page feels harmless; the page looks like the marketplace or a courier you know; the "buyer" is friendly and quick; and young sellers may not know that receiving money never needs your card details.

## 2. Channel and psychological levers
**Channel:** marketplace listing → the "buyer" moves to a messenger → a link → a fake page in the browser. What the seller sees [pl-cert-monthly-2025-12], [pl-cert-monthly-2026-01], [pl-cert-monthly-2026-03], [pl-nask-okazja-czy-pulapka-2025]:
1. A buyer is interested in your listing and asks to continue on a messenger app instead of the marketplace chat.
2. They say they have **already paid** (sometimes "with courier delivery included") and send a link "to collect the money" or "to confirm the delivery".
3. The page looks like the marketplace or a delivery company and has a **payment panel** that asks for your card number, expiry and security code, or for your bank login, "so the money can be paid out to you".
4. Entering card details there leads to money leaving your account [pl-cert-monthly-2025-12], [pl-cert-monthly-2026-01].

**Levers:** helpfulness and politeness; the wish to close a sale quickly; trust in the marketplace and courier brands; low suspicion because you expect to *receive* money; mild urgency ("the courier is coming today").

## 3. Red flags a normal person can spot
1. **"Receiving" money asks for your card details or bank login.** Nobody needs your card's security code or your banking password to pay you [pl-nask-okazja-czy-pulapka-2025], [pl-cert-monthly-2025-12], [eu-esas-ai-scams-factsheet-nl].
2. **The buyer moves the chat off the marketplace** to a messenger [pl-nask-okazja-czy-pulapka-2025], [pl-cert-monthly-2025-12], [eu-esas-ai-scams-factsheet-nl].
3. **The buyer sends a link "to confirm" or "collect" the payment** instead of the payment showing in the marketplace app itself [pl-nask-okazja-czy-pulapka-2025], [pl-cert-monthly-2026-03].
4. **The page's address isn't the marketplace's own address** (read the owner part). A familiar logo or courier name on the page proves nothing [pl-cert-monthly-2026-01] (pages imitate the marketplace and couriers); habit from `email-phishing-credential.md`.
5. **Pressure to ship or "confirm" before the money is visible** in your own account or in the marketplace app [pl-nask-okazja-czy-pulapka-2025].
6. **Requests for a photo of your card or a scan of your ID** "to verify you" [pl-nask-okazja-czy-pulapka-2025].

## 4. The verification habit
**"Keep the deal and the payment inside the marketplace app you opened yourself. If money is on its way, it shows there or in your banking app. Never enter card details or a bank login to *receive* money."** [pl-nask-okazja-czy-pulapka-2025], [pl-cert-monthly-2025-12], [eu-esas-ai-scams-factsheet-nl]

In the game: open Swaploft yourself → no payment is shown → decline the link; report the buyer with the in-app button.

## 5. Already caught? (generic + Poland where verified)
1. **Card details typed in:** block the card in your banking app or call your bank on the number on the card **at once**; some transfers can still be stopped [pl-nask-okazja-czy-pulapka-2025], [pl-uknf-seniors-payments-2025].
2. **Bank login typed in:** call the bank the same way, then change the password from the real app or site [pl-nask-okazja-czy-pulapka-2025].
3. **Keep the evidence:** the chat, the link, screenshots of the page, payment confirmations [pl-nask-okazja-czy-pulapka-2025].
4. **Report:**
   - the buyer to the marketplace (in-app report) [pl-nask-okazja-czy-pulapka-2025];
   - the fake page to CERT Polska at incydent.cert.pl (also possible in the government ID app); a suspicious SMS can be forwarded free to **8080** [pl-nask-okazja-czy-pulapka-2025], [pl-cert-monthly-2025-12], [pl-cert-monthly-2026-07];
   - a police report (for large losses the guide also mentions the prosecutor's office) [pl-nask-okazja-czy-pulapka-2025], [pl-uknf-seniors-payments-2025].
5. **Under 18:** tell a parent or trusted adult first and call the bank with them (where-to-report first step).
6. **No shame:** the UKNF's advice is to call the bank straight away "without feeling ashamed" [pl-uknf-seniors-payments-2025]. Mateus's damage control should model this tone.

## 6. Variations by country and local hooks
- **PL:** pages styled as the marketplace and as couriers, including a parcel-locker brand; buyer contact via a messenger app [pl-cert-monthly-2025-12], [pl-cert-monthly-2026-01], [pl-cert-monthly-2026-03]. Related: fake marketplace **login** pages [pl-cert-monthly-2026-07] (not this pattern, but the same habit).
- **EU:** off-platform deal → fake bank login [eu-esas-ai-scams-factsheet-nl]; marketplace fraud generally [eu-europol-iocta-2026].
- **NL (context):** buy/sell fraud is the #2 private-individual category for Fraudehelpdesk in 2025 [nl-fraudehelpdesk-2025] (not split by buyer/seller).
- **The "safe delivery" wording:** GDD §18 uses "safe delivery". The Polish sources describe "pay-out" pages styled as courier or delivery services; none uses the words "safe delivery" as such. The game may keep "Swaploft Safe Delivery" as a fictional label for the fake page, but the debrief should talk about "a link to collect your payment".

## 7. Genuine-twin notes (what a real version looks like)
- **A real buyer** pays through the marketplace's own checkout. The seller sees the order and the delivery label **inside the Swaploft app**, which the player opens themselves; any payout goes to the account already saved there, without card details.
- **A real delivery notice** for the sold item comes in the app or from the courier about a parcel you posted, and asks for nothing financial.
- **Design rule:** don't make the fake tellable by poor grammar or by a pushy tone alone; the genuine buyer can be brisk too. The tells are "off the app", "a link to receive money" and "card or login on that page".

## 8. Game-design notes (non-binding)
- Swaploft (marketplace) and Kettle (messenger) are fictional; the fake page's owner part uses `.example`/`.test`, e.g. a look-alike of Swaploft's own registered domain (brand check needed). No real marketplace, courier or locker brand in content (Red Line 1); the sources name them, the game must not.
- The fake page is a non-functional `SimulatedForm` (Red Line 2), visibly part of the game.
- **Mateus's fall:** he types his card details on the "collect payment" page (his sale, his card). Player-guided damage control: stop (block the card in the app / call the bank on the card's number) → secure (change the bank password only if he typed it) → report (marketplace in-app report, CERT-style national reporting point, police) → warn (none needed here). Harmful options: "ask the buyer to cancel it", "wait until the money arrives", "pay a fee to a 'recovery' service".
- Describe only what the victim sees; no detail of how the pages are built or hosted.

## 9. Sources (accessed 2026-11-19 unless noted)
pl-cert-monthly-2025-12 (re-opened) · pl-cert-monthly-2026-01 · pl-cert-monthly-2026-03 · pl-cert-monthly-2026-07 · pl-nask-okazja-czy-pulapka-2025 · pl-uknf-seniors-payments-2025 · accessed 2026-11-18: eu-esas-ai-scams-factsheet-nl · eu-europol-iocta-2026 · nl-fraudehelpdesk-2025

## 10. Confidence
**High** for the chain, red flags 1–3 and the habit: CERT Polska describes the scheme in three monthly summaries (Dec 2025, Jan and Mar 2026); NASK's guide gives the seller red flags; the ESAs confirm it at EU level.

**Unverified / caveats:**
- No Polish source states how many sellers are hit; the 2025 figures are totals for all incidents.
- The marketplace and parcel-locker brands named in the sources are research labels only.
- No official Polish police page on this specific seller scheme was found; the police step rests on the NASK guide and the UKNF slides.
- Whether a card payment taken this way can be charged back depends on the bank and on how it was authorised; not verified, so the game says only "call your bank at once".
- CERT Polska's 2025 annual report PDFs could not be opened (site error).
