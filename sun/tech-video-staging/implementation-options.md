# Implementation Options

This document is a decision inventory for implementing the Opportunity
Intelligence and Negotiation System. It deliberately makes no selections.
Each item states a design question and lists credible options with a short
reason to favor each. The options are not always mutually exclusive; hybrid
approaches are valid and introduce their own tradeoffs.

The central constraint is that the **Opportunity Card is the canonical, living
record of one team pursuing one company or idea**. Any implementation must
preserve human readability, machine queryability, source provenance, explicit
unknowns, contradictions, independent assessment axes, and human authority.

## 1. Product Boundary and Delivery Strategy

### 1.1 What should the first implementation prove?

- **A narrow vertical slice:** Ingest one deck, research a few claims, conduct
  one interview, update one Opportunity Card, and generate an annotated term
  sheet. Favor this to validate the distinctive closed loop quickly.
- **A broad workflow prototype:** Demonstrate sourcing, research, interview,
  diligence, reporting, and negotiation with shallow implementations. Favor
  this when stakeholder understanding of the end-to-end vision is the primary
  goal.
- **The evidence and card platform first:** Build ingestion, identity,
  provenance, and card APIs before rich agent behavior. Favor this when durable
  data foundations and later extensibility matter more than demo breadth.
- **The live interview experience first:** Center the implementation on an
  adaptive voice session backed by a lightweight card. Favor this when the
  live vibe check is the main product-risk or demonstration risk.
- **The annotated term-sheet experience first:** Center the implementation on
  traceable calculations and reviewer interaction. Favor this when auditability
  and decision support are the strongest differentiators.

### 1.2 Who is the first operating user?

- **A single investment partner:** Favor this for minimal permissions,
  workflow, and preference-model complexity.
- **A small VC deal team:** Favor this to validate collaboration, assignment,
  review, and approval workflows.
- **An accelerator or selection committee:** Favor this for higher-volume,
  more standardized evaluation and clearer comparative testing.
- **A founder-facing self-service workflow:** Favor this to optimize consent,
  correction, transparency, and low-friction intake from the outset.
- **An internal hackathon operator:** Favor this when controlled inputs and a
  scripted path are acceptable for proving technical feasibility.

### 1.3 What is inside the product boundary?

- **Decision support only:** Stop at a recommendation and draft terms. Favor
  this for lower legal, fiduciary, and autonomy risk.
- **Decision support plus automated evidence gathering:** Let agents research,
  interview, and call references, but retain human decisions. Favor this to
  demonstrate time compression while preserving authority.
- **Decision support plus constrained negotiation:** Allow approved ranges and
  clauses to be negotiated automatically. Favor this to test the full thesis
  while bounding agent authority.
- **Workflow orchestration around existing tools:** Integrate CRM, document,
  voice, and legal products rather than replacing them. Favor this when speed
  and operational adoption matter more than owning every interface.
- **An end-to-end system of record:** Own intake through outcome and learning.
  Favor this when control of data quality and feedback loops is strategic.

### 1.4 How should capability be released?

- **One production-shaped vertical slice:** Favor this to expose real
  integration, security, and observability issues early.
- **Independent staged modules:** Deliver card, research, interview, and terms
  separately. Favor this for parallel work and replaceable components.
- **Human-operated concierge behind the UI:** Favor this to validate user value
  before automating expensive or uncertain steps.
- **Feature flags by capability and tenant:** Favor this for controlled rollout
  of higher-risk research, calling, and negotiation behavior.

## 2. System Shape and Service Boundaries

### 2.1 What application architecture should be used?

- **Modular monolith:** One deployable with strict internal modules for cards,
  evidence, workflows, interviews, and terms. Favor this for transactional
  simplicity, fast iteration, and a small team.
- **Microservices:** Separate deployables around bounded contexts. Favor this
  for independent scaling, fault isolation, and team ownership.
- **Serverless functions and managed workflows:** Event-triggered functions for
  ingestion and agent tasks. Favor this for bursty workloads and low operations
  overhead.
- **Hybrid:** Keep the core API and card transaction boundary together while
  isolating long-running or compute-heavy workers. Favor this when consistency
  and independent scaling are both important.

### 2.2 Where should domain boundaries be drawn?

- **By workflow stage:** Intake, research, interview, diligence, decision, and
  negotiation. Favor this when stage ownership and operational visibility are
  dominant.
- **By domain object:** Identity, Opportunity Card, evidence, assessment,
  communications, and terms. Favor this for stable business boundaries despite
  workflow changes.
- **By technical capability:** Connectors, LLM gateway, retrieval, voice,
  calculation, and UI. Favor this for specialist engineering ownership and
  reusable platform components.
- **By risk boundary:** Public research, confidential diligence, PII, calling,
  and legal drafting. Favor this when least privilege and compliance isolation
  drive the architecture.

### 2.3 How should components communicate?

- **Synchronous REST APIs:** Favor this for simple contracts, broad tooling,
  and request-response user interactions.
- **GraphQL:** Favor this when the workspace needs flexible reads across highly
  connected card, founder, evidence, and source data.
- **gRPC:** Favor this for typed internal contracts and efficient service-to-
  service communication.
- **Asynchronous events:** Use a broker such as Kafka, Redpanda, NATS, SNS/SQS,
  or Pub/Sub. Favor this for long-running work, fan-out, replay, and loose
  coupling.
- **A synchronous core plus asynchronous jobs:** Favor this when card commands
  need immediate acknowledgement but enrichment can complete later.

### 2.4 How should shared contracts be governed?

- **OpenAPI and JSON Schema:** Favor this for language-neutral API and data
  validation with generated clients.
- **Protocol Buffers:** Favor this for strict schemas, compatibility rules, and
  efficient internal messages.
- **Language-native shared types:** Favor this for speed in a single-language
  monorepo.
- **A schema registry with compatibility checks:** Favor this when events and
  independently deployed consumers must evolve safely.

### 2.5 Where should the system run?

- **A single cloud provider:** AWS, Azure, or GCP. Favor this for integrated
  identity, storage, queues, AI services, and simpler operations.
- **A portable container platform:** Kubernetes or managed containers. Favor
  this for provider flexibility and controlled networking.
- **A managed application platform:** Vercel, Render, Fly.io, Railway, or Cloud
  Run. Favor this for rapid delivery with limited infrastructure work.
- **Self-hosted or private-cloud deployment:** Favor this for sensitive fund,
  founder, call, and legal data.
- **Hybrid cloud:** Keep sensitive records private while using managed models
  and communication services through controlled gateways. Favor this to
  balance data control with specialized integrations.

## 3. Opportunity Card Ownership and Representation

### 3.1 What is the authoritative representation of an Opportunity Card?

- **Markdown with YAML front matter:** Favor this for human readability, Git
  compatibility, agent editing, and transparent demos.
- **A relational model rendered to Markdown:** Favor this for strong querying,
  constraints, transactions, and a readable generated artifact.
- **Structured JSON or document records rendered to Markdown:** Favor this for
  flexible nested data and schema validation while retaining a readable view.
- **A graph model rendered to Markdown:** Favor this when claims, people,
  sources, contradictions, and time are fundamentally graph-shaped.
- **Dual authoritative forms with reconciliation:** Favor this only when human
  file workflows and transactional APIs are equally mandatory and conflict
  handling can be explicitly designed.

### 3.2 How should the card be decomposed in storage?

- **One aggregate document per opportunity:** Favor this for atomic snapshots,
  portability, and simple context assembly.
- **Normalized entities with a composed card view:** Separate opportunities,
  founders, companies, claims, sources, assessments, interviews, and terms.
  Favor this to avoid duplication and support cross-opportunity analysis.
- **A card aggregate plus linked shared entities:** Keep opportunity-specific
  state together and link persistent founder, thesis, and source records.
  Favor this to preserve the card boundary without duplicating durable memory.
- **Event stream plus projections:** Store card changes as events and build
  current and historical views. Favor this for auditability and temporal
  reconstruction.

### 3.3 How should semi-structured sections be modeled?

- **Fully typed fields:** Give every section a defined schema. Favor this for
  validation, analytics, deterministic UI, and reliable automation.
- **Typed core plus free-form Markdown extensions:** Favor this when canonical
  status, evidence, and decisions need structure but novel diligence findings
  must remain flexible.
- **Schema-less blocks with block types:** Store ordered blocks such as prose,
  table, claim list, and calculation. Favor this for flexible composition and
  rich editing.
- **Free-form Markdown parsed by convention:** Favor this for implementation
  speed and agent friendliness when strict downstream automation is limited.

### 3.4 How should card schemas be defined and evolved?

- **JSON Schema with `schema_version`:** Favor this for explicit validation,
  generated forms, and language independence.
- **Code-first schemas:** Zod, Pydantic, TypeBox, or equivalent. Favor this for
  developer ergonomics and shared runtime/static validation.
- **Database-first migrations:** Favor this when the relational store is the
  primary contract and transactional integrity is central.
- **Versioned templates with migration functions:** Favor this for preserving
  readable files while making upgrades explicit.
- **Read-old/write-new compatibility:** Favor this to migrate cards lazily and
  avoid blocking deployments on bulk conversion.

### 3.5 What must be a first-class typed field?

- **Only workflow metadata:** ID, company, status, channels, timestamps,
  deadline, founder IDs, and thesis ID. Favor this for a minimal stable schema.
- **Workflow metadata plus assessments and recommendation:** Favor this for
  dashboards, triage, and consistent human review.
- **All claims, gaps, sources, trust states, and term annotations:** Favor this
  for provenance queries, automated checks, and auditability.
- **Every visible card element:** Favor this for deterministic interfaces and
  analytics, accepting higher migration and authoring cost.

### 3.6 How should stable identifiers be generated?

