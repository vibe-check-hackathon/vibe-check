#!/usr/bin/env node
// Interview pipeline CLI — the vc-brain interview-ingestion flow, integrated
// with this repo's pipeline (thesis config, screening conventions, OPP-MGV
// cards, 24h LLM key store). Human review is mandatory before outreach.
//
//   node laura/pipeline/interviews.js ingest  --file sample/interview-x.vtt --company "X" [--title "..."] [--speaker "Name=founder"]
//   node laura/pipeline/interviews.js ingest  --url https://example.com/interview --company "X"
//   node laura/pipeline/interviews.js process --transcript TRN-xxxx [--person "Name"]
//   node laura/pipeline/interviews.js review  --interview INT-0001 --approve|--reject --ack [--notes "..."]
//   node laura/pipeline/interviews.js render  --interview INT-0001 [--enrich laura/opportunity-db/OPP-MGV-0002-deskbird.md]
//
// State lives in laura/pipeline/output/interviews/ (gitignored); rendered
// cards land in laura/opportunity-db/interviews/.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { checkSourcePolicy, parseTranscriptFile, fetchWrittenInterview, normalizeTranscript, AUDIO_EXTENSIONS } from "./lib/transcript.js";
import { transcribeRecording } from "./lib/transcribe.js";
import { extractClaimsRule, extractClaimsLLM, detectContradictions, creditCaps, resetClaimIds } from "./lib/interview-extract.js";
import { corroborate, resetEvidenceIds } from "./lib/corroborate.js";
import { scoreFeatures, founderScore, scoreVersionRecord } from "./lib/founder-score.js";
import { renderInterviewCard, enrichmentSection } from "./lib/interview-card.js";
import { loadThesis } from "./lib/thesis.js";

const here = dirname(fileURLToPath(import.meta.url));
const STORE = join(here, "output", "interviews");
const AUDIT = join(here, "output", "audit");
const CARDS = join(here, "..", "opportunity-db", "interviews");

const args = process.argv.slice(2);
const cmd = args.shift();
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
const opts = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

const save = (name, data) => {
  mkdirSync(STORE, { recursive: true });
  writeFileSync(join(STORE, `${name}.json`), JSON.stringify(data, null, 2), "utf8");
};
const load = (name) => JSON.parse(readFileSync(join(STORE, `${name}.json`), "utf8"));

/* ---------- ingest ---------- */

async function ingest() {
  const file = opt("file");
  const url = opt("url");
  if (!file && !url) throw new Error("ingest needs --file or --url");
  const policy = await checkSourcePolicy({ file, url });
  if (["blocked"].includes(policy.access_status)) {
    console.error(`✗ source blocked: ${policy.notes.join("; ")}`);
    process.exitCode = 2;
    return save("last-policy", policy);
  }
  if (policy.access_status === "manual_review") {
    console.error(`⚠ source needs manual review before processing: ${policy.notes.join("; ")}`);
    process.exitCode = 3;
    return save("last-policy", policy);
  }
  let parsed;
  let title = opt("title");
  if (file && AUDIO_EXTENSIONS.includes(file.slice(file.lastIndexOf(".")).toLowerCase())) {
    const { provider, segments } = await transcribeRecording(file);
    console.log(`transcribed via provider: ${provider}`);
    parsed = { segments };
    title ??= basename(file);
  } else if (file) {
    parsed = parseTranscriptFile(file);
    title ??= parsed.title ?? basename(file);
  } else {
    parsed = { segments: await fetchWrittenInterview(url), sourceUrl: url };
    title ??= url;
  }
  const speakerRoles = Object.fromEntries(opts("speaker").map((s) => s.split("=")));
  const transcript = normalizeTranscript({
    title,
    sourceUrl: parsed.sourceUrl ?? url ?? null,
    policy,
    segments: parsed.segments,
    speakerRoles,
  });
  transcript.company = opt("company") ?? null;
  save(transcript.transcript_id, transcript);
  console.log(`✓ ingested ${transcript.transcript_id} — ${transcript.segments.length} segments, ${transcript.speakers.length} speakers, hash ${transcript.content_hash.slice(0, 12)}…`);
  console.log(`  next: node laura/pipeline/interviews.js process --transcript ${transcript.transcript_id}`);
}

/* ---------- process (extract → corroborate → score → review record) ---------- */

