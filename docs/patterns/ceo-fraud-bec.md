# Pattern brief: `ceo-fraud-bec`

**Chapter:** 3 (Paris) · **Status:** draft for review (phase 3, Paris step 1) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

> **Scope (Red Line 8).** In the game this pattern must hinge on a digital vector: an **email** (look-alike address or a genuine but hijacked mailbox), a **messenger** message, or a **call or video call with a cloned voice or face**. A plain phone call with no digital element is out of scope on its own; it may appear only as the follow-up "reassurance" call after the email.
>
> **Audience (14+).** This is mainly a workplace fraud. Play it through the "trust inspector" job premise: the player checks a request that reached a fictional small firm. For the consumer-facing twin (landlord, tradesperson, club fees), see `payment-detail-change.md`.

## 1. Name and aliases
- **English:** CEO fraud; business email compromise (BEC); fake transfer order; "the boss needs a confidential transfer today".
- **French:** *fraude au président*, *arnaque au Président*, *escroquerie aux faux ordres de virement* (**FOVI**; also *faux ordres de virement internationaux*) [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi].
- **Where it is prominent and why:**
  - **France:** the Gendarmerie calls it increasingly common and says it targets large firms, SMEs, craftspeople and **local authorities** [fr-gendarmerie-fovi]. The national assistance platform publishes a dedicated "fiche réflexe" with the Interior Ministry and ANSSI [fr-cybermalveillance-fiche-fovi]. The French domestic intelligence service (DGSI) reported a December 2025 attempt using a **deepfake video call** of a group's chief executive [fr-dgsi-flash-117-2025].
  - **EU-wide:** Europol and the European Banking Federation run a CEO/BEC leaflet in their #CyberScams campaign [eu-europol-ceo-bec-leaflet], [eu-ebf-cyberscams]. The European Payments Council reports "a particular increase in business email compromise" and lists CEO fraud among the scams that AI-made voice and video now support [eu-epc-threats-2025].
  - Why it works: authority (the boss), secrecy (you can't ask anyone), urgency (today, before the deadline), and the fraudster's good knowledge of the organisation [eu-europol-ceo-bec-leaflet].

## 2. Channel and psychological levers
**Channels (what the victim sees):**
- **Email from "the boss" or "the firm's lawyer"** asking for an urgent, unplanned and confidential transfer, often linked to a secret deal or acquisition [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi], [eu-europol-ceo-bec-leaflet].
  - The address may be a **near copy** of the real one [eu-europol-ceo-bec-leaflet], [fr-fbf-cles-faux-rib-2025];
  - or the message may come from the **real mailbox** of the person, because that mailbox was hijacked [fr-cybermalveillance-fiche-fovi]. Messages can even be inserted into an **existing email thread** [eu-esas-ai-scams-factsheet-nl]. *(Victim's view only: how mailboxes are taken over is not described here or in the game.)*
- **Phone follow-up:** a second call from "another executive" or "the lawyer" reassures the employee, who then pays [fr-gendarmerie-fovi].
- **Deepfake call or video call** in which the face and voice match the executive's [fr-dgsi-flash-117-2025], [eu-epc-threats-2025], [de-bsi-deepfakes].
- **Pretext variant:** the firm "must pay now" to comply with accessibility rules or the GDPR [fr-gendarmerie-fovi].
- **Payee:** the receiving account is often abroad [fr-cybermalveillance-fiche-fovi], [eu-europol-ceo-bec-leaflet].

**Timing:** evenings, holidays, or the middle of a long weekend (*pont*), when the accounts team is short-staffed [fr-gendarmerie-fovi].

**Levers:**
- Authority and hierarchy: "a senior official you don't normally deal with" contacts you directly [eu-europol-ceo-bec-leaflet].
- Secrecy: "absolute confidentiality", so you can't check with anyone [eu-europol-ceo-bec-leaflet], [fr-cybermalveillance-fiche-fovi].
- Urgency, pressure, even threats; or flattery and promised reward ("I trust only you with this") [eu-europol-ceo-bec-leaflet], [fr-cybermalveillance-fiche-fovi].
- Social proof: a second person "confirms" it [fr-gendarmerie-fovi].

## 3. Red flags a normal person can spot
1. **An unplanned transfer request**, out of the normal flow of invoices [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi].
2. **"Keep this confidential, don't tell anyone"**: a request for secrecy about a payment [eu-europol-ceo-bec-leaflet], [fr-gendarmerie-fovi].
3. **Pressure to skip the usual approval steps** ("no time for the normal sign-off") [eu-europol-ceo-bec-leaflet], [fr-cybermalveillance-fiche-fovi].
4. **A senior person who doesn't normally contact you** writing or calling you directly [eu-europol-ceo-bec-leaflet].
5. **The sender's address differs**, even by one character, from the address you know. *Caveat:* a message from the **real** address can still be fake if that mailbox was hijacked, so a correct address is not proof [eu-europol-ceo-bec-leaflet], [fr-cybermalveillance-fiche-fovi].
6. **New or unfamiliar bank details**, often in another country [fr-cybermalveillance-fiche-fovi], [eu-europol-ceo-bec-leaflet]. A domestic account doesn't prove anything either.
7. **Unusual timing:** late evening, holidays, a long weekend [fr-gendarmerie-fovi].
8. **A "reassurance" call or message from a second person** right after the request [fr-gendarmerie-fovi].
9. **Flattery, a promised reward, or threats** [eu-europol-ceo-bec-leaflet].

**Not reliable tells (don't teach them as proof):**
- **Spelling and polish.** AI removes errors [eu-esas-ai-scams-factsheet-nl].
- **A familiar face or voice on a call.** In the DGSI case both matched the executive [fr-dgsi-flash-117-2025]. BSI lists audible artefacts in fake voices, but its page dates from 2022 and quality keeps improving [de-bsi-deepfakes]. The lesson is the request, not the voice.

## 4. The verification habit
**"Never pay because a message or call says so. Check the request with the person on a number or channel you already have (your company directory, not the email's signature), then follow the fixed two-person sign-off, however urgent or secret it sounds."**
- France: a known internal procedure with hierarchical verification and validation that is "non dérogeable" (cannot be skipped) [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi].
- EU: follow payment procedures in full and don't give in to pressure; if unsure, consult a competent colleague [eu-europol-ceo-bec-leaflet].
- Call back on a number you already hold, not one given in the message [fr-fbf-cles-faux-rib-2025], [fr-cybermalveillance-fiche-faux-rib], [eu-europol-phishing-leaflet].
- The DGSI case shows the habit working: the manager found the request unusual, **ended the call and alerted management through the usual channels** [fr-dgsi-flash-117-2025].
- *Note:* the sources describe "verify and validate" rather than literally "dual approval". "Two-person sign-off" is the game's plain-language version of the Gendarmerie's "validation hiérarchique interne".

## 5. Already caught? (generic + France, verified 2026-11-19)
1. **Call your bank at once** and ask it to block or **recall** the transfer for fraud. Speed matters a lot [fr-gendarmerie-fovi], [fr-cybermalveillance-fiche-fovi], [fr-bdf-fraude-moyens-paiement].
2. **Stop anything still pending** and tell management and accounts. Block the fraudulent bank details in your systems [fr-cybermalveillance-fiche-fovi].
3. **Keep evidence:** emails, numbers, transfer orders, invoices [fr-cybermalveillance-fiche-fovi], [fr-gendarmerie-fovi].
4. **If a mailbox may have been hijacked, change its password** (and turn on two-factor authentication) [fr-cybermalveillance-fiche-fovi].
5. **Report** (France):
   - **File a complaint** quickly with the police or gendarmerie, in parallel with the bank. The bank may ask for it [fr-cybermalveillance-fiche-fovi], [fr-gendarmerie-fovi].
   - **17Cyber** (17cyber.gouv.fr): online diagnosis 24/7 and, for serious cases, a chat with a police officer or gendarme [fr-cybermalveillance-17cyber-2024].
   - **THESEE** online complaint covers a money request received from a contact's **hijacked** mailbox. Adults only, via FranceConnect; minors can only file a report (*signalement*) [fr-justice-thesee-messagerie-2025].
   - The Gendarmerie's **brigade numérique** answers questions 24/7 [fr-gendarmerie-fovi].
   - **Info Escroqueries 0 805 805 817** (free) for advice [fr-cybermalveillance-fiche-faux-rib], [fr-cybermalveillance-fiche-hameconnage].
   - Europol advises reporting attempts to the police **even if no money was lost** [eu-europol-ceo-bec-leaflet].
6. **Beware of "recovery" offers** afterwards [eu-esas-ai-scams-factsheet-nl].
7. **Not blamed:** "this could happen to anyone" (Red Line 5). The DGSI case shows that even a convincing face and voice can be fake.

## 6. Variations by country / local hooks
- **FR:**
  - fake **president** or fake **lawyer**, with a second "executive" call [fr-gendarmerie-fovi];
  - fake **supplier RIB change** and fake **employee salary-account change** [fr-cybermalveillance-fiche-fovi] (see `payment-detail-change.md`);
  - "pay now to comply with accessibility / GDPR rules" [fr-gendarmerie-fovi];
  - timing around a *pont* or holidays [fr-gendarmerie-fovi];
  - **local authorities** (*mairies*) are named targets [fr-gendarmerie-fovi];
  - deepfake **video call** of the chief executive about an "acquisition" [fr-dgsi-flash-117-2025].
- **EU:** CEO/BEC in the Europol–EBF campaign [eu-europol-ceo-bec-leaflet], [eu-ebf-cyberscams]; AI voice and video "impersonating well-known persons (e.g. CEO fraud)" [eu-epc-threats-2025]. Swedish police reported CEO/BEC proceeds for 2025, which shows the pattern is not only French (designer context; see MAP ch 3) [se-polisen-proceeds-2026].
- **DE:** BSI cites fake voices in CEO-fraud calls [de-bsi-deepfakes].

## 7. Genuine-twin notes (what a real version looks like)
- A **real urgent payment** from management still goes through the normal sign-off; nobody asks you to skip it or to keep it from the person who co-signs.
- A real executive **doesn't mind a call back** on the directory number. "I'm in a meeting, don't call" is a pressure tactic, not proof of fraud on its own, so it should appear in some genuine twins too ("busy, but call my assistant on the usual line").
- **Design rule:** the fake must not be told apart by tone, urgency or a slightly odd address alone. At least one fake should come from the **real** (hijacked) mailbox of a fictional colleague, so the only safe move is the callback plus the procedure.

## 8. Game-design notes (non-binding)
- Use only fictional firms, people and banks from `content/brands.yaml`. No real company, logo, domain, IBAN or real executive's likeness (Red Lines 1 and 3). Deepfake scenes are text transcripts or stylised video frames of a **fictional** person; never generate or imitate a real person's face or voice.
- A good decision point: the transfer screen in the fictional banking device, with the "trust inspector" choosing *Pay / Call back on the directory number / Escalate to the second approver / Report*.
- The deepfake variant fits as a **later** beat (boss level). Teach "end the call, alert through the usual channel" [fr-dgsi-flash-117-2025], not "spot the glitch".
- Debrief safe action: "Call the person on the number in your directory and follow the two-person sign-off." If already paid: "Bank first, right now; then complain (police/gendarmerie, 17Cyber)."
- Don't show how a mailbox is hijacked or how a voice is cloned (Red Lines 2 and 4).

## 9. Sources (accessed 2026-11-19 unless marked)
fr-gendarmerie-fovi (re-opened 2026-11-19) · fr-cybermalveillance-fiche-fovi · fr-cybermalveillance-fiche-faux-rib · fr-cybermalveillance-17cyber-2024 · fr-justice-thesee-messagerie-2025 · fr-bdf-fraude-moyens-paiement · fr-fbf-cles-faux-rib-2025 · fr-dgsi-flash-117-2025 · eu-europol-ceo-bec-leaflet · eu-epc-threats-2025 (re-read 2026-11-19) · eu-ebf-cyberscams (2026-11-18) · eu-europol-phishing-leaflet (2026-11-18) · eu-esas-ai-scams-factsheet-nl (2026-11-18) · de-bsi-deepfakes (2026-11-18) · fr-cybermalveillance-fiche-hameconnage (2026-11-18) · se-polisen-proceeds-2026 (2026-11-18)

## 10. Confidence
- **High** for the email pattern, red flags, habit and recovery steps: the Gendarmerie, Cybermalveillance.gouv.fr (with the Interior Ministry and ANSSI), Europol–EBF and the EPC agree.
- **Medium** for the deepfake voice/video variant. Official sources confirm it exists:
  - one French case (DGSI, video call) [fr-dgsi-flash-117-2025];
  - the EPC at EU level [eu-epc-threats-2025];
  - BSI, 2022 [de-bsi-deepfakes].

  No prevalence figure was found, so don't say on screen that it is "common".

**Unverified / caveats:**
- No French official figure for FOVI losses was found this session. Don't put a number on screen.
- The Gendarmerie page dates from January 2023 and the FOVI fiche from 2023 (V230417). Advice is stable, but they are not new.
- "Two-person sign-off" and "call back on the directory number" are the game's plain-language wording. The French sources say "procédure de vérification et de validation hiérarchique interne non dérogeable" and "règles d'authentification des émetteurs"; the callback on a known number is stated explicitly in the bank-detail sources [fr-cybermalveillance-fiche-faux-rib], [fr-fbf-cles-faux-rib-2025], [fr-bdf-fraude-moyens-paiement].
- THESEE covers a money request from a **hijacked** contact mailbox. A look-alike address isn't covered there by name, so the game should point to police/gendarmerie or 17Cyber as the general route.
- 17Cyber is described from its launch press release (Dec 2024). The live 17cyber.gouv.fr site was not opened this session.
- Info Escroqueries 0 805 805 817 was confirmed on Cybermalveillance fiche V240201 (opened today) and on the 2026 phishing fiche (opened 2026-11-18). Opening hours shown on a 2020 Service-Public page were not re-verified, so don't display hours.
