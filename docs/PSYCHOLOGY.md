# Psychology and learning design — Scam Atlas: Europe

Owner: `learning-psychologist` · Status: v1.0 (2026-11-19), consolidating the rulings applied in the Phase 3 reviews (chapter specs, story scenes, engine CRs, help list) · Related: `docs/STORY.md` §4.4 and §5, `docs/GDD.md` (debrief, arc and chapter rules), `docs/UI_SPEC.md` §8.1, `docs/CONTENT_GUIDE.md`, `docs/patterns/WHERE_TO_REPORT.md`, `docs/DECISIONS.md`.

> **What this file is.** It gives the principles and the reasons behind them. It is not a second copy of the rules. Where a rule is already written down elsewhere, this file points to it, and that source wins. This is AI-drafted guidance, not clinical advice. The sensitive set (Rome, the Brussels endings and the money-loss scenes) goes to the proposed qualified human review (STORY §5.10).

---

## 1. Blame the lie, never the person
**Principle.** Shame makes people hide a loss and stops them reporting it, and fast reporting is what limits harm. Every line that follows a fall puts the cause on the deception and then shows the next step.

**Rules in practice**
- **Names the trick, not the person.** Example: "They made it sound like her. That's the trick, not you."
- **Never says** "you should have known", "obviously", "gullible", "you fell", "again" or "twice", and no count of falls on any screen (STORY §5.2; GDD §28.5 item 9).
- **Victims and impersonated people are never at fault.** This includes a hijacked account owner (R13) and someone whose name is borrowed. Every line about them says so, or stays neutral.
- **Recovery in the same breath.** When a fall is mentioned, the next panel shows the step taken and that the person is OK (STORY §5.4).
- **Boss-fall variants open the resolution.**
  - Every boss-fall variant (`<city>_bank_called` and similar) is the first panel of the resolution. It comes before any panel with good news, a success story or a comparison the player could read as a contrast with their own fall.
  - Wording is the merged R17 line or an equivalent that is true in every branch. It never promises a refund.
- **Lines that are true in every branch.**
  - An NPC line about recovery, such as "the bank was called", is true whatever the player picked. The spec names the outcome that makes it true (STORY §3.11 (7)).
  - A line that is false in one branch is a must-fix, even if that branch is rare.
- **The impersonated person is shown safe** soon after the fall, in every branch (STORY §5.7). Do not leave it until the end of the chapter.
- **After bad advice, praise the asking.** When the player advises a cast member badly (CR-40 `advise_comply`), the line praises the asking and states the rule without blame: "{Name} asked, and that was the smart bit. With an offer like this, the answer is always no."
- **The red-flag timeline** describes the player's choices in plain, blame-free words under the header "Every step below was Alex's plan, not your fault." (GDD §30.6).

## 2. If-then lines (implementation intentions)
**Principle.** A plan of the form "if [cue], then I [action]" links a recognisable situation to one action. It is easier to recall under pressure than general advice.

**Rules in practice** (full rules in STORY §4.4)
- **One line per chapter, at most 25 words,** used word for word on the panel, the postcard, the Atlas page and the flip panel. Every change goes through `learning-psychologist`.
- **The cue is what the player will actually see** (a request, a code, a new number). Make it broad enough to work beyond the game. For example, "voice note" stays as a general cue even where no scenario plays one.
- **The action is one concrete habit,** and it matches the chapter's habit card and Atlas cards. The art models it: phone at the ear means calling a known number; phone in view means opening the app yourself.
- **Extra lines** go under the If-then line, never inside it. They must match the chapter's main tell. Do not raise a supporting clue to the main cue: a sticker supports the lesson, but the address is the tell.
- **Supporting extras like the family code word** never replace the main check. Every mention says "call the saved number" first.

## 3. Layer 1 of the debrief: 40 words, one idea
**Principle.** Right after a decision, attention is short and emotions may run high. One tell and one working step are what the player keeps. Anything more competes with them.

**Rules in practice**
- **Layer 1 renders at most 40 words in the worst case,** fixed copy included (UI_SPEC §8.1, GDD §3 debrief, CR-10). Arc beats use the same budget, with no verdict and no stars (GDD §10.2).
- **The tell names the deciding detail.** Example: "A new number, money today, and nobody you can call."
- **What works is one action.** Example: "Call the number you already have."
- **Nuance goes to layer 2:** sources, caveats, "can't prove anything either way".
- **Each beat asks one deciding question,** even in a boss that combines habits.
- **Never teach a mechanism** (how a voice is cloned, a session captured, money moved).

## 4. Fear-free framing
**Principle.** Fear without a clear way to act leads people to deny or avoid the problem, not to act. The game builds confident checking, not general suspicion.

**Rules in practice**
- **Neutral details stay neutral.** Caller ID, a voice, "printed", photos, local numbers and tidy addresses are never red flags on their own and never "It fits". The ask is the tell (GDD reveal rulings per chapter; CR-36 and CR-37 validators).
- **Calibration.** Genuine twins show real requests working: a real relative, a real host, a real regulator. Checking a genuine message is never wrong, and blind distrust never reaches silver (strategy checks, GDD §7.2).
- **Every consequence line comes with the next step** in the same panel or line. No lists of punishments, no prison or danger imagery, no countdown in a scene.
- **Scope claims to the source.** For example, "the real card-blocking line never calls you first" is about that line only, never "your bank never calls". Widening a source's claim teaches people to distrust real contact.
- **Refunds are always "may".** No figures for losses or how common a scam is appear on screen.
- **Scenes** have no cliffhangers, no alarm colours, and `worried` never goes past raised brows. The scene that raises a worry also resolves it (STORY §5.3).

