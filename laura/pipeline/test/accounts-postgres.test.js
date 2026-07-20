// Exercises the Postgres-backed path of lib/accounts.js against a REAL
// database — set TEST_DATABASE_URL to run it (a local Postgres or a Neon
// branch). Skips cleanly when unset, so `node --test test/*.test.js` never
// requires a database for contributors who don't have one running.
//
// This is deliberately a separate file from app-endpoints.test.js: that
// suite spawns app-server.js as a child process without DATABASE_URL set,
// so it always exercises the file-based fallback — this file is the only
// place the Postgres branch itself gets run, not just read.
import test from "node:test";
import assert from "node:assert/strict";

const DATABASE_URL = process.env.TEST_DATABASE_URL;

test("accounts.js (Postgres mode)", { skip: !DATABASE_URL && "set TEST_DATABASE_URL to run this against a real database" }, async (t) => {
  process.env.DATABASE_URL = DATABASE_URL;
  const { _resetForTests } = await import("../lib/db.js");
  await _resetForTests();
  const accountsModule = await import(`../lib/accounts.js?t=${Date.now()}`); // fresh module instance per run
  const { createFounderAccount, verifyLogin, createSession, destroySession, getSessionAccount } = accountsModule;

  await t.test("the seeded investor exists and can log in", async () => {
    const account = await verifyLogin("investor@firstcheck.demo", "growth-signal");
    assert.ok(account);
    assert.equal(account.role, "investor");
  });

  await t.test("wrong password is rejected", async () => {
    assert.equal(await verifyLogin("investor@firstcheck.demo", "wrong"), null);
  });

  await t.test("a founder account can be created, scoped to its opportunity, and re-created idempotently", async () => {
    const created = await createFounderAccount({ email: "pg-founder@example.com", name: "PG Founder", opportunityId: "OPP-PG-001" });
    assert.equal(created.opportunityId, "OPP-PG-001");
    const login = await verifyLogin("pg-founder@example.com", created.password);
    assert.ok(login);
    assert.equal(login.role, "founder");
    assert.equal(login.opportunityId, "OPP-PG-001");

    // Re-applying with the same email rotates the password rather than
    // duplicating the row (ON CONFLICT ... DO UPDATE).
    const recreated = await createFounderAccount({ email: "pg-founder@example.com", name: "PG Founder", opportunityId: "OPP-PG-002" });
    assert.equal(await verifyLogin("pg-founder@example.com", created.password), null, "old password must stop working");
    const reLogin = await verifyLogin("pg-founder@example.com", recreated.password);
    assert.equal(reLogin.opportunityId, "OPP-PG-002", "opportunity id updates on re-application");
  });

  await t.test("sessions persist in the database and survive a fresh pool (simulates a restart)", async () => {
    const account = await verifyLogin("investor@firstcheck.demo", "growth-signal");
    const token = await createSession(account.id);

    await _resetForTests(); // drop the pool — the next call reconnects fresh, session must still be there

    const resumed = await getSessionAccount(token);
    assert.ok(resumed, "session survived a fresh connection pool (i.e. would survive a process restart)");
    assert.equal(resumed.role, "investor");

    await destroySession(token);
    assert.equal(await getSessionAccount(token), null, "destroyed session is actually gone, not just marked");
  });

  await t.test("an unknown session token returns null, not an error", async () => {
    assert.equal(await getSessionAccount("does-not-exist"), null);
  });
});