- **Human-readable sequence IDs such as `OPP-2026-0001`:** Favor this for
  support, communication, and readable artifacts.
- **UUID/ULID identifiers:** Favor this for distributed creation, uniqueness,
  and sortable IDs with ULID.
- **Database integer keys plus public IDs:** Favor this for efficient joins and
  user-safe external references.
- **Content-derived IDs for sources or evidence spans:** Favor this for
  deduplication and immutable artifact identity.

### 3.7 How should concurrent card updates be handled?

- **Pessimistic locking:** One writer or leased workflow owns the card. Favor
  this for simple conflict prevention during critical transitions.
- **Optimistic concurrency with version checks:** Favor this for interactive
  collaboration and explicit retry or merge behavior.
- **Section-level ownership and locks:** Favor this when research agents can
  update independent card areas in parallel.
- **Append-only patches merged by a coordinator:** Favor this for agent fan-out,
  traceability, and centralized conflict resolution.
- **CRDT-backed collaborative editing:** Favor this for real-time multi-user
  text editing, accepting greater implementation complexity.

### 3.8 How should card changes be represented?

- **Whole-document replacement:** Favor this for simple storage and snapshots.
- **JSON Patch or typed domain commands:** Favor this for validation, smaller
  writes, and precise authorization.
- **Section-level revisions:** Favor this for readable review and lower merge
  collision rates.
- **Immutable events such as `ClaimAdded` and `AssessmentRevised`:** Favor this
  for a complete audit trail and temporal projections.
- **Git commits:** Favor this when file-native review, diffing, and rollback are
  primary and update volume is modest.

### 3.9 How should agent-proposed updates reach the card?

- **Direct validated writes:** Favor this for low latency and simple workflows
  when agent permissions are narrow.
- **Proposed patches requiring human approval:** Favor this for sensitive
  conclusions and high trust requirements.
- **A card-writer service:** Agents emit structured findings and one service
  validates, deduplicates, and commits them. Favor this for consistent policy.
- **Confidence- or risk-based approval:** Auto-apply low-risk facts and queue
  material recommendations or terms. Favor this to balance speed and control.

### 3.10 How should human edits interact with generated content?

- **Humans edit the canonical card directly:** Favor this for transparency and
  minimal interface layers.
- **Humans edit structured forms that regenerate the card:** Favor this for
  validation and safer updates.
- **Human overrides are separate immutable annotations:** Favor this to retain
  both model output and reviewer judgment.
- **Field-level ownership and provenance:** Mark each value as extracted,
  inferred, calculated, or human-authored. Favor this for precise accountability.

### 3.11 How should the card expose history?

- **Latest state plus an audit log:** Favor this for a simple primary read and
  sufficient accountability.
- **Full temporal tables:** Favor this for point-in-time queries and efficient
  history without event sourcing the entire domain.
- **Event sourcing:** Favor this for exact reconstruction and learning from
  decision trajectories.
- **Versioned Markdown snapshots:** Favor this for human-readable comparisons
  and demo simplicity.

### 3.12 How should cross-card founder memory be linked?

- **Reference a persistent founder entity and snapshot key fields in the card:**
  Favor this to preserve historical decision context while sharing identity.
- **Resolve founder data dynamically at read time:** Favor this to always show
  current knowledge and minimize duplication.
- **Copy founder data into each card:** Favor this for self-contained artifacts
  and easier export, accepting divergence.
- **Use temporal links to dated founder-profile versions:** Favor this for exact
  reproducibility of what was known at decision time.

### 3.13 How should card integrity be checked?

- **Schema validation only:** Favor this for fast deterministic checks.
- **Domain invariants:** Require cited material claims, legal status transitions,
  explicit unknowns, and independent assessment axes. Favor this for semantic
  reliability.
- **A policy engine such as OPA or Cedar:** Favor this for centralized,
  inspectable rules across APIs and workflows.
- **A validation agent plus deterministic checks:** Favor this to catch prose-
  level inconsistencies while retaining hard guarantees for critical rules.

### 3.14 How should cards be exported and imported?

- **Portable Markdown bundles with linked artifacts:** Favor this for human
  access, longevity, and vendor independence.
- **JSON packages conforming to a public schema:** Favor this for integrations
  and lossless machine transfer.
- **PDF reports:** Favor this for review and distribution, but not round-trip
  editing.
- **Data-room packages:** Include card, sources, transcripts, calculations, and
  manifests. Favor this for diligence handoff and audit completeness.

## 4. Claims, Evidence, Provenance, and Trust

### 4.1 What is the atomic evidence model?

- **Claim records linked to source records:** Favor this for simple traceability
  matching the card format.
- **Claim-source-evidence-span triples:** Favor this when precise quotations,
  pages, timestamps, or table cells must support each assertion.
- **A property graph of assertions and support relations:** Favor this for
  corroboration, contradiction, and multi-hop reasoning.
- **W3C PROV or another provenance standard:** Favor this for interoperable,
  formal lineage across generated artifacts.

### 4.2 What evidence states should exist?

- **Claimed, verified, contradicted, and unknown:** Favor this for a compact,
  legible decision vocabulary.
- **A richer lifecycle:** Extracted, unverified, partially supported,
  corroborated, disputed, superseded, stale, and retracted. Favor this for
  operational precision.
- **Support and contradiction as separate edges:** Favor this when one claim can
  have mixed evidence rather than one collapsed state.
- **Probabilistic belief values:** Favor this when uncertainty must be combined
  mathematically, accepting explainability and calibration burden.

### 4.3 How should trust be represented?

- **Low/medium/high labels:** Favor this for human comprehension and avoiding
  false numerical precision.
- **A 0-1 or 0-100 score:** Favor this for ranking, thresholds, and calibration
  analysis.
- **An interval or probability distribution:** Favor this for sparse evidence
  and explicit uncertainty.
- **A multidimensional vector:** Track source reliability, corroboration,
  recency, extraction confidence, and contradiction separately. Favor this for
  inspectability.
- **Labels in the UI backed by a richer internal model:** Favor this to combine
  usability with analytical depth.

### 4.4 How should trust values be produced?

- **Deterministic policy rules:** Favor this for reproducibility and easy audit.
- **LLM judgment with cited evidence:** Favor this for nuanced heterogeneous
  sources and rapid development.
- **A trained calibration model:** Favor this when enough verified historical
  outcomes exist.
- **Human-assigned trust:** Favor this for material claims with low volume.
- **A hybrid pipeline:** Calculate objective factors and allow bounded model or
  human adjustments. Favor this for transparent inputs plus contextual judgment.

### 4.5 How should contradictions be modeled?

- **A special claim state:** Favor this for simple card presentation.
- **Explicit contradiction entities linking incompatible claims:** Favor this
  for preserving both statements, sources, and resolution history.
- **Constraint violations on normalized facts:** Favor this for quantitative
  conflicts such as ARR, dates, or ownership totals.
- **Natural-language contradiction detection followed by review:** Favor this
  for broad coverage across unstructured documents.

### 4.6 How should unknowns and gaps be represented?

- **Gap records alongside claims:** Favor this for explicit next actions and
  card readability.
- **Missing required fields generated from stage-specific schemas:** Favor this
  for systematic completeness checks.
- **Decision-impact hypotheses with value-of-information estimates:** Favor
  this to prioritize only uncertainty likely to change a decision.
- **Task objects linked to gaps:** Favor this when every important unknown needs
  an owner, action, deadline, and completion result.

### 4.7 How should evidence spans be anchored?

- **Page and bounding-box coordinates for documents:** Favor this for precise
  visual citation.
- **Character offsets in normalized text:** Favor this for fast retrieval and
  deterministic highlighting.
- **Transcript timestamps and speaker turns:** Favor this for audio/video review.
- **Content hashes plus selectors:** Favor this when source versions may change
  and anchors must detect drift.
- **Quoted excerpts:** Favor this for portability, while accounting for
  copyright, privacy, and context loss.

### 4.8 How should source artifacts be preserved?

- **Store originals in object storage:** Favor this for auditability and
  reprocessing with improved extractors.
- **Store normalized text and metadata only:** Favor this for lower cost and
  reduced sensitive-data exposure.
- **Store pointers to external systems:** Favor this when a CRM, data room, or
  document provider remains authoritative.
- **Tier storage by source sensitivity and retention policy:** Favor this for
  balancing reproducibility, cost, and compliance.

### 4.9 How should freshness and supersession work?

- **Fixed expiry by evidence type:** Favor this for simple stale-data handling.
- **Source-specific decay functions:** Favor this because employment, traction,
  identity, and publications age differently.
- **Event-driven invalidation:** Reassess dependent claims when new evidence
  arrives. Favor this for responsive consistency.
- **No automatic decay; display observation dates:** Favor this when humans
  should interpret age and automation could erase durable history.

### 4.10 How should provenance be shown to users?

- **Inline card citations:** Favor this for immediate readability.
- **Expandable evidence drawers:** Favor this for detailed source spans without
  overcrowding the card.
- **A claim graph view:** Favor this for complex corroboration and contradiction.
- **A generated audit report:** Favor this for compliance, committee review,
  and external sharing.

## 5. Persistence, Indexing, and Retrieval

### 5.1 What primary operational database should be used?

- **PostgreSQL:** Favor this for transactions, JSONB flexibility, full-text
  search, mature tooling, and extensions such as pgvector.
- **A document database such as MongoDB or Firestore:** Favor this for card-
  shaped documents, flexible schemas, and managed scaling.
- **A graph database such as Neo4j, Neptune, or Memgraph:** Favor this for
  identity, provenance, relationships, and temporal evidence traversal.
- **An event store such as EventStoreDB:** Favor this when immutable history and
  projections are the primary model.
