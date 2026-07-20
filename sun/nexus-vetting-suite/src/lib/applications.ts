import { getApplications } from "@/lib/browser-api";
import type { Stage, Startup } from "@/lib/data";
import { useEffect, useState } from "react";

/** One founder profile generated at submit time by the pipeline. */
export type SubmittedFounder = {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  avatar: { type: "initials"; value: string };
  public: { linkedin: string | null; status: string; fetchedAt: string };
  hypotheses: { id: string; axis: string; text: string; basis: string; status: string }[];
  assessed: false;
  scores: null;
};

/** An application as stored in the pipeline inbox. */
export type SubmittedApplication = {
  id: string;
  receivedAt: string;
  screening: { pass: boolean; hardFails: string[]; softFlags: string[] };
  application: Record<string, string>;
  founders: SubmittedFounder[];
};

/**
 * Applications land on the board in the same shape as every other card, so the
 * board needs no special-casing. They are unassessed by definition: screening
 * gives a pass/fail, but no axis has evidence until the interview runs.
 */
export function applicationToStartup(record: SubmittedApplication): Startup {
  const a = record.application ?? {};
  const screenedOut = !record.screening?.pass;

  return {
    id: record.id,
    company: a.company ?? "Untitled application",
    oneLiner: a.oneLiner || "No one-line pitch supplied.",
    // Older inbox records predate founder profiles — never crash on them.
    founders: (record.founders ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role ?? undefined,
      assessed: false,
      avatar: { type: "initials" as const, value: f.avatar.value },
      email: f.email ?? undefined,
      linkedin: f.public.linkedin ?? undefined,
    })),
    // Both outcomes have been screened; the verdict distinguishes them.
    stage: "Screened" as Stage,
    sector: a.sector || "Unspecified",
    geography: a.geography || "Unspecified",
    round: a.round || a.stage || "Pre-seed",
    ask: a.ask || "—",
    assessed: false,
    founderScore: null,
    marketScore: null,
    ideaMarketScore: null,
    trustScore: null,
    urgency: screenedOut ? "Low" : "High",
    submitted: record.receivedAt.slice(0, 10),
    thesisFit: null,
    website: a.deck ?? null,
    currentApplication: true,
    sourceChannel: "Inbound application",
    screening: record.screening,
  };
}

/** Live inbound applications. Empty until someone submits the apply form. */
export function useSubmittedApplications() {
  const [records, setRecords] = useState<SubmittedApplication[]>([]);

  useEffect(() => {
    let live = true;
    getApplications()
      .then((d: SubmittedApplication[]) => live && setRecords(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return records;
}
