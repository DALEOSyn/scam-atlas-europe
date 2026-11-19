# Fictional brand name-collision check (T-1.7)

**Owner:** fraud-researcher (for ux-artist) · **Searched:** 2026-11-18 · **Status:** draft for sceptic review
**Scope:** the 8 names in `content/brands.yaml` (not edited). Question: does an existing product or company use the same or a confusingly similar name in the same or an adjacent sector, especially in Europe?

## Method and limits
- **Trademark registers were NOT reachable.**
  - TMview (`https://www.tmdn.org/tmview/…`) refused automated access (robots disallowed).
  - A web search for EUIPO records of the names returned no relevant entries (query below).
  - So this is a **web, app-store and company-directory check, not a trademark clearance**.
  - Before G4 (public release), a human should run each final name through TMview / EUIPO eSearch, classes 9, 35, 36, 38, 39, 41 and 42.
- **Searches used:** general web search (US-based index), Apple App Store and Chrome / Firefox add-on listings surfaced by search, Product Hunt / BetaList / IndieHackers, and UK Companies House results surfaced by search. Google Play was not queried directly.
- **Risk scale:** matters most where the game *impersonates* the brand as a scam prop.
  - *High*: same or near-identical name, same sector, active.
  - *Medium*: same or near-identical name in an adjacent sector, or a close sound-alike in the same sector.
  - *Low*: only generic-word uses or unrelated sectors.
- **Shared query:** `EUIPO trademark "CORVELLE" OR "TRUNDLE" OR "HOARDLY" OR "NODKEY" OR "WORDSWAP" OR "WAYMARKER"`, 2026-11-18. No register entries for any of the names.

