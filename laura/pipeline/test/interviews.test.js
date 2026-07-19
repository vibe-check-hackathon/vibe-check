// Interview-pipeline tests — zero-dep node:test.
// Run: node --test laura/pipeline/test/

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  checkSourcePolicy, parseSRT, parseVTT, parseTXT, parseTranscriptFile,
  normalizeTranscript, resetIds,
} from "../lib/transcript.js";
import {
  extractClaimsRule, detectContradictions, validateExtraction, creditCaps, resetClaimIds, CATEGORIES,
} from "../lib/interview-extract.js";
import { corroborate, resetEvidenceIds } from "../lib/corroborate.js";
import { scoreFeatures, founderScore } from "../lib/founder-score.js";
import { renderInterviewCard, enrichmentSection, segmentRef } from "../lib/interview-card.js";
import { loadThesis } from "../lib/thesis.js";

const here = dirname(fileURLToPath(import.meta.url));
const SAMPLE = join(here, "..", "sample");

function acmeTranscript() {
  resetIds();
  resetClaimIds();
  resetEvidenceIds();
  const { segments } = parseTranscriptFile(join(SAMPLE, "interview-acme.vtt"));
  const t = normalizeTranscript({
    title: "Acme Robotics founder interview",
    sourceUrl: null,
    policy: { access_status: "authorized_local_file", content_storage_status: "metadata_and_excerpt_only" },
    segments,
    speakerRoles: { Agent: "interviewer" },
  });
  t.retrieved_at = "2026-07-19T00:00:00.000Z"; // determinism for the golden file
  return t;
}

/* ---------- transcript parsing ---------- */

test("VTT parsing preserves timestamps and speakers", () => {
  const t = acmeTranscript();
  assert.equal(t.segments.length, 6);
  assert.equal(t.segments[1].start_seconds, 8.5);
  assert.equal(t.segments[1].end_seconds, 22);
  const ada = t.speakers.find((s) => s.display_name === "Ada Example");
  assert.ok(ada, "speaker preserved");
  assert.equal(ada.role, "founder");
  assert.equal(t.speakers.find((s) => s.display_name === "Agent").role, "interviewer");
  // speakers are never merged
  assert.equal(new Set(t.segments.map((s) => s.speaker_id)).size, 3);
});

test("SRT parsing preserves timestamps", () => {
  const srt = "1\n00:00:01,000 --> 00:00:04,500\nAda: We shipped the first version.\n";
  const segs = parseSRT(srt);
  assert.equal(segs[0].startSeconds, 1);
  assert.equal(segs[0].endSeconds, 4.5);
  assert.equal(segs[0].speaker, "Ada");
});

test("TXT parsing generates paragraph anchors", () => {
  const segs = parseTXT("First paragraph of the interview text.\n\nSecond paragraph with more words in it.");
  assert.equal(segs.length, 2);
  assert.equal(segs[1].paragraphIndex, 2);
  assert.equal(segs[1].sourceAnchor, "paragraph 2");
});

test("unsupported file types are rejected", () => {
  assert.throws(() => parseTranscriptFile("interview.docx"), /unsupported transcript type/);
});

/* ---------- source policy ---------- */

test("source policy blocks invalid URLs, private hosts, hosted media", async () => {
  assert.equal((await checkSourcePolicy({ url: "not a url" })).access_status, "blocked");
  assert.equal((await checkSourcePolicy({ url: "http://127.0.0.1/x" })).access_status, "blocked");
  assert.equal((await checkSourcePolicy({ url: "https://youtube.com/watch?v=x" })).access_status, "blocked");
  assert.equal((await checkSourcePolicy({ url: "ftp://example.com/x" })).access_status, "blocked");
});

test("local files are authorized_local_file; unknown extensions blocked", async () => {
  const ok = await checkSourcePolicy({ file: join(SAMPLE, "interview-acme.vtt") });
  assert.equal(ok.access_status, "authorized_local_file");
  const bad = await checkSourcePolicy({ file: join(SAMPLE, "nope.exe") });
  assert.equal(bad.access_status, "blocked");
});

/* ---------- extraction, states, contradictions ---------- */

test("claims always reference transcript segments and label self-report", () => {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t);
  assert.ok(claims.length >= 3);
  for (const c of claims) {
    assert.ok(c.evidence_segment_ids.length, "claim without segment refs");
    assert.ok(CATEGORIES.includes(c.category));
  }
  const founderClaim = claims.find((c) => t.speakers.find((s) => s.speaker_id === c.speaker_id)?.role === "founder");
  assert.equal(founderClaim.source_state, "self_reported");
});

