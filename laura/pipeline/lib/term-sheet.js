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

/** Deterministic markdown following Martin's template
 *  (Martin/firstcheck-maschmeyer-termsheet-template.md, §1–19): standard seed
 *  terms verbatim, negotiated fields filled by this engine per his §14 —
 *  agreed value + rationale + link to the analysis event. */
export function renderTermSheet(result) {
  if (result.status === "blocked") {
    return `# Term sheet — ${result.company}\n\n**WITHHELD — no ZOPA.** ${result.adjustments[0].because}\n(${result.adjustments[0].evidence})\n`;
  }
  const { terms: t, adjustments } = result;
  const negotiated = adjustments
    .map((a, i) => `| N${i + 1} | ${a.term} | ${typeof a.to === "object" ? "50% closing / 50% verification" : String(a.to)} | ${a.because} | ${a.evidence} |`)
    .join("\n");
  return `# ${result.company} / Maschmeyer Group — Seed Term Sheet
*Per the FirstCheck template (firstcheck-maschmeyer-termsheet-template.md). Non-binding demo document — counsel review required.*

> ${result.summary}

## 1. Parties
- **Company:** ${result.company}. **Investor:** Maschmeyer Group, investing via **FirstCheck**.

## 2. Financing overview
- **Security:** ${t.instrument}. **Investment amount:** **$${(t.checkUsd / 1e3).toFixed(0)}K**${t.tranches ? ` — ${t.tranches.atSigning * 100}% at closing, ${t.tranches.onMilestone * 100}% upon ${t.tranches.milestone}` : " in a single tranche"}.
${t.followOnFraming ? "- **Framing:** strategic follow-on participation, not a lead." : "- **Framing:** first check; Investor may be identified as lead."}

## 3. Valuation and ownership
- **Valuation cap:** **$${t.valuationCapM}M post-money**${t.discountPct ? `, discount ${t.discountPct}%` : ", no discount"}.
> Valuation is set by FirstCheck using a standard method that considers the target market, competitive landscape, business model, traction to date, and founder profile, rather than only a headline number.

## 4. Liquidation preference
- 1x non-participating preferred; on liquidation the greater of return of investment or pro-rata as-converted.

## 5. Dividends
- Non-cumulative, if and when declared by the Board, pari passu with other preferred.

## 6. Conversion
- Automatic on qualified IPO or preferred-majority approval; 1:1 ratio, standard anti-dilution adjustments.

## 7. Pro rata rights *(negotiated by agent)*
- ${t.proRata ? "Investor has the right, but not the obligation, to participate in future priced equity financings to maintain fully-diluted ownership; customary exceptions apply; right non-transferable." : "Waived for this financing."}

## 8. Drag-along rights *(negotiated by agent)*
- Standard drag with Board + preferred-majority + common-majority triggers; founder protections and price floors per shareholders agreement.

## 9. Anti-dilution
- Broad-based weighted average for down rounds; standard exclusions.

## 10. Information rights
- ${t.informationRights}.

## 11. Board and governance
- **Board at seed:** 2 founder seats, no investor seat. **Observer:** ${t.boardRights === "none" ? "none at this stage" : t.boardRights}.
- Reserved matters per template (senior issuances, share-capital changes, redemptions, sale/merger, board size).

## 12. Founder vesting
- Reverse vesting, 4 years / 1-year cliff; specifics in definitive documents.

## 13. Transfer restrictions; tag-along / ROFR
- ROFR for Company/Investor on founder transfers; investor tag-along per shareholders agreement.

## 14. Negotiated fields (filled by the FirstCheck negotiation agent)
| # | Field | Agreed value | Rationale | Analysis event / evidence |
|---|---|---|---|---|
${negotiated || "| — | — | thesis base terms | no adjustments triggered | — |"}

## 15. Conditions to closing
${t.conditionsPrecedent.length ? t.conditionsPrecedent.map((c) => `- ${c}`).join("\n") : "- Completion of satisfactory confirmatory due diligence."}
- Definitive documents; regulatory/third-party approvals if applicable.

## 16. Exclusivity and confidentiality
- **Exclusivity:** ${t.closingDays} days from signing. **Confidentiality:** terms confidential, standard exceptions. *(Binding sections.)*

## 17. Expenses
- Company covers reasonable Investor legal costs up to €30,000, subject to agreement.

## 18. Binding / non-binding
- Commercial terms non-binding; confidentiality, exclusivity, governing law and expenses binding once signed.

## 19. Governing law
- Delaware / as agreed in definitive documents.

---
**Envelope:** investor $${result.envelope.investor.range[0]}–${result.envelope.investor.range[1]}M (target $${result.envelope.investor.target}M) · founder $${result.envelope.founder.range[0]}–${result.envelope.founder.range[1]}M · ZOPA $${result.envelope.zopa[0]}–${result.envelope.zopa[1]}M. Human approval required.
`;
}

