# Art direction — Scam Atlas: Europe

Owners: `ux-artist` (style, rig, files, budget) + `learning-psychologist` (§1.2, §5.3, §9, §14 F) · Status: **v1.0 draft for review (T-S2)** · Last update: 2026-11-19
Reviewers: `sceptic-reviewer` (brand and likeness resemblance, every illustration, checklist §14), `learning-psychologist` (fear, shame, load), `qa-playtester` (accessibility, 320 px, dark mode, reduced motion).
Related: `docs/PLAN.md` Phase 3 track S (S2 and the Red Line 1 art guard), `docs/STORY.md` (cast, expressions, scenes), `docs/UI_SPEC.md` (§0 layers, §1 breakpoints, §6.5 motion, §9 map and stamps, §13 contrast), `src/styles/tokens.css`, `content/brands.yaml`, `content/cast.yaml`.
Samples: `public/art/samples/` (§15).

> Scope: the illustrated story layer decided in D-S1: character portraits with expressions, one or two backdrops per city, comic-style panels, postcards and the illustrated map. It wraps the device scenarios and never replaces them. Scenes never contain a scam message or artefact (STORY §4.2); this document does not change any device, scoring or debrief rule.

---

## 1. Principles

### 1.1 Look
1. **Warm paper picture book, not a thriller.** Flat colour, soft rounded shapes, daylight. The art belongs to the game layer (UI_SPEC §0): warm paper, ink, the sea accent.
2. **People first, places second.** Characters carry an ink outline and a paper "cut-out" halo; backdrops have no outlines and sit lighter and calmer behind them.
3. **Original and generic.** Places are recognisable by everyday architecture, light and weather, never by a brand, sign, livery, uniform, flag or famous landmark. People are invented from a shared rig, never from a real face.
4. **Text is never inside art.** Lines, names, captions and alt text are live HTML (translatable, resizable, read by screen readers, linted). The only exception is a registered fictional brand name in a `<text>` element (§12.3).
5. **Cheap to ship.** Hand-written SVG, shared parts, no rasters, no fonts. The whole story layer fits in about a quarter of a megabyte gzipped (§11).

### 1.2 Learning and emotional safety (co-owned with `learning-psychologist`)
1. **The picture supports the line.** One idea per panel: the art shows who is speaking, how they feel and the one object the line is about. No background gags or details that compete with the line (cognitive load).
2. **Modelling you can see.** The panel that carries a habit shows the character *doing* it (opening the app themselves, holding the phone to call back, writing the postcard), so the action is easy to remember and copy.
3. **No fear imagery.** No storms, night alleys, shadows behind people, hooded or faceless figures, masks, "hacker" tropes, code rain, skulls, broken padlocks, red alarms, warning triangles, shattered screens, tears, sweat drops, shaking lines, injured or endangered people, piles of cash or visible amounts.
4. **Worried is mild and brief.** `worried` = raised inner brows and a flat mouth, nothing more. A sensitive scene (STORY §5.3) never ends on `worried`; its last panel shows `relieved`, `warm` or `proud`.
5. **Dignity.** People who fell are drawn exactly as capable as everyone else, in the same light, size and framing. No clichés about places, ages or nationalities (no national costume, no food-pushing grandmothers, no "confused old person" poses). Mobility and hearing aids appear as ordinary details, never as a joke or a clue.
6. **No meta-tells.** Nothing in the art hints at a coming scenario's verdict: no ominous framing before a scam, no "safe" glow after a genuine message.

---

## 2. Style

| Aspect | Rule |
|---|---|
| Shapes | Rounded geometry: circles, ellipses, rounded rects, soft blobs. No spikes, jagged edges or sharp diagonals pointing at people. Heads about one third of the visible figure (friendly, readable at small sizes). |
| Line | Characters and props: `--art-ink` stroke, round caps and joins. Width 3 units on a 240-unit portrait (2 for small details, 2.5 for brows). Backdrops: **no ink outlines**; shapes only, with at most a 3-unit line in a darker backdrop tone for texture (cobbles, tiles). |
| Fill | Flat. One base and one shade per material; light from the top left; shade as a flat shape, never a gradient. One optional two-stop linear gradient per backdrop, for the sky only. |
| Detail | Characters: ≤ 150 elements. Backdrops: ≤ 300 elements, repeated elements via `<use>`. Leave quiet areas where the figures stand (§6.2). |
| Halo | Every character (and any prop a character holds) has a 5-unit `--art-paper` halo behind its silhouette, so figures separate from any backdrop, in both themes and in greyscale. |
| Texture | None in files (no filters, no noise). Paper texture, if any, is a CSS background on the page, never inside the art. |
| Perspective | Simple one-point or flat elevations, eye level about a third up the frame. No dramatic low angles, Dutch tilts or close-ups that crop through the face. |

### 2.1 What it is not
Not photo-real, not 3D, not anime, not a corporate "flat people with tiny heads" style, not a pastiche of any known illustrator, studio, comic or game. No real typefaces drawn as shapes. No real phone, laptop, car, bike or appliance designs (generic slabs and frames, no logos, no recognisable camera arrangements, no notch).

---

## 3. Palette

### 3.1 How colour works in art files
- Art files use **literal hex values from the palette below**, so they render the same in `<img>` and inline, with no CSS needed.
- The palette is mirrored as `--art-*` tokens (proposed tokens.css §8, §13 below) for the CSS-drawn parts (panel frame, caption boxes, postcards, video-call frame) and as the list an automated palette check compares files against (§12.5).
- **Never in art:** the iris family (`--p-iris-*`, reserved for the SIMULATION marker), any `--brand-*` colour outside an unmodified mark from `public/brands/`, the semantic flag/ok colours used *as meaning* (no red crosses, green ticks, red alarm lights), saturated pure reds, black skies.

