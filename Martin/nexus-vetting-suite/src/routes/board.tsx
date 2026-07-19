import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Section, Card, Badge } from "@/components/ui-kit";
import { STARTUPS, STAGES, stageColor, scoreTone, fmtScore, type Stage } from "@/lib/data";
import { Filter, LayoutGrid, Rows, Plus } from "lucide-react";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [{ title: "Board · VibeCheck" }],
  }),
  component: BoardPage,
});

function BoardPage() {
  const byStage: Record<Stage, typeof STARTUPS> = Object.fromEntries(
    STAGES.map((s) => [s, STARTUPS.filter((x) => x.stage === s)]),
  ) as never;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Board"
        title="Deal board"
        description="Every startup, every stage. Drag to advance; scores update live from evidence in each lane."
        actions={
          <>
            <div className="flex items-center rounded-md border border-border bg-surface p-0.5">
              <button className="h-7 px-2 rounded-[5px] bg-background text-[12px] font-medium flex items-center gap-1.5">
                <LayoutGrid className="h-3 w-3" /> Kanban
              </button>
              <button className="h-7 px-2 rounded-[5px] text-[12px] text-muted-foreground flex items-center gap-1.5">
                <Rows className="h-3 w-3" /> Table
              </button>
            </div>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5">
              <Filter className="h-3 w-3" /> Filters · 2
            </button>
          </>
        }
      />

      <div className="px-6 py-5 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage) => (
            <div key={stage} className="w-[280px] shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${stageColor(stage)}`}>
                    {stage}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {byStage[stage].length}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {byStage[stage].map((s) => (
                  <Card key={s.id} className="p-3 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">{s.company}</div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {s.founders.join(", ")}
                        </div>
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${scoreTone(s.founderScore)}`}>
                        {fmtScore(s.founderScore)}
                      </div>
                    </div>
                    <p className="mt-2 text-[11.5px] text-muted-foreground leading-snug line-clamp-2">
                      {s.oneLiner}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MicroAxis label="F" v={s.founderScore} />
                      <MicroAxis label="M" v={s.marketScore} />
                      <MicroAxis label="I/M" v={s.ideaMarketScore} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge tone="outline">{s.sector.split(" / ")[0]}</Badge>
                        <span className="text-[10.5px] text-muted-foreground">{s.ask}</span>
                      </div>
                      {s.urgency === "High" && <Badge tone="warning">Urgent</Badge>}
                      {s.trustScore != null && s.trustScore >= 85 && <Badge tone="positive">Trust {s.trustScore}</Badge>}
                      {!s.assessed && <Badge tone="outline">not assessed</Badge>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table view */}
      <Section title="All deals · table">
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface border-b border-border text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-3 py-2.5 font-medium">Stage</th>
                <th className="px-3 py-2.5 font-medium">Sector</th>
                <th className="px-3 py-2.5 font-medium text-right">Founder</th>
                <th className="px-3 py-2.5 font-medium text-right">Market</th>
                <th className="px-3 py-2.5 font-medium text-right">Idea/Mkt</th>
                <th className="px-3 py-2.5 font-medium text-right">Trust</th>
                <th className="px-3 py-2.5 font-medium">Urgency</th>
                <th className="px-3 py-2.5 font-medium text-right">Ask</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {STARTUPS.map((s) => (
                <tr key={s.id} className="hover:bg-surface/60 cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{s.company}</div>
                    <div className="text-[11px] text-muted-foreground">{s.founders[0]}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${stageColor(s.stage)}`}>{s.stage}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.sector}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${scoreTone(s.founderScore)}`}>{fmtScore(s.founderScore)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${scoreTone(s.marketScore)}`}>{fmtScore(s.marketScore)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${scoreTone(s.ideaMarketScore)}`}>{fmtScore(s.ideaMarketScore)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${scoreTone(s.trustScore)}`}>{fmtScore(s.trustScore)}</td>
                  <td className="px-3 py-2.5">
                    {s.urgency === "High" ? <Badge tone="warning">High</Badge> : <Badge tone="outline">{s.urgency}</Badge>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums">{s.ask}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </AppShell>
  );
}

function MicroAxis({ label, v }: { label: string; v: number | null }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9.5px] uppercase tracking-wider text-muted-foreground font-mono w-5">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${v ?? 0}%` }} />
      </div>
    </div>
  );
}
