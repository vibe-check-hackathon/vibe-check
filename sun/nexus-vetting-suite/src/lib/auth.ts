/* Real server-verified accounts (laura/pipeline/lib/accounts.js), replacing
 * the old client-only localStorage flag. The server sets an HttpOnly session
 * cookie on login — that cookie is what actually gates protected data
 * (e.g. /my-feedback checks it server-side, never trusting the client).
 *
 * The localStorage cache below is a UI convenience only: it lets AppShell
 * decide which nav to render synchronously without an extra round trip. It
 * is not a security boundary — losing or forging it does not grant access to
 * anything; the cookie does that. See SECURITY.md for the full picture. */

type Role = "investor" | "founder";
type CachedSession = { role: Role; name: string; opportunityId: string | null };

const KEY = "firstcheck-session";

function readCache(): CachedSession | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

export function isInvestor(): boolean {
  return readCache()?.role === "investor";
}

export function isFounder(): boolean {
  return readCache()?.role === "founder";
}

export function founderInfo(): CachedSession | null {
  const cached = readCache();
  return cached?.role === "founder" ? cached : null;
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "invalid email or password" };
  }
  const data = (await res.json()) as CachedSession;
  localStorage.setItem(KEY, JSON.stringify(data));
  return { ok: true };
}

export async function logout(): Promise<void> {
  try {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
  } finally {
    localStorage.removeItem(KEY);
  }
}
