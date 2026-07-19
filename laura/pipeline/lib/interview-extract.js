// Stage 4-5 of the interview pipeline: structured claim extraction and
// evidence-state classification. Deterministic rule layer always runs (works
// offline); an LLM pass refines it when a key is set — its output is strictly
// validated (categories, segment ids, confidence) and can never assign the
// Founder Score itself. Evidence-state credit caps live in thesis.json
// (interviewScore.evidenceCreditCaps), not in code.

import { createHash } from "node:crypto";
import { complete, loadConfig } from "./llm.js";

export const PROMPT_VERSION = "interview-extract-v1";

export const CATEGORIES = [
  "founder_history", "prior_company", "prior_exit", "product_shipping",
  "technical_execution", "domain_expertise", "customer_discovery",
  "customer_traction", "revenue", "fundraising", "market_insight",
  "team_formation", "prior_collaboration", "pivot", "failure_or_setback",
  "response_to_adversity", "research", "open_source", "patent_or_ip",
  "hiring", "geography", "company_formation", "investment_readiness",
  "risk", "contradiction", "open_question",
];

export const EVIDENCE_STATES = [
  "independent_verified", "first_party_documented", "self_reported",
  "inferred", "contradicted", "unsupported", "unknown",
];

export function creditCaps(thesis) {
  return (
    thesis.raw?.interviewScore?.evidenceCreditCaps ??
    thesis.interviewScore?.evidenceCreditCaps ?? {
      independent_verified: 1, first_party_documented: 0.85, self_reported: 0.65,
      inferred: 0.35, contradicted: 0, unsupported: 0, unknown: 0,
    }
  );
}

/* ---------- deterministic rule layer ---------- */

const MATERIAL = new Set(["fundraising", "revenue", "customer_traction", "prior_exit", "company_formation", "customer_discovery"]);

const RULES = [
  { category: "customer_discovery", rx: /(\d{2,4})\+?\s*(customer|operator|user|buyer)?\s*(interview|conversation)s?/i, predicate: "completed_customer_interviews", value: (m) => Number(m[1]), unit: "interviews" },
  { category: "fundraising", rx: /(raised|closed|secured)\s+(?:a\s+)?[$€£]?\s?([\d.]+)\s*(m|million|k)\b/i, predicate: "raised_round", value: (m) => Number(m[2]) * (/k/i.test(m[3]) ? 1e3 : 1e6), unit: "usd_equivalent" },
  { category: "revenue", rx: /[$€£]\s?([\d.]+)\s*(k|m)?\s*(arr|mrr|revenue|contracted)/i, predicate: "reported_revenue", value: (m) => Number(m[1]) * (/m/i.test(m[2] ?? "") ? 1e6 : 1e3), unit: "usd_equivalent" },
  { category: "prior_collaboration", rx: /(worked together|co[- ]?founded before|colleagues at|both (?:had )?worked at|met at)\s*([\w .&-]{0,40})/i, predicate: "prior_collaboration", value: null },
  { category: "prior_company", rx: /\b(?:previously|formerly|before(?: that)?|ex-)\s*(?:at|with|founded)?\s+([A-Z][\w&.-]{2,30})/, predicate: "prior_company", value: (m) => m[1] },
  { category: "prior_exit", rx: /(acquired by|sold (?:the|our|his|her) (?:company|business)|exit(?:ed)? to)\s*([A-Z][\w&.-]{0,30})?/i, predicate: "prior_exit", value: (m) => m[2] ?? null },
  { category: "pivot", rx: /pivot(?:ed)?|changed from b2[bc] to b2[bc]|changed (?:the )?(?:model|direction)|started as a|initial concept as/i, predicate: "pivot", value: null },
  { category: "product_shipping", rx: /(launched|shipped|went live|in production|deployed|first version|current product|customers? use|employees use)/i, predicate: "shipped_product", value: null },
  { category: "failure_or_setback", rx: /almost bankrupt|nearly died|near[- ]death|almost ran out/i, predicate: "setback_survived", value: null },
  { category: "team_formation", rx: /co[- ]?founder of|selecting the right co[- ]?founders|founding team/i, predicate: "team_formation", value: null },
  { category: "customer_traction", rx: /(\d{2,6})\+?\s*(paying customers|companies use|clients|installs|rooms|deployments)/i, predicate: "customer_count", value: (m) => Number(m[1]), unit: "customers" },
  { category: "company_formation", rx: /founded (?:in |the company in )?(\d{4})/i, predicate: "founded_year", value: (m) => Number(m[1]), unit: "year" },
  { category: "market_insight", rx: /(insight|realized|the bet was|we believed|would (?:persist|be long-lasting))/i, predicate: "market_insight", value: null },
  { category: "failure_or_setback", rx: /(failed|didn't work|setback|almost died|ran out of|stalled)/i, predicate: "setback", value: null },
  { category: "technical_execution", rx: /(built (?:the|our|it) (?:ourselves|in-house|from scratch)|rewrote|architecture|open[- ]sourced)/i, predicate: "technical_execution", value: null },
  { category: "hiring", rx: /(hired|team of (\d+)|grew the team)/i, predicate: "team_size_signal", value: (m) => (m[2] ? Number(m[2]) : null) },
];

let clmSeq = 0;
const clmId = () => `CLM-${String(++clmSeq).padStart(3, "0")}`;
export function resetClaimIds() {
  clmSeq = 0;
}

export function extractClaimsRule(transcript, { subjectId = null } = {}) {
  const claims = [];
  const founderSpeakers = new Set(transcript.speakers.filter((s) => s.role === "founder").map((s) => s.speaker_id));
  for (const seg of transcript.segments) {
    for (const rule of RULES) {
      const m = seg.text.match(rule.rx);
      if (!m) continue;
      const fromFounder = founderSpeakers.has(seg.speaker_id);
      claims.push({
        claim_id: clmId(),
        subject_type: ["prior_company", "prior_exit", "prior_collaboration", "founder_history"].includes(rule.category) ? "person" : "company",
        subject_id: subjectId,
        predicate: rule.predicate,
        value: rule.value ? rule.value(m) : null,
        unit: rule.unit ?? null,
        category: rule.category,
        claim_text: seg.text.length > 220 ? seg.text.slice(0, 217) + "…" : seg.text,
        speaker_id: seg.speaker_id,
        evidence_segment_ids: [seg.segment_id],
        // A founder talking about themself is self-report; an interviewer's
        // framing is only inferred until someone owns it.
        source_state: fromFounder ? "self_reported" : "inferred",
        verification_state: "unverified",
        confidence: Math.min(0.85, (seg.confidence ?? 0.9) * (fromFounder ? 0.85 : 0.6)),
        materiality: MATERIAL.has(rule.category) ? "high" : "medium",
        requires_corroboration: MATERIAL.has(rule.category),
        alternative_explanations: [],
        created_at: null, // stamped by the store, keeps extraction deterministic
      });
      break; // one claim per segment per pass keeps the ledger readable
    }
  }
  return claims;
}

/* ---------- claim-level contradiction detection ---------- */

export function detectContradictions(claims) {
  const contradictions = [];
  const byPredicate = new Map();
  for (const c of claims) {
    const key = `${c.subject_type}:${c.predicate}`;
    if (!byPredicate.has(key)) byPredicate.set(key, []);
    byPredicate.get(key).push(c);
  }
  for (const group of byPredicate.values()) {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const a = group[i];
        const b = group[j];
        const bothValued = a.value != null && b.value != null;
        const differs = bothValued && String(a.value) !== String(b.value);
        const differentSpeakers = a.speaker_id !== b.speaker_id;
        if (differs) {
          contradictions.push({
            type: "internal",
            claim_ids: [a.claim_id, b.claim_id],
            detail: `${a.predicate}: ${a.value} vs ${b.value}${differentSpeakers ? " (different speakers)" : ""}`,
            diligence_question: `Reconcile ${a.predicate}: interview states both ${a.value} and ${b.value}.`,
          });
          a.verification_state = "contradicted";
          b.verification_state = "contradicted";
          a.confidence = Math.min(a.confidence, 0.4);
          b.confidence = Math.min(b.confidence, 0.4);
        }
      }
    }
  }
  return contradictions;
}

