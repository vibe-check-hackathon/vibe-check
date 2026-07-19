// In-memory Opportunity Card model + Markdown serializer.
// Shape follows sun/opportunity-card.md; confidence/trust are 0-100 integers
// per the numeric-confidence-trust convention ("unknown" only for true gaps).

export const STATUSES = ["intake", "research", "interview", "diligence", "decision", "closed"];

export function createCard({ id, company, sourceChannel = "inbound", thesisId, decisionHours = 24 }) {
  const now = new Date();
  return {
    front: {
      schema_version: 1,
      id,
      company,
      status: "intake",
      source_channel: sourceChannel,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      decision_deadline: new Date(now.getTime() + decisionHours * 3600 * 1000).toISOString(),
      founder_ids: [],
      thesis_id: thesisId,
    },
    summary: { pitch: "", recommendation: "Hold", confidence: "unknown", narrative: "" },
    intake: { stage: "", location: "", raiseUsd: 0, submitted: [], permissions: {} },
    founders: [],       // { id, name, role, score, scoreConfidence, trend, notes[] }
    company: {},        // { problem, market, businessModel, technology }
    assessment: null,   // { axes: {...}, thesisFit: {...} }
    evidence: { sources: [], claims: [], contradictions: [], gaps: [] },
    hypotheses: [],     // { id, text, evidenceFor[] }
    model: null,        // negotiation model, set in Developing
    terms: null,        // proposed term envelope, set in Developing
    revision: 1,
    counters: {},
  };
}

export function nextId(card, prefix) {
  const n = (card.counters[prefix] ?? 0) + 1;
  card.counters[prefix] = n;
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

export function setStatus(card, status) {
  if (!STATUSES.includes(status)) throw new Error(`invalid status: ${status}`);
  card.front.status = status;
  touch(card);
}

export function touch(card) {
  card.front.updated_at = new Date().toISOString();
  card.revision += 1;
}

const fmtUsd = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1e3)}K`);
const trust = (v) => (v === "unknown" ? "unknown" : `${v}/100`);

export function serializeCard(card) {
  const f = card.front;
  const lines = [];
  lines.push("---");
  for (const [k, v] of Object.entries(f)) {
    lines.push(`${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`);
  }
  lines.push("---", "", `# ${f.company}`, "", "## Summary", "");
  lines.push(`**One-line pitch:** ${card.summary.pitch}`);
  lines.push(`**Recommendation:** ${card.summary.recommendation}`);
  lines.push(`**Recommendation confidence:** ${trust(card.summary.confidence)}`, "");
  if (card.summary.narrative) lines.push(card.summary.narrative, "");

  lines.push("## Intake", "");
  lines.push(`- **Stage / location / raise:** ${card.intake.stage} / ${card.intake.location} / raising ${fmtUsd(card.intake.raiseUsd)}`);
  lines.push(`- **Submitted:** ${card.intake.submitted.join(", ")}`);
  const perms = Object.entries(card.intake.permissions).map(([k, v]) => `${k} ${v}`).join("; ");
  lines.push(`- **Permissions:** ${perms}`, "");

  lines.push("## Founders and Team", "");
  for (const fd of card.founders) {
    lines.push(`### ${fd.id} - ${fd.name}, ${fd.role}`, "");
    lines.push(`- **Founder Score snapshot:** ${fd.score}/100, confidence ${fd.scoreConfidence}/100, ${fd.trend}`);
    for (const note of fd.notes) lines.push(`- ${note}`);
    lines.push("");
  }

  if (card.assessment) {
    lines.push("## Assessment", "");
    lines.push("| Axis | Rating | Trend | Confidence | Evidence-backed rationale |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const [axis, a] of Object.entries(card.assessment.axes)) {
      lines.push(`| ${axis} | ${a.rating} | ${a.trend} | ${a.confidence}/100 | ${a.rationale} |`);
    }
    lines.push("", "### Thesis fit", "");
    for (const [k, v] of Object.entries(card.assessment.thesisFit)) lines.push(`- **${k}:** ${v}`);
    lines.push("");
  }

  lines.push("## Evidence and Gaps", "");
  lines.push("| ID | Claim or gap | State | Trust | Evidence / next action |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const c of card.evidence.claims) {
    lines.push(`| ${c.id} | ${c.text} | ${c.state} | ${trust(c.trust)} | ${c.evidence.join(" ")} |`);
  }
  for (const c of card.evidence.contradictions) {
    lines.push(`| ${c.id} | ${c.text} | contradicted | ${trust(c.trust)} | ${c.nextAction} |`);
  }
  for (const g of card.evidence.gaps) {
    lines.push(`| ${g.id} | ${g.text} | open | unknown | ${g.nextAction} |`);
  }
  lines.push("", "### Sources", "");
  for (const s of card.evidence.sources) {
    lines.push(`- **${s.id}:** ${s.description} (${s.origin}, ${s.collectedAt.slice(0, 10)})`);
  }
  lines.push("");

  if (card.hypotheses.length) {
    lines.push("## Interview and Diligence", "");
    for (const h of card.hypotheses) lines.push(`- **${h.id}:** ${h.text} (evidence: ${h.evidenceFor.join(", ")})`);
    lines.push("");
  }

  if (card.model && card.terms) {
    lines.push("## Decision and Proposed Terms", "");
    lines.push(`- **Human decision:** Pending`);
    lines.push(`- **Proposed terms:** ${card.terms.summary}`);
    lines.push(`- **Reasoning:** ${card.terms.reasoning}`);
    lines.push(`- **Negotiation model:** investor ${fmtUsd(card.model.investor.range[0] * 1e6)}-${fmtUsd(card.model.investor.range[1] * 1e6)} (target ${fmtUsd(card.model.investor.target * 1e6)}), founders est. ${fmtUsd(card.model.founder.range[0] * 1e6)}-${fmtUsd(card.model.founder.range[1] * 1e6)}, ZOPA ${card.model.zopa ? `${fmtUsd(card.model.zopa[0] * 1e6)}-${fmtUsd(card.model.zopa[1] * 1e6)}` : "none"} (confidence ${card.model.confidence}/100)`);
    lines.push("");
  }

  return lines.join("\n");
}