### 3.2 Core
| Token | Hex | Use |
|---|---|---|
| `--art-ink` | `#2b2433` | All character and prop lines, pupils, open-mouth interiors. 14.39 on `--art-paper`. |
| `--art-paper` | `#fffaf0` | Halo, postcard paper, highlights. |
| `--art-sclera` | `#fffdf8` | Eye whites. |
| `--art-cheek` | `#c98468` at opacity 0.6 | `warm` and `laughing` only, skin tones 1–4. Never on Alex. |

### 3.3 Skin tones (diverse by construction; every cast member uses one)
| Token | Base | Shade | Ink on base | Feature rule |
|---|---|---|---|---|
| `--art-skin-1` | `#f6d7c3` | `#e6b9a0` | 11.00 | Ink features. |
| `--art-skin-2` | `#e8bd98` | `#d39f7a` | 8.67 | Ink features. |
| `--art-skin-3` | `#d39a70` | `#b97f58` | 6.15 | Ink features. |
| `--art-skin-4` | `#b07548` | `#93603a` | 3.91 | Ink features. |
| `--art-skin-5` | `#86543a` | `#6e4430` | 2.38 | Ink features **plus a 1.5-unit rim** `--art-rim-5` `#dcae8c` on the skin side of brows and closed mouths (rim 3.13 on skin, ink 7.47 on rim). |
| `--art-skin-6` | `#5a3826` | `#472b1d` | 1.45 | Ink features **plus rim** `--art-rim-6` `#c08a68` (3.49 on skin, ink 5.04 on rim). |

Eyes always have sclera (6.18 on skin 5, 10.18 on skin 6) and an ink outline (≥ 3.91 on skins 1–4), so every expression reads on every tone. **Rule:** every facial feature's defining edge is ≥ 3:1 against what it touches. Skin colours never change with theme, filter or overlay (§3.6).

### 3.4 Hair and clothing
| Group | Tokens (base / shade) |
|---|---|
| Hair | black `#2a2220`, dark brown `#4a3326`, brown `#7a5232`, auburn `#a8532c`, blonde `#e0b765`, grey `#b9b4ad`, white `#ece8e1` (white on skin 4: 3.14) |
| Cloth | sage `#8fae8b`/`#76966f`, mustard `#d9a441`/`#bd8a2c`, denim `#4e6a8f`/`#3f5675`, terracotta `#c8714f`/`#a95c3e`, cream `#f1e4c8`/`#ddcca9`, slate `#5d6672`/`#4a525d`, rose `#e3a6a0`/`#c98a84`, forest `#3f6b4f`/`#325640`, ochre accent `#c98f2e` |

No clothing combination may echo a real uniform, team kit or brand livery (§14 A).

### 3.5 Backdrops
- Shared neutrals: sky `#cfdde6`, glass `#a9bccb`, window frame `#f6efe2`, plaster `#e7d3b0`/`#d6bf98`, stone `#c9cfbf`/`#c4cab9`, ground `#c9b28f`/`#b49c7a`, leaf `#9db58a`/`#86a175`, wood `#8a6a4f`, metal `#b8b4a6`/`#9c978a`, painted metal `#8fa3b5`/`#7a8c9c` and `#9fb39b`/`#879d83`, doorway `#b9a88f`/`#9c8c76`, pale frame `#eef0e8`, line `#5d6672`, sun `#e9a23b`, sun-light `#f3d08a`, plus the game primitives `--p-paper-300` `#e3d3b4` and `--p-sea-100` `#d9e6f6` and the cloth colours in §3.4. Each city adds at most 6 local colours, listed in the file's header comment.
- **Character zone** (bottom 70 % of the frame, middle 80 %): every backdrop colour there has relative luminance 0.20–0.80. That keeps ink outlines ≥ 4.5:1 against the backdrop in light mode (measured 5.76–12.14 on the shared neutrals) and the paper halo ≥ 3:1 after the dark-mode dusk (3.34–5.75). Darker accents (bikes, door arches, tree trunks) cover ≤ 10 % of the zone.

### 3.6 Dark mode, forced colours, print, greyscale
- **Dark mode = dusk, not a recolour.** In dark theme the scene player lays `--art-dusk: rgb(20 22 46 / 0.45)` over the **backdrop layer only**. Characters, props and postcards stay unchanged (the same precedent as letters, which stay paper-coloured in dark mode). Measured: paper halo on dusked backdrops 3.34–5.75. One rule, zero extra bytes, and skin tones are never shifted.
- The panel border uses `--color-border` (3.80 light on surface, 4.09 dark), so panels separate from the page in both themes.
- **Forced colours** (Windows contrast themes): `forced-color-adjust: none` on panel art so pictures stay legible; frame and captions use system colours (`CanvasText`, `Canvas`).
- **Print** (Atlas pages, postcards): art prints as is; captions print black on white.
- **Greyscale test:** every expression of every character must be tellable apart in greyscale at a head height of 48 px, and every figure must separate from its backdrop in greyscale. Nothing in the art relies on hue (characters are told apart by silhouette, §4.6).

---

## 4. Character construction (the rig)

### 4.1 Canvas and anchors
- One file per character: `public/art/cast/<cast-id>.svg`, `viewBox="0 0 240 300"`, mid-shot (head, shoulders, upper chest), facing three-quarters to the viewer's right by default (the player flips it with CSS when the speaker stands on the right).
- Anchors (shared so parts fit every head): head centre (120, 125); eye line y = 124, eye centres 38 ± 6 apart; brow line y = 100 ± 6; mouth line y = 163 ± 6; chin y ≈ 181; neck 166–200; shoulders from y ≈ 196. Hands for gestures meet the chin at (128, 190) or the chest at (120, 250).
- Head height about 110 units, so at the panel size in §7.2 the speaker's head is ≥ 56 CSS px tall on a 320 px screen.

### 4.2 Layers inside a file (back to front)
1. `defs` → `<g id="<id>-sil">`: the silhouette (body, head, ears, hair mass) without colour.
2. Halo: `<use href="#<id>-sil">` filled and stroked `--art-paper`, stroke-width 10.
3. Base: body and clothes, neck, ears, head, hair, signature prop, nose, fixed face details (glasses, moustache, freckles, lines of age). This is everything that never changes.
4. Expression groups, one per expression: `<g id="x-<expression>" class="x">` containing only brows, eyes, mouth, optional cheeks, and optional gesture arm (§4.4).
5. The **default group is `x-calm` and is always last** in the file.

