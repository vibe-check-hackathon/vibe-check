# Note For Martin

I merged Laura's official opportunity cards into `Martin/nexus-vetting-suite` as self-contained frontend data:

- `src/lib/official-opportunities.ts` is generated from `laura/opportunity-db/index.json`.
- Logos and markdown cards are copied into `public/opportunity-db/...` so the Lovable/Vite frontend can serve them directly.
- Real founders are shown as public-source names with neutral initials only. They remain unassessed; the founder psychogram/scoring still applies only to the fictional Acme demo.

