// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// @ts-expect-error — canonical screening lives in laura's plain-ESM pipeline (no type defs; single source of truth)
import { screenOpportunity } from "../../laura/pipeline/lib/screening.js";

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
          const verdict = screenOpportunity(application, await readThesisFlat());
          const id = `APP-${Date.now()}`;
          await mkdir(INBOX_DIR, { recursive: true });
          await writeFile(
            join(INBOX_DIR, `${id}.json`),
            JSON.stringify({ id, receivedAt: new Date().toISOString(), screening: verdict, application }, null, 2),
            "utf8",
          );
          res.end(JSON.stringify({ id, ...verdict }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "invalid json" }));
        }
      });
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
