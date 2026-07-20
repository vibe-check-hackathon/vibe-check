// Backend endpoints for the investor platform — the single implementation
// used by BOTH the vite dev server (Martin/nexus-vetting-suite/vite.config.ts
// registers these as dev middleware) and production (app-server.js). Handlers
// are plain Node (req, res, next) in connect semantics: the mount route is
// already stripped from req.url when a handler runs.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { screenOpportunity } from "./lib/screening.js";
import { renderThesisMarkdown } from "./lib/thesis.js";
import {
  clearKey,
  filterDealsWithLLM,
  keyStatus,
  loadConfig,
  saveKey,
} from "./lib/llm.js";
import { briefMarkdown, scanOutbound } from "./lib/outbound-scan.js";
import { askAssistant } from "./lib/assistant.js";
import { buildFounderProfiles } from "./lib/founder-profiles.js";
import { sendInterviewInvite } from "./lib/email.js";
import { buildDynamicVariables, getSignedUrl } from "./lib/interview-agent.js";
import { serviceConfig, serviceStatus } from "./lib/service-keys.js";
import {
  generateTermSheet,
  renderLegalTermSheet,
  renderTermSheet,
} from "./lib/term-sheet.js";
import {
  createFounderAccount,
  createSession,
  destroySession,
  getSessionAccount,
  parseCookies,
  sessionCookieHeader,
  verifyLogin,
} from "./lib/accounts.js";

const PIPELINE_DIR = dirname(fileURLToPath(import.meta.url));
const DB_ROOT = join(PIPELINE_DIR, "..", "opportunity-db");
// Env overrides exist so tests can point writes at a temp dir — production
// and dev never set them.
const INTERVIEWS_DIR = process.env.FIRSTCHECK_INTERVIEWS_DIR ?? join(DB_ROOT, "interviews");
const THESIS_PATH = process.env.FIRSTCHECK_THESIS_PATH ?? join(PIPELINE_DIR, "thesis.json");
// Regenerated alongside thesis.json on every write — see renderThesisMarkdown.
const THESIS_MD_PATH = process.env.FIRSTCHECK_THESIS_MD_PATH ?? join(PIPELINE_DIR, "thesis.md");
const INBOX_DIR = process.env.FIRSTCHECK_INBOX_DIR ?? join(PIPELINE_DIR, "inbox");
const SUN_DECK = join(PIPELINE_DIR, "..", "..", "sun", "deck");

