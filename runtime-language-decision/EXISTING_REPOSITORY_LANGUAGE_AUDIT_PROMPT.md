# Existing Repository Language and Performance Audit Prompt

Use this prompt with Codex, Claude, or another coding agent that has access to
the repository.

```text
You are performing a read-mostly architecture and performance audit.

Do not install any language, compiler, runtime, package manager, dependency,
benchmark framework, or system package. Do not modify production code during
the audit. Do not expose secrets or print environment variables.

Read:
- AGENTS.md
- README.md
- spec.md
- SECURITY.md
- package manifests
- lockfiles
- CI workflows
- deployment files
- architecture documentation

Phase 1 — Inventory

Identify:

1. Languages and versions.
2. Frameworks and runtimes.
3. Applications, services, workers, and packages.
4. Package managers and build systems.
5. Dependency count and major dependency groups.
6. Database, queue, storage, crawler, model, Telegram, and email integrations.
7. Existing performance tests, profiles, and production metrics.
8. Existing language-specific code and native modules.
9. Current deployment targets and container images.
10. Licensing constraints.

Phase 2 — Baseline

Run only documented, already-supported commands.

Record:

- install command, without changing lockfiles
- build duration
- test duration
- type-check duration
- lint duration
- bundle sizes
- container-image sizes if already buildable
- process startup time if safely measurable
- memory use if safely measurable

Run the existing test suite before making any benchmark proposal.

Phase 3 — Architecture review

Map the main workflow:

user request
→ API/controller
→ database/queue
→ crawler or worker
→ model provider
→ notification

Identify:

- synchronous blocking work
- unbounded concurrency
- repeated JSON parsing
- repeated document parsing
- unnecessary model calls
- missing caches
- inefficient database access
- large in-memory buffers
- missing streaming
- duplicate work
- over-large frontend bundles
- components that could be isolated

Phase 4 — Candidate hotspots

Rank no more than five hotspots using available evidence.

For each hotspot include:

- evidence
- estimated share of latency or cost
- likely optimization in the current language
- whether another runtime could help
- uncertainty

Do not recommend another language merely because it is usually described as
fast.

Phase 5 — Benchmark plan

Create, but do not execute if it requires new software, a minimal benchmark
plan using representative project data.

Compare:

A. Optimized current TypeScript/Node.js
B. Go, only for a clearly bounded worker or service
C. Rust, only for a proven CPU- or memory-critical component
D. Python, only where ecosystem value is the principal benefit

Measure:

- p50 and p95 latency
- throughput
- CPU time
- maximum RSS
- startup time
- build time
- artifact/container size
- implementation complexity
- dependency count
- operational complexity

Phase 6 — User decision

Produce three explicit options:

Option A — Stay TypeScript-only
- optimizations
- expected benefits
- effort
- risks

Option B — Add Go for one isolated component
- component
- contract
- expected benefit
- new installations
- build/CI impact
- rollback

Option C — Defer language changes
- missing evidence
- instrumentation needed
- decision trigger

Add Rust or Python as a fourth option only when repository evidence supports
it.

Do not install or implement the selected option. End with:

"Explicit approval is required before installing a toolchain or changing the
repository's language architecture."

Phase 7 — Notifications

Review whether Telegram and email can share one notification pipeline:

canonical event
→ authorization and preferences
→ template rendering
→ Telegram/email adapter
→ delivery receipt

Recommend:

- immediate Telegram events
- daily/weekly email digests
- dashboard links for sensitive content
- deduplication keys
- retry policy
- delivery audit records

Final report format:

# Repository Language and Performance Audit

## Executive recommendation
## Current architecture
## Language and dependency inventory
## Baseline commands and results
## Bottlenecks
## Current-stack optimizations
## Representative benchmark plan
## Option A: stay TypeScript
## Option B: add Go selectively
## Other justified options
## Notification architecture
## Open-source and licensing considerations
## Required approvals
## Risks and rollback
## Unknowns
```
