import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { CheckCircle2, AlertTriangle, HelpCircle, Clock } from "lucide-react";
import { INVESTOR } from "@/lib/data";

export const Route = createFileRoute("/diligence")({
  head: () => ({
    meta: [{ title: "Due Diligence · VibeCheck" }],
  }),
  component: DiligencePage,
});

type Item = { label: string; status: "verified" | "missing" | "open" | "contradiction"; note?: string };
type Lane = { title: string; owner: string; progress: number; items: Item[] };

const LANES: Lane[] = [
  {
    title: "People",
    owner: `Kestrel + ${INVESTOR.name.split("-")[0]}`,
    progress: 82,
    items: [
      { label: "Founder background verified (Osei, Berger)", status: "verified" },
      { label: "3/4 references completed", status: "verified" },
      { label: "CTO prior-exit terms", status: "contradiction", note: "Deck says exit, reference says acqui-hire" },
      { label: "Advisory board conflicts check", status: "open" },
    ],
  },
  {
    title: "Product",
    owner: "Kestrel",
    progress: 68,
    items: [
      { label: "GitHub activity verified", status: "verified" },
      { label: "B4 variant stability data reviewed", status: "verified" },
      { label: "Live product demo (bench pilot video)", status: "verified" },
      { label: "Third-party benchmark", status: "missing", note: "No independent lab replication yet" },
    ],
  },
  {
    title: "Market",
    owner: "Kestrel",
    progress: 74,
    items: [
      { label: "TAM sizing rebuilt bottom-up", status: "verified" },
      { label: "Competitor landscape · 14 tracked", status: "verified" },
      { label: "Buyer interviews · 5 completed", status: "verified" },
      { label: "Regulatory pathway (EU CBAM)", status: "open" },
    ],
  },
  {
    title: "Traction",
    owner: INVESTOR.name.split("-")[0],
    progress: 55,
    items: [
      { label: "Holcim LoI verified", status: "verified" },
      { label: "thyssenkrupp LoI", status: "open", note: "Requested, awaiting counter-signed copy" },
      { label: "40 t/day pilot claim", status: "contradiction", note: "References confirm 12 t/day only" },
      { label: "Paid customer count · 0 vs 3 (deck)", status: "contradiction" },
    ],
  },
  {
    title: "Legal",
    owner: "Ext. counsel",
    progress: 40,
    items: [
      { label: "Cap table disclosure", status: "missing" },
      { label: "EPFL IP license terms", status: "open" },
      { label: "Employment agreements", status: "verified" },
      { label: "Data-room NDA countersigned", status: "verified" },
    ],
  },
  {
    title: "Financials",
    owner: "Analyst",
    progress: 48,
    items: [
      { label: "Historical burn (12mo)", status: "verified" },
      { label: "18-month plan model", status: "verified" },
      { label: "Capex scale-up model", status: "missing" },
      { label: "Grant income audit", status: "open" },
    ],
  },
];

const LOG = [
  { t: "09:41", who: "Kestrel", msg: "Reference call with Prof. Weber completed · consistency 98%" },
  { t: "09:22", who: "System", msg: "GitHub commit velocity verified · 3.1× 30-day avg" },
  { t: "08:58", who: INVESTOR.name.split("-")[0], msg: "Requested EPFL license terms from founder" },
  { t: "08:41", who: "Kestrel", msg: "Contradiction flagged: pilot scale (40 vs 12 t/day)" },
  { t: "08:12", who: "System", msg: "thyssenkrupp LoI · counter-signature outstanding" },
  { t: "07:55", who: "Kestrel", msg: "Live reference call started with Ana Fischer" },
  { t: "Yesterday", who: "Analyst", msg: "18-month plan model reviewed · assumptions logged" },
  { t: "Yesterday", who: "System", msg: "Cap table upload not detected in data room" },
];

export function DiligencePage() {
  return (
    <AppShell>
      <PageHeader
        crumbs={["Due Diligence", "Helix Bio"]}
        eyebrow="Live diligence workspace"
        title="Diligence · Helix Bio"
        description="Six lanes, six owners. Every check is evidence-anchored. Contradictions surface here first, then propagate to scores."
        actions={
          <>
            <Badge tone="warning">2 contradictions</Badge>
            <Badge tone="outline">3 open</Badge>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">Export diligence pack</button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Advance to IC</button>
          </>
        }
      />

      <div className="px-8 py-6 grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {LANES.map((lane) => (
            <Card key={lane.title} className="p-0">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-medium">{lane.title}</div>
                  <div className="text-[11px] font-mono text-muted-foreground">{lane.progress}%</div>
                </div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  Owner · {lane.owner}
                </div>
                <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${lane.progress}%` }} />
                </div>
              </div>
              <ul className="divide-y divide-border">
                {lane.items.map((it) => (
                  <li key={it.label} className="p-3 flex items-start gap-2.5">
                    <StatusIcon s={it.status} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] text-foreground/90">{it.label}</div>
                      {it.note && <div className="text-[11px] text-muted-foreground mt-0.5">{it.note}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
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
              <li key={i} className="grid grid-cols-[52px_1fr] gap-3 px-4 py-2.5 border-b border-border last:border-b-0">
                <div className="text-[11px] font-mono text-muted-foreground pt-0.5">{l.t}</div>
                <div>
                  <div className="text-[12px] text-foreground/90 leading-snug">{l.msg}</div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground mt-0.5">{l.who}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

function StatusIcon({ s }: { s: Item["status"] }) {
  if (s === "verified") return <CheckCircle2 className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" />;
  if (s === "missing") return <AlertTriangle className="h-3.5 w-3.5 text-negative mt-0.5 shrink-0" />;
  if (s === "contradiction") return <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />;
  return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />;
}
