// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error — canonical screening lives in laura's plain-ESM pipeline (no type defs; single source of truth)
import { screenOpportunity } from "../../laura/pipeline/lib/screening.js";
// @ts-expect-error — same pipeline convention: provider-agnostic LLM adapter, key set via laura/pipeline/set-key.js
import { filterDealsWithLLM, keyStatus, loadConfig } from "../../laura/pipeline/lib/llm.js";
// @ts-expect-error — live outbound refresh: template-driven LLM scan, screened before it reaches the board
import { scanOutbound, briefMarkdown } from "../../laura/pipeline/lib/outbound-scan.js";
// @ts-expect-error — Checky: retrieval-grounded assistant over the opportunity DB
import { askAssistant } from "../../laura/pipeline/lib/assistant.js";
// @ts-expect-error — key management shared with set-key.js (24h cache, gitignored)
import { saveKey, clearKey } from "../../laura/pipeline/lib/llm.js";
// @ts-expect-error — same pipeline: founder profiling + interview hypotheses
import { buildFounderProfiles } from "../../laura/pipeline/lib/founder-profiles.js";

/* Serve laura/opportunity-db as /opportunity-db/* directly from the single
 * source of truth — no copied data in public/. The old copy used a cards/
 * subfolder; laura keeps cards at the DB root, so that prefix is rewritten.
 * Dev-server only (fine for the hackathon demo; a build would copy the DB). */
const DB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "laura", "opportunity-db");
const MIME: Record<string, string> = {
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const THESIS_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "laura", "pipeline", "thesis.json");
const INBOX_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "laura", "pipeline", "inbox");

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const initials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
const parseUsd = (value: unknown) => {
  if (typeof value === "number") return value;
  const text = String(value ?? "").replace(/,/g, "").trim();
  const match = text.match(/([\d.]+)\s*([mbk])?/i);
  if (!match) return undefined;
  const n = Number(match[1]);
  const unit = (match[2] ?? "").toLowerCase();
  if (unit === "b") return Math.round(n * 1_000_000_000);
  if (unit === "m") return Math.round(n * 1_000_000);
  if (unit === "k") return Math.round(n * 1_000);
  return Math.round(n);
};

function normalizeFounders(application: any, appId: string) {
  const raw = Array.isArray(application.founders) && application.founders.length
    ? application.founders
    : [{ name: application.founderName, email: application.founderEmail, linkedin: application.linkedin, role: "Founder" }];
  return raw
    .map((f: any, index: number) => ({
      id: `FND-${appId}-${String(index + 1).padStart(2, "0")}`,
      name: String(f.name ?? "").trim(),
      role: String(f.role ?? (index === 0 ? "CEO" : "Co-founder")).trim(),
      email: String(f.email ?? "").trim(),
      linkedin: String(f.linkedin ?? f.linkedinUrl ?? "").trim(),
      github: String(f.github ?? "").trim(),
    }))
    .filter((f: any) => f.name);
}

