# Implementation Checklist — VibeCheck / Opportunity OS

Working checklist for the demo build. Owners per the split we agreed: Laura =
frontend + call stack, Sun = reasoning agents + video/deck, Martin = founder
scoring + evidence. Ordered by demo value; strike-through nothing — check it.

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
- [ ] Sun: review/merge `numeric-confidence-trust`
- [ ] All: freeze event schema §3.3 as the contract (then it only changes by team decision)
- [ ] Record the 60-second video from `sun/tech-video-staging/pitch-deck.md`

## Demo-day run commands

```bash
# live mode (real pipeline events + approval gate)
cd laura/pipeline && node serve.js     # → http://localhost:4173

# offline fallback (venue wifi dies): double-click laura/frontend/index.html
# pipeline only (terminal proof): node run-demo.js
```
