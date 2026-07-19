// Outbound identification (MVP #5): turns the public-source research doc
// laura/opportunity-db/MGV-OUTBOUND-2026-COMBINED.md into board-ready
// outboundSelected records in opportunity-db/synthetic/index.json.
//
// Every record is (1) screened through the canonical thesis screen before it
// is admitted, and (2) cross-referenced against the fund's own portfolio
// (Martin/seed-speed-portfolio-enriched.md) so each outbound card carries its
// portfolio adjacency — which existing investment makes this team relevant.
//
// Integrity: real companies and founders, public sources only. Founder names,
// roles and signals are quoted public facts; the founder-evidence score is
// evidence COVERAGE (per the research doc's own model), never a personality
// judgment — founders stay assessed:false with no generated sub-scores.
//
// Idempotent: node laura/pipeline/build-outbound.js

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { screenOpportunity } from "./lib/screening.js";
import { loadThesis } from "./lib/thesis.js";

const here = dirname(fileURLToPath(import.meta.url));
const COMBINED = join(here, "..", "opportunity-db", "MGV-OUTBOUND-2026-COMBINED.md");
const PORTFOLIO = join(here, "..", "..", "Martin", "seed-speed-portfolio-enriched.md");
const INDEX = join(here, "..", "opportunity-db", "synthetic", "index.json");

const initials = (name) => {
  const words = name.split(/\s+/).map((w) => w.replace(/[^\p{L}]/gu, "")).filter(Boolean);
  const pick = words.length > 1 ? [words[0], words[words.length - 1]] : words;
  return pick.map((w) => w[0].toUpperCase()).join("") || "—";
};

/* ---------- parse the outbound research doc ---------- */

