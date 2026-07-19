// Interview ingestion, stage 1-3 of the vc-brain interview pipeline:
// source-policy gate → retrieval/parsing → normalized timestamped transcript.
// Zero-dep (node:crypto for hashing, global fetch). Conventions follow the
// repo's evidence discipline: provenance always kept, speakers never merged,
// timestamps never discarded, content hashed for later refresh + diff.

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { extname, basename } from "node:path";

export const TEXT_EXTENSIONS = [".txt", ".md", ".srt", ".vtt", ".json"];
export const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".mp4", ".webm"];
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FETCH_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let seq = 0;
const id = (prefix) => `${prefix}-${String(++seq).padStart(4, "0")}`;
/** Tests need deterministic ids per run. */
export function resetIds() {
  seq = 0;
}

/* ---------- 1. source-policy gate ---------- */

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1)/i;

/** Policy decision BEFORE any retrieval. Blocked/uncertain never proceeds. */
export async function checkSourcePolicy({ url, file, userSupplied = false }) {
  const result = {
    source_url: url ?? (file ? `file://${basename(file)}` : null),
    source_type: file ? (AUDIO_EXTENSIONS.includes(extname(file).toLowerCase()) ? "authorized_recording" : "local_transcript") : "written_interview",
    access_status: "manual_review",
    robots_checked: false,
    terms_review_status: "not_required",
    commercial_use_status: "review",
    content_storage_status: "metadata_and_excerpt_only",
    checked_at: new Date().toISOString(),
    notes: [],
  };
  if (file) {
    const ext = extname(file).toLowerCase();
    if (![...TEXT_EXTENSIONS, ...AUDIO_EXTENSIONS].includes(ext)) {
      result.access_status = "blocked";
      result.notes.push(`unsupported file type ${ext}`);
      return result;
    }
    try {
      if (statSync(file).size > MAX_FILE_BYTES) {
        result.access_status = "blocked";
        result.notes.push("file exceeds size limit");
        return result;
      }
    } catch {
      result.access_status = "blocked";
      result.notes.push("file not readable");
      return result;
    }
    result.access_status = "authorized_local_file";
    result.notes.push("local file supplied by an authorized user; no hosted-media downloading");
    return result;
  }
  if (userSupplied) {
    result.access_status = "user_supplied";
    result.notes.push("content pasted/supplied by the user; canonical URL kept for provenance");
    return result;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    result.access_status = "blocked";
    result.notes.push("invalid URL");
    return result;
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    result.access_status = "blocked";
    result.notes.push("only http(s) sources are permitted");
    return result;
  }
  if (PRIVATE_HOST.test(parsed.hostname)) {
    result.access_status = "blocked";
    result.notes.push("private/loopback hosts are refused (SSRF protection)");
    return result;
  }
  if (/youtube\.com|youtu\.be|spotify\.com|vimeo\.com/i.test(parsed.hostname)) {
    result.access_status = "blocked";
    result.notes.push("hosted-media platforms: supply an authorized local file, a transcript, or a rights-holder caption file instead");
    return result;
  }
  // robots.txt: a blanket Disallow for * on our path means manual review.
  try {
    const robots = await fetchCapped(`${parsed.origin}/robots.txt`, 4000);
    result.robots_checked = true;
    if (robotsDisallows(robots, parsed.pathname)) {
      result.access_status = "manual_review";
      result.notes.push("robots.txt disallows this path — human must confirm permitted access");
      return result;
    }
  } catch {
    result.notes.push("robots.txt not reachable — proceeding as public page, storage limited to metadata+excerpts");
  }
  result.access_status = "allowed";
  return result;
}

function robotsDisallows(robotsTxt, path) {
  let applies = false;
  for (const raw of robotsTxt.split("\n")) {
    const line = raw.trim().toLowerCase();
    if (line.startsWith("user-agent:")) applies = line.includes("*");
    else if (applies && line.startsWith("disallow:")) {
      const rule = line.slice("disallow:".length).trim();
      if (rule && path.startsWith(rule)) return true;
    }
  }
  return false;
}

async function fetchCapped(url, timeoutMs = FETCH_TIMEOUT_MS, redirects = 0) {
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
  if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
    if (redirects >= MAX_REDIRECTS) throw new Error("too many redirects");
    return fetchCapped(new URL(res.headers.get("location"), url).href, timeoutMs, redirects + 1);
  }
  if (!res.ok) throw new Error(`http ${res.status}`);
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX_FETCH_BYTES) throw new Error("content too large");
  const text = await res.text();
  if (text.length > MAX_FETCH_BYTES) throw new Error("content too large");
  return text;
}

/* ---------- 2. retrieval + parsing ---------- */

/** Fetch a permitted written interview and split it into paragraph segments. */
export async function fetchWrittenInterview(url) {
  const html = await fetchCapped(url);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(p|div|h\d|li|br)[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;|&\w+;/g, " ");
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length > 40);
  return paragraphs.map((p, i) => segmentFromParagraph(p, i + 1, url));
}

function segmentFromParagraph(text, paragraphIndex, sourceUrl) {
  // "Name: quote" speaker labels survive when present.
  const m = text.match(/^([A-Z][\w.'-]+(?: [A-Z][\w.'-]+){0,3}):\s+(.{20,})$/s);
  return {
    speaker: m ? m[1] : null,
    startSeconds: null,
    endSeconds: null,
    paragraphIndex,
    text: m ? m[2] : text,
    sourceAnchor: `paragraph ${paragraphIndex}`,
    sourceUrl,
    confidence: 0.9,
  };
}

