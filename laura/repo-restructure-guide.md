# FirstCheck — Repo Restructure Guide

How to combine the four teammate folders (`Martin/`, `laura/`, `sun/`,
`mehdi/`) into one structured repository, following Sun's architecture
(`sun/system-architecture.md`), the contract in `AGENTS.md`, and standard
security practice. Nothing here is executed yet — this is the plan, staged so
every step keeps the app and tests working.

## Why restructure

The folder-per-teammate layout was right for the hackathon: no merge
conflicts, everyone shipping in parallel. It is wrong for a service, because
the boundaries are people, not components. Sun's architecture describes the
real boundaries — sourcing → developing → matching stages around one
canonical Opportunity Card — and `AGENTS.md` §2/§7 requires services that
communicate through contracts, with the AI gateway as sole key holder. The
repo should mirror those boundaries so ownership, review, and least-privilege
access can attach to components instead of names.

## Target layout

```text
firstcheck/
├── README.md              # stays the only README in the repo
├── AGENTS.md
├── SECURITY.md            # new — required reading per AGENTS.md §1
├── CODEOWNERS             # replaces "write only in your own folder"
├── LICENSE.txt
├── docs/
│   ├── architecture.md    # ← sun/system-architecture.md
│   ├── decisions/         # ADRs; ADR-001 records this migration
│   └── hackathon/         # ← submission-overview.md, sun/deck, sun/context,
│                          #   sun/research, sun/tech-video-staging (frozen)
├── contracts/
│   ├── opportunity-card.md      # ← sun/opportunity-card.md + example
│   ├── thesis.schema.json       # documented shape of pipeline/thesis.json
│   └── events.md                # SSE/event types emitted by serve.js
├── apps/
│   └── web/               # ← Martin/nexus-vetting-suite
├── services/
│   ├── pipeline/          # ← laura/pipeline (screening, sourcing,
│   │                      #   interviews, assistant — minus the LLM adapter)
│   └── gateway/           # ← lib/llm.js + set-key.js + .llm-key handling:
│                          #   the ONLY component that touches provider keys
├── data/
│   └── opportunity-db/    # ← laura/opportunity-db — canonical source of
│                          #   truth (stays markdown/JSON until a measured
│                          #   need justifies PostgreSQL, AGENTS.md §25)
└── archive/               # ← mehdi/ and anything not referenced by live code
```

What maps where, per teammate folder:

| From | To | Notes |
|---|---|---|
| `Martin/nexus-vetting-suite/` | `apps/web/` | vite middleware endpoints unchanged; only path constants move |
| `laura/pipeline/` | `services/pipeline/` | tests move with it (`services/pipeline/test/`) |
| `laura/pipeline/lib/llm.js`, `set-key.js`, `.llm-key.json` | `services/gateway/` | key custody isolated per AGENTS.md §2 |
| `laura/opportunity-db/` | `data/opportunity-db/` | single source of truth, both frontends keep reading it over HTTP |
| `laura/mvp-tasks.md`, `submission-overview.md`, `vc-criteria.md`, `color-guide.md` | `docs/hackathon/` | frozen record |
| `sun/system-architecture.md` | `docs/architecture.md` | the north-star document |
| `sun/opportunity-card.md` + example | `contracts/` | it is a contract, not a doc — agents validate against it |
| `sun/deck`, `sun/context`, `sun/research`, `sun/tech-video-staging` | `docs/hackathon/` | frozen record |
| `sun/interview-agent.md`, `sun/research-agent.md` | `docs/decisions/` backlog notes | TODO stubs — intent, not implementation |
| `mehdi/` | `archive/` | review contents first; nothing live imports from it |

## Rules for the migration (from AGENTS.md — the ones that bite here)

1. **One move per commit, tests green at every commit.** Never mix a move
   with a behavior change (§3 smallest coherent change, §23). Use `git mv` so
   history follows the file.
2. **Baseline first.** Before phase 1:
   `node --test laura/pipeline/test/interviews.test.js` — record the result.
   Re-run after every phase; both servers must also boot
   (`npm run dev` in the web app, `node …/serve.js`).
3. **Stop-and-ask triggers apply** (§18): this migration changes data
   ownership and endpoint paths — the phase plan below is the approved scope;
   anything beyond it (schema changes, new dependencies, new permissions)
   needs a human decision first.
4. **A frozen worktree.** Agree a merge freeze with all four people before
   phase 2 — moves + concurrent edits to the same files is the one conflict
   git cannot untangle for you (§24).
5. **No history rewrite, no discarded human work** (§16). `mehdi/` and the
   deck material are archived, not deleted.

## Phases

