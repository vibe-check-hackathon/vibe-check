#!/usr/bin/env node
// Proves the repo actually deploys — clones the current commit into a fresh
// temp directory (so no local-only state, stray node_modules, or uncommitted
// fix can hide a real problem), then runs exactly what render.yaml runs:
// npm install, NITRO_PRESET=node-server build, node app-server.js — and
// checks the result over real HTTP, the same way Render's health check and
// a first visitor would.
//
// Usage: node laura/pipeline/verify-deploy.js
//
// This checks what's COMMITTED, not what's pushed — run it after `git add`
// + `git commit`, before `git push`, as the last gate.

import { spawn, execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = 8099;
const BASE = `http://127.0.0.1:${PORT}`;

function log(msg) {
  console.log(`  ➜  ${msg}`);
}

function run(cmd, args, opts) {
  // shell: true so `npm` resolves on Windows (npm.cmd) as well as POSIX —
  // safe here because every call site passes fixed, non-user-supplied argv.
  execFileSync(cmd, args, { stdio: "inherit", shell: true, ...opts });
}

async function waitFor(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function check(name, fn) {
  try {
    const ok = await fn();
    console.log(`  ${ok ? "✓" : "✗"} ${name}`);
    return ok;
  } catch (e) {
    console.log(`  ✗ ${name} — ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

let tempDir;
let child;
let failures = 0;

try {
  tempDir = await mkdtemp(join(tmpdir(), "firstcheck-deploy-verify-"));
  log(`cloning HEAD into ${tempDir}`);
  run("git", ["clone", "--quiet", REPO_ROOT, tempDir]);

  log("npm install (Martin/nexus-vetting-suite)");
  run("npm", ["install", "--silent"], { cwd: join(tempDir, "Martin", "nexus-vetting-suite") });

  log("build (NITRO_PRESET=node-server)");
  run("npm", ["run", "build"], {
    cwd: join(tempDir, "Martin", "nexus-vetting-suite"),
    env: { ...process.env, NITRO_PRESET: "node-server" },
  });

  log(`starting app-server.js on :${PORT}`);
  child = spawn(process.execPath, [join(tempDir, "laura", "pipeline", "app-server.js")], {
    cwd: tempDir,
    env: { ...process.env, PORT: String(PORT) },
    stdio: "ignore",
  });

  if (!(await waitFor(`${BASE}/integrations`, 20000))) {
    throw new Error("server never became healthy — see render.yaml's healthCheckPath");
  }
  log("server is up — running checks");

  const results = await Promise.all([
    check("health check (/integrations) is public and healthy", async () => (await fetch(`${BASE}/integrations`)).ok),
    check("public page (/) renders", async () => (await fetch(`${BASE}/`, { redirect: "follow" })).ok),
    check("public apply page (/apply) renders", async () => (await fetch(`${BASE}/apply`)).ok),
    check("protected route (/applications) rejects anonymous requests", async () => (await fetch(`${BASE}/applications`)).status === 401),
    check("seeded investor can log in", async () => (await fetch(`${BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email: "investor@firstcheck.demo", password: "growth-signal" }),
    })).ok),
  ]);
  failures = results.filter((ok) => !ok).length;
} finally {
  child?.kill();
  // app-server.js spawns its own SSR child process; on Windows the OS can
  // take a moment to release its file handles after kill() returns, so a
  // bare rm() can race it with EBUSY. Give it a beat, then retry.
  if (tempDir) {
    await new Promise((r) => setTimeout(r, 500));
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await rm(tempDir, { recursive: true, force: true });
        break;
      } catch (e) {
        if (attempt === 5) console.error(`cleanup warning: could not remove ${tempDir}: ${e.message}`);
        else await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — this commit would NOT deploy cleanly.`);
  process.exit(1);
}
console.log("\nAll checks passed — this commit deploys cleanly (same build+start Render runs).");
