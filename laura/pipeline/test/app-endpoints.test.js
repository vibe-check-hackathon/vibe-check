// Integration tests for the shared backend endpoints (app-endpoints.js) and
// the production server's connect-style dispatch (app-server.js). The server
// is spawned as a real child process in NO_SSR mode, so these tests cover
// exactly what production runs — routing, prefix stripping, validation,
// path-traversal defenses — without needing the frontend build.
//
// Writes are redirected to a temp inbox via FIRSTCHECK_INBOX_DIR; thesis
// writes go to a temp copy via FIRSTCHECK_THESIS_PATH — the real thesis.json
// is never touched by this suite.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PIPELINE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8877;
const BASE = `http://127.0.0.1:${PORT}`;
const SEED_INVESTOR = { email: "investor@firstcheck.demo", password: "growth-signal" };

function sessionCookieFrom(res) {
  const raw = res.headers.get("set-cookie") ?? "";
  return raw.split(";")[0]; // "fc_session=...", drop the attributes
}

let child;
let inboxDir;
let accountsPath;
let interviewsDir;
let thesisPath;
let thesisMdPath;

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/integrations`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("app-server did not become ready");
}

test.before(async () => {
  inboxDir = await mkdtemp(join(tmpdir(), "firstcheck-inbox-"));
  accountsPath = join(inboxDir, "accounts.json"); // reuse the temp dir, different file
  interviewsDir = await mkdtemp(join(tmpdir(), "firstcheck-interviews-"));
  thesisPath = join(inboxDir, "thesis.json");
  thesisMdPath = join(inboxDir, "thesis.md");
  await writeFile(thesisPath, await readFile(join(PIPELINE_DIR, "thesis.json"), "utf8"), "utf8");
  child = spawn(process.execPath, [join(PIPELINE_DIR, "app-server.js")], {
    env: {
      ...process.env,
      PORT: String(PORT),
      NO_SSR: "1",
      FIRSTCHECK_INBOX_DIR: inboxDir,
      FIRSTCHECK_ACCOUNTS_PATH: accountsPath,
      FIRSTCHECK_INTERVIEWS_DIR: interviewsDir,
      FIRSTCHECK_THESIS_PATH: thesisPath,
      FIRSTCHECK_THESIS_MD_PATH: thesisMdPath,
      // High enough that this suite's own traffic (all from 127.0.0.1)
      // never trips the limiter — the limiter's actual behavior is tested
      // separately below against a dedicated low-limit server instance.
      FIRSTCHECK_LOGIN_RATE_MAX: "1000",
      FIRSTCHECK_APPLY_RATE_MAX: "1000",
    },
    stdio: "ignore",
  });
  await waitForServer();
});

/** Most routes now require an investor session (AGENTS.md §33) — fetch a
 * fresh cookie per call rather than caching one, so each test is independent
 * of call order and of any other test's session mutations. */
async function investorCookie() {
  const res = await fetch(`${BASE}/auth/login`, { method: "POST", body: JSON.stringify(SEED_INVESTOR) });
  return sessionCookieFrom(res);
}

test.after(async () => {
  child?.kill();
  await rm(inboxDir, { recursive: true, force: true });
  await rm(interviewsDir, { recursive: true, force: true });
});

test("GET /integrations reports service availability as booleans", async () => {
  const res = await fetch(`${BASE}/integrations`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body.resend, "boolean");
  assert.equal(typeof body.elevenlabs, "boolean");
  assert.ok(Array.isArray(body.detail));
});

test("GET /thesis returns the fund thesis with sectors and check size", async () => {
  const res = await fetch(`${BASE}/thesis`);
  assert.equal(res.status, 200);
  const thesis = await res.json();
  assert.ok(Array.isArray(thesis.fund.sectors) && thesis.fund.sectors.length > 0);
  assert.ok(thesis.fund.checkSizeUsd.max > 0);
});

test("POST /thesis bumps the version and regenerates thesis.md — never hand-edited, never drifts", async () => {
  const before = await (await fetch(`${BASE}/thesis`)).json();
  const nextThesis = { ...before, fund: { ...before.fund, riskAppetite: "moderate" } };
  delete nextThesis.version; // the server assigns it — a client-sent version must not be trusted
  delete nextThesis.updatedAt;

  const post = await fetch(`${BASE}/thesis`, {
    method: "POST",
    headers: { cookie: await investorCookie() },
    body: JSON.stringify(nextThesis),
  });
  assert.equal(post.status, 204);

  const after = await (await fetch(`${BASE}/thesis`)).json();
  assert.equal(after.version, (before.version ?? 0) + 1);
  assert.equal(after.fund.riskAppetite, "moderate");
  assert.ok(after.updatedAt);

  const md = await readFile(thesisMdPath, "utf8");
  assert.match(md, new RegExp(`v${after.version}`));
  assert.match(md, /moderate/);
});

test("security: POST /thesis without an investor session is rejected", async () => {
  const anon = await fetch(`${BASE}/thesis`, { method: "POST", body: JSON.stringify({}) });
  assert.equal(anon.status, 401);
});

test("GET /llm-key reports status without ever returning the key", async () => {
  const res = await fetch(`${BASE}/llm-key`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(typeof body.status, "string");
  assert.equal(typeof body.active, "boolean");
  assert.ok(!("key" in body), "the key itself must never appear in a response");
});

test("security: POST /term-sheet without an investor session is rejected", async () => {
  const res = await fetch(`${BASE}/term-sheet`, { method: "POST", body: "{}" });
  assert.equal(res.status, 401);
});

test("POST /term-sheet without a company is rejected", async () => {
  const res = await fetch(`${BASE}/term-sheet`, { method: "POST", headers: { cookie: await investorCookie() }, body: "{}" });
  assert.equal(res.status, 400);
});

test("POST /term-sheet generates terms with markdown and legal text", async () => {
  const res = await fetch(`${BASE}/term-sheet`, {
    method: "POST",
    headers: { cookie: await investorCookie() },
    body: JSON.stringify({ company: "TestCo", askUsd: 1_000_000, founderScore: 80 }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.company, "TestCo");
  assert.ok(body.markdown.includes("TestCo"));
  assert.ok(typeof body.legalText === "string" && body.legalText.length > 0);
});

test("POST /apply rejects invalid JSON, missing minimum bar, and missing LinkedIn", async () => {
  const invalid = await fetch(`${BASE}/apply`, { method: "POST", body: "not json" });
  assert.equal(invalid.status, 400);

  const noDeck = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({ company: "NoDeck Inc" }),
  });
  assert.equal(noDeck.status, 400);

  const noLinkedin = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "NoLinkedIn Inc",
      deck: "https://example.com/deck.pdf",
      founderName: "Test Founder",
    }),
  });
  assert.equal(noLinkedin.status, 400);
  const body = await noLinkedin.json();
  assert.match(body.error, /LinkedIn/);
});

test("POST /apply accepts a valid application, screens it, and lands it in the inbox", async () => {
  const res = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Applied AI Example",
      deck: "https://example.com/deck.pdf",
      oneLiner: "AI infrastructure for testing",
      sector: "ai-infrastructure",
      stage: "pre-seed",
      raiseUsd: "500k",
      founderName: "Alex Example",
      linkedin: "https://linkedin.com/in/alex-example",
    }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.match(body.id, /^APP-\d+$/);
  assert.equal(typeof body.pass, "boolean");
  assert.ok(Array.isArray(body.founders) && body.founders.length === 1);

  const files = await readdir(inboxDir);
  assert.ok(files.includes(`${body.id}.json`), "inbox JSON written");
  assert.ok(files.includes(`${body.id}.md`), "inbox markdown card written");

  const list = await fetch(`${BASE}/applications`, { headers: { cookie: await investorCookie() } });
  assert.equal(list.status, 200);
  const records = await list.json();
  assert.ok(records.some((r) => r.id === body.id), "application visible in /applications");
});

test("security: GET /applications without an investor session is rejected", async () => {
  const res = await fetch(`${BASE}/applications`);
  assert.equal(res.status, 401);
});

test("GET /opportunity-db serves DB files from the single source of truth", async () => {
  const res = await fetch(`${BASE}/opportunity-db/synthetic/index.json`, { headers: { cookie: await investorCookie() } });
  assert.equal(res.status, 200);
  const index = await res.json();
  assert.ok(index && typeof index === "object");
});

test("security: GET /opportunity-db without an investor session is rejected", async () => {
  const res = await fetch(`${BASE}/opportunity-db/synthetic/index.json`);
  assert.equal(res.status, 401);
});

test("security: /opportunity-db path traversal cannot escape the DB root", async () => {
  for (const path of [
    "/opportunity-db/../pipeline/thesis.json",
    "/opportunity-db/..%2F..%2Fpipeline%2Fthesis.json",
    "/opportunity-db/%2e%2e/%2e%2e/pipeline/thesis.json",
  ]) {
    const res = await fetch(`${BASE}${path}`);
    if (res.status === 200) {
      const text = await res.text();
      assert.ok(
        !text.includes('"fund"'),
        `traversal ${path} must never serve files outside the DB root`,
      );
    }
  }
});

test("security: /sun-deck path traversal cannot escape the deck folder", async () => {
  const res = await fetch(`${BASE}/sun-deck/../../laura/pipeline/thesis.json`);
  if (res.status === 200) {
    const text = await res.text();
    assert.ok(!text.includes('"fund"'), "traversal must never serve pipeline files");
  }
});

test("unmatched routes degrade legibly in NO_SSR mode (502 with instructions)", async () => {
  const res = await fetch(`${BASE}/definitely-not-a-route`);
  assert.equal(res.status, 502);
  const text = await res.text();
  assert.match(text, /NITRO_PRESET=node-server/);
});

test("route matching strips the mount prefix and honors query strings", async () => {
  const res = await fetch(`${BASE}/thesis?cache-bust=1`);
  assert.equal(res.status, 200);
  const thesis = await res.json();
  assert.ok(thesis.fund, "handler still resolves with a query string appended");
});

test("GET /auth/me without a session is 401", async () => {
  const res = await fetch(`${BASE}/auth/me`);
  assert.equal(res.status, 401);
});

test("POST /auth/login rejects wrong credentials and never leaks a hint", async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: SEED_INVESTOR.email, password: "not-the-password" }),
  });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.doesNotMatch(body.error, /hash|salt|scrypt/i);
});

test("POST /auth/login with the seeded investor succeeds and sets a session cookie", async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify(SEED_INVESTOR),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.role, "investor");
  const cookie = res.headers.get("set-cookie") ?? "";
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /fc_session=/);

  const me = await fetch(`${BASE}/auth/me`, { headers: { cookie: sessionCookieFrom(res) } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).role, "investor");
});

test("POST /auth/logout clears the session — /auth/me is 401 again after", async () => {
  const login = await fetch(`${BASE}/auth/login`, { method: "POST", body: JSON.stringify(SEED_INVESTOR) });
  const cookie = sessionCookieFrom(login);

  const logout = await fetch(`${BASE}/auth/logout`, { method: "POST", headers: { cookie } });
  assert.equal(logout.status, 204);

  const me = await fetch(`${BASE}/auth/me`, { headers: { cookie } });
  assert.equal(me.status, 401);
});

test("GET /my-feedback requires a founder session, not just any session", async () => {
  const investorLogin = await fetch(`${BASE}/auth/login`, { method: "POST", body: JSON.stringify(SEED_INVESTOR) });
  const investorCookie = sessionCookieFrom(investorLogin);

  const noSession = await fetch(`${BASE}/my-feedback`);
  assert.equal(noSession.status, 401);

  const investorSession = await fetch(`${BASE}/my-feedback`, { headers: { cookie: investorCookie } });
  assert.equal(investorSession.status, 401, "an investor session must not read founder feedback");
});

test("POST /apply creates a scoped founder account, and /my-feedback returns only that founder's own record", async () => {
  const applyA = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Founder Portal Test A",
      deck: "https://example.com/deck-a.pdf",
      founderName: "Ada Example",
      linkedin: "https://linkedin.com/in/ada-example",
    }),
  });
  const bodyA = await applyA.json();
  assert.ok(Array.isArray(bodyA.founderAccounts) && bodyA.founderAccounts.length === 0, "no email supplied, no account created");

  const applyB = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Founder Portal Test B",
      deck: "https://example.com/deck-b.pdf",
      founderName: "Bea Example",
      founderEmail: "bea@example.com",
      linkedin: "https://linkedin.com/in/bea-example",
    }),
  });
  const bodyB = await applyB.json();
  assert.equal(bodyB.founderAccounts.length, 1);
  const { email, password, opportunityId } = bodyB.founderAccounts[0];
  assert.equal(email, "bea@example.com");
  assert.equal(opportunityId, bodyB.opportunityId);

  const founderLogin = await fetch(`${BASE}/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) });
  assert.equal(founderLogin.status, 200);
  assert.equal((await founderLogin.json()).role, "founder");
  const founderCookie = sessionCookieFrom(founderLogin);

  const feedback = await fetch(`${BASE}/my-feedback`, { headers: { cookie: founderCookie } });
  assert.equal(feedback.status, 200);
  const data = await feedback.json();
  assert.equal(data.opportunityId, opportunityId);
  assert.equal(data.company, "Founder Portal Test B");
  assert.ok(data.founders.some((f) => f.hypotheses.length > 0), "unscored hypotheses are present pre-interview");
  assert.equal(data.interviewFeedback, null, "no interview card exists for this synthetic company");
});

