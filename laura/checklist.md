# Checklist — VibeCheck / Opportunity OS

Working checklist for the demo build. Owners per the split we agreed: Laura =
frontend + call stack, Sun = reasoning agents + video/deck, Martin = founder
scoring + evidence. Ordered by demo value; strike-through nothing — check it.

## Agent handoff brief (read this first if you're an AI agent picking this up)

**Repo rules:** one folder per person; write ONLY in your principal's folder
(root `AGENTS.md`). Laura's work is all under `laura/`. Commit style: short
lowercase imperative subject, detail in the body, `Co-Authored-By` trailer.

**What is implemented and working (verified by running it):**

1. `laura/frontend/index.html` — single-file investor UI ("VibeCheck Studio"):
   opportunity inbox → interview studio; light/dark theming; webcam+mic in
   either founder seat (mic drives that founder's energy meter); BATNA/ZOPA
   chart with draggable investor reservation point; decision-ready approval
   sheet; Sun's Sourcing→Developing→Matching pipeline as the in-app stepper.
   Two run modes: scripted demo (file://) or live SSE (`http://localhost:4173`).
2. `laura/pipeline/` — zero-dependency Node (18+, ESM): `sourcing.js` and
   `developing.js` implement stages 1–2 of `sun/system-architecture.md`;
   `lib/card.js` serializes cards per `sun/opportunity-card.md`;
   `lib/events.js` implements the event schema with founder-safe role gating;
   `serve.js` streams real pipeline + interview events over SSE and handles
   `POST /approve`. `node run-demo.js` and `node serve.js` both work today.
3. Config/contracts (change these only deliberately, they are shared):
   - `laura/pipeline/thesis.json` — ALL fund/evaluation criteria, single source
     (mapping to Sun's spec: `laura/vc-criteria.md`)
   - event schema: `laura/stitch-ai-prompt.md` §3.3 — the UI↔agent contract
   - `sample/research-acme.json` — exact return shape a research agent must
     produce; `sample/interview-acme.json` — exact events an interview agent
     must emit. Replace contents, not shapes.

**Not implemented (see backlog below):** LiveKit rooms, Deepgram transcription,
Claude calls inside the AGENT HOOKs, founder scoring function, GitHub
verification, ElevenLabs voice, the founder-view page.

**Known cross-team issues:** status-vocab conflict in Sun's files and the
unmerged `numeric-confidence-trust` branch — details in `laura/note-for-sun.md`.

## Done ✅

- [x] Interview studio frontend (light/dark, ZOPA chart, vibe meters, transcript)
- [x] Sun's conceptual pipeline as the in-app stepper with input/output/how details
- [x] Webcam + mic in either founder seat; live audio drives that founder's energy meter
- [x] Sourcing stage in JS (`pipeline/sourcing.js`) — intake → card with sourced claims
- [x] Developing stage in JS (`pipeline/developing.js`) — corroboration, contradictions,
      gaps, hypotheses, axes, BATNA model + ZOPA, draft terms, human gate
- [x] Event schema frozen (`stitch-ai-prompt.md` §3.3) + working bus with founder-safe
      role gating (`pipeline/lib/events.js`)
- [x] Thesis/criteria as single JSON source (`pipeline/thesis.json`, see `vc-criteria.md`)
- [x] **Live server** (`pipeline/serve.js`): serves frontend, streams pipeline + interview
      over SSE, `POST /approve` human gate — `node serve.js` → http://localhost:4173
- [x] **Inbox screen** — ranked opportunity queue, click Acme → studio
- [x] **Approval sheet** — decision-ready bottom sheet with Approve / Send back
- [x] **Draggable reservation point** — investor drags the bound, ZOPA recomputes
- [x] Count-up number animation on meters; reduced-motion + focus-visible support

## Next up (unlocks the live demo)

- [ ] **LiveKit room in the founder tiles** (Laura)
  1. `npm create livekit-app` or plain client SDK; LiveKit Cloud free tier
  2. Token endpoint in `serve.js` (`/token?room=INT-001&who=ada`)
  3. Replace `getUserMedia` seat logic with room participants; keep local fallback
- [ ] **Live transcription** (Laura)
  1. Deepgram streaming WS from the room's mixed audio
  2. Emit `transcript.line` into the same SSE/WS stream
- [ ] **Claude in the AGENT HOOKs** (Sun)
  1. Replace `sample/research-acme.json` with a research agent returning the same shape
  2. Interview agent: reads card hypotheses/gaps → next question; emits `card.update`
  3. Model: claude-sonnet-5 for hooks; keep canned JSON as offline fallback
- [ ] **Founder scoring function** (Martin)
  1. Implement the 5 sub-scores from `founder-axis-scoring.md` over transcript + card
  2. Respect floors (ceiling traits) and combination rules from `thesis.json`
  3. Emit as `signal.update` / founder-score `card.update`
- [ ] **GitHub verification** (Martin or Laura)
  1. `GET /users/:user/events` + repo history for the CTO claim
  2. One real corroboration in the demo: "CLM-002 verified via commit history"

## Polish (cut first if time runs short)

- [ ] ElevenLabs voice for the agent tile (speak the scripted questions)
- [ ] Founder view page (from the Stitch prompt §2b) served at `/founder`, fed by
      the founder-safe stream — two screens side by side on stage
- [ ] Evidence drawer: click any CLM/CON/GAP chip → ledger row
- [ ] Split `index.html` into `app.js` + `styles.css` once WebSocket lands
- [ ] `⌘K` quick-jump; Space = play/pause

## Team blockers (not code)

- [ ] Sun: reconcile status vocab (card template vs tech spec §4.2) — `note-for-sun.md`
- [x] ~~Sun: review/merge `numeric-confidence-trust`~~ merged to main 2026-07-19;
      Sun to review post-merge (it edits his card files)
- [ ] All: freeze event schema §3.3 as the contract (then it only changes by team decision)
- [ ] Record the 60-second video from `sun/tech-video-staging/pitch-deck.md`

## Demo-day run commands

```bash
# live mode (real pipeline events + approval gate)
cd laura/pipeline && node serve.js     # → http://localhost:4173

# offline fallback (venue wifi dies): double-click laura/frontend/index.html
# pipeline only (terminal proof): node run-demo.js
```
