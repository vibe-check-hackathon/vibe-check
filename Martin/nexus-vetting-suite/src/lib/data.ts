import { OFFICIAL_STARTUPS } from "./official-opportunities";

export type Stage =
  | "Inbound"
  | "Screened"
  | "Interview"
  | "Reference"
  | "Diligence"
  | "Partner Review"
  | "Term Sheet"
  | "Portfolio";

export const STAGES: Stage[] = [
  "Inbound",
  "Screened",
  "Interview",
  "Reference",
  "Diligence",
  "Partner Review",
  "Term Sheet",
  "Portfolio",
];

export type FounderRef = {
  id?: string;
  name: string;
  role?: string;
  assessed?: boolean;
  avatar?: {
    type: "initials" | "image";
    value: string;
    basis?: string;
  };
  /** Synthetic-cohort founders only: fully generated contact + sub-scores. */
  email?: string;
  linkedin?: string;
  scores?: Record<string, number>;
  /** Why each sub-score is high or low — synthetic tier only, matches `scores`. */
  scoreRationale?: Record<string, string>;
  scoreConfidence?: number;
};

export type Startup = {
  id: string;
  company: string;
  oneLiner: string;
  founders: FounderRef[];
  stage: Stage;
  sector: string;
  geography: string;
  round: string;
  ask: string;
  /**
   * Real founders sourced from public data are intentionally NOT scored — the
   * suite never fabricates psychometric judgments of real people. Only the
   * fictional demo opportunity (Acme) is `assessed`.
   */
  assessed: boolean;
  founderScore: number | null;
  marketScore: number | null;
  ideaMarketScore: number | null;
  trustScore: number | null;
  urgency: "Low" | "Medium" | "High";
  submitted: string;
  thesisFit: number | null;
  /** Verified real-world outcome (public), if any. */
  realEvent?: string;
  /** Public founder interview URL, if one exists. */
  interviewUrl?: string | null;
  /** Public website, if captured in the opportunity DB. */
  website?: string | null;
  /** Static logo copied from Laura's opportunity DB assets into Martin's public folder. */
  logoUrl?: string | null;
  /** Static markdown card copied into Martin's public folder. */
  sourceCardUrl?: string | null;
  /** Historical portfolio status from the official card. */
  companyStatus?: string | null;
  /** Investment vehicle or source program, when known. */
  vehicle?: string | null;
  /** Portfolio year, when known. */
  portfolioYear?: number | null;
  /** The single fictional card that powers the live interview + psychogram demo. */
  demo?: boolean;
  /** Faker-generated cohort from laura/opportunity-db/synthetic — nobody real. */
  synthetic?: boolean;
  /** Synthetic demo opportunity that represents a current inbound application. */
  currentApplication?: boolean;
  /** Public-source real startup selected for outbound research. */
  outboundSelected?: boolean;
  /** Source channel for board filtering and detail labels. */
  sourceChannel?: string;
  /** First-pass thesis screen, for cards that arrived through the apply form. */
  screening?: { pass: boolean; hardFails: string[]; softFlags: string[] };
  /** Public activity signal behind an outbound-selected record. */
  activitySignal?: string | null;
  /** Why the company was selected for outbound. */
  outboundRationale?: string | null;
  /** Source URLs backing outbound-selected records. */
  sources?: { label: string; url: string }[];
};

/**
 * Pipeline = the real Maschmeyer Group opportunity DB (public sources only,
 * from `laura/opportunity-db`) + one fictional demo card (Acme) that the live
 * interview studio and founder psychogram run on. Real founders stay unassessed.
 */
const ACME_STARTUP: Startup = {
  id: "acme",
  company: "Acme Robotics",
  oneLiner:
    "Vision-guided picking software - warehouse robots learn new objects from a short operator demonstration.",
  founders: [
    {
      id: "FND-0007",
      name: "Ada Keller",
      role: "CEO",
      assessed: true,
      avatar: { type: "initials", value: "AK", basis: "fictional demo founder" },
    },
    {
      id: "FND-0008",
      name: "Minh Tran",
      role: "CTO",
      assessed: true,
      avatar: { type: "initials", value: "MT", basis: "fictional demo founder" },
    },
  ],
  stage: "Interview",
  sector: "Robotics / AI",
  geography: "Berlin, DE",
  round: "Pre-seed",
  ask: "EUR 1.2M",
  assessed: true,
  founderScore: 76,
  marketScore: 62,
  ideaMarketScore: 58,
  trustScore: 55,
  urgency: "High",
  submitted: "2026-07-18",
  thesisFit: 0.72,
  interviewUrl: null,
  demo: true,
};