### 4.3 How an expression is chosen (no script, works in `<img>`)
Each file carries the same five-rule style block:
```css
.x{display:none}.x-default{display:inline}.x:target{display:inline}.x:target~.x-default{display:none}
```
- `teo.svg` shows `calm`; `teo.svg#x-thinking` shows `thinking`. The scene player sets `src="/art/cast/<speaker>.svg#x-<expression>"` and the browser caches one file per character.
- Verified for this draft in headless Chromium (sample in §15). `frontend-engineer` adds a Playwright check in Chromium, Firefox and WebKit (S3). Fallback if an engine fails: inline the SVG and set the same group visible with a `data-expression` attribute.
- Expression changes are instant swaps, never animated (§10).

### 4.4 Face parts library (shared vocabulary)
`public/art/rig/face-parts.svg` (to be drawn in S3/S4, reference only, not loaded by the game) holds the canonical parts on the anchors above. Character files copy the parts they need and adjust them to the face; nothing is referenced across files at runtime.

| Expression | Brows | Eyes | Mouth | Optional gesture |
|---|---|---|---|---|
| `calm` (base) | level, relaxed | open, pupils centred | short closed line, faint upturn | — |
| `warm` | relaxed, slightly raised | smiling arcs (∩) | closed smile | cheeks |
| `laughing` | raised | closed arcs | open D-shape, ink interior, light tongue; head group may tilt ±4° | cheeks |
| `thinking` | one raised, one level | open, pupils up and to one side | small flat line, off-centre | `g-chin` (hand at chin) |
| `worried` | inner ends raised | open, pupils centred | flat line | — (never tears, sweat, pallor, shaking lines or an open scream) |
| `relieved` | raised and soft | gently closed (∪ lids) | soft smile | `g-chest` (hand on chest) |
| `sheepish` | slightly tilted | glancing sideways | lopsided small smile | `g-neck` (hand behind neck) |
| `proud` | raised, confident | smiling arcs | wide closed smile, head group up 2 units | `g-chest` |
| `focused` | lowered towards the centre, never a V | upper lids lowered, pupils forward or down | firm straight line | — (never gritted teeth or anger) |

- A gesture lives **inside** its expression group, so the fragment API stays one id per expression. A character may add one story-specific pose (`g-parcels` for Jonas holding two parcels, `g-wave` for video calls) as an extra expression group named `x-<expression>-<pose>`, e.g. `x-relieved-parcels`. Each extra pose needs a STORY.md line that asks for it.
- **Expressions must read from eyes and mouth alone** (brows reinforce); this is what keeps them legible on deep skin tones and at avatar size.

### 4.5 Diversity and likeness
- Ages 8 to 74, skin tones 1–6, slim, round and broad builds, glasses, a walking stick and a hearing aid. Fallible moments are spread across ages and tones (Teo tone 4, Mateus tone 5, Davide tone 3, Declan tone 1, Inès targeted tone 6); so are the capable, teaching moments.
- **No likeness of real people.** Characters are assembled from the rig and these written specs only. No reference photos of identifiable people, no public figures, no "in the style of" a real person, no recognisable celebrity features. If a reviewer says "this looks like …", the drawing changes (hair, glasses, face shape), no argument.
- Appearance never encodes ethnicity as a clue, and alt text never describes skin, body or ethnicity (§9).

### 4.6 Cast design sheet (silhouette keys must differ for characters who share a scene)
| Character | Skin | Build | Hair and face | Clothes | Signature (silhouette key) |
|---|---|---|---|---|---|
| Teo (74) | 4 | round | white side tufts, bald crown, white moustache, round glasses | sage cardigan, cream shirt | pen behind the ear (sample) |
| Noor (15) | 3 | slim | high curly puff ponytail | denim hoodie | phone held screen-away, abstract stickers on the case |
| Adaeze (50s) | 6 | tall, broad | short natural hair with a grey streak, reading glasses on a cord | mustard jacket | the Atlas notebook |
| Mateus (late 20s) | 5 | medium | black curls, short beard | terracotta overshirt | coiled cables on his bag strap |
| Alex | 2 | medium | short tousled brown hair | plain slate jumper | a mustard scarf (§4.7) |
| Jonas (mid-30s) | 1 | broad | auburn short hair and beard | cream apron (no print) over slate T-shirt | flour dust on the apron |
| Mia (8, background) | 1 | small | two pigtails | rose jumper | — |
| Sanne (19) | 2 | slim | long blonde braid over the shoulder | rose cardigan | key on a plain ring |
| Solène | 3 | medium | dark bob with fringe | forest shirt | pencil, ink smudge on one hand |
| Inès (17) | 6 | slim | braids in a high bun | denim overalls | pencils in the bib pocket |
| Bastien | 5 | round | bald, short beard | mustard knit | mug |
| Lucía (34) | 4 | medium | dark hair in a loose bun, hearing aid | cream cardigan | coffee cup |
| Andrés (36) | 6 | broad | short hair, rectangular glasses | denim shirt | — |
| Kasia (23) | 2 | slim | brown pixie cut | slate roll-neck | cello case |
| Bruna (72) | 3 | small, round | silver bun, glasses pushed up | terracotta cardigan | B&B keys on a ring (a business owner, not a kitchen cliché) |
| Davide (19) | 3 | lanky | dark curls | denim jacket | headphones round the neck |
| Giulia (22, video) | 3 | slim | long wavy dark hair | sage top | — |
| Beatriz (20) | 5 | medium | long curly hair | mustard top | backpack straps |
| Declan (52) | 1 | heavy | grey buzz cut, stubble | slate fleece | — |
| Róisín (18) | 2 | slim | dark straight hair, fringe, rectangular glasses | forest hoodie | — |
| Jamal (38) | 4 | medium | short black hair, neat beard | slate cardigan over shirt | — |
| Lina (12) | 4 | small | two puffs | mustard bobble hat | — |
| Birgitta (70) | 1 | tall | white bob | chunky cream knit | walking stick |

