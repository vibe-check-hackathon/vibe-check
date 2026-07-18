# BATNA and the Negotiation Model

How the negotiation model in our demo frontend (`laura/frontend/index.html`) actually
works, and the theory behind it.

**Primary reference:** [CFI — What is BATNA?](https://corporatefinanceinstitute.com/resources/valuation/what-is-batna/)
(concept popularized by Fisher & Ury, *Getting to Yes*, 1981).

---

## 1. What BATNA is

**BATNA = Best Alternative To a Negotiated Agreement** — the most advantageous
option a party can take **if the negotiation fails**. It is not a position inside the
deal; it is what you walk away *to*.

Per CFI, a party's BATNA matters for three reasons:

1. **Fallback** — it is the option you actually take if talks break down, so a deal
   only makes sense if it beats the BATNA.
2. **Leverage** — the stronger and more credible your BATNA, the harder you can
   push, because "no deal" costs you little.
3. **It sets your reservation point** — the worst terms you will accept before
   walking away are derived *from* the value of your BATNA, not chosen by feel.

### Determining a BATNA (CFI / Harvard Law School four-step method)

1. **List all alternatives** available if the negotiation collapses.
2. **Value each alternative** in comparable (monetary) terms.
3. **Select the best one** — that alternative *is* your BATNA.
4. **Derive the reservation point** — the minimum (or maximum) deal value you
   should accept, calculated from the BATNA's value.

## 2. The vocabulary — five distinct numbers

These are related but **never interchangeable**. Our agents track each one
separately per party:

| Term | Meaning | Example (investor side) |
|---|---|---|
| **BATNA** | Best alternative outside this deal | Invest in the comparable deal OPP-2026-0008 instead |
| **Reservation point** | Worst terms acceptable before walking away; derived from the BATNA | No deal above $12M pre-money |
| **Target** | The realistic goal | $9M pre-money, ~8% ownership |
| **Opening position** | First number put on the table | $8M pre-money |
| **Settlement range** | Everything between opening/desired price and reservation point | $8M–$12M |

The **ZOPA** (Zone Of Possible Agreement) is then not a sixth independent number —
it is the **overlap of the two settlement ranges**. If the ranges don't overlap,
there is no ZOPA and no deal is possible on price alone (only changing the deal's
non-price terms can create one).

## 3. The diagram

This is the classic settlement-range picture (the one on CFI's page), which the
frontend renders live:

```text
                 Founders' worst case            Founders' desired price
                        ↓                                 ↓
  ← founders' BATNA     ├───── Founders' settlement ──────┤
    (alternatives)      │            range                │
                        ├──────┐
                        │ ZOPA │   ← overlap of both ranges
                 ┌──────┴──────┤
  ┌── Investor's settlement ───┤        Investor's BATNA →
  │          range             │         (alternatives)
  ↑                            ↑
Investor's desired price   Investor's worst case
```

Reading it:

- Each side's **settlement range** runs from its *desired price* to its *worst
  case* (= reservation point).
- The ranges approach each other from opposite directions — the buyer/investor
  wants the number low, the seller/founders want it high.
- The **ZOPA is the slice where the ranges overlap**. Any agreement will land
  inside it; where exactly depends on leverage — i.e., on whose BATNA is stronger.
- Beyond each side's worst case lies its **BATNA territory**: past that point the
  party is better off taking the alternative, so a rational party exits.

### CFI's worked example (car sale)

Colin wants Tom's car (asking $10,000). Colin finds an identical car on Craigslist
for **$7,500 — that is Colin's BATNA**, so his reservation point is $7,500 (he'd
ideally pay $5,000). Tom's alternative is selling to a dealership for **$6,000 —
Tom's BATNA**, so Tom accepts nothing below $6,000. The ZOPA is therefore
**$6,000–$7,500**: any price in that band beats both parties' alternatives, and the
final number inside the band is decided by negotiation skill and information.

## 4. How our agents use this

Mapping the theory onto the pipeline (see `sun/system-architecture.md` and the
negotiation-model section of Sun's opportunity card — read-only reference):

### Research agent (before the call)

- Builds the **investor side** of the model from hard inputs: the fund thesis
  (ownership targets, check size), comparable open opportunities (which *are* the
  BATNA), and diligence results. This follows the CFI four-step method literally —
  enumerate alternative deals, value them, pick the best, derive the reservation
  point from it.
- **Estimates the founder side** from evidence: the deck ask, round context,
  comparable rounds. These are labeled *estimates* with a confidence score,
  because the founders' true reservation point is private information.

### Interview agent (during the call — what the frontend shows)

The live interview is where the founder-side estimates get tested. Every answer is
a potential model update:

- *"Speed matters more than valuation"* → **closing speed becomes a high-value
  lever**, and the founders' estimated settlement range shifts down → the ZOPA
  widens (this exact moment is scripted in the demo: ZOPA $10–12M → $9–12M).
- Hesitation from the CTO on a fast close → evidence that a diligence gap
  (IP assignment) is a **real constraint, not a bluff** → founder BATNA estimate
  weakens in credibility, but the model's confidence score is what changes, not
  the number itself.
- The vibe check (tone, sentiment, expression) feeds *confidence* in the
  estimates — it never invents numbers.

Hard rules carried over from the design:

1. **Separate ledgers.** BATNA, reservation point, target, and opening are
   tracked as four fields per party; estimated founder values are always marked
   estimated with a confidence score.
2. **No bluffing.** The agent never invents a competing offer, deadline, or fact
   to move the other side's perceived BATNA. Only *verified* alternatives may be
   used as leverage.
3. **The reservation point is a wall.** The agent can propose and concede inside
   the settlement range but may never cross the human-approved reservation point —
   reaching it triggers escalation to the human investor.
4. **Trade across levers, not down the price axis.** Because the model tracks
   non-price levers (pro-rata, board rights, closing speed, milestones), a
   concession on valuation is only made *in exchange for* a lever the fund values
   — which is also how a deal gets found when the price-only ZOPA is thin.

### Why BATNA-first negotiation fits the product

- It is **auditable**: every number in the model cites evidence (thesis, comps,
  interview timestamps), which matches the Opportunity Card's
  evidence-before-conclusions principle.
- It is **honest by construction**: a model grounded in real alternatives doesn't
  need bluffs, which is a stated requirement for a founder-facing agent.
- It is **symmetric**: as noted in `sun/system-architecture.md`, the same model can
  be deployed on the founder side to converge on mutually agreeable terms faster.

## 5. Where this lives in the frontend

`laura/frontend/index.html` → "Negotiation model — pre-money valuation" panel:

- Blue bar = investor settlement range ($8M opening → $12M reservation).
- Green bar = founders' **estimated** settlement range (starts $10M–$14M inferred
  from the deck ask).
- Amber band = ZOPA (computed as the ranges' intersection; recomputed on every
  model update).
- Dots = each side's target; table below = BATNA / reservation / target per party.
- The scripted demo replays a live update: founder signals shift the green bar,
  the ZOPA widens, and the "closing speed" lever lights up.
