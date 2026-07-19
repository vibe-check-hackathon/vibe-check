// Term-sheet engine: basic SAFE terms from the thesis, ADAPTED by the team
// analysis (founder score + confidence, trust, contradictions, gaps, ZOPA),
// with a detailed explanation for every adjustment — what changed, from what,
// to what, because of which evidence. Deterministic: same analysis, same
// terms. Nothing here is binding — the human gate + counsel stay mandatory
// (thesis.negotiation.reservationRequiresHumanApproval).
//
// Consumers: POST /term-sheet (Martin's annotated-PDF frontend) and the
// pipeline. Section ids (TS-§n) are stable so PDF annotations can anchor.

import { loadThesis } from "./thesis.js";

/** Negotiation envelope from the thesis (mirrors developing.js math). */
function envelope(askUsd, thesis) {
  const askM = (askUsd || 1.2e6) / 1e6;
  const target = Math.round(askM * thesis.raw.negotiation.compsMultiple);
  const investor = { range: [target - 1, target + 3], target };
  const founderTarget = Math.round(askM * thesis.raw.negotiation.founderAskMultiple);
  const founder = { range: [founderTarget - 2, founderTarget + 2], target: founderTarget };
  const lo = Math.max(investor.range[0], founder.range[0]);
  const hi = Math.min(investor.range[1], founder.range[1]);
  return { investor, founder, zopa: hi > lo ? [lo, hi] : null };
}

/**
 * analysis = {
 *   company, askUsd,
 *   founderScore (0-100|null), founderScoreConfidence (0-100|null),
 *   trustScore (0-100|null), contradictions: [text], gaps: [text],
 *   softFlags: [text], axisCappedBy (sub-score below floor, or null),
 *   negotiation? (override envelope: {investor:{range,target}, founder:{...}, zopa})
 * }
 */
export function generateTermSheet(analysis, thesis = loadThesis()) {
  const t = thesis.raw;
  const env = analysis.negotiation ?? envelope(analysis.askUsd, thesis);
  const adjustments = [];
  const adjust = (term, from, to, because, evidence) => {
    adjustments.push({ term, from, to, because, evidence });
    return to;
  };

  // ---- base terms: the thesis default, before the team analysis ----
  const terms = {
    instrument: "Post-money SAFE",
    checkUsd: t.fund.checkSizeUsd.max,
    valuationCapM: env.investor.range[0], // investor-favorable opening
    discountPct: 0,
    proRata: true,
    boardRights: "none",
    informationRights: "standard quarterly reporting",
    closingDays: 10,
    tranches: null,
    conditionsPrecedent: [],
    followOnFraming: false,
  };
  const base = { ...terms, conditionsPrecedent: [] };

  const score = analysis.founderScore;
  const conf = analysis.founderScoreConfidence;
  const contradictions = analysis.contradictions ?? [];
  const gaps = analysis.gaps ?? [];

  // ---- adaptation rules: team analysis moves the terms, with reasons ----
  if (env.zopa === null) {
    return {
      status: "blocked",
      company: analysis.company,
      terms: null,
      base,
      envelope: env,
      adjustments: [{ term: "issuance", from: "draft", to: "blocked", because: "no ZOPA: the investor and founder ranges do not overlap — issuing terms would either overpay or insult; renegotiate the ask first", evidence: `investor $${env.investor.range[0]}–${env.investor.range[1]}M vs founder $${env.founder.range[0]}–${env.founder.range[1]}M` }],
      requiresHumanApproval: true,
    };
  }

  if (score != null && score >= 75 && (conf ?? 0) >= 60) {
    terms.valuationCapM = adjust(
      "valuationCapM", terms.valuationCapM, Math.round((env.zopa[0] + env.zopa[1]) / 2),
      "strong, corroborated team: competing funds will see the same evidence, so the cap moves from the investor opening to the ZOPA midpoint to actually win the allocation",
      `founder score ${score}/100 at confidence ${conf}/100`,
    );
  } else if (score != null && score >= 75 && (conf ?? 0) < 60) {
    terms.tranches = adjust(
      "tranches", null, { atSigning: 0.5, onMilestone: 0.5, milestone: "independent corroboration of the top self-reported claims" },
      "the score is high but rests on self-report (low confidence): structure pays for proof — half the check lands when the claims are independently verified",
      `founder score ${score}/100 but confidence ${conf}/100 (< 60)`,
    );
  } else if (score != null && score < 45) {
    terms.followOnFraming = adjust(
      "followOnFraming", false, true,
      "weak founder-axis evidence: do not lead — frame as a small follow-on/option ticket with information rights, revisit after the next milestone",
      `founder score ${score}/100`,
    );
    terms.checkUsd = adjust("checkUsd", terms.checkUsd, t.fund.checkSizeUsd.min, "option-sized check matches the option-sized conviction", `thesis floor $${t.fund.checkSizeUsd.min / 1e3}K`);
  }

  for (const c of contradictions) {
    terms.conditionsPrecedent.push(adjust(
      "conditionsPrecedent", "—", `resolve before closing: ${c}`,
      "contradictions are never priced in silently — each becomes an explicit condition precedent the founder must clear",
      c,
    ));
  }
  if (contradictions.length) {
    terms.closingDays = adjust("closingDays", terms.closingDays, terms.closingDays + 7, "conditions precedent need verification time — rushing a contradicted close is how funds buy lawsuits", `${contradictions.length} contradiction(s)`);
  }

  if (gaps.length > t.fund.maxOpenGaps) {
    terms.informationRights = adjust(
      "informationRights", terms.informationRights, "enhanced: monthly reporting + data-room access until all gaps close",
      `open evidence gaps (${gaps.length}) exceed the thesis tolerance (${t.fund.maxOpenGaps}) — the deal can proceed, but blind is not an option`,
      gaps.join("; "),
    );
  }

  if ((analysis.trustScore ?? 0) >= 80 && !contradictions.length) {
    terms.closingDays = adjust(
      "closingDays", terms.closingDays, 5,
      "high-trust evidence base and founders who value speed: closing speed is the cheapest concession we own (thesis lever), so we spend it",
      `trust score ${analysis.trustScore}/100; levers: ${t.negotiation.levers.join(", ")}`,
    );
  }

  if (analysis.axisCappedBy) {
    terms.boardRights = adjust(
      "boardRights", terms.boardRights, "board observer seat",
      `the founder axis is capped by a below-floor sub-score (${analysis.axisCappedBy}) — an observer seat adds support and early warning without taking control`,
      `thesis floor rule on ${analysis.axisCappedBy}`,
    );
  }

  for (const f of analysis.softFlags ?? []) {
    if (/series a/i.test(f)) {
      terms.followOnFraming = adjust("followOnFraming", terms.followOnFraming, true, "already at Series A — beyond preferred entry, so the check is framed as strategic follow-on, not a lead", f);
    }
  }

  const summary = `$${terms.checkUsd / 1e3}K ${terms.instrument} at $${terms.valuationCapM}M cap` +
    `${terms.proRata ? ", pro-rata" : ""}${terms.tranches ? ", 50/50 tranched on verification" : ""}` +
    `${terms.conditionsPrecedent.length ? `, ${terms.conditionsPrecedent.length} condition(s) precedent` : ""}, closing in ${terms.closingDays} days`;

  return {
    status: "draft",
    company: analysis.company,
    summary,
    terms,
    base,
    envelope: env,
    adjustments,
    requiresHumanApproval: true,
    basis: "terms derived deterministically from the thesis + team analysis; every adjustment lists its evidence; human investor and counsel must approve before anything goes founder-facing",
  };
}