Work clothes stay generic: no hospital, warehouse, bakery or school badges, lanyards, logos or name tags. No character is drawn in a uniform.

### 4.7 Alex (special rules, STORY §2.2)
- **One file, one image:** `cast/alex.svg` contains a single base face (friendly closed-mouth smile) and no expression groups. Never in scenes; used only in device scenarios (profile cards, the reveal).
- **Recognisable when repeated:** the reveal relies on "same picture, different name", so Alex has one distinctive, harmless feature (the mustard scarf) and the profile crop is identical everywhere (same file, same crop, never redrawn).
- **Never romance-coded:** no hearts, roses, wine, candles, sunsets, beaches, bedrooms, bare shoulders, wink, pout, blush, lip emphasis, soft-focus glow, head-tilt-chin-down "gaze", hand on face. **Never wealth-coded:** no cars, watches, yachts, suits, trading screens. Adult (20s–30s), no gender cues forced either way, plain light background, front-facing, eye level.
- Illustrated in exactly the same style as every other character (never more polished, never photo-like).

### 4.8 Other people in device scenarios
Device-layer pictures (profile pictures of non-cast personas, the "fictional celebrity" in Dublin ads, the video-call "Solène" in the Paris boss) use the same rig and this checklist. The Paris video-call "Solène" is the **same** Solène file (a familiar face proves nothing, GDD §23). Scam personas never reuse a cast face other than these specced cases. Scammers are never drawn in scenes.

---

## 5. Expression set per cast member

`calm` is the rig's base face, so every character has it at no cost (used for avatars, listeners and the Brussels video wall). Lists come from STORY §2.1 and §2.3; additions are marked **+** and need `game-designer` confirmation (§16).

| Character | Expressions to draw | Extra poses |
|---|---|---|
| Teo | calm, warm, laughing, thinking, sheepish, proud | `x-calm-wave` (video call) |
| Noor | calm, laughing, focused, thinking, worried, relieved | `x-laughing-wave` (video call, Amsterdam turn) |
| Adaeze | calm, warm, thinking, laughing, proud | `x-warm-wave` (video call, Home) |
| Mateus | calm, laughing, focused, sheepish, worried, relieved, **+ thinking** (used in STORY Warsaw turn and Lisbon turn) | — |
| Alex | one image only | — |
| Jonas | calm, warm, worried, thinking, relieved, proud | `x-relieved-parcels` (Berlin resolution) |
| Mia | calm only (background) | — |
| Sanne | calm, warm, laughing, worried, relieved, focused | — |
| Solène | calm, worried, relieved, warm | — |
| Inès | calm, focused, worried, proud | — |
| Bastien | calm, warm | — |
| Lucía | calm, warm, thinking, relieved | — |
| Andrés | calm, worried, laughing, proud | — |
| Kasia | calm, warm, focused, laughing | — |
| Bruna | calm, warm, thinking, proud | — |
| Davide | calm, sheepish, worried, relieved | — |
| Giulia | calm, laughing, relieved | `x-laughing-wave` (video) |
| Beatriz | calm, laughing, worried, thinking, relieved | — |
| Declan | calm, worried, thinking, sheepish, laughing | — |
| Róisín | calm, worried, warm, proud | — |
| Jamal | calm, thinking, worried, proud | — |
| Lina | calm, laughing | — |
| Birgitta | calm, laughing, proud | — |

A scene YAML that names an expression not in this table fails validation (proposed rule for S3, §13).

---

## 6. City backdrops

### 6.1 Format
- `viewBox="0 0 960 540"` (16:9 panorama). Panels show a 4:3 window of it with `object-fit: cover` and `object-position` left, centre or right, so one backdrop gives three "camera positions" for free.
- One file per place, `public/art/backdrops/<city>-<place>.svg`.

### 6.2 Composition
- Horizon or floor line between y = 300 and 470. The character zone (§3.5) is visually quiet: no strong lines crossing where heads will be (y 120–330 in each 4:3 window), no busy pattern behind faces.
- Depth in three flat planes: back (lightest, least detail), middle (architecture), front (ground, one or two props). No foreground objects that could hide a speaker.
- Daylight only (morning, midday or warm afternoon; Stockholm may be a bright winter afternoon). Night is produced only by the dark-mode dusk overlay, never drawn as a dark or threatening scene.

### 6.3 What makes a city recognisable (and what never does)
Allowed cues: building typology, roof shapes, window rhythm, materials, plants, weather, light, street furniture drawn generically. Never: real shop signs, brand colours, transit vehicles or stops in operator liveries, route numbers, licence plates, uniforms, flags, coats of arms, sports-club colours or crests, political or religious posters, currency, famous single landmarks (towers, cathedrals, monuments, named bridges) whose image may be claimed or which would date or pin the scene to a real address. Any visible "sign" is a blank plate, a pictogram (cup, loaf, key) or a registered fictional brand.

