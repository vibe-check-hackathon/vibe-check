## Opportunity Card

An Opportunity Card is the canonical, living record for one team pursuing one
company or idea. Intake, research, interview, and diligence agents update the
same file. Front matter supports indexing; the body stays readable and may grow
as evidence arrives. Material claims cite a source and carry their own trust
score. Unknown information is marked explicitly rather than inferred.

Confidence and trust are recorded as integers from 0 to 100, not as words, so
they can be compared, sorted, and tracked over time. Use `unknown` only where no
evidence exists at all; do not substitute a low number for a missing assessment.

| Band   | Range  | Meaning                                                     |
| ------ | ------ | ----------------------------------------------------------- |
| 80-100 | High   | Independently verified by a primary source                  |
| 55-79  | Medium | Corroborated, but by a single or partly interested source   |
| 30-54  | Low    | Plausible and self-reported; no corroboration yet           |
| 0-29   | Weak   | Contradicted, stale, or from a source with a clear interest |

### Format

```markdown
---
schema_version: 1
id: OPP-YYYY-NNNN
company: Company name
status: intake # intake | research | interview | diligence | decision | closed
source_channel: inbound # inbound | outbound
created_at: YYYY-MM-DDTHH:MM:SSZ
updated_at: YYYY-MM-DDTHH:MM:SSZ
decision_deadline: YYYY-MM-DDTHH:MM:SSZ
founder_ids: [FND-NNNN]
thesis_id: THESIS-NNN
---

# Company name

## Summary

**One-line pitch:** ...
**Recommendation:** Proceed | Hold | Decline | Invest
**Recommendation confidence:** NN/100

A short, decision-oriented summary with citations such as [CLM-001][SRC-001].

## Intake

- **Stage / location / raise:** ...
- **Submitted:** deck, application, CVs, links
- **Permissions:** public research, recording, references

## Founders and Team

### FND-NNNN - Name, role

- **Founder Score snapshot:** NN/100, confidence NN/100, trend
- Relevant history, skills, commitment, and team dynamics [CLM-...][SRC-...]
- Open questions or cold-start evidence still needed

## Company and Idea

- **Problem and product:** ...
- **Market and competition:** ...
- **Business model and traction:** ...
- **Technology and defensibility:** ...

## Assessment

| Axis            | Rating                   | Trend                          | Confidence | Evidence-backed rationale |
| --------------- | ------------------------ | ------------------------------ | ---------- | ------------------------- |
| Founder         | ...                      | improving / stable / declining | NN/100     | ...                       |
| Market          | bullish / neutral / bear | ...                            | NN/100     | ...                       |
| Idea vs. market | ...                      | ...                            | NN/100     | ...                       |

### Thesis fit

- Sector, stage, geography, check size, ownership, and risk appetite: ...

## Evidence and Gaps

| ID      | Claim or gap | State                             | Trust   | Evidence / next action |
| ------- | ------------ | --------------------------------- | ------- | ---------------------- |
| CLM-001 | ...          | claimed / verified / contradicted | NN/100  | SRC-001                |
| GAP-001 | ...          | open                              | unknown | Ask in interview       |

### Sources

- **SRC-001:** Source type, date, and link or artifact path

## Interview and Diligence

- Hypotheses to test, interview findings, reference/background checks, and
  unresolved blockers. Link transcripts and detailed reports rather than
  copying them into the card.

## Decision and Proposed Terms

- **Human decision:** Pending | Approved | Declined
- **Proposed terms:** Amount, instrument, valuation/cap, and ownership target
- **Reasoning:** Evidence and assumptions behind each material term
- **Next action / owner / due time:** ...
```

The Founder Score is a dated snapshot of the founder's durable profile, not an
opportunity score. The three assessment axes remain independent and are never
averaged. The recommendation confidence describes confidence in the available
evidence, not the probability that the company succeeds. A confidence or trust
score is likewise a statement about evidence quality, so it must never be read
as a percentage likelihood of any outcome.

### Example

See [Acme Robotics opportunity card](opportunity-card-example.md).
