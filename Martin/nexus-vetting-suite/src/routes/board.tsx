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
import { loadSyntheticStartups, invalidateSyntheticCache } from "@/lib/synthetic-opportunities";
import { useSubmittedApplications, applicationToStartup } from "@/lib/applications";
import { ArrowDownUp, FileText, Filter, Globe2, LayoutGrid, Lock, Mic, Rows, Plus, Search, Sparkles, X, Youtube } from "lucide-react";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [{ title: "Board · VibeCheck" }],
  }),
  component: BoardPage,
});

type SortKey = "date" | "money" | "name" | "score" | null;
type TableFilters = {
  historical: boolean;
  synthetic: boolean;
  realOnly: boolean;
  syntheticOnly: boolean;
  outboundOnly: boolean;
};
const NO_FILTERS: TableFilters = {
  historical: false,
  synthetic: false,
  realOnly: false,
  syntheticOnly: false,
  outboundOnly: false,
};

function BoardPage() {
  const [synthetic, setSynthetic] = useState<Startup[]>([]);
  const submitted = useSubmittedApplications();
  const [selected, setSelected] = useState<Startup | null>(null);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [filters, setFilters] = useState<TableFilters>(NO_FILTERS);
  const [query, setQuery] = useState("");
  const [attrQuery, setAttrQuery] = useState("");
  const [command, setCommand] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [llmIds, setLlmIds] = useState<string[] | null>(null);
  const [scanRegion, setScanRegion] = useState("europe");
  const [scanning, setScanning] = useState(false);

  /** Natural-language table commands: "sort by money", "exclude historical", "only synthetic", "reset". */
  function applyCommand(text: string) {
    const t = text.toLowerCase();
    if (!t.trim()) return;
    if (/reset|clear|show all/.test(t)) {
      setFilters(NO_FILTERS);
      setSortKey(null);
      setSortDir(-1);
      setQuery("");
      setAttrQuery("");
      setLlmIds(null);
      setFeedback("Reset - showing all deals, original order.");
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
    if (/(exclude|hide|without|no|remove) (synthetic|current app|current application)/.test(t)) {
      next.synthetic = true;
      next.syntheticOnly = false;
      notes.push("excluding current applications");
    }
    if (/only synthetic|synthetic only|only current app|current app only|current applications/.test(t)) {
      next.syntheticOnly = true;
      next.realOnly = false;
      next.outboundOnly = false;
      next.synthetic = false;
      notes.push("current applications only");
    }
    if (/only outbound|outbound only|outbound selected/.test(t)) {
      next.outboundOnly = true;
      next.syntheticOnly = false;
      next.realOnly = false;
      notes.push("outbound selected only");
    }
    if (/only (real|official)|(real|official) only|official cards/.test(t)) {
      next.realOnly = true;
      next.syntheticOnly = false;
      next.outboundOnly = false;
      notes.push("official cards only");
    }
    if (!notes.length) {
      const attrs = parseAttributeQuery(t);
      if (attrs.length) {
        setAttrQuery(t);
        setView("table");
        setFeedback(`attribute search: ${attrs.map((a) => a.label).join(" + ")} (all must match) — "reset" to clear`);
        return;
      }
      // Rule parser found nothing — hand the query to the LLM fallback (MVP #3).
      void llmFallback(t);
      return;
    }
    setSortKey(sk);
    setSortDir(sd);
    setFilters(next);
    setView("table");
    setFeedback(notes.join(" · "));
  }

  /** Unbounded queries the rule parser can't handle go to /nl-query, which asks
   *  whichever LLM key was set at launch (node laura/pipeline/set-key.js). */
  async function llmFallback(t: string) {
    setFeedback("Rule parser found nothing — asking the LLM…");
    const compact = all.map((s) => ({
      id: s.id,
      company: s.company,
      oneLiner: s.oneLiner,
      sector: s.sector,
      geography: s.geography,
      stage: s.stage,
      round: s.round,
      ask: s.ask,
      submitted: s.submitted,
      companyStatus: s.companyStatus ?? undefined,
      sourceChannel: s.sourceChannel,
      activitySignal: s.activitySignal ?? undefined,
      synthetic: s.synthetic ?? false,
      outboundSelected: s.outboundSelected ?? false,
      founders: s.founders.map((f) => ({ name: f.name, role: f.role })),
    }));
    try {
      const res = await fetch("/nl-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: t, deals: compact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error ?? "LLM fallback unavailable — try a structured command like \"sort by money\" or \"only outbound\".");
        return;
      }
      if (!data.ids?.length) {
        setFeedback(`LLM found no matching deals${data.reason ? ` — ${data.reason}` : ""}. "reset" to clear.`);
        return;
      }
      setLlmIds(data.ids);
      setView("table");
      setFeedback(`LLM (${data.provider}) matched ${data.ids.length} deal${data.ids.length === 1 ? "" : "s"}${data.reason ? `: ${data.reason}` : ""} — "reset" to clear`);
    } catch {
      setFeedback("Could not reach the LLM fallback — is the dev server running?");
    }
  }

  /** Live outbound refresh: the server asks the configured LLM (web search on
   *  Claude keys, labeled recall otherwise), screens the finds, persists them,
   *  and the board reloads so the new deals pop in — and stay. */
  async function runScan() {
    setScanning(true);
    setFeedback(`Scanning ${scanRegion === "us" ? "the US" : scanRegion === "china" ? "China" : "Europe"} for new on-thesis startups…`);
    try {
      const res = await fetch("/outbound-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: scanRegion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error ?? "Scan failed.");
        return;
      }
      invalidateSyntheticCache();
      setSynthetic(await loadSyntheticStartups());
      if (data.added === 0) {
        setFeedback("Scan finished — nothing new passed the thesis screen.");
        return;
      }
      setFilters({ ...NO_FILTERS, outboundOnly: true });
      setView("table");
      setFeedback(
        `Scan added ${data.added} new lead${data.added === 1 ? "" : "s"} (${data.mode === "web-searched" ? "web-sourced" : "UNVERIFIED model recall — verify before use"}): ${data.companies.join(", ")} — showing outbound, "reset" to clear`,
      );
    } catch {
      setFeedback("Could not reach the scan endpoint — is the dev server running?");
    } finally {
      setScanning(false);
    }
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

  // Inbound applications sit alongside every other card, newest first.
  const all = [...submitted.map(applicationToStartup), ...STARTUPS, ...synthetic];
  const normalizedQuery = query.trim().toLowerCase();
  const attrPreds = attrQuery ? parseAttributeQuery(attrQuery) : [];
  const visibleDeals = all
    .filter((s) => !llmIds || llmIds.includes(s.id))
    .filter((s) => attrPreds.every((p) => p.ok(s)))
    .filter((s) => !(filters.historical && s.stage === "Portfolio"))
    .filter((s) => !(filters.synthetic && s.synthetic))
    .filter((s) => !(filters.syntheticOnly && !s.synthetic))
    .filter((s) => !(filters.outboundOnly && !s.outboundSelected))
    .filter((s) => !(filters.realOnly && (s.synthetic || s.demo || s.outboundSelected)))
    .filter((s) => {
      if (!normalizedQuery) return true;
      const haystack = [
        s.company,
        s.sector,
        s.geography,
        s.stage,
        s.round,
        s.ask,
        s.companyStatus,
        s.vehicle,
        s.sourceChannel,
        s.activitySignal,
        s.outboundRationale,
        s.oneLiner,
        founderNames(s.founders),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  /* Portfolio lives in its own overview section under the board, not as a lane. */
  const pipelineStages = STAGES.filter((s) => s !== "Portfolio");
  const portfolio = visibleDeals.filter((x) => x.stage === "Portfolio");
  const pipelineDeals = visibleDeals.filter((x) => x.stage !== "Portfolio");
  const byStage: Record<Stage, typeof STARTUPS> = Object.fromEntries(
    pipelineStages.map((s) => [s, visibleDeals.filter((x) => x.stage === s)]),
  ) as never;

  /* Table rows after the AI command bar's filters + sort. */
  let tableRows = visibleDeals;
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
        description="The live FirstCheck demo plus the official public-source Maschmeyer opportunity cards from Laura's database."
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
          </>
        }
      />

      <div className="border-b border-border bg-background px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, founders, sectors..."
              className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[12.5px] outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <ToolbarToggle
            active={filters.realOnly}
            label="Official only"
            onClick={() => {
              const next = !filters.realOnly;
              setFilters({ ...filters, realOnly: next, syntheticOnly: false, outboundOnly: false, synthetic: false });
              setFeedback(next ? "Official cards only." : "Showing official, current application, outbound, and demo deals.");
            }}
          />
          <ToolbarToggle
            active={filters.syntheticOnly}
            label="Current apps"
            onClick={() => {
              const next = !filters.syntheticOnly;
              setFilters({ ...filters, syntheticOnly: next, realOnly: false, outboundOnly: false, synthetic: false });
              setFeedback(next ? "Current applications only." : "Showing all deal types.");
            }}
          />
          <ToolbarToggle
            active={filters.outboundOnly}
            label="Outbound selected"
            onClick={() => {
              const next = !filters.outboundOnly;
              setFilters({ ...filters, outboundOnly: next, syntheticOnly: false, realOnly: false });
              setFeedback(next ? "Outbound selected only." : "Showing all deal types.");
            }}
          />
          <ToolbarToggle
            active={filters.historical}
            label="Hide portfolio"
            onClick={() => {
              const next = !filters.historical;
              setFilters({ ...filters, historical: next });
              setFeedback(next ? "Historical portfolio hidden." : "Historical portfolio visible.");
            }}
          />

          <div className="flex items-center gap-1 rounded-md border border-border bg-surface px-2">
            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortKey ?? "none"}
              onChange={(e) => {
                const value = e.target.value as Exclude<SortKey, null> | "none";
                setSortKey(value === "none" ? null : value);
                setFeedback(value === "none" ? "Original order." : `Sorted by ${value}.`);
              }}
              className="h-8 bg-transparent text-[12px] outline-none"
            >
              <option value="none">Sort</option>
              <option value="money">Amount</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="score">Founder score</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === -1 ? 1 : -1)}
              className="h-6 rounded border border-border bg-background px-1.5 text-[10.5px] text-muted-foreground hover:text-foreground"
              title="Toggle sort direction"
            >
              {sortDir === -1 ? "Desc" : "Asc"}
            </button>
          </div>

          <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-teal" />
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCommand(command)}
              placeholder='Command: "sort by money", "current apps", "outbound", "hide portfolio", "reset"'
              className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground/70"
            />
            <button onClick={() => applyCommand(command)} className="h-6 rounded border border-border bg-surface px-2 text-[11px]">
              Apply
            </button>
            <button
              onClick={startVoice}
              title="Speak a command"
              className={`grid h-6 w-6 shrink-0 place-items-center rounded border ${listening ? "border-negative text-negative animate-pulse" : "border-border bg-surface text-muted-foreground"}`}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Live outbound refresh: LLM scan structured by the intelligence-
              brief template, screened, persisted — new deals pop in and stay. */}
          <div className="flex items-center gap-1.5">
            <select
              value={scanRegion}
              onChange={(e) => setScanRegion(e.target.value)}
              className="h-8 rounded-md border border-border bg-card px-2 text-[12px] outline-none"
              title="Region for the outbound scan"
            >
              <option value="europe">Europe</option>
              <option value="us">US</option>
              <option value="china">China</option>
            </select>
            <button
              onClick={runScan}
              disabled={scanning}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] flex items-center gap-1.5 disabled:opacity-60"
              title="Ask the configured LLM to find new on-thesis startups in this region"
            >
              <Globe2 className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning…" : "Scan outbound"}
            </button>
          </div>

          <button
            onClick={() => {
              setFilters(NO_FILTERS);
              setSortKey(null);
              setSortDir(-1);
              setQuery("");
              setCommand("");
              setFeedback("Reset - showing all deals, original order.");
            }}
            className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-muted-foreground hover:text-foreground"
          >
            Reset
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>
            Showing {visibleDeals.length} of {all.length} deals
            {sortKey ? ` - sorted by ${sortKey} (${sortDir === -1 ? "descending" : "ascending"})` : ""}
          </span>
          {feedback && <span>{feedback}</span>}
        </div>
      </div>

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
                      {s.currentApplication && <Badge tone="positive">current app</Badge>}
                      {s.outboundSelected && <Badge tone="teal">outbound</Badge>}
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
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[12px] text-muted-foreground">
                    No deals match the current search and filters.
                  </td>
                </tr>
              )}
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

function ToolbarToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 rounded-md border px-3 text-[12px] transition-colors ${
        active
          ? "border-primary/50 bg-secondary text-secondary-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
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
  const m = ask.match(/([\d.]+)\s*([BMK])?/i);
  if (!m) return -1;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "").toUpperCase();
  if (unit === "B") return n * 1000;
  if (unit === "K") return n / 1000;
  return n;
}
function parseDateKey(submitted: string): number {
  const full = Date.parse(submitted);
  if (!Number.isNaN(full)) return full;
  const year = submitted.match(/^\d{4}$/);
  return year ? Date.parse(`${submitted}-01-01`) : 0;
}

/* ---------- multi-attribute reasoning (challenge brief MVP #3) ----------
   Parses free text like "technical founder, Berlin, AI infra, enterprise
   traction, no prior VC backing" into predicates over structured deal data —
   every attribute must match (AND), not keyword-anywhere search. */
type AttrPredicate = { label: string; ok: (s: Startup) => boolean };

const GEO_QUERIES: [RegExp, string, (g: string) => boolean][] = [
  [/berlin/, "Berlin", (g) => g.includes("berlin")],
  [/munich/, "Munich", (g) => g.includes("munich")],
  [/amsterdam/, "Amsterdam", (g) => g.includes("amsterdam")],
  [/zurich|zürich/, "Zurich", (g) => g.includes("zurich")],
  [/copenhagen/, "Copenhagen", (g) => g.includes("copenhagen")],
  [/vienna/, "Vienna", (g) => g.includes("vienna")],
  [/germany|german\b/, "Germany", (g) => g.includes("de")],
  [/switzerland|swiss/, "Switzerland", (g) => g.includes("ch")],
  [/\bus\b|united states|american/, "US", (g) => g.includes("us")],
  [/europe(an)?/, "Europe", (g) => !/(^|\s)us$/.test(g.trim())],
];

