import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { CheckCircle2, AlertTriangle, HelpCircle, ChevronRight } from "lucide-react";
import { INVESTOR } from "@/lib/data";
import { TermSheetStudio } from "@/components/TermSheetStudio";

export const Route = createFileRoute("/diligence")({
  validateSearch: (search: Record<string, unknown>) => ({
    // Deep-link a real opportunity in: /diligence?opportunityId=OPP-APP-...
    // Without it, the page shows the staged FirstCheck team demo — same as
    // before this param existed.
    opportunityId: typeof search.opportunityId === "string" ? search.opportunityId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Due Diligence · VibeCheck" }],
  }),
  component: DiligencePage,
});

type Item = {
  label: string;
  status: "verified" | "missing" | "open" | "contradiction";
  note?: string;
};
type Lane = { title: string; owner: string; progress: number; items: Item[] };

const LANES: Lane[] = [
  {
    title: "People",
    owner: `Kestrel + ${INVESTOR.name.split("-")[0]}`,
    progress: 82,
    items: [
      { label: "Four founders verified against public profiles", status: "verified" },
      { label: "Contribution split confirmed from repository history", status: "verified" },
      {
        label: "Prior career history",
        status: "open",
        note: "Founder-supplied; LinkedIn not machine-readable without auth",
      },
      { label: "Full-time commitment post-raise", status: "open" },
    ],
  },
  {
    title: "Product",
    owner: "Kestrel",
    progress: 74,
    items: [
      { label: "Pipeline runs end to end (sourcing → developing → memo)", status: "verified" },
      { label: "Evidence provenance and trust scores implemented", status: "verified" },
      { label: "Human approval gate enforced before term sheet", status: "verified" },
      {
        label: "Screening still deterministic, not scored",
        status: "open",
        note: "CTO flagged this in-call as the next rebuild",
      },
    ],
  },
  {
    title: "Market",
    owner: "Kestrel",
    progress: 66,
    items: [
      { label: "Buyer identified: partner running first-check screening", status: "verified" },
      { label: "Competitor landscape · incumbent CRMs adding AI screening", status: "verified" },
      {
        label: "Willingness to pay",
        status: "open",
        note: "Two pilots discussed, none contracted",
      },
    ],
  },
  {
    title: "Traction",
    owner: INVESTOR.name.split("-")[0],
    progress: 45,
    items: [
      { label: "Working demo across the full four-stage flow", status: "verified" },
      {
        label: "Time-to-memo claim · 24h vs 48h",
        status: "contradiction",
        note: "CEO corrected the deck in-call: 48h including the gate",
      },
      { label: "Paying customers · 0", status: "missing" },
    ],
  },
  {
    title: "Legal",
    owner: "Ext. counsel",
    progress: 40,
    items: [
      { label: "Interview recording consent captured at apply time", status: "verified" },
      {
        label: "Data-processing terms for founder interviews",
        status: "open",
        note: "COO asked for these before signing, not after",
      },
      { label: "Cap table disclosure", status: "missing" },
    ],
  },
  {
    title: "Financials",
    owner: "Analyst",
    progress: 48,
    items: [
      { label: "Raise stated · $1.2M pre-seed", status: "verified" },
      { label: "18-month plan model", status: "open" },
      {
        label: "LLM inference cost per memo",
        status: "missing",
        note: "Unit economics depend on it",
      },
    ],
  },
];

const LOG = [
  {
    t: "09:41",
    who: "Kestrel",
    msg: "Repository history verified · contribution split matches the four founders",
  },
  {
    t: "09:22",
    who: "System",
    msg: "GitHub commit velocity verified · 119 commits across 4 authors",
  },
  {
    t: "08:58",
    who: INVESTOR.name.split("-")[0],
    msg: "Requested data-processing terms for interview recordings",
  },
  {
    t: "08:41",
    who: "Kestrel",
    msg: "Contradiction flagged: time-to-memo (24h deck vs 48h with approval gate)",
  },
  { t: "08:29", who: "Kestrel", msg: "CEO corrected the deck in-call · contradiction resolved" },
  { t: "08:12", who: "System", msg: "Cap table not detected in data room" },
  { t: "07:55", who: "Kestrel", msg: "Four personality hypotheses entered the interview untested" },
  {
    t: "Yesterday",
    who: "Analyst",
    msg: "LLM inference cost per memo requested · unit economics depend on it",
  },
  { t: "Yesterday", who: "System", msg: "Interview recording consent captured at apply time" },
];