function normalizeApplication(application: any, id: string) {
  const opportunityId = `OPP-${id}`;
  const founders = normalizeFounders(application, id);
  const materials = [
    application.deck && { description: "Pitch deck", origin: "founder", url: application.deck },
    application.website && { description: "Company website", origin: "founder", url: application.website },
    application.productDemo && { description: "Product demo", origin: "founder", url: application.productDemo },
    ...founders.flatMap((f: any) => [
      f.linkedin && { description: `${f.name} LinkedIn`, origin: "founder", url: f.linkedin },
      f.github && { description: `${f.name} GitHub / personal site`, origin: "founder", url: f.github },
    ]),
  ].filter(Boolean);
  const intake = {
    opportunityId,
    company: application.company,
    thesisId: "THESIS-001",
    oneLiner: application.oneLiner ?? "",
    stage: application.stage ?? application.round,
    round: application.round,
    location: application.geography ?? application.location ?? "",
    raiseUsd: parseUsd(application.raiseUsd ?? application.ask),
    permissions: application.permissions,
    materials,
    founders: founders.map((f: any) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      email: f.email || undefined,
      linkedin: f.linkedin,
      github: f.github || undefined,
      assessed: false,
      avatar: { type: "initials", value: initials(f.name), basis: "neutral placeholder; submitted application" },
      background: [
        `${f.role || "Founder"} submitted as part of application`,
        `LinkedIn supplied: ${f.linkedin}`,
        f.github ? `GitHub / personal site supplied: ${f.github}` : "",
      ].filter(Boolean),
    })),
    claims: [
      application.oneLiner && { text: application.oneLiner, subject: "company", sourceIndex: 0 },
      application.traction && { text: application.traction, subject: "traction", sourceIndex: 0 },
      application.problem && { text: application.problem, subject: "market", sourceIndex: 0 },
    ].filter(Boolean),
    companyProfile: {
      sector: application.sector ?? "",
      problem: application.problem ?? "",
      market: application.market ?? "",
      businessModel: application.businessModel ?? "",
      technology: application.technology ?? "",
      website: application.website ?? "",
    },
  };
  return { opportunityId, founders, intake };
}

function applicationMarkdown(id: string, receivedAt: string, screening: any, normalized: ReturnType<typeof normalizeApplication>) {
  const founderRows = normalized.intake.founders.map((f: any) => `- ${f.id}: ${f.name}, ${f.role} — LinkedIn: ${f.linkedin}${f.github ? `; GitHub/site: ${f.github}` : ""}`).join("\n");
  const materialRows = normalized.intake.materials.map((m: any, i: number) => `- SRC-${String(i + 1).padStart(3, "0")}: ${m.description}${m.url ? ` — ${m.url}` : ""}`).join("\n");
  return `# ${normalized.intake.company} application\n\n- **Application ID:** ${id}\n- **Opportunity ID:** ${normalized.opportunityId}\n- **Received:** ${receivedAt}\n- **Screening:** ${screening.pass ? "pass" : "screened out"}\n\n## Company\n\n${normalized.intake.oneLiner}\n\n- **Stage:** ${normalized.intake.stage}\n- **Location:** ${normalized.intake.location}\n- **Raise USD:** ${normalized.intake.raiseUsd ?? "unknown"}\n- **Sector:** ${normalized.intake.companyProfile.sector}\n\n## Founders\n\n${founderRows}\n\n## Materials\n\n${materialRows}\n\n## Screening\n\n- **Hard fails:** ${screening.hardFails.length ? screening.hardFails.join("; ") : "none"}\n- **Soft flags:** ${screening.softFlags.length ? screening.softFlags.join("; ") : "none"}\n`;
}

async function readThesisFlat() {
  const raw = JSON.parse(await readFile(THESIS_PATH, "utf8"));
  return { raw, sectors: raw.fund.sectors, maxCheckUsd: raw.fund.checkSizeUsd.max };
}

