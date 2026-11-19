# UI Specification — Scam Atlas: Europe

Owner: `ux-artist` · Status: **v2, rework 1 for G1** (T-1.6) · Last update: 2026-11-18
Inputs: `docs/GDD.md` v3, `content/balance.yaml` v3.1, `docs/LEARNING_OBJECTIVES.md`, `docs/PERSONAS.md`, `docs/qa/2026-11-18-ui-spec-review.md` (QA U1–U16, LI-1–5, FI-1–2), sceptic review of T-1.6, `docs/patterns/BRAND_CHECK.md`.
Outputs: `src/styles/tokens.css` (values referenced as `--token`), `content/brands.yaml`, `public/brands/*.svg`, mock-ups in `docs/ui-mockups/`.
Reviewers: `sceptic-reviewer` (brand resemblance, Red Lines 1–3), `qa-playtester` (accessibility, personas).

> Rule for engineers: **if a value is not a token, ask before hard-coding it.** If a behaviour is not in this spec, choose the most accessible option and note it in the PR.
> Finding ids from the reviews are tagged in brackets, e.g. [U3], so reviewers can trace each fix.

**Names in this version:** the inspect tool is called **Check** (icon: magnifier); "Check mode" is the optional mode that shows every checkable element. Brands: Waymarker Network (+ Waymarker Desk, Waymarker mail), Trundle, **Larchwick Bank**, Thimble & Pine (non-craft products), **Swaploft**, Kettle, **Gatewren**, Wordswap. Old names (Corvelle, Hoardly, Nodkey, Lantern, PaketPilot) must not appear anywhere.

---

## 0. Principles

1. **Three visual layers, never mixed.**
   - **Game layer** (HUD, action tray, Check card, debrief, map, passport): warm paper, ink, "sea" accent.
   - **Device layer** (phone, laptop, apps): generic, neutral chrome. Familiar *patterns* (inbox, bubbles, address bar) with **no** copied layout, colour, typography or iconography from a real OS, client or app. No notch shapes, no real status-bar icon sets, no message tails, no Material/iOS signature components.
   - **Brand layer**: only brands in `content/brands.yaml`, only through `--brand-<id>-*`.
2. **Check reveals facts, never verdicts.** "Scam", "safe", "fake" and "red flag" never appear in the device or the Check card; red flags are named only in the debrief.
3. **Nothing in the UI correlates with truth.** Styling, counts, ordering, avatars, markers, pressure and timers behave identically on genuine and fraud messages. Reviewers check this as a rule ("no meta-tells") [LI-1, sceptic].
4. **Calm by default.** Pressure effects can be turned down or off and never flash.
5. **Every simulated form is visibly a training page** (§5) and cannot capture input.
6. **No information by colour alone.** Every status has an icon *and* text.
7. **Mobile first, one-handed.** Every decision is reachable in the bottom half of a 360×640 screen. Accepted exception (producer ruling R3, 2026-11-19): the "Jump to your options" bar is sticky at the top, under the HUD, because at the bottom it covered targets (CR-27); the options themselves stay where they are.

---

## 1. Layout system

### 1.1 Breakpoints
| Name | Width (CSS px) | Layout |
|---|---|---|
| `xxs` | < 320 (e.g. 375 @ 200% zoom = 188) | Two-row HUD (§2.1). Tray in normal flow. Not a design target, but Pause, timer and stress word must stay visible [U1]. |
| `xs` | 320–359 | One-row compact HUD. Full-bleed device. |
| `sm` | 360–599 | **Primary target (360–430).** Full-bleed: the screen *is* the device. HUD top, device middle, action tray bottom. |
| `md` | 600–1023 | Phone frame centred (`--phone-w`), tray directly under the frame, notebook as a sheet. |
| `lg` | ≥ 1024 | **Desk:** notebook rail (`--notebook-w`) · device stage · action rail (`--rail-w`). |

Height rule: when the viewport is **shorter than 500 CSS px** (landscape phones, 200% zoom), the HUD stays sticky but the action tray, debrief footer and damage-control bar become **static** (in normal flow, after the content) [U1, U5].

### 1.2 Mobile shell (`sm`)
```
┌──────────────────────────────┐
│ HUD (56px, sticky)            │  progress · timer · stress · Pause · menu
├──────────────────────────────┤  4px progress bar (xs/xxs only)
│ Device viewport (scrolls)     │  status strip 24px + app header 56px + content
├──────────────────────────────┤
│ Action tray (sticky, ≤50dvh)  │  "Details you can check" · actions
└──────────────────────────────┘
```
- 4 px grid; screen padding `--space-4`; between groups `--space-6`.
- Collapsed tray (while reading): one row, 64 px, "Choose (4)" + first label truncated. It expands when the player reaches the end of the message, taps "Choose", or tabs into it. It never auto-expands over unread content.
- Safe areas: `padding-bottom: max(var(--space-4), env(safe-area-inset-bottom))`.

### 1.3 Scroll padding for every fixed or sticky bar [U5]
Every scroll container that has a sticky or fixed bar over it sets `scroll-padding-top` / `scroll-padding-bottom` to the **measured** bar height (CSS vars `--hud-h-live`, `--tray-h-live`, `--footer-h-live`, set by a ResizeObserver). This applies to: the HUD, the action tray, the debrief footer, the damage-control "Done" bar, the half-day stop bar, and the browser's SIMULATION strip. Playwright test: Tab through every screen at 375×812 and 188×406 and assert that the focused element's rect does not intersect any fixed bar (WCAG 2.4.11).

### 1.4 Desk shell (`lg`)
```
┌──────────────────────────────────────────────────────────────────┐
│ HUD (full width)                                                  │
├──────────┬────────────────────────────────────────┬──────────────┤
│ Notebook │ Device stage                           │ Action rail  │
│ 260px    │ phone frame 390×800 OR laptop ≤880     │ 320px        │
└──────────┴────────────────────────────────────────┴──────────────┘
```
- **Phone devices**: `sms`, `messenger`, `call`, `qr`, `banking`, `auth`, `social`. **Laptop**: `email`, `browser`. **Table surface**: `letter`.
- Multi-channel beats (email → browser) bring the browser in front of the mail client. The mail list stays visible as a 260 px left pane when the laptop is ≥ 760 px wide (mock-up 2).
- Grid columns use `minmax(0, 1fr)` so long hosts can never force horizontal scroll.
- Device frames: phone = rounded rect `--radius-device`, 10 px `--device-frame` border, no notch or buttons. Laptop = rounded screen + flat 8 px base, no logo or camera.

### 1.5 Type
- Body and message text `--fs-md` (16 px), `--lh-body`. Never below `--fs-xs` (13 px), which is used only for meta text.
- Identifiers (addresses, domains, numbers, IBANs, QR destinations) in `--font-mono` inside the Check card so look-alikes (rn/m, cl/d, vv/w, i/l, 0/O) can be told apart.
- **Host wrapping rule** [U13]: only the owner part of a host (§4.4) is `white-space: nowrap`; it never breaks. `<wbr>` marks the preferred breaks at the boundaries scheme | subdomain labels | owner part | path. The other parts (scheme, local part, subdomain labels, path segments) may also break anywhere (`overflow-wrap: anywhere`) when they don't fit, so a long label never widens the page (QA T-2.8 m4, e.g. `waymarker-network.` at 188 px). If the owner part alone is wider than its box, the box scrolls horizontally inside itself (`overflow-x: auto`, keyboard-focusable) rather than breaking the name.
- Text-size setting: 100 / 115 / 130 %, plus browser zoom to 200 %.
- No web fonts (offline, privacy, avoids real brand typefaces).

### 1.6 Iconography
Original line icons, 24 px grid, 2 px stroke, rounded caps, `currentColor`. Set: magnifier (Check), magnifier-tick (checked), flag-outline (marked suspicious; also used for red flags in the debrief), check-seal (genuine), tag-crossed (scam), breath (two concentric circles), hourglass (timer; never a bomb or alarm), stress states (flat line / single wave / triple wave), phone-answer, phone-end, dialler, lock (page info; decoy-capable, never proof), external-link, info, close, back, chevron, attach, QR, camera, bank-card, gate (sign-in prompt), notebook, passport, map-pin, speaker, captions, translate (two speech marks "A/文"-free: draw "Aa ⇄"). No OS icon fonts. No shields.

---

## 2. Game shell components

### 2.1 HUD (`<header>` landmark) — width budget [U1]
The HUD always contains, in this order: **progress · timer · stress · Pause · menu**. Timer, the stress *word* and Pause **never leave the HUD**. Menu (which holds Help, Notebook, the Fairmeasure register (CR-38, §3.7b), Settings, Quit to map) is always present, so Help is always in the same place (WCAG 3.2.6).

Budget per layout (CSS px at 100 % text; gaps 4 px, padding 8 px each side):

| Layout | When | Progress | Timer | Stress | Pause | Menu | Row total incl. gaps + padding |
|---|---|---|---|---|---|---|---|
| **Full** | width ≥ 440 | chip "4/9" 44 | 64 (`flex:none`, min `--hud-timer-min-w`) | icon 18 + segments 48 + word ≤ 92 = 166 (worst case "Overwhelmed") | icon + "Pause" 84 | 44 | 44+64+166+84+44 + 16 + 16 = **434** |
| **Standard** | 360–439 | chip 44 | 64 | icon + word = 114 (segments dropped) | icon only 44 | 44 | 44+64+114+44+44 + 16 + 16 = **342** |
| **Compact** | 320–359, or Standard doesn't fit (e.g. 115–130 % text) | 4 px bar under the HUD (text in menu + SR) | 64 | 114 | 44 | 44 | 64+114+44+44 + 12 + 16 = **294** |
| **Two-row** | < 320, or Compact doesn't fit | row 2: "4/9" text | row 1 | row 2: icon + word | row 1 | row 1 | row 1: 64+44+44 + 8 + 16 = **176** (fits 188 = 375 @ 200 %) |

