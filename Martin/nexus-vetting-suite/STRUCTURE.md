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

## Backend

`laura/pipeline/` is unchanged and still drives the data. It is now **API-only**:
the standalone HTML site it used to serve (`laura/frontend/`) was removed in
favour of this app.

| Endpoint | Purpose |
| --- | --- |
| `GET /events` | SSE stream of pipeline + interview events |
| `POST /approve` | Fires the human approval gate |
| `GET /thesis` | Fund criteria from `thesis.json` |
| `GET /opportunity-db/*` | Opportunity cards and logos |

Run it with `node laura/pipeline/serve.js` (port 4173). Requests to `/` now
404 by design — there is no static frontend behind it any more.

The sourcing/developing engine (`sourcing.js`, `developing.js`, `lib/screening.js`,
`lib/thesis.js`, `thesis.json`) is untouched. It generates `opportunity-db/index.json`,
from which `src/lib/official-opportunities.ts` is derived.