export const STARTUPS: Startup[] = [
  ACME_STARTUP,
  ...OFFICIAL_STARTUPS,
];

export const METRICS = {
  activeApplications: STARTUPS.length,
  assessedDeals: STARTUPS.filter((s) => s.assessed).length,
  publicOutcomes: STARTUPS.filter((s) => s.realEvent).length,
  diligenceInProgress: STARTUPS.filter((s) => s.stage === "Diligence" || s.stage === "Partner Review").length,
  decisionsDue24h: STARTUPS.filter((s) => s.stage === "Partner Review" || s.stage === "Term Sheet").length || 1,
  interviewsAvailable: STARTUPS.filter((s) => s.interviewUrl).length,
};

export const FUNNEL = [
  { stage: "Sourcing", count: 214, delta: "public + inbound" },
  { stage: "Screening", count: STARTUPS.length, delta: `${OFFICIAL_STARTUPS.length} official + 1 demo` },
  { stage: "Interview", count: 1, delta: "Acme - live" },
  { stage: "Diligence", count: METRICS.diligenceInProgress, delta: "confidential" },
  { stage: "Portfolio", count: OFFICIAL_STARTUPS.length, delta: "official cards" },
];

export function stageColor(stage: Stage) {
  const map: Record<Stage, string> = {
    Inbound: "bg-muted text-muted-foreground",
    Screened: "bg-accent text-accent-foreground",
    Interview: "bg-teal-soft text-foreground",
    Reference: "bg-teal-soft text-foreground",
    Diligence: "bg-teal-soft text-foreground",
    "Partner Review": "bg-primary/10 text-primary",
    "Term Sheet": "bg-primary text-primary-foreground",
    Portfolio: "bg-primary/10 text-primary",
  };
  return map[stage];
}

export function founderNames(founders: FounderRef[]) {
  return founders.map((f) => f.name).join(", ");
}

