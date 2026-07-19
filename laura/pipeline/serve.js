// Live demo server: serves the frontend and streams pipeline + interview
// events over SSE (one-directional, zero-dependency; the WebSocket upgrade
// comes with LiveKit). Usage: node serve.js  ->  http://localhost:4173
//
// GET  /            frontend (laura/frontend)
// GET  /events      SSE stream: Sourcing -> Developing (real pipeline) then
//                   the interview replay, all in the §3.3 event schema
// POST /approve     human gate: broadcasts approval + outcome to all clients

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createBus } from "./lib/events.js";
import { loadThesis } from "./lib/thesis.js";
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
  for (const step of interviewScript) {
    timers.push(setTimeout(() => send(res, { at: new Date().toISOString(), ...step.event }), pipelineMs + step.t * 1000));
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
