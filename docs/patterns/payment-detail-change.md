# Pattern brief: `payment-detail-change`

**Chapter:** 3 (Paris) · **Status:** draft for review (phase 3, Paris step 1) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

> **Scope (Red Line 8).** The request must arrive by **email or messenger** (look-alike address, or a genuine but hijacked mailbox), and the decision point is in the **banking app** (new payee, payee-name check). A paper-only letter announcing a new RIB is out of scope.
>
> **Audience (14+).** The consumer variants below (landlord, tradesperson, club or school fees, a summer-job salary) let a teenager relate. The business variant (supplier invoice) fits the "trust inspector" job premise.

## 1. Name and aliases
- **English:** payment-detail change fraud; invoice redirection; "we've changed banks, please use our new IBAN"; supplier IBAN change.
- **French:** *fraude au changement de RIB*, *arnaque au faux RIB*, *fraude au virement (faux RIB)* [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025], [fr-fbf-cles-faux-rib-2025]. In France, a *RIB* (relevé d'identité bancaire) is the bank-details slip people send as a PDF or image.
- **Where it is prominent and why:**
  - **France:** the national assistance platform has a dedicated fiche naming **landlords, craftspeople and notaries** as impersonated creditors [fr-cybermalveillance-fiche-faux-rib]. The Banque de France warns about "any new bank details sent when an invoice is due" [fr-bdf-fraude-moyens-paiement]. The banking federation's consumer site names **landlords, energy suppliers, telecom operators and administrations** [fr-fbf-cles-faux-rib-2025]. The national consumer institute covers it too [fr-inc-iban-rib-fraudes-2025]. Businesses are hit through fake supplier RIB changes [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi].
  - **EU-wide:** the European Banking Federation lists invoice/supplier IBAN change [eu-ebf-cyberscams]. The EPC says invoicing is "particularly exposed" to IBAN manipulation [eu-epc-threats-2025].
  - Why it works: you **expected** to pay this person, the amount is right, and the message often comes from their real address or sits in a real thread [fr-cybermalveillance-fiche-faux-rib], [eu-esas-ai-scams-factsheet-nl].

## 2. Channel and psychological levers
**What the victim sees:**
- An **email from a creditor you already deal with**, just before a payment is due, with an invoice and a **new RIB** attached [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025].
- The address may be **very close** to the real one, with a copied logo and layout, sometimes backed by a look-alike website [fr-fbf-cles-faux-rib-2025].
- Or it comes from the creditor's **real** mailbox, or appears inside an existing thread, because a mailbox was hijacked. It may be the creditor's mailbox **or the victim's own** [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025], [eu-esas-ai-scams-factsheet-nl]. *(Victim's view only; how a mailbox is taken over is not described.)*
- A short story: "we changed banks", "our old account is being audited", plus urgency [fr-fbf-cles-faux-rib-2025], [fr-inc-iban-rib-fraudes-2025].
- Business twin: a "supplier" announces new bank details; or a fake "employee" asks HR to pay their salary into a new account [fr-cybermalveillance-fiche-fovi].

**Levers:** routine (you were going to pay anyway), trust in a known name, urgency ("late fees", "the works can't start"), and the low effort of changing one line.