export function DiligencePage() {
  const { opportunityId } = Route.useSearch();
  // Derived from LANES so the header can never drift from the checks below.
  const all = LANES.flatMap((l) => l.items);
  const contradictions = all.filter((i) => i.status === "contradiction").length;
  const unresolved = all.filter((i) => i.status === "open" || i.status === "missing").length;

  return (
    <AppShell>
      <PageHeader
        crumbs={["Due Diligence", "FirstCheck"]}
        eyebrow="Live diligence workspace"
        title="Diligence · FirstCheck"
        description="Six topics, six owners. Open one to see its checks. Every item is evidence-anchored, and contradictions surface here first before they propagate to scores."
        actions={
          <>
            {contradictions > 0 && (
              <Badge tone="warning">
                {contradictions} contradiction{contradictions === 1 ? "" : "s"}
              </Badge>
            )}
            <Badge tone="outline">{unresolved} to resolve</Badge>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">
              Export diligence pack
            </button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">
              Advance to IC
            </button>
          </>
        }
      />

      <div className="px-8 py-6 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-2">
          {LANES.map((lane, i) => {
            const open = lane.items.filter((it) => it.status !== "verified").length;
            return (
              <Card key={lane.title} className="p-0 overflow-hidden">
                {/* Each topic collapses; the first is open so the page is not a wall of chevrons. */}
                <details open={i === 0} className="group">
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3 hover:bg-surface transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                    <span className="text-[13px] font-medium">{lane.title}</span>
                    <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      {lane.owner}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      {open > 0 && (
                        <span className="text-[11px] text-muted-foreground">{open} to resolve</span>
                      )}
                      <span className="hidden sm:block h-1 w-24 rounded-full bg-muted overflow-hidden">
                        <span
                          className="block h-full bg-primary"
                          style={{ width: `${lane.progress}%` }}
                        />
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">
                        {lane.progress}%
                      </span>
                    </span>
                  </summary>
                  <ul className="divide-y divide-border border-t border-border">
                    {lane.items.map((it) => (
                      <li key={it.label} className="px-4 py-2.5 flex items-start gap-2.5">
                        <StatusIcon s={it.status} />
                        <div className="min-w-0">
                          <div className="text-[12.5px] text-foreground/90">{it.label}</div>
                          {it.note && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {it.note}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </Card>
            );
          })}
        </div>

        {/* Diligence log */}
        <Card className="p-0 h-fit lg:sticky lg:top-[72px]">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="text-[13px] font-medium">Diligence log</div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-positive pulse-dot" /> live
            </div>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto">
            {LOG.map((l, i) => (
              <li
                key={i}
                className="grid grid-cols-[52px_1fr] gap-3 px-4 py-2.5 border-b border-border last:border-b-0"
              >
                <div className="text-[11px] font-mono text-muted-foreground pt-0.5">{l.t}</div>
                <div>
                  <div className="text-[12px] text-foreground/90 leading-snug">{l.msg}</div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    {l.who}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Approval gate deliverable: the annotated term sheet, adapting live
            to the team analysis, with per-change reasoning + evidence. */}
        <div className="lg:col-span-2">
          <TermSheetStudio company="FirstCheck" askUsd={1200000} opportunityId={opportunityId} />
        </div>
      </div>
    </AppShell>
  );
}

function StatusIcon({ s }: { s: Item["status"] }) {
  if (s === "verified")
    return <CheckCircle2 className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" />;
  if (s === "missing")
    return <AlertTriangle className="h-3.5 w-3.5 text-negative mt-0.5 shrink-0" />;
  if (s === "contradiction")
    return <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />;
  return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />;
}
