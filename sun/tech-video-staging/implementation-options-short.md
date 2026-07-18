# Implementation Options and Design Decisions

> This document presents decisions and alternatives only. It does not select a preferred option.

## 1. Product Scope and Autonomy

### 1.1 Initial system boundary

- **Assessment-only MVP** — Minimizes legal and operational risk while validating evidence quality.
- **Assessment plus annotated term sheet** — Demonstrates the distinctive evidence-to-terms workflow.
- **End-to-end sourcing through negotiation** — Tests the complete product thesis but greatly increases integration scope.
- **Reusable horizontal decision engine** — Expands addressable markets but weakens initial VC-specific focus.

### 1.2 Agent autonomy level

- **Advisory agents only** — Keeps all consequential actions under human control.
- **Agents execute research; humans approve communications** — Automates expensive work while controlling external interactions.
- **Bounded external autonomy** — Enables speed within approved budgets, scripts, and negotiation ranges.
- **Broad autonomy with exception escalation** — Maximizes throughput but raises reliability, legal, and reputational risk.

### 1.3 Human approval granularity

- **One approval per workflow stage** — Simple and auditable, but may slow the 24-hour cycle.
- **Approval by action risk** — Adds friction only for sensitive calls, references, or term changes.
- **Approval by policy thresholds** — Scales well but requires reliable classification and policy enforcement.
- **Continuous reviewer co-pilot** — Offers maximum oversight at substantial human cost.

### 1.4 Founder-facing transparency

- **Minimal operational disclosure** — Reduces interface complexity.
- **Disclose AI participation and recording** — Supports consent and trust.
- **Expose evidence and major decision factors** — Enables correction and contestability.
- **Expose full scoring and term calculations** — Maximizes transparency but increases gaming and model-disclosure concerns.

---

## 2. System Architecture

### 2.1 Overall architecture

- **Modular monolith** — Fastest to build and easiest to transact consistently.
- **Service-oriented architecture** — Separates major domains without full microservice overhead.
- **Microservices** — Supports independent scaling and ownership but adds distributed-system complexity.
- **Event-driven agent platform** — Fits long-running asynchronous workflows and replay, but complicates debugging.
- **Serverless workflow architecture** — Reduces operations burden but introduces runtime and vendor constraints.

### 2.2 Deployment model

- **Multi-tenant SaaS** — Best operational efficiency and shared improvement.
- **Single-tenant managed deployment** — Improves isolation for sensitive fund data.
- **Customer cloud/VPC deployment** — Supports strict governance but complicates upgrades and integrations.
- **On-premises deployment** — Offers maximum control at high support cost.
- **Hybrid control plane/data plane** — Centralizes orchestration while retaining customer-controlled evidence.

### 2.3 Workflow orchestration

- **Application-managed state machine** — Simple for a small workflow.
- **Durable workflow engine such as Temporal** — Strong retries, timers, human pauses, and replay.
- **Cloud-native workflows such as Step Functions** — Deep cloud integration with provider coupling.
- **DAG orchestrator such as Airflow/Dagster** — Strong scheduled data processing, less natural for conversations.
- **Agent graph framework such as LangGraph** — Natural agent loops but requires additional production controls.
- **Message queues plus custom workers** — Flexible and scalable, but much behavior must be implemented manually.

### 2.4 Communication pattern

- **Synchronous request/response** — Easy to reason about for short operations.
- **Asynchronous commands and events** — Better for research, calls, and deadline-bound workflows.
- **Hybrid synchronous/asynchronous** — Matches varied latency at the cost of two interaction models.
- **Event sourcing** — Gives complete history and replay but adds projection and schema complexity.

### 2.5 Multi-tenancy isolation

- **Tenant columns and row-level security** — Economical and operationally simple.
- **Schema per tenant** — Stronger logical separation with migration overhead.
- **Database per tenant** — Strong isolation and restore boundaries at higher cost.
- **Account/VPC per tenant** — Suitable for highly regulated customers but operationally expensive.

---

## 3. Opportunity Card: Canonical Data Model

### 3.1 Canonical representation

- **Markdown file as source of truth** — Human-readable and agent-friendly, but weak for constraints and concurrent updates.
- **Structured database as source of truth with generated Markdown** — Strong validation and querying while retaining readable views.
- **Markdown with typed front matter plus indexed projections** — Preserves the proposed artifact but requires synchronization rules.
- **JSON document as canonical record** — Flexible and machine-friendly, less pleasant for direct human editing.
- **Relational entities as canonical data** — Strong integrity and analytics, but incomplete hypotheses can feel rigid.
- **Temporal knowledge graph as canonical data** — Models provenance and relationships naturally, with greater implementation complexity.
- **Hybrid graph, relational, object, and generated-card model** — Fits varied data types but creates consistency challenges.

### 3.2 Card decomposition

- **One monolithic card per opportunity** — Easy to inspect, harder to update concurrently.
- **Card plus linked detailed artifacts** — Keeps the card concise while preserving depth.
- **Section-level documents** — Enables independent updates but fragments the human record.
- **Generated materialized view over normalized entities** — Avoids duplicated truth but requires rendering infrastructure.

### 3.3 Schema strictness

- **Loose Markdown conventions** — Maximizes agent flexibility.
- **JSON Schema for front matter and structured blocks** — Adds validation without removing narrative text.
- **Fully typed domain schema** — Improves integrity and API generation but raises migration cost.
- **Extensible core plus namespaced extensions** — Balances stability and experimentation.

### 3.4 Card section representation

- **Free-form prose** — Best for nuanced analysis, weakest for automation.
- **Typed tables and fields** — Best for comparison and validation, restrictive for uncertain findings.
- **Structured claims plus generated narrative** — Preserves evidence semantics and readability.
- **Block-based document model** — Supports rich editing and typed content at greater frontend complexity.

### 3.5 Identifier strategy

- **Human-readable sequential IDs** — Easy to reference but difficult across distributed writers.
- **UUID/ULID identifiers** — Safe for distributed creation; ULIDs also sort by time.
- **Content-addressed evidence IDs** — Aid deduplication and tamper detection.
- **Composite tenant/entity identifiers** — Improve locality but expose internal structure.

### 3.6 Card versioning

- **Overwrite with audit log** — Simple current-state reads.
- **Append-only revisions** — Supports reconstruction and review.
- **Git-backed versioning** — Provides familiar diffs but weak transactional semantics.
- **Event-sourced card state** — Offers complete replay with substantial complexity.
- **Bitemporal versioning** — Distinguishes when facts were true from when they were learned.

### 3.7 Concurrent updates

- **Pessimistic section locks** — Prevents conflicts but blocks parallel agents.
- **Optimistic version checks** — Efficient when conflicts are uncommon.
- **Field/section-level merges** — Supports parallel work with merge semantics.
- **CRDT document model** — Enables real-time collaboration at high complexity.
- **Single card-writer service** — Centralizes consistency but may become a bottleneck.

### 3.8 Card status workflow

- **Fixed linear statuses** — Easy to report and enforce.
- **Configurable finite-state machine** — Supports firm-specific processes.
- **Independent workstream states** — Represents parallel research, interview, and legal progress.
- **Event-derived status** — Avoids manual drift but can be harder to interpret.

### 3.9 Facts, hypotheses, contradictions, and unknowns

- **Single claim status enum** — Simple and directly aligned with the card.
- **Separate assertion and evidence entities** — Allows multiple sources to support or contradict one claim.
- **Probabilistic belief state** — Captures uncertainty but may overstate mathematical precision.
- **Argument graph** — Makes supporting and opposing evidence explicit at greater UI complexity.

### 3.10 Evidence linkage granularity

- **Citation to whole source** — Easy to implement, less auditable.
- **Page, paragraph, timestamp, or DOM-span citation** — Improves verification.
- **Immutable extracted evidence snippets** — Protects against source changes but duplicates content.
- **Cryptographic hashes and snapshots** — Improve tamper evidence with storage and copyright considerations.

### 3.11 Claim trust representation

- **Low/medium/high categories** — Easy to communicate.
- **Numeric score** — Supports ranking but invites false precision.
- **Calibrated probability interval** — Better uncertainty semantics but harder to train and explain.
- **Evidence-factor vector** — Shows recency, corroboration, source quality, and extraction confidence separately.
- **No aggregate trust score** — Avoids misleading compression but increases reviewer effort.

### 3.12 Founder Score representation

- **Single persistent score** — Easy to rank but risks permanent, self-reinforcing penalties.
- **Trait vector with dated snapshots** — Preserves nuance and change.
- **Bayesian longitudinal profile** — Handles sparse and evolving evidence but is harder to explain.
- **Opportunity-specific founder assessment only** — Reduces cross-opportunity bias but loses reusable memory.
- **Persistent profile plus opportunity-local interpretation** — Preserves history while separating context.

### 3.13 Independent assessment axes