test("GET /my-feedback prefers the hard source_opportunity_id link over a company-name guess", async () => {
  const apply = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Linked Interview Co",
      deck: "https://example.com/deck-d.pdf",
      founderName: "Dee Example",
      founderEmail: "dee@example.com",
      linkedin: "https://linkedin.com/in/dee-example",
    }),
  });
  const { opportunityId, founderAccounts } = await apply.json();

  // A same-named-but-unrelated card should NOT be picked, proving the hard
  // link wins over the company-name heuristic.
  await writeFile(
    join(interviewsDir, "OPP-MGV-INT-0000-unrelated.md"),
    `---\nschema_version: 1\nid: OPP-MGV-INT-0000\ncompany: "Linked Interview Co"\nstatus: approved\nsource_opportunity_id: null\nfounder_score: 5\nfounder_score_confidence: 5\n---\nunrelated card, same company name\n`,
    "utf8",
  );
  await writeFile(
    join(interviewsDir, "OPP-MGV-INT-0001-linked.md"),
    `---\nschema_version: 1\nid: OPP-MGV-INT-0001\ncompany: "Linked Interview Co"\nstatus: approved\nsource_opportunity_id: "${opportunityId}"\nfounder_score: 77\nfounder_score_confidence: 64\n---\nlinked card\n`,
    "utf8",
  );

  const login = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: founderAccounts[0].email, password: founderAccounts[0].password }),
  });
  const cookie = sessionCookieFrom(login);

  const feedback = await fetch(`${BASE}/my-feedback`, { headers: { cookie } });
  const data = await feedback.json();
  assert.equal(data.interviewFeedback.matchedBy, "source_opportunity_id (verified link)");
  assert.equal(data.interviewFeedback.founderScore, 77);
  assert.match(data.interviewFeedback.card, /OPP-MGV-INT-0001-linked\.md$/);

  // Same lookup, investor-facing route — session-gated (AGENTS.md §33).
  const investorLookup = await fetch(`${BASE}/interview-score?opportunityId=${opportunityId}`, {
    headers: { cookie: await investorCookie() },
  });
  assert.equal(investorLookup.status, 200);
  const investorData = await investorLookup.json();
  assert.equal(investorData.interviewFeedback.founderScore, 77);
});

