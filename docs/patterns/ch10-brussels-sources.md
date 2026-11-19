# Chapter 10 (Brussels finale): sources per likely beat

Companion to GDD §18 (Brussels summary), §28.5 and §29.5 (hand-overs) until the full chapter spec exists.
- **Owner:** fraud-researcher (T-3.12r, 2026-11-19).
- **Ids:** all defined in `content/sources.yaml`.
- **Briefs:**
  - `remote-access-support-call.md` (boss);
  - `money-mule-recruitment.md` (Noor);
  - `recovery-scam.md` (ending C);
  - `investment-ad-fake-platform.md` (the arc's investment turn);
  - `spoofed-authority-call.md` (the "Card Stop calls you" decoy).

**Why this file exists:** as for Paris. Ids that name real bodies stay in `docs/patterns/`; the GDD points here.

**Rules for writers:**
- Use the existing fictional names:
  - Kindhand is the helper app;
  - Larchwick is the bank;
  - Kettle is the messenger;
  - Backhaven Recovery (or a new registered name) is the recovery agency.
- The fictional "card-blocking line" in a scam call needs its own fictional name. Never use Card Stop's real name or number in a scene (RL1). Card Stop appears on the help screen only.
- **Show only the victim's screens:**
  - the pop-up, the call, the install request, the dark screen after the cut;
  - Noor's DM;
  - the recovery email.
- **Never show:**
  - how a remote session is set up, or what the app can do beyond "they could see and do what you can" (RL2, RL4);
  - how mule money is moved.
- Domains are `.example` only; phone numbers are masked (RL3).
- Never promise a refund: "it may be able to help". No amounts lost on screen (GDD §28.5 item 8).
- Survey percentages are designer context only.

## Likely beats
| Beat (likely) | What the player sees | Sources | Notes |
|---|---|---|---|
| Pop-up "virus found, call support" | A full-screen warning in the browser with a masked number and a countdown | be-police-microsoft-scam-2024, be-ccb-remote-access-2019, ch-ncsc-fake-support-2024 | Tell: a number inside a warning. Safe action: close it, don't call. The CCB source is from 2019 and supports the screen-lock detail only. |
| "Bank" or "card-blocking line" call asks you to install Kindhand to "secure" the account | Call screen, then a store-style Kindhand page (visibly a game screen) | be-febelfin-vishing-2026, be-febelfin-helpdesk-fraud, eu-esas-ai-scams-factsheet-nl | Tells: "a genuine bank employee never asks you to install remote-access software", and "Card Stop never contacts customers first" (debrief may say "the real card-blocking line never calls you first"). A Belgian-looking number proves nothing. |
| "Log in to Larchwick so I can check" / "approve this" while on the line | The bank app or approval prompt over the call bar | be-febelfin-vishing-2026, se-konsumentverket-investment-fraud | "Never share codes or passwords"; "do not approve any transaction under pressure following an unexpected call". Links to the ch 9 e-ID habit. |
| "Switch off your phone so we aren't interrupted" | Caller line on the call screen | be-ccb-remote-access-2019, eu-epc-threats-2025 | Tell: cutting you off from your bank's alerts. The CCB source is older; EPC (2025) supports "ignore bank alerts". |
| Narrative cut after access (if the player goes along) | "Your screen goes dark…", then damage control | be-ccb-remote-access-2019, be-police-microsoft-scam-2024 | Narrative only (GDD §29.5). No amount. |
| Remote-access damage control | Steps: go offline → call the bank / card line now → change passwords → uninstall and get the device checked → police | be-febelfin-helpdesk-fraud, be-febelfin-fraudstop-2026, be-police-microsoft-scam-2024, be-police-plainte-arnaque-en-ligne | Harmful steps: `let_caller_finish` (be-febelfin-helpdesk-fraud); paying to "unlock" (be-ccb-remote-access-2019); calling the pop-up number. |
| Noor's easy-money DM | Kettle or social DM: easy money for "a few transfers" with her banking-app login, card details or account access | eu-europol-mule-flyer-be-fr, be-febelfin-money-mules, be-febelfin-games-campaign-2025, be-police-money-mules-2020 | "Banking-app login" is the game's translation (card + PIN and "login details or codes" are what the sources say). Player is a helper, Noor is a target. |
| Noor already said yes | Noor: "I already sent it…" | eu-europol-mule-flyer-be-fr, be-febelfin-money-mules, be-febelfin-games-campaign-2025, be-febelfin-fraudstop-2026 | Stop; trusted adult; bank now; change login; police; report the account; warn friends. Consequences once, calmly. Don't say "you won't be in trouble" (no source; see the mule brief §7). |
| Alex reveal: the same portrait on profiles with other names | A photo check showing the same illustrated portrait on 2–3 profiles with different names | be-police-romance-2026 | Sourced: the Belgian police advise a reverse image search on profile photos. Showing the *same* photo under other names is the game's visualisation of that check's result. "Beware AI" also from that page: a clean check doesn't prove a profile is real, so the debrief should say so. |
| Arc wrap-up: dating to investment | Red-flag timeline (slots 1–9) | eu-esas-ai-scams-factsheet-nl, be-police-romance-2026, be-fsma-trading-platforms-2025 | Dating-to-investment pipeline (ESAs). Romance red flags (BE police). |
| Ending C: recovery-agency test (Backhaven, fee first) | Email or call offering to get the money back; the fee comes first | be-fsma-recovery-room, be-fsma-trading-platforms-2025, recovery-scam brief sources (ie-bpfi-recovery-2024, ie-cbi-fraud-landscape-2025, se-konsumentverket-investment-fraud) | BE FSMA: recovery firms "always ask for a fee" first; they may "falsely claim to work with the police or with financial supervisors"; supervisors never contact victims for this. Debrief: the Dublin line "Anyone who contacts you offering to get your money back for a fee is almost certainly running a second scam." Sourced. |
| Ending C damage control | Dublin's steps (stop paying, call the bank on a known number, keep evidence, report to the regulator) | be-fsma-trading-platforms-2025, be-fsma-warnings-list, be-police-plainte-arnaque-en-ligne | FSMA (2025): stop transactions, cut contact, tell your bank at once, keep records, report to the FSMA and the police. "It may be able to help", never "will". |
| A / A′ Teo scene: a similar friendly profile approaches Teo | Teo forwards a chat; you guide him | be-police-romance-2026, eu-esas-ai-scams-factsheet-nl | Same red flags as the arc. Don't name Glimmerfund before Teo asks (GDD §28.5 item 4). |
| Report mechanic (forward a suspicious message) | "Report" action on a message | be-ccb-safeonweb-2025 | Modelled generically in game; the real address appears only on the help screen. |

## Belgium help card (draft wording; real bodies only here and on the help screen)
1. **Block your cards and banking app now:**
   - Card Stop / Fraudstop on **078 170 170**, day and night.
   - Or your bank's fraud line, using the number on your card or in your bank's app.
   - "Call costs may apply." (be-febelfin-fraudstop-2026, be-febelfin-vishing-2026)
2. **Report to the police.**
   - Go to a local police station, where first steps can be taken quickly.
   - With a Belgian identity card you can also use Police on Web for some non-urgent facts.
   - Bring screenshots, the numbers used and a short timeline. (be-police-plainte-arnaque-en-ligne)
   - For under-18s: "Go with a parent or a trusted adult." This is safeguarding framing, not from the source.
3. **Forward suspicious messages** to suspicious@safeonweb.be. (be-ccb-safeonweb-2025; help-list row be-safeonweb-forward)
4. **Investment offer, or someone offering to get your money back?**
   - Check the FSMA warnings list. It isn't complete, so a firm missing from it isn't proof it's safe.
   - Never pay a fee to get money back. (be-fsma-warnings-list, be-fsma-recovery-room)
5. **Someone let into your computer?** Disconnect it from the internet, call your bank, change your passwords, and get the device checked before using it again. (be-febelfin-helpdesk-fraud, be-police-microsoft-scam-2024)
6. **Asked to lend your account, card or login?**
   - Say no.
   - If you already said yes: stop, tell a trusted adult, call your bank, go to the police. (eu-europol-mule-flyer-be-fr, be-febelfin-money-mules)
7. **Someone to talk to:**
   - Tele-Onthaal 106 (Dutch) / Télé-Accueil 107 (French).
   - Young people: Awel 102 (Dutch) / Écoute-Enfants 103 (French).
   - As in the help list: be-listening-line, be-youth-line.
8. **Crisis row, last:** "Thinking about ending your life, or worried about someone?"
   - Zelfmoordlijn **1813** (Dutch: free, anonymous, 24/7) (be-zelfmoord1813).
   - Suicide prevention line **0800 32 123** (French: free, 24/7) (be-police-autres-numeros).
   - "In danger now? Call 112."
   - Wording goes to G3 review.

**Not on the card (unverified this session):**
- **The federal consumer contact point** (pointdecontact.belgique.be): its own site could not be read.
- **A Safeonweb page specific to remote access.**
- **The cost of calling 106.**
- **The French crisis line's operator name**, checked on its own site.
