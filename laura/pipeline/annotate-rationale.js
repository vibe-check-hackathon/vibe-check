// Adds per-axis scoreRationale to every synthetic founder in
// opportunity-db/synthetic/index.json — WHY each sub-score is high or low,
// phrased to match the generated number (high = strength story, low = the
// weakness the score encodes). Synthetic full-consent tier only: these are
// invented people, so invented-but-consistent rationale is the point; real
// people stay "not assessed" and never get generated text.
//
// Deterministic and idempotent: node laura/pipeline/annotate-rationale.js

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const INDEX = join(dirname(fileURLToPath(import.meta.url)), "..", "opportunity-db", "synthetic", "index.json");

const band = (v) => (v >= 75 ? "high" : v >= 55 ? "mid" : "low");

/** Rationale templates per axis and band. ctx: {first, prior, years, role, company} */
const TEXT = {
  resilience: {
    high: (c) => `kept ${c.company}'s pilot alive through design-partner churn; met the hardest screening question with data, not defensiveness`,
    mid: (c) => `steady under routine setbacks; no hard reversal on record yet to test ${c.first} properly`,
    low: () => `deflected follow-ups on the stalled first launch; recovery stories stay vague when pressed`,
  },
  autonomy: {
    high: (c) => `shipped the first version of ${c.company} end-to-end before hiring; decisions arrive with owner and rationale attached`,
    mid: () => `owns the core product decisions; leans on advisors for pricing and go-to-market calls`,
    low: () => `roadmap follows the loudest customer; few decisions carry a clear owner`,
  },
  curiosity: {
    high: () => `rebuilt onboarding twice from session evidence; asks for disconfirming data unprompted`,
    mid: () => `iterates when the metrics force it; little exploration beyond the current playbook`,
    low: () => `pitch unchanged across three months of contact; feedback visibly bounces off`,
  },
  perseverance: {
    high: (c) => `${c.years ? `${c.years} years in the field and ` : ""}still takes weekly support shifts; effort is dated, not claimed`,
    mid: () => `consistent shipping cadence; longest documented push is one quarter`,
    low: () => `two pivots in six months without closing the loop on either`,
  },
  teamComplementarity: {
    high: (c) => `clean split with the co-founder (${c.role} owns ${c.role === "CEO" ? "commercial" : "technical"} territory); no contested ground in interviews`,
    mid: () => `roles overlap on product; founders self-report a working conflict routine`,
    low: () => `both founders answer the same questions; whole territories go uncovered`,
  },
};

const index = JSON.parse(readFileSync(INDEX, "utf8"));
const seen = new Set();
let annotated = 0;

for (const list of [index.opportunities, index.currentApplications, index.outboundSelected]) {
  for (const rec of list ?? []) {
    for (const f of rec.founders ?? []) {
      if (!f.scores) continue; // annotate every object occurrence — the same
      seen.add(f.id);          // founder is duplicated across the legacy and
                               // currentApplications lists as separate objects
      const ctx = {
        first: f.name.split(" ")[0],
        prior: f.bio?.match(/previously at ([^;]+);/)?.[1],
        years: f.bio?.match(/(\d+) years/)?.[1],
        role: f.role,
        company: rec.company,
      };
      f.scoreRationale = Object.fromEntries(
        Object.entries(f.scores).map(([axis, v]) => [
          axis,
          `${TEXT[axis]?.[band(v)]?.(ctx) ?? "no rationale template"} · basis: screening call ${f.id.replace("FND", "INT")} (synthetic)`,
        ]),
      );
      annotated += 1;
    }
  }
}

index.rationaleBasis =
  "scoreRationale strings are part of the synthetic full-consent demo tier — invented to match the generated sub-scores; real people remain not assessed";
writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`annotated ${annotated} founder records (${seen.size} unique) in ${INDEX}`);
