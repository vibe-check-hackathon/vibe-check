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
3. **Please review/merge `numeric-confidence-trust`.** Martin's branch (0–100
   confidence/trust) edits files in your folder, so it's your call. The event
   schema and Laura's scoring docs already assume the 0–100 convention.
4. **Event schema freeze.** `laura/stitch-ai-prompt.md` §3.3 defines the
   WebSocket events between UI, interview agent, and scoring. If it looks right
   to you, let's freeze it as the integration contract before we build agents.