const MIME = {
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const initials = (value) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
const parseUsd = (value) => {
  if (typeof value === "number") return value;
  const text = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  const match = text.match(/([\d.]+)\s*([mbk])?/i);
  if (!match) return undefined;
  const n = Number(match[1]);
  const unit = (match[2] ?? "").toLowerCase();
  if (unit === "b") return Math.round(n * 1_000_000_000);
  if (unit === "m") return Math.round(n * 1_000_000);
  if (unit === "k") return Math.round(n * 1_000);
  return Math.round(n);
};

function normalizeFounders(application, appId) {
  const raw =
    Array.isArray(application.founders) && application.founders.length
      ? application.founders
      : [
          {
            name: application.founderName,
            email: application.founderEmail,
            linkedin: application.linkedin,
            role: "Founder",
          },
        ];
  return raw
    .map((f, index) => ({
      id: `FND-${appId}-${String(index + 1).padStart(2, "0")}`,
      name: String(f.name ?? "").trim(),
      role: String(f.role ?? (index === 0 ? "CEO" : "Co-founder")).trim(),
      email: String(f.email ?? "").trim(),
      linkedin: String(f.linkedin ?? f.linkedinUrl ?? "").trim(),
      github: String(f.github ?? "").trim(),
    }))
    .filter((f) => f.name);
}

function normalizeApplication(application, id) {
  const opportunityId = `OPP-${id}`;
  const founders = normalizeFounders(application, id);
  const materials = [
    application.deck && { description: "Pitch deck", origin: "founder", url: application.deck },
    application.website && {
      description: "Company website",
      origin: "founder",
      url: application.website,
    },
    application.productDemo && {
      description: "Product demo",
      origin: "founder",
      url: application.productDemo,
    },
    ...founders.flatMap((f) => [
      f.linkedin && { description: `${f.name} LinkedIn`, origin: "founder", url: f.linkedin },
      f.github && {
        description: `${f.name} GitHub / personal site`,
        origin: "founder",
        url: f.github,
      },
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
    founders: founders.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      email: f.email || undefined,
      linkedin: f.linkedin,
      github: f.github || undefined,
      assessed: false,
      avatar: {
        type: "initials",
        value: initials(f.name),
        basis: "neutral placeholder; submitted application",
      },
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

function applicationMarkdown(id, receivedAt, screening, normalized) {
  const founderRows = normalized.intake.founders
    .map(
      (f) =>
        `- ${f.id}: ${f.name}, ${f.role} — LinkedIn: ${f.linkedin}${f.github ? `; GitHub/site: ${f.github}` : ""}`,
    )
    .join("\n");
  const materialRows = normalized.intake.materials
    .map(
      (m, i) =>
        `- SRC-${String(i + 1).padStart(3, "0")}: ${m.description}${m.url ? ` — ${m.url}` : ""}`,
    )
    .join("\n");
  return `# ${normalized.intake.company} application\n\n- **Application ID:** ${id}\n- **Opportunity ID:** ${normalized.opportunityId}\n- **Received:** ${receivedAt}\n- **Screening:** ${screening.pass ? "pass" : "screened out"}\n\n## Company\n\n${normalized.intake.oneLiner}\n\n- **Stage:** ${normalized.intake.stage}\n- **Location:** ${normalized.intake.location}\n- **Raise USD:** ${normalized.intake.raiseUsd ?? "unknown"}\n- **Sector:** ${normalized.intake.companyProfile.sector}\n\n## Founders\n\n${founderRows}\n\n## Materials\n\n${materialRows}\n\n## Screening\n\n- **Hard fails:** ${screening.hardFails.length ? screening.hardFails.join("; ") : "none"}\n- **Soft flags:** ${screening.softFlags.length ? screening.softFlags.join("; ") : "none"}\n`;
}

async function readThesisFlat() {
  const raw = JSON.parse(await readFile(THESIS_PATH, "utf8"));
  return { raw, sectors: raw.fund.sectors, maxCheckUsd: raw.fund.checkSizeUsd.max };
}

/**
 * Finds the scored interview card for an opportunity: prefers the hard
 * source_opportunity_id link (written when the interview was ingested with
 * --opportunity), falls back to a company-name guess for interviews
 * ingested before that field existed (e.g. the deskbird example card).
 * Shared by /my-feedback (founder, session-scoped) and /interview-score
 * (investor-facing, explicit opportunityId — see AGENTS.md §33 route
 * matrix: this route is not yet auth-gated, tracked in SECURITY.md).
 */
async function findInterviewFeedback({ opportunityId, company }) {
  try {
    const cardNames = (await readdir(INTERVIEWS_DIR)).filter((n) => n.endsWith(".md"));
    const companyLower = String(company ?? "").trim().toLowerCase();
    let fallback = null;
    for (const cn of cardNames) {
      const raw = await readFile(join(INTERVIEWS_DIR, cn), "utf8");
      const fm = Object.fromEntries(
        (raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "")
          .split("\n")
          .map((l) => l.match(/^([a-z_]+):\s*"?([^"\n]*)"?$/))
          .filter(Boolean)
          .map((m) => [m[1], m[2]]),
      );
      const toCard = (matchedBy) => ({
        matchedBy,
        card: `../opportunity-db/interviews/${cn}`,
        founderScore: fm.founder_score ? Number(fm.founder_score) : null,
        founderScoreConfidence: fm.founder_score_confidence ? Number(fm.founder_score_confidence) : null,
        status: fm.status ?? null,
      });
      if (opportunityId && fm.source_opportunity_id === opportunityId) return toCard("source_opportunity_id (verified link)");
      if (!fallback && companyLower && String(fm.company ?? "").trim().toLowerCase() === companyLower) {
        fallback = toCard("company-name (heuristic — not a verified link)");
      }
    }
    return fallback;
  } catch {
    return null; // no interviews directory or no cards yet
  }
}

/**
 * Register every backend endpoint on a connect-style `use(route, handler)`.
 * In dev, pass the vite dev server's `middlewares.use`; in production,
 * app-server.js provides the same contract.
 */
export function registerAppEndpoints(use) {
  console.log(`  ➜  LLM: ${keyStatus()}`);
  for (const line of serviceStatus()) console.log(`  ➜  ${line}`);

  // Thesis Engine endpoint (MVP #1): the investor's fund lens, read + update.
  use("/thesis", async (req, res, next) => {
    try {
      if (req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.end(await readFile(THESIS_PATH));
        return;
      }
      if (req.method === "POST") {
        if (!requireInvestor(req, res)) return;
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", async () => {
          try {
            const nextThesis = JSON.parse(body);
            // Version identifier + regenerated Markdown counterpart, per
            // sun/tech-video-staging/tech-spec.md §9.1 — the version bumps
            // on every save so changes over time are traceable; the
            // Markdown is always derived, never hand-edited, so it can't drift.
            const previousVersion = await readFile(THESIS_PATH, "utf8")
              .then((t) => JSON.parse(t).version ?? 0)
              .catch(() => 0);
            nextThesis.version = previousVersion + 1;
            nextThesis.updatedAt = new Date().toISOString();
            const nextText = JSON.stringify(nextThesis, null, 2) + "\n";
            await writeFile(THESIS_PATH, nextText, "utf8");
            await writeFile(THESIS_MD_PATH, renderThesisMarkdown(nextThesis), "utf8");
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
  use("/apply", (req, res, next) => {
    if (req.method !== "POST") return next();
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      res.setHeader("Content-Type", "application/json");
      try {
        const application = JSON.parse(body);
        if (!application.company || !application.deck) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              error: "company and deck are the minimum bar (challenge brief #4)",
            }),
          );
          return;
        }
        const id = `APP-${Date.now()}`;
        const normalized = normalizeApplication(application, id);
        if (!normalized.intake.founders.length || normalized.intake.founders.some((f) => !f.linkedin)) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              error: "at least one founder is required, and every founder needs LinkedIn",
            }),
          );
          return;
        }
        const verdict = screenOpportunity(
          {
            ...application,
            stage: normalized.intake.stage,
            round: normalized.intake.round,
            sector: normalized.intake.companyProfile.sector,
            oneLiner: normalized.intake.oneLiner,
          },
          await readThesisFlat(),
        );
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
          JSON.stringify(
            {
              id,
              opportunityId: normalized.opportunityId,
              receivedAt,
              screening: verdict,
              application,
              intake: normalized.intake,
              founders,
            },
            null,
            2,
          ),
          "utf8",
        );
        await writeFile(
          join(INBOX_DIR, `${id}.md`),
          applicationMarkdown(id, receivedAt, verdict, normalized),
          "utf8",
        );
        // One founder account per founder who supplied an email, scoped to
        // this opportunity only. Shown once in the response — there is no
        // password-reset flow yet, so the frontend must display it clearly.
        const founderAccounts = normalized.intake.founders
          .filter((f) => f.email)
          .map((f) => createFounderAccount({ email: f.email, name: f.name, opportunityId: normalized.opportunityId }))
          .filter(Boolean);
        res.end(
          JSON.stringify({
            id,
            opportunityId: normalized.opportunityId,
            ...verdict,
            founders,
            founderAccounts,
          }),
        );
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid json" }));
      }
    });
  });

  // LLM fallback for the board command bar (MVP #3): free-text queries the
  // rule parser can't handle. Key comes from set-key.js (24h) or env vars;
  // the key file is read per request, so no server restart after set-key.
  use("/nl-query", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      res.setHeader("Content-Type", "application/json");
      if (!loadConfig()) {
        res.statusCode = 501;
        res.end(
          JSON.stringify({
            error: "no LLM key (or expired) — run: node laura/pipeline/set-key.js, then retry",
          }),
        );
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
        res.end(
          JSON.stringify({
            error: `LLM call failed: ${e instanceof Error ? e.message : "unknown"}`,
          }),
        );
      }
    });
  });

  // Live outbound refresh (MVP #5): LLM scan for new candidates in a region,
  // structured by the intelligence-brief template, screened, then persisted
  // to the synthetic index so the new deals pop onto the board and stay.
  use("/outbound-scan", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      res.setHeader("Content-Type", "application/json");
      if (!loadConfig()) {
        res.statusCode = 501;
        res.end(
          JSON.stringify({
            error: "no LLM key (or expired) — run: node laura/pipeline/set-key.js, then retry",
          }),
        );
        return;
      }
      try {
        const { region } = JSON.parse(body || "{}");
        const indexPath = join(DB_ROOT, "synthetic", "index.json");
        const index = JSON.parse(await readFile(indexPath, "utf8"));
        const existingCompanies = [
          ...(index.outboundSelected ?? []),
          ...(index.currentApplications ?? []),
        ].map((r) => r.company);
        const { records, mode } = await scanOutbound({
          region: String(region ?? "europe").toLowerCase(),
          existingCompanies,
          thesis: await readThesisFlat(),
        });
        // Each find gets a filled intelligence-brief card in the DB, per the
        // template — the record's card link points at it.
        const scansDir = join(DB_ROOT, "outbound-scans");
        await mkdir(scansDir, { recursive: true });
        for (const r of records) {
          await writeFile(join(scansDir, `${r.id}.md`), briefMarkdown(r), "utf8");
          r.card = `../outbound-scans/${r.id}.md`;
        }
        index.outboundSelected = [...(index.outboundSelected ?? []), ...records];
        await writeFile(indexPath, JSON.stringify(index, null, 2) + "\n", "utf8");
        res.end(
          JSON.stringify({
            added: records.length,
            mode,
            companies: records.map((r) => r.company),
          }),
        );
      } catch (e) {
        res.statusCode = 502;
        res.end(
          JSON.stringify({ error: `scan failed: ${e instanceof Error ? e.message : "unknown"}` }),
        );
      }
    });
  });

  // Checky (frontend assistant): retrieval-grounded chat over the DB.
  use("/assistant", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
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
        res.end(
          JSON.stringify({
            error: `assistant failed: ${e instanceof Error ? e.message : "unknown"}`,
          }),
        );
      }
    });
  });

  // Token management from the UI: status, set/switch, forget. Same 24h
  // gitignored cache as the set-key.js terminal flow.
  use("/llm-key", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "GET") {
      res.end(
        JSON.stringify({
          status: keyStatus(),
          active: !!loadConfig(),
          provider: loadConfig()?.provider ?? null,
        }),
      );
      return;
    }
    if (req.method === "DELETE") {
      if (!requireInvestor(req, res)) return;
      clearKey();
      res.end(JSON.stringify({ status: keyStatus(), active: false }));
      return;
    }
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
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
  use("/applications", async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (!requireInvestor(req, res)) return;
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

  // --- Accounts: real server-verified sessions, replacing the old
  // client-only localStorage gate. Two roles: investor (seeded, see
  // lib/accounts.js) and founder (auto-created on /apply, scoped to their
  // own opportunity — see /my-feedback below for the enforcement).
  function currentAccount(req) {
    return getSessionAccount(parseCookies(req).fc_session);
  }

  // AGENTS.md §33: every non-public route performs its own server-side
  // check, default deny. Returns the account on success; on failure it
  // writes the 401 itself and returns null — callers just do
  // `const account = requireInvestor(req, res); if (!account) return;`.
  function requireInvestor(req, res) {
    const account = currentAccount(req);
    if (!account || account.role !== "investor") {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "investor sign-in required" }));
      return null;
    }
    return account;
  }

  use("/auth/login", (req, res, next) => {
    if (req.method !== "POST") return next();
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      try {
        const { email, password } = JSON.parse(body || "{}");
        const account = verifyLogin(email, password);
        if (!account) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: "invalid email or password" }));
          return;
        }
        const token = createSession(account.id);
        res.setHeader("Set-Cookie", sessionCookieHeader(token));
        res.end(JSON.stringify({ role: account.role, name: account.name, opportunityId: account.opportunityId ?? null }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "invalid json" }));
      }
    });
  });

  use("/auth/logout", (req, res, next) => {
    if (req.method !== "POST") return next();
    destroySession(parseCookies(req).fc_session);
    res.setHeader("Set-Cookie", sessionCookieHeader(null, { clear: true }));
    res.statusCode = 204;
    res.end();
  });

  use("/auth/me", (req, res, next) => {
    if (req.method !== "GET") return next();
    res.setHeader("Content-Type", "application/json");
    const account = currentAccount(req);
    if (!account) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "not signed in" }));
      return;
    }
    res.end(JSON.stringify({ role: account.role, name: account.name, opportunityId: account.opportunityId ?? null }));
  });

  // Founder's own feedback: what the screen said, the open hypotheses queued
  // for interview, and — once a scored interview card exists — the real
  // per-axis score breakdown with citations. Server-side scoped to the
  // caller's own opportunityId (§21/§26: role-gating happens here, never
  // client-side) — a founder session can never read anyone else's record.
  use("/my-feedback", async (req, res, next) => {
    if (req.method !== "GET") return next();
    res.setHeader("Content-Type", "application/json");
    const account = currentAccount(req);
    if (!account || account.role !== "founder") {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "founder sign-in required" }));
      return;
    }
    try {
      const names = (await readdir(INBOX_DIR)).filter((n) => n.endsWith(".json"));
      let record = null;
      for (const n of names) {
        const r = JSON.parse(await readFile(join(INBOX_DIR, n), "utf8"));
        if (r.opportunityId === account.opportunityId) {
          record = r;
          break;
        }
      }
      if (!record) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "no application found for this account" }));
        return;
      }
      const interviewFeedback = await findInterviewFeedback({
        opportunityId: account.opportunityId,
        company: record.application?.company,
      });
      res.end(
        JSON.stringify({
          opportunityId: account.opportunityId,
          company: record.application?.company ?? null,
          screening: record.screening ?? null,
          founders: record.founders ?? [],
          interviewFeedback,
        }),
      );
    } catch (e) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: e instanceof Error ? e.message : "lookup failed" }));
    }
  });

  // Investor-facing counterpart to /my-feedback's interview lookup — used by
  // TermSheetStudio so it can start from a real computed score instead of a
  // hand-typed placeholder whenever one exists for the opportunity.
  use("/interview-score", async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (!requireInvestor(req, res)) return;
    res.setHeader("Content-Type", "application/json");
    const url = new URL(req.url ?? "/", "http://internal");
    const opportunityId = url.searchParams.get("opportunityId");
    const company = url.searchParams.get("company");
    if (!opportunityId && !company) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "expected ?opportunityId=... and/or ?company=..." }));
      return;
    }
    res.end(JSON.stringify({ interviewFeedback: await findInterviewFeedback({ opportunityId, company }) }));
  });

  // Interview invitation (Resend). Previews by default; only delivers when
  // the caller explicitly asks, so a rehearsal cannot mail a real founder.
  use("/invite", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      res.setHeader("Content-Type", "application/json");
      try {
        const { applicationId, live } = JSON.parse(body || "{}");
        if (!applicationId || !/^APP-\d+$/.test(String(applicationId))) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "expected { applicationId: 'APP-…' } from the inbox" }));
          return;
        }
        const record = JSON.parse(await readFile(join(INBOX_DIR, `${applicationId}.json`), "utf8"));
        const founder = record.founders?.[0] ?? record.intake?.founders?.[0];
        const result = await sendInterviewInvite({
          to: founder?.email ?? record.application?.founderEmail,
          founderName: founder?.name,
          company: record.application?.company,
          interviewUrl: `${req.headers.origin ?? "http://localhost:8080"}/interviews?opp=${record.opportunityId ?? applicationId}`,
          hypothesisCount: (record.founders ?? []).reduce(
            (n, f) => n + (f.hypotheses?.length ?? 0),
            0,
          ),
          live: live === true,
        });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : "invite failed" }));
      }
    });
  });

  // Mints a short-lived signed URL so the ElevenLabs key never reaches the
  // browser, and returns the founder context as dynamic variables.
  use("/interview-session", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      res.setHeader("Content-Type", "application/json");
      try {
        const opportunity = JSON.parse(body || "{}");
        const signed = await getSignedUrl();
        if (!signed.ok) {
          res.statusCode = 501;
          res.end(JSON.stringify({ error: signed.reason }));
          return;
        }
        res.end(
          JSON.stringify({
            signedUrl: signed.signedUrl,
            dynamicVariables: buildDynamicVariables(opportunity),
          }),
        );
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : "session failed" }));
      }
    });
  });

  // Which integrations are live — drives the UI so it never offers a button
  // that cannot work. Deliberately left public (§32 read-only public):
  // service-configured booleans only, no business data, and it doubles as
  // the health-check probe (see waitForServer in the test suite).
  use("/integrations", (req, res, next) => {
    if (req.method !== "GET") return next();
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        resend: Boolean(serviceConfig("resend")),
        elevenlabs: Boolean(serviceConfig("elevenlabs")),
        detail: serviceStatus(),
      }),
    );
  });

  // Adaptive term sheets (feeds Martin's annotated-PDF work): POST a team
  // analysis, get thesis-based terms adapted to it + a per-change
  // explanation trail + markdown with stable TS-§n anchors for annotation.
  use("/term-sheet", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!requireInvestor(req, res)) return;
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      try {
        const analysis = JSON.parse(body || "{}");
        if (!analysis.company) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              error:
                "expected { company, askUsd?, founderScore?, founderScoreConfidence?, trustScore?, contradictions?, gaps?, softFlags?, axisCappedBy? }",
            }),
          );
          return;
        }
        const result = generateTermSheet(analysis);
        res.end(
          JSON.stringify({
            ...result,
            markdown: renderTermSheet(result),
            legalText: renderLegalTermSheet(result, { founders: analysis.founders ?? [] }),
          }),
        );
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : "invalid json" }));
      }
    });
  });

  // Sun's decks (pitch deck viewer pop-up) served straight from sun/deck.
  use("/sun-deck", async (req, res, next) => {
    try {
      const rel = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const file = join(SUN_DECK, normalize(rel).replace(/^([.\\/])+/, ""));
      if (!file.startsWith(SUN_DECK)) return next();
      const data = await readFile(file);
      res.setHeader(
        "Content-Type",
        extname(file) === ".html"
          ? "text/html; charset=utf-8"
          : extname(file) === ".mp3"
            ? "audio/mpeg"
            : (MIME[extname(file)] ?? "application/octet-stream"),
      );
      res.end(data);
    } catch {
      next();
    }
  });

  // laura/opportunity-db served as /opportunity-db/* directly from the single
  // source of truth — no copied data. The old copy used a cards/ subfolder;
  // laura keeps cards at the DB root, so that prefix is rewritten.
  use("/opportunity-db", async (req, res, next) => {
    if (!requireInvestor(req, res)) return;
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
}
