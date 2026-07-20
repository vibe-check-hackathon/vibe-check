import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Section, Card, Badge, ScoreBar, EvidencePill } from "@/components/ui-kit";
import { STARTUPS, ACME_FOUNDERS } from "@/lib/data";
import { FileText, Globe, Github, Users, MapPin, Layers, ExternalLink, Sparkles, CheckCircle2, AlertTriangle, Linkedin, ChevronDown, Mic } from "lucide-react";

export const Route = createFileRoute("/applications")({
  head: () => ({ meta: [{ title: "Applications · VibeCheck" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const s = STARTUPS.find((x) => x.id === "firstcheck")!;

  return (
    <AppShell>
      <PageHeader
        crumbs={["Applications", s.company]}
        eyebrow={s.sector}
        title={s.company}
        description={s.oneLiner}
        actions={
          <>
            <Badge tone="teal">Fit {Math.round((s.thesisFit ?? 0) * 100)}%</Badge>
            <Link to={"/interviews" as never} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5"><Mic className="h-3.5 w-3.5" /> Live interview</Link>
            <button className="h-8 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground">Advance to term sheet</button>
          </>
        }
      />

      <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
        {/* Left / main */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="text-[13px] font-medium">Application record · OPP-2026-0001</div>
              <div className="text-[11px] text-muted-foreground">Fictional demo card</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
              <Field label="Round" value={s.round} />
              <Field label="Ask" value={s.ask} />
              <Field label="Geography" value={s.geography} icon={<MapPin className="h-3 w-3" />} />
              <Field label="Stage" value={s.stage} icon={<Layers className="h-3 w-3" />} />
            </div>
            <div className="border-t border-border p-5 grid md:grid-cols-2 gap-3">
              <Ref href="https://github.com/vibe-check-hackathon/vibe-check" icon={<FileText className="h-3.5 w-3.5" />} title="Product repository" hint="Static demo source" />
              <Ref href="acme.example" icon={<Globe className="h-3.5 w-3.5" />} title="acme-robotics.example" hint="Website · scraped" />
              <Ref href="https://github.com/vibe-check-hackathon/vibe-check" icon={<Github className="h-3.5 w-3.5" />} title="github.com/vibe-check-hackathon" hint="Product repository (SRC-004)" />
              <Ref href="data-room" icon={<Users className="h-3.5 w-3.5" />} title="Pilot contracts" hint="SRC-007 · access granted" />
            </div>
            <div className="border-t border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Team</div>
                <Link to={"/founder" as never} className="text-[11px] text-primary hover:underline">Open founder psychogram →</Link>
              </div>
              <TeamGrid />
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[13px] font-medium">AI screening output</div>
              <Badge tone="teal" className="ml-2">research agent</Badge>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[13px] leading-relaxed text-foreground/90">
                FirstCheck sells demonstration-based model adaptation for warehouse picking robots — an operator shows a new SKU once and the system generalises. Two paid pilots and a technically credible team; the open risks are an ARR contradiction (CON-001, $120K vs $80K) and undocumented model-IP ownership (GAP-002), both routed into the live interview.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <ScoreBar label="Founder score" value={s.founderScore ?? 0} />
                <ScoreBar label="Market score" value={s.marketScore ?? 0} />
                <ScoreBar label="Idea ↔ Market fit" value={s.ideaMarketScore ?? 0} />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-md border border-border p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Strengths</div>
                  <ul className="text-[12.5px] space-y-1.5 text-foreground/90">
                    <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" /> Two paid pilots; deployment time cut 9d → 2d (HYP-001 supported).</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" /> CTO published relevant imitation-learning research (CLM-003).</li>
                    <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-positive mt-0.5 shrink-0" /> Complementary CEO/CTO split, aligned decision process.</li>
                  </ul>
                </div>
                <div className="rounded-md border border-border p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Risks &amp; open questions</div>
                  <ul className="text-[12.5px] space-y-1.5 text-foreground/90">
                    <li className="flex gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" /> ARR contradiction CON-001 ($120K vs $80K) — clarified on call.</li>
                    <li className="flex gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" /> Model-IP assignment GAP-002 — a real blocker, not a bluff.</li>
                    <li className="flex gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" /> Rights to customer-generated training data unclear (GAP-003).</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[13px] font-medium">Thesis match</div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Composite fit</div>
                <div className="font-serif text-[28px] leading-none">{Math.round((s.thesisFit ?? 0) * 100)}%</div>
              </div>
              <ThesisRow label="Sector · AI infrastructure" v={82} />
              <ThesisRow label="Stage · Pre-seed (€1–2M)" v={80} />
              <ThesisRow label="Geography · DACH / EU" v={100} />
              <ThesisRow label="Risk appetite · Technical" v={64} />
              <div className="pt-2 mt-1 border-t border-border">
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Fits the European AI-infrastructure thesis. Cleared once ARR is reconciled and model-IP assignment is confirmed.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="text-[13px] font-medium">Evidence</div>
              <span className="text-[11px] text-muted-foreground">7 sources</span>
            </div>
            <div className="p-4 space-y-2">
              <EvidencePill label="Founder application & deck (SRC-001)" verified />
              <EvidencePill label="Ada CV / employment (SRC-002)" verified />
              <EvidencePill label="Minh research paper (SRC-003)" verified />
              <EvidencePill label="Product repository (SRC-004)" verified />
              <EvidencePill label="Joint interview transcript (SRC-005)" verified />
              <EvidencePill label="Pilot contract & invoice (SRC-007)" />
              <EvidencePill label="Revenue export (requested)" />
              <div className="pt-2 mt-1 border-t border-border flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Trust score</span>
                <span className="font-mono tabular-nums text-warning">55 / 100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Section title="Real Maschmeyer opportunities (public sources)">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {STARTUPS.filter((x) => !x.demo).map((x) => (
            <Card key={x.id} className="p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-medium">{x.company}</div>
                <Badge tone="outline">{x.stage}</Badge>
              </div>
              <p className="mt-1.5 text-[12px] text-muted-foreground line-clamp-2">{x.oneLiner}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{x.geography}</span>
                <span className="text-positive">{x.realEvent?.split(" led ")[0] ?? "listed"}</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium">{icon} {value}</div>
    </div>
  );
}

function Ref({ href, popup, icon, title, hint }: { href: string; popup?: boolean; icon: React.ReactNode; title: string; hint: string }) {
  const real = href.startsWith("http") || href.startsWith("/");
  return (
    <a
      href={real ? href : "#" + href}
      target={real && !popup ? "_blank" : undefined}
      rel="noreferrer"
      onClick={
        popup
          ? (e) => {
              // Small pop-up viewer, e.g. the pitch deck (sun's code deck).
              e.preventDefault();
              window.open(href, "deck-viewer", "width=1080,height=720,noopener");
            }
          : undefined
      }
      className="flex items-center gap-3 rounded-md border border-border p-2.5 hover:border-primary/40 transition-colors"
    >
      <div className="h-7 w-7 rounded-md bg-surface-2 grid place-items-center text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-medium truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground" />
    </a>
  );
}

function ThesisRow({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 text-[12px]">{label}</div>
      <div className="w-24 h-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${v}%` }} /></div>
      <div className="w-8 text-right text-[11px] font-mono tabular-nums">{v}</div>
    </div>
  );
}

const ARCHETYPE: Record<string, { archetype: string; traits: string[]; summary: string; quotes: string[]; flag?: string }> = {
  "FND-0007": {
    archetype: "Commercial operator",
    traits: ["Decisive", "Execution-led", "Speed-biased"],
    summary: "Owns the commercial call and stays engaged under challenge. Cut deployment time 9d → 2d by rebuilding the capture flow on evidence rather than defending the first design.",
    quotes: ["\"At nine million with full pro-rata — yes, that's a conversation we want to have.\"", "\"We have two warehouses waiting and want to be deploying by September.\""],
  },
  "FND-0008": {
    archetype: "Technical researcher",
    traits: ["Rigorous", "Honest", "Risk-aware"],
    summary: "Built the prototype and authored the underlying research. Surfaced the IP-assignment timeline as a genuine blocker instead of bluffing past it.",
    quotes: ["\"Contracted today is $80K.\"", "\"We'd need our counsel to confirm the IP-assignment timeline first.\""],
    flag: "Model-IP assignment (GAP-002) not yet documented",
  },
};

function TeamGrid() {
  const [open, setOpen] = useState<string | null>("FND-0007");
  return (
    <div className="space-y-2">
      {ACME_FOUNDERS.map((p) => {
        const meta = ARCHETYPE[p.id];
        const isOpen = open === p.id;
        return (
          <div key={p.id} className="rounded-md border border-border overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : p.id)} className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface/60 transition-colors">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-[11px] font-medium">{p.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{p.role} · {p.id}</div>
              </div>
              <Badge tone="outline">{meta.archetype}</Badge>
              <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{p.score}</span>
              <ChevronDown className={"h-3.5 w-3.5 text-muted-foreground transition-transform " + (isOpen ? "rotate-180" : "")} />
            </button>
            {isOpen && (
              <div className="border-t border-border bg-surface/40 p-4 grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {meta.traits.map((t) => <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded bg-teal-soft text-foreground">{t}</span>)}
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-foreground/90">{meta.summary}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">In their own words</div>
                    <div className="space-y-1.5">
                      {meta.quotes.map((q, i) => <div key={i} className="text-[12px] italic text-foreground/80 border-l-2 border-primary/40 pl-2.5">{q}</div>)}
                    </div>
                  </div>
                  {meta.flag && (
                    <div className="rounded border border-warning/30 bg-warning/5 p-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-warning mb-1"><AlertTriangle className="h-3 w-3" /> Open question</div>
                      <div className="text-[11.5px] text-foreground/80">· {meta.flag}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span>{p.history.split(";")[0]}</span>
                    <a href="#" className="inline-flex items-center gap-1 hover:text-foreground"><Linkedin className="h-3 w-3" /> LinkedIn</a>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Founder axes</div>
                  {p.axes.map((d) => (
                    <div key={d.key}>
                      <div className="flex items-baseline justify-between"><span className="text-[11px]">{d.key}</span><span className="text-[11px] font-mono tabular-nums">{d.v}</span></div>
                      <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${d.v}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
