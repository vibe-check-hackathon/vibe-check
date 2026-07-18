# Stitch AI Prompt — VibeCheck Interview Studio (Video Frontend)

Copy-paste prompts for generating the video-call frontend design in
[Stitch](https://stitch.withgoogle.com) (Google's prompt-to-UI tool), plus a
detailed description of how the tech backend behind that frontend could work —
so the design and the eventual implementation line up.

Everything here describes **the frontend in `laura/frontend/index.html`** taken
to production quality. Only Laura's folder; no changes to sun/ or Martin/.

**Two roles, two views.** The app has an **investor view** (everything: vibe
signals, negotiation model, ZOPA) and a **founder view** that deliberately hides
all of that — founders must never see the investor's BATNA/reservation numbers,
the live vibe scores, or which hypotheses are being tested (it would poison the
signal and hand over negotiation leverage). The split is enforced in the backend
(§3.3), not by hiding UI elements.

---

## 1. Investor view prompt (paste into Stitch)

```text
Design a desktop web app called "VibeCheck Studio" — a live AI-run investor
interview room. Dark, premium, Apple-keynote aesthetic: near-black background
(#0d0d0d), soft glass panels (#1a1a19 with 1px white/10% hairline borders,
18px radius), SF Pro-style system font, generous spacing, one restrained blue
accent. No clutter; it should feel like a broadcast studio, not a dashboard.

Layout: sticky top bar + two-column main area (60/40).

Top bar: product name "VibeCheck Studio", a reference chip "OPP-2026-0001 ·
Acme Robotics · Pre-seed", a pulsing green "INTERVIEWING" status pill, and a
countdown "Decision deadline in 14h 22m" on the right.

Left column, stacked:
1) Video call stage: two equal video tiles side by side (founders "Ada Keller —
CEO" and "Minh Tran — CTO"), and one wide short tile below for the "Interview
Agent". Each tile has a glass nameplate bottom-left with an animated audio
waveform, and a small live-signal chip top-right showing an expression readout
like "Engaged" or "Hesitant". The active speaker's tile gets a 2px blue
outline.
2) Transcript panel: timestamped lines (time, speaker, text). Agent system
events (card updates, hypothesis results) render in amber. Controls: a primary
"Play demo" pill button, a secondary "Restart", and a small caption noting it
is a scripted simulation.

Right column, stacked:
1) "Vibe check — live signals" panel: for each founder a block with three thin
horizontal meters (Sentiment, Energy/tone, Confidence) showing 0–100 values,
then two stat tiles side by side: "Founder–founder fit 82" and
"Founder–investor fit 74", each with a small green delta like "▲ 4 this
session".
2) "Negotiation model — pre-money valuation" panel: a horizontal range chart on
a $6M–$14M axis with three rows — a blue bar "Investor settlement range"
($8M–$12M), an amber band "ZOPA" where the ranges overlap, and a green bar
"Founders settlement range (est.)" ($9M–$13M) — with white target dots on the
blue and green bars, hairline vertical gridlines at $2M steps, axis labels
below, and a legend row. Under the chart: a compact three-row table (Investor /
Founders × BATNA, Reservation, Target), a row of small pill "lever" chips
(valuation, check size, pro-rata, closing speed, board rights, milestones) with
the active one highlighted amber, and a "live model updates" feed of
timestamped one-line entries.

States to design: (a) call in progress as described; (b) end state where the
status pill turns amber "DECISION READY" and a slide-in footer bar appears with
a summary "Recommend: $100K SAFE at $9M cap" plus two buttons: "Approve & draft
term sheet" (primary) and "Send back to diligence" (secondary) — the human
approval gate.
```

## 2. Follow-up prompts (iterate in Stitch, one at a time)

```text
Add a collapsible right-edge drawer showing the Opportunity Card summary:
recommendation, three assessment axes (Founder / Market / Idea vs. market) each
with rating, trend arrow, and a 0–100 confidence, and an evidence list of
chips (CLM-003 verified 90, CON-001 contradicted 20, GAP-002 open) that
highlight when mentioned in the transcript.
```

```text
Design the mobile/tablet variant: video tiles stack vertically, vibe meters
collapse into a horizontal strip under the tiles, negotiation model becomes a
bottom sheet.
```

```text
Light-mode variant of the same screens for projection in a bright room.
```

## 2b. Founder view prompt (paste into Stitch as a separate screen)

What the founder sees is a calm, respectful call — not a lab. They know an AI
interview is happening (consent is explicit), but they see none of the analysis.

```text
Design the founder-facing screen of the same "VibeCheck Studio" app — the view
the two startup founders see during their AI investor interview. Same dark,
premium, Apple-keynote aesthetic as the investor view, but warmer and simpler:
this should feel like a well-run video call, not a monitoring dashboard.

Layout: sticky top bar + single centered column (max 900px).

Top bar: "VibeCheck" wordmark, the company name "Acme Robotics — investor
interview", a green "RECORDING — consented" indicator, and a plain-language
menu item "What is analyzed?" that opens a transparency sheet.

Main column, stacked:
1) Video stage: one large tile for the Interview Agent (with waveform and a
subtle "AI interviewer" label), two smaller self-view tiles for Ada and Minh.
Active-speaker outline, mute/camera/leave controls bottom center.
2) "Current topic" card: one line stating what is being discussed right now,
e.g. "Your two pilot deployments", with a soft progress dots row (topic 2 of
6). No hypothesis IDs, no scores, no gap references.
3) "Requests from the interviewer" checklist: concrete, actionable items the
agent has asked for, e.g. "Upload the current revenue export" and "Confirm the
IP assignment with your university" — each with an upload/link button and a
status (requested / received).
4) "Where you are in the process" strip: four steps — Application received →
Research done → Interview (current) → Decision within 24h — with the deadline
shown as a promise to the founder ("You'll have an answer by tomorrow 09:15").

Transparency sheet (opens from top bar): plain-language list of what the AI
does — transcribes the call, checks answers against submitted documents, and
summarizes for a human investor who makes the decision — plus what it does NOT
do (no decision without a human, no data shared outside the fund), and a
"withdraw consent" button that ends analysis.

End state: a closing card "Thank you — your interview is complete. A human
investor reviews the recommendation next. Answer by 09:15 tomorrow." If terms
are approved later, the founder gets a separate clean term-sheet page showing
only the offered terms (amount, instrument, cap, key rights) with an
explanation for each — never the investor's internal ranges.

Explicitly absent from every founder screen: vibe/sentiment/expression meters,
founder scores, fit scores, hypotheses, contradictions, gaps, the negotiation
model, BATNA, reservation points, targets, and the ZOPA chart.
```

---

## 3. How the tech backend could work (implementation blueprint)

The frontend is a thin real-time client; every panel is driven by one event
stream. Suggested architecture, hackathon-sized:

### 3.1 Components

| Component | Role | Candidate tech |
|---|---|---|
| **Video/voice transport** | The actual call: founders join from a browser link; the agent joins as a participant | LiveKit (open source) or Daily; WebRTC under the hood |
| **Conversational agent** | Speaks, listens, decides the next question from the card's hypotheses/gaps | ElevenLabs Conversational AI for voice; Claude API (claude-fable-5 or claude-opus-4-8) for reasoning over the card |
| **Transcription** | Live speech→text with speaker labels and timestamps | Deepgram or Whisper streaming |
| **Signal analysis** | Per-utterance sentiment/tone from text+audio; expression readouts from video frames — always emitted as probabilistic signals with confidence, never facts (Sun's pitch-deck guardrail) | NLP on transcript chunks; MediaPipe face landmarks or Hume AI for expression/prosody |
| **Negotiation model service** | Holds BATNA/reservation/target/opening per party; recomputes ZOPA = intersection of settlement ranges on every update; enforces the no-bluff and reservation-wall rules server-side | Small Python/Node service; deterministic, unit-testable |
| **Opportunity Card store** | The shared state: the markdown card in the repo, updated via the revision/append protocol | Git-backed markdown + a watcher that parses frontmatter |
| **Event bus → frontend** | Fan-out of everything above to the UI | WebSocket (or LiveKit data channels); one JSON event schema |

### 3.2 Data flow

```text
founder browsers ── WebRTC ──► LiveKit room ◄── agent (ElevenLabs voice)
        │                          │
        │ audio/video tracks       │ audio out (questions)
        ▼                          ▲
  Deepgram ASR ──► transcript ──► Claude reasoning loop
        │              │          (reads card: hypotheses HYP-, gaps GAP-,
  MediaPipe/Hume       │           contradictions CON- → picks next question)
  expression/prosody   │                    │
        │              ▼                    ▼
        └─────► signal analyzer ──► negotiation model service
                       │                    │ (ZOPA recompute, lever updates)
                       ▼                    ▼
                 event bus (WebSocket) ──► frontend panels
                       │
                       ▼
             card writer (append-only updates, revision++)
```

### 3.3 The event schema (one stream drives every panel)

```json
{ "type": "transcript.line",  "t": "00:41", "who": "ada",  "text": "..." }
{ "type": "signal.update",    "who": "ada", "sentiment": 84, "tone": 86,
  "confidence": 85, "expression": "engaged", "signalConfidence": 0.62 }
{ "type": "card.update",      "ref": "HYP-001", "state": "supported",
  "evidence": "INT-001 08:14-10:02" }
{ "type": "model.update",     "party": "founder", "range": [9, 13],
  "zopa": [9, 12], "lever": "closing_speed", "note": "speed > price signal" }
{ "type": "status.change",    "status": "decision_ready",
  "recommendation": "100K SAFE at 9M cap", "requiresHuman": true }
```

Frontend mapping: `transcript.line` → transcript panel; `signal.update` → meters
and tile chips; `card.update` → amber event lines + evidence drawer;
`model.update` → ZOPA chart animation + levers + updates feed; `status.change` →
status pill + approval footer. The scripted demo in `laura/frontend/index.html`
is exactly this event stream hardcoded — swapping the hardcoded array for the
WebSocket makes the demo real without touching the UI.

**Role-gated fan-out (the founder-view protection):** clients authenticate into
the WebSocket with a role (`investor` | `founder`). The server filters the
stream per role — founder clients receive only `transcript.line` (their own
session), a new `topic.change` event, `request.item` events (document asks),
and founder-safe `status.change` payloads. `signal.update`, `card.update`,
`model.update`, and internal recommendation fields are **never sent to founder
connections** — filtered server-side, so nothing sensitive ever reaches the
founder's browser to be "hidden" by CSS. This also keeps the demo honest: the
two views can run side by side on stage from the same live stream.

### 3.4 Guardrails (enforced in the backend, not the UI)

1. **No-bluff:** the negotiation service only exposes leverage backed by a
   verified evidence ID; the agent cannot cite an alternative that isn't a named
   OPP- record.
2. **Reservation wall:** any proposal crossing the human-approved reservation
   point is rejected server-side and emits a `status.change` escalation instead.
3. **Probabilistic signals:** every `signal.update` carries `signalConfidence`;
   the card writer stores signals as evidence-linked observations, never as
   claims about personality.
4. **Human gate:** `decision_ready` requires an explicit human action in the UI
   before any founder-facing artifact is generated.
5. **Information asymmetry by construction:** the founder never receives
   analysis or negotiation events (see role-gated fan-out above); consent state
   is recorded on the card, and withdrawing consent stops signal analysis
   server-side.

### 3.5 Hackathon build order

1. LiveKit room + Deepgram transcript into the existing UI (replaces scripted
   transcript).
2. Claude loop reading `sun/opportunity-card-example.md` structure to pick
   questions (read-only), writing updates to a card copy in `laura/`.
3. Negotiation service with ZOPA recompute → live chart.
4. ElevenLabs voice for the agent tile.
5. Expression/prosody signals last — they are the demo's garnish, not its core.
