# Opportunity Categories × BATNA — How We Answer the Challenge

Working idea (Laura): take the card structure Sun pushed, group it into scoring
**categories**, and wire each category into the BATNA negotiation model
(`laura/batna-negotiation-model.md`) — so evidence doesn't just produce a
recommendation, it produces **leverage and terms**. That is the piece that turns
"screening" into "backing founders at the real investment optimum."

---

## 1. The challenge we are answering

> Investors need a way to screen far more of the founder market than their
> available diligence hours allow, because signal-to-noise is too low: the truly
> strong founders are often the hardest to see, while many of the most visible
> ones are simply the best at presenting themselves. Equally strong founders can
> be pushed out of the fundable pool entirely when they lack the right network,
> pedigree, or visibility. Great founders stay invisible until they know the
> right person; capital flows through networks rather than merit. By the time a
> fund sees a founder clearly, dozens of equally strong ones may already have
> given up waiting.
>
> **How might we build an agent that creates a cheap, verified signal of true
> founder quality, so investors can identify and back the founders closest to
> the real investment optimum instead of only the ones who are easiest to find?**

This matches Sun's pitch deck slide 2 exactly ("Networks find visibility. We find
evidence.") and Martin's briefing ("the founder score is the heart of the
challenge").

## 2. Target audience

- **Primary: the individual investor or lean fund partner** — no analyst team
  behind them; needs "the reach and analytical power of an entire organisation"
  compressed into one tool they can run themselves: set their own sector, stage,
  and risk appetite, and trust it enough to act on without technical support.
- **Second: the invisible founder** — no GitHub history, no funding, no warm
  intro; strong underlying work that stays unseen today. They are who the cheap,
  verified signal is *for*.
- **Consumer proof point: someone like Daniel** — one of ~28 million Americans
  who move each year, negotiating alone against an industry of 16,851 small
  operators who all quote differently depending on who's asking ("the price on
  the truck is not the price on the phone"). Different market, same person
  underneath: someone who knows a fair outcome exists but lacks the time,
  network, or leverage to go get it. This is the demo that shows the
  evidence-to-BATNA engine is a **reusable decision-and-negotiation engine**, not
  a VC-only tool (consistent with Sun's context thesis).

## 3. The categories (derived from what Sun pushed)

Sun's card (`sun/opportunity-card.md` + the `numeric-confidence-trust` branch)
gives us the raw sections. Grouped into five scoring categories, each carrying
0–100 scores with 0–100 confidence (per the numeric branch), never averaged
across categories:

| # | Category | Built from (card sections) | Core outputs |
|---|---|---|---|
| C1 | **Founder & Team** | Founders and Team; Founder Score snapshots; team dynamics | 5 sub-scores: resilience, autonomy, curiosity, perseverance, co-founder complementarity (see `laura/founder-axis-scoring.md`) + 2 live signals (stage clarity, response to challenge) |
| C2 | **Market** | Company and Idea → market & competition; Assessment axis 2 | Rating (bullish/neutral/bear), trend, confidence |
| C3 | **Idea vs. Market** | Company and Idea → problem/product/traction/defensibility; Assessment axis 3 | Rating, trend, confidence |
| C4 | **Evidence Quality** | Evidence and Gaps ledger (CLM/CON/GAP), sources, trust scores | Verified-claim ratio, open contradictions, open gaps, aggregate trust |
| C5 | **Deal & Thesis Fit** | Frontmatter + thesis fit; Decision and Proposed Terms | Sector/stage/geo/check-size fit; ownership feasibility |

C1–C3 are Sun's three independent axes, kept independent. C4 and C5 are the two
cross-cutting categories the BATNA model consumes directly.

## 4. How the categories combine with BATNA

The key move: **each category feeds a specific part of the negotiation model**,
so every term in the envelope traces back to scored evidence.

| Category | What it drives in the BATNA model |
|---|---|
| **C1 Founder & Team** | The *why-invest-at-all*: a high, high-confidence founder score justifies moving the investor's **target** toward the founder-favorable bound (talent is the scarce asset). A red-flag team dynamic caps the target regardless of traction. |
| **C2 Market** | The investor's **BATNA strength**: a bullish market means more comparable opportunities exist (stronger investor BATNA → firmer reservation point); a thin market weakens the BATNA (fewer alternatives to walk to). |
| **C3 Idea vs. Market** | The **width of the settlement range**: "promising with changes" widens the range (more scenarios to price); a proven wedge narrows it around a higher target. |
| **C4 Evidence Quality** | The **confidence on every number**: low trust / open contradictions → wider, lower bounds and *conditions* in the term sheet ("cap reflects a discount for unverified revenue," exactly like the Acme example). Each resolved GAP/CON during the interview visibly tightens the model — this is the live ZOPA update in the frontend. |
| **C5 Deal & Thesis Fit** | The **hard constraints**: check size, ownership target, and risk appetite set the reservation point and the non-price levers the agent may trade (pro-rata, board rights, speed). |

Two consequences worth pitching:

1. **The cheap, verified signal *is* the negotiation input.** The same evidence
   ledger that makes an invisible founder visible (C4 verifying their work) also
   prices their round honestly — no network, no pedigree required. Verification
   replaces warm intros as the source of both discovery *and* leverage.
2. **Symmetry for the consumer case.** For Daniel-the-mover, the categories
   collapse to: provider quality (C1), market of quotes (C2 — his BATNA is
   literally the other 16,850 operators), fit of offer to need (C3/C5), and
   verified quotes (C4). The identical engine — evidence categories → settlement
   ranges → ZOPA — negotiates his move. Same person, same math, different market.

## 5. Fit with the lean-investor user

The individual investor configures only C5 (thesis: sector, stage, geography,
check size, risk appetite). Everything else is agent-produced with visible
confidence, and the human owns two gates (per Sun's card): the decision and any
founder-facing terms. That's "an entire organisation in one tool" without asking
the user to trust a black box — every category score expands into its evidence
rows.

## 6. Open questions (for the team, before we build more)

- Should category confidence scores flow into ZOPA width by a fixed formula, or
  stay a visible-but-manual input for the investor? (Deterministic is more
  defensible — Sun's slide 5 shows a "deterministic calculation" behind each
  term.)
- Where does the Founder Score snapshot live for the consumer (Daniel) case —
  provider profiles would need their own durable file, like founders do.
- Does C2-as-BATNA-strength need its own evidence type (comparable open
  opportunities), so the investor's BATNA is always a *named* alternative
  (OPP-XXXX) rather than a vibe?
