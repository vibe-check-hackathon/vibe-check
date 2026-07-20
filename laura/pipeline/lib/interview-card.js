// Stage 10-12: deterministic Markdown rendering (no free-form LLM prose in
// factual sections), OPP-MGV-INT-* creation, and enrichment of existing
// OPP-MGV-* cards. Every interview-derived statement carries a traceable
// reference: [INT-001, 00:12:42–00:13:18] or [INT-001, paragraph 18].

const anchor = (t, seg) => {
  if (seg.start_seconds != null) {
    const f = (x) => `${String(Math.floor(x / 3600)).padStart(2, "0")}:${String(Math.floor((x % 3600) / 60)).padStart(2, "0")}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
    return `[${t}, ${f(seg.start_seconds)}${seg.end_seconds != null ? `–${f(seg.end_seconds)}` : ""}]`;
  }
  return `[${t}, paragraph ${seg.paragraph_index}]`;
};

export function segmentRef(intId, transcript, segmentIds) {
  const map = new Map(transcript.segments.map((s) => [s.segment_id, s]));
  return segmentIds.map((id) => (map.has(id) ? anchor(intId, map.get(id)) : `[${intId}, ${id}]`)).join(" ");
}

/** Full interview opportunity card — every section from the pipeline spec. */
export function renderInterviewCard(record) {
  const { oppId, intId, company, personName, transcript, claims, links, evidence, contradictions, questions, features, score, review, outreach, createdAt, hypothesis, sourceOpportunityId } = record;
  const stateOf = new Map(links.map((l) => [l.claim_id, l]));
  const ref = (c) => segmentRef(intId, transcript, c.evidence_segment_ids);
  const speakerName = (id) => transcript.speakers.find((s) => s.speaker_id === id)?.display_name ?? id;

  const claimRows = claims
    .map((c) => {
      const link = stateOf.get(c.claim_id);
      return `| ${c.claim_id} | ${c.category} | ${c.claim_text.replace(/\|/g, "/")} | ${speakerName(c.speaker_id)} | ${c.source_state} | ${link?.final_verification_state ?? c.verification_state} | ${Math.round((link?.verification_confidence ?? c.confidence) * 100)}/100 | ${ref(c)} |`;
    })
    .join("\n");
  const evidenceRows = evidence.map((e) => `- **${e.evidence_id}** (${e.kind}, ${e.state}) → ${e.claim_id} — ${e.detail ?? e.ref}`).join("\n");
  const contradictionRows = contradictions.length
    ? contradictions.map((x) => `- **${x.type}** [${x.claim_ids.join(", ")}]: ${x.detail}`).join("\n")
    : "- none detected in this interview";
  const questionRows = questions.length ? questions.map((q) => `- [ ] ${q}`).join("\n") : "- none open";
  const featureRows = features
    .map((f) => `| ${f.component} | ${f.feature} | ${f.raw_value}/${f.max_value} | ${f.source_state} | ×${f.evidence_credit_cap} | ${f.credited_value} | ${f.claim_id} |`)
    .join("\n");
  const componentRows = Object.entries(score.components)
    .map(([k, v]) => `| ${k} | ${Number(v.toFixed(1))} |`)
    .join("\n");

  return `---
schema_version: 1
id: ${oppId}
company: ${JSON.stringify(company)}
status: ${review.state}
source_channel: interview_pipeline
source_opportunity_id: ${sourceOpportunityId ? JSON.stringify(sourceOpportunityId) : "null"}
interview_id: ${intId}
transcript_id: ${transcript.transcript_id}
content_hash: ${transcript.content_hash}
founder_score: ${score.founder_score}
founder_score_confidence: ${score.founder_score_confidence}
scoring_version: ${score.scoring_version}
created_at: ${createdAt}
thesis_id: THESIS-001
data_basis: "interview-derived evidence; self-report capped per evidence-state policy; human review required before outreach or decisions"
---
# ${company} — interview-derived opportunity

## Summary

${personName ?? "The founder"} interviewed in "${transcript.title}". ${claims.length} claims extracted, ${links.filter((l) => l.final_verification_state === "independent_verified").length} independently verified, ${contradictions.length} contradiction(s) retained. Founder Score ${score.founder_score}/100 at confidence ${score.founder_score_confidence}/100 — self-reported claims are credited at most ${Math.round((record.caps?.self_reported ?? 0.65) * 100)}%.

## Why now

${claims.find((c) => ["market_insight", "fundraising", "pivot"].includes(c.category))?.claim_text ?? "No timing trigger stated in the interview."} ${claims.find((c) => ["market_insight", "fundraising", "pivot"].includes(c.category)) ? ref(claims.find((c) => ["market_insight", "fundraising", "pivot"].includes(c.category))) : ""}

## Founder and team

| Speaker | Role | Identity confidence |
|---|---|---:|
${transcript.speakers.map((s) => `| ${s.display_name} | ${s.role} | ${Math.round(s.identity_confidence * 100)}/100 |`).join("\n")}

> Founder facts are public/professional evidence only. No personality inference, no protected characteristics — categories for them do not exist in this pipeline.

## Interview source

- **Interview:** ${intId} — "${transcript.title}"
- **Source:** ${transcript.source_url ?? "authorized local file"} (policy: ${transcript.policy?.access_status ?? "n/a"}, storage: ${transcript.policy?.content_storage_status ?? "n/a"})
- **Segments:** ${transcript.segments.length} · **speakers:** ${transcript.speakers.length} · **content hash:** ${transcript.content_hash.slice(0, 16)}…

## Interview-derived signals

| Claim | Category | Statement | Speaker | Source state | Verification | Conf | Ref |
|---|---|---|---|---|---|---:|---|
${claimRows}

## Founder Score

Score **${score.founder_score}/100** · confidence **${score.founder_score_confidence}/100** (${score.scoring_version}). Score and confidence are separate: self-report keeps confidence low until corroborated. Unknown evidence scores zero credit — unknown ≠ false, so it lowers confidence, never the score direction.

| Component | Credited points |
|---|---:|
${componentRows}

### Feature contributions

| Component | Feature | Raw | Evidence state | Cap | Credited | Claim |
|---|---|---|---|---|---:|---|
${featureRows}

## Evidence ledger

${evidenceRows}

## Contradictions

${contradictionRows}

## Open diligence questions

${questionRows}

## Company or startup hypothesis

${hypothesis}

## Stage and readiness

${claims.find((c) => c.category === "fundraising")?.claim_text ?? "Stage not established from the interview — confirm in diligence."}

## Funding and capital context

${links.filter((l) => l.final_verification_state === "independent_verified").length ? "Funding claims corroborated against repository records (see evidence ledger)." : "Funding claims remain self-reported — corroborate before any decision."}

## Outbound strategy

Reference at most one or two public details from the interview; no internal scores, no surveillance framing, no unverified raise claims. Low-friction call to action.

## Draft outreach message

> ${outreach.text}

**Outreach state:** ${outreach.state}${outreach.state === "draft" ? " — held until human approval" : ""}

## Human-review status

**${review.state}**${review.notes ? ` — ${review.notes}` : ""}

Checklist: speaker identity · anchors preserved · claims segment-linked · self-report labeled · corroboration attempted · contradictions visible · permitted evidence only · outreach non-surveillance · human approved outbound.

## Decision

- **Automatic decisions:** none — human review is mandatory before outreach, investment framing, or identity merges.
- **Recommended next step:** ${contradictions.length ? "resolve the contradictions above before anything else" : review.state === "approved" ? "proceed with the approved outreach draft" : "complete human review"}.

## Sources

- **INT-001 (${intId}):** ${transcript.source_url ?? "authorized local file"} — retrieved ${transcript.retrieved_at?.slice(0, 10) ?? "n/a"}
${record.corroborationSources?.map((s) => `- corroboration: ${s}`).join("\n") ?? ""}
`;
}

/** Append an interview-evidence section to an EXISTING OPP-MGV-* card. The
 *  previous version must be preserved by the caller (audit history). */
export function enrichmentSection(record) {
  const { intId, transcript, claims, links, contradictions, score } = record;
  const stateOf = new Map(links.map((l) => [l.claim_id, l.final_verification_state]));
  const lines = claims
    .map((c) => `- **${c.claim_id}** (${c.category}, ${stateOf.get(c.claim_id) ?? c.source_state}): ${c.claim_text} ${segmentRef(intId, transcript, c.evidence_segment_ids)}`)
    .join("\n");
  return `
## Interview evidence — ${intId} (${transcript.retrieved_at?.slice(0, 10) ?? ""})

Interview "${transcript.title}" processed by the interview pipeline. Founder Score contribution ${score.founder_score}/100 at confidence ${score.founder_score_confidence}/100 (${score.scoring_version}); self-report credit-capped per policy.

${lines}

${contradictions.length ? `**Contradictions:** ${contradictions.map((x) => x.detail).join("; ")}` : "**Contradictions:** none detected."}
`;
}
