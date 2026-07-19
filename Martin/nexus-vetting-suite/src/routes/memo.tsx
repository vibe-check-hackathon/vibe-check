import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge, ScoreBar } from "@/components/ui-kit";
import { ACME_FOUNDERS } from "@/lib/data";
import { FileText, ShieldCheck, ShieldAlert, Sparkles, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/memo")({
  head: () => ({
    meta: [{ title: "Decision Memo · VibeCheck" }],
  }),
  component: MemoPage,
});

function Source({ id, hint }: { id: string; hint: string }) {
  return (
    <sup className="ml-0.5">
      <a href="#evidence" className="text-primary hover:underline text-[10px] font-mono" title={hint}>
        [{id}]
      </a>
    </sup>
  );
}

export function MemoPage() {
  return (
    <AppShell>
      <PageHeader
        crumbs={["Decision Memo", "FirstCheck", "v3 · draft"]}
        eyebrow="Investment memorandum"
        title="FirstCheck · Pre-seed · $1.2M"
        description="Generated from 14 evidence sources, 4 references, and 1 four-founder interview. Every claim links to its evidence."
        actions={
          <>
            <Badge tone="teal">Confidence 84</Badge>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Send to IC</button>
          </>
        }
      />

      <div className="px-8 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <article className="max-w-3xl space-y-8">
          {/* Snapshot */}
          <section>
            <SectionTitle n="01" title="Company snapshot" />
            <Card className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                <Snap label="Sector" value="AI / Venture infrastructure" />
                <Snap label="Stage · Ask" value="Pre-seed · $1.2M" />
                <Snap label="Geo · Founded" value="Berlin · 2026" />
                <Snap label="Round lead" value="MIG Ventures III" />
              </div>
              <div className="border-t border-border p-5 text-[13.5px] leading-relaxed text-foreground/90">
                FirstCheck replaces the analyst hours a fund spends turning an inbound application into a first-check decision. An application enters, the pipeline sources and corroborates every claim with a trust score, an agent interview tests the open hypotheses live, and a human investor approves at the gate — memo out in 48 hours with the evidence attached to each line<Source id="1" hint="Deck v3.2 · slide 8" />.
              </div>
            </Card>
          </section>

          {/* Hypotheses */}
          <section>
            <SectionTitle n="02" title="Investment hypotheses" />
            <ol className="space-y-3">
              <Hypothesis n="H1" text="Funds will accept an agent-run first interview when every claim stays traceable to its source and the human keeps the approval gate." conf={74} />
              <Hypothesis n="H2" text="The thesis lens generalises: a second fund is a config change, not a second rule set." conf={58} />
              <Hypothesis n="H3" text="Evidence provenance — founder-claimed vs corroborated — is the durable moat, because it is what a fund cannot safely skip." conf={81} />
            </ol>
          </section>

          {/* SWOT */}
          <section>
            <SectionTitle n="03" title="SWOT" />
            <div className="grid md:grid-cols-2 gap-3">
              <SwotCard title="Strengths" tone="positive" items={["Working end-to-end pipeline, not a mock", "Four complementary founders, conflict aired in-call", "Every claim carries a source and trust score"]} />
              <SwotCard title="Weaknesses" tone="warning" items={["Deck overstated time-to-memo (24h vs 48h)", "Screening still deterministic, not scored", "No paying fund yet — two pilots pending"]} />
              <SwotCard title="Opportunities" tone="teal" items={["Seed-stage deal volume rising faster than analyst headcount", "Opportunity DB reusable across funds", "Interview transcript becomes proprietary training data"]} />
              <SwotCard title="Threats" tone="negative" items={["Incumbent CRMs adding AI screening", "Founder resistance to being interviewed by an agent", "Data-protection terms around interview recordings"]} />
            </div>
          </section>

          {/* Problem / product */}
          <section>
            <SectionTitle n="04" title="Problem & product" />
            <div className="space-y-3 text-[13.5px] leading-relaxed text-foreground/90">
              <p>
                A partner running screening reads one memo before deciding whether a deal survives. Producing that memo today means an analyst manually reconciling a deck, a website and a call — days of work in which nothing is traceable afterwards<Source id="2" hint="Fund workflow interviews" />. FirstCheck runs sourcing and developing as an explicit pipeline: claims enter as <em>claimed</em> with self-reported trust, corroboration moves them, contradictions are recorded rather than smoothed over, and gaps stay visible as gaps<Source id="3" hint="Interview 12:12" />.
              </p>
              <p>
                The product is the board, the four-stage pipeline (company snapshot → founder profiles → agent interview → due diligence) and the negotiation model that moves BATNA and ZOPA live during the call. Founder profiles carry five scored axes plus an open 16-personalities hypothesis that only the interview can confirm — never a psychometric verdict issued from a deck<Source id="1" hint="Deck v3.2 · slide 12" />.
              </p>
            </div>
          </section>

          {/* Traction */}
          <section>
            <SectionTitle n="05" title="Traction · KPIs" />
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-surface border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Metric</th>
                    <th className="text-right px-4 py-2.5 font-medium">Founder claim</th>
                    <th className="text-right px-4 py-2.5 font-medium">Verified</th>
                    <th className="text-right px-4 py-2.5 font-medium">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <KPI m="Signed LoIs" a="3" v="2" d="-1" />
                  <KPI m="Paid pilots" a="0" v="0" d="0" />
                  <KPI m="Pilot capacity claimed" a="40 t/day" v="12 t/day" d="-70%" bad />
                  <KPI m="B4 variant stability" a="40h @ 65°C" v="40h @ 65°C" d="✓" good />
                  <KPI m="Team size (FTE)" a="7" v="6.5" d="-0.5" />
                  <KPI m="Runway (months)" a="14" v="13" d="-1" />
                </tbody>
              </table>
            </Card>
          </section>

          {/* Team */}
          <section>
            <SectionTitle n="06" title="Team history" />
            <ul className="space-y-2.5 text-[13px] text-foreground/90">
              {ACME_FOUNDERS.map((f) => (
                <li key={f.id}>
                  · <b>{f.name}</b> — {f.role}.{" "}
                  <a href={f.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    LinkedIn
                  </a>
                  <div className="pl-3 text-[12.5px] text-muted-foreground leading-relaxed">{f.history}</div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] text-muted-foreground">
              Contribution split sourced from the repository history. Prior career history is founder-supplied and not
              yet corroborated — LinkedIn is not machine-readable without authentication.
            </p>
          </section>

          {/* Diligence log */}
          <section>
            <SectionTitle n="07" title="Diligence log" />
            <Card className="p-4 text-[12.5px] text-muted-foreground leading-relaxed">
              48 evidence items · 14 sources · 4 references · 1 founder interview · 6 lanes · 82% People, 68% Product, 74% Market, 55% Traction, 40% Legal, 48% Financials. Full log available at <a href="/diligence" className="text-primary hover:underline">/diligence</a>.
            </Card>
          </section>

          {/* Open issues */}
          <section>
            <SectionTitle n="08" title="Open issues" />
            <ul className="space-y-2">
              <Issue tag="Contradiction" text="Pilot-scale claim overstated (40 → 12 t/day). Founder acknowledged in interview 02:47." />
              <Issue tag="Missing" text="Cap table not disclosed in data room." />
              <Issue tag="Missing" text="Capex scale-up model for pilot deployment." />
              <Issue tag="Open" text="EPFL IP license terms — exclusivity and field of use." />
            </ul>
          </section>

          {/* Recommendation */}
          <section>
            <SectionTitle n="09" title="Recommendation" />
            <div className="grid md:grid-cols-3 gap-3">
              <Rec title="Pass" tone="muted" body="Deprioritize until third-party benchmark and clean cap table." />
              <Rec title="Partner review" tone="teal" body="Advance to IC with two conditions: (1) close pilot-scale contradiction, (2) resolve IP license." recommended />
              <Rec title="Term sheet" tone="primary" body="Move directly to term sheet at €3.5M seed · 18% dilution · pro-rata." />
            </div>
            <div className="mt-4 rounded-md border border-border bg-surface p-4 text-[13px] leading-relaxed">
              <span className="font-medium">Screening lead recommendation · Partner review.</span> Founder score of 88 and trust score of 92 justify partner time. Two open contradictions must be closed before IC. Confidence in recommendation: 84 / 100.
            </div>
          </section>
        </article>

        {/* Right rail */}
        <aside className="space-y-4 h-fit lg:sticky lg:top-[72px]">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[13px] font-medium">Composite view</div>
            </div>
            <div className="space-y-2.5">
              <ScoreBar label="Founder" value={88} />
              <ScoreBar label="Market" value={74} />
              <ScoreBar label="Idea ↔ Market" value={81} />
              <ScoreBar label="Trust" value={92} />
              <ScoreBar label="Thesis fit" value={87} />
              <ScoreBar label="Memo confidence" value={84} />
            </div>
          </Card>

          <Card className="p-0">
            <div id="evidence" />
            <div className="px-4 py-3 border-b border-border text-[13px] font-medium">Sources · 14</div>
            <ol className="p-4 space-y-2 text-[11.5px]">
              {["Deck v3.2 · slide 8, 12", "IEA CCUS 2025 report", "Founder interview 12:12", "Reference · M. Vlček (Holcim)", "Google Scholar · Osei, A.", "Reference · J. Patel (ex-Ginkgo)", "GitHub · helix-bio (30d)", "Data room · P&L 12mo", "Reference · Prof. E. Weber", "helix.bio (crawl)"].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-primary shrink-0">[{i + 1}]</span>
                  <span className="text-foreground/85 leading-snug">{s}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-muted-foreground shrink-0 mt-0.5" />
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-mono text-[11px] text-muted-foreground">{n}</span>
      <h2 className="font-serif text-[22px] leading-none tracking-tight">{title}</h2>
    </div>
  );
}

function Snap({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[13.5px] font-medium">{value}</div>
    </div>
  );
}

function Hypothesis({ n, text, conf }: { n: string; text: string; conf: number }) {
  return (
    <li className="rounded-md border border-border p-4 flex items-start gap-3 bg-card">
      <span className="font-mono text-[11px] text-primary mt-0.5">{n}</span>
      <div className="flex-1 text-[13px] leading-relaxed">{text}</div>
      <div className="w-28 shrink-0">
        <ScoreBar label="Confidence" value={conf} />
      </div>
    </li>
  );
}

function SwotCard({ title, tone, items }: { title: string; tone: "positive" | "warning" | "negative" | "teal"; items: string[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge tone={tone}>{title}</Badge>
      </div>
      <ul className="space-y-1.5 text-[12.5px] text-foreground/90">
        {items.map((it, i) => <li key={i}>· {it}</li>)}
      </ul>
    </Card>
  );
}

function KPI({ m, a, v, d, good, bad }: { m: string; a: string; v: string; d: string; good?: boolean; bad?: boolean }) {
  return (
    <tr>
      <td className="px-4 py-2.5">{m}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{a}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{v}</td>
      <td className={"px-4 py-2.5 text-right font-mono tabular-nums " + (good ? "text-positive" : bad ? "text-negative" : "text-muted-foreground")}>{d}</td>
    </tr>
  );
}

function Issue({ tag, text }: { tag: string; text: string }) {
  const tone = tag === "Contradiction" ? "warning" : tag === "Missing" ? "negative" : "outline";
  return (
    <li className="flex items-start gap-3 rounded-md border border-border p-3">
      <Badge tone={tone as never}>{tag}</Badge>
      <span className="text-[12.5px] text-foreground/90">{text}</span>
    </li>
  );
}

function Rec({ title, body, tone, recommended }: { title: string; body: string; tone: "muted" | "teal" | "primary"; recommended?: boolean }) {
  const style: Record<string, string> = {
    muted: "border-border bg-card",
    teal: "border-primary/40 bg-teal-soft/40 ring-1 ring-primary/30",
    primary: "border-border bg-card",
  };
  return (
    <div className={"rounded-md border p-4 relative " + style[tone]}>
      {recommended && (
        <div className="absolute -top-2 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5" /> Recommended
        </div>
      )}
      <div className="text-[13.5px] font-medium">{title}</div>
      <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
