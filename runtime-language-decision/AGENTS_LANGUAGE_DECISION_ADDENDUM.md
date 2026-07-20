# AGENTS.md Addendum — Language, Performance, and Toolchain Decisions

Add this section to the canonical repository `AGENTS.md`.

---

## Runtime and language policy

The repository's existing language is the default.

Do not introduce, install, or require a new programming language, compiler,
runtime, package manager, or build system without explicit human approval.

A language change must solve a measured problem. Preference, novelty, or a
synthetic benchmark alone is insufficient.

### Before recommending another language

1. Inventory the current repository:
   - languages
   - frameworks
   - package managers
   - build tools
   - deployment targets
   - dependency counts
   - container images
2. Run the existing tests and builds.
3. Measure the real workload:
   - p50 and p95 latency
   - throughput
   - CPU
   - memory
   - event-loop blocking
   - queue delay
   - build duration
   - startup time
   - image size
4. Identify the specific hotspot and its percentage of total cost or latency.
5. Create the smallest representative benchmark.
6. Compare an optimized implementation in the existing language before
   proposing a rewrite.
7. Present alternatives and wait for explicit approval.

### Required decision options

Always present:

#### Option A — Stay on the existing stack

Include:

- optimizations available without a rewrite
- expected improvement
- implementation effort
- operational impact

#### Option B — Add a language for one isolated component

Include:

- exact component boundary
- measured benefit
- new toolchain and dependencies
- build and CI changes
- deployment changes
- contract between languages
- ownership requirement
- rollback plan

#### Option C — Defer the decision

Use this when production-representative evidence is insufficient.

### Approval boundary

Do not:

- install Go, Rust, Python, Bun, Deno, or another runtime
- modify CI to require a new toolchain
- create new language-specific lockfiles
- add native extensions
- add cross-language code generation
- rewrite an existing service

until a human explicitly approves the selected option.

### Migration threshold

A language migration is normally considered only when:

- the hotspot represents at least 20% of relevant production cost or latency,
  and
- the alternative offers roughly 2× improvement or a clearly material memory,
  reliability, deployment, or security benefit.

Document exceptions.

### Benchmark rules

Benchmarks must:

- use representative input sizes
- run multiple iterations
- report median and tail latency where applicable
- include memory and CPU
- include build and startup cost
- record runtime and toolchain versions
- include the benchmark source
- avoid comparing optimized code with deliberately naive code
- state limitations
- be reproducible in CI or a documented environment

Never claim universal language superiority from a microbenchmark.

### Node.js-specific checks

Before proposing a rewrite:

- profile event-loop delay
- inspect synchronous filesystem and crypto calls
- inspect large JSON serialization
- check database-query plans
- check unbounded promise concurrency
- add backpressure
- test streaming
- test batching
- consider worker threads for CPU-heavy JavaScript
- consider a separate process for unsafe or failure-prone work

### Polyglot policy

When another language is approved:

- isolate it behind a versioned contract
- keep one source of truth for schemas
- add conformance tests
- use separate dependency lockfiles
- pin toolchain versions
- add security and license scanning
- document local installation
- provide a containerized development option
- preserve a rollback path
- assign a maintainer

### Open-source clarification

Programming-language choice and product licensing are separate.

Node.js, TypeScript, Go, Python, and Rust are open-source technologies.
Installing another language does not change the repository's license.

The user must still choose:

- self-hosted/open-source deployment
- managed dependencies or hosted providers
- acceptable licenses for new packages
- whether new toolchains may be installed locally

### Notification-system policy

Telegram and email are adapters over one canonical notification event.

Do not implement business rules independently in each channel.

Use:

```text
canonical event
→ preference and authorization checks
→ channel-specific template
→ send
→ delivery receipt
```

Telegram is for immediate, short, actionable updates.

Email is for durable digests and long-form reports.

Sensitive details belong in an authenticated dashboard or controlled storage,
not in notification text.

### Completion evidence

A runtime or language recommendation must include:

```markdown
## Current stack

## Measured bottleneck

## Baseline results

## Existing-language optimization

## Alternative-language benchmark

## CPU and memory impact

## Build and CI impact

## Dependency and license impact

## Security impact

## Options

## Recommendation

## Approval required

## Rollback
```
