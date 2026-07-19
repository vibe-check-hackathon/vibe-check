import type { Startup, Stage } from "./data";

/* Loads the faker-generated cohort straight from laura/opportunity-db (served
 * by the vite middleware) — single source of truth, nothing duplicated here.
 * Every person, email, and score is fictional (.example domains, seed 4242). */

const STATUS_TO_STAGE: Record<string, Stage> = {
  intake: "Inbound",
  research: "Screened",
  interview: "Interview",
  diligence: "Diligence",
  decision: "Partner Review",
};

type SyntheticFounder = {
  id: string;
  name: string;
  sex: string;
  role: string;
  avatar: string;
  email: string;
  linkedin: string;
  scores: Record<string, number>;
  scoreConfidence: number;
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

export async function loadSyntheticStartups(): Promise<Startup[]> {
  const res = await fetch("/opportunity-db/synthetic/index.json");
  if (!res.ok) return [];
  const db = (await res.json()) as { opportunities: SyntheticOpp[] };
  return db.opportunities.map((o) => ({
    id: o.id,
    company: o.company,
    oneLiner: `${o.oneLiner} (synthetic cohort — fictional company)`,
    founders: o.founders.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role,
      assessed: true,
      avatar: { type: "image" as const, value: `/opportunity-db/synthetic/${f.avatar}`, basis: "AI-generated portrait; fictional person" },
      email: f.email,
      linkedin: f.linkedin,
      scores: f.scores,
      scoreConfidence: f.scoreConfidence,
    })),
    stage: STATUS_TO_STAGE[o.status] ?? "Inbound",
    sector: o.sector,
    geography: o.location,
    round: o.stage,
    ask: `$${(o.raiseUsd / 1e6).toFixed(1)}M`,
    assessed: true,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: "Medium" as const,
    submitted: "2026-07-19",
    thesisFit: null,
    website: o.website,
    logoUrl: o.logo ? `/opportunity-db/synthetic/${o.logo}` : null,
    sourceCardUrl: `/opportunity-db/synthetic/${o.card}`,
    synthetic: true,
  }));
}