- **Categorical ratings** — Human-readable and resistant to false precision.
- **Numeric scales** — Easier to sort and learn from.
- **Evidence-weighted distributions** — Express uncertainty at greater complexity.
- **Narrative only** — Preserves nuance but reduces comparability.
- **Never aggregate the axes** — Avoids hidden trade-offs.
- **Allow an explicit decision policy over axes** — Supports ranking while keeping the transformation inspectable.

### 3.14 Term-sheet annotations

- **Inline comments in generated documents** — Familiar to reviewers.
- **Structured annotation objects linked to clauses** — Better for recalculation and auditing.
- **Sidecar explanation document** — Keeps legal text clean but can drift.
- **Interactive term model rendered into legal templates** — Enables counterfactuals with more application complexity.

### 3.15 Card storage

- **Relational database JSON/JSONB** — Flexible and queryable.
- **Document database** — Natural card storage and horizontal scaling.
- **Git/object storage** — Suits Markdown and immutable artifacts.
- **Graph database** — Supports relationship-heavy evidence.
- **Polyglot persistence** — Optimizes each workload but increases operational burden.

---

## 4. People, Company, and Entity Resolution

### 4.1 Founder identity scope

- **Identity local to each opportunity** — Simplest and privacy-preserving.
- **Persistent identity within one fund** — Enables longitudinal memory.
- **Global cross-fund identity** — Improves deduplication but creates major consent and governance risks.
- **Federated identity with tenant-specific views** — Balances reuse and isolation at high complexity.

### 4.2 Entity resolution

- **Deterministic identifiers and exact matching** — Explainable but misses variants.
- **Rules and fuzzy matching** — Practical with manageable review queues.
- **Embedding-based linkage** — Handles noisy profiles but can create opaque false matches.
- **Graph-based probabilistic resolution** — Uses relationship context but is operationally complex.
- **Human-confirmed merge workflow** — Safer for consequential records but slows automation.

### 4.3 Merge and split behavior

- **Irreversible merges** — Simple but dangerous.
- **Reversible linkage records** — Supports correction and audit.
- **Canonical entity plus source-specific identities** — Preserves provenance.
- **Probabilistic identity clusters** — Retains ambiguity but complicates downstream use.

### 4.4 Person-level versus opportunity-level data

- **Store all findings on the founder profile** — Maximizes reuse but may strip context.
- **Store everything on the opportunity** — Preserves context but repeats diligence.
- **Store observations globally and interpretations locally** — Separates evidence from decision context.
- **Copy snapshots into each card** — Improves reproducibility but duplicates data.

---

## 5. Evidence and Memory Store

### 5.1 Evidence architecture

- **Object storage plus metadata database** — Suitable for raw files, recordings, and extracted text.
- **Search index as evidence store** — Strong retrieval, weaker canonical integrity.
- **Knowledge graph** — Strong relationship and contradiction queries.
- **Vector database** — Useful for semantic retrieval but insufficient as canonical storage.
- **Combined object, relational, search, vector, and graph stores** — Broad capability with synchronization overhead.

### 5.2 Temporal modeling

- **Latest value only** — Simple but loses history.
- **Observation timestamps** — Captures when evidence was collected.
- **Valid-time and transaction-time fields** — Supports historical correction and replay.
- **Event log with derived current state** — Strong auditability at additional complexity.

### 5.3 Evidence retention

- **Indefinite retention** — Maximizes institutional memory.
- **Fixed retention by artifact type** — Better privacy and cost control.
- **Tenant-configurable retention** — Supports varied policies.
- **Consent-bound retention** — Improves founder control but complicates derived-model deletion.
- **Legal-hold-aware retention** — Supports disputes and compliance requirements.

### 5.4 Source snapshots

- **Store only URLs** — Low cost but susceptible to link rot and source changes.
- **Store extracted text** — Improves reproducibility.
- **Store complete HTML/PDF/media snapshot** — Strongest audit trail with storage and rights concerns.
- **Store hash and retrieval metadata only** — Proves identity without retaining content.

### 5.5 Contradiction handling

- **Latest source wins** — Simple but unsafe.
- **Source reliability ranking** — Scalable but may encode systematic bias.
- **Retain competing assertions until resolved** — Faithful to uncertainty.
- **Agent adjudication with rationale** — Efficient but requires oversight.
- **Mandatory human resolution for material contradictions** — Safer but slower.

### 5.6 Memory retrieval

- **Keyword search** — Predictable and explainable.
- **Vector similarity** — Finds semantically related evidence.
- **Graph traversal** — Finds relationally relevant evidence.
- **Hybrid retrieval and reranking** — Improves quality with more infrastructure.
- **Model-native long context** — Reduces retrieval plumbing but raises cost and omission risk.

### 5.7 Memory write policy

- **Allow every agent to write directly** — Fast but risks inconsistency.
- **Central evidence-ingestion service** — Enforces provenance and schema.
- **Agent proposals requiring validation** — Improves quality with added latency.
- **Human approval for durable person-level observations** — Limits harmful persistence but reduces automation.

---

## 6. Intake and Document Processing

### 6.1 Inbound channels

- **Email inbox** — Low founder friction, difficult attachment and thread normalization.
- **Form provider** — Fast implementation and structured inputs.
- **Custom portal** — Best experience and consent control, highest build cost.
- **CRM integration** — Fits existing fund workflows but inherits vendor data models.
- **API and webhooks** — Supports partners and accelerators.

### 6.2 Minimum intake requirements

- **Company name and deck only** — Lowest friction but produces many unknowns.
- **Short structured application** — Improves normalization.
- **Full diligence questionnaire** — Reduces research ambiguity but burdens founders.
- **Progressive requests based on value of information** — Minimizes unnecessary questions but requires mature orchestration.

### 6.3 File ingestion

- **Managed parsing service** — Rapid support for varied formats.
- **Open-source parsers and OCR** — Greater control and privacy.
- **Multimodal model extraction** — Handles visual decks but may be expensive and inconsistent.
- **Hybrid deterministic parsing plus model interpretation** — Balances structure and robustness.

### 6.4 Extraction model

- **Single general LLM** — Simple and flexible.
- **Document-type-specific extractors** — Higher precision at greater maintenance cost.
- **Schema-constrained LLM output** — Reduces malformed data.
- **Rules first, LLM fallback** — Controls cost and hallucination risk.
- **Human review for low-confidence fields** — Improves accuracy but adds operations.

### 6.5 Duplicate opportunities

- **Exact company/domain matching** — Simple.
- **Founder and company entity-resolution matching** — Handles renamed and stealth companies.
- **Human-confirmed duplicate queue** — Safer for ambiguous cases.
- **Allow linked parallel opportunities** — Preserves genuinely distinct ideas from the same team.

### 6.6 Raw artifact preservation

- **Preserve all originals** — Strong reproducibility.
- **Preserve only normalized outputs** — Reduces storage and exposure.
- **Policy-based preservation** — Balances auditability and minimization.
- **Encrypted archival tier** — Retains evidence with reduced routine access.

---

## 7. Outbound Sourcing

### 7.1 Source acquisition

- **Licensed APIs such as Harmonic** — Reliable and contractually clearer.
- **Public APIs and feeds** — Lower cost but incomplete coverage.
- **Compliant web crawling** — Broad coverage with legal and maintenance risk.
- **Data vendors** — Fast enrichment but may reproduce vendor bias.
- **Partnership feeds** — High-quality signals with business-development dependency.
- **Manual analyst-curated sources** — High precision but limited scale.

### 7.2 Signal types

- **Company-level events** — Easy to operationalize, often late.
- **Founder career transitions** — Earlier signals but privacy-sensitive.
- **GitHub and technical activity** — Useful for technical founders, biased against private work.
- **Papers and patents** — Strong deep-tech signals, weak for many sectors.
- **Social activity** — Timely but noisy and culturally biased.
- **Hackathons, launches, and accelerators** — Concrete but ecosystem-dependent.
- **Referrals** — High precision while perpetuating network effects.

### 7.3 Sourcing ranking

- **Rule-based thesis filters** — Transparent and controllable.
- **Supervised model from historical decisions** — Personalized but may reproduce historical bias.
- **Similarity to successful portfolio companies** — Intuitive but narrows novelty.
- **Exploration/exploitation bandit** — Supports discovery but complicates fairness and evaluation.
- **Diversity-aware ranking constraints** — Counters visibility bias but requires careful objective design.

### 7.4 Outreach

- **Human-written outreach** — Highest control, lowest scale.
- **AI-drafted and human-approved outreach** — Improves throughput.
- **Bounded automated outreach** — Scales but risks spam and reputational damage.
- **No outreach; analyst alert only** — Limits risk but delays founder engagement.

---

## 8. Agent Architecture

### 8.1 Agent topology

