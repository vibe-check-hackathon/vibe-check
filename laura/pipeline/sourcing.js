// Stage 1 — Sourcing (sun/system-architecture.md "Conceptual pipeline").
// Input:  intake submission (deck, forms, CVs, profile links)
// Output: an Opportunity Card with basic facts about founders and their idea
// How:    here deterministic extraction from the intake JSON; in production an
//         AGENT HOOK parses real documents and browses public sources.

import { createCard, nextId, setStatus, touch } from "./lib/card.js";

export function runSourcing(intake, bus) {
  const card = createCard({
    id: intake.opportunityId,
    company: intake.company,
    thesisId: intake.thesisId,
  });

  // 1. Register submitted materials as immutable sources.
  for (const m of intake.materials) {
    card.evidence.sources.push({
      id: nextId(card, "SRC"),
      description: m.description,
      origin: m.origin,
      collectedAt: new Date().toISOString(),
    });
  }
  const srcIds = card.evidence.sources.map((s) => s.id);

  // 2. Intake snapshot — exactly what the founders submitted, before enrichment.
  card.summary.pitch = intake.oneLiner;
  card.intake = {
    stage: intake.stage,
    location: intake.location,
    raiseUsd: intake.raiseUsd,
    submitted: intake.materials.map((m) => m.description),
    permissions: intake.permissions,
  };

  // 3. Founder snapshots. Founder Score starts from the durable profile when one
  //    exists; a cold-start founder gets a neutral prior with low confidence.
  //    AGENT HOOK: enrich from LinkedIn/GitHub/publications (tech spec §3.2).
  for (const f of intake.founders) {
    card.front.founder_ids.push(f.id);
    card.founders.push({
      id: f.id,
      name: f.name,
      role: f.role,
      score: f.priorScore ?? 50,
      scoreConfidence: f.priorScore ? 60 : 25,
      trend: f.priorScore ? f.priorTrend : "unknown",
      notes: f.background.map((b) => `${b} [${srcIds[0]}]`),
    });
  }

  // 4. Founder-provided claims enter as *claimed* with self-reported trust
  //    (30-54 band: "plausible and self-reported; no corroboration yet").
  for (const c of intake.claims) {
    const id = nextId(card, "CLM");
    const src = srcIds[c.sourceIndex ?? 0];
    card.evidence.claims.push({
      id,
      text: c.text,
      subject: c.subject,
      state: "claimed",
      trust: 40,
      evidence: [`[${src}]`],
    });
    bus.emit({ type: "card.update", ref: id, state: "claimed", trust: 40, evidence: src });
  }

  card.company = intake.companyProfile;

  // 5. Hand off to Developing.
  setStatus(card, "research");
  touch(card);
  bus.emit({ type: "status.change", status: "research", requiresHuman: false });

  return card;
}
