# Pattern brief: `remote-access-support-call`

**Chapters:** 9 Stockholm (one "support" call previews the finale, LO-15) and 10 Brussels (finale boss, GDD §18, §29.5) · **Status:** draft for review (T-3.10r Stockholm preview; extended to the full Brussels pattern in T-3.12r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

A caller from "your bank", "Card Stop", "IT support", "the software maker" or an investment "adviser" asks you to install an app or share your screen so they can "fix", "protect" or "help". Or a pop-up says your computer is infected and gives a number to call. With control of the device, they can see what you see, read codes and make or approve payments.

**Defender level only.** No product names, no install or connection steps, no description of how a session is set up. What happens after access is described only as what the victim sees, and what to do.

## 1. Name, aliases, where it is prominent
- **English:** tech-support scam; remote-access scam; fake helpdesk call.
- **Dutch (BE):** *helpdeskfraude*, the Febelfin theme name in Dutch. The English page is titled "Computer helpdesk fraud" [be-febelfin-helpdesk-fraud]. The Dutch title was not opened.
- **French (BE):** *arnaque au faux support technique*. The Police fédérale page says "arnaques utilisant [a software maker's name]" [be-police-microsoft-scam-2024]. The French alias is descriptive and was not quoted from a source.
- **Swedish:** *fjärråtkomst*, *dela din skärm* (share your screen) [eu-esas-ai-scams-factsheet-sv].
- **Game label:** Kindhand, a fictional "support" brand (BRAND_CHECK DS8: Low risk, keep). It has a fictional, clearly non-functional "helper" app screen (Red Line 2). No real remote-access product names or icons. Several appear in official sources; they are for research only.
- **Where it is prominent, and the evidence:**
  - **EU:**
    - Tech-support fraud is among the most common typologies reported by Member States [eu-europol-iocta-2026].
    - Fake remote support is listed as a social-engineering trend [eu-epc-threats-2025].
    - Victims are told to ignore or dismiss bank alerts [eu-epc-threats-2025].
  - **Belgium:**
    - The financial-sector federation has a dedicated page on fake helpdesk calls [be-febelfin-helpdesk-fraud].
    - Its 2026 vishing warning says fake bank or Card Stop callers may ask you to install remote-access software [be-febelfin-vishing-2026].
    - The Federal Police warned in 2024 that pop-up "infection" alerts with a support number were continuing [be-police-microsoft-scam-2024].
    - The national cybersecurity centre warned about the same pattern in 2019 [be-ccb-remote-access-2019] (older; supporting).
    - The investment regulator says fake trading platforms offer to take over the device [be-fsma-trading-platforms-2025].
  - **Elsewhere:**
    - SE [se-konsumentverket-investment-fraud].
    - IE [ie-garda-crimecall-investment-2024].
    - DE [de-evz-online-trading-scam-2026].
    - PL [pl-cert-fake-consultants].
    - CH, supporting only [ch-ncsc-fake-support-2024].
  - **Why Brussels:** the Belgian sources cover all three entry points: helpdesk, bank or Card Stop, and investment. That lets the finale combine habits from earlier chapters.

## 2. Channel and psychological levers
**Entry points (what the victim sees first):**
1. **A pop-up or full-screen warning** while browsing. It says the computer is infected or blocked and gives a number to call, sometimes with a countdown (the Federal Police page mentions 5 minutes) [be-police-microsoft-scam-2024], [be-ccb-remote-access-2019], [ch-ncsc-fake-support-2024].
2. **An unexpected call** from a "helpdesk" or "the software maker" about a problem with your computer [be-febelfin-helpdesk-fraud], [be-ccb-remote-access-2019].
3. **An unexpected call from "your bank" or "Card Stop"** about a suspicious payment, then a request to install something to "secure" the account [be-febelfin-vishing-2026]. A text that gives a number to call can come first [eu-epc-threats-2025].
4. **An investment "adviser"** who offers to "help" with a platform by taking over the device [be-fsma-trading-platforms-2025], [ie-garda-crimecall-investment-2024].

**Levers:** authority and expertise; fear (virus, hacked account, money leaving); urgency; helpfulness and the relief of being looked after; for some people, embarrassment about not being "good with computers". That last lever is designer context only, never a description of the player or a character. The Febelfin page calls the callers "very aggressive and efficient" [be-febelfin-helpdesk-fraud].

## 3. What the victim sees (screens only)
**Before access:**
1. A friendly, confident caller with a plausible story. A Belgian number on screen, or knowing part of your account number, proves nothing [be-febelfin-vishing-2026].
2. A request to turn on the computer, go online and install "a tool" or share the screen. Sometimes they ask you to read out a number the app shows [be-febelfin-helpdesk-fraud], [be-ccb-remote-access-2019].

**After access (as the victim experiences it):**
1. The pointer moves on its own, or the screen and computer are blocked ("bloquer vos écrans et votre ordinateur") [be-ccb-remote-access-2019]. Any message on the dark screen, such as "repair in progress", is game design, not a quoted source (corrected 2026-11-19 after re-reading the CCB release).
2. "Log in to your bank so I can check", or "approve this to secure your account". Then a payment request or approval appears that the victim did not plan [be-febelfin-vishing-2026], [be-febelfin-helpdesk-fraud].
3. **"Switch off your phone"** (or "ignore any messages from the bank"), so the bank's alerts don't reach you [be-ccb-remote-access-2019], [eu-epc-threats-2025].
4. A demand to pay for the "repair" or for a "subscription", or to "unlock" the screen [be-police-microsoft-scam-2024], [be-ccb-remote-access-2019].
5. Later: money gone from the account. Some victims were also pushed to open a crypto account [be-ccb-remote-access-2019].

**Game rule:** the game shows only these victim-side screens and stops at a narrative cut. There is no simulation of the connection, of control or of a working "helper" app (Red Lines 2 and 4).

## 4. Red flags (numbered, concrete)
1. **Someone who contacted you asks you to install an app or share your screen.** A genuine bank employee never asks you to install remote-access software [be-febelfin-vishing-2026], [eu-esas-ai-scams-factsheet-sv].
2. **A pop-up or warning gives a phone number to call** for "support" [be-police-microsoft-scam-2024], [ch-ncsc-fake-support-2024].
3. **An unexpected "helpdesk" or "software maker" call** about your computer. They "suddenly ask you to follow steps via your computer" [be-febelfin-helpdesk-fraud].
4. **"Card Stop" calls you.** Card Stop never contacts customers first [be-febelfin-vishing-2026].
   - This covers the card-blocking line only. Don't widen it to "your bank never calls"; the source doesn't say that.
   - In game, the fictional card line gets its own name (RL1).
5. **Urgency**: a countdown, "within 5 minutes", "stay on the line" [be-police-microsoft-scam-2024], [se-polisen-anmal-telefonbedrageri].
6. **They ask you to log in to your bank, read out a code or approve something while they are connected or on the line.** "Never share codes or passwords" [be-febelfin-vishing-2026], [se-konsumentverket-investment-fraud].
7. **They tell you to switch off your phone or ignore your bank's messages** [be-ccb-remote-access-2019], [eu-epc-threats-2025].
8. **They ask you to pay** for a repair, a subscription or to "unlock" the device [be-police-microsoft-scam-2024], [be-ccb-remote-access-2019].

## 5. The verification habit
**"Never let anyone who contacted you control or see your screen. Hang up and contact the company yourself, using a number from its official app, card or website."** [be-febelfin-vishing-2026], [be-febelfin-helpdesk-fraud], [eu-esas-ai-scams-factsheet-sv], [se-konsumentverket-investment-fraud]

**Supporting lines (all sourced):**
- "Hang up immediately" and call your bank yourself on the official number [be-febelfin-vishing-2026].
- Don't follow the instructions and don't let the caller finish [be-febelfin-helpdesk-fraud]. This is the source for the harmful step `let_caller_finish`.
- Close a warning pop-up instead of calling the number in it. Only download software from official sources [be-police-microsoft-scam-2024].

## 6. Already caught? What to do
**Order for the game, Belgium.** "Generic" marks advice that is sensible but not in the cited source.
1. **Disconnect the device from the internet.**
   - Source: "disconnect" [be-febelfin-helpdesk-fraud].
   - Airplane mode or unplugging is the generic way to do it.
   - Game step: `go_offline`.
2. **Call your bank now to block payments and the banking app.**
   - In Belgium, Card Stop / Fraudstop on 078 170 170, 24/7, can have digital banking apps blocked via your bank [be-febelfin-fraudstop-2026].
   - Or call your bank's 24/7 fraud line [be-febelfin-vishing-2026].
   - Use the number on your card or in the bank's app, never one the caller gave.
   - Using another phone is generic advice.
3. **Change your passwords** [be-febelfin-helpdesk-fraud], [be-ccb-remote-access-2019].
   - Start with banking and email.
   - Doing it from a different, clean device is generic advice.
4. **Uninstall what you were told to install, and run a full antivirus scan.**
   - Sources: [be-ccb-remote-access-2019], [be-febelfin-helpdesk-fraud], [be-police-microsoft-scam-2024].
   - Ideally, have a professional check or reset the device [be-police-microsoft-scam-2024].
   - Game step: `get_device_checked`. Keep the on-screen wording at "get it checked"; no tool names.
5. **Report to the police.**
   - Use Police on Web if you have a Belgian identity card, or go to a local police station. The page says the station is "préférable" because first measures can be taken quickly [be-police-plainte-arnaque-en-ligne].
   - Bring a timeline, screenshots and the numbers used [be-police-plainte-arnaque-en-ligne].
   - Give the report to your bank as well [be-febelfin-games-campaign-2025].
6. **Report the fake helpdesk.**
   - Febelfin says to report fake helpdesk calls to the CCB [be-febelfin-helpdesk-fraud].
   - Suspicious messages can be forwarded to suspicious@safeonweb.be (be-safeonweb-forward on the help list).
   - No Safeonweb page specific to remote access was found this session.
7. **Tell someone.**
   - On-screen wording: "It can happen to anyone, and telling someone helps."
   - Never label the reader as ashamed (RL5).
   - Designer background: the CCB notes that many victims feel ashamed and don't report [be-ccb-remote-access-2019].

**Harmful choices (debrief "don't"):**
- Letting the caller finish "so they can undo it" [be-febelfin-helpdesk-fraud].
- Paying to "unlock" the device or to cancel a "subscription" [be-ccb-remote-access-2019], [be-police-microsoft-scam-2024].
- Calling back the number from the pop-up or the call.
- Switching off your phone because the caller said so [be-ccb-remote-access-2019].

Never promise a refund (GDD).

## 7. Variations by country
- **BE:**
  - Helpdesk, bank and Card Stop callers [be-febelfin-helpdesk-fraud], [be-febelfin-vishing-2026].
  - Pop-ups with a support number [be-police-microsoft-scam-2024].
  - Trading platforms that offer to "take over" [be-fsma-trading-platforms-2025].
  - Fraudstop / Card Stop 078 170 170 [be-febelfin-fraudstop-2026].
  - Warning: Card Stop's old 070 344 344 still appears on some pages and is outdated.
- **SE:**
  - Bank or investment callers [se-konsumentverket-investment-fraud].
  - Police 114 14 [se-polisen-telefonbedrageri].
  - Stockholm preview (§8).
- **IE:** investment "advisers" ask for remote access [ie-garda-crimecall-investment-2024].
- **DE:** "Do not give anyone access to your devices via remote maintenance software" [de-evz-online-trading-scam-2026].
- **PL:** fake consultants [pl-cert-fake-consultants].
- **CH:** locked-screen pop-ups (supporting only) [ch-ncsc-fake-support-2024].

## 8. Game notes
**Stockholm preview (ch 9, LO-15):**
- One short call that stops at the install request; the player hangs up.
- Debrief layer 1: the habit. Beyond that, only "they could see and do what you can".
- Keep it separate from the e-ID beats so the habits don't blur: e-ID = "don't approve what you didn't start"; remote = "don't let them in".

**Brussels boss (ch 10, GDD §29.5):**
- Reuse Kindhand, the `nobody-needs-your-screen` card and the steps `go_offline`, `get_device_checked` and `let_caller_finish` (harmful).
- Suggested layering, each layer sourced above:
  - a pop-up or a "bank / Card Stop" call;
  - the install request;
  - "log in so I can check";
  - "switch off your phone".
- The player wins by hanging up and using a number they already have, at any point.
- **If the player goes along:** a narrative cut ("Your screen goes dark…"), then damage control in the §6 order. There is no on-screen amount.
- **Combining habits:** the e-ID or approval habit (ch 9) and "Card Stop never calls first" (this brief) can both appear. Keep one deciding question per beat.
- **Real names:** none in game content. Real bodies appear only on the help screen.

## 9. Sources
be-febelfin-helpdesk-fraud · be-febelfin-vishing-2026 · be-febelfin-fraudstop-2026 · be-police-microsoft-scam-2024 · be-ccb-remote-access-2019 (older, supporting) · be-police-plainte-arnaque-en-ligne · be-febelfin-games-campaign-2025 · be-fsma-trading-platforms-2025 · eu-europol-iocta-2026 · eu-epc-threats-2025 · eu-esas-ai-scams-factsheet-sv · se-konsumentverket-investment-fraud · se-polisen-telefonbedrageri · se-polisen-anmal-telefonbedrageri · ie-garda-crimecall-investment-2024 · de-evz-online-trading-scam-2026 · pl-cert-fake-consultants · ch-ncsc-fake-support-2024 (supporting). All Belgian sources were accessed 2026-11-19.

## 10. Confidence
- **High:**
  - the red flags, the habit and the damage-control order;
  - consistent across BE (banking federation, Federal Police, CCB, FSMA), EU, SE, IE, DE and PL sources.
- **Not verified:**
  - **Safeonweb:** no current page specific to remote access was found. The CCB source is from 2019, so it supports the victim's view only.
  - **Report to the CCB:** the Febelfin advice to report to the CCB doesn't say which channel. The help screen uses the verified forwarding address only.
  - **The Dutch and French aliases** are descriptive, not quoted from sources.
  - **Police on Web for under-18s:** whether they can use it was not checked. The displayed help text says "Under 18? Go with a parent, carer or another adult you trust." (`be-police` body).
  - **Fraudstop costs:** the cost of calling 078 170 170 is not stated, so use "Call costs may apply".
  - **Sweden:** no Sweden-specific "tech-support" source (unchanged from T-3.10r).
