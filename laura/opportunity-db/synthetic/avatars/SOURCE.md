# Avatar provenance

- `FND-*.png` — selected from the Figma Community pack "500 AI-generated
  avatars" (AI-generated faces; **no real persons depicted**), matched to each
  synthetic founder's explicit `sex` field in `../index.json`. Only the 14
  matched portraits are committed; the full 500-image zip stays local and
  gitignored (`laura/.gitignore: *.zip`).
- `FND-*.svg` — dicebear "notionists" placeholders (CC0), kept as fallback.
- Matching performed 2026-07-19 via labeled contact sheets; assignment script
  logic lives in the session notes / `pipeline/generate-fixtures.js` keeps
  `.png` precedence on regeneration.
