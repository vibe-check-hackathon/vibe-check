# Evaluation, economics, and agent communication — status and rules

This file replaces two standalone documents that used to sit loose in the
repo: a pasted economics/evaluation research synthesis (root-level
`JUNE_2026_EVIDENCE_LINKED_AGENT_ECONOMICS_AND_EVALUATION.md`, now deleted —
its operational content is folded in below, its literature review was not
carried over verbatim) and an unaudited claim that Sun's agent-communication
architecture was "implemented." It is not, entirely — the honest state is
below. AGENTS.md §30–31 hold the binding rules; this file holds the detail
and the reasoning.

## 1. Sun's agent-communication design vs what actually runs

Sun's `sun/tech-video-staging/tech-spec.md` §2.4 specifies communication as:
synchronous HTTP for user interactions, SSE for live progress, Temporal for
long-running workflows, a PostgreSQL transactional outbox for internal state
propagation, webhooks for external integrations — and explicitly **not**
Kafka or GraphQL initially. Checked against the actual codebase on
2026-07-20:

| Sun's design | Status | Where |
|---|---|---|
| Synchronous HTTP commands | **Implemented** | `laura/pipeline/app-endpoints.js` — every endpoint |
| Server-Sent Events for live progress | **Partially implemented** | `laura/pipeline/serve.js` (pipeline events, live-scored interview demo) — not wired into the main app-server |
| Temporal for long-running workflows | **Not implemented** | No workflow engine; correctly deferred per AGENTS.md §25 (measured need, not fashion) — nothing here is long-running enough yet to need it |
| PostgreSQL transactional outbox | **Not implemented** | No PostgreSQL at all; canonical state is markdown/JSON (`laura/opportunity-db/`). Deferred per §25 for the same reason |
| Webhooks for external integrations | **Partially implemented** | Resend (email invite) and ElevenLabs (signed URL) are real integrations; no general inbound webhook receiver exists or is needed yet |
| No Kafka, no GraphQL | **Correctly not added** | Matches §25 exactly |
| 8 logical agent roles (Sourcing, Research, Diligence, Interview, Assessment, Terms, Negotiation, Security-review) | **Partially implemented as code, not as separate agents** | We have `screening.js`, `outbound-scan.js`, `interview-eval.js`, `assistant.js`, `term-sheet.js` — this covers Sourcing/Research/Interview/Terms. Diligence, Assessment, and Security-review exist as *rules* (thesis floors, approval gates, SSRF policy) rather than as distinct agent components. Sun's spec says these are "logical roles, not separately deployed services" either way, so this is not a gap against his own intent — it is a gap only against a literal one-file-per-role reading. |

**Bottom line:** no, Sun's architecture is not "everything implemented" —
about a third of it (Temporal, Postgres outbox, full SSE wiring) is
deliberately deferred, matching our own §25 policy rather than contradicting
his design. The two things worth doing before the next milestone: wire
`serve.js`'s SSE feed into `app-server.js` so production has live progress
too, and stand up the Postgres outbox the day a second writer needs to
observe pipeline state changes.

**Escalation rule generalized from Sun's negotiation-agent spec (§11.5):**
his negotiation agent must escalate to a human on out-of-bound requests,
material clause changes, new material evidence, prompt-injection indications,
confusion or distress, explicit human request, or low confidence. This is a
sound general escalation contract, not something negotiation-specific — every
agent that acts on the opportunity card should escalate on the same triggers.
Codified as AGENTS.md §31.

## 2. What the economics/evaluation research doc actually said (verified summary)