- **Polyglot persistence:** Favor this when transactional cards, graph queries,
  search, and artifacts have materially different requirements.

### 5.2 Where should vector embeddings live?

- **PostgreSQL with pgvector:** Favor this for one operational system and modest
  scale.
- **A dedicated vector database such as Pinecone, Weaviate, Qdrant, or Milvus:**
  Favor this for high-scale semantic retrieval and specialized filtering.
- **A search engine with vector support:** OpenSearch or Elasticsearch. Favor
  this for combined lexical, faceted, and semantic retrieval.
- **No persistent vector store for the MVP:** Favor this when cards and source
  sets are small enough for direct context assembly.

### 5.3 What search experience is required?

- **Database filters and full-text search:** Favor this for simple operational
  discovery and fewer systems.
- **Dedicated lexical and faceted search:** Favor this for fast filtering by
  stage, thesis, founder, claim state, deadline, and confidence.
- **Hybrid lexical-vector search:** Favor this for finding semantically similar
  companies, claims, and historical decisions without losing exact matches.
- **Graph traversal plus search:** Favor this for relationship-heavy questions
  such as shared founders, sources, references, and comparable opportunities.

### 5.4 How should retrieval context be assembled for models?

- **Render the whole card:** Favor this for small cards and coherent global
  context.
- **Retrieve relevant card sections and evidence spans:** Favor this for token
  efficiency and source grounding.
- **Build task-specific context packages:** Favor this when interview,
  technical diligence, and negotiation require different least-privilege views.
- **Use a graph-based context expansion:** Favor this for multi-hop evidence and
  persistent founder history.
- **Maintain model-ready summaries with links to raw evidence:** Favor this for
  latency and cost, accepting summary-staleness risk.

### 5.5 How should analytical data be separated from operations?

- **Query the operational store directly:** Favor this for an MVP and low data
  volume.
- **Replicate into a warehouse such as BigQuery, Snowflake, or Redshift:** Favor
  this for outcome analysis, calibration, and BI at scale.
- **Use a lakehouse with Parquet and DuckDB, Athena, or Databricks:** Favor this
  for flexible artifact-level analysis and model training.
- **Stream domain events into analytical projections:** Favor this for near-real-
  time metrics without loading the transactional database.

### 5.6 How should caches be used?

- **No shared cache initially:** Favor this for correctness and operational
  simplicity.
- **Redis for sessions, rate limits, locks, and computed views:** Favor this for
  low-latency coordination.
- **Content-addressed caching of model and extraction results:** Favor this to
  control repeated AI cost and make reruns reproducible.
- **Edge caching for read-only reports:** Favor this for external review links
  with carefully scoped access.

## 6. Intake, Documents, and External Data

### 6.1 Which intake channels should be built first?

- **Web upload and short form:** Favor this for controlled structured intake.
- **Dedicated email inbox:** Favor this to meet founders in an existing workflow.
- **CRM integration:** Salesforce, Affinity, HubSpot, or Attio. Favor this when
  the fund already has a deal-flow system of record.
- **Cloud-drive or data-room import:** Favor this for document-heavy diligence.
- **Outbound discovery connectors:** Favor this when proactive sourcing is part
  of the first proof rather than a later expansion.

### 6.2 How should document parsing be implemented?

- **Managed document AI:** AWS Textract, Azure AI Document Intelligence, Google
  Document AI, or Unstructured API. Favor this for rapid support of PDFs,
  tables, and OCR.
- **Open-source parsing:** Unstructured, Apache Tika, PyMuPDF, pdfplumber, or
  Docling. Favor this for control, privacy, and lower marginal cost.
- **Multimodal model extraction directly from pages:** Favor this for complex
  slide layouts and charts.
- **A layered parser with deterministic extraction before model fallback:**
  Favor this for cost, reliability, and source anchoring.

### 6.3 How should extracted data be accepted?

- **Write extracted facts directly as low-trust claims:** Favor this for speed
  while preserving uncertainty.
- **Require cross-source corroboration:** Favor this for higher precision before
  claims affect assessments.
- **Require founder confirmation:** Favor this for sensitive or ambiguous facts.
- **Require human review of material fields only:** Favor this to focus scarce
  attention on decision-changing information.

### 6.4 Which public-data integrations should be used?

- **Direct official APIs:** GitHub, Crossref, OpenAlex, patents, company
  registries, and regulatory filings. Favor this for provenance and stable terms.
- **Commercial data providers:** Harmonic, PitchBook, Crunchbase, Dealroom, or
  People Data Labs. Favor this for breadth, normalization, and faster coverage.
- **Search and browsing APIs:** Bing, Google, Brave, Tavily, or Exa. Favor this
  for flexible discovery of current evidence.
- **Browser automation:** Playwright-based agents. Favor this when critical
  sources lack APIs, accepting fragility and terms-of-service risk.
- **Founder-provided evidence only:** Favor this for a constrained MVP and lower
  privacy or scraping risk.

### 6.5 How should connector ownership be handled?

- **Build connectors in-house:** Favor this for exact provenance, permissions,
  and product-specific behavior.
- **Use an integration platform:** Airbyte, Nango, Merge, or Workato. Favor this
  for faster breadth and managed authentication.
- **Use MCP servers or tool adapters:** Favor this for agent-friendly access and
  replaceable tool contracts.
- **Hybrid ownership:** Build strategic or sensitive connectors and integrate
  commodity sources. Favor this to concentrate engineering effort.

### 6.6 How should entity resolution work?

- **Deterministic matching:** Emails, domains, registry IDs, and normalized
  names. Favor this for explainable high-precision merges.
- **Probabilistic matching:** Combine names, employment, geography, and links.
  Favor this for broader recall across incomplete public data.
- **Embedding or LLM-assisted matching:** Favor this for ambiguous biographies
  and company descriptions.
- **Human merge queue:** Favor this where incorrect founder merges create
  lasting fairness and privacy harm.
- **A staged hybrid:** Auto-merge high-confidence identities and review the
  ambiguous remainder. Favor this for scale with safeguards.

### 6.7 How should raw inbound files be secured?

- **Tenant-specific object storage prefixes and keys:** Favor this for managed
  isolation and scalable artifacts.
- **Per-opportunity encrypted data rooms:** Favor this for tighter sharing and
  diligence access control.
- **External storage references with short-lived access:** Favor this when files
  must remain in the fund's existing systems.
- **Client-side encryption before upload:** Favor this for stronger provider-
  blind confidentiality, accepting more complex processing.

## 7. Agent and Workflow Orchestration

### 7.1 What orchestrates long-running workflows?

- **Application jobs with a queue:** Celery, BullMQ, Sidekiq, or similar. Favor
  this for familiar implementation and moderate workflow complexity.
- **A durable workflow engine:** Temporal, AWS Step Functions, Azure Durable
  Functions, or Google Workflows. Favor this for retries, timers, approvals,
  resumability, and 24-hour deadlines.
- **An agent graph framework:** LangGraph, Semantic Kernel, AutoGen, or CrewAI.
  Favor this for explicit multi-agent state and iterative reasoning paths.
- **A custom state machine:** Favor this when domain transitions and audit rules
  are specific enough to justify direct control.
- **A hybrid workflow engine plus agent runtime:** Favor this to separate durable
  business process from nondeterministic model reasoning.

### 7.2 How many agents should exist?

- **One general agent with tools:** Favor this for a small implementation and
  simpler evaluation.
- **Stage-specific agents:** Intake, research, interview, diligence, and terms.
  Favor this for clear prompts and workflow ownership.
- **Domain-specialist agents:** Founder, market, technical, legal, references,
  and negotiation. Favor this for scoped context and specialist evaluation.
- **Dynamic agents generated per hypothesis:** Favor this for value-of-
  information-driven investigation and flexible decomposition.

### 7.3 How should agents coordinate?

- **A central supervisor:** Favor this for policy enforcement, prioritization,
  and coherent card updates.
- **A deterministic workflow graph:** Favor this for reproducibility and easier
  failure handling.
- **A shared task board backed by card gaps:** Favor this for asynchronous,
  loosely coupled specialists.
- **Peer-to-peer delegation:** Favor this for flexible exploration, accepting
  harder control and observability.

### 7.4 What is an agent's unit of work?

- **A workflow stage:** Favor this for operational reporting.
- **One claim or gap:** Favor this for narrow context, parallelism, and precise
  provenance.
- **One source artifact:** Favor this for efficient parsing and extraction.
- **One decision hypothesis:** Favor this for investigation tied directly to
  decision impact.
- **A bounded time or cost budget:** Favor this when a 24-hour SLA and spend
  limits are primary constraints.

### 7.5 How should the next diligence action be chosen?

- **Fixed checklists by stage and sector:** Favor this for predictability and
  completeness.
- **Rule-based prioritization:** Favor this for explainable deadline, risk, and
  materiality handling.
- **LLM planning:** Favor this for adaptive investigation across varied deals.
- **Value-of-information optimization:** Favor this to choose the action most
  likely to change the decision per unit of time or cost.
- **Human assignment:** Favor this when investment judgment should drive the
  research agenda.

### 7.6 How should agent tools be exposed?

- **Provider-native function calling:** Favor this for low integration overhead.
- **An internal typed tool registry:** Favor this for provider independence,
  policy checks, and consistent telemetry.
- **Model Context Protocol servers:** Favor this for standardized, reusable tool
  integrations.
- **Sandboxed code execution:** Favor this for calculations and data analysis,
  with strict network, file, and resource controls.

### 7.7 How should failures and retries work?

- **Automatic exponential retries:** Favor this for transient provider errors.
- **Idempotent activity retries through a workflow engine:** Favor this for
  durable long-running operations.
- **Fallback providers or models:** Favor this for resilience against outages
  and quotas.
