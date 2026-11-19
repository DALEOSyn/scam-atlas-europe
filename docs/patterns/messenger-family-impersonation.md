# Pattern brief: `messenger-family-impersonation`

**Chapter:** 2 (Amsterdam) · **Status:** draft for review (phase 3, ch2 step 1) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** "Hi Mum" / "Hi Dad" scam; friend-in-need fraud; family-impersonation scam; "new number" scam.
- **Local names:**
  - NL: *hulpvraagfraude* (police term, "help-request fraud"), also *vriend-in-noodfraude* and *WhatsApp-fraude* [nl-politie-hulpvraagfraude-2025], [nl-fraudehelpdesk-fraudevormen]; *hulpvraagoplichting* (banking association) [nl-veiligbankieren-hulpvraag].
  - The name of the real messenger in the Dutch alias is a factual label only. The game uses Kettle (Red Line 1).
- **Where it is prominent and why:**
  - **Netherlands:** the police publish a dedicated report-preparation form (version 1 Sep 2025) and an online report route for this exact fraud [nl-politie-hulpvraagfraude-2025], [nl-politie-aangifte-hulpvraagfraude]. Fraudehelpdesk runs a standing campaign ("never pay before you have called the old number", updated Oct 2025) [nl-fraudehelpdesk-hulpvraag-campaign], and on 18 Nov 2026 issued a fresh alert about hijacked messenger accounts being used to ask contacts for money [nl-fraudehelpdesk-takeover-alert-2026]. The Netherlands was an early hotspot: reports in Jan–Apr 2020 exceeded the whole of 2019 [nl-betaalvereniging-friend-in-need-2020].
  - *Caveat:* Fraudehelpdesk's 2025 review does not put it in the top 3 by reports (helpdesk fraud, buy/sell fraud and advance-fee fraud are) [nl-fraudehelpdesk-2025]. It is a well-documented, long-running pattern, not the single biggest one.
  - **EU-wide:** the ESAs factsheet covers impersonation of relatives, including cloned voices, and advises a family safe word [eu-esas-ai-scams-factsheet-nl]; the EPC lists cloned voices in family-emergency scams [eu-epc-threats-2025].
  - Why it works: the request comes from "someone you love", the story is an emergency, and messenger chats feel private and personal.

## 2. Channel and psychological levers
**Channel:** messenger (by far the most common in NL), also SMS, email and other chat apps [nl-politie-hulpvraagfraude-2025]. Three shapes:

- **A. "New number" (lead variant for 2-x):** a message from an unknown number says "this is my new number, you can delete the old one". The profile photo looks right (often copied from social media). Sometimes it starts with an SMS asking you to continue on the messenger [nl-fraudehelpdesk-hulpvraag-campaign], [nl-veiliginternetten-hulpvraag]. After some friendly chat, sometimes days later, comes the money request [nl-veiligbankieren-hulpvraag], [nl-veiliginternetten-hulpvraag].
- **B. Hacked real account:** the message comes from the friend's or relative's *real* account, which has been taken over. The current NL alert describes requests to pay a bill, advance money or buy a gift card "for a sick friend" [nl-fraudehelpdesk-takeover-alert-2026], [nl-politie-whatsapp-takeover-2024]. Saved-contact name and chat history look exactly right. (How accounts get taken over is in `messenger-account-takeover-code.md`.)
- **C. Cloned voice (variant):** when the victim suggests calling, scammers used to refuse; Fraudehelpdesk now warns they can imitate the person's voice with AI during a call [nl-fraudehelpdesk-hulpvraag-campaign]. Government and banking-sector pages describe AI-cloned voices of someone you know or of a child in an emergency call [nl-veiliginternetten-voice-cloning], [nl-veiligbankieren-voice-cloning-2023], [eu-esas-ai-scams-factsheet-nl], [eu-epc-threats-2025].
  - **Voice notes are NOT supported:** none of the sources opened this session mention a cloned *voice note/voice message* in a messenger chat. They describe *calls*. Use a cloned-voice **call** (e.g. a call from the new number) if the variant is used; do not build the scenario around a voice note unless new evidence is added.

**The money request:**
- Typical stories: stranded abroad and lost money, phone and papers; phone broken (e.g. in the washing machine) so online banking doesn't work; a bill that must be paid today [nl-politie-hulpvraagfraude-2025], [nl-fraudehelpdesk-takeover-alert-2026].
- Payment via a **payment-request link** or a bank transfer to an IBAN, often **someone else's account** ("pay my friend / the landlord directly") [nl-veiligbankieren-hulpvraag], [nl-veiliginternetten-hulpvraag]; gift cards in the hijacked-account variant [nl-fraudehelpdesk-takeover-alert-2026].
- **Second request:** if the first payment goes through, a second request often follows [nl-politie-hulpvraagfraude-2025].