| File | Scene use (STORY) | Cues | Avoid |
|---|---|---|---|
| `home-kitchen` | Home arrival, turn, resolution; I4 packing | small warm kitchen, half-packed suitcase, postcards on the table, teapot, window plants; country left unspecific | any national flag, product packaging |
| `home-library-cafe` **(new, §16)** | I1 Teo's café | library corner, mismatched chairs, cake, tea urn, shelves as colour blocks | library or council logos, book titles |
| `berlin-courtyard` (sample) | Berlin all scenes | inner courtyard of an older block, tall windows, bikes, bins, chestnut tree, parcel locker | locker branding unless the unmodified Trundle mark (§16), street signs, house numbers |
| `amsterdam-canal` | Amsterdam arrival | narrow gabled houses, a small arched bridge, bikes, water | named boats, houseboat numbers, tram |
| `amsterdam-guesthouse` | local problem, turn, resolution | small reception desk, key hooks, plants, steep stair | hotel or booking-site look |
| `paris-studio` | Paris arrival (your studio flat) | small top-floor room, zinc-grey roofs through the window, chimney pots | famous skyline silhouettes |
| `paris-workshop` | Ruchelune scenes | print-and-design cooperative: big table, paper stacks, a generic printing press, procedure card on the wall as a blank card | machine maker names; "Ruchelune" lettering until registered in `brands.yaml` |
| `madrid-kitchen` | Madrid all scenes | sunny 8 a.m. kitchen, balcony with geraniums, rooftops, tiled floor | football colours, bank leaflets |
| `warsaw-flat` | Warsaw all scenes | flat with moving boxes (plain), cello case, lamp, big windows | courier logos on boxes, marketplace UI |
| `rome-bnb` | Rome all scenes | small B&B courtyard, lemon tree, shutters, terracotta | ancient monuments, religious symbols |
| `lisbon-street` | Lisbon arrival | steep tiled street with **original** geometric tile patterns, laundry, steps | trams or funiculars in livery, copies of historic tile designs |
| `lisbon-kitchen` | Lisbon turn, resolution | family kitchen, pots, tiled wall in original pattern | product packaging |
| `dublin-hall` | Dublin all scenes | community hall, folding chairs, tea table, blank noticeboard | parish, club or council emblems, flags |
| `stockholm-courtyard` | Stockholm all scenes | snowy courtyard, warm-red and ochre facades, lit windows with plain candle arches, bikes under snow | e-ID or bank pictograms, flags |
| `brussels-office` | Brussels arrival, turn | small office, boxes of Atlas covers (Waymarker mark only, unmodified), projector, plants | **never EU-styled: no blue-and-gold stars**, no institution buildings |
| `brussels-hall` | I3, Open Evening, resolution part 2 | hall with chairs, a plain video wall (portrait tiles), bunting in game colours | EU or national styling, sponsor boards |

Interlude I2 (Noor and Adaeze) uses the video-call panel (§7.6) on a plain wall, no new backdrop.

---

## 7. Panels and scene layout

### 7.1 Panel anatomy
```
┌─ panel (CSS frame) ────────────────┐   aspect-ratio 4/3, radius --radius-md,
│ backdrop <img>, object-position     │   border --border-w-strong solid --color-border
│ [dusk overlay, dark theme only]     │
│ listener (≤ 1, 85 % scale, behind)  │
│ speaker <img> (cast/<id>.svg#x-…)   │
└──────────┬──────────────────────────┘
      ▲ tail (decorative, 12 px, points to the speaker's side)
┌─ caption box (HTML) ────────────────┐   --color-surface, --color-text 16 px,
│ Jonas · neighbour                   │   speaker label --fw-bold; role --color-text-muted
│ "I take in everyone's parcels."     │
└─────────────────────────────────────┘
```
- The panel frame is CSS, not an SVG file (0 bytes, scales without distortion).
- **Figures:** at most two per panel. The speaker stands in the left or right third, facing the centre (flip with `transform: scaleX(-1)`), height 80 % of the panel. A listener is optional, 85 % scale, behind and to the other side, `calm` or `warm` only, never more expressive than the speaker.
- **Props** (parcels, keys, suitcase, phone) are part of the backdrop or the character's pose; a held phone is drawn screen-away or showing a plain home grid, map or photo (STORY §4.2).
- Panels without a speaker (captions, establishing shots) show the backdrop alone or with figures at `calm`.

### 7.2 Sizes by breakpoint (UI_SPEC §1.1)
| Breakpoint | Layout | Panel width | Speaker head height |
|---|---|---|---|
| `xxs` < 320 | one column; caption below; scene header wraps to two rows | 100 % − 2 × `--space-4` | not a target; nothing is lost because all text is HTML |
| `xs` 320–359 | one column | 288–327 px (216–245 px tall) | ≥ 56 px |
| `sm` 360–599 | one column | up to 567 px | 60–110 px |
| `md` 600–1023 | one column, centred | max 560 px | ≈ 110 px |
| `lg` ≥ 1024 | two columns of panels, max width 960 px; caption under each panel | ≈ 456 px | ≈ 90 px |

- Short viewports (height < 500 px): panel height = `min(width × 0.75, 50dvh)`; the Next button is in normal flow (UI_SPEC §1 height rule).
- Text size 130 % and 200 % zoom grow the caption boxes; the panel never shrinks below 160 px tall and never overlaps text, because no text sits on the art.

### 7.3 Reading order
- Panels are revealed one at a time by the player (never auto-advance). Earlier panels stay on screen above (or to the left on `lg`) so the player can re-read.
- DOM order = visual order: left to right, then top to bottom. No diagonal, overlapping or irregular layouts, no text inside the art, no speech bubbles placed over the picture.
- On `lg`, row pairs read left then right; a row never holds panels from two different scenes.

### 7.4 Captions and speaker labels
- **Speaker label:** the name in `--fw-bold`; on a character's first panel in a chapter, add the role after a middle dot in `--color-text-muted` ("Jonas · neighbour"). Colour never identifies the speaker.
- **Player lines:** label "You", no portrait, box aligned to the end side, background `--scene-you-bg` (`--p-sea-100` light, `--p-sea-900d` dark; text pairs 12.92 and 10.43 already measured in UI_SPEC §13).
- **Narration and the postcard line:** no tail, `--color-surface-sunken` background (`--color-text` 13.67 light, 11.15 dark). Example: "Later that evening."
- **Local-language phrase:** wrapped in an element with `lang`, followed by the inline translation, as in devices.
- **Choice** (optional, ≤ 3 options): full-width buttons under the caption, 44 px minimum, the standard neutral button style; never green/red, never ordered by "correctness".

