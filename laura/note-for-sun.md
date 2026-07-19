# Note for Sun (from Laura)

Short questions so the frontend and docs stay in sync with your folder:

1. **Conceptual pipeline is now the frontend's stage model.** The interview
   studio (`laura/frontend/index.html`) uses your three stages — Sourcing →
   Developing → Matching — as the pipeline stepper, with your Input/Output/How
   text shown on click. OK to treat the conceptual pipeline as the canonical
   stage model for UI purposes?
2. **Status vocab conflict in your files.** `sun/opportunity-card.md` uses
   `intake | research | interview | diligence | decision | closed`, but the tech
   spec (§4.2 in `sun/system-architecture.md`) lists `Discovered / Interview
   stage / Term sheet sent / Declined / Term sheet signed`. Which one is
   canonical? The event schema in `laura/stitch-ai-prompt.md` currently follows
   the card template.
3. **`numeric-confidence-trust` was merged to main (2026-07-19).** Laura merged
   Martin's branch (0–100 confidence/trust) since the event schema, pipeline,
   and scoring docs already assumed it and the merge was conflict-free. It
   edits two files in your folder (`opportunity-card.md`, the example) —
   please review post-merge and revert/adjust if you disagree; nothing else
   depends on the exact wording.
4. **Event schema freeze.** `laura/stitch-ai-prompt.md` §3.3 defines the
   WebSocket events between UI, interview agent, and scoring. If it looks right
   to you, let's freeze it as the integration contract before we build agents.
