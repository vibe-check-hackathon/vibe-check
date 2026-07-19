// Loads thesis.json (the single source of fund criteria) and flattens the
// fields the Developing stage consumes. Full structure stays available on
// `raw` for founder scoring and the interview agent.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function loadThesis() {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = JSON.parse(readFileSync(join(here, "..", "thesis.json"), "utf8"));
  return {
    raw,
    sectors: raw.fund.sectors,
    maxCheckUsd: raw.fund.checkSizeUsd.max,
    targetOwnership: raw.fund.targetOwnership,
    maxOpenGaps: raw.fund.maxOpenGaps,
    compsMultiple: raw.negotiation.compsMultiple,
    founderAskMultiple: raw.negotiation.founderAskMultiple,
    batnaRef: raw.negotiation.batnaRef,
    levers: raw.negotiation.levers,
  };
}
