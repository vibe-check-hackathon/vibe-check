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
// Zero-dependency by policy (AGENTS.md §29): password hashing uses Node's
// built-in crypto.scryptSync, nothing external.
//
// Known limitation, honestly stated: sessions are in-memory (a server
// restart logs everyone out) and accounts.json has no rotation/reset flow
// yet. Fine for the current demo-stage deployment; both are real gaps to
// close before this is a production auth system.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LIB_DIR = dirname(fileURLToPath(import.meta.url));
// Env override exists so tests can point writes at a temp file — production
// and dev never set it (same pattern as app-endpoints.js's other paths).
const ACCOUNTS_PATH = process.env.FIRSTCHECK_ACCOUNTS_PATH ?? join(LIB_DIR, "..", "accounts.json");
const SEED_INVESTOR_PASSWORD = "growth-signal"; // same value the old demo gate used

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const sessions = new Map(); // token -> { accountId, expiresAt }

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const attempt = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

function loadAccounts() {
  if (!existsSync(ACCOUNTS_PATH)) return [];
  try {
    return JSON.parse(readFileSync(ACCOUNTS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + "\n", "utf8");
}

function ensureSeedInvestor() {
  const accounts = loadAccounts();
  if (accounts.some((a) => a.role === "investor")) return;
  const { salt, hash } = hashPassword(SEED_INVESTOR_PASSWORD);
  accounts.push({
    id: "ACC-investor-seed",
    email: "investor@firstcheck.demo",
    name: "Investor (demo seat)",
    role: "investor",
    salt,
    hash,
    createdAt: new Date().toISOString(),
  });
  saveAccounts(accounts);
}
ensureSeedInvestor();

function randomPassword() {
  // 10 base32-ish characters — readable enough to type back from a screen,
  // long enough not to be guessable. Not a security-critical secret (it
  // gates access to the founder's own already-submitted application), but
  // still hashed at rest like any other password.
  return randomBytes(8).toString("base64url").slice(0, 10);
}

/** Creates one founder account per founder with an email. Returns the
 * plaintext password ONCE — there is no recovery flow, so the caller must
 * show it to the founder immediately (the /apply response does this). */
export function createFounderAccount({ email, name, opportunityId }) {
  if (!email) return null;
  const accounts = loadAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = accounts.find((a) => a.email === normalizedEmail && a.role === "founder");
  const password = randomPassword();
  const { salt, hash } = hashPassword(password);
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
  saveAccounts(next);
  return { email: normalizedEmail, password, opportunityId };
}

export function verifyLogin(email, password) {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.email === String(email ?? "").trim().toLowerCase());
  if (!account || !verifyPassword(password ?? "", account.salt, account.hash)) return null;
  const { salt, hash, ...safe } = account;
  return safe;
}

export function createSession(accountId) {
  const token = randomBytes(24).toString("hex");
  sessions.set(token, { accountId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function getSessionAccount(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === session.accountId);
  if (!account) return null;
  const { salt, hash, ...safe } = account;
  return safe;
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
