/* ElevenLabs Agents adapter — the live founder interview.
 *
 * The browser never sees the API key. It asks this module for a signed URL
 * (valid 15 minutes, per ElevenLabs) plus the dynamic variables that carry the
 * founder context, then hands both to `Conversation.startSession()`.
 *
 * The agent itself is built in the ElevenLabs dashboard. Its system prompt is
 * expected to reference these variables with double braces, e.g.
 *
 *   You are interviewing {{founder_names}}, founders of {{company}}.
 *   Test each hypothesis in {{hypotheses}} and resolve {{open_questions}}.
 *
 * `buildAgentBrief()` below prints a prompt you can paste straight in.
 */

import { serviceConfig } from "./service-keys.js";

const SIGNED_URL_ENDPOINT = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

/**
 * Mint a signed URL for a conversation. Short-lived by design: the session must
 * be *started* within 15 minutes, though the call itself may run longer.
 */
export async function getSignedUrl() {
  const cfg = serviceConfig("elevenlabs");
  if (!cfg) return { ok: false, reason: "elevenlabs not configured — run set-service-key.js elevenlabs xi-… --agent agent_…" };

  const url = `${SIGNED_URL_ENDPOINT}?agent_id=${encodeURIComponent(cfg.agentId)}`;
  const res = await fetch(url, { headers: { "xi-api-key": cfg.key } });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, reason: `elevenlabs ${res.status}: ${detail.slice(0, 200)}` };
  }
  const body = await res.json();
  if (!body.signed_url) return { ok: false, reason: "elevenlabs returned no signed_url" };
  return { ok: true, signedUrl: body.signed_url, agentId: cfg.agentId };
}

/**
 * Flatten an opportunity into the variables the agent prompt interpolates.
 * Everything is a string — dynamic variables do not carry structure.
 */
export function buildDynamicVariables({ company, oneLiner, founders = [], openQuestions = [] }) {
  const named = founders.filter((f) => f?.name);

  const hypotheses = named
    .flatMap((f) => (f.hypotheses ?? []).map((h) => `${f.name} · ${h.axis ?? h.type ?? "trait"}: ${h.text ?? h.hypothesis}`))
    .join("\n");

  const personalities = named
    .filter((f) => f.personality)
    .map((f) => `${f.name}: ${f.personality.type} (${f.personality.label}) — untested, confidence ${f.personality.confidence}/100`)
    .join("\n");

  return {
    company: company ?? "the company",
    one_liner: oneLiner ?? "",
    founder_names: named.map((f) => f.name).join(", ") || "the founding team",
    founder_roster: named.map((f) => `${f.name} (${f.role ?? "founder"})`).join("\n"),
    founder_count: String(named.length),
    hypotheses: hypotheses || "(none recorded — ask open-ended questions about the team)",
    personality_hypotheses: personalities || "(none recorded)",
    open_questions: openQuestions.join("\n") || "(none recorded)",
  };
}

/**
 * The system prompt to paste into the ElevenLabs dashboard. Kept here so the
 * variable names in the prompt and in buildDynamicVariables cannot drift.
 */
export function buildAgentBrief() {
  return `You are FirstCheck's founder interviewer, talking to {{founder_names}} of {{company}}.

Context
- What they say they do: {{one_liner}}
- Who is on the call:
{{founder_roster}}

Your job is to test what the written application could not settle. These are hypotheses, not conclusions:
{{hypotheses}}

Personality reads drawn from written material, all UNTESTED — probe them, never state them:
{{personality_hypotheses}}

Still open:
{{open_questions}}

How to run the call
- Ask one question at a time and let them finish. Silence is fine.
- Address founders by name; with {{founder_count}} people on the call, direct each question at one of them.
- Follow the specific over the general: ask for a dated example, a number, a name.
- When two founders disagree, let it play out — how they resolve it is the evidence.
- If an answer contradicts the application, say so plainly and ask them to reconcile it.
- Never tell a founder their personality type or score. You are gathering evidence for a human investor, who makes every decision.
- Around fifteen minutes. Close by telling them a human investor reviews everything before any decision.`;
}
