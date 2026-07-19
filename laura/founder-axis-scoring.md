# Founder Axis — Evidence-Based Scoring Model

What the research actually supports for scoring founders, and how it maps onto the
Founder axis of the Opportunity Card (see `sun/opportunity-card.md`, read-only
reference) and the live interview in `laura/frontend/index.html`.

Martin's briefing summary (`Martin/vc-brain-challenge-briefing-summary.md`) makes
the stakes clear: **the founder score is the heart of the challenge** — the VC said
assessing problem/product/market is now easy with AI; assessing the team is the
hard part.

---

## 1. Traits with the strongest evidence

### Emotional stability / resilience under pressure — the strongest signal

This shows up in **every** source, independently:

- The Columbia/PNAS field study found emotionally resilient founders fare better
  **at every venture stage**, from first fundraising through exit.
- Founder Institute calls it **"Emotional Control"** — one of only three traits
  specifically predictive of fundraising success across its multi-year dataset.
- EQT's Founder Six calls it **"Resilience Alchemy"** — the ability to absorb
  setbacks, stay grounded, and keep moving — and reports it as the most common top
  trait among successful founders (28.67% of test takers score highest here).

When three independently built frameworks converge on the same trait, that is the
strongest signal in this whole space.

### Autonomy / self-reliance / internal locus of control

Founder Institute flags this as one of three **"ceiling" traits**: score low and
nothing else compensates, because investors are betting on someone who performs
when they're not in the room. This is the empirical version of Paul Graham's
"relentlessly resourceful" and of Sequoia-style reading for "does this founder
ship and learn fast without hand-holding."

### Curiosity / fluid intelligence

