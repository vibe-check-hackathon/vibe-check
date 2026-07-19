// Checky — the diligence assistant (frontend chat, MVP #7/#8 reasoning):
// retrieval-grounded answers over the opportunity DB. Zero-dep RAG: chunk the
// DB (cards, outbound briefs, synthetic records, thesis), rank chunks by term
// overlap with the conversation, and hand the top chunks to the configured LLM
// with instructions to reason ONLY from that context and cite chunk ids.
//
// Honesty rules mirror the DB's own: unknown ≠ false, claimed ≠ verified,
// real people are public facts only. If the evidence isn't in the retrieved
// context, Checky must say so instead of inventing it.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { complete } from "./llm.js";

const here = dirname(fileURLToPath(import.meta.url));
const DB = join(here, "..", "..", "opportunity-db");
const THESIS = join(here, "..", "thesis.json");

/* ---------- corpus: rebuild lazily, cheap enough per request ---------- */

function chunks() {
  const out = [];
  const push = (id, text) => text?.trim() && out.push({ id, text: text.slice(0, 3500) });

  push("thesis.json", readFileSync(THESIS, "utf8"));

  for (const name of readdirSync(DB).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(DB, name), "utf8");
    if (name.startsWith("MGV-OUTBOUND")) {
      // combined research doc → one chunk per card
      for (const part of text.split(/\n---\n(?=schema_version: 1)/).slice(1)) {
        const id = part.match(/^id: (.+)$/m)?.[1] ?? name;
        push(id, part);
      }
    } else {
      push(name, text);
    }
  }
  for (const dir of ["outbound-scans"]) {
    const p = join(DB, dir);
    if (!existsSync(p)) continue;
    for (const name of readdirSync(p).filter((n) => n.endsWith(".md"))) {
      push(`${dir}/${name}`, readFileSync(join(p, name), "utf8"));
    }
  }
  const index = JSON.parse(readFileSync(join(DB, "synthetic", "index.json"), "utf8"));
  for (const list of ["currentApplications", "outboundSelected"]) {
    for (const r of index[list] ?? []) push(`synthetic:${r.id}`, JSON.stringify(r));
  }
  return out;
}

/* ---------- retrieval: tf overlap, length-normalized ---------- */

const terms = (s) => (s.toLowerCase().match(/[\p{L}\d]{3,}/gu) ?? []).filter((t) => !STOP.has(t));
const STOP = new Set(["the", "and", "for", "with", "this", "that", "what", "who", "how", "why", "are", "you", "can", "does", "about", "tell", "check", "their", "have", "has"]);

export function retrieve(query, k = 5) {
  const q = [...new Set(terms(query))];
  if (!q.length) return [];
  return chunks()
    .map((c) => {
      const body = c.text.toLowerCase();
      const idText = c.id.toLowerCase();
      let score = 0;
      for (const t of q) {
        if (idText.includes(t)) score += 5; // company/card-name hits dominate
        score += Math.min((body.split(t).length - 1), 8);
      }
      return { ...c, score: score / Math.sqrt(c.text.length) };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

/* ---------- the assistant turn ---------- */

const SYSTEM =
  "You are Checky, the diligence assistant inside VibeCheck (a pre-seed/seed VC platform). " +
  "You answer investor questions about deals, founders, screening, thesis fit, and evidence. " +
  "GROUNDING RULES: reason ONLY from the CONTEXT chunks provided; cite the chunk id in [brackets] for every " +
  "material claim; if the context lacks the evidence, say 'not in the evidence base' — never invent facts, " +
  "sources, people, or numbers. Distinguish verified vs claimed vs unknown (unknown ≠ false). Real people are " +
  "assessed from public facts only — refuse personality judgments about them. Be concise: short paragraphs, " +
  "plain language, verdict first.";

export async function askAssistant(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const context = retrieve(lastUser, 5);
  const contextBlock = context.length
    ? context.map((c) => `[${c.id}]\n${c.text}`).join("\n\n---\n\n")
    : "(no matching chunks — say the evidence base has nothing on this and suggest what to add)";
  const history = messages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Investor" : "Checky"}: ${m.content}`)
    .join("\n");
  const answer = await complete({
    system: SYSTEM,
    prompt: `CONTEXT:\n${contextBlock}\n\nCONVERSATION:\n${history}\n\nAnswer the investor's last message.`,
    maxTokens: 700,
  });
  return { answer, retrieved: context.map((c) => c.id) };
}