/** Deterministic markdown with stable TS-§n anchors for PDF annotation. */
export function renderTermSheet(result) {
  if (result.status === "blocked") {
    return `# Term sheet — ${result.company}\n\n**BLOCKED — no ZOPA.** ${result.adjustments[0].because}\n(${result.adjustments[0].evidence})\n`;
  }
  const { terms, base, adjustments } = result;
  const row = (id, label, value, baseValue) =>
    `| TS-§${id} | ${label} | ${value} |${String(value) !== String(baseValue) ? " ⬅ adapted |" : " |"}`;
  return `# Term sheet (draft) — ${result.company}

> ${result.summary}
> Status: **${result.status}** — human approval required. ${result.basis}

| § | Term | Value | |
|---|---|---|---|
${row(1, "Instrument", terms.instrument, base.instrument)}
${row(2, "Investment", `$${terms.checkUsd / 1e3}K`, `$${base.checkUsd / 1e3}K`)}
${row(3, "Valuation cap", `$${terms.valuationCapM}M post-money`, `$${base.valuationCapM}M post-money`)}
${row(4, "Discount", `${terms.discountPct}%`, `${base.discountPct}%`)}
${row(5, "Pro-rata rights", terms.proRata ? "yes" : "no", base.proRata ? "yes" : "no")}
${row(6, "Board rights", terms.boardRights, base.boardRights)}
${row(7, "Information rights", terms.informationRights, base.informationRights)}
${row(8, "Closing timeline", `${terms.closingDays} days`, `${base.closingDays} days`)}
${row(9, "Tranches", terms.tranches ? `${terms.tranches.atSigning * 100}% signing / ${terms.tranches.onMilestone * 100}% on ${terms.tranches.milestone}` : "none", "none")}
${row(10, "Conditions precedent", terms.conditionsPrecedent.length ? terms.conditionsPrecedent.join("; ") : "none", "none")}
${row(11, "Framing", terms.followOnFraming ? "strategic follow-on (not lead)" : "lead first check", "lead first check")}

## What the analysis did to the terms

${adjustments.length ? adjustments.map((a, i) => `${i + 1}. **${a.term}**: ${JSON.stringify(a.from)} → ${JSON.stringify(a.to)}\n   *Why:* ${a.because}\n   *Evidence:* ${a.evidence}`).join("\n") : "No adjustments — the base thesis terms stand."}

## Negotiation envelope

Investor $${result.envelope.investor.range[0]}–${result.envelope.investor.range[1]}M (target $${result.envelope.investor.target}M) · founder $${result.envelope.founder.range[0]}–${result.envelope.founder.range[1]}M · ZOPA $${result.envelope.zopa[0]}–${result.envelope.zopa[1]}M.
`;
}
