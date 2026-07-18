# Opportunity Database Technical Design

## 1. Purpose

The opportunity database is the shared memory for the investment pipeline:

```text
inbound -> research and profiling -> founder interview -> diligence -> decision -> negotiation
```

It is intentionally a collection of Markdown files. Each opportunity card is both:

- a readable investment record for a human reviewer; and
- a structured workspace that agents can read and update.

The card accumulates the founder, team, idea, research, interview, diligence, and proposed term-sheet state needed to reach a decision within 24 hours. It does not silently turn uncertain claims into facts, and it does not authorize an investment. A human investor owns the final decision and any term sheet sent to founders.

## 2. Design Principles

1. **One canonical card per opportunity.** An opportunity is one team pursuing one company or idea in one investment process.
2. **Founder memory survives an opportunity.** A founder has a durable profile and Founder Score. The opportunity card contains a dated snapshot of that profile so the decision remains reproducible.
3. **Evidence before conclusions.** Every material claim, score, term, and negotiation move cites a source ID.
4. **Unknown is not false.** Missing or unverified information is marked explicitly. A failed search does not disprove a founder claim.
5. **Scores stay separate.** Founder, market, and idea-vs-market are independent axes. They are never averaged into a single opportunity score.
6. **Agents propose; humans approve.** Research and interview agents may update analysis and recommendations, but only a human may approve a decision or external term sheet.
7. **History is append-only.** New findings supersede old findings without erasing what an earlier decision was based on.
8. **Consent is explicit.** Public research, private-document access, recordings, and reference calls each have a recorded permission state.

## 3. Repository Shape

```text
opportunity-db/
	README.md
	opportunities/
		OPP-2026-0001.md
	founders/
		FND-0001.md
		FND-0002.md
	sources/
		OPP-2026-0001/
			SRC-001-pitch-deck.pdf
			SRC-002-intake-email.txt
			SRC-010-research-note.md
	interviews/
		OPP-2026-0001/
			INT-001-transcript.md
			INT-001-recording.url
	term-sheets/
		OPP-2026-0001/
			TS-001-draft.md
	templates/
		opportunity-card.md
		founder-profile.md
```

Markdown files are the database records. Original documents, transcripts, and generated drafts are immutable artifacts linked from those records. A local index or UI may parse frontmatter for fast filtering, but it is derived data and can always be rebuilt from the files.

### Stable identifiers

| Entity | Format | Example |
|---|---|---|
| Opportunity | `OPP-YYYY-NNNN` | `OPP-2026-0001` |
| Founder | `FND-NNNN` | `FND-0007` |
| Source | `SRC-NNN` within an opportunity | `SRC-014` |
| Claim | `CLM-NNN` within an opportunity | `CLM-021` |
| Interview | `INT-NNN` within an opportunity | `INT-002` |
| Diligence item | `DD-NNN` within an opportunity | `DD-008` |
| Term-sheet draft | `TS-NNN` within an opportunity | `TS-003` |
| Event | `EVT-NNN` within an opportunity | `EVT-019` |

IDs never change when a title, company name, or founder name changes.

## 4. Opportunity Card Shape

The frontmatter contains only stable fields needed to find, route, and lock a card. Detailed and frequently changing content belongs in the Markdown body.

```markdown
---
schema_version: 1
id: OPP-2026-0001
title: Acme Robotics seed round
company_name: Acme Robotics
status: research
source_channel: inbound
priority: normal
created_at: 2026-07-18T09:15:00Z
updated_at: 2026-07-18T10:42:00Z
owners:
	investor: USR-001
	research_agent: research-agent
	interview_agent: interview-agent
founder_ids:
	- FND-0007
	- FND-0012
thesis_id: THESIS-001
decision_deadline: 2026-07-19T09:15:00Z
revision: 6
---
```

Allowed `status` values are:

```text
intake -> research -> interview_ready -> interviewing -> diligence
			 -> decision_ready -> negotiating -> invested
			 -> declined | withdrawn | on_hold
```

