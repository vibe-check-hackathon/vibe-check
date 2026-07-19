# VibeCheck — Opportunity OS

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

**Demo login:** the investor platform is gated. Password: `growth-signal`
(client-side demo gate for the hackathon — not real authentication).

> **⚠️ Important — run exactly ONE dev server.** If `npm run dev` prints
> `Port 8080 is in use, trying another one…`, an old instance is still alive:
> kill it (Task Manager → node, or close its terminal) and start again.
> Stacked zombie servers on 8081/8082/… serve stale code and are the #1 cause
> of "the page doesn't load". After changing `vite.config.ts`, restart the
> server — hot reload does not apply config/endpoint changes.

## The two surfaces

**Logged out → founder surface.** Visiting the app without the investor flag
redirects to `/apply`: a public application form showing the fund's *live*
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
        └── GET  /opportunity-db  →   laura/opportunity-db/        (single source of truth, no copies)

laura/pipeline  (zero-dependency Node ESM)
        ├── lib/screening.js       canonical first-pass screen (thesis-parameterized)
        ├── lib/llm.js             provider-agnostic LLM adapter + 24h key store + web search
        ├── lib/outbound-scan.js   template-driven live sourcing (intelligence-brief cards)
        ├── lib/assistant.js       Checky: retrieval + grounding rules
        ├── lib/interview-eval.js  real-time interview scoring with reasons + BATNA updates
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

## Checky & the live outbound scan

**Checky** (button bottom-right on every investor page) is the diligence
assistant: ask *"check Auxilius"* or *"which outbound deals fit our thesis?"*
and it answers from retrieval (RAG) over the whole evidence base — real cards,
outbound briefs, scan results, thesis — **citing the chunk ids it reasoned
from**. If the evidence isn't there it says "not in the evidence base" instead
of inventing, and it refuses personality judgments about real people. The key
icon in Checky's header shows token status and lets you **activate or switch
the API token in the UI** (paste a different key to change provider).

**Scan outbound** (board, next to the command bar): pick a region
(Europe / US / China) and the configured LLM searches for newly funded
on-thesis startups, structured by
[`laura/outbound_person_team_intelligence_template(1).md`](laura/outbound_person_team_intelligence_template(1).md).
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
own folder unless agreed otherwise):

| Folder | What's in it |
|---|---|
| `Martin/` | `nexus-vetting-suite` — the main web app (TanStack Start + Vite, Growth Signal palette) |
| `laura/` | opportunity DB, pipeline (screening, sourcing, LLM adapter, SSE server), studio frontend, docs (`mvp-tasks.md`, `vc-criteria.md`, `color-guide.md`) |
| `sun/` | technical architecture, opportunity-card spec, flow design |
| `mehdi/` | teammate workspace |
