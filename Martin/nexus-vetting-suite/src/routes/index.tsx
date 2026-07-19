import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Section, Card, Stat, Badge, ScoreBar } from "@/components/ui-kit";
import { STARTUPS, FUNNEL, METRICS, stageColor, scoreTone, fmtScore } from "@/lib/data";
import { ArrowUpRight, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline · VibeCheck" },
      {
        name: "description",
        content:
          "AI-native venture screening: pipeline funnel, active applications, founder scores, and 24-hour decision queue.",
      },
      { property: "og:title", content: "VibeCheck — AI-native venture screening" },
      {
        property: "og:description",
        content:
          "Evidence-backed investment memos in 24 hours. Screen founders, run AI interviews and reference calls, ship term sheets faster.",
      },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const dueSoon = STARTUPS.filter(
    (s) => s.stage === "Partner Review" || s.stage === "Term Sheet" || s.stage === "Portfolio",
  ).slice(0, 4);
  const topScreened = [...STARTUPS]
    .sort((a, b) => (b.founderScore ?? -1) - (a.founderScore ?? -1))
    .slice(0, 5);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Fund · MIG Ventures III"
        title="Pipeline"
        description="Live view of every startup in flight, from cold inbound to signed term sheet. Every score is evidence-backed and traceable."
        actions={
          <>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:bg-accent">
              Export CSV
            </button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              Trigger screening batch
            </button>
          </>
        }
      />

      {/* Metrics */}
      <Section title="Today">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <Stat label="Opportunities" value={METRICS.activeApplications} hint="official cards + demo" />
          <Stat label="Assessed deals" value={METRICS.assessedDeals} hint="Acme demo only" />
          <Stat label="Public outcomes" value={METRICS.publicOutcomes} hint="public-source records" />
          <Stat label="Diligence in progress" value={METRICS.diligenceInProgress} hint="confidential" />
          <Stat label="Decisions due · 24h" value={METRICS.decisionsDue24h} trend="1 memo" />
          <Stat label="Interviews available" value={METRICS.interviewsAvailable} hint="public founder talks" />
        </div>
      </Section>

      {/* Funnel */}
      <Section title="Funnel">
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-5 divide-x divide-border">
            {FUNNEL.map((f, i) => (
              <div key={f.stage} className="p-5 relative">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="font-mono">0{i + 1}</span>
                  <span>{f.stage}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="font-serif text-[36px] leading-none tracking-tight">
                    {f.count}
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{f.delta}</div>
                <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${100 - i * 18}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Two column: due & top screened */}
      <Section>
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-0">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <div className="text-[13px] font-medium">Top screened this week</div>
              </div>
              <div className="text-[11px] text-muted-foreground">Ranked by composite fit</div>
            </div>
            <div className="divide-y divide-border">
              {topScreened.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-4 hover:bg-surface transition-colors">
                  <div className="w-10 h-10 rounded-md bg-surface-2 grid place-items-center text-[13px] font-serif text-foreground/80">
                    {s.company.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[13.5px] font-medium truncate">{s.company}</div>
                      <Badge tone="outline">{s.sector}</Badge>
                      <span className={`text-[11px] ${stageColor(s.stage)} px-1.5 py-0.5 rounded`}>{s.stage}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground truncate mt-0.5">{s.oneLiner}</div>
                  </div>
                  <div className="hidden md:grid grid-cols-3 gap-6 w-[260px]">
                    <MiniScore label="Founder" v={s.founderScore} />
                    <MiniScore label="Market" v={s.marketScore} />
                    <MiniScore label="Fit" v={s.ideaMarketScore} />
                  </div>
                  {!s.assessed && <span className="hidden md:block text-[10px] text-muted-foreground uppercase tracking-wider">not assessed</span>}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-warning" />
                <div className="text-[13px] font-medium">Decisions due · 24h</div>
              </div>
              <Badge tone="warning">{dueSoon.length}</Badge>
            </div>
            <div className="divide-y divide-border">
              {dueSoon.map((s) => (
                <div key={s.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-medium">{s.company}</div>
                    <div className={`text-[12px] font-mono tabular-nums ${scoreTone(s.founderScore)}`}>
                      {fmtScore(s.founderScore)}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {s.stage} · {s.ask} · {s.geography}
                  </div>
                  <div className="mt-2">
                    {s.thesisFit != null
                      ? <ScoreBar label="Thesis fit" value={Math.round(s.thesisFit * 100)} />
                      : <div className="text-[11px] text-positive">{s.realEvent}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Signals">
        <div className="grid md:grid-cols-3 gap-3">
          <SignalCard
            title="Live interview in progress"
            body="Acme Robotics (demo): contradiction CON-001 resolving on the call; negotiation model moved ZOPA to $9M–$12M in real time."
            tone="teal"
          />
          <SignalCard
            title="Public outcome recorded"
            body="Secfix: $12M Series A led by ALSTIN Capital. Founders sourced from public data — deliberately not scored."
            tone="positive"
          />
          <SignalCard
            title="Guardrail active"
            body="Official opportunity cards now include real founder names and company logos. Real founders remain public-source records only, with no fabricated psychometric scoring."
            tone="warning"
          />
        </div>
      </Section>
    </AppShell>
  );
}

function MiniScore({ label, v }: { label: string; v: number | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-[12px] font-mono tabular-nums text-muted-foreground">{v ?? "—"}</div>
      </div>
      <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${v ?? 0}%` }} />
      </div>
    </div>
  );
}

function SignalCard({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "warning" | "positive" | "teal";
}) {
  const icons = {
    warning: <AlertCircle className="h-3.5 w-3.5 text-warning" />,
    positive: <TrendingUp className="h-3.5 w-3.5 text-positive" />,
    teal: <Sparkles className="h-3.5 w-3.5 text-primary" />,
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        {icons[tone]}
        <div className="text-[12.5px] font-medium">{title}</div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">{body}</p>
    </Card>
  );
}
