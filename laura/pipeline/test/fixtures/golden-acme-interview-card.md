---
schema_version: 1
id: OPP-MGV-INT-9999
company: "Acme Robotics"
status: pending_review
source_channel: interview_pipeline
source_opportunity_id: null
interview_id: INT-9999
transcript_id: TRN-3929fee060
content_hash: 990462f2df631057c74399d28b732371ba393f46387fb0789d8cde31e11f1362
founder_score: 10
founder_score_confidence: 46
scoring_version: interview-score-v1
created_at: 2026-07-19T00:00:00.000Z
thesis_id: THESIS-001
data_basis: "interview-derived evidence; self-report capped per evidence-state policy; human review required before outreach or decisions"
---
# Acme Robotics — interview-derived opportunity

## Summary

Ada Example interviewed in "Acme Robotics founder interview". 4 claims extracted, 0 independently verified, 1 contradiction(s) retained. Founder Score 10/100 at confidence 46/100 — self-reported claims are credited at most 65%.

## Why now

Honestly, the founding was 2026 on paper — we incorporated later than we started building. We raised $250K from angels to get the first robot arm. [INT-9999, 00:00:58–00:01:10]

## Founder and team

| Speaker | Role | Identity confidence |
|---|---|---:|
| Agent | interviewer | 90/100 |
| Ada Example | founder | 90/100 |
| Minh Example | founder | 90/100 |

> Founder facts are public/professional evidence only. No personality inference, no protected characteristics — categories for them do not exist in this pipeline.

## Interview source

- **Interview:** INT-9999 — "Acme Robotics founder interview"
- **Source:** authorized local file (policy: authorized_local_file, storage: metadata_and_excerpt_only)
- **Segments:** 6 · **speakers:** 3 · **content hash:** 990462f2df631057…

## Interview-derived signals

| Claim | Category | Statement | Speaker | Source state | Verification | Conf | Ref |
|---|---|---|---|---|---|---:|---|
| CLM-001 | revenue | Your deck states $120K ARR, but the application says $80K. Help me reconcile those. | Agent | inferred | contradicted | 40/100 | [INT-9999, 00:00:22–00:00:30] |
| CLM-002 | revenue | The $120K includes the second pilot that's signed but starts billing next quarter. Contracted today is $80K ARR. | Minh Example | self_reported | contradicted | 40/100 | [INT-9999, 00:00:30–00:00:45] |
| CLM-003 | prior_collaboration | We founded the company in 2025 after we both worked at Fraunhofer on manipulation research. We interviewed 60 warehouse operators before writing code. | Ada Example | self_reported | self_reported | 79/100 | [INT-9999, 00:00:45–00:00:58] |
| CLM-004 | fundraising | Honestly, the founding was 2026 on paper — we incorporated later than we started building. We raised $250K from angels to get the first robot arm. | Minh Example | self_reported | self_reported | 79/100 | [INT-9999, 00:00:58–00:01:10] |

## Founder Score

Score **10/100** · confidence **46/100** (interview-score-v1). Score and confidence are separate: self-report keeps confidence low until corroborated. Unknown evidence scores zero credit — unknown ≠ false, so it lowers confidence, never the score direction.

| Component | Credited points |
|---|---:|
| customer_validation | 0 |
| team_complementarity | 4.6 |
| momentum | 5.1 |

### Feature contributions

| Component | Feature | Raw | Evidence state | Cap | Credited | Claim |
|---|---|---|---|---|---:|---|
| customer_validation | revenue | 4/10 | contradicted | ×0 | 0 | CLM-001 |
| customer_validation | revenue | 4/10 | contradicted | ×0 | 0 | CLM-002 |
| team_complementarity | prior_collaboration | 7.11/15 | self_reported | ×0.65 | 4.62 | CLM-003 |
| momentum | fundraising | 7.9/10 | self_reported | ×0.65 | 5.14 | CLM-004 |

## Evidence ledger

- **EVD-INTERVIEW-001** (interview, inferred) → CLM-001 — SEG-0003
- **EVD-INTERVIEW-002** (interview, self_reported) → CLM-002 — SEG-0004
- **EVD-INTERVIEW-003** (interview, self_reported) → CLM-003 — SEG-0005
- **EVD-INTERVIEW-004** (interview, self_reported) → CLM-004 — SEG-0006

## Contradictions

- **internal** [CLM-001, CLM-002]: reported_revenue: 120000 vs 80000 (different speakers)

## Open diligence questions

- [ ] Corroborate raised_round (Honestly, the founding was 2026 on paper — we incorporated later than we started…) — still self_reported only.
- [ ] Reconcile reported_revenue: interview states both 120000 and 80000.

## Company or startup hypothesis

Acme Robotics — discussed by Ada Example in the interview; company-formation confidence follows the evidence ledger.

## Stage and readiness

Honestly, the founding was 2026 on paper — we incorporated later than we started building. We raised $250K from angels to get the first robot arm.

## Funding and capital context

Funding claims remain self-reported — corroborate before any decision.

## Outbound strategy

Reference at most one or two public details from the interview; no internal scores, no surveillance framing, no unverified raise claims. Low-friction call to action.

## Draft outreach message

> Hi Ada — your explanation of the second pilot going live in under two days stood out. Would you be open to a short conversation?

**Outreach state:** draft — held until human approval

## Human-review status

**pending_review**

Checklist: speaker identity · anchors preserved · claims segment-linked · self-report labeled · corroboration attempted · contradictions visible · permitted evidence only · outreach non-surveillance · human approved outbound.

## Decision

- **Automatic decisions:** none — human review is mandatory before outreach, investment framing, or identity merges.
- **Recommended next step:** resolve the contradictions above before anything else.

## Sources

- **INT-001 (INT-9999):** authorized local file — retrieved 2026-07-19

