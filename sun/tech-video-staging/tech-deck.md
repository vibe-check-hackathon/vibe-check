# Opportunity OS: Technical Architecture

**Format:** 4 slides, 60 seconds total  
**Scope:** architecture, core data contract, execution controls, and implementation slice

---

## Slide 1 — System Architecture

**Time:** 0:00-0:15

### Slide content

```text
Browser
   |
   v
Next.js Web/API ----------------------> PostgreSQL + pgvector
   |                                         |
   +-------------------------------> S3 artifact storage
   |
   v
Temporal workflows
   |
   v
TypeScript workers
   +----> OpenAI Agents SDK
   +----> document parsing / OCR
   +----> ElevenLabs WebRTC voice
   +----> external data connectors
   |
   v
Card Writer -> revision + outbox event
```

- **Deployment:** modular monolith; `web` and `worker` processes from one TypeScript monorepo
- **Stack:** Next.js, React, Temporal, PostgreSQL/pgvector, S3, OpenAI Agents SDK, ElevenLabs, Zod, Drizzle
- **Integration:** HTTP commands, Server-Sent Events, Temporal activities, transactional outbox, webhooks

### Technical point

The modular monolith keeps transactions and domain ownership simple. Temporal isolates long-running and failure-prone work without introducing a distributed service topology.

### Talk track

> The system is a TypeScript modular monolith deployed as a Next.js web process and a Temporal worker. Postgres owns operational state, S3 stores immutable artifacts, and provider integrations sit behind typed adapters.

---

## Slide 2 — Opportunity Card: Canonical Data Contract

**Time:** 0:15-0:30

### Slide content

Use a large **Opportunity Card UI placeholder** in the center:

```text
┌─────────────────────────────────────────────────┐
│ [ OPPORTUNITY CARD — UI PLACEHOLDER ]           │
│ YAML: identity | status | revision | consent    │
│                                                 │
│ Founder | Market | Idea-versus-Market           │
│ Claims | Evidence | Unknowns | Contradictions   │
│ Interview findings | Recommendation | Terms     │
└─────────────────────────────────────────────────┘
```

Around the placeholder, show the write contract:

```text
Agent / human
     |
     v
CardPatchProposal
  baseRevision + operationId + section patches
     |
     v
Card Writer
  authorize -> validate -> deduplicate -> commit
     |
     +--> immutable card revision
     +--> search projection
     +--> outbox event
```

- Canonical representation: **Markdown + YAML front matter**
- Portable schema: **JSON Schema**; runtime validation: **Zod**
- Concurrency: serialized agent writes plus renewable human edit lease
- Provenance: material conclusions link to findings, artifacts, transcripts, or calculations

### Technical point

The Card is the authoritative business artifact. Database fields are indexed projections, not a second source of truth. Agents propose typed patches and never mutate Markdown directly.

### Talk track

> The Opportunity Card is the canonical contract: Markdown for readable analysis and typed YAML for workflow state. A Card Writer validates revisioned patches, records provenance, updates projections, and emits an outbox event.

---

## Slide 3 — Deterministic Shell, Bounded Agents

**Time:** 0:30-0:45

### Slide content

```text
TEMPORAL / APPLICATION CODE              AGENT TASKS
-----------------------------------      --------------------------
workflow state and retries               extract claims
idempotency and activity routing         plan targeted research
permissions and tool allowlists          summarize cited sources
approval waits and escalation            propose interview questions
card write ordering                      draft qualitative rationale
financial calculations                   suggest negotiation moves
external side-effect authorization
```

Control path:

```text
untrusted artifact
 -> scoped context package
 -> bounded agent + typed tools
 -> structured proposal
 -> policy / approval gate
 -> Card Writer or external action
```

- Model selection uses capability aliases, not hard-coded provider model names.
- Financial terms come from versioned TypeScript functions with input and formula traces.
- Negotiation is limited by approved per-term bounds, non-negotiable clauses, and BATNA policy.
- Founder-facing actions, material terms, and legal output require explicit human approval.

### Technical point

Models perform uncertain reasoning. Deterministic code controls commits, calculations, authority, and side effects. This boundary makes retries safe and agent behavior auditable.

### Talk track

> Temporal provides the deterministic shell: retries, idempotency, approvals, and write ordering. Agents handle bounded reasoning tasks, while typed tools and policy gates control state changes, calculations, and external side effects.

### Evidence footnote

_The system design follows the evidence-constrained negotiation and deterministic term-model hypotheses in the Business Assessment. BATNA supplies the disagreement boundary for multi-issue negotiation; approved authority bounds remain controlling. See Academic Assessment, “Term Sheet Negotiation.”_

---

## Slide 4 — End-to-End Implementation Slice

**Time:** 0:45-1:00

### Slide content

```text
1. Upload deck + intake
2. Validate, store, parse / OCR
3. Create schema-valid Opportunity Card
4. Research claims and surface a contradiction or unknown
5. Generate and run a voice interview
6. Commit transcript-linked findings
7. Run independent Founder / Market / Idea-versus-Market assessments
8. Calculate and annotate draft terms
9. Require approval; reject out-of-bounds negotiation
10. Export Card, artifact manifest, calculations, and audit history
```

Implementation layout:

```text
/apps/web       Next.js workspace and API
/apps/worker    Temporal workers and provider activities
/packages       card, evidence, interview, calculations, agents, workflows
/prompts        versioned domain prompts
/schemas        cards, events, and tool contracts
/evals          extraction, grounding, injection, consent, and calculation tests
```

Verification targets:

- stale Card update is rejected or rebased
- every external side effect is idempotent
- every material term has evidence or a formula trace
- prompt injection cannot expand tool authority
- consent withdrawal marks dependent findings unusable and triggers reassessment

### Technical point

The first release implements one complete workflow with real persistence, provider calls, failure handling, approvals, and exports. Depth is concentrated at the trust boundaries rather than spread across disconnected demos.

### Talk track

> The first implementation exercises the full path: deck ingestion, cited research, voice interview, independent assessments, deterministic terms, and approval-gated negotiation. Acceptance tests target stale writes, outages, injection, consent withdrawal, and authority violations.

---

## Full 60-Second Script

> The system is a TypeScript modular monolith deployed as a Next.js web process and a Temporal worker. Postgres owns operational state, S3 stores immutable artifacts, and provider integrations sit behind typed adapters.
>
> The Opportunity Card is the canonical contract: Markdown for readable analysis and typed YAML for workflow state. A Card Writer validates revisioned patches, records provenance, updates projections, and emits an outbox event.
>
> Temporal provides the deterministic shell: retries, idempotency, approvals, and write ordering. Agents handle bounded reasoning tasks, while typed tools and policy gates control state changes, calculations, and external side effects.
>
> The first implementation exercises the full path: deck ingestion, cited research, voice interview, independent assessments, deterministic terms, and approval-gated negotiation. Acceptance tests target stale writes, outages, injection, consent withdrawal, and authority violations.

**Timing target:** approximately 125 words at 125 words per minute.