- **Single general-purpose agent** — Fast to prototype, difficult to govern.
- **Specialized agents by domain** — Improves prompts and access control.
- **Planner-worker-reviewer hierarchy** — Adds quality checks and decomposition.
- **Blackboard architecture over the Opportunity Card** — Encourages collaboration through shared state.
- **Market of agents with scoring/gating** — Supports competing analyses at high cost and complexity.

### 8.2 Agent execution

- **Static pipelines** — Predictable and testable.
- **Dynamic tool-calling loops** — Flexible but harder to bound.
- **Plan-then-execute** — Improves traceability but plans can become stale.
- **ReAct-style iteration** — Adapts quickly but may meander.
- **Budgeted search tree** — Explores alternatives at high token and latency cost.

### 8.3 Agent state

- **Prompt context only** — Simple but transient.
- **Workflow-local state store** — Supports resumability.
- **Opportunity Card as shared state** — Aligns agents around the key artifact.
- **Private agent scratchpads plus validated shared writes** — Reduces contamination while preserving collaboration.
- **Event log as state** — Maximizes replay and auditability.

### 8.4 Model strategy

- **One hosted frontier model** — Simplifies integration and often maximizes quality.
- **Multiple providers by task** — Reduces dependency and allows cost optimization.
- **Open-weight self-hosted models** — Improves control and privacy.
- **Small-model routing with frontier escalation** — Reduces cost but requires reliable routing.
- **Fine-tuned domain models** — Improves consistency if enough high-quality data exists.
- **Model ensemble or critique** — Reduces single-model errors at increased cost.

### 8.5 Tool permissions

- **Shared broad tool access** — Simplifies implementation.
- **Least-privilege tools per agent** — Reduces data leakage and unintended actions.
- **Capability tokens scoped to task and time** — Stronger runtime control.
- **Sandboxed execution** — Supports code and browsing with isolation.
- **Human approval before side effects** — Safer for calls, messages, purchases, and data changes.

### 8.6 Output validation

- **Prompt-only formatting** — Fast but brittle.
- **Schema-constrained generation** — Improves structural reliability.
- **Deterministic validators** — Enforces dates, IDs, ranges, and citations.
- **Second-model critique** — Detects semantic issues but shares model weaknesses.
- **Human review based on confidence/risk** — Focuses effort on consequential outputs.

### 8.7 Research stopping criteria

- **Fixed step or token budget** — Predictable cost.
- **Deadline-based stopping** — Aligns with the 24-hour objective.
- **Confidence threshold** — Stops when evidence appears sufficient.
- **Value-of-information threshold** — Stops when additional investigation is unlikely to change the decision.
- **Human-controlled stop** — Gives reviewers discretion.

### 8.8 Agent failure behavior

- **Retry automatically** — Handles transient faults.
- **Fallback model or provider** — Improves resilience.
- **Degrade to partial card with explicit unknowns** — Preserves honesty and deadlines.
- **Escalate to human** — Appropriate for material uncertainty.
- **Abort stage atomically** — Protects consistency but may waste completed work.

---

## 9. Research and Active Diligence

### 9.1 Research prioritization

- **Fixed diligence checklist** — Consistent and auditable.
- **Thesis-weighted checklist** — Aligns research with fund strategy.
- **Risk-based investigation** — Focuses on likely failure modes.
- **Value-of-information planning** — Optimizes decision impact under time constraints.
- **Agent-generated hypotheses** — Adapts to each opportunity but needs validation.

### 9.2 Research parallelism

- **Serial stages** — Simplifies dependencies.
- **Parallel domain agents** — Reduces elapsed time.
- **Dependency-aware DAG** — Avoids redundant work.
- **Speculative parallel research** — Maximizes speed at higher cost.

### 9.3 External web research

- **Search-provider APIs** — Stable, structured access.
- **Browser automation** — Handles dynamic sites but is fragile.
- **Curated trusted-source allowlist** — Improves quality but misses emerging evidence.
- **Open web with source-quality scoring** — Broad but vulnerable to misinformation.
- **Licensed datasets** — Reliable but costly.

### 9.4 Market assessment

- **Analyst-authored market model** — High quality, low scale.
- **LLM synthesis over sourced reports** — Fast but dependent on source quality.
- **Structured market databases** — Comparable but incomplete for novel markets.
- **Bottom-up deterministic calculations** — Inspectable but input-intensive.
- **Scenario distributions** — Represent uncertainty but complicate communication.

### 9.5 Technical feasibility

- **General LLM review** — Broad and fast.
- **Domain-specific model or agent** — Better depth in supported fields.
- **External expert network** — Higher confidence but slower and costly.
- **Code/repository analysis** — Strong for implemented systems, weak for undeveloped concepts.
- **Simulation or benchmark execution** — Concrete evidence where feasible.
- **Privacy-preserving decomposed review** — Protects confidential ideas but may lose system context.

### 9.6 Reference checks

- **Founder-provided references only** — Easier consent and coordination.
- **Back-channel references** — Potentially candid but ethically and legally sensitive.
- **Automated voice calls** — Scalable but require disclosure and consent controls.
- **Written surveys** — Easier records, less adaptive.
- **Human-conducted calls** — Better judgment at higher cost.
- **No references until conditional approval** — Reduces unnecessary intrusion.

### 9.7 Background checks

- **Specialist compliant provider** — Stronger legal process.
- **Public-record research agents** — Flexible but risky and incomplete.
- **Founder-supplied verification** — Transparent but potentially selective.
- **Limit checks to role-relevant claims** — Minimizes privacy intrusion.
- **Broad screening** — May reduce risk but creates fairness and compliance concerns.

### 9.8 Sensitive-information access

- **All agents receive full context** — Maximizes reasoning quality.
- **Role-scoped context** — Applies least privilege.
- **Redacted or pseudonymized context** — Reduces bias and exposure.
- **Confidential-compute environment** — Strengthens protection at infrastructure cost.
- **No external-model access to sensitive artifacts** — Improves privacy but limits model options.

---

## 10. Investment Thesis Modeling

### 10.1 Thesis representation

- **Human-authored rules and weights** — Transparent and controllable.
- **Natural-language thesis interpreted at runtime** — Flexible but inconsistent.
- **Structured scorecard** — Comparable and auditable.
- **Learned model from historical decisions** — Captures implicit preferences.
- **Hybrid explicit constraints plus learned ranking** — Combines governance and personalization.
- **Knowledge graph of beliefs and precedents** — Supports nuanced reasoning at high modeling cost.

### 10.2 Learning target

- **Past invest/decline decisions** — Abundant but reflects historical bias.
- **Issued term sheets** — Captures serious intent but not ultimate quality.
- **Signed term sheets** — Captures conversion but includes negotiation effects.
- **Portfolio outcomes** — More meaningful but delayed, sparse, and confounded.
- **Human preference comparisons** — Directly trains ranking but requires repeated labeling.
- **Multi-task model across decisions and outcomes** — Uses more signals but complicates interpretation.

### 10.3 Thesis model type

- **Linear weighted scorecard** — Maximally interpretable.
- **Decision trees or gradient boosting** — Strong tabular performance with partial explainability.
- **Learning-to-rank model** — Matches opportunity prioritization.
- **Graph neural network** — Exploits relationship data but is opaque.
- **Fine-tuned language model** — Handles qualitative records but is difficult to calibrate.
- **Case-based reasoning** — Explains through comparable opportunities.

### 10.4 Hard constraints versus preferences

- **Hard-filter all thesis constraints** — Efficient but may miss exceptional outliers.
- **Treat all criteria as soft preferences** — Preserves exploration but increases noise.
- **Configurable hard and soft criteria** — Offers control with added policy complexity.
- **Exception pathway requiring human approval** — Supports outliers while preserving discipline.

### 10.5 Missing data

- **Impute values** — Keeps models operational but may fabricate certainty.
- **Explicit unknown features** — Preserves uncertainty.
- **Ask the founder** — Can resolve key gaps but adds friction.
- **Route to additional research** — Maintains independence at cost.
- **Calculate score intervals** — Shows outcome bounds under missing inputs.

### 10.6 Explainability

- **Feature contribution methods** — Useful for tabular models.
- **Rule trace** — Strong for deterministic scorecards.
- **Comparable historical cases** — Intuitive but potentially misleading.
- **Natural-language rationale with citations** — Accessible but must be checked against the actual model.
- **Counterfactual analysis** — Shows what evidence would change the result.

### 10.7 Model updating

- **Manual thesis versions** — Stable and auditable.
- **Scheduled retraining** — Incorporates new data predictably.
- **Online learning** — Adapts quickly but risks drift.
- **Shadow evaluation before promotion** — Safer but slower.
- **Per-fund models** — Personalized with limited data.
- **Shared base model plus fund-specific calibration** — Improves cold start but raises data-isolation concerns.

---

## 11. Founder and Team Assessment

### 11.1 Assessment scope

