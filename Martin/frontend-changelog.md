# Frontend Changelog — VibeCheck Studio

Running log of changes made to `laura/frontend/` (the interview studio + founder
psychogram). **Always kept up to date** as further edits land.

Files touched:
- `laura/frontend/index.html` — live interview dashboard
- `laura/frontend/founder.html` — founder personality / psychogram page (new)
- `laura/founder-axis-scoring.md` — scoring model (added the team complementarity score)

Status: **merged into local `main`** (2 commits ahead of `origin/main`); **not yet pushed**.

---

## 2026-07-18 · Round 3 — merge with Laura's `origin/main`

Pulled Laura's 4 new commits (sourcing/developing pipeline in JS, live server,
**inbox / opportunity-list view**, approval gate, VC criteria config, Maschmeyer
opportunity DB) and merged my `frontend-psychogram` branch into `main`.

- **Clean merges:** `founder.html`, `Martin/frontend-changelog.md`, and
  `founder-axis-scoring.md` (§5a) — no overlap with Laura's work.
- **One real conflict — `index.html`:** Laura independently restructured the same
  header/hero, adding an **inbox landing → click into studio** flow (`inboxView` /
  `studioView` toggle, `‹ Opportunities` back button) driven by new JS, and she
  **kept the hero**. Resolution: kept Laura's more complete structure intact (so
  her view-toggle JS keeps working) and re-applied my **"See details →" link** on
  the Vibe-check panel (→ `founder.html`). The panel-head / breadcrumb / see-details
  **CSS auto-merged** and is retained.
- **⚠️ Superseded — needs a decision:** my earlier **hero removal + top-left
  breadcrumb** on `index.html` were dropped in favour of Laura's hero + inbox
  landing. If we still want the hero gone / the breadcrumb in on top of Laura's new
  structure, that's a follow-up (the breadcrumb CSS is already present and unused).

---

## 2026-07-18 · Round 2 — team overview, behavioral-on-left, quotes, back nav

**`founder.html`**
- **Layout rearranged.** Left column now holds the **psychogram + Live behavioral
  signals**; right column holds **Axis breakdown & evidence + the "How to read this"
  caveat**.
- **New "Team overview" tab** (third tab beside Ada / Minh):
  - **Overlaid psychograms** — both founders' spider diagrams on one radar (Ada
    blue, Minh green) with a legend, showing where they reinforce each other vs.
    where one covers the other's softer axis.
  - **Complementarity score** (71/100) broken into three visible components:
    Skill complementarity (85), Decision clarity (74), Pressure-tested history
    (45) — headline **gated by the weakest component, not the mean**.
  - **Team dynamic cards** — Complementary skill sets (Strong), Clear
    decision-maker (Present), Worked together under pressure (Unproven) — plus an
    assessment note.
- **Live quotes added to the axis breakdown.** Each sub-score now shows a
  transcript quote ("Live evidence" with an INT-001 timestamp) explaining *why*
  the system believes the score, pulled from the interview in `index.html`
  (e.g. Ada Autonomy → "The first took nine days on site… the second was live in
  under two days.").
- **Back navigation** — breadcrumbs (Source › Develop › Match) are now clickable
  links back to the live interview, the "← Live interview" header pill is styled
  as a button, and an explicit "← Back to live interview" button sits above the
  tabs.

**`laura/founder-axis-scoring.md`**
- Added **§5a — Team Complementarity Score**: a team-level number computed from
  skill complementarity, decision clarity, and pressure-tested history, gated by
  the weakest component and never an average of the two founders' individual
  scores. This is the model behind the new Team overview tab.

---

## 2026-07-18 · Round 1 — dashboard cleanup + psychogram page

**`index.html` (live interview) — turned from a landing page into a dashboard**
- **Removed** the hero headline/subhead ("The interview is the diligence…") and
  the centered pipeline row.
- **Pipeline moved to a top-left breadcrumb** in the header:
  `✓ Source › ✓ Develop › [Match]` (Source/Develop show a green check, Match is
  the active pill). Opportunity ref, live status pill, and deadline sit on the
  right; the breadcrumb hides on narrow screens.
- **"See details →" link** added to the top-right corner of the "Vibe check —
  live signals" card, linking to the new founder page.

**`founder.html` — new founder personality overview page**
- Self-contained, shares the exact theme + light/dark toggle; deep-linkable via
  `?id=FND-0007` / `?id=FND-0008`.
- Ada / Minh tabs, identity row with the composite Founder Score badge.
- **Psychogram** — a 5-axis SVG spider diagram (no libraries): Resilience,
  Autonomy, Curiosity/adaptability, Perseverance, Co-founder complementarity.
- Axis breakdown with per-axis confidence + evidence source, two live behavioral
  signals (Stage clarity, Response to challenge), team dynamic, a "How to read
  this" caveat box, and a sources list (PNAS, Founder Institute, EQT, Wasserman).

---

## Open items / notes
- Per-founder axis numbers (e.g. Ada Resilience 82) are plausible estimates
  consistent with the card's 76/72 snapshots and the interview narrative — the
  docs supply the *model*, not the individual numbers. Tune as needed.
- All changes live on the working tree only. Decide whether to commit on a branch
  (e.g. `psychogram-detail`) to avoid colliding with Laura's work on `main`.
