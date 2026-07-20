# Navigation structure — investor app

How the app is laid out after the horizontal redesign. Two levels: a thin
sidebar for top-level areas, and a horizontal stage bar for movement through a
deal.

## Sidebar — top level only

Three entries, nothing else:

| Entry | Route | What it is |
| --- | --- | --- |
| **Board** | `/board` | Overview of all applicants + invested companies |
| **Pipeline** | → `/memo` | The deal flow (see below) |
| **Settings** | `/settings` | Fund and account settings |

Pipeline has **no landing page of its own**. `/` redirects into the first stage,
and the sidebar entry points straight at it. The old dashboard (funnel, metrics,
top-screened list) was removed — Board covers that ground. It remains in git
history at `src/routes/index.tsx` if a widget needs to be recovered.

The Pipeline entry stays highlighted while you are inside any stage.

## Stage bar — movement through a deal

A horizontal breadcrumb pinned below the header, rendered on pipeline routes
only. Defined once in `src/components/PipelineStages.tsx` and injected by
`AppShell`; the stage routes themselves know nothing about it.

```
Company snapshot  ›  Founder profiles  ›  Agent interview  ›  Due diligence
```

| Stage | Route | Contents |
| --- | --- | --- |
| **Company snapshot** | `/memo` | The decision memo — snapshot, hypotheses, SWOT, evidence |
| **Founder profiles** | `/founder` | Per-founder psychogram, surfaced instead of buried |
| **Agent interview** | `/interviews` | Live AI interview; tests the hypotheses |
| **Due diligence** | `/diligence` | Human approval gate + term sheet |

States: completed stages show a check, the active stage is filled, later stages
stay muted. Order comes from the `PIPELINE_STAGES` array — reorder or add a
stage there and the bar, the redirect target, and the sidebar all follow.

### Off-nav routes

`/applications` and `/references` are still live and reachable from search and
in-page links; they are simply not in the sidebar or the stage bar.

## Access and profile switcher

Two separate mechanisms, deliberately kept both:

- **Login gate** (`src/lib/auth.ts`, `/login`) decides *who you are*. Logged-out
  visitors are sent to the public `/apply` surface; the investor app is behind
  the gate. Demo-grade client flag, not security.
- **Profile switcher** (header, top-right) lets an already-authenticated
  investor *preview* the startup side without logging out. Persists in
  `localStorage`.

| View | Sidebar | Stage bar |
| --- | --- | --- |
| **Investor** | Board · Pipeline · Settings | shown |
| **Startup** | Your application · Settings | hidden |

State lives in `src/lib/view-mode.tsx`. It deliberately renders `investor` on
first paint (server and client) and adopts the stored value after mount, so
hydration does not mismatch.

## Inbound applications

Submitting the apply form runs a chain, all of it server-side in the dev
middleware (`vite.config.ts`):

1. `POST /apply` normalizes the submission into the pipeline intake shape
   (`normalizeApplication`) and screens it against the fund thesis.
2. `buildFounderProfiles()` runs on those normalized founders: it uses the
   LinkedIn URL the form requires, then drafts the personality hypotheses the
   agent interview must test.
3. The record is written to `laura/pipeline/inbox/` (gitignored).
4. `GET /applications` serves them back.

The board reads that endpoint and renders the card in the **same shape as every
other card** — no special-casing — landing in the `Screened` column with the
pass/fail verdict attached. The founder page shows the generated profiles and
their hypotheses above the Acme psychogram.

**Nothing generated here is scored.** Applicants are real people; the profiles
carry hypotheses with a stated basis and are marked unassessed until the
interview supplies evidence. This follows the existing guardrail that real
founders are never given fabricated psychometric judgments.

## Frontend-only runtime

The app is now a static Vite SPA. `src/lib/browser-api.ts` owns browser-local
thesis, application, demo-account, and feedback state. The synthetic fixture
index is bundled at build time by `src/lib/synthetic-opportunities.ts`.

There are no runtime endpoints. Features that previously required trusted
credentials or external side effects are unavailable in the static build:
live ElevenLabs calls, email delivery, provider-key storage, and web research.
The scripted interview, invitation preview, fictional outbound scan, local
Checky lookup, screening, and term-sheet preview remain interactive.

See `FRONTEND_ONLY_MIGRATION.md` for build, deployment, and trust-boundary
details.

## Previous backend reference

`laura/pipeline/` is unchanged and still drives the data. It is now **API-only**:
the standalone HTML site it used to serve (`laura/frontend/`) was removed in
favour of this app.

| Endpoint | Purpose |
| --- | --- |
| `GET /events` | SSE stream of pipeline + interview events |
| `POST /approve` | Fires the human approval gate |
| `GET /thesis` | Fund criteria from `thesis.json` |
| `GET /opportunity-db/*` | Opportunity cards and logos |

The investor app's own dev endpoints (in `vite.config.ts`, not `serve.js`):

| Endpoint | Purpose |
| --- | --- |
| `POST /apply` | Screen an application, profile its founders, file it |
| `GET /applications` | Everything in the inbox, newest first |
| `GET`/`POST /thesis` | Fund criteria |

Run it with `node laura/pipeline/serve.js` (port 4173). Requests to `/` now
404 by design — there is no static frontend behind it any more.

The sourcing/developing engine (`sourcing.js`, `developing.js`, `lib/screening.js`,
`lib/thesis.js`, `thesis.json`) is untouched. It generates `opportunity-db/index.json`,
from which `src/lib/official-opportunities.ts` is derived.
