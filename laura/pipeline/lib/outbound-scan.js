// Live outbound refresh (MVP #5 "identification" on demand): an LLM scan for
// newly fundable pre-seed/seed startups in a chosen region, structured by
// laura/outbound_person_team_intelligence_template(1).md and screened through
// the canonical thesis screen before anything reaches the board.
//
// Honesty tiers (the template demands every claim traceable or labeled):
//   - Anthropic key  → live web search; records carry real source URLs.
//   - OpenAI / local → no browsing; records are labeled UNVERIFIED model
//     recall, sources marked "claimed", and the UI says so.
// Real people appear as public facts only, always assessed:false.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { completeWithWebSearch } from "./llm.js";
import { screenOpportunity } from "./screening.js";

const here = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(here, "..", "..", "outbound_person_team_intelligence_template(1).md");

const REGION_HINTS = {
  europe: "Europe (EU/UK/CH — DACH preferred)",
  us: "United States",
  china: "China (mainland, HK) — note cross-border investment constraints for a EU fund",
};

function scanPrompt(region, existing, thesis) {
  const fund = thesis.raw.fund;
  return (
    `Find up to 3 startups that fit this fund thesis and were publicly funded or surfaced in the last 12 months.\n` +
    `Region: ${REGION_HINTS[region] ?? region}.\n` +
    `Thesis: stages ${fund.stages.join("/")}, sectors ${fund.sectors.join(", ")} (adjacent B2B AI acceptable), ` +
    `first check $${fund.checkSizeUsd.min / 1e3}K–$${fund.checkSizeUsd.max / 1e3}K.\n` +
    `EXCLUDE these already-tracked companies: ${existing.join(", ")}.\n` +
    `Hard rules from the intelligence template: public/permitted data only; every material statement sourced or ` +
    `explicitly "claimed"; founder names and roles only as public facts; no contact data beyond public profiles; ` +
    `no protected characteristics; unknown evidence scores zero.\n\n` +
    `Answer with ONLY a JSON array (no prose) of records:\n` +
    `[{"company": "...", "oneLiner": "...", "sector": "...", "geography": "City, CC", "stage": "Pre-seed|Seed", ` +
    `"funding": "verbatim public funding line or 'unknown'", "whyNow": "one sentence", ` +
    `"founders": [{"name": "...", "role": "...", "publicSignal": "sourced professional fact"}], ` +
    `"sources": [{"label": "...", "url": "https://..."}], "evidenceNote": "what is verified vs claimed"}]\n` +
    `If you cannot browse the web, only name companies you are confident actually exist, and say so in evidenceNote.`
  );
}

/** Run one scan. Returns { records, mode } — records already screened + shaped.
 *  `completer` is injectable for tests; defaults to the live LLM. */
export async function scanOutbound({ region = "europe", existingCompanies = [], thesis, completer = completeWithWebSearch }) {
  // Key presence is enforced by the completer (and the endpoint's 501 guard).
  // The template travels with the prompt so the model applies its integrity
  // rules, not just its table structure (trimmed to the rule-bearing header).
  const templateHead = readFileSync(TEMPLATE, "utf8").slice(0, 1200);
  const system =
    "You are an outbound sourcing analyst for a pre-seed/seed VC. You follow the Outbound Person & Potential Team " +
    "Intelligence Brief template strictly — its integrity rules are quoted below. You never invent companies, people, " +
    "URLs, or funding events; anything uncertain is labeled claimed/unknown.\n\n" + templateHead;

  const { text, searched } = await completer({
    system,
    prompt: scanPrompt(region, existingCompanies, thesis),
    maxTokens: 4000,
  });

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("scan returned no JSON");
  const raw = JSON.parse(match[0]);
  const mode = searched ? "web-searched" : "unverified-model-recall";
  const stamp = Date.now();
  const existing = new Set(existingCompanies.map((c) => c.toLowerCase()));

  const records = [];
  for (const [i, r] of raw.entries()) {
    if (!r?.company || existing.has(String(r.company).toLowerCase())) continue;
    const verdict = screenOpportunity(
      { stage: r.stage, round: r.funding, sector: r.sector, oneLiner: r.oneLiner },
      thesis,
    );
    if (!verdict.pass) continue; // off-thesis finds never reach the board
    const unverified = mode !== "web-searched";
    records.push({
      id: `OPP-SCAN-${stamp}-${String(i + 1).padStart(2, "0")}`,
      outboundSelected: true,
      realCompany: !unverified, // recall-only finds are leads, not confirmed records
      freshScan: true,
      scanRegion: region,
      verification: mode,
      currentAsOf: new Date().toISOString().slice(0, 10),
      company: r.company,
      sector: r.sector ?? "B2B AI software",
      location: r.geography ?? "—",
      card: "../MGV-OUTBOUND-2026-COMBINED.md",
      status: "research",
      oneLiner: r.oneLiner ?? "",
      stage: r.stage ?? "Pre-seed",
      latestRound: r.funding && r.funding !== "unknown" ? r.funding : undefined,
      raiseUsd: Number((String(r.funding ?? "").match(/([\d.]+)\s*M/i) ?? [])[1] ?? 0) * 1e6,
      website: r.sources?.[0]?.url ?? "",
      activitySignal: `live scan (${REGION_HINTS[region] ?? region}) — ${r.funding ?? "signal, not funding"}`,
      outboundRationale:
        `${unverified ? "UNVERIFIED LEAD (model recall, no web access — verify every fact before use). " : ""}` +
        `${r.whyNow ?? ""} ${r.evidenceNote ? `Evidence: ${r.evidenceNote}` : ""}`.trim(),
      screening: verdict,
      founders: (r.founders ?? []).filter((f) => f?.name).map((f, j) => ({
        id: `FND-SCAN-${stamp}-${i + 1}-${j + 1}`,
        name: f.name,
        role: f.role ?? "Founder",
        publicSignal: `${unverified ? "claimed (unverified): " : ""}${f.publicSignal ?? ""}`,
        avatar: { type: "initials", value: initials(f.name), basis: "neutral placeholder; public record only" },
        assessed: false,
      })),
      sources: (r.sources ?? []).filter((s) => s?.url).map((s) => ({
        label: `${unverified ? "[claimed] " : ""}${s.label ?? s.url}`,
        url: s.url,
      })),
    });
  }
  return { records, mode };
}

function initials(name) {
  const words = String(name).split(/\s+/).map((w) => w.replace(/[^\p{L}]/gu, "")).filter(Boolean);
  const pick = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return pick.map((w) => w[0].toUpperCase()).join("") || "—";
}
