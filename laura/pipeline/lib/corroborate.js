// Stage 6-7: corroboration + contradiction handling. Interview claims are
// checked against what the repository already knows — the verified seed+speed
// portfolio doc (Martin/seed-speed-portfolio-enriched.md), the opportunity-db
// cards, and the synthetic index. Corroboration NEVER overwrites the interview
// claim: it creates linked evidence records and a final_verification_state.
// Mismatches become explicit contradictions + diligence questions and are
// never silently resolved.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PORTFOLIO = join(here, "..", "..", "..", "Martin", "seed-speed-portfolio-enriched.md");
const DB = join(here, "..", "..", "opportunity-db");

let evdSeq = 0;
const evdId = (kind) => `EVD-${kind}-${String(++evdSeq).padStart(3, "0")}`;
export function resetEvidenceIds() {
  evdSeq = 0;
}

/** Corroboration sources are pluggable: each returns matches for a company. */
const SOURCES = [
  { name: "seed-speed-portfolio-enriched", lookup: lookupSeedSpeed },
  { name: "opportunity-db-cards", lookup: lookupOpportunityDb },
];

function lookupSeedSpeed(company) {
  if (!existsSync(PORTFOLIO)) return null;
  const md = readFileSync(PORTFOLIO, "utf8");
  const rx = new RegExp(`^### ${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^\\n]*$([\\s\\S]*?)(?=^### |^---$)`, "im");
  const m = md.match(rx);
  if (!m) return null;
  const body = m[1];
  return {
    ref: "Martin/seed-speed-portfolio-enriched.md",
    foundedYear: Number(body.match(/\*\*Founded:\*\*\s*~?(\d{4})/)?.[1]) || null,
    founders: body.match(/\*\*Founded:\*\*[^\n]*by \*\*([^*]+)\*\*/)?.[1]?.split(/,| & | and /).map((s) => s.trim()).filter(Boolean) ?? [],
    rounds: body.match(/\*\*Rounds:\*\*\s*([^\n]+(?:\n\s{2,}[^\n]+)*)/)?.[1]?.replace(/\s+/g, " ") ?? null,
    status: body.match(/\*\*Status:\*\*\s*([^·\n]+)/)?.[1]?.trim() ?? null,
  };
}

function lookupOpportunityDb(company) {
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const file = readdirSync(DB).find((n) => n.endsWith(".md") && n.toLowerCase().includes(slug));
  if (!file) return null;
  const md = readFileSync(join(DB, file), "utf8");
  return {
    ref: `laura/opportunity-db/${file}`,
    foundedYear: Number(md.match(/[Ff]ounded[^0-9]{0,20}(\d{4})/)?.[1]) || null,
    founders: [],
    rounds: md.match(/(?:[Rr]ound|[Rr]aised|Series [A-Z]|[Ss]eed)[^\n]{0,140}/)?.[0] ?? null,
    status: null,
  };
}

/**
 * Corroborate material claims for one company. Returns evidence records,
 * claim→evidence links with final verification states, contradictions, and
 * open diligence questions. Not-found stays unknown — unknown ≠ false.
 */
export function corroborate(claims, { company }) {
  const evidence = [];
  const links = [];
  const contradictions = [];
  const questions = [];
  const found = SOURCES.map((s) => ({ name: s.name, hit: company ? s.lookup(company) : null })).filter((s) => s.hit);

  for (const claim of claims) {
    const link = { claim_id: claim.claim_id, evidence_ids: [], final_verification_state: claim.verification_state === "contradicted" ? "contradicted" : "unknown", verification_confidence: claim.confidence };
    // The interview itself is evidence record #1 for every claim.
    const interviewEvd = evdId("INTERVIEW");
    evidence.push({ evidence_id: interviewEvd, kind: "interview", claim_id: claim.claim_id, state: claim.source_state, ref: claim.evidence_segment_ids.join(",") });
    link.evidence_ids.push(interviewEvd);

    if (claim.verification_state !== "contradicted") link.final_verification_state = claim.source_state;

    for (const { name, hit } of found) {
      if (claim.predicate === "founded_year" && hit.foundedYear) {
        const idr = evdId("INDEPENDENT");
        evidence.push({ evidence_id: idr, kind: "independent", claim_id: claim.claim_id, state: "independent_verified", ref: hit.ref, detail: `founded ${hit.foundedYear}` });
        link.evidence_ids.push(idr);
        if (Number(claim.value) === hit.foundedYear) {
          link.final_verification_state = "independent_verified";
          link.verification_confidence = Math.max(link.verification_confidence, 0.9);
        } else {
          link.final_verification_state = "contradicted";
          link.verification_confidence = 0.35;
          contradictions.push({ type: "external", claim_ids: [claim.claim_id], detail: `interview says founded ${claim.value}; ${name} records ${hit.foundedYear}`, diligence_question: `Confirm founding year: interview (${claim.value}) vs ${hit.ref} (${hit.foundedYear}).` });
        }
      }
      if (claim.category === "fundraising" && hit.rounds) {
        const idr = evdId("INDEPENDENT");
        evidence.push({ evidence_id: idr, kind: "independent", claim_id: claim.claim_id, state: "independent_verified", ref: hit.ref, detail: hit.rounds.slice(0, 160) });
        link.evidence_ids.push(idr);
        link.final_verification_state = link.final_verification_state === "contradicted" ? "contradicted" : "independent_verified";
        link.verification_confidence = Math.max(link.verification_confidence, 0.85);
      }
      if (claim.category === "prior_collaboration" && hit.founders.length >= 2) {
        const idr = evdId("INDEPENDENT");
        evidence.push({ evidence_id: idr, kind: "independent", claim_id: claim.claim_id, state: "first_party_documented", ref: hit.ref, detail: `founders on record: ${hit.founders.join(", ")}` });
        link.evidence_ids.push(idr);
        if (link.final_verification_state === "self_reported") link.final_verification_state = "first_party_documented";
      }
    }
    if (claim.requires_corroboration && link.final_verification_state === claim.source_state) {
      questions.push(`Corroborate ${claim.predicate} (${claim.claim_text.slice(0, 80)}…) — still ${claim.source_state} only.`);
    }
    links.push(link);
  }
  return { evidence, links, contradictions, questions, sourcesUsed: found.map((f) => f.name) };
}
