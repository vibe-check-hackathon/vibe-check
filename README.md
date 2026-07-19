# VibeCheck — Opportunity OS

AI-driven VC deal-flow platform built for the Maschmeyer Group **VC Brain**
challenge: 24-hour founder evaluation, evidence-backed memos, thesis-driven
screening, and a BATNA negotiation model. The full mapping of the challenge
brief's 8 MVP requirements to the implementation lives in
[`laura/mvp-tasks.md`](laura/mvp-tasks.md).

## Quick start

```bash
# 1. (optional, powers the AI query fallback) set an LLM API key — valid 24h
node laura/pipeline/set-key.js          # paste sk-ant-… (Claude) or sk-… (OpenAI)

# 2. main web app (investor platform + founder apply page)
cd Martin/nexus-vetting-suite
npm install
npm run dev                             # → http://localhost:8080

# 3. (optional) pipeline demo server: SSE event stream, approval gate, studio
node laura/pipeline/serve.js            # → http://localhost:4173
```

**Demo login:** the investor platform is gated. Password: `growth-signal`
(client-side demo gate for the hackathon — not real authentication).

## The two surfaces

**Logged out → founder surface.** Visiting the app without the investor flag
redirects to `/apply`: a public application form showing the fund's *live*
criteria (sectors, stages, geography, check size — loaded from the thesis, not
hardcoded). Deck + company name is the minimum bar. Submitting runs the
canonical screen immediately and returns an honest pass / screened-out verdict
with reasons. A Google Form alternative (same criteria + consent language) is
linked from the page.

**Logged in → investor platform.** Dashboard, deal board (kanban / table
toggle), portfolio overview with alignment hints, founder psychogram, detail
dialogs with evaluation retrospectives (scored-then vs. real-world outcome),
settings with an editable fund thesis, and an AI command bar (typed or voice).

## How the integration works

```
Martin/nexus-vetting-suite  (React app, port 8080)
        │  vite middleware = the app's backend
        ├── GET/POST /thesis      ←→  laura/pipeline/thesis.json   (fund criteria, editable in Settings)
        ├── POST /apply           →   screening → laura/pipeline/inbox/  (intake JSON + markdown card)
        ├── POST /nl-query        →   laura/pipeline/lib/llm.js    (LLM fallback for the command bar)
        └── GET  /opportunity-db  →   laura/opportunity-db/        (single source of truth, no copies)

laura/pipeline  (zero-dependency Node ESM)
        ├── lib/screening.js   canonical first-pass screen (thesis-parameterized)
        ├── lib/llm.js         provider-agnostic LLM adapter + 24h key store
        ├── sourcing.js / developing.js   card building, corroboration, negotiation model
        └── serve.js           SSE demo server (events, approval gate, /screen, /thesis)
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

## The AI command bar & LLM key

Structured commands ("sort by money", "hide portfolio", "only outbound") and
attribute queries ("technical founder, berlin, ai infra, no prior vc backing")
are parsed instantly by rules. Anything unbounded falls back to `/nl-query`,
which asks whichever LLM is configured and filters the board to the matching
deals.

The key is entered **in a terminal, before (or during) launch**, and cached
for **24 hours** in gitignored `laura/pipeline/.llm-key.json`:

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