**Phase 0 — prep (no file moves).** Clean worktree, branch
`restructure/monorepo`, run the baseline suite, write
`docs/decisions/ADR-001-monorepo-migration.md` stating this plan.
(`SECURITY.md` already exists — created 2026-07-20 at repo root.) Team signs
off on the freeze window.

**Phase 1 — docs and contracts (zero code risk).** `git mv` the doc rows
from the table above. Nothing imports these paths; only README links change.
One commit.

**Phase 2 — data.** `git mv laura/opportunity-db data/opportunity-db`, then
update the path constants that reference it (the vite middleware in
`apps/web/…/vite.config.ts` and the pipeline's DB path constant — grep for
`opportunity-db` and fix every hit in the same commit). Verify:
`GET /opportunity-db` serves cards, suite green. The gitignored
`laura/pipeline/inbox/` moves with the pipeline in phase 3 — keep its
`.gitignore` entry in the same commit as the move.

**Phase 3 — apps and services.** Two commits:
`git mv Martin/nexus-vetting-suite apps/web`, fix path constants, boot the
app, click through board + apply. Then
`git mv laura/pipeline services/pipeline`, fix imports, run the suite and
`serve.js`. The README quick-start commands change in the same commits.

**Phase 4 — extract the gateway.** Move `lib/llm.js`, `set-key.js`, and the
key store into `services/gateway/` with one exported interface; pipeline and
web call that interface and can no longer read the key file directly. This is
the first *behavioral* change, so it follows §23 red/green: a test proving
the pipeline has no key access precedes the move. After this phase, provider
keys exist in exactly one component (AGENTS.md §2).

**Phase 5 — ownership and guardrails.** Add `CODEOWNERS`
(`/apps/web/ @martin`, `/services/pipeline/ @laura`, `/contracts/ @sun`, root
contracts require two reviews), enable branch protection + secret scanning on
the remote, delete the then-empty teammate folders, update the README layout
table to the new structure. The "one folder per person" rule in AGENTS.md is
replaced by CODEOWNERS in the same commit.

## Security checklist (verify at the end of every phase)

- `.llm-key.json` and `inbox/` still gitignored at their new paths; `git
  status` shows neither.
- No provider key readable outside `services/gateway/` (phase 4 onward).
- SSRF/robots checks in the transcript fetcher unchanged — the interview
  suite's policy tests still pass.
- No secrets in any moved file's history (`git log -p --follow` spot-check on
  moved config files).
- Demo password gate still labeled demo-only; no real auth claims added.
- Every phase's commit list matches the phase plan — no unrelated diffs
  hiding in moves (§15).

## Deploy alignment (verified 2026-07-20)

Findings from an actual local build (`npm run build` in the web app):

1. **The backend does not exist in production builds.** ~~Every endpoint is
   vite dev-server middleware and runs only under `vite dev`.~~ **Fixed
   2026-07-20:** the endpoints were extracted into
   `laura/pipeline/app-endpoints.js` (one implementation, imported by the vite
   plugin in dev and by `laura/pipeline/app-server.js` in production, which
   also spawns/proxies the built SSR app). Build with
   `NITRO_PRESET=node-server`, run `node laura/pipeline/app-server.js` —
   verified locally: SSR pages, DB serving, and term-sheet generation all
   answer on one port. This is also the phase-4 gateway split half-done: the
   endpoints now live with the pipeline, not the frontend config.
2. **The build targets Cloudflare, not GitHub Pages.** `vite build` produces
   an SSR worker (`.output/server` + generated `wrangler.json`) and
   `.output/public` has **no index.html** — GitHub Pages would serve assets
   but no page. The `.github/workflows/deploy.yml` Pages workflow can be made
   to upload the right folder (`.output/public`), but the site still cannot
   render there. The aligned deploy target is Cloudflare
   (`npx nitro deploy --prebuilt`), or a Node host running the nitro output.
3. **The database is files inside the repo.** `laura/opportunity-db/` is
   read via filesystem paths that exist only on a dev machine. For deploy,
   the data needs a hosted store the backend can reach (PostgreSQL per
   AGENTS.md §25 — deploy is the measured need) with the markdown DB
   imported, or as an interim step, the pipeline server hosting the folder.
4. **Large media is committed to git** (~5 MB of mp4/mp3/png demo avatars in
   `Martin/nexus-vetting-suite/public/` and `sun/deck/`). Per AGENTS.md §25
   these belong in object storage; at minimum the deploy artifact should not
   grow with every demo asset.

## When this is done

The repo mirrors Sun's architecture: contracts in one place, the card as
canonical record in `data/`, stages as services, keys in one custodian,
history preserved, and ownership attached to components. PostgreSQL, queues,
or a workflow engine come later — only when a measured requirement justifies
them (AGENTS.md §25), not as part of this move.
