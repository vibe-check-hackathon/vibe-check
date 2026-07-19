// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

const lauraOpportunityDb = () => ({
  name: "serve-laura-opportunity-db",
  configureServer(server: { middlewares: { use: (route: string, fn: (req: any, res: any, next: () => void) => void) => void } }) {
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
