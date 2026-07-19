# FirstCheck — Meeting-Impression Adjustments (TS-001 annex)

> **⚠️ Staged for demonstration.** The FirstCheck "founders" are the hackathon
> team evaluating themselves. The score movements below were **scripted on
> purpose** — in particular, Mehdi *deliberately played the disengaged founder*
> so the demo shows how the system reacts when one founder does not take the
> meeting seriously. This is a role, not an assessment of a real person. All
> four teammates consented to this demo device.

## How a meeting impression becomes a term change (the logic)

```
live meeting (interview)                    evidence rule fired
  spoken specifics under challenge      →   resilience ↑ (+6, reason recorded)
  first-person ownership of the work    →   autonomy ↑ (+5)
  hedging / deflection / joking through →   stageClarity ↓ (−5), evidence stalls
  covering distinct ground per founder  →   teamComplementarity ↑ (+4)
        ↓ per-founder sub-scores (thesis weights + floor rule)
  founder axis per person → TEAM founder score (mean) + confidence
        ↓ generateTermSheet() adaptation rules
  score ≥75 & conf ≥60  → cap moves to ZOPA midpoint
  score high, conf <60  → 50/50 tranche on verification
  one founder below a floor → board observer seat (support + early warning)
  contradiction left open   → condition precedent + longer close
```

Every movement carries its reason and the information used (see the
`evaluation.update` events and the memorandum's Adjustment Schedule) — the
founders can read exactly why each number and each term moved.

## The staged meeting, founder by founder

| Founder | Before | After | Why it moved (scripted impression) |
|---|---:|---:|---|
| Martin Auer | 70 | **84 ▲** | Led the product walkthrough with dated specifics; met the ARR challenge with the contracted-vs-signed distinction — resilience and autonomy detectors fired repeatedly. |
| Sun Chuanqi | 69 | **82 ▲** | Architecture depth on direct challenge, no hedging; covered technical territory the others left untouched — complementarity and domain evidence accrued. |
| Laura Spies | 71 | **76 ▲ (slight)** | Steady and consistent with the written record — and when Mehdi's camera froze she switched the demo over to her own screen without breaking stride (response-to-adversity credit). Still only a slight move: a meeting that mostly confirms the record should change little. |
| Mehdi | 65 | **36 ▼** | **Intentionally staged**: his camera stayed frozen through the meeting (preparation penalty — equipment untested), he deflected two direct questions and joked through the revenue reconciliation — hedging/evasion detectors fired, evidence stalled, engagement fell below the thesis floor. **His design work remains fully credited in the evidence base** (shipped product/design counts as product_shipping evidence); the meeting penalty prices preparation, never talent. |

Team founder score: mean(84, 82, 76, 36) ≈ **70** (unchanged — Laura's save offsets the deeper preparation penalty). Confidence rises only
modestly — three strong performances cannot fully offset one founder whose
answers produced no verifiable evidence.

## What that did to the terms (through the normal rules — no special-casing)

1. **Board observer seat** (`boardRights: none → observer`) — one founder
   below a floor triggers the support-and-early-warning rule. *Information
   used: Mehdi's sub-score under the thesis floor (scripted).*
2. **Tranched funding stays** (`50% / 50% on verification`) — team score ~70
   with moderate confidence keeps the structure-pays-for-proof rule active.
3. **Cap does not move to the ZOPA midpoint** — the ≥75-and-≥60 gate fails on
   the team aggregate; the strong three don't unlock the premium cap while
   the fourth chair produces nothing creditable.
4. **CON-001 condition precedent unchanged** — the ARR contradiction was
   addressed by Minh-style reconciliation in-meeting but remains open until
   independently corroborated; meetings never silently resolve contradictions.

## Why we staged it this way

The point of the demonstration: the system prices **evidence, not vibes** —
one founder checking out doesn't tank the deal on mood, it flows through
floors, confidence, and governance terms with a written reason at every step;
and a founder whose meeting merely *confirms* the record (Laura) correctly
moves almost nothing. Scores here are demo artifacts, reversible the moment
the "disengaged founder" breaks character.
