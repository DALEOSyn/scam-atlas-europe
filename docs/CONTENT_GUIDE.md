# Content guide — Scam Atlas: Europe

Owner: `scenario-writer`. Rules for writing scenario YAML (`content/scenarios/<city>/<id>.yaml`). The schema (`src/content/schema.ts`) and the validator (`scripts/lib/rules.ts`) enforce what they can; this guide covers what they cannot. The Red Lines in `CLAUDE.md` always come first.

_Started in T-2.7 with the reveal rules from design rulings L2 and L3 (game-designer, 2026-11-18), narrowed by the producer ruling in the T-2.7 review. Other sections still to be written._

## Reveals (`inspectables[].reveal`)
A reveal is what the Check card says about one detail. Players read it at the moment they decide, so it must teach without misleading in either direction, and **its opening words must never give the verdict away** (producer ruling, T-2.7 review).

### The test: does the check result differ between real and fake?
Before writing a reveal, ask: *would this detail check out differently on a real message than on a fake one?*
- **Yes, it differs.** Use the genuine wording ("It fits: …") on a genuine message, and say plainly what is wrong on a fraud (a red flag). Only these details qualify:
  - the **owner part** of a sender address or link matching the brand's real domain (a look-alike's owner part is different);
  - a **contact the player saved** (Teo's saved contact; a new number is different);
  - something **the player started** (a reset they asked for, a page they opened from their own bookmark).
- **No, it looks the same.** Use the neutral decoy wording, **on genuine and fraud messages alike**: display names and sender names, logos, reference and ticket numbers, padlocks, caller ID (a faked number can match a saved contact), and normal-looking phone numbers. If such a detail said "It fits" on genuine messages and something else on fraud, the opening words alone would tell players which is which.

### Neutral wording: details that look the same (decoys, ruling L2)
1. **Say what it shows.** ("Shows "Waymarker IT": the number matches a saved contact…")
2. **Say that the real thing would look the same.** ("…as a real call would.")
3. **End with "can't prove anything either way".** You may say why ("Faked numbers can match too, so…"), but never end on "can be faked" alone: that reads as a warning and teaches players to mark the detail.
4. Optionally point to what does matter ("Judge the request.").

Example (home-06, `it_call` `caller_id`):
> Shows "Waymarker IT": the number matches a saved contact, as a real call would. Faked numbers can match too, so it can't prove anything either way. Judge the request.

Why: marking a caller ID, sender name or logo cannot tell a real call or message from a fake one. A wrong mark on a `caller_id`, `sender` or `logo` decoy says "Fair instinct, but a faked number can show the same saved name, so it can't tell you which this is." (caller ID; sender and logo have matching lines, UI_SPEC §8.2), so the reveal must say the same thing first.

**Padlock carve-out:** the padlock (`type: padlock`, `page.info`) uses **one wording on every page, genuine or fraud, in every scenario**:
> The connection is encrypted, the same lock a real site shows. Necessary, but it can't show who runs the site, so it can't prove anything either way.

The validator rejects a padlock reveal that starts with "It fits" and any padlock reveal that differs from the others.

### Genuine wording: details that really differ (ruling L3, narrowed)
Only for the three kinds of detail in the test above, on a genuine message:
1. **Lead with the fit:** "It fits: …".
2. **Give the caveat calmly:** "That isn't proof on its own, so weigh it with …" (what the message asks for, or whether you started it).
3. **No alarm words** on genuine items: not "faked", not "proves nothing", not "can't be trusted". The player did nothing wrong by trusting a detail that fits; the lesson is that one detail is never the whole answer.

Example (home-01, `sender.detail`, owner part matches):
> It fits: Waymarker's own domain and the name in your staff directory. That isn't proof on its own, so weigh it with what the email asks for.

### Checklist before review
- Run the test above on every reveal. "It fits" opens a reveal only for a matching owner part, a saved contact or something the player started, and only on a genuine message.
- Every detail that looks the same on real and fake messages uses the neutral wording, genuine or fraud.
- Padlock reveals use the shared wording exactly (validator).
- `logo`, `display_name` and padlock details are never presented as proof (balance `mix.logo_or_sender_name_never_proof`, `padlock_never_reassurance_as_proof`).

### Saved contacts on money requests (design ruling 1, GDD §22.8)
A taken-over account shows the same saved contact as the real person. So from Amsterdam on, **"It fits" on a saved contact is allowed only when the message asks for nothing high-stakes** (Teo sharing a screenshot, Jonas saying where your parcel is, Mateus checking in). On any `pay`, `share_code`, `log_in`, `enter_details` or `approve` request, the saved contact uses the **neutral wording, genuine and fraud alike**:
> Shows Jonas's saved contact, in your usual chat with him, as a real message from him would. An account can be taken over and show the same contact, so it can't prove anything either way. Judge the request.

The same applies to links on a real payment-request domain (ruling 2): "larchwick-bank.example: Larchwick's own address. A payment request opens there whoever sent it, so it can't prove anything either way. The request page shows who gets the money."

A **new number** is different from a saved contact, so its reveal states the fact on genuine and fraud alike and opens with the same words ("Not in your contacts: a new number, not X's saved one."); the request decides (ruling 3).

### Payee names (sceptic, T-3.4 review)
Scam payees are shown as an initial plus a masked surname (`R. ••••`, `K. ••••`). **Any genuine payment to a stranger outside the cast is masked the same way**, so masking never becomes a tell. Cast members keep their own names (Mateus Ferreira on his request page); a name typed from a saved contact is masked like the contact's surname (`Noor ••••`).