**Levers:** love and duty ("Mum, I need you"); urgency ("today", "before the bank closes"); a plausible reason why they can't call (new phone not set up for calls, on a quiet train, "I couldn't hear you" after a call that drops at once) [nl-veiligbankieren-hulpvraag], [nl-veiliginternetten-hulpvraag]; a promise to pay back quickly [nl-fraudehelpdesk-hulpvraag-campaign]; and, in variant C, a familiar voice ("if you hear a familiar voice, you trust it faster") [nl-veiliginternetten-voice-cloning].

## 3. Red flags a normal person can spot
1. **A known person writes from an unknown number** and says the old one no longer works, even if the photo and tone look right [nl-fraudehelpdesk-hulpvraag-campaign], [nl-veiliginternetten-hulpvraag].
2. **A money request by message**, even from a saved contact's real account [nl-veiligbankieren-hulpvraag], [nl-fraudehelpdesk-takeover-alert-2026].
3. **Urgency**: it must be paid today or right now [nl-fraudehelpdesk-hulpvraag-campaign], [nl-veiligbankieren-hulpvraag].
4. **They avoid a normal call or video chat**, with an excuse, or a call drops at once followed by "I couldn't hear you" [nl-veiligbankieren-hulpvraag], [nl-veiliginternetten-hulpvraag].
5. **Pay someone else's account**, or a payment link, or gift cards, rather than the person's own account you already know [nl-veiliginternetten-hulpvraag], [nl-politie-hulpvraagfraude-2025], [nl-fraudehelpdesk-takeover-alert-2026].
   - In-game cue: the euro-area **payee-name check** (in NL the "IBAN-Name Check", required since Oct 2025) compares the name you type with the account holder's name before you confirm [eu-ec-ipr-vop-2025], [eu-ecb-ipr], [eu-eurlex-ipr-2024-886], [nl-betaalvereniging-iban-name-check].
     - **Outcomes:** match; close match, where the warning shows the account's name ("did you mean…?"); no match; or check not possible [eu-eurlex-ipr-2024-886], [eu-epc-vop-scheme], [nl-betaalvereniging-iban-name-check].
     - **No name on a no match (private accounts):** the warning says the name doesn't match but does **not** reveal the real holder's name, to protect privacy [nl-betaalvereniging-iban-name-check]. The regulation requires the name only for a close match [eu-eurlex-ipr-2024-886]. In-game, a no-match warning for a person's account must not show a name.
     - **Caveat for business accounts:** Belgian banks show a company's registered name on a no match too, for legal entities with a Belgian or Dutch account; trade names may differ from the registered name [be-febelfin-vop-faq]. Don't teach "a no match never shows a name" as a universal rule.
     - **You can still pay:** the warning doesn't stop the payment, and banks must tell you the refund and liability consequences of ignoring it [eu-eurlex-ipr-2024-886], [nl-betaalvereniging-iban-name-check].
     - A mismatch with your relative's name is a strong warning. But a **match** with "the friend's" or "landlord's" name proves only whose account it is, not that the story is true: the scheme "cannot be relied upon to identify a private or a legal person" [eu-epc-vop-scheme], and the check confirms only that name and account number correspond [be-febelfin-vop-faq].
     - **Payment-request links:** the payee check runs only when you type the account number and name yourself; it does not apply when you pay through a request where you don't enter them [be-febelfin-vop-faq] (BE source; no NL source on payment-request links found). So a request page shows a name, but no bank check stands behind it.
6. **A second request** after the first payment [nl-politie-hulpvraagfraude-2025].
7. **A familiar voice is not proof.** A voice can be imitated with AI, so a call that "sounds like them" doesn't settle it [nl-fraudehelpdesk-hulpvraag-campaign], [nl-veiliginternetten-voice-cloning].

*Not to teach as reliable tells:* spelling or tone (AI removes errors) [eu-esas-ai-scams-factsheet-nl]; audible "robotic" voice artefacts (see MAP ch6 note on [de-bsi-deepfakes]).