- **Human exception queue:** Favor this for ambiguous failures, consent issues,
  and material data conflicts.
- **Partial completion recorded in the card:** Favor this so failed workflows do
  not erase useful evidence or disguise gaps.

### 7.8 How should deadlines and budgets be enforced?

- **Per-workflow wall-clock deadlines:** Favor this for the 24-hour promise.
- **Per-opportunity token, API, and call budgets:** Favor this for predictable
  unit economics.
- **Priority queues based on decision impact and deadline:** Favor this for
  portfolio-wide resource allocation.
- **Graceful degradation plans:** Skip lower-value research and expose remaining
  gaps. Favor this when a timely incomplete answer is better than a late one.

### 7.9 How should nondeterministic outputs be made reproducible?

- **Store prompts, model IDs, parameters, tool calls, and outputs:** Favor this
  for audit and debugging.
- **Cache by normalized input and prompt version:** Favor this for repeatable
  reruns and cost control.
- **Use constrained structured output and low temperature:** Favor this for
  stable extraction and card mutations.
- **Snapshot complete context packages:** Favor this to reproduce what the model
  knew at a particular decision point.

## 8. Model, Prompt, and AI Platform Choices

### 8.1 Which model-provider strategy should be used?

- **One frontier provider:** Favor this for implementation speed and consistent
  behavior.
- **Route among multiple hosted providers:** Favor this for capability, cost,
  latency, residency, and outage flexibility.
- **Cloud-hosted enterprise models through Azure, Bedrock, or Vertex AI:** Favor
  this for enterprise controls and integrated governance.
- **Self-hosted open-weight models:** Favor this for data control, predictable
  marginal cost, and custom tuning.
- **A mixed strategy:** Use frontier models for complex reasoning and smaller
  models for extraction, classification, and redaction. Favor this for cost and
  risk optimization.

### 8.2 How should models be assigned to tasks?

- **One model for all tasks:** Favor this for simplicity and fewer evaluation
  combinations.
- **Static task-to-model mapping:** Favor this for predictable quality and cost.
- **A policy router based on complexity and sensitivity:** Favor this for
  adaptive efficiency.
- **Escalation from small to large models on low confidence:** Favor this to
  reserve expensive reasoning for hard cases.

### 8.3 How should prompts be managed?

- **Prompts in application code:** Favor this for direct versioning and simple
  deployment coupling.
- **Versioned prompt files:** Favor this for reviewable changes and reusable
  templates.
- **A prompt-management platform such as LangSmith, Braintrust, or Humanloop:**
  Favor this for experiments, traces, datasets, and non-code iteration.
- **Data-driven prompt records with approval:** Favor this for tenant-specific
  behavior and runtime rollout controls.

### 8.4 How should structured output be enforced?

- **Provider-native JSON schemas or tool calls:** Favor this for reliable typed
  outputs.
- **Parser validation with repair retries:** Favor this for provider portability.
- **Grammar-constrained decoding:** Favor this for strict local or open-model
  generation.
- **Free-form output interpreted by a second model:** Favor this for flexibility,
  accepting extra cost and compounded error risk.

### 8.5 How should model grounding be implemented?

- **Prompt-only instructions and citations:** Favor this for a simple MVP.
- **Retrieval-augmented generation over approved evidence:** Favor this for
  scalable source grounding.
- **Tool-first fact retrieval with no unsupported factual output:** Favor this
  for stronger evidence constraints.
- **Post-generation citation verification:** Favor this to detect unsupported or
  mismatched claims before card updates.
- **Generate only structured claims, then render prose deterministically:** Favor
  this for maximum traceability.

### 8.6 Where should deterministic logic replace model reasoning?

- **Only financial calculations:** Favor this as the minimum safety boundary.
- **Calculations, status transitions, trust aggregation, and permissions:** Favor
  this for reproducible material behavior.
- **All extraction and scoring rules where possible:** Favor this for auditability,
  using models only for ambiguous language tasks.
- **Models propose; deterministic validators accept or reject:** Favor this for
  flexible reasoning with hard constraints.

### 8.7 Should models be fine-tuned?

- **No fine-tuning; use prompts and retrieval:** Favor this before enough high-
  quality labeled investment data exists.
- **Fine-tune small extraction and classification models:** Favor this for high-
  volume stable tasks and lower cost.
- **Fine-tune a thesis or preference model per fund:** Favor this when sufficient
  historical decisions exist and tenant isolation can be guaranteed.
- **Use adapters or parameter-efficient tuning:** Favor this for cheaper,
  separable tenant customization.

### 8.8 How should sensitive data be sent to models?

- **Send full context under enterprise no-training terms:** Favor this for best
  model performance and simpler engineering.
- **Redact or tokenize PII before external calls:** Favor this for reduced data
  exposure.
- **Route confidential tasks to private deployments:** Favor this for strict
  founder, legal, or fund data controls.
- **Use least-privilege task packages:** Favor this to expose only the evidence
  required by each agent.

## 9. Research, Assessment, and Thesis Modeling

### 9.1 How should the fund thesis be represented?

- **A human-authored structured policy:** Sector, stage, geography, check size,
  ownership, and risk constraints. Favor this for explicit control.
- **A natural-language thesis with model interpretation:** Favor this for low-
  friction authoring and nuance.
- **A learned preference model from historical decisions:** Favor this to expose
  implicit behavior not captured in stated policy.
- **An explicit thesis plus a separately displayed learned model:** Favor this
  to reveal disagreement between stated and historical preferences.

### 9.2 How should thesis fit be calculated?

- **Hard filters and rule-based labels:** Favor this for explainability and
  policy compliance.
- **A weighted scorecard:** Favor this for tunable ranking and familiar decision
  support.
- **A supervised classifier or ranker:** Favor this when enough representative
  historical outcomes exist.
- **An LLM evidence-based assessment:** Favor this for qualitative criteria and
  sparse data.
- **Independent criterion evaluations without a composite score:** Favor this
  to avoid hiding disagreement among dimensions.

### 9.3 How should Founder, Market, and Idea-versus-Market remain independent?

- **Separate schemas, evaluators, and UI panels:** Favor this for a strong
  structural guarantee against score collapse.
- **One evaluator required to output three uncoupled axes:** Favor this for
  contextual coherence and lower cost.
- **Specialist agents with a synthesis layer that cannot average scores:** Favor
  this for depth plus an integrated recommendation.
- **Human-owned axis ratings with agent-provided evidence:** Favor this when the
  final judgment must remain visibly human.

### 9.4 How should the Founder Score be implemented?

- **A dated qualitative profile with no numeric aggregate:** Favor this to avoid
  false precision and permanent ranking harm.
- **A transparent rule-based score with component breakdown:** Favor this for
  consistency and auditability.
- **A calibrated predictive model:** Favor this when clearly defined outcome
  labels and fairness controls exist.
- **A rolling Bayesian estimate with uncertainty:** Favor this for updating
  beliefs as evidence arrives.
- **Multiple contextual scores rather than one durable score:** Favor this when
  founder fit is strongly opportunity- or thesis-dependent.

### 9.5 How should trends be calculated?

- **Reviewer-selected improving/stable/declining labels:** Favor this for
  interpretive transparency.
- **Rules comparing dated snapshots:** Favor this for reproducibility.
- **Time-series models:** Favor this when enough longitudinal observations exist.
- **Evidence-weighted narrative trends:** Favor this for sparse, irregular data
  while explicitly citing changed observations.

### 9.6 How should comparables be selected?

- **Rules based on sector, stage, geography, and business model:** Favor this for
  explainability.
- **Embedding similarity over cards and company descriptions:** Favor this for
  nuanced semantic matches.
- **Graph proximity through founders, investors, markets, and technologies:**
  Favor this for relationship-aware comparables.
- **Human-curated comparable sets:** Favor this for high-stakes terms and sparse
  or biased historical data.

### 9.7 How should market and technical diligence be sourced?

- **General research agents:** Favor this for breadth and implementation speed.
- **Specialized pipelines and databases by domain:** Favor this for deeper,
  repeatable evidence.
- **External expert review:** Favor this for frontier technology or legal claims
  that exceed model reliability.
- **Privacy-preserving decomposed tasks:** Favor this when experts can validate
  narrow claims without seeing the complete confidential idea.

### 9.8 How should recommendation confidence be derived?

- **Human-selected labels:** Favor this for legible accountability.
- **Coverage rules over critical evidence and unresolved gaps:** Favor this for
  deterministic, actionable confidence.
- **Calibrated historical accuracy:** Favor this when recommendation outcomes
  can be measured over time.
- **A model-generated confidence explanation without probability language:**
  Favor this when evidence quality is qualitative and success probability must
  not be conflated with confidence.

### 9.9 How should fairness be tested?

- **Remove protected attributes from model inputs:** Favor this as a basic data-
  minimization step, while recognizing proxies remain.
- **Measure disparate ranking, error, and uncertainty rates:** Favor this to
  detect unequal outcomes across groups.
- **Counterfactual tests on equivalent profiles:** Favor this to identify
  sensitivity to names, gender, geography, or credentials.
- **Compare public-footprint volume separately from quality:** Favor this to
  prevent visibility from becoming merit.
- **Independent human or external audits:** Favor this for higher assurance and
  governance credibility.

## 10. Interview, Voice, and Multimodal Interaction

### 10.1 Which interview modality should be supported?

- **Text chat:** Favor this for low integration cost, precise transcripts, and
  accessible asynchronous participation.
- **Browser voice:** Favor this for a natural live interaction without telephony.
- **Telephone:** Favor this for references and broad accessibility through
  Twilio, Vonage, or a voice-agent provider.
- **Video:** Favor this for team exercises and richer interaction evidence,
  accepting much higher privacy and inference risk.