### 7.5 Postcards (resolution last panel, interludes, map invitations)
- The postcard is a **CSS card** (`--letter-paper`, `--letter-ink`, `--font-letter`, 1 px ink border, `--shadow-1`) so its text can grow; the stamp and postmark come from `frames/postcard-stamp.svg` placed top-right and the text wraps around it. `sample-postcard-frame.svg` (§15) shows the look at the fixed 3:2 size used on the map and on `lg`.
- **Front:** a 4:3 crop of the city backdrop with rounded corners and the stamp. **Back:** "Postcard to Teo:" and the If-then line, word for word (STORY §4.4).
- **Flip state:** a "Turn over" button swaps faces. Full motion: a flat 2D squash (scaleX 1 → 0 → 1) over `--dur-slow`; reduced motion: instant swap. No 3D perspective spin.
- Stamps are invented: a small city glyph (§8.2) on sky blue, no country name, no value, no postal service, no copy of a real stamp; postmark = circle plus wavy lines, no text.

### 7.6 Video-call panel
A rounded "screen" rectangle (CSS, `--device-frame` border) inside the panel, the caller head-and-shoulders on a plain wall colour, with one optional `-wave` pose. No app chrome, no tile grid, no buttons, no names on the screen: the name is in the speaker label and the caption reads "On a video call". Brussels video wall: a 3 × 3 grid of the locals' `calm` or `warm` portraits in identical frames.

### 7.7 Scene chrome (summary for S3)
Scene header: "Berlin · Arrival" (h2), Help link (labelled "Need to talk? Where to get help" on `sensitive: true` scenes), Skip (same place on every scene). Footer: Next (primary, 44 px). Replay from the chapter menu. No coach marks, timers, scores or counters in scenes.

---

## 8. Illustrated map

### 8.1 Map
- Inline SVG in the game layer (UI_SPEC §9.3), coloured by tokens so it follows the theme: land `--color-bg` paper tones, sea `--p-sea-100` (dark: `--p-sea-900d` sea, `--p-ink-850` land), coast line `--color-border-subtle`.
- **Coastline drawn by hand, heavily simplified** (≤ 400 points for the whole map), from public-domain geographic data as a factual guide only (§16 asks the sceptic to confirm this is not "tracing" in the PLAN sense).
- **Proposal: no internal borders at all** (one continuous land): cheaper, calmer, and it avoids border disputes; UI_SPEC §9.3 currently says dotted borders (§16).
- No country names, no flags, no EU styling. City names and statuses are HTML labels; the accessible "Chapters" list stays the primary keyboard and screen-reader path.
- Pins: stamps-in-waiting (UI_SPEC §9.3); locked = outline plus the word "Locked". Route: dotted path (800 ms; reduced motion instant).
- Invitation postcards (STORY §1.4): HTML cards using the postcard style, one line from the local; **no badges, counts, "new" dots or countdowns.**

### 8.2 City glyphs
One 48 × 48 glyph per city in `map/glyphs/<city>.svg`, also used on stamps and passport stamps (UI_SPEC §9.2 "generic city glyph"): home teapot, Berlin courtyard bike, Amsterdam gable, Paris chimney pots, Madrid balcony geranium, Warsaw cello, Rome lemon, Lisbon tile, Dublin teacup, Stockholm candle window, Brussels open atlas. Never a landmark.

---

## 9. Alt text (co-owned with `learning-psychologist` and `qa-playtester`)

1. Every panel image has alt text from the scene YAML (`alt:`), stored in i18n like every line. Decorative layers (frame, halo, tail, dusk overlay, listener when the alt already names them) are `alt=""` or `aria-hidden`.
2. **Shape:** who → how they look (the expression in plain words) → what they are doing or holding → where (first panel of a scene or when the place changes). One sentence, ≤ 150 characters. Example: "Jonas in the courtyard, grinning, holding two parcels."
3. **Do not repeat the line**, which is read next from the caption. Do not start with "Image of".
4. **Never describe skin colour, body, ethnicity or age** unless a line depends on it (none do). Describe props and actions instead.
5. Name video calls ("Giulia, on a video call, laughing with relief.").
6. Describe screens truthfully and boringly ("Noor looks at her phone; the screen is turned away."). Alt text never contains a message, link, number, code, amount or brand that the art doesn't show.
7. Expression words come from a fixed list per expression, so screen-reader users get the same emotional cue as sighted players: calm "calm", warm "smiling", laughing "laughing", thinking "thinking", worried "looking worried", relieved "relieved", sheepish "with a sheepish smile", proud "proud", focused "concentrating".
8. Backdrop-only panels: place and mood, ≤ 80 characters ("A sunny kitchen at eight in the morning.").
9. Postcard back: the text is real text; the stamp is decorative. Postcard front alt: "Postcard front: the Berlin courtyard."
10. Map image: "Illustrated map of Europe with your route." Pins are not the only path (Chapters list).
11. Panel position is announced: each panel's list item carries a visually hidden "Panel 2 of 5".

Screen-reader structure (for S3): `<section aria-labelledby>` → `<ol>` of panels → `<li tabindex="-1">` → `<figure>` with `<img alt>` and `<figcaption>` (speaker label, line, choice). On Next, focus moves to the new `<li>`.

---

## 10. Motion and reduced motion

| Motion | Full | Reduced (OS setting or `data-motion="reduced"`) |
|---|---|---|
| New panel | opacity 0 → 1 over `--dur-base` | instant |
| Scroll to new panel | smooth | instant |
| Expression change | instant swap | instant swap |
| Postcard flip | 2D squash over `--dur-slow` | instant swap |
| Map travel path | dotted path, 800 ms (UI_SPEC §6.5) | instant |

- No slide, zoom, pan, parallax, shake, idle loop, blink or breathing animation in art. No SMIL (`<animate>`) or CSS animation inside SVG files.
- Panels never auto-advance; nothing in a scene is timed.
- Nothing is understood through motion alone: every state the motion shows is also the static end state.

---

## 11. File-size and performance budget

Measured on the file as shipped (no minifier dependency is added; files are written compact). gzip = transfer size and the size check in CI.

