# Opportunity Intelligence and Negotiation System

## Implementation Technical Specification

**Status:** Proposed implementation baseline  
**Target:** Production-shaped end-to-end demonstration  
**Primary user:** VC deal-team member investigating a lead before a term sheet exists  
**Primary language:** TypeScript  
**Architecture principle:** Deterministic shell, agentic core  
**Canonical artifact:** One Markdown Opportunity Card per opportunity

---

## 1. Product Scope

### 1.1 First implementation

Build a **broad but production-shaped workflow composed of several connected vertical slices**:

1. Create an opportunity from a pitch deck and intake form.
2. Parse and enrich its Opportunity Card.
3. Research selected founder, market, and technical claims.
4. Apply the fund thesis and produce independent assessments.
5. Generate an interview plan.
6. Conduct or replay a browser voice interview.
7. Update the card from cited interview evidence.
8. Produce an evidence-linked recommendation.
9. Generate an annotated draft term sheet.
10. Require human approval before any founder-facing negotiation.

The implementation must tell a complete end-to-end story. Individual capabilities may be shallow, but their integration must be real.

A separate demo may provide a deeper treatment of the interview agent.

### 1.2 First operating user

The first user is a **VC deal-team member**, acting as the lead investor or analyst investigating an opportunity before a term sheet exists.

Initial collaboration supports:

- One fund workspace
- A small investment team
- Opportunity ownership
- Review assignments
- Comments and overrides
- Explicit approval checkpoints

### 1.3 Product boundary

The initial product provides:

- Intake and sourcing
- Evidence gathering
- Research and diligence
- Thesis-fit assessment
- Interview preparation and execution
- Opportunity Card maintenance
- Recommendation generation
- Deterministic financial calculations
- Draft term-sheet generation
- Constrained negotiation simulation or approved communication

The product does **not** autonomously:

- Invest or decline
- Sign legal documents
- Change legal clauses without review
- Commit capital
- Issue an external offer outside approved bounds
- Treat personality, emotion, or deception inference as established fact

Human investors retain final authority. Counsel approval remains mandatory for binding legal documents.

---

## 2. Architectural Decisions

### 2.1 System shape

Use a **modular monolith with isolated background workers**.

Deploy two processes from the same TypeScript monorepo and container image:

- `web`: Next.js application, API, workspace and synchronous commands
- `worker`: Temporal workers, agent tasks, ingestion and enrichment

This avoids premature microservices while preserving clear module boundaries.

### 2.2 Runtime architecture

```text
Browser
   |
   v
Next.js Web/API
   |
   +------ PostgreSQL
   +------ Object Storage
   +------ Temporal
   +------ OpenAI gateway
   +------ ElevenLabs
   +------ External connectors
                |
                v
        TypeScript Workers
                |
                v
      Card Writer / Event Outbox
```

### 2.3 Domain modules

The monolith is divided into these internal modules:

1. **Identity and access**
2. **Opportunity intake**
3. **Opportunity Card**
4. **Artifacts and documents**
5. **Evidence and findings**
6. **Research and diligence**
7. **Thesis and assessment**
8. **Interview**
9. **Terms and calculations**
10. **Negotiation**
11. **Workflow orchestration**
12. **Notifications**
13. **Audit and evaluation**
14. **Provider adapters**

Agents are aligned with business domains:

- Sourcing agent
- Research agent
- Diligence agent
- Interview agent
- Assessment agent
- Terms agent
- Negotiation agent
- Security-review agent

These are logical roles, not separately deployed services.

### 2.4 Communication

Use:

- Synchronous HTTP commands for user interactions
- Server-Sent Events for live progress
- Temporal workflows for long-running processes
- PostgreSQL transactional outbox events for internal state propagation
- Webhooks for external integrations

Do not introduce Kafka or GraphQL initially.

