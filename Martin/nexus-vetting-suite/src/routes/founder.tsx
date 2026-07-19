import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Badge } from "@/components/ui-kit";
import { Sparkles, Lock, ChevronRight, UserPlus, BrainCircuit } from "lucide-react";
import { useSubmittedApplications } from "@/lib/applications";
import { ACME_FOUNDERS, ACME_TEAM, type DemoFounder } from "@/lib/data";

export const Route = createFileRoute("/founder")({
  head: () => ({ meta: [{ title: "Founder Psychogram · VibeCheck" }] }),
  component: FounderPage,
});

/* live-evidence quotes per founder+axis (from the INT-001 transcript) */
const QUOTES: Record<string, Record<string, { q: string; t: string }>> = {
  "FND-0007": {
    Resilience: { q: "At nine million with full pro-rata — yes, that's a conversation we want to have.", t: "INT-001 · 03:36" },
    Autonomy: { q: "The first took nine days on site… the second was live in under two days.", t: "INT-001 · 00:58" },
    Curiosity: { q: "We rebuilt the demonstration-capture flow.", t: "INT-001 · 00:58" },
    Perseverance: { q: "We have two warehouses waiting and want to be deploying by September.", t: "INT-001 · 02:36" },
    "Co-founder fit": { q: "Honestly? Speed.", t: "INT-001 · 02:36" },
  },
  "FND-0008": {
    Resilience: { q: "Ten days is… fast.", t: "INT-001 · 03:16" },
    Autonomy: { q: "The $120K includes the second pilot that's signed but starts billing next quarter. Contracted today is $80K.", t: "INT-001 · 01:46" },
    "Co-founder fit": { q: "We'd need our counsel to confirm the IP-assignment timeline first.", t: "INT-001 · 03:16" },
  },
};

type Tab = string; // a founder id, or "TEAM"