### 4.1 Executive Summary

The first screen for the investor. It is regenerated when research, interview, diligence, or terms materially change.

```markdown
## Executive Summary

**Recommendation:** Proceed to diligence
**Confidence:** Medium
**Decision deadline:** 2026-07-19 09:15 UTC

Acme Robotics is building ... [CLM-001][SRC-001]. The team has ...
[CLM-004][SRC-003], while customer concentration remains unverified [GAP-002].

### Why now
- ... [CLM-011][SRC-008]

### Reasons to believe
- ... [CLM-004][SRC-003]

### Reasons to hesitate
- ... [CLM-016][SRC-011]

### Blocking questions
- [ ] Confirm ownership of the core patent [DD-003]
- [ ] Reconcile conflicting ARR figures [CON-001]
```

The recommendation is one of `proceed`, `hold`, `decline`, or `invest`, with a confidence of `low`, `medium`, or `high`. Confidence describes the evidence supporting the recommendation, not the probability that the company succeeds.

### 4.2 Intake Snapshot

This section preserves what the founders actually submitted before enrichment.

```markdown
## Intake Snapshot

| Field | Value | Source |
|---|---|---|
| Received at | 2026-07-18 09:15 UTC | [SRC-001] |
| Channel | Inbound application | [SRC-001] |
| Company | Acme Robotics | [SRC-001] |
| Website | https://example.com | [SRC-001] |
| Stage | Pre-seed | [SRC-001] |
| Raise | $1.5M | [SRC-001] |
| Location | Berlin, Germany | [SRC-001] |
| One-line pitch | ... | [SRC-001] |

### Submitted materials
- Pitch deck: [SRC-002]
- Application form: [SRC-001]
- Founder CVs: [SRC-003], [SRC-004]
- Introductory email: [SRC-005]

### Research permissions
| Activity | State | Recorded at | Source |
|---|---|---|---|
| Public-web research | acknowledged | 2026-07-18 09:15 UTC | [SRC-001] |
| Private data access | not_granted | 2026-07-18 09:15 UTC | [SRC-001] |
| Interview recording | pending | 2026-07-18 09:15 UTC | [SRC-001] |
| Reference calls | pending | 2026-07-18 09:15 UTC | [SRC-001] |
```

Permission state is one of `pending`, `granted`, `declined`, `revoked`, `acknowledged`, or `not_applicable`.

### 4.3 Founders and Team

Every founder in the opportunity gets a subsection. The durable founder file is linked, while the snapshot records exactly what this opportunity used.

```markdown
## Founders and Team

### FND-0007 - Ada Example, CEO

**Profile:** [FND-0007](../founders/FND-0007.md)

**Snapshot at:** 2026-07-18T10:30:00Z

**Founder Score:** 74/100, medium confidence, improving trend

**Role and commitment:** CEO, full-time [CLM-020][SRC-001]

#### Relevant history
- Built ... [CLM-021][SRC-003]

#### Research hypotheses for interview
- **HYP-001:** Demonstrates high learning velocity. Evidence for: [CLM-021].
	Evidence against: none. Test with a non-leading question about a failed launch.
- **HYP-002:** Commercial ownership may be unclear. Evidence for: [CLM-024].
	Test by asking who owns the pipeline and how the last customer was closed.

#### Open founder questions
- [ ] Explain the date overlap between two listed roles [CON-003].

### Team Dynamics

| Dimension | Current view | Confidence | Evidence |
|---|---|---|---|
| Role coverage | ... | medium | [CLM-030], [INT-001] |
| Decision process | unknown | low | [GAP-006] |
| Conflict handling | ... | medium | [INT-001] |
| Shared commitment | ... | high | [CLM-031], [INT-001] |
```

The Founder Score persists in the founder file and may use track record, skills, demonstrated execution, learning velocity, and prior milestones. It must include its version, component scores, confidence, evidence, and trend. It is an input to the opportunity's founder axis, not a replacement for it.

### 4.4 Company and Idea