Temporal is selected because workflows can resume after process, network or infrastructure failures and can persist across long delays and human approval steps. ([docs.temporal.io](https://docs.temporal.io/?utm_source=openai))

### 2.5 Deployment

Initial deployment:

- One AWS region
- Containers on ECS/Fargate
- Application Load Balancer
- Amazon RDS for PostgreSQL
- S3 for artifacts
- CloudFront for controlled report delivery
- AWS Secrets Manager
- Temporal Cloud, or self-hosted Temporal only when customer requirements demand it
- OpenAI and ElevenLabs through server-side provider gateways

Kubernetes is deferred until service count, networking needs or customer-hosted deployments justify it.

---

## 3. Technology Stack

### 3.1 Application

- TypeScript
- Node.js current active LTS
- Next.js App Router
- React
- Zod
- Drizzle ORM
- TanStack Query for asynchronous client state
- Server-Sent Events for workflow updates
- pnpm workspaces
- Turborepo
- Vitest
- Playwright

Next.js App Router supports Server Components, Suspense and Server Functions and remains the recommended modern Next.js application model. ([nextjs.org](https://nextjs.org/docs/app?utm_source=openai))

### 3.2 UI

- Tailwind CSS
- shadcn/ui
- Radix primitives
- Tiptap editor
- GFM/CommonMark serialization

shadcn/ui provides application-owned component source instead of a closed component package. ([ui.shadcn.com](https://ui.shadcn.com/docs?utm_source=openai))

Tiptap is selected instead of the unclear “Word Guard” reference. It is a mature ProseMirror-based editor with schemas, transactions, Markdown support and a path to Yjs collaboration. ([tiptap.dev](https://tiptap.dev/docs/editor/core-concepts/prosemirror?utm_source=openai))

### 3.3 AI platform

- OpenAI Agents SDK for TypeScript
- OpenAI Responses-based models
- Zod structured outputs
- Internal typed tool registry
- MCP adapters for external agent interoperability
- Provider abstraction at the model gateway

The OpenAI TypeScript Agents SDK supports tools, handoffs, guardrails, persistent sessions, human intervention, tracing, MCP and typed outputs. ([openai.github.io](https://openai.github.io/openai-agents-js/?utm_source=openai))

Avoid hard-coding model names throughout the application. Use capability aliases:

```ts
type ModelTier = "extract-fast" | "classify-fast" | "reason-standard" | "reason-frontier" | "realtime-voice" | "embedding";
```

The model gateway maps these aliases to provider models through configuration.

### 3.4 Voice

Use ElevenLabs Agents for the first browser voice implementation:

- WebRTC browser transport
- Signed server-generated conversation tokens
- OpenAI-backed custom LLM where supported
- Transcript and timestamps
- Configurable turn-taking
- Interruption handling
- Retention controls
- Twilio integration only when telephone calls are added

ElevenLabs supports browser WebRTC, React integration, telephony, conversation events, configurable retention and custom LLM integration. ([elevenlabs.io](https://elevenlabs.io/blog/conversational-ai-webrtc?utm_source=openai))

### 3.5 Documents

Use a layered parsing pipeline:

1. Native text extraction where possible
2. Mistral Document AI OCR for scanned or complex PDFs
3. Multimodal model extraction for charts and slide layouts
4. Zod validation
5. Human spot checks for material fields

Mistral OCR preserves document hierarchy, lists and tables and can return schema-constrained annotations and confidence information. ([docs.mistral.ai](https://docs.mistral.ai/studio-api/document-processing/basic_ocr?utm_source=openai))

LlamaIndex may be used behind an adapter for document chunking and ingestion, but it must not own domain state.

---

## 4. Opportunity Card

### 4.1 Source of truth

The canonical business artifact is a **Markdown document with YAML front matter**.

PostgreSQL stores:

- The current canonical Markdown
- Parsed front matter
- Search projection
- Revision metadata
- Workflow metadata
- Linked artifacts
- Audit records

There is one authoritative card document per opportunity. Database columns and indexes are projections of that card, not competing authoritative representations.

### 4.2 Example

```markdown
---
schema_version: "1.0"
opportunity_id: "01K0..."
tenant_id: "01JZ..."
company_name: "Example Labs"
founder_ids:
  - "01K0..."
status: "research"
owner_user_id: "01JZ..."
thesis_id: "01JY..."
created_at: "2026-07-19T18:00:00Z"
updated_at: "2026-07-19T20:15:00Z"
revision: 17
content_hash: "sha256:..."
consent:
  interview: true
  recording: false
---

# Summary

## Company

## Founders

## Product and Technical Thesis

## Market

## Founder Assessment

## Market Assessment

## Idea-versus-Market Assessment

## Claims and Evidence

## Unknowns and Contradictions

## Interview Findings

## Recommendation

## Proposed Terms

## Workflow Trace
```

### 4.3 Typed fields

Only stable workflow fields are mandatory initially:

- Schema version
- Opportunity ID
- Tenant ID
- Company display name
- Founder IDs
- Status
- Owner
- Thesis ID
- Timestamps
- Revision
- Content hash
- Consent flags

Assessments, evidence summaries and negotiation notes remain semi-structured Markdown for the MVP.

### 4.4 Schema management

- JSON Schema is the portable card contract.
- Zod is the TypeScript runtime representation.
- Every card has `schema_version`.
- The application reads old versions and writes the newest version.
- Migrations are explicit, tested transformations.
- Invalid cards may be viewed but cannot advance workflow state.

### 4.5 Identifiers

Use ULIDs for distributed, sortable identifiers.

Display short human-readable aliases such as:

```text
OPP-2026-0184
```

Aliases are not primary keys.

### 4.6 Card writes

All automated updates pass through a **Card Writer**.

Agents cannot write arbitrary Markdown directly. They submit:

```ts
interface CardPatchProposal {
  opportunityId: string;
  baseRevision: number;
  operationId: string;
  agentRole: string;
  summary: string;
  sections: SectionPatch[];
  artifactIds: string[];
  confidence: "low" | "medium" | "high";
  risk: "low" | "material" | "external";
}
```

The Card Writer:

1. Validates identity and permissions.
2. Verifies the base revision.
3. Validates the patch schema.
4. Rejects unknown sections.
5. Deduplicates by operation ID.
6. Applies policy checks.
7. Saves a new immutable revision.
8. Updates search projections.
9. Emits an outbox event.

### 4.7 Concurrency

For the MVP:

- Agent mutations are serialized per opportunity through a Temporal workflow.
- Only one Card Writer operation runs per card at a time.
- Human editing obtains a renewable edit lease.
- Agents may read the last committed version but cannot commit while the lease is active.
- Stale updates are regenerated or rebased by the coordinator.

CRDT editing is deferred. Tiptap/Yjs provides a future path if simultaneous editing becomes necessary. ([tiptap.dev](https://tiptap.dev/docs/editor/extensions/functionality/collaboration?utm_source=openai))

### 4.8 History and integrity

Every committed revision records:

- Previous revision
- Whole-document snapshot
- Structured patch
- Author type and ID
- Agent run ID
- Workflow ID
- Timestamp
- Content hash
- Approval reference

This supplies readable history without full event sourcing.

---

## 5. Data Model and Persistence

### 5.1 PostgreSQL

Use PostgreSQL as the primary operational database.

It provides:

- Transactions
- JSONB
- Full-text search
- Row-level security
- Vector search through pgvector
- Mature backup and replication
- Sufficient relationship modeling for the MVP

PostgreSQL supports full-text indexing over JSONB, while row-level security can enforce default-deny tenant policies. ([postgresql.org](https://www.postgresql.org/docs/current/ddl-rowsecurity.html?utm_source=openai))

### 5.2 Core tables

```text
tenants
users
memberships
opportunities
opportunity_cards
card_revisions
founders
opportunity_founders
artifacts
artifact_extractions
findings
tasks
workflow_runs
agent_runs
interviews
transcript_segments
assessments
term_models
term_revisions
negotiation_sessions
offers
consent_records
approvals
audit_events
outbox_events
embeddings
```

### 5.3 Shared founder memory

Founder identity is first class:

- Stable founder ULID
- Emails, domains and known external IDs
- Dated profile snapshots
- Links to opportunities
- Human-confirmed merges

Other entities may remain textual until a repeated cross-card use case justifies normalization.

Do not add Neo4j initially. PostgreSQL relationships and recursive queries are sufficient. Introduce a graph database only after measured query needs exceed this design.

### 5.4 Artifacts

Store source files in S3:

```text
s3://bucket/{tenantId}/{opportunityId}/{artifactId}/{version}
```

Each artifact includes:

- Source URL or external ID
- MIME type
- SHA-256 hash
- Observation timestamp
- Retrieval timestamp
- Parser version
- Retention class
- Encryption metadata

### 5.5 Search

MVP search combines:

- PostgreSQL full-text search
- Metadata filters
- pgvector semantic retrieval
- Reciprocal Rank Fusion
- Optional model reranking

pgvector supports exact search, HNSW and hybrid use with PostgreSQL full-text search. ([github.com](https://github.com/pgvector/pgvector?utm_source=openai))

The same search API supports human queries and agent retrieval.

---

## 6. Evidence, Unknowns and Provenance

### 6.1 Deliberately lightweight model

The primary UX remains free-form and readable, but a minimal internal finding record is required:

```ts
interface Finding {
  id: string;
  opportunityId: string;
  kind: "fact" | "inference" | "unknown" | "contradiction";
  statement: string;
  sourceArtifactIds: string[];
  sourceLocator?: {
    page?: number;
    timestampStartMs?: number;
    timestampEndMs?: number;
    externalUrl?: string;
  };
  confidence: "low" | "medium" | "high";
  producedBy: "human" | "agent" | "extractor" | "calculation";
  observedAt?: string;
  createdAt: string;
}
```

Precise bounding boxes and universal evidence-span triples are not MVP requirements.

### 6.2 Trust

Display trust as:

- Low
- Medium
- High

An agent may recommend trust, but must include a short explanation considering:

- Source type
- Directness
- Corroboration
- Extraction confidence
- Contradictions
- Observation date

Do not present an uncalibrated numeric confidence as a probability.

Fine-tuning a trust model is deferred until verified labels exist.

### 6.3 Contradictions and gaps

Contradictions and unknowns are explicit card sections.

Important items become review tasks with:

- Owner
- Materiality
- Suggested next action
- Deadline
- Resolution status

Conflicting claims are retained. The system must not silently choose one merely because an agent assigns it greater confidence.

### 6.4 Provenance objective

Users must be able to trace:

```text
Term-sheet field
  -> calculation or rationale
  -> assessment
  -> finding
  -> artifact or transcript
  -> source URL/file
```

This lineage is mandatory for material numbers and recommendations even though the underlying evidence model remains intentionally lightweight.

---

## 7. Intake and Enrichment

### 7.1 MVP channels

Implement:

- Web intake form
- Pitch-deck upload
- Manual opportunity creation
- Dedicated inbound email address

Demonstrate through adapters:

- Google Forms
- CRM integration
- Mailbox ingestion
- Cloud-drive import

### 7.2 Outbound sourcing

Use APIs before crawlers:

1. Official public APIs
2. Licensed commercial providers
3. Search APIs
4. Browser automation as a controlled fallback

Potential sources include GitHub, Crossref, OpenAlex, patent databases, company registries, Harmonic and PitchBook where licensed.

Do not scrape authenticated LinkedIn pages in the MVP.

### 7.3 Intake workflow

```text
Upload
 -> malware/type validation
 -> immutable artifact storage
 -> parsing/OCR
 -> structured extraction
 -> identity matching
 -> draft card
 -> material-field review
 -> card commit
 -> enrichment workflow
```

Extraction accuracy is measured rather than promised. Material financial, identity and ownership fields require human confirmation until evaluation demonstrates acceptable performance.

---

## 8. Workflow and Agent Architecture

### 8.1 Deterministic shell

Temporal owns:

- Workflow state
- Retries
- Timers
- Deadlines
- Human approval waits
- Idempotency
- Activity routing
- Card write ordering
- Escalation

The model never decides whether an activity has committed successfully.

### 8.2 Agentic core

OpenAI Agents SDK runs bounded domain tasks such as:

- Extracting facts
- Planning research
- Summarizing sources
- Proposing follow-up questions
- Assessing qualitative criteria
- Drafting rationales
- Suggesting negotiation moves

The SDK’s small TypeScript-first primitive set and structured outputs fit the desired agentic-core/code-shell architecture. ([openai.github.io](https://openai.github.io/openai-agents-js/?utm_source=openai))

### 8.3 Unit of work

The preferred agent work unit is one:

- Claim
- Unknown
- Contradiction
- Source artifact
- Assessment criterion
- Interview hypothesis
- Negotiation decision

This keeps context narrow and makes failures observable.

### 8.4 Initial workflows

```text
OpportunityIntakeWorkflow
OpportunityEnrichmentWorkflow
ResearchLoopWorkflow
InterviewPreparationWorkflow
InterviewProcessingWorkflow
AssessmentWorkflow
TermSheetDraftWorkflow
NegotiationWorkflow
ConsentWithdrawalWorkflow
```

### 8.5 Diligence selection

Use a hybrid policy:

1. Mandatory domain checklist
2. Rules for risk, materiality and deadline
3. Agent recommendations for adaptive checks
4. Human assignment for specialist diligence

Value-of-information optimization is a future enhancement, not an MVP dependency.

### 8.6 Failure policy

- Retry transient failures with exponential backoff.
- Use idempotency keys for every external action.
- Preserve partial findings.
- Escalate repeated or material failures.
- Show overdue tasks rather than silently cancelling them.
- Never retry external communications without verifying whether they succeeded.

---

## 9. Thesis and Assessment

### 9.1 Thesis representation

Store the fund thesis as:

- Human-readable Markdown
- Structured JSON policy
- Version identifier

```ts
interface FundThesis {
  sectors: string[];
  stages: string[];
  geographies: string[];
  checkSize: { min: number; max: number; currency: string };
  ownershipTarget?: { min: number; max: number };
  exclusions: string[];
  weightedCriteria: ThesisCriterion[];
  narrative: string;
}
```

### 9.2 Thesis fit

Use:

- Deterministic rules for hard constraints
- Weighted scorecards for explicit quantitative criteria
- Evidence-based model judgments for qualitative criteria
- Independent axis results rather than a single opaque score

### 9.3 Independent axes

Founder, Market and Idea-versus-Market must have:

- Separate schemas
- Separate evidence
- Separate evaluators
- Separate UI panels
- Separate confidence labels

A synthesis agent may summarize them but cannot average them into one hidden score.

### 9.4 Learning

Initially run learned preference models in shadow mode.

Training data includes:

- Human overrides
- Override reasons
- Interview corrections
- Issued and signed term sheets
- Verified later outcomes

Historical decisions are preference signals, not objective ground truth.

### 9.5 Fairness

Run a separate audit pipeline:

- Counterfactual profile tests
- Error and uncertainty comparison
- Public-footprint volume versus evidence quality
- Protected-attribute exclusion where not needed
- Periodic human review

Low confidence always routes to human review.

---

## 10. Interview System

### 10.1 Modality

The primary experience is browser video with ElevenLabs voice interaction.

For the MVP:

- Voice and transcript are active inputs.
- Video is recorded only with separate explicit consent.
- Facial-expression, gaze, deception and vocal-stress inference do not affect recommendations.
- Experimental affective-computing outputs, if demonstrated, are isolated and clearly marked non-decisioning.

There is no reliable basis for treating facial behavior as proof that someone is lying. The product should report observable behavior rather than convert ambiguous signals into character judgments.

### 10.2 Interview plan

Questions come from:

- Reviewed question bank
- Card unknowns
- Card contradictions
- Domain-specific checklist
- Approved adaptive follow-up patterns

Questions should ask for concrete examples and evidence, not reveal desired personality labels.

### 10.3 Live state

Maintain:

```ts
interface LiveInterviewState {
  approvedHypotheses: Hypothesis[];
  askedQuestionIds: string[];
  unresolvedGapIds: string[];
  provisionalFacts: Finding[];
  followUpCandidates: string[];
  escalationState?: string;
}
```

The interview agent receives an approved brief, not unrestricted access to the entire fund workspace.

### 10.4 Card updates

During the call:

- Transcript segments are persisted in real time.
- Candidate facts are extracted asynchronously.
- The UI may show provisional findings.
- Factual statements can be added as low-trust claims with transcript citations.
- Behavioral interpretations require post-call review.
- Material card changes commit after the call or explicit reviewer approval.

### 10.5 Consent

Consent records are versioned by purpose:

- AI interviewer participation
- Audio capture
- Video capture
- Transcription
- Behavioral assessment
- Retention
- Model processing

Provide a human-only alternative where practical.

---

## 11. Terms and Negotiation

### 11.1 Term-sheet model

Use a counsel-approved template with structured slots:

```ts
interface TermSheetModel {
  templateId: string;
  templateVersion: string;
  instrumentType: "safe" | "convertible_note" | "priced_round";
  variables: Record<string, TermValue>;
  clauses: ClauseSelection[];
  calculationRevisionId: string;
  approvalStatus: string;
}
```

Start with one SAFE template and support fund-provided templates through an importer.

### 11.2 Calculations

All financial calculations are deterministic TypeScript functions with:

- Input values
- Formula version
- Formula trace
- Tests
- Result
- Linked card findings

The LLM may explain calculations but cannot produce authoritative numbers.

### 11.3 Rationale

Generate rationale from the calculation trace and linked findings. Each material term shows:

- Inputs
- Formula
- Assumptions
- Evidence
- Reviewer override
- Current approval status

### 11.4 Negotiation policy

Represent preferences using:

- Hard lower and upper bounds
- Non-negotiable clauses
- Ranked issue priorities
- Concession rules
- BATNA
- Optional weighted Nash bargaining recommendation

Formal optimization is advisory. Human-approved bounds are authoritative.

### 11.5 Autonomy

The agent may:

- Explain approved terms
- Communicate unchanged approved offers
- Simulate concessions
- Negotiate within explicitly approved per-term bounds

It must escalate on:

- Out-of-bound requests
- Material clause changes
- New material evidence
- Prompt-injection indications
- Confusion or distress
- Human request
- Low confidence
- Repeated failures

### 11.6 Record

Store an append-only negotiation ledger containing:

- Offers
- Counteroffers
- Changed terms
- Transcript references
- Agent rationale
- Approval checkpoints
- Escalations

Final legal approval and signature remain human-controlled.

---

## 12. Security, Privacy and Access

### 12.1 Authentication and tenancy

Use Clerk for authentication and organization membership. Clerk Organizations supports B2B workspaces, roles and organization context in Next.js. ([clerk.com](https://clerk.com/docs/nextjs/guides/organizations/getting-started?utm_source=openai))

Use:

- Clerk organization as tenant identity
- PostgreSQL `tenant_id` on all records
- PostgreSQL row-level security
- Roles: admin, partner, investor, analyst, counsel, founder, auditor

### 12.2 Data classification

Classify data as:

- Internal
- Fund confidential
- Founder confidential
- PII
- Founder IP
- Interview recording
- Legal
- Restricted assessment

Do not treat every field identically; restricted classes receive tighter retention and access.

### 12.3 Encryption

- TLS in transit
- Cloud-managed encryption at rest
- S3 bucket encryption
- RDS encryption
- Secrets Manager for credentials
- Optional customer-managed keys for enterprise deployments

### 12.4 Prompt injection

All external content is untrusted data.

Controls include:

- Content/instruction separation
- Sanitization
- Tool allowlists
- Destination allowlists
- Least-privilege context packages
- Deterministic tool authorization
- Security classifier as a secondary signal
- Human approval before external side effects

A security agent may detect suspicious content, but it cannot replace deterministic access controls.

### 12.5 Consent withdrawal

The withdrawal workflow:

1. Blocks future use.
2. Identifies affected artifacts and derived findings.
3. Deletes or redacts data where legally required.
4. Marks retained derived findings unusable.
5. Recalculates dependent assessments.
6. Records an audit event.

Retention periods are configurable by artifact type and jurisdiction.

---

## 13. Human Workspace

Use a card-centric dossier with:

- Pipeline navigation
- Prioritized review queue
- Card editor
- Evidence drawer
- Workflow timeline
- Independent assessment panels
- Terms and calculation panel
- Approval controls

Prioritize review by:

1. Materiality
2. Risk
3. Deadline
4. Confidence
5. Expected effort

Explicit approval is required for:

- Founder-facing interviews
- Recording
- Reference calls
- Material recommendations
- Draft terms
- Offers and concessions
- Legal output
- Destructive privacy operations

Human and model positions remain side by side. Overrides require structured reasons.

---

## 14. Observability and Evaluation

### 14.1 Telemetry

Use:

- OpenTelemetry
- Sentry for application errors
- OpenAI agent tracing
- Temporal workflow visibility
- Structured audit events
- A separate quality-analysis pipeline

Capture:

- Request and workflow IDs
- Agent and model configuration
- Prompt version
- Tool calls
- Token and provider cost
- Card revisions
- Human approvals
- Source-to-term lineage

### 14.2 Quality gates

Maintain golden datasets for:

- Deck extraction
- Claim grounding
- Contradiction detection
- Interview question relevance
- Card mutation
- Calculation correctness
- Prompt injection
- Consent handling

Use model graders only as supplementary evaluators calibrated against humans.

### 14.3 Shadow mode

Recommendations, personality assessments, legal checks and learned preference models begin in shadow mode.

Automation expands only when evaluation demonstrates:

- Stable citation quality
- Acceptable material-field accuracy
- Low unsupported-claim rate
- Predictable escalation
- No meaningful fairness regression

A nominal “99% accuracy” target is insufficient without task definitions, representative datasets and error-cost analysis.

---

## 15. Reliability and Cost

Initial objectives:

- Card and search reads: p95 under 500 ms
- User commands acknowledged: p95 under 1 second
- Workflow progress visible within 2 seconds
- Voice response latency monitored separately
- End-to-end opportunity report target: 24 hours
- No loss of committed card revisions
- All external side effects idempotent

Use soft per-opportunity budgets and flag overruns. Do not terminate material diligence silently. Prefer visible incomplete results with explicit gaps.

---

## 16. Repository Layout

```text
/apps
  /web
  /worker

/packages
  /agents
  /artifacts
  /auth
  /card
  /calculations
  /connectors
  /database
  /documents
  /evidence
  /interview
  /model-gateway
  /negotiation
  /notifications
  /schemas
  /security
  /telemetry
  /thesis
  /tools
  /ui
  /workflows

/prompts
  /sourcing
  /research
  /diligence
  /interview
  /assessment
  /terms
  /negotiation

/schemas
  /cards
  /events
  /tools

/evals
  /datasets
  /graders
  /scenarios

AGENTS.md
```

`AGENTS.md` defines development, testing, migration and deployment rules for coding agents. It supplements rather than replaces automated tests and CI controls.

---

## 17. Build Versus Buy

### Build as core IP

- Opportunity Card model and Card Writer
- Thesis representation and evaluation
- Independent assessment axes
- Research prioritization
- Privacy-preserving diligence decomposition
- Interview hypothesis generation
- Evidence-linked term rationale
- Negotiation policy and authority controls
- Human correction and learning loop

### Integrate

- Authentication
- Cloud infrastructure
- OCR
- LLM inference
- Voice and telephony
- Email and notifications
- Public and commercial data
- E-signature
- Cap-table systems
- Legal templates
- Observability

Every strategic or high-spend provider sits behind an internal adapter. Card, evidence and calculation exports use open formats.

---

## 18. Acceptance Scenario

The first release is accepted when a real consenting or curated synthetic startup can complete this flow:

1. Submit a pitch deck and intake form.
2. Create a schema-valid Markdown card.
3. Preserve the original deck and source metadata.
4. Extract founders, company and core claims.
5. Run selected public research.
6. Surface at least one unknown or contradiction.
7. Produce separate Founder, Market and Idea-versus-Market assessments.
8. Generate card-specific interview questions.
9. Complete or replay a voice interview.
10. Link transcript evidence to card findings.
11. Record human corrections and approvals.
12. Generate a deterministic term calculation.
13. Produce an annotated draft term sheet.
14. Prevent an out-of-bounds negotiation action.
15. Export the card, artifacts manifest, calculations and audit history.

Deliberately test malformed documents, conflicting facts, prompt injection, model outage, voice failure, consent withdrawal and stale card updates.

---

## 19. Deferred Capabilities

Do not make these production dependencies for the first release:

- Kubernetes
- Kafka
- GraphQL
- Neo4j
- Event sourcing
- CRDT editing
- Cross-fund learning
- Autonomous legal approval
- Autonomous investment decisions
- Unbounded negotiation
- Learned founder-success scoring
- Facial-expression or deception-based decisioning
- Custom-trained confidence models
- Broad browser scraping

The architecture leaves migration paths for these capabilities without paying their complexity cost before product validation.

## References

1. [Temporal Docs | Temporal Platform Documentation](https://docs.temporal.io/?utm_source=openai)
2. [Next.js Docs: App Router | Next.js](https://nextjs.org/docs/app?utm_source=openai)
3. [Introduction - shadcn/ui](https://ui.shadcn.com/docs?utm_source=openai)
4. [ProseMirror | Tiptap Editor Docs](https://tiptap.dev/docs/editor/core-concepts/prosemirror?utm_source=openai)
5. [OpenAI Agents SDK TypeScript | OpenAI Agents SDK](https://openai.github.io/openai-agents-js/?utm_source=openai)
6. [ElevenLabs Conversational AI now supports WebRTC](https://elevenlabs.io/blog/conversational-ai-webrtc?utm_source=openai)
7. [OCR Processor | Mistral Docs](https://docs.mistral.ai/studio-api/document-processing/basic_ocr?utm_source=openai)
8. [Collaboration extension | Tiptap Editor Docs](https://tiptap.dev/docs/editor/extensions/functionality/collaboration?utm_source=openai)
9. [PostgreSQL: Documentation: 18: 5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html?utm_source=openai)
10. [GitHub - pgvector/pgvector: Open-source vector similarity search for Postgres · GitHub](https://github.com/pgvector/pgvector?utm_source=openai)
11. [Get started with Organizations - Organization management - Next.js | Clerk Docs](https://clerk.com/docs/nextjs/guides/organizations/getting-started?utm_source=openai)
