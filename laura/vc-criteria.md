# VC Evaluation Criteria — What the System Must Assess

Wearing the VC hat: the criteria an evaluation system needs, **where Sun already
specified each one** (so we don't build anything twice), and which JSON file
carries it. Machine-readable source of truth: **`laura/pipeline/thesis.json`** —
the pipeline and the live server both read it; change it there only.

## 1. The criteria and where they already live

| # | Criterion (VC view) | Sun already specified | Machine-readable home | Status |
|---|---|---|---|---|
| 1 | **Thesis fit** — sector, stage, geography, check size, ownership, risk appetite | Card "Thesis fit" section; tech spec §8 preference model | `thesis.json → fund` | built (`assessThesisFit`) |
| 2 | **Founder quality** — the heart of the challenge per Martin's briefing | Tech spec §6 vibe check: traits, co-founder compatibility, founder–investor fit, thresholds | `thesis.json → founderCriteria` (5 sub-scores + floors from `laura/founder-axis-scoring.md`) | criteria defined; scoring fn = Martin's task |
| 3 | **Team dynamics** — complementarity, pressure-tested history, decision clarity | Tech spec §6.3 multi-founder simulation; card "Team dynamics" | `founderCriteria.subScores.teamComplementarity` | criteria defined; needs joint-interview signals |
| 4 | **Market** — independent axis, never averaged | Card Assessment axes; system-architecture axes rule | `thesis.json → assessment` | built (axes in pipeline) |
| 5 | **Idea vs. market** — fit of this idea to that market | Card Assessment third axis | `thesis.json → assessment` | built |
| 6 | **Evidence quality** — claim trust, contradictions, gaps; unknown ≠ false | Card Evidence & Gaps; Martin's 0–100 bands | `thesis.json → evidenceRules` | built (`developing.js`) |
| 7 | **Traction verification** — founder-claimed vs independently verified | Tech spec §5 ("distinguish founder-provided claims from independently obtained evidence") | `evidenceRules.verifiedRequiresIndependentSource` | built (corroboration step) |
| 8 | **References & background** | Tech spec §5 + §7 (reference calls via ElevenLabs/Twilio) | intake `permissions` + gap entries | not built — agent task |
| 9 | **Negotiation posture** — BATNA, reservation, target, levers, ZOPA | Tech spec §10 BATNA model | `thesis.json → negotiation` | built (`buildNegotiationModel`) |
| 10 | **Human control** — approval gates, bounds the agent can't cross | Tech spec §11 | `negotiation.reservationRequiresHumanApproval` + `approval.update` events | built (gate + approval sheet + draggable reservation) |
| 11 | **Outcome learning** — decisions feed back into preferences | Tech spec §8 inputs + §12 flywheel | `outcome.recorded` events | event exists; learning loop not built (post-hackathon) |

## 2. The JSON files (complete inventory — no duplicates)

| File | Role | Consumed by |
|---|---|---|
| `laura/pipeline/thesis.json` | Fund thesis + all evaluation criteria (table above) | `run-demo.js`, `serve.js` via `lib/thesis.js` |
| `laura/pipeline/sample/intake-acme.json` | What founders submit (Sourcing input) | `sourcing.js` |
| `laura/pipeline/sample/research-acme.json` | Canned research results = the AGENT HOOK contract; a Claude research agent must return exactly this shape | `developing.js` |
| `laura/pipeline/sample/interview-acme.json` | Matching-stage replay in event-schema form; a real interview agent must emit exactly these event types | `serve.js` |

The card itself stays **Markdown** (Sun's explicit §4.1 decision) — JSON is only
for configuration and the event stream. Don't add a JSON card format.

## 3. Deliberately not duplicated

- **Card structure** — `sun/opportunity-card.md` is the template; our serializer
  follows it. Any card change happens there first.
- **Trust/confidence bands** — Martin's `numeric-confidence-trust` table, copied
  into `evidenceRules` with a comment pointing back; if his branch changes on
  merge, update `thesis.json` to match.
- **Statuses** — the card template's six lifecycle words, used by the event schema
  and the pipeline; the tech-spec §4.2 variants await Sun's reconciliation
  (see `laura/note-for-sun.md`).
- **Founder sub-scores** — defined once in `laura/founder-axis-scoring.md`
  (research + rationale), parameterized once in `thesis.json` (weights/floors).