## 5. Content notes and sensitive scenes
**Principle.** People who have been through a scam, or the situation it imitates, deserve warning and control, without labels that alarm everyone else.

**Rules in practice**
- **When a chapter gets a content note:** when it depicts a family emergency, a story-character's loss, or speaks directly to people who have already lost money or are at risk (Rome, Dublin, Brussels).
  - Money fear alone gets no note (R11, Madrid).
  - Exact wording lives in STORY §5.6 and each chapter spec.
- **Shape:** what the chapter touches on, in neutral words, then "You can pause or skip any story scene", and "help is one tap away" where the theme warrants it. Never label the reader.
- **Sensitive scenes** (`sensitive: true`): the Help link reads "Need to talk? Where to get help", and the help list shows support first (STORY §5.5; WHERE_TO_REPORT §3c order).
- **Content note frequency:** shown once per replay session (CR-28).

## 6. Help list: support and crisis rows
**Principle.** Someone upset after a scam needs a person to talk to. Someone in crisis needs a clearly separate, calm route. Mixing the two either under-serves or alarms.

**Rules in practice** (full rules in `docs/patterns/WHERE_TO_REPORT.md`)
- **The crisis line is its own role, never "support".** It is the last row, on its own, with the same title in every country: "Thinking about ending your life, or worried about someone?"
  - The body ends "In danger now? Call 112."
  - A country without a verified crisis line shows no crisis row; there is no generic fallback.
- **Order on the scam help screen:** bank, Report it, support, young people, crisis. On sensitive scenes: support, young people, crisis, then bank and report.
- **Young people's lines** sit under one heading: "Under 18? Lines for young people".
- **Cost wording:** "free" only where an official or operator page says so. Otherwise "Normal call rate." or "Call costs may apply."
- **Accuracy:** never show a number or operator name that was not verified on its own page.

## 7. Under-18 wording
**Principle.** The audience is 14+. A young person's first step is telling an adult they trust. Any line that makes that feel risky, or promises a legal outcome nobody can promise, works against it.

**Rules in practice**
- **First step:** "Under 18? Tell a parent, carer or another adult you trust first. Getting help early is the right move. Asking for help is never the wrong thing to do. They can call the bank or the police with you." (WHERE_TO_REPORT §1, step 0)
- **Never** "you won't be in trouble" or "you're not in trouble". Where the law may apply, that is a promise no source supports.
- **Police:** "Under 18? Go with a parent, carer or another adult you trust."
- **Adult wording stays separate.** Lines written for adults say "someone you trust". Under-18 specifics go in the under-18 lines.
- **Young cast members** (Noor, 15; Lina, 12) are never shown handling money, codes or e-ID, are never called criminals, and always end a branch safe and supported.

## 8. Money-mule on-screen rules
**Principle.** Teenagers are targeted. The aim is that they say no, or come forward early, not that they hide in fear.

**Rules in practice** (full rules in `docs/patterns/money-mule-recruitment.md` §6, §7, §10 and GDD §30.9 BX7)
- **The consequence sentence appears once, in a general debrief, always followed by the next step:** "Letting someone use your account like this is a crime, and the account holder can be held responsible. If it's already happened, getting help early is the right move."
- **The only mention of pressure:** "If anyone pressures you to keep going, that's a reason to get help now."
- **Never on screen:**
  - punishments, prison imagery or parents' liability;
  - recruiters' threats;
  - whether anyone "knew";
  - how money moves;
  - "you won't be in trouble".
- **Story characters are targets, never criminals.** No scene calls their action a crime. The "already said yes" steps are taught through someone off-cast getting help (R19(1)).
- **"Already said yes" order:** stop; tell a trusted adult today; call the bank on the number on the card; change the login; police with an adult; report the account; warn friends.

## 9. Scoring, stamps and the end screen
**Principle.** Points support learning; they must never make players feel ranked or judged. Recovering well after a mistake is itself a learning objective (LO-16).

**Rules in practice**
- **Atlas pages and postcards come from finishing,** never from a score. There are no streaks, timers or "waiting" wording in hooks (STORY §5.9).
- **Gold and falls (R15):**
  - Recommended: `stamps.gold.max_falls: 1`. One well-recovered fall can still earn gold; a second fall gives silver.
  - Only scored falls count; drills and arc beats never do.
  - Stamp copy is free of shame: "Silver. You recovered well both times. Gold is for one fall or none."
- **The end screen "Your Atlas"** shows every If-then line, the habit cards and the help cards (GDD §30.5, CR-44(b)).
  - It has no ranking, no totals, no amounts lost and no count of falls.
  - Gold appears as a small mark on each card, not as a tally.
  - It closes on a forward-looking line, not a score.
- **Advice and drills:** bad advice to a cast member scores 0 but is not a fall (CR-40). Drills are unscored and end safely in every branch.

## 10. Review checklist (for chapter specs and scenes)
1. Does every line after a fall blame the lie, and is it true in every branch?
2. Does a boss-fall variant open the resolution, before any contrast?
3. Is the impersonated person shown safe soon after?
4. Does the If-then line match the habit cards, the pose and the extra line?
5. Is layer 1 at most 40 words, with one tell and one action?
6. Are neutral details neutral, and is every scope claim limited to its source?
7. Does the chapter need a content note, and are sensitive scenes marked?
8. Do help rows follow the role order, the crisis title and the cost rules?
9. Are the under-18 and money-mule rules met word for word?
10. Is the score shown without ranking, totals or shame?
