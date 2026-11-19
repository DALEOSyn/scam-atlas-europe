# Pattern brief: `spoofed-authority-call`

**Chapter:** 6 Rome (GDD §18: "police" or Larchwick Bank calls with a spoofed caller ID; Teo's fake "police" call) · **Status:** draft for review (T-3.8r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

Related briefs:
- `multichannel-support-callback.md` (ch0–1): a text or email that gives a number to call.
- `cloned-voice-family-emergency.md` (Rome): the relative variant.
- The Madrid brief `bank-safe-account-call.md` (on branch phase3/madrid-warsaw-research, not yet on main) covers the bank "safe account" call in depth.

This brief covers the **authority-first** call. Someone claiming to be police, the Carabinieri or the bank's security team calls, often with an official-looking number on the screen, and pushes you to act at once.

## 1. Name and aliases
- **English:** fake police call; spoofed bank call; "bank security department" call; vishing with caller-ID spoofing.
- **Local names (IT):**
  - *finti operatori* (fake bank operators) [it-bdi-educazione-cyber];
  - *finti agenti di Polizia* / fake Carabinieri [it-open-roma-finti-poliziotti-2026] (news), [it-carabinieri-contro-truffe];
  - *spoofing* is used as-is in Italian official texts [it-mur-smishing-vishing], [it-agcom-antispoofing-2025].
- **Game labels:** "Larchwick Bank security" and a generic "Police" caller. Real Italian forces, numbers or badges never appear as props (Red Line 1). Numbers are masked or from fiction ranges (Red Line 3).
- **Why Italy is the stage:**
  - The Carabinieri warn about fake Carabinieri, lawyers or doctors calling about a relative's accident or arrest, and about numbers that look like bank helplines [it-carabinieri-contro-truffe].
  - A December 2025 Carabinieri operation (21 arrests) describes callers who keep the line open so the victim can't check [it-carabinieri-21-arresti-2025].
  - The telecom regulator ordered carriers to block calls from abroad that show Italian numbers: fixed lines from 19 Aug 2025, mobiles from 19 Nov 2025. It says spoofing comes "in larga parte" from abroad, and that spoofing inside Italy is still possible [it-agcom-antispoofing-2025].
  - A ministry brochure warns that numbers can be falsified ("spoofing") and that attackers pose as "a bank, an authority" [it-mur-smishing-vishing].
  - Fake-police calls were reported in Rome in May 2026 [it-open-roma-finti-poliziotti-2026] (news, supporting only).
- **Why it works:** fear of the police or of losing your savings; a number on the screen that looks official; a calm, professional voice; constant pressure that leaves no time to check.

## 2. Channel and psychological levers
**Channel:** a phone call. The caller ID shows an official-looking or real institutional number [it-mur-smishing-vishing], [eu-esas-ai-scams-factsheet-it]. Sometimes a text or chat message comes first and gives a number to call [se-polisen-campaign-2026], [eu-epc-threats-2025].

**What the victim sees and hears:**
1. A call from "the police" or "the bank's security team". The number looks right [it-carabinieri-contro-truffe], [pl-cert-fake-consultants].
2. A problem that needs action now: a relative in trouble, your car or account linked to a crime, or a suspicious payment [it-carabinieri-contro-truffe], [it-open-roma-finti-poliziotti-2026] (news).
3. Pressure to stay on the line and not to tell anyone or check [it-carabinieri-21-arresti-2025].
4. **The digital ask** (where Rome scenarios stop):
   - move money to a "safe" or "checked" account;
   - read out a code or approve a request in your banking app;
   - give your card or login details;
   - install an app.

   Sources: [eu-epc-threats-2025], [pl-cert-fake-consultants], [de-vzhh-fake-bank-calls-2025], [it-bdi-educazione-cyber].

**Out of scope (Red Line 8):** the in-person pick-up of cash, gold or valuables that ends many Italian cases [it-carabinieri-21-arresti-2025], [it-open-roma-finti-poliziotti-2026]. Scenes end at the call or the transfer.

**Levers:** authority; fear (for a relative, or of being "involved"); urgency; isolation ("stay on the line"); a familiar or official-looking number.

## 3. Red flags a normal person can spot
1. **A number on your screen proves nothing.** It can be faked, even when it shows a real police or bank number [it-mur-smishing-vishing], [eu-esas-ai-scams-factsheet-it], [pl-cert-fake-consultants].
   - Wording to use: "Since 2025, phone companies must block calls from abroad that show an Italian number. Even so, a number on your screen proves nothing." [it-agcom-antispoofing-2025]. Spoofing from inside Italy is still possible. State the rule only, never its effect, and don't teach "a local number is safe".
2. **Police never ask you for money**, and never ask you to move it or hand it over [it-carabinieri-contro-truffe].
3. **Your bank never asks you to move money to keep it safe, or to read out a code or password on the phone** [eu-epc-threats-2025], [de-vzhh-fake-bank-calls-2025], [pl-cert-fake-consultants].
4. **They want you to stay on the line** and not hang up to check [it-carabinieri-21-arresti-2025].
5. **Pressure to act now**, often with a frightening story about a relative or a crime [it-carabinieri-contro-truffe], [eu-esas-ai-scams-factsheet-it].
6. **They ask you to install an app or approve something you didn't start** [pl-cert-fake-consultants], [se-polisen-campaign-2026].

*Not to teach as reliable tells:* a foreign accent, background noise or poor grammar. Professional callers sound credible. The ESAs note that AI removes errors in messages [eu-esas-ai-scams-factsheet-nl].

## 4. The verification habit
**"Hang up. Then call the police on 112 or the bank on the number on your card or in its app: a number you looked up yourself, never one the caller gave or the one on your screen."** [it-carabinieri-contro-truffe], [it-mur-smishing-vishing], [eu-esas-ai-scams-factsheet-it]

- If a relative is "in trouble", call the relative on their saved number [it-carabinieri-contro-truffe].
- Teo's version for the debrief: "The number on the screen is the caller's choice; the number I dial is mine."
- Prevention: agree with family how you would really ask for help, and a code word for money requests [eu-esas-ai-scams-factsheet-it] (see `cloned-voice-family-emergency.md`).

## 5. Already caught? (generic + Italy where verified 2026-11-19)
1. **Call your bank now**, through its official channels (the number on your card or in the app). Tell it at once so it can act [it-bdi-truffe-cyber], [eu-esas-ai-scams-factsheet-it]. Generic advice (not from these sources): ask it to try to stop or recall the payment and to block the card or app access.
2. **Typed a password or approved something?** Change the password from the real app and log out other devices [pl-cert-fake-consultants], [fr-cybermalveillance-fiche-hameconnage].
3. **Keep evidence:** the call log with times, the number shown, and any texts.
4. **Report to the police.** In Italy the Banca d'Italia sends victims to the Polizia Postale e delle comunicazioni (its offices or online channels) [it-bdi-truffe-cyber].
5. **If the bank says no:** in Italy, a written complaint (*reclamo*) to the bank first. Then the Banca d'Italia, or the Arbitro Bancario Finanziario (an out-of-court scheme that needs the complaint first) [it-bdi-truffe-cyber].
6. **Refunds:** whether an Italian bank must refund a payment you authorised under deception was **not checked**. Say "ask your bank straight away"; never "you'll get it back".
7. **Under 18:** tell a parent or trusted adult first; they call the bank with you (help-screen safeguarding step).

## 6. Variations by country
- **IT:** fake Carabinieri, police or lawyers calling about a relative; fake bank operators; numbers that look like bank helplines [it-carabinieri-contro-truffe], [it-bdi-educazione-cyber]. Since 2025, phone companies must block calls from abroad that show an Italian number; spoofing from inside Italy is still possible [it-agcom-antispoofing-2025].
- **SE:** vishing often starts with an SMS that gives a number to call. Police never collect cards or valuables, and you should never log in with your e-ID for a caller [se-polisen-campaign-2026].
- **PL:** "fake consultants" spoof caller ID and names, ask for "safe account" transfers or remote-access apps [pl-cert-fake-consultants].
- **DE:** callers claim a push-TAN "stops" a debit; it authorises it [de-vzhh-fake-bank-calls-2025].
- **EU:** spoofed numbers, "safe account" scams, and callers telling victims to ignore bank alerts [eu-epc-threats-2025].

## 7. Genuine-twin notes
- A real bank fraud team may call, but it is fine with you hanging up and calling back on the card's number. It never asks you to move money, read out codes or install apps (contrast with §3).
- A real police contact about a relative also survives the habit: you hang up, call 112 or the relative, and the story checks out.
- **Design rule (CONTENT_GUIDE caller-ID decoy):** the number on the call screen is a neutral decoy. The reveal says it "can't prove anything either way", never "it fits".

## 8. Game-design notes (non-binding)
- **Teo's call:**
  - The screen shows a masked, official-looking number, and the caller says it is the police.
  - Teo hangs up, looks up the number himself and calls back. He coaches the player through the same moves.
  - Show the tell as the **ask** (money, codes, an app), not the voice.
- **Scope:** keep the scene within the call and any transfer in the Larchwick app. No courier at the door, no cash, no jewellery (Red Line 8).
- **Tone (Red Line 5):** older characters are capable. Teo spots the scam and teaches; nobody is "silly".
- **Boss option:** a text with a number to call, then a "bank security" call asking for a transfer to a "verification account", ending in a Larchwick payee check. This reuses the Madrid structure, so check the overlap with Madrid before using it.

## 9. Sources (accessed 2026-11-19 unless noted)
it-mur-smishing-vishing · it-agcom-antispoofing-2025 · it-bdi-truffe-cyber · it-bdi-educazione-cyber · eu-esas-ai-scams-factsheet-it · it-open-roma-finti-poliziotti-2026 (news, supporting) · accessed 2026-11-18: it-carabinieri-contro-truffe · it-carabinieri-21-arresti-2025 · eu-epc-threats-2025 · eu-esas-ai-scams-factsheet-nl · pl-cert-fake-consultants · se-polisen-campaign-2026 · fr-cybermalveillance-fiche-hameconnage · accessed 2026-11-19: de-vzhh-fake-bank-calls-2025

## 10. Confidence
**High** for the call script, the red flags and the habit: the Carabinieri, a ministry, the regulator, the central bank and EU sources agree. **Medium** for Italy-specific detail on spoofed police numbers. The official Italian sources say numbers can be faked and look like bank helplines, but none shows a spoofed *police* number specifically.

**Unverified / caveats:**
- The Polizia di Stato and Polizia Postale sites refused automated access this session (an "access denied" page). No police page was read directly. The Polizia Postale route comes from the Banca d'Italia page.
- No Italian prevalence figure for spoofed calls. The regulator's measure shows the problem exists, not how often it happens. Put no number on screen.
- Italian refund rules for deceived-but-authorised payments were not checked.
- The AI voice in the May 2026 Rome case is a news-agency claim, not an official statement.