function FounderPage() {
  const [tab, setTab] = useState<Tab>(ACME_FOUNDERS[0].id);
  const active = ACME_FOUNDERS.find((f) => f.id === tab);

  return (
    <AppShell>
      <PageHeader
        crumbs={["Founders", "FirstCheck", active?.name ?? "Team overview"]}
        eyebrow="Founder psychogram · OPP-2026-0001 · FirstCheck"
        title="Founder psychogram"
        description="Five-axis, evidence-based founder profiles. Sub-scores stay separate — the headline number never hides its components."
        actions={<Link to={"/interviews" as never} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5">← Live interview</Link>}
      />

      {/* guardrail banner */}
      <div className="px-8 pt-5">
        <div className="rounded-md border border-warning/40 bg-warning/5 px-4 py-2.5 flex items-start gap-2.5 text-[12px] text-foreground/90">
          <Lock className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
          <span>This scored psychogram runs only on the <span className="font-medium">FirstCheck</span> demo, whose founders are members of this team using their own names and photos with consent. Third-party founders (Secfix, deskbird, VoiceLine…) are shown from public data and <span className="font-medium">deliberately never scored</span> — the suite does not fabricate psychometric judgments of people who have not opted in.</span>
        </div>
      </div>

      <InboundFounders />

      <div className="px-8 pt-4">
        <div className="flex gap-2">
          {ACME_FOUNDERS.map((f) => (
            <TabBtn
              key={f.id}
              active={tab === f.id}
              onClick={() => setTab(f.id)}
              initials={f.initials}
              photo={f.photo}
            >
              {f.name} <span className="text-muted-foreground font-normal">{f.role}</span>
            </TabBtn>
          ))}
          <TabBtn active={tab === "TEAM"} onClick={() => setTab("TEAM")} initials="✦">Team overview</TabBtn>
        </div>
      </div>

      {active ? <FounderView founder={active} /> : <TeamView founders={ACME_FOUNDERS} />}
    </AppShell>
  );
}

function FounderView({ founder }: { founder: DemoFounder }) {
  const radarData = founder.axes.map((a) => ({ axis: a.key, value: a.v }));
  return (
    <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
      {/* left: psychogram + score */}
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {founder.photo ? (
                <img src={founder.photo} alt={founder.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="h-11 w-11 rounded-full bg-surface-2 grid place-items-center text-[13px] font-semibold">{founder.initials}</span>
              )}
              <div>
                <div className="text-[15px] font-medium">{founder.name} — {founder.role}</div>
                <div className="text-[11px] text-muted-foreground">
                  {founder.id} ·{" "}
                  <a href={founder.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-serif text-[30px] leading-none">{founder.score}<span className="text-[14px] text-muted-foreground">/100</span></div>
              <div className="text-[11px] text-muted-foreground">conf {founder.confidence} · {founder.trend}</div>
            </div>
          </div>
          <div className="h-[280px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">Each axis is a 0–100 sub-score with its own confidence. Never averaged into the headline number.</p>
        </Card>
      </div>

      {/* right: personality hypothesis, then axis breakdown */}
      <div className="lg:col-span-2 space-y-4">
        <PersonalityCard founder={founder} />
        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-primary" /><span className="text-[13px] font-medium">Axis breakdown &amp; evidence</span></div>
          <div className="divide-y divide-border">
            {founder.axes.map((a) => {
              const quote = QUOTES[founder.id]?.[a.key];
              return (
                <div key={a.key} className="px-5 py-3.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13.5px] font-medium">{a.full}<span className="ml-2 text-[10.5px] font-normal text-muted-foreground">conf {a.conf}/100</span></span>
                    <span className="text-[14px] font-mono tabular-nums font-semibold">{a.v}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: a.v + "%" }} /></div>
                  {quote ? (
                    <details className="mt-2 rounded-md border-l-2 border-primary bg-surface">
                      <summary className="cursor-pointer list-none px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 text-primary transition-transform [details[open]_&]:rotate-90" />
                        <span className="text-positive font-semibold">Live evidence</span>
                        <span className="ml-auto">{quote.t}</span>
                      </summary>
                      <p className="px-3 pb-2.5 text-[12.5px] italic text-foreground/90">“{quote.q}”</p>
                    </details>
                  ) : (
                    <div className="mt-2 text-[11px] text-muted-foreground">No direct interview quote — inferred from research record.</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
          <div className="text-[11px] uppercase tracking-wider text-warning font-semibold mb-2">How to read this</div>
          <ul className="text-[12px] text-foreground/85 space-y-1.5">
            <li>· Probabilistic signals tied to interview hypotheses — never a personality read as fact from face or tone.</li>
            <li>· Conscientiousness is not rewarded as a standalone positive (sign flips at exit); extraversion is ignored.</li>
            <li>· Trait combinations matter — assertiveness × low emotional control reads as aggression, not confidence.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/** One colour per founder, so the overlay stays readable at four series. */
const TEAM_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

function TeamView({ founders }: { founders: DemoFounder[] }) {
  const keys = founders[0].axes.map((a) => a.key);
  // Every founder overlaid on the same five axes.
  const radarData = keys.map((k) => {
    const row: Record<string, string | number> = { axis: k };
    for (const f of founders) row[f.name] = f.axes.find((a) => a.key === k)!.v;
    return row;
  });
  return (
    <div className="px-8 py-6 grid lg:grid-cols-3 gap-4">
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-medium">Founding team</div>
            <div className="text-right"><div className="font-serif text-[28px] leading-none">{ACME_TEAM.score}<span className="text-[13px] text-muted-foreground">/100</span></div><div className="text-[11px] text-muted-foreground">complementarity · conf {ACME_TEAM.confidence}</div></div>
          </div>
          <div className="h-[280px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                {founders.map((f, i) => (
                  <Radar
                    key={f.id}
                    name={f.name}
                    dataKey={f.name}
                    stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                    fill={TEAM_COLORS[i % TEAM_COLORS.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12px]">
            {founders.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
                {f.name.split(" ")[0]} · {f.role}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <Card className="p-0">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-medium">Complementarity components</div>
          <div className="p-5 space-y-4">
            {ACME_TEAM.components.map((c) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between"><span className="text-[13px] font-medium">{c.name}</span><span className="text-[13px] font-mono tabular-nums font-semibold">{c.v}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden"><div className={"h-full rounded-full " + (c.v >= 70 ? "bg-positive" : c.v >= 50 ? "bg-primary" : "bg-warning")} style={{ width: c.v + "%" }} /></div>
                <div className="mt-1 text-[12px] text-muted-foreground">{c.why}</div>
              </div>
            ))}
            <p className="text-[11.5px] text-muted-foreground pt-1 border-t border-border">Gated by the weakest component, not the mean — a strong skill split with an untested relationship is a documented red-flag pattern.</p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Assessment note</div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{ACME_TEAM.note}</p>
        </Card>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, initials, color, photo, children }: { active: boolean; onClick: () => void; initials: string; color?: string; photo?: string | null; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={"flex items-center gap-2 rounded-full border pl-1.5 pr-3.5 py-1.5 text-[13px] font-medium transition-colors " + (active ? "border-primary text-foreground" : "border-border text-muted-foreground hover:bg-surface")}>
      {photo ? (
        <img src={photo} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold text-primary-foreground" style={{ background: color ?? "var(--muted-foreground)" }}>{initials}</span>
      )}
      {children}
    </button>
  );
}

/**
 * Founder profiles generated when an application is submitted. These carry
 * hypotheses to test, never scores — the applicant is a real person and no
 * axis has evidence behind it until the interview runs.
 */
function InboundFounders() {
  const submitted = useSubmittedApplications();
  if (submitted.length === 0) return null;

  return (
    <div className="px-8 pt-5">
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <span className="text-[13.5px] font-medium">Inbound founder profiles</span>
          <Badge tone="outline">{submitted.reduce((n, r) => n + (r.founders?.length ?? 0), 0)} founders</Badge>
        </div>
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Created automatically on submission, with the personality hypotheses the agent interview has to test.
          Unscored by design.
        </p>

        <div className="mt-4 space-y-4">
          {submitted.map((record) => (
            <div key={record.id} className="rounded-md border border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[12.5px] font-medium">{record.application.company}</span>
                <Badge tone={record.screening?.pass ? "positive" : "outline"}>
                  {record.screening?.pass ? "Passed screening" : "Screened out"}
                </Badge>
              </div>
              {(record.founders ?? []).map((f) => (
                <div key={f.id} className="px-3 py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-full bg-surface-2 grid place-items-center text-[11px] font-medium">
                      {f.avatar.value}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium">
                        {f.name}
                        {f.role && <span className="ml-1.5 text-muted-foreground font-normal">{f.role}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {f.public.linkedin ? (
                          <a href={f.public.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                            {f.public.linkedin.replace("https://www.", "")}
                          </a>
                        ) : (
                          "no public profile resolved"
                        )}
                        {" · "}
                        <span className="uppercase tracking-wider">{f.public.status}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-2.5 space-y-1.5 pl-9">
                    {f.hypotheses.map((h) => (
                      <li key={h.id} className="text-[12px]">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1.5">
                          {h.axis}
                        </span>
                        <span className="text-foreground/90">{h.text}</span>
                        <span className="block text-[11px] text-muted-foreground/80">{h.basis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


/**
 * The 16-personalities read, deliberately rendered as an *open hypothesis*
 * rather than a result: it is inferred from written material and only the
 * agent interview can support or contradict it.
 */
function PersonalityCard({ founder }: { founder: DemoFounder }) {
  const { type, label, hypothesis, basis, status, confidence } = founder.personality;
  const tone = status === "supported" ? "positive" : status === "contradicted" ? "negative" : "warning";

  return (
    <Card className="p-0">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <BrainCircuit className="h-3.5 w-3.5 text-primary" />
        <span className="text-[13px] font-medium">Personality hypothesis</span>
        <Badge tone="outline">16 personalities</Badge>
        <span className={"ml-auto text-[10px] uppercase tracking-wider text-" + tone}>
          {status === "open" ? "open · to be tested" : status}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-2.5">
          <span className="font-serif text-[26px] leading-none">{type}</span>
          <span className="text-[13px] text-muted-foreground">{label}</span>
          <span className="ml-auto text-[11px] text-muted-foreground">confidence {confidence}/100</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-warning" style={{ width: confidence + "%" }} />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-foreground/90">{hypothesis}</p>
        <p className="mt-2 text-[11.5px] text-muted-foreground">{basis}</p>
        <p className="mt-3 pt-2.5 border-t border-border text-[11.5px] text-muted-foreground">
          Held open on purpose. A type inferred from written material is a prompt for the interview, not a
          judgment — the agent tests it live and the confidence moves with the evidence.
        </p>
      </div>
    </Card>
  );
}
