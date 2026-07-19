# Interview-Ingestion Pipeline (vc-brain)

Turns permitted founder interviews into traceable evidence, Founder Score
features, and `OPP-MGV-*` opportunity cards — integrated with this repo's
existing pipeline (zero-dep Node ESM, thesis.json config, evidence discipline:
claimed ≠ verified, unknown ≠ false, human gate before outreach).

## Architecture

```
interview URL / transcript file / authorized recording
  → checkSourcePolicy        lib/transcript.js   (allow/block/manual_review, robots, SSRF)
  → parse + normalize        lib/transcript.js   (TRN/SEG/SPK ids, timestamps, content hash)
  → transcribeRecording      lib/transcribe.js   (provider abstraction; OpenAI whisper impl)
  → extract claims           lib/interview-extract.js (rule layer + validated LLM pass)
  → corroborate + contradict lib/corroborate.js  (seed-speed-portfolio-enriched.md, opportunity-db)
  → score features           lib/founder-score.js (caps + confidence from thesis.interviewScore)
  → human-review gate        interviews.js       (pending_review/needs_corroboration/approved/…)
  → deterministic Markdown   lib/interview-card.js (new OPP-MGV-INT-* card or enrichment)
```

State: `output/interviews/` (gitignored). Audit copies of enriched cards:
`output/audit/`. Rendered cards: `laura/opportunity-db/interviews/`.

## Setup

No dependencies. Optional LLM refinement + audio transcription use the shared
24h key store: `node laura/pipeline/set-key.js` (OpenAI key required for
whisper transcription; any key enables the extraction refinement pass —
the deterministic rule layer always runs and works offline).

## CLI

```bash
node laura/pipeline/interviews.js ingest  --file sample/interview-acme.vtt --company "Acme Robotics" --speaker "Agent=interviewer"
node laura/pipeline/interviews.js ingest  --url  "https://example.com/founder-interview" --company "Example AI"
node laura/pipeline/interviews.js process --transcript TRN-xxxx [--person "Name"]
node laura/pipeline/interviews.js review  --interview INT-0001            # prints the checklist
node laura/pipeline/interviews.js review  --interview INT-0001 --approve --ack [--notes "..."]
node laura/pipeline/interviews.js render  --interview INT-0001            # new OPP-MGV-INT-* card
node laura/pipeline/interviews.js render  --interview INT-0001 --enrich laura/opportunity-db/OPP-MGV-0002-deskbird.md
```

Tests: `node --test laura/pipeline/test/interviews.test.js` (18 tests incl.
the golden-file render check `test/fixtures/golden-acme-interview-card.md`).

## Source types & permitted use

- **Written interview URL** — http(s) only; robots.txt checked; private hosts
  refused (SSRF); hosted-media platforms (YouTube/Spotify/Vimeo) are blocked:
  supply an authorized local file, your own transcript, or rights-holder
  captions instead. Storage is metadata + excerpts.
- **Local transcripts** — .txt .md .srt .vtt .json; timestamps and speaker
  labels preserved; paragraph anchors generated when timestamps are absent.
- **Authorized recordings** — .mp3 .wav .m4a .mp4 .webm, local files only,
  via the provider abstraction in `lib/transcribe.js`. Add a provider by
  adding one `PROVIDERS` entry (`available()` + `transcribe(path)`).

## Evidence model

Claims carry `source_state` (self_reported / inferred / …) and a separate
`final_verification_state` after corroboration. Credit caps per state live in
`thesis.json → interviewScore.evidenceCreditCaps` (independent_verified 100%
… self_reported 65% … contradicted/unsupported/unknown 0%). Corroboration
sources are pluggable (`lib/corroborate.js SOURCES`): currently the verified
seed+speed portfolio doc and the opportunity-db cards. Corroboration never
overwrites interview claims — it links separate evidence records.
Contradictions (internal or vs. records) are retained in the ledger, cut
confidence, raise diligence questions, and are never silently resolved.

## Scoring

`thesis.json → interviewScore` defines components (product_shipping 25,
domain_depth 20, prior_execution 15, team_complementarity 15,
customer_validation 10, momentum 10, evidence_quality 5), caps, and
confidence weights. Extraction produces feature contributions; deterministic
arithmetic produces `founder_score` and a **separate**
`founder_score_confidence` (identity, attribution, completeness, independent
share, contradiction penalty). Unknowns lower confidence, never the score
direction. No protected characteristics or personality inference — no claim
category exists for them; the LLM pass rejects unknown categories.

## Human review

States: pending_review → needs_corroboration / approved / rejected / blocked.
Approval requires `--ack` of the 9-question checklist; outreach drafts stay
`draft` until approval and reference at most one or two public details, no
internal scores, no surveillance framing.

## Troubleshooting

- `no transcription provider available` — set an OpenAI key or supply a transcript.
- `source needs manual review` — robots.txt disallows; a human must confirm access.
- `LLM pass skipped` — bad/absent key; the rule layer still produced claims.
- Golden test fails after template edits — regenerate the fixture deliberately
  (see test file) and review the diff like any contract change.
