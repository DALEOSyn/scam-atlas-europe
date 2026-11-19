# Pattern brief: `qr-sticker-parking`

**Chapter:** 7 Lisbon (GDD §18: tampered QR stickers on parking meters; the lesson is the QR destination, LO-02) · **Status:** draft for review (T-3.8r) · **Researched:** 2026-11-19 · **Owner:** fraud-researcher

## 1. Name and aliases
- **English:** quishing; QR-code phishing; fake QR sticker.
- **Local (PT):** *quishing*, *qrishing* (consumer and news wording) [pt-deco-qrishing-2024], [pt-portugalpost-gnr-quishing-2026].
- **Game label:** a fictional parking app and a fictional municipal parking brand. The QR resolves only to `/qr/<id>` (Red Line 3).
- **Where it is documented:**
  - **PT:** a GNR warning (24 Mar 2026) about stickers on QR codes on menus, fake parking-fine notices and posters [pt-portugalpost-gnr-quishing-2026] (news of a GNR post). DECO explains fake QR codes that lead to look-alike sites asking for bank details [pt-deco-qrishing-2024].
  - **Elsewhere (official):**
    - Ireland's NCSC: scam QR codes over legitimate ones at parking payment points [ie-ncsc-qr-guide].
    - The City of Luxembourg: "pay by phone" stickers with a fake QR code stuck over the real one on parking machines, asking for personal details [lu-vdl-parking-qr].
    - Belgium's Safeonweb: stickers on EV chargers [be-safeonweb-qr-chargers].
    - The EPC: QR swaps on letters, invoices and chargers [eu-epc-threats-2025].
  - No official **Lisbon-specific** parking-meter case was found. The PT evidence is a news report of a national GNR warning.

## 2. Channel and psychological levers
**Channel:** a sticker with a QR code (often "pay by phone"), placed over or next to the real code on a parking meter. Scanning it opens a web page that looks like a parking payment page and asks for card details or personal data [lu-vdl-parking-qr], [ie-ncsc-qr-guide], [pt-deco-qrishing-2024]. A fake "parking fine" with a QR is a related hook [pt-portugalpost-gnr-quishing-2026], [ie-ncsc-qr-guide].

**Levers:** convenience (no app needed); a hurry (meter running, fear of a fine) [ie-ncsc-qr-guide]; the code sitting on an official machine.

## 3. Red flags a normal person can spot
1. **A sticker on top of, or added next to, the machine's printed code** [ie-ncsc-qr-guide], [lu-vdl-parking-qr], [be-safeonweb-qr-chargers].
2. **The preview address is not the official parking site or app** [ie-ncsc-qr-guide], [pt-deco-qrishing-2024].
3. **The page asks for full card details or personal data** for a small parking fee [lu-vdl-parking-qr], [pt-deco-qrishing-2024].
4. **"Pay now to avoid a fine" pressure** [ie-ncsc-qr-guide].

## 4. The verification habit
**"Pay parking only in the official app you installed yourself, or type the official address. If you scan, read the address before you open it; a sticker is a reason not to."** [lu-vdl-parking-qr], [ie-ncsc-qr-guide], [pt-deco-qrishing-2024]

## 5. Already caught? (generic + PT where verified)
1. **Typed card details?** Call your bank now to block the card, on the number on the card or in its app [pt-bdp-ficaadica-2023], [be-safeonweb-qr-chargers].
2. **Keep evidence:** a photo of the sticker and the machine, the page address, the time.
3. **Report to the police.** PT: PSP, GNR or PJ [pt-bdp-ficaadica-2023]. Ireland's NCSC also has a QR-only reporting address [ie-ncsc-qr-guide].
4. **Tell the parking operator or the city** so the sticker gets removed. This is common sense; no PT source states it.

## 6. Genuine twins
- The machine's own printed code, which opens the official parking app's page. The genuine fictional parking app opened from the home screen (GDD §18 twin).

## 7. Game-design notes (non-binding)
- The QR inspectable shows the destination in the fiction (`/qr/<id>` → an in-game look-alike address). The destination is the red flag; the sticker is a supporting clue.
- No real municipal parking brand, colours or meter design.

## 8. Sources (accessed 2026-11-19 unless noted)
lu-vdl-parking-qr · pt-deco-qrishing-2024 · pt-bdp-ficaadica-2023 · accessed 2026-11-18: ie-ncsc-qr-guide · be-safeonweb-qr-chargers · pt-portugalpost-gnr-quishing-2026 (news) · eu-epc-threats-2025

## 9. Confidence
**Medium–High** for the pattern and habit: official sources from IE, LU and BE, plus the EPC. **Medium** for Portugal: one news report of a GNR warning, plus DECO. No Lisbon-specific case was found.