- **Structured interview evidence only** — Limits privacy and bias exposure.
- **Interview plus founder-submitted materials** — Adds context with consent.
- **Public text and social activity** — Expands evidence but may encode visibility bias.
- **Audio analysis** — Captures conversational behavior but can be culturally sensitive.
- **Video/computer-vision analysis** — Adds nonverbal signals with substantial scientific, ethical, and legal risk.
- **Team interaction analysis only** — Focuses on observable collaboration rather than inferred personality.

### 11.2 Personality framework

- **Big Five** — Well studied and broadly interpretable.
- **Entrepreneurship-specific competency rubric** — More decision-relevant but may be less validated.
- **Behavioral anchors without trait labels** — Reduces overclaiming.
- **Values and working-style compatibility** — Better for investor fit but potentially intrusive.
- **No personality inference** — Avoids questionable validity while retaining structured behavioral evidence.

### 11.3 Interview design

- **Standardized question set** — Comparable and easier to validate.
- **Adaptive hypothesis-driven questions** — Resolves opportunity-specific uncertainty.
- **Scenario simulations** — Reveals reasoning under constraints.
- **Cross-founder consistency questions** — Detects alignment and contradictions.
- **Team exercises** — Observes interaction but increases scheduling burden.
- **Founder-selected evidence demonstrations** — Gives candidates agency but may reduce comparability.

### 11.4 Question transparency

- **Disclose exact rubric** — Maximizes transparency but increases gaming.
- **Disclose evaluated dimensions, not exact questions** — Balances fairness and robustness.
- **Keep rubric confidential** — Reduces gaming but weakens contestability.
- **Publish validated sample questions** — Sets expectations without exposing the entire instrument.

### 11.5 Behavioral interpretation

- **Model-generated labels** — Scalable but potentially reductive.
- **Evidence excerpts plus cautious inference** — More auditable.
- **Human-reviewed conclusions** — Safer but costly.
- **No automated adverse recommendation from behavioral signals** — Limits harm.
- **Use behavior only to generate follow-up questions** — Retains utility without direct scoring.

### 11.6 Team compatibility

- **Trait complementarity score** — Easy to compare but scientifically contestable.
- **Observed interaction metrics** — More grounded in actual behavior.
- **Conflict scenario performance** — Tests decision-making under pressure.
- **Founder-reported working norms** — Low-cost but self-reported.
- **Longitudinal interaction evidence** — Stronger signal but unavailable in a 24-hour process.

### 11.7 Investor-founder fit

- **Explicit working-style questionnaire on both sides** — Transparent and symmetric.
- **Infer investor preferences from history** — Low effort but potentially opaque.
- **Partner-specific matching** — More relevant than fund-level averages.
- **Do not score fit; surface mismatches only** — Avoids turning cultural similarity into a gate.

### 11.8 Cold-start fairness

- **Confidence penalties for sparse evidence** — Honest but may systematically disadvantage less-visible founders.
- **Neutral priors with wider uncertainty** — Avoids treating absence as weakness.
- **Additional evidence-acquisition budget** — Compensates for sparse public footprints.
- **Blind or redacted initial review** — Reduces some identity bias.
- **Evidence-volume normalization** — Limits advantage from extensive online presence.

### 11.9 Contestability

- **No correction mechanism** — Simplest but unfair for consequential errors.
- **Founder correction portal** — Supports factual corrections.
- **Appeal and human review** — Appropriate for material disputes.
- **Attach founder response to disputed claims** — Preserves both perspectives.
- **Delete or suppress contested behavioral inferences** — Reduces harm but may weaken audit history.

---

## 12. Voice and Video Interview Stack

### 12.1 Communication channel

- **Web-based audio interview** — Strong consent and interface control.
- **Telephone via Twilio** — Broad accessibility and easy outbound calling.
- **Video conferencing integration** — Supports team observation but increases privacy complexity.
- **Asynchronous voice responses** — Easier scheduling but less adaptive.
- **Text chat** — Cheapest and easiest to audit, weakest for conversational behavior.

### 12.2 Voice stack

- **Managed conversational platform such as ElevenLabs** — Fast, natural voice experience.
- **Twilio plus separate STT/TTS/LLM services** — Greater control and provider flexibility.
- **Open-source real-time stack** — Improves privacy and customization.
- **Human interviewer with AI copilot** — Better judgment but limited scalability.

### 12.3 Speech recognition

- **Provider-integrated STT** — Simple and low latency.
- **Specialized transcription API** — Potentially better accuracy and diarization.
- **Self-hosted transcription** — Better data control.
- **Dual transcription and reconciliation** — Higher accuracy at increased cost.

### 12.4 Real-time interaction

- **Turn-based conversation** — Easier to implement.
- **Full-duplex streaming with interruption** — More natural but technically complex.
- **Push-to-talk** — Reduces overlap errors at usability cost.
- **Latency-buffered responses** — Improves response quality while reducing naturalness.

### 12.5 Recording

- **Store full audio/video** — Best auditability and model-improvement value.
- **Store transcript only** — Reduces sensitive biometric retention.
- **Store structured notes and cited clips** — Minimizes data but limits review.
- **Tenant-configurable recording policy** — Supports jurisdictional variation.

### 12.6 Consent

- **One-time platform consent** — Low friction but potentially insufficient.
- **Per-call verbal and written consent** — Stronger evidence.
- **Jurisdiction-aware consent flow** — Better compliance at greater implementation effort.
- **Disable recording where consent is unavailable** — Preserves access with reduced auditability.

### 12.7 Transcript-to-card writes

- **Direct automated extraction** — Fast but error-prone.
- **Extract candidate claims requiring validation** — Safer.
- **Link transcript spans to claim objects** — Strong provenance.
- **Human-approved interview summary** — High quality at operational cost.

### 12.8 Adversarial conversation handling

- **Prompt-level instructions** — Easy but unreliable.
- **Explicit conversation state machine** — Better control over refusals and interruptions.
- **Policy engine for prohibited behavior** — Enforces disclosure and honesty.
- **Human takeover** — Handles edge cases but requires availability.
- **End call safely on policy conflict** — Protects compliance at the cost of completion.

---

## 13. Scoring, Confidence, and Recommendations

### 13.1 Recommendation form

- **Proceed/hold/decline/invest categories** — Simple and action-oriented.
- **Ranked queue only** — Avoids false binary certainty.
- **Scenario-dependent recommendation** — Shows sensitivity to unresolved evidence.
- **Recommendation plus dissenting agent views** — Exposes disagreement.
- **No automated recommendation** — Limits system to evidence synthesis.

### 13.2 Confidence meaning

- **Confidence in evidence completeness** — Matches the card definition.
- **Confidence in recommendation correctness** — More intuitive but difficult to calibrate.
- **Probability of investment success** — Potentially useful but generally unsupported.
- **Separate evidence, model, and decision confidence** — More precise but more complex.

### 13.3 Score calibration

- **No formal calibration** — Faster MVP.
- **Retrospective calibration against verified claims** — Improves trust scores.
- **Calibration against investment decisions** — Measures imitation, not quality.
- **Calibration against outcomes** — Meaningful but delayed.
- **Human confidence benchmarking** — Provides a useful comparison but requires study design.

### 13.4 Ranking policy

- **Recommendation score** — Efficient but collapses nuanced axes.
- **Pareto frontier over independent axes** — Preserves trade-offs.
- **Fund-configured utility function** — Makes trade-offs explicit.
- **Human-sortable filters** — Avoids opaque aggregation.
- **Multi-objective ranking with explanations** — Supports scale at added complexity.

---

## 14. Term-Sheet Generation

### 14.1 Document-generation approach

- **LLM-generated term sheet** — Flexible but unsafe for material legal language.
- **Approved legal templates with populated variables** — Reproducible and safer.
- **Clause library with controlled assembly** — Supports variation with governance.
- **External legal document platform integration** — Reduces build scope but adds dependency.
- **Human counsel drafts from structured recommendation** — Safest but slower.

### 14.2 Legal template ownership

- **Platform-standard templates** — Easy to support but may not fit every fund.
- **Customer-uploaded templates** — Preserves firm practice.
- **Jurisdiction-specific template library** — Broad support with maintenance burden.
- **Counsel-managed templates** — Strong governance but creates operational dependency.

### 14.3 Numeric term generation

- **Human-entered values only** — Maximum control.
- **Deterministic spreadsheet-like model** — Inspectable and recalculable.
- **Rule-based term policy** — Consistent and easy to audit.
- **Optimization model** — Handles multi-term trade-offs.
- **Learned model from precedent deals** — Captures practice but may reproduce unfair or outdated terms.
- **Agent recommendation constrained by validated equations** — Adds flexibility while protecting calculations.

### 14.4 Term model scope

- **Valuation, investment, and ownership only** — MVP-friendly.
- **Add option pool and dilution** — Captures major economic effects.
- **Add liquidation and anti-dilution terms** — Improves economic completeness.
- **Add governance and control rights** — Necessary for realistic negotiation but legally complex.
- **Full term-sheet surface** — Most complete, highest legal and modeling burden.

