import syntheticDb from "../../../../laura/opportunity-db/synthetic/index.json";
import type { Stage, Startup } from "./data";

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
  scoreRationale?: Record<string, string>;
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
  realCompany: boolean;
  currentAsOf: string;
  latestRound?: string;
  outboundRationale?: string;
  activitySignal?: string;
  sources?: { label: string; url: string }[];
  /** Added by the live LLM scan (POST /outbound-scan) rather than the research doc. */
  freshScan?: boolean;
  verification?: string;
  screening?: { pass: boolean; hardFails: string[]; softFlags: string[] };
};

function moneyLabel(amount?: number) {
  if (!amount) return "Public record";
  if (amount >= 1000000000)
    return `$${(amount / 1000000000).toFixed(amount % 1000000000 ? 1 : 0)}B`;
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
        type: "initials" as const,
        value: f.name
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2),
      },
      email: f.email,
      linkedin: f.linkedin,
      scores: f.scores,
      scoreRationale: f.scoreRationale,
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
    logoUrl: null,
    sourceCardUrl: null,
    synthetic: true,
    currentApplication: true,
    sourceChannel: "current_application",
  };
}

function mapOutboundSelected(o: OutboundOpp): Startup {
  return {
    id: o.id,
    company: o.company,
    oneLiner: `${o.oneLiner} ${
      o.freshScan
        ? o.verification === "web-searched"
          ? "(live scan - web-sourced, verify before outreach)"
          : "(live scan - UNVERIFIED model recall)"
        : "(outbound selected - public source record)"
    }`,
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
    logoUrl: null,
    sourceCardUrl: null,
    outboundSelected: true,
    sourceChannel: "outbound_selected",
    activitySignal: o.activitySignal,
    outboundRationale: o.outboundRationale,
    sources: o.sources,
    screening: o.screening,
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

/* Loaded once per session, then served from memory: navigating away from the
 * board and back must not make the synthetic/outbound deals flicker out and
 * refetch — they should already be there. */
let cache: Promise<Startup[]> | null = null;
const SCANNED_KEY = "vibecheck-demo-outbound-scans";

/** Force the next load to refetch — call after the live outbound scan adds records. */
export function invalidateSyntheticCache() {
  cache = null;
}

export function loadSyntheticStartups(): Promise<Startup[]> {
  cache ??= fetchSyntheticStartups().catch((e) => {
    cache = null; // failed fetch must not poison the session — retry next mount
    throw e;
  });
  return cache;
}

async function fetchSyntheticStartups(): Promise<Startup[]> {
  const db = syntheticDb as {
    opportunities?: SyntheticOpp[];
    currentApplications?: SyntheticOpp[];
    outboundSelected?: OutboundOpp[];
  };
  const currentApplications = db.currentApplications ?? db.opportunities ?? [];
  const scanned = JSON.parse(localStorage.getItem(SCANNED_KEY) ?? "[]") as OutboundOpp[];
  const outboundSelected = [...scanned, ...(db.outboundSelected ?? [])].filter(
    (o) => !offThesis(o),
  );
  return [
    ...currentApplications.map(mapCurrentApplication),
    ...outboundSelected.map(mapOutboundSelected),
  ];
}

const DEMO_SCANS: Record<string, OutboundOpp> = {
  europe: {
    id: "OPP-DEMO-SCAN-EU",
    company: "VectorForge",
    sector: "AI infrastructure",
    location: "Paris, FR",
    card: "",
    status: "research",
    oneLiner: "Evaluation infrastructure for production AI agents",
    stage: "Seed",
    raiseUsd: 2500000,
    website: "https://vectorforge.example",
    founders: [{ id: "FND-DEMO-EU", name: "Demo Founder", role: "CEO" }],
    outboundSelected: true,
    realCompany: false,
    currentAsOf: "2026-07-20",
    freshScan: true,
    verification: "demo-simulation",
    outboundRationale: "Bundled fictional lead matching the browser demo thesis.",
  },
  us: {
    id: "OPP-DEMO-SCAN-US",
    company: "CircuitPilot",
    sector: "robotics",
    location: "Boston, US",
    card: "",
    status: "research",
    oneLiner: "Adaptive controls for small industrial robot fleets",
    stage: "Pre-seed",
    raiseUsd: 1400000,
    website: "https://circuitpilot.example",
    founders: [{ id: "FND-DEMO-US", name: "Demo Founder", role: "CEO" }],
    outboundSelected: true,
    realCompany: false,
    currentAsOf: "2026-07-20",
    freshScan: true,
    verification: "demo-simulation",
    outboundRationale: "Bundled fictional lead for the static scan interaction.",
  },
  china: {
    id: "OPP-DEMO-SCAN-CN",
    company: "MotionLayer",
    sector: "robotics",
    location: "Shenzhen, CN",
    card: "",
    status: "research",
    oneLiner: "Machine-vision calibration for flexible manufacturing cells",
    stage: "Seed",
    raiseUsd: 3000000,
    website: "https://motionlayer.example",
    founders: [{ id: "FND-DEMO-CN", name: "Demo Founder", role: "CEO" }],
    outboundSelected: true,
    realCompany: false,
    currentAsOf: "2026-07-20",
    freshScan: true,
    verification: "demo-simulation",
    outboundRationale: "Bundled fictional lead for the static scan interaction.",
  },
};

export async function runDemoOutboundScan(region: "europe" | "us" | "china") {
  const stored = JSON.parse(localStorage.getItem(SCANNED_KEY) ?? "[]") as OutboundOpp[];
  const candidate = DEMO_SCANS[region];
  const added = stored.some((item) => item.id === candidate.id) ? 0 : 1;
  if (added) localStorage.setItem(SCANNED_KEY, JSON.stringify([candidate, ...stored]));
  invalidateSyntheticCache();
  return { added, mode: "demo-simulation", companies: added ? [candidate.company] : [] };
}