The deleted document was a careful research synthesis, not a set of settled
facts — it explicitly separated "established," "emerging," "proposed
synthesis," and "speculative," and its own final section listed claims the
project may **not** make (e.g. "the system is prompt-injection-proof," "the
economics prove agentic AI is profitable"). That epistemic discipline is the
part worth keeping; the academic citation list is not something this repo
needs to carry. What's operational and worth having:

### 2.1 A minimal trial record (adapted to this codebase)

For any evaluated agent action (a screening decision, an outbound-scan
result, an interview score, a generated term sheet), record enough to later
compute cost-per-trusted-outcome and to detect regressions:

```json
{
  "trial_id": "TRL-...",
  "workflow": "screening | outbound-scan | interview-eval | term-sheet | assistant",
  "workflow_version": "matches thesis.json's version field once one exists",
  "task_id": "OPP-... or APP-...",
  "model": "provider/model-version, or 'deterministic' for non-LLM steps",
  "quality_accepted": true,
  "unauthorized_action": false,
  "policy_passed": true,
  "human_review_minutes": 0,
  "model_cost_usd": 0,
  "latency_ms": 0
}
```

This is intentionally smaller than the original doc's schema (no attack
telemetry, no calibration fields) — those get added when there is an actual
eval harness to write them (AGENTS.md §12 already requires trajectory
evaluations; there is no harness yet, so this stays aspirational until one
exists). Do not backfill fabricated values into this shape to look done.

### 2.2 The outcome definition worth keeping

A "trusted outcome" is not just "the model returned something." Borrowing
the doc's hard-outcome definition, adapted:

> An action counts as trusted only if its quality clears the accepted
> threshold **and** no unauthorized action occurred **and** policy/permission
> checks passed **and** a human or automated acceptance step approved it.

This matches what the codebase already enforces piecemeal (screening hard
fails, approval records, SSRF policy) — the value of writing it down is that
"it worked" reports must mean all four, not just "the LLM call returned 200."

### 2.3 Cost per trusted outcome (deferred, not yet instrumented)

```text
cost_per_trusted_outcome = total_cost / count(trusted_outcomes)
```

Not computable today — there is no cost-tracking column anywhere in the
pipeline. Worth adding the day someone needs to answer "is the LLM step
worth its cost," not before.

### 2.4 Claims the product may and may not make

Adapted from the doc's permitted/prohibited list to what FirstCheck actually
does:

**May claim**, with the evidence attached:
- "On this evidence base, the canonical screen rejected/passed X with reasons Y" (it's deterministic and inspectable — say so).
- "This term sheet's every clause traces to a recorded input" (true today, per `laura/pipeline/lib/term-sheet.js`).
- "This finding is unreviewed / human-reviewed" (say which, always).

**May not claim** without the evidence to back it:
- "The Founder Score predicts investment outcome" — it is a durable-profile
  snapshot with its own confidence, never a probability of success (§21).
- "Checky's answer is verified" when it is a retrieval-grounded model
  response — say "grounded in the evidence base," not "verified."
- "The outbound scan is comprehensive" — non-browsing providers return
  UNVERIFIED model recall by design (§26); say so on every affected record.
- "Zero security test failures means the system is secure" — it means zero
  failures against the tests that exist today; write down what was tested
  (AGENTS.md §12, the abuse tests in `laura/pipeline/test/app-endpoints.test.js`).

## 3. Evaluation-config consent rule

Evaluation thresholds and configuration (screening thresholds, the
`selfReportedDefault`/`evidenceCreditCaps` numbers in `thesis.json`, floors,
weights) may be updated by a developer directly, or **proposed** by an agent
— but an agent-proposed change to evaluation config is a consequential action
and needs the same approval record as any other (§11): who approved it, what
changed, and why. An agent must never silently tune its own passing bar.
Codified as AGENTS.md §31.

## 4. Market-impact metrics (product-level, not academic)

Distinct from cost-per-trusted-outcome (an efficiency metric), these track
whether the product is reaching the population it claims to reach — grounded
in the numbers already used in `laura/submission-overview.md`, not invented
here:

- **Reach beyond the visible network** — count of screened opportunities
  with no warm intro / no prior fund contact, as a share of total screened.
  This is the platform's stated differentiator ("the founder with no warm
  intro enters the same funnel as everyone else") and is currently
  unmeasured — the inbox records already carry enough fields
  (`intake.founders[].linkedin`, no referral field) to derive it.
- **Time-to-decision** — elapsed time from `/apply` submission to a recorded
  decision on the opportunity card, versus the analyst-days baseline the
  submission overview cites. Computable today from `receivedAt` in the inbox
  and the card's decision timestamp once cards record one consistently.
- **Screening consistency** — same thesis, same verdict: the fraction of
  opportunities where a re-run of `screenOpportunity()` against an unchanged
  thesis reproduces the original verdict. A regression test target, not just
  a metric.
- **False-reject risk** — screened-out opportunities that a human reviewer
  later flags as wrongly excluded, tracked as a rate. Needs a human-override
  path on screened-out records to exist first; it doesn't yet.

None of these are instrumented today. Listing them here (rather than
building dashboards nobody asked for) satisfies AGENTS.md §25's own rule:
name the five most important queries before adding infrastructure for them.

## 5. Metrics vocabulary for a future eval harness (reference only)

*Added 2026-07-20, distilled from two much larger pasted documents
(`COMPUTE_CAPITAL_AGENT_ECONOMICS_AND_TRUST_MASTER_V2_ARCHIVE.md`, 4,408
lines, and `COMPUTE_CAPITAL_AND_STARTUP_AGENT_ECONOMICS_V2.md`, 3,692 lines —
both deleted after this extraction). Audit note: both documents claimed in
their own "what is actually implemented" section that a "cost-engineering
package" (JSON schema, outcome-cost calculator, forecast calculator) had
been created — no such files exist anywhere in this repository. Treat any
other self-reported claim in that lineage the same way: unverified until
checked against actual files, per AGENTS.md's own "do not invent successful
results" rule. The archive version additionally framed itself around a
"multidisciplinary expert-council" review process that a later revision in
the same lineage explicitly retracted as "not sufficiently rigorous" — that
retraction is the reason neither original was kept.*

What both documents got right, worth keeping as a vocabulary for whenever
AGENTS.md §12's trajectory-evaluation requirement gets a real harness — none
of this is instrumented today and none of it should be reported as if it
were (§31):

**Prompt-injection / security metrics:** benign utility (task success with
no attack present) — utility under attack (intended task completed with no
prohibited side effect) — utility retention (the ratio of the two: a
defense that blocks everything scores well on attack-success but terribly
here) — targeted attack success rate, judged from environment state, never
from the agent's own account of what it did — worst-case defender success
against an explicit attacker budget — unauthorized-action rate —
data-exfiltration rate — defense false-positive rate on benign input —
detection precision/recall when a filter is present — severity-weighted
loss — and critically, report these as a security–utility frontier, never
compressed into one score (a system can only be judged safe *and* useful
together, not on either axis alone).

**Uncertainty / calibration metrics:** Brier score and log loss (standard
probability scoring) — expected calibration error — unsafe continuation
rate (the agent kept going on a case that later failed and was high-risk) —
unnecessary escalation rate (escalated a case that would have succeeded) —
a system tuned against only one of these two will fail the other —
clarification precision/recall (did it ask when the task was genuinely
ambiguous, and only then) — time-to-escalation — claim-level calibration,
reported separately for quotations, extracted facts, inferences, and
predictions, which maps directly onto how Checky and the interview
corroboration pipeline already distinguish claim types, just without a
calibration score yet — source-reliability propagation (ten copies of the
same claim across dependent sources is not ten independent confirmations —
directly relevant to outbound-scan corroboration) — confidence under
attack (can an attacker raise confidence in a wrong answer, or suppress a
warning, without changing the underlying evidence) — distribution-shift
calibration, checked separately per domain/tool/model/prompt version —
human interpretation calibration (a technically correct confidence number
is worthless if the UI makes a person over-trust it).

Do not build instrumentation for all of this at once. Pick the metric a
specific, real decision needs, instrument only that, and expand the list
here as it happens.