### 14.5 Risk-to-term mapping

- **No automatic mapping** — Avoids mechanically penalizing uncertainty.
- **Explicit fund-authored rules** — Transparent and governable.
- **Scenario-based suggestions** — Shows possibilities without asserting one answer.
- **Optimization over approved utility functions** — Formal but sensitive to specification errors.
- **Historical precedent mapping** — Familiar but can entrench past practice.

### 14.6 Calculations

- **Application code** — Versionable and testable.
- **Spreadsheet engine** — Familiar to investors and easy to inspect.
- **Rules/decision engine** — Allows non-engineers to configure policies.
- **Optimization solver** — Useful for multi-variable constraints.
- **External cap-table platform integration** — Reduces calculation risk but introduces dependency.

### 14.7 Counterfactuals

- **Static rationale only** — Easy to implement.
- **Interactive assumption editing** — Lets reviewers inspect sensitivity.
- **Scenario comparison table** — Easier to audit than free-form changes.
- **Real-time recalculation during calls** — Powerful but raises authority and reliability risks.

### 14.8 Approval and signatures

- **Export to Word/PDF** — Simple and counsel-friendly.
- **Integrated document editor** — Better workflow with significant build cost.
- **E-signature integration** — Streamlines execution.
- **Push to existing legal/CRM system** — Fits firm operations.
- **No execution support** — Keeps the product advisory.

---

## 15. Negotiation Model

### 15.1 Negotiation role

- **Generate a human playbook only** — Lowest risk.
- **Live human copilot** — Provides suggestions without speaking.
- **Agent gathers information but cannot offer terms** — Useful for diligence and quote collection.
- **Agent negotiates within approved ranges** — Compresses cycles while preserving bounded authority.
- **Agent can provisionally agree subject to approval** — Improves convergence but may create expectation risk.
- **Fully autonomous agreement** — Maximum speed and maximum legal/reputational exposure.

### 15.2 Utility representation

- **Per-term hard ranges** — Easy to govern but ignores trade-offs.
- **Weighted additive utility** — Simple and interpretable.
- **Nonlinear utility functions** — Models threshold and interaction effects.
- **Weighted Nash bargaining** — Incorporates BATNAs and joint surplus.
- **Multi-attribute optimization** — Supports complex term surfaces.
- **Human-authored concession ladder** — Practical and predictable.

### 15.3 BATNA representation

- **User-entered BATNA** — Transparent but potentially stale.
- **Evidence-derived BATNA estimate** — Adaptive but uncertain.
- **Scenario range rather than point estimate** — Better reflects ambiguity.
- **Do not estimate counterparty BATNA** — Avoids overclaiming but reduces strategic modeling.
- **Update beliefs from verified conversation evidence** — Improves responsiveness with provenance requirements.

### 15.4 Counterparty modeling

- **No counterparty model** — Simplifies and reduces manipulation concerns.
- **Term-by-term inferred reservation ranges** — Useful but uncertain.
- **Behavioral model from conversation** — Adaptive but potentially biased.
- **Historical founder cohort model** — Data-driven but may stereotype.
- **Explicitly ask preferences and priorities** — Transparent but strategically revealing.

### 15.5 Concession policy

- **Fixed concession schedule** — Predictable.
- **Utility-preserving trade-offs** — More efficient across multiple terms.
- **Reciprocity-based concessions** — Familiar but can stall.
- **Time-dependent concessions** — Handles deadlines but may be gamed.
- **Learned negotiation policy** — Potentially effective but difficult to verify.

### 15.6 Negotiation authority

- **Immutable approved terms** — Agent can explain but not change.
- **Per-term ranges** — Straightforward bounded authority.
- **Global utility floor** — Allows creative trade-offs but is harder to inspect.
- **Named changes requiring escalation** — Protects sensitive clauses.
- **Turn-level human approval** — Maximum control with poor conversational speed.

### 15.7 Honesty and leverage

- **Use only card-verified facts** — Strongest auditability.
- **Allow clearly labeled estimates** — Adds flexibility without misrepresentation.
- **Allow rhetorical framing but no fabricated claims** — More natural but harder to police.
- **Prohibit unsupported urgency, scarcity, bids, or authority claims** — Reduces deceptive behavior.
- **Real-time policy checker over every utterance** — Strong enforcement with latency cost.

### 15.8 Negotiation completion

- **Agreement on all terms** — Clear but may prolong calls.
- **Structured list of agreed and unresolved terms** — Supports partial convergence.
- **Callback or human escalation state** — Handles authority gaps.
- **Automatic timeout and summary** — Controls cost.
- **Provisional agreement subject to counsel** — Reflects real VC practice.

### 15.9 Audit trail

- **Transcript only** — Easy to retain but hard to analyze.
- **Structured offer/counteroffer ledger** — Enables precise reconstruction.
- **Evidence link for each concession** — Strong auditability.
- **Cryptographically signed negotiation events** — Strong tamper evidence at greater complexity.
- **Human-readable post-call rationale** — Useful but cannot replace machine-readable history.

---

## 16. Investor Workspace

### 16.1 Primary interface

- **Opportunity pipeline/kanban** — Familiar workflow view.
- **Ranked inbox** — Optimized for triage.
- **Opportunity Card document view** — Centers the canonical artifact.
- **Evidence graph explorer** — Supports deep diligence.
- **Term-sheet workbench** — Centers decision and counterfactual modeling.
- **Conversational analyst interface** — Flexible but may obscure state and provenance.

### 16.2 Reviewer workflow

- **Read-only report plus approve/decline** — Simple.
- **Inline card editing and annotations** — Supports collaboration.
- **Claim-by-claim verification queue** — Strong governance but slower.
- **Risk-based review queue** — Focuses attention on material issues.
- **Scenario comparison and assumption controls** — Helps inspect term derivation.

### 16.3 Provenance UI

- **Hover citations** — Fast verification.
- **Split-pane source viewer** — Better for detailed review.
- **Evidence timeline** — Shows how beliefs changed.
- **Argument map** — Shows supporting and contradictory evidence.
- **Source reliability indicators** — Useful but may imply unwarranted authority.

### 16.4 Notifications

- **Email and Slack alerts** — Fits common workflows.
- **In-app notifications** — Centralized but easy to miss.
- **Deadline-driven escalation** — Supports the 24-hour promise.
- **Webhook/API notifications** — Enables integration.
- **No proactive alerts** — Simpler but risks stalled opportunities.

### 16.5 Collaboration

- **Single decision owner** — Clear accountability.
- **Role-based comments and approvals** — Supports partnership processes.
- **Voting workflow** — Matches some investment committees.
- **Consensus or quorum rules** — Formalizes governance.
- **External counsel/founder guest access** — Improves collaboration with additional security complexity.

---

## 17. Founder Experience

### 17.1 Founder portal

- **No portal; email and calls only** — Lowest build cost.
- **Status and document portal** — Improves transparency.
- **Evidence correction portal** — Enables contestability.
- **Interactive diligence checklist** — Helps close gaps but can recreate long-form friction.
- **Term negotiation workspace** — Supports structured convergence.

### 17.2 Information requests

- **Static checklist** — Predictable.
- **Adaptive requests based on decision impact** — Minimizes burden.
- **Founder-controlled data room connection** — Preserves control.
- **Automatic third-party enrichment** — Reduces founder work with privacy concerns.

### 17.3 Decision explanations

- **Simple decision notice** — Operationally easy.
- **High-level factor summary** — More useful without exposing sensitive models.
- **Claim-level evidence report** — Supports correction.
- **Full term rationale and counterfactuals** — Maximizes transparency.
- **Human debrief option** — Improves trust at higher cost.

### 17.4 Founder data rights

- **Correction only** — Supports accuracy.
- **Access and export** — Improves transparency.
- **Deletion requests** — Supports privacy but conflicts with audit obligations.
- **Restriction of processing** — Allows partial control.
- **Consent withdrawal for future reuse** — Limits model and memory use.

---

## 18. APIs and Integrations

### 18.1 CRM integration

- **Build native CRM functionality** — Full control but duplicates mature products.
- **Integrate with Affinity, Salesforce, HubSpot, or Attio** — Fits existing workflows.
- **Bidirectional synchronization** — Reduces duplicate work but creates conflict-resolution needs.
- **One-way export only** — Simpler and safer.
- **No CRM integration for MVP** — Speeds development but weakens adoption.

### 18.2 Data-room integration

- **Direct file upload** — Simple.
- **Google Drive/Dropbox/Box integration** — Convenient but permission-sensitive.
- **Virtual data room integrations** — Better for formal diligence.
- **Read-only links with expiring access** — Supports founder control.
- **Copy artifacts into platform storage** — Improves reproducibility but duplicates sensitive data.

### 18.3 Identity and authentication