The capacity to reason through a problem you haven't seen before with incomplete
data — and to actually **update on evidence** rather than defend the original
plan. Founder Institute treats low curiosity as a ceiling trait ("founders who
fall in love with the solution"). The academic literature ties this to **openness
to experience** — one of the two Big Five traits (with agreeableness) that
predicted successfully raising a first round in the Columbia/PNAS study.

### Perseverance — distinct from resilience

Not bouncing back from one setback, but **sustaining effort through an extended
flat period**. Founder Institute's data says low perseverance doesn't cause
dramatic failure — it causes **premature pivoting**; the company "stops" rather
than fails. Wasserman's HBS data backs this indirectly: roughly two-thirds of
startup failures trace to people problems, and stalling/thrashing on team
decisions is a recurring pattern in his case data.

## 2. Where the evidence gets weaker — directionally useful, not settled

- **Conscientiousness is a genuine trap if scored naively.** The Columbia/PNAS
  study found it helps early fundraising but predicts **worse** odds of a
  high-growth exit (acquisition/IPO). "High conscientiousness = good founder" is
  wrong as a standalone scoring rule — the same trait helps one outcome and hurts
  another.
- **Extraversion** was the only Big Five trait with **no significant
  relationship** to startup outcomes in the PNAS data.
- **Agreeableness** correlates with raising a first round (Columbia), but Founder
  Institute separately warns that **high assertiveness + low emotional control
  reads as aggression, not confidence** — trait *combinations* matter more than
  any single score.

## 3. Team-level criteria — what solo-trait scoring misses

Both Wasserman and Founder Institute call this out directly:

- **Complementary (not duplicate) skill sets** between co-founders.
- **A track record of having worked together under real pressure** — not an
  untested relationship.
- **A clear decision-maker** for the calls nobody wants to make.

A single brilliant founder with an unresolved co-founder dynamic is a
**documented red-flag pattern**, not a neutral unknown. (This is why the card's
"Team dynamics" row exists and why the interview agent runs joint sessions.)

## 4. What investors read in real time — the actionable part

The two highest-signal, cheapest-to-observe behaviors, per Founder Institute's
data and echoed in Sequoia's execution-speed criterion:

1. **Stage clarity** — does the founder describe exactly what's tested vs.
   assumed, or inflate progress? Inflation gets caught on the first follow-up
   question.
2. **Response to a hard question** — do they engage and sharpen, or either
   collapse or get defensive?

Both are extractable from a live, ElevenLabs-style intake interview — unlike a
self-reported questionnaire. They are *behavioral evidence*, which fits the card's
evidence-before-conclusions rule and Sun's pitch-deck guardrail: never claim
personality is read as fact from face or tone; frame observations as
**probabilistic evidence tied to specific hypotheses**.

## 5. The scoring model — five sub-scores + two behavioral signals

Proposed decomposition of the Founder axis (each 0–100 with its own confidence,
per the numeric scoring proposed on the `numeric-confidence-trust` branch):

| Sub-score | What it measures | Primary evidence source |
|---|---|---|
| **Resilience / emotional stability** | Composure and recovery under pressure | Interview response-to-challenge + history of setbacks survived |
| **Autonomy** | Ships and learns without hand-holding | GitHub/shipping history, unprompted problem-solving stories |
| **Curiosity / adaptability** | Updates on evidence vs. defends the plan | Reaction to disconfirming data in interview; pivot history |
| **Perseverance** | Sustained effort through flat periods | Timeline analysis: gaps vs. grind in project history |
| **Co-founder complementarity** | Team-level fit, pressure-tested history, decision clarity | Joint interview dynamics; shared-history verification |

Live behavioral signals feeding the above during the call:

- **Stage clarity** → feeds trust scores on traction claims (inflation detected →
  claim trust drops, CON- entry created).
- **Response to challenge** → feeds resilience and curiosity sub-scores.

Caveats encoded in the model:

- Do **not** reward conscientiousness as a standalone positive (stage-dependent,
  sign flips at exit).
- Ignore extraversion (no predictive value).
- Score trait *combinations* (assertiveness × emotional control), not single axes.
- Sub-scores stay separate — never averaged into one founder number without the
  components remaining visible (mirrors the card's never-average rule).

## 5a. Team Complementarity Score — a team-level number, not a founder average

The per-founder psychogram answers "how strong is this individual?" It does **not**
answer "how strong is this *pair*?" — and §3 above says the pair is where roughly
two-thirds of failures actually originate. So the team view carries its own score,
computed from team-level evidence, **never** by averaging the two founders'
individual scores.

**Team Complementarity Score (0–100)** decomposes into three components, each kept
visible (same never-average rule as the founder axis):

| Component | What it measures | Evidence source |
|---|---|---|
| **Skill complementarity** | Do the co-founders cover *different* critical functions (not duplicate strengths)? | Role split, CVs, who-owns-what in the joint interview |
| **Decision clarity** | Is there a clear decision-maker for the calls nobody wants to make? | Joint interview: do both describe the *same* decision process? |
| **Pressure-tested history** | Have they worked together through real conflict, not just an untested relationship? | Shared-history verification; conflict observed under interview pressure |

The headline number is **gated by the weakest component, not the mean** — a
brilliant skill split with an untested relationship is a documented red-flag
pattern (§3), so `pressure-tested history` caps the ceiling. On the frontend this
renders as the **Team overview** tab: the two founders' psychograms overlaid on
one radar (visualising where they cover for each other vs. overlap), plus the
complementarity components and the card's Team-dynamic evidence.

For the Acme Robotics example card (FND-0007 Ada × FND-0008 Minh): skill
complementarity is high (commercial CEO × technical CTO), decision clarity is good
(both describe the same process), but pressure-tested history is unproven — so the
team number is deliberately capped and flagged as the key open item, mirroring the
card's `Team dynamic` row [CLM-004][SRC-005].

## 6. Honest caveat on the quantified claims

The two most-quantified frameworks here — Founder Institute's **85.1% accuracy**
claim and EQT's **99%** claim — are the assessment providers' **own marketing
statistics**, not independently peer-reviewed. The Columbia/PNAS study is the one
genuinely peer-reviewed result in this list, and it is also the most cautious: it
finds correlations, explicitly not a formula, and flags that the same trait can
help one outcome and hurt another. Treat the practitioner frameworks as
well-informed heuristics built on real data — not ground truth on par with the
academic study.

---

## Sources

1. **Columbia/PNAS study (peer-reviewed):** Freiberg, B. & Matz, S. C., *Founder
   personality and entrepreneurial outcomes: A large-scale field study of
   technology startups*, PNAS (2023) —
   <https://www.pnas.org/doi/10.1073/pnas.2215829120> · Columbia Business School
   summaries:
   <https://business.columbia.edu/press-release/cbs-press-releases/psychology-success-personality-traits-make-or-break-tech-startup>,
   <https://business.columbia.edu/research-brief/research-brief/startups-founder-personalities-vc>
2. **Founder Institute — Entrepreneur DNA / Predictive Admissions** (185,000+
   entrepreneurs analyzed; 26 qualities; 85.1% accuracy claim):
   <https://dna.fi.co/methodology> ·
   <https://fi.co/insight/a-look-into-the-founder-institute-s-admission-process> ·
   <https://fi.co/insight/which-traits-help-entrepreneurs-outperform-the-competition>
3. **EQT Ventures — The Founder Six** (built with Oxford University from 5,000+
   psychometric profiles; includes "Resilience Alchemy"; 99% claim):
   <https://thefoundersix.com/> ·
   <https://stories.eqtventures.com/articles/the-founder-six-a-predictive-framework-to-back-the-next-generation-of-founders> ·
   Sifted coverage: <https://sifted.eu/articles/eqt-founder-test>
4. **Noam Wasserman**, *The Founder's Dilemmas: Anticipating and Avoiding the
   Pitfalls That Can Sink a Startup*, Princeton University Press (2012) — the
   ~65%-of-failures-are-people-problems finding and co-founder decision data.
5. **Paul Graham**, *Relentlessly Resourceful* (2009) —
   <http://www.paulgraham.com/relres.html>
6. **Sequoia Capital** — public guidance on founder evaluation (execution speed,
   shipping cadence); practitioner heuristic, no single canonical URL.