test("contradictions are retained, reduce confidence, and raise a question", () => {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t);
  const contradictions = detectContradictions(claims);
  assert.ok(contradictions.length >= 1, "ARR 120k vs 80k must be caught");
  const flagged = claims.filter((c) => c.verification_state === "contradicted");
  assert.ok(flagged.length >= 2);
  assert.ok(flagged.every((c) => c.confidence <= 0.4));
  assert.ok(contradictions[0].diligence_question.length > 10);
});

test("LLM output validation rejects bad categories, segments, confidence", () => {
  const t = acmeTranscript();
  const out = validateExtraction(
    {
      claims: [
        { category: "astrology", claim_text: "x", evidence_segment_ids: ["SEG-0001"], confidence: 0.5, source_state: "self_reported" },
        { category: "revenue", claim_text: "no segments", evidence_segment_ids: ["SEG-9999"], confidence: 0.5, source_state: "self_reported" },
        { category: "revenue", claim_text: "bad conf", evidence_segment_ids: ["SEG-0001"], confidence: 7, source_state: "self_reported" },
        { category: "revenue", claim_text: "good", evidence_segment_ids: ["SEG-0001"], confidence: 0.7, source_state: "self_reported", speaker_id: "SPK-002" },
      ],
    },
    t,
  );
  assert.equal(out.claims.length, 1);
  assert.equal(out.errors.length, 3);
});

test("evidence-state caps come from thesis config", () => {
  const caps = creditCaps(loadThesis());
  assert.equal(caps.self_reported, 0.65);
  assert.equal(caps.contradicted, 0);
  assert.equal(caps.independent_verified, 1);
});

/* ---------- corroboration against the seed+speed portfolio ---------- */

test("seed-speed portfolio corroborates funding and contradicts wrong founding year", () => {
  resetEvidenceIds();
  const claims = [
    { claim_id: "CLM-001", subject_type: "company", predicate: "founded_year", value: 2015, category: "company_formation", claim_text: "founded in 2015", speaker_id: "SPK-001", evidence_segment_ids: ["SEG-0001"], source_state: "self_reported", verification_state: "unverified", confidence: 0.8, materiality: "high", requires_corroboration: true },
    { claim_id: "CLM-002", subject_type: "company", predicate: "raised_round", value: 63e6, category: "fundraising", claim_text: "raised a 63M round", speaker_id: "SPK-001", evidence_segment_ids: ["SEG-0001"], source_state: "self_reported", verification_state: "unverified", confidence: 0.8, materiality: "high", requires_corroboration: true },
  ];
  const out = corroborate(claims, { company: "Prewave" }); // founded 2017 in the doc
  assert.ok(out.sourcesUsed.includes("seed-speed-portfolio-enriched"));
  const yearLink = out.links.find((l) => l.claim_id === "CLM-001");
  assert.equal(yearLink.final_verification_state, "contradicted");
  assert.ok(out.contradictions.length >= 1, "external contradiction retained");
  const fundLink = out.links.find((l) => l.claim_id === "CLM-002");
  assert.equal(fundLink.final_verification_state, "independent_verified");
  // interview evidence record is never overwritten — both records exist
  assert.ok(out.evidence.some((e) => e.kind === "interview" && e.claim_id === "CLM-002"));
  assert.ok(out.evidence.some((e) => e.kind === "independent" && e.claim_id === "CLM-002"));
});

test("unknown companies stay unknown — never negative", () => {
  resetEvidenceIds();
  const claims = [{ claim_id: "CLM-001", subject_type: "company", predicate: "raised_round", value: 1e6, category: "fundraising", claim_text: "raised 1M", speaker_id: "SPK-001", evidence_segment_ids: ["SEG-0001"], source_state: "self_reported", verification_state: "unverified", confidence: 0.8, materiality: "high", requires_corroboration: true }];
  const out = corroborate(claims, { company: "Company That Does Not Exist Anywhere" });
  assert.equal(out.links[0].final_verification_state, "self_reported");
  assert.equal(out.contradictions.length, 0);
});

/* ---------- founder score ---------- */