- **Passwordless email login** — Low friction.
- **Enterprise SSO/SAML/OIDC** — Needed for larger firms.
- **Founder magic links** — Convenient for external users.
- **Passkeys/MFA** — Stronger account protection.
- **Customer-managed identity** — Better enterprise governance.

### 18.4 Legal and signature systems

- **DocuSign/Adobe Sign** — Mature execution flow.
- **Ironclad/Contractbook integration** — Supports contract lifecycle management.
- **Word/Google Docs export** — Familiar editing.
- **Cap-table platform integration** — Aligns ownership calculations and closing.
- **No direct legal-system integration** — Limits scope.

### 18.5 Communications

- **Twilio** — Broad voice/SMS capabilities.
- **ElevenLabs managed agents** — Strong voice naturalness.
- **Zoom/Teams/Meet integrations** — Fits scheduled interviews.
- **Email provider integration** — Supports intake and follow-up.
- **Slack/Teams internal notifications** — Fits investor collaboration.

### 18.6 External expert marketplace

- **Build expert network** — Differentiated but operationally heavy.
- **Integrate expert-network provider** — Faster with cost and confidentiality concerns.
- **Customer-supplied expert list** — More trusted but limited.
- **No external experts; escalate to humans** — Simpler MVP.

### 18.7 Public API

- **No external API initially** — Reduces security surface.
- **Read-only card API** — Supports analytics and CRM use.
- **Full workflow API** — Enables platform embedding.
- **Webhook event API** — Supports asynchronous integration.
- **Agent/tool protocol support such as MCP** — Simplifies extensibility but requires strict permissioning.

---

## 19. Backend and Data Technology

### 19.1 Backend language

- **TypeScript/Node.js** — Strong web ecosystem and shared frontend types.
- **Python** — Strongest AI, data, and scientific ecosystem.
- **Go** — Efficient concurrency and deployment.
- **Java/Kotlin** — Mature enterprise tooling and type safety.
- **Polyglot services** — Allows task-specific choices but raises operational complexity.

### 19.2 API style

- **REST** — Familiar and cacheable.
- **GraphQL** — Flexible for card and evidence views.
- **gRPC** — Efficient internal service communication.
- **Event/API hybrid** — Fits long-running workflows.
- **Generated typed RPC such as tRPC** — Efficient for a TypeScript stack.

### 19.3 Primary database

- **PostgreSQL** — Strong transactions, JSONB, extensions, and ecosystem.
- **Document database such as MongoDB** — Natural for evolving cards.
- **Distributed SQL** — Supports multi-region resilience at greater complexity.
- **Graph database as primary** — Strong relationship modeling, weaker general transaction ergonomics.
- **Cloud-native key-value/document store** — Scales easily with query constraints.

### 19.4 Graph storage

- **Relational tables and recursive queries** — Avoids another database.
- **PostgreSQL graph extension** — Adds graph capability within the primary store.
- **Neo4j** — Mature graph querying and visualization.
- **Amazon Neptune or similar managed graph** — Reduces operations.
- **No graph database until query demand is proven** — Avoids premature complexity.

### 19.5 Vector storage

- **PostgreSQL pgvector** — Operational simplicity.
- **Dedicated vector database** — Better scale and retrieval features.
- **Search engine vector support** — Combines lexical and semantic retrieval.
- **Provider-hosted vector store** — Fastest integration with vendor lock-in.
- **No persistent embeddings** — Reduces complexity and privacy exposure.

### 19.6 Search

- **Database full-text search** — Simple for early scale.
- **OpenSearch/Elasticsearch** — Powerful filtering and relevance.
- **Typesense/Meilisearch** — Easier developer experience.
- **Hybrid search service** — Best retrieval quality with added complexity.

### 19.7 Blob storage

- **Cloud object storage** — Durable and economical.
- **Customer-controlled object storage** — Improves data sovereignty.
- **Encrypted document database attachments** — Simplifies access but may not scale as well.
- **Content-addressed immutable storage** — Improves deduplication and integrity.

### 19.8 Cache and queues

- **Redis** — Versatile for caching and lightweight queues.
- **Managed message bus such as SQS/Pub/Sub/Service Bus** — Durable and scalable.
- **Kafka** — Strong event streaming and replay at higher operational cost.
- **Database-backed job queue** — Simple for modest scale.
- **Workflow-engine task queues** — Consolidates orchestration.

### 19.9 Rule and policy engine

- **Application code** — Simple and version-controlled.
- **JSON/YAML declarative rules** — Customer-configurable.
- **OPA/Rego** — Strong authorization and policy semantics.
- **Business rule engine** — Supports nontechnical users but adds platform complexity.
- **Decision tables** — Highly inspectable for thesis and approval rules.

---

## 20. Frontend Technology

### 20.1 Web application

- **React/Next.js** — Broad ecosystem and strong full-stack options.
- **Vue/Nuxt** — Simpler component model.
- **Svelte/SvelteKit** — Lean runtime and developer ergonomics.
- **Enterprise low-code UI** — Fast internal MVP with customization limits.

### 20.2 Opportunity Card editor

- **Plain Markdown editor** — Closest to the proposed format.
- **Rich-text editor with Markdown serialization** — Better usability with conversion complexity.
- **Structured block editor such as ProseMirror/Lexical** — Supports typed sections and annotations.
- **Form-driven editor plus generated narrative** — Strong validation but less flexible.
- **Read-only generated card with edits through structured controls** — Protects canonical consistency.

### 20.3 Real-time updates

- **Polling** — Simple.
- **Server-sent events** — Good for agent progress streams.
- **WebSockets** — Supports interactive calls and collaboration.
- **Realtime database service** — Speeds development with vendor dependency.
- **No real-time collaboration** — Reduces complexity.

### 20.4 Visualization

- **Tables and timelines only** — Clear and accessible.
- **Knowledge graph visualization** — Useful for complex relationships but can overwhelm users.
- **Confidence and scenario charts** — Clarify uncertainty.
- **Negotiation frontier visualization** — Explains trade-offs but requires sophisticated modeling.
- **Source heatmaps** — Show evidence concentration and gaps.

---

## 21. Security Architecture

### 21.1 Encryption

- **Provider-managed encryption keys** — Operationally simple.
- **Customer-managed keys** — Stronger enterprise control.
- **Per-tenant envelope encryption** — Limits blast radius.
- **Field-level encryption for sensitive attributes** — Protects especially sensitive data.
- **Client-side encryption** — Strong confidentiality but limits server-side processing.

### 21.2 Authorization

- **Basic role-based access control** — Simple and familiar.
- **Attribute-based access control** — Supports tenant, opportunity, source, and purpose restrictions.
- **Relationship-based access control** — Fits teams, advisors, founders, and counsel.
- **Policy-as-code authorization** — Auditable and testable.
- **Artifact-level access control** — Necessary for scoped diligence but operationally complex.

### 21.3 Secrets

- **Cloud secret manager** — Standard managed option.
- **Vault** — Strong control and dynamic credentials.
- **Environment variables** — Simple but weak for mature deployments.
- **Per-tenant integration credentials** — Improves isolation with management overhead.

### 21.4 Agent sandboxing

- **No code execution** — Safest but limits technical diligence.
- **Container sandbox** — Flexible and isolated.
- **MicroVM sandbox** — Stronger isolation at greater cost.
- **Managed code interpreter** — Fast integration with vendor dependency.
- **Network-restricted sandbox** — Limits data exfiltration.

### 21.5 Data-loss prevention

- **Prompt and output scanning** — Detects obvious sensitive data.
- **Policy-based redaction before model calls** — Reduces external exposure.
- **Tenant-specific allowlists** — Controls destinations.
- **No external model calls for restricted data** — Strong boundary.
- **Human approval for sensitive exports** — Adds governance.

### 21.6 Audit logs

- **Application action logs** — Basic accountability.
- **Immutable append-only audit store** — Stronger tamper resistance.
- **Prompt, tool, and model-output logs** — Enables AI reconstruction but stores sensitive content.
- **Redacted audit logs** — Protect privacy at reduced forensic detail.
- **Customer-exportable audit trail** — Supports enterprise review.

### 21.7 Threat model

- **Conventional application threats only** — Smaller scope.
- **Include prompt injection and malicious documents** — Necessary for agentic research.
- **Include model/data exfiltration** — Important for confidential deals.
- **Include impersonation and voice fraud** — Important for automated calling.
- **Include negotiation manipulation and authority escalation** — Critical for autonomous external actions.

---

## 22. Privacy, Consent, and Responsible Use

### 22.1 Legal role

- **Platform as processor for each VC** — Keeps customer control central.
- **Platform as independent controller for shared founder memory** — Enables network effects with substantial obligations.
- **Joint-controller model** — May reflect reality but is legally complex.
- **No cross-customer founder memory** — Reduces risk and weakens the global data moat.

### 22.2 Lawful basis and consent