/** Lawyer-grade prose per Martin/firstcheck-maschmeyer-termsheet-template.md:
 *  his clause skeleton, our adaptive values, NYC-counsel drafting style.
 *  Non-binding demo language is stated in the instrument itself. */
export function renderLegalTermSheet(result, { founders = [], jurisdiction = "Delaware" } = {}) {
  const t = result.terms;
  if (!t) return `TERM SHEET WITHHELD — ${result.adjustments[0].because}`;
  const list = founders.map((f) => `${f.name}${f.role ? ` (${f.role})` : ""}`).join(", ");
  const cp = t.conditionsPrecedent.length
    ? t.conditionsPrecedent.map((c, i) => `    (${String.fromCharCode(97 + i)}) ${c};`).join("\n")
    : "    (a) completion of customary confirmatory due diligence;";
  const tranche = t.tranches
    ? `The Investment shall be funded in two tranches: ${t.tranches.atSigning * 100}% at Closing and ${t.tranches.onMilestone * 100}% upon ${t.tranches.milestone}, as certified by the Investor acting reasonably.`
    : `The Investment shall be funded in a single tranche at Closing.`;
  return `MEMORANDUM OF TERMS
${result.company.toUpperCase()} — PROPOSED ${t.instrument.toUpperCase()} FINANCING

This memorandum summarizes the principal terms on which Maschmeyer Group, investing through FirstCheck (the "Investor"), proposes to invest in ${result.company}, a ${jurisdiction} corporation (the "Company"). Except for the sections titled "Confidentiality" and "Exclusivity," this memorandum is NON-BINDING, is for discussion purposes only, does not constitute legal advice, and any obligation shall arise only under definitive agreements approved by each party's counsel. Prepared in the style of New York counsel for demonstration purposes.

1. PARTIES. The Company; the Investor; and the founders of the Company, being ${list || "the persons identified on Schedule A"} (each a "Founder" and collectively the "Founders").

2. THE INVESTMENT. Subject to Section 8, the Investor shall purchase a ${t.instrument} in the principal amount of US$${(t.checkUsd / 1e3).toFixed(0)},000 (the "Investment"). ${tranche}

3. VALUATION. The valuation cap under the ${t.instrument} shall be US$${t.valuationCapM},000,000 on a post-money basis${t.discountPct ? `, with a discount of ${t.discountPct}%` : ", with no discount"}. The parties acknowledge the cap was determined from the Investor's evidence-based assessment of market, traction, and team, and not from a headline number alone.

4. PRO RATA RIGHTS. ${t.proRata ? "The Investor shall have the right, but not the obligation, to participate in subsequent priced equity financings of the Company so as to maintain its fully-diluted ownership percentage, subject to customary exceptions." : "The Investor waives participation rights in subsequent financings."}

5. GOVERNANCE; INFORMATION. Board rights: ${t.boardRights === "none" ? "the Investor shall receive no board seat and no observer seat at this stage" : `the Investor shall be entitled to a ${t.boardRights}`}. Information rights: the Company shall provide ${t.informationRights}, together with such other information as the Investor may reasonably request.

6. FRAMING. ${t.followOnFraming ? "The Investment is made as a strategic follow-on participation and shall not be construed as the Investor leading or pricing the round." : "The Investment constitutes the Investor's first check and the Investor may be identified as such."}

7. LIQUIDATION; CONVERSION; ANTI-DILUTION. As per the FirstCheck standard template: 1x non-participating preference economics upon conversion to preferred; automatic conversion upon a qualified financing or IPO at a 1:1 ratio; broad-based weighted-average anti-dilution with standard exclusions.

8. CONDITIONS PRECEDENT. The obligation of the Investor to fund is subject to:
${cp}
    and (z) approval by the Investor's investment committee and completion of definitive documentation.

9. CLOSING. The parties shall target a Closing within ${t.closingDays} calendar days of the date hereof, time being of the essence with respect to the exclusivity period only.

10. CONFIDENTIALITY; EXCLUSIVITY (BINDING). The existence and terms of this memorandum are confidential. For ${t.closingDays} days from the date hereof, the Company and the Founders shall not solicit or entertain competing proposals for the financing contemplated hereby.

11. NO RELIANCE. Each Founder acknowledges the analytical basis of these terms has been disclosed (see the accompanying adjustment schedule), and that no personality assessment or protected characteristic formed part of that basis.

ADJUSTMENT SCHEDULE (analytical basis disclosed to the Founders):
${result.adjustments.map((a, i) => `${i + 1}. ${a.term}: ${JSON.stringify(a.from)} -> ${JSON.stringify(a.to)} — ${a.because} [basis: ${a.evidence}]`).join("\n") || "None — thesis base terms apply."}

AGREED AS TO THE BINDING SECTIONS ONLY:

  Maschmeyer Group / FirstCheck: ______________________  Date: __________
${founders.map((f) => `  ${f.name}${f.role ? `, ${f.role}` : ""}: ______________________  Date: __________`).join("\n")}
`;
}
