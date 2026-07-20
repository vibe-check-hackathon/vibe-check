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
   * team demo opportunity (FirstCheck) is `assessed`.
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
 * from `laura/opportunity-db`) + the team's own demo card (FirstCheck) that the live
 * interview studio and founder psychogram run on. Real founders stay unassessed.
 */
const ACME_STARTUP: Startup = {
  id: "firstcheck",
  company: "FirstCheck",
  oneLiner:
    "AI-native first-check screening for venture funds - evidence-backed founder profiles and an agent interview that turns an inbound application into a decision memo in 24 hours.",
  founders: [
    {
      id: "FND-0007",
      name: "Martin Auer",
      role: "CEO",
      assessed: true,
      avatar: { type: "initials", value: "MA", basis: "team demo founder" },
    },
    {
      id: "FND-0008",
      name: "Sun Chuanqi",
      role: "CTO",
      assessed: true,
      avatar: {
        type: "image",
        value: `${import.meta.env.BASE_URL}sun-chuanqi.jpg`,
        basis: "team demo founder",
      },
    },
    {
      id: "FND-0009",
      name: "Laura Spies",
      role: "COO",
      assessed: true,
      avatar: {
        type: "image",
        value: `${import.meta.env.BASE_URL}laura-spies.png`,
        basis: "team demo founder",
      },
    },
  ],
  stage: "Interview",
  sector: "AI / Venture infrastructure",
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
  ...OFFICIAL_STARTUPS.map((startup) => ({ ...startup, logoUrl: null, sourceCardUrl: null })),
];

export const METRICS = {
  activeApplications: STARTUPS.length,
  assessedDeals: STARTUPS.filter((s) => s.assessed).length,
  publicOutcomes: STARTUPS.filter((s) => s.realEvent).length,
  diligenceInProgress: STARTUPS.filter(
    (s) => s.stage === "Diligence" || s.stage === "Partner Review",
  ).length,
  decisionsDue24h:
    STARTUPS.filter((s) => s.stage === "Partner Review" || s.stage === "Term Sheet").length || 1,
  interviewsAvailable: STARTUPS.filter((s) => s.interviewUrl).length,
};