- **Consent for all enrichment and interviews** — Strong transparency but limits outbound sourcing.
- **Legitimate-interest analysis for public research** — Supports sourcing with jurisdictional risk.
- **Consent required before durable profiling** — Allows discovery while limiting persistent impact.
- **Tenant-specific legal configuration** — Supports varied jurisdictions but burdens customers.

### 22.3 Sensitive trait handling

- **Prohibit inference of protected or highly sensitive traits** — Reduces discrimination risk.
- **Allow only explicitly consented traits** — Adds flexibility with governance burden.
- **Redact sensitive attributes before assessment** — Reduces direct use but proxies remain.
- **Store behavioral observations without personality labels** — Limits overreach.
- **Do not use biometric or affect inference** — Avoids especially contested techniques.

### 22.4 Model training use

- **Never train on customer data** — Strong enterprise assurance.
- **Opt-in tenant-specific fine-tuning** — Enables customization.
- **De-identified pooled learning** — Creates network effects but re-identification remains possible.
- **Learn only aggregate metrics** — Reduces exposure.
- **Use synthetic data derived from patterns** — Limits direct reuse but may retain leakage risk.

### 22.5 Data localization

- **Single-region storage** — Operationally simple.
- **Region-selectable storage** — Supports sovereignty requirements.
- **Full regional processing and model routing** — Stronger compliance at greater complexity.
- **Customer-hosted sensitive data** — Maximum control.

### 22.6 Automated decision constraints

- **Decision support only** — Reduces automated-decision exposure.
- **Automated triage with human final decision** — Scales while retaining oversight.
- **Automated decline for clear policy mismatches** — Efficient but potentially consequential.
- **No adverse decision based solely on behavioral inference** — Limits harmful use.
- **Right to human review** — Supports contestability.

---

## 23. Fairness and Bias Controls

### 23.1 Protected-attribute handling

- **Do not collect protected attributes** — Minimizes exposure but limits bias measurement.
- **Collect separately for audit only** — Enables disparate-impact analysis with privacy risk.
- **Use third-party fairness auditor** — Adds independence.
- **Infer attributes for testing** — Broadens measurement but creates serious ethical concerns.

### 23.2 Bias testing

- **Aggregate performance metrics** — Simple but may hide subgroup harms.
- **Subgroup false-positive/false-negative rates** — More informative.
- **Matched-profile counterfactual tests** — Detects sensitivity to identity signals.
- **Adversarial bias probes** — Tests model robustness.
- **Longitudinal sourcing and funding funnel audits** — Measures system-level allocation effects.

### 23.3 Bias mitigation

- **Redacted initial review** — Reduces direct identity effects.
- **Evidence-volume normalization** — Addresses public-footprint privilege.
- **Exploration quotas** — Ensures novel profiles receive review.
- **Human diversity review panel** — Adds perspective at operational cost.
- **Disable features with unstable subgroup performance** — Sacrifices capability for safety.

### 23.4 Historical-data use

- **Use all historical decisions** — Maximizes training volume.
- **Use only decisions with documented rationale** — Improves label quality.
- **Reweight or exclude biased periods and policies** — Reduces inherited bias.
- **Use history only for comparison, not prediction** — Preserves context without direct imitation.
- **Train on outcomes rather than decisions** — Avoids imitation but introduces survivorship and delayed-label bias.

---

## 24. Reliability and Failure Handling

### 24.1 Availability target

- **Best-effort MVP** — Minimizes infrastructure work.
- **Standard SaaS availability** — Suitable for normal fund operations.
- **High-availability interview and negotiation path** — Protects live calls.
- **Multi-region disaster tolerance** — Supports enterprise resilience at high cost.

### 24.2 Partial workflow results

- **Fail the entire opportunity** — Maintains consistency.
- **Publish partial card with explicit gaps** — Preserves deadline and completed work.
- **Stage-specific fallback to humans** — Maintains quality.
- **Retry until deadline, then degrade** — Balances completion and timeliness.

### 24.3 External provider failure

- **Single provider and retry** — Simple.
- **Multi-provider fallback** — More resilient but harder to normalize.
- **Queue work until recovery** — Preserves quality but may breach deadlines.
- **Degrade channel, such as voice to text** — Maintains progress with altered experience.

### 24.4 Idempotency

- **Best-effort duplicate prevention** — Sufficient for low-risk research.
- **Idempotency keys for all side effects** — Important for calls, messages, and term updates.
- **Exactly-once logical processing through workflow state** — Improves consistency.
- **Compensating actions** — Handles distributed failures at additional complexity.

### 24.5 Deadline management

- **Single opportunity deadline** — Simple.
- **Per-stage service-level objectives** — Enables proactive escalation.
- **Dynamic budgets based on priority** — Optimizes resources.
- **Hard cutoff with unknowns preserved** — Protects the 24-hour promise.
- **Human extension workflow** — Supports exceptional diligence.

---

## 25. Observability and Operations

### 25.1 Observability stack

- **Cloud-native logs and metrics** — Fastest setup.
- **OpenTelemetry-based instrumentation** — Vendor-neutral tracing.
- **Dedicated observability provider** — Strong analytics with added cost.
- **AI-specific tracing platform** — Captures prompts, tools, tokens, and evaluations.
- **Self-hosted monitoring** — Greater control at operational cost.

### 25.2 Trace granularity

- **Workflow-level traces** — Low storage.
- **Agent and tool-level traces** — Better debugging.
- **Prompt and token-level traces** — Maximum detail with privacy and cost concerns.
- **Redacted semantic traces** — Balances visibility and confidentiality.

### 25.3 Cost controls

- **Per-opportunity hard budget** — Predictable economics.
- **Per-agent/model quotas** — Prevents runaway loops.
- **Dynamic model routing** — Optimizes quality and price.
- **Caching and retrieval reuse** — Reduces repeated work.
- **Human approval for expensive investigations** — Controls exceptional costs.

### 25.4 Operational controls

- **Feature flags** — Enable safe rollout.
- **Tenant-specific policy configuration** — Supports different risk appetites.
- **Kill switches for calling and negotiation** — Essential for external actions.
- **Replay and backfill tooling** — Supports model upgrades.
- **Manual intervention console** — Helps recover stuck workflows.

---

## 26. Testing and Evaluation

### 26.1 Unit and integration testing

- **Conventional deterministic tests** — Necessary for calculations, schemas, and policies.
- **Recorded provider fixtures** — Stabilizes external integration tests.
- **Sandbox calls and synthetic documents** — Tests workflows safely.
- **Production shadow traffic** — Measures realism without user impact.

### 26.2 Agent evaluation

- **Golden opportunity-card dataset** — Measures extraction and reasoning consistency.
- **Claim-level precision and recall** — Tests evidence handling.
- **Citation correctness** — Detects unsupported conclusions.
- **Contradiction and unknown-state tests** — Verifies epistemic discipline.
- **Human expert scoring** — Measures usefulness but is expensive.
- **Model-as-judge evaluation** — Scales but may share model biases.

### 26.3 Interview evaluation

- **Question relevance to hypotheses** — Tests adaptiveness.
- **Gap-resolution rate** — Measures decision impact.
- **Transcript and diarization accuracy** — Tests evidence fidelity.
- **Inter-rater reliability for behavioral findings** — Tests scientific stability.
- **Founder experience and fairness surveys** — Captures user harm and trust.

### 26.4 Thesis-model evaluation

- **Historical decision prediction** — Measures imitation.
- **Ranking agreement with current investors** — Measures present alignment.
- **Out-of-time validation** — Detects drift.
- **Outcome correlation** — Measures long-term utility with confounding.
- **Cold-start and subgroup performance** — Detects evidence-volume and fairness problems.

### 26.5 Term-model evaluation

- **Calculation reproducibility** — Ensures identical inputs produce identical terms.
- **Legal-template validation** — Prevents missing or inconsistent clauses.
- **Expert agreement testing** — Measures practical acceptability.
- **Counterfactual consistency** — Ensures changes behave as expected.
- **Authority-boundary tests** — Ensures agents cannot exceed approvals.

### 26.6 Negotiation evaluation

- **Agreement rate** — Measures convergence but not deal quality.
- **Utility achieved relative to approved bounds** — Measures principal outcomes.
- **Time and turns to resolution** — Measures efficiency.
- **Policy-violation rate** — Measures safety.
- **Traceability of every concession** — Measures auditability.
- **Human preference comparison** — Tests whether recommendations are actually useful.

### 26.7 Red-team testing

- **Prompt injection in decks and web pages** — Tests tool isolation.
- **Fabricated founder claims** — Tests verification.
- **Conflicting evidence** — Tests uncertainty handling.
- **Social engineering during calls** — Tests authority controls.
- **Attempts to induce bluffing or discriminatory statements** — Tests negotiation policy.
- **Sensitive-data exfiltration attempts** — Tests privacy boundaries.

---

## 27. Continuous Learning

### 27.1 Feedback capture

