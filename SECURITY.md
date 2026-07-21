# Security

Where this stands today, what's actually enforced (verified, not just
written), and what's still open — kept current in the same commit as
whatever changes it, same rule as everything else in [`AGENTS.md`](AGENTS.md).

## Reporting

Found a vulnerability or an exposed secret? Tell the team directly (repo
issues are public — do not post details there). If a real credential is
committed anywhere, treat it as burned: rotate it first, clean up second.

> **⚠️ This system is at the Demo release gate (AGENTS.md §34), not further.**
> The seeded investor password (`growth-signal`) can't be changed from the
> UI — it's a constant in `laura/pipeline/lib/accounts.js`. Don't treat
> anything here as production-ready until its gate is actually met.

## What's protected

- **Provider and service keys.** LLM keys live in the gitignored 24-hour
  cache `laura/pipeline/.llm-key.json` or in environment variables — never in
  source, logs, images, or Telegram-like surfaces. Only the LLM adapter
  (`laura/pipeline/lib/llm.js`) and service-key store (`lib/service-keys.js`)
  may read them (AGENTS.md §2, §4). The ElevenLabs key never reaches the
  browser: the backend mints short-lived signed URLs.
- **Real people's data.** Real founders are never scored; research runs only
  on consented links; synthetic profiles live on `.example` domains and are
  always labeled synthetic. Full invariants: AGENTS.md §26.
- **Accounts.** Server-verified sessions (`laura/pipeline/lib/accounts.js`) —
  password hashing via Node's `scryptSync` with a per-account salt, HttpOnly
  session cookie, timing-safe comparison. A founder session can only ever
  read its own opportunity's feedback (`/my-feedback` scopes server-side by
  the session's stored `opportunityId`, never by anything the client sends)
  — verified by a role-scoping test in
  `laura/pipeline/test/app-endpoints.test.js`.
- **Accounts and sessions persist in Postgres when `DATABASE_URL` is set**
  (`laura/pipeline/lib/db.js`, added 2026-07-20 — free option: Neon, whose
  free tier doesn't expire). Verified against a real, disposable local
  Postgres instance, including that a session survives a fresh connection
  pool — i.e. would survive a process restart: see
  `laura/pipeline/test/accounts-postgres.test.js`, also wired into CI with a
  Postgres service container. **Without `DATABASE_URL`**, falls back to
  `accounts.json` (gitignored, never committed) + an in-memory session map —
  same as before this existed, resets on restart.
- **Every investor-only route enforces its session server-side**
  (`requireInvestor` in `app-endpoints.js`) — full list and what's
  deliberately public instead: the route matrix in AGENTS.md §33. Every
  enforced route has an anonymous-rejection test, prefixed `security:` in
  `laura/pipeline/test/app-endpoints.test.js`.
- **The network boundary of the fetcher.** Transcript/source fetching
  (`laura/pipeline/lib/transcript.js`) enforces scheme restrictions, SSRF
  refusal (private/loopback/metadata addresses), robots.txt compliance, and
  no hosted-media downloading (AGENTS.md §9). Any change there is a
  heightened-review change (AGENTS.md §15).
- **Rate limiting.** `laura/pipeline/lib/rate-limit.js` — fixed-window, keyed
  by `X-Forwarded-For` (falls back to the raw socket address):

  ```text
  POST /auth/login   10 attempts / 15 min / IP  →  429 + Retry-After
  POST /apply         5 attempts / hour / IP    →  429 + Retry-After
  ```

  Verified by a dedicated low-limit test instance in
  `app-endpoints.test.js` actually tripping the limit, not just reading the
  code.

## Untrusted input

Web content, uploaded documents, model output, tool output, and dependency
metadata are all untrusted (AGENTS.md §3). Crawled content is data, never
instructions (§7). Path handling in the file-serving endpoints is
traversal-checked and covered by security tests
(`laura/pipeline/test/app-endpoints.test.js`).

## Known non-protections (honest limits)

| Area | Status |
|---|---|
| Session/account durability | Fixed **only** when `DATABASE_URL` is set. Skip it and you silently get the old ephemeral behavior — easy to forget. |
| Password reset | None, for either role, with or without a database. A founder's one-time password is shown once, at application time — no recovery if lost. |
| Submitted applications (`laura/pipeline/inbox/`) | Not migrated to Postgres — still reset on every restart/redeploy, same problem accounts had before 2026-07-20. |
| Rate-limit counters | In-memory regardless of `DATABASE_URL`. Resets on restart (brief window of unlimited attempts) and doesn't coordinate across instances — stops casual abuse, not a determined attacker. |

## Next security work, in priority order

From an external audit against the account work above (evaluated against
AGENTS.md §33's route matrix and §34's demo/pilot/production gates — full
checklist: `../AGENTIC_AI_WEBSITE_BUILD_AND_RELEASE_CHECKLIST.md`, one level
above this repo). Tracked here so a gap stays visible instead of forgotten.

- [x] **Enforce server-side authorization on every non-public route.** Done 2026-07-20 — route matrix in AGENTS.md §33.
- [x] **Add login/apply rate limiting.** Done 2026-07-20 — see above.
- [x] **Durable cross-process session storage.** Done 2026-07-20 when `DATABASE_URL` is set; file/in-memory fallback otherwise.
- [ ] Keep the AGENTS.md §33 route/role/ownership matrix current as routes change.
- [ ] Idle timeout distinct from the 7-day absolute session TTL.
- [ ] Migrate submitted applications (`laura/pipeline/inbox/`) to Postgres — same justification as accounts.
- [ ] Replace the shared seeded investor account with individual accounts before anyone outside the team uses this.
- [ ] Replace the response-delivered founder password with an activation/reset token flow.
- [ ] Define explicit agent tool permissions before connecting any private founder data to a model call.
- [ ] Prompt-injection source-to-sink threat modeling for every place untrusted content (crawled pages, uploaded decks, model output) reaches a sensitive sink (email, another founder's record, a shell).
- [ ] Append-only audit events for consequential actions (§21, §25).
- [ ] Cost ceilings, timeouts, cancellation, and retry limits on LLM-backed endpoints.
- [ ] A representative quality/security/uncertainty evaluation suite (§31, §12).

## Checks

```bash
node --test laura/pipeline/test/*.test.js   # includes security abuse tests
```

Run before and after any change to the files listed in AGENTS.md §15.