function parseOutboundCards(md) {
  // Cards start at a frontmatter block whose first line is `schema_version: 1`.
  const chunks = md.split(/\n---\n(?=schema_version: 1)/).slice(1);
  return chunks.map((chunk) => {
    const fm = Object.fromEntries(
      chunk.split("\n---\n")[0].split("\n")
        .map((l) => l.match(/^(\w+):\s*(.+)$/))
        .filter(Boolean)
        .map(([, k, v]) => [k, v.replace(/^"|"$/g, "")]),
    );
    const grab = (rx) => chunk.match(rx)?.[1]?.trim();
    const founders = [...chunk.matchAll(/^\| `(FND-[^`]+)` \| (.+?) \| (.+?) \| (.+?) \|$/gm)].map(
      ([, id, name, role, signal]) => ({ id, name: name.trim(), role: role.trim(), signal: signal.trim() }),
    );
    const sources = [...chunk.matchAll(/^- \*\*SRC-\d+:\*\* (.+?) — (https?:\/\/\S+)/gm)].map(
      ([, label, url]) => ({ label: label.trim(), url }),
    );
    return {
      id: fm.id,
      company: fm.company,
      priority: fm.priority,
      founderScore: Number(fm.founder_score),
      triggerDate: fm.trigger_date,
      triggerType: (fm.trigger_type ?? "").replace(/_/g, " "),
      oneLiner: grab(/\*\*One-line pitch:\*\* (.+)/),
      whyNow: grab(/\*\*Why now:\*\* (.+?)\s{2}$/m) ?? grab(/\*\*Why now:\*\* (.+)/),
      geography: grab(/\| Geography \| (.+?) \|/),
      stage: grab(/\| Estimated stage \| (.+?) \|/),
      funding: grab(/\| Public funding \| (.+?) \|/),
      category: grab(/\| Product\/category \| (.+?) \|/),
      checkFit: grab(/\*\*\$100K check fit:\*\* (.+)/),
      founders,
      sources,
    };
  });
}

/* ---------- parse the seed+speed portfolio for adjacency ---------- */

function parsePortfolio(md) {
  const verified = md.split("## ✅ Verified portfolio cards")[1]?.split("## ◻︎")[0] ?? "";
  return [...verified.matchAll(/^### (.+?) — (.+)$([\s\S]*?)(?=^### |^---$)/gm)].map(([, name, descriptor, body]) => ({
    name: name.trim(),
    descriptor: descriptor.trim(),
    sector: body.match(/\*\*Sector:\*\* (.+?) ·/)?.[1]?.trim() ?? "",
  }));
}

/** Specific-domain tokens (generic "ai"/"software" excluded — everything here is AI). */
const DOMAIN_TOKENS = [
  "agent", "agents", "governance", "compliance", "grc", "risk", "diligence", "supply", "chain",
  "energy", "renewable", "speech", "voice", "legal", "privacy", "esg", "industrial", "factory",
  "manufacturing", "security", "cyber", "infrastructure", "inference", "context", "erp",
  "pharmaceutical", "chemical", "creative", "cell", "bio", "therapeutic", "hotel", "fintech",
];
const tokensOf = (text) => new Set(DOMAIN_TOKENS.filter((t) => new RegExp(`\\b${t}`, "i").test(text)));

function alignments(card, portfolio) {
  const mine = tokensOf(`${card.oneLiner} ${card.category}`);
  return portfolio
    .map((p) => {
      const theirs = tokensOf(`${p.descriptor} ${p.sector}`);
      const shared = [...mine].filter((t) => theirs.has(t));
      return { p, shared };
    })
    .filter((a) => a.shared.length)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 2)
    .map((a) => ({ company: a.p.name, sector: a.p.sector, sharedGround: a.shared.join(", ") }));
}

/* ---------- classify + assemble board records ---------- */

function sectorOf(card) {
  const t = `${card.oneLiner} ${card.category}`.toLowerCase();
  if (/inference|compil|speech|context repository|mcp|agent/.test(t)) return "AI infrastructure";
  if (/grc|compliance|governance|risk|diligence/.test(t)) return "AI governance / compliance";
  if (/supply.chain|erp|pharmaceutical|chemical|industrial/.test(t)) return "Industrial AI";
  if (/cell|bio|therapeutic/.test(t)) return "TechBio / AI";
  if (/creative|taste/.test(t)) return "Creative AI tools";
  return "B2B AI software";
}

const raiseUsdOf = (funding) => {
  const m = (funding ?? "").match(/([\d.]+)\s*M/i);
  return m ? Math.round(Number(m[1]) * 1e6) : 0;
};

function buildRecords() {
  const cards = parseOutboundCards(readFileSync(COMBINED, "utf8"));
  const portfolio = parsePortfolio(readFileSync(PORTFOLIO, "utf8"));
  const thesis = loadThesis();
  const admitted = [];
  for (const card of cards) {
    const verdict = screenOpportunity(
      { stage: card.stage, round: card.funding, sector: sectorOf(card), oneLiner: card.oneLiner },
      thesis,
    );
    if (!verdict.pass) {
      console.log(`✗ screened out: ${card.company} — ${verdict.hardFails.join("; ")}`);
      continue;
    }
    const adj = alignments(card, portfolio);
    const adjText = adj.length
      ? `Portfolio adjacency (seed+speed): ${adj.map((a) => `${a.company} (${a.sector})`).join(", ")} — warm reference and diligence path.`
      : "No direct seed+speed portfolio adjacency — retained on founder-evidence strength.";
    admitted.push({
      id: card.id,
      outboundSelected: true,
      realCompany: true,
      currentAsOf: "2026-07-19",
      company: card.company,
      sector: sectorOf(card),
      location: card.geography ?? "—",
      card: "../MGV-OUTBOUND-2026-COMBINED.md",
      status: card.priority === "P0" ? "diligence" : "research",
      oneLiner: card.oneLiner ?? "",
      stage: card.stage ?? "Pre-seed",
      latestRound: card.funding,
      raiseUsd: raiseUsdOf(card.funding),
      website: card.sources.find((s) => /product|company|team|official/i.test(s.label))?.url ?? card.sources[0]?.url ?? "",
      activitySignal: `${card.triggerDate} ${card.triggerType} — ${card.funding}`,
      outboundRationale:
        `${card.whyNow ?? ""} Public founder-evidence score ${card.founderScore}/100 (evidence coverage, not personality; unknowns score zero). ` +
        `${adjText}${card.checkFit ? ` Check fit: ${card.checkFit}` : ""}`,
      screening: verdict,
      portfolioAlignments: adj,
      founders: card.founders.map((f) => ({
        id: f.id,
        name: f.name,
        role: f.role,
        publicSignal: f.signal,
        avatar: { type: "initials", value: initials(f.name), basis: "neutral placeholder; public record only" },
        assessed: false,
      })),
      sources: card.sources,
    });
    console.log(`✓ ${card.company} (${card.priority}, evidence ${card.founderScore}) — ${adjText.slice(0, 100)}`);
  }
  return admitted;
}

const index = JSON.parse(readFileSync(INDEX, "utf8"));
// Rebuild the research-doc records but keep anything the live scan added.
const freshScans = (index.outboundSelected ?? []).filter((r) => r.freshScan);
index.outboundSelected = [...buildRecords(), ...freshScans];
index.outboundBasis =
  "public-source outbound research (MGV-OUTBOUND-2026-COMBINED.md): real companies, quoted public facts, founder-evidence coverage scores only; screened via lib/screening.js; portfolio adjacency from Martin/seed-speed-portfolio-enriched.md";
writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`\nwrote ${index.outboundSelected.length} outbound records to ${INDEX}`);
