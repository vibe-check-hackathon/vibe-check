// Production server for the investor platform. Serves the same backend
// endpoints as the vite dev server (shared implementation in
// app-endpoints.js) and proxies every other request to the built TanStack
// Start SSR app (nitro node-server output), which it spawns as a child.
//
// Build + run:
//   cd Martin/nexus-vetting-suite && NITRO_PRESET=node-server npm run build
//   node laura/pipeline/app-server.js          # → http://localhost:8080
//
// Env: PORT (default 8080), SSR_PORT (internal, default 8790),
//      SSR_ENTRY (default Martin/nexus-vetting-suite/.output/server/index.mjs),
//      NO_SSR=1 to run API-only (endpoints up, frontend 502s).
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerAppEndpoints } from "./app-endpoints.js";

const PIPELINE_DIR = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const SSR_PORT = Number(process.env.SSR_PORT ?? 8790);
const SSR_ENTRY =
  process.env.SSR_ENTRY ??
  join(PIPELINE_DIR, "..", "..", "Martin", "nexus-vetting-suite", ".output", "server", "index.mjs");

// Connect-semantics route registry: on match the mount prefix is stripped
// from req.url before the handler runs, exactly like vite's middlewares.use.
const routes = [];
registerAppEndpoints((route, handler) => routes.push({ route, handler }));

function dispatch(req, res, index, fallback) {
  for (let i = index; i < routes.length; i++) {
    const { route, handler } = routes[i];
    const url = req.url ?? "/";
    if (url === route || url.startsWith(`${route}/`) || url.startsWith(`${route}?`)) {
      const originalUrl = url;
      req.url = url.slice(route.length) || "/";
      handler(req, res, () => {
        req.url = originalUrl; // restore before trying later routes
        dispatch(req, res, i + 1, fallback);
      });
      return;
    }
  }
  fallback();
}

function proxyToSsr(req, res) {
  const upstream = httpRequest(
    {
      host: "127.0.0.1",
      port: SSR_PORT,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, host: `127.0.0.1:${SSR_PORT}` },
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", () => {
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      "SSR app not reachable. Build it first:\n" +
        "  cd Martin/nexus-vetting-suite && NITRO_PRESET=node-server npm run build\n",
    );
  });
  req.pipe(upstream);
}

let ssrChild = null;
if (process.env.NO_SSR !== "1") {
  if (!existsSync(SSR_ENTRY)) {
    console.error(`SSR entry not found: ${SSR_ENTRY}`);
    console.error(
      "Build it first: cd Martin/nexus-vetting-suite && NITRO_PRESET=node-server npm run build",
    );
    process.exit(1);
  }
  ssrChild = spawn(process.execPath, [SSR_ENTRY], {
    env: { ...process.env, PORT: String(SSR_PORT), NITRO_PORT: String(SSR_PORT) },
    stdio: "inherit",
  });
  ssrChild.on("exit", (code) => {
    console.error(`SSR child exited (${code}) — shutting down`);
    process.exit(code ?? 1);
  });
}

const server = createServer((req, res) => {
  dispatch(req, res, 0, () => proxyToSsr(req, res));
});

server.listen(PORT, () => {
  console.log(`  ➜  app-server: http://localhost:${PORT} (API + SSR proxy :${SSR_PORT})`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    ssrChild?.kill();
    server.close(() => process.exit(0));
  });
}
