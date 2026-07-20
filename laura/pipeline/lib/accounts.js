// Real server-verified accounts, replacing the old client-only localStorage
// password gate (Martin/nexus-vetting-suite/src/lib/auth.ts previously just
// set a flag in the browser — no server check at all, and the "password" was
// readable in the shipped JS bundle). Two roles:
//   - investor: seeded once below, same password value the team already uses
//     so the login screen doesn't change for them, but now verified server-side.
//   - founder: created automatically when someone applies via /apply, scoped
//     to exactly their own opportunity — a founder session can only ever read
//     its own record (enforced in app-endpoints.js /my-feedback, not here).
//
// Dual storage (AGENTS.md §25 — technology added on measured need): when
// DATABASE_URL is set (Neon Postgres, free tier), accounts and sessions
// persist there and survive restarts. Without it, falls back to the
// original file-based behavior (laura/pipeline/accounts.json + an in-memory
// session Map) — zero setup for local dev and the test suite, same as
// before this existed. Password hashing (scryptSync) is unaffected either
// way — that part was never the ephemeral piece.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { hasDatabase, getPool, ensureSchema } from "./db.js";

const LIB_DIR = dirname(fileURLToPath(import.meta.url));
// Env override exists so tests can point writes at a temp file — production
// and dev never set it (same pattern as app-endpoints.js's other paths).
const ACCOUNTS_PATH = process.env.FIRSTCHECK_ACCOUNTS_PATH ?? join(LIB_DIR, "..", "accounts.json");
const SEED_INVESTOR_PASSWORD = "growth-signal"; // same value the old demo gate used

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const fileSessions = new Map(); // token -> { accountId, expiresAt } — file-mode only

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const attempt = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

// ---------- file-mode storage ----------

function loadAccountsFile() {
  if (!existsSync(ACCOUNTS_PATH)) return [];
  try {
    return JSON.parse(readFileSync(ACCOUNTS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveAccountsFile(accounts) {
  writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + "\n", "utf8");
}

function randomPassword() {
  // 10 base32-ish characters — readable enough to type back from a screen,
  // long enough not to be guessable. Not a security-critical secret (it
  // gates access to the founder's own already-submitted application), but
  // still hashed at rest like any other password.
  return randomBytes(8).toString("base64url").slice(0, 10);
}

function stripSecrets({ salt, hash, ...safe }) {
  return safe;
}

async function ensureSeedInvestor() {
  const { salt, hash } = hashPassword(SEED_INVESTOR_PASSWORD);
  if (hasDatabase()) {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO accounts (id, email, name, role, opportunity_id, salt, hash)
       VALUES ($1, $2, $3, 'investor', NULL, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ["ACC-investor-seed", "investor@firstcheck.demo", "Investor (demo seat)", salt, hash],
    );
    return;
  }
  const accounts = loadAccountsFile();
  if (accounts.some((a) => a.role === "investor")) return;
  accounts.push({
    id: "ACC-investor-seed",
    email: "investor@firstcheck.demo",
    name: "Investor (demo seat)",
    role: "investor",
    salt,
    hash,
    createdAt: new Date().toISOString(),
  });
  saveAccountsFile(accounts);
}
await ensureSeedInvestor();

/** Creates one founder account per founder with an email. Returns the
 * plaintext password ONCE — there is no recovery flow, so the caller must
 * show it to the founder immediately (the /apply response does this). */
export async function createFounderAccount({ email, name, opportunityId }) {
  if (!email) return null;
  const normalizedEmail = email.trim().toLowerCase();
  const password = randomPassword();
  const { salt, hash } = hashPassword(password);

  if (hasDatabase()) {
    await ensureSchema();
    const existing = await getPool().query("SELECT id, created_at FROM accounts WHERE email = $1 AND role = 'founder'", [normalizedEmail]);
    const id = existing.rows[0]?.id ?? `ACC-founder-${randomBytes(6).toString("hex")}`;
    await getPool().query(
      `INSERT INTO accounts (id, email, name, role, opportunity_id, salt, hash)
       VALUES ($1, $2, $3, 'founder', $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET name = $3, opportunity_id = $4, salt = $5, hash = $6`,
      [id, normalizedEmail, name ?? "Founder", opportunityId, salt, hash],
    );
    return { email: normalizedEmail, password, opportunityId };
  }

  const accounts = loadAccountsFile();
  const existing = accounts.find((a) => a.email === normalizedEmail && a.role === "founder");
  const record = {
    id: existing?.id ?? `ACC-founder-${randomBytes(6).toString("hex")}`,
    email: normalizedEmail,
    name: name ?? existing?.name ?? "Founder",
    role: "founder",
    opportunityId,
    salt,
    hash,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  const next = existing ? accounts.map((a) => (a.id === existing.id ? record : a)) : [...accounts, record];
  saveAccountsFile(next);
  return { email: normalizedEmail, password, opportunityId };
}

export async function verifyLogin(email, password) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (hasDatabase()) {
    await ensureSchema();
    const { rows } = await getPool().query("SELECT * FROM accounts WHERE email = $1", [normalizedEmail]);
    const account = rows[0];
    if (!account || !verifyPassword(password ?? "", account.salt, account.hash)) return null;
    return { id: account.id, email: account.email, name: account.name, role: account.role, opportunityId: account.opportunity_id };
  }

  const accounts = loadAccountsFile();
  const account = accounts.find((a) => a.email === normalizedEmail);
  if (!account || !verifyPassword(password ?? "", account.salt, account.hash)) return null;
  return stripSecrets(account);
}

export async function createSession(accountId) {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  if (hasDatabase()) {
    await ensureSchema();
    await getPool().query("INSERT INTO sessions (token, account_id, expires_at) VALUES ($1, $2, $3)", [token, accountId, expiresAt]);
    return token;
  }
  fileSessions.set(token, { accountId, expiresAt: expiresAt.getTime() });
  return token;
}

export async function destroySession(token) {
  if (!token) return;
  if (hasDatabase()) {
    await ensureSchema();
    await getPool().query("DELETE FROM sessions WHERE token = $1", [token]);
    return;
  }
  fileSessions.delete(token);
}

export async function getSessionAccount(token) {
  if (!token) return null;

  if (hasDatabase()) {
    await ensureSchema();
    const { rows } = await getPool().query(
      `SELECT a.* FROM sessions s JOIN accounts a ON a.id = s.account_id
       WHERE s.token = $1 AND s.expires_at > now()`,
      [token],
    );
    const account = rows[0];
    if (!account) {
      await getPool().query("DELETE FROM sessions WHERE token = $1", [token]); // clean up if expired
      return null;
    }
    return { id: account.id, email: account.email, name: account.name, role: account.role, opportunityId: account.opportunity_id };
  }

  const session = fileSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    fileSessions.delete(token);
    return null;
  }
  const accounts = loadAccountsFile();
  const account = accounts.find((a) => a.id === session.accountId);
  if (!account) return null;
  return stripSecrets(account);
}

export function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((pair) => {
      const idx = pair.indexOf("=");
      return [decodeURIComponent(pair.slice(0, idx).trim()), decodeURIComponent(pair.slice(idx + 1).trim())];
    }),
  );
}

export function sessionCookieHeader(token, { clear = false } = {}) {
  const maxAge = clear ? 0 : Math.floor(SESSION_TTL_MS / 1000);
  return `fc_session=${clear ? "" : token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
