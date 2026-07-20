// Postgres connection, used only when DATABASE_URL is set (Neon free tier —
// see AGENTS.md §25/§29: this is the "measured need" that justifies the one
// real dependency in this otherwise zero-dependency pipeline). Without
// DATABASE_URL, callers fall back to file-based storage — see accounts.js.
import pg from "pg";

let pool;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!hasDatabase()) throw new Error("DATABASE_URL is not set");
  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

let schemaReady;

/** Idempotent — safe to call on every cold start (Render free tier restarts
 * often). Creates tables only if they don't already exist. */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        opportunity_id TEXT,
        salt TEXT NOT NULL,
        hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      );
    `);
  }
  return schemaReady;
}

/** Test-only: drop the pool so a fresh DATABASE_URL takes effect and cached
 * schema-ready state doesn't leak across test files. */
export async function _resetForTests() {
  if (pool) await pool.end();
  pool = undefined;
  schemaReady = undefined;
}