| Asset | Max raw | Max gzip | Sample for scale |
|---|---|---|---|
| Recurring character (base + all expressions + poses) | 16 KB | 5 KB | Teo, 2 expressions: 4.6 KB / 1.5 KB |
| Local character | 12 KB | 4 KB | — |
| Alex | 8 KB | 3 KB | — |
| Backdrop | 24 KB | 8 KB | Berlin courtyard: 3.6 KB / 1.4 KB |
| Postcard stamp, frames, props | 4 KB each | 1.5 KB each | postcard frame: 1.7 KB / 0.9 KB |
| City glyph | 2 KB each | 1 KB each | — |
| Map (base) | 48 KB | 16 KB | — |
| **Per chapter** (its backdrops + its locals) | **72 KB** | **24 KB** | — |
| **Shared** (recurring cast, Alex, frames, map, glyphs) | **160 KB** | **52 KB** | — |
| **Whole story layer** | **800 KB** | **260 KB** | — |

- Art is never imported into JS bundles; it is fetched as static files, so the shell bundle guard (300 KB gzip) is unaffected.
- The service worker precaches all art at install (offline play; the whole layer is ≤ 260 KB transferred). `rig/` and `samples/` are excluded from precache.
- Rendering: ≤ 150 elements per character, ≤ 300 per backdrop; no filters, masks or blend modes in files; ≤ 2 `clipPath` per file; coordinates as integers or one decimal place.

---

## 12. Files, naming and SVG rules

### 12.1 Folders
```
public/art/
  cast/<cast-id>.svg              one per character; id = content/cast.yaml id (teo, noor, alex, jonas …)
  backdrops/<city>-<place>.svg    city = chapter id; place = short noun (berlin-courtyard, lisbon-kitchen)
  frames/postcard-stamp.svg       and other small decorations
  props/<name>.svg                only if a prop must be placed separately from a backdrop or pose
  map/europe.svg, map/glyphs/<city>.svg
  rig/face-parts.svg              reference library, not loaded by the game
  samples/                        style proofs for review, not loaded by the game
```
- File names: lowercase ASCII kebab-case, `.svg` only. Scene YAML ids equal file stems (`backdrop: berlin-courtyard`, `speaker: jonas`, `expression: relieved`).
- Internal ids are prefixed with a short file prefix (`teo-sil`, `bbc-w`) so files never collide if inlined. **Exception:** expression groups are exactly `x-<expression>` or `x-<expression>-<pose>` (they are the fragment API).

### 12.2 Header comment (every file, first line)
```
<!-- Scam Atlas: Europe. <what it is>. Original artwork written primitive by primitive as SVG code for this project; no image generator, tracing, stock or reference photo. Fictional, not a likeness of any real person, sign or brand. CC BY-SA 4.0. -->
```
`redline:lint` scans comments, so comments never name a real organisation, not even to say "not modelled on X" (that note belongs in a review, not the file). No URLs except the SVG namespace.

### 12.3 SVG rules
- Root: `xmlns` plus `viewBox`; no fixed `width`/`height` (the layout sizes it). `role="img"` and a `<title>` for standalone viewing; in game the `<img alt>` wins.
- Allowed elements: `svg g defs use path rect circle ellipse line polyline polygon style title linearGradient stop clipPath`. Forbidden: `script`, `foreignObject`, `image`, `animate*`, `set`, `filter`, `mask`, `a`, `iframe`, event attributes, external `href`, `data:` URIs, `@import`, web fonts.
- **Lettering only as `<text>`, only registered fictional brand names, never converted to paths.** The linter blanks path geometry, so outlined text would escape it. No numbers that look like phone numbers, codes, prices, dates of real events, plates or IBANs; no QR codes or QR-like patterns, not even decorative ones.
- Brand marks: only an unmodified copy of a `public/brands/<id>-mark.svg` drawing, scaled, never recoloured or redrawn.
- Colours: only palette hex values (§3). Licence: CC BY-SA 4.0 (LICENSE-CONTENT.md); attribution "Scam Atlas: Europe contributors".

### 12.4 Provenance
Every file is drawn as SVG code by `ux-artist` (or a human contributor) from the specs here. "No AI-generated images" (PLAN S2) is read as: no output of image-generation models (text-to-image, image-to-image, style transfer) and no auto-vectorised rasters. Hand-written vector code, element by element, is how the brand marks were made and is assumed allowed (§16 asks for confirmation). No rasters in `public/art/**`; if one is ever needed it goes in `public/assets-manifest.yaml` first.

### 12.5 Proposed automated checks (for `frontend-engineer`, S3)
1. **Art palette:** every colour in `public/art/**/*.svg` is in the `--art-*` list (same parser as `tests/unit/palette.test.ts`).
2. **Art budget:** per-file, per-chapter and total caps in §11 (raw and gzip).
3. **SVG safety:** forbidden elements and attributes in §12.3; `<text>` content must be a registered brand name.
4. **Rig contract:** every `cast/<id>.svg` has `x-calm` last, and its `x-*` groups equal the expression table in §5 (or a registry field in `cast.yaml`); every scene `expression` exists in the speaker's file.
5. **Fragment rendering:** Playwright screenshot of one cast file with two fragments in Chromium, Firefox and WebKit.

---

## 13. Proposed tokens and hand-offs

- **tokens.css §8 "Illustration" (new):** the `--art-*` values in §3, plus `--art-dusk: rgb(20 22 46 / 0.45)` (dark theme only; `transparent` in light), `--scene-you-bg` (light `--p-sea-100`, dark `--p-sea-900d`), `--scene-panel-ratio: 4 / 3`. UI_SPEC gets the caption pairs (§7.4) in §13 and a "Scenes" section pointing here.
- **Scene schema (S3), optional fields:** `crop: left | centre | right` (default centre), `flip: true` (speaker on the right), `with: { id, expression }` (one listener), `pose` folded into `expression` (`relieved-parcels`).
- **cast.yaml:** proposed `art: { skin: 1–6, expressions: [...] }` per character, so the rig check (§12.5.4) has one source.
- `frontend-engineer`: §7, §9 structure, §10, §11 precache, §12.5. `scenario-writer`: alt text per §9. `sceptic-reviewer`: §14 on every file. `learning-psychologist`: §1.2, §5, §9, §14 F.