/* ---------- validated LLM refinement (optional, never scores) ---------- */

export function validateExtraction(out, transcript) {
  const segmentIds = new Set(transcript.segments.map((s) => s.segment_id));
  const errors = [];
  const claims = [];
  for (const c of out.claims ?? []) {
    if (!CATEGORIES.includes(c.category)) { errors.push(`unknown category ${c.category}`); continue; }
    const segs = (c.evidence_segment_ids ?? []).filter((id) => segmentIds.has(id));
    if (!segs.length) { errors.push(`claim without valid segment ids (${c.claim_text?.slice(0, 40) ?? "?"})`); continue; }
    const conf = Number(c.confidence);
    if (!(conf >= 0 && conf <= 1)) { errors.push(`invalid confidence ${c.confidence}`); continue; }
    if (!EVIDENCE_STATES.includes(c.source_state)) { errors.push(`invalid source_state ${c.source_state}`); continue; }
    claims.push({ ...c, evidence_segment_ids: segs, verification_state: "unverified" });
  }
  return { claims, open_questions: (out.open_questions ?? []).filter((q) => typeof q === "string"), errors };
}

export async function extractClaimsLLM(transcript) {
  if (!loadConfig()) return null; // rule layer stands alone offline
  const prompt =
    `Extract professionally relevant founder/company claims from this interview transcript. ` +
    `Answer ONLY JSON: {"claims":[{"category":one of ${JSON.stringify(CATEGORIES)},"predicate":"snake_case","value":null|number|string,` +
    `"claim_text":"...","speaker_id":"SPK-...","evidence_segment_ids":["SEG-..."],"source_state":"self_reported|inferred",` +
    `"confidence":0..1,"materiality":"high|medium|low","requires_corroboration":bool}],"open_questions":["..."]}. ` +
    `Rules: every claim MUST cite existing segment ids; founder self-statements are self_reported; never invent segments, ` +
    `never score the founder, never include protected characteristics.\n\nTRANSCRIPT:\n` +
    JSON.stringify({ speakers: transcript.speakers, segments: transcript.segments });
  const text = await complete({ system: `Structured extraction, prompt ${PROMPT_VERSION}. JSON only.`, prompt, maxTokens: 2000 });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  const validated = validateExtraction(JSON.parse(match[0]), transcript);
  validated.meta = {
    model: loadConfig()?.model ?? "unknown",
    prompt_version: PROMPT_VERSION,
    extracted_at: new Date().toISOString(),
    response_hash: createHash("sha256").update(text).digest("hex").slice(0, 16),
  };
  return validated;
}