## 4. The verification habit
**"Before you pay, call the old number, the one already saved in your contacts, and talk to them. Can't reach them? Then don't pay. If you do talk on the new number, ask something only the real person would know."** ("Niet gebeld = geen geld": no call, no money.) [nl-fraudehelpdesk-hulpvraag-campaign], [nl-veiliginternetten-hulpvraag], [nl-politie-hulpvraagfraude-2025], [nl-veiligbankieren-hulpvraag]

- If they can't be reached, call **another close family member or friend** [nl-veiligbankieren-hulpvraag].
- Hijacked-account variant (B): the old number *is* the chat, so the habit is the same: **call** them (a real voice call to the saved contact, ideally after hanging up and redialling yourself), and ask your question [nl-fraudehelpdesk-hulpvraag-campaign], [nl-politie-whatsapp-takeover-2024]. Make it a normal phone call to their number, not a call inside the messenger: once the account is taken over, an in-app call reaches whoever controls the account (researcher inference from how account takeover works, not a quoted source).
- Cloned-voice variant (C): hang up and call back on the number you know; ask a personal question; use a family code word [nl-veiliginternetten-voice-cloning], [nl-fraudehelpdesk-hulpvraag-campaign], [eu-esas-ai-scams-factsheet-nl]. Note: a code word can be forgotten under stress, so the call-back is the core habit and the code word an extra [nl-veiligbankieren-voice-cloning-2023].
- **Prevention for debriefs:** agree with family how you'd really ask for help in an emergency (e.g. by phone, not by chat), and a code word or question for money requests [nl-fraudehelpdesk-hulpvraag-campaign]; turn on two-step verification on your messenger [nl-fraudehelpdesk-hulpvraag-campaign], [nl-fraudehelpdesk-takeover-alert-2026]; share fewer family details and photos publicly [nl-politie-hulpvraagfraude-2025].

## 5. Already caught? (generic + NL specifics verified 2026-11-19)
1. **Contact your bank immediately.** Ask them to try to stop or recall the payment; forward the message with the payment link or IBAN; give the IBAN, phone number and name used [nl-politie-hulpvraagfraude-2025], [nl-veiligbankieren-hulpvraag], [nl-betaalvereniging-after-whatsapp-fraud].
2. **Don't pay the second request**, and stop chatting [nl-politie-hulpvraagfraude-2025].
3. **Save evidence first:** export the chat, screenshot the profile, photo and number [nl-politie-aangifte-hulpvraagfraude].
4. **Report to the police.** NL: in many cases online via politie.nl (route for help-request fraud); if you report for someone else, or your own account was taken over and misused, contact the police instead; non-emergency line 0900-8844 [nl-politie-aangifte-hulpvraagfraude], [nl-veiligbankieren-meld-fraude]. Report even without a loss [nl-veiligbankieren-hulpvraag].
5. **Report to Fraudehelpdesk** (NL national fraud reporting point: 088 786 73 72 or the online form), which advises victims and warns others [nl-fraudehelpdesk-contact-en], [nl-rijksoverheid-fraudehelpdesk-contact], [nl-fraudehelpdesk-hulpvraag-campaign].
6. **Then** report the chat inside the messenger. The NL police say to do this last, because the chat disappears once reported [nl-politie-aangifte-hulpvraagfraude].
7. **Tell the real person** (via a call) that someone is using their name or account, so they can warn their contacts and recover the account [nl-politie-whatsapp-takeover-2024].
8. **Beware of follow-ups** offering to "get your money back" for a fee (cross-cutting; MAP corrections §4) [eu-esas-ai-scams-factsheet-nl].
9. NL extra (designer note, not for on-screen detail): after reporting, victims may, under conditions, ask their bank for the recipient's name and address (procedure for non-bank fraud, within 13 months) [nl-politie-hulpvraagfraude-2025], [nl-politie-aangifte-hulpvraagfraude].
- Tone line for the debrief: these messages are built to hit people who care, at any age. Asking for help early is the right move.

## 6. Variations by country / local hooks (game-facing: fictional/generic only)
- **NL hooks (generic wording for the game):**
  - a **payment-request link** sent in the chat ("just tap and pay"), the way friends commonly settle small amounts. Dutch sources name payment-request links as a typical channel [nl-veiligbankieren-hulpvraag], [nl-veiliginternetten-hulpvraag]. In-game: a fictional pay-link that opens a fictional bank page (Larchwick Bank or a new fictional brand), never a real app's look.
  - a **bank transfer to a "friend's" IBAN**, with a fictional payee-name-check result in the banking-app device [eu-ecb-ipr]. IBANs invalid by checksum (Red Line 3).
  - **gift-card codes** "for a sick friend" in the hijacked-account variant [nl-fraudehelpdesk-takeover-alert-2026].
  - an **SMS first** ("text me on Kettle, new number") as an opener [nl-fraudehelpdesk-hulpvraag-campaign].
  - excuse lines: phone fell in water, stuck abroad, quiet carriage [nl-politie-hulpvraagfraude-2025], [nl-veiligbankieren-hulpvraag].