test("GET /my-feedback exposes the real per-component and per-feature score breakdown, not just the total", async () => {
  const apply = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Breakdown Co",
      deck: "https://example.com/deck-e.pdf",
      founderName: "Fin Example",
      founderEmail: "fin@example.com",
      linkedin: "https://linkedin.com/in/fin-example",
    }),
  });
  const { opportunityId, founderAccounts } = await apply.json();

  await writeFile(
    join(interviewsDir, "OPP-MGV-INT-0002-breakdown.md"),
    [
      "---",
      "schema_version: 1",
      "id: OPP-MGV-INT-0002",
      'company: "Breakdown Co"',
      "status: approved",
      `source_opportunity_id: "${opportunityId}"`,
      "founder_score: 42",
      "founder_score_confidence: 55",
      "---",
      "",
      "## Founder Score",
      "",
      "Score **42/100** confidence **55/100**.",
      "",
      "| Component | Credited points |",
      "|---|---:|",
      "| product_shipping | 9.5 |",
      "| momentum | 3 |",
      "",
      "### Feature contributions",
      "",
      "| Component | Feature | Raw | Evidence state | Cap | Credited | Claim |",
      "|---|---|---|---|---|---:|---|",
      "| product_shipping | product_shipping | 14.6/25 | self_reported | ×0.65 | 9.5 | CLM-001 |",
      "| momentum | pivot | 4.6/10 | self_reported | ×0.65 | 3 | CLM-002 |",
      "",
      "## Evidence ledger",
      "",
      "- none",
      "",
    ].join("\n"),
    "utf8",
  );

  const login = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: founderAccounts[0].email, password: founderAccounts[0].password }),
  });
  const cookie = sessionCookieFrom(login);

  const feedback = await fetch(`${BASE}/my-feedback`, { headers: { cookie } });
  const data = await feedback.json();
  assert.deepEqual(data.interviewFeedback.components, [
    { component: "product_shipping", credited: 9.5 },
    { component: "momentum", credited: 3 },
  ]);
  assert.equal(data.interviewFeedback.features.length, 2);
  assert.equal(data.interviewFeedback.features[0].feature, "product_shipping");
  assert.equal(data.interviewFeedback.features[0].evidenceState, "self_reported");
  assert.equal(data.interviewFeedback.features[0].credited, 9.5);
  assert.equal(data.interviewFeedback.features[1].claim, "CLM-002");
});

