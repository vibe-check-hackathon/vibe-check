import type { SubmittedApplication, SubmittedFounder } from "./applications";

const THESIS_KEY = "vibecheck-demo-thesis";
const APPLICATIONS_KEY = "vibecheck-demo-applications";
const ACCOUNTS_KEY = "vibecheck-demo-founder-accounts";

export type ThesisDoc = {
  id: string;
  version: number;
  updatedAt: string;
  fund: {
    sectors: string[];
    stages: string[];
    geographies: string[];
    checkSizeUsd: { min: number; max: number };
    targetOwnership: number;
    riskAppetite: string;
    maxOpenGaps: number;
  };
} & Record<string, unknown>;

export type DemoSession = {
  role: "investor" | "founder";
  name: string;
  opportunityId: string | null;
};

type FounderAccount = {
  email: string;
  password: string;
  name: string;
  opportunityId: string;
};

const DEFAULT_THESIS: ThesisDoc = {
  id: "THESIS-001",
  version: 1,
  updatedAt: "2026-07-20T00:00:00.000Z",
  fund: {
    sectors: ["AI infrastructure", "robotics"],
    stages: ["Pre-seed", "Seed"],
    geographies: ["Europe"],
    checkSizeUsd: { min: 50000, max: 100000 },
    targetOwnership: 0.08,
    riskAppetite: "high",
    maxOpenGaps: 3,
  },
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function getThesis(): Promise<ThesisDoc> {
  return readLocal(THESIS_KEY, DEFAULT_THESIS);
}

export async function saveThesis(thesis: ThesisDoc): Promise<ThesisDoc> {
  const saved = { ...thesis, version: thesis.version + 1, updatedAt: new Date().toISOString() };
  writeLocal(THESIS_KEY, saved);
  return saved;
}

export async function getApplications(): Promise<SubmittedApplication[]> {
  return readLocal<SubmittedApplication[]>(APPLICATIONS_KEY, []);
}

export async function authenticateDemo(email: string, password: string): Promise<DemoSession | null> {
  if (email.trim().toLowerCase() === "investor@firstcheck.demo" && password === "growth-signal") {
    return { role: "investor", name: "Demo Investor", opportunityId: null };
  }
  const account = readLocal<FounderAccount[]>(ACCOUNTS_KEY, []).find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
  );
  return account
    ? { role: "founder", name: account.name, opportunityId: account.opportunityId }
    : null;
}

function screenApplication(application: Record<string, unknown>) {
  const round = String(application.round ?? application.stage ?? "");
  const sector = String(application.sector ?? "").toLowerCase();
  const geography = String(application.geography ?? "").toLowerCase();
  const thesis = readLocal(THESIS_KEY, DEFAULT_THESIS);
  const hardFails: string[] = [];
  const softFlags: string[] = [];

  if (/series\s+[b-z]|later/i.test(round)) hardFails.push(`${round} is later than the fund's Pre-seed/Seed entry stage.`);
  if (sector && !thesis.fund.sectors.some((value) => sector.includes(value.toLowerCase()))) {
    softFlags.push(`${application.sector} is outside the current sector focus.`);
  }
  if (geography && !thesis.fund.geographies.some((value) => geography.includes(value.toLowerCase()))) {
    softFlags.push(`${application.geography} is outside the current geography focus.`);
  }
  return { pass: hardFails.length === 0, hardFails, softFlags };
}

function founderProfile(founder: Record<string, string>, index: number, opportunityId: string): SubmittedFounder {
  const initials = founder.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: `${opportunityId}-F${index + 1}`,
    name: founder.name,
    role: founder.role || null,
    email: founder.email || null,
    avatar: { type: "initials", value: initials },
    public: { linkedin: founder.linkedin || null, status: "founder-provided", fetchedAt: new Date().toISOString() },
    hypotheses: [
      {
        id: `${opportunityId}-H${index + 1}-1`,
        axis: "Execution",
        text: "Explore a concrete example of shipping through a material setback.",
        basis: "Open interview question generated from the submitted application.",
        status: "unverified",
      },
      {
        id: `${opportunityId}-H${index + 1}-2`,
        axis: "Team complementarity",
        text: "Clarify decision ownership and how founder disagreements are resolved.",
        basis: "Open interview question generated from the submitted founder roles.",
        status: "unverified",
      },
    ],
    assessed: false,
    scores: null,
  };
}

export async function submitApplication(application: Record<string, unknown>) {
  const founders = (application.founders as Record<string, string>[] | undefined) ?? [];
  const opportunityId = `OPP-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const screening = screenApplication(application);
  const profiles = founders.map((founder, index) => founderProfile(founder, index, opportunityId));
  const record: SubmittedApplication = {
    id: opportunityId,
    receivedAt: new Date().toISOString(),
    screening,
    application: Object.fromEntries(
      Object.entries(application).filter(([, value]) => typeof value === "string"),
    ) as Record<string, string>,
    founders: profiles,
  };
  writeLocal(APPLICATIONS_KEY, [record, ...readLocal<SubmittedApplication[]>(APPLICATIONS_KEY, [])]);

  const founderAccounts = founders
    .filter((founder) => founder.email)
    .map((founder, index) => ({
      email: founder.email,
      password: `demo-${opportunityId.slice(-6).toLowerCase()}-${index + 1}`,
      name: founder.name,
      opportunityId,
    }));
  writeLocal(ACCOUNTS_KEY, [...founderAccounts, ...readLocal<FounderAccount[]>(ACCOUNTS_KEY, [])]);

  return { id: opportunityId, ...screening, founderAccounts };
}

export async function getFounderFeedback(opportunityId: string) {
  const record = readLocal<SubmittedApplication[]>(APPLICATIONS_KEY, []).find((item) => item.id === opportunityId);
  if (!record) return null;
  return {
    opportunityId,
    company: record.application.company ?? null,
    screening: record.screening,
    founders: record.founders,
    interviewFeedback: null,
  };
}