# Story bible — Scam Atlas: Europe

Owners: `game-designer` + `learning-psychologist` (psychology sections), `scenario-writer` (voice) · Status: **v1.2 draft for review (T-S1; rework 1 after sceptic and learning-psychologist review; aligned to the reviewed Amsterdam §22.1 and Paris §23.13 story beats and the producer answers)** · Last update: 2026-11-19
Related: `docs/PLAN.md` Phase 3 track S, `docs/DECISIONS.md` D-S1, `docs/GDD.md` §2, §10, §15–§18, §22, §23, `content/cast.yaml`, `content/habit_cards.yaml`, `docs/patterns/MAP.md`, `docs/ART_DIRECTION.md` (S2, to come), `docs/PSYCHOLOGY.md` (sources for the principles named here).

> This file states no fraud facts. Patterns per city come from `docs/patterns/MAP.md` and the chapter specs. Every chapter's scams live **only in device scenarios**, which carry the debrief (Red Line 4). Scenes carry people, places and habits. Sample lines are drafts: the `scenario-writer` owns the final wording, within the rules in §4. The If-then lines in §3 are the exception: they are reviewed wording and are reused word for word (§4.4).

---

## 1. Through-line

### 1.1 Logline
A newly hired trust inspector crosses Europe with a borrowed phone, a grandfather who collects postcards and a friendly stranger from a language app, and learns that the best defence against a scam is a habit you share with other people.

### 1.2 Theme
**Scams use connection; so does the cure.** Every scam in the game leans on something good (love for family, wanting to help, hope for a job, a new friendship). Every resolution shows the answer is also human: pause, check on a channel you already know, ask someone. The Alex arc is the same idea from the inside: a connection that can't be checked, set against a trip full of people who can be.

### 1.3 Three threads
1. **The job: the Waymarker Atlas.** Adaeze is building the *Waymarker Atlas*, a plain-language field guide with one page per city, written from the stories of the people you meet. It is launched at an **Open Evening** in Brussels.
   - **An Atlas page = the city's If-then line (§4.4) + links to that chapter's habit cards.** The Atlas is not the habit-card collection; it points to it.
   - **Pages and postcards are given when the chapter is finished, never for performance.** A player who fell in every scenario gets the same page and postcard as one who scored gold.
2. **Family: Teo's postcards.** Teo asks for a postcard from every city, with "what you learned written on the back". The back carries the city's If-then line, word for word. He reads them at the **Thursday phone café** he runs at his local library for neighbours of every age, and in the interludes he reads them back to you (§3.12). His arc: slips once (Home 0-5), teaches you (Berlin 1-4), leads (Rome), and arrives in Brussels as a co-presenter. Noor (15), your cousin, grows from "I set up your phone" to asking your advice, and being right to ask.
3. **The friend: Alex** (GDD §10, friendship only). Alex lives only in Wordswap and Kettle chats (arc beats). Scenes never show Alex (§2.2). The finale closes the arc through the endings in GDD §10.3; the scenes after it are about the people around you.

### 1.4 Why you keep travelling
- Every city has **asked Waymarker for an inspector**, and someone there has a human problem (§3). After Berlin, each unvisited city shows an **invitation postcard** on the illustrated map: one line from its local, ≤ 20 words. You pick where to go. These invitations are the chapter hooks.
- **Invitation rule:** invitations carry no time limits, counts, badges, "new" markers or "waiting" wording ("Sanne is waiting for you" is not allowed). They read the same on every visit to the map.
- **Free city order (G1-Q3, approved):** Home → Berlin → any order of the eight middle cities → Brussels (ENGINE.md, unlocking). So no chapter may depend on another middle chapter. Cross-chapter progress is carried by **travel interludes** keyed to play position, not city (§3.12).
- **Alex arc beats follow play position (producer ruling, 2026-11-19).** Arc slot N plays in the Nth chapter the player plays (Berlin is always position 1, so slot 1), never in a fixed city. A chapter spec decides *where in its afternoon* the arc beat sits; the engine decides *which slot* plays there. Arc beat lines are therefore city-agnostic, or carry a small per-city flavour variant. GDD §18's "Alex's dashboard beat lands here too" (Dublin) now reads "arc slot N, wherever it lands". The engine ticket (S3) implements this.
- **No countdowns.** The Open Evening has a date in the story, but it is never shown as a timer, never nags, and nothing is lost by taking a break (no dark patterns, PSYCHOLOGY principle 6).

### 1.5 Payoff in Brussels
The Open Evening: Teo and Noor arrive, the locals appear on a video wall, you pick a postcard and Teo reads its cue, and the Atlas is launched. Before that, the finale's device scenarios close the three threads: Noor's easy-money DM (she asks you first), the tech-support boss (the projector laptop "needs support"), and the Alex ending. The last line belongs to Adaeze: *"Pause. Check on a number or app you already know. Ask someone. Then be the someone for the next person."*

### 1.6 The player's own arc
From "I'm the inspector, I'd never fall for that" to "anyone can be caught, and I know what to do next and who to tell". The game never says the first part out loud. It shows capable people being caught or targeted and recovering: Teo, Mateus and Davide fall; Sanne's mum and Inès are near-misses; Adaeze tells her own story. So the player's own falls and the Alex reveal land in a world where that is normal.

---

## 2. Cast sheet

**Rules for everyone.** All fictional, no likeness of real or public people. Older and younger characters are both capable and both fallible. Scammers are never cast and never drawn (GDD §2). Nobody's ethnicity, accent or age is ever a clue. The player ("You", default nickname Sam) is **never drawn, not even hands**: panels are the player's view or a mid-shot of the speaker. The player may have a line, shown as "You" without a portrait.

**Shared expression set** (so portraits can be reused): `calm`, `warm` (smiling), `laughing`, `thinking`, `worried`, `relieved`, `sheepish`, `proud`, `focused`. `worried` means raised brows and a flat mouth: never tears, panic or fear imagery.

### 2.1 Recurring cast

