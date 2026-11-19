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
  - **CorVel Corporation**: US, Nasdaq-listed, workers' compensation / insurance claims and risk-management services. "Corvelle" sounds almost the same, and the sector (insurance / financial services) is adjacent to banking. https://corvel.com/investors · https://en.wikipedia.com/wiki/CorVel_Corporation
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