- **Collapse priority** (first to go → last): stress segments → Pause text label (icon stays; accessible name stays "Pause") → progress chip moves to the 4 px bar → two rows. The city name is never in the HUD (chapter intro and menu only). Timer, stress word, Pause and menu never leave. The engine picks the first layout whose measured min-content fits (ResizeObserver); the table is the test oracle.
- **Inspect-cost chip** "−2 s" is drawn as a badge overlapping the timer's top-right corner (absolute), so it takes no width.
- Every control ≥ `--tap-min`. Row height 56 (two-row: 2 × 48 + 8).

### 2.2 Action tray / rail (`<section aria-labelledby="actions-h">`, heading "Your options")
- First row: **"Details you can check"** disclosure (§4.6).
- Then one button per action: full width, min-height 52 px, `--fs-lg`, left-aligned. **Order and position are authored and never change** during a scenario, under any stress state.
- Styles: `neutral` (default) and `pressure` (§6.3).
- `pause` is never in the tray; it lives in the HUD.
- On press: the button shows a 2 px inset `box-shadow` in `--color-accent`, then the tray locks (`aria-disabled`) while the outcome plays.

### 2.3 Notifications
Arriving messages show a device banner inside the device layer for 4 s (slide `--dur-base`; reduced motion: instant). Announcement rules are in §10.5. Focus never moves on an interrupt; the banner gets a "View" button.

### 2.4 Notebook
Correctly spotted red flags (from the debrief, so the notebook never reveals truth mid-scenario), grouped as Sender / Link / Payment / QR / Pressure. Each entry: flag icon, label, value in mono, scenario name. Rail on `lg`, sheet elsewhere.

### 2.5 Avatars [sceptic]
- Avatars **never use semantic tokens** (`--color-ok-*`, `--color-flag-*`, `--color-warn-*`, `--color-accent`, `--color-sim-*`). They use either the claimed brand's `-mark.svg`, or initials on one of 6 neutral avatar tints chosen by a hash of the *display name* (`--avatar-1…6`, warm greys and pastels defined in tokens; add with the engine).
- **Same display name → same avatar, whatever the truth.** A spoof that claims "Waymarker IT" shows the Waymarker mark exactly like the genuine Waymarker sender (mock-up 2).
- Cast members have illustrated avatars (never photos).

---

## 3. Devices