- **Human-led call with agent assistance:** Favor this for sensitive interviews
  while still generating questions, notes, and evidence links.

### 10.2 How should the voice stack be assembled?

- **Integrated voice-agent platform such as ElevenLabs Conversational AI:**
  Favor this for low-latency orchestration, speech, and rapid implementation.
- **Composable telephony, STT, LLM, and TTS:** Twilio plus Deepgram/Whisper,
  model APIs, and ElevenLabs/Azure speech. Favor this for component control.
- **Cloud-native contact-center stack:** Amazon Connect, Google CCAI, or Azure
  Communication Services. Favor this for enterprise operations and compliance.
- **Self-hosted real-time media pipeline:** Favor this for data control and
  custom interaction behavior, accepting substantial engineering complexity.

### 10.3 How should interview questions be generated?

- **A fixed evidence-based question bank:** Favor this for consistency,
  comparability, and easier ethical review.
- **Card-derived questions for explicit gaps and contradictions:** Favor this to
  demonstrate opportunity-specific value.
- **Adaptive follow-ups generated during the conversation:** Favor this to probe
  concrete examples and resolve uncertainty in real time.
- **A constrained blend:** Select validated question patterns and fill them with
  card hypotheses. Favor this for adaptability with bounded behavior.

### 10.4 How should live context be managed?

- **Send the complete card to the interview agent:** Favor this for coherence in
  small demos.
- **Provide an approved interview brief:** Favor this for least privilege and
  deliberate questioning.
- **Retrieve evidence and questions turn by turn:** Favor this for dynamic depth
  and lower context size.
- **Maintain a structured live state of hypotheses, answers, and follow-ups:**
  Favor this for coverage and reliable post-call updates.

### 10.5 How should interruption and latency be handled?

- **Provider-managed turn taking:** Favor this for fast implementation.
- **Voice activity detection and barge-in controls:** Favor this for natural
  conversation and explicit tuning.
- **Push-to-talk or structured turns:** Favor this for reliability in a demo or
  noisy environment.
- **A human moderator fallback:** Favor this when connection or model failures
  must not end a high-value session.

### 10.6 What should be recorded?

- **Structured notes only:** Favor this for data minimization.
- **Transcript plus speaker and timestamps:** Favor this for evidence anchoring
  and review.
- **Audio recording:** Favor this for exact audit and transcription correction,
  subject to consent and retention law.
- **Video recording:** Favor this only when team interaction evidence justifies
  the heightened privacy and storage burden.
- **Participant-selectable recording levels:** Favor this for consent and
  jurisdictional flexibility.

### 10.7 How should interview evidence update the card?

- **Automatic claim extraction with transcript citations:** Favor this for
  immediate workflow progress.
- **A post-call review queue:** Favor this for accuracy and participant-sensitive
  conclusions.
- **Only explicit factual statements are auto-added; behavioral interpretations
  require review:** Favor this to separate evidence from inference.
- **Founder confirmation of the generated summary:** Favor this for correction
  rights and trust.

### 10.8 How should personality or behavior be assessed?

- **Do not infer stable personality; report observed behaviors only:** Favor this
  for lower scientific, cultural, and ethical risk.
- **Use validated psychometric instruments with explicit consent:** Favor this
  for standardized constructs and comparability.
- **Infer probabilistic traits from language and interaction:** Favor this for a
  richer vibe-check hypothesis, accepting validity and bias concerns.
- **Use team-task performance and interaction patterns:** Favor this to observe
  decision-relevant behavior rather than self-description.
- **Human interpretation assisted by structured observations:** Favor this when
  accountability should remain with trained reviewers.

### 10.9 Should facial expression, gaze, emotion, or vocal stress be analyzed?

- **Exclude these signals:** Favor this due to weak validity, accessibility,
  cultural bias, privacy, and regulatory risk.
- **Use only raw interaction measures such as turn-taking and interruption:**
  Favor this for more observable, less inferential team dynamics.
- **Use affect models as low-confidence supporting evidence:** Favor this only
  when consent, validation, and prominent uncertainty controls exist.
- **Run experimental analysis outside decision-making:** Favor this to study
  usefulness without affecting founder outcomes.

### 10.10 How should interview consent and disclosure work?

- **Explicit pre-call consent for agent identity, recording, purposes, and
  retention:** Favor this for informed participation and auditability.
- **In-call verbal confirmation:** Favor this where recording laws require a
  captured acknowledgement.
- **Jurisdiction-aware consent flows:** Favor this for multi-region calling.
- **Human-only alternative:** Favor this to avoid excluding participants who do
  not consent to automated or recorded assessment.

## 11. Term Sheet Modeling and Negotiation

### 11.1 How should a term sheet be represented?

- **A legal template with structured variable slots:** Favor this for controlled
  language and deterministic population.
- **A fully structured clause and parameter model:** Favor this for comparison,
  negotiation, validation, and multiple output formats.
- **A document model extracted from existing templates:** Favor this when funds
  need to retain their current legal forms.
- **LLM-generated prose constrained by a clause library:** Favor this for
  flexibility, with required legal review.

### 11.2 Which term templates should be integrated?

- **Standard SAFE or convertible-note templates:** Favor this for a narrow,
  recognizable MVP.
- **NVCA or local standard equity documents:** Favor this for richer priced-round
  scenarios and established clauses.
- **Fund-provided counsel-approved templates:** Favor this for operational use
  and reduced mismatch with investment practice.
- **A legal-document provider such as SeedLegals, Clerky, Carta, or DocuSign
  workflows:** Favor this to integrate drafting, approval, and signature.

### 11.3 How should financial terms be calculated?

- **A custom deterministic calculation library:** Favor this for inspectable
  equations, tests, and direct product integration.
- **A spreadsheet model as the calculation authority:** Favor this for investor
  familiarity and easy scenario inspection.
- **A rules engine or solver:** Favor this for constraints across check size,
  ownership, dilution, option pool, and valuation.
- **A third-party cap-table API:** Carta, Pulley, Cake, or Ledgy. Favor this for
  accurate ownership and dilution modeling with existing records.

### 11.4 How should term rationales be linked to evidence?

- **Each material term stores input values, equations, and claim IDs:** Favor
  this for reproducibility.
- **Narrative annotations generated from a calculation trace:** Favor this for
  readable explanations without allowing prose to invent numbers.
- **A dependency graph from evidence to assumptions to terms:** Favor this for
  counterfactual updates and impact analysis.
- **Human-authored rationale attached after review:** Favor this for direct
  investment accountability.

### 11.5 How should counterfactuals be implemented?

- **Predefined scenarios:** Base, downside, and diligence-cleared. Favor this for
  simple comparison.
- **Interactive assumption controls with immediate recalculation:** Favor this
  for a compelling reviewer experience.
- **Sensitivity analysis across ranges:** Favor this for identifying assumptions
  that materially affect terms.
- **Constraint optimization:** Favor this for finding feasible term combinations
  under both parties' bounds.

### 11.6 How should negotiation preferences be represented?

- **Hard minimums, maximums, and non-negotiable clauses:** Favor this for clear
  agent authority.
- **Utility functions over multiple terms:** Favor this for modeling tradeoffs
  among valuation, control, dilution, and preferences.
- **Ranked issue priorities and concession rules:** Favor this for explainability
  to human operators.
- **A weighted Nash bargaining model with BATNAs:** Favor this for a formal
  bargaining solution and explicit disagreement points.
- **A playbook selected by humans:** Favor this when formal utility estimates
  would imply unjustified precision.

### 11.7 How should the other party's acceptable range be estimated?

- **Do not estimate it; react only to explicit offers:** Favor this for honesty
  and lower manipulation risk.
- **Infer from verified competing offers and stated constraints:** Favor this
  for evidence-constrained leverage.
- **Use market comparables:** Favor this when enough relevant, recent deal data
  exists.
- **Use a probabilistic belief model updated during negotiation:** Favor this for
  strategic adaptation while displaying uncertainty.

### 11.8 What autonomy should the negotiation agent have?

- **Advisory only:** Generate suggestions for a human negotiator. Favor this for
  lowest authority and legal risk.
- **Communicate approved offers without changing them:** Favor this for workflow
  efficiency with fixed authority.
- **Negotiate within explicit per-term bounds:** Favor this to demonstrate
  autonomy while preserving constraints.
- **Trade concessions according to an approved utility model:** Favor this for
  multi-issue optimization.
- **Draft agreement subject to final human and legal approval:** Favor this when
  automation should reach convergence but not bind either party.

### 11.9 When should negotiation stop or escalate?

- **Any request outside approved bounds:** Favor this for strict authority.
- **Material legal clause changes:** Favor this to involve counsel.
- **Low confidence, contradiction, or new evidence:** Favor this to prevent
  decisions from stale assumptions.
- **Time, turn, or concession limits:** Favor this for predictable behavior.
- **Detected distress, confusion, or request for a human:** Favor this for fair
  and respectful interaction.

### 11.10 How should negotiation state be recorded?

- **A structured current offer and status:** Agreement, counteroffer, callback,
  unresolved, or decline. Favor this for workflow simplicity.
- **An append-only offer and concession ledger:** Favor this for auditability and
  strategy analysis.
- **Transcript spans linked to every changed term:** Favor this for evidence of
  authority and rationale.
- **Signed approval checkpoints:** Favor this for material transitions and clear
  human responsibility.

### 11.11 How should legal review be integrated?

- **Manual export to counsel:** Favor this for an MVP and existing relationships.
- **Counsel approval as a workflow gate:** Favor this for enforceable operational
  controls.
- **Integration with contract lifecycle management tools:** Ironclad, LinkSquares,
  or equivalent. Favor this for enterprise clause and approval workflows.