```markdown
## Company and Idea

### Problem
... [CLM-040][SRC-002]

### Product
... [CLM-041][SRC-002]

### Technology and Feasibility
... [CLM-042][SRC-009]

### Market
... [CLM-043][SRC-010]

### Business Model and Go-to-Market
... [CLM-044][SRC-002]

### Traction and KPIs
| Metric | Value | As of | Verification | Evidence |
|---|---:|---|---|---|
| ARR | $120,000 | 2026-06-30 | founder_claimed | [CLM-045][SRC-002] |
| Customers | 4 | 2026-06-30 | externally_verified | [CLM-046][SRC-012] |

### Competition and Comparables
| Company | Similarity | Differentiator | Evidence |
|---|---|---|---|
| Example Inc. | Direct | ... | [SRC-013] |
```

### 4.5 Evidence Ledger

The ledger is the card's source of truth. Narrative sections cite it instead of embedding unsupported conclusions.

```markdown
## Evidence Ledger

### Sources
| ID | Type | Origin | Collected at | Access | Location |
|---|---|---|---|---|---|
| SRC-001 | intake_form | founder | 2026-07-18 09:15 UTC | private | [artifact](../sources/OPP-2026-0001/SRC-001-intake.md) |
| SRC-009 | web_page | public web | 2026-07-18 10:02 UTC | public | https://example.com |
| SRC-015 | interview | founder | 2026-07-18 14:30 UTC | private | [INT-001](../interviews/OPP-2026-0001/INT-001-transcript.md) |

### Claims
| ID | Claim | Subject | State | Trust | Evidence | Last checked |
|---|---|---|---|---|---|---|
| CLM-045 | Company has $120k ARR | company | claimed | low | [SRC-002] | 2026-07-18 |
| CLM-046 | Company has four paying customers | company | verified | high | [SRC-002], [SRC-012] | 2026-07-18 |

### Contradictions
| ID | Conflict | Evidence | Resolution | State |
|---|---|---|---|---|
| CON-001 | Deck says $120k ARR; application says $90k | [SRC-001], [SRC-002] | Ask for current revenue export | open |

### Missing Information
| ID | Missing item | Why it matters | Next action | Owner | State |
|---|---|---|---|---|---|
| GAP-002 | Customer concentration | Revenue quality | Ask in interview | interview-agent | open |
```

Claim state is one of `claimed`, `partially_verified`, `verified`, `contradicted`, `disproven`, or `unknown`. Trust is assessed per claim, never once for the entire company.

### 4.6 Research Assessment

```markdown
## Research Assessment

### Thesis Fit
| Dimension | Assessment | Evidence |
|---|---|---|
| Sector | fit | [CLM-041] |
| Stage | fit | [CLM-045] |
| Geography | fit | [CLM-020] |
| Check size | partial_fit | [CLM-050] |
| Ownership target | unknown | [GAP-010] |
| Risk appetite | fit | [CLM-052] |

### Independent Screening Axes
| Axis | Rating | Trend | Confidence | Rationale and evidence |
|---|---|---|---|---|
| Founder | strong | improving | medium | ... [CLM-021], [CLM-031] |
| Market | bullish | stable | medium | ... [CLM-043], [SRC-013] |
| Idea vs. market | promising_with_changes | improving | low | ... [CLM-042], [CON-004] |

### Research Agent Recommendation
**Next action:** Proceed to interview

**Reason:** ...

**Generated at:** 2026-07-18T11:00:00Z

**Model/prompt version:** research-agent@1.2
```

The axis vocabularies may be configured by the fund, but all three axes, their trends, and their confidence values must remain visible.

### 4.7 Interview and Live Negotiation Model

The interview is not a generic founder chat. It tests the hypotheses and gaps produced by research, observes team dynamics, and prepares a truthful negotiation model. All founders are interviewed; joint and individual sessions may both be used.

