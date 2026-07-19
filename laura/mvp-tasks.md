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
- [x] **Thesis backend endpoints** — `GET/POST /thesis` on both servers
      (nexus vite middleware + `serve.js`) reading/writing `thesis.json`;
      pipeline picks changes up on next run.
- [x] **Investor-editable thesis UI** — Martin's existing Settings page now
      loads the live thesis from `GET /thesis` (hardcoded fantasy values
      removed) and its Edit button works: sectors, stages, geography, check
      size, ownership, risk appetite, max gaps → `POST /thesis` → screening
      and scoring pick it up immediately.

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

## 3. Multi-Attribute Reasoning ✅

- [x] **Beyond keyword search** — board command bar parses free text like
      *"technical founder, Berlin, AI infra, traction, no prior VC backing"*
      into AND-ed predicates over structured fields (domain classifier, geo
      table, founder-role check, funding-history check, accelerator signal) —
      `board.tsx parseAttributeQuery()`. Typed or voice (Web Speech API).
- [x] **LLM fallback for unbounded queries** — when the rule parser finds
      nothing, the board POSTs query + compact deal JSON to `/nl-query`
      (vite middleware), which asks whichever LLM is configured and filters
      the table to the returned ids. Provider-agnostic adapter in
      `pipeline/lib/llm.js` (Claude / OpenAI / local OpenAI-compatible,
      detected from the key); key entered in a terminal via
      `node laura/pipeline/set-key.js`, cached 24h in gitignored
      `pipeline/.llm-key.json`, read per request (no restart). Graceful
      501 when no key. Verified end to end against the live endpoint.

## 4. Inbound: Application & Automated Screening ✅ pipeline / 🔲 form

- [x] **Apply (deck + name minimum)** — `sample/intake-acme.json` models the
      minimal application; Sourcing (`sourcing.js`) builds the card from it.
- [x] **Screen (fast first-pass)** — canonical screen in
      `pipeline/lib/screening.js` (thesis-parameterized: late-stage rounds and
      billion-scale valuations hard-fail with reasons; sector/stage-unclear
      ride along as soft flags), exposed as `POST /screen` on serve.js and
      mirrored in the nexus loader so off-thesis records never reach the
      board. Developing then corroborates, flags contradictions, and gates at
      human approval.
- [x] **Public apply form** — nexus `/apply` route (in the sidebar nav):
      company + deck are required (the brief's minimum bar), optional
      founder/round fields; `POST /apply` runs the canonical screen live and
      answers with pass (+ soft flags for research) or hard-fail reasons;
      applications land as JSON in `laura/pipeline/inbox/` (gitignored) for
      the pipeline to pick up. Verified: Series C app screened out with
      reasons, pre-seed AI-infra app passed.

## 5. Outbound: Identification & Activation ✅ identify / 🔲 activate

- [x] **Identify (mechanism)** — outbound record shape, loader, and board
      rendering exist end to end. The first batch (Lovable, Cursor,
      ElevenLabs, Mistral, Helsing…) was **removed 2026-07-19**: every record
      was Series B+/unicorn scale, i.e. clearly off-thesis for a
      pre-seed/seed fund — and the screening backend now blocks such records
      structurally.
- [x] **Current applications are live** � `laura/opportunity-db/synthetic/index.json`
      exposes `currentApplications` (6 fully synthetic, consent-safe records)
      plus legacy-compatible `opportunities`. Martin's board loader maps these
      to `Startup` records with `synthetic: true`, `currentApplication: true`,
      founder avatars, contact fields, and demo-only sub-scores.
- [x] **Outbound guardrail works** � the same JSON file currently exposes
      `outboundSelected: []`. This is intentional: the earlier public-source
      outbound list was late-stage/unicorn-scale and therefore off-thesis.
      Martin's `loadSyntheticStartups()` also mirrors the canonical screen and
      filters any future outbound record with Series B+ or billion-scale signals
      before it reaches the board.
- [ ] **Identify (re-run on-thesis)** — rescan for genuinely early-stage
      targets (pre-seed/seed, EU-leaning, B2B software: fresh YC/accelerator
      cohorts, new GitHub projects, stealth-exit signals) and add records
      that pass `screenOpportunity`. Research task, ~1–2h.
- [ ] **LLM research handoff** � when asking an LLM to add outbound records,
      constrain it to the thesis before writing files: `stage in {pre-seed,
      seed}`, no Series B+, no unicorn/billion valuation, realistic initial
      check fit (~$100K), B2B software/AI/data/automation, preferably EU/DACH
      or globally accessible. Each candidate must include public source URLs,
      founder names as public facts only, `assessed: false`, neutral initials
      avatars, `activitySignal`, `outboundRationale`, and a markdown card under
      `laura/opportunity-db/synthetic/outbound/`. Run the canonical screen
      before adding to `outboundSelected`.
- [x] **Converge** — outbound records flow through the same `Startup` shape,
      stages, and screening UI as inbound (one funnel).
- [x] **Activate (outreach draft)** — outbound detail dialogs carry a
      copy-to-clipboard outreach draft citing the record's activity signal
      and rationale, framed per the brief ("cold outreach, not cold
      investment — trigger a real application"); shows as soon as on-thesis
      outbound records exist.

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