- **Automated clause checks followed by counsel review:** Favor this to reduce
  routine review while retaining professional authority.

## 12. Human Review and Investor Workspace

### 12.1 What is the primary workspace metaphor?

- **A pipeline board:** Favor this for stage-based deal-flow operations.
- **A prioritized queue:** Favor this for deadline and value-of-information work.
- **A card-centric dossier:** Favor this for deep review of one opportunity.
- **A comparison table:** Favor this for portfolio triage across independent
  assessment axes.
- **A split view of recommendation, card, and evidence:** Favor this for rapid
  inspection without losing provenance.

### 12.2 How should the Opportunity Card be edited?

- **Raw Markdown editor with preview:** Favor this for transparency and speed.
- **Structured forms and tables:** Favor this for validation and accessibility.
- **Block editor:** Favor this for flexible sections and rich artifacts.
- **Read-only generated card plus action-specific controls:** Favor this to
  minimize accidental corruption.
- **A mixed structured/raw editor:** Favor this for typed critical fields and
  flexible narrative sections.

### 12.3 How should review queues be organized?

- **By workflow stage:** Favor this for operational clarity.
- **By materiality or decision impact:** Favor this to focus human attention.
- **By confidence or contradiction:** Favor this for risk-based oversight.
- **By owner and deadline:** Favor this for accountability within a deal team.
- **By agent-proposed change type:** Facts, inferences, assessments, and terms.
  Favor this for differentiated approval policies.

### 12.4 What actions require explicit approval?

- **Only final investment and legal terms:** Favor this for maximum automation.
- **Founder-facing interviews, reference calls, and negotiation:** Favor this for
  consent, reputation, and authority control.
- **Material card claims and recommendations:** Favor this for evidence quality.
- **Every external side effect or card mutation:** Favor this for strongest
  oversight at the cost of throughput.
- **Risk-tiered approvals:** Favor this to reserve review for consequential
  changes.

### 12.5 How should disagreement be captured?

- **Reviewer edits replace model output:** Favor this for a clean final record.
- **Model and reviewer positions remain side by side:** Favor this for learning
  and accountability.
- **Structured override reasons:** Favor this for preference modeling and audit.
- **Multi-reviewer comments and votes:** Favor this for investment-committee
  workflows.

### 12.6 How should founders correct records?

- **A correction request workflow:** Favor this for controlled review and audit.
- **A founder portal showing approved claims and sources:** Favor this for
  transparency and self-service correction.
- **Post-interview summary confirmation:** Favor this for a narrow, timely
  correction point.
- **No direct access; corrections handled by the fund:** Favor this for a simpler
  initial system, accepting lower transparency.

### 12.7 How should notifications work?

- **In-app task and deadline notifications:** Favor this for a contained product.
- **Email and calendar integration:** Favor this for existing deal-team habits.
- **Slack or Microsoft Teams integration:** Favor this for rapid collaboration.
- **CRM tasks and status updates:** Favor this when another system remains the
  operational hub.

## 13. API, Backend, and Frontend Technology

### 13.1 Which primary implementation language should be used?

- **TypeScript end to end:** Favor this for shared schemas, web development,
  real-time APIs, and a unified team stack.
- **Python backend with a TypeScript frontend:** Favor this for AI, document,
  data-science, and optimization ecosystems.
- **Go or Rust services plus TypeScript/Python at the edges:** Favor this for
  efficient high-concurrency media or infrastructure components.
- **Multiple languages by bounded context:** Favor this when specialist needs
  outweigh operational simplicity.

### 13.2 Which backend framework should be used?

- **FastAPI:** Favor this for Python typing, async APIs, and AI ecosystem fit.
- **Django:** Favor this for batteries-included auth, admin, ORM, and workflows.
- **NestJS:** Favor this for structured TypeScript modules and dependency
  injection.
- **Next.js server capabilities:** Favor this for a compact full-stack MVP.
- **Go with Chi/Fiber or equivalent:** Favor this for lean, performant services.

### 13.3 Which frontend framework should be used?

- **React with Next.js:** Favor this for a rich workspace, server rendering,
  broad component tooling, and full-stack options.
- **React with Vite:** Favor this for a clear client/API separation and fast
  iteration.
- **SvelteKit:** Favor this for a compact codebase and reactive UI.
- **Vue with Nuxt:** Favor this for approachable component development and a
  mature full-stack ecosystem.
- **A low-code internal tool such as Retool or Appsmith:** Favor this to validate
  workflow value before investing in a custom interface.

### 13.4 How should client state and server data be managed?

- **Server-rendered routes and actions:** Favor this for a simpler data flow and
  fewer client caches.
- **TanStack Query or equivalent:** Favor this for responsive asynchronous UI,
  caching, and background updates.
- **GraphQL client normalized cache:** Favor this for connected card data and
  flexible views.
- **Real-time subscriptions over WebSocket or SSE:** Favor this for live agent,
  interview, and card-update progress.

### 13.5 Which UI foundation should be used?

- **An established component library:** MUI, Ant Design, Chakra, or Mantine.
  Favor this for speed, accessibility, and dense operational controls.
- **Headless primitives:** Radix, React Aria, or Headless UI. Favor this for a
  distinctive interface with robust interaction behavior.
- **A custom design system:** Favor this when product differentiation and long-
  term consistency justify the investment.
- **The fund's existing design system:** Favor this for integration into an
  established workspace.

### 13.6 How should rich Markdown and citations be rendered?

- **A CommonMark/GFM renderer with custom citation components:** Favor this for
  compatibility with card files.
- **MDX:** Favor this for embedding interactive evidence and term controls,
  while carefully sandboxing executable components.
- **Structured blocks rendered directly:** Favor this for safer, deterministic
  rich views.
- **A collaborative editor framework such as ProseMirror, TipTap, or Lexical:**
  Favor this when rich human editing is central.

### 13.7 How should external APIs be exposed?

- **A private internal API only:** Favor this for an early product and smaller
  security surface.
- **A tenant-scoped REST API with webhooks:** Favor this for CRM, data-room, and
  workflow integrations.
- **GraphQL API:** Favor this for partner access to connected opportunities and
  evidence.
- **Event exports:** Favor this for downstream analytics and systems of record.

## 14. Identity, Tenancy, Permissions, and Consent

### 14.1 How should users authenticate?

- **Managed identity provider:** Auth0, Clerk, WorkOS, Cognito, or Entra ID.
  Favor this for fast secure implementation and enterprise SSO options.
- **Application-managed authentication:** Favor this for control and lower
  vendor dependency, accepting security ownership.
- **Enterprise SSO only:** Favor this for B2B fund deployments.
- **Passwordless email links for external founders and reviewers:** Favor this
  for low-friction temporary access.

### 14.2 What tenancy model should be used?

- **Shared database with tenant IDs and row-level security:** Favor this for
  efficient SaaS operations.
- **Schema per tenant:** Favor this for stronger logical isolation and easier
  tenant export.
- **Database per tenant:** Favor this for high isolation, residency, and
  enterprise requirements.
- **Single-tenant deployments:** Favor this for sensitive customers and simpler
  trust boundaries at higher operational cost.

### 14.3 How should authorization be modeled?

- **Role-based access control:** Admin, investor, analyst, counsel, founder, and
  auditor. Favor this for comprehensibility.
- **Attribute-based access control:** Include tenant, opportunity, data class,
  purpose, and consent. Favor this for nuanced evidence access.
- **Relationship-based access control:** OpenFGA, SpiceDB, or similar. Favor this
  for sharing among teams, opportunities, external experts, and founders.
- **Policy-as-code:** OPA or Cedar. Favor this for centralized, testable rules.

### 14.4 At what granularity should access be controlled?

- **Tenant or fund:** Favor this for the simplest model.
- **Opportunity:** Favor this for deal teams and external reviewers.
- **Card section or artifact:** Favor this for legal, reference, and confidential
  technical evidence.
- **Claim, source, or evidence span:** Favor this for least-privilege specialist
  agents and selective founder transparency.

### 14.5 How should consent be represented?

- **Boolean permissions on the card:** Favor this for visible MVP behavior.
- **Versioned consent records by purpose and data type:** Favor this for audit,
  withdrawal, and changing terms.
- **A consent and preference service:** Favor this when calling, recording,
  references, research, model use, and retention vary independently.
- **External consent-management integration:** Favor this for mature compliance
  workflows.

### 14.6 How should consent withdrawal propagate?

- **Block future use only:** Favor this when immutable audit requirements permit
  retaining historical processing.
- **Delete or redact affected artifacts and derived data:** Favor this for strong
  privacy rights, accepting lineage complexity.
- **Mark derived claims unusable and recalculate dependent outputs:** Favor this
  to preserve audit structure without continuing to rely on withdrawn evidence.
- **Case-by-case policy based on legal basis and artifact type:** Favor this for
  jurisdictional and fiduciary nuance.

## 15. Security, Privacy, Safety, and Compliance

### 15.1 How should data be classified?

- **A simple public/internal/confidential/restricted scheme:** Favor this for
  understandable controls.
- **Domain-specific classes:** PII, special-category data, fund-confidential,
  legal, call recording, reference, and founder IP. Favor this for precise
  policies.
- **Automated classification plus human correction:** Favor this for scale
  across heterogeneous documents.

### 15.2 How should encryption be managed?

- **Cloud-managed encryption at rest and TLS in transit:** Favor this as a
  low-operations baseline.
- **Customer-managed keys:** Favor this for enterprise control and revocation.
- **Per-tenant or per-opportunity envelope keys:** Favor this for stronger
  isolation and selective deletion.
- **Field-level encryption or tokenization:** Favor this for especially
  sensitive identity, reference, and legal fields.

### 15.3 How should secrets and external credentials be stored?

