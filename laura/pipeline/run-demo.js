// End-to-end demo of Sourcing -> Developing on the Acme Robotics sample.
// Usage: node run-demo.js   (writes output/OPP-2026-0001.md)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createBus, founderView } from "./lib/events.js";
import { serializeCard } from "./lib/card.js";
import { loadThesis } from "./lib/thesis.js";
import { runSourcing } from "./sourcing.js";
import { runDeveloping } from "./developing.js";

const here = dirname(fileURLToPath(import.meta.url));
const intake = JSON.parse(readFileSync(join(here, "sample", "intake-acme.json"), "utf8"));
const research = JSON.parse(readFileSync(join(here, "sample", "research-acme.json"), "utf8"));

// The fund thesis a lean investor configures themselves (the only manual
// input) — single source: thesis.json.
const thesis = loadThesis();

const bus = createBus();
bus.subscribe((e) => {
  const detail = Object.entries(e)
    .filter(([k]) => !["at", "type"].includes(k))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");
  console.log(`  [${e.type}] ${detail}`);
});

console.log("== Stage 1: Sourcing ==");
const card = runSourcing(intake, bus);

console.log("\n== Stage 2: Developing ==");
runDeveloping(card, thesis, research, bus);

const outDir = join(here, "output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${card.front.id}.md`);
writeFileSync(outPath, serializeCard(card), "utf8");

console.log(`\n== Result ==`);
console.log(`card: ${outPath} (status ${card.front.status}, revision ${card.revision})`);
console.log(`events emitted: ${bus.log.length} (investor stream)`);
const founderEvents = bus.log.map(founderView).filter(Boolean);
console.log(`founder-safe subset: ${founderEvents.length} event(s) — analysis and model events filtered out`);
console.log(`recommendation: ${card.summary.recommendation} (confidence ${card.summary.confidence}/100) — awaiting human approval`);
