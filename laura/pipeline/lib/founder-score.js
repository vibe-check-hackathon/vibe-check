// Stage 8: Founder Score integration. Interview evidence produces FEATURE
// CONTRIBUTIONS — deterministic arithmetic turns them into a score; no model
// ever assigns the score directly. Component points, evidence-credit caps and
// confidence weights come from thesis.json interviewScore (configurable).
// Score and confidence are separate outputs: a high score built on
// self-report keeps low confidence. Unknown reduces confidence, never counts
// as negative evidence. Only observable professional evidence is scored —
// protected characteristics and personality inference are structurally
// excluded because no claim category exists for them.

const CATEGORY_TO_COMPONENT = {
  product_shipping: "product_shipping",
  technical_execution: "domain_depth",
  domain_expertise: "domain_depth",
  research: "domain_depth",
  open_source: "domain_depth",
  patent_or_ip: "domain_depth",
  prior_company: "prior_execution",
  prior_exit: "prior_execution",
  founder_history: "prior_execution",
  company_formation: "prior_execution",
  team_formation: "team_complementarity",
  prior_collaboration: "team_complementarity",
  hiring: "team_complementarity",
  customer_discovery: "customer_validation",
  customer_traction: "customer_validation",
  revenue: "customer_validation",
  market_insight: "momentum",
  fundraising: "momentum",
  investment_readiness: "momentum",
  pivot: "momentum",
  response_to_adversity: "evidence_quality",
  failure_or_setback: "evidence_quality", // owning setbacks is evidence quality, not a penalty
};

export function scoreConfig(thesis) {
  const cfg = thesis.raw?.interviewScore ?? thesis.interviewScore;
  if (!cfg) throw new Error("thesis.json is missing interviewScore — run the migration in INTERVIEWS.md");
  return cfg;
}

/** Feature contributions per component, credited through evidence-state caps. */
export function scoreFeatures(claims, links, thesis) {
  const cfg = scoreConfig(thesis);
  const caps = cfg.evidenceCreditCaps;
  const stateOf = new Map(links.map((l) => [l.claim_id, l.final_verification_state]));
  const features = [];
  for (const claim of claims) {
    const component = CATEGORY_TO_COMPONENT[claim.category];
    if (!component || !cfg.components[component]) continue;
    const state = stateOf.get(claim.claim_id) ?? claim.source_state;
    const cap = caps[state] ?? 0;
    const max = cfg.components[component].maxPoints;
    // Raw contribution: claim confidence × materiality, scaled into the
    // component's point budget; several claims accumulate but never exceed it.
    const materiality = claim.materiality === "high" ? 1 : claim.materiality === "medium" ? 0.6 : 0.3;
    const raw = Math.min(max, claim.confidence * materiality * max);
    features.push({
      feature: claim.category,
      component,
      raw_value: Number(raw.toFixed(2)),
      max_value: max,
      source_state: state,
      evidence_credit_cap: cap,
      credited_value: Number((raw * cap).toFixed(2)),
      claim_id: claim.claim_id,
    });
  }
  return features;
}

/** founder_score + separate founder_score_confidence. */
export function founderScore({ features, transcript, links, contradictions, thesis }) {
  const cfg = scoreConfig(thesis);
  const byComponent = {};
  for (const f of features) {
    byComponent[f.component] = Math.min(cfg.components[f.component].maxPoints, (byComponent[f.component] ?? 0) + f.credited_value);
  }
  const score = Math.round(Object.values(byComponent).reduce((a, b) => a + b, 0));

  const w = cfg.confidenceWeights;
  const founders = transcript.speakers.filter((s) => s.role === "founder");
  const identity = founders.length ? founders.reduce((a, s) => a + s.identity_confidence, 0) / founders.length : 0.3;
  const attribution = transcript.segments.length ? transcript.segments.reduce((a, s) => a + (s.confidence ?? 0.9), 0) / transcript.segments.length : 0;
  const completeness = transcript.segments.length ? transcript.segments.filter((s) => s.start_seconds != null || s.paragraph_index != null).length / transcript.segments.length : 0;
  const independent = links.length ? links.filter((l) => ["independent_verified", "first_party_documented"].includes(l.final_verification_state)).length / links.length : 0;
  const contradictionPenalty = Math.min(1, contradictions.length * 0.34);
  const confidence = Math.round(
    100 * (w.identity * identity + w.speakerAttribution * attribution + w.transcriptCompleteness * completeness + w.independentEvidence * independent - w.contradictionPenalty * contradictionPenalty),
  );
  return {
    founder_score: score,
    founder_score_confidence: Math.max(0, Math.min(100, confidence)),
    components: byComponent,
    scoring_version: cfg.scoringVersion,
  };
}

/** Audit record for every score update — nothing is destructively replaced. */
export function scoreVersionRecord(previous, next, features) {
  return {
    previous_score: previous?.founder_score ?? null,
    new_score: next.founder_score,
    previous_confidence: previous?.founder_score_confidence ?? null,
    new_confidence: next.founder_score_confidence,
    changed_features: features.map((f) => `${f.component}:${f.feature}=+${f.credited_value} (${f.source_state}, cap ${f.evidence_credit_cap})`),
    evidence: features.map((f) => f.claim_id),
    scoring_version: next.scoring_version,
    timestamp: new Date().toISOString(),
  };
}