- **Cloud secret manager:** Favor this for rotation, IAM, and audit integration.
- **Vault:** Favor this for multi-cloud or self-hosted dynamic secrets.
- **Per-user delegated OAuth tokens:** Favor this when actions must occur under
  individual authority.
- **Central service credentials:** Favor this for operational simplicity where
  provider permissions can be narrowly scoped.

### 15.4 How should untrusted documents and web content be isolated?

- **Treat all retrieved content as data, never instructions:** Favor this as a
  core prompt-injection boundary.
- **Sanitize and normalize content before model use:** Favor this for reducing
  hidden or active content risk.
- **Sandbox document processing and browser automation:** Favor this for malware
  and network containment.
- **Use allowlisted tools and destinations per agent:** Favor this to limit data
  exfiltration and side effects.
- **Require approval before external communication:** Favor this for protection
  against injected email, call, or negotiation actions.

### 15.5 How should prompt injection and tool misuse be detected?

- **Deterministic input/output filters and tool policies:** Favor this for
  enforceable boundaries.
- **A separate security classifier or guard model:** Favor this for broader
  detection of adversarial instructions.
- **Taint tracking from untrusted sources to sensitive tools:** Favor this for
  explicit information-flow control.
- **Human review of high-impact actions:** Favor this when automated detection
  cannot provide sufficient assurance.

### 15.6 What retention policy should apply?

- **One global retention period:** Favor this for simple operations.
- **Different periods by artifact and workflow status:** Favor this because raw
  calls, source documents, derived claims, and decisions have different value
  and risk.
- **Tenant-configurable retention within legal bounds:** Favor this for B2B
  requirements.
- **Event-driven deletion after decline or inactivity:** Favor this for data
  minimization.
- **Long-term immutable decision records with redacted source data:** Favor this
  for fiduciary audit while reducing personal-data exposure.

### 15.7 What regional and legal regimes must shape deployment?

- **Design for one launch jurisdiction:** Favor this for a narrow operational
  scope and clearer calling/recording rules.
- **EU/UK privacy-first design:** Favor this when GDPR, automated decision-
  making, profiling, and data-subject rights are likely to apply.
- **US state-by-state controls:** Favor this when recording consent, biometric
  privacy, and emerging AI hiring-like laws vary by location.
- **Region-specific data planes and policies:** Favor this for global operation
  with residency and transfer constraints.

### 15.8 How should automated decision risk be controlled?

- **Never auto-decline or auto-invest:** Favor this to keep the system firmly in
  decision support.
- **Permit automated prioritization but require review for outcomes:** Favor this
  for scale with human authority.
- **Expose reasons, evidence, uncertainty, and correction paths:** Favor this for
  contestability regardless of automation level.
- **Log meaningful human review rather than a nominal approval click:** Favor
  this for defensible human-in-the-loop governance.

### 15.9 How should audit logs be protected?

- **Append-only database records:** Favor this for operational simplicity.
- **Tamper-evident hash chains or signed events:** Favor this for stronger
  integrity evidence.
- **Immutable object storage or WORM retention:** Favor this for regulated audit
  requirements.
- **External SIEM export:** Favor this for enterprise monitoring and incident
  response.

### 15.10 What incident-response capabilities are needed?

- **Manual runbooks and provider dashboards:** Favor this for an MVP.
- **Automated credential revocation and workflow shutdown:** Favor this for rapid
  containment of agent or connector incidents.
- **Per-tenant kill switches:** Favor this to isolate incidents without global
  downtime.
- **Source and derivative lineage for targeted deletion:** Favor this to remediate
  an exposed artifact and all outputs derived from it.

## 16. Observability, Evaluation, and Quality

### 16.1 What should be traced end to end?

- **Traditional request, job, and database telemetry:** Favor this for baseline
  reliability.
- **Every model call, prompt version, token count, tool call, and output:** Favor
  this for AI debugging and cost attribution.
- **Claim lineage from source to card to recommendation to term:** Favor this for
  product-level auditability.
- **Workflow timelines and human approvals:** Favor this for the 24-hour SLA and
  operational bottleneck analysis.

### 16.2 Which observability stack should be used?

- **OpenTelemetry with Grafana, Prometheus, Loki, and Tempo:** Favor this for
  portable full-stack telemetry.
- **A managed platform such as Datadog, New Relic, or Honeycomb:** Favor this for
  rapid operational maturity.
- **An LLM observability platform such as LangSmith, Langfuse, Arize Phoenix, or
  Braintrust:** Favor this for prompt traces and evaluations.
- **A combined general and AI-specific stack:** Favor this to connect model
  behavior with system and user outcomes.

### 16.3 How should extraction and claim quality be evaluated?

- **A manually labeled golden dataset:** Favor this for repeatable precision,
  recall, citation, and contradiction tests.
- **Human review sampling:** Favor this for ongoing real-world drift detection.
- **Model-based graders:** Favor this for broad inexpensive feedback, calibrated
  against human judgments.
- **Source-grounding invariants:** Require valid citations and entailment checks.
  Favor this for automated release gates.

### 16.4 How should interview quality be evaluated?

- **Gap-resolution rate:** Favor this to measure whether interviews change the
  evidence state.
- **Question specificity and evidence linkage:** Favor this to reject generic
  personality interviews.
- **Human ratings of relevance, fairness, and conversational quality:** Favor
  this for dimensions not captured by task completion.
- **Founder feedback and correction rate:** Favor this to measure trust and
  misinterpretation.
- **Latency, interruption, and completion metrics:** Favor this for voice-system
  usability.

### 16.5 How should recommendation quality be evaluated?

- **Agreement with investment-committee decisions:** Favor this for preference
  alignment, while not treating historical choices as ground truth.
- **Decision-changing insight rate:** Favor this to measure unique product value.
- **Calibration of confidence against later verification:** Favor this for
  epistemic reliability.
- **Reproducibility of rationale and terms:** Favor this for auditability.
- **Long-term portfolio outcomes:** Favor this for ultimate learning, while
  accounting for long delays and selection bias.

### 16.6 How should regressions be tested?

- **Unit tests for schemas, calculations, permissions, and transitions:** Favor
  this for deterministic guarantees.
- **Recorded workflow fixtures:** Favor this for repeatable end-to-end agent runs
  without live providers.
- **Prompt and model evaluation suites:** Favor this for quality gates across
  version changes.
- **Shadow runs on historical opportunities:** Favor this to compare behavior
  before rollout.
- **Canary tenants or feature flags:** Favor this for controlled production
  validation.

### 16.7 How should feedback become training data?

- **Store human edits and override reasons:** Favor this for direct correction
  signals.
- **Store downstream verification and outcomes:** Favor this for calibration and
  ranking research.
- **Require explicit data-use consent and tenant boundaries:** Favor this to
  prevent unauthorized cross-customer learning.
- **Aggregate privacy-preserving metrics only:** Favor this when shared model
  improvement is useful but raw data must remain isolated.

## 17. Reliability, Performance, and Cost

### 17.1 What service objectives should be defined?

- **A 24-hour end-to-end decision SLA:** Favor this to match the product promise.
- **Per-stage deadlines:** Favor this to identify whether intake, research,
  interview, or review causes delay.
- **Interactive latency targets for card and evidence views:** Favor this for a
  usable investor workspace.
- **Real-time voice latency targets:** Favor this when conversational quality is
  a core proof.

### 17.2 How should long-running work survive failures?

- **Durable workflow checkpoints:** Favor this for exact resume behavior.
- **Idempotent jobs and persisted intermediate artifacts:** Favor this for queue-
  based systems.
- **Recompute from immutable source artifacts:** Favor this for simpler state at
  higher retry cost.
- **Human-visible partial states and restart controls:** Favor this for
  operational recovery.

### 17.3 How should provider outages be handled?

- **Wait and retry within the deadline:** Favor this for consistent outputs.
- **Fallback to an alternate model, speech, search, or parsing provider:** Favor
  this for availability.
- **Degrade to manual tasks:** Favor this for critical opportunities where
  provider substitution could change quality.
- **Complete with explicit gaps:** Favor this when timeliness matters more than
  hidden substitution.

### 17.4 How should AI and data-provider cost be controlled?

- **Hard per-opportunity budgets:** Favor this for predictable unit economics.
- **Task-specific model routing and context limits:** Favor this for continuous
  cost optimization.
- **Deduplicate and cache source processing:** Favor this when founders,
  companies, or documents recur.
- **Value-of-information stopping rules:** Favor this to stop research when the
  expected decision impact is low.
- **Tenant plans and usage quotas:** Favor this for a commercial SaaS model.

### 17.5 How should burst capacity be managed?

- **Autoscaling serverless workers:** Favor this for episodic sourcing and
  deadline peaks.
- **Queue-based backpressure and priorities:** Favor this for controlled spend
  and SLA ordering.
- **Reserved worker pools:** Favor this for predictable latency and private
  processing.
- **Provider concurrency budgets:** Favor this to avoid quota failure during
  large intake batches.

### 17.6 What backup and disaster-recovery model is needed?

- **Managed database backups and point-in-time recovery:** Favor this as a
  production baseline.
- **Cross-region replication:** Favor this for stronger availability and disaster
  recovery.
- **Periodic portable card and artifact exports:** Favor this for vendor
  independence and human recovery.
- **Event-log replay into new projections:** Favor this when event sourcing is
  adopted.

## 18. Development, Deployment, and Operations

### 18.1 How should source code be organized?

- **A monorepo:** Favor this for shared card schemas, calculation libraries,
  generated clients, and coordinated changes.
- **Separate repositories by service:** Favor this for independent ownership and
  release cycles.
- **A core platform repo plus connector repos:** Favor this when integrations
  evolve independently or have separate security boundaries.

