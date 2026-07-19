// Generates the SYNTHETIC founder cohort: fictional companies and people with
// full personal-style data (emails, socials, scores) that we are not allowed
// to collect for real founders. Seeded → reproducible; all domains use the
// RFC 2606 reserved ".example" TLD so nothing can collide with a real person.
//
// Usage: node generate-fixtures.js   (writes ../opportunity-db/synthetic/)

import { faker } from "@faker-js/faker";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

faker.seed(4242);

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "opportunity-db", "synthetic");
mkdirSync(outDir, { recursive: true });

const SECTORS = [
  ["developer tooling", "CI flake triage that finds the commit, not the symptom"],
  ["logistics AI", "route recovery engine for delayed middle-mile freight"],
  ["climate software", "heat-pump fleet balancing for district utilities"],
  ["fintech infrastructure", "instant SEPA reconciliation for marketplace payouts"],
  ["health tech", "prior-authorization drafting copilot for clinics"],
  ["industrial AI", "acoustic anomaly detection for packaging lines"],
];
const CITIES = ["Berlin, DE", "Munich, DE", "Amsterdam, NL", "Zurich, CH", "Copenhagen, DK", "Vienna, AT"];
const STATUSES = ["research", "interview", "interview", "diligence", "research", "intake"];

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const score = (lo, hi) => faker.number.int({ min: lo, max: hi });

function makeFounder(i, j, domain, role) {
  // Sex is generated explicitly, then the name is drawn to match it — so
  // avatar libraries (Figma etc.) key off a reliable field, never name-guessing.
  const sex = faker.person.sexType();
  const first = faker.person.firstName(sex);
  const last = faker.person.lastName();
  const name = `${first} ${last}`;
  const handle = kebab(`${first}-${last}`);
  const id = `FND-SYN-${String(i + 1).padStart(2, "0")}${String(j + 1)}`;
  return {
    id,
    name, sex, role,
    avatar: `avatars/${id}.svg`,
    email: `${kebab(first)}.${kebab(last)}@${domain}`,
    linkedin: `https://linkedin.example/in/${handle}`,
    github: role === "CTO" ? `https://github.example/${handle}` : undefined,
    phone: `+49 555 ${faker.string.numeric(7)}`,
    bio: `${faker.person.jobTitle()} previously at ${faker.company.name()}; ${faker.number.int({ min: 4, max: 14 })} years in the field.`,
    // Full assessment — allowed BECAUSE this person does not exist.
    scores: {
      resilience: score(35, 92), autonomy: score(40, 95), curiosity: score(38, 93),
      perseverance: score(35, 90), teamComplementarity: score(40, 88),
    },
    scoreConfidence: score(35, 75),
    assessed: true,
  };
}

const opportunities = SECTORS.map(([sector, pitch], i) => {
  const base = faker.company.name().split(/[ ,-]/)[0];
  const company = base.charAt(0).toUpperCase() + base.slice(1) + ["ly", "grid", "works", "loop", "sense", "layer"][i];
  const domain = `${kebab(company)}.example`;
  const founders = [makeFounder(i, 0, domain, "CEO"), makeFounder(i, 1, domain, "CTO")];
  if (i % 3 === 0) founders.push(makeFounder(i, 2, domain, "COO"));
  const raise = faker.number.int({ min: 8, max: 25 }) * 100000;
  return {
    id: `OPP-SYN-${String(i + 1).padStart(4, "0")}`,
    synthetic: true,
    company, sector, location: CITIES[i],
    card: `OPP-SYN-${String(i + 1).padStart(4, "0")}-${kebab(company)}.md`,
    status: STATUSES[i],
    oneLiner: pitch,
    stage: "Pre-seed",
    raiseUsd: raise,
    website: `https://${domain}`,
    permissions: { "public research": "granted", "interview recording": "granted", "reference calls": "granted" },
    founders,
    interview: { public: false, locked: false, note: "AI interview available in demo — synthetic founders, full consent simulated" },
  };
});

for (const o of opportunities) {
  const founderMd = o.founders.map((f) => `### ${f.id} - ${f.name}, ${f.role}

- **Contact (synthetic):** ${f.email} · ${f.phone}
- **Channels (synthetic):** ${f.linkedin}${f.github ? ` · ${f.github}` : ""}
- **Background:** ${f.bio}
- **Founder sub-scores:** resilience ${f.scores.resilience} · autonomy ${f.scores.autonomy} · curiosity ${f.scores.curiosity} · perseverance ${f.scores.perseverance} · team ${f.scores.teamComplementarity} (confidence ${f.scoreConfidence}/100)
`).join("\n");
  const md = `---
schema_version: 1
id: ${o.id}
company: ${o.company}
status: ${o.status}
source_channel: inbound
founder_ids: [${o.founders.map((f) => f.id).join(", ")}]
thesis_id: THESIS-001
synthetic: true
---

# ${o.company} (SYNTHETIC)

> Every person, company, email, and score in this card is generated with
> faker.js (seed 4242). Domains use the reserved .example TLD. Nothing here
> refers to a real person or company.

## Summary

**One-line pitch:** ${o.oneLiner}
**Stage / location / raise:** ${o.stage} / ${o.location} / $${(o.raiseUsd / 1e6).toFixed(1)}M
**Permissions:** all granted (simulated consent)

## Founders and Team

${founderMd}
`;
  writeFileSync(join(outDir, o.card), md, "utf8");
}

writeFileSync(join(outDir, "index.json"), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  generator: "generate-fixtures.js, @faker-js/faker seed 4242",
  basis: "fully synthetic people and companies; .example domains; safe to show and push",
  opportunities,
}, null, 2), "utf8");

console.log(`wrote ${opportunities.length} synthetic opportunities to opportunity-db/synthetic/`);
console.log(opportunities.map((o) => `${o.id} ${o.company} (${o.founders.length} founders)`).join("\n"));
