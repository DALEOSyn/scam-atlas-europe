# Content guide — Scam Atlas: Europe

Owner: `scenario-writer`. Rules for writing scenario YAML (`content/scenarios/<city>/<id>.yaml`). The schema (`src/content/schema.ts`) and the validator (`scripts/lib/rules.ts`) enforce what they can; this guide covers what they cannot. The Red Lines in `CLAUDE.md` always come first.

_Started in T-2.7 with the reveal rules from design rulings L2 and L3 (game-designer, 2026-11-18). Other sections still to be written._

## Reveals (`inspectables[].reveal`)
A reveal is what the Check card says about one detail. Players read it at the moment they decide, so it must teach without misleading in either direction.

### Decoys on fraud (`red_flag: false`, game-wide, ruling L2)
A decoy is a detail that looks right on a scam: a familiar caller ID or sender name, a copied logo, a reference number, the padlock.
1. **Say what it shows.** ("Shows "Waymarker IT"…")
2. **Say that a real message or call would show the same.** ("…the same name a real IT call would show.")
3. **End with "can't prove anything either way".** You may say why ("Caller ID can be faked, so…"), but never end on "can be faked" alone: that reads as a warning and teaches players to mark the detail.
4. Optionally point to what does matter ("Judge what the caller asks for.").

Example (home-06, `it_call` `caller_id`):
> Shows "Waymarker IT", the same name a real IT call would show. Caller ID can be faked, so it can't prove anything either way. Judge what the caller asks for.

Why: marking a caller ID, sender name or logo cannot tell a real call or message from a fake one. A wrong mark on a `caller_id`, `sender` or `logo` decoy says "Fair instinct, but a real call shows the same name, so it can't tell you which this is." (UI_SPEC §8.2), so the reveal must say the same thing first.

### Reassuring details on genuine messages (`reassures: true`, and any reveal on a genuine message's own details, ruling L3)
1. **Lead with the fit:** "It fits: …".
2. **Give the caveat calmly:** "That isn't proof on its own, so weigh it with …" (what the message asks for, or whether you started it).
3. **No alarm words** on genuine items: not "faked", not "proves nothing", not "can't be trusted". The player did nothing wrong by trusting a detail that fits; the lesson is that one detail is never the whole answer.

Example (home-01, `sender.detail`):
> It fits: Waymarker's own domain and the name in your staff directory. That isn't proof on its own, so weigh it with what the email asks for.

### Checklist before review
- Every `red_flag: false` reveal on a fraud scenario follows the decoy rule.
- Every `reassures: true` reveal, and every reveal on a genuine message's own details, follows the genuine rule.
- `logo`, `display_name` and padlock details are never presented as proof (balance `mix.logo_or_sender_name_never_proof`, `padlock_never_reassurance_as_proof`).