```markdown
## Interview

### Plan
| Session | Participants | Hypotheses and gaps | Format | State |
|---|---|---|---|---|
| INT-001 | FND-0007, FND-0012 | HYP-001, HYP-002, GAP-002 | joint video | scheduled |
| INT-002 | FND-0007 | CON-003, GAP-006 | individual voice | pending |

### Session INT-001
**Started:** 2026-07-18T14:00:00Z

**Ended:** 2026-07-18T14:31:00Z

**Consent to record:** granted [SRC-016]

**Transcript:** [INT-001 transcript](../interviews/OPP-2026-0001/INT-001-transcript.md)

**Recording:** [INT-001 recording](../interviews/OPP-2026-0001/INT-001-recording.url)

#### Hypothesis outcomes
| Hypothesis | Outcome | Confidence | Evidence |
|---|---|---|---|
| HYP-001 | supported | medium | [INT-001 08:14-10:02] |
| HYP-002 | contradicted | high | [INT-001 15:30-18:40] |

#### Observed team dynamics
- ... [INT-001 20:10-22:05]

#### Follow-ups created
- [ ] Request customer concentration table [GAP-002]

### Negotiation Model

#### Investor
| Field | Current model | Confidence | Evidence |
|---|---|---|---|
| Interests | Own 7-10%; limit technical and key-person risk | high | [THESIS-001], [DD-004] |
| BATNA | Invest in comparable OPP-2026-0008 | medium | [OPP-2026-0008] |
| Reservation point | No deal above $12M pre-money without added protection | medium | [SRC-030] |
| Target | $9M pre-money, 8% ownership | medium | [SRC-030] |
| Opening position | $8M pre-money | medium | [SRC-030] |

#### Founder Team
| Field | Current model | Confidence | Evidence |
|---|---|---|---|
| Interests | Speed, lead investor signal, minimal control terms | medium | [INT-001 24:00-27:10] |
| Estimated BATNA | Existing soft circle plus continued bootstrapping | low | [INT-001 27:15-28:30] |
| Estimated reservation point | Unknown; do not infer yet | low | [GAP-014] |
| Likely target | $12M pre-money | medium | [CLM-061], [INT-001 28:31-29:05] |
| Non-price priorities | Board observer only; pro-rata rights | medium | [INT-001 29:05-30:00] |

#### Zone and Levers
**Estimated ZOPA:** $9M-$12M pre-money, low confidence

**Levers:** check size, valuation, ownership, instrument, pro-rata, information rights, board rights, closing speed, milestones

**No-bluff constraint:** Never invent another offer, deadline, investor, traction fact, or approval.

### Live Model Updates
| At | Speaker | New signal | Model change | Evidence |
|---|---|---|---|---|
| 14:24 | FND-0007 | Speed matters more than board rights | Added closing speed as a high-value lever | [INT-001 24:00-24:40] |
```

BATNA is the best available alternative if no agreement is reached. It is not the same as a reservation point, target, opening position, or ZOPA. The agent updates each separately and labels inferred founder positions as estimates.

### 4.8 Diligence

```markdown
## Diligence

| ID | Area | Check | Result | Confidence | Evidence | Owner | State |
|---|---|---|---|---|---|---|---|
| DD-001 | people | Reference call | ... | medium | [SRC-020] | research-agent | complete |
| DD-002 | market | Market-size assumptions | ... | medium | [SRC-021] | research-agent | complete |
| DD-003 | legal | Patent ownership | unknown | low | [GAP-004] | human | blocked |
| DD-004 | technical | Architecture feasibility | ... | medium | [SRC-023] | specialist-agent | complete |

### Diligence Summary
- **Passed:** ...
- **Risks accepted:** ...
- **Open blockers:** DD-003
- **Information not available:** Cap table not disclosed.
```

Specialist or human diligence may be used for legal, technical, market, financial, and reference checks. Confidential ideas must not be sent to external experts without explicit authorization and appropriate disclosure controls.

### 4.9 Proposed Term-Sheet Envelope

The research agent proposes the lower and upper bounds. The interview agent refines them using verified signals and the negotiation model. Bounds are shown for each economic or control term; there is no ambiguous single "term-sheet range."