| Character | Role | Habit modelled | Fallible moment | Voice | Expressions |
|---|---|---|---|---|---|
| **Grandpa Teo** (74) | Your grandfather; runs a Thursday phone café at the library | **Ask someone, and be the someone** (LO-18). Reads sender and link slowly (Berlin drill). Announces his new mobile and keeps his home line as the known channel (Amsterdam 2-1). Hangs up and calls back (Rome). | Home 0-5: types his card into a prize page, then tells you straight away. Finale endings A/A′: a similar friendly profile approaches him and he asks you. | Warm, dry, short sentences. Calls you "kiddo". Jokes at himself, never at others. | warm, laughing, thinking, sheepish, proud |
| **Noor** (15) | Your cousin (Teo is her "Grandad" too), messenger-native | Calm, not paranoid (LO-17): uses her phone confidently, checks what matters. Locks her account down and warns the family (Amsterdam drill 2-4). Asks before acting (finale). | Finale: nearly says yes to an easy-money DM; asks you first. Amsterdam 2-3: her photo and name are borrowed by a "new number" (not her fault; she is the one impersonated). Her 2-4 line "also I'm looking for a summer job" seeds the finale. | Quick, teasing, kind underneath. Calls you "inspector". | laughing, focused, thinking, worried, relieved |
| **Adaeze Okafor-Lind** (50s) | Coordinator, Brussels; Atlas editor | The known channel (staff directory). Never asks for money or secrecy, and says so. Four-eyes rule. | Interlude I2 (any order): tells how, early in her career, she nearly paid an invoice to the wrong account until a colleague asked one question. It names no tell (§4.2 rule 7). | Calm, dry, brief. Praises the habit, not the person. | calm, warm, thinking, laughing, proud |
| **Mateus Ferreira** (late 20s) | Field partner, gadget fan, from Lisbon | Practical tech habits: open the app yourself, type the address. Settles shared costs openly, to his own name (Amsterdam 2-6). | Warsaw: shares a code with a hijacked friend's account; you guide his damage control. Shows expertise doesn't protect anyone. Amsterdam boss: his photo and a voice like his are borrowed (not his fault). | Upbeat, fast, a bit boastful about chargers. Owns his slip with humour. | laughing, focused, sheepish, worried, relieved |
| **Alex** | Friend met on Wordswap (arc) | None; the arc character (GDD §10). | n/a | Arc beats only: ≤ 25 words, generic small talk and plain requests, no polished persuasion copy (GDD §10.1). | **One fixed portrait, no expressions** (§2.2) |

### 2.2 Alex: special rules
- **One portrait only.** The reveal shows the same illustration on profiles with other names (GDD §10.2), so Alex is one image that `ux-artist` can place on several profile cards. A set of expressions would undermine that. Illustrated, never photo-realistic, never romance-coded (PLAN S2).
- **No scene lines (producer, 2026-11-19).** Alex never appears in a panel and has no scene lines. Arc content lives only in arc beats, which have debriefs and are keyed to play position (§1.4). Should a later spec ever propose one, it needs a producer ruling first and stays within GDD §10.1.
- **Check-ins stay unscored (producer, 2026-11-19).** Teo's interlude check-ins (I1, I3) never count as `ask_someone` and give the same reply to every answer.
- **Other characters never hint, and nothing is romance-coded.** No scene comments on Alex, Wordswap or "online friends" in a way that suggests a verdict. Check-ins ask about *people and friends in general*, never about "anyone new in your life", dating or gossip.

### 2.3 Locals (one or two per chapter; add to `content/cast.yaml` with a `known_channel` when they message you)