function parseAttributeQuery(t: string): AttrPredicate[] {
  const preds: AttrPredicate[] = [];
  for (const [re, domain] of DOMAIN_MAP) {
    if (re.test(t)) preds.push({ label: domain, ok: (s) => domainsOf(s).includes(domain) });
  }
  if (/ai infra|ai infrastructure|\bai\b/.test(t)) {
    preds.push({ label: "AI", ok: (s) => /\bai\b|artificial intelligence/i.test(`${s.sector} ${s.oneLiner}`) });
  }
  for (const [re, label, ok] of GEO_QUERIES) {
    if (re.test(t)) {
      preds.push({ label, ok: (s) => ok(s.geography.toLowerCase()) });
      break;
    }
  }
  if (/technical (co-?)?founder|cto/.test(t)) {
    preds.push({ label: "technical founder", ok: (s) => s.founders.some((f) => /cto|technical|engineer/i.test(f.role ?? "")) });
  }
  if (/no (prior )?(vc|venture|backing|funding)|unbacked|first[- ]time raise/.test(t)) {
    preds.push({ label: "no prior VC backing", ok: (s) => /pre/i.test(s.round) || (!s.realEvent && s.stage !== "Portfolio") });
  }
  if (/traction|revenue|enterprise customers|paying customers/.test(t)) {
    preds.push({ label: "traction signal", ok: (s) => Boolean(s.realEvent) || /arr|customer|traction|pilot|enterprise/i.test(s.oneLiner) });
  }
  if (/accelerator|y ?combinator|\byc\b/.test(t)) {
    preds.push({ label: "accelerator", ok: (s) => /combinator|accelerator/i.test(`${s.website ?? ""} ${s.oneLiner} ${s.realEvent ?? ""}`) });
  }
  return preds;
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

/** Axis values for a founder: synthetic → generated scores, FirstCheck demo → psychogram, real → null (never fabricated). */
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
  const [copied, setCopied] = useState(false);
  const outcome = outcomeOf(s);
  const portfolioAlignments = s.stage === "Portfolio" ? [] : alignmentsFor(s, PORTFOLIO_POOL);
  const outreachDraft = [
    `Subject: ${s.company} — early-stage conversation`,
    "",
    `Hi ${s.founders[0]?.name?.split(" ")[0] ?? "there"},`,
    "",
    `${s.activitySignal ? `We noticed ${s.activitySignal}. ` : ""}${s.outboundRationale ?? "Your work fits our fund thesis."}`,
    "",
    "We write first checks at pre-seed/seed and give a clear answer within 24 hours of a complete application — deck plus company name is enough to start. Cold outreach, not cold investment: if raising is on your roadmap, we would like a real application from you.",
    "",
    "Best,",
    "The fund team",
  ].join("\n");
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
              {s.currentApplication && <Badge tone="positive">current app - fictional</Badge>}
              {s.outboundSelected && <Badge tone="teal">outbound selected</Badge>}
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

        {s.outboundRationale && (
          <DetailBlock title="Why selected">
            <p className="text-[12.5px] leading-relaxed text-foreground/90">{s.outboundRationale}</p>
          </DetailBlock>
        )}

        {s.activitySignal && (
          <DetailBlock title="Current activity signal">
            <p className="text-[12.5px] leading-relaxed text-foreground/90">{s.activitySignal}</p>
          </DetailBlock>
        )}

        {!s.demo && !s.synthetic && !s.outboundSelected && (
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

        <DetailBlock title={s.synthetic ? "Founders - full data & sub-scores (fictional people)" : "Founders - public records, not scored"}>
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

        {s.outboundSelected && (
          <DetailBlock title="Activate — outreach draft">
            <button
              onClick={() => {
                navigator.clipboard.writeText(outreachDraft).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                });
              }}
              className="h-8 rounded-md border border-border bg-surface px-3 text-[12px]"
            >
              {copied ? "✓ Copied — paste into your mail client" : "Copy outreach draft (cites the activity signal)"}
            </button>
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

        {s.sources && s.sources.length > 0 && (
          <DetailBlock title="Public sources">
            <div className="space-y-1.5">
              {s.sources.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block text-[12px] text-primary hover:underline">
                  {source.label}
                </a>
              ))}
            </div>
          </DetailBlock>
        )}

        <p className="mt-4 border-t border-border pt-3 text-[10.5px] leading-relaxed text-muted-foreground">
          {s.synthetic
            ? "Current application demo: generated with faker.js (seed 4242). Every person, score, email, and domain is fictional (.example TLD), so the full-consent scoring experience is safe to show."
            : s.demo
              ? "Fictional demo company — powers the live interview studio and founder psychogram."
              : s.outboundSelected
                ? "Outbound-selected real company. Public sources only; founders are intentionally not scored. LinkedIn links are search queries, not confirmed profiles."
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
            title={
              axes
                ? f.scoreRationale?.[SYNTHETIC_SCORE_KEYS[axis]] ?? undefined
                : "Not assessed — no fabricated scores for real people"
            }
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
      <ScoreWhy founder={f} axes={axes} />
    </div>
  );
}

/** Why the strongest and weakest axes score the way they do — the rationale is
 *  part of the synthetic full-consent tier; real people show nothing here. */
function ScoreWhy({ founder, axes }: { founder: FounderRef; axes: Record<string, number> | null }) {
  if (!axes || !founder.scoreRationale) return null;
  const ranked = FOUNDER_AXES.filter((a) => founder.scoreRationale![SYNTHETIC_SCORE_KEYS[a]]).sort((a, b) => axes[b] - axes[a]);
  if (ranked.length < 2) return null;
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const line = (axis: (typeof FOUNDER_AXES)[number], up: boolean) => (
    <div className="flex gap-1.5 text-[10.5px] leading-snug">
      <span className={up ? "text-positive" : "text-negative"}>{up ? "▲" : "▼"}</span>
      <span className="text-muted-foreground">
        <span className="text-foreground">{axis} {axes[axis]}</span> — {founder.scoreRationale![SYNTHETIC_SCORE_KEYS[axis]]}
      </span>
    </div>
  );
  return (
    <div className="mt-1.5 space-y-0.5 border-t border-border pt-1.5">
      {line(strongest, true)}
      {line(weakest, false)}
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