---

## 14. Sceptic checklist (run per illustration; copy into the review)

**A. Red Line 1, brands and signage**
- [ ] No real logo, brand name, product design, typeface, signage, shop front, packaging, vehicle livery, transit vehicle or stop, route number, licence plate.
- [ ] No uniform, badge, insignia, lanyard, name tag (police, government, bank, courier, transit, health, post).
- [ ] No flag, coat of arms, EU stars, sports-club colours or crest, political or religious symbol or poster, currency.
- [ ] No famous single landmark; the city reads from generic architecture only.
- [ ] Palette plus shape does not evoke a real bank, courier, telecom, marketplace or app (e.g. a vehicle or box in one company's colour pair).
- [ ] Any brand is a registered fictional one, shown as the unmodified mark file; any lettering is a `<text>` of a registered name.

**B. Likeness**
- [ ] Built from the rig and §4.6; no reference photo of a real person; no resemblance to a public figure (reviewer looks at it at full size and at 48 px).
- [ ] No ethnic, national, age or gender caricature; no cliché costume or prop.
- [ ] Alex: one image, rules in §4.7 (not romance- or wealth-coded, not more polished than others).

**C. Provenance and licence**
- [ ] Header comment present and clean (§12.2); no image generator, tracing, stock or external asset; no raster, font or external reference; CC BY-SA 4.0.

**D. Red Line 3, identifiers**
- [ ] No phone-like numbers, codes, IBANs, amounts, plates, URLs, e-mail addresses or QR-like patterns anywhere in the art.

**E. Scene rules (STORY §4.2)**
- [ ] No scam message, sender, link, number, QR, amount, spoofed logo or screenshot; phones are screen-away or show a home grid, map or photo.
- [ ] No scammer drawn; no offline fraud scene (cash handover, ATM, doorstep stranger, courier collecting, street trick).

**F. Emotional safety and learning (`learning-psychologist`)**
- [ ] None of the fear imagery in §1.2.3; `worried` within §4.4; sensitive scenes end on relieved, warm or proud.
- [ ] The person who fell is drawn with the same dignity, size and light as everyone else; humour is on quirks, not on them.
- [ ] The panel shows the habit or object the line is about; nothing competes with it; no meta-tells.

**G. Accessibility (`qa-playtester`)**
- [ ] Alt text per §9; expression word matches.
- [ ] Greyscale test (§3.6) passes; features ≥ 3:1 (§3.3); character zone within the luminance band (§3.5).
- [ ] Works at 320 px (head ≥ 56 px), in dark mode (dusk), forced colours and 200 % zoom; reduced motion shows the same end state.

**H. Technical**
- [ ] Size and element caps (§11); allowed elements only (§12.3); palette only; ids prefixed; `x-calm` last; `npm run redline:lint` clean.

---

## 15. Samples (style proofs, not game assets)

| File | Shows | Size raw / gzip |
|---|---|---|
| `public/art/samples/sample-portrait-teo.svg` | The rig: halo, base, two expression groups (`x-thinking` with the `g-chin` gesture, `x-warm` as default). Open as is for `warm`, or with `#x-thinking`. In production the last group is `x-calm`. | 4.6 KB / 1.5 KB |
| `public/art/samples/sample-backdrop-berlin-courtyard.svg` | A 16:9 backdrop: flat shapes, no outlines, quiet character zone, `<use>` for windows and bikes, an unbranded parcel locker, no lettering. | 3.6 KB / 1.4 KB |
| `public/art/samples/sample-postcard-frame.svg` | Postcard back at the fixed 3:2 size: invented stamp, text-free postmark, message area left for HTML text. | 1.7 KB / 0.9 KB |

Checked in headless Chromium: the fragment switch works in `<img>`, the halo separates Teo from the courtyard in light mode and under the dusk overlay at 288 × 216 px, and the postcard holds the 15-word Berlin If-then line at 14 px. Longer lines and larger text sizes use the CSS card in §7.5, which grows with its text.

---

## 16. Open questions

1. **"No AI-generated images" (Roman / sceptic):** confirm that SVG written element by element as code by the agent team is allowed, and that the ban covers image-generation models and auto-vectorised rasters (§12.4).
2. **Map coastline (sceptic):** is hand-simplifying from public-domain geographic data acceptable, or must the coastline be freehand? And may the map drop internal borders (§8.1), which needs a UI_SPEC §9.3 change?
3. **Mateus `thinking` (game-designer):** STORY uses it twice (Warsaw turn, Lisbon turn) but his list lacks it; added here.
4. **`calm` as everyone's base face (game-designer, psychologist):** adds no cost and gives avatars, listeners and the video wall a neutral face. Agree?
5. **New backdrop `home-library-cafe` for interlude I1** (not in the STORY §7 hand-off); I2 uses the video-call panel. Agree?
6. **Trundle locker in `berlin-courtyard` (sceptic):** show the unmodified Trundle mark on the locker, or keep it unbranded as in the sample? Trundle is spoofed in Berlin scenarios; a genuine mark in the scene is soil, not a scam artefact, but the sceptic decides.
7. **Fictional celebrities in Dublin ads (game-designer, sceptic):** drawn with the rig under §4.8? They need their own resemblance check because the scam pattern imitates real endorsements.
8. **Samples folder:** keep until G3 for reviewers, then delete? (Excluded from precache either way.)
9. **Human illustrator later?** The rig and specs allow a human artist to replace files one by one without schema changes; Roman may decide at G3.
10. `redline:lint` could not be run in this worktree: `node_modules` is missing (`tsx: not found`). A manual scan of the three samples against the deny- and warnlists and for URLs, scripts, `foreignObject` and `image` found nothing. Run `npm ci && npm run redline:lint` before merge.