export function founderInitials(founder: FounderRef) {
  if (founder.avatar?.type === "initials") return founder.avatar.value;
  return founder.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/*
  {
    id: "acme",
    company: "Acme Robotics",
    oneLiner:
      "Vision-guided picking software — warehouse robots learn new objects from a short operator demonstration.",
    founders: ["Ada Keller", "Minh Tran"],
    stage: "Interview",
    sector: "Robotics / AI",
    geography: "Berlin, DE",
    round: "Pre-seed",
    ask: "€1.2M",
    assessed: true,
    founderScore: 76,
    marketScore: 62,
    ideaMarketScore: 58,
    trustScore: 55,
    urgency: "High",
    submitted: "2026-07-18",
    thesisFit: 0.72,
    interviewUrl: null,
    demo: true,
  },
  {
    id: "secfix",
    company: "Secfix",
    oneLiner:
      "Europe's AI security-compliance platform — cuts ISO 27001 / SOC 2 / GDPR work up to 90% for SMBs.",
    founders: ["Fabiola Munguia", "Grigory Emelianov"],
    stage: "Term Sheet",
    sector: "Security / Compliance",
    geography: "Berlin / Munich, DE",
    round: "Series A",
    ask: "$12M",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Medium",
    submitted: "2026-02-24",
    thesisFit: null,
    realEvent: "$12M Series A led by ALSTIN Capital (announced 2026-02-25)",
    interviewUrl: "https://www.youtube.com/watch?v=k_Rkq40O3kU",
  },
  {
    id: "deskbird",
    company: "deskbird",
    oneLiner:
      "Hybrid-workplace management — desk and meeting-room booking for flexible offices.",
    founders: ["Ivan Cossu", "Jonas Hess"],
    stage: "Term Sheet",
    sector: "Workplace SaaS",
    geography: "St. Gallen, CH",
    round: "Series A",
    ask: "$13M",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Medium",
    submitted: "2023-09-01",
    thesisFit: null,
    realEvent:
      "$13M Series A led by ALSTIN Capital & AXA Venture Partners (announced 2023-09-06)",
    interviewUrl: "https://www.youtube.com/watch?v=Flx_ZmOau68",
  },
  {
    id: "voiceline",
    company: "VoiceLine",
    oneLiner:
      "Voice AI for enterprise frontline sales — capture field data hands-free, straight into the CRM.",
    founders: ["Dr. Nicolas Höflinger"],
    stage: "Term Sheet",
    sector: "Voice AI",
    geography: "Munich, DE",
    round: "Series A",
    ask: "€10M",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Low",
    submitted: "2026-02-20",
    thesisFit: null,
    realEvent: "€10M Series A led by ALSTIN Capital & Peak (announced 2026-02-24)",
    interviewUrl: null,
  },
  {
    id: "timefold",
    company: "Timefold",
    oneLiner:
      "Scheduling and routing optimization engine — an open-source planning solver for operations.",
    founders: ["—"],
    stage: "Screened",
    sector: "Optimization",
    geography: "Unverified",
    round: "—",
    ask: "—",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Low",
    submitted: "2026-07-19",
    thesisFit: null,
    realEvent: "Maschmeyer portfolio listing (unverified)",
    interviewUrl: null,
  },
  {
    id: "climatiq",
    company: "Climatiq",
    oneLiner:
      "Carbon-intelligence API — embed emissions calculations into any software product.",
    founders: ["—"],
    stage: "Screened",
    sector: "Climate / Data",
    geography: "Berlin, DE",
    round: "—",
    ask: "—",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Low",
    submitted: "2026-07-19",
    thesisFit: null,
    realEvent: "Maschmeyer portfolio listing (unverified)",
    interviewUrl: null,
  },
  {
    id: "pliant",
    company: "Pliant",
    oneLiner:
      "Adaptable corporate cards and spend management with API-based card issuing.",
    founders: ["—"],
    stage: "Screened",
    sector: "Fintech",
    geography: "Berlin, DE",
    round: "—",
    ask: "—",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Low",
    submitted: "2026-07-19",
    thesisFit: null,
    realEvent: "Maschmeyer portfolio listing (unverified)",
    interviewUrl: null,
  },
];

export const METRICS = {
  activeApplications: 7,
  assessedDeals: 1,
  publicOutcomes: 4,
  diligenceInProgress: 3,
  decisionsDue24h: 1,
  interviewsAvailable: 2,
};

export const FUNNEL = [
  { stage: "Sourcing", count: 214, delta: "public + inbound" },
  { stage: "Screening", count: 7, delta: "6 real · 1 demo" },
  { stage: "Interview", count: 1, delta: "Acme · live" },
  { stage: "Diligence", count: 3, delta: "confidential" },
  { stage: "Term Sheet", count: 3, delta: "ALSTIN-led (real)" },
];

export function stageColor(stage: Stage) {
  const map: Record<Stage, string> = {
    Inbound: "bg-muted text-muted-foreground",
    Screened: "bg-accent text-accent-foreground",
    Interview: "bg-teal-soft text-foreground",
    Reference: "bg-teal-soft text-foreground",
    Diligence: "bg-teal-soft text-foreground",
    "Partner Review": "bg-primary/10 text-primary",
    "Term Sheet": "bg-primary text-primary-foreground",
  };
  return map[stage];
}
*/

/* ------------------------------------------------------------------ */
/*  Retrospective evaluation: what the card was judged against, and    */
/*  how the company actually turned out (public record).               */
/* ------------------------------------------------------------------ */

/** The thesis criteria every card is evaluated against (THESIS-001). */
export const EVALUATION_CRITERIA = [
  { criterion: "Sector", requirement: "B2B software / enterprise technology" },
  { criterion: "Stage", requirement: "Pre-seed to Series A entry" },
  { criterion: "Geography", requirement: "Europe (ALSTIN) · US (MGV.VC)" },
  { criterion: "Evidence", requirement: "Claims sourced, trust-scored 0-100; unknown ≠ false" },
  { criterion: "Founder axes", requirement: "Resilience · Autonomy · Curiosity · Perseverance · Co-founder fit" },
];

export type Outcome = {
  label: string;
  tone: "positive" | "warning" | "negative" | "outline";
};

/** Real-life outcome derived from public status + follow-on funding record. */
export function outcomeOf(s: Startup): Outcome | null {
  if (s.demo || s.synthetic) return null;
  switch (s.companyStatus) {
    case "acquired":
      return { label: "Success — acquired", tone: "positive" };
    case "inactive":
      return { label: "Inactive — no longer operating", tone: "negative" };
    case "active_rebrand":
      return { label: "Active — rebranded", tone: "outline" };
    case "unclear":
      return { label: "Outcome unclear", tone: "warning" };
  }
  const record = `${s.realEvent ?? ""} ${s.oneLiner}`.toLowerCase();
  if (/series [bcd]/.test(record)) {
    return { label: "Success signal — raised follow-on capital", tone: "positive" };
  }
  return { label: "Active portfolio company", tone: "outline" };
}

export function scoreTone(n: number | null) {
  if (n === null) return "text-muted-foreground";
  if (n >= 80) return "text-positive";
  if (n >= 65) return "text-foreground";
  if (n >= 50) return "text-warning";
  return "text-negative";
}

/** Render a score, or an em-dash for unassessed real founders. */
export function fmtScore(n: number | null) {
  return n === null ? "—" : String(n);
}

/* ------------------------------------------------------------------ */
/*  Acme demo — the fictional card the live interview + psychogram use */
/*  (mirrors laura/frontend + sun/opportunity-card-example.md)         */
/* ------------------------------------------------------------------ */

export type Axis = { key: string; full: string; v: number; conf: number };

export type DemoFounder = {
  id: string;
  name: string;
  role: string;
  initials: string;
  score: number;
  confidence: number;
  trend: "improving" | "stable";
  history: string;
  axes: Axis[];
};

export const AXIS_FULL: Record<string, string> = {
  Resilience: "Resilience / emotional stability",
  Autonomy: "Autonomy / self-reliance",
  Curiosity: "Curiosity / adaptability",
  Perseverance: "Perseverance",
  "Co-founder fit": "Co-founder complementarity",
};

export const ACME_FOUNDERS: DemoFounder[] = [
  {
    id: "FND-0007",
    name: "Ada Keller",
    role: "CEO",
    initials: "AK",
    score: 76,
    confidence: 60,
    trend: "improving",
    history:
      "Former robotics research engineer; led a picking-system deployment at two distribution centres. Full-time since Jan 2026.",
    axes: [
      { key: "Resilience", full: AXIS_FULL.Resilience, v: 82, conf: 62 },
      { key: "Autonomy", full: AXIS_FULL.Autonomy, v: 80, conf: 60 },
      { key: "Curiosity", full: AXIS_FULL.Curiosity, v: 77, conf: 55 },
      { key: "Perseverance", full: AXIS_FULL.Perseverance, v: 74, conf: 52 },
      { key: "Co-founder fit", full: AXIS_FULL["Co-founder fit"], v: 75, conf: 50 },
    ],
  },
  {
    id: "FND-0008",
    name: "Minh Tran",
    role: "CTO",
    initials: "MT",
    score: 72,
    confidence: 62,
    trend: "stable",
    history:
      "Published relevant imitation-learning research and built the current product prototype. Model IP ownership not yet documented (GAP-002).",
    axes: [
      { key: "Resilience", full: AXIS_FULL.Resilience, v: 68, conf: 55 },
      { key: "Autonomy", full: AXIS_FULL.Autonomy, v: 79, conf: 65 },
      { key: "Curiosity", full: AXIS_FULL.Curiosity, v: 83, conf: 66 },
      { key: "Perseverance", full: AXIS_FULL.Perseverance, v: 70, conf: 52 },
      { key: "Co-founder fit", full: AXIS_FULL["Co-founder fit"], v: 75, conf: 50 },
    ],
  },
];

export const ACME_TEAM = {
  score: 71,
  confidence: 55,
  components: [
    {
      name: "Skill complementarity",
      v: 85,
      why: "Commercial CEO × technical CTO — different critical functions, not duplicate strengths.",
    },
    {
      name: "Decision clarity",
      v: 74,
      why: "Both founders describe the same decision process and split product vs. commercial calls cleanly.",
    },
    {
      name: "Pressure-tested history",
      v: 45,
      why: "Conflict handling not yet observed under real pressure — the ceiling-gating component.",
    },
  ],
  note: "Scored as a pair, never as an average of the two founders. Per Wasserman, ~65% of startup failures trace to people problems, so the co-founder dynamic carries its own gated score.",
};

/**
 * The signed-in investor. Single source for the header, settings and the
 * diligence activity log.
 *
 * `avatarUrl` points at the photo in `public/`. Set it to null to fall back to
 * initials.
 */
export const INVESTOR = {
  name: "Carl-Philipp Beichert",
  initials: "CB",
  role: "Partner · Screening lead",
  avatarUrl: "/carl-philipp-beichert.jpg" as string | null,
};
