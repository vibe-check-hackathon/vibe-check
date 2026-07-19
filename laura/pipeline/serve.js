// Live demo server: serves the frontend and streams pipeline + interview
// events over SSE (one-directional, zero-dependency; the WebSocket upgrade
// comes with LiveKit). Usage: node serve.js  ->  http://localhost:4173
//
// GET  /            frontend (laura/frontend)
// GET  /events      SSE stream: Sourcing -> Developing (real pipeline) then
//                   the interview replay, all in the §3.3 event schema
// POST /approve     human gate: broadcasts approval + outcome to all clients

import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createBus } from "./lib/events.js";
import { loadThesis } from "./lib/thesis.js";
import { screenOpportunity } from "./lib/screening.js";
import { createInterviewEvaluator } from "./lib/interview-eval.js";
import { runSourcing } from "./sourcing.js";
import { runDeveloping } from "./developing.js";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..", "frontend");
const PORT = process.env.PORT || 4173;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

// The Matching-stage replay (stage 3 is not implemented as an agent yet; the
// server streams the same interview the frontend used to hardcode).
const interviewScript = JSON.parse(readFileSync(join(here, "sample", "interview-acme.json"), "utf8"));

const clients = new Set();

function send(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function broadcast(event) {
  const stamped = { at: new Date().toISOString(), ...event };
  for (const res of clients) send(res, stamped);
}

function streamPipeline(res) {
  // Run the real Sourcing + Developing stages, replaying their event log with
  // human-followable pacing, then the interview script on its own timings.
  const bus = createBus();
  const intake = JSON.parse(readFileSync(join(here, "sample", "intake-acme.json"), "utf8"));
  const research = JSON.parse(readFileSync(join(here, "sample", "research-acme.json"), "utf8"));
  const card = runSourcing(intake, bus);
  runDeveloping(card, loadThesis(), research, bus);

  const timers = [];
  bus.log.forEach((event, i) => {
    timers.push(setTimeout(() => send(res, event), 400 * (i + 1)));
  });
  const pipelineMs = 400 * (bus.log.length + 2);
  // Real-time evaluation rides on the transcript: each spoken line is scored
  // as it streams (derived events follow the line by 300ms), so scores and the
  // negotiation model visibly react to WHAT WAS SAID, with reasons.
  const evaluator = createInterviewEvaluator({ thesis: loadThesis(), card });
  for (const step of interviewScript) {
    timers.push(setTimeout(() => send(res, { at: new Date().toISOString(), ...step.event }), pipelineMs + step.t * 1000));
    if (step.event.type !== "transcript.line") continue;
    const derived = evaluator.ingestLine(step.event); // order-correct: computed now, streamed on schedule
    derived.forEach((event, j) => {
      timers.push(setTimeout(() => send(res, { at: new Date().toISOString(), ...event }), pipelineMs + step.t * 1000 + 300 + j * 250));
    });
  }
  return () => timers.forEach(clearTimeout);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/events") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
    clients.add(res);
    const cancel = streamPipeline(res);
    req.on("close", () => { clients.delete(res); cancel(); });
    return;
  }

  // Thesis Engine endpoints (MVP #1): read + update the fund lens.
  if (url.pathname === "/thesis") {
    const thesisPath = join(here, "thesis.json");
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(readFileSync(thesisPath));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          JSON.parse(body);
          writeFileSync(thesisPath, body, "utf8");
          res.writeHead(204).end();
        } catch {
          res.writeHead(400).end("invalid json");
        }
      });
      return;
    }
  }

  // First-pass screening endpoint (MVP #4/#5): POST a record, get the verdict.
  if (url.pathname === "/screen" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const verdict = screenOpportunity(JSON.parse(body), loadThesis());
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(verdict));
      } catch {
        res.writeHead(400).end("invalid json");
      }
    });
    return;
  }

  if (url.pathname === "/approve" && req.method === "POST") {
    broadcast({ type: "approval.update", gate: "term_sheet", by: "USR-001", action: "approved", bounds: { reservation: 12, target: 9 } });
    broadcast({ type: "outcome.recorded", result: "term_sheet_drafted", termSheetRef: "TS-001" });
    broadcast({ type: "status.change", status: "closed" });
    res.writeHead(204).end();
    return;
  }

  // static files, path-traversal safe; /opportunity-db/* serves the card DB
  const dbRoot = join(here, "..", "opportunity-db");
  let root = webRoot;
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  if (pathname.startsWith("/opportunity-db/")) {
    root = dbRoot;
    pathname = pathname.slice("/opportunity-db".length);
  }
  const file = normalize(pathname).replace(/^([.][.][/\\])+/, "");
  const path = join(root, file);
  if (!path.startsWith(root) || !existsSync(path)) {
    res.writeHead(404).end("not found");
    return;
  }
  const type = MIME[extname(path)] ?? (extname(path) === ".md" ? "text/plain; charset=utf-8" : "application/octet-stream");
  res.writeHead(200, { "Content-Type": type });
  res.end(readFileSync(path));
});

server.listen(PORT, () => {
  console.log(`VibeCheck live server: http://localhost:${PORT}`);
  console.log("  /events streams the pipeline + interview; POST /approve fires the human gate");
});
