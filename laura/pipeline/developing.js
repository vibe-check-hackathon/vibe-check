// Stage 2 — Developing (sun/system-architecture.md "Conceptual pipeline").
// Input:  the card from Sourcing + the fund's investment thesis
// Output: card augmented with corroborated evidence, three independent
//         assessment axes, interview hypotheses, a negotiation model, and a
//         draft term envelope for the human VC to sign off
// How:    a research loop over the evidence ledger. Corroboration results are
//         deterministic here; each AGENT HOOK marks where a Claude call or web
//         research replaces the canned finding.

import { nextId, setStatus, touch } from "./lib/card.js";

export function runDeveloping(card, thesis, research, bus) {
  // 1. Corroborate founder-provided claims against independent evidence.
  //    AGENT HOOK: web/GitHub/paper lookups per claim (tech spec §5).
  for (const finding of research.corroborations) {
    const claim = card.evidence.claims.find((c) => c.text.includes(finding.match));
    if (!claim) continue;
    claim.state = finding.state;
    claim.trust = finding.trust;
    claim.evidence.push(`[${finding.source}]`);
    registerSource(card, finding.source, finding.sourceDescription, "public web");
    bus.emit({ type: "card.update", ref: claim.id, state: claim.state, trust: claim.trust, evidence: finding.source });
  }

  // 2. Detect contradictions between submitted materials.
  //    Contradicted evidence lands in the 0-29 trust band.
  for (const con of research.contradictions) {
    const id = nextId(card, "CON");
    card.evidence.contradictions.push({ id, text: con.text, trust: 20, nextAction: con.nextAction });
    bus.emit({ type: "card.update", ref: id, state: "contradicted", trust: 20, evidence: con.evidence });
  }

  // 3. Record what is missing. Unknown is not false — gaps carry no number.
  for (const gap of research.gaps) {
    const id = nextId(card, "GAP");
    card.evidence.gaps.push({ id, text: gap.text, nextAction: gap.nextAction });
    bus.emit({ type: "card.update", ref: id, state: "open", trust: "unknown", evidence: gap.nextAction });
  }

  // 4. Interview hypotheses: what the live call must test (feeds Matching).
  for (const h of research.hypotheses) {
    card.hypotheses.push({ id: nextId(card, "HYP"), text: h.text, evidenceFor: h.evidenceFor });
  }

  // 5. Score the three axes independently — never averaged (card rule).
  //    Confidence derives from the trust of the claims each axis rests on.
  card.assessment = {
    axes: research.axes,
    thesisFit: assessThesisFit(card, thesis),
  };

  // 6. Negotiation model from the thesis + evidence quality (BATNA-first:
  //    the reservation point derives from the named alternative, and low
  //    evidence trust widens/discounts the envelope — see
  //    laura/opportunity-categories.md §4).
  card.model = buildNegotiationModel(card, thesis);
  bus.emit({
    type: "model.update",
    party: "founder",
    range: card.model.founder.range,
    zopa: card.model.zopa,
    confidence: card.model.confidence,
    note: "initial estimate from deck ask and comparable rounds",
  });

  // 7. Draft term envelope + recommendation for the human gate.
  card.terms = draftTerms(card, thesis);
  card.summary.recommendation = card.model.zopa ? "Proceed" : "Hold";
  card.summary.confidence = card.model.confidence;
  card.summary.narrative =
    `${card.front.company} fits the thesis with ${card.evidence.contradictions.length} open contradiction(s) and ` +
    `${card.evidence.gaps.length} gap(s) to resolve in the interview before terms go founder-facing.`;

  // 8. Human approval gate before any founder-facing step (tech spec §11).
  setStatus(card, "interview");
  touch(card);
  bus.emit({
    type: "approval.update",
    gate: "interview_plan",
    by: "pending",
    action: "requested",
    bounds: { reservation: card.model.investor.range[1], target: card.model.investor.target },
  });
  bus.emit({ type: "status.change", status: "interview", recommendation: card.terms.summary, requiresHuman: true });

  return card;
}

function registerSource(card, id, description, origin) {
  if (card.evidence.sources.some((s) => s.id === id)) return;
  card.evidence.sources.push({ id, description, origin, collectedAt: new Date().toISOString() });
  // keep the SRC counter ahead of externally assigned research source ids
  const n = Number(id.split("-")[1]);
  if (n > (card.counters.SRC ?? 0)) card.counters.SRC = n;
}

function assessThesisFit(card, thesis) {
  const raiseM = card.intake.raiseUsd / 1e6;
  return {
    "Sector / stage / geography": thesis.sectors.some((s) => card.company.sector?.includes(s)) ? "Fit" : "Out of thesis",
    "Check size": raiseM * 0.1 <= thesis.maxCheckUsd / 1e6 ? `Fit for a $${thesis.maxCheckUsd / 1e3}K initial check` : "Above check size",
    "Ownership target": "Unknown until cap table and round structure arrive",
    "Risk appetite": card.evidence.gaps.length <= thesis.maxOpenGaps ? "Fit" : "Fit only if gaps clear diligence",
  };
}

function buildNegotiationModel(card, thesis) {
  // Investor side is derived, not invented: the pre-money target anchors on
  // comparable rounds (a multiple of the ask), the reservation point on the
  // BATNA (a named comparable opportunity).
  const askM = card.intake.raiseUsd / 1e6;
  const target = Math.round(askM * thesis.compsMultiple); // pre-money target, $M
  const investor = {
    batna: thesis.batnaRef,
    range: [target - 1, target + 3], // opening .. reservation
    target,
  };
  // Founder side is an estimate until the interview tests it.
  const founderTarget = Math.round(askM * thesis.founderAskMultiple);
  const founder = { range: [founderTarget - 2, founderTarget + 2], target: founderTarget };

  const lo = Math.max(investor.range[0], founder.range[0]);
  const hi = Math.min(investor.range[1], founder.range[1]);
  const zopa = hi > lo ? [lo, hi] : null;

  // Confidence in the model = mean trust of the claims it rests on, capped by
  // open contradictions (numeric-confidence-trust convention, 0-100).
  const trusts = card.evidence.claims.map((c) => (typeof c.trust === "number" ? c.trust : 0));
  const meanTrust = Math.round(trusts.reduce((a, b) => a + b, 0) / Math.max(trusts.length, 1));
  const confidence = Math.max(10, meanTrust - card.evidence.contradictions.length * 10);

  return { investor, founder, zopa, confidence, levers: thesis.levers };
}

function draftTerms(card, thesis) {
  // The draft opens investor-favorable: cap at the opening bound, not target.
  const cap = card.model.investor.range[0];
  return {
    summary: `$${thesis.maxCheckUsd / 1e3}K SAFE, $${cap}M valuation cap, pro-rata rights`,
    reasoning:
      `Cap reflects the investor target with a discount for ` +
      `${card.evidence.contradictions.map((c) => c.id).join(", ") || "no contradictions"} and open ` +
      `${card.evidence.gaps.map((g) => g.id).join(", ")}. Bounds cite the thesis and evidence ledger; ` +
      `human investor and counsel must approve before anything goes founder-facing.`,
  };
}
