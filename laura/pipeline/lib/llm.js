/* LLM adapter for the demo — provider-agnostic, zero-dependency (Node 18+ fetch).
 *
 * Key handling ("api key before launch, saved for 24 hours"):
 *   node laura/pipeline/set-key.js        ← paste the key in the terminal
 * The key lands in laura/pipeline/.llm-key.json (gitignored) with a timestamp;
 * after 24h it is treated as expired and must be re-entered. Env vars
 * ANTHROPIC_API_KEY / OPENAI_API_KEY override the file and never expire.
 *
 * Provider is detected from the key itself, so any teammate can bring their own:
 *   sk-ant-…            → Anthropic (Claude)
 *   anything else       → OpenAI (ChatGPT API)
 *   --base-url http://… → any OpenAI-compatible local server (Ollama, LM Studio)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KEY_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", ".llm-key.json");
const TTL_MS = 24 * 60 * 60 * 1000;

const DEFAULT_MODEL = {
  anthropic: "claude-opus-4-8",
  openai: "gpt-4o-mini",
  local: "llama3.1",
};

export function detectProvider(key, baseUrl) {
  if (baseUrl) return "local";
  if (key.startsWith("sk-ant-")) return "anthropic";
  return "openai";
}

export function saveKey({ key, baseUrl, model }) {
  const provider = detectProvider(key, baseUrl);
  writeFileSync(KEY_PATH, JSON.stringify({ provider, key, baseUrl, model, savedAt: Date.now() }, null, 2), "utf8");
  return { provider, expiresAt: new Date(Date.now() + TTL_MS).toISOString() };
}

export function clearKey() {
  if (existsSync(KEY_PATH)) unlinkSync(KEY_PATH);
}

/** Resolved config or null. Env keys win; the saved file honors the 24h TTL. */
export function loadConfig() {
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: "anthropic", key: process.env.ANTHROPIC_API_KEY, model: DEFAULT_MODEL.anthropic, source: "env" };
  }
  if (process.env.OPENAI_API_KEY) {
    return { provider: "openai", key: process.env.OPENAI_API_KEY, model: DEFAULT_MODEL.openai, source: "env" };
  }
  if (!existsSync(KEY_PATH)) return null;
  try {
    const saved = JSON.parse(readFileSync(KEY_PATH, "utf8"));
    const age = Date.now() - (saved.savedAt ?? 0);
    if (age > TTL_MS) return null; // expired — re-run set-key.js
    return {
      provider: saved.provider,
      key: saved.key,
      baseUrl: saved.baseUrl,
      model: saved.model ?? DEFAULT_MODEL[saved.provider],
      source: "file",
      expiresAt: new Date(saved.savedAt + TTL_MS).toISOString(),
    };
  } catch {
    return null;
  }
}

/** Human-readable status line for launch logs and the CLI. */
export function keyStatus() {
  const cfg = loadConfig();
  if (!cfg) return "no LLM key (or expired) — run: node laura/pipeline/set-key.js";
  const until = cfg.expiresAt ? ` until ${cfg.expiresAt}` : " (env var, no expiry)";
  return `${cfg.provider} key active, model ${cfg.model}${until}`;
}

/** Single-turn completion. Returns the response text or throws. */
export async function complete({ system, prompt, maxTokens = 1024 }) {
  const cfg = loadConfig();
  if (!cfg) throw new Error("no LLM key configured — run: node laura/pipeline/set-key.js");

  if (cfg.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? `anthropic http ${res.status}`);
    if (data.stop_reason === "refusal") throw new Error("model declined the request");
    return (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  // OpenAI and OpenAI-compatible local servers share the chat-completions shape.
  const base = cfg.baseUrl ?? "https://api.openai.com";
  const res = await fetch(`${base.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.key}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `${cfg.provider} http ${res.status}`);
  return data.choices?.[0]?.message?.content ?? "";
}

/** Single-turn completion WITH live web search — Anthropic only (server-side
 *  web_search tool; OpenAI chat completions has no browsing). Returns
 *  { text, searched } where searched=false means the caller must label the
 *  output as unverified model recall. Handles pause_turn continuation. */
export async function completeWithWebSearch({ system, prompt, maxTokens = 4000 }) {
  const cfg = loadConfig();
  if (!cfg) throw new Error("no LLM key configured — run: node laura/pipeline/set-key.js");
  if (cfg.provider !== "anthropic") {
    return { text: await complete({ system, prompt, maxTokens }), searched: false };
  }

  const messages = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < 4; turn += 1) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: maxTokens,
        system,
        messages,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message ?? `anthropic http ${res.status}`);
    if (data.stop_reason === "refusal") throw new Error("model declined the request");
    if (data.stop_reason === "pause_turn") {
      // server-side tool loop paused — echo the turn back and let it resume
      messages.push({ role: "assistant", content: data.content });
      continue;
    }
    const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const searched = (data.content ?? []).some((b) => b.type === "server_tool_use" || b.type === "web_search_tool_result") ||
      messages.length > 1; // searches may have happened in a paused earlier turn
    return { text, searched };
  }
  throw new Error("web search did not settle after 4 turns");
}

/** MVP #3 LLM fallback: free-text query over deal records → matching ids.
 *  Deals arrive as compact objects; the model answers with strict JSON. */
export async function filterDealsWithLLM(query, deals) {
  const system =
    "You filter venture deal-flow records for an investor. " +
    'Given a query and a JSON array of deals, answer ONLY with a JSON object: {"ids": [...], "reason": "one short sentence"}. ' +
    "ids must be existing deal ids whose records genuinely match the query (empty array if none). " +
    "Never invent facts: if a record does not state something, it does not match. No prose outside the JSON.";
  const prompt = `Query: ${query}\n\nDeals:\n${JSON.stringify(deals)}`;
  const text = await complete({ system, prompt, maxTokens: 600 });
  const match = text.match(/\{[\s\S]*\}/); // tolerate code fences / stray prose
  if (!match) throw new Error("model returned no JSON");
  const parsed = JSON.parse(match[0]);
  const valid = new Set(deals.map((d) => d.id));
  return {
    ids: (parsed.ids ?? []).filter((id) => valid.has(id)),
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
    provider: loadConfig()?.provider ?? "unknown",
  };
}