## 3. Red flags a normal person can spot
1. **New bank details arrive by message just as a payment is due** [fr-bdf-fraude-moyens-paiement], [fr-inc-iban-rib-fraudes-2025], [fr-cybermalveillance-fiche-faux-rib].
2. **Someone you know asks you to pay an account you've never used before** [fr-inc-iban-rib-fraudes-2025].
3. **Urgency** around the change ("pay today to the new account") [fr-inc-iban-rib-fraudes-2025], [fr-fbf-cles-faux-rib-2025].
4. **The sender address is almost, but not exactly, the usual one.** *Caveat:* the real address can be used too, if the mailbox was hijacked [fr-fbf-cles-faux-rib-2025], [fr-cybermalveillance-fiche-faux-rib].
5. **The bank-details document looks edited:** gaps, mixed fonts, or a bank code that doesn't fit the bank named on it [fr-bdf-fraude-moyens-paiement], [fr-inc-iban-rib-fraudes-2025]. *Bonus clue only;* a clean-looking RIB proves nothing.
6. **Your bank's payee-name check says "no match" or "close match"** when you enter the name of the person you mean to pay (see §5) [fr-inc-vop-2025], [eu-eurlex-ipr-2024-886].
7. **The sender explains away the bank's warning in advance** ("the name check always fails for our new account, just confirm"). Fraudsters coach victims to ignore alerts [eu-epc-threats-2025]. INC's advice is not to confirm a transfer after a mismatch warning, "même si le bénéficiaire insiste" [fr-inc-vop-2025]. *(The exact line is a game example; the EPC describes the tactic for bank alerts in general.)*

