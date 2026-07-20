# FirstCheck

- [Demo app](https://vibe-check-hackathon.github.io/vibe-check/)
- [Explainer app](https://code.chuanqisun.com/first-check/)

AI-driven VC deal-flow platform built for the Maschmeyer Group **VC Brain**
challenge: 24-hour founder evaluation, evidence-backed memos, thesis-driven
screening, and a BATNA negotiation model. The full mapping of the challenge
brief's 8 MVP requirements to the implementation lives in
[`laura/mvp-tasks.md`](laura/mvp-tasks.md).

## Quick start

```bash
# 1. (optional, powers all LLM features) set an API key — valid 24h
node laura/pipeline/set-key.js          # paste sk-ant-… (Claude) or sk-… (OpenAI)
#    …or skip this and paste the key later inside the app (Checky → key icon)

# 2. main web app (investor platform + founder apply page)
cd Martin/nexus-vetting-suite
npm install
npm run dev                             # → http://localhost:8080

# 3. (optional) pipeline demo server: SSE event stream, live interview, studio
node laura/pipeline/serve.js            # → http://localhost:4173
```

**Demo login:** `investor@firstcheck.demo` / `growth-signal` — a real,
server-verified account (`laura/pipeline/lib/accounts.js`), not the old
client-only gate. Founders get their own account automatically when they
apply (shown once on the confirmation screen) and can check back at
`/founder-portal` to see their screening result and, once an interview is
scored, their feedback. Session gating is still partial — see SECURITY.md's
"known non-protections" before treating any of this as production-ready.

> **⚠️ Important — run exactly ONE dev server.** If `npm run dev` prints
> `Port 8080 is in use, trying another one…`, an old instance is still alive:
> kill it (Task Manager → node, or close its terminal) and start again.
> Stacked zombie servers on 8081/8082/… serve stale code and are the #1 cause
> of "the page doesn't load". After changing `vite.config.ts`, restart the
> server — hot reload does not apply config/endpoint changes.

## Production build & free deploy

The backend endpoints are implemented once in
[`laura/pipeline/app-endpoints.js`](laura/pipeline/app-endpoints.js) and used
by both the vite dev server and production — so what you test in dev is what
deploys. Production is one Node process:

```bash
cd Martin/nexus-vetting-suite
NITRO_PRESET=node-server npm run build   # SSR app → .output/
cd ../..
node laura/pipeline/app-server.js        # → http://localhost:8080 (API + SSR)
```

Free hosting: [`render.yaml`](render.yaml) deploys this on Render's free plan
(sleeps when idle — demo-grade; see the file's comments). Its Blueprint setup
prompts for every optional key (see [`.env.example`](.env.example) for the
full list — `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` or a free endpoint like Groq
for LLM features, `RESEND_API_KEY` for interview-invite email,
`ELEVENLABS_API_KEY`/`ELEVENLABS_AGENT_ID` for live interviews). None are
required — the app runs and degrades legibly without any of them. GitHub
Pages cannot host this app (it is SSR + backend, not static); that workflow
was removed.

**Accounts and sessions can survive a restart now.** Set `DATABASE_URL` to a
free Postgres database (e.g. [Neon](https://neon.tech) — its free tier
doesn't expire, unlike Render's own free Postgres, which is deleted after 30
days) and `laura/pipeline/lib/db.js` takes over from the ephemeral
`accounts.json` file. Without it, behavior is unchanged from before — file +
in-memory, resets on restart. Submitted applications aren't migrated yet;
that's the next piece if you need them to survive too.

Before pushing, prove the commit actually deploys — this is also what CI
([`.github/workflows/test.yml`](.github/workflows/test.yml)) runs on every
push and PR:

```bash
node --test laura/pipeline/test/*.test.js   # 48 tests: pipeline + backend + security
node laura/pipeline/verify-deploy.js        # clones HEAD fresh, builds, boots, checks over real HTTP
```

## The two surfaces

**Logged out → founder surface.** Visiting the app without the investor flag
redirects to `/apply`: a public application form showing the fund's _live_
criteria (sectors, stages, geography, check size — loaded from the thesis, not
hardcoded). Deck + company name is the minimum bar. Submitting runs the
canonical screen immediately and returns an honest pass / screened-out verdict
with reasons. A Google Form alternative (same criteria + consent language) is
linked from the page.

**Logged in → investor platform.** Deal board (kanban / table toggle), the
pipeline stage bar (company snapshot → founder profiles → agent interview →
due diligence), detail dialogs with evaluation retrospectives and why-high/
why-low score rationale, settings with an editable fund thesis, an AI command
bar (typed or voice), the **"Scan outbound"** button (live LLM sourcing by
region), and **Checky**, the evidence-grounded assistant (bottom right).

## How the integration works

```
Martin/nexus-vetting-suite  (React app, port 8080)
        │  vite middleware = the app's backend
        ├── GET/POST /thesis      ←→  laura/pipeline/thesis.json   (fund criteria, editable in Settings)
        ├── POST /apply           →   screening → founder profiles → laura/pipeline/inbox/
        ├── GET  /applications    →   inbox, newest first (board + founder pipeline read this)
        ├── POST /nl-query        →   LLM fallback for the command bar
        ├── POST /outbound-scan   →   live LLM sourcing → screened → briefs in opportunity-db/outbound-scans/
        ├── POST /assistant       →   Checky: RAG over the DB, cited answers
        ├── GET/POST/DELETE /llm-key → token status / activate / switch / forget (UI-side set-key)
        ├── POST /auth/login, /auth/logout, GET /auth/me → server-verified sessions (investor + founder)
        ├── GET  /my-feedback     →   founder's own screening + hypotheses + interview score (session-scoped)
        ├── GET  /interview-score →   investor-facing: real interview score for an opportunityId, if scored
        └── GET  /opportunity-db  →   laura/opportunity-db/        (single source of truth, no copies)

laura/pipeline  (zero-dependency Node ESM)
        ├── lib/screening.js       canonical first-pass screen (thesis-parameterized)
        ├── lib/llm.js             provider-agnostic LLM adapter + 24h key store + web search
        ├── lib/outbound-scan.js   template-driven live sourcing (intelligence-brief cards)
        ├── lib/assistant.js       Checky: retrieval + grounding rules
        ├── lib/interview-eval.js  real-time interview scoring with reasons + BATNA updates
        ├── interviews.js + lib/transcript|interview-extract|corroborate|founder-score|interview-card
        │                          interview-ingestion pipeline (see below)
        ├── sourcing.js / developing.js   card building, corroboration, negotiation model
        └── serve.js               SSE demo server (pipeline events + live-scored interview)
```

- **Single source of truth.** All company data lives in
  `laura/opportunity-db/` (22 real companies with evidence ledgers and 0–100
  trust scores, plus a fully synthetic consent-safe cohort). Both frontends
  read it via HTTP; nothing is copied.
- **Thesis engine.** `laura/pipeline/thesis.json` is the one config every
  recommendation is filtered through. Editing it in Settings takes effect on
  the next screen/score — no restart.
- **Screening is shared, not duplicated.** The same
  `screenOpportunity()` runs on `/apply` submissions, on the pipeline, and is
  mirrored in the board loader so off-thesis records (Series B+, billion-scale
  valuations) can never reach the board.
- **Inbound applications** are normalized into the pipeline's intake shape
  (founders, materials, claims, permissions ledger) and land in
  `laura/pipeline/inbox/` (gitignored) as JSON + a markdown card for the
  pipeline to pick up.
- **Consent model.** Real people: sourced public facts only, founder
  evaluations intentionally "not assessed". Synthetic people (`.example`
  domains): full data, generated with a seeded faker. The apply form collects
  an explicit research consent that feeds the permissions ledger.

## Interview-ingestion pipeline (vc-brain)

Permitted founder interviews become traceable evidence, Founder Score inputs,
and `OPP-MGV-INT-*` cards — full docs in
[`laura/pipeline/INTERVIEWS.md`](laura/pipeline/INTERVIEWS.md):

```bash
node laura/pipeline/interviews.js ingest  --file interview.vtt --company "X"   # or --url …
node laura/pipeline/interviews.js process --transcript TRN-…
node laura/pipeline/interviews.js review  --interview INT-0001 --approve --ack # 9-question checklist
node laura/pipeline/interviews.js render  --interview INT-0001 [--enrich <existing card>]
```

The flow: source-policy gate (robots.txt, SSRF refusal, no hosted-media
downloading) → normalized timestamped transcript (.txt/.md/.srt/.vtt/.json or
authorized recordings via a provider abstraction) → claim extraction (offline
rule layer + strictly validated LLM pass) → **corroboration against
`Martin/seed-speed-portfolio-enriched.md` and the opportunity DB** (never
overwrites; contradictions are retained with diligence questions) → Founder
Score feature contributions with **separate confidence** (self-report credited
at most 65%, caps configurable in `thesis.json`) → mandatory human-review
checklist before any outreach → deterministic cards with per-claim references
like `[INT-001, 00:00:08–00:00:22]`. Example generated through the pipeline:
[`OPP-MGV-INT-0001-deskbird.md`](laura/opportunity-db/interviews/OPP-MGV-INT-0001-deskbird.md).
Tests: `node --test laura/pipeline/test/*.test.js` (interview pipeline incl. a
golden-file render, plus backend endpoint + security tests).

## Checky & the live outbound scan

**Checky** (button bottom-right on every investor page) is the diligence
assistant: ask _"check Auxilius"_ or _"which outbound deals fit our thesis?"_
and it answers from retrieval (RAG) over the whole evidence base — real cards,
outbound briefs, scan results, thesis — **citing the chunk ids it reasoned
from**. If the evidence isn't there it says "not in the evidence base" instead
of inventing, and it refuses personality judgments about real people. The key
icon in Checky's header shows token status and lets you **activate or switch
the API token in the UI** (paste a different key to change provider).

**Scan outbound** (board, next to the command bar): pick a region
(Europe / US / China) and the configured LLM searches for newly funded
on-thesis startups, structured by
[`laura/outbound_person_team_intelligence_template(1).md`](<laura/outbound_person_team_intelligence_template(1).md>).
Every find passes the canonical thesis screen, is deduped against tracked
companies, gets a **filled intelligence-brief card** in
`laura/opportunity-db/outbound-scans/`, and pops onto the board permanently.

> **Honesty tiers (important):** with a **Claude key** the scan uses live web
> search — results carry real source URLs. OpenAI/local keys cannot browse, so
> those results are loudly labeled **"UNVERIFIED model recall — verify before
> use"** on the record, the one-liner, and every founder signal. Real people
> are always public facts only, never scored.

## The AI command bar & LLM key

Structured commands ("sort by money", "hide portfolio", "only outbound") and
attribute queries ("technical founder, berlin, ai infra, no prior vc backing")
are parsed instantly by rules. Anything unbounded falls back to `/nl-query`,
which asks whichever LLM is configured and filters the board to the matching
deals.

The key is entered **in a terminal** (or via Checky's key icon in the UI) and
cached for **24 hours** in gitignored `laura/pipeline/.llm-key.json`. One key
powers everything: command-bar fallback, outbound scan, and Checky.

```bash
node laura/pipeline/set-key.js                # interactive prompt
node laura/pipeline/set-key.js --status       # what's active, when it expires
node laura/pipeline/set-key.js --clear        # forget the key
# free local model instead of a paid API:
node laura/pipeline/set-key.js ollama --base-url http://localhost:11434 --model llama3.1
```

The provider is detected from the key itself — `sk-ant-…` → Claude
(claude-opus-4-8), other `sk-…` → OpenAI (gpt-4o-mini), `--base-url` → any
OpenAI-compatible local server. `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` env
vars override the file. The key file is read per request, so no restart after
setting it. Without a key the app runs normally; the fallback just explains
how to enable it.

## Repo layout

One folder per teammate (see [`AGENTS.md`](AGENTS.md) — write only in your
own folder unless agreed otherwise). The staged plan for merging the four
folders into one component-structured repo lives in
[`laura/repo-restructure-guide.md`](laura/repo-restructure-guide.md):

| Folder    | What's in it                                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Martin/` | `nexus-vetting-suite` — the main web app (TanStack Start + Vite, Growth Signal palette)                                                             |
| `laura/`  | opportunity DB, pipeline (screening, sourcing, LLM adapter, SSE server), studio frontend, docs (`mvp-tasks.md`, `vc-criteria.md`, `color-guide.md`) |
| `sun/`    | technical architecture, opportunity-card spec, flow design                                                                                          |
| `mehdi/`  | teammate workspace                                                                                                                                  |

## Working in this repo (agents and contributors)

The rules live in [`AGENTS.md`](AGENTS.md); this is the practical version tied
to what's actually in this repo.

- **Run the suite before editing:** `node --test laura/pipeline/test/*.test.js`
  (interview pipeline incl. a golden-file render against
  [`OPP-MGV-INT-0001-deskbird.md`](laura/opportunity-db/interviews/OPP-MGV-INT-0001-deskbird.md),
  plus backend endpoint/security tests that spawn the real app-server).
  If something already fails before you touch anything, say so before you start.
- **New pipeline behavior gets a test in the same change**, added under
  `laura/pipeline/test/` next to the module you're changing (`lib/screening.js`,
  `lib/outbound-scan.js`, `lib/interview-eval.js`, `lib/assistant.js`, …) —
  not a new top-level test runner.
- **Demonstrate manually, not only with tests.** Run both servers
  (`npm run dev` in `Martin/nexus-vetting-suite`, `node laura/pipeline/serve.js`)
  and actually call the endpoint you changed — `POST /apply`,
  `POST /outbound-scan`, `POST /assistant`, `GET/POST /thesis` — see
  "How the integration works" above for the full list.
- **`laura/opportunity-db/` stays the single source of truth.** Don't create
  a second copy of company/founder data anywhere else; both frontends read it
  live over HTTP.
- **Keep commits small**, and update the doc for the behavior you changed
  (`laura/pipeline/INTERVIEWS.md`, `laura/mvp-tasks.md`) in the same commit,
  not a follow-up.
- **A new top-level folder is a decision, not a default.** Before adding one,
  check it isn't better as a module inside `laura/pipeline/lib/`,
  `Martin/nexus-vetting-suite/`, or `laura/opportunity-db/` — this repo has
  three working surfaces; most changes belong inside one of them.