- **Elsewhere:** Rome (ch6) reuses the "new number" message as a family-emergency vector and carries the main cloned-voice call [it-carabinieri-contro-truffe], [eu-esas-ai-scams-factsheet-nl]; Warsaw uses a hijacked friend asking for a payment code [pl-nask-metoda-na-2020].

## 7. Genuine-twin notes
- A real "new number" message happens: people do change numbers. The genuine twin is a new-number message with **no money request**, which the player can confirm by calling the old number (or the person rings to say so). The tell is never "new number" alone; it is **new number + money + no call**.
- A real family request for money can also be urgent. The genuine version survives the habit: the person picks up on the saved number and confirms.
- Per CONTENT_GUIDE: the **saved contact** detail may use "It fits" only on a genuine message from the saved number; the profile photo and display name are decoys (neutral wording on both). In variant B (hijacked account) the saved contact *does* fit, so the reveal must say it fits but isn't proof, and point to the request.

## 8. Game-design notes (non-binding)
- Lead scenario: variant A ("Hi Mum, new number") with a payment-request link and a second request. Optional hard variant: B from a saved contact (the "it really is their account" twist), or C as a call from the new number with a familiar voice, where the right move is still to hang up and call the saved number.
- Tone (Red Line 5): the person caught is a younger character or a parent, shown as capable; the lever is love and urgency, not gullibility (MAP ch6 tone note).
- No real messenger, payment-request app or bank names, colours or UI (Red Line 1). Phone numbers masked or from fiction ranges (Red Line 3).
- Don't show any loss figure on screen.

## 9. Sources (accessed 2026-11-19 unless marked)
nl-politie-hulpvraagfraude-2025 (2026-11-18, re-opened 2026-11-19) · nl-politie-aangifte-hulpvraagfraude · nl-fraudehelpdesk-hulpvraag-campaign · nl-fraudehelpdesk-takeover-alert-2026 · nl-fraudehelpdesk-fraudevormen · nl-fraudehelpdesk-contact-en · nl-rijksoverheid-fraudehelpdesk-contact · nl-veiligbankieren-hulpvraag · nl-veiligbankieren-meld-fraude · nl-veiligbankieren-voice-cloning-2023 · nl-veiliginternetten-hulpvraag · nl-veiliginternetten-voice-cloning · nl-betaalvereniging-after-whatsapp-fraud · nl-politie-whatsapp-takeover-2024 (2026-11-18) · nl-betaalvereniging-friend-in-need-2020 (2026-11-18) · nl-fraudehelpdesk-2025 (2026-11-18) · eu-esas-ai-scams-factsheet-nl (2026-11-18) · eu-epc-threats-2025 (2026-11-18) · eu-ec-ipr-vop-2025 (2026-11-18) · eu-ecb-ipr (2026-11-18) · eu-eurlex-ipr-2024-886 · eu-epc-vop-scheme · nl-betaalvereniging-iban-name-check · be-febelfin-vop-faq. Cross-chapter references (2026-11-18): it-carabinieri-contro-truffe, pl-nask-metoda-na-2020, de-bsi-deepfakes.

## 10. Confidence
- **High** for variants A and B, the red flags, the habit and the NL recovery/reporting steps: the police, Fraudehelpdesk, the banking association and the government awareness platform agree, with current (2025–26) pages.
- **Medium** for variant C (cloned voice): Fraudehelpdesk (updated Oct 2025) and veiliginternetten.nl say it is possible and happening; the only NL article on actual cases is from 2023 and cites losses abroad. No Dutch or EU prevalence figure.

**Unverified / caveats:**
- **Cloned voice notes** in a messenger chat: not found in any source this session (all describe calls).
- No current official NL figure for hulpvraagfraude reports or losses was found; the 2020 figure is historic. Don't put a number on screen.
- The "second request" is from the police form; Fraudehelpdesk's pages don't describe it separately.
- Fraudehelpdesk opening hours differ between its own page and the government contact guide: don't show hours.
- Whether minors can file the online police report themselves (it uses DigiD) was not verified. For a 14+ audience, the debrief should say "tell a parent or trusted adult, then the bank and police".
