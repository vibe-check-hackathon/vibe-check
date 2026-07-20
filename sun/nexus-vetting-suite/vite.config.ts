// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
// @ts-expect-error — the backend endpoints live in laura's plain-ESM pipeline
// (single implementation for dev middleware AND production app-server.js;
// see laura/pipeline/app-endpoints.js). Do not add endpoints here — add them
// there so production stays in sync.
import { registerAppEndpoints } from "../../laura/pipeline/app-endpoints.js";

const lauraOpportunityDb = () => ({
  name: "serve-laura-opportunity-db",
  configureServer(server: {
    middlewares: {
      use: (route: string, fn: (req: any, res: any, next: () => void) => void) => void;
    };
  }) {
    registerAppEndpoints((route: string, fn: (req: any, res: any, next: () => void) => void) =>
      server.middlewares.use(route, fn),
    );
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