- **Explicit reviewer edits and overrides** — High-value but sparse.
- **Decision and term-sheet outcomes** — Easy to capture but confounded.
- **Portfolio performance** — Important but delayed.
- **Founder corrections and appeals** — Useful for error analysis.
- **Research verification outcomes** — Useful for claim calibration.
- **Negotiation concessions and acceptance** — Useful for policy refinement.

### 27.2 Learning architecture

- **Offline batch retraining** — Auditable and stable.
- **Per-tenant calibration layers** — Preserves personalization.
- **Online learning** — Responsive but vulnerable to feedback loops.
- **Contextual bandits for research actions** — Optimizes evidence acquisition.
- **Reinforcement learning for negotiation** — Potentially powerful but risky and hard to evaluate.
- **No automatic model updates; insights only** — Safest but slower improvement.

### 27.3 Label quality

- **Treat human decisions as ground truth** — Simple but embeds inconsistency.
- **Use adjudicated decision rationales** — Higher quality at greater cost.
- **Separate preference labels from outcome labels** — Avoids conceptual mixing.
- **Track label confidence and reviewer disagreement** — Preserves ambiguity.
- **Exclude decisions affected by mandate or capacity constraints** — Improves thesis signal.

### 27.4 Feedback-loop prevention

- **Exploration allocation** — Prevents model-ranked opportunities from monopolizing evidence.
- **Shadow models and holdout cohorts** — Supports unbiased evaluation.
- **Temporal decay of old evidence** — Reduces stale penalties.
- **Periodic manual revalidation** — Detects drift.
- **Do not train directly on model-influenced decisions** — Reduces self-reinforcement but discards data.

### 27.5 Model governance

- **Automatic promotion on metrics** — Fast but risky.
- **Human model-review board** — Strong governance.
- **Versioned model cards and evaluation reports** — Improves accountability.
- **Tenant-controlled upgrade windows** — Supports enterprise stability.
- **Rollback to previous model and prompts** — Essential for incident recovery.

---

## 28. Build-versus-Buy Decisions

### 28.1 Agent framework

- **Build a lightweight internal framework** — Maximum control and minimal abstraction leakage.
- **Use LangGraph/LlamaIndex/Semantic Kernel** — Speeds development.
- **Use a managed agent platform** — Minimizes operations but increases lock-in.
- **Use workflow engine plus direct model APIs** — Keeps control flow explicit.

### 28.2 Document intelligence

- **Build parsers and extraction pipelines** — Better control and customization.
- **Use managed OCR/document AI** — Faster and robust across formats.
- **Use legal-document extraction vendors** — Strong term-sheet specialization.
- **Hybrid managed parsing plus proprietary normalization** — Preserves differentiation in the data model.

### 28.3 Voice

- **Build the real-time voice stack** — Maximum control and long-term differentiation.
- **Integrate ElevenLabs and Twilio** — Fastest path to a polished demo.
- **Use an end-to-end voice-agent provider** — Lowest implementation effort.
- **Human call center with AI augmentation** — Operational rather than technical scaling.

### 28.4 Knowledge graph

- **Build graph ingestion and ontology internally** — Supports proprietary memory design.
- **Use managed graph database and tools** — Reduces infrastructure work.
- **Defer graph; use relational projections** — Validates query needs first.
- **Adopt an ontology/knowledge platform** — Speeds enterprise features with high dependency.

### 28.5 Term-sheet and legal tooling

- **Build template and calculation engine** — Makes causal annotations a core differentiator.
- **Integrate contract lifecycle software** — Reduces legal document scope.
- **Partner with law firms/template providers** — Improves legal credibility.
- **Limit platform to structured recommendations** — Avoids document-generation liability.

### 28.6 Thesis model

- **Build proprietary model** — Core differentiation and control.
- **Use generic AutoML** — Fast baseline.
- **Use LLM prompting over historical cases** — Low data-engineering burden.
- **Start with explicit scorecards** — Easier validation before learned models.

### 28.7 Evidence retrieval

- **Build custom hybrid retrieval** — Tailored relevance and provenance.
- **Use managed enterprise search** — Fast and scalable.
- **Use model-provider retrieval tools** — Tight integration but lock-in.
- **Use database-native search initially** — Lowest operational burden.

---

## 29. Delivery and Rollout

### 29.1 MVP slice

- **Deck-to-card extraction** — Validates the central artifact.
- **Deck-to-card plus public enrichment** — Demonstrates evidence gathering.
- **Add hypothesis-driven voice interview** — Demonstrates the vibe-check differentiator.
- **Add deterministic annotated term sheet** — Demonstrates evidence-to-decision causality.
- **Add bounded voice negotiation** — Demonstrates the full thesis with maximum risk.

### 29.2 Pilot model

- **Internal demo data** — Fast and safe but weak validation.
- **One design-partner fund** — Deep feedback and customization.
- **Several funds with isolated pilots** — Tests generality.
- **Accelerator or scout program** — Provides higher opportunity volume.
- **Founder-side pilot** — Tests symmetric negotiation but changes buyer and incentives.

### 29.3 Rollout strategy

- **Feature-by-feature opt-in** — Supports cautious adoption.
- **Shadow recommendations alongside existing process** — Measures value without affecting decisions.
- **Human-approved production workflow** — Introduces controlled impact.
- **Autonomy increased after measured thresholds** — Ties authority to proven reliability.
- **No autonomous progression beyond advisory mode** — Keeps risk permanently bounded.

### 29.4 Configuration scope

- **One standardized workflow** — Easier to maintain.
- **Per-fund thesis and templates only** — Supports core personalization.
- **Fully configurable workflow builder** — Broad applicability at high product complexity.
- **Custom implementation per customer** — Fast enterprise fit but poor scalability.

---

## 30. Commercial and Operational Architecture

### 30.1 Pricing meter

- **Per seat** — Predictable and familiar.
- **Per opportunity** — Aligns with processed volume.
- **Per completed workflow/interview/call** — Aligns with direct usage.
- **Platform subscription plus usage** — Covers fixed and variable costs.
- **Outcome-based pricing** — Strong alignment but difficult to attribute and regulate.

### 30.2 Cost attribution

- **Pool all model and research costs** — Simple billing.
- **Track cost per opportunity and stage** — Supports unit economics.
- **Pass through premium data and calls** — Protects margins.
- **Tenant-set budgets** — Gives customers control.
- **Quality tiers by model and diligence depth** — Offers flexibility but complicates experience.

### 30.3 Service model

- **Pure self-service SaaS** — Scalable but challenging for high-stakes adoption.
- **Software plus analyst operations** — Improves quality and learning.
- **Managed diligence service** — Delivers outcomes but becomes operationally intensive.
- **Enterprise platform and implementation services** — Fits large funds with longer sales cycles.

---

## 31. Key Cross-Cutting Policy Questions

### 31.1 Source of truth when artifacts disagree

- **Opportunity Card wins** — Keeps one visible canonical record.
- **Structured database wins** — Preserves validation.
- **Latest verified evidence wins** — Prioritizes epistemic quality.
- **No silent winner; expose the conflict** — Preserves auditability.

### 31.2 What may an LLM create?

- **Narrative summaries only** — Lowest risk.
- **Candidate structured facts requiring validation** — Adds automation safely.
- **Recommendations with citations** — Useful but consequential.
- **Financial inputs** — Risky unless verified.
- **Legal language or binding offers** — Highest-risk scope.

### 31.3 What requires deterministic implementation?

- **Identifiers, permissions, and workflow transitions** — Protects system integrity.
- **Financial and cap-table calculations** — Ensures reproducibility.
- **Negotiation authority and policy checks** — Prevents boundary violations.
- **Evidence-state transitions** — Protects provenance.
- **All consequential decisions** — Maximizes safety but limits agent flexibility.

### 31.4 What requires human review?

- **All founder-facing communication** — Safest, slowest.
- **Only calls, references, and negotiation** — Focuses on external actions.
- **Only material contradictions and low-confidence findings** — Risk-based scaling.
- **Only final recommendation and terms** — Maximizes automation.
- **Actions above configurable legal, financial, or reputational thresholds** — Most flexible but policy-intensive.

### 31.5 What is allowed to persist?

- **Raw artifacts and recordings** — Maximizes reproducibility.
- **Verified claims only** — Reduces harmful memory.
- **All claims with state and provenance** — Preserves history and contradictions.
- **Opportunity-local interpretations only** — Prevents permanent founder labels.
- **Dated person-level observations with decay and contestability** — Enables longitudinal memory with safeguards.

### 31.6 What constitutes a completed 24-hour decision?

- **Final invest/decline decision** — Strong promise but sometimes unrealistic.
- **Review-ready recommendation** — More operationally achievable.
- **Conditional decision with explicit blockers** — Preserves uncertainty.
- **Human-approved annotated term sheet** — Strong outcome for qualified opportunities.
- **Decision-or-escalation guarantee** — Ensures every opportunity receives a timely disposition.