test("GET /interview-score requires at least one query parameter", async () => {
  const res = await fetch(`${BASE}/interview-score`, { headers: { cookie: await investorCookie() } });
  assert.equal(res.status, 400);
});

test("security: GET /interview-score without an investor session is rejected", async () => {
  const res = await fetch(`${BASE}/interview-score?opportunityId=OPP-does-not-matter`);
  assert.equal(res.status, 401);
});

test("security: /nl-query, /outbound-scan, /assistant, /invite, /interview-session reject anonymous requests", async () => {
  for (const route of ["/nl-query", "/outbound-scan", "/assistant", "/invite", "/interview-session"]) {
    const res = await fetch(`${BASE}${route}`, { method: "POST", body: "{}" });
    assert.equal(res.status, 401, `${route} must require an investor session`);
  }
});

test("security: POST and DELETE /llm-key reject anonymous requests (GET status stays public)", async () => {
  const post = await fetch(`${BASE}/llm-key`, { method: "POST", body: JSON.stringify({ key: "sk-ant-fake" }) });
  assert.equal(post.status, 401);
  const del = await fetch(`${BASE}/llm-key`, { method: "DELETE" });
  assert.equal(del.status, 401);
  const get = await fetch(`${BASE}/llm-key`);
  assert.equal(get.status, 200, "GET status is intentionally public — no secret in the response");
});

