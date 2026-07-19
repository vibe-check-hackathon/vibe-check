#!/usr/bin/env node
/* Enter the LLM API key in a terminal before launching the app.
 * Saved to laura/pipeline/.llm-key.json (gitignored) for 24 hours.
 *
 *   node laura/pipeline/set-key.js                     interactive prompt
 *   node laura/pipeline/set-key.js sk-ant-…            pass the key directly
 *   node laura/pipeline/set-key.js --base-url http://localhost:11434 --model llama3.1 ollama
 *   node laura/pipeline/set-key.js --status            show what is active
 *   node laura/pipeline/set-key.js --clear             forget the saved key
 */

import { createInterface } from "node:readline/promises";
import { saveKey, clearKey, keyStatus } from "./lib/llm.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};

if (args.includes("--status")) {
  console.log(keyStatus());
  process.exit(0);
}
if (args.includes("--clear")) {
  clearKey();
  console.log("saved key removed.");
  process.exit(0);
}

const baseUrl = flag("--base-url");
const model = flag("--model");
let key = args.find((a) => !a.startsWith("--"));

if (!key) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  key = (await rl.question("Paste your API key (sk-ant-… for Claude, sk-… for OpenAI): ")).trim();
  rl.close();
}
if (!key) {
  console.error("no key entered — nothing saved.");
  process.exit(1);
}

const { provider, expiresAt } = saveKey({ key, baseUrl, model });
console.log(`saved: ${provider}${baseUrl ? ` @ ${baseUrl}` : ""}${model ? `, model ${model}` : ""}`);
console.log(`valid for 24h (until ${expiresAt}). The dev server picks it up on the next request — no restart needed.`);