export const FUNNEL = [
  { stage: "Sourcing", count: 214, delta: "public + inbound" },
  {
    stage: "Screening",
    count: STARTUPS.length,
    delta: `${OFFICIAL_STARTUPS.length} official + 1 demo`,
  },
  { stage: "Interview", count: 1, delta: "FirstCheck - live" },
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
    sector: "AI / Venture infrastructure",
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
  { stage: "Interview", count: 1, delta: "FirstCheck · live" },
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
  {
    criterion: "Founder axes",
    requirement: "Resilience · Autonomy · Curiosity · Perseverance · Co-founder fit",
  },
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
/*  FirstCheck demo — the team's own card, powering the live interview + psychogram */
/*  (mirrors laura/frontend + sun/opportunity-card-example.md)         */
/* ------------------------------------------------------------------ */

export type Axis = { key: string; full: string; v: number; conf: number };

export type DemoFounder = {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Path under public/. Null falls back to initials. */
  photo: string | null;
  /** Public profile, as supplied by the founder. */
  linkedin: string;
  /** Looping tile footage for the interview studio. Falls back to photo/initials. */
  video?: string | null;
  /**
   * 16-personalities read, held as an open hypothesis. Never a verdict: the
   * type is inferred from written material and must be confirmed or dropped by
   * the agent interview.
   */
  personality: {
    type: string;
    label: string;
    hypothesis: string;
    basis: string;
    status: "open" | "supported" | "contradicted";
    confidence: number;
  };
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
    name: "Martin Auer",
    role: "CEO",
    initials: "MA",
    photo: null, // no still supplied yet — see STARTUP_USER
    video: `${import.meta.env.BASE_URL}martin-auer.mp4`,
    linkedin: "https://www.linkedin.com/in/martin-auer/",
    personality: {
      type: "ENTJ",
      label: "Commander",
      hypothesis:
        "Frames the roadmap as a sequence of commitments and drives the room to a decision; the risk is closing a debate before the technical objection has fully landed.",
      basis: "Written application and deck framing; no interview evidence yet.",
      status: "open",
      confidence: 41,
    },

    score: 76,
    confidence: 60,
    trend: "improving",
    history:
      "Owns the investor-facing product: the board, the four-stage pipeline navigation, the profile model and the inbound application flow. 23 commits across the vetting suite.",
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
    name: "Sun Chuanqi",
    role: "CTO",
    initials: "SC",
    photo: `${import.meta.env.BASE_URL}sun-chuanqi.jpg`,
    video: `${import.meta.env.BASE_URL}sun-chuanqi.mp4`,
    linkedin: "https://www.linkedin.com/in/chuanqi-sun/",
    personality: {
      type: "INTP",
      label: "Logician",
      hypothesis:
        "Reaches for the underlying mechanism before the business framing, and will reopen a settled question if the model does not hold; the risk is depth at the cost of shipping.",
      basis: "Technical writing and architecture notes; no interview evidence yet.",
      status: "open",
      confidence: 38,
    },
    score: 72,
    confidence: 62,
    trend: "stable",
    history:
      "Owns the system architecture and the narrative layer — the conceptual pipeline the implementation follows, plus the deck and talk track. 43 commits, the second-largest contribution.",
    axes: [
      { key: "Resilience", full: AXIS_FULL.Resilience, v: 68, conf: 55 },
      { key: "Autonomy", full: AXIS_FULL.Autonomy, v: 79, conf: 65 },
      { key: "Curiosity", full: AXIS_FULL.Curiosity, v: 83, conf: 66 },
      { key: "Perseverance", full: AXIS_FULL.Perseverance, v: 70, conf: 52 },
      { key: "Co-founder fit", full: AXIS_FULL["Co-founder fit"], v: 75, conf: 50 },
    ],
  },
  {
    id: "FND-0009",
    name: "Laura Spies",
    role: "COO",
    initials: "LS",
    photo: `${import.meta.env.BASE_URL}laura-spies.png`,
    video: `${import.meta.env.BASE_URL}laura-spies.mp4`,
    linkedin: "https://www.linkedin.com/in/laura-spies-75bb27109/",
    personality: {
      type: "INFJ",
      label: "Advocate",
      hypothesis:
        "Optimises for the system nobody asked for yet — pipelines, taxonomies, the shape of the data; the risk is building the general case before the specific one is proven.",
      basis: "Pipeline and schema design decisions; no interview evidence yet.",
      status: "open",
      confidence: 44,
    },
    score: 74,
    confidence: 58,
    trend: "improving",
    history:
      "Built the sourcing and developing pipeline end to end: screening against the fund thesis, the opportunity database, the LLM adapter and the investor login gate. 48 commits, the largest contribution.",
    axes: [
      { key: "Resilience", full: AXIS_FULL.Resilience, v: 76, conf: 58 },
      { key: "Autonomy", full: AXIS_FULL.Autonomy, v: 81, conf: 62 },
      { key: "Curiosity", full: AXIS_FULL.Curiosity, v: 79, conf: 60 },
      { key: "Perseverance", full: AXIS_FULL.Perseverance, v: 72, conf: 54 },
      { key: "Co-founder fit", full: AXIS_FULL["Co-founder fit"], v: 75, conf: 50 },
    ],
  },
  {
    id: "FND-0010",
    name: "Mehdi Gouasmi",
    role: "Head of Product",
    initials: "MG",
    photo: `${import.meta.env.BASE_URL}mehdi-gouasmi.png`,
    video: `${import.meta.env.BASE_URL}mehdi-gouasmi.mp4`,
    linkedin: "https://www.linkedin.com/in/mgou/",
    personality: {
      type: "ENFP",
      label: "Campaigner",
      hypothesis:
        "Reframes the problem from the user's side and generates options quickly; the risk is momentum outrunning the evidence the other three are still gathering.",
      basis: "Product framing and demo narrative; no interview evidence yet.",
      status: "open",
      confidence: 36,
    },
    score: 70,
    confidence: 52,
    trend: "improving",
    history:
      "Owns the demo requirements and screenplay — how the product is shown and in what order. Defined what the walkthrough has to prove before it was built.",
    axes: [
      { key: "Resilience", full: AXIS_FULL.Resilience, v: 71, conf: 52 },
      { key: "Autonomy", full: AXIS_FULL.Autonomy, v: 74, conf: 55 },
      { key: "Curiosity", full: AXIS_FULL.Curiosity, v: 85, conf: 63 },
      { key: "Perseverance", full: AXIS_FULL.Perseverance, v: 68, conf: 50 },
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
      why: "Commercial CEO × technical CTO × operations COO × product lead — four different critical functions, not duplicate strengths.",
    },
    {
      name: "Decision clarity",
      v: 74,
      why: "All four describe the same decision process and split product, technical and commercial calls cleanly.",
    },
    {
      name: "Pressure-tested history",
      v: 45,
      why: "Conflict handling not yet observed under real pressure — the ceiling-gating component.",
    },
  ],
  note: "Scored as a team, never as an average of the four founders. Per Wasserman, ~65% of startup failures trace to people problems, so the co-founder dynamic carries its own gated score.",
};

/**
 * The signed-in investor. Single source for the header, settings and the
 * diligence activity log.
 *
 * `avatarUrl` points at the photo in `public/`. Set it to null to fall back to
 * initials.
 */
/**
 * The signed-in founder on the startup side of the switcher.
 *
 * `avatarUrl` is null until Martin's photo is saved into `public/` — set it to
 * "/martin-auer.jpg" (or whatever the file is called) and the header, the
 * psychogram tab and the founder card all pick it up.
 */
export const STARTUP_USER = {
  name: "Martin Auer",
  initials: "MA",
  role: "Founder · applicant",
  company: "FirstCheck",
  avatarUrl: null as string | null,
};

export const INVESTOR = {
  name: "Carl-Philipp Beichert",
  initials: "CB",
  role: "Partner · Screening lead",
  avatarUrl: `${import.meta.env.BASE_URL}carl-philipp-beichert.jpg`,
};