const tsToSeconds = (h, m, s, ms) => Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms ?? 0) / 1000;
const anchorOf = (sec) =>
  `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

export function parseSRT(content) {
  const out = [];
  for (const block of content.replace(/\r/g, "").split(/\n\s*\n/)) {
    const m = block.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*\n([\s\S]+)/);
    if (!m) continue;
    out.push(cueToSegment(tsToSeconds(m[1], m[2], m[3], m[4]), tsToSeconds(m[5], m[6], m[7], m[8]), m[9]));
  }
  return out;
}

export function parseVTT(content) {
  const out = [];
  for (const block of content.replace(/\r/g, "").split(/\n\s*\n/)) {
    const m = block.match(/(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})[^\n]*\n([\s\S]+)/);
    if (!m) continue;
    out.push(cueToSegment(tsToSeconds(m[1] ?? 0, m[2], m[3], m[4]), tsToSeconds(m[5] ?? 0, m[6], m[7], m[8]), m[9]));
  }
  return out;
}

function cueToSegment(startSeconds, endSeconds, rawText) {
  let text = rawText.replace(/\n/g, " ").trim();
  let speaker = null;
  const voice = text.match(/^<v\s+([^>]+)>\s*(.*)$/); // VTT voice tag
  const label = text.match(/^([A-Z][\w.'-]+(?: [A-Z][\w.'-]+){0,3}):\s+(.*)$/);
  if (voice) [speaker, text] = [voice[1].trim(), voice[2]];
  else if (label) [speaker, text] = [label[1], label[2]];
  return { speaker, startSeconds, endSeconds, paragraphIndex: null, text: text.replace(/<[^>]+>/g, ""), sourceAnchor: anchorOf(startSeconds), confidence: 0.93 };
}

export function parseTXT(content) {
  return content
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p, i) => segmentFromParagraph(p, i + 1, null));
}

/** Accepts either our canonical shape or the reference-project segment shape. */
export function parseJSONTranscript(content) {
  const data = typeof content === "string" ? JSON.parse(content) : content;
  const segments = data.segments ?? data;
  if (!Array.isArray(segments)) throw new Error("JSON transcript must carry a segments array");
  return {
    sourceUrl: data.source_url ?? data.sourceUrl ?? null,
    title: data.title ?? null,
    segments: segments.map((s, i) => ({
      speaker: s.speaker ?? s.display_name ?? null,
      startSeconds: s.start_seconds ?? s.startSeconds ?? null,
      endSeconds: s.end_seconds ?? s.endSeconds ?? null,
      paragraphIndex: s.paragraph ?? s.paragraph_index ?? (s.start_seconds == null ? i + 1 : null),
      text: s.text,
      sourceAnchor: s.source_anchor ?? (s.start_seconds != null ? anchorOf(s.start_seconds) : `paragraph ${s.paragraph ?? i + 1}`),
      sourceUrl: s.source_url ?? null,
      confidence: s.confidence ?? 0.9,
    })),
  };
}

export function parseTranscriptFile(path) {
  const ext = extname(path).toLowerCase();
  if (!TEXT_EXTENSIONS.includes(ext)) throw new Error(`unsupported transcript type ${ext} — supported: ${TEXT_EXTENSIONS.join(", ")}`);
  const content = readFileSync(path, "utf8");
  if (ext === ".srt") return { segments: parseSRT(content) };
  if (ext === ".vtt") return { segments: parseVTT(content) };
  if (ext === ".json") return parseJSONTranscript(content);
  return { segments: parseTXT(content) }; // .txt / .md
}

/* ---------- 3. normalization ---------- */

/** Canonical transcript: stable ids, speaker table, content hash. */
export function normalizeTranscript({ title, language = "en", sourceUrl, policy, segments, speakerRoles = {} }) {
  resetIds();
  const speakers = new Map();
  const speakerId = (name) => {
    const key = name ?? "Unknown speaker";
    if (!speakers.has(key)) {
      speakers.set(key, {
        speaker_id: `SPK-${String(speakers.size + 1).padStart(3, "0")}`,
        display_name: key,
        role: speakerRoles[key] ?? (/(host|interviewer|agent)/i.test(key) ? "interviewer" : "founder"),
        identity_confidence: name ? 0.9 : 0.3,
      });
    }
    return speakers.get(key).speaker_id;
  };
  const normSegments = segments.map((s) => ({
    segment_id: id("SEG"),
    speaker_id: speakerId(s.speaker),
    start_seconds: s.startSeconds ?? null,
    end_seconds: s.endSeconds ?? null,
    paragraph_index: s.paragraphIndex ?? null,
    text: s.text,
    source_anchor: s.sourceAnchor,
    confidence: s.confidence ?? 0.9,
  }));
  const last = normSegments.at(-1);
  return {
    transcript_id: `TRN-${sha256(JSON.stringify(normSegments)).slice(0, 10)}`,
    source_id: `SRC-${sha256(sourceUrl ?? title ?? "local").slice(0, 10)}`,
    source_url: sourceUrl ?? null,
    policy,
    title: title ?? "Untitled interview",
    language,
    duration_seconds: last?.end_seconds ?? 0,
    speakers: [...speakers.values()],
    segments: normSegments,
    content_hash: sha256(segments.map((s) => s.text).join("\n")),
    retrieved_at: new Date().toISOString(),
  };
}
