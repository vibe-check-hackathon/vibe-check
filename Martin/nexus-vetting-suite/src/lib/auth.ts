/* Demo-grade investor gate (hackathon): client-side flag only, NOT security.
 * Logged out → founder-facing apply surface; logged in → the investor app. */

const KEY = "vibecheck-investor";
export const DEMO_PASSWORD = "growth-signal";

export function isInvestor(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(KEY) === "yes";
}

export function login(password: string): boolean {
  if (password.trim().toLowerCase() === DEMO_PASSWORD) {
    localStorage.setItem(KEY, "yes");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