```markdown
## Proposed Term-Sheet Envelope

**Instrument:** Priced seed equity

**Currency:** USD

**Draft status:** internal_recommendation

**Generated from:** research through 2026-07-18T16:00:00Z, interviews INT-001 and INT-002

| Term | Investor-favorable bound | Target | Founder-favorable bound | Rationale and evidence |
|---|---:|---:|---:|---|
| Investment amount | $750k | $1.0M | $1.25M | Runway and concentration risk [CLM-070], [DD-002] |
| Pre-money valuation | $8M | $9M | $12M | Comparable rounds and traction [SRC-025], [CLM-045] |
| Ownership | 10% | 8% | 7% | Fund thesis [THESIS-001] |
| Option-pool treatment | Pre-money | Split | Post-money | Hiring plan [CLM-072] |
| Board rights | Observer | Observer | None | Key-person risk [DD-005] |
| Pro-rata | Full | Full | Capped | Follow-on strategy [THESIS-001] |

### Assumptions
- Revenue is verified at or above $120k ARR [CLM-045].
- Patent ownership is resolved before signing [DD-003].

### Sensitivities
- If ARR verifies below $90k, reduce the valuation target to $8M.
- If patent ownership remains unresolved, pause rather than compensate only with price.

### Negotiation Plan
1. Open at the investor-favorable valuation while framing speed and decision certainty.
2. Trade valuation movement only for terms the fund values, such as ownership or pro-rata.
3. Use only verified competing opportunities or offers as leverage.
4. Ask diagnostic questions before conceding to identify the founders' highest-value non-price terms.
5. Pause at the reservation point and escalate to the human investor; the agent cannot cross it.

### Concession Log
| At | Requested by | From | To | Received in return | Evidence | Approved by |
|---|---|---|---|---|---|---|
| 2026-07-18 17:10 UTC | founder | $8M | $9M pre-money | Full pro-rata and 48-hour close | [INT-003 11:20-13:05] | USR-001 |

### Draft
[TS-001 internal draft](../term-sheets/OPP-2026-0001/TS-001-draft.md)
```

Each bound must cite comparables, thesis constraints, diligence, or interview evidence. A bound without a stated assumption and source is invalid. Proposed terms are not legal documents and require investor and counsel review.

### 4.10 Decision and Audit Log

```markdown
## Decision

**State:** pending

**Recommendation:** invest

**Human decision:** not_recorded

**Approved term-sheet draft:** none

### Conditions
- Resolve DD-003.
- Receive current cap table.

### Human Review
| At | Reviewer | Action | Rationale |
|---|---|---|---|
| 2026-07-18 16:30 UTC | USR-001 | requested_changes | Tighten valuation sensitivity |

## Event Log

| ID | At | Actor | Action | Revision | Details |
|---|---|---|---:|---|
| EVT-001 | 2026-07-18 09:15 UTC | intake-service | created | 1 | Imported SRC-001 and SRC-002 |
| EVT-002 | 2026-07-18 10:42 UTC | research-agent@1.2 | enriched | 2 | Added CLM-020 through CLM-046 |
| EVT-003 | 2026-07-18 14:31 UTC | interview-agent@1.0 | interview_completed | 3 | Added INT-001 and updated HYP-001 |
```

The event log records meaningful mutations, not every token-level write. The frontmatter `revision` increments with each committed mutation.

## 5. Durable Founder Profile

The founder file prevents a person's history from resetting when they pursue another idea. It contains:

- identity and deduplication aliases;
- consent and data-access state;
- dated roles, skills, projects, education, publications, and milestones;
- evidence-backed claims and contradictions;
- Founder Score history, components, confidence, and trend;
- opportunities linked by ID; and
- a profile event log.

Sensitive interview observations are not automatically copied into unrelated opportunities. A new card receives only a dated snapshot allowed by the applicable consent and access policy.

## 6. Agent Responsibilities

### Intake service