test("security: a wrong password for an existing founder email is rejected", async () => {
  const apply = await fetch(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({
      company: "Founder Portal Test C",
      deck: "https://example.com/deck-c.pdf",
      founderName: "Cy Example",
      founderEmail: "cy@example.com",
      linkedin: "https://linkedin.com/in/cy-example",
    }),
  });
  const { founderAccounts } = await apply.json();
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: founderAccounts[0].email, password: "guessed-wrong" }),
  });
  assert.equal(res.status, 401);
});

test("security: rate limiting actually blocks excess requests and reports Retry-After", async () => {
  // Dedicated low-limit instance — the shared suite server above runs with
  // FIRSTCHECK_LOGIN_RATE_MAX raised so the rest of this file's traffic
  // doesn't trip it; this test proves the real, tight limit actually works.
  const port = PORT + 1;
  const base = `http://127.0.0.1:${port}`;
  const rlChild = spawn(process.execPath, [join(PIPELINE_DIR, "app-server.js")], {
    env: { ...process.env, PORT: String(port), NO_SSR: "1", FIRSTCHECK_LOGIN_RATE_MAX: "3" },
    stdio: "ignore",
  });
  try {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        if ((await fetch(`${base}/integrations`)).ok) break;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${base}/auth/login`, { method: "POST", body: JSON.stringify({ email: "x", password: "x" }) });
      assert.equal(res.status, 401, `attempt ${i + 1} should reach the real login check, not be rate-limited yet`);
    }
    const blocked = await fetch(`${base}/auth/login`, { method: "POST", body: JSON.stringify({ email: "x", password: "x" }) });
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  } finally {
    rlChild.kill();
  }
});
