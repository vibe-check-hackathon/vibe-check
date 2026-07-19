import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Section, Card, Badge } from "@/components/ui-kit";
import {
  ACME_FOUNDERS,
  EVALUATION_CRITERIA,
  STARTUPS,
  STAGES,
  companyInitials,
  founderInitials,
  founderNames,
  outcomeOf,
  stageColor,
  scoreTone,
  fmtScore,
  type FounderRef,
  type Stage,
  type Startup,
} from "@/lib/data";
import { loadSyntheticStartups } from "@/lib/synthetic-opportunities";
import { FileText, Filter, Globe2, LayoutGrid, Lock, Mic, Rows, Plus, Sparkles, X, Youtube } from "lucide-react";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [{ title: "Board · VibeCheck" }],
  }),
  component: BoardPage,
});

type SortKey = "date" | "money" | "name" | "score" | null;
type TableFilters = { historical: boolean; synthetic: boolean; realOnly: boolean; syntheticOnly: boolean };
const NO_FILTERS: TableFilters = { historical: false, synthetic: false, realOnly: false, syntheticOnly: false };

function BoardPage() {
  const [synthetic, setSynthetic] = useState<Startup[]>([]);
  const [selected, setSelected] = useState<Startup | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [filters, setFilters] = useState<TableFilters>(NO_FILTERS);
  const [command, setCommand] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  /** Natural-language table commands: "sort by money", "exclude historical", "only synthetic", "reset". */
  function applyCommand(text: string) {
    const t = text.toLowerCase();
    if (!t.trim()) return;
    if (/reset|clear|show all/.test(t)) {
      setFilters(NO_FILTERS);
      setSortKey(null);
      setFeedback("Reset — showing all deals, original order.");
      return;
    }
    const notes: string[] = [];
    let sk: SortKey = sortKey;
    let sd: 1 | -1 = sortDir;
    if (/date|recent|newest|latest|oldest/.test(t)) {
      sk = "date";
      sd = /oldest|asc/.test(t) ? 1 : -1;
      notes.push(`sorted by date (${sd === -1 ? "newest first" : "oldest first"})`);
    }
    if (/money|ask|amount|round size|raise|largest|biggest|smallest/.test(t)) {
      sk = "money";
      sd = /smallest|lowest|asc/.test(t) ? 1 : -1;
      notes.push(`sorted by round size (${sd === -1 ? "largest first" : "smallest first"})`);
    }
    if (/name|alphabet/.test(t)) {
      sk = "name";
      sd = /z-a|desc|reverse/.test(t) ? -1 : 1;
      notes.push("sorted by name");
    }
    if (/score/.test(t)) {
      sk = "score";
      sd = -1;
      notes.push("sorted by founder score");
    }
    const next = { ...filters };
    if (/(exclude|hide|without|no|remove) (the )?(historical|portfolio|old)/.test(t)) {
      next.historical = true;
      notes.push("excluding historical portfolio");
    }
    if (/(include|show|with) (the )?historical/.test(t)) {
      next.historical = false;
      notes.push("including historical portfolio");
    }
    if (/(exclude|hide|without|no|remove) synthetic/.test(t)) {
      next.synthetic = true;
      next.syntheticOnly = false;
      notes.push("excluding synthetic cohort");
    }
    if (/only synthetic|synthetic only/.test(t)) {
      next.syntheticOnly = true;
      next.realOnly = false;
      next.synthetic = false;
      notes.push("synthetic cohort only");
    }
    if (/only (real|official)|(real|official) only|official cards/.test(t)) {
      next.realOnly = true;
      next.syntheticOnly = false;
      notes.push("official cards only");
    }
    if (!notes.length) {
      setFeedback('Did not catch a command — try "sort by money", "sort by date oldest", "exclude historical", "only synthetic", "reset".');
      return;
    }
    setSortKey(sk);
    setSortDir(sd);
    setFilters(next);
    setView("table");
    setFeedback(notes.join(" · "));
  }

  function startVoice() {
    const SR = (window as unknown as Record<string, any>).SpeechRecognition ?? (window as unknown as Record<string, any>).webkitSpeechRecognition;
    if (!SR) {
      setFeedback("Voice input is not supported in this browser — type the command instead.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => {
      const text = e.results[0][0].transcript;
      setCommand(text);
      applyCommand(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  useEffect(() => {
    loadSyntheticStartups().then(setSynthetic).catch(() => {});
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const all = [...STARTUPS, ...synthetic];
  /* Portfolio lives in its own overview section under the board, not as a lane. */
  const pipelineStages = STAGES.filter((s) => s !== "Portfolio");
  const portfolio = all.filter((x) => x.stage === "Portfolio");
  const pipelineDeals = all.filter((x) => x.stage !== "Portfolio");
  const byStage: Record<Stage, typeof STARTUPS> = Object.fromEntries(
    pipelineStages.map((s) => [s, all.filter((x) => x.stage === s)]),
  ) as never;

  /* Table rows after the AI command bar's filters + sort. */
  let tableRows = all
    .filter((s) => !(filters.historical && s.stage === "Portfolio"))
    .filter((s) => !(filters.synthetic && s.synthetic))
    .filter((s) => !(filters.syntheticOnly && !s.synthetic))
    .filter((s) => !(filters.realOnly && (s.synthetic || s.demo)));
  if (sortKey) {
    tableRows = [...tableRows].sort((a, b) => {
      if (sortKey === "name") return a.company.localeCompare(b.company) * sortDir;
      const av = sortKey === "date" ? parseDateKey(a.submitted) : sortKey === "money" ? parseMoney(a.ask) : (a.founderScore ?? -1);
      const bv = sortKey === "date" ? parseDateKey(b.submitted) : sortKey === "money" ? parseMoney(b.ask) : (b.founderScore ?? -1);
      return (av - bv) * sortDir;
    });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Board"
        title="Deal board"
        description="The live Acme demo plus the official public-source Maschmeyer opportunity cards from Laura's database."
        actions={
          <>
            <div className="flex items-center rounded-md border border-border bg-surface p-0.5">
              <button
                onClick={() => setView("kanban")}
                className={`h-7 px-2 rounded-[5px] text-[12px] flex items-center gap-1.5 ${view === "kanban" ? "bg-background font-medium" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="h-3 w-3" /> Kanban
              </button>
              <button
                onClick={() => setView("table")}
                className={`h-7 px-2 rounded-[5px] text-[12px] flex items-center gap-1.5 ${view === "table" ? "bg-background font-medium" : "text-muted-foreground"}`}
              >
                <Rows className="h-3 w-3" /> Table
              </button>
            </div>
            <button
              onClick={() => {
                const next = !filters.realOnly;
                setFilters({ ...filters, realOnly: next, syntheticOnly: false });
                setView("table");
                setFeedback(next ? "Official cards only." : "Showing all deals.");
              }}
              className={`h-8 rounded-md border px-3 text-[12px] flex items-center gap-1.5 ${filters.realOnly ? "border-primary/50 bg-secondary text-secondary-foreground" : "border-border bg-surface"}`}
            >
              <Filter className="h-3 w-3" /> Official cards
            </button>
          </>
        }
      />

      {view === "kanban" && (<>
      <div className="px-6 py-5 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {pipelineStages.map((stage) => (
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
                  <Card key={s.id} onClick={() => setSelected(s)} className="p-3 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <CompanyMark startup={s} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate">{s.company}</div>
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {s.geography}
                          </div>
                        </div>
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${scoreTone(s.founderScore)}`}>
                        {fmtScore(s.founderScore)}
                      </div>
                    </div>
                    <FounderStrip startup={s} />
                    <p className="mt-2 text-[11.5px] text-muted-foreground leading-snug line-clamp-2">
                      {s.oneLiner}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MicroAxis label="F" v={s.founderScore} />
                      <MicroAxis label="M" v={s.marketScore} />
                      <MicroAxis label="I/M" v={s.ideaMarketScore} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Badge tone="outline">{s.sector.split(" / ")[0]}</Badge>
                        <span className="text-[10.5px] text-muted-foreground">{s.ask}</span>
                      </div>
                      {s.urgency === "High" && <Badge tone="warning">Urgent</Badge>}
                      {s.trustScore != null && s.trustScore >= 85 && <Badge tone="positive">Trust {s.trustScore}</Badge>}
                      {s.synthetic && <Badge tone="positive">synthetic</Badge>}
                      {!s.assessed && <Badge tone="outline">not assessed</Badge>}
                    </div>
                    {(s.website || s.sourceCardUrl) && (
                      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2">
                        {s.website && (
                          <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-foreground">
                            <Globe2 className="h-3 w-3" /> Website
                          </a>
                        )}
                        {s.sourceCardUrl && (
                          <a href={s.sourceCardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-foreground">
                            <FileText className="h-3 w-3" /> Card
                          </a>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio overview — existing contacts + alignments with new deals */}
      <Section title="Portfolio · existing contacts & potential alignments">
        <p className="mb-3 -mt-1 text-[11.5px] text-muted-foreground">
          Companies the group already backed. Shared domains with pipeline deals are shown as
          alignment chips — an existing contact is an intro path, a reference source, or a synergy check.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((p) => {
            const aligned = alignmentsFor(p, pipelineDeals);
            const outcome = outcomeOf(p);
            return (
              <Card key={p.id} onClick={() => setSelected(p)} className="p-3 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <CompanyMark startup={p} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{p.company}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.sector}</div>
                  </div>
                  {outcome && <Badge tone={outcome.tone}>{outcome.label.split(" — ")[0]}</Badge>}
                </div>
                <div className="mt-2 text-[10.5px] text-muted-foreground truncate">
                  Contacts: {founderNames(p.founders)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
                  {aligned.length ? (
                    <>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Aligns</span>
                      {aligned.slice(0, 3).map(({ co, shared }) => (
                        <span key={co.id} title={`shared: ${shared.join(", ")}`} className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                          {co.company}
                        </span>
                      ))}
                      {aligned.length > 3 && <span className="text-[10px] text-muted-foreground">+{aligned.length - 3}</span>}
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No pipeline alignment yet</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>
      </>)}

      {/* Table view */}
      {view === "table" && (
      <Section title="All deals · table">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-teal" />
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCommand(command)}
              placeholder='Tell the table what to do — "sort by money", "sort by date oldest", "exclude historical", "only synthetic", "reset"'
              className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <button onClick={() => applyCommand(command)} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]">
            Apply
          </button>
          <button
            onClick={startVoice}
            title="Speak a command"
            className={`h-8 w-8 grid place-items-center rounded-md border ${listening ? "border-negative text-negative animate-pulse" : "border-border bg-surface text-muted-foreground"}`}
          >
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>
        {feedback && <div className="mb-2 text-[11px] text-muted-foreground">✓ {feedback}</div>}
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
              {tableRows.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)} className="hover:bg-surface/60 cursor-pointer">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <CompanyMark startup={s} compact />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.company}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{founderNames(s.founders)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${stageColor(s.stage)}`}>{s.stage}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    <div>{s.sector}</div>
                    {(s.vehicle || s.companyStatus) && (
                      <div className="text-[10.5px] text-muted-foreground/80">
                        {[s.vehicle, s.companyStatus].filter(Boolean).join(" / ")}
                      </div>
                    )}
                  </td>
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
      )}

      {selected && <DealDetail startup={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio alignment: shared domains between a pipeline deal and    */
/*  existing portfolio companies = warm contact / synergy candidates.  */
/* ------------------------------------------------------------------ */
const DOMAIN_MAP: [RegExp, string][] = [
  [/robot|vision-guided|picking/, "robotics"],
  [/warehouse|logistic|freight|fulfil|supply chain/, "logistics"],
  [/schedul|routing|optimi[sz]|solver/, "planning & ops"],
  [/voice|speech|frontline/, "voice AI"],
  [/sales|marketing|revenue|crm/, "go-to-market"],
  [/complian|security|kyc|aml/, "security & compliance"],
  [/climate|carbon|emission|heat-pump|energy/, "climate"],
  [/finance|insurance|fintech|card|payment|spend|lending|reconcil|collections/, "finance & insurance"],
  [/health|clinic|prior-auth|care\b/, "health"],
  [/workplace|desk booking|hybrid work|human resources|office/, "workplace & HR"],
  [/developer|dev tool|ci flake|tooling/, "developer tools"],
  [/property|real estate|construction|buildstock/, "real estate"],
  [/industrial|manufactur|packaging|acoustic/, "industrial AI"],
];

function domainsOf(s: Startup): string[] {
  const text = `${s.sector} ${s.oneLiner}`.toLowerCase();
  return DOMAIN_MAP.filter(([re]) => re.test(text)).map(([, domain]) => domain);
}

/** Companies in `pool` sharing at least one domain with `target`. */
function alignmentsFor(target: Startup, pool: Startup[]): { co: Startup; shared: string[] }[] {
  const targetDomains = domainsOf(target);
  return pool
    .filter((p) => p.id !== target.id)
    .map((p) => ({ co: p, shared: domainsOf(p).filter((d) => targetDomains.includes(d)) }))
    .filter((x) => x.shared.length > 0);
}

const PORTFOLIO_POOL = STARTUPS.filter((s) => s.stage === "Portfolio");

/* ---------- table sorting helpers (AI command bar) ---------- */
function parseMoney(ask: string): number {
  const m = ask.match(/([\d.]+)\s*M/i);
  return m ? parseFloat(m[1]) : -1;
}
function parseDateKey(submitted: string): number {
  const full = Date.parse(submitted);
  if (!Number.isNaN(full)) return full;
  const year = submitted.match(/^\d{4}$/);
  return year ? Date.parse(`${submitted}-01-01`) : 0;
}

/** The five founder-evaluation axes (laura/founder-axis-scoring.md). */
const FOUNDER_AXES = ["Resilience", "Autonomy", "Curiosity", "Perseverance", "Co-founder fit"] as const;
const SYNTHETIC_SCORE_KEYS: Record<(typeof FOUNDER_AXES)[number], string> = {
  Resilience: "resilience",
  Autonomy: "autonomy",
  Curiosity: "curiosity",
  Perseverance: "perseverance",
  "Co-founder fit": "teamComplementarity",
};

/** Axis values for a founder: synthetic → generated scores, Acme demo → psychogram, real → null (never fabricated). */
function axisValuesFor(s: Startup, f: FounderRef): Record<string, number> | null {
  if (s.synthetic && f.scores) {
    return Object.fromEntries(FOUNDER_AXES.map((a) => [a, f.scores![SYNTHETIC_SCORE_KEYS[a]] ?? 0]));
  }
  if (s.demo) {
    const demo = ACME_FOUNDERS.find((d) => d.id === f.id);
    if (demo) return Object.fromEntries(demo.axes.map((a) => [a.key === "Co-founder fit" ? "Co-founder fit" : a.key, a.v]));
  }
  return null;
}

function DealDetail({ startup: s, onClose }: { startup: Startup; onClose: () => void }) {
  const outcome = outcomeOf(s);
  const portfolioAlignments = s.stage === "Portfolio" ? [] : alignmentsFor(s, PORTFOLIO_POOL);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-label={`${s.company} details`}>
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <Card className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto p-5">
        <button onClick={onClose} className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3">
          <CompanyMark startup={s} />
          <div className="min-w-0">
            <div className="text-[16px] font-semibold">{s.company}</div>
            <div className="text-[11.5px] text-muted-foreground">
              {s.id} · {s.sector} · {s.geography}
              {s.vehicle ? ` · ${s.vehicle} ${s.portfolioYear ?? ""}` : ""}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className={`text-[11px] px-1.5 py-0.5 rounded ${stageColor(s.stage)}`}>{s.stage}</span>
              {outcome && <Badge tone={outcome.tone}>{outcome.label}</Badge>}
              {s.synthetic && <Badge tone="positive">synthetic — nobody real</Badge>}
              {s.demo && <Badge tone="positive">live demo (fictional)</Badge>}
              {!s.assessed && <Badge tone="outline">not assessed</Badge>}
            </div>
          </div>
        </div>

        {s.realEvent && (
          <DetailBlock title="Real event (public sources)">
            <p className="text-[12.5px] text-foreground">{s.realEvent}</p>
          </DetailBlock>
        )}

        {!s.demo && !s.synthetic && (
          <DetailBlock title="Evaluation retrospective">
            <div className="rounded-md border border-border bg-surface p-2.5">
              <div className="text-[11.5px] text-muted-foreground">
                Card retro-dated to <span className="font-mono text-foreground">{s.submitted}</span> — as if the
                24-hour evaluation ran just before the publicly announced event. Criteria applied (THESIS-001):
              </div>
              <table className="mt-2 w-full text-[11.5px]">
                <tbody className="divide-y divide-border/60">
                  {EVALUATION_CRITERIA.map((c) => (
                    <tr key={c.criterion}>
                      <td className="py-1 pr-3 font-medium text-foreground whitespace-nowrap align-top">{c.criterion}</td>
                      <td className="py-1 text-muted-foreground">{c.requirement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {outcome && (
                <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
                  <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">Real-life update</span>
                  <Badge tone={outcome.tone}>{outcome.label}</Badge>
                </div>
              )}
            </div>
          </DetailBlock>
        )}

        <DetailBlock title={s.synthetic ? "Founders — full data & sub-scores (fictional people)" : "Founders — evaluation metrics"}>
          <div className="space-y-2">
            {s.founders.map((f) => (
              <FounderRow key={f.id ?? f.name} founder={f} company={s.company} synthetic={!!s.synthetic} axes={axisValuesFor(s, f)} />
            ))}
          </div>
        </DetailBlock>

        {portfolioAlignments.length > 0 && (
          <DetailBlock title="Portfolio alignments — existing contacts">
            <div className="space-y-1.5">
              {portfolioAlignments.map(({ co, shared }) => (
                <div key={co.id} className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
                  <span className="text-[12px] font-medium">{co.company}</span>
                  <span className="text-[10.5px] text-muted-foreground">shared: {shared.join(", ")}</span>
                  <span className="ml-auto text-[10.5px] text-muted-foreground truncate max-w-[180px]">
                    contact: {founderNames(co.founders)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">
              An existing portfolio relationship in the same domain = warm intro path, reference source,
              or competitive-overlap check before term sheet.
            </p>
          </DetailBlock>
        )}

        <DetailBlock title="Interview">
          {s.interviewUrl ? (
            <a href={s.interviewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12.5px] text-primary hover:underline">
              <Youtube className="h-3.5 w-3.5" /> Public founder interview — studied by the Matching stage
            </a>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-muted-foreground">
              <Lock className="h-3 w-3" /> {s.synthetic || s.demo ? "AI interview runs in the live demo" : "Confidential — no public interview found"}
            </div>
          )}
        </DetailBlock>

        {(s.website || s.sourceCardUrl) && (
          <DetailBlock title="Documents">
            <div className="flex flex-wrap gap-3">
              {s.sourceCardUrl && (
                <a href={s.sourceCardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline">
                  <FileText className="h-3.5 w-3.5" /> Opportunity card (evidence ledger)
                </a>
              )}
              {s.website && (
                <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline">
                  <Globe2 className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          </DetailBlock>
        )}

        <p className="mt-4 border-t border-border pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
          {s.synthetic
            ? "Generated with faker.js (seed 4242): every person, score, email, and domain is fictional (.example TLD). This tier shows the full-consent experience we do not simulate for real people."
            : s.demo
              ? "Fictional demo company — powers the live interview studio and founder psychogram."
              : "Public sources only. Founder evaluations intentionally not assessed — no fabricated judgments of real people. LinkedIn links are search queries, not confirmed profiles."}
        </p>
      </Card>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function FounderRow({
  founder: f,
  company,
  synthetic,
  axes,
}: {
  founder: FounderRef;
  company: string;
  synthetic: boolean;
  axes: Record<string, number> | null;
}) {
  const linkedinSearch = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${f.name} ${company}`)}`;
  return (
    <div className="rounded-md border border-border bg-surface p-2.5">
      <div className="flex items-center gap-2.5">
        {f.avatar?.type === "image" ? (
          <img src={f.avatar.value} alt="" className="h-8 w-8 rounded-full border border-border object-cover" />
        ) : (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {founderInitials(f)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-medium">{f.name}</div>
          <div className="text-[11px] text-muted-foreground">{f.role}</div>
        </div>
        {synthetic ? (
          <Badge tone="positive">scored</Badge>
        ) : (
          <a href={f.linkedin ?? linkedinSearch} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
            LinkedIn ↗{f.linkedin ? "" : " (search)"}
          </a>
        )}
      </div>
      {synthetic && f.email && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          {f.email}
          {f.linkedin && (
            <>
              {" · "}
              <span className="text-muted-foreground">{f.linkedin.replace("https://", "")}</span>
            </>
          )}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {FOUNDER_AXES.map((axis) => (
          <span
            key={axis}
            className={`rounded border border-border px-1.5 py-0.5 text-[10px] ${axes ? "bg-background text-foreground" : "bg-surface text-muted-foreground"}`}
            title={axes ? undefined : "Not assessed — no fabricated scores for real people"}
          >
            {axis} <span className="font-mono">{axes ? axes[axis] : "—"}</span>
          </span>
        ))}
        {axes && f.scoreConfidence != null && (
          <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
            conf <span className="font-mono">{f.scoreConfidence}/100</span>
          </span>
        )}
      </div>
    </div>
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

function CompanyMark({ startup, compact = false }: { startup: Startup; compact?: boolean }) {
  const size = compact ? "h-8 w-8" : "h-9 w-9";
  const outcome = outcomeOf(startup);
  return (
    <div
      title={outcome?.label}
      className={`${size} group shrink-0 rounded-md border border-border bg-background grid place-items-center overflow-hidden text-[10px] font-medium text-muted-foreground`}
    >
      {startup.logoUrl ? (
        <>
          {/* interactive mark: brand logo flips to the canvas letter-mark on hover */}
          <img
            src={startup.logoUrl}
            alt=""
            className="h-full w-full object-contain p-1.5 group-hover:hidden"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="hidden h-full w-full place-items-center bg-primary/10 text-primary group-hover:grid">
            {companyInitials(startup.company)}
          </span>
        </>
      ) : (
        companyInitials(startup.company)
      )}
    </div>
  );
}

function FounderStrip({ startup }: { startup: Startup }) {
  return (
    <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
      {startup.founders.slice(0, 3).map((founder) => (
        <div key={founder.id ?? founder.name} className="flex min-w-0 items-center gap-1.5 rounded border border-border bg-surface px-1.5 py-1">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-medium text-primary">
            {founderInitials(founder)}
          </span>
          <span className="max-w-[108px] truncate text-[10.5px] text-foreground">{founder.name}</span>
        </div>
      ))}
      {startup.founders.length > 3 && (
        <span className="shrink-0 text-[10.5px] text-muted-foreground">+{startup.founders.length - 3}</span>
      )}
    </div>
  );
}