- Creates the opportunity ID and initial card.
- Stores submitted files without modifying them.
- Records source channel, timestamps, founders, and permissions.
- Deduplicates against existing company and founder records.

### Research agent

- Reads intake artifacts and permitted public sources.
- Enriches founder, company, market, competitor, and comparable-round information.
- Creates claims, source entries, contradictions, missing-information items, and interview hypotheses.
- Updates the three screening axes independently.
- Proposes an initial term-sheet envelope and negotiation plan.
- Never upgrades a claim to `verified` without independent evidence.

### Interview agent

- Reads the opportunity card and turns hypotheses, contradictions, and gaps into non-leading questions.
- Interviews every founder, jointly or individually as appropriate.
- Captures consent, transcripts, recordings, and evidence pointers.
- Updates hypothesis outcomes, team dynamics, claims, gaps, and the negotiation model during the conversation.
- Maintains separate BATNA, reservation point, target, opening position, and ZOPA estimates.
- May recommend a concession but cannot exceed an approved reservation point or make an unapproved offer.

### Diligence agents and specialists

- Execute scoped checks and attach results to diligence IDs.
- Preserve `unknown` when evidence is unavailable.
- Escalate checks that require privileged data, legal judgment, domain expertise, or human authorization.

### Human investor

- Resolves escalations and overrides with written rationale.
- Approves the decision, negotiation authority, and external term sheet.
- Owns exceptions to fund thesis or reservation points.

## 7. Update Protocol

An agent update is a small transaction:

1. Read the card and note its `revision`.
2. Write artifacts first and assign stable IDs.
3. Add or supersede evidence, claims, and analysis in the card.
4. Append one event describing the mutation.
5. Increment `revision` and update `updated_at`.
6. Refuse the write if the on-disk revision changed; reread and merge instead.

Agents own sections, not facts. For example, the research agent is the normal writer for Research Assessment, but a human can correct it through a sourced override. No agent may rewrite Intake Snapshot as though enriched data came from the founder.

When a claim changes, retain the original ledger row and mark it superseded in its text or state. New conclusions cite the replacement claim. This keeps old term-sheet reasoning reproducible.

## 8. Validation Rules

A card is valid when:

- frontmatter parses and all required fields exist;
- IDs are unique and all internal links resolve;
- every material narrative claim cites at least one claim or source ID;
- every claim has a state, trust level, and last-checked date;
- all founders have a durable profile link and opportunity snapshot;
- the three screening axes remain separate;
- interview evidence points to a transcript location or source;
- negotiation terms distinguish BATNA, reservation point, target, and opening position;
- each term bound has evidence and assumptions;
- `decision_ready` has no unacknowledged blocking diligence item;
- `negotiating` has a human-approved authority envelope; and
- `invested` links an approved, externally issued term sheet.

## 9. Querying the Markdown Database

The UI or a command-line indexer scans frontmatter and selected headings. Typical queries include:

- opportunities in `interview_ready` with a deadline in the next six hours;
- bullish markets where founder assessment is weak or uncertain;
- unresolved contradictions involving revenue or founder history;
- opportunities matching sector, stage, geography, check size, and ownership thesis;
- all opportunities connected to a founder, competitor, market, or source channel; and
- negotiations whose current position is near the approved reservation point.

The generated index is disposable. Markdown cards and linked artifacts remain the authoritative database.

## 10. MVP Boundary

For the first demo, implement one inbound opportunity with two founders:

1. Intake imports an application, deck, and CVs.
2. Research enriches the card, registers evidence, and creates interview hypotheses.
3. The interview agent conducts a joint founder call and visibly updates the negotiation model.
4. Diligence records a small number of verified, contradicted, and unknown checks.
5. The system produces a sourced term-sheet envelope and negotiation plan.
6. A human approves or edits the recommendation before any founder-facing negotiation.

Outbound sourcing can later create the same card with `source_channel: outbound`. Once a founder accepts outreach and supplies the minimum application material, the opportunity enters the same pipeline as inbound; there is no second database or scoring path.