## 4. The verification habit
**"Before you pay new bank details, call the person on the number you already had (not one in the email) and ask them to confirm the change. If your bank says the name doesn't match, stop and check, even if they insist."**
- Contact the creditor directly on their usual number [fr-cybermalveillance-fiche-faux-rib], [fr-bdf-fraude-moyens-paiement], [fr-inc-iban-rib-fraudes-2025], [fr-fbf-cles-faux-rib-2025].
- Don't click links in the message; go to the company's site yourself; ask your bank if unsure [fr-fbf-cles-faux-rib-2025].
- "Ne validez pas le virement en cas de non-concordance", even if the payee insists [fr-inc-vop-2025].
- A **match** does not make the request genuine: the check "must not lower your vigilance about whether the payee details are accurate and legitimate" [fr-bdf-fraude-moyens-paiement].
- Business: changes to bank details go through the same non-skippable verification and validation procedure as transfers [fr-cybermalveillance-fiche-fovi], [fr-gendarmerie-fovi].
- For a 14+ player: "If it's a family bill or a club fee, show the message to the adult who normally pays it, and call the club on the number on its website or membership card." *(Game wording, consistent with the sources' "known number" habit.)*

## 5. Payee-name check (Verification of Payee, VoP) under Regulation (EU) 2024/886
**What it is.** Before you confirm a SEPA credit transfer in euro, your bank checks whether the **name you typed** matches the **holder of the IBAN** you typed. It asks the payee's bank and shows you the result [eu-eurlex-ipr-2024-886], [eu-ecb-ipr], [eu-epc-vop-scheme].
- It applies to **standard and instant** transfers [eu-ecb-ipr], [fr-inc-vop-2025].
- It is **free** [eu-ecb-ipr], [fr-inc-vop-2025].
- It applies **whatever channel** you use: app, online banking, ATM [eu-eurlex-ipr-2024-886], [fr-inc-vop-2025].
- For a person, the first and last name are checked; for a firm or association, its trade or company name [fr-inc-vop-2025].

**Dates of application** (Art. 5c(9)) [eu-eurlex-ipr-2024-886], [eu-ecb-ipr]:
- **Euro-area payment service providers:** by **9 October 2025** [eu-ec-ipr-vop-2025]. In France, "since 9 October 2025" [fr-bdf-fraude-moyens-paiement], [fr-inc-vop-2025].
- **Non-euro EU Member States:** by **9 July 2027**.
- EPC scheme rulebook in force since 5 October 2025 [eu-epc-vop-scheme].

**What the user sees.** The four results:

| Result (EU / EPC) | French wording reported by INC | What the user is told |
|---|---|---|
| **Match** | *correspondance exacte* | Name and IBAN belong together. Proceed if the request itself is genuine. |
| **Close match** | *correspondance partielle* | The bank **shows the actual account-holder name** so you can compare [eu-eurlex-ipr-2024-886], [eu-epc-vop-scheme]. |
| **No match** | *aucune correspondance* | Warning that paying "might lead to transferring the funds to a payment account not held by the payee" you named [eu-eurlex-ipr-2024-886]. |
| **Check not possible** | *vérification impossible* | The bank couldn't check, e.g. the account doesn't exist or can't be checked [fr-inc-vop-2025], [eu-epc-vop-scheme]. |

Sources for the table: [eu-ecb-ipr], [eu-epc-vop-scheme], [fr-inc-vop-2025].

- **The wording and design vary by bank.** The EPC leaves it to each bank to decide how to tell the payer [eu-epc-vop-faq]. The game must invent its own fictional banking-app warning and must not copy a real bank's screen (Red Line 1).
- **You can still pay after a warning.** The check must not stop you authorising [eu-eurlex-ipr-2024-886]. You can confirm, correct or cancel [fr-inc-vop-2025].
- **Paying after a no-match warning has consequences.** If you pay anyway, you do it "en toute connaissance de cause" and your bank is no longer responsible [fr-inc-vop-2025]. The regulation requires banks to tell users the liability consequences of ignoring a warning, and a bank that ran the check properly isn't liable for a transfer to the wrong payee [eu-eurlex-ipr-2024-886].
- **France: what it doesn't cover.** Per INC: transfers to New Caledonia, French Polynesia and Wallis-and-Futuna, international transfers, and external transfers to savings accounts [fr-inc-vop-2025].

**Limits: what VoP does *not* stop.**
1. **It checks that name and account belong together, not that the request is genuine.** The scheme "cannot be relied upon to identify a private or a legal person" [eu-epc-vop-scheme]. The Banque de France says it must not lower your vigilance about whether the details are "legitimate" [fr-bdf-fraude-moyens-paiement].
2. **If you type the name of whoever really holds the account, you get "match".** That holder could be the scammer or a money mule. For example, the message says "pay Mrs Jane Doe, our new accountant", and the account really is in that name. *Researcher inference from the definition* [eu-ecb-ipr], [eu-eurlex-ipr-2024-886]. No official source found this session states this scenario in so many words.
3. **Scammers can talk you past the warning** ("the check is buggy for new accounts"). Victims are told to ignore or dismiss alerts [eu-epc-threats-2025]. The warning only helps if you stop.
4. **It covers credit transfers only.** Card payments and payment links are outside the regulation's VoP article [eu-eurlex-ipr-2024-886]. *Scope inference;* no official source on scammers steering victims to cards was verified.
5. **Outside its scope**, as listed above (e.g. international transfers) [fr-inc-vop-2025], and in non-euro EU states before 9 July 2027 [eu-ecb-ipr].

**Where VoP helps in this pattern.** In the classic fake-landlord or fake-artisan case, the player types the **creditor's name** they know. If the new IBAN belongs to someone else, the bank shows **no match** or a **close match** with a different name. That warning is the moment to stop and call. Model this in the game.

## 6. Already caught? (generic + France, verified 2026-11-19)
1. **Call your bank immediately.** Ask it to suspend the transfer or request a **recall for fraud**. The sooner the better [fr-bdf-fraude-moyens-paiement], [fr-cybermalveillance-fiche-faux-rib], [fr-gendarmerie-fovi].
   - INC notes an instant transfer can't be recalled but can be contested [fr-inc-iban-rib-fraudes-2025].
   - Don't promise a refund on screen (see §10).
2. **Warn the person or company who was impersonated**, on their known number. Their mailbox may be hijacked [fr-cybermalveillance-fiche-faux-rib], [fr-fbf-cles-faux-rib-2025], [fr-inc-iban-rib-fraudes-2025].
3. **Keep evidence:** the message, invoice, RIB, bank statement [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025].
4. **If your own mailbox may be hijacked:**
   - check for forwarding or filter rules and sign-ins you don't recognise; take screenshots before deleting them;
   - change the password and turn on two-factor authentication.

   [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025]
5. **Report** (France):
   - **Complaint** with police or gendarmerie, or in writing to the public prosecutor. You can start with an online pre-complaint [fr-cybermalveillance-fiche-faux-rib], [fr-bdf-fraude-moyens-paiement], [fr-inc-iban-rib-fraudes-2025].
   - **THESEE** online complaint for a money request received from a contact's **hijacked** mailbox. It is for **individuals (*particuliers*) only, filing in their own name**, adults only, via FranceConnect [fr-justice-thesee-messagerie-2025]. That fits the landlord and tradesperson cases (the person who paid files). It does not fit the business cases (supplier, salary change), where the firm complains to the police or gendarmerie. The Banque de France also points to Thésée for transfer scams [fr-bdf-fraude-moyens-paiement].
   - **17Cyber** (17cyber.gouv.fr), the government's online help service run by the Police nationale, the Gendarmerie nationale and Cybermalveillance.gouv.fr. You answer a few questions to identify the problem and get advice, with links to report and to file a complaint. In an emergency, call 17 or 112 [fr-cybermalveillance-17cyber-2024].
   - **Info Escroqueries 0 805 805 817** (free) for advice [fr-cybermalveillance-fiche-faux-rib].
6. **For a 14+ player:** minors can't file a THESEE complaint, only a report [fr-justice-thesee-messagerie-2025]. Debrief line: "Tell the adult who pays the bill straight away; the bank call is the urgent step."
7. **Beware of "recovery" offers** that follow [eu-esas-ai-scams-factsheet-nl].

## 7. Variations / local hooks
**France:**
- **Rent (*loyer*):** a "landlord" or letting agent sends a new RIB [fr-cybermalveillance-fiche-faux-rib], [fr-fbf-cles-faux-rib-2025].
- **Works:** an "artisan" sends the invoice for the balance with a new RIB [fr-cybermalveillance-fiche-faux-rib], [fr-inc-iban-rib-fraudes-2025].
- **Energy supplier, telecom operator or an administration:** "we changed banks" [fr-fbf-cles-faux-rib-2025].
- **Notary:** property deposit [fr-cybermalveillance-fiche-faux-rib]. Less relevant for 14+.
- **Salary-account change** sent to HR in the name of an employee [fr-cybermalveillance-fiche-fovi]. Works as a "trust inspector" task, or as a twist in which the player's own summer-job pay is at stake.
- **Supplier RIB change** in a business [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi].
- **Background, not on screen:** since 7 May 2026 the Banque de France runs a national file in which French banks share suspected-fraud alerts (FNC-RF). It's a bank-side measure, and nothing the payer sees is described [fr-bdf-fraude-moyens-paiement].
- **SMS variant:** suspicious texts can be forwarded to **33 700** [fr-bdf-fraude-moyens-paiement].

**EU:**
- invoice/supplier IBAN change [eu-ebf-cyberscams];
- IBAN manipulation, including tampered QR codes on invoices [eu-epc-threats-2025];
- phishing inserted into existing email threads [eu-esas-ai-scams-factsheet-nl].

**Inferred, not sourced:** a **sports club, music school or school-trip** fee "now payable to a new account", by email or the club's messenger group. This is a plausible consumer analogue of the creditor pattern, but no official source names clubs or schools. Use it as a fictional variant and keep the debrief generic ("anyone you pay regularly").

## 8. Genuine-twin notes (what a real version looks like)
- **Real bank-detail changes happen.** A genuine one is confirmed when you call the known number, and the payee-name check usually says **match** for the name you expect.
- A **genuine "close match"** happens too, e.g. "J. Martin" vs "Jeanne Martin". The bank then shows the real holder's name [eu-eurlex-ipr-2024-886], [fr-inc-vop-2025].
  - *Inference, not sourced:* a firm's **trading name vs its legal name** (e.g. "Volet Bleu" vs "Volet Bleu Gestion SAS") giving a close match. INC says only that firms are checked on their trade or company name and that a close match means "close but not identical" [fr-inc-vop-2025]. How each bank scores a trading-vs-legal name pair is not published in the sources read; it could also give "match" or "no match". Fine as a game example, but don't state it as how VoP always behaves. Include a genuine close-match twin, so the player learns to **read the shown name**, not to panic at any warning.
- **Design rules:**
  - Don't make every fake show "no match". At least one fake (later in the chapter) should give **match**, because the account really is in the name the scammer supplied. The only tell is the unexpected change plus the callback.
  - Per CONTENT_GUIDE, a "match" result is a detail that looks the same on real and fake requests in that case, so its reveal uses the neutral wording.

## 9. Game-design notes (non-binding)
- Fictional banks, landlords, clubs and firms only (`content/brands.yaml`). IBANs must fail the checksum (Red Line 3). The RIB is a stylised in-game card, not a real bank's layout.
- Decision point: the fictional banking app's "new payee" screen with a fictional VoP result. Actions: *Pay / Call the known number / Ask the adult who pays / Cancel and report*.
- Don't show how a mailbox is hijacked or how a document is edited (Red Lines 2 and 4). Show only what the victim receives.
- Debrief safe action: "Call the person on the number you already had; a name warning means stop." If fallen: "Bank now, then warn the real creditor, then complain."

## 10. Sources (accessed 2026-11-19 unless marked)
fr-cybermalveillance-fiche-faux-rib · fr-cybermalveillance-fiche-fovi · fr-bdf-fraude-moyens-paiement · fr-inc-vop-2025 · fr-inc-iban-rib-fraudes-2025 · fr-fbf-cles-faux-rib-2025 · fr-justice-thesee-messagerie-2025 · fr-cybermalveillance-17cyber-2024 · fr-gendarmerie-fovi (re-opened 2026-11-19) · eu-eurlex-ipr-2024-886 · eu-ecb-ipr (re-opened 2026-11-19) · eu-epc-vop-scheme · eu-epc-vop-faq · eu-epc-threats-2025 (re-read 2026-11-19) · eu-ebf-cyberscams (2026-11-18) · eu-esas-ai-scams-factsheet-nl (2026-11-18) · eu-ec-ipr-vop-2025 (2026-11-18)

## 11. Confidence
- **High** for the pattern, red flags, habit and recovery steps. Five French official bodies agree:
  - Cybermalveillance.gouv.fr with the Interior Ministry and ANSSI;
  - the Banque de France;
  - the FBF;
  - INC;
  - the Gendarmerie.

  The landlord and tradesperson variants are **sourced**, not inferred [fr-cybermalveillance-fiche-faux-rib], [fr-fbf-cles-faux-rib-2025]. This upgrades the MAP ch 3 note that the consumer variant was "inferred".
- **High** for the VoP facts (results, dates, free, can still pay, scope). Sources: the regulation itself, the ECB, the EPC, the Banque de France and INC.
- **Medium** for the VoP limits. Limit 1 is stated by the EPC and the Banque de France. Limits 2 and 4 are inferences from the definition and scope. Limit 3 is an EPC statement about bank alerts in general.
- **Low** for the club, school and school-trip variant: inferred, no source.

**Unverified / caveats:**
- **Refunds:** no source verified this session says whether a French bank must refund a transfer the victim **made themselves** after being deceived. The Banque de France's 13-month and 70-day refund rules are for **unauthorised** operations [fr-bdf-fraude-moyens-paiement]. Don't promise refunds in debriefs; say "ask your bank straight away".
- [fr-inc-iban-rib-fraudes-2025] (March 2025) says banks generally don't check name against IBAN. That was true **before** 9 October 2025 and is now outdated. Cite it only for red flags and victim steps.
- The French result labels come from INC; real banks word them differently [eu-epc-vop-faq].
- No official French loss figure for faux-RIB fraud was found. Don't put a number on screen.
- Instant-transfer recall: INC says an instant transfer can't be recalled but can be contested; the Banque de France just says "ask for a recall". Keep the debrief to "call your bank at once".
- 17Cyber is described from the live site (opened 2026-11-19). The site states no opening hours and no chat. The December 2024 press release mentions 24/7 availability and a chat, but don't claim either on screen.
- THESEE is for individuals filing in their own name (re-checked live 2026-11-19).
- Opening hours for Info Escroqueries were not re-verified, so don't display them.