## Summary
| Name (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|
| Waymarker Network (agency) | Waymark (US video ads), Waymarkly (waymarking app), WayMaker | Low | **Keep** |
| Trundle (courier) | Trundle.me (travel-content app, 2024–25); trundle bed; Australian town | Low | **Keep** |
| Corvelle Bank (bank) | **CorVel Corporation** (US, Nasdaq-listed, insurance claims / risk management) | **Medium** | **Rename** → Larchwick Bank / Fennmoor Bank |
| Thimble & Pine (online shop) | Thimble and Fabric (UK craft kits); many "Thimble…" Etsy shops | Low | **Keep** |
| Hoardly (marketplace) | **GoHoardly** (budgeting app, featured July 2026); Hoarder (bookmark app) | **Medium** | **Rename** → Swaploft / Tumblestall |
| Kettle (messenger) | Kettle Comment Anywhere (US social app, removed, ~150 installs); Kettle (US insurtech); Kettel (UK proptech) | Low | **Keep** (watch item) |
| Nodkey (sign-in / eID app) | **Nodkey by KH Labs**: Firefox add-on + iPhone app for sign-in codes and approvals, updated 2026-11-08; also Nitrokey (German security keys) | **High** | **Rename** → Gatewren / Wardlight |
| Wordswap (language exchange) | Elevate "Word Swap" (brain-training game); Word Swap Web; Word Search SWAP | Low–Medium | **Keep**, optional rename → Talktangle / Lingowisp |

---

## 1. Waymarker Network: Low, keep
- **Searched (2026-11-18):** `"Waymarker" app OR company network`; `"Waymarker" company OR brand OR platform`.
- **Hits:**
  - No product or company called "Waymarker".
  - Near names: Waymark, Inc. (US video advertising; trademarks on Justia); Waymarkly (iOS waymarking hobby app); WayMaker / Waymaker OS; Waymap (navigation app).
  - Sources: https://trademark.justia.com/owners/waymark-inc-4164532 · https://apps.apple.com/app/id1485909913 · https://www.waymakeros.com/brand
- **Assessment:** different sectors. "Waymarker" is also a common English word for trail signs. As the player's employer, it is not used as a scam prop.

## 2. Trundle (courier): Low, keep
- **Searched:** `"Trundle" courier OR delivery OR parcel company`; `Trundle app OR startup OR "Trundle Ltd" OR "Trundle GmbH" logistics`; `"Trundle" Europe company delivery OR logistics OR post OR "Trundle GmbH" OR "Trundle BV"`; `"Trundle" app store`.
- **Hits:**
  - **Trundle / trundle.me**: travel-content app on Product Hunt (listing June 2024, app launches December 2025). Travel sector, not delivery. https://www.producthunt.com/products/trundle-me/launches
  - Trundle, New South Wales (a town that appears on courier city pages); "trundle bed".
  - Trunkrs (Dutch same-day parcel company): sound partly overlaps but the name is clearly different.
- **Assessment:** no courier or logistics company called Trundle found. Travel is only loosely adjacent.

## 3. Corvelle Bank: Medium, rename
- **Searched:** `"Corvelle" bank OR finance OR company`; `"Corvel" OR "Corvelle" company`.
- **Hits:**
  - **CorVel Corporation**: US, Nasdaq-listed, workers' compensation / insurance claims and risk-management services. "Corvelle" sounds almost the same, and the sector (insurance / financial services) is adjacent to banking. https://corvel.com/investors · https://en.wikipedia.org/wiki/CorVel_Corporation
  - Corville Financial Services Ltd (UK Companies House, 04337342). https://find-and-update.company-information.service.gov.uk/company/04337342
- **Assessment:**
  - The bank is the brand players will see *spoofed* (Madrid, Stockholm chapters).
  - A near-homophone of a listed financial-services company is avoidable risk under Red Line 1, even though CorVel is US-focused.
- **Alternatives (checked 2026-11-18):**
  - **Larchwick Bank**: `"Larchwick"`, `"Larchwick" OR "Tumblestall" OR "Swaploft" company`. No exact hits; nearest is an unrelated "Larchwill Services Limited" (UK). Low.
  - **Fennmoor Bank**: `"Fennmoor"`. No exact hits; near names Fernmoor (UK wool / textiles), Fenmoor (game wiki). Low.
  - *Rejected:* Quillmere. "Quill Bank" is a real US bank (visbanking.com call reports).

## 4. Thimble & Pine (online shop): Low, keep
- **Searched:** `"Thimble & Pine" OR "Thimble and Pine" shop`; `Thimble Pine shop Etsy OR "thimbleandpine"`.
- **Hits:**
  - No exact match.
  - **Thimble and Fabric**: UK embroidery craft-kit brand on Faire / notonthehighstreet. https://www.faire.com/brand/b_58dnye3fp5
  - Many small "…Thimble…" or "…Pine…" Etsy shops (e.g. Spool and Thimble, Pine and Thread).
- **Assessment:**
  - Two-word combination with no exact match; different second word from the nearest hit.
  - If the fake shop sells craft or sewing goods, the overlap with craft-kit sellers grows. ux-artist should give it a different product line (e.g. homeware or electronics, matching the "too-good discount" pattern).

## 5. Hoardly (marketplace): Medium, rename
- **Searched:** `"Hoardly"`; `gohoardly OR "go hoardly" app`.
- **Hits:**
  - **GoHoardly**: personal-finance budgeting app with payday-based budgets and a shopping list. Featured on BetaList 2026-07-19; also on IndieHackers and AlternativeTo. https://betalist.com/startups/gohoardly · https://www.indiehackers.com/product/gohoardly
  - Hoarder (self-hosted bookmark app); Hoardware (device-collection app).
- **Assessment:**
  - Same core name as an active 2026 consumer finance app.
  - The game will show "Hoardly safe-pay" links as scam props (Warsaw, Lisbon). Finance-adjacent plus a payment-link context makes confusion plausible.
- **Alternatives (checked 2026-11-18):**
  - **Swaploft**: `"Swaploft"`. Only unrelated crypto "SWFT" results and a UK loft-conversion company "SW Lofts". Low.
  - **Tumblestall**: `"Tumblestall" OR "Tumble Stall"`. Only gymnastics equipment ("Tumbl Trak", stall bars). Low.
  - *Rejected:* Rummly (too close to many "Rummy" card / gaming apps); Bundlebarn (Faire brand and Shopify "Barn2 Bundles" hits).

## 6. Kettle (messenger): Low, keep (watch item)
- **Searched:** `"Kettle" messenger OR messaging OR chat app`; `"Kettle Comment Anywhere" app`; `Kettle app social OR chat OR community startup Europe`; `"Kettle" app UK startup Kettle.co OR "Kettle Technologies"`.
- **Hits:**
  - **Kettle Comment Anywhere** (VibeTemp LLC, iOS Social Networking, released 2025-07-15, ~150 installs). Per AppGoblin it has been **removed** from the US App Store; it also had a Chrome extension. https://appgoblin.info/apps/6747995800 · https://chromewebstore.google.com/detail/kettle/pblpakdmdjnpcploojkhkdhkegpgjbcp
  - **Kettle**: US insurtech (wildfire reinsurance). https://www.bouncewatch.com/explore/startup/kettle
  - **Kettel**: UK proptech in development. Appkettle: smart-kettle hardware. Kettle Chips: snacks.
- **Assessment:**
  - Common English word. The only messaging-adjacent hit is tiny and delisted; no European messenger found.
  - Keep, but re-check before G4.
  - Fallbacks if needed: "Kettlechat" is *not* recommended (still built on the same word). Re-run the search for a new coinage instead.

## 7. Nodkey (sign-in / eID app): High, rename
- **Searched:** `"Nodkey"`; `"Nodkey" OR "Nod Key" login app OR authentication`; `Nitrokey company Germany security keys`.
- **Hits:**
  - **Nodkey by KH Labs**: Firefox add-on (category Privacy & Security, last updated **2026-11-08**). It works with a companion **iPhone app** to fill in logins and two-step codes, supports passkeys, and you **approve each request with Face ID**. https://addons.mozilla.org/en-US/firefox/addon/nodkey/
  - **Nitrokey**: German company making open-source security keys and passkeys. Same sector; similar "-key" ending and rhythm. https://nitrokey.com/about
  - Unrelated developer identifiers ("NodeKey" in code libraries).
- **Assessment:**
  - Exact name, same function, live and recently updated.
  - The game's Nodkey is exactly the app whose "approve this sign-in" prompt players will learn to *refuse* (Stockholm). That would effectively teach players to distrust a real product's prompts, so it must be renamed.
  - Also avoid any "-key" name in this sector (Nitrokey, YubiKey).
- **Alternatives (checked 2026-11-18):**
  - **Gatewren**: `"Gatewren"`. No hits (only generic "gateway" results). Low.
  - **Wardlight**: `"Wardlight" app OR login OR identity`. No exact hits; results were generic identity apps. Low.
  - *Rejected:* Sealbridge, because "Seal" / "SealSuite" identity-and-access products exist.

## 8. Wordswap (language exchange): Low–Medium, keep (optional rename)
- **Searched:** `"Wordswap" app language`; `"Word Swap" OR "WordSwap" game OR app OR language exchange`.
- **Hits:**
  - **Word Swap**: a mini-game inside Elevate (US brain-training app). https://elevateapp.com/brain-game/word-swap
  - **Word Swap Web** (iOS); **Word Search SWAP** (iOS); an Android word game with package `com.igoldtech.an.wordswap` (seen via AppGoblin).
  - No language-exchange app named Wordswap found.
- **Assessment:**
  - Hits are word games, which are adjacent (language / learning apps) but not the same service.
  - The game uses it as the platform where the romance-scam contact begins. It is a setting, not a spoofed brand, so the risk is low–medium.
  - Keep, unless the sceptic prefers zero overlap.
- **Optional alternatives (checked 2026-11-18):**
  - **Talktangle**: `"Talktangle" OR "Lingowisp"`. No exact hit. Low.
  - **Lingowisp**: no exact hit, but "Lingowire" (lingowire.pages.dev) and other "Lingo…" apps are near. Low–Medium.

---

## 9. Amsterdam candidates (phase 3, ch2; searched 2026-11-19)
Same method and limits as above (web, app-store and company-directory check via web search; **not** trademark clearance). Checked for each name: the brand name, the domain stem and the SMS sender ID (alphanumeric sender IDs allow at most 11 characters).

| Name (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|
| Tidewell Staffing (genuine agency whose name scammers borrow) | **Tidewell Hospice** (US, Florida non-profit hospice and palliative care) | **Medium** | **Reject** → **Klaverwerk** |
| Tasklyn (scam-only task platform) | **Tasklyn** project-planning startup (BetaList 2018); **Tasklyn** task-management app for students and small teams (live web app, Android package) | **High** | **Reject** → **Tallyfern** |

### 9a. Tidewell Staffing: Medium, reject
- **Searched:** `"Tidewell" company`; `"Tidewell Staffing" OR "Tidewell" recruitment OR staffing OR uitzendbureau`; `"Tidewell Hospice"`.
- **Hits:**
  - **Tidewell Hospice, Inc.**: a US non-profit (Sarasota / Manatee, Florida) with many directory listings and a GuideStar profile. https://www.guidestar.org/profile/59-1911861 · https://www.mymanatee.org/connect/resources/external-agencies/external-agency-detail/tidewell-hospice
  - No staffing agency called Tidewell. Near names: Tidwell (US businesses), Tidewater (US marine services).
- **Assessment:** this is a different sector, but the exact name belongs to a real organisation. The scenario shows the name *borrowed by scammers* in SMS texts (2-2, 2-9 boss with sender ID `TIDEWELL`). Red Line 1 rules out naming a real organisation as a scam prop, so the name is avoidable risk. Reject.
- **Alternatives (coined, Dutch-sounding):**
  - **Klaverwerk** ("clover" + "work"). Queries: `"Klaverwerk"`; `"Klaverwerk" OR "Klaver Werk" uitzendbureau OR staffing OR B.V.`; `"Klaverwerk" app OR company OR platform OR trademark`. **No exact hits.** The only results were unrelated: "Klavierwerke" (piano works), card-game apps for *klaverjassen*, and generic staffing firms. "Klaver" is a common Dutch surname, but no company or agency uses "Klaverwerk". **Low.** Sender ID `KLAVERWERK` (10 characters).
  - **Vlietwerk** ("Vliet" canal + "work"). Queries: `"Vlietwerk"`; `"Vlietwerk" OR "Vliet Werk" uitzendbureau OR staffing OR recruitment OR B.V.`. No exact hits, only the Vliet canal and place names. However, **Veldwerk Uitzendbureau** (a real Dutch staffing agency, Creditsafe NL05125245) has the same "V…-werk" shape in the same sector. **Low–Medium.** Sender ID `VLIETWERK` (9).
  - **Polderstaf** ("polder" + "staff"). Queries: `"Polderstaf"`; `"Polderstaf" OR "Polder Staf" uitzendbureau OR werving`. No exact hits. The nearest is **Poldervast B.V.** (Opmeer, company register listing; sector not shown). **Low–Medium.** Sender ID `POLDERSTAF` (10).
  - *Not proposed:* Kadewerk. The query `"Kadewerk" uitzendbureau OR werk OR bedrijf` found no exact hit, but "kade" is a common street and quay word, and the search showed only generic agencies. It was not researched further.
- **Recommendation:** **Klaverwerk**, presented as "Klaverwerk Staffing" if the English context needs it. Host `klaverwerk-staffing.example` (the GDD pattern). Sender ID `KLAVERWERK`.

### 9b. Tasklyn: High, reject
- **Searched:** `"Tasklyn"`; `"Tasklyn" app OR platform OR software`.
- **Hits:**
  - **Tasklyn on BetaList**: "Quick Project Plan", a project-planning platform featured 2018-01-09. https://betalist.com/startups/tasklyn
  - **Tasklyn web app**: task management and collaboration for "students, creators and small teams", with a mobile app (Android package `com.penacode.tasklyn`) and a web dashboard. https://tasklyn.netlify.app/
  - Many near names: Taskly, Tasklyy, TaskLync.
- **Assessment:** the exact name belongs to real task apps, one of them aimed at students, which is the game's own audience. The game's Tasklyn is **scam-only**, so using the name would teach players that a real product is a scam. Ruled out.
- **Alternatives (coined; no real app, company or trademark hits wanted):**
  - **Tallyfern** ("tally" for counting earnings + "fern"). Queries: `"Tallyfern" OR "Tally Fern"`; `"Tallyfern" app OR platform OR company OR software`. **No exact hits.** Results were only fern plants and unrelated "Tally…" products (Tally forms, Tallyfy, TallyExpress, Tallyfeed). **Low.**
  - **Ratewisp**. Query: `"Ratewisp" OR "Rate Wisp"`. No exact hits. Near names are "Wisp" (several software products) and "RateWizz" (G2 listing). **Low–Medium**, because of the "rate" sector overlap with RateWizz.
  - **Rankrally** (GDD alternative). Query: `"Rankrally" OR "Rank Rally" app`. No exact hits. Near names include **Rankly** (iOS app and Google Play developer) and several "Rally" apps. **Low–Medium.**
  - *Rejected:* **Gleamtask** (GDD alternative). The query `"Gleamtask" OR "Gleam Task"` found only Gleam programming-language task modules, but **Gleam** (gleam.io) is a real competitions and giveaways platform where users complete "entry actions". https://gleam.io/blog/what-is-gleam. That is an adjacent sector (doing small online actions for rewards), so a "Gleam…" scam task platform is too close.
- **Recommendation:** **Tallyfern**. Hosts `tallyfern-earn.example` (2-7) and `tallyfern-start.example` (boss). Banner payer name `TALLYFERN`.

### 9c. Notes
- Neither recommendation is a trademark clearance. Add both to the pre-G4 TMview / EUIPO list (classes 35 and 42; also 9 for Tallyfern).
- `.example` hosts are reserved (RFC 2606), so the recommended hosts need no collision check. The check above is about the *name*.
- GDD §603–604 and scenarios 2-2, 2-7 and 2-9 said Tidewell / Tasklyn until the producer's rename (2026-11-19: now Klaverwerk / Tallyfern everywhere). ux-artist / game-designer should rename them in `content/brands.yaml` and the GDD; this file makes no edits to either.

---

## Actions for ux-artist (no edits made to `content/brands.yaml`)
1. **Rename Nodkey** (High). Suggested: Gatewren or Wardlight.
2. **Rename Corvelle Bank** (Medium). Suggested: Larchwick Bank or Fennmoor Bank.
3. **Rename Hoardly** (Medium). Suggested: Swaploft or Tumblestall.
4. Keep Waymarker Network, Trundle, Thimble & Pine, Kettle, Wordswap. Give Thimble & Pine a non-craft product line.
5. Add any new names to the red-line denylist logic only as *allowed* fictional names. Re-run this check on every new name.
6. **Before G4:** a human runs a formal TMview / EUIPO search on all final names. This check is not trademark clearance.
7. **Amsterdam (2026-11-19):** replace **Tidewell Staffing → Klaverwerk** (sender ID `KLAVERWERK`, `klaverwerk-staffing.example`) and **Tasklyn → Tallyfern** (`tallyfern-earn.example`, `tallyfern-start.example`). See §9.

---

# Paris names (chapter 3), checked 2026-11-19

**Owner:** fraud-researcher · **Searched:** 2026-11-19 · **Status:** draft for sceptic review · roles from `docs/GDD.md` ch 3.

## Method and limits (Paris)
- Same method and limits as above: a web search (US-based index) that also surfaced French company-directory pages (Pappers, Societe.com, Rubypayeur, INSEE SIRENE extracts, Verif.com) and bar or lawyer directories. **No trademark register, no INPI search, no WHOIS.** A French company name with no web presence can still exist. Before G4 a human checks INPI and the annuaire-entreprises.data.gouv.fr company directory, as well as TMview.
- **Domain stems:** checked only as words on the web. The game uses `.example` / `.test` domains (Red Line 3), so the risk is a name collision, not a reachable domain.
- **People:** a fictional person may have a name real people also carry. The test is (a) no *notable* person (Wikipedia, press, public office) with that exact name, and (b) for anyone shown **in a role that is impersonated or accused** (the fake lawyer, the account holder of a fraud account), no real professional with that name in that role.

## Summary (Paris)
| Name (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|
| Ruchelune (player's employer, Paris firm; stem `ruchelune`) | none; only "Ruchen" (Swiss mountains), "Du Ruchon" (company, unrelated) | Low | **Keep** |
| Larchwick Pro (business banking of Larchwick Bank) | no "Larchwick Pro"; UK "Larchwell", "Larchbond", "Larchmount" Ltd | Low | **Keep** (re-checks T-1.7) |
| Volet Bleu / Volet Bleu Gestion SAS (letting agency; stem `voletbleu`) | registered company "Les Volets Bleus" (SIREN 978118412, activity not confirmed; page failed to load); the phrase is common for holiday cottages and restaurants; no letting agency or "Volet Bleu Gestion" found | Low–Medium | **Keep, with a check** (see §P3) |
| Clef d'Ocre Locations (alternative agency name) | no exact hit; **same-trade sound-alikes**: "Agence La Clef d'Or" (estate agency, Verdon), "Les Clefs d'Orléans" (estate agency) | Medium | **Don't use** |
| Feuillemont (supplier, replaces Encrevive) | no exact hit; nearest are the communes Feuillères and La Feuillie; no paper, ink or print business | Low | **Keep** |
| Encrevive (old supplier name) | "Encre Vive" collision reported by the coordinator; my query returned several SIRENE extracts and a supplier listing (not opened one by one) | (Medium, per coordinator) | **Replace** with Feuillemont (done in GDD per coordinator) |
| Pressoria (press-maintenance supplier, misused real mailbox in 3-8) | **Pressoria**, a real visitor centre in Aÿ-Champagne about the champagne wine press (tourist offices, SNCF Connect, ANCV guide, Explore Grand Est, award in TourMaG) | **High** | **Rename** → Platinoir |
| Cuivrelin (plumber) | none; only copper-supplement products ("cuivre") | Low | **Keep** |
| Cabinet Ostrelle (law firm) | none; only communes Orelle and Ostel in lawyer directories | Low | **Keep** |
| Maître Lenoir (fake lawyer in the boss) | **real Paris lawyers named Lenoir**: Maître Sarah Lenoir (Paris 1er, listed in Best Lawyers); **Noëlle Lenoir Avocats** (Paris firm ranked in Legal 500; Noëlle Lenoir is a public figure); Julie Lenoir (lawyer, avocat.fr) | **High** | **Rename** → Maître Vellacourt |
| Solène Arbogast (cast: boss) | no exact person found; Solène Arbel, Arnoult etc. | Low | **Keep** |
| Bastien Morel (cast: colleague) | no notable person; a "Bastien Morel" profile on the Lac d'Annecy tourism webzine (private individual); Sébastien Morel (journalist, Wikipedia) is a different name | Low | **Keep** (common name, not used as a fraudster) |
| Inès Roussel (cast: apprentice, impersonated in 3-5) | no notable person; Anne, Hélène and Renaud Roussel on Wikipedia are different first names | Low | **Keep** |
| "Ardoise Ateliers" / "Ardoise Ateliers SAS" (fraud account holder, 3-2 and boss) | no exact company found, but "Ardoise" is a live brand word in the same craft or workshop space: **Ardoise Design** (Maison&Objet brand), **ardoise.lu**, "L'Ardoise" (Rathscheck slate product line), Maison / Musée de l'Ardoise | Medium | **Replace** → Tessivane SAS (3-2) and Morvenac SAS (boss), or Orvasine SAS |
| "N. Ferrand" (holder of the "match" account in 3-8) | Ferrand is a common surname carried by national public figures (e.g. a well-known politician; from general knowledge, **not searched this session**) | Medium (public surname on a fraud account) | **Replace** → N. Vardoulec (alt: N. Brumetier) |

## P1. Pressoria: High, rename
- **Searched:** `"Pressoria"`; `Pressoria Aÿ Champagne pressoir site de visite`.
- **Hits:** Pressoria is a real visitor attraction ("voyage sensoriel au cœur du champagne") in Aÿ-Champagne, run with public partners (an EPL is cited). Examples: https://de.tourisme-en-champagne.com/sites/www.tourisme-en-champagne.com/files/atoms/files/dossier_de_presse_-_pressoria.pdf · https://www.sncf-connect.com/article/pressoria-pour-un-voyage-sensoriel-a-ay-champagne · https://leguide.ancv.com/ptl/arts_culture_decouverte/expos_et_musees/pressoria/832546001001 · https://www.tourmag.com/Champagne-Pressoria-decroche-un-prix-special-pour-son-parcours-sensoriel_a113733.html
- **Assessment:**
  - It's the exact name of a real French organisation, and its theme is the press, so it overlaps with a "press maintenance" supplier.
  - In 3-8 the game shows this brand's *real* mailbox being misused, which would put a real organisation's name on a scam prop (Red Line 1).
- **Alternative (checked 2026-11-19):**
  - **Platinoir** (from *platine*, a press platen): `"Platinoir"`. No exact hit, only generic "platinoïdes" / platinum results. Low. Stem `platinoir`.
  - *Rejected:* Rouvalière ("Rouvière" maintenance and renovation firms; surname).

## P2. Maître Lenoir: High, rename
- **Searched:** `"Maître Lenoir" avocat Paris`.
- **Hits:** https://www.keskeces.fr/avocat/sarah-lenoir-75001-paris.html · https://www.bestlawyers.com/lawyers/sarah-lenoir/328555 · https://www.legal500.com/rankings/ranking/c-france/compliance/237294-noelle-lenoir-avocats · https://www.lemondedudroit.fr/vie-des-cabinets/71533-noelle-lenoir-cabinet-avocates.html
- **Assessment:**
  - The character is the **fake lawyer** in a fraude-au-président call.
  - "Maître Lenoir" in Paris names real practising lawyers, one of them a public figure.
  - Even though the scene says he is an impostor, it attaches a real lawyer's name to a scam script.
- **Alternative (checked 2026-11-19):**
  - **Maître Vellacourt**: `"Maître Ostrelle" OR "Maître Vellacourt" OR "Vellacourt" avocat`. No lawyer or person found. Low.
  - Keep **Cabinet Ostrelle** as the firm name: no hits.

## P3. Volet Bleu: Low–Medium, keep with a check
- **Searched:** `"Volet Bleu" gestion OR location OR immobilier OR SAS`; `"Volet Bleu Gestion" OR "voletbleu" OR "volet-bleu.fr"`; `"Les Volets Bleus" agence immobilière OR gestion locative OR SCI`.
- **Hits:**
  - "Les Volets Bleus" company, SIREN 978118412 (https://rubypayeur.com/societe/les-volets-bleus-978118412; the page didn't load, so the activity is not confirmed).
  - Many unrelated SIRENE extracts.
  - Results for estate agencies returned only network agencies, no "Volet Bleu".
- **Assessment:**
  - It's a common descriptive phrase ("blue shutter"), and no letting or property-management business was found under it.
  - It is impersonated in 3-7 through a look-alike address, so a human should confirm the SIREN's activity. If it is property management or letting, rename to a coined stem.
  - **Clef d'Ocre** is *not* a safer fallback, because it sounds like "La Clef d'Or" estate agencies (https://www.verdontourisme.com/en/?p=105439).

## P4. Account holders on fraud accounts
- **Why it matters:** in a VoP **match** (boss) and in 3-8, the screen tells the player that this real-looking name holds a fraud or mule account. That name must not belong to a real company or a public person.
- **"Ardoise Ateliers SAS" → replace.**
  - **Searched:** `"Ardoise Ateliers" OR "Ateliers Ardoise" OR "L'Atelier Ardoise"`.
  - **Hits:** https://mom.maison-objet.com/en/brand/13710/ardoise-design · https://www.ardoise.lu/about-3-2?lang=en · https://www.rathscheck.de/wp-content/uploads/2026/02/RS_Broschuere_L_Ardoise_12s_FR_Digital.pdf. No exact "Ardoise Ateliers", but the word is a live brand in craft and design.
- **Coined alternatives (checked 2026-11-19):**
  - **Tessivane SAS** (for 3-2): `"Tessivane"`; `"Tessivane" OR "Morvenac" SAS société pappers OR societe.com`. No exact hit. Nearest is "Tesseva Conseil" (Rubypayeur, SIREN 106052228, consulting), which is a different word. Low.
  - **Morvenac SAS** (for the boss; different from 3-2's): `"Morvenac"`. No exact hit. Near the commune Moréac and the Morvan region, and "Morvan Consulting" exists, but the coined form is distinct. Low.
  - **Orvasine SAS** (spare): `"Velquiane" OR "Orvasine"`. No hit (only "Orvana" game characters). Low.
  - **Note:** the boss's lawyer line mentions "Project Ardoise". As a code name built on a common noun it's acceptable, but if the holder is renamed, a neutral code name (e.g. "Projet Lys") avoids an echo of the old holder.
- **"N. Ferrand" → replace.**
  - **Assessment:** Ferrand is a well-known public surname in France. Not searched in depth: the rule is "no public surname on a fraud account".
  - **N. Vardoulec**: `"Vardoulec"`; `"Vardoulec" OR "Brumetier" nom de famille`. No person or genealogy hit; it reads as a plausible Breton surname. Low.
  - **N. Brumetier** (alt): no hit beyond the generic word "brume". Low.
  - *Rejected:* Quessaint (sounds like Ouessant / Quessoy, place names).

## Actions for ux-artist / scenario-writer (Paris)
1. **Rename Pressoria → Platinoir** (High), including the `pressoria.example` stem and the `pressoria_transfer` id if it shows anywhere.
2. **Rename Maître Lenoir → Maître Vellacourt** (High). Keep Cabinet Ostrelle.
3. **Replace the holders:** "Ardoise Ateliers" (3-2) → **Tessivane SAS**; "Ardoise Ateliers SAS" (boss) → **Morvenac SAS** (spare: Orvasine SAS); "N. Ferrand" (3-8) → **N. Vardoulec** (alt: N. Brumetier).
4. **Keep:** Ruchelune, Larchwick Pro, Volet Bleu (human checks SIREN 978118412's activity before G4), Feuillemont, Cuivrelin, Cabinet Ostrelle, Solène Arbogast, Bastien Morel, Inès Roussel.
5. **Don't use** Clef d'Ocre Locations as the fallback.
6. **Before G4:** INPI + company-directory check (annuaire-entreprises.data.gouv.fr) + TMview for all Paris names. This check is not legal clearance.

---

# Madrid and Warsaw names (chapters 4 and 5), checked 2026-11-19

**Owner:** fraud-researcher · **Searched:** 2026-11-19 · **Status:** draft for sceptic review · roles from `docs/GDD.md` §24 and §25 (commit 470bc31).

## Method and limits (Madrid / Warsaw)
- Same method and limits as above: one web search index (US-based). It surfaced Spanish company-directory pages (BORME PDFs, eInforma, Infonif, Empresite, Iberinform, Eulerpool), Polish marketplace seller pages and app-store listings.
- **No trademark register, no Spanish Registro Mercantil / OEPM search, no Polish KRS / CEIDG / UPRP search, no WHOIS.** BORME PDFs that came up in results were **not opened one by one**, so an exact name inside a gazette PDF could be missed.
- Before G4 a human checks OEPM and the Registro Mercantil for the Spanish names, UPRP and KRS for the Polish ones, and TMview for all of them.
- **Domains:** the game uses `.example` hosts (Red Line 3), so `votelark-vote.example` needs no collision check; the check is about the *name*.
- **Not checked:** "MERCADO PUESTO 14" (generic card descriptor, per coordinator). Smykowo is dropped (it evokes a real retailer) and was not researched.

## Summary (Madrid / Warsaw)
| Slot | Name | Closest hits | Risk | Recommendation |
|---|---|---|---|---|
| Madrid: holder of the "safe" account (4-9 boss, VoP **match**) | **Olvarde Custodia SL** | none for "Olvarde"; only Olivares / Olave / Olvera-type names; "Custodia" is a generic word in many Spanish company names | Low | **Keep** |
| same slot, alternative | Corvaldo Custodia SL | no exact hit; Corvina (corvina.io, IoT), Corvari / Corvaglia (Italian sole traders); faint echo of **CorVel** (the reason Corvelle was renamed in T-1.7) | Low–Medium | Spare only |
| same slot, alternative | Mirtelo Custodia SL | **MIRTILO SL** (registered Spanish company, Bilbao), one letter away; also Mirtel, Mirtexo | Medium | **Don't use** |
| Madrid: name the caller gives (4-5) | **Larchwick Reserva** | no "Larchwick" anywhere; **Larchago Reserva** (Rioja wine, Bodegas Larchago); **Banreservas** (Dominican state bank with a Madrid office) uses "Reservas" | Low | **Keep** (built on the game's own bank brand) |
| Warsaw: vote page (5-2) | **Votelark** (`votelark-vote.example`) | no exact hit; Vote Owl, VOTEism, Votemar, ActiVote (US/other voting apps); "Lark" is an unrelated office suite | Low | **Keep** |
| same slot, alternative | Cheerpoll | no app or company; "Cheerleaders' Choice" fan votes (US cheer sites) | Low | Spare |
| same slot, alternative | Tunepoll | no exact hit; **TinyPoll** (live poll app, App Store and Product Hunt), a near sound-alike in the same sector | Low–Medium | Spare only |
| Warsaw: shop that receives the code payment (5-6, payee "TREMOLIK") | **TREMOLIK** | no exact hit; only "tremolo" (generic music term, guitar-effect listings); Tremach Sp. z o.o. (PL, different word and sector) | Low | **Keep** |
| same slot, alternative | Basovia | no shop or company; **Basowiszcza / Basovišča**, a real Belarusian-minority rock festival held in Poland (Wikipedia) | Medium (music sector, Polish context) | **Don't use** |

## MW1. Olvarde Custodia SL: Low, keep

- **Designer cross-check (GDD §24.10, moved here because the docs brand test forbids real names outside docs/patterns/):** compared against Spanish banks and custody firms Santander, BBVA, CaixaBank, Sabadell, Bankinter, Unicaja, Kutxabank, Abanca, Ibercaja, Cajamar, Openbank, EVO, Cecabank, Inversis, Allfunds and Renta 4: no resemblance.
- **Searched:** `"Olvarde" company OR empresa`; `"Olvarde Custodia" OR "Custodia SL" sociedad`; `"Olvarde" OR "Olvarde SL" OR "Olvarde Custodia"`.
- **Hits:**
  - No company, brand or person called "Olvarde".
  - Results were unrelated near-names: Olivar Haza del Conde SL (eInforma), Olave Capital Investments SL (trademarks on Justia), Olivarte, Olva Courier (Peru).
  - "Custodia" query: generic company names such as Archivos Custodia, Custodium Lapis SL, Custodians Levante SL, plus BORME PDFs (not opened).
- **Assessment:**
  - The name is shown on a VoP **match** as the holder of a fraud account, so it must not belong to a real company.
  - No hit for the coined stem. "Custodia" is a common Spanish word, and the full name "Olvarde Custodia SL" did not appear.
  - A human should still check the Registro Mercantil before G4.
- **Alternatives:**
  - **Corvaldo Custodia SL:** `"Corvaldo" empresa OR company OR custodia`; `"Corvaldo" OR "Corvaldo SL"`. No exact hit. Low–Medium: the "Corv-" start echoes CorVel (US insurance services), which T-1.7 avoided for the bank. Acceptable as a spare.
  - **Mirtelo Custodia SL:** `"Mirtelo" empresa OR company OR SL`; `"Mirtelo" OR "Mirtelo SL" OR "Mirtelo Custodia"`. Closest hit: **MIRTILO SL**, Bilbao (Eulerpool company listing, https://eulerpool.com/da/virksomheder/ES/MIRTILO%20SL,Bilbao,BI-3627-8), one letter away and also an SL. Also Mirtel (dateas), Mirtil (Iberinform). Don't use: on a fraud-account match this is too close to a real Spanish company.

## MW2. Larchwick Reserva: Low, keep
- **Searched:** `"Larchwick Reserva" OR "Larchwick" bank`; `"Larchwick" company OR bank OR reserva OR app`; `banco "Reserva" España banco OR "cuenta reserva" entidad Banreservas España`.
- **Hits:**
  - No "Larchwick" in any sector (this confirms T-1.7). The bank-app searches returned only unrelated banks (Barwick Banking Company, Banca March).
  - **Larchago Reserva**: a Rioja wine (Bodegas Larchago / Familia Chávarri). It shares "Larch-" + "Reserva", but it is a wine, not a financial business.
  - **Banreservas** (Banco de Reservas de la República Dominicana) has had a representative office in Madrid since 2022–23 (Diario Libre, Revista Mercado). Its name is "Banreservas", not "Reserva", and the game name leads with Larchwick.
  - The Banco de España customer site notes that "banco" is a reserved term. The game name doesn't use "Banco", so this doesn't apply.
- **Assessment:** this is the false name a scam caller gives, built on the game's own fictional bank. No real "Larchwick" exists, and "Reserva" is a generic word. Keep. Don't change it to "Banco Larchwick Reservas" or anything close to "Banreservas".

## MW3. Votelark (`votelark-vote.example`): Low, keep
- **Searched:** `"Votelark" app OR vote OR poll`; `"Vote Lark" OR "Votelark" OR "VoteLark.com"`; `"Votelark" OR "Vote-lark" Poland OR głosowanie OR konkurs`.
- **Hits:**
  - No exact hit.
  - Voting apps with different names: Vote Owl, VOTEism, Votemar, ActiVote, VoteMeApp (App Store).
  - The Polish query returned only real public votes (gov.pl WSIS instructions; a bank's online vote; a tourism-blogger vote), none named Votelark.
- **Assessment:** the coined name has no collision. **Note for writers:** real Polish institutions run legitimate online votes, which is why the scenario must keep the tell on the *code banner* ("registers your Kettle account on a new device"), not on "online votes are fake".
- **Alternatives:**
  - **Cheerpoll:** `"Cheerpoll" app OR poll OR voting`; `"Cheer Poll" OR "CheerPoll" OR "cheerpoll.com"`. No app. Only cheerleading fan-vote pages (Varsity) and generic poll apps (Pollie, PollBooth, Expoll). Low.
  - **Tunepoll:** `"Tunepoll" app OR poll OR music vote`; `"Tune Poll" OR "TunePoll" OR "tunepoll.com"`. No exact hit. **TinyPoll** (live poll app, https://apps.apple.com/us/app/id1337251012, also on Product Hunt) is a near sound-alike in the same sector. Low–Medium.

## MW4. TREMOLIK (payee on the code confirmation): Low, keep
- **Searched:** `"Tremolik" OR "Tremolik sp. z o.o." sklep`; `"Tremolik" OR "Tremolík"`; `"Tremolik" sklep OR shop OR company OR "Tremolik.pl"`; `"Tremolo" sklep muzyczny OR "tremolo.pl"`.
- **Hits:**
  - No company, shop or seller named Tremolik.
  - Results: generic "tremolo" (music term; guitar-effect product pages at large music retailers), Polish marketplace seller pages with unrelated names, and Tremach Sp. z o.o. (EMIS profile, different word).
  - No Polish music shop trading as "Tremolo" surfaced. The "tremolo.pl" query returned only retailer product pages.
- **Assessment:** the coined form with the Polish "-ik" ending has no hit. Keep. Show it only as the payee in capitals on the confirmation, as specified.
- **Alternative:**
  - **Basovia:** `"Basovia" sklep OR shop OR company`; `"Basovia" OR "Basowia" music OR muzyka OR instrumenty`; `"Basovia" OR "Bassovia" OR "basovia.pl"`. No shop or company, but **Basowiszcza / Basovišča** is a real music festival held in Poland (https://en.wikipedia.org/wiki/Basowiszcza). A music-shop payee named Basovia is too close in sector and sound. Medium. Don't use.

## Actions for ux-artist / scenario-writer (Madrid / Warsaw)
1. **Keep:** Olvarde Custodia SL (4-9 boss holder), Larchwick Reserva (4-5 caller's name), Votelark / `votelark-vote.example` (5-2), TREMOLIK (5-6 payee).
2. **Spares, if a second name is needed:** Corvaldo Custodia SL (Low–Medium), Cheerpoll (Low), Tunepoll (Low–Medium).
3. **Don't use:** Mirtelo Custodia SL (MIRTILO SL, Bilbao), Basovia (Basowiszcza festival). Smykowo was already dropped.
4. **Before G4:** OEPM + Registro Mercantil (ES), UPRP + KRS (PL), and TMview for all kept names. This check is not trademark or legal clearance.

---

# Rome and Lisbon names (chapters 6 and 7), checked 2026-11-19

**Owner:** fraud-researcher · **Searched:** 2026-11-19 · **Status:** draft for sceptic review · roles from `docs/GDD.md` §26.10 and §27.10 (branch in /home/user/sae-rlspec).

## Method and limits (Rome / Lisbon)
- Same method and limits as above: one web search index (US-based), which surfaced UK Companies House pages, app-store listings, Italian company directories and holiday-let listings. One result page was opened (a place page, RL1).
- **No trademark register, no Italian Registro Imprese / UIBM search, no Portuguese RNPC / INPI-PT search, no WHOIS.** Before G4 a human checks these and TMview for every kept name.
- **Domains:** `.example` hosts are reserved (RFC 2606), so the check is about the *names*.
- **People:** same test as Paris (no notable person with the exact name; no real professional in an impersonated or accused role).

## Summary (Rome / Lisbon)
| # | Name (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|---|
| RL1 | **Roostwell** (rental platform; genuine, and impersonated by look-alikes) | no exact hit; **Student Roost** (UK student-accommodation operator with a resident app); "Roost" startups; Rothwell (place) | Low–Medium | **Keep** (watch item) |
| RL1 | Tilestay (alternative) | no exact hit; **Tiles Apartments** (guest flats, Porto) and "Tiles Apartment" holiday-let listings | Low–Medium | Spare |
| RL1 | Hearthlane (alternative) | no exact hit; **Hemlane** (US rental-management software), a near sound-alike in the sector | Low–Medium | Spare |
| RL2 | **Kerbello** (official parking app and operator; genuine, and impersonated by look-alikes) | no exact hit; **Kerb**, a parking app (launched in Dublin, the UK incl. Edinburgh, and Australia): same sector, and "Kerbello" starts with its whole name | **Medium** | **Rename** → **Zonelet** (spare: Lanefare) |
| RL2 | Zonelet (alternative) | no product; only "Zonelets" (a static-blog template) and code identifiers | Low | **Use** |
| RL2 | Lanefare (alternative) | no hit at all | Low | Spare |
| RL3 | **Vellastri Tutela Srl** (holder of the boss's close-match fraud account) / caller's spelling "Velastri Tutela" | no hit for Vellastri or Velastri; "Tutelia Credit Srl" (Rome, credit company) is a different word | Low | **Keep** |
| RL3 | Corvessa Tutela Srl (alternative) | no exact hit; "Corvino" (person), "Corv-" names | Low (faint CorVel echo, as Corvaldo) | Spare |
| RL4 | **J. Ashdale** (holder of 6-4's match account) | "Ashdale" is used by many UK companies (Ashdale UK Ltd, Ashdale Investments, Edward Ashdale Ltd); no notable person "J. Ashdale" | Low | **Keep** |
| RL4 | **casa.alfama** (scam host handle, 7-6) | **"Casa d'Alfama"**: a real Lisbon holiday-let listing and a holiday-flat listing "Casa d'Alfama by Lisbon Village Apartments"; many "Casa … Alfama" lets | **Medium** | **Replace** with a coined handle, e.g. **casa.velarim** |
| RL4 | **Roostwell Deals** (scam ad page, 7-3) | derived from Roostwell (RL1); no separate hit | Low | **Keep** (follows RL1) |
| RL4 | **Leonor Brito** (borrowed name on the boss's no-match transfer) | no notable person; the name appears on Portuguese university theses (private individuals); "Leonora Brito" (Welsh writer) is a different name | Low | **Keep** |

## RL1. Roostwell: Low–Medium, keep (watch item)
- **Searched:** `"Roostwell"`; `"Roost" rental OR "holiday lets" OR "student rooms" app platform`; `"Tilestay" OR "Hearthlane" app OR rental OR company`; `"Tilestay"`; `"Hearthlane"`; `"Tilestay" OR "Tile Stay" rental OR alojamento OR app`.
- **Hits:**
  - No "Roostwell" in any sector. Results were Rothwell (place names) and UK companies "Roost Hills", "Roost Inventories", "Rostella".
  - **Student Roost**: UK student-accommodation operator with a resident app (App Store id6504027653; https://company.studentroost.co.uk/news/student-roost-launches-new-resident-app). Same sector as Beatriz's room hunt, but the name is "Student Roost", not "Roostwell", and "roost" is a common English word.
  - **Tilestay:** no exact hit. A Wanderlog place page (https://wanderlog.com/place/details/4657969) turned out to be **Tiles Apartments**, Porto, and there is a "Tiles Apartment" holiday-let listing. Same sector and country, but a different name.
  - **Hearthlane:** no hit (only "Hearthstone" game pages). The earlier combined query surfaced **Hemlane** (US rental-management software, https://linkedin.com/company/hemlane), which sounds close.
- **Assessment:** all three are Low–Medium, so there is no reason to switch. Keep Roostwell. Roostwell is spoofed by `roostwell-*.example` look-alikes, so re-check it before G4. If the sceptic wants no "roost" overlap with student housing, Tilestay is the spare, but it brings its own Portuguese "Tiles" overlap.

## RL2. Kerbello: Medium, rename → Zonelet
- **Searched:** `"Kerbello"`; `"Kerb" parking app OR "Kerbi" parking`; `"Lanefare" OR "Zonelet" parking OR app OR company`; `"Zonelet"`; `"Lanefare"`.
- **Hits:**
  - No "Kerbello" (only Zerbolò, Cerbali, Bello and other unrelated words).
  - **Kerb**: a parking app (App Store id1134472576) that launched in Dublin (https://www.completecar.ie/car-news/article/9187/Kerb-launches-parking-app-for-Dublin) and in the UK, incl. Edinburgh (https://www.transportxtra.com/publications/parking-review/news/59647/australian-kerb-parking-rental-app-launched-in-uk). Crunchbase lists it as "kerb-2".
  - **Zonelet:** only "Zonelets", a static-blog template (https://zonelets.itch.io/), and code identifiers ("ZoneList").
  - **Lanefare:** no hit at all.
- **Assessment:**
  - In 7-2 and 7-7 the game shows **look-alikes of this brand** (`kerbello-pay.example`, `kerbello-multas.example`) on fake parking stickers and slips.
  - A name that begins with a real European parking app's entire name, in the same sector, risks teaching players to distrust that app's codes. This is the same reasoning as Nodkey and Corvelle. Rename.
- **Recommendation:** **Zonelet** (fits "Zona 2 / Zona 3" on the meters). Hosts `zonelet.example`, look-alikes `zonelet-pay.example` (7-2) and `zonelet-multas.example` (7-7). Spare: **Lanefare**.

## RL3. Vellastri Tutela Srl: Low, keep
- **Designer cross-check (GDD §26.10, moved here because the docs brand test forbids real names outside docs/patterns/):** compared against Italian banks and trustee or custody firms Intesa Sanpaolo, UniCredit, Banco BPM, BPER, Monte dei Paschi, Mediobanca, Fineco, Credem, Banca Generali, Unione Fiduciaria, Sirefid and Cordusio Fiduciaria. No resemblance. This list is from general knowledge; I did not search each name.
- **Searched:** `"Vellastri" OR "Velastri" OR "Vellastri Tutela"`; `"Corvessa" OR "Corvessa Tutela" Srl`; `"Tutela Srl" società fiduciaria OR custodia`; `"Tutela" fiduciaria Srl OR "Tutela Fiduciaria" OR "Tutela Patrimoniale Srl"`.
- **Hits:**
  - No company, brand or person called Vellastri or Velastri. Results were unrelated regional gazette PDFs that matched the word "tutela".
  - "Tutela" queries: only articles on fiduciary companies, the Banca d'Italia's page on *società fiduciarie*, and **Tutelia Credit Srl** (Rome, https://registroaziende.it/azienda/tutelia-credit-srl-roma). That is a different word ("Tutelia"), and the game's name leads with the coined "Vellastri".
  - Corvessa: no exact hit (a person named Corvino; law-firm pages).
- **Assessment:** this name is shown on a close match as the holder of a fraud account, so it must not belong to a real company. No hit for the coined stem. Keep "Vellastri Tutela Srl" and the caller's spelling "Velastri Tutela". Don't shorten it to "Tutela Srl" anywhere, because "tutela" is generic and appears in real company names. Corvessa is a spare, with the same faint CorVel echo as Corvaldo (MW1).

## RL4. Person and handle names
- **J. Ashdale (6-4, match on a stranger's account): Low, keep.**
  - Searched: `"J. Ashdale" OR "John Ashdale" OR "James Ashdale"`; `"Ashdale" company OR limited OR surname`.
  - No person "J. Ashdale" was found (only Ashdown and Ash names). "Ashdale" appears in many UK company names (Ashdale UK Ltd, Ashdale Investments, Ashdale Homes, Edward Ashdale Ltd: https://pay.company-information.service.gov.uk/company/07644782), mostly as a place-style name.
  - The game shows an initial plus a surname, not a company, so it doesn't collide with those firms. Keep. The alternatives "J. Brenmoor" and "J. Callery" were not searched. Callery is a real Irish surname; that alone is fine, but don't switch to it without a check.
- **casa.alfama (7-6 scam host handle): Medium, replace.**
  - Searched: `"casa.alfama" OR "casaalfama" OR "Casa Alfama" alojamento Lisboa`; `"Casa Alfama" Lisboa`.
  - Hits:
    - **"Casa d'Alfama"**, a real Lisbon holiday-let listing (https://airbnb.com/h/calf);
    - "Casa d'Alfama by Lisbon Village Apartments" (https://www.gites.fr/gites_casa-d-alfama-by-lisbon-village-apartments_lisbonne_h534491_en.htm);
    - many "Casa … Alfama" listings.
  - The handle belongs to the **fraudulent host** in a rental scam set in Alfama, so it would put a real letting's name on a scam prop (Red Line 1). Replace it with a coined handle: **casa.velarim** (`"casa.velarim" OR "Velarim"`: no hit, only "Casa Velar" (architecture, Italy) and "Velaris" (wedding favours)). Update the look-alike path to `roostwell-securepay.example/casa-velarim`.
- **Roostwell Deals (7-3 scam ad page): Low, keep.** It follows RL1. The scenario's page detail ("page created 3 weeks ago") already marks it as a fake page named after the platform.
- **Leonor Brito (boss beat 2, borrowed name; VoP doesn't match): Low, keep.**
  - Searched: `"Leonor Brito"`.
  - The name appears only on Portuguese university repositories (theses by private individuals: https://run.unl.pt/handle/10362/177972). "Leonora Brito" is a Welsh writer (different first name). No notable person.
  - Both parts are very common in Portugal. On screen, the check says the account is **not** held by this name, so no real person is labelled as a fraud-account holder.

## Actions for ux-artist / scenario-writer (Rome / Lisbon)
1. **Rename Kerbello → Zonelet** (Medium): `zonelet.example`, `zonelet-pay.example`, `zonelet-multas.example`. Spare: Lanefare.
2. **Replace the host handle casa.alfama → casa.velarim** (Medium), including the `/casa-alfama` path.
   - *Note (T-3.9, producer-accepted 2026-11-19):* in game content the handle is written **casa_velarim** (underscore), because the red-line linter reads "casa.velarim" as a domain. Same coined name, same search result; the page path stays `/casa-velarim`.
3. **Keep:** Roostwell (watch item; spares Tilestay, Hearthlane), Roostwell Deals, Vellastri Tutela Srl / "Velastri Tutela" (spare Corvessa Tutela Srl), J. Ashdale, Leonor Brito.
4. **Before G4:** Registro Imprese and UIBM (IT), RNPC and INPI-PT (PT), and TMview for all kept names. This check is not trademark or legal clearance.

---

# Dublin and Stockholm names (chapters 8 and 9), checked 2026-11-19

**Owner:** fraud-researcher · **Searched:** 2026-11-19 · **Status:** draft for sceptic review · roles from `docs/GDD.md` §28.10 and §29.10 (branch in /home/user/sae-dsspec).

## Method and limits (Dublin / Stockholm)
- Same method as above: one web search index (US-based), which surfaced app-store listings, company directories (UK Companies House, Swedish ratsit/krafman, CB Insights, Crunchbase), Wikipedia and Irish news. One page was opened (Trustpilot, DS10).
- **No trademark register, no Irish CRO / CBI register search, no Swedish Bolagsverket / Finansinspektionen register search, no WHOIS.** Before G4 a human checks those and TMview.
- **People:** the Paris test, made **strictest for the fictional celebrity**: no real person with the name, and no real public figure in the same role whose name is one letter or one sound away.
- **Domains:** `.example` hosts are reserved (RFC 2606); the check is about the names.

## Summary (Dublin / Stockholm)
| # | Name (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|---|
| DS1 | **Fairmeasure** (in-world financial regulator; genuine; look-alike `fairmeasure-claims.example`) | no hit; only "fairness measures" in machine-learning papers | Low | **Keep** |
| DS2 | **Cormac Tierlan** (fictional TV presenter in a fake investment ad) | no "Tierlan" anywhere; but **Tommy Tiernan**, a famous Irish TV presenter (his own chat show), is one letter away in surname and in the same role; real Irish broadcasters named Cormac also exist | **Medium** (strictest test fails) | **Rename** → **Orla Fennick** |
| DS2 | Orla Fennick (alternative) | no "Fennick" presenter; Orla is a common first name (several broadcasters with other surnames) | Low | **Use** |
| DS2 | Dara Quillan (alternative) | **Dara Quilty**, a real Irish radio broadcaster, is close; Dara Ó Briain is a famous Irish presenter | Medium | **Don't use** |
| DS3 | **Natterly** (fictional social network where scam ads appear) | **Natterly**: an exact-name social / AI-chat app on the Japanese App Store; a "Natterly" company on StackShare and SaaSworthy; **Natter**, a former UK social network (Wikipedia) and a current "natter." app | **High** | **Rename** → **Postwick** |
| DS3 | Postwick (alternative) | a village near Norwich (UK); no app, company or brand found | Low | **Use** |
| DS3 | Chatterbrook (alternative) | no exact hit; "Chatter Social" app is near | Low–Medium | Spare |
| DS4 | **Quorvex** (scam-only trading platform) | no exact hit; "Qorvex" (a game character), Qoronex Ltd, "Quorionex" (a broker listing on a broker-review site), QuiverX | Low–Medium | **Keep** |
| DS5 | **Glimmerfund** (scam-only, Alex arc platform) | no exact hit; "Glimmer" (an Austin investor profile on CB Insights), "Gimmelfund" | Low–Medium | **Keep** |
| DS6 | **Tollmere Invest** (genuine authorised firm; impersonated by the clone `tollmere-invest.example`) | **Tollymore Investment Partners LLP**: a real UK investment manager (Companies House OC423323; investor letters in finance press), one sound away, same sector | **Medium–High** | **Rename** → **Ellisfen Invest** |
| DS6 | Ellisfen Invest (alternative) | no hit (only Ellisfield, a place, and the name Ellisif) | Low | **Use** |
| DS6 | Brackwater Invest (alternative) | **Breakwater Investment Management / Breakwater Investments** (real investment firms) | Medium | **Don't use** |
| DS7 | **Backhaven Recovery** (scam-only "recovery agency") | no hit (only backup or recovery software pages) | Low | **Keep** |
| DS8 | **Kindhand** / "Kindhand Support" (fictional helper app, scam prop) | no exact hit; "Kind Hands" (an NZ childcare centre; a hand-cream product); "KindConnect" app; no remote-access or support app named Kindhand | Low | **Keep** |
| DS9 | Cast: **Declan Byrne**, **Róisín Byrne** (Dublin) | common Irish names; a Dublin university academic named Declan Byrne and a Maynooth researcher named Róisín Byrne (private individuals); no notable person | Low | **Keep** (genuine characters, never accused) |
| DS9 | Cast: **Birgitta Lind** (Stockholm) | no person found under the exact name (only Birgitta Lindström / Lindqvist on Wikipedia; "Gitta Lind", a German singer, is a different name) | Low | **Keep** |
| DS9 | Cast: **Jamal Haddad**, **Lina Haddad** (Stockholm) | a corporate "Jamal Haddad" on a stock-insider site and an NGO staff page (private individuals); no notable person; Haddad is a very common surname | Low | **Keep** |
| DS10 (extra) | **Harbourline Bonds** (drill 8-4; named on the in-world **warning list**) | no exact hit; Harborline Ltd (UK), Harbour Asset Management bond funds (NZ), Harbour Investment Partners (corporate bonds press release) | Medium (an accused name close to real bond sellers) | **Replace** → **Brindlecove Bonds** |
| DS11 | **Fairmeasure Claims Ltd** (boss beat 3 fraud payee, borrowing the regulator's name) | no exact hit; UK claims firms **Fair Claims Limited**, Fair Claims Accident Management Ltd, Fairclaim Assist Ltd, Claim Fair Ltd | Low–Medium | **Keep** (the coined "Fairmeasure" leads); spare **Fairmeasure Restitution Ltd** |
| DS12 | **"Money Today with Cormac"** (8-2 scam ad page) | no exact show; "Money Today" is a generic phrase used by finance titles (not opened); Irish consumer and broadcaster money features have other names | Low (the name follows DS2) | **Rename with DS2** → "Money Today with Orla"; spare "The Savings Hour with Orla" |
| DS10 (extra) | **Norrvik Trygg AB** (boss beat 2 payee) | no exact hit; **Norrvik** (a Dutch panel webshop, norrvik.nl); Norrviken Fastigheter AB; "Trygg" echoes the insurer Trygg-Hansa, but it is a common Swedish word ("safe") | Low–Medium | **Keep**, or **Skarvlund Trygg AB** for zero overlap |

## DS1. Fairmeasure: Low, keep
- **Searched:** `"Fairmeasure"`.
- **Hits:** none as a name; results were "fairness measures" (machine-learning fairness papers, a GitHub page).
- **Assessment:** the in-world regulator must never look like a real one; the name doesn't. Alternatives (Truebalance, Steadweight) were not searched, because they aren't needed.

## DS2. Cormac Tierlan: Medium, rename → Orla Fennick
- **Searched:** `"Cormac Tierlan" OR "Tierlan"`; `"Cormac" presenter RTÉ OR "TV presenter" "Tierlan" OR "Tiernan" Cormac`; `"Orla Fennick" OR "Fennick" presenter OR Ireland`; `"Dara Quillan" OR "Quillan" presenter Ireland`.
- **Hits:**
  - "Tierlan": no person, brand or place. Results drifted to Tiernan and Tierney.
  - **The Tommy Tiernan Show** (Wikipedia): Tommy Tiernan is a well-known Irish TV presenter. "Tierlan" is one letter from "Tiernan".
  - Real broadcasters named Cormac (e.g. Cormac Ó hEadhra on RTÉ radio; Cormac Battle, Wikipedia) have different surnames.
  - **Dara Quilty** (Irish radio broadcaster: https://www.hotpress.com/music/dara-quilty-finishes-irish-radio-career-top-imro-22790856) is close to "Dara Quillan". Dara Ó Briain is a famous Irish presenter.
  - "Fennick": no presenter or public figure. Irish broadcasters named Orla (Orla O'Donnell, Orla Chennaoui) have unrelated surnames.
- **Assessment:**
  - In 8-2 the character is a TV presenter whose face sells a fake investment. Real Irish public figures are impersonated in exactly such ads, so a near-homophone of a famous Irish TV host's surname, in the same role, fails the strictest test, even though the first name differs.
  - **Orla Fennick** passes: no person found, and the surname is coined.
  - The illustration must not resemble any real Irish presenter (ux-artist).
- **Knock-on:** rename the ad page to "Money Today with Orla" (or another neutral title).

## DS3. Natterly: High, rename → Postwick
- **Searched:** `"Natterly" app OR social OR company`; `"Natterly" social network app`; `"Postwick" OR "Chatterbrook" app OR social network`; `"Postwick" company OR app OR brand`.
- **Hits:**
  - **Natterly**: a social / AI voice-conversation app on the Japanese App Store (https://apps.apple.com/jp/app/natterly-%E3%83%8A%E3%82%BF%E3%83%AA%E3%83%BC-ai%E3%81%A8%E3%81%AEsns-%E9%9F%B3%E5%A3%B0%E4%BC%9A%E8%A9%B1/id6737235306); company pages https://stackshare.io/companies/natterly and https://www.saasworthy.com/product/natterly.
  - **Natter** (former UK social network, https://en.wikipedia.org/wiki/Natter_(social_network)); a current "natter." app; "Nattergram".
  - Postwick: no company, app or brand. It is a village name, and searches returned only "Post…" products (Postworks, Postify).
- **Assessment:** an exact-name social app exists. The game shows scam ads *on* this network, so players could link a real app with scam ads. Rename. **Postwick** (`postwick.example`) has no product collision. Chatterbrook is a spare (near "Chatter Social").

## DS4. Quorvex: Low–Medium, keep
- **Searched:** `"Quorvex"`.
- **Hits:** no exact hit. Near forms: Qorvex (a game character), Qoronex Ltd (Crunchbase), "Quorionex" (a broker profile on a broker-review site: https://www.fastbull.com/brokersview/brokers/quorionex), QuiverX (crypto), Quantvex.
- **Assessment:** the coined form is distinct. The closest finance hit is a different word. Keep; re-check before G4.

## DS5. Glimmerfund: Low–Medium, keep
- **Searched:** `"Glimmerfund" OR "Glimmer Fund"`.
- **Hits:** no exact hit. Nearest: a "Glimmer" investor profile (https://www.cbinsights.com/investor/glimmer-austin), "Gimmelfund" (startup directory), unrelated funds.
- **Assessment:** keep. It appears only in the arc, as a scam platform. Don't shorten it to "Glimmer".

## DS6. Tollmere Invest: Medium–High, rename → Ellisfen Invest
- **Searched:** `"Tollmere" OR "Tollmere Invest"`; `"Tollymore Investment Partners"`; `"Brackwater Invest" OR "Ellisfen" OR "Brackwater" investment`; `"Ellisfen"`.
- **Hits:**
  - **Tollymore Investment Partners LLP**: UK investment manager (https://pay.company-information.service.gov.uk/company/OC423323), with investor letters and returns coverage in the finance press (e.g. https://hedgefundalpha.com/strategies/tollymore-generates-20-per-annum-returns-since-inception/). Tollymore is also a well-known forest park in Northern Ireland.
  - Breakwater Investment Management / Breakwater Investments (real) for "Brackwater".
  - "Ellisfen": no hit (Ellisfield, a place; Ellisif, a name).
- **Assessment:** "Tollmere Invest" is one sound from a real investment firm, in the same sector, and it is the firm the boss **clones**. That would show a real manager's near-name on a scam email and call. Rename to **Ellisfen Invest**: `ellisfen.example` (genuine) and `ellisfen-invest.example` (clone). Brackwater: don't use.

## DS7. Backhaven Recovery: Low, keep
- **Searched:** `"Backhaven" OR "Backhaven Recovery"`.
- **Hits:** none; only backup and restore software pages and "Backstage Recovery" (a US trademark, different word).
- **Assessment:** keep for 8-3 and the Brussels ending C.

## DS8. Kindhand: Low, keep
- **Searched:** `"Kindhand" app OR support OR remote`; `"Kindhand"`.
- **Hits:** no remote-access, screen-sharing or support app named Kindhand. "Kind Hands" is an NZ childcare centre and a hand-cream product. The remote-support results were products with unrelated names (listed in search only, not used).
- **Assessment:** keep. The icon rule in GDD §29.10 (nothing like a real remote-access icon) still applies.

## DS9. Cast names: Low, keep
- **Searched:** `"Declan Byrne" OR "Róisín Byrne" Dublin`; `"Birgitta Lind" OR "Jamal Haddad" Stockholm`; `"Jamal Haddad" OR "Lina Haddad"`; `"Birgitta Lind"`.
- **Hits:**
  - Declan Byrne: a Dublin university academic in medical gerontology (https://www.tcd.ie/medicine/medical-gerontology/staff/medical-gerontology/dgbyrne/).
  - Róisín Byrne: a Maynooth research-archive author.
  - Jamal Haddad: a corporate insider listing (https://ca.marketscreener.com/insider/JAMAL-HADDAD-A0TMNL/) and an NGO staff page.
  - Birgitta Lind: only a Swedish phone-directory search page. "Gitta Lind" (German singer, Wikipedia) is a different name.
  - None of these is a notable public figure.
- **Assessment:** these are common names, and the characters are genuine and never accused or impersonated as scammers (Declan and Jamal are targeted, not fraudsters). Keep. The Byrne surname is shared by the two Dublin cast members, which is intended (father and daughter).

## DS10. Extra names on accused or fraud-account roles
- **Harbourline Bonds (drill 8-4, on the in-world warning list): Medium, replace.**
  - Searched: `"Harbourline Bonds" OR "Harbourline" investment OR finance`; `"Skarvlund" OR "Brindlecove"`.
  - Hits: Harborline Limited (UK, https://open.endole.co.uk/insight/company/13943058-harborline-limited); Harbour Asset Management's bond funds (NZ); a "Harbour Investment Partners" corporate-bond press release.
  - The drill says this name is on a regulator's warning list. That is an accusation close to real bond sellers' names. Replace with **Brindlecove Bonds** (no hit).
- **Norrvik Trygg AB (boss beat 2 payee in the signing banner): Low–Medium, keep or replace.**
  - Searched: `"Norrvik Trygg" OR "Norrvik" AB`; opened https://www.trustpilot.com/review/norrvik.nl (a Dutch webshop selling panels).
  - Also: Norrviken Fastigheter AB (Sweden). "Trygg" is a common word but also starts the name of a large Swedish insurer.
  - No exact company. Acceptable. For zero overlap use **Skarvlund Trygg AB** (no hit).

## DS11. Fairmeasure Claims Ltd: Low–Medium, keep (spare Fairmeasure Restitution Ltd)
- **Searched:** `"Fairmeasure Claims" OR "Fair Measure Claims" Ltd`.
- **Hits:**
  - No exact company.
  - UK claims-management firms with "Fair" + "Claim": **Fair Claims Limited** (https://pay.company-information.service.gov.uk/company/06528713), Fair Claims Accident Management Ltd, Fairclaim Assist Ltd, Claim Fair Ltd.
- **Assessment:**
  - On screen it is the holder of a fraud account (bank-details card). The coined "Fairmeasure" separates it from those firms, and borrowing the in-world regulator's name is the scam's point. Keep.
  - If the sceptic wants no "Fair… Claims" echo, use **Fairmeasure Restitution Ltd** (spare; not searched separately beyond the stem, which has no hits, DS1).
  - In Irish company format "Ltd" is right.

## DS12. "Money Today with Cormac": rename with DS2
- **Searched:** `"Money Today" TV show OR programme OR magazine Ireland OR UK`.
- **Hits:** no Irish or UK show called "Money Today". The results were other money programmes and features (RTÉ, the CCPC, newspaper podcasts) with different names. "Money Today" is a generic phrase that finance publications abroad also use (from general knowledge, not opened).
- **Assessment:** the page name carries the presenter's name, so it follows DS2 → **"Money Today with Orla"**. Spare: **"The Savings Hour with Orla"** (generic; no show found under that title in the same query family). The detail "Sponsored · page created 2 weeks ago" stays.

## DS10 spares, restated for the sceptic
- Harbourline Bonds → **Brindlecove Bonds** (primary replacement; no hit). A second spare is **Skarvlund Bonds**, which reuses the no-hit stem.
- Norrvik Trygg AB → **Skarvlund Trygg AB** (no hit for "Skarvlund"). It keeps the real Swedish "AB" company format, as the sceptic asked. Keep "AB", never "Ltd", for the Swedish payee.

## Actions for ux-artist / scenario-writer (Dublin / Stockholm)
1. **Rename Natterly → Postwick** (High): `postwick.example`.
2. **Rename Tollmere Invest → Ellisfen Invest** (Medium–High): `ellisfen.example`, clone `ellisfen-invest.example`, and the clone's display names.
3. **Rename Cormac Tierlan → Orla Fennick** (Medium, strictest test), and the ad page title. Never use Dara Quillan.
4. **Replace Harbourline Bonds → Brindlecove Bonds** (Medium). Optional: Norrvik Trygg AB → Skarvlund Trygg AB. Keep Fairmeasure Claims Ltd (spare Fairmeasure Restitution Ltd). The ad page becomes "Money Today with Orla" (spare "The Savings Hour with Orla").
5. **Keep:** Fairmeasure, Quorvex, Glimmerfund, Backhaven Recovery, Kindhand, and the cast names Declan Byrne, Róisín Byrne, Birgitta Lind, Jamal Haddad, Lina Haddad.
6. **Before G4:** CRO and the Central Bank register (IE), Bolagsverket and Finansinspektionen (SE), and TMview for all kept names. This check is not trademark or legal clearance.

---

# Brussels names and the Dublin / Stockholm marks (T-3.12b)

**Owner:** fraud-researcher · **Searched:** 2026-11-19 · **Status:** draft for sceptic review · roles from `docs/GDD.md` §30.11 (Brussels) and the ux-artist's mark sheet (scratchpad render `s6c/brands.png`, 2026-11-19).

## Method and limits (Brussels / marks)
- **Names:** one web search index (US-based), as above. One product page opened (Capterra, BR2).
- **Marks:** a visual comparison of the render against what the searches surfaced (app-store listings and product pages by name). **No reverse image search and no logo database** were available, so the mark verdicts rest on product listings and general knowledge of well-known icons. A human checks the marks against the EUIPO design register and TMview before G4.
- **No trademark register, no Belgian KBO/BCE company search, no WHOIS.**
- **Real line not named here.** The real Belgian card-blocking service is named only on the help card. Its name means "stop the card", so the test for BR1 is "no word or sound meaning stop, halt, block or card".

## Summary (Brussels / marks)
| # | Name or mark (role) | Closest hits | Risk | Recommendation |
|---|---|---|---|---|
| BR1 | **Marrowby** (genuine in-world card-blocking line; impersonated on boss beat 2) | no exact hit; English place names one letter away (Garrowby, Barrowby, Harrowby, Borrowby); no bank, card, fraud-line or Belgian service | Low | **Keep** |
| BR2 | **Easy Euro Club** / `@easy_euro_club` (scam-only money-mule recruiter, 10-4) | **EasyEuro**: a real white-label neobanking platform that opens euro and GBP accounts (Capterra, SourceForge listings) | **Medium** (a recruiter who asks for your account, named like a real account provider) | **Rename** → **Summer Euro Club** (`@summer_euro_club`) |
| BR2 | Summer Euro Club (alternative) | no exact hit (only unrelated "Summer Cup" pages) | Low | **Use** |
| BR2 | Quick Cash Crew (alternative) | no exact hit; "Quick Cash" is a common payday-lender phrase and a game item; "Cash Crew" (a music act) | Low–Medium | Spare only |
| BR3 | **Robin**, **Sacha** (alias names on the Alex reveal cards) | generic first names | Low | **Keep** |
| BR4 | **Kindhand** mark: a jade and peach life ring | the life ring is a common "help/support" symbol; real remote-support products include "Rescue"-named tools (an app-store listing surfaced); icon colours not verified | Low–Medium (watch item) | **Keep, with conditions** |
| BR5 | **Postwick** mark: wine and sand, a fan of three post cards | no social network, messenger or post service found with a wine square and stacked cards; national post brands use other colours (general knowledge) | Low | **Keep** |
| BR6 | **Ellisfen Invest** mark: bronze and cream, three reeds | the reeds read as a small bar chart, a common finance motif; no investment firm found with this mark | Low | **Keep** |
| BR7 | **Fairmeasure** (kind government, plain wordmark), re-check of DS1 | no hit | Low | **Keep** (DS1 confirmed) |

## BR1. Marrowby: Low, keep
- **Searched:** `"Marrowby"`.
- **Hits:** none as a brand, bank, card product, fraud line or Belgian service. The search returned English place names a letter away: Garrowby, Barrowby, Harrowby, Borrowby, Moorby (Wikipedia).
- **Assessment:**
  - **No meaning echo.** It has no word or sound for stop, halt, block or card, so it avoids the problem that sank Stillcard, Cardhalt and Haltwell.
  - **No real name.** It is a coined, place-like name and copies no real service.
  - It reads as a plausible service name in English. In French or Dutch it has no meaning.
- **Conditions:**
  - **Colours and number:** never the real line's colours. The number mask must not resemble the real line's number (GDD §30.4 rule).
  - **On screen:** "Marrowby, the card-blocking line", not "Marrowby Card Stop" or any wording that borrows the real line's name.

## BR2. Easy Euro Club: Medium, rename → Summer Euro Club
- **Searched:** `"Easy Euro Club" OR "easyeuroclub" OR "easy_euro_club"`; `"EasyEuro" money transfer OR app OR payments`; `"Summer Euro Club" OR "Quick Cash Crew" OR "Side Cash Squad"`. Opened https://www.capterra.com.au/software/212605/easyeuro.
- **Hits:**
  - **Exact phrase:** no club, app or service named "Easy Euro Club".
  - **EasyEuro** (https://www.capterra.com.au/software/212605/easyeuro, https://www.sourceforge.net/software/product/EasyEuro) is a real **white-label neobanking platform that opens euro and GBP accounts**; France is listed as its available country.
  - Other "Easy…" payment apps exist (EasySend, Easy-EP), but under different names.
  - **"Summer Euro Club":** no hit.
  - **"Quick Cash Crew":** no exact hit. "Quick Cash" is a common payday-lending phrase and a game item; "Cash Crew" is a music act.
- **Assessment:** the 10-4 recruiter asks a teenager for her account and login. A scam profile whose name is the real account provider's name plus "Club" puts a real fintech's name next to money-mule recruitment. That is the risk Red Line 1 is meant to avoid. **Rename to Summer Euro Club**, with the handle `@summer_euro_club` (no dot, as before). It also fits Noor's "summer job money" line.
- **Spare:** Quick Cash Crew (`@quick_cash_crew`). Use it only if the sceptic prefers no "Euro"; it is close to generic payday-loan wording.

## BR3. Robin and Sacha: Low, keep
- **Not searched separately.** Both are common, gender-neutral first names in English and French with no surname, so no single real person is identifiable.
- **Assessment:** keep. They appear only as names on the reveal cards and on Teo's chat profile, never with a surname, photo of a real person, or platform. They are not cast first names (GDD §30.11).

## BR4. Kindhand mark (jade and peach life ring): Low–Medium, keep with conditions
- **Searched:** `remote support app logo lifebuoy life ring icon`; `remote desktop support app with lifebuoy logo`. The results were product pages and app-store listings for real remote-support tools, including a "Rescue"-named product family and several "SOS"/"Assist" apps. The icons were not viewable in the search results.
- **Assessment:**
  - A life ring is a generic "help / support" symbol, also used for help menus in software generally, so the motif alone is not a copy.
  - At least one real remote-support product family uses a rescue name, and I could not verify its icon. So treat this as a **watch item**.
  - The render is distinct in colour (jade ground, peach ring, four dark-green bands) and shape (a rounded-square app tile). It has no arrows, monitor or cursor, which are the usual remote-desktop cues.
- **Conditions:**
  - **Colours:** never red-and-white, orange-and-white or blue-and-white ring colours.
  - **Wording and cues:** no "Rescue", "SOS" or "Assist" wording, and no arrow or screen motif added later.
  - **Spare mark if the G4 design check finds a clash:** an open palm (Kindhand's own name), same jade and peach.

## BR5. Postwick mark (wine and sand, a fan of three post cards): Low, keep
- **Searched:** none beyond DS3 (the name). Comparison from general knowledge: major messengers and social networks use green, blue, gradient or black marks, and national post services in the game's countries use red, orange, yellow or blue. None uses a wine square with stacked sand cards.
- **Assessment:** keep. The card fan with a "contact" glyph reads as "posts" or "profiles". Avoid adding a speech bubble or a paper-plane, which are strongly associated with real messengers.

## BR6. Ellisfen Invest mark (bronze and cream, three reeds): Low, keep
- **Searched:** none beyond DS6 (the name). The reeds read as a small bar chart, which is a generic finance motif.
- **Assessment:** keep. The serif wordmark and bronze-olive tile have no echo of an investment firm found in the DS6 searches (Tollymore, Breakwater). Because a scam clones Ellisfen, the mark must stay simple enough that the clone `ellisfen-invest.example` copies it exactly. That is the point of the beat.

## BR7. Fairmeasure (government, plain wordmark): Low, keep (DS1 confirmed)
- **Re-checked:** DS1's search (`"Fairmeasure"`, no hit) stands. Registering it as `kind: government` with a plain wordmark adds no risk: a plain wordmark has no crest, flag, star circle or colours of a real regulator or government.
- **Conditions:**
  - **Visual identity:** keep it plain; no EU stars, no national colours, no seal.
  - **Name:** the in-world "register" page is called "the Fairmeasure register", never a real regulator's term.

## Actions for ux-artist / scenario-writer (Brussels / marks)
1. **Rename Easy Euro Club → Summer Euro Club**, `@summer_euro_club` (Medium). Spare: Quick Cash Crew.
2. **Keep:** Marrowby, Robin, Sacha, Fairmeasure, and the Postwick and Ellisfen marks.
3. **Kindhand mark:** keep, with BR4's conditions (no red, orange or blue rings with white; no "Rescue/SOS/Assist" wording; no arrows or screens). Spare mark: an open palm.
4. **Before G4:** EUIPO design register and TMview for the marks; TMview and the Belgian KBO/BCE for Marrowby and the recruiter name. This check is not trademark or legal clearance.
