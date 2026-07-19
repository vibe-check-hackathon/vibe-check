/* Key store for third-party services (Resend, ElevenLabs), separate from the
 * LLM key in llm.js because these are per-service and long-lived rather than a
 * single provider-detected key.
 *
 *   node laura/pipeline/set-service-key.js resend re_…
 *   node laura/pipeline/set-service-key.js elevenlabs xi-… --agent agent_…
 *
 * Keys land in laura/pipeline/.service-keys.json (gitignored). Env vars win and
 * never expire, so CI and deploys can inject them instead:
 *   RESEND_API_KEY, RESEND_FROM
 *   ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID
 *
 * Unlike the LLM key these do not expire — a hackathon demo should not lose its
 * mail sender mid-run — but `--clear` removes them.
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PATH = join(dirname(fileURLToPath(import.meta.url)), "..", ".service-keys.json");

export const SERVICES = ["resend", "elevenlabs"];

function readAll() {
  if (!existsSync(PATH)) return {};
  try {
    return JSON.parse(readFileSync(PATH, "utf8"));
  } catch {
    return {};
  }
}

export function saveServiceKey(service, entry) {
  if (!SERVICES.includes(service)) throw new Error(`unknown service: ${service}`);
  const all = readAll();
  all[service] = { ...entry, savedAt: Date.now() };
  writeFileSync(PATH, JSON.stringify(all, null, 2), "utf8");
  return all[service];
}

export function clearServiceKeys() {
  if (existsSync(PATH)) unlinkSync(PATH);
}

/** Env first, then the saved file. Returns null when the service is unconfigured. */
export function serviceConfig(service) {
  if (service === "resend") {
    const key = process.env.RESEND_API_KEY ?? readAll().resend?.key;
    if (!key) return null;
    return {
      key,
      // Resend rejects unverified senders; onboarding@resend.dev is their sandbox.
      from: process.env.RESEND_FROM ?? readAll().resend?.from ?? "FirstCheck <onboarding@resend.dev>",
    };
  }
  if (service === "elevenlabs") {
    const saved = readAll().elevenlabs ?? {};
    const key = process.env.ELEVENLABS_API_KEY ?? saved.key;
    const agentId = process.env.ELEVENLABS_AGENT_ID ?? saved.agentId;
    if (!key || !agentId) return null;
    return { key, agentId };
  }
  return null;
}

/** Human-readable status for the console banner and the settings page. */
export function serviceStatus() {
  return SERVICES.map((s) => {
    const cfg = serviceConfig(s);
    if (!cfg) return `${s}: not configured`;
    if (s === "resend") return `resend: ready (from ${cfg.from})`;
    return `elevenlabs: ready (agent ${cfg.agentId})`;
  });
}
