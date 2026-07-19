import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge, ScoreBar } from "@/components/ui-kit";
import { PhoneCall, PhoneIncoming, AlertTriangle, CheckCircle2, Play } from "lucide-react";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [{ title: "References · VibeCheck" }],
  }),
  component: ReferencesPage,
});

const REFS = [
  {
    who: "Prof. E. Weber",
    role: "PhD advisor · ETH Zürich",
    kind: "Academic mentor",
    conf: 96,
    status: "Completed",
    summary:
      "Describes Amina as 'the strongest doctoral researcher I have supervised in a decade,' particularly noting her ability to translate wet-lab results into industrial protocols.",
    quotes: [
      "She is the rare researcher who thinks in unit economics.",
      "I'd back her even if the enzyme were a completely different molecule.",
    ],
    flags: [],
    consistency: 98,
  },
  {
    who: "Dr. Julien Patel",
    role: "Former manager · Ginkgo Bioworks",
    kind: "Former employer",
    conf: 84,
    status: "Completed",
    summary:
      "Managed Lukas (CTO) on the industrial biocatalysts team. Highlights execution speed, calls out that his 'prior exit' was actually a partial acqui-hire in 2019, not a full exit as previously stated.",
    quotes: ["He shipped platforms other people talked about."],
    flags: ["Prior exit framing inconsistent with founder's deck"],
    consistency: 74,
  },
  {
    who: "Ana Fischer",
    role: "Ex-cofounder · Sirona Bio",
    kind: "Former co-founder",
    conf: 71,
    status: "In progress",
    summary: "Live now with Kestrel agent.",
    quotes: [],
    flags: [],
    consistency: 0,
  },
  {
    who: "Marek Vlček",
    role: "Head of Innovation · Holcim (pilot lead)",
    kind: "Prospective customer",
    conf: 88,
    status: "Completed",
    summary:
      "Confirms LoI is signed; paid pilot depends on Q4 milestone. Enthusiastic about variant B4 stability results.",
    quotes: ["If they hit 60 hours at 70°C we go to procurement immediately."],
    flags: [],
    consistency: 91,
  },
];

export function ReferencesPage() {
  return (
    <AppShell>
      <PageHeader
        crumbs={["References", "Helix Bio"]}
        eyebrow="Voice-agent reference calls"
        title="References · Helix Bio"
        description="4 references contacted, 3 completed. Every quote is timestamped, linked to a source, and cross-checked against founder claims."
        actions={
          <>
            <Badge tone="warning">1 contradiction</Badge>
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">Add reference</button>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Trigger 3 more calls</button>
          </>
        }
      />

      <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
        {/* Live call panel */}
        <div className="lg:col-span-1">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-positive pulse-dot" />
                Live call · Kestrel agent
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-soft grid place-items-center text-[12px] font-medium text-primary">AF</div>
                <div>
                  <div className="text-[13.5px] font-medium">Ana Fischer</div>
                  <div className="text-[11px] text-muted-foreground">Ex-cofounder · Sirona Bio · in progress</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>08:14 / ~15:00</span>
                <span>Signal · good</span>
              </div>
              <div className="mt-2 flex items-center gap-[2px] h-10">
                {Array.from({ length: 60 }).map((_, i) => {
                  const h = 15 + Math.abs(Math.sin(i * 0.4 + Date.now() * 0.0001) * 55);
                  return <div key={i} className="w-[3px] rounded-full bg-primary/80" style={{ height: `${h}%` }} />;
                })}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className="h-9 flex-1 rounded-md bg-primary text-primary-foreground text-[12px] font-medium flex items-center justify-center gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Listen live
                </button>
                <button className="h-9 w-9 rounded-md border border-border grid place-items-center"><PhoneCall className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Current line of inquiry</div>
              <div className="rounded-md bg-surface border border-border p-3 text-[12.5px] leading-snug">
                "During Sirona, how did Amina handle disagreement inside the founding team, and was there ever a decision she made you disagreed with?"
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Auto-generated next</div>
                <ol className="space-y-1.5 text-[12px] text-muted-foreground">
                  <li>· Why did Sirona wind down in 2023?</li>
                  <li>· Would you invest in her next company personally?</li>
                  <li>· One thing she should hire against?</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>

        {/* Reference list */}
        <div className="lg:col-span-2 space-y-3">
          {REFS.map((r) => (
            <Card key={r.who} className="p-0">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-surface-2 grid place-items-center text-[12px] font-medium">
                  {r.who.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-medium truncate">{r.who}</div>
                    <Badge tone="outline">{r.kind}</Badge>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground truncate">{r.role}</div>
                </div>
                <Badge tone={r.status === "Completed" ? "positive" : "teal"}>
                  {r.status === "In progress" ? <><PhoneIncoming className="h-3 w-3" /> Live</> : r.status}
                </Badge>
              </div>
              <div className="p-5 grid md:grid-cols-[1fr_180px] gap-5">
                <div className="min-w-0">
                  <p className="text-[13px] leading-relaxed text-foreground/90">{r.summary}</p>
                  {r.quotes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {r.quotes.map((q, i) => (
                        <blockquote key={i} className="border-l-2 border-primary/60 pl-3 text-[12.5px] italic text-foreground/80">
                          "{q}"
                        </blockquote>
                      ))}
                    </div>
                  )}
                  {r.flags.length > 0 && (
                    <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2.5 flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                      <div className="text-[12px] text-foreground/90">
                        <span className="font-medium">Red flag · </span>{r.flags[0]}
                      </div>
                    </div>
                  )}
                  {r.status === "Completed" && r.flags.length === 0 && (
                    <div className="mt-3 flex items-center gap-2 text-[11.5px] text-positive">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Consistent with founder's claims
                    </div>
                  )}
                </div>
                {r.status === "Completed" && (
                  <div className="space-y-2.5">
                    <ScoreBar label="Confidence" value={r.conf} />
                    <ScoreBar label="Consistency" value={r.consistency} />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
