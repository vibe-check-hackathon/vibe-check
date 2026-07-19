#!/usr/bin/env node
/* Configure the third-party services before a demo.
 *
 *   node laura/pipeline/set-service-key.js resend re_… --from "FirstCheck <hello@yourdomain.com>"
 *   node laura/pipeline/set-service-key.js elevenlabs xi-… --agent agent_…
 *   node laura/pipeline/set-service-key.js --status
 *   node laura/pipeline/set-service-key.js --clear
 *   node laura/pipeline/set-service-key.js --agent-brief    print the agent system prompt
 *
 * Saved to laura/pipeline/.service-keys.json (gitignored). Env vars override:
 * RESEND_API_KEY / RESEND_FROM / ELEVENLABS_API_KEY / ELEVENLABS_AGENT_ID.
 */

import { createInterface } from "node:readline/promises";
import { saveServiceKey, clearServiceKeys, serviceStatus, SERVICES } from "./lib/service-keys.js";
import { buildAgentBrief } from "./lib/interview-agent.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};

if (args.includes("--status")) {
  console.log(serviceStatus().join("\n"));
  process.exit(0);
}
if (args.includes("--clear")) {
  clearServiceKeys();
  console.log("service keys removed.");
  process.exit(0);
}
if (args.includes("--agent-brief")) {
  console.log(buildAgentBrief());
  process.exit(0);
}

const from = flag("--from");
const agentId = flag("--agent");
const [service, keyArg] = args.filter((a) => !a.startsWith("--"));

if (!SERVICES.includes(service)) {
  console.error(`usage: set-service-key.js <${SERVICES.join("|")}> <key> [--from "…"] [--agent agent_…]`);
  process.exit(1);
}

let key = keyArg;
if (!key) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  key = (await rl.question(`Paste the ${service} API key: `)).trim();
  rl.close();
}
if (!key) {
  console.error("no key entered — nothing saved.");
  process.exit(1);
}

if (service === "elevenlabs" && !agentId) {
  console.error("elevenlabs needs an agent: --agent agent_…  (create it in the ElevenLabs dashboard)");
  process.exit(1);
}

saveServiceKey(service, service === "resend" ? { key, from } : { key, agentId });
console.log(serviceStatus().join("\n"));
if (service === "resend" && !from) {
  console.log("\nno --from given, so the Resend sandbox sender is used.");
  console.log("Unverified domains can only deliver to your own address or delivered@resend.dev.");
}
if (service === "elevenlabs") {
  console.log("\nPaste this into the agent's system prompt (also: --agent-brief):\n");
  console.log(buildAgentBrief());
}