async function processTranscript() {
  const trnId = opt("transcript");
  if (!trnId) throw new Error("process needs --transcript TRN-…");
  const transcript = load(trnId);
  const company = opt("company") ?? transcript.company;
  const thesis = loadThesis();
  resetClaimIds();
  resetEvidenceIds();

  const claims = extractClaimsRule(transcript, {});
  const llm = await extractClaimsLLM(transcript).catch((e) => (console.error(`LLM pass skipped: ${e.message}`), null));
  if (llm?.claims?.length) {
    const known = new Set(claims.map((c) => `${c.category}:${c.evidence_segment_ids[0]}`));
    for (const c of llm.claims) {
      if (!known.has(`${c.category}:${c.evidence_segment_ids[0]}`)) claims.push({ ...c, claim_id: `CLM-${String(claims.length + 1).padStart(3, "0")}` });
    }
  }
  const stamp = new Date().toISOString();
  for (const c of claims) c.created_at = stamp;

  const contradictions = detectContradictions(claims);
  const cor = corroborate(claims, { company });
  contradictions.push(...cor.contradictions);
  const features = scoreFeatures(claims, cor.links, thesis);
  const score = founderScore({ features, transcript, links: cor.links, contradictions, thesis });

  const seq = readdirSync(STORE).filter((n) => n.startsWith("INT-")).length + 1;
  const intId = `INT-${String(seq).padStart(4, "0")}`;
  const founder = transcript.speakers.find((s) => s.role === "founder");
  const detail = claims.find((c) => ["market_insight", "product_shipping", "customer_discovery"].includes(c.category));
  const record = {
    interview_id: intId,
    transcript_id: trnId,
    company,
    personName: opt("person") ?? founder?.display_name ?? null,
    claims,
    links: cor.links,
    evidence: cor.evidence,
    contradictions,
    questions: [...cor.questions, ...contradictions.map((x) => x.diligence_question)],
    features,
    score,
    scoreHistory: [scoreVersionRecord(null, score, features)],
    caps: creditCaps(thesis),
    corroborationSources: cor.sourcesUsed,
    llmMeta: llm?.meta ?? null,
    review: { state: contradictions.length ? "needs_corroboration" : "pending_review", notes: null, checklistAcknowledged: false },
    outreach: {
      state: "draft",
      text: `Hi ${(opt("person") ?? founder?.display_name ?? "there").split(" ")[0]} — your explanation of ${detail ? detail.claim_text.slice(0, 90) : "your work"} stood out. We are researching founders building in this area, and your work appears closely aligned. Would you be open to a short conversation about what you are building and where the hardest open questions remain?`,
    },
    created_at: stamp,
  };
  save(intId, record);
  console.log(`✓ processed ${intId}: ${claims.length} claims (${cor.links.filter((l) => l.final_verification_state === "independent_verified").length} independently verified), ${contradictions.length} contradiction(s)`);
  console.log(`  score ${score.founder_score}/100 · confidence ${score.founder_score_confidence}/100 · review: ${record.review.state}`);
  for (const q of record.questions) console.log(`  ? ${q}`);
  console.log(`  next: node laura/pipeline/interviews.js review --interview ${intId} --approve --ack`);
}

/* ---------- human-review gate ---------- */

const CHECKLIST = [
  "Is the speaker correctly identified?",
  "Are timestamps or paragraph anchors preserved?",
  "Are material claims linked to source segments?",
  "Are self-reported claims clearly labeled?",
  "Were material claims independently corroborated where possible?",
  "Are contradictions visible?",
  "Does the Founder Score use only permitted professional evidence?",
  "Is the outreach text non-surveillance-like?",
  "Has a human approved the final outbound message?",
];

function review() {
  const intId = opt("interview");
  const record = load(intId);
  if (!flag("approve") && !flag("reject")) {
    console.log(`review state: ${record.review.state}\n` + CHECKLIST.map((q) => `  - ${q}`).join("\n"));
    return;
  }
  if (flag("approve") && !flag("ack")) {
    throw new Error("approval requires --ack to confirm the review checklist was completed:\n" + CHECKLIST.map((q) => `  - ${q}`).join("\n"));
  }
  record.review = {
    state: flag("approve") ? "approved" : "rejected",
    notes: opt("notes") ?? null,
    checklistAcknowledged: flag("approve"),
    reviewedAt: new Date().toISOString(),
  };
  if (record.review.state === "approved") record.outreach.state = "approved";
  save(intId, record);
  console.log(`✓ ${intId} → ${record.review.state}`);
}

/* ---------- render (new card or enrichment) ---------- */

function render() {
  const intId = opt("interview");
  const record = load(intId);
  const transcript = load(record.transcript_id);
  const enrich = opt("enrich");
  const payload = { ...record, intId, transcript, oppId: null, createdAt: record.created_at, company: record.company ?? "Unknown company" };

  if (enrich) {
    // Enrichment: previous version preserved for audit, section appended.
    mkdirSync(AUDIT, { recursive: true });
    copyFileSync(enrich, join(AUDIT, `${basename(enrich)}.${Date.now()}.prev`));
    writeFileSync(enrich, readFileSync(enrich, "utf8").trimEnd() + "\n" + enrichmentSection(payload), "utf8");
    console.log(`✓ enriched ${enrich} (previous version in output/audit/)`);
    return;
  }
  mkdirSync(CARDS, { recursive: true });
  const seq = readdirSync(CARDS).filter((n) => n.startsWith("OPP-MGV-INT-")).length + 1;
  const slug = (record.company ?? "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const oppId = `OPP-MGV-INT-${String(seq).padStart(4, "0")}`;
  payload.oppId = oppId;
  payload.hypothesis = record.company
    ? `${record.company} — discussed by ${payload.personName ?? "the founder"} in the interview; company-formation confidence follows the evidence ledger, not the conversation alone.`
    : "No confirmed company: a person discussing an idea is a candidate founder record, not a company.";
  const path = join(CARDS, `${oppId}-${slug}.md`);
  writeFileSync(path, renderInterviewCard(payload), "utf8");
  console.log(`✓ rendered ${path} (review: ${record.review.state}; outreach: ${record.outreach.state})`);
}

/* ---------- dispatch ---------- */

try {
  if (cmd === "ingest") await ingest();
  else if (cmd === "process") await processTranscript();
  else if (cmd === "review") review();
  else if (cmd === "render") render();
  else {
    console.log("commands: ingest --file|--url … · process --transcript … · review --interview … · render --interview … [--enrich card.md]");
    process.exitCode = 1;
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exitCode = 1;
}
