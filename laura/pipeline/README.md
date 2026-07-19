# Pipeline — Sourcing & Developing (Stage 1 + 2)

JavaScript implementation of the first two stages of Sun's conceptual pipeline
(`sun/system-architecture.md`). Zero dependencies, Node 18+.

```bash
node run-demo.js     # runs Acme Robotics sample end to end (terminal)
node serve.js        # live mode: serves the frontend at http://localhost:4173
                     # and streams pipeline + interview events over SSE
```

Fund criteria live in `thesis.json` (single source — see `../vc-criteria.md`).

What it does:

1. **Sourcing** (`sourcing.js`) — turns an intake submission into an Opportunity
   Card: registers sources (SRC-), founder snapshots with prior Founder Scores,
   and founder-provided claims entering as `claimed` with self-reported trust
   (40/100, the 30–54 band).
2. **Developing** (`developing.js`) — the research loop: corroborates claims
   (trust 0–100), detects contradictions (CON-), records gaps (GAP-, trust
   `unknown`), creates interview hypotheses (HYP-), scores the three independent
   axes, checks thesis fit, builds the BATNA negotiation model (reservation from
   a named comparable, ZOPA = range intersection, confidence from evidence
   trust), drafts the term envelope, and stops at the **human approval gate**.

Outputs:

- `output/OPP-2026-0001.md` — a card following `sun/opportunity-card.md`
  (generated; not committed)
- an event stream implementing the schema in `laura/stitch-ai-prompt.md` §3.3,
  with `founderView()` demonstrating server-side role gating

Where the real agents plug in: every `AGENT HOOK` comment marks a deterministic
stand-in (document parsing, per-claim web research) to be replaced by Claude API
calls; `sample/research-acme.json` is the canned result those hooks would
produce. Stage 3 (Matching — the live interview) is the frontend +
interview-agent work.
