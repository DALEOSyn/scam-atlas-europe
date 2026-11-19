# Chapter 6 (Rome): sources per likely beat

Companion to GDD §18 (Rome summary) until the full chapter spec exists.
- **Owner:** fraud-researcher (T-3.8r, 2026-11-19).
- **Ids:** all defined in `content/sources.yaml`.
- **Briefs:** `spoofed-authority-call.md` and `cloned-voice-family-emergency.md`. The latter builds on `messenger-family-impersonation.md`.

**Why this file exists.** Several ids name real bodies. The docs brand test rejects those outside `docs/patterns/`, so the GDD should cite no source ids inline and point here, as for Paris.

**Rules for writers:**
- Real bodies appear only on the Italy help card: Carabinieri, Polizia di Stato / Polizia Postale, Banca d'Italia, the regulator, the ministry and the helplines.
- In scenarios:
  - the bank is Larchwick, the messenger Kettle, and the police caller is a generic "Police";
  - numbers are masked or from fiction ranges (Red Lines 1, 3);
  - no in-person pick-ups (Red Line 8);
  - no synthetic audio.
- Never promise a refund. Put no prevalence figure on screen.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Teo's fake "police" call | Call screen with an official-looking masked number; "your grandson / your car is involved"; pressure to stay on the line; ask to move money or give codes | it-carabinieri-contro-truffe, it-carabinieri-21-arresti-2025, it-mur-smishing-vishing, eu-esas-ai-scams-factsheet-it, it-open-roma-finti-poliziotti-2026 (news, supporting) | The tell is the ask (money, codes) and "stay on the line". The caller ID is a neutral decoy. Ends at the call (no doorstep). |
| Habit beat: Teo hangs up and calls back on a number he looks up | Teo dials 112 / the number on the card himself | it-carabinieri-contro-truffe, it-mur-smishing-vishing | "The number on the screen is the caller's choice; the number I dial is mine." |
| Larchwick "security" call with the bank's number on screen | Bank name or number on the call screen; "move your savings to a verification account" or "read me the code" | it-mur-smishing-vishing, it-bdi-educazione-cyber, eu-epc-threats-2025, pl-cert-fake-consultants, de-vzhh-fake-bank-calls-2025, se-polisen-campaign-2026 | Overlaps Madrid: keep the Rome version short or use it as the boss. |
| Boss beat 1: "Police" say not to call your bank because staff there are involved (GDD §26.6) | Isolation claim on a call | de-polizei-berlin-falsche-polizei-2025, eu-epc-threats-2025, it-carabinieri-21-arresti-2025 | Sourced as a known claim (DE police: a "mole" in the bank; EPC: told to ignore bank alerts). It is not Italy-specific, so no debrief says it is. Added 2026-11-19 (Rome spec fact-check). |
| 6-7 / boss beat 1: "Approve this in your bank app" or "read me the code" to "freeze" something | Bank-app prompt or code text under a caller's guidance | de-vzhh-fake-bank-calls-2025, eu-epc-threats-2025, pl-cert-fake-consultants, se-polisen-campaign-2026 | Sources describe approving a request or giving a code that the caller says "stops" something, when it authorises it. The "new device sign-in" prompt is a generic design analogue, not a quoted real prompt. |
| Optional context line (debrief layer 2) | "Since 2025, phone companies must block calls from abroad that show an Italian number. Even so, a number on your screen proves nothing." | it-agcom-antispoofing-2025 | This wording or weaker. State the rule, never its effect. |
| Davide: sister's "new number" with a voice clip, then a money request | Kettle chat from an unknown number; an audio clip (illustration + transcript); urgent transfer to another account | eu-esas-ai-scams-factsheet-it, nl-veiliginternetten-voice-cloning, nl-fraudehelpdesk-hulpvraag-campaign, nl-veiliginternetten-hulpvraag, it-mur-smishing-vishing | **Voice note is Low–Medium:** fake *audio* is sourced, a voice note in a chat specifically is not (brief §2 ruling). The tell: new number + money + no call. A call variant is the safer alternative. |
| Larchwick payee check on Davide's transfer | "Doesn't match" against the sister's name (or a stranger's name on a match) | eu-ec-ipr-vop-2025, eu-ecb-ipr | Italy is in the euro area, so the check applies. A match proves only whose account it is (P3). |
| Davide's fall → damage control (Bruna + player) | Bank first, then the sister on her saved number, keep the chat, report | it-bdi-truffe-cyber, eu-esas-ai-scams-factsheet-it, nl-politie-hulpvraagfraude-2025, nl-politie-aangifte-hulpvraagfraude | Harmful: "pay the second request", "reply to the new number to ask for it back", "keep quiet". |
| Family code word with Teo | Agreeing a word for money requests by call or audio | eu-esas-ai-scams-factsheet-it, nl-fraudehelpdesk-hulpvraag-campaign, nl-veiligbankieren-voice-cloning-2023 | The code word is the extra; the saved-number call is the core (a code word can be forgotten under stress). |
| Genuine twins | A real bank call that's happy for you to hang up and call back; a real message from the sister's saved number with no money ask | messenger-family-impersonation §7, spoofed-authority-call §7 | |

## Italy help card (draft wording; real bodies only here and on the help screen)
1. **Call your bank now** through its official channels (number on your card or in the app), so it can act at once. (it-bdi-truffe-cyber) "Ask it to try to stop the payment and block access" is generic advice, not from this source.
2. **Report to the Polizia Postale e delle comunicazioni** (its offices or online channels). (it-bdi-truffe-cyber)
   - The police site refused automated access this session, so the online form itself was not opened.
3. **Someone claiming to be police, or a relative "in trouble", is pressing you right now? Call 112.** (it-carabinieri-contro-truffe)
4. **If the bank refuses:** a written complaint (*reclamo*) to the bank first; then the Banca d'Italia or the Arbitro Bancario Finanziario. (it-bdi-truffe-cyber)
5. **Need to talk?** Telefono Amico Italia 02 2327 2327: "Someone to talk to when you're feeling low or shaken." Label: "Every day, 24 hours. Normal call cost." (it-telefonoamico-home, operator's site). WhatsApp 324 011 72 52, 18:00–21:00, is also on that site but is not shown on the card. **Under 18 and in distress or danger:** 114 Emergenza Infanzia, free, 24 hours (it-minori-114-2024).
