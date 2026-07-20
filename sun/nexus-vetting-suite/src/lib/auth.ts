import { authenticateDemo } from "./browser-api";

/* Frontend-only demo identity. This keeps the two product views navigable on
 * static hosting; it is intentionally not authentication or a security gate. */

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

export async function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await authenticateDemo(email, password);
  if (!session) return { ok: false, error: "invalid demo email or password" };
  localStorage.setItem(KEY, JSON.stringify(session));
  return { ok: true };
}

export async function logout(): Promise<void> {
  localStorage.removeItem(KEY);
}