| City | Local(s) | Capable / fallible | Expressions |
|---|---|---|---|
| Berlin | **Jonas** (mid-30s), night-shift baker next door; daughter Mia (8, background only). Recurs in Amsterdam 2-8, where his real Kettle account is taken over (not his fault; messages only, not drawn in Amsterdam scenes) | Capable once he opens the app himself | warm, worried, thinking, relieved, proud |
| Amsterdam | **Sanne** (19), student, works the desk at your guesthouse, job hunting after a rent rise; her mum and little brother off screen. Known channel "Guesthouse desk"; story scenes only (GDD §22.1) | Capable; worries a scam on her mum was her fault, learns it wasn't; her mum is a capable parent who rang the real number | warm, laughing, worried, relieved, focused (for "determined") |
| Paris | **Solène Arbogast**, director of Ruchelune (print-and-design cooperative); **Bastien Morel**, accounts officer, on leave; **Inès Roussel** (17), apprentice designer. Margaux (front desk) is a directory entry, not cast (GDD §23.10) | Inès capable (spots the plumber fake in drill 3-3), then targeted (3-5); Solène stretched thin, firm on the procedure | Solène: worried, calm, relieved, warm · Inès: focused, worried, calm, proud · Bastien: warm, calm |
| Madrid | **Lucía Herrera** (34), night-shift nurse, your host; partner **Andrés** (36), teacher | Both capable; tiredness is the risk, not ability | Lucía: warm, calm, thinking, relieved · Andrés: worried, laughing, proud |
| Warsaw | **Kasia Wójcik** (23), music student, Waymarker volunteer (Mateus is the fallible one) | Capable seller | warm, focused, laughing, calm |
| Rome | **Signora Bruna Esposito** (72), B&B owner, Teo's postcard pen-pal of 40 years; grandson **Davide** (19); granddaughter **Giulia** (22, abroad, video only) | Bruna capable and leads; Davide falls (GDD §15) | Bruna: warm, calm, thinking, proud · Davide: sheepish, worried, relieved · Giulia: laughing, relieved |
| Lisbon | **Beatriz Ferreira** (20), Mateus's sister, room-hunting before her master's (not "Inês": that name belongs to Paris's Inès Roussel) | Capable once she slows down | laughing, worried, thinking, relieved |
| Dublin | **Declan Byrne** (52), made redundant after 22 years at a warehouse; daughter **Róisín** (18), starting college | Declan tempted, checks; Róisín supportive | Declan: worried, thinking, sheepish, laughing · Róisín: worried, warm, proud |
| Stockholm | **Jamal Haddad** (38), hospital lab technician, three weeks in Sweden; daughter **Lina** (12); upstairs neighbour **Birgitta Lind** (70), retired teacher, Adaeze's aunt | Jamal capable: a new everything is the risk, not ability; he brings his own lab know-how. Birgitta capable and teaches | Jamal: thinking, worried, proud · Lina: laughing · Birgitta: laughing, calm, proud |

Any shop, studio or workshop name visible in art must be registered in `brands.yaml` first; until then, scenes describe them without names (Ruchelune is requested in GDD §23.10).

**Name register (no name used twice for different people):** Teo, Noor, Adaeze, Mateus, Alex, Jonas, Mia, Sanne, Solène, Bastien, Inès (Roussel, Paris), Margaux (directory only), Lucía, Andrés, Kasia, Bruna, Davide, Giulia, Beatriz, Declan, Róisín, Jamal, Lina, Birgitta. Scam-side names (e.g. "Maître Vellacourt", "N. Vardoulec", "R. ••••", "K. ••••") are never cast and must not reuse a cast first name. New locals check this list first.

---

## 3. Chapters

**Scene slots per chapter** (placement in `scenario_order`):
- **Arrival** (2–4 panels): before the first AM scenario. The chapter `intro` line stays as the map caption.
- **Turn** (2–4 panels): at the half-day stop point, after the "Good place to take a break" screen, when the player continues.
- **Resolution** (3–6 panels): after the boss debrief and damage control, before the chapter summary and stamp. Its last panel is the **If-then panel**: the local speaks the If-then line and the caption "Postcard to Teo" sits on the same panel (§4.4). The hook is the map's invitation postcard (§1.4), not a panel.
- **Budget:** about 12 panels per chapter including glue (§4.1).

**Reviewed chapter specs win.** Where a chapter spec already has reviewed story beats (Amsterdam GDD §22.1, Paris GDD §23.13), the spec's beats, placement and panel counts stand, including a separate "local problem" beat and a turn placed elsewhere than the stop point. The bible adds only its glue: the If-then panel (§4.4), the Atlas page and the map invitation. Chapters without a spec use the defaults above.

Each block lists the patterns from MAP.md or the chapter spec (the scene never shows them), and the habit cards and LOs its Atlas page links to.

### 3.0 Home (fixed, tutorial) — see §6 for placement
- **Habit cards / LOs on the Atlas page:** `stop-the-damage-first` (LO-16), `ask-someone` (LO-18), `open-it-yourself` (LO-03).
- **Locals:** Teo, Noor; Adaeze by video call.
- **Human problem:** the night before your first trip; Teo is proud and a little anxious about you going.
- **Arrival:** Teo's kitchen, a half-packed suitcase. Teo jokes about the job title. Noor has set up your phone. Teo hands you a pack of blank postcards: "One from every city, with what you learned written on the back. I'll read them at my Thursday phone café."
- **Turn:** later that evening. Teo: "If you ever get stuck, ask me. I'll do the same." Optional rehearsal choice: "A message rushes you. First move?" (Pause / Check who sent it / Ask someone). Same reply to all: "All three work. Pausing first makes the other two easier."
- **Resolution:** Adaeze on video: "Welcome aboard. Whatever happened today, you can always check with me. I never ask for money or secrecy." Teo (sheepish, then laughing): "First postcard is mine." Noor: "Text me from every city. From your normal number, please." Caption: "Tomorrow: Berlin. Your inspector documents are on their way there."
- **If-then panel (Teo; Home exception, §4.4):** "If I've typed my card in somewhere odd, then I block it in the bank app and tell someone."

### 3.1 Berlin (fixed, map no. 1) — see §6 for placement
- **Habit cards / LOs on the Atlas page:** `open-it-yourself` (LO-03), `read-the-link` (LO-02), `hang-up-call-back` (LO-08).
- **Patterns:** parcel smishing, fake customs fee; boss: parcel → invoice → fake bank fraud-team call.
- **Locals:** Jonas, Mateus (first meeting).
- **Human problem:** Mia turns eight on Saturday and her present hasn't arrived; Jonas works nights and keeps checking his phone. You are waiting for your inspector documents.
- **Arrival:** courtyard, bikes, a Trundle locker. Jonas: "I take in everyone's parcels." Then the worry about Mia's present. Mateus arrives with three chargers: "Questions? I have answers and cables."
- **Turn:** Jonas at the door, still no present. Mateus: "Parcel worries make everyone jumpy. Track it in the Trundle app you open yourself." Jonas: "In the app, not the messages. After my nap."
- **Resolution:** Jonas holds two parcels: your documents (they came to him, as in the boss interrupt) and Mia's present, found in a locker through the app he opened himself.
- **If-then panel (Jonas):** "If a parcel message wants money or a click, then I open the courier's app myself."
- **Note:** Mateus is mentioned in berlin-05's outcome, so he must be introduced in the arrival scene.

### 3.2 Amsterdam (map no. 2) — scene content per GDD §22.1
- **Habit cards / LOs on the Atlas page:** `call-the-number-you-know` (LO-07), `easy-money-costs-you` (LO-12), `check-who-gets-the-money` (LO-06).
- **Patterns (GDD §22):** messenger family impersonation ("new number" 2-3, taken-over real account 2-8 with Jonas, cloned voice in the boss with Mateus); task / "easy work" job scam (2-2, 2-7, boss beat 1); payee-name check (no match 2-3, misleading match 2-8).
- **Cast in scenes:** Sanne; Noor (video, turn); Mateus and Teo (resolution). Jonas appears only in device scenario 2-8.
- **Human problem:** Sanne's rent went up, so she is job hunting, like you (you both applied to the Thimble & Pine warehouse). Someone messaged her mum "as Sanne" from a new number, using her photo.
- **Beats (spec, unchanged):**
  1. *Arrival* (calm): canal bridge, bikes; Sanne hands over your key at the guesthouse; rent and job hunting.
  2. *Local problem* (stop point, after 2-3 and 2-4; worried → relieved): Sanne tells her mum's story in her own words; she fears her public photo made it her fault; you: "…this is on them, not you."
  3. *Turn* (start of afternoon; worried → determined): her mum rang Sanne's real number first; Sanne will do the same with her little brother. Noor waves on video.
  4. *Resolution* (relieved): the real Mateus's "made it" photo; Sanne's and your interviews; Sanne's "And if a 'job' wants money first, I walk" stays as her dialogue; Teo on his new mobile; habit cards "Call the number you already know" and "Easy money costs you".
- **Glue (added to beat 4):**
  - **If-then panel (Sanne):** "If someone messages me for money I didn't expect, then I call them on the number I already have." Extra line under it on the Atlas page and postcard: "A real job pays you."
  - **Map invitation (Sanne):** "Your room at the guesthouse is ready. Fair warning: everyone here settles up by payment request."
- **Arc note:** the spec's "arc beat, slot 2" becomes "arc slot N, wherever it lands" (§1.4). The spec placed it before 2-7 because slot 2's "move to Kettle" warning sign matches 2-7's debrief; with play-position slots that match no longer holds, so the spec owner rechecks the placement.
- **Order note:** Mateus flies "to the next city" in the boss; keep it unnamed (free order).
- **Content note:** "This chapter includes a family-emergency story. Everyone ends up safe. You can pause or skip any story scene."
- **Safety:** Sanne's mum is a capable parent and her near-miss is off screen; Noor and Mateus are shown fine afterwards.

### 3.3 Paris (map no. 3) — scene content per GDD §23.13
- **Habit cards / LOs on the Atlas page:** `check-who-gets-the-money` (LO-06), `ask-someone` (LO-18), `hang-up-call-back` (LO-08).
- **Patterns (GDD §23):** CEO fraud / BEC and payment-detail change, all four payee-check results; deepfake video call in the boss (illustration plus transcript, no audio).
- **Cast in scenes:** Inès, Solène, Bastien (resolution). The real Solène and the boss's video-call "Solène" are drawn the same: a familiar face proves nothing.
- **Human problem:** Ruchelune, a small cooperative, faces the last working day before a long weekend: the school-festival order is late, Bastien is on leave, and a payment to the wrong place would hurt. Inès (17) is an apprentice whose name is later used to try to move her pay.
- **Beats (spec, unchanged):**
  1. *Arrival* (calm): your studio, then Ruchelune's workshop; Inès shows the procedure card ("Solène wrote it. She means it.").
  2. *Whose problem it is* (in the intro, worried): Solène between meetings explains why she asked for an inspector.
  3. *Turn* (after 3-5, before 3-6; worried → calm): Inès learns someone used her name; Solène: "This is why the card says no exceptions." Variant on `paris_pay_redirected`.
  4. *Resolution* (relieved): the real Solène calls you on the directory number; on Tuesday the three add "A call or video call never replaces the sign-off" to the card; Inès has shown her mum. Variant on `paris_boss_sent` (acted fast, no refund promise).
- **Glue (added to beat 4):**
  - **If-then panel (Solène):** "If a payment is new, changed, urgent or secret, then we call the number in our file, and two of us sign off." Extra line under it: "A matching name only tells you whose account it is."
  - **Map invitation (Solène):** "Our accounts officer is on leave before a long weekend. Could an inspector sit with us for a day?"
- **Arc note:** the spec's "Alex, slot 3" becomes "arc slot N, wherever it lands" (§1.4).
- **Adaeze's story** (nearly paying the wrong account) is in interlude I2, so it stays order-free and Paris's turn stays with Inès and Solène.
- **Safety:** Inès is shaken, then supported; the variants never blame and never promise money back (GDD §23.9).

### 3.4 Madrid (map no. 4)
- **Habit cards / LOs on the Atlas page:** `hang-up-call-back` (LO-08), `who-really-sent` (LO-01), `pressure-is-the-tell` (LO-04).
- **Patterns:** spoofed bank SMS inside the genuine thread; fake bank-employee call, "move money to safety".
- **Locals:** Lucía (your host), Andrés.
- **Human problem:** they are saving for a deposit on their first flat; Lucía is on night shifts and exhausted.
- **Arrival:** a sunny kitchen at 8 a.m.; Lucía coming home as you get up: "Coffee's there. I'm going to sleep for a year." Andrés: "Every euro is saved for the flat. Even this coffee is in a spreadsheet."
- **Turn:** Andrés (worried): "The bank's been texting about the deposit transfer next week." (Soil only: the texts are never shown.) Lucía (calm), last: "After nights, my rule: no big decisions until I've slept. Not one."
- **Resolution:** keys on the table: they got the flat. Lucía: "Sleepy or not, same rule."
- **If-then panel (Lucía):** "If someone says my money isn't safe, then I hang up and call the number on my card."
- **Invitation:** Lucía: "Our spare room is yours whenever you come. Bring an appetite."
- **Safety:** money-fear theme; calm pacing (§5).

### 3.5 Warsaw (map no. 5)
- **Habit cards / LOs on the Atlas page:** `codes-are-only-for-you` (LO-05), LO-10 "Stay on the platform" (card id set by the chapter spec), `call-the-number-you-know` (LO-07), `stop-the-damage-first` (LO-16).
- **Patterns:** marketplace "safe delivery / collect your payment" link while you sell something on Swaploft; payment or login code requested by a hijacked friend's account (Mateus).
- **Locals:** Kasia; Mateus.
- **Human problem:** Kasia is moving to a smaller flat to afford her last year of music school and is selling furniture; you have something to sell too (scenario-writer picks the item).
- **Arrival:** a flat full of boxes and a cello case. Kasia: "Everything must go, except the cello." Mateus photographs a lamp: "Good photos sell. Trust me, I'm a professional."
- **Turn:** Kasia (focused): "I sell a lot. My rule is simple: the deal and the money stay inside Swaploft." Mateus (thinking): "Good rule. I might borrow it."
- **Resolution (Mateus's fallible moment, after his device scenario):** Mateus (sheepish): "A friend's account asked for my code and I sent it. Me. The gadget guy." Kasia (warm): "It wasn't really your friend. And you fixed it fast."
- **If-then panel (Mateus; Warsaw exception, §4.4):** "If anyone asks for a code, even a friend, then I don't send it, and I call them on the number I know."
- **Invitation:** Kasia: "I'm selling half my flat before I move. Want to see how to do it safely?"
- **Safety:** shows a confident expert falling and recovering; no teasing from others.

### 3.6 Rome (map no. 6)
- **Habit cards / LOs on the Atlas page:** `call-the-number-you-know` (LO-07), `hang-up-call-back` (LO-08), `ask-someone` (LO-18; family code word), `stop-the-damage-first` (LO-16).
- **Patterns:** "police" or bank calls with spoofed caller ID (Teo's call); family-emergency message from a "new number" or with a cloned voice (Davide falls). Scenarios end at the call or transfer; no in-person pickups (MAP.md).
- **Locals:** Bruna, Davide, Giulia (video); Teo (video).
- **Human problem:** Giulia is in her first year abroad; Bruna misses her, Davide covers the B&B between exams, and the whole family worries about her being far away.
- **Arrival:** a small B&B with a lemon tree. Bruna: "Teo's grandchild! Forty years of postcards and finally a visitor." Davide: "Nonna has told every guest about you. Sorry in advance."
- **Turn (no scam content):** Teo and Bruna on a video call, like old friends. Bruna: "Giulia calls every Sunday. I still worry every Monday." Teo: "That's the job, Bruna. Ours never stops."
- **Resolution (after every Rome debrief):**
  - Bruna (calm), past-tense story told only now, after the police-call debrief: "A caller once said he was police. I said I'd ring the station myself. He hung up first."
  - Davide (sheepish): "It sounded exactly like Giulia. I didn't even think."
  - Bruna (calm): "Of course not. They made it sound like her. That's the trick, not you." Then: "We called the bank straight away. It's on it."
  - Giulia on video, laughing with relief: "I was in a lecture the whole time!"
  - Teo on video proposes the code word: "Let's have a family code word for calls and voice messages. Both families." Caption: "The word stays in the family. Yours does too."
- **If-then panel (Davide):** "If someone I love asks for money by call, voice note or new number, then I call their known number and ask for our word." (24 words; the suggested longer version was 33, over the 25-word cap. Hanging up is shown in the scenario, not repeated here.)
- **Invitation:** Bruna: "Teo says you'd like Rome. My B&B has a room, and the lemon tree has opinions."
- **Content note:** "This chapter includes a family-emergency story and a lost payment. Everyone ends up safe. You can pause or skip any story scene."
- **Safety:** no amount shown in scenes; the bank "is on it", with no refund promise (§5). Older characters lead, the 19-year-old falls (GDD §15).

### 3.7 Lisbon (map no. 7)
- **Habit cards / LOs on the Atlas page:** LO-10 "Stay on the platform", LO-11 "Check before you pay" (card ids set by the chapter spec), `read-the-link` (LO-02; the QR destination).
- **Patterns:** holiday and student rental scams (fake listing site, off-platform payment links, platform-login phishing); tampered parking-meter QR; fake shop. Needs a fictional rental-platform brand in `brands.yaml`.
- **Locals:** Beatriz; Mateus (home city).
- **Human problem:** rooms near the university are scarce and expensive; Beatriz has hunted for six weeks and fears losing the next good one.
- **Arrival:** a tiled street, Mateus's family kitchen. Mateus: "Mum's cooking, so you're staying for dinner. No arguments." Beatriz: "Six weeks of room-hunting. Everything good goes in an hour."
- **Turn:** Beatriz (laughing): "I think I've found one! Near the faculty, with a balcony." Mateus (thinking): "Great. Let's look at it properly before anyone pays anything." (Order-safe: Mateus does not mention Warsaw.)
- **Resolution:** Beatriz (relieved): "Booked through the app, viewing on Saturday. Nothing paid outside it." Mateus: "And I type the parking address myself now. No stickers for me."
- **If-then panel (Beatriz):** "If a host wants me to chat, pay or log in outside the app, then I stay in the app I opened myself."
- **Invitation:** Mateus: "Come home with me. My sister's room-hunting and could use a second pair of eyes."

### 3.8 Dublin (map no. 8)
- **Habit cards / LOs on the Atlas page:** LO-13 "If it's guaranteed, it's not" (card id set by the chapter spec), `stop-the-damage-first` (LO-16; never pay to recover money), `ask-someone` (LO-18).
- **Patterns:** investment ads with fake endorsements by fictional celebrities, checked against an in-world regulator register; recovery-scam offers.
- **Locals:** Declan, Róisín.
- **Human problem:** Declan lost his job when the warehouse closed after 22 years. He has a redundancy lump sum, a daughter starting college and no plan.
- **Arrival:** a community centre hall set up for Waymarker's "money clinic". Róisín: "Thanks for coming. Dad's been a bit lost since the warehouse closed." Declan: "Twenty-two years. Now I've a lump sum, a daughter in college and no plan."
- **Turn:** Declan (thinking): "Everyone online seems to be getting rich. Am I the only one being careful?" Optional rehearsal choice: "Where would you start?" (Find out who's behind it / Look it up on the register). Same reply to both: "Both. Register first, and I'll find it myself, not through an ad."
- **Resolution:** Declan (laughing): "Boring savings account and a course to retrain. Róisín says boring is the new exciting." Declan: "And anyone charging a fee to get lost money back? Same crowd."
- **If-then panel (Declan):** "If an investment promises guaranteed returns, then I find the firm on the regulator's register myself."
- **Invitation:** Róisín: "My dad lost his job and everyone's selling him a plan. Could you come and talk to him?"
- **Safety:** job loss and money worry; keep Declan dignified and in charge of his choices.

### 3.9 Stockholm (map no. 9)
- **Habit cards / LOs on the Atlas page:** LO-09 "Only approve what you started", LO-15 "Nobody needs your screen" (card ids set by the chapter spec), `hang-up-call-back` (LO-08).
- **Patterns:** callers who talk you into logging in or signing with your e-ID; QR-login approvals sent by message; one remote-access "support" preview of the finale.
- **Locals:** Jamal, Lina, Birgitta.
- **Human problem:** Jamal and Lina moved for his hospital job three weeks ago: new flat, new bank, new e-ID app, a language he is still learning.
- **Arrival:** a snowy courtyard, warm windows. Birgitta: "Adaeze's inspector! Fika first, questions after." Jamal: "New flat, new bank, new e-ID app. My head is full." Lina: "I translate. Dad pays me in cinnamon buns."
- **Turn:** Birgitta (laughing): "My rule: if a caller wants me to log in, I'm rude. I hang up. Rudeness is free." Jamal: "I'm new here. I want to be polite." Birgitta: "Be polite to people. Hang up on requests." Jamal (thinking): "At the lab we never sign for a sample we didn't order. Same idea, I suppose."
- **Resolution:** Jamal (proud): "Someone called about my e-ID. I hung up like Birgitta and called the bank myself." Lina: "Dad hangs up on requests now. Politely."
- **If-then panel (Jamal):** "If a login or signing request pops up that I didn't start, then I deny it and call the bank on its own number."
- **Invitation:** Birgitta: "My new neighbour has a new everything. Come and help, and I'll make fika."
- **Note:** an older woman teaches a younger man, who brings his own professional know-how; the "rude" framing reflects public guidance (fraud-researcher to confirm the wording in the spec).

### 3.10 Brussels (finale, fixed)
- **Habit cards / LOs on the Atlas page:** `easy-money-costs-you` (LO-12), LO-15 "Nobody needs your screen", LO-14 "A real friend never needs your money" (card ids set by the chapter spec), `ask-someone` (LO-18).
- **Patterns:** tech-support remote access (boss), money-mule recruitment (Noor's DM), callbacks, Alex resolution (GDD §10.3).
- **Locals:** Adaeze; Teo, Noor and Mateus arrive; all locals on the video wall at the end.
- **Human problem:** the Open Evening is in two days; the projector laptop won't behave; Noor is quieter than usual.
- **Constraint for the Brussels spec (S4):** **Noor never shares her details, whatever the player advises.** Every branch of her DM scenario ends with Noor not sharing and asking someone (you, and her mum); a poor piece of advice from the player gets a gentle Noor reply ("I'll check with Mum too") and the debrief, never Noor's fall. This keeps her resolution line true for everyone.
- **Arrival:** Waymarker's office, boxes of freshly printed Atlas covers (no printer's name visible; order-free). Adaeze: "Two days to the Open Evening. The laptop and I are not friends." Teo and Noor arrive with one suitcase too many.
- **Turn:** Noor (thinking), scrolling: "Can I ask you something later? It's probably nothing." You: "Any time. I'm here." (A human cue; the DM is only in the device scenario.)
- **Resolution, part 1 (after the Alex ending, GDD §10.3; each ≤ 5 panels):**
  - **When `alex_invested > 0` (ending C, and ending R with an investment, which plays C's damage control and recovery-agency test per GDD §10.3 rule 1):**
    - Adaeze (warm): "You were kind to someone who turned out not to exist. The lie was theirs, not yours."
    - Adaeze (calm), recovery panel, true in every branch, no refund promise: "Stop paying, call the bank on the number on your card, and keep the chats. The list below shows who else can help."
    - Teo (warm): "I typed my card into a prize page, remember? It happens. What counts is what you do next, and you're doing it."
  - **A / A′, and R without an investment** (R plays the Teo scene from A, GDD §10.3 rule 1): after Teo's guided scenario, Teo (sheepish, then proud): "Same picture, different name. Good thing I asked you." R only adds Teo (warm): "Sometimes you just want to know. Asking is never wrong."
  - **B:** Adaeze (calm): "You told someone, and the timeline did the rest. That's the whole trick."
  - **Every variant** then has the feelings panels with the Help link (§5): "The chats felt real because you were real." / "It's fine to feel sad, embarrassed, or both. Talking to someone helps."
- **Resolution, part 2 (all players):** Noor (relieved): "I nearly said yes. Then I asked you, and I told Mum too. Asking was the smart bit." The Open Evening: the video wall of locals (reused portraits); you pick a postcard and Teo reads its cue (§3.12, flip the postcard); Adaeze's last line (§1.5). Then the end screen (Atlas pages, habit cards, help list).
- **If-then panel (Noor; Brussels exception, §4.4):** "If an easy-money offer wants my bank login or card, then I say no and ask someone first."
- **Content note:** "This chapter ends the trip, including the Alex storyline. It touches on friendship, feeling let down and money. You can pause or skip any story scene, and help is one tap away." If the arc already closed with "Tell me now" before Brussels: "This chapter ends the trip and touches on money. You can pause or skip any story scene, and help is one tap away."
- **Art:** the Brussels office and Open Evening hall are never EU-styled: no blue-and-gold stars, no flags, no institutional buildings (Waymarker is not an EU body, GDD §2).

### 3.11 What a chapter block must give its spec
Each chapter spec (`docs/chapters/<city>.md` or GDD §18 successor) names its scenes and confirms: (1) the local's problem is the soil, not the scam; (2) no scene shows a message, link, number, QR or amount from a scam; (3) the resolution is true whatever the player did in the boss (or names its story-only variant flags, §4.2 rule 5); (4) the If-then line matches the chapter's habit cards, which its Atlas page links to; (5) any new local is in `cast.yaml` and the name register; (6) any past-tense story meets §4.2 rule 7.

### 3.12 Travel interludes (play position, not city)
Shown on the map after the 2nd, 4th, 6th and 8th middle city, whatever the cities were. ≤ 4 panels, ≤ 25 s. They may use `{count}` (cities done) and `{lastCity}`; they never name another specific city.

**Flip the postcard (every interlude, and the Open Evening).** One optional, unscored panel. Teo reads the cue half of an If-then line ("If a parcel message wants money or a click…") from a city the player finished at least two chapters earlier; the engine picks it by play position. The player taps to flip the card and see the then half. There is no right or wrong, no input beyond the tap, and Skip works as on any panel. At the Open Evening, you pick a postcard and Teo reads its cue.

- **I1 — Teo's café:** Teo: "Your postcards are a hit. Eight neighbours on Thursday, and someone brought cake." Flip the postcard. Neutral check-in: "Made any friends on your travels?" (A few / Mostly work so far). Same reply to both: "Good. Same rule for old friends and new: if anyone asks for money or secrets, tell me."
- **I2 — Noor and Adaeze:** Noor: "I showed my class your postcards. Now everyone checks links. You're welcome." Adaeze: "The Atlas has {count} pages now. Halfway." Adaeze, her fallible moment as a past-tense story that names no tell (§4.2 rule 7): "Early on, I nearly paid an invoice to the wrong account. A colleague asked one question. Now I always ask." Flip the postcard.
- **I3 — Open Evening set:** Adaeze names the date (no countdown). Flip the postcard. Teo's second neutral check-in: "How's the trip treating you? Seeing enough people, not just phones?" (Plenty of people / Mostly phones, honestly). Same reply to both: "Whoever you meet, the rule stands: money or secrets, tell me first."
- **I4 — Packing, mirrored:** Teo packs your old suitcase: "Your suitcase, my adventure. Noor's checking the train times. In the official app." Flip the postcard. Then: "Brussels is open."

---

## 4. Scene format guidance (for writers and illustrators)

### 4.1 Shape
- A scene is **1–6 panels**. Defaults: arrival 2–4, turn 2–4, resolution 3–6 (including the If-then panel), interlude ≤ 4. A reviewed chapter spec may use shorter beats (Amsterdam: 1–3 panels per beat) and an extra "local problem" beat.
- **One speaker per panel** (or one caption). Each panel has: backdrop, speaker, portrait + expression, one line, alt text. The player may have a line, shown as "You" without a portrait.
- **Lines ≤ 25 words**; aim for 8–15. Plain English around B1. At most one local-language phrase per scene, with `lang` and the same inline translation as devices; never a joke about accent or language.
- **Reading budget:** about **12 panels per chapter including glue** (about 90–100 s); Brussels about 150 s; interludes ≤ 25 s each. Story total across the game about 18–20 min, to be re-measured at playtest against GDD §12 lengths. Merge rather than add: the If-then line and the postcard caption share one panel.
- **Panels never auto-advance.** The player taps or presses to continue.
- **Skippable** (one button, same place on every scene), **replayable** from the chapter menu. Nothing in a scene is needed to play a scenario: a player who skips everything loses no information the devices need.
- **Optional choice:** at most one per scene, 2–3 options, all leading to one shared reply. Choices **never score and set no flag** unless `game-designer` specs one. Use them for rehearsal ("first move?") where every option is acceptable, never as a quiz with a wrong answer. Flip the postcard (§3.12) is a tap-to-reveal, not a choice.

### 4.2 Content rules (track S scene rules, PLAN.md)
1. **No scam artefacts.** No scam message text, sender, link, number, QR code, IBAN, amount, logo of a spoofed brand, or screenshot. Phone screens in panels are turned away or show a home screen, map or photo.
2. **No verdict spoilers.** A scene before a scenario never reveals that scenario's verdict or its tell. A general habit stated as a rule ("the deal and the money stay inside Swaploft") is allowed: it never says which message is fake. After a scenario's debrief, a scene may refer to it in plain words ("a friend's account asked for my code"), with no message text.
3. **Soil, not scam.** The local's problem is human (a job, a flat, a birthday, a family member far away). The scam only grows out of it in device scenarios.
4. **Red Line 8:** no offline fraud as a lesson: no doorstep visits, couriers collecting cash, ATM scenes, street tricks. No police, bank or courier staff in uniform; no real signage, liveries or landmarks with logos (PLAN S2 art guard).
5. **Outcome-neutral by default.** Scenes don't branch on score. Every line is true whether the player fell or not. Never "thanks to you, nothing was lost"; never "because you clicked, Mia had no present". **Allowed exceptions:** the finale's ending variants (GDD §10.3), and **story-only variant flags** that a chapter spec names and a fall outcome sets (Paris: `paris_pay_redirected`, `paris_boss_sent`). A variant only keeps the scene truthful: it names the recovery step already taken, never blames, never promises money back, and changes no score, stamp or arc flag.
6. **Order-neutral.** Middle chapters never refer to each other. Cross-chapter progress goes in interludes (§3.12).
7. **Scammers are never drawn or voiced.** Characters describe a scam only after its debrief, in one plain sentence. **Narrow exception, past-tense stories:** a character may tell a short story about something that happened to them before the game ("A caller once said he was police…") only if it never repeats a tell that is still to come in the same chapter. In practice: inside a chapter, place it after the matching debrief (Bruna's police story sits in Rome's resolution); in an interlude, it names no tell at all (Adaeze's I2 story says she nearly paid the wrong account and that a question stopped it, not what was wrong).
8. **Alex:** no scene lines (§2.2).
9. **Fictional brands only** (Red Line 1); any new name goes to `brands.yaml` first.

### 4.3 Craft
- The local states the problem; your recurring cast brings a habit; the local uses it. The player is never lectured by the narrator; characters *show* the habit and say it in their own voice.
- Humour targets the trick or the character's own quirks, never the person who fell (GDD §15). Avoid easy clichés about places and older people (food-pushing grandmothers and the like).
- One panel can show a recurring character doing a habit from an earlier chapter only if that chapter is fixed (Home, Berlin); otherwise use an interlude.

### 4.4 The If-then line (one wording per habit)
- Every resolution ends with one **If-then panel**: "If [cue], then I [action]", ≤ 25 words, with the caption "Postcard to Teo" on the same panel.
- **Speaker:** the local. **Exceptions:** Home (Teo, his slip), Warsaw (Mateus, his fall), Brussels (Noor, her offer).
- **One wording everywhere.** The postcard, the Atlas page and the interludes' flip the postcard use the If-then line **word for word**. Extra lines (e.g. "A real job pays you.") sit underneath on the postcard and Atlas page, never inside the line. Dialogue elsewhere in the scene may say the habit in a character's own voice (Sanne's "I walk").
- The line names the cue and the action, so the flip panel can split it at "then".
- This is the chapter's most important line; every change goes through `learning-psychologist`.

### 4.5 Illustrative scene file (schema owned by `frontend-engineer`, S3)
```yaml
id: berlin-resolution
chapter: berlin
slot: resolution            # arrival | turn | resolution | interlude
sensitive: false            # true → content note + prominent help link (§5)
panels:
  - backdrop: berlin-courtyard
    speaker: jonas
    expression: relieved
    line: "Your documents came to me. And look: Mia's present was in a locker all along."
    alt: "Jonas in the courtyard, holding two parcels and grinning."
  - backdrop: berlin-courtyard
    speaker: jonas
    expression: proud
    if_then:
      cue: "If a parcel message wants money or a click,"
      action: "then I open the courier's app myself."
    caption: "Postcard to Teo"
    alt: "Jonas taps his own chest, proud. A postcard frame shows his words."
```

---

## 5. Emotional safety (co-owned with `learning-psychologist`)

Applies to all scenes; sources and research in `docs/PSYCHOLOGY.md`.

1. **"This could happen to anyone", shown not told.** Falls happen to a 74-year-old (Teo), a tech-savvy 20-something (Mateus), a 19-year-old (Davide) and, in a story, a seasoned coordinator (Adaeze). The line is voiced by a character, once, at the right moment; it is never a narrator's lecture.
2. **No shame.** No one says "you should have known", "obviously" or "gullible" (GDD §15). Nobody teases the person who fell. Embarrassment is named as normal ("It's fine to feel sad, embarrassed, or both"), and telling someone is praised.
3. **Calm pacing on sensitive themes.** Family emergency (Amsterdam, Rome), money loss or money fear (Madrid, Warsaw, Rome, Dublin), job loss (Dublin), the friendship arc (Brussels). In these scenes: no cliffhanger panels, no alarm colours or storm/dark imagery, `worried` never escalates past raised brows, and the scene that raises a worry also resolves it before it ends.
4. **Recovery in the same breath.** When a fall is mentioned, the next panel shows the step that was taken (card blocked, bank called, password changed) and that the person is OK. No lingering on amounts; scenes never state how much was lost and never promise money back.
5. **A visible way to help.** Every scene has a Help link in the scene chrome (same place as in devices) to "Where to report and get help" (GDD §9). On `sensitive: true` scenes it is labelled "Need to talk? Where to get help".
6. **Content notes (exact wording, shown on the map before the chapter):**
   - Amsterdam: "This chapter includes a family-emergency story. Everyone ends up safe. You can pause or skip any story scene."
   - Rome: "This chapter includes a family-emergency story and a lost payment. Everyone ends up safe. You can pause or skip any story scene."
   - Brussels: "This chapter ends the trip, including the Alex storyline. It touches on friendship, feeling let down and money. You can pause or skip any story scene, and help is one tap away."
   - Brussels, if the arc already closed with "Tell me now": "This chapter ends the trip and touches on money. You can pause or skip any story scene, and help is one tap away."
7. **Safe family-emergency framing.** The impersonated person is always shown safe afterwards (Noor, Mateus, Giulia on video; Sanne in person). No injured, crying or endangered characters in art; the emergency exists only as a claim inside a device scenario.
8. **Alex ending.** Acknowledge feelings, put the blame on the lie, point to people (Teo, Adaeze, Noor) and the help list. No "betrayal" imagery, no shattered screens. The recovery panel is true in every branch and promises no refund.
9. **No dark patterns in the story.** Hooks are invitations without time limits, counts, badges or "waiting" wording (§1.4). No streaks, no story locked behind performance; Atlas pages and postcards come with finishing a chapter, never with a score.
10. **Human review.** Rome, the Brussels endings and the money-loss scenes are the priority set for the proposed qualified human review (PLAN S5, decided at G3). This is AI-drafted guidance, not clinical advice.

### 5.1 Learning design notes (psychologist to review)
- **Modelling:** characters perform the habit and see it work (vicarious learning), including after a mistake (coping models, not mastery-only models).
- **If-then plans:** one per chapter (§4.4), one wording on the panel, postcard, Atlas page and flip panel.
- **Retrieval and spacing:** each interlude's flip the postcard recalls a line from at least two chapters earlier; the Open Evening repeats it once more.
- **Self-efficacy:** every scene ends with someone able to act. No scene ends helpless.
- **Load:** one idea per panel, about 12 panels per chapter, no auto-advance; illustrations support the line (ART_DIRECTION).
- **LO mapping (GDD §13):** scenes are pacing plus LO-18 (ask someone, act as the trusted person) and LO-16 (recovery shown); If-then lines and flip panels support each chapter's LOs (listed per §3 block) through retrieval. Scenes are never scored.

---

## 6. Retrofit: Home and Berlin (S4)

Both chapters exist and are complete; scenes are added around them with **no change to scenarios or scoring**. Requested schema addition (to `frontend-engineer`, S3): `content/chapters/<city>.yaml` gains `scenes: { arrival, turn, resolution }` (scene ids); the existing `intro` stays as the map caption.

### 6.1 Home
| Scene | Placement | Must do |
|---|---|---|
| `home-arrival` (3–4 panels) | before `home-01-welcome-pack` | Introduce Teo, **Noor** (she is named in home-04's outcome) and the postcard ritual ("what you learned written on the back"). Adaeze is not drawn yet; her welcome email (0-1) introduces her. |
| `home-turn` (2–3 panels) | stop point, between `home-03-password-reset` and `home-04-kettle-locked` | Teo's "ask me, I'll do the same" (seeds 0-5 without revealing it); optional rehearsal choice. |
| `home-resolution` (5 panels) | after `home-06-boss-new-portal` debrief | Adaeze video intro (first time drawn); Teo's "First postcard is mine"; Noor's "normal number" line; Berlin caption; Teo's If-then panel last. |

Check: the Home tutorial teaches one mechanic per scenario with coach marks; scenes must not add a coach mark or a new control beyond Skip, Help and the optional choice.

### 6.2 Berlin
| Scene | Placement | Must do |
|---|---|---|
| `berlin-arrival` (4 panels) | before `berlin-01-locker-code` | Introduce Jonas and Mia's present, **Mateus** (named in berlin-05's outcome), and the documents arriving by Trundle; consistent with berlin-02 ("tomorrow's briefing"). |
| `berlin-turn` (3 panels) | stop point, between `berlin-04-teo-customs` and `berlin-05-kettle-code` | Mateus's "open the Trundle app yourself"; Jonas's nap joke. Must not mention Kettle, codes or fees. |
| `berlin-resolution` (3 panels) | after `berlin-09-boss-fraud-team` debrief | Jonas with both parcels (matches the boss interrupt, true in every branch); Jonas's If-then panel; map invitations appear. |

Check: the Alex arc beat sits between berlin-07 and berlin-08; no scene is placed next to it and no scene mentions Wordswap.

---

## 7. Hand-offs
- **ux-artist (S2):** portraits per §2 (shared expression set; Alex as one image). Backdrops: Teo's kitchen; Berlin courtyard; Amsterdam canal bridge and guesthouse desk; Paris studio flat and Ruchelune's workshop; Madrid kitchen; Warsaw flat with boxes; Rome B&B with lemon tree; Lisbon tiled street and kitchen; Dublin community hall; Stockholm snowy courtyard; Brussels office and Open Evening hall (never EU-styled: no blue-and-gold stars). The illustrated map with invitation postcards (no badges or counters); the postcard frame with a flip state.
- **frontend-engineer (S3):** scene type per §4.5 (no auto-advance); `scenes` in chapter YAML; interludes keyed to play position with flip the postcard (§3.12); arc beats keyed to play position (§1.4 ruling); story-only variant flags (§4.2 rule 5); map invitations; content notes (§5.6); Help link in scene chrome; `if_then` lines feeding Atlas pages and postcards on chapter finish.
- **scenario-writer:** final lines per chapter within §4 (If-then lines unchanged without psychologist review); new locals into `cast.yaml`.
- **Chapter spec authors:** Amsterdam (GDD §22.1) and Paris (GDD §23.13) are reviewed and the bible follows them; their scenario-writer adds only the glue in §3.2 and §3.3. Both specs change their arc beat to "arc slot N, wherever it lands", and Amsterdam rechecks its placement reason. The Brussels spec takes the Noor constraint in §3.10. Later chapter specs start from §3.4–§3.10 and report conflicts to `game-designer`.
