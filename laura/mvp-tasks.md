# MVP Tasks — VC Brain Challenge Brief → Implementation

Maps the 8 MVP requirements from the Maschmeyer challenge brief to what exists
in this repo, with build details for each. Check items off as they land.
Companion docs: `checklist.md` (agent handoff), `vc-criteria.md` (criteria ↔
Sun's spec), `stitch-ai-prompt.md` §3 (event contract).

## 1. Thesis Engine ✅ core / 🔲 UI

- [x] **Fund thesis as single config** — `laura/pipeline/thesis.json`: sectors,
      stage, geography, check size, ownership target, risk appetite, founder
      sub-score weights + ceiling floors, evidence/trust rules.
- [x] **Every recommendation filtered through it** — `pipeline/developing.js`
      `assessThesisFit()` + the negotiation model derive targets/reservation
      from thesis values; `run-demo.js` and `serve.js` both consume it.
- [ ] **Investor-editable thesis UI** — build: a nexus `/thesis` route with a
      form bound to the thesis fields; POST to a `/thesis` endpoint added in
      `serve.js` (or vite middleware) that rewrites `thesis.json`; pipeline
      rerun picks it up. ~1–2h.

## 2. Smart Data Collection & Management ✅

- [x] **Structured heterogeneous collection** — `laura/opportunity-db/`:
      22 real companies from portfolio pages, press releases, about pages,
      YouTube, Crunchbase, GitHub; per-company assets (logos, company.json);
      `check.md` documents the background-check pass.
- [x] **Validation & honest states** — evidence ledgers with 0–100 trust,
      `claimed/verified/contradicted`, `unknown ≠ false`; BOM/format fixes;
      founder evaluations for real people intentionally `not assessed`.
- [x] **Single source of truth served everywhere** — vite middleware +
      `serve.js` serve `laura/opportunity-db` to both frontends; no copies.
- [x] **Synthetic full-consent tier** — seeded faker cohort with contacts,
      portraits, sub-scores (`pipeline/generate-fixtures.js`).

## 3. Multi-Attribute Reasoning ✅ rule-based / 🔲 LLM

- [x] **Beyond keyword search** — board command bar parses free text like
      *"technical founder, Berlin, AI infra, traction, no prior VC backing"*
      into AND-ed predicates over structured fields (domain classifier, geo
      table, founder-role check, funding-history check, accelerator signal) —
      `board.tsx parseAttributeQuery()`. Typed or voice (Web Speech API).
- [ ] **LLM fallback for unbounded queries** — build: when the rule parser
      finds nothing, POST the query + deal JSON schema to Claude
      (claude-sonnet-5) asking for a filter spec; same predicate shape.
      Seam already exists (the `!notes.length` branch). ~1h + API key.

## 4. Inbound: Application & Automated Screening ✅ pipeline / 🔲 form

- [x] **Apply (deck + name minimum)** — `sample/intake-acme.json` models the
      minimal application; Sourcing (`sourcing.js`) builds the card from it.
- [x] **Screen (fast first-pass)** — Developing (`developing.js`) corroborates
      claims, flags contradictions, checks thesis fit, and gates at the human
      approval step; full run visible via `node serve.js` event stream.
- [ ] **Public apply form** — build: nexus `/apply` route (company, deck
      upload, founder emails) writing an intake JSON; pipeline picks it up.
      The intake JSON shape is the contract — no new design needed. ~2h.

## 5. Outbound: Identification & Activation ✅ identify / 🔲 activate

- [x] **Identify** — `opportunity-db/synthetic/outbound/`: 10 real
      public-source records (Lovable, Cursor, ElevenLabs, Granola, Clay,
      Synthesia, Helsing, Decagon, Mistral, Mercor) with activity signals,
      rationale, and sources; rendered on the board as "outbound selected",
      founders unassessed.
- [x] **Converge** — outbound records flow through the same `Startup` shape,
      stages, and screening UI as inbound (one funnel).
- [ ] **Activate (outreach draft)** — build: "Draft outreach" button on
      outbound detail → template email citing the activity signal + rationale
      (mailto: or copy-to-clipboard; no real sending at a hackathon). ~1h.

## 6. Multi-Axis Screening ✅

- [x] **Three independent axes, never averaged** — Founder / Market /
      Idea-vs-Market throughout: pipeline assessment, card format, board
      micro-axes, founder psychogram page.
- [x] **Trend + confidence per axis** — card format carries both; numeric
      0–100 convention merged to main.
- [x] **Feeds Memory** — durable founder profiles + `outcome.recorded` event;
      the evaluation-retrospective view shows scored-then vs. real-outcome.

## 7. Evidence-Backed Memos & Trust Score ✅

- [x] **Every claim traces to evidence with confidence** — evidence ledgers
      (CLM/CON/GAP + SRC) with 0–100 trust on all 22 real cards; the memo IS
      the opportunity card (readable end-to-end).
- [x] **External verification + contradiction flagging** — Timefold OSS claim
      upgraded via GitHub org check (45→85); Secfix/deskbird rounds verified
      via press; ARR contradiction (CON-001) modeled in the demo pipeline.

## 8. Investor-Grade UX ✅ / polish ongoing

- [x] **Notion-level approachability** — nexus app: dashboard, deal board
      (kanban/table toggle), portfolio overview with alignments, founder
      psychogram, detail dialogs, AI command bar with voice, Growth Signal
      palette (light+dark), evaluation retrospective with real-life outcomes.
- [x] **Bloomberg-level depth** — trust scores, axes, negotiation model
      (studio), event stream, outcome tracking.
- [ ] **Demo hardening** — click-through rehearsal, empty/error states, the
      offline story (file:// studio fallback exists; nexus needs dev server).

## Cross-cutting build notes

- **Backends**: `laura/pipeline/serve.js` (SSE event stream + approval gate,
  port 4173) and the nexus vite middleware (DB serving, port 8080). Real
  agent calls plug into the marked `AGENT HOOK`s without structural change.
- **Contracts that must not drift**: event schema (`stitch-ai-prompt.md` §3.3),
  `thesis.json`, intake/research/interview sample JSON shapes.
- **Merge state**: Martin's aubergine palette was superseded by Growth Signal
  in the 8971cea merge (his layout/search kept); board.tsx merge kept the
  interactive version including his data-model updates.
