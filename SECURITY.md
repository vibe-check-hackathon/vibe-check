# Security

## Reporting

Found a vulnerability or an exposed secret? Tell the team directly (repo
issues are public — do not post details there). If a real credential is
committed anywhere, treat it as burned: rotate it first, clean up second.

## What this system protects

- **Provider and service keys.** LLM keys live in the gitignored 24-hour
  cache `laura/pipeline/.llm-key.json` or in environment variables — never in
  source, logs, images, or Telegram-like surfaces. Only the LLM adapter
  (`laura/pipeline/lib/llm.js`) and service-key store
  (`lib/service-keys.js`) may read them (AGENTS.md §2, §4). The ElevenLabs
  key never reaches the browser: the backend mints short-lived signed URLs.
- **Real people's data.** Real founders are never scored; research runs only
  on consented links; synthetic profiles live on `.example` domains and are
  always labeled synthetic. Full invariants: AGENTS.md §26.
- **Accounts.** Server-verified sessions (`laura/pipeline/lib/accounts.js`) —
  password hashing via Node's `scryptSync` with a per-account salt, HttpOnly
  session cookie, timing-safe comparison. `laura/pipeline/accounts.json`
  (password hashes + salts) is gitignored, never committed. A founder session
  can only ever read its own opportunity's feedback (`/my-feedback` scopes
  server-side by the session's stored `opportunityId`, never by anything the
  client sends) — verified by a role-scoping test in
  `laura/pipeline/test/app-endpoints.test.js`.
- **Every investor-only route now enforces its session server-side**
  (`requireInvestor` in `app-endpoints.js`) — `/applications`,
  `/opportunity-db`, `/thesis` (POST), `/nl-query`, `/outbound-scan`,
  `/assistant`, `/invite`, `/interview-session`, `/term-sheet`,
  `/interview-score`, and `/llm-key` (POST/DELETE). Deliberately public:
  `GET /thesis` and `GET /llm-key` (status only), `/apply` (anyone applies),
  `/integrations` (booleans, no business data, doubles as the health-check
  probe). Every enforced route has an anonymous-rejection test — see the
  `security:`-prefixed tests in `laura/pipeline/test/app-endpoints.test.js`
  and the route matrix in AGENTS.md §33.
- **The network boundary of the fetcher.** Transcript/source fetching
  (`laura/pipeline/lib/transcript.js`) enforces scheme restrictions, SSRF
  refusal (private/loopback/metadata addresses), robots.txt compliance, and
  no hosted-media downloading (AGENTS.md §9). Any change there is a
  heightened-review change (AGENTS.md §15).

## Untrusted input

Web content, uploaded documents, model output, tool output, and dependency
metadata are all untrusted (AGENTS.md §3). Crawled content is data, never
instructions (§7). Path handling in the file-serving endpoints is
traversal-checked and covered by security tests
(`laura/pipeline/test/app-endpoints.test.js`).

## Known non-protections (honest limits)

- Sessions are **in-memory** — a server restart logs everyone out — and
  there is **no password-reset flow** yet for either role. A founder's
  one-time password is shown once, at application time, with no recovery
  path if lost.
- **Sessions are still in-memory** — a server restart logs everyone out —
  and there is still no password-reset flow. Enforcing authorization on
  every route (above) does not fix session durability; those are separate
  gaps, both still open.
- The free-tier deploy (render.yaml) has an ephemeral disk (accounts.json
  included — see `laura/repo-restructure-guide.md` for the path to a real
  database) and no WAF/rate limiting beyond what the code enforces.

## Next security work, in priority order

From an external audit against the account work above (evaluated against
AGENTS.md §33's route matrix and §34's demo/pilot/production gates — full
checklist: `../AGENTIC_AI_WEBSITE_BUILD_AND_RELEASE_CHECKLIST.md`, one level
above this repo). Not started yet; recorded here so the gap is tracked
instead of forgotten:

1. ~~Enforce server-side authorization on every non-public route.~~ **Done
   2026-07-20** — see the route matrix in AGENTS.md §33.
2. Keep the AGENTS.md §33 route/role/ownership matrix current as routes
   change.
3. Add login rate limiting and complete the session lifecycle (rotation on
   auth, idle/absolute timeout, durable cross-process storage).
4. Replace the shared seeded investor account with individual accounts
   before anyone outside the team uses this.
5. Replace the response-delivered founder password with an activation/reset
   token flow.
6. Define explicit agent tool permissions before connecting any private
   founder data to a model call.
7. Do prompt-injection source-to-sink threat modeling for every place
   untrusted content (crawled pages, uploaded decks, model output) reaches a
   sensitive sink (email, another founder's record, a shell).
8. Add append-only audit events for consequential actions (§21, §25).
9. Add cost ceilings, timeouts, cancellation, and retry limits to LLM-backed
   endpoints.
10. Build a representative quality/security/uncertainty evaluation suite
    (§31, §12).

## Checks

Run `node --test laura/pipeline/test/*.test.js` (includes security abuse
tests) before and after any change to the files listed in AGENTS.md §15.
