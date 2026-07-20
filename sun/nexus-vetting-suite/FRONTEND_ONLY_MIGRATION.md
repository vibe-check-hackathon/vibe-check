# Frontend-only migration

## Goal

Build one static `dist/` directory that runs in a browser without a Node,
Nitro, Wrangler, worker, or API runtime. The development and build toolchain
still uses Node because Vite and npm are build tools, not deployed services.

## Completed

1. Replaced TanStack Start SSR with a plain Vite + React SPA entry.
2. Switched routing to hash history so GitHub Pages can refresh any route.
3. Removed the Nitro/Cloudflare server entry, backend Vite middleware, and
   TanStack Start dependency.
4. Bundled the synthetic opportunity index at build time.
5. Replaced thesis, application, founder-account, scan, and session persistence
   with browser `localStorage` adapters.
6. Replaced remote screening, board query, Checky lookup, invitation preview,
   and term-sheet generation with deterministic browser logic.
7. Disabled email delivery and live ElevenLabs sessions. Static pages cannot
   safely hold provider credentials or perform trusted external side effects.
8. Removed broken opportunity-card and logo URLs that depended on backend file
   serving; the UI uses initials and bundled records instead.

## Deployment

```bash
npm ci
npm run lint
npm run build
```

Publish the contents of `dist/` to GitHub Pages. The generated `index.html`
uses relative asset URLs and all app routes live below `#/`, so no Pages SPA
rewrite is required.

## Browser demo boundaries

- Investor demo login: `investor@firstcheck.demo` / `growth-signal`.
- Login state and founder passwords are browser-only simulation, not security.
- Submitted records never leave the current browser and can be cleared with
  site-data controls.
- Checky is a local keyword lookup over bundled records, not an LLM or verified
  research system.
- Outbound scans add fictional `.example` records only; they do not browse.
- Invitation sending, live voice sessions, private data, and provider-key
  handling are intentionally unavailable.

## Follow-up

Add a repository-root GitHub Pages workflow that runs the commands above with
`working-directory: sun/nexus-vetting-suite` and uploads `dist/`. The root
workflow is outside this folder's ownership boundary and should be reviewed by
the repository owner before enabling deployment.