Common rules:
- Root: `<section role="region" aria-label="{Device}: {App}">`, e.g. "Phone: Messages", "Laptop: Browser, training page".
- Phone status strip: in-game time, "Waymarker phone", text-free battery glyph; 24 px; `--fs-xs`. No carrier names.
- **Every visible element of a message is checkable** (GDD §5): sender, each link, attachment, QR, payee, caller ID, page address, page info, letterhead, reference numbers, phone numbers. They are native `<button>`s in reading order ("Check sender", "Check link"). Elements without an authored reveal show **"Nothing unusual here"** in every chapter (balance v3.2 `checkable_list_by_slot`).
- **Inspectable-count parity** [sceptic]: the set of checkable elements is generated from what is *visible* in the device template, never from the authored `inspectables[]`. Authored entries only supply reveal text. Therefore two messages that look alike expose the same number and kinds of checkables, whatever their truth. Validator: genuine twins and their fraud counterparts have equal checkable counts ±1 (the ±1 is a visible extra element, such as a link the genuine message doesn't have).
- Long email bodies (> 80 words) collapse with "Show more" (button).
- **Foreign-language text** carries `lang` and an inline **Translate** toggle (§4.8). Translation is never a checkable; it is not inside a Check card, with one exception: the verbatim English "Translation" row for non-English messages (§4.8, producer ruling R1) [U7].

### 3.1 Mail (`email`)
- **Inbox row** (72 px): avatar (§2.5), display name (bold + visually hidden "Unread" when unread), subject, first line (muted), time.
- **Thread**: subject `h2` (`--fs-xl`), sender line "**{display name}**" + "to me" + time. Display name → Check reveals the full address with owner part boxed. Attachments: chips (icon + filename + size), checkable. Bottom bar icons are decorative (`aria-hidden`) unless an authored action maps to them.
- **Quoted earlier emails** (`message.earlier`, CR-25; max 3): below today's message under a separator "Earlier", each a muted quote (`--color-text-muted`, 3 px left border `--color-border`) with a bold `--fs-sm` meta line "{from} · {when}" (from optional). Never checkable; links show as plain text. Foreign text keeps its Translate toggle.
- Bank-details card on email: as §3.3.
- SR: "From {display name}." The Details list follows (§4.6).

### 3.2 SMS (`sms`)
- Header: back chevron (inert, `tabindex=-1`), sender (alphanumeric ID `TRUNDLE`, a short code, or a masked number `+49 ••• ••• 0173`), sub-label "Text message".
- Bubbles: incoming `--bubble-in-*`, outgoing `--bubble-out-*`, radius `--radius-lg` with the sender-side corner `--radius-xs` (no tails). Max width 80 %. Day separator centred.
- Pusher follow-ups are ordinary bubbles with an ordinary timestamp (no "follow-up" label) [sceptic].
- Links: underlined `--color-link`. **Tapping a link never opens anything.** Touch tap shows a toast: "To see where it goes, press and hold, or use Check. Your choices are below." Keyboard/AT activation opens the Check card directly [U14]. Opening the link is only ever an authored action (`open_link`).
- A spoof inside a genuine thread looks identical to its neighbours.

### 3.3 Messenger (`messenger`, Kettle)
- Kettle header (`--brand-kettle-primary` bar, white title), illustrated avatars, outgoing bubbles `--brand-kettle-bubble-out`.
- **New-contact banner** (`sender.new_contact`, CR-19; top, `--color-surface-sunken` with info icon, never warn colours, so it is neutral): "Not in your contacts · {detail}" (masked number). The number stays checkable through the sender. It appears for *every* unknown number, genuine or not. `message.image` on messenger is the profile photo checkable.
- **Bank-details card** (`payee` on `email` or `messenger` only, CR-22; never on letters or other devices): a stylised card titled "Bank details" (1 px `--color-border`, `--radius-md`) with rows "Name given in the message" (fact-check S8, Paris T-3.5: not a verified holder), "IBAN" (mono, grouped in 4s) and optional amount. Our own layout, never a real bank's details-slip format. Only the IBAN is checkable; **no name check, holder or request fields** outside `banking`.
- Group chats: sender name above incoming bubbles. Typing indicator: static dots + text "typing…".
- **Wordswap (Alex arc)** uses the same component with the Wordswap header. **Friendship only**: no hearts, "match", "date", swiping or ratings; reactions limited to thumbs-up, laugh and "useful phrase" bookmark. Alex's avatar is an illustration.
- **Quoted screenshots** (e.g. Teo's screenshot of a fake text, Berlin 1-4): rendered as a framed card inside the bubble, `--color-surface-sunken`, 1 px border, caption "Screenshot from Teo", real text inside (not an image). Its elements are checkables with `context: quoted`; the card carries visually hidden text "Quoted example" before its content so SR users know they are inside a quote.

### 3.4 Call (`call`)
- **Incoming**: caller line (contact name, or masked number + "Unknown"), sub-line ("Mobile" / "Withheld"). Caller ID is checkable ("Caller ID can be faked. This shows what the network was told, not who is calling."). Two 64 px circular buttons **with text labels**: "Answer" and "Decline".
- **Dialled** (CR-45; the beat has `direction: outgoing`, or every action leading to it dials: `call_number_in_message`, `call_back_known`): heading "Call to {number}", sub-line "Calling…" with `sender.detail` under it (e.g. "The number from the text") for 1.5 s (`DIAL_SECONDS`; held while paused, the timer frozen as on a ringing call), then "Connected" and the transcript as for an answered call. **No Answer or Decline**; the tray says "Connecting the call…" until connected, then shows the beat's options with Hang up. Announced at once as "Calling {number}." (category 2). Its checkable is "Number you dialled", not "Caller ID".
- **In call**: caller + elapsed time on top; **transcript** in the middle (always visible, speaker-labelled rows "Caller:", "You:"); bottom (fixed): **Hang up** (labelled), **Call a known number** (opens the dialler sheet with known channels: "Number on the back of your Larchwick card", "Adaeze — staff directory"), and the beat's actions in the tray.
- **Pacing** [U9]: lines are revealed at reading pace (max(1.5 s, 0.3 s × words)). The **beat timer starts only after the last line of the beat is shown.** Setting "Call lines: Auto / Step through" (default Auto; Step through in the Calm preset): in Step through, a "Next line" button (Space when focused) reveals each line. Opening Pause or Settings halts auto reveal (2.2.2).
- **Recorded message** (`message.recorded`, CR-20): once answered, the header shows the text label "Recorded message"; "You:" lines are not shown and the reading-pace reveal counts only the shown lines.
- **Video call** (`message.video`, CR-24): the ringing screen keeps the avatar plus the label "Video call". Once answered, the heading is "Video call from {caller}" and the avatar is replaced by a **still, stylised SVG illustration** (`public/art/video/<id>.svg`, ART_DIRECTION §12) in a `<figure>`, with the transcript below as usual. It is a checkable ("Face and voice", target `video`); the visible caption is `aria-hidden` so the description is read once via the button name "Video: {alt}". **No `<audio>` or `<video>` element, no synthesised voice, no motion or glitch effects.** The `hang_up` action is labelled "End the call" (GDD §23.11 CR-24) and opens "What now?" as usual.
- **Voice label** (`message.voice`, CR-36): once answered, "Sounds like {cast name}" (e.g. "Sounds like Grandpa Teo") under the caller ID, as the checkable "Voice". Always neutral: a voice can be copied, so it proves nothing either way; never styled as a warning or a reassurance.
- **Audio** (optional, off by default): "Play audio" toggle; while on, the line being spoken is bold with a left bar; never auto-plays. **Not built** (CR-36): no audio element is rendered anywhere in the game; calls are a transcript and labels only.
- SR: transcript is `role="log"` (polite) — top priority in the announcement queue (§10.5).

### 3.5 Browser (`browser`)
- **Chrome** (`--browser-chrome-bg`, 52 px): back, page-info button, address bar, more. No tabs strip, no real omnibox shape.
- **Address bar**: full host with the **owner part** (§4.4) in `--address-strong` + bold; scheme, subdomain and path in `--address-dim`. Long hosts truncate **from the left** with a visible "…" element so the owner part stays visible [U13]. Under 520 CSS px the address bar takes its own full-width row in the chrome; under 320 CSS px the bar shows only "…" + the owner part (subdomain and path stay in the Check card), so the owner part always fits. The bar is checkable. **Its dashed affordance appears only in Check mode**, like every other checkable [sceptic].
- **Page info**: a lock glyph (our own drawing) on every https page, genuine and fraud alike. Check reveal: "The connection is encrypted. Necessary, but never proof of who runs the site." (GDD: padlock is never proof.)
- **No hover status bar** with destinations: hovering never reveals anything for free (§4.2). On desktop a link hover shows only the "Check (click)" hint.
- **Page content**: brand templates (Waymarker Desk, Trundle tracking, Thimble & Pine product, Swaploft listing…). Every form-like page gets the training-page treatment (§5), genuine or fraud.

### 3.6 QR camera (`qr`)
- Dark viewport showing the poster/letter/sticker illustration with a generic square viewfinder (four rounded corner brackets).
- On "detection" (600 ms; reduced motion: immediate): a **destination chip** "QR code · opens **trundle-redelivery.example**" + "Check". The destination is checkable. Nothing opens unless the player picks an authored action (`scan_qr_and_open`).
- **How the code is attached** (`qr.mount`, CR-37; `qr` and `letter` beats): a sticker is drawn as a raised white label with a dashed edge and a lifted corner over the printed code (static, no animation); printed codes are flat. Under the chip: "How the code is attached: Sticker stuck over the printed code" / "Printed on the {surface}" when the beat names it (`qr.surface`, e.g. "panel" on a meter), else "Printed on it" (letter: "Printed on the letter"), the value checkable (after the destination). The same words end the camera's text alternative. "Printed" is never proof; the address stays the lesson.
- **A QR code in a chat** (CR-39(b), messenger): the same stylised code inside the incoming bubble, after the body, on a white tile (144 px), `role="img"` "A QR code in the message. It opens {host}."; below it the destination chip "QR code · opens {host}", shown at once (no camera, no scanning delay), the host checkable. No mount line in a chat.
- **The QR graphic is a deliberately non-decodable stylised pattern** (GDD §5): two square corner marks that are not finder patterns (ring, wide gap, dot: run ratio 1:2:1:2:1), a solid disc in the third corner, a module field with no three dark modules in a row, and format strips fixed to a pattern at distance 5 from every valid format code. `tests/unit/qr-undecodable.test.ts` runs ZXing and jsQR on rasterised copies (with a positive control) and asserts nothing is detected or decoded. If a decodable code is ever needed it may encode only a `.invalid` string (e.g. `QR-DEMO-1-7.invalid`). The red-line linter decodes every QR asset and fails on anything else.
- **Sticker-on-sticker**: the illustration shows an offset, differently sized label; checkable ("This QR code is a sticker on top of another one").
- SR: "Camera. A parking meter with a QR code sticker. QR code opens trundle-redelivery.example."

### 3.7 Banking app (`banking`, Larchwick)
- Larchwick header (indigo, white). In-app bottom tabs: Home · Payments · Cards · Help.
- **Balance card**: account nickname, balance `--fs-2xl`, masked account "•••• 4417".
- **Transactions**: grouped by date; amounts prefixed "−"/"+" **and** labelled "Paid"/"Received"; "Pending" as text.
- **Card controls**: "Freeze card" switch with "On/Off" text; "Report card lost or stolen".
- **Transfer form** (training page, §5): payee name, IBAN (checksum-invalid, grouped in 4s, mono), amount, reference.
- **Payee-name check** (invented Larchwick screen, GDD §23.5, CR-23). Runs on transfer forms with `payee.name_check`, genuine and fraud alike, after payee name + IBAN + amount (read-only demo values, nothing sent). One result card (`<section aria-labelledby>`, visually hidden heading "Name check"; 1 px `--color-border`, `--radius-md`, `--space-3` padding):
  - **Checking state:** one `role="status"` paragraph (`#name-check-result-<beat>`, `tabindex=-1`) is mounted from the start and only its text changes: "Checking the name with the payee's bank…" (italic, `--color-surface-sunken`) → the result after 0.8 s (at once in reduced motion, no spinner), so the result is announced.
  - **Four results** (icon + text; colour is never the only signal):

    | Result | Text | Icon | Surface | Holder name |
    |---|---|---|---|---|
    | Matches | "Name matches. The account is held by '{typed name}'." | tick | neutral: `--color-surface-sunken` / `--color-text`. **No seal, shield or badge, no green** | the typed name only |
    | Close match | "Close match. The account is held by '{holder}'. Is that who you mean to pay?" | info | information styling: `--color-surface-sunken` / `--color-text` + 4 px inset left bar `--color-accent`. Never warning colours | **shown** (the only result that shows a holder) |
    | Doesn't match | "The name doesn't match this account. The money may go to someone else. If you pay anyway, Larchwick may not be responsible." | warning triangle | `--color-warn-bg` / `--color-warn-text`: **the only result in warning colours** | **never shown** |
    | Couldn't check | "We couldn't check the name for this account." | info | neutral `--color-surface-sunken` | none |
  - **Footer on all four cards**, identical, in normal text colour and size (it is the lesson, never small print): "Larchwick checks the name against the account. It can't tell you whether the request is genuine."
  - After the check: result → footer → coach mark on first use (§4.5) → the beat's actions as full-width buttons **inside the card**, in authored `action_order`. "Pay anyway" stays available after every result (the check never blocks). The tray shows "Your options are in the bank app, under the name check." with "Go to the options"; that button and the "Skip/Jump to your options" links focus the result paragraph.
  - Checkables: the payee name (`payee.name_check`, its reveal is authored) and the IBAN. Validator: `holder` exactly when `close_match`; a `match` reveal never starts with "It fits".
- **Payment-request page** (`payee.payment_request`, CR-18c): header sub-label "Payment request"; "Request from {name}" (checkable `payee.name`), amount, optional "Note". **No name check runs and there are no card or form fields** (no TrainingForm).
- **Code confirmation** (`payee.code_confirm`, CR-34): header sub-label "Confirm payment"; a card "Confirm payment", the amount (`--fs-2xl`), "to {name}" (checkable `payee.name`) and a small line "Payment code used" (so the player sees the code they typed is what this confirms). No name check, no IBAN, no form fields; Confirm / Decline / "Decline and call {friend}" are in the tray. Heading "Banking app: confirm payment to {name}".
- **On-call bar** (CR-31, GDD §24.5): on a banking beat the player reached by following a call into the app (`start_transfer` from a `call` beat), a slim persistent bar at the top of the phone, above the bank header ("persistent" means it stays for the whole beat, through Hang up, and keeps its clock running; it is not `position: sticky`, so on short viewports such as 568 × 320 it scrolls with the screen and never covers focused content, WCAG 2.4.11): phone icon, "On a call · {caller}" and the running time "· mm:ss" (scenario clock; the time is `aria-hidden` so it is never read out every second), and a **Hang up** button (44 px, neutral, phone-end icon, described as "Goes to this screen's options for ending the call."). Hang up adds no path: it scrolls to and focuses the beat's own first verify / report / dismiss action ("Hang up and call…"). While the bar is shown, "Choose how to end the call:" stands above the options (in the name-check card, or in the tray when the beat has no card; the list is labelled by it), so the player knows the call ends with their choice, not with the button. The caller's follow-ups bound to that beat are listed inside the bar as "Caller: …" lines with Translate, not as notifications, and are announced as call lines (category 1, "Caller: {text}", immediately, each on its own, never folded into "N new messages"). Region `aria-label` "On a call with {caller}". Neutral call styling (`--color-surface-sunken`, no red, no warning, no animation, so nothing changes with reduced motion). Wraps at 320 px.
- **Also over Gatewren prompts** (CR-39(a), §3.8): the same bar when the prompt was opened from a call.
- **Account** (`message.account`, CR-26; `kind`, CR-45): `kind: business` → bank header sub-label "Business account"; `kind: personal` (the default) → the screen's own sub-label ("Payments", "Payment request", "Confirm payment"). Either way a "From account" row with the nickname (e.g. "Ruchelune · current account") above the payee, so the player sees whose money it is.
- Consequence playback: a new debit row appears with `--color-warn-bg` for 1 s (reduced motion: static for 3 s).

### 3.7b Fairmeasure, the regulator (CR-38; a tool, not a device)
- **Where:** the HUD menu item "Fairmeasure register", in every chapter, shown only once the register lists at least one authorised firm (an empty register is never offered) (the phone's home screen; never a link in a message). The name comes from the brand registry (`content/brands.yaml`, brand `fairmeasure`, DS1 Keep), never hard-coded. Opens a modal dialog over the scenario; the timer is frozen while it is open and the scenario and HUD are inert (as Settings). Tab and Shift+Tab stay inside the dialog from any element, the heading included. Escape, the scrim or "Close" closes it and returns focus to the Menu button.
- **Content:** title "Fairmeasure" (plain bold wordmark), intro "The financial regulator's own lists. You opened this yourself, not from a message.", two ARIA tabs (arrow keys, Home, End): "Register of authorised firms" (name, "Address: …", "Phone: …" masked) and "Warning list" (names). Each tab ends with its rule in bold: "Not on the register means don't pay, even when the warning list is clean." / "A name missing from this list proves nothing: scammers change names." Empty list: "No firms listed." **No search box, no input of any kind.**
- **Result card** (a `check_official_list` outcome with `register`): on the consequence step under the caption, a framed card "Fairmeasure Register check" with the result as a list: "{firm}: on the register of authorised firms." + "Contact it only on the register's own details:" + address + phone · "{firm}: not on the register." + "Warning list: no warning found." + "Not on the register means don't pay, even when the warning list is clean." · "{firm}: on the warning list. Not on the register." + "Don't pay."
- **Coach mark** (once, wherever the register is first used): "Two lists: firms allowed to sell investments, and firms the regulator warns about." with "Got it" After "Got it", focus moves to the dialog heading (panel) or to the card heading (result card), never back to the scenario.
- **Headings:** the dialog heading is the dialog's h2; the result card heading is an h4 under the consequence step's h3 ("What happened").
- **Phone mask:** the register's phone hides at least 4 digits behind • (validator).
- **Look:** the game's own neutral surface tokens (`--color-surface`, `--color-surface-sunken`); no crest, seal, flag, star ring, scales icon or colour scheme of any real regulator or EU body (Red Line 1). Tabs and buttons ≥ 44 px.

### 3.8 Sign-in and e-ID prompts (`auth`, Gatewren)
A sheet inside the phone with the Gatewren header (plum, 24 px mark, "Gatewren"). Three prompt types, same skeleton:
```
{Title}                                   Sign-in request | Sign a document | Sign in on another screen
{Service} · {what}                        Larchwick Bank · web sign-in
Where:  Near Lyon, France (approximate)
Device: A browser on a computer
When:   Just now
[ Number on the other screen: 47 ]        (number matching, optional)
{Question}                                Did you just try to sign in?
[ No, it wasn't me ]   [ Yes, approve ]
            Report this request
```
- **QR-login prompt** ("Sign in on another screen"): after scanning a QR with Gatewren, the prompt says "You are about to sign in on: A browser on a computer, Near Lyon. Only continue if that screen is in front of you and you started this." Same buttons.
- **e-ID signature**: shows the document title and the requesting service; question "Do you want to sign this?".
- The two decision buttons are equal size and weight (neutral, 52 px), stacked on `sm` with "No, it wasn't me" first. In Tense or higher, the `pressure` style goes on whichever button **the message is pushing** (§6.3).
- Each context row is checkable. Repeated prompts stack with a counter badge "3 requests" (text).
- Never real service, browser or OS names.
- **On a call** (CR-39(a)): a prompt reached from a call (e.g. "Open Gatewren as he asks") shows the CR-31 on-call bar (§3.7) above the Gatewren header: caller, running time, Hang up (to the prompt's own options, verify first), the caller's beat-bound lines inside the bar, and "Choose how to end the call:" over the options in the tray. Victim side only: the prompt the player sees, never what happens on the other screen.

### 3.9 Letter (`letter`)
- Paper card (`--letter-paper`, `--letter-ink`, `--font-letter`, `--shadow-2`, rotated −1°; 0° in reduced motion). Max 560 px; on `sm` full width minus 16 px; pinch-zoom allowed plus **+ / −** buttons (40–200 %).
- Types: official letter (letterhead), delivery card (A6, dashed tear-off edge, tick-boxes, optional QR), doorstep note (italic `--font-letter`, lined paper; no script fonts).
- Checkables: letterhead, reference, masked phone number, QR destination (no payee or IBAN on letters: `payee` is rejected outside banking, email and messenger, CR-22). Foreign text has the inline Translate toggle.
- Real text in `<article aria-label="Letter from …">`; paper texture is CSS only.

### 3.10 Social feed (`social`)
Card: avatar, name, "Sponsored" (text), illustration (fictional people only), body, in-ad CTA (inert unless authored), counts as text. Checkables: advertiser, link, image ("This image appears in many unrelated ads").

### 3.11 Marketplace app (`marketplace`, e.g. Swaploft; CR-33)
A phone frame in the marketplace brand (`message.app.brand`: header with the brand mark and name, sub-label "Notices" or "Messages"; region "Phone: {app}"). Never a real marketplace's layout.
- **Listing card** (`message.listing`), under the header: small caps label "Listing", then one bordered checkable (≥ 44 px) with the title (bold) and the price; it is the first `reference` checkable. Other `references` follow as reference 2, 3.
- **System notice** (`message.notice: true`): a card in the thread with a sender row (brand mark, "{app name}" as the checkable sender, "Notice" muted), the body and the Translate toggle. Heading "{app}: notice".
- **Buyer chat** (no `notice`): a chat head with avatar, the buyer's handle as the checkable sender ("user 2208"; never a name pointing to an ethnicity) and "Chat in the app"; the message and follow-ups are bubbles as in Kettle. Heading "{app}: chat with {handle}".
- Thread history ("Earlier"), Check, tags, the Translate toggle, timers and follow-ups behave exactly as in the messenger (§3.3). No "Not in your contacts" banner (in-app accounts). Notifications from a marketplace beat elsewhere are labelled "App message".

---

## 4. Check (inspect) and tagging

### 4.1 Concepts
- **Checkable**: every visible message element (§3). Each opens a **Check card**.
- **Check mode**: optional mode (toggle in the tray's Details row and in the menu) that shows the affordance on every checkable.
- **Cost**: the first Check of each distinct element costs `timers.inspect_cost_seconds` (2 s), charged when the card opens by deliberate action (long-press, tap in Check mode, click, Enter, list button). Re-opening is free. Timers off: no cost shown. The timer **keeps running** while a Check card is open (the 2 s is the price of checking; freezing would turn the card into a free pause). Translation, by contrast, freezes it (§4.8, §6.1).
- **Tag**: "Mark as suspicious" on a checked element (§4.7).

### 4.2 Input methods (all open the same card) [U14, U15]
| Input | Gesture | Notes |
|---|---|---|
| Touch | **Long-press** (`--dur-longpress` 450 ms). A ring fills around the touch point (reduced motion: no ring, "Hold…" text). Optional haptic. | Mirrors "press and hold a link to preview it". `-webkit-touch-callout: none; user-select: none` on checkables only. |
| Touch | Turn on **Check mode**, then tap any checkable. | Single-tap alternative (WCAG 2.5.1). |
| Touch, plain tap (Check mode off) | Toast hint only (§3.2). | Distinguished by a preceding `pointerdown` with `pointerType: touch`. |
| Mouse | **Click** opens the card (cost charged). Hover for `--dur-hover-hint` shows a tooltip "Check (click)" that reveals nothing, so hovering is free and costs nothing. | Tooltip meets 1.4.13: stays while the pointer is over the element or the tooltip, Esc dismisses without moving the pointer, never obscures the element. |
| Keyboard / AT | Tab to the element, Enter/Space opens the card. A click event *without* a preceding touch `pointerdown` (screen-reader activation) also opens the card. | `I` (if enabled, §10.6) jumps to the Details list. |
| List | "Details you can check" list (§4.6). | Primary keyboard and SR path. Same content, same cost. |

### 4.3 Affordance — never `outline` [U3]
- **`outline` is reserved for the focus ring** (§10.4). Check affordances use `box-shadow` and a `::after` badge only.
- Idle (Check mode off): no decoration beyond what the real UI shows.
- **Check mode on, or hover**: `box-shadow: 0 0 0 var(--check-affordance-w) var(--color-surface), 0 0 0 calc(var(--check-affordance-w) * 2) var(--color-accent)` drawn as a *dashed* look via a `::after` element with `border: 2px dashed var(--color-accent)` inset −4 px, plus a 20 px magnifier badge top-right. Focus adds the solid 3 px outline *outside* that (offset 6 px), so both are visible at once.
- **Checked**: magnifier-tick badge (16 px) after the element + visually hidden ", checked".
- **Marked suspicious**: flag-outline badge (16 px) after the element + visually hidden ", marked suspicious".

### 4.4 Check card
- **Mobile (`xs`/`sm`/`md`)**: bottom **sheet**, `aria-modal="true"`, everything else `inert` while open; max `--sheet-max-h`; top corners `--radius-xl`; `--shadow-3`; scrim `--color-scrim`. The checked element is scrolled into view above it [U11].
- **Desktop (`lg`)**: **non-modal popover**, 360 px, anchored to the element without covering it; no focus trap; Esc or close returns focus.
```
┌ 🔍 Link ──────────────────────────────── ✕ ┐  magnifier + element type + close (44 px)
│ YOU SEE                                    │
│   trundle-zoll.example/p/8812               │  as displayed
│ IT REALLY GOES TO                           │
│   https:// ┃trundle-zoll.example┃ /p/8812   │  mono; owner part boxed (2 px border) + bold
│   ↑ The boxed part tells you who owns it.   │
│ {reveal text}                               │
│ [⚑ Mark as suspicious]   (aria-pressed)     │  §4.7
└─────────────────────────────────────────────┘
```
- **Owner-part rule (settled)** [sceptic]: the owner part is the **last two labels** of the host (`<name>.<tld>`), where the TLD is one of the reserved single-label TLDs the game uses (`example`, `test`, `invalid`). The game uses no multi-label suffixes, so no public-suffix list is needed. Examples: `trundle.example` → `trundle.example`; `desk.waymarker-network.example-sso.test` → `example-sso.test`; email `it-desk@waymarker-helpdesk.example` → `waymarker-helpdesk.example`. Validator: every host ends in one of the three TLDs and has no label equal to a TLD-like suffix list (`co`, `com`, `org`…) immediately before it.
- Sender anatomy: "Shown as: Trundle" / "Actually from: +49 ••• ••• 0173". Payee anatomy: "You typed: Trundle GmbH" plus the authored reveal. The Check card never states an account holder; the holder name appears only in the close-match result card (§3.7).
- Never "red flag", "scam", "safe", "fake", "legit". Reviewers check `reveal` strings for this.
- The card contains **no Translate toggle and no translation of its own** [U7]. Exception (producer ruling R1, 2026-11-19): when the message is not in English and the element has an authored translation (`ask.translation`, `claims[].translation`), the card shows a "Translation" row (`lang="en"`) under "You see": a verbatim copy of that translation, for second-language players. It is free and is not a checkable.
- Close: ✕, Esc, scrim tap, swipe-down (button alternative). Focus returns to the element.

### 4.5 Coach marks
Coach bubbles are `role="note"`, skippable, never block the tray. Chapter 0 introduces one mechanic per scenario (GDD §16). Later chapters may add a coach mark for a new device moment, shown **once per game** on first use and recorded in `save.coachMarks` (snake_case id):
- **Payee check** (`payee_check`, GDD §23.5, CR-23): appears inside the name-check card after the footer, title "Tip", text "Doesn't match? Stop and call. Close match? Compare the name it shows with your own papers. Matches? It only shows whose account it is." While open, the timer is **frozen** (freeze reason `coach_mark`) and the HUD timer reads "Paused while the tip is open". It closes on "Got it" (focus returns to the result paragraph), on any card action, or on any Check use.

### 4.6 "Details you can check" list [U10, coordinator correction]
- Disclosure button in the tray/rail. Expanded: one row per checkable, labelled by *what* it is ("Sender", "Link in the message", "Page address", "Payee name"), in reading order.
- **The list never shows a total count** (balance v3.2): the label is "Details you can check · k checked", for sighted and SR users alike, in every chapter. A total let players tell fraud (more checkable details) from genuine. The neutral filler "Nothing unusual here" is used for every element without an authored reveal.
- Activating a row expands the same content as the Check card inline (same cost), including the tag toggle.
- Visible to everyone, not only SR users.

### 4.7 Tag toggle: "Mark as suspicious" [U2]
- Control: `<button type="button" aria-pressed="false">` with flag-outline icon + text **"Mark as suspicious"**; pressed state: filled flag + text **"Marked suspicious"** (`aria-pressed="true"`), plus a 2 px inset box-shadow (not outline). 44 px tall.
- Placement: in the Check card directly under the reveal, and in each *checked* row of the Details list, **immediately after the item in DOM order**. The same toggle state is shared by both places.
- Available only after the element has been checked at least once (you can't tag what you haven't looked at).
- Cost: none (balance `tag_cost_seconds: 0`). Toggling **never moves focus** and never closes the card.
- Feedback: the element gets the flag badge (§4.3); polite announcement "Marked suspicious" / "Mark removed" (player-caused priority, §10.5). No right/wrong feedback until the debrief.
- **Genuine messages**: the toggle behaves identically (no points, no cost, shown in debrief layer 2 as "You marked this. It was fine here.").
- **Quoted examples** (`context: quoted`, e.g. Teo's screenshot): the toggle appears on elements inside the quote card exactly as elsewhere; the debrief scores them like fraud red flags.
- **Drills**: toggle available; never scored (balance `drills_count: false`).
- Notebook: only flags confirmed correct in the debrief are added.
- SR name: "Mark {element label} as suspicious", pressed state announced by the platform.

### 4.8 Translate toggle [U7]
- Under every foreign-language bubble, letter block or page block: a text button **"Translate"** / **"Show original"** (`aria-expanded`, controls the translation block). 44 px hit area, `--fs-sm`.
- The translation appears **inline below the original**, in `--color-text-muted` italics with `lang="en"` and a "Translation" label. Free (0 s), **freezes the timer while expanded** (balance `freeze_while_open: translation`), not a checkable, not counted in Details, never a red flag, never inside a Check card except the verbatim "Translation" row (§4.4, ruling R1).
- Setting "Always show translations" (default off) expands all of them. **Freeze (producer ruling R2, 2026-11-19):** a translation opened by hand freezes the timer while it is open; a translation auto-opened by the setting freezes it for reading time only, max(1.5 s, 0.3 s × words), then the timer runs again. A toggle with nothing to translate never freezes.
- **Inline spans** (CR-45, WCAG 3.1.2): an action label or outcome line may mark foreign words as `{lang:es}…{/lang}`; they render as `<span lang="es">` (buttons, "What now?" choices, the bank card, the consequence caption, the debrief "You chose" lines). An action or outcome with `translation` gets the same Translate toggle, beside the button (never inside it) or under the caption.

---

## 5. Training pages and the SIMULATION marker (Red Line 2)
Applies to every form-like UI in any device (logins, payment, card entry, banking transfer, marketplace checkout, e-ID web pages), **genuine and fraud alike**, so the marker is never a tell.

### 5.1 Visual
- **SIMULATION strip**: a sticky zero-height wrapper at the top of the page scroller holds a pill aligned right: `--color-sim-bg`, 1.5 px `--color-sim-border`, `--color-sim-text`, `--fs-xs`, bold, `--tracking-caps`, uppercase **"SIMULATION · nothing is sent"** (on `xs`: "SIMULATION"). 28 px visual, 44 px hit area, opens an explainer.
- **Form frame**: 1.5 px dashed `--color-sim-border` around the form container. This is a *border*, never an outline.
- **Watermark**: tiled diagonal "SIMULATION" at `--color-sim-watermark`, behind the form only, `aria-hidden`.
- Iris is reserved for this marker.
- Page `<title>` and landmark label include "Training page" (GDD §5).

### 5.2 Demo fields
- Fields are **`<div role="textbox" aria-readonly="true">`** styled like inputs, pre-filled with demo values (`sam@waymarker-network.example`, `••••••••`, card `4000 •••• •••• 0002`). Not focusable (`tabindex` absent), not editable. No `<input>`, no `<form action>`, no `name`/`autocomplete`, so browsers and password managers never react.
- Each field: `aria-describedby` → one shared, static note under the form: **"Demo fields. Nothing can be typed or sent."** The note is plain text (reachable in browse mode, not in the Tab order) [U16].
- The page's own submit button (`<button type="button">`) triggers the authored action of that kind (`enter_details` / `pay`) if one exists; otherwise `aria-disabled` with the note as its description. Recommend CSP `form-action 'none'; connect-src 'self'` to `frontend-engineer`.

### 5.3 Names [U12]
Accessible names **start with the visible text**; explanations go in `aria-describedby`:
- Pill: name "Simulation, nothing is sent"; description "This is a training page inside the game. It cannot send anything, anywhere."
- Region: "Laptop: Browser, training page".

---

## 6. Timer, stress, pressure, pause

### 6.1 Timer (HUD)
- Pill: hourglass + "0:45" (tabular numerals) + 3 px progress bar at the bottom; `flex: none`, min width `--hud-timer-min-w`.
- Neutral (`--color-text` on `--color-surface-sunken`) until 10 s; then `--color-warn-bg`/`--color-warn-text` **and** a static diagonal stripe on the bar **and** the text adds " left". Never red, never blinking.
- Cost chip "−2 s" overlaps the pill corner for 1 s (reduced motion: 2 s, no movement).
- Expiry 1: in-device escalation, "+20 s" chip. Expiry 2: tray locks, scored as dismiss.
- **Freezes** [U9] while any of these is open: pause menu, Settings, Help, debrief, "Take a breath", any translation the player expanded by hand (balance `freeze_while_open`; one auto-expanded by "Always show translations" freezes for reading time only, max(1.5 s, 0.3 s × words), §4.8 ruling R2), a scenario `setup` lead-in for its reading time (same rule, every timer mode, CR-27), an open coach mark (freeze reason `coach_mark`; the pill text reads "Paused while the tip is open", §4.5). A frozen timer shows a pause glyph and the visually hidden text "paused".
- **Modes**: Standard, Extended (×2), Off. Chosen in onboarding **before the first timed scenario** (0-3); **Extended is pre-selected when the device asks for reduced motion**; changeable any time in Settings. No score depends on the mode.
- **Calm preset** = timers Off + Pushy follow-ups Off + Call lines: Step through. With timers Off the pill becomes a "Timers off" chip (breath icon + text).
- SR: `role="timer"` with `aria-live="off"`; announcements only at **half time** and at **10 s** (§10.5); a **"Time left"** item in the menu (and `T` shortcut if enabled) announces the remaining time on demand.

### 6.2 Stress meter (HUD)
- Icon + 3 segments + word: Calm (flat line, 1 segment), Tense (single wave, 2), Overwhelmed (triple wave, 3). Segment fill is `--color-text` at decreasing opacity; state is carried by count, icon and word.
- `role="meter"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow`, `aria-valuetext="Stress: Tense"`. Announced only on state change.
- Fill animates over `--dur-slow`; reduced motion: instant.

### 6.3 Pressure presentation [LI-1, sceptic]
| State | Device layer | Game layer |
|---|---|---|
| Calm | normal | every action `neutral` |
| Tense | pushy follow-ups every 12 s **if the setting is on**, from whoever the message is from (genuine senders too) | the action **the message is pushing** gets the `pressure` style: fill `--color-pressure`, text `--color-on-pressure`, bold. Position, order and focus never change. |
| Overwhelmed | follow-ups every 8 s (if on); optional heartbeat audio (off by default); **static vignette inside the device layer** | same pressure style; Pause gets a 2 px inset box-shadow and the label "Take a breath" |

- **What gets the style**: the action with `pressure_target: true` in the scenario (schema request, §14). It is **required on every scenario whose message asks for something**, genuine or fraud (on genuine: the `proceed` or in-message action; on fraud: the action the scammer wants). If no action is marked, **no action is styled**. There is no fallback to "first comply" or any other class-based rule.
- The style is driven **only by the stress state**, never by truth, difficulty or class.
- **Debrief callouts** (layer 2, GDD §8), shown twice per game:
  1. First time any pressure styling appeared: "The bright button is the one the sender wants you to press."
  2. First time it appeared on a **genuine** message: "Same bright button, and this time the request was genuine. Bright buttons show what the sender wants, not whether to trust it."
- **Vignette** [U6]: `box-shadow: inset 0 0 120px 40px var(--color-vignette)` on a `::after` of the **device viewport**, `z-index: var(--z-vignette)` (inside the device layer, below notifications, tray, sheets and HUD), `pointer-events: none`. Strength capped at alpha 0.12 in both themes so every device-layer pair stays AA (§13.4). Fades in over `--dur-slow` (reduced motion: instant). No pulsing, zero flashes. It never covers the HUD or tray.

### 6.4 Pause and "Take a breath"
- HUD button (44 px): breath icon + "Pause" (icon only in Compact/Two-row; name stays "Pause").
- Press → a **non-modal "Take a breath" panel** over the device area (GDD A5): it **does not take focus** and does not trap it; the HUD and tray stay usable. The panel: a circle that grows for 2.5 s ("Breathe in") and shrinks for 2.5 s ("Breathe out"), `--ease-in-out`; reduced motion: static circle with alternating words and a 5…1 countdown. Copy under it: "Real companies give you days, not seconds." Ends after 5 s; "Back to it" button ends early.
- The breathing words are **not** a live region. One polite announcement on open: "Taking a breath. Timer paused."
- Effect: stress −25; timer −5 s (0 with timers off). Timer frozen while the panel is open.
- Cooldown 10 s: `aria-disabled="true"`, visible "Pause · 8 s"; accessible name stays "Pause".

### 6.5 Motion inventory
| Motion | Full | Reduced |
|---|---|---|
| Device banner | slide `--dur-base` | instant |
| Sheet / popover | slide/scale `--dur-base` | instant |
| Long-press ring | 450 ms fill | "Hold…" text |
| Breathing circle | scale over 2 × `--dur-breath` | static + text |
| Stamp | scale 1.15→1 `--dur-stamp` `--ease-stamp` | instant |
| Map travel | dotted path 800 ms | instant |
| Debit highlight | 1 s | static 3 s |
| Call lines | revealed at reading pace | same pace (it is content timing, not motion); Step through available |
Reduced motion is on when the OS asks **or** `data-motion="reduced"`; `data-motion="full"` forces full.

---

## 7. Consequence and damage control
- **Consequence** plays in-device (≤ 15 s) with a game-layer caption: info icon, `outcomes.*.narrative`, "Continue". No red screens, no alarms. It follows **every** resolved scenario (and every boss beat) that has a narrative or an expired timer (then the caption is "The deadline was fake. Nothing happened." on fraud, and "Time ran out. This one was genuine, and its deadline was real." on a genuine scenario; layer 2 "What happened" uses the same line), including the last beat, before damage control or the debrief (layer-1 ruling 2026-11-19). Focus moves to its heading ("What happened", `h3`); the caption comes straight after it. Damage control does not repeat the caption.
- **Damage control** (GDD §9): heading "Limit the damage", sub "This happens to careful people every day." Prompt: "Pick the step you'd do first, then 2 more." For a cast member's damage control in a drill (`recovery_for`, CR-32): "Pick the step {first name} should take first, then 2 more."; a scenario's own feedback on a harmful pick is shown in that person's voice ("Mateus: Another code? …"), generic feedback is not attributed. 5–6 options as toggle buttons (`aria-pressed`), 56 px; selected items show their order number ("1st", "2nd", "3rd") as text. "Move up / Move down" buttons on selected items (no drag). Counter "2 of 3 chosen". Sticky "Done" bar (scroll-padding §1.3; static under 500 px height). Feedback lists each pick with check-seal "Helps" or info "Doesn't help: …".

---

## 8. Debrief — two layers [FI-1, U4, LI-2–4]

### 8.1 Layer 1 (always shown, ≤ 40 words, one screen at 375×812)
Focus lands on the `h1`. Reading and focus order (nothing of layer 1 comes before the `h1`):
1. **`h1` = verdict + tell in one heading** [U4]. After a fall the heading starts with "This could happen to anyone." (Red Line 5, never on a good outcome) on its own line. The outcome narrative is **not** in layer 1: it was the consequence caption (§7) and is repeated in layer 2 under "What happened". Example: "**This was a scam:** the link went to trundle-zoll.example, not trundle.example." The verdict part is styled as a chip *inside* the heading (tag-crossed icon, `--color-flag-bg`/`--color-flag-text`); genuine: check-seal + "This was genuine:" with `--color-ok-*`. Genuine tells say why it was safe to act and never present a reassuring detail as proof ("It asked for nothing and matched your order. The sender fits, but that isn't proof on its own.").
2. **What works**: one line naming the verification step ("What works: open the Trundle app yourself."), from `debrief.layer1.what_works`. **"You chose" line**, only when the scenario (or a boss beat) scored fewer than 3 stars. **Layer 1 shows at most one "You chose" line (CR-15).** On a boss it is the line of the beat with the fewest stars (on a tie, the latest beat); the other beats' lines move to layer 2 ("Your other choices"). The line uses: "You chose: <action label>." using the `label` of the action that cost the stars:
   - a fall: **no line in layer 1** (the kind line in the `h1` holds the slot); the decisive action's label (always, even after an engage) opens layer 2 "Your other choices";
   - **an engage cap** (GDD §6: engage on fraud caps at ★★): the label of the **first engage action** the player picked, **not** the later action, also when that later action was a dismiss or report (producer ruling, T-2.1: the engage is what cost the stars and teaches more). E.g. 1-9 beat 3: "You chose: Call back this number." even though the player then called the number on the card; "You chose: Open the link." when the player then closed the page;
   - otherwise a report or dismiss: the decisive action's label;
   - a verify followed by comply, proceed or report (GDD §6): the follow-up action's label;
   - timer expiry: "You let the timer run out."
   - **a "What now?" built-in** (ruling L1): a descriptive past-tense line, never the button label: "You hung up and left it there." (`done`), "You hung up and reported the call." (`report`), "You hung up and called a number you know." (`call_back_known`, rarely shown because it scores ★★★). Authored actions keep "You chose: <label>." because labels already describe behaviour;
   - **over-caution on a genuine message** (ruling L4, every chapter): never a bare label next to low stars. Report on genuine: "You reported it. Careful is good; this one was safe."; dismiss on genuine high stakes: "You left it. This one was safe to act on."; the same when the player started it (`player_started`): "You left it. This one was safe; it was yours." A timer that ran out on a genuine message: "You let the timer run out. This one was safe to act on." (`you_chose_timer_genuine`, R21); on fraud "You let the timer run out.". These lines are picked by class × truth, whichever button got there (an authored action or a built-in).
   Never shown on arc debriefs. On a ★★★ standard debrief the same slot holds "That is the habit that works." (6 words), only when every beat scored ★★★. **After a fall the kind line in the `h1` takes the slot**: layer 1 shows no "You chose" line, no best line and no "Next time" line; the lead beat's line moves to the top of layer 2 "Your other choices" (layer-1 ruling 2026-11-19).
   **Displayed ★★★ but a beat scored lower** (a boss's rounded mean; ruling L1 as amended by the budget ruling): no "You chose" line in layer 1. If the lead beat ended dismiss-class on fraud ("Leave it there", ignore, a timer), the slot holds the pointer **"Next time: call a number you know."** (7 words; it names the ★★★ habit, because reporting scores ★★ like "Leave it there"); otherwise the slot is empty. Only a boss can show this (the engine checks the role, the validator counts it only on a boss). The lead line moves to the top of "Your other choices".
3. **Stars**: 3 icons + "3 of 3 stars" (`role="img"` with that name).
4. **Already clicked?** one line linking to the full advice in layer 2 ("Already clicked or paid? See what to do").
5. Buttons: **More** (opens layer 2, `aria-expanded`) and **Continue**.
- **Word budget (validator, balance `debrief_layer1_max_words: 40`). Rule: layer 1 never renders more than 40 words, in the worst case.** (Layer-1 ruling 2026-11-19.) For each scenario the validator (`scripts/lib/rules.ts`) checks:
  - standard: `words = fixed (14) + wc(tell) + wc(what_works) + slot`;
  - arc: `words = fixed (10) + wc(tell) + wc(what_works) + wc(safeguarding_line) + (anyFall ? wc(debrief_no_shame) : 0)`;
  - `slot = max(wc(outcome_best) = 6; anyFall ? wc(debrief_no_shame) = 5 : 0; the longest line that can actually appear in the slot)`; there is no flat 10-word slot. Lines: every action, "What now?" extra and built-in that can leave the scenario (or a boss beat) below ★★★ and is **not a fall**, engage actions included, counted as the exact text `choiceLineText()` renders (`src/engine/choiceText.ts`, shared with the debrief): authored `"You chose: <label>."`, built-ins `you_chose_whatnow_*`, over-caution on genuine `you_chose_report_genuine` / `_dismiss_genuine` / `_dismiss_started` (picked by `overCautionOf()`, the engine's own rule); "You let the timer run out." (6) when timed; and on a boss with a dismiss-class ending on fraud (dismiss action, "Leave it there" or a timer) `next_time_after_hang_up` (7).
  - Home totals after T-2.7 (validator): home-01 40, home-02 36, home-03 40, home-04 37, home-05 40, home-06 39.
  - A render test (`tests/unit/layer1-budget.test.tsx`) plays every path of every scenario in every `content/scenarios/<chapter>` folder, renders layer 1 and counts words per block element; the worst path must stay ≤ 40.
  - **fixed** (`LAYER1_OVERHEAD`, read from `ui.json`) = **14** for standard: the longer verdict chip ("This was a scam:" 4), "What works:" 2, "Already clicked or paid? See what to do" 8. **10** for arc: "The habit:" 2, "Already did this? See what to do next" 8.
  - Narratives and "The deadline was fake…" count 0: they are no longer in layer 1.
  - `anyFall` = some action in the scenario is a fall (comply or proceed on fraud).
  - Action labels are capped at 8 words (validator).
  - **Counting** = `wordCount()` in `scripts/lib/rules.ts`: split on whitespace and count tokens that contain a letter or digit ("isn't" = 1, "–" = 0); a domain or URL counts as one word. A `{nickname}` placeholder counts as one word. Item 3 (stars) and item 5 (buttons) are not counted.
- **Arc layout** (`debrief.variant: arc`, GDD §10.2). Focus lands on the `h1`. Order:
  1. `h1` = `debrief.layer1.tell` ("Things to notice"), **no verdict chip**.
  2. "The habit:" + `debrief.layer1.what_works`.
  3. Slots 2–3: `debrief.safeguarding_line` as a link to the "Talk to someone" support line (help list item 5).
  4. **"Already did this? See what to do next"**: a link that opens layer 2 at "If you already…" (`debrief.already_clicked`). The advice is never inline in layer 1.
  5. Buttons: **More**, **Continue**, and **Tell me now** (behind its confirmation). No stars, no points, no "You chose" line.
  - Why worst case and not "exclude the choice line": 50 words plus stars and two buttons no longer fits one screen at 375×812 at 200% text, and the player who just got it wrong is the one who most needs a short, readable layer 1.
- Points are **not** in layer 1 [LI-4].

### 8.2 Layer 2 ("More", inline disclosure below layer 1)
0. **What happened** (`h2`): the outcome narratives (boss: one paragraph per beat, each said once) and, on a timer expiry, the same line as the consequence caption (fraud: "The deadline was fake. Nothing happened."; genuine: "Time ran out. This one was genuine, and its deadline was real.") Then **Your other choices** (`h2`): the lines layer 1 does not show, in beat order, with the lead line first when layer 1 shows none (after a fall, or ★★★ displayed with a lower beat). On a boss each line carries its beat and stars (ruling L1): "{beat} ({stars} of 3 stars): {line}", e.g. "Call from Waymarker IT (2 of 3 stars): You hung up and left it there." The beat name is the beat's device heading (§10.3). Single-beat scenarios show the plain line.
1. **What gave it away** (`h2`). Each flag: flag icon + text + status:
   - flags bound to a checkable: "You marked this" (filled flag) / "Not marked" (outline flag);
   - flags that live in the message text (pressure, request): **"In the message"**, with no status [LI-2];
   - wrong tags: "You marked this. It was fine here." (info icon), plus "(this cancels the spotting bonus)" when a bonus was possible. **Decoys of `type: caller_id`, `sender` or `logo` on fraud** (ruling L2) say instead: "You marked this. Fair instinct, but a faked number can show the same saved name, so it can't tell you which this is." (caller ID), "…a real message shows the same name…" (sender), "…a real message shows the same logo…" (logo). The engine sets `DebriefWrongTag.type` and `fairInstinct`.
   - Summary: "You spotted 2 of 2 you could mark."
   - Sender flags always carry the caveat "Even a familiar sender name can be faked." [LI-3]
2. **How to check this on a real phone**: one line ("Press and hold a link to preview it before you tap.").
3. **If you already…** (`h2`) split by situation, each a short ordered list [sceptic]:
   - **Clicked the link** (but typed nothing): close it; don't enter anything; delete the message.
   - **Entered your details**: change that password now (and anywhere you reused it); turn on two-step sign-in.
   - **Paid or gave card details**: block the card in your banking app; call your bank on the number on your card; report it (the "Where to report" list).
   Sub-headings (CR-45): an authored `already_clicked.headings.<situation>` wins; else the game's own, with `clicked` following the scenario's own action ("Clicked the link", "Called the number they gave", "Replied", "Scanned the QR code"; several kinds: "Opened, called or replied"; interrupts not counted); arc debriefs keep the arc wording. Content comes from `debrief.already_clicked` split into `clicked / entered_details / paid` (schema request §14; wording by game-designer, facts by fraud-researcher). "Report it" must name the channel type [LI-5, routed to content].
4. **Habit card** (mini, §9.1).
5. **Pressure callout** (only the two times in §6.3).
6. **Which pressure did they use?** (optional, unscored): toggle chips for the 9 levers (urgency, authority, fear, greed, helpfulness, affection, secrecy, small amount, social proof), "Check my answer" and "Skip" equal weight.
7. **Learn more** (`h2`): sources from `content/sources.yaml`; external-link icon + "(opens outside the game)"; links carry `target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"`. Offline: titles shown, links disabled with "Available when online". Only place real organisations appear.
8. **How the stars and points were worked out** (`<details>`): stars, points, tag bonus, Inspector rating contribution [LI-4].
- Footer: **Continue** (primary) + Replay. Fixed footer obeys §1.3 and becomes static under 500 px height [U5].

### 8.3 Half-day stop screen [FI-2]
After the morning block (balance `half_day_split`): game-layer card, heading "Good place to take a break", body "4 messages left today. Your progress is saved.", progress dots (filled/outline + text "Morning done: 4 of 8"), buttons "Keep going" (primary) and "Back to the map". A progress indicator "3 messages left this morning" sits in the menu and the HUD progress chip at all times. On resume, stress resets to 10 (shown as "Calm").

---

## 9. Habit card, passport stamp, map

### 9.1 Habit card
- 300×400, `--radius-lg`, surface + 1 px border; mini variant full width × 120 px. Wrapper is a `<section aria-labelledby>` [U16].
- Anatomy: 96 px illustration band (original 2-colour line art per LO), title `h3` ("Open it yourself"), the habit sentence, a 2-line example, divider, "Already clicked?" one-liner, status footer.
- Status by icon + text (+ colour): **Earned** (outline seal + "Earned"), **Mastered** (filled seal `--color-stamp-gold-fill`, `--color-stamp-gold` border, second border line, "Mastered"). Locked: dashed border, title visible, "Play to earn this card".
- Print: 6 per A4 (2×3), black on white.

### 9.2 Passport stamp
- Oval SVG 160×120: city name on the top arc, in-game date, a generic city glyph (no trademarked landmarks), tier word at the bottom.
- Tier = **word + ring count + colour**: BRONZE 1 ring; SILVER 2 rings; GOLD 3 rings + 8 rays.
- Stamp screen copy (GDD §7): Gold — "You spotted the red flags, checked when it mattered, and didn't report genuine messages." Silver/Bronze copy states what to do for the next tier in plain words, under "To reach silver next time:" / "To reach gold next time:"; the spotting item shows the net count (ruling L3): "Spot at least {n} red flags. Each mark on a safe detail takes one off. Your count: {net}." (`net` floored at 0). Summary line (ruling L3; gross and wrong shown apart, so effort is never shown as zero; stamps still use net): "Red flags you spotted: 7 of 8 · Marks on safe details: 3 · Genuine messages you reported: 0 · Harmless messages you double-checked: 1". "x of R" is `correctShown = min(R, correct marks)`.
- Fixed rotation per city (−6°…+6°), static `feTurbulence` roughness. Award: `--dur-stamp` drop; reduced motion: appears. SR: "Passport stamp: Berlin, silver."

### 9.3 Europe map
Original illustrated map (paper land, `--p-sea-100` sea, dotted borders), city pins as stamps-in-waiting; locked pins outline + "Locked". SVG plus an accessible "Chapters" list as the primary keyboard/SR path. No network.

---

## 10. Focus, keyboard, screen readers

### 10.1 Landmarks
`<header>` HUD → `<main>` (device region, then "Your options") → `<aside>` notebook. First focusable: **"Skip to your options"**. Live regions: `#announcer-polite`, `#announcer-assertive` (assertive only for "Scenario ended").

### 10.2 Tab order in a scenario
Skip link → HUD (Pause, menu; timer and meter are not focusable but are read in browse mode) → device: message heading (`tabindex=-1`) → checkables in reading order, each followed by its tag toggle once checked → Translate toggles in place → "Show more" → (browser) SIMULATION pill → in-page submit → tray: Details → actions.

### 10.3 Focus moves
| Event | Focus |
|---|---|
| Scenario start | message heading ("Text message from TRUNDLE, 09:40") |
| New beat | new device region heading |
| Interrupt | **not moved**; banner + "View" |
| Check card open / close | card title / back to the element |
| Tag toggle, Translate toggle, pressure style change, Take a breath | **not moved** |
| Action chosen | outcome caption heading |
| Debrief | `h1` (verdict + tell) |
| Damage control | its heading (modal, trapped) |

### 10.4 Focus ring
`outline: var(--focus-ring-w) solid var(--color-focus); outline-offset: var(--focus-ring-offset); box-shadow: 0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-w)) var(--color-focus-halo)` on `:focus-visible`. On checkables in Check mode, `outline-offset: 6px` so the ring sits outside the dashed affordance [U3]. Mock-ups use exactly this ring.

### 10.5 Announcements [U8]
- One polite channel, **priority queue with at most one pending item per category; a newer item replaces the older one in its category**:
  1. call transcript line (from `role="log"`),
  2. player-caused feedback (tag toggled, translation shown, "Time left" query),
  3. timer thresholds (half time, 10 s),
  4. stress state change,
  5. new-message / pusher summary. A scheduled **call** beat is not a message (CR-45): "Incoming call from {caller}." in its own slot (never folded into "N new messages"); a dialled call is "Calling {number}." (category 2).
- **Minimum 15 s between announcements of categories 3–5** (balance `sr_announce_min_interval_seconds`). Categories 1–2 are immediate (they are caused by or needed for the player's current action). A category 1–2 text then holds the single polite region for its reading pace (`linePace`, max(1.5 s, 0.3 s × words)): a category 3–5 item waits in the queue until then and never replaces it before it is spoken (QA CR-30…35 round 2).
- **Coalescing**: messages arriving inside the interval merge into one: "2 more messages from unknown sender". The latest text is always readable in the thread.
- With Pushy follow-ups **off**, no pusher messages are generated at all.

### 10.6 Keyboard shortcuts (A4)
- **Single-key shortcuts are off by default** (GDD A4), can be turned on and remapped in Settings, and work only while focus is inside `<main>` or the HUD and no dialog with its own keys is open.
- Keys: `I` Details list · `P` Pause · `A` jump to actions · `N` notebook · `T` time left · `?` help · `1–5` choose action n → a confirm step appears **inline in the tray** ("Choose: {label}? Enter to confirm, Esc to cancel"), focus moves to its Confirm button and returns to the action on cancel.

### 10.7 Screen-reader names (put in `content/i18n/en/ui.json`)
| Element | Accessible name (starts with the visible text [U12]) | Description |
|---|---|---|
| Checkable | visible text, e.g. "trundle-zoll.example/p/8812" | "Check. Press Enter." (+ ", checked", ", marked suspicious") |
| Check card | "{element type} details" (dialog on mobile) | — |
| Details list | "Details you can check" + ", {k} checked" | — |
| Tag toggle | "Mark {element} as suspicious" (pressed state by platform) | — |
| Translate | "Translate" / "Show original" | — |
| Masked number | "+49, hidden, 0173" | "Number hidden except the last four digits" |
| Address bar | the visible host text | "Owner part: {owner}. Check. Press Enter." |
| SIMULATION pill | "Simulation, nothing is sent" | "This is a training page inside the game. It cannot send anything, anywhere." |
| Demo field | "{label}" (role textbox, read-only) | "Demo fields. Nothing can be typed or sent." |
| Timer | "Time left" | value via announcements and "Time left" query |
| Stress | meter, value text "Stress: Tense" | — |
| Stars | "3 of 3 stars" | — |
| Stamp | "Passport stamp: Berlin, silver" | — |

---

## 11. Settings (first launch + Settings)
First launch offers, in order: **Timing** (Standard / Extended / Off; Extended pre-selected under reduced motion; asked before the first timed scenario if skipped), **Pushy follow-ups** (On / Off), a **Calm preset** button that sets Timers Off + Pushy follow-ups Off + Call lines Step through, and Shortcuts (Off by default).
Full Settings: Timing · Pushy follow-ups · Call lines (Auto / Step through) · Always show translations · Motion (Follow device / Reduced / Full) · Theme (Follow device / Light / Dark) · Text size (100/115/130 %) · Sound (off) · Heartbeat audio (off) · Haptics (off) · Single-key shortcuts (off) + remap. All in `localStorage` only. Settings freeze the timer.

---

## 12. Brand usage inside devices
- Marks appear in app headers (24 px mark + name), avatars (§2.5), letterheads and browser pages. `-mark.svg` up to 40 px, lockup above.
- **Spoofs reuse the genuine brand's mark and name exactly** (GDD: "A logo or familiar name proves nothing"). The tell is always the domain, sender, payee or request, never a slightly wrong logo.
- Prefer `<img src alt="">` next to a visible brand name. Inline SVGs share `id="t"`; rewrite ids if inlining several.
- Look-alike hosts must survive lowercasing (`brands.yaml` rules); capital-letter homoglyphs are display-text only.

---

## 13. WCAG 2.2 AA contrast pairs (measured, sRGB relative luminance)
Text 4.5:1, non-text 3:1. Computed with the WCAG formula; script kept by ux-artist, to be ported to a Vitest check.

### 13.1 Light theme
| Pair | Ratio |
|---|---|
| text `#1C1F2E` / bg `#FBF6EC` · surface `#FFFFFF` | 15.17 · 16.34 |
| muted `#555B73` / bg · surface · sunken `#F2EADB` | 6.23 · 6.71 · 5.61 |
| accent `#1F5FAD` / bg; on-accent `#FFFFFF` / accent | 5.91; 6.37 |
| border `#7D8299` / bg · surface | 3.53 · 3.80 |
| flag `#A3361F` / bg; flag-text `#8A2B17` / flag-bg `#FBE3DA` | 6.28; 7.01 |
| ok `#2E6B3A` / bg; ok-text `#24572F` / ok-bg `#DFF0DA` | 5.94; 7.10 |
| warn-text `#6E4A0B` / warn-bg `#FBEBC8` | 6.73 |
| sim-text `#4A2B63` / sim-bg `#EFE6F7`; sim-border `#6B4C86` / surface | 9.54; 6.99 |
| bubble text / bubble-in `#ECE6DA` · bubble-out `#D9E6F6` | 13.15 · 12.92 |
| link `#1A4F91` / bubble-in | 6.57 |
| on-pressure `#FFFFFF` / pressure `#B4461F` | 5.47 |
| bronze `#7A4A20` · silver `#4F5A68` · gold `#6F5200` / white | 7.43 · 7.01 · 7.28 |

### 13.2 Dark theme
| Pair | Ratio |
|---|---|
| text `#EDE8DD` / bg `#14161F` · surface `#1E2130` | 14.76 · 13.07 |
| muted `#A9AEC2` / bg · surface | 8.18 · 7.24 |
| accent `#8DB8F2` / surface; on-accent `#0F1A2B` / accent | 7.81; 8.54 |
| **border `#7A8099` / surface · bg** (changed in rework 1) | **4.09 · 4.62** |
| focus `#8DB8F2` / bg | 8.82 |
| flag `#F2A08A` / surface; flag-text `#F8C3B3` / flag-bg `#3D1F18` | 7.73; 9.55 |
| ok `#8FD19B` / surface; ok-text `#B9E6BF` / ok-bg `#1B3322` | 8.94; 9.81 |
| warn-text `#F3D08A` / warn-bg `#3A2C10` | 9.18 |
| sim-text `#DCC8F0` / sim-bg `#2E2240`; sim-border `#A88CC8` / surface | 9.56; 5.51 |
| bubble text / bubble-in `#2A2D3D` · bubble-out `#1F3350`; link `#A9CBF7` / bubble-in | 11.15 · 10.43; 8.16 |
| on-pressure `#1A0E08` / pressure `#F08C64` | 7.78 |

### 13.3 Brand pairs (also in `brands.yaml`)
| Brand | Pair | Ratio |
|---|---|---|
| Waymarker | amber `#F2B24C` / ink `#22223B`; ink / white | 8.27; 15.44 |
| Trundle | white / teal `#0E5E63`; mint `#A8E6CF` / teal (non-text) | 7.50; 5.32 |
| Larchwick | white / indigo `#2D2A6E`; sand `#EAD9B5` / indigo | 12.59; 9.05 |
| Thimble & Pine | white / pine `#2F5D3A`; pine / blush `#F6DCD0` | 7.64; 5.85 |
| Swaploft | white / fuchsia `#A8175A`; fuchsia / cream `#FFF6EE` | 7.15; 6.70 |
| Kettle | white / tomato `#B83A1E`; tomato / cream `#FFF5EC`; `#3A1208` / `#F9D9CC` | 5.73; 5.33; 12.46 |
| Gatewren | white / plum `#4B2A5C`; peach `#F6C8A8` / plum | 11.77; 7.70 |
| Wordswap | cream `#FFF3E6` / cocoa `#6E4430`; apricot `#F4B183` / cocoa (non-text) | 7.59; 4.53 |

### 13.4 Under the Overwhelmed vignette (both colours blended at the vignette's darkest point, alpha 0.12) [U6]
The vignette covers only the device layer, so HUD and tray pairs are unaffected.
| Pair (light, overlay `rgb(60 20 10)`) | Ratio | Pair (dark, overlay black) | Ratio |
|---|---|---|---|
| text / device screen | 12.90 | text / surface | 10.48 |
| muted / screen · header | 5.99 · 5.57 | muted / surface · bg | 5.92 · 6.54 |
| bubble text / in · out | 10.46 · 10.27 | bubble text / in · out | 9.15 · 8.69 |
| link / bubble-in | 5.82 | link / bubble-in | 6.78 |
| address-dim / chrome | 5.02 | border / surface | 3.46 |
| border / screen | 3.55 | warn | 7.59 |
| warn · sim | 5.81 · 7.99 | sim | 7.84 |
| Kettle white/tomato · tomato/cream | 5.14 · 4.79 | Kettle white/tomato | 5.26 |
| Trundle white/teal · Larchwick white/indigo | 6.69 · 10.40 | | |
| Wordswap apricot/cocoa (non-text) | 4.00 | | |
Maximum safe alpha found: 0.17 (light, limited by Kettle tomato on cream) and 0.12 (dark, limited by the border). The cap is 0.12 for both.

---

## 14. Hand-off checklist for `frontend-engineer`
- [ ] Import `tokens.css` once; no raw hex in components.
- [ ] Vitest: contrast test over §13 (including §13.4 blends); brand sync test: every colour in `public/brands/<id>*.svg` is in that brand's `brands.yaml` palette, and palette == `--brand-<id>-*` tokens.
- [ ] Vitest/validator: inspectable-count parity (§3); `pressure_target` present on every scenario whose message asks for something; debrief layer-1 ≤ 40 words; owner-part rule; look-alike hosts survive lowercasing.
- [ ] Playwright: HUD layouts at 430, 375, 360, 320, 188 widths × 100/130 % text (§2.1 table as oracle); focus-not-obscured pass (§1.3); keyboard-only play-through with shortcuts off.
- [ ] axe-core on SMS + Check card, mail + training page, debrief layers 1 and 2, damage control, Take a breath — light and dark, 320 and 1280.
- [ ] No `<input>` / `<form action>` in devices; CSP `form-action 'none'`, `connect-src 'self'`.
- [ ] Reduced motion: every row of §6.5.
- [ ] **Schema requests** (for CR discussion): `actions[].pressure_target: bool`; `debrief.already_clicked: { clicked, entered_details, paid }`; `debrief.layer1: { tell, what_works }`; inspectable `context: quoted` (exists in CR-04); checkable element types derived from the device template.

## 15. Open items and risks
- All brand names are web-checked only (BRAND_CHECK.md). A human must run a formal TMview/EUIPO search before G4. Kettle is a watch item; Wordswap has a fallback (Talktangle).
- Gatewren's mark (gate + bird) could read as a birdcage at very small sizes; check at 24 px in the build.
- Brands still needed later: utility, parking app, regulator warning list, remote-support tool, holiday-rental site.
- Debrief copy in mock-up 3 is illustrative. Final wording is owned by game-designer, and the facts by fraud-researcher [LI-5].
- Habit-card, city and map illustrations are specified but not drawn yet (Phase 2).