function scored(t, claims, contradictions = []) {
  resetEvidenceIds();
  const cor = corroborate(claims, { company: "Acme Robotics" });
  const features = scoreFeatures(claims, cor.links, loadThesis());
  return { features, score: founderScore({ features, transcript: t, links: cor.links, contradictions, thesis: loadThesis() }), links: cor.links, cor };
}

test("self-report is credit-capped; contradicted claims earn zero", () => {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t);
  const contradictions = detectContradictions(claims);
  const { features } = scored(t, claims, contradictions);
  for (const f of features) {
    if (f.source_state === "self_reported") assert.equal(f.evidence_credit_cap, 0.65);
    if (f.source_state === "contradicted") assert.equal(f.credited_value, 0);
    assert.ok(f.credited_value <= f.raw_value);
  }
});

test("score confidence is separate and stays low on pure self-report", () => {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t).filter((c) => c.verification_state !== "contradicted");
  const { score } = scored(t, claims, []);
  assert.ok(score.founder_score_confidence <= 70, "self-report only must keep confidence limited");
  assert.notEqual(score.founder_score, score.founder_score_confidence);
  assert.equal(score.scoring_version, "interview-score-v1");
});

test("contradictions reduce confidence, not just score", () => {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t);
  const clean = scored(t, claims.filter((c) => c.verification_state !== "contradicted"), []);
  const dirty = scored(t, claims, [{ type: "internal", claim_ids: [], detail: "x", diligence_question: "x" }]);
  assert.ok(dirty.score.founder_score_confidence < clean.score.founder_score_confidence);
});

/* ---------- deterministic rendering + golden file ---------- */

function goldenRecord() {
  const t = acmeTranscript();
  const claims = extractClaimsRule(t);
  for (const c of claims) c.created_at = "2026-07-19T00:00:00.000Z";
  const contradictions = detectContradictions(claims);
  const { features, score, cor } = scored(t, claims, contradictions);
  return {
    oppId: "OPP-MGV-INT-9999",
    intId: "INT-9999",
    company: "Acme Robotics",
    personName: "Ada Example",
    transcript: t,
    claims,
    links: cor.links,
    evidence: cor.evidence,
    contradictions,
    questions: [...cor.questions, ...contradictions.map((x) => x.diligence_question)],
    features,
    score,
    caps: creditCaps(loadThesis()),
    corroborationSources: cor.sourcesUsed,
    review: { state: "pending_review", notes: null },
    outreach: { state: "draft", text: "Hi Ada — your explanation of the second pilot going live in under two days stood out. Would you be open to a short conversation?" },
    createdAt: "2026-07-19T00:00:00.000Z",
    hypothesis: "Acme Robotics — discussed by Ada Example in the interview; company-formation confidence follows the evidence ledger.",
  };
}

test("card rendering is deterministic and matches the golden file", () => {
  const a = renderInterviewCard(goldenRecord());
  const b = renderInterviewCard(goldenRecord());
  assert.equal(a, b, "two renders of identical input must be byte-identical");
  const goldenPath = join(here, "fixtures", "golden-acme-interview-card.md");
  const golden = readFileSync(goldenPath, "utf8").replace(/\r\n/g, "\n");
  assert.equal(a.replace(/\r\n/g, "\n"), golden, "rendered card drifted from the golden fixture");
});

test("segment refs use timestamps when present, paragraphs otherwise", () => {
  const t = acmeTranscript();
  assert.match(segmentRef("INT-1", t, [t.segments[1].segment_id]), /\[INT-1, 00:00:08–00:00:22\]/);
  const p = normalizeTranscript({ title: "x", policy: {}, segments: parseTXT("A paragraph that is long enough to survive filtering easily.") });
  assert.match(segmentRef("INT-1", p, [p.segments[0].segment_id]), /\[INT-1, paragraph 1\]/);
});

test("enrichment section appends without destroying the original card", () => {
  const record = goldenRecord();
  const dir = mkdtempSync(join(tmpdir(), "vc-enrich-"));
  const card = join(dir, "OPP-TEST.md");
  writeFileSync(card, "# Existing card\n\nOriginal content stays.\n", "utf8");
  const section = enrichmentSection({ ...record, intId: "INT-9999" });
  writeFileSync(card, readFileSync(card, "utf8") + section, "utf8");
  const out = readFileSync(card, "utf8");
  assert.match(out, /Original content stays\./);
  assert.match(out, /Interview evidence — INT-9999/);
  assert.match(out, /\[INT-9999, 00:00:/);
});