### 18.2 How should local development work?

- **Docker Compose for database, object store, queue, and services:** Favor this
  for reproducible full-stack development.
- **Managed development resources:** Favor this for parity with cloud services
  and lower local setup cost.
- **Provider emulators and recorded fixtures:** Favor this for offline,
  deterministic development.
- **Dev containers or Nix:** Favor this for consistent toolchains across the team.

### 18.3 How should infrastructure be provisioned?

- **Terraform or OpenTofu:** Favor this for cloud-neutral declarative control.
- **Pulumi:** Favor this for infrastructure in TypeScript, Python, or Go.
- **Cloud-native templates:** CDK, Bicep, or Deployment Manager. Favor this for
  deep provider integration.
- **Platform-managed configuration:** Favor this for a small MVP with minimal
  infrastructure ownership.

### 18.4 What deployment model should be used?

- **Containers on a managed service:** ECS/Fargate, Cloud Run, or Azure Container
  Apps. Favor this for balanced control and operations.
- **Kubernetes:** Favor this for many services, custom networking, and portable
  workloads.
- **Serverless functions:** Favor this for event-driven bursty tasks.
- **Full-stack edge platform plus background workers:** Favor this for a fast web
  product with isolated long-running AI jobs.

### 18.5 How should database and card migrations be deployed?

- **Blocking migrations before application rollout:** Favor this for simple
  sequencing at small scale.
- **Expand-and-contract migrations:** Favor this for zero-downtime compatibility.
- **Lazy card migration on read or write:** Favor this for large stores and
  versioned document schemas.
- **Background bulk migration with validation reports:** Favor this for explicit
  progress and exception handling.

### 18.6 How should environments be separated?

- **Development, staging, and production:** Favor this as a straightforward
  baseline.
- **Ephemeral preview environments per change:** Favor this for UI and workflow
  review.
- **Tenant-isolated sandboxes with synthetic data:** Favor this for demos and
  customer configuration.
- **A separate evaluation environment with frozen models and datasets:** Favor
  this for reproducible AI release decisions.

### 18.7 How should third-party dependencies be governed?

- **Direct provider SDKs:** Favor this for access to current features.
- **Internal adapters behind stable interfaces:** Favor this for substitution,
  testing, and centralized policy.
- **A procurement and data-processing review for every provider:** Favor this
  for sensitive founder and fund data.
- **Self-host strategic dependencies:** Favor this where continuity or data
  control outweighs operational cost.

## 19. Build, Buy, and Integrate Boundaries

### 19.1 Which capabilities are candidates to build as core IP?

- **Opportunity Card schema, provenance, and mutation policy:** Favor building
  because they encode the central product model.
- **Value-of-information research prioritization:** Favor building if adaptive
  evidence acquisition is a key differentiator.
- **Independent assessment and trust logic:** Favor building when explainability
  and calibrated judgment are strategic.
- **Term dependency graph and evidence-linked calculations:** Favor building if
  annotated, challengeable terms are the product wedge.
- **Negotiation policy and authority controls:** Favor building if constrained
  negotiation is central to defensibility.

### 19.2 Which capabilities are candidates to buy or integrate?

- **Authentication and enterprise SSO:** Favor integration because secure
  identity is mature commodity infrastructure.
- **Object storage, queues, email, and notifications:** Favor managed services
  for reliability and speed.
- **Document OCR and parsing:** Favor integration when format breadth matters
  more than parser ownership.
- **Search, company, and people data:** Favor licensed providers for coverage
  and normalized records.
- **Voice, telephony, STT, and TTS:** Favor integration due to real-time media,
  carrier, and speech complexity.
- **E-signature, cap tables, and legal templates:** Favor integration because
  legal workflow and ownership arithmetic already have specialist providers.
- **LLM inference:** Favor hosted models until utilization, privacy, or tuning
  justify self-hosting.

### 19.3 How should vendor lock-in be weighed?

- **Optimize for delivery speed now:** Favor provider-native features and accept
  later migration cost.
- **Wrap every external provider behind an adapter:** Favor this for portability
  and testability at some upfront cost.
- **Abstract only high-risk or high-spend providers:** Favor this to avoid
  speculative generalization.
- **Use open data formats and export paths regardless of provider:** Favor this
  as a practical minimum for long-lived cards and evidence.

### 19.4 What should remain demonstrative rather than production-grade initially?

- **Outbound sourcing breadth:** Favor staging it when one controlled opportunity
  is enough to prove the loop.
- **Learned preference and outcome models:** Favor staging them until historical
  data quality and sample size are credible.
- **Autonomous negotiation:** Favor simulating bounded moves before conducting
  real founder-facing negotiation.
- **Multimodal personality inference:** Favor an experimental track until
  validity, consent, and fairness are established.
- **Cross-fund learning:** Favor deferring it until tenancy, permissions, and
  data-use agreements are mature.

## 20. Testing and Acceptance Decisions

### 20.1 What is the minimum end-to-end acceptance scenario?

- **A fixed synthetic company and sources:** Favor this for deterministic demos
  and repeatable tests.
- **A real consenting startup with curated evidence:** Favor this for credibility
  and realistic integration risks.
- **Several contrasting opportunities:** Favor this to prove independent axes,
  uncertainty handling, and non-generic output.
- **A historical deal replay:** Favor this for comparison with known decisions
  without affecting a live founder.

### 20.2 What must the acceptance test prove about the card?

- **A deck creates a schema-valid readable card:** Favor this as the foundational
  artifact test.
- **Every material generated claim resolves to a stored source span:** Favor this
  to prove provenance.
- **Contradictions and unknowns remain distinct and visible:** Favor this to
  prove epistemic discipline.
- **Parallel agent updates do not lose or silently overwrite evidence:** Favor
  this to prove concurrency behavior.
- **A reviewer can inspect history and override a recommendation:** Favor this to
  prove human control.
- **A card can be exported and reconstructed without hidden provider state:**
  Favor this to prove portability.

### 20.3 What must the acceptance test prove about the interview?

- **Questions cite card-specific hypotheses:** Favor this to distinguish the
  product from a generic interviewer.
- **At least one gap is resolved or explicitly remains unknown:** Favor this to
  demonstrate useful evidence acquisition.
- **Transcript evidence updates the correct claims without unsupported inference:**
  Favor this to prove safe card mutation.
- **Consent, interruption, failure, and human escalation paths work:** Favor this
  to prove operational readiness.

### 20.4 What must the acceptance test prove about terms?

- **Every material number comes from a visible deterministic model:** Favor this
  to eliminate invented figures.
- **Each term links to assumptions and evidence:** Favor this to prove the
  annotated-term-sheet thesis.
- **Changing an assumption recalculates affected terms and rationale:** Favor
  this to prove dependency tracking.
- **No founder-facing term is issued without the configured approvals:** Favor
  this to prove authority controls.

### 20.5 What failure cases should be deliberately tested?

- **Missing or malformed documents:** Favor this to verify explicit gaps.
- **Conflicting revenue, identity, or ownership claims:** Favor this to verify
  contradiction modeling.
- **A well-documented weak opportunity and a sparse strong opportunity:** Favor
  this to detect evidence-volume bias.
- **Prompt injection in a deck or web page:** Favor this to verify tool and data
  boundaries.
- **Model, search, voice, or telephony outage:** Favor this to verify recovery
  and graceful degradation.
- **Consent withdrawal or deletion request:** Favor this to verify lineage and
  privacy behavior.
- **An out-of-bounds negotiation request:** Favor this to verify escalation and
  immutable authority limits.

## 21. Decisions That Cut Across Every Option

These questions should be answered for each selected technology or workflow,
not only once for the whole system.

### 21.1 What is the source of truth?

- **One authoritative component with derived views:** Favor this to avoid hidden
  reconciliation and conflicting state.
- **Multiple systems with explicit ownership by field or lifecycle stage:** Favor
  this when CRM, card, call, and legal systems must coexist.

### 21.2 What happens when confidence is low?

- **Preserve `unknown` and request evidence:** Favor this for epistemic safety.
- **Escalate to a larger model or specialist:** Favor this when resolution is
  worth additional cost.
- **Queue human review:** Favor this for material decisions.
- **Proceed with a visible limitation:** Favor this when the deadline matters and
  the missing fact is not decision-critical.

### 21.3 What happens when systems disagree?

- **Prefer a configured authoritative source:** Favor this for deterministic
  resolution.
- **Retain both claims as a contradiction:** Favor this when choosing would hide
  uncertainty.
- **Ask the founder or reviewer to resolve it:** Favor this when only a person can
  supply authoritative context.
- **Trigger targeted evidence acquisition:** Favor this when an independent
  source can settle the issue.

### 21.4 What is reversible?

- **Use adapters, open schemas, exports, and feature flags:** Favor this for
  choices likely to change as the product is validated.
- **Invest deeply in stable domain invariants:** Favor this for IDs, provenance,
  consent, audit, calculations, and human authority that are costly to retrofit.

### 21.5 How is each choice evaluated?

- **Delivery speed:** Favor options that prove the end-to-end loop soonest.
- **Evidence quality:** Favor options that preserve source-level traceability and
  explicit uncertainty.
- **Human usability:** Favor options that reduce review time and make challenges
  or corrections easy.
- **Safety and compliance:** Favor options that minimize data, bound authority,
  and support consent and audit.
- **Reliability and latency:** Favor options compatible with interactive review,
  live calls, and the 24-hour deadline.
- **Cost and scalability:** Favor options with sustainable per-opportunity unit
  economics and manageable operational load.
- **Portability:** Favor options that keep cards, evidence, and calculations
  usable outside one vendor.
- **Learning value:** Favor options that produce reliable feedback without
  turning historical bias into automated policy.