const lauraOpportunityDb = () => ({
  name: "serve-laura-opportunity-db",
  configureServer(server: { middlewares: { use: (route: string, fn: (req: any, res: any, next: () => void) => void) => void } }) {
    // Thesis Engine endpoint (MVP #1): the investor's fund lens, read + update.
    server.middlewares.use("/thesis", async (req, res, next) => {
      try {
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(await readFile(THESIS_PATH));
          return;
        }
        if (req.method === "POST") {
          let body = "";
          req.on("data", (c: string) => (body += c));
          req.on("end", async () => {
            try {
              JSON.parse(body);
              await writeFile(THESIS_PATH, body, "utf8");
              res.statusCode = 204;
              res.end();
            } catch {
              res.statusCode = 400;
              res.end("invalid json");
            }
          });
          return;
        }
        next();
      } catch {
        next();
      }
    });
    // Inbound application endpoint (MVP #4): deck + company name is the
    // minimum bar; the canonical first-pass screen runs immediately.
    server.middlewares.use("/apply", (req, res, next) => {
      if (req.method !== "POST") return next();
      let body = "";
      req.on("data", (c: string) => (body += c));
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        try {
          const application = JSON.parse(body);
          if (!application.company || !application.deck) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "company and deck are the minimum bar (challenge brief #4)" }));
            return;
          }
          const id = `APP-${Date.now()}`;
          const normalized = normalizeApplication(application, id);
          if (!normalized.intake.founders.length || normalized.intake.founders.some((f: any) => !f.linkedin)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "at least one founder is required, and every founder needs LinkedIn" }));
            return;
          }
          const verdict = screenOpportunity({
            ...application,
            stage: normalized.intake.stage,
            round: normalized.intake.round,
            sector: normalized.intake.companyProfile.sector,
            oneLiner: normalized.intake.oneLiner,
          }, await readThesisFlat());
          // Profiling pass on the normalized founders: personality hypotheses
          // for the agent interview to test. Unscored by design.
          const founders = buildFounderProfiles(
            { ...application, founders: normalized.intake.founders },
            normalized.opportunityId,
          );
          const receivedAt = new Date().toISOString();
          await mkdir(INBOX_DIR, { recursive: true });
          await writeFile(
            join(INBOX_DIR, `${id}.json`),
            JSON.stringify({ id, opportunityId: normalized.opportunityId, receivedAt, screening: verdict, application, intake: normalized.intake, founders }, null, 2),
            "utf8",
          );
          await writeFile(join(INBOX_DIR, `${id}.md`), applicationMarkdown(id, receivedAt, verdict, normalized), "utf8");
          res.end(JSON.stringify({ id, opportunityId: normalized.opportunityId, ...verdict, founders }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "invalid json" }));
        }
      });
    });
    // LLM fallback for the board command bar (MVP #3): free-text queries the
    // rule parser can't handle. Key comes from set-key.js (24h) or env vars;
    // the key file is read per request, so no dev-server restart after set-key.
    console.log(`  ➜  LLM: ${keyStatus()}`);
    server.middlewares.use("/nl-query", (req, res, next) => {
      if (req.method !== "POST") return next();
      let body = "";
      req.on("data", (c: string) => (body += c));
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        if (!loadConfig()) {
          res.statusCode = 501;
          res.end(JSON.stringify({ error: "no LLM key (or expired) — run: node laura/pipeline/set-key.js, then retry" }));
          return;
        }
        try {
          const { query, deals } = JSON.parse(body);
          if (!query || !Array.isArray(deals)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "expected { query, deals }" }));
            return;
          }
          res.end(JSON.stringify(await filterDealsWithLLM(query, deals)));
        } catch (e) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `LLM call failed: ${e instanceof Error ? e.message : "unknown"}` }));
        }
      });
    });
    // Live outbound refresh (MVP #5): LLM scan for new candidates in a region,
    // structured by the intelligence-brief template, screened, then persisted
    // to the synthetic index so the new deals pop onto the board and stay.
    server.middlewares.use("/outbound-scan", (req, res, next) => {
      if (req.method !== "POST") return next();
      let body = "";
      req.on("data", (c: string) => (body += c));
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        if (!loadConfig()) {
          res.statusCode = 501;
          res.end(JSON.stringify({ error: "no LLM key (or expired) — run: node laura/pipeline/set-key.js, then retry" }));
          return;
        }
        try {
          const { region } = JSON.parse(body || "{}");
          const indexPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "laura", "opportunity-db", "synthetic", "index.json");
          const index = JSON.parse(await readFile(indexPath, "utf8"));
          const existingCompanies = [
            ...(index.outboundSelected ?? []),
            ...(index.currentApplications ?? []),
          ].map((r: { company: string }) => r.company);
          const { records, mode } = await scanOutbound({
            region: String(region ?? "europe").toLowerCase(),
            existingCompanies,
            thesis: await readThesisFlat(),
          });
          // Each find gets a filled intelligence-brief card in the DB, per the
          // template — the record's card link points at it.
          const scansDir = join(dirname(indexPath), "..", "outbound-scans");
          await mkdir(scansDir, { recursive: true });
          for (const r of records as { id: string; card: string }[]) {
            await writeFile(join(scansDir, `${r.id}.md`), briefMarkdown(r), "utf8");
            r.card = `../outbound-scans/${r.id}.md`;
          }
          index.outboundSelected = [...(index.outboundSelected ?? []), ...records];
          await writeFile(indexPath, JSON.stringify(index, null, 2) + "\n", "utf8");
          res.end(JSON.stringify({ added: records.length, mode, companies: records.map((r: { company: string }) => r.company) }));
        } catch (e) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `scan failed: ${e instanceof Error ? e.message : "unknown"}` }));
        }
      });
    });
    // Checky (frontend assistant): retrieval-grounded chat over the DB.
    server.middlewares.use("/assistant", (req, res, next) => {
      if (req.method !== "POST") return next();
      let body = "";
      req.on("data", (c: string) => (body += c));
      req.on("end", async () => {
        res.setHeader("Content-Type", "application/json");
        if (!loadConfig()) {
          res.statusCode = 501;
          res.end(JSON.stringify({ error: "no-key" }));
          return;
        }
        try {
          const { messages } = JSON.parse(body);
          if (!Array.isArray(messages)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "expected { messages }" }));
            return;
          }
          res.end(JSON.stringify(await askAssistant(messages)));
        } catch (e) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: `assistant failed: ${e instanceof Error ? e.message : "unknown"}` }));
        }
      });
    });
    // Token management from the UI: status, set/switch, forget. Same 24h
    // gitignored cache as the set-key.js terminal flow.
    server.middlewares.use("/llm-key", (req, res, next) => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "GET") {
        res.end(JSON.stringify({ status: keyStatus(), active: !!loadConfig(), provider: loadConfig()?.provider ?? null }));
        return;
      }
      if (req.method === "DELETE") {
        clearKey();
        res.end(JSON.stringify({ status: keyStatus(), active: false }));
        return;
      }
      if (req.method !== "POST") return next();
      let body = "";
      req.on("data", (c: string) => (body += c));
      req.on("end", () => {
        try {
          const { key, baseUrl, model } = JSON.parse(body);
          if (!key || typeof key !== "string") {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "expected { key }" }));
            return;
          }
          const saved = saveKey({ key: key.trim(), baseUrl, model });
          res.end(JSON.stringify({ status: keyStatus(), active: true, provider: saved.provider }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "invalid json" }));
        }
      });
    });
    // Everything submitted through /apply, newest first. The board and the
    // founder pipeline both read this so a submission shows up immediately.
    server.middlewares.use("/applications", async (req, res, next) => {
      if (req.method !== "GET") return next();
      res.setHeader("Content-Type", "application/json");
      try {
        const names = (await readdir(INBOX_DIR)).filter((n) => n.endsWith(".json"));
        const records = await Promise.all(
          names.map(async (n) => JSON.parse(await readFile(join(INBOX_DIR, n), "utf8"))),
        );
        // Backfill founder profiles for records written before profiles existed
        // — old inbox JSON must never crash the board.
        for (const r of records) {
          if (!Array.isArray(r.founders)) r.founders = buildFounderProfiles(r.application ?? {}, r.id);
        }
        records.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
        res.end(JSON.stringify(records));
      } catch {
        res.end("[]"); // no inbox yet — nobody has applied
      }
    });
    server.middlewares.use("/opportunity-db", async (req, res, next) => {
      try {
        let rel = decodeURIComponent((req.url ?? "/").split("?")[0]);
        rel = rel.replace(/^\/cards\//, "/"); // legacy path from the public/ copy
        const file = join(DB_ROOT, normalize(rel).replace(/^([.\\/])+/, ""));
        if (!file.startsWith(DB_ROOT)) return next();
        const data = await readFile(file);
        res.setHeader("Content-Type", MIME[extname(file)] ?? "application/octet-stream");
        res.end(data);
      } catch {
        next();
      }
    });
  },
});

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [lauraOpportunityDb()],
  },
});
