import type { Startup, Stage } from "./data";

/*
 * Loads current application demos plus outbound-selected public records from
 * laura/opportunity-db/synthetic. Current applications are fictional and can
 * carry full demo scores. Outbound records are real public-source startups and
 * remain unassessed.
 */

const STATUS_TO_STAGE: Record<string, Stage> = {
  intake: "Inbound",
  research: "Screened",
  outreach: "Screened",
  intro: "Interview",
  interview: "Interview",
  diligence: "Diligence",
  decision: "Partner Review",
  partner_review: "Partner Review",
  watchlist: "Inbound",
};

type SyntheticFounder = {
  id: string;
  name: string;
  sex?: string;
  role: string;
  avatar?: string | { type: "initials"; value: string; basis?: string };
  email?: string;
  linkedin?: string;
  linkedinSearch?: string;
  scores?: Record<string, number>;
  scoreConfidence?: number;
};

type SyntheticOpp = {
  id: string;
  company: string;
  sector: string;
  location: string;
  card: string;
  logo?: string;
  status: string;
  oneLiner: string;
  stage: string;
  raiseUsd: number;
  website: string;
  founders: SyntheticFounder[];
};

type OutboundOpp = SyntheticOpp & {
  outboundSelected: true;
  realCompany: true;
  currentAsOf: string;
  latestRound?: string;
  outboundRationale?: string;
  activitySignal?: string;
  sources?: { label: string; url: string }[];
};

function moneyLabel(amount?: number) {
  if (!amount) return "Public record";
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(amount % 1000000000 ? 1 : 0)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(amount % 1000000 ? 1 : 0)}M`;
  return `$${amount.toLocaleString()}`;
}

function mapCurrentApplication(o: SyntheticOpp): Startup {
  return {
    id: o.id,
    company: o.company,
    oneLiner: `${o.oneLiner} (current application - fictional company)`,
    founders: o.founders.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      assessed: true,
      avatar: {
        type: "image" as const,
        value: `/opportunity-db/synthetic/${f.avatar}`,
        basis: "AI-generated portrait; fictional person",
      },
      email: f.email,
      linkedin: f.linkedin,
      scores: f.scores,
      scoreConfidence: f.scoreConfidence,
    })),
    stage: STATUS_TO_STAGE[o.status] ?? "Inbound",
    sector: o.sector,
    geography: o.location,
    round: o.stage,
    ask: moneyLabel(o.raiseUsd),
    assessed: true,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Medium",
    submitted: "2026-07-19",
    thesisFit: null,
    website: o.website,
    logoUrl: o.logo ? `/opportunity-db/synthetic/${o.logo}` : null,
    sourceCardUrl: `/opportunity-db/synthetic/${o.card}`,
    synthetic: true,
    currentApplication: true,
    sourceChannel: "current_application",
  };
}

function mapOutboundSelected(o: OutboundOpp): Startup {
  return {
    id: o.id,
    company: o.company,
    oneLiner: `${o.oneLiner} (outbound selected - public source record)`,
    founders: o.founders.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      assessed: false,
      avatar: typeof f.avatar === "object" ? f.avatar : undefined,
      linkedin: f.linkedinSearch,
    })),
    stage: STATUS_TO_STAGE[o.status] ?? "Screened",
    sector: o.sector,
    geography: o.location,
    round: o.stage,
    ask: moneyLabel(o.raiseUsd),
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: o.status === "diligence" || o.status === "partner_review" ? "High" : "Medium",
    submitted: o.currentAsOf,
    thesisFit: null,
    realEvent: o.latestRound,
    website: o.website,
    logoUrl: o.logo ? `/opportunity-db/synthetic/${o.logo}` : null,
    sourceCardUrl: `/opportunity-db/synthetic/${o.card}`,
    outboundSelected: true,
    sourceChannel: "outbound_selected",
    activitySignal: o.activitySignal,
    outboundRationale: o.outboundRationale,
    sources: o.sources,
  };
}

/* Client-side mirror of the canonical first-pass screen in
 * laura/pipeline/lib/screening.js: late-stage rounds and billion-scale
 * valuations are off-thesis (Pre-seed/Seed entry, ~$100K checks) and must
 * never reach the board — keep in sync with the canonical rules. */
function offThesis(o: OutboundOpp): boolean {
  const t = [o.stage, o.latestRound].filter(Boolean).join(" ").toLowerCase();
  return /series\s+[b-z]\b/.test(t) || /\d+(?:[.,]\d+)?\s*b(?:illion|\b)/.test(t);
}

export async function loadSyntheticStartups(): Promise<Startup[]> {
  const res = await fetch("/opportunity-db/synthetic/index.json");
  if (!res.ok) return [];
  const db = (await res.json()) as {
    opportunities?: SyntheticOpp[];
    currentApplications?: SyntheticOpp[];
    outboundSelected?: OutboundOpp[];
  };
  const currentApplications = db.currentApplications ?? db.opportunities ?? [];
  const outboundSelected = (db.outboundSelected ?? []).filter((o) => !offThesis(o));
  return [
    ...currentApplications.map(mapCurrentApplication),
    ...outboundSelected.map(mapOutboundSelected),
  ];
}
