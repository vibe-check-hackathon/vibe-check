// First-pass screening (challenge brief MVP #4: "a fast first-pass filter
// removes clearly non-viable ideas before full analysis begins") — and the
// thesis lens for outbound identification (#5): a scan hit is scored the same
// way as an inbound application, so off-thesis companies (late-stage, unicorn
// valuations — e.g. an ElevenLabs) never reach the board.
//
// Canonical rules live HERE, parameterized by thesis.json. The nexus loader
// mirrors the stage guard client-side; keep both in sync.

/** Hard signals that a company is beyond the fund's entry stage. */
const LATE_STAGE = /series\s+[b-z]\b/i;
const UNICORN_VALUATION = /(\d+(?:[.,]\d+)?)\s*b(?:illion|\b)/i; // "$1.8B", "EUR 11.7B", "billion"
const EARLY_STAGE = /pre-?seed|seed|series\s+a\b/i;

/**
 * Screen one opportunity record against the fund thesis.
 * Returns { pass, hardFails, softFlags } — hard fails remove the record from
 * the funnel; soft flags ride along into full analysis.
 */
export function screenOpportunity(record, thesis) {
  const hardFails = [];
  const softFlags = [];
  const roundText = [record.stage, record.round, record.latestRound, record.realEvent]
    .filter(Boolean)
    .join(" ");

  if (LATE_STAGE.test(roundText)) {
    hardFails.push(`beyond entry stage (${roundText.match(LATE_STAGE)[0]}); thesis allows ${thesis.raw?.fund.stages?.join("/") ?? "Pre-seed/Seed"} entry`);
  }
  if (UNICORN_VALUATION.test(roundText)) {
    hardFails.push("billion-scale valuation — a $" + (thesis.maxCheckUsd / 1e3) + "K check is not a credible lead position");
  }
  if (roundText && !EARLY_STAGE.test(roundText) && !hardFails.length) {
    softFlags.push("stage unclear from public record — confirm during research");
  }
  const sectorText = `${record.sector ?? ""} ${record.oneLiner ?? ""}`.toLowerCase();
  if (thesis.sectors?.length && !thesis.sectors.some((s) => sectorText.includes(s.toLowerCase().split(" ")[0]))) {
    softFlags.push(`sector outside stated thesis (${thesis.sectors.join(", ")}) — flag for investor judgment`);
  }

  return { pass: hardFails.length === 0, hardFails, softFlags };
}

/** Convenience: split a batch into funnel-worthy and screened-out. */
export function screenBatch(records, thesis) {
  const admitted = [];
  const screenedOut = [];
  for (const record of records) {
    const result = screenOpportunity(record, thesis);
    (result.pass ? admitted : screenedOut).push({ record, result });
  }
  return { admitted, screenedOut };
}
