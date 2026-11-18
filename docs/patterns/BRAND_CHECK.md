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

## Actions for ux-artist (no edits made to `content/brands.yaml`)
1. **Rename Nodkey** (High). Suggested: Gatewren or Wardlight.
2. **Rename Corvelle Bank** (Medium). Suggested: Larchwick Bank or Fennmoor Bank.
3. **Rename Hoardly** (Medium). Suggested: Swaploft or Tumblestall.
4. Keep Waymarker Network, Trundle, Thimble & Pine, Kettle, Wordswap. Give Thimble & Pine a non-craft product line.
5. Add any new names to the red-line denylist logic only as *allowed* fictional names. Re-run this check on every new name.
6. **Before G4:** a human runs a formal TMview / EUIPO search on all final names. This check is not trademark clearance.
